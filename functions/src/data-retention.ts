import type {
  DocumentData,
  Firestore,
  QuerySnapshot,
  Transaction,
} from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

import { DATA_RETENTION_POLICY } from "./config.js";

const UNKNOWN_LEGACY_ARCHIVE_BYTES = 5_000_000;

export type DataOperationKind = "migration" | "reset" | "restore";

type DataOperationAdmission = {
  transaction: Transaction;
  database: Firestore;
  uid: string;
  now: Date;
  kind: DataOperationKind;
  operationKey: string;
  addsDataset: boolean;
  addsArchive: boolean;
  archiveBytes: number;
};

export async function admitDataOperation(
  input: DataOperationAdmission,
): Promise<void> {
  const nowMs = input.now.getTime();
  if (!Number.isFinite(nowMs)) {
    throw new HttpsError("internal", "The secure data-operation clock is invalid.");
  }
  if (
    !Number.isSafeInteger(input.archiveBytes)
    || input.archiveBytes < 0
    || input.archiveBytes > UNKNOWN_LEGACY_ARCHIVE_BYTES
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Migration archive accounting is invalid.",
    );
  }

  const controlRef = input.database.doc(
    `users/${input.uid}/dataControls/retention`,
  );
  const datasetQuery = input.database
    .collection(`users/${input.uid}/datasets`)
    .limit(DATA_RETENTION_POLICY.maxDatasetGenerations + 1);
  const archiveQuery = input.database
    .collection(`users/${input.uid}/migrationArchives`)
    .limit(DATA_RETENTION_POLICY.maxMigrationArchives + 1);
  const [controlSnapshot, datasets, archives] = await Promise.all([
    input.transaction.get(controlRef),
    input.transaction.get(datasetQuery),
    input.transaction.get(archiveQuery),
  ]);

  const control = validatedControl(controlSnapshot.exists
    ? controlSnapshot.data()
    : undefined);
  const dayKey = utcDayKey(input.now);
  const operationsToday = control.dayKey === dayKey
    ? readNonNegativeInteger(control.operationsToday)
    : 0;
  const lastOperationAtMs = readNonNegativeInteger(
    control.lastOperationAtMs,
  );
  if (
    lastOperationAtMs > 0
    && nowMs - lastOperationAtMs
      < DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds
  ) {
    throw new HttpsError(
      "resource-exhausted",
      "Wait before starting another reset or import operation.",
    );
  }
  if (
    operationsToday
      >= DATA_RETENTION_POLICY.destructiveOperationsPerUtcDay
  ) {
    throw new HttpsError(
      "resource-exhausted",
      "Today's reset and import limit has been reached.",
    );
  }

  const inventory = retentionInventory(datasets, archives);
  const nextDatasets = inventory.datasetGenerations
    + (input.addsDataset ? 1 : 0);
  const nextArchives = inventory.migrationArchives
    + (input.addsArchive ? 1 : 0);
  const nextArchiveBytes = safeAdd(
    inventory.migrationArchiveBytes,
    input.addsArchive ? input.archiveBytes : 0,
  );
  if (
    nextDatasets > DATA_RETENTION_POLICY.maxDatasetGenerations
    || nextArchives > DATA_RETENTION_POLICY.maxMigrationArchives
    || nextArchiveBytes > DATA_RETENTION_POLICY.maxMigrationArchiveBytes
  ) {
    throw new HttpsError(
      "resource-exhausted",
      "The retained backup limit has been reached. An administrator must prune an archived generation before another reset or import.",
    );
  }

  input.transaction.set(controlRef, {
    schemaVersion: 1,
    dayKey,
    operationsToday: operationsToday + 1,
    totalOperations:
      readNonNegativeInteger(control.totalOperations) + 1,
    lastOperationKind: input.kind,
    lastOperationKey: input.operationKey,
    lastOperationAt: input.now,
    lastOperationAtMs: nowMs,
    nextOperationAllowedAt: new Date(
      nowMs
        + DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
    ),
    datasetGenerationCount: nextDatasets,
    migrationArchiveCount: nextArchives,
    migrationArchiveBytes: nextArchiveBytes,
    limits: {
      destructiveOperationsPerUtcDay:
        DATA_RETENTION_POLICY.destructiveOperationsPerUtcDay,
      minimumDestructiveIntervalMilliseconds:
        DATA_RETENTION_POLICY.minimumDestructiveIntervalMilliseconds,
      maxDatasetGenerations:
        DATA_RETENTION_POLICY.maxDatasetGenerations,
      maxMigrationArchives:
        DATA_RETENTION_POLICY.maxMigrationArchives,
      maxMigrationArchiveBytes:
        DATA_RETENTION_POLICY.maxMigrationArchiveBytes,
    },
    updatedAt: input.now,
  });
}

export function dataOperationExpiresAt(now: Date): Date {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) {
    throw new HttpsError("internal", "The data-operation clock is invalid.");
  }
  return new Date(
    nowMs
      + DATA_RETENTION_POLICY.operationLedgerRetentionDays
        * 24 * 60 * 60 * 1_000,
  );
}

function retentionInventory(
  datasets: QuerySnapshot<DocumentData>,
  archives: QuerySnapshot<DocumentData>,
): {
  datasetGenerations: number;
  migrationArchives: number;
  migrationArchiveBytes: number;
} {
  let migrationArchiveBytes = 0;
  for (const archive of archives.docs) {
    const storedBytes = readOptionalNonNegativeInteger(
      archive.data().rawByteLength,
    );
    migrationArchiveBytes = safeAdd(
      migrationArchiveBytes,
      storedBytes ?? UNKNOWN_LEGACY_ARCHIVE_BYTES,
    );
  }
  return {
    datasetGenerations: datasets.size,
    migrationArchives: archives.size,
    migrationArchiveBytes,
  };
}

function validatedControl(
  value: DocumentData | undefined,
): DocumentData {
  if (value === undefined) return {};
  const validKind = (
    value.lastOperationKind === "migration"
    || value.lastOperationKind === "reset"
    || value.lastOperationKind === "restore"
  );
  const validOperationKey = (
    typeof value.lastOperationKey === "string"
    && value.lastOperationKey.length >= 36
    && value.lastOperationKey.length <= 64
  );
  const operationsToday = readOptionalNonNegativeInteger(
    value.operationsToday,
  );
  const totalOperations = readOptionalNonNegativeInteger(
    value.totalOperations,
  );
  const lastOperationAtMs = readOptionalNonNegativeInteger(
    value.lastOperationAtMs,
  );
  if (
    value.schemaVersion !== 1
    || typeof value.dayKey !== "string"
    || !/^\d{4}-\d{2}-\d{2}$/.test(value.dayKey)
    || operationsToday === undefined
    || operationsToday
      > DATA_RETENTION_POLICY.destructiveOperationsPerUtcDay
    || totalOperations === undefined
    || totalOperations < operationsToday
    || lastOperationAtMs === undefined
    || lastOperationAtMs <= 0
    || !validKind
    || !validOperationKey
  ) {
    throw new HttpsError(
      "failed-precondition",
      "Data-operation retention control requires administrator repair.",
    );
  }
  return value;
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function readOptionalNonNegativeInteger(value: unknown): number | undefined {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= 0
    ? value
    : undefined;
}

function readNonNegativeInteger(value: unknown): number {
  return readOptionalNonNegativeInteger(value) ?? 0;
}

function safeAdd(left: number, right: number): number {
  const value = left + right;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new HttpsError(
      "resource-exhausted",
      "Migration archive accounting exceeded its secure limit.",
    );
  }
  return value;
}
