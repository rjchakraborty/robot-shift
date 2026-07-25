# CI/CD and cost control

## Required pipeline

`.github/workflows/firebase-release.yml` is the production path.

- Pull requests run complete repository verification plus real Chrome
  desktop/mobile flows. They receive no Google credential.
- Pushes to `main` run the same gate, then deploy only the verified commit.
- Deployment uses GitHub OIDC and Google Workload Identity Federation. Never
  add a Firebase token or service-account JSON secret.
- Auth, Firestore rules/indexes, Functions, and Hosting deploy together through
  `npm run release:firebase`.
- The release gate checks that `ROBOTSHIFT_VERIFIED_SHA` exactly matches `HEAD`.
- Live browser E2E runs after Firebase CLI and cloud postflight checks succeed.

Do not add a workflow that can deploy Hosting or Functions without the
verification dependency.

## Cost boundaries

- Keep Functions `minInstances` at zero and preserve bounded `maxInstances`.
- Keep the Tutor key in Secret Manager and use the cheapest policy-approved
  model behind server-side per-user and global daily reservations.
- Blaze is required for the callable Tutor boundary. Do not disable billing
  while Tutor is enabled; disable the Tutor policy first if emergency spend
  control is required.
- Keep Artifact Registry cleanup at seven days.
- Use one Linux CI worker, cancel superseded runs, cache emulator binaries, and
  upload artifacts only on failure with short retention.
- Firebase budget alerts are monitoring, not a hard spending cap. The Tutor
  transaction is the fail-closed model-spend breaker.

## Cloud identity

Repository variables are public identifiers, not credentials:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_DEPLOY_SERVICE_ACCOUNT`

The Workload Identity provider must restrict tokens to
`rjchakraborty/robot-shift`. The service account receives only deployment roles
needed by Firebase CLI and can impersonate only project runtime service
accounts required by Cloud Functions.
