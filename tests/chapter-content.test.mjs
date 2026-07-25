import assert from "node:assert/strict";
import test from "node:test";
import { loadAllChapterContent } from "../app/chapter-content/index.ts";
import { curriculumDays } from "../app/curriculum.ts";
import { targetRoles } from "../app/career-market.ts";
import { allDayVisuals } from "../app/lesson-visuals.ts";
import { VALIDATED_VISUAL_DAY_IDS } from "../app/validated-visuals.ts";

const chapters = await loadAllChapterContent();
const roleTitles = new Set(targetRoles.map((role) => role.title));

function words(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalized(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.map(normalized)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function meaningfulTokens(value) {
  return new Set(
    normalized(value)
      .split(" ")
      .filter((token) => token.length >= 4),
  );
}

function jaccardSimilarity(left, right) {
  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection);
}

test("all 26 chapters cover the exact 180-day curriculum", () => {
  assert.equal(chapters.length, 26);
  assert.deepEqual(chapters.map((chapter) => chapter.week), Array.from(
    { length: 26 },
    (_, index) => index + 1,
  ));

  const authoredDays = chapters.flatMap((chapter) => chapter.days);
  assert.equal(authoredDays.length, 180);
  assert.deepEqual(
    authoredDays.map((day) => day.dayId),
    curriculumDays.map((day) => day.id),
  );

  for (const chapter of chapters) {
    const expectedDays = curriculumDays
      .filter((day) => day.week === chapter.week)
      .map((day) => day.id);
    assert.deepEqual(
      chapter.days.map((day) => day.dayId),
      expectedDays,
      `Week ${chapter.week} day IDs must match the curriculum`,
    );
  }
});

test("Week 8 previews navigation interfaces and Week 11 owns estimator theory", () => {
  const week8 = chapters[7];
  const week11 = chapters[10];
  const day56 = week8.days.find((day) => day.dayId === 56);
  const day77 = week11.days.find((day) => day.dayId === 77);

  assert.match(week8.purpose, /first bounded navigation flight|first flight/i);
  assert.match(week8.teachingBoundary ?? "", /defer.*week 11/i);
  assert.match(week8.teachingBoundary ?? "", /particle weighting.*covariance.*Bayes|particle weighting.*process and measurement models/i);
  assert.match(week11.purpose, /reopen the exact.*Week 8/i);
  assert.match(week11.teachingBoundary ?? "", /theory-and-diagnosis pass/i);

  assert.ok(day56, "Day 56 must remain in Week 8");
  assert.ok(day77, "Day 77 must remain in Week 11");
  const handoff = JSON.stringify(day56?.handsOn);
  for (const signal of [
    /source commit or container identity/i,
    /Gazebo world and random seed/i,
    /MCAP bag/i,
    /map image\/YAML and serialized pose graph/i,
    /TF snapshot/i,
    /scenario manifest/i,
    /raw result rows/i,
  ]) {
    assert.match(handoff, signal);
  }

  const revisit = JSON.stringify(day77?.handsOn);
  assert.match(revisit, /exact Week 8 source\/container identity/i);
  assert.match(revisit, /verify their recorded hashes/i);
  assert.match(revisit, /unchanged Week 8 artifact hashes/i);
});

test("every daily lesson meets the deep-teaching contract", () => {
  for (const chapter of chapters) {
    assert.ok(chapter.title.trim().length >= 10, `Week ${chapter.week} title`);
    assert.ok(chapter.purpose.trim().length >= 80, `Week ${chapter.week} purpose`);
    assert.ok(chapter.prerequisites.length >= 2, `Week ${chapter.week} prerequisites`);
    assert.ok(chapter.outcomes.length >= 3, `Week ${chapter.week} outcomes`);
    assert.ok(chapter.jobTargets.length >= 1, `Week ${chapter.week} job targets`);
    for (const role of chapter.jobTargets) {
      assert.ok(
        roleTitles.has(role),
        `Week ${chapter.week} uses unknown chapter job target: ${role}`,
      );
    }
    assert.ok(chapter.sources.length >= 2 && chapter.sources.length <= 5);
    assert.equal(new Set(chapter.sources.map((source) => source.url)).size, chapter.sources.length);
    for (const source of chapter.sources) {
      assert.match(source.url, /^https:\/\//);
      assert.ok(source.useFor.trim().length >= 20);
    }

    for (const day of chapter.days) {
      const prefix = `Week ${chapter.week}, Day ${day.dayId}`;
      assert.ok(words(day.mentalModel) >= 12, `${prefix} mental model`);
      assert.ok(words(day.mentalModel) <= 55, `${prefix} mental model is too dense`);
      assert.ok(
        day.explanation.length >= 3 && day.explanation.length <= 5,
        `${prefix} explanation count`,
      );
      for (const paragraph of day.explanation) {
        assert.ok(words(paragraph) >= 30, `${prefix} has a short explanation paragraph`);
        assert.ok(words(paragraph) <= 120, `${prefix} has an overlong explanation paragraph`);
      }
      assert.ok(day.keyTerms.length >= 3 && day.keyTerms.length <= 6);
      for (const term of day.keyTerms) {
        assert.ok(words(term.meaning) >= 4, `${prefix} has a shallow term definition`);
        assert.ok(words(term.meaning) <= 70, `${prefix} has a dense term definition`);
        assert.ok(words(term.physicalExample) >= 3, `${prefix} needs a concrete term example`);
      }
      assert.equal(day.physicalExamples.length, 2);
      assert.ok(
        day.workedExample.steps.length >= 4
          && day.workedExample.steps.length <= 7,
        `${prefix} worked steps`,
      );
      assert.ok(
        day.handsOn.steps.length >= 4 && day.handsOn.steps.length <= 7,
        `${prefix} hands-on steps`,
      );
      assert.ok(day.commonMistakes.length >= 2, `${prefix} corrected mistakes`);
      assert.equal(day.checkQuestions.length, 3, `${prefix} knowledge checks`);
      assert.ok(day.jobConnection.roles.length >= 1, `${prefix} job roles`);
      for (const role of day.jobConnection.roles) {
        assert.ok(roleTitles.has(role), `${prefix} uses unknown role: ${role}`);
      }
      assert.ok(day.jobConnection.workExample.trim().length >= 60);
      assert.ok(day.jobConnection.interviewPrompt.trim().length >= 40);
      const interviewCorpus = meaningfulTokens([
        chapter.title,
        chapter.purpose,
        ...chapter.outcomes,
        day.mentalModel,
        ...day.explanation,
        ...day.keyTerms.flatMap((term) => [
          term.term,
          term.meaning,
          term.physicalExample,
        ]),
        ...day.physicalExamples.flatMap((example) => [
          example.title,
          example.scenario,
          example.lookFor,
        ]),
        day.workedExample.title,
        day.workedExample.setup,
        ...day.workedExample.steps,
        day.workedExample.result,
        day.workedExample.takeaway,
        day.handsOn.setup,
        ...day.handsOn.steps,
        day.handsOn.observe,
        day.handsOn.doneWhen,
        day.jobConnection.workExample,
        ...day.commonMistakes.flatMap((mistake) => [
          mistake.mistake,
          mistake.correction,
        ]),
      ].join(" "));
      const scenarioOverlap = [...meaningfulTokens(
        day.jobConnection.interviewPrompt,
      )].filter((token) => interviewCorpus.has(token));
      assert.ok(
        scenarioOverlap.length >= 3,
        `${prefix} interview scenario must be grounded in the current lesson`,
      );
      for (const check of day.checkQuestions) {
        assert.ok(words(check.question) >= 4, `${prefix} has a shallow interview question`);
        assert.ok(words(check.answer) >= 8, `${prefix} has a shallow model answer`);
        const checkOverlap = [...meaningfulTokens(
          `${check.question} ${check.answer}`,
        )].filter((token) => interviewCorpus.has(token));
        assert.ok(
          checkOverlap.length >= 3,
          `${prefix} interview follow-up must be grounded in the current lesson`,
        );
      }
      assert.ok(day.visual.reason.trim().length >= 20);
    }
  }
});

test("course is content-heavy without exact teaching-template duplication", () => {
  const daily = chapters.flatMap((chapter) => chapter.days);
  const explanationParagraphs = daily.flatMap((day) => day.explanation);
  const mentalModels = daily.map((day) => day.mentalModel);
  const physicalScenarios = daily.flatMap((day) => (
    day.physicalExamples.map((example) => example.scenario)
  ));
  const corrections = daily.flatMap((day) => (
    day.commonMistakes.map((mistake) => mistake.correction)
  ));

  assert.deepEqual(duplicateValues(explanationParagraphs), []);
  assert.deepEqual(duplicateValues(mentalModels), []);
  assert.deepEqual(duplicateValues(physicalScenarios), []);
  assert.deepEqual(duplicateValues(corrections), []);

  const explanationTokenSets = explanationParagraphs.map(meaningfulTokens);
  for (let left = 0; left < explanationTokenSets.length; left += 1) {
    for (let right = left + 1; right < explanationTokenSets.length; right += 1) {
      assert.ok(
        jaccardSimilarity(
          explanationTokenSets[left],
          explanationTokenSets[right],
        ) < 0.62,
        `Explanation paragraphs ${left + 1} and ${right + 1} are near-duplicates`,
      );
    }
  }

  const totalWords = words(JSON.stringify(chapters));
  assert.ok(
    totalWords >= 100_000,
    `Expected at least 100,000 authored words, found ${totalWords}`,
  );
});

test("the visible lesson opening does not repeat the same summary twice", () => {
  for (const chapter of chapters) {
    for (const deepDive of chapter.days) {
      const day = curriculumDays[deepDive.dayId - 1];
      const openingCopy = [
        ["day focus", day.focus],
        ["mental model", deepDive.mentalModel],
        ...deepDive.explanation.map((paragraph, index) => [
          `explanation ${index + 1}`,
          paragraph,
        ]),
      ];

      if (chapter.days[0]?.dayId === deepDive.dayId) {
        openingCopy.push(["chapter purpose", chapter.purpose]);
      }

      for (let left = 0; left < openingCopy.length; left += 1) {
        for (let right = left + 1; right < openingCopy.length; right += 1) {
          const [leftLabel, leftCopy] = openingCopy[left];
          const [rightLabel, rightCopy] = openingCopy[right];
          const prefix = `Day ${deepDive.dayId}: ${leftLabel} and ${rightLabel}`;

          assert.notEqual(
            normalized(leftCopy),
            normalized(rightCopy),
            `${prefix} must not be identical`,
          );
          assert.ok(
            jaccardSimilarity(
              meaningfulTokens(leftCopy),
              meaningfulTokens(rightCopy),
            ) < 0.58,
            `${prefix} must not restate the same introduction`,
          );
        }
      }
    }
  }
});

test("visuals are selective and every target role is taught", () => {
  for (const chapter of chapters) {
    const count = chapter.days.filter((day) => day.visual.show).length;
    assert.ok(count <= 4, `Week ${chapter.week} selected ${count} visuals`);
    assert.ok(count < chapter.days.length, `Week ${chapter.week} shows a visual every day`);
  }

  const daily = chapters.flatMap((chapter) => chapter.days);
  const renderedVisualDays = VALIDATED_VISUAL_DAY_IDS.filter((dayId) => (
    daily.find((day) => day.dayId === dayId)?.visual.show
  ));
  assert.ok(
    renderedVisualDays.length >= 16 && renderedVisualDays.length <= 20,
    `Expected 16–20 validated visuals, found ${renderedVisualDays.length}`,
  );

  const renderedTakeaways = renderedVisualDays.map(
    (dayId) => allDayVisuals[dayId - 1].takeaway,
  );
  assert.equal(
    new Set(renderedTakeaways.map(normalized)).size,
    renderedTakeaways.length,
    "Rendered visuals must not repeat the same generic teaching grammar",
  );

  const taughtRoles = new Set(chapters.flatMap((chapter) => (
    chapter.days.flatMap((day) => day.jobConnection.roles)
  )));
  assert.deepEqual(
    [...taughtRoles].sort(),
    [...roleTitles].sort(),
    "Every target role must appear in daily job connections",
  );
});

test("the authored lessons teach every competency lane needed by the target roles", () => {
  const corpus = JSON.stringify(chapters);
  const competencyLanes = {
    "robot and math foundations": [
      /links?.*joints?|joints?.*links?/i,
      /degrees? of freedom/i,
      /configuration space|C-space/i,
      /vectors?.*matrices|matrices.*vectors?/i,
      /coordinate frames?/i,
      /SO\(3\)|rotation matrix/i,
      /SE\(3\)|homogeneous transform/i,
      /forward kinematics/i,
      /Jacobian/i,
      /inverse kinematics/i,
    ],
    "mechanics and control": [
      /force.*torque|torque.*force/i,
      /mass.*inertia|inertia.*mass/i,
      /closed-loop/i,
      /PID/i,
      /sampling.*latency|latency.*sampling/i,
      /saturation.*anti-windup|anti-windup.*saturation/i,
    ],
    "production C++ and Linux": [
      /RAII/i,
      /smart pointer/i,
      /CMake/i,
      /udev/i,
      /real-time scheduling|priority inversion/i,
      /sanitizer/i,
      /deterministic replay/i,
    ],
    "ROS 2 integration": [
      /ROS 2/i,
      /publishers?.*subscribers?|subscribers?.*publishers?/i,
      /services?.*actions?|actions?.*services?/i,
      /QoS/i,
      /DDS/i,
      /executors?.*callback groups?|callback groups?.*executors?/i,
      /lifecycle nodes?|lifecycle state/i,
      /URDF/i,
      /tf2/i,
      /ros2_control/i,
    ],
    "simulation, navigation, and perception": [
      /Gazebo Harmonic/i,
      /rosbag2|MCAP/i,
      /fault injection/i,
      /Nav2/i,
      /SLAM/i,
      /AMCL/i,
      /costmaps?/i,
      /behavior trees?/i,
      /OpenCV/i,
      /camera intrinsics|camera calibration/i,
      /fiducial/i,
      /point clouds?/i,
      /ICP/i,
    ],
    "estimation and manipulation": [
      /covariance/i,
      /Bayes/i,
      /Kalman|EKF/i,
      /loop closure/i,
      /MoveIt/i,
      /OMPL|RRT/i,
      /trajectory.*time parameterization|time parameterization.*trajectory/i,
      /impedance|admittance/i,
    ],
    "robot learning and data": [
      /PyTorch/i,
      /tensors?/i,
      /train.*validation.*test|training.*validation.*test/i,
      /data leakage/i,
      /teleoperation/i,
      /demonstrations?/i,
      /behavior cloning/i,
      /covariate shift/i,
      /DAgger/i,
      /action chunking|ACT architecture/i,
      /rollout/i,
    ],
    "fleet and validation engineering": [
      /robot.edge.cloud|edge.cloud.*robot/i,
      /WebSocket/i,
      /PostgreSQL/i,
      /Redis/i,
      /Kafka/i,
      /idempotenc/i,
      /OTA/i,
      /SLO/i,
      /FMEA/i,
      /SIL/i,
      /HIL/i,
      /VDA 5050/i,
      /Open-RMF/i,
      /ISO 3691-4/i,
      /ISO 13849/i,
      /FAT.*SAT|SAT.*FAT/i,
    ],
    "physical AI and agent safety": [
      /vision-language-action|VLA/i,
      /cross-embodiment/i,
      /diffusion.*flow|flow.*diffusion/i,
      /language grounding/i,
      /LeRobot/i,
      /GR00T/i,
      /Gemini Robotics/i,
      /OpenVLA/i,
      /SmolVLA/i,
      /LoRA/i,
      /typed tools?|skill schemas?/i,
      /re-observe/i,
      /replan/i,
      /SROS ?2/i,
      /prompt injection/i,
      /safety case/i,
      /adversarial/i,
    ],
    "hardware, deployment, and hiring proof": [
      /sizes? actuator|actuator.*sizing|motor sizing/i,
      /encoders?/i,
      /RTOS/i,
      /CAN/i,
      /EtherCAT/i,
      /hardware plugin/i,
      /watchdog/i,
      /safe shutdown/i,
      /dead-man/i,
      /ONNX/i,
      /TensorRT/i,
      /Jetson/i,
      /Docker/i,
      /core dumps?|incident replay/i,
      /portfolio/i,
      /résumé|resume/i,
      /interview/i,
    ],
  };

  for (const [lane, signals] of Object.entries(competencyLanes)) {
    for (const signal of signals) {
      assert.ok(signal.test(corpus), `${lane} is missing ${signal}`);
    }
  }
});
