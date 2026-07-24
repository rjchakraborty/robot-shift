"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Analytics } from "firebase/analytics";
import type { FirebasePerformance } from "firebase/performance";
import {
  FirebaseClientConfigurationError,
  getFirebaseApp,
  hasFirebaseMeasurementId,
} from "./firebase-client";
import type { StoredTutorMode } from "./storage-migrations";
import { useCourseData } from "./data/course-data-context";

type AnalyticsModule = typeof import("firebase/analytics");

type AnalyticsContext = {
  analytics: Analytics;
  module: AnalyticsModule;
};

type TutorRequestStatus =
  | "started"
  | "succeeded"
  | "failed"
  | "cancelled";

type AccountAccessEvent = "login" | "sign_up";

const tutorModes = new Set<StoredTutorMode>([
  "ask",
  "pareto",
  "simple",
  "math",
  "solve",
  "quiz",
  "story",
]);

const tutorStatuses = new Set<TutorRequestStatus>([
  "started",
  "succeeded",
  "failed",
  "cancelled",
]);

const tutorFailureCodes = new Set([
  "none",
  "invalid_request",
  "authentication_required",
  "email_verification_required",
  "configuration",
  "app_check",
  "network",
  "provider",
  "provider_busy",
  "safety",
  "empty_response",
  "max_tokens",
  "timeout",
  "cancelled",
  "unknown",
]);

let analyticsPromise: Promise<AnalyticsContext | null> | null = null;
let performancePromise: Promise<FirebasePerformance | null> | null = null;
let performanceInstance: FirebasePerformance | null = null;
let performanceConsentGranted = false;
let observabilityPromise: Promise<void> | null = null;
let globalHandlersAttached = false;
let reportedExceptionCount = 0;

export function FirebaseObservability() {
  const { performanceMonitoring } = useCourseData();
  const pathname = usePathname();

  useEffect(() => {
    void initializeFirebaseObservability();
  }, []);

  useEffect(() => {
    void setPerformanceMonitoringConsent(
      performanceMonitoring && !pathname.startsWith("/auth/action"),
    );
  }, [pathname, performanceMonitoring]);

  return null;
}

export function initializeFirebaseObservability(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  attachGlobalErrorHandlers();
  observabilityPromise ??= getAnalyticsContext().then(() => undefined);
  return observabilityPromise;
}

export async function setPerformanceMonitoringConsent(
  granted: boolean,
): Promise<void> {
  performanceConsentGranted = granted;
  if (!granted) {
    if (performanceInstance) {
      performanceInstance.instrumentationEnabled = false;
      performanceInstance.dataCollectionEnabled = false;
    }
    return;
  }
  if (!isProductionObservabilityOrigin()) return;
  if (window.location.pathname.startsWith("/auth/action")) return;
  const performance = await initializePerformanceAfterConsent();
  if (!performance) return;
  const stillGranted = performanceConsentGranted;
  performance.instrumentationEnabled = stillGranted;
  performance.dataCollectionEnabled = stillGranted;
}

export function logTutorRequestEvent(input: {
  dayId: number;
  mode: StoredTutorMode;
  status: TutorRequestStatus;
  latencyMs?: number;
  failureCode?: string;
}): Promise<void> {
  const dayId = Number.isInteger(input.dayId)
    ? Math.min(180, Math.max(1, input.dayId))
    : 1;
  const mode = tutorModes.has(input.mode) ? input.mode : "ask";
  const status = tutorStatuses.has(input.status) ? input.status : "failed";
  const failureCode: string = tutorFailureCodes.has(input.failureCode ?? "")
    ? input.failureCode ?? "unknown"
    : status === "failed"
      ? "unknown"
      : "none";

  return logBoundedEvent("tutor_request", {
    day_id: dayId,
    mode,
    status,
    latency_bucket: latencyBucket(input.latencyMs),
    failure_code: failureCode,
  });
}

export function logLessonViewEvent(input: {
  dayId: number;
  week: number;
  phaseId: string;
  entrySurface: "course_home" | "lesson_page";
}): Promise<void> {
  return logBoundedEvent("lesson_view", {
    day_id: Number.isInteger(input.dayId)
      ? Math.min(180, Math.max(1, input.dayId))
      : 1,
    week: Number.isInteger(input.week)
      ? Math.min(26, Math.max(1, input.week))
      : 1,
    phase_id: /^[a-z0-9-]{1,40}$/.test(input.phaseId)
      ? input.phaseId
      : "unknown",
    entry_surface: input.entrySurface,
  });
}

export function logAccountAccessEvent(input: {
  event: AccountAccessEvent;
  method: "password" | "google";
}): Promise<void> {
  return logBoundedEvent(input.event, {
    method: input.method,
  });
}

export function logClientException(
  surface: "route_boundary" | "root_boundary" | "window_error" | "unhandled_rejection",
  error: unknown,
  fatal: boolean,
): Promise<void> {
  if (reportedExceptionCount >= 5) return Promise.resolve();
  reportedExceptionCount += 1;
  return logBoundedEvent("exception", {
    surface,
    description: classifyClientError(error),
    fatal,
  });
}

async function getAnalyticsContext(): Promise<AnalyticsContext | null> {
  analyticsPromise ??= (async () => {
    if (!hasFirebaseMeasurementId()) return null;
    if (!isProductionObservabilityOrigin()) return null;
    if (window.location.pathname.startsWith("/auth/action")) return null;

    try {
      const [app, analyticsModule] = await Promise.all([
        getFirebaseApp(),
        import("firebase/analytics"),
      ]);
      if (!(await analyticsModule.isSupported())) return null;
      analyticsModule.setConsent({
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        functionality_storage: "denied",
        personalization_storage: "denied",
        security_storage: "granted",
      });
      analyticsModule.setDefaultEventParameters({
        page_location: `${window.location.origin}${window.location.pathname}`,
        page_referrer: "",
      });
      return {
        analytics: analyticsModule.initializeAnalytics(app, {
          config: {
            send_page_view: false,
          },
        }),
        module: analyticsModule,
      };
    } catch {
      return null;
    }
  })();

  return analyticsPromise;
}

async function initializePerformanceAfterConsent():
Promise<FirebasePerformance | null> {
  performancePromise ??= (async () => {
    if (!isProductionObservabilityOrigin()) return null;
    if (window.location.pathname.startsWith("/auth/action")) return null;
    try {
      const [app, performanceModule] = await Promise.all([
        getFirebaseApp(),
        import("firebase/performance"),
      ]);
      const enabled = performanceConsentGranted;
      performanceInstance = performanceModule.initializePerformance(app, {
        instrumentationEnabled: enabled,
        dataCollectionEnabled: enabled,
      });
      return performanceInstance;
    } catch {
      // Observability must never block the curriculum or tutor UI.
      return null;
    }
  })();

  return performancePromise;
}

function isProductionObservabilityOrigin(): boolean {
  return window.location.origin === "https://robotshift.web.app";
}

async function logBoundedEvent(
  eventName:
    | "tutor_request"
    | "lesson_view"
    | "exception"
    | AccountAccessEvent,
  parameters: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    if (window.location.pathname.startsWith("/auth/action")) return;
    const context = await getAnalyticsContext();
    if (!context) return;
    if (eventName === "exception") {
      context.module.logEvent(context.analytics, "exception", {
        description: String(parameters.description ?? "unknown"),
        fatal: Boolean(parameters.fatal),
      });
      return;
    }
    if (eventName === "login") {
      context.module.logEvent(context.analytics, "login", {
        method: String(parameters.method ?? "unknown"),
      });
      return;
    }
    if (eventName === "sign_up") {
      context.module.logEvent(context.analytics, "sign_up", {
        method: String(parameters.method ?? "unknown"),
      });
      return;
    }
    context.module.logEvent(context.analytics, eventName, parameters);
  } catch {
    // Analytics failures are intentionally non-fatal.
  }
}

function attachGlobalErrorHandlers() {
  if (globalHandlersAttached) return;
  globalHandlersAttached = true;

  window.addEventListener("error", (event) => {
    void logClientException("window_error", event.error, false);
  });
  window.addEventListener("unhandledrejection", (event) => {
    void logClientException("unhandled_rejection", event.reason, false);
  });
}

function latencyBucket(latencyMs: number | undefined): string {
  if (!Number.isFinite(latencyMs)) return "not_available";
  if ((latencyMs ?? 0) < 1_000) return "under_1s";
  if ((latencyMs ?? 0) < 3_000) return "1_to_3s";
  if ((latencyMs ?? 0) < 10_000) return "3_to_10s";
  if ((latencyMs ?? 0) < 30_000) return "10_to_30s";
  return "over_30s";
}

function classifyClientError(error: unknown): string {
  if (error instanceof FirebaseClientConfigurationError) {
    return "configuration";
  }
  if (error instanceof DOMException) return "dom_exception";
  if (error instanceof TypeError) return "type_error";
  if (error instanceof Error) return "runtime_error";
  return "unknown";
}
