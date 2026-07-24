import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { curriculumDays } from "../app/curriculum.ts";
import { LessonVisual } from "../app/lesson-visual.tsx";
import {
  allDayVisuals,
  validateAllDayVisuals,
  visualKinds,
} from "../app/lesson-visuals.ts";

const modes = ["concept", "math", "failure"];

test("all 180 course days have a validated exact-topic visual specification", () => {
  const result = validateAllDayVisuals();
  assert.deepEqual(result, { valid: true, errors: [] });
  assert.equal(allDayVisuals.length, 180);
  assert.deepEqual(
    allDayVisuals.map((visual) => visual.dayId),
    Array.from({ length: 180 }, (_, index) => index + 1),
  );
  assert.equal(new Set(allDayVisuals.map((visual) => visual.topicKey)).size, 180);
  assert.deepEqual(
    [...new Set(allDayVisuals.map((visual) => visual.kind))].sort(),
    [...visualKinds].sort(),
  );

  for (const [index, visual] of allDayVisuals.entries()) {
    assert.equal(visual.topic, curriculumDays[index].title);
    assert.ok(visual.title.includes(curriculumDays[index].title));
    assert.ok(visual.math.latex);
    assert.ok(visual.softwareBridge.analogy.length > 30);
    assert.ok(visual.softwareBridge.dangerousDifference.length > 30);
    assert.deepEqual(Object.keys(visual.states), ["nominal", "boundary", "failure"]);
  }
});

test("every concept, math, and failure visual renders as static accessible SVG", () => {
  for (const visual of allDayVisuals) {
    for (const mode of modes) {
      const html = renderToStaticMarkup(
        createElement(LessonVisual, { spec: visual, mode }),
      );
      assert.match(html, /<figure\b/);
      assert.match(html, /<svg\b[^>]*\bviewBox="0 0 720 420"/);
      assert.match(html, /<svg\b[^>]*\brole="img"/);
      assert.match(html, /<title id=/);
      assert.match(html, /<desc id=/);
      assert.match(html, /<figcaption>/);
      assert.match(html, new RegExp(`Day ${visual.dayId}`));
      assert.ok(html.includes(visual.topic));
      assert.doesNotMatch(html, /<script\b|<foreignObject\b/i);
      assert.doesNotMatch(html, /<button\b|<details\b|role="tab(?:list|panel)?"/);
      assert.match(html, /role="group"/);
      if (mode === "math") assert.match(html, /Math example/);
      if (mode === "failure") assert.match(html, /Failure check/);

      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(ids.length, new Set(ids).size, `day ${visual.dayId} ${mode} has duplicate SVG/DOM IDs`);
      const references = [...html.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1]);
      for (const reference of references) {
        assert.ok(ids.includes(reference), `day ${visual.dayId} ${mode} has unresolved #${reference}`);
      }
    }
  }
});

test("the beginner anchor diagrams agree with their verified numeric fixtures", () => {
  const day1 = allDayVisuals[0];
  assert.equal(day1.kind, "system");
  assert.equal(day1.fixture.parameters.totalParts, 5);
  const day1Math = renderToStaticMarkup(createElement(LessonVisual, { spec: day1, mode: "math" }));
  assert.match(day1Math, /SENSE/);
  assert.match(day1Math, /THINK/);
  assert.match(day1Math, /ACT/);
  assert.match(day1Math, /2 sensing \+ 1 thinking \+ 2 acting = 5 parts/);

  const day2 = allDayVisuals[1];
  assert.equal(day2.fixture.parameters.degreesOfFreedom, 3);
  const day2Concept = renderToStaticMarkup(createElement(LessonVisual, { spec: day2, mode: "concept" }));
  assert.match(day2Concept, /ROTATE/);
  assert.match(day2Concept, /SLIDE/);
  assert.match(day2Concept, /FIXED/);
  assert.match(day2Concept, /3 DOF/);

  const day3 = allDayVisuals[2];
  assert.equal(day3.fixture.parameters.configurationCoordinates, 3);
  const day3Math = renderToStaticMarkup(createElement(LessonVisual, { spec: day3, mode: "math" }));
  assert.match(day3Math, /q = \[30°, −20°, 8 cm\]/);
  assert.doesNotMatch(day3.math.latex, /mathsf\{T\}|transpose/i);

  const day5 = allDayVisuals[4];
  assert.equal(day5.fixture.parameters.dot, 23);
  assert.equal(day5.fixture.parameters.normA, 5);
  assert.ok(Math.abs(day5.fixture.parameters.normB - Math.sqrt(29)) < 1e-12);
  const day5Math = renderToStaticMarkup(createElement(LessonVisual, { spec: day5, mode: "math" }));
  assert.match(day5Math, /A=\(3,4\)/);
  assert.match(day5Math, /B=\(5,2\)/);
  assert.match(day5Math, /A·B=23/);
  assert.doesNotMatch(day5Math, /31\.4°|arccos/);

  const day7 = allDayVisuals[6];
  assert.equal(day7.fixture.parameters.outputX, 0);
  assert.equal(day7.fixture.parameters.outputY, 2);
  const day7Concept = renderToStaticMarkup(createElement(LessonVisual, { spec: day7, mode: "concept" }));
  assert.match(day7Concept, /v=\(2,0\)/);
  assert.match(day7Concept, /R₉₀v=\(0,2\)/);
  assert.match(day7Concept, /x2="314" y2="320"/, "the input vector must be drawn horizontally at y=0");

  const expectedFoundationLabels = new Map([
    [4, ["(150, −40) cm", "(1.5, −0.4) m", "Clear address"]],
    [6, ["local x=1 m", "world x=3 m", "Frames labelled"]],
    [8, ["local (1,0)", "world (2,2)", "Order declared"]],
    [9, ["tool point 0.5 m", "world point 4 m", "Round trip works"]],
    [10, ["before (1,0)", "after (0,1)", "Length preserved"]],
    [11, ["yaw 0°", "yaw 90°", "Same orientation"]],
    [12, ["local (1,0)", "world (2,2)", "Rigid pose"]],
  ]);
  for (const [dayId, labels] of expectedFoundationLabels) {
    const html = renderToStaticMarkup(
      createElement(LessonVisual, { spec: allDayVisuals[dayId - 1], mode: "concept" }),
    );
    for (const label of labels) {
      assert.ok(html.includes(label), `day ${dayId} visual must contain ${label}`);
    }
    assert.doesNotMatch(html, /mobile manipulator|This visual applies that grammar/);
  }
});

test("navigation, evidence, and emergency-stop diagrams encode physically meaningful states", () => {
  const pointInside = ([x, y], [left, top, right, bottom]) =>
    x >= left && x <= right && y >= top && y <= bottom;
  const route = [
    [115, 315],
    [180, 350],
    [370, 350],
    [560, 350],
    [560, 180],
    [610, 90],
  ];
  const blockedRegions = [
    [225, 70, 360, 260],
    [415, 240, 520, 335],
  ];

  for (let segment = 0; segment < route.length - 1; segment += 1) {
    const start = route[segment];
    const end = route[segment + 1];
    for (let step = 0; step <= 100; step += 1) {
      const t = step / 100;
      const sample = [
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
      ];
      assert.equal(
        blockedRegions.some((obstacle) => pointInside(sample, obstacle)),
        false,
        `nominal map route intersects an inflated obstacle at ${sample.join(",")}`,
      );
    }
  }

  const mapVisual = allDayVisuals.find((visual) => visual.kind === "map");
  assert.ok(mapVisual);
  const mapConcept = renderToStaticMarkup(createElement(LessonVisual, { spec: mapVisual, mode: "concept" }));
  const mapFailure = renderToStaticMarkup(createElement(LessonVisual, { spec: mapVisual, mode: "failure" }));
  assert.match(mapConcept, /M115 315 L180 350 L370 350 L560 350 L560 180 L610 90/);
  assert.match(mapFailure, /M115 315 L275 180 L610 90/);
  assert.match(mapFailure, /collision/);

  const evidenceVisual = allDayVisuals.find((visual) => visual.kind === "evidence");
  assert.ok(evidenceVisual);
  const evidenceConcept = renderToStaticMarkup(createElement(LessonVisual, { spec: evidenceVisual, mode: "concept" }));
  assert.match(evidenceConcept, /success/);
  assert.match(evidenceConcept, /on-time/);
  assert.match(evidenceConcept, /100%/);
  assert.match(evidenceConcept, /safe/);
  assert.match(evidenceConcept, /repeat/);
  assert.doesNotMatch(evidenceConcept, />latency<\/text>/);

  assert.equal(allDayVisuals[152].kind, "safety", "Day 153 emergency-stop content needs the safety envelope visual");
});
