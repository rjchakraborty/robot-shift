import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  AuthValidationError,
  firebaseAuthErrorMessage,
  normalizeEmail,
  parseAuthAction,
  passwordRequirements,
  safeContinueUrl,
  validateDisplayName,
  validateEmail,
  validatePasswordLocally,
} from "../app/auth/auth-core";

test("normalizes bounded account identity fields", () => {
  assert.equal(normalizeEmail("  Reader@Example.COM "), "reader@example.com");
  assert.equal(validateEmail("Reader@example.com"), "reader@example.com");
  assert.equal(validateDisplayName("  Ada   Lovelace  "), "Ada Lovelace");
  assert.throws(() => validateEmail("reader@example"), AuthValidationError);
  assert.throws(() => validateDisplayName("x"), AuthValidationError);
  assert.throws(
    () => validateDisplayName("x".repeat(61)),
    AuthValidationError,
  );
});

test("requires a strong password before Firebase receives it", () => {
  assert.deepEqual(passwordRequirements("short"), [
    "at least 12 characters",
    "an uppercase letter",
    "a number",
    "a symbol",
  ]);
  assert.equal(validatePasswordLocally("RobotShift!42"), "RobotShift!42");
  assert.throws(
    () => validatePasswordLocally("robotshiftpassword"),
    /uppercase letter, a number, and a symbol/,
  );
});

test("parses only supported Firebase one-time email actions", () => {
  assert.deepEqual(
    parseAuthAction(
      "?mode=resetPassword&oobCode=abc123&continueUrl=https%3A%2F%2Frobotshift.web.app%2F",
    ),
    {
      mode: "resetPassword",
      oobCode: "abc123",
      continueUrl: "https://robotshift.web.app/",
    },
  );
  assert.equal(parseAuthAction("?mode=resetPassword"), null);
  assert.equal(parseAuthAction("?mode=deleteAccount&oobCode=abc"), null);
  assert.equal(parseAuthAction("?mode=verifyEmail&oobCode="), null);
});

test("email action continuation cannot redirect outside RobotShift", () => {
  assert.equal(
    safeContinueUrl(
      "https://robotshift.web.app/lessons/001/",
      "https://robotshift.web.app",
    ),
    "https://robotshift.web.app/lessons/001/",
  );
  assert.equal(
    safeContinueUrl(
      "https://attacker.example/phish",
      "https://robotshift.web.app",
    ),
    "https://robotshift.web.app/",
  );
  assert.equal(
    safeContinueUrl(
      "/?view=today",
      "https://robotshift.web.app",
    ),
    "https://robotshift.web.app/?view=today",
  );
});

test("maps Firebase errors without exposing raw provider messages", () => {
  assert.equal(
    firebaseAuthErrorMessage({ code: "auth/invalid-credential" }),
    "The email or password is incorrect.",
  );
  assert.equal(
    firebaseAuthErrorMessage({ code: "auth/email-already-in-use" }),
    "This account could not be created. Try signing in or resetting the password.",
  );
  assert.equal(
    firebaseAuthErrorMessage({
      code: "auth/internal-error",
      message: "provider stack and request details",
    }),
    "Authentication could not be completed. Try again.",
  );
  assert.equal(
    firebaseAuthErrorMessage(Object.assign(
      new Error("Pending write details"),
      { code: "auth/pending-cloud-save" },
    )),
    "Pending write details",
  );
});

test("auth lifecycle preserves same-user datasets and flushes before logout", async () => {
  const source = await readFile(
    new URL("../app/auth/auth-context.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /!identityChanged && datasetIdRef\.current/);
  assert.match(source, /registerBeforeSignOut/);
  const flushIndex = source.indexOf(
    "for (const handler of [...beforeSignOutHandlersRef.current])",
  );
  const signOutIndex = source.indexOf("await signOutAccount()");
  assert.ok(flushIndex >= 0);
  assert.ok(signOutIndex > flushIndex);
  assert.match(source, /ACCOUNT_ACCESS_REFRESH_INTERVAL_MS/);
  assert.match(source, /window\.addEventListener\("focus", refreshAccessLease\)/);
  assert.match(
    source,
    /document\.addEventListener\("visibilitychange", refreshAccessLease\)/,
  );
});

test("password change refreshes Auth before renewing the Firestore access boundary", async () => {
  const source = await readFile(
    new URL("../app/auth/auth-service.ts", import.meta.url),
    "utf8",
  );
  const passwordChangeIndex = source.indexOf(
    "await updatePassword(input.user, input.newPassword)",
  );
  const tokenRefreshIndex = source.indexOf(
    "await input.user.getIdToken(true)",
  );
  const accessRenewalIndex = source.indexOf(
    "await bootstrapCloudAccount()",
  );
  const failClosedSignOutIndex = source.indexOf("await signOut(auth)");

  assert.ok(passwordChangeIndex >= 0);
  assert.ok(tokenRefreshIndex > passwordChangeIndex);
  assert.ok(accessRenewalIndex > tokenRefreshIndex);
  assert.ok(failClosedSignOutIndex > accessRenewalIndex);
});

test("the Auth emulator uses the bounded local password policy", async () => {
  const source = await readFile(
    new URL("../app/auth/auth-service.ts", import.meta.url),
    "utf8",
  );
  const localValidationIndex = source.indexOf(
    "validatePasswordLocally(password)",
  );
  const emulatorBypassIndex = source.indexOf(
    "if (isUsingLocalFirebaseEmulators()) return",
  );
  const FirebaseValidationIndex = source.indexOf(
    "validateFirebasePassword(auth, password)",
  );

  assert.ok(localValidationIndex >= 0);
  assert.ok(emulatorBypassIndex > localValidationIndex);
  assert.ok(FirebaseValidationIndex > emulatorBypassIndex);
});
