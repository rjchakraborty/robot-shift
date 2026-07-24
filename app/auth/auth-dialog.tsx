"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import type { User } from "firebase/auth";
import { logAccountAccessEvent } from "../firebase-observability";
import {
  firebaseAuthErrorCode,
  firebaseAuthErrorMessage,
  validateEmail,
} from "./auth-core";
import type { AuthScreen, AuthUser } from "./auth-context";
import {
  changeAccountPassword,
  registerWithEmail,
  requestPasswordReset,
  sendVerificationEmail,
  signInWithEmail,
  signInWithGoogle,
  updateAccountName,
} from "./auth-service";
import styles from "./auth-dialog.module.css";

type AuthDialogProps = {
  firebaseUser: User | null;
  screen: AuthScreen;
  setScreen: Dispatch<SetStateAction<AuthScreen | null>>;
  onClose: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
};

type AuthFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const emptyForm: AuthFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function AuthDialog({
  firebaseUser,
  screen,
  setScreen,
  onClose,
  refreshUser,
  signOut,
}: AuthDialogProps) {
  const [form, setForm] = useState<AuthFormState>(() => ({
    ...emptyForm,
    name: firebaseUser?.displayName ?? "",
    email: firebaseUser?.email ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCoolingDown, setResendCoolingDown] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resendTimerRef = useRef<number | null>(null);

  const effectiveScreen = !firebaseUser
    ? screen === "profile" || screen === "verify-email"
      ? "sign-in"
      : screen
    : screen;
  const hasPasswordProvider = Boolean(
    firebaseUser?.providerData.some(
      (provider) => provider.providerId === "password",
    ),
  );

  useEffect(() => {
    const focusToRestore = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey
        && (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey
        && (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("auth-dialog-open");
    const focusTimer = window.setTimeout(() => headingRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("auth-dialog-open");
      window.clearTimeout(focusTimer);
      if (resendTimerRef.current !== null) {
        window.clearTimeout(resendTimerRef.current);
      }
      focusToRestore?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => headingRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [effectiveScreen]);

  function navigate(nextScreen: AuthScreen) {
    setError(null);
    setNotice(null);
    setScreen(nextScreen);
  }

  function updateField(field: keyof AuthFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function run(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await operation();
    } catch (caught) {
      setError(firebaseAuthErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      const user = await signInWithEmail(form.email, form.password);
      void logAccountAccessEvent({ event: "login", method: "password" });
      await refreshUser();
      if (user.emailVerified) {
        onClose();
      } else {
        setScreen("verify-email");
        setNotice("Verify your email before using the AI tutor.");
      }
    });
  }

  async function handleGoogleSignIn() {
    await run(async () => {
      const result = await signInWithGoogle();
      void logAccountAccessEvent({
        event: result.isNewUser ? "sign_up" : "login",
        method: "google",
      });
      await refreshUser();
      onClose();
    });
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    await run(async () => {
      const result = await registerWithEmail({
        displayName: form.name,
        email: form.email,
        password: form.password,
      });
      void logAccountAccessEvent({ event: "sign_up", method: "password" });
      await refreshUser();
      setForm((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
      }));
      setScreen("verify-email");
      setNotice(
        result.verificationSent
          ? "Account created. Open the verification email we sent before using Tutor."
          : "Account created, but the verification email could not be sent. Use resend below.",
      );
    });
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      validateEmail(form.email);
      await requestPasswordReset(form.email);
      setNotice("If an account exists for that email, a reset link has been sent.");
    } catch (caught) {
      const code = firebaseAuthErrorCode(caught);
      if (code === "validation" || code === "auth/invalid-email") {
        setError(firebaseAuthErrorMessage(caught));
      } else if (
        code === "auth/network-request-failed"
        || code === "auth/too-many-requests"
      ) {
        setError(firebaseAuthErrorMessage(caught));
      } else {
        setNotice("If an account exists for that email, a reset link has been sent.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResendVerification() {
    if (!firebaseUser || resendCoolingDown) return;
    await run(async () => {
      await sendVerificationEmail(firebaseUser);
      setResendCoolingDown(true);
      resendTimerRef.current = window.setTimeout(() => {
        setResendCoolingDown(false);
        resendTimerRef.current = null;
      }, 60_000);
      setNotice("A new verification email was sent.");
    });
  }

  async function handleVerificationRefresh() {
    await run(async () => {
      const refreshed = await refreshUser();
      if (refreshed?.emailVerified) {
        setNotice("Email verified. Tutor access is now available.");
        setScreen("profile");
      } else {
        setError("Your email is not verified yet. Open the email link, then try again.");
      }
    });
  }

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseUser) return;
    await run(async () => {
      await updateAccountName(firebaseUser, form.name);
      await refreshUser();
      setNotice("Profile name updated.");
    });
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseUser) return;
    if (form.newPassword !== form.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    await run(async () => {
      await changeAccountPassword({
        user: firebaseUser,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      setNotice("Password changed. Other sessions may need to sign in again.");
    });
  }

  async function handleSignOut() {
    await run(signOut);
  }

  const title = {
    "sign-in": "Sign in to Robot/Shift",
    "sign-up": "Create your Robot/Shift account",
    "forgot-password": "Reset your password",
    "verify-email": "Verify your email",
    profile: "Your account",
  }[effectiveScreen];

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !busy) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        aria-describedby="auth-dialog-intro"
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          disabled={busy}
          aria-label="Close account dialog"
        >
          ×
        </button>

        <header className={styles.header}>
          <p>ROBOT/SHIFT ACCOUNT</p>
          <h2 id="auth-dialog-title" ref={headingRef} tabIndex={-1}>{title}</h2>
          <span id="auth-dialog-intro">
            The curriculum remains public. A verified account secures progress
            in Firestore and protects access to the metered AI tutor.
          </span>
        </header>

        {effectiveScreen === "sign-in" ? (
          <section className={styles.content}>
            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={busy}
            >
              <span aria-hidden="true">G</span>
              Continue with Google
            </button>
            <div className={styles.divider}><span>or use email</span></div>
            <form onSubmit={handleSignIn} className={styles.form}>
              <AuthField
                id="sign-in-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                disabled={busy}
              />
              <AuthField
                id="sign-in-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(value) => updateField("password", value)}
                disabled={busy}
              />
              <div className={styles.inlineActions}>
                <button type="button" onClick={() => navigate("forgot-password")}>
                  Forgot password?
                </button>
              </div>
              <button className={styles.primary} disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className={styles.switcher}>
              New here?{" "}
              <button type="button" onClick={() => navigate("sign-up")}>
                Create an account
              </button>
            </p>
          </section>
        ) : null}

        {effectiveScreen === "sign-up" ? (
          <section className={styles.content}>
            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={busy}
            >
              <span aria-hidden="true">G</span>
              Continue with Google
            </button>
            <div className={styles.divider}><span>or register with email</span></div>
            <form onSubmit={handleSignUp} className={styles.form}>
              <AuthField
                id="sign-up-name"
                label="Name"
                type="text"
                autoComplete="name"
                maxLength={60}
                value={form.name}
                onChange={(value) => updateField("name", value)}
                disabled={busy}
              />
              <AuthField
                id="sign-up-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                disabled={busy}
              />
              <AuthField
                id="sign-up-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(value) => updateField("password", value)}
                disabled={busy}
                describedBy="password-requirements"
              />
              <p id="password-requirements" className={styles.hint}>
                Use 12–128 characters with uppercase, lowercase, a number, and a symbol.
              </p>
              <AuthField
                id="sign-up-confirm"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(value) => updateField("confirmPassword", value)}
                disabled={busy}
              />
              <button className={styles.primary} disabled={busy}>
                {busy ? "Creating account…" : "Create account"}
              </button>
            </form>
            <p className={styles.switcher}>
              Already registered?{" "}
              <button type="button" onClick={() => navigate("sign-in")}>
                Sign in
              </button>
            </p>
          </section>
        ) : null}

        {effectiveScreen === "forgot-password" ? (
          <section className={styles.content}>
            <p className={styles.explanation}>
              Enter the account email. For privacy, the result is identical whether or not the account exists.
            </p>
            <form onSubmit={handleForgotPassword} className={styles.form}>
              <AuthField
                id="reset-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                disabled={busy}
              />
              <button className={styles.primary} disabled={busy}>
                {busy ? "Requesting…" : "Send reset link"}
              </button>
            </form>
            <p className={styles.switcher}>
              <button type="button" onClick={() => navigate("sign-in")}>
                Back to sign in
              </button>
            </p>
          </section>
        ) : null}

        {effectiveScreen === "verify-email" && firebaseUser ? (
          <section className={styles.content}>
            <p className={styles.explanation}>
              We sent a verification link to <strong>{firebaseUser.email}</strong>. Tutor stays locked until Firebase confirms it.
            </p>
            <div className={styles.actionStack}>
              <button
                type="button"
                className={styles.primary}
                onClick={handleVerificationRefresh}
                disabled={busy}
              >
                I verified my email
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={handleResendVerification}
                disabled={busy || resendCoolingDown}
              >
                {resendCoolingDown
                  ? "Verification email sent"
                  : "Resend verification email"}
              </button>
              <button type="button" className={styles.textButton} onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </section>
        ) : null}

        {effectiveScreen === "profile" && firebaseUser ? (
          <section className={styles.content}>
            <dl className={styles.accountFacts}>
              <div>
                <dt>Email</dt>
                <dd>{firebaseUser.email}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{firebaseUser.emailVerified ? "Verified" : "Verification required"}</dd>
              </div>
              <div>
                <dt>Sign-in</dt>
                <dd>{providerLabel(firebaseUser)}</dd>
              </div>
            </dl>

            {!firebaseUser.emailVerified ? (
              <div className={styles.verificationWarning}>
                <strong>Email verification required</strong>
                <p>Verify this address before opening Tutor.</p>
                <button type="button" onClick={() => navigate("verify-email")}>
                  Verify email
                </button>
              </div>
            ) : null}

            <form onSubmit={handleProfile} className={styles.formSection}>
              <h3>Profile</h3>
              <AuthField
                id="profile-name"
                label="Name"
                type="text"
                autoComplete="name"
                maxLength={60}
                value={form.name}
                onChange={(value) => updateField("name", value)}
                disabled={busy}
              />
              <button className={styles.secondary} disabled={busy}>
                Save name
              </button>
            </form>

            <div className={styles.formSection}>
              <h3>Password</h3>
              {hasPasswordProvider ? (
                <form onSubmit={handlePasswordChange} className={styles.form}>
                  <AuthField
                    id="current-password"
                    label="Current password"
                    type="password"
                    autoComplete="current-password"
                    value={form.currentPassword}
                    onChange={(value) => updateField("currentPassword", value)}
                    disabled={busy}
                  />
                  <AuthField
                    id="new-password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(value) => updateField("newPassword", value)}
                    disabled={busy}
                    describedBy="change-password-requirements"
                  />
                  <p id="change-password-requirements" className={styles.hint}>
                    Use 12–128 characters with uppercase, lowercase, a number, and a symbol.
                  </p>
                  <AuthField
                    id="confirm-new-password"
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmNewPassword}
                    onChange={(value) => updateField("confirmNewPassword", value)}
                    disabled={busy}
                  />
                  <button className={styles.secondary} disabled={busy}>
                    Change password
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => {
                      updateField("email", firebaseUser.email ?? "");
                      navigate("forgot-password");
                    }}
                  >
                    Send a reset link instead
                  </button>
                </form>
              ) : (
                <p className={styles.explanation}>
                  This account signs in with Google. Its password is managed by Google.
                </p>
              )}
            </div>

            <div className={styles.signOutRow}>
              <div>
                <strong>Current browser</strong>
                <span>Your course data remains in your private Firestore account.</span>
              </div>
              <button type="button" onClick={handleSignOut} disabled={busy}>
                Log out
              </button>
            </div>
          </section>
        ) : null}

        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      </div>
    </div>
  );
}

function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  disabled,
  autoComplete,
  maxLength,
  describedBy,
}: {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  autoComplete: string;
  maxLength?: number;
  describedBy?: string;
}) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-describedby={describedBy}
        required
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function providerLabel(user: User): string {
  const providers = new Set(
    user.providerData.map((provider) => provider.providerId),
  );
  const labels = [
    providers.has("google.com") ? "Google" : "",
    providers.has("password") ? "Email and password" : "",
  ].filter(Boolean);
  return labels.join(" + ") || "Firebase";
}
