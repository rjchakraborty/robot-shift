"use client";

import { useEffect } from "react";
import { logClientException } from "./firebase-observability";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void logClientException("root_boundary", error, true);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="empty-state" role="alert">
          <span>RECOVERY MODE</span>
          <h2>RobotShift could not start</h2>
          <p>
            Your browser-saved progress has not been removed. Retry the
            application shell.
          </p>
          <button type="button" onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
