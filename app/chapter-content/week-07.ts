import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION = "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION = "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI = "Robot Learning Deployment / Physical AI Integration Engineer";

export const week07Content = {
  week: 7,
  title: "Build a repeatable robot laboratory in Gazebo",
  purpose:
    "Use Gazebo Harmonic as a controlled laboratory for a differential-drive robot: make physics and time explicit, connect ROS 2 without hiding boundaries, model imperfect sensors, capture evidence, and prove safe behavior under repeatable faults before making claims about hardware.",
  prerequisites: [
    "Recognize ROS 2 nodes, topics, messages, QoS, lifecycle state, namespaces, and launch files.",
    "Read a URDF or Xacro model, follow a tf2 tree, and distinguish a command from measured joint state.",
    "Use metres, seconds, radians, hertz, and simple averages; calculate period as one divided by frequency.",
    "Understand that simulation is evidence about a model, not acceptance evidence for a powered physical robot.",
  ],
  outcomes: [
    "Pin a supported ROS 2 and Gazebo pairing, describe a small SDF world, and distinguish simulation time, wall time, physics step size, and achieved real-time factor.",
    "Spawn and name a robot, bridge selected Gazebo Transport messages to ROS 2, activate simulated ros2_control interfaces, and verify differential-drive motion against Gazebo ground truth.",
    "Inspect lidar, RGB or depth camera, IMU, and encoder messages with the correct frame, unit, timestamp, rate, and validity interpretation.",
    "Add deliberate noise, bias, rate, delay, and dropout while keeping the random seed and unchanged test conditions recorded.",
    "Record selected ROS 2 evidence to MCAP, verify recording completeness and QoS, and explain what additional state is required for a repeatable replay.",
    "Design freshness, plausibility, continuity, and cross-sensor health checks with an explicit safe degraded response.",
    "Ship a scenario matrix that reproduces nominal behavior and controlled failures, measures detection and terminal state, and states the limits of simulation honestly.",
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
      label: "Gazebo — installing Gazebo with ROS",
      url: "https://gazebosim.org/docs/jetty/ros_installation/",
      useFor:
        "The official compatibility table and the beginner recommendation to use Ubuntu 24.04, ROS 2 Jazzy, and Gazebo Harmonic; Jetty is the current pairing for ROS 2 Rolling rather than this chapter's pinned baseline.",
    },
    {
      label: "Gazebo Harmonic — SDF worlds and physics",
      url: "https://gazebosim.org/docs/harmonic/sdf_worlds/",
      useFor:
        "World structure, physics-system plugins, maximum step size, simulation statistics, and real-time factor.",
    },
    {
      label: "Gazebo Harmonic — sensors",
      url: "https://gazebosim.org/docs/harmonic/sensors/",
      useFor:
        "Official examples for attaching IMU, contact, and lidar sensors, setting update rate and topic, and inspecting generated data.",
    },
    {
      label: "Gazebo Harmonic — ROS 2 integration",
      url: "https://gazebosim.org/docs/harmonic/ros2_integration/",
      useFor:
        "The ros_gz_bridge boundary, supported message conversions, bridge direction, ROS-side visualization, and Gazebo-side commands.",
    },
    {
      label: "ROS 2 — rosbag2 MCAP storage",
      url: "https://docs.ros.org/en/kilted/p/rosbag2_storage_mcap/",
      useFor:
        "The maintained rosbag2 MCAP storage plugin and the record, play, and info workflow used for captured ROS 2 evidence.",
    },
  ],
  days: [
    {
      dayId: 43,
      mentalModel:
        "Gazebo is a clock-driven laboratory: on each small tick it updates a mathematical world, so you must control the clock and the model before trusting what the picture does.",
      explanation: [
        "Gazebo Sim is not a video game that merely draws a robot. It repeatedly applies a physics model to bodies, joints, contacts, gravity, and actuators, then lets simulated sensors observe the resulting world. SDF describes the world and its models; system plugins perform jobs such as physics, commands, sensors, and scene broadcasting. This course pins ROS 2 Jazzy with Gazebo Harmonic because the Gazebo project identifies that long-term-support pair as the recommended beginner combination. Gazebo Jetty is newer, but its normal supported pairing is the moving ROS 2 Rolling distribution. A reproducible learner project should not silently mix documentation and packages from both combinations.",
        "Simulation time is the time inside the experiment. Wall time is what a clock on your desk measures while the computer runs it. Gazebo can pause simulation time, advance exactly one step, reset it, or run it slower or faster than the wall clock. ROS nodes that participate in the experiment must consistently use the published simulation clock; otherwise one node may stamp data with wall time while another asks tf2 for a pose in simulation time. That creates huge apparent ages and lookup failures even when both pieces of software are individually running.",
        "The maximum physics step is the largest simulated-time interval between physics updates. With a 0.001 s step, one simulated second needs about 1,000 updates. A smaller step can represent fast contact changes more finely, but it requires more computation and does not repair wrong mass, inertia, friction, geometry, or controller gains. Real-time factor, or RTF, is simulated elapsed time divided by wall elapsed time. An achieved RTF of 0.67 means the world advances only 0.67 simulated seconds per wall second; it does not by itself say whether the model is accurate.",
        "Treat every world as a versioned test fixture. Record the Gazebo and ROS versions, world file, expanded robot description, physics settings, initial poses, parameters, and random seed where the component supports one. Begin with a tiny known experiment such as dropping one box onto one plane. Measure contact behavior and final pose instead of judging animation smoothness. Simulation earns trust through repeatable measurements and controlled comparisons, while a real robot still needs separate checks for wiring, backlash, floor friction, load, timing, and safety.",
      ],
      keyTerms: [
        {
          term: "SDF",
          meaning:
            "Simulation Description Format, the XML-based description of worlds, models, lights, physics settings, sensors, and plugins used by Gazebo.",
          physicalExample:
            "An SDF world can place a 1 kg box one metre above a plane and specify the gravity and physics step used for its fall.",
        },
        {
          term: "Simulation time",
          meaning:
            "The experiment's own clock, which can pause, reset, step, or advance at a different rate from wall time.",
          physicalExample:
            "When Gazebo is paused at 4.2 s, a correctly configured ROS timer based on simulation time should not keep advancing.",
        },
        {
          term: "Physics step",
          meaning:
            "The simulated-time interval between successive numerical updates of the world state.",
          physicalExample:
            "A 1 ms step asks the physics engine to update contact and motion up to 1,000 times per simulated second.",
        },
        {
          term: "Real-time factor",
          meaning:
            "The ratio of simulated elapsed time to wall elapsed time, used to report how fast the experiment runs.",
          physicalExample:
            "Thirty simulated seconds completed in 45 wall seconds gives an achieved RTF of 30 ÷ 45, or about 0.67.",
        },
        {
          term: "Ground truth",
          meaning:
            "The simulator's internal state used as a reference for checking an estimated or sensor-derived value.",
          physicalExample:
            "Gazebo's exact model pose can be compared with wheel odometry, but a real warehouse does not provide that exact pose for free.",
        },
      ],
      physicalExamples: [
        {
          title: "Slow-motion phone video",
          scenario:
            "A phone records a bouncing ball at many frames per second and plays it back slowly. Video time, playback time, and the real event's time are different clocks.",
          lookFor:
            "Use the analogy only for clock separation: Gazebo also calculates forces and state at each step, which a recorded video does not.",
        },
        {
          title: "Measuring a table with different rulers",
          scenario:
            "A coarse ruler may miss a small gap, while a finer ruler reveals it. Neither ruler fixes a bent table or a wrong measurement method.",
          lookFor:
            "Relate ruler spacing to physics step size, and relate the table's actual shape to mass, geometry, friction, and other model assumptions.",
        },
      ],
      workedExample: {
        title: "Calculate updates and achieved real-time factor",
        setup:
          "A fixed drop test uses a 0.001 s maximum step. Gazebo advances from 0 s to 30 s of simulation time while a monotonic wall clock advances 45 s.",
        steps: [
          "Convert the step to seconds: 1 ms equals 0.001 s.",
          "Divide one simulated second by the step: 1 ÷ 0.001 = 1,000 physics updates per simulated second.",
          "Multiply by the run length: 30 × 1,000 = about 30,000 updates if every maximum-size step is used.",
          "Calculate achieved real-time factor: 30 simulated seconds ÷ 45 wall seconds = 0.666…",
          "Report the result as RTF ≈ 0.67 together with step size, run length, hardware, world version, and measured outcome.",
        ],
        result:
          "The computer ran the experiment at about two-thirds of wall-clock speed and performed roughly 30,000 physics updates.",
        takeaway:
          "RTF describes throughput, while physical credibility must be checked with model parameters and measured outcomes.",
      },
      handsOn: {
        setup:
          "Use a saved Gazebo Harmonic world with one plane and one box. Keep mass, geometry, initial pose, solver, and camera unchanged.",
        steps: [
          "Record the installed ROS and Gazebo versions, world hash, physics engine settings, initial box height, and current simulation-clock policy.",
          "Run the drop with a supported 0.001 s maximum step and record simulated duration, wall duration, achieved RTF, final box height, and visible contact behavior.",
          "Repeat from a full reset with one deliberately different supported step size while changing nothing else.",
          "Compare final pose, contact penetration or bounce, update count, and RTF in one table; include the exact commands and raw world statistics.",
          "Return to the baseline setting and confirm the original result repeats before writing a conclusion.",
        ],
        observe:
          "A smaller step normally costs more computation, but any change in contact behavior must be reported as an observation tied to this model rather than a universal law.",
        doneWhen:
          "A second engineer can use the pinned files and settings to reproduce both runs and explain the difference between simulation time, wall time, step size, and RTF.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Create a versioned Gazebo baseline whose world statistics and known drop test detect a changed physics configuration before a navigation regression suite runs.",
        interviewPrompt:
          "A simulated rover oscillates only on a slower laptop and RTF falls below 0.5. Explain how you would separate a simulation-clock bug, missed controller timing assumption, physics-step change, and merely slower wall-clock execution.",
      },
      commonMistakes: [
        {
          mistake: "Mixing Gazebo Jetty instructions into a Jazzy and Harmonic workspace because Jetty is newer.",
          correction:
            "Pin one supported pairing. For this chapter use ROS 2 Jazzy with Gazebo Harmonic; evaluate Jetty with its supported ROS pairing in a separate compatibility branch.",
        },
        {
          mistake: "Treating a high real-time factor as proof that physics is accurate.",
          correction:
            "Use RTF for execution speed and compare known outcomes, model parameters, contact behavior, and real measurements for credibility.",
        },
        {
          mistake: "Reducing the physics step until a bad model appears stable.",
          correction:
            "Check inertia, mass, collision geometry, friction, limits, controller period, and time source before tuning numerical settings.",
        },
      ],
      checkQuestions: [
        {
          question: "What happens to a simulation-time ROS timer while Gazebo is paused?",
          answer:
            "It should stop advancing because the simulation clock is not advancing, even though wall time continues.",
        },
        {
          question: "If 20 simulated seconds take 10 wall seconds, what is achieved RTF?",
          answer:
            "RTF is 20 ÷ 10 = 2.0, so simulation time advanced twice as fast as wall time.",
        },
        {
          question: "Why can a smaller physics step still produce a wrong result?",
          answer:
            "It only changes numerical update spacing; wrong mass, inertia, geometry, friction, joint, controller, or sensor assumptions remain wrong.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A paired simulation-time and wall-time timeline with 1 ms step markers makes pause, stepping, update count, and RTF visible more clearly than prose alone.",
      },
    },
    {
      dayId: 44,
      mentalModel:
        "A simulated robot crosses three explicit boundaries—world, Gazebo Transport, and ROS 2—and movement is believable only when commands, wheel state, odometry, and ground truth agree.",
      explanation: [
        "Start-up is a sequence, not a pile of processes. Gazebo loads a named world and its systems. A spawn command creates one uniquely named robot entity from SDF or URDF-derived content at a known pose. The robot model exposes joints and plugins. ROS-side launch then starts only the bridges and controllers that the test needs. If two entities, topics, or frames share accidental names, the system may move while tools observe the wrong robot. Record entity name, ROS namespace, frame prefix, initial pose, and resource paths as part of the scenario.",
        "Gazebo Transport and ROS 2 are different communication systems. ros_gz_bridge converts supported message types across that boundary in a declared direction: Gazebo to ROS, ROS to Gazebo, or bidirectional where appropriate. It does not convert every possible message, repair wrong units, invent frame IDs, or guarantee a useful QoS choice. Bridge `/clock` so ROS nodes can use simulation time, then bridge only the commands and observations required by the experiment. Inspect both sides of the boundary when a topic appears on one graph but not the other.",
        "gz_ros2_control lets a normal ros2_control controller use simulated joints through state and command interfaces. For a differential-drive base, a controller converts requested forward and yaw velocity into left and right wheel rates using wheel radius and wheel separation. The simulated hardware updates joint state, and wheel odometry integrates that state into a moving pose estimate. A green active-controller state proves interface ownership; it does not prove that wheel radius, separation, signs, frames, or odometry are correct.",
        "Gazebo ground truth gives a privileged reference for a test. Command a straight segment and a turn, then compare wheel-derived odometry with the internal simulated pose. Straight-line scale error suggests wheel radius or encoder scale; a wrong turn rate suggests separation; reversed motion suggests a sign or axis problem. Small divergence can also come from slip and contact modeling. The purpose is not to force odometry to equal truth forever, but to explain each difference with measured evidence and declared tolerance.",
      ],
      keyTerms: [
        {
          term: "Spawn",
          meaning:
            "Create a model entity in a running Gazebo world with a chosen name and initial pose.",
          physicalExample:
            "A test launch inserts rover_01 at x = 0 m, y = 0 m, yaw = 0 rad rather than relying on a hand-dragged position.",
        },
        {
          term: "ros_gz_bridge",
          meaning:
            "A converter that carries supported message types between Gazebo Transport and ROS 2 in configured directions.",
          physicalExample:
            "A Gazebo lidar message becomes a ROS sensor_msgs/LaserScan while a ROS velocity command travels toward Gazebo.",
        },
        {
          term: "gz_ros2_control",
          meaning:
            "The Gazebo-facing ros2_control hardware integration that exposes simulated joint state and command interfaces.",
          physicalExample:
            "The same differential-drive controller contract can command simulated wheel joints before a separate real motor-driver backend is used.",
        },
        {
          term: "Wheel odometry",
          meaning:
            "An estimate of robot motion obtained by integrating measured or simulated wheel rotation using wheel geometry.",
          physicalExample:
            "Ten wheel revolutions are converted to travelled distance using circumference, but slip can make the estimate differ from floor motion.",
        },
        {
          term: "Ground-truth pose",
          meaning:
            "The simulator's internal model pose used as a reference for evaluating an estimate.",
          physicalExample:
            "Plot odometry x beside Gazebo's internal rover x to expose a five-percent wheel-radius error.",
        },
      ],
      physicalExamples: [
        {
          title: "Two-wheel hand trolley",
          scenario:
            "Push both wheels equally and the trolley goes straight; make the right wheel edge move faster and the trolley turns left.",
          lookFor:
            "The centre speed comes from the average wheel-edge speed, while turning comes from their difference divided by the spacing.",
        },
        {
          title: "Interpreter at a service desk",
          scenario:
            "A clerk and customer use different languages, so an interpreter translates only phrases both sides have agreed to support.",
          lookFor:
            "Relate the two languages to Gazebo Transport and ROS 2, and note that translation cannot correct a false measurement or unclear meaning.",
        },
      ],
      workedExample: {
        title: "Predict a differential-drive command",
        setup:
          "A robot has wheel radius r = 0.10 m and wheel separation L = 0.50 m. The left wheel turns at 4 rad/s and the right at 6 rad/s.",
        steps: [
          "Convert left angular rate to edge speed: 0.10 m × 4 rad/s = 0.40 m/s.",
          "Convert right angular rate to edge speed: 0.10 m × 6 rad/s = 0.60 m/s.",
          "Average the edge speeds for centre forward speed: (0.40 + 0.60) ÷ 2 = 0.50 m/s.",
          "Find the edge-speed difference: 0.60 − 0.40 = 0.20 m/s.",
          "Divide by wheel separation for yaw rate: 0.20 ÷ 0.50 = 0.40 rad/s.",
          "Predict a forward-left arc, then compare signed command, joint rates, odometry, and ground truth.",
        ],
        result:
          "The ideal no-slip model predicts v = 0.50 m/s and yaw rate = 0.40 rad/s.",
        takeaway:
          "A moving model can still be wrong; geometry and sign checks connect wheel state to body motion.",
      },
      handsOn: {
        setup:
          "Use the pinned Jazzy and Harmonic workspace, one saved world, and a differential-drive model with measured wheel radius and separation.",
        steps: [
          "Launch the world, spawn one uniquely named robot at a recorded pose, and verify entity, namespace, frame, and topic ownership.",
          "Bridge `/clock` plus the minimum command and observation topics; inspect Gazebo and ROS topic types, direction, rate, frame IDs, and timestamps.",
          "Activate the simulated differential-drive controller and record requested body twist, wheel commands, measured joint states, odometry, and Gazebo ground truth.",
          "Run one straight and one turning command within safe simulated limits; calculate the ideal result before plotting the observed result.",
          "Plant one wheel-radius or wheel-sign error, reproduce its odometry signature, restore the correct value, and rerun both paths.",
        ],
        observe:
          "The planted radius fault creates a systematic scale mismatch, while a sign fault creates a direction or turning contradiction visible across several signals.",
        doneWhen:
          "Another engineer can start the complete graph from one launch entry point, identify every bridge direction, and reproduce the clean and faulty odometry comparisons.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Integrate a vendor mobile-base model with ROS 2, prove the bridge and controller boundaries, and diagnose a wheel-geometry defect from command, state, odometry, and ground-truth traces.",
        interviewPrompt:
          "A Gazebo rover spawns, accepts cmd_vel, and visibly moves, but odometry reports half the distance. Give an evidence order that distinguishes bridge, controller, wheel radius, encoder scale, frame, and clock problems.",
      },
      commonMistakes: [
        {
          mistake: "Using a dynamic bridge for everything and assuming every topic now has correct semantics.",
          correction:
            "Configure the required message pairs and directions explicitly, then verify type, QoS, unit, frame, timestamp, and rate on both sides.",
        },
        {
          mistake: "Treating an active controller as proof that simulated motion is correct.",
          correction:
            "Compare command, claimed interfaces, joint state, odometry, and ground truth against a calculated known path.",
        },
        {
          mistake: "Changing wheel radius and separation together while diagnosing odometry.",
          correction:
            "Change one controlled parameter at a time; use straight motion for scale and a turn for rotational geometry.",
        },
      ],
      checkQuestions: [
        {
          question: "What does ros_gz_bridge do that gz_ros2_control does not?",
          answer:
            "The bridge converts supported Gazebo Transport and ROS 2 messages; gz_ros2_control exposes simulated joint state and command interfaces to ros2_control.",
        },
        {
          question: "If both equal-size wheels turn at the same signed rate, what ideal yaw rate should the base have?",
          answer:
            "Zero, because the wheel-edge speed difference is zero.",
        },
        {
          question: "Why compare wheel odometry with Gazebo ground truth?",
          answer:
            "The comparison exposes geometry, sign, integration, frame, and slip effects that a successful movement animation cannot reveal.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The calculated command table and plotted odometry-versus-ground-truth run provide stronger evidence than another system diagram.",
      },
    },
    {
      dayId: 45,
      mentalModel:
        "A simulated sensor is a measuring instrument with a viewpoint, clock, limits, and message contract—not a magic pipe that reveals the world.",
      explanation: [
        "Place each sensor on a named robot link with an explicit pose. Its data describes what that sensor could observe from that viewpoint, not the whole Gazebo world. A wall behind the lidar is occluded, a camera cannot see outside its field of view, and an encoder reports joint motion rather than floor travel. First verify the model pose and optical or measurement frame in RViz or the Gazebo scene. Then inspect topic type, frame ID, timestamp, unit, dimensions, update rate, and invalid-value rules before using the numbers.",
        "A planar lidar usually becomes a ROS LaserScan. It contains an angle for the first beam, an angle increment, minimum and maximum usable range, and an ordered array of range values. Beam i points at angle_min + i × angle_increment in the scan frame. A range outside the sensor's contract may be represented as an infinite or invalid value; treating it as zero invents an obstacle at the sensor origin. Convert a valid beam to x and y only after confirming the angular convention and frame.",
        "A colour camera normally publishes an Image plus CameraInfo. The image is a grid of pixel values; CameraInfo carries the calibration numbers needed to interpret pixels as rays. A depth camera adds an image or point-cloud quantity whose unit and invalid values must be checked. Camera optical frames use a conventional axis orientation that may differ from the robot base frame, so transforms matter. Large images also consume far more bandwidth than small IMU or encoder messages; a graph that works at low resolution may fail under production rate and size.",
        "An IMU reports angular velocity and linear acceleration and may also report orientation depending on the modeled device and message. Acceleration can include gravity according to the chosen convention, so a stationary sensor does not automatically show three zeros. Encoders or simulated joint-state interfaces report joint position or velocity; wheel odometry then assumes geometry and contact. Compare every sensor with a controlled pose or motion and Gazebo truth, but remember that truth is an evaluation aid unavailable on a normal physical deployment.",
      ],
      keyTerms: [
        {
          term: "LaserScan",
          meaning:
            "An ordered set of range measurements at known beam angles, with limits, frame, timestamp, and scan timing metadata.",
          physicalExample:
            "A 180-degree scan may contain hundreds of beams sweeping from the robot's right side through the front to its left side.",
        },
        {
          term: "CameraInfo",
          meaning:
            "ROS camera calibration metadata used to relate image pixels to rays and account for the camera model.",
          physicalExample:
            "The focal-length and principal-point values explain which ray passes through a chosen image pixel.",
        },
        {
          term: "IMU",
          meaning:
            "An inertial measurement unit that reports quantities such as angular velocity and linear acceleration, and sometimes orientation.",
          physicalExample:
            "A phone's IMU detects rotation and acceleration even when the camera sees a blank wall.",
        },
        {
          term: "Encoder",
          meaning:
            "A sensor or simulated interface that measures a shaft or joint position, change, or speed.",
          physicalExample:
            "Wheel encoder counts can estimate rotation while a slippery floor prevents the expected body travel.",
        },
        {
          term: "frame_id",
          meaning:
            "The named coordinate frame in which a stamped sensor message says its geometric data is expressed.",
          physicalExample:
            "A lidar range point begins in laser_frame and must be transformed before comparison with an obstacle in map.",
        },
      ],
      physicalExamples: [
        {
          title: "Car reversing camera and parking sensors",
          scenario:
            "The camera shows texture in a cone behind the car, while ultrasonic sensors return a few distance estimates from different bumper positions.",
          lookFor:
            "Neither sensor sees the entire environment; mounting pose, field of view, occlusion, update rate, and invalid readings shape what the driver receives.",
        },
        {
          title: "Phone on a desk",
          scenario:
            "A stationary phone camera shows an unchanged image while the IMU still senses gravity and small noise; rotating the phone changes axis readings.",
          lookFor:
            "Keep the phone's local axes separate from the room axes, and do not expect stillness to make every acceleration component zero.",
        },
      ],
      workedExample: {
        title: "Locate one valid lidar return",
        setup:
          "A scan starts at −90 degrees with 1-degree increments. Beam index 120 reports 2.0 m in laser_frame.",
        steps: [
          "Calculate the beam angle: −90 degrees + 120 × 1 degree = 30 degrees.",
          "Confirm 2.0 m is between range_min and range_max and is neither NaN nor infinity.",
          "Calculate the forward component in the scan frame: x = 2.0 × cos 30 degrees ≈ 1.73 m.",
          "Calculate the sideways component: y = 2.0 × sin 30 degrees = 1.00 m.",
          "Keep the result labelled laser_frame and transform it at the scan timestamp before comparing it with base or map data.",
        ],
        result:
          "The return is approximately (1.73 m, 1.00 m) in laser_frame under the declared angular convention.",
        takeaway:
          "A range array becomes geometry only after index, angle, validity, unit, frame, and timestamp are interpreted together.",
      },
      handsOn: {
        setup:
          "Attach a lidar, RGB or depth camera, and IMU to the saved simulated robot; use one box and one wall at measured poses.",
        steps: [
          "Draw each sensor frame and field of view, then verify the model mount and tf2 relationship before starting data inspection.",
          "For every ROS topic, record message type, frame ID, stamp source, unit, dimensions, observed rate, QoS, and invalid-value convention.",
          "Move the box to a known lidar beam and camera region; predict the range, beam index, image direction, and occlusion before reading messages.",
          "Pause, step, rotate, and drive the world while comparing lidar, image, IMU, joint state, and Gazebo truth without changing multiple conditions at once.",
          "Move the object outside range, behind an occluder, and beyond the camera field of view; record each sensor's valid absence or invalid output.",
        ],
        observe:
          "Each sensor fails or goes unobservable differently; a missing object is not the same as a missing message, invalid numeric value, wrong frame, or stale timestamp.",
        doneWhen:
          "Your sensor-contract table and known-pose evidence let another engineer predict which messages change for visible, occluded, out-of-range, rotated, and paused cases.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Commission a simulated multi-sensor payload by proving mounting transforms, message contracts, known-pose outputs, invalid values, rates, and bandwidth before connecting perception nodes.",
        interviewPrompt:
          "A lidar topic publishes at the expected rate, but obstacles appear rotated and some ranges are zero. Explain how you would check scan indexing, invalid values, mounting frame, transform time, and visualization assumptions.",
      },
      commonMistakes: [
        {
          mistake: "Treating zero, infinity, NaN, and a missing message as the same lidar observation.",
          correction:
            "Apply the message's range and validity contract, and track transport freshness separately from measurement validity.",
        },
        {
          mistake: "Assuming a simulated camera image already represents geometry in base_link.",
          correction:
            "Use CameraInfo to interpret pixels as rays and tf2 at the image timestamp to relate the optical frame to the robot.",
        },
        {
          mistake: "Using Gazebo ground truth as an input to the robot algorithm.",
          correction:
            "Reserve truth for evaluation; feed the algorithm only the sensor and state interfaces that would exist on the real system.",
        },
      ],
      checkQuestions: [
        {
          question: "At what angle is beam i in a LaserScan?",
          answer:
            "Under the message's convention it is angle_min + i × angle_increment.",
        },
        {
          question: "Why does a camera image normally need CameraInfo?",
          answer:
            "Pixel indices alone do not define physical rays; calibration metadata supplies the camera model used to interpret them.",
        },
        {
          question: "Why can wheel encoders report motion while the robot hardly moves?",
          answer:
            "They measure joint or shaft rotation; wheel slip can break the assumed relationship between rotation and floor travel.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "One verified top-view sensor-field diagram can show lidar beams, camera field of view, occlusion, sensor frames, and a shared object without repeating generic artwork.",
      },
    },
    {
      dayId: 46,
      mentalModel:
        "Sensor data is a delayed, imperfect stream of measurements; useful simulation makes each imperfection named, measured, and repeatable.",
      explanation: [
        "Noise is not one slider labelled realism. Random noise makes repeated measurements spread around a value. Bias shifts their centre away from truth. Drift changes that bias over time. Quantization rounds a continuous value into steps. Saturation clips values outside a limit. Dropout removes samples, and latency delivers an old observation later. A real sensor can contain several of these at once. Add them one at a time with values justified by a datasheet or measured dataset so you can recognize each signature.",
        "Update rate says how often a sensor is intended to produce data. Its nominal period is one divided by rate: a 20 Hz lidar has a 0.05 s or 50 ms period. Actual arrival intervals can vary; that variation is jitter. Timestamp, receipt time, and processing time answer different questions. Sensor age at use is the current simulation time minus the measurement stamp, not the time since the callback began. A message can arrive rapidly yet carry a frozen old stamp, so rate and freshness need separate checks.",
        "Sensors observe at different moments. A 200 Hz IMU may produce ten measurements during one 20 Hz lidar period, while a 30 Hz camera follows another schedule. Exact-time matching can discard nearly everything when clocks do not align; approximate synchronization accepts a declared time window but introduces alignment error. Geometry must use the transform for each measurement time. Applying the newest robot pose to an older scan bends the reconstructed world whenever the robot moved between observation and processing.",
        "Random seeds help reproduce supported random processes, but a seed does not freeze thread scheduling, GPU behavior, callback order, or every plugin. Run several seeds to learn a distribution, and pin one or more named seeds for regression cases. Record mean error, spread, maximum gap, invalid count, and age rather than showing only a smooth plot. The aim is not to make simulation look messy; it is to verify that the system detects and handles the specific imperfections expected at its interfaces.",
      ],
      keyTerms: [
        {
          term: "Bias",
          meaning:
            "A systematic offset that moves the average measurement away from the reference value.",
          physicalExample:
            "A scale reads 0.15 kg when empty, so every load appears about 0.15 kg too heavy until corrected.",
        },
        {
          term: "Precision",
          meaning:
            "How closely repeated measurements agree with one another, which is different from agreement with truth.",
          physicalExample:
            "Ten readings all near 2.20 m are precise even if the actual distance is 2.00 m.",
        },
        {
          term: "Jitter",
          meaning:
            "Variation in the time interval or delay from one sensor sample to the next.",
          physicalExample:
            "A nominal 50 ms lidar period alternates among 42, 53, and 61 ms.",
        },
        {
          term: "Sensor age",
          meaning:
            "Current experiment time minus the timestamp of the physical observation being used.",
          physicalExample:
            "At simulation time 8.35 s, using a scan stamped 8.10 s means the scan is 250 ms old.",
        },
        {
          term: "Random seed",
          meaning:
            "An initial value used to reproduce a supported pseudo-random noise sequence.",
          physicalExample:
            "Two runs with seed 17 may produce the same configured range-noise sequence while OS callback ordering can still differ.",
        },
      ],
      physicalExamples: [
        {
          title: "Kitchen scale test",
          scenario:
            "An empty scale repeatedly shows values around 15 g, with readings varying by a few grams and jumping in 1 g increments.",
          lookFor:
            "Separate bias, random spread, and quantization instead of calling the whole pattern noise.",
        },
        {
          title: "Delayed sports commentary",
          scenario:
            "A live video and internet commentary describe the same match, but the commentary arrives later and with uneven delays.",
          lookFor:
            "Receiving frequent words does not make them current; label event time, arrival time, delay, and jitter separately.",
        },
      ],
      workedExample: {
        title: "Audit a nominal 20 Hz lidar stream",
        setup:
          "During a 2 s simulation interval, a lidar should publish at 20 Hz. The newest scan is stamped 8.10 s and is processed at simulation time 8.35 s.",
        steps: [
          "Calculate nominal period: 1 ÷ 20 Hz = 0.05 s = 50 ms.",
          "Calculate expected intervals in 2 s: 20 × 2 = 40, allowing boundary counting to be declared consistently.",
          "Measure actual inter-stamp intervals rather than relying only on topic-reported average frequency.",
          "Calculate current sensor age: 8.35 − 8.10 = 0.25 s = 250 ms.",
          "Express age in nominal periods: 250 ms ÷ 50 ms = five periods old.",
          "Apply the declared freshness policy even if callbacks are still arriving quickly.",
        ],
        result:
          "The data being used is 250 ms, or five nominal lidar periods, old and should be classified according to an explicit age limit.",
        takeaway:
          "Rate, arrival, timestamp progression, and age are different health signals.",
      },
      handsOn: {
        setup:
          "Use one fixed target at a known lidar distance and a saved straight-drive scenario with simulation time enabled everywhere.",
        steps: [
          "Capture a clean baseline of measurement value, stamp interval, receipt interval, age, invalid count, and transform lookup result.",
          "Add a documented random range-noise standard deviation with a fixed seed and run enough samples to calculate mean and spread.",
          "Add one separate bias, then one separate update-rate reduction; predict each signature before running.",
          "Inject a delayed or frozen timestamp without stopping message arrival and verify that freshness detection differs from rate detection.",
          "Restore the baseline, rerun it, and preserve configuration, seed, raw samples, plots, and a table of expected versus observed effects.",
        ],
        observe:
          "Random spread, shifted mean, slower period, late arrival, and frozen time produce distinguishable evidence when captured separately.",
        doneWhen:
          "A second engineer can reproduce all four imperfection signatures and your consumer rejects or degrades each according to a written contract.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Turn a lidar datasheet and field sample into a Gazebo fault profile, then prove a ROS consumer handles noise, bias, low rate, delay, and frozen timestamps without frame-time corruption.",
        interviewPrompt:
          "A sensor monitor reports 20 Hz, but navigation steers from an old scene. Explain how high callback rate can coexist with stale observations and what timestamps and ages you would capture.",
      },
      commonMistakes: [
        {
          mistake: "Adding large Gaussian noise and calling the sensor realistic.",
          correction:
            "Model justified random spread, bias, drift, quantization, saturation, latency, and dropout as separate documented mechanisms.",
        },
        {
          mistake: "Checking callback frequency but not whether message timestamps advance.",
          correction:
            "Track stamp progression, arrival intervals, and age at use independently.",
        },
        {
          mistake: "Using one fixed random seed as the only reliability test.",
          correction:
            "Keep fixed seeds for reproducible regressions and also run a declared set of seeds to measure outcome variation.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the nominal period of a 40 Hz sensor?",
          answer:
            "1 ÷ 40 s = 0.025 s, or 25 ms.",
        },
        {
          question: "Can a measurement stream be precise but inaccurate?",
          answer:
            "Yes. Repeated values can cluster tightly while a bias places that cluster far from truth.",
        },
        {
          question: "Why is receipt time not enough to calculate observation age?",
          answer:
            "Receipt time says when data arrived; age requires the original measurement timestamp and the current time in the same clock domain.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "A student-generated time-series overlay of truth, noisy values, stamps, arrivals, and freshness limits is the required evidence and avoids a generic sensor illustration.",
      },
    },
    {
      dayId: 47,
      mentalModel:
        "An MCAP bag is a labelled recording of ROS messages, not a recording of the entire world that produced them.",
      explanation: [
        "rosbag2 subscribes to selected ROS 2 topics and stores their serialized messages plus metadata. MCAP is a storage format supported through the rosbag2 MCAP plugin; it keeps multiple message channels in a structured file and works with ordinary record, info, and play operations. Choose topics from a replay question rather than recording everything without limit. To reproduce a stale-lidar stop, for example, capture `/clock`, lidar, transforms, odometry, command requests, bounded output, diagnostics, and the final result state.",
        "A successful record command does not prove completeness. Inspect start and end time, duration, topic types, message counts, offered QoS, file splits, and storage errors. Expected count is nominal rate multiplied by duration, but startup boundaries and intentional drop policies must be declared. Average rate can hide a single dangerous gap, so also calculate maximum inter-stamp and inter-arrival gaps. High-bandwidth images can fill disk or delay writes; define storage budget, split policy, and the behavior when recording fails.",
        "DDS QoS still matters at the recorder and player boundary. rosbag2 adapts profiles in many cases, but some topics need explicit overrides for compatible reliability, durability, or history. A bag with zero camera messages may reflect QoS incompatibility rather than a silent camera. During playback, decide whether to publish a clock and configure consumers for simulation time. Do not let live and replay publishers accidentally feed the same topic unless the test deliberately names and controls both sources.",
        "Message replay is not full deterministic execution. The bag does not automatically contain the world file, code revision, dependencies, parameters, calibration, environment variables, transforms published outside the capture window, random seeds, launch order, or external services. Even identical messages can trigger a different callback order under concurrency. Bundle these inputs, start from a clean state, replay more than once, and compare a declared result. Say reproducible when the bounded outcome repeats under the recorded contract; do not promise bit-for-bit determinism without evidence.",
      ],
      keyTerms: [
        {
          term: "rosbag2",
          meaning:
            "The ROS 2 recording and playback system for serialized topic messages and associated metadata.",
          physicalExample:
            "A test records scans, transforms, odometry, commands, and diagnostics during one simulated stop.",
        },
        {
          term: "MCAP",
          meaning:
            "A structured storage format available to rosbag2 for keeping multiple timestamped message channels and metadata.",
          physicalExample:
            "One MCAP recording contains lidar and odometry channels whose counts and timing can be inspected before replay.",
        },
        {
          term: "QoS override",
          meaning:
            "An explicit recorder or player policy used when the automatically chosen reliability, durability, or history is not suitable.",
          physicalExample:
            "A best-effort sensor publisher may require a compatible recording profile to avoid receiving no images.",
        },
        {
          term: "Playback clock",
          meaning:
            "A clock emitted during replay so simulation-time consumers can follow the recording's time progression.",
          physicalExample:
            "Pausing playback pauses the consumer's experiment time instead of letting wall-time timers advance.",
        },
        {
          term: "Replay contract",
          meaning:
            "The complete set of captured messages, code, configuration, time rules, initial state, and expected outputs required to repeat a test.",
          physicalExample:
            "A bag plus a pinned container, parameter dump, world, seed, launch entry point, and terminal-state assertion forms a useful regression fixture.",
        },
      ],
      physicalExamples: [
        {
          title: "Aircraft flight recorder",
          scenario:
            "A flight recorder captures selected channels and conversations, but investigators still need aircraft configuration, weather, maintenance, and procedures.",
          lookFor:
            "Relate selected recorded channels to topics and the missing operating context to code, parameters, world state, and external services.",
        },
        {
          title: "Recipe video without ingredient amounts",
          scenario:
            "A video shows actions in order but omits exact quantities and oven settings, so a viewer may not reproduce the cake.",
          lookFor:
            "Message order alone does not replace effective configuration, initial state, versions, and timing rules.",
        },
      ],
      workedExample: {
        title: "Measure recording completeness",
        setup:
          "A lidar is configured for 20 Hz during a declared 60 s capture. ros2 bag info reports 1,188 lidar messages.",
        steps: [
          "Calculate nominal expected count: 20 messages/s × 60 s = 1,200 messages.",
          "Calculate count difference: 1,200 − 1,188 = 12 messages.",
          "Calculate count completeness: 1,188 ÷ 1,200 × 100 = 99 percent.",
          "Inspect the first and last timestamps so startup or shutdown boundaries are not mistaken for mid-run loss.",
          "Calculate the maximum inter-stamp and arrival gap to see whether the 12 missing samples form one long outage or small scattered gaps.",
          "Check recorder QoS, errors, storage throughput, and the original publisher before assigning a cause.",
        ],
        result:
          "The simple count is 99 percent of nominal, but timing and QoS evidence are still required to explain the missing 1 percent.",
        takeaway:
          "Count is a useful first check; gaps, boundaries, QoS, and storage evidence determine whether the recording is fit for replay.",
      },
      handsOn: {
        setup:
          "Use the saved simulated sensor scenario and create a small evidence manifest before recording.",
        steps: [
          "List the failure question, required input and output topics, expected rates, QoS, time source, duration, storage budget, and terminal-state assertion.",
          "Record the selected topics using MCAP, then inspect metadata, types, counts, duration, file size, and maximum stamp gaps before playback.",
          "Save the world, robot description, effective parameters, code revision, dependency versions, seeds, launch command, and QoS overrides beside the bag.",
          "Start the consumer stack from a clean state, play with the intended clock policy twice, and capture message counts, output values, event order summary, and terminal result.",
          "Plant one QoS or omitted-topic failure, show the decisive evidence, restore the manifest, and repeat the clean replay.",
        ],
        observe:
          "Playback can complete while a required topic is absent, a clock is wrong, or concurrency changes event order; the result assertion reveals whether the replay answered the intended question.",
        doneWhen:
          "Another engineer can inspect the manifest, identify recording completeness, reproduce the normal result and planted replay failure, and state what the bag does not capture.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION],
        workExample:
          "Convert an intermittent simulated sensor failure into a small MCAP regression fixture with verified completeness, pinned environment, repeatable playback, and a terminal behavior assertion.",
        interviewPrompt:
          "A colleague sends a bag and says the bug is reproducible, but your output differs. List what you would verify beyond pressing play and why callback order may still vary.",
      },
      commonMistakes: [
        {
          mistake: "Recording every topic without a question, size limit, or failure policy.",
          correction:
            "Define the replay claim, select the minimal required channels, budget storage, and verify required counts and gaps.",
        },
        {
          mistake: "Calling a non-empty MCAP recording complete.",
          correction:
            "Inspect topic types, counts, duration, gaps, QoS, errors, and required transform or clock coverage.",
        },
        {
          mistake: "Claiming deterministic replay from the bag file alone.",
          correction:
            "Pin code, dependencies, parameters, initial state, time policy, QoS, seeds, launch order, and external inputs, then measure repeated outcomes.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can ros2 bag info show zero messages for a topic that was visibly publishing?",
          answer:
            "The recorder may have discovered the topic but had incompatible QoS or another subscription or storage failure; inspect the offered and requested profiles and recorder evidence.",
        },
        {
          question: "What is missing from a bag if a static transform was published before recording and not captured?",
          answer:
            "The replay may lack the transform needed to relate sensor frames, unless it is launched separately or captured with the required durable behavior.",
        },
        {
          question: "Why run the same replay more than once?",
          answer:
            "It exposes output or event-order variation caused by concurrency, unpinned state, randomness, or external inputs.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The recording manifest, topic-count table, gap plot, and two-run diff are the meaningful visuals and should be generated from the learner's actual bag.",
      },
    },
    {
      dayId: 48,
      mentalModel:
        "Sensor health is a chain of questions—present, fresh, plausible, geometrically usable, and consistent—followed by a planned response when any answer becomes no.",
      explanation: [
        "A topic name in the ROS graph means only that an endpoint was discovered. It does not prove new measurements are arriving, timestamps advance, values are finite, frames connect, or the scene is believable. Build health from separate checks: expected publisher and type, receipt rate, stamp progression, age, numeric range, invalid fraction, sequence continuity, transform availability, and agreement with other evidence. Keep the raw facts visible so an operator can distinguish no publisher, stale data, corrupt data, and a blocked sensor.",
        "Health limits come from task risk and sensor contract. A 200 ms-old camera might be acceptable for a parked inspection image but dangerous for teleoperation near a person. A lidar dropout may require a mobile robot to stop, while a temporarily missing rear camera might permit slow forward-only retreat if an independently reviewed safety design supports it. Simulation lets you test the software response, but it cannot certify that the response satisfies machinery safety rules. Name the allowed behavior, speed, direction, timeout, and recovery condition explicitly.",
        "Use a small state machine rather than one flickering boolean. A sensor can be INITIALIZING, HEALTHY, DEGRADED, FAILED, or RECOVERING. Hysteresis prevents a value near one threshold from rapidly switching states: enter degraded after several bad periods, and require several good periods before recovery. Latching a serious fault until operator acknowledgment may be appropriate. Never silently substitute zero for an invalid measurement because zero could mean an obstacle touching the robot or no motion, depending on the quantity.",
        "A useful operator and log view shows last measurement stamp, age, observed rate, invalid count, frame error, health state, reason, response, and last transition time. The command path should consume the health state, not merely colour an HMI after commands continue unchanged. Validate each fallback by injecting one known fault and checking detection time, bounded command, terminal state, recovery gate, and false-positive behavior. A degraded mode that has never been exercised is only a design claim.",
      ],
      keyTerms: [
        {
          term: "Freshness",
          meaning:
            "Whether an observation's age is within the limit declared for its current use.",
          physicalExample:
            "A scan stamped 80 ms ago passes a 100 ms navigation limit but fails a 50 ms high-speed limit.",
        },
        {
          term: "Plausibility check",
          meaning:
            "A test that asks whether a value or change is physically and contractually possible.",
          physicalExample:
            "A room-temperature sensor jumping from 22 °C to 500 °C in one sample is rejected even though the message arrived on time.",
        },
        {
          term: "Degraded mode",
          meaning:
            "A deliberately restricted operating mode used when required capability or confidence is reduced.",
          physicalExample:
            "A rover limits speed and refuses new autonomous goals while one non-safety camera restarts.",
        },
        {
          term: "Hysteresis",
          meaning:
            "Different evidence requirements for entering and leaving a health state, used to prevent rapid toggling.",
          physicalExample:
            "Enter degraded after three stale samples but require ten consecutive fresh samples before returning healthy.",
        },
        {
          term: "Terminal state",
          meaning:
            "The final declared result of a scenario, such as safely stopped, completed, cancelled, aborted, or timed out.",
          physicalExample:
            "After a frozen lidar stamp, the test expects zero measured velocity and mission result ABORTED rather than an endless active goal.",
        },
      ],
      physicalExamples: [
        {
          title: "Automatic door safety beam",
          scenario:
            "A door controller receives no fresh clear-path evidence from its closing safety sensor.",
          lookFor:
            "Absence of evidence must not be treated as an empty doorway; the permitted response is determined by the safety design.",
        },
        {
          title: "Car tyre-pressure display",
          scenario:
            "One tyre reading disappears while the other three remain plausible. The dashboard reports which sensor is unavailable instead of inventing normal pressure.",
          lookFor:
            "Separate sensor loss, low pressure, stale last value, and the vehicle behavior allowed under each state.",
        },
      ],
      workedExample: {
        title: "Classify a frozen 10 Hz lidar",
        setup:
          "A lidar nominally publishes every 100 ms. Messages still arrive, but the measurement stamp has not advanced for 250 ms. The navigation freshness limit is 200 ms.",
        steps: [
          "Calculate nominal period: 1 ÷ 10 Hz = 0.10 s = 100 ms.",
          "Compare stamp age with the limit: 250 ms is greater than 200 ms, so the observation is stale.",
          "Express the freeze in periods: 250 ÷ 100 = 2.5 nominal periods without a new observation time.",
          "Keep receipt-rate status separate because callbacks may still arrive at 10 Hz with copied old stamps.",
          "Transition according to policy, bound or stop commands, and record detection time, reason, requested command, delivered command, and measured velocity.",
          "Require the declared number of fresh, plausible samples and transform coverage before recovery.",
        ],
        result:
          "The lidar fails the freshness check despite normal callback rate, and the scenario should reach its defined bounded terminal state.",
        takeaway:
          "A heartbeat can be alive while the physical observation is dead; health needs timestamp and value semantics.",
      },
      handsOn: {
        setup:
          "Create a small health monitor around one simulated lidar or range topic and connect its state to a bounded simulated command gate.",
        steps: [
          "Define expected type, rate range, freshness limit, numeric limits, invalid fraction, transform requirement, health states, response, and recovery rule.",
          "Publish or bridge a healthy baseline and log measurement stamp, receipt time, age, rate, value status, frame status, state, and permitted command.",
          "Inject no publisher, frozen stamp with live callbacks, out-of-range values, and missing transform as separate scenarios.",
          "Assert detection deadline, state transition, bounded output, measured stop or restriction, terminal result, and recovery behavior for each fault.",
          "Build one compact operator panel or report that states the exact reason and age instead of showing only a red or green icon.",
        ],
        observe:
          "Each fault can share the same red outcome while requiring different diagnosis and recovery; the reason code and raw evidence prevent guesswork.",
        doneWhen:
          "Every injected condition produces the expected state and physical or simulated command response, and no recovery occurs before the written evidence gate is satisfied.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_VALIDATION, ROLE_INTEGRATION],
        workExample:
          "Build a robot-health panel and command gate that distinguish disconnected, stale, implausible, and untransformable sensor data and prove each degraded response with fault injection.",
        interviewPrompt:
          "A lidar indicator is green because callbacks arrive at 10 Hz, yet the robot reacts to an old obstacle layout. Design the health signals, operator display, safe response, and recovery test.",
      },
      commonMistakes: [
        {
          mistake: "Defining health as topic present or callback received.",
          correction:
            "Check stamp progression, age, rate, validity, plausibility, frames, and task-specific consistency as separate signals.",
        },
        {
          mistake: "Displaying a fault while leaving the command path unchanged.",
          correction:
            "Connect a reviewed health state to an explicit bounded response and verify the resulting measured behavior.",
        },
        {
          mistake: "Returning healthy after one good sample.",
          correction:
            "Use a written recovery gate with hysteresis, transform coverage, and any required operator or subsystem acknowledgment.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is a normal callback rate insufficient evidence of freshness?",
          answer:
            "A publisher can repeatedly send copied data with an unchanged old timestamp, so callbacks arrive while observation age grows.",
        },
        {
          question: "What should a useful health panel show besides a colour?",
          answer:
            "The state reason, measurement stamp, age, observed rate, value or frame fault, response, and last transition time.",
        },
        {
          question: "What does hysteresis improve in a health state machine?",
          answer:
            "It prevents rapid state flicker and requires stronger sustained evidence before recovery than one boundary-crossing sample.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The actual health-state timeline and operator panel built in the exercise provide more job-relevant visual evidence than another course diagram.",
      },
    },
    {
      dayId: 49,
      mentalModel:
        "A simulation test is a controlled scientific experiment: freeze the starting conditions, change one cause, and judge a measurable result.",
      explanation: [
        "A reusable scenario is more than a world file. It names the world and model revisions, initial poses, time and physics settings, configuration, seed set, launch order, command input, fault schedule, duration, and reset procedure. It also defines an oracle: a machine-checkable rule for the expected result. A screenshot of a rover beside a wall is not an oracle. An assertion such as no collision, stop command within 150 ms, measured speed below 0.02 m/s within 400 ms, and terminal result ABORTED is inspectable.",
        "Fault injection introduces a known problem at a known boundary and time. Useful sensor faults include added bias, noise burst, lower rate, packet drop, frozen timestamp, invalid value, delayed transform, and complete disconnect. Inject one first so the evidence has one likely cause; combined faults belong in later stress tests. Preserve the clean baseline and verify it again after each repair. A fault tool that changes internal state without recording exactly what it changed can make the test less trustworthy than the bug.",
        "Use a small scenario matrix rather than one perfect demo. Give every row an ID, seed, change from baseline, predicted symptom, expected detection, bounded response, terminal state, metrics, and artifact paths. Run multiple trials when noise or concurrency affects outcomes. Report successes over attempts, detection and stop latency percentiles or ranges, false alarms, collisions, timeouts, and unexplained cases. Never delete a failure merely because a later rerun passed.",
        "This chapter's portfolio artifact should let a reviewer run one command, see a baseline and several controlled failures, and inspect a concise report linked to raw logs and MCAP. State the evidence boundary plainly: Gazebo validates software integration against modeled physics and faults. It does not prove real friction, sensor optics, motor current, network interference, emergency-stop circuitry, human interaction, or site acceptance. That honesty makes the work stronger for validation, integration, robotics-software, and physical-AI deployment roles.",
      ],
      keyTerms: [
        {
          term: "Scenario",
          meaning:
            "A versioned test definition containing starting state, inputs, conditions, timing, expected result, and evidence.",
          physicalExample:
            "Rover starts two metres from a wall, receives 0.3 m/s for three seconds, then its lidar timestamp freezes at simulation time 2.0 s.",
        },
        {
          term: "Oracle",
          meaning:
            "A rule that decides whether the observed result satisfies the test expectation.",
          physicalExample:
            "No contact plus measured speed below 0.02 m/s within 400 ms is stronger than a person saying the stop looked fine.",
        },
        {
          term: "Fault injection",
          meaning:
            "Deliberately introducing a known failure at a controlled boundary and time.",
          physicalExample:
            "A relay node keeps publishing scans while freezing their timestamps to test freshness handling.",
        },
        {
          term: "Seed set",
          meaning:
            "A recorded collection of random seeds used to repeat particular noise cases and sample outcome variation.",
          physicalExample:
            "Seeds 3, 17, and 42 create three named noise sequences included in every regression run.",
        },
        {
          term: "Regression",
          meaning:
            "A previously working behavior that breaks after a change, detected by rerunning stable tests.",
          physicalExample:
            "A bridge update makes the frozen-stamp scenario time out instead of reaching the expected safe abort.",
        },
      ],
      physicalExamples: [
        {
          title: "Fire drill",
          scenario:
            "A building drill fixes the alarm condition, observes detection and evacuation, records problems, and never claims that one drill proves every possible fire safe.",
          lookFor:
            "Relate the alarm to injected stimulus, evacuation criteria to the oracle, and untested real fire conditions to the simulation evidence boundary.",
        },
        {
          title: "Bicycle brake test",
          scenario:
            "A mechanic marks a start line, speed, surface, load, braking point, and stopping-distance limit, then changes one condition at a time.",
          lookFor:
            "Without controlled speed and surface, two stopping distances cannot be fairly compared.",
        },
      ],
      workedExample: {
        title: "Design a four-row sensor-fault matrix",
        setup:
          "A simulated rover approaches a wall at 0.30 m/s. Its command gate should stop on stale or invalid lidar before contact.",
        steps: [
          "Define the nominal row: seed 17, fresh 20 Hz scans, no collision, task completes, and all health checks remain healthy.",
          "Define a noise row: add the documented range spread, expect no false stop across the declared seed set, and record minimum clearance.",
          "Define a frozen-stamp row at simulation time 2.0 s: expect stale detection within the age limit and a bounded stop before contact.",
          "Define a disconnect row: stop scan delivery, expect a distinct no-data reason, bounded output, and terminal ABORTED rather than endless RUNNING.",
          "For every row capture scenario ID, versions, seed, message counts, detection latency, command trace, measured velocity, clearance, contact count, terminal state, and artifact links.",
          "Run the baseline again after restoring faults and compare the full result table rather than only the final status.",
        ],
        result:
          "The matrix distinguishes normal variability, freshness failure, and transport loss while using measurable safe outcomes instead of visual judgement.",
        takeaway:
          "A small, controlled, repeatable matrix teaches more than a large unstructured demonstration.",
      },
      handsOn: {
        setup:
          "Package the week's world, differential-drive model, sensor configuration, command gate, health monitor, and MCAP evidence into one reproducible repository.",
        steps: [
          "Write a scenario schema containing IDs, versions, hashes, initial state, time and physics settings, seed, inputs, fault schedule, assertions, and artifact locations.",
          "Implement one clean baseline plus at least frozen timestamp, rate reduction or dropout, invalid value, and disconnect as isolated scenario rows.",
          "Run each row from a full reset, preserve raw logs and selected MCAP, and calculate detection time, bounded-command time, measured-stop time, clearance, contacts, and terminal state.",
          "Repeat stochastic rows over the declared seed set, retain every failure, and produce a concise table linked to the decisive evidence.",
          "Have a second engineer or clean environment execute the documented entry point, then record differences and the simulation-to-hardware limitations that remain unverified.",
        ],
        observe:
          "A useful harness makes the expected failure visible, reaches a bounded terminal result, resets cleanly, and produces the same explanation without manual scene editing.",
        doneWhen:
          "A reviewer can reproduce the nominal and fault rows, trace every verdict to raw evidence, and see an explicit list of hardware, safety, and site claims the simulator cannot prove.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "Ship a deterministic-enough Gazebo regression harness that scores nominal and degraded robot behavior, retains failures, and forms the software-in-the-loop layer of a later HIL and real-robot evidence chain.",
        interviewPrompt:
          "Design a simulation test for a rover that must stop when lidar timestamps freeze. Specify the fixture, injection point, clock, oracle, metrics, reset, artifacts, repeated trials, and claims you would not make.",
      },
      commonMistakes: [
        {
          mistake: "Calling a saved world a reproducible scenario.",
          correction:
            "Include model and code versions, effective configuration, initial state, clock, physics, seed, input, fault schedule, reset, oracle, and artifacts.",
        },
        {
          mistake: "Injecting several failures in one first test and guessing which one caused the outcome.",
          correction:
            "Establish a clean baseline and inject one controlled fault per diagnostic scenario before combined stress cases.",
        },
        {
          mistake: "Presenting simulation success as real-robot safety or site acceptance.",
          correction:
            "State that the harness validates software against modeled conditions and list the physical, electrical, environmental, and human factors still unverified.",
        },
      ],
      checkQuestions: [
        {
          question: "What turns a visual demo into a test?",
          answer:
            "Controlled starting conditions and inputs, a repeatable procedure, a machine-checkable expected result, measured evidence, and a clean reset.",
        },
        {
          question: "Why keep failed trials when a rerun passes?",
          answer:
            "Intermittent failures reveal nondeterminism or missing controls; deleting them hides the reliability distribution the test is meant to measure.",
        },
        {
          question: "What does a Gazebo sensor-fault test not prove?",
          answer:
            "It does not prove real sensor optics, wiring, power, floor contact, motor behavior, networks, emergency-stop circuitry, people, or site acceptance.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A scenario matrix linked to a single command-to-fault-to-detection-to-safe-terminal timeline exposes the evidence chain and distinct fault outcomes at a glance.",
      },
    },
  ],
} as const satisfies ChapterContent;
