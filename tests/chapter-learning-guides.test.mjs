import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ChapterStarterPanel } from "../app/chapter-learning-guide.tsx";
import { loadAllChapterLearningGuides } from "../app/chapter-guides/index.ts";
import { curriculumDays } from "../app/curriculum.ts";

const guides = await loadAllChapterLearningGuides();

function words(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalized(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function meaningfulTokens(value) {
  return new Set(
    normalized(value)
      .split(" ")
      .filter((token) => token.length >= 5),
  );
}

function jaccardSimilarity(left, right) {
  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection);
}

function executeStarter(code, fileName) {
  const output = [];
  try {
    vm.runInNewContext(code, {
      console: {
        log: (...values) => output.push(values.map(String).join(" ")),
      },
    }, {
      timeout: 1_000,
      filename: fileName,
    });
    return { error: null, output: output.join("\n") };
  } catch (error) {
    return { error, output: output.join("\n") };
  }
}

test("26 chapter guides cover the exact 180-day sequence", () => {
  assert.equal(guides.length, 26);
  assert.deepEqual(
    guides.map((guide) => guide.week),
    Array.from({ length: 26 }, (_, index) => index + 1),
  );

  const threads = guides.flatMap((guide) => guide.dayThreads);
  assert.equal(threads.length, 180);
  assert.deepEqual(
    threads.map((thread) => thread.dayId),
    curriculumDays.map((day) => day.id),
  );

  for (const guide of guides) {
    assert.deepEqual(
      guide.dayThreads.map((thread) => thread.dayId),
      curriculumDays
        .filter((day) => day.week === guide.week)
        .map((day) => day.id),
      `Week ${guide.week} must map every current day without remapping progress`,
    );
  }
});

test("each chapter reads as one concrete engineering story", () => {
  assert.equal(
    new Set(guides.map((guide) => normalized(guide.mission.name))).size,
    guides.length,
    "chapter mission names must be distinct",
  );

  const allBridges = [];
  for (const guide of guides) {
    for (const paragraph of guide.mission.opening) {
      assert.ok(words(paragraph) >= 70, `Week ${guide.week} opening is too short`);
      assert.ok(words(paragraph) <= 130, `Week ${guide.week} opening is too long`);
    }
    assert.ok(words(guide.mission.finishLine) >= 12, `Week ${guide.week} finish line`);

    for (const [field, value] of Object.entries(guide.learningContract)) {
      assert.ok(words(value) >= 10, `Week ${guide.week} ${field} is too shallow`);
      assert.ok(words(value) <= 90, `Week ${guide.week} ${field} is too dense`);
    }

    for (const thread of guide.dayThreads) {
      assert.ok(words(thread.bridge) >= 45, `Day ${thread.dayId} bridge is too short`);
      assert.ok(words(thread.bridge) <= 100, `Day ${thread.dayId} bridge is too long`);
      assert.ok(words(thread.whyNow) >= 6, `Day ${thread.dayId} whyNow`);
      assert.ok(words(thread.ignoreForNow) >= 6, `Day ${thread.dayId} ignoreForNow`);
      assert.ok(words(thread.unlocks) >= 6, `Day ${thread.dayId} unlocks`);
      allBridges.push(thread.bridge);
    }
  }

  assert.equal(
    new Set(allBridges.map(normalized)).size,
    allBridges.length,
    "daily story bridges must be original",
  );

  const tokenSets = allBridges.map(meaningfulTokens);
  for (let left = 0; left < tokenSets.length; left += 1) {
    for (let right = left + 1; right < tokenSets.length; right += 1) {
      assert.ok(
        jaccardSimilarity(tokenSets[left], tokenSets[right]) < 0.68,
        `Day bridges ${left + 1} and ${right + 1} are near-duplicates`,
      );
    }
  }
});

test("every chapter publishes an honest environment contract", () => {
  for (const guide of guides) {
    const { environment } = guide;
    assert.ok(words(environment.baseline) >= 7, `Week ${guide.week} baseline`);
    assert.ok(words(environment.compatibility) >= 8, `Week ${guide.week} compatibility`);
    assert.equal(environment.contractReviewedOn, "2026-07-25");
    assert.match(environment.runtimeEvidence, /starter is executed/i);
    assert.match(environment.runtimeEvidence, /learner-created/i);
    assert.ok(words(environment.smokeCheck) >= 9, `Week ${guide.week} smoke check`);
    assert.ok(["low", "medium", "high"].includes(environment.driftRisk));
  }
});

test("every chapter ships a deterministic zero-dependency starter", () => {
  for (const guide of guides) {
    const { starter } = guide;
    const lineCount = starter.code.trim().split("\n").length;
    assert.equal(starter.language, "javascript");
    assert.match(starter.fileName, /^week-\d{2}-[a-z0-9-]+\.mjs$/);
    assert.equal(starter.run, `node ${starter.fileName}`);
    assert.ok(lineCount >= 12, `Week ${guide.week} starter needs at least 12 lines`);
    assert.ok(lineCount <= 35, `Week ${guide.week} starter exceeds 35 lines`);
    assert.doesNotMatch(starter.code, /\b(?:TODO|FIXME)\b|…/);
    assert.doesNotMatch(
      starter.code,
      /\b(?:fetch|XMLHttpRequest|child_process|node:fs|node:http|node:net|eval)\b/,
      `Week ${guide.week} starter must stay offline and dependency-free`,
    );
    assert.doesNotMatch(
      starter.code,
      /\b(?:Date\.now|Math\.random|setTimeout|setInterval|process\.)\b|import\s*\(/,
      `Week ${guide.week} starter must stay deterministic`,
    );
    assert.ok(words(starter.plantedFailure) >= 8, `Week ${guide.week} planted failure`);

    const output = [];
    vm.runInNewContext(starter.code, {
      console: {
        log: (...values) => output.push(values.map(String).join(" ")),
      },
    }, {
      timeout: 1_000,
      filename: starter.fileName,
    });
    assert.equal(
      output.join("\n"),
      starter.expectedOutput,
      `Week ${guide.week} starter must exactly match its declared output`,
    );
  }
});

test("downloaded starter files execute with their published node commands", async () => {
  const starterDirectory = await mkdtemp(join(tmpdir(), "robot-shift-starters-"));
  try {
    for (const guide of guides) {
      const { starter } = guide;
      await writeFile(join(starterDirectory, starter.fileName), starter.code, "utf8");
      const result = spawnSync(
        process.execPath,
        [starter.fileName],
        { cwd: starterDirectory, encoding: "utf8", timeout: 2_000 },
      );
      assert.equal(result.status, 0, `Week ${guide.week}: ${result.stderr}`);
      assert.equal(result.stdout.trim(), starter.expectedOutput, `Week ${guide.week}`);
    }
  } finally {
    await rm(starterDirectory, { recursive: true, force: true });
  }
});

test("all 26 starters reject or visibly contain one adversarial mutation", () => {
  const mutations = [
    ["const move = [3, 4];", "const move = [Number.NaN, 4];", "throw"],
    ["const links = [1, 1];", "const links = [Number.NaN, 1];", "throw"],
    ["const dt = 0.1;", "const dt = 0;", "throw"],
    ["{ stampMs: 110, value: 0.4, workMs: 4 }", "{ stampMs: 130, value: 0.4, workMs: 4 }", "throw"],
    ["{ sequence: 23, sourceMs: 450 }", "{ sequence: 23, sourceMs: 750 }", "throw"],
    ["const mapToBase = [2.0, 0.5];", "const mapToBase = [20.0, 0.5];", "throw"],
    ["const sourceStamps = [0, 0.05, 0.1, 0.1];", "const sourceStamps = [0, 0.05, Number.NaN, 0.15];", /sensor=DEGRADED/],
    ['new Set(["1,1", "1,2", "2,2", "3,2"])', 'new Set(["1,1", "1,2", "2,2", "3,2", "4,4"])', "throw"],
    ["{ truth: false, score: 0.85, latencyMs: 70 }", '{ truth: "false", score: 0.85, latencyMs: 70 }', "throw"],
    ['{ pixel: "320,240", depthM: 1.0, valid: true }', '{ pixel: "320,240", depthM: 1.0, valid: "true" }', "throw"],
    ["{ value: 4.0, variance: 0.5, ageMs: 40 }", "{ value: 4.0, variance: 0.5, ageMs: -10 }", "throw"],
    ['{ id: "plan-c", collisionFree: true, scene: 7, durationS: 4.2 }', '{ id: "plan-c", collisionFree: "true", scene: 7, durationS: 4.2 }', "throw"],
    ['{ id: "a1", schema, group: "scene-a", split: "train" }', '{ id: "a1", schema, group: "", split: "train" }', "throw"],
    ['{ id: "p1", cameraId: "f1", actionCameraId: "f1", cameraMs: 1000, actionMs: 1005 }', '{ id: "p1", cameraId: "f1", actionCameraId: "other", cameraMs: 1000, actionMs: 1005 }', "throw"],
    ['{ id: "c1", a: true, aAgeMs: 50, b: true, bAgeMs: 40 }', '{ id: "c1", a: true, aAgeMs: -1, b: true, bAgeMs: 40 }', "throw"],
    ['{ id: "e2", mission: "M-204", sequence: 2, state: "assigned" }', '{ id: "e2", mission: "M-999", sequence: 2, state: "assigned" }', "throw"],
    ['{ id: "R17-unit", status: "pass", evidence: true }', '{ id: "R17-unit", status: "unknown", evidence: true }', "throw"],
    ['{ id: "p1", entity: "mug-2", ageMs: 40, deltaM: 0.04 }', '{ id: "p1", entity: "mug-3", ageMs: 40, deltaM: 0.04 }', "throw"],
    ['const baseline = { cameras: ["front", "wrist"], action: { x: 0.02, y: -0.01, gripper: 1 } };', 'const baseline = { cameras: ["front", "wrist"], action: { x: 0.02, y: -0.01 } };', /baseline contract: REJECT action_schema/],
    ['const freshEntity = { id: "card-blue-7", frame: "table", observedAtMs: 9_900 };', 'const freshEntity = { id: "card-blue-7", frame: "table", observedAtMs: 10_100 };', /fresh observation: REJECT future_entity/],
    ["const nominalDecision = admit(nominal, plannerAuthority);", 'const nominalDecision = admit(nominal, Symbol("planner"));', /bounded proposal: REJECT untrusted_authority/],
    ["const paperCandidate = { supplyVoltage: 24, continuousCurrent: 3, peakCurrent: 7, documentedLimit: 10 };", "const paperCandidate = { supplyVoltage: 24, continuousCurrent: 3, peakCurrent: -1, documentedLimit: 10 };", /zero-power baseline: REJECT invalid_peak_current/],
    ['{ id: "e3", group: "scene-c", split: "heldout" }', '{ id: "e1", group: "scene-c", split: "heldout" }', /clean split: REJECT duplicate_id/],
    ["const candidate = { success: 0.85, p95Ms: 92, prohibited: 0 };", "const candidate = { success: 0.85, p95Ms: -1, prohibited: 0 };", /candidate gates: REJECT invalid_p95_ms/],
    ["testsPassed: true,\n  rollbackProved: true,", 'testsPassed: "true",\n  rollbackProved: true,', /SIL station: BLOCK schema/],
    ['{ claimId: "ros2-validation", text: "ROS 2 simulation validation", proof: "ros2-simulation-trials" }', '{ claimId: "ros2-validation", text: "ROS 2 simulation validation", proof: "production-api-incident" }', /verified claims: 1/],
  ];

  assert.equal(mutations.length, guides.length);
  for (const [index, [search, replacement, expectation]] of mutations.entries()) {
    const guide = guides[index];
    const mutatedCode = guide.starter.code.replace(search, replacement);
    assert.notEqual(
      mutatedCode,
      guide.starter.code,
      `Week ${guide.week} mutation fixture must match starter source`,
    );

    const result = executeStarter(mutatedCode, guide.starter.fileName);
    if (expectation === "throw") {
      assert.ok(result.error, `Week ${guide.week} mutation must fail closed`);
    } else {
      assert.equal(result.error, null, `Week ${guide.week}: ${result.error}`);
      assert.match(result.output, expectation, `Week ${guide.week} mutation`);
    }
  }
});

test("the final-day starter is a labelled downloadable JavaScript file", () => {
  const guide = guides.at(-1);
  assert.ok(guide);
  const html = renderToStaticMarkup(
    createElement(ChapterStarterPanel, { guide, dayId: 180 }),
  );

  assert.match(html, /download="week-26-claim-ledger\.mjs"/);
  assert.match(html, /href="data:text\/javascript;charset=utf-8,/);
  assert.match(html, /Download the file into your terminal/);
  assert.match(
    html,
    /<pre tabindex="0" aria-labelledby="chapter-starter-title-180 chapter-starter-file-180">/,
  );
});

test("the Nav2 first flight preserves IDs and defers estimator theory", () => {
  const week8 = guides[7];
  const week11 = guides[10];
  const week8Corpus = JSON.stringify(week8);
  const week11Corpus = JSON.stringify(week11);

  assert.match(week8Corpus, /first flight|integration-first/i);
  assert.match(week8Corpus, /defer|week 11/i);
  assert.match(week8Corpus, /A\*|A-star/i);
  assert.match(week11Corpus, /week 8/i);
  assert.match(week11Corpus, /frozen|unchanged/i);
  assert.match(week11Corpus, /covariance|Bayes/i);
});

test("weekly effort keeps the same 12-hour budget and funds the ship day", () => {
  for (let week = 1; week <= 25; week += 1) {
    const days = curriculumDays.filter((day) => day.week === week);
    assert.equal(days.reduce((sum, day) => sum + day.minutes, 0), 720);
    assert.equal(days.at(-1)?.minutes, 120);
  }
  assert.equal(curriculumDays.at(-1)?.id, 180);
});
