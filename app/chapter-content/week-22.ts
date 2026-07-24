import type { ChapterContent } from "../chapter-content-types";

const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week22Content = {
  week: 22,
  title: "Bring up real robot hardware through bounded, evidence-led gates",
  purpose:
    "Turn a capstone design into a reviewable hardware bring-up plan without treating a purchased robot, a responsive device, or first motion as proof of readiness. This chapter chooses a platform backward from a frozen task; sizes actuator, encoder, supply, wiring, and thermal operating points; separates MCU deadlines and field buses from host ROS 2 behavior; implements a mock-first ros2_control hardware component; calibrates joint meaning and rehearses leased low-speed teleoperation in simulation; distinguishes ordinary software stops from independently engineered emergency and Safe Torque Off functions; and closes with a mandatory-gate acceptance pack whose unknowns and failures remain visible.",
  prerequisites: [
    "Complete the earlier dynamics, feedback, Linux, ROS 2 graph, URDF, transforms, ros2_control, simulation, validation, agent-safety, and scenario-evaluation chapters; this week integrates those contracts at the physical boundary rather than reteaching them.",
    "Bring a frozen capstone task statement, a simulated or mock robot model, one known-good no-motion startup path, a risk and requirements ledger, and official documentation for any platform being considered. No purchase or powered connection is required.",
    "Be able to distinguish requested command, accepted command, measured state, physical outcome, and safety-function evidence; read voltage, current, torque, speed, temperature, encoder, timing, and interface units without silently converting them.",
    "Keep learner exercises unpowered, paper-based, or simulated. Any inspection inside electrical equipment, energization, joint motion, E-stop or STO validation, load test, or change to a safety parameter requires the manufacturer procedure, the responsible qualified people, an approved test area, and the site's risk controls.",
  ],
  outcomes: [
    "Write a task-first hardware specification with mandatory safety, support, environment, maintainability, payload, reach, sensing, interface, power, and evidence gates, then compare documented candidates without converting unknowns into passes.",
    "Build separate continuous, peak, thermal, torque-speed, encoder, electrical-power, energy, cable, connector, and protection budgets whose assumptions and margins can be reviewed before any hardware is energized.",
    "Partition MCU interrupts, RTOS tasks, watchdogs, device manifests, CAN or EtherCAT links, local UART/I²C/SPI, Ethernet, and time synchronization by ownership, deadline, topology, diagnostics, and failure response.",
    "Implement and test a mock ros2_control Actuator, Sensor, or System component with declared command and state interfaces, validated configuration, lifecycle behavior, bounded read and write work, explicit faults, and safe application outputs.",
    "Version an encoder-to-joint calibration, verify joint identity, sign, zero, scale, limits, and frames against independent references, and rehearse one-axis leased teleoperation with bounded increments and measured stop evidence in simulation.",
    "Explain why a UI stop, ROS cancellation, ordinary watchdog, E-stop, STO, electrical isolation, braking, and holding are different functions, and route every safety claim to qualified risk assessment, implementation, and validation.",
    "Publish a repeatable acceptance matrix and uncut low-risk evidence run that links every requirement to configuration, expected result, observed result, artifact, owner, deviation, and explicit accept, conditional accept, or reject decision.",
  ],
  jobTargets: [
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "Zephyr Project — kernel and hardware documentation",
      url: "https://docs.zephyrproject.org/latest/",
      useFor:
        "Vendor-neutral embedded reference for priority-based scheduling, interrupt context, timing and watchdog services, device descriptions, and CAN, UART, I²C, SPI, Ethernet, and other peripheral interfaces; the chapter uses these as interface concepts, not as a claim that one RTOS or driver automatically meets a deadline.",
    },
    {
      label: "CAN in Automation — CAN CC",
      url: "https://www.can-cia.org/can-knowledge/can-cc",
      useFor:
        "Independent CAN industry association material for frame-level error detection, acknowledgment, retransmission, error signaling, and fault confinement including bus-off; application semantics, freshness, termination, timing, and recovery still belong to the system design.",
    },
    {
      label: "EtherCAT Technology Group — EtherCAT Compendium",
      url: "https://www.ethercat.org/en/compendium.htm",
      useFor:
        "Official technology-group reference for EtherCAT physical and data-link concepts, device identity and state machine, process data, diagnostics, distributed clocks, synchronization, conformance, and the separate existence of safety technology.",
    },
    {
      label: "ros2_control Jazzy — Writing a Hardware Component",
      url: "https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/writing_new_hardware_component.html",
      useFor:
        "Maintainer instructions for Actuator, Sensor, and System interfaces; lifecycle callbacks; configuration validation; command and state interfaces; read and write ownership; pluginlib export; load tests; diagnostics outside the real-time path; and mock-first component development.",
    },
    {
      label: "Schneider Electric — STO prerequisites and requirements",
      url: "https://product-help.schneider-electric.com/Machine%20Expert/V2.2/en/Lx32seSM/Lx32seSM/D-SE-0077581.html",
      useFor:
        "Manufacturer safety documentation establishing that STO removes torque-producing power to the motor but not hazardous voltage from the DC bus, can allow coast-down, and may require an external safety-related brake; used only for awareness, never as a universal circuit or validation procedure.",
    },
  ],
  days: [
    {
      dayId: 148,
      mentalModel:
        "Hardware selection is a requirements gate: the winning platform is the least uncertain complete fit for one task, environment, support model, and controlled-risk boundary.",
      explanation: [
        "Freeze the work before comparing machines. Name the object and tool masses, center-of-mass range, reachable poses, approach directions, floor or bench geometry, cycle-time target, repeatability tolerance, sensing conditions, operator interaction, expected hours per day, contaminants, temperature, transport, and maintenance access. Separate required values from desirable values and state how each will be measured. A platform is not suitable merely because its maximum payload and reach exceed two numbers in a brochure; it must complete the whole task inside its documented operating envelope.",
        "Make safety, support, and evidence mandatory gates rather than small weighted preferences. Ask which hazards the application creates, which safeguards and operating modes the manufacturer supports, which manuals and declarations are available, who may integrate and validate the system, how emergency and energy-isolation functions are handled, and what training the site requires. Also inspect software support, firmware availability, ROS 2 or vendor APIs, interface stability, diagnostic access, calibration workflow, replacement parts, repair lead time, warranty boundaries, and whether the exact hardware revision is still supported.",
        "Compare like with like. Payload includes object, gripper, adapter, cables, and any off-axis moment; reach must cover approach and retreat with joint and collision margin; accuracy is closeness to a commanded absolute pose while repeatability is consistency when returning; headline speed may apply only under a restricted load or trajectory. For a mobile base, payload, grade, floor transition, wheel traction, braking, turning envelope, localization sensors, battery duty, charger behavior, and docking all interact. Record the test condition attached to every published number.",
        "Use a two-stage decision record. First reject any candidate that fails a mandatory task, environment, support, or safety requirement. Then score the remaining evidence with declared weights and confidence. Mark absent or incomparable data as `unknown`, attach an owner and verification method, and run sensitivity analysis: if a small weight change reverses the ranking, the decision is fragile. The deliverable is not a shopping recommendation; it is a traceable short list, explicit unknowns, and a no-buy boundary until the high-impact unknowns close.",
      ],
      keyTerms: [
        {
          term: "Task envelope",
          meaning:
            "The complete set of loads, poses, paths, rates, environmental conditions, interactions, and terminal outcomes that the hardware must support.",
          physicalExample:
            "A tabletop arm must lift a 0.8 kg part plus 0.35 kg gripper, approach two fixtures from above, avoid a 120 mm wall, and repeat the placement within the declared tolerance for a four-hour shift.",
        },
        {
          term: "Mandatory gate",
          meaning:
            "A requirement whose failure or unresolved evidence blocks selection regardless of the candidate's weighted score elsewhere.",
          physicalExample:
            "A platform with no approved way to implement the required guarded operating mode is rejected even if it is cheaper and faster.",
        },
        {
          term: "Accuracy",
          meaning:
            "Closeness of the measured physical result to the commanded or true reference under stated test conditions.",
          physicalExample:
            "Ten commanded visits to a surveyed fixture may cluster tightly yet remain 6 mm away, indicating good repeatability but poor absolute accuracy.",
        },
        {
          term: "Repeatability",
          meaning:
            "Consistency of repeated physical results under the same declared approach, load, configuration, and environment.",
          physicalExample:
            "The tool returns within a 0.4 mm spread when approaching the same point from one direction, without proving the point is globally accurate.",
        },
        {
          term: "Evidence confidence",
          meaning:
            "A declared assessment of how directly a source, test condition, revision, and measurement support one selection claim.",
          physicalExample:
            "A current manual for the exact model and load condition is stronger evidence than an unsourced reseller table for an older revision.",
        },
      ],
      physicalExamples: [
        {
          title: "Arm that reaches but cannot approach",
          scenario:
            "Candidate A advertises 900 mm reach and can touch a fixture point in a simplified drawing, but its wrist and gripper collide with a wall along the required vertical approach.",
          lookFor:
            "Reach to a point is not path feasibility; include tool geometry, approach direction, joint margin, cable routing, collision volume, retreat, and the loaded operating condition.",
        },
        {
          title: "Repairable rover versus impressive prototype",
          scenario:
            "Candidate B is slower on paper but publishes wiring, firmware support, spare-wheel and battery procedures, diagnostics, and regional service; Candidate C has a higher top speed but an unclear API and no replacement-part plan.",
          lookFor:
            "Availability, maintainability, interface evidence, and safe service procedures can dominate a small performance advantage over the system's intended life.",
        },
      ],
      workedExample: {
        title: "Gate and rank two documented tabletop platforms",
        setup:
          "A task needs a 1.0 kg object, 0.25 kg tool, 520 mm effective reach, four hours of intermittent use, a documented ROS 2 integration route, and an approved integration path for the site's required safeguards. Candidate A lists 1.5 kg payload and 600 mm reach; Candidate B lists 2.0 kg and 540 mm. Several conditions differ.",
        steps: [
          "Write the required moving mass as `1.0 + 0.25 = 1.25 kg`, then attach the required center-of-mass range, pose, acceleration, and duty condition; do not compare 1.25 kg with an unspecified maximum-payload headline.",
          "Compute only a preliminary mass margin: A has `(1.5 - 1.25) / 1.25 = 20%`; B has `(2.0 - 1.25) / 1.25 = 60%`. Label both provisional until moment, speed, thermal, and tool limits are checked.",
          "Gate reach using the complete approach model. A has 80 mm nominal radial margin and B has 20 mm, but mark both unresolved until the actual wrist orientation, tool length, joint limits, fixture collision, and retreat path are modeled.",
          "Create mandatory rows for exact model revision, payload condition, environment, safeguard integration, emergency and reset behavior, electrical requirements, support region, spares, firmware, diagnostics, calibration, and approved ROS-facing interface. Reject any confirmed gate failure and assign owners to unknowns.",
          "For candidates still eligible, score task fit, maintainability, integration evidence, service life, cost of ownership, and delivery confidence using weights frozen before viewing the final totals; cite the evidence cell used for each score.",
          "Repeat the total with each non-mandatory weight varied by plus and minus 20 percent. If the winner changes, record the decision as sensitive and close the highest-leverage unknown rather than reporting false precision.",
          "End with `short-list`, `hold`, or `reject` plus a verification plan. Neither the 20% nor 60% preliminary payload margin authorizes purchase, mounting, electrical connection, or motion.",
        ],
        result:
          "The decision record preserves task conditions, distinguishes hard gates from preferences, exposes incomparable specifications, and keeps both candidates on hold until reach, safeguard, and operating-condition evidence closes.",
        takeaway:
          "A useful selection matrix eliminates incomplete systems first and ranks only the candidates whose evidence supports the whole task.",
      },
      handsOn: {
        setup:
          "Use two manufacturer datasheets or archived product manuals, paper silhouettes or CAD screenshots, and a spreadsheet. Do not order, mount, connect, open, energize, or move either product.",
        steps: [
          "Write one measurable capstone task envelope with payload composition, center-of-mass assumption, workspace, approach, tolerance, cycle, duty, environment, operator, maintenance, and safe terminal state.",
          "Create at least ten mandatory gates spanning task fit, documentation, support, electrical compatibility, integration, diagnostics, calibration, safeguards, emergency behavior, and serviceability.",
          "Extract only values that name the exact product revision and test condition. Put the source page and unit beside each value, and write `unknown` where the source is silent.",
          "Trace the tool silhouette through three critical poses on paper or in a disconnected model; mark reachable point, approach, retreat, singular or joint-limit concern, collision, and cable clearance separately.",
          "Score only candidates that have no confirmed gate failure, run one weight-sensitivity check, and identify the three unknowns most likely to change the decision.",
          "Ask another learner to audit five cells back to their source and to challenge one hidden assumption; revise the record without turning an unresolved item into a pass.",
        ],
        observe:
          "The apparent winner often changes when payload conditions, approach geometry, documentation quality, support lifetime, and unknown evidence receive the same attention as headline reach and price.",
        doneWhen:
          "Every selection claim names a source and condition, mandatory gaps visibly block purchase, rankings survive or disclose sensitivity, and the output contains no instruction to power or test physical equipment.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_PHYSICAL_AI],
        workExample:
          "Translate a customer task into a cross-discipline robot specification, challenge vendor claims against exact operating conditions, preserve unknowns and lifecycle costs, and produce a short list that safety, mechanical, electrical, software, service, and validation owners can sign or reject.",
        interviewPrompt:
          "Two arms meet payload and reach on their landing pages. Walk through the mandatory gates, comparable evidence, geometry checks, support questions, unknown-data treatment, and decision record you require before recommending either platform.",
      },
      commonMistakes: [
        {
          mistake: "Selecting the platform with the largest maximum payload and reach.",
          correction:
            "Model the full tool-plus-object load, center of mass, motion, duty, approach, collision, environment, interfaces, support, and safeguards under the published test conditions.",
        },
        {
          mistake: "Giving an unknown safety or support row a neutral score so the candidate can remain competitive.",
          correction:
            "Make high-consequence evidence a mandatory gate, label the row unknown, assign a closure owner, and block selection until the required proof exists.",
        },
        {
          mistake: "Treating repeatability and accuracy as interchangeable evidence.",
          correction:
            "Ask how each value was defined and measured; consistent returns can still share one absolute offset, and one accurate result does not establish repeatability.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is a 50% payload-rating margin not enough to select an arm?",
          answer:
            "The rating may depend on center of mass, pose, speed, acceleration, duty, tool moment, and environment, while reach paths, accuracy, support, interfaces, and safety remain separate gates.",
        },
        {
          question: "What happens when a required manufacturer value is absent?",
          answer:
            "Record it as unknown with its decision impact, source searched, owner, and verification method; do not infer a pass or silently substitute another model.",
        },
        {
          question: "When should a weighted score be calculated?",
          answer:
            "Only after candidates with confirmed mandatory-gate failures are removed and high-impact unknown gates are either closed or explicitly hold the decision.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The learner's sourced gate matrix and workspace overlays contain the actual candidate evidence; a generic selection visual would hide the most important unknowns.",
      },
    },
    {
      dayId: 149,
      mentalModel:
        "An actuator is an operating point inside coupled mechanical, electrical, thermal, sensing, and protection envelopes, never one impressive torque or wattage number.",
      explanation: [
        "Start at the load and work backward through the mechanism. For a rotary joint, list every payload and link mass with its distance from the axis, add gravitational torque for the worst required orientation, add torque for requested angular acceleration and reflected inertia, then account for friction, external process force, transmission efficiency, and a justified design margin. A mobile drive similarly needs wheel force for rolling resistance, grade, acceleration, and disturbance, then wheel torque from radius. A static estimate is an early bound, not a dynamic model or safety limit.",
        "Torque and speed must be feasible at the same time. A gearbox multiplies motor torque approximately by ratio and efficiency while increasing motor speed relative to joint speed; it also introduces backlash, compliance, friction, reflected inertia, and rated input or output limits. Compare continuous and short-duration requirements with the manufacturer's torque-speed curve, thermal condition, winding, controller, supply voltage, gearbox, brake, and duty cycle. Stall torque is normally a boundary where speed is zero and heating is severe, not a continuous design point.",
        "Build the energy path as carefully as the force path. Estimate continuous, transient, startup, inrush, braking, and regenerative behavior for each branch; include controllers, compute, sensors, fans, brakes, and conversion losses. Check supply, battery, distribution, conductor, connector, switch, fuse or breaker, grounding or bonding, and thermal ratings using the applicable engineering rules and manufacturer data. A fuse protects against defined faults; it does not increase supply capacity or excuse undersized wiring. Never probe an unknown energized system as a learner exercise.",
        "Close the loop with sensing and limits. Encoder resolution, accuracy, update rate, latency, multi-turn behavior, mounting, index or absolute reference, and power-loss behavior affect whether the controller can observe the intended motion. Define hard mechanical stops, drive limits, controller limits, calibrated software limits, current and temperature monitoring, and fault response as separate layers. Software limits should stay inside verified physical limits, but none becomes safety-rated merely because it is conservative or tested in a simulator.",
      ],
      keyTerms: [
        {
          term: "Continuous operating point",
          meaning:
            "A torque-speed-current-temperature condition the actuator and drive can sustain for the declared duty and cooling without exceeding ratings.",
          physicalExample:
            "A shoulder joint holds and cycles at 4 N·m output and 0.4 rad/s for minutes, so that point must fit the continuous curve rather than a short peak label.",
        },
        {
          term: "Peak operating point",
          meaning:
            "A bounded higher-load condition allowed only for the documented magnitude, duration, repetition, temperature, and drive configuration.",
          physicalExample:
            "A 0.3-second acceleration may need 9 N·m, but repeating it every second can violate the motor or gearbox thermal duty even when one pulse succeeds.",
        },
        {
          term: "Torque-speed curve",
          meaning:
            "The documented relationship showing which combinations of actuator torque and rotational speed are available under stated electrical and thermal conditions.",
          physicalExample:
            "A motor that provides high torque near zero speed may provide far less at the shaft speed needed after the chosen gear ratio.",
        },
        {
          term: "Regenerative energy",
          meaning:
            "Energy returned toward the drive or DC bus when a driven mass decelerates or an external load drives the motor.",
          physicalExample:
            "Lowering a gravity-loaded arm can raise the bus voltage unless the approved drive and energy-handling design absorb or return that energy.",
        },
        {
          term: "Encoder resolution",
          meaning:
            "The smallest count increment represented by the encoder, distinct from absolute accuracy, noise, backlash, and final tool precision.",
          physicalExample:
            "An encoder with 8,192 counts per revolution represents about 0.000767 rad per count before transmission and mechanism errors.",
        },
      ],
      physicalExamples: [
        {
          title: "Horizontal shoulder joint",
          scenario:
            "A 2.0 kg payload sits 0.30 m from a shoulder axis while a 1.0 kg link has its center of mass 0.15 m from the axis; the joint also accelerates and contains a gearbox.",
          lookFor:
            "Sum every gravity moment, add inertia, acceleration, friction, and external loads, then translate the joint torque-speed point through the actual ratio and efficiency before reading the motor curve.",
        },
        {
          title: "Two-wheel supply branch",
          scenario:
            "Two motor drives each draw 3 A continuously and can draw 8 A briefly from a 24 V bus; compute and sensors draw another 1 A.",
          lookFor:
            "Continuous demand is 7 A or 168 W, while the named simultaneous transient is 17 A or 408 W; duration, wiring, connector, supply, protection, battery, heat, and regenerative behavior still need separate checks.",
        },
      ],
      workedExample: {
        title: "Create a reviewable shoulder-axis sizing budget",
        setup:
          "A hypothetical unpowered arm has a 2.0 kg payload at 0.30 m and a 1.0 kg link center of mass at 0.15 m. Required joint acceleration contributes a modeled 1.20 N·m, friction contributes 0.40 N·m, transmission efficiency is estimated at 0.80, and a preliminary 1.25 design factor is being reviewed.",
        steps: [
          "Calculate payload gravity torque as `2.0 × 9.81 × 0.30 = 5.886 N·m` and link gravity torque as `1.0 × 9.81 × 0.15 = 1.472 N·m`; retain the locations and worst required orientation beside the numbers.",
          "Add the modeled joint-side terms before losses: `5.886 + 1.472 + 1.20 + 0.40 = 8.958 N·m`. Label omitted cable forces, tool inertia, disturbances, and model uncertainty rather than hiding them in arithmetic.",
          "Account for the stated transmission efficiency at this operating condition: `8.958 / 0.80 = 11.198 N·m` required at the transmission input expressed in the chosen joint-side convention; verify the manufacturer's efficiency direction and curve before reuse.",
          "Apply the review factor only after explaining what uncertainty it covers: `11.198 × 1.25 = 13.998 N·m`. Do not call 14.0 N·m safe, continuous, or motor-shaft torque until ratio, speed, duty, gearbox rating, thermal model, and risk controls are checked.",
          "Choose a hypothetical ratio and required joint speed, convert both torque and speed to the motor side using the same convention and efficiency, then plot continuous and peak points on the exact motor-drive-voltage torque-speed curves.",
          "Build the electrical table for nominal, simultaneous peak, startup, braking, and fault states; include auxiliary loads and losses, then compare supply, energy storage, distribution, conductor, connector, protection, and thermal ratings without energizing anything.",
          "Add encoder scale, accuracy, latency, temperature and current thresholds, mechanical stops, drive limits, software limits, and every unresolved assumption to the same review, then issue `feasible for detailed design`, `revise`, or `insufficient evidence`.",
        ],
        result:
          "The preliminary joint demand is about 8.96 N·m before transmission losses and about 14.0 N·m after the stated efficiency and review factor, but the record explicitly prevents that scalar from being mistaken for a selected motor or safe operating point.",
        takeaway:
          "Sizing is complete only when one documented mechanism, actuator, drive, supply, feedback, thermal, protection, and duty configuration contains every required operating point with justified margin.",
      },
      handsOn: {
        setup:
          "Use a paper arm or rover diagram, a spreadsheet, and one publicly available motor or drive curve. Keep every device disconnected and use hypothetical or documented values only.",
        steps: [
          "Mark each mass, center of mass, joint or wheel radius, required speed, acceleration, duty, slope or external force, and the source or assumption for each value.",
          "Calculate static and dynamic joint or wheel loads separately, list omitted effects, and keep joint-side and motor-side units in different columns.",
          "Add a transmission row for ratio, efficiency, backlash, rated torque, speed, brake, and thermal limits; reject any row whose convention cannot be traced.",
          "Plot continuous and peak operating points on an official curve for the exact voltage, winding, drive, and cooling condition, or write `not comparable` if those conditions are missing.",
          "Make continuous, peak, startup, and braking electrical budgets including auxiliaries, then mark which supply, battery, cable, connector, switch, protection, and heat data remain unknown.",
          "Add encoder and physical-limit evidence, challenge one plausible single-point failure, and have a second learner audit every conversion from load to motor and motor to electrical source.",
        ],
        observe:
          "A scalar torque or wattage recommendation usually breaks when speed, duty, transmission, temperature, braking, feedback, and the full current path are placed on the same sheet.",
        doneWhen:
          "Every number has a unit, side of transmission, operating condition, source, and uncertainty; continuous and peak cases are distinct; no stall or nominal-power number is presented as a selected safe design.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Review actuator, drive, encoder, supply, and software-limit budgets with mechanical and electrical owners, convert physical ratings into versioned runtime constraints and diagnostics, and reject bring-up when the real operating curve or energy path is incomplete.",
        interviewPrompt:
          "Size a shoulder actuator for a gravity-loaded arm. Show the load-to-motor and motor-to-supply calculations, continuous versus peak checks, encoder and limit strategy, unknowns, and why stall torque or `P = VI` alone cannot approve the design.",
      },
      commonMistakes: [
        {
          mistake: "Selecting a motor because its stall torque exceeds the calculated static load.",
          correction:
            "Compare simultaneous torque and speed against continuous and peak curves with voltage, controller, duty, cooling, gearbox, losses, temperature, and transient duration.",
        },
        {
          mistake: "Adding an arbitrary safety factor before listing omitted loads and uncertainty.",
          correction:
            "Model known gravity, inertia, acceleration, friction, external force, transmission, and duty terms first, then state exactly which residual uncertainties each margin addresses.",
        },
        {
          mistake: "Sizing the supply from average current while ignoring simultaneous peaks, braking, auxiliaries, and the distribution path.",
          correction:
            "Budget named operating states end to end and check source, storage, conversion, conductors, connectors, protection, heat, inrush, and regenerative handling under approved rules.",
        },
      ],
      checkQuestions: [
        {
          question: "Why must torque and speed be checked as one operating point?",
          answer:
            "An actuator's available torque changes with speed, voltage, drive, and temperature; a separate maximum-torque and maximum-speed claim may never be achievable simultaneously.",
        },
        {
          question: "What does `P = V × I` establish in a power budget?",
          answer:
            "It converts a declared voltage-current operating point to electrical power, but does not establish torque, efficiency, thermal capacity, transient behavior, protection, wiring, braking, or safety.",
        },
        {
          question: "Why is encoder resolution not the same as joint or tool accuracy?",
          answer:
            "Resolution counts representable increments, while calibration, mounting, noise, latency, gearbox backlash, compliance, structural error, and kinematics affect measured joint and tool accuracy.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A load-to-joint-to-gearbox-to-motor-to-drive-to-supply visual materially prevents torque, speed, current, heat, feedback, and side-of-transmission values from being compared as one scalar.",
      },
    },
    {
      dayId: 150,
      mentalModel:
        "The hardware boundary is a timed chain: interrupts capture events, RTOS tasks meet measured deadlines, buses transport versioned state, and the host refuses incompatible devices.",
      explanation: [
        "Put work where its deadline and failure consequence can be controlled. A microcontroller close to the actuator can timestamp encoder edges, sample current, run a bounded control task, update outputs, supervise a local watchdog, and expose a compact device protocol. An interrupt service routine should capture the urgent condition and do the minimum required work before deferring parsing, logging, or policy to a task. An RTOS scheduler chooses which ready task runs by its configured rules; it cannot make an infeasible schedule feasible or certify that worst-case interrupt, blocking, execution, and communication time meet a deadline.",
        "Budget time as a chain, not a target frequency. For a 1 kHz task the period is 1 ms. Measure or conservatively bound sensor acquisition, interrupt interference, task release jitter, control computation, output update, bus transfer, queueing, clock conversion, and watchdog service. Record worst observed and designed bounds, missed-cycle counts, and the response when the budget is exceeded. Average loop time can look comfortable while one long flash operation, priority inversion, bus retry, or diagnostic call violates the physical deadline.",
        "Choose each link by scope and required evidence. UART is commonly a simple asynchronous serial point-to-point link; I²C is a clocked, addressed shared local bus; SPI is a clocked controller-selected local interface; CAN is a multi-node field bus with arbitration, acknowledgment, error signaling, retransmission, and fault confinement; ordinary Ethernet provides a network foundation whose application timing depends on the complete stack; EtherCAT adds a defined industrial process-data and distributed-clock architecture. These descriptions are selection prompts, not universal distance, rate, noise, or determinism guarantees.",
        "Make identity and time part of every device contract. A manifest can bind product and serial identity, hardware revision, firmware hash or version, bootloader, protocol version, bus address or device identity, joint mapping, command and state fields, units, sign, limits, update periods, clock domain, calibration version, watchdog behavior, and compatible host range. Startup discovers the expected set, rejects missing, duplicate, unexpected, incompatible, or stale devices, estimates clock offset and drift, and remains motion-disabled until the application contract is coherent. An ordinary communication bus is not a safety-rated channel simply because it is reliable.",
      ],
      keyTerms: [
        {
          term: "Interrupt service routine (ISR)",
          meaning:
            "Code entered asynchronously in response to a hardware or software interrupt, normally kept bounded so time-critical capture does not block other work.",
          physicalExample:
            "An encoder index interrupt stores the timer count and signals a task; it does not format a long log, wait for Ethernet, or run a planner.",
        },
        {
          term: "Real-time deadline",
          meaning:
            "The latest acceptable completion time for a response, defined by physical and system needs rather than by how fast the processor usually runs.",
          physicalExample:
            "A current-monitor task must complete its sampled decision before the next 1 ms cycle under the declared interrupt and communication load.",
        },
        {
          term: "Bus arbitration",
          meaning:
            "The rule that decides which participant may transmit when multiple devices contend for a shared communication medium.",
          physicalExample:
            "CAN identifiers participate in non-destructive priority arbitration, so traffic design affects latency even when no frame is corrupted.",
        },
        {
          term: "Device manifest",
          meaning:
            "A versioned record binding physical identity and firmware to protocol, units, mappings, rates, limits, clock, calibration, and compatibility expectations.",
          physicalExample:
            "The host expects wheel-drive serial D17, hardware revision C, firmware 2.4, protocol 3, two velocity commands in rad/s, and two position states in radians.",
        },
        {
          term: "Clock offset and drift",
          meaning:
            "Offset is the difference between two clocks at an instant; drift is how that difference changes, both of which affect timestamp alignment and freshness.",
          physicalExample:
            "An encoder sample timestamped by the MCU can appear fresh on the host while actually being 12 ms old if clock conversion uses an outdated offset.",
        },
      ],
      physicalExamples: [
        {
          title: "Motor-controller timeline",
          scenario:
            "A timer releases a 1 kHz control task; an encoder ISR captures edges; a communication task handles CAN state; a lower-priority diagnostic task formats counters.",
          lookFor:
            "The ISR remains short, the control task has measured worst-case execution and blocking, diagnostics cannot starve it, and every missed deadline increments an observable counter and enters a declared response.",
        },
        {
          title: "Local sensors and coordinated drives",
          scenario:
            "An MCU reads a short-board-distance temperature sensor over I²C and an encoder interface over SPI, while multiple drive devices exchange process state on a field bus and the host publishes noncritical diagnostics over Ethernet.",
          lookFor:
            "Each interface has a distinct topology, timing, electrical layer, ownership, identity, fault behavior, and clock contract; one successful packet does not prove suitability for the other links.",
        },
      ],
      workedExample: {
        title: "Audit a 1 kHz firmware and bus budget",
        setup:
          "A mock actuator MCU has a 1 ms control period. Measured conservative stage values are 0.18 ms sensing, 0.31 ms control computation, 0.22 ms command and state transfer, and 0.17 ms worst accounted interrupt and scheduling interference.",
        steps: [
          "Convert frequency to period: `1 / 1,000 s = 0.001 s = 1.00 ms`; name the release clock, completion point, and physical consequence of a late cycle.",
          "Add the accounted work: `0.18 + 0.31 + 0.22 + 0.17 = 0.88 ms`, leaving `1.00 - 0.88 = 0.12 ms` of modeled margin rather than calling processor utilization simply 88 percent.",
          "List what the 0.12 ms does not yet cover: measurement uncertainty, cache or flash variation, interrupt bursts, shared-resource blocking, RTOS overhead, bus arbitration, retransmission, clock conversion, and any branch triggered only on a fault.",
          "Draw one timeline with timer release, ISR capture, control task, bus task, output update, watchdog service, and diagnostics. Move formatting and noncritical telemetry out of ISR and control contexts.",
          "Create a bus table for CAN, EtherCAT, UART, I²C, SPI, and Ethernet with intended endpoints, topology, electrical layer or transceiver, nominal payload, required period, maximum age, diagnostics, clock owner, termination or chip-select responsibility, and failure response.",
          "Create a manifest for two mock drives and deliberately introduce a duplicate bus identity, incompatible protocol version, and stale clock. Require startup to remain disabled and produce a distinct reason for each.",
          "Inject a simulated deadline miss, error frame or bus-off event, link loss, and clock jump; preserve detection time, last trusted state, response, and recovery rule without claiming the mock proves physical or safety timing.",
        ],
        result:
          "The stated tasks consume 0.88 ms of a 1 ms modeled cycle, but only an explicit coverage ledger and fault response prevent the remaining 0.12 ms from becoming unjustified confidence.",
        takeaway:
          "A real-time architecture is credible when deadlines, scheduling interference, transport behavior, identity, time, and overruns are measured and closed, not when an RTOS or fast bus appears in the block diagram.",
      },
      handsOn: {
        setup:
          "Use index cards, a timeline spreadsheet, and a small deterministic simulation or recorded trace. Do not flash an MCU, connect a transceiver, attach a battery, or probe any powered board.",
        steps: [
          "Create cards for timer ISR, encoder capture, current sample, control update, bus receive, bus transmit, watchdog, and diagnostics; assign owner, release condition, deadline, and maximum execution assumption.",
          "Arrange a 1 ms timeline, add the stage times, then inject one longer interrupt and one blocked shared resource; mark which deadline fails and what evidence detects it.",
          "Build a protocol-choice table for CAN, EtherCAT, UART, I²C, SPI, and Ethernet using only verified documentation; write `platform-dependent` rather than inventing universal rates or distances.",
          "Write two versioned mock device manifests with identities, firmware, protocol, units, mappings, periods, clocks, calibration, limits, and safe application default.",
          "Shuffle, remove, duplicate, or age device cards and run the startup decision by hand; no mismatch may reach the mock `enable` state.",
          "Replay nominal, missed-deadline, corrupt-frame, bus-off, link-loss, and clock-jump records and ensure each ends in an explicit detected, degraded, disabled, recoverable, or review-required state.",
        ],
        observe:
          "Most hidden uncertainty sits between the boxes: ISR work, queueing, physical transceivers, bus contention, timestamp conversion, duplicate identity, and recovery after a device responds differently than expected.",
        doneWhen:
          "Every scheduled activity and link has a bounded contract, the manifest rejects all injected incompatibilities before simulated enable, and no bus or RTOS label is presented as timing or safety proof.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Partition a robot's MCU and host workload, review ISR and RTOS timing, define versioned device manifests across local and field interfaces, diagnose bus and clock faults, and make incompatible or stale hardware fail closed before ros2_control activation.",
        interviewPrompt:
          "Design the firmware-to-ROS boundary for four drives and local sensors. Place interrupts and tasks, choose and justify buses without universal claims, budget one control period, handle identity and clock drift, and explain the response to bus-off or a missed deadline.",
      },
      commonMistakes: [
        {
          mistake: "Assuming an RTOS makes firmware deterministic.",
          correction:
            "Define deadlines, measure worst-case execution and interference, bound blocking and interrupt work, count misses, and test the designed late-cycle response under representative load.",
        },
        {
          mistake: "Choosing a bus from nominal bit rate alone.",
          correction:
            "Compare topology, physical layer, payload and overhead, arbitration, device ecosystem, diagnostics, timing, clock, cabling, fault handling, and the complete required application contract.",
        },
        {
          mistake: "Activating because every expected device returned some response.",
          correction:
            "Verify exact identity, revision, firmware and protocol compatibility, joint mapping, units, limits, calibration, rates, clock health, and absence of duplicate or unexpected devices.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a positive average deadline margin fail to prove?",
          answer:
            "It does not cover worst-case execution, interrupt bursts, blocking, retries, queueing, clock error, rare fault branches, or the correctness of the overrun response.",
        },
        {
          question: "Why can a responsive device still be unsafe to activate?",
          answer:
            "It may be the wrong device or revision, use incompatible message layouts, units, limits, mapping, calibration, timing, clock, or fault semantics, or duplicate another identity.",
        },
        {
          question: "Does a robust ordinary CAN or EtherCAT link automatically carry a safety function?",
          answer:
            "No. Functional safety requires the appropriate safety architecture, qualified components and protocol, risk-derived performance, integration, verification, and validation; ordinary communication success is insufficient.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A timed MCU-task and multi-bus boundary visual materially exposes ISR, scheduler, manifest, clock, transport, host, and failure ownership that prose can otherwise collapse into one driver box.",
      },
    },
    {
      dayId: 151,
      mentalModel:
        "A ros2_control hardware component is a typed lifecycle adapter between controller-owned interfaces and measured device I/O, not a safety controller or vendor-protocol dumping ground.",
      explanation: [
        "Choose the hardware component type from ownership. A Sensor exposes state but no command interface; an Actuator models a simple one-degree-of-freedom device; a System commonly owns a multi-joint robot or a group sharing one communication channel. The robot description declares the hardware plugin and named command and state interfaces. Fully qualified interface names couple a joint or component name to a type such as position, velocity, or effort. Those names, units, joint order, limits, and control mode must match the physical device contract exactly.",
        "Use lifecycle callbacks to separate construction, configuration, readiness, active I/O, deactivation, cleanup, shutdown, and error handling. Initialization parses and validates the supplied hardware information. Configuration can create a communication object and verify an expected manifest while keeping application commands disabled. Activation verifies fresh state and prepares bounded command handling. Deactivation stops accepting active controller authority and moves application outputs to the documented non-hazardous state for the mock. None of these ordinary callbacks is an E-stop, STO, electrical isolation, brake, or certified protective function.",
        "Keep the update path bounded and observable. `read()` obtains current measured device values and updates state interfaces; `write()` translates current command-interface values into the versioned device protocol. Validate finite values, mode, units, range, command age, device state, and communication outcome at the appropriate owner. Avoid dynamic allocation, blocking diagnostics, unbounded retry, long logging, or network discovery inside time-critical work. Publish slower diagnostics from a separate non-real-time path and measure read-update-write latency and missed cycles.",
        "Treat failure as loss of evidence, not a reason to reuse stale success. A malformed configuration blocks initialization or configuration. Repeated or severe read failure means current state is no longer trustworthy; a write failure means command delivery or outcome may be unknown. Return an explicit error according to the framework and application design, invalidate or age state visibly, stop conflicting command progression, and enter the documented lifecycle or supervisor response. Independent safety functions remain responsible for hazards that ordinary host software cannot be trusted to control.",
      ],
      keyTerms: [
        {
          term: "Hardware component",
          meaning:
            "A dynamically loaded ros2_control plugin that represents a Sensor, Actuator, or System and mediates its state and command interfaces.",
          physicalExample:
            "One differential-drive System plugin owns a shared CAN channel and exposes both wheel velocity commands plus wheel position and velocity states.",
        },
        {
          term: "State interface",
          meaning:
            "A named value populated from measured or device-reported state for controllers and broadcasters to consume.",
          physicalExample:
            "`left_wheel/position` is updated from a validated encoder count converted to radians, with communication age tracked separately.",
        },
        {
          term: "Command interface",
          meaning:
            "A named value written by an active controller and consumed by the hardware component for a declared control mode.",
          physicalExample:
            "`right_wheel/velocity` carries a rad/s request that the plugin bounds and encodes for the matching drive identity.",
        },
        {
          term: "Lifecycle callback",
          meaning:
            "A transition hook that gives configuration, activation, deactivation, cleanup, shutdown, and error work distinct entry and exit contracts.",
          physicalExample:
            "Configuration verifies the mock device manifest; activation requires fresh state; deactivation zeros the mock application command and releases its simulated lease.",
        },
        {
          term: "Resource Manager",
          meaning:
            "The ros2_control owner that loads hardware plugins, manages their lifecycle and interfaces, and provides those resources to eligible controllers.",
          physicalExample:
            "A controller cannot claim `left_wheel/velocity` if the loaded plugin did not export that exact command resource or another active controller already owns it.",
        },
      ],
      physicalExamples: [
        {
          title: "Two-wheel mock System",
          scenario:
            "A single simulated transport owns left and right drive state. The plugin exports wheel velocity commands and position and velocity states, then injects delay, dropped reads, and rejected writes.",
          lookFor:
            "Joint names, order, units, lifecycle, timestamps, error returns, and command defaults remain explicit; mirrored state is identified as a mock model rather than encoder evidence.",
        },
        {
          title: "Read-only force sensor",
          scenario:
            "A wrist force-torque device provides six measured channels and diagnostics but receives no physical command from ros2_control.",
          lookFor:
            "A Sensor component fits the ownership better than inventing writable interfaces; state freshness and calibration identity accompany the values.",
        },
      ],
      workedExample: {
        title: "Design a fault-aware mock differential-drive plugin",
        setup:
          "A disconnected test package represents two wheel drives. The exact resources are left and right velocity commands in rad/s and left and right position and velocity state in radians and rad/s. No real transport or motor is present.",
        steps: [
          "Choose a System component because one simulated communication owner serves both joints, then declare the exact joint names, allowed state and command interfaces, units, bounds, update period, and expected mock manifest.",
          "In initialization, call the parent contract and reject missing joints, duplicate names, unsupported interfaces, non-finite parameters, wrong units, invalid limits, or an unexpected component type before creating communication state.",
          "In configuration, instantiate only the mock transport, compare its identity and protocol manifest, initialize state to a declared unavailable or known fixture condition, and keep command authority disabled.",
          "In activation, require a configured transport and a fresh successful mock read, initialize command buffers from a non-hazardous application default, and begin the simulated command lease without describing the transition as a safety enable.",
          "Implement bounded `read()` conversion from mock encoder values to the four state interfaces and bounded `write()` conversion from two finite, current, in-range rad/s commands to one versioned message; collect timing outside the hot path.",
          "Implement deactivation, cleanup, shutdown, and error behavior; inject stale read, malformed state, rejected write, and delayed cycle cases, ensuring no stale value is silently relabelled current and no infinite retry occurs.",
          "Export the class through pluginlib metadata and write load, interface, lifecycle, conversion, fault, and timing tests using only the mock Resource Manager path; record which hardware and safety claims remain entirely unverified.",
        ],
        result:
          "The mock component can be loaded, exports only the declared resources, follows lifecycle transitions, converts typed values, exposes injected failures, and leaves all powered and safety behavior outside the evidence claim.",
        takeaway:
          "A hardware plugin succeeds when ownership, interfaces, lifecycle, I/O timing, and error semantics are inspectable; loading the library or moving a mock is only the beginning.",
      },
      handsOn: {
        setup:
          "Use the existing ROS 2 workspace or a paper class-and-state model plus a mock transport. Do not connect a USB adapter, field bus, drive, encoder, E-stop circuit, or actuator.",
        steps: [
          "Write the exact Sensor, Actuator, or System choice and justify it from physical communication ownership rather than from which template is shortest.",
          "Define hardware information for two mock joints with names, command and state types, units, ranges, component identity, protocol version, and update period.",
          "Implement or pseudocode initialization and every lifecycle callback with entry conditions, success state, failure state, resources acquired, and resources released.",
          "Implement a deterministic mock `read()` and `write()` with finite-value, name, unit, range, freshness, and protocol checks; keep diagnostics and deliberate delay outside the nominal hot path.",
          "Test load, exported resources, configure, activate, deactivate, cleanup, shutdown, and error transitions, then inject missing interface, stale read, rejected write, and period overrun.",
          "Create an evidence table separating `plugin behavior verified in mock`, `device protocol not verified`, `powered motion not verified`, and `safety functions not verified`.",
        ],
        observe:
          "Most plugin defects are contract defects—wrong names, units, ordering, lifecycle assumptions, stale state, blocking I/O, or ambiguous faults—before they become vendor-protocol defects.",
        doneWhen:
          "The mock plugin's resource and lifecycle tests pass, each injected fault produces a bounded explicit result, and the report makes no real-device, real-time, motion, or safety claim.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Build and review ros2_control hardware plugins that map exact robot resources to vendor or simulated transports, keep lifecycle and update timing bounded, expose diagnostics, and produce a mock-to-HIL-to-restricted-hardware evidence ladder for field commissioning.",
        interviewPrompt:
          "Design a ros2_control plugin for a two-wheel base sharing one CAN interface. Choose the component type, name resources, explain lifecycle and read/write behavior, handle stale reads and uncertain writes, and separate deactivation from E-stop or STO.",
      },
      commonMistakes: [
        {
          mistake: "Calling `on_deactivate()` or a zero command an emergency stop.",
          correction:
            "Describe it as ordinary application and framework behavior; separately identify the risk-derived, independently implemented and validated protective and emergency functions.",
        },
        {
          mistake: "Running discovery, unbounded retry, or verbose logging inside `read()` and `write()`.",
          correction:
            "Keep the control path bounded, move diagnostics to a non-real-time owner, count failures and latency, and enter an explicit supervisor or lifecycle response.",
        },
        {
          mistake: "Keeping the last state value without exposing that reads have failed.",
          correction:
            "Track age and validity, report the error, stop treating stale state as current evidence, and follow the application's designed degraded or disabled transition.",
        },
      ],
      checkQuestions: [
        {
          question: "When does a ros2_control System component usually fit better than two Actuator components?",
          answer:
            "When multiple joints form one logical device or share communication, lifecycle, transmission, or state ownership that should be managed coherently.",
        },
        {
          question: "What are the distinct jobs of `read()` and `write()`?",
          answer:
            "`read()` obtains and validates measured device state for state interfaces; `write()` validates and translates current command-interface values into the device protocol.",
        },
        {
          question: "What does a successful plugin load prove?",
          answer:
            "Only that metadata and library loading reached that test point; it does not prove correct interfaces, timing, protocol, physical motion, fault containment, or any safety function.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The learner's lifecycle table and executable mock interface tests provide more exact evidence than another generic controller-plugin diagram.",
      },
    },
    {
      dayId: 152,
      mentalModel:
        "Calibration gives raw feedback physical meaning, while first-motion discipline tests one predicted identity, sign, scale, frame, limit, lease, and stop at a time.",
      explanation: [
        "Calibration is a versioned mapping, not a button press. For each joint record the physical joint identity, encoder identity, raw representation, zero or home reference, positive direction, counts-to-unit scale, wrap behavior, gear ratio, offset, hard range, verified software range, temperature or load condition, procedure, tool, operator, timestamp, and resulting artifact. Homing establishes a reference by an approved motion or sensor sequence; an absolute encoder may retain a position code across startup. Neither one automatically proves the joint name, sign, scale, mechanism alignment, or robot frames.",
        "Verify meaning against an independent physical reference. A marked cardboard hinge, protractor, dial indicator, fixture, surveyed point, or manufacturer gauge can challenge what software reports. Check several points in both directions to reveal offset, reversed sign, wrong joint order, nonlinear scale, backlash, hysteresis, wrap, or missed counts. Then verify the URDF joint axis and parent-child transform: a positive reported change should produce the predicted link motion and tool displacement. Consistent numbers in a self-referential software loop can all be consistently wrong.",
        "Design low-speed teleoperation as a leased request path even in simulation. The operator must hold an enabling or dead-man control; commands have bounded magnitude, rate, acceleration, duration, workspace, joint range, and age; loss of focus, release, stale state, disconnect, or lease expiry ends command renewal at the robot-side owner. Show requested, accepted, and measured values separately. One axis, one small increment, clear virtual space, and a written prediction make identity and sign errors visible before combined motion. An application speed cap or browser dead-man control is not safety-rated unless the complete implementation is designed and validated as such.",
        "A real first-motion procedure is platform- and site-specific, so this lesson does not prescribe one. Before powered movement, qualified owners must have completed mechanical and electrical inspection, load and mounting review, approved safeguards, energy control, manufacturer setup, calibration prerequisites, safe modes, independent stop verification, work-area control, recovery, communication plan, and authorization. The learner rehearses the sequence only in simulation. Real observations, if later authorized, must be captured through the approved procedure and may invalidate calibration immediately when hardware, firmware, mounting, tool, transmission, or encoder relationships change.",
      ],
      keyTerms: [
        {
          term: "Calibration artifact",
          meaning:
            "A versioned record of the mapping parameters, identities, conditions, method, references, results, residual error, and approval that give raw measurements physical meaning.",
          physicalExample:
            "Joint 2's file binds encoder serial E42, zero count 410, positive sign, 8,192 counts per revolution, gear ratio, checked angles, residuals, and robot configuration hash.",
        },
        {
          term: "Homing",
          meaning:
            "An approved procedure that establishes a joint or axis reference, often using a switch, index, hard reference, or known pose.",
          physicalExample:
            "A simulated axis moves toward a virtual reference switch under its modeled procedure, backs off, and records a repeatable home offset without claiming a real switch is safe.",
        },
        {
          term: "Independent reference",
          meaning:
            "A measurement or fixture outside the same software mapping being checked, used to expose a shared sign, zero, scale, or frame error.",
          physicalExample:
            "A protractor reading challenges the encoder-derived hinge angle instead of comparing the encoder value with a second display of the same value.",
        },
        {
          term: "Command lease",
          meaning:
            "A bounded grant that permits a command to remain valid only until an explicit expiry unless a current authorized owner renews it.",
          physicalExample:
            "A simulated jog command expires after 150 ms; network disconnect or browser focus loss stops renewals, so the robot-side owner returns the application command to zero.",
        },
        {
          term: "Dead-man or enabling control",
          meaning:
            "A continuously held operator input whose release withdraws ordinary motion permission; its safety status depends on the complete rated implementation, not its label.",
          physicalExample:
            "Holding a simulator key renews a tiny one-axis jog lease, while release immediately stops renewal and the state display confirms measured velocity reaches zero.",
        },
      ],
      physicalExamples: [
        {
          title: "Encoder sign disagrees with the hinge",
          scenario:
            "A mock encoder changes from count 410 to 820 with 8,192 counts per revolution. Software reports positive 0.314 rad, while an independent marked hinge shows the physical convention should be negative.",
          lookFor:
            "The magnitude is plausible but sign convention is wrong; reject the calibration, trace sensor direction and joint-axis definition, and never compensate by silently negating an unrelated controller output.",
        },
        {
          title: "Stale teleoperation lease",
          scenario:
            "A simulator sends jog updates at 20 Hz with a 150 ms lease. The latest command arrives with 85 ms of age, then the browser loses focus and sends no renewal.",
          lookFor:
            "Only 65 ms of declared validity remains; the robot-side owner expires the command locally, measured velocity reaches the simulated stopped state, and the UI does not claim its disabled button caused the result.",
        },
      ],
      workedExample: {
        title: "Calibrate and jog one simulated joint with independent checks",
        setup:
          "A simulated revolute joint uses 8,192 counts per revolution. Its candidate zero is count 410. A test observation at count 820 should correspond to a marked physical-reference angle of negative 18 degrees under the robot's declared positive-axis convention.",
        steps: [
          "Compute scale as `2π / 8,192 ≈ 0.00076699 rad/count` and raw displacement as `820 - 410 = 410 counts`; preserve full precision in the artifact rather than rounding the calibration constant prematurely.",
          "Apply the candidate positive sign: `410 × 0.00076699 ≈ 0.3145 rad`, approximately positive 18.0 degrees, then compare it with the independent reference of negative 18 degrees.",
          "Reject the candidate mapping because sign disagrees even though magnitude is plausible. Trace encoder mounting, device sign, joint identity, transmission direction, and URDF axis; choose one authoritative conversion owner and document the corrected negative sign.",
          "Test corrected zero, quarter-range, and another interior point from both approach directions in the simulator; record residuals and identify any modeled backlash, wrap, or hysteresis rather than fitting only the original point.",
          "Predict how a small positive joint-coordinate change should move the child link and tool in the declared frames, then compare simulator state and visualization to that prediction before enabling a jog request.",
          "Configure a simulated one-axis jog with a held enable, very small increment, bounded speed and acceleration, 150 ms command lease, fresh-state guard, joint and workspace limits, and explicit cancel; keep requested, accepted, commanded, and measured records separate.",
          "Rehearse normal release, focus loss, delayed packet, stale state, limit approach, reversed sign, and cancellation. Accept the mock workflow only when each case reaches its declared terminal state and preserves enough timing and calibration evidence to explain it.",
        ],
        result:
          "The calculation exposes a sign error that a magnitude-only check would accept, then the corrected version supports one simulated leased jog whose request, expiry, measured response, and fault cases remain distinguishable.",
        takeaway:
          "First motion should test one physical assumption at a time; independent reference and robot-side expiry are more valuable than a confident visualization.",
      },
      handsOn: {
        setup:
          "Use a cardboard hinge with angle marks or a robot simulator, a mock encoder table, and a teleoperation fixture that cannot command powered hardware.",
        steps: [
          "Create a calibration record with joint and encoder identity, zero, sign, scale, range, frame axis, configuration version, method, independent reference, and validity conditions.",
          "Evaluate at least three mock counts in both approach directions, include one reversed-sign or wrong-joint fault, and record residual rather than only pass or fail.",
          "Move the cardboard link or simulator through predicted positive and negative changes and compare joint state, link motion, child-frame axis, tool displacement, and limit state.",
          "Configure simulator-only teleoperation with one axis, held enable, bounded magnitude, rate and acceleration, short lease, fresh-state requirement, visible command age, cancellation, and measured feedback.",
          "Run normal press-and-release, focus loss, disconnect, packet delay, stale state, joint-limit approach, and wrong-sign scenarios without modifying the expected result after seeing the run.",
          "Export the calibration version and correlated request, acceptance, command, state, expiry, stop, and fault timeline; label all real mounting, energized motion, and safety behavior `not verified`.",
        ],
        observe:
          "A display can agree with its own wrong mapping, and a UI can show stopped while an old command remains valid elsewhere; independent geometry and robot-side command expiry challenge both illusions.",
        doneWhen:
          "The sign, zero, scale, joint identity, limits, and frames pass independent mock checks; every simulated teleoperation loss case expires or cancels locally; no step directs real powered motion.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_HMI, ROLE_VALIDATION],
        workExample:
          "Own versioned joint and frame calibration, build operator jog workflows with leases and stale-state visibility, support qualified first-motion commissioning, and preserve independent measurements that distinguish a UI or model error from a sensor, mapping, mechanism, or controller defect.",
        interviewPrompt:
          "A joint value looks smooth and plausible but moves the real link in the opposite direction. Explain how you isolate identity, sign, zero, scale, transmission, URDF axis, and frame errors, then design a low-speed teleoperation rehearsal that fails safely on focus or network loss.",
      },
      commonMistakes: [
        {
          mistake: "Accepting calibration because the reported angle is smooth and inside limits.",
          correction:
            "Compare multiple points and approach directions against an independent physical reference, verifying joint identity, zero, sign, scale, range, wrap, and frame convention.",
        },
        {
          mistake: "Keeping a jog command valid until the browser sends an explicit stop.",
          correction:
            "Use a short robot-side lease and held enable so focus loss, disconnect, stale state, or operator release ends renewal without depending on a final network message.",
        },
        {
          mistake: "Calling a reduced application speed a safe-speed safety function.",
          correction:
            "Describe it as an ordinary bounded test setting unless the complete sensing, logic, output, failure performance, integration, and validation meet the applicable safety requirements.",
        },
      ],
      checkQuestions: [
        {
          question: "How can a calibration be numerically plausible and physically wrong?",
          answer:
            "The value can remain within range while joint identity, zero, sign, scale, gear relationship, wrap, unit, or frame axis is incorrect.",
        },
        {
          question: "What must happen when a teleoperation client disconnects?",
          answer:
            "The robot-side command lease must expire or cancel through the designed local path, command authority must be resolved, and measured state must confirm the declared ordinary stopped outcome.",
        },
        {
          question: "Why is simulation required before any approved first motion?",
          answer:
            "It exposes mapping, interface, limit, lease, UI, and recovery defects without real energy, although it cannot validate mounting, load, wiring, braking, hazards, or physical safety functions.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The cardboard hinge, independent angle table, and correlated simulator timeline directly expose sign and lease faults without needing a generic calibration graphic.",
      },
    },
    {
      dayId: 153,
      mentalModel:
        "Stopping is a layered risk-control problem: application commands, watchdogs, emergency functions, STO, brakes, isolation, stored energy, reset, and restart each make different promises.",
      explanation: [
        "Name the function before judging it. A normal stop ends the operating cycle in a controlled way. A ROS 2 cancellation, zero-velocity command, controller deactivation, browser stop, or standard network watchdog is ordinary application behavior unless the entire channel has been designed and validated to the required safety performance. A protective stop or other safety function belongs to a risk-derived safety-related control system. An emergency stop is a complementary protective measure for an emergency, designed to override normal operation and reduce risk; it is not the routine stop, a substitute for guarding, or proof that every hazard is controlled.",
        "Safe Torque Off is a specific drive safety function that prevents torque-producing energy from being supplied to the motor when correctly integrated and validated. It does not necessarily remove mains or DC-bus voltage, actively brake a moving axis, monitor standstill, hold a vertical load, remove pneumatic or hydraulic energy, or make maintenance electrically safe. A motor can coast, and gravity or stored mechanical energy can still move a mechanism. The risk assessment may require a controlled safe stop, safety-related brake, mechanical support, energy isolation, or another function in addition to or instead of STO.",
        "Watchdogs and shutdown sequences still matter when described honestly. A local command watchdog can detect an expired heartbeat and move ordinary application outputs to a defined state without waiting for the network. A normal shutdown can stop new work, request a controlled stop, verify measured standstill where applicable, deactivate controllers, preserve diagnostics, and follow approved power or energy procedures. Fault shutdown handles uncertain state and communication. None of these is automatically safety-rated; each has assumptions, failure modes, response time, and evidence that must be reviewed separately from the independent emergency path.",
        "Reset and restart are distinct. Releasing or resetting an emergency actuator should remove the emergency condition only according to the engineered design; it must not itself create unexpected motion. Before restart, the responsible operator or system checks that the hazard is cleared, safeguards and command authority are restored, state and calibration are trustworthy, stored energy is controlled, and a new deliberate start is authorized. Learners may review diagrams and simulate state transitions, but must never design, wire, bypass, prove, or time a real E-stop or STO circuit without the qualified safety owner and exact manufacturer procedures.",
      ],
      keyTerms: [
        {
          term: "Emergency stop",
          meaning:
            "A complementary protective function intended to avert or reduce an emergency hazard, with behavior derived from the machine risk assessment and applicable requirements.",
          physicalExample:
            "An accessible emergency actuator triggers the validated machine response and overrides ordinary production commands; releasing it does not command the robot to resume.",
        },
        {
          term: "Safe Torque Off (STO)",
          meaning:
            "A safety-related drive function that prevents torque-producing energy from being supplied to the motor, without by itself guaranteeing electrical isolation, braking, standstill, or load holding.",
          physicalExample:
            "A drive enters STO while a horizontal axis coasts; a vertical gravity-loaded axis may require a separately engineered brake or support.",
        },
        {
          term: "Command watchdog",
          meaning:
            "A monitor that detects missing or stale expected commands or heartbeats and invokes a declared local application response.",
          physicalExample:
            "A drive interface stops renewing its ordinary velocity request after 200 ms without a valid heartbeat and reports the timeout state.",
        },
        {
          term: "Energy isolation",
          meaning:
            "A controlled method for separating and managing hazardous electrical, mechanical, pneumatic, hydraulic, gravitational, thermal, or other energy for the intended work.",
          physicalExample:
            "STO alone does not establish isolation for electrical maintenance because hazardous voltage may remain on the drive's supply or DC bus.",
        },
        {
          term: "Restart inhibit",
          meaning:
            "A condition preventing automatic resumption of hazardous motion after a stop or fault until the designed reset and deliberate start requirements are satisfied.",
          physicalExample:
            "Resetting a simulated E-stop state changes `emergency_active` to `reset_required`; a separate authorized start is still needed after conditions are checked.",
        },
      ],
      physicalExamples: [
        {
          title: "Vertical axis after torque removal",
          scenario:
            "A gravity-loaded lift loses torque-producing drive energy. The axis is not mechanically supported and the ordinary motor brake has not been established as a safety-related holding function.",
          lookFor:
            "No-torque is not the same as no-motion; gravity, brake design, stored energy, load support, isolation, and risk-derived safe state require separate qualified decisions.",
        },
        {
          title: "UI stop versus independent emergency path",
          scenario:
            "A browser stop sends a request through Wi-Fi, a host process, ROS 2, and a standard controller. A separate engineered emergency chain does not depend on that application path.",
          lookFor:
            "The UI stop is valuable for ordinary operation but shares software, network, and host failure modes; do not label it E-stop, STO, safety-rated, or proof of stopped physical energy.",
        },
      ],
      workedExample: {
        title: "Review a layered stop-state table without touching hardware",
        setup:
          "A simulated arm has ordinary pause, ROS cancellation, a 200 ms command watchdog, a modeled emergency input, a modeled STO state, a vertical axis, and a separate symbolic brake. The exercise tests semantics and evidence only.",
        steps: [
          "List hazards and energy sources first: moving links, gravity-loaded axis, electrical supply and DC bus, stored mechanical energy, tool energy, remote commands, and unexpected restart. Assign qualified owners instead of designing circuits from the lesson.",
          "Create rows for normal stop, cancellation, watchdog timeout, protective function, emergency stop, STO, controlled safe stop, brake or support, energy isolation, reset, and restart. For each, state initiator, path, expected output, what is monitored, remaining energy, and evidence required.",
          "Inject a lost network heartbeat at simulated speed 0.6 m/s. At a 0.080 s detection time the pre-response travel is `0.6 × 0.080 = 0.048 m`; label this 48 mm as detection travel only, not total stopping distance or a safety setting.",
          "Add modeled actuation delay and braking travel as separate unknown or measured fields. Do not choose a protected-zone distance from the exercise arithmetic, because payload, surface, drive state, mechanical response, sensing, tolerances, and applicable safety design remain outside it.",
          "Trigger the symbolic STO state on the vertical-axis model and show both allowed outcomes: the motor cannot generate commanded torque, yet the load may coast or descend unless the separately modeled brake or support is effective.",
          "Release the symbolic emergency input and require `reset_required`, inspection of state and safeguards, resolved command authority, and a separate deliberate start. Reject any transition that automatically returns to motion.",
          "Run loss of browser, host process, standard controller, watchdog task, safety input, brake indication, and power restoration as separate fault cards; produce an awareness report listing which responses are application simulations and which require qualified real validation.",
        ],
        result:
          "The state table distinguishes ordinary and safety-related functions, shows that 48 mm covers only heartbeat-detection travel, exposes STO's no-torque versus no-motion boundary, and blocks automatic restart.",
        takeaway:
          "A stop claim is meaningful only when the hazard, channel, remaining energy, monitored state, failure assumptions, reset, and qualified evidence are all named.",
      },
      handsOn: {
        setup:
          "Use paper state cards, a lamp or simulator indicator, and no connected machine. Treat `E-stop`, `STO`, `brake`, and `isolation` as symbolic states rather than instructions for wiring or validation.",
        steps: [
          "Draw separate ordinary-command, watchdog, modeled emergency, modeled STO, brake or support, energy-isolation, reset, and restart paths; mark shared dependencies and qualified owners.",
          "Write the exact promise and non-promise for each path, including voltage remaining, torque generation, coast, gravity, standstill monitoring, communication dependence, and restart behavior.",
          "Simulate normal stop, cancel, stale heartbeat, browser loss, host crash, emergency request, STO request, brake unavailable, power restoration, reset, and deliberate restart.",
          "For one moving simulation, separate detection delay, actuation delay, and braking travel; record unknowns rather than turning the sum into a real machine parameter.",
          "Challenge the table with a vertical load and stored energy, then add the required qualified review item when no symbolic function alone establishes the safe state.",
          "Have another learner point to every use of `safe`, `emergency`, `STO`, or `isolated` and demand the owner, scope, evidence, and limitations; revise any overclaim.",
        ],
        observe:
          "The word `stop` hides very different paths and remaining energies; the most dangerous errors appear when zero command, no torque, zero speed, held load, and electrical isolation are treated as synonyms.",
        doneWhen:
          "Every state has a bounded promise and explicit non-promises, automatic restart is impossible in the simulation, and the artifact contains no real wiring, bypass, energization, or safety-validation instruction.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_HMI],
        workExample:
          "Map operator, ROS, drive, watchdog, safety controller, brake, isolation, reset, and restart responsibilities with qualified safety engineers; prevent HMI and software documentation from overstating ordinary stop behavior; and preserve separate evidence for each risk control.",
        interviewPrompt:
          "Explain why a web stop, ROS cancellation, watchdog, E-stop, STO, brake, and lockout are different. Use a vertical axis and network failure to show remaining energy, response evidence, reset behavior, and where qualified functional-safety ownership begins.",
      },
      commonMistakes: [
        {
          mistake: "Labelling a UI button or ROS cancellation as an emergency stop because it usually halts the demo.",
          correction:
            "Call it an ordinary stop request and identify its shared failure paths; route emergency risk reduction through the independently engineered and validated machine function.",
        },
        {
          mistake: "Assuming STO means the axis is stationary, held, and electrically safe to service.",
          correction:
            "STO prevents torque-producing motor energy but may allow coast or gravity motion and may leave hazardous voltage; braking, support, standstill, and isolation need their own design.",
        },
        {
          mistake: "Allowing motion to resume when an emergency actuator is released or power returns.",
          correction:
            "Use restart inhibition and require the designed inspection, reset, restored safeguards and authority, trustworthy state, and a separate deliberate start command.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is a robot-side command watchdog still not automatically safety-rated?",
          answer:
            "Its sensing, logic, output, independence, diagnostic coverage, failure rate, response, integration, and validation may not meet the risk-derived safety performance even if ordinary tests pass.",
        },
        {
          question: "What does STO not necessarily provide?",
          answer:
            "Electrical isolation, active braking, monitored standstill, holding against gravity or external force, removal of other energy, or a complete machine safe state.",
        },
        {
          question: "What should releasing an emergency-stop actuator do?",
          answer:
            "It should only permit the engineered reset process; it must not itself restart hazardous motion, which requires conditions to be checked and a separate deliberate authorization.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "A learner-built layered stop and remaining-energy table is safer and more exact than rendering one generic safety envelope that could imply a validated circuit.",
      },
    },
    {
      dayId: 154,
      mentalModel:
        "Hardware acceptance is a chain of mandatory evidence gates from identity and static inspection through simulated faults and qualified safety records, with no averaging away a critical failure.",
      explanation: [
        "Freeze acceptance before the run. Give each requirement a stable ID, test level, initial condition, configuration, procedure reference, expected result, measured field, tolerance, artifact, owner, witness where required, and mandatory or informational classification. Group evidence across task fit, exact hardware identity, mechanical installation, electrical design and inspection, firmware and manifests, communication and clocks, ros2_control resources and lifecycle, calibration and frames, low-risk command behavior, diagnostics, shutdown, safeguards, emergency functions, documentation, training, maintainability, and unresolved defects.",
        "Use a ladder whose claims match its physical boundary. A calculation reviews sizing assumptions; a mock checks plugin logic; simulation checks commands, leases, limits, frames, and fault transitions; HIL can add named compute, firmware, bus, I/O, or controller behavior while the plant remains emulated; restricted-energy tests can add selected mechanics under approval; real load and site tests add further evidence. Never relabel a missing rung as passed because another rung succeeded. `Not run`, `blocked`, `not applicable with rationale`, and `not verified at this level` are valid outcomes.",
        "Mandatory gates are conjunctive, not an average. Eighteen passes out of twenty equals 90 percent checklist completion, but acceptance remains reject when the missing rows concern a required calibration or validated emergency response. Noncritical deviations can support a conditional decision only when impact, containment, owner, due date, retest, and release authority are explicit. A screenshot, green dashboard, responsive device, controller activation, video, or one successful motion proves only its observed scope; keep raw measurements and failures beside the summary.",
        "Make the repeatable video an index into evidence, not theatre. Begin with visible date, test ID, exact code, firmware, configuration, device or mock identities, calibration, environment, and safety boundary; show the checklist and one continuous low-risk run; narrate expected versus observed checkpoints; inject a predeclared fault; end on terminal state and unresolved rows. Timecode the trace, logs, measurements, and decision. For this learner exercise, the run remains unpowered or simulated, and all real electrical, mechanical, load, E-stop, STO, and site acceptance stays explicitly pending qualified procedures.",
      ],
      keyTerms: [
        {
          term: "Acceptance criterion",
          meaning:
            "A predeclared observable condition, measurement method, tolerance, and decision rule used to determine whether a requirement is met.",
          physicalExample:
            "The mock drive manifest must contain the two expected identities and protocol version before the ros2_control component may enter its simulated active state.",
        },
        {
          term: "Mandatory gate",
          meaning:
            "An acceptance row that must pass at the required evidence level before release; other successes cannot compensate for it.",
          physicalExample:
            "A failed qualified emergency-function test blocks release even when all ordinary navigation and UI tests pass.",
        },
        {
          term: "Evidence level",
          meaning:
            "The exact physical and software boundary exercised, such as calculation, unit, mock, simulation, HIL, restricted hardware, full hardware, or site.",
          physicalExample:
            "A real edge computer exchanging CAN frames with an emulator is HIL evidence for compute and bus behavior, not proof of motor torque or braking.",
        },
        {
          term: "Deviation",
          meaning:
            "A documented difference between required and observed behavior with impact, containment, ownership, disposition, and retest status.",
          physicalExample:
            "Clock drift exceeds the acceptance bound; activation remains blocked while the cause and corrective test are assigned.",
        },
        {
          term: "Acceptance baseline",
          meaning:
            "The frozen set of code, firmware, configuration, calibration, hardware identities, environment, procedures, and criteria to which results apply.",
          physicalExample:
            "Changing a gearbox, encoder mapping, plugin version, or drive firmware invalidates the affected baseline rows and triggers declared regression.",
        },
      ],
      physicalExamples: [
        {
          title: "Ninety percent but rejected",
          scenario:
            "A checklist contains twenty required rows. Eighteen pass, the calibration-sign row fails, and qualified emergency-stop evidence is not available.",
          lookFor:
            "The arithmetic completion is 90 percent, yet two mandatory gates remain failed or blocked; the honest decision is reject or hold, not a rounded success.",
        },
        {
          title: "Continuous mock bring-up recording",
          scenario:
            "An uncut screen recording shows the test manifest, mock identities, plugin lifecycle, calibrated simulator state, leased jog, injected stale read, bounded error response, and final matrix.",
          lookFor:
            "The video correlates time and artifacts for the simulated scope while title cards state that wiring, power, torque, braking, E-stop, STO, and real load are unverified.",
        },
      ],
      workedExample: {
        title: "Decide a twenty-row bring-up gate",
        setup:
          "A mock-first acceptance matrix has twenty required rows. Eighteen passed at their declared simulation or document-review level. CAL-04 has the wrong joint sign, and SAFE-02 requires qualified emergency-function evidence that this learner run cannot perform.",
        steps: [
          "Verify the denominator and arithmetic: `18 / 20 × 100% = 90%` checklist completion. Keep completion separate from acceptance because rows have mandatory classifications and different evidence levels.",
          "Mark CAL-04 `failed`: the independent reference contradicts the reported sign. Link the raw count table, simulator trace, calibration version, impact on commanded motion, containment, owner, and required corrected rerun.",
          "Mark SAFE-02 `blocked — qualified real validation required`, not passed from the symbolic state-machine test and not failed merely because the learner lacks authority. Link the responsible safety owner and exact prerequisite procedure.",
          "Review every passing row's scope. Plugin load, read/write conversion, lease expiry, and mock watchdog pass only for the frozen simulation baseline; remove any language implying device timing, torque, stopping, or safety performance.",
          "Issue `REJECT / HOLD`: one mandatory calibration failure plus one mandatory unavailable safety result prevents hardware acceptance. Do not use the 90 percent summary to override either gate.",
          "Correct the mock sign mapping, create a new calibration version, rerun all dependent frame, limit, and teleoperation rows, and preserve both the original failure and new result; SAFE-02 remains blocked until the qualified external process occurs.",
          "Record an uncut simulated run with baseline, expected checkpoints, one predeclared stale-state fault, terminal state, artifact timecodes, failures, decision, and explicit list of real-world evidence still absent.",
        ],
        result:
          "The matrix reports 90 percent completion but correctly rejects release, preserves the calibration defect, and separates a learner-blocked safety gate from ordinary simulation evidence.",
        takeaway:
          "Acceptance is a logical decision over requirement-linked gates and evidence levels, not a percentage, polished video, or majority vote.",
      },
      handsOn: {
        setup:
          "Use the Week 22 paper decisions, calculations, manifests, mock plugin, calibration table, and simulator. Keep actuators unpowered and represent all safety functions symbolically.",
        steps: [
          "Create a twenty-or-more-row matrix spanning selection, sizing, power review, identity, firmware, buses, clocks, plugin, calibration, frames, limits, teleoperation, watchdog, shutdown, diagnostics, safety ownership, documentation, and residual defects.",
          "For each row assign requirement ID, evidence level, mandatory status, frozen baseline, initial condition, expected result, observation, artifact, owner, and disposition before running the final rehearsal.",
          "Execute only the unpowered and simulated rows, preserving failed, blocked, not-run, and not-applicable states rather than coercing the matrix to green.",
          "Inject one duplicate device, one stale state, one calibration-sign fault, and one lost teleoperation lease; verify each reaches its predeclared bounded mock outcome.",
          "Calculate completion separately from acceptance, apply mandatory-gate logic, and issue one explicit accept, conditional accept, hold, or reject decision with approver boundaries.",
          "Record one continuous simulator video showing the baseline, nominal path, one injected fault, measured terminal result, linked artifacts, final decision, and real hardware and safety evidence still outstanding.",
          "Ask a reviewer to reproduce three results from raw artifacts and identify one claim whose evidence level is overstated; correct the matrix and rerun only the formally affected rows.",
        ],
        observe:
          "A rigorous matrix becomes less green and more useful: it exposes which claims stop at calculation, mock, simulation, or HIL and prevents absent qualified evidence from becoming implied success.",
        doneWhen:
          "Every requirement maps to a frozen result and artifact, all injected faults are explainable, mandatory-gate logic determines the decision, and the video makes the unpowered or simulated boundary unmistakable.",
      },
      jobConnection: {
        roles: [
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_HMI,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "Lead a hardware bring-up gate that joins mechanical, electrical, firmware, ROS 2, calibration, operator, safety, support, and test evidence; preserve failures and unavailable qualified checks; and give deployment owners a reproducible decision rather than a demo narrative.",
        interviewPrompt:
          "Your robot passed eighteen of twenty bring-up checks, but calibration sign is wrong and E-stop validation is unavailable. Decide release, show evidence-level and mandatory-gate logic, explain the retest scope, and design an uncut video that does not overclaim.",
      },
      commonMistakes: [
        {
          mistake: "Accepting hardware because the checklist percentage is high.",
          correction:
            "Apply mandatory gates and required evidence levels; one critical failure or unresolved qualified safety requirement can block release regardless of the aggregate.",
        },
        {
          mistake: "Counting simulation of an E-stop state as validation of the physical emergency function.",
          correction:
            "Label the state logic as simulation evidence and keep sensing, wiring, safety logic, outputs, stopping, reset, failure performance, and integration pending qualified validation.",
        },
        {
          mistake: "Editing or discarding the failed run after a correction passes.",
          correction:
            "Preserve the original baseline, evidence, deviation, corrective change, impact analysis, new version, dependent reruns, and final disposition so the causal history remains auditable.",
        },
      ],
      checkQuestions: [
        {
          question: "Can 90 percent checklist completion be an acceptance pass?",
          answer:
            "Only if the predefined acceptance logic permits it and every mandatory gate passes at the required level; a failed critical row cannot be averaged away.",
        },
        {
          question: "What must an acceptance result say about simulation or HIL?",
          answer:
            "It must name exactly which components and physical effects were real or modeled, what the result establishes, and which loads, motion, energy, environment, or safety behavior remain unverified.",
        },
        {
          question: "What makes an uncut bring-up video useful evidence?",
          answer:
            "A visible frozen baseline, test ID, expected checkpoints, measured observations, time-correlated artifacts, injected fault, terminal state, failures, decision, and explicit evidence boundary.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A mandatory-gate acceptance ladder materially shows why calculation, mock, simulation, HIL, restricted hardware, and qualified safety evidence cannot be averaged or substituted for one another.",
      },
    },
  ],
} satisfies ChapterContent;
