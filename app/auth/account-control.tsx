"use client";

import { useAuth } from "./auth-context";

export function AccountControl() {
  const { loading, openAuth, user } = useAuth();
  const label = user
    ? user.displayName?.split(/\s+/)[0] || user.email || "Account"
    : "Sign in";

  return (
    <button
      type="button"
      className="account-control"
      disabled={loading}
      onClick={() => openAuth(user ? "profile" : "sign-in")}
      aria-label={user ? `Open account for ${label}` : "Sign in or create an account"}
    >
      <span aria-hidden="true" className="account-control-mark">
        {user ? initials(user.displayName || user.email || "A") : "↗"}
      </span>
      <span>{loading ? "Account…" : label}</span>
    </button>
  );
}

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
}
