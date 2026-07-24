import { curriculumDays, type CurriculumDay } from "./curriculum";

export const visualKinds = [
  "coordinate",
  "kinematics",
  "feedback",
  "timing",
  "system",
  "sensor",
  "uncertainty",
  "map",
  "tensor",
  "episode",
  "policy",
  "safety",
  "hardware",
  "evidence",
] as const;

export type VisualKind = (typeof visualKinds)[number];
export type VisualMode = "concept" | "math" | "failure";
export type OperatingState = "nominal" | "boundary" | "failure";

export type NumericFixture = {
  inputs: readonly number[];
  outputs: readonly number[];
  parameters: Readonly<Record<string, number>>;
};

export type VisualState = {
  label: string;
  description: string;
  value: number;
  unit: string;
};

export type DayVisualSpec = {
  dayId: number;
  topic: string;
  topicKey: string;
  kind: VisualKind;
  title: string;
  takeaway: string;
  units: readonly string[];
  frames: readonly string[];
  fixture: NumericFixture;
  math: {
    formula: string;
    latex: string;
    walkthrough: readonly string[];
    result: string;
  };
  states: Readonly<Record<OperatingState, VisualState>>;
  howToRead: readonly string[];
  legend: readonly {
    label: string;
    meaning: string;
    tone: "input" | "process" | "output" | "warning";
  }[];
  softwareBridge: {
    skill: "Flutter" | "Web" | "Mobile" | "Java" | "Python";
    analogy: string;
    dangerousDifference: string;
  };
  physicalScenario: string;
  source: {
    label: string;
    url: string;
  };
};

type KindProfile = {
  takeaway: string;
  units: readonly string[];
  frames: readonly string[];
  fixture: NumericFixture;
  math: DayVisualSpec["math"];
  states: DayVisualSpec["states"];
  howToRead: readonly string[];
  legend: DayVisualSpec["legend"];
  physicalScenario: string;
};

type BeginnerVisualProfile = Pick<
  KindProfile,
  "takeaway" | "units" | "frames" | "states" | "howToRead" | "physicalScenario"
> & {
  softwareBridge: DayVisualSpec["softwareBridge"];
};

const baseLegend: DayVisualSpec["legend"] = [
  { label: "Input", meaning: "Measured or requested quantity", tone: "input" },
  { label: "Process", meaning: "Transform, estimate, plan, or controller", tone: "process" },
  { label: "Output", meaning: "Command or physical result", tone: "output" },
  { label: "Warning", meaning: "Limit, mismatch, or unsafe state", tone: "warning" },
];

const profiles: Record<VisualKind, KindProfile> = {
  coordinate: {
    takeaway: "A number becomes useful only when its frame, direction, and unit are explicit.",
    units: ["m", "rad", "unitless"],
    frames: ["world", "robot_base", "tool"],
    fixture: {
      inputs: [1.2, 0.4],
      outputs: [Math.sqrt(1.2 ** 2 + 0.4 ** 2)],
      parameters: { xMetres: 1.2, yMetres: 0.4 },
    },
    math: {
      formula: "||p|| = √(x² + y²)",
      latex: String.raw`\lVert \mathbf{p} \rVert = \sqrt{x^2+y^2}`,
      walkthrough: [
        "Square each coordinate so direction does not cancel distance.",
        "Add the squared components.",
        "Take the square root and keep the original distance unit.",
      ],
      result: "For p = (1.2, 0.4) m, ||p|| = 1.265 m.",
    },
    states: {
      nominal: { label: "Frames agree", description: "The vector is interpreted in the declared frame.", value: 0, unit: "cm error" },
      boundary: { label: "Near tolerance", description: "A small calibration offset is close to the task tolerance.", value: 2, unit: "cm error" },
      failure: { label: "Wrong frame", description: "Correct numbers in the wrong frame send the tool to the wrong place.", value: 25, unit: "cm error" },
    },
    howToRead: [
      "Find the named origin and axis directions first.",
      "Trace the vector or transform from input frame to output frame.",
      "Check the unit before comparing or composing values.",
    ],
    legend: baseLegend,
    physicalScenario: "A mobile manipulator must convert a camera observation into a base-frame grasp pose.",
  },
  kinematics: {
    takeaway: "Joint motion becomes tool motion through geometry, limits, and ordered transforms.",
    units: ["m", "rad", "deg"],
    frames: ["base", "joint_1", "joint_2", "tool"],
    fixture: {
      inputs: [1, 0.8, 30, 45],
      outputs: [
        Math.cos(Math.PI / 6) + 0.8 * Math.cos((75 * Math.PI) / 180),
        Math.sin(Math.PI / 6) + 0.8 * Math.sin((75 * Math.PI) / 180),
      ],
      parameters: { link1Metres: 1, link2Metres: 0.8, theta1Degrees: 30, theta2Degrees: 45 },
    },
    math: {
      formula: "x = l₁cosθ₁ + l₂cos(θ₁+θ₂),  y = l₁sinθ₁ + l₂sin(θ₁+θ₂)",
      latex: String.raw`\begin{aligned}x &= l_1\cos\theta_1+l_2\cos(\theta_1+\theta_2) \\ y &= l_1\sin\theta_1+l_2\sin(\theta_1+\theta_2)\end{aligned}`,
      walkthrough: [
        "Project link one onto the base x and y axes.",
        "Add joint two to joint one because link two rotates with both joints.",
        "Add the two link projections to locate the tool.",
      ],
      result: "For l₁=1 m, l₂=0.8 m, θ₁=30°, θ₂=45°: tool ≈ (1.073, 1.273) m.",
    },
    states: {
      nominal: { label: "Comfortable pose", description: "The target is reachable with useful joint margin.", value: 40, unit: "deg margin" },
      boundary: { label: "Near joint limit", description: "The pose is reachable but leaves little recovery room.", value: 5, unit: "deg margin" },
      failure: { label: "Unreachable", description: "The requested pose lies outside limits or inside collision geometry.", value: -8, unit: "deg margin" },
    },
    howToRead: [
      "Start at the fixed base and follow links in order.",
      "Treat every joint angle as relative to its parent link.",
      "Compare the target with reach, joint, and collision limits.",
    ],
    legend: baseLegend,
    physicalScenario: "A two-link arm reaches around a tote wall without crossing a joint limit.",
  },
  feedback: {
    takeaway: "Feedback repeatedly measures error and changes the command before the physical system drifts away.",
    units: ["s", "N", "N·m", "%"],
    frames: ["controller", "actuator", "plant"],
    fixture: {
      inputs: [1, 0.82],
      outputs: [0.18, 0.36],
      parameters: { setpoint: 1, measurement: 0.82, proportionalGain: 2 },
    },
    math: {
      formula: "e = r − y,  uₚ = Kₚe",
      latex: String.raw`\begin{aligned}e &= r-y \\ u_p &= K_p e\end{aligned}`,
      walkthrough: [
        "Subtract measured output y from requested setpoint r.",
        "Multiply that error by proportional gain Kₚ.",
        "Clamp the command to the actuator's safe physical range.",
      ],
      result: "For r=1, y=0.82, Kₚ=2: e=0.18 and uₚ=0.36.",
    },
    states: {
      nominal: { label: "Settled", description: "Tracking error shrinks without oscillation or saturation.", value: 2, unit: "% error" },
      boundary: { label: "Ringing", description: "Delay or gain produces visible overshoot near the stability boundary.", value: 8, unit: "% error" },
      failure: { label: "Unstable", description: "Commands grow or saturate while the measured state diverges.", value: 35, unit: "% error" },
    },
    howToRead: [
      "Follow the request through controller and physical plant.",
      "Use the return arrow to see what is actually measured.",
      "Look for delay, saturation, noise, and sign errors in the loop.",
    ],
    legend: baseLegend,
    physicalScenario: "A motor controller holds wheel speed while floor friction and payload change.",
  },
  timing: {
    takeaway: "Robotic data is correct only if it arrives in time and refers to the same physical instant.",
    units: ["ms", "Hz", "s"],
    frames: ["sensor_clock", "control_clock", "robot_time"],
    fixture: {
      inputs: [20, 6],
      outputs: [14, 0.3],
      parameters: { periodMilliseconds: 20, computeMilliseconds: 6 },
    },
    math: {
      formula: "deadline margin = period − compute time",
      latex: String.raw`T_{\mathrm{margin}} = T_{\mathrm{period}}-T_{\mathrm{compute}}`,
      walkthrough: [
        "Convert rate to a period when needed: period = 1/rate.",
        "Measure worst-case work, not only the average.",
        "Subtract compute time from the period; a negative result is a missed deadline.",
      ],
      result: "A 20 ms period with 6 ms work leaves 14 ms margin and uses 30% of the period.",
    },
    states: {
      nominal: { label: "On time", description: "Data and commands complete before their deadline.", value: 12, unit: "ms margin" },
      boundary: { label: "Little slack", description: "A small scheduling or network delay can miss the cycle.", value: 1, unit: "ms margin" },
      failure: { label: "Stale or late", description: "The controller acts on old state after the deadline.", value: -18, unit: "ms margin" },
    },
    howToRead: [
      "Read time from left to right and locate the deadline marker.",
      "Compare sensing, compute, network, and actuation intervals.",
      "Treat a negative margin or timestamp mismatch as a fault, not cosmetic lag.",
    ],
    legend: baseLegend,
    physicalScenario: "A camera, estimator, and arm controller must agree on when an object pose was true.",
  },
  system: {
    takeaway: "A robot is a distributed system whose interfaces must remain observable when one component degrades.",
    units: ["messages/s", "%", "s"],
    frames: ["process", "host", "robot"],
    fixture: {
      inputs: [98, 100],
      outputs: [0.98],
      parameters: { successfulRequests: 98, totalRequests: 100 },
    },
    math: {
      formula: "availability = successful operations / attempted operations",
      latex: String.raw`\mathrm{availability}=\frac{\mathrm{successful\ operations}}{\mathrm{attempted\ operations}}`,
      walkthrough: [
        "Define one operation and its pass condition.",
        "Count attempts and successes over the same interval.",
        "Inspect failed operations instead of hiding them in the average.",
      ],
      result: "98 successful operations out of 100 gives 98% observed availability.",
    },
    states: {
      nominal: { label: "Healthy graph", description: "Interfaces, lifecycle, and observations match the contract.", value: 100, unit: "% healthy" },
      boundary: { label: "Degraded", description: "One dependency is slow or unavailable but the safe fallback works.", value: 70, unit: "% healthy" },
      failure: { label: "Broken contract", description: "A silent interface or lifecycle mismatch blocks the physical task.", value: 0, unit: "% healthy" },
    },
    howToRead: [
      "Identify each component's single responsibility.",
      "Follow typed data and commands across interface arrows.",
      "Locate health, timeout, retry, and fallback boundaries.",
    ],
    legend: baseLegend,
    physicalScenario: "A telemetry node, command action, controller, and watchdog coordinate a mobile robot.",
  },
  sensor: {
    takeaway: "A sensor measures an indirect signal; calibration turns it into a physical estimate.",
    units: ["px", "m", "Hz"],
    frames: ["camera", "sensor", "target"],
    fixture: {
      inputs: [600, 0.1, 2],
      outputs: [30],
      parameters: { focalLengthPixels: 600, lateralMetres: 0.1, depthMetres: 2 },
    },
    math: {
      formula: "pixel offset = fₓX/Z",
      latex: String.raw`u-c_x=\frac{f_x X}{Z}`,
      walkthrough: [
        "Measure lateral position X and depth Z in the camera frame.",
        "Divide X by Z to get angular scale.",
        "Multiply by focal length fₓ in pixels.",
      ],
      result: "With fₓ=600 px, X=0.1 m, Z=2 m, the image offset is 30 px.",
    },
    states: {
      nominal: { label: "Calibrated", description: "Measurement error stays below the task tolerance.", value: 0.5, unit: "px error" },
      boundary: { label: "Weak signal", description: "Blur, glare, range, or occlusion approaches the usable limit.", value: 2, unit: "px error" },
      failure: { label: "Bad measurement", description: "Missing calibration or an invalid return creates a confident-looking error.", value: 12, unit: "px error" },
    },
    howToRead: [
      "Trace light or physical signal from the target to the sensor.",
      "Locate calibration parameters and the sensor coordinate frame.",
      "Separate missing data from a real zero measurement.",
    ],
    legend: baseLegend,
    physicalScenario: "A wrist camera estimates the pixel and 3D location of a part before grasping.",
  },
  uncertainty: {
    takeaway: "An estimate needs both a best guess and an honest description of how wrong it may be.",
    units: ["m", "rad", "σ"],
    frames: ["measurement", "estimate", "map"],
    fixture: {
      inputs: [0.5, 0.1, 0.7],
      outputs: [1.9999999999999996],
      parameters: { mean: 0.5, standardDeviation: 0.1, observation: 0.7 },
    },
    math: {
      formula: "z = (x − μ) / σ",
      latex: String.raw`z=\frac{x-\mu}{\sigma}`,
      walkthrough: [
        "Subtract the estimated mean μ from observation x.",
        "Divide by standard deviation σ.",
        "Use the result to judge how surprising the observation is under the model.",
      ],
      result: "For μ=0.5 m, σ=0.1 m, x=0.7 m: z=2 standard deviations.",
    },
    states: {
      nominal: { label: "Tight estimate", description: "Sensors agree and covariance remains small.", value: 0.02, unit: "m σ" },
      boundary: { label: "Growing doubt", description: "Dropout or motion makes the estimate less certain.", value: 0.15, unit: "m σ" },
      failure: { label: "Diverged", description: "The estimate looks precise but no longer matches reality.", value: 0.8, unit: "m σ" },
    },
    howToRead: [
      "Find the estimated center, then inspect its uncertainty width.",
      "Compare prediction and observation before the update.",
      "Watch for confidence that shrinks while physical error grows.",
    ],
    legend: baseLegend,
    physicalScenario: "Wheel odometry and IMU measurements are fused while the wheels briefly slip.",
  },
  map: {
    takeaway: "Navigation is a continuous contract between localization, free space, planned path, and recovery.",
    units: ["m", "cells", "s"],
    frames: ["map", "odom", "base_link"],
    fixture: {
      inputs: [1, 0.5, 3, 2],
      outputs: [2.5],
      parameters: { startX: 1, startY: 0.5, goalX: 3, goalY: 2 },
    },
    math: {
      formula: "straight-line distance = √((x₂−x₁)² + (y₂−y₁)²)",
      latex: String.raw`d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}`,
      walkthrough: [
        "Subtract start coordinates from goal coordinates.",
        "Square and add the x and y differences.",
        "Take the square root; a real planner may travel farther around obstacles.",
      ],
      result: "From (1, 0.5) m to (3, 2) m, straight-line distance is 2.5 m.",
    },
    states: {
      nominal: { label: "Clear route", description: "Localization is stable and the path preserves clearance.", value: 0.6, unit: "m clearance" },
      boundary: { label: "Tight passage", description: "Inflation and localization error nearly consume the gap.", value: 0.12, unit: "m clearance" },
      failure: { label: "Invalid route", description: "The path intersects occupied or keepout space.", value: -0.2, unit: "m clearance" },
    },
    howToRead: [
      "Locate the robot, goal, occupied cells, and inflated boundary.",
      "Trace the global route, then the local corrected motion.",
      "Check frame continuity and clearance before judging path length.",
    ],
    legend: baseLegend,
    physicalScenario: "An autonomous mobile robot replans around a trolley in a warehouse aisle.",
  },
  tensor: {
    takeaway: "Shape, scale, device, and data split errors can invalidate a model before learning begins.",
    units: ["elements", "MB", "%"],
    frames: ["batch", "channel", "height", "width"],
    fixture: {
      inputs: [8, 3, 224, 224],
      outputs: [1_204_224],
      parameters: { batch: 8, channels: 3, height: 224, width: 224 },
    },
    math: {
      formula: "elements = batch × channels × height × width",
      latex: String.raw`N_{\mathrm{elements}}=B C H W`,
      walkthrough: [
        "Write the dimension order explicitly.",
        "Multiply each dimension once.",
        "Confirm the model expects that same order and numerical scale.",
      ],
      result: "A [8,3,224,224] tensor contains 1,204,224 values.",
    },
    states: {
      nominal: { label: "Verified pipeline", description: "Shapes, normalization, split, and checkpoint metadata agree.", value: 0.1, unit: "% numeric drift" },
      boundary: { label: "Marginal drift", description: "Export or quantization approaches the accepted tolerance.", value: 2, unit: "% numeric drift" },
      failure: { label: "Invalid model", description: "Leakage, shape, scale, or export mismatch makes metrics misleading.", value: 15, unit: "% numeric drift" },
    },
    howToRead: [
      "Read dimensions in their declared order.",
      "Follow data through transform, model, loss, and evaluation.",
      "Keep train, validation, and held-out evidence visibly separate.",
    ],
    legend: baseLegend,
    physicalScenario: "A vision policy receives synchronized RGB images and robot state on an edge computer.",
  },
  episode: {
    takeaway: "A demonstration is useful only when observation, state, command, outcome, and time stay synchronized.",
    units: ["frames", "Hz", "ms"],
    frames: ["camera_time", "robot_time", "episode"],
    fixture: {
      inputs: [30, 4],
      outputs: [120],
      parameters: { sampleRateHertz: 30, durationSeconds: 4, timestampSkewSeconds: 0.008 },
    },
    math: {
      formula: "samples = sample rate × duration",
      latex: String.raw`N_{\mathrm{samples}}=f_s t`,
      walkthrough: [
        "Choose one sample rate in hertz.",
        "Measure episode duration in seconds.",
        "Multiply, then verify every stream has aligned timestamps for those samples.",
      ],
      result: "A 4 s episode sampled at 30 Hz should contain 120 aligned samples.",
    },
    states: {
      nominal: { label: "Aligned episode", description: "Video, state, action, and outcome refer to the same instants.", value: 2, unit: "ms skew" },
      boundary: { label: "Questionable sync", description: "Timestamp skew approaches the fastest relevant motion interval.", value: 18, unit: "ms skew" },
      failure: { label: "Mislabelled action", description: "The recorded action is paired with the wrong observation.", value: 120, unit: "ms skew" },
    },
    howToRead: [
      "Read the episode timeline from observation to outcome.",
      "Verify each stream shares a clock or a measured offset.",
      "Mark interventions and failures instead of trimming them away.",
    ],
    legend: baseLegend,
    physicalScenario: "A human teleoperates a pick while camera, joints, gripper, and intervention labels are recorded.",
  },
  policy: {
    takeaway: "A learned policy proposes actions; a real system still owns timing, limits, monitoring, and fallback.",
    units: ["Hz", "actions", "s"],
    frames: ["observation", "policy", "command"],
    fixture: {
      inputs: [8, 20],
      outputs: [0.4],
      parameters: { actionChunk: 8, controlRateHertz: 20 },
    },
    math: {
      formula: "chunk horizon = actions per chunk / control rate",
      latex: String.raw`t_{\mathrm{horizon}}=\frac{N_{\mathrm{actions}}}{f_{\mathrm{control}}}`,
      walkthrough: [
        "Count how many future actions the policy emits.",
        "Divide by the physical command rate.",
        "Compare that horizon with inference latency and re-observation needs.",
      ],
      result: "Eight actions at 20 Hz span 0.4 s of robot motion.",
    },
    states: {
      nominal: { label: "Grounded action", description: "Observation is current and decoded action stays inside the safe envelope.", value: 1, unit: "cm deviation" },
      boundary: { label: "Low margin", description: "Latency, distribution shift, or uncertainty approaches the fallback trigger.", value: 5, unit: "cm deviation" },
      failure: { label: "Unsafe proposal", description: "The policy acts on stale or unfamiliar input without independent validation.", value: 30, unit: "cm deviation" },
    },
    howToRead: [
      "Separate observations, learned proposal, validator, and actuator command.",
      "Inspect action horizon and when the robot observes again.",
      "Find the explicit fallback path before trusting a rollout.",
    ],
    legend: baseLegend,
    physicalScenario: "A vision-language-action policy proposes a grasp sequence while a safety layer checks every command.",
  },
  safety: {
    takeaway: "Safety is an independent envelope that can reject, stop, or hand off even when higher-level logic says continue.",
    units: ["m", "m/s", "s"],
    frames: ["workspace", "safety_zone", "robot"],
    fixture: {
      inputs: [0.5, 0.2, 1],
      outputs: [0.225],
      parameters: { speedMetresPerSecond: 0.5, reactionSeconds: 0.2, decelerationMetresPerSecondSquared: 1 },
    },
    math: {
      formula: "stop distance = v·tᵣ + v²/(2a)",
      latex: String.raw`d_{\mathrm{stop}}=v t_r+\frac{v^2}{2a}`,
      walkthrough: [
        "Compute distance travelled during reaction time.",
        "Add braking distance using speed and available deceleration.",
        "Add uncertainty and system-specific safety margin before setting a limit.",
      ],
      result: "At 0.5 m/s, 0.2 s reaction, and 1 m/s² deceleration, ideal stop distance is 0.225 m.",
    },
    states: {
      nominal: { label: "Protected", description: "Independent checks preserve stopping and workspace margin.", value: 40, unit: "cm margin" },
      boundary: { label: "Stop threshold", description: "The system is close enough to require slower motion or a stop.", value: 5, unit: "cm margin" },
      failure: { label: "Envelope crossed", description: "A command or hazard exceeds the validated safe region.", value: -20, unit: "cm margin" },
    },
    howToRead: [
      "Find the physical hazard and independent safety boundary.",
      "Follow the fastest path from detection to stopped actuation.",
      "Check that semantic or learned logic cannot bypass the stop.",
    ],
    legend: baseLegend,
    physicalScenario: "A manipulator slows, stops, and requires recovery when a person enters its protected area.",
  },
  hardware: {
    takeaway: "Voltage, current, torque, heat, wiring, clocks, and lifecycle are part of the software contract.",
    units: ["V", "A", "W", "N·m"],
    frames: ["controller", "bus", "actuator"],
    fixture: {
      inputs: [24, 3],
      outputs: [72],
      parameters: { voltageVolts: 24, currentAmps: 3 },
    },
    math: {
      formula: "electrical power = voltage × current",
      latex: String.raw`P=V I`,
      walkthrough: [
        "Measure supply voltage under load.",
        "Measure or bound expected current.",
        "Multiply, then include efficiency, peak load, thermal, and wiring margins.",
      ],
      result: "A 24 V actuator drawing 3 A consumes 72 W electrically.",
    },
    states: {
      nominal: { label: "Inside rating", description: "Electrical, thermal, bus, and mechanical limits have margin.", value: 1.5, unit: "A" },
      boundary: { label: "Peak load", description: "Current or temperature approaches the continuous rating.", value: 4.8, unit: "A" },
      failure: { label: "Trip or damage", description: "A limit, wiring, clock, or lifecycle fault makes motion unreliable.", value: 7.2, unit: "A" },
    },
    howToRead: [
      "Follow energy and data from supply and controller to actuator.",
      "Distinguish continuous ratings from short peaks.",
      "Locate sensing, isolation, emergency stop, and safe-state paths.",
    ],
    legend: baseLegend,
    physicalScenario: "A motor, encoder, field bus, controller, and power supply bring one joint up safely.",
  },
  evidence: {
    takeaway: "A credible robotics claim pairs a frozen test condition with measured results and visible failures.",
    units: ["trials", "%", "ms"],
    frames: ["test_fixture", "scenario", "artifact"],
    fixture: {
      inputs: [46, 50],
      outputs: [0.92],
      parameters: { successes: 46, trials: 50 },
    },
    math: {
      formula: "observed success rate = successes / trials",
      latex: String.raw`\mathrm{success\ rate}=\frac{S}{N}`,
      walkthrough: [
        "Freeze the pass condition before running trials.",
        "Count every attempted trial, including interventions and setup failures.",
        "Report the fraction with scenario coverage and failure categories.",
      ],
      result: "46 passes in 50 frozen trials gives a 92% observed success rate.",
    },
    states: {
      nominal: { label: "Reproducible proof", description: "Another engineer can repeat the setup and verify the claim.", value: 100, unit: "% checks" },
      boundary: { label: "Partial proof", description: "A test passes but coverage or artifact metadata is incomplete.", value: 90, unit: "% checks" },
      failure: { label: "Unverifiable claim", description: "Only a demo cut or happy-path metric supports the claim.", value: 40, unit: "% checks" },
    },
    howToRead: [
      "Read the frozen condition and pass criterion before the result.",
      "Compare success, timing, safety, and reproducibility together.",
      "Inspect raw failures and reproducibility artifacts.",
    ],
    legend: baseLegend,
    physicalScenario: "A hiring reviewer reproduces a capstone benchmark from its repository, dataset card, and uncut trials.",
  },
};

const bridges: Record<VisualKind, DayVisualSpec["softwareBridge"]> = {
  coordinate: {
    skill: "Flutter",
    analogy: "Flutter's Offset and canvas transforms are a useful mental model for points, vectors, and ordered transforms.",
    dangerousDifference: "A wrong canvas transform moves pixels; a wrong robot frame can cause a collision. Physical units and calibration are mandatory.",
  },
  kinematics: {
    skill: "Flutter",
    analogy: "A widget transform tree resembles a robot link tree: each child pose is relative to its parent.",
    dangerousDifference: "Robot joints have mass, limits, backlash, singularities, and collision geometry; widgets do not.",
  },
  feedback: {
    skill: "Java",
    analogy: "A scheduled Java loop that reads state, computes, and writes output resembles a discrete controller cycle.",
    dangerousDifference: "Garbage collection, blocking calls, or missed deadlines can create unsafe physical commands, not just slow UI.",
  },
  timing: {
    skill: "Mobile",
    analogy: "A mobile frame budget and timestamped camera/IMU pipeline make deadline and synchronization problems familiar.",
    dangerousDifference: "Dropping a UI frame is visible lag; stale robot state can move hardware toward where an object used to be.",
  },
  system: {
    skill: "Web",
    analogy: "ROS nodes, topics, services, and actions resemble typed services, event streams, requests, and cancellable jobs.",
    dangerousDifference: "A distributed robot graph closes a loop through physical hardware, so retries, ordering, and timeouts have physical consequences.",
  },
  sensor: {
    skill: "Mobile",
    analogy: "Phone camera and IMU APIs already expose pixels, rates, timestamps, orientation, permissions, and noisy readings.",
    dangerousDifference: "Robot perception needs measured intrinsics, extrinsics, frames, and task tolerances; an attractive preview is not calibration.",
  },
  uncertainty: {
    skill: "Python",
    analogy: "Python data analysis makes distributions, residual plots, and confidence intervals approachable.",
    dangerousDifference: "Covariance is a model of uncertainty, not proof that the estimate matches the physical world.",
  },
  map: {
    skill: "Flutter",
    analogy: "Drawing layers on a canvas resembles occupancy, inflation, planned path, robot pose, and debug overlays.",
    dangerousDifference: "Navigation layers use metric frames, footprint geometry, and live obstacles; z-order alone cannot make a route safe.",
  },
  tensor: {
    skill: "Python",
    analogy: "NumPy and Python ML pipelines transfer directly to explicit tensor shapes, preprocessing, metrics, and experiment scripts.",
    dangerousDifference: "A low validation loss can still fail physically because of leakage, latency, shift, or unsafe action decoding.",
  },
  episode: {
    skill: "Mobile",
    analogy: "A video recorder plus an event log is a good model for synchronized observation, state, command, and intervention streams.",
    dangerousDifference: "A few milliseconds of skew can label the wrong physical action, even when each file looks valid alone.",
  },
  policy: {
    skill: "Java",
    analogy: "Treat a robot skill like a typed interface with preconditions, result states, cancellation, timeout, and rollback.",
    dangerousDifference: "A learned implementation is probabilistic and distribution-dependent; the type signature does not guarantee safe behavior.",
  },
  safety: {
    skill: "Web",
    analogy: "Server-side validation, authorization, rate limits, and circuit breakers resemble independent robot command guardrails.",
    dangerousDifference: "Software authorization protects data; robot safety must also account for momentum, stopping distance, force, and hardware failure.",
  },
  hardware: {
    skill: "Java",
    analogy: "A hardware interface can be designed like a strict Java driver contract with lifecycle and explicit error states.",
    dangerousDifference: "Electrical and mechanical ratings remain true even when the software type-checks and the API call succeeds.",
  },
  evidence: {
    skill: "Python",
    analogy: "Automated tests, structured logs, reproducible environments, and CI are strong foundations for robotics evidence.",
    dangerousDifference: "A unit test or simulator pass does not prove physical task success; hardware trials and honest failure artifacts are required.",
  },
};

const foundationVisualProfiles: Readonly<
  Partial<Record<number, BeginnerVisualProfile>>
> = {
  4: {
    takeaway: "A coordinate is a measured address: a number, a direction from zero, and a unit.",
    units: ["cm", "m", "count"],
    frames: ["paper origin", "+x direction", "+y direction"],
    states: {
      nominal: { label: "Clear address", description: "Zero, positive directions, and units are written beside the point.", value: 0, unit: "missing labels" },
      boundary: { label: "Mixed units", description: "The numbers are usable only after centimetres and metres are converted to one unit.", value: 1, unit: "conversion needed" },
      failure: { label: "Unknown direction", description: "A signed number is ambiguous when nobody says which way is positive.", value: 2, unit: "missing directions" },
    },
    howToRead: [
      "Find the zero point first.",
      "Follow the arrows marked positive x and positive y.",
      "Read the sign and unit with every number.",
    ],
    physicalScenario: "Tape graph paper to a table, choose one corner as zero, and describe a toy robot's position in centimetres.",
    softwareBridge: bridges.coordinate,
  },
  5: {
    takeaway: "A vector is an arrow: its components say how far to move sideways and up, while its norm says the straight-line length.",
    units: ["grid squares", "cm", "cm² for a dot product"],
    frames: ["one labelled paper grid"],
    states: {
      nominal: { label: "Arrow matches", description: "The drawn arrow and its two components describe the same movement.", value: 0, unit: "component error" },
      boundary: { label: "Zero arrow", description: "An arrow with both components zero has no direction and length zero.", value: 0, unit: "length" },
      failure: { label: "Components swapped", description: "Swapping sideways and upward parts points the arrow somewhere else.", value: 2, unit: "wrong components" },
    },
    howToRead: [
      "Start at the arrow's tail and finish at its head.",
      "Count the horizontal part, then the vertical part.",
      "Use the square-root length rule only after the two parts make sense.",
    ],
    physicalScenario: "A toy robot moves 3 squares right and 4 squares up; the movement arrow has components (3,4) and length 5 squares.",
    softwareBridge: bridges.coordinate,
  },
  6: {
    takeaway: "A coordinate frame is a small map key: it declares where zero is and which ways its axes point.",
    units: ["cm", "m", "direction sign"],
    frames: ["table", "robot"],
    states: {
      nominal: { label: "Frames labelled", description: "Both maps name their origins, axes, directions, and units.", value: 0, unit: "cm disagreement" },
      boundary: { label: "Origin uncertain", description: "A small origin measurement error moves every converted point.", value: 2, unit: "cm uncertainty" },
      failure: { label: "Axis reversed", description: "Treating left as right changes the sign and puts the point on the wrong side.", value: 2, unit: "wrong axis signs" },
    },
    howToRead: [
      "Circle the origin of each frame.",
      "Trace the positive axis arrows.",
      "Say which frame owns every coordinate before using it.",
    ],
    physicalScenario: "Draw one grid on the table and a smaller grid on a paper robot, then describe the same sticker from both grids.",
    softwareBridge: bridges.coordinate,
  },
  7: {
    takeaway: "A matrix is a grid-shaped rule: each row builds one output by multiplying and adding the input parts.",
    units: ["input units", "output units", "unitless rotation entries"],
    frames: ["input arrow", "output arrow"],
    states: {
      nominal: { label: "Row rule works", description: "Each row produces the expected output component.", value: 0, unit: "wrong outputs" },
      boundary: { label: "Shape check", description: "The number of matrix columns must match the number of input parts.", value: 2, unit: "required columns" },
      failure: { label: "Order swapped", description: "Reading rows and columns in the wrong order produces a different arrow.", value: 2, unit: "wrong outputs" },
    },
    howToRead: [
      "Read the matrix size as rows by columns.",
      "Cover all but one row and multiply it by the input column.",
      "Add that row's products to get one output number.",
    ],
    physicalScenario: "A two-by-two number grid turns the paper arrow (2,0) into (0,2), one row at a time.",
    softwareBridge: bridges.coordinate,
  },
  8: {
    takeaway: "A 2D transform first turns an object and then moves it, using one declared order.",
    units: ["degrees", "radians", "cm"],
    frames: ["paper robot", "table"],
    states: {
      nominal: { label: "Order declared", description: "The rotation is applied before the translation, exactly as written.", value: 0, unit: "cm error" },
      boundary: { label: "Angle converted", description: "Degrees and radians describe the same turn only after a correct conversion.", value: 90, unit: "degrees" },
      failure: { label: "Order reversed", description: "Moving first and turning second gives a different final position.", value: 2, unit: "cm error" },
    },
    howToRead: [
      "Mark the local point before anything moves.",
      "Draw the rotated point.",
      "Add the translation arrow last and check the final coordinate.",
    ],
    physicalScenario: "Turn a paper robot 90 degrees, slide it two squares right and one up, and track a sticker on its nose.",
    softwareBridge: bridges.coordinate,
  },
  9: {
    takeaway: "Composition follows a chain in order; an inverse walks the same chain backward.",
    units: ["cm", "m", "ordered steps"],
    frames: ["world", "robot", "tool"],
    states: {
      nominal: { label: "Round trip works", description: "Going forward through the chain and back through its inverse recovers the starting point.", value: 0, unit: "cm round-trip error" },
      boundary: { label: "Link missing", description: "One unknown transform breaks the otherwise valid frame chain.", value: 1, unit: "missing link" },
      failure: { label: "Wrong order", description: "Reordering transforms changes the physical result.", value: 2, unit: "misordered links" },
    },
    howToRead: [
      "Write the start and destination frame.",
      "Follow connected arrows in order without skipping a frame.",
      "Reverse both direction and order when taking the inverse.",
    ],
    physicalScenario: "Use three nested paper grids for the table, robot base, and gripper, then move a marked point out and back.",
    softwareBridge: bridges.coordinate,
  },
  10: {
    takeaway: "SO(3) is the set of honest 3D rotations: they turn arrows without stretching or mirroring them.",
    units: ["degrees", "radians", "unitless matrix entries"],
    frames: ["before rotation", "after rotation"],
    states: {
      nominal: { label: "Length preserved", description: "The arrow changes direction but keeps the same length.", value: 0, unit: "length change" },
      boundary: { label: "Rounded values", description: "Small decimal rounding creates a tiny numerical length error.", value: 0.001, unit: "length change" },
      failure: { label: "Not a rotation", description: "A matrix that stretches or mirrors the object is not in SO(3).", value: 1, unit: "failed rotation checks" },
    },
    howToRead: [
      "Compare the arrow before and after the turn.",
      "Check that its length did not change.",
      "Check that the axes remain perpendicular and right-handed.",
    ],
    physicalScenario: "Rotate a book in your hands without bending, stretching, or reflecting it in a mirror.",
    softwareBridge: bridges.coordinate,
  },
  11: {
    takeaway: "Euler angles and quaternions are two ways to store orientation; neither changes the physical pose by itself.",
    units: ["degrees", "radians", "unitless quaternion"],
    frames: ["body", "world"],
    states: {
      nominal: { label: "Same orientation", description: "The Euler angles and normalized quaternion describe the same physical turn.", value: 1, unit: "quaternion norm" },
      boundary: { label: "Euler singularity", description: "Near a 90-degree middle turn, two Euler axes become hard to distinguish.", value: 89, unit: "degrees pitch" },
      failure: { label: "Not normalized", description: "A quaternion with length other than one is not a valid pure orientation.", value: 0.2, unit: "norm error" },
    },
    howToRead: [
      "Picture the physical orientation before reading its stored numbers.",
      "Keep the Euler rotation order explicit.",
      "Check that a quaternion has four entries and norm one.",
    ],
    physicalScenario: "Hold a phone facing forward, turn it left by 90 degrees, and store that same pose as yaw or as a quaternion.",
    softwareBridge: bridges.coordinate,
  },
  12: {
    takeaway: "SE(3) stores one rigid 3D pose: an orientation plus a position, with no stretching.",
    units: ["m", "radians", "unitless rotation entries"],
    frames: ["local object", "world"],
    states: {
      nominal: { label: "Rigid pose", description: "Rotation and translation move the object while preserving its shape.", value: 0, unit: "shape change" },
      boundary: { label: "Measured offset", description: "Translation uncertainty moves every transformed point by the same small offset.", value: 2, unit: "cm uncertainty" },
      failure: { label: "Invalid transform", description: "A bad rotation block or bottom row no longer represents a rigid pose.", value: 1, unit: "failed pose checks" },
    },
    howToRead: [
      "Separate the rotation part from the translation part.",
      "Apply the rotation to the local point.",
      "Add translation and verify that distances within the object stay unchanged.",
    ],
    physicalScenario: "Move a small cardboard box on a table: turn it, slide it, and record the complete pose without changing its shape.",
    softwareBridge: bridges.coordinate,
  },
  13: {
    takeaway: "Forward kinematics starts with known joint values and predicts where the robot's tool will be.",
    units: ["m", "degrees", "radians"],
    frames: ["base", "joint 1", "joint 2", "tool"],
    states: {
      nominal: { label: "Prediction checked", description: "Measured link lengths and joint angles predict the observed tool position.", value: 0, unit: "cm position error" },
      boundary: { label: "Near a limit", description: "The pose is reachable but leaves little room for another move.", value: 5, unit: "degrees margin" },
      failure: { label: "Wrong angle meaning", description: "Treating a child-joint angle as a world angle predicts the wrong tool position.", value: 12, unit: "cm position error" },
    },
    howToRead: [
      "Start at the fixed base.",
      "Apply each joint and link in parent-to-child order.",
      "Measure the paper arm to check the predicted tool point.",
    ],
    physicalScenario: "Set two angles on a cardboard arm, calculate its fingertip position, and check it against graph paper.",
    softwareBridge: bridges.kinematics,
  },
  14: {
    takeaway: "Inverse kinematics starts with a desired tool point and searches for joint values that reach it.",
    units: ["m", "degrees", "cm target error"],
    frames: ["base", "target", "tool"],
    states: {
      nominal: { label: "Solution verified", description: "Forward kinematics sends the chosen joint values back to the requested target.", value: 0, unit: "cm target error" },
      boundary: { label: "Reach limit", description: "A target near full extension may have little motion margin and poor numerical behaviour.", value: 1, unit: "cm reach margin" },
      failure: { label: "Unreachable target", description: "No joint values can reach a point beyond the total link length.", value: -10, unit: "cm reach margin" },
    },
    howToRead: [
      "Check whether the target lies inside the arm's reach.",
      "Search within declared joint limits.",
      "Run forward kinematics on the answer and measure the remaining error.",
    ],
    physicalScenario: "Mark a target on graph paper, adjust two cardboard-arm joints to touch it, and verify the angles by calculating forward again.",
    softwareBridge: bridges.kinematics,
  },
};

const keywordRules: readonly { kind: VisualKind; pattern: RegExp }[] = [
  { kind: "evidence", pattern: /\b(report|metric|evaluation|evaluate|acceptance|audit|demo|knowledge check|ship|repository|portfolio|résumé|interview|readiness|retrospective|model card|dataset card|architecture review|gate|frozen 50-trial|publish)\b/i },
  { kind: "safety", pattern: /\b(safety|safe |hazard|guardrail|workspace, force|collision monitoring|watchdog|threat|SROS2|prompt injection|adversarial|rollback|human handoff|reward hacking|command limits)\b/i },
  { kind: "hardware", pattern: /\b(hardware|actuator|motor|encoder|power|voltage|current|CAN|EtherCAT|UART|I2C|I²C|SPI|Ethernet|emergency stop|STO|Jetson|thermals|udev|device permissions)\b/i },
  { kind: "timing", pattern: /\b(time|timestamp|latency|rate|Hz|QoS|DDS|executor|callback|concurrency|deadlock|thread|jitter|priority inversion|asynchronous|backpressure|clock|replay)\b/i },
  { kind: "map", pattern: /\b(Nav2|SLAM|AMCL|map→odom|occupancy|costmap|planner|replanning|behavior tree|navigation|loop closure|pose graph|localization drift)\b/i },
  { kind: "uncertainty", pattern: /\b(uncertainty|covariance|Bayes|Kalman|EKF|odometry|fusion|distribution shift|domain randomization|system identification|sim-to-real|noise)\b/i },
  { kind: "sensor", pattern: /\b(camera|image|pixel|OpenCV|intrinsic|distortion|calibration|fiducial|detection|tracking|depth|stereo|point cloud|voxel|plane segmentation|ICP|3D bounding|6D pose|occlusion|reflective|Lidar|IMU)\b/i },
  { kind: "coordinate", pattern: /\b(vector|dot product|norm|matrix|coordinate frame|change of basis|rotation|quaternion|Euler|SO\(3\)|SE\(3\)|homogeneous transform|frame tree|handed|tf2|transform lookup)\b/i },
  { kind: "feedback", pattern: /\b(PID|feedback|open-loop|closed-loop|force|torque|mass|inertia|friction|stability|saturation|anti-windup|controller tuning)\b/i },
  { kind: "kinematics", pattern: /\b(kinematic|joint type|degree of freedom|configuration space|Jacobian|inverse kinematics|two-link arm|motion planning|RRT|OMPL|trajectory generation|MoveIt|SRDF|planning group|pick-and-place|grasp|impedance|admittance)\b/i },
  { kind: "episode", pattern: /\b(episode|demonstration|teleoperation|dataset schema|dataset mixing|dataset coverage|recording workflow|demonstration batch|video, state|data labeling|DAgger|human-in-the-loop)\b/i },
  { kind: "policy", pattern: /\b(policy|behavior cloning|ACT|diffusion|flow matching|action chunk|action horizon|RL|MDP|PPO|VLM|VLA|OpenVLA|SmolVLA|Pi0|GR00T|language grounding|cross-embodiment|LoRA|normalization|task decomposition|robot skills|world state|planner outputs|re-observe|long-horizon|semantic planning)\b/i },
  { kind: "tensor", pattern: /\b(tensor|autograd|dataloader|MLP|convolution|loss function|optimizer|overfitting|augmentation|experiment tracking|checkpoint|ONNX|TensorRT|quantize|train the first|learning curves|model baseline)\b/i },
];

function topicKey(day: CurriculumDay) {
  const slug = day.title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
  return `day-${day.id}-${slug}`;
}

function kindForDay(day: CurriculumDay): VisualKind {
  if (day.id === 1) return "system";
  if (day.id >= 2 && day.id <= 3) return "kinematics";
  if (day.id >= 4 && day.id <= 12) return "coordinate";
  if (day.id >= 13 && day.id <= 14) return "kinematics";
  if (day.id >= 15 && day.id <= 21) return day.id === 21 ? "evidence" : "feedback";

  for (const rule of keywordRules) {
    if (rule.pattern.test(day.title)) return rule.kind;
  }

  return "system";
}

function fixtureForDay(day: CurriculumDay, kind: VisualKind): Pick<DayVisualSpec, "fixture" | "math"> {
  if (day.id === 1) {
    return {
      fixture: {
        inputs: [2, 1, 2],
        outputs: [5],
        parameters: {
          sensors: 2,
          controllers: 1,
          actuators: 2,
          totalParts: 5,
        },
      },
      math: {
        formula: "robot roles = sensing parts + thinking parts + acting parts",
        latex: String.raw`N_{\mathrm{roles}}=N_{\mathrm{sense}}+N_{\mathrm{think}}+N_{\mathrm{act}}`,
        walkthrough: [
          "Count two sensing parts: a camera and a distance sensor.",
          "Count one thinking part: the controller running the program.",
          "Count two acting parts: the motors. Altogether, 2+1+2=5 parts fill the three roles.",
        ],
        result: "2 sensors + 1 controller + 2 motors = 5 counted parts in one sense–think–act loop.",
      },
    };
  }

  if (day.id === 2) {
    return {
      fixture: {
        inputs: [2, 1, 1],
        outputs: [3],
        parameters: {
          revoluteJoints: 2,
          prismaticJoints: 1,
          fixedJoints: 1,
          degreesOfFreedom: 3,
        },
      },
      math: {
        formula: "DOF = rotating joints + sliding joints; fixed joints add 0",
        latex: String.raw`\mathrm{DOF}=N_{\mathrm{rotate}}+N_{\mathrm{slide}}`,
        walkthrough: [
          "A one-axis rotating joint contributes one independent movement.",
          "A one-axis sliding joint contributes one independent movement.",
          "A fixed joint cannot move, so 2 rotating + 1 sliding + 1 fixed gives 3 DOF.",
        ],
        result: "This simple robot has 4 joints but only 3 independent movements, so it has 3 DOF.",
      },
    };
  }

  if (day.id === 3) {
    return {
      fixture: {
        inputs: [30, -20, 8],
        outputs: [3],
        parameters: {
          shoulderDegrees: 30,
          elbowDegrees: -20,
          sliderCentimetres: 8,
          configurationCoordinates: 3,
        },
      },
      math: {
        formula: "one configuration records one number for every independent movement",
        latex: String.raw`\mathbf q=[30^\circ,\,-20^\circ,\,8\ \mathrm{cm}]`,
        walkthrough: [
          "Record the shoulder angle: 30°.",
          "Record the elbow angle and slider position: −20° and 8 cm.",
          "Keep the three values in a fixed order; together they describe one complete robot configuration.",
        ],
        result: "The snapshot q = [30°, −20°, 8 cm] uses 3 coordinates for a 3-DOF robot.",
      },
    };
  }

  if (day.id === 4) {
    return {
      fixture: {
        inputs: [150, -40],
        outputs: [1.5, -0.4],
        parameters: {
          xCentimetres: 150,
          yCentimetres: -40,
          xMetres: 1.5,
          yMetres: -0.4,
        },
      },
      math: {
        formula: "metres = centimetres ÷ 100",
        latex: String.raw`\begin{aligned}x_{\mathrm m}&=\frac{x_{\mathrm{cm}}}{100}\\y_{\mathrm m}&=\frac{y_{\mathrm{cm}}}{100}\end{aligned}`,
        walkthrough: [
          "The sign gives direction: positive x is right, while negative y is down in this declared frame.",
          "Convert 150 cm to 1.5 m by dividing by 100.",
          "Convert −40 cm to −0.4 m and keep the minus sign.",
        ],
        result: "The same point is (150 cm, −40 cm) or (1.5 m, −0.4 m).",
      },
    };
  }

  if (day.id === 5) {
    const normA = 5;
    const normB = Math.sqrt(29);
    const dot = 23;
    return {
      fixture: {
        inputs: [3, 4, 5, 2],
        outputs: [dot, normA, normB],
        parameters: {
          ax: 3,
          ay: 4,
          bx: 5,
          by: 2,
          dot,
          normA,
          normB,
        },
      },
      math: {
        formula: "||A|| = √(Aₓ²+Aᵧ²),  A·B = AₓBₓ + AᵧBᵧ",
        latex: String.raw`\begin{aligned}\lVert\mathbf A\rVert&=\sqrt{A_x^2+A_y^2}\\\mathbf A\cdot\mathbf B&=A_xB_x+A_yB_y\end{aligned}`,
        walkthrough: [
          "Find A's length: √(3²+4²)=5.",
          "Multiply matching components for the dot product: 3×5 and 4×2.",
          "Add them: A·B=15+8=23. A positive result means the arrows point broadly the same way.",
        ],
        result: "A=(3,4), B=(5,2): ||A||=5, ||B||=√29, and A·B=23 (positive alignment).",
      },
    };
  }

  if (day.id === 6) {
    return {
      fixture: {
        inputs: [2, 1, 1],
        outputs: [3],
        parameters: {
          worldToRobotXMetres: 2,
          pointInRobotXMetres: 1,
          robotXAxisDirection: 1,
          pointInWorldXMetres: 3,
        },
      },
      math: {
        formula: "world position = robot origin + axis direction × local position",
        latex: String.raw`x_{\mathrm{world}}=x_{\mathrm{robot\ origin}}+s_x x_{\mathrm{local}}`,
        walkthrough: [
          "Place the robot-frame origin at x=2 m in the world.",
          "Its +x axis points the same way as world +x, so sₓ=+1.",
          "A point 1 m along robot +x is at 2+(+1)×1=3 m in the world.",
        ],
        result: "Robot-frame x=1 m becomes world-frame x=3 m when the robot origin is at 2 m.",
      },
    };
  }

  if (day.id === 7) {
    return {
      fixture: {
        inputs: [0, -1, 1, 0, 2, 0],
        outputs: [0, 2],
        parameters: {
          r00: 0,
          r01: -1,
          r10: 1,
          r11: 0,
          inputX: 2,
          inputY: 0,
          outputX: 0,
          outputY: 2,
          angleRadians: Math.PI / 2,
        },
      },
      math: {
        formula: "[[0,−1],[1,0]] · [2,0]ᵀ = [0,2]ᵀ",
        latex: String.raw`\begin{bmatrix}0&-1\\1&0\end{bmatrix}\begin{bmatrix}2\\0\end{bmatrix}=\begin{bmatrix}0\\2\end{bmatrix}`,
        walkthrough: [
          "First output: 0×2 + (−1)×0 = 0.",
          "Second output: 1×2 + 0×0 = 2.",
          "The matrix rotates (2,0) by +90° to (0,2) without changing its length.",
        ],
        result: "R₉₀(2,0) = (0,2).",
      },
    };
  }

  if (day.id === 8) {
    return {
      fixture: {
        inputs: [1, 0, Math.PI / 2, 2, 1],
        outputs: [2, 2],
        parameters: {
          inputX: 1,
          inputY: 0,
          angleRadians: Math.PI / 2,
          translationX: 2,
          translationY: 1,
          outputX: 2,
          outputY: 2,
        },
      },
      math: {
        formula: "world point = rotate(local point) + translation",
        latex: String.raw`\begin{aligned}x'&=x\cos\theta-y\sin\theta+t_x\\y'&=x\sin\theta+y\cos\theta+t_y\end{aligned}`,
        walkthrough: [
          "Rotate local point (1,0) by 90° to get (0,1).",
          "Translate it by (2,1).",
          "Add component by component: (0+2, 1+1)=(2,2).",
        ],
        result: "A 90° rotation followed by translation (2,1) maps (1,0) to (2,2).",
      },
    };
  }

  if (day.id === 9) {
    return {
      fixture: {
        inputs: [2, 1.5, 0.5],
        outputs: [3.5, 4, 0.5],
        parameters: {
          worldToBaseMetres: 2,
          baseToToolMetres: 1.5,
          pointInToolMetres: 0.5,
          worldToToolMetres: 3.5,
          pointInWorldMetres: 4,
          recoveredToolPointMetres: 0.5,
        },
      },
      math: {
        formula: "compose by adding in order; invert by subtracting the same transform",
        latex: String.raw`\begin{aligned}t_{WT}&=t_{WB}+t_{BT}\\p_W&=t_{WT}+p_T\\p_T&=p_W-t_{WT}\end{aligned}`,
        walkthrough: [
          "Compose world→base 2 m and base→tool 1.5 m to get world→tool 3.5 m.",
          "Add tool-local point 0.5 m to get world point 4 m.",
          "Invert by subtracting 3.5 m: 4−3.5=0.5 m, recovering the original local point.",
        ],
        result: "The ordered transform chain maps 0.5 m in tool to 4 m in world and back again.",
      },
    };
  }

  if (day.id === 10) {
    return {
      fixture: {
        inputs: [1, 0, 90],
        outputs: [0, 1, 0],
        parameters: {
          inputX: 1,
          inputY: 0,
          angleDegrees: 90,
          outputX: 0,
          outputY: 1,
          lengthChange: 0,
        },
      },
      math: {
        formula: "a valid rotation changes direction but preserves length",
        latex: String.raw`\lVert R\mathbf p\rVert=\lVert\mathbf p\rVert,\qquad \det(R)=1`,
        walkthrough: [
          "Start with a unit arrow (1,0) in the xy plane.",
          "Rotate it 90° around the z axis to (0,1).",
          "Both arrows have length 1; preserving length is one check for a valid rotation.",
        ],
        result: "The 90° z rotation maps (1,0) to (0,1) and changes length by 0.",
      },
    };
  }

  if (day.id === 11) {
    return {
      fixture: {
        inputs: [90],
        outputs: [Math.SQRT1_2, Math.SQRT1_2, 1],
        parameters: {
          yawDegrees: 90,
          quaternionW: Math.SQRT1_2,
          quaternionZ: Math.SQRT1_2,
          quaternionNorm: 1,
        },
      },
      math: {
        formula: "for yaw only: quaternion = [cos(yaw/2), 0, 0, sin(yaw/2)]",
        latex: String.raw`\mathbf q=\left[\cos\frac{\psi}{2},\,0,\,0,\,\sin\frac{\psi}{2}\right]`,
        walkthrough: [
          "Take half of yaw 90°: 45°.",
          "cos45° and sin45° are both about 0.707.",
          "The quaternion [0.707,0,0,0.707] has length 1, so it is normalized.",
        ],
        result: "Yaw 90° becomes quaternion [0.707, 0, 0, 0.707].",
      },
    };
  }

  if (day.id === 12) {
    return {
      fixture: {
        inputs: [1, 0, 90, 2, 1],
        outputs: [2, 2],
        parameters: {
          localX: 1,
          localY: 0,
          angleDegrees: 90,
          translationX: 2,
          translationY: 1,
          worldX: 2,
          worldY: 2,
        },
      },
      math: {
        formula: "a rigid pose contains rotation R and translation t",
        latex: String.raw`\mathbf p_{\mathrm{world}}=R\mathbf p_{\mathrm{local}}+\mathbf t`,
        walkthrough: [
          "Rotate local point (1,0) by 90° to (0,1).",
          "Use translation t=(2,1).",
          "Add them to get world point (2,2).",
        ],
        result: "The rigid pose maps local (1,0) to world (2,2).",
      },
    };
  }

  if (day.id === 14) {
    return {
      fixture: {
        inputs: [1, 1, 1, 1],
        outputs: [0, 90, 0],
        parameters: {
          link1Metres: 1,
          link2Metres: 1,
          targetXMetres: 1,
          targetYMetres: 1,
          shoulderDegrees: 0,
          elbowDegrees: 90,
          targetErrorMetres: 0,
        },
      },
      math: {
        formula: "IK asks for joint angles that place the tool at a requested target",
        latex: String.raw`\cos\theta_2=\frac{x^2+y^2-l_1^2-l_2^2}{2l_1l_2}`,
        walkthrough: [
          "The target (1,1) is √2 m from the base, inside the 2 m maximum reach.",
          "With two 1 m links, the elbow equation gives cosθ₂=0, so θ₂=90°.",
          "One valid shoulder solution is 0°; forward kinematics returns tool (1,1), so error is 0.",
        ],
        result: "For target (1,1) m, one IK solution is shoulder 0°, elbow 90°.",
      },
    };
  }

  return {
    fixture: profiles[kind].fixture,
    math: profiles[kind].math,
  };
}

export function createDayVisualSpec(day: CurriculumDay): DayVisualSpec {
  const kind = kindForDay(day);
  const profile = profiles[kind];
  const exact = fixtureForDay(day, kind);
  const beginnerProfile = day.id === 1
    ? {
        takeaway: "A robot repeats three jobs: sense what is happening, think what to do, and act on the physical world.",
        units: ["parts", "signals", "commands"] as const,
        frames: ["environment", "sensor", "controller", "actuator"] as const,
        states: {
          nominal: { label: "Complete loop", description: "The robot senses, decides, acts, and observes the result.", value: 3, unit: "roles connected" },
          boundary: { label: "Open loop", description: "The robot can act, but it does not check what actually happened.", value: 2, unit: "roles connected" },
          failure: { label: "Missing role", description: "Without sensing, thinking, or acting, the physical task cannot complete safely.", value: 1, unit: "roles connected" },
        },
        howToRead: [
          "Read from left to right: sense, then think, then act.",
          "Match sensors to eyes and ears, the controller to a brain, and actuators to muscles.",
          "Follow the return arrow: after acting, the robot must sense the changed world again.",
        ],
        physicalScenario: "A small wheeled robot sees a chair leg, decides to turn, powers its wheel motors, and checks the new view.",
        softwareBridge: {
          skill: "Web" as const,
          analogy: "A web app reads an event, runs decision logic, changes the screen, and reads the next event; a robot follows the same information loop.",
          dangerousDifference: "A wrong screen update changes pixels; a wrong actuator command can move real mass, so limits and a stop control are required.",
        },
      }
      : day.id === 2
      ? {
          takeaway: "A degree of freedom is one independent way a robot can move.",
          units: ["joints", "DOF", "count"] as const,
          frames: ["base", "joint", "link"] as const,
          states: {
            nominal: { label: "Movement counted", description: "Rotating and sliding joints are counted once; the fixed joint adds zero.", value: 3, unit: "DOF" },
            boundary: { label: "At a stop", description: "The joint still has one DOF even when it reaches the end of its allowed travel.", value: 0, unit: "movement left" },
            failure: { label: "Fixed is not motion", description: "Counting a fixed connection as a movement gives the wrong DOF.", value: 1, unit: "extra DOF" },
          },
          howToRead: [
            "Find each joint between two rigid links.",
            "Ask whether that joint rotates, slides, or is fixed.",
            "Count only independent movements; a fixed joint adds zero DOF.",
          ],
          physicalScenario: "A cardboard arm uses two paper fasteners as rotating joints and one straw as a sliding joint.",
          softwareBridge: bridges[kind],
        }
      : day.id === 3
        ? {
            takeaway: "A configuration is one complete snapshot containing one number for every independent movement.",
            units: ["deg", "cm", "configuration coordinates"] as const,
            frames: ["base", "joint_1", "joint_2", "slider"] as const,
            states: {
              nominal: { label: "Complete snapshot", description: "Every independent movement has one ordered value and a unit.", value: 3, unit: "coordinates recorded" },
              boundary: { label: "At a limit", description: "A value on its allowed boundary is valid but leaves no travel in that direction.", value: 0, unit: "margin" },
              failure: { label: "Ambiguous snapshot", description: "A missing value, unit, or fixed order does not fully describe the robot.", value: 1, unit: "missing field" },
            },
            howToRead: [
              "Choose and write one fixed order for the joints.",
              "Record one value, with its unit, for every independent movement.",
              "Imagine every allowed combination of those values as the robot's configuration space.",
            ],
            physicalScenario: "Three labelled sliders record the shoulder, elbow, and telescoping-link values of a small arm.",
            softwareBridge: bridges[kind],
          }
        : foundationVisualProfiles[day.id] ?? null;

  return {
    dayId: day.id,
    topic: day.title,
    topicKey: topicKey(day),
    kind,
    title: `${day.title}: visual field guide`,
    takeaway: beginnerProfile?.takeaway ?? profile.takeaway,
    units: beginnerProfile?.units ?? profile.units,
    frames: beginnerProfile?.frames ?? profile.frames,
    fixture: exact.fixture,
    math: exact.math,
    states: beginnerProfile?.states ?? profile.states,
    howToRead: beginnerProfile?.howToRead ?? profile.howToRead,
    legend: profile.legend,
    softwareBridge: beginnerProfile?.softwareBridge ?? bridges[kind],
    physicalScenario: beginnerProfile?.physicalScenario
      ?? `${profile.physicalScenario} This visual applies that grammar to “${day.title}”.`,
    source: day.resource,
  };
}

function finiteNumbers(value: NumericFixture) {
  return [
    ...value.inputs,
    ...value.outputs,
    ...Object.values(value.parameters),
  ].every((item) => Number.isFinite(item));
}

export type VisualValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateDayVisualSpec(
  spec: DayVisualSpec,
  expectedDay?: CurriculumDay,
): VisualValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(spec.dayId) || spec.dayId < 1 || spec.dayId > 180) {
    errors.push("dayId must be an integer from 1 through 180");
  }
  if (expectedDay && spec.dayId !== expectedDay.id) {
    errors.push(`dayId ${spec.dayId} does not match curriculum day ${expectedDay.id}`);
  }
  if (expectedDay && spec.topic !== expectedDay.title) {
    errors.push(`topic does not match curriculum title for day ${expectedDay.id}`);
  }
  if (!visualKinds.includes(spec.kind)) errors.push(`unknown visual kind: ${spec.kind}`);
  if (!spec.topicKey.startsWith(`day-${spec.dayId}-`) || spec.topicKey.length <= `day-${spec.dayId}-`.length) {
    errors.push("topicKey must contain its day ID and a non-empty slug");
  }
  if (spec.units.length === 0 || spec.units.some((unit) => unit.trim().length === 0)) {
    errors.push("at least one explicit, non-empty unit is required");
  }
  if (spec.frames.length === 0 || spec.frames.some((frame) => frame.trim().length === 0)) {
    errors.push("at least one explicit, non-empty frame is required");
  }
  if (
    spec.fixture.inputs.length === 0 ||
    spec.fixture.outputs.length === 0 ||
    Object.keys(spec.fixture.parameters).length === 0 ||
    !finiteNumbers(spec.fixture)
  ) {
    errors.push("canonical numeric fixture must have finite inputs, outputs, and parameters");
  }
  for (const stateName of ["nominal", "boundary", "failure"] as const) {
    const state = spec.states[stateName];
    if (!state || !state.label.trim() || !state.description.trim() || !state.unit.trim()) {
      errors.push(`${stateName} state must include label, description, and unit`);
    } else if (!Number.isFinite(state.value)) {
      errors.push(`${stateName} state value must be finite`);
    }
  }
  if (
    !spec.math.formula.trim()
    || !spec.math.latex.trim()
    || spec.math.walkthrough.length < 3
    || !spec.math.result.trim()
  ) {
    errors.push("math visual requires readable and LaTeX formulas, at least three steps, and a result");
  }
  if (spec.howToRead.length < 3 || spec.howToRead.some((step) => !step.trim())) {
    errors.push("visual requires at least three non-empty how-to-read steps");
  }
  if (
    !spec.softwareBridge.skill ||
    !spec.softwareBridge.analogy.trim() ||
    !spec.softwareBridge.dangerousDifference.trim()
  ) {
    errors.push("software bridge and dangerous difference are required");
  }
  if (spec.legend.length < 4 || spec.legend.some((item) => !item.label.trim() || !item.meaning.trim())) {
    errors.push("input, process, output, and warning legend entries are required");
  }
  if (!spec.physicalScenario.trim()) errors.push("physical scenario is required");

  return { valid: errors.length === 0, errors };
}

export const allDayVisuals: readonly DayVisualSpec[] = curriculumDays.map(createDayVisualSpec);

export function validateAllDayVisuals(
  visuals: readonly DayVisualSpec[] = allDayVisuals,
  days: readonly CurriculumDay[] = curriculumDays,
): VisualValidationResult {
  const errors: string[] = [];

  if (visuals.length !== 180) errors.push(`expected 180 visual specs, received ${visuals.length}`);
  if (days.length !== 180) errors.push(`expected 180 curriculum days, received ${days.length}`);

  const seenIds = new Set<number>();
  const seenKeys = new Set<string>();
  visuals.forEach((spec, index) => {
    const result = validateDayVisualSpec(spec, days[index]);
    errors.push(...result.errors.map((error) => `day ${spec.dayId}: ${error}`));
    if (seenIds.has(spec.dayId)) errors.push(`duplicate visual dayId: ${spec.dayId}`);
    if (seenKeys.has(spec.topicKey)) errors.push(`duplicate visual topicKey: ${spec.topicKey}`);
    seenIds.add(spec.dayId);
    seenKeys.add(spec.topicKey);
  });

  for (let id = 1; id <= 180; id += 1) {
    if (!seenIds.has(id)) errors.push(`missing visual dayId: ${id}`);
  }

  const day1 = visuals.find((visual) => visual.dayId === 1);
  if (
    !day1 ||
    day1.kind !== "system" ||
    day1.fixture.parameters.totalParts !== 5
  ) {
    errors.push("day 1 robot-anatomy fixture must count 5 sense-think-act parts");
  }

  const day2 = visuals.find((visual) => visual.dayId === 2);
  if (
    !day2 ||
    day2.kind !== "kinematics" ||
    day2.fixture.parameters.degreesOfFreedom !== 3
  ) {
    errors.push("day 2 joint fixture must count 3 independent degrees of freedom");
  }

  const day3 = visuals.find((visual) => visual.dayId === 3);
  if (!day3 || day3.fixture.parameters.configurationCoordinates !== 3) {
    errors.push("day 3 configuration fixture must record 3 coordinates");
  }

  const day5 = visuals.find((visual) => visual.dayId === 5);
  if (
    !day5 ||
    day5.fixture.parameters.dot !== 23 ||
    day5.fixture.parameters.normA !== 5 ||
    Math.abs(day5.fixture.parameters.normB - Math.sqrt(29)) > 1e-12
  ) {
    errors.push("day 5 vector fixture must use normA=5, normB=√29, and dot=23");
  }

  const day7 = visuals.find((visual) => visual.dayId === 7);
  if (
    !day7 ||
    day7.fixture.parameters.outputX !== 0 ||
    day7.fixture.parameters.outputY !== 2
  ) {
    errors.push("day 7 matrix fixture must satisfy R90·(2,0)=(0,2)");
  }

  return { valid: errors.length === 0, errors };
}

const moduleValidation = validateAllDayVisuals();
if (!moduleValidation.valid) {
  throw new Error(`Invalid lesson visual specifications:\n${moduleValidation.errors.join("\n")}`);
}
