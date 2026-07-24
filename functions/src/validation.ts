import { Buffer } from "node:buffer";

import { HttpsError } from "firebase-functions/v2/https";

import {
  tutorModes,
  type LegacyMigrationPayload,
  type StoredTutorMessage,
  type StoredTutorThread,
  type TrackerState,
  type TutorMode,
  type TutorStore,
} from "./types.js";

const MAX_MIGRATION_BYTES = 5_000_000;
const MAX_NOTE_CHARACTERS = 5_000;
const MAX_TUTOR_MESSAGE_CHARACTERS = 7_000;
const MAX_TUTOR_THREADS = 14;
const MAX_TUTOR_MESSAGES = 12;

const projectChecklistSizes = new Map<string, number>([
  ["frame-lab", 6],
  ["ros-rescue", 7],
  ["sense-plan-act", 5],
  ["fleet-ops", 6],
  ["embodied-operator", 6],
  ["field-capstone", 4],
]);

const tutorModeSet = new Set<string>(tutorModes);

export function asRecord(
  value: unknown,
  message = "The request body is invalid.",
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", message);
  }
  return value as Record<string, unknown>;
}

export function hasExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const allowed = new Set([...required, ...optional]);
  return (
    required.every((key) => Object.hasOwn(value, key))
    && Object.keys(value).every((key) => allowed.has(key))
  );
}

export function assertEmptyBody(value: unknown): void {
  const body = asRecord(value);
  if (Object.keys(body).length !== 0) {
    throw new HttpsError(
      "invalid-argument",
      "This operation does not accept request fields.",
    );
  }
}

export function parseDayId(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 180) {
    throw new HttpsError("invalid-argument", "Day must be between 1 and 180.");
  }
  return value as number;
}

export function parseTutorMode(value: unknown): TutorMode {
  if (typeof value !== "string" || !tutorModeSet.has(value)) {
    throw new HttpsError("invalid-argument", "Tutor mode is invalid.");
  }
  return value as TutorMode;
}

export function parseUuid(value: unknown): string {
  if (
    typeof value !== "string"
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "A valid version 4 request ID is required.",
    );
  }
  return value.toLowerCase();
}

export function parseOperationId(value: unknown): string {
  if (
    typeof value !== "string"
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "A valid version 4 operation ID is required.",
    );
  }
  return value.toLowerCase();
}

export function parseQuestion(
  value: unknown,
  maximumCharacters: number,
): string {
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", "Enter a tutor question.");
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maximumCharacters) {
    throw new HttpsError(
      "invalid-argument",
      `Tutor questions must be between 1 and ${maximumCharacters} characters.`,
    );
  }
  return normalized;
}

export function parseLegacyMigrationPayload(
  value: unknown,
): LegacyMigrationPayload {
  const body = asRecord(value, "Migration data is invalid.");
  if (
    !hasExactKeys(
      body,
      [
        "tracker",
        "tutor",
        "theme",
        "trackerLegacyArchive",
        "tutorLegacyArchive",
        "sourceDigest",
      ],
      ["activateImported", "operationId"],
    )
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Migration data contains unsupported fields.",
    );
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(body);
  } catch {
    throw new HttpsError("invalid-argument", "Migration data is not JSON.");
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_MIGRATION_BYTES) {
    throw new HttpsError(
      "invalid-argument",
      "Migration data exceeds the 5 MB limit.",
    );
  }

  if (
    typeof body.sourceDigest !== "string"
    || !/^[a-f0-9]{64}$/.test(body.sourceDigest)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Migration source digest is invalid.",
    );
  }
  if (
    body.trackerLegacyArchive !== null
    && typeof body.trackerLegacyArchive !== "string"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Tracker legacy archive is invalid.",
    );
  }
  if (
    body.tutorLegacyArchive !== null
    && typeof body.tutorLegacyArchive !== "string"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Tutor legacy archive is invalid.",
    );
  }
  if (
    body.activateImported !== undefined
    && typeof body.activateImported !== "boolean"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "activateImported must be a boolean.",
    );
  }
  const activateImported = body.activateImported === true;
  if (activateImported && body.operationId === undefined) {
    throw new HttpsError(
      "invalid-argument",
      "Explicit backup restore requires an operation ID.",
    );
  }
  if (!activateImported && body.operationId !== undefined) {
    throw new HttpsError(
      "invalid-argument",
      "One-time legacy migration does not accept an operation ID.",
    );
  }

  return {
    tracker: parseTracker(body.tracker),
    tutor: parseTutorStore(body.tutor),
    theme: parseTheme(body.theme),
    trackerLegacyArchive: body.trackerLegacyArchive as string | null,
    tutorLegacyArchive: body.tutorLegacyArchive as string | null,
    sourceDigest: body.sourceDigest,
    activateImported,
    operationId: activateImported
      ? parseOperationId(body.operationId)
      : null,
  };
}

export function parseTracker(value: unknown): TrackerState {
  const tracker = asRecord(value, "Course migration data is invalid.");
  if (
    !hasExactKeys(tracker, [
      "schemaVersion",
      "curriculumRevision",
      "completed",
      "bookmarks",
      "notes",
      "evidence",
      "projectChecks",
      "startedOn",
      "weeklyHours",
      "selectedDay",
    ])
    || tracker.schemaVersion !== 2
    || tracker.curriculumRevision !== 2
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Course migration schema is invalid.",
    );
  }

  const completed = parseCompleted(tracker.completed);
  const bookmarks = parseBookmarks(tracker.bookmarks);
  const notes = parseDayTextMap(tracker.notes, "notes");
  const evidence = parseDayTextMap(tracker.evidence, "evidence");
  const projectChecks = parseProjectChecks(tracker.projectChecks);
  if (!validDateString(tracker.startedOn)) {
    throw new HttpsError(
      "invalid-argument",
      "Course start date is invalid.",
    );
  }
  if (
    !Number.isInteger(tracker.weeklyHours)
    || (tracker.weeklyHours as number) < 4
    || (tracker.weeklyHours as number) > 30
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Weekly learning capacity is invalid.",
    );
  }
  const selectedDay = parseDayId(tracker.selectedDay);

  return {
    schemaVersion: 2,
    curriculumRevision: 2,
    completed,
    bookmarks,
    notes,
    evidence,
    projectChecks,
    startedOn: tracker.startedOn,
    weeklyHours: tracker.weeklyHours as number,
    selectedDay,
  };
}

export function parseTutorStore(value: unknown): TutorStore {
  const store = asRecord(value, "Tutor migration data is invalid.");
  if (
    !hasExactKeys(store, ["version", "curriculumRevision", "threads"])
    || store.version !== 2
    || store.curriculumRevision !== 2
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Tutor migration schema is invalid.",
    );
  }
  const rawThreads = asRecord(
    store.threads,
    "Tutor migration threads are invalid.",
  );
  if (Object.keys(rawThreads).length > MAX_TUTOR_THREADS) {
    throw new HttpsError(
      "invalid-argument",
      `Tutor migration is limited to ${MAX_TUTOR_THREADS} day threads.`,
    );
  }

  const threads: Record<string, StoredTutorThread> = {};
  for (const [dayKey, rawThread] of Object.entries(rawThreads)) {
    const dayId = Number(dayKey);
    if (String(dayId) !== dayKey) parseDayId(Number.NaN);
    parseDayId(dayId);
    threads[dayKey] = parseTutorThread(rawThread);
  }

  return {
    version: 2,
    curriculumRevision: 2,
    threads,
  };
}

function parseTutorThread(value: unknown): StoredTutorThread {
  const thread = asRecord(value, "Tutor migration thread is invalid.");
  if (
    !hasExactKeys(thread, ["updatedAt", "messages"])
    || typeof thread.updatedAt !== "number"
    || !Number.isSafeInteger(thread.updatedAt)
    || thread.updatedAt < 0
    || !Array.isArray(thread.messages)
    || thread.messages.length > MAX_TUTOR_MESSAGES
  ) {
    throw new HttpsError("invalid-argument", "Tutor migration thread is invalid.");
  }
  return {
    updatedAt: thread.updatedAt,
    messages: thread.messages.map((message) => parseTutorMessage(message)),
  };
}

function parseTutorMessage(value: unknown): StoredTutorMessage {
  const message = asRecord(value, "Tutor migration message is invalid.");
  if (
    !hasExactKeys(message, ["id", "role", "content"], ["mode", "model"])
    || typeof message.id !== "string"
    || message.id.length < 1
    || message.id.length > 100
    || (message.role !== "user" && message.role !== "assistant")
    || typeof message.content !== "string"
    || message.content.length < 1
    || message.content.length > MAX_TUTOR_MESSAGE_CHARACTERS
    || (
      message.mode !== undefined
      && (typeof message.mode !== "string" || !tutorModeSet.has(message.mode))
    )
    || (
      message.model !== undefined
      && (typeof message.model !== "string" || message.model.length > 100)
    )
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Tutor migration message is invalid.",
    );
  }
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    ...(message.mode === undefined ? {} : { mode: message.mode as TutorMode }),
    ...(message.model === undefined ? {} : { model: message.model }),
  };
}

function parseCompleted(value: unknown): Record<string, boolean> {
  const raw = asRecord(value, "Course completion data is invalid.");
  if (Object.keys(raw).length > 540) {
    throw new HttpsError(
      "invalid-argument",
      "Course completion data is too large.",
    );
  }
  const completed: Record<string, boolean> = {};
  for (const [key, done] of Object.entries(raw)) {
    if (
      !/^(?:[1-9]|[1-9][0-9]|1[0-7][0-9]|180):(learn|build|prove)$/.test(key)
      || typeof done !== "boolean"
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Course completion data is invalid.",
      );
    }
    completed[key] = done;
  }
  return completed;
}

function parseBookmarks(value: unknown): number[] {
  if (
    !Array.isArray(value)
    || value.length > 180
    || value.some((dayId) =>
      !Number.isInteger(dayId) || dayId < 1 || dayId > 180
    )
    || new Set(value).size !== value.length
  ) {
    throw new HttpsError("invalid-argument", "Course bookmarks are invalid.");
  }
  return [...value] as number[];
}

function parseDayTextMap(
  value: unknown,
  label: string,
): Record<string, string> {
  const raw = asRecord(value, `Course ${label} are invalid.`);
  if (Object.keys(raw).length > 180) {
    throw new HttpsError(
      "invalid-argument",
      `Course ${label} are too large.`,
    );
  }
  const parsed: Record<string, string> = {};
  for (const [dayKey, text] of Object.entries(raw)) {
    const dayId = Number(dayKey);
    if (
      String(dayId) !== dayKey
      || dayId < 1
      || dayId > 180
      || typeof text !== "string"
      || text.length > MAX_NOTE_CHARACTERS
    ) {
      throw new HttpsError(
        "invalid-argument",
        `Course ${label} are invalid.`,
      );
    }
    parsed[dayKey] = text;
  }
  return parsed;
}

function parseProjectChecks(value: unknown): Record<string, boolean[]> {
  const raw = asRecord(value, "Project checklist data is invalid.");
  const parsed: Record<string, boolean[]> = {};
  for (const [projectId, checks] of Object.entries(raw)) {
    const expectedSize = projectChecklistSizes.get(projectId);
    if (
      expectedSize === undefined
      || !Array.isArray(checks)
      || checks.length !== expectedSize
      || checks.some((check) => typeof check !== "boolean")
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Project checklist data is invalid.",
      );
    }
    parsed[projectId] = [...checks] as boolean[];
  }
  return parsed;
}

function parseTheme(value: unknown): "system" | "light" | "dark" {
  if (value !== "system" && value !== "light" && value !== "dark") {
    throw new HttpsError(
      "invalid-argument",
      "Theme migration data is invalid.",
    );
  }
  return value;
}

function validDateString(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime())
    && parsed.toISOString().slice(0, 10) === value
  );
}
