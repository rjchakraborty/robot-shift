import type { ChapterContent } from "../chapter-content-types";

const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";

export const week17Content = {
  week: 17,
  title: "Prove FleetOps across regression, interfaces, safety, and commissioning",
  purpose:
    "Turn the simulated FleetOps build into a risk-linked acceptance package rather than a convincing demonstration. This chapter moves from testable requirements and failure analysis through component, ROS 2 launch, system, deterministic simulation, SIL, and HIL evidence; challenges external fleet and industrial boundaries; keeps functional safety under qualified ownership; and closes with FAT, SAT, commissioning, incident, rollback, and explicit go/no-go records that another engineer can reproduce.",
  prerequisites: [
    "Complete Week 16's robot–edge–cloud boundaries, mission API, task allocation, operator HMI, telemetry, canary deployment, rollback, observability, and fault-injection acceptance work.",
    "Bring one versioned FleetOps baseline with a documented start command, two simulated robots, immutable code and configuration identities, a known-good mission, structured logs, and a reversible deployment path.",
    "Be able to distinguish requested, accepted, commanded, measured, and terminal mission state; keep one correlation identity across API, allocator, adapter, robot, and evidence records.",
    "Keep all exercises in a simulator, software emulator, unpowered design review, or approved restricted-energy HIL bench. A classroom test plan never authorizes live machinery, bypassed safeguards, or safety-function validation without qualified supervision.",
  ],
  outcomes: [
    "Convert requirements and hazards into measurable acceptance criteria, failure modes, controls, test cases, results, and unresolved-risk records with bidirectional traceability.",
    "Place pytest, gtest, ROS 2 launch_testing, integration, and complete-mission checks at the boundary where each can expose a distinct defect instead of treating test count as system confidence.",
    "Build a version-pinned Gazebo or Isaac scenario matrix whose fixed cases, documented seeds, assertions, artifacts, and measured reruns separate repeatable regression from robustness exploration.",
    "Reuse one fault contract across SIL and HIL, inject bounded sensor, clock, transport, and device failures, and report detection time, response, terminal state, and evidence limits for each test level.",
    "Test VDA 5050 v3 and Open-RMF adapter contracts without confusing warehouse intent, fleet traffic, vendor navigation, PLC equipment control, or independently engineered safety ownership.",
    "Explain the scope of ISO 3691-4 and ISO 13849, distinguish application stops from validated protective functions, and create an awareness-level safety-function table for qualified review.",
    "Run an evidence-linked FAT/SAT and commissioning rehearsal, preserve incident facts separately from hypotheses, prove corrective-action regression and rollback, and record an explicit FleetOps go/no-go decision.",
  ],
  jobTargets: [
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_FLEET,
  ],
  sources: [
    {
      label: "ROS 2 Jazzy — launch_testing",
      url: "https://docs.ros.org/en/jazzy/p/launch_testing/",
      useFor:
        "Official runtime-test semantics for active tests, post-shutdown checks, process output, exit codes, time-bounded waiting, launch arguments, and ament CMake integration.",
    },
    {
      label: "Gazebo Sim 8 — Python TestFixture",
      url: "https://gazebosim.org/api/sim/8/python_interfaces.html",
      useFor:
        "Maintainer API for loading a versioned SDF world, stepping a Gazebo server, and checking entities and components in executable simulation fixtures.",
    },
    {
      label: "VDA 5050 — official version 3 specification and schemas",
      url: "https://github.com/VDA5050/VDA5050",
      useFor:
        "Official VDA and VDMA source for the versioned mobile-robot-to-fleet-control interface, normative document precedence, JSON schemas, messages, actions, and compatibility review.",
    },
    {
      label: "Open-RMF — Fleet Adapter Tutorial",
      url: "https://osrf.github.io/ros2multirobotbook/integration_fleets_adapter_tutorial.html",
      useFor:
        "Open-RMF maintainer guidance for the adapter bridge, robot state and battery updates, task dispatch, vendor API callbacks, coordinate transforms, navigation graphs, and simulation time.",
    },
    {
      label: "OSHA Technical Manual — Industrial Robot Systems and Safety",
      url: "https://www.osha.gov/otm/section-4-safety-hazards/chapter-4",
      useFor:
        "Government guidance on documented risk assessment before commissioning, site acceptance against utilities and interfaces, safety-function verification, training, safeguards, and periodic revalidation.",
    },
  ],
  days: [
    {
      dayId: 113,
      mentalModel:
        "A validation plan is a chain of custody from an observable promise or hazard to one owned control, one executable challenge, one measured result, and one explicit residual decision.",
      explanation: [
        "Start with statements another person can falsify. “The robot stops quickly when localization is lost” is not testable until the trigger, initial speed, detection deadline, commanded response, measured terminal condition, operating surface, payload, and evidence clock are declared. Functional requirements describe observable behavior; non-functional requirements bound qualities such as latency, availability, or freshness. Give every requirement a stable identifier so later design, test, result, deviation, and approval records do not drift apart.",
        "A hazard is a potential source or situation of harm, while a failure mode describes how a component or function can fail. FMEA records the failure mode, local and system effects, possible causes, existing controls, detection, and follow-up action. A severity–occurrence–detection product can help sort review work, but it is not a safety argument: low estimated occurrence cannot automatically make a catastrophic consequence acceptable, and teams must not tune scores to obtain a preferred rank.",
        "Traceability should work in both directions. Starting from a requirement or risk control, a reviewer can find its design owner, verification method, exact configuration, result, evidence, deviation, and current disposition. Starting from a test, the reviewer can name the requirement or risk it covers. An orphaned high-risk requirement is a gap; an automated test with no stated purpose may still be useful, but its pass cannot be counted as risk coverage.",
        "Plan negative and recovery behavior before executing the happy path. Include normal load, boundary values, foreseeable misuse, stale or missing data, process death, communication loss, restart, cancellation, rollback, and post-recovery state. Freeze acceptance thresholds before the run, preserve failing evidence, and separate verification from validation: verification asks whether the implementation meets its specification, while validation asks whether the integrated system is suitable for the intended use and environment.",
      ],
      keyTerms: [
        {
          term: "Testable requirement",
          meaning:
            "A uniquely identified statement with observable conditions, behavior, limits, units, and a decidable pass or fail result.",
          physicalExample:
            "REQ-LOC-04 states that a moving AMR presented with localization age above 200 ms must enter the declared stopped state within 500 ms under the named test conditions.",
        },
        {
          term: "Hazard",
          meaning:
            "A source or situation with the potential to cause injury, damage, or another unacceptable consequence.",
          physicalExample:
            "Continued motion while position is unknown can expose a nearby person or fixture to collision.",
        },
        {
          term: "Failure mode",
          meaning:
            "A specific way a component, interface, or function can cease to provide its intended behavior.",
          physicalExample:
            "The localization process remains alive but republishes one frozen pose timestamp, so a heartbeat-only monitor sees no failure.",
        },
        {
          term: "FMEA",
          meaning:
            "A structured analysis that links possible failure modes to effects, causes, controls, detection, ownership, and actions.",
          physicalExample:
            "A row for frozen localization records collision exposure, timestamp-age monitoring, the required response, a fault-injection test, and an unresolved diagnostic gap.",
        },
        {
          term: "Bidirectional traceability",
          meaning:
            "The ability to navigate from requirement or risk to evidence and from every claimed test result back to its purpose and governing version.",
          physicalExample:
            "Clicking HAZ-07 reaches control CTRL-12, tests SIL-18 and HIL-06, their artifacts, one deviation, and the signed residual-risk disposition.",
        },
      ],
      physicalExamples: [
        {
          title: "Fire-door promise versus inspection record",
          scenario:
            "A paper sign says a model fire door closes after release. A second sheet names the release condition, maximum closing time, obstruction case, inspection date, measured result, and failed latch correction.",
          lookFor:
            "The first sheet states intent; the second makes the trigger, limit, adverse case, evidence, and unresolved defect inspectable without claiming the paper model is a certified door.",
        },
        {
          title: "Bicycle brake risk ledger",
          scenario:
            "With the bicycle stationary and unpowered, list worn pad, loose cable, wet rim, and stuck lever as different failure modes, then link each to its effect, detection, maintenance action, and verification.",
          lookFor:
            "Several mechanisms can produce weak braking, so one generic “brake tested” checkbox loses the causal detail needed to choose and verify a control.",
        },
      ],
      workedExample: {
        title: "Trace a frozen-localization risk into a decidable test",
        setup:
          "FleetOps accepts navigation only while localization age is at most 200 ms. The review team is considering a stale-pose failure with severity 9, occurrence 3, and detection difficulty 7 on internal 1–10 planning scales.",
        steps: [
          "Create HAZ-07 for collision exposure during motion with unknown pose, then create FM-07A for a publisher that repeats an unchanged pose timestamp while its process remains alive.",
          "Calculate the planning score `9 × 3 × 7 = 189`, record the scale definitions, and state that 189 prioritizes review but does not decide whether the hazard is acceptable.",
          "Write REQ-LOC-04: when pose age first exceeds 200 ms during the declared simulated motion case, FleetOps rejects further navigation and reaches its specified stopped mission state within 500 ms.",
          "Link the requirement to an independent freshness watchdog, a cancellation path, operator-visible fault state, and a qualified review item for any separate safety-rated protective function.",
          "Define SIL-18 to freeze the source timestamp, capture the injection time and one monotonic evidence clock, and assert detection latency, command rejection, terminal mission state, process health, and recovery behavior.",
          "Record the exact build, configuration, world, initial state, logs, trace identity, measured latency, pass or fail, reviewer, and any deviation; link every artifact back to HAZ-07 and REQ-LOC-04.",
        ],
        result:
          "The former phrase “stop safely” becomes a reproducible software requirement and test while the qualified functional-safety decision remains explicitly outside this exercise.",
        takeaway:
          "Traceability makes every acceptance claim inspectable and prevents a convenient passing test from silently substituting for an untested hazard control.",
      },
      handsOn: {
        setup:
          "Use the Week 16 simulated FleetOps baseline and a local table or issue tracker. Do not move real hardware or assign performance levels, protective-field distances, or residual safety acceptance yourself.",
        steps: [
          "Write ten stable requirements covering mission creation, duplicate request, cancellation, stale robot state, allocation, blocked route, operator indication, rollback, evidence retention, and recovery.",
          "Create five failure-mode rows with effects, causes, current controls, detection gaps, planning scores where useful, owners, and required actions; include at least one severe item that cannot be accepted by arithmetic ranking.",
          "Build a traceability table linking each high-priority requirement or control to design location, component check, integration check, complete-mission scenario, result placeholder, and deviation field.",
          "Rewrite every ambiguous word such as fast, safe, reliable, immediate, nearby, or normal into a condition, observable quantity, unit, threshold, and time window.",
          "Ask another engineer to start from two tests and identify their requirements, then start from two hazards and identify their evidence; repair every broken forward or backward link.",
          "Freeze the review version, date, assumptions, exclusions, and unresolved items before any acceptance run so thresholds cannot move after results are visible.",
        ],
        observe:
          "The table exposes missing owners, requirements with no negative case, automated checks that cover no declared risk, and severe controls whose evidence is still only planned.",
        doneWhen:
          "Every high-priority risk and requirement reaches a versioned planned test and disposition field in both directions, while ambiguous language and unsupported safety claims are removed.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_FLEET],
        workExample:
          "Lead a FleetOps verification review that turns warehouse workflows, communication failures, robot-state freshness, rollback, and commissioning hazards into owned requirements, controls, executable cases, evidence identities, deviations, and residual decisions.",
        interviewPrompt:
          "A product manager says an AMR must stop safely when localization fails. Show how you would rewrite that statement, distinguish hazard from failure mode, use FMEA without worshipping its score, and prove traceability in both directions.",
      },
      commonMistakes: [
        {
          mistake: "Writing a test procedure before defining the requirement or risk it is meant to cover.",
          correction:
            "Give the observable promise or control a stable identity first, then link the procedure, threshold, configuration, result, deviation, and decision to that identity.",
        },
        {
          mistake: "Using an RPN threshold as automatic permission to accept a severe hazard.",
          correction:
            "Use scoring only to support prioritization; apply the organization’s hazard rules, applicable standards, qualified judgment, control hierarchy, validation, and documented residual-risk process.",
        },
        {
          mistake: "Removing a failed case after the implementation is corrected.",
          correction:
            "Retain the original failure evidence, corrective-action identity, new regression result, and approval so the causal history remains reviewable.",
        },
      ],
      checkQuestions: [
        {
          question: "What makes a requirement testable?",
          answer:
            "It names a stable condition, observable behavior, limits and units, evidence method, and a pass or fail rule another person can apply.",
        },
        {
          question: "Why can a lower FMEA score not automatically clear a catastrophic failure mode?",
          answer:
            "The product is a planning aid whose scales and estimates are imperfect; severity rules, standards, controls, validation, and qualified residual-risk acceptance remain separate decisions.",
        },
        {
          question: "What does reverse traceability reveal?",
          answer:
            "It shows whether a test result actually supports a named requirement or risk control rather than adding an impressive but irrelevant pass count.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A live traceability table with clickable requirement, risk, test, result, and deviation identities is more faithful than the generic system visual for this evidence-management lesson.",
      },
    },
    {
      dayId: 114,
      mentalModel:
        "Regression confidence is a layered net: each test level must cross a real boundary and catch a named defect that cheaper, narrower checks intentionally cannot see.",
      explanation: [
        "Use pytest for Python logic and data contracts, and gtest for C++ algorithms, state machines, boundary arithmetic, and class behavior. Keep these component tests fast and explicit, but do not pretend an in-process fake proves middleware discovery, process lifecycle, configuration loading, clocks, executor behavior, or a physical result. A useful test double narrows one dependency; a hidden fallback that makes the product behave differently under test invalidates the evidence.",
        "An integration test connects real production interfaces between selected components: serialized messages, database constraints, ROS services or actions, adapters, and cancellation acknowledgments. ROS 2 launch_testing can launch processes, run active tests while they are alive, and run post-shutdown checks over exit codes, output, and generated evidence. Waiting assertions require timeouts, and every process match must be specific enough that output from the wrong node cannot accidentally satisfy the test.",
        "A system test begins at an external mission request and ends at the declared physical or simulated outcome. It should inspect intermediate state only to diagnose the route, not redefine success as “HTTP 200,” “action accepted,” or “process exited zero.” Acceptance depends on the terminal mission, measured robot state, safety or fault state, and correlated artifacts. Plant schema mismatch, process death, delayed acknowledgment, and wrong final position so the expected layer actually demonstrates its detection power.",
        "Regression selection follows change and risk, not a fixed pyramid slogan. Run the narrow checks that localize arithmetic and contracts, then the smallest cross-process set covering touched interfaces, then risk-linked mission scenarios and required SIL or HIL gates. Quarantine is not a trash bin for inconvenient failures: a flaky test needs an owner, suspected mechanism, evidence, impact assessment, and deadline, while a safety- or acceptance-critical flake blocks the claim it was meant to support.",
      ],
      keyTerms: [
        {
          term: "Component test",
          meaning:
            "A narrow executable check of one algorithm, class, function, or data contract with controlled dependencies.",
          physicalExample:
            "A gtest case proves a mission state machine rejects `completed` directly after `queued` and reports the invalid transition.",
        },
        {
          term: "Integration test",
          meaning:
            "A check that selected production components communicate through their real contract and failure semantics.",
          physicalExample:
            "A Python mission client sends a versioned request through the real adapter serializer and verifies cancellation acknowledgment plus stored terminal state.",
        },
        {
          term: "launch_testing",
          meaning:
            "The ROS 2 framework for launching processes and applying active and post-shutdown assertions to their runtime behavior and results.",
          physicalExample:
            "The test launches allocator and adapter nodes, waits for one specifically matched readiness event, kills the adapter, then checks bounded fault publication and exit evidence.",
        },
        {
          term: "System test",
          meaning:
            "An end-to-end evaluation of the integrated product against an external requirement and terminal outcome in a declared environment.",
          physicalExample:
            "A request for tote delivery is accepted once, assigned, executed in simulation, acknowledged by the station emulator, and closed with a measured final pose.",
        },
        {
          term: "Test oracle",
          meaning:
            "The independent rule or measurement that decides whether observed behavior is correct.",
          physicalExample:
            "The oracle checks the simulated robot pose and station handshake, not the fleet service’s own optimistic `completed` field.",
        },
      ],
      physicalExamples: [
        {
          title: "Airport checks at different boundaries",
          scenario:
            "A paper itinerary separates passport validation, airline-to-border data exchange, and the traveler’s complete arrival at the correct gate with luggage.",
          lookFor:
            "The document scanner can pass alone while an interface or full journey fails; counting the fastest checks cannot substitute for traversing the missing boundary.",
        },
        {
          title: "Lamp circuit from part to outcome",
          scenario:
            "With a battery-powered classroom lamp disconnected from mains, check the switch, then the switch-to-wire connection, then whether pressing the assembled switch actually illuminates the bulb.",
          lookFor:
            "Part correctness, connection correctness, and observable product outcome answer different questions even in a very small system.",
        },
      ],
      workedExample: {
        title: "Choose the first test level that can expose four defects",
        setup:
          "A FleetOps suite has 480 component checks taking 24 seconds, 40 cross-process integration checks taking 5 minutes, and 8 complete simulated missions taking 32 minutes.",
        steps: [
          "Calculate the case total as `480 + 40 + 8 = 528`; component checks are `480 / 528 ≈ 90.9%` of case count but cover zero complete missions.",
          "Assign a wrong battery-threshold comparison to a component test because one pure function can reproduce and localize the arithmetic defect.",
          "Assign a renamed serialized field between allocator and adapter to an integration test using the real schema and deserializer rather than duplicated in-test structures.",
          "Assign a ROS adapter process that dies after startup to launch_testing so an active timeout and post-shutdown exit assertion inspect the launched system.",
          "Assign “service reports complete while the robot stops at the wrong station” to the full mission test with an independent terminal-pose and station-handshake oracle.",
          "Order the regression run by fast localization first, then touched interfaces, then all risk-linked complete scenarios; retain each planted failure as proof that its assigned layer detects it.",
        ],
        result:
          "The suite uses all 528 checks but never converts the 90.9% component-test share into a false claim of end-to-end or acceptance coverage.",
        takeaway:
          "A test earns confidence from the production boundary and failure it challenges, not from its runner, speed, or contribution to a large count.",
      },
      handsOn: {
        setup:
          "Use the simulated FleetOps workspace and its actual package interfaces. If a required node, toolchain, or simulator is unavailable, record that exact boundary as blocked rather than replacing it with a hidden mock.",
        steps: [
          "Add one pytest case for mission-request schema and idempotency validation, including a malformed field and a duplicate correlation key.",
          "Add one gtest or inspectable C++ test design for a bounded mission-state transition, including an illegal transition and the expected diagnostic.",
          "Create one launch_testing case that starts at least two real ROS 2 processes, waits with a finite timeout, injects one process termination, and verifies the specifically matched fault plus shutdown result.",
          "Run one complete simulated mission from external API request to independently measured terminal pose and station acknowledgment; retain a single trace identity across all layers.",
          "Plant schema mismatch, timeout, process death, and false-completion defects one at a time, then record the first layer that detects each and every layer that legitimately cannot.",
          "Publish command, duration, exact versions, pass and fail counts, raw result locations, planted-defect evidence, and any unexecuted HIL or physical boundary without inflating the claim.",
        ],
        observe:
          "Fast tests localize code defects, launch tests expose runtime and lifecycle behavior, and the complete mission reveals outcomes that no internal status field can prove by itself.",
        doneWhen:
          "All four planted defects are caught at an intentional layer, the nominal mission reaches an independently verified terminal outcome, and no mock-only result is labelled system acceptance.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION],
        workExample:
          "Design a ROS 2 regression lane that combines Python contracts, C++ state-machine checks, launch_testing process faults, and independently measured simulated missions, while keeping commands, artifacts, timing, and uncovered hardware boundaries explicit.",
        interviewPrompt:
          "Your team has thousands of passing unit tests but field missions still fail. Explain what pytest, gtest, launch_testing, integration, and system tests each prove, then place schema mismatch, process death, timeout, and wrong physical outcome.",
      },
      commonMistakes: [
        {
          mistake: "Calling a launched process test end to end because several nodes started.",
          correction:
            "Name the actual boundary crossed and require an external request plus independent terminal outcome before claiming a complete mission.",
        },
        {
          mistake: "Waiting forever for a ROS message or matching any process output containing a convenient word.",
          correction:
            "Use bounded waits and specific process or action identities so a hang fails and unrelated output cannot satisfy the assertion.",
        },
        {
          mistake: "Quarantining a flaky acceptance test while continuing to claim the risk is covered.",
          correction:
            "Assign an owner and mechanism investigation, preserve rerun evidence, and mark the associated acceptance claim blocked until a trustworthy check or equivalent proof exists.",
        },
      ],
      checkQuestions: [
        {
          question: "What can a launch_testing post-shutdown test inspect that an active test normally cannot yet know?",
          answer:
            "It can inspect final exit codes, complete output, and artifacts after the launched processes have terminated.",
        },
        {
          question: "Why is an accepted mission response not a system-test oracle?",
          answer:
            "It proves only that one service accepted or recorded a request; it does not prove allocation, execution, physical or simulated outcome, station interaction, or safe terminal state.",
        },
        {
          question: "How should regression depth change with risk?",
          answer:
            "Run narrow localization checks plus every real interface, mission, SIL, HIL, and acceptance case needed by the touched requirements and failure consequences.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The planted-defect-to-test-layer table carries the important relationship more exactly than a generic distributed-system diagram and remains directly reusable as regression evidence.",
      },
    },
    {
      dayId: 115,
      mentalModel:
        "A simulation regression case is a frozen experiment envelope: world, robot, software, parameters, start state, seed, fault, oracle, and artifact schema travel together.",
      explanation: [
        "A simulator run is reproducible only to the level its complete environment permits. Pin the Gazebo SDF or Isaac USD assets, simulator and physics versions, robot model, plugins, ROS middleware and bridge, parameters, step size, sensor configuration, initial state, and test code. Gazebo’s TestFixture can load a world, step the server, and inspect entities and components; an Isaac workflow can likewise run a versioned standalone scene with explicit randomization seeds. Treat both as executable environments, not videos.",
        "A fixed seed controls only the random generators that actually use it. Thread scheduling, GPU kernels, physics implementation, middleware arrival order, asynchronous writers, external services, and version changes can still alter timing or results. Run important fixed cases repeatedly and measure result stability. Call a test deterministic only for the declared observable and tolerance; use “repeatable under this manifest” when bit-for-bit identity has not been demonstrated.",
        "Separate regression from robustness. A regression set holds scenario definitions and expected outcomes stable so a software change can be compared with a known baseline. A robustness set deliberately varies pose, friction, payload, latency, lighting, obstacles, or seeds within justified ranges. Randomizing everything at once makes failures difficult to localize, while testing one perfect world creates unjustified confidence about deployment diversity.",
        "Replay is more than rerunning a bag or watching a recording. Preserve the scenario identity, commands, input streams, world and model versions, clock behavior, fault schedule, expected oracle, software bundle, logs, traces, and terminal measurements. A bag can replay ROS inputs but cannot recreate changed physics, contact, plugin state, external database behavior, or nondeterministic scheduling unless those dependencies are also captured or replaced by an explicitly scoped fixture.",
      ],
      keyTerms: [
        {
          term: "Scenario manifest",
          meaning:
            "The versioned description of every environment, model, start, parameter, seed, fault, oracle, and artifact needed to identify one test case.",
          physicalExample:
            "SCN-BLOCKED-03 pins the warehouse world digest, robot model, two start poses, obstacle placement, seed 41, blocked-lane event time, and recovery deadline.",
        },
        {
          term: "Scenario seed",
          meaning:
            "A value used to initialize participating pseudo-random generators so their generated sequence can be repeated under compatible execution.",
          physicalExample:
            "Seed 41 recreates one obstacle placement sequence but does not force GPU scheduling or DDS delivery order to become identical.",
        },
        {
          term: "Regression matrix",
          meaning:
            "A stable set of named scenarios used to detect behavior changes between frozen software and configuration baselines.",
          physicalExample:
            "Every release reruns nominal delivery, blocked aisle, low battery, stale state, cancellation, and adapter restart with unchanged acceptance rules.",
        },
        {
          term: "Robustness sweep",
          meaning:
            "A declared variation of plausible conditions used to estimate how behavior changes across deployment diversity.",
          physicalExample:
            "The same docking task runs across three payloads, two floor-friction estimates, and five start offsets selected before results are seen.",
        },
        {
          term: "Replay bundle",
          meaning:
            "The inputs and versioned environment context required to reproduce or closely reconstruct a recorded failure and evaluate the same oracle.",
          physicalExample:
            "A bundle contains MCAP, manifest, world digest, parameters, container digest, fault timeline, command, expected terminal state, and trace links.",
        },
      ],
      physicalExamples: [
        {
          title: "Marked tabletop obstacle course",
          scenario:
            "Tape fixed start, goal, and obstacle outlines on a table, then move an unpowered cardboard robot token through the course using a written move list before changing exactly one obstacle.",
          lookFor:
            "The baseline is comparable only while layout, start, commands, and scoring stay fixed; the changed obstacle belongs to a new named condition rather than a silent rerun.",
        },
        {
          title: "Recipe and oven variation",
          scenario:
            "Two cards record ingredients, quantities, oven setting, tray position, timer, and result, while a third experiment deliberately changes only tray position.",
          lookFor:
            "A recipe resembles the manifest, repeated batches measure repeatability, and a controlled variation tests sensitivity without hiding which factor changed.",
        },
      ],
      workedExample: {
        title: "Size a frozen simulation matrix and its smoke subset",
        setup:
          "The planned full suite has 4 worlds, 3 robot starts, 2 documented seeds, and 3 fault modes. One case takes 50 seconds after startup, and the CI smoke budget is 8 minutes.",
        steps: [
          "Calculate the full matrix as `4 × 3 × 2 × 3 = 72` named cases; do not describe one ad hoc loop as 72 independent requirements.",
          "Estimate serial scenario time as `72 × 50 s = 3,600 s = 60 min`, then add measured startup, teardown, artifact, and retry overhead separately.",
          "Choose a predeclared smoke set of 8 cases covering every fault at least once, the most critical world, boundary starts, and both seeds; `8 × 50 s = 400 s` leaves 80 seconds for overhead.",
          "Run each smoke case twice under one pinned manifest and compare terminal state, outcome, and tolerance-bounded timing rather than demanding unsupported byte identity.",
          "Reserve the 72-case full matrix for the gated lane with controlled parallel workers, isolated namespaces, resource limits, and deterministic result ordering.",
          "If one repeated smoke case changes outcome, mark the gate failed or flaky, preserve both bundles, and investigate scheduling, physics, seed coverage, external state, and oracle instability before expansion.",
        ],
        result:
          "The eight-case smoke lane fits the nominal eight-minute budget, while the complete 72-case, one-hour serial estimate remains visible and scheduled for the gate.",
        takeaway:
          "A useful matrix balances risk coverage, runtime, isolation, and repeatability without shrinking the full acceptance obligation into the fastest subset.",
      },
      handsOn: {
        setup:
          "Use either the existing Gazebo FleetOps world or an available Isaac Sim equivalent. If only one simulator is installed, execute there and document the other as unverified rather than inventing cross-simulator parity.",
        steps: [
          "Create a manifest that pins simulator, physics and bridge versions, world or USD digest, robot model, containers, ROS distribution, middleware, parameters, time step, sensor settings, initial poses, and seed ownership.",
          "Define six fixed scenario IDs: nominal delivery, duplicate request, blocked route, low battery, stale robot state, and cancellation during motion; give each an independent terminal oracle.",
          "Run every fixed case twice, compare outcomes and bounded timing, and record process order, CPU or GPU context, and any observable nondeterminism.",
          "Create a separate robustness sweep that changes one plausible factor at a time—start offset, payload estimate, latency, friction, or obstacle placement—and preserve the chosen range rationale.",
          "Plant one wrong initial pose and one stale world digest; make the harness reject both before execution instead of producing incomparable results.",
          "Package command, manifest, logs, traces, MCAP where useful, fault timeline, terminal measurements, pass or fail, and known replay limits under one immutable result identity.",
        ],
        observe:
          "Pinned cases reveal software regressions, repeated runs reveal instability, controlled variations expose sensitivity, and manifest guards prevent silent environment changes from masquerading as product behavior.",
        doneWhen:
          "Another engineer runs one command, reproduces all fixed scenario identities and both manifest rejections, and can explain every observed difference without relying on a screen recording.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION],
        workExample:
          "Own a version-pinned Gazebo or Isaac regression service that schedules isolated fleet scenarios, measures repeated outcomes, captures failure bundles, distinguishes robustness sweeps from frozen gates, and rejects environment drift before test execution.",
        interviewPrompt:
          "A simulation test passes with seed 42 on one machine and fails in CI. Explain what a seed controls, what it does not, which versions and clocks you would inspect, and how you would preserve a replayable failure bundle.",
      },
      commonMistakes: [
        {
          mistake: "Claiming a fixed seed guarantees identical simulation.",
          correction:
            "Identify every seeded generator, pin the environment, repeat the case, compare declared observables with tolerances, and report remaining scheduling, GPU, physics, middleware, or external-state nondeterminism.",
        },
        {
          mistake: "Using randomized tests as the only regression gate.",
          correction:
            "Keep named fixed cases for change detection and run predeclared bounded variations separately for robustness, with every realized parameter recorded.",
        },
        {
          mistake: "Saving only an MCAP file or demo video after a failure.",
          correction:
            "Preserve the versioned world, models, start state, seed and fault schedule, configuration, software digests, inputs, oracle, logs, traces, and terminal measurement needed to reconstruct the experiment.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a simulator seed fail to control by itself?",
          answer:
            "Unseeded generators, thread and process scheduling, GPU behavior, physics or middleware version changes, asynchronous I/O, external services, and different operation order can still vary.",
        },
        {
          question: "Why keep fixed regression cases separate from a robustness sweep?",
          answer:
            "Fixed cases make release-to-release changes comparable; controlled variation measures sensitivity across plausible conditions without obscuring which factor changed.",
        },
        {
          question: "What must accompany replayed ROS messages to recreate a physics failure?",
          answer:
            "The matching world, robot and plugin versions, parameters, initial state, clocks, fault schedule, software bundle, external dependencies, and the original outcome oracle.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The executable scenario matrix and immutable manifest are the evidence; the available timing visual cannot represent version, seed, start-state, fault, oracle, and replay ownership without losing essential dimensions.",
      },
    },
    {
      dayId: 116,
      mentalModel:
        "SIL and HIL are adjacent rungs on one evidence ladder: the scenario contract stays stable while the real interfaces, timing, power, and plant behavior introduced at each rung are named.",
      explanation: [
        "Software-in-the-loop runs production or near-production application logic against simulated robots, sensors, actuators, clocks, and environments. It is fast enough for broad regression and destructive fault injection, but its timing, device, contact, load, power, and mechanical evidence are model-bounded. Hardware-in-the-loop introduces real controllers, compute, buses, I/O, or device interfaces while the plant or some sensors remain controlled by an emulator. State exactly which hardware is real; a laptop connected to a simulated robot is not automatically HIL.",
        "A sensor emulator needs a contract as rigorous as a driver: message or electrical interface, units, range, frame, rate, timestamp source, noise model, startup, reset, disconnect, saturation, corruption, and stale-data behavior. Plausible-looking values can be more dangerous than obvious absence. Freeze a timestamp while continuing to publish, repeat a sequence number, hold one channel constant, jump time backward, and send a validly encoded out-of-range value so consumers must check semantics instead of heartbeat alone.",
        "Inject faults at a known boundary and record one evidence clock. Useful cases include latency, packet loss, duplication, reordering, checksum error, delayed acknowledgment, clock jump, process restart, bus disconnect, and device reset. Define the expected detection, bounded response, terminal state, operator indication, and recovery rule before injection. Never inject on live production equipment or bypass protective systems; use an approved bench, restricted energy, isolation, and a qualified test owner.",
        "HIL closes some gaps but not all. It can expose real CPU load, scheduler behavior, firmware, bus timing, connector faults, driver semantics, and power transients present in the bench. An emulated motor does not prove braking distance, payload behavior, cable flex, tire friction, actuator heating, collision response, or protective fields. Keep a coverage ledger that states what SIL proves, what HIL adds, and which restricted-energy real-system or site tests remain blocked.",
      ],
      keyTerms: [
        {
          term: "Software-in-the-loop",
          meaning:
            "Execution of application software against simulated plant, sensors, devices, or environment through declared production-like interfaces.",
          physicalExample:
            "The real FleetOps allocator and ROS adapter command two Gazebo robots while sensor and motion results come from simulation.",
        },
        {
          term: "Hardware-in-the-loop",
          meaning:
            "A controlled test that includes named real controllers, compute, I/O, buses, or device interfaces while another part of the physical plant remains simulated or emulated.",
          physicalExample:
            "The production edge computer and CAN interface receive encoder frames from a fault-capable bench emulator while motor power remains isolated.",
        },
        {
          term: "Fault injection point",
          meaning:
            "The exact interface and direction where a test deliberately introduces one declared abnormal condition.",
          physicalExample:
            "A proxy between sensor emulator and ROS driver freezes source timestamps while preserving the nominal 40 Hz arrival cadence.",
        },
        {
          term: "Data-age limit",
          meaning:
            "The maximum permitted age of data relative to the clock and physical event used by the consumer.",
          physicalExample:
            "A controller rejects lidar state whose acquisition timestamp is more than 125 ms behind its monotonic decision clock.",
        },
        {
          term: "Coverage ledger",
          meaning:
            "A record of the real and emulated elements, challenged faults, measured results, and untested physical effects at each evidence level.",
          physicalExample:
            "The HIL row confirms real edge-compute timing and bus reset recovery but marks braking, payload, floor friction, and scanner fields unverified.",
        },
      ],
      physicalExamples: [
        {
          title: "Controller bench without motor power",
          scenario:
            "A labelled diagram places real edge compute and a real bus interface beside an emulator that supplies encoder frames, delayed acknowledgments, and disconnect events while the motor-power path stays isolated.",
          lookFor:
            "The test can expose driver, firmware, bus, and timing behavior, but the diagram prevents anyone from inferring real torque, braking, thermal, or contact evidence.",
        },
        {
          title: "Stopped clock with arriving envelopes",
          scenario:
            "A person delivers a new envelope every second, but every enclosed card repeats the same old timestamp and position value.",
          lookFor:
            "Arrival heartbeat remains healthy while information freshness fails, illustrating why consumers check source time and semantic progress rather than packet presence alone.",
        },
      ],
      workedExample: {
        title: "Derive and test a stale-sensor deadline",
        setup:
          "A sensor contract specifies 40 Hz nominal publication and a 125 ms maximum acquisition age. The fault harness can continue publishing while freezing the source timestamp for 150 ms.",
        steps: [
          "Convert rate to nominal period: `1 / 40 Hz = 0.025 s = 25 ms`.",
          "Express the freshness budget in periods: `125 ms / 25 ms = 5` nominal periods, noting that age is decided from timestamps rather than packet count.",
          "At injection time `t0`, freeze the acquisition timestamp but continue publishing well-formed messages at 40 Hz so a heartbeat-only monitor stays green.",
          "Assert that once measured age exceeds 125 ms, the consumer rejects the sample, reports the named stale-data fault, stops issuing new motion requests, and reaches the declared fallback within its own deadline.",
          "Because the freeze lasts 150 ms, verify at least one decision occurs beyond the age limit; record detection latency from the monotonic harness clock and preserve all message timestamps.",
          "Repeat the same scenario in SIL and, if an approved bench exists, HIL; compare detection and response timing while listing physical plant effects neither level exercises.",
        ],
        result:
          "The injected stream looks alive yet crosses the five-period freshness limit, so a semantic watchdog must expose the fault in both evidence levels.",
        takeaway:
          "A strong emulator reproduces convincing wrongness, not only total disconnection, and the oracle measures the consumer’s safe response from a known fault boundary.",
      },
      handsOn: {
        setup:
          "Begin in SIL. Use HIL only with an approved named bench, isolated actuator energy, documented wiring, emergency procedure, and responsible supervisor; otherwise produce the HIL-ready scenario and mark execution blocked.",
        steps: [
          "Define one scenario schema containing level, real elements, emulated elements, injection point, precondition, fault parameters, evidence clock, expected detection, response deadline, terminal state, reset, and artifact paths.",
          "Implement or configure seven bounded cases: frozen timestamp, backward clock jump, noise burst, packet loss, delayed acknowledgment, device reset, and validly encoded out-of-range value.",
          "Run the cases in SIL, preserving per-case injection time, observed detection, first response, terminal state, operator indication, recovery, and exact software and simulator identities.",
          "Map the same schema to the available HIL interfaces without weakening its oracle; if one fault cannot be generated safely or faithfully, record the reason and substitute no hidden software shortcut.",
          "Compare SIL and HIL timing distributions and failure semantics, then list newly covered real behaviors and remaining load, contact, braking, thermal, wiring, and environmental gaps.",
          "Verify every fault leaves the bench or simulator in a known reset state before the next case and that cancellation cannot accidentally re-enable motion or reuse stale state.",
        ],
        observe:
          "The shared schema exposes where the two levels behave differently, while the coverage ledger prevents real controller timing from being mistaken for proof of the full mechanical system.",
        doneWhen:
          "All seven SIL faults have decisive artifacts, every available HIL case preserves the same oracle, blocked HIL cases name their exact missing capability, and no result overclaims real-robot acceptance.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Build a reusable fault harness that drives the same sensor, clock, transport, and reset scenarios through simulation and an isolated controller bench, then publishes latency comparisons and an honest real-versus-emulated coverage ledger.",
        interviewPrompt:
          "Define SIL and HIL for a mobile robot without hand-waving. Show how you would freeze a timestamp while packets continue, measure the response, and explain which real-world failures still require restricted-energy or site validation.",
      },
      commonMistakes: [
        {
          mistake: "Calling any test involving a physical computer HIL.",
          correction:
            "Name the real controller, I/O, bus, firmware, or device interface and the emulated plant; otherwise classify the level by the boundary actually exercised.",
        },
        {
          mistake: "Injecting only complete sensor disconnection.",
          correction:
            "Also challenge plausible stale, duplicated, reordered, delayed, corrupt, saturated, and out-of-range data so semantic validation and fallback behavior are exercised.",
        },
        {
          mistake: "Treating a HIL pass as proof of braking or collision safety.",
          correction:
            "Limit the claim to the named bench hardware and interfaces, then preserve real load, friction, brake, protective-field, contact, thermal, and environmental tests as separate qualified obligations.",
        },
      ],
      checkQuestions: [
        {
          question: "What must be named before a test can credibly be called HIL?",
          answer:
            "The real hardware and interfaces, emulated plant or devices, fault boundary, energy isolation, expected behavior, measurements, and remaining physical gaps.",
        },
        {
          question: "Why continue publishing while freezing a source timestamp?",
          answer:
            "It proves whether the consumer detects semantic staleness instead of relying only on message arrival or process heartbeat.",
        },
        {
          question: "Which evidence gap remains after a controller-board HIL test?",
          answer:
            "Actual actuator, brake, payload, friction, contact, cable, thermal, protective-field, and site behavior remain unproven unless the bench genuinely includes and measures them.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "The SIL→real interface→HIL ladder and frozen-timestamp fault boundary materially clarify which element becomes real at each rung and where detection latency is measured.",
      },
    },
    {
      dayId: 117,
      mentalModel:
        "A warehouse robot integration is a chain of translators with explicit ownership: business intent, fleet coordination, robot execution, equipment handshake, and safety never become one ambiguous controller.",
      explanation: [
        "VDA 5050 version 3 defines a vendor-neutral interface between mobile robots and a central fleet control, with a versioned specification and JSON schemas for messages such as orders and state. Validate the negotiated version, required and optional fields, identities, sequence or update rules, actions, errors, and transport behavior against the exact release. Conformance at the message level does not guarantee two products agree about maps, actions, charging, traffic, or acceptance behavior.",
        "An Open-RMF fleet adapter bridges RMF planning and task dispatch to a vendor fleet or robot API. It supplies robot position, map, battery and activity status to RMF, receives navigation or action work, and translates coordinate and command conventions. Its route graph, transforms, update frequency, capabilities, stop behavior, and reconnection semantics are integration inputs. An adapter is not merely a format converter because stale state or a wrong transform can alter traffic decisions.",
        "Keep system ownership visible. A WMS or WES requests warehouse work and tracks business inventory or process intent. Fleet control allocates mobile work and manages fleet-level execution; Open-RMF may coordinate tasks and shared traffic across fleets; the vendor navigation stack controls the individual robot. PLCs operate conveyors, doors, lifts, and other equipment through their approved interfaces. None of these ordinary message paths should be described as a substitute for independently engineered safety functions.",
        "Cross-boundary reliability requires correlation, idempotency, freshness, acknowledgment, cancellation, and reconciliation. A repeated business request must not create extra missions; an adapter reconnect must not invent completion; stale robot state must not continue to win allocations; a timed-out PLC transfer cannot be treated as success. Preserve each domain’s identity and map them in an audit record so retries and out-of-order messages can be explained without collapsing all state into one boolean.",
      ],
      keyTerms: [
        {
          term: "VDA 5050",
          meaning:
            "A versioned, vendor-neutral communication interface between mobile robots and a central fleet control, published with message definitions and schemas.",
          physicalExample:
            "A compatible robot reports versioned state and receives an order whose identity, route content, actions, and updates follow the selected VDA 5050 release.",
        },
        {
          term: "Fleet adapter",
          meaning:
            "A bridge that translates between Open-RMF task and traffic behavior and the command and state API of a particular robot fleet.",
          physicalExample:
            "The adapter converts an RMF destination into vendor coordinates and later reports position, battery, interruption, and completion through RMF update handles.",
        },
        {
          term: "WMS/WES",
          meaning:
            "Warehouse systems that own inventory, orders, workflow, or execution intent above the mobile-robot control layer.",
          physicalExample:
            "The WMS asks to move pallet P-412 from receiving to storage but does not publish wheel velocity or certify the robot’s protective stop.",
        },
        {
          term: "PLC handshake",
          meaning:
            "A bounded sequence of requests, interlocks, acknowledgments, and result states used to coordinate a robot with industrial equipment.",
          physicalExample:
            "The robot requests conveyor transfer, waits for ready, performs the permitted exchange, and requires a completed acknowledgment before closing the mission step.",
        },
        {
          term: "Correlation identity",
          meaning:
            "A stable identifier mapping one business request to its mission, fleet order, robot execution, equipment interaction, and evidence records.",
          physicalExample:
            "MOVE-412 maps to mission M-88, robot order O-31, conveyor cycle C-904, and trace T-5 without pretending those domain IDs are interchangeable.",
        },
      ],
      physicalExamples: [
        {
          title: "Warehouse translator cards",
          scenario:
            "Arrange cards for WMS request, FleetOps mission, RMF task, vendor order and state, robot navigation, and PLC conveyor cycle; draw the identity and acknowledgment passed at each boundary.",
          lookFor:
            "Every card owns a different decision and state model, so cancellation, retry, and completion need explicit translation rather than one shared `done` flag.",
        },
        {
          title: "International parcel handoff",
          scenario:
            "A parcel keeps a customer order, carrier tracking number, customs declaration, local delivery job, and locker code through several organizations.",
          lookFor:
            "The identifiers correlate one physical journey but retain separate owners, versions, acknowledgments, and failure handling, just like layered robot and equipment systems.",
        },
      ],
      workedExample: {
        title: "Reconcile a retried warehouse move and late equipment response",
        setup:
          "The WMS sends business key MOVE-412 three times after losing acknowledgments. The robot-state freshness limit is 1.0 second. A conveyor handshake has a 1.2-second completion limit, but the observed response arrives after 1.6 seconds.",
        steps: [
          "Use MOVE-412 as the idempotency key at the mission boundary and verify all three deliveries resolve to one mission identity rather than three allocations.",
          "Map that mission to one current fleet or VDA order identity while preserving any legitimate version or update identity separately from the business key.",
          "Reject robot state aged 2.4 seconds because `2.4 s > 1.0 s`; mark the robot unavailable or degraded according to the declared contract instead of allocating from stale pose and battery.",
          "Start the conveyor step only after the approved ready state, then time out because `1.6 s > 1.2 s`; preserve the late message without relabelling the step successful.",
          "Issue the defined cancel or reconcile transition, confirm robot and equipment states independently, and require a fresh command before any retry.",
          "Trace MOVE-412 through mission, fleet order, robot execution, PLC cycle, timeout, reconciliation, and final disposition so another reviewer can explain every duplicate and late event.",
        ],
        result:
          "Three business deliveries create one mission, stale robot state cannot win work, and a late conveyor acknowledgment produces a visible bounded exception rather than false completion.",
        takeaway:
          "Interoperability depends on state and failure semantics across owners, not merely on messages that validate against a schema.",
      },
      handsOn: {
        setup:
          "Build a software-only adapter rehearsal using versioned fixtures or a local mock at the external boundary; it must never connect to or command real warehouse machinery.",
        steps: [
          "Draw an ownership and sequence diagram from WMS/WES request through FleetOps, Open-RMF or VDA-facing adapter, vendor robot API, PLC equipment handshake, terminal evidence, and cancellation.",
          "Choose the exact VDA 5050 v3 release or Open-RMF adapter API under test, save its schema or interface identity, and list mandatory fields, optional features, maps, coordinates, actions, and error assumptions used.",
          "Implement one narrow versioned adapter fixture that preserves business, mission, order, robot, equipment, and trace identities instead of converting them into one ID.",
          "Test duplicate request, unsupported action, stale state, partial order or route update, wrong coordinate transform, blocked PLC acknowledgment, reconnect, and explicit cancellation.",
          "For every case, record the owning component, received and emitted version, freshness, acknowledgment, terminal state, and whether human or automated reconciliation is required.",
          "Publish an interoperability matrix of supported features, vendor extensions, untested options, traffic ownership, safety boundary, and acceptance result; do not claim universal compatibility.",
        ],
        observe:
          "Schema-valid messages still fail when versions, optional actions, map transforms, freshness, retry ownership, or completion semantics disagree.",
        doneWhen:
          "The fixture detects all eight planted boundary defects, one request remains one mission through retries, cancellation reconciles every domain, and the matrix states unsupported behavior without hiding it.",
      },
      jobConnection: {
        roles: [ROLE_FLEET, ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Integrate warehouse intent, Open-RMF task and traffic coordination, VDA 5050 robot communication, and a bounded equipment handshake while preserving identities, freshness, cancellation, audit evidence, and independent safety ownership.",
        interviewPrompt:
          "Map WMS, WES, Open-RMF, VDA 5050, a vendor navigation stack, and a PLC boundary. Explain who owns each decision, how duplicate and stale messages are handled, and why protocol conformance is not universal interoperability or safety approval.",
      },
      commonMistakes: [
        {
          mistake: "Claiming VDA 5050 support means every robot and master control will interoperate automatically.",
          correction:
            "Test the exact versions, optional features, maps, coordinate rules, actions, transport, charging, errors, extensions, traffic ownership, and acceptance semantics between the chosen products.",
        },
        {
          mistake: "Letting a fleet adapter silently become the owner of business completion or safety.",
          correction:
            "Keep WMS/WES intent, fleet coordination, vendor execution, equipment control, and qualified safety functions under explicit owners with translated acknowledgments.",
        },
        {
          mistake: "Using one identifier and one `completed` value across every domain.",
          correction:
            "Preserve domain identities and state machines, correlate them in an audit record, and reconcile timeout, cancellation, late messages, and partial completion explicitly.",
        },
      ],
      checkQuestions: [
        {
          question: "What does an Open-RMF fleet adapter do?",
          answer:
            "It supplies robot and fleet state to RMF and translates RMF task, traffic, navigation, stop, and action requests into the specific vendor API and coordinates.",
        },
        {
          question: "Why is a schema-valid VDA 5050 message not enough for interoperability?",
          answer:
            "Products can still disagree about version, optional actions, map conventions, update rules, charging, traffic ownership, vendor extensions, errors, and acceptance behavior.",
        },
        {
          question: "Who should decide that a conveyor transfer succeeded?",
          answer:
            "The declared equipment handshake and owning control system must provide the required result; FleetOps correlates it but must not infer success from elapsed time or robot arrival alone.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The day requires an ownership-and-sequence artifact with domain identities and acknowledgments; the generic system visual cannot faithfully encode VDA, RMF, WMS/WES, vendor, PLC, and safety authority.",
      },
    },
    {
      dayId: 118,
      mentalModel:
        "Robot safety is an independently engineered envelope: the application may request motion, but validated protective functions decide when energy or motion is permitted and how restart is controlled.",
      explanation: [
        "ISO 3691-4:2023 addresses safety requirements and verification for driverless industrial trucks and their systems, including AGVs and AMRs, and recognizes that the operating zone materially affects safe operation. ISO 13849-1:2023 provides a methodology for designing and integrating safety-related parts of control systems; it does not choose the required safety functions or performance level for a particular application. Obtain the applicable standards and local requirements, then involve a qualified machinery-safety professional.",
        "An emergency stop is a complementary protective measure for an emergency, not the normal cycle stop, isolation procedure, or universal answer to every hazard. Safe Torque Off prevents torque-producing energy as defined by the drive function but does not necessarily apply a brake, prevent gravity motion, or establish a complete safe state. A normal ROS command, mission cancellation, or navigation stop can be valuable operational behavior, yet it is not automatically safety-rated or independent of the failure it is meant to control.",
        "Protective fields and zones should be derived from risk assessment, validated sensing and control architecture, worst credible speed and load, floor and slope, detection and control latency, stopping performance, measurement uncertainty, and required margins. An outer field may request reduced speed and an inner field may trigger a protective stop, but names and behavior depend on the actual safety design. Releasing an E-stop or clearing a field removes one stop condition; it must not cause unexpected automatic restart.",
        "Use stopping arithmetic only to expose variables and test assumptions. The simple constant-deceleration estimate `d = v·t + v²/(2a)` omits jerk, controller and network tails, sensor geometry, brake variation, tire and floor effects, slope, payload, uncertainty, and standards-required margins. Measure the real system under qualified procedures before setting protective distances, and treat software simulation or this calculation as awareness evidence rather than certification.",
      ],
      keyTerms: [
        {
          term: "Risk assessment",
          meaning:
            "The documented process of identifying tasks and hazards, estimating and evaluating risk, selecting controls, and reviewing residual risk across intended use and foreseeable misuse.",
          physicalExample:
            "The team examines normal delivery, charging, jam recovery, cleaning, maintenance, manual movement, and a pedestrian entering an aisle before selecting safeguards.",
        },
        {
          term: "Emergency stop",
          meaning:
            "A manually initiated emergency function intended to avert or reduce an arising hazard, designed and validated within the applicable safety architecture.",
          physicalExample:
            "A reachable red actuator triggers the declared emergency response, latches, reports diagnostics, and requires deliberate reset without restarting motion.",
        },
        {
          term: "Safe Torque Off",
          meaning:
            "A drive safety function that prevents torque-producing energy, subject to its specified architecture, limitations, and validation.",
          physicalExample:
            "STO can remove motor torque while a vertical load may still need a separately engineered brake or support against gravity.",
        },
        {
          term: "Protective field",
          meaning:
            "A monitored region whose intrusion triggers a defined safety-related response under specified sensing, speed, and operating conditions.",
          physicalExample:
            "A validated scanner field causes the AMR’s protective-stop function before a person can reach the hazardous motion.",
        },
        {
          term: "Reset interlock",
          meaning:
            "The rule that clearing or resetting a protective condition restores readiness only and does not itself command hazardous motion.",
          physicalExample:
            "After an E-stop is released, an operator inspects the area, performs a deliberate reset, and issues a separate new start command.",
        },
      ],
      physicalExamples: [
        {
          title: "Nested paper safety fields",
          scenario:
            "Place an unpowered cardboard AMR inside inner and outer paper boundaries. Move a person token toward it while separate cards show nominal, reduced-speed request, protective stop, reset-required, and ready states.",
          lookFor:
            "Crossing a boundary changes the declared state, but clearing it never moves the token; readiness and a new motion command remain separate.",
        },
        {
          title: "Vertical load after torque removal",
          scenario:
            "Hold a book with a string over a pencil pulley, then support it on the table before loosening the drive string; do not suspend weight over hands or feet.",
          lookFor:
            "Removing the pulling torque does not inherently hold a gravity-loaded axis, illustrating why STO alone may not define the whole mechanical safe state.",
        },
      ],
      workedExample: {
        title: "Use a stop estimate to identify evidence still missing",
        setup:
          "For an awareness calculation only, an AMR travels at 0.8 m/s, assumed reaction time is 0.18 seconds, and assumed constant deceleration is 1.2 m/s².",
        steps: [
          "Calculate reaction distance as `v × t = 0.8 × 0.18 = 0.144 m`.",
          "Calculate ideal braking distance as `v² / (2a) = 0.8² / (2 × 1.2) = 0.64 / 2.4 ≈ 0.267 m`.",
          "Add the simplified terms: `0.144 + 0.267 ≈ 0.411 m` before any margin, uncertainty, field geometry, or system-specific requirement.",
          "List missing evidence: worst credible payload, floor and slope, speed tolerance, sensor and control tails, brake variability, tire condition, battery state, jerk, measurement error, and applicable standard margins.",
          "Map the related protective function to detection, safety-related logic, actuator response, diagnostic coverage, safe state, reset, and qualified validation method rather than assigning it to the FleetOps application.",
          "Label 0.411 m as an illustrative lower-information estimate only and prohibit its use as a protective-field setting until the complete qualified design and measured stopping validation are approved.",
        ],
        result:
          "The arithmetic exposes a nominal 0.411 m estimate and, more importantly, a concrete list of evidence that prevents it from becoming an unsafe design distance.",
        takeaway:
          "A transparent calculation supports questions; it never replaces risk assessment, safety architecture, standards application, measurement, margin, or qualified validation.",
      },
      handsOn: {
        setup:
          "Work only in simulation or with an unpowered diagram and cardboard layout. Do not open safety circuits, change scanner fields, bypass interlocks, energize drives, or validate a real protective function.",
        steps: [
          "Create a task-based hazard map for normal travel, docking, transfer, charging, jam clearing, cleaning, maintenance, and foreseeable pedestrian interaction.",
          "Draw operating, warning or awareness, reduced-speed, protective-stop, maintenance, and exclusion regions only as proposed concepts, with assumptions and responsible reviewer beside each.",
          "Build a safety-function table containing trigger, sensing channel, safety-related logic, final element, intended safe state, diagnostics, reset, proof method, owner, and unverified dependencies.",
          "Use the illustrative stop equation at three speeds to show the quadratic braking term, then mark every missing real-world factor and refuse to set a field distance from the worksheet.",
          "Rehearse simulated E-stop, protective-field intrusion, stale safety status, reset, and new-command sequences; assert that clearing or reset alone never restarts motion.",
          "Send the package to a qualified machinery-safety reviewer with the exact AMR, operating zone, payload, tasks, jurisdiction, standards editions, assumptions, and unresolved questions.",
        ],
        observe:
          "The exercise reveals shared-cause paths, ambiguous resets, missing diagnostics, and physical measurements that application logs or ideal simulation cannot validate.",
        doneWhen:
          "The hazard and function tables expose every assumption, simulated reset cannot restart motion, calculations are clearly bounded, and all real safety decisions remain assigned to qualified review.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Support an AMR safety review by supplying traceable application states, fault timing, reset semantics, operating-zone assumptions, and simulation evidence while keeping safety-function design, performance-level selection, and physical validation with qualified owners.",
        interviewPrompt:
          "Explain why a Nav2 stop or mission cancel is not an E-stop, what STO does and may not do, why reset cannot restart motion, and how you would prevent an illustrative stopping calculation from becoming an unvalidated scanner-field setting.",
      },
      commonMistakes: [
        {
          mistake: "Calling an application-level stop command safety-rated because it usually stops the robot.",
          correction:
            "Describe its operational value accurately and rely on the independently engineered, validated, and monitored protective architecture required by the risk assessment.",
        },
        {
          mistake: "Assuming STO always brakes and holds every mechanism.",
          correction:
            "Review the drive and mechanical system: torque prevention may require separate braking, gravity support, isolation, or other safety functions to reach the intended safe state.",
        },
        {
          mistake: "Using `d = v·t + v²/(2a)` as the protective-field distance.",
          correction:
            "Treat it as an illustrative estimate, then apply the applicable standards, qualified risk assessment, measured worst-case stopping performance, uncertainty, geometry, and required margins.",
        },
        {
          mistake: "Allowing E-stop release or zone clearance to resume an interrupted mission automatically.",
          correction:
            "Require area review and deliberate reset to readiness, followed by a separate authorized command under the approved restart procedure.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the scope difference between ISO 3691-4 and ISO 13849-1?",
          answer:
            "ISO 3691-4 addresses driverless industrial trucks and systems; ISO 13849-1 provides a methodology for safety-related control-system parts but does not select the application’s required safety functions or performance levels.",
        },
        {
          question: "Why does STO not necessarily mean the mechanism is motionless and held?",
          answer:
            "It prevents torque-producing energy as specified, but gravity, stored energy, external force, or coasting may require braking, support, isolation, or another engineered function.",
        },
        {
          question: "What should happen after a protective condition is cleared?",
          answer:
            "The system may become eligible for deliberate reset to readiness, but it must not restart hazardous motion until the separate approved start conditions and command are satisfied.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A layered safety-boundary visual materially separates application intent, monitored zones, protective response, final motion or energy control, reset, and the prohibited automatic-restart path.",
      },
    },
    {
      dayId: 119,
      mentalModel:
        "Commissioning is a controlled transfer of evidence and responsibility: factory proof, site-specific proof, unresolved deviations, trained ownership, rollback, and support readiness must agree before production use.",
      explanation: [
        "Factory Acceptance Testing exercises the integrated system against agreed requirements before delivery or deployment in the supplier-controlled environment. Site Acceptance Testing repeats the relevant acceptance evidence with the customer’s utilities, network, maps, interfaces, environmental conditions, payloads, workflows, safeguards, and operators. A pleasant factory demo or a successful site smoke mission is not FAT or SAT unless the frozen matrix, witnesses, configurations, measurements, deviations, and approval rules are present.",
        "Commissioning includes installation verification, power and network checks, coordinate frames and maps, calibrations, payload and speed configurations, WMS/WES and PLC handshakes, fleet capacity, charging, user roles, safety controls, operator and maintenance training, backups, recovery, rollback, spares, monitoring, escalation, and ownership handoff. Site acceptance should occur before initial production startup, and changed conditions later require impact review and appropriate revalidation rather than assuming the original signature lasts forever.",
        "Acceptance is requirement-based, not a percentage contest. Fifty passing convenience cases cannot cancel one failed protective function, data-loss control, or mission-critical rollback. Classify blockers, deviations, conditional acceptance, and residual risks before the run; require named authority for each disposition. A SAT pass after a fix does not erase the original FAT failure—keep the defect, containment, causal evidence, corrective change, and regression link intact.",
        "An incident record separates observation from inference. Preserve timeline, versions, configuration, commands, logs, traces, bags, site conditions, impact, containment, and recovery. Call a cause “root cause” only when evidence explains the failure and corrective action prevents the relevant recurrence. If evidence is missing, state competing hypotheses and keep the affected requirement blocked. The FleetOps gate closes only when required evidence, safe-failure tests, rollback drill, training, handoff, and go/no-go authority are complete.",
      ],
      keyTerms: [
        {
          term: "Factory Acceptance Test",
          meaning:
            "A witnessed, requirement-linked evaluation of the integrated system in the supplier or factory-controlled environment before shipment or site release.",
          physicalExample:
            "The frozen FleetOps bundle runs nominal, degraded, rollback, and interface cases against the agreed simulated and bench matrix with signed deviations.",
        },
        {
          term: "Site Acceptance Test",
          meaning:
            "A witnessed evaluation that the installed system satisfies agreed requirements with the site’s actual utilities, interfaces, environment, workflows, and operating constraints.",
          physicalExample:
            "The customer site checks Wi-Fi coverage, mapped aisles, charger access, conveyor timing, payloads, operator roles, safeguards, and recovery using the approved matrix.",
        },
        {
          term: "Commissioning",
          meaning:
            "The controlled process of verifying installation, configuration, interfaces, safety and operational readiness, training, documentation, support, and responsibility transfer.",
          physicalExample:
            "The release pack includes maps, calibration, backups, rollback, spare and escalation paths, operator training, maintenance ownership, and a signed production-start decision.",
        },
        {
          term: "Deviation",
          meaning:
            "A documented difference from an agreed requirement or procedure with impact, containment, owner, expiry, and authorized disposition.",
          physicalExample:
            "A non-critical dashboard label is accepted temporarily with a dated correction, while a failed protective response remains an unconditional blocker.",
        },
        {
          term: "Corrective-action verification",
          meaning:
            "Evidence that a change addresses the supported cause and that focused plus broader regression does not introduce unacceptable behavior.",
          physicalExample:
            "A stale-state race fix passes the original failure replay, adjacent reconnect cases, full mission regression, and the signed SAT scenario.",
        },
      ],
      physicalExamples: [
        {
          title: "Theater rehearsal and opening night",
          scenario:
            "A cast rehearses the complete show on a practice stage, then checks the destination venue’s lighting, exits, rigging, cues, staff roles, and emergency procedures before admitting an audience.",
          lookFor:
            "Factory rehearsal proves integration under controlled conditions; the venue still introduces interfaces and responsibilities that require witnessed site evidence.",
        },
        {
          title: "House key and maintenance handoff",
          scenario:
            "A paper handoff pack contains inspection results, open defects, utility shutoffs, warranty contacts, spare keys, maintenance schedule, emergency numbers, and signatures.",
          lookFor:
            "Possession of the key is not operational readiness; evidence, unresolved items, knowledge, recovery, and ownership must transfer together.",
        },
      ],
      workedExample: {
        title: "Decide a gate with high pass percentage and two critical failures",
        setup:
          "The FAT matrix contains 55 required cases. Fifty-three pass, one safety-related reset case fails, and one rollback case corrupts mission configuration. After correction, the site later records 55 of 55 SAT cases passing.",
        steps: [
          "Calculate the initial FAT percentage as `53 / 55 × 100 ≈ 96.4%`, then keep the two failures visible by requirement and criticality rather than rounding the release to success.",
          "Apply the predeclared gate: the reset and rollback cases are blocking, so shipment or production release is no-go despite the 96.4% total.",
          "Contain the issues, preserve both failure bundles, document observed facts, investigate supported causes, and link each corrective change to its original requirement, risk, and result.",
          "Rerun each exact failure case plus adjacent reset, configuration migration, canary, rollback, and complete-mission regression under the new immutable bundle.",
          "At site, execute all 55 SAT cases with actual network, maps, payload, equipment emulators or approved interfaces, roles, training, backup, recovery, and witness records.",
          "Record the final go decision only after 55 of 55 site cases and every non-test commissioning item pass; retain the original FAT failures and corrective history in the signed package.",
        ],
        result:
          "The system moves from no-go at 96.4% FAT to an evidence-supported site decision only after both critical failures are corrected, regressed, and preserved in history.",
        takeaway:
          "Acceptance authority follows critical requirements and complete commissioning evidence, never the comfort of a high aggregate pass rate.",
      },
      handsOn: {
        setup:
          "Run a simulated commissioning rehearsal for the FleetOps lab. Label all physical-site, qualified safety, and unavailable HIL steps as witnessed placeholders or blockers rather than pretending they ran.",
        steps: [
          "Generate FAT and SAT matrices directly from the traceability table, naming environment-specific cases, witnesses, immutable bundle identities, required artifacts, blocker classes, and deviation authority.",
          "Run the available FAT suite, including nominal missions, duplicate requests, stale state, adapter restart, blocked route, equipment timeout, safe cancellation, canary rejection, and complete-bundle rollback.",
          "Create a site-delta checklist for Wi-Fi and time service, maps and frames, floor and payload, chargers, WMS/WES and PLC interfaces, user roles, safeguards, training, backups, monitoring, spares, escalation, and support ownership.",
          "Inject one site-only failure, preserve facts and impact, contain it, write competing hypotheses, prove a supported cause where possible, implement one corrective action, and rerun focused plus broad regression.",
          "Rehearse rollback from the candidate application, configuration, schema, calibration, and interface bundle to the known-good bundle; verify terminal mission consistency and audit history after recovery.",
          "Publish the signed-style gate record with passed, failed, blocked, and not-applicable counts; deviations; unresolved risks; training and handoff status; artifact links; and explicit go, conditional-go, or no-go authority.",
        ],
        observe:
          "The site-delta review exposes dependencies absent from the factory, and the incident rehearsal tests whether the team can preserve evidence and recover without rewriting history.",
        doneWhen:
          "Every available requirement has witnessed evidence, unavailable physical and safety obligations remain visibly blocked, rollback restores a coherent bundle, and the gate decision follows predeclared authority.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_FLEET, ROLE_SOFTWARE],
        workExample:
          "Own a customer commissioning package that ties factory and site matrices to requirements, coordinates robot, fleet, network, WMS/WES, PLC, safety, operator, support, and rollback owners, and keeps incidents and deviations evidence-complete.",
        interviewPrompt:
          "FAT passes 53 of 55 cases and SAT later passes everything. Explain why release may still be blocked, what site acceptance adds, how you preserve the two failures, and what must be handed over before production starts.",
      },
      commonMistakes: [
        {
          mistake: "Approving release from aggregate pass percentage while a critical requirement fails.",
          correction:
            "Apply predeclared requirement criticality and blocker rules; preserve failed evidence and require authorized corrective-action verification before reconsidering the gate.",
        },
        {
          mistake: "Treating SAT as a repeat of the easiest factory smoke test.",
          correction:
            "Exercise the customer’s actual utilities, network, environment, maps, payloads, interfaces, safeguards, workflows, roles, recovery, and witness requirements.",
        },
        {
          mistake: "Naming the first plausible explanation as root cause.",
          correction:
            "Separate facts from hypotheses, preserve missing evidence, reproduce where possible, and promote a cause only when the corrective action explains and prevents the relevant recurrence.",
        },
        {
          mistake: "Rolling back only the application while leaving incompatible configuration or schema changes.",
          correction:
            "Version and rehearse rollback for the complete application, configuration, schema, calibration, firmware, and interface bundle, including data and mission reconciliation.",
        },
      ],
      checkQuestions: [
        {
          question: "What does SAT add after a successful FAT?",
          answer:
            "It verifies the installed system against agreed requirements with the site’s real utilities, networks, environment, interfaces, payloads, workflows, safeguards, operators, and witnesses.",
        },
        {
          question: "Should a later SAT pass remove an earlier FAT failure record?",
          answer:
            "No. Keep the original failure, containment, cause evidence, corrective change, focused and broad regression, and final disposition linked.",
        },
        {
          question: "When should an incident report say the root cause is unknown?",
          answer:
            "When available evidence does not uniquely explain the failure or a corrective action has not demonstrated prevention; list facts, containment, hypotheses, and missing evidence instead.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "The FAT→corrective regression→SAT→commissioning→go/no-go evidence chain materially clarifies why an aggregate score or successful site demo cannot skip a blocking requirement or handoff obligation.",
      },
    },
  ],
} satisfies ChapterContent;
