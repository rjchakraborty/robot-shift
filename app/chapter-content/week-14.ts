import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week14Content = {
  week: 14,
  title: "Collect demonstrations as synchronized, reviewable robot datasets",
  purpose:
    "Treat robot demonstrations as an engineered measurement product rather than a folder of convenient videos. This chapter defines comparable episodes, collects bounded teleoperation traces, makes action semantics explicit, tests clock alignment, versions a training-safe schema and split, audits failures and coverage, then publishes a dataset card and episode inspector whose claims can be checked against the underlying records.",
  prerequisites: [
    "Complete Week 13's tensor, dataset, dataloader, split, leakage, experiment-lineage, and model-card exercises using saved or synthetic data.",
    "Recognize observations, robot state, commands, frames, units, timestamps, rates, latency, reset conditions, success criteria, safe aborts, and independent evaluation evidence.",
    "Use a spreadsheet or a short Python program to validate rows, calculate counts and time differences, and create simple tables without assuming a GPU.",
    "Keep this week's collection unpowered, simulated, or properly supervised on an already commissioned platform; a recording command is not a motion-safety system.",
  ],
  outcomes: [
    "Define policy, observation, action, episode, trajectory, reset, and terminal semantics so every recorded attempt has a comparable physical meaning.",
    "Design a teleoperation collection path that preserves operator input, robot response, calibration identity, interventions, task result, and safe cancellation without confusing demonstration success with autonomous capability.",
    "Specify joint, Cartesian, velocity, and chunked action spaces with ordered components, units, frames, limits, rate, and execution semantics.",
    "Measure alignment among camera, state, and command streams using acquisition timestamps, clock-domain evidence, a declared tolerance, missing-sample counts, and causal lag checks.",
    "Create a versioned multimodal schema and leakage-resistant episode split whose feature names, shapes, dtypes, units, frames, metadata, and grouping rules are machine-checkable.",
    "Review structural defects, failed behavior, labels, operator habits, condition coverage, and distribution shift without deleting inconvenient evidence or mistaking augmentation for collected coverage.",
    "Ship a non-sensitive dataset card and synchronized episode inspector with provenance, licensing, exclusions, limitations, checksums, and recalculable duration and coverage summaries.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
  ],
  sources: [
    {
      label: "LeRobot — Getting Started with Real-World Robots",
      url: "https://huggingface.co/docs/lerobot/main/en/getting_started_real_world_robot",
      useFor:
        "Maintainer workflow for calibration identity, teleoperation, camera and joint visualization, bounded episode recording, reset time, cancellation and re-recording, local storage, and explicit Hub-upload behavior.",
    },
    {
      label: "LeRobotDataset v3 format — maintainer specification",
      url: "https://github.com/huggingface/lerobot/blob/main/docs/source/lerobot-dataset-v3.mdx",
      useFor:
        "Primary format description for Parquet sensorimotor rows, MP4 camera streams, timestamps, canonical feature metadata, task and episode indexes, file-versus-episode boundaries, temporal windows, and finalization.",
    },
    {
      label: "ROS 2 message_filters — timestamp synchronization API",
      url: "https://docs.ros.org/en/ros2_packages/rolling/api/message_filters/message_filters.html",
      useFor:
        "Official semantics for exact and approximate synchronization by message-header timestamps, queueing, tolerance, clock offsets, and the risk of substituting arrival time for acquisition time.",
    },
    {
      label: "LeRobot — Dataset Tools and Visualization",
      url: "https://huggingface.co/docs/lerobot/en/using_dataset_tools",
      useFor:
        "Maintainer tooling contract for inspecting feature metadata, deleting or splitting whole episodes, preserving originals, and viewing camera, state, and action streams on a seekable episode timeline.",
    },
    {
      label: "Hugging Face Hub — Dataset Cards",
      url: "https://huggingface.co/docs/hub/datasets-cards",
      useFor:
        "Official dataset-card and README metadata behavior for licensing, discoverability, context, responsible use, bias and limitation disclosure, and supported dataset modalities.",
    },
  ],
  days: [
    {
      dayId: 92,
      mentalModel:
        "A robot-learning episode is a labelled attempt envelope: one reproducible reset goes in, an ordered observation-action history unfolds, and exactly one success, timeout, failure, or safe-abort boundary closes it.",
      explanation: [
        "A policy is a rule that chooses an action from available observations and possibly recent history. An observation is information exposed to that rule, such as camera pixels, joint positions, gripper state, or a task instruction. An action is the command contract produced for execution. Keep commanded action separate from measured robot state because limits, latency, contact, disconnection, or an operator intervention can make the physical response differ.",
        "An episode represents one bounded attempt, not an arbitrary slice from a continuous log. Its reset specification states the starting object arrangement, robot mode, task text, sensor readiness, and anything randomized. Its terminal specification distinguishes success, timeout, task failure, operator abort, safety stop, and recording fault. The trajectory is the time-ordered sequence inside those boundaries, including observations, issued actions, measured state, and relevant event labels.",
        "Sampling rate describes intended cadence, while timestamps describe when individual records claim to occur. Six hundred samples at 20 Hz cover 30 seconds of nominal sample intervals, although the timestamp from the first sample to the last is normally 29.95 seconds when neither endpoint is duplicated. That arithmetic detects some gaps and boundary errors; it cannot establish that the images, states, actions, or outcome labels are semantically correct.",
        "Episodes are the natural unit for comparison and splitting because nearby frames share the same reset, operator behavior, scene, and outcome. Preserve aborted or malformed attempts in a raw ledger with explicit dispositions rather than silently renumbering good attempts. A training view may exclude a bad episode, but the exclusion rule, original identity, reviewer, and reason remain part of dataset lineage.",
      ],
      keyTerms: [
        {
          term: "Policy",
          meaning:
            "A rule or learned function that maps current observations and optional history or task context to an action.",
          physicalExample:
            "A sorting policy sees a camera image plus joint state and proposes the next bounded gripper command.",
        },
        {
          term: "Observation",
          meaning:
            "The timestamped information made available to a policy, with declared feature semantics rather than every hidden fact about the world.",
          physicalExample:
            "A front image and six measured joint angles are observations, while an object pose known only to the simulator can remain evaluation truth.",
        },
        {
          term: "Action",
          meaning:
            "A command expressed through a specific representation, order, unit, frame, limit, and execution rule.",
          physicalExample:
            "A six-value joint-position target in radians is a different action from six measured joint positions or six joint velocities.",
        },
        {
          term: "Episode",
          meaning:
            "One attempt bounded by an explicit reset and one terminal outcome, with a stable identity and task context.",
          physicalExample:
            "Episode 014 begins after three blocks return to marked zones and ends when all are sorted, time expires, or the operator aborts.",
        },
        {
          term: "Trajectory",
          meaning:
            "The ordered observations, actions, measured responses, and events recorded through an episode.",
          physicalExample:
            "A paper arm's timestamped joint-angle and waypoint rows form a trajectory from home pose to the target card.",
        },
      ],
      physicalExamples: [
        {
          title: "Paper-block sorting attempt",
          scenario:
            "Place three coloured paper squares on marked start boxes, move them one step at a time with a cardboard gripper, and stop at complete sorting, a 20-second timeout, a dropped square, or a declared abort.",
          lookFor:
            "The reset and four distinct terminal results make one attempt comparable with the next; an arbitrary ten-row window would not carry that meaning.",
        },
        {
          title: "Continuous kitchen video versus one task",
          scenario:
            "Imagine a fixed camera recording an hour of countertop activity that contains several cup placements, pauses, unrelated people, resets, and one spill.",
          lookFor:
            "The long file is storage, not one episode; task attempts require their own boundaries, identities, conditions, and outcomes even when several share a media file.",
        },
      ],
      workedExample: {
        title: "Audit one episode's time and boundary claims",
        setup:
          "Episode 014 claims a 20 Hz rate and contains 600 ordered rows. Its first timestamp is 42.000 s, its last is 71.950 s, reset-ready is recorded at 41.600 s, and success is recorded at 71.970 s.",
        steps: [
          "Check identity and order first: every row belongs to episode 014, frame indexes are unique and increasing, and only one reset-ready event precedes the first row.",
          "Calculate nominal sampled duration as `N / f = 600 / 20 = 30.00 s`.",
          "Calculate first-to-last timestamp span as `71.950 - 42.000 = 29.950 s`, which equals `(N - 1) / f` for 600 evenly spaced samples.",
          "Check the boundary order: reset-ready at 41.600 s occurs before recording, and success at 71.970 s occurs 0.020 s after the last sampled state.",
          "Verify every adjacent timestamp difference against the expected 0.050 s period and report the largest gap instead of trusting only the two endpoints.",
          "Accept the structural timing example only if the reset and success definitions also match the physical task; correct arithmetic cannot validate a false outcome label.",
        ],
        result:
          "The row count, timestamp span, and boundary ordering are mutually consistent with a 30-second, 20 Hz attempt, pending per-gap and semantic review.",
        takeaway:
          "Episode integrity requires both numerical continuity and meaningful physical boundaries; neither one can substitute for the other.",
      },
      handsOn: {
        setup:
          "Use paper blocks, a cardboard pointer, and a spreadsheet or small local script. Keep powered motion disabled and choose a 2 Hz manual sampling cadence.",
        steps: [
          "Write a reset contract with exact start zones, object count, pointer home mark, task instruction, timeout, and permitted terminal outcomes.",
          "Perform three attempts while a partner records episode ID, frame index, timestamp, visible arrangement, intended move, observed move, and event label.",
          "End the attempts differently—one success, one timeout, and one deliberate abort—without relabelling the latter two as successful demonstrations.",
          "Validate unique frame indexes, increasing timestamps, one start boundary, one terminal boundary, and the expected `N / f` duration for each attempt.",
          "Create a raw episode ledger and a separate training-eligibility column; state a reason for every exclusion without deleting the original row identity.",
          "Exchange the ledger with another person and ask them to reconstruct each reset, trajectory, terminal condition, duration, and eligibility decision.",
        ],
        observe:
          "Rows from the same physical activity gain different engineering meaning when reset or terminal rules change, and a structurally complete attempt can still be behaviorally unsuitable for training.",
        doneWhen:
          "All three attempts are independently reconstructable, duration calculations agree with timestamps within the declared manual tolerance, and every terminal and exclusion label has evidence.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Define the episode contract consumed by a robot-learning pipeline, ensure recorder and evaluator agree on resets and terminal outcomes, and retain aborts or corrupt attempts with traceable dispositions instead of presenting a curated success-only history.",
        interviewPrompt:
          "You receive a two-hour robot log and are asked to train from it. Explain how you would derive episodes, preserve reset and outcome evidence, separate commands from measured state, and prevent nearby frames from leaking across evaluation.",
      },
      commonMistakes: [
        {
          mistake: "Calling every fixed-length window an episode.",
          correction:
            "Require a physical reset/start contract and one meaningful terminal outcome; use windows only as model inputs sampled within an already defined episode.",
        },
        {
          mistake: "Treating commanded action as the robot's observed trajectory.",
          correction:
            "Store issued actions and measured state as different features so delay, saturation, contact, rejection, and intervention remain visible.",
        },
        {
          mistake: "Deleting aborted attempts and renumbering the remaining files.",
          correction:
            "Keep immutable raw identities and a review ledger, then build a derived training view whose exclusions and reasons can be reproduced.",
        },
      ],
      checkQuestions: [
        {
          question: "What makes an episode more than a slice of rows?",
          answer:
            "It represents one attempt with an explicit reset/start condition, task context, ordered trajectory, stable identity, and exactly one terminal outcome.",
        },
        {
          question: "Why can `600 / 20 = 30 s` coexist with a 29.95 s first-to-last timestamp span?",
          answer:
            "Six hundred samples at 20 Hz represent 600 sample intervals of nominal coverage, while only 599 intervals lie between the first and last sample timestamps.",
        },
        {
          question: "Should a safe abort disappear from the raw dataset?",
          answer:
            "No. Retain its raw identity and evidence, label its terminal result, and document whether and why a derived training view excludes it.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A real episode ledger with reset, ordered frame, event, outcome, and eligibility columns is more inspectable here than an additional generic sequence illustration.",
      },
    },
    {
      dayId: 93,
      mentalModel:
        "Teleoperation is a measured command chain between a human and a robot: operator intent enters through an interface, bounded commands leave the controller, physical state responds later, and the recorder must preserve every link.",
      explanation: [
        "Teleoperation lets a person command a robot through a leader arm, joystick, keyboard, phone, or other interface. A demonstration is the recorded evidence of that interaction, not merely the operator's input. Useful records include operator command, robot observation and measured state, task instruction, camera views, timestamps, terminal result, and intervention notes. The same input can produce different motion when calibration, limits, contact, delay, or hardware state changes.",
        "Calibrate and identify the robot, teleoperator, cameras, and software configuration before collection. LeRobot's maintained workflow uses robot and teleoperator IDs to locate calibration records and offers simultaneous camera and joint visualization before recording. Matching IDs and a visible response are necessary setup evidence, but neither proves safe workspace limits, collision handling, emergency stopping, load capability, or permission to operate a powered mechanism.",
        "Collection needs a written protocol: prepare the reset, verify sensing, announce recording, perform one consistent task, stop on success or a named failure, and restore the scene during reset time. Record operator identity or an anonymized stable code because technique can become a learnable shortcut. Mark assistance, pauses, corrections, communication loss, and safety stops at their actual times instead of editing the trajectory into an unrealistically smooth story.",
        "A high success count is not automatically a high-quality demonstration set. Repeating one easy path may omit alternate approaches, near-boundary states, and recoveries, while hurried collection can create jitter, occlusion, ambiguous task text, or unrecorded pauses. First establish a consistent nominal behavior and inspect it; then add deliberate, labelled condition variation without changing several factors at once or mixing unsafe improvisation into production motion.",
      ],
      keyTerms: [
        {
          term: "Teleoperation",
          meaning:
            "Remote or mediated human control that converts interface input into bounded robot commands while returning enough feedback for operation.",
          physicalExample:
            "A leader arm supplies desired follower joint positions while cameras and measured follower joints show the result.",
        },
        {
          term: "Demonstration",
          meaning:
            "A recorded task attempt intended to show behavior, including observations, actions, response, context, and outcome.",
          physicalExample:
            "One supervised pick-and-place trace contains front video, wrist video, measured joints, commanded joints, task text, and success label.",
        },
        {
          term: "Calibration identity",
          meaning:
            "The stable association among a physical device, its measured calibration values, and the configuration used for a recording.",
          physicalExample:
            "A follower-arm ID selects the offsets measured for that specific arm rather than another unit's similarly named file.",
        },
        {
          term: "Intervention",
          meaning:
            "A human action that changes, pauses, corrects, or terminates the commanded trajectory and must remain visible in lineage.",
          physicalExample:
            "An operator releases the enabling control and repositions a paper target after detecting a bad reset.",
        },
        {
          term: "Command-state residual",
          meaning:
            "The difference between an issued command and the measured robot response after accounting for representation and timing.",
          physicalExample:
            "A requested joint angle of 0.50 rad and a measured 0.43 rad position produce a 0.07 rad residual at the compared time.",
        },
      ],
      physicalExamples: [
        {
          title: "Cardboard leader and follower arms",
          scenario:
            "Connect two unpowered cardboard two-link arms only by numbered instruction cards: one person moves the leader, another copies each joint-angle card on the follower, and a third records both sides.",
          lookFor:
            "Leader intent, transmitted command, follower response, human copying delay, and correction events are distinct signals even though the two arms eventually resemble each other.",
        },
        {
          title: "Joystick driving a simulated cart",
          scenario:
            "Move a screen-based cart through a simple corridor using a game controller while the simulator logs joystick axes, commanded velocity, cart pose, collision flags, and reset events.",
          lookFor:
            "Controller input can return to zero before the simulated cart stops, exposing why input alone is not a complete demonstration of physical response.",
        },
      ],
      workedExample: {
        title: "Find missing records and response lag in a teleoperation trace",
        setup:
          "A 10.0-second simulated episode targets 20 Hz. The recorder saves 190 command-state rows. A visible input step occurs at 3.000 s, and the measured joint begins moving at 3.080 s.",
        steps: [
          "Calculate the expected row count: `10.0 s × 20 samples/s = 200 rows`.",
          "Calculate missing rows: `200 - 190 = 10 rows`.",
          "Calculate the missing fraction: `10 / 200 = 0.05 = 5%`.",
          "Calculate the observed response lag: `3.080 - 3.000 = 0.080 s = 80 ms`.",
          "Compare lag with the 50 ms sample period: `80 / 50 = 1.6 periods`, so same-index command and state rows cannot represent an instantaneous response.",
          "Reject an unqualified 'good demonstration' label until gap locations, clock alignment, command semantics, measured response, and the terminal task result are reviewed.",
        ],
        result:
          "The trace is 5% short and shows an 80 ms, or 1.6-period, command-to-motion delay; those are actionable recording facts, not a verdict about behavior quality by themselves.",
        takeaway:
          "Teleoperation data must reveal what the operator asked, what the robot did, and when each happened.",
      },
      handsOn: {
        setup:
          "Use an unpowered cardboard follower or a simulator with motion and collision limits. Do not use the exercise as authorization to drive an uncommissioned robot.",
        steps: [
          "Assign stable IDs to the operator, teleoperator interface, follower, scene setup, camera configuration, and protocol revision without recording personal contact information.",
          "Run a preflight that verifies the reset, calibration identity, command neutral state, observations, recorder destination, visible feedback, timeout, and abort path.",
          "Collect five short attempts while logging operator input, issued command, measured state, timestamp, intervention event, outcome, and a plain-language task instruction.",
          "Cancel and re-record one deliberately flawed reset while preserving the cancelled attempt's raw identity and the reason it is ineligible for nominal training.",
          "For every attempt, calculate expected versus recorded rows, the largest timestamp gap, command-state residual at one marked event, and terminal-label evidence.",
          "Review the camera and state timeline together, then write one protocol change that removes a repeatable ambiguity without erasing natural response variation.",
        ],
        observe:
          "A consistent protocol reduces accidental differences among attempts, while separate command and state traces expose lag, rejected commands, pauses, and interventions that a video-only review misses.",
        doneWhen:
          "All five attempt records identify their setup and outcome, the cancelled reset remains traceable, and a second reviewer can reproduce every timing and residual calculation.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_PHYSICAL_AI],
        workExample:
          "Build and qualify an operator-to-robot collection workflow with device identity, live feedback, command limits, abort behavior, synchronized recorder signals, intervention annotations, and an audit trail that robot-learning teams can use without guessing what physically occurred.",
        interviewPrompt:
          "Design a teleoperation recorder for demonstrations from multiple operators. Explain calibration identity, command versus state logging, latency, cancellation, intervention labels, operator bias, and the evidence needed before accepting an episode.",
      },
      commonMistakes: [
        {
          mistake: "Recording only leader or joystick input because it looks like the desired trajectory.",
          correction:
            "Record the issued robot action and measured response as separate timed features; contact, delay, saturation, and rejection can break the intended mapping.",
        },
        {
          mistake: "Assuming successful teleoperation demonstrates autonomous policy safety.",
          correction:
            "Claim only supervised human-controlled task evidence; autonomy changes decision ownership and requires separate rollout, fault, stop, and recovery validation.",
        },
        {
          mistake: "Re-recording a flawed attempt by overwriting its files and identity.",
          correction:
            "Retain the cancelled raw episode and disposition, give the replacement a new identity, and keep lineage between them.",
        },
      ],
      checkQuestions: [
        {
          question: "Why record measured robot state when operator input is already available?",
          answer:
            "Input expresses intent, while measured state reveals the delayed physical response, limits, contact, faults, disconnections, or interventions that changed execution.",
        },
        {
          question: "What does using the correct calibration ID fail to prove?",
          answer:
            "It does not prove workspace safety, collision behavior, stopping performance, load suitability, sensor correctness, or that the powered system is commissioned.",
        },
        {
          question: "How should a cancelled and re-recorded attempt appear in lineage?",
          answer:
            "The cancelled attempt keeps its immutable identity and reason; the replacement receives a new identity linked by the review ledger.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The useful evidence is the student's own aligned operator-input, issued-command, measured-state, intervention, and outcome timeline rather than a generic teleoperation block diagram.",
      },
    },
    {
      dayId: 94,
      mentalModel:
        "An action vector is a typed physical instruction, not a bag of numbers: its coordinate order, representation, frame, unit, limit, cadence, reference point, and execution horizon jointly determine what the robot will try to do.",
      explanation: [
        "Joint-position actions name a desired angle or displacement for each controlled joint, while joint-velocity actions name rates of change. Cartesian actions describe a tool pose, pose delta, twist, or waypoint in a declared frame. These representations are not interchangeable. Kinematics, calibration, controller behavior, constraints, and sometimes inverse kinematics sit between them. A value of `0.2` can mean radians, metres, radians per second, normalized policy output, or nothing useful until the contract says.",
        "Each action feature needs an ordered component list, dtype, shape, units, frame where applicable, lower and upper limits, nominal rate, and semantics such as absolute versus delta. State explicitly whether a gripper value is width, joint position, current request, or a normalized open-close command. Preserve the unnormalized physical interpretation and the transform used for learning; otherwise an apparently compatible tensor can command the wrong axis or scale on replay.",
        "Velocity commands also need duration and timeout semantics. A velocity is not a destination: continuing `0.1 m/s` for 0.1 seconds differs from holding it for two seconds after network loss. Position targets need controller and completion semantics because writing a target does not prove the joint reached it. A safe consumer validates finiteness, shape, range, frame, freshness, mode, and enable state before forwarding any action.",
        "Action chunking predicts several future action steps together. At 20 Hz, an eight-step chunk spans a nominal 0.4 seconds. Chunks can preserve a coherent short motion and reduce repeated inference, but later entries become stale when the world changes. Define how often a new chunk is produced, how overlapping predictions are combined, how many steps execute open-loop, and what cancels the remainder after new evidence, a mode change, or an abort.",
      ],
      keyTerms: [
        {
          term: "Joint-position action",
          meaning:
            "An ordered target for named joint coordinates, with angular or linear units and absolute or relative semantics.",
          physicalExample:
            "The vector `[0.3, -0.2] rad` targets shoulder and elbow angles only when that order matches the controller contract.",
        },
        {
          term: "Cartesian action",
          meaning:
            "A tool pose, pose change, twist, or waypoint expressed relative to a named coordinate frame.",
          physicalExample:
            "A `+0.02 m` x delta in `tool0` moves along the tool's x-axis, not necessarily the table's x-axis.",
        },
        {
          term: "Velocity action",
          meaning:
            "A commanded rate whose physical effect depends on units, reference frame, duration, update cadence, and timeout.",
          physicalExample:
            "A mobile base twist requests `0.10 m/s` forward for only as long as fresh enabled messages satisfy its watchdog.",
        },
        {
          term: "Action chunk",
          meaning:
            "A time-ordered block of future actions predicted or stored together with a defined horizon and execution policy.",
          physicalExample:
            "Eight seven-dimensional joint-and-gripper targets at 20 Hz describe 0.4 seconds of nominal future commands.",
        },
        {
          term: "Execution semantics",
          meaning:
            "The rules that turn an action record into behavior, including mode, timing, interpolation, clipping, completion, cancellation, and fallback.",
          physicalExample:
            "A delta target is applied once from the measured pose, whereas an absolute target remains referenced to a fixed coordinate definition.",
        },
        {
          term: "Action normalization",
          meaning:
            "A reversible mapping between physical action values and a scaled learning representation, derived from documented training data or limits.",
          physicalExample:
            "A joint range from -0.5 to 1.5 rad maps linearly to -1 to 1 only when inference applies the same versioned conversion before validation.",
        },
      ],
      physicalExamples: [
        {
          title: "The instruction “move five”",
          scenario:
            "Give a partner a paper pointer and say only “move five,” then compare five degrees of rotation, five centimetres along the table, and five centimetres per second for two seconds.",
          lookFor:
            "The same numeric value produces unrelated end states because type, unit, axis, frame, and duration were missing.",
        },
        {
          title: "Prewritten route versus frequent replanning",
          scenario:
            "Move a token toward a target using either an eight-arrow card committed in advance or a new single arrow after each move while a partner shifts an obstacle halfway through.",
          lookFor:
            "The longer action chunk stays coherent but continues toward an outdated scene unless its remaining steps can be cancelled or replaced.",
        },
      ],
      workedExample: {
        title: "Decode and bound one Cartesian action chunk",
        setup:
          "A policy emits a chunk with shape `[8, 7]` at 20 Hz. Each row is `[dx, dy, dz, dRx, dRy, dRz, gripper]`, where translation is metres in `tool0`, rotation is radians as a small rotation vector, and gripper is normalized from 0 closed to 1 open. Translation deltas are limited to ±0.02 m per step and rotation deltas to ±0.05 rad.",
        steps: [
          "Read the schema before values: eight time steps, seven ordered components, tool-relative deltas, physical units for six components, and one dimensionless gripper command.",
          "Calculate the nominal horizon as `8 / 20 Hz = 0.4 s`; do not confuse that duration with a safe open-loop commitment.",
          "Check the first row `[0.01, -0.03, 0, 0, 0, 0.02, 0.7]` for shape, finite values, frame availability, and current control mode.",
          "Detect that `dy = -0.03 m` exceeds the per-step lower limit of `-0.02 m`; reject or apply the explicitly approved saturation policy rather than silently changing training labels.",
          "Map the gripper value through the versioned physical conversion and validate the resulting actuator target independently; `0.7` is not itself a width or angle.",
          "Define that only the first two steps may execute before a new observation, and that abort, stale input, frame loss, or mode change cancels all unexecuted rows.",
        ],
        result:
          "The chunk contains 56 values over 0.4 seconds, but its first row violates the y-delta contract and cannot be forwarded unchanged.",
        takeaway:
          "Tensor shape and horizon are necessary bookkeeping; physical meaning and runtime gates decide whether an action is executable.",
      },
      handsOn: {
        setup:
          "Use a paper two-link arm, ruler, protractor, coordinate-frame sheet, and a small table or JSON file. No powered actuator is required.",
        steps: [
          "Describe one paper-arm move four ways: absolute joint angles, joint-angle deltas, Cartesian tool delta, and joint velocities with an explicit duration.",
          "For each representation, write ordered names, shape, dtype, units, frame, lower and upper bounds, rate, absolute-or-delta rule, and cancellation behavior.",
          "Apply each valid action manually and record the resulting measured paper pose rather than copying the requested value into the state column.",
          "Plant three defects—a swapped joint order, centimetres labelled as metres, and a stale timestamp—and verify that a schema checker rejects each with a distinct reason.",
          "Create a four-step chunk, move the target after step one, and compare executing the remainder with cancelling and replanning from the new observation.",
          "Save the action schema revision, example rows, rejection results, command-state comparison, and one unresolved conversion assumption for review.",
        ],
        observe:
          "Several representations can describe a related intention, but conversion depends on geometry and execution rules; malformed or stale actions can look numerically plausible until typed validation runs.",
        doneWhen:
          "Another learner can execute the paper instructions without asking what any component means, and all three planted contract violations fail closed with the expected reason.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_PHYSICAL_AI],
        workExample:
          "Specify and enforce the action boundary between a learned policy, ROS 2 integration layer, controller, and robot hardware so offline data, training normalization, inference tensors, and runtime limits share one versioned physical meaning.",
        interviewPrompt:
          "A policy returns an `8 × 7` tensor. Describe every contract you need before executing it, calculate its horizon at 20 Hz, and explain how you handle bounds, overlapping chunks, stale observations, and cancellation.",
      },
      commonMistakes: [
        {
          mistake: "Documenting only action tensor shape and min/max values.",
          correction:
            "Also define ordered component names, representation, physical units, frame, absolute-or-delta semantics, rate, normalization version, interpolation, timeout, and cancellation.",
        },
        {
          mistake: "Treating Cartesian and joint actions as equivalent arrays after matching their lengths.",
          correction:
            "Use explicit kinematics and controller contracts; equal dimension does not align axes, units, feasibility, singularities, or collision constraints.",
        },
        {
          mistake: "Assuming every predicted chunk should execute completely.",
          correction:
            "Bound open-loop execution and cancel remaining steps when observations, frames, modes, freshness, or safety state invalidate the original plan.",
        },
      ],
      checkQuestions: [
        {
          question: "What is missing from `action = [0.2, 0.4]`?",
          answer:
            "At least ordered component meaning, representation, dtype and shape, units, frame, absolute-or-delta semantics, limits, rate, normalization, duration, and execution rules.",
        },
        {
          question: "How long is an eight-step chunk at 20 Hz?",
          answer:
            "Its nominal horizon is `8 / 20 = 0.4 seconds`, though the system may intentionally execute fewer steps before replanning.",
        },
        {
          question: "Why store measured state separately from a position target?",
          answer:
            "A target expresses the request; measured state shows delayed or limited physical response and whether the target was actually approached or reached.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A typed comparison table and the paper execution exercise expose representation, units, frames, and semantics more precisely than a general action-space picture.",
      },
    },
    {
      dayId: 95,
      mentalModel:
        "Multimodal synchronization is a forensic timeline: every camera frame, state sample, and command must say which clock observed which physical instant, while tolerances and residuals reveal what could not be aligned.",
      explanation: [
        "Acquisition time is when a sensor measurement represents the physical world; arrival time is when software receives it. Network, driver, encoding, queue, and scheduling delay separate the two. Prefer device or message-header acquisition timestamps when their clock relationship is known. Replacing missing acquisition times with current arrival time can make a table look orderly while hiding variable delay, so record that substitution as degraded provenance rather than normal synchronization.",
        "Two timestamps are comparable only after establishing their clock domains. Devices may share one clock, be synchronized to a common source, or require an estimated offset and drift model. Clock offset is a fixed-looking difference at one instant; skew makes the difference change over time. A calibration event near the beginning cannot justify hour-long alignment unless later checks show that residual error remains inside the task's declared tolerance.",
        "Exact synchronization requires matching timestamps. Approximate synchronization pairs samples whose header times fall within a chosen tolerance and needs a deterministic rule for competing candidates, queue limits, and unmatched records. The tolerance follows physical motion and task sensitivity, not convenience. At fast tool speed, a 30 ms mismatch can correspond to meaningful position error even if the synchronized video looks acceptable at normal playback speed.",
        "Action, observation, and state also have a causal relationship. An action computed from observation time `t` is issued later, reaches a controller later still, and produces measurable motion after plant delay. Training conventions must say whether an action row is the command chosen from the current observation, the command active during an interval, or a future target. A timestamp column in LeRobot or any other format enables alignment work; its presence alone does not prove clock accuracy or causal correctness.",
      ],
      keyTerms: [
        {
          term: "Acquisition timestamp",
          meaning:
            "The claimed physical measurement time assigned by a sensor or trusted capture boundary in a known clock domain.",
          physicalExample:
            "A camera frame header marks when exposure occurred rather than when an application finished decoding the frame.",
        },
        {
          term: "Arrival timestamp",
          meaning:
            "The local time when a message reaches a receiving process, including variable transport and scheduling delay.",
          physicalExample:
            "Two images exposed 50 ms apart can arrive together after a network queue drains.",
        },
        {
          term: "Clock domain",
          meaning:
            "A time source and epoch whose readings can be directly compared only with readings from the same domain or a measured conversion.",
          physicalExample:
            "A camera hardware counter and ROS system time need a documented mapping before their numeric stamps share meaning.",
        },
        {
          term: "Clock offset and skew",
          meaning:
            "Offset is the clock difference at a reference instant; skew is the rate difference that makes that offset drift over elapsed time.",
          physicalExample:
            "A camera begins 12 ms ahead and gains another 2 ms over ten minutes, so one fixed correction becomes increasingly wrong.",
        },
        {
          term: "Synchronization tolerance",
          meaning:
            "The maximum allowed time separation for associating samples, justified by motion, sensor rate, and downstream error limits.",
          physicalExample:
            "A dataset pairs a frame and state only when their converted acquisition times differ by no more than 15 ms.",
        },
        {
          term: "Causal lag",
          meaning:
            "The elapsed time among observation, decision, command issue, controller receipt, and measurable physical response.",
          physicalExample:
            "A gripper command issued at 5.020 s begins changing measured width at 5.095 s, giving 75 ms observed response lag.",
        },
      ],
      physicalExamples: [
        {
          title: "Rolling ball with a visual time mark",
          scenario:
            "Roll a ball across a ruled sheet while filming it and recording manual position events; clap once in view and press an event key at the same perceived moment.",
          lookFor:
            "The shared event estimates offset, while the ball's position exposes residual mismatch; repeating the event later reveals whether the clock relation drifted.",
        },
        {
          title: "Two delayed parcel trackers",
          scenario:
            "Write physical scan time and app-notification time on cards for two parcels whose updates travel through different queues, then sort by each column.",
          lookFor:
            "Arrival order can differ from event order, illustrating why application receipt time cannot safely replace measurement time.",
        },
      ],
      workedExample: {
        title: "Associate streams and reject one false index match",
        setup:
          "After converting to one clock domain, camera frame 81 has acquisition time 10.040 s. Candidate state samples occur at 10.028 s and 10.061 s. The allowed camera-state tolerance is 15 ms. The action attached by index was issued at 10.020 s, while frame 81 was actually produced from observation frame 80 at 9.990 s.",
        steps: [
          "Calculate the absolute difference to the first state: `|10.040 - 10.028| = 0.012 s = 12 ms`.",
          "Calculate the absolute difference to the second state: `|10.040 - 10.061| = 0.021 s = 21 ms`.",
          "Pair frame 81 with the 10.028 s state because 12 ms is the nearest candidate and satisfies the 15 ms rule; leave the 21 ms candidate unmatched for this frame.",
          "Calculate action-to-frame separation as `10.040 - 10.020 = 20 ms`, but do not call the action a response to frame 81 based on this small number.",
          "Read causal lineage: the action was computed from frame 80 at 9.990 s, so its observation-to-issue lag is `10.020 - 9.990 = 30 ms`.",
          "Reject same-index observation-action semantics for this row and store the actual source observation identity, issue time, pairing residual, and any unpaired samples.",
        ],
        result:
          "Frame 81 pairs with the earlier state at a 12 ms residual, while its same-index action belongs causally to frame 80 and was issued 30 ms after that source observation.",
        takeaway:
          "Timestamp proximity can associate measurements, but only explicit lineage establishes which observation produced an action.",
      },
      handsOn: {
        setup:
          "Use synthetic CSV streams or a phone video plus manual event log. Work offline; the aim is to measure alignment, not control hardware.",
        steps: [
          "Create camera, state, and command tables with separate acquisition and arrival timestamps, source clock names, sequence IDs, and one shared start event.",
          "Introduce a 20 ms camera offset, gradual 1 ms-per-minute drift, variable arrival delay, one dropped state row, and one duplicated command ID.",
          "Estimate clock conversion from the start and end events, then transform acquisition times into one comparison domain without rewriting the raw values.",
          "Pair camera and state records with a declared 15 ms nearest-neighbour rule, retaining residual, unmatched reason, and candidate count for every decision.",
          "Link each command to its actual source observation and calculate observation-to-issue plus issue-to-measured-response lag for two marked events.",
          "Plot or tabulate residual over time, identify when the fixed-offset method breaches tolerance, and save the planted defects as regression fixtures.",
        ],
        observe:
          "Index alignment initially appears plausible, but drift, drops, duplicate IDs, and variable arrival delay create mismatched physical moments that a residual timeline makes visible.",
        doneWhen:
          "The checker detects every planted defect, never overwrites raw clock evidence, reports paired and unmatched counts, and reproduces both causal-lag calculations.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "Qualify a multimodal robot-data recorder by tracing device clocks, acquisition stamps, queues, action lineage, pairing residuals, missing samples, and response latency before the dataset reaches policy training or evaluation.",
        interviewPrompt:
          "Camera, joint state, and action arrays have equal lengths but different clocks and occasional drops. Explain how you would establish comparable time, choose a tolerance, preserve unmatched data, and prove which observation caused each action.",
      },
      commonMistakes: [
        {
          mistake: "Pairing streams by array index because they contain the same number of rows.",
          correction:
            "Associate converted acquisition timestamps under a justified rule and retain residuals; equal counts do not survive different starts, rates, drops, buffering, or drift.",
        },
        {
          mistake: "Replacing unknown sensor time with message arrival time and calling the result synchronized.",
          correction:
            "Keep arrival as a separate field, label acquisition time unavailable, and quantify variable transport delay or exclude the stream from claims that require precise alignment.",
        },
        {
          mistake: "Assuming the action stored next to an image was computed from that image.",
          correction:
            "Record source observation identity and decision, issue, receipt, and response times so action causality is explicit rather than inferred from row position.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is arrival time usually weaker than acquisition time for alignment?",
          answer:
            "Arrival includes variable transport, decoding, queue, and scheduler delay, so it can change even when physical sampling time does not.",
        },
        {
          question: "What does an approximate-time pair need besides a tolerance?",
          answer:
            "Comparable clock domains, a candidate-selection rule, queue and unmatched behavior, retained residuals, and a physical justification for the tolerance.",
        },
        {
          question: "Does a `timestamp` feature prove the dataset is synchronized?",
          answer:
            "No. Its clock source, acquisition boundary, conversion, drift, pairing residuals, drops, and causal semantics still require evidence.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "Three offset timelines with dropped samples, pairing windows, residuals, and action lineage make an index-matched synchronization failure materially easier to diagnose.",
      },
    },
    {
      dayId: 96,
      mentalModel:
        "A dataset schema is the wiring diagram for recorded experience: it names every signal, fixes its type and physical meaning, relates rows to episodes and tasks, and prevents training code from silently reconnecting the wires.",
      explanation: [
        "A useful schema specifies feature name, semantic description, dtype, shape, component order, unit, coordinate frame, valid range or enum, missing-value policy, timestamp meaning, and whether the value is observation, action, metadata, label, or evaluation-only truth. The familiar LeRobot keys `observation.state`, `action`, `observation.images.<camera>`, and `timestamp` provide a naming structure; each dataset still must document what its particular state and action components physically mean.",
        "LeRobotDataset v3 separates storage layout from episode access. Low-dimensional state, action, and timestamps live in Parquet data; camera frames live in MP4 video; metadata records canonical features, frame rate, tasks, statistics, and episode segmentation. Multiple episodes can share one physical data or video file, and one episode view is reconstructed from metadata offsets. Therefore a file name is not an episode boundary, and manually moving shards is not a valid way to edit episode membership.",
        "Version the schema whenever a consumer could interpret a stored value differently. Adding an optional label may be compatible, while reordering joints, changing metres to millimetres, switching from absolute to delta actions, or redefining timestamp origin is not. Store code and schema versions with the data, validate before loading, and write an explicit migration that produces a new derived version. Never relabel old bytes as the new contract without a reversible transformation and audit result.",
        "Split whole episodes, then strengthen grouping around the generalization claim. Frames from one episode must not cross train, validation, and test, but that alone can still leak a nearly identical reset, scene, object instance, or operator technique. Choose grouping keys before looking at model results. Fit normalization statistics on the training split only, freeze validation for decisions, and keep test untouched until the final evaluation protocol calls for it.",
      ],
      keyTerms: [
        {
          term: "Dataset schema",
          meaning:
            "The machine-checkable and human-readable contract for feature names, structures, physical semantics, relationships, and required metadata.",
          physicalExample:
            "A schema defines `observation.state` as six `float32` joint angles ordered by name and measured in radians.",
        },
        {
          term: "Feature",
          meaning:
            "One consistently interpreted field or modality exposed to storage and consumers under the schema.",
          physicalExample:
            "`observation.images.front` is an RGB camera stream, while `action` is a different feature with a seven-value control contract.",
        },
        {
          term: "Episode metadata",
          meaning:
            "Records that identify episode length, task, outcome, conditions, offsets, and lineage without pretending each episode is one storage file.",
          physicalExample:
            "Episode 27 points to rows 14,200–14,799 and matching video offsets inside shards shared with other attempts.",
        },
        {
          term: "Schema version",
          meaning:
            "A stable identifier for one interpretation of stored fields, changed when compatibility or physical meaning changes.",
          physicalExample:
            "Version 2 changes action translation from centimetres to metres and therefore requires conversion rather than a metadata-only rename.",
        },
        {
          term: "Grouped split",
          meaning:
            "A train, validation, or test assignment made at episode level and also keeping a leakage-prone related group together.",
          physicalExample:
            "All five attempts from the same randomized reset seed remain in one split even when their camera frames differ.",
        },
        {
          term: "Evaluation leakage",
          meaning:
            "Information from validation or test influences training, preprocessing, selection, or tuning and makes measured generalization too optimistic.",
          physicalExample:
            "Computing action-normalization bounds from all episodes lets held-out extremes shape the training transform.",
        },
      ],
      physicalExamples: [
        {
          title: "Versioned episode index cards",
          scenario:
            "Create paper cards for six episodes and separate cards for schema, tasks, data shards, and video shards; let several episode cards point into the same shard cards by start and end offsets.",
          lookFor:
            "Episode identity comes from relational metadata and boundaries, not from assuming one card or file contains exactly one attempt.",
        },
        {
          title: "Rewired sensor connector",
          scenario:
            "Label a six-pin paper connector with joint names, then secretly swap pins two and five while keeping all numeric readings within the same range.",
          lookFor:
            "Shape and dtype validation still pass, but component-order semantics fail, showing why a versioned name-to-index contract is essential.",
        },
      ],
      workedExample: {
        title: "Build a 70/15/15 split without leaking reset groups",
        setup:
          "A dataset contains 100 episodes from 20 reset seeds, with five attempts per seed. The required episode counts are 70 train, 15 validation, and 15 test. Episodes sharing a reset seed are near-duplicates and must stay together.",
        steps: [
          "Choose `reset_seed` as a grouping key before inspecting model metrics, because the five attempts from one seed share object layout and camera background.",
          "Verify group size: `100 episodes / 20 seeds = 5 episodes per seed`.",
          "Assign 14 complete seed groups to training: `14 × 5 = 70 episodes`.",
          "Assign three unused seed groups to validation: `3 × 5 = 15 episodes`.",
          "Assign the remaining three groups to test: `3 × 5 = 15 episodes`, then assert no seed appears in more than one split.",
          "Calculate normalization statistics from the 70 training episodes only and record the immutable seed-to-split manifest with the dataset version.",
        ],
        result:
          "The split reaches exactly 70/15/15 episodes while keeping all five attempts from each reset seed in one partition.",
        takeaway:
          "Correct proportions do not prevent leakage; the split unit must match the dependency that could make held-out data familiar.",
      },
      handsOn: {
        setup:
          "Create six tiny synthetic or paper episodes. Use JSON, CSV plus a schema note, or a small validation script; installing LeRobot is optional.",
        steps: [
          "Define `observation.state`, `action`, `observation.images.front`, `timestamp`, `task`, `episode_id`, `frame_index`, `outcome`, and `reset_seed` with types, shapes, units, frames, enums, and missing rules.",
          "Place rows from several episodes in two imaginary data shards and camera frames in two video shards, then create metadata offsets that reconstruct each episode.",
          "Plant a swapped action component, a millimetre value under a metre schema, a duplicate frame index, a missing task, and an offset that crosses an episode boundary.",
          "Run or manually execute validation that reports a distinct path, expected contract, actual value, and disposition for every planted defect.",
          "Assign whole reset-seed groups to train, validation, and test; assert disjoint episode IDs and groups, then calculate statistics from training rows only.",
          "Create schema version 2 with one changed action unit and write a conversion ledger that preserves version 1, output identity, formula, count, and round-trip check.",
        ],
        observe:
          "Storage can consolidate many attempts without erasing episode views, while semantic defects evade simple dtype and row-count checks unless the schema validates physical meaning and relationships.",
        doneWhen:
          "All five defects are detected, every episode reconstructs from offsets, split groups are disjoint, and the version-2 migration is reproducible without modifying version 1.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Own the contract among recorder, dataset storage, PyTorch loader, policy runtime, and evaluation system by versioning feature semantics, validating relational episode metadata, preventing grouped leakage, and making migrations reversible.",
        interviewPrompt:
          "Design a schema for two cameras, six joint states, seven actions, task text, and outcomes. Explain file-versus-episode boundaries, compatibility rules, grouped splits, training-only statistics, and how you would detect a swapped joint order.",
      },
      commonMistakes: [
        {
          mistake: "Assuming a matching feature name, dtype, and tensor length guarantee compatibility.",
          correction:
            "Compare ordered component semantics, units, frames, normalization, timing, limits, missing policy, and schema version before accepting the data.",
        },
        {
          mistake: "Splitting individual frames randomly into train and test.",
          correction:
            "Assign whole episodes and all related reset, scene, object, or operator groups together so near-duplicate trajectories cannot cross the evaluation boundary.",
        },
        {
          mistake: "Treating every Parquet or MP4 file as one episode.",
          correction:
            "Resolve episode rows and video ranges from versioned metadata because scalable formats can store many episodes inside shared shards.",
        },
        {
          mistake: "Computing normalization statistics over the complete dataset.",
          correction:
            "Fit means, scales, and bounds on training data only, then apply the frozen transform to validation and test.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can two action arrays with shape `[7]` still be incompatible?",
          answer:
            "Their component order, representation, units, frame, normalization, limits, or absolute-versus-delta meaning may differ despite equal shape.",
        },
        {
          question: "Why is a data-shard boundary not necessarily an episode boundary in LeRobotDataset v3?",
          answer:
            "The format can concatenate many episodes into larger Parquet and MP4 files; episode metadata and offsets reconstruct each attempt.",
        },
        {
          question: "When is an episode-only split still too weak?",
          answer:
            "When related episodes share a reset, scene, object instance, operator pattern, or other dependency that would make held-out data effectively familiar.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A relational view linking schema, task, episode offsets, shared data/video shards, and grouped splits materially clarifies why files, rows, and episodes are different units.",
      },
    },
    {
      dayId: 97,
      mentalModel:
        "Dataset review is incoming inspection for robot experience: first test whether records are structurally usable, then whether the demonstrated behavior and labels are credible, and finally whether collected conditions cover the world the policy will face.",
      explanation: [
        "Structural quality asks whether required fields exist, shapes and types match, timestamps increase, video decodes, episode boundaries agree, samples align within tolerance, and referenced task or calibration identities resolve. Semantic quality asks whether units, frames, component order, task text, reset, and outcome mean what the schema claims. Behavioral quality asks whether the operator performed the intended behavior without unlabelled intervention, unsafe improvisation, severe jitter, obstruction, or a terminal label contradicted by the recording.",
        "A failed demonstration is poor or unsuccessful behavior inside the collected distribution. It may contain a dropped object, wrong placement, collision, timeout, or operator correction. Preserve it in raw data and label the failure precisely; do not automatically train imitation on actions that should not be copied. A curated training recipe can quarantine it, use only a deliberate recovery segment under a separate label, or reserve it for evaluation. The choice depends on the learning objective and remains explicit.",
        "Distribution shift occurs when later observations, actions, tasks, hardware, operators, or environments differ meaningfully from collection. A bright-light sorting dataset can be structurally flawless and still fail in evening light. A coverage matrix counts episodes across task-relevant factors such as object position, object identity, lighting, camera pose, operator, recovery state, and outcome. Counts need denominators and intersections because balanced marginal totals can hide an empty combination.",
        "Review both aggregates and individual episodes. Summaries expose missingness, duration outliers, saturation, abort rate, operator imbalance, and sparse condition cells; synchronized playback exposes label errors, occlusion, late actions, pauses, and bad technique. Sample every condition and every terminal class, then inspect all hard-gate failures and suspicious outliers. Keep reviewer identity, rubric version, disposition, and reason so quality decisions can be audited or revised.",
      ],
      keyTerms: [
        {
          term: "Quality gate",
          meaning:
            "A defined pass, quarantine, or reject rule tied to observable dataset evidence and a recorded reason.",
          physicalExample:
            "An episode is quarantined when more than 1% of camera-state pairs exceed the 15 ms synchronization tolerance.",
        },
        {
          term: "Failed demonstration",
          meaning:
            "A collected attempt whose behavior or terminal result does not satisfy the intended demonstration objective.",
          physicalExample:
            "The gripper drops the block before the target bin even though every frame and action row is present.",
        },
        {
          term: "Distribution shift",
          meaning:
            "A meaningful mismatch between data used for learning or validation and inputs encountered during later operation.",
          physicalExample:
            "Training uses matte red cubes under fixed white light, while deployment presents glossy objects under sunlight.",
        },
        {
          term: "Coverage matrix",
          meaning:
            "Counts or rates for combinations of task-relevant conditions, used to reveal sparse and absent regions.",
          physicalExample:
            "Rows are near and far object positions, columns are bright and dim lighting, and each cell contains episode and success counts.",
        },
        {
          term: "Operator bias",
          meaning:
            "A repeated human technique or correlated condition that a model can copy as a shortcut instead of learning the intended task.",
          physicalExample:
            "One operator always approaches from the left and also records every blue object, coupling person-specific motion with colour.",
        },
        {
          term: "Quarantine",
          meaning:
            "A reversible disposition that keeps raw data and lineage while excluding it from a named training or evaluation recipe pending review.",
          physicalExample:
            "Episodes with unverified action units stay addressable in raw storage but cannot enter dataset version 1's training manifest.",
        },
      ],
      physicalExamples: [
        {
          title: "Bright-only block collection",
          scenario:
            "Arrange forty paper episode cards by bright or dim light and near or far object position; place most cards in bright rows even though total object counts appear balanced.",
          lookFor:
            "Overall volume hides an almost empty dim-light region, so a policy claim about ordinary room lighting would exceed collected evidence.",
        },
        {
          title: "Perfect approach with no recovery",
          scenario:
            "Draw ten centered gripper paths to a cup and one path that starts slightly off-centre, then ask which examples teach correction after an early error.",
          lookFor:
            "More nominal copies improve density near the ideal path but do not cover recovery states the policy creates during rollout.",
        },
      ],
      workedExample: {
        title: "Turn forty episodes into an honest coverage decision",
        setup:
          "A two-factor audit has bright/dim lighting and near/far object positions. Counts are bright-near 18, bright-far 18, dim-near 4, and dim-far 0, for 40 episodes total. The planned evaluation claims both lighting conditions and positions.",
        steps: [
          "Verify the denominator: `18 + 18 + 4 + 0 = 40 episodes`, with each episode assigned to exactly one declared cell.",
          "Calculate bright coverage: `(18 + 18) / 40 = 36 / 40 = 90%`.",
          "Calculate dim coverage: `(4 + 0) / 40 = 4 / 40 = 10%`.",
          "Read intersections rather than margins: dim-near has four attempts, while dim-far has zero, so the planned condition space contains an untested cell.",
          "Refuse to repair the gap by duplicating images or applying brightness augmentation; transformed training pixels are not collected dim-far physical trajectories.",
          "Either collect and review dim-far attempts under the same protocol or narrow the dataset card and evaluation claim to the conditions actually represented.",
        ],
        result:
          "The dataset is 90% bright, 10% dim, and has no dim-far demonstrations; it cannot support an evidence-based claim across the complete two-by-two condition space.",
        takeaway:
          "Coverage is about relevant combinations and honest scope, not merely total episode count or balanced-looking single columns.",
      },
      handsOn: {
        setup:
          "Reuse this week's synthetic or unpowered episodes and their aligned inspector data. Define the review rubric before looking at which attempts you prefer.",
        steps: [
          "Create structural gates for schema, decodable media, episode boundaries, timestamp order, pairing residual, missingness, and referential integrity.",
          "Create semantic and behavioral gates for units, frame, task clarity, reset evidence, action plausibility, intervention, terminal outcome, and prohibited behavior.",
          "Label each episode pass, quarantine, or reject under a versioned rubric while retaining reviewer, timestamp, reason code, free-text evidence, and raw identity.",
          "Build a coverage matrix across at least three relevant factors, including operator or reset group, and show episode count plus outcome count in each intersection.",
          "Inspect every failed or aborted attempt, every zero or sparse cell, every duration outlier, and at least one passing episode from each populated condition.",
          "Write a collection change for the highest-impact gap, a regression check for one discovered defect, and a narrowed claim if new collection is not yet available.",
        ],
        observe:
          "Some episodes pass file checks but fail semantic or behavior review, and aggregate balance can coexist with empty condition intersections or one operator dominating a task.",
        doneWhen:
          "Every disposition traces to rubric evidence, the matrix totals reconcile with the episode ledger, zero cells are explicit, and the next collection or scope decision follows from measured gaps.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_HMI],
        workExample:
          "Create a robot-dataset acceptance process that combines automated structural checks, synchronized episode review, operator and condition coverage, failure taxonomy, reversible quarantine, and a collection backlog tied to deployment risks.",
        interviewPrompt:
          "A demonstration dataset has 98% structurally valid episodes and 95% labelled success. Explain why that is insufficient, how you would audit failed behavior and operator shortcuts, and how a coverage matrix changes the collection plan.",
      },
      commonMistakes: [
        {
          mistake: "Deleting every failed attempt and reporting the remaining dataset as 100% successful.",
          correction:
            "Retain raw failures with precise outcomes and dispositions, report denominators before and after curation, and exclude or repurpose them only through a documented recipe.",
        },
        {
          mistake: "Checking each condition column separately and calling the dataset balanced.",
          correction:
            "Count intersections of relevant factors because healthy marginal totals can conceal an absent combination such as dim light with a far target.",
        },
        {
          mistake: "Using image augmentation as proof that a physical condition was collected.",
          correction:
            "Describe augmentation as a training transform; it does not create real sensor noise, contact, operator response, action timing, or outcomes for the missing condition.",
        },
        {
          mistake: "Accepting an episode's success flag without watching terminal evidence.",
          correction:
            "Verify the outcome against synchronized observations, measured state, task criteria, and terminal event, then retain reviewer and rubric lineage.",
        },
      ],
      checkQuestions: [
        {
          question: "How does a failed demonstration differ from distribution shift?",
          answer:
            "A failed demonstration is poor or unsuccessful behavior in collected data; distribution shift is a mismatch between collected and later operating distributions.",
        },
        {
          question: "Why can balanced lighting and position totals still hide a coverage gap?",
          answer:
            "Their intersections may be uneven or empty—for example, all dim examples may be near while no dim-far attempt exists.",
        },
        {
          question: "What is the value of quarantine instead of immediate deletion?",
          answer:
            "It preserves raw identity and evidence while preventing uncertain data from entering a named recipe, so later correction or reclassification remains auditable.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A condition-by-condition coverage matrix with failures, sparse intersections, and operator imbalance reveals distribution holes that totals and prose materially obscure.",
      },
    },
    {
      dayId: 98,
      mentalModel:
        "A dataset card is the label on a sealed evidence box, while an episode inspector is the window into it: the label states provenance and limits, and the window lets a reviewer test those statements against synchronized records.",
      explanation: [
        "A dataset card documents what the dataset contains and how it may responsibly be used. Include owner and contact channel at an organizational level, collection purpose, task definitions, hardware and sensor configuration, teleoperation method, schema and version, episode counts, durations, splits, condition coverage, quality process, exclusions, provenance, license, privacy treatment, intended uses, prohibited or unsupported uses, limitations, and known risks. A polished README does not prove any claim unless its numbers and examples trace to data.",
        "An episode inspector should place synchronized camera views, observation state, action, task text, frame and episode identity, acquisition time, pairing residual, outcome, intervention, and review disposition on one seekable timeline. Show raw physical values or a clearly identified decoded view rather than only normalized training tensors. Make missing data, unmatched samples, action saturation, terminal events, and excluded episodes visible instead of silently skipping them during playback.",
        "Publication requires rights and privacy review. Confirm licenses for dataset content, recorder code, annotations, and any third-party assets; document consent and permitted use when people, voices, homes, screens, or identifying objects could appear. Remove secrets and personal data through a reviewable process, not a promise. If rights or privacy are unresolved, keep the dataset private and publish only non-sensitive synthetic examples and aggregate documentation.",
        "Freeze a release rather than mutating a public identity in place. Record the exact schema, episode manifest, split manifest, quality ledger, card revision, inspector revision, code version, and content checksums. If a bad label or episode is discovered, publish a corrected version with a change log and lineage to the original. Recalculate every headline number from the frozen manifest so counts, duration, coverage, and exclusions cannot drift apart.",
      ],
      keyTerms: [
        {
          term: "Dataset card",
          meaning:
            "Versioned documentation describing dataset contents, provenance, permitted and intended use, quality evidence, limitations, risks, and metadata.",
          physicalExample:
            "A card states that 70 training episodes cover two object positions but no reflective objects and are licensed only under the named terms.",
        },
        {
          term: "Episode inspector",
          meaning:
            "A seekable interface that renders aligned modalities, actions, metadata, events, outcomes, and review evidence for one attempt.",
          physicalExample:
            "Scrubbing to 12.4 s shows the front frame, six measured joints, seven commanded values, a 9 ms pairing residual, and a correction marker.",
        },
        {
          term: "Provenance",
          meaning:
            "Evidence of where data came from, who or what collected it, under which configuration and protocol, and how it was transformed.",
          physicalExample:
            "Episode 22 links to recorder revision, device IDs, calibration identity, protocol version, raw checksum, and reviewer disposition.",
        },
        {
          term: "License",
          meaning:
            "The legal permission and conditions governing copying, modification, distribution, and use of the dataset or its components.",
          physicalExample:
            "A dataset repository names its license while separately checking whether an included third-party video permits redistribution.",
        },
        {
          term: "Checksum",
          meaning:
            "A content-derived digest used to detect whether a released file or manifest differs from the frozen version.",
          physicalExample:
            "The release manifest records a SHA-256 digest for each metadata and data shard so later changes are detectable.",
        },
        {
          term: "Dataset lineage",
          meaning:
            "The trace from immutable raw recordings through review, exclusion, conversion, split, and released versions.",
          physicalExample:
            "Version 1.1 corrects two outcome labels and links each new episode record to its version-1 source identity and change reason.",
        },
      ],
      physicalExamples: [
        {
          title: "Ingredient label and inspection window",
          scenario:
            "Place mixed objects in an opaque box, write a label claiming exact contents and exclusions, then cut a small viewing window and compare visible samples with the inventory sheet.",
          lookFor:
            "The label gives scope and warnings, while the window provides spot-check evidence; neither alone establishes that every hidden item matches the claim.",
        },
        {
          title: "Flight-recorder playback",
          scenario:
            "Lay parallel paper strips for camera, command, measured state, operator event, and outcome, then slide one vertical ruler across them as a shared playhead.",
          lookFor:
            "A shared cursor exposes delayed response, missing rows, and terminal evidence that separate media players or summary totals would conceal.",
        },
      ],
      workedExample: {
        title: "Recalculate the duration claim before freezing a card",
        setup:
          "A release candidate contains three eligible episodes. Each has 600 samples at 20 Hz. Two are assigned to training and one to validation; there is no independent test episode. The card draft claims 90 seconds of eligible demonstrations.",
        steps: [
          "Calculate each episode's nominal sampled duration: `600 / 20 Hz = 30 s`.",
          "Sum the manifest rather than multiplying an undocumented total: `30 + 30 + 30 = 90 s`.",
          "Reconcile split counts: training contains two episodes and `2 × 30 = 60 s`; validation contains one episode and `1 × 30 = 30 s`.",
          "State that test contains zero episodes; do not rename validation as test after using it to make development decisions.",
          "Verify the inspector can open all three identities and show synchronized video, state, action, task, timestamps, outcomes, and any review markers.",
          "Write the card claim as 90 seconds of eligible nominal sampled time, with a prominent limitation that three episodes and no test split cannot support a generalization claim.",
        ],
        result:
          "The 90-second total is arithmetically reproducible as 60 seconds train plus 30 seconds validation, and the missing test set remains explicit.",
        takeaway:
          "A correct headline number still needs split context, sample evidence, and limitations before it becomes an honest release statement.",
      },
      handsOn: {
        setup:
          "Use three non-sensitive synthetic, simulated, or unpowered episodes from this week. Do not upload recordings containing unresolved people, voices, home details, screens, credentials, or third-party material.",
        steps: [
          "Freeze the schema, episode manifest, split manifest, task table, quality ledger, source and license inventory, code revision, and checksums under one release-candidate identity.",
          "Generate a dataset card with task and hardware context, teleoperation protocol, counts, duration, schema, splits, condition coverage, quality rules, exclusions, provenance, privacy, license, intended use, limitations, and known risks.",
          "Build a static inspector that selects an episode and scrubs camera, state, action, timestamps, pairing residual, task, outcome, intervention, and review disposition with one shared playhead.",
          "Plant one missing frame, one wrong outcome label, and one card count mismatch; verify that the inspector or release checks expose all three before publication.",
          "Run a privacy and rights checklist, keep unresolved material private, and replace any public-facing example with an equivalent non-sensitive synthetic record.",
          "Have a reviewer recalculate counts and duration from the manifest, inspect one passing and one non-passing attempt, verify checksums, and sign the release decision with residual limitations.",
        ],
        observe:
          "The card summarizes scope, while the inspector reveals whether modality alignment, labels, exclusions, and bad cases support that summary; release checks prevent their revisions from drifting independently.",
        doneWhen:
          "A fresh reviewer reproduces all headline numbers, detects every planted defect, opens each eligible episode, confirms privacy and license disposition, and reaches the same bounded publish-or-keep-private decision.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_HMI,
          ROLE_VALIDATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Deliver a robot-dataset release that learning engineers, operators, QA reviewers, and compliance owners can interrogate through a versioned card, synchronized inspector, immutable manifests, rights review, and traceable corrections.",
        interviewPrompt:
          "Show how you would release a small demonstration dataset. Derive one card metric, describe the inspector timeline, explain privacy and licensing gates, and demonstrate how a corrected episode becomes a new version without erasing lineage.",
      },
      commonMistakes: [
        {
          mistake: "Treating a detailed dataset card as proof that every episode satisfies it.",
          correction:
            "Generate metrics from frozen manifests and let reviewers inspect aligned examples, exclusions, failures, and raw evidence behind each important claim.",
        },
        {
          mistake: "Publishing first and planning to resolve consent or licensing later.",
          correction:
            "Keep unresolved content private, complete rights and privacy review before distribution, and use non-sensitive synthetic examples when public evidence is still needed.",
        },
        {
          mistake: "Building an inspector that plays only video.",
          correction:
            "Align camera, measured state, action, task, timestamps, residuals, interventions, outcome, and review disposition under one episode identity and playhead.",
        },
        {
          mistake: "Fixing a released label by overwriting version 1 in place.",
          correction:
            "Issue a new version with changed manifests and checksums, retain the original lineage, and document the exact correction and affected identities.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a dataset card provide that an episode inspector does not?",
          answer:
            "It states dataset-wide provenance, scope, schema, splits, rights, intended use, limitations, risks, quality process, and aggregate evidence.",
        },
        {
          question: "What should a synchronized inspector make easy to catch?",
          answer:
            "Misalignment, missing fields, wrong labels, command-state mismatch, interventions, saturation, unusual episodes, terminal contradictions, and unexplained exclusions.",
        },
        {
          question: "Why create a new version for a corrected released label?",
          answer:
            "A new version preserves reproducibility and lineage: prior results still reference unchanged content while the correction, affected identity, and new checksum remain explicit.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The hands-on synchronized inspector is itself the required evidence surface, so adding a separate illustrative visual would duplicate rather than clarify the lesson.",
      },
    },
  ],
} satisfies ChapterContent;
