# Robot/Shift Agent Rules

## Product

Robot/Shift is RJ's private, reader-first 180-day robotics curriculum. It teaches a senior software engineer practical robotics, ROS 2 integration, validation, deployment, and embodied-AI foundations without assuming prior mathematics or a robotics degree.

## Source of truth

- `app/curriculum.ts`: 180-day sequence, projects, phases, and primary resources.
- `app/lessons.ts` and `app/topic-detail-*.ts`: resolved teaching content.
- `app/lesson-visuals.ts` and `app/interactive-math.ts`: deterministic vector and maths models.
- `app/learning-studio.tsx`: lesson navigation and tutor interface.
- `app/api/tutor/route.ts`: server-only Gemini integration.
- `app/storage-migrations.ts`: browser persistence contracts and migrations.
- `app/career-market.ts` and `app/career-view.tsx`: India job evidence and role guidance.
- `tests/`: executable curriculum, visual, storage, tutor, theme, and rendering contracts.

Read `.codex/skills/robot-shift-development/SKILL.md` for any curriculum, tutor, visual, storage, UI, QA, or release task.

## Non-negotiable rules

- Preserve unrelated changes and inspect `git status` before editing.
- Keep the interface reader-first: slate/black/white chrome, strong typography, few cards, no prominent XP, rank, streak, badge, or progress dashboard.
- Teach prerequisite concepts before using them. Explain mathematics for a learner with no vectors, matrices, algebra, trigonometry, or coordinate-frame knowledge.
- Prefer deterministic SVG/vector diagrams and computed visual models. Never accept a visual because it merely looks plausible.
- Keep ordinary prose unboxed. Reserve framed surfaces for equations, interactive labs, safety warnings, and meaningful diagrams.
- Preserve local-storage keys, schema versions, archived legacy payloads, notes, evidence, bookmarks, tutor history, and import/export compatibility. Schema changes require migration tests.
- Keep `GEMINI_API_KEY` server-only. Never expose secrets in client code, logs, screenshots, fixtures, commits, or generated artifacts.
- Treat generated tutor output as untrusted Markdown. Preserve sanitised React Markdown and strict KaTeX rendering; never render raw model HTML.
- Keep teaching synthesis original. Link to authoritative sources; do not copy book chapters, transcripts, images, or videos into the repository without explicit compatible rights.
- Preserve keyboard access, semantic headings, ARIA tabs/panels, focus management, reduced motion, and light/dark contrast.
- Do not claim a fix from build success alone when the flow is interactive. Use the browser and exercise the affected path.
- Deployment is private and explicit. Reuse the opaque Sites project ID from `.openai/hosting.json`; never invent or replace it. Verify access policy after deployment.

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
