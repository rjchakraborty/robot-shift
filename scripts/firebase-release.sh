#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

firebase_cli_version="15.24.0"
firebase_project="robotshift"
firebase_account="${FIREBASE_RELEASE_ACCOUNT:-}"
firebase_args=(--project "$firebase_project")

if [[ "${FIREBASE_RELEASE_MODE:-local}" != "ci" ]]; then
  [[ -n "$firebase_account" ]] || {
    printf 'Firebase release failed: set FIREBASE_RELEASE_ACCOUNT.\n' >&2
    exit 1
  }
  firebase_args+=(--account "$firebase_account")
fi

npm run release:preflight

npx --yes "firebase-tools@${firebase_cli_version}" \
  functions:artifacts:setpolicy \
  --location asia-south1 \
  --days 7 \
  --force \
  "${firebase_args[@]}"

npx --yes "firebase-tools@${firebase_cli_version}" \
  deploy \
  --non-interactive \
  --only auth,firestore:rules,firestore:indexes,functions,hosting \
  "${firebase_args[@]}"

npm run release:postflight
