# Architecture and invariants

## Runtime

Robot/Shift is a Vinext/React application with a server route for the Gemini tutor. OpenAI Sites uses the opaque project identity in `.openai/hosting.json`. No D1 or R2 binding is currently required.

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

`LearningStudio` submits bounded day, mode, message, and history data to `app/api/tutor/route.ts`. The route:

- validates body size and shape;
- resolves the displayed day and lesson;
- builds a beginner-safe grounded instruction;
- reads `GEMINI_API_KEY` only on the server;
- enforces rate and timeout limits;
- parses provider output;
- returns structured JSON.

The client treats the JSON payload as unknown and renders assistant output through `RichText`. Raw HTML is forbidden.

## Persistence

`app/storage-migrations.ts` owns:

- tracker schema version 2;
- tutor-store version 2;
- legacy version-1 archive keys;
- safe parsing and migration;
- import/export compatibility.

Existing legacy fields may remain invisible but must round-trip. Never relabel revised Days 1–14 records as if they belonged to the new foundation.

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
- `rendered-html`: production shell and shipped capabilities.
- `career-market`: dated evidence and honest role mapping.
- `theme`: light/dark contracts and semantic contrast.
