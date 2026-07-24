import assert from "node:assert/strict";
import test from "node:test";

import {
  CURRICULUM_REVISION,
  LEGACY_TRACKER_ARCHIVE_KEY,
  TRACKER_STORAGE_KEY,
  archiveLegacyPayload,
  migrateLegacyTrackerState,
  migrateLegacyTutorStore,
  parseTrackerBackup,
  parseTrackerStateV2,
  parseTutorStoreV2,
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
  const legacy = JSON.stringify({
    version: 1,
    threads: {
      "1": {
        updatedAt: 10,
        messages: [{ id: "old", role: "user", content: "Explain vectors" }],
      },
      "15": {
        updatedAt: 20,
        messages: [{ id: "keep", role: "assistant", content: "Dynamics answer", mode: "simple" }],
      },
    },
  });
  const migration = migrateLegacyTutorStore(legacy);
  assert.ok(migration);
  assert.deepEqual(migration.archivedFoundationDays, [1]);
  assert.deepEqual(Object.keys(migration.store.threads), ["15"]);
  assert.equal(migration.store.version, 2);
  assert.equal(migration.store.curriculumRevision, CURRICULUM_REVISION);
  assert.deepEqual(parseTutorStoreV2(JSON.stringify(migration.store)), migration.store);
  assert.equal(parseTutorStoreV2(legacy), null);
});
