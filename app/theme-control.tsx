"use client";

import { useEffect, useState } from "react";
import {
  resolveTheme,
  type ThemePreference,
} from "./theme";
import { useAuth } from "./auth/auth-context";
import { useCourseData } from "./data/course-data-context";

const options: readonly {
  value: ThemePreference;
  label: string;
  icon: "system" | "sun" | "moon";
}[] = [
  { value: "system", label: "System", icon: "system" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

function ThemeIcon({ icon }: { icon: "system" | "sun" | "moon" }) {
  if (icon === "system") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3.5" y="4.5" width="17" height="12" rx="1" />
        <path d="M8 20h8M12 16.5V20" />
      </svg>
    );
  }

  if (icon === "sun") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.1 15.2A8.5 8.5 0 0 1 8.8 3.9 8.5 8.5 0 1 0 20.1 15.2Z" />
    </svg>
  );
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = resolveTheme(preference, systemDark);
  root.dataset.themePreference = preference;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0d1113" : "#f3f0e7");
}

export function ThemeControl() {
  const { user } = useAuth();
  const {
    busy,
    ready,
    saveThemePreference,
    theme: preference,
  } = useCourseData();
  const [storageMessage, setStorageMessage] = useState("");

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (preference === "system") applyTheme("system");
    };
    media.addEventListener("change", onSystemChange);
    return () => {
      media.removeEventListener("change", onSystemChange);
    };
  }, [preference]);

  function chooseTheme(next: ThemePreference) {
    if (!user?.emailVerified) {
      void saveThemePreference(next);
      setStorageMessage("Sign in with a verified account to save this theme.");
      return;
    }
    void saveThemePreference(next)
      .then(() => setStorageMessage(""))
      .catch(() => {
        setStorageMessage("Theme changed for this session but cloud saving failed.");
      });
  }

  return (
    <div className="theme-control-wrap">
      <fieldset className="theme-control" aria-label="Color theme">
        <legend className="sr-only">Color theme</legend>
        {options.map((option) => (
          <label key={option.value} title={`${option.label} theme`}>
            <input
              type="radio"
              name="color-theme"
              value={option.value}
              checked={preference === option.value}
              disabled={busy || !ready}
              onChange={() => chooseTheme(option.value)}
            />
            <span>
              <ThemeIcon icon={option.icon} />
              <b>{option.label}</b>
            </span>
          </label>
        ))}
      </fieldset>
      <span className="sr-only" role="status">{storageMessage}</span>
    </div>
  );
}
