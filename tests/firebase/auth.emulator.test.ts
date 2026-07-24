import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  applyActionCode,
  confirmPasswordReset,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  inMemoryPersistence,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  verifyPasswordResetCode,
  type Auth,
} from "firebase/auth";

const PROJECT_ID = "demo-robotshift";
const EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const EMULATOR_ORIGIN = `http://${EMULATOR_HOST}`;
const INITIAL_PASSWORD = "RobotShift!42";
const UPDATED_PASSWORD = "RobotShift!84";

let app: FirebaseApp;
let auth: Auth;

before(async () => {
  app = initializeApp({
    apiKey: "demo-api-key",
    authDomain: "demo-robotshift.firebaseapp.com",
    projectId: PROJECT_ID,
  }, "robotshift-auth-emulator-tests");
  auth = getAuth(app);
  connectAuthEmulator(auth, EMULATOR_ORIGIN, { disableWarnings: true });
  await setPersistence(auth, inMemoryPersistence);
});

beforeEach(async () => {
  if (auth.currentUser) await signOut(auth);
  const response = await fetch(
    `${EMULATOR_ORIGIN}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: "DELETE" },
  );
  assert.equal(response.ok, true, "Auth emulator account reset failed");
});

after(async () => {
  if (auth.currentUser) await signOut(auth);
  await deleteApp(app);
});

test("registers, names, verifies, signs out, and signs back in", async () => {
  const email = "verified-reader@example.test";
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    INITIAL_PASSWORD,
  );
  await updateProfile(credential.user, { displayName: "Verified Reader" });
  await sendEmailVerification(credential.user);

  const code = await latestOobCode(email, "VERIFY_EMAIL");
  await applyActionCode(auth, code);
  await credential.user.reload();

  assert.equal(credential.user.displayName, "Verified Reader");
  assert.equal(credential.user.emailVerified, true);

  await signOut(auth);
  const signedIn = await signInWithEmailAndPassword(
    auth,
    email,
    INITIAL_PASSWORD,
  );
  assert.equal(signedIn.user.emailVerified, true);
  assert.equal(signedIn.user.displayName, "Verified Reader");
});

test("forgot-password changes the credential and invalidates the old password", async () => {
  const email = "password-reset@example.test";
  await createUserWithEmailAndPassword(auth, email, INITIAL_PASSWORD);
  await signOut(auth);

  await sendPasswordResetEmail(auth, email);
  const code = await latestOobCode(email, "PASSWORD_RESET");
  assert.equal(await verifyPasswordResetCode(auth, code), email);
  await confirmPasswordReset(auth, code, UPDATED_PASSWORD);

  await assert.rejects(
    signInWithEmailAndPassword(auth, email, INITIAL_PASSWORD),
    isRejectedCredential,
  );
  const signedIn = await signInWithEmailAndPassword(
    auth,
    email,
    UPDATED_PASSWORD,
  );
  assert.equal(signedIn.user.email, email);
});

test("reauthentication protects an in-session password change", async () => {
  const email = "password-change@example.test";
  const { user } = await createUserWithEmailAndPassword(
    auth,
    email,
    INITIAL_PASSWORD,
  );

  await assert.rejects(
    reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(email, "WrongPassword!42"),
    ),
    isRejectedCredential,
  );
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(email, INITIAL_PASSWORD),
  );
  await updatePassword(user, UPDATED_PASSWORD);
  await signOut(auth);

  await assert.rejects(
    signInWithEmailAndPassword(auth, email, INITIAL_PASSWORD),
    isRejectedCredential,
  );
  await signInWithEmailAndPassword(auth, email, UPDATED_PASSWORD);
});

test("deleted accounts cannot authenticate again", async () => {
  const email = "deleted-reader@example.test";
  const { user } = await createUserWithEmailAndPassword(
    auth,
    email,
    INITIAL_PASSWORD,
  );
  await deleteUser(user);
  assert.equal(auth.currentUser, null);
  await assert.rejects(
    signInWithEmailAndPassword(auth, email, INITIAL_PASSWORD),
    isRejectedCredential,
  );
});

async function latestOobCode(
  email: string,
  requestType: "VERIFY_EMAIL" | "PASSWORD_RESET",
): Promise<string> {
  const response = await fetch(
    `${EMULATOR_ORIGIN}/emulator/v1/projects/${PROJECT_ID}/oobCodes`,
  );
  assert.equal(response.ok, true, "Auth emulator OOB lookup failed");
  const payload = await response.json() as {
    oobCodes?: Array<{
      email?: string;
      oobCode?: string;
      requestType?: string;
    }>;
  };
  const match = [...(payload.oobCodes ?? [])]
    .reverse()
    .find((item) => (
      item.email === email
      && item.requestType === requestType
      && typeof item.oobCode === "string"
    ));
  assert.ok(match?.oobCode, `Missing ${requestType} OOB code for ${email}`);
  return match.oobCode;
}

function firebaseErrorCode(error: unknown): string {
  return (
    error
    && typeof error === "object"
    && "code" in error
    && typeof error.code === "string"
  ) ? error.code : "";
}

function isRejectedCredential(error: unknown): boolean {
  return [
    "auth/invalid-credential",
    "auth/wrong-password",
    "auth/user-not-found",
  ].includes(firebaseErrorCode(error));
}
