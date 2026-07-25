#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

firebase_project="robotshift"
firebase_cli_version="15.24.0"
firebase_account="${FIREBASE_RELEASE_ACCOUNT:-}"

fail() {
  printf 'Firebase release preflight failed: %s\n' "$1" >&2
  exit 1
}

command -v git >/dev/null 2>&1 || fail "git is not installed."
command -v gcloud >/dev/null 2>&1 || fail "gcloud is not installed."

node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 13)) process.exit(1);
' || fail "Node >=22.13.0 is required."

[[ -z "$(git status --porcelain=v1)" ]] \
  || fail "the worktree is not clean; commit or remove release changes first."

git remote get-url origin >/dev/null 2>&1 \
  || fail "the Git remote 'origin' is not configured."

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null)" \
  || fail "the current branch has no upstream; push it before deployment."

read -r behind ahead < <(
  git rev-list --left-right --count "${upstream}...HEAD"
)
[[ "$behind" == "0" && "$ahead" == "0" ]] \
  || fail "HEAD is not synchronized with ${upstream} (behind ${behind}, ahead ${ahead})."

[[ -n "$firebase_account" ]] \
  || fail "set FIREBASE_RELEASE_ACCOUNT to the approved Firebase project member."

firebase_accounts="$(
  npx --yes "firebase-tools@${firebase_cli_version}" login:list 2>&1
)" || fail "Firebase CLI account lookup failed."
grep -Fq "$firebase_account" <<<"$firebase_accounts" \
  || fail "Firebase CLI is not authenticated as FIREBASE_RELEASE_ACCOUNT."

firebase_projects="$(
  npx --yes "firebase-tools@${firebase_cli_version}" projects:list \
    --account "$firebase_account" 2>&1
)" || fail "the approved Firebase account cannot list its projects."
grep -Eq "(^|[^[:alnum:]-])${firebase_project}([^[:alnum:]-]|$)" <<<"$firebase_projects" \
  || fail "the approved Firebase account cannot access project ${firebase_project}."

active_gcloud_account="$(
  gcloud auth list --filter=status:ACTIVE --format='value(account)'
)"
[[ "$active_gcloud_account" == "$firebase_account" ]] \
  || fail "the active gcloud account does not match FIREBASE_RELEASE_ACCOUNT."

active_gcloud_project="$(gcloud config get-value project 2>/dev/null)"
[[ "$active_gcloud_project" == "$firebase_project" ]] \
  || fail "the active gcloud project is '${active_gcloud_project:-unset}', not ${firebase_project}."

billing_enabled="$(
  CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud beta billing projects describe \
    "$firebase_project" \
    --format='value(billingEnabled)' 2>/dev/null
)" || fail "billing state could not be read for ${firebase_project}."
[[ "$billing_enabled" == "True" ]] \
  || fail "Blaze billing is not enabled for ${firebase_project}; Functions cannot deploy."

secret_name="$(
  CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud secrets describe GEMINI_API_KEY \
    --project="$firebase_project" \
    --format='value(name)' 2>/dev/null
)" || fail "Secret Manager does not contain GEMINI_API_KEY or access is denied."
[[ "$secret_name" == *"/secrets/GEMINI_API_KEY" ]] \
  || fail "GEMINI_API_KEY metadata did not resolve to the expected secret."

printf 'Firebase release preflight passed for %s at commit %s.\n' \
  "$firebase_project" "$(git rev-parse --short=12 HEAD)"
