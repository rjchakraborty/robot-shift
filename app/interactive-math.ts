import {
  allDayVisuals,
  visualKinds,
  type DayVisualSpec,
  type VisualKind,
} from "./lesson-visuals";

export type MathTone = "input" | "process" | "output" | "warning";
export type MathStatusTone = "good" | "boundary" | "danger";

export type MathControl = {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
};

export type MathMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  precision: number;
};

export type MathStatus = {
  tone: MathStatusTone;
  label: string;
  explanation: string;
};

export type VectorScene = {
  type: "vectors";
  origin: { x: number; y: number; label: string };
  vectors: readonly {
    x: number;
    y: number;
    label: string;
    tone: MathTone;
  }[];
};

export type ArmScene = {
  type: "arm";
  points: readonly {
    x: number;
    y: number;
    label: string;
    tone: MathTone;
  }[];
};

export type BarsScene = {
  type: "bars";
  items: readonly {
    label: string;
    value: number;
    max: number;
    unit: string;
    tone: MathTone;
  }[];
};

export type TimelineScene = {
  type: "timeline";
  total: number;
  unit: string;
  segments: readonly {
    label: string;
    value: number;
    tone: MathTone;
  }[];
};

export type ProjectionScene = {
  type: "projection";
  focalLengthPixels: number;
  lateralMetres: number;
  depthMetres: number;
  pixelOffset: number;
};

export type DistributionScene = {
  type: "distribution";
  mean: number;
  standardDeviation: number;
  observation: number;
  zScore: number;
};

export type MathScene =
  | VectorScene
  | ArmScene
  | BarsScene
  | TimelineScene
  | ProjectionScene
  | DistributionScene;

export type InteractiveMathEvaluation = {
  formula: string;
  formulaLatex: string;
  substitution: string;
  steps: readonly string[];
  result: string;
  metrics: readonly MathMetric[];
  status: MathStatus;
  scene: MathScene;
};

export type InteractiveMathDefinition = {
  kind: VisualKind;
  title: string;
  question: string;
  controlsFor: (spec: DayVisualSpec) => readonly MathControl[];
  evaluate: (
    values: Readonly<Record<string, number>>,
    spec: DayVisualSpec,
  ) => InteractiveMathEvaluation;
};

export type InteractiveMathModel = {
  dayId: number;
  topic: string;
  kind: VisualKind;
  title: string;
  question: string;
  controls: readonly MathControl[];
  values: Readonly<Record<string, number>>;
  evaluation: InteractiveMathEvaluation;
  units: readonly string[];
  frames: readonly string[];
};

export type InteractiveMathValidationResult = {
  valid: boolean;
  errors: string[];
};

const EPSILON = 1e-9;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function parameter(spec: DayVisualSpec, key: string, fallback: number) {
  return finite(spec.fixture.parameters[key], fallback);
}

function control(
  id: string,
  label: string,
  symbol: string,
  unit: string,
  min: number,
  max: number,
  step: number,
  initial: number,
): MathControl {
  return {
    id,
    label,
    symbol,
    unit,
    min,
    max,
    step,
    initial: clamp(finite(initial, min), min, max),
  };
}

function metric(
  id: string,
  label: string,
  value: number,
  unit: string,
  precision = 3,
): MathMetric {
  return { id, label, value: finite(value, 0), unit, precision };
}

function good(label: string, explanation: string): MathStatus {
  return { tone: "good", label, explanation };
}

function boundary(label: string, explanation: string): MathStatus {
  return { tone: "boundary", label, explanation };
}

function danger(label: string, explanation: string): MathStatus {
  return { tone: "danger", label, explanation };
}

export function formatMathNumber(value: number, precision = 3) {
  const normalized = Math.abs(value) < EPSILON ? 0 : value;
  if (Number.isInteger(normalized)) return String(normalized);
  return normalized
    .toFixed(precision)
    .replace(/\.?0+$/, "");
}

function degrees(radians: number) {
  return radians * 180 / Math.PI;
}

function radians(degreesValue: number) {
  return degreesValue * Math.PI / 180;
}

function countStatus(
  successes: number,
  attempts: number,
  rate: number,
): MathStatus {
  if (successes > attempts) {
    return danger(
      "Impossible count",
      "Successes cannot exceed attempts. Fix the evidence before interpreting the percentage.",
    );
  }
  if (rate < 80) {
    return danger(
      "Weak evidence",
      "The observed rate is below 80%; inspect failure cases before claiming readiness.",
    );
  }
  if (rate < 95) {
    return boundary(
      "Promising, not proven",
      "The result is useful, but the remaining failures still need classification and recovery evidence.",
    );
  }
  return good(
    "Strong observed result",
    "The measured rate is high; keep the trial definition and failure artifacts with the claim.",
  );
}

function coordinateControls(spec: DayVisualSpec): readonly MathControl[] {
  if (spec.dayId === 4) {
    return [
      control("xCentimetres", "Horizontal coordinate", "x", "cm", -500, 500, 10, parameter(spec, "xCentimetres", 150)),
      control("yCentimetres", "Vertical coordinate", "y", "cm", -500, 500, 10, parameter(spec, "yCentimetres", -40)),
    ];
  }

  if (spec.dayId === 5) {
    return [
      control("ax", "Vector A horizontal component", "Aₓ", "unit", -6, 6, 1, parameter(spec, "ax", 3)),
      control("ay", "Vector A vertical component", "Aᵧ", "unit", -6, 6, 1, parameter(spec, "ay", 4)),
      control("bx", "Vector B horizontal component", "Bₓ", "unit", -6, 6, 1, parameter(spec, "bx", 5)),
    ];
  }

  if (spec.dayId === 6) {
    return [
      control("robotOriginX", "Robot origin in world", "xᵣ", "m", -3, 3, 0.5, parameter(spec, "worldToRobotXMetres", 2)),
      control("localX", "Point in robot frame", "xₗ", "m", -2, 2, 0.5, parameter(spec, "pointInRobotXMetres", 1)),
      control("axisDirection", "Robot x-axis direction", "sₓ", "sign", -1, 1, 2, parameter(spec, "robotXAxisDirection", 1)),
    ];
  }

  if (spec.dayId === 7) {
    return [
      control("inputX", "Input horizontal component", "x", "unit", -5, 5, 0.5, parameter(spec, "inputX", 2)),
      control("inputY", "Input vertical component", "y", "unit", -5, 5, 0.5, parameter(spec, "inputY", 0)),
    ];
  }

  if (spec.dayId === 8) {
    return [
      control("inputX", "Local x coordinate", "x", "m", -3, 3, 0.25, parameter(spec, "inputX", 1)),
      control("inputY", "Local y coordinate", "y", "m", -3, 3, 0.25, parameter(spec, "inputY", 0)),
      control("angleDegrees", "Rotation angle", "θ", "deg", -180, 180, 5, degrees(parameter(spec, "angleRadians", Math.PI / 2))),
    ];
  }

  if (spec.dayId === 9) {
    return [
      control("worldBaseAngle", "World to base rotation", "θWB", "deg", -180, 180, 5, 90),
      control("baseToolAngle", "Base to tool rotation", "θBT", "deg", -180, 180, 5, 0),
      control("pointToolX", "Point x in tool frame", "pTx", "m", -2, 2, 0.25, parameter(spec, "pointInToolMetres", 0.5)),
    ];
  }

  if (spec.dayId === 10) {
    return [
      control("inputX", "Arrow x component", "x", "unit", -3, 3, 0.25, parameter(spec, "inputX", 1)),
      control("inputY", "Arrow y component", "y", "unit", -3, 3, 0.25, parameter(spec, "inputY", 0)),
      control("angleDegrees", "Rotation about z", "θz", "deg", -180, 180, 5, parameter(spec, "angleDegrees", 90)),
    ];
  }

  if (spec.dayId === 11) {
    return [
      control("yawDegrees", "Yaw angle", "ψ", "deg", -180, 180, 5, parameter(spec, "yawDegrees", 90)),
      control("inputX", "Test arrow x", "x", "unit", -3, 3, 0.25, 1),
      control("inputY", "Test arrow y", "y", "unit", -3, 3, 0.25, 0),
    ];
  }

  if (spec.dayId === 12) {
    return [
      control("angleDegrees", "Pose rotation", "θ", "deg", -180, 180, 5, parameter(spec, "angleDegrees", 90)),
      control("translationX", "Pose x translation", "tₓ", "m", -4, 4, 0.25, parameter(spec, "translationX", 2)),
      control("translationY", "Pose y translation", "tᵧ", "m", -4, 4, 0.25, parameter(spec, "translationY", 1)),
    ];
  }

  return [
    control("x", "Horizontal component", "x", "m", -5, 5, 0.1, parameter(spec, "xMetres", 1.2)),
    control("y", "Vertical component", "y", "m", -5, 5, 0.1, parameter(spec, "yMetres", 0.4)),
  ];
}

function evaluateCoordinate(
  values: Readonly<Record<string, number>>,
  spec: DayVisualSpec,
): InteractiveMathEvaluation {
  if (spec.dayId === 4) {
    const xMetres = values.xCentimetres / 100;
    const yMetres = values.yCentimetres / 100;
    return {
      formula: "metres = centimetres ÷ 100",
      formulaLatex: String.raw`\begin{aligned}x_{\mathrm m}&=\frac{x_{\mathrm{cm}}}{100}\\y_{\mathrm m}&=\frac{y_{\mathrm{cm}}}{100}\end{aligned}`,
      substitution: `(${formatMathNumber(values.xCentimetres)}÷100, ${formatMathNumber(values.yCentimetres)}÷100)`,
      steps: [
        `Keep each sign: x=${formatMathNumber(values.xCentimetres)} cm and y=${formatMathNumber(values.yCentimetres)} cm.`,
        `Divide x by 100: ${formatMathNumber(xMetres)} m.`,
        `Divide y by 100: ${formatMathNumber(yMetres)} m.`,
      ],
      result: `The point is (${formatMathNumber(xMetres)}, ${formatMathNumber(yMetres)}) m.`,
      metrics: [
        metric("xMetres", "x coordinate", xMetres, "m"),
        metric("yMetres", "y coordinate", yMetres, "m"),
      ],
      status: good("Units agree", "Both coordinates now use metres, so they can be compared safely."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "origin" },
        vectors: [{ x: xMetres, y: yMetres, label: "point", tone: "output" }],
      },
    };
  }

  if (spec.dayId === 5) {
    const ax = values.ax;
    const ay = values.ay;
    const bx = values.bx;
    const by = parameter(spec, "by", 2);
    const dot = ax * bx + ay * by;
    const normA = Math.hypot(ax, ay);
    const normB = Math.hypot(bx, by);
    const status = normA <= EPSILON || normB <= EPSILON
      ? danger("Direction missing", "A zero-length vector has no direction, so its angle is undefined.")
      : Math.abs(dot) <= EPSILON
        ? boundary("Perpendicular", "A zero dot product means the arrows are at right angles.")
        : dot > 0
          ? good("Broadly same direction", "A positive dot product means each arrow has a component along the other.")
          : boundary("Broadly opposite directions", "A negative dot product means the arrows point more against than along each other.");

    return {
      formula: "||A|| = √(Aₓ²+Aᵧ²); A·B = AₓBₓ + AᵧBᵧ",
      formulaLatex: String.raw`\begin{aligned}\lVert\mathbf A\rVert&=\sqrt{A_x^2+A_y^2}\\\mathbf A\cdot\mathbf B&=A_xB_x+A_yB_y\end{aligned}`,
      substitution: `(${formatMathNumber(ax)}×${formatMathNumber(bx)}) + (${formatMathNumber(ay)}×${formatMathNumber(by)})`,
      steps: [
        `Find the lengths: ||A||=${formatMathNumber(normA)} and ||B||=${formatMathNumber(normB)}.`,
        `Multiply matching components: ${formatMathNumber(ax * bx)} and ${formatMathNumber(ay * by)}.`,
        `Add them to get A·B = ${formatMathNumber(dot)}.`,
      ],
      result: `Dot product ${formatMathNumber(dot)} (${dot > 0 ? "positive" : dot < 0 ? "negative" : "zero"} alignment).`,
      metrics: [
        metric("dot", "Dot product", dot, "unit²"),
        metric("normA", "Length of A", normA, "unit"),
        metric("normB", "Length of B", normB, "unit"),
      ],
      status,
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "O" },
        vectors: [
          { x: ax, y: ay, label: `A (${formatMathNumber(ax)}, ${formatMathNumber(ay)})`, tone: "input" },
          { x: bx, y: by, label: `B (${formatMathNumber(bx)}, ${formatMathNumber(by)})`, tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 6) {
    const worldX = values.robotOriginX + values.axisDirection * values.localX;
    return {
      formula: "world x = robot origin x + axis direction × local x",
      formulaLatex: String.raw`x_W=x_R+s_x x_{\mathrm{local}}`,
      substitution: `${formatMathNumber(values.robotOriginX)} + (${formatMathNumber(values.axisDirection)}×${formatMathNumber(values.localX)})`,
      steps: [
        `The robot origin is at world x=${formatMathNumber(values.robotOriginX)} m.`,
        `The robot x-axis sign is ${formatMathNumber(values.axisDirection)} and the local point is ${formatMathNumber(values.localX)} m.`,
        `Add the signed offset: world x=${formatMathNumber(worldX)} m.`,
      ],
      result: `The same physical point has robot x=${formatMathNumber(values.localX)} m and world x=${formatMathNumber(worldX)} m.`,
      metrics: [
        metric("worldX", "Point in world", worldX, "m"),
        metric("axisDirection", "x-axis direction", values.axisDirection, "sign", 0),
      ],
      status: values.axisDirection < 0
        ? boundary("Axis points the other way", "The minus sign is valid only if the frame drawing declares that reversed x-axis.")
        : good("Frame conversion declared", "Origin, axis direction, value, and unit are all explicit."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "world origin" },
        vectors: [
          { x: values.robotOriginX, y: 0, label: "robot origin", tone: "input" },
          { x: worldX, y: 0, label: "same point in world", tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 7) {
    const x = values.inputX;
    const y = values.inputY;
    const outputX = -y;
    const outputY = x;
    const inputLength = Math.hypot(x, y);
    const outputLength = Math.hypot(outputX, outputY);

    return {
      formula: "[[0,−1],[1,0]] × [x,y] = [−y,x]",
      formulaLatex: String.raw`\begin{bmatrix}0&-1\\1&0\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix}=\begin{bmatrix}-y\\x\end{bmatrix}`,
      substitution: `[[0,−1],[1,0]] × [${formatMathNumber(x)},${formatMathNumber(y)}]`,
      steps: [
        `First row: 0×${formatMathNumber(x)} + (−1)×${formatMathNumber(y)} = ${formatMathNumber(outputX)}.`,
        `Second row: 1×${formatMathNumber(x)} + 0×${formatMathNumber(y)} = ${formatMathNumber(outputY)}.`,
        `The output is (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}).`,
      ],
      result: `Matrix output (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}).`,
      metrics: [
        metric("outputX", "Rotated x", outputX, "unit"),
        metric("outputY", "Rotated y", outputY, "unit"),
        metric("lengthChange", "Length change", outputLength - inputLength, "unit"),
      ],
      status: inputLength <= EPSILON
        ? boundary("No visible direction", "Rotating a zero vector is valid, but no direction is visible.")
        : good("Rigid rotation", "The vector direction changes while its length stays constant."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "O" },
        vectors: [
          { x, y, label: "input", tone: "input" },
          { x: outputX, y: outputY, label: "rotated", tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 8) {
    const angleRadians = radians(values.angleDegrees);
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    const translationX = parameter(spec, "translationX", 2);
    const translationY = parameter(spec, "translationY", 1);
    const rotatedX = cos * values.inputX - sin * values.inputY;
    const rotatedY = sin * values.inputX + cos * values.inputY;
    const outputX = rotatedX + translationX;
    const outputY = rotatedY + translationY;
    return {
      formula: "world point = rotate(local point) + translation",
      formulaLatex: String.raw`\begin{aligned}x'&=x\cos\theta-y\sin\theta+t_x\\y'&=x\sin\theta+y\cos\theta+t_y\end{aligned}`,
      substitution: `θ=${formatMathNumber(values.angleDegrees)}°, t=(${formatMathNumber(translationX)},${formatMathNumber(translationY)}) m`,
      steps: [
        `Rotate the local point to (${formatMathNumber(rotatedX)}, ${formatMathNumber(rotatedY)}) m.`,
        `The translation is (${formatMathNumber(translationX)}, ${formatMathNumber(translationY)}) m.`,
        `Add them to get (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}) m.`,
      ],
      result: `Transformed point (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}) m.`,
      metrics: [
        metric("outputX", "World x", outputX, "m"),
        metric("outputY", "World y", outputY, "m"),
        metric("rotation", "Rotation", values.angleDegrees, "deg", 0),
      ],
      status: good("Rigid transform applied", "Rotation happened first; translation then moved the rotated point."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "local origin" },
        vectors: [
          { x: values.inputX, y: values.inputY, label: "local point", tone: "input" },
          { x: outputX, y: outputY, label: "world point", tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 9) {
    const angleWorldBase = radians(values.worldBaseAngle);
    const angleBaseTool = radians(values.baseToolAngle);
    const angleWorldTool = angleWorldBase + angleBaseTool;
    const translationWorldBase = { x: 2, y: 0 };
    const translationBaseTool = { x: 1.5, y: 0 };
    const pointTool = { x: values.pointToolX, y: 0.5 };
    const rotate = (point: { x: number; y: number }, angle: number) => ({
      x: Math.cos(angle) * point.x - Math.sin(angle) * point.y,
      y: Math.sin(angle) * point.x + Math.cos(angle) * point.y,
    });
    const rotatedBaseTool = rotate(translationBaseTool, angleWorldBase);
    const translationWorldTool = {
      x: translationWorldBase.x + rotatedBaseTool.x,
      y: translationWorldBase.y + rotatedBaseTool.y,
    };
    const rotatedPointTool = rotate(pointTool, angleWorldTool);
    const pointWorld = {
      x: translationWorldTool.x + rotatedPointTool.x,
      y: translationWorldTool.y + rotatedPointTool.y,
    };
    const pointRelativeToTool = {
      x: pointWorld.x - translationWorldTool.x,
      y: pointWorld.y - translationWorldTool.y,
    };
    const recoveredToolPoint = rotate(pointRelativeToTool, -angleWorldTool);

    const rotatedWorldBase = rotate(translationWorldBase, angleBaseTool);
    const translationReverseOrder = {
      x: translationBaseTool.x + rotatedWorldBase.x,
      y: translationBaseTool.y + rotatedWorldBase.y,
    };
    const orderDifference = Math.hypot(
      translationWorldTool.x - translationReverseOrder.x,
      translationWorldTool.y - translationReverseOrder.y,
    );
    const roundTripError = Math.hypot(
      recoveredToolPoint.x - pointTool.x,
      recoveredToolPoint.y - pointTool.y,
    );
    const alignedSpecialCase = Math.abs(values.worldBaseAngle) <= EPSILON
      && Math.abs(values.baseToolAngle) <= EPSILON;
    return {
      formula: "general rule: RWT=RWB·RBT and tWT=RWB·tBT+tWB",
      formulaLatex: String.raw`\begin{aligned}R_{WT}&=R_{WB}R_{BT}\\\mathbf t_{WT}&=R_{WB}\mathbf t_{BT}+\mathbf t_{WB}\\\mathbf p_T&=R_{WT}^{\mathsf T}(\mathbf p_W-\mathbf t_{WT})\end{aligned}`,
      substitution: `θWB=${formatMathNumber(values.worldBaseAngle)}°, θBT=${formatMathNumber(values.baseToolAngle)}°, pT=(${formatMathNumber(pointTool.x)}, ${formatMathNumber(pointTool.y)}) m`,
      steps: [
        alignedSpecialCase
          ? "With both rotations at 0°, the frames are aligned: translations use the special-case sum 2+1.5=3.5 m."
          : `Because the frames rotate, first rotate tBT; the composed tool origin is (${formatMathNumber(translationWorldTool.x)}, ${formatMathNumber(translationWorldTool.y)}) m, not the plain 1D sum.`,
        `Apply the composed transform: pW=(${formatMathNumber(pointWorld.x)}, ${formatMathNumber(pointWorld.y)}) m. Reversing the two transforms moves the origin by ${formatMathNumber(orderDifference)} m, so order matters.`,
        `Apply the inverse rotation and translation; it recovers pT=(${formatMathNumber(recoveredToolPoint.x)}, ${formatMathNumber(recoveredToolPoint.y)}) m with ${formatMathNumber(roundTripError)} m error.`,
      ],
      result: `Composed world point (${formatMathNumber(pointWorld.x)}, ${formatMathNumber(pointWorld.y)}) m; inverse error ${formatMathNumber(roundTripError)} m; order difference ${formatMathNumber(orderDifference)} m.`,
      metrics: [
        metric("worldPointX", "World point x", pointWorld.x, "m"),
        metric("worldPointY", "World point y", pointWorld.y, "m"),
        metric("recoveredToolPointX", "Recovered tool x", recoveredToolPoint.x, "m"),
        metric("recoveredToolPointY", "Recovered tool y", recoveredToolPoint.y, "m"),
        metric("roundTripError", "Inverse round-trip error", roundTripError, "m"),
        metric("orderDifference", "AB versus BA origin difference", orderDifference, "m"),
      ],
      status: roundTripError <= 1e-9
        ? good(
            alignedSpecialCase ? "Aligned translation special case" : "General transform round trip agrees",
            alignedSpecialCase
              ? "Plain addition is valid here only because the axes are aligned; introduce rotation to see the general rule."
              : "The inverse recovers the point, while the non-zero AB-versus-BA test proves rigid transforms generally do not commute.",
          )
        : danger("Frame round trip failed", "The inverse did not recover the original coordinate; inspect order and signs."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "world" },
        vectors: [
          { x: translationWorldTool.x, y: translationWorldTool.y, label: "tool origin", tone: "process" },
          { x: pointWorld.x, y: pointWorld.y, label: "world point", tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 10) {
    const angleRadians = radians(values.angleDegrees);
    const outputX = Math.cos(angleRadians) * values.inputX - Math.sin(angleRadians) * values.inputY;
    const outputY = Math.sin(angleRadians) * values.inputX + Math.cos(angleRadians) * values.inputY;
    const lengthChange = Math.hypot(outputX, outputY) - Math.hypot(values.inputX, values.inputY);
    return {
      formula: "a valid rotation preserves length and has determinant 1",
      formulaLatex: String.raw`\lVert R\mathbf p\rVert=\lVert\mathbf p\rVert,\qquad \det(R)=1`,
      substitution: `Rz(${formatMathNumber(values.angleDegrees)}°) × (${formatMathNumber(values.inputX)},${formatMathNumber(values.inputY)})`,
      steps: [
        `Rotate the arrow around z by ${formatMathNumber(values.angleDegrees)}°.`,
        `The output is (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}).`,
        `Output length minus input length is ${formatMathNumber(lengthChange)}.`,
      ],
      result: `Rotated arrow (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}); length change ${formatMathNumber(lengthChange)}.`,
      metrics: [
        metric("outputX", "Rotated x", outputX, "unit"),
        metric("outputY", "Rotated y", outputY, "unit"),
        metric("lengthChange", "Length change", lengthChange, "unit"),
        metric("determinant", "Rotation determinant", 1, "unitless"),
      ],
      status: good("SO(3) check passes", "This z-axis slice preserves length and uses a determinant-one rotation."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "origin" },
        vectors: [
          { x: values.inputX, y: values.inputY, label: "before", tone: "input" },
          { x: outputX, y: outputY, label: "after R", tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 11) {
    const halfYaw = radians(values.yawDegrees) / 2;
    const quaternionW = Math.cos(halfYaw);
    const quaternionZ = Math.sin(halfYaw);
    const quaternionNorm = Math.hypot(quaternionW, quaternionZ);
    const fullYaw = radians(values.yawDegrees);
    const outputX = Math.cos(fullYaw) * values.inputX - Math.sin(fullYaw) * values.inputY;
    const outputY = Math.sin(fullYaw) * values.inputX + Math.cos(fullYaw) * values.inputY;
    return {
      formula: "yaw quaternion = [cos(yaw/2), 0, 0, sin(yaw/2)]",
      formulaLatex: String.raw`\mathbf q=\left[\cos\frac{\psi}{2},\,0,\,0,\,\sin\frac{\psi}{2}\right]`,
      substitution: `ψ=${formatMathNumber(values.yawDegrees)}°, ψ/2=${formatMathNumber(values.yawDegrees / 2)}°`,
      steps: [
        `Take the half-angle: ${formatMathNumber(values.yawDegrees / 2)}°.`,
        `q_w=${formatMathNumber(quaternionW)} and q_z=${formatMathNumber(quaternionZ)}.`,
        `Their quaternion length is ${formatMathNumber(quaternionNorm)}.`,
      ],
      result: `Quaternion [${formatMathNumber(quaternionW)}, 0, 0, ${formatMathNumber(quaternionZ)}].`,
      metrics: [
        metric("quaternionW", "Quaternion w", quaternionW, "unitless"),
        metric("quaternionZ", "Quaternion z", quaternionZ, "unitless"),
        metric("quaternionNorm", "Quaternion length", quaternionNorm, "unitless"),
      ],
      status: good("Normalized orientation", "The yaw angle and unit quaternion describe the same simplified orientation."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "origin" },
        vectors: [
          { x: values.inputX, y: values.inputY, label: "before yaw", tone: "input" },
          { x: outputX, y: outputY, label: "after yaw", tone: "output" },
        ],
      },
    };
  }

  if (spec.dayId === 12) {
    const localX = parameter(spec, "localX", 1);
    const localY = parameter(spec, "localY", 0);
    const angleRadians = radians(values.angleDegrees);
    const rotatedX = Math.cos(angleRadians) * localX - Math.sin(angleRadians) * localY;
    const rotatedY = Math.sin(angleRadians) * localX + Math.cos(angleRadians) * localY;
    const worldX = rotatedX + values.translationX;
    const worldY = rotatedY + values.translationY;
    return {
      formula: "world point = R × local point + t",
      formulaLatex: String.raw`\mathbf p_W=R\mathbf p_L+\mathbf t`,
      substitution: `R(${formatMathNumber(values.angleDegrees)}°)×(${formatMathNumber(localX)},${formatMathNumber(localY)}) + (${formatMathNumber(values.translationX)},${formatMathNumber(values.translationY)})`,
      steps: [
        `Rotate the fixed local point to (${formatMathNumber(rotatedX)}, ${formatMathNumber(rotatedY)}).`,
        `Translation is (${formatMathNumber(values.translationX)}, ${formatMathNumber(values.translationY)}) m.`,
        `The world point is (${formatMathNumber(worldX)}, ${formatMathNumber(worldY)}) m.`,
      ],
      result: `SE(3) pose slice maps local point to (${formatMathNumber(worldX)}, ${formatMathNumber(worldY)}) m.`,
      metrics: [
        metric("worldX", "World x", worldX, "m"),
        metric("worldY", "World y", worldY, "m"),
        metric("rotation", "Pose rotation", values.angleDegrees, "deg", 0),
      ],
      status: good("Pose combines both parts", "The result includes orientation and position; neither part was silently dropped."),
      scene: {
        type: "vectors",
        origin: { x: 0, y: 0, label: "local" },
        vectors: [
          { x: localX, y: localY, label: "local point", tone: "input" },
          { x: worldX, y: worldY, label: "world point", tone: "output" },
        ],
      },
    };
  }

  const x = values.x;
  const y = values.y;
  const norm = Math.hypot(x, y);
  const angle = norm > EPSILON ? degrees(Math.atan2(y, x)) : 0;

  return {
    formula: "||p|| = √(x² + y²)",
    formulaLatex: String.raw`\lVert \mathbf p\rVert=\sqrt{x^2+y^2}`,
    substitution: `√(${formatMathNumber(x)}² + ${formatMathNumber(y)}²)`,
    steps: [
      `Square x: ${formatMathNumber(x)}² = ${formatMathNumber(x ** 2)}.`,
      `Square y and add: ${formatMathNumber(x ** 2)} + ${formatMathNumber(y ** 2)} = ${formatMathNumber(x ** 2 + y ** 2)}.`,
      `Take the square root: ||p|| = ${formatMathNumber(norm)} m.`,
    ],
    result: `Distance ${formatMathNumber(norm)} m at ${formatMathNumber(angle, 1)}° from +x.`,
    metrics: [
      metric("norm", "Vector length", norm, "m"),
      metric("angle", "Direction", angle, "deg", 1),
    ],
    status: norm <= EPSILON
      ? boundary("At the origin", "The point has zero distance and no unique direction.")
      : good("Frame quantity resolved", "The vector now has a visible length and direction; keep its frame attached."),
    scene: {
      type: "vectors",
      origin: { x: 0, y: 0, label: "frame origin" },
      vectors: [{ x, y, label: "p", tone: "output" }],
    },
  };
}

const definitions = {
  coordinate: {
    kind: "coordinate",
    title: "Move the vector, watch the geometry",
    question: "How do components, length, rotation, and angle describe motion in a named frame?",
    controlsFor: coordinateControls,
    evaluate: evaluateCoordinate,
  },
  kinematics: {
    kind: "kinematics",
    title: "Pose a two-link robot arm",
    question: "How do relative joint angles move the tool through physical space?",
    controlsFor: (spec) => {
      if (spec.dayId === 2) {
        return [
          control("revoluteJoints", "Rotating joints", "Nr", "joints", 0, 6, 1, parameter(spec, "revoluteJoints", 2)),
          control("prismaticJoints", "Sliding joints", "Np", "joints", 0, 4, 1, parameter(spec, "prismaticJoints", 1)),
          control("fixedJoints", "Fixed joints", "Nf", "joints", 0, 4, 1, parameter(spec, "fixedJoints", 1)),
        ];
      }
      if (spec.dayId === 3) {
        return [
          control("shoulder", "Shoulder value", "q1", "deg", -90, 90, 5, parameter(spec, "shoulderDegrees", 30)),
          control("elbow", "Elbow value", "q2", "deg", -90, 90, 5, parameter(spec, "elbowDegrees", -20)),
          control("slider", "Slider value", "q3", "cm", 0, 20, 1, parameter(spec, "sliderCentimetres", 8)),
        ];
      }
      if (spec.dayId === 14) {
        return [
          control("targetX", "Target x", "x*", "m", -2.2, 2.2, 0.1, parameter(spec, "targetXMetres", 1)),
          control("targetY", "Target y", "y*", "m", -2.2, 2.2, 0.1, parameter(spec, "targetYMetres", 1)),
          control("maxIterations", "Iteration limit", "K", "steps", 1, 80, 1, 40),
          control("stepSize", "Update step", "α", "scale", 0.05, 1, 0.05, 0.8),
        ];
      }
      return [
        control("theta1", "Shoulder angle", "θ₁", "deg", -150, 150, 5, parameter(spec, "theta1Degrees", 30)),
        control("theta2", "Elbow angle", "θ₂", "deg", -150, 150, 5, parameter(spec, "theta2Degrees", 45)),
        control("link2", "Second link length", "l₂", "m", 0.2, 1.5, 0.1, parameter(spec, "link2Metres", 0.8)),
      ];
    },
    evaluate: (values, spec) => {
      if (spec.dayId === 2) {
        const movableJoints = values.revoluteJoints + values.prismaticJoints;
        const totalJoints = movableJoints + values.fixedJoints;
        return {
          formula: "DOF = rotating joints + sliding joints; fixed joints add 0",
          formulaLatex: String.raw`\mathrm{DOF}=N_{\mathrm{rotate}}+N_{\mathrm{slide}}`,
          substitution: `${formatMathNumber(values.revoluteJoints)} + ${formatMathNumber(values.prismaticJoints)} + 0×${formatMathNumber(values.fixedJoints)}`,
          steps: [
            `${formatMathNumber(values.revoluteJoints)} one-axis rotating joints each add one movement.`,
            `${formatMathNumber(values.prismaticJoints)} one-axis sliding joints each add one movement.`,
            `${formatMathNumber(values.fixedJoints)} fixed joints add zero, so DOF=${formatMathNumber(movableJoints)}.`,
          ],
          result: `${formatMathNumber(totalJoints)} joints contain ${formatMathNumber(movableJoints)} independent movements.`,
          metrics: [
            metric("degreesOfFreedom", "Degrees of freedom", movableJoints, "DOF", 0),
            metric("totalJoints", "All joints", totalJoints, "joints", 0),
          ],
          status: movableJoints === 0
            ? danger("Robot cannot move", "Every counted joint is fixed, so the mechanism has zero independent movement.")
            : good("Movements counted", "Only independently moving joints contribute to this simplified DOF count."),
          scene: {
            type: "bars",
            items: [
              { label: "rotating", value: values.revoluteJoints, max: 6, unit: "joints", tone: "input" },
              { label: "sliding", value: values.prismaticJoints, max: 4, unit: "joints", tone: "process" },
              { label: "fixed", value: values.fixedJoints, max: 4, unit: "joints", tone: "warning" },
            ],
          },
        };
      }

      if (spec.dayId === 3) {
        const nearLimit = Math.abs(values.shoulder) >= 85 || Math.abs(values.elbow) >= 85 || values.slider >= 19;
        return {
          formula: "configuration q = [shoulder, elbow, slider]",
          formulaLatex: String.raw`\mathbf q=[q_1,\,q_2,\,q_3]`,
          substitution: `[${formatMathNumber(values.shoulder)}°, ${formatMathNumber(values.elbow)}°, ${formatMathNumber(values.slider)} cm]`,
          steps: [
            `Write shoulder first: ${formatMathNumber(values.shoulder)}°.`,
            `Write elbow second: ${formatMathNumber(values.elbow)}°.`,
            `Write slider third: ${formatMathNumber(values.slider)} cm. The ordered three-number snapshot is one configuration.`,
          ],
          result: `q=[${formatMathNumber(values.shoulder)}°, ${formatMathNumber(values.elbow)}°, ${formatMathNumber(values.slider)} cm] has 3 coordinates.`,
          metrics: [
            metric("configurationCoordinates", "Coordinates recorded", 3, "coordinates", 0),
            metric("shoulder", "Shoulder", values.shoulder, "deg", 0),
            metric("elbow", "Elbow", values.elbow, "deg", 0),
            metric("slider", "Slider", values.slider, "cm", 0),
          ],
          status: nearLimit
            ? boundary("Near the C-space edge", "At least one coordinate is near its allowed limit.")
            : good("Valid configuration snapshot", "Every independent movement has one ordered value and unit."),
          scene: {
            type: "bars",
            items: [
              { label: "shoulder", value: values.shoulder, max: 90, unit: "deg", tone: "input" },
              { label: "elbow", value: values.elbow, max: 90, unit: "deg", tone: "process" },
              { label: "slider", value: values.slider, max: 20, unit: "cm", tone: "output" },
            ],
          },
        };
      }

      if (spec.dayId === 14) {
        const link1 = parameter(spec, "link1Metres", 1);
        const link2 = parameter(spec, "link2Metres", 1);
        const targetDistance = Math.hypot(values.targetX, values.targetY);
        const geometricallyReachable = targetDistance <= link1 + link2 + EPSILON
          && targetDistance >= Math.abs(link1 - link2) - EPSILON;
        const maxIterations = Math.round(values.maxIterations);
        const damping = 0.1;
        const tolerance = 1e-3;
        const finiteDifferenceStep = 1e-4;
        const maxJointStep = radians(20);
        const jointLimit = radians(170);
        const forward = (shoulder: number, elbow: number) => ({
          jointX: link1 * Math.cos(shoulder),
          jointY: link1 * Math.sin(shoulder),
          toolX: link1 * Math.cos(shoulder) + link2 * Math.cos(shoulder + elbow),
          toolY: link1 * Math.sin(shoulder) + link2 * Math.sin(shoulder + elbow),
        });

        let shoulderRadians = radians(20);
        let elbowRadians = radians(20);
        let iterationsUsed = 0;
        let jointLimitHits = 0;
        let converged = false;
        let jacobianDeterminant = 0;

        for (let iteration = 0; iteration < maxIterations; iteration += 1) {
          const pose = forward(shoulderRadians, elbowRadians);
          const errorX = values.targetX - pose.toolX;
          const errorY = values.targetY - pose.toolY;
          if (Math.hypot(errorX, errorY) <= tolerance) {
            converged = true;
            break;
          }

          const shoulderProbe = forward(shoulderRadians + finiteDifferenceStep, elbowRadians);
          const elbowProbe = forward(shoulderRadians, elbowRadians + finiteDifferenceStep);
          const j00 = (shoulderProbe.toolX - pose.toolX) / finiteDifferenceStep;
          const j10 = (shoulderProbe.toolY - pose.toolY) / finiteDifferenceStep;
          const j01 = (elbowProbe.toolX - pose.toolX) / finiteDifferenceStep;
          const j11 = (elbowProbe.toolY - pose.toolY) / finiteDifferenceStep;
          jacobianDeterminant = j00 * j11 - j01 * j10;

          const a00 = j00 * j00 + j01 * j01 + damping ** 2;
          const a01 = j00 * j10 + j01 * j11;
          const a11 = j10 * j10 + j11 * j11 + damping ** 2;
          const determinant = Math.max(a00 * a11 - a01 ** 2, EPSILON);
          const solvedErrorX = (a11 * errorX - a01 * errorY) / determinant;
          const solvedErrorY = (-a01 * errorX + a00 * errorY) / determinant;
          let shoulderUpdate = values.stepSize * (j00 * solvedErrorX + j10 * solvedErrorY);
          let elbowUpdate = values.stepSize * (j01 * solvedErrorX + j11 * solvedErrorY);
          shoulderUpdate = clamp(shoulderUpdate, -maxJointStep, maxJointStep);
          elbowUpdate = clamp(elbowUpdate, -maxJointStep, maxJointStep);

          const requestedShoulder = shoulderRadians + shoulderUpdate;
          const requestedElbow = elbowRadians + elbowUpdate;
          const nextShoulder = clamp(requestedShoulder, -jointLimit, jointLimit);
          const nextElbow = clamp(requestedElbow, -jointLimit, jointLimit);
          if (
            Math.abs(nextShoulder - requestedShoulder) > EPSILON
            || Math.abs(nextElbow - requestedElbow) > EPSILON
          ) {
            jointLimitHits += 1;
          }
          shoulderRadians = nextShoulder;
          elbowRadians = nextElbow;
          iterationsUsed = iteration + 1;
        }

        const finalPose = forward(shoulderRadians, elbowRadians);
        const targetError = Math.hypot(
          finalPose.toolX - values.targetX,
          finalPose.toolY - values.targetY,
        );
        converged = targetError <= tolerance;

        const oracleCosineElbow = clamp(
          (values.targetX ** 2 + values.targetY ** 2 - link1 ** 2 - link2 ** 2) / (2 * link1 * link2),
          -1,
          1,
        );
        const oracleElbow = Math.acos(oracleCosineElbow);
        const oracleShoulder = Math.atan2(values.targetY, values.targetX)
          - Math.atan2(link2 * Math.sin(oracleElbow), link1 + link2 * Math.cos(oracleElbow));
        const oraclePose = forward(oracleShoulder, oracleElbow);
        const oracleResidual = Math.hypot(
          oraclePose.toolX - values.targetX,
          oraclePose.toolY - values.targetY,
        );
        return {
          formula: "bounded damped-least-squares IK: qₖ₊₁ = clamp(qₖ + αJᵀ(JJᵀ+λ²I)⁻¹e)",
          formulaLatex: String.raw`\mathbf q_{k+1}=\operatorname{clamp}\!\left(\mathbf q_k+\alpha J^{\mathsf T}(JJ^{\mathsf T}+\lambda^2I)^{-1}\mathbf e\right)`,
          substitution: `target=(${formatMathNumber(values.targetX)}, ${formatMathNumber(values.targetY)}) m, K=${formatMathNumber(maxIterations)}, α=${formatMathNumber(values.stepSize)}, λ=${formatMathNumber(damping)}`,
          steps: [
            `Start at q=[20°,20°]. Each of ${formatMathNumber(iterationsUsed)}/${formatMathNumber(maxIterations)} iterations estimates both Jacobian columns with a ${finiteDifferenceStep.toFixed(4)} rad finite difference.`,
            `Apply damped updates with α=${formatMathNumber(values.stepSize)}, clamp each step to 20°, and clamp both joints to ±170°; limit clamps=${formatMathNumber(jointLimitHits)}.`,
            `Forward kinematics leaves ${formatMathNumber(targetError)} m residual. The analytic oracle is verification only and leaves ${formatMathNumber(oracleResidual)} m for this geometric target.`,
          ],
          result: `${converged ? "Converged" : "Stopped"} after ${formatMathNumber(iterationsUsed)} bounded iterations at q=[${formatMathNumber(degrees(shoulderRadians), 1)}°, ${formatMathNumber(degrees(elbowRadians), 1)}°], residual ${formatMathNumber(targetError)} m.`,
          metrics: [
            metric("shoulder", "Shoulder solution", degrees(shoulderRadians), "deg", 1),
            metric("elbow", "Elbow solution", degrees(elbowRadians), "deg", 1),
            metric("targetError", "Numerical residual", targetError, "m"),
            metric("iterationsUsed", "Iterations used", iterationsUsed, "steps", 0),
            metric("converged", "Converged", converged ? 1 : 0, "boolean", 0),
            metric("jointLimitHits", "Joint-limit clamps", jointLimitHits, "clamps", 0),
            metric("jacobianDeterminant", "Jacobian determinant", jacobianDeterminant, "m²/rad²"),
            metric("oracleResidual", "Analytic oracle residual", oracleResidual, "m"),
          ],
          status: !geometricallyReachable
            ? danger("Target outside geometric reach", "The bounded numerical solver stopped without success; the analytic oracle only confirms that no exact geometric solution exists.")
            : converged
              ? good("Numerical IK converged", "Finite-difference Jacobian updates reached tolerance before the iteration bound; the analytic solution is only an independent verifier.")
              : boundary(
                  jointLimitHits > 0 ? "Joint limit blocked convergence" : "Iteration bound reached",
                  "The solver stopped honestly with a residual instead of treating a finite iteration budget as success.",
                ),
          scene: {
            type: "arm",
            points: [
              { x: 0, y: 0, label: "base", tone: "input" },
              { x: finalPose.jointX, y: finalPose.jointY, label: "joint", tone: "process" },
              { x: finalPose.toolX, y: finalPose.toolY, label: converged ? "tool" : "residual", tone: converged ? "output" : "warning" },
            ],
          },
        };
      }

      const theta1 = values.theta1;
      const theta2 = values.theta2;
      const link1 = parameter(spec, "link1Metres", 1);
      const link2 = values.link2;
      const theta1Radians = radians(theta1);
      const totalRadians = radians(theta1 + theta2);
      const jointX = link1 * Math.cos(theta1Radians);
      const jointY = link1 * Math.sin(theta1Radians);
      const toolX = jointX + link2 * Math.cos(totalRadians);
      const toolY = jointY + link2 * Math.sin(totalRadians);
      const reach = Math.hypot(toolX, toolY);
      const nearLimit = Math.abs(theta1) >= 140 || Math.abs(theta2) >= 140;

      return {
        formula: "x = l₁cosθ₁ + l₂cos(θ₁+θ₂); y = l₁sinθ₁ + l₂sin(θ₁+θ₂)",
        formulaLatex: String.raw`\begin{aligned}x &= l_1\cos\theta_1+l_2\cos(\theta_1+\theta_2) \\ y &= l_1\sin\theta_1+l_2\sin(\theta_1+\theta_2)\end{aligned}`,
        substitution: `l₁=${formatMathNumber(link1)} m, l₂=${formatMathNumber(link2)} m, θ₁=${formatMathNumber(theta1)}°, θ₂=${formatMathNumber(theta2)}°`,
        steps: [
          `Joint one is (${formatMathNumber(jointX)}, ${formatMathNumber(jointY)}) m in the base frame.`,
          `Link two points at θ₁+θ₂ = ${formatMathNumber(theta1 + theta2)}°.`,
          `Add both link projections: tool = (${formatMathNumber(toolX)}, ${formatMathNumber(toolY)}) m.`,
        ],
        result: `Tool position (${formatMathNumber(toolX)}, ${formatMathNumber(toolY)}) m; reach ${formatMathNumber(reach)} m.`,
        metrics: [
          metric("toolX", "Tool x", toolX, "m"),
          metric("toolY", "Tool y", toolY, "m"),
          metric("reach", "Reach from base", reach, "m"),
        ],
        status: nearLimit
          ? boundary("Near a joint limit", "Forward kinematics is valid, but this pose leaves little joint recovery margin.")
          : good("Comfortable pose", "The selected angles remain away from the simplified joint limits."),
        scene: {
          type: "arm",
          points: [
            { x: 0, y: 0, label: "base", tone: "input" },
            { x: jointX, y: jointY, label: "joint", tone: "process" },
            { x: toolX, y: toolY, label: "tool", tone: nearLimit ? "warning" : "output" },
          ],
        },
      };
    },
  },
  feedback: {
    kind: "feedback",
    title: "Close the feedback loop",
    question: "How does measured error become a bounded actuator command?",
    controlsFor: (spec) => [
      control("setpoint", "Requested value", "r", "unit", 0, 2, 0.05, parameter(spec, "setpoint", 1)),
      control("measurement", "Measured value", "y", "unit", 0, 2, 0.05, parameter(spec, "measurement", 0.82)),
      control("gain", "Proportional gain", "Kₚ", "unitless", 0, 5, 0.1, parameter(spec, "proportionalGain", 2)),
    ],
    evaluate: (values) => {
      const error = values.setpoint - values.measurement;
      const rawCommand = values.gain * error;
      const safeCommand = clamp(rawCommand, -1, 1);
      const saturated = Math.abs(rawCommand) > 1;

      return {
        formula: "e = r − y; uₚ = Kₚe; u = clamp(uₚ, −1, 1)",
        formulaLatex: String.raw`\begin{aligned}e &= r-y \\ u_p &= K_p e \\ u &= \operatorname{clamp}(u_p,-1,1)\end{aligned}`,
        substitution: `e=${formatMathNumber(values.setpoint)}−${formatMathNumber(values.measurement)}; uₚ=${formatMathNumber(values.gain)}×e`,
        steps: [
          `Tracking error e = ${formatMathNumber(error)}.`,
          `Raw proportional command uₚ = ${formatMathNumber(rawCommand)}.`,
          `Safe actuator command after clamping = ${formatMathNumber(safeCommand)}.`,
        ],
        result: `Error ${formatMathNumber(error)}; applied command ${formatMathNumber(safeCommand)}.`,
        metrics: [
          metric("error", "Tracking error", error, "unit"),
          metric("rawCommand", "Raw command", rawCommand, "command"),
          metric("safeCommand", "Applied command", safeCommand, "command"),
        ],
        status: saturated
          ? danger("Actuator saturated", "The requested command exceeds the allowed range, so increasing gain cannot create more physical authority.")
          : Math.abs(error) > 0.25
            ? boundary("Large tracking error", "The loop is still within its command range, but the measured state is far from the request.")
            : good("Command inside envelope", "The proportional command fits inside the simplified actuator limit."),
        scene: {
          type: "bars",
          items: [
            { label: "request", value: values.setpoint, max: 2, unit: "unit", tone: "input" },
            { label: "measurement", value: values.measurement, max: 2, unit: "unit", tone: "process" },
            { label: "applied command", value: safeCommand, max: 1, unit: "command", tone: saturated ? "warning" : "output" },
          ],
        },
      };
    },
  },
  timing: {
    kind: "timing",
    title: "Fit work inside a control deadline",
    question: "How much timing margin remains before the robot acts on stale data?",
    controlsFor: (spec) => [
      control("period", "Control period", "T", "ms", 5, 100, 1, parameter(spec, "periodMilliseconds", 20)),
      control("compute", "Worst-case compute time", "C", "ms", 1, 120, 1, parameter(spec, "computeMilliseconds", 6)),
    ],
    evaluate: (values) => {
      const margin = values.period - values.compute;
      const utilization = values.compute / values.period * 100;
      const onTime = margin >= 0;
      const total = Math.max(values.period, values.compute);
      const segments = onTime
        ? [
            { label: "compute", value: values.compute, tone: "process" as const },
            { label: "margin", value: margin, tone: "output" as const },
          ]
        : [
            { label: "deadline", value: values.period, tone: "process" as const },
            { label: "overrun", value: -margin, tone: "warning" as const },
          ];

      return {
        formula: "margin = period − worst-case compute time",
        formulaLatex: String.raw`T_{\mathrm{margin}}=T_{\mathrm{period}}-T_{\mathrm{compute,worst}}`,
        substitution: `${formatMathNumber(values.period)} ms − ${formatMathNumber(values.compute)} ms`,
        steps: [
          `The controller gets ${formatMathNumber(values.period)} ms for one cycle.`,
          `Worst-case work consumes ${formatMathNumber(values.compute)} ms, or ${formatMathNumber(utilization, 1)}% of the period.`,
          `${onTime ? "Remaining margin" : "Deadline overrun"} = ${formatMathNumber(Math.abs(margin))} ms.`,
        ],
        result: `Margin ${formatMathNumber(margin)} ms; utilization ${formatMathNumber(utilization, 1)}%.`,
        metrics: [
          metric("margin", "Deadline margin", margin, "ms"),
          metric("utilization", "Period used", utilization, "%", 1),
        ],
        status: margin < 0
          ? danger("Deadline missed", "The command completes after its deadline and may act on stale physical state.")
          : margin <= values.period * 0.1
            ? boundary("Little timing slack", "A small scheduling or network delay can now miss the cycle.")
            : good("On time", "Worst-case work finishes before the deadline with visible margin."),
        scene: { type: "timeline", total, unit: "ms", segments },
      };
    },
  },
  system: {
    kind: "system",
    title: "Measure the complete operation",
    question: "What percentage of attempted robot operations actually met the contract?",
    controlsFor: (spec) => spec.dayId === 1
      ? [
          control("sensors", "Sensing parts", "Ns", "parts", 0, 6, 1, parameter(spec, "sensors", 2)),
          control("controllers", "Thinking parts", "Nt", "parts", 0, 3, 1, parameter(spec, "controllers", 1)),
          control("actuators", "Acting parts", "Na", "parts", 0, 8, 1, parameter(spec, "actuators", 2)),
        ]
      : [
          control("successes", "Successful operations", "S", "operations", 0, 100, 1, parameter(spec, "successfulRequests", 98)),
          control("attempts", "Attempted operations", "N", "operations", 1, 100, 1, parameter(spec, "totalRequests", 100)),
        ],
    evaluate: (values, spec) => {
      if (spec.dayId === 1) {
        const totalParts = values.sensors + values.controllers + values.actuators;
        const complete = values.sensors > 0 && values.controllers > 0 && values.actuators > 0;
        return {
          formula: "counted parts = sensing + thinking + acting",
          formulaLatex: String.raw`N=N_{\mathrm{sense}}+N_{\mathrm{think}}+N_{\mathrm{act}}`,
          substitution: `${formatMathNumber(values.sensors)} + ${formatMathNumber(values.controllers)} + ${formatMathNumber(values.actuators)}`,
          steps: [
            `Count ${formatMathNumber(values.sensors)} parts that sense the world.`,
            `Count ${formatMathNumber(values.controllers)} parts that run decisions.`,
            `Count ${formatMathNumber(values.actuators)} parts that act; total=${formatMathNumber(totalParts)}.`,
          ],
          result: `${formatMathNumber(totalParts)} parts cover ${complete ? "all three" : "only some"} sense–think–act roles.`,
          metrics: [
            metric("totalParts", "Parts counted", totalParts, "parts", 0),
            metric("sensingParts", "Sensing", values.sensors, "parts", 0),
            metric("thinkingParts", "Thinking", values.controllers, "parts", 0),
            metric("actingParts", "Acting", values.actuators, "parts", 0),
          ],
          status: complete
            ? good("Complete robot loop", "The design contains at least one sensing, thinking, and acting part.")
            : danger("A robot role is missing", "A useful autonomous loop needs sensing, decision-making, and physical action."),
          scene: {
            type: "bars",
            items: [
              { label: "sense", value: values.sensors, max: 6, unit: "parts", tone: "input" },
              { label: "think", value: values.controllers, max: 3, unit: "parts", tone: "process" },
              { label: "act", value: values.actuators, max: 8, unit: "parts", tone: complete ? "output" : "warning" },
            ],
          },
        };
      }

      const rate = values.successes / values.attempts * 100;
      return {
        formula: "availability = successful operations / attempted operations",
        formulaLatex: String.raw`\mathrm{availability}=\frac{\mathrm{successful\ operations}}{\mathrm{attempted\ operations}}`,
        substitution: `${formatMathNumber(values.successes)} / ${formatMathNumber(values.attempts)}`,
        steps: [
          `Use the same operation definition for all ${formatMathNumber(values.attempts)} attempts.`,
          `${formatMathNumber(values.successes)} attempts met every pass condition.`,
          `Divide and multiply by 100: ${formatMathNumber(rate, 1)}%.`,
        ],
        result: `Observed availability ${formatMathNumber(rate, 1)}%.`,
        metrics: [metric("availability", "Observed availability", rate, "%", 1)],
        status: countStatus(values.successes, values.attempts, rate),
        scene: {
          type: "bars",
          items: [
            { label: "observed availability", value: rate, max: 100, unit: "%", tone: rate >= 95 ? "output" : "warning" },
          ],
        },
      };
    },
  },
  sensor: {
    kind: "sensor",
    title: "Project a physical offset into pixels",
    question: "How do focal scale and depth change where a target appears in an image?",
    controlsFor: (spec) => [
      control("focal", "Focal scale", "fₓ", "px", 100, 1200, 50, parameter(spec, "focalLengthPixels", 600)),
      control("lateral", "Lateral target offset", "X", "m", -0.5, 0.5, 0.01, parameter(spec, "lateralMetres", 0.1)),
      control("depth", "Target depth", "Z", "m", 0.2, 5, 0.1, parameter(spec, "depthMetres", 2)),
    ],
    evaluate: (values) => {
      const pixelOffset = values.focal * values.lateral / values.depth;
      return {
        formula: "pixel offset = fₓX/Z",
        formulaLatex: String.raw`u-c_x=\frac{f_x X}{Z}`,
        substitution: `${formatMathNumber(values.focal)} px × ${formatMathNumber(values.lateral)} m / ${formatMathNumber(values.depth)} m`,
        steps: [
          `The lateral-to-depth ratio is ${formatMathNumber(values.lateral / values.depth)}.`,
          `Multiply that ratio by focal scale ${formatMathNumber(values.focal)} px.`,
          `The target lands ${formatMathNumber(pixelOffset, 1)} px from the optical centre.`,
        ],
        result: `Image offset ${formatMathNumber(pixelOffset, 1)} px.`,
        metrics: [metric("pixelOffset", "Pixel offset", pixelOffset, "px", 1)],
        status: Math.abs(pixelOffset) > 500
          ? boundary("Near the image edge", "This simplified projection may place the target outside a typical image crop.")
          : good("Projection visible", "The target has positive depth and a finite calibrated pixel projection."),
        scene: {
          type: "projection",
          focalLengthPixels: values.focal,
          lateralMetres: values.lateral,
          depthMetres: values.depth,
          pixelOffset,
        },
      };
    },
  },
  uncertainty: {
    kind: "uncertainty",
    title: "Move an observation through an uncertainty model",
    question: "How surprising is a measurement compared with the estimate and its spread?",
    controlsFor: (spec) => [
      control("mean", "Estimated mean", "μ", "m", -2, 2, 0.1, parameter(spec, "mean", 0.5)),
      control("sigma", "Standard deviation", "σ", "m", 0.05, 1, 0.05, parameter(spec, "standardDeviation", 0.1)),
      control("observation", "Observed value", "x", "m", -2, 2, 0.1, parameter(spec, "observation", 0.7)),
    ],
    evaluate: (values) => {
      const residual = values.observation - values.mean;
      const zScore = residual / values.sigma;
      const absoluteZ = Math.abs(zScore);
      return {
        formula: "z = (x − μ) / σ",
        formulaLatex: String.raw`z=\frac{x-\mu}{\sigma}`,
        substitution: `(${formatMathNumber(values.observation)} − ${formatMathNumber(values.mean)}) / ${formatMathNumber(values.sigma)}`,
        steps: [
          `Residual x−μ = ${formatMathNumber(residual)} m.`,
          `One modeled standard deviation is ${formatMathNumber(values.sigma)} m.`,
          `The observation is ${formatMathNumber(zScore)} standard deviations from the estimate.`,
        ],
        result: `z-score ${formatMathNumber(zScore)}σ.`,
        metrics: [
          metric("residual", "Residual", residual, "m"),
          metric("zScore", "Standardized distance", zScore, "σ"),
        ],
        status: absoluteZ >= 3
          ? danger("Very surprising observation", "The measurement is at least three modeled standard deviations from the estimate.")
          : absoluteZ >= 2
            ? boundary("Check this observation", "The measurement is unusual enough to inspect calibration, noise, and model assumptions.")
            : good("Consistent observation", "The measurement lies within two modeled standard deviations of the estimate."),
        scene: {
          type: "distribution",
          mean: values.mean,
          standardDeviation: values.sigma,
          observation: values.observation,
          zScore,
        },
      };
    },
  },
  map: {
    kind: "map",
    title: "Move a goal across the map",
    question: "What is the shortest possible distance before obstacles and robot width are considered?",
    controlsFor: (spec) => [
      control("goalX", "Goal x coordinate", "x₂", "m", -5, 5, 0.1, parameter(spec, "goalX", 3)),
      control("goalY", "Goal y coordinate", "y₂", "m", -5, 5, 0.1, parameter(spec, "goalY", 2)),
    ],
    evaluate: (values, spec) => {
      const startX = parameter(spec, "startX", 1);
      const startY = parameter(spec, "startY", 0.5);
      const dx = values.goalX - startX;
      const dy = values.goalY - startY;
      const distance = Math.hypot(dx, dy);
      return {
        formula: "d = √((x₂−x₁)² + (y₂−y₁)²)",
        formulaLatex: String.raw`d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}`,
        substitution: `√((${formatMathNumber(values.goalX)}−${formatMathNumber(startX)})² + (${formatMathNumber(values.goalY)}−${formatMathNumber(startY)})²)`,
        steps: [
          `Coordinate difference Δx = ${formatMathNumber(dx)} m.`,
          `Coordinate difference Δy = ${formatMathNumber(dy)} m.`,
          `Square, add, and take the root: d = ${formatMathNumber(distance)} m.`,
        ],
        result: `Straight-line lower bound ${formatMathNumber(distance)} m.`,
        metrics: [
          metric("distance", "Straight-line distance", distance, "m"),
          metric("deltaX", "Horizontal change", dx, "m"),
          metric("deltaY", "Vertical change", dy, "m"),
        ],
        status: distance <= EPSILON
          ? boundary("Already at the goal", "Start and goal coincide; a real system must still verify localization tolerance.")
          : good("Distance lower bound", "A collision-aware path can only be equal to or longer than this straight line."),
        scene: {
          type: "vectors",
          origin: { x: startX, y: startY, label: "start" },
          vectors: [{ x: values.goalX, y: values.goalY, label: "goal", tone: "output" }],
        },
      };
    },
  },
  tensor: {
    kind: "tensor",
    title: "Resize a vision tensor",
    question: "How quickly do tensor element count and memory grow with batch and image size?",
    controlsFor: (spec) => [
      control("batch", "Batch size", "B", "images", 1, 32, 1, parameter(spec, "batch", 8)),
      control("channels", "Channel count", "C", "channels", 1, 8, 1, parameter(spec, "channels", 3)),
      control("side", "Square image side", "H=W", "px", 32, 512, 16, parameter(spec, "height", 224)),
    ],
    evaluate: (values) => {
      const elements = values.batch * values.channels * values.side * values.side;
      const memoryMegabytes = elements * 4 / 1_000_000;
      const maxElements = 32 * 8 * 512 * 512;
      return {
        formula: "elements = B×C×H×W; float32 MB = elements×4/1,000,000",
        formulaLatex: String.raw`\begin{aligned}N_{\mathrm{elements}} &= B C H W \\ \mathrm{MB}_{\mathrm{float32}} &= \frac{4N_{\mathrm{elements}}}{1{,}000{,}000}\end{aligned}`,
        substitution: `${formatMathNumber(values.batch)}×${formatMathNumber(values.channels)}×${formatMathNumber(values.side)}×${formatMathNumber(values.side)}`,
        steps: [
          `One image has ${formatMathNumber(values.channels * values.side * values.side)} channel values.`,
          `Multiply by batch ${formatMathNumber(values.batch)}: ${formatMathNumber(elements)} total values.`,
          `At four bytes per float32 value, storage is ${formatMathNumber(memoryMegabytes)} MB before activations.`,
        ],
        result: `${formatMathNumber(elements)} values; ${formatMathNumber(memoryMegabytes)} MB of raw float32 input.`,
        metrics: [
          metric("elements", "Tensor elements", elements, "values", 0),
          metric("memory", "Raw float32 memory", memoryMegabytes, "MB"),
        ],
        status: memoryMegabytes > 128
          ? danger("Large input allocation", "The raw input already exceeds 128 MB; training activations require substantially more memory.")
          : memoryMegabytes > 64
            ? boundary("Watch memory growth", "The input is manageable on some hardware, but activations and copies can dominate.")
            : good("Input size visible", "The raw tensor size is explicit before model execution."),
        scene: {
          type: "bars",
          items: [
            { label: "tensor elements", value: elements, max: maxElements, unit: "values", tone: "process" },
            { label: "raw float32", value: memoryMegabytes, max: maxElements * 4 / 1_000_000, unit: "MB", tone: memoryMegabytes > 128 ? "warning" : "output" },
          ],
        },
      };
    },
  },
  episode: {
    kind: "episode",
    title: "Build a synchronized episode",
    question: "How many samples should exist, and is timestamp skew small enough for the motion?",
    controlsFor: (spec) => [
      control("rate", "Sample rate", "f", "Hz", 1, 60, 1, parameter(spec, "sampleRateHertz", 30)),
      control("duration", "Episode duration", "t", "s", 1, 20, 1, parameter(spec, "durationSeconds", 4)),
      control("skew", "Timestamp skew", "Δt", "s", 0, 0.2, 0.005, parameter(spec, "timestampSkewSeconds", 0.008)),
    ],
    evaluate: (values) => {
      const samples = values.rate * values.duration;
      const period = 1 / values.rate;
      const skewPercent = values.skew / period * 100;
      const inPeriodSkew = Math.min(values.skew, period);
      const overrun = Math.max(values.skew - period, 0);
      const segments = [
        { label: "aligned window", value: Math.max(period - inPeriodSkew, 0), tone: "output" as const },
        { label: "timestamp skew", value: inPeriodSkew, tone: values.skew >= period * 0.5 ? "warning" as const : "process" as const },
        ...(overrun > 0
          ? [{ label: "skew beyond one sample", value: overrun, tone: "warning" as const }]
          : []),
      ];
      return {
        formula: "samples = sample rate × duration; sample period = 1/rate",
        formulaLatex: String.raw`\begin{aligned}N_{\mathrm{samples}} &= f_s t \\ T_s &= \frac{1}{f_s}\end{aligned}`,
        substitution: `${formatMathNumber(values.rate)} Hz × ${formatMathNumber(values.duration)} s`,
        steps: [
          `Expected aligned samples = ${formatMathNumber(samples)}.`,
          `One sample period is ${formatMathNumber(period * 1_000, 1)} ms.`,
          `Timestamp skew is ${formatMathNumber(values.skew * 1_000, 1)} ms, or ${formatMathNumber(skewPercent, 1)}% of one sample period.`,
        ],
        result: `${formatMathNumber(samples)} samples; ${formatMathNumber(values.skew * 1_000, 1)} ms skew.`,
        metrics: [
          metric("samples", "Expected samples", samples, "samples", 0),
          metric("samplePeriod", "Sample period", period * 1_000, "ms", 1),
          metric("skewPercent", "Skew per sample", skewPercent, "%", 1),
        ],
        status: values.skew >= period
          ? danger("Observation/action mismatch", "Skew spans at least one sample, so an action can be paired with the wrong observation.")
          : values.skew >= period * 0.5
            ? boundary("Questionable synchronization", "Skew consumes at least half a sample period; fast motion may be mislabelled.")
            : good("Streams plausibly aligned", "Skew is below half a sample interval; verify against the fastest physical motion too."),
        scene: {
          type: "timeline",
          total: Math.max(period, values.skew),
          unit: "s",
          segments,
        },
      };
    },
  },
  policy: {
    kind: "policy",
    title: "Stretch an action chunk through time",
    question: "How long will the robot move before the policy observes the world again?",
    controlsFor: (spec) => [
      control("chunk", "Actions per chunk", "N", "actions", 1, 32, 1, parameter(spec, "actionChunk", 8)),
      control("rate", "Physical control rate", "f", "Hz", 1, 50, 1, parameter(spec, "controlRateHertz", 20)),
    ],
    evaluate: (values) => {
      const horizon = values.chunk / values.rate;
      const actionPeriod = 1 / values.rate;
      const reference = Math.max(horizon, 1);
      return {
        formula: "chunk horizon = actions per chunk / control rate",
        formulaLatex: String.raw`t_{\mathrm{horizon}}=\frac{N_{\mathrm{actions}}}{f_{\mathrm{control}}}`,
        substitution: `${formatMathNumber(values.chunk)} actions / ${formatMathNumber(values.rate)} Hz`,
        steps: [
          `One command interval is ${formatMathNumber(actionPeriod * 1_000, 1)} ms.`,
          `${formatMathNumber(values.chunk)} actions cover ${formatMathNumber(values.chunk)} such intervals.`,
          `The robot can execute ${formatMathNumber(horizon)} s before the next full observation.`,
        ],
        result: `Action horizon ${formatMathNumber(horizon)} s.`,
        metrics: [
          metric("horizon", "Chunk horizon", horizon, "s"),
          metric("actionPeriod", "Action period", actionPeriod * 1_000, "ms", 1),
        ],
        status: horizon > 1
          ? danger("Long open-loop horizon", "More than one second can pass before re-observation; physical drift can compound.")
          : horizon > 0.5
            ? boundary("Watch distribution shift", "The robot commits to a substantial chunk before seeing the next outcome.")
            : good("Short action horizon", "The policy re-observes within half a second at this simplified command rate."),
        scene: {
          type: "timeline",
          total: reference,
          unit: "s",
          segments: [
            { label: `${formatMathNumber(values.chunk)} commanded actions`, value: horizon, tone: horizon > 1 ? "warning" : "output" },
            ...(reference > horizon
              ? [{ label: "1 s reference remainder", value: reference - horizon, tone: "process" as const }]
              : []),
          ],
        },
      };
    },
  },
  safety: {
    kind: "safety",
    title: "Build a stopping-distance envelope",
    question: "How far can the robot travel during reaction and braking?",
    controlsFor: (spec) => [
      control("speed", "Robot speed", "v", "m/s", 0.1, 2, 0.1, parameter(spec, "speedMetresPerSecond", 0.5)),
      control("reaction", "Reaction time", "tᵣ", "s", 0.05, 1, 0.05, parameter(spec, "reactionSeconds", 0.2)),
      control("deceleration", "Available deceleration", "a", "m/s²", 0.5, 5, 0.1, parameter(spec, "decelerationMetresPerSecondSquared", 1)),
    ],
    evaluate: (values) => {
      const reactionDistance = values.speed * values.reaction;
      const brakingDistance = values.speed ** 2 / (2 * values.deceleration);
      const stopDistance = reactionDistance + brakingDistance;
      return {
        formula: "stop distance = v·tᵣ + v²/(2a)",
        formulaLatex: String.raw`d_{\mathrm{stop}}=v t_r+\frac{v^2}{2a}`,
        substitution: `${formatMathNumber(values.speed)}×${formatMathNumber(values.reaction)} + ${formatMathNumber(values.speed)}²/(2×${formatMathNumber(values.deceleration)})`,
        steps: [
          `Reaction travel = v·tᵣ = ${formatMathNumber(reactionDistance)} m.`,
          `Ideal braking travel = v²/(2a) = ${formatMathNumber(brakingDistance)} m.`,
          `Add them: ideal stop distance = ${formatMathNumber(stopDistance)} m before extra safety margin.`,
        ],
        result: `Ideal stopping distance ${formatMathNumber(stopDistance)} m.`,
        metrics: [
          metric("reactionDistance", "Reaction travel", reactionDistance, "m"),
          metric("brakingDistance", "Braking travel", brakingDistance, "m"),
          metric("stopDistance", "Ideal stop distance", stopDistance, "m"),
        ],
        status: stopDistance > 1
          ? danger("Large stopping envelope", "The simplified stop distance exceeds one metre before uncertainty and system safety margin.")
          : stopDistance > 0.5
            ? boundary("Material stopping distance", "Protected-space and speed settings must account for more than half a metre of ideal travel.")
            : good("Compact ideal stop", "The ideal distance is below half a metre; real validation must still add uncertainty and safety margin."),
        scene: {
          type: "timeline",
          total: stopDistance,
          unit: "m",
          segments: [
            { label: "reaction travel", value: reactionDistance, tone: "warning" },
            { label: "braking travel", value: brakingDistance, tone: "process" },
          ],
        },
      };
    },
  },
  hardware: {
    kind: "hardware",
    title: "Load an electrical power budget",
    question: "How much electrical power does the actuator draw at this voltage and current?",
    controlsFor: (spec) => [
      control("voltage", "Supply voltage", "V", "V", 5, 48, 1, parameter(spec, "voltageVolts", 24)),
      control("current", "Load current", "I", "A", 0.1, 10, 0.1, parameter(spec, "currentAmps", 3)),
    ],
    evaluate: (values) => {
      const power = values.voltage * values.current;
      return {
        formula: "electrical power P = voltage V × current I",
        formulaLatex: String.raw`P=V I`,
        substitution: `${formatMathNumber(values.voltage)} V × ${formatMathNumber(values.current)} A`,
        steps: [
          `The supply provides ${formatMathNumber(values.voltage)} joules per coulomb.`,
          `The load draws ${formatMathNumber(values.current)} coulombs per second.`,
          `Multiply them: P = ${formatMathNumber(power)} W.`,
        ],
        result: `Electrical input power ${formatMathNumber(power)} W.`,
        metrics: [metric("power", "Electrical power", power, "W")],
        status: power > 240
          ? danger("High electrical load", "This simplified load exceeds 240 W; verify wiring, driver, supply, fuse, and thermal ratings.")
          : power > 120
            ? boundary("Check the complete power path", "Peak current, efficiency, wiring, and heat now materially affect the design.")
            : good("Power budget visible", "Voltage and current produce a finite load; still verify peak and thermal behavior under motion."),
        scene: {
          type: "bars",
          items: [
            { label: "voltage", value: values.voltage, max: 48, unit: "V", tone: "input" },
            { label: "current", value: values.current, max: 10, unit: "A", tone: "process" },
            { label: "power", value: power, max: 480, unit: "W", tone: power > 240 ? "warning" : "output" },
          ],
        },
      };
    },
  },
  evidence: {
    kind: "evidence",
    title: "Turn trials into an honest claim",
    question: "What success rate did the frozen physical trial set actually demonstrate?",
    controlsFor: (spec) => [
      control("successes", "Successful trials", "S", "trials", 0, 50, 1, parameter(spec, "successes", 46)),
      control("trials", "Frozen trial count", "N", "trials", 1, 50, 1, parameter(spec, "trials", 50)),
    ],
    evaluate: (values) => {
      const rate = values.successes / values.trials * 100;
      return {
        formula: "observed success rate = successful trials / all frozen trials",
        formulaLatex: String.raw`\hat p=\frac{S}{N}`,
        substitution: `${formatMathNumber(values.successes)} / ${formatMathNumber(values.trials)}`,
        steps: [
          `Keep all ${formatMathNumber(values.trials)} frozen trials in the denominator.`,
          `${formatMathNumber(values.successes)} trials met the declared pass condition.`,
          `Divide and multiply by 100: ${formatMathNumber(rate, 1)}%.`,
        ],
        result: `Observed physical success rate ${formatMathNumber(rate, 1)}%.`,
        metrics: [metric("successRate", "Observed success rate", rate, "%", 1)],
        status: countStatus(values.successes, values.trials, rate),
        scene: {
          type: "bars",
          items: [
            { label: "frozen-trial success", value: rate, max: 100, unit: "%", tone: rate >= 95 ? "output" : "warning" },
          ],
        },
      };
    },
  },
} satisfies Record<VisualKind, InteractiveMathDefinition>;

export const interactiveMathDefinitions: Readonly<
  Record<VisualKind, InteractiveMathDefinition>
> = Object.freeze(definitions);

const foundationMathLabels: Readonly<
  Record<number, { title: string; question: string }>
> = {
  1: {
    title: "Count the sense–think–act loop",
    question: "Does this robot have at least one part that senses, thinks, and acts?",
  },
  2: {
    title: "Count independent movements",
    question: "Which joints can move, and how many degrees of freedom do they create?",
  },
  3: {
    title: "Build one robot configuration",
    question: "Which ordered values completely describe this robot snapshot?",
  },
  4: {
    title: "Move on a signed coordinate grid",
    question: "Where is the point after its signs and units are made explicit?",
  },
  5: {
    title: "Measure and compare arrows",
    question: "How do vector components determine length and alignment?",
  },
  6: {
    title: "Describe one point in two frames",
    question: "How do origin and axis direction change the coordinate without moving the point?",
  },
  7: {
    title: "Run a matrix action one row at a time",
    question: "Where does this number grid send the input arrow?",
  },
  8: {
    title: "Rotate, then translate a point",
    question: "Where does a local point land after the declared 2D transform?",
  },
  9: {
    title: "Compose rotated frames in the correct order",
    question: "When is plain translation addition valid, and how do AB and BA differ once a frame rotates?",
  },
  10: {
    title: "Check a proper 3D rotation",
    question: "Does the rotation change direction while preserving length and handedness?",
  },
  11: {
    title: "Describe one turn as a quaternion",
    question: "How does a yaw angle become a normalized four-number orientation?",
  },
  12: {
    title: "Combine orientation and position",
    question: "Where does a local point land under this rigid pose?",
  },
  13: {
    title: "Predict the robot hand position",
    question: "How do two link lengths and two joint angles determine the tool location?",
  },
  14: {
    title: "Run bounded numerical Jacobian IK",
    question: "Does the finite-difference solver converge before its iteration, step, and joint limits?",
  },
};

function valuesForControls(
  controls: readonly MathControl[],
  provided: Readonly<Record<string, number>>,
) {
  return Object.fromEntries(
    controls.map((item) => {
      const candidate = finite(provided[item.id], item.initial);
      return [item.id, clamp(candidate, item.min, item.max)];
    }),
  );
}

export function createInteractiveMathModel(
  spec: DayVisualSpec,
  providedValues: Readonly<Record<string, number>> = {},
): InteractiveMathModel {
  const definition = interactiveMathDefinitions[spec.kind];
  const controls = definition.controlsFor(spec);
  const values = valuesForControls(controls, providedValues);
  const foundationLabel = foundationMathLabels[spec.dayId];
  return {
    dayId: spec.dayId,
    topic: spec.topic,
    kind: spec.kind,
    title: foundationLabel?.title ?? definition.title,
    question: foundationLabel?.question ?? definition.question,
    controls,
    values,
    evaluation: definition.evaluate(values, spec),
    units: spec.units,
    frames: spec.frames,
  };
}

function allNumbersFinite(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(allNumbersFinite);
  if (value && typeof value === "object") {
    return Object.values(value).every(allNumbersFinite);
  }
  return true;
}

export function validateInteractiveMathDefinitions(
  visuals: readonly DayVisualSpec[] = allDayVisuals,
): InteractiveMathValidationResult {
  const errors: string[] = [];
  const definitionKinds = Object.keys(interactiveMathDefinitions).sort();

  if (
    definitionKinds.length !== visualKinds.length ||
    definitionKinds.some((kind, index) => kind !== [...visualKinds].sort()[index])
  ) {
    errors.push("Interactive math definitions must cover all 14 visual kinds exactly once.");
  }
  if (visuals.length !== 180) {
    errors.push(`Interactive math expects 180 visual specs, received ${visuals.length}.`);
  }

  for (const spec of visuals) {
    const definition = interactiveMathDefinitions[spec.kind];
    if (!definition) {
      errors.push(`Day ${spec.dayId}: missing definition for ${spec.kind}.`);
      continue;
    }
    const controls = definition.controlsFor(spec);
    if (controls.length < 2 || controls.length > 4) {
      errors.push(`Day ${spec.dayId}: expected 2 to 4 controls, received ${controls.length}.`);
    }
    const ids = controls.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      errors.push(`Day ${spec.dayId}: control IDs must be unique.`);
    }
    for (const item of controls) {
      if (!/^[a-z][A-Za-z0-9]*$/.test(item.id)) {
        errors.push(`Day ${spec.dayId}: invalid control ID ${item.id}.`);
      }
      if (
        !item.label.trim() ||
        !item.symbol.trim() ||
        !item.unit.trim() ||
        !Number.isFinite(item.min) ||
        !Number.isFinite(item.max) ||
        !Number.isFinite(item.step) ||
        !Number.isFinite(item.initial) ||
        item.min >= item.max ||
        item.step <= 0 ||
        item.initial < item.min ||
        item.initial > item.max
      ) {
        errors.push(`Day ${spec.dayId}: invalid range control ${item.id}.`);
      }
    }

    const model = createInteractiveMathModel(spec);
    const evaluation = model.evaluation;
    if (
      !evaluation.formula.trim() ||
      !evaluation.formulaLatex.trim() ||
      !evaluation.substitution.trim() ||
      evaluation.steps.length !== 3 ||
      evaluation.steps.some((step) => !step.trim()) ||
      !evaluation.result.trim() ||
      evaluation.metrics.length === 0 ||
      !evaluation.status.label.trim() ||
      !evaluation.status.explanation.trim()
    ) {
      errors.push(`Day ${spec.dayId}: incomplete worked evaluation.`);
    }
    if (!allNumbersFinite(model)) {
      errors.push(`Day ${spec.dayId}: default evaluation contains a non-finite number.`);
    }

    for (const item of controls) {
      for (const value of [item.min, item.max]) {
        const boundaryModel = createInteractiveMathModel(spec, {
          ...model.values,
          [item.id]: value,
        });
        if (!allNumbersFinite(boundaryModel)) {
          errors.push(`Day ${spec.dayId}: ${item.id}=${value} creates a non-finite number.`);
        }
      }
    }
  }

  const metricValue = (dayId: number, metricId: string) => {
    const spec = visuals.find((item) => item.dayId === dayId);
    return spec
      ? createInteractiveMathModel(spec).evaluation.metrics
        .find((item) => item.id === metricId)?.value
      : undefined;
  };
  const closeTo = (
    value: number | undefined,
    expected: number,
    tolerance = 1e-9,
  ) => value !== undefined && Math.abs(value - expected) <= tolerance;

  if (metricValue(1, "totalParts") !== 5) {
    errors.push("Day 1 interactive fixture must count 5 sense-think-act parts.");
  }
  if (metricValue(2, "degreesOfFreedom") !== 3) {
    errors.push("Day 2 interactive fixture must count 3 degrees of freedom.");
  }
  if (metricValue(3, "configurationCoordinates") !== 3) {
    errors.push("Day 3 interactive fixture must record 3 configuration coordinates.");
  }
  if (
    metricValue(5, "dot") !== 23 ||
    metricValue(5, "normA") !== 5 ||
    !closeTo(metricValue(5, "normB"), Math.sqrt(29), 1e-12)
  ) {
    errors.push("Day 5 interactive fixture must produce ||A||=5, ||B||=√29, and dot=23.");
  }
  if (
    !closeTo(metricValue(7, "outputX"), 0) ||
    !closeTo(metricValue(7, "outputY"), 2)
  ) {
    errors.push("Day 7 interactive fixture must rotate (2,0) to (0,2).");
  }
  if (
    !closeTo(metricValue(8, "outputX"), 2) ||
    !closeTo(metricValue(8, "outputY"), 2)
  ) {
    errors.push("Day 8 interactive fixture must map local (1,0) to world (2,2).");
  }
  if (
    !closeTo(metricValue(9, "roundTripError"), 0) ||
    (metricValue(9, "orderDifference") ?? 0) <= 0
  ) {
    errors.push("Day 9 interactive fixture must round-trip exactly and prove AB differs from BA.");
  }
  if (
    (metricValue(14, "targetError") ?? Number.POSITIVE_INFINITY) > 1e-3 ||
    metricValue(14, "converged") !== 1
  ) {
    errors.push("Day 14 bounded numerical IK fixture must converge below 1 mm residual.");
  }

  return { valid: errors.length === 0, errors };
}

const validation = validateInteractiveMathDefinitions();
if (!validation.valid) {
  throw new Error(`Invalid interactive math definitions:\n${validation.errors.join("\n")}`);
}
