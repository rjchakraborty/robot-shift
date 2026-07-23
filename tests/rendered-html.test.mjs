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
  assert.match(html, /<meta name="theme-color" content="#f3f0e7"\/>/i);
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
    /<meta name="description" content="A practical 180-day robotics course, progress tracker, and AI tutor for a software engineer moving into embodied AI\."\/>/i,
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
    /^page-[\w-]+\.js$/.test(file),
  );
  assert.ok(pageAssets.length > 0, "the build should emit a client page bundle");

  const bundle = (
    await Promise.all(
      pageAssets.map((file) => readFile(new URL(file, clientAssetsRoot), "utf8")),
    )
  ).join("\n");

  const releaseSignals = [
    ["daily task workflow", "Understand. Build. Prove."],
    ["guided lesson path", "GUIDED LESSON PATH"],
    ["evidence-based course points", "Proof XP"],
    ["proof-chain gamification", "day proof chain"],
    ["180-day roadmap", "180-DAY OPERATING PLAN"],
    ["roadmap search and filters", "Roadmap explorer"],
    ["portfolio milestones", "Six builds. Six hiring signals."],
    ["notes and evidence", "Notebook & evidence locker"],
    ["progress analytics", "READINESS INSTRUMENT PANEL"],
    ["job-readiness evidence", "JOB-READINESS MATRIX"],
    ["local persistence", "robot-shift-tracker-v1"],
    ["persisted system, light, and dark themes", "robot-shift-theme-v1"],
    ["progress export", "Export backup"],
    ["progress import", "Import backup"],
    ["guarded reset", "Reset all progress?"],
    ["daily knowledge studio", "KNOWLEDGE STUDIO"],
    ["day-linked visual field guides", "Visual field guide"],
    ["concept, math, and failure diagram modes", "Failure case"],
    ["software-to-robotics analogy warnings", "Dangerous difference:"],
    ["beginner teaching modes", "Explain simply"],
    ["simple math walkthroughs", "Math lab"],
    ["26-week beginner math rescue", "BEGINNER RESCUE"],
    ["real-world application examples", "Real-life examples"],
    ["teach-back and quiz practice", "Quiz / teach-back"],
    ["inline AI teacher", "Ask your patient robotics teacher"],
    ["device-local tutor history", "robot-shift-tutor-v1"],
    ["original source synthesis notice", "Original teaching synthesis"],
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
});
