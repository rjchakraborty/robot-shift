import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { InteractiveMathPlayground } from "../app/interactive-math-playground.tsx";
import {
  createInteractiveMathModel,
  interactiveMathDefinitions,
  validateInteractiveMathDefinitions,
} from "../app/interactive-math.ts";
import {
  allDayVisuals,
  visualKinds,
} from "../app/lesson-visuals.ts";

function metric(model, id) {
  const found = model.evaluation.metrics.find((item) => item.id === id);
  assert.ok(found, `expected ${id} metric on day ${model.dayId}`);
  return found.value;
}

function modelForKind(kind) {
  const spec =
    allDayVisuals.find((item) => item.kind === kind && item.dayId > 14) ??
    allDayVisuals.find((item) => item.kind === kind);
  assert.ok(spec, `expected a ${kind} visual`);
  return createInteractiveMathModel(spec);
}

test("all 14 visual families and all 180 days have validated interactive math", () => {
  assert.deepEqual(
    Object.keys(interactiveMathDefinitions).sort(),
    [...visualKinds].sort(),
  );
  assert.deepEqual(
    validateInteractiveMathDefinitions(),
    { valid: true, errors: [] },
  );
  assert.equal(allDayVisuals.length, 180);

  for (const spec of allDayVisuals) {
    const model = createInteractiveMathModel(spec);
    assert.equal(model.dayId, spec.dayId);
    assert.equal(model.kind, spec.kind);
    assert.equal(model.controls.length >= 2 && model.controls.length <= 4, true);
    assert.equal(new Set(model.controls.map((item) => item.id)).size, model.controls.length);
    assert.equal(model.evaluation.steps.length, 3);
    assert.ok(model.evaluation.formula);
    assert.ok(model.evaluation.formulaLatex);
    assert.ok(model.evaluation.substitution);
    assert.ok(model.evaluation.result);
    assert.ok(model.evaluation.metrics.length > 0);
    assert.deepEqual(model.units, spec.units);
    assert.deepEqual(model.frames, spec.frames);

    const first = model.controls[0];
    const changedValue = first.initial === first.max ? first.min : first.max;
    const changed = createInteractiveMathModel(spec, {
      ...model.values,
      [first.id]: changedValue,
    });
    assert.notEqual(changed.values[first.id], model.values[first.id]);
    assert.notDeepEqual(
      changed.evaluation,
      model.evaluation,
      `day ${spec.dayId} must react to ${first.id}`,
    );
  }
});

test("verified fixtures produce the expected worked results", () => {
  const dayOne = createInteractiveMathModel(allDayVisuals[0]);
  assert.equal(metric(dayOne, "totalParts"), 5);
  assert.match(dayOne.title, /sense–think–act/i);

  const dayTwo = createInteractiveMathModel(allDayVisuals[1]);
  assert.equal(metric(dayTwo, "degreesOfFreedom"), 3);

  const dayThree = createInteractiveMathModel(allDayVisuals[2]);
  assert.equal(metric(dayThree, "configurationCoordinates"), 3);

  const dayFive = createInteractiveMathModel(allDayVisuals[4]);
  assert.equal(metric(dayFive, "dot"), 23);
  assert.equal(metric(dayFive, "normA"), 5);
  assert.ok(Math.abs(metric(dayFive, "normB") - Math.sqrt(29)) < 1e-12);
  assert.equal(dayFive.evaluation.metrics.some((item) => item.id === "angle"), false);

  const daySeven = createInteractiveMathModel(allDayVisuals[6]);
  assert.ok(Math.abs(metric(daySeven, "outputX")) < 1e-9);
  assert.ok(Math.abs(metric(daySeven, "outputY") - 2) < 1e-9);

  const dayEight = createInteractiveMathModel(allDayVisuals[7]);
  assert.ok(Math.abs(metric(dayEight, "outputX") - 2) < 1e-9);
  assert.ok(Math.abs(metric(dayEight, "outputY") - 2) < 1e-9);

  const dayNine = createInteractiveMathModel(allDayVisuals[8]);
  assert.ok(metric(dayNine, "roundTripError") < 1e-9);
  assert.ok(metric(dayNine, "orderDifference") > 0);
  assert.match(dayNine.evaluation.formula, /RWT=RWB·RBT/);

  const dayFourteen = createInteractiveMathModel(allDayVisuals[13]);
  assert.ok(metric(dayFourteen, "targetError") < 1e-3);
  assert.equal(metric(dayFourteen, "converged"), 1);
  assert.ok(metric(dayFourteen, "iterationsUsed") <= dayFourteen.values.maxIterations);
  assert.match(dayFourteen.evaluation.formula, /damped-least-squares IK/i);
  assert.match(dayFourteen.evaluation.steps.join(" "), /finite difference/i);
  assert.match(dayFourteen.evaluation.steps.join(" "), /0\.0001 rad/);

  const dayEleven = createInteractiveMathModel(allDayVisuals[10]);
  assert.match(dayEleven.evaluation.steps.join(" "), /q_w=/);
  assert.doesNotMatch(dayEleven.evaluation.steps.join(" "), /qᵥ/);

  const kinematics = modelForKind("kinematics");
  assert.ok(Math.abs(metric(kinematics, "toolX") - 1.07308064) < 1e-6);
  assert.ok(Math.abs(metric(kinematics, "toolY") - 1.27274066) < 1e-6);

  const feedback = modelForKind("feedback");
  assert.ok(Math.abs(metric(feedback, "error") - 0.18) < 1e-12);
  assert.ok(Math.abs(metric(feedback, "rawCommand") - 0.36) < 1e-12);

  const timing = modelForKind("timing");
  assert.equal(metric(timing, "margin"), 14);
  assert.equal(metric(timing, "utilization"), 30);

  assert.equal(metric(modelForKind("system"), "availability"), 98);
  assert.equal(metric(modelForKind("sensor"), "pixelOffset"), 30);
  assert.ok(Math.abs(metric(modelForKind("uncertainty"), "zScore") - 2) < 1e-12);
  assert.equal(metric(modelForKind("map"), "distance"), 2.5);

  const tensor = modelForKind("tensor");
  assert.equal(metric(tensor, "elements"), 1_204_224);
  assert.ok(Math.abs(metric(tensor, "memory") - 4.816896) < 1e-12);

  assert.equal(metric(modelForKind("episode"), "samples"), 120);
  assert.equal(metric(modelForKind("policy"), "horizon"), 0.4);
  assert.ok(Math.abs(metric(modelForKind("safety"), "stopDistance") - 0.225) < 1e-12);
  assert.equal(metric(modelForKind("hardware"), "power"), 72);
  assert.equal(metric(modelForKind("evidence"), "successRate"), 92);
});

test("Day 9 distinguishes aligned addition from ordered rotated transforms", () => {
  const spec = allDayVisuals[8];
  const aligned = createInteractiveMathModel(spec, {
    worldBaseAngle: 0,
    baseToolAngle: 0,
    pointToolX: 0.5,
  });
  assert.match(aligned.evaluation.status.label, /aligned translation special case/i);
  assert.equal(metric(aligned, "orderDifference"), 0);
  assert.match(aligned.evaluation.steps.join(" "), /2\+1\.5=3\.5 m/);

  const rotated = createInteractiveMathModel(spec, {
    worldBaseAngle: 90,
    baseToolAngle: 0,
    pointToolX: 0.5,
  });
  assert.ok(metric(rotated, "orderDifference") > 2);
  assert.ok(metric(rotated, "roundTripError") < 1e-9);
  assert.match(rotated.evaluation.status.explanation, /do not commute/i);
});

test("Day 14 numerical IK reports convergence, iteration exhaustion, reach, and joint limits honestly", () => {
  const spec = allDayVisuals[13];
  const converged = createInteractiveMathModel(spec);
  assert.equal(metric(converged, "converged"), 1);
  assert.ok(metric(converged, "targetError") < 1e-3);
  assert.ok(Math.abs(metric(converged, "oracleResidual")) < 1e-9);

  const exhausted = createInteractiveMathModel(spec, {
    targetX: 1,
    targetY: 1,
    maxIterations: 1,
    stepSize: 0.05,
  });
  assert.equal(metric(exhausted, "converged"), 0);
  assert.ok(metric(exhausted, "targetError") > 0.1);
  assert.match(exhausted.evaluation.status.label, /iteration bound reached/i);

  const unreachable = createInteractiveMathModel(spec, {
    targetX: 2.2,
    targetY: 2.2,
    maxIterations: 80,
    stepSize: 1,
  });
  assert.equal(metric(unreachable, "converged"), 0);
  assert.equal(unreachable.evaluation.status.tone, "danger");
  assert.match(unreachable.evaluation.status.label, /outside geometric reach/i);

  const limited = createInteractiveMathModel(spec, {
    targetX: -2,
    targetY: 0,
    maxIterations: 80,
    stepSize: 1,
  });
  assert.equal(metric(limited, "converged"), 0);
  assert.ok(metric(limited, "jointLimitHits") > 0);
  assert.ok(Math.abs(metric(limited, "shoulder")) <= 170);
  assert.ok(Math.abs(metric(limited, "elbow")) <= 170);
  assert.match(limited.evaluation.status.label, /joint limit blocked convergence/i);
});

test("minimum and maximum slider values stay finite and deterministic", () => {
  for (const spec of allDayVisuals) {
    const initial = createInteractiveMathModel(spec);
    for (const item of initial.controls) {
      for (const value of [item.min, item.max]) {
        const first = createInteractiveMathModel(spec, {
          ...initial.values,
          [item.id]: value,
        });
        const second = createInteractiveMathModel(spec, {
          ...initial.values,
          [item.id]: value,
        });
        assert.deepEqual(first, second);
        const serialized = JSON.stringify(first);
        assert.doesNotMatch(serialized, /NaN|Infinity|null/);
        for (const output of first.evaluation.metrics) {
          assert.equal(Number.isFinite(output.value), true);
        }
      }
    }
  }
});

test("all 180 playgrounds render accessible controls, live results, and described SVGs", () => {
  for (const spec of allDayVisuals) {
    const model = createInteractiveMathModel(spec);
    const html = renderToStaticMarkup(
      createElement(InteractiveMathPlayground, { spec }),
    );

    assert.match(html, /<section\b[^>]*\bclass="interactive-math /);
    assert.equal(
      [...html.matchAll(/<input\b[^>]*\btype="range"/g)].length,
      model.controls.length,
      `day ${spec.dayId} should render one range for every control`,
    );
    assert.equal(
      [...html.matchAll(/<output\b/g)].length,
      model.controls.length,
      `day ${spec.dayId} should render one output for every control`,
    );
    assert.match(html, /aria-valuetext=/);
    assert.match(html, /aria-describedby=/);
    assert.match(html, /aria-label="Decrease /);
    assert.match(html, /aria-label="Increase /);
    assert.match(html, /Reset verified example/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /aria-atomic="true"/);
    assert.match(html, /<svg\b[^>]*\bviewBox="0 0 720 380"/);
    assert.match(html, /<svg\b[^>]*\brole="img"/);
    assert.match(html, /<title id=/);
    assert.match(html, /<desc id=/);
    assert.match(html, /FORMULA/);
    assert.match(html, /Calculated results/);
    assert.match(html, /Units:/);
    assert.match(html, /Frames:/);
    assert.ok(html.includes(spec.topic));
    assert.doesNotMatch(html, /<script\b|<foreignObject\b/i);

    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(
      ids.length,
      new Set(ids).size,
      `day ${spec.dayId} has duplicate interactive IDs`,
    );
    const references = [
      ...html.matchAll(/(?:url\(#|aria-labelledby="|aria-describedby=")([^)"\s]+)/g),
    ].map((match) => match[1]);
    for (const reference of references) {
      assert.ok(
        ids.includes(reference),
        `day ${spec.dayId} has unresolved #${reference}`,
      );
    }
  }
});
