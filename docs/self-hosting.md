# Self-hosting Robot/Shift

The public curriculum runs locally without a cloud account. Self-hosting the
account, persistence, and Tutor surfaces requires a separately owned Firebase
and Google Cloud project.

## 1. Start locally

```bash
npm ci
npm --prefix functions ci
npm run dev
```

Use the isolated Firebase Emulator Suite before creating cloud resources:

```bash
npm run emulators:start
```

```bash
npm run dev:emulators
```

The emulator path is fixed to `demo-robotshift`, uses no production credential,
and keeps the real Robot/Shift project out of local testing.

## 2. Create your Firebase project

In a project you own:

1. register a Firebase Web app;
2. create Firestore and select an appropriate region;
3. enable Email/Password and, if required, Google Authentication;
4. create a reCAPTCHA Enterprise App Check site and register the web app;
5. move to Blaze before deploying Cloud Functions;
6. enable the APIs required by Firebase Functions, Secret Manager, App Check,
   Artifact Registry, Cloud Build, Cloud Run, and the Gemini provider.

Do not reuse the maintainer's project, OAuth brand, support address, cloud
identities, App Check registration, CI variables, or billing account.

## 3. Configure public browser identifiers

Copy `.env.example` to `.env.local` and set the public values from your Firebase
Web app:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=
```

These values identify the public web app. They are not server credentials.
Robot/Shift requires all core Firebase overrides together and rejects a partial
configuration to prevent a mixed-project deployment.

Never place a service-account JSON, Gemini key, OAuth client secret, App Check
debug token, Firebase ID token, refresh token, or password in `.env.local` or a
`NEXT_PUBLIC_*` variable.

## 4. Adapt the cloud configuration

Before deploying, replace the maintainer-specific values in:

- `.firebaserc`;
- `firebase.json` project region, OAuth brand, support address, and redirect
  URI;
- the project, region, app ID, and service-account checks in
  `scripts/firebase-release-*.sh`;
- repository OIDC variables and the registered CI App Check debug token.

Keep Auth, Firestore Rules/indexes, Functions, and Hosting coupled in one
verified release. Do not weaken the owner, active-dataset, App Check, replay,
quota, or server-only record boundaries to simplify setup.

## 5. Configure the Tutor secret

Create a dedicated Gemini authorization identity and an API key restricted to
the Gemini API. Store the key as `GEMINI_API_KEY` in Secret Manager and bind it
only to the callable Functions that require it.

Never print the value, store it in a browser variable, commit it, add it to a
fixture, expose it in a GitHub Actions log, or use a key that has previously
appeared in any of those places.

## 6. Verify before release

```bash
npm run verify
npm run test:e2e
```

Then verify the deployed build identity, Auth providers, App Check enforcement,
owner-scoped persistence, callable admission, quota denial, cross-user denial,
and one settled provider response. An HTTP 200, successful build, or admitted
callable request is not full end-to-end proof.
