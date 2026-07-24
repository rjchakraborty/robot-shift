import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import {
  HttpsError,
  type CallableRequest,
} from "firebase-functions/v2/https";

import { TUTOR_MODEL_POLICY } from "./config.js";
import { canonicalJson, sha256Hex } from "./crypto.js";
import { requireActiveVerifiedIdentity } from "./security.js";
import { buildTutorPrompt, contextForDay } from "./tutor-context.js";
import {
  markTutorRequestUnknown,
  readStoredTutorThread,
  readTutorThreadGeneration,
  reserveTutorRequest,
  settleTutorRequest,
  threadControlReference,
  threadReference,
  type TutorAnswer,
} from "./tutor-quota.js";
import {
  providerResponseIsUsable,
  type TutorProvider,
} from "./tutor-provider.js";
import {
  asRecord,
  hasExactKeys,
  parseDayId,
  parseQuestion,
  parseTutorMode,
  parseUuid,
} from "./validation.js";

export type AskTutorDependencies = {
  database: Firestore;
  auth: Auth;
  provider: TutorProvider;
  now?: () => Date;
};

export async function handleAskTutor(
  request: CallableRequest<unknown>,
  dependencies: AskTutorDependencies,
): Promise<TutorAnswer> {
  const identity = await requireActiveVerifiedIdentity(request, dependencies);
  const body = asRecord(request.data);
  if (
    !hasExactKeys(body, ["dayId", "mode", "message", "requestId"])
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Tutor input contains unsupported fields.",
    );
  }
  const dayId = parseDayId(body.dayId);
  const mode = parseTutorMode(body.mode);
  const question = parseQuestion(
    body.message,
    TUTOR_MODEL_POLICY.maxQuestionCharacters,
  );
  const requestId = parseUuid(body.requestId);
  const context = contextForDay(dayId);
  if (!context) {
    throw new HttpsError(
      "failed-precondition",
      "Trusted tutor content is unavailable for this lesson.",
    );
  }

  const userReference = dependencies.database.doc(`users/${identity.uid}`);
  const userSnapshot = await userReference.get();
  const datasetId = readDatasetId(userSnapshot.data()?.currentDatasetId);
  const [threadSnapshot, controlSnapshot] = await Promise.all([
    threadReference(
      dependencies.database,
      identity.uid,
      datasetId,
      dayId,
    ).get(),
    threadControlReference(
      dependencies.database,
      identity.uid,
      datasetId,
      dayId,
    ).get(),
  ]);
  const threadGeneration = readTutorThreadGeneration(
    controlSnapshot.data(),
  );
  const prompt = buildTutorPrompt({
    context,
    mode,
    history: readStoredTutorThread(threadSnapshot.data()).messages
      .slice(-TUTOR_MODEL_POLICY.maxHistoryMessages),
    question,
  });
  const now = dependencies.now?.() ?? new Date();
  const inputHash = sha256Hex(canonicalJson({
    datasetId,
    dayId,
    mode,
    question,
  }));

  // Reserve the maximum configured prompt and response before any Gemini API
  // call. That makes countTokens itself quota-gated and keeps the shared spend
  // ceiling fail-closed when provider usage metadata is missing.
  const reservation = await reserveTutorRequest(dependencies.database, {
    uid: identity.uid,
    requestId,
    inputHash,
    datasetId,
    dayId,
    mode,
    question,
    promptTokens: TUTOR_MODEL_POLICY.maxInputTokens,
    threadGeneration,
    dayKey: utcDayKey(now),
    now,
  });
  if (reservation.kind === "replay") return reservation.answer;
  if (reservation.kind === "unknown") {
    throw new HttpsError(
      "unavailable",
      "The prior outcome of this tutor request is unknown. Submit a new question later.",
    );
  }

  let promptTokens: number;
  try {
    promptTokens = await dependencies.provider.countTokens(prompt);
  } catch {
    await bestEffortMarkUnknown(
      dependencies.database,
      reservation.request,
      dependencies.now?.() ?? new Date(),
    );
    throw new HttpsError(
      "unavailable",
      "The tutor could not safely verify this request. Try again later.",
    );
  }
  if (promptTokens > TUTOR_MODEL_POLICY.maxInputTokens) {
    await settleTutorRequest(dependencies.database, {
      request: reservation.request,
      answer: "",
      model: TUTOR_MODEL_POLICY.model,
      usable: false,
      promptTokens: 0,
      candidateTokens: 0,
      thoughtTokens: 0,
      totalTokens: 0,
      now: dependencies.now?.() ?? new Date(),
    });
    throw new HttpsError(
      "invalid-argument",
      "This lesson history is too large for a safe tutor request. Clear the lesson conversation and try again.",
    );
  }

  let generated;
  try {
    generated = await dependencies.provider.generate(prompt);
  } catch {
    await bestEffortMarkUnknown(
      dependencies.database,
      reservation.request,
      dependencies.now?.() ?? new Date(),
    );
    throw new HttpsError(
      "unavailable",
      "The tutor response could not be confirmed. The request was not retried.",
    );
  }

  const usable = providerResponseIsUsable(generated);
  let settled: TutorAnswer;
  try {
    settled = await settleTutorRequest(dependencies.database, {
      request: reservation.request,
      answer: generated.answer,
      model: generated.model,
      usable,
      promptTokens: generated.promptTokens ?? promptTokens,
      candidateTokens: generated.candidateTokens,
      thoughtTokens: generated.thoughtTokens,
      totalTokens: generated.totalTokens,
      now: dependencies.now?.() ?? new Date(),
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "unavailable",
      "The tutor response could not be committed safely. The request was not retried.",
    );
  }
  if (!usable) {
    throw new HttpsError(
      "failed-precondition",
      "The tutor stopped before producing a complete safe response.",
    );
  }
  return settled;
}

function readDatasetId(value: unknown): string {
  if (
    typeof value !== "string"
    || !/^[A-Za-z0-9_-]{8,80}$/.test(value)
  ) {
    throw new HttpsError(
      "failed-precondition",
      "Secure course data is not initialized.",
    );
  }
  return value;
}

function utcDayKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) {
    throw new HttpsError("internal", "Tutor clock is invalid.");
  }
  return date.toISOString().slice(0, 10);
}

async function bestEffortMarkUnknown(
  database: Firestore,
  request: Parameters<typeof markTutorRequestUnknown>[1],
  now: Date,
): Promise<void> {
  try {
    await markTutorRequestUnknown(database, request, now);
  } catch {
    // Preserve the reservation and fail closed if uncertainty cleanup fails.
  }
}
