import { curriculumDays, projects } from "./curriculum";
import {
  MISSION_TASK_PARTS,
  type MissionTaskPart,
} from "./mission-progress";

export const CURRICULUM_REVISION = 2 as const;
export const FOUNDATION_REVISION_LAST_DAY = 14;

export const TRACKER_STORAGE_KEY = "robot-shift-tracker-v2";
export const LEGACY_TRACKER_STORAGE_KEY = "robot-shift-tracker-v1";
export const LEGACY_TRACKER_ARCHIVE_KEY = "robot-shift-tracker-v1-archive";

export const TUTOR_STORAGE_KEY = "robot-shift-tutor-v2";
export const LEGACY_TUTOR_STORAGE_KEY = "robot-shift-tutor-v1";
export const LEGACY_TUTOR_ARCHIVE_KEY = "robot-shift-tutor-v1-archive";

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

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

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

export function archiveLegacyPayload(
  storage: StorageLike,
  archiveKey: string,
  raw: string,
): "created" | "existing" {
  if (storage.getItem(archiveKey) !== null) return "existing";
  storage.setItem(archiveKey, raw);
  return "created";
}
