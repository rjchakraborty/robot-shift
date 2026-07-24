"use client";

import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAk1zXFhBnPAOUpCLrnFAZpcg2cE8tYaHY",
  authDomain: "robotshift.web.app",
  projectId: "robotshift",
  storageBucket: "robotshift.firebasestorage.app",
  messagingSenderId: "847716289197",
  appId: "1:847716289197:web:ff9452513c9eb2e0a35424",
  measurementId: "G-364ND39JDX",
};

const recaptchaEnterpriseSiteKey =
  "6LevLWItAAAAAKbMowvVT9dSA1Y7vyuUtwU8t-y5";

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let appCheckPromise: Promise<void> | null = null;
let firebaseAuthPromise: Promise<Auth> | null = null;
let firestorePromise: Promise<Firestore> | null = null;
let functionsPromise: Promise<Functions> | null = null;

export class FirebaseClientConfigurationError extends Error {
  readonly code = "firebase_configuration";

  constructor(message: string) {
    super(message);
    this.name = "FirebaseClientConfigurationError";
  }
}

export function hasFirebaseMeasurementId(): boolean {
  return Boolean(firebaseConfig.measurementId?.trim());
}

export function getFirebaseApp(): Promise<FirebaseApp> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new FirebaseClientConfigurationError(
        "Firebase browser services can only start in the browser.",
      ),
    );
  }

  firebaseAppPromise ??= import("firebase/app").then(
    ({ getApp, getApps, initializeApp }) => {
      if (getApps().length > 0) return getApp();

      return initializeApp(firebaseConfig);
    },
  );

  return firebaseAppPromise;
}

export function ensureFirebaseAppCheck(app: FirebaseApp): Promise<void> {
  appCheckPromise ??= initializeFirebaseAppCheck(app);
  return appCheckPromise;
}

export function getFirebaseAuth(): Promise<Auth> {
  firebaseAuthPromise ??= initializeFirebaseAuth();
  return firebaseAuthPromise;
}

export function getFirebaseFirestore(): Promise<Firestore> {
  firestorePromise ??= initializeFirebaseFirestore();
  return firestorePromise;
}

export function getFirebaseFunctions(): Promise<Functions> {
  functionsPromise ??= initializeFirebaseFunctions();
  return functionsPromise;
}

async function initializeFirebaseAuth(): Promise<Auth> {
  const app = await getFirebaseApp();
  await ensureFirebaseAppCheck(app);
  const {
    browserSessionPersistence,
    connectAuthEmulator,
    getAuth,
    setPersistence,
  } = await import("firebase/auth");
  const auth = getAuth(app);
  if (isUsingLocalFirebaseEmulators()) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  }
  auth.useDeviceLanguage();
  await setPersistence(auth, browserSessionPersistence);
  return auth;
}

async function initializeFirebaseFirestore(): Promise<Firestore> {
  const app = await getFirebaseApp();
  await ensureFirebaseAppCheck(app);
  const { connectFirestoreEmulator, getFirestore } =
    await import("firebase/firestore");
  const database = getFirestore(app);
  if (isUsingLocalFirebaseEmulators()) {
    connectFirestoreEmulator(database, "127.0.0.1", 8088);
  }
  return database;
}

async function initializeFirebaseFunctions(): Promise<Functions> {
  const app = await getFirebaseApp();
  await ensureFirebaseAppCheck(app);
  const { connectFunctionsEmulator, getFunctions } =
    await import("firebase/functions");
  const functions = getFunctions(app, "asia-south1");
  if (isUsingLocalFirebaseEmulators()) {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  }
  return functions;
}

async function initializeFirebaseAppCheck(app: FirebaseApp): Promise<void> {
  const {
    CustomProvider,
    initializeAppCheck,
    ReCaptchaEnterpriseProvider,
  } = await import("firebase/app-check");

  if (isUsingLocalFirebaseEmulators()) {
    initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: async () => createLocalEmulatorAppCheckToken(),
      }),
      isTokenAutoRefreshEnabled: false,
    });
    return;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export function isUsingLocalFirebaseEmulators(): boolean {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true"
    && typeof window !== "undefined"
    && (
      window.location.hostname === "127.0.0.1"
      || window.location.hostname === "localhost"
    )
  );
}

function createLocalEmulatorAppCheckToken(): {
  token: string;
  expireTimeMillis: number;
} {
  const issuedAtSeconds = Math.floor(Date.now() / 1_000);
  const expiresAtSeconds = issuedAtSeconds + 60 * 60;
  const token = [
    encodeEmulatorJwtSegment({ alg: "none", typ: "JWT" }),
    encodeEmulatorJwtSegment({
      sub: firebaseConfig.appId,
      aud: [firebaseConfig.projectId],
      jti: globalThis.crypto.randomUUID(),
      iat: issuedAtSeconds,
      exp: expiresAtSeconds,
    }),
    "emulator",
  ].join(".");

  return {
    token,
    expireTimeMillis: expiresAtSeconds * 1_000,
  };
}

function encodeEmulatorJwtSegment(value: unknown): string {
  return window
    .btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
