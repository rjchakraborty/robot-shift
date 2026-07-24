# Robot/Shift launch measurement plan

The launch decision is whether real learners find the curriculum, return to it,
and use the Tutor successfully without breaching reliability or cost controls.
Firebase Analytics measures anonymous product usage; Cloud Firestore remains the
source of truth for authenticated course and Tutor records.

## Primary KPIs

| KPI | Definition | Source | Review cadence |
|---|---|---|---|
| Weekly active learners | Distinct Analytics users with at least one `lesson_view` in 7 days | Firebase Analytics | Weekly |
| Activated verified learners | Verified Firebase accounts with an active Firestore dataset and at least one course-state write | Firebase Auth + Firestore | Weekly |
| Tutor value rate | Successful `tutor_request` events divided by started requests, excluding user cancellation | Analytics, reconciled with Firestore daily usage | Daily during launch |

These metrics separate public discovery, durable course activation, and
AI-assisted learning. A page view alone is not treated as proof that a person
learned or retained value.

## Drivers

- Signup conversion: `sign_up` divided by users who viewed a lesson.
- Returning learner rate: weekly active users who were also active in a prior
  week.
- Tutor adoption: verified active learners with at least one server-admitted
  Tutor request.
- Lesson depth: distinct lesson days viewed per weekly active learner.

## Guardrails

- Tutor failure rate by bounded `failure_code` and `latency_bucket`.
- Client exception count and affected-user rate from sanitized `exception`
  events.
- Per-user daily attempts, successes, reserved nano-USD, and actual nano-USD
  from `users/{uid}/tutorUsageDaily/{day}`.
- Shared reserved plus actual nano-USD against the `$0.80` admission ceiling
  and `$1.00` circuit breaker in `tutorGlobalDaily/{day}`.

## Event privacy contract

The browser emits only bounded categorical or numeric parameters:

- `lesson_view`: day, week, phase, and entry surface
- `sign_up` / `login`: provider method only
- `tutor_request`: day, mode, status, latency bucket, and failure category
- `exception`: bounded surface, error class, and fatal flag

Do not send email, UID, display name, note/evidence text, question, Tutor answer,
query string, URL hash, raw stack, or Firebase document path to Analytics.
Analytics storage and all advertising consent are denied before SDK
initialization, automatic page views are disabled, and event page locations are
reduced to origin plus pathname. Performance Monitoring is off by default and
its SDK is not initialized until a verified learner explicitly enables the
Firestore-backed preference. Revocation disables further automatic and custom
collection in the current session. The one-time `/auth/action` route never
starts Analytics or Performance Monitoring. Observability runs only on the
exact `https://robotshift.web.app` production origin, so local QA does not
contaminate launch metrics. Analytics failure must never block authentication,
curriculum use, or Tutor settlement.

Before setting numeric adoption targets, collect at least four complete launch
weeks. With no production baseline, any firm retention or conversion target
would be invented; the Tutor cost and daily-attempt thresholds are operational
guardrails, not adoption targets.
