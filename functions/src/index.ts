import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onCall } from "firebase-functions/v2/https";

import { FIREBASE_REGION } from "./config.js";
import {
  handleBootstrapUserData,
  handleClearTutorThread,
  handleMigrateLegacyData,
  handleResetUserData,
} from "./data-handlers.js";
import { handleAskTutor } from "./tutor-handler.js";
import {
  GeminiTutorProvider,
  type TutorProvider,
} from "./tutor-provider.js";

if (getApps().length === 0) initializeApp();

const database = getFirestore();
const auth = getAuth();
const geminiApiKey = defineSecret("GEMINI_API_KEY");
let provider: TutorProvider | undefined;

const standardCallableOptions = {
  region: FIREBASE_REGION,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  timeoutSeconds: 30,
  memory: "256MiB" as const,
  minInstances: 0,
  maxInstances: 2,
  concurrency: 10,
};

export const bootstrapUserData = onCall(
  standardCallableOptions,
  (request) => handleBootstrapUserData(request, { database, auth }),
);

export const clearTutorThread = onCall(
  standardCallableOptions,
  (request) => handleClearTutorThread(request, { database, auth }),
);

export const resetUserData = onCall(
  standardCallableOptions,
  (request) => handleResetUserData(request, { database, auth }),
);

export const migrateLegacyData = onCall(
  {
    ...standardCallableOptions,
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  (request) => handleMigrateLegacyData(request, { database, auth }),
);

export const askTutor = onCall(
  {
    ...standardCallableOptions,
    timeoutSeconds: 45,
    memory: "512MiB",
    secrets: [geminiApiKey],
  },
  (request) => handleAskTutor(request, {
    database,
    auth,
    provider: tutorProvider(),
  }),
);

function tutorProvider(): TutorProvider {
  provider ??= new GeminiTutorProvider(geminiApiKey.value());
  return provider;
}
