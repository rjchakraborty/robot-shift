#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

fail() {
  printf 'Firebase release verification failed: %s\n' "$1" >&2
  exit 1
}

if [[ "${FIREBASE_RELEASE_MODE:-local}" == "ci" ]]; then
  [[ "${CI:-}" == "true" ]] \
    || fail "CI release mode is only valid inside the CI runner."
  [[ -n "${ROBOTSHIFT_VERIFIED_SHA:-}" ]] \
    || fail "ROBOTSHIFT_VERIFIED_SHA is missing."
  [[ "$(git rev-parse HEAD)" == "$ROBOTSHIFT_VERIFIED_SHA" ]] \
    || fail "the deployment commit does not match the commit verified by CI."
  [[ -s out/index.html ]] \
    || fail "the verified static export is missing."
  printf 'Firebase CI verification gate passed for commit %s.\n' \
    "$(git rev-parse --short=12 HEAD)"
  exit 0
fi

npm run verify
npm run test:e2e
