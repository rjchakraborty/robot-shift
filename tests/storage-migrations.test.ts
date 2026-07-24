import assert from "node:assert/strict";
import test from "node:test";

import {
  CURRICULUM_REVISION,
  LEGACY_TRACKER_ARCHIVE_KEY,
  MAX_ROBOT_SHIFT_BACKUP_BYTES,
  ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM,
  ROBOT_SHIFT_BACKUP_KIND,
  ROBOT_SHIFT_BACKUP_VERSION,
  TRACKER_STORAGE_KEY,
  TUTOR_ACCOUNT_STORAGE_PREFIX,
  tutorStorageKeyForUser,
  archiveLegacyPayload,
  createRobotShiftBackup,
  migrateLegacyTrackerState,
  migrateLegacyTutorStore,
  parseRobotShiftBackup,
  parseRobotShiftBackupEnvelope,
  parseTrackerBackup,
  parseTrackerStateV2,
  parseTutorStoreV2,
  type TrackerStateV2,
  type TutorStoreV2,
} from "../app/storage-migrations";

function legacyTracker() {
  return JSON.stringify({
    schemaVersion: 1,
    completed: {
      "1:learn": true,
      "14:prove": true,
      "15:learn": true,
      "180:build": false,
    },
    bookmarks: [1, 15],
    notes: { "1": "old vector note", "15": "unchanged dynamics note" },
    evidence: { "14": "old IK proof", "15": "unchanged proof" },
    projectChecks: { "frame-lab": [true, false, true, true] },
    startedOn: "2026-07-24",
    weeklyHours: 10,
    selectedDay: 3,
  });
}

function currentTracker(): TrackerStateV2 {
  const migration = migrateLegacyTrackerState(legacyTracker());
  assert.ok(migration);
  return migration.state;
}

function legacyTutor() {
  return JSON.stringify({
    version: 1,
    threads: {
      "1": {
        updatedAt: 10,
        messages: [{ id: "old", role: "user", content: "Explain vectors" }],
      },
      "15": {
        updatedAt: 20,
        messages: [{
          id: "keep",
          role: "assistant",
          content: "Dynamics answer",
          mode: "simple",
        }],
      },
    },
  });
}

function currentTutor(): TutorStoreV2 {
  const migration = migrateLegacyTutorStore(legacyTutor());
  assert.ok(migration);
  return migration.store;
}

test("tracker v1 migration archives revised foundations and preserves unchanged work", () => {
  const migration = migrateLegacyTrackerState(legacyTracker());
  assert.ok(migration);
  assert.equal(migration.state.schemaVersion, 2);
  assert.equal(migration.state.curriculumRevision, CURRICULUM_REVISION);
  assert.deepEqual(migration.state.completed, {
    "15:learn": true,
    "180:build": false,
  });
  assert.deepEqual(migration.state.bookmarks, [15]);
  assert.deepEqual(migration.state.notes, { "15": "unchanged dynamics note" });
  assert.deepEqual(migration.state.evidence, { "15": "unchanged proof" });
  assert.deepEqual(migration.state.projectChecks, {});
  assert.equal(migration.state.selectedDay, 1);
  assert.deepEqual(migration.archivedFoundationDays, [1, 14]);
  assert.equal(migration.archivedFrameLab, true);
});

test("tracker parser accepts only the revision-2 schema while backup import migrates v1", () => {
  const migration = migrateLegacyTrackerState(legacyTracker());
  assert.ok(migration);
  const currentRaw = JSON.stringify(migration.state);
  assert.deepEqual(parseTrackerStateV2(currentRaw), migration.state);
  assert.equal(parseTrackerStateV2(legacyTracker()), null);
  assert.equal(parseTrackerBackup(legacyTracker())?.migrated, true);
  assert.equal(parseTrackerBackup(currentRaw)?.migrated, false);
  assert.equal(TRACKER_STORAGE_KEY, "robot-shift-tracker-v2");
});

test("legacy archive creation never overwrites the first preserved payload", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  assert.equal(
    archiveLegacyPayload(storage, LEGACY_TRACKER_ARCHIVE_KEY, "first"),
    "created",
  );
  assert.equal(
    archiveLegacyPayload(storage, LEGACY_TRACKER_ARCHIVE_KEY, "second"),
    "existing",
  );
  assert.equal(values.get(LEGACY_TRACKER_ARCHIVE_KEY), "first");
});

test("tutor migration archives Days 1-14 and preserves later-day threads", () => {
  const legacy = legacyTutor();
  const migration = migrateLegacyTutorStore(legacy);
  assert.ok(migration);
  assert.deepEqual(migration.archivedFoundationDays, [1]);
  assert.deepEqual(Object.keys(migration.store.threads), ["15"]);
  assert.equal(migration.store.version, 2);
  assert.equal(migration.store.curriculumRevision, CURRICULUM_REVISION);
  assert.deepEqual(parseTutorStoreV2(JSON.stringify(migration.store)), migration.store);
  assert.equal(parseTutorStoreV2(legacy), null);
});

test("authenticated tutor storage is isolated by validated Firebase user ID", () => {
  assert.equal(
    tutorStorageKeyForUser("firebase-user_123"),
    `${TUTOR_ACCOUNT_STORAGE_PREFIX}firebase-user_123`,
  );
  assert.notEqual(
    tutorStorageKeyForUser("account-a"),
    tutorStorageKeyForUser("account-b"),
  );
  assert.throws(() => tutorStorageKeyForUser(""), TypeError);
  assert.throws(() => tutorStorageKeyForUser("../other-account"), TypeError);
  assert.throws(() => tutorStorageKeyForUser("x".repeat(129)), TypeError);
});

test("complete backup round-trips every local store with SHA-256 integrity", async () => {
  const tracker = currentTracker();
  const tutor = currentTutor();
  const trackerLegacyArchive = legacyTracker();
  const tutorLegacyArchive = legacyTutor();
  const raw = await createRobotShiftBackup({
    tracker,
    tutor,
    theme: "dark",
    trackerLegacyArchive,
    tutorLegacyArchive,
    exportedAt: "2026-07-24T09:30:00.000Z",
    sourceOrigin: "https://robot-shift.example",
  });

  const envelope = await parseRobotShiftBackupEnvelope(raw);
  assert.ok(envelope);
  assert.equal(envelope.kind, ROBOT_SHIFT_BACKUP_KIND);
  assert.equal(envelope.backupVersion, ROBOT_SHIFT_BACKUP_VERSION);
  assert.deepEqual(envelope.tracker, tracker);
  assert.deepEqual(envelope.tutor, tutor);
  assert.equal(envelope.theme, "dark");
  assert.equal(envelope.trackerLegacyArchive, trackerLegacyArchive);
  assert.equal(envelope.tutorLegacyArchive, tutorLegacyArchive);
  assert.equal(envelope.exportedAt, "2026-07-24T09:30:00.000Z");
  assert.equal(envelope.sourceOrigin, "https://robot-shift.example");
  assert.equal(
    envelope.integrity.algorithm,
    ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM,
  );
  assert.match(envelope.integrity.checksum, /^[a-f0-9]{64}$/);

  const parsed = await parseRobotShiftBackup(raw);
  assert.ok(parsed);
  assert.equal(parsed.format, "complete");
  if (parsed.format === "complete") {
    assert.deepEqual(parsed.envelope, envelope);
  }
});

test("unified backup parser preserves raw tracker v1 and v2 compatibility", async () => {
  const legacy = await parseRobotShiftBackup(legacyTracker());
  assert.ok(legacy);
  assert.equal(legacy.format, "tracker");
  if (legacy.format === "tracker") {
    assert.equal(legacy.tracker.migrated, true);
    assert.deepEqual(legacy.tracker.state, currentTracker());
  }

  const current = currentTracker();
  const currentRaw = JSON.stringify({
    ...current,
    exportedAt: "2026-07-24T09:30:00.000Z",
    archivedVersion1: JSON.parse(legacyTracker()),
  });
  const parsedCurrent = await parseRobotShiftBackup(currentRaw);
  assert.ok(parsedCurrent);
  assert.equal(parsedCurrent.format, "tracker");
  if (parsedCurrent.format === "tracker") {
    assert.equal(parsedCurrent.tracker.migrated, false);
    assert.deepEqual(parsedCurrent.tracker.state, current);
  }
});

test("complete backup rejects partial, corrupted, invalid, and oversized data", async () => {
  const validInput = {
    tracker: currentTracker(),
    tutor: currentTutor(),
    theme: "system" as const,
    trackerLegacyArchive: legacyTracker(),
    tutorLegacyArchive: legacyTutor(),
    exportedAt: "2026-07-24T09:30:00.000Z",
    sourceOrigin: "http://localhost:3000",
  };
  const raw = await createRobotShiftBackup(validInput);

  const partial = JSON.parse(raw) as Record<string, unknown>;
  delete partial.tutorLegacyArchive;
  assert.equal(
    await parseRobotShiftBackupEnvelope(JSON.stringify(partial)),
    null,
  );

  const corrupted = JSON.parse(raw) as {
    tracker: TrackerStateV2;
  };
  corrupted.tracker.notes["15"] = "tampered after export";
  assert.equal(
    await parseRobotShiftBackupEnvelope(JSON.stringify(corrupted)),
    null,
  );

  await assert.rejects(
    createRobotShiftBackup({
      ...validInput,
      tracker: { ...validInput.tracker, weeklyHours: 31 },
    }),
    TypeError,
  );
  await assert.rejects(
    createRobotShiftBackup({
      ...validInput,
      sourceOrigin: "https://robot-shift.example/path",
    }),
    TypeError,
  );

  const oversized = "x".repeat(MAX_ROBOT_SHIFT_BACKUP_BYTES + 1);
  assert.equal(await parseRobotShiftBackupEnvelope(oversized), null);
  assert.equal(await parseRobotShiftBackup(oversized), null);
  await assert.rejects(
    createRobotShiftBackup({
      ...validInput,
      trackerLegacyArchive: oversized,
    }),
    RangeError,
  );
});
