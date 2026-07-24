# Robot/Shift

Robot/Shift is a private, practical 180-day robotics curriculum for a senior software engineer moving into robotics, ROS 2 integration, deployment, validation, and embodied AI.

The course is designed as a single reader-first learning system:

- zero-prerequisite mathematics with checked equations;
- deterministic SVG explanations and interactive maths;
- daily practical work and six portfolio projects;
- India-focused role and job-description guidance;
- an optional Gemini tutor grounded in the displayed lesson;
- browser-local notes, evidence, bookmarks, and tutor history;
- light and dark slate themes;
- private deployment through OpenAI Sites.

## Requirements

- Node.js `>=22.13.0`
- npm
- Optional: a Gemini API key for the tutor

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Leave `GEMINI_API_KEY` empty if the tutor is not needed. If used, keep it only in `.env.local`; never add it to client code or Git.

## Verification

```bash
npm run verify
```

This runs lint, the production build, all curriculum/content/visual/storage/theme/tutor tests, and whitespace validation.

For an interactive or visual change, also exercise the real browser flow, inspect console errors, and check desktop and mobile layouts.

## Architecture

| Area | Primary files |
|---|---|
| Curriculum sequence | `app/curriculum.ts` |
| Lesson resolution | `app/lessons.ts`, `app/topic-detail-*.ts` |
| Vector teaching visuals | `app/lesson-visual.tsx`, `app/lesson-visuals.ts` |
| Interactive maths | `app/interactive-math-playground.tsx`, `app/interactive-math.ts` |
| Lesson and tutor UI | `app/learning-studio.tsx`, `app/rich-text.tsx` |
| Gemini server route | `app/api/tutor/route.ts` |
| Local persistence | `app/storage-migrations.ts` |
| Career targeting | `app/career-market.ts`, `app/career-view.tsx` |
| Theme and shell | `app/page.tsx`, `app/globals.css`, `app/theme.ts` |
| Executable contracts | `tests/` |
| Sites identity | `.openai/hosting.json` |

Detailed development context lives in the project-local skill:

- `.codex/skills/robot-shift-development/SKILL.md`
- `.codex/skills/robot-shift-development/references/architecture.md`
- `.codex/skills/robot-shift-development/references/content-standards.md`
- `.codex/skills/robot-shift-development/references/qa-release.md`

Root-level agent constraints are in `AGENTS.md`.

## Tutor configuration

The browser sends a bounded request to `/api/tutor`. The server validates it, grounds the prompt in the resolved lesson, and calls Gemini with the server-only `GEMINI_API_KEY`.

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

Without a key, the course remains fully usable and the tutor returns a deliberate configuration message.

## Persistence

Progress-compatible legacy fields, notes, evidence, bookmarks, selected day, project records, and tutor chats are stored locally in the browser. Storage migrations intentionally archive incompatible version-1 foundation records before moving compatible work to version 2.

Do not rename storage keys or alter schemas without adding migration and round-trip tests.

## Private deployment

`.openai/hosting.json` contains the opaque Sites project identity. Use the Sites building and hosting workflows, package the exact committed source state, deploy a saved version, and verify the final deployment plus private access policy.

Do not publish or change access controls unless explicitly requested.
