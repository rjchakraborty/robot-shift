# Robot/Shift

Robot/Shift is a practical 180-day robotics curriculum for programmers, developers, and technical learners moving into robotics, ROS 2 integration, deployment, validation, and embodied AI. It does not assume a particular résumé, employer, degree, technology stack, or experience duration.

The course is designed as a single reader-first learning system:

- zero-prerequisite mathematics with checked equations;
- deterministic SVG explanations and interactive maths;
- daily practical work and six portfolio projects;
- evidence-led role guidance, a local job-description matcher, and a clearly dated India market example;
- an optional Gemini tutor grounded in the displayed lesson;
- Firebase email/password and Google account access for the tutor;
- Cloud Firestore notes, evidence, bookmarks, preferences, and tutor history;
- light and dark slate themes;
- static deployment through Firebase Hosting.

## Requirements

- Node.js `>=22.13.0`
- npm
- Firebase CLI for deployment

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The curriculum works locally without credentials. The isolated Auth, Firestore,
and Functions emulators support the complete authenticated data flow when the
app starts with `NEXT_PUBLIC_FIREBASE_EMULATORS=true`; the local App Check
provider is enabled only for that explicit localhost emulator mode. Production
always uses reCAPTCHA Enterprise App Check. Never add an App Check debug token,
password, OAuth token, or Google service-account credential to Git.

Firebase Authentication uses tab-scoped session persistence. Closing the browser
session signs the account out; course, profile, preference, and Tutor records are
never persisted as application data in browser storage.

## Verification

```bash
npm run verify
```

This runs lint, the production build, curriculum/content/visual/storage/theme
tests, Functions contracts, isolated Firebase Auth/Firestore/Functions emulator
tests, and whitespace validation.

For an interactive or visual change, also exercise the real browser flow, inspect console errors, and check desktop and mobile layouts.

## Architecture

| Area | Primary files |
|---|---|
| Curriculum sequence | `app/curriculum.ts` |
| Lesson resolution | `app/lessons.ts`, `app/topic-detail-*.ts` |
| Vector teaching visuals | `app/lesson-visual.tsx`, `app/lesson-visuals.ts` |
| Interactive maths | `app/interactive-math-playground.tsx`, `app/interactive-math.ts` |
| Lesson and tutor UI | `app/learning-studio.tsx`, `app/rich-text.tsx` |
| Callable Tutor client | `app/firestore-data.ts`, `app/learning-studio.tsx` |
| Tutor context, provider, and quota | `functions/src/tutor-context.ts`, `functions/src/tutor-provider.ts`, `functions/src/tutor-quota.ts` |
| Authentication and profile | `app/auth/`, `app/firebase-client.ts` |
| Analytics and performance | `app/firebase-observability.ts`, `app/error.tsx`, `app/global-error.tsx` |
| Analytics KPI and privacy contract | `docs/analytics-measurement-plan.md` |
| Search pages and metadata | `app/seo.ts`, `app/lessons/[slug]/page.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| Firestore data and legacy migration | `app/data/course-data-context.tsx`, `app/firestore-data.ts`, `app/storage-migrations.ts` |
| Career targeting | `app/career-market.ts`, `app/career-view.tsx` |
| Theme and shell | `app/page.tsx`, `app/globals.css`, `app/theme.ts` |
| Executable contracts | `tests/` |
| Firebase deployment | `firebase.json`, `.firebaserc`, `firestore.rules` |
| Firebase data and security contract | `docs/firebase-data-architecture.md` |
| Previous Sites identity | `.openai/hosting.json` |

Detailed development context lives in the project-local skill:

- `.codex/skills/robot-shift-development/SKILL.md`
- `.codex/skills/robot-shift-development/references/architecture.md`
- `.codex/skills/robot-shift-development/references/content-standards.md`
- `.codex/skills/robot-shift-development/references/qa-release.md`

Root-level agent constraints are in `AGENTS.md`.

## Tutor and observability

The browser sends only a bounded day ID, teaching mode, question, and replay-safe
request ID through the `askCloudTutor` callable client. The Cloud Function builds
the trusted lesson context, then calls Gemini from the server. The browser ships
neither a Gemini credential nor a direct model-provider SDK path.

Every secure callable requires a current Firebase Authentication account with a
verified email plus the registered App Check app identity. The default server
policy allows 10 attempts per account per day and one in-flight request. An atomic
Firestore transaction reserves estimated cost before the model call, stops new
admission at the shared $0.80 daily authorization ceiling, and trips the
no-more-requests circuit breaker if settled usage breaches the $1.00 absolute
daily limit. Request IDs and input hashes make retries replay-aware. These limits
are server-owned; changing browser code cannot raise them.

Google Analytics records bounded lesson/tutor/error signals. Firebase
Performance Monitoring records web-vitals/network performance only after a
verified learner explicitly enables the Firestore-backed preference. Firebase
Crashlytics does not provide a Web SDK, so sanitized Analytics `exception`
events and the React error boundaries provide the basic browser failure signal.
Never send learner notes, evidence, prompts, tutor answers, URLs, or raw stacks
to telemetry.

## Persistence

For a verified account, notes, evidence, bookmarks, selected day, project
records, tutor chats, and theme use the account's active Cloud Firestore dataset.
Versioned complete backups carry the active course, Tutor, and preference state.

Do not rename storage keys or alter schemas without adding migration and round-trip tests.

Legacy browser keys remain a read-only, one-time bridge only when they exist on
the current origin. Browsers correctly prevent `robotshift.web.app` from reading
storage owned by the previous ChatGPT Sites origin, so that data must be exported
on the old site and imported here. New runtime state is never written to browser
storage, and a consumed legacy key is removed only after the server confirms the
matching Firestore migration.

Firestore rules limit client access to the verified owner and current active
dataset, with field and size validation. Tutor transcripts, quota accounting,
entitlements, global budget state, migration archives, dataset pointers, and
replay records are written only by callable Functions through the Admin SDK.

## Firebase deployment

```bash
npm run verify
export FIREBASE_RELEASE_ACCOUNT="<approved-project-member>"
npm run release:firebase
```

The release script pins Firebase CLI `15.24.0`, targets only `robotshift`, and
deploys Auth, Firestore Rules/indexes, Functions, and Hosting together. Hosting's
predeploy gate reruns `npm run verify`, rebuilding `out/` before upload rather
than trusting an older ignored export.

The preflight fails before deployment unless the worktree is clean, the current
commit is synchronized with its upstream branch, Firebase CLI and gcloud use the
same explicitly approved project member, gcloud targets exactly `robotshift`,
Blaze billing is enabled, and Secret Manager contains `GEMINI_API_KEY`. The
account is supplied through the shell and is never stored in repository
configuration.

The Firebase production target is
[https://robotshift.web.app](https://robotshift.web.app). A successful HTTP
response is not proof that it contains this repository state; verify the deployed
build identity and callable Functions after every release. Keep the previous
Sites deployment available until every required browser profile has exported
there and imported its complete backup on Firebase.

Functions deployment requires the Blaze plan and a dedicated, rotated
`GEMINI_API_KEY` stored through Firebase Secret Manager. Never reuse a key that
has appeared in a terminal, log, browser capture, or source file.
