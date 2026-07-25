export const MARKET_CAPTURED_ON = "2026-07-23";

export type MarketSkill =
  | "Python"
  | "C++"
  | "ROS 2"
  | "Linux"
  | "Testing"
  | "Simulation"
  | "Navigation / SLAM"
  | "Deployment"
  | "Fleet / AMR"
  | "Backend / APIs"
  | "Web / Mobile UI"
  | "Realtime networking"
  | "Cloud / DevOps"
  | "Observability"
  | "Hardware integration"
  | "Safety"
  | "ML / PyTorch"
  | "LLM / VLA"
  | "Databases / messaging"
  | "Controls / kinematics";

export type JobEvidence = {
  id: string;
  company: string;
  title: string;
  location: string;
  source: "Direct ATS" | "Official careers" | "LinkedIn" | "Indeed" | "Wellfound";
  url: string;
  capturedOn: typeof MARKET_CAPTURED_ON;
  tags: readonly MarketSkill[];
  summary: string;
};

export const jobEvidence: readonly JobEvidence[] = [
  {
    id: "skild-deployment-testing",
    company: "Skild AI",
    title: "Robotics Engineer, Deployment & Testing",
    location: "Bengaluru",
    source: "Direct ATS",
    url: "https://job-boards.greenhouse.io/skildai-careers/jobs/4483954008",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Python", "C++", "ROS 2", "Testing", "Deployment", "Hardware integration", "ML / PyTorch"],
    summary: "Regression systems, risk-based test plans, production-log replay, customer-site debugging, and real-robot readiness.",
  },
  {
    id: "skild-robotics-software",
    company: "Skild AI",
    title: "Robotics Software Engineer",
    location: "Bengaluru",
    source: "Direct ATS",
    url: "https://job-boards.greenhouse.io/skildai-careers/jobs/4136373008",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Python", "C++", "ROS 2", "Linux", "Navigation / SLAM", "Controls / kinematics", "Hardware integration", "ML / PyTorch"],
    summary: "Production robot software spanning planning, control, navigation, perception, manipulation, and ML integration.",
  },
  {
    id: "skild-react-native",
    company: "Skild AI",
    title: "React Native Developer",
    location: "Bengaluru",
    source: "Direct ATS",
    url: "https://job-boards.greenhouse.io/skildai-careers/jobs/4483863008",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Web / Mobile UI", "Realtime networking", "ROS 2", "Backend / APIs", "Testing"],
    summary: "Mobile robot control and monitoring with React Native, WebSocket, WebRTC, 3D visualization, and tested operator workflows.",
  },
  {
    id: "botsync-fleet-backend",
    company: "Botsync",
    title: "Software Backend Engineer — SyncOS Fleet Manager",
    location: "Bengaluru",
    source: "Wellfound",
    url: "https://wellfound.com/jobs/3713697-software-backend-engineer-syncos-fleet-manager",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Python", "Backend / APIs", "Realtime networking", "Fleet / AMR", "Databases / messaging", "Cloud / DevOps", "Linux"],
    summary: "AMR task allocation, traffic and workflow orchestration using Python services, WebSocket, queues, databases, containers, and Linux.",
  },
  {
    id: "mir-fleet-full-stack",
    company: "MiR / Teradyne Robotics",
    title: "Software Engineer — Fleet Management & Full-Stack Software",
    location: "Bengaluru",
    source: "Official careers",
    url: "https://jobs.teradyne.com/MiR/job/Bangalore-Software-Engineer-Fleet-Management-%26-Full%E2%80%91Stack-Software/1386830200/",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Python", "Backend / APIs", "Web / Mobile UI", "Fleet / AMR", "Cloud / DevOps", "Observability", "Databases / messaging"],
    summary: "Customer-facing fleet software across APIs, UI, data, distributed services, containers, logs, and metrics.",
  },
  {
    id: "amd-validation",
    company: "AMD",
    title: "Senior Robotics Software Usecases Validation Engineer",
    location: "Bengaluru",
    source: "Official careers",
    url: "https://careers.amd.com/talent-network/jobs/84985?lang=en-us",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Python", "C++", "ROS 2", "Testing", "Simulation", "Navigation / SLAM", "Fleet / AMR", "Safety", "Cloud / DevOps", "Hardware integration"],
    summary: "ROS 2/Nav2 validation with automated tests, simulation, SIL/HIL, sensors, fleet protocols, safety awareness, and CI.",
  },
  {
    id: "amd-robotics-development",
    company: "AMD",
    title: "Senior Software Robotics Development Engineer",
    location: "Bengaluru",
    source: "Official careers",
    url: "https://careers.amd.com/careers-home/jobs/85386?lang=en-us",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["C++", "Python", "ROS 2", "Linux", "Simulation", "Navigation / SLAM", "Controls / kinematics", "ML / PyTorch", "Hardware integration"],
    summary: "ROS 2 systems development across perception, SLAM, navigation, planning, control, simulation, sensors, and edge ML.",
  },
  {
    id: "unbox-robotics-software",
    company: "Unbox Robotics",
    title: "Software Engineer — Robotics",
    location: "Pune",
    source: "Indeed",
    url: "https://in.indeed.com/viewjob?jk=b1dca79a6bb58550",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["C++", "Python", "ROS 2", "Linux", "Simulation", "Navigation / SLAM", "Realtime networking", "Testing", "Fleet / AMR", "Hardware integration"],
    summary: "AMR software using ROS/ROS 2, C++/Python, Linux, simulation, planning, robot communications, sensors, and tests.",
  },
  {
    id: "botsync-robotics-l2",
    company: "Botsync",
    title: "Robotics Software Engineer L2",
    location: "Bengaluru",
    source: "LinkedIn",
    url: "https://in.linkedin.com/jobs/view/robotics-software-engineer-l2-at-botsync-4432220470",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["C++", "Python", "ROS 2", "Linux", "Navigation / SLAM", "Fleet / AMR", "Deployment", "Hardware integration"],
    summary: "AMR navigation and SLAM software with robust error handling, hardware integration, field testing, and customer-site deployment.",
  },
  {
    id: "universal-robots-engineer",
    company: "Universal Robots",
    title: "Robotics Engineer",
    location: "Bengaluru",
    source: "LinkedIn",
    url: "https://in.linkedin.com/jobs/view/robotics-engineer-universal-robots-bangalore-india-at-universal-robots-4413607111",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Python", "C++", "ROS 2", "Simulation", "Controls / kinematics", "Hardware integration", "Safety", "ML / PyTorch", "LLM / VLA"],
    summary: "Robot programming, kinematics, motion planning, control, sensors, simulation, hardware calibration, and emerging VLA awareness.",
  },
  {
    id: "svaya-application",
    company: "Svaya Robotics",
    title: "Robot Application Engineer",
    location: "Delhi NCR / Hyderabad",
    source: "Indeed",
    url: "https://in.indeed.com/q-robot-application-l-anywhere-jobs.html",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["Deployment", "Hardware integration", "Testing", "Safety", "Controls / kinematics", "Realtime networking"],
    summary: "Hands-on integration, commissioning, FAT/SAT, drives and sensors, industrial protocols, safety, and customer deployment.",
  },
  {
    id: "ltts-ros-engineer",
    company: "L&T Technology Services",
    title: "ROS Engineer",
    location: "Bengaluru",
    source: "LinkedIn",
    url: "https://in.linkedin.com/jobs/view/ros-engineer-at-l-t-technology-services-4435043238",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["C++", "Python", "ROS 2", "Navigation / SLAM", "Controls / kinematics", "Hardware integration", "Deployment", "ML / PyTorch"],
    summary: "ROS 2 bring-up for arms and mobile robots, teleoperation, autonomy, motion planning, control, debugging, and AI data collection.",
  },
  {
    id: "nvidia-physical-ai",
    company: "NVIDIA",
    title: "Senior Solutions Architect — Physical AI",
    location: "Bengaluru",
    source: "Official careers",
    url: "https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/India-Bengaluru/Senior-Solutions-Architect---Physical-AI_JR2014311",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["ROS 2", "Simulation", "Hardware integration", "Deployment", "ML / PyTorch", "LLM / VLA", "Cloud / DevOps"],
    summary: "A stretch benchmark joining ROS 2 and physical hardware with the Isaac/Jetson stack, multimodal AI, and customer solution design.",
  },
  {
    id: "varologic-ros-navigation",
    company: "Varologic Technologies",
    title: "ROS / Navigation Engineer",
    location: "Ahmedabad",
    source: "Indeed",
    url: "https://in.indeed.com/viewjob?jk=91ccf1e7b5fbef0f",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["C++", "Python", "ROS 2", "Linux", "Simulation", "Navigation / SLAM", "Fleet / AMR", "Controls / kinematics", "Hardware integration", "Cloud / DevOps"],
    summary: "ROS 2 navigation and fleet work with C++/Python, sensors, simulation, SLAM, planning, control, real-time concepts, and CI.",
  },
  {
    id: "skild-camera-systems",
    company: "Skild AI",
    title: "Camera Systems Software Engineer — India",
    location: "Bengaluru",
    source: "Direct ATS",
    url: "https://job-boards.greenhouse.io/skildai-careers/jobs/5263541008",
    capturedOn: MARKET_CAPTURED_ON,
    tags: ["C++", "Linux", "Testing", "Hardware integration", "Observability", "Realtime networking", "Deployment"],
    summary: "A specialist signal for production camera bring-up, calibration, low-latency pipelines, observability, and board-level debugging.",
  },
];

export type RoleTier =
  | "software-bridge"
  | "integration"
  | "robotics-core"
  | "advanced-applied";

export type TargetRole = {
  id: string;
  tier: RoleTier;
  title: string;
  timing: string;
  fit: string;
  portfolioLeverage: readonly string[];
  gaps: readonly string[];
  proof: readonly string[];
  keywords: readonly string[];
  interviewDomains: readonly string[];
  courseDays: readonly number[];
};

export const targetRoles: readonly TargetRole[] = [
  {
    id: "robot-hmi",
    tier: "software-bridge",
    title: "Robot HMI / Control & Monitoring Engineer",
    timing: "Evidence gate: one robotics-facing UI with command-state, stale-data, and recovery proof.",
    fit: "A practical bridge for learners who can already demonstrate interface, accessibility, API, mobile, or real-time product work at the robot/operator boundary.",
    portfolioLeverage: [
      "Verified web, desktop, mobile, or embedded interface delivery",
      "Accessible operator workflows and explicit state communication",
      "API integration, UI testing, release, and production-debugging evidence",
    ],
    gaps: ["WebSocket/WebRTC failure handling", "3D robot/map visualization", "ROS 2 message and safety semantics"],
    proof: ["Live robot telemetry UI", "Dead-man teleoperation control", "Offline/reconnect and stale-data recovery demo"],
    keywords: ["React", "Flutter", "WebSocket", "WebRTC", "Three.js", "teleoperation", "robot monitoring", "ROS 2"],
    interviewDomains: ["Latency and stale commands", "Operator safety", "State synchronization", "3D/map performance", "Test strategy"],
    courseDays: [29, 35, 106, 108, 110, 112],
  },
  {
    id: "fleet-platform",
    tier: "software-bridge",
    title: "Robot Fleet Backend / Platform Engineer",
    timing: "Evidence gate: one fleet service with mission identity, telemetry, retries, and disconnect recovery.",
    fit: "A practical bridge for learners with verified service, API, data, messaging, cloud, reliability, or distributed-systems experience.",
    portfolioLeverage: [
      "Verified backend services in any suitable production language",
      "APIs, background work, event processing, and data consistency",
      "Databases, messaging, CI/CD, observability, and cloud operations",
    ],
    gaps: ["AMR mission and traffic models", "Edge/cloud failure boundaries", "Robot lifecycle, fleet safety, and OTA rollback"],
    proof: ["Two-robot task allocator", "Idempotent mission API plus WebSocket telemetry", "Disconnect, retry, deadlock, and rollback report"],
    keywords: ["Python", "FastAPI", "REST", "WebSocket", "Redis", "Kafka", "fleet manager", "AMR", "Docker"],
    interviewDomains: ["Task allocation", "Ordering and idempotency", "Backpressure", "Intermittent networks", "Observability and rollback"],
    courseDays: [34, 35, 106, 107, 108, 109, 111, 112],
  },
  {
    id: "deployment-validation",
    tier: "integration",
    title: "Robotics Deployment, Integration & Validation Engineer",
    timing: "Evidence gate: ROS 2 core plus a risk-linked SIL/HIL, commissioning, or acceptance package.",
    fit: "A strong path for learners who can demonstrate QA, release, incident diagnosis, systems integration, field support, or hands-on hardware work.",
    portfolioLeverage: [
      "Cross-stack diagnosis, production QA, or incident response",
      "Release, CI/CD, observability, rollback, or support evidence",
      "Verified wiring, electronics, controls, maintenance, or lab practice",
    ],
    gaps: ["C++/Linux robot runtime", "ROS 2 launch and lifecycle testing", "SIL/HIL, commissioning, and AMR safety evidence"],
    proof: ["Risk-based regression suite", "SIL/HIL fault-injection matrix", "FAT/SAT pack with a reproduced production failure"],
    keywords: ["ROS 2", "Python", "C++", "pytest", "gtest", "launch_testing", "Gazebo", "SIL", "HIL", "FAT", "SAT"],
    interviewDomains: ["Risk and traceability", "Deterministic regression", "Sensor faults", "Customer-site diagnosis", "Safety boundaries"],
    courseDays: [22, 29, 36, 113, 114, 115, 116, 118, 119],
  },
  {
    id: "ros-integration",
    tier: "integration",
    title: "Robotics Application / ROS 2 Integration Engineer",
    timing: "Evidence gate: a working ROS 2 navigation, manipulation, or hardware-interface integration.",
    fit: "A strong path for systems generalists who can connect software, sensors, actuators, networks, and user or operator workflows.",
    portfolioLeverage: [
      "Cross-system integration in software, data, embedded, or hardware domains",
      "Verified troubleshooting, repair, lab, or field-support practice",
      "Requirements translated into tested end-to-end behavior",
    ],
    gaps: ["ROS 2 graph, tf2, URDF, ros2_control", "Nav2/SLAM or MoveIt integration", "Industrial interfaces and commissioning"],
    proof: ["Sensor-to-actuator ROS 2 stack", "Navigation recovery or manipulation demo", "Documented wiring, calibration, and commissioning runbook"],
    keywords: ["ROS 2", "tf2", "URDF", "ros2_control", "Nav2", "SLAM", "MoveIt", "sensors", "commissioning"],
    interviewDomains: ["Frames and transforms", "QoS and lifecycle", "Bring-up", "Calibration", "Failure recovery", "Field integration"],
    courseDays: [29, 32, 33, 35, 42, 51, 56, 63, 70, 117, 119],
  },
  {
    id: "robotics-software",
    tier: "robotics-core",
    title: "Robotics Software Engineer — ROS 2 / AMR",
    timing: "Evidence gate: two credible ROS 2/AMR builds plus repeated real-robot or HIL trials.",
    fit: "A robotics-core specialization that requires direct C++, mathematics, runtime diagnosis, and robot-behavior evidence; unrelated seniority alone does not satisfy it.",
    portfolioLeverage: [
      "Verified production engineering, reliability, or systems habits",
      "Algorithms, services, data, concurrency, or distributed-system diagnosis",
      "Evidence of shipping and operating complete products or devices",
    ],
    gaps: ["Production C++", "Kinematics, control, planning, and state estimation", "Long-running real-robot or HIL reliability evidence"],
    proof: ["ROS 2 AMR stack", "Planning/recovery behavior tree", "Fifty-trial reliability report with failure taxonomy"],
    keywords: ["C++", "Python", "ROS 2", "Linux", "Nav2", "SLAM", "Gazebo", "behavior trees", "AMR"],
    interviewDomains: ["Memory and concurrency", "Frames and kinematics", "Planning algorithms", "ROS 2 QoS", "Debugging timing and sensor faults"],
    courseDays: [1, 7, 14, 21, 28, 42, 56, 63, 77, 84, 119, 175],
  },
  {
    id: "physical-ai",
    tier: "advanced-applied",
    title: "Robot Learning Deployment / Physical AI Integration Engineer",
    timing: "Evidence gate: robot-learning datasets, evaluation, guardrails, and a bounded real-robot or HIL rollout.",
    fit: "An advanced applied path for learners with verified ML, data, agent, evaluation, or deployment work at the integration layer; it is not automatically a research-scientist claim.",
    portfolioLeverage: [
      "Verified ML, LLM, agent, retrieval, or multimodal workflows",
      "Data pipelines, model services, evaluation, and deployment",
      "End-to-end product, experiment, safety, or reliability evidence",
    ],
    gaps: ["PyTorch and robot datasets", "Behavior cloning, VLA evaluation, and sim-to-real", "Safe action grounding on physical systems"],
    proof: ["Language-to-safe-skill agent", "VLA/behavior-cloning evaluation harness", "Recovery, guardrail, and real/HIL rollout report"],
    keywords: ["PyTorch", "LeRobot", "VLA", "behavior cloning", "multimodal", "Isaac", "sim-to-real", "evaluation"],
    interviewDomains: ["Dataset quality", "Policy evaluation", "Action grounding", "Latency", "Guardrails", "Distribution shift and recovery"],
    courseDays: [85, 91, 98, 105, 120, 127, 134, 141, 147, 175],
  },
];

export type CourseSkillMap = {
  skill: MarketSkill;
  days: string;
  startDay: number;
  action: string;
  terms: readonly string[];
};

export const courseSkillMap: readonly CourseSkillMap[] = [
  { skill: "Python", days: "Days 29–35, 85–147", startDay: 29, action: "Build ROS 2 utilities, robot-data pipelines, policy training, and evaluation code.", terms: ["python", "pytest"] },
  { skill: "C++", days: "Days 22–28", startDay: 22, action: "Build a bounded sensor→controller pipeline with CMake, tests, and deterministic replay.", terms: ["c++", "cpp", "cmake", "gtest"] },
  { skill: "ROS 2", days: "Days 29–56", startDay: 29, action: "Ship and debug multi-node ROS 2 systems using tf2, URDF, QoS, lifecycle, launch, and ros2_control.", terms: ["ros 2", "ros2", "rclcpp", "rclpy", "tf2", "urdf", "ros2_control", "nav2"] },
  { skill: "Linux", days: "Days 22–35", startDay: 22, action: "Practice device permissions, processes, timing, logs, builds, and robot-runtime diagnosis.", terms: ["linux", "bash", "ubuntu", "systemd"] },
  { skill: "Testing", days: "Days 113–119", startDay: 113, action: "Create a risk-linked regression system with pytest, gtest, launch_testing, SIL/HIL, and FAT/SAT.", terms: ["test", "testing", "qa", "regression", "pytest", "gtest", "launch_testing", "sil", "hil", "fat", "sat"] },
  { skill: "Simulation", days: "Days 43–49, 115–116", startDay: 43, action: "Build deterministic Gazebo scenarios, fault injection, and simulation-to-HIL acceptance checks.", terms: ["simulation", "gazebo", "isaac sim", "mujoco", "sil", "hil"] },
  { skill: "Navigation / SLAM", days: "Days 50–77", startDay: 50, action: "Integrate mapping, localization, Nav2 planning, behavior trees, perception, state estimation, and recovery.", terms: ["navigation", "nav2", "slam", "localization", "mapping", "path planning", "behavior tree"] },
  { skill: "Deployment", days: "Days 106–119, 148–175", startDay: 106, action: "Package, deploy, observe, roll back, commission, and document a robot system.", terms: ["deployment", "commissioning", "customer site", "ota", "rollback", "fat", "sat"] },
  { skill: "Fleet / AMR", days: "Days 106–112, 117", startDay: 106, action: "Implement robot missions, task allocation, traffic, battery/docking, fleet APIs, and VDA5050/Open-RMF boundaries.", terms: ["fleet", "amr", "agv", "task allocation", "traffic management", "vda5050", "vda 5050", "open-rmf", "rmf"] },
  { skill: "Backend / APIs", days: "Days 106–109", startDay: 106, action: "Design idempotent mission APIs and safe cancellation across robot, edge, and cloud.", terms: ["backend", "api", "rest", "fastapi", "microservice", "grpc"] },
  { skill: "Web / Mobile UI", days: "Days 110 and 157", startDay: 110, action: "Build a safe operator HMI and real-robot teleoperation console with telemetry, stale-state indicators, access control, and dead-man control.", terms: ["react", "flutter", "android", "frontend", "ui", "hmi", "dashboard", "three.js", "threejs"] },
  { skill: "Realtime networking", days: "Days 35, 108–110", startDay: 35, action: "Handle DDS QoS, WebSocket/WebRTC telemetry, cancellation, latency, and reconnects.", terms: ["websocket", "websockets", "webrtc", "dds", "mqtt", "zeromq", "zmq", "real-time", "realtime"] },
  { skill: "Cloud / DevOps", days: "Days 109–112, 169–175", startDay: 109, action: "Containerize edge/cloud services and practice versioned config, CI, canaries, and rollback.", terms: ["docker", "kubernetes", "k8s", "ci/cd", "devops", "cloud", "aws", "gcp"] },
  { skill: "Observability", days: "Days 112, 169–175", startDay: 112, action: "Join logs, metrics, traces, bags, alerts, and SLOs into a repeatable fault investigation.", terms: ["observability", "telemetry", "logging", "metrics", "tracing", "alerting", "slo"] },
  { skill: "Hardware integration", days: "Days 36–56, 148–168", startDay: 36, action: "Wire, calibrate, bring up, diagnose, and safely command sensors, actuators, and compute.", terms: ["hardware", "sensor", "actuator", "motor", "servo", "lidar", "imu", "camera", "calibration", "wiring"] },
  { skill: "Safety", days: "Days 20–21, 118, 148–168", startDay: 20, action: "Apply command limits, e-stop/STO concepts, safety zones, stopping distance, and risk evidence.", terms: ["safety", "e-stop", "estop", "sto", "iso 3691-4", "iso3691", "iso 13849", "risk", "fmea"] },
  { skill: "ML / PyTorch", days: "Days 85–105, 120–147", startDay: 85, action: "Train and evaluate applied robot policies; measure failures and distribution shift.", terms: ["pytorch", "machine learning", "ml", "neural network", "behavior cloning", "imitation learning"] },
  { skill: "LLM / VLA", days: "Days 120–147", startDay: 120, action: "Ground language in safe robot skills with tool contracts, evaluation, guardrails, and recovery.", terms: ["llm", "vla", "vision-language-action", "multimodal", "lerobot", "openvla", "gemini robotics", "gr00t"] },
  { skill: "Databases / messaging", days: "Days 107–109", startDay: 107, action: "Model missions and telemetry with PostgreSQL, Redis, event streams, ordering, and backpressure.", terms: ["postgres", "postgresql", "redis", "kafka", "rabbitmq", "database", "sql", "queue", "messaging", "event stream"] },
  { skill: "Controls / kinematics", days: "Days 1–21 and 78–84", startDay: 1, action: "Explain and implement frames, kinematics, PID, planning, and manipulation fundamentals.", terms: ["kinematics", "dynamics", "control", "pid", "jacobian", "motion planning", "moveit"] },
];

export type SkillCount = {
  skill: MarketSkill;
  count: number;
};

export function countMarketSkills(
  records: readonly Pick<JobEvidence, "tags">[] = jobEvidence,
): SkillCount[] {
  const counts = new Map<MarketSkill, number>();
  for (const record of records) {
    for (const skill of new Set(record.tags)) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([skill, count]) => ({ skill, count }))
    .sort((left, right) => right.count - left.count || left.skill.localeCompare(right.skill));
}

export type MatchedSkill = SkillCount & {
  matchedTerms: readonly string[];
};

export type JdMatchResult = {
  matchedSkills: readonly MatchedSkill[];
  courseLinks: readonly CourseSkillMap[];
  unmatchedTerms: readonly string[];
};

const extensionSignals = [
  "cuda",
  "plc",
  "opc ua",
  "opc-ua",
  "ethercat",
  "modbus",
  "rtos",
  "matlab",
  "simulink",
  "urscript",
  "vulkan",
  "fpga",
] as const;

function includesTerm(text: string, term: string) {
  return text.includes(term.toLocaleLowerCase());
}

export function matchJobDescription(text: string): JdMatchResult {
  const normalized = text.toLocaleLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return { matchedSkills: [], courseLinks: [], unmatchedTerms: [] };

  const marketCounts = new Map(
    countMarketSkills().map(({ skill, count }) => [skill, count]),
  );
  const matches = courseSkillMap.flatMap((mapping) => {
    const matchedTerms = mapping.terms.filter((term) => includesTerm(normalized, term));
    return matchedTerms.length
      ? [{
          skill: mapping.skill,
          count: marketCounts.get(mapping.skill) ?? 0,
          matchedTerms,
        }]
      : [];
  });
  matches.sort((left, right) => right.count - left.count || left.skill.localeCompare(right.skill));

  const matchedSet = new Set(matches.map(({ skill }) => skill));
  const courseLinks = courseSkillMap.filter(({ skill }) => matchedSet.has(skill));
  const unmatchedTerms = extensionSignals
    .filter((term) => includesTerm(normalized, term))
    .filter((term, index, list) => list.indexOf(term) === index);

  return { matchedSkills: matches, courseLinks, unmatchedTerms };
}
