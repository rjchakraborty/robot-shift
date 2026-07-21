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
    title: "Robot learning",
    shortTitle: "Learning",
    weeks: "Weeks 13–17",
    outcome: "Collect demonstrations, train policies, evaluate them, and understand sim-to-real gaps.",
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
    title: "Frames before frameworks",
    focus: "Linear algebra and spatial thinking for working engineers.",
    lab: "Build a browser-based 2D pose visualizer that composes coordinate transforms and exposes bad frame assumptions.",
    topics: [
      "Vectors, dot products, norms, and physical units",
      "Matrices as transformations—not spreadsheets",
      "Coordinate frames and change of basis",
      "2D rotations and homogeneous transforms",
      "Compose transforms through a frame tree",
      "Diagnose left-handed and right-handed frame bugs",
      "Frame visualizer demo and knowledge check",
    ],
    resource: modernRobotics,
  },
  {
    phaseId: "foundations",
    title: "Rigid motion and kinematics",
    focus: "SE(3), joints, forward kinematics, and reachable workspaces.",
    lab: "Model a two-link arm and implement forward and numerical inverse kinematics with visible convergence traces.",
    topics: [
      "SO(3), rotation matrices, and orientation representations",
      "Quaternions, Euler angles, and singularities",
      "SE(3) homogeneous transforms",
      "Joint types, degrees of freedom, and configuration space",
      "Forward kinematics for a serial arm",
      "Jacobian intuition and numerical inverse kinematics",
      "Two-link arm solver: demo, limits, and failure notes",
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
    title: "Modern C++ for robot processes",
    focus: "Deterministic, testable C++ at the hardware boundary.",
    lab: "Create a small C++ sensor→filter→controller pipeline with tests, structured logs, and deterministic replay.",
    topics: [
      "RAII, ownership, references, and smart pointers",
      "Value types, interfaces, and dependency boundaries",
      "CMake targets, libraries, and reproducible builds",
      "Threads, queues, timing, and cancellation",
      "Binary data, serialization, and bounded buffers",
      "Unit tests, sanitizers, profiling, and failure injection",
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
    title: "ROS 2 graph and communication",
    focus: "Treat ROS as a distributed production system.",
    lab: "Build a three-node telemetry, command, and watchdog system in both Python and C++.",
    topics: [
      "Workspaces, packages, nodes, and the ROS graph",
      "Topics, message design, publishers, and subscribers",
      "Services versus actions and cancellation semantics",
      "Parameters, configuration, and launch files",
      "QoS profiles, reliability, durability, and deadlines",
      "Introspection with ros2 CLI, logs, and rqt",
      "Multi-node watchdog demo and architecture note",
    ],
    resource: rosTutorials,
  },
  {
    phaseId: "ros",
    title: "Robot models and transforms",
    focus: "Make every pose explicit and inspectable.",
    lab: "Model a mobile manipulator in URDF/Xacro and verify its complete transform tree in RViz.",
    topics: [
      "URDF links, joints, inertial, visual, and collision models",
      "Xacro parameters and reusable robot descriptions",
      "Static and dynamic transforms with tf2",
      "Timestamped data and transform lookup failures",
      "RViz displays, markers, and debugging overlays",
      "Joint states and robot_state_publisher",
      "Transform audit: detect and repair three planted faults",
    ],
    resource: rosTutorials,
  },
  {
    phaseId: "ros",
    title: "Simulation and sensor plumbing",
    focus: "Build repeatable worlds before touching costly hardware.",
    lab: "Simulate a differential-drive robot with lidar, RGB-D camera, IMU, noise, and rosbag replay.",
    topics: [
      "Simulation loop, physics timestep, and real-time factor",
      "Differential-drive kinematics and wheel odometry",
      "Lidar scans, camera topics, IMU, and encoders",
      "Sensor noise, update rate, and timestamp alignment",
      "rosbag2 recording, playback, and deterministic replay",
      "Health checks and degraded-sensor behavior",
      "Reproducible simulation scenario and fault-injection demo",
    ],
    resource: rosTutorials,
  },
  {
    phaseId: "ros",
    title: "Navigation or manipulation stack",
    focus: "Use a production stack, then learn where it breaks.",
    lab: "Choose Nav2 or MoveIt 2 and complete one goal with cancellation, timeout, obstruction, and recovery.",
    topics: [
      "Choose a track: mobile navigation or arm manipulation",
      "Maps and costmaps—or planning scenes and collision objects",
      "Goals, planners, controllers, and execution pipelines",
      "Behavior trees—or grasp and motion planning stages",
      "Timeout, cancellation, obstruction, and replanning",
      "Metrics: success, path length, time, and recovery count",
      "Phase demo: one resilient simulated robot task",
    ],
    resource: rosTutorials,
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
      "Plane segmentation and tabletop extraction",
      "3D bounding boxes and pose estimation",
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
    title: "State estimation and localization",
    focus: "Know what the robot believes and why.",
    lab: "Fuse noisy odometry and IMU measurements, visualize uncertainty, and recover from a sensor dropout.",
    topics: [
      "State, observation, process model, and uncertainty",
      "Probability distributions and covariance intuition",
      "Bayes filters and the predict/update cycle",
      "Kalman and extended Kalman filter intuition",
      "Odometry and IMU fusion",
      "Localization drift, outliers, and sensor dropout",
      "Estimator report: error, uncertainty, and recovery behavior",
    ],
    resource: {
      label: "Probabilistic Robotics course notes",
      url: "https://www.cs.cmu.edu/~16833/",
    },
  },
  {
    phaseId: "autonomy",
    title: "Planning, control, and autonomy loop",
    focus: "Close perception→state→plan→control→observe.",
    lab: "Deliver a perception-guided navigation or pick-and-place task with a state machine and safe stop.",
    topics: [
      "Configuration-space obstacles and collision checking",
      "Graph search: Dijkstra and A*",
      "Sampling-based planning: RRT intuition",
      "Trajectory generation and tracking",
      "Finite-state machines and behavior trees",
      "Safety envelopes, emergency stop, and bounded commands",
      "Autonomy-loop acceptance test across varied scenes",
    ],
    resource: underactuated,
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
      "Covariate shift and compounding errors",
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
    title: "Diffusion and flow policies",
    focus: "Model multimodal continuous robot actions.",
    lab: "Run or fine-tune a LeRobot policy and inspect how action chunks change smoothness and responsiveness.",
    topics: [
      "Why robot actions can be multimodal",
      "Diffusion-policy intuition",
      "Flow matching and continuous action generation",
      "Observation windows and action horizons",
      "Fine-tuning an existing LeRobot policy",
      "Runtime chunking, temporal ensembling, and latency",
      "Policy comparison with success and smoothness metrics",
    ],
    resource: lerobot,
  },
  {
    phaseId: "learning",
    title: "RL and sim-to-real judgment",
    focus: "Know when reinforcement learning is justified—and when it is not.",
    lab: "Train one constrained simulation policy, then document transfer risks and a realistic deployment plan.",
    topics: [
      "MDPs, rewards, returns, value, and policy",
      "Exploration and credit assignment",
      "PPO intuition and a small control task",
      "Reward hacking and unsafe learned behavior",
      "Domain randomization and system identification",
      "Simulation fidelity, transfer gaps, and hybrid approaches",
      "Robot-learning gate: select BC, RL, or classical control",
    ],
    resource: isaacLab,
    checkpoint: "Gate 4 · Train, deploy, and compare policies with a fixed dataset and repeatable rollout evaluation.",
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
    title: "OpenVLA adaptation",
    focus: "Use an open model rather than pretending to train one from scratch.",
    lab: "Run an OpenVLA/LeRobot example or a reduced simulation analogue and design a LoRA adaptation experiment.",
    topics: [
      "OpenVLA architecture and tokenized actions",
      "Open X-Embodiment data and dataset mixing",
      "Checkpoint loading and inference pipeline",
      "Parameter-efficient fine-tuning with LoRA",
      "Robot-specific normalization and action decoding",
      "Generalization tests and out-of-distribution prompts",
      "Adaptation report with compute, data, and risk budget",
    ],
    resource: openVla,
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
      "Grounding planner outputs in perceived entities",
      "Plan execution, monitoring, and replanning",
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
      "Prompt injection and untrusted environmental text",
      "Scenario design and acceptance criteria",
      "Success, partial success, intervention, and safety metrics",
      "Adversarial scenes and recovery testing",
      "Embodied-agent evaluation report over 30 scenarios",
    ],
    resource: geminiRobotics,
    checkpoint: "Gate 5 · Show a planner→skill→controller system with guardrails, recovery, and 30-scenario evidence.",
  },
  {
    phaseId: "ship",
    title: "Real hardware bring-up",
    focus: "Treat the physical robot as an unreliable distributed system.",
    lab: "Bring up a LeRobot-supported arm or mobile robot with calibration, limits, teleoperation, and emergency stop.",
    topics: [
      "Choose hardware from task, support, and safety constraints",
      "Motors, encoders, buses, power, and physical limits",
      "Firmware, device discovery, and deterministic startup",
      "Joint calibration and coordinate-frame verification",
      "Teleoperation and low-speed first motion",
      "Emergency stop, watchdog, and safe shutdown",
      "Hardware acceptance checklist and repeatable bring-up video",
    ],
    resource: lerobot,
  },
  {
    phaseId: "ship",
    title: "Collect your real dataset",
    focus: "Make the capstone data better before making the model larger.",
    lab: "Collect, review, and version real demonstrations for one useful tabletop or mobile task.",
    topics: [
      "Define the capstone task and measurable success",
      "Design scene, object, lighting, and start-state variation",
      "Build the teleoperation and recording workflow",
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
    focus: "Close the complete data→training→robot loop.",
    lab: "Fine-tune one policy, deploy it behind a safe ROS 2 action, and evaluate it on held-out scenes.",
    topics: [
      "Select a baseline and write the experiment hypothesis",
      "Train the first policy and inspect learning curves",
      "Integrate inference with the robot process",
      "Bound commands, latency, and watchdog behavior",
      "Run held-out evaluation without tuning on failures",
      "Improve data or policy based on failure categories",
      "Freeze model v1 and publish the evaluation table",
    ],
    resource: lerobot,
  },
  {
    phaseId: "ship",
    title: "Harden the embodied capstone",
    focus: "Turn a demo into an engineering case study.",
    lab: "Add language goals, skill orchestration, recovery, observability, and a 50-trial acceptance suite.",
    topics: [
      "Connect natural-language goals to typed robot skills",
      "Add perception grounding and world-state inspection",
      "Implement retry, replan, abort, and human handoff",
      "Add traces, videos, metrics, and replay tooling",
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
      "Résumé rewrite for robotics platform and application roles",
      "Interview drills: C++, ROS 2, systems, controls, and ML",
      "Final readiness audit and next 30-day application sprint",
      "Target-company matrix and warm outreach",
      "Program retrospective and next-quarter specialization",
    ],
    resource: {
      label: "Current Figure AI careers",
      url: "https://www.figure.ai/careers",
    },
  },
];

const activityModes = [
  "Learn · Read the focused reference, write a five-point mental model, then explain it aloud without jargon.",
  "Practice · Implement the smallest executable example. Change one assumption and predict the result before running it.",
  "Test · Add instrumentation, assertions, and at least one failure input. Record what the system believed versus what happened.",
  "Integrate · Connect today’s concept to the weekly lab. Preserve a working baseline before changing behavior.",
  "Apply · Complete a realistic scenario and compare at least two approaches using one explicit metric.",
  "Prove · Record a short demo, capture decisive logs or plots, and document the most important failure honestly.",
  "Review · Rebuild the key idea from memory, close one gap, and publish the week’s evidence and next-step note.",
];

const evidenceModes = [
  "A concise field note plus one checked example committed to your learning log.",
  "Working code with a README command and a screenshot or terminal trace.",
  "A reproducible test or failure case with expected and actual behavior.",
  "The weekly lab gains a working, observable increment.",
  "A small comparison table containing result, metric, and decision.",
  "A 60–120 second demo plus an honest failure note.",
  "A weekly ship note: what works, what failed, and what changes next.",
];

const minutesByDay = [90, 105, 90, 120, 105, 150, 60];

export const curriculumDays: CurriculumDay[] = weekPlans
  .flatMap((week, weekIndex) =>
    week.topics.map((topic, dayIndex) => ({
      id: weekIndex * 7 + dayIndex + 1,
      week: weekIndex + 1,
      dayInWeek: dayIndex + 1,
      phaseId: week.phaseId,
      title: topic,
      focus: `${week.title} · ${week.focus}`,
      task: `${activityModes[dayIndex]} Weekly build: ${week.lab}`,
      evidence: evidenceModes[dayIndex],
      lab: week.lab,
      minutes: minutesByDay[dayIndex],
      resource: week.resource,
      checkpoint: dayIndex === 6 ? week.checkpoint : undefined,
    })),
  )
  .slice(0, 180);

export const projects = [
  {
    id: "frame-lab",
    phaseId: "foundations",
    title: "FrameLab",
    subtitle: "Transforms + control mini-system",
    proof: "Interactive frame visualizer, IK solver, PID plot, tested C++ loop",
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
    id: "policy-bench",
    phaseId: "learning",
    title: "PolicyBench",
    subtitle: "Robot-learning comparison",
    proof: "Versioned demonstrations, two trained policies, fixed rollout suite",
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
    subtitle: "Real robot, real evidence",
    proof: "Real policy deployment, 50 trials, uncut demos, failure analysis",
  },
];

export const readinessSkills = [
  { id: "math", label: "Robot math", gateDay: 28 },
  { id: "cpp", label: "Production C++", gateDay: 28 },
  { id: "ros", label: "ROS 2 systems", gateDay: 56 },
  { id: "sim", label: "Simulation", gateDay: 56 },
  { id: "perception", label: "Perception", gateDay: 84 },
  { id: "control", label: "Planning & control", gateDay: 84 },
  { id: "learning", label: "Robot learning", gateDay: 119 },
  { id: "embodied", label: "Embodied agents", gateDay: 147 },
  { id: "hardware", label: "Real hardware", gateDay: 168 },
  { id: "portfolio", label: "Portfolio evidence", gateDay: 180 },
];

export const resources: Resource[] = [
  modernRobotics,
  rosTutorials,
  underactuated,
  lerobot,
  isaacLab,
  openVla,
  geminiRobotics,
  { label: "Physical Intelligence π₀", url: "https://www.physicalintelligence.company/blog/pi0" },
];
