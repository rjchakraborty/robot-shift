# Robot/Shift Agent Rules

## Product

Robot/Shift is RJ's private, reader-first 180-day robotics curriculum. It teaches a senior software engineer practical robotics, ROS 2 integration, validation, deployment, and embodied-AI foundations without assuming prior mathematics or a robotics degree.

## Source of truth

- `app/curriculum.ts`: 180-day sequence, projects, phases, and primary resources.
- `app/lessons.ts` and `app/topic-detail-*.ts`: resolved teaching content.
- `app/lesson-visuals.ts` and `app/interactive-math.ts`: deterministic vector and maths models.
- `app/learning-studio.tsx`: lesson navigation and tutor interface.
- `app/firestore-data.ts` and `app/data/`: callable Functions, active Firestore dataset, and cloud persistence.
- `functions/src/`: verified callable security, trusted Tutor context, Gemini provider, quota, and migration logic.
- `app/firebase-client.ts`: Firebase client SDK and App Check integration.
- `app/auth/`: Firebase Authentication, email actions, profile management, and tutor access state.
- `app/firebase-observability.ts`: bounded Analytics and Performance Monitoring.
- `app/storage-migrations.ts`: legacy browser schema parsing and one-time Firestore migration compatibility.
- `app/career-market.ts` and `app/career-view.tsx`: India job evidence and role guidance.
- `tests/`: executable curriculum, visual, storage, tutor, theme, and rendering contracts.

Read `.codex/skills/robot-shift-development/SKILL.md` for any curriculum, tutor, visual, storage, UI, QA, or release task.

## Non-negotiable rules

- Preserve unrelated changes and inspect `git status` before editing.
- Keep the interface reader-first: slate/black/white chrome, strong typography, few cards, no prominent XP, rank, streak, badge, or progress dashboard.
- Teach prerequisite concepts before using them. Explain mathematics for a learner with no vectors, matrices, algebra, trigonometry, or coordinate-frame knowledge.
- Prefer deterministic SVG/vector diagrams and computed visual models. Never accept a visual because it merely looks plausible.
- Keep ordinary prose unboxed. Reserve framed surfaces for equations, interactive labs, safety warnings, and meaningful diagrams.
- Preserve legacy local-storage keys, schema versions, archived payloads, notes, evidence, bookmarks, tutor history, and import/export compatibility. New runtime state belongs in Firestore; do not reintroduce browser storage as its source of truth. Schema changes require migration tests.
- Keep Gemini/provider credentials, service-account credentials, and App Check debug tokens out of client code, logs, screenshots, fixtures, commits, and generated artifacts. Firebase web configuration and the production reCAPTCHA site key are public app identifiers.
- Keep the browser Tutor path behind `askCloudTutor`. Verified Auth, App Check, replay protection, per-user quota, one-in-flight enforcement, and global cost reservation belong in callable Functions, never client checks.
- Treat generated tutor output as untrusted Markdown. Preserve sanitised React Markdown and strict KaTeX rendering; never render raw model HTML.
- Keep teaching synthesis original. Link to authoritative sources; do not copy book chapters, transcripts, images, or videos into the repository without explicit compatible rights.
- Preserve keyboard access, semantic headings, ARIA tabs/panels, focus management, reduced motion, and light/dark contrast.
- Do not claim a fix from build success alone when the flow is interactive. Use the browser and exercise the affected path.
- Firebase deployment is explicit. Use project `robotshift`; verify Authentication providers, App Check enforcement, owner-scoped active-dataset Firestore rules, client-denied server-owned Tutor/quota/migration records, indexes, and Functions; deploy only the verified static `out/` build. Preserve the opaque Sites project ID in `.openai/hosting.json` until browser-local data transfer is complete.

## Required validation

Run:

```bash
npm run verify
```

For rendered changes, also test the exact flow at `http://localhost:3000/`, inspect console errors, and capture desktop plus mobile evidence when layout is affected.

## Git and generated files

- Do not commit `node_modules/`, `dist/`, `.next/`, `.vinext/`, `.wrangler/`, `outputs/`, `work/`, local environment files, or browser test artifacts.
- Keep commits narrowly scoped and describe the verified user outcome.
- Do not publish, push, or change private-site access unless the user explicitly requests it.
