import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const clientAssetsRoot = new URL("../dist/client/assets/", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Robot/Shift release shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en">/i);
  assert.match(html, /<meta name="color-scheme" content="light dark"\/>/i);
  assert.match(html, /<meta name="theme-color" content="#ffffff"\/>/i);
  assert.match(html, /<script id="theme-init">/i);
  assert.match(html, /robot-shift-theme-v1/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.ok(
    html.indexOf("<body") < html.indexOf('id="theme-init"')
      && html.indexOf('id="theme-init"') < html.indexOf('<main class="boot-screen"'),
    "theme initialization must be the first executable body content",
  );
  assert.match(
    html,
    /<title>Robot\/Shift — 180-Day Robotics Field Manual<\/title>/i,
  );
  assert.match(
    html,
    /<meta name="description" content="A practical 180-day robotics course and AI tutor for a software engineer moving into embodied AI\."\/>/i,
  );
  assert.match(
    html,
    /<meta name="application-name" content="Robot\/Shift"\/>/i,
  );
  assert.match(
    html,
    /<meta property="og:image" content="http:\/\/localhost:3000\/og\.png"\/>/i,
  );
  assert.match(
    html,
    /<main class="boot-screen" aria-live="polite"><div class="boot-mark">R\/S<\/div><p>Loading your field manual…<\/p><\/main>/i,
  );

  const entryMatch = html.match(
    /<script id="_R_">import\("(\/assets\/index-[^"]+\.js)"\)<\/script>/i,
  );
  assert.ok(entryMatch, "the rendered shell should load the built client entry");
  await access(new URL(`../dist/client${entryMatch[1]}`, import.meta.url));

  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.doesNotMatch(
    html,
    /Your site is taking shape|Building your site|react-loading-skeleton/i,
  );
});

test("ships the complete Robot/Shift curriculum manager", async () => {
  const pageAssets = (await readdir(clientAssetsRoot)).filter((file) =>
    /\.js$/.test(file),
  );
  assert.ok(pageAssets.length > 0, "the build should emit client bundles");

  const bundle = (
    await Promise.all(
      pageAssets.map((file) => readFile(new URL(file, clientAssetsRoot), "utf8")),
    )
  ).join("\n");

  const releaseSignals = [
    ["practical lesson workflow", "Build today"],
    ["180-day curriculum", "Curriculum"],
    ["roadmap search and filters", "Search topics, labs, or notes"],
    ["portfolio milestones", "Portfolio projects"],
    ["notes and evidence", "Notes and evidence"],
    ["local persistence", "robot-shift-tracker-v2"],
    ["persisted system, light, and dark themes", "robot-shift-theme-v1"],
    ["course data export", "Export backup"],
    ["course data import", "Import backup"],
    ["guarded reset", "Reset saved course data?"],
    ["content-first lesson", "Build the physical picture first"],
    ["beginner vocabulary", "Words you need"],
    ["typeset exact-topic mathematics", "Math, one line at a time"],
    ["real-world application examples", "Physical examples"],
    ["measurable practical learning", "Hands-on exercise"],
    ["corrected misconceptions", "Common mistakes"],
    ["role and interview alignment", "Job connection"],
    ["chapter-specific interview practice", "Interview questions:"],
    ["interview scenario practice", "Primary interview scenario"],
    ["answer-backed technical follow-ups", "Model interview answer"],
    ["inline AI teacher", "Ask the AI teacher"],
    ["compact tutor teaching mode", "Teaching style"],
    ["chapter-level learning media", "Chapter references"],
    ["device-local tutor history", "robot-shift-tutor-v2"],
  ];

  for (const [capability, signal] of releaseSignals) {
    assert.ok(
      bundle.includes(signal),
      `the built app should include ${capability}: ${signal}`,
    );
  }

  assert.doesNotMatch(
    bundle,
    /Your site is taking shape|Building your site|react-loading-skeleton/i,
  );

  for (const clutter of [
    "Proof XP",
    "day proof chain",
    "COURSE RANK",
    "READINESS INSTRUMENT PANEL",
    "JOB-READINESS MATRIX",
    "Mark Understand complete",
    "Learn the idea, then make it physical.",
    "NEED ANOTHER ANGLE?",
    "Your first useful failure belongs here.",
    "You are changing domain, not restarting your career",
    "Six builds. Six hiring signals.",
    "Guided lesson path",
    "Practical task",
    "Optional help",
    "80/20 summary",
    "Story and metaphor",
    "EXPLAIN IT LIKE I’M 12",
    "START FROM ZERO",
    "Watch / explore",
    "Mark important",
    "NEXT LEARNING STEP",
    "RECALL BEFORE REVEAL",
    "Answer before revealing",
    "Check your understanding",
  ]) {
    assert.ok(!bundle.includes(clutter), `the default course UI should omit repeated or motivational copy: ${clutter}`);
  }

  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(pageSource, /id:\s*"progress"|<ProgressView|rail-progress|daily-quest|build-meter/);
  assert.equal(
    (pageSource.match(/\{ id: "(?:today|roadmap|roles|builds|notebook)", label:/g) ?? []).length,
    5,
    "the primary interface should expose exactly five quiet navigation destinations",
  );
});

test("keeps tutor Markdown in one readable document flow", async () => {
  const [studioSource, globalStyles] = await Promise.all([
    readFile(new URL("../app/learning-studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(studioSource, /className="chat-message-meta"/);
  assert.match(globalStyles, /\.chat-message-meta\s*\{/);
  assert.doesNotMatch(globalStyles, /\.chat-message\s*>\s*div\s*\{/);
});
