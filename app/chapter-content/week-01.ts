import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION = "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION = "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI = "Robot Learning Deployment / Physical AI Integration Engineer";

export const week01Content = {
  week: 1,
  title: "Meet the robot, then build its mathematical language",
  purpose:
    "Begin with real mechanisms and measurements, then introduce only the mathematical ideas needed to describe a robot's body, possible shapes, locations, directions, and simple coordinate operations.",
  prerequisites: [
    "Count whole numbers and use the four basic arithmetic operations.",
    "Measure a short distance with a ruler.",
    "Draw on squared paper; no algebra, linear algebra, or robotics experience is assumed.",
  ],
  outcomes: [
    "Trace a complete sense–decide–act–observe loop and name the physical responsibility of each part.",
    "Identify links and common joints, then count independent degrees of freedom without confusing them with motors.",
    "Keep configuration space, workspace, joint limits, and topology separate.",
    "Use signed coordinates and SI units to record physical measurements without ambiguity.",
    "Draw and calculate 2D vectors, including addition, subtraction, norm, and dot product.",
    "Describe one physical point in named coordinate frames and detect a handedness or frame mismatch.",
    "Apply small 2×2 matrices one row at a time and explain the physical action represented by each matrix.",
  ],
  jobTargets: [
    ROLE_HMI,
    ROLE_FLEET,
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "Modern Robotics — degrees of freedom of a rigid body",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-1-degrees-of-freedom-of-a-rigid-body/",
      useFor:
        "Definitions of links, configurations, configuration space, and degrees of freedom.",
    },
    {
      label: "Modern Robotics — degrees of freedom of a robot",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-2-degrees-of-freedom-of-a-robot/",
      useFor:
        "Common joint freedoms, motion constraints, and the warning that simple DOF counts need independent constraints.",
    },
    {
      label: "Modern Robotics — configuration-space topology",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-3-1-configuration-space-topology/",
      useFor:
        "Why rotational coordinates wrap around and why an unrestricted planar two-revolute-joint arm has torus topology.",
    },
    {
      label: "NIST — SI units",
      url: "https://www.nist.gov/pml/owm/metric-si/si-units",
      useFor:
        "Authoritative SI unit names, symbols, and the distinction between base and derived units.",
    },
    {
      label: "OpenStax Precalculus — vectors",
      url: "https://openstax.org/books/precalculus-2e/pages/8-8-vectors",
      useFor:
        "Geometric vectors, components, magnitude, addition, subtraction, and dot product.",
    },
  ],
  days: [
    {
      dayId: 1,
      mentalModel:
        "A robot is a physical loop, not a magic box: information travels inward from sensors, a decision becomes a command, and an actuator pushes the real world.",
      explanation: [
        "Start with the body. A small rover may have a chassis, wheels, motors, a battery, a distance sensor, and a computer board. The sensor converts a physical condition—such as reflected light or wheel rotation—into data. Software on the controller reads that data and chooses a command. An actuator converts electrical energy into force or torque. The links and wheels carry that effort into visible motion. This sense–decide–act picture is a useful engineering model, although not every machine is autonomous and not every robot has every part arranged in one box.",
        "Information and energy are different flows. A sensor signal can tell the controller that a wall is 18 cm away, but that signal cannot turn a wheel. The battery and motor driver supply energy to the motor; the controller supplies only the command describing what should happen. Keeping those flows separate makes wiring diagrams, software interfaces, and fault diagnosis clearer. If the controller sends a valid command but the battery is disconnected, the information path worked while the energy path failed.",
        "Acting once does not automatically create feedback. A timer can run a motor for one second without checking where the rover ended; that is open-loop action. A feedback loop measures the result, compares it with the desired result, and chooses the next command. The return measurement might come from a wheel encoder, camera, or limit switch. For now, learn to ask four questions: what was sensed, what decision was made, what physically acted, and what measurement confirmed the result?",
        "Robotics software crosses a boundary that ordinary screen software often does not: a bad output can move mass. A safe diagram therefore includes command limits, a way to stop, and an observed result. Your first notebook entry should show both the normal loop and one missing-part failure. That habit—drawing the whole causal path before coding—is the beginning of production robotics engineering.",
      ],
      keyTerms: [
        {
          term: "Sensor",
          meaning: "A device that turns a physical condition into data the controller can read.",
          physicalExample: "A distance sensor reports an estimate of how far a box is from the rover.",
        },
        {
          term: "Controller",
          meaning: "The computing part that reads inputs and selects commands according to software.",
          physicalExample: "A microcontroller compares measured distance with a 20 cm stop threshold.",
        },
        {
          term: "Actuator",
          meaning: "A device that converts supplied energy into physical effort or motion.",
          physicalExample: "A DC motor produces wheel torque when its driver supplies current.",
        },
        {
          term: "Link",
          meaning: "A body part treated as rigid so its shape does not change during the motion being studied.",
          physicalExample: "The solid strip between two hinges in a cardboard arm is one link.",
        },
        {
          term: "Feedback",
          meaning: "A new measurement of the result that is used to decide the next command.",
          physicalExample: "An encoder reports that the wheel turned less than requested, so the controller adjusts.",
        },
      ],
      physicalExamples: [
        {
          title: "Automatic sliding door",
          scenario:
            "A presence sensor detects a person, a controller checks the door state, and a motor opens the panels.",
          lookFor:
            "Identify the closing safety sensor and explain why the motor command alone is not proof that the doorway is clear.",
        },
        {
          title: "Two-wheel desk rover",
          scenario:
            "A front distance sensor reports a nearby book; the controller stops one wheel and runs the other to turn away.",
          lookFor:
            "Separate the distance reading, software decision, motor-driver command, battery power, wheel motion, and follow-up reading.",
        },
      ],
      workedExample: {
        title: "Trace a rover stopping before a wall",
        setup:
          "A rover should stop at 20 cm. Its sensor reports 18 cm while both wheels are moving forward.",
        steps: [
          "Name the sensed quantity: distance to wall = 18 cm.",
          "Name the rule: if distance is less than or equal to 20 cm, request zero wheel speed.",
          "Write the controller output: left command = 0 and right command = 0.",
          "Follow the energy path: the motor drivers remove drive effort and the wheels slow.",
          "Measure again with the sensor or wheel encoders to confirm that motion actually stopped.",
        ],
        result:
          "The loop is complete only after the stopped state is observed; sending two zero commands is not physical proof.",
        takeaway:
          "A command is an intention. Feedback provides evidence about what the body really did.",
      },
      handsOn: {
        setup:
          "Use paper, a toy vehicle or drawn rover, and a pen. Do not power a motor for this exercise.",
        steps: [
          "Draw the environment, sensor, controller, motor driver, motor, wheel, and power source as separate labelled blocks.",
          "Use one arrow style for information and a different style for electrical or mechanical energy.",
          "Add the rule “stop at 20 cm” inside the controller block.",
          "Add a return arrow that measures the changed world after the wheel command.",
          "Cross out one block at a time and write the visible symptom caused by its absence.",
        ],
        observe:
          "Different missing parts produce different evidence: no data, no decision, no effort, no power, or unverified motion.",
        doneWhen:
          "Another person can follow the two flows and correctly diagnose at least three removed-part failures from your drawing.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_VALIDATION, ROLE_INTEGRATION],
        workExample:
          "Build an operator screen and validation trace that distinguish requested velocity, driver acknowledgment, measured wheel velocity, stale sensor data, and stopped state.",
        interviewPrompt:
          "A UI says “stop sent,” but the robot keeps rolling. Walk through the information path, energy path, and measurements you would inspect before naming a cause.",
      },
      commonMistakes: [
        {
          mistake: "Calling every electronic board a sensor.",
          correction:
            "Name what physical quantity the device measures; a controller board that only computes is not itself that measurement.",
        },
        {
          mistake: "Treating “command sent” as “motion happened.”",
          correction:
            "Measure the physical result with an independent sensor or state signal.",
        },
        {
          mistake: "Drawing signal arrows but omitting power and mechanical motion.",
          correction:
            "Show information, electrical energy, and physical action as distinct paths.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is a motor an actuator rather than a controller?",
          answer:
            "It converts electrical energy into physical torque; the controller chooses the command sent to it.",
        },
        {
          question: "What is missing if a timed motor command never measures its result?",
          answer:
            "Feedback is missing, so it is open-loop action even if the command is generated by software.",
        },
        {
          question: "What evidence is stronger than a log line saying “stop sent”?",
          answer:
            "A fresh measured wheel speed or other independent physical-state signal showing that motion reached the stopped condition.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "The existing Day 1 vector diagram uniquely clarifies the sense–decide–act return loop and separates the missing-role failure.",
      },
    },
    {
      dayId: 2,
      mentalModel:
        "Links are the bones of a mechanism; joints are the rules that say how neighboring bones may move.",
      explanation: [
        "A link is a body we choose to treat as rigid. A joint connects links and removes some possible relative motions while permitting others. A door hinge permits rotation around one axis but blocks sliding and the other rotations. A drawer runner permits movement along one line but blocks the rest. Robotics calls these common joint types revolute and prismatic. A bolted or glued connection is fixed and permits no relative motion.",
        "One degree of freedom, or DOF, is one independent number needed to describe a mechanism's configuration near an ordinary pose. A single hinge angle is one DOF. A single drawer extension is also one DOF. A free rigid body in ordinary 3D space needs six numbers locally: three for position and three for orientation. DOF counts independent motion, not objects, motors, wires, or the number of directions you can casually name.",
        "Actuation and freedom are separate ideas. A passive elbow hinge still contributes a DOF even if no motor drives it. Two motors can be mechanically coupled so that they control only one independent motion. A joint sitting at its travel stop still belongs to a one-DOF mechanism; the limit removes motion farther in one direction at that instant, but it does not turn the hinge into a fixed connection. If a brake permanently locks it for the model being studied, then the model changes.",
        "Adding joint DOF works directly for a simple open serial chain with independent one-axis joints. Closed loops and coupled mechanisms need more care because constraints can depend on one another. This week uses a two-hinge open cardboard arm, so shoulder angle plus elbow angle gives two DOF. Learn the physical test first: hold all other joints still and ask whether this coordinate can change by itself.",
      ],
      keyTerms: [
        {
          term: "Revolute joint",
          meaning: "A joint that permits rotation about an axis.",
          physicalExample: "A door hinge or paper-fastener elbow.",
        },
        {
          term: "Prismatic joint",
          meaning: "A joint that permits sliding along an axis.",
          physicalExample: "A drawer runner or telescoping rail.",
        },
        {
          term: "Fixed joint",
          meaning: "A connection modeled as allowing no relative motion.",
          physicalExample: "Two plates bolted tightly together.",
        },
        {
          term: "Degree of freedom",
          meaning: "One independent coordinate required to describe configuration.",
          physicalExample: "The opening angle of one ordinary door hinge.",
        },
        {
          term: "Joint limit",
          meaning: "The smallest and largest allowed value of a joint coordinate.",
          physicalExample: "A servo arm permitted to turn only from 0° to 180°.",
        },
      ],
      physicalExamples: [
        {
          title: "Desk lamp",
          scenario:
            "A simple lamp has a base swivel, shoulder hinge, and elbow hinge connected by rigid bars.",
          lookFor:
            "Move one joint while holding the others. Each independently changeable angle contributes one DOF.",
        },
        {
          title: "Drawer and cabinet",
          scenario:
            "The drawer translates along its runners while the cabinet door rotates on hinges.",
          lookFor:
            "Both are one-DOF mechanisms even though one coordinate is a distance and the other is an angle.",
        },
      ],
      workedExample: {
        title: "Count the DOF of a simple inspection arm",
        setup:
          "An open-chain arm has a rotating base, one shoulder hinge, one sliding wrist, and a camera bolted to the wrist.",
        steps: [
          "List each relative connection from ground to camera.",
          "The base revolute joint contributes one independent angle.",
          "The shoulder revolute joint contributes a second independent angle.",
          "The wrist prismatic joint contributes one independent distance.",
          "The bolted camera mount contributes zero relative motion.",
          "Add the independent coordinates: 1 + 1 + 1 + 0 = 3 DOF.",
        ],
        result:
          "A configuration can be recorded with three ordered values, such as [base angle, shoulder angle, wrist extension].",
        takeaway:
          "Count independent coordinates and their constraints, not the visible number of parts or actuators.",
      },
      handsOn: {
        setup:
          "Use two cardboard strips, two paper fasteners, tape, and a ruler.",
        steps: [
          "Join the two strips with one paper fastener and attach the first strip to a cardboard base with the other.",
          "Mark each rigid strip as a link and each fastener as a revolute joint.",
          "Hold the elbow still and move only the shoulder; then reverse the test.",
          "Mark safe angle limits where the cardboard would collide or tear.",
          "Tape the elbow fixed temporarily and recount the independent motions for that altered model.",
        ],
        observe:
          "The untaped arm needs two angles; the temporarily fixed version needs only the remaining shoulder angle.",
        doneWhen:
          "Your diagram names links, joint axes, coordinates, units, limits, and explains why motor count was never used.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Check whether a URDF or commissioning sheet models each physical joint with the correct type, axis, limits, and independent command interface.",
        interviewPrompt:
          "A robot has four motors but only three independent motions. Give two physically plausible reasons and describe how you would verify the actual DOF.",
      },
      commonMistakes: [
        {
          mistake: "Counting motors as degrees of freedom.",
          correction:
            "Count independently changeable configuration coordinates; actuation may be absent, redundant, or mechanically coupled.",
        },
        {
          mistake: "Calling every connection a joint with one DOF.",
          correction:
            "Inspect the allowed relative motion; a fixed connection contributes zero, while some joints can contribute more than one.",
        },
        {
          mistake: "Saying a hinge loses its DOF at a travel limit.",
          correction:
            "The configuration lies on a boundary, but the joint type and the mechanism's usual dimensionality remain one DOF.",
        },
      ],
      checkQuestions: [
        {
          question: "Does an unpowered revolute joint count as a DOF?",
          answer:
            "Yes, if its angle can change independently; DOF is about possible configuration, not actuation.",
        },
        {
          question: "Why does a bolted camera mount contribute zero DOF?",
          answer:
            "The camera and wrist are modeled with no relative motion, so no independent coordinate is needed between them.",
        },
        {
          question: "When can simply adding joint freedoms give a wrong result?",
          answer:
            "In mechanisms with closed loops, coupled motion, or dependent constraints; the assumed independent coordinates must be checked.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The cardboard mechanism and household joint comparisons communicate this concrete topic more directly than another diagram.",
      },
    },
    {
      dayId: 3,
      mentalModel:
        "Configuration space is a catalogue of every complete robot shape; workspace is the shadow those shapes cast through the tool's reachable positions.",
      explanation: [
        "A configuration is one complete snapshot of the robot. Before doing any algebra, give each cardboard shape an ordered two-slot record: shoulder reading first, elbow reading second. Roboticists often name the whole record q and an angle θ, pronounced “theta,” so q = (θ₁, θ₂) is only a compact label for those two slots today. Day 4 will teach signed coordinates and units; Day 8 will teach degrees and radians. One hand position is still incomplete because elbow-up and elbow-down shapes can place the hand at the same point.",
        "Configuration space, shortened to C-space, is the catalogue of all allowed complete records. Imagine one paper slider for every independent joint: choosing one mark on each slider identifies one robot shape. Joint stops, self-collision, cable limits, and declared safety rules remove some combinations. Planning a motion means moving through a connected sequence of allowed complete shapes, not merely drawing a line for the tool. The formal coordinate and geometry language comes later; today you only need to distinguish the catalogue from the physical arm.",
        "Workspace describes what configurations or positions the end-effector can reach. For this beginner exercise, use the simpler position workspace traced by the cardboard hand. C-space and workspace answer different questions: “What is the whole robot shape?” versus “Where can the hand go?” Several C-space points can map to one workspace point, and a straight tool path can require a curved joint-space path.",
        "Topology is used here in one beginner sense: which shapes are neighbours, where motion is blocked, and whether an apparent paper edge joins back to another edge. A freely turning joint returns to the same physical orientation after one full turn, like a clock hand returning to twelve. You do not need torus equations or formal topology today. Mark only the wrap-around and the real joint-stop boundaries you can demonstrate on the cardboard arm.",
      ],
      keyTerms: [
        {
          term: "Configuration",
          meaning: "A complete set of coordinate values describing the robot's shape or pose.",
          physicalExample: "Shoulder = 30° and elbow = −20° for a two-hinge arm.",
        },
        {
          term: "Configuration space",
          meaning: "The set of every allowed robot configuration.",
          physicalExample: "Every permitted shoulder–elbow angle pair plotted on a sheet.",
        },
        {
          term: "Workspace",
          meaning: "The set of end-effector configurations or positions the robot can reach.",
          physicalExample: "The region traced by the cardboard arm's pen tip.",
        },
        {
          term: "Topology",
          meaning: "Which configurations connect continuously, which boundaries block motion, and which drawn edges wrap back together.",
          physicalExample: "A full-turn angle behaves like a circle whose 0° and 360° locations meet.",
        },
        {
          term: "End effector",
          meaning: "The robot part intended to interact with the task or environment.",
          physicalExample: "A gripper, welding torch, pen tip, or camera at the end of an arm.",
        },
      ],
      physicalExamples: [
        {
          title: "Elbow-up and elbow-down reach",
          scenario:
            "Bend a two-link arm above and below the line to a target while keeping its tip near the same dot.",
          lookFor:
            "The workspace point is nearly unchanged, but the two ordered joint-angle pairs are different.",
        },
        {
          title: "Clock hand wrap-around",
          scenario:
            "Move a hand from 359° to 0° through a tiny physical rotation.",
          lookFor:
            "The coordinate number jumps across a paper boundary even though the physical orientation changes continuously.",
        },
      ],
      workedExample: {
        title: "Separate C-space evidence from workspace evidence",
        setup:
          "A two-link arm reaches a dot using qA = (35°, 70°) and another measured shape qB = (105°, −70°).",
        steps: [
          "Record each configuration as an ordered shoulder–elbow pair.",
          "Notice that qA and qB are different points in the two-dimensional C-space.",
          "Mark the hand position produced by each pair on the table grid.",
          "Observe that the two hand positions can be the same or close even though the arm shapes differ.",
          "Check joint limits and collision clearance for both configurations.",
          "Keep both valid candidates until the task supplies another requirement such as elbow clearance.",
        ],
        result:
          "One workspace target can correspond to multiple C-space solutions, with different safety and collision consequences.",
        takeaway:
          "A tool target does not uniquely describe the robot; planners and validators must reason about the complete configuration.",
      },
      handsOn: {
        setup:
          "Use the Day 2 cardboard arm, a protractor or printed angle guide, squared paper, and a pen at the tip.",
        steps: [
          "Choose one fixed zero direction and use a printed angle guide or evenly spaced paper marks; treat the readings as labels rather than an algebra exercise.",
          "Place the arm in six different shapes and write each ordered angle pair.",
          "Mark the pen-tip position for every pair on the same sheet.",
          "Search for two visibly different arm shapes whose tip marks are nearly equal.",
          "Draw the angle limits as boundaries on a shoulder-versus-elbow coordinate plot.",
          "Explain whether each angle wraps fully or stops at a physical limit.",
        ],
        observe:
          "The list of angle pairs records full shapes; the traced tip region records only a workspace projection.",
        doneWhen:
          "Your sheet contains six configurations, their tip positions, one many-to-one example, joint-limit boundaries, and a correct wrap-around statement.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_PHYSICAL_AI],
        workExample:
          "Reject a language-selected grasp that looks reachable in camera space but requires a colliding or joint-limit configuration; return a bounded failure instead of a command.",
        interviewPrompt:
          "Why is checking only an end-effector target insufficient before executing an arm motion, and what additional C-space checks belong in the pipeline?",
      },
      commonMistakes: [
        {
          mistake: "Calling the hand's x-y point the robot configuration.",
          correction:
            "Record every independent joint coordinate; the hand point is a workspace result.",
        },
        {
          mistake: "Assuming one workspace point has one joint solution.",
          correction:
            "Test for multiple configurations such as elbow-up and elbow-down and compare their constraints.",
        },
        {
          mistake: "Calling every two-revolute-joint C-space a full torus.",
          correction:
            "State that both joints rotate without limits; joint limits cut the allowed set and change its boundary structure.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the dimension of the C-space for two independent hinge angles?",
          answer: "Two, because two independent numbers are needed for each configuration.",
        },
        {
          question: "How can two configurations share one workspace point?",
          answer:
            "Different full arm shapes can place the end effector at the same location, such as elbow-up and elbow-down solutions.",
        },
        {
          question: "Why are 0° and 360° not two distant physical orientations?",
          answer:
            "They represent the same orientation; the coordinate representation is cut at a wrap-around point.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "The existing Day 3 visual makes the otherwise abstract one-point-per-complete-snapshot idea and boundary failure visible.",
      },
    },
    {
      dayId: 4,
      mentalModel:
        "A bare number is an unfinished measurement; it becomes useful only after you say what it describes, its unit, and where zero and positive direction are.",
      explanation: [
        "A scalar is one number used to describe a quantity such as temperature, battery voltage, or link length. A variable is a name that can hold a value; it is not a mystery symbol. If x means rover position along a taped line, writing x = 30 cm says much more than writing 30. The equals sign says both sides describe the same quantity, not “now calculate an answer.”",
        "A number line needs an origin, a positive direction, and a scale. Negative does not mean bad or physically impossible; it means the point lies opposite the chosen positive direction. On an x-y grid, an ordered pair (x, y) gives two signed coordinates relative to one origin and axis convention. The order matters: (−2, 3) and (3, −2) are different points.",
        "Units are part of engineering meaning. The metre (m) is the SI base unit of length. A centimetre is one hundredth of a metre, so 30 cm = 0.30 m. Conversion must preserve the physical length even though the number changes. Add or compare quantities only after their units are compatible. Five centimetres plus two seconds is not a length because the quantities are different.",
        "Measurements also have resolution and uncertainty, even if today you record only a simple estimate. A ruler marked every millimetre cannot honestly prove micrometre accuracy. A robot log should retain the original unit or convert at a clear boundary, name the frame, and avoid silent assumptions. These habits prevent errors that can look numerically reasonable while being physically wrong by a factor of 100 or 1,000.",
      ],
      keyTerms: [
        {
          term: "Scalar",
          meaning: "A quantity represented by one number.",
          physicalExample: "Battery voltage = 12 V.",
        },
        {
          term: "Variable",
          meaning: "A name assigned to a value or quantity that may change.",
          physicalExample: "x holds the rover's signed position on a line.",
        },
        {
          term: "Coordinate",
          meaning: "A signed number locating a point along a named axis from a chosen origin.",
          physicalExample: "x = −20 cm means 20 cm opposite the declared +x direction.",
        },
        {
          term: "Origin",
          meaning: "The location chosen as zero for a coordinate system.",
          physicalExample: "The lower-left tape mark on a work surface is defined as (0, 0).",
        },
        {
          term: "Physical unit",
          meaning: "A standard that says what scale and kind of quantity a number uses.",
          physicalExample: "m for length, s for time, and V for electric potential difference.",
        },
      ],
      physicalExamples: [
        {
          title: "Shelf coordinate",
          scenario:
            "A rail's centre is x = 0; a sensor sits at −25 cm and a stop block at +40 cm.",
          lookFor:
            "The signs describe opposite sides of the same origin while all three values remain lengths.",
        },
        {
          title: "Motor-shaft drawing",
          scenario:
            "A technician receives a 5 mm shaft dimension while software interprets the bare value 5 as centimetres.",
          lookFor:
            "The number matches but the physical size differs by a factor of ten, demonstrating why API fields need units.",
        },
      ],
      workedExample: {
        title: "Predict and convert a rover position",
        setup:
          "A rover starts at x_start = −20 cm and moves Δx = +35 cm along the same axis.",
        steps: [
          "Check that both values use the same origin, axis, and centimetre unit.",
          "Write the relationship x_new = x_start + Δx.",
          "Substitute the signed values: x_new = −20 cm + 35 cm.",
          "Calculate x_new = +15 cm.",
          "Convert by dividing centimetres by 100: 15 cm = 0.15 m.",
          "Verify on a ruler that the point is 15 cm on the positive side of zero.",
        ],
        result:
          "The predicted position is x_new = +15 cm = +0.15 m in the declared line frame.",
        takeaway:
          "Signs, units, origin, and axis are part of the answer, not decoration around the number.",
      },
      handsOn: {
        setup:
          "Use masking tape or squared paper, a ruler, five small objects, and a pen.",
        steps: [
          "Mark an origin and label the positive x direction.",
          "Place objects on both sides and record each signed coordinate in centimetres.",
          "Predict five signed moves before sliding one object.",
          "Measure each final position and compare it with x_new = x_start + Δx.",
          "Convert every result to metres and keep the sign.",
          "Record the smallest ruler marking so you do not claim finer precision.",
        ],
        observe:
          "The physical location stays unchanged during unit conversion while its numerical representation changes.",
        doneWhen:
          "All five predictions include variable name, sign, unit, origin description, measured result, and any discrepancy.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_FLEET, ROLE_VALIDATION],
        workExample:
          "Define telemetry and mission fields with explicit metres, seconds, timestamps, and coordinate-frame names; reject incompatible or implausible values at the boundary.",
        interviewPrompt:
          "A map UI shows a robot 100 times farther from the dock than reality. Describe how you would test unit, scale, origin, sign, and frame assumptions.",
      },
      commonMistakes: [
        {
          mistake: "Writing a position as the bare number 5.",
          correction:
            "Add the quantity name, unit, axis, origin, and frame needed to interpret it.",
        },
        {
          mistake: "Dropping a minus sign during conversion.",
          correction:
            "Convert only the scale; the direction relative to the origin does not change.",
        },
        {
          mistake: "Adding values with unlike dimensions or units.",
          correction:
            "Confirm the same physical quantity and convert to compatible units before arithmetic.",
        },
        {
          mistake: "Reporting more precision than the measuring tool supports.",
          correction:
            "Record resolution and round the result to an honest level.",
        },
      ],
      checkQuestions: [
        {
          question: "Does −30 cm describe a negative distance?",
          answer:
            "It describes a signed coordinate 30 cm in the direction opposite +x; its distance from the origin is 30 cm.",
        },
        {
          question: "Why do 30 cm and 0.30 m represent the same length?",
          answer:
            "The metre is 100 centimetres, so dividing the number by 100 while changing the unit preserves the physical quantity.",
        },
        {
          question: "What information is missing from the coordinate pair (2, 3)?",
          answer:
            "At least the unit, named frame or origin, axis directions, and what physical point is being located.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The signed tape line and physical ruler check are simpler and less redundant than another coordinate graphic.",
      },
    },
    {
      dayId: 5,
      mentalModel:
        "A vector is an arrow with components: the components tell how to build the arrow, the norm tells its length, and the dot product compares its direction with another arrow.",
      explanation: [
        "A vector represents a quantity with size and direction, such as displacement or velocity. In a chosen 2D frame, v = (3, 4) m means an arrow with +3 m along x and +4 m along y. The same physical arrow can have different components in a rotated frame, so components are not the vector's entire meaning. A scalar has one value; a vector needs enough components for the space being used.",
        "Add vectors component by component when the quantities, units, and frame match. Walking a = (3, 0) m and then b = (0, 4) m produces total displacement a + b = (3, 4) m. Subtraction answers a relative-change question: target minus robot position gives an error vector pointing from robot to target. Head-to-tail drawings provide a physical check on the arithmetic.",
        "The Euclidean norm gives straight-line length. For v = (3, 4) m, ||v|| = √(3² + 4²) m = 5 m. The travelled path in the earlier right-then-up walk is 7 m, while displacement norm is 5 m; they answer different questions. Squaring removes component signs before lengths are combined, and the final unit returns to metres.",
        "The dot product a·b = a_x b_x + a_y b_y is a scalar measuring directional alignment with scale. Positive means broadly aligned, negative broadly opposed, and zero means perpendicular when both vectors are nonzero. Its unit is the product of the input units, so two metre displacement vectors produce m². A normalized direction vector avoids length dominating an alignment comparison, but normalization is a later operation and the zero vector has no direction.",
      ],
      keyTerms: [
        {
          term: "Vector",
          meaning: "A quantity with magnitude and direction, represented by components in a chosen frame.",
          physicalExample: "A rover displacement of 3 m east and 4 m north.",
        },
        {
          term: "Component",
          meaning: "The signed amount of a vector along one coordinate axis.",
          physicalExample: "The x component of (3, 4) m is +3 m.",
        },
        {
          term: "Vector sum",
          meaning: "The combined effect found by adding matching components.",
          physicalExample: "A 3 m east walk followed by 4 m north gives displacement (3, 4) m.",
        },
        {
          term: "Norm",
          meaning: "A rule that gives vector length; here the Euclidean straight-line length.",
          physicalExample: "The norm of (3, 4) m is 5 m.",
        },
        {
          term: "Dot product",
          meaning: "A scalar made by multiplying matching components and adding, used to measure alignment.",
          physicalExample: "A forward velocity dotted with a forward axis is positive.",
        },
        {
          term: "Zero vector",
          meaning: "A vector whose components and magnitude are all zero, so it has no unique direction.",
          physicalExample: "No displacement: (0, 0) m.",
        },
      ],
      physicalExamples: [
        {
          title: "Rover-to-dock error",
          scenario:
            "The rover is at (1, 2) m and its dock is at (4, 6) m in the same map frame.",
          lookFor:
            "Target minus robot gives error (3, 4) m, whose norm says the dock is 5 m away by a straight line.",
        },
        {
          title: "Pushing a trolley",
          scenario:
            "A person pushes partly forward and partly sideways while the trolley is constrained mostly along the aisle.",
          lookFor:
            "A dot product with the aisle direction separates useful forward effort from sideways effort.",
        },
      ],
      workedExample: {
        title: "Calculate a navigation error and alignment",
        setup:
          "In one map frame, robot position r = (1, 2) m, target t = (4, 6) m, and robot forward direction f = (1, 0).",
        steps: [
          "Subtract matching components: e = t − r = (4−1, 6−2) m.",
          "Obtain error vector e = (3, 4) m.",
          "Calculate its norm: ||e|| = √(3²+4²) m = 5 m.",
          "Calculate f·e = 1×3 + 0×4 = 3 m.",
          "Interpret the positive result: the target has a component in front of the robot.",
          "Keep the remaining +4 m sideways component visible; positive alignment does not mean perfectly straight ahead.",
        ],
        result:
          "The target is 5 m away, with 3 m of the error along the robot's forward axis and 4 m along the map y-axis.",
        takeaway:
          "Norm answers “how far”; components answer “in which axis directions”; dot product answers an alignment question.",
      },
      handsOn: {
        setup:
          "Use squared paper, ruler, pencil, and a scale of one square = one centimetre.",
        steps: [
          "Draw v = (3, 4) and w = (−1, 2) from the same origin.",
          "Draw w head-to-tail after v and mark the resultant v + w.",
          "Calculate v + w and v − w component by component, then compare with the grid.",
          "Build the right triangle for v and calculate ||v||.",
          "Calculate v·w and state its unit under your drawing scale.",
          "Reverse w, repeat the dot product mentally, and predict how the alignment sign changes.",
        ],
        observe:
          "The drawing catches swapped signs or components, while arithmetic provides an exact prediction at the chosen scale.",
        doneWhen:
          "The four arrows, two component calculations, norm, dot product, units, and one written interpretation all agree.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_PHYSICAL_AI],
        workExample:
          "Compute position error vectors, stop tolerances, and directional alignment before a planner, controller, or learned policy is allowed to request motion.",
        interviewPrompt:
          "A robot is close to a goal but facing away from it. Which vector quantities distinguish distance from directional alignment, and what frames and units must match?",
      },
      commonMistakes: [
        {
          mistake: "Adding vectors expressed in different frames.",
          correction:
            "Transform both into one named frame before adding matching components.",
        },
        {
          mistake: "Calling the 3 m + 4 m walking path a 7 m displacement.",
          correction:
            "Path length is 7 m, but the start-to-finish vector norm is 5 m.",
        },
        {
          mistake: "Saying zero dot product always proves a right angle.",
          correction:
            "It proves orthogonality only when both vectors are nonzero; the zero vector has no direction.",
        },
        {
          mistake: "Dropping units from the dot product.",
          correction:
            "Multiply input units; two metre-valued vectors produce a dot product in m².",
        },
      ],
      checkQuestions: [
        {
          question: "What does t − r mean when t and r are positions in the same frame?",
          answer:
            "It is the displacement or error vector pointing from robot position r to target position t.",
        },
        {
          question: "Why is ||(3, 4) m|| equal to 5 m rather than 7 m?",
          answer:
            "The norm is the straight-line hypotenuse √(3²+4²), while 7 m is the length of a two-segment path.",
        },
        {
          question: "What does a negative dot product between two nonzero direction vectors suggest?",
          answer:
            "They point more than 90° apart, so they are broadly opposed.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "The existing Day 5 vector visual directly connects components, norm, and dot product to one checked numeric fixture.",
      },
    },
    {
      dayId: 6,
      mentalModel:
        "A coordinate frame is a small map fastened to an object; when the object moves, its local map moves with it.",
      explanation: [
        "A coordinate frame has an origin and ordered axis directions. In 2D it usually has x and y; in 3D it has x, y, and z. Coordinates describe a physical point relative to that frame. A coin does not have one universal coordinate tuple: its table-frame coordinates and camera-frame coordinates may differ while the coin stays still. Always read the frame label before reading the numbers.",
        "A frame differs from a point. The frame supplies the measuring map; the point is something described by that map. A robot base frame may be fixed to the chassis, a camera frame to the camera housing, and a world frame to the room or map. When the rover turns, camera axes turn with it while world axes remain fixed. This is why a local “one metre forward” vector changes direction in world coordinates.",
        "Robotics normally uses right-handed 3D frames. Point the right-hand index finger along +x and the middle finger along +y; the thumb indicates +z for the usual mnemonic. More formally, x crossed with y points along z. A mirrored axis set reverses handedness and cannot be produced by an ordinary rigid rotation. You do not need to calculate a cross product today, but you must be able to detect a reflected drawing.",
        "Never add or compare coordinate components merely because their arrays have the same shape. First ensure they describe compatible quantities in the same frame, unit, and time. A camera observation captured before the robot moved may be stale even after a correct frame conversion. Frame names and timestamps are therefore part of production data contracts, not optional comments.",
      ],
      keyTerms: [
        {
          term: "Coordinate frame",
          meaning: "An origin plus ordered axis directions used to describe coordinates.",
          physicalExample: "A base frame drawn at the centre of a rover chassis.",
        },
        {
          term: "Local coordinates",
          meaning: "Coordinates expressed in a frame attached to the nearby object or sensor.",
          physicalExample: "A cup located 40 cm straight ahead of a camera.",
        },
        {
          term: "Reference frame",
          meaning: "The named frame whose axes and origin are used for a description.",
          physicalExample: "A map frame used to state all warehouse robot positions.",
        },
        {
          term: "Right-handed frame",
          meaning: "An axis ordering in which +x crossed toward +y gives +z.",
          physicalExample: "x forward, y left, z up is one common robot-body convention.",
        },
        {
          term: "Frame mismatch",
          meaning: "Using coordinates as though they share axes and origin when they do not.",
          physicalExample: "Treating a camera-forward offset as a map-x offset after the robot has turned.",
        },
      ],
      physicalExamples: [
        {
          title: "Phone on a rotated book",
          scenario:
            "A coin is 5 cm to the right of the book's centre; rotate the book 90° on the table without moving its centre.",
          lookFor:
            "The coin's book-frame coordinates stay similar while its table-frame direction changes.",
        },
        {
          title: "Camera mounted on a rover",
          scenario:
            "A box appears one metre in front of a forward camera while the rover faces west in the map.",
          lookFor:
            "Camera +x or +z forward, depending on convention, is not automatically map +x; the declared axis convention decides.",
        },
      ],
      workedExample: {
        title: "Describe one coin in two aligned frames",
        setup:
          "A book-frame origin is at table x = 20 cm. Its +x axis is aligned with table +x. A coin is at book x = 5 cm.",
        steps: [
          "Name the frames: table T and book B.",
          "Record the book origin in T: x_TB = 20 cm.",
          "Record the coin locally in B: x_Bcoin = 5 cm.",
          "Check axis alignment: the book +x direction matches table +x, so the sign is +1.",
          "Add the aligned displacement: x_Tcoin = 20 cm + 5 cm = 25 cm.",
          "Verify with the ruler from the table origin.",
        ],
        result:
          "The same coin has coordinate 5 cm in the book frame and 25 cm in the table frame.",
        takeaway:
          "Different coordinate values can correctly describe one physical point because origins and axes differ.",
      },
      handsOn: {
        setup:
          "Use a book, table, coin, paper axis arrows, ruler, and your right hand.",
        steps: [
          "Tape a 2D frame to the table and another to the book, with origins clearly marked.",
          "Place the coin at a measured book-frame coordinate and also measure it in the table frame.",
          "Rotate the book 90° around its marked origin without sliding that origin.",
          "Predict the coin's new table-frame direction before measuring it.",
          "Add a +z arrow to both frames and check the right-handed ordering.",
          "Deliberately reverse one y-axis and explain why the reflected frame is inconsistent.",
        ],
        observe:
          "Book-local coordinates follow the book, while table coordinates reflect the book's changed orientation.",
        doneWhen:
          "Your note includes two origins, axis directions, units, coordinates before and after rotation, and a labelled reflected failure case.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_HMI],
        workExample:
          "Display and validate timestamped camera detections only after transforming them into the robot base or map frame used by planning and the operator interface.",
        interviewPrompt:
          "A detected obstacle looks correct in camera coordinates but appears behind the robot on the map. List the frame, axis, transform-direction, unit, and time checks you would perform.",
      },
      commonMistakes: [
        {
          mistake: "Treating coordinates as properties that never change with the frame.",
          correction:
            "The physical point is fixed, but its component values depend on the chosen origin and axes.",
        },
        {
          mistake: "Adding a camera-frame vector directly to a map-frame vector.",
          correction:
            "Express both in one common frame first.",
        },
        {
          mistake: "Drawing a mirrored axis set and calling it a rotation.",
          correction:
            "Check handedness; a reflection reverses the axis orientation and is not an ordinary rigid rotation.",
        },
        {
          mistake: "Using a correct transform with an old measurement.",
          correction:
            "Match frame conversion to the measurement timestamp and reject stale data according to a declared bound.",
        },
      ],
      checkQuestions: [
        {
          question: "Can one coin have two correct coordinate pairs?",
          answer:
            "Yes. Each pair can describe the same point relative to a different named origin and axis set.",
        },
        {
          question: "Why can you not add camera (1, 0) to map (1, 0) directly?",
          answer:
            "The component directions and origins may represent different physical arrows; both must first be expressed in one frame.",
        },
        {
          question: "What information should accompany a position in a robot message?",
          answer:
            "The coordinate values, unit, named reference frame, physical meaning, and measurement timestamp or freshness information.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The two real frames attached to a book and table provide a stronger manipulable explanation than a fifth weekly vector diagram.",
      },
    },
    {
      dayId: 7,
      mentalModel:
        "A matrix is a compact rule machine: each row tells how to calculate one output component from all input components.",
      explanation: [
        "A matrix is a rectangular arrangement of numbers. It can store data, but in this lesson it represents a declared linear action on a column vector. The matrix shape tells what sizes fit: a 2×2 matrix accepts a two-component input and returns a two-component output. Meaning also depends on conventions such as axis order, frame, units, and whether vectors are written as columns.",
        "Matrix–vector multiplication is repeated multiply-and-add work. For each output, take one matrix row, multiply its entries by the matching input components, and add. The first row produces the first output component; the second row produces the second. Do not multiply entries only by position and stop—the addition inside each row is essential.",
        "The identity matrix [[1,0],[0,1]] leaves every input unchanged. A diagonal matrix [[2,0],[0,1]] doubles x while leaving y unchanged. The matrix [[−1,0],[0,1]] reflects across the y-axis and reverses handedness. The quarter-turn matrix [[0,−1],[1,0]] rotates column vectors by +90° under the standard x-right, y-up convention. Drawing known test vectors makes sign and convention errors visible.",
        "Not every physical operation fits a plain 2×2 matrix. A rotation or scale about the origin is linear, but adding a fixed translation is not: a linear matrix must send the zero vector to zero. Later, homogeneous coordinates will place rotation and translation into a larger matrix representation. For now, state exactly what the 2×2 input and output mean and test the rule with the basis arrows (1,0) and (0,1).",
      ],
      keyTerms: [
        {
          term: "Matrix",
          meaning: "A rectangular number array used here as a declared input-to-output linear rule.",
          physicalExample: "A 2×2 rotation matrix maps a 2D arrow to a turned arrow.",
        },
        {
          term: "Row",
          meaning: "A horizontal matrix line that calculates one output component.",
          physicalExample: "The first row computes output x.",
        },
        {
          term: "Column vector",
          meaning: "An input or output vector written vertically in this convention.",
          physicalExample: "The arrow (2, 0) written as two stacked numbers.",
        },
        {
          term: "Identity matrix",
          meaning: "A square matrix that leaves compatible vectors unchanged.",
          physicalExample: "Applying [[1,0],[0,1]] to (1,2) returns (1,2).",
        },
        {
          term: "Linear transformation",
          meaning: "A rule that preserves vector addition and scalar multiplication and sends zero to zero.",
          physicalExample: "Rotation about the origin, scaling, or reflection through an origin line.",
        },
        {
          term: "Basis vector",
          meaning: "One of the unit axis arrows used to build and test all vectors in the space.",
          physicalExample: "e₁ = (1,0) and e₂ = (0,1) in 2D.",
        },
      ],
      physicalExamples: [
        {
          title: "Rotate a paper arrow",
          scenario:
            "A paper arrow initially points two squares along +x and is turned 90° counterclockwise around the origin.",
          lookFor:
            "The input (2,0) becomes (0,2), and its length remains two squares.",
        },
        {
          title: "Mirror a camera overlay",
          scenario:
            "A selfie preview reflects horizontal coordinates while leaving vertical coordinates unchanged.",
          lookFor:
            "The mapping (x,y) → (−x,y) is a reflection, not a physical camera rotation, and it reverses handedness.",
        },
      ],
      workedExample: {
        title: "Apply a quarter-turn matrix one row at a time",
        setup:
          "Use R = [[0,−1],[1,0]] and input v = (2,1) as a column vector.",
        steps: [
          "Check dimensions: a 2×2 matrix can multiply a two-component column vector.",
          "Compute output x from row one: 0×2 + (−1)×1 = −1.",
          "Compute output y from row two: 1×2 + 0×1 = 2.",
          "Write the complete output Rv = (−1,2).",
          "Draw v and Rv and verify a 90° counterclockwise turn.",
          "Check length: √(2²+1²) = √5 and √((−1)²+2²) = √5.",
        ],
        result:
          "The matrix maps (2,1) to (−1,2) and preserves length, matching a pure quarter-turn rotation.",
        takeaway:
          "Row-by-column arithmetic plus a geometric check exposes swapped order or sign errors.",
      },
      handsOn: {
        setup:
          "Make four paper cards for identity, x-scale by 2, x-reflection, and +90° rotation; use squared paper.",
        steps: [
          "Write each 2×2 matrix and its intended physical action on a separate card.",
          "Apply every card to e₁ = (1,0) and e₂ = (0,1) one row at a time.",
          "Use those two outputs to predict the result for v = (1,2).",
          "Calculate each full result and draw input plus output arrows.",
          "Check which actions preserve length and which reverse handedness.",
          "Attempt to represent “move every point +2 along x” with a 2×2 matrix and use the zero-vector test to explain why it fails.",
        ],
        observe:
          "The transformed basis arrows reveal the whole linear action; the translation attempt fails because a 2×2 linear matrix cannot move zero away from zero.",
        doneWhen:
          "All twelve matrix–vector results are correct, drawn, labelled with convention, and the translation limitation is explained using the zero vector.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_HMI, ROLE_PHYSICAL_AI],
        workExample:
          "Test coordinate, image, and learned-action transformations with known basis inputs before connecting them to a 3D viewer, planner, or robot command interface.",
        interviewPrompt:
          "A 2D overlay is mirrored and rotated the wrong way. How would basis-vector tests, frame conventions, and the zero-vector test isolate the matrix error?",
      },
      commonMistakes: [
        {
          mistake: "Multiplying corresponding entries without summing each row.",
          correction:
            "Each output component is a dot product between one matrix row and the input column.",
        },
        {
          mistake: "Changing between row-vector and column-vector conventions silently.",
          correction:
            "Declare the convention and keep matrix order consistent throughout the calculation and code.",
        },
        {
          mistake: "Calling a reflection a rotation because both move arrows.",
          correction:
            "Test handedness and length; reflection reverses orientation even when length is preserved.",
        },
        {
          mistake: "Trying to encode a fixed translation in a plain 2×2 linear matrix.",
          correction:
            "A linear map sends zero to zero; use addition separately now and homogeneous coordinates later.",
        },
      ],
      checkQuestions: [
        {
          question: "What does the first row of a 2×2 matrix calculate under the column-vector convention?",
          answer:
            "It multiplies and adds the two input components to produce the first output component.",
        },
        {
          question: "How can two basis-vector tests reveal a 2D linear transformation?",
          answer:
            "Every 2D vector is a weighted sum of the two basis vectors, and a linear rule preserves that combination.",
        },
        {
          question: "Why can no 2×2 linear matrix perform the same +2 x translation for every point?",
          answer:
            "Every linear matrix maps the zero vector to zero, while that translation would map zero to (2,0).",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "The existing Day 7 visual is exact-topic and validates the quarter-turn matrix with an inspectable numeric fixture.",
      },
    },
  ],
} as const satisfies ChapterContent;
