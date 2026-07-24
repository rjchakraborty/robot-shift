import type { ChapterContent } from "../chapter-content-types";

const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";

export const week20Content = {
  week: 20,
  title: "Build a bounded language-to-ROS 2 task executor",
  purpose:
    "Turn a natural-language request into an inspectable plan whose only physical operations are typed, validated robot skills. This chapter defines goals, preconditions, effects, and recovery branches; separates fresh world state from episodic memory; grounds every object reference in a timestamped perceived entity; executes through feedback, cancellation, postcondition checks, and bounded replanning; and closes uncertain outcomes with idempotency, compensation, safe human handoff, or abort. The result is a reproducible long-horizon simulator or tabletop demo with one correlated trace, not an unreviewable model-to-motor shortcut.",
  prerequisites: [
    "Complete the ROS 2 action, lifecycle, behavior-tree, navigation or manipulation, cancellation, and recovery work from earlier chapters; bring one already working simulated skill such as navigate, detect, pick, place, or dock.",
    "Bring a versioned simulator or harmless tabletop baseline with a documented reset, observable object identities and poses, a robot safe or idle state, and one known-good task that can be repeated without powered unsupervised hardware.",
    "Be able to read a small JSON-like record, a state-transition table, and ROS 2 action feedback; distinguish a command being accepted, a controller returning success, and a physical postcondition being freshly observed.",
    "Keep language-model output outside the actuator and safety boundary. Every exercise uses paper objects or simulation unless an already commissioned robot is operated under its approved supervision, workspace, speed, stop, and recovery procedures.",
  ],
  outcomes: [
    "Translate a user request into a measurable terminal condition, constraints, typed subtasks, dependencies, and named recovery or handoff branches without emitting low-level motion from free-form text.",
    "Specify a robot skill with typed inputs, units, frames, scene version, preconditions, result codes, feedback, timeout, cancellation, and an observable postcondition, then reject invalid calls before dispatch.",
    "Maintain versioned current world state separately from append-only episodic history, retrieve only scoped evidence, and resolve stale or conflicting memories in favor of fresh trusted observation.",
    "Ground plan references to stable perceived-entity records, reject ambiguity, re-observe before dispatch, and verify the expected physical effect after every skill.",
    "Run an execute–monitor–re-observe loop that distinguishes progress loss, stale state, rejected goals, aborted actions, canceling goals, and failed postconditions before choosing a bounded retry or replan.",
    "Handle timeout and outcome uncertainty with operation-specific idempotency, request identity, reconciliation, compensation, safe abort, and a complete human handoff package rather than automatic repetition.",
    "Publish one long-horizon run whose goal, observations, plan revisions, skill calls, feedback, results, recoveries, interventions, timings, and final verified state can be reconstructed from a single trace.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_VALIDATION,
    ROLE_FLEET,
    ROLE_HMI,
  ],
  sources: [
    {
      label: "ROS 2 Design — Actions",
      url: "https://design.ros2.org/articles/actions.html",
      useFor:
        "Primary ROS 2 action design for typed goal, feedback, and result sections; client-generated goal UUIDs; accepted, executing, canceling, succeeded, aborted, and canceled states; and the distinction between accepting a cancel request and reaching the canceled terminal state.",
    },
    {
      label: "PlanSys2 — System Design",
      url: "https://plansys2.github.io/design/index.html",
      useFor:
        "Maintainer architecture separating domain types, predicates, functions, and actions from current problem instances and goals, plan generation, and runtime execution by ROS 2 action performers with requirement checks.",
    },
    {
      label: "BehaviorTree.CPP 4 — Reactive and Asynchronous Behaviors",
      url: "https://www.behaviortree.dev/docs/tutorial-basics/tutorial_04_sequence/",
      useFor:
        "Maintainer contract for non-blocking asynchronous action nodes, RUNNING versus terminal status, typed input ports, repeated monitoring, and prompt halt handling when a parent branch cancels work.",
    },
    {
      label: "Nav2 — Detailed Behavior Tree Walkthrough",
      url: "https://docs.nav2.org/behavior_trees/overview/detailed_behavior_tree_walkthrough.html",
      useFor:
        "Official worked behavior tree showing periodic replanning, contextual recovery around planning and path following, system-level recovery, and an explicit retry budget rather than unbounded repetition.",
    },
    {
      label: "Google DeepMind — Gemini Robotics",
      url: "https://deepmind.google/models/gemini-robotics/",
      useFor:
        "Primary product description of embodied reasoning, multi-step task decomposition, tool use, changing-environment response, and the separate roles of a high-level embodied-reasoning model and a vision-language-action model.",
    },
  ],
  days: [
    {
      dayId: 134,
      mentalModel:
        "A robot plan is a checked dependency graph from current facts to a measurable goal, with each edge delegated to one bounded skill.",
      explanation: [
        "Begin with the physical end condition, not with a list of attractive verbs. “Tidy the bench” is ambiguous; “blue foam block B-17 is inside bin zone-2, the gripper is empty, the robot is parked, and no object left the marked workspace within 90 seconds” can be checked. Record forbidden actions, required human approvals, time limit, and abort state beside the goal. The planner may suggest a route to that state, but it may not weaken those constraints.",
        "Decomposition replaces one broad request with skills that have named dependencies. A block cannot be placed until it has been located, grounded to one entity, reached, and grasped; parking depends on the gripper being empty. Independent perception or information-gathering steps may run in parallel, while physical steps that share a robot, object, or workspace usually need explicit ordering. Draw the dependency graph before translating it into a sequence, behavior tree, or planner representation.",
        "Keep deliberation and execution as different components. A domain model names available types, predicates, and actions; current problem state names entities, facts, and the goal; a planner proposes a sequence; an executor checks current requirements and activates implementations. This PlanSys2-style separation makes a missing fact or failed precondition visible. It also prevents a language planner from turning “move closer” into unbounded wheel or joint commands.",
        "A useful hierarchy becomes more concrete as it descends: mission, phase, skill, and controller goal. The mission may be “store block B-17”; phases may be perceive, acquire, deposit, and finish; skills may be detect, navigate, pick, place, and verify; controllers track bounded trajectories. Sequence and fallback branches should show what happens when a condition fails. Version every accepted plan so a later replan does not silently rewrite the history of what the executor actually attempted.",
      ],
      keyTerms: [
        {
          term: "Goal condition",
          meaning:
            "A set of observable facts that must be true for the task to count as complete, including required constraints and terminal robot state.",
          physicalExample:
            "The foam block is visually confirmed inside the outlined bin, the gripper is empty, and the simulated arm is back at its named park pose.",
        },
        {
          term: "Task decomposition",
          meaning:
            "Breaking a broad objective into smaller skills whose inputs, order, ownership, and completion conditions can be inspected.",
          physicalExample:
            "Store the block becomes observe the tray, resolve one block ID, approach, pick, observe grasp, place, observe the bin, and park.",
        },
        {
          term: "Dependency",
          meaning:
            "A fact or completed step that another step requires before it is eligible to run.",
          physicalExample:
            "The place skill depends on a verified held-object fact, so it cannot run merely because the earlier pick command was sent.",
        },
        {
          term: "Precondition",
          meaning:
            "A predicate that must be freshly true immediately before a skill is dispatched.",
          physicalExample:
            "Pick requires the chosen entity to be visible, inside the approved workspace, reachable, and not already reserved by another task.",
        },
        {
          term: "Effect",
          meaning:
            "The state change a skill is expected to cause and that later observation must confirm.",
          physicalExample:
            "A successful place is expected to change `held(B-17)` into `in_zone(B-17, zone-2)` and `gripper_empty`.",
        },
      ],
      physicalExamples: [
        {
          title: "Foam-block storage plan",
          scenario:
            "A stationary simulated arm must put one named blue foam block from a pickup rectangle into a marked bin and return to park while a second similar block remains untouched.",
          lookFor:
            "The plan first resolves the intended entity, orders pick before place, names the untouched-object constraint, and ends with freshly observed bin, gripper, and park conditions.",
        },
        {
          title: "Cart delivery with a shared doorway",
          scenario:
            "A simulated mobile robot must collect a light parcel at station A and deliver it to station B, but another robot can reserve the only narrow doorway.",
          lookFor:
            "Navigation, parcel acquisition, doorway reservation, delivery, and release are separate skills; the plan contains wait, alternate-route, timeout, and handoff branches instead of assuming the doorway is free.",
        },
      ],
      workedExample: {
        title: "Decompose one storage request into an executable skill graph",
        setup:
          "The request is “put the blue block in bin B.” The current snapshot contains blue blocks B-17 and B-22, bin zones A and B, an empty gripper, a parked simulated arm, and a rule that the arm must never leave workspace W1.",
        steps: [
          "Rewrite the request as terminal predicates: `in_zone(B-17, B)`, `gripper_empty`, and `arm_at(park)`, plus the invariant `inside_workspace(arm, W1)` and a 90-second deadline. Because two blue blocks exist, leave the target entity unresolved rather than guessing.",
          "Add an information step `clarify_target([B-17, B-22])`. Suppose the operator selects B-17; bind that stable ID to the goal and record the selected observation snapshot instead of retaining the phrase “the blue block.”",
          "List candidate skills and their contracts: observe scene, approach entity, pick entity, verify held object, place entity in zone, verify placement, and park arm. Do not include raw joint velocities or an unconstrained “fix failure” step.",
          "Draw dependencies: approach needs a fresh pose; pick needs approach complete and reachable B-17; place needs `held(B-17)`; park needs the gripper empty. The workspace invariant and active-stop condition guard every physical skill.",
          "Add explicit branches: stale pose returns to observe, unreachable pose returns to replan or handoff, failed grasp allows one re-observation and one alternate-grasp attempt, ambiguous identity returns to clarification, and any safety rejection aborts physical execution.",
          "Topologically order the graph into plan revision P1, validate every skill name and argument against the registry, and estimate timing from declared skill bounds. Reject P1 if its worst-case duration already exceeds 90 seconds.",
          "Accept the plan only when another person can point from each terminal predicate backward to the observation or skill expected to establish it, and from every failure result to a bounded next state.",
        ],
        result:
          "Plan P1 contains one resolved entity, seven inspectable skills, declared dependencies and invariants, and finite clarification, re-observation, retry, handoff, and abort branches; no free-form text crosses the executor boundary.",
        takeaway:
          "Good decomposition is not a longer to-do list: it makes state dependencies, physical authority, completion evidence, and every allowed failure branch explicit.",
      },
      handsOn: {
        setup:
          "Use index cards or a simulator with one arm or mobile base, two similar harmless objects, two target zones, and a written safe-state command. Keep actuators unpowered unless the platform and supervision are already approved.",
        steps: [
          "Write one natural-language request, then replace it with three to five terminal predicates, one time limit, two invariants, and one safe abort condition that can all be observed.",
          "Inventory only skills already implemented in the baseline. For each, write its owner, physical resource, input IDs, preconditions, expected effects, maximum duration, and failure results.",
          "Draw a dependency graph and mark which steps can safely overlap, which must be serialized, and which require a fresh observation immediately before dispatch.",
          "Insert one ambiguity, one stale-state case, one skill rejection, and one execution failure. Give each a finite clarify, re-observe, replan, handoff, or abort branch.",
          "Walk the nominal graph with cards, changing a visible world-state sheet only after the corresponding postcondition card is checked.",
          "Walk each injected failure without improvising a new action. Revise the plan model until every path reaches verified success, declared handoff, or safe abort in a bounded number of transitions.",
        ],
        observe:
          "Vague language accumulates at exactly the points where identity, ordering, ownership, and terminal evidence are missing; making those facts explicit removes many unsafe planner choices before execution.",
        doneWhen:
          "The graph starts from a versioned snapshot, ends in measurable predicates, contains no raw actuator instruction, exposes all dependencies, and closes every injected failure without an unbounded loop.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Convert warehouse or service-robot requests into versioned mission graphs that call existing ROS 2 navigation and manipulation capabilities, preserve constraints across replans, and expose why a task clarified, waited, recovered, handed off, or aborted.",
        interviewPrompt:
          "Decompose “bring me the red tote” for a mobile manipulator. Define terminal conditions, ambiguities, skill dependencies, planner-versus-executor ownership, and the branches you would require before allowing physical execution.",
      },
      commonMistakes: [
        {
          mistake: "Treating natural-language subtasks such as “handle the object” or “fix the blockage” as executable skills.",
          correction:
            "Replace each phrase with a registered bounded skill or an information-gathering, clarification, handoff, or abort state whose inputs and result are inspectable.",
        },
        {
          mistake: "Letting the high-level planner output joint positions, velocity commands, or ad hoc controller code.",
          correction:
            "Limit the planner to registered skill calls; keep trajectory generation, command bounds, collision checks, and actuator control inside trusted deterministic components.",
        },
        {
          mistake: "Keeping one happy-path sequence after a precondition or effect becomes false.",
          correction:
            "Model the failed predicate explicitly, return to the smallest safe re-observation or replan point, and cap every retry branch before execution begins.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the first artifact to derive from “tidy the bench”?",
          answer:
            "A measurable terminal condition with named entities, workspace and safety constraints, time and intervention limits, and an observable safe terminal robot state.",
        },
        {
          question: "Why separate planner, executor, and controller?",
          answer:
            "The planner proposes registered skills, the executor validates current state and owns lifecycle and recovery, and controllers enforce bounded physical motion; one component cannot silently bypass the others' contracts.",
        },
        {
          question: "What makes a decomposition hierarchical rather than merely a flat checklist?",
          answer:
            "Mission phases expand into typed skills and then bounded controller goals, with dependencies, invariants, and outcomes preserved across each level.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A learner-built dependency graph with real goal predicates and skill cards is more faithful than the generic policy visual for this planning-model lesson.",
      },
    },
    {
      dayId: 135,
      mentalModel:
        "A robot skill is a narrow typed socket: the planner may propose a plug, but the executor decides whether it fits current physical reality.",
      explanation: [
        "Give every skill one stable name and a closed input schema. `move_to_pose` needs more than three coordinates: it needs a pose type, unit convention, frame ID, target timestamp or scene version, speed profile, request identity, and declared optional fields. Object skills receive stable entity IDs rather than descriptions such as “that cup.” Reject unknown fields, missing units, unsupported frames, non-finite values, and values outside allowed ranges before any ROS request is created.",
        "A contract also defines eligibility. Preconditions are evaluated against a fresh authoritative snapshot, not copied from the planner's text. A navigation skill might require localized state, an active map, sufficient battery reserve, a reachable goal, a current transform, no stop state, and an unexpired authority lease. A manipulation skill may additionally require collision-scene freshness, a known tool, payload limits, and a reserved workspace. A valid JSON shape with a failed precondition is still an invalid physical call.",
        "ROS 2 actions provide the transport lifecycle for long-running skills: a typed goal is accepted or rejected, feedback reports progress, and a result ends in succeeded, aborted, or canceled status. Accepted is not completed, a cancel request is not proof of cancellation, and a succeeded result is not yet the physical postcondition. Retain the goal UUID, watch status and feedback, bound silence and total duration, and wait for or reconcile the terminal state before another conflicting skill begins.",
        "Return structured results that help the orchestrator choose only preapproved branches. Include skill version, request and goal IDs, terminal status, machine-readable error code, last verified state version, observed effect summary, and whether compensation or human review is required. Keep free-form diagnostics for people, not branch logic. The executor maps known result codes to re-observe, alternate skill, replan, handoff, or abort; an unknown code fails closed.",
      ],
      keyTerms: [
        {
          term: "Skill contract",
          meaning:
            "The versioned definition of a skill's typed inputs, eligibility rules, lifecycle, outputs, errors, side effects, and completion evidence.",
          physicalExample:
            "The `move_to_pose/v2` contract requires metres, a map frame, scene version, speed limit, request ID, and a postcondition tolerance.",
        },
        {
          term: "Goal",
          meaning:
            "The typed request sent to a ROS 2 action server describing the bounded outcome that one skill should attempt.",
          physicalExample:
            "A navigation goal contains a stamped pose in `map`; it does not contain the natural-language sentence that caused the planner to select it.",
        },
        {
          term: "Feedback",
          meaning:
            "Intermediate progress information emitted while an accepted action remains active, useful for monitoring but not a terminal outcome.",
          physicalExample:
            "Remaining distance decreases from 2.0 to 0.4 metres while the navigation goal is executing.",
        },
        {
          term: "Terminal status",
          meaning:
            "The final ROS action state indicating that execution succeeded, aborted, or completed cancellation.",
          physicalExample:
            "A goal moves from executing to canceling and only later to canceled after the action server finishes its stop and cleanup behavior.",
        },
        {
          term: "Structured error",
          meaning:
            "A finite machine-readable failure category with documented meaning and allowed recovery, separate from a human diagnostic message.",
          physicalExample:
            "`STALE_SCENE` sends the orchestrator to re-observe, while `LIMIT_REJECTED` forbids automatic retry and records the rejected value.",
        },
      ],
      physicalExamples: [
        {
          title: "Stamped navigation call",
          scenario:
            "A planner proposes `move_to_pose` for a simulated cart using target `(2.2, 1.1)`, frame `map`, speed `0.35 m/s`, scene version 84, and request ID R-901.",
          lookFor:
            "Schema validation succeeds, but dispatch still waits for localization, transform freshness, battery, authority, stop-state, reachability, and scene-version guards.",
        },
        {
          title: "Wrong-frame pick request",
          scenario:
            "A pick call contains a plausible object pose measured in the camera frame while the skill contract requires a current transform into `robot_base`; that transform is missing.",
          lookFor:
            "The executor returns `FRAME_UNAVAILABLE` before motion, logs the rejected frame and snapshot, and does not ask the language planner to invent a transform.",
        },
      ],
      workedExample: {
        title: "Define and evaluate the `move_to_pose/v2` skill",
        setup:
          "A simulated mobile base exposes a ROS 2 navigation action. The orchestrator must move to a staging marker without letting free-form planner output reach the action server.",
        steps: [
          "Define required inputs: `request_id` as a unique string, `target_pose` as finite x-y-yaw values, `frame_id` from an allowlist, `scene_version` as a nonnegative integer, `max_speed_mps` within `0.05..0.40`, and `deadline_ms` within `1000..60000`. Reject additional physical-control fields the contract does not own.",
          "Define preconditions from executor-owned state: localization is valid, the `map` transform is younger than 200 ms, scene version equals the current authoritative version, battery is above reserve, the goal is in the allowed zone, no protective or application stop is active, and this executor holds the navigation lease.",
          "Map the validated request to one ROS 2 action goal, store the returned goal UUID beside `request_id`, and record whether the server accepted or rejected it. Rejection ends this attempt; it is not an executing goal.",
          "While executing, collect timestamped feedback and enforce two clocks: feedback silence may not exceed two seconds, and total goal time may not exceed the declared deadline. Progress is informative, but arrival is not declared from remaining-distance feedback alone.",
          "On timeout, request cancellation for the exact goal UUID and enter `CANCELING`. Do not dispatch another navigation goal until status reaches canceled, aborted, or succeeded, or until a separately defined reconciliation path proves which goal can still command the robot.",
          "After a succeeded result, obtain fresh measured pose and require position error at most 0.10 m, yaw error at most 0.15 rad, near-zero commanded motion, and the same intended staging entity. If these fail, return `POSTCONDITION_FAILED` rather than success.",
          "Return one structured result containing request ID, goal UUID, contract version, terminal ROS status, postcondition verdict, final state version, duration, last feedback age, and error code; map every non-success code to a declared next state.",
        ],
        result:
          "A well-typed call becomes one correlated ROS goal, malformed or ineligible calls fail before dispatch, active work remains cancelable and observable, and only a fresh measured arrival closes the skill successfully.",
        takeaway:
          "Types prevent malformed requests, preconditions prevent physically ineligible requests, action status bounds execution, and postcondition observation decides whether the world actually changed as required.",
      },
      handsOn: {
        setup:
          "Use a simulated ROS 2 action or a paper action-server state machine. Do not connect an experimental skill contract directly to powered motion.",
        steps: [
          "Choose one existing long-running skill and write its versioned input schema, units, allowed frames, range limits, request identity, optional fields, and unknown-field policy.",
          "Write executor-owned preconditions, expected postconditions, maximum feedback silence, total timeout, cancel behavior, and the finite result-code table.",
          "Evaluate at least five calls: nominal, missing frame, NaN or non-finite value, stale scene version, and target outside the approved workspace. Record that only the nominal call reaches dispatch.",
          "Run the nominal action and capture goal acceptance, goal UUID, at least one feedback sample, terminal status, and a fresh postcondition observation under one request ID.",
          "Run a slow case, request cancellation by exact goal UUID, and verify the state passes through canceling before canceled or another documented terminal result.",
          "Force a controller success while the final observed pose or object state remains outside tolerance; verify the wrapper returns `POSTCONDITION_FAILED` and blocks the next dependent skill.",
        ],
        observe:
          "Schema checks catch malformed proposals, state guards catch valid-looking but ineligible calls, ROS status explains the transport lifecycle, and postcondition checks catch physical mismatch after apparent success.",
        doneWhen:
          "Every test produces one documented result code, no invalid call reaches the action server, canceling is distinguished from canceled, and no dependent skill runs before a fresh postcondition passes.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_VALIDATION,
        ],
        workExample:
          "Wrap navigation, manipulation, docking, inspection, or device actions in versioned contracts that validate model-proposed arguments, preserve ROS goal identity and cancellation, expose bounded errors, and verify the real or simulated postcondition before workflow continuation.",
        interviewPrompt:
          "Design a typed `pick_object` tool over a ROS 2 action. Explain its schema, frames and units, preconditions, feedback, timeout, cancel lifecycle, result codes, and the observation that must pass after the action reports success.",
      },
      commonMistakes: [
        {
          mistake: "Calling a tool safe because its JSON parsed and every required field was present.",
          correction:
            "Validate types, finite values, units, frames, ranges, scene version, authority, and current physical preconditions before constructing the ROS goal.",
        },
        {
          mistake: "Treating an accepted goal, a cancel acknowledgment, or a controller success result as the final task outcome.",
          correction:
            "Track the exact goal through terminal status and then verify the declared physical postcondition from fresh authoritative state.",
        },
        {
          mistake: "Branching on arbitrary diagnostic text returned by a skill.",
          correction:
            "Use a closed versioned error-code set with documented recovery mappings; retain diagnostic text only for operators and debugging.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a schema-valid `move_to_pose` call still be rejected?",
          answer:
            "Current localization, transform freshness, scene version, workspace, battery, stop state, reachability, or authority may violate the skill's preconditions.",
        },
        {
          question: "What is the difference between canceling and canceled?",
          answer:
            "Canceling means a cancel request was accepted and cleanup or stopping is in progress; canceled is the terminal state reached after that work completes.",
        },
        {
          question: "What must happen after a ROS action reports succeeded?",
          answer:
            "The wrapper must obtain fresh authoritative state and verify the skill's physical postcondition within its declared tolerances before dependent work proceeds.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A contract-boundary diagram materially clarifies the separate planner proposal, schema and state validation, ROS action lifecycle, and physical postcondition gates.",
      },
    },
    {
      dayId: 136,
      mentalModel:
        "World state is a timestamped whiteboard of what is trusted now; episodic memory is a journal of what happened before, never a substitute for looking.",
      explanation: [
        "Represent current world state as versioned facts about specific entities, not as one prose summary. An entity record can contain stable ID, type, pose, frame, attributes, observation time, source sensor or service, confidence, validity interval, and reservation or ownership. Robot records include mode, active goal, localization quality, tool state, battery, stop state, and authority. A writer creates a new snapshot or atomic update; planners read one declared version so their preconditions do not mix facts from different moments.",
        "Episodic memory records completed events and their context: task ID, plan revision, relevant observations, skill call, outcome, recovery, intervention, and lesson or label. Append history rather than rewriting a failed attempt into a success story. Store source and schema version with each event. Memory can answer “which recovery worked for this docking error under similar conditions,” but it must not assert that yesterday's charger, cup, person, or obstacle remains where it was.",
        "Retrieval selects candidate evidence; it does not certify truth. Filter by robot or embodiment, site, skill and contract version, object class, failure code, operating conditions, recency, and permissions before ranking semantic similarity. Return event IDs and decisive fields so the orchestrator can inspect why an item matched. Measure relevance within the retrieved set, but also measure staleness, wrong-scope retrieval, and whether using the memory improved a frozen trial without unsafe attempts.",
        "Define conflict and expiry rules before planning. Fresh trusted perception within the same scope normally overrides an older remembered location. A memory may seed where to look or which bounded recovery to consider, then the executor rechecks every current precondition. If two fresh sources disagree, mark the fact unknown, preserve both observations, and trigger another sensor, clarification, or handoff instead of choosing the more convenient story.",
      ],
      keyTerms: [
        {
          term: "World-state snapshot",
          meaning:
            "An immutable versioned view of current robot, entity, environment, and authority facts used together for one planning or validation decision.",
          physicalExample:
            "Snapshot 84 says block B-17 is on tray T1 at a stamped base-frame pose, the gripper is empty, and the arm is parked.",
        },
        {
          term: "Scene version",
          meaning:
            "A monotonically changing identity that lets a caller detect that relevant perceived state changed after its plan or request was formed.",
          physicalExample:
            "A person moves the block, producing scene 85; a pick call built from scene 84 is rejected and must re-observe.",
        },
        {
          term: "Episodic memory",
          meaning:
            "An append-only record of a particular past task, observation, action, outcome, recovery, or intervention with provenance.",
          physicalExample:
            "Episode E-442 records that docking failed on a wet marker, a second camera view resolved the marker, and the retry succeeded once.",
        },
        {
          term: "Provenance",
          meaning:
            "Metadata identifying where a fact came from, when it was produced, under which schema and configuration, and how it may be trusted.",
          physicalExample:
            "A cup pose includes camera C2, calibration version 7, timestamp, detector version, and confidence rather than only x-y-z values.",
        },
        {
          term: "Retrieval scope",
          meaning:
            "The explicit boundary of robot, site, skill version, time, permissions, and conditions inside which a past event may be considered relevant.",
          physicalExample:
            "A recovery from gripper G1 firmware 3 is excluded when the current robot uses a different gripper and failure code.",
        },
      ],
      physicalExamples: [
        {
          title: "Yesterday's shelf location",
          scenario:
            "A memory says mug M-4 was on shelf S2 yesterday, while the current camera snapshot sees S2 clearly and does not contain M-4.",
          lookFor:
            "The old episode suggests S2 as a search location but cannot create a current `at(M-4, S2)` fact; the plan observes another area or asks a person.",
        },
        {
          title: "Dock recovery across robot versions",
          scenario:
            "The agent retrieves three prior `MARKER_LOST` episodes, but two belong to a different camera mount and one matches the current robot, lighting range, skill version, and failure code.",
          lookFor:
            "Scope filters remove incompatible events before similarity ranking, and the matching recovery remains a candidate that current guards must validate.",
        },
      ],
      workedExample: {
        title: "Resolve a stale memory before planning a mug delivery",
        setup:
          "The user asks for mug M-4. Current snapshot S120 contains a clearly observed empty shelf S2, mug M-7 on a cart, and no current record for M-4. Episodic search returns E88 saying M-4 was placed on S2 yesterday and E91 saying similar mugs are sometimes moved to wash station W1.",
        steps: [
          "Write the current query as `locate entity_id M-4 at site lab-A`, and preserve snapshot S120 rather than converting the request into `pick from S2`.",
          "Filter memories by site, entity or class, observation source, schema, permission, and time. E88 is entity-specific but old; E91 is class-level background and cannot establish M-4's location.",
          "Compare sources: the current trusted view explicitly observes S2 empty, so it invalidates the remembered current-location claim from E88 while retaining E88 as a historical event.",
          "Update world state to `location(M-4)=unknown`, attach the S2 negative observation and conflicting episode IDs, and increment the scene version. Do not copy W1 into the current location field.",
          "Use scoped history only to order information-gathering steps: observe W1, query the inventory service, then ask the operator if still unresolved. Each step has a deadline and no motion begins from an unverified location.",
          "Suppose W1 perception finds a mug but its label is occluded. Store the candidate and confidence, then request another view or operator confirmation instead of grounding M-4 by appearance alone.",
          "Append the locate attempt, conflict resolution, observations, and final outcome as a new episode so later retrieval can distinguish a confirmed location, an unsuccessful search, and a human-provided identity.",
        ],
        result:
          "The world model remains honestly unknown until fresh evidence identifies M-4, old memories guide a bounded search without overriding perception, and the conflict becomes traceable training and evaluation data.",
        takeaway:
          "Memory is useful when it narrows where to inspect or which recovery to test; it becomes dangerous when a retrieved sentence is promoted directly into current physical state.",
      },
      handsOn: {
        setup:
          "Use paper entity cards or a simulator snapshot plus a small JSON-like event ledger. Include two objects that can change location and at least one stale past event.",
        steps: [
          "Define a world-state record with snapshot ID, entity ID, type, pose or unknown location, frame, source, observation time, confidence, validity, and reservation fields.",
          "Create three successive snapshots by moving one paper object and changing one robot fact; verify each planner read names exactly one snapshot version.",
          "Create five episodic records with task, plan, observation, skill version, outcome, error, recovery, intervention, and source fields. Preserve one failure rather than editing it into the later success.",
          "Write a retrieval query for one failure or object-location question, then filter by site, robot or embodiment, skill version, failure code, recency, and permission before ranking relevance.",
          "Inject a conflict between a recent observation and an older memory. Apply the written expiry and conflict rule, mark uncertainty explicitly, and choose re-observation, clarification, or handoff.",
          "Score the top three results for relevance and wrong scope, then document which fields influenced the next bounded information-gathering step and which fields were forbidden from becoming current facts.",
        ],
        observe:
          "A high semantic match can still be obsolete, cross-robot, or based on an earlier schema; provenance and scope filters often remove the most linguistically similar but operationally wrong memory.",
        doneWhen:
          "No stale episode overwrites current state, every fact used for a precondition has source and time, conflicting evidence produces an unknown or re-observe state, and the new attempt is appended with its real outcome.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
        ],
        workExample:
          "Build a scene and episode service that versions current robot facts, preserves task history, retrieves recovery evidence across a fleet without crossing robot or site scope, and makes stale or contradictory state visible before an agent dispatches work.",
        interviewPrompt:
          "Design world state and episodic memory for a service robot. Explain entity identity, snapshot consistency, provenance, retrieval scope, conflict resolution, and why a remembered location cannot satisfy a current pick precondition.",
      },
      commonMistakes: [
        {
          mistake: "Using one vector database entry as both historical memory and authoritative current state.",
          correction:
            "Maintain a versioned current-state store with freshness and provenance; let retrieval return historical candidates that must be reconciled with that store.",
        },
        {
          mistake: "Ranking by semantic similarity before filtering robot, site, skill version, time, and permission.",
          correction:
            "Apply hard operational scope first, then rank the remaining records and expose the fields that justified each match.",
        },
        {
          mistake: "Overwriting a failed episode after a later retry succeeds.",
          correction:
            "Append the failure, recovery decision, and retry as distinct correlated events so evaluation and incident review retain the true sequence.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the operational difference between world state and episodic memory?",
          answer:
            "World state is the versioned authoritative view used for current decisions; episodic memory is past evidence that may guide search or recovery but cannot satisfy a current physical precondition by itself.",
        },
        {
          question: "What should happen when a fresh camera view contradicts yesterday's remembered object location?",
          answer:
            "Keep the historical event, update current location to the fresh verified value or unknown, log the conflict, and re-observe or clarify before physical action.",
        },
        {
          question: "Why is precision among retrieved memories insufficient?",
          answer:
            "A relevant result may still be stale, wrong-scope, incompatible with the current robot or skill, or false; provenance, freshness, scope, and downstream trial effects must also be checked.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "Side-by-side learner-authored snapshot and append-only event tables expose provenance and conflicts more accurately than the generic policy visual.",
      },
    },
    {
      dayId: 137,
      mentalModel:
        "Grounding turns every planner noun into one timestamped entity record, then re-observation proves that record still describes the object about to be touched.",
      explanation: [
        "A phrase is not an actuator-safe reference. Ground “the red block” into a record containing stable entity ID, object class, relevant attributes, pose, coordinate frame, observation time, source, confidence, and scene version. Preserve the original phrase and candidate set for audit. If two candidates satisfy the language or the detector cannot support identity, the correct state is ambiguous, not whichever bounding box has the highest convenient score.",
        "Separate detection, tracking, identity, and pose. A detector may find a red rectangle; a tracker may associate it across frames; an identity check may read a tag or use operator confirmation; pose estimation describes where the entity is in a named frame. Image overlap or confidence alone does not prove identity. Skills declare which evidence they need: coarse navigation may tolerate a zone, while picking may require current six-degree pose, reachable geometry, and an object-specific confidence threshold.",
        "Plans age while people and robots move. Immediately before dispatch, reacquire the relevant entity or confirm a sufficiently fresh tracked observation, transform it into the skill's required frame, and compare scene version, pose delta, reservation, reachability, and workspace guards. If the entity moved beyond tolerance, invalidate only the affected plan suffix and return to grounding or planning. Never patch the goal pose silently while retaining evidence from the older target.",
        "Observe again after execution to verify the intended effect and identity. A grasp command can succeed while the gripper is empty or holding the neighboring block; a place command can finish while the object is outside the target zone. Check `held(entity_id)` or `in_zone(entity_id, zone_id)` using fresh sensors, along with absence of unintended changes. This closes the loop between language, perception, skill, and physical outcome.",
      ],
      keyTerms: [
        {
          term: "Grounding",
          meaning:
            "Binding a language reference or symbolic plan argument to a specific perceived entity and its evidence.",
          physicalExample:
            "“The red block beside the tape” becomes entity B-17 from snapshot 205, not a string forwarded to the gripper skill.",
        },
        {
          term: "Entity ID",
          meaning:
            "A stable identifier used to correlate observations, reservations, skill calls, and outcomes for one intended physical object.",
          physicalExample:
            "B-17 remains the task target while its camera bounding box and base-frame pose change between observations.",
        },
        {
          term: "Reference resolution",
          meaning:
            "The process of generating candidates for a phrase, applying attributes and relations, and deciding resolved, ambiguous, missing, or invalid.",
          physicalExample:
            "Two red blocks remain candidates until “nearest the yellow tape” or an operator selection identifies one.",
        },
        {
          term: "Freshness window",
          meaning:
            "The maximum observation age allowed for a particular skill decision before another observation is required.",
          physicalExample:
            "A pick pose older than 300 ms is rejected even though a two-second-old pose may still be useful for choosing which camera to inspect.",
        },
        {
          term: "Pose delta",
          meaning:
            "The translation and rotation difference between the state used to plan and the most recent state used to validate execution.",
          physicalExample:
            "The block moved 4 cm after planning, exceeding the pick contract's 1 cm tolerance and invalidating the grasp.",
        },
      ],
      physicalExamples: [
        {
          title: "Two red blocks near one bin",
          scenario:
            "Blocks B-17 and B-22 are both red and inside the camera view; only B-17 is beside the yellow tape, but the user's request says only “pick the red block.”",
          lookFor:
            "The resolver returns two candidates and requests clarification; it does not use detector confidence as a substitute for the user's missing distinction.",
        },
        {
          title: "Object moved after planning",
          scenario:
            "A grasp was planned from snapshot 31, then a person moves the foam block several centimetres before the executor reaches the pick step.",
          lookFor:
            "Pre-dispatch observation produces a new scene version and out-of-tolerance pose delta, so the old goal is rejected and the affected plan suffix is rebuilt.",
        },
      ],
      workedExample: {
        title: "Resolve, recheck, and pick the intended red block",
        setup:
          "A paper or simulated scene contains B-17 and B-22, both red cubes. B-17 is left of marker M1; B-22 is right of it. The user asks, “Put the red block next to the marker into bin C,” and the pick skill requires identity confidence, base-frame pose younger than 300 ms, and pose delta below 1 cm.",
        steps: [
          "Parse the request into attributes `color=red` and relation `next_to(marker M1)` while retaining the original phrase. Query snapshot S31 and return both candidates with their evidence rather than immediately selecting one.",
          "Apply the relation definition and find that both are within the broad 20 cm “next to” threshold. Mark the reference ambiguous and ask, “the block left or right of M1?” without moving the robot.",
          "After the user chooses left, bind the goal to entity B-17 and store the candidate set, clarification, observation ID, pose, frame, confidence, and scene version in plan P4.",
          "Before pick dispatch, acquire snapshot S32, reacquire B-17 by tag or validated track, transform its pose into `robot_base`, and compare age, confidence, reservation, reachability, workspace, and pose delta with the contract.",
          "Inject a 4 cm movement between S31 and S32. Reject the P4 pick call as `TARGET_MOVED`, invalidate its approach and pick suffix, and preserve the unchanged bin and terminal-goal parts.",
          "Generate P5 from S32, approach and pick B-17, then re-observe the gripper and scene. Require evidence that B-17 is held and B-22 remains at its prior location within tolerance.",
          "Only after the held-identity postcondition passes may the plan call place in bin C; another fresh observation must then prove `in_zone(B-17, C)` and an empty gripper.",
        ],
        result:
          "The language reference resolves through explicit clarification, the moved target invalidates a stale plan before motion, and both grasp and placement close on the intended entity rather than controller status alone.",
        takeaway:
          "Grounding is an evidence chain from phrase to candidate set to stable ID to fresh pose to verified effect; breaking any link returns to perception or clarification.",
      },
      handsOn: {
        setup:
          "Place two similar cards or foam blocks around one landmark, or reproduce the scene in simulation. Use only stationary tabletop manipulation unless a supervised commissioned platform is available.",
        steps: [
          "Give every object and landmark a stable ID, then record attributes, pose, frame, timestamp, source, confidence, and scene version for one snapshot.",
          "Write three referring expressions: one unique, one ambiguous, and one referring to a missing entity. Make the resolver return candidate evidence plus resolved, ambiguous, or missing state.",
          "Define skill-specific freshness, confidence, pose-delta, workspace, and identity requirements; keep the planning threshold distinct from the stricter pick threshold.",
          "Resolve the unique request, create a plan, then move the target before dispatch. Re-observe and prove the old call is rejected by scene version or pose delta.",
          "Run the refreshed plan and deliberately simulate a false grasp in which the action returns success but the target remains on the table; block the place step on the failed held-object postcondition.",
          "Repeat with a verified grasp and place, checking the intended entity, target zone, empty gripper, and absence of unintended movement before declaring success.",
        ],
        observe:
          "Language ambiguity, detector uncertainty, track identity, coordinate transforms, and state age fail in different ways; one confidence number cannot safely collapse them into a single “probably this object” decision.",
        doneWhen:
          "Ambiguous and missing references never dispatch, moved targets invalidate stale goals, false controller success cannot satisfy the grasp, and the final trace identifies the exact entity placed.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_INTEGRATION,
          ROLE_VALIDATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Connect a language planner to perception and ROS 2 skills through stable scene entities, frame-aware poses, freshness rules, ambiguity handling, and before-and-after observations that prevent the wrong package, tote, or tool from being manipulated.",
        interviewPrompt:
          "A user says “pick the red part,” two red detections exist, and one moves after planning. Walk through reference resolution, entity identity, frames, freshness, plan invalidation, and post-grasp verification.",
      },
      commonMistakes: [
        {
          mistake: "Passing the phrase “red block” or a raw bounding box directly to a manipulation skill.",
          correction:
            "Resolve the phrase to a stable entity with identity evidence and a current frame-aware pose that satisfies the skill contract.",
        },
        {
          mistake: "Choosing the highest detector score when two objects satisfy the user's description.",
          correction:
            "Return the candidate set and clarify the missing relation or identity; detector confidence measures a model output, not user intent.",
        },
        {
          mistake: "Reusing a planned pose after re-observation shows the entity moved.",
          correction:
            "Reject the stale call, record the scene and pose delta, and rebuild the affected plan suffix from the new snapshot.",
        },
      ],
      checkQuestions: [
        {
          question: "What minimum evidence makes a planner's object reference actionable?",
          answer:
            "A resolved stable entity ID with relevant attributes, current pose and frame, source and timestamp, sufficient confidence, scene version, and skill-specific preconditions.",
        },
        {
          question: "Why does high image overlap not prove object identity?",
          answer:
            "Overlap shows spatial agreement between regions, while identity requires evidence that the region corresponds to the same intended physical entity across time and candidates.",
        },
        {
          question: "What should the executor do when pre-dispatch pose delta exceeds the skill tolerance?",
          answer:
            "Reject the stale call, preserve the new observation, invalidate the affected plan suffix, and re-ground or replan before any motion.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The generic navigation map cannot express candidate identity, frame, timestamp, and pose-delta evidence; annotated scene records are the honest exercise.",
      },
    },
    {
      dayId: 138,
      mentalModel:
        "Long-horizon execution is a repeated contract: dispatch one eligible skill, monitor it, observe its effect, then plan from the world that actually exists.",
      explanation: [
        "Track each skill attempt through explicit states such as ready, dispatched, accepted, running, canceling, verifying, succeeded, failed, outcome-unknown, and handed-off. Store entry time, request and goal IDs, plan revision, input scene version, and owner at every transition. A ROS action can end succeeded, aborted, or canceled, but the orchestrator adds a verifying state because transport completion and physical completion are different claims.",
        "Monitor evidence that can change the decision: goal status, progress values, progress age, robot mode, stop state, localization or scene freshness, resource lease, and invariant violations. Define expected progress for the skill rather than accepting any changing number. For navigation it might be bounded decrease in distance over a window; for a pick it might be phase changes followed by held-object evidence. Feedback silence and lack of physical progress are separate faults.",
        "After every action, re-observe the predicates on which the remaining plan depends. Compare expected effects with current facts and classify the mismatch before choosing recovery. A transient stale camera may justify reacquisition; a moved target invalidates a plan suffix; a blocked aisle may require a different path; a lost localization state can invalidate every pose-dependent step; an unknown active goal may require reconciliation before any retry.",
        "Recovery has a budget and a reason. Contextual recovery addresses a specific failed skill, such as refreshing a costmap before recomputing a path. System recovery addresses broader state, such as relocalization. Replanning uses a new snapshot and increments the plan revision; repeating the identical call without changing its failed precondition is not replanning. Exhausted budget, violated invariant, increasing risk, or unreliable state ends in safe abort or human handoff.",
      ],
      keyTerms: [
        {
          term: "Execution monitor",
          meaning:
            "The component that correlates an active skill with status, feedback, timers, current invariants, and expected progress.",
          physicalExample:
            "It detects that a navigation goal remains executing while distance and pose have not changed for five seconds.",
        },
        {
          term: "Progress predicate",
          meaning:
            "A skill-specific, time-bounded statement describing observable movement toward completion rather than mere process activity.",
          physicalExample:
            "Remaining path distance must fall by at least 0.1 m within four seconds while localization stays fresh.",
        },
        {
          term: "Postcondition",
          meaning:
            "The fresh world-state fact required after execution before a skill may be treated as physically successful.",
          physicalExample:
            "After place, the intended block is inside the target polygon and the gripper is observed empty.",
        },
        {
          term: "Replanning",
          meaning:
            "Generating a new plan revision from updated state after assumptions, preconditions, or effects invalidate the previous plan.",
          physicalExample:
            "A trolley blocks aisle A, so snapshot 52 creates plan P3 through aisle B instead of resending P2's path.",
        },
        {
          term: "Recovery budget",
          meaning:
            "A finite per-skill and per-task limit on retries, recovery actions, elapsed time, or risk before handoff or abort.",
          physicalExample:
            "One sensor reacquisition and one replan are allowed; a second failure parks the robot and requests an operator.",
        },
      ],
      physicalExamples: [
        {
          title: "Blocked simulated aisle",
          scenario:
            "A cart begins a navigation skill, then a trolley appears on its path. The action still publishes feedback, but distance stops decreasing within the declared window.",
          lookFor:
            "The monitor detects lost progress, cancels the exact goal, waits for a terminal state, observes the obstacle, creates a new snapshot and plan revision, and spends one recovery unit.",
        },
        {
          title: "Successful command, empty gripper",
          scenario:
            "A pick action reports succeeded after closing the gripper, yet the fresh scene shows the object still on the tray and the gripper opening consistent with no object.",
          lookFor:
            "The orchestrator enters verifying, returns `POSTCONDITION_FAILED`, updates the world state, and chooses at most the declared alternate-grasp recovery instead of running place.",
        },
      ],
      workedExample: {
        title: "Recover a delivery plan after a new obstacle",
        setup:
          "Plan P7 for a simulated cart is `navigate(A) → acquire parcel Q3 → navigate(B) → release Q3 → verify delivery → park`. Navigation permits one contextual clear-and-replan recovery and one whole-task replan within a 120-second task deadline.",
        steps: [
          "Dispatch `navigate(A)` from snapshot S40 with request R18 and goal UUID G18. Record accepted and running transitions, localization age, initial distance, deadline, and progress-window rule.",
          "Insert a trolley. Status remains running and feedback arrives, but distance changes by less than 0.1 m for four seconds. The monitor raises `NO_PROGRESS`; it does not wait for the full task deadline or call this success because feedback is present.",
          "Request cancellation for G18, enter canceling, and wait for terminal canceled status while verifying zero commanded motion. If the goal remains outcome-unknown, do not send a conflicting goal.",
          "Run the allowed contextual recovery: refresh obstacle state and compute a new path. Snapshot S41 now contains the trolley and marks the original path invalid; the recovery budget changes from two available units to one.",
          "Create plan P8 from S41. Keep the unchanged parcel and terminal predicates, replace only the invalid navigation suffix, record the relation `supersedes P7`, and verify worst-case remaining time still fits the task deadline.",
          "Execute the alternate route while monitoring goal status, feedback age, progress, localization, authority, and stop state. After navigation succeeds, verify measured pose at station A before allowing parcel acquisition.",
          "Complete the remaining skills with a postcondition observation after each. Report recovered success only if Q3 is freshly observed in B, the cart is parked, no invariant failed, and the trace shows one cancellation, one replan, and no hidden intervention.",
        ],
        result:
          "The task survives a real state change by canceling one correlated action, updating the scene, revising only the affected plan, spending a visible recovery budget, and verifying each downstream effect.",
        takeaway:
          "Recovery is evidence-driven state change plus a bounded new decision; an identical retry from the same failed assumptions is only repetition.",
      },
      handsOn: {
        setup:
          "Use a simulator or a paper state machine with one multi-step delivery or storage task. Prepare injectors for lost progress, stale observation, failed postcondition, and cancellation.",
        steps: [
          "Define the per-attempt states, allowed transitions, required fields, progress predicate, feedback-silence limit, total timeout, postcondition, and recovery budget for two skills.",
          "Run the nominal task and produce a trace showing each dispatch, goal acceptance, feedback, terminal result, verifying observation, and next-step eligibility.",
          "Inject feedback silence while physical progress continues; classify communication freshness separately from physical progress and follow the declared degraded or cancel rule.",
          "Inject fresh feedback with no progress; cancel the exact action, wait for its terminal state, and prove another conflicting goal does not begin early.",
          "Inject a successful action result with a failed physical postcondition; update world state and ensure the dependent skill remains blocked.",
          "Change the scene, increment its version, create a new plan revision, and record which prior steps remain valid, which suffix changed, and which recovery budget was consumed.",
          "Exhaust the budget in a final run and verify the system enters the written safe abort or handoff state without another automatic attempt.",
        ],
        observe:
          "Status, feedback, progress, state freshness, and postconditions answer different questions; failures become diagnosable only when the trace retains all of them and the exact transition they caused.",
        doneWhen:
          "Nominal, no-progress, stale-feedback, failed-postcondition, and exhausted-budget cases reach their declared terminal states with no overlapping conflicting action and no hidden retry.",
      },
      jobConnection: {
        roles: [
          ROLE_SOFTWARE,
          ROLE_INTEGRATION,
          ROLE_PHYSICAL_AI,
          ROLE_VALIDATION,
        ],
        workExample:
          "Implement a long-running mission executor or behavior tree that monitors ROS 2 action progress and state freshness, verifies effects, performs contextual versus system recovery within budgets, and exposes every replan and terminal decision to operations.",
        interviewPrompt:
          "A navigation action is still executing and publishing feedback, but the robot is not getting closer. Explain detection, cancellation, re-observation, contextual recovery, plan revision, retry budget, and the evidence required for recovered success.",
      },
      commonMistakes: [
        {
          mistake: "Calling a skill healthy because feedback messages continue to arrive.",
          correction:
            "Monitor feedback freshness and a separate physical progress predicate, plus current invariants and postconditions.",
        },
        {
          mistake: "Retrying the same arguments after a failed precondition or unchanged obstacle.",
          correction:
            "Re-observe, identify the invalid assumption, change relevant state or plan, and consume a finite recovery budget before another attempt.",
        },
        {
          mistake: "Dispatching a replacement action immediately after sending a cancel request.",
          correction:
            "Wait for canceled or another terminal status, or complete an explicit reconciliation path that proves the old goal no longer has authority.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does the orchestrator need a verifying state after ROS action success?",
          answer:
            "The action result describes server execution, while verifying checks the fresh physical postcondition and intended entity before dependent skills continue.",
        },
        {
          question: "What distinguishes replanning from retrying?",
          answer:
            "Replanning uses updated authoritative state, records a new plan revision, and changes the invalid route or skill choice; retrying repeats an attempt, often with the same plan.",
        },
        {
          question: "When should recovery stop?",
          answer:
            "When its retry, time, or risk budget is exhausted, required state remains unreliable, no safe feasible plan exists, an invariant fails, or policy requires human authority.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A state-and-recovery diagram materially distinguishes running, canceling, verifying, replanning, outcome-unknown, handoff, and terminal states that prose can blur.",
      },
    },
    {
      dayId: 139,
      mentalModel:
        "When an action's outcome is uncertain, freeze new effects, reconcile what happened, then choose exactly one safe retry, compensation, handoff, or abort path.",
      explanation: [
        "A timeout means the orchestrator's waiting bound expired; it does not prove the robot did nothing or that the skill failed. Preserve request and goal IDs, stop issuing dependent or conflicting work, request cancellation when defined, and query action status plus fresh world state. Classify the outcome as confirmed success, confirmed no effect, confirmed partial or wrong effect, still active, or unknown. Recovery begins from that classification, not from the assumption most convenient for automation.",
        "Idempotency is operation-specific. “Set indicator off” can produce the same final state when repeated, while “move forward 10 cm,” “toggle gripper,” and “dispense one item” can duplicate an effect. A request ID and execution ledger prevent a server from starting the same logical request twice, but they do not make an inherently relative physical operation safe. Re-observe current state and express desired-state commands where possible.",
        "Rollback in the physical world is usually compensation, not time reversal. Releasing a software reservation, returning an unused tool, or parking after a failed mission may be safe compensating steps; placing a dropped fragile object back or reversing through an occupied aisle may not be. Each compensation has its own preconditions, hazards, timeout, result, and postcondition. Never build a generic “undo” tool that the planner may invoke without operation-specific review.",
        "Human handoff is a designed terminal workflow, not an error message. First place the robot in the declared safe or paused state and resolve active command authority. Then present goal, plan and skill versions, current verified state and its age, last successful effect, active or uncertain goal IDs, failure and attempts, hazards, remaining budget, camera or log evidence, and permitted operator actions. Require an explicit owner and resume decision; stale automation must not restart merely because a network connection returns.",
      ],
      keyTerms: [
        {
          term: "Outcome-unknown",
          meaning:
            "A state in which the orchestrator cannot yet determine whether a requested physical effect occurred, did not occur, or remains active.",
          physicalExample:
            "The place action connection times out after release, and neither action status nor the first camera view can locate the foam block.",
        },
        {
          term: "Idempotency key",
          meaning:
            "A caller-chosen identity for one logical request that lets the receiver return or reconcile the same execution instead of starting a duplicate.",
          physicalExample:
            "Two network retries with request R-72 map to one `set_dock_latch(open)` attempt and one stored outcome.",
        },
        {
          term: "Reconciliation",
          meaning:
            "Checking execution records, active-goal status, and fresh physical state to determine what occurred before another effect is allowed.",
          physicalExample:
            "After a timeout, the executor checks goal G9, gripper state, and the target bin before deciding whether place already completed.",
        },
        {
          term: "Compensation",
          meaning:
            "A separately validated action intended to reduce or repair a prior effect when literal rollback is impossible or unsafe.",
          physicalExample:
            "A failed delivery releases the reserved station and returns the cart to a named holding point if the route and payload state are verified.",
        },
        {
          term: "Handoff package",
          meaning:
            "The concise state, evidence, authority, hazard, attempt, and resume context transferred to a named human operator.",
          physicalExample:
            "The console shows that goal G9 is canceled, block B-17 is not visible, the arm is parked, one attempt remains forbidden, and inspection is required.",
        },
      ],
      physicalExamples: [
        {
          title: "Timed-out foam-block placement",
          scenario:
            "A simulated place call loses its response just after the gripper opens. Repeating the same trajectory could strike the bin or move a block that is already there.",
          lookFor:
            "The executor blocks a retry, reconciles the goal and fresh bin/gripper state, accepts an already-satisfied postcondition, or parks and hands off if object state remains unknown.",
        },
        {
          title: "Jammed drawer handoff",
          scenario:
            "A low-force simulator drawer skill aborts twice with `RESISTANCE_LIMIT`, and its policy forbids more force or a third automatic attempt.",
          lookFor:
            "The robot releases force and parks, cancels or terminates the exact goal, presents current drawer and tool state, and requires a named operator to inspect and authorize any resume.",
        },
      ],
      workedExample: {
        title: "Reconcile a placement timeout without duplicating motion",
        setup:
          "The task is to place foam block B-17 in bin C. Request R72 maps to ROS goal G9. The network times out after feedback says `release_started`; the gripper camera is temporarily unavailable, and one bin camera remains online.",
        steps: [
          "Enter `OUTCOME_UNKNOWN`, freeze the dependent park-and-finish transition, and prohibit a second place request. Preserve R72, G9, plan P12, input snapshot S61, last feedback, and the exact timeout clock.",
          "Ask the action server for G9 status and request cancellation if it is still active. Treat an accepted cancel request as canceling, then wait for canceled, aborted, succeeded, or the handoff reconciliation deadline.",
          "Acquire fresh evidence: gripper opening, arm pose, bin-C view, source-tray view, and scene version. Suppose G9 reports succeeded and B-17 is clearly observed inside C while the gripper is empty.",
          "Evaluate the original postcondition against the new snapshot. Because `in_zone(B-17, C)` and `gripper_empty` are confirmed with sufficient identity and freshness, close R72 as reconciled success without repeating physical motion.",
          "Consider the alternate branch: if B-17 remains clearly on the source tray and G9 is terminal with no effect, a retry may be eligible only if the place contract, remaining budget, and refreshed preconditions explicitly allow it under the same logical request.",
          "If B-17 is missing or an active goal cannot be resolved by the deadline, command only the preapproved nonconflicting safe state, such as stop and park if verified feasible; release software reservations only through their compensation contracts.",
          "Create a handoff package naming the unresolved object, current safe state, goal status, observations and ages, attempts, forbidden automatic retry, hazards, evidence links, and the operator decisions `inspect`, `abort task`, or `authorize new plan`.",
        ],
        result:
          "The nominal timeout branch recognizes a completed placement without duplicating it, while no-effect and unknown branches have different bounded rules and transfer unresolved physical uncertainty to a prepared human workflow.",
        takeaway:
          "Reliable recovery asks “what effect exists now?” before “should I call the function again?” and treats uncertainty as a first-class state.",
      },
      handsOn: {
        setup:
          "Use cards, switches, or a simulator. Include desired-state operations, relative operations, one reversible software reservation, and one physical operation whose outcome can be hidden.",
        steps: [
          "Classify six operations as naturally idempotent, idempotent only with a request ledger, non-idempotent, or unsafe to retry while outcome is unknown; write the physical reason for each.",
          "Add request IDs and a ledger with received, dispatched, active goal, terminal result, postcondition, and compensation state. Replay a duplicate network request and verify it cannot start a second execution.",
          "Inject a timeout before effect, after effect, and during effect. For each, collect action status and fresh physical evidence before selecting a branch.",
          "Write one operation-specific compensation with its own preconditions, limits, result, postcondition, and failure path; reject a generic inverse command.",
          "Define the robot safe or paused handoff state and prove active command authority is resolved before the operator is asked to approach or resume.",
          "Build the handoff card or console view with goal, plan, current state and age, last verified effect, uncertain goals, attempts, remaining budget, hazards, evidence, owner, and allowed decisions.",
          "Run all three timeout positions plus exhausted recovery, and verify each ends in reconciled success, confirmed no effect, safe compensation, declared abort, or owned handoff without an unapproved repeat.",
        ],
        observe:
          "The same timeout produces different safe decisions depending on whether the effect is absent, complete, partial, active, or unobservable; a retry policy that ignores these states duplicates physical work.",
        doneWhen:
          "Duplicate requests map to one execution, every timeout is reconciled before new effects, compensation is operation-specific, and handoff transfers a verified safe state plus enough context for an operator to decide deliberately.",
      },
      jobConnection: {
        roles: [
          ROLE_FLEET,
          ROLE_HMI,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "Design mission and operator workflows that survive lost acknowledgments without duplicate robot motion, distinguish canceling from canceled, compensate only reversible effects, and transfer unresolved goals to a safe state with complete evidence and authority.",
        interviewPrompt:
          "A robot place action times out after the gripper may have opened. Explain outcome uncertainty, goal reconciliation, idempotency limits, compensation, when retry is forbidden, and the exact information and authority needed for human handoff.",
      },
      commonMistakes: [
        {
          mistake: "Assuming a timeout means the action did not execute and immediately sending the same physical command.",
          correction:
            "Enter outcome-unknown, reconcile goal status and fresh world state, and permit a retry only when the effect is confirmed absent and the operation's contract allows it.",
        },
        {
          mistake: "Calling a request idempotent solely because it carries an idempotency key.",
          correction:
            "Use the key to deduplicate one logical execution, while separately analyzing whether repeating or resuming the physical effect is safe from current state.",
        },
        {
          mistake: "Showing “operator assistance required” without first resolving motion, authority, and evidence.",
          correction:
            "Reach the defined safe or paused state, identify active or uncertain goals, transfer hazards and current observations, name an owner, and require an explicit resume decision.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a timeout prove about a physical action?",
          answer:
            "Only that the orchestrator's waiting bound expired; the effect may be absent, complete, partial, still active, or unknown and must be reconciled.",
        },
        {
          question: "Why does an idempotency key not make `move forward 10 cm` safe to repeat?",
          answer:
            "The key can prevent duplicate server executions, but the relative motion itself changes physical state each time and remains unsafe if prior completion is uncertain.",
        },
        {
          question: "What must a human receive before taking ownership of an unresolved task?",
          answer:
            "A verified safe or paused state, resolved command authority, goal and plan identity, current state and age, last effect, uncertainty and attempts, hazards, evidence, permitted actions, and an explicit resume or abort decision.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A timeout-to-reconciliation-and-handoff state diagram materially prevents readers from collapsing unknown, canceling, compensated, safe, and operator-owned states into one retry arrow.",
      },
    },
    {
      dayId: 140,
      mentalModel:
        "A long-horizon demo is an evidence ledger: one run ID connects the original goal to every observation, plan revision, skill attempt, recovery, intervention, and final fact.",
      explanation: [
        "Assign a run ID before interpreting the user request. Every trace event then carries sequence number, monotonic and wall-clock time, run ID, task and plan revision, component, event type, request and goal IDs when present, input and output state versions, and a compact payload. Append events for clarification, grounding, plan acceptance, precondition rejection, dispatch, status, feedback, cancel, observation, effect verdict, retry, replan, compensation, handoff, and terminal outcome.",
        "Preserve the distinction among proposed, accepted, commanded, measured, and verified state. A planner proposal is evidence of reasoning, not motion; action acceptance is evidence that a server took ownership, not completion; feedback describes progress; a result describes the action lifecycle; a postcondition observation supports the physical claim. Store plan revisions and their supersedes links so a reviewer can tell which steps actually ran and why an old suffix was abandoned.",
        "Freeze the demo before running it. Declare initial scene, entities, reset, goal predicates, invariants, time and retry budgets, failure injector, allowed intervention, success, partial-success, failure, and unsafe-attempt rules. Run at least a nominal case and one changed-state case using the same versions. An uncut screen recording is useful for timing and human-visible behavior, but it complements rather than replaces structured state, action, and result records.",
        "Report denominators and terminal categories. Measure verified task success, completion duration, planning and skill latency, retries, replans, recovery success, intervention count and duration, handoffs, stale or rejected calls, and unsafe attempts. A rough product of independent skill success rates can reveal chain fragility, but observed long-horizon evidence must retain conditional branches and shared causes. Publish the largest remaining failure and the exact next test rather than selecting only the clean run.",
      ],
      keyTerms: [
        {
          term: "Run ID",
          meaning:
            "The stable identity joining all plans, calls, observations, logs, video markers, results, and reports for one end-to-end attempt.",
          physicalExample:
            "Run RUN-204 appears in the natural-language request event, ROS goal wrapper, simulator state capture, recovery record, and final report row.",
        },
        {
          term: "Trace event",
          meaning:
            "An immutable timestamped record of one meaningful decision, state change, command lifecycle update, observation, or intervention.",
          physicalExample:
            "Event 38 records that goal G12 reached canceled and event 39 records zero commanded velocity before the new plan is accepted.",
        },
        {
          term: "Plan revision",
          meaning:
            "A versioned plan tied to a specific input state and linked to the earlier plan it replaces or refines.",
          physicalExample:
            "P6 supersedes P5 after the target block moves; completed observation steps remain, while the approach and pick suffix changes.",
        },
        {
          term: "Intervention",
          meaning:
            "A human action that changes task execution, state, or authority and therefore must be counted separately from autonomous recovery.",
          physicalExample:
            "An operator selects B-17 from two candidates; the clarification is logged and the run is not labelled fully autonomous.",
        },
        {
          term: "Verified terminal outcome",
          meaning:
            "The final success, partial, failure, handoff, or abort category supported by fresh goal predicates, invariant checks, and robot safe-state evidence.",
          physicalExample:
            "The block is inside bin C and the gripper is empty, but the arm failed to park before deadline, so the declared outcome is partial rather than success.",
        },
      ],
      physicalExamples: [
        {
          title: "Correlated tabletop card run",
          scenario:
            "A camera records a paper-block task while a second view shows a trace table whose events use the same run ID, object ID, plan revisions, and injected-failure marker.",
          lookFor:
            "A reviewer can pause at any physical change and find the proposal, validation, state snapshot, skill state, and later postcondition event that explains it.",
        },
        {
          title: "Polished video with missing lineage",
          scenario:
            "A robot video shows a parcel reaching a shelf, but the logs start after the goal, omit one restart, contain no plan version, and end at action success without a measured parcel identity.",
          lookFor:
            "The clip is a demonstration artifact but cannot prove the declared end-to-end outcome, autonomy level, recovery path, or reproducibility.",
        },
      ],
      workedExample: {
        title: "Reconstruct a blocked-path storage run from its trace",
        setup:
          "Run RUN-204 asks a simulated mobile manipulator to move block B-17 from tray T1 to bin C. The frozen injector moves a trolley into the navigation path after the first goal starts; one replan is permitted.",
        steps: [
          "Events 1–6 record request text, parsed terminal predicates and invariants, clarification-free grounding to B-17, initial snapshot S70, accepted plan P20, software versions, and the frozen injector configuration.",
          "Events 7–15 record navigation request R31, ROS goal G31, acceptance, status, feedback, and current state. The trace shows feedback remained fresh while the progress predicate failed after the trolley appeared.",
          "Events 16–22 record `NO_PROGRESS`, cancellation request, canceling, canceled, zero commanded motion, snapshot S71 with trolley T8, and recovery-budget decrement. No new goal appears before G31 reaches a terminal state.",
          "Events 23–27 record plan P21 superseding P20, the changed navigation suffix, preserved B-17 and bin predicates, validated remaining deadline, and dispatch of new request R32 with goal G32.",
          "Events 28–46 record alternate navigation, fresh grounding, pick, held-object verification, place, in-bin verification, empty gripper, parking, and invariant checks. Every succeeded action is followed by a separate state observation and postcondition verdict.",
          "Compute the result from the ledger: one of one task succeeded, one of one injected failures recovered, one replan, zero human interventions, zero unsafe calls, and duration 74 seconds within the 90-second threshold. Keep skill and planning latencies as separate fields.",
          "Rebuild the report and video markers using only RUN-204 events. If any decision cannot be explained or the final predicates cannot be recomputed from stored observations, mark the evidence incomplete and repair instrumentation before presenting the run.",
        ],
        result:
          "RUN-204 supports recovered success because its obstacle, progress failure, cancellation, new state, plan revision, downstream skill effects, and terminal predicates are all correlated and recomputable.",
        takeaway:
          "An uncut demo becomes engineering evidence only when its visible behavior can be reconciled with versioned decisions, action lifecycle, fresh world state, and predeclared outcome rules.",
      },
      handsOn: {
        setup:
          "Use the week's simulator or paper-world build. Freeze one nominal scenario and one scenario that changes an object, blocks a path, or causes a single skill postcondition to fail.",
        steps: [
          "Write a trace schema with sequence, two clocks, run ID, task and plan revision, component, event type, request and goal IDs, state versions, payload, and evidence reference.",
          "Declare both scenarios' resets, terminal predicates, invariants, time and recovery budgets, allowed intervention, failure injection point, and terminal outcome categories before execution.",
          "Run the nominal case without edits, capturing request, grounding, plan, validations, skill status and feedback, observations, effect verdicts, timings, and final safe state under one run ID.",
          "Reset to the frozen initial state and run the injected-failure case. Require a visible changed snapshot, bounded recovery decision, new plan revision when needed, and preserved record of the abandoned attempt.",
          "Mark any operator action with identity, reason, duration, and authority change; do not label a clarified, rescued, or manually repositioned run fully autonomous.",
          "Compute success denominator, durations, retries, replans, recovery result, interventions, rejected or stale calls, and unsafe attempts directly from trace events, then compare them with the predeclared thresholds.",
          "Ask another person to reconstruct both runs and final predicates from the evidence bundle. Fix missing lineage, retain the largest failure, and record one next experiment tied to that failure category.",
        ],
        observe:
          "Missing IDs, state versions, or terminal observations create gaps exactly where a polished demo can hide duplicated commands, manual rescue, stale plans, or an incorrect object outcome.",
        doneWhen:
          "Both frozen runs are reconstructable from one schema, every action result has an effect verdict, every replan names its input state and predecessor, interventions are counted, and the final category can be recomputed without trusting narration.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_FLEET,
          ROLE_HMI,
        ],
        workExample:
          "Instrument an embodied-agent mission so model proposals, ROS 2 goals, simulator or robot observations, retries, operator actions, and terminal business outcomes share lineage; then convert the trace into repeatable acceptance and incident evidence.",
        interviewPrompt:
          "What would you log to prove a multi-step language-to-robot task recovered from one failure? Separate proposal, action lifecycle, physical verification, plan revision, intervention, and terminal outcome evidence.",
      },
      commonMistakes: [
        {
          mistake: "Using a success video as the only evidence for a long-horizon task.",
          correction:
            "Correlate the video with versioned goal, plan, call, status, observation, recovery, intervention, and final-predicate events under one run ID.",
        },
        {
          mistake: "Overwriting the original plan and failed attempt after recovery succeeds.",
          correction:
            "Append the new snapshot and plan revision, link it to the predecessor, and retain the failed attempt and recovery-budget change.",
        },
        {
          mistake: "Reporting average completion time without outcome denominator, interventions, or unsafe attempts.",
          correction:
            "Publish terminal counts, duration distribution, recovery and intervention measures, rejected calls, safety outcomes, scenario definitions, and every retained failure.",
        },
      ],
      checkQuestions: [
        {
          question: "Which identity should connect the user request, plan, ROS goals, observations, video, and final report?",
          answer:
            "One run ID, supplemented by stable request, goal, entity, snapshot, and plan-revision IDs for the events inside that run.",
        },
        {
          question: "Why must every succeeded action have a later effect-verdict event?",
          answer:
            "Action success reports the server lifecycle; a separate fresh observation determines whether the intended physical postcondition and entity identity actually hold.",
        },
        {
          question: "When is a recovered demo still not fully autonomous?",
          answer:
            "When a human clarified, repositioned, selected, resumed, or otherwise changed execution or authority; that intervention must remain counted even if the final task succeeds.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The actual correlated trace table and uncut run are the required evidence; a generic evidence visual would hide the lineage this lesson is meant to inspect.",
      },
    },
  ],
} satisfies ChapterContent;
