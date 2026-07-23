import assert from "node:assert/strict";
import test from "node:test";

import {
  MISSION_TASK_XP,
  MISSION_XP_PER_DAY,
  deriveMissionProgress,
  getMissionBadges,
  getMissionRank,
  getNextMissionAction,
  getProofChain,
  missionTaskKey,
} from "../app/mission-progress.ts";

function closeDay(completed, dayId) {
  for (const part of ["learn", "build", "prove"]) {
    completed[missionTaskKey(dayId, part)] = true;
  }
}

test("daily XP rewards proof without counting false or out-of-range entries", () => {
  const completed = {
    "1:learn": true,
    "1:build": true,
    "1:prove": false,
    "2:prove": true,
    "99:learn": true,
  };

  const progress = deriveMissionProgress({ completed, totalDays: 2 });

  assert.deepEqual(MISSION_TASK_XP, { learn: 20, build: 30, prove: 50 });
  assert.equal(MISSION_XP_PER_DAY, 100);
  assert.equal(progress.totalXp, 100);
  assert.equal(progress.maxXp, 200);
  assert.deepEqual(
    progress.daily.map((day) => [day.xp, day.complete, day.nextPart]),
    [
      [50, false, "prove"],
      [50, false, "learn"],
    ],
  );
});

test("XP is recomputed from state, decreases on reopen, and cannot be farmed", () => {
  const completed = {};
  closeDay(completed, 1);
  assert.equal(
    deriveMissionProgress({ completed, totalDays: 1 }).totalXp,
    100,
  );

  completed["1:prove"] = false;
  assert.equal(
    deriveMissionProgress({ completed, totalDays: 1 }).totalXp,
    50,
  );

  completed["1:prove"] = true;
  assert.equal(
    deriveMissionProgress({ completed, totalDays: 1 }).totalXp,
    100,
  );
});

test("proof chain closes only contiguous complete days beginning at Day 1", () => {
  const completed = {};
  closeDay(completed, 1);
  closeDay(completed, 3);

  assert.equal(getProofChain(completed, 3), 1);

  closeDay(completed, 2);
  assert.equal(getProofChain(completed, 3), 3);

  completed["1:learn"] = false;
  assert.equal(getProofChain(completed, 3), 0);
});

test("global next action uses earliest incomplete day and learn-build-prove order", () => {
  const completed = {};

  assert.deepEqual(getNextMissionAction(completed, 3), {
    status: "active",
    dayId: 1,
    part: "learn",
    label: "Understand",
    xp: 20,
  });

  completed["1:learn"] = true;
  assert.equal(getNextMissionAction(completed, 3).part, "build");
  completed["1:build"] = true;
  assert.equal(getNextMissionAction(completed, 3).part, "prove");
  completed["1:prove"] = true;
  completed["2:learn"] = true;

  assert.deepEqual(getNextMissionAction(completed, 3), {
    status: "active",
    dayId: 2,
    part: "build",
    label: "Build",
    xp: 30,
  });
});

test("all-complete progress returns a terminal state and never Day 181", () => {
  const completed = {};
  for (let dayId = 1; dayId <= 180; dayId += 1) closeDay(completed, dayId);

  const progress = deriveMissionProgress({ completed });

  assert.equal(progress.totalXp, 18_000);
  assert.equal(progress.proofChain, 180);
  assert.deepEqual(progress.nextAction, {
    status: "course-complete",
    dayId: 180,
    part: null,
    label: "Course complete",
    xp: 0,
  });
  assert.equal(progress.rank.id, "mission-complete");
  assert.equal(progress.rank.percentToNextRank, 100);
});

test("first-proof badge requires same-day trimmed evidence", () => {
  const completed = { "1:prove": true, "2:prove": true };

  let badges = getMissionBadges({
    completed,
    evidence: { "1": "  \n", "2": "demo repository and failure report" },
    totalDays: 2,
  });
  const firstProof = badges.find((badge) => badge.id === "first-proof");
  assert.equal(firstProof?.earned, true);
  assert.equal(firstProof?.dayId, 2);

  badges = getMissionBadges({
    completed,
    evidence: { "1": " ", "2": "\t" },
    totalDays: 2,
  });
  assert.deepEqual(
    badges.find((badge) => badge.id === "first-proof"),
    {
      id: "first-proof",
      label: "First proof",
      earned: false,
      dayId: null,
    },
  );
});

test("seven-day badge follows the proof chain rather than scattered completion", () => {
  const completed = {};
  for (let dayId = 1; dayId <= 6; dayId += 1) closeDay(completed, dayId);
  closeDay(completed, 8);

  let badges = getMissionBadges({ completed, totalDays: 8 });
  assert.equal(
    badges.find((badge) => badge.id === "seven-day-chain")?.earned,
    false,
  );

  closeDay(completed, 7);
  badges = getMissionBadges({ completed, totalDays: 8 });
  assert.equal(
    badges.find((badge) => badge.id === "seven-day-chain")?.earned,
    true,
  );
});

test("project gate badges require a positive exact checklist with every item true", () => {
  const projectGates = [
    { id: "empty", label: "Empty gate", expectedCount: 0, checks: [] },
    {
      id: "short",
      label: "Short gate",
      expectedCount: 3,
      checks: [true, true],
    },
    {
      id: "open",
      label: "Open gate",
      expectedCount: 3,
      checks: [true, false, true],
    },
    {
      id: "closed",
      label: "Closed gate",
      expectedCount: 3,
      checks: [true, true, true],
    },
  ];

  const badges = getMissionBadges({
    completed: {},
    projectGates,
    totalDays: 1,
  }).filter((badge) => badge.id.startsWith("project-gate:"));

  assert.deepEqual(
    badges.map((badge) => [badge.id, badge.earned]),
    [
      ["project-gate:empty", false],
      ["project-gate:short", false],
      ["project-gate:open", false],
      ["project-gate:closed", true],
    ],
  );
});

test("rank thresholds are deterministic and bounded", () => {
  assert.equal(getMissionRank(-20).id, "explorer");
  assert.equal(getMissionRank(2_799).id, "explorer");
  assert.equal(getMissionRank(2_800).id, "foundations-builder");
  assert.equal(getMissionRank(5_600).id, "ros-integrator");
  assert.equal(getMissionRank(17_500).id, "deployment-engineer");
  assert.equal(getMissionRank(999_999).id, "mission-complete");
});

test("invalid course sizes are rejected rather than producing misleading state", () => {
  assert.throws(() => getNextMissionAction({}, 0), RangeError);
  assert.throws(() => getProofChain({}, 1.5), RangeError);
});
