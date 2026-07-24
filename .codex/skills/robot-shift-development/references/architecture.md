# Architecture and invariants

## Runtime

Robot/Shift is a Next.js static-export application hosted by Firebase Hosting.
Firebase Authentication owns learner identity, Cloud Firestore owns account and
course state, and callable Cloud Functions in `asia-south1` own privileged writes
and the Gemini provider call. Web App Check protects callable and Firestore
traffic. `.openai/hosting.json` identifies only the previous Sites origin needed
for legacy export; it is not a deployment target.

## Content pipeline

1. `app/curriculum.ts` defines each day, phase, practical task, evidence target, and resource.
2. `app/lessons.ts` resolves a complete lesson.
3. `app/topic-detail-overrides.ts` and `app/topic-details-*.ts` supply exact-topic depth.
4. `app/learning-studio.tsx` exposes Visual, Explain, Math, Examples, Practice, Check, optional memory aids, media, and tutor.

Every one of 180 days must resolve complete, topic-specific content. Adjacent days must not fall back to duplicated generic explanations, maths, examples, or quizzes.

## Visual and maths pipeline

- `app/lesson-visuals.ts` owns validated visual specifications.
- `app/lesson-visual.tsx` renders deterministic accessible SVG.
- `app/interactive-math.ts` owns calculations and verified fixtures.
- `app/interactive-math-playground.tsx` renders bounded controls and live results.
- `app/math-rescue.ts` provides the weekly zero-prerequisite foundation.
- `app/rich-text.tsx` renders trusted course Markdown and untrusted tutor Markdown with strict KaTeX.

The numeric model is the source of truth. A diagram must agree with known fixtures, units, frames, limits, and failure states.

## Tutor pipeline

`LearningStudio` submits a bounded day, mode, question, and replay-safe request ID
through `askCloudTutor()`. Callable Functions:

- require a verified Firebase identity and valid App Check token;
- recheck the Auth user through the Admin SDK;
- validate body size, shape, request identity, and replay hash;
- resolves the displayed day and lesson;
- builds a beginner-safe grounded instruction;
- read `GEMINI_API_KEY` only from Secret Manager;
- transactionally reserve per-user and global daily quota before the model call;
- enforce one in-flight request, timeout, output, and cost limits;
- parses provider output;
- atomically commit canonical tutor history and usage;
- return structured JSON.

The client treats the JSON payload as unknown and renders assistant output through `RichText`. Raw HTML is forbidden.

## Persistence

Firebase Auth identity plus `users/{uid}` and the active Firestore dataset are the
source of truth. `app/firestore-data.ts` owns callable and owner-data operations;
`app/data/course-data-context.tsx` owns account-scoped course state and
three-way merging; `app/storage-migrations.ts` owns:

- tracker schema version 2;
- tutor-store version 2;
- legacy version-1 archive keys;
- safe parsing and migration;
- import/export compatibility.

The browser never writes application course, profile, preference, or Tutor data
to cookies or local storage. Existing legacy keys are a read-only one-time bridge
on origins where they already exist; the old Sites origin requires explicit
export and Firebase import. Existing legacy fields may remain invisible but must
round-trip. Never relabel revised Days 1–14 records as if they belonged to the new
foundation.

Rules require a verified owner, active post-cutoff authentication, an unexpired
server-issued account-access lease, and the current dataset generation.
Entitlements, quota/budget records, tutor requests, migration archives,
destructive-operation ledgers, and global controls are server-only.

## UI

The product uses a quiet Notion-like shell and Medium-like reading flow:

- slate/black/white application chrome;
- one dominant reading column;
- whitespace and dividers instead of nested cards;
- compact lesson tabs and navigation;
- equations, interactive labs, safety warnings, and diagrams as semantic framed exceptions;
- progress gamification hidden from the primary experience.

## Tests

- `curriculum-content`: content completeness, dependency order, tutor grounding.
- `visual-content`: all 180 SVG specifications and physical meaning.
- `interactive-math`: fixtures, bounds, determinism, accessible controls.
- `rich-text`: safe Markdown and KaTeX.
- `storage-migrations`: versioned preservation and archive behavior.
- `cloud-persistence`: Firestore merge, access lease, import/reset, and ownership contracts.
- `firebase-auth`: signup, verification, password, profile, and action-link contracts.
- `tests/firebase`: isolated Auth, Firestore Rules, and callable Function emulator boundaries.
- `rendered-html`: production shell and shipped capabilities.
- `career-market`: dated evidence and honest role mapping.
- `theme`: light/dark contracts and semantic contrast.
