#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

firebase_project="robotshift"
firebase_cli_version="15.24.0"
firebase_account="${FIREBASE_RELEASE_ACCOUNT:-}"
release_mode="${FIREBASE_RELEASE_MODE:-local}"
release_service_account="${FIREBASE_RELEASE_SERVICE_ACCOUNT:-}"
gcloud_configuration="${FIREBASE_GCLOUD_CONFIGURATION:-robotshift-release}"
gemini_service_account="robotshift-tutor-gemini@robotshift.iam.gserviceaccount.com"
firebase_args=(--project "$firebase_project")
gcloud_args=(--project="$firebase_project")

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

if [[ "$release_mode" == "ci" ]]; then
  [[ "${CI:-}" == "true" ]] \
    || fail "CI release mode is only valid inside the CI runner."
  [[ -n "${ROBOTSHIFT_VERIFIED_SHA:-}" ]] \
    || fail "ROBOTSHIFT_VERIFIED_SHA is missing."
  [[ "$(git rev-parse HEAD)" == "$ROBOTSHIFT_VERIFIED_SHA" ]] \
    || fail "HEAD does not match the commit verified by CI."
  [[ -n "$release_service_account" ]] \
    || fail "FIREBASE_RELEASE_SERVICE_ACCOUNT is missing."
  [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]] \
    || fail "Application Default Credentials are missing."
  [[ -s "$GOOGLE_APPLICATION_CREDENTIALS" ]] \
    || fail "the short-lived Application Default Credentials file is unavailable."

  configured_gcloud_account="$(
    gcloud auth list --filter='status:ACTIVE' --format='value(account)' 2>/dev/null
  )"
  [[ "$configured_gcloud_account" == "$release_service_account" ]] \
    || fail "the active CI identity is not the approved deploy service account."
else
  upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null)" \
    || fail "the current branch has no upstream; push it before deployment."

  read -r behind ahead < <(
    git rev-list --left-right --count "${upstream}...HEAD"
  )
  [[ "$behind" == "0" && "$ahead" == "0" ]] \
    || fail "HEAD is not synchronized with ${upstream} (behind ${behind}, ahead ${ahead})."

  [[ -n "$firebase_account" ]] \
    || fail "set FIREBASE_RELEASE_ACCOUNT to the approved Firebase project member."
  firebase_args+=(--account "$firebase_account")
  gcloud_args=(--configuration="$gcloud_configuration")

  firebase_accounts="$(
    npx --yes "firebase-tools@${firebase_cli_version}" login:list 2>&1
  )" || fail "Firebase CLI account lookup failed."
  grep -Fq "$firebase_account" <<<"$firebase_accounts" \
    || fail "Firebase CLI is not authenticated as FIREBASE_RELEASE_ACCOUNT."

  env -u CLOUDSDK_CORE_PROJECT gcloud config configurations describe \
    "$gcloud_configuration" >/dev/null 2>&1 \
    || fail "gcloud configuration ${gcloud_configuration} does not exist."

  configured_gcloud_account="$(
    env -u CLOUDSDK_CORE_PROJECT gcloud \
      "${gcloud_args[@]}" \
      config get-value account 2>/dev/null
  )"
  [[ "$configured_gcloud_account" == "$firebase_account" ]] \
    || fail "the release gcloud account does not match FIREBASE_RELEASE_ACCOUNT."

  active_gcloud_project="$(
    env -u CLOUDSDK_CORE_PROJECT gcloud \
      "${gcloud_args[@]}" \
      config get-value project 2>/dev/null
  )"
  [[ "$active_gcloud_project" == "$firebase_project" ]] \
    || fail "the release gcloud project is '${active_gcloud_project:-unset}', not ${firebase_project}."
fi

firebase_projects="$(
  npx --yes "firebase-tools@${firebase_cli_version}" projects:list \
    "${firebase_args[@]}" 2>&1
)" || fail "the approved release identity cannot list Firebase projects."
grep -Eq "(^|[^[:alnum:]-])${firebase_project}([^[:alnum:]-]|$)" <<<"$firebase_projects" \
  || fail "the approved release identity cannot access project ${firebase_project}."

if [[ "$release_mode" != "ci" ]]; then
  billing_enabled="$(
    env -u CLOUDSDK_CORE_PROJECT CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud \
      "${gcloud_args[@]}" \
      beta billing projects describe \
      "$firebase_project" \
      --format='value(billingEnabled)' 2>/dev/null
  )" || fail "billing state could not be read for ${firebase_project}."
  [[ "$billing_enabled" == "True" || "$billing_enabled" == "true" ]] \
    || fail "Blaze billing is not enabled for ${firebase_project}; Functions cannot deploy."
fi

enabled_services="$(
  env -u CLOUDSDK_CORE_PROJECT CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud \
    "${gcloud_args[@]}" \
    services list \
    --enabled \
    --project="$firebase_project" \
    --format='value(config.name)' 2>/dev/null
)" || fail "enabled Google Cloud services could not be read."
for required_service in \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  cloudfunctions.googleapis.com \
  eventarc.googleapis.com \
  firebaseextensions.googleapis.com \
  generativelanguage.googleapis.com \
  pubsub.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
do
  grep -Fxq "$required_service" <<<"$enabled_services" \
    || fail "required API ${required_service} is not enabled."
done

secret_name="$(
  env -u CLOUDSDK_CORE_PROJECT CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud \
    "${gcloud_args[@]}" \
    secrets describe GEMINI_API_KEY \
    --project="$firebase_project" \
    --format='value(name)' 2>/dev/null
)" || fail "Secret Manager does not contain GEMINI_API_KEY or access is denied."
[[ "$secret_name" == *"/secrets/GEMINI_API_KEY" ]] \
  || fail "GEMINI_API_KEY metadata did not resolve to the expected secret."

latest_secret_state="$(
  env -u CLOUDSDK_CORE_PROJECT CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud \
    "${gcloud_args[@]}" \
    secrets versions list GEMINI_API_KEY \
    --project="$firebase_project" \
    --sort-by='~createTime' \
    --limit=1 \
    --format='value(state)' 2>/dev/null
)" || fail "GEMINI_API_KEY version state could not be read."
[[ "$latest_secret_state" == "enabled" ]] \
  || fail "the newest GEMINI_API_KEY version is not enabled."

gemini_key_metadata="$(
  env -u CLOUDSDK_CORE_PROJECT CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud \
    "${gcloud_args[@]}" \
    services api-keys list \
    --project="$firebase_project" \
    --format='value(serviceAccountEmail,restrictions.apiTargets[].service)' 2>/dev/null
)" || fail "Gemini API key metadata could not be read."
grep -F "$gemini_service_account" <<<"$gemini_key_metadata" \
  | grep -Fq "generativelanguage.googleapis.com" \
  || fail "no Tutor service-account key is restricted to the Gemini API."

printf 'Firebase release preflight passed for %s at commit %s.\n' \
  "$firebase_project" "$(git rev-parse --short=12 HEAD)"
