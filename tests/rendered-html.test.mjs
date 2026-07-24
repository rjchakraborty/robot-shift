import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const clientAssetsRoot = new URL("../out/_next/static/chunks/", import.meta.url);

async function render() {
  return new Response(
    await readFile(new URL("../out/index.html", import.meta.url), "utf8"),
    {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}

test("statically renders the complete Robot/Shift release shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<html lang="en" data-scroll-behavior="smooth">/i,
  );
  assert.match(html, /<meta name="color-scheme" content="light dark"\/>/i);
  assert.match(html, /<meta name="theme-color" content="#ffffff"\/>/i);
  assert.match(html, /<script id="theme-init">/i);
  assert.match(html, /const preference = "system"/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.doesNotMatch(html, /localStorage|robot-shift-theme-v1/);
  assert.ok(
    html.indexOf("<body") < html.indexOf('id="theme-init"')
      && html.indexOf('id="theme-init"') < html.indexOf('class="app-shell"'),
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
    /<meta property="og:image" content="https:\/\/robotshift\.web\.app\/og\.png"\/>/i,
  );
  assert.match(html, /<link rel="canonical" href="https:\/\/robotshift\.web\.app\/"\/>/i);
  assert.match(html, /class="app-shell"/i);
  assert.match(html, /Robot anatomy/i);
  assert.match(html, /href="\/privacy\/"[^>]*>Privacy &amp; telemetry</i);
  assert.doesNotMatch(html, /Loading your field manual/i);

  const entryMatch = html.match(
    /<script src="(\/_next\/static\/chunks\/[^"]+\.js)"[^>]*>/i,
  );
  assert.ok(entryMatch, "the rendered shell should load the built client entry");
  await access(new URL(`../out${entryMatch[1]}`, import.meta.url));

  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.doesNotMatch(
    html,
    /Your site is taking shape|Building your site|react-loading-skeleton/i,
  );
});

test("ships the complete Robot/Shift curriculum manager", async () => {
  const [pageAssets, defaultHtml] = await Promise.all([
    readdir(clientAssetsRoot).then((files) =>
      files.filter((file) => /\.js$/.test(file))
    ),
    readFile(new URL("../out/index.html", import.meta.url), "utf8"),
  ]);
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
    ["Firestore course persistence", "Saved in Cloud Firestore"],
    [
      "Firestore-backed system, light, and dark themes",
      "The theme changed for this tab but is still pending a Firestore save.",
    ],
    ["course data export", "Export backup"],
    ["course data import", "Import backup"],
    ["guarded Firestore reset", "Reset saved Firestore data?"],
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
    ["Firestore tutor history", "Loading this tutor thread from Firestore"],
    ["server-backed Tutor usage", "chat and daily usage are secured in Firestore"],
    ["daily Tutor quota visibility", "requests left today"],
    ["central account access", "Sign in or create an account"],
    ["email registration", "Create your Robot/Shift account"],
    ["password recovery", "If an account exists for that email"],
    ["verified tutor gate", "Verify your email to unlock Tutor"],
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
    assert.ok(
      !defaultHtml.includes(clutter),
      `the default course UI should omit repeated or motivational copy: ${clutter}`,
    );
  }

  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(pageSource, /id:\s*"progress"|<ProgressView|rail-progress|daily-quest|build-meter/);
  assert.equal(
    (pageSource.match(/\{ id: "(?:today|roadmap|roles|builds|notebook)", label:/g) ?? []).length,
    5,
    "the primary interface should expose exactly five quiet navigation destinations",
  );
});

test("ships the static Firebase account action handler and verified Tutor gate", async () => {
  const actionHtml = await readFile(
    new URL("../out/auth/action/index.html", import.meta.url),
    "utf8",
  );
  assert.match(actionHtml, /Checking this link/i);
  assert.match(actionHtml, /<meta name="robots" content="noindex, nofollow"\/>/i);

  const [authService, cloudDataSource, securitySource] = await Promise.all([
    readFile(new URL("../app/auth/auth-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/firestore-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/src/security.ts", import.meta.url), "utf8"),
  ]);
  assert.match(authService, /reauthenticateWithCredential/);
  assert.match(authService, /sendPasswordResetEmail/);
  assert.match(authService, /sendEmailVerification/);
  assert.match(cloudDataSource, /export async function askCloudTutor\(/);
  assert.match(cloudDataSource, />\(functions,\s*"askTutor",\s*\{/);
  assert.match(securitySource, /request\.auth\.token\.email_verified !== true/);
  assert.match(securitySource, /request\.app\.appId !== ROBOTSHIFT_WEB_APP_ID/);
});

test("protects account-action codes and requires Firestore consent for performance telemetry", async () => {
  const [
    actionSource,
    configSource,
    observabilitySource,
    privacyHtml,
    telemetrySource,
  ] = await Promise.all([
    readFile(
      new URL(
        "../app/auth/action/auth-action-handler.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../firebase.json", import.meta.url), "utf8"),
    readFile(
      new URL("../app/firebase-observability.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../out/privacy/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/telemetry-control.tsx", import.meta.url), "utf8"),
  ]);

  const parseIndex = actionSource.indexOf(
    "parseAuthAction(window.location.search)",
  );
  const scrubIndex = actionSource.indexOf("window.history.replaceState(");
  const providerIndex = actionSource.indexOf(
    "verifyPasswordReset(parsed.oobCode)",
  );
  assert.ok(parseIndex >= 0);
  assert.ok(scrubIndex > parseIndex);
  assert.ok(providerIndex > scrubIndex);

  const config = JSON.parse(configSource);
  const headers = config.hosting.headers;
  const actionHeaderIndexes = headers
    .map((entry, index) => (
      entry.source === "/auth/action"
      || entry.source === "/auth/action/**"
        ? index
        : -1
    ))
    .filter((index) => index >= 0);
  const staticIndex = headers.findIndex(
    (entry) => entry.source === "/_next/static/**",
  );
  assert.deepEqual(actionHeaderIndexes, [0, 1]);
  assert.ok(actionHeaderIndexes.every((index) => index < staticIndex));
  for (const index of actionHeaderIndexes) {
    const values = Object.fromEntries(
      headers[index].headers.map((header) => [header.key, header.value]),
    );
    assert.equal(values["Cache-Control"], "no-store,max-age=0");
    assert.equal(values["Referrer-Policy"], "no-referrer");
  }

  const globalHeaders = Object.fromEntries(
    headers
      .find((entry) => entry.source === "**")
      .headers
      .map((header) => [header.key, header.value]),
  );
  assert.equal(globalHeaders["Referrer-Policy"], "no-referrer");
  const reportOnly = globalHeaders["Content-Security-Policy-Report-Only"];
  assert.match(reportOnly, /default-src 'self'/);
  assert.match(reportOnly, /frame-src[^;]*youtube-nocookie\.com/);
  assert.match(reportOnly, /connect-src[^;]*googleapis\.com/);
  assert.match(reportOnly, /script-src[^;]*googletagmanager\.com/);

  const consentGuardIndex = observabilitySource.indexOf(
    "if (!granted)",
  );
  const performanceInitIndex = observabilitySource.indexOf(
    "initializePerformanceAfterConsent()",
    consentGuardIndex,
  );
  assert.ok(consentGuardIndex >= 0);
  assert.ok(performanceInitIndex > consentGuardIndex);
  assert.match(
    observabilitySource,
    /initializePerformance\(app,\s*\{\s*instrumentationEnabled: enabled,\s*dataCollectionEnabled: enabled/,
  );
  assert.match(
    observabilitySource,
    /performanceMonitoring && !pathname\.startsWith\("\/auth\/action"\)/,
  );
  assert.match(
    observabilitySource,
    /logBoundedEvent[\s\S]*window\.location\.pathname\.startsWith\("\/auth\/action"\)/,
  );
  assert.match(
    telemetrySource,
    /savePerformanceMonitoringPreference/,
  );
  assert.doesNotMatch(
    `${telemetrySource}\n${observabilitySource}`,
    /localStorage|document\.cookie/,
  );

  assert.match(privacyHtml, /What the application stores and measures/i);
  assert.match(privacyHtml, /Performance Monitoring is off by default/i);
  assert.match(privacyHtml, /stored only in the active Firestore dataset/i);
});

test("publishes crawlable metadata and all 180 lesson pages", async () => {
  const lessonEntries = await readdir(
    new URL("../out/lessons/", import.meta.url),
    { withFileTypes: true },
  );
  const lessonDirectories = lessonEntries.filter((entry) => entry.isDirectory());
  assert.equal(lessonDirectories.length, 180);

  const [robots, sitemap, firstLesson] = await Promise.all([
    readFile(new URL("../out/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../out/sitemap.xml", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../out/lessons/001-robot-anatomy-sense-think-act-links-and-actuators/index.html",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(robots, /Sitemap: https:\/\/robotshift\.web\.app\/sitemap\.xml/);
  assert.equal(
    (sitemap.match(/<loc>/g) ?? []).length,
    181,
    "the sitemap should include home plus every lesson",
  );
  assert.match(firstLesson, /<title>Day 1: Robot anatomy[^<]*\| Robot\/Shift<\/title>/i);
  assert.match(
    firstLesson,
    /<link rel="canonical" href="https:\/\/robotshift\.web\.app\/lessons\/001-robot-anatomy-sense-think-act-links-and-actuators\/"\/>/i,
  );
  assert.match(firstLesson, /"@type":"LearningResource"/);
  assert.match(firstLesson, /rel="next"/);
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
