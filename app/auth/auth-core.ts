export const AUTH_NAME_MAX_LENGTH = 60;
export const AUTH_PASSWORD_MIN_LENGTH = 12;
export const AUTH_PASSWORD_MAX_LENGTH = 128;

export type AuthActionMode =
  | "resetPassword"
  | "recoverEmail"
  | "verifyEmail";

export type ParsedAuthAction = {
  mode: AuthActionMode;
  oobCode: string;
  continueUrl: string | null;
};

export class AuthValidationError extends Error {
  readonly code = "validation";

  constructor(message: string) {
    super(message);
    this.name = "AuthValidationError";
  }
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateDisplayName(value: string): string {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    throw new AuthValidationError("Enter your name using at least 2 characters.");
  }
  if (name.length > AUTH_NAME_MAX_LENGTH) {
    throw new AuthValidationError(
      `Keep your name within ${AUTH_NAME_MAX_LENGTH} characters.`,
    );
  }
  return name;
}

export function validateEmail(value: string): string {
  const email = normalizeEmail(value);
  if (
    email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new AuthValidationError("Enter a valid email address.");
  }
  return email;
}

export function passwordRequirements(password: string): string[] {
  const missing: string[] = [];
  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    missing.push(`at least ${AUTH_PASSWORD_MIN_LENGTH} characters`);
  }
  if (password.length > AUTH_PASSWORD_MAX_LENGTH) {
    missing.push(`no more than ${AUTH_PASSWORD_MAX_LENGTH} characters`);
  }
  if (!/[a-z]/.test(password)) missing.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) missing.push("an uppercase letter");
  if (!/[0-9]/.test(password)) missing.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) missing.push("a symbol");
  return missing;
}

export function validatePasswordLocally(password: string): string {
  const missing = passwordRequirements(password);
  if (missing.length > 0) {
    throw new AuthValidationError(
      `Password needs ${formatList(missing)}.`,
    );
  }
  return password;
}

export function parseAuthAction(search: string): ParsedAuthAction | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode")?.trim() ?? "";
  if (
    (mode !== "resetPassword"
      && mode !== "recoverEmail"
      && mode !== "verifyEmail")
    || !oobCode
    || oobCode.length > 2_048
  ) {
    return null;
  }

  const continueUrl = params.get("continueUrl");
  return {
    mode,
    oobCode,
    continueUrl: continueUrl && continueUrl.length <= 2_048
      ? continueUrl
      : null,
  };
}

export function safeContinueUrl(
  candidate: string | null,
  currentOrigin: string,
): string {
  if (!candidate) return `${currentOrigin}/`;
  try {
    const parsed = new URL(candidate, currentOrigin);
    return parsed.origin === currentOrigin
      ? parsed.toString()
      : `${currentOrigin}/`;
  } catch {
    return `${currentOrigin}/`;
  }
}

export function firebaseAuthErrorCode(error: unknown): string {
  if (
    typeof error === "object"
    && error !== null
    && "code" in error
    && typeof error.code === "string"
  ) {
    return error.code;
  }
  return "auth/unknown";
}

export function firebaseAuthErrorMessage(
  error: unknown,
  fallback = "Authentication could not be completed. Try again.",
): string {
  if (error instanceof AuthValidationError) return error.message;

  switch (firebaseAuthErrorCode(error)) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "This account could not be created. Try signing in or resetting the password.";
    case "auth/weak-password":
      return "The password does not meet the security requirements.";
    case "auth/too-many-requests":
      return "Too many attempts were made. Wait a while before trying again.";
    case "auth/network-request-failed":
      return "The network request failed. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "The browser blocked Google sign-in. Allow pop-ups for this site and try again.";
    case "auth/cancelled-popup-request":
      return "Another sign-in window is already open.";
    case "auth/account-exists-with-different-credential":
      return "An account already uses this email. Sign in with its original method first.";
    case "auth/requires-recent-login":
      return "For security, sign in again before changing this account.";
    case "auth/user-disabled":
      return "This account is disabled.";
    case "auth/expired-action-code":
      return "This email link has expired. Request a new one.";
    case "auth/invalid-action-code":
      return "This email link is invalid or has already been used.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled.";
    case "auth/pending-cloud-save":
      return error instanceof Error
        ? error.message
        : "Course changes could not be saved. You are still signed in.";
    default:
      return fallback;
  }
}

function formatList(values: string[]): string {
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}
