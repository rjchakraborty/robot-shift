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

export type RoleTier = "apply-first" | "primary" | "next" | "stretch";

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
    tier: "apply-first",
    title: "Robot HMI / Control & Monitoring Engineer",
    timing: "Apply after one robotics-facing UI proof, typically 4–8 focused weeks.",
    fit: "Closest bridge: reuse shipped React, Flutter, Android, API, and real-time product skills at the robot/operator boundary.",
    portfolioLeverage: [
      "React and Next.js web products",
      "Flutter and Android delivery",
      "End-to-end UX, API, QA, and deployment ownership",
    ],
    gaps: ["WebSocket/WebRTC failure handling", "3D robot/map visualization", "ROS 2 message and safety semantics"],
    proof: ["Live robot telemetry UI", "Dead-man teleoperation control", "Offline/reconnect and stale-data recovery demo"],
    keywords: ["React", "Flutter", "WebSocket", "WebRTC", "Three.js", "teleoperation", "robot monitoring", "ROS 2"],
    interviewDomains: ["Latency and stale commands", "Operator safety", "State synchronization", "3D/map performance", "Test strategy"],
    courseDays: [29, 35, 106, 108, 110, 112],
  },
  {
    id: "fleet-platform",
    tier: "apply-first",
    title: "Robot Fleet Backend / Platform Engineer",
    timing: "Apply after a fleet-service bridge project, typically 6–10 focused weeks.",
    fit: "Strong bridge from Python/Node APIs, event workflows, PostgreSQL, Redis, Kafka, cloud concepts, and production debugging.",
    portfolioLeverage: [
      "Python and Node backend services",
      "REST, background jobs, and event workflows",
      "PostgreSQL, Redis, Kafka, Firebase, CI/CD, and cloud concepts",
    ],
    gaps: ["AMR mission and traffic models", "Edge/cloud failure boundaries", "Robot lifecycle, fleet safety, and OTA rollback"],
    proof: ["Two-robot task allocator", "Idempotent mission API plus WebSocket telemetry", "Disconnect, retry, deadlock, and rollback report"],
    keywords: ["Python", "FastAPI", "REST", "WebSocket", "Redis", "Kafka", "fleet manager", "AMR", "Docker"],
    interviewDomains: ["Task allocation", "Ordering and idempotency", "Backpressure", "Intermittent networks", "Observability and rollback"],
    courseDays: [34, 35, 106, 107, 108, 109, 111, 112],
  },
  {
    id: "deployment-validation",
    tier: "primary",
    title: "Robotics Deployment, Integration & Validation Engineer",
    timing: "Primary target after ROS 2 core and FleetOps Gate, around Days 84–119.",
    fit: "Production incident debugging, QA automation, release discipline, and hands-on electrical tinkering transfer directly.",
    portfolioLeverage: [
      "Cross-stack debugging and production QA",
      "Release, CI/CD, observability, and incident ownership",
      "DIY wiring, soldering, motors, servos, and basic electronics",
    ],
    gaps: ["C++/Linux robot runtime", "ROS 2 launch and lifecycle testing", "SIL/HIL, commissioning, and AMR safety evidence"],
    proof: ["Risk-based regression suite", "SIL/HIL fault-injection matrix", "FAT/SAT pack with a reproduced production failure"],
    keywords: ["ROS 2", "Python", "C++", "pytest", "gtest", "launch_testing", "Gazebo", "SIL", "HIL", "FAT", "SAT"],
    interviewDomains: ["Risk and traceability", "Deterministic regression", "Sensor faults", "Customer-site diagnosis", "Safety boundaries"],
    courseDays: [22, 29, 36, 113, 114, 115, 116, 118, 119],
  },
  {
    id: "ros-integration",
    tier: "primary",
    title: "Robotics Application / ROS 2 Integration Engineer",
    timing: "Primary target after a working ROS 2 navigation or manipulation integration, around Days 70–119.",
    fit: "Good match for a systems generalist who enjoys connecting software, sensors, actuators, networks, and customer workflows.",
    portfolioLeverage: [
      "Broad web, mobile, backend, and data integration experience",
      "Practical hardware curiosity and repair mindset",
      "Experience translating product needs into complete systems",
    ],
    gaps: ["ROS 2 graph, tf2, URDF, ros2_control", "Nav2/SLAM or MoveIt integration", "Industrial interfaces and commissioning"],
    proof: ["Sensor-to-actuator ROS 2 stack", "Navigation recovery or manipulation demo", "Documented wiring, calibration, and commissioning runbook"],
    keywords: ["ROS 2", "tf2", "URDF", "ros2_control", "Nav2", "SLAM", "MoveIt", "sensors", "commissioning"],
    interviewDomains: ["Frames and transforms", "QoS and lifecycle", "Bring-up", "Calibration", "Failure recovery", "Field integration"],
    courseDays: [29, 32, 33, 35, 42, 51, 56, 63, 70, 117, 119],
  },
  {
    id: "robotics-software",
    tier: "next",
    title: "Robotics Software Engineer — ROS 2 / AMR",
    timing: "Next target after two credible ROS 2/AMR builds and repeated real or HIL trials.",
    fit: "Achievable specialization, but companies will expect robotics-native C++, math, debugging, and robot behavior evidence—not senior web tenure alone.",
    portfolioLeverage: [
      "Ten years of production engineering habits",
      "Python, algorithms, APIs, data, and distributed-system debugging",
      "Ability to ship and operate complete products",
    ],
    gaps: ["Production C++", "Kinematics, control, planning, and state estimation", "Long-running real-robot or HIL reliability evidence"],
    proof: ["ROS 2 AMR stack", "Planning/recovery behavior tree", "Fifty-trial reliability report with failure taxonomy"],
    keywords: ["C++", "Python", "ROS 2", "Linux", "Nav2", "SLAM", "Gazebo", "behavior trees", "AMR"],
    interviewDomains: ["Memory and concurrency", "Frames and kinematics", "Planning algorithms", "ROS 2 QoS", "Debugging timing and sensor faults"],
    courseDays: [1, 7, 14, 21, 28, 42, 56, 63, 77, 84, 119, 175],
  },
  {
    id: "physical-ai",
    tier: "stretch",
    title: "Robot Learning Deployment / Physical AI Integration Engineer",
    timing: "Stretch target after 9–18 months of robotics evidence; do not position as an ML research scientist.",
    fit: "LLM, RAG, agent/tool workflow, Python, and product deployment experience help at the integration and evaluation layer.",
    portfolioLeverage: [
      "LLM, RAG, agent, tool, and vector-search workflows",
      "Python services and production deployment",
      "End-to-end product and evaluation mindset",
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
  { skill: "Python", days: "Days 22–28, 85–105", startDay: 22, action: "Build tested robot utilities, data pipelines, and policy evaluation code.", terms: ["python", "pytest"] },
  { skill: "C++", days: "Days 22–28", startDay: 22, action: "Build a bounded sensor→controller pipeline with CMake, tests, and deterministic replay.", terms: ["c++", "cpp", "cmake", "gtest"] },
  { skill: "ROS 2", days: "Days 29–56", startDay: 29, action: "Ship and debug multi-node ROS 2 systems using tf2, URDF, QoS, lifecycle, launch, and ros2_control.", terms: ["ros 2", "ros2", "rclcpp", "rclpy", "tf2", "urdf", "ros2_control", "nav2"] },
  { skill: "Linux", days: "Days 22–35", startDay: 22, action: "Practice device permissions, processes, timing, logs, builds, and robot-runtime diagnosis.", terms: ["linux", "bash", "ubuntu", "systemd"] },
  { skill: "Testing", days: "Days 113–119", startDay: 113, action: "Create a risk-linked regression system with pytest, gtest, launch_testing, SIL/HIL, and FAT/SAT.", terms: ["test", "testing", "qa", "regression", "pytest", "gtest", "launch_testing", "sil", "hil", "fat", "sat"] },
  { skill: "Simulation", days: "Days 43–49, 115–116", startDay: 43, action: "Build deterministic Gazebo scenarios, fault injection, and simulation-to-HIL acceptance checks.", terms: ["simulation", "gazebo", "isaac sim", "mujoco", "sil", "hil"] },
  { skill: "Navigation / SLAM", days: "Days 57–70", startDay: 57, action: "Integrate mapping, localization, Nav2 planning, behavior trees, and recovery.", terms: ["navigation", "nav2", "slam", "localization", "mapping", "path planning", "behavior tree"] },
  { skill: "Deployment", days: "Days 106–119, 148–175", startDay: 106, action: "Package, deploy, observe, roll back, commission, and document a robot system.", terms: ["deployment", "commissioning", "customer site", "ota", "rollback", "fat", "sat"] },
  { skill: "Fleet / AMR", days: "Days 106–112, 117", startDay: 106, action: "Implement robot missions, task allocation, traffic, battery/docking, fleet APIs, and VDA5050/Open-RMF boundaries.", terms: ["fleet", "amr", "agv", "task allocation", "traffic management", "vda5050", "vda 5050", "open-rmf", "rmf"] },
  { skill: "Backend / APIs", days: "Days 106–109", startDay: 106, action: "Design idempotent mission APIs and safe cancellation across robot, edge, and cloud.", terms: ["backend", "api", "rest", "fastapi", "microservice", "grpc"] },
  { skill: "Web / Mobile UI", days: "Day 110", startDay: 110, action: "Build a safe operator HMI with telemetry, stale-state indicators, access control, and dead-man teleoperation.", terms: ["react", "flutter", "android", "frontend", "ui", "hmi", "dashboard", "three.js", "threejs"] },
  { skill: "Realtime networking", days: "Days 35, 108–110", startDay: 35, action: "Handle DDS QoS, WebSocket/WebRTC telemetry, cancellation, latency, and reconnects.", terms: ["websocket", "websockets", "webrtc", "dds", "mqtt", "zeromq", "zmq", "real-time", "realtime"] },
  { skill: "Cloud / DevOps", days: "Days 109–112, 169–175", startDay: 109, action: "Containerize edge/cloud services and practice versioned config, CI, canaries, and rollback.", terms: ["docker", "kubernetes", "k8s", "ci/cd", "devops", "cloud", "aws", "gcp"] },
  { skill: "Observability", days: "Days 112, 169–175", startDay: 112, action: "Join logs, metrics, traces, bags, alerts, and SLOs into a repeatable fault investigation.", terms: ["observability", "telemetry", "logging", "metrics", "tracing", "alerting", "slo"] },
  { skill: "Hardware integration", days: "Days 36–56, 148–168", startDay: 36, action: "Wire, calibrate, bring up, diagnose, and safely command sensors, actuators, and compute.", terms: ["hardware", "sensor", "actuator", "motor", "servo", "lidar", "imu", "camera", "calibration", "wiring"] },
  { skill: "Safety", days: "Days 20–21, 118, 148–168", startDay: 20, action: "Apply command limits, e-stop/STO concepts, safety zones, stopping distance, and risk evidence.", terms: ["safety", "e-stop", "estop", "sto", "iso 3691-4", "iso3691", "iso 13849", "risk", "fmea"] },
  { skill: "ML / PyTorch", days: "Days 85–105, 120–147", startDay: 85, action: "Train and evaluate applied robot policies; measure failures and distribution shift.", terms: ["pytorch", "machine learning", "ml", "neural network", "behavior cloning", "imitation learning"] },
  { skill: "LLM / VLA", days: "Days 120–147", startDay: 120, action: "Ground language in safe robot skills with tool contracts, evaluation, guardrails, and recovery.", terms: ["llm", "vla", "vision-language-action", "multimodal", "lerobot", "openvla", "gemini robotics", "gr00t"] },
  { skill: "Databases / messaging", days: "Days 107–109", startDay: 107, action: "Model missions and telemetry with PostgreSQL, Redis, event streams, ordering, and backpressure.", terms: ["postgres", "postgresql", "redis", "kafka", "rabbitmq", "database", "sql", "queue", "messaging", "event stream"] },
  { skill: "Controls / kinematics", days: "Days 1–21, 71–84", startDay: 1, action: "Explain and implement frames, kinematics, PID, planning, and manipulation fundamentals.", terms: ["kinematics", "dynamics", "control", "pid", "jacobian", "motion planning", "moveit"] },
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
