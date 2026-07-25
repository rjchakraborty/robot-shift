# QA and public release

## Local verification

Run from the repository root:

```bash
npm ci
npm run verify
```

`npm run verify` checks the Node version, lint, production build, all tests, and whitespace.

## Browser verification

Start the app:

```bash
npm run dev
```

Test the exact changed flow at `http://localhost:3000/`.

Minimum evidence:

- correct URL and page title;
- meaningful hydrated content, no framework overlay;
- no relevant console error or warning;
- one real interaction and verified resulting state;
- screenshot supporting visual claims;
- desktop and mobile checks for layout work.

For tutor work, distinguish:

- client/runtime success;
- structured API error handling;
- verified Auth/App Check/callable admission and Firestore persistence;
- actual Gemini response with a rotated Secret Manager key.

Do not claim provider end-to-end success when only the configuration error path was tested.

## Pre-release

1. Confirm `git status` and preserve unrelated work.
2. Run `npm run verify`.
3. Run browser QA against the exact source state.
4. Confirm the active Firebase CLI identity is an approved project member and the selected project is exactly `robotshift`; do not record a personal account address in repository configuration or documentation.
5. Confirm Blaze is explicitly approved, the Functions region is `asia-south1`, and the Firestore database/region are correct.
6. Revoke any previously exposed Gemini credential and configure a dedicated rotated `GEMINI_API_KEY` through Secret Manager without printing it.
7. Confirm Email/Password and Google providers, a verified public product support mailbox for the OAuth brand, password policy, email-enumeration protection, authorized domains, action URL, App Check enforcement, API-key restrictions, quota, and budget controls.
8. Commit and push that exact state when requested.

## Firebase release

Deploy all interdependent security surfaces from the same verified source state:

```bash
npm run release:firebase
```

This command uses the repository-pinned Firebase CLI version. Hosting's
predeploy gate reruns the complete verification suite and rebuilds `out/`
before Firebase uploads it.

Do not deploy Hosting alone: the shipped client depends on matching Auth policy,
Firestore Rules, indexes, callable Functions, App Check registration, and
server-side quota controls.

After deployment:

1. Confirm every deploy target reached a terminal success state.
2. Verify `https://robotshift.web.app` serves the exact local build identity.
3. Exercise signup, verification, login/logout, profile, password reset/change, account-scoped course persistence, and Tutor authorization.
4. Correlate callable response, Firestore user/request/usage records, Function logs, and Analytics signals.
5. Verify an unverified user, stale token, invalid App Check token, cross-user read, quota overflow, duplicate request, and global-budget admission all fail closed.
6. Keep the previous Sites deployment available only until required browser profiles have exported and imported their legacy data.

Never replace or delete the opaque Sites identity in `.openai/hosting.json`; it
remains the migration source, not the release target.

## Report

Report:

- changed files and user-visible outcome;
- commands and test counts;
- browser interaction performed;
- production deployment/version status when requested;
- remaining risks or missing credentials;
- access-control result.
