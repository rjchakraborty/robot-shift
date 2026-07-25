import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import test from "node:test";

import {
  deleteApp,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import {
  DATA_RETENTION_POLICY,
  ROBOTSHIFT_WEB_APP_ID,
  TUTOR_MODEL_POLICY,
} from "../lib/config.js";
import {
  computeLegacySourceDigest,
  sha256Hex,
} from "../lib/crypto.js";
import {
  handleBootstrapUserData,
  handleClearTutorThread,
  handleMigrateLegacyData,
  handleResetUserData,
} from "../lib/data-handlers.js";
import { handleAskTutor } from "../lib/tutor-handler.js";
import {
  calculateReservationNanoUsd,
  markTutorRequestUnknown,
  reserveTutorRequest,
  settleTutorRequest,
} from "../lib/tutor-quota.js";

const projectId = process.env.GCLOUD_PROJECT
  ?? process.env.GOOGLE_CLOUD_PROJECT
  ?? "demo-robotshift";
const firestoreHost = requiredEnvironment("FIRESTORE_EMULATOR_HOST");
requiredEnvironment("FIREBASE_AUTH_EMULATOR_HOST");
const functionsHost = requiredEnvironment("FUNCTIONS_EMULATOR_HOST");

const app = initializeApp(
  { projectId },
  `robotshift-emulator-contracts-${process.pid}`,
);
const auth = getAuth(app);
const database = getFirestore(app);
const fixedNow = new Date("2026-07-24T12:00:00.000Z");
const dayKey = "2026-07-24";
const datasetId = "dataset_contract_20260724";
const reservationNanoUsd = calculateReservationNanoUsd(
  TUTOR_MODEL_POLICY.maxInputTokens,
  TUTOR_MODEL_POLICY,
);
let identitySequence = 0;

test.beforeEach(async () => {
  const response = await fetch(
    `http://${firestoreHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  assert.equal(
    response.ok,
    true,
    `Firestore emulator cleanup failed: ${response.status} ${await response.text()}`,
  );
});

test.after(async () => {
  await database.terminate();
  await deleteApp(app);
});

test("two requests racing for the tenth user credit admit exactly one", async () => {
  const identity = await createVerifiedIdentity("user-boundary");
  await seedTutorAccount(identity.uid);
  const usageRef = userUsageReference(identity.uid, dayKey);
  const globalRef = database.doc(`tutorGlobalDaily/${dayKey}`);
  await Promise.all([
    usageRef.set({
      schemaVersion: 1,
      dayKey,
      attempts: 9,
      admitted: 9,
      successes: 8,
      inFlight: 0,
      reservedNanoUsd: 0,
      actualNanoUsd: 0,
      expiresAt: new Date("2027-08-28T00:00:00.000Z"),
      updatedAt: fixedNow,
    }),
    globalRef.set({
      schemaVersion: 1,
      dayKey,
      admitted: 9,
      successes: 8,
      inFlight: 0,
      reservedNanoUsd: 0,
      actualNanoUsd: 0,
      authorizationLimitNanoUsd:
        TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
      absoluteLimitNanoUsd: TUTOR_MODEL_POLICY.absoluteLimitNanoUsd,
      budgetBreached: false,
      pricingVersion: TUTOR_MODEL_POLICY.pricingVersion,
      expiresAt: new Date("2027-08-28T00:00:00.000Z"),
      updatedAt: fixedNow,
    }),
  ]);

  const first = reservationInput({
    uid: identity.uid,
    requestId: "00000000-0000-4000-8000-000000000001",
    question: "Explain coordinate frames.",
  });
  const second = reservationInput({
    uid: identity.uid,
    requestId: "00000000-0000-4000-8000-000000000002",
    question: "Explain transforms.",
  });
  const results = await Promise.allSettled([
    reserveTutorRequest(database, first),
    reserveTutorRequest(database, second),
  ]);
  const admitted = results.filter(
    (result) =>
      result.status === "fulfilled"
      && result.value.kind === "reserved",
  );
  const rejected = results.filter(
    (result) =>
      result.status === "rejected"
      && result.reason?.code === "resource-exhausted",
  );

  assert.equal(admitted.length, 1);
  assert.equal(rejected.length, 1);
  const usage = (await usageRef.get()).data();
  assert.equal(usage?.attempts, 10);
  assert.equal(usage?.admitted, 10);
  assert.equal(usage?.inFlight, 1);
  assert.equal(usage?.reservedNanoUsd, reservationNanoUsd);
  const requestSnapshots = await database
    .collection(`users/${identity.uid}/tutorRequests`)
    .get();
  assert.equal(requestSnapshots.size, 1);
});

test("successful replay is provider-idempotent and payload substitution is rejected", async () => {
  const identity = await createVerifiedIdentity("replay");
  await seedTutorAccount(identity.uid);
  const calls = {
    countTokens: 0,
    generate: 0,
  };
  const provider = {
    async countTokens() {
      calls.countTokens += 1;
      return 700;
    },
    async generate() {
      calls.generate += 1;
      return {
        answer: "A frame is a named viewpoint for measuring position.",
        finishReason: "STOP",
        model: TUTOR_MODEL_POLICY.model,
        promptTokens: 700,
        candidateTokens: 50,
        thoughtTokens: 0,
        totalTokens: 750,
      };
    },
  };
  const requestId = "00000000-0000-4000-8000-000000000003";
  const request = callableRequest(identity, {
    dayId: 1,
    mode: "ask",
    message: "What is a coordinate frame?",
    requestId,
  });
  const dependencies = {
    database,
    auth,
    provider,
    now: () => fixedNow,
  };

  const first = await handleAskTutor(request, dependencies);
  const replay = await handleAskTutor(request, dependencies);
  assert.deepEqual(replay, first);
  assert.equal(first.threadCommitted, true);
  assert.equal(first.datasetId, datasetId);
  assert.equal(first.requestId, requestId);
  assert.deepEqual(calls, {
    countTokens: 1,
    generate: 1,
  });
  const canonicalThread = await database
    .doc(
      `users/${identity.uid}/datasets/${datasetId}/tutorThreads/1`,
    )
    .get();
  assert.deepEqual(canonicalThread.data(), {
    updatedAt: fixedNow.getTime(),
    messages: [
      {
        id: `${requestId}:user`,
        role: "user",
        content: "What is a coordinate frame?",
        mode: "ask",
      },
      {
        id: `${requestId}:assistant`,
        role: "assistant",
        content: "A frame is a named viewpoint for measuring position.",
        mode: "ask",
        model: TUTOR_MODEL_POLICY.model,
      },
    ],
  });

  await expectHttpsCode(
    handleAskTutor(
      callableRequest(identity, {
        ...request.data,
        message: "Use this reused request ID for different input.",
      }),
      dependencies,
    ),
    "already-exists",
  );
  assert.deepEqual(calls, {
    countTokens: 1,
    generate: 1,
  });

  const usage = (await userUsageReference(identity.uid, dayKey).get()).data();
  assert.equal(usage?.attempts, 1);
  assert.equal(usage?.successes, 1);
  assert.equal(usage?.inFlight, 0);
  assert.equal(usage?.reservedNanoUsd, 0);
  assert.equal(usage?.actualNanoUsd, 250_000);
  const requestSnapshot = await database
    .doc(`users/${identity.uid}/tutorRequests/${requestId}`)
    .get();
  assert.equal(requestSnapshot.data()?.status, "succeeded");
  const [global, projection] = await Promise.all([
    database.doc(`tutorGlobalDaily/${dayKey}`).get(),
    database
      .doc(`users/${identity.uid}/tutorUsageDaily/${dayKey}`)
      .get(),
  ]);
  for (const expiresAt of [
    usage?.expiresAt,
    requestSnapshot.data()?.expiresAt,
    global.data()?.expiresAt,
    projection.data()?.expiresAt,
  ]) {
    assert.equal(
      expiresAt?.toDate().toISOString(),
      "2027-08-28T00:00:00.000Z",
    );
  }

  await requestSnapshot.ref.update({ expiresAt: fixedNow });
  await expectHttpsCode(
    handleAskTutor(request, dependencies),
    "failed-precondition",
  );
  assert.deepEqual(calls, {
    countTokens: 1,
    generate: 1,
  });
});

test("tutor settlement after a concurrent clear returns an uncommitted answer without recreating the thread", async () => {
  const identity = await createVerifiedIdentity("settlement-clear-race");
  await seedTutorAccount(identity.uid);
  const requestId = "00000000-0000-4000-8000-000000000012";
  const controlRef = database.doc(
    `users/${identity.uid}/datasets/${datasetId}/tutorThreadControls/1`,
  );
  const threadRef = database.doc(
    `users/${identity.uid}/datasets/${datasetId}/tutorThreads/1`,
  );
  const provider = {
    async countTokens() {
      return 700;
    },
    async generate() {
      await controlRef.set({
        schemaVersion: 1,
        generation: 1,
        updatedAt: fixedNow,
      });
      return {
        answer: "This answer completed after the user cleared the thread.",
        finishReason: "STOP",
        model: TUTOR_MODEL_POLICY.model,
        promptTokens: 700,
        candidateTokens: 50,
        thoughtTokens: 0,
        totalTokens: 750,
      };
    },
  };

  const answer = await handleAskTutor(
    callableRequest(identity, {
      dayId: 1,
      mode: "ask",
      message: "Explain a frame, then race with clear.",
      requestId,
    }),
    {
      database,
      auth,
      provider,
      now: () => fixedNow,
    },
  );

  assert.equal(answer.threadCommitted, false);
  assert.equal(answer.datasetId, datasetId);
  assert.equal(answer.requestId, requestId);
  assert.equal((await threadRef.get()).exists, false);
  assert.equal((await controlRef.get()).data()?.generation, 1);
  const requestSnapshot = await database
    .doc(`users/${identity.uid}/tutorRequests/${requestId}`)
    .get();
  assert.equal(requestSnapshot.data()?.status, "succeeded");
  assert.equal(requestSnapshot.data()?.threadCommitted, false);
});

test("an expired user lease admits a new request without refunding uncertain spend", async () => {
  const identity = await createVerifiedIdentity("lease");
  await seedTutorAccount(identity.uid);
  const first = await reserveTutorRequest(
    database,
    reservationInput({
      uid: identity.uid,
      requestId: "00000000-0000-4000-8000-000000000004",
      question: "First request with an uncertain outcome.",
    }),
  );
  assert.equal(first.kind, "reserved");
  if (first.kind !== "reserved") return;

  const afterLease = new Date(first.request.leaseExpiresAtMs + 1);
  const second = await reserveTutorRequest(
    database,
    reservationInput({
      uid: identity.uid,
      requestId: "00000000-0000-4000-8000-000000000005",
      question: "Second request after the prior lease expired.",
      now: afterLease,
    }),
  );
  assert.equal(second.kind, "reserved");

  const usage = (await userUsageReference(identity.uid, dayKey).get()).data();
  assert.equal(usage?.attempts, 2);
  assert.equal(usage?.inFlight, 1);
  assert.equal(
    usage?.activeRequestId,
    "00000000-0000-4000-8000-000000000005",
  );
  assert.equal(usage?.reservedNanoUsd, reservationNanoUsd * 2);
  const global = (await database.doc(`tutorGlobalDaily/${dayKey}`).get()).data();
  assert.equal(global?.reservedNanoUsd, reservationNanoUsd * 2);
  const firstStored = await database
    .doc(
      `users/${identity.uid}/tutorRequests/00000000-0000-4000-8000-000000000004`,
    )
    .get();
  assert.equal(firstStored.data()?.status, "reserved");
});

test("a stored lower global authorization boundary remains fail-closed", async () => {
  const identity = await createVerifiedIdentity("global-boundary");
  await seedTutorAccount(identity.uid);
  const globalRef = database.doc(`tutorGlobalDaily/${dayKey}`);
  const storedAuthorizationLimitNanoUsd = reservationNanoUsd * 2;
  const committedBefore =
    storedAuthorizationLimitNanoUsd - reservationNanoUsd + 1;
  await globalRef.set({
    schemaVersion: 1,
    dayKey,
    admitted: 400,
    successes: 399,
    inFlight: 0,
    reservedNanoUsd: 0,
    actualNanoUsd: committedBefore,
    authorizationLimitNanoUsd: storedAuthorizationLimitNanoUsd,
    absoluteLimitNanoUsd: TUTOR_MODEL_POLICY.absoluteLimitNanoUsd,
    budgetBreached: false,
    pricingVersion: TUTOR_MODEL_POLICY.pricingVersion,
    expiresAt: new Date("2027-08-28T00:00:00.000Z"),
    updatedAt: fixedNow,
  });
  const requestId = "00000000-0000-4000-8000-000000000006";

  await expectHttpsCode(
    reserveTutorRequest(
      database,
      reservationInput({
        uid: identity.uid,
        requestId,
        question: "This request must not cross the shared budget.",
      }),
    ),
    "resource-exhausted",
  );

  const global = (await globalRef.get()).data();
  assert.equal(global?.actualNanoUsd, committedBefore);
  assert.equal(global?.reservedNanoUsd, 0);
  assert.equal(
    global?.authorizationLimitNanoUsd,
    storedAuthorizationLimitNanoUsd,
  );
  assert.equal(
    (
      await database
        .doc(`users/${identity.uid}/tutorRequests/${requestId}`)
        .get()
    ).exists,
    false,
  );
  assert.equal(
    (await userUsageReference(identity.uid, dayKey).get()).exists,
    false,
  );
});

test("malformed existing tutor controls fail closed before provider calls or writes", async () => {
  const runtimeRef = database.doc("systemConfig/tutor");
  const globalRef = database.doc(`tutorGlobalDaily/${dayKey}`);
  const scenarios = [
    {
      label: "runtime",
      corrupt: async () => {
        await runtimeRef.set({
          enabled: "false",
          perUserDailyLimit: TUTOR_MODEL_POLICY.perUserDailyLimit,
          authorizationLimitNanoUsd:
            TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
        });
        return runtimeRef;
      },
    },
    {
      label: "entitlement",
      corrupt: async (uid) => {
        const reference = database.doc(`tutorEntitlements/${uid}`);
        await reference.set({
          schemaVersion: 1,
          status: "active",
          plan: "free",
          dailyTutorLimit: "10",
          createdAt: fixedNow,
          updatedAt: fixedNow,
        });
        return reference;
      },
    },
    {
      label: "usage",
      corrupt: async (uid) => {
        const reference = userUsageReference(uid, dayKey);
        await reference.set({
          schemaVersion: 1,
          dayKey,
          attempts: "10",
          admitted: 10,
          successes: 10,
          inFlight: 0,
          reservedNanoUsd: "799999999",
          actualNanoUsd: "799999999",
          expiresAt: new Date("2027-08-28T00:00:00.000Z"),
          updatedAt: fixedNow,
        });
        return reference;
      },
    },
    {
      label: "usage-ttl",
      corrupt: async (uid) => {
        const reference = userUsageReference(uid, dayKey);
        await reference.set({
          schemaVersion: 1,
          dayKey,
          attempts: 1,
          admitted: 1,
          successes: 1,
          inFlight: 0,
          reservedNanoUsd: 0,
          actualNanoUsd: 90_000,
          expiresAt: fixedNow,
          updatedAt: fixedNow,
        });
        return reference;
      },
    },
    {
      label: "global",
      corrupt: async () => {
        await globalRef.set({
          schemaVersion: 1,
          dayKey,
          admitted: 400,
          successes: 399,
          inFlight: 0,
          reservedNanoUsd: 0,
          actualNanoUsd: "799999999",
          authorizationLimitNanoUsd:
            TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
          absoluteLimitNanoUsd: TUTOR_MODEL_POLICY.absoluteLimitNanoUsd,
          budgetBreached: false,
          pricingVersion: TUTOR_MODEL_POLICY.pricingVersion,
          expiresAt: new Date("2027-08-28T00:00:00.000Z"),
          updatedAt: fixedNow,
        });
        return globalRef;
      },
    },
    {
      label: "thread-control",
      corrupt: async (uid) => {
        const reference = database.doc(
          `users/${uid}/datasets/${datasetId}/tutorThreadControls/1`,
        );
        await reference.set({
          schemaVersion: 1,
          generation: "0",
          updatedAt: fixedNow,
        });
        return reference;
      },
    },
    {
      label: "thread-history",
      corrupt: async (uid) => {
        const reference = database.doc(
          `users/${uid}/datasets/${datasetId}/tutorThreads/1`,
        );
        await reference.set({
          updatedAt: fixedNow.getTime(),
          messages: [{
            id: "corrupt",
            role: "assistant",
            content: 123,
          }],
        });
        return reference;
      },
    },
  ];

  for (const [index, scenario] of scenarios.entries()) {
    await Promise.all([runtimeRef.delete(), globalRef.delete()]);
    const identity = await createVerifiedIdentity(
      `malformed-tutor-${scenario.label}`,
    );
    await seedTutorAccount(identity.uid);
    const corruptedRef = await scenario.corrupt(identity.uid);
    const before = (await corruptedRef.get()).data();
    const calls = { countTokens: 0, generate: 0 };
    const requestId =
      `00000000-0000-4000-8000-${String(index + 20).padStart(12, "0")}`;
    const provider = {
      async countTokens() {
        calls.countTokens += 1;
        return 700;
      },
      async generate() {
        calls.generate += 1;
        return {
          answer: "This provider must not be called.",
          finishReason: "STOP",
          model: TUTOR_MODEL_POLICY.model,
          promptTokens: 700,
          candidateTokens: 10,
          thoughtTokens: 0,
          totalTokens: 710,
        };
      },
    };

    await expectHttpsCode(
      handleAskTutor(
        callableRequest(identity, {
          dayId: 1,
          mode: "ask",
          message: `Reject malformed ${scenario.label} state.`,
          requestId,
        }),
        {
          database,
          auth,
          provider,
          now: () => fixedNow,
        },
      ),
      "failed-precondition",
    );
    assert.deepEqual(calls, { countTokens: 0, generate: 0 });
    assert.deepEqual((await corruptedRef.get()).data(), before);
    assert.equal(
      (
        await database
          .doc(`users/${identity.uid}/tutorRequests/${requestId}`)
          .get()
      ).exists,
      false,
    );
    assert.equal(
      (
        await database
          .doc(`users/${identity.uid}/tutorUsageDaily/${dayKey}`)
          .get()
      ).exists,
      false,
    );
  }
});

test("malformed request lease cannot be normalized into an expired unknown request", async () => {
  const identity = await createVerifiedIdentity("malformed-request-lease");
  await seedTutorAccount(identity.uid);
  const input = reservationInput({
    uid: identity.uid,
    requestId: "00000000-0000-4000-8000-000000000060",
    question: "Keep a malformed request fail closed.",
  });
  const reservation = await reserveTutorRequest(database, input);
  assert.equal(reservation.kind, "reserved");
  if (reservation.kind !== "reserved") return;

  const requestRef = database.doc(
    `users/${identity.uid}/tutorRequests/${input.requestId}`,
  );
  const usageRef = userUsageReference(identity.uid, dayKey);
  const globalRef = database.doc(`tutorGlobalDaily/${dayKey}`);
  const projectionRef = database.doc(
    `users/${identity.uid}/tutorUsageDaily/${dayKey}`,
  );
  await requestRef.update({ leaseExpiresAtMs: 0 });
  const before = await Promise.all([
    requestRef.get(),
    usageRef.get(),
    globalRef.get(),
    projectionRef.get(),
  ]);

  await expectHttpsCode(
    reserveTutorRequest(database, {
      ...input,
      now: new Date(reservation.request.leaseExpiresAtMs + 1),
    }),
    "failed-precondition",
  );
  const after = await Promise.all([
    requestRef.get(),
    usageRef.get(),
    globalRef.get(),
    projectionRef.get(),
  ]);
  assert.deepEqual(
    after.map((snapshot) => snapshot.data()),
    before.map((snapshot) => snapshot.data()),
  );
});

test("settlement and unknown cleanup reject underfunded reservation ledgers without mutation", async () => {
  const settlementIdentity = await createVerifiedIdentity(
    "underfunded-settlement",
  );
  await seedTutorAccount(settlementIdentity.uid);
  const settlement = await reserveTutorRequest(
    database,
    reservationInput({
      uid: settlementIdentity.uid,
      requestId: "00000000-0000-4000-8000-000000000061",
      question: "Do not mask an underfunded settlement.",
    }),
  );
  assert.equal(settlement.kind, "reserved");
  if (settlement.kind !== "reserved") return;
  const settlementUsageRef = userUsageReference(
    settlementIdentity.uid,
    dayKey,
  );
  const settlementRequestRef = database.doc(
    `users/${settlementIdentity.uid}/tutorRequests/${settlement.request.requestId}`,
  );
  const settlementGlobalRef = database.doc(`tutorGlobalDaily/${dayKey}`);
  await settlementUsageRef.update({ reservedNanoUsd: 0 });
  const settlementBefore = await Promise.all([
    settlementRequestRef.get(),
    settlementUsageRef.get(),
    settlementGlobalRef.get(),
  ]);
  await expectHttpsCode(
    settleTutorRequest(database, {
      request: settlement.request,
      answer: "This answer must not commit.",
      model: TUTOR_MODEL_POLICY.model,
      usable: true,
      promptTokens: 700,
      candidateTokens: 50,
      thoughtTokens: 0,
      totalTokens: 750,
      now: fixedNow,
    }),
    "failed-precondition",
  );
  const settlementAfter = await Promise.all([
    settlementRequestRef.get(),
    settlementUsageRef.get(),
    settlementGlobalRef.get(),
  ]);
  assert.deepEqual(
    settlementAfter.map((snapshot) => snapshot.data()),
    settlementBefore.map((snapshot) => snapshot.data()),
  );

  const unknownIdentity = await createVerifiedIdentity("underfunded-unknown");
  await seedTutorAccount(unknownIdentity.uid);
  const unknown = await reserveTutorRequest(
    database,
    reservationInput({
      uid: unknownIdentity.uid,
      requestId: "00000000-0000-4000-8000-000000000062",
      question: "Do not mask an underfunded unknown cleanup.",
    }),
  );
  assert.equal(unknown.kind, "reserved");
  if (unknown.kind !== "reserved") return;
  const unknownUsageRef = userUsageReference(unknownIdentity.uid, dayKey);
  const unknownRequestRef = database.doc(
    `users/${unknownIdentity.uid}/tutorRequests/${unknown.request.requestId}`,
  );
  await settlementGlobalRef.update({
    reservedNanoUsd: unknown.request.reservationNanoUsd - 1,
  });
  const unknownBefore = await Promise.all([
    unknownRequestRef.get(),
    unknownUsageRef.get(),
    settlementGlobalRef.get(),
  ]);
  await expectHttpsCode(
    markTutorRequestUnknown(database, unknown.request, fixedNow),
    "failed-precondition",
  );
  const unknownAfter = await Promise.all([
    unknownRequestRef.get(),
    unknownUsageRef.get(),
    settlementGlobalRef.get(),
  ]);
  assert.deepEqual(
    unknownAfter.map((snapshot) => snapshot.data()),
    unknownBefore.map((snapshot) => snapshot.data()),
  );
});

test("clear Tutor thread rejects malformed history, malformed control, and generation overflow", async () => {
  const identity = await createVerifiedIdentity("strict-thread-clear");
  await seedTutorAccount(identity.uid);
  const threadRef = database.doc(
    `users/${identity.uid}/datasets/${datasetId}/tutorThreads/1`,
  );
  const controlRef = database.doc(
    `users/${identity.uid}/datasets/${datasetId}/tutorThreadControls/1`,
  );
  const request = callableRequest(identity, { dayId: 1 });
  const dependencies = dataDependencies(fixedNow);
  const scenarios = [
    {
      thread: {
        updatedAt: fixedNow.getTime(),
        messages: [{ id: "bad", role: "assistant", content: 123 }],
      },
      control: undefined,
    },
    {
      thread: { updatedAt: fixedNow.getTime(), messages: [] },
      control: {
        schemaVersion: 1,
        generation: "0",
        updatedAt: fixedNow,
      },
    },
    {
      thread: { updatedAt: fixedNow.getTime(), messages: [] },
      control: {
        schemaVersion: 1,
        generation: Number.MAX_SAFE_INTEGER,
        updatedAt: fixedNow,
      },
    },
  ];

  for (const scenario of scenarios) {
    await threadRef.set(scenario.thread);
    if (scenario.control === undefined) {
      await controlRef.delete();
    } else {
      await controlRef.set(scenario.control);
    }
    const before = await Promise.all([threadRef.get(), controlRef.get()]);
    await expectHttpsCode(
      handleClearTutorThread(request, dependencies),
      "failed-precondition",
    );
    const after = await Promise.all([threadRef.get(), controlRef.get()]);
    assert.deepEqual(
      after.map((snapshot) => snapshot.data()),
      before.map((snapshot) => snapshot.data()),
    );
  }
});

test("bootstrap self-heals Auth-owned profile fields without replacing the active dataset", async () => {
  const identity = await createVerifiedIdentity("bootstrap-self-heal");
  await seedTutorAccount(identity.uid);
  await database.doc(`accountAccess/${identity.uid}`).delete();
  const userRef = database.doc(`users/${identity.uid}`);
  await userRef.set({
    email: "stale-email@robotshift.test",
    displayName: "Stale Display Name",
  }, { merge: true });
  const before = (await userRef.get()).data();
  const beforeCreatedAt = before?.createdAt?.toMillis();

  const result = await invokeCallable(
    "bootstrapUserData",
    identity,
    {},
  );
  const after = (await userRef.get()).data();

  assert.deepEqual(result, { datasetId });
  assert.equal(after?.currentDatasetId, datasetId);
  assert.equal(after?.createdAt?.toMillis(), beforeCreatedAt);
  assert.equal(after?.email, identity.email);
  assert.equal(after?.displayName, "Contract Tester");
  const access = (await database.doc(`accountAccess/${identity.uid}`).get())
    .data();
  assert.equal(access?.schemaVersion, 1);
  assert.equal(access?.uid, identity.uid);
  assert.equal(access?.active, true);
  assert.ok(Number.isSafeInteger(access?.authValidAfterSeconds));
  assert.ok(access?.validUntil?.toMillis() > Date.now());
});

test("bootstrap never lowers a cutoff or renews a revoked old session", async () => {
  const identity = await createVerifiedIdentity("bootstrap-revoked-token");
  await seedTutorAccount(identity.uid);
  const accessRef = database.doc(`accountAccess/${identity.uid}`);
  const oldAuthTime = identity.authTime;
  const cutoff = oldAuthTime + 60;
  const originalLease = new Date(fixedNow.getTime() + 2 * 60_000);
  await accessRef.set({
    schemaVersion: 1,
    uid: identity.uid,
    active: true,
    authValidAfterSeconds: cutoff,
    validUntil: originalLease,
    createdAt: fixedNow,
    updatedAt: fixedNow,
  });

  await expectHttpsCode(
    handleBootstrapUserData(
      callableRequest(identity, {}, oldAuthTime),
      { database, auth, now: () => fixedNow },
    ),
    "permission-denied",
  );
  const afterOldToken = (await accessRef.get()).data();
  assert.equal(afterOldToken?.authValidAfterSeconds, cutoff);
  assert.equal(afterOldToken?.validUntil?.toMillis(), originalLease.getTime());

  const result = await handleBootstrapUserData(
    callableRequest(identity, {}, cutoff),
    { database, auth, now: () => fixedNow },
  );
  assert.deepEqual(result, { datasetId });
  const afterCurrentToken = (await accessRef.get()).data();
  assert.equal(afterCurrentToken?.authValidAfterSeconds, cutoff);
  assert.equal(
    afterCurrentToken?.validUntil?.toMillis(),
    fixedNow.getTime() + 15 * 60_000,
  );

  await accessRef.set({ active: false }, { merge: true });
  await expectHttpsCode(
    handleBootstrapUserData(
      callableRequest(identity, {}, cutoff),
      { database, auth, now: () => fixedNow },
    ),
    "permission-denied",
  );
  assert.equal((await accessRef.get()).data()?.active, false);
});

test("revoked account access blocks Tutor before any provider call", async () => {
  const identity = await createVerifiedIdentity("tutor-revoked");
  await seedTutorAccount(identity.uid);
  await database.doc(`accountAccess/${identity.uid}`).set({
    active: false,
    updatedAt: fixedNow,
  }, { merge: true });
  const calls = { countTokens: 0, generate: 0 };
  const provider = {
    async countTokens() {
      calls.countTokens += 1;
      return 1;
    },
    async generate() {
      calls.generate += 1;
      throw new Error("Provider must not run for revoked access.");
    },
  };

  await expectHttpsCode(
    handleAskTutor(
      callableRequest(identity, {
        dayId: 1,
        mode: "ask",
        message: "This request must be rejected before Gemini.",
        requestId: "00000000-0000-4000-8000-000000000037",
      }),
      { database, auth, provider, now: () => fixedNow },
    ),
    "permission-denied",
  );
  assert.deepEqual(calls, { countTokens: 0, generate: 0 });
});

test("live Auth revocation blocks Tutor and data callables before an active lease expires", async () => {
  const identity = await createVerifiedIdentity("live-auth-revocation");
  await seedTutorAccount(identity.uid);
  await auth.revokeRefreshTokens(identity.uid);
  const revokedUser = await auth.getUser(identity.uid);
  const liveCutoff = Math.floor(
    Date.parse(revokedUser.tokensValidAfterTime) / 1_000,
  );
  assert.ok(Number.isSafeInteger(liveCutoff) && liveCutoff > 0);
  const revokedAuthTime = liveCutoff - 1;
  const leaseExpiresAt = new Date(fixedNow.getTime() + 10 * 60_000);
  await database.doc(`accountAccess/${identity.uid}`).set({
    schemaVersion: 1,
    uid: identity.uid,
    active: true,
    authValidAfterSeconds: revokedAuthTime,
    validUntil: leaseExpiresAt,
    createdAt: fixedNow,
    updatedAt: fixedNow,
  });
  const calls = { countTokens: 0, generate: 0 };
  const provider = {
    async countTokens() {
      calls.countTokens += 1;
      return 1;
    },
    async generate() {
      calls.generate += 1;
      throw new Error("Provider must not run for a revoked Auth session.");
    },
  };
  const request = (data) => callableRequest(
    identity,
    data,
    revokedAuthTime,
  );

  await expectHttpsCode(
    handleAskTutor(
      request({
        dayId: 1,
        mode: "ask",
        message: "Explain this lesson.",
        requestId: "00000000-0000-4000-8000-000000000038",
      }),
      { database, auth, provider, now: () => fixedNow },
    ),
    "permission-denied",
  );
  await expectHttpsCode(
    handleResetUserData(
      request({
        operationId: "00000000-0000-4000-8000-000000000039",
      }),
      dataDependencies(fixedNow),
    ),
    "permission-denied",
  );
  await expectHttpsCode(
    handleMigrateLegacyData(
      request(migrationFixture()),
      dataDependencies(fixedNow),
    ),
    "permission-denied",
  );
  await expectHttpsCode(
    handleClearTutorThread(
      request({ dayId: 1 }),
      dataDependencies(fixedNow),
    ),
    "permission-denied",
  );

  const access = (await database.doc(`accountAccess/${identity.uid}`).get())
    .data();
  assert.equal(access?.active, true);
  assert.equal(access?.validUntil?.toMillis(), leaseExpiresAt.getTime());
  assert.ok(access.validUntil.toMillis() > fixedNow.getTime());
  assert.deepEqual(calls, { countTokens: 0, generate: 0 });
});

test("concurrent callable migration with one digest commits one idempotent dataset", async () => {
  const identity = await createVerifiedIdentity("migration");
  const payload = migrationFixture();
  const [first, second] = await Promise.all([
    invokeCallable("migrateLegacyData", identity, payload),
    invokeCallable("migrateLegacyData", identity, payload),
  ]);

  assert.deepEqual(first, second);
  assert.equal(first.migrated, true);
  assert.equal(first.retainedCloudData, false);
  assert.match(first.datasetId, /^import_[a-f0-9]{40}$/);
  const user = (await database.doc(`users/${identity.uid}`).get()).data();
  assert.equal(user?.currentDatasetId, first.datasetId);
  const receipt = await database
    .doc(
      `users/${identity.uid}/migrationReceipts/${payload.sourceDigest}`,
    )
    .get();
  assert.equal(receipt.data()?.status, "complete");
  assert.equal(receipt.data()?.importedDatasetId, first.datasetId);
  const datasets = await database
    .collection(`users/${identity.uid}/datasets`)
    .get();
  assert.equal(datasets.size, 1);
  const state = await database
    .doc(
      `users/${identity.uid}/datasets/${first.datasetId}/course/state`,
    )
    .get();
  assert.deepEqual(state.data()?.completed, {
    "1:learn": true,
  });
});

test("concurrent explicit restore with one operation creates one generation and one operation", async () => {
  const identity = await createVerifiedIdentity("restore-concurrent");
  const operationId = "00000000-0000-4000-8000-000000000007";
  const payload = backupRestoreFixture(operationId);
  const [first, second] = await Promise.all([
    invokeCallable("migrateLegacyData", identity, payload),
    invokeCallable("migrateLegacyData", identity, payload),
  ]);

  assert.deepEqual(first, second);
  assert.equal(first.migrated, true);
  assert.equal(first.retainedCloudData, false);
  assert.match(first.datasetId, /^restore_[a-f0-9]{40}$/);

  const retry = await invokeCallable(
    "migrateLegacyData",
    identity,
    payload,
  );
  assert.deepEqual(retry, first);

  const [datasets, operations, archives] = await Promise.all([
    database.collection(`users/${identity.uid}/datasets`).get(),
    database.collection(`users/${identity.uid}/dataOperations`).get(),
    database.collection(`users/${identity.uid}/migrationArchives`).get(),
  ]);
  assert.equal(datasets.size, 1);
  assert.equal(operations.size, 1);
  assert.equal(archives.size, 1);
  assert.equal(datasets.docs[0]?.id, first.datasetId);
  const storedOperation = operations.docs[0]?.data();
  assert.equal(
    storedOperation?.expiresAt?.toMillis()
      - storedOperation?.createdAt?.toMillis(),
    DATA_RETENTION_POLICY.operationLedgerRetentionDays
      * 24 * 60 * 60 * 1_000,
  );
  assert.equal(
    operations.docs[0]?.data()?.retentionClass,
    "dataset-linked-idempotency",
  );
  assert.deepEqual(
    operationContract(operations.docs[0]?.data()),
    {
      operationId,
      kind: "restore",
      status: "complete",
      sourceDigest: payload.sourceDigest,
      sourceDatasetId: null,
      datasetId: first.datasetId,
    },
  );
  await assertImportedDataset(
    identity.uid,
    first.datasetId,
    payload,
    "active",
  );
});

test("an expired restore operation record fails closed against its retained deterministic generation", async () => {
  const identity = await createVerifiedIdentity("restore-expired-operation");
  const operationId = "00000000-0000-4000-8000-000000000036";
  const payload = backupRestoreFixture(operationId);
  const first = await handleMigrateLegacyData(
    callableRequest(identity, payload),
    dataDependencies(fixedNow),
  );
  const operationRef = database.doc(
    `users/${identity.uid}/dataOperations/${operationId}`,
  );
  await operationRef.delete();

  await expectHttpsCode(
    handleMigrateLegacyData(
      callableRequest(identity, payload),
      dataDependencies(new Date("2027-08-29T12:00:00.000Z")),
    ),
    "data-loss",
  );
  const datasets = await database
    .collection(`users/${identity.uid}/datasets`)
    .get();
  assert.equal(datasets.size, 1);
  assert.equal(datasets.docs[0]?.id, first.datasetId);
  assert.equal((await operationRef.get()).exists, false);
});

test("a new restore operation for the same digest creates a distinct active generation", async () => {
  const identity = await createVerifiedIdentity("restore-generations");
  const firstOperationId = "00000000-0000-4000-8000-000000000008";
  const secondOperationId = "00000000-0000-4000-8000-000000000009";
  const firstPayload = backupRestoreFixture(firstOperationId);
  const secondPayload = backupRestoreFixture(secondOperationId);
  assert.equal(firstPayload.sourceDigest, secondPayload.sourceDigest);

  const first = await handleMigrateLegacyData(
    callableRequest(identity, firstPayload),
    dataDependencies(fixedNow),
  );
  const secondNow = new Date(
    fixedNow.getTime()
      + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
  );
  const second = await handleMigrateLegacyData(
    callableRequest(identity, secondPayload),
    dataDependencies(secondNow),
  );

  assert.notEqual(first.datasetId, second.datasetId);
  assert.match(first.datasetId, /^restore_[a-f0-9]{40}$/);
  assert.match(second.datasetId, /^restore_[a-f0-9]{40}$/);
  const user = (await database.doc(`users/${identity.uid}`).get()).data();
  assert.equal(user?.currentDatasetId, second.datasetId);
  assert.equal(user?.originalMigrationArchiveId, first.datasetId);
  await assertImportedDataset(
    identity.uid,
    first.datasetId,
    firstPayload,
    "archived",
  );
  await assertImportedDataset(
    identity.uid,
    second.datasetId,
    secondPayload,
    "active",
  );

  const [operations, datasets] = await Promise.all([
    database.collection(`users/${identity.uid}/dataOperations`).get(),
    database.collection(`users/${identity.uid}/datasets`).get(),
  ]);
  assert.equal(operations.size, 2);
  assert.equal(datasets.size, 2);
  assert.deepEqual(
    operationContract(
      operations.docs.find((entry) => entry.id === secondOperationId)?.data(),
    ),
    {
      operationId: secondOperationId,
      kind: "restore",
      status: "complete",
      sourceDigest: secondPayload.sourceDigest,
      sourceDatasetId: first.datasetId,
      datasetId: second.datasetId,
    },
  );
});

test("successive reset operations archive every dirty generation without reactivation", async () => {
  const identity = await createVerifiedIdentity("reset-generations");
  await seedTutorAccount(identity.uid);
  await seedDirtyCourseState(identity.uid, datasetId, "1:learn");
  const firstOperationId = "00000000-0000-4000-8000-000000000010";
  const secondOperationId = "00000000-0000-4000-8000-000000000011";

  const first = await handleResetUserData(
    callableRequest(identity, { operationId: firstOperationId }),
    dataDependencies(fixedNow),
  );
  assert.match(first.datasetId, /^reset_[a-f0-9]{40}$/);
  assert.notEqual(first.datasetId, datasetId);
  await seedDirtyCourseState(
    identity.uid,
    first.datasetId,
    "2:build",
  );

  const secondNow = new Date(
    fixedNow.getTime()
      + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
  );
  const second = await handleResetUserData(
    callableRequest(identity, { operationId: secondOperationId }),
    dataDependencies(secondNow),
  );
  assert.match(second.datasetId, /^reset_[a-f0-9]{40}$/);
  assert.notEqual(second.datasetId, first.datasetId);
  const secondRetry = await handleResetUserData(
    callableRequest(identity, { operationId: secondOperationId }),
    dataDependencies(secondNow),
  );
  assert.deepEqual(secondRetry, second);

  const firstRetryAfterSecond = await handleResetUserData(
    callableRequest(identity, { operationId: firstOperationId }),
    dataDependencies(secondNow),
  );
  assert.deepEqual(firstRetryAfterSecond, first);

  const [user, original, firstReset, secondReset, datasets, operations] =
    await Promise.all([
      database.doc(`users/${identity.uid}`).get(),
      database.doc(`users/${identity.uid}/datasets/${datasetId}`).get(),
      database
        .doc(`users/${identity.uid}/datasets/${first.datasetId}`)
        .get(),
      database
        .doc(`users/${identity.uid}/datasets/${second.datasetId}`)
        .get(),
      database.collection(`users/${identity.uid}/datasets`).get(),
      database.collection(`users/${identity.uid}/dataOperations`).get(),
    ]);
  assert.equal(user.data()?.currentDatasetId, second.datasetId);
  assert.equal(original.data()?.status, "archived");
  assert.equal(firstReset.data()?.status, "archived");
  assert.equal(secondReset.data()?.status, "active");
  assert.equal(datasets.size, 3);
  assert.equal(operations.size, 2);
  await assertDefaultDataset(identity.uid, second.datasetId);

  assert.deepEqual(
    operationContract(
      operations.docs.find((entry) => entry.id === firstOperationId)?.data(),
    ),
    {
      operationId: firstOperationId,
      kind: "reset",
      status: "complete",
      sourceDigest: undefined,
      sourceDatasetId: datasetId,
      datasetId: first.datasetId,
    },
  );
  assert.deepEqual(
    operationContract(
      operations.docs.find((entry) => entry.id === secondOperationId)?.data(),
    ),
    {
      operationId: secondOperationId,
      kind: "reset",
      status: "complete",
      sourceDigest: undefined,
      sourceDatasetId: first.datasetId,
      datasetId: second.datasetId,
    },
  );
});

test("a pristine reset is a true no-op with no replay or throttle record", async () => {
  const identity = await createVerifiedIdentity("reset-pristine");
  const initial = await handleBootstrapUserData(
    callableRequest(identity, {}),
    dataDependencies(fixedNow),
  );
  const first = await handleResetUserData(
    callableRequest(identity, {
      operationId: "00000000-0000-4000-8000-000000000020",
    }),
    dataDependencies(fixedNow),
  );
  const second = await handleResetUserData(
    callableRequest(identity, {
      operationId: "00000000-0000-4000-8000-000000000021",
    }),
    dataDependencies(fixedNow),
  );

  assert.deepEqual(first, initial);
  assert.deepEqual(second, initial);
  const [datasets, operations, control] = await Promise.all([
    database.collection(`users/${identity.uid}/datasets`).get(),
    database.collection(`users/${identity.uid}/dataOperations`).get(),
    database
      .doc(`users/${identity.uid}/dataControls/retention`)
      .get(),
  ]);
  assert.equal(datasets.size, 1);
  assert.equal(operations.empty, true);
  assert.equal(control.exists, false);
});

test("racing distinct restores create one generation and throttle the loser", async () => {
  const identity = await createVerifiedIdentity("restore-race-throttle");
  const operationIds = [
    "00000000-0000-4000-8000-000000000022",
    "00000000-0000-4000-8000-000000000023",
  ];
  const payloads = operationIds.map(backupRestoreFixture);
  const results = await Promise.allSettled(
    payloads.map((payload) =>
      handleMigrateLegacyData(
        callableRequest(identity, payload),
        dataDependencies(fixedNow),
      )),
  );

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter(
      (result) =>
        result.status === "rejected"
        && result.reason?.code === "resource-exhausted",
    ).length,
    1,
  );
  const winningIndex = results.findIndex(
    (result) => result.status === "fulfilled",
  );
  const winner = results[winningIndex];
  assert.equal(winner?.status, "fulfilled");
  if (winner?.status !== "fulfilled") return;

  const replay = await handleMigrateLegacyData(
    callableRequest(identity, payloads[winningIndex]),
    dataDependencies(fixedNow),
  );
  assert.deepEqual(replay, winner.value);

  const [datasets, archives, operations, control] = await Promise.all([
    database.collection(`users/${identity.uid}/datasets`).get(),
    database.collection(`users/${identity.uid}/migrationArchives`).get(),
    database.collection(`users/${identity.uid}/dataOperations`).get(),
    database
      .doc(`users/${identity.uid}/dataControls/retention`)
      .get(),
  ]);
  assert.equal(datasets.size, 1);
  assert.equal(archives.size, 1);
  assert.equal(operations.size, 1);
  assert.equal(control.data()?.operationsToday, 1);
  assert.equal(control.data()?.totalOperations, 1);
  assert.equal(control.data()?.datasetGenerationCount, 1);
  assert.equal(control.data()?.migrationArchiveCount, 1);
});

test("the third daily destructive operation is admitted, the fourth is rejected, and replay still works", async () => {
  const identity = await createVerifiedIdentity("daily-data-limit");
  await seedTutorAccount(identity.uid);
  await seedDirtyCourseState(identity.uid, datasetId, "1:learn");
  const operationIds = [
    "00000000-0000-4000-8000-000000000024",
    "00000000-0000-4000-8000-000000000025",
    "00000000-0000-4000-8000-000000000026",
    "00000000-0000-4000-8000-000000000027",
  ];
  const admitted = [];
  for (let index = 0; index < 3; index += 1) {
    const now = new Date(
      fixedNow.getTime()
        + index
          * DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
    );
    const result = await handleResetUserData(
      callableRequest(identity, { operationId: operationIds[index] }),
      dataDependencies(now),
    );
    admitted.push(result);
    await seedDirtyCourseState(
      identity.uid,
      result.datasetId,
      `${index + 2}:learn`,
    );
  }
  const fourthNow = new Date(
    fixedNow.getTime()
      + 3
        * DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
  );
  await expectHttpsCode(
    handleResetUserData(
      callableRequest(identity, { operationId: operationIds[3] }),
      dataDependencies(fourthNow),
    ),
    "resource-exhausted",
  );
  const replay = await handleResetUserData(
    callableRequest(identity, { operationId: operationIds[2] }),
    dataDependencies(fourthNow),
  );
  assert.deepEqual(replay, admitted[2]);

  const [datasets, operations, control, rejectedOperation] =
    await Promise.all([
      database.collection(`users/${identity.uid}/datasets`).get(),
      database.collection(`users/${identity.uid}/dataOperations`).get(),
      database
        .doc(`users/${identity.uid}/dataControls/retention`)
        .get(),
      database
        .doc(
          `users/${identity.uid}/dataOperations/${operationIds[3]}`,
        )
        .get(),
    ]);
  assert.equal(datasets.size, 4);
  assert.equal(operations.size, 3);
  assert.equal(rejectedOperation.exists, false);
  assert.equal(control.data()?.operationsToday, 3);
  assert.equal(control.data()?.totalOperations, 3);
});

test("dataset generation retention admits the exact cap and rejects amplification beyond it", async () => {
  const identity = await createVerifiedIdentity("dataset-cap");
  await seedTutorAccount(identity.uid);
  await seedDirtyCourseState(identity.uid, datasetId, "1:learn");
  const retainedBefore = DATA_RETENTION_POLICY.maxDatasetGenerations - 1;
  const additional = retainedBefore - 1;
  await Promise.all(
    Array.from({ length: additional }, (_, index) =>
      database
        .doc(
          `users/${identity.uid}/datasets/retained_${String(index).padStart(2, "0")}`,
        )
        .set({
          dataSchemaVersion: 1,
          status: "archived",
          source: "reset",
          createdAt: fixedNow,
          archivedAt: fixedNow,
        })),
  );

  const first = await handleResetUserData(
    callableRequest(identity, {
      operationId: "00000000-0000-4000-8000-000000000028",
    }),
    dataDependencies(fixedNow),
  );
  await seedDirtyCourseState(identity.uid, first.datasetId, "2:learn");
  const nextNow = new Date(
    fixedNow.getTime()
      + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
  );
  await expectHttpsCode(
    handleResetUserData(
      callableRequest(identity, {
        operationId: "00000000-0000-4000-8000-000000000029",
      }),
      dataDependencies(nextNow),
    ),
    "resource-exhausted",
  );

  const [datasets, operations, control] = await Promise.all([
    database.collection(`users/${identity.uid}/datasets`).get(),
    database.collection(`users/${identity.uid}/dataOperations`).get(),
    database
      .doc(`users/${identity.uid}/dataControls/retention`)
      .get(),
  ]);
  assert.equal(
    datasets.size,
    DATA_RETENTION_POLICY.maxDatasetGenerations,
  );
  assert.equal(operations.size, 1);
  assert.equal(
    control.data()?.datasetGenerationCount,
    DATA_RETENTION_POLICY.maxDatasetGenerations,
  );
});

test("migration archive byte retention admits the exact cap and rejects one byte beyond it", async () => {
  const identity = await createVerifiedIdentity("archive-byte-cap");
  const firstOperationId = "00000000-0000-4000-8000-000000000030";
  const secondOperationId = "00000000-0000-4000-8000-000000000031";
  const firstPayload = backupRestoreFixture(firstOperationId);
  const secondPayload = backupRestoreFixture(secondOperationId);
  const payloadArchiveBytes = Buffer.byteLength(
    firstPayload.trackerLegacyArchive,
    "utf8",
  ) + Buffer.byteLength(firstPayload.tutorLegacyArchive, "utf8");
  await database
    .doc(`users/${identity.uid}/migrationArchives/legacy_budget_seed`)
    .set({
      schemaVersion: 1,
      rawByteLength:
        DATA_RETENTION_POLICY.maxMigrationArchiveBytes
        - payloadArchiveBytes,
      createdAt: fixedNow,
    });

  await handleMigrateLegacyData(
    callableRequest(identity, firstPayload),
    dataDependencies(fixedNow),
  );
  const control = await database
    .doc(`users/${identity.uid}/dataControls/retention`)
    .get();
  assert.equal(
    control.data()?.migrationArchiveBytes,
    DATA_RETENTION_POLICY.maxMigrationArchiveBytes,
  );

  const nextNow = new Date(
    fixedNow.getTime()
      + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
  );
  await expectHttpsCode(
    handleMigrateLegacyData(
      callableRequest(identity, secondPayload),
      dataDependencies(nextNow),
    ),
    "resource-exhausted",
  );
  const [datasets, archives, operations] = await Promise.all([
    database.collection(`users/${identity.uid}/datasets`).get(),
    database.collection(`users/${identity.uid}/migrationArchives`).get(),
    database.collection(`users/${identity.uid}/dataOperations`).get(),
  ]);
  assert.equal(datasets.size, 1);
  assert.equal(archives.size, 2);
  assert.equal(operations.size, 1);
});

test("migration archive count retention admits the exact cap and rejects the next archive", async () => {
  const identity = await createVerifiedIdentity("archive-count-cap");
  await Promise.all(
    Array.from(
      { length: DATA_RETENTION_POLICY.maxMigrationArchives - 1 },
      (_, index) =>
        database
          .doc(
            `users/${identity.uid}/migrationArchives/retained_${String(index).padStart(2, "0")}`,
          )
          .set({
            schemaVersion: 1,
            rawByteLength: 0,
            createdAt: fixedNow,
          }),
    ),
  );
  const firstPayload = backupRestoreFixture(
    "00000000-0000-4000-8000-000000000032",
  );
  const secondPayload = backupRestoreFixture(
    "00000000-0000-4000-8000-000000000033",
  );
  await handleMigrateLegacyData(
    callableRequest(identity, firstPayload),
    dataDependencies(fixedNow),
  );
  const nextNow = new Date(
    fixedNow.getTime()
      + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
  );
  await expectHttpsCode(
    handleMigrateLegacyData(
      callableRequest(identity, secondPayload),
      dataDependencies(nextNow),
    ),
    "resource-exhausted",
  );
  const archives = await database
    .collection(`users/${identity.uid}/migrationArchives`)
    .get();
  assert.equal(
    archives.size,
    DATA_RETENTION_POLICY.maxMigrationArchives,
  );
});

test("malformed server-owned retention control fails closed without creating data", async () => {
  const identity = await createVerifiedIdentity("bad-retention-control");
  await seedTutorAccount(identity.uid);
  await seedDirtyCourseState(identity.uid, datasetId, "1:learn");
  await database
    .doc(`users/${identity.uid}/dataControls/retention`)
    .set({
      schemaVersion: 1,
      dayKey,
      operationsToday: "zero",
      totalOperations: 0,
      lastOperationKind: "reset",
      lastOperationKey: "00000000-0000-4000-8000-000000000034",
      lastOperationAtMs: fixedNow.getTime(),
    });

  const operationId = "00000000-0000-4000-8000-000000000035";
  await expectHttpsCode(
    handleResetUserData(
      callableRequest(identity, { operationId }),
      dataDependencies(new Date(
        fixedNow.getTime()
          + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
      )),
    ),
    "failed-precondition",
  );
  const [datasets, operation] = await Promise.all([
    database.collection(`users/${identity.uid}/datasets`).get(),
    database
      .doc(`users/${identity.uid}/dataOperations/${operationId}`)
      .get(),
  ]);
  assert.equal(datasets.size, 1);
  assert.equal(operation.exists, false);
});

async function createVerifiedIdentity(label) {
  identitySequence += 1;
  const uid = `contract_${label}_${identitySequence}`;
  const email = `${uid}@robotshift.test`;
  await auth.createUser({
    uid,
    email,
    emailVerified: true,
    displayName: "Contract Tester",
  });
  const user = await auth.getUser(uid);
  const authTime = Math.floor(
    Date.parse(user.metadata.creationTime) / 1_000,
  );
  assert.ok(
    Number.isSafeInteger(authTime) && authTime >= 0,
    "Auth emulator must expose a valid account creation time.",
  );
  await database.doc(`accountAccess/${uid}`).set({
    schemaVersion: 1,
    uid,
    active: true,
    authValidAfterSeconds: authTime,
    validUntil: new Date("2036-07-24T09:00:00.000Z"),
    createdAt: fixedNow,
    updatedAt: fixedNow,
  });
  return { uid, email, authTime };
}

async function seedTutorAccount(uid) {
  await Promise.all([
    database.doc(`users/${uid}`).set({
      schemaVersion: 1,
      uid,
      email: `${uid}@robotshift.test`,
      displayName: "Contract Tester",
      currentDatasetId: datasetId,
      createdAt: fixedNow,
      updatedAt: fixedNow,
    }),
    database.doc(`users/${uid}/datasets/${datasetId}`).set({
      dataSchemaVersion: 1,
      curriculumRevision: 2,
      status: "active",
      source: "fresh",
      createdAt: fixedNow,
      activatedAt: fixedNow,
    }),
    database.doc(`tutorEntitlements/${uid}`).set({
      schemaVersion: 1,
      status: "active",
      plan: "free",
      dailyTutorLimit: TUTOR_MODEL_POLICY.perUserDailyLimit,
      createdAt: fixedNow,
      updatedAt: fixedNow,
    }),
  ]);
}

function reservationInput({
  uid,
  requestId,
  question,
  now = fixedNow,
}) {
  return {
    uid,
    requestId,
    inputHash: sha256Hex(JSON.stringify({
      datasetId,
      dayId: 1,
      mode: "ask",
      question,
    })),
    datasetId,
    dayId: 1,
    mode: "ask",
    question,
    promptTokens: TUTOR_MODEL_POLICY.maxInputTokens,
    threadGeneration: 0,
    dayKey,
    now,
  };
}

function userUsageReference(uid, usageDayKey) {
  return database.doc(
    `tutorUserDaily/${sha256Hex(`${uid}\u0000${usageDayKey}`)}`,
  );
}

function callableRequest(
  identity,
  data,
  authTime = identity.authTime,
) {
  return {
    data,
    auth: {
      uid: identity.uid,
      token: {
        sub: identity.uid,
        email: identity.email,
        email_verified: true,
        auth_time: authTime,
      },
    },
    app: {
      appId: ROBOTSHIFT_WEB_APP_ID,
      token: {
        app_id: ROBOTSHIFT_WEB_APP_ID,
      },
    },
  };
}

function dataDependencies(now) {
  return {
    database,
    auth,
    now: () => now,
  };
}

async function expectHttpsCode(operation, code) {
  await assert.rejects(operation, (error) => {
    assert.equal(error?.code, code);
    return true;
  });
}

function migrationFixture() {
  const digestInput = {
    tracker: {
      schemaVersion: 2,
      curriculumRevision: 2,
      completed: {
        "1:learn": true,
      },
      bookmarks: [1],
      notes: {
        "1": "Coordinate frame notes",
      },
      evidence: {},
      projectChecks: {
        "frame-lab": [true, false, false, false, false, false],
      },
      startedOn: "2026-07-24",
      weeklyHours: 10,
      selectedDay: 1,
    },
    tutor: {
      version: 2,
      curriculumRevision: 2,
      threads: {},
    },
    theme: "dark",
    trackerLegacyArchive: "{\"schemaVersion\":1}",
    tutorLegacyArchive: null,
  };
  return {
    ...digestInput,
    sourceDigest: computeLegacySourceDigest(digestInput),
    activateImported: false,
  };
}

function backupRestoreFixture(operationId) {
  const digestInput = {
    tracker: {
      schemaVersion: 2,
      curriculumRevision: 2,
      completed: {
        "1:learn": true,
        "2:build": false,
      },
      bookmarks: [1, 2],
      notes: {
        "1": "Restored coordinate frame notes",
      },
      evidence: {
        "2": "Restored frame lab evidence",
      },
      projectChecks: {
        "frame-lab": [true, false, true, false, false, false],
      },
      startedOn: "2026-07-01",
      weeklyHours: 12,
      selectedDay: 2,
    },
    tutor: {
      version: 2,
      curriculumRevision: 2,
      threads: {
        "1": {
          updatedAt: fixedNow.getTime() - 1_000,
          messages: [
            {
              id: "restored-user-message",
              role: "user",
              content: "Explain frames from this backup.",
              mode: "ask",
            },
          ],
        },
      },
    },
    theme: "light",
    trackerLegacyArchive: "{\"schemaVersion\":1,\"source\":\"tracker\"}",
    tutorLegacyArchive: "{\"version\":1,\"source\":\"tutor\"}",
  };
  return {
    ...digestInput,
    sourceDigest: computeLegacySourceDigest(digestInput),
    activateImported: true,
    operationId,
  };
}

async function seedDirtyCourseState(uid, activeDatasetId, completedKey) {
  const base = `users/${uid}/datasets/${activeDatasetId}`;
  await Promise.all([
    database.doc(`${base}/course/state`).set({
      schemaVersion: 1,
      curriculumRevision: 2,
      completed: {
        [completedKey]: true,
      },
      bookmarks: [Number(completedKey.split(":")[0])],
      updatedAt: fixedNow,
    }),
    database.doc(`${base}/course/preferences`).set({
      schemaVersion: 1,
      startedOn: "2026-07-24",
      weeklyHours: 10,
      selectedDay: 1,
      updatedAt: fixedNow,
    }),
    database.doc(`${base}/preferences/ui`).set({
      schemaVersion: 1,
      theme: "system",
      updatedAt: fixedNow,
    }),
  ]);
}

async function assertDefaultDataset(uid, activeDatasetId) {
  const base = `users/${uid}/datasets/${activeDatasetId}`;
  const [state, preferences, ui] = await Promise.all([
    database.doc(`${base}/course/state`).get(),
    database.doc(`${base}/course/preferences`).get(),
    database.doc(`${base}/preferences/ui`).get(),
  ]);
  assert.deepEqual(
    {
      schemaVersion: state.data()?.schemaVersion,
      curriculumRevision: state.data()?.curriculumRevision,
      completed: state.data()?.completed,
      bookmarks: state.data()?.bookmarks,
    },
    {
      schemaVersion: 1,
      curriculumRevision: 2,
      completed: {},
      bookmarks: [],
    },
  );
  assert.deepEqual(
    {
      schemaVersion: preferences.data()?.schemaVersion,
      startedOn: preferences.data()?.startedOn,
      weeklyHours: preferences.data()?.weeklyHours,
      selectedDay: preferences.data()?.selectedDay,
    },
    {
      schemaVersion: 1,
      startedOn: "",
      weeklyHours: 10,
      selectedDay: 1,
    },
  );
  assert.deepEqual(
    {
      schemaVersion: ui.data()?.schemaVersion,
      theme: ui.data()?.theme,
    },
    {
      schemaVersion: 1,
      theme: "system",
    },
  );
}

async function assertImportedDataset(
  uid,
  importedDatasetId,
  payload,
  expectedStatus,
) {
  const base = `users/${uid}/datasets/${importedDatasetId}`;
  const [
    manifest,
    state,
    preferences,
    ui,
    firstNote,
    secondNote,
    project,
    thread,
    archive,
  ] = await Promise.all([
    database.doc(base).get(),
    database.doc(`${base}/course/state`).get(),
    database.doc(`${base}/course/preferences`).get(),
    database.doc(`${base}/preferences/ui`).get(),
    database.doc(`${base}/notes/1`).get(),
    database.doc(`${base}/notes/2`).get(),
    database.doc(`${base}/projects/frame-lab`).get(),
    database.doc(`${base}/tutorThreads/1`).get(),
    database
      .doc(`users/${uid}/migrationArchives/${importedDatasetId}`)
      .get(),
  ]);
  assert.deepEqual(
    {
      status: manifest.data()?.status,
      source: manifest.data()?.source,
      sourceDigest: manifest.data()?.sourceDigest,
    },
    {
      status: expectedStatus,
      source: "migration",
      sourceDigest: payload.sourceDigest,
    },
  );
  assert.deepEqual(
    {
      completed: state.data()?.completed,
      bookmarks: state.data()?.bookmarks,
    },
    {
      completed: payload.tracker.completed,
      bookmarks: payload.tracker.bookmarks,
    },
  );
  assert.deepEqual(
    {
      startedOn: preferences.data()?.startedOn,
      weeklyHours: preferences.data()?.weeklyHours,
      selectedDay: preferences.data()?.selectedDay,
    },
    {
      startedOn: payload.tracker.startedOn,
      weeklyHours: payload.tracker.weeklyHours,
      selectedDay: payload.tracker.selectedDay,
    },
  );
  assert.equal(ui.data()?.theme, payload.theme);
  assert.deepEqual(
    {
      dayId: firstNote.data()?.dayId,
      note: firstNote.data()?.note,
      evidence: firstNote.data()?.evidence,
    },
    {
      dayId: 1,
      note: payload.tracker.notes["1"],
      evidence: "",
    },
  );
  assert.deepEqual(
    {
      dayId: secondNote.data()?.dayId,
      note: secondNote.data()?.note,
      evidence: secondNote.data()?.evidence,
    },
    {
      dayId: 2,
      note: "",
      evidence: payload.tracker.evidence["2"],
    },
  );
  assert.deepEqual(project.data()?.checks, payload.tracker.projectChecks["frame-lab"]);
  assert.deepEqual(thread.data(), payload.tutor.threads["1"]);
  assert.deepEqual(
    {
      sourceDigest: archive.data()?.sourceDigest,
      trackerPresent: archive.data()?.trackerPresent,
      tutorPresent: archive.data()?.tutorPresent,
      trackerChunks: archive.data()?.trackerChunks,
      tutorChunks: archive.data()?.tutorChunks,
      trackerRawBytes: archive.data()?.trackerRawBytes,
      tutorRawBytes: archive.data()?.tutorRawBytes,
      rawByteLength: archive.data()?.rawByteLength,
      retentionClass: archive.data()?.retentionClass,
    },
    {
      sourceDigest: payload.sourceDigest,
      trackerPresent: true,
      tutorPresent: true,
      trackerChunks: 1,
      tutorChunks: 1,
      trackerRawBytes: Buffer.byteLength(
        payload.trackerLegacyArchive,
        "utf8",
      ),
      tutorRawBytes: Buffer.byteLength(
        payload.tutorLegacyArchive,
        "utf8",
      ),
      rawByteLength:
        Buffer.byteLength(payload.trackerLegacyArchive, "utf8")
        + Buffer.byteLength(payload.tutorLegacyArchive, "utf8"),
      retentionClass: "dataset-linked-original-payload",
    },
  );
}

function operationContract(value) {
  return {
    operationId: value?.operationId,
    kind: value?.kind,
    status: value?.status,
    sourceDigest: value?.sourceDigest,
    sourceDatasetId: value?.sourceDatasetId,
    datasetId: value?.datasetId,
  };
}

async function invokeCallable(name, identity, data) {
  const authToken = unsignedJwt({
    sub: identity.uid,
    aud: projectId,
    email: identity.email,
    email_verified: true,
    auth_time: identity.authTime,
    iat: identity.authTime,
    exp: Math.floor(Date.now() / 1_000) + 3_600,
  });
  const appCheckToken = unsignedJwt({
    sub: ROBOTSHIFT_WEB_APP_ID,
    aud: [projectId],
    jti: randomUUID(),
    iat: Math.floor(Date.now() / 1_000),
    exp: Math.floor(Date.now() / 1_000) + 3_600,
  });
  const response = await fetch(
    `http://${functionsHost}/${projectId}/asia-south1/${name}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "X-Firebase-AppCheck": appCheckToken,
      },
      body: JSON.stringify({ data }),
    },
  );
  const body = await response.json();
  assert.equal(
    response.ok,
    true,
    `Callable ${name} failed: ${response.status} ${JSON.stringify(body)}`,
  );
  assert.equal(
    body !== null && typeof body === "object" && "result" in body,
    true,
    `Callable ${name} returned an invalid envelope.`,
  );
  return body.result;
}

function unsignedJwt(payload) {
  // firebase-functions exposes this decoder only for emulator testing. The
  // production handler still verifies the Auth-emulator user and exact app ID.
  const encode = (value) =>
    Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.emulator`;
}

function requiredEnvironment(name) {
  const value = process.env[name];
  assert.ok(value, `${name} must be provided by Firebase emulators:exec.`);
  return value;
}
