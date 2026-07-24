"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useAuth } from "../auth/auth-context";
import {
  createCloudMigrationDigest,
  loadAllCloudTutorThreads,
  loadCloudCourseState,
  loadCloudMigrationArchives,
  migrateLegacyDataToCloud,
  resetCloudCourseData,
  saveCloudCourseChanges,
  saveCloudPerformanceMonitoring,
  saveCloudTheme,
} from "../firestore-data";
import {
  createRobotShiftBackup,
  CURRICULUM_REVISION,
  parseRobotShiftBackup,
  type TrackerStateV2,
  type TutorStoreV2,
} from "../storage-migrations";
import { type ThemePreference } from "../theme";
import {
  readLegacyBrowserCandidateFromStorage,
  removeConsumedLegacyBrowserData,
  type LegacyBrowserCandidate,
} from "./legacy-browser-bridge";

const SAVE_DEBOUNCE_MS = 600;

export const EMPTY_TRACKER_STATE: TrackerStateV2 = {
  schemaVersion: 2,
  curriculumRevision: CURRICULUM_REVISION,
  completed: {},
  bookmarks: [],
  notes: {},
  evidence: {},
  projectChecks: {},
  startedOn: "",
  weeklyHours: 10,
  selectedDay: 1,
};

type PersistTarget = {
  uid: string;
  datasetId: string;
  generation: number;
};

type CourseDataContextValue = {
  tracker: TrackerStateV2;
  setTracker: Dispatch<SetStateAction<TrackerStateV2>>;
  theme: ThemePreference;
  performanceMonitoring: boolean;
  ready: boolean;
  busy: boolean;
  dirty: boolean;
  status: string;
  error: string | null;
  legacyBrowserCandidate: LegacyBrowserCandidate["summary"] | null;
  saveThemePreference: (theme: ThemePreference) => Promise<void>;
  savePerformanceMonitoringPreference: (enabled: boolean) => Promise<void>;
  migrateLegacyBrowserData: () => Promise<"migrated" | "retained">;
  exportCloudBackup: (sourceOrigin: string) => Promise<string>;
  importCloudBackup: (raw: string) => Promise<string>;
  resetCloudData: () => Promise<void>;
  reloadCloudData: () => Promise<void>;
  retryCloudSave: () => Promise<void>;
};

const CourseDataContext = createContext<CourseDataContextValue | null>(null);

class OperationSupersededError extends Error {
  constructor() {
    super("A newer Firestore dataset became active.");
    this.name = "OperationSupersededError";
  }
}

export function CourseDataProvider({ children }: { children: ReactNode }) {
  const {
    cloudError,
    cloudLoading,
    datasetId,
    loading: authLoading,
    registerBeforeSignOut,
    refreshCloudAccount,
    user,
  } = useAuth();
  const [tracker, setTrackerState] =
    useState<TrackerStateV2>(EMPTY_TRACKER_STATE);
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [performanceMonitoring, setPerformanceMonitoring] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("Checking secure cloud data…");
  const [error, setError] = useState<string | null>(null);
  const [legacyCandidate, setLegacyCandidate] =
    useState<LegacyBrowserCandidate | null>(null);
  const baselineRef = useRef<TrackerStateV2 | null>(null);
  const baselineThemeRef = useRef<ThemePreference>("system");
  const baselinePerformanceMonitoringRef = useRef(false);
  const trackerRef = useRef(tracker);
  const themeRef = useRef(theme);
  const performanceMonitoringRef = useRef(performanceMonitoring);
  const generationRef = useRef(0);
  const identityKeyRef = useRef<string | null>(null);
  const activeTargetRef = useRef<PersistTarget | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveTimerRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const userUid = user?.uid ?? null;
  const userEmailVerified = Boolean(user?.emailVerified);

  const setOperationBusy = useCallback((nextBusy: boolean) => {
    busyRef.current = nextBusy;
    setBusy(nextBusy);
  }, []);

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const isCurrentTarget = useCallback((target: PersistTarget) => {
    const current = activeTargetRef.current;
    return Boolean(
      current
      && current.uid === target.uid
      && current.datasetId === target.datasetId
      && current.generation === target.generation,
    );
  }, []);

  const isCurrentUid = useCallback((uid: string) => (
    activeTargetRef.current?.uid === uid
  ), []);

  const refreshDirtyState = useCallback(() => {
    const isDirty = Boolean(
      baselineRef.current
      && (
        trackerRef.current !== baselineRef.current
        || themeRef.current !== baselineThemeRef.current
        || performanceMonitoringRef.current
          !== baselinePerformanceMonitoringRef.current
      )
    );
    setDirty(isDirty);
    return isDirty;
  }, []);

  const loadCloudDataForTarget = useCallback(async (
    target: PersistTarget,
  ) => {
    const loaded = await loadCloudCourseState(
      target.uid,
      withLocalStartDate(EMPTY_TRACKER_STATE),
    );
    if (!loaded) {
      throw new Error("The active Firestore course dataset is missing.");
    }
    if (loaded.datasetId !== target.datasetId) {
      throw new Error("The active Firestore dataset changed while loading.");
    }
    if (!isCurrentTarget(target)) return false;
    baselineRef.current = loaded.tracker;
    baselineThemeRef.current = loaded.theme;
    baselinePerformanceMonitoringRef.current = loaded.performanceMonitoring;
    trackerRef.current = loaded.tracker;
    themeRef.current = loaded.theme;
    performanceMonitoringRef.current = loaded.performanceMonitoring;
    setTrackerState(loaded.tracker);
    setTheme(loaded.theme);
    setPerformanceMonitoring(loaded.performanceMonitoring);
    setDirty(false);
    setReady(true);
    setStatus("Saved in Cloud Firestore");
    setError(null);
    return true;
  }, [isCurrentTarget]);

  const persistDirtyData = useCallback(async (target: PersistTarget) => {
    if (!isCurrentTarget(target) || !baselineRef.current) return;

    const trackerSnapshot = trackerRef.current;
    const previousTracker = baselineRef.current;
    if (trackerSnapshot !== previousTracker) {
      await saveCloudCourseChanges(
        target.uid,
        target.datasetId,
        previousTracker,
        trackerSnapshot,
      );
      if (!isCurrentTarget(target)) return;
      baselineRef.current = trackerSnapshot;
    }

    const themeSnapshot = themeRef.current;
    if (themeSnapshot !== baselineThemeRef.current) {
      await saveCloudTheme(target.uid, target.datasetId, themeSnapshot);
      if (!isCurrentTarget(target)) return;
      baselineThemeRef.current = themeSnapshot;
    }

    const performanceMonitoringSnapshot = performanceMonitoringRef.current;
    if (
      performanceMonitoringSnapshot
      !== baselinePerformanceMonitoringRef.current
    ) {
      await saveCloudPerformanceMonitoring(
        target.uid,
        target.datasetId,
        performanceMonitoringSnapshot,
      );
      if (!isCurrentTarget(target)) return;
      baselinePerformanceMonitoringRef.current =
        performanceMonitoringSnapshot;
      if (
        performanceMonitoringRef.current === performanceMonitoringSnapshot
      ) {
        setPerformanceMonitoring(performanceMonitoringSnapshot);
      }
    }

    if (!isCurrentTarget(target)) return;
    const remainsDirty = refreshDirtyState();
    setStatus(remainsDirty
      ? "Changes pending Cloud Firestore save"
      : "Saved in Cloud Firestore");
    setError(null);
  }, [isCurrentTarget, refreshDirtyState]);

  const enqueueSave = useCallback((target: PersistTarget) => {
    const operation = saveQueueRef.current
      .catch(() => undefined)
      .then(() => persistDirtyData(target));
    saveQueueRef.current = operation.catch(() => undefined);
    return operation;
  }, [persistDirtyData]);

  const flushPendingWrites = useCallback(async (
    target = activeTargetRef.current,
  ) => {
    clearSaveTimer();
    await saveQueueRef.current;
    if (!target || !isCurrentTarget(target) || !baselineRef.current) return;
    if (!refreshDirtyState()) return;
    setStatus("Saving pending changes to Cloud Firestore…");
    try {
      await enqueueSave(target);
      if (isCurrentTarget(target) && refreshDirtyState()) {
        // One bounded follow-up captures an edit made while the first write
        // was in flight without creating an unbounded retry loop.
        await enqueueSave(target);
      }
    } catch {
      if (isCurrentTarget(target)) {
        setDirty(true);
        setStatus("Cloud save failed");
        setError(
          "Unsaved changes are still in this tab. Retry before logging out.",
        );
      }
      throw new Error("Course changes could not be saved. You are still signed in.");
    }
  }, [
    clearSaveTimer,
    enqueueSave,
    isCurrentTarget,
    refreshDirtyState,
  ]);

  const invalidateSaveGeneration = useCallback((
    uid: string,
    nextDatasetId: string,
  ): PersistTarget => {
    clearSaveTimer();
    const target = {
      uid,
      datasetId: nextDatasetId,
      generation: ++generationRef.current,
    };
    activeTargetRef.current = target;
    saveQueueRef.current = Promise.resolve();
    return target;
  }, [clearSaveTimer]);

  const setTracker: Dispatch<SetStateAction<TrackerStateV2>> = useCallback((
    action: SetStateAction<TrackerStateV2>,
  ) => {
    if (busyRef.current) return;
    const next = typeof action === "function"
      ? action(trackerRef.current)
      : action;
    trackerRef.current = next;
    if (baselineRef.current && next !== baselineRef.current) {
      setDirty(true);
    }
    setTrackerState(next);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      if (authLoading || (cloudLoading && !datasetId)) {
        setStatus("Checking secure cloud data…");
        return;
      }
      const identityKey =
        `${userUid ?? "anonymous"}:${userEmailVerified}:${datasetId ?? "none"}`;
      if (identityKeyRef.current === identityKey) {
        if (cloudError && !busyRef.current) {
          setError(cloudError);
          setStatus("Cloud saving unavailable");
        }
        return;
      }
      identityKeyRef.current = identityKey;
      const generation = ++generationRef.current;
      clearSaveTimer();
      activeTargetRef.current = null;
      baselineRef.current = null;
      baselineThemeRef.current = "system";
      baselinePerformanceMonitoringRef.current = false;
      saveQueueRef.current = Promise.resolve();
      busyRef.current = false;
      setBusy(false);
      setDirty(false);
      if (!active || generation !== generationRef.current) return;
      setReady(false);
      setError(null);
      setLegacyCandidate(null);
      const emptyState = withLocalStartDate(EMPTY_TRACKER_STATE);
      trackerRef.current = emptyState;
      themeRef.current = "system";
      performanceMonitoringRef.current = false;
      setTrackerState(emptyState);
      setTheme("system");
      setPerformanceMonitoring(false);

      if (!userUid) {
        setReady(true);
        setStatus("Sign in to save course progress");
        return;
      }
      if (!userEmailVerified) {
        setReady(true);
        setStatus("Verify your email to save course progress");
        return;
      }
      if (cloudError || !datasetId) {
        setReady(true);
        setStatus("Cloud saving unavailable");
        setError(cloudError ?? "The secure Firestore dataset is unavailable.");
        return;
      }

      const target = {
        uid: userUid,
        datasetId,
        generation,
      };
      activeTargetRef.current = target;
      setStatus("Loading Cloud Firestore…");
      try {
        const [, candidate] = await Promise.all([
          loadCloudDataForTarget(target),
          readLegacyBrowserCandidate(userUid),
        ]);
        if (
          active
          && isCurrentTarget(target)
        ) {
          setLegacyCandidate(candidate);
        }
      } catch {
        if (!active || !isCurrentTarget(target)) return;
        setReady(true);
        setStatus("Cloud saving unavailable");
        setError("Your Firestore course data could not be loaded.");
      }
    });
    return () => {
      active = false;
    };
  }, [
    authLoading,
    clearSaveTimer,
    cloudError,
    cloudLoading,
    datasetId,
    isCurrentTarget,
    loadCloudDataForTarget,
    userEmailVerified,
    userUid,
  ]);

  useEffect(() => {
    if (
      !ready
      || !user?.emailVerified
      || !datasetId
      || !baselineRef.current
      || tracker === baselineRef.current
      || busy
    ) return;

    clearSaveTimer();
    const target = activeTargetRef.current;
    if (!target) return;
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      if (!isCurrentTarget(target) || busyRef.current) return;
      setStatus("Saving to Cloud Firestore…");
      void enqueueSave(target)
        .catch(() => {
          if (!isCurrentTarget(target)) return;
          setDirty(true);
          setStatus("Cloud save failed");
          setError(
            "Unsaved changes are still in this tab. Use Retry cloud save before logging out.",
          );
        });
    }, SAVE_DEBOUNCE_MS);
    return clearSaveTimer;
  }, [
    busy,
    clearSaveTimer,
    datasetId,
    enqueueSave,
    isCurrentTarget,
    ready,
    tracker,
    user?.emailVerified,
  ]);

  const saveThemePreference = useCallback(async (
    nextTheme: ThemePreference,
  ) => {
    if (busyRef.current) return;
    themeRef.current = nextTheme;
    setTheme(nextTheme);
    if (!user?.emailVerified || !datasetId) {
      setStatus("Sign in with a verified account to save this theme");
      return;
    }
    const target = activeTargetRef.current;
    if (!target || !isCurrentTarget(target)) {
      throw new Error("The active Firestore dataset is unavailable.");
    }
    setDirty(true);
    try {
      await enqueueSave(target);
    } catch {
      if (isCurrentTarget(target)) {
        setDirty(true);
        setStatus("Cloud save failed");
        setError(
          "The theme changed for this tab but is still pending a Firestore save.",
        );
      }
      throw new Error("Theme preference was not saved.");
    }
  }, [datasetId, enqueueSave, isCurrentTarget, user?.emailVerified]);

  const savePerformanceMonitoringPreference = useCallback(async (
    enabled: boolean,
  ) => {
    if (busyRef.current) {
      throw new Error("Another cloud data operation is already running.");
    }
    if (!user?.emailVerified || !datasetId) {
      throw new Error(
        "Sign in with a verified account to change performance monitoring.",
      );
    }
    const target = activeTargetRef.current;
    if (!target || !isCurrentTarget(target)) {
      throw new Error("The active Firestore dataset is unavailable.");
    }
    performanceMonitoringRef.current = enabled;
    // Revocation stops collection immediately. Enabling waits for a confirmed
    // Firestore write so a transient save failure cannot start the SDK.
    if (!enabled) setPerformanceMonitoring(false);
    setDirty(true);
    try {
      await enqueueSave(target);
    } catch {
      if (isCurrentTarget(target)) {
        setDirty(true);
        setStatus("Cloud save failed");
        setError(
          "The performance preference is pending a Firestore save.",
        );
      }
      throw new Error("Performance monitoring preference was not saved.");
    }
  }, [datasetId, enqueueSave, isCurrentTarget, user?.emailVerified]);

  const beginExclusiveOperation = useCallback(async (
    operationStatus: string,
  ) => {
    if (busyRef.current) {
      throw new Error("Another cloud data operation is already running.");
    }
    const target = activeTargetRef.current;
    if (!target || !isCurrentTarget(target)) {
      throw new Error("The active Firestore dataset is unavailable.");
    }
    setOperationBusy(true);
    try {
      await flushPendingWrites(target);
      if (!isCurrentTarget(target)) {
        throw new Error("The signed-in account changed during the operation.");
      }
      const invalidatedTarget = invalidateSaveGeneration(
        target.uid,
        target.datasetId,
      );
      setStatus(operationStatus);
      setError(null);
      return invalidatedTarget;
    } catch (caught) {
      setOperationBusy(false);
      throw caught;
    }
  }, [
    flushPendingWrites,
    invalidateSaveGeneration,
    isCurrentTarget,
    setOperationBusy,
  ]);

  const activateAndLoadDataset = useCallback(async (
    uid: string,
    nextDatasetId: string,
  ) => {
    identityKeyRef.current = `${uid}:true:${nextDatasetId}`;
    const target = invalidateSaveGeneration(uid, nextDatasetId);
    baselineRef.current = null;
    baselineThemeRef.current = "system";
    baselinePerformanceMonitoringRef.current = false;
    setReady(false);
    const loaded = await loadCloudDataForTarget(target);
    if (!loaded) {
      throw new Error("The Firestore readback was superseded.");
    }
  }, [invalidateSaveGeneration, loadCloudDataForTarget]);

  const activateExpectedDataset = useCallback(async (
    uid: string,
    expectedDatasetId: string,
  ) => {
    const canonicalDatasetId = await refreshCloudAccount();
    if (!canonicalDatasetId) {
      throw new Error("The active Firestore dataset could not be confirmed.");
    }
    await activateAndLoadDataset(uid, canonicalDatasetId);
    if (canonicalDatasetId !== expectedDatasetId) {
      throw new OperationSupersededError();
    }
  }, [activateAndLoadDataset, refreshCloudAccount]);

  const migrateLegacyBrowserData = useCallback(async () => {
    if (!user?.emailVerified || !datasetId || !legacyCandidate) {
      throw new Error("No eligible browser data is available to migrate.");
    }
    const operationTarget = await beginExclusiveOperation(
      "Moving browser data into Cloud Firestore…",
    );
    let serverMutationStarted = false;
    try {
      const sourceDigest = await createCloudMigrationDigest(
        legacyCandidate.input,
      );
      if (!isCurrentTarget(operationTarget)) {
        throw new Error("The signed-in account changed during migration.");
      }
      serverMutationStarted = true;
      const result = await migrateLegacyDataToCloud({
        ...legacyCandidate.input,
        sourceDigest,
        activateImported: false,
      });
      if (!isCurrentTarget(operationTarget)) {
        throw new Error("The signed-in account changed during migration.");
      }
      if (result.retainedCloudData) {
        await activateExpectedDataset(user.uid, result.datasetId);
        setStatus("Existing Firestore data kept");
        setError(
          "Browser data was preserved because this account already has course data. Export from the original site and use Import backup only if you intend to replace it.",
        );
        return "retained";
      }
      await activateExpectedDataset(user.uid, result.datasetId);
      removeLegacyBrowserData(legacyCandidate.consumedKeys);
      setLegacyCandidate(null);
      setStatus("Browser data secured in Cloud Firestore");
      return "migrated";
    } catch (caught) {
      const superseded = caught instanceof OperationSupersededError;
      if (!superseded && !isCurrentUid(operationTarget.uid)) {
        throw new Error("Browser migration was cancelled after the account changed.");
      }
      if (serverMutationStarted && !superseded) setReady(false);
      setStatus(superseded
        ? "Browser migration superseded"
        : "Browser migration failed");
      setError(superseded
        ? "Another session changed the active dataset. Its canonical Firestore data was loaded; browser data remains untouched."
        : serverMutationStarted
          ? "Nothing was removed from this browser. Reload Firestore before editing because the server result may be uncertain."
          : "Nothing was removed from this browser because migration validation failed.");
      throw new Error("Browser data migration failed.");
    } finally {
      setOperationBusy(false);
    }
  }, [
    activateExpectedDataset,
    beginExclusiveOperation,
    datasetId,
    isCurrentTarget,
    isCurrentUid,
    legacyCandidate,
    setOperationBusy,
    user,
  ]);

  const exportCloudBackup = useCallback(async (sourceOrigin: string) => {
    if (!user?.emailVerified || !datasetId || !ready) {
      throw new Error("Sign in and wait for Firestore to load before exporting.");
    }
    const target = await beginExclusiveOperation(
      "Preparing a consistent Firestore backup…",
    );
    try {
      const [loaded, tutor, archives] = await Promise.all([
        loadCloudCourseState(
          target.uid,
          withLocalStartDate(EMPTY_TRACKER_STATE),
        ),
        loadAllCloudTutorThreads(target.uid, target.datasetId),
        loadCloudMigrationArchives(target.uid, target.datasetId),
      ]);
      if (
        !loaded
        || loaded.datasetId !== target.datasetId
        || !isCurrentTarget(target)
      ) {
        throw new Error("The signed-in account changed during export.");
      }
      const payload = createRobotShiftBackup({
        tracker: loaded.tracker,
        tutor,
        theme: loaded.theme,
        trackerLegacyArchive: archives.trackerLegacyArchive,
        tutorLegacyArchive: archives.tutorLegacyArchive,
        sourceOrigin,
      });
      setStatus("Saved in Cloud Firestore");
      return payload;
    } finally {
      setOperationBusy(false);
    }
  }, [
    beginExclusiveOperation,
    datasetId,
    isCurrentTarget,
    ready,
    setOperationBusy,
    user,
  ]);

  const importCloudBackup = useCallback(async (raw: string) => {
    if (!user?.emailVerified || !datasetId) {
      throw new Error("Sign in with a verified account before importing.");
    }
    const operationTarget = await beginExclusiveOperation(
      "Validating and importing into Cloud Firestore…",
    );
    let serverMutationStarted = false;
    try {
      const parsed = await parseRobotShiftBackup(raw);
      if (!parsed) throw new Error("The backup is invalid.");
      if (!isCurrentTarget(operationTarget)) {
        throw new Error("The signed-in account changed during import.");
      }
      const emptyTutor: TutorStoreV2 = {
        version: 2,
        curriculumRevision: CURRICULUM_REVISION,
        threads: {},
      };
      const input = parsed.format === "complete"
        ? {
            tracker: parsed.envelope.tracker,
            tutor: parsed.envelope.tutor,
            theme: parsed.envelope.theme,
            trackerLegacyArchive: parsed.envelope.trackerLegacyArchive,
            tutorLegacyArchive: parsed.envelope.tutorLegacyArchive,
          }
        : {
            tracker: parsed.tracker.state,
            tutor: emptyTutor,
            theme: "system" as const,
            trackerLegacyArchive: parsed.tracker.migrated ? raw : null,
            tutorLegacyArchive: null,
          };
      const sourceDigest = await createCloudMigrationDigest(input);
      if (!isCurrentTarget(operationTarget)) {
        throw new Error("The signed-in account changed during import.");
      }
      serverMutationStarted = true;
      const result = await migrateLegacyDataToCloud({
        ...input,
        sourceDigest,
        activateImported: true,
      });
      if (!isCurrentTarget(operationTarget)) {
        throw new Error("The signed-in account changed during import.");
      }
      if (result.retainedCloudData) {
        throw new Error("The imported dataset was preserved but not activated.");
      }
      await activateExpectedDataset(user.uid, result.datasetId);
      setStatus("Backup imported into Cloud Firestore");
      return parsed.format === "complete"
        ? "Complete Firestore backup imported."
        : parsed.tracker.migrated
          ? "Version 1 course backup migrated and imported."
          : "Course backup imported into Firestore.";
    } catch (caught) {
      const superseded = caught instanceof OperationSupersededError;
      if (!superseded && !isCurrentUid(operationTarget.uid)) {
        throw new Error("Backup import was cancelled after the account changed.");
      }
      if (serverMutationStarted && !superseded) setReady(false);
      setStatus(superseded ? "Backup import superseded" : "Backup import failed");
      setError(superseded
        ? "Another session changed the active dataset. Its canonical Firestore data was loaded instead."
        : serverMutationStarted
          ? "Import confirmation failed. Reload Firestore before editing; the server may already have activated the imported dataset."
          : "The backup was rejected before any Firestore import was attempted.");
      throw caught;
    } finally {
      setOperationBusy(false);
    }
  }, [
    activateExpectedDataset,
    beginExclusiveOperation,
    datasetId,
    isCurrentTarget,
    isCurrentUid,
    setOperationBusy,
    user,
  ]);

  const resetCloudData = useCallback(async () => {
    if (!user?.emailVerified) {
      throw new Error("Sign in with a verified account before resetting.");
    }
    const operationTarget = await beginExclusiveOperation(
      "Creating a clean Firestore dataset…",
    );
    let serverMutationStarted = false;
    try {
      serverMutationStarted = true;
      const result = await resetCloudCourseData();
      if (!isCurrentTarget(operationTarget)) {
        throw new Error("The signed-in account changed during reset.");
      }
      await activateExpectedDataset(user.uid, result.datasetId);
      setStatus("Cloud course data reset");
    } catch (caught) {
      const superseded = caught instanceof OperationSupersededError;
      if (!superseded && !isCurrentUid(operationTarget.uid)) {
        throw new Error("Cloud reset was cancelled after the account changed.");
      }
      if (serverMutationStarted && !superseded) setReady(false);
      setStatus(superseded ? "Cloud reset superseded" : "Cloud reset failed");
      setError(superseded
        ? "Another session changed the active dataset. Its canonical Firestore data was loaded instead."
        : "Reset confirmation failed. Reload Firestore before editing; the server may already have activated a clean dataset.");
      throw caught;
    } finally {
      setOperationBusy(false);
    }
  }, [
    activateExpectedDataset,
    beginExclusiveOperation,
    isCurrentTarget,
    isCurrentUid,
    setOperationBusy,
    user,
  ]);

  const retryCloudSave = useCallback(async () => {
    if (busyRef.current) {
      throw new Error("Wait for the current cloud operation to finish.");
    }
    await flushPendingWrites();
  }, [flushPendingWrites]);

  const reloadCloudData = useCallback(async () => {
    const target = await beginExclusiveOperation(
      "Reloading Cloud Firestore…",
    );
    try {
      const nextDatasetId = await refreshCloudAccount();
      if (!nextDatasetId) {
        throw new Error("The signed-in account changed during reload.");
      }
      await activateAndLoadDataset(target.uid, nextDatasetId);
      setStatus("Saved in Cloud Firestore");
      setError(null);
    } catch (caught) {
      if (!isCurrentUid(target.uid)) throw caught;
      setReady(false);
      setStatus("Cloud reload failed");
      setError("Firestore is still unavailable. Persisted controls remain locked.");
      throw caught;
    } finally {
      setOperationBusy(false);
    }
  }, [
    activateAndLoadDataset,
    beginExclusiveOperation,
    isCurrentUid,
    refreshCloudAccount,
    setOperationBusy,
  ]);

  const flushBeforeSignOut = useCallback(async () => {
    if (busyRef.current) {
      throw new Error(
        "Wait for the current Firestore operation to finish before logging out.",
      );
    }
    const target = activeTargetRef.current;
    if (!target) return;
    setOperationBusy(true);
    try {
      await flushPendingWrites(target);
    } finally {
      setOperationBusy(false);
    }
  }, [flushPendingWrites, setOperationBusy]);

  useEffect(
    () => registerBeforeSignOut(flushBeforeSignOut),
    [flushBeforeSignOut, registerBeforeSignOut],
  );

  const value = useMemo<CourseDataContextValue>(() => ({
    tracker,
    setTracker,
    theme,
    performanceMonitoring,
    ready,
    busy,
    dirty,
    status,
    error,
    legacyBrowserCandidate: legacyCandidate?.summary ?? null,
    saveThemePreference,
    savePerformanceMonitoringPreference,
    migrateLegacyBrowserData,
    exportCloudBackup,
    importCloudBackup,
    resetCloudData,
    reloadCloudData,
    retryCloudSave,
  }), [
    busy,
    dirty,
    error,
    exportCloudBackup,
    importCloudBackup,
    legacyCandidate,
    reloadCloudData,
    migrateLegacyBrowserData,
    ready,
    resetCloudData,
    retryCloudSave,
    saveThemePreference,
    savePerformanceMonitoringPreference,
    setTracker,
    status,
    theme,
    performanceMonitoring,
    tracker,
  ]);

  return (
    <CourseDataContext.Provider value={value}>
      {children}
    </CourseDataContext.Provider>
  );
}

export function useCourseData(): CourseDataContextValue {
  const context = useContext(CourseDataContext);
  if (!context) {
    throw new Error("useCourseData must be used inside CourseDataProvider.");
  }
  return context;
}

function localDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function withLocalStartDate(state: TrackerStateV2): TrackerStateV2 {
  return {
    ...state,
    completed: { ...state.completed },
    bookmarks: [...state.bookmarks],
    notes: { ...state.notes },
    evidence: { ...state.evidence },
    projectChecks: Object.fromEntries(
      Object.entries(state.projectChecks)
        .map(([key, checks]) => [key, [...checks]]),
    ),
    startedOn: state.startedOn || localDate(),
  };
}

export async function readLegacyBrowserCandidate(
  uid: string,
): Promise<LegacyBrowserCandidate | null> {
  // This is a read-only, one-time bridge for data created before Firestore.
  // New Robot/Shift state is never written to browser storage.
  return readLegacyBrowserCandidateFromStorage(
    uid,
    window.localStorage,
    withLocalStartDate(EMPTY_TRACKER_STATE),
  );
}

function removeLegacyBrowserData(consumedKeys: readonly string[]): void {
  removeConsumedLegacyBrowserData(window.localStorage, consumedKeys);
}
