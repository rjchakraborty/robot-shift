"use client";

import type { CurriculumDay } from "./curriculum";
import {
  getFirebaseFirestore,
  getFirebaseFunctions,
} from "./firebase-client";
import {
  CURRICULUM_REVISION,
  parseTrackerStateV2,
  parseTutorStoreV2,
  type StoredTutorMode,
  type StoredTutorThread,
  type TrackerStateV2,
  type TutorStoreV2,
} from "./storage-migrations";
import {
  parseThemePreference,
  type ThemePreference,
} from "./theme";

const MAX_COURSE_TRANSACTION_WRITES = 450;
const MAX_ARCHIVE_CHUNKS_PER_KIND = 64;

export type CloudCourseState = {
  datasetId: string;
  tracker: TrackerStateV2;
  theme: ThemePreference;
  performanceMonitoring: boolean;
};

export type CloudMigrationArchives = {
  archiveDatasetId: string | null;
  trackerLegacyArchive: string | null;
  tutorLegacyArchive: string | null;
};

export type TutorUsageSummary = {
  dayKey: string;
  dailyLimit: number;
  attempts: number;
  successes: number;
  reservedNanoUsd: number;
  actualNanoUsd: number;
};

export type CloudTutorAnswer = {
  answer: string;
  model: string;
  datasetId: string;
  requestId: string;
  threadCommitted: boolean;
  remainingToday: number;
  usage: TutorUsageSummary;
};

export type CloudMigrationInput = {
  tracker: TrackerStateV2;
  tutor: TutorStoreV2;
  theme: ThemePreference;
  trackerLegacyArchive: string | null;
  tutorLegacyArchive: string | null;
  sourceDigest: string;
  activateImported?: boolean;
  operationId?: string;
};

export async function bootstrapCloudAccount(): Promise<{
  datasetId: string;
}> {
  const [functions, { httpsCallable }] = await Promise.all([
    getFirebaseFunctions(),
    import("firebase/functions"),
  ]);
  const bootstrap = httpsCallable<Record<string, never>, {
    datasetId: string;
  }>(functions, "bootstrapUserData", {
    limitedUseAppCheckTokens: true,
    timeout: 30_000,
  });
  return (await bootstrap({})).data;
}

export async function updateCloudProfileName(
  uid: string,
  displayName: string,
): Promise<void> {
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  await firestore.updateDoc(firestore.doc(database, "users", uid), {
    displayName: sanitizeName(displayName),
    updatedAt: firestore.serverTimestamp(),
  });
}

export async function loadCloudCourseState(
  uid: string,
  emptyState: TrackerStateV2,
): Promise<CloudCourseState | null> {
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  const userSnapshot = await firestore.getDoc(
    firestore.doc(database, "users", uid),
  );
  if (!userSnapshot.exists()) return null;
  const datasetId = userSnapshot.data().currentDatasetId;
  if (typeof datasetId !== "string" || !isDatasetId(datasetId)) return null;

  const datasetRef = firestore.doc(
    database,
    "users",
    uid,
    "datasets",
    datasetId,
  );
  const [
    stateSnapshot,
    preferencesSnapshot,
    uiSnapshot,
    notesSnapshot,
    projectsSnapshot,
  ] = await Promise.all([
    firestore.getDoc(firestore.doc(datasetRef, "course", "state")),
    firestore.getDoc(firestore.doc(datasetRef, "course", "preferences")),
    firestore.getDoc(firestore.doc(datasetRef, "preferences", "ui")),
    firestore.getDocs(firestore.collection(datasetRef, "notes")),
    firestore.getDocs(firestore.collection(datasetRef, "projects")),
  ]);
  if (!stateSnapshot.exists() || !preferencesSnapshot.exists()) return null;

  const state = stateSnapshot.data();
  const preferences = preferencesSnapshot.data();
  const notes: Record<string, string> = {};
  const evidence: Record<string, string> = {};
  const projectChecks: Record<string, boolean[]> = {};

  for (const snapshot of notesSnapshot.docs) {
    const data = snapshot.data();
    const dayId = Number(snapshot.id);
    if (!Number.isInteger(dayId) || dayId < 1 || dayId > 180) continue;
    if (typeof data.note === "string" && data.note) {
      notes[String(dayId)] = data.note;
    }
    if (typeof data.evidence === "string" && data.evidence) {
      evidence[String(dayId)] = data.evidence;
    }
  }

  for (const snapshot of projectsSnapshot.docs) {
    const checks = snapshot.data().checks;
    if (
      Array.isArray(checks)
      && checks.every((value) => typeof value === "boolean")
    ) {
      projectChecks[snapshot.id] = [...checks];
    }
  }

  const reconstructed = {
    ...emptyState,
    schemaVersion: 2,
    curriculumRevision: CURRICULUM_REVISION,
    completed: isBooleanRecord(state.completed) ? state.completed : {},
    bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : [],
    notes,
    evidence,
    projectChecks,
    startedOn: typeof preferences.startedOn === "string"
      ? preferences.startedOn
      : emptyState.startedOn,
    weeklyHours: typeof preferences.weeklyHours === "number"
      ? preferences.weeklyHours
      : emptyState.weeklyHours,
    selectedDay: typeof preferences.selectedDay === "number"
      ? preferences.selectedDay
      : emptyState.selectedDay,
  };
  const tracker = parseTrackerStateV2(JSON.stringify(reconstructed));
  if (!tracker) {
    throw new Error("Cloud course data failed schema validation.");
  }

  return {
    datasetId,
    tracker,
    theme: parseThemePreference(
      uiSnapshot.exists() ? uiSnapshot.data().theme : "system",
    ),
    performanceMonitoring: Boolean(
      uiSnapshot.exists()
      && uiSnapshot.data().performanceMonitoring === true
      && uiSnapshot.data().performanceConsentVersion === 1
    ),
  };
}

export async function saveCloudCourseChanges(
  uid: string,
  datasetId: string,
  previous: TrackerStateV2 | null,
  next: TrackerStateV2,
): Promise<void> {
  if (!isDatasetId(datasetId)) throw new TypeError("Invalid cloud dataset.");
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  const datasetRef = firestore.doc(
    database,
    "users",
    uid,
    "datasets",
    datasetId,
  );
  const stateChanged = (
    !previous
    || JSON.stringify(previous.completed) !== JSON.stringify(next.completed)
    || JSON.stringify(previous.bookmarks) !== JSON.stringify(next.bookmarks)
  );
  const preferencesChanged = !previous
    || coursePreferencesChanged(previous, next);
  const noteChanges: Array<{
    dayId: number;
    before: { note: string; evidence: string } | null;
    after: { note: string; evidence: string };
  }> = [];
  for (let dayId = 1; dayId <= 180; dayId += 1) {
    const key = String(dayId);
    const before = previous
      ? {
          note: previous.notes[key] ?? "",
          evidence: previous.evidence[key] ?? "",
        }
      : null;
    const after = {
      note: next.notes[key] ?? "",
      evidence: next.evidence[key] ?? "",
    };
    if (before && JSON.stringify(before) === JSON.stringify(after)) continue;
    if (!before && !after.note && !after.evidence) continue;
    noteChanges.push({ dayId, before, after });
  }

  const projectIds = new Set([
    ...Object.keys(previous?.projectChecks ?? {}),
    ...Object.keys(next.projectChecks),
  ]);
  const projectChanges: Array<{
    projectId: string;
    before: boolean[];
    after: boolean[];
  }> = [];
  for (const projectId of projectIds) {
    const before = previous?.projectChecks[projectId] ?? [];
    const after = next.projectChecks[projectId] ?? [];
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    projectChanges.push({ projectId, before, after });
  }

  const writes = Number(stateChanged)
    + Number(preferencesChanged)
    + noteChanges.length
    + projectChanges.length;
  if (writes === 0) return;
  if (writes > MAX_COURSE_TRANSACTION_WRITES) {
    throw new Error("Course update exceeded the safe Firestore batch size.");
  }

  const stateRef = firestore.doc(datasetRef, "course", "state");
  await firestore.runTransaction(database, async (transaction) => {
    const [
      stateSnapshot,
      noteSnapshots,
      projectSnapshots,
    ] = await Promise.all([
      stateChanged
        ? transaction.get(stateRef)
        : Promise.resolve(null),
      Promise.all(noteChanges.map(({ dayId }) =>
        transaction.get(
          firestore.doc(datasetRef, "notes", String(dayId)),
        )
      )),
      Promise.all(projectChanges.map(({ projectId }) =>
        transaction.get(
          firestore.doc(datasetRef, "projects", projectId),
        )
      )),
    ]);

    if (stateChanged) {
      const remoteState = stateSnapshot?.exists()
        ? stateSnapshot.data()
        : {};
      if (
        remoteState.completed !== undefined
        && !isBooleanRecord(remoteState.completed)
      ) {
        throw new Error("Remote completion data is invalid.");
      }
      if (
        remoteState.bookmarks !== undefined
        && !isBookmarkArray(remoteState.bookmarks)
      ) {
        throw new Error("Remote bookmark data is invalid.");
      }
      transaction.set(stateRef, {
        schemaVersion: 1,
        curriculumRevision: CURRICULUM_REVISION,
        completed: mergeBooleanRecordChanges(
          remoteState.completed ?? {},
          previous?.completed ?? {},
          next.completed,
        ),
        bookmarks: mergeBookmarkChanges(
          remoteState.bookmarks ?? [],
          previous?.bookmarks ?? [],
          next.bookmarks,
        ),
        updatedAt: firestore.serverTimestamp(),
      });
    }

    if (preferencesChanged) {
      const changedFields: Record<string, unknown> = {
        schemaVersion: 1,
        updatedAt: firestore.serverTimestamp(),
      };
      if (!previous || previous.startedOn !== next.startedOn) {
        changedFields.startedOn = next.startedOn;
      }
      if (!previous || previous.weeklyHours !== next.weeklyHours) {
        changedFields.weeklyHours = next.weeklyHours;
      }
      if (!previous || previous.selectedDay !== next.selectedDay) {
        changedFields.selectedDay = next.selectedDay;
      }
      transaction.set(
        firestore.doc(datasetRef, "course", "preferences"),
        changedFields,
        { merge: true },
      );
    }

    noteChanges.forEach(({ dayId, before, after }, index) => {
      const snapshot = noteSnapshots[index];
      const changedFields: Record<string, unknown> = {
        schemaVersion: 1,
        dayId,
        updatedAt: firestore.serverTimestamp(),
      };
      if (!snapshot.exists()) {
        changedFields.note = after.note;
        changedFields.evidence = after.evidence;
      } else {
        if (before === null) {
          if (after.note) changedFields.note = after.note;
          if (after.evidence) changedFields.evidence = after.evidence;
        } else {
          if (before.note !== after.note) changedFields.note = after.note;
          if (before.evidence !== after.evidence) {
            changedFields.evidence = after.evidence;
          }
        }
      }
      transaction.set(
        firestore.doc(datasetRef, "notes", String(dayId)),
        changedFields,
        { merge: true },
      );
    });

    projectChanges.forEach(({ projectId, before, after }, index) => {
      const projectRef = firestore.doc(datasetRef, "projects", projectId);
      const snapshot = projectSnapshots[index];
      const remote = snapshot.exists()
        ? snapshot.data().checks
        : [];
      if (!isBooleanArray(remote)) {
        throw new Error("Remote project checklist data is invalid.");
      }
      const checks = mergeProjectCheckChanges(remote, before, after);
      if (checks === null) {
        if (snapshot.exists()) transaction.delete(projectRef);
        return;
      }
      transaction.set(projectRef, {
        schemaVersion: 1,
        projectId,
        checks,
        updatedAt: firestore.serverTimestamp(),
      });
    });
  });
}

export async function saveCloudTheme(
  uid: string,
  datasetId: string,
  theme: ThemePreference,
): Promise<void> {
  if (!isDatasetId(datasetId)) throw new TypeError("Invalid cloud dataset.");
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  await firestore.setDoc(
    firestore.doc(
      database,
      "users",
      uid,
      "datasets",
      datasetId,
      "preferences",
      "ui",
    ),
    {
      schemaVersion: 1,
      theme: parseThemePreference(theme),
      updatedAt: firestore.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveCloudPerformanceMonitoring(
  uid: string,
  datasetId: string,
  enabled: boolean,
): Promise<void> {
  if (!isDatasetId(datasetId)) throw new TypeError("Invalid cloud dataset.");
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  await firestore.setDoc(
    firestore.doc(
      database,
      "users",
      uid,
      "datasets",
      datasetId,
      "preferences",
      "ui",
    ),
    {
      schemaVersion: 1,
      performanceMonitoring: enabled,
      performanceConsentVersion: 1,
      performanceConsentUpdatedAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadCloudTutorThread(
  uid: string,
  datasetId: string,
  dayId: number,
): Promise<StoredTutorThread | null> {
  if (!isDatasetId(datasetId)) throw new TypeError("Invalid cloud dataset.");
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  const snapshot = await firestore.getDoc(
    firestore.doc(
      database,
      "users",
      uid,
      "datasets",
      datasetId,
      "tutorThreads",
      String(dayId),
    ),
  );
  if (!snapshot.exists()) return null;
  const parsed = parseTutorStoreV2(JSON.stringify({
    version: 2,
    curriculumRevision: CURRICULUM_REVISION,
    threads: {
      [String(dayId)]: snapshot.data(),
    },
  }));
  return parsed?.threads[String(dayId)] ?? null;
}

export async function loadActiveCloudTutorThread(
  uid: string,
  dayId: number,
): Promise<{
  datasetId: string;
  thread: StoredTutorThread | null;
}> {
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  const userSnapshot = await firestore.getDoc(
    firestore.doc(database, "users", uid),
  );
  if (!userSnapshot.exists()) {
    throw new Error("The active Firestore account is unavailable.");
  }
  const datasetId = userSnapshot.data().currentDatasetId;
  if (typeof datasetId !== "string" || !isDatasetId(datasetId)) {
    throw new Error("The active Firestore dataset is unavailable.");
  }
  return {
    datasetId,
    thread: await loadCloudTutorThread(uid, datasetId, dayId),
  };
}

export async function loadAllCloudTutorThreads(
  uid: string,
  datasetId: string,
): Promise<TutorStoreV2> {
  if (!isDatasetId(datasetId)) throw new TypeError("Invalid cloud dataset.");
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  const datasetRef = firestore.doc(
    database,
    "users",
    uid,
    "datasets",
    datasetId,
  );
  const snapshot = await firestore.getDocs(
    firestore.collection(datasetRef, "tutorThreads"),
  );
  const threads: Record<string, StoredTutorThread> = {};
  for (const document of snapshot.docs) {
    const parsed = parseTutorStoreV2(JSON.stringify({
      version: 2,
      curriculumRevision: CURRICULUM_REVISION,
      threads: {
        [document.id]: document.data(),
      },
    }));
    const thread = parsed?.threads[document.id];
    if (thread) threads[document.id] = thread;
  }
  return {
    version: 2,
    curriculumRevision: CURRICULUM_REVISION,
    threads,
  };
}

export async function loadCloudMigrationArchives(
  uid: string,
  activeDatasetId: string,
): Promise<CloudMigrationArchives> {
  if (!isDatasetId(activeDatasetId)) {
    throw new TypeError("Invalid active cloud dataset.");
  }
  const [database, firestore] = await Promise.all([
    getFirebaseFirestore(),
    import("firebase/firestore"),
  ]);
  const userSnapshot = await firestore.getDoc(
    firestore.doc(database, "users", uid),
  );
  if (!userSnapshot.exists()) {
    throw new Error("The Firestore account is unavailable.");
  }
  const originalArchiveId = userSnapshot.data().originalMigrationArchiveId;
  if (
    originalArchiveId !== undefined
    && (
      typeof originalArchiveId !== "string"
      || !isDatasetId(originalArchiveId)
    )
  ) {
    throw new Error("The original migration archive pointer is invalid.");
  }
  const archiveIds = [
    ...(typeof originalArchiveId === "string"
      ? [originalArchiveId]
      : []),
    ...(originalArchiveId === activeDatasetId ? [] : [activeDatasetId]),
  ];

  for (const archiveId of archiveIds) {
    const archiveRef = firestore.doc(
      database,
      "users",
      uid,
      "migrationArchives",
      archiveId,
    );
    const archiveSnapshot = await firestore.getDoc(archiveRef);
    if (!archiveSnapshot.exists()) {
      if (archiveId === originalArchiveId) {
        throw new Error("The original migration archive is missing.");
      }
      continue;
    }
    const manifest = archiveSnapshot.data();
    const trackerChunks = parseArchiveChunkCount(manifest.trackerChunks);
    const tutorChunks = parseArchiveChunkCount(manifest.tutorChunks);
    const chunks = await firestore.getDocs(
      firestore.collection(archiveRef, "chunks"),
    );
    const byId = new Map(
      chunks.docs.map((snapshot) => [snapshot.id, snapshot.data()]),
    );
    return {
      archiveDatasetId: archiveId,
      trackerLegacyArchive: decodeArchiveKind(
        "tracker",
        trackerChunks,
        manifest.trackerPresent,
        byId,
      ),
      tutorLegacyArchive: decodeArchiveKind(
        "tutor",
        tutorChunks,
        manifest.tutorPresent,
        byId,
      ),
    };
  }

  return {
    archiveDatasetId: null,
    trackerLegacyArchive: null,
    tutorLegacyArchive: null,
  };
}

export async function clearCloudTutorThread(dayId: number): Promise<void> {
  const [functions, { httpsCallable }] = await Promise.all([
    getFirebaseFunctions(),
    import("firebase/functions"),
  ]);
  const clearThread = httpsCallable<{ dayId: number }, { cleared: boolean }>(
    functions,
    "clearTutorThread",
    {
      limitedUseAppCheckTokens: true,
      timeout: 30_000,
    },
  );
  await clearThread({ dayId });
}

export async function askCloudTutor(input: {
  day: CurriculumDay;
  mode: StoredTutorMode;
  message: string;
  requestId: string;
}): Promise<CloudTutorAnswer> {
  const [functions, { httpsCallable }] = await Promise.all([
    getFirebaseFunctions(),
    import("firebase/functions"),
  ]);
  const askTutor = httpsCallable<
    {
      dayId: number;
      mode: StoredTutorMode;
      message: string;
      requestId: string;
    },
    CloudTutorAnswer
  >(functions, "askTutor", {
    limitedUseAppCheckTokens: true,
    timeout: 45_000,
  });
  return (await askTutor({
    dayId: input.day.id,
    mode: input.mode,
    message: input.message,
    requestId: input.requestId,
  })).data;
}

export async function migrateLegacyDataToCloud(
  input: CloudMigrationInput,
): Promise<{
  datasetId: string;
  migrated: boolean;
  retainedCloudData: boolean;
}> {
  const [functions, { httpsCallable }] = await Promise.all([
    getFirebaseFunctions(),
    import("firebase/functions"),
  ]);
  const migrate = httpsCallable<
    typeof input,
    {
      datasetId: string;
      migrated: boolean;
      retainedCloudData: boolean;
    }
  >(functions, "migrateLegacyData", {
    limitedUseAppCheckTokens: true,
    timeout: 60_000,
  });
  const callableInput = input.activateImported === true
    ? {
        ...input,
        operationId: input.operationId ?? createOperationId(),
      }
    : input;
  return (await migrate(callableInput)).data;
}

export async function resetCloudCourseData(): Promise<{
  datasetId: string;
}> {
  const [functions, { httpsCallable }] = await Promise.all([
    getFirebaseFunctions(),
    import("firebase/functions"),
  ]);
  const reset = httpsCallable<{ operationId: string }, { datasetId: string }>(
    functions,
    "resetUserData",
    {
      limitedUseAppCheckTokens: true,
      timeout: 30_000,
    },
  );
  return (await reset({ operationId: createOperationId() })).data;
}

export async function createCloudMigrationDigest(
  input: Omit<
    CloudMigrationInput,
    "sourceDigest" | "activateImported" | "operationId"
  >,
): Promise<string> {
  const canonical = canonicalJson(input);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function coursePreferencesChanged(
  previous: TrackerStateV2,
  next: TrackerStateV2,
): boolean {
  return (
    previous.startedOn !== next.startedOn
    || previous.weeklyHours !== next.weeklyHours
    || previous.selectedDay !== next.selectedDay
  );
}

function sanitizeName(value: string | null): string {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
}

function isDatasetId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,80}$/.test(value);
}

function parseArchiveChunkCount(value: unknown): number {
  if (
    typeof value !== "number"
    || !Number.isSafeInteger(value)
    || value < 0
    || value > MAX_ARCHIVE_CHUNKS_PER_KIND
  ) {
    throw new Error("The migration archive manifest is invalid.");
  }
  return value;
}

function decodeArchiveKind(
  kind: "tracker" | "tutor",
  count: number,
  present: unknown,
  chunks: Map<string, Record<string, unknown>>,
): string | null {
  const isPresent = present === true || (present === undefined && count > 0);
  if (!isPresent) {
    if (count !== 0) {
      throw new Error("The migration archive presence marker is invalid.");
    }
    return null;
  }
  const parts: Uint8Array[] = [];
  let totalBytes = 0;
  for (let index = 0; index < count; index += 1) {
    const id = `${kind}-${String(index).padStart(3, "0")}`;
    const chunk = chunks.get(id);
    if (
      !chunk
      || chunk.kind !== kind
      || chunk.index !== index
      || chunk.encoding !== "base64-utf8"
      || typeof chunk.data !== "string"
    ) {
      throw new Error("A migration archive chunk is missing or invalid.");
    }
    let binary: string;
    try {
      binary = atob(chunk.data);
    } catch {
      throw new Error("A migration archive chunk is not valid base64.");
    }
    const bytes = Uint8Array.from(
      binary,
      (character) => character.charCodeAt(0),
    );
    totalBytes += bytes.byteLength;
    parts.push(bytes);
  }
  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(combined);
  } catch {
    throw new Error("A migration archive is not valid UTF-8.");
  }
}

function createOperationId(): string {
  if (
    typeof crypto === "undefined"
    || typeof crypto.randomUUID !== "function"
  ) {
    throw new Error("Secure operation IDs are unavailable in this browser.");
  }
  return crypto.randomUUID();
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return (
    value !== null
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.values(value).every((item) => typeof item === "boolean")
  );
}

export function mergeBooleanRecordChanges(
  remote: Record<string, boolean>,
  previous: Record<string, boolean>,
  next: Record<string, boolean>,
): Record<string, boolean> {
  const merged = { ...remote };
  const keys = new Set([
    ...Object.keys(previous),
    ...Object.keys(next),
  ]);
  for (const key of keys) {
    if (previous[key] === next[key]) continue;
    if (Object.hasOwn(next, key)) {
      merged[key] = next[key];
    } else {
      delete merged[key];
    }
  }
  return merged;
}

export function mergeBookmarkChanges(
  remote: number[],
  previous: number[],
  next: number[],
): number[] {
  const removed = new Set(
    previous.filter((dayId) => !next.includes(dayId)),
  );
  const added = next.filter((dayId) => !previous.includes(dayId));
  return Array.from(new Set([
    ...remote.filter((dayId) => !removed.has(dayId)),
    ...added,
  ])).sort((left, right) => left - right);
}

export function mergeProjectCheckChanges(
  remote: boolean[],
  previous: boolean[],
  next: boolean[],
): boolean[] | null {
  if (next.length === 0) {
    return JSON.stringify(remote) === JSON.stringify(previous)
      ? null
      : [...remote];
  }
  if (remote.length === 0) return [...next];
  if (remote.length !== next.length) {
    throw new Error("Concurrent project checklist shapes do not match.");
  }
  const merged = [...remote];
  for (let index = 0; index < next.length; index += 1) {
    if (previous[index] === next[index]) continue;
    if (
      previous[index] === undefined
      && next[index] === false
    ) continue;
    merged[index] = next[index];
  }
  return merged;
}

function isBookmarkArray(value: unknown): value is number[] {
  return (
    Array.isArray(value)
    && value.length <= 180
    && value.every((item) =>
      Number.isInteger(item)
      && item >= 1
      && item <= 180
    )
    && new Set(value).size === value.length
  );
}

function isBooleanArray(value: unknown): value is boolean[] {
  return (
    Array.isArray(value)
    && value.every((item) => typeof item === "boolean")
  );
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Non-finite JSON number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => item === undefined ? "null" : canonicalJson(item))
      .join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  throw new TypeError("Value is not JSON-compatible");
}
