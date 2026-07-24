import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week23Content = {
  week: 23,
  title: "Collect and freeze a task-shaped capstone dataset",
  purpose:
    "Turn one bounded tabletop or mobile-robot capstone into a versioned first dataset whose meaning, operating envelope, operator authority, timing, coverage, splits, and limitations can be reconstructed. The chapter begins with observable physical success and controlled variation, then integrates a simulation-first Flutter or Web console with leased dead-man control, independently enforced command limits, visible latency, cancellation, and synchronized recording. It collects a deliberately balanced first batch, preserves and classifies failures, repairs measured coverage holes, isolates whole scene groups across train, validation, and held-out partitions, and freezes dataset v1 with an immutable manifest, card, reviewed examples, checksums, and denominator-backed quality metrics. More episodes are not accepted as a substitute for safer control or clearer evidence.",
  prerequisites: [
    "Complete the earlier robot-data schema, episode timing, dataset-quality, safe HMI, action cancellation, hardware bring-up, calibration, limits, watchdog, and acceptance-gate chapters. This week integrates those contracts into one collection system rather than weakening them for faster recording.",
    "Bring one harmless simulated task or an already commissioned low-risk platform, a repeatable reset, a versioned robot and camera configuration, a no-motion startup state, and an approved safe-stop procedure. Learner exercises remain in simulation unless the responsible qualified people have approved the real workspace and supervision.",
    "Be able to distinguish operator intent, accepted bounded command, measured robot state, camera observation, task outcome, review disposition, and dataset inclusion. These are separate records and none may be inferred merely from a responsive interface.",
    "Bring a local storage location with enough capacity for raw episodes, a privacy and rights boundary for every camera view, and a way to preserve raw attempts immutably while release manifests select reviewed episodes without deleting inconvenient evidence.",
  ],
  outcomes: [
    "Define a capstone episode through allowed objects, initial-state predicates, terminal success predicates, timeout, intervention policy, abort reasons, reset proof, units, tolerances, and a denominator-backed evaluation claim.",
    "Design bounded variation across scene, object instance, lighting, camera, start state, and operator without creating accidental correlations, unsafe combinations, or an unrepeatable collection schedule.",
    "Integrate a Flutter or Web teleoperation path whose UI dead-man events stop renewal, while authentication, exclusive authority, freshness, command limits, cancellation, and timeout are enforced outside the browser and verified against measured simulated state.",
    "Record camera observations, robot state, raw operator intent, accepted command, timing, control events, task identity, and terminal labels under one episode identity and a declared clock-alignment contract.",
    "Collect and review a first batch by planned condition cells, retain raw failures, classify defects and outcomes, and target additional collection at measured deployment-relevant coverage gaps.",
    "Assign whole related scene groups to train, validation, and held-out scene partitions, keep derived data and fitted statistics on the correct side of each boundary, and prove split disjointness.",
    "Freeze an immutable dataset v1 whose manifest, schema, splits, card, examples, metrics, code and calibration identities, checksums, rights decision, known limitations, and reproduction checks agree.",
  ],
  jobTargets: [
    ROLE_HMI,
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "Hugging Face LeRobot — Processors for Robots and Teleoperators",
      url: "https://huggingface.co/docs/lerobot/processors_robots_teleop",
      useFor:
        "Official LeRobot guidance for separating teleoperator, dataset, and robot action spaces; declaring feature transformations; recording frames against the dataset feature contract; and beginning custom robot pipelines with tight bounds and simulation.",
    },
    {
      label: "Hugging Face LeRobot — Getting Started with Real-World Robots",
      url: "https://huggingface.co/docs/lerobot/main/en/getting_started_real_world_robot",
      useFor:
        "Official end-to-end reference for keeping robot and teleoperator calibration identities consistent across teleoperation, recording, visualization, training, and evaluation, and for structuring demonstrations as repeatable episodes.",
    },
    {
      label: "Hugging Face LeRobot — LeRobotDataset v3.0",
      url: "https://huggingface.co/docs/lerobot/main/lerobot-dataset-v3",
      useFor:
        "Official dataset-format reference for incremental frame and episode recording, metadata, Parquet and video finalization, and the requirement to finalize writers before treating a v3 dataset as complete and loadable.",
    },
    {
      label: "ROS 2 Documentation — Actions",
      url: "https://docs.ros.org/en/rolling/Concepts/Basic/About-Actions.html",
      useFor:
        "Official ROS 2 explanation of long-running goals with feedback and cancel or preempt behavior, used to keep a cancel request, cancel processing, terminal result, and observed physical stop as different states.",
    },
    {
      label: "Hugging Face LeRobot — Human-In-the-Loop Data Collection",
      url: "https://huggingface.co/docs/lerobot/main/en/hil_data_collection",
      useFor:
        "Official LeRobot description of recording interventions, recovery motions, corrections, and autonomous segments so later coverage work can preserve failure context rather than training only on ideal states.",
    },
  ],
  days: [
    {
      dayId: 155,
      mentalModel:
        "A capstone task is a marked physical game board with a start photograph, legal moves, a finish photograph, a timer, and explicit reasons to stop.",
      explanation: [
        "Start with the scene a camera and reviewer could inspect. Name the robot, tool, object population, workspace, permitted contact surfaces, initial robot mode, object start region, target region, and reset condition. Then state one small useful transformation, such as moving a named foam block from a pickup rectangle into a bin. “Sort objects” is a project theme, not an episode contract, because it leaves object identity, quantity, placement tolerance, completion, timeout, and forbidden behavior undecidable.",
        "Write success as simultaneous observable predicates rather than a human impression. A tabletop episode might require `object_in(target_zone, tolerance_mm=15)`, `gripper_empty=true`, `robot_at(park, tolerance_deg=3)`, `collision_count=0`, and `elapsed_s <= 25`. Name the sensor or review evidence for each predicate and what happens when a measurement is missing. A recorder’s success button can propose a label, but synchronized terminal evidence and a review rule decide whether that label is defensible.",
        "Bound the episode on both sides. Entry predicates prevent collection from beginning with an already moved object, stale calibration, occupied workspace, missing camera, or active fault. Exit states include success, task failure, operator abort, safety stop, infrastructure invalidation, and timeout; these outcomes must not collapse into one Boolean. Define reset proof separately, because placing the object back approximately can silently change difficulty from one attempt to the next.",
        "Separate the dataset objective from the later policy claim. The collection objective can be “capture reviewed demonstrations across the declared start-state grid,” while the policy acceptance claim may be “at least 16 of 20 held-out trials satisfy every terminal predicate without intervention.” Demonstration quality, dataset coverage, and autonomous success are related but different denominators. Freezing those definitions now prevents a disappointing model from causing the task rules to be softened afterward.",
      ],
      keyTerms: [
        {
          term: "Episode contract",
          meaning:
            "The versioned definition of valid entry state, allowed task, terminal outcomes, timeout, evidence, intervention rule, and reset for one recorded attempt.",
          physicalExample:
            "A block-transfer episode begins only with the arm parked and block fully inside the start rectangle, and ends when the block is verified in the bin, the timer expires, or an abort occurs.",
        },
        {
          term: "Success predicate",
          meaning:
            "A measurable statement that must be true, with named tolerance and evidence source, for an episode to count as task success.",
          physicalExample:
            "The whole foam cube lies inside the taped target boundary with no edge closer than 15 mm to the line.",
        },
        {
          term: "Entry predicate",
          meaning:
            "A condition that must be freshly verified before recording and command authority can begin.",
          physicalExample:
            "The gripper is open, the joint state is fresh, the workspace is clear, and the cube is inside its assigned start cell.",
        },
        {
          term: "Terminal outcome",
          meaning:
            "One explicit reason an episode ended, kept richer than a success-versus-failure flag.",
          physicalExample:
            "An attempt ends as `operator_abort` after a loose camera mount is noticed, rather than being mislabeled as a failed grasp.",
        },
        {
          term: "Reset proof",
          meaning:
            "Recorded evidence that the next episode starts from the declared robot, object, scene, and authority state.",
          physicalExample:
            "A reset image and joint-state snapshot show the cube in start cell C2 and the arm within three degrees of park before episode 18 opens.",
        },
      ],
      physicalExamples: [
        {
          title: "Foam block into a divided tray",
          scenario:
            "A small simulated arm begins parked beside two visually different foam blocks and must place only block B-04 into tray compartment T2 without touching the other block.",
          lookFor:
            "Identity, start region, allowed contact, target tolerance, untouched-object rule, timeout, park state, and terminal evidence are all decidable before the first demonstration.",
        },
        {
          title: "Rover delivers one empty carton",
          scenario:
            "A simulated differential-drive rover begins inside a taped start box, carries an empty carton, and must stop completely inside a delivery bay while a narrow exclusion strip remains untouched.",
          lookFor:
            "The contract defines footprint containment, measured zero velocity, carton retention, zone contact, time limit, abort states, and the exact reset pose rather than accepting “looks delivered.”",
        },
      ],
      workedExample: {
        title: "Turn a vague pick-and-place idea into one frozen episode contract",
        setup:
          "The idea is “teach the arm to put a sponge in a bowl.” The simulated arm has one gripper, two sponge instances, an overhead camera, joint state, a 30 cm square workspace, and a named park pose.",
        steps: [
          "Choose one task identity: `task_id=place_sponge_v1`; bind the episode to sponge instance S1, pickup region P, bowl region B, gripper G1, camera calibration C7, and robot configuration R12 instead of using the words “the sponge” alone.",
          "Define entry predicates: arm within three degrees of park, gripper open, S1 completely inside P, S2 outside the active workspace, camera and joint-state ages below 100 ms, no active fault, and one exclusive operator lease available.",
          "Define success predicates: S1 remains inside bowl B for two seconds, gripper is empty, arm returns to park, no forbidden-zone or collision event occurred, and elapsed time is at most 25 seconds.",
          "Enumerate mutually understandable terminal outcomes: `success`, `task_failure`, `operator_abort`, `safety_stop`, `invalid_recording`, and `timeout`; attach the decisive event and final synchronized observation to each episode.",
          "Write reset proof as one image, object-region result, fresh joint snapshot, empty-gripper state, cleared stop state, and new episode identity; reject collection if any reset check is unknown.",
          "Freeze an evaluation statement before collection: a later policy passes only if at least 16 of 20 held-out episodes satisfy every success predicate with zero human intervention, while all 20 remain in the denominator.",
        ],
        result:
          "The broad idea becomes a reviewable contract with named entities, six entry checks, five simultaneous success checks, six terminal outcomes, repeatable reset evidence, and an evaluation denominator that cannot be edited after seeing results.",
        takeaway:
          "A useful capstone begins when two reviewers can label the same attempt from recorded evidence without asking what the learner intended.",
      },
      handsOn: {
        setup:
          "Use a simulator or paper scene with one robot outline, two harmless objects, start and target regions, a clock, and a visible park state. Do not connect the exercise to powered hardware.",
        steps: [
          "Use the chapter’s official LeRobot references to isolate this collection task, then write five operating rules and the one-sentence physical transformation with every robot, object, tool, region, and sensor identity required to judge it.",
          "Draw the valid start scene, then write five to eight entry predicates with units, freshness limits, and a named evidence source for each.",
          "Draw the successful finish scene and convert it into simultaneous terminal predicates, including robot safe state, forbidden events, tolerance, and timeout.",
          "Create a terminal-outcome table that distinguishes task failure, operator abort, safety stop, invalid recording, and timeout from success.",
          "Implement one minimal simulated or paper executable, then perform three walkthroughs: nominal success, object starting outside its region, and camera evidence missing at the apparent finish.",
          "Have another person label the three attempts using only the contract; revise every sentence that still requires guessing, then assign the contract a version and checksum.",
        ],
        observe:
          "Most ambiguity appears at entry, terminal evidence, or reset rather than in the central motion, and a single success flag hides several operationally different endings.",
        doneWhen:
          "A second reviewer reaches the same outcome for all three walkthroughs, every predicate names evidence and tolerance, and no attempt begins from an unknown reset state.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_INTEGRATION],
        workExample:
          "Translate a customer manipulation or AMR objective into versioned data-collection and policy-acceptance contracts that join ROS 2 state, camera evidence, intervention rules, safety events, and denominator-backed trial outcomes.",
        interviewPrompt:
          "Define a capstone episode for placing one object into a bin. State entry and success predicates, reset proof, timeout, invalid versus failed outcomes, and the evidence required before you would accept a success label.",
      },
      commonMistakes: [
        {
          mistake: "Calling “pick and place reliably” a measurable capstone task.",
          correction:
            "Name the entity, start and target regions, tolerances, timeout, allowed contacts, forbidden events, terminal robot state, intervention policy, and evidence source for every required predicate.",
        },
        {
          mistake: "Letting the operator’s success button become ground truth.",
          correction:
            "Store the button as an annotation, then derive the reviewed outcome from synchronized terminal observations, robot state, event history, and the frozen rubric.",
        },
        {
          mistake: "Removing invalid or aborted attempts from the denominator without recording them.",
          correction:
            "Preserve every opened episode in the raw ledger, give it one explicit outcome and reason, and publish both collection and curated-release denominators.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is “the object reached the bowl” not yet a complete success definition?",
          answer:
            "It omits object identity, containment tolerance, persistence, allowed contact, timeout, intervention, terminal robot state, and the evidence used to judge the claim.",
        },
        {
          question: "What is the difference between `task_failure` and `invalid_recording`?",
          answer:
            "`task_failure` is a validly observed attempt that missed the task criteria; `invalid_recording` means evidence or protocol was defective enough that the task outcome cannot be trusted.",
        },
        {
          question: "Why freeze the autonomous evaluation denominator before training?",
          answer:
            "It prevents the task, threshold, or counted trials from being changed after results are known, which would turn evaluation into retrospective storytelling.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The learner’s own annotated start and finish scene plus predicate table is more task-specific and auditable than a reusable generated diagram.",
      },
    },
    {
      dayId: 156,
      mentalModel:
        "Variation design is a tray of labeled starting arrangements: change one bounded physical factor on purpose, record its identity, and prevent the schedule from hiding two changes inside one pattern.",
      explanation: [
        "Choose variation from the operating claim, not from whatever is easy to move. For a tabletop task, relevant factors may include object instance, start cell, yaw range, distractor layout, illumination band, camera mount, and robot reset pose. Give each factor discrete levels or a sampled bounded range, a measurement method, and an exclusion boundary. A bright lamp angle is not a useful level unless illuminance or a reproducible fixture setting identifies it.",
        "Separate semantic factors from nuisance factors. Changing the requested target or object class can change the task meaning; changing light direction or a harmless distractor may preserve the task while testing perception robustness. Do not vary unmodeled hazards, payload, grip material, speed, or workspace geometry casually. A dataset needs variety inside a declared safe envelope, not surprising states that the robot, tool, or supervision plan was never commissioned to handle.",
        "Balance intersections, sessions, and order. If every far-right start is recorded late under dim light by one tired operator, the policy can learn the session, operator style, or brightness as a shortcut. Build a condition ledger, randomize or counterbalance safe cells within each session, rotate operators where permitted, and repeat cells across time. Preserve session, reset, object instance, and configuration IDs so correlations remain measurable rather than disappearing into filenames.",
        "A variation plan includes stop rules and review, not only quotas. Reject a proposed cell when the object is unreachable, a camera loses the terminal region, a cable or collision margin is violated, or reset evidence cannot be reproduced. Run a small pilot across extreme allowed levels before filling the grid. If a boundary condition creates unsafe or systematically invalid episodes, narrow the declared envelope and document why instead of forcing equal counts.",
      ],
      keyTerms: [
        {
          term: "Variation factor",
          meaning:
            "One declared physical or contextual property deliberately changed across episodes while its level and measurement remain recorded.",
          physicalExample:
            "The sponge begins in left, center, or right start cells whose taped boundaries and coordinates are versioned.",
        },
        {
          term: "Factor level",
          meaning:
            "A named value, interval, or category allowed for one variation factor.",
          physicalExample:
            "Illumination level `L2` means the fixed lamp setting that produces 280–320 lux at the marked table point.",
        },
        {
          term: "Condition cell",
          meaning:
            "One intersection of selected factor levels used for scheduling, counting, and coverage review.",
          physicalExample:
            "Cell `S=right, O=sponge2, L=dim` describes a specific start, object instance, and lighting combination.",
        },
        {
          term: "Confounding",
          meaning:
            "A collection pattern in which two factors always change together, making their separate relationship to behavior impossible to determine.",
          physicalExample:
            "All blue objects are recorded by operator A and all yellow objects by operator B, so colour and operator technique cannot be separated.",
        },
        {
          term: "Counterbalancing",
          meaning:
            "Scheduling condition orders so time, fatigue, warm-up, battery, or session effects do not repeatedly favor the same factor level.",
          physicalExample:
            "One session records left-center-right starts, while the next uses right-left-center instead of always leaving right starts until last.",
        },
      ],
      physicalExamples: [
        {
          title: "Same sponge, different honest starts",
          scenario:
            "A simulated gripper handles two sponge instances from three taped start cells under two reproducible light settings, while bowl pose, camera mount, speed limits, and task wording remain fixed.",
          lookFor:
            "Every episode carries explicit factor levels, each allowed extreme was piloted, and object identity is not permanently paired with one start cell or light level.",
        },
        {
          title: "Docking grid with a hidden session shortcut",
          scenario:
            "A rover records all left-offset docking starts in the morning with a full battery and all right-offset starts after lunch with lower voltage and a shifted camera exposure.",
          lookFor:
            "Start side is confounded with session conditions; repeat both sides across sessions or narrow the claim, and record battery and camera configuration rather than pretending only pose changed.",
        },
      ],
      workedExample: {
        title: "Build and deconfound a 24-episode pilot schedule",
        setup:
          "The sponge task varies three start cells `L/C/R`, two object instances `S1/S2`, and two light bands `bright/dim`. The full grid contains `3 × 2 × 2 = 12` condition cells, with two pilot episodes planned per cell.",
        steps: [
          "Create stable IDs and measurement rules for all 12 cells; keep bowl pose, camera mount, robot limits, gripper, task wording, and calibration fixed for this pilot.",
          "Set the planned denominator to `12 cells × 2 episodes = 24 episodes`, while retaining separately any invalid starts or aborted recordings that cause recollection.",
          "Reject a naive order that records all S1-bright cells first and S2-dim cells last, because object, light, time, and operator adaptation would move together.",
          "Construct two 12-cell blocks in different safe orders so each start, object, and light level appears early and late; require a fresh reset proof before every row.",
          "Pilot the geometric extremes `L` and `R` under both light bands before completing the center cells; stop if reach, visibility, command margin, or reset reproducibility leaves the approved envelope.",
          "After collection, reconcile scheduled versus attempted versus valid counts per cell and preserve session, order index, reset, object, lighting, and configuration identities for later coverage and split grouping.",
        ],
        result:
          "The schedule covers 12 declared intersections twice without permanently coupling object, light, and order; extreme cells are tested early, and rejected conditions remain visible rather than being silently replaced.",
        takeaway:
          "Useful diversity is designed, bounded, and attributable; uncontrolled novelty produces a confusing dataset rather than robust evidence.",
      },
      handsOn: {
        setup:
          "Use the Day 155 contract with a simulator or paper scene. Choose only factors that can be reset and measured without changing the approved safety envelope.",
        steps: [
          "List candidate scene, object, lighting, start-state, camera, and operator factors, then mark each as task-semantic, nuisance, fixed, or excluded.",
          "Select two or three factors for v1, define every level with units or a reproducible identity, and document the physical boundary outside which collection stops.",
          "Generate the complete condition-cell ledger and calculate the planned episode denominator before deciding the order.",
          "Create two counterbalanced collection blocks that distribute factor levels across early and late positions and avoid assigning one operator or session to a single level.",
          "Run one nominal center-cell case and one boundary case from the hardest allowed cell in simulation, checking inputs, outputs, units, reach, visibility, collision margin, command limits, reset proof, and explicit failure result.",
          "Revise the ledger with rejected cells, reasons, narrowed claims, stable factor IDs, session fields, and a quota that another collector could follow exactly.",
        ],
        observe:
          "A small grid quickly reveals correlations that prose hides, and the hardest combination often exposes a visibility, reach, or reset problem before large-scale recording begins.",
        doneWhen:
          "Every scheduled row maps to a measurable allowed scene, no factor level is permanently tied to one operator or order position, and the planned denominator reconciles with the cell quotas.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION],
        workExample:
          "Design robot-learning collection matrices that represent deployment-relevant scene and start-state variation, block unsafe combinations, deconfound operator and session effects, and leave a traceable schedule for targeted recollection.",
        interviewPrompt:
          "You have two objects, three start poses, and two lighting conditions but only 24 demonstrations. Explain the condition grid, order design, confounding risks, pilot boundaries, and what metadata you must retain.",
      },
      commonMistakes: [
        {
          mistake: "Calling random object placement a sufficient variation strategy.",
          correction:
            "Define bounded factors and measured levels, log the realized condition, and compare cell counts so randomness cannot conceal unreachable regions or repeated easy starts.",
        },
        {
          mistake: "Recording one condition per session because setup changes are faster.",
          correction:
            "Counterbalance safe levels within or across blocks and retain session identity; otherwise lighting, battery, warm-up, operator adaptation, and time can become shortcuts.",
        },
        {
          mistake: "Forcing an unsafe or unobservable factor cell to meet an equal quota.",
          correction:
            "Stop collection, mark the cell rejected with evidence, repair the setup or narrow the supported envelope, and never trade a safety or validity boundary for visual balance.",
        },
      ],
      checkQuestions: [
        {
          question: "What makes a proposed lighting level reproducible?",
          answer:
            "It has a stable fixture setting or measured range at a named point, along with camera and session configuration, rather than a label such as “a bit dimmer.”",
        },
        {
          question: "Why is recording all right-side starts at the end risky?",
          answer:
            "Start side becomes correlated with fatigue, warm-up, battery, lighting drift, and learned operator technique, so the dataset cannot cleanly attribute behavior to the start condition.",
        },
        {
          question: "Should every mathematically possible factor combination be collected?",
          answer:
            "No. Only combinations inside the task, visibility, reach, collision, hardware, supervision, and reset boundaries belong; excluded cells and narrowed claims must be documented.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The condition ledger and counterbalanced schedule are already the exact visual artifacts needed, so a generated illustration would add decoration rather than information.",
      },
    },
    {
      dayId: 157,
      mentalModel:
        "Safe remote collection is a spring-return handle connected through several locked gates: if the hand, browser, network, lease, or watchdog disappears, command authority expires locally.",
      explanation: [
        "Picture the complete path before drawing the Flutter or Web screen: an operator holds a control; the client emits short-lived intent; an authenticated gateway checks user, robot, mode, sequence, age, frame, units, and limits; an exclusive lease identifies the only current controller; an edge or robot process applies an even tighter bound and watchdog; the controller produces measured state. The UI is one participant, never the final safety boundary, and this teaching system is not a safety-rated control function.",
        "Implement dead-man behavior as renewable authority, not as one long “start moving” command. Pointer or key release, touch cancel, focus loss, hidden page, route change, socket loss, permission change, or stale state stops renewal. Each command can carry `episode_id`, `lease_id`, `robot_generation`, `seq`, `issued_monotonic_ns`, `expires_monotonic_ns`, `frame`, `units`, and bounded action values. The receiver rejects expired, duplicate, out-of-order, wrong-generation, wrong-frame, or out-of-range messages before they reach motion code.",
        "Cancellation is observable state, not a magic stop packet. A ROS 2 cancel request may be rejected or accepted, an executing goal may enter canceling, and a terminal canceled result may arrive before or after measured motion reaches the declared stop predicate. The collection console therefore shows request, gateway decision, executor state, watchdog expiry, commanded value, and fresh measured state separately. A physical emergency stop remains independent of Flutter, WebSocket, ROS cancellation, and the ordinary command watchdog.",
        "Recording must join modalities without pretending they share one clock. Store raw operator intent, validated command, measured robot observation, camera acquisition identity, receive times, control events, task and variation IDs, and terminal outcome under one `episode_id`. Prefer acquisition timestamps on producer clocks, measure or record clock offset and uncertainty, preserve sequence gaps, and calculate pairing residuals. Display current command age, state age, video age, round-trip samples, dropped sequences, and recorder health; average latency alone hides tails that matter.",
        "Use a two-phase episode close. First revoke authority and reach the measured safe or idle predicate; then stop producers, flush frames and metadata, finalize the episode, and run structural checks. A user pressing “save” must not truncate the evidence needed to prove that motion stopped. An incomplete writer, missing terminal frame, excessive synchronization residual, or unexplained sequence gap yields `invalid_recording`, while the raw files and events remain preserved for diagnosis.",
      ],
      keyTerms: [
        {
          term: "Dead-man renewal",
          meaning:
            "A short-lived authority signal repeatedly renewed only while the operator, client, connection, permissions, and robot state remain valid.",
          physicalExample:
            "A held screen control renews a 250 ms simulated lease every 100 ms; lifting the finger stops renewal and the edge watchdog expires authority.",
        },
        {
          term: "Command expiry",
          meaning:
            "The receiver-side time after which a command is rejected or no longer authorizes motion, even if it arrives later.",
          physicalExample:
            "A forward command delayed in Wi-Fi reaches the gateway after its `expires_monotonic_ns` and is logged as stale instead of moving the rover.",
        },
        {
          term: "Exclusive authority lease",
          meaning:
            "A versioned grant that permits exactly one authenticated controller to issue bounded commands to one robot in one allowed mode.",
          physicalExample:
            "A second tablet may observe the arm but cannot command it while collector A owns the current lease generation.",
        },
        {
          term: "Pairing residual",
          meaning:
            "The remaining time difference between an observation and the action or event paired to it after the declared clock-alignment method.",
          physicalExample:
            "A camera frame is paired with the nearest measured joint state at a residual of 7 ms, which is stored rather than hidden.",
        },
        {
          term: "Cancel state",
          meaning:
            "The explicit progress of a cancellation from request through acceptance or rejection, canceling work, terminal result, and measured safe outcome.",
          physicalExample:
            "The UI shows `canceling` while simulated wheel velocity is still falling, then shows `canceled` only alongside fresh zero-velocity evidence.",
        },
        {
          term: "Robot generation",
          meaning:
            "An identity that changes across restart or authority epochs so late messages from an older robot session can be rejected.",
          physicalExample:
            "After the simulator restarts as generation 42, a queued command stamped generation 41 cannot control the new process.",
        },
      ],
      physicalExamples: [
        {
          title: "Finger slides outside the Flutter control",
          scenario:
            "An operator holds a simulated gripper jog button, then the touch leaves the widget and the operating system delivers a pointer-cancel event instead of a normal pointer-up.",
          lookFor:
            "The app stops lease renewal on cancel, the external watchdog expires command authority, measured joint velocity reaches the declared stop bound, and the event remains in the episode trace.",
        },
        {
          title: "Old rover command returns after reconnect",
          scenario:
            "A WebSocket disconnects while a forward command is in flight; the simulator restarts, reconnects with a new generation, and the delayed message arrives afterward.",
          lookFor:
            "Expiry, sequence, lease, and generation checks reject the message; reconnect begins with a fresh authoritative snapshot and no control until authority is reacquired.",
        },
      ],
      workedExample: {
        title: "Verify one delayed-network dead-man and recording trial",
        setup:
          "A simulated rover accepts at most `0.20 m/s` forward and `0.40 rad/s` yaw. The client renews at 10 Hz, each command expires after 250 ms, measured state is expected every 50 ms, and the recorder pairs frames within a declared 20 ms residual.",
        steps: [
          "Acquire authority for robot generation 8 and episode E157-04; send command sequence 101 with `vx=0.15 m/s`, issue and expiry times, frame `base_link`, and units, then show intent, acceptance, and measured velocity on separate rows.",
          "Inject a 320 ms one-way delay for sequence 102. Because it arrives after the 250 ms expiry, the gateway logs `rejected_stale` and the robot process never applies it.",
          "Allow sequence 103 to arrive, then hide the browser before the next 100 ms renewal. Confirm no visibility callback directly claims a stop; it only stops renewal while the edge watchdog owns expiry.",
          "Record the lease-expired event and zero command, then inspect measured velocity samples until the frozen stop predicate `abs(vx) < 0.01 m/s` is freshly true; retain the actual elapsed stop time.",
          "Issue a ROS 2 cancel for the episode action and keep cancel-requested, cancel-accepted, canceling, canceled result, and measured stop timestamps distinct in the trace.",
          "Pair each camera frame to robot observation and applied command, reject pairs over 20 ms from the release manifest, and preserve their residuals and clock-alignment metadata in raw data.",
          "Close the episode only after authority is revoked, measured stop is proven, writers flush and finalize, required terminal records exist, and a load-and-scrub check can reconstruct the complete trial.",
        ],
        result:
          "The delayed command is rejected, focus loss ends renewal, the independent watchdog removes authority, measured state proves the simulated stop, cancellation remains inspectable, and the finalized recording preserves timing quality.",
        takeaway:
          "A responsive control surface becomes defensible only when every command is bounded and expiring, every loss path removes authority outside the UI, and every claimed outcome is synchronized with measured evidence.",
      },
      handsOn: {
        setup:
          "Connect a minimal Flutter or Web client only to a harmless simulator. Expose a gateway, a robot-side or edge watchdog, ROS 2 action state if available, measured velocity or joint state, a synthetic or simulated camera stream, and local episode storage.",
        steps: [
          "Draw the client→gateway→authority lease→edge watchdog→controller→measured-state path and assign validation, timing, logging, and stop ownership to each boundary.",
          "Implement one held control with pointer or key down, release, cancel, blur, page-hidden, navigation, and disconnect handling; every loss path stops renewal without declaring the robot stopped.",
          "Validate authentication, robot and mode, exclusive lease, generation, sequence, issue age, expiry, frame, units, and numeric limits at the gateway, then reapply conservative limits beside the simulator.",
          "Show intent, accepted command, applied command, action or cancel state, measured motion, lease expiry, telemetry age, video age, recorder state, dropped sequence count, and latency percentiles separately.",
          "Record one episode identity across raw intent, validation decisions, applied commands, measured state, camera frames, task and variation fields, clock metadata, interventions, and terminal outcome.",
          "Add assertions, then inject release, pointer cancel, focus loss, socket loss, stale command, duplicate sequence, excessive value, prior generation, cancel rejection, frozen video, and recorder-write failure one at a time.",
          "For every case, record expected state, observed state, timing, and the exact causal fix; verify simulator-side authority and measured stop, finalize only complete episodes, and retain invalid attempts with their reason.",
        ],
        observe:
          "Client events, network state, executor cancellation, measured stopping, and media recording fail independently, so a single green connection badge or stop button cannot represent collection safety or validity.",
        doneWhen:
          "All injected loss paths remove simulated command authority outside the client, no stale or excessive command is applied, measured state confirms each stop, and a reopened episode reconstructs synchronized control and observation history.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Ship a Flutter or Web robot-collection console that integrates authenticated leased control, bounded and expiring commands, ROS 2 feedback and cancellation, independent watchdog behavior, visible latency and freshness, and episode-grade multimodal recording.",
        interviewPrompt:
          "Design browser teleoperation and data capture when focus, touch events, WebSocket, camera, ROS action state, clocks, and the robot can fail separately. Locate the dead-man, limits, cancel state, and proof of stop.",
      },
      commonMistakes: [
        {
          mistake: "Treating `pointerup` or a Flutter button callback as the component that guarantees stopping.",
          correction:
            "Use client events only to stop renewal; enforce short command expiry and zero-or-safe behavior in an edge or robot process that remains effective when the client or network disappears.",
        },
        {
          mistake: "Clamping velocity only in JavaScript or Dart before sending it.",
          correction:
            "Validate limits at every authority boundary and beside motion execution, reject non-finite, wrong-unit, wrong-frame, stale, or wrong-generation values, and log the decision.",
        },
        {
          mistake: "Showing average round-trip latency as proof the path is timely.",
          correction:
            "Expose command and observation age, tail percentiles, jitter, dropped sequences, clock uncertainty, and the tested watchdog response because rare delay controls stale-command risk.",
        },
        {
          mistake: "Ending recording at the instant cancel is requested.",
          correction:
            "Continue through cancel disposition, authority revocation, measured safe state, terminal observation, writer flush, and validation so the most important stopping evidence is not truncated.",
        },
      ],
      checkQuestions: [
        {
          question: "Where must the decisive dead-man timeout be enforced?",
          answer:
            "In an edge or robot-side component near command execution, not only in Flutter, the browser, or a remote gateway that can disappear with the network.",
        },
        {
          question: "Why are `cancel accepted` and `robot stopped` separate facts?",
          answer:
            "Acceptance means the executor agreed to process cancellation; motion may still be decelerating or cancellation may fail internally, so fresh measured state must prove the stop predicate.",
        },
        {
          question: "What does a pairing residual tell a dataset reviewer?",
          answer:
            "It quantifies how far apart the paired observation and action remain after the declared clock-alignment method, allowing excessive or uncertain synchronization to be detected.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A failure-path diagram is warranted because six independently failing boundaries connect a held UI control to measured stop evidence and synchronized episode closure.",
      },
    },
    {
      dayId: 158,
      mentalModel:
        "A balanced first batch is a tray filled from a written packing list: every allowed condition gets intentional attempts, while every spill, substitution, and rejected item stays in the count.",
      explanation: [
        "Balance begins with the Day 156 condition ledger and Day 155 episode contract. It does not mean every observable property must have identical counts. Allocate attempts across deployment-relevant cells, oversample a difficult but important cell only through a declared rule, and state the target and actual denominator. Keep scheduled, opened, completed, valid, successful, quarantined, and release-selected counts separate so recollection does not erase the cost or pattern of invalid attempts.",
        "Standardize demonstration intent without forcing robotic sameness. Train each operator on the task, allowed path, speed and force boundaries, camera occlusion rules, reset, abort, and annotation protocol. Ask for clear purposeful behavior and complete terminal states, while retaining natural bounded variation. If one operator always uses a shortcut, pauses at the same point, or sees different conditions, operator identity and session order allow reviewers to detect the correlation.",
        "Record failures rather than training the policy to imitate them by accident. An opened episode may end in clean success, task failure, operator abort, safety stop, or invalid infrastructure. Raw storage keeps all of them. The v1 release recipe can include reviewed successful demonstrations, deliberately labeled recovery segments, or other categories only if their purpose and boundaries are explicit. Pressing “redo” creates a new linked attempt; it must not overwrite the failed trajectory.",
        "Watch collection health while the batch is still small. Reconcile cell counts, valid rate, task outcome, intervention, episode duration, action saturation, missing modalities, synchronization residual, dropped sequences, and operator/session share after each block. Stop when a recorder defect or biased schedule appears. Filling fifty more episodes before checking the first ten multiplies a protocol problem and can make an apparently large dataset less useful than a small clean pilot.",
      ],
      keyTerms: [
        {
          term: "Collection denominator",
          meaning:
            "The total set of attempts relevant to a reported collection rate, explicitly defined so retries and invalid episodes cannot vanish.",
          physicalExample:
            "Thirty-two episodes were opened, thirty reached a terminal event, twenty-eight were structurally valid, and twenty-four passed behavioral review.",
        },
        {
          term: "Quota",
          meaning:
            "A planned attempt count for a condition cell or group, with a declared rule for retries and targeted additions.",
          physicalExample:
            "Each of eight start-light cells receives four opened attempts before any optional difficult-cell oversampling.",
        },
        {
          term: "Operator protocol",
          meaning:
            "The versioned instructions defining task intent, allowed control style, limits, reset, abort, and annotation expectations for demonstrators.",
          physicalExample:
            "Collectors must keep the wrist camera unobstructed, use bounded smooth increments, release on uncertainty, and finish at park before labeling.",
        },
        {
          term: "Linked retry",
          meaning:
            "A new immutable episode related to an earlier failed or invalid attempt without replacing it.",
          physicalExample:
            "Episode E18 retries E17 after a camera drop; both remain in raw history and E18 records `retry_of=E17`.",
        },
        {
          term: "Release recipe",
          meaning:
            "A versioned set of inclusion, exclusion, transformation, and label rules that selects training-ready records from immutable raw collection.",
          physicalExample:
            "Recipe R1 includes reviewed successes with residual below 20 ms and excludes invalid media while retaining every excluded episode in the audit ledger.",
        },
      ],
      physicalExamples: [
        {
          title: "Easy center starts crowd out the corners",
          scenario:
            "A collector enjoys smooth center-cell grasps and records twelve of them, but opens only two attempts from each corner because those require slower alignment.",
          lookFor:
            "The live quota display blocks convenience-driven repetition, preserves every opened attempt, and makes the corner deficit visible before the session closes.",
        },
        {
          title: "Two rover operators, two driving signatures",
          scenario:
            "Operator A uses short steering pulses while operator B holds longer arcs; both can dock successfully, but A records only bright scenes and B only dim scenes.",
          lookFor:
            "Operator and light are confounded despite equal success counts, so future blocks cross both operators with both conditions or narrow the supported claim.",
        },
      ],
      workedExample: {
        title: "Collect and reconcile a 32-attempt first batch",
        setup:
          "The plan contains eight safe condition cells from two start sides, two object instances, and two light bands. The quota is four opened attempts per cell, for `8 × 4 = 32` total attempts.",
        steps: [
          "Freeze the order, operator protocol, task contract, recorder revision, robot configuration, calibration, and retry rule; calculate the scheduled denominator of 32 before opening episode one.",
          "After each block of eight, compare opened counts with all eight cell quotas and operator/session shares; do not let a quick retry replace the next scheduled cell.",
          "When episode E09 loses camera frames, close it as `invalid_recording`, retain its raw identity and cell, and create E10 as a linked retry while keeping the original 32-attempt denominator report intact.",
          "When E17 drops the object, close it as a valid `task_failure`; retain the behavior and terminal evidence, but do not include its failed action sequence in the successful-demonstration recipe by default.",
          "At batch end, reconcile 32 opened episodes: 30 terminally complete, 29 structurally valid, 25 task successes, 3 valid task failures, 1 structurally invalid episode, 1 operator abort, and 2 incomplete attempts; define clearly which categories overlap or are mutually exclusive.",
          "Create release candidate R1 from episodes that pass structure, synchronization, task, behavior, and rights review; publish both raw collection counts and R1 counts per condition rather than reporting only the attractive selected total.",
        ],
        result:
          "The first batch retains the history of all 32 attempts, exposes one recorder defect and condition-level rates, and selects demonstrations through an explicit recipe without rewriting retries into a perfect collection story.",
        takeaway:
          "Balanced collection is controlled sampling plus honest accounting, not an equal-looking final folder produced by deleting awkward attempts.",
      },
      handsOn: {
        setup:
          "Use the safe simulator console and condition ledger. If no recorder is available, represent episodes with immutable cards carrying the same IDs, outcomes, and condition fields.",
        steps: [
          "Freeze the operator protocol, cell quotas, block order, retry linkage, stop rules, and the distinction among raw, reviewed, and release-selected records.",
          "Preserve the last working recorder baseline, run one nominal calibration episode and one safe-cancellation episode excluded from v1, expose both in logs or the inspector, and only then authorize collection.",
          "Collect at least two attempts per safe cell without skipping difficult rows; create a new episode for every retry and preserve the prior outcome.",
          "After each block, calculate opened, complete, structurally valid, behavior-pass, and task-success counts by cell, operator, and session.",
          "Inspect action bounds, missing fields, timestamp residuals, dropped sequences, terminal evidence, intervention, and duration before continuing.",
          "Stop on a repeated recorder defect, an unsafe condition, or a confounded schedule; repair the protocol or narrow the claim before collecting further episodes.",
        ],
        observe:
          "The first few episodes reveal protocol drift and unequal difficulty quickly, while counts based only on retained successes hide both recorder reliability and the states demonstrators struggled to recover from.",
        doneWhen:
          "Every scheduled attempt has an immutable identity and disposition, cell counts reconcile, retries link rather than overwrite, operator/session correlations are visible, and release inclusion follows a written review recipe.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_HMI, ROLE_VALIDATION],
        workExample:
          "Operate a robot demonstration campaign with quota-aware collection UI, operator protocols, immutable retries, live multimodal health checks, and release recipes that preserve raw failure evidence while selecting behavior fit for a stated learning objective.",
        interviewPrompt:
          "Your collectors report 30 good demonstrations after many retries. Describe the denominators, quota process, operator bias checks, failure retention, and release recipe needed before you would call the batch balanced.",
      },
      commonMistakes: [
        {
          mistake: "Replacing a failed episode with its successful retry under the same identity.",
          correction:
            "Close the first attempt with its real outcome, open a new identity linked through `retry_of`, and report rates over the original collection denominator as well as the curated release.",
        },
        {
          mistake: "Equating balance with identical counts for every metadata value.",
          correction:
            "Allocate by the deployment claim and risk, audit important intersections, and document deliberate oversampling; arbitrary equality can waste episodes while leaving meaningful states sparse.",
        },
        {
          mistake: "Waiting until the target episode count is reached before reviewing recorder health.",
          correction:
            "Review small blocks for structure, synchronization, control bounds, outcomes, and condition counts so a repeated protocol or infrastructure defect stops collection early.",
        },
      ],
      checkQuestions: [
        {
          question: "Why must a retry receive a new episode identity?",
          answer:
            "A new identity preserves the earlier failure or invalid attempt, keeps denominators honest, and lets reviewers reconstruct why and how the recollection occurred.",
        },
        {
          question: "Does a valid task failure belong in raw storage?",
          answer:
            "Yes. It is evidence about collection and difficult states; whether any portion enters a training recipe is a separate explicit decision tied to the learning objective.",
        },
        {
          question: "What should be checked after each small collection block?",
          answer:
            "Condition, operator, and session counts plus structural validity, synchronization, dropped sequences, action bounds, outcomes, interventions, duration, and terminal evidence.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The live quota and denominator table is the decision surface; a second generic collection graphic would not improve the learner’s judgment.",
      },
    },
    {
      dayId: 159,
      mentalModel:
        "Failure review is a workshop inspection bench: keep the broken part, name the fracture, trace which production condition made it likely, and repair the process that produced the gap.",
      explanation: [
        "Review operates in layers. Structural checks ask whether required records exist, media decodes, timestamps and sequence are coherent, schema fields match, and the episode finalizes. Semantic checks ask whether units, frames, identities, task, factor levels, reset, and labels mean what they claim. Behavioral checks inspect purposeful motion, unnecessary contact, jitter, occlusion, intervention, terminal evidence, and protocol compliance. Task outcome remains separate: an episode can be structurally excellent yet demonstrate a failed grasp.",
        "Give every non-pass one primary reason and optional contributing reasons from a versioned taxonomy. Useful families include setup or reset defect, operator technique, perception or visibility, command path, limit rejection, timing or synchronization, recorder infrastructure, robot or simulator fault, task difficulty, safety stop, and rights or privacy hold. Preserve reviewer, rubric revision, decisive timestamp, evidence link, and disposition `include`, `quarantine`, or `exclude`; free-form comments alone cannot support reliable counts.",
        "Join failure reasons to the condition matrix. Overall success may look healthy while one object-light-start intersection produces occlusion, one operator has excessive action saturation, or one session has pairing residuals beyond tolerance. Calculate counts and rates with denominators for each important cell, inspect every severe event and invalid record, and sample passing episodes too. A failure taxonomy without coverage tells what broke; coverage without synchronized review may count unusable data as representation.",
        "Repair the cause, then collect the smallest targeted batch that tests the repair. A moved lamp may fix visibility; revised reset marks may remove pose drift; a gateway fix may eliminate stale commands; operator retraining may reduce jitter. Assign new protocol, configuration, or recorder versions and link recollection to the gap. Do not duplicate existing episodes, relabel an unsupported outcome, or use image augmentation as evidence that physical timing and contact were collected.",
      ],
      keyTerms: [
        {
          term: "Failure taxonomy",
          meaning:
            "A versioned set of mutually understandable reason codes used to classify invalid, failed, aborted, or safety-related episodes consistently.",
          physicalExample:
            "A dark frame that hides the gripper receives primary reason `visibility_occlusion`, while a dropped packet is recorded as a contributing timing issue.",
        },
        {
          term: "Disposition",
          meaning:
            "The review decision controlling whether an episode is included, quarantined for investigation, or excluded from a named release recipe.",
          physicalExample:
            "A successful episode with uncertain calibration is quarantined until its configuration identity is verified.",
        },
        {
          term: "Sparse cell",
          meaning:
            "A deployment-relevant condition intersection with too few valid reviewed episodes to support the intended claim.",
          physicalExample:
            "The dim-light, right-start, sponge-S2 cell has one valid demonstration while other cells have four.",
        },
        {
          term: "Targeted recollection",
          meaning:
            "A new collection block aimed at a measured defect or coverage gap under an explicitly revised protocol or configuration.",
          physicalExample:
            "Four new dim-right episodes are recorded after moving the camera and verifying that the target remains visible.",
        },
        {
          term: "Review rubric",
          meaning:
            "The versioned observable rules by which reviewers judge structure, meaning, behavior, outcome, safety events, and release suitability.",
          physicalExample:
            "Rubric Q2 requires a terminal frame, pairing residual below 20 ms, no unlabelled intervention, and a visible two-second placement hold.",
        },
      ],
      physicalExamples: [
        {
          title: "Dim-right grasps disappear behind the wrist",
          scenario:
            "Four attempts from the right start under dim light reach the object, but the wrist blocks the overhead camera exactly during closure and reviewers cannot verify contact.",
          lookFor:
            "The issue is not repaired by marking successes manually; visibility and terminal evidence are changed, the protocol version advances, and that exact condition is recollected.",
        },
        {
          title: "Rover failures cluster after a recorder update",
          scenario:
            "Docking motion looks normal, yet most episodes from session S4 have action-to-state residuals above tolerance after new recorder software was installed.",
          lookFor:
            "Join failure reasons to recorder revision and session, quarantine affected episodes, reproduce the timing defect, and validate the repair before adding more driving demonstrations.",
        },
      ],
      workedExample: {
        title: "Find the real gap inside a 32-attempt batch",
        setup:
          "The batch opened 32 episodes across eight cells. Review finds 2 incomplete, 1 invalid video, 3 task failures, 1 operator abort, and 25 reviewed successes. The dim-right-S2 cell has four opened attempts: one incomplete, one invalid video, two task failures, and zero release-ready successes.",
        steps: [
          "Reconcile terminal outcomes first: `32 opened - 2 incomplete = 30 terminally closed`; retain all 32 identities and do not merge invalidity with task failure.",
          "Apply structural checks to the 30 closed episodes and quarantine the one invalid-video episode; then apply semantic, behavioral, and task rubrics to the remaining valid records.",
          "Calculate batch task-success rate over all opened attempts as `25 / 32 = 78.125%`, while labeling this denominator separately from success among structurally valid completed attempts.",
          "Read the dim-right-S2 intersection: `0 / 4` release-ready, with two different infrastructure outcomes and two task failures, so the gap is both coverage and reliability rather than a simple quota shortage.",
          "Inspect synchronized timelines and discover camera occlusion in the two task failures plus a recorder stall in the invalid episode; assign primary and contributing reason codes with decisive timestamps.",
          "Move the simulated camera within the approved geometry, fix and fault-test the recorder, advance configuration and protocol versions, then schedule four linked dim-right-S2 recollections before filling any already healthy cell.",
          "Accept the repair only if the new block passes structure and synchronization, shows the formerly hidden grasp, and adds reviewed examples without changing the original 32-attempt report.",
        ],
        result:
          "The apparent need for “more dim data” becomes two concrete repairs—visibility and recorder timing—followed by four versioned recollections in the only empty release-ready cell.",
        takeaway:
          "Coverage repair starts from joined condition and failure evidence; otherwise new collection can reproduce the same defect at a larger scale.",
      },
      handsOn: {
        setup:
          "Use the first-batch raw ledger, synchronized inspector, condition table, and immutable episode files. Define the review rubric and taxonomy before counting favorite examples.",
        steps: [
          "Run structural checks for required modalities, finalization, decode, schema, timestamp order, sequence gaps, episode boundaries, and synchronization tolerance.",
          "Review semantic identity, units, frames, task, factor levels, reset, terminal label, intervention, and rights fields against the actual synchronized record.",
          "Inspect behavior and task outcome for every failed, aborted, invalid, saturated, or timing-outlier episode plus at least one passing example from each populated cell.",
          "Assign disposition, primary reason, contributing reasons, reviewer, rubric version, decisive timestamp, and evidence reference without changing raw files.",
          "Build a matrix of opened, valid, behavior-pass, task-success, and release-ready counts for important condition intersections, operators, sessions, and recorder revisions.",
          "Choose the highest-risk sparse or failing cell, repair its root protocol or system issue, advance the relevant version, and schedule a bounded targeted recollection.",
          "Rerun review on the added episodes and report pre-repair and post-repair counts separately so improvement cannot overwrite the original evidence.",
        ],
        observe:
          "The dominant visible task failure may not be the dominant dataset defect, and a small intersection often reveals correlations that disappear in overall success and validity rates.",
        doneWhen:
          "All reviewed decisions trace to evidence and rubric versions, counts reconcile at batch and cell levels, the repair addresses a demonstrated cause, and new episodes improve the targeted cell without rewriting history.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_SOFTWARE],
        workExample:
          "Build a demonstration-data QA loop that combines automated integrity checks, synchronized behavioral inspection, reason-coded dispositions, condition and revision slicing, root-cause repair, and bounded recollection linked to deployment risk.",
        interviewPrompt:
          "A robot dataset reports 80% success but one scene cell has no usable episodes. Explain your review layers, failure taxonomy, denominators, root-cause evidence, quarantine policy, and targeted recollection decision.",
      },
      commonMistakes: [
        {
          mistake: "Using one label named `bad` for corrupt media, poor technique, task failure, and safety stop.",
          correction:
            "Keep structural validity, behavioral quality, task outcome, intervention, and safety events as separate fields, then assign versioned primary and contributing reason codes.",
        },
        {
          mistake: "Adding random episodes after finding a sparse condition cell.",
          correction:
            "Trace why the cell is sparse or failing, repair visibility, reset, control, recorder, or protocol causes first, then recollect that named intersection under a new version.",
        },
        {
          mistake: "Reclassifying uncertain episodes as successes to make cell counts look complete.",
          correction:
            "Quarantine records whose evidence cannot satisfy the frozen rubric and report the gap; a full matrix built from untrustworthy labels is worse than an honest empty cell.",
        },
      ],
      checkQuestions: [
        {
          question: "Can a task-failure episode still be structurally valid?",
          answer:
            "Yes. Its files, schema, timing, and labels can be complete and trustworthy even though the demonstrated physical task did not meet its terminal predicates.",
        },
        {
          question: "Why join failure reason with condition, operator, session, and recorder revision?",
          answer:
            "The joins expose clustered causes and confounding that overall rates hide, directing repair toward the actual setup, process, software, or difficult scene.",
        },
        {
          question: "What must happen before targeted recollection begins?",
          answer:
            "The measured cause should be repaired or the claim narrowed, the affected protocol or configuration versioned, and the exact gap and stop rule scheduled.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A condition-by-disposition matrix linked to reason codes is necessary to reveal the empty usable cell and distinguish task difficulty from recorder and visibility defects.",
      },
    },
    {
      dayId: 160,
      mentalModel:
        "A trustworthy split is three locked rooms for related physical scenes: every frame, retry, crop, and statistic follows its scene family into one room and never slips under another door.",
      explanation: [
        "Choose the independence unit before assigning percentages. Individual video frames are highly related to neighboring frames, and separate episodes can still share the same object instance, fixture layout, reset, camera pose, session, or scripted motion. Create a `scene_group_id` from the smallest family that could leak recognizable physical information. All episodes, retries, clips, corrected labels, and deterministic derivatives from that family inherit one split.",
        "Give each partition a distinct job. Training episodes fit model parameters and training-only transforms. Validation scenes support architecture, checkpoint, threshold, and collection decisions. Held-out scenes stay sealed until the policy and decision rules are frozen, then estimate behavior on genuinely unseen physical arrangements. Looking repeatedly at held-out failures and tuning to them converts those scenes into validation data, even if filenames still say `held_out`.",
        "Stratify at group level where possible, but never break a group merely to make frame or episode percentages pretty. A small dataset may have unequal counts after grouping. Compare factor and outcome coverage across partitions, document missing levels, and add independent scene groups if the held-out claim needs broader support. A held-out scene should differ in the intended way while remaining inside the declared task and safety envelope; an impossible new task is not a fair generalization test.",
        "Prevent less obvious leakage. Fit normalization, bounds learned from data, vocabulary, image statistics, and feature selection on training data only. Keep augmented frames, temporal windows, re-encoded videos, clips, and relabeled copies with their source group. Do not use held-out performance to choose a camera crop, success tolerance, or preprocessing revision. Freeze a split manifest containing group identities, reasons, seed or assignment procedure, and hashes, then test disjointness before any training loader opens the data.",
      ],
      keyTerms: [
        {
          term: "Scene group",
          meaning:
            "The set of episodes and derivatives sharing physical or procedural identity strongly enough that crossing partitions would leak familiarity.",
          physicalExample:
            "All attempts and retries using fixture layout F3, sponge instance S2, camera pose C7, and one reset block share group G-F3-S2-C7.",
        },
        {
          term: "Train split",
          meaning:
            "The only partition used to fit policy parameters and any data-derived preprocessing statistics.",
          physicalExample:
            "Joint normalization mean and scale are calculated from training episodes, then frozen before validation and held-out loading.",
        },
        {
          term: "Validation split",
          meaning:
            "Independent groups used repeatedly for model, checkpoint, threshold, and engineering decisions without updating on their examples directly.",
          physicalExample:
            "Two validation layouts compare checkpoints and reveal that dim scenes need a better training collection plan.",
        },
        {
          term: "Held-out scene split",
          meaning:
            "Sealed in-envelope scene groups reserved for final evaluation after model and decision rules are frozen.",
          physicalExample:
            "A bowl at an unseen allowed fixture position and a fresh sponge instance remain inaccessible until the policy package is selected.",
        },
        {
          term: "Data leakage",
          meaning:
            "Information from validation or held-out groups influences fitting or decisions in a way that makes reported generalization overly optimistic.",
          physicalExample:
            "Frames from one grasp train the model while adjacent frames from the same episode score it as though they were independent.",
        },
        {
          term: "Split manifest",
          meaning:
            "An immutable mapping from source group and episode identities to partitions, with assignment method, rationale, and content hashes.",
          physicalExample:
            "Manifest M1 maps every retry of scene group G08 to validation and fails validation if any derived clip appears in train.",
        },
      ],
      physicalExamples: [
        {
          title: "One grasp appears in two folders",
          scenario:
            "A recorder exports the first 80 percent of frames from each episode to train and the remaining 20 percent to validation, so nearly adjacent images of every motion occupy both partitions.",
          lookFor:
            "Frame counts look balanced but evaluation is contaminated; the entire episode and its derivatives must follow a broader physical scene group into one partition.",
        },
        {
          title: "New filename, familiar sponge",
          scenario:
            "A retry uses the same sponge, bowl layout, camera pose, reset block, and operator path as a training attempt but receives a new episode name and is assigned held-out.",
          lookFor:
            "Episode identity alone is too weak; shared physical and procedural ancestry places both attempts in the same scene group.",
        },
      ],
      workedExample: {
        title: "Split 48 episodes without cutting scene families",
        setup:
          "The reviewed release candidate has 12 independent scene groups, each containing four related episodes or retries, for 48 episodes. The intended assignment is eight training groups, two validation groups, and two sealed held-out groups.",
        steps: [
          "Define group identity from fixture layout, object instance, camera pose, and reset block; verify every episode has exactly one `scene_group_id` and every retry inherits its parent group.",
          "Assign eight whole groups to train, two to validation, and two to held-out, yielding `8 × 4 = 32`, `2 × 4 = 8`, and `2 × 4 = 8` episodes without moving individual episodes to polish percentages.",
          "Compare start, light, object, outcome, operator, and session coverage at the group and episode levels; record any factor absent from validation or held-out rather than borrowing a related training episode.",
          "Traverse provenance for cropped frames, temporal windows, re-encoded media, corrected annotations, and other derivatives, requiring every descendant to inherit the source group’s partition.",
          "Fit normalization and any data-derived thresholds from the 32 training episodes only; store their fitted values and training-manifest hash, then apply them unchanged elsewhere.",
          "Seal held-out identities and labels from routine model development, freeze validation-based checkpoint and decision rules, and open held-out only for the declared final evaluation.",
          "Run disjointness checks over episode IDs, scene groups, raw hashes, source ancestry, reset blocks, and derived artifacts; fail the release if any prohibited intersection is nonempty.",
        ],
        result:
          "The 48 episodes form 32/8/8 partitions by whole scene family, all derivatives inherit their source assignment, statistics come only from train, and held-out scenes remain a final in-envelope test.",
        takeaway:
          "The honest split unit is the strongest shared cause of familiarity, not the smallest row that makes percentages convenient.",
      },
      handsOn: {
        setup:
          "Use the reviewed episode ledger, raw lineage, variation fields, reset blocks, sessions, and operator metadata. Do not train a model during this split-design exercise.",
        steps: [
          "List every relationship that can make two episodes familiar: same continuous episode, retry, object instance, fixture, reset, camera pose, session, operator pattern, or derived media.",
          "Define and assign one stable `scene_group_id` per related family, resolving orphaned or ambiguous lineage before splitting.",
          "Choose whole groups for train, validation, and held-out scenes based on each partition’s job and the intended evaluation claim.",
          "Audit group and episode coverage across task-relevant factors, recording shortages without moving related examples across boundaries.",
          "Attach every crop, clip, augmentation, relabel, re-encode, and temporal window to its source group and partition.",
          "Calculate preprocessing statistics from train only, then write a manifest with assignments, rationale, procedure or seed, schema, and hashes.",
          "Run the split workflow from one documented command; capture its disjointness trace or plot, a 60–120 second uncut manifest walkthrough, and the largest remaining coverage failure before sealing held-out access.",
        ],
        observe:
          "Group-level splitting produces less tidy percentages but removes near-duplicate physical experience that would otherwise make validation and held-out scores falsely reassuring.",
        doneWhen:
          "Every release episode and derivative has one inherited partition, all tested intersections are empty, preprocessing fits only train, and held-out scenes can be opened under a declared final-evaluation procedure.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Design leakage-resistant robot-learning partitions by tracing scene and retry lineage, assigning whole physical groups, fitting preprocessing on train only, sealing held-out evaluation, and automating disjointness checks in the dataset pipeline.",
        interviewPrompt:
          "Why is episode-level random splitting sometimes still unsafe for robot demonstrations? Define your scene group, the jobs of train, validation, and held-out scenes, and the leakage tests you would automate.",
      },
      commonMistakes: [
        {
          mistake: "Randomly assigning individual frames to achieve an exact 80/10/10 ratio.",
          correction:
            "Assign whole scene families and their derivatives to one partition; accept untidy row counts or collect more independent groups rather than contaminating evaluation.",
        },
        {
          mistake: "Using held-out results repeatedly to choose checkpoints or preprocessing.",
          correction:
            "Make iterative decisions on validation, freeze model and rules, then use the sealed held-out scenes only for the declared final assessment or retire them into future validation.",
        },
        {
          mistake: "Computing normalization over all episodes before splitting.",
          correction:
            "Fit every data-derived transform on the training manifest only, store its provenance, and apply the frozen transform unchanged to validation and held-out data.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can two different episode IDs still belong to one scene group?",
          answer:
            "They may be retries or share object, fixture, camera, reset, session, or procedural ancestry strongly enough that one makes the other familiar.",
        },
        {
          question: "What happens if held-out scenes guide repeated model changes?",
          answer:
            "They have functionally become validation data, so their later score no longer estimates performance on untouched scenes.",
        },
        {
          question: "Where are normalization statistics fitted?",
          answer:
            "Only on the training partition after the split manifest is frozen, with the training manifest and transform values recorded for provenance.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A lineage graph with scene families, retries, derived clips, and three locked partitions makes non-obvious leakage paths materially easier to detect than prose alone.",
      },
    },
    {
      dayId: 161,
      mentalModel:
        "Dataset v1 is a sealed evidence crate: the inventory, measurements, inspection marks, examples, ownership, limitations, and fingerprints must all describe the same contents.",
      explanation: [
        "Freezing means immutability plus reproducibility, not perfection. Separate raw capture, review annotations, release recipe, and frozen release. Dataset v1 receives a stable identity, schema version, exact episode and split manifests, recorder and protocol revisions, robot and calibration identities, and content checksums. Once published or used for a reported training run, those bytes and assignments do not change in place; a correction creates a traceable successor.",
        "Write the dataset card from calculated artifacts. State task and episode contracts, hardware or simulation environment, teleoperation path, feature names and ordered semantics, units, frames, sampling and synchronization method, variation envelope, operators and sessions at an appropriate privacy level, counts and durations, split logic, quality rubric, exclusions, rights decision, intended use, unsupported use, limitations, known sparse cells, and contact or ownership channel. Every headline metric names its denominator and manifest.",
        "Choose examples that expose the release rather than advertise it. Include at least one ordinary success, one hard but valid success, one excluded or quarantined case with reason, and one terminal or synchronization trace. Each example links camera, measured state, applied action, timing residual, task fields, outcome, disposition, and source episode without leaking a sealed held-out evaluation scene. A visualizer opening an example proves inspectability, not correctness, so automated and human checks remain separate.",
        "Run a freeze gate from empty cache to loaded episode. Finalize writers, verify every referenced media and metadata range, validate schema and timestamps, reconcile counts and duration, prove split and lineage disjointness, recompute checksums, recalculate metrics, scan privacy and secrets, and reproduce the card tables. Store the exact verification command and result. If any gate fails, v1 remains a candidate; do not edit the report to match broken bytes.",
        "Document what v1 cannot support. A small dataset may omit reflective objects, extreme yaw, alternate cameras, recovery behavior, or multiple operators. Those limitations define the next collection backlog and cap policy claims. Version `v1.0.1` can repair documentation or labels only under a stated compatibility rule; changed episode membership, split groups, task semantics, or feature meaning normally requires a new release lineage. A frozen weak dataset is honest; a mutable “final” dataset is not evidence.",
      ],
      keyTerms: [
        {
          term: "Frozen manifest",
          meaning:
            "The immutable inventory of release episode, group, partition, disposition, source, and content identities used to reconstruct exactly what v1 contains.",
          physicalExample:
            "Manifest M-v1 lists 24 training, 6 validation, and 6 held-out episode IDs with scene groups and SHA-256 content fingerprints.",
        },
        {
          term: "Dataset card",
          meaning:
            "Versioned documentation of task, collection, schema, provenance, quality, splits, rights, intended use, limitations, and measured release statistics.",
          physicalExample:
            "The card states that dim-right scenes have only three release-ready examples and forbids a claim about reflective objects that were never collected.",
        },
        {
          term: "Content checksum",
          meaning:
            "A deterministic fingerprint used to detect whether a referenced file or manifest changed after the release was frozen.",
          physicalExample:
            "Changing one Parquet byte causes its recorded SHA-256 value to disagree during verification.",
        },
        {
          term: "Release candidate",
          meaning:
            "A complete proposed dataset version that must pass all freeze gates before it earns the final immutable identity.",
          physicalExample:
            "Candidate `v1-rc3` loads locally but stays a candidate because one video range referenced by episode E28 is missing.",
        },
        {
          term: "Known limitation",
          meaning:
            "A measured or observed boundary that constrains appropriate use and future performance claims.",
          physicalExample:
            "Only matte sponge objects under 180–420 lux were collected, so glossy objects and sunlight remain unsupported.",
        },
        {
          term: "Release lineage",
          meaning:
            "The traceable relationship among a frozen version and later corrected or expanded versions, including exactly what changed and why.",
          physicalExample:
            "Dataset v2 descends from v1 but adds new object instances and scene groups while retaining v1 checksums and a machine-readable change log.",
        },
      ],
      physicalExamples: [
        {
          title: "A polished card points to a missing video",
          scenario:
            "The release README reports 36 reviewed episodes, but an empty-cache verifier cannot open episode E28 because its camera range was never finalized into the referenced video shard.",
          lookFor:
            "The release remains a candidate despite attractive documentation; finalization, referential integrity, load, playback, and count reconciliation must pass against the actual frozen files.",
        },
        {
          title: "Quiet label edit changes a reported result",
          scenario:
            "After training, someone changes one failed held-out episode to success inside the existing v1 folder and updates the summary percentage without publishing a successor.",
          lookFor:
            "Checksums and immutable manifests detect the mutation; the correction needs review, change log, new identity, recalculated metrics, and an explicit effect on prior claims.",
        },
      ],
      workedExample: {
        title: "Reconcile and freeze one 36-episode v1 release",
        setup:
          "Release candidate RC3 selects 36 reviewed episodes from 42 raw attempts. Its split manifest assigns 24 train, 6 validation, and 6 held-out episodes across disjoint scene groups. Total selected duration is 540 seconds.",
        steps: [
          "Reconcile membership: `24 + 6 + 6 = 36 selected episodes`; separately report `36 / 42 = 85.7%` release selection with the six excluded or quarantined raw identities and reason codes retained.",
          "Recalculate duration as `540 / 36 = 15.0 s` mean per selected episode while also storing distribution summaries and refusing to infer consistency from the mean alone.",
          "Finalize Parquet and video writers, load RC3 from an empty cache, resolve every episode range and required feature, scrub selected examples, and fail if any terminal record or media reference is missing.",
          "Verify schema order, units, frames, clocks, residual threshold, task and protocol versions, robot and calibration identities, and split inheritance for every derivative; compute checksums only after these bytes are final.",
          "Run split tests showing no shared episode, scene group, source ancestry, or raw content hash across train, validation, and held-out, and confirm normalization provenance points only to the train manifest.",
          "Generate card counts, coverage tables, quality rates, limitations, and example links directly from the frozen manifests; perform privacy, secret, license, and intended-use review before publication scope is decided.",
          "Promote RC3 to dataset v1 only when a clean verification run reproduces all metrics and hashes; archive the command, result, manifests, rubric, code revisions, and change policy beside the immutable release.",
        ],
        result:
          "Dataset v1 contains 36 loadable reviewed episodes with reconciled 24/6/6 grouped splits, calculated metrics, immutable fingerprints, review lineage, inspectable examples, and limitations tied to actual coverage.",
        takeaway:
          "The v1 label is earned when the bytes, manifests, examples, metrics, and written claims agree under a clean independent verification.",
      },
      handsOn: {
        setup:
          "Use the reviewed local simulation dataset and split manifest. Keep the release private if rights, privacy, credentials, or publication authority are unresolved.",
        steps: [
          "Without looking at yesterday’s notes, recreate the freeze checklist, compare it with the actual contract, then create separate raw, review, and release manifests with candidate, schema, task, protocol, robot, calibration, recorder, and code revisions.",
          "Finalize storage writers, then validate load, media decode, episode ranges, required fields, timestamp order, terminal evidence, and synchronization tolerance from an empty cache.",
          "Run scene-group, episode, source-lineage, and content-hash disjointness checks and verify every data-derived transform traces only to train.",
          "Reconcile raw, reviewed, excluded, selected, and per-split counts plus durations, factor coverage, outcomes, validity, behavior-pass, and quality rates with explicit denominators.",
          "Write the card and generate its tables from manifests; add representative successes, a hard case, an excluded case, limitations, rights and privacy status, intended use, and unsupported claims.",
          "Repair the highest-impact gate failure, compute final checksums, rerun the complete week workflow without modifying files, and preserve the verification result and reproduction command.",
          "Promote the candidate to v1 only after every gate passes; otherwise issue a new candidate, then write the next concrete collection or evaluation experiment and the successor-version rule.",
        ],
        observe:
          "Documentation drift, missing media, split leakage, stale metrics, and quiet mutations become visible when one clean verifier regenerates the card facts from immutable manifests and checksums.",
        doneWhen:
          "A fresh environment loads and inspects the selected episodes, all counts and hashes reproduce, split ancestry is disjoint, limitations match coverage, publication scope is authorized, and no v1 file must be edited to explain a failure.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Own a robot-dataset release gate that finalizes multimodal storage, verifies schema and lineage, freezes grouped splits and preprocessing provenance, generates denominator-backed cards and examples, and detects mutation through reproducible manifests and checksums.",
        interviewPrompt:
          "What makes a robot demonstration dataset genuinely frozen? Describe raw versus release lineage, finalization, manifests, grouped splits, checksums, card metrics, example selection, limitations, and the correction policy.",
      },
      commonMistakes: [
        {
          mistake: "Calling a folder v1 as soon as the target episode count appears.",
          correction:
            "Require finalized and loadable storage, exact manifests, reconciled metrics, split checks, provenance, card, rights review, representative examples, checksums, and a clean reproduction run.",
        },
        {
          mistake: "Editing a frozen episode label or split assignment in place after discovering an error.",
          correction:
            "Preserve v1, publish a reviewed successor with changed hashes and metrics, and record the correction’s effect on training and evaluation claims.",
        },
        {
          mistake: "Writing limitations as vague caution text unrelated to data.",
          correction:
            "Tie each limitation to missing or sparse conditions, operators, hardware, behaviors, or quality evidence and use it to bound intended claims and the next collection backlog.",
        },
      ],
      checkQuestions: [
        {
          question: "Does freezing dataset v1 mean the dataset is complete or high-performing?",
          answer:
            "No. It means the exact contents, semantics, splits, evidence, checks, and limitations are immutable and reproducible; adequacy remains bounded by measured coverage and later evaluation.",
        },
        {
          question: "Why must LeRobotDataset v3 writers be finalized before checksums and release?",
          answer:
            "Finalization flushes buffered metadata and closes Parquet or media writers; before that, files can be incomplete or unloadable and their fingerprints do not describe a valid final release.",
        },
        {
          question: "What should happen when a frozen label is proven wrong?",
          answer:
            "Keep v1 unchanged and issue a traceable corrected successor with review evidence, new checksums and metrics, a change log, and the effect on prior claims.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The generated manifest, card, checksum report, and representative episode inspector are the real evidence surfaces, making an additional generic release graphic unnecessary.",
      },
    },
  ],
} satisfies ChapterContent;
