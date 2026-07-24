import type {
  DocumentReference,
  Firestore,
  Transaction,
} from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

import {
  DATA_RETENTION_POLICY,
  effectiveTutorPolicy,
  TUTOR_MODEL_POLICY,
  TutorPolicyConfigurationError,
  type TutorPolicy,
} from "./config.js";
import { sha256Hex } from "./crypto.js";
import type {
  StoredTutorMessage,
  StoredTutorThread,
  TutorMode,
} from "./types.js";
import { tutorModes } from "./types.js";

const tutorModeSet = new Set<string>(tutorModes);

type StoredTutorRequest = {
  schemaVersion: 1;
  uid: string;
  requestId: string;
  inputHash: string;
  datasetId: string;
  dayId: number;
  dayKey: string;
  mode: TutorMode;
  status: "reserved" | "succeeded" | "provider_rejected" | "unknown";
  reservationNanoUsd: number;
  dailyLimit: number;
  actualNanoUsd: number;
  promptTokens: number;
  candidateTokens: number;
  thoughtTokens: number;
  model: string;
  pricingVersion: string;
  threadGeneration: number;
  expiresAt: unknown;
  createdAt: unknown;
  updatedAt: unknown;
  leaseExpiresAtMs?: number;
  answer?: string;
  threadCommitted?: boolean;
  costSource?: "provider_metadata" | "reservation_upper_bound";
  totalTokens?: number;
  completedAt?: unknown;
  unknownAt?: unknown;
};

export type TutorUsageSummary = {
  dayKey: string;
  dailyLimit: number;
  attempts: number;
  successes: number;
  reservedNanoUsd: number;
  actualNanoUsd: number;
};

export type TutorAnswer = {
  answer: string;
  model: string;
  datasetId: string;
  requestId: string;
  threadCommitted: boolean;
  remainingToday: number;
  usage: TutorUsageSummary;
};

export type TutorReservationInput = {
  uid: string;
  requestId: string;
  inputHash: string;
  datasetId: string;
  dayId: number;
  mode: TutorMode;
  question: string;
  promptTokens: number;
  threadGeneration: number;
  dayKey: string;
  now: Date;
};

type ReservedRequest = TutorReservationInput & {
  reservationNanoUsd: number;
  dailyLimit: number;
  leaseExpiresAtMs: number;
};

export type ReservationResult =
  | {
      kind: "reserved";
      request: ReservedRequest;
    }
  | {
      kind: "replay";
      answer: TutorAnswer;
    }
  | {
      kind: "unknown";
    };

export type TutorSettlementInput = {
  request: ReservedRequest;
  answer: string;
  model: string;
  usable: boolean;
  promptTokens: number | undefined;
  candidateTokens: number | undefined;
  thoughtTokens: number | undefined;
  totalTokens: number | undefined;
  now: Date;
};

export function calculateReservationNanoUsd(
  promptTokens: number,
  policy: Pick<
    TutorPolicy,
    | "maxInputTokens"
    | "maxOutputTokens"
    | "inputNanoUsdPerToken"
    | "outputNanoUsdPerToken"
  >,
): number {
  assertTokenCount(promptTokens, policy.maxInputTokens, "Prompt");
  return checkedAdd(
    checkedMultiply(promptTokens, policy.inputNanoUsdPerToken),
    checkedMultiply(policy.maxOutputTokens, policy.outputNanoUsdPerToken),
  );
}

export function calculateActualNanoUsd(input: {
  promptTokens: number | undefined;
  candidateTokens: number | undefined;
  thoughtTokens: number | undefined;
  totalTokens: number | undefined;
  reservationNanoUsd: number;
  policy: Pick<
    TutorPolicy,
    "inputNanoUsdPerToken" | "outputNanoUsdPerToken"
  >;
}): {
  nanoUsd: number;
  source: "provider_metadata" | "reservation_upper_bound";
} {
  const prompt = validNonNegativeInteger(input.promptTokens);
  const candidates = validNonNegativeInteger(input.candidateTokens);
  const thoughts = validNonNegativeInteger(input.thoughtTokens);
  const total = validNonNegativeInteger(input.totalTokens);
  if (
    prompt === undefined
    || candidates === undefined
    || thoughts === undefined
    || total === undefined
    || total < prompt + candidates + thoughts
  ) {
    return {
      nanoUsd: input.reservationNanoUsd,
      source: "reservation_upper_bound",
    };
  }
  const calculated = checkedAdd(
    checkedMultiply(prompt, input.policy.inputNanoUsdPerToken),
    checkedMultiply(
      checkedAdd(candidates, thoughts),
      input.policy.outputNanoUsdPerToken,
    ),
  );
  return {
    nanoUsd: calculated,
    source: "provider_metadata",
  };
}

export async function reserveTutorRequest(
  database: Firestore,
  input: TutorReservationInput,
): Promise<ReservationResult> {
  const refs = quotaReferences(database, input.uid, input.dayKey, input.requestId);

  return database.runTransaction(async (transaction) => {
    const [
      runtimeSnapshot,
      entitlementSnapshot,
      userSnapshot,
      requestSnapshot,
      usageSnapshot,
      globalSnapshot,
      controlSnapshot,
    ] = await Promise.all([
      transaction.get(refs.runtime),
      transaction.get(refs.entitlement),
      transaction.get(refs.user),
      transaction.get(refs.request),
      transaction.get(refs.usage),
      transaction.get(refs.global),
      transaction.get(threadControlReference(
        database,
        input.uid,
        input.datasetId,
        input.dayId,
      )),
    ]);

    let runtimePolicy: TutorPolicy;
    try {
      runtimePolicy = effectiveTutorPolicy(
        runtimeSnapshot.exists ? runtimeSnapshot.data() : undefined,
      );
    } catch (error) {
      if (error instanceof TutorPolicyConfigurationError) {
        throw new HttpsError(
          "failed-precondition",
          "Tutor runtime policy requires administrator repair.",
        );
      }
      throw error;
    }
    if (!runtimePolicy.enabled) {
      throw new HttpsError(
        "unavailable",
        "The AI tutor is temporarily disabled.",
      );
    }
    if (
      input.now.getTime()
        >= Date.parse(runtimePolicy.lifecycleShutdownAt)
    ) {
      throw new HttpsError(
        "unavailable",
        "The AI tutor model is awaiting a required lifecycle update.",
      );
    }

    if (!userSnapshot.exists || userSnapshot.data()?.currentDatasetId !== input.datasetId) {
      throw new HttpsError(
        "aborted",
        "Course data changed while the tutor request was starting. Try again.",
      );
    }
    if (!entitlementSnapshot.exists) {
      throw new HttpsError(
        "permission-denied",
        "Tutor access is not active for this account.",
      );
    }
    const entitlement = validateEntitlement(entitlementSnapshot.data());
    if (entitlement.status !== "active") {
      throw new HttpsError(
        "permission-denied",
        "Tutor access is not active for this account.",
      );
    }
    const policy: TutorPolicy = {
      ...runtimePolicy,
      perUserDailyLimit: Math.min(
        runtimePolicy.perUserDailyLimit,
        entitlement.dailyTutorLimit,
      ),
    };

    const currentGeneration = readTutorThreadGeneration(
      controlSnapshot.data(),
    );

    if (requestSnapshot.exists) {
      return handleExistingRequest(
        transaction,
        refs.request,
        refs.usage,
        refs.usageProjection,
        refs.global,
        requestSnapshot.data() ?? {},
        usageSnapshot.data(),
        globalSnapshot.data(),
        input,
        policy,
      );
    }

    if (currentGeneration !== input.threadGeneration) {
      throw new HttpsError(
        "aborted",
        "Tutor history changed while the request was starting. Try again.",
      );
    }

    const usage = usageForAdmission(
      usageSnapshot.data(),
      input.dayKey,
      input.now.getTime(),
    );
    if (usage.attempts >= policy.perUserDailyLimit) {
      throw new HttpsError(
        "resource-exhausted",
        "Today's free tutor limit has been reached.",
      );
    }
    if (usage.inFlight >= 1) {
      throw new HttpsError(
        "resource-exhausted",
        "Wait for the current tutor request to finish.",
      );
    }

    const reservationNanoUsd = calculateReservationNanoUsd(
      input.promptTokens,
      policy,
    );
    const global = normalizeGlobal(globalSnapshot.data(), input.dayKey);
    const authorizationLimitNanoUsd = Math.min(
      policy.authorizationLimitNanoUsd,
      global.authorizationLimitNanoUsd,
    );
    const committedAfterReservation = checkedAdd(
      checkedAdd(global.actualNanoUsd, global.reservedNanoUsd),
      reservationNanoUsd,
    );
    if (
      global.budgetBreached
      || committedAfterReservation > authorizationLimitNanoUsd
    ) {
      throw new HttpsError(
        "resource-exhausted",
        "The shared tutor budget is exhausted for today.",
      );
    }

    const nextUsage = {
      ...usage,
      attempts: usage.attempts + 1,
      admitted: usage.admitted + 1,
      inFlight: usage.inFlight + 1,
      activeRequestId: input.requestId,
      inFlightLeaseExpiresAtMs:
        input.now.getTime() + policy.leaseMilliseconds,
      reservedNanoUsd: usage.reservedNanoUsd + reservationNanoUsd,
      expiresAt: tutorLedgerExpiresAt(input.dayKey),
      updatedAt: input.now,
    };
    const nextGlobal = {
      ...global,
      admitted: global.admitted + 1,
      inFlight: global.inFlight + 1,
      reservedNanoUsd: global.reservedNanoUsd + reservationNanoUsd,
      authorizationLimitNanoUsd,
      absoluteLimitNanoUsd: policy.absoluteLimitNanoUsd,
      pricingVersion: policy.pricingVersion,
      expiresAt: tutorLedgerExpiresAt(input.dayKey),
      updatedAt: input.now,
    };
    const leaseExpiresAtMs =
      input.now.getTime() + policy.leaseMilliseconds;

    transaction.create(refs.request, {
      schemaVersion: 1,
      uid: input.uid,
      requestId: input.requestId,
      inputHash: input.inputHash,
      datasetId: input.datasetId,
      dayId: input.dayId,
      dayKey: input.dayKey,
      mode: input.mode,
      status: "reserved",
      reservationNanoUsd,
      dailyLimit: policy.perUserDailyLimit,
      actualNanoUsd: 0,
      promptTokens: input.promptTokens,
      candidateTokens: 0,
      thoughtTokens: 0,
      model: policy.model,
      pricingVersion: policy.pricingVersion,
      threadGeneration: input.threadGeneration,
      leaseExpiresAtMs,
      expiresAt: tutorLedgerExpiresAt(input.dayKey),
      createdAt: input.now,
      updatedAt: input.now,
    });
    writeUsage(transaction, refs.usage, nextUsage);
    transaction.set(refs.global, nextGlobal);
    transaction.set(
      refs.usageProjection,
      usageProjection(nextUsage, policy.perUserDailyLimit),
    );

    return {
      kind: "reserved",
      request: {
        ...input,
        reservationNanoUsd,
        dailyLimit: policy.perUserDailyLimit,
        leaseExpiresAtMs,
      },
    };
  });
}

export async function settleTutorRequest(
  database: Firestore,
  input: TutorSettlementInput,
): Promise<TutorAnswer> {
  const request = input.request;
  const refs = quotaReferences(
    database,
    request.uid,
    request.dayKey,
    request.requestId,
  );
  const cost = calculateActualNanoUsd({
    promptTokens: input.promptTokens,
    candidateTokens: input.candidateTokens,
    thoughtTokens: input.thoughtTokens,
    totalTokens: input.totalTokens,
    reservationNanoUsd: request.reservationNanoUsd,
    policy: effectiveTutorPolicy(undefined),
  });

  return database.runTransaction(async (transaction) => {
    const threadControl = threadControlReference(
      database,
      request.uid,
      request.datasetId,
      request.dayId,
    );
    const thread = threadReference(
      database,
      request.uid,
      request.datasetId,
      request.dayId,
    );
    const [
      requestSnapshot,
      usageSnapshot,
      globalSnapshot,
      userSnapshot,
      controlSnapshot,
      threadSnapshot,
    ] = await Promise.all([
      transaction.get(refs.request),
      transaction.get(refs.usage),
      transaction.get(refs.global),
      transaction.get(refs.user),
      transaction.get(threadControl),
      transaction.get(thread),
    ]);
    if (!requestSnapshot.exists) {
      throw new HttpsError(
        "aborted",
        "Tutor request settlement no longer owns its reservation.",
      );
    }
    const storedRequest = validateStoredTutorRequest(
      requestSnapshot.data(),
      request.uid,
      request.requestId,
    );
    assertStoredRequestMatchesReservation(storedRequest, request);
    const currentGeneration = readTutorThreadGeneration(
      controlSnapshot.data(),
    );
    const currentThread = readStoredTutorThread(threadSnapshot.data());
    const usage = normalizeUsage(usageSnapshot.data(), request.dayKey);
    const global = normalizeGlobal(globalSnapshot.data(), request.dayKey);
    if (storedRequest.status !== "reserved") {
      assertExistingRequestBacking(
        usage,
        global,
        storedRequest,
        input.now.getTime(),
      );
      if (storedRequest.status === "succeeded") {
        return answerFromStoredRequest(storedRequest, usageSnapshot.data());
      }
      throw new HttpsError(
        "aborted",
        "Tutor request settlement no longer owns its reservation.",
      );
    }

    const ownsUserLease = assertReservationBacking(
      usage,
      global,
      storedRequest,
      input.now.getTime(),
    );
    const actualNanoUsd = cost.nanoUsd;
    const overReservation =
      actualNanoUsd > request.reservationNanoUsd;
    const answer = input.answer.slice(
      0,
      TUTOR_MODEL_POLICY.maxStoredAnswerCharacters,
    );
    const usable = input.usable && answer.trim().length > 0;
    const model = input.model.trim().slice(0, 100)
      || TUTOR_MODEL_POLICY.model;
    const nextUsage = {
      ...usage,
      inFlight: ownsUserLease
        ? usage.inFlight - 1
        : usage.inFlight,
      activeRequestId: ownsUserLease ? undefined : usage.activeRequestId,
      inFlightLeaseExpiresAtMs: ownsUserLease
        ? 0
        : usage.inFlightLeaseExpiresAtMs,
      reservedNanoUsd:
        usage.reservedNanoUsd - request.reservationNanoUsd,
      actualNanoUsd: checkedAdd(usage.actualNanoUsd, actualNanoUsd),
      successes: usage.successes + (usable ? 1 : 0),
      updatedAt: input.now,
    };
    const nextGlobal = {
      ...global,
      inFlight: global.inFlight - 1,
      reservedNanoUsd:
        global.reservedNanoUsd - request.reservationNanoUsd,
      actualNanoUsd: checkedAdd(global.actualNanoUsd, actualNanoUsd),
      successes: global.successes + (usable ? 1 : 0),
      budgetBreached: global.budgetBreached
        || overReservation
        || checkedAdd(global.actualNanoUsd, actualNanoUsd)
          > global.absoluteLimitNanoUsd,
      updatedAt: input.now,
    };

    const pointerStillActive =
      userSnapshot.data()?.currentDatasetId === request.datasetId;
    const generationStillActive =
      currentGeneration === request.threadGeneration;
    const threadCommitted =
      usable && pointerStillActive && generationStillActive;

    transaction.update(refs.request, {
      status: usable ? "succeeded" : "provider_rejected",
      answer: usable ? answer : "",
      model,
      threadCommitted,
      actualNanoUsd,
      costSource: cost.source,
      promptTokens: validNonNegativeInteger(input.promptTokens)
        ?? storedRequest.promptTokens
        ?? 0,
      candidateTokens: validNonNegativeInteger(input.candidateTokens) ?? 0,
      thoughtTokens: validNonNegativeInteger(input.thoughtTokens) ?? 0,
      totalTokens: validNonNegativeInteger(input.totalTokens) ?? 0,
      completedAt: input.now,
      updatedAt: input.now,
      leaseExpiresAtMs: FieldValue.delete(),
    });
    writeUsage(transaction, refs.usage, nextUsage);
    transaction.set(refs.global, nextGlobal);
    transaction.set(
      refs.usageProjection,
      usageProjection(nextUsage, request.dailyLimit),
    );

    if (threadCommitted) {
      transaction.set(thread, appendAnswer(
        currentThread,
        request,
        answer,
        model,
        input.now.getTime(),
      ));
    }

    const summary = publicUsageSummary(nextUsage, request.dailyLimit);
    return {
      answer,
      model,
      datasetId: request.datasetId,
      requestId: request.requestId,
      threadCommitted,
      remainingToday: Math.max(0, request.dailyLimit - nextUsage.attempts),
      usage: summary,
    };
  });
}

export async function markTutorRequestUnknown(
  database: Firestore,
  request: ReservedRequest,
  now: Date,
): Promise<void> {
  const refs = quotaReferences(
    database,
    request.uid,
    request.dayKey,
    request.requestId,
  );
  await database.runTransaction(async (transaction) => {
    const [requestSnapshot, usageSnapshot, globalSnapshot] = await Promise.all([
      transaction.get(refs.request),
      transaction.get(refs.usage),
      transaction.get(refs.global),
    ]);
    if (!requestSnapshot.exists) return;
    const storedRequest = validateStoredTutorRequest(
      requestSnapshot.data(),
      request.uid,
      request.requestId,
    );
    assertStoredRequestMatchesReservation(storedRequest, request);
    const usage = normalizeUsage(usageSnapshot.data(), request.dayKey);
    const global = normalizeGlobal(globalSnapshot.data(), request.dayKey);
    if (storedRequest.status !== "reserved") {
      assertExistingRequestBacking(
        usage,
        global,
        storedRequest,
        now.getTime(),
      );
      return;
    }
    const ownsUserLease = assertReservationBacking(
      usage,
      global,
      storedRequest,
      now.getTime(),
    );
    const nextUsage = {
      ...usage,
      inFlight: ownsUserLease
        ? usage.inFlight - 1
        : usage.inFlight,
      activeRequestId: ownsUserLease ? undefined : usage.activeRequestId,
      inFlightLeaseExpiresAtMs: ownsUserLease
        ? 0
        : usage.inFlightLeaseExpiresAtMs,
      updatedAt: now,
    };
    const nextGlobal = {
      ...global,
      inFlight: global.inFlight - 1,
      updatedAt: now,
    };
    transaction.update(refs.request, {
      status: "unknown",
      unknownAt: now,
      updatedAt: now,
      leaseExpiresAtMs: FieldValue.delete(),
    });
    writeUsage(transaction, refs.usage, nextUsage);
    transaction.set(refs.global, nextGlobal);
    transaction.set(
      refs.usageProjection,
      usageProjection(nextUsage, request.dailyLimit),
    );
  });
}

export function threadReference(
  database: Firestore,
  uid: string,
  datasetId: string,
  dayId: number,
): DocumentReference {
  return database.doc(
    `users/${uid}/datasets/${datasetId}/tutorThreads/${dayId}`,
  );
}

export function threadControlReference(
  database: Firestore,
  uid: string,
  datasetId: string,
  dayId: number,
): DocumentReference {
  return database.doc(
    `users/${uid}/datasets/${datasetId}/tutorThreadControls/${dayId}`,
  );
}

function quotaReferences(
  database: Firestore,
  uid: string,
  dayKey: string,
  requestId: string,
) {
  return {
    runtime: database.doc("systemConfig/tutor"),
    entitlement: database.doc(`tutorEntitlements/${uid}`),
    user: database.doc(`users/${uid}`),
    request: database.doc(`users/${uid}/tutorRequests/${requestId}`),
    usage: database.doc(
      `tutorUserDaily/${sha256Hex(`${uid}\u0000${dayKey}`)}`,
    ),
    usageProjection: database.doc(
      `users/${uid}/tutorUsageDaily/${dayKey}`,
    ),
    global: database.doc(`tutorGlobalDaily/${dayKey}`),
  };
}

function validateEntitlement(value: unknown): {
  status: "active" | "disabled";
  dailyTutorLimit: number;
} {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("entitlement");
  }
  const raw = value as Record<string, unknown>;
  const dailyTutorLimit = validPositiveInteger(raw.dailyTutorLimit);
  const createdAtMs = timestampMilliseconds(raw.createdAt);
  const updatedAtMs = timestampMilliseconds(raw.updatedAt);
  if (
    !hasExactKeys(raw, [
      "schemaVersion",
      "status",
      "plan",
      "dailyTutorLimit",
      "createdAt",
      "updatedAt",
    ])
    || raw.schemaVersion !== 1
    || (raw.status !== "active" && raw.status !== "disabled")
    || raw.plan !== "free"
    || dailyTutorLimit === undefined
    || dailyTutorLimit > TUTOR_MODEL_POLICY.perUserDailyLimit
    || createdAtMs === undefined
    || updatedAtMs === undefined
    || updatedAtMs < createdAtMs
  ) {
    throw malformedTutorControl("entitlement");
  }
  return {
    status: raw.status,
    dailyTutorLimit,
  };
}

function validateStoredTutorRequest(
  value: unknown,
  expectedUid: string,
  expectedRequestId: string,
): StoredTutorRequest {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("request record");
  }
  const raw = value as Record<string, unknown>;
  if (
    raw.status !== "reserved"
    && raw.status !== "succeeded"
    && raw.status !== "provider_rejected"
    && raw.status !== "unknown"
  ) {
    throw malformedTutorControl("request record");
  }
  const commonKeys = [
    "schemaVersion",
    "uid",
    "requestId",
    "inputHash",
    "datasetId",
    "dayId",
    "dayKey",
    "mode",
    "status",
    "reservationNanoUsd",
    "dailyLimit",
    "actualNanoUsd",
    "promptTokens",
    "candidateTokens",
    "thoughtTokens",
    "model",
    "pricingVersion",
    "threadGeneration",
    "expiresAt",
    "createdAt",
    "updatedAt",
  ];
  const statusKeys = raw.status === "reserved"
    ? ["leaseExpiresAtMs"]
    : raw.status === "unknown"
      ? ["unknownAt"]
      : [
        "answer",
        "threadCommitted",
        "costSource",
        "totalTokens",
        "completedAt",
      ];
  const reservationNanoUsd = validNonNegativeInteger(
    raw.reservationNanoUsd,
  );
  const dailyLimit = validPositiveInteger(raw.dailyLimit);
  const actualNanoUsd = validNonNegativeInteger(raw.actualNanoUsd);
  const promptTokens = validNonNegativeInteger(raw.promptTokens);
  const candidateTokens = validNonNegativeInteger(raw.candidateTokens);
  const thoughtTokens = validNonNegativeInteger(raw.thoughtTokens);
  const threadGeneration = validNonNegativeInteger(raw.threadGeneration);
  const createdAtMs = timestampMilliseconds(raw.createdAt);
  const updatedAtMs = timestampMilliseconds(raw.updatedAt);
  const expectedExpiresAtMs = canonicalTutorLedgerExpiry(raw.dayKey);
  const expiresAtMs = timestampMilliseconds(raw.expiresAt);
  if (
    !hasExactKeys(raw, [...commonKeys, ...statusKeys])
    || raw.schemaVersion !== 1
    || raw.uid !== expectedUid
    || raw.requestId !== expectedRequestId
    || !isUuidV4(expectedRequestId)
    || typeof raw.inputHash !== "string"
    || !/^[0-9a-f]{64}$/.test(raw.inputHash)
    || typeof raw.datasetId !== "string"
    || !/^[A-Za-z0-9_-]{8,80}$/.test(raw.datasetId)
    || !Number.isSafeInteger(raw.dayId)
    || (raw.dayId as number) < 1
    || (raw.dayId as number) > 180
    || typeof raw.dayKey !== "string"
    || expectedExpiresAtMs === undefined
    || typeof raw.mode !== "string"
    || !tutorModeSet.has(raw.mode)
    || reservationNanoUsd === undefined
    || reservationNanoUsd !== calculateReservationNanoUsd(
      TUTOR_MODEL_POLICY.maxInputTokens,
      TUTOR_MODEL_POLICY,
    )
    || dailyLimit === undefined
    || dailyLimit > TUTOR_MODEL_POLICY.perUserDailyLimit
    || actualNanoUsd === undefined
    || promptTokens === undefined
    || promptTokens > TUTOR_MODEL_POLICY.maxInputTokens
    || candidateTokens === undefined
    || thoughtTokens === undefined
    || typeof raw.model !== "string"
    || raw.model.length < 1
    || raw.model.length > 100
    || raw.pricingVersion !== TUTOR_MODEL_POLICY.pricingVersion
    || threadGeneration === undefined
    || createdAtMs === undefined
    || canonicalUtcDayKey(createdAtMs) !== raw.dayKey
    || updatedAtMs === undefined
    || updatedAtMs < createdAtMs
    || expiresAtMs !== expectedExpiresAtMs
    || updatedAtMs >= expectedExpiresAtMs
  ) {
    throw malformedTutorControl("request record");
  }

  if (raw.status === "reserved") {
    const leaseExpiresAtMs = validPositiveInteger(raw.leaseExpiresAtMs);
    if (
      actualNanoUsd !== 0
      || promptTokens !== TUTOR_MODEL_POLICY.maxInputTokens
      || candidateTokens !== 0
      || thoughtTokens !== 0
      || raw.model !== TUTOR_MODEL_POLICY.model
      || leaseExpiresAtMs === undefined
      || leaseExpiresAtMs
        !== createdAtMs + TUTOR_MODEL_POLICY.leaseMilliseconds
      || updatedAtMs !== createdAtMs
    ) {
      throw malformedTutorControl("reserved request");
    }
    return {
      ...(raw as Omit<StoredTutorRequest, "leaseExpiresAtMs">),
      schemaVersion: 1,
      status: "reserved",
      leaseExpiresAtMs,
      reservationNanoUsd,
      dailyLimit,
      actualNanoUsd,
      promptTokens,
      candidateTokens,
      thoughtTokens,
      threadGeneration,
      mode: raw.mode as TutorMode,
    };
  }

  if (raw.status === "unknown") {
    const unknownAtMs = timestampMilliseconds(raw.unknownAt);
    if (
      actualNanoUsd !== 0
      || promptTokens !== TUTOR_MODEL_POLICY.maxInputTokens
      || candidateTokens !== 0
      || thoughtTokens !== 0
      || raw.model !== TUTOR_MODEL_POLICY.model
      || unknownAtMs === undefined
      || unknownAtMs < createdAtMs
      || unknownAtMs >= expectedExpiresAtMs
      || updatedAtMs !== unknownAtMs
    ) {
      throw malformedTutorControl("unknown request");
    }
    return {
      ...(raw as StoredTutorRequest),
      schemaVersion: 1,
      status: "unknown",
      reservationNanoUsd,
      dailyLimit,
      actualNanoUsd,
      promptTokens,
      candidateTokens,
      thoughtTokens,
      threadGeneration,
      mode: raw.mode as TutorMode,
    };
  }

  const totalTokens = validNonNegativeInteger(raw.totalTokens);
  const completedAtMs = timestampMilliseconds(raw.completedAt);
  if (
    typeof raw.answer !== "string"
    || raw.answer.length > TUTOR_MODEL_POLICY.maxStoredAnswerCharacters
    || typeof raw.threadCommitted !== "boolean"
    || (
      raw.costSource !== "provider_metadata"
      && raw.costSource !== "reservation_upper_bound"
    )
    || totalTokens === undefined
    || completedAtMs === undefined
    || completedAtMs < createdAtMs
    || completedAtMs >= expectedExpiresAtMs
    || updatedAtMs !== completedAtMs
    || (
      raw.status === "succeeded"
      && raw.answer.trim().length === 0
    )
    || (
      raw.status === "provider_rejected"
      && (raw.answer !== "" || raw.threadCommitted !== false)
    )
    || (
      raw.costSource === "provider_metadata"
      && (
        totalTokens < promptTokens + candidateTokens + thoughtTokens
        || actualNanoUsd !== checkedAdd(
          checkedMultiply(
            promptTokens,
            TUTOR_MODEL_POLICY.inputNanoUsdPerToken,
          ),
          checkedMultiply(
            checkedAdd(candidateTokens, thoughtTokens),
            TUTOR_MODEL_POLICY.outputNanoUsdPerToken,
          ),
        )
      )
    )
    || (
      raw.costSource === "reservation_upper_bound"
      && actualNanoUsd !== reservationNanoUsd
    )
  ) {
    throw malformedTutorControl(`${raw.status} request`);
  }
  return {
    ...(raw as StoredTutorRequest),
    schemaVersion: 1,
    status: raw.status,
    reservationNanoUsd,
    dailyLimit,
    actualNanoUsd,
    promptTokens,
    candidateTokens,
    thoughtTokens,
    totalTokens,
    threadGeneration,
    mode: raw.mode as TutorMode,
    costSource: raw.costSource,
  };
}

function assertStoredRequestMatchesReservation(
  stored: StoredTutorRequest,
  request: ReservedRequest,
): void {
  if (
    stored.uid !== request.uid
    || stored.requestId !== request.requestId
    || stored.inputHash !== request.inputHash
    || stored.datasetId !== request.datasetId
    || stored.dayId !== request.dayId
    || stored.dayKey !== request.dayKey
    || stored.mode !== request.mode
    || stored.reservationNanoUsd !== request.reservationNanoUsd
    || stored.dailyLimit !== request.dailyLimit
    || stored.threadGeneration !== request.threadGeneration
    || (
      stored.status === "reserved"
      && stored.leaseExpiresAtMs !== request.leaseExpiresAtMs
    )
  ) {
    throw malformedTutorControl("request reservation binding");
  }
}

function assertReservationBacking(
  usage: ReturnType<typeof normalizeUsage>,
  global: ReturnType<typeof normalizeGlobal>,
  request: StoredTutorRequest,
  nowMs: number,
): boolean {
  if (
    request.status !== "reserved"
    || request.leaseExpiresAtMs === undefined
    || usage.attempts < 1
    || usage.admitted < 1
    || global.admitted < 1
    || usage.reservedNanoUsd < request.reservationNanoUsd
    || global.reservedNanoUsd < request.reservationNanoUsd
    || global.inFlight < 1
  ) {
    throw malformedTutorControl("request ledger backing");
  }
  const ownsUserLease = usage.activeRequestId === request.requestId;
  if (
    (
      ownsUserLease
      && (
        usage.inFlight !== 1
        || usage.inFlightLeaseExpiresAtMs !== request.leaseExpiresAtMs
      )
    )
    || (
      request.leaseExpiresAtMs > nowMs
      && !ownsUserLease
    )
  ) {
    throw malformedTutorControl("request lease backing");
  }
  return ownsUserLease;
}

function assertExistingRequestBacking(
  usage: ReturnType<typeof normalizeUsage>,
  global: ReturnType<typeof normalizeGlobal>,
  request: StoredTutorRequest,
  nowMs: number,
): void {
  if (request.status === "reserved") {
    assertReservationBacking(usage, global, request, nowMs);
    return;
  }
  if (
    usage.attempts < 1
    || usage.admitted < 1
    || global.admitted < 1
    || (
      request.status === "unknown"
      && (
        usage.reservedNanoUsd < request.reservationNanoUsd
        || global.reservedNanoUsd < request.reservationNanoUsd
      )
    )
    || (
      (
        request.status === "succeeded"
        || request.status === "provider_rejected"
      )
      && (
        usage.actualNanoUsd < request.actualNanoUsd
        || global.actualNanoUsd < request.actualNanoUsd
      )
    )
    || (
      request.status === "succeeded"
      && (usage.successes < 1 || global.successes < 1)
    )
  ) {
    throw malformedTutorControl("request ledger backing");
  }
}

function handleExistingRequest(
  transaction: Transaction,
  requestRef: DocumentReference,
  usageRef: DocumentReference,
  projectionRef: DocumentReference,
  globalRef: DocumentReference,
  existing: Record<string, unknown>,
  usageData: Record<string, unknown> | undefined,
  globalData: Record<string, unknown> | undefined,
  input: TutorReservationInput,
  policy: TutorPolicy,
): ReservationResult {
  const storedRequest = validateStoredTutorRequest(
    existing,
    input.uid,
    input.requestId,
  );
  if (storedRequest.inputHash !== input.inputHash) {
    throw new HttpsError(
      "already-exists",
      "This request ID was already used for different tutor input.",
    );
  }
  if (
    storedRequest.datasetId !== input.datasetId
    || storedRequest.dayId !== input.dayId
    || storedRequest.mode !== input.mode
  ) {
    throw malformedTutorControl("request identity");
  }
  if (storedRequest.dayKey !== input.dayKey) {
    if (storedRequest.status === "succeeded") {
      return {
        kind: "replay",
        answer: answerFromStoredRequest(
          storedRequest,
          usageData,
          input.dayKey,
        ),
      };
    }
    throw new HttpsError(
      "failed-precondition",
      "This request ID belongs to an earlier tutor day. Submit the question with a new request ID.",
    );
  }
  const usage = normalizeUsage(usageData, input.dayKey);
  const global = normalizeGlobal(globalData, input.dayKey);
  assertExistingRequestBacking(
    usage,
    global,
    storedRequest,
    input.now.getTime(),
  );
  if (storedRequest.status === "succeeded") {
    return {
      kind: "replay",
      answer: answerFromStoredRequest(storedRequest, usageData),
    };
  }
  if (
    storedRequest.status === "reserved"
    && storedRequest.leaseExpiresAtMs !== undefined
    && storedRequest.leaseExpiresAtMs <= input.now.getTime()
  ) {
    const ownsUserLease = assertReservationBacking(
      usage,
      global,
      storedRequest,
      input.now.getTime(),
    );
    const nextUsage = {
      ...usage,
      inFlight: ownsUserLease
        ? usage.inFlight - 1
        : usage.inFlight,
      activeRequestId: ownsUserLease ? undefined : usage.activeRequestId,
      inFlightLeaseExpiresAtMs: ownsUserLease
        ? 0
        : usage.inFlightLeaseExpiresAtMs,
      updatedAt: input.now,
    };
    const nextGlobal = {
      ...global,
      inFlight: global.inFlight - 1,
      updatedAt: input.now,
    };
    transaction.update(requestRef, {
      status: "unknown",
      unknownAt: input.now,
      updatedAt: input.now,
      leaseExpiresAtMs: FieldValue.delete(),
    });
    writeUsage(transaction, usageRef, nextUsage);
    transaction.set(globalRef, nextGlobal);
    transaction.set(
      projectionRef,
      usageProjection(nextUsage, policy.perUserDailyLimit),
    );
    return { kind: "unknown" };
  }
  if (storedRequest.status === "reserved") {
    throw new HttpsError(
      "aborted",
      "This tutor request is already in progress.",
    );
  }
  throw new HttpsError(
    "unavailable",
    "The prior outcome of this tutor request is unknown. Use a new question later.",
  );
}

function answerFromStoredRequest(
  data: StoredTutorRequest,
  usageData?: Record<string, unknown>,
  usageDayKey = data.dayKey,
): TutorAnswer {
  if (data.status !== "succeeded" || data.answer === undefined) {
    throw malformedTutorControl("request replay");
  }
  const dailyLimit = data.dailyLimit;
  const usage = normalizeUsage(usageData, usageDayKey);
  return {
    answer: data.answer,
    model: data.model,
    datasetId: data.datasetId,
    requestId: data.requestId,
    threadCommitted: data.threadCommitted === true,
    remainingToday: Math.max(0, dailyLimit - usage.attempts),
    usage: publicUsageSummary(usage, dailyLimit),
  };
}

function appendAnswer(
  thread: StoredTutorThread,
  request: ReservedRequest,
  answer: string,
  model: string,
  updatedAt: number,
): StoredTutorThread {
  const userMessage: StoredTutorMessage = {
    id: `${request.requestId}:user`.slice(0, 100),
    role: "user",
    content: request.question,
    mode: request.mode,
  };
  const assistantMessage: StoredTutorMessage = {
    id: `${request.requestId}:assistant`.slice(0, 100),
    role: "assistant",
    content: answer,
    mode: request.mode,
    model: model.slice(0, 100),
  };
  const messages = [
    ...thread.messages,
    userMessage,
    assistantMessage,
  ].slice(-12);
  return { updatedAt, messages };
}

export function readStoredTutorThread(value: unknown): StoredTutorThread {
  if (value === undefined) {
    return { updatedAt: 0, messages: [] };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("thread history");
  }
  const raw = value as Record<string, unknown>;
  if (
    !hasExactKeys(raw, ["updatedAt", "messages"])
    || validNonNegativeInteger(raw.updatedAt) === undefined
    || !Array.isArray(raw.messages)
    || raw.messages.length > TUTOR_MODEL_POLICY.maxThreadMessages
  ) {
    throw malformedTutorControl("thread history");
  }
  const messages = raw.messages.map((item) => readStoredTutorMessage(item));
  return {
    updatedAt: raw.updatedAt as number,
    messages,
  };
}

function readStoredTutorMessage(value: unknown): StoredTutorMessage {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("thread history");
  }
  const raw = value as Record<string, unknown>;
  if (
    !hasExactKeys(raw, ["id", "role", "content"], ["mode", "model"])
    || typeof raw.id !== "string"
    || raw.id.length < 1
    || raw.id.length > 100
    || (raw.role !== "user" && raw.role !== "assistant")
    || typeof raw.content !== "string"
    || raw.content.length < 1
    || raw.content.length > TUTOR_MODEL_POLICY.maxStoredAnswerCharacters
    || (
      raw.mode !== undefined
      && (typeof raw.mode !== "string" || !tutorModeSet.has(raw.mode))
    )
    || (
      raw.model !== undefined
      && (
        typeof raw.model !== "string"
        || raw.model.length < 1
        || raw.model.length > 100
      )
    )
  ) {
    throw malformedTutorControl("thread history");
  }
  return {
    id: raw.id,
    role: raw.role,
    content: raw.content,
    ...(raw.mode === undefined ? {} : { mode: raw.mode as TutorMode }),
    ...(raw.model === undefined ? {} : { model: raw.model }),
  };
}

function normalizeUsage(value: unknown, dayKey: string) {
  if (value === undefined) {
    return {
      schemaVersion: 1,
      dayKey,
      attempts: 0,
      admitted: 0,
      successes: 0,
      inFlight: 0,
      activeRequestId: undefined,
      inFlightLeaseExpiresAtMs: 0,
      reservedNanoUsd: 0,
      actualNanoUsd: 0,
      expiresAt: tutorLedgerExpiresAt(dayKey),
      updatedAt: undefined,
    };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("user usage ledger");
  }
  const raw = value as Record<string, unknown>;
  const attempts = validNonNegativeInteger(raw.attempts);
  const admitted = validNonNegativeInteger(raw.admitted);
  const successes = validNonNegativeInteger(raw.successes);
  const inFlight = validNonNegativeInteger(raw.inFlight);
  const reservedNanoUsd = validNonNegativeInteger(raw.reservedNanoUsd);
  const actualNanoUsd = validNonNegativeInteger(raw.actualNanoUsd);
  const activeRequestId = typeof raw.activeRequestId === "string"
    && isUuidV4(raw.activeRequestId)
    ? raw.activeRequestId.toLowerCase()
    : undefined;
  const leaseExpiresAtMs = validNonNegativeInteger(
    raw.inFlightLeaseExpiresAtMs,
  );
  const expiresAtMs = timestampMilliseconds(raw.expiresAt);
  const updatedAtMs = timestampMilliseconds(raw.updatedAt);
  const hasLivePointerFields = (
    activeRequestId !== undefined
    && leaseExpiresAtMs !== undefined
    && leaseExpiresAtMs > 0
  );
  const hasNoPointerFields = (
    raw.activeRequestId === undefined
    && raw.inFlightLeaseExpiresAtMs === undefined
  );
  const hasCanonicalKeys = inFlight === 1
    ? hasExactKeys(raw, [
      "schemaVersion",
      "dayKey",
      "attempts",
      "admitted",
      "successes",
      "inFlight",
      "activeRequestId",
      "inFlightLeaseExpiresAtMs",
      "reservedNanoUsd",
      "actualNanoUsd",
      "expiresAt",
      "updatedAt",
    ])
    : hasExactKeys(raw, [
      "schemaVersion",
      "dayKey",
      "attempts",
      "admitted",
      "successes",
      "inFlight",
      "reservedNanoUsd",
      "actualNanoUsd",
      "expiresAt",
      "updatedAt",
    ]);
  if (
    !hasCanonicalKeys
    || raw.schemaVersion !== 1
    || raw.dayKey !== dayKey
    || attempts === undefined
    || admitted === undefined
    || attempts !== admitted
    || successes === undefined
    || inFlight === undefined
    || inFlight > 1
    || admitted > attempts
    || successes > admitted
    || reservedNanoUsd === undefined
    || actualNanoUsd === undefined
    || expiresAtMs !== tutorLedgerExpiresAt(dayKey).getTime()
    || updatedAtMs === undefined
    || updatedAtMs > expiresAtMs
    || (inFlight === 1 && !hasLivePointerFields)
    || (inFlight === 0 && !hasNoPointerFields)
  ) {
    throw malformedTutorControl("user usage ledger");
  }
  return {
    schemaVersion: 1,
    dayKey,
    attempts,
    admitted,
    successes,
    inFlight,
    activeRequestId,
    inFlightLeaseExpiresAtMs: leaseExpiresAtMs ?? 0,
    reservedNanoUsd,
    actualNanoUsd,
    expiresAt: raw.expiresAt,
    updatedAt: raw.updatedAt,
  };
}

export function usageForAdmission(
  value: unknown,
  dayKey: string,
  nowMs: number,
): ReturnType<typeof normalizeUsage> {
  const usage = normalizeUsage(value, dayKey);
  const hasLiveLease = (
    usage.inFlight > 0
    && usage.activeRequestId !== undefined
    && usage.inFlightLeaseExpiresAtMs > nowMs
  );
  if (hasLiveLease) return usage;
  return {
    ...usage,
    inFlight: 0,
    activeRequestId: undefined,
    inFlightLeaseExpiresAtMs: 0,
  };
}

function writeUsage(
  transaction: Transaction,
  reference: DocumentReference,
  usage: ReturnType<typeof normalizeUsage>,
): void {
  transaction.set(reference, {
    ...usage,
    activeRequestId: usage.activeRequestId ?? FieldValue.delete(),
    inFlightLeaseExpiresAtMs: usage.activeRequestId === undefined
      ? FieldValue.delete()
      : usage.inFlightLeaseExpiresAtMs,
  }, { merge: true });
}

function normalizeGlobal(value: unknown, dayKey: string) {
  if (value === undefined) {
    return {
      schemaVersion: 1,
      dayKey,
      admitted: 0,
      successes: 0,
      inFlight: 0,
      reservedNanoUsd: 0,
      actualNanoUsd: 0,
      authorizationLimitNanoUsd:
        TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
      absoluteLimitNanoUsd: TUTOR_MODEL_POLICY.absoluteLimitNanoUsd,
      budgetBreached: false,
      pricingVersion: TUTOR_MODEL_POLICY.pricingVersion,
      expiresAt: tutorLedgerExpiresAt(dayKey),
      updatedAt: undefined,
    };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("global budget ledger");
  }
  const raw = value as Record<string, unknown>;
  const admitted = validNonNegativeInteger(raw.admitted);
  const successes = validNonNegativeInteger(raw.successes);
  const inFlight = validNonNegativeInteger(raw.inFlight);
  const reservedNanoUsd = validNonNegativeInteger(raw.reservedNanoUsd);
  const actualNanoUsd = validNonNegativeInteger(raw.actualNanoUsd);
  const authorizationLimitNanoUsd = validPositiveInteger(
    raw.authorizationLimitNanoUsd,
  );
  const absoluteLimitNanoUsd = validPositiveInteger(
    raw.absoluteLimitNanoUsd,
  );
  const expiresAtMs = timestampMilliseconds(raw.expiresAt);
  const updatedAtMs = timestampMilliseconds(raw.updatedAt);
  if (
    !hasExactKeys(raw, [
      "schemaVersion",
      "dayKey",
      "admitted",
      "successes",
      "inFlight",
      "reservedNanoUsd",
      "actualNanoUsd",
      "authorizationLimitNanoUsd",
      "absoluteLimitNanoUsd",
      "budgetBreached",
      "pricingVersion",
      "expiresAt",
      "updatedAt",
    ])
    || raw.schemaVersion !== 1
    || raw.dayKey !== dayKey
    || admitted === undefined
    || successes === undefined
    || successes > admitted
    || inFlight === undefined
    || inFlight > admitted
    || reservedNanoUsd === undefined
    || actualNanoUsd === undefined
    || authorizationLimitNanoUsd === undefined
    || authorizationLimitNanoUsd
      > TUTOR_MODEL_POLICY.authorizationLimitNanoUsd
    || absoluteLimitNanoUsd !== TUTOR_MODEL_POLICY.absoluteLimitNanoUsd
    || typeof raw.budgetBreached !== "boolean"
    || (
      actualNanoUsd > absoluteLimitNanoUsd
      && raw.budgetBreached !== true
    )
    || raw.pricingVersion !== TUTOR_MODEL_POLICY.pricingVersion
    || expiresAtMs !== tutorLedgerExpiresAt(dayKey).getTime()
    || updatedAtMs === undefined
    || updatedAtMs > expiresAtMs
  ) {
    throw malformedTutorControl("global budget ledger");
  }
  return {
    schemaVersion: 1,
    dayKey,
    admitted,
    successes,
    inFlight,
    reservedNanoUsd,
    actualNanoUsd,
    authorizationLimitNanoUsd,
    absoluteLimitNanoUsd,
    budgetBreached: raw.budgetBreached,
    pricingVersion: raw.pricingVersion,
    expiresAt: raw.expiresAt,
    updatedAt: raw.updatedAt,
  };
}

function usageProjection(
  usage: ReturnType<typeof normalizeUsage>,
  dailyLimit: number,
) {
  return {
    schemaVersion: 1,
    dayKey: usage.dayKey,
    dailyLimit,
    attempts: usage.attempts,
    successes: usage.successes,
    reservedNanoUsd: usage.reservedNanoUsd,
    actualNanoUsd: usage.actualNanoUsd,
    expiresAt: tutorLedgerExpiresAt(usage.dayKey),
    updatedAt: usage.updatedAt,
  };
}

function publicUsageSummary(
  usage: ReturnType<typeof normalizeUsage>,
  dailyLimit: number,
): TutorUsageSummary {
  return {
    dayKey: usage.dayKey,
    dailyLimit,
    attempts: usage.attempts,
    successes: usage.successes,
    reservedNanoUsd: usage.reservedNanoUsd,
    actualNanoUsd: usage.actualNanoUsd,
  };
}

function assertTokenCount(
  value: number,
  maximum: number,
  label: string,
): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > maximum) {
    throw new HttpsError(
      "invalid-argument",
      `${label} exceeds the secure token limit.`,
    );
  }
}

function validNonNegativeInteger(value: unknown): number | undefined {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= 0
    ? value
    : undefined;
}

function validPositiveInteger(value: unknown): number | undefined {
  const parsed = validNonNegativeInteger(value);
  return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

function isUuidV4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(value);
}

function timestampMilliseconds(value: unknown): number | undefined {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.getTime() : undefined;
  }
  if (
    value === null
    || typeof value !== "object"
    || !("toMillis" in value)
    || typeof value.toMillis !== "function"
  ) return undefined;
  try {
    const milliseconds = value.toMillis();
    return Number.isFinite(milliseconds) ? milliseconds : undefined;
  } catch {
    return undefined;
  }
}

function hasExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const allowed = new Set([...required, ...optional]);
  return (
    required.every((key) => Object.hasOwn(value, key))
    && Object.keys(value).every((key) => allowed.has(key))
  );
}

export function readTutorThreadGeneration(value: unknown): number {
  if (value === undefined) return 0;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw malformedTutorControl("thread control");
  }
  const raw = value as Record<string, unknown>;
  const generation = validNonNegativeInteger(raw.generation);
  if (
    !hasExactKeys(raw, ["schemaVersion", "generation", "updatedAt"])
    || raw.schemaVersion !== 1
    || generation === undefined
    || timestampMilliseconds(raw.updatedAt) === undefined
  ) {
    throw malformedTutorControl("thread control");
  }
  return generation;
}

function malformedTutorControl(label: string): HttpsError {
  return new HttpsError(
    "failed-precondition",
    `Tutor ${label} requires administrator repair.`,
  );
}

function checkedMultiply(left: number, right: number): number {
  const value = left * right;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new HttpsError("internal", "Tutor cost calculation overflowed.");
  }
  return value;
}

function checkedAdd(left: number, right: number): number {
  const value = left + right;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new HttpsError("internal", "Tutor cost calculation overflowed.");
  }
  return value;
}

export function tutorLedgerExpiresAt(dayKey: string): Date {
  const expiresAtMs = canonicalTutorLedgerExpiry(dayKey);
  if (expiresAtMs === undefined) {
    throw new HttpsError("internal", "Tutor ledger day is invalid.");
  }
  return new Date(expiresAtMs);
}

function canonicalTutorLedgerExpiry(dayKey: unknown): number | undefined {
  if (typeof dayKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    return undefined;
  }
  const dayStart = Date.parse(`${dayKey}T00:00:00.000Z`);
  if (
    !Number.isFinite(dayStart)
    || canonicalUtcDayKey(dayStart) !== dayKey
  ) {
    return undefined;
  }
  return dayStart
    + DATA_RETENTION_POLICY.tutorLedgerRetentionDays
      * 24 * 60 * 60 * 1_000;
}

function canonicalUtcDayKey(milliseconds: number): string | undefined {
  if (!Number.isFinite(milliseconds)) return undefined;
  try {
    return new Date(milliseconds).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}
