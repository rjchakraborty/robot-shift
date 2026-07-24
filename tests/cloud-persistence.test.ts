import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  readLegacyBrowserCandidateFromStorage,
  removeConsumedLegacyBrowserData,
} from "../app/data/legacy-browser-bridge";
import {
  createCloudMigrationDigest,
  mergeBookmarkChanges,
  mergeBooleanRecordChanges,
  mergeProjectCheckChanges,
} from "../app/firestore-data";
import {
  LEGACY_TRACKER_STORAGE_KEY,
  LEGACY_TUTOR_ARCHIVE_KEY,
  LEGACY_TUTOR_STORAGE_KEY,
  TRACKER_STORAGE_KEY,
  TUTOR_PRE_ACCOUNT_OWNER_KEY,
  TUTOR_STORAGE_KEY,
  tutorStorageKeyForUser,
  type TrackerStateV2,
} from "../app/storage-migrations";

const emptyTracker: TrackerStateV2 = {
  schemaVersion: 2,
  curriculumRevision: 2,
  completed: {},
  bookmarks: [],
  notes: {},
  evidence: {},
  projectChecks: {},
  startedOn: "2026-07-24",
  weeklyHours: 10,
  selectedDay: 1,
};

test("application runtime state has no browser-storage write path", async () => {
  const [page, studio, theme, dataContext, firebaseClient] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learning-studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/theme-control.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/data/course-data-context.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/firebase-client.ts", import.meta.url), "utf8"),
  ]);
  for (const source of [page, studio, theme]) {
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|document\.cookie/,
    );
  }
  assert.match(studio, /payload\.threadCommitted/);
  assert.match(studio, /loadActiveCloudTutorThread/);
  assert.match(studio, /canonicalHasAnswer/);
  assert.doesNotMatch(dataContext, /localStorage\.setItem/);
  assert.match(
    dataContext,
    /read-only, one-time bridge for data created before Firestore/,
  );
  assert.match(dataContext, /removeConsumedLegacyBrowserData/);
  assert.doesNotMatch(
    firebaseClient,
    /persistentLocalCache|persistentMultipleTabManager/,
  );
  assert.match(firebaseClient, /new CustomProvider/);
  assert.match(firebaseClient, /sub:\s*firebaseConfig\.appId/);
  assert.match(firebaseClient, /aud:\s*\[firebaseConfig\.projectId\]/);
  assert.match(firebaseClient, /isUsingLocalFirebaseEmulators\(\)/);
});

test("client migration digest uses the server canonical field set", async () => {
  const sourceDigest = await createCloudMigrationDigest({
    tracker: {
      schemaVersion: 2,
      curriculumRevision: 2,
      completed: { "1:learn": true },
      bookmarks: [1],
      notes: { "1": "Named axes" },
      evidence: {},
      projectChecks: {},
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
    trackerLegacyArchive: null,
    tutorLegacyArchive: null,
  });
  assert.equal(
    sourceDigest,
    "09a5d30267f1ae88e3626c2bb88faf619f79466bc83118d9de3ce5f86884d970",
  );
});

test("course save three-way merges preserve unrelated multi-tab edits", () => {
  assert.deepEqual(
    mergeBooleanRecordChanges(
      {
        "1:learn": true,
        "3:prove": true,
      },
      {
        "1:learn": false,
      },
      {
        "1:learn": true,
      },
    ),
    {
      "1:learn": true,
      "3:prove": true,
    },
  );
  assert.deepEqual(
    mergeBookmarkChanges(
      [1, 2, 4],
      [1, 2],
      [2, 3],
    ),
    [2, 3, 4],
  );
  assert.deepEqual(
    mergeProjectCheckChanges(
      [false, true, false],
      [false, false, false],
      [true, false, false],
    ),
    [true, true, false],
  );
  assert.deepEqual(
    mergeProjectCheckChanges(
      [true, false],
      [false, false],
      [],
    ),
    [true, false],
  );
});

test("legacy bridge falls back from corrupt current payloads and removes only consumed keys", () => {
  const uid = "firebase-user-1";
  const accountTutorKey = tutorStorageKeyForUser(uid);
  const values = new Map<string, string>([
    [TRACKER_STORAGE_KEY, "{corrupt"],
    [LEGACY_TRACKER_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      completed: { "15:learn": true },
      bookmarks: [15],
      notes: { "15": "legacy tracker survived" },
      evidence: {},
      projectChecks: {},
      startedOn: "2026-07-24",
      weeklyHours: 10,
      selectedDay: 15,
    })],
    [accountTutorKey, "{corrupt"],
    [TUTOR_PRE_ACCOUNT_OWNER_KEY, uid],
    [LEGACY_TUTOR_STORAGE_KEY, JSON.stringify({
      version: 1,
      threads: {
        "15": {
          updatedAt: 1,
          messages: [{
            id: "legacy-question",
            role: "user",
            content: "Explain dynamics",
          }],
        },
      },
    })],
    ["unrelated-key", "keep"],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
  };

  const candidate = readLegacyBrowserCandidateFromStorage(
    uid,
    storage,
    emptyTracker,
  );
  assert.ok(candidate);
  assert.equal(candidate.input.tracker.notes["15"], "legacy tracker survived");
  assert.equal(
    candidate.input.tutor.threads["15"]?.messages[0]?.id,
    "legacy-question",
  );
  assert.ok(candidate.consumedKeys.includes(LEGACY_TRACKER_STORAGE_KEY));
  assert.ok(candidate.consumedKeys.includes(LEGACY_TUTOR_STORAGE_KEY));
  assert.ok(candidate.consumedKeys.includes(TUTOR_PRE_ACCOUNT_OWNER_KEY));
  assert.ok(!candidate.consumedKeys.includes(TRACKER_STORAGE_KEY));
  assert.ok(!candidate.consumedKeys.includes(accountTutorKey));

  removeConsumedLegacyBrowserData(storage, candidate.consumedKeys);
  assert.equal(values.get(TRACKER_STORAGE_KEY), "{corrupt");
  assert.equal(values.get(accountTutorKey), "{corrupt");
  assert.equal(values.get("unrelated-key"), "keep");
  assert.equal(values.has(LEGACY_TRACKER_STORAGE_KEY), false);
  assert.equal(values.has(LEGACY_TUTOR_STORAGE_KEY), false);
});

test("legacy bridge never claims global tutor data owned by another uid", () => {
  const values = new Map<string, string>([
    [TUTOR_PRE_ACCOUNT_OWNER_KEY, "different-user"],
    [TUTOR_STORAGE_KEY, JSON.stringify({
      version: 2,
      curriculumRevision: 2,
      threads: {
        "15": {
          updatedAt: 1,
          messages: [{
            id: "private-other-user",
            role: "user",
            content: "Do not claim",
          }],
        },
      },
    })],
    [LEGACY_TUTOR_STORAGE_KEY, JSON.stringify({
      version: 1,
      threads: {},
    })],
    [LEGACY_TUTOR_ARCHIVE_KEY, "opaque-private-archive"],
    ["robot-shift-theme-v1", "dark"],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
  };

  const candidate = readLegacyBrowserCandidateFromStorage(
    "firebase-user-1",
    storage,
    emptyTracker,
  );
  assert.ok(candidate);
  assert.deepEqual(candidate.input.tutor.threads, {});
  assert.equal(candidate.input.tutorLegacyArchive, null);
  assert.ok(!candidate.consumedKeys.includes(TUTOR_STORAGE_KEY));
  assert.ok(!candidate.consumedKeys.includes(LEGACY_TUTOR_STORAGE_KEY));
  assert.ok(!candidate.consumedKeys.includes(LEGACY_TUTOR_ARCHIVE_KEY));
  assert.ok(!candidate.consumedKeys.includes(TUTOR_PRE_ACCOUNT_OWNER_KEY));
});

test("legacy bridge offers explicitly confirmed claim of unassigned pre-account tutor data", () => {
  const values = new Map<string, string>([
    [TUTOR_STORAGE_KEY, JSON.stringify({
      version: 2,
      curriculumRevision: 2,
      threads: {
        "20": {
          updatedAt: 2,
          messages: [{
            id: "pre-account-question",
            role: "user",
            content: "Explain odometry",
          }],
        },
      },
    })],
  ]);
  const candidate = readLegacyBrowserCandidateFromStorage(
    "firebase-user-1",
    { getItem: (key: string) => values.get(key) ?? null },
    emptyTracker,
  );
  assert.ok(candidate);
  assert.equal(candidate.summary.unassignedTutor, true);
  assert.equal(candidate.summary.tutorMessages, 1);
  assert.ok(candidate.consumedKeys.includes(TUTOR_STORAGE_KEY));
  assert.ok(!candidate.consumedKeys.includes(TUTOR_PRE_ACCOUNT_OWNER_KEY));
});
