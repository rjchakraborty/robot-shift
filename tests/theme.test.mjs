import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ThemeControl } from "../app/theme-control.tsx";
import {
  parseThemePreference,
  resolveTheme,
  THEME_INITIALIZER,
  THEME_STORAGE_KEY,
} from "../app/theme.ts";

test("theme preferences resolve deterministically", () => {
  assert.equal(parseThemePreference("system"), "system");
  assert.equal(parseThemePreference("light"), "light");
  assert.equal(parseThemePreference("dark"), "dark");
  assert.equal(parseThemePreference("sepia"), "system");
  assert.equal(parseThemePreference(null), "system");

  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("the pre-paint initializer supports storage, system preference, and theme chrome", () => {
  assert.ok(THEME_INITIALIZER.includes(THEME_STORAGE_KEY));
  assert.ok(THEME_INITIALIZER.includes("prefers-color-scheme: dark"));
  assert.ok(THEME_INITIALIZER.includes("dataset.themePreference"));
  assert.ok(THEME_INITIALIZER.includes("dataset.theme"));
  assert.ok(THEME_INITIALIZER.includes("style.colorScheme"));
  assert.ok(THEME_INITIALIZER.includes('meta[name="theme-color"]'));
});

test("the theme selector is an accessible native three-choice control", () => {
  const html = renderToStaticMarkup(createElement(ThemeControl));
  assert.match(html, /<fieldset[^>]*class="theme-control"[^>]*aria-label="Color theme"/);
  assert.equal((html.match(/type="radio"/g) ?? []).length, 3);
  assert.match(html, /<input(?=[^>]*value="system")(?=[^>]*checked)[^>]*>/);
  assert.match(html, />System</);
  assert.match(html, />Light</);
  assert.match(html, />Dark</);
  assert.equal((html.match(/<svg/g) ?? []).length, 3);
});

test("dark mode covers page surfaces and both vector teaching systems", async () => {
  const [css, lessonVisual, interactiveMath] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/lesson-visual.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/interactive-math-playground.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(css, /:root\[data-theme="dark"\]/);
  for (const token of [
    "--surface-inverse",
    "--surface-highlight",
    "--text-on-accent",
    "--visual-paper",
    "--visual-input",
    "--visual-warning",
  ]) {
    assert.ok(css.includes(token), `expected theme token ${token}`);
  }
  assert.match(lessonVisual, /var\(--visual-paper\)/);
  assert.match(lessonVisual, /var\(--visual-fault-fill\)/);
  assert.match(interactiveMath, /var\(--visual-paper\)/);
  assert.doesNotMatch(
    `${lessonVisual}\n${interactiveMath}`,
    /colours\s*=\s*\{[^}]*#[0-9a-f]{6}/is,
  );
});

test("dark lesson and career edge states keep accessible semantic contrast", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.lesson-kicker\s*\{[^}]*color:\s*var\(--signal-text\)/s);
  assert.match(css, /\.example-card\s*>\s*span\s*\{[^}]*color:\s*var\(--signal-text\)/s);
  assert.match(css, /\.quiz-list summary\s*>\s*span\s*\{[^}]*color:\s*var\(--signal-text\)/s);
  assert.match(css, /\.practice-list article\s*>\s*span\s*\{[^}]*color:\s*var\(--text-on-accent\)/s);
  assert.match(css, /\.story-lesson\s*>\s*p\s*\{[^}]*color:\s*var\(--steel\)/s);
  assert.match(
    css,
    /\.career-jd-input:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--cyan\)/s,
  );
});
