export type Phase = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  weeks: string;
  outcome: string;
  color: string;
};

export type Resource = {
  label: string;
  url: string;
};

export type CurriculumDay = {
  id: number;
  week: number;
  dayInWeek: number;
  phaseId: string;
  title: string;
  focus: string;
  task: string;
  evidence: string;
  lab: string;
  minutes: number;
  resource: Resource;
  checkpoint?: string;
};

export const phases: Phase[] = [
  {
    id: "foundations",
    number: "01",
    title: "Robot fundamentals",
    shortTitle: "Fundamentals",
    weeks: "Weeks 1–4",
    outcome: "Reason about robot motion, write production-grade C++, and control a simulated mechanism.",
    color: "#ff6b35",
  },
  {
    id: "ros",
    number: "02",
    title: "ROS 2 & simulation",
    shortTitle: "ROS 2",
    weeks: "Weeks 5–8",
    outcome: "Build, observe, debug, and ship a multi-node robot application in simulation.",
    color: "#3b63f3",
  },
  {
    id: "autonomy",
    number: "03",
    title: "Perception & autonomy",
    shortTitle: "Autonomy",
    weeks: "Weeks 9–12",
    outcome: "Turn camera and sensor data into estimates, plans, and safe robot actions.",
    color: "#007f70",
  },
  {
    id: "learning",
    number: "04",
    title: "Production robotics systems",
    shortTitle: "Production",
    weeks: "Weeks 13–17",
    outcome: "Train one practical policy, then build and validate the fleet, deployment, and operator systems that make robots usable.",
    color: "#9b4dca",
  },
  {
    id: "embodied",
    number: "05",
    title: "Embodied AI",
    shortTitle: "Embodied AI",
    weeks: "Weeks 18–21",
    outcome: "Build a language-to-action agent with memory, tools, guardrails, and measurable recovery.",
    color: "#d1487b",
  },
  {
    id: "ship",
    number: "06",
    title: "Real robot & career",
    shortTitle: "Ship",
    weeks: "Weeks 22–26",
    outcome: "Deploy a capstone, publish credible evidence, and become interview-ready for robotics software roles.",
    color: "#b86a00",
  },
];

type WeekPlan = {
  phaseId: string;
  title: string;
  focus: string;
  lab: string;
  topics: string[];
  resource: Resource;
  checkpoint?: string;
};

const modernRobotics: Resource = {
  label: "Modern Robotics — Northwestern",
  url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/",
};

const rosTutorials: Resource = {
  label: "Official ROS 2 tutorials",
  url: "https://github.com/ros2/ros2_documentation/tree/jazzy/source/Tutorials",
};

const ros2Control: Resource = {
  label: "Official ros2_control documentation",
  url: "https://control.ros.org/jazzy/index.html",
};

const gazebo: Resource = {
  label: "Gazebo Harmonic ROS 2 integration",
  url: "https://gazebosim.org/docs/harmonic/ros2_integration/",
};

const nav2: Resource = {
  label: "Official Nav2 documentation",
  url: "https://docs.nav2.org/",
};

const moveIt: Resource = {
  label: "Official MoveIt 2 tutorials",
  url: "https://moveit.picknik.ai/main/doc/tutorials/tutorials.html",
};

const rosSecurity: Resource = {
  label: "Official ROS 2 security tutorials",
  url: "https://docs.ros.org/en/jazzy/Tutorials/Advanced/Security/Introducing-ros2-security.html",
};

const rosTesting: Resource = {
  label: "Official ROS 2 launch_testing documentation",
  url: "https://docs.ros.org/en/jazzy/p/launch_testing/",
};

const openRmf: Resource = {
  label: "Open-RMF fleet-adapter integration",
  url: "https://osrf.github.io/ros2multirobotbook/integration_fleets_adapter_tutorial.html",
};

const vda5050: Resource = {
  label: "Official VDA 5050 specification",
  url: "https://github.com/VDA5050/VDA5050",
};

const tensorRt: Resource = {
  label: "NVIDIA TensorRT documentation",
  url: "https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html",
};

const underactuated: Resource = {
  label: "MIT Underactuated Robotics",
  url: "https://underactuated.csail.mit.edu/",
};

const lerobot: Resource = {
  label: "Hugging Face LeRobot",
  url: "https://huggingface.co/docs/lerobot/index",
};

const isaacLab: Resource = {
  label: "NVIDIA Isaac Lab",
  url: "https://isaac-sim.github.io/IsaacLab/main/index.html",
};

const openVla: Resource = {
  label: "OpenVLA project",
  url: "https://openvla.github.io/",
};

const geminiRobotics: Resource = {
  label: "Google DeepMind Gemini Robotics",
  url: "https://deepmind.google/models/gemini-robotics/",
};

const weekPlans: WeekPlan[] = [
  {
    phaseId: "foundations",
    title: "Meet the robot, then meet the maths",
    focus: "Start with a physical robot and build every maths idea from counting, measuring, arrows, and grids.",
    lab: "Build a paper two-link robot and a browser notebook that shows its parts, allowed motion, coordinates, vectors, frames, and matrices.",
    topics: [
      "Robot anatomy: sense, think, act, links, and actuators",
      "Joints, allowed motion, and degrees of freedom",
      "Configuration, C-space, workspace, limits, and topology",
      "Number lines, coordinates, scalars, variables, and physical units",
      "Vectors from arrows: components, add, subtract, norm, and dot product",
      "Coordinate frames, axes, origins, and handedness",
      "Matrices from grids: inputs, outputs, and simple actions",
    ],
    resource: modernRobotics,
  },
  {
    phaseId: "foundations",
    title: "Turn the maths into robot motion",
    focus: "Use angles, transforms, and kinematics to predict where a robot part will move.",
    lab: "Extend the browser notebook into a two-link arm visualizer with frame composition, forward kinematics, and a bounded numerical IK trace.",
    topics: [
      "2D rotation, translation, transforms, degrees, radians, sine, and cosine",
      "Compose and invert transforms through a frame tree",
      "SO(3): safe 3D rotation matrices",
      "Euler angles, quaternions, and representation singularities",
      "SE(3): one 3D pose matrix",
      "Forward kinematics for a serial arm",
      "Jacobian intuition and bounded numerical inverse kinematics",
    ],
    resource: modernRobotics,
  },
  {
    phaseId: "foundations",
    title: "Dynamics and feedback",
    focus: "Why robots overshoot, oscillate, saturate, and fall over.",
    lab: "Control a simulated pendulum or cart-pole; log setpoint, error, command, saturation, and settling time.",
    topics: [
      "Position, velocity, acceleration, force, and torque",
      "Mass, inertia, friction, and actuator limits",
      "Open-loop versus closed-loop control",
      "Implement and tune a PID controller",
      "Sampling rate, latency, noise, and stability",
      "Saturation, anti-windup, and safe command limits",
      "Controller tuning report with plots and metrics",
    ],
    resource: underactuated,
  },
  {
    phaseId: "foundations",
    title: "Modern C++, Linux, and real-time habits",
    focus: "Deterministic, observable software at the hardware boundary.",
    lab: "Create a Linux C++ sensor→filter→controller pipeline with device permissions, bounded timing, tests, CI, structured logs, and deterministic replay.",
    topics: [
      "RAII, ownership, references, and smart pointers",
      "Value types, interfaces, and dependency boundaries",
      "CMake targets, libraries, and reproducible builds",
      "Linux processes, device permissions, udev, and robot networking",
      "Threads, real-time scheduling, jitter, and priority inversion",
      "Sanitizers, profiling, deterministic replay, and CI",
      "Ship the deterministic control-pipeline repository",
    ],
    resource: {
      label: "C++ Core Guidelines",
      url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines",
    },
    checkpoint: "Gate 1 · Explain transforms and PID without notes; ship a tested C++ control loop.",
  },
  {
    phaseId: "ros",
    title: "ROS 2 graph, runtime, and communication",
    focus: "Treat ROS as a concurrent distributed production system.",
    lab: "Build a Python/C++ telemetry, command, and watchdog system; then reproduce QoS, discovery, executor, lifecycle, and cancellation failures.",
    topics: [
      "ROS 2 distributions: Jazzy baseline, Lyrical LTS, workspaces, packages, and graph",
      "Topics, message design, publishers, and subscribers",
      "Services versus actions and cancellation semantics",
      "QoS profiles and DDS discovery across networks",
      "Executors, callback groups, concurrency, and deadlocks",
      "Lifecycle nodes, composition, namespaces, launch, and introspection",
      "Multi-node watchdog demo and architecture note",
    ],
    resource: rosTutorials,
  },
  {
    phaseId: "ros",
    title: "Robot models, transforms, and ros2_control",
    focus: "Make every pose and hardware command interface explicit and inspectable.",
    lab: "Model a mobile manipulator in URDF/Xacro/SRDF, wire it to ros2_control, and verify frames, controllers, state, and lifecycle in RViz.",
    topics: [
      "URDF links, joints, inertial, visual, and collision models",
      "Xacro, SRDF, and reusable robot descriptions",
      "Static and dynamic transforms with tf2",
      "Timestamped data and transform lookup failures",
      "ros2_control architecture, hardware interfaces, and lifecycle",
      "Controller manager, trajectory/diff-drive controllers, and joint states",
      "Transform audit: detect and repair three planted faults",
    ],
    resource: ros2Control,
  },
  {
    phaseId: "ros",
    title: "Gazebo Harmonic and sensor plumbing",
    focus: "Build repeatable worlds before touching costly hardware.",
    lab: "Simulate a ros2_control differential-drive robot in Gazebo Harmonic with lidar, RGB-D camera, IMU, noise, bridges, and MCAP replay.",
    topics: [
      "Gazebo Harmonic physics, simulation time, and real-time factor",
      "ros_gz bridge, spawning, differential-drive kinematics, wheel odometry, and gz_ros2_control",
      "Lidar scans, camera topics, IMU, and encoders",
      "Sensor noise, update rate, and timestamp alignment",
      "rosbag2/MCAP recording, playback, and deterministic replay",
      "Health checks and degraded-sensor behavior",
      "Reproducible simulation scenario and fault-injection demo",
    ],
    resource: gazebo,
  },
  {
    phaseId: "ros",
    title: "Mandatory Nav2 and SLAM",
    focus: "Build the complete map→localize→plan→control→recover loop.",
    lab: "Map a Gazebo world, localize with AMCL, navigate with Nav2, and survive cancellation, obstruction, stale localization, and recovery.",
    topics: [
      "map→odom→base frames, occupancy grids, SLAM, and AMCL",
      "Layered costmaps, robot footprint, inflation, and keepout zones",
      "Nav2 planners, controllers, smoothers, and goal execution",
      "Nav2 behavior trees, recovery, and lifecycle management",
      "Cancellation, obstruction, collision monitoring, and replanning",
      "Navigation metrics: success, path, time, localization error, and recovery",
      "Mandatory resilient Nav2/SLAM phase demo",
    ],
    resource: nav2,
    checkpoint: "Gate 2 · Ship a ROS 2 simulated task with bags, logs, metrics, and recovery—not only a success video.",
  },
  {
    phaseId: "autonomy",
    title: "Practical robot vision",
    focus: "Convert pixels into debuggable observations.",
    lab: "Detect, track, and estimate the pose of tabletop objects with an annotated evaluation set.",
    topics: [
      "Image formation, pixels, color spaces, and noise",
      "OpenCV filtering, edges, contours, and morphology",
      "Camera intrinsics, distortion, and calibration",
      "Fiducial markers as a reliable engineering baseline",
      "Object detection and confidence thresholds",
      "Tracking, occlusion, false positives, and data labeling",
      "Vision evaluation: precision, recall, latency, and examples",
    ],
    resource: {
      label: "OpenCV tutorials",
      url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html",
    },
  },
  {
    phaseId: "autonomy",
    title: "Depth and 3D perception",
    focus: "Move from bounding boxes to actionable geometry.",
    lab: "Transform an RGB-D observation into a filtered point cloud and safe grasp or approach target.",
    topics: [
      "Depth cameras, stereo, structured light, and failure modes",
      "Point clouds, voxel filters, and coordinate transforms",
      "Plane segmentation, ICP registration, and tabletop extraction",
      "3D bounding boxes, 6D pose, and grasp approach frames",
      "Sensor extrinsic calibration",
      "Occlusion, reflective surfaces, and missing depth",
      "3D target pipeline with visual overlays and bad cases",
    ],
    resource: {
      label: "Open3D documentation",
      url: "https://www.open3d.org/docs/release/",
    },
  },
  {
    phaseId: "autonomy",
    title: "State estimation, SLAM, and localization",
    focus: "Know what the robot believes, how its map changes, and why.",
    lab: "Fuse odometry and IMU, build an occupancy map, close a loop, localize with AMCL, visualize uncertainty, and recover from sensor dropout.",
    topics: [
      "State, observation, process model, and uncertainty",
      "Probability distributions and covariance intuition",
      "Bayes filters and the predict/update cycle",
      "Kalman/EKF intuition and odometry-IMU fusion",
      "Scan matching, occupancy mapping, and localization drift",
      "Pose graphs, loop closure, AMCL, and map→odom correction",
      "SLAM/localization report with uncertainty and dropout recovery",
    ],
    resource: nav2,
  },
  {
    phaseId: "autonomy",
    title: "Mandatory MoveIt 2 manipulation",
    focus: "Build the complete perceive→scene→plan→execute→contact loop.",
    lab: "Use MoveIt 2 to plan around collision objects, servo toward a target, execute a Task Constructor pick-and-place, and stop safely on contact or invalid state.",
    topics: [
      "Configuration-space obstacles and MoveIt collision checking",
      "SRDF, planning groups, IK, and planning scenes",
      "Sampling-based motion planning with RRT/OMPL intuition",
      "Trajectory generation, time parameterization, and execution",
      "MoveIt Servo and Task Constructor pick-and-place",
      "Grasp/contact basics, force-torque sensing, and impedance/admittance",
      "Mandatory MoveIt manipulation acceptance test",
    ],
    resource: moveIt,
    checkpoint: "Gate 3 · Demonstrate perception-driven autonomy over 20 trials and publish failure categories.",
  },
  {
    phaseId: "learning",
    title: "PyTorch through robot data",
    focus: "Learn deep learning by predicting robot-relevant outputs.",
    lab: "Train a small image-to-pose or observation-to-action network with a reproducible experiment report.",
    topics: [
      "Tensors, shapes, devices, autograd, and numerical checks",
      "Datasets, dataloaders, transforms, and train/validation splits",
      "MLPs and convolutional visual encoders",
      "Loss functions, optimizers, schedules, and checkpoints",
      "Overfitting, leakage, augmentation, and baselines",
      "Experiment tracking, seeds, and reproducibility",
      "Model card with metrics, errors, and inference latency",
    ],
    resource: {
      label: "PyTorch tutorials",
      url: "https://pytorch.org/tutorials/",
    },
  },
  {
    phaseId: "learning",
    title: "Demonstrations and datasets",
    focus: "Robot learning starts with disciplined data collection.",
    lab: "Create a small demonstration dataset with synchronized observations, actions, language, and quality labels.",
    topics: [
      "Policy, observation, action, episode, and trajectory",
      "Teleoperation and demonstration collection",
      "Action spaces: joint, Cartesian, velocity, and chunks",
      "Synchronized video, state, command, and timestamps",
      "Dataset schema, metadata, splits, and versioning",
      "Quality review, failed demonstrations, and distribution shift",
      "Publish a dataset card and visual episode inspector",
    ],
    resource: lerobot,
  },
  {
    phaseId: "learning",
    title: "Imitation learning",
    focus: "Turn demonstrations into a measurable policy.",
    lab: "Train behavior-cloning and ACT-style policies on the same task and compare rollout behavior.",
    topics: [
      "Behavior cloning and supervised policy learning",
      "Covariate shift, DAgger, and human-in-the-loop corrections",
      "Temporal context and action chunking",
      "ACT architecture and sequence prediction",
      "Offline validation versus rollout success",
      "Policy inference loop, latency, and safe fallback",
      "Compare two policies over a fixed evaluation suite",
    ],
    resource: lerobot,
  },
  {
    phaseId: "learning",
    title: "Production fleet and robot interfaces",
    focus: "Connect robots, operators, missions, and backend services without losing safety or observability.",
    lab: "Build a simulated two-robot FleetOps system with a mission API, WebSocket operator console, task allocation, fault injection, canary update, rollback, and acceptance report.",
    topics: [
      "Robot–edge–cloud architecture and failure boundaries",
      "Mission workflows, task allocation, traffic, deadlocks, docking, and battery",
      "REST, WebSocket, and DDS gateways: schemas, idempotency, and cancellation",
      "PostgreSQL, Redis, and Kafka event processing: ordering and backpressure",
      "Safe operator HMI and teleoperation with WebSocket, WebRTC, and 3D state",
      "Containers, versioned configuration, OTA canaries, and rollback",
      "Fleet acceptance with logs, metrics, traces, fault injection, and SLOs",
    ],
    resource: openRmf,
  },
  {
    phaseId: "learning",
    title: "Deployment and validation",
    focus: "Prove a robot system works across simulation, interfaces, hardware boundaries, and customer acceptance.",
    lab: "Create a risk-linked SIL→HIL acceptance ladder for FleetOps, automate regression scenarios, integrate one external fleet or PLC boundary, and publish FAT/SAT evidence plus an incident report.",
    topics: [
      "Requirements, risk, FMEA, traceability, and test planning",
      "pytest, gtest, launch_testing, and component-to-system regression",
      "Deterministic Gazebo or Isaac scenario matrices, seeds, and replay",
      "SIL, HIL, sensor emulators, time faults, and communication faults",
      "VDA 5050 v3, Open-RMF adapters, WMS/WES, and industrial boundaries",
      "AMR safety awareness: ISO 3691-4, ISO 13849, E-stop, STO, and zones",
      "FAT, SAT, customer commissioning, incident reporting, and FleetOps gate",
    ],
    resource: rosTesting,
    checkpoint: "Gate 4 · FleetOps passes its risk-linked SIL/HIL acceptance matrix, safe failure tests, rollback drill, and commissioning review.",
  },
  {
    phaseId: "embodied",
    title: "Vision-language-action foundations",
    focus: "Understand how language becomes grounded physical action.",
    lab: "Build a tiny language-conditioned policy interface over your existing simulator or dataset.",
    topics: [
      "VLM versus VLA versus embodied-reasoning model",
      "Vision encoders, language tokens, and action outputs",
      "Robot data pretraining and cross-embodiment learning",
      "Discrete, continuous, diffusion, and flow actions",
      "Language grounding and instruction diversity",
      "Generalization across objects, scenes, and embodiments",
      "Architecture review: trace pixels and words to commands",
    ],
    resource: geminiRobotics,
  },
  {
    phaseId: "embodied",
    title: "Current VLA ecosystem and adaptation",
    focus: "Compare current policy families and adapt one without pretending to train a foundation model.",
    lab: "Benchmark a supported LeRobot/OpenVLA policy, trace its processors and normalized actions, then design or run a LoRA adaptation with a frozen baseline.",
    topics: [
      "2026 practical VLA map: LeRobot 0.6, GR00T 1.7, Gemini Robotics ER 1.6, π0.5, OpenVLA, and SmolVLA",
      "Cross-embodiment data, language columns, and dataset mixing",
      "Checkpoint loading, processors, and deployment pipeline",
      "Parameter-efficient adaptation with LoRA and frozen baselines",
      "Observation/action normalization and safe action decoding",
      "Generalization tests across objects, scenes, prompts, and embodiments",
      "Adaptation report with compute, data, latency, and risk budget",
    ],
    resource: lerobot,
  },
  {
    phaseId: "embodied",
    title: "Agentic task execution",
    focus: "Combine reasoning with deterministic robot skills.",
    lab: "Build an agent that converts a natural-language goal into inspectable ROS 2 actions and recovers from one failure.",
    topics: [
      "Task decomposition and hierarchical planning",
      "Robot skills as typed tools with preconditions",
      "World state, episodic memory, and retrieval",
      "Ground planner outputs in perceived entities and re-observe before action",
      "Execute, monitor, re-observe, and replan long-horizon tasks",
      "Timeouts, idempotency, rollback, and human handoff",
      "Long-horizon task demo with complete execution trace",
    ],
    resource: geminiRobotics,
  },
  {
    phaseId: "embodied",
    title: "Safety and evaluation harnesses",
    focus: "A robot agent is only credible when failure is measurable and bounded.",
    lab: "Create a scenario runner that measures task success, intervention, recovery, latency, and unsafe attempts.",
    topics: [
      "Separate semantic planning from safety-critical control",
      "Action validation, workspace, force, and velocity limits",
      "Threat modeling, SROS2, prompt injection, and untrusted environmental text",
      "Hazard analysis, safety cases, scenario design, and acceptance criteria",
      "Success, partial success, intervention, and safety metrics",
      "Adversarial scenes and recovery testing",
      "Embodied-agent evaluation report over 30 scenarios",
    ],
    resource: rosSecurity,
    checkpoint: "Gate 5 · Show a planner→skill→controller system with guardrails, recovery, and 30-scenario evidence.",
  },
  {
    phaseId: "ship",
    title: "Real hardware bring-up",
    focus: "Treat the physical robot as an unreliable distributed system.",
    lab: "Bring up a LeRobot-supported arm or mobile robot with calibration, limits, teleoperation, and emergency stop.",
    topics: [
      "Choose hardware from task, support, and safety constraints",
      "Actuator sizing, motors, encoders, power, and physical limits",
      "MCU firmware and RTOS basics; CAN, EtherCAT, UART, I²C, SPI, Ethernet, device manifests, and clock synchronization",
      "Implement a ros2_control hardware plugin and lifecycle bring-up",
      "Calibrate joints, verify frames, and perform low-speed teleoperation",
      "Emergency stop, STO awareness, watchdog, and safe shutdown",
      "Hardware acceptance checklist and repeatable bring-up video",
    ],
    resource: ros2Control,
  },
  {
    phaseId: "ship",
    title: "Collect your real dataset",
    focus: "Make the capstone data better before making the model larger.",
    lab: "Collect, review, and version real demonstrations for one useful tabletop or mobile task.",
    topics: [
      "Define the capstone task and measurable success",
      "Design scene, object, lighting, and start-state variation",
      "Build a safe Flutter/Web teleoperation console with dead-man control, command limits, latency visibility, cancellation, and synchronized recording",
      "Collect a balanced first demonstration batch",
      "Review failures and repair dataset coverage",
      "Create train, validation, and held-out scene splits",
      "Freeze dataset v1 with card, examples, and quality metrics",
    ],
    resource: lerobot,
  },
  {
    phaseId: "ship",
    title: "Train and deploy the capstone policy",
    focus: "Close the data→training→optimized edge deployment→robot loop.",
    lab: "Fine-tune one policy, export and profile it on Jetson-class hardware or an equivalent constrained target, deploy behind a safe ROS 2 action, and evaluate held-out scenes.",
    topics: [
      "Select a baseline and write the experiment hypothesis",
      "Train the first policy and inspect learning curves",
      "Export to ONNX/TensorRT, quantize, and verify numerical drift",
      "Edge deployment on Jetson-class hardware: latency, thermals, and fallback",
      "Run held-out evaluation without tuning on failures",
      "Improve data or policy based on failure categories",
      "Freeze deployable model v1 with evaluation and latency report",
    ],
    resource: tensorRt,
  },
  {
    phaseId: "ship",
    title: "Production robotics operations",
    focus: "Turn a demo into a deployable, diagnosable, recoverable robot service.",
    lab: "Build a SIL→HIL→hardware CI ladder with containers, diagnostics, fleet telemetry, rollback, failure replay, and a frozen 50-trial acceptance suite.",
    topics: [
      "Build a SIL→HIL→hardware CI acceptance ladder",
      "Docker, provisioning, versioned configuration, and reproducible deployment",
      "Diagnostics, tracing, core dumps, and incident replay",
      "Fleet telemetry, mission APIs, secure OTA, and rollback",
      "Test unseen object positions, lighting, and distractors",
      "Run the frozen 50-trial acceptance suite",
      "Publish uncut demos plus honest failure analysis",
    ],
    resource: openVla,
    checkpoint: "Gate 6 · Capstone passes its frozen acceptance suite and exposes failures instead of hiding them.",
  },
  {
    phaseId: "ship",
    title: "Portfolio and job conversion",
    focus: "Translate ten years of software experience into robotics evidence.",
    lab: "Publish a robotics portfolio, role-targeted résumé, architecture case study, and a 30-day application sprint.",
    topics: [
      "Portfolio homepage and three evidence-backed project stories",
      "Capstone architecture, tradeoffs, and incident case study",
      "Résumé, target-company matrix, and role-matched evidence",
      "Interview drills, warm outreach, and open-source contribution",
      "Final readiness audit, program retrospective, specialization, and 30-day sprint",
    ],
    resource: {
      label: "Current Figure AI careers",
      url: "https://www.figure.ai/careers",
    },
  },
];

const activityModes = [
  (topic: string, lab: string, resource: Resource) =>
    `Prerequisite: open the last working project baseline for this weekly lab. Use ${resource.label} to isolate “${topic}”; write five operating rules, then implement one minimal executable example that proves the core behavior. Today’s lab target: ${lab}`,
  (topic: string, lab: string) =>
    `Implement “${topic}” as a small, replaceable part of the current weekly lab. Define its inputs, outputs, units, and failure result; run one nominal and one boundary case. Lab target: ${lab}`,
  (topic: string, lab: string) =>
    `Instrument “${topic}” inside the current weekly lab. Add assertions and one deliberately failing input, then record expected state, observed state, timing, and the exact causal fix. Lab target: ${lab}`,
  (topic: string, lab: string) =>
    `Integrate “${topic}” into the working weekly-lab path. Preserve the previous baseline, expose its state in logs or visualization, and verify both normal execution and safe cancellation. Lab target: ${lab}`,
  (topic: string, lab: string) =>
    `Apply “${topic}” to a realistic version of the weekly lab. Compare the baseline with today’s approach using one explicit measure such as success rate, pose error, latency, or recovery time. Lab target: ${lab}`,
  (topic: string, lab: string) =>
    `Run the weekly lab with “${topic}” enabled through a repeatable trial set. Capture the command or launch path, decisive trace or plot, a short uncut demo, and the largest remaining failure. Lab target: ${lab}`,
  (topic: string, lab: string) =>
    `Recreate “${topic}” from memory, rerun the complete weekly-lab workflow, repair the highest-impact failure from this week, and write the next concrete experiment. Lab target: ${lab}`,
];

const evidenceModes = [
  (topic: string) =>
    `DONE when the learning log explains “${topic}” in five precise points and a checked example produces the predicted output.`,
  (topic: string) =>
    `DONE when “${topic}” runs from one documented command and the nominal plus boundary outputs are attached.`,
  (topic: string) =>
    `DONE when a deterministic “${topic}” failure test reports expected versus actual behavior and passes after the documented fix.`,
  (topic: string) =>
    `DONE when the integrated “${topic}” path is observable, cancelable, and leaves the prior baseline reproducible.`,
  (topic: string) =>
    `DONE when a comparison table for “${topic}” contains the test condition, metric, result, and justified engineering decision.`,
  (topic: string) =>
    `DONE when a 60–120 second uncut “${topic}” demo links to its command, logs or plots, result count, and honest failure note.`,
  (topic: string) =>
    `DONE when the weekly ship note explains how “${topic}” changed the build, what still fails, and the first task for next week.`,
];

const minutesByDay = [90, 105, 90, 120, 105, 150, 60];

const zeroPrerequisiteFoundationTasks = [
  "Draw a sense→think→act loop for a toy rover. Label its sensor, controller, actuator, links, power source, information flow, and physical action; then add the same diagram to the browser notebook.",
  "Find one hinge, one drawer slide, and one fixed connection. Name their links, allowed and forbidden motion, and DOF; then build a safe two-link cardboard arm.",
  "Record six cardboard-arm shapes as ordered joint-angle lists. Trace the tip workspace, mark joint limits, find two shapes with one tip location, and sketch how a full-turn angle wraps around.",
  "Build a paper number line and x-y grid. Practise negative coordinates, variables, equality, centimetre-to-metre conversion, and predict five measured moves before checking them.",
  "Draw and calculate vector components, addition, subtraction, norm, and dot product on graph paper. Check each result by counting squares or measuring a scaled drawing.",
  "Attach one coordinate frame to a book and one to the table. Describe the same coin in both frames, verify right-handed axes, and document one deliberately reflected frame.",
  "Treat four 2×2 matrices as action cards: identity, scale, reflection, and quarter-turn. Calculate each output one row at a time, draw it, and explain the input/output meaning.",
  "Convert degrees to radians, use sine and cosine to split a paper link into x-y parts, then apply one 2D rotation and translation in the browser notebook.",
  "Create a room→car→camera frame tree. Compose the forward path, calculate its inverse, and verify that a forward-then-back round trip returns to the start.",
  "Make a rigid cardboard x-y-z triad. Test length, right-angle, transpose-inverse, determinant, and handedness rules for one proper SO(3) rotation and one reflection.",
  "Compare Euler angles and a unit quaternion for one phone or paper-frame orientation. Demonstrate the Euler gimbal-lock description without moving powered hardware.",
  "Build one SE(3) matrix from a 3D rotation and translation. Transform three box-attached points and verify their pairwise distances remain unchanged.",
  "Measure a two-link cardboard arm. Predict three tool positions with forward kinematics, compare them with measurements, and record position error with units and frame.",
  "Estimate a finite-difference Jacobian in the browser arm, run bounded numerical IK on one reachable and one unreachable target, and report residual, limits, iterations, and failure status.",
] as const;

export const curriculumDays: CurriculumDay[] = weekPlans
  .flatMap((week, weekIndex) =>
    week.topics.map((topic, dayIndex) => ({
      id: weekIndex * 7 + dayIndex + 1,
      week: weekIndex + 1,
      dayInWeek: dayIndex + 1,
      phaseId: week.phaseId,
      title: topic,
      focus: `${week.title} · ${week.focus}`,
      task: weekIndex < 2
        ? zeroPrerequisiteFoundationTasks[weekIndex * 7 + dayIndex]
        : activityModes[dayIndex](topic, week.lab, week.resource),
      evidence: evidenceModes[dayIndex](topic),
      lab: week.lab,
      minutes: minutesByDay[dayIndex],
      resource: week.resource,
      checkpoint: dayIndex === 6 ? week.checkpoint : undefined,
    })),
  );

export const projects = [
  {
    id: "frame-lab",
    phaseId: "foundations",
    title: "FrameLab",
    subtitle: "Paper robot → visual maths → motion",
    proof: "Robot anatomy notebook, coordinate and matrix playground, frame visualizer, IK solver, PID plot, tested C++ loop",
  },
  {
    id: "ros-rescue",
    phaseId: "ros",
    title: "ROS Rescue",
    subtitle: "Resilient simulated robot task",
    proof: "ROS graph, URDF, bags, watchdog, cancellation, recovery, metrics",
  },
  {
    id: "sense-plan-act",
    phaseId: "autonomy",
    title: "Sense → Plan → Act",
    subtitle: "Perception-guided autonomy",
    proof: "Calibrated perception, state estimate, plan, controller, 20-trial report",
  },
  {
    id: "fleet-ops",
    phaseId: "learning",
    title: "FleetOps Lab",
    subtitle: "Production fleet + validation system",
    proof: "Two-robot missions, operator HMI, fault matrix, SIL/HIL evidence, canary rollback, FAT/SAT report",
  },
  {
    id: "embodied-operator",
    phaseId: "embodied",
    title: "Embodied Operator",
    subtitle: "Language-to-action agent",
    proof: "Planner, typed skills, memory, guardrails, recovery, 30 scenarios",
  },
  {
    id: "field-capstone",
    phaseId: "ship",
    title: "Field Capstone",
    subtitle: "Robot or HIL, real evidence",
    proof: "Robot or HIL policy deployment, 50 trials, uncut demos, failure analysis",
  },
];

export const readinessSkills = [
  { id: "math", label: "Robot math", gateDay: 28 },
  { id: "cpp", label: "Production C++", gateDay: 28 },
  { id: "ros", label: "ROS 2 systems", gateDay: 56 },
  { id: "sim", label: "Simulation", gateDay: 56 },
  { id: "perception", label: "Perception", gateDay: 84 },
  { id: "control", label: "Planning & control", gateDay: 84 },
  { id: "fleet", label: "Fleet & validation", gateDay: 119 },
  { id: "embodied", label: "Embodied agents", gateDay: 147 },
  { id: "hardware", label: "Real hardware", gateDay: 168 },
  { id: "portfolio", label: "Portfolio evidence", gateDay: 180 },
];

export const resources: Resource[] = [
  modernRobotics,
  rosTutorials,
  ros2Control,
  gazebo,
  nav2,
  moveIt,
  rosSecurity,
  rosTesting,
  openRmf,
  vda5050,
  underactuated,
  lerobot,
  isaacLab,
  openVla,
  geminiRobotics,
  tensorRt,
  { label: "Physical Intelligence π₀", url: "https://www.physicalintelligence.company/blog/pi0" },
];
