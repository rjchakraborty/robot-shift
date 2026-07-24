import type { ChapterContent } from "../chapter-content-types";

const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";

export const week11Content = {
  week: 11,
  title: "Estimate robot state, localize honestly, and measure uncertainty",
  purpose:
    "Turn noisy motion and sensor data into an inspectable belief about robot pose. This chapter builds the ideas in order—state and observations, probability and covariance, recursive Bayes filtering, practical EKF fusion, scan matching and mapping, pose-graph and particle localization, then a dropout-tested report—so every estimate carries a frame, timestamp, uncertainty claim, and measured limitation.",
  prerequisites: [
    "Run the Week 7 simulated differential-drive robot with wheel odometry and an IMU, and replay a short rosbag2 recording without connecting powered hardware.",
    "Recognize the Week 8 `map→odom→base_link→sensor` frame chain, an occupancy grid, SLAM Toolbox mapping mode, AMCL localization mode, and simulation ground truth.",
    "Use x-y coordinates, metres, seconds, radians, averages, squared values, fractions, and a small spreadsheet or Python script.",
    "Treat an estimator output as a belief rather than ground truth, and preserve source timestamps, frames, units, raw measurements, configuration, and failed trials.",
  ],
  outcomes: [
    "Separate hidden state, controls, observations, process and measurement models, estimator output, uncertainty, and independent ground truth.",
    "Read mean, variance, standard deviation, covariance, correlation, and multimodal belief without confusing predicted uncertainty with measured error.",
    "Execute a discrete Bayes predict/update cycle and explain why likelihood, prior, normalization, and model assumptions each change the posterior.",
    "Calculate a scalar Kalman update and configure an inspectable `robot_localization` EKF that fuses non-duplicated wheel and IMU variables in valid frames and time.",
    "Explain scan matching, occupancy updates, accumulated drift, pose-graph constraints, loop closure, AMCL particles, and `map→odom` correction as different parts of localization.",
    "Evaluate nominal, outlier, and sensor-dropout trials with position and heading error, uncertainty coverage, recovery time, transform freshness, and an actionable failure taxonomy.",
    "Ship a reproducible state-estimation and localization report whose claims can be recalculated from saved simulation data.",
  ],
  jobTargets: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
  sources: [
    {
      label: "Introduction to Robotics and Perception — Localization",
      url: "https://www.roboticsbook.org/S44_logistics_perception.html",
      useFor:
        "Primary open-text treatment of state beliefs, recursive Bayes prediction and measurement updates, Markov localization, Monte Carlo localization, and Kalman filtering.",
    },
    {
      label: "robot_localization — State Estimation Nodes",
      url: "https://github.com/cra-ros-pkg/robot_localization/blob/rolling-devel/doc/state_estimation_nodes.rst",
      useFor:
        "Maintainer documentation for EKF and UKF behavior, timeouts, frame modes, per-sensor inputs, Mahalanobis rejection thresholds, and process and initial covariance.",
    },
    {
      label: "robot_localization — Configuring sensor fusion",
      url: "https://github.com/cra-ros-pkg/robot_localization/blob/rolling-devel/doc/configuring_robot_localization.rst",
      useFor:
        "Maintainer guidance for selecting non-duplicated state variables, planar constraints, absolute versus differential inputs, frames, and credible measurement covariance.",
    },
    {
      label: "SLAM Toolbox — maintained ROS 2 repository",
      url: "https://github.com/SteveMacenski/slam_toolbox",
      useFor:
        "Maintainer description of scan matching, pose graphs, loop closure, graph optimization, map serialization, and localization modes used in the mapping exercises.",
    },
    {
      label: "Nav2 — AMCL configuration guide",
      url: "https://docs.nav2.org/configuration/packages/configuring-amcl.html",
      useFor:
        "Official Adaptive Monte Carlo Localization contract for map, odometry and base frames, motion and laser models, particle bounds, resampling, initialization, and transform publication.",
    },
  ],
  days: [
    {
      dayId: 71,
      mentalModel:
        "A state estimator is a careful detective: it predicts the hidden situation from motion, checks noisy clues from sensors, and records how uncertain its current story remains.",
      explanation: [
        "State is the smallest set of quantities needed to answer the current engineering question and predict what happens next. For a flat-floor rover it might contain x position, y position, heading, forward velocity, and yaw rate. Motor temperature or battery charge can also be state in another estimator. A state is not automatically every field available in ROS, and it is not the same thing as the latest sensor message.",
        "An observation is what a sensor reports about the state, often indirectly. A wheel encoder reports rotation; wheel geometry turns that into a motion estimate. A gyro reports angular rate; a lidar reports ranges to surfaces. The measurement model explains how a proposed state should create an observation. Each observation needs its original timestamp, unit, sensor frame, validity flags, and covariance before comparison with a prediction.",
        "The process model predicts how state changes between measurements. A simple constant-velocity model says position advances by velocity times elapsed time, but real wheels slip, floors tilt, and commands arrive late. Process noise represents the model changes that were not explicitly predicted. A command is an input to the model, not proof that the robot physically achieved the requested motion.",
        "Uncertainty is part of the estimate, not decoration added afterward. A useful output says both “x is about 10.5 m in odom at time t” and how broad the plausible range is. Independent simulation truth can measure estimator error, but truth must never be fed back as an ordinary sensor during the evaluation. Otherwise the test quietly gives the estimator the answer it is supposed to infer.",
      ],
      keyTerms: [
        {
          term: "State",
          meaning:
            "The hidden quantities the estimator must infer to support prediction or a robot decision.",
          physicalExample:
            "A warehouse rover state contains map x-y pose, heading, forward speed, and yaw rate.",
        },
        {
          term: "Observation",
          meaning:
            "A timestamped sensor measurement that provides incomplete and noisy evidence about state.",
          physicalExample:
            "A gyro sample reports 0.20 rad/s around its mounted z-axis rather than reporting the rover's complete pose.",
        },
        {
          term: "Process model",
          meaning:
            "A rule that predicts the next state from the previous state, elapsed time, controls, and modeled motion uncertainty.",
          physicalExample:
            "A 1 m/s cart is predicted to advance 0.5 m during the next 0.5 s.",
        },
        {
          term: "Measurement model",
          meaning:
            "A rule that predicts what a sensor should observe if a proposed state were true.",
          physicalExample:
            "A pose in a corridor predicts particular lidar distances to the left and right walls.",
        },
        {
          term: "Ground truth",
          meaning:
            "An independent reference used to measure estimation error, not an input secretly used to improve the estimate.",
          physicalExample:
            "Gazebo's internal model pose evaluates wheel-and-IMU fusion after both trajectories are aligned in frame and time.",
        },
      ],
      physicalExamples: [
        {
          title: "Token moving behind a paper screen",
          scenario:
            "A token starts at a measured mark, then a second person moves it behind a screen according to a noisy half-metre rule. The observer predicts its position and receives one imperfect peek every third move.",
          lookFor:
            "The predicted position continues between peeks, the peek is evidence rather than truth, and the plausible interval widens when several moves are hidden.",
        },
        {
          title: "Shopping trolley on two floor surfaces",
          scenario:
            "The same forward push sends an unpowered trolley farther on smooth tile than on a rough mat, even though the requested push and elapsed time are identical.",
          lookFor:
            "The command describes intention, while wheel or ruler measurements describe motion; the process model needs uncertainty for the unmodeled surface change.",
        },
      ],
      workedExample: {
        title: "Keep prediction, observation, and correction as separate claims",
        setup:
          "At 4.0 s, a one-dimensional cart state is x = 10.0 m with velocity v = 1.0 m/s. The process model assumes constant velocity for 0.5 s. A range-derived observation at 4.5 s reports z = 12.0 m.",
        steps: [
          "Write the state and reference first: x = 10.0 m in the track frame at 4.0 s, with v = 1.0 m/s.",
          "Compute elapsed time from timestamps: Δt = 4.5 - 4.0 = 0.5 s.",
          "Apply only the process model: x⁻ = x + vΔt = 10.0 + 1.0 × 0.5 = 10.5 m.",
          "Keep the observation separate: z = 12.0 m in the same track frame at 4.5 s.",
          "Calculate the innovation, or measurement surprise: z - x⁻ = 12.0 - 10.5 = 1.5 m.",
          "Stop before inventing a correction weight: without process and measurement uncertainty, the evidence supports a prediction and innovation but not a justified fused state.",
        ],
        result:
          "The prediction is 10.5 m and the observation is 12.0 m, producing a 1.5 m innovation; a later lesson will use modeled uncertainty to decide how much to correct.",
        takeaway:
          "Writing each quantity's source, frame, time, and assumption prevents a measurement from silently replacing the state.",
      },
      handsOn: {
        setup:
          "Use a spreadsheet or short script and a stationary paper track. Generate or record data only; do not command powered hardware.",
        steps: [
          "Define a one-dimensional hidden trajectory with position and velocity at 0.5 s intervals, including one interval whose true velocity changes unexpectedly.",
          "Generate a commanded-velocity column, a constant-velocity prediction column, and a separate noisy position-observation column with timestamps.",
          "Hide the true-position column, calculate predictions and innovations, then label which values are state, control, observation, model output, and evaluation truth.",
          "Reveal truth and calculate prediction error without using truth to alter any prediction.",
          "Delay one observation by one time step and show why matching it to the newest prediction creates a false innovation.",
          "Save the input table, formulas or script version, one nominal row, the delayed row, and a note naming the exact missing uncertainty needed before fusion.",
        ],
        observe:
          "The process prediction follows the assumed motion and misses the unexpected change; a delayed observation can look physically impossible even when its original measurement was reasonable.",
        doneWhen:
          "Another person can identify every column's role, reproduce the 10.5 m prediction and 1.5 m innovation, and explain why no fused answer was claimed yet.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION],
        workExample:
          "Define the state, input, observation, frame, timing, and truth boundaries for an AMR localization component before integrating wheel encoders, IMU, lidar, and navigation consumers.",
        interviewPrompt:
          "A robot command says it moved one metre, wheel odometry says 0.92 m, and a lidar update suggests 1.08 m. Separate state, controls, observations, models, uncertainty, and ground truth before proposing a fix.",
      },
      commonMistakes: [
        {
          mistake: "Calling the latest sensor value the robot state.",
          correction:
            "Treat the value as one timestamped observation and combine it with a declared process model, measurement model, and uncertainty.",
        },
        {
          mistake: "Using a commanded velocity as proof of actual motion.",
          correction:
            "Keep control input and measured response separate; slip, saturation, delay, collision, or a disabled drive can break the command-to-motion assumption.",
        },
        {
          mistake: "Feeding simulation ground truth into the filter being evaluated.",
          correction:
            "Reserve truth for independent error calculation and document every estimator input so the acceptance test cannot leak the answer.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is a wheel encoder observation not automatically robot position?",
          answer:
            "It measures wheel rotation; geometry and a no-slip motion model convert rotations into an accumulating position estimate.",
        },
        {
          question: "What extra information belongs with a numeric observation?",
          answer:
            "At minimum its timestamp, unit, frame, measured variable, validity state, and uncertainty or covariance.",
        },
        {
          question: "Why keep ground truth outside the estimator?",
          answer:
            "Ground truth is the independent answer used to measure error; fusing it would invalidate the evaluation.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The labelled prediction-and-observation table already exposes this lesson's relationships more precisely than a second generic sense-think-act diagram.",
      },
    },
    {
      dayId: 72,
      mentalModel:
        "A probability distribution is a cloud of plausible answers; its centre summarizes the guess, while its width and tilt record how uncertainty is spread and coupled.",
      explanation: [
        "A single best pose hides alternatives. A belief distribution assigns probability to plausible states, so two estimators can report the same mean position while expressing very different confidence. A narrow bell-shaped belief says values near the mean are much more plausible under the model. A broad belief says the evidence cannot distinguish a larger region. Probability describes belief under assumptions; it does not promise where the physical robot must be.",
        "Variance measures average squared distance from the mean. If position is measured in metres, position variance is in square metres; standard deviation is the square root and returns to metres. Squaring prevents positive and negative errors from canceling. A small variance can be honestly precise, or dangerously overconfident when bias, wrong frames, stale time, or an unmodeled failure shifts every sample together.",
        "For several state dimensions, covariance records both individual spreads and paired movement. Positive x-y covariance means x and y errors tend to move above or below their means together; negative covariance means they tend to move in opposite directions. A covariance ellipse turns the matrix into a picture: its long axis shows the weakly known direction, and its tilt shows coupling. Covariance must use compatible state ordering and units.",
        "Mean and covariance do not describe every belief. A robot in a repeated corridor may plausibly be near either of two identical doors; one mean between them can land inside a wall where no good hypothesis exists. Particle and grid beliefs can preserve several modes. Before using a Gaussian ellipse, inspect whether the actual errors form one roughly oval cluster and whether claimed intervals contain truth at the expected rate.",
      ],
      keyTerms: [
        {
          term: "Belief distribution",
          meaning:
            "A probability assignment over the states the estimator currently considers plausible.",
          physicalExample:
            "After losing lidar, a rover's possible x positions spread along the aisle instead of remaining one exact point.",
        },
        {
          term: "Mean",
          meaning:
            "The probability-weighted centre of a distribution, often used as one summary estimate.",
          physicalExample:
            "Errors of -1, 0, and 1 cm have a mean of 0 cm even though two readings are not zero.",
        },
        {
          term: "Variance",
          meaning:
            "The mean squared spread around the mean, expressed in the square of the original unit.",
          physicalExample:
            "Position samples in metres produce position variance in m².",
        },
        {
          term: "Standard deviation",
          meaning:
            "The square root of variance, restoring the original measurement unit for a spread scale.",
          physicalExample:
            "A variance of 0.04 m² has a standard deviation of 0.20 m.",
        },
        {
          term: "Covariance",
          meaning:
            "A matrix describing per-variable spread and how pairs of state errors vary together.",
          physicalExample:
            "A diagonal corridor makes longitudinal x error grow together with y error, tilting the position ellipse.",
        },
        {
          term: "Multimodal belief",
          meaning:
            "A distribution with more than one separate region of high probability.",
          physicalExample:
            "Two identical warehouse bays produce two believable lidar-based pose clusters.",
        },
      ],
      physicalExamples: [
        {
          title: "Same centre, different scatter",
          scenario:
            "Two groups of washers are placed around the same centre mark. One group fits inside a small circle; the other spreads across most of the paper.",
          lookFor:
            "Both groups can have the same mean, but the wider group has larger variance and should support a less confident position claim.",
        },
        {
          title: "Tilted cloud on graph paper",
          scenario:
            "Pairs of x-y error marks lie mainly along a rising diagonal, so points with positive x error also tend to have positive y error.",
          lookFor:
            "The cloud's tilt represents positive covariance; separate x and y error bars would hide the coupled weak direction.",
        },
      ],
      workedExample: {
        title: "Build a two-dimensional covariance from three error samples",
        setup:
          "Three synchronized x-y position-error samples in metres are (-1, -0.5), (0, 0), and (1, 0.5). Use population covariance because these three rows are the complete teaching set.",
        steps: [
          "Compute the x mean: (-1 + 0 + 1) / 3 = 0 m, and the y mean: (-0.5 + 0 + 0.5) / 3 = 0 m.",
          "Compute x variance: ((-1)² + 0² + 1²) / 3 = 2/3 ≈ 0.667 m².",
          "Compute y variance: ((-0.5)² + 0² + 0.5²) / 3 = 0.5/3 ≈ 0.167 m².",
          "Multiply paired deviations and average: ((-1)(-0.5) + 0 + (1)(0.5)) / 3 = 1/3 ≈ 0.333 m².",
          "Assemble the symmetric matrix with variances on the diagonal and covariance off diagonal: [[0.667, 0.333], [0.333, 0.167]] m².",
          "Interpret before trusting: the positive off-diagonal value and exact y = 0.5x pattern make a thin rising ellipse, but three designed samples do not validate a real sensor model.",
        ],
        result:
          "The belief is much more spread in x than y and the errors are strongly positively coupled; a tilted ellipse communicates information that two independent error bars omit.",
        takeaway:
          "Covariance has state order, squared units, and geometry; it is not a free confidence number that can be copied between variables.",
      },
      handsOn: {
        setup:
          "Use graph paper plus a spreadsheet or Python with 30 synthetic x-y error samples. Keep the random seed and generation settings.",
        steps: [
          "Generate one tight circular error cloud centred at zero and one wide cloud with the same centre; calculate mean, variance, standard deviation, and covariance for each.",
          "Generate a third cloud using y error approximately equal to 0.5 times x error plus small noise, then calculate the off-diagonal covariance.",
          "Plot all three with identical axis scales and draw or compute their one-standard-deviation ellipse directions.",
          "Add a constant 0.40 m x bias to the tight cloud and compare its small spread with its now-large mean error.",
          "Check how often independent zero truth falls inside a declared interval across the samples instead of judging confidence from ellipse size alone.",
          "Save the seed, raw rows, formulas, plots, units, and one sentence distinguishing covariance belief from independently measured error.",
        ],
        observe:
          "Changing spread changes covariance, coupling tilts the cloud, and adding constant bias can leave covariance nearly unchanged while making every estimate wrong.",
        doneWhen:
          "The three plots and matrices agree, units are correct, and the report refuses to call the biased tight cloud accurate merely because it looks confident.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Audit pose covariance and measured localization errors for an AMR release, identifying a directionally weak estimate and a confidently biased configuration before navigation consumes it.",
        interviewPrompt:
          "Two localizers have identical mean error, but one reports a tilted covariance ellipse and the other a tiny circle. Explain covariance, bias, multimodality, and the tests needed before choosing either.",
      },
      commonMistakes: [
        {
          mistake: "Reporting variance in the original measurement unit.",
          correction:
            "Variance uses squared units such as m² or rad²; report standard deviation when a spread value in metres or radians is easier to interpret.",
        },
        {
          mistake: "Treating covariance as measured pose error.",
          correction:
            "Covariance is the estimator's modeled uncertainty; calculate actual error against an independent reference in the same frame and time.",
        },
        {
          mistake: "Averaging two separate pose modes and calling the mean the likely pose.",
          correction:
            "Inspect the full belief; a grid or particle representation can preserve separate hypotheses that one Gaussian mean would hide.",
        },
      ],
      checkQuestions: [
        {
          question: "What are the units of variance for x measured in metres?",
          answer:
            "Square metres, m²; the corresponding standard deviation is in metres.",
        },
        {
          question: "What does positive x-y covariance say?",
          answer:
            "Relative to their means, x and y errors tend to rise or fall together.",
        },
        {
          question: "Can a small covariance prove small localization error?",
          answer:
            "No. Bias or a wrong model can produce a tight but incorrect belief; compare with independent truth and coverage.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "Same-centre clouds, tilted covariance ellipses, and separated modes are geometric uncertainty relationships that are materially clearer when plotted together.",
      },
    },
    {
      dayId: 73,
      mentalModel:
        "A Bayes filter repeatedly spreads yesterday's belief through possible motion, scores each new possibility against today's clue, and renormalizes the surviving possibilities.",
      explanation: [
        "A Bayes filter stores a belief about current state instead of one unquestioned answer. The prior is the belief before processing the newest observation. In the prediction step, the motion or process model moves probability from old states to possible new states. Because the same command can produce several outcomes, prediction usually spreads belief and increases uncertainty rather than sliding one perfect dot.",
        "The measurement update asks how likely the received observation would be for each proposed state. That score is the likelihood. Multiplying likelihood by predicted belief favours states that were already plausible and also explain the observation. Likelihood is not the probability of the state, and its values do not have to sum to one across states. The products become a posterior only after normalization.",
        "Normalization divides every unnormalized weight by their total so the posterior sums to one. A repeated corridor can retain two strong hypotheses because one clue fits two locations. A later distinctive observation may remove one mode. A filter should not erase ambiguity simply to produce a convenient single pose; navigation may need to wait, seek information, or use a bounded recovery policy.",
        "The algorithm is only as honest as its transition and measurement models. A motion model that ignores wheel slip can push probability too far. A sensor model that claims impossible certainty can delete the true state after one unusual scan. Zero total weight is a model or data failure requiring a defined fallback, not permission to divide by zero or silently reset near the goal.",
      ],
      keyTerms: [
        {
          term: "Prior",
          meaning:
            "The state belief available before the newest measurement update.",
          physicalExample:
            "Before seeing a doorway, a hidden token is believed to be under the middle two of four cups.",
        },
        {
          term: "Prediction",
          meaning:
            "The process-model step that moves the previous belief through possible motion outcomes.",
          physicalExample:
            "A one-cell-right command moves most probability right but leaves some in place because wheels can slip.",
        },
        {
          term: "Likelihood",
          meaning:
            "How compatible an observation is with each proposed state under the sensor model.",
          physicalExample:
            "A door-detected clue scores cells near mapped doors higher than blank wall cells.",
        },
        {
          term: "Posterior",
          meaning:
            "The normalized state belief after combining the prediction with the newest observation.",
          physicalExample:
            "After a noisy door reading, one corridor location holds 83% of the belief but alternatives remain.",
        },
        {
          term: "Normalization",
          meaning:
            "Dividing weights by their total so all posterior probabilities sum to one.",
          physicalExample:
            "Weights 0.02, 0.40, and 0.06 are divided by 0.48.",
        },
        {
          term: "Recursive filter",
          meaning:
            "An estimator that carries the previous belief forward rather than recomputing from the entire history every cycle.",
          physicalExample:
            "Each corridor update uses yesterday's posterior as today's starting belief.",
        },
      ],
      physicalExamples: [
        {
          title: "Noisy clue under three cups",
          scenario:
            "A token may be under one of three cups. A move rule shifts it right with occasional slip, and a helper gives a clue that is usually, but not always, correct.",
          lookFor:
            "Motion redistributes the prior before the clue is scored; a noisy clue changes weights without making an unsupported probability-one claim.",
        },
        {
          title: "Two identical corridor doors",
          scenario:
            "A range pattern that means 'doorway on the left' appears at two different places on a long floor plan.",
          lookFor:
            "The measurement update can strengthen both locations, preserving two modes until motion or a distinctive landmark separates them.",
        },
      ],
      workedExample: {
        title: "Complete one discrete predict-and-update cycle",
        setup:
          "After a motion prediction, a robot has belief [0.20, 0.50, 0.30] over corridor cells A, B, and C. A door sensor fires. Its likelihood for that observation is [0.10, 0.80, 0.20].",
        steps: [
          "Confirm both arrays use the same ordered states A, B, C; otherwise element-by-element multiplication would combine unrelated locations.",
          "Multiply cell A: 0.20 × 0.10 = 0.02.",
          "Multiply cell B: 0.50 × 0.80 = 0.40.",
          "Multiply cell C: 0.30 × 0.20 = 0.06.",
          "Add the unnormalized weights: 0.02 + 0.40 + 0.06 = 0.48.",
          "Normalize: [0.02, 0.40, 0.06] / 0.48 ≈ [0.0417, 0.8333, 0.1250], which sums to 1.0000 within rounding.",
        ],
        result:
          "Cell B becomes the strongest hypothesis at about 83.33%, but cells A and C retain nonzero probability because the sensor is not infallible.",
        takeaway:
          "A Bayes update combines what was plausible with what explains the clue; it does not replace history with the newest reading.",
      },
      handsOn: {
        setup:
          "Build a five-cell corridor filter in a spreadsheet or short deterministic script. Use only synthetic data and save every belief vector.",
        steps: [
          "Choose an initial normalized belief and write a motion transition that moves right most of the time, sometimes stays, and never creates negative probability.",
          "Implement prediction and assert that its output is nonnegative and sums to one within a small numeric tolerance.",
          "Create door and no-door likelihood arrays for a map with two similar door locations, then implement multiply-and-normalize update.",
          "Run a sequence of two moves and three observations, saving prior, prediction, likelihood, unnormalized weights, normalizer, and posterior at each cycle.",
          "Deliberately use an all-zero likelihood, verify the normalizer becomes zero, and return a structured model-failure result instead of a fake posterior.",
          "Repair the sensor model with defensible nonzero false-positive and false-negative probabilities, rerun, and compare how ambiguity changes.",
        ],
        observe:
          "Prediction spreads or moves probability, an ambiguous clue preserves two peaks, and an impossible all-zero sensor model makes the update undefined.",
        doneWhen:
          "All normal beliefs remain normalized, the all-zero case fails explicitly, and another person can reproduce the [0.0417, 0.8333, 0.1250] posterior.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION],
        workExample:
          "Implement or diagnose a localization update whose motion and sensor models preserve multiple warehouse pose hypotheses instead of snapping an AMR to the newest scan match.",
        interviewPrompt:
          "Walk through Bayes prediction, likelihood scoring, normalization, and a zero-normalizer failure for a robot that sees the same doorway pattern at two map locations.",
      },
      commonMistakes: [
        {
          mistake: "Calling likelihood the probability that a state is true.",
          correction:
            "Likelihood scores how expected the observation is under each proposed state; combine it with the predicted belief to obtain a posterior.",
        },
        {
          mistake: "Applying the sensor update before the motion prediction for the wrong timestamp.",
          correction:
            "Order controls and observations by their source time and apply each model to the state time it actually describes.",
        },
        {
          mistake: "Silently resetting when all unnormalized weights are zero.",
          correction:
            "Return a visible model or data failure, preserve evidence, and invoke only an explicit, bounded relocalization policy.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does prediction often increase uncertainty?",
          answer:
            "One prior state and control can lead to several physical outcomes because the process model includes motion noise.",
        },
        {
          question: "Why normalize after multiplying prior and likelihood?",
          answer:
            "The products are relative weights; division by their total turns them into a probability distribution summing to one.",
        },
        {
          question: "Can a posterior keep two pose hypotheses?",
          answer:
            "Yes. If two states were plausible and both explain the observation, a correct belief can remain multimodal.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "Seeing probability move, spread, multiply by likelihood, and normalize makes the recursive filtering relationship substantially easier to follow than equations alone.",
      },
    },
    {
      dayId: 74,
      mentalModel:
        "A Kalman-style estimator moves a prediction toward a measurement by an uncertainty-derived amount, but only after frames, timestamps, variables, and noise claims make the two comparable.",
      explanation: [
        "A linear Kalman filter represents belief with a mean and covariance. Prediction applies a linear motion model and adds process noise Q, so uncertainty normally grows. The measurement update computes innovation—the difference between observed and predicted measurement—and innovation uncertainty. Kalman gain then decides how strongly that innovation changes each state variable. The gain is calculated from modeled uncertainty; it is not a hand-chosen percentage for making a plot look smooth.",
        "In one dimension with direct measurement, K = P⁻/(P⁻ + R). Larger predicted variance P⁻ or smaller measurement variance R pulls the estimate farther toward the measurement. Updated covariance becomes smaller in the ideal consistent case because new information was added. These equations assume compatible units, frame, timestamp, approximately Gaussian error, and correct models. A biased sensor can make a mathematically neat filter confidently wrong.",
        "Mobile-robot motion and sensor relationships are nonlinear because heading changes how forward travel affects x and y. An Extended Kalman Filter, or EKF, evaluates a local linear approximation using Jacobians around the current estimate, then performs a Kalman-style correction. Linearization does not repair a bad initial state, severe nonlinearity, wrong transform, or unmodeled bias. Innovation and consistency plots remain necessary.",
        "`robot_localization` provides ROS state-estimation nodes for practical fusion. For a planar rover, a sensible first local estimator may fuse wheel-derived forward and yaw velocity with IMU yaw rate while publishing a smooth `odom→base_link` estimate. The per-sensor configuration is expressed in each input's frame. Do not fuse wheel pose, wheel velocity, and wheel-derived heading as if they were independent evidence, and convert unsupported IMU conventions before fusion.",
        "Sensor fusion should add complementary information. Wheels measure motion against the floor but drift during slip; a gyro responds quickly to rotation but accumulates bias when integrated. Correct timestamps, static sensor transforms, axes, ENU convention where required, calibrated bias, credible covariances, timeouts, and outlier policy matter more than adding more topics. During a timeout, prediction-only output may continue, so uncertainty and diagnostics must expose the lost correction.",
      ],
      keyTerms: [
        {
          term: "Innovation",
          meaning:
            "The difference between an actual measurement and the measurement predicted from current state.",
          physicalExample:
            "A landmark says 1.20 m while the prediction says 1.00 m, giving a 0.20 m innovation.",
        },
        {
          term: "Kalman gain",
          meaning:
            "The uncertainty-derived matrix or scalar that converts innovation into state correction.",
          physicalExample:
            "Gain 0.692 applies about 69.2% of a direct one-dimensional measurement surprise.",
        },
        {
          term: "Process noise Q",
          meaning:
            "Modeled uncertainty added during prediction for unrepresented changes in robot motion.",
          physicalExample:
            "A larger Q during fast turns represents uncertain tire slip and acceleration.",
        },
        {
          term: "Measurement noise R",
          meaning:
            "The covariance assigned to observation noise in the measurement model.",
          physicalExample:
            "A vibrating gyro receives a larger angular-rate R than it had on a rigid bench.",
        },
        {
          term: "Extended Kalman Filter",
          meaning:
            "A Kalman-style filter that locally linearizes nonlinear process and measurement models around the current estimate.",
          physicalExample:
            "A rover EKF linearizes how heading and forward velocity change x-y pose during the next small interval.",
        },
        {
          term: "Bias",
          meaning:
            "A repeatable offset that shifts measurements and is not captured by zero-mean random noise alone.",
          physicalExample:
            "A stationary gyro reports 0.01 rad/s, causing integrated heading to drift steadily.",
        },
      ],
      physicalExamples: [
        {
          title: "Ruler reading versus step count",
          scenario:
            "A hidden cart is predicted from counted wheel turns, then a ruler gives a slightly different visible position with a known reading spread.",
          lookFor:
            "The correction moves toward the ruler by an amount set by relative uncertainty, not by declaring either source perfect.",
        },
        {
          title: "Suitcase wheels and phone gyro",
          scenario:
            "An unpowered wheeled suitcase follows floor distance from wheel marks while a securely attached phone records turn rate during a gentle hand-pushed curve.",
          lookFor:
            "Wheel marks expose slip-sensitive distance, while gyro samples expose fast rotation plus bias; their timestamps and mounted axes must agree before combination.",
        },
      ],
      workedExample: {
        title: "Calculate a scalar Kalman correction and uncertainty",
        setup:
          "A direct position prediction is x⁻ = 1.00 m with predicted variance P⁻ = 0.09 m². A synchronized measurement is z = 1.20 m with variance R = 0.04 m².",
        steps: [
          "Check compatibility: both values are position in the same frame, at the same time, in metres; P⁻ and R are in m².",
          "Compute innovation: y = z - x⁻ = 1.20 - 1.00 = 0.20 m.",
          "Compute gain: K = P⁻ / (P⁻ + R) = 0.09 / 0.13 ≈ 0.6923.",
          "Apply the correction: x⁺ = x⁻ + Ky = 1.00 + 0.6923 × 0.20 ≈ 1.1385 m.",
          "Update variance for this scalar direct-measurement case: P⁺ = (1 - K)P⁻ ≈ 0.3077 × 0.09 ≈ 0.0277 m².",
          "Interpret cautiously: the posterior moved nearer the lower-variance measurement, but only independent truth and repeated consistency tests can show whether P⁺ is credible.",
        ],
        result:
          "The corrected position is about 1.138 m with modeled variance about 0.0277 m²; neither value proves physical accuracy without validation.",
        takeaway:
          "Kalman weighting follows uncertainty math after data contracts pass; it cannot rescue incompatible or biased inputs.",
      },
      handsOn: {
        setup:
          "Use the existing simulated differential-drive rover, wheel odometry, IMU, Gazebo truth, and a short rosbag2 recording. Keep truth out of the EKF inputs.",
        steps: [
          "Inspect wheel and IMU message timestamps, `frame_id`, odometry `child_frame_id`, units, static transforms, mounted axes, covariance fields, rates, and stationary gyro bias.",
          "Create a minimal `robot_localization` EKF configuration in 2D mode that fuses only justified, non-duplicated wheel velocity and IMU angular-rate variables and owns `odom→base_link`.",
          "Replay a nominal straight-turn-straight bag, record raw inputs, `odometry/filtered`, `/tf`, `/diagnostics`, and separate ground truth, then compare pose and heading over aligned time.",
          "Increase IMU R by a documented factor and rerun; compare innovation response, estimate smoothness, lag, and actual error rather than choosing the prettier curve.",
          "Inject one IMU sign or 100 ms timestamp error, reproduce its signature, restore the correct transform or time, and rerun the unchanged nominal bag.",
          "Set a bounded sensor timeout, remove IMU updates for a fixed interval, and verify prediction-only behavior, growing uncertainty or visible limitation, diagnostics, and recovery evidence.",
        ],
        observe:
          "Credible inputs produce a smooth local estimate; covariance changes alter weighting, while a sign or timing fault creates systematic innovations that smoothing cannot legitimately hide.",
        doneWhen:
          "One command replays nominal and faulty cases, exact fused variables are documented, transform ownership is single, truth is evaluation-only, and every configuration comparison retains error plus uncertainty evidence.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Integrate and release-gate a wheel-and-IMU `robot_localization` EKF for an AMR, including input-contract checks, transform ownership, covariance tuning evidence, fault replay, and dropout diagnostics.",
        interviewPrompt:
          "An EKF output looks smooth but turns lag and the reported covariance is tiny. Explain innovation, Q, R, bias, duplicate wheel information, frames, timestamps, and the experiment order you would use.",
      },
      commonMistakes: [
        {
          mistake: "Setting a sensor covariance nearly to zero to force the filter to trust it.",
          correction:
            "Estimate covariance from representative residuals and validate consistency; tiny R turns noise, bias, frame, and timing faults into overconfident state errors.",
        },
        {
          mistake: "Fusing wheel-derived pose, heading, and velocity as independent measurements.",
          correction:
            "Trace each field to its physical source and fuse a non-duplicated subset unless cross-correlation is modeled explicitly.",
        },
        {
          mistake: "Treating IMU axes and timestamps as tuning problems.",
          correction:
            "Correct the mounted transform, convention, units, bias handling, and source time before changing Q, R, gain, or rejection thresholds.",
        },
      ],
      checkQuestions: [
        {
          question: "What happens to scalar Kalman gain when R grows while P⁻ stays fixed?",
          answer:
            "K decreases, so the correction moves less toward that measurement.",
        },
        {
          question: "Why can a smooth EKF output still be wrong?",
          answer:
            "Bias, duplicate evidence, incorrect models, frames, timestamps, or covariances can produce smooth but inaccurate and overconfident estimates.",
        },
        {
          question: "What should own `odom→base_link` in this exercise?",
          answer:
            "The one configured local `robot_localization` estimator; competing publishers must be disabled.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "Prediction width, measurement width, innovation, gain-weighted correction, and posterior width form a fusion relationship that benefits directly from one synchronized uncertainty visual.",
      },
    },
    {
      dayId: 75,
      mentalModel:
        "Scan matching lays two imperfect range drawings over each other, occupancy mapping records what rays crossed and struck, and every small alignment mistake can accumulate into localization drift.",
      explanation: [
        "Scan matching estimates relative motion by finding a transform that makes a current lidar scan agree with a previous scan, local submap, or map. An optimizer scores candidate transforms using point or likelihood agreement. The lowest residual found is only the best result inside that search and model. Repeated walls, low overlap, moving people, glass, bad timestamps, and a poor starting guess can produce a convincing but physically wrong alignment.",
        "Occupancy mapping asks a different question: given a pose and range observation, which cells were probably free and which endpoint was probably occupied? A simple inverse sensor model lowers occupancy belief along the ray and raises it near a valid obstacle return. Unknown is not free, maximum-range readings need declared handling, and repeated evidence should update belief without becoming impossible certainty after one scan.",
        "Drift is accumulating disagreement between estimated and true pose. Wheel-scale error, scan-match bias, wrong lidar extrinsics, unsynchronized motion, and repeated local minima can each add a small error every cycle. A map may still look tidy because nearby scans agree while the entire route bends or stretches. Measure drift against simulation truth or surveyed references after transforming pose and truth into the same frame and time.",
        "Mapping and localization reuse some observations but estimate different unknowns. During mapping, scan alignment helps estimate trajectory while occupancy and pose-graph state are built. During localization in an approved static map, the map is held fixed and pose changes. Keep raw scans, odometry prior, chosen match, residuals, map settings, transforms, and truth separate enough to diagnose whether a bad wall came from sensing, pose, or occupancy update.",
      ],
      keyTerms: [
        {
          term: "Scan matching",
          meaning:
            "Estimating relative pose by aligning current range observations with another scan, submap, or map.",
          physicalExample:
            "Two lidar outlines of the same corner align after a 0.12 m translation and 0.03 rad rotation.",
        },
        {
          term: "Correspondence",
          meaning:
            "A proposed relationship between observed geometry in two data sets or between a scan and map.",
          physicalExample:
            "A current wall segment is paired with the earlier wall segment believed to represent the same surface.",
        },
        {
          term: "Residual",
          meaning:
            "The disagreement remaining between transformed observations and the model being matched.",
          physicalExample:
            "After alignment, point-to-wall distances average 0.04 m under the selected score.",
        },
        {
          term: "Inverse sensor model",
          meaning:
            "A rule for updating map-cell belief from a sensor reading and an assumed sensor pose.",
          physicalExample:
            "Cells crossed by a valid lidar ray become more likely free, while the hit cell becomes more likely occupied.",
        },
        {
          term: "Occupancy grid",
          meaning:
            "A map of equal cells whose values encode occupied, free, or unknown belief.",
          physicalExample:
            "At 0.05 m resolution, a 1 m-wide obstacle spans about 20 cells.",
        },
        {
          term: "Localization drift",
          meaning:
            "Accumulated difference between estimated pose and independently referenced pose over travel or time.",
          physicalExample:
            "Ten slightly short one-metre estimates end 0.10 m behind the surveyed finish mark.",
        },
      ],
      physicalExamples: [
        {
          title: "Transparent hallway scan cards",
          scenario:
            "Two transparent sheets carry range points drawn from slightly different positions in a corridor. Sliding and rotating them can align both parallel walls at several longitudinal offsets.",
          lookFor:
            "A visually low residual does not choose the correct offset in symmetric geometry; an odometry prior or distinctive end wall provides missing information.",
        },
        {
          title: "Flashlight ray across a square grid",
          scenario:
            "A paper ray starts at a known sensor cell, crosses empty squares, and ends on a cardboard box, while areas outside the ray remain unobserved.",
          lookFor:
            "Traversed cells support free belief, the endpoint supports occupied belief, and untouched cells remain unknown rather than being painted free.",
        },
      ],
      workedExample: {
        title: "Measure how a tiny systematic match error becomes drift",
        setup:
          "A rover truly advances 1.00 m on each of ten straight segments. Its scan-matching pipeline systematically estimates each segment as 0.99 m.",
        steps: [
          "Calculate per-segment signed error: estimated minus true = 0.99 - 1.00 = -0.01 m.",
          "Sum true travel: 10 × 1.00 = 10.00 m.",
          "Sum estimated travel: 10 × 0.99 = 9.90 m.",
          "Calculate final signed position error: 9.90 - 10.00 = -0.10 m.",
          "Report drift magnitude as 0.10 m over 10.00 m, or 1%, while retaining the negative sign separately to show the estimate is short.",
          "Reject the claim that every match was correct merely because -0.01 m looked small; the repeated systematic direction is the causal signature.",
        ],
        result:
          "A one-centimetre error per one-metre match accumulates into a ten-centimetre final error after ten segments.",
        takeaway:
          "Small independent noise may partly cancel, but a repeated bias integrates; plot signed error over distance instead of inspecting only local residuals.",
      },
      handsOn: {
        setup:
          "Replay a saved Gazebo lidar-and-odometry route with ground truth. Use SLAM Toolbox or the existing scan-matching path; do not drive physical hardware.",
        steps: [
          "Freeze one pair of scans with source timestamps and transforms, overlay them at the odometry prior, and record overlap plus the initial residual or score.",
          "Run the matcher, save the selected transform and residual, then compare estimated relative motion with time-aligned Gazebo relative motion.",
          "Repeat on an open corner and a symmetric corridor, preserving alternative candidate transforms instead of saving only the winner.",
          "Build the occupancy map from the same route and inspect valid hit endpoints, free ray paths, unknown cells, maximum-range handling, resolution, and lidar extrinsics.",
          "Inject one documented lidar timestamp offset or extrinsic yaw error, rerun the unchanged route, and plot signed position and heading error versus travelled distance.",
          "Restore the correct value and produce a table separating scan residual, relative-pose error, final drift, and visible map symptom for nominal and faulty runs.",
        ],
        observe:
          "The symmetric scene can accept a wrong low-residual transform, while a timing or extrinsic fault creates directional drift and duplicated or bent map structure.",
        doneWhen:
          "The nominal and faulty maps are reproducible, match residual is never presented as pose truth, and the report traces one map defect to a timestamp, transform, or alignment cause.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Diagnose an AMR map that bends after long aisles by correlating scan-match candidates, odometry priors, lidar timing and extrinsics, occupancy updates, and ground-truth drift.",
        interviewPrompt:
          "A scan matcher reports a low residual but the completed warehouse loop misses its start by 0.4 m. Explain symmetry, initialization, correspondences, timing, extrinsics, occupancy evidence, and decisive tests.",
      },
      commonMistakes: [
        {
          mistake: "Using low scan-matching residual as proof of correct global pose.",
          correction:
            "Compare with motion priors, distinctive geometry, alternative candidates, transform and timing checks, and independent pose reference.",
        },
        {
          mistake: "Marking every cell beyond or beside a lidar ray as free.",
          correction:
            "Update only cells supported by the declared inverse sensor model; unobserved space remains unknown.",
        },
        {
          mistake: "Tuning map resolution until the map looks sharp without measuring pose error.",
          correction:
            "Freeze the route and compare map settings using localization drift, residual distributions, compute cost, and reference geometry.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a symmetric corridor produce a wrong low-residual scan match?",
          answer:
            "Several longitudinal shifts can align similar parallel walls, so geometry alone does not uniquely determine pose.",
        },
        {
          question: "What does a valid lidar ray usually say about cells before its hit?",
          answer:
            "They receive evidence of free space; the valid endpoint receives occupied evidence and untouched cells remain unknown.",
        },
        {
          question: "What distinguishes residual from localization error?",
          answer:
            "Residual measures fit to the matcher model, while localization error compares estimated pose with an independent reference in common frame and time.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "Actual nominal and ambiguous scan overlays plus a residual-versus-truth table are more diagnostic here than another generic mapping illustration.",
      },
    },
    {
      dayId: 76,
      mentalModel:
        "A pose graph is a route held by measured elastic links, loop closure adds a long link back to a known place, and AMCL tests many robot cut-outs against a finished map.",
      explanation: [
        "A pose graph represents selected robot poses as nodes and relative observations as edges. Consecutive edges can come from odometry or scan matching; a loop edge connects poses believed to show the same place at different times. Each edge carries a measured relative transform and uncertainty. Graph optimization adjusts node poses to reduce weighted constraint disagreement, distributing correction instead of pretending the final node alone caused all drift.",
        "Loop closure is a data-association decision before it is an optimization result. A true closure can straighten a bent route and align repeated walls. A false closure tells the optimizer that two different places are the same, potentially warping the whole map while achieving a low mathematical cost. Require appearance or geometric agreement, a plausible relative transform, consistency with other constraints, and before/after residual inspection rather than accepting every proposed revisit.",
        "AMCL solves localization in an existing static map with a particle filter. Each particle is a pose hypothesis. The motion model moves particles according to odometry plus noise; the laser model weights particles by how well predicted ranges agree with the real scan; resampling concentrates computation on stronger hypotheses while retaining policy for recovery. A particle cloud can represent several locations, unlike one Gaussian mean and covariance.",
        "Global correction belongs in the frame chain, not in a teleporting local controller signal. Smooth local odometry owns `odom→base_link`; SLAM during mapping or AMCL during saved-map localization normally supplies `map→odom`. When loop closure or localization changes the global belief, `map→odom` can change while the odometry history stays continuous. Only one active component should own that transform in each operating mode.",
        "Mapping and saved-map localization are separate operating modes. Build and optimize with SLAM Toolbox, save the map and pose-graph provenance, stop the mapping authority, then launch the approved static map with AMCL. Initialize with an honest pose distribution, not a magic exact point. Test nominal start, broad initial uncertainty, a repeated corridor, and a controlled localization disturbance before navigation trusts the pose.",
      ],
      keyTerms: [
        {
          term: "Pose graph",
          meaning:
            "A graph whose nodes are robot poses and whose edges are uncertain relative-pose constraints.",
          physicalExample:
            "Ten route poses are pins connected by bands representing odometry and scan matches.",
        },
        {
          term: "Constraint",
          meaning:
            "A measured relationship between states, paired with uncertainty that determines its optimization weight.",
          physicalExample:
            "An edge says pose B is 1.0 m ahead of pose A with a stated covariance.",
        },
        {
          term: "Loop closure",
          meaning:
            "A constraint asserting that a current observation revisits a place represented earlier in the graph.",
          physicalExample:
            "The final scan at the loading dock is matched to the starting-dock scan after circling the warehouse.",
        },
        {
          term: "Constraint residual",
          meaning:
            "The disagreement between a measured graph edge and the relationship implied by current node poses.",
          physicalExample:
            "The optimized start-to-finish relationship still disagrees with the closure measurement by 0.03 m.",
        },
        {
          term: "Particle",
          meaning:
            "One weighted sample representing a possible robot pose in a particle-filter belief.",
          physicalExample:
            "One AMCL particle proposes that the rover is beside bay A facing east.",
        },
        {
          term: "map→odom correction",
          meaning:
            "The global transform that aligns smooth drifting odometry with the current map-based pose belief.",
          physicalExample:
            "AMCL shifts the odometry trajectory 0.25 m in map without rewriting past wheel increments.",
        },
      ],
      physicalExamples: [
        {
          title: "Pins and elastic route bands",
          scenario:
            "Pins mark poses on a board and elastic bands mark noisy relative constraints. The route nearly closes, so a verified final-to-start band gently redistributes the gap.",
          lookFor:
            "A correct loop improves agreement across many edges; attaching the band to the wrong similar-looking pin distorts the entire route.",
        },
        {
          title: "Transparent robot hypotheses on a map",
          scenario:
            "Several clear robot cut-outs sit on a printed floor plan with range rays drawn toward walls. After a motion and scan, poorly matching cut-outs are removed or copied less often.",
          lookFor:
            "The collection, not one cut-out, is the belief; repeated rooms can retain separate groups until a distinctive observation arrives.",
        },
      ],
      workedExample: {
        title: "Quantify a square-route closure before accepting its loop",
        setup:
          "A square route should return to (0.00, 0.00) m in map, but odometry ends at (0.25, -0.10) m. After adding a verified loop and optimizing, the end is (0.04, -0.02) m.",
        steps: [
          "Calculate pre-closure displacement error: √(0.25² + (-0.10)²) = √0.0725 ≈ 0.269 m.",
          "Keep signed components as evidence: +0.25 m in x and -0.10 m in y can reveal directional bias hidden by one magnitude.",
          "Calculate post-optimization displacement error: √(0.04² + (-0.02)²) = √0.0020 ≈ 0.0447 m.",
          "Calculate magnitude reduction: (0.269 - 0.0447) / 0.269 ≈ 0.834, or about 83.4%.",
          "Inspect residuals on all odometry, scan, and loop edges; a smaller endpoint error alone could hide distortion elsewhere.",
          "Verify the closure's place identity and compare the optimized trajectory with independent truth or surveyed landmarks before accepting the corrected map.",
        ],
        result:
          "Endpoint closure magnitude falls from about 0.269 m to 0.0447 m, but acceptance still depends on correct data association and distributed residual and reference checks.",
        takeaway:
          "Optimization can reduce a number even for a bad constraint; validate the loop's identity and the whole map, not only the final gap.",
      },
      handsOn: {
        setup:
          "Use the existing Gazebo route, lidar and odometry bags, SLAM Toolbox, a saved map, AMCL, RViz, and simulation truth.",
        steps: [
          "Run mapping mode on a fixed loop, save raw bag, map, serialized pose graph, transforms, candidate loop evidence, and trajectory before and after optimization.",
          "Calculate closure error, inspect graph residual changes, and compare the optimized trajectory with time-aligned Gazebo truth at several points rather than only the endpoint.",
          "Record one ambiguous or rejected loop candidate and the geometric, transform, timing, and residual evidence that prevented automatic acceptance.",
          "Stop the mapping authority, load the approved static map, launch AMCL as the sole `map→odom` publisher, and initialize with a deliberately broad but plausible pose distribution.",
          "Run a distinctive-area and repeated-corridor trial, preserving particle clouds, scan agreement, estimated pose, covariance, transform freshness, and truth error.",
          "Inject a controlled bad initial pose or temporary scan loss, apply the declared relocalization policy, and measure whether pose error returns within its bound without competing transforms or unsafe commands.",
        ],
        observe:
          "A verified loop distributes global correction while local odometry stays smooth; AMCL particles may remain split in repeated geometry and concentrate after a distinctive scan.",
        doneWhen:
          "Mapping and localization launches have one global transform authority each, closure and AMCL claims are backed by independent error, and the ambiguous and recovery cases remain in the evidence set.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Commission a warehouse map and saved-map localization stack, reject a false loop candidate, enforce single `map→odom` ownership, and qualify AMCL initialization and relocalization across repeated aisles.",
        interviewPrompt:
          "Explain how pose-graph loop closure differs from AMCL localization, why a false loop is dangerous, how `map→odom` preserves smooth local motion, and how you would prove recovery.",
      },
      commonMistakes: [
        {
          mistake: "Accepting a loop because optimization reduced total cost or endpoint gap.",
          correction:
            "Verify place identity, relative transform plausibility, graph-wide residuals, map geometry, and independent trajectory references.",
        },
        {
          mistake: "Running SLAM mapping and AMCL as simultaneous `map→odom` publishers.",
          correction:
            "Define separate mapping and saved-map localization modes and assert one intended transform authority before movement.",
        },
        {
          mistake: "Calling a tight AMCL particle cloud proof of accurate localization.",
          correction:
            "Check scan-to-map agreement, timestamps, transforms, initial-pose policy, covariance consistency, and independent pose error.",
        },
      ],
      checkQuestions: [
        {
          question: "What do pose-graph nodes and edges represent?",
          answer:
            "Nodes represent selected poses; edges represent uncertain relative-pose constraints from motion, observations, or loop closures.",
        },
        {
          question: "Why can a false loop closure damage more than a missed loop?",
          answer:
            "A false global constraint can warp many poses and the map, while a missed loop usually leaves existing drift visible.",
        },
        {
          question: "Which transform should AMCL normally publish in saved-map mode?",
          answer:
            "`map→odom`, while the local odometry source continues to provide smooth `odom→base_link`.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "Week 8 already diagrams the frame chain; real pose-graph residual plots and RViz particle evidence avoid repeating a generic localization map.",
      },
    },
    {
      dayId: 77,
      mentalModel:
        "A localization report is a weather forecast scorecard: it compares the estimate with independent truth, checks whether confidence was honest, and records what happened when observations disappeared.",
      explanation: [
        "Start with a frozen evaluation question and reference. Simulation ground truth, motion capture, surveyed fiducials, or another documented method can supply pose truth, but estimate and truth must share frame, time, angle convention, and sample policy. Preserve scenarios, seeds, route, speeds, sensor settings, software versions, warm-up exclusions, and all failed runs before computing aggregate numbers.",
        "Measure more than one average. Position RMSE penalizes large errors, mean absolute error is easier to interpret, maximum error exposes the worst observed miss, and heading error needs angle wrap handling. Also record drift versus distance, transform age, update latency, localization-loss count, and time outside the task tolerance. Break results down by nominal, repeated geometry, loop closure, outlier, and dropout conditions.",
        "Uncertainty needs calibration evidence. Covariance is an internal claim; coverage asks how often independent truth falls inside the claimed interval or region. Too little coverage signals overconfidence, while extremely broad intervals can achieve high coverage without being useful. Inspect normalized innovations or another appropriate consistency statistic when available, but state its model assumptions and do not replace pose-error measurement with it.",
        "A dropout trial has explicit phases: healthy baseline, observation removal, prediction-only period, observation return, validation, and either recovered or failed terminal state. Define detection time, allowed behavior while uncertain, maximum error, maximum uncertainty, recovery threshold, required sustained duration, jump limit, and retry or stop policy before the run. The first fresh scan is not recovery if pose remains wrong or unstable.",
        "The final package connects configuration to raw evidence and decision. Include architecture and frame ownership, sensors and calibration, process and measurement models, Q and R settings, initialization, map provenance, trial manifest, metrics with denominators, uncertainty plots, dropout timelines, bags, exact commands, failure taxonomy, limitations, and a release verdict. A neat map or successful demo is supporting evidence, never the complete claim.",
      ],
      keyTerms: [
        {
          term: "Localization error",
          meaning:
            "The pose difference between estimate and an independent reference after frame and time alignment.",
          physicalExample:
            "Estimated x-y position is 0.12 m from Gazebo truth at the same timestamp.",
        },
        {
          term: "RMSE",
          meaning:
            "The square root of mean squared error, which gives larger misses extra influence.",
          physicalExample:
            "Position errors 0.05, 0.12, and 0.07 m produce RMSE about 0.085 m.",
        },
        {
          term: "Coverage",
          meaning:
            "The fraction of independent truth samples contained by a stated uncertainty interval or region.",
          physicalExample:
            "Only 80 of 100 truth poses fall inside regions claimed to contain 95%.",
        },
        {
          term: "Sensor dropout",
          meaning:
            "A defined interval in which an expected observation source provides no usable updates.",
          physicalExample:
            "Lidar messages are removed from 10.0 s through 13.0 s during bag replay.",
        },
        {
          term: "Recovery time",
          meaning:
            "Elapsed time from the declared recovery start event until all recovery criteria hold for the required duration.",
          physicalExample:
            "Scans return at 13.0 s and error stays below 0.10 m from 14.2 s onward, giving 1.2 s recovery.",
        },
        {
          term: "Failure taxonomy",
          meaning:
            "A stable set of actionable cause categories used to count and investigate failed trials.",
          physicalExample:
            "Failures are separated into timing, transform, sensor, matching, map, initialization, and recovery-policy causes.",
        },
      ],
      physicalExamples: [
        {
          title: "Forecast interval scorecard",
          scenario:
            "A week of weather forecasts gives a temperature range each day, and actual temperatures are later marked against those ranges.",
          lookFor:
            "Narrow ranges that frequently miss are overconfident; extremely wide ranges may cover every day but provide little decision value.",
        },
        {
          title: "Covered trail with measured checkpoints",
          scenario:
            "A toy cart travels behind a cardboard screen using wheel marks, loses occasional visible checkpoints, then reappears beside ruler-measured reference marks.",
          lookFor:
            "Prediction continues while hidden, uncertainty should grow, and recovery is judged by sustained agreement with reference marks rather than the first sighting.",
        },
      ],
      workedExample: {
        title: "Score accuracy, uncertainty, and dropout recovery separately",
        setup:
          "Three aligned position-error magnitudes are 0.05, 0.12, and 0.07 m. In a ten-sample teaching set, only eight truths lie inside the claimed 95% regions. Lidar returns at 13.0 s and error first remains below the 0.10 m recovery bound at 14.2 s.",
        steps: [
          "Square the three errors: 0.05² = 0.0025, 0.12² = 0.0144, and 0.07² = 0.0049 m².",
          "Average the squares: (0.0025 + 0.0144 + 0.0049) / 3 = 0.0072667 m².",
          "Take the square root: RMSE = √0.0072667 ≈ 0.0852 m.",
          "Report maximum observed error separately as 0.12 m; RMSE does not preserve which sample was worst.",
          "Calculate teaching-set coverage: 8 / 10 = 80%, which is below the claimed 95%; ten samples are also too few for a strong production calibration claim.",
          "Calculate recovery time from observation return: 14.2 - 13.0 = 1.2 s, then verify the error stayed within 0.10 m for the predeclared sustained interval.",
        ],
        result:
          "The run has 0.085 m RMSE, 0.12 m maximum error, only 80% observed coverage for a 95% claim, and 1.2 s recovery after lidar returns.",
        takeaway:
          "Accuracy, worst case, uncertainty honesty, and recovery answer different questions; none should be allowed to stand in for the others.",
      },
      handsOn: {
        setup:
          "Use one frozen Gazebo route, a fixed set of seeds, wheel/IMU/lidar bags, the approved map, estimator configuration, AMCL or SLAM mode, and separate truth.",
        steps: [
          "Write acceptance criteria and hard gates for frame and transform ownership, nominal position and heading error, covariance coverage, dropout detection, allowed prediction-only behavior, recovery time, jump size, and terminal state.",
          "Run the nominal seed set and save aligned estimate, covariance, truth, innovations or residuals, transform age, update latency, map or particle evidence, and complete denominators.",
          "Replay the same set with a fixed lidar dropout plus one bounded outlier or timestamp fault, retaining runs that fail initialization or never recover.",
          "Calculate per-run and scenario-level RMSE, mean absolute and maximum error, heading error, time outside tolerance, coverage, loss count, detection time, recovery time, and operator or stop events.",
          "Inspect the worst run and one overconfident run against raw messages, transforms, diagnostics, map, and configuration; assign an actionable cause rather than an outcome-only label.",
          "Package commands, versions, configs, map provenance, seed manifest, raw CSV, plots, bags, calculations, failures, limitations, and a PASS, NEEDS REVISION, or BLOCKED verdict tied to the frozen criteria.",
        ],
        observe:
          "Prediction-only intervals widen uncertainty and accumulate error; observation return may correct pose, oscillate, jump, or fail, and aggregate averages can hide those distinct outcomes.",
        doneWhen:
          "A reviewer can rerun the exact suite, recalculate every headline number from raw rows, inspect the worst dropout trace, and reach the same evidence-limited verdict.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Own the localization release report for an AMR deployment, including calibrated uncertainty checks, fixed dropout and outlier replay, recovery hard gates, traceable failures, and evidence-backed release judgment.",
        interviewPrompt:
          "Design an estimator acceptance test that distinguishes low average error, worst-case error, overconfidence, sensor-dropout behavior, false recovery, and missing evidence before a customer-site release.",
      },
      commonMistakes: [
        {
          mistake: "Reporting only average or RMSE localization error.",
          correction:
            "Add maximum and percentile error, heading, scenario splits, time outside tolerance, loss events, uncertainty coverage, and recovery metrics.",
        },
        {
          mistake: "Using estimator covariance as the ground-truth error curve.",
          correction:
            "Plot covariance as the estimator's claim and calculate error independently from a reference aligned in frame and time.",
        },
        {
          mistake: "Declaring recovery on the first observation after dropout.",
          correction:
            "Require fresh data plus sustained error, uncertainty, transform, jump, and system-state criteria for a predeclared duration.",
        },
        {
          mistake: "Removing failed initialization or non-recovery trials from the denominator.",
          correction:
            "Retain every planned trial, mark predeclared exclusions explicitly, and report actionable failure categories beside aggregate metrics.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the difference between covariance and localization error?",
          answer:
            "Covariance is the estimator's uncertainty claim; localization error is measured against an independent reference in common frame and time.",
        },
        {
          question: "When should dropout recovery time start and end?",
          answer:
            "Start at the declared event, commonly valid observation return, and end only when all recovery criteria hold for the required sustained interval.",
        },
        {
          question: "Why report maximum error as well as RMSE?",
          answer:
            "RMSE combines samples and can hide the single worst miss that may violate a task or safety tolerance.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A synchronized truth, estimate, uncertainty band, dropout window, and recovery threshold reveal calibration and recovery relationships that summary metrics hide.",
      },
    },
  ],
} satisfies ChapterContent;
