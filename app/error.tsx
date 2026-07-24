"use client";

import { useEffect } from "react";
import { logClientException } from "./firebase-observability";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void logClientException("route_boundary", error, true);
  }, [error]);

  return (
    <main className="empty-state" role="alert">
      <span>RECOVERY MODE</span>
      <h2>This lesson view could not continue</h2>
      <p>
        Your browser-saved progress is still available. Retry the view to
        restore the curriculum.
      </p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
