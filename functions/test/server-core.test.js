import assert from "node:assert/strict";
import test from "node:test";

import {
  assertModelLifecycle,
  DATA_RETENTION_POLICY,
  effectiveTutorPolicy,
  FIREBASE_REGION,
  ROBOTSHIFT_WEB_APP_ID,
  TUTOR_MODEL_POLICY,
} from "../lib/config.js";
import {
  canonicalJson,
  computeLegacySourceDigest,
} from "../lib/crypto.js";
import { dataOperationExpiresAt } from "../lib/data-retention.js";
import {
  calculateActualNanoUsd,
  calculateReservationNanoUsd,
  readStoredTutorThread,
  readTutorThreadGeneration,
  tutorLedgerExpiresAt,
  usageForAdmission,
} from "../lib/tutor-quota.js";
import {
  buildTutorPrompt,
  contextForDay,
} from "../lib/tutor-context.js";
import {
  parseLegacyMigrationPayload,
  parseTracker,
  parseTutorStore,
} from "../lib/validation.js";

function migrationFixture() {
  const tracker = {
    schemaVersion: 2,
    curriculumRevision: 2,
    completed: {
      "1:learn": true,
      "180:prove": false,
    },
    bookmarks: [1, 180],
    notes: {
      "1": "Frame notes",
    },
    evidence: {
      "180": "Capstone evidence",
    },
    projectChecks: {
      "frame-lab": [true, false, false, false, false, false],
      "field-capstone": [false, false, false, false],
    },
    startedOn: "2026-07-24",
    weeklyHours: 10,
    selectedDay: 1,
  };
  const tutor = {
    version: 2,
    curriculumRevision: 2,
    threads: {
      "1": {
        updatedAt: 1_753_344_000_000,
        messages: [
          {
            id: "2a73992d-56e6-4743-8018-c089a7cd2b1a",
            role: "user",
            content: "What is a coordinate frame?",
            mode: "ask",
          },
          {
            id: "assistant-1",
            role: "assistant",
            content: "A coordinate frame is a named measuring viewpoint.",
            mode: "ask",
            model: TUTOR_MODEL_POLICY.model,
          },
        ],
      },
    },
  };
  const digestInput = {
    tracker,
    tutor,
    theme: "dark",
    trackerLegacyArchive: "{\"schemaVersion\":1}",
    tutorLegacyArchive: null,
  };

  return {
    ...digestInput,
    sourceDigest: computeLegacySourceDigest(digestInput),
    activateImported: true,
    operationId: "2a73992d-56e6-4743-8018-c089a7cd2b1a",
  };
}

test("Tutor prompt refuses unrelated or general-purpose requests", () => {
  const context = contextForDay(1);
  assert.ok(context);
  const prompt = buildTutorPrompt({
    context,
    mode: "ask",
    history: [],
    question: "Write an unrelated marketing email.",
  });

  assert.match(
    prompt.systemInstruction,
    /Answer only requests grounded in the trusted lesson context above/,
  );
  assert.match(
    prompt.systemInstruction,
    /For an unrelated or general-purpose request, briefly refuse/,
  );
  assert.match(
    prompt.systemInstruction,
    /do not provide the requested unrelated content/,
  );
  assert.equal(
    prompt.contents.at(-1)?.parts[0]?.text,
    "Write an unrelated marketing email.",
  );
});

test("Tutor enforces the Week 8 boundary and opens estimator theory in Week 11", () => {
  const firstFlight = contextForDay(50);
  const estimatorRevisit = contextForDay(71);
  assert.ok(firstFlight);
  assert.ok(estimatorRevisit);
  assert.match(firstFlight.teachingBoundary ?? "", /defer.*Week 11/i);
  assert.match(estimatorRevisit.teachingBoundary ?? "", /theory-and-diagnosis pass/i);

  const firstFlightPrompt = buildTutorPrompt({
    context: firstFlight,
    mode: "ask",
    history: [],
    question: "How should I tune particle resampling today?",
  });
  assert.match(firstFlightPrompt.systemInstruction, /Teaching boundary:/);
  assert.match(firstFlightPrompt.systemInstruction, /Defer particle weighting and resampling/i);
  assert.match(
    firstFlightPrompt.systemInstruction,
    /Respect the teaching boundary.*defer explicitly named internals or tuning/s,
  );

  const revisitPrompt = buildTutorPrompt({
    context: estimatorRevisit,
    mode: "math",
    history: [],
    question: "Explain covariance using the frozen Week 8 run.",
  });
  assert.match(revisitPrompt.systemInstruction, /theory-and-diagnosis pass/i);
  assert.match(revisitPrompt.systemInstruction, /Week 8 artifact identities/i);
});

function expectInvalid(operation, messagePattern) {
  assert.throws(operation, (error) => {
    assert.equal(error?.code, "invalid-argument");
    if (messagePattern) assert.match(error.message, messagePattern);
    return true;
  });
}

test("legacy source digest is canonical, fixed, and sensitive to archived data", () => {
  const input = {
    tracker: {
      schemaVersion: 2,
      completed: {
        "2:build": false,
        "1:learn": true,
      },
    },
    tutor: {
      version: 2,
      threads: {},
    },
    theme: "dark",
    trackerLegacyArchive: "{legacy-tracker}",
    tutorLegacyArchive: null,
  };

  assert.equal(
    canonicalJson({
      tutorLegacyArchive: input.tutorLegacyArchive,
      trackerLegacyArchive: input.trackerLegacyArchive,
      theme: input.theme,
      tutor: input.tutor,
      tracker: input.tracker,
    }),
    "{\"theme\":\"dark\",\"tracker\":{\"completed\":{\"1:learn\":true,\"2:build\":false},\"schemaVersion\":2},\"trackerLegacyArchive\":\"{legacy-tracker}\",\"tutor\":{\"threads\":{},\"version\":2},\"tutorLegacyArchive\":null}",
  );
  assert.equal(
    computeLegacySourceDigest(input),
    "99f517cd5f5c6999e945425c60cc4bbb50f29591ba5c38a25faeefc0ec8d28c5",
  );
  assert.equal(
    computeLegacySourceDigest({
      tutorLegacyArchive: null,
      trackerLegacyArchive: "{legacy-tracker}",
      theme: "dark",
      tutor: {
        threads: {},
        version: 2,
      },
      tracker: {
        completed: {
          "1:learn": true,
          "2:build": false,
        },
        schemaVersion: 2,
      },
    }),
    computeLegacySourceDigest(input),
  );
  assert.notEqual(
    computeLegacySourceDigest({
      ...input,
      trackerLegacyArchive: "{different-legacy-tracker}",
    }),
    computeLegacySourceDigest(input),
  );
});

test("cost reservation uses the prompt count plus the full output allowance", () => {
  assert.equal(
    calculateReservationNanoUsd(2_000, TUTOR_MODEL_POLICY),
    680_000,
  );
  assert.equal(
    calculateReservationNanoUsd(
      TUTOR_MODEL_POLICY.maxInputTokens,
      TUTOR_MODEL_POLICY,
    ),
    1_680_000,
  );

  expectInvalid(
    () => calculateReservationNanoUsd(-1, TUTOR_MODEL_POLICY),
    /secure token limit/i,
  );
  expectInvalid(
    () =>
      calculateReservationNanoUsd(
        TUTOR_MODEL_POLICY.maxInputTokens + 1,
        TUTOR_MODEL_POLICY,
      ),
    /secure token limit/i,
  );
  expectInvalid(
    () => calculateReservationNanoUsd(1.5, TUTOR_MODEL_POLICY),
    /secure token limit/i,
  );
});

test("actual cost trusts internally consistent metadata and otherwise keeps the reservation", () => {
  const reservationNanoUsd = 680_000;
  assert.deepEqual(
    calculateActualNanoUsd({
      promptTokens: 1_000,
      candidateTokens: 250,
      thoughtTokens: 0,
      totalTokens: 1_250,
      reservationNanoUsd,
      policy: TUTOR_MODEL_POLICY,
    }),
    {
      nanoUsd: 200_000,
      source: "provider_metadata",
    },
  );

  for (const invalidMetadata of [
    {
      promptTokens: undefined,
      candidateTokens: 250,
      thoughtTokens: 0,
      totalTokens: 1_250,
    },
    {
      promptTokens: 1_000,
      candidateTokens: 250,
      thoughtTokens: undefined,
      totalTokens: 1_250,
    },
    {
      promptTokens: 1_000,
      candidateTokens: 250,
      thoughtTokens: 10,
      totalTokens: 1_259,
    },
    {
      promptTokens: 1_000,
      candidateTokens: -1,
      thoughtTokens: 0,
      totalTokens: 1_000,
    },
    {
      promptTokens: 1_000.5,
      candidateTokens: 250,
      thoughtTokens: 0,
      totalTokens: 1_250,
    },
  ]) {
    assert.deepEqual(
      calculateActualNanoUsd({
        ...invalidMetadata,
        reservationNanoUsd,
        policy: TUTOR_MODEL_POLICY,
      }),
      {
        nanoUsd: reservationNanoUsd,
        source: "reservation_upper_bound",
      },
    );
  }
});

test("usage admission expires only the in-flight lease state", () => {
  const nowMs = 1_753_344_000_000;
  const activeRequestId = "2a73992d-56e6-4743-8018-c089a7cd2b1a";
  const storedUsage = {
    schemaVersion: 1,
    dayKey: "2026-07-24",
    attempts: 7,
    admitted: 7,
    successes: 5,
    inFlight: 1,
    activeRequestId,
    inFlightLeaseExpiresAtMs: nowMs - 1,
    reservedNanoUsd: 680_000,
    actualNanoUsd: 920_000,
    expiresAt: tutorLedgerExpiresAt("2026-07-24"),
    updatedAt: new Date("2026-07-24T11:59:00.000Z"),
  };

  const expired = usageForAdmission(storedUsage, "2026-07-24", nowMs);
  assert.equal(expired.inFlight, 0);
  assert.equal(expired.activeRequestId, undefined);
  assert.equal(expired.inFlightLeaseExpiresAtMs, 0);
  assert.equal(expired.attempts, storedUsage.attempts);
  assert.equal(expired.reservedNanoUsd, storedUsage.reservedNanoUsd);

  const live = usageForAdmission({
    ...storedUsage,
    inFlightLeaseExpiresAtMs: nowMs + 1,
  }, "2026-07-24", nowMs);
  assert.equal(live.inFlight, 1);
  assert.equal(live.activeRequestId, activeRequestId);
  assert.equal(live.inFlightLeaseExpiresAtMs, nowMs + 1);
  assert.equal(live.attempts, storedUsage.attempts);
  assert.equal(live.reservedNanoUsd, storedUsage.reservedNanoUsd);
});

test("existing malformed user usage fails closed instead of resetting counters", () => {
  const storedUsage = {
    schemaVersion: 1,
    dayKey: "2026-07-24",
    attempts: "10",
    admitted: 10,
    successes: 10,
    inFlight: 0,
    reservedNanoUsd: "799999999",
    actualNanoUsd: "799999999",
    expiresAt: tutorLedgerExpiresAt("2026-07-24"),
    updatedAt: new Date("2026-07-24T11:59:00.000Z"),
  };

  assert.throws(
    () => usageForAdmission(
      storedUsage,
      "2026-07-24",
      Date.parse("2026-07-24T12:00:00.000Z"),
    ),
    (error) => {
      assert.equal(error?.code, "failed-precondition");
      assert.match(error.message, /user usage ledger.*administrator repair/i);
      return true;
    },
  );
  assert.equal(
    usageForAdmission(
      undefined,
      "2026-07-24",
      Date.parse("2026-07-24T12:00:00.000Z"),
    ).attempts,
    0,
  );
  assert.throws(
    () => usageForAdmission(
      {
        schemaVersion: 1,
        dayKey: "2026-07-24",
        attempts: 1,
        admitted: 1,
        successes: 1,
        inFlight: 0,
        reservedNanoUsd: 0,
        actualNanoUsd: 90_000,
        expiresAt: new Date("2026-07-25T00:00:00.000Z"),
        updatedAt: new Date("2026-07-24T12:00:00.000Z"),
      },
      "2026-07-24",
      Date.parse("2026-07-24T12:00:00.000Z"),
    ),
    (error) => error?.code === "failed-precondition",
  );
});

test("Tutor thread history and generation records reject malformed existing state", () => {
  assert.deepEqual(readStoredTutorThread(undefined), {
    updatedAt: 0,
    messages: [],
  });
  assert.deepEqual(
    readStoredTutorThread({
      updatedAt: 0,
      messages: [{
        id: "message-1",
        role: "user",
        content: "What is a frame?",
        mode: "ask",
      }],
    }),
    {
      updatedAt: 0,
      messages: [{
        id: "message-1",
        role: "user",
        content: "What is a frame?",
        mode: "ask",
      }],
    },
  );
  assert.equal(readTutorThreadGeneration(undefined), 0);
  assert.equal(readTutorThreadGeneration({
    schemaVersion: 1,
    generation: 3,
    updatedAt: new Date("2026-07-24T12:00:00.000Z"),
  }), 3);
  for (const malformed of [
    {},
    { updatedAt: 0, messages: [{ id: "bad", role: "assistant", content: 1 }] },
  ]) {
    assert.throws(
      () => readStoredTutorThread(malformed),
      (error) => error?.code === "failed-precondition",
    );
  }
  for (const malformed of [
    {},
    {
      schemaVersion: 1,
      generation: "3",
      updatedAt: new Date("2026-07-24T12:00:00.000Z"),
    },
    {
      schemaVersion: 1,
      generation: 3,
      updatedAt: new Date("2026-07-24T12:00:00.000Z"),
      extra: true,
    },
  ]) {
    assert.throws(
      () => readTutorThreadGeneration(malformed),
      (error) => error?.code === "failed-precondition",
    );
  }
});

test("runtime policy can lower hard limits but malformed overrides fail closed", () => {
  const lowered = effectiveTutorPolicy({
    enabled: false,
    perUserDailyLimit: 4,
    authorizationLimitNanoUsd: 200_000_000,
  });
  assert.equal(lowered.enabled, false);
  assert.equal(lowered.perUserDailyLimit, 4);
  assert.equal(lowered.authorizationLimitNanoUsd, 200_000_000);

  const defaults = effectiveTutorPolicy(undefined);
  assert.equal(defaults.enabled, true);
  assert.equal(
    defaults.authorizationLimitNanoUsd,
    TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
  );
  for (const malformed of [
    {},
    { enabled: "false" },
    { perUserDailyLimit: TUTOR_MODEL_POLICY.perUserDailyLimit + 1 },
    {
      authorizationLimitNanoUsd:
        TUTOR_MODEL_POLICY.authorizationLimitNanoUsd + 1,
    },
    { model: "attacker-selected-model" },
  ]) {
    assert.throws(
      () => effectiveTutorPolicy(malformed),
      /administrator repair/i,
    );
  }
});

test("model, region, and lifecycle constants stay fail-closed", () => {
  assert.equal(FIREBASE_REGION, "asia-south1");
  assert.equal(
    ROBOTSHIFT_WEB_APP_ID,
    "1:847716289197:web:ff9452513c9eb2e0a35424",
  );
  assert.ok(Object.isFrozen(TUTOR_MODEL_POLICY));
  assert.equal(TUTOR_MODEL_POLICY.model, "gemini-2.5-flash-lite");
  assert.equal(TUTOR_MODEL_POLICY.thinkingBudget, 0);
  assert.equal(TUTOR_MODEL_POLICY.inputNanoUsdPerToken, 100);
  assert.equal(TUTOR_MODEL_POLICY.outputNanoUsdPerToken, 400);
  assert.equal(TUTOR_MODEL_POLICY.maxInputTokens, 12_000);
  assert.equal(TUTOR_MODEL_POLICY.maxOutputTokens, 1_200);
  assert.equal(TUTOR_MODEL_POLICY.lifecycleShutdownAt, "2026-10-16T00:00:00.000Z");
  assert.equal(TUTOR_MODEL_POLICY.migrationDeadline, "2026-09-30");
  assert.ok(
    Date.parse(`${TUTOR_MODEL_POLICY.migrationDeadline}T23:59:59.999Z`)
      < Date.parse(TUTOR_MODEL_POLICY.lifecycleShutdownAt),
  );

  assert.doesNotThrow(() =>
    assertModelLifecycle(new Date("2026-10-15T23:59:59.999Z"))
  );
  assert.throws(
    () => assertModelLifecycle(new Date(TUTOR_MODEL_POLICY.lifecycleShutdownAt)),
    /lifecycle deadline/i,
  );
  assert.throws(
    () => assertModelLifecycle(new Date("2026-10-17T00:00:00.000Z")),
    /lifecycle deadline/i,
  );
});

test("data retention and operation throttles stay finite and fail-closed", () => {
  assert.ok(Object.isFrozen(DATA_RETENTION_POLICY));
  assert.deepEqual(DATA_RETENTION_POLICY, {
    destructiveOperationsPerUtcDay: 3,
    minimumDestructiveIntervalMilliseconds: 300_000,
    maxDatasetGenerations: 24,
    maxMigrationArchives: 12,
    maxMigrationArchiveBytes: 20_000_000,
    operationLedgerRetentionDays: 400,
    tutorLedgerRetentionDays: 400,
  });
  assert.equal(
    dataOperationExpiresAt(
      new Date("2026-07-24T12:00:00.000Z"),
    ).toISOString(),
    "2027-08-28T12:00:00.000Z",
  );
  assert.equal(
    tutorLedgerExpiresAt("2026-07-24").toISOString(),
    "2027-08-28T00:00:00.000Z",
  );
  assert.throws(
    () => tutorLedgerExpiresAt("not-a-day"),
    /ledger day is invalid/i,
  );
  assert.throws(
    () => tutorLedgerExpiresAt("2026-02-31"),
    /ledger day is invalid/i,
  );
});

test("strict legacy migration accepts only the complete canonical V2 shape", () => {
  const input = migrationFixture();
  const parsed = parseLegacyMigrationPayload(input);

  assert.deepEqual(parsed, input);
  assert.deepEqual(parseTracker(input.tracker), input.tracker);
  assert.deepEqual(parseTutorStore(input.tutor), input.tutor);

  const staged = {
    ...input,
    activateImported: false,
  };
  delete staged.operationId;
  assert.deepEqual(parseLegacyMigrationPayload(staged), {
    ...staged,
    operationId: null,
  });
});

test("strict migration rejects unsupported, malformed, and oversized envelopes", () => {
  const extraField = {
    ...migrationFixture(),
    unexpected: true,
  };
  expectInvalid(
    () => parseLegacyMigrationPayload(extraField),
    /unsupported fields/i,
  );

  const badDigest = migrationFixture();
  badDigest.sourceDigest = "A".repeat(64);
  expectInvalid(
    () => parseLegacyMigrationPayload(badDigest),
    /source digest/i,
  );

  const badActivation = migrationFixture();
  badActivation.activateImported = "yes";
  expectInvalid(
    () => parseLegacyMigrationPayload(badActivation),
    /activateImported/i,
  );

  const missingOperationId = migrationFixture();
  delete missingOperationId.operationId;
  expectInvalid(
    () => parseLegacyMigrationPayload(missingOperationId),
    /operation ID/i,
  );

  const badOperationId = migrationFixture();
  badOperationId.operationId = "not-a-uuid";
  expectInvalid(
    () => parseLegacyMigrationPayload(badOperationId),
    /operation ID/i,
  );

  const stagedWithOperation = migrationFixture();
  stagedWithOperation.activateImported = false;
  expectInvalid(
    () => parseLegacyMigrationPayload(stagedWithOperation),
    /does not accept an operation ID/i,
  );

  const oversized = migrationFixture();
  oversized.trackerLegacyArchive = "x".repeat(5_000_000);
  expectInvalid(
    () => parseLegacyMigrationPayload(oversized),
    /5 MB limit/i,
  );
});

test("strict tracker migration rejects every relaxed client-controlled boundary", () => {
  const mutations = [
    (input) => {
      input.tracker.unexpected = true;
    },
    (input) => {
      input.tracker.completed["01:learn"] = true;
    },
    (input) => {
      input.tracker.bookmarks = [1, 1];
    },
    (input) => {
      input.tracker.notes["1"] = "x".repeat(5_001);
    },
    (input) => {
      input.tracker.projectChecks["frame-lab"] = [true];
    },
    (input) => {
      input.tracker.startedOn = "2026-02-30";
    },
    (input) => {
      input.tracker.weeklyHours = 31;
    },
    (input) => {
      input.tracker.selectedDay = 181;
    },
  ];

  for (const mutate of mutations) {
    const input = migrationFixture();
    mutate(input);
    expectInvalid(() => parseLegacyMigrationPayload(input));
  }
});

test("strict tutor migration rejects invalid thread and message boundaries", () => {
  const mutations = [
    (input) => {
      input.tutor.threads["01"] = input.tutor.threads["1"];
    },
    (input) => {
      input.tutor.threads = Object.fromEntries(
        Array.from({ length: 15 }, (_, index) => [
          String(index + 1),
          {
            updatedAt: index,
            messages: [],
          },
        ]),
      );
    },
    (input) => {
      input.tutor.threads["1"].messages = Array.from(
        { length: 13 },
        (_, index) => ({
          id: `message-${index}`,
          role: "user",
          content: "question",
        }),
      );
    },
    (input) => {
      input.tutor.threads["1"].messages[0].content = "";
    },
    (input) => {
      input.tutor.threads["1"].messages[0].mode = "untrusted-mode";
    },
    (input) => {
      input.tutor.threads["1"].messages[0].unexpected = true;
    },
  ];

  for (const mutate of mutations) {
    const input = migrationFixture();
    mutate(input);
    expectInvalid(() => parseLegacyMigrationPayload(input));
  }
});
