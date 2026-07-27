import assert from "node:assert/strict";
import test from "node:test";
import {
  FirebaseClientConfigurationError,
  resolveFirebaseBrowserConfiguration,
} from "../app/firebase-client";

test("default browser configuration preserves the public Robot/Shift app", () => {
  const configuration = resolveFirebaseBrowserConfiguration({});

  assert.equal(configuration.options.projectId, "robotshift");
  assert.equal(configuration.options.authDomain, "robotshift.web.app");
  assert.ok(configuration.options.apiKey);
  assert.ok(configuration.options.appId);
  assert.ok(configuration.recaptchaEnterpriseSiteKey);
});

test("a fork can replace every public Firebase identifier", () => {
  const configuration = resolveFirebaseBrowserConfiguration({
    NEXT_PUBLIC_FIREBASE_API_KEY: "fork-public-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "fork.example.test",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fork-project",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "fork-project.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:fork",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-FORK",
    NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY: "fork-public-site-key",
  });

  assert.deepEqual(configuration, {
    options: {
      apiKey: "fork-public-api-key",
      authDomain: "fork.example.test",
      projectId: "fork-project",
      storageBucket: "fork-project.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:fork",
      measurementId: "G-FORK",
    },
    recaptchaEnterpriseSiteKey: "fork-public-site-key",
  });
});

test("partial fork configuration fails before mixing Firebase projects", () => {
  assert.throws(
    () => resolveFirebaseBrowserConfiguration({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fork-project",
    }),
    (error: unknown) => (
      error instanceof FirebaseClientConfigurationError
      && error.message.includes("NEXT_PUBLIC_FIREBASE_API_KEY")
      && error.message.includes("NEXT_PUBLIC_FIREBASE_APP_ID")
      && error.message.includes("NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY")
    ),
  );
});
