export const THEME_STORAGE_KEY = "robot-shift-theme-v1";

export const themePreferences = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export function parseThemePreference(value: unknown): ThemePreference {
  return typeof value === "string" && themePreferences.includes(value as ThemePreference)
    ? value as ThemePreference
    : "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemDark ? "dark" : "light";
  return preference;
}

export const THEME_INITIALIZER = `(() => {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const preference = "system";
  const theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  root.dataset.themePreference = preference;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0f1115" : "#ffffff");
})();`;
