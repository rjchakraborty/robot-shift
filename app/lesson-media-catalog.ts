export type LessonVideo = {
  title: string;
  publisher: string;
  youtubeId: string;
  sourceUrl: string;
  why: string;
};

export type LessonExploreLink = {
  title: string;
  publisher: string;
  url: string;
  why: string;
};

export type ResolvedLessonMedia = {
  video?: LessonVideo;
  explore: readonly LessonExploreLink[];
};

type WeekMedia = {
  videos?: readonly LessonVideo[];
  explore?: readonly LessonExploreLink[];
};

const northwesternVideo = (
  title: string,
  youtubeId: string,
  sourceUrl: string,
  why: string,
): LessonVideo => ({
  title,
  publisher: "Northwestern University · Modern Robotics",
  youtubeId,
  sourceUrl,
  why,
});

const officialVideo = (
  title: string,
  publisher: string,
  youtubeId: string,
  sourceUrl: string,
  why: string,
): LessonVideo => ({ title, publisher, youtubeId, sourceUrl, why });

const officialLink = (
  title: string,
  publisher: string,
  url: string,
  why: string,
): LessonExploreLink => ({ title, publisher, url, why });

const weekMedia: Readonly<Record<number, WeekMedia>> = {
  1: {
    videos: [
      northwesternVideo(
        "Degrees of freedom of a rigid body",
        "z29hYlagOYM",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-1-degrees-of-freedom-of-a-rigid-body/",
        "Connect independent motion to the coordinates used in the first frame exercises.",
      ),
      northwesternVideo(
        "Configuration-space topology",
        "FyLNR3edOds",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-3-1-configuration-space-topology/",
        "See why robot configurations can wrap around even when a chart looks flat.",
      ),
      northwesternVideo(
        "Rotation matrices",
        "OZucG1DY_sY",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-2-1-rotation-matrices-part-1-of-2/",
        "Relate a rotation matrix to moving basis arrows instead of a table of numbers.",
      ),
      northwesternVideo(
        "Homogeneous transformation matrices",
        "vlb3P7arbkU",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-3-1-homogeneous-transformation-matrices/",
        "Join rotation and translation into the frame-to-frame operation used by robots.",
      ),
    ],
    explore: [
      officialLink(
        "Modern Robotics software library",
        "Northwestern Robotics and Biosystems Lab",
        "https://github.com/NxRLab/ModernRobotics",
        "Compare the lesson equations with small reference implementations.",
      ),
      officialLink(
        "Linear Algebra",
        "MIT OpenCourseWare",
        "https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/",
        "Use selected vector, matrix, projection, and least-squares lessons when the math needs a slower foundation.",
      ),
    ],
  },
  2: {
    videos: [
      northwesternVideo(
        "Forward kinematics example",
        "cKHsil0V6Qk",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/forward-kinematics-example/",
        "Trace joint values through a kinematic chain to the end-effector pose.",
      ),
      northwesternVideo(
        "The space Jacobian",
        "KbI8HN3imtQ",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/5-1-1-space-jacobian/",
        "Build intuition for how joint speeds combine into tool motion.",
      ),
      northwesternVideo(
        "Inverse kinematics of open chains",
        "nin2TbMuhR0",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/inverse-kinematics-of-open-chains/",
        "See why solving for joints is iterative and can fail at limits or singularities.",
      ),
    ],
    explore: [
      officialLink(
        "Robotics Toolbox for Python",
        "Peter Corke",
        "https://petercorke.github.io/robotics-toolbox-python/",
        "Reproduce kinematics numerically and inspect reachable and failed targets.",
      ),
    ],
  },
  3: {
    videos: [
      northwesternVideo(
        "Control-system overview",
        "mGuDXlZEoSc",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-1-control-system-overview/",
        "Place feedback, error, command, and the physical plant in one loop.",
      ),
    ],
    explore: [
      officialLink(
        "Underactuated Robotics",
        "MIT",
        "https://underactuated.csail.mit.edu/",
        "Use the interactive notes to connect dynamics with stability and control.",
      ),
    ],
  },
  4: {
    explore: [
      officialLink(
        "C++ Core Guidelines",
        "ISO C++ Foundation",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines",
        "Apply explicit ownership and lifetime rules at the hardware boundary.",
      ),
      officialLink(
        "ROS 2 real-time programming demo",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/Tutorials/Demos/Real-Time-Programming.html",
        "Inspect the operating-system choices behind bounded control-loop timing.",
      ),
    ],
  },
  5: {
    explore: [
      officialLink(
        "ROS 2 tutorials",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/Tutorials.html",
        "Build and inspect the graph using the supported command-line and code path.",
      ),
      officialLink(
        "Official ROS videos",
        "Open Source Robotics Foundation",
        "https://vimeo.com/osrfoundation/videos",
        "Use demonstrations from the ROS maintainers when a graph concept needs another angle.",
      ),
    ],
  },
  6: {
    videos: [
      northwesternVideo(
        "Homogeneous transformation matrices",
        "vlb3P7arbkU",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-3-1-homogeneous-transformation-matrices/",
        "Revisit frame composition before debugging tf2 and a robot model.",
      ),
    ],
    explore: [
      officialLink(
        "tf2 tutorials",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Tf2/Tf2-Main.html",
        "Practice publishing, listening to, and diagnosing timestamped transforms.",
      ),
      officialLink(
        "URDF tutorials",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/Tutorials/Intermediate/URDF/URDF-Main.html",
        "Build a model whose links, joints, visuals, and frames can be inspected.",
      ),
    ],
  },
  7: {
    videos: [
      northwesternVideo(
        "Wheeled mobile robots",
        "NYO2X3eJ_Ro",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/13-1-wheeled-mobile-robots/",
        "Connect wheel motion to the simulated base velocity and odometry.",
      ),
      officialVideo(
        "Building your own robot in Gazebo",
        "Open Robotics · Gazebo",
        "Z-gjU0KAjiw",
        "https://gazebosim.org/docs/harmonic/building_robot/",
        "Follow the maintained link, joint, inertial, collision, and visual-model sequence before adding sensors.",
      ),
    ],
    explore: [
      officialLink(
        "Gazebo Harmonic ROS 2 integration",
        "Open Robotics",
        "https://gazebosim.org/docs/harmonic/ros2_integration/",
        "Follow the maintained bridge and simulation-time workflow.",
      ),
    ],
  },
  8: {
    explore: [
      officialLink(
        "Nav2 concepts",
        "Open Navigation",
        "https://docs.nav2.org/concepts/index.html",
        "Trace the map, localization, planning, control, and recovery loop as one system.",
      ),
      officialLink(
        "Nav2 first-time setup guide",
        "Open Navigation",
        "https://docs.nav2.org/setup_guides/index.html",
        "Check the robot-specific configuration required before tuning navigation.",
      ),
    ],
  },
  9: {
    explore: [
      officialLink(
        "OpenCV Python tutorials",
        "OpenCV",
        "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html",
        "Run small image-processing examples and inspect every intermediate image.",
      ),
      officialLink(
        "Camera calibration tutorial",
        "OpenCV",
        "https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html",
        "Connect intrinsics and distortion to measured reprojection error.",
      ),
    ],
  },
  10: {
    explore: [
      officialLink(
        "Open3D tutorials",
        "Open3D",
        "https://www.open3d.org/docs/release/tutorial/geometry/pointcloud.html",
        "Inspect filtering, normals, segmentation, and geometry operations on a real point cloud.",
      ),
    ],
  },
  11: {
    explore: [
      officialLink(
        "Nav2 localization concepts",
        "Open Navigation",
        "https://docs.nav2.org/concepts/index.html#amcl",
        "Relate uncertainty and sensor updates to the robot pose used by navigation.",
      ),
      officialLink(
        "State Estimation for Robotics course",
        "Carnegie Mellon University",
        "https://www.cs.cmu.edu/~kaess/teaching/16833/Spring2023/",
        "Use the course material when the predict-update cycle needs a deeper derivation.",
      ),
    ],
  },
  12: {
    videos: [
      northwesternVideo(
        "Overview of motion planning",
        "aC4LQuB4Cic",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/10-1-overview-of-motion-planning/",
        "See how obstacles become forbidden regions in configuration space.",
      ),
      northwesternVideo(
        "Grasping and manipulation",
        "jAhpRolF-zg",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/grasping-and-manipulation/",
        "Connect contact constraints to a practical manipulation plan.",
      ),
    ],
    explore: [
      officialLink(
        "MoveIt 2 tutorials",
        "MoveIt",
        "https://moveit.picknik.ai/main/doc/tutorials/tutorials.html",
        "Build the planning-scene and execution flow with maintained examples.",
      ),
    ],
  },
  13: {
    explore: [
      officialLink(
        "PyTorch beginner tutorials",
        "PyTorch Foundation",
        "https://pytorch.org/tutorials/beginner/basics/intro.html",
        "Tie tensors, datasets, optimization, and saving a model into one executable path.",
      ),
    ],
  },
  14: {
    explore: [
      officialLink(
        "LeRobot datasets",
        "Hugging Face",
        "https://huggingface.co/docs/lerobot/lerobot-dataset-v3",
        "Compare your episode schema, timestamps, metadata, and splits with a maintained format.",
      ),
      officialLink(
        "LeRobot data collection guide",
        "Hugging Face",
        "https://huggingface.co/docs/lerobot/il_robots",
        "See how teleoperation, recording, replay, and training fit together.",
      ),
    ],
  },
  15: {
    videos: [
      northwesternVideo(
        "Grasping and manipulation",
        "jAhpRolF-zg",
        "https://modernrobotics.northwestern.edu/nu-gm-book-resource/grasping-and-manipulation/",
        "Ground a learned action in the contact and grasp constraints of the physical task.",
      ),
    ],
    explore: [
      officialLink(
        "LeRobot policy documentation",
        "Hugging Face",
        "https://huggingface.co/docs/lerobot/il_robots",
        "Follow the supported behavior-cloning workflow before comparing policy families.",
      ),
    ],
  },
  16: {
    explore: [
      officialLink(
        "Open-RMF fleet-adapter integration",
        "Open Robotics",
        "https://osrf.github.io/ros2multirobotbook/integration_fleets_adapter_tutorial.html",
        "Trace task requests and robot state through a production fleet boundary.",
      ),
      officialLink(
        "VDA 5050 specification",
        "VDA",
        "https://github.com/VDA5050/VDA5050",
        "Compare the fleet messages with a maintained industrial interface specification.",
      ),
    ],
  },
  17: {
    explore: [
      officialLink(
        "ROS 2 launch testing",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/p/launch_testing/",
        "Exercise running nodes and their interfaces instead of testing isolated functions only.",
      ),
      officialLink(
        "ROS 2 bag recording and playback",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/Tutorials/Beginner-CLI-Tools/Recording-And-Playing-Back-Data/Recording-And-Playing-Back-Data.html",
        "Capture a repeatable evidence trail for failures and acceptance checks.",
      ),
    ],
  },
  18: {
    explore: [
      officialLink(
        "Gemini Robotics",
        "Google DeepMind",
        "https://deepmind.google/models/gemini-robotics/",
        "Trace how vision, language, and action are joined while keeping control limits outside the model.",
      ),
    ],
  },
  19: {
    explore: [
      officialLink(
        "OpenVLA project",
        "Stanford, UC Berkeley, Toyota Research Institute",
        "https://openvla.github.io/",
        "Inspect a public VLA architecture, training data summary, and evaluation protocol.",
      ),
      officialLink(
        "LeRobot documentation",
        "Hugging Face",
        "https://huggingface.co/docs/lerobot/index",
        "Use a practical supported stack for datasets, policies, and robot interfaces.",
      ),
    ],
  },
  20: {
    explore: [
      officialLink(
        "Gemini Robotics-ER 1.6",
        "Google DeepMind",
        "https://deepmind.google/blog/gemini-robotics-er-1-6/",
        "Study embodied reasoning as a planner whose outputs still require typed skills and validation.",
      ),
      officialLink(
        "BehaviorTree.CPP basic tutorials",
        "BehaviorTree.CPP",
        "https://www.behaviortree.dev/docs/category/tutorials-basic/",
        "Turn a language-model proposal into bounded, inspectable skills with explicit success, failure, and recovery states.",
      ),
    ],
  },
  21: {
    explore: [
      officialLink(
        "ROS 2 security tutorial",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/Tutorials/Advanced/Security/Introducing-ros2-security.html",
        "Add identity, encryption, and access control to the robot graph before adversarial testing.",
      ),
      officialLink(
        "SROS2 implementation",
        "Open Robotics",
        "https://github.com/ros2/sros2",
        "Inspect the tooling that creates and applies ROS 2 security policies.",
      ),
    ],
  },
  22: {
    explore: [
      officialLink(
        "ros2_control hardware components",
        "ROS Controls",
        "https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/hardware_components_userdoc.html",
        "Map command and state interfaces to lifecycle-managed physical hardware.",
      ),
      officialLink(
        "LeRobot supported robots",
        "Hugging Face",
        "https://huggingface.co/docs/lerobot/supported_robots",
        "Check supported bring-up paths before choosing or wiring hardware.",
      ),
    ],
  },
  23: {
    explore: [
      officialLink(
        "LeRobotDataset v3",
        "Hugging Face",
        "https://huggingface.co/docs/lerobot/lerobot-dataset-v3",
        "Use a concrete schema to review synchronization, metadata, and dataset versions.",
      ),
    ],
  },
  24: {
    explore: [
      officialLink(
        "TensorRT documentation",
        "NVIDIA",
        "https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html",
        "Profile and validate an optimized model instead of assuming export preserves behavior.",
      ),
      officialLink(
        "Isaac Lab documentation",
        "NVIDIA",
        "https://isaac-sim.github.io/IsaacLab/main/index.html",
        "Use reproducible simulation and evaluation when physical trials are expensive.",
      ),
    ],
  },
  25: {
    explore: [
      officialLink(
        "ROS 2 diagnostics",
        "Open Robotics",
        "https://docs.ros.org/en/jazzy/p/diagnostic_updater/",
        "Expose hardware and subsystem health as structured, reviewable state.",
      ),
      officialLink(
        "OpenVLA project",
        "Stanford, UC Berkeley, Toyota Research Institute",
        "https://openvla.github.io/",
        "Compare your capstone evidence with a published policy evaluation format.",
      ),
    ],
  },
  26: {
    explore: [
      officialLink(
        "Open Robotics jobs board",
        "Open Robotics Discourse",
        "https://discourse.openrobotics.org/c/jobs/15",
        "Compare your portfolio evidence with current robotics role language.",
      ),
      officialLink(
        "Figure careers",
        "Figure",
        "https://www.figure.ai/careers",
        "Audit target-role requirements against the proof produced by the capstone.",
      ),
    ],
  },
};

export function resolveLessonMedia(week: number, dayId: number): ResolvedLessonMedia {
  const media = weekMedia[week];
  const videos = media?.videos ?? [];
  const dayInWeek = Math.max(0, dayId - 1) % 7;
  const videoIndex = videos.length === 0 ? 0 : dayInWeek % videos.length;

  return {
    video: videos[videoIndex],
    explore: (media?.explore ?? []).slice(0, 2),
  };
}
