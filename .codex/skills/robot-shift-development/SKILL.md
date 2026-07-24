---
name: robot-shift-development
description: Safely inspect, modify, test, and release the Robot/Shift private robotics curriculum. Use for curriculum sequencing, beginner teaching content, maths and KaTeX, deterministic SVG visuals, interactive exercises, Gemini tutor behavior, browser persistence and migrations, career targeting, reader-first UI, responsive QA, or private OpenAI Sites deployment in this repository.
---

# Robot/Shift Development

Treat the course as an integrated learning product. Preserve its teaching sequence, verified visuals, local data, tutor safety, and private deployment boundary.

## Start

1. Work from the repository root.
2. Read `AGENTS.md`.
3. Inspect `git status`, then read the affected source, tests, and runtime output.
4. Read [architecture.md](references/architecture.md) for source ownership and invariants.
5. For teaching or visual work, also read [content-standards.md](references/content-standards.md).
6. For validation or deployment, also read [qa-release.md](references/qa-release.md).

## Choose the change lane

- Curriculum or lesson: trace `curriculum.ts` through `lessonForDay()` and the relevant topic override.
- Visual or maths: trace the verified numeric fixture, visual specification, SVG renderer, and interactive model together.
- Tutor: trace `learning-studio.tsx` → `/api/tutor` → grounded prompt → provider response → `RichText`.
- Persistence: trace current and legacy keys, parser, migration, archive behavior, import/export, and tests before changing any shape.
- Reader UI: preserve the flat slate system, article hierarchy, compact navigation, and semantic exceptions.
- Career content: update only from dated, traceable job evidence and keep capability claims honest.
- Release: use the exact Sites identity in `.openai/hosting.json` and keep access private.

## Implement

- Make the narrowest complete change.
- Reuse existing types, resolvers, visual grammar, Markdown renderer, and storage helpers.
- Add or update the executable contract that would have caught the bug or omission.
- Keep secrets server-only and generated model output untrusted.
- Preserve dormant legacy progress fields unless an explicit versioned migration removes them.
- Do not copy protected source content into the private site merely because the site is private.

## Validate

Run:

```bash
npm run verify
```

For an interactive change, test the exact browser path at `http://localhost:3000/`, inspect errors/warnings, and verify the resulting UI state. Add mobile validation when layout or navigation changes.

Report separately:

- verified behavior;
- inference;
- blocked behavior and its exact missing dependency.

Do not treat a build, HTTP 200, screenshot, or provider request as end-to-end proof by itself.

## Release

Release only when explicitly requested. Follow [qa-release.md](references/qa-release.md), push the exact verified source state, save a Sites version, deploy that version, poll to a terminal result, and recheck the private access policy.
