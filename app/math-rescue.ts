export type MathSymbol = {
  symbol: string;
  meaning: string;
  unit: string;
};

export type MathRescue = {
  week: number;
  title: string;
  whyItMatters: string;
  symbols: MathSymbol[];
  workedSteps: [string, string, string];
  quickCheck: string;
  answer: string;
  analogy: string;
};

const rescues: MathRescue[] = [
  {
    week: 1,
    title: "Start at zero: counting, units, and coordinates",
    whyItMatters: "No maths is assumed. First give every robot number a physical meaning, a unit, a zero point, and a positive direction.",
    symbols: [
      { symbol: "N", meaning: "a count, such as number of joints", unit: "no unit" },
      { symbol: "x", meaning: "one position measured from a chosen zero", unit: "centimetres (cm) or metres (m)" },
      { symbol: "Δx", meaning: "change in x; Δ means change", unit: "same unit as x" },
    ],
    workedSteps: [
      "Draw a number line. Put the origin at 0 cm, choose right as positive, and place the robot at x = 20 cm.",
      "Move 30 cm right, so Δx = +30 cm. Predict x_new = 20 cm + 30 cm = 50 cm.",
      "Measure to check, then convert with 100 cm = 1 m: 50 cm = 0.50 m. Never add centimetres directly to metres.",
    ],
    quickCheck: "A robot starts at x = 40 cm and moves 15 cm left. What is its new x coordinate?",
    answer: "Left is negative, so Δx = -15 cm and x_new = 40 - 15 = 25 cm.",
    analogy: "A variable is like a named field in code, but a robot field must also say its physical unit and what zero means.",
  },
  {
    week: 2,
    title: "Start at zero: turns, triangles, and pose chains",
    whyItMatters: "A joint turn becomes a tool position only after we define the angle, split a link into horizontal and vertical parts, and follow frame order.",
    symbols: [
      { symbol: "θ", meaning: "theta: the amount a joint has turned", unit: "degrees (°) or radians (rad)" },
      { symbol: "cos θ, sin θ", meaning: "horizontal and vertical fractions of a turned unit link", unit: "no unit" },
      { symbol: "Tᴬ_B", meaning: "position and direction of frame B described by frame A", unit: "unitless rotation + metres" },
    ],
    workedSteps: [
      "A full turn is 360° = 2π rad, so 90° × π/180 = π/2 rad. π is about 3.1416.",
      "For a 1 m link at 90°, x = 1 cos 90° = 0 m and y = 1 sin 90° = 1 m.",
      "For several frames, follow the physical path in order. Multiply transforms only when the touching frame names match, then verify by reversing the path.",
    ],
    quickCheck: "What are x and y for a 2 m link at 0 rad?",
    answer: "x = 2 cos 0 = 2 m; y = 2 sin 0 = 0 m.",
    analogy: "Like nested UI transforms, each child inherits its parent's transform; unlike UI, the order can move metal into an obstacle.",
  },
  {
    week: 3,
    title: "Change over time and feedback",
    whyItMatters: "Velocity, acceleration, and control error explain whether a robot settles, overshoots, or becomes unsafe.",
    symbols: [
      { symbol: "Δx/Δt", meaning: "change in position divided by elapsed time", unit: "metres per second (m/s)" },
      { symbol: "e = target − measured", meaning: "control error", unit: "same unit as the target" },
      { symbol: "u", meaning: "bounded actuator command", unit: "device-specific" },
    ],
    workedSteps: [
      "A wheel moves from 1 m to 1.6 m in 0.2 s, so Δx = 0.6 m.",
      "Average velocity is 0.6/0.2 = 3 m/s.",
      "If the target is 2 m and measured position is 1.6 m, error e = 0.4 m; a controller converts that error into a limited command.",
    ],
    quickCheck: "Position changes by 0.5 m in 0.25 s. What is average velocity?",
    answer: "0.5/0.25 = 2 m/s.",
    analogy: "A feedback loop resembles an event loop that checks state repeatedly, but a missed deadline changes physical motion, not just screen responsiveness.",
  },
  {
    week: 4,
    title: "Rates, deadlines, jitter, and memory budgets",
    whyItMatters: "Hardware-facing software must finish work predictably before its deadline.",
    symbols: [
      { symbol: "f", meaning: "loop frequency", unit: "hertz (Hz)" },
      { symbol: "T = 1/f", meaning: "time available for one loop", unit: "seconds (s)" },
      { symbol: "jitter", meaning: "variation around the expected timing", unit: "milliseconds (ms)" },
    ],
    workedSteps: [
      "For a 100 Hz control loop, T = 1/100 s.",
      "Convert: 0.01 s = 10 ms per cycle.",
      "If work sometimes takes 13 ms, it misses the 10 ms deadline by 3 ms; measure the distribution, not only the average.",
    ],
    quickCheck: "How much time does a 50 Hz loop have per cycle?",
    answer: "1/50 s = 0.02 s = 20 ms.",
    analogy: "This is a strict frame budget like Flutter rendering, except a late frame can destabilize an actuator.",
  },
  {
    week: 5,
    title: "Message rates, queues, and latency",
    whyItMatters: "ROS nodes form a distributed timing system; rates and queue depth decide freshness.",
    symbols: [
      { symbol: "λ", meaning: "messages arriving each second", unit: "messages/s" },
      { symbol: "μ", meaning: "messages processed each second", unit: "messages/s" },
      { symbol: "latency", meaning: "receive time minus source timestamp", unit: "milliseconds (ms)" },
    ],
    workedSteps: [
      "A camera publishes λ = 30 messages/s while a node processes μ = 20 messages/s.",
      "The backlog grows by λ − μ = 10 messages each second.",
      "A depth-5 queue fills in about 0.5 s; choose a QoS policy based on whether freshness or completeness matters.",
    ],
    quickCheck: "Input is 50 Hz and processing is 40 Hz. How fast does backlog grow?",
    answer: "10 messages per second.",
    analogy: "ROS pub/sub resembles backend messaging, but an old robot message can command the wrong physical state.",
  },
  {
    week: 6,
    title: "Transforms, joint limits, and command interfaces",
    whyItMatters: "A robot model must keep geometry, state, and commands consistent.",
    symbols: [
      { symbol: "q", meaning: "joint position", unit: "rad or m" },
      { symbol: "q̇", meaning: "joint velocity", unit: "rad/s or m/s" },
      { symbol: "limit", meaning: "allowed minimum or maximum", unit: "same as the value" },
    ],
    workedSteps: [
      "A joint accepts q from −1.0 rad to +1.0 rad.",
      "A planner asks for 1.2 rad, which exceeds the maximum by 0.2 rad.",
      "Reject or safely clamp before the hardware interface; never hide the violation in the driver.",
    ],
    quickCheck: "Is q = −0.8 rad valid for limits [−0.5, 1.0] rad?",
    answer: "No. It is 0.3 rad below the minimum.",
    analogy: "Treat hardware interfaces like typed Java APIs with range contracts, except a broken contract can damage a mechanism.",
  },
  {
    week: 7,
    title: "Simulation time, real-time factor, and sensor noise",
    whyItMatters: "A simulator is useful only when time and uncertainty are measured honestly.",
    symbols: [
      { symbol: "RTF", meaning: "simulated elapsed time divided by real elapsed time", unit: "unitless" },
      { symbol: "μ", meaning: "average sensor value", unit: "sensor unit" },
      { symbol: "σ", meaning: "typical spread around the average", unit: "sensor unit" },
    ],
    workedSteps: [
      "A run simulates 20 s but takes 25 s of wall time.",
      "RTF = 20/25 = 0.8.",
      "The simulator is slower than real time; compare timestamps in simulated time and report RTF with every performance result.",
    ],
    quickCheck: "Ten simulated seconds take five real seconds. What is RTF?",
    answer: "10/5 = 2.0, so simulation runs twice as fast as real time.",
    analogy: "A test clock can be mocked in web software; robot sensor timestamps must still stay mutually consistent.",
  },
  {
    week: 8,
    title: "Occupancy probability and path cost",
    whyItMatters: "Navigation converts uncertain map cells into a collision-aware route.",
    symbols: [
      { symbol: "p(occupied)", meaning: "belief that a map cell contains an obstacle", unit: "probability from 0 to 1" },
      { symbol: "g(n)", meaning: "cost already travelled to cell n", unit: "cost or metres" },
      { symbol: "h(n)", meaning: "estimated remaining cost", unit: "same as g" },
    ],
    workedSteps: [
      "For an A* node, suppose g = 4 m and admissible h = 3 m.",
      "Total priority f = g + h = 7 m.",
      "The planner compares f values, but the final path must also clear the inflated robot footprint.",
    ],
    quickCheck: "What is f when g = 2.5 m and h = 1.5 m?",
    answer: "f = 4.0 m.",
    analogy: "It resembles shortest-path routing in a network, but each node represents physical space and the robot has width.",
  },
  {
    week: 9,
    title: "Pixels, camera projection, and calibration error",
    whyItMatters: "A pixel becomes useful only after camera geometry and uncertainty are known.",
    symbols: [
      { symbol: "u, v", meaning: "pixel column and row", unit: "pixels (px)" },
      { symbol: "fₓ, fᵧ", meaning: "camera focal scale", unit: "pixels (px)" },
      { symbol: "Z", meaning: "depth along the camera axis", unit: "metres (m)" },
    ],
    workedSteps: [
      "Use x = (u − cₓ)Z/fₓ. Let u − cₓ = 100 px, Z = 2 m, fₓ = 500 px.",
      "Multiply the numerator: 100 × 2 = 200 px·m.",
      "Divide: x = 200/500 = 0.4 m; pixel units cancel, leaving metres.",
    ],
    quickCheck: "If u − cₓ = 50 px, Z = 1 m, and fₓ = 500 px, what is x?",
    answer: "x = 50×1/500 = 0.1 m.",
    analogy: "Mobile camera pixels are familiar; robotics adds calibrated rays, a camera frame, and physical depth.",
  },
  {
    week: 10,
    title: "Depth, point distance, and rigid alignment",
    whyItMatters: "3D perception needs distances and poses that agree across frames.",
    symbols: [
      { symbol: "p = [x,y,z]", meaning: "a 3D point", unit: "metres (m)" },
      { symbol: "||p||", meaning: "distance from the frame origin", unit: "metres (m)" },
      { symbol: "eᵢ", meaning: "alignment residual for point i", unit: "metres (m)" },
    ],
    workedSteps: [
      "For p = [0.3, 0.4, 0] m, square the components: 0.09 + 0.16 + 0.",
      "The sum is 0.25 m².",
      "Distance is √0.25 = 0.5 m; invalid or missing depth must be excluded before this calculation.",
    ],
    quickCheck: "How far is [0, 0, 2] m from the camera origin?",
    answer: "2 m.",
    analogy: "Like mapping API objects between schemas, point clouds require an explicit transform; unlike JSON, a wrong transform can still look plausible.",
  },
  {
    week: 11,
    title: "Probability, variance, and Kalman weighting",
    whyItMatters: "State estimation combines predictions and measurements according to uncertainty.",
    symbols: [
      { symbol: "μ", meaning: "best current estimate", unit: "state unit" },
      { symbol: "σ²", meaning: "variance, or squared uncertainty spread", unit: "state unit squared" },
      { symbol: "K", meaning: "Kalman gain, the measurement weight", unit: "unitless" },
    ],
    workedSteps: [
      "Prediction is 10 m. Measurement is 12 m. Let K = 0.25.",
      "Innovation is 12 − 10 = 2 m.",
      "Updated estimate = 10 + 0.25×2 = 10.5 m; the lower-trust measurement only shifts the estimate partway.",
    ],
    quickCheck: "Prediction 5 m, measurement 7 m, K = 0.5. What is the update?",
    answer: "5 + 0.5×(7−5) = 6 m.",
    analogy: "It is a weighted merge like resolving two data sources, but the weights come from modeled uncertainty.",
  },
  {
    week: 12,
    title: "Configuration space, sampling, and trajectory timing",
    whyItMatters: "A collision-free pose is not enough; the complete joint path and timing must be feasible.",
    symbols: [
      { symbol: "q", meaning: "one point in joint configuration space", unit: "rad or m per joint" },
      { symbol: "Δq", meaning: "joint change between samples", unit: "rad or m" },
      { symbol: "v = Δq/Δt", meaning: "joint velocity", unit: "rad/s or m/s" },
    ],
    workedSteps: [
      "A joint moves from 0.2 rad to 0.8 rad, so Δq = 0.6 rad.",
      "If allocated time is 0.3 s, average velocity is 0.6/0.3 = 2 rad/s.",
      "If the limit is 1 rad/s, increase duration to at least 0.6 s and collision-check the interpolated path.",
    ],
    quickCheck: "A 0.5 rad move with a 2 rad/s limit needs at least how long?",
    answer: "Δt = 0.5/2 = 0.25 s.",
    analogy: "A route can pass API validation at its endpoints while failing in the middle; robot trajectories must validate every segment.",
  },
  {
    week: 13,
    title: "Tensor shapes and gradient descent",
    whyItMatters: "Most robot-learning bugs are shape, scale, split, or optimization mistakes.",
    symbols: [
      { symbol: "B×T×D", meaning: "batch, time steps, and feature dimensions", unit: "counts" },
      { symbol: "L", meaning: "loss measuring prediction error", unit: "task-dependent" },
      { symbol: "η", meaning: "learning rate", unit: "unitless scale" },
    ],
    workedSteps: [
      "A batch has B=8 episodes, T=20 time steps, and D=12 features.",
      "The tensor contains 8×20×12 = 1,920 numbers.",
      "An optimizer updates a weight with w_new = w_old − η∂L/∂w; inspect shape and finite values before training.",
    ],
    quickCheck: "How many values are in a 4×10×6 tensor?",
    answer: "4×10×6 = 240 values.",
    analogy: "Tensor shapes are stricter versions of typed multidimensional arrays in Python or Java.",
  },
  {
    week: 14,
    title: "Episode timing, normalization, and split leakage",
    whyItMatters: "A policy learns the dataset you actually recorded, including hidden leakage and timing errors.",
    symbols: [
      { symbol: "z = (x−μ)/σ", meaning: "standardized value", unit: "unitless" },
      { symbol: "t", meaning: "source timestamp", unit: "seconds (s)" },
      { symbol: "N", meaning: "number of independent episodes", unit: "episodes" },
    ],
    workedSteps: [
      "For x=14, dataset mean μ=10, and standard deviation σ=2, subtract: 14−10=4.",
      "Divide: z=4/2=2, meaning two standard deviations above the mean.",
      "Compute μ and σ from training data only, then keep whole scenes out of validation to prevent leakage.",
    ],
    quickCheck: "What is z for x=8, μ=10, σ=2?",
    answer: "(8−10)/2 = −1.",
    analogy: "It resembles a production event log, but camera, state, and action streams must describe the same instant.",
  },
  {
    week: 15,
    title: "Supervised loss and rollout success",
    whyItMatters: "Low offline prediction error does not guarantee that a closed-loop robot recovers from its own mistakes.",
    symbols: [
      { symbol: "MSE", meaning: "average squared action error", unit: "action unit squared" },
      { symbol: "S/N", meaning: "successful trials divided by all frozen trials", unit: "probability or percent" },
      { symbol: "Δ", meaning: "difference between two policy metrics", unit: "metric unit" },
    ],
    workedSteps: [
      "Action errors are [1, −1, 2]. Square them: [1,1,4].",
      "Average: MSE = (1+1+4)/3 = 2 action-units².",
      "Also run the policy: 16 successes from 20 trials is 80%; report both offline error and rollout success.",
    ],
    quickCheck: "What is success rate for 18 successes in 24 trials?",
    answer: "18/24 = 0.75 = 75%.",
    analogy: "A unit test can pass while the full user flow fails; imitation learning also needs closed-loop E2E trials.",
  },
  {
    week: 16,
    title: "Action distributions and denoising steps",
    whyItMatters: "Some tasks have several valid actions, so predicting only one average can be wrong.",
    symbols: [
      { symbol: "p(a|o)", meaning: "distribution of actions a given observation o", unit: "probability density" },
      { symbol: "a₀…aₖ", meaning: "an action chunk across time", unit: "action units" },
      { symbol: "σₜ", meaning: "noise level at denoising step t", unit: "normalized action scale" },
    ],
    workedSteps: [
      "Imagine valid steering actions are −1 or +1 with equal frequency.",
      "Their simple mean is 0, which may drive straight into the obstacle.",
      "A multimodal policy represents both valid regions; evaluate sampled trajectories for feasibility and latency.",
    ],
    quickCheck: "What misleading mean comes from actions −2 and +2?",
    answer: "0, even if action 0 was never demonstrated.",
    analogy: "Like returning one averaged API response from two valid branches, the average may satisfy neither branch.",
  },
  {
    week: 17,
    title: "Rewards, discounted return, and sim-to-real error",
    whyItMatters: "Reinforcement learning optimizes the reward definition, including its loopholes.",
    symbols: [
      { symbol: "rₜ", meaning: "reward at time t", unit: "reward units" },
      { symbol: "γ", meaning: "discount factor for future reward", unit: "0 to 1" },
      { symbol: "G = Σγᵗrₜ", meaning: "discounted total return", unit: "reward units" },
    ],
    workedSteps: [
      "Rewards are r₀=1 and r₁=2 with γ=0.5.",
      "Discount the later reward: 0.5×2 = 1.",
      "Return G = 1+1 = 2. Inspect whether the reward also encourages unsafe shortcuts.",
    ],
    quickCheck: "For rewards [2,2] and γ=0.5, what is G?",
    answer: "2 + 0.5×2 = 3.",
    analogy: "A metric-driven service optimizes what you measure; an RL robot can exploit a badly specified metric physically.",
  },
  {
    week: 18,
    title: "Token, action, and latency budgets",
    whyItMatters: "Language reasoning must finish before the physical situation becomes stale.",
    symbols: [
      { symbol: "T_total", meaning: "end-to-end decision latency", unit: "milliseconds (ms)" },
      { symbol: "f_control", meaning: "safety/control update rate", unit: "hertz (Hz)" },
      { symbol: "H", meaning: "action horizon", unit: "steps or seconds" },
    ],
    workedSteps: [
      "Perception takes 80 ms, model reasoning 220 ms, and skill dispatch 20 ms.",
      "T_total = 80+220+20 = 320 ms.",
      "At 1 m/s the robot moves 0.32 m during that delay; independent fast safety control must not wait for the LLM.",
    ],
    quickCheck: "At 0.5 m/s, how far does a robot move during 400 ms?",
    answer: "400 ms = 0.4 s; distance = 0.5×0.4 = 0.2 m.",
    analogy: "An LLM tool call resembles backend orchestration, but its latency must be converted into physical travel distance.",
  },
  {
    week: 19,
    title: "Fine-tuning size, normalization, and evidence",
    whyItMatters: "Model adaptation must fit compute limits and improve frozen physical trials.",
    symbols: [
      { symbol: "P_train", meaning: "parameters updated during tuning", unit: "parameters" },
      { symbol: "GB", meaning: "memory footprint", unit: "gigabytes" },
      { symbol: "Δsuccess", meaning: "new minus baseline success rate", unit: "percentage points" },
    ],
    workedSteps: [
      "A baseline succeeds 12/20 = 60%; adaptation succeeds 16/20 = 80%.",
      "Improvement is 80%−60% = 20 percentage points, not 20 percent.",
      "Report parameter count, memory, latency, and the same frozen scenarios before claiming improvement.",
    ],
    quickCheck: "A metric rises from 50% to 65%. What is the percentage-point gain?",
    answer: "15 percentage points.",
    analogy: "Treat a policy release like a mobile release: same acceptance suite, device budget, rollback path, and versioned artifact.",
  },
  {
    week: 20,
    title: "Task graphs, timeouts, and retries",
    whyItMatters: "An autonomous task is a state machine with measurable guards, not one long prompt.",
    symbols: [
      { symbol: "t_deadline", meaning: "latest allowed completion time", unit: "seconds (s)" },
      { symbol: "N_retry", meaning: "maximum retry count", unit: "attempts" },
      { symbol: "P(success)", meaning: "observed success frequency", unit: "probability" },
    ],
    workedSteps: [
      "A grasp skill gets a 5 s timeout and at most 2 retries.",
      "The maximum planned attempt time is 3×5 = 15 s, excluding recovery.",
      "After each failure, re-observe and check a typed precondition before retrying; do not replay a stale command.",
    ],
    quickCheck: "One initial try plus three retries, each capped at 4 s, permits how much attempt time?",
    answer: "4 attempts × 4 s = 16 s.",
    analogy: "It resembles a workflow engine with typed APIs, except retries require fresh perception of a changed world.",
  },
  {
    week: 21,
    title: "Risk, stopping distance, and confidence",
    whyItMatters: "Safety claims need physical bounds and enough trials, not reassuring language.",
    symbols: [
      { symbol: "d_react = vt", meaning: "distance travelled during reaction delay", unit: "metres (m)" },
      { symbol: "d_brake = v²/(2a)", meaning: "ideal braking distance", unit: "metres (m)" },
      { symbol: "risk", meaning: "severity combined with likelihood", unit: "ordinal score" },
    ],
    workedSteps: [
      "At v=1 m/s and reaction t=0.2 s, d_react=1×0.2=0.2 m.",
      "With braking deceleration a=2 m/s², d_brake=1²/(2×2)=0.25 m.",
      "Ideal total is 0.45 m; add measured margin for sensing, actuation, floor, load, and uncertainty.",
    ],
    quickCheck: "At 0.5 m/s with 0.2 s reaction time, what is reaction distance?",
    answer: "0.5×0.2 = 0.1 m.",
    analogy: "A security threat model maps assets and controls; robot safety adds kinetic energy and independently enforced stops.",
  },
  {
    week: 22,
    title: "Voltage, current, power, gearing, and bus timing",
    whyItMatters: "Real hardware fails when electrical, thermal, torque, or communication limits are ignored.",
    symbols: [
      { symbol: "P = VI", meaning: "electrical power", unit: "watts (W)" },
      { symbol: "τ", meaning: "rotational torque", unit: "newton-metres (N·m)" },
      { symbol: "f_bus", meaning: "communication update rate", unit: "hertz (Hz)" },
    ],
    workedSteps: [
      "A motor driver uses V=24 V and I=3 A.",
      "Electrical power P=24×3=72 W.",
      "Size wiring, fuse, supply, and thermal path from measured worst case; a software current limit is not a substitute for protection.",
    ],
    quickCheck: "What power is drawn at 12 V and 5 A?",
    answer: "12×5 = 60 W.",
    analogy: "A hardware bus resembles a shared network, but overload can heat wires and power loss can remove braking.",
  },
  {
    week: 23,
    title: "Dataset coverage and independent scenes",
    whyItMatters: "More frames from the same easy scene do not equal broader robot experience.",
    symbols: [
      { symbol: "N_scene", meaning: "independent physical setups", unit: "scenes" },
      { symbol: "coverage", meaning: "tested condition cells represented", unit: "percent" },
      { symbol: "failure rate", meaning: "failed frozen trials divided by all trials", unit: "percent" },
    ],
    workedSteps: [
      "Your matrix has 3 object positions × 2 lighting levels = 6 condition cells.",
      "Data covers 4 cells, so coverage is 4/6 = 66.7%.",
      "Collect the two missing cells before duplicating the easiest one; split by whole scene, not adjacent frames.",
    ],
    quickCheck: "Seven of ten condition cells are covered. What is coverage?",
    answer: "7/10 = 70%.",
    analogy: "It is test-case coverage, not line coverage: the unit is a distinct physical condition.",
  },
  {
    week: 24,
    title: "Latency, memory, quantization, and acceptance deltas",
    whyItMatters: "A trained model is deployable only when it fits the edge device and preserves task quality.",
    symbols: [
      { symbol: "FPS = 1/T", meaning: "inferences per second from latency T", unit: "frames/s" },
      { symbol: "memory", meaning: "runtime RAM or VRAM use", unit: "MB or GB" },
      { symbol: "Δmetric", meaning: "optimized minus original metric", unit: "metric unit" },
    ],
    workedSteps: [
      "Inference latency is 50 ms = 0.05 s.",
      "Maximum theoretical rate is 1/0.05 = 20 FPS.",
      "Measure end-to-end rate under thermal load and compare the exact frozen success suite before and after ONNX/TensorRT or quantization.",
    ],
    quickCheck: "What is the theoretical rate for 100 ms inference?",
    answer: "100 ms = 0.1 s; 1/0.1 = 10 FPS.",
    analogy: "Like profiling a Flutter app on the target phone, optimize on the actual robot computer and protect behavior with regression tests.",
  },
  {
    week: 25,
    title: "Reliability, denominators, and fleet rates",
    whyItMatters: "Production robotics requires rates, raw counts, time windows, and recoverable releases.",
    symbols: [
      { symbol: "availability", meaning: "healthy service time divided by scheduled time", unit: "percent" },
      { symbol: "MTTR", meaning: "mean time to recover", unit: "minutes or hours" },
      { symbol: "incidents/robot-hour", meaning: "normalized incident rate", unit: "1/hour" },
    ],
    workedSteps: [
      "Five robots each run 8 h, giving 40 robot-hours.",
      "Two incidents occur, so rate = 2/40 = 0.05 incidents per robot-hour.",
      "Keep raw counts and categories; compare versions under the same window before deciding whether reliability improved.",
    ],
    quickCheck: "Three incidents across 60 robot-hours gives what rate?",
    answer: "3/60 = 0.05 incidents per robot-hour.",
    analogy: "Use familiar observability and incident response, but join logs to robot ID, physical context, bag replay, and software/model version.",
  },
  {
    week: 26,
    title: "Evidence matrices and application funnels",
    whyItMatters: "Job readiness is demonstrated by traceable artifacts and measured application feedback.",
    symbols: [
      { symbol: "I/A", meaning: "interviews divided by targeted applications", unit: "percent" },
      { symbol: "coverage", meaning: "job requirements backed by evidence", unit: "percent" },
      { symbol: "N", meaning: "batch size before changing one application variable", unit: "applications" },
    ],
    workedSteps: [
      "A role lists 10 important requirements and your projects provide evidence for 7.",
      "Evidence coverage is 7/10 = 70%; name the three gaps honestly.",
      "If 3 of 20 targeted applications reach interview, conversion is 15%; change one positioning variable for the next comparable batch.",
    ],
    quickCheck: "Four interviews from 25 targeted applications gives what conversion?",
    answer: "4/25 = 0.16 = 16%.",
    analogy: "Treat the résumé like an API response: every claim should resolve to a repository, diagram, metric, test, video, or incident analysis.",
  },
];

export const mathRescueByWeek: Readonly<Record<number, MathRescue>> =
  Object.freeze(Object.fromEntries(rescues.map((rescue) => [rescue.week, rescue])));

export function getMathRescue(week: number): MathRescue {
  const rescue = mathRescueByWeek[week];
  if (!rescue) throw new RangeError(`No math rescue exists for week ${week}.`);
  return rescue;
}

export function validateMathRescues(): string[] {
  const issues: string[] = [];
  const weeks = rescues.map((rescue) => rescue.week);
  if (weeks.length !== 26 || weeks.some((week, index) => week !== index + 1)) {
    issues.push("Math rescue weeks must be exactly 1 through 26.");
  }
  for (const rescue of rescues) {
    if (!rescue.title || !rescue.whyItMatters || !rescue.quickCheck || !rescue.answer || !rescue.analogy) {
      issues.push(`Week ${rescue.week} has an empty required explanation.`);
    }
    if (rescue.symbols.length < 3 || rescue.symbols.some((symbol) => !symbol.symbol || !symbol.meaning || !symbol.unit)) {
      issues.push(`Week ${rescue.week} needs at least three fully described symbols.`);
    }
    if (rescue.workedSteps.length !== 3 || rescue.workedSteps.some((step) => !step)) {
      issues.push(`Week ${rescue.week} needs exactly three worked steps.`);
    }
  }
  return issues;
}
