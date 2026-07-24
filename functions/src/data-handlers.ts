import { Buffer } from "node:buffer";

import type { Auth } from "firebase-admin/auth";
import type {
  DocumentData,
  DocumentReference,
  Firestore,
  QuerySnapshot,
  Transaction,
} from "firebase-admin/firestore";
import {
  HttpsError,
  type CallableRequest,
} from "firebase-functions/v2/https";

import { TUTOR_MODEL_POLICY } from "./config.js";
import {
  computeLegacySourceDigest,
  deterministicId,
} from "./crypto.js";
import {
  admitDataOperation,
  dataOperationExpiresAt,
} from "./data-retention.js";
import {
  ACCOUNT_ACCESS_LEASE_MS,
  ACCOUNT_ACCESS_SCHEMA_VERSION,
  requireActiveVerifiedIdentity,
  requireVerifiedIdentity,
  sanitizeDisplayName,
} from "./security.js";
import {
  readStoredTutorThread,
  readTutorThreadGeneration,
} from "./tutor-quota.js";
import type {
  LegacyMigrationPayload,
  TrackerState,
} from "./types.js";
import {
  asRecord,
  assertEmptyBody,
  hasExactKeys,
  parseDayId,
  parseLegacyMigrationPayload,
  parseOperationId,
} from "./validation.js";

const DATA_SCHEMA_VERSION = 1;
const CURRICULUM_REVISION = 2;
const ARCHIVE_CHUNK_BYTES = 180 * 1024;

type DataDependencies = {
  database: Firestore;
  auth: Auth;
  now?: () => Date;
};

type DatasetInspection = {
  manifest: DocumentData | undefined;
  state: DocumentData | undefined;
  preferences: DocumentData | undefined;
  ui: DocumentData | undefined;
  notes: QuerySnapshot;
  projects: QuerySnapshot;
  tutorThreads: QuerySnapshot;
};

async function reconcileBootstrapAccountAccess(
  request: CallableRequest<unknown>,
  dependencies: DataDependencies,
  uid: string,
  tokensValidAfterTime: string | undefined,
  accountCreationTime: string,
  now: Date,
): Promise<void> {
  const rawTokenAuthTime = request.auth?.token.auth_time;
  if (
    typeof rawTokenAuthTime !== "number"
    || !Number.isSafeInteger(rawTokenAuthTime)
    || rawTokenAuthTime < 0
  ) {
    throw new HttpsError(
      "permission-denied",
      "This session no longer has access. Sign in again.",
    );
  }
  const tokenAuthTime = rawTokenAuthTime;
  const authValidAfterMilliseconds = Date.parse(
    tokensValidAfterTime === undefined
      ? accountCreationTime
      : tokensValidAfterTime,
  );
  if (!Number.isFinite(authValidAfterMilliseconds)) {
    throw new HttpsError(
      "internal",
      "Account access could not be verified.",
    );
  }
  const authValidAfterSeconds = Math.floor(
    authValidAfterMilliseconds / 1_000,
  );
  const accessRef = dependencies.database.doc(`accountAccess/${uid}`);
  const allowed = await dependencies.database.runTransaction(
    async (transaction) => {
      const accessSnapshot = await transaction.get(accessRef);
      if (!accessSnapshot.exists) {
        const sessionAllowed = tokenAuthTime >= authValidAfterSeconds;
        transaction.create(accessRef, {
          schemaVersion: ACCOUNT_ACCESS_SCHEMA_VERSION,
          uid,
          active: true,
          authValidAfterSeconds,
          validUntil: sessionAllowed
            ? new Date(now.getTime() + ACCOUNT_ACCESS_LEASE_MS)
            : now,
          createdAt: now,
          updatedAt: now,
        });
        return sessionAllowed;
      }

      const access = accessSnapshot.data();
      if (
        access?.schemaVersion !== ACCOUNT_ACCESS_SCHEMA_VERSION
        || access?.uid !== uid
        || typeof access?.active !== "boolean"
        || typeof access?.authValidAfterSeconds !== "number"
        || !Number.isSafeInteger(access.authValidAfterSeconds)
        || access.authValidAfterSeconds < 0
      ) {
        throw new HttpsError(
          "permission-denied",
          "This account access record is invalid.",
        );
      }
      if (access.active !== true) return false;

      const reconciledCutoff = Math.max(
        access.authValidAfterSeconds as number,
        authValidAfterSeconds,
      );
      const sessionAllowed = tokenAuthTime >= reconciledCutoff;
      transaction.set(accessRef, {
        authValidAfterSeconds: reconciledCutoff,
        ...(sessionAllowed
          ? {
              validUntil: new Date(
                now.getTime() + ACCOUNT_ACCESS_LEASE_MS,
              ),
            }
          : {}),
        updatedAt: now,
      }, { merge: true });
      return sessionAllowed;
    },
  );

  if (!allowed) {
    throw new HttpsError(
      "permission-denied",
      "This session no longer has access. Sign in again.",
    );
  }
}

export async function handleBootstrapUserData(
  request: CallableRequest<unknown>,
  dependencies: DataDependencies,
): Promise<{ datasetId: string }> {
  assertEmptyBody(request.data);
  const identity = await requireVerifiedIdentity(request, dependencies.auth);
  const now = dependencies.now?.() ?? new Date();
  const userRef = dependencies.database.doc(`users/${identity.uid}`);
  const privateEntitlementRef = dependencies.database.doc(
    `tutorEntitlements/${identity.uid}`,
  );
  const entitlementProjectionRef = dependencies.database.doc(
    `users/${identity.uid}/entitlements/current`,
  );

  await reconcileBootstrapAccountAccess(
    request,
    dependencies,
    identity.uid,
    identity.user.tokensValidAfterTime,
    identity.user.metadata.creationTime,
    now,
  );

  return dependencies.database.runTransaction(async (transaction) => {
    const [
      userSnapshot,
      privateEntitlementSnapshot,
      entitlementProjectionSnapshot,
    ] = await Promise.all([
      transaction.get(userRef),
      transaction.get(privateEntitlementRef),
      transaction.get(entitlementProjectionRef),
    ]);
    const current = validDatasetId(userSnapshot.data()?.currentDatasetId)
      ? userSnapshot.data()?.currentDatasetId as string
      : undefined;
    const currentManifest = current
      ? await transaction.get(datasetReference(
        dependencies.database,
        identity.uid,
        current,
      ))
      : undefined;

    if (
      current
      && currentManifest?.exists
      && currentManifest.data()?.status === "active"
    ) {
      transaction.set(userRef, {
        schemaVersion: DATA_SCHEMA_VERSION,
        uid: identity.uid,
        email: identity.user.email ?? "",
        displayName: sanitizeDisplayName(identity.user.displayName),
        updatedAt: now,
      }, { merge: true });
      ensureEntitlement(
        transaction,
        privateEntitlementRef,
        entitlementProjectionRef,
        privateEntitlementSnapshot.exists,
        entitlementProjectionSnapshot.exists,
        now,
      );
      return { datasetId: current };
    }

    const preferredDatasetId = deterministicId("fresh", identity.uid);
    const preferredDatasetRef = datasetReference(
      dependencies.database,
      identity.uid,
      preferredDatasetId,
    );
    const preferredDatasetSnapshot = current === preferredDatasetId
      ? currentManifest
      : await transaction.get(preferredDatasetRef);
    const preferredWasArchived =
      preferredDatasetSnapshot?.data()?.status === "archived";
    const datasetId = preferredWasArchived
      ? deterministicId(
          "fresh",
          `${identity.uid}\u0000${now.toISOString()}`,
        )
      : preferredDatasetId;
    const datasetRef = datasetId === preferredDatasetId
      ? preferredDatasetRef
      : datasetReference(
          dependencies.database,
          identity.uid,
          datasetId,
        );
    const datasetSnapshot = datasetId === preferredDatasetId
      ? preferredDatasetSnapshot
      : await transaction.get(datasetRef);

    if (!datasetSnapshot?.exists) {
      writeDefaultDataset(
        transaction,
        dependencies.database,
        identity.uid,
        datasetId,
        "fresh",
        now,
      );
    } else if (datasetSnapshot.data()?.status !== "active") {
      throw new HttpsError(
        "data-loss",
        "A recovery dataset exists but is no longer active.",
      );
    }
    transaction.set(userRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      uid: identity.uid,
      email: identity.user.email ?? "",
      displayName: sanitizeDisplayName(identity.user.displayName),
      currentDatasetId: datasetId,
      createdAt: userSnapshot.data()?.createdAt ?? accountCreatedAt(
        identity.user.metadata.creationTime,
        now,
      ),
      updatedAt: now,
    }, { merge: true });
    ensureEntitlement(
      transaction,
      privateEntitlementRef,
      entitlementProjectionRef,
      privateEntitlementSnapshot.exists,
      entitlementProjectionSnapshot.exists,
      now,
    );
    return { datasetId };
  });
}

export async function handleResetUserData(
  request: CallableRequest<unknown>,
  dependencies: DataDependencies,
): Promise<{ datasetId: string }> {
  const body = asRecord(request.data);
  if (!hasExactKeys(body, ["operationId"])) {
    throw new HttpsError(
      "invalid-argument",
      "Reset input contains unsupported fields.",
    );
  }
  const operationId = parseOperationId(body.operationId);
  const identity = await requireActiveVerifiedIdentity(request, dependencies);
  const now = dependencies.now?.() ?? new Date();
  const userRef = dependencies.database.doc(`users/${identity.uid}`);
  const operationRef = dependencies.database.doc(
    `users/${identity.uid}/dataOperations/${operationId}`,
  );

  return dependencies.database.runTransaction(async (transaction) => {
    const [userSnapshot, operationSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(operationRef),
    ]);
    if (operationSnapshot.exists) {
      const operation = operationSnapshot.data();
      if (
        operation?.kind !== "reset"
        || operation?.status !== "complete"
        || !validDatasetId(operation.datasetId)
      ) {
        throw new HttpsError(
          "already-exists",
          "This operation ID was already used for a different data operation.",
        );
      }
      return { datasetId: operation.datasetId as string };
    }

    const current = readActiveDatasetId(userSnapshot.data()?.currentDatasetId);
    const inspection = await inspectDataset(
      transaction,
      dependencies.database,
      identity.uid,
      current,
    );
    if (isPristineDataset(inspection)) {
      return { datasetId: current };
    }

    const datasetId = deterministicId(
      "reset",
      `${identity.uid}\u0000${operationId}`,
    );
    const newDatasetRef = datasetReference(
      dependencies.database,
      identity.uid,
      datasetId,
    );
    const newDatasetSnapshot = await transaction.get(newDatasetRef);
    if (newDatasetSnapshot.exists) {
      throw new HttpsError(
        "data-loss",
        "A reset generation already exists without its operation record.",
      );
    }

    await admitDataOperation({
      transaction,
      database: dependencies.database,
      uid: identity.uid,
      now,
      kind: "reset",
      operationKey: operationId,
      addsDataset: true,
      addsArchive: false,
      archiveBytes: 0,
    });

    transaction.set(
      datasetReference(
        dependencies.database,
        identity.uid,
        current,
      ),
      {
        status: "archived",
        archivedAt: now,
      },
      { merge: true },
    );
    writeDefaultDataset(
      transaction,
      dependencies.database,
      identity.uid,
      datasetId,
      "reset",
      now,
    );
    transaction.set(userRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      uid: identity.uid,
      email: identity.user.email ?? "",
      displayName: sanitizeDisplayName(identity.user.displayName),
      currentDatasetId: datasetId,
      updatedAt: now,
    }, { merge: true });
    transaction.create(operationRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      operationId,
      kind: "reset",
      status: "complete",
      sourceDatasetId: current,
      datasetId,
      noOp: false,
      retentionClass: "dataset-linked-idempotency",
      expiresAt: dataOperationExpiresAt(now),
      createdAt: now,
      completedAt: now,
    });
    return { datasetId };
  });
}

export async function handleClearTutorThread(
  request: CallableRequest<unknown>,
  dependencies: DataDependencies,
): Promise<{ cleared: boolean }> {
  const identity = await requireActiveVerifiedIdentity(request, dependencies);
  const body = asRecord(request.data);
  if (!hasExactKeys(body, ["dayId"])) {
    throw new HttpsError(
      "invalid-argument",
      "Tutor clear input contains unsupported fields.",
    );
  }
  const dayId = parseDayId(body.dayId);
  const now = dependencies.now?.() ?? new Date();
  const userRef = dependencies.database.doc(`users/${identity.uid}`);

  return dependencies.database.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const datasetId = readActiveDatasetId(
      userSnapshot.data()?.currentDatasetId,
    );
    const threadRef = dependencies.database.doc(
      `users/${identity.uid}/datasets/${datasetId}/tutorThreads/${dayId}`,
    );
    const controlRef = dependencies.database.doc(
      `users/${identity.uid}/datasets/${datasetId}/tutorThreadControls/${dayId}`,
    );
    const [threadSnapshot, controlSnapshot] = await Promise.all([
      transaction.get(threadRef),
      transaction.get(controlRef),
    ]);
    readStoredTutorThread(threadSnapshot.data());
    const generation = readTutorThreadGeneration(controlSnapshot.data());
    if (generation >= Number.MAX_SAFE_INTEGER) {
      throw new HttpsError(
        "failed-precondition",
        "Tutor thread control requires administrator repair.",
      );
    }
    transaction.set(controlRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      generation: generation + 1,
      updatedAt: now,
    });
    if (threadSnapshot.exists) transaction.delete(threadRef);
    return { cleared: threadSnapshot.exists };
  });
}

export async function handleMigrateLegacyData(
  request: CallableRequest<unknown>,
  dependencies: DataDependencies,
): Promise<{
  datasetId: string;
  migrated: boolean;
  retainedCloudData: boolean;
}> {
  const identity = await requireActiveVerifiedIdentity(request, dependencies);
  const payload = parseLegacyMigrationPayload(request.data);
  verifyMigrationDigest(payload);
  const now = dependencies.now?.() ?? new Date();
  if (payload.activateImported) {
    if (payload.operationId === null) {
      throw new HttpsError(
        "invalid-argument",
        "Explicit backup restore requires an operation ID.",
      );
    }
    return restoreBackupGeneration(
      dependencies,
      identity.uid,
      identity.user.email ?? "",
      sanitizeDisplayName(identity.user.displayName),
      accountCreatedAt(identity.user.metadata.creationTime, now),
      payload,
      payload.operationId,
      now,
    );
  }

  return stageLegacyMigration(
    dependencies,
    identity.uid,
    identity.user.email ?? "",
    sanitizeDisplayName(identity.user.displayName),
    accountCreatedAt(identity.user.metadata.creationTime, now),
    payload,
    now,
  );
}

async function stageLegacyMigration(
  dependencies: DataDependencies,
  uid: string,
  email: string,
  displayName: string,
  authCreatedAt: Date,
  payload: LegacyMigrationPayload,
  now: Date,
): Promise<{
  datasetId: string;
  migrated: boolean;
  retainedCloudData: boolean;
}> {
  const importedDatasetId = deterministicId(
    "import",
    payload.sourceDigest,
  );
  const userRef = dependencies.database.doc(`users/${uid}`);
  const receiptRef = dependencies.database.doc(
    `users/${uid}/migrationReceipts/${payload.sourceDigest}`,
  );
  const importedRef = datasetReference(
    dependencies.database,
    uid,
    importedDatasetId,
  );

  return dependencies.database.runTransaction(async (transaction) => {
    const [userSnapshot, receiptSnapshot, importedSnapshot] =
      await Promise.all([
        transaction.get(userRef),
        transaction.get(receiptRef),
        transaction.get(importedRef),
      ]);
    const receipt = receiptSnapshot.data();
    if (
      receiptSnapshot.exists
      && receipt?.status === "complete"
    ) {
      const activeDatasetId = readActiveDatasetId(
        userSnapshot.data()?.currentDatasetId,
      );
      if (
        !validDatasetId(userSnapshot.data()?.originalMigrationArchiveId)
        && (
          payload.trackerLegacyArchive !== null
          || payload.tutorLegacyArchive !== null
        )
      ) {
        transaction.set(userRef, {
          originalMigrationArchiveId: importedDatasetId,
          updatedAt: now,
        }, { merge: true });
      }
      return {
        datasetId: activeDatasetId,
        migrated: true,
        retainedCloudData: activeDatasetId !== importedDatasetId,
      };
    }

    const current = validDatasetId(userSnapshot.data()?.currentDatasetId)
      ? userSnapshot.data()?.currentDatasetId as string
      : undefined;
    const currentInspection =
      current && current !== importedDatasetId
        ? await inspectDataset(
          transaction,
          dependencies.database,
          uid,
          current,
        )
        : undefined;

    if (
      importedSnapshot.exists
      && importedSnapshot.data()?.status === "archived"
    ) {
      throw new HttpsError(
        "data-loss",
        "The digest migration generation was already archived and cannot be reactivated.",
      );
    }
    const addsDataset = !importedSnapshot.exists;
    await admitDataOperation({
      transaction,
      database: dependencies.database,
      uid,
      now,
      kind: "migration",
      operationKey: payload.sourceDigest,
      addsDataset,
      addsArchive: addsDataset,
      archiveBytes: migrationArchiveByteLength(payload),
    });
    if (addsDataset) {
      writeImportedDataset(
        transaction,
        dependencies.database,
        uid,
        importedDatasetId,
        payload,
        now,
      );
    }
    const originalMigrationArchiveId = originalArchiveDatasetId(
      userSnapshot.data()?.originalMigrationArchiveId,
      payload,
      importedDatasetId,
    );

    const activate = (
      current === undefined
      || current === importedDatasetId
      || (currentInspection !== undefined
        && isPristineDataset(currentInspection))
    );
    let activeDatasetId = current ?? importedDatasetId;
    if (activate) {
      if (current && current !== importedDatasetId) {
        transaction.set(
          datasetReference(
            dependencies.database,
            uid,
            current,
          ),
          {
            status: "archived",
            archivedAt: now,
          },
          { merge: true },
        );
      }
      transaction.set(importedRef, {
        status: "active",
        activatedAt: now,
      }, { merge: true });
      transaction.set(userRef, {
        schemaVersion: DATA_SCHEMA_VERSION,
        uid,
        email,
        displayName,
        currentDatasetId: importedDatasetId,
        createdAt: userSnapshot.data()?.createdAt ?? authCreatedAt,
        ...(originalMigrationArchiveId === undefined
          ? {}
          : { originalMigrationArchiveId }),
        updatedAt: now,
      }, { merge: true });
      activeDatasetId = importedDatasetId;
    } else if (originalMigrationArchiveId !== undefined) {
      transaction.set(userRef, {
        originalMigrationArchiveId,
        updatedAt: now,
      }, { merge: true });
    }
    const retainedCloudData = activeDatasetId !== importedDatasetId;
    transaction.set(receiptRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      sourceDigest: payload.sourceDigest,
      importedDatasetId,
      datasetId: activeDatasetId,
      status: "complete",
      retainedCloudData,
      retentionClass: "dataset-linked-idempotency",
      createdAt: receipt?.createdAt ?? now,
      updatedAt: now,
    });
    return {
      datasetId: activeDatasetId,
      migrated: true,
      retainedCloudData,
    };
  });
}

async function restoreBackupGeneration(
  dependencies: DataDependencies,
  uid: string,
  email: string,
  displayName: string,
  authCreatedAt: Date,
  payload: LegacyMigrationPayload,
  operationId: string,
  now: Date,
): Promise<{
  datasetId: string;
  migrated: boolean;
  retainedCloudData: boolean;
}> {
  const datasetId = deterministicId(
    "restore",
    `${uid}\u0000${operationId}`,
  );
  const userRef = dependencies.database.doc(`users/${uid}`);
  const operationRef = dependencies.database.doc(
    `users/${uid}/dataOperations/${operationId}`,
  );
  const datasetRef = datasetReference(dependencies.database, uid, datasetId);

  return dependencies.database.runTransaction(async (transaction) => {
    const [userSnapshot, operationSnapshot, datasetSnapshot] =
      await Promise.all([
        transaction.get(userRef),
        transaction.get(operationRef),
        transaction.get(datasetRef),
      ]);
    if (operationSnapshot.exists) {
      const operation = operationSnapshot.data();
      if (
        operation?.kind !== "restore"
        || operation?.status !== "complete"
        || operation?.sourceDigest !== payload.sourceDigest
        || operation?.datasetId !== datasetId
      ) {
        throw new HttpsError(
          "already-exists",
          "This operation ID was already used for different backup data.",
        );
      }
      return {
        datasetId,
        migrated: true,
        retainedCloudData: false,
      };
    }
    if (datasetSnapshot.exists) {
      throw new HttpsError(
        "data-loss",
        "A restore generation already exists without its operation record.",
      );
    }

    const current = validDatasetId(userSnapshot.data()?.currentDatasetId)
      ? userSnapshot.data()?.currentDatasetId as string
      : undefined;
    const originalMigrationArchiveId = originalArchiveDatasetId(
      userSnapshot.data()?.originalMigrationArchiveId,
      payload,
      datasetId,
    );
    await admitDataOperation({
      transaction,
      database: dependencies.database,
      uid,
      now,
      kind: "restore",
      operationKey: operationId,
      addsDataset: true,
      addsArchive: true,
      archiveBytes: migrationArchiveByteLength(payload),
    });
    if (current) {
      transaction.set(
        datasetReference(dependencies.database, uid, current),
        {
          status: "archived",
          archivedAt: now,
        },
        { merge: true },
      );
    }
    writeImportedDataset(
      transaction,
      dependencies.database,
      uid,
      datasetId,
      payload,
      now,
    );
    transaction.set(datasetRef, {
      status: "active",
      activatedAt: now,
    }, { merge: true });
    transaction.set(userRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      uid,
      email,
      displayName,
      currentDatasetId: datasetId,
      createdAt: userSnapshot.data()?.createdAt ?? authCreatedAt,
      ...(originalMigrationArchiveId === undefined
        ? {}
        : { originalMigrationArchiveId }),
      updatedAt: now,
    }, { merge: true });
    transaction.create(operationRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      operationId,
      kind: "restore",
      status: "complete",
      sourceDigest: payload.sourceDigest,
      sourceDatasetId: current ?? null,
      datasetId,
      retentionClass: "dataset-linked-idempotency",
      expiresAt: dataOperationExpiresAt(now),
      createdAt: now,
      completedAt: now,
    });
    return {
      datasetId,
      migrated: true,
      retainedCloudData: false,
    };
  });
}

export function isPristineDataset(
  inspection: DatasetInspection,
): boolean {
  const source = inspection.manifest?.source;
  const state = inspection.state;
  const preferences = inspection.preferences;
  const ui = inspection.ui;
  return (
    (source === "fresh" || source === "reset")
    && inspection.manifest?.status === "active"
    && state?.schemaVersion === 1
    && state.curriculumRevision === CURRICULUM_REVISION
    && isEmptyRecord(state.completed)
    && Array.isArray(state.bookmarks)
    && state.bookmarks.length === 0
    && preferences?.schemaVersion === 1
    && preferences.startedOn === ""
    && preferences.weeklyHours === 10
    && preferences.selectedDay === 1
    && ui?.schemaVersion === 1
    && ui.theme === "system"
    && inspection.notes.empty
    && inspection.projects.empty
    && inspection.tutorThreads.empty
  );
}

async function inspectDataset(
  transaction: Transaction,
  database: Firestore,
  uid: string,
  datasetId: string,
): Promise<DatasetInspection> {
  const base = `users/${uid}/datasets/${datasetId}`;
  const [
    manifest,
    state,
    preferences,
    ui,
    notes,
    projects,
    tutorThreads,
  ] = await Promise.all([
    transaction.get(database.doc(base)),
    transaction.get(database.doc(`${base}/course/state`)),
    transaction.get(database.doc(`${base}/course/preferences`)),
    transaction.get(database.doc(`${base}/preferences/ui`)),
    transaction.get(database.collection(`${base}/notes`).limit(1)),
    transaction.get(database.collection(`${base}/projects`).limit(1)),
    transaction.get(database.collection(`${base}/tutorThreads`).limit(1)),
  ]);
  return {
    manifest: manifest.data(),
    state: state.data(),
    preferences: preferences.data(),
    ui: ui.data(),
    notes,
    projects,
    tutorThreads,
  };
}

function writeDefaultDataset(
  transaction: Transaction,
  database: Firestore,
  uid: string,
  datasetId: string,
  source: "fresh" | "reset",
  now: Date,
): void {
  const base = `users/${uid}/datasets/${datasetId}`;
  transaction.create(database.doc(base), {
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    curriculumRevision: CURRICULUM_REVISION,
    status: "active",
    source,
    retentionClass: "bounded-generation",
    createdAt: now,
    activatedAt: now,
  });
  transaction.create(database.doc(`${base}/course/state`), {
    schemaVersion: DATA_SCHEMA_VERSION,
    curriculumRevision: CURRICULUM_REVISION,
    completed: {},
    bookmarks: [],
    updatedAt: now,
  });
  transaction.create(database.doc(`${base}/course/preferences`), {
    schemaVersion: DATA_SCHEMA_VERSION,
    startedOn: "",
    weeklyHours: 10,
    selectedDay: 1,
    updatedAt: now,
  });
  transaction.create(database.doc(`${base}/preferences/ui`), {
    schemaVersion: DATA_SCHEMA_VERSION,
    theme: "system",
    performanceMonitoring: false,
    performanceConsentVersion: 1,
    performanceConsentUpdatedAt: now,
    updatedAt: now,
  });
}

function writeImportedDataset(
  transaction: Transaction,
  database: Firestore,
  uid: string,
  datasetId: string,
  payload: LegacyMigrationPayload,
  now: Date,
): void {
  const base = `users/${uid}/datasets/${datasetId}`;
  transaction.create(database.doc(base), {
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    curriculumRevision: CURRICULUM_REVISION,
    status: "ready",
    source: "migration",
    sourceDigest: payload.sourceDigest,
    retentionClass: "bounded-generation",
    createdAt: now,
  });
  transaction.create(database.doc(`${base}/course/state`), {
    schemaVersion: DATA_SCHEMA_VERSION,
    curriculumRevision: CURRICULUM_REVISION,
    completed: payload.tracker.completed,
    bookmarks: payload.tracker.bookmarks,
    updatedAt: now,
  });
  transaction.create(database.doc(`${base}/course/preferences`), {
    schemaVersion: DATA_SCHEMA_VERSION,
    startedOn: payload.tracker.startedOn,
    weeklyHours: payload.tracker.weeklyHours,
    selectedDay: payload.tracker.selectedDay,
    updatedAt: now,
  });
  transaction.create(database.doc(`${base}/preferences/ui`), {
    schemaVersion: DATA_SCHEMA_VERSION,
    theme: payload.theme,
    // Privacy consent is account- and generation-specific. It is never
    // inherited from an imported course backup.
    performanceMonitoring: false,
    performanceConsentVersion: 1,
    performanceConsentUpdatedAt: now,
    updatedAt: now,
  });
  writeImportedNotes(
    transaction,
    database,
    base,
    payload.tracker,
    now,
  );
  for (const [projectId, checks] of Object.entries(
    payload.tracker.projectChecks,
  )) {
    transaction.create(database.doc(`${base}/projects/${projectId}`), {
      schemaVersion: DATA_SCHEMA_VERSION,
      projectId,
      checks,
      updatedAt: now,
    });
  }
  for (const [dayId, thread] of Object.entries(payload.tutor.threads)) {
    transaction.create(database.doc(`${base}/tutorThreads/${dayId}`), {
      updatedAt: thread.updatedAt,
      messages: thread.messages,
    });
  }
  writeMigrationArchives(
    transaction,
    database,
    uid,
    datasetId,
    payload,
    now,
  );
}

function writeImportedNotes(
  transaction: Transaction,
  database: Firestore,
  base: string,
  tracker: TrackerState,
  now: Date,
): void {
  const dayIds = new Set([
    ...Object.keys(tracker.notes),
    ...Object.keys(tracker.evidence),
  ]);
  for (const dayId of dayIds) {
    transaction.create(database.doc(`${base}/notes/${dayId}`), {
      schemaVersion: DATA_SCHEMA_VERSION,
      dayId: Number(dayId),
      note: tracker.notes[dayId] ?? "",
      evidence: tracker.evidence[dayId] ?? "",
      updatedAt: now,
    });
  }
}

function writeMigrationArchives(
  transaction: Transaction,
  database: Firestore,
  uid: string,
  datasetId: string,
  payload: LegacyMigrationPayload,
  now: Date,
): void {
  const archiveBase =
    `users/${uid}/migrationArchives/${datasetId}`;
  const entries = [
    ["tracker", payload.trackerLegacyArchive],
    ["tutor", payload.tutorLegacyArchive],
  ] as const;
  const counts: Record<"tracker" | "tutor", number> = {
    tracker: 0,
    tutor: 0,
  };
  const rawBytes: Record<"tracker" | "tutor", number> = {
    tracker: 0,
    tutor: 0,
  };
  for (const [kind, raw] of entries) {
    if (raw === null) {
      counts[kind] = 0;
      rawBytes[kind] = 0;
      continue;
    }
    const buffer = Buffer.from(raw, "utf8");
    rawBytes[kind] = buffer.length;
    let index = 0;
    for (
      let offset = 0;
      offset < buffer.length;
      offset += ARCHIVE_CHUNK_BYTES
    ) {
      const chunk = buffer.subarray(offset, offset + ARCHIVE_CHUNK_BYTES);
      transaction.create(
        database.doc(
          `${archiveBase}/chunks/${kind}-${String(index).padStart(3, "0")}`,
        ),
        {
          schemaVersion: DATA_SCHEMA_VERSION,
          kind,
          index,
          encoding: "base64-utf8",
          data: chunk.toString("base64"),
        },
      );
      index += 1;
    }
    counts[kind] = index;
  }
  transaction.create(database.doc(archiveBase), {
    schemaVersion: DATA_SCHEMA_VERSION,
    sourceDigest: payload.sourceDigest,
    encoding: "base64-utf8",
    trackerChunks: counts.tracker,
    tutorChunks: counts.tutor,
    trackerPresent: payload.trackerLegacyArchive !== null,
    tutorPresent: payload.tutorLegacyArchive !== null,
    trackerRawBytes: rawBytes.tracker,
    tutorRawBytes: rawBytes.tutor,
    rawByteLength: rawBytes.tracker + rawBytes.tutor,
    retentionClass: "dataset-linked-original-payload",
    createdAt: now,
  });
}

function migrationArchiveByteLength(
  payload: LegacyMigrationPayload,
): number {
  return (
    (payload.trackerLegacyArchive === null
      ? 0
      : Buffer.byteLength(payload.trackerLegacyArchive, "utf8"))
    + (payload.tutorLegacyArchive === null
      ? 0
      : Buffer.byteLength(payload.tutorLegacyArchive, "utf8"))
  );
}

function originalArchiveDatasetId(
  existing: unknown,
  payload: LegacyMigrationPayload,
  candidateDatasetId: string,
): string | undefined {
  if (validDatasetId(existing)) return existing;
  return (
    payload.trackerLegacyArchive !== null
    || payload.tutorLegacyArchive !== null
  )
    ? candidateDatasetId
    : undefined;
}

function ensureEntitlement(
  transaction: Transaction,
  privateRef: DocumentReference,
  projectionRef: DocumentReference,
  privateExists: boolean,
  projectionExists: boolean,
  now: Date,
): void {
  if (!privateExists) {
    transaction.create(privateRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      status: "active",
      plan: "free",
      dailyTutorLimit: TUTOR_MODEL_POLICY.perUserDailyLimit,
      createdAt: now,
      updatedAt: now,
    });
  }
  if (!projectionExists) {
    transaction.create(projectionRef, {
      schemaVersion: DATA_SCHEMA_VERSION,
      status: "active",
      plan: "free",
      dailyTutorLimit: TUTOR_MODEL_POLICY.perUserDailyLimit,
      createdAt: now,
      updatedAt: now,
    });
  }
}

function verifyMigrationDigest(payload: LegacyMigrationPayload): void {
  const calculated = computeLegacySourceDigest({
    tracker: payload.tracker,
    tutor: payload.tutor,
    theme: payload.theme,
    trackerLegacyArchive: payload.trackerLegacyArchive,
    tutorLegacyArchive: payload.tutorLegacyArchive,
  });
  if (calculated !== payload.sourceDigest) {
    throw new HttpsError(
      "invalid-argument",
      "Migration source digest does not match the supplied data.",
    );
  }
}

function datasetReference(
  database: Firestore,
  uid: string,
  datasetId: string,
): DocumentReference {
  return database.doc(`users/${uid}/datasets/${datasetId}`);
}

function readActiveDatasetId(value: unknown): string {
  if (!validDatasetId(value)) {
    throw new HttpsError(
      "failed-precondition",
      "Secure course data is not initialized.",
    );
  }
  return value;
}

function validDatasetId(value: unknown): value is string {
  return (
    typeof value === "string"
    && /^[A-Za-z0-9_-]{8,80}$/.test(value)
  );
}

function isEmptyRecord(value: unknown): boolean {
  return (
    value !== null
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).length === 0
  );
}

function accountCreatedAt(value: string, fallback: Date): Date {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}
