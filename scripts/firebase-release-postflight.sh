#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

firebase_project="robotshift"
firebase_region="asia-south1"
gcloud_configuration="${FIREBASE_GCLOUD_CONFIGURATION:-robotshift-release}"
release_mode="${FIREBASE_RELEASE_MODE:-local}"
production_url="https://robotshift.web.app"
gcloud_args=(--project="$firebase_project")
expected_functions=(
  askTutor
  bootstrapUserData
  clearTutorThread
  migrateLegacyData
  resetUserData
)

fail() {
  printf 'Firebase release postflight failed: %s\n' "$1" >&2
  exit 1
}

if [[ "$release_mode" != "ci" ]]; then
  gcloud_args=(--configuration="$gcloud_configuration")
fi

function_states="$(
  env -u CLOUDSDK_CORE_PROJECT CLOUDSDK_CORE_DISABLE_PROMPTS=1 gcloud \
    "${gcloud_args[@]}" \
    functions list \
    --v2 \
    --project="$firebase_project" \
    --regions="$firebase_region" \
    --format='value(name,state)' 2>/dev/null
)" || fail "deployed Functions state could not be read."

for function_name in "${expected_functions[@]}"; do
  grep -Eq "(^|/)${function_name}[[:space:]]+ACTIVE$" <<<"$function_states" \
    || fail "${function_name} is not ACTIVE in ${firebase_region}."
done

release_commit="$(git rev-parse HEAD)"
production_headers=""
for attempt in {1..12}; do
  production_headers="$(
    curl \
      --fail \
      --silent \
      --show-error \
      --location \
      --head \
      --header 'Cache-Control: no-cache' \
      "${production_url}/?release=${release_commit}&attempt=${attempt}"
  )" || production_headers=""

  if grep -Eqi '^content-security-policy-report-only:' <<<"$production_headers" \
    && grep -Eqi '^referrer-policy:[[:space:]]*no-referrer\r?$' <<<"$production_headers"; then
    break
  fi

  if [[ "$attempt" -lt 12 ]]; then
    sleep 5
  fi
done

grep -Eqi '^content-security-policy-report-only:' <<<"$production_headers" \
  || fail "production Hosting is not serving the verified security headers after 60 seconds."
grep -Eqi '^referrer-policy:[[:space:]]*no-referrer\r?$' <<<"$production_headers" \
  || fail "production Hosting is not serving the verified referrer policy after 60 seconds."

printf 'Firebase release postflight passed for %s at commit %s.\n' \
  "$firebase_project" "$(git rev-parse --short=12 HEAD)"
