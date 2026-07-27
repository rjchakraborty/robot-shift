#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

if [[ -x /opt/homebrew/opt/openjdk@21/bin/java ]]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21
fi

command -v java >/dev/null 2>&1 || {
  printf 'Robot/Shift emulators require Java 21 or newer.\n' >&2
  exit 1
}

java_major="$(
  java -version 2>&1 \
    | sed -n '1s/.*version "\([0-9][0-9]*\).*/\1/p'
)"
[[ "$java_major" =~ ^[0-9]+$ && "$java_major" -ge 21 ]] || {
  printf 'Robot/Shift emulators require Java 21 or newer; found %s.\n' \
    "${java_major:-unknown}" >&2
  exit 1
}

npm --prefix functions run build

env -i \
  PATH="$PATH" \
  TMPDIR="${TMPDIR:-/tmp}" \
  LANG="${LANG:-C.UTF-8}" \
  JAVA_HOME="${JAVA_HOME:-}" \
  npm_config_cache="${npm_config_cache:-$HOME/.npm}" \
  FIREBASE_EMULATORS_PATH="${FIREBASE_EMULATORS_PATH:-$HOME/.cache/firebase/emulators}" \
  GOOGLE_APPLICATION_CREDENTIALS=/nonexistent/robotshift-emulator-no-credentials.json \
  NO_COLOR=1 \
  CI=1 \
  npx --yes firebase-tools@15.24.0 emulators:start \
    --project demo-robotshift \
    --only auth,firestore,functions
