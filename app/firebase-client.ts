"use client";

import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";

export class FirebaseClientConfigurationError extends Error {
  readonly code = "firebase_configuration";

  constructor(message: string) {
    super(message);
    this.name = "FirebaseClientConfigurationError";
  }
}

type FirebasePublicEnvironment = {
  NEXT_PUBLIC_FIREBASE_API_KEY?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY?: string;
};

type FirebaseBrowserConfiguration = {
  options: FirebaseOptions;
  recaptchaEnterpriseSiteKey: string;
};

const defaultFirebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAk1zXFhBnPAOUpCLrnFAZpcg2cE8tYaHY",
  authDomain: "robotshift.web.app",
  projectId: "robotshift",
  storageBucket: "robotshift.firebasestorage.app",
  messagingSenderId: "847716289197",
  appId: "1:847716289197:web:ff9452513c9eb2e0a35424",
  measurementId: "G-364ND39JDX",
};

const defaultRecaptchaEnterpriseSiteKey =
  "6LevLWItAAAAAKbMowvVT9dSA1Y7vyuUtwU8t-y5";

const localFirebaseConfig: FirebaseOptions = {
  apiKey: "demo-api-key",
  authDomain: "localhost",
  projectId: "demo-robotshift",
  storageBucket: "demo-robotshift.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:local-robotshift",
};

export function resolveFirebaseBrowserConfiguration(
  environment: FirebasePublicEnvironment,
): FirebaseBrowserConfiguration {
  const publicValues = {
    apiKey: environment.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: environment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
    storageBucket:
      environment.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "",
    messagingSenderId:
      environment.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    appId: environment.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
    measurementId:
      environment.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() ?? "",
    recaptchaEnterpriseSiteKey:
      environment.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim() ?? "",
  };
  const requiredEntries = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", publicValues.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", publicValues.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", publicValues.projectId],
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", publicValues.storageBucket],
    [
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      publicValues.messagingSenderId,
    ],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", publicValues.appId],
    [
      "NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY",
      publicValues.recaptchaEnterpriseSiteKey,
    ],
  ] as const;
  const hasCustomValue = Object.values(publicValues).some(Boolean);
  if (!hasCustomValue) {
    return {
      options: { ...defaultFirebaseConfig },
      recaptchaEnterpriseSiteKey: defaultRecaptchaEnterpriseSiteKey,
    };
  }

  const missingVariables = requiredEntries
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missingVariables.length > 0) {
    throw new FirebaseClientConfigurationError(
      `Custom Firebase configuration is incomplete: ${missingVariables.join(", ")}.`,
    );
  }

  return {
    options: {
      apiKey: publicValues.apiKey,
      authDomain: publicValues.authDomain,
      projectId: publicValues.projectId,
      storageBucket: publicValues.storageBucket,
      messagingSenderId: publicValues.messagingSenderId,
      appId: publicValues.appId,
      ...(publicValues.measurementId
        ? { measurementId: publicValues.measurementId }
        : {}),
    },
    recaptchaEnterpriseSiteKey: publicValues.recaptchaEnterpriseSiteKey,
  };
}

const browserConfiguration = resolveFirebaseBrowserConfiguration({
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY:
    process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY,
});
const firebaseConfig = browserConfiguration.options;
const recaptchaEnterpriseSiteKey =
  browserConfiguration.recaptchaEnterpriseSiteKey;

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let appCheckPromise: Promise<void> | null = null;
let firebaseAuthPromise: Promise<Auth> | null = null;
let firestorePromise: Promise<Firestore> | null = null;
let functionsPromise: Promise<Functions> | null = null;

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

      return initializeApp(
        isUsingLocalFirebaseEmulators()
          ? localFirebaseConfig
          : firebaseConfig,
      );
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
        getToken: async () => createLocalEmulatorAppCheckToken(app.options),
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

function createLocalEmulatorAppCheckToken(
  options: FirebaseOptions,
): {
  token: string;
  expireTimeMillis: number;
} {
  if (!options.appId || !options.projectId) {
    throw new FirebaseClientConfigurationError(
      "The local Firebase emulator configuration is incomplete.",
    );
  }
  const issuedAtSeconds = Math.floor(Date.now() / 1_000);
  const expiresAtSeconds = issuedAtSeconds + 60 * 60;
  const token = [
    encodeEmulatorJwtSegment({ alg: "none", typ: "JWT" }),
    encodeEmulatorJwtSegment({
      sub: options.appId,
      aud: [options.projectId],
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
