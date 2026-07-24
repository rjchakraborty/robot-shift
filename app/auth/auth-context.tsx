"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth } from "../firebase-client";
import { bootstrapCloudAccount } from "../firestore-data";
import { AuthDialog } from "./auth-dialog";
import { signOutAccount } from "./auth-service";

export type AuthScreen =
  | "sign-in"
  | "sign-up"
  | "forgot-password"
  | "verify-email"
  | "profile";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerIds: string[];
  createdAt: string | null;
  lastSignInAt: string | null;
};

type AuthContextValue = {
  loading: boolean;
  user: AuthUser | null;
  datasetId: string | null;
  cloudLoading: boolean;
  cloudError: string | null;
  openAuth: (screen?: AuthScreen) => void;
  closeAuth: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  refreshCloudAccount: () => Promise<string | null>;
  registerBeforeSignOut: (handler: () => Promise<void>) => () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const ACCOUNT_ACCESS_REFRESH_INTERVAL_MS = 10 * 60 * 1_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [screen, setScreen] = useState<AuthScreen | null>(null);
  const activeUidRef = useRef<string | null>(null);
  const activeVerifiedRef = useRef(false);
  const datasetIdRef = useRef<string | null>(null);
  const identityGenerationRef = useRef(0);
  const cloudRequestGenerationRef = useRef(0);
  const lastCloudRefreshAttemptRef = useRef(0);
  const beforeSignOutHandlersRef = useRef(new Set<() => Promise<void>>());
  const signOutPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    void Promise.all([
      getFirebaseAuth(),
      import("firebase/auth"),
    ]).then(([auth, { onIdTokenChanged }]) => {
      if (!active) return;
      unsubscribe = onIdTokenChanged(auth, (nextUser) => {
        const previousUid = activeUidRef.current;
        const nextUid = nextUser?.uid ?? null;
        const identityChanged = previousUid !== nextUid;
        if (identityChanged) {
          identityGenerationRef.current += 1;
          cloudRequestGenerationRef.current += 1;
          datasetIdRef.current = null;
          setDatasetId(null);
          setCloudError(null);
          lastCloudRefreshAttemptRef.current = 0;
        }
        activeUidRef.current = nextUid;
        activeVerifiedRef.current = Boolean(nextUser?.emailVerified);
        setFirebaseUser(nextUser);
        setUser(nextUser ? snapshotUser(nextUser) : null);
        setLoading(false);
        if (!nextUser?.emailVerified) {
          datasetIdRef.current = null;
          setDatasetId(null);
          setCloudLoading(false);
          return;
        }
        if (!identityChanged && datasetIdRef.current) {
          // Firebase emits onIdTokenChanged for routine token refreshes. Keeping
          // the active dataset avoids discarding loaded course state.
          setCloudLoading(false);
          return;
        }

        const identityGeneration = identityGenerationRef.current;
        const requestGeneration = ++cloudRequestGenerationRef.current;
        lastCloudRefreshAttemptRef.current = Date.now();
        setCloudLoading(true);
        void bootstrapCloudAccount()
          .then(({ datasetId: nextDatasetId }) => {
            if (
              !active
              || identityGeneration !== identityGenerationRef.current
              || requestGeneration !== cloudRequestGenerationRef.current
              || activeUidRef.current !== nextUser.uid
              || !activeVerifiedRef.current
            ) return;
            datasetIdRef.current = nextDatasetId;
            setDatasetId(nextDatasetId);
            setCloudError(null);
          })
          .catch(() => {
            if (
              !active
              || identityGeneration !== identityGenerationRef.current
              || requestGeneration !== cloudRequestGenerationRef.current
              || activeUidRef.current !== nextUser.uid
            ) return;
            setCloudError(
              "Your account is signed in, but secure Firestore data is unavailable.",
            );
          })
          .finally(() => {
            if (
              active
              && identityGeneration === identityGenerationRef.current
              && requestGeneration === cloudRequestGenerationRef.current
            ) {
              setCloudLoading(false);
            }
          });
      });
    }).catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const refreshCloudAccount = useCallback(async () => {
    const auth = await getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser?.emailVerified) {
      datasetIdRef.current = null;
      setDatasetId(null);
      return null;
    }
    const uid = currentUser.uid;
    const identityGeneration = identityGenerationRef.current;
    const requestGeneration = ++cloudRequestGenerationRef.current;
    lastCloudRefreshAttemptRef.current = Date.now();
    setCloudLoading(true);
    setCloudError(null);
    try {
      const result = await bootstrapCloudAccount();
      if (
        identityGeneration !== identityGenerationRef.current
        || requestGeneration !== cloudRequestGenerationRef.current
        || auth.currentUser?.uid !== uid
        || !auth.currentUser.emailVerified
      ) return null;
      datasetIdRef.current = result.datasetId;
      setDatasetId(result.datasetId);
      return result.datasetId;
    } catch {
      if (
        identityGeneration !== identityGenerationRef.current
        || requestGeneration !== cloudRequestGenerationRef.current
        || auth.currentUser?.uid !== uid
      ) return null;
      setCloudError(
        "Your account is signed in, but secure Firestore data is unavailable.",
      );
      return null;
    } finally {
      if (
        identityGeneration === identityGenerationRef.current
        && requestGeneration === cloudRequestGenerationRef.current
      ) {
        setCloudLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const refreshAccessLease = () => {
      if (
        document.visibilityState !== "visible"
        || !activeUidRef.current
        || !activeVerifiedRef.current
        || Date.now() - lastCloudRefreshAttemptRef.current
          < ACCOUNT_ACCESS_REFRESH_INTERVAL_MS
      ) return;
      void refreshCloudAccount();
    };
    const interval = window.setInterval(
      refreshAccessLease,
      ACCOUNT_ACCESS_REFRESH_INTERVAL_MS,
    );
    window.addEventListener("focus", refreshAccessLease);
    window.addEventListener("online", refreshAccessLease);
    document.addEventListener("visibilitychange", refreshAccessLease);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshAccessLease);
      window.removeEventListener("online", refreshAccessLease);
      document.removeEventListener("visibilitychange", refreshAccessLease);
    };
  }, [refreshCloudAccount]);

  const openAuth = useCallback((nextScreen?: AuthScreen) => {
    setScreen(nextScreen ?? (firebaseUser ? "profile" : "sign-in"));
  }, [firebaseUser]);

  const closeAuth = useCallback(() => setScreen(null), []);

  const refreshUser = useCallback(async () => {
    const auth = await getFirebaseAuth();
    if (!auth.currentUser) {
      activeUidRef.current = null;
      activeVerifiedRef.current = false;
      datasetIdRef.current = null;
      setFirebaseUser(null);
      setUser(null);
      return null;
    }
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    setFirebaseUser(auth.currentUser);
    const refreshed = snapshotUser(auth.currentUser);
    setUser(refreshed);
    if (refreshed.emailVerified) {
      await refreshCloudAccount();
    } else {
      datasetIdRef.current = null;
      setDatasetId(null);
    }
    return refreshed;
  }, [refreshCloudAccount]);

  const registerBeforeSignOut = useCallback((
    handler: () => Promise<void>,
  ) => {
    beforeSignOutHandlersRef.current.add(handler);
    return () => {
      beforeSignOutHandlersRef.current.delete(handler);
    };
  }, []);

  const signOut = useCallback(() => {
    if (signOutPromiseRef.current) return signOutPromiseRef.current;
    const operation = (async () => {
      const auth = await getFirebaseAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      for (const handler of [...beforeSignOutHandlersRef.current]) {
        try {
          await handler();
        } catch {
          throw beforeSignOutError(
            "Course changes could not be saved. You are still signed in; retry the cloud save before logging out.",
          );
        }
        if (auth.currentUser?.uid !== uid) {
          throw beforeSignOutError(
            "The signed-in account changed while course data was being saved.",
          );
        }
      }
      await signOutAccount();
      setScreen(null);
    })().finally(() => {
      signOutPromiseRef.current = null;
    });
    signOutPromiseRef.current = operation;
    return operation;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    user,
    datasetId,
    cloudLoading,
    cloudError,
    openAuth,
    closeAuth,
    refreshUser,
    refreshCloudAccount,
    registerBeforeSignOut,
    signOut,
  }), [
    closeAuth,
    cloudError,
    cloudLoading,
    datasetId,
    loading,
    openAuth,
    refreshCloudAccount,
    refreshUser,
    registerBeforeSignOut,
    signOut,
    user,
  ]);

  return (
    <AuthContext.Provider value={value}>
      <div
        className="auth-background"
        aria-hidden={screen ? true : undefined}
        inert={screen ? true : undefined}
      >
        {children}
      </div>
      {screen ? (
        <AuthDialog
          firebaseUser={firebaseUser}
          screen={screen}
          setScreen={setScreen}
          onClose={closeAuth}
          refreshUser={refreshUser}
          signOut={signOut}
        />
      ) : null}
    </AuthContext.Provider>
  );
}

function beforeSignOutError(message: string): Error {
  const error = new Error(message) as Error & { code: string };
  error.code = "auth/pending-cloud-save";
  return error;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

function snapshotUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    providerIds: user.providerData
      .map((provider) => provider.providerId)
      .filter(Boolean),
    createdAt: user.metadata.creationTime ?? null,
    lastSignInAt: user.metadata.lastSignInTime ?? null,
  };
}
