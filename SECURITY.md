# Security policy

## Supported version

Security fixes are applied to the current `main` branch and the live
[Robot/Shift deployment](https://robotshift.web.app).

## Report a vulnerability

Use
[GitHub private vulnerability reporting](https://github.com/rjchakraborty/robot-shift/security/advisories/new).
Do not open a public issue for a suspected vulnerability.

Include:

- the affected URL, component, or commit;
- reproducible steps with secrets and personal data removed;
- the likely impact;
- a safe proof of concept, if available.

Do not send credentials, Firebase ID tokens, App Check tokens, service-account
files, Gemini keys, learner data, Tutor conversations, or unredacted production
logs. You will receive acknowledgement through the private advisory.

## Security boundary

Firebase web configuration is public project metadata, not authorization.
Protected operations require a verified Firebase identity, enforced App Check,
server-side validation, owner-scoped Firestore Rules, replay protection, and
private callable-Function writes. Gemini and deployment credentials remain
server-side.
