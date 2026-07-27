# Contributing to Robot/Shift

Robot/Shift is a public learning product. Contributions must preserve teaching
order, numeric correctness, accessibility, user-data safety, and the callable
Tutor security boundary.

## Before you start

- Search existing issues before creating a new one.
- Open an issue before a large curriculum rewrite, schema change, new cloud
  dependency, or cross-cutting UI change.
- Keep changes narrow. Do not combine unrelated cleanup with the intended fix.
- Use original teaching synthesis and authoritative links. Do not copy books,
  transcripts, paid course material, images, or videos without compatible
  rights.
- Never include credentials, private learner data, Tutor conversations,
  production logs, or personal account screenshots.

## Local setup

```bash
git clone https://github.com/rjchakraborty/robot-shift.git
cd robot-shift
npm ci
npm --prefix functions ci
npm run dev
```

For isolated Auth, Firestore, and callable data work:

```bash
npm run emulators:start
```

In a second terminal:

```bash
npm run dev:emulators
```

The local emulator project is `demo-robotshift` and requires no production
credential.

## Quality gates

Run before opening a pull request:

```bash
npm run verify
npm run test:e2e
```

For an interactive change, also exercise the exact browser path, inspect
console errors and warnings, and verify the resulting state. Layout changes
need desktop and mobile evidence.

## Change expectations

- Curriculum: teach prerequisites before use and keep every day
  topic-specific.
- Maths and diagrams: make the numeric model the source of truth; add a fixture
  that proves units, frames, limits, and failure states.
- Persistence: preserve versioned import/export and legacy migration behavior;
  schema changes need migration and round-trip tests.
- Tutor: keep trusted context, provider credentials, replay protection, quotas,
  and canonical writes in callable Functions.
- UI: retain semantic headings, keyboard access, focus management, reduced
  motion, and light/dark contrast.

## Pull requests

Describe:

- the user-visible outcome;
- why the change is needed;
- the exact validation performed;
- any residual risk or blocked end-to-end path.

Build success alone is not acceptance proof for an interactive flow.
