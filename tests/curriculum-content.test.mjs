import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { curriculumDays } from "../app/curriculum.ts";
import {
  lessonForDay,
  topicDetails,
  weekLessonPacks,
} from "../app/lessons.ts";

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
