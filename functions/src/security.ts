import type { Auth, UserRecord } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import {
  HttpsError,
  type CallableRequest,
} from "firebase-functions/v2/https";

import { ROBOTSHIFT_WEB_APP_ID } from "./config.js";

export type VerifiedIdentity = {
  uid: string;
  user: UserRecord;
};

export const ACCOUNT_ACCESS_SCHEMA_VERSION = 1;
export const ACCOUNT_ACCESS_LEASE_MS = 15 * 60 * 1_000;

export type ActiveIdentityDependencies = {
  auth: Auth;
  database: Firestore;
  now?: () => Date;
};

export async function requireVerifiedIdentity(
  request: CallableRequest<unknown>,
  auth: Auth,
): Promise<VerifiedIdentity> {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Sign in before using secure RobotShift data.",
    );
  }
  if (request.auth.token.email_verified !== true) {
    throw new HttpsError(
      "permission-denied",
      "Verify your email before using secure RobotShift data.",
    );
  }
  if (!request.app || request.app.appId !== ROBOTSHIFT_WEB_APP_ID) {
    throw new HttpsError(
      "failed-precondition",
      "This browser could not be verified by RobotShift.",
    );
  }

  let user: UserRecord;
  try {
    user = await auth.getUser(request.auth.uid);
  } catch {
    throw new HttpsError(
      "unauthenticated",
      "This account is no longer available.",
    );
  }
  if (user.disabled) {
    throw new HttpsError("permission-denied", "This account is disabled.");
  }
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(user.uid)) {
    throw new HttpsError(
      "permission-denied",
      "This account identifier is not supported.",
    );
  }
  if (!user.emailVerified) {
    throw new HttpsError(
      "permission-denied",
      "Verify your email before using secure RobotShift data.",
    );
  }
  return { uid: user.uid, user };
}

export async function requireActiveVerifiedIdentity(
  request: CallableRequest<unknown>,
  dependencies: ActiveIdentityDependencies,
): Promise<VerifiedIdentity> {
  const identity = await requireVerifiedIdentity(request, dependencies.auth);
  const accessSnapshot = await dependencies.database
    .doc(`accountAccess/${identity.uid}`)
    .get();
  const access = accessSnapshot.data();
  const rawAuthTime = request.auth?.token.auth_time;
  const liveAuthValidAfterSeconds =
    identity.user.tokensValidAfterTime === undefined
      ? 0
      : tokensValidAfterSeconds(identity.user.tokensValidAfterTime);
  const rawAuthValidAfterSeconds = access?.authValidAfterSeconds;
  const validUntilMs = timestampMilliseconds(access?.validUntil);
  const nowMs = (dependencies.now?.() ?? new Date()).getTime();

  if (
    !accessSnapshot.exists
    || access?.schemaVersion !== ACCOUNT_ACCESS_SCHEMA_VERSION
    || access?.uid !== identity.uid
    || access?.active !== true
    || typeof rawAuthValidAfterSeconds !== "number"
    || !Number.isSafeInteger(rawAuthValidAfterSeconds)
    || rawAuthValidAfterSeconds < 0
    || typeof rawAuthTime !== "number"
    || !Number.isSafeInteger(rawAuthTime)
    || liveAuthValidAfterSeconds === null
    || rawAuthTime < liveAuthValidAfterSeconds
    || rawAuthTime < rawAuthValidAfterSeconds
    || validUntilMs === null
    || nowMs >= validUntilMs
  ) {
    throw new HttpsError(
      "permission-denied",
      "This session no longer has access. Sign in again.",
    );
  }
  return identity;
}

function tokensValidAfterSeconds(value: string | undefined): number | null {
  if (typeof value !== "string") return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  const seconds = Math.floor(milliseconds / 1_000);
  return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : null;
}

function timestampMilliseconds(value: unknown): number | null {
  if (
    typeof value !== "object"
    || value === null
    || !("toMillis" in value)
    || typeof value.toMillis !== "function"
  ) return null;
  const milliseconds = value.toMillis();
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

export function sanitizeDisplayName(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
}
