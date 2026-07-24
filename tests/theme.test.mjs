import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  parseThemePreference,
  resolveTheme,
  THEME_INITIALIZER,
} from "../app/theme.ts";

function contrastRatio(foreground, background) {
  const luminance = (hex) => {
    const channels = hex
      .match(/[0-9a-f]{2}/gi)
      .map((part) => Number.parseInt(part, 16) / 255)
      .map((value) => (
        value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4
      ));
    return (
      (0.2126 * channels[0])
      + (0.7152 * channels[1])
      + (0.0722 * channels[2])
    );
  };
  const values = [luminance(foreground), luminance(background)]
    .sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

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

test("the pre-paint initializer uses system preference without browser persistence", () => {
  assert.ok(THEME_INITIALIZER.includes('const preference = "system"'));
  assert.ok(THEME_INITIALIZER.includes("prefers-color-scheme: dark"));
  assert.ok(THEME_INITIALIZER.includes("dataset.themePreference"));
  assert.ok(THEME_INITIALIZER.includes("dataset.theme"));
  assert.ok(THEME_INITIALIZER.includes("style.colorScheme"));
  assert.ok(THEME_INITIALIZER.includes('meta[name="theme-color"]'));
  assert.doesNotMatch(THEME_INITIALIZER, /localStorage|sessionStorage|cookie/);
});

test("the theme selector remains an accessible Firestore-backed native control", async () => {
  const source = await readFile(
    new URL("../app/theme-control.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<fieldset className="theme-control" aria-label="Color theme">/);
  assert.match(source, /type="radio"/);
  assert.match(source, /checked=\{preference === option\.value\}/);
  assert.match(source, /saveThemePreference\(next\)/);
  assert.match(source, /System/);
  assert.match(source, /Light/);
  assert.match(source, /Dark/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/);
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

  assert.match(
    css,
    /\.lesson-article__deliverable h3\s*\{[^}]*color:\s*var\(--steel\)/s,
  );
  assert.match(
    css,
    /\.lesson-article__deliverable p\s*\{[^}]*color:\s*var\(--ink\)/s,
  );
  assert.match(
    css,
    /\.career-jd-input:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--cyan\)/s,
  );
});

test("the fixed dark tutor keeps readable colors in both page themes", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.tutor-panel\s*\{[^}]*color:\s*#f8fafc/s);
  assert.match(
    css,
    /\.tutor-panel \.tutor-mode-select\s*\{[^}]*color:\s*#dce0df/s,
  );
  assert.match(
    css,
    /\.tutor-panel \.tutor-mode-select select\s*\{[^}]*background:\s*#151b1e[^}]*color:\s*#f8fafc/s,
  );
  assert.ok(contrastRatio("#f8fafc", "#20282b") >= 4.5);
  assert.ok(contrastRatio("#dce0df", "#20282b") >= 4.5);
  assert.ok(contrastRatio("#f8fafc", "#151b1e") >= 4.5);
});
