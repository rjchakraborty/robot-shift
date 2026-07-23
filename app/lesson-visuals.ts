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
  if (day.id <= 6) return "coordinate";
  if (day.id >= 8 && day.id <= 14) return "kinematics";
  if (day.id >= 15 && day.id <= 21) return day.id === 21 ? "evidence" : "feedback";

  for (const rule of keywordRules) {
    if (rule.pattern.test(day.title)) return rule.kind;
  }

  return "system";
}

function fixtureForDay(day: CurriculumDay, kind: VisualKind): Pick<DayVisualSpec, "fixture" | "math"> {
  if (day.id === 1) {
    const normA = 5;
    const normB = Math.sqrt(29);
    const dot = 23;
    const cosine = dot / (normA * normB);
    return {
      fixture: {
        inputs: [3, 4, 5, 2],
        outputs: [dot, normA, normB, cosine],
        parameters: {
          ax: 3,
          ay: 4,
          bx: 5,
          by: 2,
          dot,
          normA,
          normB,
          cosine,
        },
      },
      math: {
        formula: "A·B = AₓBₓ + AᵧBᵧ,  cosθ = (A·B)/(||A||·||B||)",
        walkthrough: [
          "Multiply matching components: 3×5 and 4×2.",
          "Add them: A·B = 15+8 = 23.",
          "Compute ||A||=5 and ||B||=√29, then divide: cosθ=23/(5√29)≈0.854.",
        ],
        result: "A=(3,4), B=(5,2): dot=23, cosθ≈0.854, so θ≈31.4°.",
      },
    };
  }

  if (day.id === 2) {
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
        walkthrough: [
          "First output: 0×2 + (−1)×0 = 0.",
          "Second output: 1×2 + 0×0 = 2.",
          "The matrix rotates (2,0) by +90° to (0,2) without changing its length.",
        ],
        result: "R₉₀(2,0) = (0,2).",
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

  return {
    dayId: day.id,
    topic: day.title,
    topicKey: topicKey(day),
    kind,
    title: `${day.title}: visual field guide`,
    takeaway: profile.takeaway,
    units: profile.units,
    frames: profile.frames,
    fixture: exact.fixture,
    math: exact.math,
    states: profile.states,
    howToRead: profile.howToRead,
    legend: profile.legend,
    softwareBridge: bridges[kind],
    physicalScenario: `${profile.physicalScenario} This visual applies that grammar to “${day.title}”.`,
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
  if (!spec.math.formula.trim() || spec.math.walkthrough.length < 3 || !spec.math.result.trim()) {
    errors.push("math visual requires a formula, at least three steps, and a result");
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
    day1.fixture.parameters.dot !== 23 ||
    Math.abs(day1.fixture.parameters.cosine - 23 / (5 * Math.sqrt(29))) > 1e-12
  ) {
    errors.push("day 1 vector fixture must use dot=23 and cos=23/(5√29)");
  }

  const day2 = visuals.find((visual) => visual.dayId === 2);
  if (
    !day2 ||
    day2.fixture.parameters.outputX !== 0 ||
    day2.fixture.parameters.outputY !== 2
  ) {
    errors.push("day 2 matrix fixture must satisfy R90·(2,0)=(0,2)");
  }

  return { valid: errors.length === 0, errors };
}

const moduleValidation = validateAllDayVisuals();
if (!moduleValidation.valid) {
  throw new Error(`Invalid lesson visual specifications:\n${moduleValidation.errors.join("\n")}`);
}
