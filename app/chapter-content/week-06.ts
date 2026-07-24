import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION = "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION = "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";

export const week06Content = {
  week: 6,
  title: "Give the robot an inspectable body, frame tree, and control boundary",
  purpose:
    "Build one small robot description from physical measurements, connect every sensor and moving link through time-aware transforms, then expose measured state and bounded commands through ros2_control without confusing a software command with verified motion.",
  prerequisites: [
    "Name links, revolute joints, prismatic joints, joint axes, and degrees of freedom.",
    "Read metres, radians, kilograms, and seconds, and add aligned translations.",
    "Understand a ROS 2 node, topic, message timestamp, launch file, and lifecycle state at a beginner level.",
    "Recognize that powered hardware needs limits, an emergency stop, and a supervised first-motion procedure.",
  ],
  outcomes: [
    "Read and create a small URDF whose link frames, joint origins, axes, limits, visual geometry, collision geometry, and inertial data have distinct meanings.",
    "Use Xacro to remove repetition while keeping the expanded URDF deterministic, uniquely named, and reviewable; explain what belongs in SRDF instead.",
    "Build a single-parent tf2 tree and distinguish fixed relationships from time-varying relationships.",
    "Perform a transform lookup for the sensor measurement time and diagnose disconnected, stale, and future-dated data without hiding the failure.",
    "Trace ros2_control's read–update–write loop through hardware, state interfaces, controllers, command interfaces, and lifecycle transitions.",
    "Distinguish commanded joint state, measured joint state, published JointState data, and the transforms produced by robot_state_publisher.",
    "Run a repeatable model-and-transform audit that detects topology, unit, naming, timestamp, and controller-interface faults.",
  ],
  jobTargets: [ROLE_HMI, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
  sources: [
    {
      label: "ROS 2 documentation — URDF tutorials",
      url: "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/URDF/URDF-Main.html",
      useFor:
        "The official sequence for visual, movable, collision, and physical robot models, Xacro, and robot_state_publisher.",
    },
    {
      label: "ROS xacro repository",
      url: "https://github.com/ros/xacro",
      useFor:
        "The maintained XML macro language used to generate shorter, parameterized robot-description XML.",
    },
    {
      label: "ROS 2 documentation — tf2 tutorials",
      url: "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Tf2/Tf2-Main.html",
      useFor:
        "Official broadcaster, listener, frame-tree, time, timeout, and debugging exercises.",
    },
    {
      label: "ROS robot_state_publisher",
      url: "https://github.com/ros/robot_state_publisher",
      useFor:
        "The maintained description of how URDF and joint_states produce fixed and moving transforms.",
    },
    {
      label: "ros2_control — getting started and architecture",
      url: "https://control.ros.org/rolling/doc/getting_started/getting_started.html",
      useFor:
        "Controller Manager, Resource Manager, hardware components, state and command interfaces, lifecycle, and the read–update–write loop.",
    },
  ],
  days: [
    {
      dayId: 36,
      mentalModel:
        "A URDF is a labelled family tree for the robot's rigid parts: it says what is connected to what and where each connection starts, but it does not by itself move, control, or calibrate the real machine.",
      explanation: [
        "A program cannot reason about “the metal plate near the motor”; it needs stable names and explicit relationships. URDF, the Unified Robot Description Format, stores that model as XML. Each rigid body is a link, and each connection between two links is a joint. A normal URDF robot is a tree: one root link has no parent, every other link has exactly one parent joint, and following parent-to-child connections cannot return to where it started. This tree restriction makes the pose of every child traceable from the root.",
        "A link may contain three descriptions that look similar on screen but serve different jobs. Visual geometry tells RViz or another viewer what to draw. Collision geometry gives planners and simulators a usually simpler occupied shape to test for contact. Inertial data describes mass, centre of mass, and rotational inertia for dynamics. A beautiful mesh is not automatically a safe collision model, and a guessed box or zero inertia is not a trustworthy physical model. Keep the three roles separate even when the first toy model uses simple boxes and cylinders for all of them.",
        "A joint names a parent link, a child link, a type, and an origin. At the zero joint position, the origin places the child link frame relative to the parent link frame. A revolute or continuous joint also has an axis; a limited revolute joint needs lower and upper angle limits, while a prismatic joint uses distance limits. The axis is expressed in the joint frame, so changing the joint origin can change how the same numeric axis points in the parent. Use SI units: metres, radians, kilograms, and seconds. A mesh exported in millimetres can appear one thousand times too large if its scale is not handled deliberately.",
        "URDF is a design claim, not proof that the hardware matches it. A strong workflow checks the XML, opens the model in RViz, moves each joint through its allowed range, and compares a few measured physical distances with model distances. It also records where calibration lives, because encoder zero offsets and camera calibration usually come from configuration or calibration data rather than a hand-edited drawing. Never infer that a collision-free picture, valid XML file, or successful launch makes powered motion safe.",
      ],
      keyTerms: [
        {
          term: "Link",
          meaning: "A robot body treated as rigid and given its own coordinate frame.",
          physicalExample: "The aluminium forearm plate between an elbow bearing and a wrist bearing.",
        },
        {
          term: "Joint origin",
          meaning: "The pose of a child link frame relative to its parent when the joint coordinate is zero.",
          physicalExample: "The elbow hinge centre is 0.30 m along the upper-arm x-axis.",
        },
        {
          term: "Visual geometry",
          meaning: "Geometry chosen to show what the robot looks like.",
          physicalExample: "A detailed camera housing mesh displayed in RViz.",
        },
        {
          term: "Collision geometry",
          meaning: "Geometry used when checking occupied space or simulated contact.",
          physicalExample: "A conservative box around the camera housing that is faster to test than every screw.",
        },
        {
          term: "Inertial data",
          meaning: "Mass, centre of mass, and inertia values used by physics and dynamics.",
          physicalExample: "A battery shifts the chassis centre of mass even if the outside shape stays the same.",
        },
      ],
      physicalExamples: [
        {
          title: "Cardboard two-link arm",
          scenario:
            "Two cardboard strips are joined by a paper fastener. Each strip is a link, and the fastener is a one-axis revolute joint.",
          lookFor:
            "Mark a frame at each hinge, measure the distance between hinges, and verify which direction the joint axis points through the cardboard.",
        },
        {
          title: "Lidar on a mobile base",
          scenario:
            "A lidar is bolted 0.18 m forward and 0.24 m above the base reference point.",
          lookFor:
            "Use a fixed joint for the rigid mounting, then check that the drawn scan origin matches the real optical centre rather than the outside of the housing.",
        },
      ],
      workedExample: {
        title: "Place a two-link arm in its zero pose",
        setup:
          "The shoulder link frame is at the base. The elbow joint is 0.30 m along the shoulder x-axis, and a fixed tool frame is another 0.25 m along the forearm x-axis. All axes are aligned at zero.",
        steps: [
          "Choose base_link as the root and create upper_link, forearm_link, and tool_link as children in one chain.",
          "Place shoulder_joint at the base origin and give it the intended revolute axis and safe angle limits.",
          "Set elbow_joint's zero-pose origin to x = 0.30 m from upper_link; do not put 300 and silently treat millimetres as metres.",
          "Set tool_joint to fixed with an origin x = 0.25 m from forearm_link.",
          "For this aligned zero pose only, check x_tool = 0.30 m + 0.25 m = 0.55 m from the shoulder frame.",
          "Rotate the elbow in a viewer; the forearm and tool should move together around the marked elbow axis while upper_link stays attached to the base.",
        ],
        result:
          "The tool is 0.55 m from the shoulder only in the aligned zero pose, and every child has one traceable parent.",
        takeaway:
          "A quick known-pose calculation catches unit and origin errors before a detailed mesh can hide them.",
      },
      handsOn: {
        setup:
          "Use a two-strip cardboard arm or two rulers, a measuring tape, and a small robot-description repository. If ROS 2 is available, use its URDF checker and RViz; keep hardware unpowered.",
        steps: [
          "Label the root, two moving links, two joint names, a tool frame, and each joint axis directly on the physical model.",
          "Measure every origin offset in metres and write the measurement beside the matching physical feature.",
          "Create the smallest URDF using primitive visual and collision shapes, realistic positive masses, and conservative joint limits.",
          "Run the URDF checker, inspect the generated tree, and open the model with a joint-state GUI in RViz.",
          "Move one joint at a time and compare the screen axis, direction, limit, and zero pose with the unpowered model.",
          "Plant one 1000× mesh-scale or origin-unit error, record the visible symptom, repair it, and keep the before/after evidence.",
        ],
        observe:
          "A structurally valid tree can still be physically wrong; scale, axis, origin, and geometry-role mistakes need known measurements and motion checks.",
        doneWhen:
          "The model validates, each joint moves the correct child around the correct axis, and a reviewer can trace every numeric origin back to a recorded measurement.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Turn a vendor CAD assembly and measurement sheet into a reviewable robot_description package, then prove joint axes, physical extents, limits, and collision envelopes against the unpowered machine.",
        interviewPrompt:
          "A robot looks correct in RViz but collides early in planning and falls over in simulation. Explain which URDF sections you would inspect, what each one controls, and how you would compare them with hardware.",
      },
      commonMistakes: [
        {
          mistake: "Using the detailed visual mesh as proof that collision and inertia are correct.",
          correction:
            "Review visual, collision, and inertial data separately and test each against its own purpose.",
        },
        {
          mistake: "Treating joint origin and link length as interchangeable numbers.",
          correction:
            "Define named frames first, then measure the transform from the parent frame to the child frame at zero position.",
        },
        {
          mistake: "Typing millimetre measurements directly into fields that expect metres.",
          correction:
            "Convert at the measurement boundary and add a physical-range assertion that rejects impossible robot dimensions.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a link have different visual and collision geometry?",
          answer:
            "The visual model represents appearance, while the collision model should represent occupied space efficiently and conservatively.",
        },
        {
          question: "What does a revolute joint origin describe?",
          answer:
            "It places the child link frame relative to the parent link frame when the joint coordinate is zero.",
        },
        {
          question: "What does a successful URDF parse not prove?",
          answer:
            "It does not prove correct scale, axes, masses, collision envelopes, calibration, or agreement with the physical robot.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A link–joint tree with separate visual, collision, and inertial layers conveys relationships that are difficult to recover from XML alone.",
      },
    },
    {
      dayId: 37,
      mentalModel:
        "Xacro is a template maker for robot XML: humans edit the recipe, but every tool downstream must receive and validate the fully expanded URDF.",
      explanation: [
        "Plain URDF becomes repetitive when a robot has two wheels, two fingers, or several sensor mounts. Copying a twenty-line link block and changing a few values is an invitation to leave one old name or offset behind. Xacro adds properties, calculations, parameters, macros, includes, and conditionals to XML. A macro can describe one wheel once and instantiate it as left and right with different names and signs. Xacro is a build-time generator; the expanded URDF, not the compact template, is the actual robot model consumed by normal URDF tools.",
        "A useful macro exposes a real variation such as name prefix, wheel side, radius, length, material, or mounting pose. It should not hide essential structure behind a maze of global properties. Every generated link and joint still needs a unique name, and every parent or child reference must point to the intended generated name. Prefixing is especially important when the same module is instantiated twice. Treat expansion like compiling source code: generate the output in an automated check, validate it, and inspect a meaningful diff when parameters change.",
        "Calculations inside Xacro need the same unit discipline as handwritten URDF. A track width of 0.40 m gives wheel y offsets of +0.20 m and −0.20 m when the base frame sits halfway between them. Store the width once, derive both offsets, and make the sign an explicit side parameter. That removes duplicate numbers but does not remove the need for a physical measurement. A calculated value can be consistently wrong if the source property is wrong, so keep measurement provenance and range checks.",
        "SRDF answers different questions from URDF. URDF describes the physical kinematic tree and geometry. An SRDF commonly adds semantic information for motion planning, such as named joint groups, a named home state, end-effectors, virtual joints, or collision pairs known to be safe to ignore. It does not repair a missing URDF link, incorrect axis, bad mass, or wrong transform. Keep semantic planning choices beside—but not mixed up with—the physical model, and expect later MoveIt work to use both.",
      ],
      keyTerms: [
        {
          term: "Xacro property",
          meaning: "A named value reused or calculated while generating XML.",
          physicalExample: "One measured wheel radius used by both wheel instances.",
        },
        {
          term: "Xacro macro",
          meaning: "A parameterized XML template that expands into links, joints, or other elements.",
          physicalExample: "One wheel template instantiated for the left and right sides.",
        },
        {
          term: "Expanded URDF",
          meaning: "The ordinary XML robot model produced after Xacro evaluates the recipe.",
          physicalExample: "The six uniquely named wheel-and-joint elements a checker sees after two macro calls.",
        },
        {
          term: "Name prefix",
          meaning: "A caller-supplied string used to keep repeated component names unique.",
          physicalExample: "left_ and right_ distinguish two otherwise identical gripper fingers.",
        },
        {
          term: "SRDF",
          meaning: "A semantic description used with the robot model for concepts such as planning groups and named states.",
          physicalExample: "An arm group contains shoulder, elbow, and wrist joints and has a named stowed state.",
        },
      ],
      physicalExamples: [
        {
          title: "Mirrored drive wheels",
          scenario:
            "The same wheel shape, mass, radius, and joint type appear on both sides, but the names and lateral offsets differ.",
          lookFor:
            "Make the side sign and prefix explicit; do not mirror by copying a block and hoping every old value was changed.",
        },
        {
          title: "Replaceable camera module",
          scenario:
            "A camera bracket is reused on a base mast and a wrist with different parent links and mounting poses.",
          lookFor:
            "The macro should expose parent, prefix, and mount pose while keeping camera geometry and frame naming rules in one place.",
        },
      ],
      workedExample: {
        title: "Expand one wheel macro twice without name collisions",
        setup:
          "A base has track width 0.40 m and two identical wheels of radius 0.08 m. The base frame is centred between them.",
        steps: [
          "Store wheel_radius = 0.08 and track_width = 0.40 as clearly unit-labelled properties.",
          "Define a wheel macro with prefix and side_sign parameters rather than separate left and right copies.",
          "Calculate y = side_sign × track_width / 2, giving +0.20 m for one side and −0.20 m for the other.",
          "Generate link names left_wheel_link and right_wheel_link and joint names left_wheel_joint and right_wheel_joint.",
          "Expand the Xacro and verify that exactly two wheel links and two wheel joints exist with no duplicate identifiers.",
          "Check both origins in the expanded URDF and move each joint independently in the viewer.",
        ],
        result:
          "One measured width creates two symmetric 0.20 m offsets, while explicit prefixes keep all generated references unique.",
        takeaway:
          "Removing duplicated XML is valuable only if the generated model becomes easier—not harder—to inspect.",
      },
      handsOn: {
        setup:
          "Start from the Day 36 description and work only with unpowered or simulated geometry.",
        steps: [
          "Identify one genuinely repeated physical module, such as a wheel, finger, caster, or sensor bracket.",
          "Convert that module into a macro whose parameters correspond to measured variations and naming needs.",
          "Generate the plain URDF and save it as a CI artifact or temporary review output.",
          "Validate the expanded model, check unique names, and compare its tree and zero pose with the original working model.",
          "Call the macro twice with the same prefix, observe the validation or tree failure, then restore unique prefixes.",
          "Add a small SRDF note naming one planning group and one safe named state, while explaining why neither belongs in the physical URDF.",
        ],
        observe:
          "Most dangerous template failures are visible only after expansion: duplicate names, wrong parent references, sign errors, or hidden unit calculations.",
        doneWhen:
          "A reviewer can change one declared dimension, regenerate the model deterministically, and see the exact expected physical differences in the expanded output.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Maintain a reusable description package for several robot variants while CI expands every supported configuration, rejects duplicate names, and checks known physical dimensions.",
        interviewPrompt:
          "When would you introduce a Xacro macro, what would you expose as parameters, and how would you stop a template error from silently changing every robot variant?",
      },
      commonMistakes: [
        {
          mistake: "Reviewing only the compact Xacro because it looks clean.",
          correction:
            "Generate, validate, and inspect the expanded URDF that downstream components actually consume.",
        },
        {
          mistake: "Using shared global properties for every value in the model.",
          correction:
            "Pass real component variations as explicit macro parameters and keep local calculations close to their use.",
        },
        {
          mistake: "Putting planning groups into URDF or using SRDF to hide bad geometry.",
          correction:
            "Keep physical structure and geometry in URDF; keep supported semantic planning information in SRDF.",
        },
      ],
      checkQuestions: [
        {
          question: "What file should the normal URDF validator inspect when you author with Xacro?",
          answer:
            "The fully expanded ordinary URDF generated from the Xacro input.",
        },
        {
          question: "Why does a repeated module need a name prefix parameter?",
          answer:
            "Each generated link and joint must be unique, and every generated reference must point to the correct instance.",
        },
        {
          question: "Name one thing appropriate for SRDF but not a replacement for URDF.",
          answer:
            "A semantic arm planning group or named home state; it does not replace the physical link-and-joint tree.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The before-template, expanded-output, and validation exercise teaches this build-time relationship more directly than another generic robot diagram.",
      },
    },
    {
      dayId: 38,
      mentalModel:
        "A coordinate frame is a labelled ruler-and-compass attached to something; tf2 keeps the time-aware family tree that lets data written with one ruler be read with another.",
      explanation: [
        "A point such as (1, 0, 0) is incomplete until its frame and units are known. One metre forward from a camera is not the same physical location as one metre forward from a base whose x-axis points another way. tf2 stores relationships between named coordinate frames so nodes can transform stamped data into the frame they need. Common names include map, odom, base_link, camera_link, and tool0, but a name is useful only when the team documents its physical origin and axis convention.",
        "Every transform edge has a parent frame and a child frame. Together, the edges should form a connected single-parent tree for the portion of the system being compared. A fixed sensor bracket has a static transform: its relationship to the base does not change during operation. A rotating wheel, moving arm link, or mobile base needs dynamic transforms whose poses change and whose timestamps matter. Static relationships are normally published on /tf_static with durable transient-local behaviour; moving relationships are repeatedly published on /tf with time history.",
        "A lookup asks tf2 to convert data from a source frame into a target frame at a chosen time. For lookupTransform(target, source, time), read the question as “how do I express source-frame data in target-frame coordinates at this time?” tf2 may walk several edges, invert edges, and compose translations and rotations. In a one-dimensional aligned example, map-to-base x = 2.0 m and base-to-camera x = 0.4 m gives map-to-camera x = 2.4 m; the reverse relationship has −2.4 m. Real 3D transforms require rotation-aware multiplication, not simple addition.",
        "A healthy frame tree also has clear ownership. One authoritative component should publish each physical relationship, because two publishers fighting over the same child can create jumps that look like sensor noise. Use tools such as a frame-tree report and transform echo to check parent-child direction, age, rate, and reachability before changing algorithms. A tree that draws successfully can still be wrong by 90 degrees, 1000× scale, or one old timestamp, so include known-pose tests.",
      ],
      keyTerms: [
        {
          term: "Coordinate frame",
          meaning: "A named origin and set of axes used to describe positions and directions.",
          physicalExample: "base_link is centred between the drive wheels with x pointing forward.",
        },
        {
          term: "Static transform",
          meaning: "A frame relationship that is treated as constant during operation.",
          physicalExample: "A lidar bolted to the chassis at a measured offset.",
        },
        {
          term: "Dynamic transform",
          meaning: "A frame relationship that changes over time and therefore needs repeated stamped updates.",
          physicalExample: "forearm_link rotates relative to upper_link as the elbow moves.",
        },
        {
          term: "Source frame",
          meaning: "The frame in which the input data is currently expressed.",
          physicalExample: "A detected point starts in camera_depth_optical_frame.",
        },
        {
          term: "Target frame",
          meaning: "The frame in which the caller wants the result expressed.",
          physicalExample: "A navigation obstacle is requested in map coordinates.",
        },
      ],
      physicalExamples: [
        {
          title: "Roof antenna offset",
          scenario:
            "A GPS antenna is 0.60 m forward of the vehicle reference point and never moves relative to the chassis.",
          lookFor:
            "Publish one static edge and predict the constant position error that appears if software pretends the antenna sits at base_link.",
        },
        {
          title: "Wrist camera above a box",
          scenario:
            "The camera is fixed to a moving wrist, while the wrist pose changes through every arm joint.",
          lookFor:
            "Trace camera → wrist → forearm → upper arm → base and identify which edge is fixed and which edges change.",
        },
      ],
      workedExample: {
        title: "Transform an aligned camera point into the map frame",
        setup:
          "At one instant, base_link is at x = 2.0 m in map. camera_link is fixed 0.4 m ahead of base_link. A point is measured 1.0 m ahead of the camera. All axes are aligned for this simplified check.",
        steps: [
          "Write the frame chain map → base_link → camera_link → measured_point.",
          "Record map-to-base translation as +2.0 m and base-to-camera translation as +0.4 m.",
          "Record the point coordinate in camera_link as +1.0 m; do not label it as a map coordinate yet.",
          "Compose the aligned translations: x_map = 2.0 + 0.4 + 1.0 = 3.4 m.",
          "Check the inverse map-to-camera relationship: camera-to-map translation is −2.4 m, not another +2.4 m.",
          "State the limitation: if any axes rotate, use full rigid transforms rather than this scalar sum.",
        ],
        result:
          "The physical point is at x = 3.4 m in map for the stated instant and aligned-axis assumptions.",
        takeaway:
          "Frames turn bare numbers into traceable physical statements, and the frame path is part of every calculation.",
      },
      handsOn: {
        setup:
          "Use three labelled paper coordinate frames or a ROS 2 tf2 tutorial environment. No powered motion is required.",
        steps: [
          "Define map, base_link, and camera_link origins and axis arrows in writing before publishing anything.",
          "Create map → base_link and base_link → camera_link relationships with small, easy-to-check offsets.",
          "Classify each edge as static or dynamic and name the single component responsible for publishing it.",
          "Request camera_link in map and then map in camera_link at the same instant; verify inverse direction and units.",
          "Use a frame-tree report to check connectivity and a transform echo to inspect the numeric relationship.",
          "Reverse one parent-child declaration, observe which lookup or known-pose check changes, and repair it from the frame definitions rather than by guessing a sign.",
        ],
        observe:
          "A reversed edge can still produce plausible numbers, so a written physical definition and a known point are stronger than a pretty tree alone.",
        doneWhen:
          "Another engineer can state every frame's origin and axes, identify the publisher for each edge, and reproduce both forward and inverse known-pose checks.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Connect a vendor camera, mobile base, and operator map so detections, planned paths, and UI overlays all use declared frames with auditable static mounts and dynamic pose ownership.",
        interviewPrompt:
          "A camera detects a box correctly in its own image, but the box appears behind the robot in the map. Describe the frame definitions, tree edges, lookup direction, and known-pose checks you would inspect.",
      },
      commonMistakes: [
        {
          mistake: "Treating frame names as sufficient documentation.",
          correction:
            "Record each frame's physical origin, axis directions, units, and owning publisher.",
        },
        {
          mistake: "Publishing a rigid sensor mount repeatedly as a dynamic transform.",
          correction:
            "Use a static transform for a relationship that truly does not change during operation.",
        },
        {
          mistake: "Reading lookupTransform arguments as a parent-child declaration.",
          correction:
            "Read them as target, source, and time: the returned transform converts source-frame data into target-frame coordinates.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is the coordinate (1, 0, 0) incomplete on its own?",
          answer:
            "It lacks a named origin, axis convention, and units, so it does not identify one physical point.",
        },
        {
          question: "What makes a transform static rather than dynamic?",
          answer:
            "The physical relationship is treated as constant during operation, such as a rigidly bolted sensor mount.",
        },
        {
          question: "What does lookupTransform(target, source, time) let you do?",
          answer:
            "It gives the relationship needed to express source-frame data in target-frame coordinates at the requested time.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A labelled frame tree and one transformed point make source, target, parent, child, composition, and inversion visible in one exact-topic diagram.",
      },
    },
    {
      dayId: 39,
      mentalModel:
        "tf2 is a stack of frame-tree photographs taken over time; a sensor measurement must use the photograph from when the light, force, or motion was actually observed.",
      explanation: [
        "A moving robot does not have one timeless transform. A camera image stamped 10.15 s describes what the camera observed at 10.15 s, so transforming its detections with a base pose from 10.00 s mixes two physical moments. tf2 keeps a bounded history of dynamic transforms and looks up the requested relationship at a timestamp. Static transforms do not need a changing history, but every dynamic edge along the requested path must cover the needed time.",
        "Transform failures carry useful meaning. A lookup failure may mean the named frame is unknown. A connectivity failure means both frames exist but no tree path joins them. Extrapolation into the past means the requested time is older than available history; extrapolation into the future means the requested time is newer than the newest required transform. A timeout only says the requested data did not become available within the wait. Catch these errors to report and handle them, not to silently substitute an identity transform.",
        "Using “latest” can be correct for a live status display whose contract explicitly asks for the newest pose. It is usually wrong for old sensor data because the body may have moved since measurement. Clock consistency matters too: all cooperating nodes in simulation must use simulation time, and timestamps from devices or computers need a declared synchronization strategy. At startup, a listener may legitimately have no history yet. Design startup, replay, and clock-reset behaviour rather than classifying every early exception as a software defect.",
        "Diagnosis should preserve four facts: sensor stamp, requested target and source frames, newest and oldest available transform times, and the allowed wait or age. Add motion context because 150 ms has different consequences on a parked platform and a fast arm. Logs such as “transform unavailable” are too weak. A useful failure record says which edge lagged, by how much, what data was dropped or deferred, and whether the system entered a bounded degraded state.",
      ],
      keyTerms: [
        {
          term: "Transform buffer",
          meaning: "A time-bounded history of dynamic frame relationships available to a tf2 listener.",
          physicalExample: "Recent base poses are kept so a delayed camera detection can be transformed at capture time.",
        },
        {
          term: "Measurement timestamp",
          meaning: "The time when the underlying physical observation was made or is defined to apply.",
          physicalExample: "The camera exposure time in an image header.",
        },
        {
          term: "Extrapolation",
          meaning: "A request outside the time range tf2 can support for a required edge.",
          physicalExample: "Asking for a base pose at 10.15 s when the newest pose is from 10.00 s.",
        },
        {
          term: "Connectivity failure",
          meaning: "Source and target frames exist but are in disconnected trees.",
          physicalExample: "A camera subtree was launched without its fixed connection to base_link.",
        },
        {
          term: "Transform timeout",
          meaning: "The maximum time a lookup is allowed to wait for the required transform to arrive.",
          physicalExample: "A perception node waits 50 ms, then drops a frame instead of blocking forever.",
        },
      ],
      physicalExamples: [
        {
          title: "Moving conveyor camera",
          scenario:
            "A network-delayed image arrives after the conveyor and robot wrist have both moved.",
          lookFor:
            "Use exposure time, not processing-arrival time, or the grasp point can shift even though every individual value looks reasonable.",
        },
        {
          title: "Phone video with delayed subtitles",
          scenario:
            "The words and picture are both correct but refer to different moments, so the combined experience is wrong.",
          lookFor:
            "Connect this to a correct camera detection combined with a correct—but newer—robot pose.",
        },
      ],
      workedExample: {
        title: "Quantify one future-extrapolation risk",
        setup:
          "A lidar scan is stamped 10.15 s. The newest required base transform is stamped 10.00 s. The integration contract allows at most 0.10 s mismatch, and the base may travel at 0.8 m/s.",
        steps: [
          "Compute the time gap: Δt = 10.15 s − 10.00 s = 0.15 s.",
          "Compare 0.15 s with the 0.10 s contract; the gap exceeds the bound by 0.05 s.",
          "Classify the request as future extrapolation for that transform history, not as an unknown-frame error.",
          "Estimate the possible translation during the full gap: 0.8 m/s × 0.15 s = 0.12 m.",
          "Reject or defer the transform according to the data policy; do not silently combine the scan with the old pose.",
          "Record the delayed edge, both stamps, requested frames, wait duration, and chosen degraded behaviour.",
        ],
        result:
          "A seemingly small 150 ms mismatch can place an obstacle about 12 cm away from its time-correct location at the stated speed.",
        takeaway:
          "Timestamp errors become spatial errors, so time validity is part of geometry rather than an optional logging detail.",
      },
      handsOn: {
        setup:
          "Use two paper timelines or a tf2 tutorial with a controllable broadcaster. Keep the case small enough that every timestamp is visible.",
        steps: [
          "Draw or publish one static sensor mount and one dynamic base transform at a known rate.",
          "Request a transform at a time inside the available history and record the successful source, target, and returned stamp.",
          "Request a time before the oldest data, after the newest data, and across a disconnected tree; classify each failure separately.",
          "Delay the dynamic publisher and compare sensor age, newest transform age, wait timeout, and data-drop behaviour.",
          "Try a latest-time lookup only for a clearly labelled live-display case, then explain why it cannot repair an old measurement.",
          "Create one structured failure report that contains enough timestamps and frame names for another engineer to reproduce the problem.",
        ],
        observe:
          "The same pair of frame names can succeed or fail depending on time; changing to latest may hide the exception while creating a physically false pose.",
        doneWhen:
          "You can produce and correctly name connected, disconnected, past-extrapolation, and future-extrapolation cases and show the exact bounded response for each.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Diagnose a customer-site overlay that drifts only under network load by correlating camera stamps, tf2 buffer coverage, clock source, robot speed, and drop/defer policy.",
        interviewPrompt:
          "Both frames appear in the tree, but lookupTransform throws an extrapolation error. Explain why existence is insufficient, what timestamps you need, and when using latest would be unsafe.",
      },
      commonMistakes: [
        {
          mistake: "Catching every transform exception and returning zero translation and identity rotation.",
          correction:
            "Preserve the failure class and enter an explicit data-drop, wait, or degraded-state policy; invented geometry is unsafe.",
        },
        {
          mistake: "Transforming delayed sensor data with the newest robot pose.",
          correction:
            "Request the transform at the measurement time unless the product contract explicitly asks for latest state.",
        },
        {
          mistake: "Mixing wall time, simulation time, and device time without a clock contract.",
          correction:
            "Declare the time source and synchronization strategy, then test startup, replay, and clock resets.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a lookup fail even when both frame names exist?",
          answer:
            "They may be disconnected, or one required dynamic edge may not have data covering the requested time.",
        },
        {
          question: "What is wrong with using a 10.00 s pose for a 10.15 s image on a moving robot?",
          answer:
            "It combines different physical moments and can convert time lag into a wrong spatial result.",
        },
        {
          question: "What four facts make a transform failure report useful?",
          answer:
            "The source and target frames, measurement/request time, available transform time range, and wait or age policy.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A two-lane sensor-and-transform timeline makes buffer coverage, past/future extrapolation, and the 150 ms to 12 cm conversion immediately inspectable.",
      },
    },
    {
      dayId: 40,
      mentalModel:
        "ros2_control is a guarded adapter loop: hardware reports measured state, a controller computes a new request, and a hardware plugin translates that request for the device.",
      explanation: [
        "A motor driver from one vendor may speak CAN, another may use EtherCAT, and a simulator may have no physical bus at all. Robot applications should not need a vendor-specific rewrite for every device. ros2_control creates a shared boundary. Hardware components expose named state interfaces such as joint position or velocity and named command interfaces such as desired velocity or position. Controllers consume available state and write only the command interfaces they have successfully claimed.",
        "The Controller Manager coordinates controllers and runs the main read–update–write cycle. First, hardware components read fresh device or simulated state into state interfaces. Next, active controllers update their output using that state and their reference. Finally, hardware components write the resulting command values to the device. The Resource Manager loads hardware plugins, tracks their lifecycle and interfaces, and prevents incompatible claims. A `<ros2_control>` section in the robot description declares the hardware component and interfaces; its joint names must match joints in the URDF.",
        "Hardware components and controllers use lifecycle transitions so bring-up is staged. Loading creates the component or plugin. Configuring can open or prepare resources and validate parameters without yet permitting normal commands. Activation makes the component or controller operational and allows required interfaces to be claimed. Deactivation should stop normal command production and release claims according to the component contract. A lifecycle state is software state, not proof that power is isolated or motion has stopped.",
        "The loop rate and failure policy are engineering requirements. At 100 Hz, each read–update–write cycle has a 10 ms period; a blocking device read can consume the entire budget and make commands stale. Measure each stage and missed cycles. Define what happens when read, update, or write returns an error and test any fallback controller in simulation. Command limits and timeouts are useful layers, but they do not replace firmware limits, drive safety functions, guarded first motion, or a hardware emergency stop outside ordinary application software.",
      ],
      keyTerms: [
        {
          term: "State interface",
          meaning: "A named read-only value made available from hardware or simulation to controllers.",
          physicalExample: "An encoder provides left_wheel_joint/velocity.",
        },
        {
          term: "Command interface",
          meaning: "A named value an active controller may claim and write as a device request.",
          physicalExample: "A drive controller writes right_wheel_joint/velocity.",
        },
        {
          term: "Hardware component",
          meaning: "A plugin-backed abstraction for a system, sensor, or actuator and its physical communication.",
          physicalExample: "One system plugin reads both wheel encoders and writes both motor requests over one bus.",
        },
        {
          term: "Controller Manager",
          meaning: "The component that manages controller lifecycle, interface access, and the control update loop.",
          physicalExample: "It activates a drive controller only when the required wheel command interfaces are available.",
        },
        {
          term: "Read–update–write loop",
          meaning: "The repeated sequence that obtains state, computes controller output, and sends commands.",
          physicalExample: "Read encoder velocity, calculate wheel effort, then write a bounded motor request every 10 ms.",
        },
      ],
      physicalExamples: [
        {
          title: "Interpreter at a loading dock",
          scenario:
            "The warehouse instruction stays the same while an interpreter converts it into the language used by each delivery company.",
          lookFor:
            "The controller expresses a robot-level request; the hardware plugin owns vendor-protocol details and reports measured state back.",
        },
        {
          title: "Two hands reaching for one steering wheel",
          scenario:
            "Only one driver should control the steering wheel at a time even though many passengers can read the speedometer.",
          lookFor:
            "Relate exclusive command-interface claims to one motion controller, while state interfaces can support broadcasters and monitoring.",
        },
      ],
      workedExample: {
        title: "Budget one 100 Hz control cycle",
        setup:
          "A controller must run at 100 Hz. Normal read takes 2.0 ms, controller update 3.0 ms, and write 1.5 ms. One fault makes read take 12 ms.",
        steps: [
          "Convert rate to period: T = 1 / 100 Hz = 0.010 s = 10 ms.",
          "Add normal stage times: 2.0 + 3.0 + 1.5 = 6.5 ms.",
          "Compute normal timing margin: 10.0 − 6.5 = 3.5 ms before the next scheduled cycle.",
          "Replace normal read with the fault time: 12 + 3.0 + 1.5 = 16.5 ms.",
          "The faulty cycle exceeds the 10 ms budget by 6.5 ms, so “configured for 100 Hz” is not evidence that 100 Hz was achieved.",
          "Log per-stage duration and missed cycles, trigger the tested fault response, and keep ordinary motion commands bounded or disabled.",
        ],
        result:
          "The normal case fits with 3.5 ms margin; the blocking read creates a measurable overrun that needs an explicit degraded response.",
        takeaway:
          "A control rate is a measured timing contract across read, update, and write—not merely a number in a parameter file.",
      },
      handsOn: {
        setup:
          "Use a ros2_control demo or mock hardware component; do not connect an unreviewed controller to powered actuators.",
        steps: [
          "Draw the path from encoder and motor driver through hardware plugin, state interfaces, controller, command interfaces, and back to hardware.",
          "Declare one system component and its joint state and command interfaces using names that exactly match the URDF.",
          "Start with hardware and controller inactive, then inspect available lifecycle states and interfaces before activation.",
          "Run the mock read–update–write loop with bounded commands and log the duration of all three stages.",
          "Inject a delayed read or returned hardware error and capture controller state, claimed interfaces, diagnostics, and output behaviour.",
          "Write a first-motion checklist that requires interface inspection, zero or safe command, human supervision, clear area, and an independent stop.",
        ],
        observe:
          "A correctly loaded plugin can still expose the wrong interface name, miss its cycle, return stale state, or write unsafe values unless each boundary is inspected.",
        doneWhen:
          "The mock component moves through declared lifecycle states, interfaces match the model, cycle timing is measured, and one hardware fault produces the documented bounded response.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Integrate a new motor bus behind a hardware component, prove interface naming and lifecycle behaviour in mock hardware, then measure update-loop timing and injected communication failures before supervised commissioning.",
        interviewPrompt:
          "Trace a velocity command through ros2_control from application reference to motor driver and back to measured state. Where do lifecycle, interface claiming, timing, and safety boundaries appear?",
      },
      commonMistakes: [
        {
          mistake: "Calling a command interface the measured joint state.",
          correction:
            "Commands are requests; obtain actual position or velocity from hardware state interfaces and compare the two.",
        },
        {
          mistake: "Activating every controller at startup without checking interface ownership.",
          correction:
            "Inspect required and available interfaces, configure deliberately, and activate only compatible controllers under a tested sequence.",
        },
        {
          mistake: "Assuming the ros2_control loop or lifecycle is an emergency stop.",
          correction:
            "Use independent hardware safety functions and prove the software stop path separately under bounded test conditions.",
        },
      ],
      checkQuestions: [
        {
          question: "What happens in the three stages of the main ros2_control loop?",
          answer:
            "Hardware reads measured state, controllers update command values, and hardware writes those command requests to the device.",
        },
        {
          question: "Why must ros2_control joint names match the URDF?",
          answer:
            "The control interfaces must refer to the same physical joints defined in the robot model or the contract cannot be connected correctly.",
        },
        {
          question: "What does an active controller not prove?",
          answer:
            "It does not prove timely hardware communication, actual motion, correct feedback, power isolation, or physical safety.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "The read–update–write path, lifecycle gates, and exclusive command-interface claim are a real architecture that benefits from one purpose-built flow diagram.",
      },
    },
    {
      dayId: 41,
      mentalModel:
        "The controller asks, the hardware reports, and robot_state_publisher draws; commanded position, measured position, JointState messages, and tf transforms are related but never interchangeable.",
      explanation: [
        "A command value describes what a controller wants the hardware to do. A state value describes what the hardware reports, such as measured position, velocity, or effort. The joint_state_broadcaster reads available state interfaces and publishes joint data for the rest of ROS. It does not turn requested commands into truth. If a wheel is blocked, desired velocity can remain nonzero while measured velocity is near zero. Monitoring should show both when the difference matters.",
        "robot_state_publisher receives the robot's URDF tree and JointState updates. Fixed URDF joints produce static transforms, while movable joint values are combined with the model to publish changing link transforms. Names are the join key: a fresh angle labelled with the wrong joint name moves the wrong branch of the model. The resulting tree may still be smooth and current, so a known physical pose and joint-name test are necessary.",
        "Different controllers expose different motion contracts. A joint trajectory controller follows a time-ordered joint-space trajectory using configured interfaces. A differential-drive controller turns a body-motion request into left and right wheel requests and estimates odometry from wheel feedback according to its configuration. Both rely on correctly named joints, available interfaces, limits, timing, and fresh state. Pick a controller from the physical task and hardware capabilities rather than selecting one because it accepts a convenient message.",
        "Controller Manager handles loading, configuring, activating, deactivating, switching, and interface claims. A state broadcaster and a motion controller can coexist because they use interfaces differently, but two motion controllers usually cannot claim the same exclusive command interface at once. Inspect controller states and hardware interfaces before sending any reference. During switching, verify the old controller stops producing commands, the new controller owns exactly the intended resources, and stale application commands cannot leak into the new mode.",
      ],
      keyTerms: [
        {
          term: "Joint state",
          meaning: "A named measured joint position, velocity, or effort with a timestamp.",
          physicalExample: "An encoder reports left_wheel_joint velocity = 3.8 rad/s.",
        },
        {
          term: "Joint command",
          meaning: "A requested joint position, velocity, effort, or other supported command value.",
          physicalExample: "A controller requests left_wheel_joint velocity = 4.0 rad/s.",
        },
        {
          term: "joint_state_broadcaster",
          meaning: "A ros2_control broadcaster that publishes selected hardware state interfaces as joint information.",
          physicalExample: "Measured wheel positions and velocities become visible to monitoring and other nodes.",
        },
        {
          term: "robot_state_publisher",
          meaning: "A node that combines URDF kinematics and joint states to publish fixed and moving link transforms.",
          physicalExample: "An elbow angle moves forearm_link in the tf tree.",
        },
        {
          term: "Interface claim",
          meaning: "Controller ownership of the command interfaces it needs while active.",
          physicalExample: "The drive controller claims both wheel velocity commands so another controller cannot write them simultaneously.",
        },
      ],
      physicalExamples: [
        {
          title: "Car speedometer and accelerator",
          scenario:
            "The accelerator request and measured vehicle speed are related but differ on a hill, on ice, or when blocked.",
          lookFor:
            "Map the accelerator request to command interfaces and the speedometer to state interfaces; never copy the request into the measurement display.",
        },
        {
          title: "Stage manager and puppeteer",
          scenario:
            "A stage manager assigns one puppeteer to each control string, while an observer records where the puppet actually moved.",
          lookFor:
            "Relate resource claims to control ownership and joint-state publication to independent observation.",
        },
      ],
      workedExample: {
        title: "Separate desired joint position from measured position",
        setup:
          "A controller requests elbow_joint = 0.50 rad. The next measured state is 0.46 rad, stamped 30 ms before now. The control loop runs at 100 Hz.",
        steps: [
          "Write desired = 0.50 rad and measured = 0.46 rad as two different signals.",
          "Compute position difference: e = 0.50 − 0.46 = 0.04 rad.",
          "Convert the 100 Hz loop rate to a 10 ms period.",
          "Express measurement age in loop periods: 30 ms / 10 ms = 3 cycles old.",
          "Check the JointState name is exactly elbow_joint before robot_state_publisher applies 0.46 rad to the model.",
          "Report the 0.04 rad difference and three-cycle age without declaring a controller fault until tolerances, motion phase, and communication evidence are known.",
        ],
        result:
          "The display should show a 0.50 rad request, 0.46 rad measured state, and 30 ms age; tf should be calculated from the measured named state.",
        takeaway:
          "Freshness and signal identity matter as much as the number—otherwise an HMI can confidently display a request as reality.",
      },
      handsOn: {
        setup:
          "Use ros2_control mock hardware, joint_state_broadcaster, robot_state_publisher, and either a simple trajectory or differential-drive controller.",
        steps: [
          "List hardware interfaces and controller states before activation; save the expected names beside the URDF joint list.",
          "Activate only the state broadcaster and verify measured names, values, units, and timestamps before any motion controller.",
          "Confirm robot_state_publisher moves the correct child frames when each joint state changes independently.",
          "Configure and activate one motion controller, then verify which command interfaces it claims.",
          "Send a small bounded reference in simulation or mock hardware and log desired, measured, error, age, controller state, and tf result.",
          "Plant a wrong joint name or competing claim, capture the exact failure, and repair the configuration instead of renaming data in an HMI.",
        ],
        observe:
          "State publication can look healthy while a motion controller is inactive, and a controller can be active while measured motion disagrees with the command.",
        doneWhen:
          "A reviewer can trace one bounded reference through claimed command interfaces to measured state, JointState publication, and the correct moving tf frames.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Build a commissioning view that separates desired and measured joint values, freshness, controller lifecycle, interface ownership, and resulting link pose during a supervised controller switch.",
        interviewPrompt:
          "The UI shows a 0.5 rad elbow target, but RViz shows 0.46 rad and the controller is active. Explain what each value represents and the evidence needed before calling it a control defect.",
      },
      commonMistakes: [
        {
          mistake: "Publishing desired commands as JointState because the animation then looks responsive.",
          correction:
            "Publish measured hardware state as measurement; show desired values separately and label simulation assumptions.",
        },
        {
          mistake: "Assuming a correctly stamped JointState moves the correct link.",
          correction:
            "Verify each joint name against URDF and run one-joint-at-a-time known-pose checks.",
        },
        {
          mistake: "Switching controllers without checking released and claimed command interfaces.",
          correction:
            "Inspect controller states and resource ownership before and after the switch, and test stale-command behaviour.",
        },
      ],
      checkQuestions: [
        {
          question: "Which value should normally drive robot_state_publisher: desired or measured joint position?",
          answer:
            "The measured named joint state, because tf should represent the robot state reported by the system rather than an unverified request.",
        },
        {
          question: "Why can joint_state_broadcaster run beside a motion controller?",
          answer:
            "It reads and publishes state interfaces, while the motion controller claims and writes command interfaces.",
        },
        {
          question: "What should be inspected before activating a different motion controller?",
          answer:
            "Lifecycle states, required and available interfaces, existing claims, command limits, and the old/new controller's stale-command behaviour.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The Day 40 architecture visual already establishes the control flow; today's desired-versus-measured log and one-joint checks add evidence without repeating it.",
      },
    },
    {
      dayId: 42,
      mentalModel:
        "A robot-model audit is like checking a bridge with known loads: test the tree, numbers, time, and command path with planted faults before trusting a live mission.",
      explanation: [
        "A model can pass an XML check and still describe the wrong robot. A complete audit therefore has layers. Structure checks ask whether names are unique, every child has one parent, referenced joints exist, and the expanded URDF is deterministic. Geometry checks compare known lengths, axes, limits, visual extents, collision extents, and inertial ranges with the physical record. Transform checks examine connectivity, direction, publisher ownership, and known poses. Time checks compare sensor stamps with buffer coverage and clock policy.",
        "The control layer adds another chain: URDF joint name, ros2_control interface name, hardware lifecycle, controller state, command-interface claim, measured state, JointState publication, and resulting tf. Test these in order. If the final tool pose is wrong, changing a controller gain before checking a 100× unit error or wrong joint name wastes time and may create danger. A fault tree should start with evidence closest to the physical boundary and move outward without assuming one successful layer proves the next.",
        "Plant one fault at a time so cause and symptom remain learnable. A camera translation of 25 m instead of 0.25 m should fail a physical-range or known-pose assertion even though the tree is connected. A reversed parent-child definition should fail the documented frame direction or known-point result. A measurement stamped 180 ms later than the newest required transform should fail the time-validity contract even if a latest lookup draws a plausible marker. Repair one, rerun the same checks, and keep the before/after artifact.",
        "A portfolio-quality result is more than an RViz screenshot. Include the measured model inputs, expanded URDF, frame-tree report, automated assertions, controller/interface inventory, fault-injection procedure, structured logs, and a concise explanation of residual limitations. Record that simulation or mock hardware does not prove real mass, backlash, wiring, bus timing, safety functions, or loaded motion. This evidence maps directly to integration and validation work because another engineer can reproduce both the defect and the repair.",
      ],
      keyTerms: [
        {
          term: "Known-pose test",
          meaning: "A check that compares model output with a simple pose whose physical result is already known.",
          physicalExample: "At zero angles, the tool marker should be 0.55 m along the aligned arm axis.",
        },
        {
          term: "Physical-range assertion",
          meaning: "A test that rejects a value outside the possible size, angle, mass, rate, or age for the system.",
          physicalExample: "A desk robot camera mount cannot plausibly be 25 m from its base.",
        },
        {
          term: "Fault injection",
          meaning: "A deliberate, controlled defect introduced to prove that detection and recovery work.",
          physicalExample: "Change one frame offset from 0.25 to 25 and confirm the audit identifies the unit-scale symptom.",
        },
        {
          term: "Closure residual",
          meaning: "The leftover error when relationships expected to cancel or return to a known result are composed.",
          physicalExample: "An aligned translation plus its inverse should sum to 0 m.",
        },
        {
          term: "Evidence pack",
          meaning: "Reproducible inputs, checks, logs, results, faults, repairs, and limitations for review.",
          physicalExample: "A repository and report that let an interviewer repeat all three planted failures.",
        },
      ],
      physicalExamples: [
        {
          title: "Flat-pack furniture inspection",
          scenario:
            "The parts list can be complete while one rail is reversed, one dimension uses the wrong unit, or one hinge is attached to the wrong panel.",
          lookFor:
            "Compare this with valid URDF syntax that still produces a physically wrong frame direction, scale, or child relationship.",
        },
        {
          title: "Pre-flight control check",
          scenario:
            "A pilot checks control direction, instrument agreement, and response rather than trusting that the dashboard simply powered on.",
          lookFor:
            "Relate it to one-joint motion, desired-versus-measured state, correct tf response, and independent stop readiness.",
        },
      ],
      workedExample: {
        title: "Find three planted faults with three different checks",
        setup:
          "The audit robot contains: camera offset 25 m instead of 0.25 m, a reversed base-to-camera edge, and a lidar stamp 0.18 s newer than the newest required dynamic transform. The time contract is 0.10 s.",
        steps: [
          "Run the structural check: the XML and tree may still parse, proving syntax alone cannot find all three faults.",
          "Apply a 0–1 m mount-range assertion; 25 m fails immediately, so restore the recorded 0.25 m measurement.",
          "Transform one known camera-axis point into base_link; the reversed relationship gives the opposite physical interpretation, so repair parent, child, and ownership from the written frame definition.",
          "Compute time gap 0.18 s and compare it with the 0.10 s contract; reject or defer the lidar datum rather than using latest.",
          "Rerun structure, known-pose, time, interface-name, lifecycle, and desired-versus-measured checks after each repair.",
          "Save each failing assertion, the single repair, the passing rerun, and what real-hardware behaviour remains unverified.",
        ],
        result:
          "Three distinct checks find three distinct fault classes: physical range finds scale, known pose finds direction, and timestamp coverage finds temporal invalidity.",
        takeaway:
          "The best audit is layered; no one picture, parser, or happy-path launch can validate an entire robot model and control chain.",
      },
      handsOn: {
        setup:
          "Use the week's robot_description and ros2_control mock setup. Create a clean baseline before changing one fault at a time.",
        steps: [
          "Write an audit matrix with rows for structure, physical dimensions, frame topology, known poses, transform time, interface names, lifecycle, claims, and measured state.",
          "Capture the baseline expanded URDF, tree report, selected transform echoes, controller list, hardware interface list, and one bounded known-pose result.",
          "Inject exactly one unit-scale fault, one parent-child direction fault, and one timestamp-coverage fault in separate runs.",
          "For each run, predict the expected observable failure before executing the checks, then record the actual decisive evidence.",
          "Repair only the planted fault, rerun the full matrix, and verify neighbouring checks did not regress.",
          "Package the scripts, commands, logs, annotated screenshots, model measurements, and residual hardware/safety limitations into a short reproducible report.",
        ],
        observe:
          "Different fault classes require different evidence; a connected tree does not validate scale, and fresh state does not validate name mapping or physical motion.",
        doneWhen:
          "A second engineer can clone the artifact, reproduce all three failures, identify each with the intended check, apply the documented repair, and obtain the same passing matrix.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Deliver a commissioning-grade model audit that catches a CAD-to-URDF scale defect, a vendor frame-convention mismatch, and a sensor timing fault before supervised site motion.",
        interviewPrompt:
          "Your URDF parses, tf2 shows a connected tree, and the controller is active, yet a camera overlay is wrong. Give a layered audit order and explain what evidence would confirm each boundary.",
      },
      commonMistakes: [
        {
          mistake: "Calling the model validated after check_urdf and one RViz screenshot.",
          correction:
            "Add physical-range, known-pose, time, interface, lifecycle, and desired-versus-measured checks with reproducible evidence.",
        },
        {
          mistake: "Planting several faults at once and fixing whichever value looks suspicious.",
          correction:
            "Inject one controlled fault, predict its symptom, use a decisive check, repair only that cause, and rerun the complete matrix.",
        },
        {
          mistake: "Presenting mock-hardware success as real-robot acceptance.",
          correction:
            "State exactly what the mock proves and retain real mass, backlash, wiring, timing, loaded motion, and safety checks as unverified boundaries.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does a connected tf tree not prove the model is correct?",
          answer:
            "Connectivity cannot detect wrong scale, axis direction, physical origin, publisher truth, or timestamp validity.",
        },
        {
          question: "Which check best detects 25 m entered instead of 0.25 m for a camera mount?",
          answer:
            "A physical-range or known-pose assertion tied to the measured hardware dimensions.",
        },
        {
          question: "What makes this week's audit useful as job evidence?",
          answer:
            "Another engineer can reproduce the clean baseline, each controlled failure, the decisive detection, the repair, the passing rerun, and the stated limitations.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The audit matrix, three real fault artifacts, and before/after evidence are more informative than a fourth chapter illustration.",
      },
    },
  ],
} as const satisfies ChapterContent;
