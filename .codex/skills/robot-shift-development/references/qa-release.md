# QA and private release

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
- actual Gemini response with a configured key.

Do not claim provider end-to-end success when only the configuration error path was tested.

## Pre-release

1. Confirm `git status` and preserve unrelated work.
2. Run `npm run verify`.
3. Run browser QA against the exact source state.
4. Commit and push that exact state when requested.
5. Read `.openai/hosting.json`; copy the `project_id` exactly.

## Sites release

Use the installed Sites building and hosting skills. Do not hand-roll a deployment archive when the bundled packaging helper is available.

1. Package the exact pushed commit.
2. Save a new Sites version with that commit identity.
3. Deploy only the saved version.
4. Poll pending or publishing states to a terminal status.
5. Verify the production URL responds through the authenticated Sites path.
6. Verify access remains owner-only/custom as intended.

Never create a second Sites project for this local repository when `.openai/hosting.json` already contains the project identity.

## Report

Report:

- changed files and user-visible outcome;
- commands and test counts;
- browser interaction performed;
- production deployment/version status when requested;
- remaining risks or missing credentials;
- access-control result.
