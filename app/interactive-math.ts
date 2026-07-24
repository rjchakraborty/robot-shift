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
  if (spec.dayId === 1) {
    return [
      control("ax", "Vector A horizontal component", "Aₓ", "unit", -6, 6, 1, parameter(spec, "ax", 3)),
      control("ay", "Vector A vertical component", "Aᵧ", "unit", -6, 6, 1, parameter(spec, "ay", 4)),
      control("bx", "Vector B horizontal component", "Bₓ", "unit", -6, 6, 1, parameter(spec, "bx", 5)),
    ];
  }

  if (spec.dayId === 2) {
    return [
      control("inputX", "Input horizontal component", "x", "unit", -5, 5, 0.5, parameter(spec, "inputX", 2)),
      control("inputY", "Input vertical component", "y", "unit", -5, 5, 0.5, parameter(spec, "inputY", 0)),
      control(
        "angleDegrees",
        "Rotation angle",
        "θ",
        "deg",
        -180,
        180,
        5,
        degrees(parameter(spec, "angleRadians", Math.PI / 2)),
      ),
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
  if (spec.dayId === 1) {
    const ax = values.ax;
    const ay = values.ay;
    const bx = values.bx;
    const by = parameter(spec, "by", 2);
    const dot = ax * bx + ay * by;
    const normA = Math.hypot(ax, ay);
    const normB = Math.hypot(bx, by);
    const denominator = normA * normB;
    const cosine = denominator > EPSILON
      ? clamp(dot / denominator, -1, 1)
      : 0;
    const angle = denominator > EPSILON
      ? degrees(Math.acos(cosine))
      : 0;
    const status = denominator <= EPSILON
      ? danger("Direction missing", "A zero-length vector has no direction, so its angle is undefined.")
      : Math.abs(cosine) > 0.95
        ? boundary("Nearly aligned", "The vectors point in almost the same or opposite direction.")
        : good("Angle resolved", "Both vectors have length, so their dot product gives a valid angle.");

    return {
      formula: "A·B = AₓBₓ + AᵧBᵧ; cosθ = (A·B)/(||A||·||B||)",
      formulaLatex: String.raw`\begin{aligned}\mathbf A\cdot\mathbf B &= A_xB_x+A_yB_y \\ \cos\theta &= \frac{\mathbf A\cdot\mathbf B}{\lVert\mathbf A\rVert\lVert\mathbf B\rVert}\end{aligned}`,
      substitution: `(${formatMathNumber(ax)}×${formatMathNumber(bx)}) + (${formatMathNumber(ay)}×${formatMathNumber(by)})`,
      steps: [
        `Multiply matching components: ${formatMathNumber(ax * bx)} and ${formatMathNumber(ay * by)}.`,
        `Add them to get A·B = ${formatMathNumber(dot)}.`,
        denominator > EPSILON
          ? `Divide by ${formatMathNumber(normA)}×${formatMathNumber(normB)} and take arccos: θ = ${formatMathNumber(angle, 1)}°.`
          : "At least one vector has zero length, so division by the product of their lengths is not valid.",
      ],
      result: denominator > EPSILON
        ? `Dot product ${formatMathNumber(dot)}; angle ${formatMathNumber(angle, 1)}°.`
        : `Dot product ${formatMathNumber(dot)}; angle undefined for a zero vector.`,
      metrics: [
        metric("dot", "Dot product", dot, "unit²"),
        metric("normA", "Length of A", normA, "unit"),
        metric("normB", "Length of B", normB, "unit"),
        metric("angle", "Angle", angle, "deg", 1),
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

  if (spec.dayId === 2) {
    const x = values.inputX;
    const y = values.inputY;
    const angleDegrees = values.angleDegrees;
    const angleRadians = radians(angleDegrees);
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    const outputX = cos * x - sin * y;
    const outputY = sin * x + cos * y;
    const inputLength = Math.hypot(x, y);
    const outputLength = Math.hypot(outputX, outputY);

    return {
      formula: "x′ = cosθ·x − sinθ·y; y′ = sinθ·x + cosθ·y",
      formulaLatex: String.raw`\begin{aligned}x' &= x\cos\theta-y\sin\theta \\ y' &= x\sin\theta+y\cos\theta\end{aligned}`,
      substitution: `θ=${formatMathNumber(angleDegrees)}°, v=(${formatMathNumber(x)}, ${formatMathNumber(y)})`,
      steps: [
        `Convert ${formatMathNumber(angleDegrees)}° to ${formatMathNumber(angleRadians)} rad for the trigonometric functions.`,
        `x′ = ${formatMathNumber(cos)}×${formatMathNumber(x)} − ${formatMathNumber(sin)}×${formatMathNumber(y)} = ${formatMathNumber(outputX)}.`,
        `y′ = ${formatMathNumber(sin)}×${formatMathNumber(x)} + ${formatMathNumber(cos)}×${formatMathNumber(y)} = ${formatMathNumber(outputY)}.`,
      ],
      result: `The rotated vector is (${formatMathNumber(outputX)}, ${formatMathNumber(outputY)}).`,
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
    controlsFor: (spec) => [
      control("theta1", "Shoulder angle", "θ₁", "deg", -150, 150, 5, parameter(spec, "theta1Degrees", 30)),
      control("theta2", "Elbow angle", "θ₂", "deg", -150, 150, 5, parameter(spec, "theta2Degrees", 45)),
      control("link2", "Second link length", "l₂", "m", 0.2, 1.5, 0.1, parameter(spec, "link2Metres", 0.8)),
    ],
    evaluate: (values, spec) => {
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
    controlsFor: (spec) => [
      control("successes", "Successful operations", "S", "operations", 0, 100, 1, parameter(spec, "successfulRequests", 98)),
      control("attempts", "Attempted operations", "N", "operations", 1, 100, 1, parameter(spec, "totalRequests", 100)),
    ],
    evaluate: (values) => {
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
  return {
    dayId: spec.dayId,
    topic: spec.topic,
    kind: spec.kind,
    title: definition.title,
    question: definition.question,
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
    if (controls.length < 2 || controls.length > 3) {
      errors.push(`Day ${spec.dayId}: expected 2 or 3 controls, received ${controls.length}.`);
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

  const dayOne = visuals.find((item) => item.dayId === 1);
  if (dayOne) {
    const model = createInteractiveMathModel(dayOne);
    const dot = model.evaluation.metrics.find((item) => item.id === "dot")?.value;
    const angle = model.evaluation.metrics.find((item) => item.id === "angle")?.value;
    if (dot !== 23 || angle === undefined || Math.abs(angle - 31.3286929) > 1e-6) {
      errors.push("Day 1 interactive fixture must produce dot=23 and angle≈31.33°.");
    }
  }

  const dayTwo = visuals.find((item) => item.dayId === 2);
  if (dayTwo) {
    const model = createInteractiveMathModel(dayTwo);
    const outputX = model.evaluation.metrics.find((item) => item.id === "outputX")?.value;
    const outputY = model.evaluation.metrics.find((item) => item.id === "outputY")?.value;
    if (
      outputX === undefined ||
      outputY === undefined ||
      Math.abs(outputX) > 1e-9 ||
      Math.abs(outputY - 2) > 1e-9
    ) {
      errors.push("Day 2 interactive fixture must rotate (2,0) to (0,2).");
    }
  }

  return { valid: errors.length === 0, errors };
}

const validation = validateInteractiveMathDefinitions();
if (!validation.valid) {
  throw new Error(`Invalid interactive math definitions:\n${validation.errors.join("\n")}`);
}
