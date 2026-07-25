import {
  STARTER_RUNTIME_EVIDENCE,
  type ChapterLearningGuide,
} from "../chapter-guide-types";

export const chapterGuides01To09: readonly ChapterLearningGuide[] = [
  {
    week: 1,
    mission: {
      name: "The Parcel-Sorting Desk Robot",
      opening: [
        "A small parcel station has one awkward problem: boxes reach the end of a desk, but the cardboard sorting arm cannot yet describe what it senses or how it may move. You have been asked to turn that mute mechanism into an inspectable robot on paper. The station manager does not want equations pasted over uncertainty. She wants a causal map showing which part observes the parcel, which part decides, which joint permits motion, and which measurement proves that the arm actually changed the parcel’s route.",
        "Across this chapter, the Parcel-Sorting Desk Robot gains its language one physical need at a time. A ruler gives positions and units, arrows describe intended movement, attached maps prevent frame confusion, and small number grids describe repeatable actions. Each day revisits the same arm and parcel instead of starting an unrelated puzzle. By the finish, another engineer should be able to inspect the drawings, reproduce the arithmetic, deliberately introduce a sign or handedness fault, and explain exactly why the wrong parcel lane would be selected.",
      ],
      finishLine:
        "A labelled paper arm and Node.js audit show the complete sense–decide–act–observe loop, two independent joints, six configurations, framed parcel coordinates, a checked vector calculation, and a matrix action whose predicted output matches the drawing.",
    },
    learningContract: {
      whyNow:
        "Every later controller, transform, planner, and model assumes that physical parts, quantities, directions, units, and frames already have unambiguous meanings.",
      ignoreForNow:
        "Ignore calculus, 3D motion, motor wiring, ROS 2, and powered hardware. This chapter needs only safe household mechanisms, paper, measurement, and small arithmetic.",
      unlocks:
        "A reliable vocabulary for transforms, forward kinematics, feedback, robot descriptions, sensor messages, and every later evidence report.",
      evidence:
        "Save the annotated robot loop, joint and configuration sheet, measured coordinate grid, vector calculations, frame drawing, matrix table, starter output, and one planted-failure explanation.",
    },
    environment: {
      baseline:
        "Paper, ruler, squared paper, a modern browser, and the repository-supported Node.js 22.13.0 or newer. No ROS 2, simulator, network service, or powered mechanism is required.",
      compatibility:
        "The paper work is platform-independent. Run the starter with the repository Node.js baseline; other JavaScript runtimes are outside this chapter’s checked path.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node --version`, confirm it is at least 22.13.0, save the starter as `week-01-parcel-sorter.mjs`, and run `node week-01-parcel-sorter.mjs`.",
      driftRisk: "low",
    },
    starter: {
      title: "Audit one framed parcel move",
      fileName: "week-01-parcel-sorter.mjs",
      language: "javascript",
      code: String.raw`const mission = "parcel-sorter";
const parts = ["sensor", "controller", "actuator", "feedback"];
const frame = { name: "table", unit: "m", origin: [0, 0] };
const move = [3, 4];
const norm = Math.hypot(move[0], move[1]);
const quarterTurn = [
  [0, -1],
  [1, 0],
];
const apply = (matrix, vector) => matrix.map(
  (row) => row[0] * vector[0] + row[1] * vector[1],
);
const turned = apply(quarterTurn, move);
const loopComplete = parts.at(-1) === "feedback";
const numericContract = frame.origin.concat(move, quarterTurn.flat()).every(Number.isFinite);
if (frame.unit !== "m" || !loopComplete || !numericContract ||
    turned[0] !== -4 || turned[1] !== 3) throw new Error("invalid contract");
console.log("mission=" + mission);
console.log("parts=" + parts.join(">"));
console.log("move=(3,4) norm=" + norm.toFixed(2) + "m");
console.log("quarterTurn=(" + turned.join(",") + ")");
console.log("status=PASS");`,
      run: "node week-01-parcel-sorter.mjs",
      expectedOutput: String.raw`mission=parcel-sorter
parts=sensor>controller>actuator>feedback
move=(3,4) norm=5.00m
quarterTurn=(-4,3)
status=PASS`,
      plantedFailure:
        "Change the quarter-turn matrix to [[0,1],[-1,0]]. The output becomes (4,-3), revealing a reversed rotation/handedness convention even though the arithmetic still runs.",
    },
    dayThreads: [
      {
        dayId: 1,
        bridge:
          "The Parcel-Sorting Desk Robot begins as a silent cardboard body beside an incoming box. Trace the parcel reflection into the distance sensor, the reading into a threshold decision, the decision into a motor request, and the wheel or arm motion back into a fresh observation. This opening establishes the causal spine that every later drawing and calculation must serve.",
        whyNow: "The project needs a complete physical loop before it needs mathematical notation.",
        ignoreForNow: "Do not choose motors, write control code, or claim that a sent command moved anything.",
        unlocks: "A responsibility map for diagnosing missing data, missing power, missing motion, or missing feedback.",
      },
      {
        dayId: 2,
        bridge:
          "The sorter can sense a box, but its cardboard diverter is still described as one vague object. Inspect its base, shoulder strip, elbow strip, and tool flap. The Parcel-Sorting Desk Robot now needs joints that state permitted and forbidden motion, because tomorrow’s possible shapes depend on today’s independent coordinates rather than on the number of motors drawn beside them.",
        whyNow: "Configuration cannot be recorded until links, joint types, limits, and independent freedoms are known.",
        ignoreForNow: "Ignore torque, motor selection, and closed-loop joint control; keep the arm unpowered.",
        unlocks: "A defensible count of the coordinates needed to describe every sorter shape.",
      },
      {
        dayId: 3,
        bridge:
          "Two hinge angles now describe the Parcel-Sorting Desk Robot, so record six safe arm shapes and trace where the tool flap lands. The same parcel lane may be reached with an elbow-up or elbow-down shape; that difference matters near the desk edge. Treat the symbols as labels for measured hinge settings, not as an invitation to skip the physical arm or its limits.",
        whyNow: "The sorter must separate its complete shape from the smaller set of tool locations it can reach.",
        ignoreForNow: "Ignore collision planning algorithms and formal topology proofs; observe wrapping and boundaries physically.",
        unlocks: "Configuration-space reasoning for inverse kinematics, collision checking, and MoveIt later in the course.",
      },
      {
        dayId: 4,
        bridge:
          "The station manager marks the two parcel lanes on a desk grid, but a bare ‘5’ cannot tell the Parcel-Sorting Desk Robot where to place anything. Choose an origin, positive directions, and one unit, then predict and measure moves that cross zero. This gives yesterday’s hinge records and tool traces an honest numerical language instead of unexplained symbols.",
        whyNow: "Every position, limit, error, and later transform depends on signed coordinates and compatible units.",
        ignoreForNow: "Ignore sensor uncertainty models beyond recording ruler resolution and an honest discrepancy.",
        unlocks: "Measured vectors, framed positions, and unit-safe robot messages.",
      },
      {
        dayId: 5,
        bridge:
          "A parcel lands three grid squares right and four squares beyond the diverter. The Parcel-Sorting Desk Robot needs more than two unrelated coordinates: it needs an arrow from its current tool point to the target lane. Draw that error, calculate its components and length, and compare its direction with the arm’s forward arrow before any planner is allowed to use it.",
        whyNow: "Motion errors and directions are vectors, so components, norm, and alignment must become observable now.",
        ignoreForNow: "Ignore 3D vector products, gradients, and velocity control.",
        unlocks: "Transformable errors, distance checks, dot-product alignment, and later Jacobian intuition.",
      },
      {
        dayId: 6,
        bridge:
          "The camera is taped to the Parcel-Sorting Desk Robot while the parcel lanes are painted on the table. Both report valid numbers, yet their axes turn differently when the arm moves. Attach and name both maps, describe one parcel in each, and plant a reflected axis set. The exercise turns yesterday’s arrow into a statement whose frame can no longer be silently guessed.",
        whyNow: "Coordinates from different physical maps cannot be compared or added until their frames are explicit.",
        ignoreForNow: "Ignore transform matrices and timestamp buffers; first make origins, axes, units, and handedness visible.",
        unlocks: "Safe frame conversion, tf2 reasoning, and camera-to-robot calibration.",
      },
      {
        dayId: 7,
        bridge:
          "The sorter’s final paper controller must apply the same arrow action every time a parcel reaches the lane marker. Build identity, scale, reflection, and quarter-turn cards, then run the Parcel-Sorting Desk Robot’s target vector through each row by row. Finish by showing why a plain 2×2 card cannot add a fixed translation and by reproducing the checked Node.js output.",
        whyNow: "Matrices package repeatable component rules and complete the week’s physical-to-numerical dictionary.",
        ignoreForNow: "Ignore large matrices, eigenvalues, and homogeneous coordinates until the next mission needs them.",
        unlocks: "Rotation matrices, rigid transforms, forward kinematics, and numerical inverse kinematics.",
      },
    ],
  },
  {
    week: 2,
    mission: {
      name: "The Camera-Crane Recovery",
      opening: [
        "The parcel station adds a tiny camera crane above the sorting desk. During its first rehearsal, the camera points at the correct box but reports the wrong room location, and an operator cannot tell whether the fault came from angle units, transform order, an orientation convention, or the arm model. You inherit the paper arm from Chapter 1 and must rebuild the spatial chain deliberately, starting with a marked point on a tray and ending with a bounded attempt to place the camera over a requested target.",
        "The Camera-Crane Recovery is one investigation, not seven unrelated formula drills. Every day preserves the same base, two links, camera mount, desk frame, and measurement sheet. New mathematics earns its place by resolving the next observation: a turn, a frame path, a valid 3D orientation, a complete pose, a predicted tool point, and finally a solver trace. The mission finishes only when forward calculations round-trip, reachable targets meet a declared residual, unreachable targets stop within budget, and no result is mistaken for a safe hardware trajectory.",
      ],
      finishLine:
        "A two-link camera-crane notebook predicts three measured tool poses, validates rotation and SE(3) invariants, composes and inverts the frame chain, and returns explicit SUCCESS or UNREACHABLE IK evidence with limits and residuals.",
    },
    learningContract: {
      whyNow:
        "The course is about to use frames and motion everywhere; learners need one checked spatial model before software can hide convention mistakes.",
      ignoreForNow:
        "Ignore dynamics, collision planning, motor commands, and symbolic proofs. Work with rigid paper geometry, bounded calculations, and named conventions.",
      unlocks:
        "tf2, URDF, calibration, state estimation, MoveIt planning, and every sensor-to-tool relationship.",
      evidence:
        "Save tray measurements, transform-chain diagrams, SO(3) and quaternion checks, SE(3) point/direction tests, FK residuals, bounded IK traces, starter output, and one convention failure.",
    },
    environment: {
      baseline:
        "Paper frames, ruler, calculator or browser notebook, and repository-supported Node.js 22.13.0 or newer. No ROS 2 or powered arm is required.",
      compatibility:
        "Calculations use column vectors, radians in code, ROS-style quaternion field order only when explicitly named, and metres for geometry. Other conventions require an isolated conversion test.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Save the starter as `week-02-camera-crane.mjs`, run `node week-02-camera-crane.mjs`, and verify the FK point, identity round trip, and unreachable status exactly.",
      driftRisk: "low",
    },
    starter: {
      title: "Check camera-crane geometry and bounded reach",
      fileName: "week-02-camera-crane.mjs",
      language: "javascript",
      code: String.raw`const mission = "camera-crane";
const links = [1, 1];
const joints = [0, Math.PI / 2];
const fk = ([a, b]) => [
  links[0] * Math.cos(a) + links[1] * Math.cos(a + b),
  links[0] * Math.sin(a) + links[1] * Math.sin(a + b),
];
const point = fk(joints);
const translation = [0.3, -0.2];
const forward = point.map((value, index) => value + translation[index]);
const backward = forward.map((value, index) => value - translation[index]);
const roundTripError = Math.hypot(
  backward[0] - point[0],
  backward[1] - point[1],
);
const target = [3, 0];
const reachable = Math.hypot(target[0], target[1]) <= links[0] + links[1];
const numericContract = links.concat(joints, translation, target).every(Number.isFinite);
if (!numericContract || links.some((value) => value <= 0) ||
    roundTripError > 1e-9) throw new Error("invalid geometry");
console.log("mission=" + mission);
console.log("fk=(" + point.map((value) => value.toFixed(3)).join(",") + ")m");
console.log("roundTripError=" + roundTripError.toFixed(6) + "m");
console.log("ikStatus=" + (reachable ? "READY_TO_SOLVE" : "UNREACHABLE"));
console.log("status=PASS");`,
      run: "node week-02-camera-crane.mjs",
      expectedOutput: String.raw`mission=camera-crane
fk=(1.000,1.000)m
roundTripError=0.000000m
ikStatus=UNREACHABLE
status=PASS`,
      plantedFailure:
        "Apply translation before rotation in the physical tray exercise, or reverse only the translation when inverting a rotated transform. The identity round-trip check must then expose a nonzero residual.",
    },
    dayThreads: [
      {
        dayId: 8,
        bridge:
          "The Camera-Crane Recovery starts with a sticker on the camera tray. Turn the tray, carry it across the desk, and predict the sticker’s room coordinate before measuring. The crane’s first failure report used degrees inside a radians-based function and changed operation order while debugging, so today’s record must name angle unit, source frame, destination frame, and rotate-then-translate convention.",
        whyNow: "A rigid 2D move is the smallest complete case that joins angles, sine, cosine, rotation, and translation.",
        ignoreForNow: "Ignore 3D orientation and multi-link arms until this known tray case passes.",
        unlocks: "A trustworthy transform edge for the crane’s frame tree.",
      },
      {
        dayId: 9,
        bridge:
          "The tray check passes, but the Camera-Crane Recovery now spans room, crane base, shoulder, and camera frames. Draw one directed transform per neighboring pair and walk the path with matching labels. Reverse the route using a true rigid inverse, then test a physical point forward and back. This is the diagnostic that distinguishes a valid number from a valid frame-chain result.",
        whyNow: "The camera location depends on several local relationships whose order and direction must be checkable.",
        ignoreForNow: "Ignore tf2 APIs and buffering; prove the static chain with paper and arithmetic first.",
        unlocks: "Time-aware transform lookup and robot-model audits in later ROS chapters.",
      },
      {
        dayId: 10,
        bridge:
          "A technician rotates the Camera-Crane Recovery’s cardboard axis triad and accidentally sketches a mirror image that still preserves lengths. Test the orientation with perpendicular unit axes, transpose-inverse behavior, and determinant +1. The mission needs this gate because a reflected camera frame can make a plausible overlay while reversing the physical handedness used by every later pose.",
        whyNow: "The frame chain needs a rule for accepting real rigid rotations and rejecting reflections or distorted matrices.",
        ignoreForNow: "Ignore arbitrary matrix decompositions and numerical optimization beyond a documented tolerance.",
        unlocks: "Valid 3D orientations for quaternions and SE(3).",
      },
      {
        dayId: 11,
        bridge:
          "The crane logger stores roll, pitch, and yaw, while the ROS-shaped message sketch expects quaternion fields. Recreate one Camera-Crane Recovery orientation in both languages, demonstrate the Euler coordinate singularity with nested paper rings, and map named quaternion components rather than array positions. The physical camera never locks; only one descriptive coordinate system loses a unique direction.",
        whyNow: "The mission must exchange orientation without confusing a representation singularity, axis order, or component order.",
        ignoreForNow: "Ignore quaternion interpolation and full attitude-control dynamics.",
        unlocks: "A normalized orientation block that can enter a complete rigid pose.",
      },
      {
        dayId: 12,
        bridge:
          "Position and orientation are now separately correct, but the Camera-Crane Recovery still passes them through different code paths. Build one SE(3) transform, apply it to marked camera points with homogeneous coordinate one, and apply it to free directions with coordinate zero. Check that pairwise distances survive and that translation never changes a direction vector.",
        whyNow: "The crane needs one inspectable operation for a rigid 3D pose before link transforms can be chained.",
        ignoreForNow: "Ignore calibration fitting and noisy measurements; use a known rigid placement.",
        unlocks: "Serial-arm forward kinematics and later camera extrinsic calibration.",
      },
      {
        dayId: 13,
        bridge:
          "The Camera-Crane Recovery finally reconnects its base, shoulder, elbow, and camera mount. Measure both links, declare joint zeros and signs, then predict three camera positions with forward kinematics before moving the cardboard arm. Record the residual instead of correcting the formula until link length, zero offset, backlash, measurement, and frame conventions have each been inspected.",
        whyNow: "The mission can calculate its camera pose only after every rigid transform and joint convention is trustworthy.",
        ignoreForNow: "Ignore inverse solving and obstacle avoidance; today joint values are known inputs.",
        unlocks: "A forward model that can verify every inverse-kinematics candidate.",
      },
      {
        dayId: 14,
        bridge:
          "The operator now requests a camera target rather than supplying joint angles. Treat the Camera-Crane Recovery’s Jacobian as a local nudge map, estimate its columns with bounded finite differences, and attempt one reachable and one impossible target. Each iteration must respect joint limits, clamp the update, recompute FK residual, and stop on success, poor progress, or iteration budget.",
        whyNow: "A bounded inverse solver closes the chapter’s path from desired camera position back to joint configuration.",
        ignoreForNow: "Ignore collision-free trajectory execution; an IK answer is geometry, not permission to move.",
        unlocks: "MoveIt kinematics, local Servo reasoning, and explicit solver-failure handling.",
      },
    ],
  },
  {
    week: 3,
    mission: {
      name: "The Cold-Storage Door Tuning",
      opening: [
        "A powered cold-storage door is outside this chapter’s lab, but its safe digital twin has a familiar incident: the controller requests a quick close, the simulated door overshoots, rebounds, and spends too long at its command limit. The maintenance team has only a success video and three unlabeled gain values. Your job is to rebuild the evidence from first principles—position, velocity, acceleration, effort, body limits, feedback sign, sampling, latency, noise, saturation, and recovery—without claiming that a desktop model proves the real door safe.",
        "The Cold-Storage Door Tuning keeps one setpoint change and one simulated mechanism throughout the week. Each lesson explains the next piece of the same incident instead of tuning by folklore. You will predict a response, change one condition, preserve requested and applied commands, and measure the consequences. The final report must let another engineer reproduce the nominal run, a wrong-sign run, a delayed run, and a saturation/windup run. It also places PID on a future roadmap from measured system identification to state-space models, LQR, MPC, and trajectory optimization without pretending those methods are mastered here.",
      ],
      finishLine:
        "A deterministic simulated door produces labelled setpoint, state, error, P/I/D terms, requested/applied commands, timing, saturation, and recovery plots plus a fixed test table and an evidence-limited PASS or NEEDS REVISION verdict.",
    },
    learningContract: {
      whyNow:
        "The learner has geometry but not physical response; control software becomes meaningful only after motion, effort, delay, and actuator authority are separated.",
      ignoreForNow:
        "Ignore powered hardware, formal frequency-domain proofs, motor selection, and certified safety functions. Use a bounded digital model and state every simplification.",
      unlocks:
        "Timing-aware C++ loops, ros2_control, simulator controllers, navigation tracking, contact control, and production validation metrics.",
      evidence:
        "Save the motion table, physical-limit notes, open/closed-loop traces, discrete PID calculation, timing/noise comparison, anti-windup recovery, starter output, and final tuning report.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer and a browser or plotting tool for a deterministic simulated mechanism. No powered actuator is part of the checked path.",
      compatibility:
        "Any later Python, C++, or simulator port must preserve the same units, sample period, clamp, initial state, input sequence, and acceptance calculations before results are compared.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Save the starter as `week-03-cold-storage-door.mjs`, run it with Node.js, and compare every logged PID term and saturation result with the expected output.",
      driftRisk: "low",
    },
    starter: {
      title: "Inspect one bounded discrete PID update",
      fileName: "week-03-cold-storage-door.mjs",
      language: "javascript",
      code: String.raw`const mission = "cold-storage-door";
const target = 1.2;
const measured = 0.4;
const previousError = 1.2;
const dt = 0.1;
const integral = 0.12;
const gains = { p: 2, i: 0.5, d: 0.1 };
const error = target - measured;
const pTerm = gains.p * error;
const iTerm = gains.i * integral;
const dTerm = gains.d * (error - previousError) / dt;
const requested = pTerm + iTerm + dTerm;
const limit = 1;
const applied = Math.max(-limit, Math.min(limit, requested));
const numericContract = [
  target, measured, previousError, dt, integral, limit, ...Object.values(gains),
].every(Number.isFinite);
if (!numericContract || dt <= 0 || limit <= 0 || error <= 0 ||
    !Number.isFinite(requested)) throw new Error("invalid control update");
console.log("mission=" + mission);
console.log("error=" + error.toFixed(3));
console.log("requested=" + requested.toFixed(3));
console.log("applied=" + applied.toFixed(3));
console.log("saturated=" + String(applied !== requested));
console.log("status=PASS");`,
      run: "node week-03-cold-storage-door.mjs",
      expectedOutput: String.raw`mission=cold-storage-door
error=0.800
requested=1.260
applied=1.000
saturated=true
status=PASS`,
      plantedFailure:
        "Reverse the error to measured minus target. The proportional correction changes sign and drives the simulated door away from its setpoint, exposing a positive-feedback convention fault.",
    },
    dayThreads: [
      {
        dayId: 15,
        bridge:
          "Begin the Cold-Storage Door Tuning by turning its position log into a motion story. Mark the reference axis, sample times, and units; calculate interval velocity and acceleration; then separate those kinematic observations from the force and torque that might have caused them. The incident cannot be diagnosed while ‘moving fast’ mixes position, speed, acceleration, and effort.",
        whyNow: "The tuning report needs quantities with distinct meanings and SI units before any controller term is calculated.",
        ignoreForNow: "Ignore the controller gains and mechanism model until the measured motion is described correctly.",
        unlocks: "A physical response trace that can be connected to inertia, friction, and command authority.",
      },
      {
        dayId: 16,
        bridge:
          "The same Cold-Storage Door Tuning run is repeated with a heavier simulated panel and sticky guide. Compare mass, rotational inertia, friction, gravity load, and the drive’s finite effort instead of blaming software immediately. Calculate one simplified acceleration bound, then list every omitted effect. The team must see why raising a gain cannot manufacture torque that the actuator does not possess.",
        whyNow: "Controller behavior cannot be judged without the plant’s resistance, losses, and command limits.",
        ignoreForNow: "Ignore detailed motor curves and structural engineering; retain a declared bounded toy model.",
        unlocks: "A defensible distinction between control error and insufficient physical authority.",
      },
      {
        dayId: 17,
        bridge:
          "The Cold-Storage Door Tuning incident began with a timed command that never checked the resulting position. Draw that open-loop path, then close it with a fresh measurement, target-minus-measurement error, and another bounded decision. Plant a reversed encoder sign and show how software that appears to subtract error can still create physically positive feedback.",
        whyNow: "PID only makes sense inside a correctly signed and repeatedly measured closed loop.",
        ignoreForNow: "Ignore integral and derivative terms; establish a proportional baseline and stop condition first.",
        unlocks: "A minimal feedback loop whose individual PID contributions can be inspected.",
      },
      {
        dayId: 18,
        bridge:
          "With feedback sign proven, the Cold-Storage Door Tuning can add three limited opinions: present error, accumulated bias, and changing error. Calculate one discrete update by hand, log P, I, and D separately, then reproduce it in the starter. Change only one gain at a time and keep units and sample period visible so copied ‘magic gains’ cannot enter the report.",
        whyNow: "The mission needs an implementable controller whose internal cause is visible in every command.",
        ignoreForNow: "Ignore automated tuning and complex plant identification.",
        unlocks: "Controlled experiments on sampling, noise, delay, saturation, and recovery.",
      },
      {
        dayId: 19,
        bridge:
          "The simulated door behaves well at one update rate, then oscillates when sensor messages arrive late and noisy. For the Cold-Storage Door Tuning, preserve source time, arrival time, actual interval, data age, and derivative contribution. Compare fixed rate, added delay, jitter, and noise without changing gains, and explain why a faster requested loop is not proof of fresher decisions.",
        whyNow: "Digital feedback acts on sampled, delayed evidence, so timing can invalidate otherwise sensible gains.",
        ignoreForNow: "Ignore operating-system real-time scheduling until Chapter 4; measure the current runtime honestly.",
        unlocks: "Deadline, jitter, and stale-data requirements for production control software.",
      },
      {
        dayId: 20,
        bridge:
          "During the original Cold-Storage Door Tuning failure, the command stayed at its maximum while hidden integral state continued growing. Record requested and applied output separately, compare an unprotected integrator with conditional integration, and inspect the response after the simulated obstruction disappears. The clamp limits one output; anti-windup changes the memory that would otherwise prolong the wrong demand.",
        whyNow: "The week needs a controlled failure that proves command limits and controller state are different safety concerns.",
        ignoreForNow: "Ignore claims of certified stopping; a software clamp is only one tested boundary.",
        unlocks: "A saturation and recovery metric that belongs in the final acceptance report.",
      },
      {
        dayId: 21,
        bridge:
          "Close the Cold-Storage Door Tuning as a release review rather than a winning plot. Freeze plant, payload, initial state, setpoint, timing, gains, limits, noise, delay, and pass criteria; rerun nominal and planted faults. Report rise, overshoot, settling band, steady error, saturation fraction, recovery, and every failed trial so another engineer reaches the same evidence-limited verdict.",
        whyNow: "A repeatable report is the only honest bridge from controller intuition to engineering acceptance.",
        ignoreForNow: "Ignore physical-door approval; simulation evidence cannot validate wiring, load, braking, or independent safety.",
        unlocks: "A tested control-loop contract ready for deterministic C++ implementation.",
      },
    ],
  },
  {
    week: 4,
    mission: {
      name: "The Night-Shift Sensor Gateway",
      opening: [
        "The cold-storage team now needs a reliable gateway between a simulated encoder stream and the bounded door controller. Its previous prototype compiled, but an early return leaked a device handle, a background task outlived the object it borrowed, one stale packet became a fresh command, and the only crash could not be reproduced. You are asked to turn those symptoms into explicit ownership, narrow value contracts, a target-based build, least-privilege device access, measured timing, and a replayable regression path.",
        "The Night-Shift Sensor Gateway stays intentionally small: source sample, validator, filter, controller, command limiter, and fake sink. That fixed path lets every software habit connect to one observable outcome. Resource lifetime must survive failures, live and replay inputs must use the same calculations, timing claims must include tails and misses, and cancellation must reach a terminal state before dependencies disappear. The finish line is not ‘build succeeded’; it is a clean repository that another engineer can configure, test, fault, replay, and shut down from documented commands.",
      ],
      finishLine:
        "A clean-build gateway repository processes normal, malformed, stale, overload, saturation, sink-failure, replay, and cancellation cases with explicit ownership, bounded queues, structured events, timing tails, and no claim beyond the tested fake sink.",
    },
    learningContract: {
      whyNow:
        "Robot software is about to cross Linux devices, threads, ROS callbacks, and controller deadlines; ordinary happy-path code is not enough.",
      ignoreForNow:
        "Ignore powered I/O, vendor drivers, formal hard-real-time guarantees, and distributed ROS behavior. Keep the source and sink simulated.",
      unlocks:
        "A production-shaped software boundary for ROS nodes, ros2_control plugins, sensor health, deterministic replay, and CI.",
      evidence:
        "Save ownership traces, interface tests, clean CMake build output, permission/network diagnosis, timing distribution, sanitizer fault, replay fixture, CI result, starter output, and bounded shutdown evidence.",
    },
    environment: {
      baseline:
        "Ubuntu 24.04 is the course Linux target for device, udev, process, and timing exercises. The dependency-free starter runs with repository-supported Node.js 22.13.0 or newer and does not make a real-time claim.",
      compatibility:
        "macOS or another desktop may run the starter and pure calculations, but udev, Linux scheduling, device permissions, and target timing require a qualified Linux environment. Compiler and CMake versions must be recorded per run.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "On the teaching path, record `uname -a`, `node --version`, compiler version, and CMake version; then run `node week-04-night-gateway.mjs` and compare exact output.",
      driftRisk: "medium",
    },
    starter: {
      title: "Replay bounded sensor outcomes",
      fileName: "week-04-night-gateway.mjs",
      language: "javascript",
      code: String.raw`const mission = "night-shift-gateway";
const nowMs = 120;
const maxAgeMs = 50;
const commandLimit = 1;
const samples = [
  { stampMs: 110, value: 0.4, workMs: 4 },
  { stampMs: 100, value: 1.8, workMs: 7 },
  { stampMs: 20, value: 0.2, workMs: 12 },
];
let stale = 0;
let limited = 0;
const outcomes = samples.map((sample) => {
  const ageMs = nowMs - sample.stampMs;
  if (![sample.stampMs, sample.value, sample.workMs].every(Number.isFinite) ||
      ageMs < 0 || sample.workMs < 0) throw new Error("invalid sample");
  if (ageMs > maxAgeMs) {
    stale += 1;
    return { status: "STALE", command: 0 };
  }
  const command = Math.max(-commandLimit, Math.min(commandLimit, sample.value));
  if (command !== sample.value) limited += 1;
  return { status: "OK", command };
});
if (outcomes.length !== samples.length) throw new Error("lost replay input");
console.log("mission=" + mission);
console.log("processed=" + outcomes.length);
console.log("stale=" + stale);
console.log("limited=" + limited);
console.log("worstMs=" + samples.reduce((worst, sample) => Math.max(worst, sample.workMs), 0));
console.log("status=PASS");`,
      run: "node week-04-night-gateway.mjs",
      expectedOutput: String.raw`mission=night-shift-gateway
processed=3
stale=1
limited=1
worstMs=12
status=PASS`,
      plantedFailure:
        "Delete the source timestamp check. The 100 ms-old sample then produces a nonzero command, proving that successful parsing and bounded magnitude do not make stale evidence safe.",
    },
    dayThreads: [
      {
        dayId: 22,
        bridge:
          "The Night-Shift Sensor Gateway first failed during an early return, so begin by assigning one owner to every file, device handle, lock, and worker lifetime. Borrowers may inspect the resource but may not silently prolong it. Trace normal, error, and cancellation paths, then prove the worker stops and joins before the resource owner is destroyed.",
        whyNow: "Every later boundary depends on deterministic cleanup and valid borrower lifetime.",
        ignoreForNow: "Ignore shared ownership unless two independent lifetimes are proven to need it.",
        unlocks: "A gateway that can fail or cancel without leaking resources or using dead objects.",
      },
      {
        dayId: 23,
        bridge:
          "With ownership stable, the Night-Shift Sensor Gateway must stop passing unexplained doubles between hardware, validation, and control. Introduce values whose names preserve unit, timestamp, validity, and command meaning; place effects behind narrow adapters; and replay recorded samples through the same production calculation. A fake source tests policy, not the real device boundary.",
        whyNow: "Clear value and interface contracts prevent unit, validity, and dependency mistakes before concurrency obscures them.",
        ignoreForNow: "Ignore broad plugin frameworks and universal abstractions.",
        unlocks: "Small production targets that can share tested logic without copying source into tests.",
      },
      {
        dayId: 24,
        bridge:
          "The gateway’s components now have boundaries, but the old build depends on global flags and a dirty directory. Model the Night-Shift Sensor Gateway as library, executable, and test targets with explicit usage requirements and a checked-in preset. Rebuild from a clean tree so missing dependencies and accidental generated state become visible rather than being repaired by repeated deletion.",
        whyNow: "Reproducible artifacts need a target graph before Linux deployment and CI can be trusted.",
        ignoreForNow: "Ignore packaging for multiple operating systems; qualify one course path first.",
        unlocks: "A one-command clean build used by sanitizer, replay, timing, and CI gates.",
      },
      {
        dayId: 25,
        bridge:
          "The Night-Shift Sensor Gateway reaches Linux and receives permission denied on its simulated serial endpoint. Inspect process identity, device-node owner and group, stable attributes, listener, interface, address, and port before changing anything. Draft the narrow udev rule and semantic name the deployment needs; never replace diagnosis with permanent root execution or a world-writable device.",
        whyNow: "A correct program cannot communicate when operating-system identity and endpoint ownership are wrong.",
        ignoreForNow: "Ignore powered sensors and production network exposure; use a spare or simulated endpoint.",
        unlocks: "A least-privilege, repeatable device and network bring-up contract.",
      },
      {
        dayId: 26,
        bridge:
          "The gateway reads successfully, yet the controller misses its deadline during a logging burst. Measure the Night-Shift Sensor Gateway with a monotonic clock, absolute schedule, bounded queue, and explicit cancellation. Record period, execution, source age, tail, maximum, and miss count under load; then diagram the lock path that could create priority inversion before assigning any elevated scheduling priority.",
        whyNow: "Robot usefulness depends on bounded arrival, processing, and shutdown—not average speed.",
        ignoreForNow: "Ignore hard-real-time claims and machine-wide scheduler changes.",
        unlocks: "Evidence for callback budgets, watchdog thresholds, and real-time risk reviews.",
      },
      {
        dayId: 27,
        bridge:
          "A recorded packet now crashes the Night-Shift Sensor Gateway only on the seventeenth event. Preserve that trigger, run the appropriate sanitizer, profile the measured deadline path, and store revision, configuration, order, timestamps, and terminal outcome with the fixture. Add the repaired case to the clean CI gate while stating what the exercised replay does not cover.",
        whyNow: "The project needs a causal path from one failure through detector and repair to a repeatable regression.",
        ignoreForNow: "Ignore claims that a clean sanitizer or replay proves absence of all races and hardware faults.",
        unlocks: "A reviewable defect artifact and a gate that prevents the same exercised failure from returning.",
      },
      {
        dayId: 28,
        bridge:
          "Ship the Night-Shift Sensor Gateway as a flight recorder, not a single demo. Freeze its operating contract, run normal, malformed, stale, overload, saturation, sink-failure, cancellation, and replay scenarios, and preserve every result. The README must lead a clean reviewer through build, test, run, fault, metrics, and limitations while requested, limited, delivered, and observed states remain separately visible.",
        whyNow: "The week’s engineering practices matter only when they survive one integrated acceptance path.",
        ignoreForNow: "Ignore real actuator acceptance; the fake sink proves only the declared software scenarios.",
        unlocks: "A trustworthy component baseline for the ROS 2 distributed system.",
      },
    ],
  },
  {
    week: 5,
    mission: {
      name: "The Aisle Seven Watchdog",
      opening: [
        "A warehouse simulation loses updates from the robot assigned to Aisle Seven. The fleet screen still shows the node name, a reliable topic is configured, and the last numeric value looks normal, yet nobody can tell whether the data is fresh or whether cancellation reached the command path. You inherit a small ROS 2 system and must separate installed packages from the live graph, define typed interfaces, choose communication lifetimes, expose QoS and discovery evidence, and make callback scheduling failures reproducible.",
        "The Aisle Seven Watchdog becomes the chapter’s continuing distributed-system story. Telemetry, command action, watchdog, and operator status are added in deliberate stages to one namespaced graph. Every interface carries physical meaning and time; every long task has terminal and cancellation semantics; every retry and recovery is bounded. The course path remains ROS 2 Jazzy. Lyrical is compatibility-only until a separate full-stack matrix passes, so no learner should mix tutorial commands or binaries midway through this mission.",
      ],
      finishLine:
        "One launch entry point starts a namespaced Jazzy graph whose typed telemetry, command action, QoS, callback groups, lifecycle readiness, stale-data watchdog, cancellation timeline, injected faults, and bounded recovery are independently inspectable.",
    },
    learningContract: {
      whyNow:
        "The deterministic gateway must now cooperate with concurrent processes and machines without losing physical meaning, freshness, ownership, or terminal outcomes.",
      ignoreForNow:
        "Ignore Gazebo physics, robot geometry, navigation, SROS2 configuration, and powered commands. Use harmless numeric messages and simulated command inhibition.",
      unlocks:
        "URDF/tf2 integration, ros2_control, Gazebo bridges, Nav2 actions, fleet health, and production operator traces.",
      evidence:
        "Save the intended and observed graph, interface definitions, QoS/discovery matrix, cancellation trace, deadlock reproduction and repair, lifecycle launch evidence, watchdog fault table, starter output, and architecture note.",
    },
    environment: {
      baseline:
        "Ubuntu 24.04 with ROS 2 Jazzy is the golden course path. Use one sourced Jazzy underlay and one clean workspace overlay; this chapter does not require Gazebo. The dependency-free starter runs with repository-supported Node.js 22.13.0 or newer.",
      compatibility:
        "ROS 2 Lyrical is an isolated compatibility target only. Do not mix Lyrical, Kilted, rolling, or Jazzy packages in one workspace; promote only after the same interfaces, builds, tests, QoS, timing, and behavior pass.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `source /opt/ros/jazzy/setup.bash`, confirm `ROS_DISTRO=jazzy`, run `ros2 doctor --report`, and verify the installed demo node package before creating the chapter workspace.",
      driftRisk: "high",
    },
    starter: {
      title: "Classify a stale heartbeat before commanding",
      fileName: "week-05-aisle-seven-watchdog.mjs",
      language: "javascript",
      code: String.raw`const mission = "aisle-seven-watchdog";
const expectedPeriodMs = 100;
const timeoutMs = 180;
const nowMs = 700;
const heartbeats = [
  { sequence: 21, sourceMs: 300 },
  { sequence: 22, sourceMs: 400 },
  { sequence: 23, sourceMs: 450 },
];
const latest = heartbeats.at(-1);
if (!latest || !heartbeats.every((item) =>
  Number.isFinite(item.sequence) && Number.isFinite(item.sourceMs)
)) throw new Error("invalid heartbeat");
const ageMs = nowMs - latest.sourceMs;
if (ageMs < 0) throw new Error("future heartbeat");
const sequenceAdvances = heartbeats.every(
  (item, index) => index === 0 || item.sequence > heartbeats[index - 1].sequence,
);
const health = ageMs > timeoutMs || !sequenceAdvances ? "STALE" : "HEALTHY";
const requestedCommand = 0.6;
const appliedCommand = health === "HEALTHY" ? requestedCommand : 0;
const recoverySamples = Math.ceil(timeoutMs / expectedPeriodMs) + 1;
console.log("mission=" + mission);
console.log("ageMs=" + ageMs);
console.log("health=" + health);
console.log("command=" + appliedCommand.toFixed(2));
console.log("recoverySamples=" + recoverySamples);
console.log("status=PASS");`,
      run: "node week-05-aisle-seven-watchdog.mjs",
      expectedOutput: String.raw`mission=aisle-seven-watchdog
ageMs=250
health=STALE
command=0.00
recoverySamples=3
status=PASS`,
      plantedFailure:
        "Replace the source timestamp with the local receipt time. Regularly replayed old heartbeats then look fresh and the simulated command remains enabled.",
    },
    dayThreads: [
      {
        dayId: 29,
        bridge:
          "The Aisle Seven Watchdog starts by distinguishing its Jazzy installation, workspace, packages, executables, processes, nodes, and current graph. Draw the planned telemetry, command, monitor, and operator nodes, then stop one process and compare runtime evidence with files still present on disk. Record the sourced underlay and overlay so a second terminal cannot silently use another environment.",
        whyNow: "A distributed fault cannot be diagnosed while build artifacts and live participants are treated as the same layer.",
        ignoreForNow: "Ignore Lyrical migration beyond a separate compatibility note.",
        unlocks: "A stable graph on which message and task contracts can be designed.",
      },
      {
        dayId: 30,
        bridge:
          "The graph exists, but the Aisle Seven Watchdog receives an unlabelled number that could be battery level, wheel speed, or age. Define a telemetry message with source timestamp, frame where relevant, unit, validity, bounded fields, and semantic version. Run two subscribers and prove that publish rate, arrival, source age, and consumer processing are separate observations.",
        whyNow: "QoS and watchdog decisions are meaningless when the message’s physical contract is ambiguous.",
        ignoreForNow: "Ignore custom serialization optimization and broad internal object dumps.",
        unlocks: "Typed continuous evidence that can be checked for freshness and compatibility.",
      },
      {
        dayId: 31,
        bridge:
          "The operator asks the Aisle Seven robot to inspect a shelf, a task too long for a blocking service. Model it as an action with goal identity, feedback, timeout, terminal result, and cancellation handshake. Trace cancel request, acceptance, command inhibition, observed simulated stop, and final canceled state; keep uncertain retries idempotent rather than duplicating physical intent.",
        whyNow: "Long-running robot work needs explicit progress and terminal semantics before the watchdog can supervise it.",
        ignoreForNow: "Ignore navigation-specific action fields; use a harmless numeric task.",
        unlocks: "Cancelable missions for Nav2, manipulation, and fleet orchestration.",
      },
      {
        dayId: 32,
        bridge:
          "Telemetry is typed, yet the Aisle Seven Watchdog is silent across two containers. Inspect domain, discovery, middleware, network path, endpoint type, and requested/offered QoS before changing code. Compare best-effort freshness with reliable delivery under bounded queues, then plant one incompatibility and one domain mismatch so their different symptoms remain available as regression evidence.",
        whyNow: "Communication policy and discovery must be observable before silence can be classified correctly.",
        ignoreForNow: "Ignore security claims; a domain ID is not authentication or encryption.",
        unlocks: "A defensible QoS table and network diagnosis for sensors, state, and commands.",
      },
      {
        dayId: 33,
        bridge:
          "A timer inside the Aisle Seven Watchdog makes a synchronous request and waits forever because its completion callback shares the same mutually exclusive group. Reproduce the hang with a bounded timeout, diagram executor threads and groups, then repair the circular wait using asynchronous flow or compatible ownership. Measure callback duration, queue age, starvation, and shutdown after the repair.",
        whyNow: "A healthy graph and compatible QoS cannot compensate for callbacks that never receive execution.",
        ignoreForNow: "Ignore adding threads as a default fix; first expose dependencies and shared state.",
        unlocks: "A schedulable watchdog whose timing and concurrency assumptions are reviewable.",
      },
      {
        dayId: 34,
        bridge:
          "The Aisle Seven Watchdog must now start twice for two robot namespaces without publishing commands before dependencies are ready. Use parameters, relative names, lifecycle states, and one launch description; choose process or composition boundaries from latency and fault containment. Inspect effective configuration and transition order rather than accepting a successful launch command as proof of readiness.",
        whyNow: "Reusable deployment needs explicit identity, configuration, lifecycle, and observability before fault policy is enabled.",
        ignoreForNow: "Ignore composing every component for speed; shared-process failure is part of the decision.",
        unlocks: "A repeatable multi-instance bring-up path for robot models and simulation.",
      },
      {
        dayId: 35,
        bridge:
          "Finish the Aisle Seven Watchdog by defining heartbeat source, period, clock, identity, timeout, state machine, simulated response, and guarded recovery. Inject process loss, frozen source time, callback starvation, QoS mismatch, restart, and unsafe automatic resume. The final architecture note must show why graph presence, reliable delivery, and a ROS application watchdog are each weaker than independent physical safety.",
        whyNow: "The chapter needs one integrated failure path that connects interfaces, scheduling, lifecycle, evidence, and bounded recovery.",
        ignoreForNow: "Ignore calling this an emergency stop or safety-rated controller.",
        unlocks: "A production-shaped health boundary for the simulated robot body.",
      },
    ],
  },
  {
    week: 6,
    mission: {
      name: "The Warehouse Arm Identity Audit",
      opening: [
        "A simulated warehouse arm looks correct in RViz, but its camera appears twenty-five metres away, one elbow turns around the wrong axis, and the operator display animates desired commands instead of measured state. The XML parser reports success, so the team needs a stronger audit. You will give every rigid body, joint, sensor, transform, hardware interface, controller, and state signal one inspectable identity, then challenge the model with known poses, physical ranges, timestamps, lifecycle transitions, and planted faults.",
        "The Warehouse Arm Identity Audit uses one simple mobile manipulator throughout the chapter. URDF defines the physical tree, Xacro removes justified repetition, tf2 carries relationships through time, and ros2_control separates measured state from bounded command requests. The mission remains on ROS 2 Jazzy with mock or simulated hardware. Lyrical and rolling documentation may inform a future compatibility review, but they cannot silently redefine the checked interface or command behavior inside this chapter.",
      ],
      finishLine:
        "A pinned Jazzy model expands deterministically, validates physical ranges and known poses, exposes a single-owner time-aware frame tree, transitions mock ros2_control hardware safely, distinguishes desired and measured state, and detects three planted faults with reproducible checks.",
    },
    learningContract: {
      whyNow:
        "The ROS graph needs a trustworthy physical model and command/state boundary before simulation, perception, planning, or hardware can use its names.",
      ignoreForNow:
        "Ignore detailed mesh artistry, powered actuation, full MoveIt planning, and vendor buses. Use primitives, conservative values, and mock hardware.",
      unlocks:
        "Gazebo simulation, sensor transforms, controller integration, calibration, Nav2 footprints, MoveIt scenes, and honest operator state.",
      evidence:
        "Save expanded model, validation output, known-pose table, frame ownership diagram, timestamp failures, interface and lifecycle traces, desired-versus-measured log, starter output, and three-fault audit.",
    },
    environment: {
      baseline:
        "Ubuntu 24.04 with ROS 2 Jazzy is the golden path. Use Jazzy URDF, tf2, robot_state_publisher, ros2_control interfaces, and mock or simulated hardware. The dependency-free starter runs with repository-supported Node.js 22.13.0 or newer.",
      compatibility:
        "Lyrical, Kilted, rolling, or vendor-specific plugins belong in isolated build and behavior matrices. Do not copy configuration from another distribution until names, lifecycle, interfaces, timing, and tests pass on Jazzy.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Source `/opt/ros/jazzy/setup.bash`, confirm `ROS_DISTRO=jazzy`, and verify `robot_state_publisher`, `xacro`, and `controller_manager` resolve before expanding the model.",
      driftRisk: "high",
    },
    starter: {
      title: "Audit an aligned frame-chain round trip",
      fileName: "week-06-arm-identity.mjs",
      language: "javascript",
      code: String.raw`const mission = "warehouse-arm-identity";
const add = (left, right) => left.map(
  (value, index) => value + right[index],
);
const subtract = (left, right) => left.map(
  (value, index) => value - right[index],
);
const mapToBase = [2.0, 0.5];
const baseToCamera = [0.3, 0.2];
const cameraPoint = [1.0, 0.0];
const mapToCamera = add(mapToBase, baseToCamera);
const mapPoint = add(mapToCamera, cameraPoint);
const recoveredCameraPoint = subtract(mapPoint, mapToCamera);
const residual = Math.hypot(
  recoveredCameraPoint[0] - cameraPoint[0],
  recoveredCameraPoint[1] - cameraPoint[1],
);
const numericContract = mapToBase.concat(baseToCamera, cameraPoint).every(Number.isFinite);
const physicalRangeOk =
  numericContract && mapToCamera.every((value) => Math.abs(value) < 10);
if (!physicalRangeOk || residual > 1e-9) throw new Error("invalid frame chain");
console.log("mission=" + mission);
console.log("mapToCamera=(" + mapToCamera.map((v) => v.toFixed(1)).join(",") + ")m");
console.log("mapPoint=(" + mapPoint.map((v) => v.toFixed(1)).join(",") + ")m");
console.log("roundTripError=" + residual.toFixed(6) + "m");
console.log("rangeCheck=" + (physicalRangeOk ? "PASS" : "FAIL"));
console.log("status=PASS");`,
      run: "node week-06-arm-identity.mjs",
      expectedOutput: String.raw`mission=warehouse-arm-identity
mapToCamera=(2.3,0.7)m
mapPoint=(3.3,0.7)m
roundTripError=0.000000m
rangeCheck=PASS
status=PASS`,
      plantedFailure:
        "Enter the 300 mm camera offset as 300 metres. The round trip still cancels algebraically, but the independent physical-range assertion fails and exposes the scale error.",
    },
    dayThreads: [
      {
        dayId: 36,
        bridge:
          "The Warehouse Arm Identity Audit begins with a measured parent-child tree, not a detailed mesh. Name every link and joint, then keep visual, collision, and inertial descriptions separate. Place the arm in a known zero pose, check axes and limits, and trace each origin to a measurement so a parser success cannot hide a metre/millimetre or parent-frame error.",
        whyNow: "Every transform, controller, and planner depends on the model’s topology, geometry, and joint conventions.",
        ignoreForNow: "Ignore photorealistic meshes and precise dynamics until primitive geometry and physical ranges pass.",
        unlocks: "A reviewable robot model that Xacro and downstream tools can consume.",
      },
      {
        dayId: 37,
        bridge:
          "The arm model now repeats wheels, fingers, and sensor mounts, so the Warehouse Arm Identity Audit introduces Xacro only where variation is real. Expand every macro, verify unique names and units, and inspect generated output. Record SRDF planning groups as a later semantic layer; never use them to hide a wrong URDF axis, mass, limit, or collision body.",
        whyNow: "Reuse must reduce maintenance without making the physical model opaque.",
        ignoreForNow: "Ignore full MoveIt configuration; keep SRDF as an explicitly deferred semantic preview.",
        unlocks: "Deterministic model generation and named components ready for frame publication.",
      },
      {
        dayId: 38,
        bridge:
          "Attach frames to the Warehouse Arm Identity Audit’s base, joints, camera, and tool, then assign one publisher to each parent-child edge. Separate fixed mounts from moving joints and transform a known camera point into the map frame. A pretty tree is insufficient: origins, axes, direction, units, owner, and inverse checks must tell the same physical story.",
        whyNow: "Sensor and tool numbers cannot be compared until the model becomes a single-owner transform tree.",
        ignoreForNow: "Ignore delayed measurements until the static and current-pose relationships pass.",
        unlocks: "A frame chain that can be challenged at the measurement timestamp.",
      },
      {
        dayId: 39,
        bridge:
          "Replay an image captured while the Warehouse Arm Identity Audit was moving. Request the camera-to-base transform at the image time, then produce connected, disconnected, past-extrapolation, and future-extrapolation cases. Preserve stamp, source, target, buffer bounds, and timeout; never replace a failed lookup with identity or the latest pose merely to keep the pipeline running.",
        whyNow: "Correct frame names can still produce false geometry when the transform belongs to another instant.",
        ignoreForNow: "Ignore clock synchronization across real devices; use one declared simulated or recorded clock.",
        unlocks: "Time-valid sensor plumbing for Gazebo, vision, calibration, and state estimation.",
      },
      {
        dayId: 40,
        bridge:
          "The model is geometrically coherent, so connect the Warehouse Arm Identity Audit to a mock ros2_control component. List every state and command interface with units, then trace configure, activate, read, update, write, deactivate, and error paths. Measure the cycle budget and show the bounded response to a stale read or failed write without calling lifecycle management a hardware safety function.",
        whyNow: "Controllers need a device-independent, lifecycle-aware boundary between measured state and requested effort or motion.",
        ignoreForNow: "Ignore vendor motor APIs and powered output.",
        unlocks: "Controller Manager integration and simulation-backed command testing.",
      },
      {
        dayId: 41,
        bridge:
          "Activate one controller on the Warehouse Arm Identity Audit and follow desired joint value through claimed interfaces to measured state, JointState publication, and robot_state_publisher transforms. Plant an interface conflict and a wrong joint name. The operator display must show request, measurement, age, and error separately instead of animating the command as if it were observed motion.",
        whyNow: "The system needs one traceable distinction between what software requested and what the modeled body reported.",
        ignoreForNow: "Ignore advanced trajectory planning and real actuator tracking.",
        unlocks: "Ground-truth comparisons and controller evidence inside Gazebo.",
      },
      {
        dayId: 42,
        bridge:
          "Close the Warehouse Arm Identity Audit with three independent faults: scale, direction, and timestamp coverage. Predict each symptom, inject one at a time, and select the decisive physical-range, known-pose, or temporal check before changing code. Rerun topology, interfaces, lifecycle, desired-versus-measured, and frame tests after every repair so an isolated fix does not break the trusted baseline.",
        whyNow: "A layered audit is stronger than XML validity, one RViz screenshot, or one moving joint.",
        ignoreForNow: "Ignore real mass, backlash, wiring, loaded motion, and physical commissioning claims.",
        unlocks: "A model/control baseline ready for a repeatable simulated laboratory.",
      },
    ],
  },
  {
    week: 7,
    mission: {
      name: "The Rainy-Day Simulator Lab",
      opening: [
        "The warehouse team cannot test outdoors during a week of heavy rain, so the validated robot model moves into a Gazebo laboratory. A previous demo looked convincing but mixed wall time with simulation time, bridged every available topic, used ground truth inside the algorithm, and lost the configuration that produced its one good run. You must rebuild the laboratory as a controlled experiment whose world, model, physics, clock, bridge directions, controllers, sensors, noise, recording, and reset are all explicit.",
        "The Rainy-Day Simulator Lab follows one differential-drive robot through nominal travel and deliberate sensor failures. The golden path is ROS 2 Jazzy with Gazebo Harmonic; Jetty, Kilted, Lyrical, and rolling examples are compatibility research only. Ground truth is reserved for evaluation, while the robot consumes only interfaces it could plausibly have in reality. The mission finishes with a scenario matrix that another engineer can start from one command, replay from MCAP, and judge without accepting visual motion as proof.",
      ],
      finishLine:
        "A pinned Jazzy/Harmonic world launches one differential-drive robot, verifies bridge and ros2_control boundaries against ground truth, records sensor contracts and MCAP evidence, detects frozen or degraded sensors, and reproduces nominal plus controlled-fault verdicts.",
    },
    learningContract: {
      whyNow:
        "The model and controllers need a repeatable world where success and failure can be measured before expensive or hazardous hardware work.",
      ignoreForNow:
        "Ignore photorealism, real weather, hardware safety certification, and autonomous navigation. Control one modeled world and small fault set.",
      unlocks:
        "Nav2 integration, perception fixtures, state-estimation replay, SIL tests, and evidence-backed sim-to-real gap statements.",
      evidence:
        "Save version and clock contract, world/model hashes, bridge map, command/state/ground-truth comparison, sensor table, noise and timestamp faults, MCAP manifest, health transitions, starter output, and scenario report.",
    },
    environment: {
      baseline:
        "Ubuntu 24.04, ROS 2 Jazzy, and Gazebo Harmonic form the golden simulator path. Use Jazzy-compatible ros_gz and gz_ros2_control packages from one qualified environment. The dependency-free starter runs with repository-supported Node.js 22.13.0 or newer.",
      compatibility:
        "Gazebo Jetty and later ROS distributions belong in isolated compatibility branches. Never mix Jetty install instructions, Kilted package docs, or rolling controller configuration into the Harmonic/Jazzy acceptance run.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Source Jazzy, confirm `ROS_DISTRO=jazzy`, record `gz sim --versions`, and verify `ros_gz_bridge` plus the qualified gz_ros2_control package resolve before launching the chapter world.",
      driftRisk: "high",
    },
    starter: {
      title: "Check simulated drive geometry and frozen time",
      fileName: "week-07-rainy-day-lab.mjs",
      language: "javascript",
      code: String.raw`const mission = "rainy-day-simulator";
const wheelRadius = 0.1;
const wheelSeparation = 0.5;
const leftRadPerSec = 4;
const rightRadPerSec = 6;
const linear = wheelRadius * (rightRadPerSec + leftRadPerSec) / 2;
const yawRate = wheelRadius * (rightRadPerSec - leftRadPerSec) / wheelSeparation;
const simulatedSeconds = 20;
const wallSeconds = 30;
const realTimeFactor = simulatedSeconds / wallSeconds;
const sourceStamps = [0, 0.05, 0.1, 0.1];
const geometryValid = [
  wheelRadius, wheelSeparation, leftRadPerSec, rightRadPerSec,
  simulatedSeconds, wallSeconds,
].every(Number.isFinite) && wheelRadius > 0 && wheelSeparation > 0 && wallSeconds > 0;
if (!geometryValid) throw new Error("invalid simulation contract");
const timeProgresses = sourceStamps.every((stamp, index) =>
  Number.isFinite(stamp) && stamp >= 0 && stamp <= simulatedSeconds &&
  (index === 0 || stamp > sourceStamps[index - 1])
);
const health = timeProgresses ? "HEALTHY" : "DEGRADED";
console.log("mission=" + mission);
console.log("linear=" + linear.toFixed(3) + "m/s");
console.log("yawRate=" + yawRate.toFixed(3) + "rad/s");
console.log("rtf=" + realTimeFactor.toFixed(3));
console.log("sensor=" + health);
console.log("status=PASS");`,
      run: "node week-07-rainy-day-lab.mjs",
      expectedOutput: String.raw`mission=rainy-day-simulator
linear=0.500m/s
yawRate=0.400rad/s
rtf=0.667
sensor=DEGRADED
status=PASS`,
      plantedFailure:
        "Check only callback arrival intervals and delete the source-stamp progression test. Replayed frozen measurements then look healthy even though simulated observation time has stopped.",
    },
    dayThreads: [
      {
        dayId: 43,
        bridge:
          "Open the Rainy-Day Simulator Lab by freezing the Jazzy/Harmonic pairing, world, robot, physics step, clock source, and seed. Compare simulation time with wall time and calculate achieved real-time factor, then change only one physics setting. A faster animation or higher RTF is throughput evidence, not proof that contact, inertia, friction, or controller behavior is physically credible.",
        whyNow: "Every later sensor and controller result depends on a controlled model and a correctly interpreted clock.",
        ignoreForNow: "Ignore Jetty migration and real-world accuracy claims.",
        unlocks: "A stable laboratory in which command and sensor boundaries can be measured.",
      },
      {
        dayId: 44,
        bridge:
          "Spawn the warehouse robot inside the Rainy-Day Simulator Lab and map every boundary: Gazebo world, Gazebo Transport, ros_gz bridge, ROS 2 graph, ros2_control, wheels, odometry, and evaluation truth. Calculate the differential-drive result before commanding the simulation, then plant one radius and one sign fault separately and compare command, joint state, odometry, and ground truth.",
        whyNow: "A moving model becomes useful only when interfaces and ideal geometry agree with observed simulated motion.",
        ignoreForNow: "Ignore autonomous planners and dynamic obstacles.",
        unlocks: "A verified mobile base ready to carry imperfect sensors.",
      },
      {
        dayId: 45,
        bridge:
          "Mount lidar, camera, IMU, and encoders on named Rainy-Day Simulator Lab frames. For each, record message type, field meaning, unit, source stamp, expected rate, valid/invalid values, and known-pose observation. Keep CameraInfo beside images and reserve Gazebo truth for scoring; an algorithm must never receive privileged pose merely because the simulator makes it convenient.",
        whyNow: "Fault injection is meaningful only after every nominal sensor contract is explicit.",
        ignoreForNow: "Ignore learned perception and sensor fusion.",
        unlocks: "A set of measurable streams whose noise, delay, and dropout can be distinguished.",
      },
      {
        dayId: 46,
        bridge:
          "The Rainy-Day Simulator Lab now adds one imperfection at a time: random spread, bias, rate reduction, delay, and frozen source time. Preserve seed, original measurement, arrival time, and consumer age. Compare precision with accuracy and repeat fixed seeds plus a declared seed set, while admitting that a seed does not freeze callback order, GPU behavior, or every plugin.",
        whyNow: "Consumers need named imperfection models and timestamps before they can make health decisions.",
        ignoreForNow: "Ignore claims that Gaussian noise alone makes a sensor realistic.",
        unlocks: "Repeatable bad cases for recording and degraded-mode tests.",
      },
      {
        dayId: 47,
        bridge:
          "Record the Rainy-Day Simulator Lab’s selected topics to MCAP with a manifest that names types, QoS, duration, expected counts, transform and clock coverage, configuration, and result assertion. Replay nominal and planted failures more than once. The bag captures messages, not the complete world, code, launch order, external state, or scheduling, so deterministic claims must include those dependencies.",
        whyNow: "The chapter needs durable evidence and a repeatable input path before health and regression behavior are judged.",
        ignoreForNow: "Ignore recording every topic without a question or storage budget.",
        unlocks: "A replay fixture for sensor health, navigation, perception, and state estimation.",
      },
      {
        dayId: 48,
        bridge:
          "Build the Rainy-Day Simulator Lab’s sensor monitor as a state machine that checks presence, timestamp progression, age, rate, plausibility, transform availability, and cross-sensor consistency. Inject frozen timestamps and valid-looking stale values, then verify the simulated command response and guarded recovery. A red dashboard without a changed command path is observation, not degraded behavior.",
        whyNow: "The lab must convert measured evidence quality into an explicit bounded operational state.",
        ignoreForNow: "Ignore calling software health logic a certified stop system.",
        unlocks: "Fault verdicts that the final scenario matrix can score objectively.",
      },
      {
        dayId: 49,
        bridge:
          "Close the Rainy-Day Simulator Lab with frozen initial conditions, named oracle, fault schedule, reset, artifacts, and limitations. Run nominal, delay, frozen-stamp, dropout, scale, and bridge-direction rows one cause at a time before combined stress. Keep failed trials and show exactly which modeled conditions passed, which terminal state occurred, and which hardware, site, and safety claims remain unverified.",
        whyNow: "A controlled matrix turns the simulator from a visual demo into a regression laboratory.",
        ignoreForNow: "Ignore sim-to-real success claims and manual scene editing during acceptance runs.",
        unlocks: "A qualified base and evidence harness for resilient navigation.",
      },
    ],
  },
  {
    week: 8,
    mission: {
      name: "The Medicine-Cart Route Trial",
      opening: [
        "A simulated medicine cart must travel from the pharmacy to a ward without entering a staff-only zone, colliding with a trolley, or continuing after an operator cancels. The Rainy-Day Simulator Lab provides its base, lidar, odometry, clock, and fault harness, but navigation adds a longer chain: map, global correction, local continuity, costmaps, path proposal, repeated control, lifecycle readiness, recovery, and terminal result. You will integrate that chain first and keep every authority and failure observable.",
        "The Medicine-Cart Route Trial deliberately previews two deeper subjects without pretending to finish them. A small A* starter explains graph cost and heuristic choice before Nav2 plugins; a physical uncertainty preview distinguishes estimator confidence from measured error before Chapter 11 teaches probability, covariance, Bayes filtering, and EKF diagnostics. This spiral order lets a programmer ship a bounded navigation artifact now while knowing exactly which theory is deferred. The chapter ends with fixed scenarios, hard gates, cancellation-to-stop evidence, and an honest simulation-only verdict.",
      ],
      finishLine:
        "A Jazzy/Harmonic Nav2 and SLAM package maps or loads one world, localizes with single transform ownership, enforces footprint and keepout policy, navigates fixed goals, handles obstruction and cancellation, and passes a reproducible scenario matrix with no command-integrity hard-gate violation.",
    },
    learningContract: {
      whyNow:
        "The simulator is ready for an integration-first autonomy artifact, and navigation provides a motivating target before estimator theory is studied deeply.",
      ignoreForNow:
        "Ignore derivations of covariance, Bayes filters, EKF Jacobians, and every Nav2 plugin option. Preview A* and uncertainty, then use one pinned stack with measured limits.",
      unlocks:
        "A portfolio-grade autonomy loop plus concrete failure evidence that Chapter 11 can later explain and improve.",
      evidence:
        "Save frame and transform ownership, map provenance, A* starter trace, costmap policy, planner/controller/action timelines, lifecycle and recovery paths, cancellation stopping evidence, metrics with denominators, fault artifacts, and gate verdict.",
    },
    environment: {
      baseline:
        "Ubuntu 24.04 with ROS 2 Jazzy, Gazebo Harmonic, a Jazzy-qualified Nav2 stack, and SLAM Toolbox is the golden integration path. The dependency-free starter runs with repository-supported Node.js 22.13.0 or newer.",
      compatibility:
        "Unversioned Nav2 pages and later distributions are reference material, not runtime authority. Migrate only in an isolated matrix that repeats mapping, localization, planning, control, cancellation, lifecycle, recovery, and metric gates.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Source Jazzy, confirm the Harmonic simulation baseline, and verify `nav2_bringup`, `slam_toolbox`, and the selected localization package resolve before launching the frozen world.",
      driftRisk: "high",
    },
    starter: {
      title: "Preview A* on a frozen medicine-cart grid",
      fileName: "week-08-medicine-cart-astar.mjs",
      language: "javascript",
      code: String.raw`const mission = "medicine-cart";
const start = [0, 0];
const goal = [4, 4];
const blocked = new Set(["1,1", "1,2", "2,2", "3,2"]);
const key = ([x, y]) => x + "," + y;
const heuristic = ([x, y]) => Math.abs(goal[0] - x) + Math.abs(goal[1] - y);
if (blocked.has(key(start)) || blocked.has(key(goal)) || heuristic(start) !== 8) throw new Error("invalid search contract");
const open = [{ point: start, cost: 0, path: [key(start)] }];
const best = new Map([[key(start), 0]]);
const moves = [[1, 0], [0, 1], [-1, 0], [0, -1]];
let solved; const expanded = [];
while (open.length > 0) {
  open.sort((a, b) =>
    (a.cost + heuristic(a.point)) - (b.cost + heuristic(b.point))
    || a.path.join(">").localeCompare(b.path.join(">")));
  const current = open.shift();
  expanded.push(key(current.point));
  if (key(current.point) === key(goal)) { solved = current; break; }
  for (const [dx, dy] of moves) {
    const next = [current.point[0] + dx, current.point[1] + dy];
    const name = key(next);
    const inside = next.every((value) => value >= 0 && value <= 4);
    const nextCost = current.cost + 1;
    if (!inside || blocked.has(name) || nextCost >= (best.get(name) ?? Infinity)) continue;
    best.set(name, nextCost);
    open.push({ point: next, cost: nextCost, path: current.path.concat(name) });
  }
}
if (!solved) throw new Error("no route");
console.log("mission=" + mission);
console.log("cost=" + solved.cost);
console.log("expanded=" + expanded.join(">"));
console.log("route=" + solved.path.join(">"));
console.log("uncertainty=PREVIEW_ONLY");
console.log("status=PASS");`,
      run: "node week-08-medicine-cart-astar.mjs",
      expectedOutput: String.raw`mission=medicine-cart
cost=8
expanded=0,0>0,1>0,2>0,3>0,4>1,4>2,4>3,4>4,4
route=0,0>0,1>0,2>0,3>0,4>1,4>2,4>3,4>4,4
uncertainty=PREVIEW_ONLY
status=PASS`,
      plantedFailure:
        "Multiply the Manhattan heuristic by three. It then overestimates remaining cost and loses the admissibility guarantee used by this shortest-path teaching case, even if this small grid still returns a route.",
    },
    dayThreads: [
      {
        dayId: 50,
        bridge:
          "The Medicine-Cart Route Trial begins with two location stories: smooth local odometry and globally corrected map pose. Assign `odom→base_link` and `map→odom` to single authorities, build or load the occupancy map in separate modes, and initialize AMCL with scan evidence. Treat particles and covariance as an integration preview; Chapter 11 will derive probability, covariance, Bayes updates, and consistency checks.",
        whyNow: "Navigation needs a current global pose without corrupting the smooth local frame used by control.",
        ignoreForNow: "Ignore covariance derivation and particle-filter mathematics until Chapter 11.",
        unlocks: "A time-valid pose and map on which costmaps and goal execution can operate.",
      },
      {
        dayId: 51,
        bridge:
          "Lay transparent policy sheets over the Medicine-Cart Route Trial’s saved map: static structure, live obstacle observations, inflation, unknown-space handling, measured footprint, and staff-only keepout. Test a doorway with body and uncertainty margins rather than shrinking the cart to force a route. Make global and local layers explain every occupied, cleared, inflated, and prohibited cell.",
        whyNow: "A planner cannot propose safe travel until body geometry and operating policy are encoded in its world representation.",
        ignoreForNow: "Ignore exhaustive costmap tuning; qualify one measured footprint and small scenario set.",
        unlocks: "A collision-aware graph for the A* preview and Nav2 planner.",
      },
      {
        dayId: 52,
        bridge:
          "Run the Medicine-Cart A* starter before selecting Nav2 plugins. The open set represents frontier choices, accumulated cost records travel already paid, and an admissible Manhattan heuristic estimates what remains without exaggeration. Then trace one NavigateToPose request through planner, optional smoother, repeated controller, progress checker, goal checker, and terminal result. A path proposal and physical tracking remain different jobs.",
        whyNow: "Programmers need one inspectable search model before plugin names hide path-planning fundamentals.",
        ignoreForNow: "Ignore proofs beyond this bounded grid and avoid treating A* output as a drive command.",
        unlocks: "A defensible planner/controller comparison with clear timing and acceptance boundaries.",
      },
      {
        dayId: 53,
        bridge:
          "The cart meets a blocked corridor, so express the Medicine-Cart Route Trial as a ticked behavior tree whose nodes return success, failure, or running. Trace the exact branch, target recoveries to observed causes, bound attempts across robot and fleet layers, and require lifecycle readiness before accepting work. A repeated clear-and-retry loop is not resilience.",
        whyNow: "Goal execution needs visible control flow and bounded failure handling around planning and control.",
        ignoreForNow: "Ignore a large mission language; inspect one blocked-goal tree and its state.",
        unlocks: "A recovery path that cancellation and obstruction tests can challenge.",
      },
      {
        dayId: 54,
        bridge:
          "An operator cancels the Medicine-Cart Route Trial while a trolley enters the local path. Correlate cancel request, server acceptance, final nonzero command, measured simulated stop, stopping distance, path version, collision-monitor state, and action result. Separate temporary obstruction, stale localization, infeasible control, and drive failure; replan only from fresh changed evidence and keep one total retry budget.",
        whyNow: "A resilient robot must prove bounded stop and failure classification, not merely accept a cancel message.",
        ignoreForNow: "Ignore safety-certification claims for software Collision Monitor.",
        unlocks: "Hard command-integrity gates and realistic failure rows for evaluation.",
      },
      {
        dayId: 55,
        bridge:
          "Freeze Medicine-Cart Route Trial scenarios before calculating success, time, path efficiency, clearance, final error, recovery, intervention, and failure taxonomy. Keep denominators and difficult cases. Compare estimator covariance only as its internal confidence claim and use time-aligned Gazebo truth for measured error; Chapter 11 will test whether those uncertainty claims are statistically honest.",
        whyNow: "The final demo needs metrics that expose weak conditions rather than reward one lucky route.",
        ignoreForNow: "Ignore advanced uncertainty calibration until Chapter 11, but never relabel covariance as error.",
        unlocks: "A scenario-level scorecard and predeclared release gates.",
      },
      {
        dayId: 56,
        bridge:
          "Release the Medicine-Cart Route Trial as two explicit modes—mapping and saved-map navigation—with one transform authority each. Run the frozen suite, preserve nominal and failure bags, enforce zero keepout and post-cancel command violations, and let hard gates override a flattering average. The verdict must state that Jazzy/Harmonic simulation validates only the modeled stack and tested fault conditions.",
        whyNow: "The chapter’s integration work becomes credible only when a clean reviewer can reproduce the full verdict.",
        ignoreForNow: "Ignore real-floor stopping, wheel slip, safety PLC, and site acceptance claims.",
        unlocks: "A concrete autonomy artifact and failure corpus for perception and estimator improvements.",
      },
    ],
  },
  {
    week: 9,
    mission: {
      name: "The Blue-Crate Inspection Cell",
      opening: [
        "A stationary inspection cell must identify blue shipping crates and report their image evidence without ever authorizing robot motion. Its first prototype succeeds under one lamp, then fails when exposure changes, a reflection creates a false edge, the camera is resized after calibration, and two crossing crates exchange track identities. You inherit the saved frames and must build an inspectable chain from pixel encoding through calibration, fiducial baseline, detection, tracking, and frozen evaluation.",
        "The Blue-Crate Inspection Cell uses one tabletop scene, one camera contract, and one labelled sequence all week. Every stage saves its input and output so the earliest changed assumption can be found. A learned detector is treated as a pre-trained black-box observation component with explicit model and preprocessing provenance before any PyTorch implementation; Chapter 13 will explain how such models are trained and evaluated internally. The finish line is a reproducible observation report with counts, timing, overlays, rejected cases, and an explicit statement that vision evidence is not permission to move hardware.",
      ],
      finishLine:
        "A frozen tabletop dataset reproduces image metadata, classical intermediate stages, held-out calibration residuals, fiducial identity and pose checks, detector threshold counts, tracking identity errors, p95 end-to-end latency, bad-case slices, and a scoped PASS or NEEDS REVISION verdict.",
    },
    learningContract: {
      whyNow:
        "The navigation artifact can move in simulation; the next autonomy step is to turn raw camera measurements into observations whose geometry, timing, and errors remain inspectable.",
      ignoreForNow:
        "Ignore model training, 3D depth, powered motion, and broad scene understanding. Treat any pre-trained detector as a versioned black-box observation component.",
      unlocks:
        "Depth back-projection, 3D targets, perception-driven manipulation, robot-learning datasets, and measured vision latency.",
      evidence:
        "Save capture metadata, intermediate images, calibration and fiducial fixtures, labelled detections and tracks, threshold table, identity-failure sequence, latency samples, starter output, contact sheets, and frozen evaluation verdict.",
    },
    environment: {
      baseline:
        "A modern browser and repository-supported Node.js 22.13.0 or newer run the dependency-free numeric starter. OpenCV exercises must record the exact installed OpenCV 4.x build, camera settings, and dataset identity at runtime.",
      compatibility:
        "Do not assume every OpenCV 4.x build, camera backend, codec, DNN backend, or resize path is equivalent. Freeze preprocessing and qualify changes against the same labelled fixtures before comparison.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Record `node --version` and the installed OpenCV build information for extended labs; run `node week-09-blue-crate.mjs` and match its counts and verdict exactly.",
      driftRisk: "medium",
    },
    starter: {
      title: "Score a frozen crate-detection threshold",
      fileName: "week-09-blue-crate.mjs",
      language: "javascript",
      code: String.raw`const mission = "blue-crate";
const threshold = 0.7;
const latencyLimitMs = 100;
const cases = [
  { truth: true, score: 0.95, latencyMs: 60 },
  { truth: true, score: 0.80, latencyMs: 72 },
  { truth: true, score: 0.40, latencyMs: 65 },
  { truth: true, score: 0.75, latencyMs: 110 },
  { truth: false, score: 0.85, latencyMs: 70 },
];
const validCases = cases.every((item) =>
  typeof item.truth === "boolean" &&
  Number.isFinite(item.score) && item.score >= 0 && item.score <= 1 &&
  Number.isFinite(item.latencyMs) && item.latencyMs >= 0
);
if (!validCases) throw new Error("invalid evaluation case");
const accepted = cases.map((item) => item.score >= threshold);
const tp = cases.filter((item, index) => item.truth && accepted[index]).length;
const fp = cases.filter((item, index) => !item.truth && accepted[index]).length;
const fn = cases.filter((item, index) => item.truth && !accepted[index]).length;
const precision = tp / (tp + fp);
const recall = tp / (tp + fn);
const latencyGate = cases.reduce((worst, item) => Math.max(worst, item.latencyMs), 0) <= latencyLimitMs;
const status = precision >= 0.75 && recall >= 0.75 && latencyGate ? "PASS" : "NEEDS_REVISION";
console.log("mission=" + mission);
console.log("tp=" + tp + " fp=" + fp + " fn=" + fn);
console.log("precision=" + precision.toFixed(3));
console.log("recall=" + recall.toFixed(3));
console.log("latencyGate=" + (latencyGate ? "PASS" : "FAIL"));
console.log("status=" + status);`,
      run: "node week-09-blue-crate.mjs",
      expectedOutput: String.raw`mission=blue-crate
tp=3 fp=1 fn=1
precision=0.750
recall=0.750
latencyGate=FAIL
status=NEEDS_REVISION`,
      plantedFailure:
        "Change the final truth label from boolean false to the string `false`. JavaScript would otherwise treat it as truthy, so the schema guard must reject the corrupted evaluation row.",
    },
    dayThreads: [
      {
        dayId: 57,
        bridge:
          "The Blue-Crate Inspection Cell starts by treating every pixel as a bounded light measurement with row, column, channel order, dtype, exposure, timestamp, and capture settings. Compare BGR, grayscale, and HSV values under bright, shadowed, blurred, and clipped conditions. The crate remains physically blue while its numbers change, so the capture contract must travel with every saved frame.",
        whyNow: "No later threshold, calibration, detector, or tracker is meaningful without correct image encoding and provenance.",
        ignoreForNow: "Ignore object labels and neural networks; inspect raw measurements first.",
        unlocks: "A trustworthy input on which deterministic image stages can operate.",
      },
      {
        dayId: 58,
        bridge:
          "Pass the Blue-Crate Inspection Cell frames through transparent stages: filter, threshold, edge, morphology, and contour. Save every intermediate image and change only one parameter while checking labelled small crates and noise. A clean-looking mask can erase a target, and a contour is merely a boundary in the current mask—not proof that a crate exists.",
        whyNow: "Classical stages expose how assumptions turn pixel values into candidate regions.",
        ignoreForNow: "Ignore learned detection until the deterministic baseline and its errors are visible.",
        unlocks: "Candidate overlays and error evidence for calibration and detector comparison.",
      },
      {
        dayId: 59,
        bridge:
          "The Blue-Crate Inspection Cell must now turn image points into rays. Measure the calibration target, capture varied sharp views, estimate intrinsics and distortion, and reserve held-out positions near the image edges. Report per-view and spatial reprojection residuals, then resize one frame deliberately to prove that unchanged lens hardware does not make old pixel geometry valid.",
        whyNow: "Pose and size claims require a calibrated camera model rather than a convincing overlay.",
        ignoreForNow: "Ignore camera-to-robot extrinsics and 3D depth until Chapter 10.",
        unlocks: "A qualified pixel-to-ray model for fiducial and object geometry.",
      },
      {
        dayId: 60,
        bridge:
          "Place a measured fiducial beside the Blue-Crate Inspection Cell as a controlled engineering baseline. Preserve dictionary, printed size, corner order, calibration, frame, and timestamp; score identity separately from pose error. Test glare, clipping, tilt, distance, and wrong scale while retaining rejected candidates so a correct ID cannot hide poor geometry.",
        whyNow: "A known visual target separates camera and geometry problems from learned object-recognition problems.",
        ignoreForNow: "Ignore using marker pose as a motion command.",
        unlocks: "A repeatable reference against which the crate detector can be evaluated.",
      },
      {
        dayId: 61,
        bridge:
          "Introduce the Blue-Crate Inspection Cell’s pre-trained detector as a versioned box-and-score proposal service, not an oracle. Freeze model identity, color order, resize, normalization, backend, NMS, labels, and one-to-one matching rule. Sweep confidence on validation data, keep TP, FP, and FN overlays, then lock the chosen threshold before held-out evaluation and safe rejection behavior.",
        whyNow: "The cell needs object observations beyond fiducials, with task costs and errors made explicit.",
        ignoreForNow: "Ignore how the network is trained; Chapter 13 will open that model-engineering layer.",
        unlocks: "Timestamped crate observations that a tracker can associate across frames.",
      },
      {
        dayId: 62,
        bridge:
          "Two blue crates cross inside the Blue-Crate Inspection Cell and the tracker swaps their identities despite detecting both. Record detection, prediction, observed age, association score, track ID, occlusion, missed updates, and deletion state separately. Replay the crossing, exit, re-entry, and false-positive sequences so smooth boxes cannot conceal an ID switch or stale predicted observation.",
        whyNow: "A robot task often needs persistent identity, not only accurate boxes in isolated frames.",
        ignoreForNow: "Ignore complex multi-camera tracking and appearance-model training.",
        unlocks: "A labelled temporal observation stream and explicit identity-failure taxonomy.",
      },
      {
        dayId: 63,
        bridge:
          "Seal the Blue-Crate Inspection Cell evaluation before the final run: dataset manifest, labels, matching rule, model and pipeline configuration, threshold, timing boundary, hardware, slices, and gates. Recalculate precision and recall with counts, report median, p95, maximum latency, and retain every failed overlay. A passing observation contract remains separate from downstream motion and safety approval.",
        whyNow: "The chapter needs a verdict that another engineer can reproduce and challenge from item-level evidence.",
        ignoreForNow: "Ignore 3D target accuracy and closed-loop behavior until the next chapters.",
        unlocks: "A frozen vision baseline ready for depth geometry and robot-shaped datasets.",
      },
    ],
  },
];
