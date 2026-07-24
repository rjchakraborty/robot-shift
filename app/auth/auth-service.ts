"use client";

import type { User } from "firebase/auth";
import {
  getFirebaseAuth,
  isUsingLocalFirebaseEmulators,
} from "../firebase-client";
import {
  bootstrapCloudAccount,
  updateCloudProfileName,
} from "../firestore-data";
import {
  AuthValidationError,
  normalizeEmail,
  validateDisplayName,
  validateEmail,
  validatePasswordLocally,
} from "./auth-core";

function continueSettings() {
  return {
    url: `${window.location.origin}/`,
    handleCodeInApp: false,
  };
}

export async function registerWithEmail(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<{ user: User; verificationSent: boolean }> {
  const displayName = validateDisplayName(input.displayName);
  const email = validateEmail(input.email);
  await validatePassword(input.password);

  const [auth, authModule] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  const credential = await authModule.createUserWithEmailAndPassword(
    auth,
    email,
    input.password,
  );
  await authModule.updateProfile(credential.user, { displayName });
  let verificationSent = true;
  try {
    await authModule.sendEmailVerification(
      credential.user,
      continueSettings(),
    );
  } catch {
    verificationSent = false;
  }
  await credential.user.reload();
  return { user: credential.user, verificationSent };
}

export async function signInWithEmail(
  emailInput: string,
  password: string,
): Promise<User> {
  const email = validateEmail(emailInput);
  if (!password) throw new AuthValidationError("Enter your password.");
  const [auth, { signInWithEmailAndPassword }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function signInWithGoogle(): Promise<{
  user: User;
  isNewUser: boolean;
}> {
  const [auth, {
    getAdditionalUserInfo,
    GoogleAuthProvider,
    signInWithPopup,
  }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  return {
    user: credential.user,
    isNewUser: getAdditionalUserInfo(credential)?.isNewUser === true,
  };
}

export async function sendVerificationEmail(user: User): Promise<void> {
  if (user.emailVerified) return;
  const { sendEmailVerification } = await import("firebase/auth");
  await sendEmailVerification(user, continueSettings());
}

export async function requestPasswordReset(
  emailInput: string,
): Promise<void> {
  const email = validateEmail(emailInput);
  const [auth, { sendPasswordResetEmail }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  await sendPasswordResetEmail(auth, email, continueSettings());
}

export async function updateAccountName(
  user: User,
  displayNameInput: string,
): Promise<void> {
  const displayName = validateDisplayName(displayNameInput);
  const { updateProfile } = await import("firebase/auth");
  await updateProfile(user, { displayName });
  await user.reload();
  if (user.emailVerified) {
    await updateCloudProfileName(user.uid, displayName);
  }
}

export async function changeAccountPassword(input: {
  user: User;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const email = input.user.email;
  if (!email) {
    throw new AuthValidationError(
      "This account has no email address for password authentication.",
    );
  }
  if (!input.currentPassword) {
    throw new AuthValidationError("Enter your current password.");
  }
  await validatePassword(input.newPassword);

  const {
    EmailAuthProvider,
    reauthenticateWithCredential,
    signOut,
    updatePassword,
  } = await import("firebase/auth");
  await reauthenticateWithCredential(
    input.user,
    EmailAuthProvider.credential(
      normalizeEmail(email),
      input.currentPassword,
    ),
  );
  await updatePassword(input.user, input.newPassword);
  try {
    await input.user.getIdToken(true);
    await bootstrapCloudAccount();
  } catch {
    const auth = await getFirebaseAuth();
    await signOut(auth);
    throw new AuthValidationError(
      "Password changed, but this browser could not renew secure access. Sign in with the new password.",
    );
  }
}

export async function completePasswordReset(
  actionCode: string,
  newPassword: string,
): Promise<void> {
  await validatePassword(newPassword);
  const [auth, { confirmPasswordReset }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  await confirmPasswordReset(auth, actionCode, newPassword);
}

export async function verifyPasswordReset(
  actionCode: string,
): Promise<string> {
  const [auth, { verifyPasswordResetCode }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  return verifyPasswordResetCode(auth, actionCode);
}

export async function applyEmailAction(actionCode: string): Promise<void> {
  const [auth, { applyActionCode }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  await applyActionCode(auth, actionCode);
  if (auth.currentUser) {
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
  }
}

export async function inspectEmailAction(actionCode: string) {
  const [auth, { checkActionCode }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  return checkActionCode(auth, actionCode);
}

export async function signOutAccount(): Promise<void> {
  const [auth, { signOut }] = await Promise.all([
    getFirebaseAuth(),
    import("firebase/auth"),
  ]);
  await signOut(auth);
}

async function validatePassword(password: string): Promise<void> {
  validatePasswordLocally(password);
  // The Firebase Auth emulator returns 501 for /v2/passwordPolicy. Keep
  // browser E2E deterministic with the same fail-closed local policy while
  // production continues to check Firebase's live project policy as well.
  if (isUsingLocalFirebaseEmulators()) return;

  const [auth, { validatePassword: validateFirebasePassword }] =
    await Promise.all([
      getFirebaseAuth(),
      import("firebase/auth"),
    ]);
  const status = await validateFirebasePassword(auth, password);
  if (!status.isValid) {
    throw new AuthValidationError(
      "The password does not meet the current account security policy.",
    );
  }
}
