#!/usr/bin/env bash
set -euo pipefail

robot_shift_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$robot_shift_root"

node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 13)) {
    console.error(`Robot/Shift requires Node >=22.13.0; found ${process.versions.node}`);
    process.exit(1);
  }
'

npm run lint
npm test
git diff --check

echo "Robot/Shift verification passed."
