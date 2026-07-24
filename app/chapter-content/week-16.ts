import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";

export const week16Content = {
  week: 16,
  title: "Operate a two-robot fleet across edge, cloud, and operator boundaries",
  purpose:
    "Turn two simulated robots into a small but production-shaped fleet system whose authority, state, and evidence survive retries, delays, disconnects, overload, and bad releases. This chapter places work at the correct robot, edge, fleet, or cloud layer; models missions and shared traffic; preserves meaning across REST, WebSocket, and ROS 2 gateways; processes durable events under backpressure; builds a stale-aware operator HMI; rehearses canary rollback; and closes with a fault-injected acceptance run tied to logs, metrics, traces, and declared service objectives.",
  prerequisites: [
    "Complete the ROS 2 graph, QoS, lifecycle, launch, simulation, navigation, behavior-tree, cancellation, and safe-recovery work from Weeks 5–12.",
    "Bring forward two simulated mobile robots, a simple map with one shared narrow resource and two parking or charging locations, and one repeatable navigation mission that already succeeds from a documented command.",
    "Read JSON, follow a state-transition table, calculate rates and percentages, and use a local Python or TypeScript service plus a browser UI without connecting the exercises to an unsupervised physical robot.",
    "Keep robot-local collision handling, command limits, watchdogs, and stop behavior independent of the browser, fleet service, and internet; this chapter coordinates work but does not create a safety-rated control system.",
  ],
  outcomes: [
    "Assign control, mission, coordination, history, update, and operator responsibilities to robot, edge, fleet, or cloud layers with explicit failure behavior at every boundary.",
    "Implement a mission lifecycle and feasible two-robot allocator that accounts for capability, battery reserve, docking, shared-space coordination, cancellation, disconnects, and deadlock escape.",
    "Design a versioned mission contract whose REST acceptance, WebSocket state stream, and ROS 2 action execution preserve identity, units, freshness, idempotency, cancellation, and one correlated terminal outcome.",
    "Use PostgreSQL as durable mission history, Redis only for expiring coordination or live views, and keyed Kafka events with sequence checks, idempotent consumers, bounded queues, and visible lag.",
    "Build an operator HMI that separates requested, accepted, and measured state; exposes stale video, transforms, and telemetry; and uses authorization, leases, local timeouts, and an independently verifiable stop path.",
    "Package services and configuration as immutable release inputs, stage a canary, enforce health gates, and prove a compatible rollback of code, configuration, schema, and operating procedure.",
    "Run a frozen fleet scenario matrix with named faults, correlate logs, metrics, traces, and robot evidence, and report every objective as pass or fail without hiding unsuccessful missions behind averages.",
  ],
  jobTargets: [
    ROLE_FLEET,
    ROLE_HMI,
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
  ],
  sources: [
    {
      label: "Open-RMF — Fleet Adapter Tutorial",
      url: "https://osrf.github.io/ros2multirobotbook/integration_fleets_adapter_tutorial.html",
      useFor:
        "Maintainer explanation of the fleet adapter boundary, task bidding, robot status and battery updates, navigation graphs, coordinate transforms, robot API callbacks, and REST-based fleet-manager integration.",
    },
    {
      label: "ROS 2 Jazzy — Topics, Services, and Actions",
      url: "https://docs.ros.org/en/jazzy/How-To-Guides/Topics-Services-Actions.html",
      useFor:
        "Official distinction among continuous topics, short request-response services, and long-running actions with goal, feedback, cancellation, and result, plus subscription-side message-age and period statistics.",
    },
    {
      label: "RFC 9110 — HTTP Semantics",
      url: "https://www.rfc-editor.org/rfc/rfc9110.html",
      useFor:
        "Primary HTTP method and status semantics, including the formal meaning of idempotence, why POST is not inherently idempotent, retry limits, resource creation, and the boundary of an HTTP response.",
    },
    {
      label: "Apache Kafka 4.3 — Introduction and Core Concepts",
      url: "https://kafka.apache.org/43/getting-started/introduction/",
      useFor:
        "Official event, key, topic, partition, producer, consumer, durability, retention, and ordering semantics, including the guarantee that order applies to records read from one topic-partition.",
    },
    {
      label: "OpenTelemetry — Signals",
      url: "https://opentelemetry.io/docs/concepts/signals/",
      useFor:
        "Project definitions of traces as request paths, metrics as runtime measurements, logs as event records, and propagated context used to correlate a distributed fleet mission.",
    },
  ],
  days: [
    {
      dayId: 106,
      mentalModel:
        "A fleet is four cooperating control rooms with different clocks: the robot protects motion, the edge keeps local work alive, fleet services coordinate peers, and cloud services remember and distribute.",
      explanation: [
        "Place a responsibility where its worst acceptable delay and failure consequence can be met. Motor control, protective stops, and the final command watchdog stay close to sensors and actuators because their deadlines cannot depend on Wi-Fi or the internet. An edge computer may run perception, navigation supervision, a robot adapter, and bounded local recovery. A fleet service allocates missions and coordinates shared resources. Cloud services can hold history, analytics, user administration, and update artifacts, but losing the cloud must not remove the robot's ability to stop safely.",
        "A boundary is more than a network arrow. Each robot-to-edge, edge-to-fleet, and fleet-to-cloud exchange needs an owner, authenticated peer identity, schema version, unit and frame convention, timestamp and clock source, freshness limit, retry rule, and disconnected behavior. Commands additionally need authority, expiry, acknowledgment, cancellation, and a terminal result. Telemetry can sometimes be sampled or coalesced; a stop request or mission transition cannot be silently treated as disposable display data.",
        "Different rates expose bad placement. A 250 Hz motor loop has a 4 ms period, while a 20 Hz planner has 50 ms and a 1 Hz cloud heartbeat has one second. A 120 ms cloud round trip spans 30 motor cycles. It can be acceptable for uploading a summary, yet it is already too late for the motor loop. Latency averages are insufficient: choose the layer from a bounded deadline and define what happens when the bound is exceeded.",
        "Disconnected operation needs a deliberate authority model. A robot that loses fleet contact may finish a locally safe segment, pause at a named holding point, or stop and wait, depending on risk and site policy. It must not invent new missions, continue forever from stale instructions, or accept commands from two controllers. Reconnection starts with identity and generation checks, a fresh authoritative snapshot, and reconciliation of unfinished work before ordinary event flow resumes.",
      ],
      keyTerms: [
        {
          term: "Failure domain",
          meaning:
            "A part of the system that can become unavailable or incorrect without automatically taking every other part down with it.",
          physicalExample:
            "A cloud analytics outage removes remote charts while the robot-local watchdog and edge mission executor continue their declared safe behavior.",
        },
        {
          term: "Edge computer",
          meaning:
            "Compute located on or near the robot site that can make latency-sensitive operational decisions without a cloud round trip.",
          physicalExample:
            "A cabinet computer hosts the fleet adapter and map service so two robots can report state even during an internet outage.",
        },
        {
          term: "Control plane",
          meaning:
            "The path that defines desired work, policy, configuration, or allocation rather than carrying every high-rate physical measurement.",
          physicalExample:
            "The fleet service assigns mission M-204 to robot R2, while wheel odometry remains on the robot-local data path.",
        },
        {
          term: "Freshness limit",
          meaning:
            "The maximum permitted age of state or a command before the receiver must reject, degrade, or request a new snapshot.",
          physicalExample:
            "A pose update older than two seconds is marked unavailable for dispatch even if its coordinates look numerically valid.",
        },
        {
          term: "Authority lease",
          meaning:
            "A time-bounded grant naming which controller may issue a class of commands, renewed only while its conditions remain valid.",
          physicalExample:
            "The edge executor may command navigation for five seconds at a time; loss of renewal makes the robot reject later commands from that session.",
        },
      ],
      physicalExamples: [
        {
          title: "Warehouse internet cable removed",
          scenario:
            "Two simulated carts are moving between local stations when the site's internet link is removed, but the local network, edge computer, and robot processes remain powered.",
          lookFor:
            "Robots retain local stop and watchdog behavior, the edge follows the predeclared offline mission rule, and cloud history shows a gap rather than pretending the robots are current.",
        },
        {
          title: "Two supervisors reach one cart",
          scenario:
            "A fleet service reconnects while an edge recovery session still believes it owns robot R1, so both attempt to send a new navigation command.",
          lookFor:
            "Generation and lease checks allow one authority, reject the other command explicitly, and require state reconciliation before ordinary scheduling resumes.",
        },
      ],
      workedExample: {
        title: "Place seven FleetOps responsibilities by deadline and outage behavior",
        setup:
          "A two-robot lab has motor control at 250 Hz, local planning at 20 Hz, mission allocation within two seconds, a 10 Hz robot-state feed, minute-scale history uploads, an operator console, and signed update artifacts.",
        steps: [
          "Convert rates to periods: motor control gets `1 / 250 s = 4 ms`, local planning gets `1 / 20 s = 50 ms`, and robot state gets `1 / 10 s = 100 ms` between expected samples.",
          "Place motor control and the final motion watchdog on the robot because a 120 ms network excursion would consume 30 motor periods before a remote response returned.",
          "Place planning supervision and the robot-facing adapter at the edge so an internet outage does not remove local navigation feedback, stop, or a bounded recovery decision.",
          "Place cross-robot mission allocation and shared-resource coordination in the fleet service because both robots need one consistent owner for the aisle and charger decisions.",
          "Place durable history, fleet-wide analytics, identity administration, and update storage in the cloud, while keeping cached approved artifacts and rollback inputs available at the site.",
          "For every arrow, add identity, schema, timestamp, freshness, timeout, retry, and offline rules; add authority, expiry, acknowledgment, cancel, and terminal result to command arrows.",
          "Remove each connection in turn and accept the architecture only when observed behavior matches the table without losing robot-local protective behavior or creating two command authorities.",
        ],
        result:
          "Fast and safety-relevant behavior remains robot-local, site operation survives a bounded cloud outage, fleet-wide decisions still have one owner, and every disconnection has an observable state instead of an implicit hope.",
        takeaway:
          "Layer names do not make an architecture robust; deadline placement, single authority, and tested loss behavior at every contract do.",
      },
      handsOn: {
        setup:
          "Use the two-robot simulator and four labelled local processes or cards named robot, edge, fleet, and cloud. Keep all commands inside simulation.",
        steps: [
          "Inventory mission request, velocity command, pose, battery, map, video, health, audit record, configuration, and update artifact; record producer, consumer, rate, unit, and consequence of staleness.",
          "Draw the four layers and place each item according to its deadline, required availability, and authority rather than according to which programming language currently implements it.",
          "Create a boundary table with schema version, identity, timestamp source, freshness limit, timeout, retry budget, acknowledgment, and disconnected behavior for every connection.",
          "Run one nominal simulated mission and attach a correlation ID that remains visible from API acceptance through robot-side terminal state.",
          "Disconnect robot-to-edge, edge-to-fleet, and fleet-to-cloud links one at a time; record the exact detection time, state transition, allowed local behavior, and operator indication.",
          "Reconnect each link with one deliberately stale command and one old generation number; verify both are rejected before a fresh snapshot restores service.",
        ],
        observe:
          "The same network failure has different consequences at different layers, and state that lacks freshness or authority metadata becomes unsafe to act on even when its payload parses correctly.",
        doneWhen:
          "The architecture table predicts all three disconnection trials, only one controller owns each command class, stale or prior-generation commands are rejected, and cloud loss never removes the simulated robot's local stop path.",
      },
      jobConnection: {
        roles: [
          ROLE_FLEET,
          ROLE_HMI,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Partition a commercial AMR stack across on-robot compute, a site gateway, fleet services, and cloud operations; specify versioned contracts and offline behavior; then reproduce link loss without creating stale operator state or remote dependence in the motion-safety path.",
        interviewPrompt:
          "Draw a robot-edge-fleet-cloud architecture for two AMRs. Defend where control and mission responsibilities live, quantify one timing choice, and explain authority, freshness, and recovery when each network boundary disappears.",
      },
      commonMistakes: [
        {
          mistake: "Putting every decision in the cloud because centralized services are easier to update.",
          correction:
            "Keep decisions whose deadline or safe fallback cannot tolerate internet loss on the robot or site edge, and use cloud services for work whose outage consequence is explicitly acceptable.",
        },
        {
          mistake: "Drawing an arrow labelled telemetry or API without a failure contract.",
          correction:
            "Specify identity, schema, units, clock, freshness, timeout, retry, authority, and disconnected behavior, then remove the link and compare observation with the declared result.",
        },
        {
          mistake: "Letting edge and fleet controllers both resume commands after reconnection.",
          correction:
            "Use one time-bounded authority lease and a generation-aware reconciliation step so prior owners and stale sessions cannot issue new work.",
        },
      ],
      checkQuestions: [
        {
          question: "Why must a 250 Hz motor loop not wait on a 120 ms cloud round trip?",
          answer:
            "The loop has a 4 ms period, so 120 ms spans 30 cycles; the network delay is neither sufficiently small nor bounded for that control deadline.",
        },
        {
          question: "What additional fields turn a data arrow into an operational boundary contract?",
          answer:
            "At minimum peer identity, schema, units and frames, timestamp and clock, freshness, timeout, retry, health, and disconnected behavior; commands also need authority, expiry, acknowledgment, cancellation, and terminal result.",
        },
        {
          question: "What should happen before scheduling resumes after a disconnected edge controller reconnects?",
          answer:
            "Verify identity and generation, establish one current authority, obtain a fresh authoritative snapshot, and reconcile unfinished or terminal work before accepting ordinary deltas or new commands.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A four-layer authority and failure-boundary diagram makes the different clocks, dependencies, and link-loss consequences easier to inspect than a flat component list.",
      },
    },
    {
      dayId: 107,
      mentalModel:
        "A fleet mission is a guarded state machine plus a shared-space promise: allocation chooses a feasible robot, traffic grants bounded access, and every interruption ends in an explicit recoverable state.",
      explanation: [
        "A mission is not one boolean called running. Use states that distinguish request validation, acceptance, queuing, assignment, dispatch, robot execution, blocking, cancellation, success, and failure. Define who may cause each transition and what evidence closes it. A cancel request is only an intention until the executor acknowledges it and measured behavior reaches the declared stopped or safely parked condition. Terminal states are immutable; a late running event must not resurrect a canceled mission.",
        "Allocation begins with feasibility before optimization. Filter robots by capability, payload, map, operating mode, maintenance status, battery reserve, charger commitment, localization quality, and route availability. Only then compare cost such as travel time, expected finish time, or energy. A nearby robot at low state of charge can be an infeasible choice. Record the inputs and allocator version so a later incident can reproduce why the winning robot was selected.",
        "Traffic coordination manages shared resources and planned movement, while robot-local sensing and protective behavior still handle immediate physical hazards. A corridor, lift, door, or charger can be represented by a reservation with owner, time or route scope, expiry, and release rule. Deadlock appears when participants hold resources while waiting cyclically for others. Detect the wait-for cycle or bounded no-progress condition, select a deterministic victim, retreat to a known holding point, and prevent an abandoned reservation from remaining forever.",
        "Docking and charging are missions with preconditions, not magical battery side effects. The system needs a charger compatible with the robot, an approach route, an exclusive occupancy rule, dock detection, charge confirmation, timeout, retry bound, and a safe failure destination. Battery state is an estimate, so use a reserve and uncertainty margin instead of planning to zero. A disconnected robot retains its current local safety behavior while the mission becomes unknown or interrupted until evidence supports a new state.",
      ],
      keyTerms: [
        {
          term: "Mission lifecycle",
          meaning:
            "The allowed states and guarded transitions from an external request through assignment, execution, cancellation, and exactly one terminal result.",
          physicalExample:
            "Delivery M-31 moves from accepted to queued, assigned to R2, running, and succeeded after arrival evidence; it cannot later return to running.",
        },
        {
          term: "Feasible set",
          meaning:
            "The robots that satisfy every hard requirement for a mission before any cost-based ranking is applied.",
          physicalExample:
            "Only the robot with the correct tote interface, current localization, permitted map, and enough battery remains eligible.",
        },
        {
          term: "Reservation",
          meaning:
            "A bounded claim granting one identified participant use of a shared spatial or operational resource under stated release and expiry rules.",
          physicalExample:
            "Robot R1 holds the narrow-aisle token until its rear footprint exits the aisle or the reservation times out into recovery.",
        },
        {
          term: "Deadlock",
          meaning:
            "A no-progress condition in which participants wait on resources held by one another and none can complete without intervention.",
          physicalExample:
            "R1 holds the aisle entrance while waiting for a bay held by R2, and R2 waits for the same aisle to clear.",
        },
        {
          term: "State of charge",
          meaning:
            "An estimate of remaining battery capacity, usually expressed as a percentage and paired with uncertainty and a required reserve.",
          physicalExample:
            "A robot at 25% may be rejected for an 8 m mission when the estimated 8% use would leave it below the 20% reserve.",
        },
        {
          term: "Holding point",
          meaning:
            "A named, verified location where a robot can wait without occupying the contested resource or blocking planned traffic.",
          physicalExample:
            "The losing robot backs into bay H2 before the winning robot receives the aisle reservation.",
        },
      ],
      physicalExamples: [
        {
          title: "Low-battery robot beside the pickup",
          scenario:
            "Robot R1 is 8 m from a parcel at 25% charge; R2 is 12 m away at 70%. The route model estimates one percentage point of charge per metre and requires 20% reserve.",
          lookFor:
            "R1 would finish near 17% and is filtered out before distance ranking, while R2 remains feasible near 58% despite starting farther away.",
        },
        {
          title: "Opposing robots at one aisle",
          scenario:
            "Two floor tokens approach a one-token-wide paper aisle from opposite ends, each already occupying a small entrance zone and waiting for the other to move.",
          lookFor:
            "A wait-for cycle or no-progress timer chooses one victim, releases its claim, sends it to a named bay, and lets only the other robot enter.",
        },
      ],
      workedExample: {
        title: "Allocate a delivery without violating battery reserve",
        setup:
          "Mission M-77 needs payload class tote on map L1. R1 and R2 both support the payload and map. R1 is 8 m away at 25% charge, R2 is 12 m away at 70%, estimated use is 1% per metre, and reserve is 20%.",
        steps: [
          "Validate M-77 once, create its immutable identity, and move it from requested to accepted to queued; do not assign a robot before required fields and cancellation policy pass.",
          "Build the feasible set from hard constraints: both robots satisfy payload, map, localization, and operating-mode requirements.",
          "Estimate R1's finish charge as `25% - 8 × 1% = 17%`; because 17% is below the 20% reserve, remove R1 from the feasible set.",
          "Estimate R2's finish charge as `70% - 12 × 1% = 58%`; it preserves reserve and remains feasible.",
          "Assign M-77 to R2, record the battery inputs and allocator version, and request the route and any required aisle reservation before dispatch.",
          "If R2 disconnects after assignment, mark execution unknown or interrupted, stop allocating conflicting work, and reconcile robot evidence before reassigning M-77.",
          "Close the mission only from one terminal result correlated to M-77; a later duplicate running event is rejected by the state-transition guard.",
        ],
        result:
          "The farther robot wins because it is the only battery-feasible candidate, and disconnect or duplicate events cannot create two active executions or resurrect the completed state.",
        takeaway:
          "Nearest-robot allocation is an optimization shortcut; production allocation first proves the robot can finish the entire mission within every hard constraint.",
      },
      handsOn: {
        setup:
          "Use two simulated robots, one narrow shared lane, two holding points, one charger, and a small deterministic mission-state and allocation program.",
        steps: [
          "Write the allowed mission transitions and guards, including queued cancellation, running cancellation, terminal immutability, disconnect, and evidence required for success.",
          "Describe each robot with capability, map, pose, operating mode, payload state, battery estimate, reserve, charger compatibility, and last-state freshness.",
          "Implement feasibility filtering before a deterministic cost function; log both rejected reasons and the winning cost inputs.",
          "Represent the narrow lane and charger as reservations with owner, scope, acquisition time, expiry, release condition, and recovery action.",
          "Run nominal delivery, incompatible payload, low battery, canceled docking, opposing-lane deadlock, and robot-disconnect cases from fixed inputs.",
          "Restart the allocator during one running mission and verify durable mission state plus current robot evidence prevent duplicate dispatch or a second resource owner.",
        ],
        observe:
          "Hard constraints remove candidates before distance matters, and explicit reservations and transitions reveal deadlock, lost ownership, and cancellation races that a simple available flag hides.",
        doneWhen:
          "Every scenario produces one allowed transition history, one allocator explanation, no overlapping shared-resource owner, a bounded deadlock escape, and exactly one immutable terminal outcome or explicit unresolved state.",
      },
      jobConnection: {
        roles: [
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Implement and review a fleet mission lifecycle, capability-and-energy allocator, shared-resource reservation model, charging workflow, and deterministic deadlock recovery while preserving robot-local protective behavior and a reproducible dispatch explanation.",
        interviewPrompt:
          "Given two robots, one narrow aisle, one charger, and uncertain battery estimates, design allocation and mission states. Explain feasibility versus cost, cancellation races, deadlock recovery, and what you do when the assigned robot disconnects.",
      },
      commonMistakes: [
        {
          mistake: "Assigning the closest robot before checking battery, capability, payload, or route constraints.",
          correction:
            "Construct the feasible set from all hard constraints first, then rank only eligible robots with a reproducible cost function.",
        },
        {
          mistake: "Marking a mission canceled as soon as the API receives the cancel request.",
          correction:
            "Represent cancel-requested and canceling states, obtain executor acknowledgment, and confirm the declared physical or simulated stopped condition before terminal canceled.",
        },
        {
          mistake: "Treating traffic coordination as a replacement for robot-local obstacle protection.",
          correction:
            "Use fleet coordination for planned shared-resource access while keeping validated local sensing, limits, and protective stop behavior independent.",
        },
        {
          mistake: "Allowing a charger or aisle reservation to remain owned after a process restart.",
          correction:
            "Give claims an owner generation, expiry, durable mission link, and reconciliation rule so abandoned reservations fail visibly and recover within a bound.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does R2 win the example even though it is four metres farther from the pickup?",
          answer:
            "R1 would finish at an estimated 17%, below the 20% reserve, so it is infeasible; R2 would finish near 58% and is the only eligible robot.",
        },
        {
          question: "What makes a cancel request different from a canceled terminal state?",
          answer:
            "The request expresses intent; terminal canceled requires the executor to accept or complete cancellation and evidence that execution reached the defined stopped or safely parked condition.",
        },
        {
          question: "How can a fleet break a shared-resource deadlock without improvising?",
          answer:
            "Detect a wait-for cycle or bounded no-progress state, choose a victim by a deterministic rule, release its claim, route it to a verified holding point, and retry within explicit limits.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The executable transition table, reservation ledger, and fixed deadlock cases provide more precise mission-lifecycle evidence than a second generic fleet diagram.",
      },
    },
    {
      dayId: 108,
      mentalModel:
        "A mission crossing REST, WebSocket, and ROS 2 is one numbered parcel with three views: submission accepts it, streaming reports it, and robot execution alone can produce its terminal physical result.",
      explanation: [
        "Choose an interface from its interaction, not from fashion. HTTP REST endpoints fit resource creation, retrieval, and state-changing requests whose responses are bounded. A successful create response means the service accepted or created a mission resource; it does not prove that wheels moved or a parcel arrived. WebSocket carries an ongoing, bidirectional connection useful for operator snapshots, state changes, and acknowledgments. ROS 2 topics carry continuous streams, services suit short request-response operations, and actions suit long-running goals with feedback, cancellation, and a result.",
        "Mission creation needs application-level idempotency because HTTP POST is not inherently idempotent. The client generates one stable idempotency key for one intended mission and reuses it only for retries of the identical canonical request. The server stores the key, request fingerprint, mission identity, and response atomically. A repeated matching request returns the same resource; a reused key with different content is a conflict. This prevents duplicate creation, but downstream consumers still need their own deduplication because delivery and processing retries remain possible.",
        "A gateway preserves semantics, not only JSON field names. Define mission ID, robot ID, correlation and causation IDs, schema version, units, coordinate frame, acquisition timestamp, sequence or revision, command expiry, requested authority, and allowed state transitions. Translate a REST mission into a ROS 2 action goal with a stable correlation, map action feedback into versioned state events, and map cancel intent through the executor. Never convert an API timeout into mission failure unless execution evidence establishes that terminal result.",
        "Reconnect and cancellation are race-prone. A WebSocket subscriber first obtains an authoritative snapshot with a revision, then applies only newer deltas in order; a gap triggers another snapshot instead of guesswork. Cancellation can race with success, dispatch, or disconnect, so the state machine decides which terminal event wins and records the losing event as rejected evidence. Commands carry expiry and authority so a delayed packet cannot become valid merely because its schema parses after reconnection.",
      ],
      keyTerms: [
        {
          term: "Idempotency key",
          meaning:
            "A client-generated identifier reused for retries of one intended operation so the server can return the same resource instead of repeating the side effect.",
          physicalExample:
            "Three timed-out submissions bearing key K-77 all refer to mission M-204 rather than creating three robot trips.",
        },
        {
          term: "Request fingerprint",
          meaning:
            "A canonical digest or comparable representation of the fields whose equality proves that a retried key still describes the original operation.",
          physicalExample:
            "Changing the destination while reusing K-77 produces a conflict because the stored and new mission bodies do not match.",
        },
        {
          term: "Correlation ID",
          meaning:
            "A stable identifier propagated through components so records from one end-to-end operation can be joined without relying on timestamps alone.",
          physicalExample:
            "The API record, allocator decision, action goal, robot feedback, and UI event for one delivery all carry correlation M-204.",
        },
        {
          term: "Schema version",
          meaning:
            "An explicit contract revision that lets a receiver validate fields and apply a compatible parser rather than infer meaning from payload shape.",
          physicalExample:
            "Gateway v2 rejects a v0 mission lacking metres and map-frame declarations instead of assuming defaults.",
        },
        {
          term: "Authoritative snapshot",
          meaning:
            "A complete state view at a named revision from which a client can safely resume applying later incremental events.",
          physicalExample:
            "After a WebSocket gap, the console loads robot and mission revision 412 before accepting event 413.",
        },
        {
          term: "ROS 2 action",
          meaning:
            "An interface for a long-running goal that can emit feedback, receive cancellation or preemption, and return a result.",
          physicalExample:
            "A navigation goal reports progress for twenty seconds, accepts a cancel request, and returns canceled only after the executor handles it.",
        },
      ],
      physicalExamples: [
        {
          title: "Courier ticket copied three times",
          scenario:
            "A dispatcher submits delivery ticket K-77, loses the response twice, and presses retry with the same mission body before the third response arrives.",
          lookFor:
            "One durable mission identity is returned for all three attempts; changing the destination under K-77 is rejected rather than silently mutating or duplicating work.",
        },
        {
          title: "Display reconnects after missing two updates",
          scenario:
            "A browser last displayed revision 40, disconnects while revisions 41 and 42 occur, then first receives live delta 43 after reconnecting.",
          lookFor:
            "The browser does not apply 43 onto stale revision 40; it requests a current snapshot, verifies its revision, and only then resumes ordered deltas.",
        },
      ],
      workedExample: {
        title: "Follow one mission through retries, execution, and cancellation",
        setup:
          "A client intends one delivery from A to B, uses idempotency key K-77, and times out after its first POST. The server committed mission M-204 before the response was lost.",
        steps: [
          "Canonicalize the create request, calculate its fingerprint F-9, and atomically store `(K-77, F-9, M-204, accepted response)` with the mission row.",
          "When the client retries K-77 with the same body, compare F-9, return M-204 and its current representation, and create no second mission.",
          "Publish an accepted event with mission M-204, schema version, sequence 1, timestamp, and correlation ID; the allocator later emits assigned sequence 2.",
          "Translate M-204 to one ROS 2 action goal whose feedback becomes newer mission events; keep API acceptance distinct from robot-side running and observed completion.",
          "Receive a cancel request while feedback says running, move to cancel-requested, forward cancellation once, and continue showing measured robot state while the outcome is unresolved.",
          "If the action returns canceled, write one terminal transition and publish its revision; if success had committed first, reject the later cancel terminal event according to the state rule.",
          "Reconnect the browser from an old revision by loading the authoritative mission snapshot before applying subsequent WebSocket deltas.",
        ],
        result:
          "Three transport attempts create one mission, API success never impersonates physical completion, cancellation produces one state-machine-approved terminal result, and the reconnected UI does not invent intermediate state.",
        takeaway:
          "End-to-end correctness comes from stable identity and guarded state transitions across every interface; no individual protocol supplies exactly-once mission meaning by itself.",
      },
      handsOn: {
        setup:
          "Extend the local FleetOps lab with a versioned mission JSON schema, a small HTTP service, one ROS 2 action or equivalent existing simulated goal path, and a WebSocket operator client.",
        steps: [
          "Define create, read, cancel, snapshot, event, action-goal, feedback, and terminal-result contracts with IDs, units, frames, versions, timestamps, sequence numbers, expiry, and validation errors.",
          "Implement atomic idempotency storage for mission creation and reject the same key when its canonical request fingerprint differs.",
          "Propagate one correlation ID from HTTP acceptance through allocation, robot goal, feedback, terminal state, and browser event; make each record searchable by it.",
          "Force a response timeout before acknowledgment, retry before and after the mission commits, and verify all matching requests return one mission identity.",
          "Cancel once while queued and once while running; inject a success-versus-cancel race and prove the transition table admits only one immutable terminal state.",
          "Disconnect the WebSocket, omit an event, reconnect with a later delta, and verify the client requests an authoritative snapshot rather than applying a revision gap.",
          "Send an unsupported schema, expired command, duplicate event, and prior-generation goal; capture each explicit rejection and confirm none reaches simulated motion.",
        ],
        observe:
          "Transport success, durable acceptance, robot execution, and physical outcome become visibly different milestones, while retries and reconnects expose where identity and revision checks are required.",
        doneWhen:
          "One intended create yields one mission across all retry points, every interface preserves correlation and units, cancellation races end once, revision gaps trigger snapshots, and invalid or expired commands never execute.",
      },
      jobConnection: {
        roles: [
          ROLE_HMI,
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Design and test an idempotent mission API, a revisioned browser event stream, and a ROS 2 action gateway that preserve one business operation through retries, reconnects, cancellation races, command expiry, and robot-side terminal evidence.",
        interviewPrompt:
          "A client times out after creating a robot mission and retries while the browser reconnects mid-execution. Explain your idempotency record, schema and correlation fields, snapshot protocol, ROS 2 action mapping, and terminal-state race handling.",
      },
      commonMistakes: [
        {
          mistake: "Treating HTTP 200 or 201 as proof that the robot completed the delivery.",
          correction:
            "Use the response only for the API operation it represents, then require correlated executor feedback, terminal state, and observed task evidence for mission completion.",
        },
        {
          mistake: "Generating a new idempotency key on every retry.",
          correction:
            "Reuse one stable key for retries of the identical intended create, store it atomically with the mission, and reject reuse with a different request fingerprint.",
        },
        {
          mistake: "Applying the first WebSocket delta after reconnecting to whatever state remains on screen.",
          correction:
            "Resume only when revisions are contiguous; otherwise load an authoritative snapshot and then apply strictly newer ordered deltas.",
        },
        {
          mistake: "Mapping cancel-request received directly to robot stopped.",
          correction:
            "Model cancellation as a race-aware workflow and use executor acknowledgment plus measured or simulated stop evidence before declaring the canceled terminal state.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does a stable idempotency key need a request fingerprint?",
          answer:
            "The key may be retried only for the same intended operation; the fingerprint detects accidental reuse with different mission content and prevents ambiguous mutation or duplication.",
        },
        {
          question: "Which ROS 2 interface best matches a long navigation operation that reports progress and supports cancellation?",
          answer:
            "A ROS 2 action, because it represents a long-running goal with feedback, cancellation or preemption, and a result.",
        },
        {
          question: "What should a WebSocket client do when its last revision is 40 and the next event is 43?",
          answer:
            "Treat the gap as unknown state, obtain an authoritative snapshot at a known revision, and only then resume applying later contiguous events.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The worked correlation ledger and retry, cancel, and reconnect tests expose gateway semantics more exactly than another transport-box illustration.",
      },
    },
    {
      dayId: 109,
      mentalModel:
        "Fleet data has a signed ledger, an erasable live board, and keyed conveyor lanes: PostgreSQL preserves decisions, Redis expires coordination views, and Kafka moves replayable events without erasing overload.",
      explanation: [
        "Give each store one declared authority. PostgreSQL is the durable system of record for mission identity, allowed transitions, idempotency records, assignment decisions, and audit metadata. Write a mission transition and its outgoing event intention in one database transaction, commonly through an outbox row, so a process crash cannot commit state while losing the event. Database constraints should reject duplicate identities and illegal revisions; a cache hit or a consumed message must not bypass those invariants.",
        "Redis is useful for short-lived presence, expiring leases, rate limits, and derived live views because it is fast and supports time-to-live behavior. That convenience does not make it durable mission truth. A robot-presence key must include observed timestamp, generation, and expiry; missing or expired means unknown or offline, not stopped. Rebuild cache state from authoritative sources after loss, and use fencing or generation values so an old lease holder cannot continue after another owner acquires control.",
        "Kafka stores events in partitioned logs. Records sharing a stable key such as mission ID are routed to the same partition when configured accordingly, and order is then read within that topic-partition; there is no automatic total order across every partition or external database write. Consumers can see duplicates after retries or restarts, so validate schema, use event identity and aggregate sequence, apply transitions idempotently, and commit consumer progress only after the durable effect succeeds.",
        "Backpressure is a correctness condition because old robot state can look plausible. If 20 robots publish 10 events per second, input is 200 events per second. A consumer handling 150 accumulates 50 events each second and reaches 3,000 events of lag after one minute. Bound memory, expose event and time lag, set admission or degradation rules, and distinguish data classes: coalesce replaceable telemetry by robot, but never silently discard a mission terminal event, cancellation, safety signal, or audit transition.",
        "Malformed and out-of-order events need explicit dispositions. Quarantine a poison payload with its raw identity and validation reason instead of retrying it forever at the head of a partition or silently skipping it. A sequence gap marks the aggregate incomplete and triggers replay or reconciliation. Dashboards should show input rate, processing rate, queue depth, oldest-event age, retry count, quarantine count, and last applied sequence so operators see staleness before it becomes a false live picture.",
      ],
      keyTerms: [
        {
          term: "Transactional outbox",
          meaning:
            "A durable row written in the same transaction as business state and later relayed to messaging, preventing committed state from losing its intended event.",
          physicalExample:
            "Mission M-204 and outbox event assigned-3 commit together before a publisher sends the event to Kafka.",
        },
        {
          term: "Time to live",
          meaning:
            "A duration after which an ephemeral key expires and must no longer be treated as current evidence.",
          physicalExample:
            "Robot R2 presence expires five seconds after its last validated heartbeat and the allocator removes it from the feasible set.",
        },
        {
          term: "Partition key",
          meaning:
            "The value used to route related events into one Kafka partition so their log order can be consumed together.",
          physicalExample:
            "Every transition for mission M-204 uses M-204 as key and reaches the same topic-partition.",
        },
        {
          term: "Consumer lag",
          meaning:
            "The distance or age between the newest available event and the last event a consumer has durably processed.",
          physicalExample:
            "A console projection is 3,000 records and 60 seconds behind even though its worker process still reports healthy.",
        },
        {
          term: "Backpressure",
          meaning:
            "The mechanism that prevents producers or queues from overwhelming bounded consumers by slowing, rejecting, sampling, or degrading according to data-class policy.",
          physicalExample:
            "High-rate pose updates are coalesced to the newest state per robot while mission terminals remain lossless and ordered.",
        },
        {
          term: "Idempotent consumer",
          meaning:
            "A consumer whose repeated processing of the same event identity cannot repeat the durable business transition.",
          physicalExample:
            "Replaying assigned-3 after a crash finds its applied event ID and does not assign a second robot.",
        },
      ],
      physicalExamples: [
        {
          title: "Shift log, magnetic board, and envelope lanes",
          scenario:
            "A dispatcher writes signed mission transitions in a bound logbook, copies current robot locations to a magnetic board, and sends numbered envelopes down lanes chosen by mission ID.",
          lookFor:
            "Erasing the board does not erase the ledger, envelopes from one lane stay ordered, and rebuilding the board requires replay plus freshness rather than memory.",
        },
        {
          title: "Scanner produces faster than inspection",
          scenario:
            "Twenty paper robots each place ten event cards per second onto a belt, while the reviewer removes only 150 of the 200 cards arriving each second.",
          lookFor:
            "The visible pile grows by 50 per second; after 60 seconds it contains 3,000 delayed cards, so a running reviewer is not evidence of current state.",
        },
      ],
      workedExample: {
        title: "Calculate overload and choose a bounded degradation policy",
        setup:
          "Twenty robots each publish ten telemetry events per second. One projection consumer sustains 150 events per second. Memory is bounded, mission events must not be lost, and replaceable pose events may be coalesced.",
        steps: [
          "Calculate input as `20 × 10 = 200 events/s` and service as `150 events/s`, leaving a backlog growth rate of `200 - 150 = 50 events/s`.",
          "After 60 seconds, calculate `50 × 60 = 3,000` queued events; report oldest-event age as well as count because event sizes and partitions differ.",
          "Classify mission transitions, cancellation, terminal results, and audit events as non-coalescible; classify intermediate pose display updates as replaceable by a newer validated pose for the same robot.",
          "Key mission events by mission ID and pose events by robot ID, preserving sequence within each aggregate while acknowledging that different partitions have no single global order.",
          "Apply a bounded policy: stop accepting optional analytics work, coalesce queued pose events by robot, preserve critical transitions, and alert before freshness breaches the operator threshold.",
          "On consumer restart, replay from the last durably committed offset, deduplicate by event ID, reject stale aggregate sequences, and reconcile any detected sequence gap.",
          "Accept recovery only when lag count and oldest age return below declared thresholds and the PostgreSQL mission history matches the event projection for every test identity.",
        ],
        result:
          "The overload remains visible and bounded, replaceable display traffic degrades deliberately, mission truth stays durable, and restart replay cannot repeat assignments or hide sequence gaps.",
        takeaway:
          "An unbounded queue converts overload into delayed false confidence; a correct design makes capacity, freshness, and loss policy explicit for each class of fleet data.",
      },
      handsOn: {
        setup:
          "Run local PostgreSQL, Redis, and Kafka-compatible services already available to the lab, using only generated two-robot events and no production credentials or live robot connection.",
        steps: [
          "Create mission, mission-transition, processed-event, and outbox tables with unique mission revision and event identity constraints; commit one transition and outbox row atomically.",
          "Relay outbox rows to a Kafka topic keyed by mission ID, then mark publication without deleting the durable audit identity needed for retry.",
          "Store robot presence in Redis with timestamp, generation, and a short TTL; allow expiry to produce unknown or offline rather than measured stopped.",
          "Consume mission events transactionally into a projection, record processed event IDs, and commit progress only after the PostgreSQL effect succeeds.",
          "Inject a duplicate, reversed sequence, missing sequence, poison schema, consumer crash before offset commit, Redis flush, and a consumer slowed below producer rate.",
          "Chart input rate, processing rate, record lag, oldest age, retries, quarantine count, cache expiry, and last applied aggregate sequence while each fault runs.",
          "Recover through replay and authoritative reconciliation, then compare mission rows, outbox identities, projection revisions, and terminal counts for exact agreement.",
        ],
        observe:
          "A healthy process can serve stale state, cache loss is survivable only when Redis is not mission authority, and replay is safe only when consumers and database effects are idempotent.",
        doneWhen:
          "All injected faults are visible, memory remains bounded, poison data cannot block silently, expired presence becomes unknown, duplicate replay causes no repeated transition, and durable history plus projection reconcile exactly.",
      },
      jobConnection: {
        roles: [
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_SOFTWARE,
          ROLE_INTEGRATION,
        ],
        workExample:
          "Own the mission system of record, transactional event publication, expiring robot-presence cache, partition strategy, replay-safe consumers, overload policy, and lag dashboards for a fleet whose messages can duplicate, reorder, stall, or fail validation.",
        interviewPrompt:
          "A fleet projection falls behind while messages duplicate after a restart. Explain PostgreSQL, Redis, and Kafka ownership, your outbox and partition key, offset timing, sequence checks, backpressure policy, and proof that mission state remains correct.",
      },
      commonMistakes: [
        {
          mistake: "Using Redis current-state keys as the durable source of mission truth.",
          correction:
            "Keep allowed mission transitions and audit history in PostgreSQL, give Redis views TTL and generation metadata, and rebuild them after cache loss.",
        },
        {
          mistake: "Claiming Kafka preserves one global order for every robot and mission.",
          correction:
            "State the actual boundary: order is consumed within a topic-partition, so choose stable aggregate keys and use revisions when events meet other partitions or stores.",
        },
        {
          mistake: "Committing the consumer offset before the database transition succeeds.",
          correction:
            "Make the durable effect idempotent, commit it first, and advance progress afterward so a crash leads to safe replay rather than silent loss.",
        },
        {
          mistake: "Adding an unbounded queue when the consumer cannot keep up.",
          correction:
            "Measure rate and age, bound capacity, shed or coalesce only declared replaceable data, protect critical events, and alert before freshness violates the operating threshold.",
        },
      ],
      checkQuestions: [
        {
          question: "At 200 incoming and 150 processed events per second, what is the lag after one minute?",
          answer:
            "Lag grows at 50 events per second, so after 60 seconds it reaches 3,000 events, with oldest age approaching one minute if arrival and processing remain steady.",
        },
        {
          question: "Why does a mission ID make a useful Kafka partition key?",
          answer:
            "It routes transitions for that mission to one partition so consumers can read their log order together; it does not create total order across different missions or external stores.",
        },
        {
          question: "What should Redis presence expiry mean to the allocator?",
          answer:
            "The robot's current state is unknown or offline and it should leave the feasible set; expiry is not evidence that measured velocity is zero or the robot safely stopped.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A rate-and-queue visual makes backlog growth, event age, coalescing boundaries, and the difference between a running consumer and a current projection immediately inspectable.",
      },
    },
    {
      dayId: 110,
      mentalModel:
        "A robot HMI is a cockpit with independent instruments: operator intent, command acceptance, measured motion, map state, and video age must never collapse into one reassuring green icon.",
      explanation: [
        "An operational HMI separates what the user requested, what a service accepted, what the robot executor accepted, and what sensors physically or simulatively observed. A pressed forward control is intent, not velocity. An acknowledgment is receipt, not motion. A zero velocity measurement is stronger evidence but still needs timestamp, source, and freshness. Show mission revision, robot generation, connection state, last update age, command lease, operating mode, localization quality, and stop evidence so the operator can see disagreement instead of receiving a fabricated summary.",
        "WebSocket state and WebRTC video are independent channels with different delay, loss, and clocks. A clear video can accompany a disconnected command path, and a frozen video frame can remain displayed while telemetry continues. Attach acquisition or capture time, receive time, sequence, and stream state; display age and visibly blank, watermark, or disable reliance on stale media. On a WebSocket revision gap, replace deltas with an authoritative snapshot before allowing actions that depend on current state.",
        "Teleoperation authority must be bounded beyond the browser. Authenticate the operator, enforce role and site permissions server-side, verify the selected robot and mode, and acquire an exclusive authority lease. Commands carry sequence, generation, issue time, expiry, frame, units, and limits. The operator continuously holds a dead-man control, but the decisive stop is a robot- or edge-side timeout that ends motion when renewals cease. Browser focus loss, hidden tab, network loss, lease expiry, or authorization change stops renewal and produces visible degraded state.",
        "Three-dimensional state is useful only with current transforms and geometry. Render the robot footprint, planned path, map frame, restricted zones, holding points, and obstacle or localization confidence with a shared timestamp policy. A pose transformed with an old map-to-odometry relation can draw a believable robot in the wrong aisle. The HMI should reject or mark stale transforms, state the coordinate frame, limit rendering rate independently of control rate, and never convert a graphical boundary into the only physical motion limit.",
        "Timing arithmetic guides the lease but does not certify safety. At 20 commands per second the period is 50 ms. With 80 ms round-trip time and a 150 ms lease, only 70 ms remains after one round trip. Test jitter and one-way age, not only average RTT, and set the local watchdog from the validated stopping behavior and platform design. The exercise demonstrates stale-state and timeout logic in simulation; it does not make browser teleoperation safety-rated.",
      ],
      keyTerms: [
        {
          term: "Stale state",
          meaning:
            "State whose age, sequence, generation, or clock uncertainty exceeds the declared limit for the decision being made.",
          physicalExample:
            "A pose received three seconds ago remains valid history but is too old to enable a live teleoperation command.",
        },
        {
          term: "Dead-man lease",
          meaning:
            "A short command authority that remains valid only while an operator continuously signals intent and timely renewals reach a local watchdog.",
          physicalExample:
            "Releasing the control or losing browser focus stops lease renewal, and the robot-side timer commands the simulated base to stop.",
        },
        {
          term: "Measured state",
          meaning:
            "Sensor- or estimator-derived evidence of what the robot is doing, kept distinct from requested and acknowledged commands.",
          physicalExample:
            "Measured wheel velocity remains nonzero after a stop request, so the console shows disagreement instead of declaring stopped.",
        },
        {
          term: "Role-based access control",
          meaning:
            "Server-enforced permission that allows an authenticated role to perform only approved operations on approved resources.",
          physicalExample:
            "A viewer can inspect telemetry but receives a denied response when attempting to acquire teleoperation authority.",
        },
        {
          term: "WebRTC",
          meaning:
            "A real-time media and data framework often used for low-latency audio or video, whose stream health and capture age remain separate from command state.",
          physicalExample:
            "The camera stream stays smooth while the WebSocket command channel disconnects, so the HMI disables commands despite visible video.",
        },
        {
          term: "Transform freshness",
          meaning:
            "The age and validity of the coordinate transform used to place state or geometry in another frame.",
          physicalExample:
            "A fresh base pose combined with an old map-to-odometry transform is marked invalid for drawing the robot against restricted zones.",
        },
      ],
      physicalExamples: [
        {
          title: "Remote pallet cart with delayed stop evidence",
          scenario:
            "An operator releases a held forward control; the API acknowledges the stop immediately, but simulated wheel velocity remains positive for another 180 ms.",
          lookFor:
            "The HMI shows requested stop, accepted stop, and still-moving measured state as separate facts until fresh velocity confirms the bounded stop.",
        },
        {
          title: "Camera freezes while position keeps changing",
          scenario:
            "A WebRTC test freezes one frame showing an empty aisle while WebSocket telemetry continues to report the simulated robot moving and obstacle state changing.",
          lookFor:
            "Frame age rises visibly, video is marked stale, teleoperation is disabled by policy, and current telemetry does not make the old image appear trustworthy.",
        },
      ],
      workedExample: {
        title: "Audit one 20 Hz teleoperation lease",
        setup:
          "The console sends bounded teleoperation renewals at 20 Hz, measured round-trip time is 80 ms for this sample, and the local authority lease expires after 150 ms without a valid renewal.",
        steps: [
          "Calculate the nominal command period as `1 / 20 s = 0.05 s = 50 ms`; every command carries robot generation, sequence, issue time, expiry, frame, and bounded velocity.",
          "Subtract the observed 80 ms round trip from the 150 ms lease to obtain 70 ms of remaining time; record that this sample does not bound one-way delay or jitter.",
          "Acquire one exclusive lease after server-side authentication, role, robot mode, and site checks; reject a second operator rather than merging control streams.",
          "Show requested velocity, gateway acceptance, executor acceptance, and fresh measured velocity on separate rows with their own timestamps and sources.",
          "Remove browser focus so renewal stops; verify the robot- or edge-side timer expires authority and commands simulated zero without relying on a UI callback.",
          "Keep a frozen video frame on screen during the trial and verify frame age, watermark, and disabled control make its stale status unmistakable.",
          "Accept the test only when fresh measured velocity reaches the declared stop condition within its validated bound and the event trail explains request, expiry, command, and observation.",
        ],
        result:
          "The operator can distinguish intent from effect, a local timeout stops simulated motion after renewal loss, and stale video or state cannot continue presenting itself as live command evidence.",
        takeaway:
          "Dead-man UI behavior matters, but the enforceable guarantee comes from exclusive leased authority, local expiry, bounded commands, and fresh measured stop evidence.",
      },
      handsOn: {
        setup:
          "Build the operator console against the two-robot simulator with WebSocket state, a recorded or synthetic WebRTC-like video stream, a 2D or 3D map view, and no physical actuator connection.",
        steps: [
          "Create separate HMI fields for intent, API acceptance, executor state, measured velocity, mission revision, robot generation, telemetry age, transform age, video age, lease owner, and lease expiry.",
          "Require authentication and server-side roles, then implement exclusive authority acquisition and bounded commands containing sequence, issue time, expiry, frame, units, and robot generation.",
          "Implement a held dead-man control whose renewals stop on release, focus loss, hidden page, disconnect, permission loss, or lease rejection; enforce expiry outside the browser.",
          "Load an authoritative snapshot before deltas, detect a skipped revision, and prevent teleoperation while robot, transform, or command-channel state exceeds its freshness threshold.",
          "Render footprint, path, holding points, and restricted zone in one declared map frame; inject an old transform and verify the view marks or removes misleading geometry.",
          "Inject 300 ms network delay, dropped WebSocket, frozen video, duplicate sequence, prior robot generation, competing operator, and delayed measured stop.",
          "For every fault, capture the HMI indication and robot-side or simulator evidence; fail the case if the screen merely disables a button without the local stop path executing.",
        ],
        observe:
          "Video, telemetry, command acknowledgment, transform, and measured motion can disagree independently, so freshness and source must be visible at the point of action.",
        doneWhen:
          "All stale channels are unmistakable, unauthorized or prior-generation commands are rejected, only one authority lease exists, focus or network loss stops simulated motion locally, and fresh measured state confirms the result.",
      },
      jobConnection: {
        roles: [
          ROLE_HMI,
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
        ],
        workExample:
          "Build and validate a robot operations console whose state model, WebSocket recovery, video freshness, coordinate transforms, permissions, command leases, and independent timeout behavior let an operator act without mistaking intent or cached pixels for physical fact.",
        interviewPrompt:
          "Design remote teleoperation for an AMR when video, telemetry, and commands can fail separately. Explain requested versus measured state, freshness, reconnect snapshots, exclusive authority, dead-man expiry, and the evidence that motion actually stopped.",
      },
      commonMistakes: [
        {
          mistake: "Turning the robot icon green when the command API acknowledges a request.",
          correction:
            "Display intent, gateway acceptance, executor acceptance, and fresh measured state separately; only the last can support a claim about current motion.",
        },
        {
          mistake: "Stopping motion only from a browser mouse-up or key-up handler.",
          correction:
            "Use those events to stop renewal, but enforce command expiry in a robot- or edge-side watchdog that survives focus loss, browser failure, and network interruption.",
        },
        {
          mistake: "Leaving the last camera frame visible without age because the video element still renders.",
          correction:
            "Track capture and receive freshness, mark or blank stale media clearly, and disable operations whose visual evidence exceeds the declared limit.",
        },
        {
          mistake: "Drawing a fresh pose through a stale transform and treating the result as current map truth.",
          correction:
            "Validate transform timestamp, generation, and frame chain; mark geometry unavailable when the composed state is not fresh enough for the action.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is command accepted not the same as robot moving or stopped?",
          answer:
            "Acceptance proves a component received or admitted the request; fresh measured state from the simulator or robot is separate evidence of the resulting motion.",
        },
        {
          question: "At 20 Hz, 80 ms RTT, and a 150 ms lease, what do the basic numbers show?",
          answer:
            "Commands are nominally 50 ms apart and one measured round trip leaves 70 ms before expiry; the calculation still does not bound jitter, one-way age, or physical stopping.",
        },
        {
          question: "Which component must end motion when the browser disappears?",
          answer:
            "A validated robot- or edge-side watchdog must expire the authority or command lease and execute the bounded stop behavior independently of the browser.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A stale-state cockpit view can place intent, acknowledgments, measured motion, video age, transform age, and lease expiry side by side, making dangerous disagreement visually explicit.",
      },
    },
    {
      dayId: 111,
      mentalModel:
        "A fleet release is a sealed travel kit, not a floating tag: code, image digest, configuration, schema, firmware assumptions, migration, health gates, and rollback procedure move together.",
      explanation: [
        "A container packages a process and its user-space dependencies, not the whole robot computer. Record CPU architecture, operating system and kernel expectations, device mappings, network ports, file permissions, storage, clocks, GPU or accelerator runtime, and ROS 2 middleware assumptions outside the image. Use an immutable image digest for the release identity because a mutable tag can point to different content later. Produce a manifest that binds each service digest to source revision, build evidence, and compatibility requirements.",
        "Configuration is executable behavior and needs its own typed schema, version, validation, defaults, secret references, and audit trail. Reject an unknown or incomplete configuration before a robot enters service; do not silently borrow yesterday's values. Keep secrets out of images and ordinary config artifacts. A compatibility matrix states which application, configuration, database schema, firmware, map, calibration, and robot model combinations are supported, including whether each change can run beside the previous version during a staged rollout.",
        "An OTA rollout starts only when the target identity, release authorization, artifact integrity, robot operating state, battery, connectivity, and rollback inputs pass. Stage the smallest useful canary group in a safe or idle operating window. Health gates include process startup, schema compatibility, heartbeat, mission acceptance, navigation or task smoke result, latency, crash rate, resource use, and unexpected stop behavior. A heartbeat alone proves neither useful work nor fleet compatibility.",
        "Rollback is a designed transition, not the command to pull an older image. It may need backward-compatible database changes, restoration of configuration, firmware or driver compatibility, map and calibration selection, draining active missions, operator communication, and reconciliation of work created by the failed version. Destructive migrations that the previous version cannot read require a forward repair or a preplanned restore path; discovering this after canary failure is too late.",
        "Canaries bound exposure, not statistical certainty. Updating two robots in a fleet of forty exposes 5%. If one fails, the observed canary failure rate is 50%, which is enough to stop a zero-failure gate but far too little data to estimate fleet reliability precisely. Halt expansion automatically, preserve logs and mission evidence, roll back the complete compatible bundle, and verify a known-good smoke mission before returning either canary to normal scheduling.",
      ],
      keyTerms: [
        {
          term: "Image digest",
          meaning:
            "An immutable cryptographic identifier for exact container content, unlike a tag that may later be moved to another image.",
          physicalExample:
            "The release manifest pins `fleet-api@sha256:…`, so both canaries pull the same verified bytes rather than whatever `latest` means today.",
        },
        {
          term: "Configuration schema",
          meaning:
            "A versioned machine-checkable contract for configuration fields, types, required values, ranges, and compatibility.",
          physicalExample:
            "A robot with `speed_limit: fast` fails validation because the release requires a bounded numeric metres-per-second value.",
        },
        {
          term: "Canary",
          meaning:
            "A small, deliberately selected first deployment group used to exercise health gates before wider exposure.",
          physicalExample:
            "Two idle simulated robots receive release 1.4 while the remaining thirty-eight continue on the known-good bundle.",
        },
        {
          term: "Health gate",
          meaning:
            "A predeclared measurable condition that must pass before a rollout can continue to the next stage.",
          physicalExample:
            "Both canaries must start, load configuration, finish three smoke missions, remain below latency and crash thresholds, and show no unexpected stops.",
        },
        {
          term: "Rollback bundle",
          meaning:
            "The complete known-compatible code, configuration, schema, firmware assumptions, data handling, and operator procedure needed to return service safely.",
          physicalExample:
            "Restoring the prior API image also selects its compatible config, reverses a safe additive flag, drains a new mission type, and reruns the old smoke test.",
        },
        {
          term: "Compatibility matrix",
          meaning:
            "A tested table declaring which versions of interacting software, configuration, data, firmware, maps, and robot models can operate together.",
          physicalExample:
            "Fleet adapter 1.4 supports robot firmware 7.2 and config schema 3, while adapter 1.3 cannot read schema 4.",
        },
      ],
      physicalExamples: [
        {
          title: "Update two carts before the night fleet",
          scenario:
            "A warehouse has forty carts. Two idle units receive a pinned service image and config while the other thirty-eight remain on the last accepted release.",
          lookFor:
            "One failed smoke mission halts expansion, keeps the failure evidence, and restores the whole compatible bundle before either cart returns to scheduling.",
        },
        {
          title: "Recipe label moved after approval",
          scenario:
            "A kitchen approves a jar labelled current, but someone later replaces its contents while retaining the same label, so the next cook cannot reproduce the meal.",
          lookFor:
            "A digest acts like a tamper-evident content identity; a friendly tag remains useful for humans but is not the immutable release proof.",
        },
      ],
      workedExample: {
        title: "Decide a two-of-forty canary after one failure",
        setup:
          "Release 1.4 targets a forty-robot simulated fleet. The plan sends it first to two idle robots and requires zero crash, configuration, or smoke-mission failures before expansion. One canary fails configuration validation.",
        steps: [
          "Calculate canary exposure as `2 / 40 × 100% = 5%` and record the exact two robot identities, hardware profiles, prior versions, image digests, and config revisions.",
          "Apply the declared gate: one failure among two canaries gives an observed `1 / 2 × 100% = 50%` canary failure rate and violates the zero-failure rule.",
          "Stop the rollout before any of the remaining thirty-eight robots pull the release; do not reinterpret the gate because one canary happened to pass.",
          "Preserve the failed validation input, service logs, release manifest, host facts, and correlation ID, then classify the cause without changing the deployed artifact in place.",
          "Drain or cancel canary work according to the runbook and restore the previous image digest, configuration version, schema-compatible state, and operating assumptions.",
          "Run the known-good startup and smoke-mission checks on both canaries and reconcile any mission created by release 1.4 before normal scheduling resumes.",
          "State the evidence boundary: the canary decisively rejected this rollout gate but two samples cannot estimate the release's general fleet failure probability.",
        ],
        result:
          "Only 5% of the fleet was exposed, expansion stopped on the first declared failure, evidence remained intact, and the complete known-good bundle passed before the canaries returned to service.",
        takeaway:
          "A canary's job is to enforce an exposure gate and make recovery possible, not to turn two successful or failed samples into a broad reliability claim.",
      },
      handsOn: {
        setup:
          "Package the local FleetOps services and versioned lab configuration for two simulated canary robots; keep secrets in local secret references and never embed production credentials.",
        steps: [
          "Build each service once, record its immutable digest, source revision, dependency evidence, target architecture, required ports, devices, storage, clocks, and middleware assumptions in a release manifest.",
          "Define and validate a versioned configuration schema; test missing field, wrong unit, out-of-range value, unknown version, and absent secret reference before startup.",
          "Write a compatibility matrix for service, database schema, configuration, robot simulator version, map, and calibration, including old-new coexistence and rollback direction.",
          "Declare canary eligibility and gates for startup, configuration, heartbeat, three smoke missions, latency, crashes, resource use, and unexpected stop count.",
          "Deploy the identical digest and config to two simulated robots, inject one incompatible configuration and one failed mission gate, and verify expansion halts automatically.",
          "Execute the rollback runbook for service, configuration, schema state, and active missions; retain failed artifacts and audit events instead of overwriting them.",
          "Rerun the known-good smoke suite, verify both canaries' release identities and mission histories, and produce a go, hold, or reject decision tied to every gate.",
        ],
        observe:
          "A container that starts can still be incompatible with host devices or mission semantics, while a tested rollback depends on configuration, data, and operating state as much as on image bytes.",
        doneWhen:
          "The release is reproducible by digest, invalid configuration fails closed, canary expansion stops on either planted failure, rollback restores a compatible bundle, and both known-good smoke missions pass with intact audit history.",
      },
      jobConnection: {
        roles: [
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Create and operate a fleet release pipeline that pins exact container artifacts, validates configuration and host assumptions, stages only eligible canaries, halts on mission-level health gates, and restores a complete compatible runtime while preserving incident evidence.",
        interviewPrompt:
          "A two-robot canary has one failure in a forty-robot fleet. Explain your release identity, config and compatibility checks, automatic gate decision, rollback contents, mission reconciliation, and what the small sample can and cannot prove.",
      },
      commonMistakes: [
        {
          mistake: "Deploying a mutable image tag and recording only the friendly release name.",
          correction:
            "Bind the release to immutable image digests and source/build evidence; keep tags as labels, not proof of the bytes that ran.",
        },
        {
          mistake: "Calling a canary healthy when its containers stay up and send heartbeats.",
          correction:
            "Gate on configuration, compatible dependencies, representative mission outcomes, latency, crashes, resource behavior, and unexpected stops in addition to liveness.",
        },
        {
          mistake: "Rolling back the application image while leaving a newer incompatible config or schema.",
          correction:
            "Test a rollback bundle covering code, configuration, data or migration state, firmware and driver assumptions, maps, calibration, active work, and operator procedure.",
        },
        {
          mistake: "Using one of two canary failures to claim a precise 50% fleet failure probability.",
          correction:
            "Use the observation to fail the predeclared gate and stop exposure, while stating that two trials are insufficient for a precise population reliability estimate.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is an image digest stronger release evidence than a tag?",
          answer:
            "The digest cryptographically identifies exact immutable content, while a tag can be moved or reused and therefore cannot by itself prove which bytes ran.",
        },
        {
          question: "What does one failure among two canaries in a forty-robot fleet establish?",
          answer:
            "It exposes 5% of the fleet, yields 50% observed failure within that two-robot sample, and fails a zero-failure gate; it does not precisely estimate fleet-wide reliability.",
        },
        {
          question: "What belongs in rollback besides an older container image?",
          answer:
            "Compatible configuration, schema or data handling, firmware and driver assumptions, maps and calibration, active-mission reconciliation, operator steps, verification, and the known-good release identity.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The release manifest, compatibility matrix, gate table, and executed rollback record are the operational evidence; another deployment flow picture would omit the decisive version details.",
      },
    },
    {
      dayId: 112,
      mentalModel:
        "Fleet acceptance is a fire drill with numbered evidence: fixed scenarios create faults, correlated signals show where time went, and predeclared objectives decide pass or fail before anyone sees the result.",
      explanation: [
        "Acceptance starts with a frozen population and observable outcome. Define mission types, initial conditions, robot and software versions, fault schedule, success criteria, latency boundary, state-freshness boundary, recovery-time boundary, unsafe-attempt definition, exclusions, and trial count before execution. A service-level indicator is the actual measured quantity; a service-level objective is its target over a stated population and window. Neither is a guarantee of perfect operation, and neither replaces safety requirements or site acceptance.",
        "Logs, metrics, traces, and robot artifacts answer different questions. Structured logs preserve discrete events with timestamp, severity, component, event type, mission and robot identity, configuration, and useful fields. Metrics aggregate rates, counts, distributions, and current gauges such as mission success, p95 latency, consumer lag, stale robots, or rollback count. A distributed trace follows one mission through API, database, allocator, gateway, and robot adapter using propagated context. Simulator recordings, ROS bags, screenshots, and terminal outcome evidence connect software signals to the observed task.",
        "Correlation is designed before the incident. Propagate mission correlation, robot identity, attempt number, release version, and causation through synchronous and asynchronous boundaries; do not join by nearby timestamps alone. Clocks still need synchronization and uncertainty because a trace cannot correct an inaccurate robot timestamp. Control metric cardinality by using bounded dimensions such as mission type or result category rather than raw mission IDs in every time series; keep individual identities in logs and traces where targeted investigation belongs.",
        "Fault injection tests a hypothesis, detector, containment, recovery, and evidence chain. Name the fault and expected behavior first, introduce it at a known time, confirm the system detected the right symptom, verify bounded degraded behavior, remove the fault, and measure recovery. Useful fleet cases include robot disconnect, stale pose, allocator restart, database slowdown, consumer backlog, WebSocket gap, frozen video, blocked aisle, invalid configuration, and canary failure. A fault tool reporting injected proves only the stimulus occurred, not that recovery worked.",
        "Aggregate numbers must retain their denominator and failures. If 196 of 200 missions complete within 120 seconds, the measured indicator is 98%; it fails a 99% objective even when mean latency is attractive. Classify the four misses, publish their evidence, and report tail latency and freshness rather than averages alone. Simulation acceptance proves behavior within modeled software and faults; it does not prove real traction, wireless interference, safety circuitry, people interaction, or customer-site acceptance.",
      ],
      keyTerms: [
        {
          term: "Service-level indicator",
          meaning:
            "A precisely measured quantity representing service behavior for a declared population and window.",
          physicalExample:
            "The fraction of delivery missions reaching observed success within 120 seconds is one fleet SLI.",
        },
        {
          term: "Service-level objective",
          meaning:
            "A target or acceptable range for an SLI, defined before measurement with its population, window, and exclusions.",
          physicalExample:
            "At least 99% of the frozen 200 delivery trials must finish within 120 seconds.",
        },
        {
          term: "Distributed trace",
          meaning:
            "A correlated path composed of timed spans showing one operation as it crosses processes and services.",
          physicalExample:
            "Mission M-204 has spans for HTTP acceptance, database commit, allocation, gateway dispatch, and robot action execution.",
        },
        {
          term: "Structured log",
          meaning:
            "An event record with stable named fields that can be filtered and correlated without parsing prose.",
          physicalExample:
            "A cancel rejection records mission ID, current revision, attempted transition, component, release, and reason code.",
        },
        {
          term: "Fault injection",
          meaning:
            "A controlled introduction of a named failure used to verify detection, containment, recovery, and evidence against a prior expectation.",
          physicalExample:
            "The test blocks robot R2 status for eight seconds and measures when dispatch removes it from the feasible set and when it safely returns.",
        },
        {
          term: "Tail latency",
          meaning:
            "Latency near the slow end of a distribution, commonly reported as a percentile rather than hidden by the mean.",
          physicalExample:
            "Most missions allocate in 100 ms, but p95 allocation latency reaches 1.8 s during database slowdown and breaches the objective.",
        },
      ],
      physicalExamples: [
        {
          title: "Timed warehouse evacuation drill",
          scenario:
            "A team declares which exits, alarms, response times, and headcounts must pass, then blocks one route and records detection, rerouting, completion, and every exception.",
          lookFor:
            "The drill succeeds or fails against criteria written before the blocked route is chosen; an alarm sounding is only detection, not proof that everyone recovered.",
        },
        {
          title: "Parcel receipt across five desks",
          scenario:
            "One numbered parcel receives a time stamp at intake, allocation, handoff, transport, and delivery while a separate tally board counts all parcels and failures.",
          lookFor:
            "The receipt chain explains one slow parcel, the tally summarizes the population, and the final signed delivery ties software timing to the observed outcome.",
        },
      ],
      workedExample: {
        title: "Judge a 99% within-120-second objective",
        setup:
          "A frozen acceptance run contains 200 comparable delivery missions. The objective requires at least 99% to reach observed success within 120 seconds. Exactly 196 meet that condition.",
        steps: [
          "Confirm the denominator is the predeclared 200 attempted missions and that exclusions were frozen before the run rather than removed after failures.",
          "Calculate the indicator as `196 / 200 × 100% = 98%` and count `200 - 196 = 4` missions that miss the combined success-and-latency condition.",
          "Compare 98% with the 99% objective and mark the objective failed; do not round the result upward or replace it with average mission time.",
          "Use correlation IDs to open the trace, structured logs, release identity, robot evidence, and relevant metric window for each of the four misses.",
          "Classify each miss by the earliest supported cause such as allocation delay, blocked resource, stale robot state, executor failure, or outcome after 120 seconds; retain unknown when evidence is insufficient.",
          "Check separate freshness, recovery-time, unsafe-attempt, and tail-latency objectives because passing or failing one SLI cannot substitute for the others.",
          "Publish the failed objective, all four categories and links, the exact simulated conditions, and the boundary that real site behavior remains unverified.",
        ],
        result:
          "The measured service level is 98%, so the 99% objective fails; all four misses remain visible and individually traceable rather than disappearing inside a favorable average.",
        takeaway:
          "An acceptance report is credible when the denominator, threshold, failures, and evidence boundary remain fixed even when they produce an inconvenient result.",
      },
      handsOn: {
        setup:
          "Use the completed two-robot FleetOps simulator, versioned release manifest, operator console, event services, and a repeatable local scenario runner. Keep the run isolated from real robots and production services.",
        steps: [
          "Freeze at least thirty scenarios spanning nominal delivery, battery and docking, shared traffic, cancellation, retry, reconnect, backpressure, HMI staleness, canary, and rollback; record seed, initial state, expected result, and objective link.",
          "Declare mission success, p95 latency, state freshness, detection time, recovery time, unsafe-attempt count, duplicate terminal count, and rollback objectives with population, window, and exclusions.",
          "Propagate mission, attempt, robot, and release identities through structured logs and trace context; expose bounded metrics for rates, distributions, lag, stale robots, failures, and recovery.",
          "Inject at least five named faults: robot disconnect, blocked aisle, slow consumer, frozen video or missing WebSocket event, and failed canary health gate; timestamp each stimulus and expected response.",
          "Run the frozen matrix without changing thresholds, preserve raw results and simulator or ROS evidence, and classify every non-pass without rerunning it out of the denominator.",
          "For one slow or failed mission, reconstruct the path from API through storage, allocation, gateway, robot execution, HMI, and observed terminal result; state any clock uncertainty or missing span.",
          "Publish a pass-or-fail table for every objective, a failure taxonomy, rollback outcome, exact versions, residual risks, and the explicit simulation-versus-site evidence boundary.",
        ],
        observe:
          "Metrics reveal the population symptom, traces locate time across components, logs expose discrete decisions, and simulator artifacts decide whether the robot task actually reached its terminal condition.",
        doneWhen:
          "All frozen scenarios and planted faults remain in the report, each objective has a reproducible numerator and denominator, every miss links to raw evidence, rollback is observed, and no simulation claim is presented as field or safety acceptance.",
      },
      jobConnection: {
        roles: [
          ROLE_FLEET,
          ROLE_HMI,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Define and execute a fleet acceptance matrix, instrument cross-service mission context, inject communication and capacity faults, diagnose objective misses with logs, metrics, traces, and robot artifacts, and issue an evidence-bounded release or rejection decision.",
        interviewPrompt:
          "Your dashboard shows 98% of 200 missions met a 99% objective. Walk through the decision, the four failures, trace and log correlation, fault-injection proof, tail and freshness metrics, and what simulation still cannot establish.",
      },
      commonMistakes: [
        {
          mistake: "Choosing the SLO threshold after inspecting the run.",
          correction:
            "Freeze the SLI definition, population, window, exclusions, threshold, and trial conditions before execution, then report the resulting pass or fail unchanged.",
        },
        {
          mistake: "Calling a fault case passed because the injection tool confirms the fault was sent.",
          correction:
            "Require evidence of the intended stimulus, correct detection, bounded containment, recovery, final mission state, and no prohibited side effect.",
        },
        {
          mistake: "Using average latency and service heartbeat to summarize fleet health.",
          correction:
            "Report tail latency, freshness, success denominator, lag, recovery, and failure categories; a live process and a good mean can coexist with stale or failed missions.",
        },
        {
          mistake: "Putting raw mission IDs on every metric label for easy searching.",
          correction:
            "Keep metric dimensions bounded and use mission identities in correlated logs and traces, avoiding unbounded time-series cardinality.",
        },
        {
          mistake: "Presenting simulated fault acceptance as proof of customer-site safety or reliability.",
          correction:
            "State exactly which modeled software, versions, scenarios, and faults passed, then list real wireless, traction, circuitry, people, and site conditions that remain unverified.",
        },
      ],
      checkQuestions: [
        {
          question: "Does 196 of 200 missions within 120 seconds pass a 99% objective?",
          answer:
            "No. The measured indicator is 98%, leaving four misses, so the predeclared 99% objective fails.",
        },
        {
          question: "How do logs, metrics, and traces differ during one fleet investigation?",
          answer:
            "Logs record discrete structured events, metrics summarize runtime behavior across a population, and traces follow one correlated operation through components; robot or simulator evidence establishes the observed task outcome.",
        },
        {
          question: "What must be shown beyond proof that a fault was injected?",
          answer:
            "The expected fault reached the target, was detected correctly, produced bounded degraded behavior, recovered within the objective, ended in the right mission state, and caused no prohibited effect.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The acceptance matrix, correlated trace, metric panels, and raw robot evidence are already the required observability surfaces, so a separate generic visual would weaken the proof.",
      },
    },
  ],
} satisfies ChapterContent;
