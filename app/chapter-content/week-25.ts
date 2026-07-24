import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week25Content = {
  week: 25,
  title: "Operate the capstone as a reproducible, diagnosable robot service",
  purpose:
    "Turn the Field Capstone from a successful policy demonstration into an inspectable production candidate. This chapter builds a risk-linked SIL→HIL→hardware acceptance ladder; packages software without pretending a container includes firmware, devices, or calibration; provisions hosts and validates versioned configuration; captures diagnostics, metrics, traces, core dumps, and replay inputs with one evidence identity; designs truthful fleet telemetry, idempotent mission APIs, signed staged updates, and tested rollback; challenges held-out object positions, lighting, and distractors; freezes and executes exactly 50 acceptance trials; and publishes an uncut demonstration plus a failure analysis that preserves weak results. Every pass is limited to the tested build, configuration, hardware, environment, and oracle.",
  prerequisites: [
    "Bring the Week 24 capstone's frozen model, export artifact, measured edge profile, ROS 2 action boundary, held-out evaluation, fallback behavior, and exact code, model, configuration, and dataset identities.",
    "Bring one safe simulation baseline and, if available, an approved restricted-energy HIL bench or robot test area. A simulator, controller board, and complete robot are different evidence levels and must never share one unlabeled pass.",
    "Be able to distinguish request, acceptance, command, measured robot state, physical task result, and operator-visible terminal state; retain one mission identity across those boundaries.",
    "Keep learner work in simulation or on an authorized bench. Real motion, intentional communication loss, power interruption, watchdog tests, firmware updates, recovery, and rollback require the manufacturer's procedure, qualified supervision, a controlled area, and the site's safety and change controls.",
  ],
  outcomes: [
    "Build a risk-linked CI matrix that states what SIL, HIL, and controlled-hardware stages contain, which defects each can expose, what blocks promotion, and exactly what each passing stage does not prove.",
    "Create a deployment manifest joining immutable container digest, application build, model, host image, driver and firmware versions, device identities, configuration schema and content hashes, calibration, and rollback compatibility.",
    "Correlate diagnostics, structured logs, metrics, ROS 2 traces, core dumps, mission events, and recorded inputs into an access-controlled incident bundle, then replay it without claiming replay equals the original physical event.",
    "Design fleet telemetry around freshness and reported state, a mission API around idempotency and legal transitions, and a secure OTA campaign around device identity, signed metadata, compatibility, canaries, health gates, and recovery.",
    "Freeze a held-out scenario matrix over object position, lighting, and distractors; prevent evaluation leakage; and separate deterministic regression cases from randomized robustness exploration.",
    "Execute and adjudicate a frozen 50-trial suite without retries, threshold changes, hidden exclusions, or safety-critical failures being averaged away.",
    "Publish an uncut run, artifact manifest, acceptance table, and fact-first failure analysis whose claims remain bounded to the recorded configuration and whose failed evidence is never overwritten.",
  ],
  jobTargets: [
    ROLE_VALIDATION,
    ROLE_FLEET,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "Docker Docs — Building best practices",
      url: "https://docs.docker.com/build/building/best-practices/",
      useFor:
        "Official guidance for small trusted base images, multi-stage builds, cache behavior, CI builds, mutable tags, and digest pinning; used to teach image identity without claiming that a container captures host, device, firmware, calibration, or secret state.",
    },
    {
      label: "ROS 2 — ros2_tracing",
      url: "https://github.com/ros2/ros2_tracing",
      useFor:
        "ROS 2 project source for trace instrumentation, userspace and optional kernel tracing boundaries, launch and command control, initialization metadata, and snapshot capture; learners must measure overhead and retention for their own target.",
    },
    {
      label: "Open-RMF — Fleet Adapter Tutorial",
      url: "https://osrf.github.io/ros2multirobotbook/integration_fleets_adapter_tutorial.html",
      useFor:
        "Maintainer tutorial showing a fleet adapter as the bridge between robot state, task response, vendor robot commands, configuration, navigation graph, and RMF scheduling; its example REST interface is not treated as a universal production API.",
    },
    {
      label: "Uptane Standard 2.1.0",
      url: "https://uptane.org/docs/2.1.0/standard/uptane-standard",
      useFor:
        "Primary secure-update standard for signed metadata, freshness, hardware targeting, key-compromise resilience, and rollback or freeze attack defenses; used as architecture evidence, not as a claim that a classroom updater is Uptane-conformant.",
    },
    {
      label: "NIST — Grasping, manipulation, and contact-safety performance",
      url: "https://www.nist.gov/programs-projects/grasping-manipulation-and-contact-safety-performance-robotic-systems",
      useFor:
        "Government measurement program illustrating declared metrics, test methods, artifacts, independent measurement, repeatability, and recorded assembly-test configuration; the capstone suite remains project-specific rather than a NIST certification.",
    },
  ],
  days: [
    {
      dayId: 169,
      mentalModel:
        "The acceptance ladder is three differently equipped rooms: software rehearsal, controller bench, and controlled robot cell, with a locked evidence door between each room.",
      explanation: [
        "Picture one grasp command travelling toward a real arm. In software-in-the-loop, or SIL, the production decision software talks to a simulated robot and simulated sensors. In hardware-in-the-loop, or HIL, at least one production hardware boundary—such as the target computer, controller, field bus, or sensor interface—participates while dangerous motion is absent or tightly controlled. The hardware stage exercises the integrated robot in its approved test area. Passing one room grants entry to the next; it does not repaint that earlier evidence as physical proof.",
        "Freeze an acceptance contract before connecting it to CI. Each row needs a requirement or risk identifier, test level, exact stimulus, independent oracle, threshold, timeout, required artifacts, runner identity, and blocking rule. An oracle is how the test knows the truth; the policy node reporting `success` is not independent if that same node is under test. CI contributes repeatable triggering and record keeping, but a green badge alone says nothing about sensor realism, physical contact, calibration, or protective functions.",
        "Place a test at the cheapest level that can expose its target defect, then repeat high-consequence contracts across boundaries. SIL can rapidly explore state-machine transitions, deterministic time jumps, and thousands of perception inputs. HIL can reveal target-architecture, driver, bus timing, device startup, and watchdog defects that simulation omits. Controlled hardware can reveal backlash, glare, cable drag, thermal drift, object compliance, and real stopping behavior. Safety validation remains a separate qualified activity; a CI job must not bypass interlocks or create unapproved motion.",
        "Promotion depends on immutable evidence, not an impressive percentage. Record source revision, binary and model digests, merged configuration hash, scenario and seed, simulator or bench version, hardware serial or fixture identity, calibration, start time, monotonic timestamps, result, and artifact checksums. A flaky required case is unresolved evidence, not a pass after enough retries. If HIL is unavailable, the honest result is `SIL passed; HIL and hardware not verified`, with the missing boundary and owner named.",
      ],
      keyTerms: [
        {
          term: "Software-in-the-loop (SIL)",
          meaning:
            "Production-intent software tested against simulated plant, sensors, time, or peer interfaces without claiming the corresponding physical hardware behaved.",
          physicalExample:
            "A simulated camera publishes a shifted block pose and a simulated arm reports whether the policy's bounded grasp reaches the virtual target.",
        },
        {
          term: "Hardware-in-the-loop (HIL)",
          meaning:
            "A test that includes a named real controller, compute target, device, or electrical interface while the remaining plant is simulated or safely emulated.",
          physicalExample:
            "The production edge computer sends commands through the real CAN interface to a load-free controller bench that returns scripted encoder frames.",
        },
        {
          term: "Test oracle",
          meaning:
            "An observation or rule, sufficiently independent of the implementation under test, that decides whether the required outcome occurred.",
          physicalExample:
            "An overhead camera and fixture switch judge successful placement instead of trusting the policy's own `done=true` message.",
        },
        {
          term: "Promotion gate",
          meaning:
            "A predeclared set of blocking results and evidence requirements that must be satisfied before a build enters a higher-risk test level.",
          physicalExample:
            "The controller bench stays disabled until all SIL cancellation cases pass on the same signed build and configuration digest.",
        },
        {
          term: "Evidence identity",
          meaning:
            "The immutable set of build, configuration, environment, runner, hardware, scenario, and artifact identifiers attached to one result.",
          physicalExample:
            "Trial HIL-018 names commit, image digest, model hash, controller serial, firmware, configuration hash, fault script, and trace checksum.",
        },
      ],
      physicalExamples: [
        {
          title: "Three-room marble sorter",
          scenario:
            "A virtual sorter first routes drawn marbles on a screen, then a real controller switches small indicator lamps from simulated sensors, and only afterward an enclosed physical sorter handles foam balls.",
          lookFor:
            "The same routing contract crosses three boundaries, while lamp timing cannot prove ball handling and a successful virtual route cannot prove wiring or mechanics.",
        },
        {
          title: "Frozen encoder at successive gates",
          scenario:
            "SIL freezes a simulated joint timestamp, HIL replays the same stale frame through the target interface, and a qualified hardware procedure challenges the approved sensor path without defeating safeguards.",
          lookFor:
            "Detection deadline and terminal application state can be compared across levels, but only the final authorized setup observes the actual mechanism and its physical response.",
        },
      ],
      workedExample: {
        title: "Turn one stale-pose risk into a three-level promotion row",
        setup:
          "The capstone must cancel a grasp when camera-pose age exceeds 250 ms. The software response deadline is 150 ms after that threshold; the physical terminal condition is governed by a separate approved procedure.",
        steps: [
          "Create `REQ-VISION-07` and state the trigger, pose-age clock, 250 ms freshness limit, 150 ms software-response deadline, expected action status, and the physical claim that this software-only requirement does not decide.",
          "Define SIL-07 to freeze the simulated source timestamp while messages continue, using an external probe to time first threshold crossing, cancellation request, action terminal state, and absence of later motion commands.",
          "Define HIL-07 with the identical logical fault injected through the target edge computer and production camera interface emulator; add device startup, driver, and bus evidence that SIL cannot supply.",
          "Define HW-07 only by reference to the reviewed robot procedure, controlled area, qualified owners, independent measurement, allowed speed and payload, stop criteria, and abort conditions; do not invent those values in CI.",
          "Freeze promotion rules: SIL and HIL require the same build and merged-configuration hash, zero missing artifacts, no retries, and all timing assertions met; hardware scheduling remains blocked until the responsible reviewers approve.",
          "If SIL measures 118 ms and HIL measures 164 ms, record SIL `PASS`, HIL `FAIL`, hardware `NOT RUN`, retain both traces, and investigate target scheduling instead of averaging 141 ms into a pass.",
        ],
        result:
          "One requirement produces comparable evidence at two software boundaries and a separately governed physical test, while the 164 ms HIL failure correctly blocks higher-risk execution.",
        takeaway:
          "A ladder is trustworthy when each rung names its equipment and oracle, carries forward the same contract, and refuses to borrow confidence from a different boundary.",
      },
      handsOn: {
        setup:
          "Use the existing capstone simulator, a CI configuration draft, and a paper HIL/hardware plan. Do not connect, energize, move, fault, or update physical equipment for this exercise.",
        steps: [
          "List eight capstone risks or requirements and mark the first test level able to observe each defect: component, SIL, HIL, or controlled hardware.",
          "Choose three high-consequence contracts that must repeat at more than one level, and keep their triggers, units, terminal states, and evidence names consistent.",
          "Write a matrix with build, model, configuration, scenario, seed, runner, device, calibration, oracle, timeout, artifact, result, and promotion columns.",
          "Automate one safe SIL nominal case and one injected failure with deterministic setup, bounded timeout, clean cancellation, and a machine-readable result.",
          "Draft HIL and hardware rows using `NOT AVAILABLE` or `NOT AUTHORIZED` where appropriate; name the exact missing equipment, procedure, reviewer, or measurement instead of simulating a pass.",
          "Have another engineer trace one green row from requirement through command, measured outcome, artifacts, and promotion decision, then repair every unsupported link.",
        ],
        observe:
          "The exercise usually exposes tests whose oracle is the component under test, hardware claims supported only by simulation, and results that cannot be reconstructed from a build or configuration identity.",
        doneWhen:
          "The SIL job is repeatable, every higher-level row states its real boundary and authority, failures block promotion, and the report contains no HIL or hardware claim without matching evidence.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Design a risk-based regression pipeline for a robot release, place faults at SIL, target-compute HIL, and controlled-hardware boundaries, preserve traceable artifacts, and stop promotion when timing or evidence is incomplete.",
        interviewPrompt:
          "Explain how you would test stale perception through SIL, HIL, and real hardware. Name the equipment, oracle, promotion rule, evidence limitation, and what a green CI job still cannot prove.",
      },
      commonMistakes: [
        {
          mistake: "Calling a target computer running against a fully simulated device a real-robot test.",
          correction:
            "Label the participating boundary precisely as HIL, list the simulated plant and interfaces, and reserve hardware acceptance for the controlled integrated robot and independent physical measurements.",
        },
        {
          mistake: "Retrying a required flaky case until CI becomes green.",
          correction:
            "Keep the original failure, mark the evidence unresolved, diagnose the flake, and rerun only under the predeclared policy without converting repeated attempts into one clean result.",
        },
        {
          mistake: "Using the policy's own success field as the sole acceptance oracle.",
          correction:
            "Observe the terminal task independently through measured robot or fixture state and correlate that observation with the internal action result for diagnosis.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a SIL pass prove about a physical gripper?",
          answer:
            "Only that the named software behaved against the declared simulation and oracle; it does not prove wiring, firmware, timing, force, contact, calibration, or physical task success.",
        },
        {
          question: "When should a test appear on more than one ladder rung?",
          answer:
            "When the same high-consequence contract needs fast regression plus evidence from target hardware or physical effects that a cheaper level cannot observe.",
        },
        {
          question: "What is the correct status when SIL passes but no HIL bench exists?",
          answer:
            "`SIL passed; HIL and hardware not verified`, followed by the missing boundary, required evidence, owner, and promotion block.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The learner's live gate matrix carries exact runners, boundaries, oracles, and promotion decisions; a generic ladder picture would erase the evidence differences.",
      },
    },
    {
      dayId: 170,
      mentalModel:
        "Deployment is a labeled field kit: container, host, devices, firmware, configuration, calibration, secrets, and recovery instructions must all match before the robot may act.",
      explanation: [
        "A Docker image packages a filesystem and process environment, not the entire robot. It does not automatically capture the host kernel, GPU or camera driver, device firmware, udev rules, clock setup, network quality, calibration files, mounted secrets, or the mechanism itself. Image tags such as `capstone:latest` can move; a content digest such as `sha256:…` identifies bytes. Even a pinned image can be wrong for the target hardware, so compatibility remains a tested manifest claim rather than a property of Docker.",
        "Provisioning makes a blank or known host reach a declared state. Split it into a reviewed base image, packages and drivers, users and permissions, device rules, services, storage and log policy, time synchronization, network policy, and health checks. Make the process idempotent: applying it twice should converge rather than duplicate services or corrupt state. Save secrets outside source, container layers, logs, and evidence bundles; record the secret version or reference, never its value.",
        "Treat configuration as a typed interface. Give its schema a version, define units and ranges, reject unknown or missing safety-relevant keys, and calculate a hash of the fully resolved configuration after defaults and environment overlays. Keep calibration separate but linked because two robots can run identical code with different camera intrinsics or joint offsets. A startup report should state desired configuration, loaded configuration, rejected fields, device identities, and whether motion remains inhibited.",
        "Reproducibility also needs change and recovery records. Build from reviewed source, pin dependencies where appropriate, produce a software bill of materials, scan and sign according to the organization's process, and promote one immutable artifact rather than rebuilding per environment. Before rollout, test backup format, database or configuration migrations, downgrade compatibility, and a known-good recovery image. Rollback means restored service and compatible state; merely starting an older container is not proof that missions, maps, models, or firmware remain usable.",
      ],
      keyTerms: [
        {
          term: "Image digest",
          meaning:
            "A content-derived identifier for one exact container image, unlike a human-friendly tag that may later point elsewhere.",
          physicalExample:
            "Two edge computers pull `capstone:stable`, but only the recorded `sha256:8a…` digest proves they received the same image bytes.",
        },
        {
          term: "Provisioning",
          meaning:
            "The controlled process that brings a host's operating system, drivers, accounts, devices, services, policies, and storage to a declared state.",
          physicalExample:
            "A new robot computer gains the approved GPU driver, camera rule, service account, clock source, log limits, and disabled-motion startup service.",
        },
        {
          term: "Resolved configuration",
          meaning:
            "The final validated values actually loaded after defaults, files, environment overlays, and runtime selection have been combined.",
          physicalExample:
            "The base file says `max_speed_mps: 0.4`, the lab overlay says `0.2`, and the startup manifest records the loaded value and hash as 0.2 m/s.",
        },
        {
          term: "Device manifest",
          meaning:
            "A versioned inventory joining logical device roles to expected model, serial, firmware, driver, port, and calibration identities.",
          physicalExample:
            "Logical `wrist_camera` must resolve to serial C42 with firmware 3.1, driver 2.8, and calibration hash `41bd…`, not whichever camera appears first.",
        },
        {
          term: "Rollback compatibility",
          meaning:
            "Evidence that an older approved release can read current persistent state and safely operate with the installed firmware, model, schema, and configuration.",
          physicalExample:
            "Release 12 can start after release 13 only because the mission database migration is reversible and the controller firmware still accepts its protocol.",
        },
      ],
      physicalExamples: [
        {
          title: "Identical lunchboxes, different tools",
          scenario:
            "Two sealed lunchboxes have the same outside label, but one contains a spoon and the other a fork; the dining table also differs in height.",
          lookFor:
            "The container resembles the lunchbox, while host drivers, attached devices, calibration, and environment resemble the missing tool and table; matching one package does not match the system.",
        },
        {
          title: "Camera order changes after reboot",
          scenario:
            "A robot has wrist and room cameras. After a USB reconnect, enumeration order swaps, and software using `/dev/video0` silently reads the room instead of the wrist.",
          lookFor:
            "Provision stable identity from serial or approved device attributes, validate the expected stream and calibration, and keep motion inhibited on mismatch.",
        },
      ],
      workedExample: {
        title: "Build a deployment identity for one edge robot",
        setup:
          "A capstone release uses a containerized ROS 2 service, an exported policy, one depth camera, one controller, a lab configuration overlay, and persistent mission state.",
        steps: [
          "Record source commit, CI build identity, exact container digest, base-image digest, package lock or dependency manifest, model hash, and software bill of materials; keep the friendly release tag only as an alias.",
          "Add host image, kernel, architecture, GPU runtime, driver, ROS 2 distribution, time service, and provisioning revision, then mark each compatibility claim as tested or unknown.",
          "Map `wrist_camera` and `arm_controller` to model, serial, firmware, stable device path, expected data shape or protocol, and calibration hash; fail startup if an identity or required calibration differs.",
          "Validate configuration schema `3`, merge base and lab overlays, normalize the result, hash it, and print units, important limits, and source layers without printing any secret values.",
          "Run a no-motion preflight that checks devices, clocks, storage, logs, model load, action server lifecycle, and fallback availability before producing a readiness result.",
          "Test recovery on disposable state: upgrade, write a representative mission record, restore or migrate as designed, boot the approved prior release, and verify data plus no-motion health before calling rollback viable.",
        ],
        result:
          "The release is represented by a joined manifest rather than `capstone:latest`, and any missing host, device, calibration, configuration, or recovery fact blocks the corresponding readiness claim.",
        takeaway:
          "Reproducibility means another controlled target can reconstruct the same relevant state and detect mismatches before motion, not merely launch the same container command.",
      },
      handsOn: {
        setup:
          "Use a local development machine, the capstone container definition, mock device records, and disposable data. Do not provision, reboot, update, or change a real robot host.",
        steps: [
          "Build the development image twice from the same reviewed inputs and record both resulting digests; investigate any difference rather than declaring bitwise reproducibility automatically.",
          "Replace floating base and dependency references with reviewed version or digest policies where appropriate, while documenting how security updates will intentionally advance those pins.",
          "Write a machine-readable deployment manifest joining image, model, host, driver, firmware, device, configuration, calibration, and persistent-schema identities.",
          "Create a schema check that rejects a misspelled key, wrong unit, out-of-range limit, absent required value, and unknown device serial before the application can become active.",
          "Run provisioning logic twice against a disposable target or dry-run representation and compare planned changes; the second pass should be empty or explicitly explain non-convergent work.",
          "Rehearse rollback with disposable mission state, then record `PASS`, `FAIL`, or `NOT VERIFIED` separately for process start, configuration load, device readiness, state compatibility, and task execution.",
        ],
        observe:
          "Container identity is usually the easiest row; host drivers, device-to-calibration binding, resolved overlays, persistent-state downgrade, and secret handling create the larger reproducibility gaps.",
        doneWhen:
          "One manifest reconstructs every relevant version, invalid configuration fails closed before motion, repeated provisioning converges, and rollback claims stop at the boundary actually tested.",
      },
      jobConnection: {
        roles: [ROLE_FLEET, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Package and provision an edge robot release, bind exact devices and calibration, validate layered configuration before activation, expose a reviewable manifest, and rehearse state-compatible recovery across a managed fleet.",
        interviewPrompt:
          "A container works on one robot but fails after deployment to another. Show the host, device, firmware, configuration, calibration, secret, and persistent-state evidence you would inspect before blaming Docker.",
      },
      commonMistakes: [
        {
          mistake: "Calling `robot:latest` a reproducible release identifier.",
          correction:
            "Record and promote the immutable image digest with source, dependency, model, and host manifests; use tags only as changeable human-facing aliases.",
        },
        {
          mistake: "Baking site configuration, calibration, and credentials into the image.",
          correction:
            "Version and validate configuration and calibration as separately identifiable inputs, inject secrets through approved controls, and log references or hashes without values.",
        },
        {
          mistake: "Declaring rollback successful when the old process starts.",
          correction:
            "Verify schema and data compatibility, device and firmware compatibility, health, command inhibition, and the required mission outcome under the rollback acceptance plan.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can two robots using the same image digest still behave differently?",
          answer:
            "Their host kernel, drivers, firmware, devices, calibration, resolved configuration, clocks, network, persistent state, or mechanics can differ outside the image.",
        },
        {
          question: "What should happen when an unknown safety-relevant configuration key appears?",
          answer:
            "Schema validation should reject startup or activation with a clear diagnostic; silently ignoring the key makes the loaded behavior ambiguous.",
        },
        {
          question: "What does an idempotent provisioner do on its second run?",
          answer:
            "It converges on the same declared state without duplicating or corrupting resources, and reports any intentional remaining changes explicitly.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The deployment manifest itself is the necessary map because it exposes exact identities and omissions that a generic container diagram cannot represent.",
      },
    },
    {
      dayId: 171,
      mentalModel:
        "Robot observability is an aircraft recorder assembled from gauges, event notes, timing traces, crash memory, and replayable inputs, all synchronized to one mission identity.",
      explanation: [
        "Diagnostics answer bounded health questions such as whether a camera is present, calibrated, fresh, and producing the expected shape. Logs record discrete events with fields a machine can query. Metrics summarize repeated values over time, such as pose age, inference latency, queue depth, temperature, and mission success count. A trace follows causal work across callbacks or services. None is the physical truth by itself: a healthy heartbeat can accompany frozen data, and a low average latency can hide one deadline-breaking tail.",
        "Give every mission, action goal, robot, process, build, and configuration an identity that survives service boundaries. Use wall-clock time for human correlation and a monotonic clock for durations on one machine; record clock source and synchronization quality when comparing hosts. Sequence numbers and source timestamps help expose gaps and staleness. Log requested, accepted, commanded, measured, and terminal states separately so an investigator can see where a claim changed, rather than reading one optimistic `completed` line.",
        "A core dump is a captured image of a crashed process's memory and execution context, useful with the matching executable and debug symbols. It can also contain tokens, object data, personal information, or proprietary model inputs, so collection, access, retention, redaction, and transfer need explicit policy. A stack trace points to where execution stopped, not necessarily why. Preserve the original core and symbols, but test crash capture on a harmless development process before depending on it during an incident.",
        "Incident replay needs the exact executable, model, resolved configuration, calibration reference, recorded inputs, initial state, event order, time model, random seeds, and dependency identities. First reproduce the symptom, then change one hypothesis at a time. A replay that crashes at the same stack strengthens a software hypothesis; a replay that succeeds does not disprove cable noise, thermal drift, lighting, or physical contact that was never recorded. Mark facts, derived measurements, hypotheses, experiments, and conclusions as different evidence classes.",
      ],
      keyTerms: [
        {
          term: "Diagnostic",
          meaning:
            "A current, bounded assessment of a component's condition, supporting observations, and severity rather than a generic alive flag.",
          physicalExample:
            "The camera diagnostic reports serial match, calibration hash, frame age 42 ms, expected 30 Hz, actual 29.8 Hz, and zero dropped frames.",
        },
        {
          term: "Metric",
          meaning:
            "A numeric measurement aggregated or sampled over time with declared unit, labels, and collection window.",
          physicalExample:
            "A histogram shows inference latency in milliseconds and reveals a 240 ms tail that the 38 ms average concealed.",
        },
        {
          term: "Trace",
          meaning:
            "Timestamped causal events that follow work through callbacks, queues, services, actions, or processes at finer detail than ordinary logs.",
          physicalExample:
            "Trace spans connect image receipt, preprocessing, policy inference, action submission, controller acknowledgment, and cancellation for mission M-204.",
        },
        {
          term: "Core dump",
          meaning:
            "A protected snapshot of a crashed process's memory and execution state, interpreted with the matching binary, libraries, symbols, and platform.",
          physicalExample:
            "A segmentation fault leaves thread stacks and memory values that identify the failing function when opened with the exact release symbols.",
        },
        {
          term: "Incident replay",
          meaning:
            "A controlled rerun of captured inputs and initial conditions against identified software to reproduce and test a specific failure hypothesis.",
          physicalExample:
            "Recorded images, joint states, mission events, and timing are fed to release 25.3 before and after one queue-ordering fix.",
        },
      ],
      physicalExamples: [
        {
          title: "Dashboard green while the wheel is stuck",
          scenario:
            "A rover process publishes heartbeats and accepts a mission, but tape wrapped around one wheel prevents travel while the controller's requested velocity remains nonzero.",
          lookFor:
            "Alive process, accepted command, encoder motion, independent displacement, motor current, and terminal mission are different observations; a green heartbeat covers only one.",
        },
        {
          title: "Kitchen accident reconstruction",
          scenario:
            "A timer, oven-temperature chart, recipe steps, security video, and broken-tray position each preserve different parts of a dropped-cake event.",
          lookFor:
            "No single artifact contains intent, order, timing, and physical cause; synchronize them, protect sensitive footage, and separate visible facts from guesses.",
        },
      ],
      workedExample: {
        title: "Reconstruct a crash after a late grasp cancellation",
        setup:
          "In a simulated or approved restricted setup, mission M-204 reports stale perception, cancellation starts, and the action client process crashes. The final physical or simulated tool state must be measured independently.",
        steps: [
          "Freeze the incident window and copy logs, metrics, ROS 2 trace, core dump, recorded inputs, mission events, build and model identities, resolved configuration hash, symbols, clock metadata, and artifact checksums into read-only storage.",
          "Build a fact timeline: pose age crossed 250 ms at monotonic 18.420 s, cancellation was requested at 18.553 s, process received `SIGSEGV` at 18.561 s, and the independent tool-state recorder ended at its observed pose.",
          "State evidence limits: timestamps from another host have measured synchronization uncertainty; the core contains process memory but no contact-force measurement; the trace observes software scheduling but not cable or lighting conditions.",
          "Open the core with the exact binary and symbols, identify the crashing thread and stack, then write at least two hypotheses such as a cancellation callback lifetime defect or earlier memory corruption.",
          "Replay the preserved inputs and event timing on the original build without editing the bundle; record whether the symptom, stack, and terminal state repeat and how many attempts were made.",
          "Change one candidate cause, rerun the same replay plus a non-incident regression case, and report `reproduced`, `not reproduced`, or `inconclusive`; reserve `root cause confirmed` for evidence that excludes credible alternatives.",
        ],
        result:
          "The bundle connects a stale-input response to a reproducible software crash while keeping cross-host timing uncertainty and unrecorded physical conditions visible.",
        takeaway:
          "Observability turns an incident into testable timelines and hypotheses, but only when identities align and missing sensors remain missing rather than being filled with confident stories.",
      },
      handsOn: {
        setup:
          "Use a disposable local capstone simulation and synthetic, non-sensitive inputs. Deliberately crash only a harmless development process; do not crash a robot controller or production service.",
        steps: [
          "Add structured fields for mission, robot, action goal, process, build, model, configuration, source timestamp, sequence number, and monotonic duration to one nominal path.",
          "Create diagnostics for absent device, wrong identity, stale frames, low rate, and calibration mismatch, then verify each state changes independently of the process heartbeat.",
          "Capture a trace around perception-to-action work and compare callback or queue timing with a latency metric; document tracing configuration and measured overhead.",
          "Trigger a controlled development crash containing no credentials, verify the core or crash record can be found, and confirm the matching symbols identify a deliberate failure site.",
          "Package logs, metrics, trace, crash record, inputs, manifest, and checksums under one incident identity with access and retention notes.",
          "Replay once unchanged and once with a single candidate fix, then write a fact/hypothesis table that marks every unsupported physical conclusion as unknown.",
        ],
        observe:
          "Correlation gaps, clock ambiguity, missing symbols, overwritten logs, unrecorded inputs, and secrets inside crash artifacts often block diagnosis more than lack of log volume.",
        doneWhen:
          "Another engineer can reconstruct the software timeline, locate the crash with matching artifacts, repeat the replay, and identify every physical fact that the bundle cannot establish.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_PHYSICAL_AI],
        workExample:
          "Instrument production ROS 2 and policy paths, correlate distributed incidents, preserve secure crash and replay bundles, distinguish scheduling or lifetime defects from missing physical evidence, and convert confirmed failures into regression cases.",
        interviewPrompt:
          "A robot mission ends after a node crashes during cancellation. Explain which diagnostics, logs, metrics, traces, core artifacts, clocks, and replay inputs you need, plus what each cannot prove.",
      },
      commonMistakes: [
        {
          mistake: "Equating a heartbeat and normal CPU metric with a healthy sensor pipeline.",
          correction:
            "Check data identity, source timestamp, sequence continuity, rate, shape, calibration, and an independent task-relevant observation in addition to process liveness.",
        },
        {
          mistake: "Sharing a core dump as if it were an ordinary text log.",
          correction:
            "Treat process memory as sensitive, apply approved collection, access, retention, and redaction controls, and keep the exact binary and symbols linked without exposing secrets.",
        },
        {
          mistake: "Calling a matching replay stack trace complete proof of the field root cause.",
          correction:
            "Use replay to strengthen and test a software hypothesis, then account for unrecorded timing, hardware, environmental, and contact conditions before closing alternatives.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does average inference latency not establish deadline compliance?",
          answer:
            "The average can hide rare slow samples; inspect the declared distribution, tail, time window, load, and every deadline violation.",
        },
        {
          question: "What extra files make a core dump interpretable?",
          answer:
            "The exact executable, libraries, debug symbols, platform identity, and relevant source revision, handled under the same sensitive-data controls.",
        },
        {
          question: "What does a successful incident replay fail to prove?",
          answer:
            "It does not prove unrecorded physical conditions such as contact, cable noise, temperature, glare, wear, or cross-host timing occurred exactly as reconstructed.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The correlated incident timeline and fact-versus-hypothesis table are the useful visuals; a generic observability graphic would not preserve clock uncertainty or missing evidence.",
      },
    },
    {
      dayId: 172,
      mentalModel:
        "A fleet is a group of couriers carrying numbered job cards and signed update parcels across unreliable roads, while headquarters distinguishes requested plans from reported physical reality.",
      explanation: [
        "Fleet telemetry should describe observation, not wishful state. Send robot identity, boot and software identity, source timestamp, sequence, pose and frame, velocity, localization quality, battery, mode, active mission, fault set, and data freshness appropriate to the system. Separate desired state from reported state: an update service may desire release 25.4 while the robot still reports 25.3, and a mission service may request docking while sensors report no movement. Dashboards must show stale or unknown data rather than extending the last green value forever.",
        "A mission API is a state machine around a physical promise. Give each client operation an idempotency key so a timeout and retry return the original operation instead of creating a second delivery. Validate legal transitions such as `queued → assigned → executing → completed`, and define cancellation, rejection, expiration, partial physical progress, and recovery. HTTP `202 Accepted` proves only that the service accepted work for processing; completion requires correlated robot and task evidence plus an independently meaningful terminal condition.",
        "Secure over-the-air updating is more than downloading through HTTPS. The device verifies authorized signed metadata, freshness, target identity, hardware and dependency compatibility, artifact digest, and policy before installation. Separate keys and roles according to an reviewed update architecture, protect device identity, and reject expired, wrong-target, or older unauthorized metadata. This lesson borrows Uptane security concepts but does not claim a small classroom updater is conformant or suitable for an industrial fleet.",
        "Roll out in rings: lab, one canary, a small cohort, then broader fleet, with frozen health windows and automatic or operator-controlled holds. Monitor boot, process health, telemetry freshness, mission outcomes, resource and thermal behavior, and new fault rates against the same baseline. Rollback needs a known-good slot or image, compatible configuration and persistent state, and a safe mission recovery plan. If a migration or firmware step is irreversible, call it forward recovery, not rollback, and plan that boundary before deployment.",
      ],
      keyTerms: [
        {
          term: "Telemetry envelope",
          meaning:
            "A versioned report containing observation values plus robot, software, time, sequence, unit, frame, quality, and freshness context.",
          physicalExample:
            "Robot R7 reports map pose `(4.2 m, 1.1 m, 0.3 rad)`, source age 80 ms, sequence 912, localization quality degraded, and release digest `d4…`.",
        },
        {
          term: "Idempotency key",
          meaning:
            "A client-chosen identity that makes repeated equivalent requests resolve to one logical operation and its existing result.",
          physicalExample:
            "Two retried `POST /missions` calls with key `dock-R7-104` return mission M104 rather than dispatching the robot twice.",
        },
        {
          term: "Reported state",
          meaning:
            "What the robot or independent observer currently measures and attests, kept separate from what fleet control requested.",
          physicalExample:
            "The console desires `charging`, but the robot reports `waiting_at_dock` and zero charging current, so charging is not shown as complete.",
        },
        {
          term: "Canary deployment",
          meaning:
            "A deliberately small first rollout whose declared observation window and gates limit exposure before wider promotion.",
          physicalExample:
            "One of twenty equivalent robots receives release 25.4 for ten frozen missions while nineteen remain on the known-good digest.",
        },
        {
          term: "Rollback attack",
          meaning:
            "An adversarial attempt to install an older, once-valid software or metadata version that may contain known weaknesses.",
          physicalExample:
            "A captured signed package from last year is replayed, but trusted version and freshness metadata cause the robot to reject it.",
        },
      ],
      physicalExamples: [
        {
          title: "Duplicate elevator request",
          scenario:
            "A delivery robot sends an elevator mission, the network drops the reply, and the client retries while the first request is already executing.",
          lookFor:
            "One idempotency identity must return the original mission and physical progress; a new database row or `202` response could otherwise trigger two conflicting trips.",
        },
        {
          title: "Signed parcel for the wrong machine",
          scenario:
            "A cryptographically signed camera-firmware package is authentic but targets model C, while the receiving robot contains model B hardware.",
          lookFor:
            "Signature validity is necessary but not sufficient; verify target hardware, dependency, version, freshness, policy, and recovery compatibility before installation.",
        },
      ],
      workedExample: {
        title: "Adjudicate one retried mission during a canary update",
        setup:
          "Fleet R has ten simulated robots. R7 is the only canary for release digest `25.4@d4…`; a client creates dock request key `dock-R7-104`, loses its reply, and retries.",
        steps: [
          "Validate the signed release metadata, artifact digest, target hardware class, configuration schema, model dependency, minimum firmware, version freshness, and known-good recovery artifact before R7 becomes eligible.",
          "Install only on R7, boot into motion-inhibited health checks, and require reported digest `d4…`, resolved configuration hash, device manifest, telemetry freshness, and no blocking fault before mission work.",
          "On the first API request, atomically bind idempotency key `dock-R7-104` to mission M104; on retry, return M104 and its present state without allocating another mission.",
          "Correlate API, allocator, adapter, robot, and dock telemetry through M104 while distinguishing desired `docking` from reported pose, motion, contact, charging current, and terminal state.",
          "If R7 reports fresh telemetry but no charging current before the deadline, mark M104 `failed` with observed physical state, hold the rollout, and preserve the canary evidence instead of promoting on process health.",
          "Exercise the preplanned recovery path, verify the reported prior digest, configuration and state compatibility, then run its recovery acceptance mission; label rollback complete only if all frozen recovery gates pass.",
        ],
        result:
          "The retry creates one mission, stale optimism never becomes completion, the canary failure stops fleet exposure, and recovery is judged by reported identity plus task evidence.",
        takeaway:
          "Fleet correctness needs identity at both control planes: one logical mission across retries and one authorized software state across staged update and recovery.",
      },
      handsOn: {
        setup:
          "Use two simulated robot workers, a local mission service, synthetic telemetry, and signed-test fixtures with non-production keys. Do not update or command a real fleet.",
        steps: [
          "Define a versioned telemetry schema with identity, source time, sequence, units, frame, quality, freshness, mission, desired release, reported release, and fault fields.",
          "Implement a mission state machine and idempotent create operation, then inject a lost response and prove the retry returns the original mission without duplicate dispatch.",
          "Make the operator view render fresh, stale, unknown, desired, and reported states distinctly; verify an old green packet becomes stale after its deadline.",
          "Create test update metadata for correct target, wrong target, expired metadata, mismatched digest, and older version; accept only the authorized compatible fixture.",
          "Roll the test artifact to one simulated canary, execute a frozen health window with one mission, inject a regression, and verify promotion stops.",
          "Restore the known-good test artifact and validate boot, reported identity, configuration, persistent mission reconciliation, and one recovery task before recording the rollback outcome.",
        ],
        observe:
          "The hardest defects appear between planes: an API acknowledges work the robot never performs, desired software is mistaken for installed software, or process recovery hides incompatible mission state.",
        doneWhen:
          "Retries cannot duplicate physical work, stale telemetry is visible, invalid update fixtures fail closed, canary regression blocks expansion, and recovery has a task-level result rather than a boot-only claim.",
      },
      jobConnection: {
        roles: [ROLE_FLEET, ROLE_HMI, ROLE_VALIDATION],
        workExample:
          "Build mission and telemetry contracts for intermittent networks, expose desired versus reported robot state to operators, stage authenticated compatible releases, stop on canary regression, and reconcile physical mission state through rollback.",
        interviewPrompt:
          "A client retries a mission while one robot is receiving an OTA canary. Design the identities, state transitions, telemetry freshness, update checks, rollout gates, and recovery evidence that prevent duplicate work and false completion.",
      },
      commonMistakes: [
        {
          mistake: "Displaying the last telemetry packet as current until a replacement arrives.",
          correction:
            "Evaluate source timestamp, receipt time, sequence, and freshness deadline; render stale or unknown explicitly and inhibit decisions whose required observation has expired.",
        },
        {
          mistake: "Assuming HTTPS plus a checksum makes an OTA system secure.",
          correction:
            "Use an approved update design with trusted signed metadata, freshness and version checks, target compatibility, protected keys, artifact identity, staged rollout, and tested recovery.",
        },
        {
          mistake: "Treating `202 Accepted` or a successful reboot as task completion.",
          correction:
            "Follow the same identity to reported robot and physical terminal state, and verify recovery compatibility plus a declared mission outcome.",
        },
      ],
      checkQuestions: [
        {
          question: "What should a repeated mission request with the same idempotency key do?",
          answer:
            "Return or reconcile the original logical mission and its current result without creating a second dispatch or repeating physical work.",
        },
        {
          question: "Why must desired and reported release versions be separate?",
          answer:
            "The fleet can request an update that has not installed, booted, or passed health checks; only reported state shows the robot's observed software identity.",
        },
        {
          question: "When is an older-image boot not a completed rollback?",
          answer:
            "When configuration, persistent state, firmware, devices, health, mission reconciliation, or the required recovery task has not been shown compatible.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A sequence log joining request retry, mission state, reported robot state, canary gate, and recovery result communicates the distributed truth better than a generic fleet diagram.",
      },
    },
    {
      dayId: 173,
      mentalModel:
        "Held-out testing is a surprise obstacle course whose layout is sealed before the robot enters, while each changed physical factor stays labeled for later diagnosis.",
      explanation: [
        "An unseen condition is outside the examples used to fit the model or tune the system, but “unseen” must name a boundary. A new object position may still lie inside the trained workspace; a new lamp direction may change shadows; a distractor may resemble the target. Reserve evaluation scenes before tuning, store their identities separately, and disclose prior exposure from pretraining or manual inspection when known. Novelty is graded evidence, not a magical claim that the robot understands every new room.",
        "Turn variation into factors and levels. For a tabletop task, factors might include target x-y cell, yaw, object instance, background, illumination direction and intensity, camera exposure, distractor count and similarity, start joint pose, and occlusion. Freeze valid ranges from the intended operating envelope, then choose combinations that cover important interactions. Changing everything randomly can find failures but makes diagnosis difficult; single-factor sweeps and designed combinations answer different questions.",
        "Keep deterministic regression separate from robustness exploration. A fixed suite with recorded seeds and asset hashes shows whether the same contract changed across builds. A randomized campaign samples a declared distribution and must record every generated scene, including failures. Do not reroll an inconvenient placement or delete a run because the object “looked unfair” after seeing the result. If a condition is invalid, apply a rule written before execution and preserve the excluded record with its reason.",
        "Use an independent oracle and categorize failure at the first unsupported link: target not visible, incorrect detection, pose error, plan failure, grasp slip, transport loss, wrong placement, timeout, unsafe or policy-forbidden action, or evidence loss. Compare success rate with latency and recovery behavior per factor, not only overall. A held-out failure can guide the next training set, but once used for tuning it leaves the untouched test set and becomes development evidence.",
      ],
      keyTerms: [
        {
          term: "Held-out condition",
          meaning:
            "A scene, object, or factor combination reserved from fitting and tuning so it can provide less-biased evaluation evidence.",
          physicalExample:
            "The final test uses taped target cells and lamp directions sealed before model selection and absent from the capstone's training demonstrations.",
        },
        {
          term: "Factor",
          meaning:
            "One controlled source of test variation whose influence or interaction the evaluation is designed to observe.",
          physicalExample:
            "Lamp direction is a factor with left, overhead, and right levels while object position and distractor count are separately recorded.",
        },
        {
          term: "Distractor",
          meaning:
            "A non-target item or signal that can compete with, resemble, occlude, or redirect the system's perception and action.",
          physicalExample:
            "A second blue block sits near the target cup but should never be grasped or counted as task success.",
        },
        {
          term: "Evaluation leakage",
          meaning:
            "Information from reserved evaluation outcomes influencing model, threshold, prompt, scene, or selection decisions before the final claim.",
          physicalExample:
            "After previewing dark-scene failures, an engineer adjusts camera exposure and reports the same scenes as untouched held-out results.",
        },
        {
          term: "Scenario seed",
          meaning:
            "A recorded input to pseudorandom scene generation that allows the exact sampled condition to be reconstructed when all other assets and code match.",
          physicalExample:
            "Seed 481 reproduces the same block cell, lamp intensity, distractor pose, and simulated sensor noise under generator version G3.",
        },
      ],
      physicalExamples: [
        {
          title: "Blue block under a side lamp",
          scenario:
            "A gripper trained mostly with centered blocks under overhead light sees the same object near a workspace edge, with a strong side shadow and a blue tape roll nearby.",
          lookFor:
            "Record position, light, shadow, distractor identity, perception result, grasp pose, contact, and final placement so “failed in a harder scene” becomes diagnosable.",
        },
        {
          title: "Reading a sign beside a similar poster",
          scenario:
            "A child can read a familiar classroom sign until a glossy poster with the same colors reflects sunlight beside it.",
          lookFor:
            "Target content stayed constant while glare and visual similarity interacted; varying and naming those factors explains more than simply calling the room unseen.",
        },
      ],
      workedExample: {
        title: "Freeze a 24-condition held-out scene matrix",
        setup:
          "The capstone picks one known object instance from a tabletop. Evaluation varies four reserved position cells, three light directions, and presence or absence of one visually similar distractor.",
        steps: [
          "Define the factors before running: position `{P1,P2,P3,P4}`, light `{left,overhead,right}`, and distractor `{absent,present}`, giving `4 × 3 × 2 = 24` labeled combinations.",
          "Specify valid physical ranges, fixture marks, lamp placement, camera settings, object and distractor identities, start pose, timeout, reset method, exclusion rule, and independent placement oracle.",
          "Verify from the dataset ledger that reserved position-light combinations were not used for fitting or threshold tuning; disclose any uncertain exposure from generic pretraining.",
          "Generate a signed scenario file for all 24 combinations with fixed order or recorded randomization, unique trial identities, asset hashes, and no option to silently reroll.",
          "Execute in simulation first and then only at the authorized evidence level, recording perception, action, terminal physical result, latency, recovery, and artifact completeness for every condition.",
          "Report results by each factor and interaction, move any condition used for repair into the development set, and create a new untouched holdout for the next final evaluation.",
        ],
        result:
          "The matrix supplies 24 reproducible, interpretable challenges while keeping prior exposure, invalid-run rules, and evidence level visible.",
        takeaway:
          "Unseen testing becomes credible when novelty, range, combination, oracle, and leakage boundary are written before the outcomes appear.",
      },
      handsOn: {
        setup:
          "Use the capstone simulator or an approved static tabletop setup with harmless objects and no unreviewed motion. Keep the final 50-trial suite sealed for Day 174.",
        steps: [
          "Inventory training and tuning coverage for object cells, yaw, instances, lighting, background, distractors, start poses, and camera settings; mark unknown exposure honestly.",
          "Reserve at least three factors with named levels inside the intended operating envelope, and place their scenario definitions where model-development code cannot rewrite them casually.",
          "Write success, timeout, forbidden-action, reset, invalid-trial, and artifact-completeness rules before observing evaluation output.",
          "Run a small deterministic matrix with immutable scenario identities, then replay one seed to verify the scene and initial state truly reconstruct.",
          "Produce per-factor and interaction counts alongside overall results, and classify each failure at the earliest evidenced boundary without guessing a root cause.",
          "Choose one failure for future repair, copy it into a development regression set, and explicitly retire it from untouched held-out status.",
        ],
        observe:
          "A single overall score hides edge-position and side-light interactions, while the exposure ledger often reveals that several supposedly unseen scenes influenced earlier tuning.",
        doneWhen:
          "Every run can be reconstructed, no failed scene was rerolled, the report states what was genuinely held out, and tuned-on failures are no longer presented as untouched evidence.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Design held-out robot-policy evaluations across workspace, illumination, clutter, object, and start-state factors, protect the leakage boundary, preserve deterministic regressions, and turn physical failures into correctly scoped data work.",
        interviewPrompt:
          "Your policy scores well on familiar scenes but fails near table edges under side light. Design a held-out matrix, leakage controls, oracle, factor report, and rule for converting failures into training data.",
      },
      commonMistakes: [
        {
          mistake: "Calling any newly recorded scene unseen after inspecting and tuning against its failures.",
          correction:
            "Track exposure and decision use; once a scene guides model, threshold, prompt, or configuration changes, move it to development and reserve new untouched evidence.",
        },
        {
          mistake: "Changing many factors randomly and reporting only one overall success percentage.",
          correction:
            "Record every factor and seed, include controlled sweeps or designed interactions, and publish stratified counts so a failure pattern remains visible.",
        },
        {
          mistake: "Deleting a failed run because the placement looked unreasonable afterward.",
          correction:
            "Apply only the predeclared validity rule, preserve the trial and exclusion reason, and revise the next protocol rather than editing the current denominator.",
        },
      ],
      checkQuestions: [
        {
          question: "When does a held-out scene stop being held out?",
          answer:
            "When its inputs or outcome influence model, data, threshold, prompt, configuration, or selection decisions for the claimed final evaluation.",
        },
        {
          question: "Why record both a seed and generator version?",
          answer:
            "The same seed can produce a different scene when generator logic or assets change, so both identities are needed for reconstruction.",
        },
        {
          question: "Why report factor interactions instead of only individual factors?",
          answer:
            "The policy may tolerate edge position and side light separately but fail when their effects occur together, which marginal totals can hide.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The frozen factor-by-level matrix and stratified result table are the exact visual tools needed; a generic scene illustration would add decoration rather than evidence.",
      },
    },
    {
      dayId: 174,
      mentalModel:
        "A frozen 50-trial suite is a sealed box of numbered challenge cards: rules, order, thresholds, resets, and failure gates cannot change after the first card is opened.",
      explanation: [
        "Freeze the protocol before execution: intended task and environment, build and configuration identities, 50 scenario identities, order or randomization rule, operator actions, initial state, reset, timeout, success oracle, failure categories, invalid-trial rule, artifacts, and acceptance thresholds. The number 50 comes from this capstone gate, not a universal law of reliability. It provides a bounded comparison for this declared suite; it does not prove every future hour, object, operator, or environment will behave the same.",
        "Define one atomic trial from verified ready state to independently measured terminal state. Record every attempt, including setup errors and infrastructure failures, under a predeclared classification. Do not pause the denominator, rerun a miss, adjust a pose, or switch models after seeing performance. If a required camera, log, or oracle is missing, the trial may be invalid under the frozen rule, but the missing evidence still remains visible and may block acceptance if the allowed invalid count is exceeded.",
        "Use compound acceptance, not one average. A hypothetical plan might require at least `47/50` task successes, zero forbidden-object grasps, zero unplanned contacts, zero stale-command violations, all cancellation deadlines met, and complete evidence for at least 49 trials. The exact thresholds must come from the project's requirements and risk review. One high-consequence violation cannot be washed away by 49 easy successes, and rounding `46/50 = 92%` to a preferred target is dishonest.",
        "Summarize counts by frozen factor, failure mode, time, and recovery, then preserve uncertainty. Fifty observations estimate performance only under sampled conditions; dependent trials, changing temperature, object wear, and operator resets can reduce effective independence. Acceptance is a decision against a protocol, not proof of a universal probability. If the suite fails, retain it, issue a disposition, repair outside the frozen run, and execute a new versioned suite rather than splicing replacement trials into history.",
      ],
      keyTerms: [
        {
          term: "Frozen protocol",
          meaning:
            "A versioned test definition whose scenarios, rules, thresholds, and evidence requirements are locked before outcomes are revealed.",
          physicalExample:
            "A signed manifest lists trials T001–T050, their fixture marks, order, reset, timeout, oracle, artifacts, and decision gates before T001 begins.",
        },
        {
          term: "Atomic trial",
          meaning:
            "One indivisible attempt from declared initial state through terminal outcome, counted without replacing an inconvenient middle segment.",
          physicalExample:
            "The arm starts at home, receives one pick request, either places the block by 20 seconds or records a failure, then follows the fixed reset.",
        },
        {
          term: "Critical gate",
          meaning:
            "A zero-tolerance or separately bounded condition whose violation determines rejection regardless of aggregate success count.",
          physicalExample:
            "Grasping the red forbidden object once rejects the run even when all other 49 target placements succeed.",
        },
        {
          term: "Denominator",
          meaning:
            "The full set of attempts governed by the counting rule, including declared treatment of invalid, aborted, or infrastructure-affected trials.",
          physicalExample:
            "Removing two timeouts makes 46 successes look like `46/48`, while the frozen report correctly retains all 50 scheduled attempts and their statuses.",
        },
        {
          term: "Acceptance disposition",
          meaning:
            "The explicit `accept`, `conditional`, or `reject` decision tied to frozen gates, deviations, evidence, owner, and scope.",
          physicalExample:
            "A 46-success result against a 47-success gate is `reject`, with four preserved trial IDs and a new-suite requirement after repair.",
        },
      ],
      physicalExamples: [
        {
          title: "Fifty basketball free throws",
          scenario:
            "A player takes 50 shots from taped spots with the same ball, counted in a sealed order; moving closer after misses or ignoring a camera outage changes the test.",
          lookFor:
            "Fixed position, order, counting, and independent observation make the result comparable, but it still says little about a different ball, court, fatigue pattern, or defender.",
        },
        {
          title: "Forbidden red block among targets",
          scenario:
            "A tabletop suite contains blue targets and a red distractor. The robot completes 49 placements but grasps the red object once.",
          lookFor:
            "If wrong-object grasp is a frozen critical gate, the correct disposition is reject; `98% success` cannot neutralize the specific unacceptable behavior.",
        },
      ],
      workedExample: {
        title: "Adjudicate a hypothetical 50-trial capstone run",
        setup:
          "Protocol `ACC-25-v1` requires at least 47 successful placements, zero forbidden grasps, zero unplanned contacts, cancellation within its declared deadline, and at least 49 complete evidence bundles.",
        steps: [
          "Verify before T001 that source, image, model, resolved configuration, calibration, fixture, object set, scenario list, order, operator, clocks, oracle, safety authorization, and output storage match the signed protocol.",
          "Execute T001–T050 exactly once each, record start and terminal states plus artifacts immediately, and use only the frozen invalid-trial and abort rules.",
          "Count a hypothetical result of 46 successes, two grasp slips, one timeout, and one wrong-placement failure; all 50 have evidence, no forbidden grasp or unplanned contact occurs, and cancellation deadlines pass.",
          "Calculate task success as `46 / 50 = 0.92 = 92%`; keep failure identities and factor strata visible instead of rounding, excluding, or replacing the four unsuccessful trials.",
          "Compare every gate: evidence, forbidden action, contact, and cancellation pass, but `46 < 47`, so the compound protocol fails even though several critical gates stayed clean.",
          "Issue `REJECT for ACC-25-v1`, preserve the complete run, open hypotheses for the four failures, and require a separately versioned post-fix suite rather than adding one replacement success.",
        ],
        result:
          "The hypothetical run is rejected at 92% because it misses its frozen 47-success threshold; its clean critical gates remain useful evidence but do not rewrite the decision.",
        takeaway:
          "Acceptance is mechanical only after thoughtful rules are frozen: count every governed attempt, evaluate each gate, and resist negotiating with visible results.",
      },
      handsOn: {
        setup:
          "Use the frozen capstone suite in simulation, HIL, or an approved controlled-hardware area. If only SIL is available, run all 50 there and label the result SIL-only without extending the claim.",
        steps: [
          "Seal a machine-readable manifest for exactly 50 uniquely identified scenarios, their order, build, model, configuration, environment, resets, timeouts, oracle, artifacts, gates, and abort rules.",
          "Run a preflight that checks authorized evidence level, fixture, devices, calibration, clocks, storage, operator, safeguards, and no-motion recovery before starting T001.",
          "Execute T001 through T050 sequentially without model or threshold changes, hidden retries, deleted failures, or ad hoc scene adjustments; preserve each terminal record immediately.",
          "Stop only under the frozen abort rule, keep all completed and aborted records, and never resume after a configuration change under the same suite identity.",
          "Calculate exact counts and rates for task result, factor strata, failure categories, deadlines, forbidden behaviors, contacts, recoveries, invalid trials, and artifact completeness.",
          "Apply each gate independently, write the acceptance disposition and scope, and have a second reviewer reconcile the manifest, 50 identities, artifact checksums, counts, and decision.",
          "If rejected, move failures into a separate development queue, retain the sealed run untouched, and prepare a new protocol version only after corrective work and review.",
        ],
        observe:
          "Execution discipline reveals tempting shortcuts: retrying a near miss, improving lighting mid-run, omitting an awkward failure, or calling a SIL result hardware acceptance.",
        doneWhen:
          "Exactly 50 governed trial records reconcile with the frozen manifest, every gate has a decidable result, failures remain present, and the acceptance claim names its precise evidence level and conditions.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_INTEGRATION],
        workExample:
          "Own a customer-facing robot acceptance campaign, lock configurations and scenario strata, run sequential trials under approved controls, reconcile independent physical evidence, enforce critical gates, and defend a reject decision against metric shopping.",
        interviewPrompt:
          "Your capstone gets 46 successes in 50 against a frozen 47-success gate with no safety-critical event. Decide the result, explain the denominator and evidence scope, and describe the valid post-fix process.",
      },
      commonMistakes: [
        {
          mistake: "Rerunning failed trials and keeping only the best attempt.",
          correction:
            "Count the original governed attempt, preserve its evidence, and place any diagnostic or post-fix rerun in a separately labeled dataset or suite.",
        },
        {
          mistake: "Changing an acceptance threshold because the observed result was close.",
          correction:
            "Apply the frozen gate, record rejection or deviation through the authorized process, and revise only a future protocol without rewriting this run.",
        },
        {
          mistake: "Presenting 50 successes as proof of universal reliability.",
          correction:
            "Limit the claim to the sampled conditions, identities, resets, time window, dependence structure, oracle, and evidence level; publish unsampled risks and uncertainty.",
        },
      ],
      checkQuestions: [
        {
          question: "Can one failed trial be replaced when the reset looked imperfect?",
          answer:
            "Only if the frozen invalid-trial rule clearly applies; preserve the original record and any replacement identity, and follow the predeclared denominator rule.",
        },
        {
          question: "Why can 49 ordinary successes not cancel one critical-gate failure?",
          answer:
            "The critical behavior has an independent acceptance limit based on its consequence, so aggregate task success is the wrong decision rule.",
        },
        {
          question: "What should happen after a rejected suite leads to a code fix?",
          answer:
            "Keep the rejected suite unchanged, add the case to development regression, and execute a new versioned acceptance suite under newly frozen identities.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The numbered 50-row manifest, factor summary, and independent gate table already form the exact decision visual; a generic chart could hide failed identities.",
      },
    },
    {
      dayId: 175,
      mentalModel:
        "An honest capstone handoff resembles a museum evidence case: continuous footage, labeled artifacts, untouched failures, and a short claim card stating exactly what visitors may conclude.",
      explanation: [
        "An uncut demo is one continuous recording from declared preflight through task and terminal state, without removing waits, recoveries, or failures. Start by showing the build, model, configuration, scenario, clock, test area, and evidence identity in a readable way; then keep the robot, operator actions, and decisive external outcome observable. A continuous video reduces selective editing, but it does not prove what happened outside the camera, authenticate files by itself, or replace logs, independent measurements, and the full trial table.",
        "Publish an artifact manifest beside the video. Include source revision, image and model digests, configuration and calibration hashes, hardware and environment identities, commands, 50-trial protocol and results, logs, metrics, traces, incident bundles, checksums, creation times, tools needed to read them, access limits, and retention. Redact credentials and personal or proprietary data through an approved copy while preserving protected originals. A future reviewer should be able to distinguish missing, withheld, corrupted, and not-applicable artifacts.",
        "Write failure analysis in layers. Facts are directly observed records; derived measurements show their method and uncertainty; hypotheses explain facts but remain testable; experiments support or weaken each hypothesis; corrective actions change a named mechanism; regression evidence tests recurrence. Avoid a single convenient “root cause” when credible alternatives remain. Also report failures that were not repaired, changes that could not be retested, and whether a fix invalidated the frozen acceptance suite.",
        "Close with scoped claims and a next decision. State which ladder levels ran, which 50-trial gates passed or failed, which conditions were held out, what recovery was demonstrated, and what was never verified. Link practical work to an interview narrative: requirement, risk, design choice, failure, evidence, correction, and remaining limit. A weak result presented completely can be stronger hiring evidence than a polished success whose build, retries, and omitted failures cannot be inspected.",
      ],
      keyTerms: [
        {
          term: "Uncut demonstration",
          meaning:
            "A continuous recording of the declared run whose waits, interventions, retries, recovery, and terminal outcome are not removed by editing.",
          physicalExample:
            "The video shows preflight, mission M310, a 12-second perception wait, one failed grasp, recovery, and final rejected outcome in one timeline.",
        },
        {
          term: "Artifact manifest",
          meaning:
            "A machine- and human-readable inventory that names each evidence file, identity, purpose, checksum, format, access condition, and relationship to a claim.",
          physicalExample:
            "Row T038 links video time 06:42, mission events, trace, camera recording, result JSON, build digest, and SHA-256 checksum.",
        },
        {
          term: "Provenance",
          meaning:
            "The recorded origin and transformation history that explains who or what produced an artifact from which identified inputs.",
          physicalExample:
            "The latency table names the trace file, analysis script revision, clock, filters, units, author, and generated output checksum.",
        },
        {
          term: "Hypothesis",
          meaning:
            "A falsifiable proposed explanation for observed facts, explicitly weaker than a confirmed causal conclusion.",
          physicalExample:
            "Side-light glare may have shifted the pose estimate; replay and a controlled lamp sweep are proposed to challenge that explanation.",
        },
        {
          term: "Corrective-action regression",
          meaning:
            "A permanent test that recreates the confirmed failure mechanism and demonstrates the fix without breaking relevant nominal behavior.",
          physicalExample:
            "The recorded cancellation ordering enters SIL regression, while HIL reruns target scheduling and the original failed acceptance suite remains unchanged.",
        },
      ],
      physicalExamples: [
        {
          title: "Science-fair robot that misses once",
          scenario:
            "A one-take video shows nine correct sorts and one dropped foam block, followed by the student pointing to the exact run record instead of restarting the camera.",
          lookFor:
            "Continuity makes the miss visible; the manifest, independent count, configuration, and failure analysis make the footage useful evidence rather than embarrassment.",
        },
        {
          title: "Sealed flight-recorder handoff",
          scenario:
            "Investigators receive original recorder data, a verified working copy, timeline, instrument definitions, custody record, and a list of unavailable measurements.",
          lookFor:
            "Preserving originals, transformations, access, and missing channels lets later reviewers challenge conclusions without overwriting the event.",
        },
      ],
      workedExample: {
        title: "Publish a failed acceptance gate without hiding the repair",
        setup:
          "The frozen `ACC-25-v1` suite contains a failure at T038 under right-side light. A later development replay suggests glare causes a pose shift, and a camera-exposure correction improves that case.",
        steps: [
          "Keep the original 50-trial result and T038 artifacts immutable; assign checksums, access controls, and manifest links instead of replacing T038 with the successful development rerun.",
          "Build a fact timeline from video, source images, pose estimates, action trace, joint state, external placement oracle, and operator record, including clock uncertainty and any missing contact measurement.",
          "Write the glare explanation as hypothesis H1, list alternatives such as calibration drift and object movement, and define controlled experiments that change one factor while preserving other identified inputs.",
          "Record the exposure correction as a new configuration identity, run T038 as development regression plus relevant nominal cases, and state that this evidence is post-acceptance rather than part of `ACC-25-v1`.",
          "Record one continuous demonstration of the current build with visible preflight and terminal oracle, then link its mission identity and timestamps to logs and result files without calling that single run a 50-trial pass.",
          "Publish a claim card: `ACC-25-v1 rejected; right-light failure reproduced in development; candidate correction passed named regression; new frozen acceptance suite not yet run`, followed by remaining unknowns.",
        ],
        result:
          "Reviewers see the rejected original evidence, the strength and limits of the glare hypothesis, the separate corrective regression, and the exact missing re-acceptance step.",
        takeaway:
          "Honesty is an engineering feature: keep the event, label later work, and make the strongest claim that all artifacts support—never the claim a polished story needs.",
      },
      handsOn: {
        setup:
          "Use the week's existing artifacts and a safe simulated or already authorized recorded run. Do not stage new hazardous motion merely to make the video look dramatic.",
        steps: [
          "Record one continuous 60–120 second run showing evidence identity, preflight, command, robot or simulator behavior, operator interventions, independent terminal outcome, and final status.",
          "Create a manifest for source, deployment, scenario, trial results, video, logs, metrics, traces, replay, analysis, and checksums; mark unavailable and restricted artifacts explicitly.",
          "Reconcile every spoken or written claim with at least one artifact and add the tested build, environment, evidence level, sample count, threshold, and known limitation.",
          "Choose the largest remaining failure and build a table of facts, derived measurements, hypotheses, disconfirming evidence, experiments, corrective actions, regressions, and unresolved alternatives.",
          "Verify that originals are read-only, shared copies contain no credentials or prohibited data, transformations have provenance, and links can be opened using the documented tools.",
          "Ask a reviewer to find one failure from the summary, reconstruct its timeline, recalculate one count, and explain what remains unverified; fix the package wherever that path breaks.",
        ],
        observe:
          "The review catches claims supported only by narration, videos with hidden setup, overwritten failures, broken artifact links, untracked analysis transformations, and corrections incorrectly presented as original acceptance.",
        doneWhen:
          "The uncut run and manifest are mutually traceable, the 50-trial decision reconciles, the largest failure remains inspectable, and the final claim card contains no stronger statement than the evidence allows.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_HMI, ROLE_FLEET],
        workExample:
          "Deliver a production-readiness evidence pack to engineering, operations, customers, and incident reviewers; make operator-visible outcomes auditable, defend bounded claims, preserve failed acceptance, and show corrective regression without rewriting history.",
        interviewPrompt:
          "Present a robot project whose frozen acceptance run failed one gate. Walk through the uncut evidence, artifact provenance, fact-versus-hypothesis analysis, correction, regression, and precise claim you would make today.",
      },
      commonMistakes: [
        {
          mistake: "Editing pauses and failed attempts out of a video labeled uncut.",
          correction:
            "Keep one continuous timeline, show interventions and terminal status, and publish shorter edited highlights only as separately labeled navigation aids.",
        },
        {
          mistake: "Replacing original acceptance artifacts after a fix succeeds.",
          correction:
            "Preserve the rejected run, version the corrective configuration and regression separately, and require a new frozen suite for any new acceptance claim.",
        },
        {
          mistake: "Writing a confident root cause from one correlation.",
          correction:
            "Separate observations, measurements, hypotheses, alternatives, experiments, and causal conclusions; state inconclusive when evidence cannot distinguish credible mechanisms.",
        },
      ],
      checkQuestions: [
        {
          question: "What does an uncut demo add, and what does it not replace?",
          answer:
            "It exposes continuity, waits, interventions, and outcome, but it does not replace artifact authentication, full trial counts, independent measurements, or off-camera state evidence.",
        },
        {
          question: "How should a successful post-fix replay appear in the acceptance report?",
          answer:
            "As separately versioned corrective or development evidence; the original failed run stays intact, and re-acceptance requires a new frozen protocol execution.",
        },
        {
          question: "When may the report say root cause confirmed?",
          answer:
            "When evidence demonstrates the causal mechanism, the targeted change removes it, relevant regression passes, and credible alternatives are excluded or bounded—not merely when events correlate.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The uncut timeline, artifact manifest, and fact-hypothesis table are already the evidence-native visuals; an extra generic illustration would compete with them.",
      },
    },
  ],
} satisfies ChapterContent;
