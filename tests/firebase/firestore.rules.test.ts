import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { readFile } from "node:fs/promises";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const PROJECT_ID = "demo-robotshift";
const ALICE = "alice-user";
const BOB = "bob-user";
const ACTIVE_DATASET = "dataset_active_20260724";
const INACTIVE_DATASET = "dataset_archived_20260723";
const BOB_DATASET = "dataset_bob_20260724";
const SEEDED_AT = Timestamp.fromDate(new Date("2026-07-24T09:00:00.000Z"));
const AUTH_VALID_AFTER_SECONDS = Math.floor(SEEDED_AT.toMillis() / 1_000);
const ACCESS_VALID_UNTIL = Timestamp.fromDate(
  new Date("2036-07-24T09:00:00.000Z"),
);

let environment: RulesTestEnvironment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: await readFile(
        new URL("../../firestore.rules", import.meta.url),
        "utf8",
      ),
    },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await seedServerData();
});

after(async () => {
  await environment?.cleanup();
});

function authenticatedDatabase(
  uid: string,
  emailVerified = true,
  authTime = AUTH_VALID_AFTER_SECONDS,
) {
  return environment.authenticatedContext(uid, {
    email: `${uid}@example.test`,
    email_verified: emailVerified,
    auth_time: authTime,
  }).firestore();
}

function activeDatasetPath(uid = ALICE, datasetId = ACTIVE_DATASET): string {
  return `users/${uid}/datasets/${datasetId}`;
}

async function seedServerData(): Promise<void> {
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();
    const batch = writeBatch(database);

    batch.set(doc(database, "accountAccess", ALICE), {
      schemaVersion: 1,
      uid: ALICE,
      active: true,
      authValidAfterSeconds: AUTH_VALID_AFTER_SECONDS,
      validUntil: ACCESS_VALID_UNTIL,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, "users", ALICE), {
      profileSchemaVersion: 1,
      displayName: "Alice Robot",
      email: "alice-user@example.test",
      currentDatasetId: ACTIVE_DATASET,
      status: "active",
      plan: "free",
      dailyTutorLimit: 10,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath()), {
      dataSchemaVersion: 1,
      curriculumRevision: 2,
      status: "active",
      source: "fresh",
      createdAt: SEEDED_AT,
      activatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(ALICE, INACTIVE_DATASET)), {
      dataSchemaVersion: 1,
      curriculumRevision: 2,
      status: "archived",
      source: "reset",
      createdAt: SEEDED_AT,
      activatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(), "course", "state"), {
      schemaVersion: 1,
      curriculumRevision: 2,
      completed: { "15:learn": true },
      bookmarks: [15],
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(), "course", "preferences"), {
      schemaVersion: 1,
      startedOn: "2026-07-24",
      weeklyHours: 10,
      selectedDay: 15,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(), "notes", "15"), {
      schemaVersion: 1,
      dayId: 15,
      note: "Frames need a named origin.",
      evidence: "Saved plot.",
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(), "projects", "frame-lab"), {
      schemaVersion: 1,
      projectId: "frame-lab",
      checks: [true, false, false, false, false, false],
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(), "preferences", "ui"), {
      schemaVersion: 1,
      theme: "system",
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(), "tutorThreads", "15"), {
      version: 2,
      curriculumRevision: 2,
      updatedAt: SEEDED_AT.toMillis(),
      messages: [],
    });

    batch.set(doc(database, "users", ALICE, "tutorUsageDaily", "2026-07-24"), {
      dayKey: "2026-07-24",
      dailyLimit: 10,
      attempts: 1,
      successes: 1,
      reservedNanoUsd: 12_000_000,
      actualNanoUsd: 4_000_000,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, "users", ALICE, "entitlements", "current"), {
      plan: "free",
      dailyTutorLimit: 10,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, "users", ALICE, "migrationReceipts", "digest-1"), {
      sourceDigest: "digest-1",
      status: "complete",
      datasetId: ACTIVE_DATASET,
      createdAt: SEEDED_AT,
    });
    batch.set(doc(database, "users", ALICE, "migrationArchives", "archive-1"), {
      sourceDigest: "digest-1",
      chunkCount: 1,
      createdAt: SEEDED_AT,
    });
    batch.set(
      doc(
        database,
        "users",
        ALICE,
        "migrationArchives",
        "archive-1",
        "chunks",
        "0",
      ),
      {
        index: 0,
        data: "bounded raw archive",
      },
    );
    batch.set(doc(database, "users", ALICE, "tutorRequests", "request-1"), {
      uid: ALICE,
      status: "completed",
      reservedNanoUsd: 12_000_000,
    });
    batch.set(doc(database, "tutorGlobalDaily", "2026-07-24"), {
      reservedNanoUsd: 12_000_000,
      actualNanoUsd: 4_000_000,
    });
    batch.set(doc(database, "tutorRequests", "request-1"), {
      uid: ALICE,
      status: "completed",
      reservedNanoUsd: 12_000_000,
    });
    batch.set(doc(database, "systemConfig", "tutor"), {
      enabled: true,
      globalDailyLimitNanoUsd: 800_000_000,
    });

    batch.set(doc(database, "users", BOB), {
      profileSchemaVersion: 1,
      displayName: "Bob Robot",
      email: "bob-user@example.test",
      currentDatasetId: BOB_DATASET,
      status: "active",
      plan: "free",
      dailyTutorLimit: 10,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, "accountAccess", BOB), {
      schemaVersion: 1,
      uid: BOB,
      active: true,
      authValidAfterSeconds: AUTH_VALID_AFTER_SECONDS,
      validUntil: ACCESS_VALID_UNTIL,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
    });
    batch.set(doc(database, activeDatasetPath(BOB, BOB_DATASET)), {
      dataSchemaVersion: 1,
      curriculumRevision: 2,
      status: "active",
      source: "fresh",
      createdAt: SEEDED_AT,
      activatedAt: SEEDED_AT,
    });

    await batch.commit();
  });
}

test("allows only the owner to read a profile", async () => {
  const alice = authenticatedDatabase(ALICE);
  const bob = authenticatedDatabase(BOB);
  const anonymous = environment.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(alice, "users", ALICE)));
  await assertFails(getDoc(doc(bob, "users", ALICE)));
  await assertFails(getDoc(doc(anonymous, "users", ALICE)));
  await assertFails(getDocs(collection(alice, "users")));
});

test("requires an active unexpired account lease and a current authentication", async () => {
  const currentAlice = authenticatedDatabase(ALICE);
  const oldAlice = authenticatedDatabase(
    ALICE,
    true,
    AUTH_VALID_AFTER_SECONDS - 1,
  );
  const currentProfile = doc(currentAlice, "users", ALICE);
  const oldProfile = doc(oldAlice, "users", ALICE);
  const oldCourse = doc(
    oldAlice,
    activeDatasetPath(),
    "course",
    "preferences",
  );
  const oldUsage = doc(
    oldAlice,
    "users",
    ALICE,
    "tutorUsageDaily",
    "2026-07-24",
  );

  await assertSucceeds(getDoc(currentProfile));
  await assertFails(getDoc(oldProfile));
  await assertFails(getDoc(oldCourse));
  await assertFails(getDoc(oldUsage));
  await assertFails(updateDoc(oldProfile, {
    displayName: "Old session",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(getDoc(doc(currentAlice, "accountAccess", ALICE)));
  await assertFails(setDoc(
    doc(currentAlice, "accountAccess", ALICE),
    {
      active: true,
      authValidAfterSeconds: 0,
      validUntil: ACCESS_VALID_UNTIL,
    },
  ));

  await environment.withSecurityRulesDisabled(async (context) => {
    await updateDoc(doc(context.firestore(), "accountAccess", ALICE), {
      active: false,
      updatedAt: serverTimestamp(),
    });
  });
  await assertFails(getDoc(currentProfile));
  await assertFails(setDoc(oldCourse, {
    schemaVersion: 1,
    startedOn: "2026-07-24",
    weeklyHours: 10,
    selectedDay: 15,
    updatedAt: serverTimestamp(),
  }));

  await environment.withSecurityRulesDisabled(async (context) => {
    await updateDoc(doc(context.firestore(), "accountAccess", ALICE), {
      active: true,
      validUntil: Timestamp.fromMillis(1),
      updatedAt: serverTimestamp(),
    });
  });
  await assertFails(getDoc(currentProfile));
});

test("fails closed for missing or malformed account access controls", async () => {
  const cases: Array<Record<string, unknown> | null> = [
    null,
    {
      schemaVersion: 2,
      uid: ALICE,
      active: true,
      authValidAfterSeconds: AUTH_VALID_AFTER_SECONDS,
      validUntil: ACCESS_VALID_UNTIL,
    },
    {
      schemaVersion: 1,
      uid: BOB,
      active: true,
      authValidAfterSeconds: AUTH_VALID_AFTER_SECONDS,
      validUntil: ACCESS_VALID_UNTIL,
    },
    {
      schemaVersion: 1,
      uid: ALICE,
      active: true,
      authValidAfterSeconds: String(AUTH_VALID_AFTER_SECONDS),
      validUntil: ACCESS_VALID_UNTIL,
    },
    {
      schemaVersion: 1,
      uid: ALICE,
      active: true,
      authValidAfterSeconds: AUTH_VALID_AFTER_SECONDS,
      validUntil: "2036-07-24T09:00:00.000Z",
    },
  ];

  for (const accountAccess of cases) {
    await environment.withSecurityRulesDisabled(async (context) => {
      const reference = doc(context.firestore(), "accountAccess", ALICE);
      if (accountAccess === null) {
        await deleteDoc(reference);
      } else {
        await setDoc(reference, accountAccess);
      }
    });
    const alice = authenticatedDatabase(ALICE);
    await assertFails(getDoc(doc(alice, "users", ALICE)));
    await assertFails(getDoc(doc(
      alice,
      activeDatasetPath(),
      "course",
      "preferences",
    )));
  }
});

test("allows an owner to change only their bounded display name", async () => {
  const alice = authenticatedDatabase(ALICE);
  const profile = doc(alice, "users", ALICE);

  await assertSucceeds(updateDoc(profile, {
    displayName: "Alice Engineer",
    updatedAt: serverTimestamp(),
  }));
  assert.equal((await getDoc(profile)).data()?.displayName, "Alice Engineer");

  await assertFails(updateDoc(profile, {
    currentDatasetId: INACTIVE_DATASET,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(profile, {
    plan: "enterprise",
    dailyTutorLimit: 1_000_000,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(profile, {
    displayName: "x",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(alice, "users", "new-user"), {
    displayName: "Created by a client",
    currentDatasetId: ACTIVE_DATASET,
  }));
  await assertFails(deleteDoc(profile));
});

test("requires verified ownership of the current dataset generation", async () => {
  const alice = authenticatedDatabase(ALICE);
  const unverifiedAlice = authenticatedDatabase(ALICE, false);
  const bob = authenticatedDatabase(BOB);
  const active = doc(alice, activeDatasetPath());
  const inactive = doc(alice, activeDatasetPath(ALICE, INACTIVE_DATASET));

  await assertSucceeds(getDoc(active));
  await assertFails(getDoc(inactive));
  await assertFails(getDoc(doc(bob, activeDatasetPath())));
  await assertFails(getDoc(doc(unverifiedAlice, activeDatasetPath())));
  await assertFails(updateDoc(active, { status: "archived" }));
  await assertFails(setDoc(doc(alice, "users", ALICE, "datasets", "client_new"), {
    status: "active",
  }));
});

test("validates active course state and rejects stale-generation writes", async () => {
  const alice = authenticatedDatabase(ALICE);
  const activeState = doc(alice, activeDatasetPath(), "course", "state");
  const inactiveState = doc(
    alice,
    activeDatasetPath(ALICE, INACTIVE_DATASET),
    "course",
    "state",
  );

  await assertSucceeds(setDoc(activeState, {
    schemaVersion: 1,
    curriculumRevision: 2,
    completed: {
      "1:learn": true,
      "15:build": false,
      "180:prove": true,
    },
    bookmarks: [1, 15, 180],
    updatedAt: serverTimestamp(),
  }));
  const allCompletionKeys = Array.from(
    { length: 180 },
    (_, index) => index + 1,
  ).flatMap((dayId) => [
    [`${dayId}:learn`, true],
    [`${dayId}:build`, false],
    [`${dayId}:prove`, true],
  ]);
  await assertSucceeds(setDoc(activeState, {
    schemaVersion: 1,
    curriculumRevision: 2,
    completed: Object.fromEntries(allCompletionKeys),
    bookmarks: Array.from({ length: 180 }, (_, index) => index + 1),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(activeState, {
    schemaVersion: 1,
    curriculumRevision: 2,
    completed: "forged",
    bookmarks: [15],
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(activeState, {
    schemaVersion: 1,
    curriculumRevision: 2,
    completed: {},
    bookmarks: "forged",
    updatedAt: serverTimestamp(),
  }));
  for (const completed of [
    { "0:learn": true },
    { "01:learn": true },
    { "181:learn": true },
    { "15:admin": true },
    { "15:learn": "yes" },
    { "15:learn": 1 },
    { "15:learn": { nested: true } },
  ]) {
    await assertFails(setDoc(activeState, {
      schemaVersion: 1,
      curriculumRevision: 2,
      completed,
      bookmarks: [],
      updatedAt: serverTimestamp(),
    }));
  }
  for (const bookmarks of [
    [0],
    [181],
    [-1],
    [15.5],
    [15, 15],
  ]) {
    await assertFails(setDoc(activeState, {
      schemaVersion: 1,
      curriculumRevision: 2,
      completed: {},
      bookmarks,
      updatedAt: serverTimestamp(),
    }));
  }
  await assertFails(setDoc(activeState, {
    schemaVersion: 1,
    curriculumRevision: 2,
    completed: {},
    bookmarks: [],
    credits: 1_000_000,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(inactiveState, {
    schemaVersion: 1,
    curriculumRevision: 2,
    completed: {},
    bookmarks: [],
    updatedAt: serverTimestamp(),
  }));
});

test("validates course preferences and UI preference fields", async () => {
  const alice = authenticatedDatabase(ALICE);
  const preferences = doc(
    alice,
    activeDatasetPath(),
    "course",
    "preferences",
  );
  const ui = doc(alice, activeDatasetPath(), "preferences", "ui");

  await assertSucceeds(setDoc(preferences, {
    schemaVersion: 1,
    startedOn: "2026-07-24",
    weeklyHours: 12,
    selectedDay: 21,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(preferences, {
    schemaVersion: 1,
    startedOn: "24/07/2026",
    weeklyHours: 12,
    selectedDay: 21,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(preferences, {
    schemaVersion: 1,
    startedOn: "2026-99-99",
    weeklyHours: 12,
    selectedDay: 21,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(preferences, {
    schemaVersion: 1,
    startedOn: "2026-02-30",
    weeklyHours: 12,
    selectedDay: 21,
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(preferences, {
    schemaVersion: 1,
    startedOn: "2026-07-24",
    weeklyHours: 31,
    selectedDay: 21,
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(setDoc(ui, {
    schemaVersion: 1,
    theme: "dark",
    performanceMonitoring: true,
    performanceConsentVersion: 1,
    performanceConsentUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(ui, {
    schemaVersion: 1,
    theme: "admin",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(ui, {
    schemaVersion: 1,
    theme: "dark",
    performanceMonitoring: "yes",
    performanceConsentVersion: 1,
    performanceConsentUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(ui, {
    schemaVersion: 1,
    theme: "dark",
    performanceMonitoring: true,
    performanceConsentUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(ui, {
    schemaVersion: 1,
    theme: "dark",
    performanceMonitoring: true,
    performanceConsentVersion: 2,
    performanceConsentUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(ui, {
    schemaVersion: 1,
    theme: "dark",
    performanceMonitoring: true,
    performanceConsentVersion: 1,
    updatedAt: serverTimestamp(),
  }));
});

test("bounds notes and evidence and ties the numeric day to its path", async () => {
  const alice = authenticatedDatabase(ALICE);
  const note15 = doc(alice, activeDatasetPath(), "notes", "15");

  await assertSucceeds(setDoc(note15, {
    schemaVersion: 1,
    dayId: 15,
    note: "One frame, one named origin.",
    evidence: "Plot and screenshot.",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(note15, {
    schemaVersion: 1,
    dayId: 16,
    note: "",
    evidence: "",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(
    doc(alice, activeDatasetPath(), "notes", "015"),
    {
      schemaVersion: 1,
      dayId: 15,
      note: "",
      evidence: "",
      updatedAt: serverTimestamp(),
    },
  ));
  await assertFails(setDoc(note15, {
    schemaVersion: 1,
    dayId: 15,
    note: "x".repeat(5_001),
    evidence: "",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(note15, {
    schemaVersion: 1,
    dayId: 15,
    note: "",
    evidence: "",
    tutorCredits: 100,
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(deleteDoc(note15));
});

test("accepts only known projects with exact boolean checklist contracts", async () => {
  const alice = authenticatedDatabase(ALICE);
  const frameLab = doc(
    alice,
    activeDatasetPath(),
    "projects",
    "frame-lab",
  );

  await assertSucceeds(setDoc(frameLab, {
    schemaVersion: 1,
    projectId: "frame-lab",
    checks: [true, true, false, false, false, false],
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(frameLab, {
    schemaVersion: 1,
    projectId: "frame-lab",
    checks: [true, false],
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(frameLab, {
    schemaVersion: 1,
    projectId: "frame-lab",
    checks: [true, true, false, false, false, "yes"],
    updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(
    doc(alice, activeDatasetPath(), "projects", "forged-project"),
    {
      schemaVersion: 1,
      projectId: "forged-project",
      checks: [true, true, true, true],
      updatedAt: serverTimestamp(),
    },
  ));
});

test("supports owner dataset round trips without exposing another account", async () => {
  const alice = authenticatedDatabase(ALICE);
  const bob = authenticatedDatabase(BOB);
  const notes = collection(alice, activeDatasetPath(), "notes");
  const projects = collection(alice, activeDatasetPath(), "projects");

  const noteSnapshot = await assertSucceeds(
    getDoc(doc(alice, activeDatasetPath(), "notes", "15")),
  );
  assert.equal(noteSnapshot.data()?.note, "Frames need a named origin.");
  await assertSucceeds(getDocs(notes));
  await assertSucceeds(getDocs(projects));

  await assertFails(
    getDoc(doc(bob, activeDatasetPath(), "notes", "15")),
  );
  await assertFails(
    setDoc(doc(bob, activeDatasetPath(), "notes", "16"), {
      schemaVersion: 1,
      dayId: 16,
      note: "cross-account write",
      evidence: "",
      updatedAt: serverTimestamp(),
    }),
  );
});

test("keeps tutor, usage, entitlement, and migration writes server-only", async () => {
  const alice = authenticatedDatabase(ALICE);
  const bob = authenticatedDatabase(BOB);
  const thread = doc(alice, activeDatasetPath(), "tutorThreads", "15");
  const usage = doc(
    alice,
    "users",
    ALICE,
    "tutorUsageDaily",
    "2026-07-24",
  );
  const entitlement = doc(
    alice,
    "users",
    ALICE,
    "entitlements",
    "current",
  );
  const receipt = doc(
    alice,
    "users",
    ALICE,
    "migrationReceipts",
    "digest-1",
  );
  const archive = doc(
    alice,
    "users",
    ALICE,
    "migrationArchives",
    "archive-1",
  );
  const chunk = doc(
    alice,
    "users",
    ALICE,
    "migrationArchives",
    "archive-1",
    "chunks",
    "0",
  );

  await assertSucceeds(getDoc(thread));
  await assertFails(setDoc(thread, {
    updatedAt: Date.now(),
    messages: [{ role: "assistant", content: "forged" }],
  }));
  await assertFails(deleteDoc(thread));

  for (const reference of [usage, entitlement, receipt, archive, chunk]) {
    await assertSucceeds(getDoc(reference));
    await assertFails(setDoc(reference, { forged: true }));
  }
  await assertFails(getDoc(doc(bob, usage.path)));
});

test("never exposes per-request or global budget state to clients", async () => {
  const alice = authenticatedDatabase(ALICE);
  const paths = [
    `users/${ALICE}/dataControls/retention`,
    `users/${ALICE}/dataOperations/operation-1`,
    `users/${ALICE}/tutorRequests/request-1`,
    `tutorEntitlements/${ALICE}`,
    "tutorUserDaily/private-ledger-id",
    "tutorGlobalDaily/2026-07-24",
    "tutorRequests/request-1",
    "systemConfig/tutor",
  ];

  for (const path of paths) {
    const reference = doc(alice, path);
    await assertFails(getDoc(reference));
    await assertFails(setDoc(reference, { forged: true }));
  }
});
