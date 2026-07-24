import type { ChapterContent } from "../chapter-content-types";

const roleTitles = {
  hmi: "Robot HMI / Control & Monitoring Engineer",
  fleet: "Robot Fleet Backend / Platform Engineer",
  deployment: "Robotics Deployment, Integration & Validation Engineer",
  integration: "Robotics Application / ROS 2 Integration Engineer",
  software: "Robotics Software Engineer — ROS 2 / AMR",
} as const;

export const week05Content = {
  week: 5,
  title: "Build and debug a real ROS 2 system",
  purpose:
    "Learn ROS 2 as a distributed runtime rather than as a collection of commands. By the end of the week, you will be able to split a robot application into well-named nodes, choose a topic, service, or action deliberately, design typed messages, match QoS to the physical data, reason about callback scheduling, launch a reproducible multi-node system, and prove that a watchdog detects stale components without issuing unsafe guesses.",
  prerequisites: [
    "Use a Linux terminal, read a process log, and distinguish source code, a built executable, and a running process.",
    "Read frequency in hertz and calculate period with T = 1/f; compare timestamps in seconds and milliseconds.",
    "Write a small Python function or class and recognize that concurrent callbacks may touch shared state in an unexpected order.",
    "Have a supported ROS 2 environment or container available; use simulation and harmless numeric messages rather than powered hardware for this chapter.",
  ],
  outcomes: [
    "Explain the difference between a ROS 2 distribution, workspace, package, executable, node, and live graph.",
    "Design a topic message with explicit meaning, type, unit, frame, timestamp, validity, and bounded data where appropriate.",
    "Choose between topics, services, and actions from the lifetime and cancellation needs of the physical task.",
    "Select compatible QoS for sensor, state, and command data and diagnose a discovery or compatibility failure from evidence.",
    "Explain how executors and callback groups schedule work, then reproduce and remove one starvation or deadlock condition.",
    "Use namespaces, parameters, lifecycle states, composition boundaries, launch files, and CLI introspection to make bring-up repeatable.",
    "Ship a telemetry, command, and watchdog graph with measured freshness limits, fault injection, safe simulated behavior, and an architecture note.",
  ],
  jobTargets: [
    roleTitles.hmi,
    roleTitles.fleet,
    roleTitles.deployment,
    roleTitles.integration,
    roleTitles.software,
  ],
  sources: [
    {
      label: "ROS 2 documentation — Lyrical Luth release",
      url: "https://docs.ros.org/en/kilted/Releases/Release-Lyrical-Luth.html",
      useFor:
        "Day 29: current distribution choice. Lyrical was released in May 2026, is an LTS release, and is supported until May 2031; the page also records executor and observability changes introduced in Lyrical.",
    },
    {
      label: "ROS 2 Lyrical — Tutorials",
      url: "https://docs.ros.org/en/lyrical/Tutorials.html",
      useFor:
        "Days 29, 30, and 34: environment setup, workspaces, packages, nodes, topics, parameters, launch, logging, composition, lifecycle demos, and command-line introspection.",
    },
    {
      label: "ROS 2 Lyrical — Topics vs Services vs Actions",
      url: "https://docs.ros.org/en/lyrical/How-To-Guides/Topics-Services-Actions.html",
      useFor:
        "Days 30 and 31: choosing continuous streams, short request-response work, or long-running preemptible work with feedback.",
    },
    {
      label: "ROS 2 documentation — Quality of Service settings",
      url: "https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Quality-of-Service-Settings.html",
      useFor:
        "Day 32: history, depth, reliability, durability, deadline, lifespan, liveliness, predefined profiles, and request-versus-offered compatibility.",
    },
    {
      label: "ROS 2 documentation — Executors",
      url: "https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Executors.html",
      useFor:
        "Days 33–35: executor scheduling, callback groups, multi-threaded behavior, wait sets, timing limitations, and the Lyrical Callback Group Events Executor.",
    },
  ],
  days: [
    {
      dayId: 29,
      mentalModel:
        "Think of a robot application as a school at lunchtime. The school building is the installed ROS distribution, a classroom cupboard is a package, a printed job card is an executable, each person currently doing one job is a node, and the live pattern of people exchanging labelled notes is the ROS graph.",
      explanation: [
        "ROS 2 is not a robot brain and it is not a complete operating system. It is a set of libraries, interface rules, build tools, command-line tools, and middleware that helps independently running pieces of robot software find one another and exchange typed data. A camera driver, localization estimator, mission manager, and operator display can be written separately yet participate in one observable system. That separation is useful only when every boundary has a clear name, data contract, timing expectation, and failure behavior.",
        "A ROS distribution is a tested family of ROS packages released together. As of this course audit, Lyrical Luth is the current long-term-support release from May 2026 and is supported through May 2031; Jazzy Jalisco remains an older supported LTS baseline. Choose the distribution that matches the team's operating system, vendor drivers, simulator, and deployment image instead of mixing package versions casually. A workspace is a directory in which packages are developed and built. An installed ROS distribution is commonly the underlay; a sourced development workspace becomes an overlay that can replace or add packages for that terminal.",
        "A package is the unit used to organize, build, test, and share related code or interfaces. It may contain several executable programs. A node is a running ROS participant created by an executable, and one process may contain one node or several composed nodes. The live ROS graph contains the node names and their topic, service, and action connections at this moment. Deleting a source file does not instantly erase a running node, and merely having a package on disk does not place anything in the graph.",
        "Nodes discover one another through the selected ROS middleware, normally across processes and possibly across machines. Discovery is distributed: there is no required central ROS master. Participants need a compatible ROS domain, network path, middleware configuration, interface type, and QoS. The graph can change as processes start, stop, or reconnect, so a diagram in a README is a design claim while `ros2 node list`, `ros2 node info`, and related tools are runtime evidence. Strong ROS debugging compares the intended graph with the observed graph before changing application code.",
        "The basic development loop is source the chosen distribution, create or enter a workspace, add packages under `src`, resolve declared dependencies, build with `colcon`, source the resulting overlay, run executables, and inspect the graph. Sourcing affects the current shell, which is why one terminal can find a package while another cannot. Record the distribution, operating system, middleware implementation, workspace revision, build command, and environment variables in the project instructions so another engineer can reproduce the same graph.",
      ],
      keyTerms: [
        { term: "ROS distribution", meaning: "A named, versioned release of compatible ROS 2 packages with a defined support period and target platforms.", physicalExample: "A field robot image may standardize on Lyrical while an older vendor driver is qualified only on Jazzy." },
        { term: "Workspace", meaning: "A directory containing ROS packages plus the build, install, and log outputs produced for them.", physicalExample: "The telemetry and watchdog packages for one prototype can live under the same `robotshift_ws/src` directory." },
        { term: "Package", meaning: "The build and distribution unit that owns related code, interfaces, tests, configuration, and metadata.", physicalExample: "A `robotshift_monitoring` package can provide both a heartbeat node and its launch file." },
        { term: "Node", meaning: "A currently running participant that performs a logical job and communicates through ROS interfaces.", physicalExample: "A battery node reads voltage while a separate display node presents it to an operator." },
        { term: "ROS graph", meaning: "The changing runtime network of nodes and their topic, service, and action connections.", physicalExample: "When the lidar driver stops, its node and publisher disappear from the observed graph." },
        { term: "Underlay and overlay", meaning: "An underlay supplies an existing ROS environment; a sourced overlay adds or replaces packages built in a workspace.", physicalExample: "The installed Lyrical desktop is the underlay and your newly built watchdog package is in the overlay." },
      ],
      physicalExamples: [
        {
          title: "Warehouse mobile robot",
          scenario:
            "A base driver reports wheel state, a localization node estimates the robot pose, a mission node requests movement, and a tablet shows progress.",
          lookFor:
            "Four logical jobs can run in separate processes or machines. The graph should expose named typed connections, while the workspace/package layout merely explains where the programs came from.",
        },
        {
          title: "Smart home as a tiny robot network",
          scenario:
            "A temperature sensor publishes readings, a controller decides whether cooling is needed, and a dashboard displays the latest state.",
          lookFor:
            "Installing all three programs does not create a live system. Only running participants with matching interfaces and discovery settings appear in the graph.",
        },
      ],
      workedExample: {
        title: "Separate files on disk from the live four-node graph",
        setup:
          "A workspace contains packages `robotshift_sensing`, `robotshift_control`, and `robotshift_monitoring`. At runtime, telemetry publishes at 20 Hz to a filter and a watchdog; a command node publishes to a simulated actuator.",
        steps: [
          "List the static package units: sensing, control, and monitoring. Do not count them as nodes.",
          "List the runtime nodes: `/telemetry`, `/filter`, `/watchdog`, and `/sim_actuator`; the graph therefore has four named participants.",
          "Draw directed topic edges `/telemetry`→`/filter`, `/telemetry`→`/watchdog`, and `/command`→`/sim_actuator`, labelling the publisher and subscriber on each side.",
          "Calculate the expected telemetry period: T = 1/20 Hz = 0.05 s = 50 ms.",
          "Mark `/watchdog` stopped and redraw the observed graph. The monitoring package still exists on disk, but its running node and subscription no longer exist.",
          "Compare the design drawing with `ros2 node list`, `ros2 node info /telemetry`, and `ros2 topic info /telemetry`; record any mismatch as a runtime fact.",
        ],
        result:
          "The design contains three packages, while the healthy runtime contains four nodes and three topic connections; a 20 Hz stream should produce samples about 50 ms apart.",
        takeaway:
          "Package structure answers where software is built; the graph answers what is running and connected now. Never substitute one for the other.",
      },
      handsOn: {
        setup:
          "Use a supported local ROS 2 installation or container with the official demo nodes. Keep this exercise on one computer and use harmless text messages.",
        steps: [
          "Open a clean terminal, source the selected ROS distribution, and record `ROS_DISTRO`, `RMW_IMPLEMENTATION`, and `ROS_DOMAIN_ID` if set.",
          "Create `~/robotshift_ws/src`, enter the workspace, and create one empty Python package named `robotshift_graph` with its dependencies declared in package metadata.",
          "Build the workspace with `colcon`, source its install overlay in a new terminal, and prove the package is discoverable there but not in an unsourced clean shell.",
          "Run the official talker and listener demo nodes in separate sourced terminals.",
          "Use node, topic, and interface CLI commands to record each node name, the topic name, publisher/subscriber counts, and message type.",
          "Stop the listener, repeat the graph inspection, and annotate exactly what disappeared and what remained.",
        ],
        observe:
          "Sourcing controls which packages the shell can resolve, while starting and stopping processes changes the live graph. The talker can remain present even with no listener.",
        doneWhen:
          "A short evidence note contains the selected distribution and middleware, successful workspace build, intended graph, observed healthy graph, observed graph after one node stops, and the exact CLI outputs that support each claim.",
      },
      jobConnection: {
        roles: [roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample:
          "During customer-site bring-up, a package builds correctly but its driver node is absent. The engineer checks which workspace was sourced, whether the process actually launched, its node name and namespace, dependency/version compatibility, and the live graph before touching sensor wiring.",
        interviewPrompt:
          "A teammate says, 'The package is installed, so the node must be running.' Explain why that is false and give a six-step evidence-first diagnosis.",
      },
      commonMistakes: [
        { mistake: "Calling a package, executable, process, and node the same thing.", correction: "State which layer you mean: package on disk, executable built from it, operating-system process, or ROS node participating in the graph." },
        { mistake: "Building an overlay and forgetting to source it in the terminal that launches the node.", correction: "Source the distribution and workspace deliberately, then record the environment in the launch or runbook." },
        { mistake: "Assuming a saved graph diagram proves current connectivity.", correction: "Inspect the live graph and compare it with the diagram under a named test condition." },
        { mistake: "Mixing packages from different distributions because their names look identical.", correction: "Use one qualified distribution and operating-system baseline unless compatibility is explicitly tested." },
      ],
      checkQuestions: [
        { question: "What changes when a node process stops but its source package remains installed?", answer: "The package stays on disk, but the node and its runtime interfaces disappear from the live graph after discovery updates." },
        { question: "Why can two terminals on the same computer find different ROS packages?", answer: "Each shell has its own sourced underlay/overlay environment and related variables." },
        { question: "What is the first evidence that a planned publisher-subscriber connection exists?", answer: "The live graph shows the intended node names, topic, matching interface type, endpoint counts, and compatible QoS; data and timestamps then prove messages are actually flowing." },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A labelled package→executable→node→graph visual prevents a foundational category error and makes the live distributed topology materially easier to inspect than prose alone.",
      },
    },
    {
      dayId: 30,
      mentalModel:
        "A topic is a labelled conveyor belt carrying identical-shaped boxes. Publishers place boxes on it; subscribers take copies when available. The box shape is the message type, while the printed unit, frame, and timestamp tell a receiver what the numbers mean in the physical world.",
      explanation: [
        "A ROS topic supports asynchronous publish-subscribe communication. A publisher sends typed messages under a topic name without naming a particular receiver or waiting for a reply. Zero, one, or several subscribers may listen, and a topic may also have multiple publishers if the system design permits it. This loose coupling is excellent for ongoing sensor data and state streams, but it means a publisher cannot treat message publication as proof that a specific consumer processed the data.",
        "The topic name and message type form only part of the contract. A numeric field such as `value: 2.4` is unusable unless a reader knows whether it is volts, metres, radians, or metres per second; which coordinate frame it belongs to; when it was measured; and whether the measurement is valid. Prefer established standard messages when their semantics fit. When designing a custom `.msg`, use clear field names, bounded sequences or strings where resource limits matter, a timestamp and frame where the data is spatial or time-sensitive, and comments that state units and valid ranges.",
        "Measurement time and arrival time answer different questions. A camera can capture an image at 10.000 s, spend 35 ms processing it, and deliver it at 10.050 s. The image describes the earlier physical scene. A downstream node that substitutes arrival time may combine it with a newer robot pose and create a spatial error. Preserve source timestamps across the pipeline, measure age separately, and define what the consumer does when data is too old or out of order.",
        "Rate affects freshness, bandwidth, and callback load. At frequency f, the ideal period is T=1/f. A 20 Hz publisher aims for one message every 50 ms, not twenty messages all at once each second. Payload bandwidth can be estimated as payload bytes × messages per second, but actual network use is higher because serialization, middleware, discovery, and transport add overhead. Measure message rate, size, age, and loss on the deployed path rather than turning the estimate into a guarantee.",
        "A useful message is stable at its public boundary. Do not publish a whole internal object merely because it is convenient. Consumers then depend on fields they do not need and every internal refactor becomes an interface change. Design around physical meaning and consumer needs, version incompatible semantics deliberately, and write tests that reject wrong units, missing timestamps, invalid enum values, oversized arrays, and impossible ranges.",
      ],
      keyTerms: [
        { term: "Topic", meaning: "A named channel for asynchronous streams of typed messages.", physicalExample: "The `/battery_state` topic continuously carries voltage, percentage, and status." },
        { term: "Publisher", meaning: "A ROS endpoint that writes messages of one declared type to a topic.", physicalExample: "A motor driver publishes encoder readings after each measurement cycle." },
        { term: "Subscriber", meaning: "A ROS endpoint whose callback receives messages from a compatible topic publisher.", physicalExample: "A speed estimator subscribes to wheel encoder samples." },
        { term: "Message type", meaning: "The generated data structure and field contract shared by publishers and subscribers.", physicalExample: "`sensor_msgs/msg/Temperature` includes a header, temperature, and variance." },
        { term: "Source timestamp", meaning: "The time at which the physical observation was made, not simply when a subscriber received it.", physicalExample: "A camera exposure time is earlier than the moment the processed image reaches navigation." },
        { term: "Message age", meaning: "The difference between the current/receipt time and the source timestamp.", physicalExample: "A pose received at 12.075 s with stamp 12.000 s is already 75 ms old." },
      ],
      physicalExamples: [
        { title: "Electronics-bay temperature", scenario: "A sensor publishes 32.5 °C with a measurement timestamp and variance; a cooling controller and operator UI both subscribe.", lookFor: "One stream serves two consumers, but each consumer still needs an age limit and cannot infer that the other processed the sample." },
        { title: "Conveyor encoder", scenario: "An encoder reports a count every 10 ms while a velocity estimator sometimes takes 15 ms to process a callback.", lookFor: "The queue can accumulate older measurements. Timestamp order, depth, callback duration, and stale-data policy matter as much as nominal publish rate." },
      ],
      workedExample: {
        title: "Check cadence, payload estimate, and freshness",
        setup: "A simulated telemetry message has a 64-byte payload and is published at 20 Hz. One sample is stamped 5.000 s and arrives at the monitor at 5.075 s; the monitor's maximum accepted age is 60 ms.",
        steps: [
          "Calculate the intended period: T = 1/20 = 0.05 s = 50 ms.",
          "Estimate payload-only throughput: 64 bytes × 20 messages/s = 1,280 bytes/s.",
          "State the limit of that estimate: middleware and transport overhead are not included.",
          "Calculate message age: 5.075 s - 5.000 s = 0.075 s = 75 ms.",
          "Compare 75 ms with the 60 ms acceptance limit and classify this sample as stale for that consumer.",
          "Keep the sample available for diagnostics, but prevent it from updating the live safe-state decision as if it were fresh.",
        ],
        result: "The stream targets a 50 ms period and at least 1,280 payload bytes/s; the example sample is 75 ms old and exceeds the monitor's 60 ms freshness contract.",
        takeaway: "Rate, bandwidth, and age are separate properties. A message can arrive at the expected rate yet still contain stale physical information.",
      },
      handsOn: {
        setup: "Use Python ROS 2 nodes and a simulated temperature value. No physical sensor or actuator is required.",
        steps: [
          "Create a publisher node that emits `sensor_msgs/msg/Temperature` at 2 Hz and fills the source timestamp, frame id `electronics_bay`, temperature in °C, and variance.",
          "Create a monitor subscriber that logs source stamp, receipt time, calculated age in milliseconds, unit, and whether age is within a declared limit.",
          "Run a second subscriber representing an operator display and prove both receive the same typed stream without the publisher naming either consumer.",
          "Use CLI tools to inspect the topic type, message fields, publisher/subscriber counts, measured rate, and one live message.",
          "Add an artificial 300 ms publication delay before one sample while keeping its original source timestamp; verify the monitor marks it stale.",
          "Document the message contract: meaning, unit, frame, timestamp source, valid range, expected rate, freshness limit, and invalid-data behavior.",
        ],
        observe: "Subscribers receive independently, and a delayed sample can look numerically reasonable while its timestamp proves it is not current.",
        doneWhen: "Two subscribers receive the typed stream, the normal measured rate is close to 2 Hz, the delayed sample is rejected by age, and the contract is readable without opening the publisher implementation.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.fleet, roleTitles.integration, roleTitles.software],
        workExample: "A fleet UI displays robot pose and battery data received through a bridge. The engineer preserves source timestamps and units, marks stale values visibly, bounds queues, and avoids showing an old location as live after a network interruption.",
        interviewPrompt: "Design a wheel-speed topic used by control, logging, and a dashboard. State the message fields, units, frame/timestamp rules, rate, freshness limits, and what publication does not prove.",
      },
      commonMistakes: [
        { mistake: "Publishing an unlabelled `Float64` for a physical quantity.", correction: "Use or design a message whose field name, unit, frame, timestamp, and validity are explicit." },
        { mistake: "Using callback arrival time as the sensor measurement time.", correction: "Carry the source stamp through the pipeline and calculate transport/processing age separately." },
        { mistake: "Assuming publish success means every subscriber processed the message.", correction: "Publication hands data to the middleware; consumer processing needs its own acknowledgement or observable state if required." },
        { mistake: "Estimating payload bandwidth and reporting it as measured network traffic.", correction: "Label it as a lower-bound estimate and measure serialized/transport behavior on the actual system." },
      ],
      checkQuestions: [
        { question: "Why is a topic a better default for a continuing temperature stream than a service?", answer: "The producer decides when each new measurement exists, and any number of subscribers can receive the asynchronous stream without repeatedly requesting it." },
        { question: "What must match before a publisher and subscriber can exchange topic data?", answer: "They need compatible topic names after namespace/remapping, the same interface type, successful discovery, and compatible QoS." },
        { question: "A 10 Hz stream delivers one message every 100 ms, but each message is 500 ms old. Is the stream healthy?", answer: "Its arrival cadence is regular, but its physical information violates freshness; rate alone is not health." },
      ],
      visual: { show: false, mode: "concept", reason: "The publisher-conveyor metaphor is already made concrete by two live subscribers and a delayed timestamp; another generic node-arrow graphic would repeat Day 29 without adding a new decision." },
    },
    {
      dayId: 31,
      mentalModel: "Use a notice board for an ongoing stream, an information desk for one quick question, and a tracked delivery job for work that takes time. The tracked job needs an identifier, progress reports, a final outcome, and a real cancellation handshake.",
      explanation: [
        "Topics, services, and actions represent different lifetimes. A topic is for ongoing asynchronous data. A service is a named request-response interaction expected to finish quickly: ask for calibration status, reset a harmless simulation counter, or calculate a small result. A client waits for a server response, so a slow or missing service can tie up the calling logic. Timeouts, availability checks, and idempotency still matter; the word 'service' does not make network calls reliable or side effects safe.",
        "An action represents long-running work that needs a goal, periodic feedback, a terminal result, and cancellation or preemption. Navigation, docking, arm motion, and a multi-second perception scan are common examples. Each accepted goal has an identity and state. The server may reject a goal before execution, report progress while running, and finish as succeeded, canceled, or aborted. A result should state task outcome, not merely that a function returned.",
        "Requesting cancellation is not the same as stopping physical motion. The action server must receive and accept the cancellation request, the execution loop must notice it, the trusted controller must bring the simulated or physical system to its declared safe state, and the action must report a terminal canceled result. Measure time from cancel request to quiet/safe output. For real hardware, an independent safety layer remains necessary because ROS action cancellation is an application protocol, not an emergency stop.",
        "A service used for a long robot task creates poor behavior: no natural feedback, awkward client timeouts, and no standard goal cancellation. A topic used as an improvised request can create duplicate or uncorrelated commands unless IDs, ownership, acknowledgement, and expiry are invented. Choose the interface from semantics first. Then define retry rules, unique goal/request IDs where needed, deadlines, terminal states, and whether repeating a request is safe.",
        "Client code must remain responsive while work is in progress. Prefer asynchronous calls inside callbacks. Do not block an executor thread waiting for a response that requires another callback on the same blocked execution path; Day 33 will reproduce that deadlock. Even with the right interface type, the system needs bounded waits and observable transitions for server unavailable, goal rejected, feedback missing, cancel rejected, timeout, abort, and late result.",
      ],
      keyTerms: [
        { term: "Service", meaning: "A short request-response interface between a client and a server.", physicalExample: "Ask a localization node whether its map is loaded and receive one status response." },
        { term: "Action", meaning: "A long-running goal interface with feedback, terminal result, and cancellation support.", physicalExample: "Request a rover to move two metres while receiving distance-remaining feedback." },
        { term: "Goal handle", meaning: "The client's/server's reference to one accepted or rejected action goal and its state.", physicalExample: "Two simultaneous docking requests must not share one anonymous progress record." },
        { term: "Feedback", meaning: "Intermediate progress data emitted while an accepted action is executing.", physicalExample: "A docking action reports current phase and remaining distance." },
        { term: "Terminal result", meaning: "The final outcome associated with a goal, such as succeeded, canceled, or aborted plus task data.", physicalExample: "The robot reports aborted because the dock marker was lost, rather than simply 'finished'." },
        { term: "Idempotency", meaning: "The property that repeating a request has the same intended effect as performing it once.", physicalExample: "Retrying 'set light to off' is naturally safer than retrying 'toggle light'." },
      ],
      physicalExamples: [
        { title: "Status check versus docking", scenario: "An operator asks whether the charging dock is available, then commands a robot to dock.", lookFor: "Availability is a quick service response; docking is a long action with acceptance, phase feedback, cancellation, and a task-level result." },
        { title: "Printer queue", scenario: "Reading toner level is immediate, while printing 100 pages takes time and may be canceled after page 12.", lookFor: "A short query and a tracked long job need different contracts even though both involve the same machine." },
      ],
      workedExample: {
        title: "Trace a cancellation from request to terminal state",
        setup: "A simulated move action publishes feedback at 20 Hz. The client requests cancellation at 1.200 s, the server accepts it at 1.225 s, simulated velocity reaches zero at 1.280 s, and the canceled result arrives at 1.310 s.",
        steps: [
          "Calculate feedback period: T = 1/20 = 0.05 s = 50 ms.",
          "Calculate cancel-request-to-acceptance latency: 1.225 - 1.200 = 25 ms.",
          "Calculate cancel-request-to-zero-output latency: 1.280 - 1.200 = 80 ms.",
          "Express the zero-output latency in feedback periods: 80/50 = 1.6 periods.",
          "Calculate cancel-request-to-terminal-result latency: 1.310 - 1.200 = 110 ms.",
          "Keep the three measurements separate: protocol acceptance, physical/simulated output stop, and action terminal reporting are different events.",
        ],
        result: "The cancellation was accepted after 25 ms, output became quiet after 80 ms, and the client observed the terminal canceled result after 110 ms.",
        takeaway: "A cancel button is only an input. Credible cancellation evidence follows the request through acceptance, bounded safe output, and a terminal result.",
      },
      handsOn: {
        setup: "Implement a harmless Python action called `SimMove` whose goal is a distance, feedback is distance remaining, and result contains final state and distance completed.",
        steps: [
          "Define goal, result, and feedback fields with units and reject zero, negative, non-finite, or over-limit goals.",
          "Implement an action server that advances only a simulated numeric position at a fixed rate and emits timestamped progress.",
          "Implement a client that records goal sent, accepted/rejected, each feedback sample, cancel requested, cancel response, and terminal result.",
          "Run one normal goal to success and verify monotonically decreasing distance remaining.",
          "Run a second goal, request cancellation halfway, check for the request in the server loop, set simulated output to zero, and return a canceled terminal result.",
          "Run server-unavailable, rejected-goal, and feedback-stall cases with explicit timeouts; never connect this exercise to motors.",
        ],
        observe: "A responsive execution loop can notice cancellation between updates. A blocking loop or unchecked sleep delays cancellation even though the client sent it immediately.",
        doneWhen: "Logs prove success, rejection, timeout, and cancellation paths; cancellation has measured request-to-zero and request-to-result latency, and no run leaves the simulated command non-zero.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample: "A teleoperation or mission UI sends a navigation goal and exposes cancel. The engineer must show goal identity, current state, stale feedback, rejection, and final outcome, while ensuring application cancellation cannot be mistaken for an emergency-stop guarantee.",
        interviewPrompt: "When would you choose a service rather than an action for robot calibration? Describe the failure and cancellation behavior for both a quick status query and a 30-second calibration motion.",
      },
      commonMistakes: [
        { mistake: "Implementing a 30-second, preemptible robot motion as a blocking service.", correction: "Use an action with feedback, timeout, cancel handling, and a task-level terminal result." },
        { mistake: "Treating 'cancel request sent' as proof that output stopped.", correction: "Observe cancel acceptance, safe/quiet output, bounded latency, and terminal canceled state separately." },
        { mistake: "Retrying a side-effecting service automatically after an uncertain timeout.", correction: "Use an idempotent command or request ID and reconcile the actual server state before retrying." },
        { mistake: "Returning action success because the execution loop ended.", correction: "Evaluate the physical task acceptance criterion and distinguish succeeded, canceled, rejected, and aborted outcomes." },
      ],
      checkQuestions: [
        { question: "Which interface fits a continuous camera stream, a quick map-name query, and a navigation goal?", answer: "A topic for camera data, a service for the quick query, and an action for long-running cancelable navigation." },
        { question: "What four observations make an action cancellation credible?", answer: "The request was sent, the server accepted it, output reached the declared safe/quiet state within a bound, and the goal reached a canceled terminal result." },
        { question: "Why is a unique goal or request identifier useful after a network timeout?", answer: "It lets client and server reconcile whether the original work was accepted or completed instead of accidentally creating duplicate work." },
      ],
      visual: { show: false, mode: "failure", reason: "The action state is better learned by inspecting the timestamped cancellation trace and terminal outcomes; the existing generic state visual would not prove that simulated output actually stopped." },
    },
    {
      dayId: 32,
      mentalModel: "QoS is the delivery agreement attached to a message channel. A live camera feed, an emergency state, and a static map are all 'data', but one values newest frames, one values timely state changes, and one must be available to late joiners. They should not share a delivery policy by habit.",
      explanation: [
        "ROS 2 uses a middleware layer, commonly based on DDS, to discover participants and transport data. Nodes in the same ROS domain announce endpoints and establish connections when topic names, interface types, and Quality of Service policies are compatible. Discovery failure can come from a different `ROS_DOMAIN_ID`, blocked multicast or ports, container/network isolation, middleware configuration, or incompatible security settings. Seeing two machines on the same Wi-Fi is not proof that their ROS endpoints can discover one another.",
        "A QoS profile combines policies. Reliability may be best effort or reliable. History and depth decide how many samples are retained when using keep-last. Durability decides whether a late-joining subscriber can receive retained samples from a transient-local publisher or only future samples from a volatile one. Deadline expresses an expected maximum interval, lifespan limits how long data remains useful, and liveliness helps detect whether a publisher is considered alive. These policies describe middleware behavior; application-level semantic checks and safe-state logic are still required.",
        "Reliable does not mean 'always safest'. On a lossy link, retransmitting every old camera frame can fill queues and increase age while the robot needs the newest view. Best effort with a small depth is often appropriate for high-rate sensors when occasional loss is acceptable. A slowly changing map or configuration may need transient-local durability so a subscriber that starts later receives the latest retained state. Command and safety-related data need a hazard-specific design, acknowledgement or state feedback when required, and independent safety controls—not a blind reliable flag.",
        "Compatibility follows a request-versus-offered model. For reliability, a reliable publisher can satisfy a best-effort or reliable subscriber, but a best-effort publisher cannot satisfy a subscriber requesting reliable delivery. Durability has a similar direction: a volatile publisher cannot provide historical data requested by a transient-local subscriber. A connection can therefore be visible as two endpoints on the same topic yet deliver nothing because the policies do not match. Inspect offered/requested QoS rather than rewriting callbacks.",
        "Choose QoS from measured physical needs. Write the expected source rate, maximum useful age, tolerated loss, late-join behavior, memory bound, reconnect behavior, and consequence of missing data. Then inject loss, delay, restart, and incompatible profiles. Topic rate and delivery percentage are useful measurements, but they do not reveal whether received data was fresh enough, in order, or semantically valid.",
      ],
      keyTerms: [
        { term: "DDS discovery", meaning: "The distributed middleware process by which ROS endpoints announce themselves and find compatible peers.", physicalExample: "A laptop dashboard discovers the rover's battery publisher only when network and domain settings permit it." },
        { term: "Reliability", meaning: "A QoS policy choosing best-effort delivery or middleware retry behavior for reliable delivery.", physicalExample: "A live camera may prefer fresh best-effort frames; a low-rate state transition may require stronger delivery evidence." },
        { term: "History and depth", meaning: "Policies controlling whether samples are kept and the bounded number retained for keep-last.", physicalExample: "Depth one lets a slow display skip old pose samples and work on the newest available pose." },
        { term: "Durability", meaning: "A policy controlling whether data can be retained for subscribers that join after publication.", physicalExample: "A transient-local map publisher can provide its last map to a visualization started later." },
        { term: "Deadline", meaning: "The expected maximum time between successive data samples for a connection.", physicalExample: "A 10 Hz heartbeat expects samples around 100 ms apart and can report a missed 150 ms gap against a 120 ms deadline." },
        { term: "Liveliness", meaning: "A middleware indication of whether a publisher is considered alive under a lease policy.", physicalExample: "A node can lose its liveliness lease even before an operator notices its process is gone." },
      ],
      physicalExamples: [
        { title: "Camera stream versus static map", scenario: "A camera sends 30 frames/s over variable Wi-Fi; a map changes once during startup and a viewer may launch five minutes later.", lookFor: "The camera values current frames and bounded queues, while the map values a retained latest sample for a late joiner." },
        { title: "Two robots in a lab", scenario: "Student A's laptop controls robot A and Student B's laptop controls robot B on the same network.", lookFor: "Separate ROS domain IDs prevent accidental discovery, but domain separation is operational isolation rather than authentication or a complete security boundary." },
      ],
      workedExample: {
        title: "Diagnose a silent subscriber and a missed deadline",
        setup: "A publisher offers best-effort reliability at 10 Hz. A subscriber requests reliable delivery and a 120 ms deadline. The publisher sends 100 samples; after compatibility is corrected, 96 arrive, and one measured gap is 150 ms.",
        steps: [
          "Calculate nominal period: T = 1/10 = 0.1 s = 100 ms.",
          "Compare reliability: best-effort offered cannot satisfy reliable requested, so the original pair is incompatible and exchanges no data.",
          "Change the subscriber to request best effort only if the application's loss tolerance permits it; do not change policy merely to make the warning disappear.",
          "Calculate delivery fraction after connection: 96/100 = 0.96 = 96%.",
          "Compare the 150 ms observed gap with the 120 ms deadline; the gap misses the deadline by 30 ms.",
          "Report both results: 96% sample delivery and one missed deadline. Neither number alone proves the received samples were fresh or safe to use.",
        ],
        result: "The initial silence is explained by reliability incompatibility. After a justified compatible profile is selected, delivery is 96%, but a 150 ms interval violates the 120 ms deadline.",
        takeaway: "QoS diagnosis starts with compatibility, then measures rate, gaps, age, loss, and reconnect behavior against the data's real purpose.",
      },
      handsOn: {
        setup: "Use two local ROS 2 terminals and a harmless numbered-message publisher/subscriber. Save the original domain and middleware environment before changing it.",
        steps: [
          "Run the endpoints with the same domain, topic type, and compatible best-effort profiles; record endpoint information and received sequence numbers.",
          "Change only the subscriber to reliable while the publisher remains best effort; inspect the compatibility warning and prove messages stop.",
          "Restore a justified compatible pair, use keep-last depth one, slow the subscriber, and observe that current data replaces queued old samples.",
          "Run both endpoints with different temporary `ROS_DOMAIN_ID` values and prove they do not discover each other; then restore the original environment.",
          "Restart a volatile publisher and a late subscriber, then repeat with a transient-local latest-state example; record what a late joiner receives.",
          "Create a table for camera, map, heartbeat, and operator-command data listing reliability, durability, depth, deadline/age limit, loss tolerance, and rationale.",
        ],
        observe: "Identical topic names and types are insufficient when QoS or domains differ. A connection that works after changing QoS still needs a reason tied to freshness, loss, and task risk.",
        doneWhen: "The evidence includes one compatibility failure, one domain discovery failure, one late-join comparison, measured sequence/rate behavior, and a defensible QoS table rather than a universal 'reliable' default.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.fleet, roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample: "At a warehouse, a dashboard sees robot status but not lidar. The engineer compares domains, network reachability, middleware choice, endpoint type, and offered/requested QoS; then chooses a sensor profile that keeps frames fresh rather than creating a growing reliable backlog.",
        interviewPrompt: "A best-effort lidar publisher and reliable subscriber appear on the same topic but exchange no scans. Explain the compatibility rule, a justified fix, and the measurements needed before calling the stream healthy.",
      },
      commonMistakes: [
        { mistake: "Setting every topic to reliable because the word sounds safer.", correction: "Choose policies from freshness, loss tolerance, late-join needs, memory bounds, and task hazards; test under the real link conditions." },
        { mistake: "Treating `ROS_DOMAIN_ID` as authentication or complete network security.", correction: "Use it for discovery isolation, then apply ROS security and network controls appropriate to the threat model." },
        { mistake: "Checking only topic name and message type when no data arrives.", correction: "Inspect domain, discovery path, middleware, endpoint counts, and requested/offered QoS compatibility." },
        { mistake: "Using a large queue to hide a slow subscriber.", correction: "Measure callback capacity and data age; bound the queue and define overflow or newest-data behavior explicitly." },
      ],
      checkQuestions: [
        { question: "Can a best-effort publisher satisfy a subscriber that requests reliable delivery?", answer: "No. The publisher does not offer the minimum reliability requested by that subscriber." },
        { question: "Why can transient-local durability help a map viewer?", answer: "A compatible late-joining viewer can receive the retained latest map instead of waiting for it to be republished." },
        { question: "What does a 99% delivery rate fail to tell you?", answer: "It does not show sample age, ordering, deadline misses, semantic validity, which sample was lost, or whether the missing data caused an unsafe task state." },
      ],
      visual: { show: false, mode: "math", reason: "The compatibility and QoS selection tables carry the exact decision logic; a decorative network diagram would repeat the graph visual without exposing requested-versus-offered policy." },
    },
    {
      dayId: 33,
      mentalModel: "A node's callbacks are jobs waiting at a small workshop. The executor is the foreman deciding which ready job receives a worker thread. Callback groups are rules saying which jobs may overlap. Adding workers does not help if every job is locked inside one 'only one at a time' room.",
      explanation: [
        "Subscriptions, timers, service handlers, action handlers, and completion callbacks do not execute themselves. An executor waits for ready ROS entities and invokes their callbacks using one or more operating-system threads. A single-threaded executor runs one callback at a time. A multi-threaded executor can run callbacks concurrently only when their callback-group rules permit it. The middleware usually retains incoming data according to QoS until a callback takes it, so callback scheduling directly affects age, backlog, and deadline behavior.",
        "A mutually exclusive callback group prevents callbacks in that group from overlapping. A reentrant group permits overlap, including another invocation of the same callback, so its code and state must be safe for concurrency. Different groups can execute in parallel under a multi-threaded executor. The default callback group is mutually exclusive; placing every entity in that group can make a multi-threaded executor behave like a single-threaded one. Thread count alone is therefore not a concurrency design.",
        "A classic deadlock occurs when a callback makes a synchronous service call and waits, while the response-completion callback is assigned to the same mutually exclusive group. The waiting callback owns the group's only execution permission, so the completion callback cannot run and release it. Prefer asynchronous calls inside callbacks. When synchronous behavior is unavoidable, separate the waiting callback and client into compatible groups and prove the design under timeout and shutdown—but asynchronous state machines are usually easier to bound.",
        "Concurrency can remove blocking and also create races. Two callbacks updating the same latest command, counter, or state machine may interleave. Protect shared state with a small clear ownership model, mutually exclusive group, lock, immutable message passing, or a single state-owning callback. Do not hold a lock while waiting for a ROS response. Record callback start/end, message source time, queue age, thread/group identity when useful, and deadline misses so scheduling failures are visible.",
        "Every callback consumes part of a timing budget. A 20 Hz input arrives every 50 ms. If its callback consistently needs 80 ms on one execution path, backlog or dropped/overwritten samples are inevitable depending on QoS. Fixing it may mean doing less work in the callback, moving slow work to a bounded worker, lowering rate, using newest-data semantics, changing callback groups/executor, or improving the algorithm. Measure before adding threads, because parallel callbacks can increase contention and make ordering harder.",
      ],
      keyTerms: [
        { term: "Callback", meaning: "A function invoked when a subscription, timer, service, action, or related event is ready.", physicalExample: "A battery callback runs when a new battery message is available." },
        { term: "Executor", meaning: "The ROS runtime component that waits for ready work and schedules callbacks on one or more threads.", physicalExample: "A single-threaded executor processes a timer before it can process a newly arrived status message." },
        { term: "Mutually exclusive callback group", meaning: "A group whose callbacks are never scheduled to overlap one another.", physicalExample: "Two callbacks that update one unprotected state machine can be kept sequential." },
        { term: "Reentrant callback group", meaning: "A group whose callbacks may run concurrently, including overlapping invocations.", physicalExample: "Independent image jobs may overlap only if their data and libraries are concurrency-safe." },
        { term: "Deadlock", meaning: "A state where work waits forever for an event or resource that cannot run or be released because of the waiting arrangement.", physicalExample: "A timer waits for a service response whose completion callback is blocked by that same timer's callback group." },
        { term: "Starvation", meaning: "A ready callback repeatedly fails to get execution time because other work monopolizes the available path.", physicalExample: "A long image callback delays a short watchdog timer until its deadline passes." },
      ],
      physicalExamples: [
        { title: "One cashier and an age check", scenario: "A cashier pauses a transaction and waits for a supervisor, but the supervisor can respond only through the same cashier station now occupied by the waiting transaction.", lookFor: "The wait cannot complete. A separate response path or asynchronous handoff is needed, mirroring the same-group synchronous service deadlock." },
        { title: "Slow camera processing beside heartbeat monitoring", scenario: "An 80 ms image callback and a 5 ms heartbeat callback share a single-threaded executor while heartbeats arrive every 50 ms.", lookFor: "Heartbeat work can be late despite low CPU average. Separate groups/threads help only if shared state and timing are designed safely." },
      ],
      workedExample: {
        title: "Find overload and explain a same-group deadlock",
        setup: "A telemetry subscription receives at 20 Hz. Its callback takes 80 ms. A 100 ms timer in the same default mutually exclusive group makes a synchronous service call whose done-callback inherits that group.",
        steps: [
          "Calculate input period: T = 1/20 = 50 ms.",
          "Compare callback duration with period: 80 ms - 50 ms = 30 ms of excess work per sample on a serial path.",
          "After five arrivals, required callback work is 5 × 80 = 400 ms while only about 250 ms of arrival time has elapsed; the work demand exceeds the serial budget by 150 ms.",
          "Trace the timer: it enters the default mutually exclusive group and waits synchronously for a service response.",
          "Trace the response: its completion callback needs the same group, but that group cannot schedule it until the waiting timer returns.",
          "Conclude that extra executor threads alone do not resolve this arrangement; use an asynchronous client flow or separate compatible callback groups with bounded waits.",
        ],
        result: "The telemetry path is overloaded by 30 ms per sample, and the service path deadlocks because the waiting callback blocks the only group allowed to complete its wait.",
        takeaway: "Scheduling bugs are explainable with arrival periods, callback durations, group membership, and wait dependencies—not with 'ROS is slow'.",
      },
      handsOn: {
        setup: "Use a Python ROS 2 node with a timer, a numbered-message subscription, and a harmless add-two-numbers service. Log monotonic timestamps and callback names.",
        steps: [
          "Run the timer and subscriber in the default callback group under a single-threaded executor; add an 80 ms simulated workload and measure timer jitter.",
          "Increase the publish rate until callback work exceeds the available serial budget; record sequence gaps, age, and maximum timer delay.",
          "Create a timer callback that makes a synchronous service call through a client in the same default group and reproduce the bounded test timeout rather than waiting forever.",
          "Replace the synchronous wait with an asynchronous request and completion state; prove the timer remains responsive.",
          "Under a multi-threaded executor, place independent callbacks into deliberate groups and repeat the measurement.",
          "Introduce one shared counter without protection to understand the risk, then assign single ownership or a safe exclusion rule and document why it is correct.",
        ],
        observe: "A multi-threaded executor does not create useful parallelism when all callbacks remain in one mutually exclusive group. Asynchronous completion removes the circular wait but still needs timeout and shutdown handling.",
        doneWhen: "Evidence contains the original jitter/age measurements, one reproducible deadlock timeout, a corrected asynchronous or properly grouped design, and a diagram showing callback group membership and shared-state ownership.",
      },
      jobConnection: {
        roles: [roleTitles.fleet, roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample: "A robot appears to freeze only when diagnostics run during navigation. The engineer correlates callback durations, group assignments, executor threads, service waits, and message age; then removes the circular wait and adds a regression test for heartbeat deadline.",
        interviewPrompt: "Why can a multi-threaded executor still behave serially, and how can a synchronous service call from a callback deadlock? Draw the wait dependency and propose a bounded fix.",
      },
      commonMistakes: [
        { mistake: "Switching to a multi-threaded executor and assuming every callback now runs in parallel.", correction: "Inspect callback groups; the default mutually exclusive group can serialize all entities despite several threads." },
        { mistake: "Making a synchronous service or action call from a callback without tracing its completion callback.", correction: "Prefer asynchronous calls or place dependencies in compatible groups, then enforce timeout and shutdown behavior." },
        { mistake: "Putting all work in reentrant groups to avoid blocking.", correction: "Use reentrancy only when overlapping access, library calls, and shared state are proven thread-safe." },
        { mistake: "Adding queue depth when callbacks are slower than arrivals.", correction: "Measure the service capacity and data age; reduce work/rate, bound or replace old samples, or redesign scheduling." },
      ],
      checkQuestions: [
        { question: "Why might four executor threads still execute a node's callbacks one at a time?", answer: "If all entities use the same mutually exclusive callback group, that group permits only one callback at a time." },
        { question: "What creates the same-group synchronous service deadlock?", answer: "The waiting callback occupies the mutually exclusive group while the response completion callback needs that same group to run and satisfy the wait." },
        { question: "What should you measure before deciding to add threads?", answer: "Arrival periods, callback durations, message age, queue/loss behavior, deadline misses, wait dependencies, and shared-state contention." },
      ],
      visual: { show: true, mode: "failure", reason: "A wait-for graph showing timer→response and response→occupied callback group makes the circular deadlock visible in a way that linear text and timing numbers alone cannot." },
    },
    {
      dayId: 34,
      mentalModel: "A production ROS system needs more than a pile of start commands. Namespaces give each robot an address, launch is the checked opening routine, lifecycle states prevent a component from working before it is ready, composition chooses which workers share a room, and introspection is the roll call.",
      explanation: [
        "Managed lifecycle nodes expose defined primary states such as unconfigured, inactive, active, and finalized, plus transitions including configure, activate, deactivate, cleanup, and shutdown. Configuration can allocate resources and validate parameters; activation can begin publishers or task work only after dependencies are ready. A transition can fail and must report why. Not every ordinary ROS node implements the lifecycle interface, so inspect capability rather than assuming a lifecycle command applies.",
        "Composition loads multiple component nodes into one process. It can reduce process and communication overhead and support efficient intra-process transfer, but it also changes failure isolation: a crash or resource problem can affect every component in the container. Separate processes cost more but provide clearer operating-system isolation and independent restart. Choose the boundary from latency, copying, resource use, fault containment, security, and deployment needs; do not compose everything merely because the tool exists.",
        "Namespaces and remapping let reusable node code run more than once without name collisions. A fleet might use `/robot_01/telemetry` and `/robot_02/telemetry`, while each node internally publishes relative name `telemetry`. Avoid hard-coded global names that escape the namespace. Parameters configure a node instance; they need types, units, ranges, defaults, ownership, source, and startup validation. A parameter file plus launch arguments should make the effective configuration inspectable and versioned.",
        "A launch description starts processes or components with explicit names, namespaces, remappings, parameter files, environment, conditions, and shutdown behavior. Launch order alone does not prove readiness: use lifecycle transitions, service/action availability, health state, or explicit events for dependencies. A reproducible bring-up captures the exact command, configuration revision, expected graph, and acceptance checks rather than relying on terminal history.",
        "ROS CLI and rqt tools expose the live system: list and inspect nodes, topics, services, actions, parameters, lifecycle states, components, interfaces, logs, rates, bandwidth, and environment diagnostics. Use them as a structured investigation: identity and namespace, graph endpoints and types, QoS, timestamps/rates, parameters, lifecycle/readiness, logs, and process/network facts. The CLI often uses a discovery cache/daemon, so if evidence conflicts with process reality, verify both and refresh deliberately rather than trusting one stale view.",
      ],
      keyTerms: [
        { term: "Lifecycle node", meaning: "A managed node exposing standardized states and externally requested transitions.", physicalExample: "A camera node can configure its device while inactive and publish only after activation." },
        { term: "Composition", meaning: "Loading multiple component nodes into one operating-system process.", physicalExample: "An image decoder and rectifier can share a component container to reduce copies." },
        { term: "Namespace", meaning: "A hierarchical prefix that scopes ROS names so reusable instances do not collide.", physicalExample: "The same telemetry node runs as `/robot_01/telemetry_node` and `/robot_02/telemetry_node`." },
        { term: "Remapping", meaning: "Changing a ROS name at runtime without changing the node's source code.", physicalExample: "A generic `scan` subscription is remapped to `/front_lidar/scan` for one robot." },
        { term: "Launch description", meaning: "A versioned declaration that starts and configures a multi-process or composed ROS system.", physicalExample: "One launch file starts simulation telemetry, watchdog, UI bridge, parameters, and namespaces." },
        { term: "Introspection", meaning: "Inspecting the live graph, interfaces, configuration, state, and timing through ROS tools.", physicalExample: "`ros2 node info` reveals that a node subscribes to a differently named topic than expected." },
      ],
      physicalExamples: [
        { title: "Two identical AMRs", scenario: "Two robots run the same telemetry, command, and watchdog software on one development network.", lookFor: "Relative names under `/robot_01` and `/robot_02` prevent collisions; a hard-coded `/cmd_vel` can accidentally merge the systems." },
        { title: "Camera bring-up sequence", scenario: "A camera driver must open the device, load calibration, and pass a self-test before consumers use images.", lookFor: "Configure performs preparation, inactive exposes readiness without live data, activate begins publication, and a failed configure transition blocks activation with a reason." },
      ],
      workedExample: {
        title: "Design a two-robot launch and readiness sequence",
        setup: "Robot 01 and Robot 02 each need telemetry and watchdog nodes. Telemetry must validate a 10 Hz rate before the watchdog becomes active. Both robots run on the same development computer.",
        steps: [
          "Use relative node/interface names inside reusable packages and launch each pair under `/robot_01` and `/robot_02`.",
          "Load separate parameter files containing `publish_rate_hz: 10`, freshness limits, robot identifier, and units.",
          "Launch telemetry nodes into unconfigured state, request configure, and reject startup if the rate or identifier is invalid.",
          "After telemetry reaches inactive/ready, configure the corresponding watchdog and inspect its subscriptions.",
          "Activate telemetry, observe approximately T = 1/10 = 100 ms samples, then activate the watchdog only after fresh data exists.",
          "Use node, topic, parameter, and lifecycle introspection to compare the live graph/state with the launch design for both namespaces.",
          "Stop Robot 02 telemetry and verify Robot 01's graph and state remain distinct and unaffected.",
        ],
        result: "Two namespaced node pairs start from one reusable launch pattern, validate instance-specific configuration, transition in dependency order, and can be inspected independently.",
        takeaway: "Launch starts entities; lifecycle and health evidence decide readiness. Namespaces make reuse safe only when source code avoids accidental global names.",
      },
      handsOn: {
        setup: "Extend the chapter's simulated telemetry and watchdog packages. Use a Python launch file and parameters; no hardware is connected.",
        steps: [
          "Move rates, freshness limits, robot ID, and log level into a typed YAML parameter file with stated units and valid ranges.",
          "Create a launch description that starts telemetry and watchdog under a launch argument `robot_namespace` and passes the parameter file.",
          "Run two instances under `/robot_01` and `/robot_02`; inspect node names, topics, types, endpoints, and parameters for collision.",
          "If using lifecycle-capable versions, prove configure, activate, deactivate, cleanup, and one rejected transition; otherwise document exactly which ordinary nodes lack lifecycle support.",
          "Run one node separately and then as a component if your implementation supports composition; compare process count and state the changed fault boundary.",
          "Write a bring-up checklist whose acceptance evidence includes expected graph, effective configuration, readiness state, message rate/age, and clean shutdown.",
        ],
        observe: "The same source can produce distinct robot instances through namespaces and parameters. Starting every process successfully is weaker evidence than checking graph, readiness, and fresh data.",
        doneWhen: "One command launches two collision-free namespaced systems, effective parameters are inspectable, readiness is explicit, a stopped instance does not change the other's names, and the bring-up checklist can be followed in a clean shell.",
      },
      jobConnection: {
        roles: [roleTitles.fleet, roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample: "A deployment engineer turns a hand-started prototype into a repeatable robot bring-up: versioned launch and parameter files, namespaced fleet instances, ordered readiness, defined restart boundaries, and an introspection checklist for site technicians.",
        interviewPrompt: "How would you launch the same navigation-facing node for ten robots without name collisions, and how would you prove each instance is configured and ready rather than merely running?",
      },
      commonMistakes: [
        { mistake: "Using process start order as proof that a dependency is ready.", correction: "Gate on lifecycle/readiness or explicit interface/health evidence with timeout and failure reporting." },
        { mistake: "Hard-coding absolute global topic names in reusable nodes.", correction: "Use relative names, namespaces, and explicit remapping so instances remain isolated." },
        { mistake: "Composing all nodes to reduce process count without considering faults.", correction: "Balance copy/latency benefits against shared crash, resource, security, and restart boundaries." },
        { mistake: "Reporting a successful launch command as system acceptance.", correction: "Inspect graph, interface types/QoS, effective parameters, lifecycle state, fresh data, logs, and shutdown." },
      ],
      checkQuestions: [
        { question: "What is the difference between inactive and active for a well-designed lifecycle publisher?", answer: "Inactive means configured resources are ready but task publication is not enabled; active permits the node's intended runtime work." },
        { question: "What major tradeoff changes when nodes are composed into one process?", answer: "Communication/copy and resource overhead may improve, while crash, restart, and resource isolation become shared." },
        { question: "Why does `/robot_01/telemetry` not guarantee isolation by itself?", answer: "Other hard-coded global names, parameters, process resources, domains, or bridges can still cross boundaries; inspect the complete graph and configuration." },
      ],
      visual: { show: false, mode: "concept", reason: "This day contains several different operational tools; a single generic diagram would blur them. The namespaced live-graph comparison and lifecycle transition evidence are more precise." },
    },
    {
      dayId: 35,
      mentalModel: "A watchdog is a hall monitor with a clock, not a fortune teller. It does not assume a robot component is healthy because its name exists. It checks when trustworthy evidence last arrived, moves through explicit health states, and requests only a predefined safe simulated response when evidence becomes too old.",
      explanation: [
        "The week's capstone graph has at least a telemetry node, command/action node, watchdog, and observable status consumer. The watchdog receives timestamped heartbeats or meaningful state updates and calculates freshness for each monitored component. ROS discovery can show that a publisher endpoint exists, but existence is not health: a process can remain alive while publishing frozen, delayed, invalid, or semantically wrong data. Application-level monitoring must check the evidence that matters to the task.",
        "A heartbeat contract states source, rate, timestamp clock, sequence or identity, timeout, tolerated jitter/loss, and meaning. At 10 Hz, the nominal period is 100 ms. A timeout set to exactly 100 ms will false-trigger under ordinary scheduling and network variation; select a limit from measured worst-case delay plus task risk, then test it. Use a monotonic clock for local duration measurement and handle simulated/ROS time deliberately. Wall-clock changes must not make stale data appear fresh.",
        "Use explicit states such as STARTING, HEALTHY, DEGRADED, STALE, and RECOVERING. One late sample might enter DEGRADED; exceeding the declared age enters STALE. Recovery should not jump directly to HEALTHY after one accidental packet. Require a defined number or duration of consecutive valid samples, confirm identity/configuration, and reset task state as needed. Hysteresis prevents noisy oscillation at the threshold while still respecting the maximum unsafe age.",
        "The watchdog's response must be designed with the controller and hazard analysis. In this chapter it can set a simulated command to zero or mark commands inhibited. On physical equipment, a ROS node must not be described as an emergency stop or safety-rated controller unless the architecture and certification actually support that claim. The watchdog can request a safe operational state through a trusted path, while independent hardware/controller safety layers bound motion if the application or network fails.",
        "Observability turns the demo into job evidence. Every state change should log component ID, previous/new state, source timestamp, observed age, threshold, reason, and action taken. The status UI should distinguish no data, stale data, invalid data, and disconnected discovery. Test normal cadence, delay, drop, frozen timestamp, wrong identity, process kill, restart, and recovery. Record latency from injected fault to detection and simulated safe output, plus false positives during a healthy run.",
      ],
      keyTerms: [
        { term: "Heartbeat", meaning: "A periodic message asserting component identity and current progress/health evidence under a declared contract.", physicalExample: "A motor-controller bridge publishes its mode, sequence, and source time ten times per second." },
        { term: "Freshness", meaning: "How recent the underlying evidence is, normally calculated from now minus its trustworthy source timestamp.", physicalExample: "A status stamped 150 ms ago is stale when its maximum accepted age is 120 ms." },
        { term: "Watchdog", meaning: "An independent monitor that detects missing or stale evidence and triggers a predefined bounded response.", physicalExample: "A simulated command gate inhibits new motion after telemetry exceeds its age limit." },
        { term: "Hysteresis", meaning: "Different entry and recovery rules that stop a state from rapidly switching near one threshold.", physicalExample: "Enter stale after one 150 ms age, but require three fresh samples before returning healthy." },
        { term: "Failure injection", meaning: "A deliberate controlled test that introduces delay, loss, invalid data, or process failure to verify detection and recovery.", physicalExample: "Pause heartbeat publication for 300 ms in simulation and measure the watchdog transition." },
        { term: "Safe operational state", meaning: "A predefined application response appropriate to the system hazard and enforced by trusted controls.", physicalExample: "The simulator inhibits motion commands and reports operator intervention required." },
      ],
      physicalExamples: [
        { title: "Freezer temperature alarm", scenario: "A display keeps showing -18 °C after its sensor cable is removed because the last value remains on screen.", lookFor: "The number looks safe but its timestamp grows old. A freshness monitor must label it stale rather than trusting the value." },
        { title: "Warehouse robot command gate", scenario: "A fleet service disconnects while an edge controller still has the last mission command.", lookFor: "Command ownership and expiry determine whether work may continue. A watchdog inhibits new simulated commands and exposes the reason; it does not pretend that network loss is a hardware e-stop." },
      ],
      workedExample: {
        title: "Classify a stale heartbeat and verify recovery",
        setup: "A telemetry node publishes at 10 Hz. The watchdog declares DEGRADED above 110 ms and STALE above 120 ms. At now=0.350 s, the last trustworthy source stamp is 0.200 s. Recovery requires three consecutive samples no older than 100 ms.",
        steps: [
          "Calculate nominal period: T = 1/10 = 0.100 s = 100 ms.",
          "Calculate heartbeat age: 0.350 - 0.200 = 0.150 s = 150 ms.",
          "Compare 150 ms with the 120 ms stale threshold and transition from HEALTHY or DEGRADED to STALE.",
          "Record the exact reason and request the predefined simulated command-inhibit state; timestamp both detection and inhibit acknowledgement.",
          "When publication resumes, do not recover after the first packet. Count fresh valid samples with age ≤100 ms.",
          "After the third consecutive fresh sample and identity/configuration checks, transition STALE→RECOVERING→HEALTHY according to the declared rule.",
        ],
        result: "The 150 ms heartbeat is stale by 30 ms. The simulated command path is inhibited, and health returns only after three consecutive valid fresh samples.",
        takeaway: "A watchdog needs measured time, explicit states, a bounded response, and guarded recovery; 'node present' and 'last value looks normal' are insufficient.",
      },
      handsOn: {
        setup: "Integrate the week's Python ROS 2 nodes in simulation: telemetry, `SimMove` command/action, watchdog, and a small console or web status consumer. All commands affect numbers only.",
        steps: [
          "Launch all nodes with versioned parameters for heartbeat rate, degraded/stale thresholds, recovery sample count, namespace, and simulated command limit.",
          "Log source and receipt timestamps, sequence, identity, current state, state-change reason, simulated command, and action goal state.",
          "Run a five-minute healthy baseline and record message rate, maximum age, callback delay, false watchdog transitions, and CPU/process facts.",
          "Inject one fault at a time: delayed heartbeat, dropped sequence, frozen source timestamp, wrong robot ID, killed telemetry process, and restarted process.",
          "For every fault, measure injection→detection, detection→command-inhibit, terminal action behavior, and recovery; save the relevant graph and log slice.",
          "Create an architecture note showing node/process boundaries, topic/service/action contracts, QoS, callback groups, lifecycle/readiness, thresholds, and which independent safety protections would be required before hardware.",
          "Run the complete acceptance sequence from a clean launch and capture an uncut result table with PASS/FAIL and the largest remaining limitation.",
        ],
        observe: "Discovery loss, stale source time, invalid identity, and callback delay can all produce different evidence even when the operator symptom is 'no update'. Recovery can be more dangerous than detection if old goals resume automatically.",
        doneWhen: "The repository starts from one documented command; the graph matches the architecture; every injected fault has a measured detection and simulated safe response; recovery requires fresh evidence; and the report clearly says this is not a safety-rated hardware controller.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.fleet, roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample: "This capstone matches field integration work: connect a ROS graph, expose health to an operator/fleet service, reproduce QoS and callback failures, inhibit stale commands, and hand another engineer a launch file, architecture note, fault matrix, and decisive logs.",
        interviewPrompt: "Design a watchdog for a 10 Hz robot-status stream. Explain the clock, thresholds, jitter allowance, state machine, false-positive test, simulated safe response, recovery rule, observability, and why ROS discovery or reliable QoS alone is insufficient.",
      },
      commonMistakes: [
        { mistake: "Using node discovery presence as the only health signal.", correction: "Check trustworthy source timestamps, sequence/progress, semantic validity, expected state, and task-relevant outputs." },
        { mistake: "Setting timeout equal to the nominal heartbeat period.", correction: "Measure scheduling/network jitter, choose a risk-based margin and degradation policy, and test false positives." },
        { mistake: "Returning to healthy after the first packet following a failure.", correction: "Use guarded recovery with consecutive fresh valid evidence, identity/config checks, and explicit task reset rules." },
        { mistake: "Calling a ROS watchdog an emergency stop.", correction: "Describe its actual application-level command gate and retain independent controller/hardware safety appropriate to the hazard." },
        { mistake: "Testing only a killed process.", correction: "Also inject delay, stale/frozen timestamps, wrong identity, callback starvation, QoS/discovery mismatch, restart, and unsafe automatic resume." },
      ],
      checkQuestions: [
        { question: "Why is a regularly arriving heartbeat with an unchanged old source timestamp unhealthy?", answer: "Transport is active, but the physical evidence is stale; freshness must use the trustworthy source time and progress semantics." },
        { question: "What should happen before a stale component returns to HEALTHY?", answer: "A declared sequence of fresh, valid, correctly identified samples and any required reconfiguration/task reset must pass the recovery rule." },
        { question: "What separates this ROS watchdog from a safety-rated emergency stop?", answer: "It is ordinary application software over non-safety-rated compute/communication unless specifically engineered and certified otherwise; independent trusted safety hardware/controllers must enforce hazard limits." },
      ],
      visual: { show: true, mode: "failure", reason: "A state-and-timeline visual can align heartbeat age, DEGRADED/STALE thresholds, command inhibition, and guarded recovery; those relationships are materially easier to validate together than as isolated prose." },
    },
  ],
} satisfies ChapterContent;
