import {
  STARTER_RUNTIME_EVIDENCE,
  type ChapterLearningGuide,
} from "../chapter-guide-types";

export const chapterGuides10To18: readonly ChapterLearningGuide[] = [
  {
    week: 10,
    mission: {
      name: "Recover the blue tote from the glass-box shelf",
      opening: [
        "A warehouse robot has one modest assignment: identify a blue parts tote on a waist-high shelf and present a trustworthy approach pose to the planner. The RGB image looks convincing, yet the shelf contains a glossy divider, a dark rubber mat, and a second tote partly hidden behind a carton. Those surfaces turn a tidy rectangle into an engineering argument. This week follows one recorded shelf scene from raw depth through framed geometry, rejecting any target whose measurement cannot support the next decision.",
        "You are the perception engineer on the morning after a near miss. The previous build drew a perfect green box around the tote, but its depth came from the divider behind it. Your job is not to make the overlay prettier. You must account for invalid returns, transform points at their acquisition time, isolate the support plane, estimate a pose that respects symmetry, validate the camera extrinsic, and preserve bad cases. The mission succeeds only when another engineer can reproduce both acceptance and rejection from saved evidence.",
      ],
      finishLine:
        "A versioned offline 3D-target report identifies the tote in a named frame, shows synchronized overlays and residuals, rejects the glossy and occluded bad cases with explicit reasons, and links every accepted pose to the exact depth fixture, calibration identity, command, and result table.",
    },
    learningContract: {
      whyNow:
        "Week 9 established image measurements and camera intrinsics; manipulation now needs metric geometry, framed poses, and evidence that a visually plausible target is physically usable.",
      ignoreForNow:
        "Do not optimize a neural depth model, tune a powered grasp, or chase dense reconstruction quality. Work with recorded or simulated data and one bounded target contract.",
      unlocks:
        "A trustworthy 3D target becomes the input to MoveIt planning, grasp approach design, calibration checks, and later dataset and policy work.",
      evidence:
        "Submit raw and filtered fixtures, frame and timestamp metadata, calibration revision, local-normal stability, overlays, numeric residuals, rejection counts, one nominal case, at least two named bad cases, and the exact rerun command; label fixed-camera extrinsic evidence separately from any unperformed hand–eye calibration.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the dependency-free starter. The learner-created full lab targets ROS 2 Jazzy with Gazebo Harmonic plus recorded or simulated camera data; this repository does not bundle the camera fixture or simulator workspace, and no perception result authorizes powered motion.",
      compatibility:
        "Keep depth encoding, scale, CameraInfo, tf2 direction, point-cloud schema, and calibration identity explicit. Camera drivers and point-cloud tooling can differ, so validate the actual message contract rather than assuming package parity.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-10-depth-quality-gate.mjs`, then replay one saved depth fixture and confirm the point count, frame, timestamp, accepted target, and rejection reason are identical on a second run.",
      driftRisk: "medium",
    },
    starter: {
      title: "Reject invalid depth before averaging",
      fileName: "week-10-depth-quality-gate.mjs",
      language: "javascript",
      code: `const readings = [
  { pixel: "320,240", depthM: 1.0, valid: true },
  { pixel: "322,240", depthM: 0.0, valid: false },
  { pixel: "324,240", depthM: 1.5, valid: true },
  { pixel: "326,240", depthM: 4.8, valid: true },
  { pixel: "328,240", depthM: 1.1, valid: "false" },
  { pixel: "", depthM: 1.2, valid: true },
];
const limits = { minM: 0.2, maxM: 2.0 };
const accepted = readings.filter(
  (sample) =>
    typeof sample.pixel === "string" &&
    sample.pixel.length > 0 &&
    sample.valid === true &&
    Number.isFinite(sample.depthM) &&
    sample.depthM >= limits.minM &&
    sample.depthM <= limits.maxM,
);
const rejected = readings.length - accepted.length;
const meanDepthM =
  accepted.reduce((sum, sample) => sum + sample.depthM, 0) / accepted.length;
const output =
  "accepted=" + accepted.length +
  " rejected=" + rejected +
  " meanDepthM=" + meanDepthM.toFixed(2);
const expected = "accepted=2 rejected=4 meanDepthM=1.25";
if (output !== expected) throw new Error("depth gate mismatch: " + output);
console.log(output);`,
      run: "node week-10-depth-quality-gate.mjs",
      expectedOutput: "accepted=2 rejected=4 meanDepthM=1.25",
      plantedFailure:
        "The 4.8 m return is outside the shelf envelope, while string `false` and a missing pixel identity are malformed evidence; truthiness or range-only filtering accepts them incorrectly.",
    },
    dayThreads: [
      {
        dayId: 64,
        bridge:
          "The blue tote is visible, but the glossy divider returns a confident distance from the wrong surface while the dark mat produces holes. Begin the mission by classifying what stereo, structured light, or time of flight actually measures. Build a validity mask before calculating geometry, and record why each missing or biased pixel is unknown rather than silently turning it into a nearby obstacle or a zero-distance target.",
        whyNow:
          "A 3D pipeline is only as credible as the sensor evidence entering it.",
        ignoreForNow:
          "Ignore dense scene reconstruction and sensor shopping; compare failure mechanisms on the saved shelf scene.",
        unlocks:
          "A bounded valid-depth set that can be converted into framed points.",
      },
      {
        dayId: 65,
        bridge:
          "Yesterday’s mask leaves a sparse but defensible patch on the tote. Today each accepted pixel becomes a metric point using the saved intrinsics, then enters the robot frame through the transform valid at capture time. A voxel filter may make the cloud manageable, but its cell size can erase the tote lip. Preserve raw counts and show exactly which geometric detail disappears before the filtered cloud proceeds.",
        whyNow:
          "Planning cannot consume pixels; it needs metric points with frame and time ownership.",
        ignoreForNow:
          "Ignore map-scale fusion and global registration; transform one synchronized shelf observation.",
        unlocks:
          "A compact point cloud whose dimensions and coordinate meaning can be inspected.",
      },
      {
        dayId: 66,
        bridge:
          "The robot-frame cloud now contains shelf, divider, carton, and tote in one heap. Fit the support plane within a declared tolerance, remove it without swallowing the tote base, and cluster what remains. Use ICP only to refine a plausible alignment, not to rescue an arbitrary initial guess. The recurring question is whether the blue-tote cluster survives every transformation with enough support to justify a target.",
        whyNow:
          "Object geometry becomes useful only after dominant structure and registration assumptions are tested.",
        ignoreForNow:
          "Ignore general-purpose scene understanding; solve the bounded tabletop extraction and one alignment check.",
        unlocks:
          "An isolated target cluster with residuals and explicit rejection thresholds.",
      },
      {
        dayId: 67,
        bridge:
          "A clean cluster still does not tell the arm how to arrive. Compare an axis-aligned box, an oriented box, a six-degree pose, and the approach frame required above the tote opening. Estimate local surface normals only where neighborhood support is stable, orient them consistently, and reject edge or missing-depth normals. The tote’s symmetry can still flip an axis, so preserve ambiguous alternatives instead of presenting one unstable pose as truth.",
        whyNow:
          "The next consumer needs a physically meaningful approach, not merely a compact bounding volume.",
        ignoreForNow:
          "Ignore grasp-force tuning and arm execution; define pose semantics and ambiguity offline.",
        unlocks:
          "A candidate approach frame that MoveIt can later validate against the whole robot.",
      },
      {
        dayId: 68,
        bridge:
          "The candidate approach looks correct in the camera frame but misses the tote after conversion to the robot base. Treat the fixed camera extrinsic as a measured transform with a revision, not a diagram arrow. Evaluate held-out points and inspect residual direction as well as magnitude. If the camera moves with the wrist, stop and identify the separate hand–eye problem; this fixed-camera exercise does not solve or validate it.",
        whyNow:
          "Every downstream pose inherits any camera-to-robot transform error.",
        ignoreForNow:
          "Ignore online self-calibration; establish and challenge one fixed extrinsic with held-out evidence.",
        unlocks:
          "A versioned transform whose error budget can accompany each target.",
      },
      {
        dayId: 69,
        bridge:
          "Return to the glossy divider, dark mat, and partly hidden tote that started the incident. Run the same target path without filling holes merely to make the display complete. Measure missing-depth regions, pose instability, and disagreement across views; then define when the system should request another viewpoint or reject the target. The mission gains credibility when these awkward scenes remain visible in the report.",
        whyNow:
          "A nominal pipeline says little until known sensor and visibility failures challenge its gate.",
        ignoreForNow:
          "Ignore learned inpainting and synthetic perfection; preserve unknown space and bounded recovery choices.",
        unlocks:
          "A bad-case suite that can stop unreliable geometry before planning.",
      },
      {
        dayId: 70,
        bridge:
          "All parts now converge on one replayable tote decision. Run raw depth, mask, cloud, plane removal, target extraction, calibration, pose, and approach-frame checks under one correlation identity. The final overlay must show accepted evidence and rejected regions without hiding the raw values. Publish counts, timings, residuals, and the exact planted failures so the MoveIt chapter receives a measured target contract rather than a screenshot.",
        whyNow:
          "The chapter closes only when separate geometry exercises form one reproducible decision path.",
        ignoreForNow:
          "Ignore powered motion and model training; prove perception and rejection on frozen evidence.",
        unlocks:
          "A framed, quality-gated target ready for whole-arm collision and planning tests.",
      },
    ],
  },
  {
    week: 11,
    mission: {
      name: "Guide the night courier through the blackout aisle",
      opening: [
        "Courier-3 enters aisle C during a simulated night shift. Wheel odometry says it is moving straight, the IMU reports a slow turn, and the lidar loses a reflective wall just before a networked localization update disappears. Week 8 previewed the map-to-odom correction and warned that a transform can be available without being trustworthy. This week deepens that uncertainty preview: the robot must represent competing beliefs, update them with timed evidence, and expose how confident it is before the fleet assigns the next crossing.",
        "You are not asked to produce a smooth blue line. You are asked to explain why the line moved, what observation changed it, which assumptions limited the update, and whether independent simulated ground truth supports the confidence claim. The courier will traverse a known loop, suffer an IMU outlier and lidar dropout, revisit a landmark, and recover. Every estimate carries frame, timestamp, covariance, configuration, and run identity, turning a mysterious localization jump into an inspectable chain of predictions and corrections.",
      ],
      finishLine:
        "A replayable localization report follows Courier-3 through nominal motion, an IMU outlier, lidar dropout, drift, loop closure, and recovery, reporting position and heading error, uncertainty coverage, transform freshness, recovery time, configuration, raw evidence, and a bounded acceptance decision.",
    },
    learningContract: {
      whyNow:
        "Navigation and manipulation already depend on pose; the Week 8 transform preview now needs a quantitative belief model so downstream systems can distinguish a fresh estimate from a confident-looking failure.",
      ignoreForNow:
        "Do not derive measure theory, invent a new SLAM algorithm, or tune a real vehicle. Use small distributions, saved simulation data, and one declared estimator.",
      unlocks:
        "Inspectable state estimation supports localization gates, navigation recovery, mapping evidence, and later FleetOps freshness and fault tests.",
      evidence:
        "Provide input recordings, estimator configuration, frame tree, prediction/update calculations, covariance plots, ground-truth error, dropout and outlier runs, loop-closure evidence, recovery time, and the exact replay command.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the scalar filter starter. The complete mission consumes the learner-created Week 8 bag and targets ROS 2 Jazzy with Gazebo Harmonic and tf2 in simulation; this repository does not bundle that bag or simulator workspace.",
      compatibility:
        "Estimator parameters, message covariances, frame conventions, map formats, and SLAM/localization package behavior must match the actual Jazzy workspace. Do not copy a configuration from another ROS distribution without a replay test.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-11-courier-belief-update.mjs`, replay one fixed bag twice, and confirm input counts, posterior values, transform timestamps, and ground-truth error summaries match.",
      driftRisk: "medium",
    },
    starter: {
      title: "Update one belief and reject stale evidence",
      fileName: "week-11-courier-belief-update.mjs",
      language: "javascript",
      code: `const prior = { mean: 2.0, variance: 1.0 };
const controlDelta = 1.0;
const processVariance = 1.0;
const maxAgeMs = 100;
const measurements = [
  { value: 4.0, variance: 0.5, ageMs: 40 },
  { value: 9.0, variance: 0.5, ageMs: 180 },
  { value: 5.0, variance: 0.5, ageMs: -10 },
  { value: Number.NaN, variance: 0.5, ageMs: 20 },
];
const isValid = (item) =>
  [item.value, item.variance, item.ageMs].every(Number.isFinite) &&
  item.variance > 0 && item.ageMs >= 0;
const valid = measurements.filter(isValid);
const fresh = valid.filter((item) => item.ageMs <= maxAgeMs);
const stale = valid.filter((item) => item.ageMs > maxAgeMs).length;
const invalid = measurements.length - valid.length;
const predictedMean = prior.mean + controlDelta;
const predictedVariance = prior.variance + processVariance;
const measurement = fresh[0];
if (!measurement) throw new Error("no valid fresh measurement");
const gain = predictedVariance / (predictedVariance + measurement.variance);
const posteriorMean =
  predictedMean + gain * (measurement.value - predictedMean);
const posteriorVariance = (1 - gain) * predictedVariance;
const output =
  "fresh=" + fresh.length +
  " stale=" + stale +
  " invalid=" + invalid +
  " gain=" + gain.toFixed(3) +
  " posterior=" + posteriorMean.toFixed(2) +
  " variance=" + posteriorVariance.toFixed(3);
const expected = "fresh=1 stale=1 invalid=2 gain=0.800 posterior=3.80 variance=0.400";
if (output !== expected) throw new Error("belief mismatch: " + output);
console.log(output);`,
      run: "node week-11-courier-belief-update.mjs",
      expectedOutput:
        "fresh=1 stale=1 invalid=2 gain=0.800 posterior=3.80 variance=0.400",
      plantedFailure:
        "The 180 ms measurement is stale, the negative age is future-dated, and the NaN value is not evidence; coercive comparisons or finite checks applied to only one field admit invalid observations.",
    },
    dayThreads: [
      {
        dayId: 71,
        bridge:
          "Courier-3 begins with a true pose hidden from its software. Wheel ticks, angular rate, lidar ranges, and commands are observations or inputs, not the state itself. Revisit Week 8’s map-to-odom preview and now name the uncertainty it left implicit. Draw the process and measurement models, attach frames and clocks, and separate estimator output from simulated ground truth before judging the first aisle segment.",
        whyNow:
          "Uncertainty must be modeled before sensor disagreement can be interpreted honestly.",
        ignoreForNow:
          "Ignore matrix derivations and full SLAM internals; define the state and evidence contract first.",
        unlocks:
          "A precise vocabulary for beliefs, predictions, observations, and independent error.",
      },
      {
        dayId: 72,
        bridge:
          "The courier’s x position is not one magic number. Represent a range of plausible positions, then use mean and spread to summarize only what they can support. Compare covariance between x and heading with actual errors against ground truth; they are different quantities. The night route includes a fork where two locations remain plausible, showing why one Gaussian ellipse can be a convenient approximation rather than the entire belief.",
        whyNow:
          "Filters communicate confidence through distributions and covariance, so those outputs must be read before being trusted.",
        ignoreForNow:
          "Ignore formal probability proofs; use small tables, plots, and physical interpretations.",
        unlocks:
          "A belief representation that can widen, narrow, correlate axes, and be checked for coverage.",
      },
      {
        dayId: 73,
        bridge:
          "Courier-3 moves one metre according to the controller, so its belief shifts and spreads before the next lidar clue arrives. Perform the predict step, score the observation under each candidate location, and normalize the posterior. Then inject the reflective-wall dropout and preserve the broader prediction rather than fabricating certainty. The recursive cycle makes every localization change traceable to prior belief, motion assumption, and measurement evidence.",
        whyNow:
          "The mission needs a repeatable rule for carrying uncertainty through motion and new evidence.",
        ignoreForNow:
          "Ignore continuous high-dimensional optimization; execute a small discrete Bayes cycle.",
        unlocks:
          "The conceptual backbone shared by Kalman, particle, and grid-based estimators.",
      },
      {
        dayId: 74,
        bridge:
          "The IMU now reports a turn that wheel odometry does not support. Use a scalar Kalman example before configuring the simulated EKF: prediction variance, measurement variance, innovation, gain, and posterior each answer a different question. Fuse only non-duplicated variables in valid frames, then replay the outlier. A smooth estimate that ignores timestamp or covariance mistakes is still a failed night-shift result.",
        whyNow:
          "The Bayes cycle can now be specialized into a practical estimator used by ROS systems.",
        ignoreForNow:
          "Ignore optimal filter design and real sensor tuning; inspect one bounded fusion configuration.",
        unlocks:
          "A timed odometry-IMU belief with innovations and covariance that can be challenged.",
      },
      {
        dayId: 75,
        bridge:
          "After the IMU event, small pose errors accumulate until the lidar walls no longer align. Compare scan matching against the previous scan or map and record when repetitive aisle geometry creates a plausible wrong fit. Update occupancy only from framed, timed rays, and keep unknown cells unknown during dropout. The route’s growing drift is now evidence to explain, not an aesthetic defect to smooth away.",
        whyNow:
          "Local fusion must connect to geometric localization and mapping without hiding accumulated error.",
        ignoreForNow:
          "Ignore building a new scan matcher; diagnose initialization, overlap, residuals, and map updates.",
        unlocks:
          "Measured drift and registration evidence ready for global correction.",
      },
      {
        dayId: 76,
        bridge:
          "Courier-3 recognizes the loading-bay landmark near its starting point. Add a loop-closure constraint and inspect which poses move, then distinguish that graph correction from AMCL’s particles on an existing map. Track the resulting map-to-odom adjustment so local odometry remains continuous while global belief changes. A large correction requires evidence and downstream awareness; it is not automatically a triumphant snap to truth.",
        whyNow:
          "The mission needs global recovery mechanisms after local drift becomes visible.",
        ignoreForNow:
          "Ignore multi-robot map merging and lifelong mapping; compare one loop closure and one localization recovery.",
        unlocks:
          "An explainable global correction that preserves local control continuity.",
      },
      {
        dayId: 77,
        bridge:
          "Replay the complete blackout aisle: nominal loop, IMU outlier, missing lidar, accumulated drift, landmark return, and recovery. Correlate every estimate with ground truth, covariance, transform age, configuration, and event time. Report when uncertainty covered the actual error and when it did not. The final decision must name the estimator’s useful envelope and the exact dropout or geometry that still blocks acceptance.",
        whyNow:
          "Separate estimator ideas become engineering evidence only in one frozen failure-and-recovery run.",
        ignoreForNow:
          "Ignore field deployment claims; qualify the recorded simulation mission and its known limits.",
        unlocks:
          "Localization evidence reusable by navigation, FleetOps, and later validation ladders.",
      },
    ],
  },
  {
    week: 12,
    mission: {
      name: "Transfer the fragile sample without touching the divider",
      opening: [
        "A simulated six-joint arm must move a foam laboratory vial from the blue tote into a rack across a clear divider. The tool point has an obvious free path, but the elbow can strike the divider, the wrist camera can clip the rack, and a carried vial changes the collision body. The Week 10 target pose and Week 11 confidence record enter this mission as evidence, not permission. Every scene update, candidate configuration, path, trajectory, contact transition, and controller result must remain visible.",
        "Treat the transfer as a sequence of state changes rather than one cinematic motion. The arm begins in a known configuration, receives a framed target, explores collision-free alternatives, time-parameterizes a selected path, approaches locally, closes on the foam vial, attaches it to the planning scene, moves, releases, and retreats. A planner may fail honestly at any stage. The finish line is twenty replayable trials with seeds, cancellation, planted scene and timing faults, stage metrics, and a release decision that never confuses RViz animation with completed physical work.",
      ],
      finishLine:
        "A twenty-trial simulated manipulation matrix executes the full perceive-to-scene-to-plan-to-execute-to-contact sequence, preserves seed and scene identity, exposes stage failures and cancellation, verifies carried-object collision state, and ends in PASS, NEEDS REVISION, or BLOCKED with linked logs and uncut evidence.",
    },
    learningContract: {
      whyNow:
        "Framed 3D targets and localization beliefs are useful only when the whole arm, environment, timing, contact state, and controller outcome are considered together.",
      ignoreForNow:
        "Do not tune a powered arm, claim force safety, or replace MoveIt planners. Use the official simulated robot and one fragile-sample task.",
      unlocks:
        "A complete manipulation baseline supports later demonstrations, policy learning, VLA integration, and acceptance testing.",
      evidence:
        "Provide URDF/SRDF and scene revisions, target and calibration identity, planner seeds, path and trajectory metrics, action feedback, cancellation result, Task Constructor stage outcomes, tactile or force-torque evidence boundaries, planted faults, twenty-trial ledger, and exact launch commands.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the planning-gate starter. The learner-created integrated lab targets ROS 2 Jazzy, Gazebo Harmonic, and compatible MoveIt 2 packages with an official simulated tutorial robot; this repository does not bundle that workspace.",
      compatibility:
        "Robot model, SRDF groups, controller names, planning plugins, scene message semantics, and tutorial launch paths must be verified in the active workspace. Examples from another ROS or MoveIt release require adaptation and rerun evidence.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-12-select-safe-plan.mjs`, then launch the pinned simulation and verify model groups, controllers, planning scene, one known-valid plan, cancellation, and terminal result.",
      driftRisk: "medium",
    },
    starter: {
      title: "Select only a fresh collision-free candidate",
      fileName: "week-12-select-safe-plan.mjs",
      language: "javascript",
      code: `const plans = [
  { id: "plan-a", collisionFree: false, scene: 7, durationS: 3.1 },
  { id: "plan-b", collisionFree: true, scene: 6, durationS: 2.8 },
  { id: "plan-c", collisionFree: true, scene: 7, durationS: 4.2 },
  { id: "plan-d", collisionFree: "false", scene: 7, durationS: 1.0 },
];
const requiredScene = 7;
const eligible = plans.filter(
  (plan) =>
    typeof plan.id === "string" &&
    plan.id.length > 0 &&
    plan.collisionFree === true &&
    plan.scene === requiredScene &&
    Number.isFinite(plan.durationS) &&
    plan.durationS > 0,
);
if (eligible.length === 0) throw new Error("no eligible plan");
eligible.sort((left, right) => left.durationS - right.durationS);
const selected = eligible[0];
const rejected = plans.length - eligible.length;
const output =
  "selected=" + selected.id +
  " rejected=" + rejected +
  " durationS=" + selected.durationS.toFixed(1);
const expected = "selected=plan-c rejected=3 durationS=4.2";
if (output !== expected) throw new Error("plan gate mismatch: " + output);
console.log(output);`,
      run: "node week-12-select-safe-plan.mjs",
      expectedOutput: "selected=plan-c rejected=3 durationS=4.2",
      plantedFailure:
        "Plan-b used stale scene revision 6, while plan-d reports string `false`; removing the revision gate or treating a non-boolean flag as truthy selects an ineligible path.",
    },
    dayThreads: [
      {
        dayId: 78,
        bridge:
          "Place the simulated arm, rack, tote, divider, and vial into one versioned planning scene. The tool point can clear the divider while the elbow collides, so inspect complete link geometry, attached bodies, padding, and swept configurations. Draw the same obstruction in workspace and configuration space. The mission begins by proving why a visually clear endpoint does not make an arm configuration or path acceptable.",
        whyNow:
          "Whole-arm collision reasoning must precede any search for a motion.",
        ignoreForNow:
          "Ignore planner tuning; make scene ownership and collision checks correct first.",
        unlocks:
          "A trustworthy validity test for candidate joint configurations.",
      },
      {
        dayId: 79,
        bridge:
          "The target approach from Week 10 enters the arm model today. Resolve it through the correct planning group, IK solver, current robot state, and scene revision. Compare multiple IK candidates by limits and collision rather than joint distance alone. When the vial is grasped later, its geometry must move from world object to attached body without leaving two contradictory copies in the scene.",
        whyNow:
          "Planning needs a precise model of joints, groups, state, world geometry, and intended contact.",
        ignoreForNow:
          "Ignore motion quality optimization; establish valid start and goal configurations.",
        unlocks:
          "A scene-consistent manipulation request with inspectable IK alternatives.",
      },
      {
        dayId: 80,
        bridge:
          "Search several seeded paths from the current arm shape to the pre-grasp configuration. One route swings wide, another threads near the divider, and some seeds fail within the budget. Record success, time, path length, and minimum clearance for every attempt. RRT and OMPL are not luck dispensers: the repeated seed table reveals whether the mission has robust free space or one attractive accidental solution.",
        whyNow:
          "Valid endpoints do not guarantee a connectable, repeatable path through configuration space.",
        ignoreForNow:
          "Ignore proving asymptotic planning theory; compare bounded seeded behavior on this scene.",
        unlocks:
          "A selected geometric path with known variability and clearance evidence.",
      },
      {
        dayId: 81,
        bridge:
          "The chosen path is only ordered geometry until joint limits and time are assigned. Apply time parameterization, inspect velocity and acceleration, and send the simulated trajectory through the real action boundary. Cancel midway and confirm feedback, controller state, and terminal result agree. Then change the scene before execution and require revalidation instead of allowing a beautiful but stale plan to move.",
        whyNow:
          "Execution semantics and timing turn a plan into a commandable, cancelable trajectory.",
        ignoreForNow:
          "Ignore aggressive cycle-time tuning; prove bounded timing, freshness, feedback, and cancellation.",
        unlocks:
          "A verified simulated motion primitive for the staged transfer.",
      },
      {
        dayId: 82,
        bridge:
          "Build the transfer as explicit stages: current state, open, connect, approach, close, attach, lift, move, lower, open, detach, and retreat. Use Task Constructor to retain failed alternatives and Servo only for a bounded local correction with fresh commands and cancellation. When close is commanded, do not mark the vial attached until the mission’s declared evidence permits that scene transition.",
        whyNow:
          "A multi-step task needs visible alternatives and state transitions, not one opaque planner call.",
        ignoreForNow:
          "Ignore autonomous recovery invention; expose each stage and its declared failure result.",
        unlocks:
          "A complete pick-and-place graph ready for contact reasoning and acceptance trials.",
      },
      {
        dayId: 83,
        bridge:
          "The foam vial introduces contact without making the classroom exercise a force-safety procedure. Distinguish joint effort, wrist force-torque, tactile arrays, motor current, and a binary contact switch: each observes a different proxy with calibration, bandwidth, saturation, and location limits. Inject bias and excessive closure in simulation or an unpowered model. Contact evidence may support a grasp-state transition, but no classroom sensor reading certifies safe force or stable physical grasp.",
        whyNow:
          "Manipulation success depends on contact transitions that pure geometric planning cannot establish.",
        ignoreForNow:
          "Ignore real force-controller tuning and safety certification; study bounded contact contracts.",
        unlocks:
          "Explicit grasp evidence and failure boundaries for the full trial matrix.",
      },
      {
        dayId: 84,
        bridge:
          "Freeze twenty vial-transfer cases across start pose, target offset, divider position, planner seed, and planted faults. Run the same launch path, account for every trial, and separate planning, timing, controller, scene, contact, and scoring failures. Include cancellation and a stale-scene rejection. The mission closes only when the evidence package supports an explicit decision and preserves the failures that prevent a stronger claim.",
        whyNow:
          "A complete manipulation claim needs repeated end-to-end evidence, not isolated component success.",
        ignoreForNow:
          "Ignore powered hardware and learned policies; qualify the simulated baseline honestly.",
        unlocks:
          "A repeatable manipulation system that later data collection and learning can build upon.",
      },
    ],
  },
  {
    week: 13,
    mission: {
      name: "Build an offline seal-defect scout",
      opening: [
        "A packaging cell has saved camera crops and measured cap offsets from an earlier inspection run. Operators want a small model that flags likely misaligned seals before a human review, but the images contain repeated production bursts, changing illumination, and labels tied to physical millimetres. You will build an offline scout, beginning with tensor axes and ending with a model card. It will never command the cell. Its value comes from traceable data, a credible baseline, grouped evaluation, measured latency, and visible failure slices.",
        "The tempting path is to train until one curve looks smooth. The engineering path is harder: state every tensor’s shape and meaning, keep related bursts out of opposing splits, compare an MLP and compact visual encoder, preserve train and evaluation modes, challenge shortcut learning, replay several seeds, and time the full input-to-output path. A checkpoint is only one artifact in the story. The mission finishes when another engineer can reproduce the experiment and understand exactly where the scout should abstain.",
      ],
      finishLine:
        "A reproducible offline model package beats a declared simple baseline on a grouped held-out set, reports per-condition errors and p95 inference latency across recorded seeds, preserves configuration and checkpoints, rejects malformed input, and ships with a model card that forbids autonomous motion claims.",
    },
    learningContract: {
      whyNow:
        "Weeks 9–12 produced robot-relevant images, poses, and outcomes; PyTorch can now be learned through data whose physical meaning, grouping, and failure costs are already understood.",
      ignoreForNow:
        "Do not chase large architectures, cloud training, foundation models, or powered deployment. Use a small offline dataset and one falsifiable prediction contract.",
      unlocks:
        "A disciplined training and evaluation workflow becomes the foundation for demonstrations, imitation learning, VLA adaptation, and deployable model evidence.",
      evidence:
        "Provide schema and shape checks, grouped split manifest, baseline, resolved configuration, training and validation curves, seed table, malformed-input test, checkpoint lineage, held-out slices, latency distribution, worst cases, and model card.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the leakage starter. Model exercises use the repository’s isolated Python and PyTorch environment when present, recorded or synthetic data, and CPU or an available GPU without touching powered hardware.",
      compatibility:
        "PyTorch, accelerator, driver, and deterministic-operation behavior can drift. Record the actual interpreter, package lock, device, seed controls, and unsupported operations rather than claiming bitwise parity across machines.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-13-detect-split-leakage.mjs`; in the model environment, import the pinned packages, run one tiny batch through save and fresh-process load, and verify schema, output shape, and finite values.",
      driftRisk: "high",
    },
    starter: {
      title: "Detect scene leakage across splits",
      fileName: "week-13-detect-split-leakage.mjs",
      language: "javascript",
      code: `const schema = "robot-scenes-v1"; const allowedSplits = new Set(["train", "validation"]);
const rows = [
  { id: "a1", schema, group: "scene-a", split: "train" },
  { id: "a2", schema, group: "scene-a", split: "train" },
  { id: "b1", schema, group: "scene-b", split: "train" },
  { id: "b2", schema, group: "scene-b", split: "validation" },
  { id: "c1", schema, group: "scene-c", split: "validation" },
  { id: "bad-schema", schema: "legacy", group: "scene-d", split: "train" }, { id: "bad-group", schema, group: "", split: "train" },
  { id: "bad-split", schema, group: "scene-e", split: "test" },
];
let invalid = 0;
const validRows = rows.filter((row) => {
  const valid = row.schema === schema && typeof row.id === "string" && row.id.length > 0 &&
    typeof row.group === "string" && row.group.length > 0 && allowedSplits.has(row.split);
  if (!valid) invalid += 1;
  return valid;
});
const groupsBySplit = new Map();
for (const row of validRows) {
  const splits = groupsBySplit.get(row.group) ?? new Set();
  splits.add(row.split); groupsBySplit.set(row.group, splits);
}
const leaked = [...groupsBySplit.entries()]
  .filter(([, splits]) => splits.size > 1)
  .map(([group]) => group)
  .sort();
const train = validRows.filter((row) => row.split === "train").length; const validation = validRows.filter((row) => row.split === "validation").length;
const output =
  "train=" + train +
  " validation=" + validation +
  " leakage=" + leaked.join(",") +
  " invalid=" + invalid;
const expected = "train=3 validation=2 leakage=scene-b invalid=3";
if (output !== expected) throw new Error("split audit mismatch: " + output);
console.log(output);`,
      run: "node week-13-detect-split-leakage.mjs",
      expectedOutput: "train=3 validation=2 leakage=scene-b invalid=3",
      plantedFailure:
        "Scene-b leaks across grouped splits, while wrong schema, blank group, and unsupported split rows must be rejected instead of contaminating the audit denominator.",
    },
    dayThreads: [
      {
        dayId: 85,
        bridge:
          "Open one seal crop and its measured offset as named tensors rather than anonymous arrays. Record batch, channel, height, width, dtype, device, units, and target axis; then plant an unintended broadcast that produces a plausible loss. Check one gradient with a finite difference and clear accumulated gradients deliberately. The scout cannot be debugged later if its first numeric contract is ambiguous today.",
        whyNow:
          "Every later model result depends on correct tensor meaning and gradient behavior.",
        ignoreForNow:
          "Ignore architecture performance; make shapes, devices, units, and numerical checks explicit.",
        unlocks:
          "A verified forward-and-gradient fixture for the saved inspection data.",
      },
      {
        dayId: 86,
        bridge:
          "Turn the saved crops into a dataset whose rows preserve production burst, scene, timestamp, and physical target. Split by related scene or collection session, not by convenient image row, and expose every transform. The planted scene-b leak in the starter demonstrates how near-twins can appear on both sides of evaluation. The scout’s first credibility gate is a manifest proving that held-out evidence stayed held out.",
        whyNow:
          "A correct tensor pipeline still produces misleading evidence when related samples leak across splits.",
        ignoreForNow:
          "Ignore distributed loading and large-scale augmentation; build a small grouped, inspectable pipeline.",
        unlocks:
          "Training and evaluation batches with defensible lineage.",
      },
      {
        dayId: 87,
        bridge:
          "Establish a simple numeric or constant baseline before introducing a learned encoder. Compare an MLP on measured features with a compact convolutional path on image structure, tracing receptive field, parameters, tensor shapes, and output units. The mission does not reward the fashionable model; it rewards the smallest model that improves the declared seal-offset task without hiding latency or input assumptions.",
        whyNow:
          "Architecture choices only have meaning relative to input structure, baseline, and output contract.",
        ignoreForNow:
          "Ignore pretrained giants and exhaustive search; compare two understandable candidates.",
        unlocks:
          "A selected scout architecture whose behavior can be trained and measured.",
      },
      {
        dayId: 88,
        bridge:
          "Train the scout with a loss that matches millimetre error, a declared optimizer, schedule, and checkpoint rule. Separate training from validation mode, prevent gradients during evaluation, and prove that save, fresh-process load, and resume preserve the intended state. A falling training curve is one observation, not the finish line; keep per-component errors and rejected non-finite batches visible.",
        whyNow:
          "The selected model needs a correct, restartable optimization path before generalization can be judged.",
        ignoreForNow:
          "Ignore final-test results and deployment; establish training mechanics and checkpoint lineage.",
        unlocks:
          "Comparable candidate checkpoints chosen by a predeclared rule.",
      },
      {
        dayId: 89,
        bridge:
          "The scout performs well until lighting changes, suggesting it learned a production-burst shortcut. Inspect the worst held-out crops, compare against the simple baseline, and test physically plausible brightness or crop changes without corrupting label meaning. Keep the final test sealed while repairing development failures. More augmentation is not automatically more evidence; each transform needs a reason tied to a condition the camera can produce.",
        whyNow:
          "Optimization success must be challenged for leakage, shortcut learning, and overfitting.",
        ignoreForNow:
          "Ignore broad robustness claims; diagnose one supported failure and one controlled response.",
        unlocks:
          "A candidate whose improvement survives a realistic held-out condition.",
      },
      {
        dayId: 90,
        bridge:
          "Repeat the resolved experiment across several recorded seeds and preserve the environment, data hash, configuration, logs, and checkpoint selection. Variation between runs is a result, not noise to delete. Time the complete preprocessing and inference path with warm and cold observations. The scout’s replay package should reveal whether a claimed gain depends on one lucky initialization or an unrecorded local state.",
        whyNow:
          "A single successful run cannot establish reproducibility or stable engineering value.",
        ignoreForNow:
          "Ignore cross-platform bitwise identity; record conditions and quantify observed variation.",
        unlocks:
          "A reproducible experiment ledger with latency and run-to-run evidence.",
      },
      {
        dayId: 91,
        bridge:
          "Write the seal scout’s public engineering label. State intended review use, excluded autonomous use, data lineage, grouped splits, baseline, seed results, per-lighting slices, worst errors, malformed-input behavior, and p95 latency. Link every number to a recalculable artifact and show representative failures. The model card closes the mission by making the limits as easy to find as the best metric.",
        whyNow:
          "A checkpoint without evidence boundaries invites claims that the experiment never tested.",
        ignoreForNow:
          "Ignore marketing language and live deployment; document the verified offline system.",
        unlocks:
          "A trustworthy learning artifact ready to inform demonstration and policy chapters.",
      },
    ],
  },
  {
    week: 14,
    mission: {
      name: "Freeze the careful-handover dataset",
      opening: [
        "The seal-defect scout predicted labels from fixed observations; now a robot-learning system needs synchronized examples of decisions over time. In a simulated handover, an operator guides a gripper toward a foam block, pauses when the receiver is not ready, and places it inside a marked tray. Episode 014 looks successful on video, yet its action units, clock alignment, operator takeover, and terminal meaning are undocumented. This week turns that attractive recording into a dataset another policy engineer can inspect without guessing.",
        "Follow one release candidate from task definition to frozen card. You will define episode boundaries, collect bounded demonstrations, distinguish joint and Cartesian commands, align camera, state, and action clocks, validate a versioned schema, group splits by physical context, and retain failed attempts. The final inspector must reveal saturation, lag, missing samples, interventions, exclusions, and privacy decisions on one timeline. Week 15 will train from this exact evidence, so every shortcut taken here becomes a policy failure with a traceable origin.",
      ],
      finishLine:
        "Dataset release `handover-v1` contains versioned episode, feature, action, clock, split, quality, rights, and privacy contracts; a visual inspector replays accepted and rejected attempts; all headline counts and durations recalculate from frozen manifests and checksums.",
    },
    learningContract: {
      whyNow:
        "Week 13 established tensors, grouped splits, and model evidence; imitation learning now requires temporally aligned robot observations and actions with explicit physical semantics.",
      ignoreForNow:
        "Do not train a policy, maximize episode count, or collect unsupervised powered motion. Build a small, reviewable dataset whose defects remain visible.",
      unlocks:
        "The frozen handover data becomes the direct input to Week 15 behavior cloning, correction, action-chunk, and rollout comparisons.",
      evidence:
        "Provide task and episode contracts, recorder revision, operator and intervention fields, action schema, clock residuals, manifests, grouped splits, failure and coverage ledger, privacy and rights disposition, checksums, card, inspector, and rerun command.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the synchronization starter. Collection remains synthetic, simulated on ROS 2 Jazzy with Gazebo Harmonic, or supervised on an already commissioned platform; the guide itself requires no powered robot.",
      compatibility:
        "Recorder fields, image encodings, timestamp clocks, action order, units, frames, and dataset tooling can drift. Pin the actual schema and conversion code; do not treat a current documentation branch as a frozen data format.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-14-audit-handover-sync.mjs`, validate one frozen episode against the schema, recalculate its duration and residuals, and verify the inspector shows the same missing and rejected samples.",
      driftRisk: "high",
    },
    starter: {
      title: "Gate synchronized observation-action pairs",
      fileName: "week-14-audit-handover-sync.mjs",
      language: "javascript",
      code: `const pairs = [
  { id: "p1", cameraId: "f1", actionCameraId: "f1", cameraMs: 1000, actionMs: 1005 },
  { id: "p2", cameraId: "f2", actionCameraId: "f2", cameraMs: 1050, actionMs: 1058 },
  { id: "p3", cameraId: "f3", actionCameraId: "f3", cameraMs: 1100, actionMs: 1124 },
  { id: "p4", cameraId: "f4", actionCameraId: "f4", cameraMs: 1150, actionMs: 1146 },
  { id: "p5", cameraId: "f5", actionCameraId: "f4", cameraMs: 1200, actionMs: 1202 },
  { id: "p6", cameraId: "f6", actionCameraId: "f6", cameraMs: Number.NaN, actionMs: 1250 },
];
const toleranceMs = 10;
const audited = pairs.map((pair) => {
  const identityValid = typeof pair.id === "string" && pair.id.length > 0 &&
    typeof pair.cameraId === "string" && pair.cameraId === pair.actionCameraId;
  const timesValid = [pair.cameraMs, pair.actionMs].every(Number.isFinite);
  if (!identityValid || !timesValid) return { ...pair, status: "invalid" };
  const skewMs = Math.abs(pair.cameraMs - pair.actionMs);
  return { ...pair, skewMs, status: skewMs <= toleranceMs ? "accepted" : "rejected" };
});
const accepted = audited.filter((pair) => pair.status === "accepted");
const rejected = audited.filter((pair) => pair.status === "rejected");
const invalid = audited.filter((pair) => pair.status === "invalid");
if (accepted.length === 0) throw new Error("no valid synchronized pair");
const maxAcceptedSkewMs = Math.max(...accepted.map((pair) => pair.skewMs));
const output =
  "accepted=" + accepted.length +
  " rejected=" + rejected.length +
  " invalid=" + invalid.length +
  " maxAcceptedSkewMs=" + maxAcceptedSkewMs;
const expected = "accepted=3 rejected=1 invalid=2 maxAcceptedSkewMs=8";
if (output !== expected) throw new Error("sync audit mismatch: " + output);
console.log(output);`,
      run: "node week-14-audit-handover-sync.mjs",
      expectedOutput: "accepted=3 rejected=1 invalid=2 maxAcceptedSkewMs=8",
      plantedFailure:
        "Pair p3 exceeds the 10 ms tolerance, p5 links the wrong camera identity, and p6 has a non-finite timestamp; index ordering or JavaScript NaN comparisons must not classify either invalid pair.",
    },
    dayThreads: [
      {
        dayId: 92,
        bridge:
          "Define the careful handover before recording more video. Name the policy input, physical action, reset, success, safe abort, episode start, terminal state, and trajectory timing for Episode 014. A green tray outcome does not explain what the operator saw or commanded. The mission needs comparable attempts whose boundaries and semantics survive export, review, and the Week 15 training loader.",
        whyNow:
          "Data rows are useful only after the task and episode units have stable physical meaning.",
        ignoreForNow:
          "Ignore model architecture and dataset scale; define one bounded handover contract.",
        unlocks:
          "Comparable episodes that can be collected, split, and scored.",
      },
      {
        dayId: 93,
        bridge:
          "Record several simulated handovers while preserving operator input, robot command, measured state, calibration identity, intervention, and outcome as different fields. Include a receiver-not-ready abort and a late takeover rather than saving only the clean place. The operator’s corrective motion is not automatically an expert label. Capture the exact control authority and cancellation path so later policy work can distinguish teaching from emergency recovery.",
        whyNow:
          "Collection procedure determines which actions and failures the dataset can honestly represent.",
        ignoreForNow:
          "Ignore autonomous rollout; establish safe, attributable demonstration capture.",
        unlocks:
          "A first batch with operator and intervention lineage.",
      },
      {
        dayId: 94,
        bridge:
          "Episode 014 stores a gripper move, but that phrase could mean joint targets, Cartesian deltas, velocities, or an action chunk. Write ordered component names, units, frames, rate, bounds, controller interpretation, and expiry for the selected handover action. Convert one example by hand and reject another whose dimensions match but semantics do not. Numeric shape alone cannot protect the future policy from a swapped command contract.",
        whyNow:
          "The recorder and learner must agree on what every action value physically means.",
        ignoreForNow:
          "Ignore choosing the best policy representation; document and validate the collected action space.",
        unlocks:
          "Machine-checkable action targets for training and replay.",
      },
      {
        dayId: 95,
        bridge:
          "Place camera exposure, robot state acquisition, operator input, command acceptance, and measured response on one clock-aware timeline. The starter’s 24 ms mismatch is the planted warning: adjacent row numbers do not prove causal pairing. Calculate residuals, identify clock domains, declare tolerance, count missing samples, and preserve lag rather than shifting streams until the video looks convincing.",
        whyNow:
          "Imitation depends on the action belonging to the observation that actually preceded it.",
        ignoreForNow:
          "Ignore perfect global clock theory; prove bounded alignment and expose uncertainty in this recorder.",
        unlocks:
          "Synchronized training pairs with measurable timing quality.",
      },
      {
        dayId: 96,
        bridge:
          "Encode handover-v1 as a versioned schema covering images, state, action, task text, timestamps, frames, units, calibration, operator, intervention, and terminal result. Split by episode family, scene, object, and collection session so near-identical attempts do not leak. Compute normalization statistics from training data only. A schema change produces a new version and migration record, not a silent reinterpretation of old episodes.",
        whyNow:
          "Aligned samples still need a stable format and leakage-resistant evidence boundary.",
        ignoreForNow:
          "Ignore universal dataset standards; make this release explicit and convertible without guessing.",
        unlocks:
          "A frozen train, validation, and held-out manifest ready for loaders.",
      },
      {
        dayId: 97,
        bridge:
          "Review every handover by structure, behavior, and condition coverage. Retain the dropped block, receiver-not-ready pause, saturation, operator habit, dark tray, and off-centre start with dispositions rather than deleting inconvenient attempts. Compare collected conditions with intended use and label distribution shift as an observed gap. The quality ledger tells Week 15 what the dataset teaches and, more importantly, what it does not.",
        whyNow:
          "A valid schema cannot detect bad behavior, biased coverage, or misleading labels by itself.",
        ignoreForNow:
          "Ignore synthetic augmentation as a cure; inspect and classify real recorded evidence first.",
        unlocks:
          "A defensible inclusion set and prioritized collection gaps.",
      },
      {
        dayId: 98,
        bridge:
          "Seal handover-v1 without erasing its rejected episodes. Generate the card from frozen manifests, recalculate counts and duration, record provenance, licensing, privacy, intended use, exclusions, and checksums, then open the same identities in a synchronized inspector. Show a passing and failing attempt side by side. Week 15 begins from this release identity, so corrections must become a new version with lineage rather than rewriting the evidence it used.",
        whyNow:
          "The dataset becomes reusable only when its claims and underlying episodes can be independently checked.",
        ignoreForNow:
          "Ignore public promotion and policy results; publish only non-sensitive, verified dataset evidence.",
        unlocks:
          "A traceable learning input and explicit Week 14 to Week 15 handoff.",
      },
    ],
  },
  {
    week: 15,
    mission: {
      name: "Teach the handover policy to recover from the crooked approach",
      opening: [
        "Week 14 froze handover-v1, including the clean places and the uncomfortable evidence: a gripper drifting left, a receiver-not-ready abort, and a late operator takeover. This week consumes that exact release rather than inventing a friendlier dataset. A behavior-cloning baseline may imitate familiar starts while creating new states after one small error. The mission follows that crooked approach through supervised loss, safe expert relabelling, temporal context, ACT-style chunks, closed-loop evaluation, and a deadline-aware runtime.",
        "Two checkpoints will face the same frozen simulator cases. Neither earns trust from low validation loss, a smooth demo, or a preferred architecture. You will preserve teacher action, learner proposal, executed command, intervention, latency, guard result, and terminal outcome separately. When a stale prediction or oversized action appears, the runtime must reject it and enter the task-specific fallback. The spiral from Week 14 is deliberate: dataset contracts become policy contracts, and every rollout failure points back to evidence that can be repaired without contaminating final evaluation.",
      ],
      finishLine:
        "Two policy checkpoints run the same predeclared handover suite with paired case results, success counts, interventions, stale-output rejections, latency distribution, guard events, and failure stages; the report selects, revises, or rejects a candidate without altering handover-v1 or the frozen evaluation cases.",
    },
    learningContract: {
      whyNow:
        "The course now has a traceable demonstration release and a correct training workflow, allowing imitation behavior and closed-loop distribution shift to be studied without guessing data semantics.",
      ignoreForNow:
        "Do not train a foundation model, run open-ended reinforcement learning, claim broad autonomy, or use powered hardware. Compare small imitation policies on one bounded simulated handover; keep the MDP/RL contrast to a paper model and deterministic simulator.",
      unlocks:
        "A measured policy runtime and evaluation discipline support later VLA adaptation, edge deployment, safety harnesses, and capstone training.",
      evidence:
        "Provide policy input/action contracts, loss and component errors, a bounded imitation-versus-RL decision map with state, action, transition, reward, and reward-hacking counterexample, DAgger lineage, chunk timing, ACT tensor trace, frozen offline and rollout manifests, runtime deadlines, fallback tests, paired trial ledger, interventions, and exact checkpoint identities.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the fixed-suite comparator. Policy labs consume the learner-created handover-v1 release from Week 14 in a learner-pinned environment, optionally using ROS 2 Jazzy with Gazebo Harmonic for disconnected simulation; this repository does not bundle those fixtures, checkpoints, or simulator workspace.",
      compatibility:
        "Policy processors, feature schemas, checkpoint formats, action statistics, and inference APIs can change across library revisions. Pin the actual implementation and verify load, reset, output shape, decoder, and guard behavior before rollout.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-15-compare-handover-policies.mjs`; then load each chosen checkpoint in a fresh process, replay one golden observation, and verify reset state, decoded action, deadline decision, and fallback result.",
      driftRisk: "high",
    },
    starter: {
      title: "Compare policies on one immutable suite",
      fileName: "week-15-compare-handover-policies.mjs",
      language: "javascript",
      code: `const cases = [
  { id: "c1", a: true, aAgeMs: 50, b: true, bAgeMs: 40 },
  { id: "c2", a: false, aAgeMs: 60, b: true, bAgeMs: 55 },
  { id: "c3", a: true, aAgeMs: 120, b: true, bAgeMs: 65 },
  { id: "c4", a: false, aAgeMs: 80, b: true, bAgeMs: 140 },
  { id: "c5", a: true, aAgeMs: -1, b: true, bAgeMs: Number.NaN },
];
const deadlineMs = 100;
const validCase = (item, key) =>
  typeof item[key] === "boolean" &&
  Number.isFinite(item[key + "AgeMs"]) &&
  item[key + "AgeMs"] >= 0;
const score = (key) =>
  cases.filter((item) =>
    validCase(item, key) && item[key] && item[key + "AgeMs"] <= deadlineMs
  ).length;
const stale = (key) =>
  cases.filter((item) =>
    validCase(item, key) && item[key] && item[key + "AgeMs"] > deadlineMs
  ).length;
const invalid = (key) => cases.filter((item) => !validCase(item, key)).length;
const aSuccess = score("a");
const bSuccess = score("b");
const winner = bSuccess > aSuccess ? "policy-b" : "policy-a";
const output =
  "winner=" + winner +
  " a=" + aSuccess + "/" + cases.length +
  " b=" + bSuccess + "/" + cases.length +
  " staleA=" + stale("a") +
  " staleB=" + stale("b") +
  " invalidA=" + invalid("a") +
  " invalidB=" + invalid("b");
const expected = "winner=policy-b a=1/5 b=3/5 staleA=1 staleB=1 invalidA=1 invalidB=1";
if (output !== expected) throw new Error("comparison mismatch: " + output);
console.log(output);`,
      run: "node week-15-compare-handover-policies.mjs",
      expectedOutput:
        "winner=policy-b a=1/5 b=3/5 staleA=1 staleB=1 invalidA=1 invalidB=1",
      plantedFailure:
        "Both policies face the same deadline; stale c3/c4 and c5's negative or non-finite ages are reported separately so future-dated or unclassifiable results cannot improve either score.",
    },
    dayThreads: [
      {
        dayId: 99,
        bridge:
          "Load handover-v1 without changing its contracts. Behavior cloning learns from teacher actions; an MDP instead names state, action, transition, and reward, while reinforcement learning improves from simulated return. Draw a decision map: choose imitation when demonstrations define the task, and consider bounded simulation-only RL when a valid reward and exploration envelope exist. Plant a reward for speed alone and show how collision can become a high-scoring hack.",
        whyNow:
          "Behavior cloning is the simplest measurable use of the frozen demonstration pairs.",
        ignoreForNow:
          "Ignore autonomous claims and complex architectures; establish one transparent supervised baseline.",
        unlocks:
          "A policy whose closed-loop distribution failures can be observed.",
      },
      {
        dayId: 100,
        bridge:
          "Roll the baseline in the simulator until it reaches the crooked state absent from clean demonstrations. Keep learner proposal, executed command, supervisor action, intervention, and abstention distinct. Ask the expert for a label only when the saved observation is attributable and safe, aggregate that state under a new lineage, retrain, and evaluate separately. The correction loop targets learner-visited states without rewriting handover-v1 or borrowing final cases.",
        whyNow:
          "The baseline reveals covariate shift that more original-route demonstrations do not directly repair.",
        ignoreForNow:
          "Ignore online learning on hardware; run one bounded DAgger-style correction cycle.",
        unlocks:
          "A corrected candidate and evidence about recovery-state coverage.",
      },
      {
        dayId: 101,
        bridge:
          "The handover depends on recent motion, so compare a single observation, observation history, and predicted action chunk without confusing them. Near the episode end, mask padded targets rather than training zeros as teacher behavior. Execute only a declared chunk prefix, re-observe, and measure how long an obsolete action can remain queued. The crooked approach should trigger a timely update instead of replaying an attractive old sequence.",
        whyNow:
          "Temporal context can improve coherence while increasing stale-action exposure.",
        ignoreForNow:
          "Ignore long-horizon planning; reason about bounded history, prediction, and execution horizons.",
        unlocks:
          "A responsive chunk contract suitable for an ACT-style policy.",
      },
      {
        dayId: 102,
        bridge:
          "Trace the ACT candidate through image and robot-state features, future teacher actions, the training-only latent encoder, sequence decoder, mask, reconstruction term, and weighted latent regularization. At inference the demonstrated future disappears, so verify the saved prior convention and output shapes in a fresh process. The architecture matters because every tensor and timing choice connects back to the handover action contract.",
        whyNow:
          "The chosen chunk representation can now be placed inside a concrete sequence-prediction model.",
        ignoreForNow:
          "Ignore large-scale tuning; inspect one maintained configuration and its train-versus-inference boundary.",
        unlocks:
          "An ACT-style checkpoint that can enter the same guarded evaluation path.",
      },
      {
        dayId: 103,
        bridge:
          "Score both candidates on frozen recorded examples, then on a separate closed-loop handover suite. Keep grouped offline error, success, intervention, stage failure, and initial condition distinct. If the DAgger candidate improves rollout recovery while average action loss worsens slightly, treat the disagreement as diagnostic evidence rather than selecting whichever metric flatters it. Any case used for repair leaves the untouched final boundary.",
        whyNow:
          "Offline imitation and interactive task completion answer different engineering questions.",
        ignoreForNow:
          "Ignore broad statistical claims; preserve denominators and compare the declared cases.",
        unlocks:
          "An evidence design that can make a fair policy decision.",
      },
      {
        dayId: 104,
        bridge:
          "Wrap the selected checkpoint in a clocked policy loop: reset state, acquire fresh input, reproduce processing, infer before expiry, decode named units, validate limits and rate, execute briefly, and observe again. Inject a 140 ms result like the starter’s c4 case and require rejection plus the declared hold, stop request, or handoff. A model answer is never allowed to become valid merely because it arrived eventually.",
        whyNow:
          "Evaluation needs the same timing and guard boundary that real integration would enforce.",
        ignoreForNow:
          "Ignore safety-rated control and fleet deployment; prove one application-level fallback in simulation.",
        unlocks:
          "A bounded policy runtime reusable by later embodied-AI systems.",
      },
      {
        dayId: 105,
        bridge:
          "Run policy-a and policy-b over identical case IDs, resets, scorer, guard, deadline, and allowed intervention. Preserve paired outcomes, every failure video, p95 age, stale rejections, and confidence limits from the small sample. Select, revise, or reject using the rule written before results. The report closes the Week 14 to Week 15 spiral by linking every improvement and failure back to dataset, correction, runtime, and case identities.",
        whyNow:
          "Only a fixed paired suite can convert the week’s policy work into a defensible comparison.",
        ignoreForNow:
          "Ignore cherry-picked demos and post-result threshold changes; account for every frozen trial.",
        unlocks:
          "A measured policy baseline for VLA, deployment, and capstone chapters.",
      },
    ],
  },
  {
    week: 16,
    mission: {
      name: "Run the narrow-aisle FleetOps shift",
      opening: [
        "Courier-A and Courier-B share one narrow warehouse aisle, two docks, and a simulated battery constraint. A web operator submits mission M-204, loses the browser connection, retries, and later sees a healthy video beside stale mission state. Meanwhile one robot blocks the aisle and a canary release slows event processing. This is no longer a policy-training problem. The mission is to preserve authority, identity, ordering, cancellation, and observable failure across robot, edge, fleet, cloud, and operator boundaries.",
        "Build FleetOps as a chain of explicit contracts. Mission M-204 receives one durable identity, task allocation respects capability and shared resources, REST acceptance maps to a revisioned WebSocket stream and a ROS 2 action, database state and outgoing events commit together, and the HMI distinguishes requested from measured reality. The canary must fail visibly and roll back as a compatible bundle. Week 17 will challenge this exact baseline through traceability, SIL, HIL, and customer acceptance, while Week 25 will revisit it as an operating service.",
      ],
      finishLine:
        "A two-robot simulated shift completes a frozen mission matrix through one versioned API and correlated evidence path, survives retries, duplicate and missing events, browser disconnect, deadlock, overload, and a failed canary, then reports mission SLOs and every rollback result without losing durable state.",
    },
    learningContract: {
      whyNow:
        "The course has working robot behaviors and guarded learned policies; production value now depends on coordinating missions and operators without moving safety-critical authority into an unreliable web or cloud path.",
      ignoreForNow:
        "Do not build a global fleet product, connect unsupervised hardware, or treat the browser as a safety controller. Qualify two simulated robots and one narrow resource.",
      unlocks:
        "The versioned FleetOps baseline becomes Week 17’s validation target and later Week 25’s deployment, telemetry, replay, and acceptance subject.",
      evidence:
        "Provide layer and failure-boundary tables, mission state machine, allocator cases, API schema, idempotency records, revisioned stream, ROS action correlation, durable/outbox evidence, lag and duplicate tests, HMI freshness and authority tests, canary manifest, rollback drill, traces, metrics, and SLO report.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the event-order starter. The integrated mission uses ROS 2 Jazzy with Gazebo Harmonic and two simulated robots; local service, browser, and data components must be pinned by the project that assembles them.",
      compatibility:
        "REST, WebSocket, DDS, database, cache, event-log, WebRTC, Open-RMF, container, and browser behavior can drift independently. Preserve versioned schemas and compatibility evidence rather than asserting untested cross-version support.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-16-audit-mission-events.mjs`; then start the two-robot baseline, submit the same idempotency key twice, disconnect and resynchronize the HMI, complete one mission, and verify one terminal identity across API, event, ROS, and trace records.",
      driftRisk: "high",
    },
    starter: {
      title: "Reject duplicate and gapped mission events",
      fileName: "week-16-audit-mission-events.mjs",
      language: "javascript",
      code: `const events = [
  { id: "e1", mission: "M-204", sequence: 1, state: "created" },
  { id: "e1", mission: "M-204", sequence: 1, state: "created" },
  { id: "e2", mission: "M-204", sequence: 2, state: "assigned" },
  { id: "e3", mission: "M-999", sequence: 3, state: "moving" },
  { id: "e4", mission: "M-204", sequence: 4, state: "completed" },
];
const missionId = "M-204";
const seen = new Set();
let revision = 0, state = "none", duplicate = 0;
let foreignMission = 0, gap = 0, accepted = 0;
for (const event of events) {
  if (event.mission !== missionId) { foreignMission += 1; continue; }
  if (seen.has(event.id)) {
    duplicate += 1;
    continue;
  }
  seen.add(event.id);
  if (event.sequence !== revision + 1) {
    gap += 1;
    continue;
  }
  revision = event.sequence;
  state = event.state;
  accepted += 1;
}
const output =
  "mission=" + missionId + " state=" + state +
  " accepted=" + accepted +
  " duplicate=" + duplicate +
  " foreignMission=" + foreignMission +
  " gap=" + gap;
const expected = "mission=M-204 state=assigned accepted=2 duplicate=1 foreignMission=1 gap=1";
if (output !== expected) throw new Error("event audit mismatch: " + output);
console.log(output);`,
      run: "node week-16-audit-mission-events.mjs",
      expectedOutput:
        "mission=M-204 state=assigned accepted=2 duplicate=1 foreignMission=1 gap=1",
      plantedFailure:
        "Event e3 belongs to another mission and e4 skips this mission's sequence 3; accepting either would cross-contaminate state or declare completion across an unknown transition.",
    },
    dayThreads: [
      {
        dayId: 106,
        bridge:
          "Draw Courier-A, Courier-B, edge executors, fleet services, operator browser, and cloud history as owners with different deadlines. For every arrow, name identity, schema, clock, freshness, retry, authority, and disconnected behavior. Remove the browser and cloud links in simulation. Robot-local collision, command limits, and timeout behavior must remain effective while the fleet stops inventing work from stale state.",
        whyNow:
          "Reliable fleet behavior starts by placing responsibility at the layer that can meet its failure and timing contract.",
        ignoreForNow:
          "Ignore vendor scale and multi-site topology; qualify one two-robot boundary map.",
        unlocks:
          "An architecture whose failures can be injected without creating two authorities.",
      },
      {
        dayId: 107,
        bridge:
          "Mission M-204 needs a lifecycle from requested through accepted, assigned, executing, canceled, failed, or completed. Allocate work by capability, battery reserve, dock access, and the narrow aisle, then plant opposing reservations that deadlock the couriers. Apply a deterministic escape rule and preserve rejected assignments. The scheduler coordinates business intent; each robot still owns local feasibility and safe execution.",
        whyNow:
          "The architecture needs a concrete mission and shared-resource model before interfaces can preserve it.",
        ignoreForNow:
          "Ignore globally optimal scheduling; prove feasible allocation, cancellation, and deadlock escape.",
        unlocks:
          "A versioned state machine that every API and event can reference.",
      },
      {
        dayId: 108,
        bridge:
          "Expose M-204 through a versioned REST request with one stable idempotency key, map acceptance to an ordered WebSocket stream, and correlate execution to a ROS 2 action. Retry the timed-out create, race cancellation with success, and reconnect after deliberately skipping a revision. The client must reload an authoritative snapshot rather than guess, while unsupported schemas and expired commands stop before simulated motion.",
        whyNow:
          "Three interfaces must preserve one business operation through retry, reconnect, and cancellation races.",
        ignoreForNow:
          "Ignore broad public API design; implement one mission contract end to end.",
        unlocks:
          "A correlated interface path with explicit terminal-state ownership.",
      },
      {
        dayId: 109,
        bridge:
          "Store M-204 and its outgoing event intention in one durable transaction, rebuild expiring presence after cache loss, and process keyed events with sequence and identity checks. Inject the starter’s duplicate and gap, a consumer restart, a poison schema, and lag beyond the bounded queue. PostgreSQL remains mission truth, Redis remains disposable coordination, and event replay cannot apply the same durable transition twice.",
        whyNow:
          "Interface correctness collapses when storage and event delivery disagree under failure.",
        ignoreForNow:
          "Ignore production cluster tuning; prove authority, outbox, replay, and backpressure semantics locally.",
        unlocks:
          "Durable mission history and observable event processing for the operator and tests.",
      },
      {
        dayId: 110,
        bridge:
          "Build the operator view around requested, accepted, commanded, and measured state rather than one green status. Show independent ages for WebSocket data, video, transforms, and robot telemetry. Acquire one server-authorized lease for teleoperation, then lose browser focus and network renewal. A robot- or edge-side expiry must stop simulated commands while the UI visibly admits stale or unknown state.",
        whyNow:
          "Operators need truthful state and bounded authority when media and command paths fail independently.",
        ignoreForNow:
          "Ignore polished styling and remote hardware; prove freshness, authorization, lease, and local timeout behavior.",
        unlocks:
          "An HMI whose evidence can participate in acceptance rather than mask failure.",
      },
      {
        dayId: 111,
        bridge:
          "Seal code, configuration, schema, maps, calibration assumptions, and procedures as one canary release. Deploy it first to Courier-A during an idle simulated window, inject event lag, and stop promotion when the health gate fails. Roll back image, configuration, schema-compatible state, and active mission procedure together. Courier-B remains the known-good comparison instead of receiving a floating latest tag.",
        whyNow:
          "A working fleet still needs reversible change control before it can be operated responsibly.",
        ignoreForNow:
          "Ignore fleet-wide automation; rehearse one canary and one complete rollback bundle.",
        unlocks:
          "A versioned deployment baseline that Week 17 can validate and later operations can restore.",
      },
      {
        dayId: 112,
        bridge:
          "Run the full narrow-aisle matrix with duplicate requests, lost stream revision, deadlock, stale video, cache loss, slow consumer, canceled action, and failed canary. Correlate API records, events, ROS feedback, logs, metrics, traces, and simulated robot outcomes under mission identity. Report success, latency, lag, recovery, and rollback objectives separately. This frozen FleetOps baseline now passes to Week 17 as a system to challenge, not a demo to admire.",
        whyNow:
          "Only an end-to-end fault matrix can show whether the distributed contracts agree.",
        ignoreForNow:
          "Ignore customer deployment claims; account for every simulated scenario and objective.",
        unlocks:
          "The explicit Week 16 to Week 17 validation target and a later Week 25 operations baseline.",
      },
    ],
  },
  {
    week: 17,
    mission: {
      name: "Prove the narrow-aisle night shift",
      opening: [
        "Week 16 ended with a functioning FleetOps baseline, but a working demo is not an acceptance package. A customer now asks whether Courier-A and Courier-B can survive stale localization, delayed messages, a dock sensor failure, blocked traffic, an adapter mismatch, and a release rollback during the night shift. Begin with requirement R-17: no mission may enter the shared aisle when authority or occupancy evidence is stale. Carry that single requirement through risk analysis, automated tests, simulation, SIL, HIL, interface checks, and commissioning evidence.",
        "The mission is a proof chain, not a test-count contest. Each level must expose a distinct defect and state what it cannot represent. Deterministic scenarios use pinned worlds and replayable seeds; robustness runs remain separate. HIL exercises real interfaces against controlled emulators without pretending to reproduce payload, floor, wiring, or human hazards. Safety standards remain under qualified ownership. The final FAT/SAT record preserves facts, hypotheses, corrective actions, rollback, residual risk, and an explicit go or no-go decision that Week 25 can later operationalize.",
      ],
      finishLine:
        "A bidirectional acceptance package traces R-17 and the remaining FleetOps risks to component, launch, deterministic simulation, SIL, HIL, industrial-interface, safety-awareness, FAT, SAT, incident, corrective-action, and rollback evidence, ending in an explicit reproducible go/no-go decision.",
    },
    learningContract: {
      whyNow:
        "Week 16 supplied a versioned distributed robot service; it now needs risk-linked evidence across software, simulation, interfaces, restricted hardware boundaries, and customer acceptance.",
      ignoreForNow:
        "Do not certify functional safety, energize unapproved machinery, or inflate passing test counts. Qualify the declared simulated and restricted-energy FleetOps scope.",
      unlocks:
        "The acceptance ladder and traceability records become reusable gates for later VLA systems, capstone release, and Week 25 production operations.",
      evidence:
        "Provide requirements and FMEA links, test-layer rationale, deterministic scenario manifests, seeds and replay, SIL/HIL fault contracts, adapter conformance cases, awareness-level safety table, FAT/SAT records, incident timeline, corrective-action regression, rollback evidence, and signed decision.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the evidence-gate starter. The system baseline is the Week 16 ROS 2 Jazzy and Gazebo Harmonic FleetOps build; HIL work is limited to approved restricted-energy interfaces or emulators.",
      compatibility:
        "Gazebo or alternative simulator worlds, ROS testing packages, Open-RMF adapters, VDA 5050 interfaces, PLC/WMS boundaries, and hardware emulators change independently. Pin every tested artifact and do not infer conformance from a nearby revision.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-17-fleetops-release-gate.mjs`; then execute one known-good Week 16 mission, one stale-authority rejection, one deterministic replay, and one rollback using immutable code and configuration identities.",
      driftRisk: "high",
    },
    starter: {
      title: "Issue a release decision from complete evidence",
      fileName: "week-17-fleetops-release-gate.mjs",
      language: "javascript",
      code: `const cases = [
  { id: "R17-unit", status: "pass", evidence: true },
  { id: "R17-launch", status: "pass", evidence: true },
  { id: "R17-stale", status: "fail", evidence: true },
  { id: "R22-dock", status: "pass", evidence: false },
  { id: "R30-schema", status: "unknown", evidence: "false" },
];
const validStatus = new Set(["pass", "fail"]);
const schemaValid = (test) =>
  typeof test.id === "string" && test.id.length > 0 &&
  validStatus.has(test.status) && typeof test.evidence === "boolean";
const validCases = cases.filter(schemaValid);
const invalidSchema = cases.length - validCases.length;
const passed = validCases.filter(
  (test) => test.status === "pass" && test.evidence,
).length;
const failed = validCases.filter((test) => test.status === "fail").length;
const missingEvidence = validCases.filter((test) => test.evidence === false).length;
const decision =
  failed === 0 && missingEvidence === 0 && invalidSchema === 0
    ? "PASS" : "NEEDS REVISION";
const output =
  "decision=" + decision +
  " passed=" + passed +
  " failed=" + failed +
  " missingEvidence=" + missingEvidence +
  " invalidSchema=" + invalidSchema;
const expected =
  "decision=NEEDS REVISION passed=2 failed=1 missingEvidence=1 invalidSchema=1";
if (output !== expected) throw new Error("release gate mismatch: " + output);
console.log(output);`,
      run: "node week-17-fleetops-release-gate.mjs",
      expectedOutput:
        "decision=NEEDS REVISION passed=2 failed=1 missingEvidence=1 invalidSchema=1",
      plantedFailure:
        "The dock case lacks evidence, the stale-authority case fails, and the final row has an unknown status plus string evidence; truthiness or ignored statuses would issue a false release.",
    },
    dayThreads: [
      {
        dayId: 113,
        bridge:
          "Translate the night-shift promise into measurable requirements, beginning with R-17’s stale-authority prohibition. Connect hazards, initiating conditions, failure modes, effects, controls, test cases, evidence, owners, and residual risk without collapsing them into one column. A high risk number does not prove a cause, and an implemented control does not prove effectiveness. Freeze the traceability identity that will follow the requirement through every later gate.",
        whyNow:
          "Testing needs explicit claims and risks before a passing result can mean anything.",
        ignoreForNow:
          "Ignore exhaustive certification analysis; build a reviewable FleetOps requirement and FMEA set.",
        unlocks:
          "Acceptance criteria that determine which tests and evidence are necessary.",
      },
      {
        dayId: 114,
        bridge:
          "Place each R-17 check at the smallest boundary capable of exposing its defect: pure transition logic, service integration, ROS 2 launch, or complete mission. Plant a passing unit test beside a failing launch interaction to show why test count is not confidence. Preserve logs and terminal state for every layer, and keep one end-to-end path that proves the pieces agree under cancellation and restart.",
        whyNow:
          "Traceable requirements now need tests chosen for fault-detection power, not convenience.",
        ignoreForNow:
          "Ignore maximizing coverage percentages; justify each layer and its blind spots.",
        unlocks:
          "A regression stack that can feed deterministic scenarios and CI.",
      },
      {
        dayId: 115,
        bridge:
          "Freeze the aisle world, robot starts, mission manifest, fault schedule, assertions, artifacts, and selected seeds. Re-run the stale-localization and blocked-aisle cases to establish deterministic regression, then separate additional randomized robustness exploration. A seed is evidence only with the exact simulator, assets, physics, and code identity. Preserve replay commands so another engineer can reproduce the same disputed transition.",
        whyNow:
          "System requirements need repeatable environments before failures can be compared across changes.",
        ignoreForNow:
          "Ignore claiming simulator determinism across arbitrary platforms; pin and measure this matrix.",
        unlocks:
          "Replayable system cases suitable for SIL and later failure comparison.",
      },
      {
        dayId: 116,
        bridge:
          "Reuse one fault contract across SIL and an approved HIL emulator: injected sensor value, start time, duration, expected detection, bounded response, terminal state, and evidence. Challenge clock drift, packet loss, stuck dock input, and device restart. Report what the emulator proves about real interfaces and timing, then state the payload, wiring, floor, contact, and human hazards it cannot reproduce.",
        whyNow:
          "The validation ladder must increase realism without erasing each level’s evidence limits.",
        ignoreForNow:
          "Ignore unrestricted hardware testing; compare controlled SIL and HIL responses.",
        unlocks:
          "A shared fault vocabulary and measured promotion gate between test levels.",
      },
      {
        dayId: 117,
        bridge:
          "Place a versioned external boundary between FleetOps intent and one adapter. Distinguish warehouse orders, fleet traffic, vendor navigation, equipment control, and robot-local safety ownership. Send unsupported, duplicated, stale, and canceled messages through the interface and preserve exact acknowledgments. A syntactically valid VDA 5050 or Open-RMF message is not proof that downstream navigation or machinery completed the requested physical effect.",
        whyNow:
          "Customer acceptance depends on industrial interfaces whose ownership differs from internal mission logic.",
        ignoreForNow:
          "Ignore broad standard conformance claims; test the exact supported message subset and failure semantics.",
        unlocks:
          "An evidence-backed external contract ready for FAT and SAT review.",
      },
      {
        dayId: 118,
        bridge:
          "Review the aisle application with a qualified-owner boundary in view. Distinguish an application stop request from emergency stop, protective stop, and safe torque off; identify zones, speed-dependent separation, restart conditions, and periodic checks at awareness level. Do not validate a safety function in classroom software. Instead, produce the questions, evidence gaps, and interface assumptions that competent safety and site owners must accept or block.",
        whyNow:
          "A technically correct FleetOps test can still omit physical hazards and independently engineered protective functions.",
        ignoreForNow:
          "Ignore certification and safety-PLC implementation; document scope and escalate ownership correctly.",
        unlocks:
          "A bounded safety-awareness record that prevents software evidence from being overstated.",
      },
      {
        dayId: 119,
        bridge:
          "Rehearse FAT in the pinned environment, SAT against the declared site assumptions, and commissioning with an immutable checklist. When R-17 fails, separate the observed timeline from hypotheses, identify the earliest supported cause, apply a corrective change, rerun affected and regression cases, and prove rollback. Issue the go or no-go record with residual risks. Preserve this package because Week 25 will turn the same gates into continuous operations.",
        whyNow:
          "The spiral closes only when test evidence produces a customer-facing decision and a recoverable incident record.",
        ignoreForNow:
          "Ignore schedule pressure and demo polish; make every deviation and blocker explicit.",
        unlocks:
          "A validated FleetOps baseline for embodied-AI integration and later production operations.",
      },
    ],
  },
  {
    week: 18,
    mission: {
      name: "Ground the red-mug instruction before any command",
      opening: [
        "A recorded tabletop scene contains two red mugs, one plate, and a left tray. The instruction says, “Put the red mug beside the plate into the left tray.” A visual-language model may describe the scene, an action policy may propose a motion sequence, and an embodied reasoner may choose typed skills, but those are different artifacts with different authority. The mission traces image, text, robot state, time, model processing, normalized action, decoder, validator, controller, and measured result without allowing a fluent answer to bypass deterministic checks.",
        "Use one synthetic or recorded episode and correlation ID. Preserve camera and embodiment identity, make ambiguous references produce clarification or rejection, compare action representations without treating tokens as torques, and freeze object, scene, prompt, pose, and embodiment slices before evaluation. The policy remains disconnected or simulated. Every late, malformed, ungrounded, or out-of-range proposal follows a visible failure branch. The week finishes with a value-level architecture review that shows exactly which pixels and words contributed to which eligible command.",
      ],
      finishLine:
        "A correlation-complete architecture trace classifies every model component, grounds the selected mug to fresh entity evidence, preserves embodiment and action semantics, rejects ambiguous, stale, malformed, and out-of-range proposals, and reports held-out success, intervention, latency, unsafe-proposal, and worst-slice results.",
    },
    learningContract: {
      whyNow:
        "The course now has perception, robot data, learned policies, guarded runtimes, FleetOps, and validation evidence; VLA concepts can therefore be attached to real system contracts instead of presented as magic.",
      ignoreForNow:
        "Do not train a foundation model, call a hosted demo a robot controller, or connect unreviewed outputs to powered hardware. Trace one bounded policy path.",
      unlocks:
        "The architecture contract supports Week 19 ecosystem selection and adaptation, Week 20 typed agent skills, Week 21 safety evaluation, and later capstone deployment.",
      evidence:
        "Provide component classification, input and output schemas, tensor and token trace, embodiment manifest, action-representation comparison, grounding table, clarification and rejection cases, confidence-bin calibration and abstention evidence, frozen generalization matrix, correlation timeline, decoder and guard tests, controller feedback, and exact artifact identities.",
    },
    environment: {
      baseline:
        "Repository-supported Node.js 22.13.0 or newer runs the action-eligibility starter. The main work uses recorded or synthetic multimodal fixtures and, where execution context is needed, ROS 2 Jazzy with Gazebo Harmonic in a disconnected simulation.",
      compatibility:
        "Model cards, hosted APIs, checkpoints, processors, tokenizers, action adapters, licenses, and access conditions can change quickly. Pin every artifact actually tested and mark unverified external capabilities unknown.",
      contractReviewedOn: "2026-07-25",
      runtimeEvidence: STARTER_RUNTIME_EVIDENCE,
      smokeCheck:
        "Run `node week-18-guard-grounded-actions.mjs`; then replay one golden observation through the chosen processor and decoder, confirming entity binding, shapes, units, timestamps, rejection reasons, and controller eligibility without sending powered commands.",
      driftRisk: "high",
    },
    starter: {
      title: "Reject ungrounded, stale, and oversized proposals",
      fileName: "week-18-guard-grounded-actions.mjs",
      language: "javascript",
      code: `const proposals = [
  { id: "p1", entity: "mug-2", ageMs: 40, deltaM: 0.04 },
  { id: "p2", entity: null, ageMs: 35, deltaM: 0.02 },
  { id: "p3", entity: "mug-2", ageMs: 180, deltaM: 0.03 },
  { id: "p4", entity: "mug-2", ageMs: 45, deltaM: 0.18 },
  { id: "p5", entity: "mug-2", ageMs: Number.NaN, deltaM: Number.NaN },
  { id: "p1", entity: "mug-2", ageMs: 30, deltaM: 0.01 },
  { id: "p7", entity: "mug-3", ageMs: 30, deltaM: 0.01 },
];
const expectedEntity = "mug-2"; const seen = new Set();
const reasons = []; let eligible = 0;
for (const proposal of proposals) { let reason = "";
  if (typeof proposal.id !== "string" || proposal.id.length === 0) reason = "invalid-schema";
  else if (seen.has(proposal.id)) reason = "duplicate";
  else {
    seen.add(proposal.id);
    if (proposal.entity !== expectedEntity) reason = proposal.entity ? "wrong-entity" : "ambiguous";
    else if (
    !Number.isFinite(proposal.ageMs) || proposal.ageMs < 0 ||
    !Number.isFinite(proposal.deltaM)
    ) reason = "invalid-number";
    else if (proposal.ageMs > 100) reason = "stale";
    else if (Math.abs(proposal.deltaM) > 0.05) reason = "out-of-range";
  }
  if (reason) reasons.push(reason);
  else eligible += 1;
}
const output =
  "eligible=" + eligible +
  " rejected=" + reasons.length +
  " reasons=" + reasons.join("|");
const expected =
  "eligible=1 rejected=6 reasons=ambiguous|stale|out-of-range|invalid-number|duplicate|wrong-entity";
if (output !== expected) throw new Error("action guard mismatch: " + output);
console.log(output);`,
      run: "node week-18-guard-grounded-actions.mjs",
      expectedOutput:
        "eligible=1 rejected=6 reasons=ambiguous|stale|out-of-range|invalid-number|duplicate|wrong-entity",
      plantedFailure:
        "The guard must reject ambiguous, stale, oversized, non-finite, replayed, and wrong-entity proposals; truthiness, NaN comparisons, or missing identity checks cannot grant eligibility.",
    },
    dayThreads: [
      {
        dayId: 120,
        bridge:
          "Classify each red-mug pipeline component by actual inputs, outputs, state, and authority. The scene describer can answer a visual question, the action policy can propose bounded action data, and a reasoner can assemble typed skills, but none inherits controller authority from its label. Place deterministic grounding, validation, collision, cancellation, and feedback around the models so the mission begins with an honest system boundary.",
        whyNow:
          "VLM, VLA, and embodied reasoning must be separated before their evidence or risk can be evaluated.",
        ignoreForNow:
          "Ignore vendor rankings and model scale; classify one concrete pipeline.",
        unlocks:
          "A component map that prevents language output from masquerading as physical execution.",
      },
      {
        dayId: 121,
        bridge:
          "Trace the camera crop, tokenized instruction, proprioceptive state, and source timestamps into multimodal features and an action output. Write shapes, axis meanings, frame, units, processor identity, checkpoint, and action horizon beside each boundary. Follow one numeric value through normalization and decoding. The red mug is not grounded merely because its words influenced a token; the trace must retain the physical evidence used later.",
        whyNow:
          "The component map needs value-level contracts before errors can be located.",
        ignoreForNow:
          "Ignore transformer derivations; inspect shapes, semantics, timing, and ownership.",
        unlocks:
          "A reproducible pixel-and-word to proposed-action trace.",
      },
      {
        dayId: 122,
        bridge:
          "Compare data from two robot embodiments without pretending their equally shaped action arrays mean the same thing. Preserve camera mounting, joint order, gripper type, units, frames, rate, calibration, controller semantics, and valid masks in embodiment manifests. Share the red-mug task label only where the success predicate is comparable, then route outputs through embodiment-specific adapters. Unknown mappings remain rejected rather than guessed.",
        whyNow:
          "Pretraining and dataset mixing require semantic alignment beyond a common storage envelope.",
        ignoreForNow:
          "Ignore large-scale corpus construction; reconcile two small manifests and one task.",
        unlocks:
          "Cross-embodiment examples whose differences remain explicit during adaptation and evaluation.",
      },
      {
        dayId: 123,
        bridge:
          "Represent the mug action as a discrete token, direct continuous value, diffusion-generated sequence, and flow-generated sequence on paper or small arrays. Compare resolution, multimodality, generation cost, horizon, re-observation, and physical decoding. None of these mathematical forms supplies joint limits, collision checks, freshness, or controller readiness. The mission asks which representation fits the task contract, not which research label sounds most advanced.",
        whyNow:
          "The pipeline can now compare output families against the same physical action meaning.",
        ignoreForNow:
          "Ignore training these model families; reason about generation and execution contracts.",
        unlocks:
          "A justified action representation and declared guarded decoder.",
      },
      {
        dayId: 124,
        bridge:
          "Resolve “the red mug beside the plate” against fresh entity IDs, attributes, relations, frames, timestamps, and confidence. With two plausible mugs, clarification is the correct system state. After the operator specifies mug-2, re-observe before acting because the scene may have changed. Preserve original text, candidates, clarification, chosen entity, preconditions, and rejection reason so language diversity does not erase physical grounding.",
        whyNow:
          "An action representation cannot be used until language refers to one current physical entity and admissible goal.",
        ignoreForNow:
          "Ignore open-ended dialogue quality; prove one bounded grounding and clarification protocol.",
        unlocks:
          "A typed, fresh task binding eligible for policy evaluation.",
      },
      {
        dayId: 125,
        bridge:
          "Freeze red-mug trials across objects, backgrounds, prompt paraphrases, poses, views, and embodiments before inspecting results. Bin declared confidence and compare it with empirical correctness; confidence is not calibrated because it sounds precise. Predeclare an abstention threshold, then report accepted-case accuracy, abstention coverage, unsafe proposals, and worst slices separately. Any revealed case used to tune that threshold becomes development evidence and leaves the untouched claim.",
        whyNow:
          "Grounded nominal behavior must be challenged across declared changes before architecture review.",
        ignoreForNow:
          "Ignore universal generalization claims; measure the bounded frozen matrix.",
        unlocks:
          "Evidence that identifies exactly which object, scene, prompt, pose, or embodiment breaks.",
      },
      {
        dayId: 126,
        bridge:
          "Replay one successful mug placement and the ambiguous, stale, malformed, oversized, controller-rejected, and execution-deviation branches under one correlation ID. Record camera and instruction versions, intermediate shapes, model and processor, decoded units, guard decision, publish and acceptance times, controller feedback, and measured outcome. The trace closes the mission only when another engineer can locate the first divergence and reproduce why a proposal moved forward or stopped.",
        whyNow:
          "The chapter’s separate concepts become credible only as one end-to-end, failure-complete architecture record.",
        ignoreForNow:
          "Ignore model adaptation and agent planning; freeze the foundational contract first.",
        unlocks:
          "The exact Week 18 handoff to current VLA selection, typed agents, and safety harnesses.",
      },
    ],
  },
] as const;
