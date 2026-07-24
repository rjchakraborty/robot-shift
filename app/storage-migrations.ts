import { curriculumDays, projects } from "./curriculum";
import {
  MISSION_TASK_PARTS,
  type MissionTaskPart,
} from "./mission-progress";
import { themePreferences, type ThemePreference } from "./theme";

export const CURRICULUM_REVISION = 2 as const;
export const FOUNDATION_REVISION_LAST_DAY = 14;

export const TRACKER_STORAGE_KEY = "robot-shift-tracker-v2";
export const LEGACY_TRACKER_STORAGE_KEY = "robot-shift-tracker-v1";
export const LEGACY_TRACKER_ARCHIVE_KEY = "robot-shift-tracker-v1-archive";

export const TUTOR_STORAGE_KEY = "robot-shift-tutor-v2";
export const TUTOR_ACCOUNT_STORAGE_PREFIX = "robot-shift-tutor-account-v2:";
export const TUTOR_PRE_ACCOUNT_OWNER_KEY =
  "robot-shift-tutor-v2-pre-account-owner";
export const LEGACY_TUTOR_STORAGE_KEY = "robot-shift-tutor-v1";
export const LEGACY_TUTOR_ARCHIVE_KEY = "robot-shift-tutor-v1-archive";

export const ROBOT_SHIFT_BACKUP_KIND = "robot-shift-complete-backup" as const;
export const ROBOT_SHIFT_BACKUP_VERSION = 1 as const;
export const ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM = "SHA-256" as const;
export const MAX_ROBOT_SHIFT_BACKUP_BYTES = 5_000_000;

const MAX_TEXT_LENGTH = 5_000;
const MAX_TUTOR_MESSAGE_LENGTH = 7_000;
const MAX_TUTOR_MESSAGES_PER_DAY = 12;
const MAX_TUTOR_DAYS = 14;
const LEGACY_FRAME_LAB_CHECK_COUNT = 4;
const curriculumDayIds = new Set(curriculumDays.map((day) => day.id));
const taskParts: readonly MissionTaskPart[] = MISSION_TASK_PARTS;
const projectChecklistSizes = new Map(
  projects.map((project) => [project.id, project.proof.split(", ").length]),
);

export type TrackerStateV2 = {
  schemaVersion: 2;
  curriculumRevision: 2;
  completed: Record<string, boolean>;
  bookmarks: number[];
  notes: Record<string, string>;
  evidence: Record<string, string>;
  projectChecks: Record<string, boolean[]>;
  startedOn: string;
  weeklyHours: number;
  selectedDay: number;
};

type TrackerStateV1 = Omit<
  TrackerStateV2,
  "schemaVersion" | "curriculumRevision"
> & {
  schemaVersion: 1;
};

export type TrackerLoadResult = {
  state: TrackerStateV2;
  migrated: boolean;
  archivedFoundationDays: number[];
  archivedFrameLab: boolean;
};

export type StoredTutorMode =
  | "ask"
  | "pareto"
  | "simple"
  | "math"
  | "solve"
  | "quiz"
  | "story";

export type StoredTutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: StoredTutorMode;
  model?: string;
};

export type StoredTutorThread = {
  updatedAt: number;
  messages: StoredTutorMessage[];
};

export type TutorStoreV2 = {
  version: 2;
  curriculumRevision: 2;
  threads: Record<string, StoredTutorThread>;
};

export type TutorLoadResult = {
  store: TutorStoreV2;
  migrated: boolean;
  archivedFoundationDays: number[];
};

export type RobotShiftBackupEnvelopeV1 = {
  kind: typeof ROBOT_SHIFT_BACKUP_KIND;
  backupVersion: typeof ROBOT_SHIFT_BACKUP_VERSION;
  tracker: TrackerStateV2;
  tutor: TutorStoreV2;
  theme: ThemePreference;
  trackerLegacyArchive: string | null;
  tutorLegacyArchive: string | null;
  exportedAt: string;
  sourceOrigin: string;
  integrity: {
    algorithm: typeof ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM;
    checksum: string;
  };
};

export type CreateRobotShiftBackupInput = Omit<
  RobotShiftBackupEnvelopeV1,
  "kind" | "backupVersion" | "integrity" | "exportedAt"
> & {
  exportedAt?: string;
};

export type ParsedRobotShiftBackup =
  | {
      format: "complete";
      envelope: RobotShiftBackupEnvelopeV1;
    }
  | {
      format: "tracker";
      tracker: TrackerLoadResult;
    };

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function tutorStorageKeyForUser(uid: string): string {
  const normalized = uid.trim();
  if (
    normalized.length < 1
    || normalized.length > 128
    || !/^[A-Za-z0-9:_-]+$/.test(normalized)
  ) {
    throw new TypeError("Invalid Firebase user ID for tutor storage.");
  }
  return `${TUTOR_ACCOUNT_STORAGE_PREFIX}${normalized}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidDateString(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function readCompleted(value: unknown): Record<string, boolean> | null {
  if (!isRecord(value)) return null;
  const completed: Record<string, boolean> = {};
  for (const [key, done] of Object.entries(value)) {
    const [dayText, part, extra] = key.split(":");
    const dayId = Number(dayText);
    if (
      extra !== undefined ||
      !curriculumDayIds.has(dayId) ||
      !taskParts.includes(part as MissionTaskPart) ||
      typeof done !== "boolean"
    ) return null;
    completed[key] = done;
  }
  return completed;
}

function readTextEntries(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  const entries: Record<string, string> = {};
  for (const [key, text] of Object.entries(value)) {
    const dayId = Number(key);
    if (
      String(dayId) !== key ||
      !curriculumDayIds.has(dayId) ||
      typeof text !== "string" ||
      text.length > MAX_TEXT_LENGTH
    ) return null;
    entries[key] = text;
  }
  return entries;
}

function readBookmarks(value: unknown): number[] | null {
  if (
    !Array.isArray(value) ||
    value.some((dayId) => !Number.isInteger(dayId) || !curriculumDayIds.has(dayId)) ||
    new Set(value).size !== value.length
  ) return null;
  return [...value] as number[];
}

function readProjectChecks(
  value: unknown,
  legacy: boolean,
): Record<string, boolean[]> | null {
  if (!isRecord(value)) return null;
  const checks: Record<string, boolean[]> = {};
  for (const [projectId, projectChecks] of Object.entries(value)) {
    const expectedSize = legacy && projectId === "frame-lab"
      ? LEGACY_FRAME_LAB_CHECK_COUNT
      : projectChecklistSizes.get(projectId);
    if (
      expectedSize === undefined ||
      !Array.isArray(projectChecks) ||
      projectChecks.length !== expectedSize ||
      projectChecks.some((checked) => typeof checked !== "boolean")
    ) return null;
    checks[projectId] = [...projectChecks];
  }
  return checks;
}

function readTrackerObject(
  parsed: unknown,
  schemaVersion: 1 | 2,
): TrackerStateV1 | TrackerStateV2 | null {
  if (
    !isRecord(parsed) ||
    parsed.schemaVersion !== schemaVersion ||
    (schemaVersion === 2 && parsed.curriculumRevision !== CURRICULUM_REVISION)
  ) return null;

  const completed = readCompleted(parsed.completed);
  const notes = readTextEntries(parsed.notes);
  const evidence = readTextEntries(parsed.evidence);
  const projectChecks = readProjectChecks(parsed.projectChecks, schemaVersion === 1);
  const bookmarks = readBookmarks(parsed.bookmarks);
  if (
    completed === null ||
    notes === null ||
    evidence === null ||
    projectChecks === null ||
    bookmarks === null ||
    !isValidDateString(parsed.startedOn) ||
    !Number.isInteger(parsed.weeklyHours) ||
    (parsed.weeklyHours as number) < 4 ||
    (parsed.weeklyHours as number) > 30 ||
    !Number.isInteger(parsed.selectedDay) ||
    !curriculumDayIds.has(parsed.selectedDay as number)
  ) return null;

  const common = {
    completed,
    bookmarks,
    notes,
    evidence,
    projectChecks,
    startedOn: parsed.startedOn,
    weeklyHours: parsed.weeklyHours as number,
    selectedDay: parsed.selectedDay as number,
  };
  return schemaVersion === 2
    ? {
        schemaVersion: 2,
        curriculumRevision: CURRICULUM_REVISION,
        ...common,
      }
    : {
        schemaVersion: 1,
        ...common,
      };
}

function parseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function parseTrackerStateV2(raw: string): TrackerStateV2 | null {
  return readTrackerObject(parseJson(raw), 2) as TrackerStateV2 | null;
}

export function migrateLegacyTrackerState(raw: string): TrackerLoadResult | null {
  const legacy = readTrackerObject(parseJson(raw), 1) as TrackerStateV1 | null;
  if (!legacy) return null;

  const keepDay = (dayId: number) => dayId > FOUNDATION_REVISION_LAST_DAY;
  const completed = Object.fromEntries(
    Object.entries(legacy.completed).filter(([key]) => keepDay(Number(key.split(":")[0]))),
  );
  const notes = Object.fromEntries(
    Object.entries(legacy.notes).filter(([key]) => keepDay(Number(key))),
  );
  const evidence = Object.fromEntries(
    Object.entries(legacy.evidence).filter(([key]) => keepDay(Number(key))),
  );
  const archivedFoundationDays = Array.from(new Set([
    ...Object.keys(legacy.completed).map((key) => Number(key.split(":")[0])),
    ...Object.keys(legacy.notes).map(Number),
    ...Object.keys(legacy.evidence).map(Number),
    ...legacy.bookmarks,
  ].filter((dayId) => !keepDay(dayId)))).sort((a, b) => a - b);
  const { ["frame-lab"]: legacyFrameLab, ...projectChecks } = legacy.projectChecks;

  return {
    state: {
      schemaVersion: 2,
      curriculumRevision: CURRICULUM_REVISION,
      completed,
      bookmarks: legacy.bookmarks.filter(keepDay),
      notes,
      evidence,
      projectChecks,
      startedOn: legacy.startedOn,
      weeklyHours: legacy.weeklyHours,
      selectedDay: keepDay(legacy.selectedDay) ? legacy.selectedDay : 1,
    },
    migrated: true,
    archivedFoundationDays,
    archivedFrameLab: legacyFrameLab !== undefined,
  };
}

export function parseTrackerBackup(raw: string): TrackerLoadResult | null {
  const current = parseTrackerStateV2(raw);
  if (current) {
    return {
      state: current,
      migrated: false,
      archivedFoundationDays: [],
      archivedFrameLab: false,
    };
  }
  return migrateLegacyTrackerState(raw);
}

const tutorModes = new Set<StoredTutorMode>([
  "ask",
  "pareto",
  "simple",
  "math",
  "solve",
  "quiz",
  "story",
]);

function readTutorThreads(value: unknown): Record<string, StoredTutorThread> | null {
  if (!isRecord(value)) return null;
  const threads: Record<string, StoredTutorThread> = {};
  const entries = Object.entries(value)
    .filter(([, thread]) => isRecord(thread) && typeof thread.updatedAt === "number")
    .sort((a, b) => (b[1] as { updatedAt: number }).updatedAt - (a[1] as { updatedAt: number }).updatedAt)
    .slice(0, MAX_TUTOR_DAYS);

  for (const [dayKey, thread] of entries) {
    if (
      !/^(?:[1-9]|[1-9]\d|1[0-7]\d|180)$/.test(dayKey) ||
      !isRecord(thread) ||
      !Array.isArray(thread.messages) ||
      typeof thread.updatedAt !== "number" ||
      !Number.isFinite(thread.updatedAt)
    ) continue;

    const messages: StoredTutorMessage[] = [];
    for (const item of thread.messages.slice(-MAX_TUTOR_MESSAGES_PER_DAY)) {
      if (
        !isRecord(item) ||
        typeof item.id !== "string" ||
        (item.role !== "user" && item.role !== "assistant") ||
        typeof item.content !== "string" ||
        item.content.length === 0 ||
        item.content.length > MAX_TUTOR_MESSAGE_LENGTH
      ) continue;

      const mode = typeof item.mode === "string" && tutorModes.has(item.mode as StoredTutorMode)
        ? item.mode as StoredTutorMode
        : undefined;
      const model = typeof item.model === "string" && item.model.length <= 100
        ? item.model
        : undefined;
      messages.push({
        id: item.id.slice(0, 100),
        role: item.role,
        content: item.content,
        mode,
        model,
      });
    }

    threads[dayKey] = {
      updatedAt: thread.updatedAt,
      messages,
    };
  }
  return threads;
}

function readTutorStore(
  raw: string,
  version: 1 | 2,
): { version: 1 | 2; threads: Record<string, StoredTutorThread> } | null {
  const candidate = parseJson(raw);
  if (
    !isRecord(candidate) ||
    candidate.version !== version ||
    (version === 2 && candidate.curriculumRevision !== CURRICULUM_REVISION)
  ) return null;
  const threads = readTutorThreads(candidate.threads);
  return threads ? { version, threads } : null;
}

export function parseTutorStoreV2(raw: string): TutorStoreV2 | null {
  const current = readTutorStore(raw, 2);
  return current
    ? {
        version: 2,
        curriculumRevision: CURRICULUM_REVISION,
        threads: current.threads,
      }
    : null;
}

export function migrateLegacyTutorStore(raw: string): TutorLoadResult | null {
  const legacy = readTutorStore(raw, 1);
  if (!legacy) return null;

  const archivedFoundationDays = Object.keys(legacy.threads)
    .map(Number)
    .filter((dayId) => dayId <= FOUNDATION_REVISION_LAST_DAY)
    .sort((a, b) => a - b);
  const threads = Object.fromEntries(
    Object.entries(legacy.threads).filter(
      ([dayKey]) => Number(dayKey) > FOUNDATION_REVISION_LAST_DAY,
    ),
  );
  return {
    store: {
      version: 2,
      curriculumRevision: CURRICULUM_REVISION,
      threads,
    },
    migrated: true,
    archivedFoundationDays,
  };
}

export function parseTutorBackup(raw: string): TutorLoadResult | null {
  const current = parseTutorStoreV2(raw);
  if (current) {
    return {
      store: current,
      migrated: false,
      archivedFoundationDays: [],
    };
  }
  return migrateLegacyTutorStore(raw);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return (
    actualKeys.length === expected.length &&
    actualKeys.every((key, index) => key === expected[index])
  );
}

function jsonRoundTrip(value: unknown): unknown | null {
  try {
    const raw = JSON.stringify(value);
    return typeof raw === "string" ? JSON.parse(raw) as unknown : null;
  } catch {
    return null;
  }
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
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  throw new TypeError("Value is not JSON-compatible");
}

function normalizeTrackerForCompleteBackup(
  value: unknown,
): TrackerStateV2 | null {
  const roundTripped = jsonRoundTrip(value);
  if (roundTripped === null) return null;

  let raw: string;
  try {
    raw = JSON.stringify(roundTripped);
  } catch {
    return null;
  }
  const tracker = parseTrackerStateV2(raw);
  if (!tracker) return null;

  try {
    return canonicalJson(roundTripped) === canonicalJson(tracker)
      ? tracker
      : null;
  } catch {
    return null;
  }
}

function normalizeTutorForCompleteBackup(
  value: unknown,
): TutorStoreV2 | null {
  const roundTripped = jsonRoundTrip(value);
  if (roundTripped === null) return null;

  let raw: string;
  try {
    raw = JSON.stringify(roundTripped);
  } catch {
    return null;
  }
  const tutor = parseTutorStoreV2(raw);
  if (!tutor) return null;

  try {
    return canonicalJson(roundTripped) === canonicalJson(tutor)
      ? tutor
      : null;
  } catch {
    return null;
  }
}

function readThemePreference(value: unknown): ThemePreference | null {
  return typeof value === "string" &&
    themePreferences.includes(value as ThemePreference)
    ? value as ThemePreference
    : null;
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const timestamp = new Date(value);
  return !Number.isNaN(timestamp.getTime()) &&
    timestamp.toISOString() === value;
}

function isCanonicalWebOrigin(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.username === "" &&
      parsed.password === "" &&
      parsed.origin === value
    );
  } catch {
    return false;
  }
}

function isWithinBackupSizeLimit(raw: string): boolean {
  if (raw.length > MAX_ROBOT_SHIFT_BACKUP_BYTES) return false;
  return new TextEncoder().encode(raw).byteLength <=
    MAX_ROBOT_SHIFT_BACKUP_BYTES;
}

type RobotShiftBackupPayloadV1 = Omit<
  RobotShiftBackupEnvelopeV1,
  "integrity"
>;

async function checksumForBackupPayload(
  payload: RobotShiftBackupPayloadV1,
): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable");
  }
  const digest = await globalThis.crypto.subtle.digest(
    ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM,
    new TextEncoder().encode(canonicalJson(payload)),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function normalizedBackupPayload(
  candidate: Record<string, unknown>,
): RobotShiftBackupPayloadV1 | null {
  const tracker = normalizeTrackerForCompleteBackup(candidate.tracker);
  const tutor = normalizeTutorForCompleteBackup(candidate.tutor);
  const theme = readThemePreference(candidate.theme);
  if (
    candidate.kind !== ROBOT_SHIFT_BACKUP_KIND ||
    candidate.backupVersion !== ROBOT_SHIFT_BACKUP_VERSION ||
    !tracker ||
    !tutor ||
    !theme ||
    (
      candidate.trackerLegacyArchive !== null &&
      typeof candidate.trackerLegacyArchive !== "string"
    ) ||
    (
      candidate.tutorLegacyArchive !== null &&
      typeof candidate.tutorLegacyArchive !== "string"
    ) ||
    !isCanonicalIsoTimestamp(candidate.exportedAt) ||
    !isCanonicalWebOrigin(candidate.sourceOrigin)
  ) return null;

  return {
    kind: ROBOT_SHIFT_BACKUP_KIND,
    backupVersion: ROBOT_SHIFT_BACKUP_VERSION,
    tracker,
    tutor,
    theme,
    trackerLegacyArchive: candidate.trackerLegacyArchive,
    tutorLegacyArchive: candidate.tutorLegacyArchive,
    exportedAt: candidate.exportedAt,
    sourceOrigin: candidate.sourceOrigin,
  };
}

export async function createRobotShiftBackup(
  input: CreateRobotShiftBackupInput,
): Promise<string> {
  const candidate: Record<string, unknown> = {
    kind: ROBOT_SHIFT_BACKUP_KIND,
    backupVersion: ROBOT_SHIFT_BACKUP_VERSION,
    tracker: input.tracker,
    tutor: input.tutor,
    theme: input.theme,
    trackerLegacyArchive: input.trackerLegacyArchive,
    tutorLegacyArchive: input.tutorLegacyArchive,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    sourceOrigin: input.sourceOrigin,
  };
  const payload = normalizedBackupPayload(candidate);
  if (!payload) {
    throw new TypeError("Robot/Shift backup input is invalid");
  }
  if (!isWithinBackupSizeLimit(JSON.stringify(payload))) {
    throw new RangeError(
      `Robot/Shift backup exceeds ${MAX_ROBOT_SHIFT_BACKUP_BYTES} bytes`,
    );
  }

  const envelope: RobotShiftBackupEnvelopeV1 = {
    ...payload,
    integrity: {
      algorithm: ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM,
      checksum: await checksumForBackupPayload(payload),
    },
  };
  const raw = JSON.stringify(envelope, null, 2);
  if (!isWithinBackupSizeLimit(raw)) {
    throw new RangeError(
      `Robot/Shift backup exceeds ${MAX_ROBOT_SHIFT_BACKUP_BYTES} bytes`,
    );
  }
  return raw;
}

export async function parseRobotShiftBackupEnvelope(
  raw: string,
): Promise<RobotShiftBackupEnvelopeV1 | null> {
  if (!isWithinBackupSizeLimit(raw)) return null;
  const candidate = parseJson(raw);
  if (
    !isRecord(candidate) ||
    !hasExactKeys(candidate, [
      "kind",
      "backupVersion",
      "tracker",
      "tutor",
      "theme",
      "trackerLegacyArchive",
      "tutorLegacyArchive",
      "exportedAt",
      "sourceOrigin",
      "integrity",
    ]) ||
    !isRecord(candidate.integrity) ||
    !hasExactKeys(candidate.integrity, ["algorithm", "checksum"]) ||
    candidate.integrity.algorithm !==
      ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM ||
    typeof candidate.integrity.checksum !== "string" ||
    !/^[a-f0-9]{64}$/.test(candidate.integrity.checksum)
  ) return null;

  const payload = normalizedBackupPayload(candidate);
  if (!payload) return null;

  try {
    const expectedChecksum = await checksumForBackupPayload(payload);
    if (expectedChecksum !== candidate.integrity.checksum) return null;
  } catch {
    return null;
  }

  return {
    ...payload,
    integrity: {
      algorithm: ROBOT_SHIFT_BACKUP_INTEGRITY_ALGORITHM,
      checksum: candidate.integrity.checksum,
    },
  };
}

export async function parseRobotShiftBackup(
  raw: string,
): Promise<ParsedRobotShiftBackup | null> {
  if (!isWithinBackupSizeLimit(raw)) return null;
  const envelope = await parseRobotShiftBackupEnvelope(raw);
  if (envelope) return { format: "complete", envelope };

  const tracker = parseTrackerBackup(raw);
  return tracker ? { format: "tracker", tracker } : null;
}

export function archiveLegacyPayload(
  storage: StorageLike,
  archiveKey: string,
  raw: string,
): "created" | "existing" {
  if (storage.getItem(archiveKey) !== null) return "existing";
  storage.setItem(archiveKey, raw);
  return "created";
}
