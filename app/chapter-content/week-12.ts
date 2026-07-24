import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week12Content = {
  week: 12,
  title: "Make an arm plan, move, touch, and prove the whole task",
  purpose:
    "Turn a perceived object pose into a manipulation result that can be inspected and challenged: model the arm and its surroundings, reject colliding configurations, compare randomized motion plans, add executable timing, combine local Servo alignment with a staged Task Constructor pick-and-place, reason about contact and force, and finish with a twenty-trial acceptance decision instead of a lucky demo.",
  prerequisites: [
    "Use joint coordinates, forward and inverse kinematics, transforms, radians, velocity, acceleration, force, torque, and controller limits from the foundation weeks.",
    "Inspect a ROS 2 graph, tf2 tree, URDF, SRDF, ros2_control controller state, action result, timestamps, and saved logs without treating an RViz animation as physical evidence.",
    "Bring forward the framed 3D target, calibration record, uncertainty gates, and rejection reasons from the perception chapter; an untrusted pose must never become an arm command.",
    "Run this chapter with the official MoveIt 2 tutorial robot in simulation or with recorded data. Powered-arm collision, Servo, grasp-force, and contact experiments require a separately approved hardware procedure and are not part of these lessons.",
  ],
  outcomes: [
    "Explain workspace versus configuration space and prove why a clear tool point does not guarantee that every robot link, payload, or swept state is collision-free.",
    "Connect URDF collision geometry, SRDF planning groups, inverse kinematics, robot state, world objects, attached objects, and the allowed-collision matrix without confusing their responsibilities.",
    "Evaluate an OMPL sampling-based planner over repeated seeds using success, planning time, path length, and clearance rather than selecting one attractive path.",
    "Separate a geometric path from a time-parameterized trajectory, inspect joint limits and timestamps, and verify simulated execution, feedback, cancellation, and terminal result.",
    "Use MoveIt Servo only for bounded local commands and use MoveIt Task Constructor to expose the stages, alternatives, scene transitions, and failures of pick-and-place.",
    "Reason about grasp contact, framed force-torque measurements, friction limits, impedance, and admittance while keeping contact tuning inside simulation or an unpowered physical model.",
    "Run a reproducible twenty-trial manipulation matrix with planted faults, stage-level metrics, linked evidence, and a strict PASS, NEEDS REVISION, or BLOCKED decision.",
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
      label: "MoveIt 2 — Planning Scene tutorial",
      url: "https://moveit.picknik.ai/main/doc/examples/planning_scene/planning_scene_tutorial.html",
      useFor:
        "The official distinction between self-collision and full world collision, current RobotState checks, contact reporting, padding, and deliberately scoped entries in the allowed-collision matrix.",
    },
    {
      label: "MoveIt 2 — Motion Planning concepts",
      url: "https://moveit.picknik.ai/main/doc/concepts/motion_planning.html",
      useFor:
        "MoveIt constraints, its OMPL integration and randomized planners, request adapters, and the conversion of kinematic paths into joint-limit-aware trajectories.",
    },
    {
      label: "MoveIt 2 — Realtime Servo tutorial",
      url: "https://moveit.picknik.ai/main/doc/examples/realtime_servo/realtime_servo_tutorial.html",
      useFor:
        "Servo command types, ROS and C++ interfaces, joint-limit enforcement, optional smoothing, and collision or singularity velocity scaling for local closed-loop motion.",
    },
    {
      label: "MoveIt 2 — Pick and Place with MoveIt Task Constructor",
      url: "https://moveit.picknik.ai/main/doc/tutorials/pick_and_place_with_moveit_task_constructor/pick_and_place_with_moveit_task_constructor.html",
      useFor:
        "The executable staged pick-and-place structure, planning solvers, scene attachment transitions, task planning, solution inspection, and explicit execution step.",
    },
    {
      label: "ros2_controllers Kilted — controller and broadcaster index",
      url: "https://control.ros.org/kilted/doc/ros2_controllers/doc/controllers_index.html",
      useFor:
        "Official entry points for joint trajectory execution and cancellation, parallel gripper control, force-torque broadcasting, wrench transformation, and admittance control.",
    },
  ],
  days: [
    {
      dayId: 78,
      mentalModel:
        "A robot pose is one dot on a joint-angle map, and collision checking colours every dot where any modeled body part would overlap something forbidden.",
      explanation: [
        "Workspace is the ordinary room around the robot; configuration space, or C-space, is a map whose coordinates are the robot's movable joints. A two-joint arm gets a two-dimensional map with shoulder angle on one axis and elbow angle on the other. One dot on that map describes the whole arm shape. A real box becomes a curved forbidden region in C-space because many different joint pairs make a link touch it.",
        "MoveIt checks modeled bodies, not only the end-effector point. The RobotState supplies joint positions, the URDF supplies collision shapes for the links, and the planning scene supplies world objects and any object attached to the gripper. Self-collision asks whether robot parts intersect one another. Full collision checking also asks whether the padded robot intersects the modeled environment. An attached payload enlarges what moves with the arm and must be checked along the transfer.",
        "The allowed-collision matrix is a narrow exception list, not a way to make a difficult plan succeed. During a grasp, selected fingertip or gripper links may be allowed to contact the intended object; unrelated arm links must not inherit that permission. Every exception needs a physical reason, named link-object pair, bounded task phase, and test showing that other contacts still fail. Clearing collisions globally only hides the model's warning.",
        "A collision-free result is conditional evidence: it means the sampled states passed against the scene and geometry MoveIt had at that time. Thin obstacles can be skipped if path checking is too coarse, and an inaccurate mesh, stale scene, wrong transform, missing cable, loose payload, or unexpected person is absent from that proof. Use conservative geometry and margins, refresh the scene, revalidate after changes, and keep independent hardware safety functions outside the planner.",
      ],
      keyTerms: [
        {
          term: "Configuration space",
          meaning:
            "A coordinate space in which one point gives every independent robot joint or base coordinate needed to describe a complete configuration.",
          physicalExample:
            "The point `(shoulder = 30°, elbow = -60°)` describes one full shape of a cardboard two-link arm.",
        },
        {
          term: "C-space obstacle",
          meaning:
            "The set of robot configurations that cause modeled self-collision or collision with an object in the world.",
          physicalExample:
            "A small block on a desk becomes a broad curved patch of forbidden shoulder-elbow angle pairs.",
        },
        {
          term: "Collision geometry",
          meaning:
            "Simplified shapes or meshes used for intersection tests, separate from detailed visual artwork.",
          physicalExample:
            "A gripper may look rounded in RViz but use a few boxes and low-detail meshes for faster conservative checks.",
        },
        {
          term: "Allowed-collision matrix",
          meaning:
            "A table of specific body or object pairs whose contact the collision checker is instructed to ignore.",
          physicalExample:
            "Two finger pads may be allowed to touch the cup only while establishing and holding that grasp.",
        },
        {
          term: "Attached collision object",
          meaning:
            "A formerly separate world object that the scene now treats as rigidly carried by a named robot link.",
          physicalExample:
            "After grasp verification, the cup moves with the tool and its body must clear the shelf during retreat.",
        },
      ],
      physicalExamples: [
        {
          title: "Cardboard arm over an angle grid",
          scenario:
            "Pin two cardboard strips into a planar arm, place an eraser beside the first link, and record shoulder-elbow pairs even when the paper fingertip remains far beyond the eraser.",
          lookFor:
            "Many poses have a clear fingertip but a colliding forearm or upper arm; those poses form a region rather than one bad point on the joint-angle grid.",
        },
        {
          title: "Backpack through a doorway",
          scenario:
            "Walk an empty backpack through a doorway, then wear it sideways and repeat slowly without scraping the frame.",
          lookFor:
            "Your centre can follow the same route while the carried shape changes clearance, just as an attached payload changes the arm's collision envelope.",
        },
      ],
      workedExample: {
        title: "Reject a pose whose tool point looks clear",
        setup:
          "A planar arm has links of `0.40 m` and `0.30 m`. At `q = (0°, 0°)` both links lie along positive x. A thin obstacle crosses the x-axis from `x = 0.32 m` to `0.38 m`, while the tool is at `x = 0.70 m`.",
        steps: [
          "Calculate maximum straight reach: `0.40 + 0.30 = 0.70 m`, so the tool point lies beyond the obstacle.",
          "Describe link one's occupied centreline at this pose: it spans `x = 0.00 m` through `x = 0.40 m` before any thickness or padding is added.",
          "Compare intervals: the obstacle interval `0.32–0.38 m` overlaps link one's interval, so the configuration is in collision.",
          "Check the entire RobotState with full collision geometry; do not replace the link test with a tool-point distance check.",
          "Mark the corresponding shoulder-elbow grid cell forbidden and test neighbouring angle pairs to reveal the surrounding C-space obstacle.",
          "Keep the result conditional on modeled thickness, obstacle pose, scene time, and collision-checking resolution; those inputs must travel with the evidence.",
        ],
        result:
          "The tool is geometrically clear at `0.70 m`, yet the pose is invalid because the first link crosses the obstacle between `0.32 m` and `0.38 m`.",
        takeaway:
          "A manipulator plan must validate the whole modeled robot and payload, not a dot representing only the tool.",
      },
      handsOn: {
        setup:
          "Use the cardboard arm first, then the official MoveIt tutorial robot and planning scene in simulation. Keep every real controller disabled.",
        steps: [
          "Draw a shoulder-versus-elbow grid, place one fixed block near the cardboard arm, and label at least twenty joint pairs as clear or colliding by inspecting both links.",
          "Launch the MoveIt tutorial simulation, record the robot model version, planning frame, planning group, initial RobotState, and exact obstacle ID, shape, dimensions, pose, and frame.",
          "Add a box that blocks one arm link while leaving the end-effector target visually open; request collision contacts and save the reported link-object pair.",
          "Run self-collision and full world-collision checks separately, clearing the previous CollisionResult before each new check so an old answer is not reused.",
          "Add one narrowly justified fingertip-to-object allowed contact, prove that pair changes as expected, and prove an elbow-to-object collision still fails.",
          "Attach a payload in the simulated scene, replay the transfer check, and save before-and-after scene summaries plus the configuration that changed validity.",
        ],
        observe:
          "The forbidden cardboard cells should resemble regions, and MoveIt should report the modeled link or payload that collides even when the target marker itself appears clear.",
        doneWhen:
          "The artifact identifies one self-collision, one world collision, one permitted grasp contact, one still-forbidden contact, and one pose invalidated by attaching the payload.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Qualify a manipulator's collision model, scene-update path, payload attachment, contact exceptions, and path-checking resolution before commissioning a shelf-picking motion near fixtures.",
        interviewPrompt:
          "Explain configuration-space obstacles, then diagnose a plan whose end-effector path looks clear but whose forearm collides; name the model, scene, resolution, and allowed-contact checks you would inspect.",
      },
      commonMistakes: [
        {
          mistake:
            "Checking only whether the end-effector point is outside every obstacle.",
          correction:
            "Check full link and payload collision geometry at the start, goal, and sufficiently dense intermediate states, including self-collision and world collision.",
        },
        {
          mistake:
            "Disabling a broad group of collisions because the gripper is supposed to touch the object.",
          correction:
            "Permit only physically intended link-object pairs for the required task phase and verify that unrelated contacts remain detectable.",
        },
        {
          mistake:
            "Treating a green RViz plan as proof that the physical workcell is safe.",
          correction:
            "Record scene freshness, transforms, geometry, padding, payload, and checking resolution, then rely on separately validated hardware safeguards for the real system.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Why can a small workspace box create a large forbidden region in a two-joint C-space?",
          answer:
            "Many shoulder-elbow combinations place some part of either link through the same box, so each colliding full-arm shape contributes another forbidden point.",
        },
        {
          question:
            "What changes in collision checking after a grasped object becomes attached to the tool?",
          answer:
            "The object's geometry moves with the attached link and becomes part of the carried collision envelope for subsequent approach, lift, transfer, and retreat states.",
        },
        {
          question:
            "What does a collision-free MoveIt result fail to prove by itself?",
          answer:
            "It does not prove the model is complete, the scene and transforms are fresh, continuous space was checked finely enough, or independent physical safety functions will stop real hazards.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A linked workspace-and-joint-angle view is necessary to show how one physical obstacle becomes a region of forbidden full-arm configurations and why tool-only checking fails.",
      },
    },
    {
      dayId: 79,
      mentalModel:
        "The URDF describes the robot's body, the SRDF names useful teams of joints, IK proposes poses for those teams, and the planning scene judges each proposal in context.",
      explanation: [
        "URDF and SRDF answer different questions. URDF describes the physical kinematic tree, joints, limits, links, and visual or collision geometry. SRDF adds semantics used by MoveIt: planning groups, end-effectors, named states, virtual or passive joints, and disabled self-collision pairs. An SRDF cannot repair a wrong joint axis, missing link, incorrect limit, or badly scaled collision mesh in the URDF; semantic labels sit on top of a valid physical model.",
        "A planning group selects which joints MoveIt may change for one request. Inverse kinematics maps a desired tool pose into one or more candidate joint configurations for that group. The pose must name the intended tool link, reference frame, position, orientation, and tolerance. IK can return no answer, several answers, or an answer near a joint limit. Every candidate still needs bound, self-collision, world-collision, and task-constraint checks before it becomes a planning goal.",
        "The planning scene joins the RobotModel with a current RobotState, world geometry, attached bodies, transforms, and an allowed-collision matrix. That scene has operational state: object IDs must be stable, updates must reach the planning process, and consumers must know whether they are looking at the monitored scene or a stale local copy. Seeing a box in one RViz display does not prove the planner that handled the request received the same version.",
        "Pick-and-place changes object ownership inside the scene. Before grasp, the cup is world geometry and should block the arm. After contact is independently verified, the scene removes it from the world and attaches it to the tool, with only intended touch links allowed. At placement, the object is detached and restored to the world at its measured or commanded pose. Attaching early makes a missed grasp look successful; detaching early can let the planner drive through the still-carried object.",
      ],
      keyTerms: [
        {
          term: "URDF",
          meaning:
            "The robot description that defines the physical link-joint tree and commonly supplies limits plus visual and collision geometry.",
          physicalExample:
            "A six-joint arm URDF names each hinge axis and the collision mesh carried by each child link.",
        },
        {
          term: "SRDF",
          meaning:
            "A semantic companion description that groups joints and links and records planning concepts such as end-effectors, named poses, and selected disabled self-collisions.",
          physicalExample:
            "The same physical robot can have an `arm` planning group, a `gripper` group, and a named `ready` configuration.",
        },
        {
          term: "Planning group",
          meaning:
            "The named subset of joints and links that MoveIt is allowed to plan for in a request.",
          physicalExample:
            "An arm-only request moves six arm joints while leaving the gripper joints unchanged.",
        },
        {
          term: "Inverse kinematics",
          meaning:
            "The calculation that seeks joint values whose forward kinematics place a chosen link at a requested pose.",
          physicalExample:
            "Elbow-up and elbow-down shapes can put the same simple arm tool at one point.",
        },
        {
          term: "Planning scene",
          meaning:
            "The versioned planning context containing robot model and state, world objects, attached objects, transforms, and collision permissions.",
          physicalExample:
            "A shelf, cup, carried cup, current joint readings, and allowed fingertip contact all affect whether a goal is valid.",
        },
        {
          term: "Scene diff",
          meaning:
            "An incremental planning-scene update that adds, removes, attaches, detaches, or changes selected state rather than replacing everything.",
          physicalExample:
            "A single update adds `cup_7`; a later update changes `cup_7` from world object to tool-attached object.",
        },
      ],
      physicalExamples: [
        {
          title: "Skeleton, team list, and room map",
          scenario:
            "Draw a stick-figure arm, circle the shoulder-through-wrist joints as one team, and place paper furniture around it on a separate room sheet.",
          lookFor:
            "The skeleton is the physical tree, the circled team is planning semantics, and the changing furniture sheet is scene state; none can substitute for another.",
        },
        {
          title: "Carry a long ruler",
          scenario:
            "Reach an empty hand between two chair backs, then hold a long ruler rigidly and repeat the same slow path without touching either chair.",
          lookFor:
            "The arm pose may be unchanged, but the attached object adds geometry that can invalidate the route and must remain attached until it is actually released.",
        },
      ],
      workedExample: {
        title: "Choose between two IK candidates with complete checks",
        setup:
          "The `arm` group receives a base-frame tool pose. IK returns candidates A and B. Their joint-distance costs from the current state are `0.55 rad` and `1.20 rad`. A is inside limits but its elbow intersects `shelf`; B is inside limits and collision-free.",
        steps: [
          "Verify that the request names the correct base frame, tool link, planning group, units, orientation convention, tolerances, and scene version.",
          "Confirm both candidates satisfy every joint bound; an IK return code alone does not perform the complete acceptance decision.",
          "Compare motion preference: A is nearer because `0.55 rad < 1.20 rad`, but distance is only a cost, not a validity override.",
          "Run self and world collision checks; reject A because its elbow intersects the shelf even though it has the lower joint-distance cost.",
          "Validate B against path constraints, attached payload geometry, and the intended approach direction before passing it to the planner.",
          "Record both candidates and rejection reasons so a later engineer sees that the farther solution was selected deliberately, not accidentally.",
        ],
        result:
          "Candidate B becomes the valid goal despite its larger joint-space distance; candidate A remains an invalid, documented alternative because of elbow-shelf collision.",
        takeaway:
          "IK proposes configurations, while model bounds, the current scene, collisions, and task constraints decide whether any proposal may be planned.",
      },
      handsOn: {
        setup:
          "Use the official simulated robot's MoveIt configuration package and a copied test scene. Do not change the shared robot package or connect a hardware controller.",
        steps: [
          "Trace one arm planning group from its SRDF name to included joints, base and tip links, end-effector relationship, named state, kinematics plugin, and joint limits in the underlying model.",
          "Create one reachable tool-pose request with an explicit frame and tool link; save every IK candidate or the solver's bounded result plus seed, timeout, and tolerance.",
          "Create one unreachable pose and one reachable pose whose candidate collides with a new box; keep `no IK solution` separate from `IK solution rejected by collision`.",
          "Apply the box through the planning-scene interface, then query or inspect the monitored planning scene to prove the planner received the expected object ID, pose, dimensions, and frame.",
          "Simulate grasp verification, attach the object with narrowly named touch links, check a lift pose, then detach it at the placement pose and confirm it again blocks later motions as world geometry.",
          "Save a lifecycle table for each scene update with sequence, object ownership, scene evidence, accepted or rejected IK result, and exact reason.",
        ],
        observe:
          "Reachability, collision validity, and object ownership should appear as separate states; the same tool target can change validity when the scene or attached geometry changes.",
        doneWhen:
          "One command path reproduces a valid candidate, an unreachable target, a colliding candidate, and the complete world-to-attached-to-world object lifecycle with verified scene state.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Integrate a new arm and gripper by validating its URDF/SRDF contract, kinematics solver, planning groups, scene synchronization, and object attachment lifecycle across nominal and rejected targets.",
        interviewPrompt:
          "Separate URDF, SRDF, IK, and planning-scene responsibilities, then explain how you would distinguish an unreachable pose, a colliding IK solution, and a stale obstacle update.",
      },
      commonMistakes: [
        {
          mistake:
            "Trying to correct a wrong joint axis or scaled mesh by changing SRDF planning-group settings.",
          correction:
            "Repair and validate the physical URDF model first; use SRDF only for semantic groups, end-effectors, named states, virtual or passive joints, and justified collision semantics.",
        },
        {
          mistake:
            "Executing the first IK answer because the solver reported success.",
          correction:
            "Check bounds, self and world collision, constraints, tool and reference frames, attached bodies, conditioning concerns, and path feasibility before planning.",
        },
        {
          mistake:
            "Attaching an object when the close-gripper command is sent rather than when grasp evidence is accepted.",
          correction:
            "Require the declared contact or gripper-width evidence, then make one traceable scene transition; keep a failed grasp as world geometry.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Which description should be fixed when a collision mesh is 1,000 times too large?",
          answer:
            "The physical robot model or referenced mesh scale in the URDF must be corrected; changing SRDF groups would only relabel the bad geometry.",
        },
        {
          question:
            "Why is the nearest IK candidate not automatically the best goal?",
          answer:
            "It may violate joint bounds, collide, oppose the desired approach, sit near poor conditioning, or conflict with the attached payload and task constraints.",
        },
        {
          question:
            "When should a grasped object move from world geometry to attached geometry?",
          answer:
            "Only after the chosen grasp-verification contract succeeds; it remains attached through carried motion and returns to world geometry when release is verified.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The model-group-scene separation and object ownership lifecycle are practiced directly with inspected configuration and scene state; Day 78 already supplies the chapter's collision-geometry visual.",
      },
    },
    {
      dayId: 80,
      mentalModel:
        "A sampling planner grows possible routes through the joint-angle maze, but each random branch still needs the robot model to say whether that branch is legal.",
      explanation: [
        "OMPL supplies abstract motion-planning algorithms, including randomized planners; MoveIt supplies the robot meaning around them. MoveIt defines the group's state space, start and goal constraints, joint bounds, validity checks, and planning scene. A planner such as RRT samples a configuration, finds a nearby tree node, extends toward the sample, and asks whether the new edge is valid. RRTConnect grows from both start and goal and tries to join the trees.",
        "Random sampling explains why identical requests can produce different paths or planning times. A useful sample near an open route can solve the problem quickly; unlucky samples may grow branches into dead ends. Narrow passages are especially difficult because only a small portion of C-space leads through them. A timeout means no solution was found within that budget, not mathematical proof that no solution exists. An invalid start, impossible goal, or disconnected free region needs a different diagnosis.",
        "Collision checking along an edge has a resolution. If only widely separated states are checked, both endpoints can be clear while a thin obstacle lies between them. Finer checking catches more detail but costs more computation. Planner range, goal bias, constraints, mesh complexity, scene margins, and post-processing also affect the result. Path shortening can remove needless bends, but the changed path must remain valid under the same or stricter scene and resolution.",
        "Planner evaluation is an experiment, not a screenshot. Freeze the robot model, scene, start, goal, constraints, timeout, checking resolution, and machine load; then run declared random seeds. Record success, failure code, planning time, path length, minimum modeled clearance, and number of states. Compare distributions or medians and preserve failed seeds. One beautiful path proves only that one run returned a candidate under one recorded condition.",
      ],
      keyTerms: [
        {
          term: "Sampling-based planner",
          meaning:
            "A planner that explores selected states in a continuous space instead of building an exact grid of every possible configuration.",
          physicalExample:
            "Randomly placed dots in a paper maze become possible arm configurations for a search tree.",
        },
        {
          term: "RRT",
          meaning:
            "Rapidly-exploring Random Tree, which repeatedly samples a state and extends a tree from a nearby known state toward it.",
          physicalExample:
            "A branching pencil tree spreads quickly into large empty parts of a maze and sometimes reaches the exit corridor.",
        },
        {
          term: "State validity",
          meaning:
            "The decision that one configuration satisfies declared joint bounds, collisions, and other feasibility checks.",
          physicalExample:
            "A shoulder-elbow pair is rejected because the elbow box overlaps a shelf even though both angles are individually legal.",
        },
        {
          term: "Edge resolution",
          meaning:
            "How finely the configurations between two sampled states are checked for validity.",
          physicalExample:
            "Checking a paper route only every 10 cm can jump over a 2 cm line, while 1 cm checks reveal it.",
        },
        {
          term: "Planning timeout",
          meaning:
            "The maximum search time allowed before the request returns without a found solution.",
          physicalExample:
            "A two-second budget can expire during an unlucky tree expansion even though another seed finds a route in half a second.",
        },
        {
          term: "Clearance",
          meaning:
            "The modeled separation between the robot or payload and the nearest forbidden geometry along a path.",
          physicalExample:
            "Two routes reach the cup, but one keeps 50 mm from the shelf while the other passes only 4 mm away.",
        },
      ],
      physicalExamples: [
        {
          title: "Two trees through a paper maze",
          scenario:
            "Draw a start, goal, walls, and one narrow doorway; grow one pencil tree from the start and another from the goal using numbers from a shuffled deck as sample coordinates.",
          lookFor:
            "Large open areas collect branches quickly, while the narrow doorway may receive no useful sample for several turns; another shuffle produces another route and time.",
        },
        {
          title: "Stepping over a thin tape line",
          scenario:
            "Mark two safe floor points on opposite sides of a narrow tape strip and inspect only the two points, then inspect every shoe position along the step.",
          lookFor:
            "Safe endpoints do not make the connecting motion safe; intermediate checking exposes the crossed strip just as edge validation exposes a thin modeled obstacle.",
        },
      ],
      workedExample: {
        title: "Compare two planners without choosing the luckiest run",
        setup:
          "For one frozen simulated shelf scene and a `2.0 s` timeout, Planner A succeeds on 18 of 20 declared seeds with median successful planning time `0.42 s`, median path length `2.8 rad`, and minimum observed clearance `14 mm`. Planner B succeeds on 20 of 20 with medians `0.76 s`, `3.1 rad`, and `27 mm`.",
        steps: [
          "Calculate Planner A's measured success rate: `18 / 20 × 100% = 90%`; preserve the two failed seeds and error codes.",
          "Calculate Planner B's measured success rate: `20 / 20 × 100% = 100%` for this exact twenty-seed test, not for every future scene.",
          "Compare planning-time medians: A is `0.34 s` faster on successful runs, but failed runs must not be removed from the success decision.",
          "Compare path-length medians: A is `0.3 rad` shorter, which is a geometric cost rather than direct proof of faster execution.",
          "Compare minimum observed clearance: B keeps `13 mm` more modeled clearance in this test, which may matter more than the modest path difference near the shelf.",
          "Choose B for this declared workcell criterion if the requirement prioritizes twenty-of-twenty planning and at least `20 mm` modeled clearance; retain A as a measured alternative rather than calling it bad in general.",
        ],
        result:
          "Planner B satisfies the example's success and clearance gates on all recorded seeds, while Planner A is faster and shorter only among the cases it solves.",
        takeaway:
          "Planner choice follows task-specific repeated evidence; success, time, length, and clearance answer different questions and must share the same test conditions.",
      },
      handsOn: {
        setup:
          "Use the same simulated robot and one saved narrow-passage planning scene. Fix all settings except planner ID and random seed.",
        steps: [
          "Record robot and scene versions, planning group, start, goal, constraints, timeout, edge-checking resolution, planner parameters, and a list of at least ten seeds.",
          "Run two available OMPL planner configurations across every seed and save return code, planning time, path state count, joint-space length, and modeled minimum clearance.",
          "Add an obviously impossible goal inside a collision object and confirm its failure is reported separately from an ordinary timeout on a difficult but valid goal.",
          "Make the edge-checking resolution deliberately coarse around a thin simulated obstacle, capture the invalid-looking gap, then tighten it and prove the suspect edge is rejected.",
          "Apply the configured path simplification or smoothing stage, recheck the resulting path, and compare length and clearance before and after post-processing.",
          "Create a compact table with success rate, failed seeds, median and slowest time, median path length, worst clearance, and the criterion that selects or rejects each configuration.",
        ],
        observe:
          "Paths and times should vary by seed, the narrow passage should expose unlucky searches, and the thin-obstacle test should show why endpoint checks or coarse edges are insufficient.",
        doneWhen:
          "The same command reproduces the frozen benchmark, every failure retains its seed and cause, and the selected planner follows written acceptance criteria rather than visual preference.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Benchmark OMPL planner configurations for a constrained bin-picking cell, preserve failed seeds, tune resolution and margins, and publish the tradeoff between planning latency, repeatability, path length, and clearance.",
        interviewPrompt:
          "Describe RRT or RRTConnect in configuration space, then design a fair repeated benchmark and explain how you would distinguish timeout, invalid start, impossible goal, and missed thin-obstacle checking.",
      },
      commonMistakes: [
        {
          mistake:
            "Calling a planning timeout proof that no collision-free route exists.",
          correction:
            "Report only that this planner and configuration found no route within the stated budget; separately test invalid inputs, other seeds, planners, constraints, or scene geometry.",
        },
        {
          mistake:
            "Selecting the fastest successful screenshot and omitting failed random seeds.",
          correction:
            "Predeclare seeds and metrics, keep every result, and compare success distribution, time, path cost, and clearance under identical conditions.",
        },
        {
          mistake:
            "Increasing collision-checking step size to make planning faster without a thin-obstacle regression.",
          correction:
            "Tie resolution to geometry and risk, add targeted narrow-obstacle tests, and revalidate every post-processed edge against the current scene.",
        },
      ],
      checkQuestions: [
        {
          question:
            "What robot-specific service does MoveIt provide to an abstract OMPL planner?",
          answer:
            "MoveIt defines the robot state space, bounds, start and goal constraints, collision and feasibility checks, and planning-scene context used to judge sampled states and edges.",
        },
        {
          question:
            "Why can identical start and goal requests return different RRT-style paths?",
          answer:
            "Random samples and timing change where and how the search trees grow, so routes, search effort, and timeout outcomes can differ between seeds.",
        },
        {
          question:
            "How can two valid edge endpoints still hide a collision?",
          answer:
            "The continuous motion between them may cross a thin C-space obstacle; intermediate states must be checked at a resolution fine enough for the modeled risk.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A two-tree narrow-passage scene with a deliberately under-sampled thin obstacle makes randomized exploration and edge-resolution failure visible in one planning relationship.",
      },
    },
    {
      dayId: 81,
      mentalModel:
        "A path says which joint poses to visit, while a trajectory adds a clock and speed limits so a controller knows when and how quickly to visit them.",
      explanation: [
        "A geometric path is an ordered list or curve of collision-free configurations. It says nothing about when the robot reaches each point. A trajectory adds increasing timestamps and usually joint positions, velocities, and accelerations. This distinction matters because a path can be geometrically valid yet demand impossible speed, abrupt acceleration, or an unsupported controller interface when given careless timing.",
        "MoveIt uses trajectory processing to time-parameterize a planned path under per-joint velocity and acceleration limits. Those limits can come from the robot model and be overridden by MoveIt configuration such as `joint_limits.yaml`; the more conservative, validated hardware value should win. Algorithms have assumptions and parameters. For example, MoveIt's documentation notes that Time-Optimal Trajectory Generation expects start and end at rest, so algorithm choice and endpoint conditions belong in the recorded configuration.",
        "Execution is another boundary. A MoveIt plan or Task Constructor solution must be sent to a compatible controller, commonly through a ROS action. The controller reports acceptance, feedback, cancellation handling, and a terminal result while joint-state feedback shows what the simulated or physical plant did. A successful planning return proves no execution. An accepted action proves no final pose. Compare desired and measured traces, tolerances, timestamps, and the actual terminal status.",
        "A plan also ages. If the robot moved, a payload changed, or the planning scene changed after planning, the old trajectory can be invalid even though its numbers remain well formed. Recheck the start state and relevant scene version immediately before execution. Cancellation needs a defined deceleration or stop policy and a verified terminal state; a software cancel request is not an emergency stop and must not replace independent protective hardware.",
      ],
      keyTerms: [
        {
          term: "Geometric path",
          meaning:
            "An ordered route through robot configurations without a schedule for reaching them.",
          physicalExample:
            "Three arm poses drawn on paper show where the joints go but not whether the move takes one or ten seconds.",
        },
        {
          term: "Trajectory",
          meaning:
            "A path with monotonically increasing time and motion information such as position, velocity, and acceleration.",
          physicalExample:
            "The same three poses labeled `0.0 s`, `1.2 s`, and `2.5 s` become a schedule a controller can follow.",
        },
        {
          term: "Time parameterization",
          meaning:
            "The process of assigning feasible timing, velocity, and acceleration behavior to a geometric path under declared limits.",
          physicalExample:
            "A sharp paper waypoint receives enough time for a toy joint to slow, turn, and speed up without exceeding its motor limit.",
        },
        {
          term: "Joint limit override",
          meaning:
            "A planning configuration that narrows model velocity or acceleration limits for the deployed robot or task.",
          physicalExample:
            "A joint rated at `1.5 rad/s` is capped to `0.4 rad/s` for a fragile-object simulation and commissioning profile.",
        },
        {
          term: "Tracking tolerance",
          meaning:
            "The allowed difference between requested and measured joint behavior before execution is considered outside its contract.",
          physicalExample:
            "If a joint is more than `0.05 rad` behind for too long, the controller reports an error instead of silently claiming completion.",
        },
        {
          term: "Terminal result",
          meaning:
            "The final action outcome such as succeeded, canceled, or aborted, separate from goal acceptance and intermediate feedback.",
          physicalExample:
            "The controller accepts a trajectory but later aborts because measured error exceeds the path tolerance.",
        },
      ],
      physicalExamples: [
        {
          title: "Dance poses without a beat",
          scenario:
            "Write three dance poses on cards, perform them with no timing, then repeat with timestamps and a rule limiting how fast an arm may swing.",
          lookFor:
            "The pose order stays the same, but timing changes speed and feasibility; timestamps that are too close make an otherwise possible sequence impossible.",
        },
        {
          title: "Toy cart and marked track",
          scenario:
            "Draw a clear curved route for a toy cart, then try to push it through a tight turn first slowly and then with one sudden fast shove.",
          lookFor:
            "A collision-free drawn route does not ensure the cart can follow it under acceleration, traction, and stopping limits.",
        },
      ],
      workedExample: {
        title: "Find a feasible minimum time for one joint",
        setup:
          "One joint must move `1.20 rad`, starting and ending at rest. Its simplified limits are `v_max = 0.60 rad/s` and `a_max = 1.20 rad/s²`. Assume a symmetric trapezoidal profile only for this hand calculation.",
        steps: [
          "Find acceleration time to the velocity limit: `t_acc = v_max / a_max = 0.60 / 1.20 = 0.50 s`.",
          "Find distance during acceleration: `q_acc = 0.5 × a_max × t_acc² = 0.5 × 1.20 × 0.50² = 0.15 rad`.",
          "Reserve the same `0.15 rad` for symmetric deceleration, leaving `1.20 - 0.30 = 0.90 rad` for constant-speed travel.",
          "Find cruise time: `t_cruise = 0.90 / 0.60 = 1.50 s`.",
          "Add the three phases: `0.50 + 1.50 + 0.50 = 2.50 s`, with peak speed exactly `0.60 rad/s` and acceleration magnitude `1.20 rad/s²`.",
          "Treat `2.50 s` as a simplified one-joint lower-bound example; a multi-joint MoveIt trajectory still needs synchronized limits, collision checks, endpoint assumptions, and controller validation.",
        ],
        result:
          "The simplified joint cannot complete this rest-to-rest move in less than `2.50 s` with the stated trapezoidal profile and limits.",
        takeaway:
          "Timestamps must come from velocity and acceleration constraints, not from dividing distance by a convenient average speed.",
      },
      handsOn: {
        setup:
          "Generate one collision-free path for the simulated tutorial arm and keep execution speed conservatively scaled. No hardware controller may be selected.",
        steps: [
          "Save the raw geometric waypoints, chosen trajectory-processing algorithm, robot-model limits, configuration overrides, endpoint assumptions, and requested scaling factors.",
          "Inspect every trajectory point for consistent joint ordering, finite values, strictly increasing `time_from_start`, and position, velocity, and acceleration values within the declared limits.",
          "Execute once in simulation while recording desired and measured joint positions, action goal acceptance, feedback, controller name, and terminal result.",
          "Compare planned duration with observed duration and calculate maximum position-tracking error for each joint rather than judging the RViz animation.",
          "Cancel a second run at a reproducible timestamp, record cancel acknowledgment, deceleration behavior, final joint state, terminal result, and whether the robot can replan from that state.",
          "Move the simulated obstacle or start state after planning, prove the stale plan is rejected or deliberately revalidated, then generate a fresh trajectory from the current state.",
        ],
        observe:
          "The time-parameterized points should remain inside limits, measured motion should follow within declared tolerance, cancellation should end in a known state, and a changed scene should invalidate blind reuse.",
        doneWhen:
          "Evidence separates planning success, action acceptance, feedback, successful completion, safe cancellation, and stale-plan rejection with timestamps and measured joint traces.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_HMI],
        workExample:
          "Connect MoveIt trajectory output to a ros2_control joint trajectory controller, qualify limit configuration and tracking tolerances, expose progress to an operator, and reproduce cancellation or stale-plan behavior.",
        interviewPrompt:
          "Differentiate path, time parameterization, trajectory, controller feedback, and terminal result; then explain how you would validate joint limits, tracking error, cancellation, and a scene change after planning.",
      },
      commonMistakes: [
        {
          mistake:
            "Assigning evenly spaced timestamps to waypoints without checking joint velocity and acceleration.",
          correction:
            "Use a validated time-parameterization stage, inspect every joint's limits and endpoint assumptions, and assert monotonic timing plus bounded derivatives.",
        },
        {
          mistake:
            "Calling a trajectory executed because the planner returned success or the controller accepted the goal.",
          correction:
            "Capture controller feedback, measured joint traces, tolerance checks, and the terminal action result; each boundary proves a different state.",
        },
        {
          mistake:
            "Sending yesterday's valid trajectory after the robot, payload, or scene has changed.",
          correction:
            "Verify current start state and relevant scene version immediately before execution, then revalidate or replan whenever those inputs differ.",
        },
      ],
      checkQuestions: [
        {
          question:
            "What information does a trajectory add to a collision-free geometric path?",
          answer:
            "It adds increasing time and motion behavior such as joint velocities and accelerations, constrained by the robot and controller contract.",
        },
        {
          question:
            "Why does action-goal acceptance not prove the robot reached the goal?",
          answer:
            "Acceptance only means the controller agreed to attempt the goal; feedback, measured state, tolerances, and the terminal result show what happened afterward.",
        },
        {
          question:
            "Why should a planned trajectory be checked again when the scene changes?",
          answer:
            "Its collision and start-state validity were established against earlier inputs, so changed geometry, payload, transforms, or robot state can make the old motion invalid.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The timestamped pose cards, trapezoidal calculation, and desired-versus-measured traces make path timing and execution evidence concrete without adding another chapter visual.",
      },
    },
    {
      dayId: 82,
      mentalModel:
        "Servo is a careful stream of local nudges, while Task Constructor is a visible recipe whose stages carry the robot and object from one valid scene state to the next.",
      explanation: [
        "MoveIt Servo accepts frequent local commands expressed as joint velocity, end-effector velocity, or desired end-effector pose. It is useful for teleoperation, visual alignment, and other closed-loop corrections where a new measurement can adjust the next small motion. It is not a global task planner: Servo does not choose which object to pick, invent a grasp sequence, or prove that a distant route through clutter exists.",
        "A Servo command needs a declared command frame, scale, rate, timestamp or freshness policy, and halt behavior. MoveIt Servo can enforce joint position and velocity limits and can optionally smooth motion and scale velocity near modeled collisions or singularities. Those features must be configured and tested; disabled collision checking, stale scenes, wrong command frames, or delayed commands still matter. Software scaling is useful risk reduction, not a safety-rated stop.",
        "MoveIt Task Constructor, or MTC, exposes a complex manipulation job as connected stages. Generators create possible states such as grasp poses, propagators extend a state forward or backward, and connectors find motion between state sets. Serial containers require an end-to-end chain; parallel containers represent alternatives. Each stage passes interface states and may produce zero, one, or many solutions, so the failed stage and rejected alternatives become inspectable evidence.",
        "A pick-and-place task usually includes current state, open gripper, move to pick, generate grasp candidates, solve grasp IK, approach, allow intended object-hand contact, close, attach, lift, connect to the place region, lower, open, detach, forbid contact again, and retreat. Planning and execution are separate calls. Scene transitions must follow verified physical meaning: a close command is not proof of grasp, and a planned task solution is not proof that its controllers executed every subtrajectory.",
      ],
      keyTerms: [
        {
          term: "MoveIt Servo",
          meaning:
            "A MoveIt component that turns repeated local joint, Cartesian-velocity, or Cartesian-pose commands into bounded arm motion.",
          physicalExample:
            "A camera sends small tool corrections that centre a gripper over a peg without replanning the entire workcell route each update.",
        },
        {
          term: "Command frame",
          meaning:
            "The coordinate frame whose axes give the direction and orientation meaning of a Servo command.",
          physicalExample:
            "Positive x may mean forward from the camera or outward from the tool, producing different motion if the frame is wrong.",
        },
        {
          term: "Singularity",
          meaning:
            "A robot configuration where some Cartesian motion directions become poorly conditioned or require extremely large joint rates.",
          physicalExample:
            "Near a fully stretched simple arm, a small sideways tool command may demand large opposing joint motion.",
        },
        {
          term: "MTC stage",
          meaning:
            "One named planning operation that consumes, produces, or connects interface states inside a manipulation task.",
          physicalExample:
            "A `GenerateGraspPose` stage proposes candidates while a later `ComputeIK` wrapper rejects those with no valid arm configuration.",
        },
        {
          term: "Interface state",
          meaning:
            "The robot and planning-scene state passed between Task Constructor stages with properties needed by later stages.",
          physicalExample:
            "After attachment, the next stage receives a scene in which the cup moves with the tool instead of remaining on the table.",
        },
        {
          term: "Task solution",
          meaning:
            "A complete compatible chain of stage results that can be inspected and then explicitly submitted for execution.",
          physicalExample:
            "One solution connects the selected grasp, lift, transfer, place, and retreat trajectories while other candidate chains remain rejected.",
        },
      ],
      physicalExamples: [
        {
          title: "Remote-control nudges versus a delivery route",
          scenario:
            "Use arrow cards to nudge a toy car the final few centimetres into a drawn parking box, then compare that with writing the whole route around furniture before movement begins.",
          lookFor:
            "Local nudges correct nearby alignment but do not decide the global route or destination; Servo and a task planner solve different scales of the problem.",
        },
        {
          title: "Pick-and-place recipe cards",
          scenario:
            "Arrange cards labeled approach, close, verify, attach, lift, transfer, lower, open, verify release, detach, and retreat; remove or reorder one card.",
          lookFor:
            "A missing verification or early attachment creates an impossible scene story even when every individual motion card looks reasonable.",
        },
      ],
      workedExample: {
        title: "Bound a Servo stream and place it inside a staged task",
        setup:
          "A simulated final-alignment loop publishes tool-x increments of `0.002 m` at `50 Hz`. The application declares a `0.10 m/s` command limit and stops accepting a command after `0.20 s` without a fresh observation.",
        steps: [
          "Calculate the implied steady speed if every increment is applied: `0.002 m × 50 /s = 0.10 m/s`, exactly the declared command limit.",
          "Calculate how many update opportunities fit inside the freshness window: `50 /s × 0.20 s = 10` cycles.",
          "Do not replay the last increment for those ten cycles; check freshness before each update and begin the configured halt as soon as the observation contract expires.",
          "Express the increment in the named tool or camera frame, transform it at the correct time, and test that reversing the frame cannot silently reverse physical direction.",
          "Use MTC for the global approach and grasp-candidate stages, allow Servo only for the bounded final alignment state, then halt it before gripper close and scene attachment.",
          "Advance to attach and lift only when the simulated grasp-verification condition succeeds; otherwise preserve the object as world geometry and return a named task failure.",
        ],
        result:
          "The local stream reaches at most `0.10 m/s`, has a ten-cycle-long `0.20 s` freshness interval, and is contained inside a task whose grasp and scene transitions remain explicit.",
        takeaway:
          "Command arithmetic, freshness, frames, and stage ownership keep a helpful local Servo loop from becoming an unbounded substitute for task planning.",
      },
      handsOn: {
        setup:
          "Use the official MoveIt Servo and Task Constructor examples with the tutorial robot in simulation. Start with conservative scaling and keep hardware discovery disabled.",
        steps: [
          "Draw and then implement an MTC graph that names current state, open, approach, grasp generation, IK, close, attach, lift, transfer, place, open, detach, and retreat stages.",
          "Run nominal planning, inspect every candidate and failed stage, and save the complete solution graph before calling execution in simulation.",
          "Insert one impossible grasp orientation, one blocked approach, and one unreachable place pose; verify that each fault stops at a different named stage with a specific reason.",
          "Add a Servo final-alignment segment with explicit command frame, input type, scaling, update rate, freshness window, collision checking, singularity thresholds, and halt messages.",
          "Test a stale-command stream, wrong-frame command, near-singularity command, and approaching-obstacle command; capture output status and scaled or halted joint behavior for each.",
          "Execute one simulated complete task, joining MTC stage logs, Servo input and status, scene attachment evidence, controller results, and final object pose under one trial ID.",
        ],
        observe:
          "The staged task should expose where candidates disappear, while Servo should alter or halt local motion at configured limits without pretending to solve failed global stages.",
        doneWhen:
          "One repeatable simulation produces a complete pick-and-place trace plus four bounded Servo or stage failures, with no scene attachment before grasp verification.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_HMI, ROLE_VALIDATION],
        workExample:
          "Combine a camera-guided local alignment loop with a staged industrial pick task, expose Servo status and MTC stage failures to operators, and qualify frames, timeouts, collision scaling, scene transitions, and controller results.",
        interviewPrompt:
          "Contrast MoveIt Servo with global motion planning, then sketch a Task Constructor pick-and-place and identify where freshness, singularity, collision, grasp verification, attachment, and execution results belong.",
      },
      commonMistakes: [
        {
          mistake:
            "Using Servo as if repeated local commands guarantee a globally feasible route through clutter.",
          correction:
            "Use a global planner or staged task for route and task feasibility; reserve Servo for bounded local corrections with fresh feedback and explicit halt behavior.",
        },
        {
          mistake:
            "Assuming collision or singularity scaling is active and safety certified because Servo supports those features.",
          correction:
            "Inspect the actual parameters and status, test every boundary, keep the planning scene fresh, and retain independently validated protective stops for hardware.",
        },
        {
          mistake:
            "Attaching the object immediately after the close-gripper stage starts.",
          correction:
            "Wait for the declared simulated or hardware grasp evidence, then perform one traceable attach transition; otherwise fail the task with the object still in the world.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Which problem does MoveIt Servo solve that Task Constructor does not solve in the same way?",
          answer:
            "Servo turns frequent local feedback commands into bounded responsive motion, while Task Constructor searches and connects explicit stages of a larger manipulation task.",
        },
        {
          question:
            "Why must a Servo command name its frame and freshness rule?",
          answer:
            "Axes have different physical meanings in different frames, and an old command can keep moving the arm after the observation or operator intent that created it is no longer valid.",
        },
        {
          question:
            "What should happen when no grasp candidate can pass the MTC IK stage?",
          answer:
            "The task should return an inspectable stage failure, keep the object as world geometry, avoid gripper or attachment claims, and choose an explicit retry or rejection policy.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A grasp-stage graph with world-to-attached scene transitions and one bounded Servo alignment segment is necessary to make task ordering and interface-state relationships visible.",
      },
    },
    {
      dayId: 83,
      mentalModel:
        "A useful grasp balances squeeze, friction, object strength, and measured contact, while compliant control decides how motion should yield when the world pushes back.",
      explanation: [
        "A two-finger grasp works through contact geometry and friction. Each finger supplies normal force into the object; friction resists sliding along the surface. In a deliberately simplified opposing-finger model, tangential capacity is about `2μN`, where `μ` is the friction coefficient and `N` is normal force from each finger. Real grasps also depend on contact location, shape, torque, surface variation, acceleration, finger compliance, and safety margin, so this classroom bound is not a commanded force.",
        "A force-torque sensor reports a wrench: three force components and three torque components in a named frame at a time. Before using it, tare the bias, account for tool and payload weight, preserve units, watch saturation and noise, and transform the wrench correctly when the control frame differs from the sensor frame. A nonzero reading may be gravity, cable load, drift, or contact; a threshold without those checks is not contact evidence.",
        "Impedance and admittance describe opposite input-output choices. An impedance controller turns motion error into force-like behavior, often pictured as a virtual spring and damper. An admittance controller measures force and commands motion that yields, often using `F = Ma + Dv + K(x - x_d)`. The ros2_control admittance interface requires kinematics, force-torque data, frames, gravity compensation, selected axes, and mass, damping, and stiffness settings. Suitability depends on the robot's low-level control and validated dynamics.",
        "Contact control can become unstable or damaging through delay, noise, a wrong wrench frame, bad gravity compensation, excessive stiffness, sensor saturation, or rigid environmental contact. Keep today's work in simulation or use an unpowered spring and scale. Any powered-arm trial needs independent force, speed, workspace, timeout, retreat, and protective-stop limits plus a hardware-specific review; MoveIt planning and a force threshold do not provide that approval.",
      ],
      keyTerms: [
        {
          term: "Normal force",
          meaning:
            "The contact force directed into a surface, perpendicular to the local contact plane.",
          physicalExample:
            "Two gripper pads squeeze opposite sides of a paper cup without intentionally sliding along them.",
        },
        {
          term: "Friction coefficient",
          meaning:
            "A simplified ratio relating normal force to the maximum tangential friction force before sliding in a chosen model.",
          physicalExample:
            "Rubber pads usually hold a dry object with less squeeze than smooth hard plastic under similar conditions.",
        },
        {
          term: "Wrench",
          meaning:
            "A six-component physical quantity containing three forces and three torques, expressed in a declared coordinate frame.",
          physicalExample:
            "A wrist sensor reports push in tool z plus twisting torque around tool z.",
        },
        {
          term: "Impedance control",
          meaning:
            "A control approach that makes motion error produce a force-like response according to chosen stiffness and damping behavior.",
          physicalExample:
            "A virtual spring pushes the tool back toward its requested position when contact displaces it.",
        },
        {
          term: "Admittance control",
          meaning:
            "A control approach that converts measured interaction force into commanded motion through a virtual dynamic model.",
          physicalExample:
            "A guided handle moves farther in the direction a person pushes and settles when the push stops.",
        },
      ],
      physicalExamples: [
        {
          title: "Hold a paper cup without crushing it",
          scenario:
            "Pinch an empty paper cup gently between two fingers, add a few dry beans, then compare slipping under too little squeeze with visible denting under too much.",
          lookFor:
            "Useful grip lies between slip and damage; added payload and acceleration reduce the margin even when the finger position stays unchanged.",
        },
        {
          title: "Spring-scale compliance",
          scenario:
            "Pull an unpowered spring or elastic band against a kitchen scale by measured distances and release it without attaching any motor.",
          lookFor:
            "Force rises with displacement, while damping-like friction changes how quickly it settles; the relationship resembles a deliberately limited virtual spring-damper.",
        },
      ],
      workedExample: {
        title: "Check an idealized grasp margin without calling it safe",
        setup:
          "Two opposing pads have an estimated `μ = 0.40` and each applies `N = 10 N`. The object mass is `0.50 kg` and a planned upward acceleration is `2.0 m/s²`. Ignore geometry and rotation only for this screening calculation.",
        steps: [
          "Calculate ideal tangential capacity: `2μN = 2 × 0.40 × 10 = 8.0 N`.",
          "Calculate weight: `mg = 0.50 × 9.81 = 4.905 N` downward.",
          "Calculate extra inertial force for the upward acceleration: `ma = 0.50 × 2.0 = 1.0 N`.",
          "Add the simplified demand: `4.905 + 1.0 = 5.905 N`.",
          "Calculate arithmetic margin: `8.0 - 5.905 = 2.095 N`, or a capacity-to-demand ratio of about `1.35`.",
          "Reject this as a final force command because uncertain friction, off-centre torque, uneven pads, object strength, vibration, and required safety margin were not modeled.",
        ],
        result:
          "The idealized numbers exceed the simplified vertical demand by `2.095 N`, but they do not establish a safe or reliable real grasp.",
        takeaway:
          "A friction calculation is a screening relationship; measured trials, uncertainty, object damage limits, and independent safety constraints decide real use.",
      },
      handsOn: {
        setup:
          "Use an unpowered spring-scale arrangement or a manipulation simulator with a virtual force-torque sensor. Do not enable a powered arm or gripper.",
        steps: [
          "Declare sensor frame, control frame, force and torque units, sign directions, sample rate, tare method, payload, gravity compensation, filtering, saturation, and freshness checks.",
          "Collect unloaded readings, tare the bias, then add a known small load in one axis and verify sign, approximate magnitude, frame, and timestamp.",
          "Measure or simulate force at five displacements, calculate `k = F/x` where appropriate, and plot loading and unloading points rather than fitting one convenient sample.",
          "Configure a conservative simulated admittance axis with explicit virtual mass, damping, stiffness, speed, displacement, force, timeout, and retreat limits.",
          "Inject wrong frame, missing tare, delayed wrench, and excessive stiffness cases; save oscillation, drift, saturation, or rejection evidence without tuning around the faults.",
          "Write the hardware gate that would still be required: risk review, approved limits, protective stop, clear workspace, observer, test fixture, and staged low-energy validation.",
        ],
        observe:
          "Correctly framed and tared data should follow the known load, while planted frame, bias, delay, or stiffness faults should produce distinct and rejectable symptoms.",
        doneWhen:
          "The artifact contains one verified wrench measurement, a displacement-force plot, a bounded simulated admittance response, four fault results, and an explicit powered-hardware blocker.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "Commission a wrist force-torque path, verify frames and payload compensation, tune a bounded simulated compliant insertion, and build fault tests that separate contact, bias, delay, saturation, and unstable control.",
        interviewPrompt:
          "Compare impedance with admittance, interpret a framed wrench, derive a simple grasp-friction bound, and list the evidence and independent safeguards required before powered contact testing.",
      },
      commonMistakes: [
        {
          mistake:
            "Treating every force-torque reading above zero as object contact.",
          correction:
            "Verify tare, payload gravity, frame, filtering, saturation, drift, cable loads, timestamp, and a task-specific threshold before classifying contact.",
        },
        {
          mistake:
            "Calling impedance and admittance two names for the same controller.",
          correction:
            "State the input-output direction: impedance maps motion error toward force-like response, while admittance maps measured force toward commanded motion.",
        },
        {
          mistake:
            "Using `2μN` as the commanded grasp force and proof of safety.",
          correction:
            "Treat it as an idealized bound, then include geometry, torque, dynamics, uncertainty, damage limit, trial evidence, and a conservative approved margin.",
        },
      ],
      checkQuestions: [
        {
          question:
            "What six values make up a force-torque wrench?",
          answer:
            "Three force components and three torque components, all meaningful only with their coordinate frame, units, time, and sensor-processing contract.",
        },
        {
          question:
            "What is the practical input-output difference between impedance and admittance?",
          answer:
            "Impedance uses motion error to create force-like response; admittance uses measured force to create motion response through a virtual dynamic model.",
        },
        {
          question:
            "Why is the simplified friction capacity not a safe gripper command?",
          answer:
            "It omits contact geometry, rotation, uneven pressure, changing surfaces, acceleration uncertainty, vibration, object strength, sensor error, and required safety margin.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A paired force diagram is needed to relate normal force and friction at the grasp to the mass-damping-stiffness relationship that governs compliant motion.",
      },
    },
    {
      dayId: 84,
      mentalModel:
        "An acceptance test is a locked obstacle course with a scoring rule, where correct rejection and safe recovery count as intended behavior rather than hidden failures.",
      explanation: [
        "A manipulation acceptance test begins before the first run. Freeze the robot and MoveIt configurations, object set, scene layouts, random seeds, perception inputs, start states, success tolerances, time budgets, and evidence paths. Include familiar, shifted, obstructed, and unreachable targets. Define which cases should place an object and which should reject safely. Changing a threshold after seeing results turns acceptance into tuning.",
        "Trace the complete chain under one trial ID: input observation and transform, scene version, grasp candidate, IK result, planning result, timed trajectory, controller outcome, contact or gripper evidence, attachment transition, place pose, release evidence, and recovery. A final object photo cannot identify whether perception, planning, grasp, transfer, or release caused a failure. Stage yields and explicit failure codes make repair work actionable.",
        "Fault trials test boundaries deliberately. Add a late obstacle, unreachable pose, blocked approach, stale Servo input, canceled execution, failed grasp verification, or force-limit event in simulation. The expected outcome may be a rejected target, halted command, detached-free scene state, or recovery to a known pose. An unreachable-object trial passes when the system rejects it within the bound and makes no unsafe motion; forcing every trial to move rewards the wrong behavior.",
        "Report counts and denominators, not adjectives. Overall placement success, grasp yield, conditional transfer yield, false accepts, safe-rejection rate, recovery rate, timing tail, and worst pose error answer different questions. Apply the predeclared gates and issue exactly PASS, NEEDS REVISION, or BLOCKED. A PASS is limited to the tested configuration and environment; simulation evidence does not authorize hardware deployment.",
      ],
      keyTerms: [
        {
          term: "Acceptance criterion",
          meaning:
            "A measurable threshold and decision rule declared before testing that determines whether a requirement passes.",
          physicalExample:
            "At least 18 of 20 placements, every fault halted safely, and zero false attachment transitions are required.",
        },
        {
          term: "Trial matrix",
          meaning:
            "A fixed table of test cases spanning nominal, boundary, and fault conditions with expected outcomes.",
          physicalExample:
            "Rows cover clear cups, shifted cups, obstructed cups, unreachable poses, cancellation, and stale commands.",
        },
        {
          term: "Stage yield",
          meaning:
            "The number of trials that pass one task stage divided by the trials eligible to reach that stage.",
          physicalExample:
            "Eighteen successful places among nineteen verified grasps gives conditional place yield `18/19`.",
        },
        {
          term: "Safe rejection",
          meaning:
            "A bounded refusal that reports why the task cannot continue and avoids unauthorized motion or scene claims.",
          physicalExample:
            "The planner rejects a cup inside a shelf wall and the gripper never closes or attaches it.",
        },
        {
          term: "Traceability",
          meaning:
            "The ability to connect a requirement and trial input to exact configuration, logs, artifacts, stage outcomes, and final decision.",
          physicalExample:
            "Trial `W12-017` links its scene file, seed, trajectory, controller result, video interval, failure code, and matrix row.",
        },
        {
          term: "Failure taxonomy",
          meaning:
            "A stable set of specific failure categories used to count where and why tasks stop.",
          physicalExample:
            "No target, stale transform, no IK, plan timeout, tracking abort, grasp miss, slip, and release error remain separate categories.",
        },
      ],
      physicalExamples: [
        {
          title: "Parcel inspection line",
          scenario:
            "Imagine twenty labeled parcels sent through the same inspection stations, with damaged parcels expected to be rejected before packing rather than forced through.",
          lookFor:
            "Each station records its own outcome, and a correct early rejection is different from a parcel disappearing without a record.",
        },
        {
          title: "Science-fair scoring rubric",
          scenario:
            "Write the scoring thresholds for accuracy, repeatability, and safe failure before judging demonstrations, then refuse to award extra points for an unplanned lucky result.",
          lookFor:
            "A frozen rubric prevents the judge from moving the pass line after seeing attractive or disappointing outputs.",
        },
      ],
      workedExample: {
        title: "Apply frozen gates to twenty manipulation trials",
        setup:
          "A simulated matrix has 20 trials. Grasp verification succeeds in 19; final placement succeeds in 18. Five planted fault trials all halt or reject as expected, with zero false attachments and zero forbidden motions. Frozen gates require at least 90% overall placement, 100% expected fault handling, and zero false attachments or forbidden motions.",
        steps: [
          "Calculate overall placement success: `18 / 20 × 100% = 90%`.",
          "Calculate grasp success: `19 / 20 × 100% = 95%`, showing one failure occurred before verified attachment.",
          "Calculate placement yield after a verified grasp: `18 / 19 × 100% ≈ 94.7%`, showing one later transfer or release failure.",
          "Calculate planted-fault handling: `5 / 5 × 100% = 100%`.",
          "Apply zero-tolerance gates: false attachments are `0` and forbidden motions are `0`, so neither disqualifies the result.",
          "Issue PASS for this frozen simulation matrix because every declared gate is met, while recording that the overall result sits exactly on its minimum and does not approve powered hardware.",
        ],
        result:
          "The example passes its declared simulation criteria at 90% placement, 100% fault handling, and zero prohibited state or motion events.",
        takeaway:
          "A defensible verdict follows frozen denominators and zero-tolerance hazards, then states exactly which environment and configuration the verdict covers.",
      },
      handsOn: {
        setup:
          "Use the complete simulated Week 12 pipeline and a clean output directory. Preserve the final configuration before running the acceptance matrix.",
        steps: [
          "Write requirements and frozen gates for perception freshness, scene correctness, planning, trajectory limits, grasp verification, placement tolerance, cancellation, force or Servo halt, and prohibited events.",
          "Create twenty deterministic rows covering nominal objects, shifted targets, obstacles, unreachable poses, narrow clearance, grasp misses, stale commands, cancellation, and contact-limit events.",
          "Run rows sequentially without changing code or thresholds; assign one trial ID and save input, configuration hashes, scene, seed, logs, trajectory, stage statuses, timing, and final object pose.",
          "For every fault row, verify the expected bounded rejection or recovery plus the absence of gripper, attachment, or motion actions that were not authorized by prior evidence.",
          "Calculate stage counts, overall and conditional rates, false accepts, safe-rejection and recovery rates, timing tail, worst pose error, and failure-category totals with denominators.",
          "Publish the matrix, evidence index, largest remaining failure, and one PASS, NEEDS REVISION, or BLOCKED verdict; if gates fail, name the first causal repair and rerun the complete frozen matrix afterward.",
        ],
        observe:
          "Nominal rows should complete the full chain, fault rows should stop at their intended boundary, and every final count should trace back to an immutable trial record.",
        doneWhen:
          "Twenty rows have complete evidence, every injected fault has its expected outcome checked, all metrics can be recalculated, and the verdict follows the predeclared gates without exception.",
      },
      jobConnection: {
        roles: [
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_HMI,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "Own a manipulation release gate by freezing scenarios and configurations, automating stage-level evidence, testing cancellation and fault recovery, and giving operators and developers a traceable acceptance verdict.",
        interviewPrompt:
          "Design a twenty-trial MoveIt manipulation acceptance matrix, define stage metrics and zero-tolerance events, and explain why correct unreachable-target rejection and action cancellation are acceptance cases.",
      },
      commonMistakes: [
        {
          mistake:
            "Changing timeouts, tolerances, or success definitions after viewing the trial results.",
          correction:
            "Freeze criteria and configuration before the run; treat any tuning as a new candidate that requires the complete matrix again.",
        },
        {
          mistake:
            "Counting a green plan, close command, or attached scene object as a successful placement.",
          correction:
            "Require the full evidence chain through controller result, grasp verification, carried-object state, measured placement, release verification, and final scene state.",
        },
        {
          mistake:
            "Marking an unreachable-target rejection as a task failure because no motion occurred.",
          correction:
            "Compare with the row's expected outcome; timely bounded rejection without unauthorized motion is correct behavior and should be scored separately from placement.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Why must acceptance thresholds be frozen before the twenty trials?",
          answer:
            "Otherwise observed results influence the pass rule, turning an independent release decision into tuning and making the verdict difficult to reproduce.",
        },
        {
          question:
            "Why report both `18/20` placement success and `18/19` placement-after-grasp yield?",
          answer:
            "The first describes end-to-end outcome, while the second isolates later transfer or release behavior among trials that actually achieved a verified grasp.",
        },
        {
          question:
            "What evidence makes an unreachable-object trial a correct safe rejection?",
          answer:
            "The target and scene are recorded, the expected validity or planning boundary rejects within its limit, no unauthorized motion or attachment occurs, and the terminal reason is traceable.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The frozen twenty-row matrix, stage-yield calculations, evidence index, and failure taxonomy are the acceptance instruments; another diagram would not improve the decision.",
      },
    },
  ],
} satisfies ChapterContent;
