import type { CurriculumDay, Resource } from "./curriculum";
import { topicDetails1 } from "./topic-details-1";
import { topicDetails1b } from "./topic-details-1b";
import { topicDetails1c } from "./topic-details-1c";
import { topicDetails1d } from "./topic-details-1d";
import { topicDetails2 } from "./topic-details-2";
import { topicDetailOverrides } from "./topic-detail-overrides";
import type { TopicDetail } from "./topic-detail-types";

export type LessonExample = { title: string; explanation: string; tryIt: string };
export type LessonPractice = { title: string; task: string; doneWhen: string };
export type LessonQuiz = { question: string; answer: string };
export type LessonMath = {
  title: string;
  meaning: string;
  formula: string;
  latex: string;
  steps: string[];
  check: string;
  connection?: string;
  connectionMarkdown?: string;
};

export type DayLesson = {
  dayId: number; week: number; title: string;
  bigIdea: string; pareto: string[]; simpleExplanation: string[];
  math: LessonMath; examples: LessonExample[]; practice: LessonPractice[];
  quiz: LessonQuiz[]; teachBack: string;
  story: { title: string; body: string; memoryHook: string };
  mistakes: string[]; sources: Resource[]; notice: string;
};

type WeekPack = Omit<DayLesson, "dayId" | "week" | "title" | "practice" | "teachBack" | "notice">;

export const ORIGINAL_SYNTHESIS_NOTICE =
  "Original teaching synthesis by RobotShift. Source links support further study; this lesson does not reproduce book chapters or replace their authors.";

const modernRobotics: Resource = { label: "Modern Robotics — Northwestern", url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/" };
const configurationSpace: Resource = { label: "Modern Robotics — configuration-space topology", url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-3-1-configuration-space-topology/" };
const corkeBook: Resource = { label: "Robotics, Vision and Control (3rd ed.)", url: "https://link.springer.com/book/10.1007/978-3-031-06469-2" };
const roboticsToolbox: Resource = { label: "Robotics Toolbox for Python", url: "https://petercorke.github.io/robotics-toolbox-python/" };
const ros2: Resource = { label: "Official ROS 2 tutorials", url: "https://docs.ros.org/en/jazzy/Tutorials.html" };
const nav2: Resource = { label: "Nav2 documentation", url: "https://docs.nav2.org/" };
const moveIt: Resource = { label: "MoveIt 2 documentation", url: "https://moveit.picknik.ai/main/index.html" };
const cpp: Resource = { label: "C++ Core Guidelines", url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines" };
const opencv: Resource = { label: "OpenCV tutorials", url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html" };
const open3d: Resource = { label: "Open3D documentation", url: "https://www.open3d.org/docs/release/" };
const estimation: Resource = { label: "CMU 16-833 course", url: "https://www.cs.cmu.edu/~16833/" };
const underactuated: Resource = { label: "MIT Underactuated Robotics", url: "https://underactuated.csail.mit.edu/" };
const pytorch: Resource = { label: "PyTorch tutorials", url: "https://pytorch.org/tutorials/" };
const lerobot: Resource = { label: "Hugging Face LeRobot", url: "https://huggingface.co/docs/lerobot/index" };
const openVla: Resource = { label: "OpenVLA project", url: "https://openvla.github.io/" };
const geminiRobotics: Resource = { label: "Google DeepMind Gemini Robotics", url: "https://deepmind.google/models/gemini-robotics/" };
const rosLyrical: Resource = { label: "ROS 2 Lyrical Luth release", url: "https://docs.ros.org/en/lyrical/Releases/Release-Lyrical-Luth.html" };
const rosTesting: Resource = { label: "ROS 2 launch_testing", url: "https://docs.ros.org/en/jazzy/p/launch_testing/" };
const openRmf: Resource = { label: "Open-RMF fleet-adapter integration", url: "https://osrf.github.io/ros2multirobotbook/integration_fleets_adapter_tutorial.html" };
const vda5050: Resource = { label: "Official VDA 5050 specification", url: "https://github.com/VDA5050/VDA5050" };
const lerobot060: Resource = { label: "LeRobot 0.6 release", url: "https://huggingface.co/blog/lerobot-release-v060" };
const groot17: Resource = { label: "NVIDIA Isaac GR00T 1.7", url: "https://developer.nvidia.com/blog/develop-humanoid-robot-policies-end-to-end-with-nvidia-isaac-gr00t/" };
const geminiEr16: Resource = { label: "Gemini Robotics ER 1.6", url: "https://deepmind.google/blog/gemini-robotics-er-1-6/" };
const pi05: Resource = { label: "Physical Intelligence π0.5", url: "https://www.physicalintelligence.company/download/pi05.pdf" };

export const weekLessonPacks: readonly WeekPack[] = [
  {
    bigIdea: "A robot can act correctly only when every number says what it measures, in which unit, and in which coordinate frame.",
    pareto: ["A vector has size and direction.", "A dot product measures alignment.", "A matrix can rotate or move coordinates.", "Transforms compose from one named frame to another."],
    simpleExplanation: ["Draw an arrow for every position or direction.", "Write the frame name beside the arrow.", "Apply transforms in order, then check the units and direction."],
    math: {
      title: "Vector length without fear",
      meaning: "For v = [x,y], x and y are perpendicular distances in metres; ||v|| is the straight-line distance.",
      formula: "||v|| = √(x² + y²)",
      latex: String.raw`\lVert \mathbf{v} \rVert = \sqrt{x^2 + y^2}`,
      steps: ["Square each component.", "Add the squares.", "Take the square root and keep the unit."],
      check: "For v = [3 m, 4 m], ||v|| = √(9 + 16) = 5 m.",
    },
    examples: [
      { title: "Map directions", explanation: "East and north distances form a position vector.", tryIt: "Walk 3 tiles east and 4 north; measure the direct distance." },
      { title: "Phone orientation", explanation: "Screen coordinates rotate when the phone rotates.", tryIt: "Track where the screen's up arrow points after a quarter-turn." },
      { title: "Robot camera", explanation: "A detected cup must be transformed from camera frame to robot frame.", tryIt: "Sketch camera, base, and cup arrows with frame labels." },
    ],
    story: { title: "The multilingual map", body: "Frames are languages. A transform is the translator that stops 'two metres ahead' from meaning two different places.", memoryHook: "No frame, no meaning." },
    mistakes: ["Mixing centimetres and metres.", "Adding vectors expressed in different frames.", "Applying transforms in the wrong order."],
    quiz: [
      { question: "What does a dot product near zero mean?", answer: "The vectors are close to perpendicular." },
      { question: "Why name a coordinate frame?", answer: "The same coordinates can represent different physical points in different frames." },
    ],
    sources: [modernRobotics, corkeBook],
  },
  {
    bigIdea: "Kinematics predicts where a robot can reach from its joint values; it describes motion geometry before forces enter the story.",
    pareto: ["A degree of freedom is one independent motion.", "Forward kinematics maps joints to tool pose.", "A Jacobian maps small joint motion to tool motion.", "Inverse kinematics can have many, one, or no solutions."],
    simpleExplanation: ["Treat each link as a ruler joined by a hinge.", "Rotate and add each ruler from base to tip.", "Respect joint limits and inspect unreachable targets."],
    math: {
      title: "Two-link arm position",
      meaning: "l₁,l₂ are link lengths in metres; θ₁,θ₂ are joint angles; x,y locate the tip in the base frame.",
      formula: "x=l₁cosθ₁+l₂cos(θ₁+θ₂); y=l₁sinθ₁+l₂sin(θ₁+θ₂)",
      latex: String.raw`\begin{aligned}x &= l_1\cos\theta_1 + l_2\cos(\theta_1+\theta_2) \\ y &= l_1\sin\theta_1 + l_2\sin(\theta_1+\theta_2)\end{aligned}`,
      steps: ["Find the first link's x and y parts.", "Use θ₁+θ₂ for the second link.", "Add both link vectors."],
      check: "l₁=l₂=1 m, θ₁=0°, θ₂=90° gives x=1 m, y=1 m.",
    },
    examples: [
      { title: "Desk lamp", explanation: "Its hinges and bars form a serial arm.", tryIt: "Measure two segments and predict the bulb position." },
      { title: "Human arm", explanation: "Shoulder and elbow angles produce hand position.", tryIt: "Find two different elbow shapes that put your hand in one place." },
      { title: "Door handle", explanation: "A revolute joint moves points along circles.", tryIt: "Trace the handle's arc while opening the door." },
    ],
    story: { title: "The chain of rulers", body: "Every joint hands the next link a new direction, like friends passing a compass down a chain.", memoryHook: "Rotate, extend, add." },
    mistakes: ["Using degrees in a function expecting radians.", "Ignoring joint limits or collisions.", "Treating Euler-angle singularity as physical lockup."],
    quiz: [
      { question: "Forward versus inverse kinematics?", answer: "Forward finds pose from joints; inverse finds joints for a desired pose." },
      { question: "Why can inverse kinematics fail?", answer: "The target may be unreachable, constrained, singular, or blocked by limits." },
    ],
    sources: [modernRobotics, configurationSpace, roboticsToolbox],
  },
  {
    bigIdea: "Feedback repeatedly measures error and corrects it, but delays, noise, and actuator limits decide whether the robot settles or oscillates.",
    pareto: ["Error is target minus measurement.", "P reacts now, I repairs persistent bias, D damps fast change.", "Sampling and latency affect stability.", "Commands must be bounded and observable."],
    simpleExplanation: ["Measure where the robot is.", "Compare it with where it should be.", "Apply a limited correction, wait one sample, and measure again."],
    math: {
      title: "PID one-step command",
      meaning: "e is error; Kp, Ki, Kd are gains; Δt is sample time; u is the actuator command.",
      formula: "u = Kp·e + Ki·Σ(eΔt) + Kd·(e-e_prev)/Δt",
      latex: String.raw`u = K_p e + K_i \sum(e\,\Delta t) + K_d \frac{e-e_{\mathrm{prev}}}{\Delta t}`,
      steps: ["Compute present error.", "Update accumulated and changing error.", "Add the three terms, then clamp to a safe limit."],
      check: "Kp=2, Ki=0, Kd=0.5, e=3, e_prev=2, Δt=0.1 gives u=6+5=11 before clamping.",
    },
    examples: [
      { title: "Shower temperature", explanation: "You sense temperature and adjust, but water delay can cause oscillation.", tryIt: "Describe P-like overcorrection while turning the tap." },
      { title: "Cruise control", explanation: "The car adds force when speed falls uphill.", tryIt: "Name the setpoint, measurement, error, and actuator." },
      { title: "Balancing broom", explanation: "Fast observation and correction keep it upright.", tryIt: "Compare balancing while looking versus with eyes closed." },
    ],
    story: { title: "The careful waiter", body: "P reacts to today's complaint, I remembers repeated complaints, and D notices a complaint growing too quickly.", memoryHook: "Now, history, trend." },
    mistakes: ["Tuning gains before fixing units or sign.", "Allowing integral windup during saturation.", "Calling one successful run stable."],
    quiz: [
      { question: "What does negative feedback do?", answer: "It commands action that reduces the measured error." },
      { question: "Why log saturation?", answer: "A controller cannot deliver its requested command beyond the actuator limit." },
    ],
    sources: [underactuated, corkeBook],
  },
  {
    bigIdea: "Robot C++ must own resources clearly, meet timing bounds, stop cleanly, and replay failures—not merely compile.",
    pareto: ["RAII ties cleanup to object lifetime.", "Prefer explicit ownership and small value types.", "Bound queues and cancellation time.", "Tests, sanitizers, logs, and replay make failures repairable."],
    simpleExplanation: ["Give every resource one clear owner.", "Pass data through narrow typed boundaries.", "Make overload, cancellation, and corrupted input normal test cases."],
    math: {
      title: "Queue capacity from rate",
      meaning: "r is incoming items per second; t is tolerated stall time in seconds; B is the minimum item capacity.",
      formula: "B ≥ r × t",
      latex: String.raw`B \ge r t`,
      steps: ["Measure worst sustained input rate.", "Choose the largest tolerated processing stall.", "Multiply and round up, then define overflow behavior."],
      check: "At 100 messages/s with a 0.20 s stall, B ≥ 20 messages.",
    },
    examples: [
      { title: "Seat-belt latch", explanation: "RAII acquires and releases a resource as one lifetime.", tryIt: "List open/close pairs in a sensor driver." },
      { title: "Checkout queue", explanation: "An unbounded queue hides overload until memory fails.", tryIt: "Decide whether to drop oldest, newest, or stop." },
      { title: "Emergency stop", explanation: "Cancellation must interrupt waiting work predictably.", tryIt: "Measure time from stop request to quiet output." },
    ],
    story: { title: "The labelled toolbox", body: "Every tool has one owner, a return place, and an inspection record; a loose tool can jam the machine.", memoryHook: "Own, bound, cancel, replay." },
    mistakes: ["Sharing raw pointers without lifetime rules.", "Using sleep as timing control.", "Testing only the happy path."],
    quiz: [
      { question: "What problem does RAII solve?", answer: "It releases resources automatically when the owning object leaves scope." },
      { question: "Why bound a queue?", answer: "To make overload behavior finite, measurable, and intentional." },
    ],
    sources: [cpp],
  },
  {
    bigIdea: "ROS 2 is a distributed graph: interface design, QoS, timeouts, and observability matter as much as node code.",
    pareto: ["Topics stream; services answer briefly; actions manage long cancelable work.", "Messages need clear semantics and units.", "QoS must match the data's purpose.", "Inspect the live graph before guessing."],
    simpleExplanation: ["Split the system into named jobs.", "Choose the communication pattern from the job's lifetime.", "Test missing, late, duplicated, and canceled communication."],
    math: {
      title: "Rate and period",
      meaning: "f is frequency in hertz (messages/s); T is the time between messages in seconds.",
      formula: "T = 1 / f",
      latex: String.raw`T = \frac{1}{f}`,
      steps: ["Write the required update rate.", "Divide one second by that rate.", "Compare the period with observed timestamps and deadline."],
      check: "At 20 Hz, T=1/20=0.05 s=50 ms.",
    },
    examples: [
      { title: "Radio station", explanation: "A topic broadcasts; listeners can join without a reply.", tryIt: "Model temperature telemetry as a topic." },
      { title: "Information desk", explanation: "A service handles one short question and answer.", tryIt: "Model a calibration-status query." },
      { title: "Food delivery", explanation: "An action has a goal, progress, result, and cancellation.", tryIt: "Map them to a robot navigation goal." },
    ],
    story: { title: "The robot city", body: "Nodes are shops, interfaces are roads, and QoS is the delivery contract. A city without street signs is impossible to debug.", memoryHook: "Graph, contract, observe." },
    mistakes: ["Using a service for long work.", "Assuming reliable always means better.", "Debugging code before checking graph and timestamps."],
    quiz: [
      { question: "When should you use an action?", answer: "For long-running work needing feedback, result, timeout, or cancellation." },
      { question: "What is QoS?", answer: "Communication policies such as reliability, history, durability, and deadline." },
    ],
    sources: [ros2, rosLyrical],
  },
  {
    bigIdea: "URDF describes the body; tf2 describes where frames are over time. A correct frame tree makes sensor and tool data comparable.",
    pareto: ["Links are rigid bodies and joints connect them.", "Visual, collision, and inertia serve different jobs.", "tf2 edges need parent, child, pose, and time.", "A transform lookup can fail even when both frames exist."],
    simpleExplanation: ["Name each rigid part.", "Connect parts with the correct joint.", "Publish joint state and verify every frame, direction, and timestamp in RViz."],
    math: {
      title: "Compose two simple translations",
      meaning: "x_AB is B's position seen from A; x_BC is C from B; x_AC is C from A.",
      formula: "x_AC = x_AB + x_BC (when axes are aligned)",
      latex: String.raw`x_{AC} = x_{AB} + x_{BC}`,
      steps: ["Trace the frame path A→B→C.", "Express both steps along the same axis.", "Add and verify the reverse transform has opposite sign."],
      check: "Base is 2.0 m from map and tool is 0.4 m from base, so tool is 2.4 m from map.",
    },
    examples: [
      { title: "Skeleton", explanation: "Bones are links and joints define allowed motion.", tryIt: "Draw a two-link finger tree." },
      { title: "Car GPS", explanation: "A roof antenna has a fixed transform from the car base.", tryIt: "Predict position error if antenna offset is ignored." },
      { title: "Camera on wrist", explanation: "Its pose changes through all arm joints.", tryIt: "Trace base→shoulder→wrist→camera." },
    ],
    story: { title: "The family tree", body: "Every frame has one parent; to relate cousins, walk up and down the tree at the same moment.", memoryHook: "Path plus time equals transform." },
    mistakes: ["Creating multiple parents for one frame.", "Swapping parent and child.", "Ignoring timestamps during lookup."],
    quiz: [
      { question: "URDF versus tf2?", answer: "URDF models robot structure; tf2 provides spatial relationships over time." },
      { question: "Why can old sensor data break lookup?", answer: "The transform buffer may not contain a transform for that timestamp." },
    ],
    sources: [ros2, modernRobotics],
  },
  {
    bigIdea: "Simulation is useful when time, physics, sensors, noise, and replay are controlled well enough to reproduce both success and failure.",
    pareto: ["Physics timestep affects stability.", "Differential drive comes from two wheel speeds.", "Sensor timestamps must share a time story.", "Bags plus fixed scenarios turn bugs into replayable evidence."],
    simpleExplanation: ["Build the smallest world that tests one behavior.", "Add realistic rates and noise deliberately.", "Record inputs and outputs so the exact run can be repeated."],
    math: {
      title: "Differential-drive motion",
      meaning: "r is wheel radius; L is wheel spacing; ωR,ωL are wheel angular speeds; v is forward speed; Ω is turn rate.",
      formula: "v=r(ωR+ωL)/2; Ω=r(ωR-ωL)/L",
      latex: String.raw`\begin{aligned}v &= \frac{r(\omega_R+\omega_L)}{2} \\ \Omega &= \frac{r(\omega_R-\omega_L)}{L}\end{aligned}`,
      steps: ["Convert both wheel speeds to edge speeds.", "Average for forward speed.", "Use their difference over wheel spacing for turn rate."],
      check: "r=0.1 m, L=0.5 m, ωR=6, ωL=4 rad/s gives v=0.5 m/s and Ω=0.4 rad/s.",
    },
    examples: [
      { title: "Shopping trolley", explanation: "Two driven sides set forward and turning motion.", tryIt: "Predict the turn when the right wheel is faster." },
      { title: "Video replay", explanation: "A rosbag replays sensor history like match footage.", tryIt: "Name topics required to reproduce a stop." },
      { title: "Noisy ruler", explanation: "Sensors vary even for an unchanged object.", tryIt: "Measure one distance ten times and plot spread." },
    ],
    story: { title: "The rehearsal stage", body: "Simulation is rehearsal: useful only when stage marks, timing, and mistakes are recorded exactly.", memoryHook: "Control the world; replay the failure." },
    mistakes: ["Confusing simulation time with wall time.", "Using unrealistically perfect sensors.", "Changing a scenario while comparing results."],
    quiz: [
      { question: "If both wheels move equally, what is Ω?", answer: "Zero; the robot travels straight." },
      { question: "Why record timestamps?", answer: "They let consumers align measurements that arrive at different times." },
    ],
    sources: [ros2, roboticsToolbox],
  },
  {
    bigIdea: "A navigation or manipulation stack is an execution pipeline whose value is safe, measurable recovery—not one ideal demo.",
    pareto: ["Represent obstacles before planning.", "Separate goal planning from local execution.", "Every goal needs timeout and cancellation.", "Measure success, time, path, and recoveries over varied trials."],
    simpleExplanation: ["Give the robot a goal and a map of forbidden space.", "Plan, execute, and watch progress.", "When blocked, stop safely, diagnose, and choose retry, replan, or abort."],
    math: {
      title: "Minimum travel-time estimate",
      meaning: "d is path length in metres; v is average safe speed in m/s; t is ideal travel time in seconds.",
      formula: "t = d / v",
      latex: String.raw`t = \frac{d}{v}`,
      steps: ["Measure planned path length.", "Choose a safe realistic average speed.", "Divide, then add a separate timeout margin for turns and recovery."],
      check: "A 6 m path at 0.5 m/s needs at least 12 s; a 5 s timeout cannot succeed.",
    },
    examples: [
      { title: "Vacuum cleaner", explanation: "It replans when furniture blocks its route.", tryIt: "List stop, back-up, and replan states." },
      { title: "Warehouse picker", explanation: "Collision geometry prevents the arm hitting a shelf.", tryIt: "Sketch a padded collision box." },
      { title: "Lift journey", explanation: "A request needs progress, timeout, cancellation, and fallback.", tryIt: "Map the journey to action states." },
    ],
    story: { title: "The mountain guide", body: "A planner chooses a route; a controller watches each step; recovery rules decide what to do when the trail closes.", memoryHook: "Plan, watch, recover." },
    mistakes: ["Judging from one successful run.", "Ignoring dynamic obstacles or stale maps.", "Retrying forever without a budget."],
    quiz: [
      { question: "Planner versus controller?", answer: "The planner chooses a route or motion; the controller tracks it using live feedback." },
      { question: "What makes a recovery credible?", answer: "A detected failure, bounded response, measurable outcome, and safe abort path." },
    ],
    sources: [nav2, moveIt],
  },
  {
    bigIdea: "Robot vision turns pixels into observations with calibrated geometry, uncertainty, latency, and measured false positives.",
    pareto: ["Pixels are measurements, not objects.", "Calibration connects image coordinates to rays.", "Start with reliable geometric baselines.", "Evaluate precision, recall, latency, and bad cases."],
    simpleExplanation: ["Control lighting and collect labelled examples.", "Detect a simple visual pattern.", "Convert it to a pose only after calibration, then test misses and false alarms."],
    math: {
      title: "Precision and recall",
      meaning: "TP is correct detections; FP is false alarms; FN is missed objects.",
      formula: "precision=TP/(TP+FP); recall=TP/(TP+FN)",
      latex: String.raw`\begin{aligned}\mathrm{precision} &= \frac{TP}{TP+FP} \\ \mathrm{recall} &= \frac{TP}{TP+FN}\end{aligned}`,
      steps: ["Count correct detections.", "Count false alarms and misses separately.", "Compute both ratios; never hide one behind the other."],
      check: "TP=8, FP=2, FN=4 gives precision=80% and recall≈66.7%.",
    },
    examples: [
      { title: "Barcode scanner", explanation: "A strong pattern makes detection reliable.", tryIt: "Test a code at five angles." },
      { title: "Traffic light", explanation: "Color alone fails under glare; shape and context help.", tryIt: "Compare RGB and HSV thresholds." },
      { title: "Tabletop marker", explanation: "A fiducial provides identity and pose.", tryIt: "Record pose jitter while the marker stays still." },
    ],
    story: { title: "The imperfect witness", body: "A camera reports clues, not truth. Calibration and evaluation cross-examine the witness.", memoryHook: "Pixels need proof." },
    mistakes: ["Evaluating on training images.", "Reporting confidence as accuracy.", "Ignoring calibration and latency."],
    quiz: [
      { question: "High precision but low recall means what?", answer: "Most reported detections are right, but many real objects are missed." },
      { question: "Why calibrate a camera?", answer: "To relate pixel measurements to geometric rays and correct lens distortion." },
    ],
    sources: [opencv, corkeBook],
  },
  {
    bigIdea: "Depth gives geometry, but useful 3D targets require filtering, transforms, segmentation, calibration, and explicit handling of missing measurements.",
    pareto: ["A depth pixel estimates distance along a camera ray.", "Point clouds must be transformed into a useful frame.", "Downsample before expensive processing.", "Reflective, transparent, and occluded surfaces create holes."],
    simpleExplanation: ["Turn depth pixels into 3D points.", "Remove noise and the supporting plane.", "Transform the remaining object geometry into the robot base frame."],
    math: {
      title: "Pixel plus depth to 3D",
      meaning: "u is pixel column; cₓ is image centre; Z is depth in metres; fₓ is focal length in pixels; X is sideways metres.",
      formula: "X = (u-cₓ)Z/fₓ",
      latex: String.raw`X = \frac{(u-c_x)Z}{f_x}`,
      steps: ["Subtract the image centre from the pixel.", "Multiply by measured depth.", "Divide by focal length and keep the camera-frame label."],
      check: "u=420, cₓ=320, Z=2 m, fₓ=500 gives X=0.4 m.",
    },
    examples: [
      { title: "Flashlight rays", explanation: "Each pixel follows a ray spreading from the camera.", tryIt: "Draw a farther point on the same ray." },
      { title: "Table removal", explanation: "Plane segmentation separates tabletop from objects.", tryIt: "Fit a flat board using three measured points." },
      { title: "Shiny spoon", explanation: "Reflective surfaces can return missing or wrong depth.", tryIt: "Compare depth on cardboard and metal." },
    ],
    story: { title: "The floating dust cloud", body: "A point cloud is dust until frames, filters, and surfaces give it shape and meaning.", memoryHook: "Depth, frame, filter, target." },
    mistakes: ["Using millimetres as metres.", "Planning in camera coordinates by accident.", "Treating missing depth as zero distance."],
    quiz: [
      { question: "Why voxel-downsample?", answer: "To reduce point count while preserving useful shape at a chosen resolution." },
      { question: "What is extrinsic calibration?", answer: "The rigid transform between two sensor or robot frames." },
    ],
    sources: [open3d, corkeBook],
  },
  {
    bigIdea: "State estimation combines an imperfect motion prediction with imperfect measurements while carrying honest uncertainty.",
    pareto: ["State is what must be inferred.", "Prediction usually increases uncertainty.", "A measurement corrects belief according to its noise.", "Outliers and dropouts require explicit policy."],
    simpleExplanation: ["Predict where motion should have taken the robot.", "Compare a sensor measurement with that prediction.", "Trust each according to uncertainty, then publish estimate plus covariance."],
    math: {
      title: "One-dimensional Kalman update",
      meaning: "P is prior variance; R is sensor variance; K is measurement trust; x⁻ is prediction; z is measurement.",
      formula: "K=P/(P+R); x=x⁻+K(z-x⁻)",
      latex: String.raw`\begin{aligned}K &= \frac{P}{P+R} \\ x &= x^- + K(z-x^-)\end{aligned}`,
      steps: ["Compute K from the two uncertainties.", "Find measurement surprise z-x⁻.", "Apply K times that surprise to the prediction."],
      check: "P=4, R=1, x⁻=10 m, z=12 m gives K=0.8 and x=11.6 m.",
    },
    examples: [
      { title: "Finding a friend", explanation: "Walking directions predict location; a landmark corrects it.", tryIt: "Say when you trust the landmark less." },
      { title: "Bathroom scale", explanation: "Repeated noisy readings reveal measurement spread.", tryIt: "Compute a mean and range from ten readings." },
      { title: "Phone navigation", explanation: "IMU is fast but drifts; GPS is slower but anchors position.", tryIt: "Predict behavior inside a tunnel." },
    ],
    story: { title: "The cautious detective", body: "Prediction is one witness, measurement another; covariance records how believable each story is.", memoryHook: "Predict, compare, correct, doubt." },
    mistakes: ["Treating covariance as optional decoration.", "Trusting every measurement equally.", "Confusing low noise with zero bias."],
    quiz: [
      { question: "What happens to K when R is very large?", answer: "K becomes small, so the estimate trusts the prediction more." },
      { question: "Why can odometry drift?", answer: "Small motion errors accumulate without an absolute correction." },
    ],
    sources: [estimation, corkeBook],
  },
  {
    bigIdea: "Autonomy closes a loop: perceive, estimate, plan, control, observe, and move to a safe state when any link becomes untrustworthy.",
    pareto: ["Plan in configuration space, not only workspace pictures.", "A* balances cost-so-far and estimated cost-to-go.", "Tracking needs feedback.", "A state machine makes transitions and failure handling inspectable."],
    simpleExplanation: ["Convert sensed obstacles into forbidden robot configurations.", "Choose a safe route.", "Track it while checking progress and safety; stop or replan when assumptions fail."],
    math: {
      title: "A* priority",
      meaning: "g(n) is known cost from start; h(n) estimates cost to goal; f(n) ranks the next node.",
      formula: "f(n) = g(n) + h(n)",
      latex: String.raw`f(n) = g(n) + h(n)`,
      steps: ["Record cost already paid.", "Estimate remaining cost without overestimating for optimal A*.", "Expand the smallest total f."],
      check: "Node A: g=4,h=5 gives f=9; B: g=6,h=2 gives f=8, so B is tried first.",
    },
    examples: [
      { title: "Moving a sofa", explanation: "The sofa's shape turns free floor into configuration-space restrictions.", tryIt: "Compare moving it lengthwise versus sideways." },
      { title: "Route planner", explanation: "A* favours promising roads while retaining known travel cost.", tryIt: "Rank three routes with g and h." },
      { title: "Elevator controller", explanation: "Explicit states prevent conflicting actions.", tryIt: "Draw idle, moving, door-open, and fault transitions." },
    ],
    story: { title: "The relay team", body: "Each runner passes evidence to the next; a dropped baton must trigger a safe stop, not blind running.", memoryHook: "Sense to state to plan to act." },
    mistakes: ["Checking only the robot centre for collision.", "Planning once and ignoring changed observations.", "Mixing planning failure with control failure."],
    quiz: [
      { question: "What is configuration space?", answer: "The space of all robot configurations, with obstacles representing forbidden configurations." },
      { question: "Why use a state machine?", answer: "It makes legal transitions, recovery, and current execution state explicit." },
    ],
    sources: [configurationSpace, underactuated],
  },
  {
    bigIdea: "A useful neural model is a measured function from robot observations to outputs; data splits and baselines matter more than impressive training loss.",
    pareto: ["Tensor shapes are contracts.", "Autograd computes gradients from a scalar loss.", "Validation data must not guide training examples.", "Record seeds, configuration, checkpoint, latency, and errors."],
    simpleExplanation: ["Prepare examples with known input and answer.", "Let the model predict, measure error, and adjust weights.", "Test untouched examples and compare with a simple baseline."],
    math: {
      title: "Mean squared error",
      meaning: "ŷᵢ is prediction; yᵢ is target; n is example count; MSE penalizes squared numeric error.",
      formula: "MSE = Σ(ŷᵢ-yᵢ)² / n",
      latex: String.raw`\mathrm{MSE} = \frac{1}{n}\sum_{i=1}^{n}(\hat y_i-y_i)^2`,
      steps: ["Subtract each target from prediction.", "Square errors so signs cannot cancel.", "Add and divide by count."],
      check: "Predictions [2,4], targets [3,2] give MSE=((−1)²+2²)/2=2.5.",
    },
    examples: [
      { title: "Sorting fruit", explanation: "Images map to class labels.", tryIt: "Make train and held-out piles before learning." },
      { title: "Hand-eye target", explanation: "An image can map to x,y pose.", tryIt: "Compare model error with always predicting the centre." },
      { title: "Thermostat data", explanation: "Past readings can predict a continuous value.", tryIt: "Write input and output tensor shapes." },
    ],
    story: { title: "The apprentice", body: "The model practises from examples; the exam must contain genuinely unseen problems or the score is meaningless.", memoryHook: "Shapes, loss, split, baseline." },
    mistakes: ["Leaking near-duplicate scenes across splits.", "Ignoring a trivial baseline.", "Reporting best validation result without fixed test evaluation."],
    quiz: [
      { question: "Why keep a held-out set?", answer: "To estimate performance on unseen data without tuning to it." },
      { question: "What does backpropagation produce?", answer: "Gradients showing how the loss changes with each trainable parameter." },
    ],
    sources: [pytorch],
  },
  {
    bigIdea: "A robot-learning dataset is synchronized evidence: observations, actions, timestamps, task context, outcomes, and quality—not a folder of videos.",
    pareto: ["An episode is one attempt with a clear boundary.", "Observation and action time must align.", "Include failed and varied demonstrations intentionally.", "Freeze schema, version, splits, and quality review."],
    simpleExplanation: ["Define one task and success rule.", "Record what the robot saw, state, and command at each time.", "Review complete episodes, label quality, then freeze a version."],
    math: {
      title: "Samples and duration",
      meaning: "N is sample count; f is sampling rate in Hz; t is episode duration in seconds.",
      formula: "t = N / f",
      latex: String.raw`t = \frac{N}{f}`,
      steps: ["Count synchronized samples.", "Confirm the actual rate from timestamps.", "Divide and compare with video duration."],
      check: "600 samples at 20 Hz represent 30 s; a 26 s video signals timing mismatch.",
    },
    examples: [
      { title: "Driving lesson", explanation: "Road view and steering command must share time.", tryIt: "Describe the label error from a 0.5 s shift." },
      { title: "Cooking recipe", explanation: "An episode has start, actions, outcome, and failure notes.", tryIt: "Define start/end for pick-and-place." },
      { title: "Sports replay", explanation: "Multiple angles and timestamps make action review possible.", tryIt: "Choose three streams to inspect together." },
    ],
    story: { title: "The robot's diary", body: "A useful diary records what happened, when, why, and how it ended; missing pages teach the wrong lesson.", memoryHook: "Aligned, varied, reviewed, versioned." },
    mistakes: ["Recording video without robot state/action.", "Deleting all failures.", "Randomly splitting adjacent frames across train and test."],
    quiz: [
      { question: "Episode versus trajectory?", answer: "An episode is one bounded attempt; its trajectory is the time-ordered state/observation/action sequence." },
      { question: "Why preserve failed demonstrations?", answer: "They reveal coverage, operator, and system problems and prevent dishonest quality estimates." },
    ],
    sources: [lerobot],
  },
  {
    bigIdea: "Imitation learning copies demonstrated action choices, but small errors move the robot into states absent from training and can compound.",
    pareto: ["Behavior cloning is supervised observation-to-action learning.", "Rollout success is the real test.", "Temporal context disambiguates motion.", "Action chunks trade reactivity for smoother coherent motion."],
    simpleExplanation: ["Show many good task attempts.", "Train the policy to predict demonstrated actions.", "Run fixed trials safely and collect the new failure states."],
    math: {
      title: "Compounding step reliability",
      meaning: "p is success probability per decision; N is required decisions; pᴺ is an illustrative all-correct probability.",
      formula: "P(all correct) = pᴺ",
      latex: String.raw`P(\text{all correct}) = p^N`,
      steps: ["Estimate per-step correctness only as a simple model.", "Count dependent decisions.", "Raise p to N and verify with actual rollouts."],
      check: "At p=0.98 for 20 decisions, 0.98²⁰≈0.668: small errors can strongly reduce full-task success.",
    },
    examples: [
      { title: "Copying handwriting", explanation: "A copied stroke that starts wrong makes later strokes harder.", tryIt: "Draw a maze while copying delayed directions." },
      { title: "Lane keeping", explanation: "Expert data near lane centre may omit recovery states.", tryIt: "List examples needed after drifting left." },
      { title: "Folding cloth", explanation: "Several future actions form one coherent chunk.", tryIt: "Compare one-step and five-step commands." },
    ],
    story: { title: "Following footprints", body: "The policy follows expert footprints; one missed print places it where no footprints exist.", memoryHook: "Copying needs recovery coverage." },
    mistakes: ["Selecting models only by offline loss.", "Testing on training starts.", "Ignoring inference latency and safe fallback."],
    quiz: [
      { question: "What is covariate shift?", answer: "The policy visits observations that differ from the expert training distribution." },
      { question: "Why action chunks?", answer: "They model coordinated temporal behavior and can smooth execution, but reduce immediate reactivity." },
    ],
    sources: [lerobot],
  },
  {
    bigIdea: "Production robots need explicit contracts from robot to edge to fleet to operator, plus bounded behavior when any network, service, or robot disappears.",
    pareto: ["Keep fast safety and motion authority local.", "Model missions and allocation as observable state machines.", "Make APIs idempotent and commands expiring.", "Ship telemetry, canaries, rollback, and fault evidence with the feature."],
    simpleExplanation: ["Draw who owns each decision and what happens on disconnect.", "Move missions through named states with one durable identity.", "Measure age, lag, recovery, and rollback instead of trusting a green dashboard."],
    math: {
      title: "Backlog growth under overload",
      meaning: "r_in is incoming events per second, r_out is processed events per second, t is elapsed seconds, and B is queued events.",
      formula: "B = max(0, r_in − r_out) × t",
      latex: String.raw`B = \max(0, r_{\mathrm{in}}-r_{\mathrm{out}})\,t`,
      steps: ["Measure sustained input and processing rates.", "Subtract processing capacity from input rate.", "Multiply by time, then define a bounded overload response."],
      check: "At 200 incoming and 150 processed events/s, 60 s creates 3,000 queued events unless work is shed or capacity changes.",
    },
    examples: [
      { title: "Two delivery robots", explanation: "An allocator considers capability, battery, traffic, docking, and priority rather than only nearest distance.", tryIt: "Assign three missions, then disconnect the selected robot." },
      { title: "Restaurant order ticket", explanation: "A repeated numbered request checks the same mission instead of creating duplicates.", tryIt: "Retry one mission before and after acknowledgment." },
      { title: "Fleet canary", explanation: "One robot receives a pinned update while health gates prevent a bad release reaching the rest.", tryIt: "Define three stop-rollout signals and a complete rollback bundle." },
    ],
    story: { title: "The warehouse nervous system", body: "Robots are muscles, edge computers are reflexes, fleet services coordinate movement, and the cloud remembers. A severed connection must not turn memory loss into unsafe motion.", memoryHook: "Own, expire, observe, recover." },
    mistakes: ["Putting cloud round trips in a safety loop.", "Treating HTTP acceptance as physical completion.", "Using an unbounded queue to hide overload."],
    quiz: [
      { question: "Why must a mission create call be idempotent?", answer: "A timeout and retry must refer to one mission rather than causing duplicate physical work." },
      { question: "What state should the HMI show?", answer: "Requested, accepted, and physically observed state with freshness, authority, and failure clearly distinguished." },
    ],
    sources: [openRmf, vda5050],
  },
  {
    bigIdea: "A deployable robot is proven through risk-linked requirements, layered regression, realistic fault injection, and signed acceptance evidence—not a successful demo.",
    pareto: ["Trace important requirements and hazards to tests and results.", "Use component, integration, launch, SIL/HIL, and system layers for different risks.", "Inject timing, sensor, network, and recovery failures deliberately.", "FAT, SAT, commissioning, and incident reports keep field truth connected to engineering."],
    simpleExplanation: ["Turn words like safe and reliable into measurable bounds.", "Rehearse failures in simulation and HIL before restricted-energy hardware tests.", "Keep failed results, corrective action, and go/no-go decisions linked."],
    math: {
      title: "Illustrative stopping-distance bound",
      meaning: "v is speed, t_react is detection plus command latency, a is positive braking deceleration, and d is reaction plus braking distance before margin.",
      formula: "d = v × t_react + v² / (2a)",
      latex: String.raw`d = v t_{\mathrm{react}} + \frac{v^2}{2a}`,
      steps: ["Measure the worst credible reaction delay.", "Add braking distance at the tested load and surface.", "Add the engineering margin required by the risk assessment and validate physically."],
      check: "At 1 m/s, 0.15 s reaction, and 1.5 m/s² deceleration, d≈0.15+0.33=0.48 m before margin.",
    },
    examples: [
      { title: "Airport checkpoints", explanation: "A component can pass alone while the integrated traveler journey still fails.", tryIt: "Place one fault at component, integration, launch, and mission level." },
      { title: "Frozen lidar clock", explanation: "A realistic scan with an old timestamp must trigger a defined stale-data response.", tryIt: "Pause a 50 Hz input for 120 ms and verify the 100 ms freshness bound." },
      { title: "Customer warehouse", explanation: "SAT exposes Wi-Fi, floor, aisle, PLC, and operator conditions absent from the factory.", tryIt: "Turn one site difference into a predeclared acceptance test." },
    ],
    story: { title: "The flight-test ladder", body: "Each rung adds realism and risk: component, integration, simulation, HIL, restricted hardware, and site. Skipping rungs turns unknowns into field incidents.", memoryHook: "Trace, inject, measure, accept." },
    mistakes: ["Counting tests instead of covering risks.", "Moving thresholds after seeing results.", "Calling a guessed cause a root cause."],
    quiz: [
      { question: "Why can HIL not replace a real restricted-energy test?", answer: "It includes real compute and interfaces but not every load, contact, cable, power, actuator, brake, or environmental effect." },
      { question: "What should a failed FAT safety case do?", answer: "Block shipment until the failure, corrective action, and linked regression evidence meet the agreed acceptance rule." },
    ],
    sources: [rosTesting, openRmf, vda5050],
  },
  {
    bigIdea: "A vision-language-action system conditions physical action on images and language, but grounding and controllers must connect tokens to the real robot safely.",
    pareto: ["A VLM describes or reasons; a VLA also outputs robot actions.", "Language must refer to perceived entities.", "Action representation depends on embodiment.", "Generalization claims need held-out objects, scenes, and instructions."],
    simpleExplanation: ["Encode what the robot sees and what the person asks.", "Fuse that context into an action proposal.", "Decode for this robot, validate it, and execute through a safe controller."],
    math: {
      title: "Normalize an action",
      meaning: "a is a physical action; a_min,a_max are calibrated limits; a_norm maps it approximately to −1…1.",
      formula: "a_norm = 2(a-a_min)/(a_max-a_min) - 1",
      latex: String.raw`a_{\mathrm{norm}} = 2\frac{a-a_{\min}}{a_{\max}-a_{\min}} - 1`,
      steps: ["Record physical minimum and maximum.", "Subtract the minimum and divide by range.", "Scale to −1…1; clip and preserve the inverse mapping."],
      check: "For a=0.75 m, range 0…1 m, a_norm=2(0.75)-1=0.5.",
    },
    examples: [
      { title: "Follow 'red mug'", explanation: "Language selects one entity among visual candidates.", tryIt: "List ambiguities if two mugs are red." },
      { title: "Different arms", explanation: "The same instruction needs different joint actions.", tryIt: "Separate shared goal from robot-specific decoder." },
      { title: "Kitchen request", explanation: "Long language goals require several grounded skills.", tryIt: "Decompose 'put the cup in the sink'." },
    ],
    story: { title: "The interpreter with hands", body: "Vision supplies nouns, language supplies intent, and the action decoder turns the sentence into movements for one body.", memoryHook: "See, ground, decode, guard." },
    mistakes: ["Calling text planning direct motor control.", "Ignoring robot-specific action normalization.", "Testing only paraphrases in one scene."],
    quiz: [
      { question: "VLM versus VLA?", answer: "A VLM produces language-like understanding; a VLA maps visual-language context to physical actions." },
      { question: "What is grounding?", answer: "Connecting language references and goals to perceived real entities and states." },
    ],
    sources: [geminiRobotics],
  },
  {
    bigIdea: "Adapting an open VLA is mainly a data, normalization, interface, and evaluation job; LoRA avoids retraining every model weight.",
    pareto: ["Inspect the pretrained action format before adapting.", "Match observation and action statistics.", "LoRA trains small low-rank updates.", "Freeze a held-out suite before comparing checkpoints."],
    simpleExplanation: ["Run the original checkpoint end to end.", "Convert your dataset into its expected schema and scales.", "Fine-tune small adapters, then test new scenes without moving the goalposts."],
    math: {
      title: "Why LoRA is smaller",
      meaning: "d_in,d_out are layer dimensions; r is small adapter rank; full and LoRA counts compare trainable weights.",
      formula: "full=d_in·d_out; LoRA=r(d_in+d_out)",
      latex: String.raw`\begin{aligned}\text{full} &= d_{\mathrm{in}}d_{\mathrm{out}} \\ \text{LoRA} &= r(d_{\mathrm{in}}+d_{\mathrm{out}})\end{aligned}`,
      steps: ["Multiply dimensions for a full matrix.", "Add dimensions and multiply by rank for LoRA.", "Compare counts and verify actual framework configuration."],
      check: "For 1024×1024 and r=8: full=1,048,576; LoRA=16,384 weights, about 64× fewer.",
    },
    examples: [
      { title: "Universal remote", explanation: "A pretrained model needs a device-specific mapping.", tryIt: "List robot-specific inputs and outputs." },
      { title: "Accent coaching", explanation: "Small adaptation changes usage without relearning language.", tryIt: "Separate general skill from local task data." },
      { title: "Tool calibration", explanation: "Wrong normalization makes correct-looking outputs physically wrong.", tryIt: "Round-trip one action through encode/decode." },
    ],
    story: { title: "The skilled visitor", body: "The model arrives with broad experience but needs a short local handbook for this body and workplace.", memoryHook: "Reuse skill; adapt interface." },
    mistakes: ["Fine-tuning before baseline inference works.", "Mixing action units or normalization.", "Reporting only training loss."],
    quiz: [
      { question: "What does LoRA train?", answer: "Small low-rank matrices that modify selected frozen model layers." },
      { question: "Why test out-of-distribution prompts?", answer: "To learn whether adaptation generalizes beyond wording and scenes seen in training." },
    ],
    sources: [openVla, lerobot, lerobot060, groot17, geminiEr16, pi05],
  },
  {
    bigIdea: "An agent should plan with typed, bounded robot skills—not free-form motor commands—and monitor every precondition, result, timeout, and recovery.",
    pareto: ["Break goals into observable subgoals.", "A skill has typed inputs, preconditions, effects, and failure codes.", "World state must come from perception.", "Retries need budgets, idempotency, and human handoff."],
    simpleExplanation: ["Translate the request into a short skill plan.", "Check the world and safety conditions before each skill.", "Execute, observe the result, and replan or stop from a named failure."],
    math: {
      title: "Long-plan reliability",
      meaning: "pᵢ is the measured success rate of skill i; multiplying gives a simple independent-skill estimate.",
      formula: "P(plan success) ≈ p₁×p₂×…×pₙ",
      latex: String.raw`P(\text{plan success}) \approx \prod_{i=1}^{n}p_i`,
      steps: ["Measure each skill on relevant conditions.", "Multiply only as a rough independence model.", "Use end-to-end trials because failures can be related."],
      check: "Four skills at 95% each give 0.95⁴≈81.5%, not 95% task success.",
    },
    examples: [
      { title: "Restaurant order", explanation: "A goal becomes ordered jobs with checks and receipts.", tryIt: "Write preconditions for serving a drink." },
      { title: "File migration", explanation: "Idempotent steps can safely retry.", tryIt: "Name a robot skill unsafe to repeat blindly." },
      { title: "Airport connection", explanation: "A missed step changes the remaining plan.", tryIt: "Add timeout and alternate route." },
    ],
    story: { title: "The conductor", body: "The agent cues skilled musicians; it does not invent how to build a violin during the concert.", memoryHook: "Reason over skills, not motors." },
    mistakes: ["Letting language output bypass validation.", "Retrying non-idempotent actions.", "Using remembered world state after the scene changes."],
    quiz: [
      { question: "What belongs in a typed skill?", answer: "Input schema, preconditions, bounded behavior, observable result, and failure codes." },
      { question: "Why monitor execution?", answer: "A valid plan can fail when the real world differs from its assumptions." },
    ],
    sources: [geminiRobotics, ros2],
  },
  {
    bigIdea: "Robot safety is a separate enforced layer: semantic intelligence may propose actions, but validators, controllers, watchdogs, and humans bound them.",
    pareto: ["Validate action type, workspace, speed, force, and state.", "Treat environmental text as untrusted.", "Test adversarial scenes and recovery.", "Count unsafe attempts and interventions, not only successes."],
    simpleExplanation: ["Define what the robot may never do.", "Check every proposed action before execution.", "Stop on stale state, violated limits, or uncertain grounding, then record the cause."],
    math: {
      title: "Stopping-distance budget",
      meaning: "v is speed; t_r is detection/reaction delay; a is positive braking deceleration; d is minimum ideal stopping distance.",
      formula: "d = v·t_r + v²/(2a)",
      latex: String.raw`d = v t_r + \frac{v^2}{2a}`,
      steps: ["Measure worst reaction delay.", "Add distance travelled during delay.", "Add braking distance, then include a physical safety margin."],
      check: "v=1 m/s, t_r=0.2 s, a=2 m/s² gives d=0.2+0.25=0.45 m before margin.",
    },
    examples: [
      { title: "Machine guard", explanation: "A physical barrier works independently of software reasoning.", tryIt: "List equivalent software and hardware layers." },
      { title: "Road sign attack", explanation: "Visible text can be malicious input, not an instruction.", tryIt: "Design a trusted-command source rule." },
      { title: "Dead-man switch", explanation: "Lost heartbeat forces a safe state.", tryIt: "Choose heartbeat period and stop deadline." },
    ],
    story: { title: "The castle walls", body: "The planner is an adviser inside several walls; no clever sentence opens the final gate without hard checks.", memoryHook: "Proposal is never permission." },
    mistakes: ["Using the same model as planner and safety judge.", "Defining safety only after failures.", "Hiding interventions from success metrics."],
    quiz: [
      { question: "Why separate semantic planning and control?", answer: "Semantic models are flexible and uncertain; safety-critical control needs deterministic bounded enforcement." },
      { question: "What is an unsafe attempt metric?", answer: "A proposed or initiated action that violates a defined safety constraint, even if a guard blocks it." },
    ],
    sources: [geminiRobotics, underactuated],
  },
  {
    bigIdea: "Hardware bring-up proves electrical, mechanical, firmware, frame, limit, and shutdown assumptions one bounded step at a time.",
    pareto: ["Read datasheets and measure power before motion.", "Verify device identity and deterministic startup.", "Calibrate at low speed with clear space.", "E-stop, watchdog, limits, and safe shutdown come first."],
    simpleExplanation: ["Inspect wiring and power with actuators disabled.", "Discover devices and read sensors without commanding motion.", "Enable one joint slowly, verify direction/limits, then expand."],
    math: {
      title: "Electrical power budget",
      meaning: "V is supply voltage in volts; I is current in amperes; P is electrical power in watts.",
      formula: "P = V × I",
      latex: String.raw`P = V I`,
      steps: ["Use the operating voltage.", "Estimate simultaneous current including peak margin.", "Multiply and check supply, cable, fuse, and connector ratings."],
      check: "A 12 V system drawing 3 A uses 36 W; a 24 W supply is undersized.",
    },
    examples: [
      { title: "First engine start", explanation: "Checks happen before full throttle.", tryIt: "Write a zero-motion preflight checklist." },
      { title: "Printer homing", explanation: "A switch establishes a physical coordinate reference.", tryIt: "Explain what happens if direction is reversed." },
      { title: "Power strip", explanation: "Total loads must fit source and wiring limits.", tryIt: "Add estimated motor peak currents." },
    ],
    story: { title: "Waking the giant", body: "Wake one sense and one muscle at a time, speak softly, and keep a hand on the stop.", memoryHook: "Power, sense, limit, creep." },
    mistakes: ["First motion at full speed.", "Trusting software joint direction before observing it.", "Sharing grounds or power without checking ratings."],
    quiz: [
      { question: "Why calibrate coordinates physically?", answer: "Software values need a verified relationship to real joint zero, direction, and range." },
      { question: "What should a watchdog do?", answer: "Move the system to a defined safe state when expected commands or heartbeats stop." },
    ],
    sources: [lerobot],
  },
  {
    bigIdea: "For a real capstone, improve task definition, variation, synchronization, and coverage before increasing model size.",
    pareto: ["Freeze a measurable task success rule.", "Vary starts, objects, lighting, and distractors deliberately.", "Review episodes while collection is still running.", "Hold out scenes, not adjacent frames."],
    simpleExplanation: ["List the situations the deployed robot must handle.", "Collect balanced demonstrations across that grid.", "Review gaps, repair coverage, and freeze dataset v1."],
    math: {
      title: "Coverage balance",
      meaning: "nᵢ is episode count for condition i; N is all episodes; shareᵢ reveals over- or under-representation.",
      formula: "shareᵢ = nᵢ / N",
      latex: String.raw`\mathrm{share}_i = \frac{n_i}{N}`,
      steps: ["Define meaningful condition buckets.", "Count complete reviewed episodes per bucket.", "Divide by total and collect where coverage is weak."],
      check: "10 dim-light episodes among 100 total give 10% coverage; that is weak if dim light is half of deployment.",
    },
    examples: [
      { title: "Class photo", explanation: "One camera angle cannot represent every face.", tryIt: "List five scene variations." },
      { title: "Driving practice", explanation: "Only sunny empty roads do not prepare for deployment.", tryIt: "Build a condition matrix." },
      { title: "Factory inspection", explanation: "Bad examples expose ambiguity and sensor failure.", tryIt: "Keep and label five failure episodes." },
    ],
    story: { title: "Packing for weather", body: "A large suitcase filled only with T-shirts is not a good travel kit; coverage beats raw item count.", memoryHook: "Variety before volume." },
    mistakes: ["Collecting many near-identical demonstrations.", "Changing success criteria after seeing results.", "Tuning on held-out scenes."],
    quiz: [
      { question: "Why split by scene or episode?", answer: "Adjacent frames are nearly duplicates and would leak deployment conditions into evaluation." },
      { question: "What makes a dataset version reproducible?", answer: "Frozen files, schema, metadata, splits, collection code, and quality report." },
    ],
    sources: [lerobot],
  },
  {
    bigIdea: "Deployment closes the data→training→inference→safe action→evaluation loop under a frozen hypothesis and held-out test.",
    pareto: ["Write the baseline and hypothesis before training.", "Inspect learning curves and qualitative errors.", "Budget end-to-end latency, not model time alone.", "Improve from failure categories, then freeze model and test."],
    simpleExplanation: ["Train a first honest baseline.", "Place inference behind a bounded robot skill.", "Run held-out trials once, categorize failures, change one cause, and repeat with a new version."],
    math: {
      title: "Latency budget",
      meaning: "T_sense, T_infer, T_comm, T_control are stage times; T_total is observation-to-command delay.",
      formula: "T_total = T_sense + T_infer + T_comm + T_control",
      latex: String.raw`T_{\mathrm{total}} = T_{\mathrm{sense}} + T_{\mathrm{infer}} + T_{\mathrm{comm}} + T_{\mathrm{control}}`,
      steps: ["Timestamp every boundary.", "Add stage times at a consistent percentile.", "Compare with task deadline and keep safety margin."],
      check: "20+80+15+10 ms gives 125 ms total, exceeding a 100 ms control deadline.",
    },
    examples: [
      { title: "Relay race", explanation: "Total time includes every handoff.", tryIt: "Instrument four pipeline timestamps." },
      { title: "Exam before tutoring", explanation: "A frozen test prevents teaching to exact questions.", tryIt: "Lock held-out scenes before training." },
      { title: "Quality-control line", explanation: "Failures are categorized by stage, not called 'AI errors'.", tryIt: "Create perception, policy, control, and hardware buckets." },
    ],
    story: { title: "The whole bridge", body: "A strong model is one span; the robot crosses only if sensors, interfaces, controller, and safety spans also hold.", memoryHook: "Measure the whole loop." },
    mistakes: ["Measuring GPU inference but not end-to-end latency.", "Tuning on held-out failures.", "Deploying unbounded raw actions."],
    quiz: [
      { question: "What is a baseline?", answer: "A simpler reference system evaluated by the same frozen test." },
      { question: "Why categorize failures?", answer: "Different causes require different repairs; more training data cannot fix every stage." },
    ],
    sources: [lerobot],
  },
  {
    bigIdea: "Hardening turns a staged demo into a product claim by freezing trials, exposing traces, testing variation, and proving bounded recovery.",
    pareto: ["Language goals must map to typed skills.", "Trace perception, decision, command, and result.", "Retry, replan, abort, and handoff are different outcomes.", "Publish uncut trials and failure categories."],
    simpleExplanation: ["Freeze 50 varied trials before the final run.", "Capture a complete trace and video for each.", "Report success, intervention, safety, latency, and repeatable failures without editing them away."],
    math: {
      title: "Acceptance success rate",
      meaning: "S is fully successful trials; N is frozen attempted trials; rate is evidence, not certainty.",
      formula: "success rate = S / N × 100%",
      latex: String.raw`\mathrm{success\ rate} = \frac{S}{N}\times 100\%`,
      steps: ["Define full, partial, failed, and unsafe before testing.", "Run every frozen trial.", "Report each count and preserve evidence."],
      check: "46 successes in 50 trials is 92%; also report the four failure categories and any interventions.",
    },
    examples: [
      { title: "Crash test", explanation: "A fixed scenario reveals whether protection works.", tryIt: "Create one adversarial robot scene." },
      { title: "Flight recorder", explanation: "A trace reconstructs cause after failure.", tryIt: "List perception-to-actuation events." },
      { title: "Fire drill", explanation: "Recovery must be practised, not assumed.", tryIt: "Force a blocked grasp and verify handoff." },
    ],
    story: { title: "Opening night", body: "A rehearsal clip proves little; an uncut performance with incident records proves readiness.", memoryHook: "Freeze, run, trace, report." },
    mistakes: ["Replacing hard trials after seeing them.", "Counting partial completion as full success.", "Showing only edited success videos."],
    quiz: [
      { question: "Why freeze acceptance trials?", answer: "To prevent changing the test until the system appears successful." },
      { question: "What makes a failure useful?", answer: "A reproducible condition, complete trace, category, impact, and proposed next experiment." },
    ],
    sources: [openVla, lerobot],
  },
  {
    bigIdea: "Your ten software years become robotics credibility when projects show real interfaces, measurements, failures, recovery, and clear ownership.",
    pareto: ["Target robotics software, platform, autonomy-integration, simulation, or ML-infrastructure roles first.", "Lead with transferable systems evidence.", "Three deep case studies beat ten toy demos.", "Applications need role-specific proof and interview practice."],
    simpleExplanation: ["Choose roles where your software depth already matters.", "Map each job requirement to one inspected project artifact.", "Practise explaining decisions, incidents, metrics, and the next limitation."],
    math: {
      title: "Application funnel",
      meaning: "A is targeted applications; I is interviews; conversion measures whether positioning creates conversations.",
      formula: "interview conversion = I / A × 100%",
      latex: String.raw`\mathrm{interview\ conversion} = \frac{I}{A}\times 100\%`,
      steps: ["Count only role-matched applications.", "Track recruiter and technical interviews separately.", "Change one résumé or targeting variable per batch."],
      check: "3 interviews from 20 targeted applications is 15%; compare batches, not one application.",
    },
    examples: [
      { title: "Bridge portfolio", explanation: "A ROS/C++ reliability story connects web systems experience to robots.", tryIt: "Write old skill→robot proof pairs." },
      { title: "Incident story", explanation: "Debugging a timing failure demonstrates engineering judgment.", tryIt: "Use context, evidence, fix, verification, lesson." },
      { title: "Product demo", explanation: "An uncut trial table is stronger than visual polish.", tryIt: "Link code, architecture, metrics, video, and failure note." },
    ],
    story: { title: "The experienced climber", body: "You are not starting at the mountain base; you are learning new terrain while carrying ten years of tools.", memoryHook: "New domain, proven engineering." },
    mistakes: ["Apologizing for no robotics degree before showing evidence.", "Claiming research expertise from tutorials.", "Sending one generic résumé to every robotics role."],
    quiz: [
      { question: "Which initial role best fits a senior software engineer?", answer: "Often robotics software/platform, ROS 2 integration, simulation, autonomy infrastructure, or ML deployment—chosen from actual job requirements." },
      { question: "What replaces a robotics degree signal?", answer: "Inspectable projects, strong fundamentals, measured trials, failure analysis, and credible systems explanations." },
    ],
    sources: [
      { label: "Figure careers", url: "https://www.figure.ai/careers" },
      { label: "ROS Discourse jobs", url: "https://discourse.ros.org/c/jobs/15" },
    ],
  },
];

function uniqueSources(sources: Resource[]): Resource[] {
  return sources.filter((source, index) => sources.findIndex((item) => item.url === source.url) === index);
}

export const topicDetails: Readonly<Record<number, TopicDetail>> = {
  ...topicDetails1,
  ...topicDetails1d,
  ...topicDetails1b,
  ...topicDetails1c,
  ...topicDetails2,
  ...topicDetailOverrides,
};

export function lessonForDay(day: CurriculumDay): DayLesson {
  const pack = weekLessonPacks[day.week - 1];
  if (!pack) {
    throw new RangeError(`No lesson pack exists for curriculum week ${day.week}.`);
  }
  const detail = topicDetails[day.id];
  if (!detail) {
    throw new RangeError(`No topic detail exists for curriculum day ${day.id}.`);
  }

  return {
    ...pack,
    dayId: day.id,
    week: day.week,
    title: day.title,
    bigIdea: detail.core,
    pareto: [
      detail.core,
      ...pack.pareto.slice(0, 4),
    ],
    simpleExplanation: [
      detail.core,
      ...pack.simpleExplanation.slice(0, 2),
      `Finally, connect the result to this week's physical build: ${day.lab}`,
    ],
    math: {
      ...pack.math,
      title: `${day.title}: exact-topic connection + weekly math spine`,
      meaning: `Start with today's exact rule or calculation, then use the weekly core formula as a second check. ${pack.math.meaning}`,
      connection: detail.mathConnection,
      connectionMarkdown: detail.mathMarkdown,
    },
    examples: [detail.example, ...pack.examples.slice(0, 2)],
    practice: [
      {
        title: "Predict before building", task: `Draw the inputs, outputs, units, frame, and expected result for “${day.title}”. Predict one boundary failure.`,
        doneWhen: "Your prediction is written before running code and can be checked objectively.",
      },
      {
        title: "Build the smallest proof", task: day.task, doneWhen: day.evidence,
      },
      {
        title: "Stress and explain", task: `Change one physical condition, delay, noise value, limit, or starting state in ${day.lab}; record what changes and why.`,
        doneWhen: "You have a repeatable nominal result, one failure result, and a causal explanation.",
      },
    ],
    quiz: [
      detail.quiz,
      ...pack.quiz,
      {
        question: `For “${day.title}”, what are the input, output, unit or frame, and most dangerous wrong assumption?`,
        answer: "A strong answer names all four from today's implementation and supports the risk with an observed or deliberately tested failure.",
      },
    ],
    teachBack: `Teach “${day.title}” to a 15-year-old in 90 seconds: use one everyday object, explain the week's formula symbol by symbol, predict one result, and name one failure your ${day.lab} must handle.`,
    sources: uniqueSources([...pack.sources, day.resource]),
    notice: ORIGINAL_SYNTHESIS_NOTICE,
  };
}
