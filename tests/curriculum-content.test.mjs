import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { curriculumDays } from "../app/curriculum.ts";
import {
  lessonForDay,
  topicDetails,
  weekLessonPacks,
} from "../app/lessons.ts";
import { mathRescueByWeek, validateMathRescues } from "../app/math-rescue.ts";
import { topicDetailOverrides } from "../app/topic-detail-overrides.ts";

test("every curriculum day has complete topic-specific teaching content", () => {
  const expectedIds = curriculumDays.map((day) => day.id);
  const detailIds = Object.keys(topicDetails)
    .map(Number)
    .sort((a, b) => a - b);

  assert.equal(curriculumDays.length, 180);
  assert.equal(weekLessonPacks.length, 26);
  assert.deepEqual(detailIds, expectedIds);

  for (const day of curriculumDays) {
    const lesson = lessonForDay(day);
    assert.equal(lesson.dayId, day.id);
    assert.equal(lesson.title, day.title);
    assert.ok(lesson.bigIdea.length > 40, `day ${day.id} needs a useful core explanation`);
    assert.ok(lesson.math.connection?.length > 35, `day ${day.id} needs exact-topic math`);
    assert.match(lesson.math.title, new RegExp(day.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(lesson.pareto.length >= 4, `day ${day.id} needs an 80/20 summary`);
    assert.ok(lesson.examples.length >= 3, `day ${day.id} needs physical examples`);
    assert.ok(lesson.practice.length >= 3, `day ${day.id} needs practical exercises`);
    assert.ok(lesson.quiz.length >= 3, `day ${day.id} needs diagnostic questions`);
    assert.ok(lesson.sources.length >= 1, `day ${day.id} needs sources`);
  }
});

test("the revised 180-day plan includes every mandatory practical robotics lane", () => {
  assert.deepEqual(
    curriculumDays.map((day) => day.id),
    Array.from({ length: 180 }, (_, index) => index + 1),
  );
  assert.equal(new Set(curriculumDays.map((day) => day.title)).size, 180);
  assert.equal(curriculumDays.at(-1)?.id, 180);
  assert.match(curriculumDays.at(-1)?.title ?? "", /readiness audit.*retrospective.*specialization.*30-day sprint/i);

  const completePlan = curriculumDays.map((day) => day.title).join("\n");
  const mandatorySignals = [
    /Linux.*udev.*network/i,
    /real-time scheduling.*priority inversion/i,
    /QoS.*DDS discovery/i,
    /executors.*callback groups.*deadlocks/i,
    /lifecycle nodes.*composition/i,
    /ros2_control.*hardware interfaces/i,
    /Gazebo Harmonic/i,
    /SLAM.*AMCL/i,
    /Nav2/i,
    /MoveIt/i,
    /loop closure/i,
    /force-torque.*impedance/i,
    /DAgger.*human-in-the-loop/i,
    /threat modeling.*SROS2/i,
    /safety case/i,
    /actuator sizing.*motors.*power/i,
    /edge deployment.*thermals/i,
    /differential-drive kinematics.*wheel odometry/i,
    /MCU firmware.*RTOS.*device manifests/i,
    /CAN.*UART.*I²C.*SPI/i,
    /Flutter\/Web teleoperation.*dead-man control.*latency/i,
    /ONNX.*TensorRT/i,
    /Jetson-class hardware/i,
    /SIL.*HIL/i,
    /fleet telemetry.*OTA/i,
    /target-company matrix/i,
    /warm outreach.*open-source/i,
  ];
  for (const signal of mandatorySignals) {
    assert.match(completePlan, signal);
  }
});

test("every revised topic has a deep exact-topic override", () => {
  const expectedOverrideIds = [
    25, 26, 27, 32, 33, 34, 37, 40, 41, 43, 44, 47, 50, 51, 52, 53, 54, 55,
    56, 66, 67, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 100, 110, 111,
    118, 127, 128, 129, 130, 131, 132, 133, 137, 138, 143, 144, 149, 150, 151,
    152, 153, 157, 164, 165, 168, 169, 170, 171, 172, 178, 179, 180,
  ];
  assert.deepEqual(Object.keys(topicDetailOverrides).map(Number), expectedOverrideIds);

  for (const dayId of expectedOverrideIds) {
    const detail = topicDetailOverrides[dayId];
    assert.ok(detail.core.length > 200, `day ${dayId} needs a deep core explanation`);
    assert.ok(detail.mathConnection.length > 100, `day ${dayId} needs worked quantitative context`);
    assert.ok(detail.example.explanation.length > 80, `day ${dayId} needs a physical example`);
    assert.ok(detail.example.tryIt.length > 80, `day ${dayId} needs a hands-on exercise`);
    assert.ok(detail.quiz.answer.length > 60, `day ${dayId} needs a diagnostic answer`);
  }
});

test("all 26 weeks include a beginner math rescue", () => {
  assert.deepEqual(validateMathRescues(), []);
  assert.deepEqual(
    Object.keys(mathRescueByWeek).map(Number),
    Array.from({ length: 26 }, (_, index) => index + 1),
  );
  for (const rescue of Object.values(mathRescueByWeek)) {
    assert.equal(rescue.workedSteps.length, 3);
    assert.ok(rescue.symbols.length >= 3);
    assert.match(rescue.quickCheck, /\?/);
    assert.ok(rescue.answer.length >= 4);
  }
});

test("adjacent topics resolve to different explanations, math, examples, and quizzes", () => {
  for (let index = 1; index < curriculumDays.length; index += 1) {
    const previous = lessonForDay(curriculumDays[index - 1]);
    const current = lessonForDay(curriculumDays[index]);

    assert.notEqual(current.bigIdea, previous.bigIdea);
    assert.notEqual(current.math.connection, previous.math.connection);
    assert.notEqual(current.examples[0].explanation, previous.examples[0].explanation);
    assert.notEqual(current.quiz[0].question, previous.quiz[0].question);
  }
});

test("the live tutor is grounded in the resolved displayed lesson", async () => {
  const routeSource = await readFile(
    new URL("../app/api/tutor/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(routeSource, /lessonForDay\(day\)/);
  assert.match(routeSource, /TRUSTED DISPLAYED LESSON/);
  assert.match(routeSource, /lesson\.math\.connection|lesson\.math/);
  assert.match(routeSource, /lesson\.examples/);
  assert.match(routeSource, /lesson\.sources/);
  assert.match(routeSource, /thinkingLevel:\s*"low"/);
  assert.match(routeSource, /finishReason === "MAX_TOKENS"/);
  assert.match(routeSource, /Return readable plain text only/);
});
