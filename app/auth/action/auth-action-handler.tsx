"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  firebaseAuthErrorMessage,
  parseAuthAction,
  safeContinueUrl,
} from "../auth-core";
import {
  applyEmailAction,
  completePasswordReset,
  inspectEmailAction,
  verifyPasswordReset,
} from "../auth-service";
import styles from "./page.module.css";

type ActionState =
  | { status: "loading" }
  | {
    status: "reset-ready";
    actionCode: string;
    email: string;
    continueUrl: string;
  }
  | {
    status: "success";
    title: string;
    message: string;
    continueUrl: string;
  }
  | { status: "error"; message: string };

export function AuthActionHandler() {
  const [state, setState] = useState<ActionState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const parsed = parseAuthAction(window.location.search);
    // The one-time code is needed only in memory. Remove it, continueUrl, and
    // every other query/hash value before any provider request or user action
    // can disclose the visible URL through a copy, screenshot, or referrer.
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );
    if (!parsed) {
      const timer = window.setTimeout(() => {
        if (active) {
          setState({
            status: "error",
            message: "This account link is incomplete or invalid.",
          });
        }
      }, 0);
      return () => {
        active = false;
        window.clearTimeout(timer);
      };
    }

    const continueUrl = safeContinueUrl(
      parsed.continueUrl,
      window.location.origin,
    );
    const handle = async () => {
      try {
        if (parsed.mode === "resetPassword") {
          const email = await verifyPasswordReset(parsed.oobCode);
          if (active) {
            setState({
              status: "reset-ready",
              actionCode: parsed.oobCode,
              email,
              continueUrl,
            });
          }
          return;
        }

        await inspectEmailAction(parsed.oobCode);
        await applyEmailAction(parsed.oobCode);
        if (!active) return;
        setState({
          status: "success",
          title: parsed.mode === "verifyEmail"
            ? "Email verified"
            : "Email address recovered",
          message: parsed.mode === "verifyEmail"
            ? "Your account is verified. You can now sign in and use Tutor."
            : "The previous email address has been restored. Reset the password if you did not request the original change.",
          continueUrl,
        });
      } catch (caught) {
        if (active) {
          setState({
            status: "error",
            message: firebaseAuthErrorMessage(
              caught,
              "This account link could not be completed.",
            ),
          });
        }
      }
    };

    void handle();
    return () => {
      active = false;
    };
  }, []);

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "reset-ready" || submitting) return;
    if (password !== confirmation) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await completePasswordReset(state.actionCode, password);
      setState({
        status: "success",
        title: "Password reset complete",
        message: "Your new password is active. Sign in to continue learning.",
        continueUrl: state.continueUrl,
      });
      setPassword("");
      setConfirmation("");
    } catch (caught) {
      setFormError(firebaseAuthErrorMessage(
        caught,
        "The password could not be reset.",
      ));
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === "loading") {
    return (
      <div className={styles.action} aria-live="polite">
        <p className={styles.eyebrow}>SECURE ACCOUNT ACTION</p>
        <h1>Checking this link…</h1>
        <p>Firebase is verifying the one-time action code.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={styles.action}>
        <p className={styles.eyebrow}>LINK NOT ACCEPTED</p>
        <h1>Request a new account email</h1>
        <p role="alert">{state.message}</p>
        <Link className={styles.primary} href="/">Return to Robot/Shift</Link>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className={styles.action}>
        <p className={styles.eyebrow}>ACCOUNT UPDATED</p>
        <h1>{state.title}</h1>
        <p role="status">{state.message}</p>
        <Link className={styles.primary} href={state.continueUrl}>
          Continue to Robot/Shift
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.action}>
      <p className={styles.eyebrow}>RESET PASSWORD</p>
      <h1>Choose a new password</h1>
      <p>
        Resetting the password for <strong>{state.email}</strong>.
      </p>
      <form onSubmit={submitReset} className={styles.form}>
        <label htmlFor="action-password">
          New password
          <input
            id="action-password"
            type="password"
            autoComplete="new-password"
            value={password}
            required
            onChange={(event) => setPassword(event.currentTarget.value)}
            disabled={submitting}
            aria-describedby="action-password-rules"
          />
        </label>
        <p id="action-password-rules">
          Use 12–128 characters with uppercase, lowercase, a number, and a symbol.
        </p>
        <label htmlFor="action-confirmation">
          Confirm new password
          <input
            id="action-confirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            required
            onChange={(event) => setConfirmation(event.currentTarget.value)}
            disabled={submitting}
          />
        </label>
        {formError ? <p className={styles.error} role="alert">{formError}</p> : null}
        <button className={styles.primary} disabled={submitting}>
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
