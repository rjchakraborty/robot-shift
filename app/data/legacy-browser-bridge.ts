import {
  CURRICULUM_REVISION,
  LEGACY_TRACKER_ARCHIVE_KEY,
  LEGACY_TRACKER_STORAGE_KEY,
  LEGACY_TUTOR_ARCHIVE_KEY,
  LEGACY_TUTOR_STORAGE_KEY,
  migrateLegacyTrackerState,
  migrateLegacyTutorStore,
  parseTrackerStateV2,
  parseTutorStoreV2,
  TRACKER_STORAGE_KEY,
  TUTOR_PRE_ACCOUNT_OWNER_KEY,
  TUTOR_STORAGE_KEY,
  tutorStorageKeyForUser,
  type TrackerStateV2,
  type TutorStoreV2,
} from "../storage-migrations";
import {
  parseThemePreference,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "../theme";

export type LegacyBrowserCandidate = {
  input: {
    tracker: TrackerStateV2;
    tutor: TutorStoreV2;
    theme: ThemePreference;
    trackerLegacyArchive: string | null;
    tutorLegacyArchive: string | null;
  };
  consumedKeys: string[];
  summary: {
    completedItems: number;
    notes: number;
    tutorMessages: number;
    unassignedTutor: boolean;
  };
};

type LegacyStorageReader = Pick<Storage, "getItem">;

export function readLegacyBrowserCandidateFromStorage(
  uid: string,
  storage: LegacyStorageReader,
  fallbackTracker: TrackerStateV2,
): LegacyBrowserCandidate | null {
  let currentTrackerRaw: string | null;
  let legacyTrackerRaw: string | null;
  let accountTutorRaw: string | null;
  let globalTutorRaw: string | null;
  let tutorOwnerRaw: string | null;
  let legacyTutorRaw: string | null;
  let themeRaw: string | null;
  let trackerArchiveRaw: string | null;
  let tutorArchiveRaw: string | null;
  try {
    currentTrackerRaw = storage.getItem(TRACKER_STORAGE_KEY);
    legacyTrackerRaw = storage.getItem(LEGACY_TRACKER_STORAGE_KEY);
    accountTutorRaw = storage.getItem(tutorStorageKeyForUser(uid));
    globalTutorRaw = storage.getItem(TUTOR_STORAGE_KEY);
    tutorOwnerRaw = storage.getItem(TUTOR_PRE_ACCOUNT_OWNER_KEY);
    legacyTutorRaw = storage.getItem(LEGACY_TUTOR_STORAGE_KEY);
    themeRaw = storage.getItem(THEME_STORAGE_KEY);
    trackerArchiveRaw = storage.getItem(LEGACY_TRACKER_ARCHIVE_KEY);
    tutorArchiveRaw = storage.getItem(LEGACY_TUTOR_ARCHIVE_KEY);
  } catch {
    return null;
  }

  const consumedKeys = new Set<string>();
  const currentTracker = currentTrackerRaw
    ? parseTrackerStateV2(currentTrackerRaw)
    : null;
  const legacyTrackerMigration = legacyTrackerRaw
    ? migrateLegacyTrackerState(legacyTrackerRaw)
    : null;
  const tracker = currentTracker ?? legacyTrackerMigration?.state ?? null;
  if (currentTracker) {
    consumedKeys.add(TRACKER_STORAGE_KEY);
  } else if (legacyTrackerMigration) {
    consumedKeys.add(LEGACY_TRACKER_STORAGE_KEY);
  }

  const ownsGlobalTutor = tutorOwnerRaw === uid;
  const globalTutorIsUnassigned = tutorOwnerRaw === null;
  const mayClaimGlobalTutor =
    ownsGlobalTutor || globalTutorIsUnassigned;
  const accountTutor = accountTutorRaw
    ? parseTutorStoreV2(accountTutorRaw)
    : null;
  const globalTutor = mayClaimGlobalTutor && globalTutorRaw
    ? parseTutorStoreV2(globalTutorRaw)
    : null;
  const legacyTutorMigration = mayClaimGlobalTutor && legacyTutorRaw
    ? migrateLegacyTutorStore(legacyTutorRaw)
    : null;
  const tutor = accountTutor
    ?? globalTutor
    ?? legacyTutorMigration?.store
    ?? null;
  let consumedOwnedGlobalTutor = false;
  if (accountTutor) {
    consumedKeys.add(tutorStorageKeyForUser(uid));
  } else if (globalTutor) {
    consumedKeys.add(TUTOR_STORAGE_KEY);
    consumedOwnedGlobalTutor = true;
  } else if (legacyTutorMigration) {
    consumedKeys.add(LEGACY_TUTOR_STORAGE_KEY);
    consumedOwnedGlobalTutor = true;
  }

  const theme = parseThemePreference(themeRaw);
  if (
    themeRaw === "system"
    || themeRaw === "light"
    || themeRaw === "dark"
  ) {
    consumedKeys.add(THEME_STORAGE_KEY);
  }

  let trackerLegacyArchive: string | null = null;
  if (trackerArchiveRaw !== null) {
    trackerLegacyArchive = trackerArchiveRaw;
    consumedKeys.add(LEGACY_TRACKER_ARCHIVE_KEY);
  } else if (legacyTrackerMigration && legacyTrackerRaw !== null) {
    trackerLegacyArchive = legacyTrackerRaw;
    consumedKeys.add(LEGACY_TRACKER_STORAGE_KEY);
  }

  let tutorLegacyArchive: string | null = null;
  if (mayClaimGlobalTutor && tutorArchiveRaw !== null) {
    tutorLegacyArchive = tutorArchiveRaw;
    consumedKeys.add(LEGACY_TUTOR_ARCHIVE_KEY);
    consumedOwnedGlobalTutor = true;
  } else if (
    mayClaimGlobalTutor
    && legacyTutorMigration
    && legacyTutorRaw !== null
  ) {
    tutorLegacyArchive = legacyTutorRaw;
    consumedKeys.add(LEGACY_TUTOR_STORAGE_KEY);
    consumedOwnedGlobalTutor = true;
  }
  if (consumedOwnedGlobalTutor && ownsGlobalTutor) {
    consumedKeys.add(TUTOR_PRE_ACCOUNT_OWNER_KEY);
  }

  if (
    !tracker
    && !tutor
    && theme === "system"
    && !trackerLegacyArchive
    && !tutorLegacyArchive
  ) return null;

  const normalizedTracker = tracker ?? fallbackTracker;
  const normalizedTutor: TutorStoreV2 = tutor ?? {
    version: 2,
    curriculumRevision: CURRICULUM_REVISION,
    threads: {},
  };
  return {
    input: {
      tracker: normalizedTracker,
      tutor: normalizedTutor,
      theme,
      trackerLegacyArchive,
      tutorLegacyArchive,
    },
    consumedKeys: [...consumedKeys],
    summary: {
      completedItems: Object.values(normalizedTracker.completed)
        .filter(Boolean).length,
      notes: new Set([
        ...Object.keys(normalizedTracker.notes),
        ...Object.keys(normalizedTracker.evidence),
      ]).size,
      tutorMessages: Object.values(normalizedTutor.threads)
        .reduce((sum, thread) => sum + thread.messages.length, 0),
      unassignedTutor: globalTutorIsUnassigned && consumedOwnedGlobalTutor,
    },
  };
}

export function removeConsumedLegacyBrowserData(
  storage: Pick<Storage, "removeItem">,
  consumedKeys: readonly string[],
): void {
  for (const key of new Set(consumedKeys)) {
    storage.removeItem(key);
  }
}
