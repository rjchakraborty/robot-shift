"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth/auth-context";
import { useCourseData } from "./data/course-data-context";

export function TelemetryControl() {
  const { user } = useAuth();
  const {
    busy,
    performanceMonitoring,
    ready,
    savePerformanceMonitoringPreference,
  } = useCourseData();
  const [message, setMessage] = useState("");
  const canChange = Boolean(user?.emailVerified && ready && !busy);

  async function changeConsent(enabled: boolean) {
    setMessage("Saving performance preference…");
    try {
      await savePerformanceMonitoringPreference(enabled);
      setMessage(enabled
        ? "Performance Monitoring enabled."
        : "Performance Monitoring disabled.");
    } catch {
      setMessage("The performance preference was not saved.");
    }
  }

  return (
    <div className="telemetry-control">
      <label htmlFor="performance-monitoring">
        <input
          id="performance-monitoring"
          type="checkbox"
          checked={performanceMonitoring}
          disabled={!canChange}
          onChange={(event) => void changeConsent(event.currentTarget.checked)}
        />
        Share performance diagnostics
      </label>
      <small>
        Off by default. The choice is stored in your Firestore account.{" "}
        <Link href="/privacy/">Privacy & telemetry</Link>
      </small>
      <span className="sr-only" role="status">{message}</span>
    </div>
  );
}
