# Robot/Shift

[![Firebase CI and release](https://github.com/rjchakraborty/robot-shift/actions/workflows/firebase-release.yml/badge.svg?branch=main)](https://github.com/rjchakraborty/robot-shift/actions/workflows/firebase-release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f172a.svg)](LICENSE)
[![Node.js 22](https://img.shields.io/badge/Node.js-22-0f172a.svg)](package.json)

**A public, reader-first 180-day robotics field manual with deterministic
visuals, interactive maths, portfolio projects, cloud progress, and a
security-bounded AI tutor.**

[Open the live course](https://robotshift.web.app) ·
[Browse the curriculum](app/curriculum.ts) ·
[Read the architecture](docs/firebase-data-architecture.md) ·
[Contribute](CONTRIBUTING.md)

Robot/Shift helps programmers and technical learners move into practical
robotics, ROS 2 integration, validation, deployment, and embodied AI. It does
not assume a particular degree, employer, résumé, technology stack, experience
duration, or mathematics background.

## What makes it useful

- 180 concrete days with prerequisite-aware lessons and practical evidence;
- book-style chapter and day navigation across desktop and mobile;
- zero-prerequisite mathematics with checked equations and bounded controls;
- deterministic, accessible SVG diagrams backed by verified numeric models;
- six portfolio projects and country-neutral role-family guidance;
- Firebase Authentication and owner-scoped Firestore course persistence;
- a grounded Gemini tutor behind Auth, App Check, replay protection, quotas,
  one-in-flight enforcement, and a shared server-side cost reservation;
- versioned import, export, migration, reset, and legacy-data preservation;
- production CI covering lint, static export, tests, Firebase emulators, and
  real Chrome desktop/mobile flows.

## Technical architecture

| Surface | Implementation |
|---|---|
| Web application | Next.js 16, React 19, TypeScript, static export |
| Curriculum | `app/curriculum.ts`, `app/lessons.ts`, `app/topic-detail-*.ts` |
| Teaching visuals | Deterministic SVG plus verified interactive maths |
| Identity and data | Firebase Auth, Firestore Rules, callable Functions |
| Tutor | Server-grounded Gemini request with private quota and cost ledgers |
| Rendering safety | Sanitised React Markdown and strict KaTeX; no raw model HTML |
| Delivery | Firebase Hosting and GitHub Actions with short-lived OIDC |
| Validation | Node test runner, Firebase Emulator Suite, Playwright on Chrome |

The browser never contains a Gemini key, service-account credential, App Check
debug token, or deployment credential. Firebase web configuration and the
reCAPTCHA Enterprise site key are public app identifiers; authorization remains
server-side.

## Quick start

### Prerequisites

- Node.js `>=22.13.0`
- npm

### Run the public curriculum

```bash
git clone https://github.com/rjchakraborty/robot-shift.git
cd robot-shift
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

This mode needs no credential. It is sufficient for the complete public
curriculum, lessons, diagrams, maths, navigation, themes, and local browser QA.
Do not add a Gemini key, service-account JSON, OAuth token, App Check debug
token, or password to this repository or any `NEXT_PUBLIC_*` variable.

### Run the isolated Firebase stack

Install Java 21 and the Functions dependencies, then use two terminals:

```bash
npm --prefix functions ci
npm run emulators:start
```

```bash
npm run dev:emulators
```

The emulator mode uses the local-only `demo-robotshift` project and never needs
production credentials. It supports email/password Auth, Firestore, and
callable data flows. Google OAuth and a real Gemini response require your own
configured Firebase/Gemini project; the Tutor fails closed when its server-only
provider secret is absent.

## Configure a fork

Copy the public configuration contract:

```bash
cp .env.example .env.local
```

For ordinary local curriculum work, leave the optional Firebase fields empty.
For a separately owned Firebase project, fill every required
`NEXT_PUBLIC_FIREBASE_*` field and the public reCAPTCHA Enterprise site key.
Partial overrides are rejected so a fork cannot accidentally mix two Firebase
projects.

The maintainer release scripts are deliberately pinned to the production
`robotshift` project. Follow [Self-hosting](docs/self-hosting.md) before adapting
them to another project. Never copy the maintainer's cloud identifiers,
credentials, secrets, billing setup, or CI token.

## Verification

```bash
npm ci
npm --prefix functions ci
npm run verify
npm run test:e2e
```

`npm run verify` checks the Node version, lint, production build, curriculum and
visual contracts, persistence and migration behavior, Functions tests,
isolated Auth/Firestore/Functions emulator boundaries, and whitespace.
`npm run test:e2e` exercises the exported application in real Chrome at desktop
and mobile sizes.

## Project map

| Area | Primary files |
|---|---|
| Curriculum sequence | `app/curriculum.ts` |
| Lesson resolution | `app/lessons.ts`, `app/topic-detail-*.ts` |
| Vector teaching visuals | `app/lesson-visual.tsx`, `app/lesson-visuals.ts` |
| Interactive maths | `app/interactive-math-playground.tsx`, `app/interactive-math.ts` |
| Lesson and tutor UI | `app/learning-studio.tsx`, `app/rich-text.tsx` |
| Authentication and profile | `app/auth/`, `app/firebase-client.ts` |
| Firestore data and migration | `app/data/`, `app/firestore-data.ts`, `app/storage-migrations.ts` |
| Tutor provider and quota | `functions/src/tutor-*.ts` |
| Firestore security | `firestore.rules`, `firestore.indexes.json` |
| Executable contracts | `tests/`, `functions/test/` |
| Release boundary | `.github/workflows/firebase-release.yml`, `scripts/firebase-release-*.sh` |

## Security and privacy

- Report vulnerabilities privately through
  [GitHub Security Advisories](https://github.com/rjchakraborty/robot-shift/security/advisories/new).
- Do not include credentials, private user data, Tutor prompts/answers, learner
  notes, raw logs, or production screenshots in an issue or pull request.
- Generated tutor content is untrusted Markdown and is never rendered as raw
  HTML.
- Firestore client access is limited to the verified owner and active dataset;
  quota, entitlement, replay, migration archive, and budget records are
  server-owned.

See [SECURITY.md](SECURITY.md) for the disclosure policy and
[docs/firebase-data-architecture.md](docs/firebase-data-architecture.md) for
the complete trust boundary.

## Contributing

Contributions that improve correctness, accessibility, beginner explanations,
verified diagrams, practical projects, and local setup are welcome. Read
[CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Robot/Shift is available under the [MIT License](LICENSE).
