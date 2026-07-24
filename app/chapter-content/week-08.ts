import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION = "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION = "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";

export const week08Content = {
  week: 8,
  title: "Map, localize, navigate, and recover with Nav2",
  purpose:
    "Turn the simulated mobile robot from Week 7 into an inspectable navigation system: build and save a map, estimate the robot pose, represent safe travel space, plan and follow paths, handle interruption and blockage, and prove the result with repeatable failure trials instead of one lucky video.",
  prerequisites: [
    "Run the Week 7 differential-drive robot in Gazebo with simulation time, wheel odometry, a correctly mounted lidar, and a connected map→odom→base_link→laser frame tree.",
    "Use ROS 2 topics, actions, parameters, lifecycle states, rosbag2, RViz, and timestamps at a beginner level.",
    "Read metres, seconds, radians, rates, percentages, and a simple x-y coordinate pair.",
    "Keep all exercises in simulation; physical mobile-base testing requires a clear area, speed limits, independent stopping controls, and supervised commissioning.",
  ],
  outcomes: [
    "Explain why map, odom, and base_link have different jobs and identify which component should publish each transform.",
    "Build a 2D occupancy map with SLAM Toolbox, recognize scan-matching and loop-closure symptoms, save the result, and localize in it with AMCL.",
    "Configure global and local layered costmaps using a measured footprint, live obstacle observations, inflation, unknown-space policy, and keepout zones.",
    "Trace one NavigateToPose goal through localization, the global planner, optional smoother, local controller, progress and goal checks, and its action result.",
    "Read a Nav2 behavior tree, distinguish a targeted recovery from blind retry, and verify lifecycle startup and shutdown before accepting goals.",
    "Measure cancellation-to-stop latency, obstruction handling, collision-monitor behavior, replanning, retry budgets, and safe failure outcomes.",
    "Evaluate navigation with frozen scenarios, denominators, path and timing metrics, localization evidence, recovery metrics, and an honest failure taxonomy.",
    "Ship a repeatable Nav2 and SLAM phase demo that another engineer can launch, inspect, interrupt, and judge against declared acceptance criteria.",
  ],
  jobTargets: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_HMI, ROLE_FLEET],
  sources: [
    {
      label: "Nav2 — Navigation Concepts",
      url: "https://docs.nav2.org/concepts/",
      useFor:
        "The official mental model for map→odom→base_link, planners, controllers, behaviors, lifecycle-managed servers, and navigation application structure.",
    },
    {
      label: "Nav2 — Mapping and Localization setup",
      url: "https://docs.nav2.org/setup_guides/sensors/mapping_localization.html",
      useFor:
        "Official setup guidance connecting LaserScan data, SLAM Toolbox, AMCL, occupancy maps, and the layered Nav2 costmaps.",
    },
    {
      label: "Nav2 — Costmap 2D configuration",
      url: "https://docs.nav2.org/configuration/packages/configuring-costmaps.html",
      useFor:
        "Footprints, resolution, global and local frames, rolling windows, static and obstacle layers, inflation, filters, update rates, and transform tolerances.",
    },
    {
      label: "SLAM Toolbox — maintained ROS 2 repository",
      url: "https://github.com/SteveMacenski/slam_toolbox",
      useFor:
        "The maintained description of 2D scan matching, pose graphs, loop closure, map serialization, mapping modes, and pose-graph localization.",
    },
    {
      label: "Cartographer ROS — configuration reference",
      url: "https://google-cartographer-ros.readthedocs.io/en/latest/configuration.html",
      useFor:
        "A primary reference for comparing another pose-graph SLAM system's frame and publication contracts; the exercises continue to use SLAM Toolbox for one coherent beginner stack.",
    },
  ],
  days: [
    {
      dayId: 50,
      mentalModel:
        "Navigation needs two kinds of location at once: odom is a smooth pencil line that drifts, while map is the corrected floor plan that may move that whole pencil line when better evidence arrives.",
      explanation: [
        "A robot cannot plan to “the far shelf” until it can answer two questions: what does the floor look like, and where am I on that floor? A two-dimensional occupancy map divides the floor into small square cells. Each cell records free space, occupied space, or unknown space. The map has a resolution such as 0.05 m per cell and an origin that connects cell indexes to coordinates in the map frame. A map is a measurement product, not permanent truth: glass, shiny surfaces, narrow chair legs, moved pallets, and missing lidar coverage can make cells wrong or unknown.",
        "The frame chain `map→odom→base_link` separates global correction from smooth local motion. Wheel odometry or a local state estimator normally publishes `odom→base_link`. It changes smoothly enough for control, but wheel slip and small calibration errors make it drift. SLAM or a localization system normally publishes `map→odom`. That transform corrects accumulated drift and can jump when a loop closure or new localization evidence changes the global estimate. Nav2 combines both transforms to learn the robot pose in `map` without forcing the controller to follow a jumping local signal.",
        "SLAM means simultaneous localization and mapping: while the robot moves through an unknown space, it estimates both its path and the map. SLAM Toolbox pairs each lidar scan with an odometry-based pose, aligns scans, adds constraints to a pose graph, looks for revisited places, and optimizes the graph when it finds a loop closure. A loop closure can straighten a corridor that slowly bent in the draft map. That correction is useful, but it also changes `map→odom`, so logs and visualizations must keep the frame and timestamp attached to every pose.",
        "After a map is approved and saved, AMCL can estimate the robot pose inside that static map. Imagine many tiny candidate robots, called particles, spread around the floor plan. Each candidate predicts what the lidar should see. Candidates that agree better with the real scan receive more weight; motion and resampling move the cloud toward likely poses. AMCL needs a reasonable motion model, scan model, initial-pose policy, and correct `map`, `odom`, `base_link`, and scan frames. A tight-looking particle cloud is not proof of truth if the map, transform, or sensor timestamps are wrong.",
        "Use one authoritative component for `map→odom`. For this chapter, use SLAM Toolbox while building the map, then stop that mapping instance and use AMCL with the saved map for normal navigation. SLAM Toolbox also has its own pose-graph localization mode, and Cartographer is another SLAM system with a similar frame contract, but mixing several active global-pose publishers creates conflicting transforms. Depth comes from making one stack observable and reliable before comparing alternatives.",
      ],
      keyTerms: [
        {
          term: "Occupancy grid",
          meaning:
            "A floor map split into equal cells that represent free, occupied, or unknown space.",
          physicalExample:
            "At 0.05 m resolution, a 1 m-wide corridor spans about 20 grid cells.",
        },
        {
          term: "map frame",
          meaning:
            "A globally useful frame tied to the saved environment, where localization corrections are allowed.",
          physicalExample:
            "A loading bay remains near the same map coordinate even after wheel odometry drifts.",
        },
        {
          term: "odom frame",
          meaning:
            "A locally smooth frame produced by odometry; it is useful for short-term control but may drift away from the map.",
          physicalExample:
            "The wheels report a smooth 10 m trip even though slip makes the estimate end 0.4 m from the true mark.",
        },
        {
          term: "SLAM",
          meaning:
            "The task of estimating a robot path and building or refining a map at the same time.",
          physicalExample:
            "A rover uses wheel motion and lidar scans to draw an unfamiliar office while estimating its own route.",
        },
        {
          term: "AMCL",
          meaning:
            "A particle-filter localizer that estimates a robot pose in an existing static map.",
          physicalExample:
            "Hundreds of pose guesses compete until their predicted wall distances match the lidar scan.",
        },
        {
          term: "Loop closure",
          meaning:
            "Recognition that the robot has returned to a previously mapped place, adding a constraint that can correct accumulated drift.",
          physicalExample:
            "The two ends of a mapped corridor loop finally meet, causing the draft walls to align.",
        },
      ],
      physicalExamples: [
        {
          title: "Chalk line and printed floor plan",
          scenario:
            "A wheeled suitcase traces a smooth chalk line around a room, but the line gradually misses the printed floor-plan doorway because each wheel turn was estimated slightly wrong.",
          lookFor:
            "The continuous chalk line acts like odom. Moving the entire line until the doorway agrees acts like the map→odom correction; the suitcase does not physically teleport.",
        },
        {
          title: "Many guesses in a school corridor",
          scenario:
            "Several transparent cut-outs of a toy robot are placed at different points on a corridor plan, each with rays drawn toward nearby walls.",
          lookFor:
            "The cut-outs whose predicted wall distances disagree with the measured distances lose weight; repeated motion and scans concentrate the likely pose.",
        },
      ],
      workedExample: {
        title: "Combine a smooth odometry pose with a map correction",
        setup:
          "In an aligned, no-rotation teaching case, odometry says `base_link` is at (4.20, 1.00) m in `odom`. A localization update places the `odom` origin at (-0.70, 0.30) m in `map`.",
        steps: [
          "Name the relationships before touching the numbers: localization owns `map→odom`, while wheel odometry owns `odom→base_link`.",
          "Because this simplified case has aligned axes, add the x translations: x in map = -0.70 + 4.20 = 3.50 m.",
          "Add the y translations: y in map = 0.30 + 1.00 = 1.30 m.",
          "Report the answer as `base_link` at (3.50, 1.30) m in `map`; do not drop the frame or metre unit.",
          "Now suppose a loop closure changes only `map→odom` x from -0.70 to -0.85 m. The smooth odometry pose remains 4.20 m, but the corrected map x becomes 3.35 m.",
          "State the limitation: real transforms include rotation and timestamp, so tf2 must compose them; component-wise addition works only for this deliberately aligned example.",
        ],
        result:
          "The controller can keep using the smooth odometry history while global planning sees a corrected map pose.",
        takeaway:
          "The apparent global pose can change without corrupting the locally smooth motion estimate because the correction lives on a different transform edge.",
      },
      handsOn: {
        setup:
          "Use the working Week 7 Gazebo world, differential-drive robot, lidar, RViz, SLAM Toolbox, and rosbag2. Keep the real robot disconnected.",
        steps: [
          "Before mapping, inspect the frame tree and confirm one publisher owns `odom→base_link`, the laser has a time-valid path to `base_link`, and no node is already publishing `map→odom`.",
          "Launch SLAM Toolbox against the actual LaserScan topic, then drive the simulated robot slowly through the world while watching map cells, scan alignment, pose-graph growth, and transform age.",
          "Revisit one recognizable corridor or room to invite a loop closure; record a screenshot and the `map→odom` values before and after the correction.",
          "Save both the occupancy map metadata/image and the serialized pose graph, then record map resolution, origin, frame names, configuration version, and the bag used to create it.",
          "Stop the mapping instance, launch the saved map with AMCL, provide a deliberately approximate initial pose, and watch the particle cloud respond to motion and scans.",
          "Plant one fault at a time—wrong scan topic, stale transform, or a second `map→odom` publisher—and capture the observable symptom before repairing it.",
        ],
        observe:
          "A useful map has aligned repeated structures, explored free space, sensible unknown boundaries, and reproducible provenance; localization has a time-valid transform and scan agreement, not merely a moving icon.",
        doneWhen:
          "Another engineer can launch the bag or simulation, load the saved map, identify the publishers for both transform edges, initialize AMCL, and reproduce one documented mapping or localization fault.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Bring up an AMR localization stack at a customer site, determine whether a pose jump came from wheel odometry, scan timing, map quality, or the `map→odom` publisher, and leave a reproducible map provenance record.",
        interviewPrompt:
          "Explain why Nav2 needs both `map` and `odom`, who should publish each edge in `map→odom→base_link`, what changes during loop closure, and how you would diagnose a robot icon that jumps while wheel odometry stays smooth.",
      },
      commonMistakes: [
        {
          mistake: "Calling the occupancy image the real environment.",
          correction:
            "Treat it as a sampled, resolution-limited measurement with unknown regions, sensor blind spots, timestamped provenance, and a review process.",
        },
        {
          mistake: "Publishing `map→base_link` directly and skipping `odom` because the final pose appears correct.",
          correction:
            "Preserve `map→odom→base_link`: global localization corrects the first edge and locally smooth odometry owns the second.",
        },
        {
          mistake: "Running AMCL, SLAM Toolbox mapping, and another localizer as simultaneous `map→odom` authorities.",
          correction:
            "Select one global-pose authority for each operating mode and assert that the transform edge has only the intended publisher.",
        },
        {
          mistake: "Trusting a small AMCL particle cloud without checking scan alignment or external reference points.",
          correction:
            "Compare predicted and observed scans, transform freshness, known landmarks, and repeatable pose error; confidence can be wrong.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is `odom` allowed to drift but not jump?",
          answer:
            "It supports smooth short-term motion and control. Global drift is corrected through `map→odom` so the odometry history does not suddenly jump.",
        },
        {
          question: "What is SLAM estimating that AMCL normally does not?",
          answer:
            "SLAM estimates the map as well as the robot path, while AMCL estimates pose inside an already supplied static map.",
        },
        {
          question: "What should publish `map→odom` during AMCL navigation?",
          answer:
            "The selected localization system, such as AMCL, should be the one authority; wheel odometry continues to publish `odom→base_link`.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "The map→odom→base_link ownership chain, occupancy grid, SLAM correction, and AMCL particle hypotheses are spatial relationships that are clearer in one labelled map diagram.",
      },
    },
    {
      dayId: 51,
      mentalModel:
        "A costmap is transparent safety paper laid over the floor plan: one sheet holds the known building, another adds what sensors see now, and another spreads warning space around danger.",
      explanation: [
        "A saved occupancy map mostly represents lasting structure such as walls. A Nav2 costmap is an active decision surface used by planners and controllers. Its cells hold travel cost: free cells are cheap, lethal obstacles are forbidden, and intermediate values discourage travel near danger. The global costmap usually covers the larger planning area in the `map` frame. The local costmap is commonly a rolling window in `odom` that moves with the robot and reacts quickly to nearby sensor observations.",
        "Costmaps are layered so each source has a named job. A static layer brings in the saved map. An obstacle layer marks and ray-traces two-dimensional lidar observations; a voxel layer can handle three-dimensional observations before projecting relevant occupancy. An inflation layer raises cost around lethal obstacles. Marking says where a sensor saw an obstacle, while clearing uses observed free rays to remove old marks. Incorrect sensor frames, height limits, ranges, timestamps, or clearing rules can create ghost obstacles or erase real ones.",
        "The robot is not a point. Its footprint is the polygon occupied by the base, and footprint padding adds a small explicit margin. Nav2 can also use a radius for a circular robot, but a measured polygon better represents many rectangular AMRs. Inflation is related but different: it creates a graded cost field around obstacles so paths prefer clearance. Changing the footprint because the robot picked up a pallet changes collision geometry; changing inflation changes route preference. Neither value should be copied from a tutorial without measuring the robot and testing representative gaps.",
        "Keepout zones express a product rule such as “never enter the forklift charging area” even when the floor is physically empty. Nav2 applies them as costmap filters from a mask and filter information, separate from ordinary layers. A speed filter can similarly request lower speed in an area. Use the policy in both the global and local decision surfaces where appropriate; otherwise a global path may avoid a zone while local control still cuts across it, or the local costmap may reject a path the global planner keeps producing.",
        "Costmap tuning is a chain of evidence. Confirm the correct global frame and robot frame, map resolution and origin, footprint dimensions, sensor topics and frames, observation persistence, marking and clearing, update and publish rates, transform tolerance, unknown-space policy, and CPU load. Then test a doorway, a temporary obstacle, a removed obstacle, an unknown boundary, and a keepout area. A colorful RViz display is useful only when each color can be traced to its layer and physical meaning.",
      ],
      keyTerms: [
        {
          term: "Global costmap",
          meaning:
            "The larger travel-cost grid used mainly for route planning, usually referenced to the map frame.",
          physicalExample:
            "It contains the warehouse walls, mapped aisles, and a keepout mask around the forklift zone.",
        },
        {
          term: "Local costmap",
          meaning:
            "A smaller, frequently updated grid around the robot used mainly for local control and nearby obstacles.",
          physicalExample:
            "A trolley rolled into the next two metres appears in the robot-centred rolling window.",
        },
        {
          term: "Footprint",
          meaning:
            "The polygon or radius that represents the robot's occupied floor area for collision checks.",
          physicalExample:
            "A 0.70 m by 0.50 m rectangular base needs more side clearance than its centre point suggests.",
        },
        {
          term: "Inflation",
          meaning:
            "A graded region of higher cost around obstacles that encourages safer clearance.",
          physicalExample:
            "Cells beside a wall become increasingly expensive as the path gets closer to the wall.",
        },
        {
          term: "Keepout filter",
          meaning:
            "A spatial policy mask that marks places the navigation system must not use even if sensors report free floor.",
          physicalExample:
            "An AMR may not cross a human-only packing zone painted on the facility plan.",
        },
      ],
      physicalExamples: [
        {
          title: "Coin robot through a paper doorway",
          scenario:
            "A centre-line drawn through a paper doorway looks clear, but a coin placed on the line overlaps both doorposts.",
          lookFor:
            "The footprint converts a point path into an occupied area; padding and localization uncertainty reduce the usable gap further.",
        },
        {
          title: "Three sheets of tracing paper",
          scenario:
            "One transparent sheet shows walls, one shows a movable chair, and one shades warning bands around every obstacle.",
          lookFor:
            "The final cost is a layered combination. Removing the chair should clear only its live observation, not erase the wall sheet.",
        },
      ],
      workedExample: {
        title: "Decide whether a doorway has physical clearance",
        setup:
          "A doorway is 1.00 m wide. The rectangular robot is 0.55 m wide, and engineering requires 0.05 m footprint padding on each side.",
        steps: [
          "Write all widths in metres and distinguish total width from one-sided margin.",
          "Add both padding sides to the robot width: effective width = 0.55 + 2(0.05) = 0.65 m.",
          "Subtract from the doorway width: total remaining gap = 1.00 - 0.65 = 0.35 m.",
          "For a perfectly centred robot, divide that gap between two sides: 0.35 / 2 = 0.175 m per side.",
          "Compare 0.175 m with localization error, map error, door-frame irregularity, and the intended inflation-cost policy; geometric fit alone is not acceptance.",
          "Test the actual footprint polygon in the costmap and inspect the footprint collision result rather than shrinking inflation until a route appears.",
        ],
        result:
          "The padded body has 0.175 m nominal clearance per side when perfectly centred, but the passage is accepted only if measured uncertainty and control performance fit inside that remaining margin.",
        takeaway:
          "Footprint math answers whether the body can fit; inflation and operating rules decide whether the planner should prefer or reject that risk.",
      },
      handsOn: {
        setup:
          "Use the saved Week 8 map, Gazebo robot, lidar, RViz, and one version-controlled Nav2 parameter file. Do not change several parameters at once.",
        steps: [
          "Measure the simulated chassis corners relative to `base_link`, declare the footprint polygon in metres, and overlay the published footprint on the rendered robot.",
          "Display global and local costmaps separately in RViz, then identify the frame, size, resolution, update rate, and every enabled layer for each.",
          "Place a simulated box in the lidar field and trace the scan point into the obstacle layer; remove the box and verify ray-tracing clears the temporary mark within the declared policy.",
          "Drive toward a measured doorway and compare centre-line planning with full-footprint collision checking; record minimum nominal clearance and any oscillation.",
          "Add a keepout mask over a physically open patch and verify both global route choice and local controller behavior respect it.",
          "Plant one bad configuration—wrong sensor frame, oversized footprint, disabled clearing, or stale observation—and save before/after costmap evidence that explains the symptom.",
        ],
        observe:
          "Every occupied, inflated, unknown, and policy cell should have a traceable source; the costmaps should update fast enough for the controller without ghosting or excessive CPU load.",
        doneWhen:
          "The robot footprint matches the model, a temporary obstacle marks and clears predictably, the measured doorway decision is explainable, and a keepout zone is enforced by both planning layers.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Commission an AMR in aisles narrower than the lab, measure its real loaded footprint, tune sensor clearing and inflation, and prove that mapped walls, temporary stock, and customer keepout zones behave differently.",
        interviewPrompt:
          "A Nav2 robot refuses a doorway that appears wide enough, while another configuration clips a corner. Explain how you would separate footprint, padding, inflation, map resolution, localization error, and obstacle-layer evidence.",
      },
      commonMistakes: [
        {
          mistake: "Reducing the robot footprint until a desired path becomes valid.",
          correction:
            "Keep the footprint tied to measured occupied geometry; investigate map, localization, controller, and route constraints without lying about body size.",
        },
        {
          mistake: "Treating inflation radius as extra physical robot width.",
          correction:
            "Use footprint and padding for occupied geometry, then use inflation to shape cost and preferred clearance around lethal cells.",
        },
        {
          mistake: "Enabling keepout policy only on one costmap and assuming all navigation layers will obey it.",
          correction:
            "Apply and test policy on the relevant global and local costmaps so planning and immediate control do not disagree.",
        },
        {
          mistake: "Calling a cell stale or wrong without identifying which layer produced it.",
          correction:
            "Inspect layers separately and correlate cell changes with sensor data, transforms, marking, clearing, persistence, and filter masks.",
        },
      ],
      checkQuestions: [
        {
          question: "Why are global and local costmaps usually different?",
          answer:
            "The global map supports longer route planning in a stable frame, while the local rolling map updates nearby obstacles quickly for control.",
        },
        {
          question: "What is the difference between footprint padding and inflation?",
          answer:
            "Padding enlarges the geometry used for collision checking; inflation creates graded travel cost around obstacles to influence route clearance.",
        },
        {
          question: "Why can a keepout zone be necessary on physically empty floor?",
          answer:
            "Navigation must obey operational rules such as human-only or hazardous areas, not merely avoid objects that sensors can see.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "Layered static, obstacle, inflation, footprint, global/local window, and keepout geometry are easiest to compare as one validated map overlay.",
      },
    },
    {
      dayId: 52,
      mentalModel:
        "The planner chooses a useful road on the larger map; the controller repeatedly steers the real moving robot along that road using what it sees now.",
      explanation: [
        "A navigation goal is a pose, not just a point. It contains x and y position, orientation, frame, and timestamp or timing meaning. Nav2 commonly receives it through a long-running ROS 2 action such as NavigateToPose. The action can report feedback while work continues, accept cancellation, and return a structured result. Before planning, Nav2 needs an active lifecycle stack, a valid current pose, a goal that transforms into the global frame, and costmaps that are current.",
        "The planner server asks a selected planner plugin to compute a path from the current pose to the goal using the global environmental representation. Different planners fit different robot shapes and motion constraints. A grid planner for a circular differential-drive base and a kinematically feasible planner for a car-like base solve different problems. A returned path is a proposal: inspect frame, collision validity, length, curvature or heading changes, unknown-space policy, and whether it starts near the real current pose.",
        "A smoother may improve a rough path after planning, but it must preserve collision validity and the robot's motion limits. Smoothing is not the same as local control. The controller server runs repeatedly with the latest pose and local costmap, chooses a feasible command that follows the path, and reports progress. Nav2 calls these components controller plugins; some older material calls them local planners. Beneath Nav2, the base driver and motor controllers still convert body velocity into wheel behavior.",
        "Goal and progress checkers define observable completion and lack of progress. A goal checker may accept position and orientation within declared tolerances rather than demand impossible exact equality. A progress checker can detect that the robot has not moved enough within a time allowance. These policies influence results and recovery, so record them with planner and controller parameters. A controller that stops near the target is not successful until the action reaches the intended terminal state and the final observed pose satisfies the rule.",
        "Planner and controller rates express different work. Global planning may run when a goal arrives or periodically for replanning; control runs much faster because nearby conditions and tracking error change continuously. More frequency is not automatically better: each cycle needs fresh transforms and costmaps and must finish before its next deadline. Measure compute time, command age, path age, and missed cycles under the same simulation load used for evaluation.",
      ],
      keyTerms: [
        {
          term: "Goal pose",
          meaning:
            "The requested final position and orientation together with its coordinate frame.",
          physicalExample:
            "A delivery robot must stop at x=4.2 m, y=1.8 m in `map` and face the shelf.",
        },
        {
          term: "Global planner",
          meaning:
            "A component that computes a collision-valid path from current pose to goal using a larger environmental model.",
          physicalExample:
            "It chooses the east aisle because a permanent wall blocks the direct line.",
        },
        {
          term: "Controller",
          meaning:
            "A frequently running component that uses current state and nearby obstacles to produce feasible commands for following a path.",
          physicalExample:
            "It slows and steers around a trolley that entered the local costmap.",
        },
        {
          term: "Smoother",
          meaning:
            "An optional component that improves path shape while maintaining required feasibility and collision checks.",
          physicalExample:
            "It rounds a stair-step grid path so the base does not command a sharp heading change at every cell.",
        },
        {
          term: "Goal checker",
          meaning:
            "The rule that decides whether the final observed pose is close enough to the requested goal.",
          physicalExample:
            "A docking approach may require tighter angle tolerance than a hallway waypoint.",
        },
        {
          term: "Progress checker",
          meaning:
            "A rule that detects whether the robot has moved enough within a configured time window.",
          physicalExample:
            "Wheel commands continue for ten seconds, but the base position changes by only one centimetre.",
        },
      ],
      physicalExamples: [
        {
          title: "Cycling route and handlebars",
          scenario:
            "A map application chooses streets for a trip, while the rider continuously turns the handlebars and brakes based on the current lane and traffic.",
          lookFor:
            "Route choice and moment-to-moment steering solve different time scales; a good street route does not guarantee safe control.",
        },
        {
          title: "Tape path for a toy car",
          scenario:
            "A curved tape line crosses a floor, and a child repeatedly adjusts a toy car to stay near it while someone moves a small box nearby.",
          lookFor:
            "The tape is the global path. Repeated steering uses live error and obstacles; picking a new tape route is replanning.",
        },
      ],
      workedExample: {
        title: "Build an honest time budget for one navigation goal",
        setup:
          "A planner returns a 7.2 m collision-valid path in 0.11 s. Smoothing takes 0.02 s. The configured average travel speed for this scenario is 0.40 m/s, and the controller runs at 20 Hz.",
        steps: [
          "Compute the ideal travel time along the actual path: 7.2 m / 0.40 m/s = 18.0 s.",
          "Add one-time pre-motion computation: 0.11 s + 0.02 s = 0.13 s.",
          "Compute the controller period: 1 / 20 Hz = 0.05 s, or 50 ms between planned command updates.",
          "Do not multiply 18 s by the controller rate; the 360 control cycles occur during travel rather than adding 360 separate travel times.",
          "Declare additional observed categories separately: startup wait, turns and acceleration, obstacle delay, recovery, and final goal-settling time.",
          "After the run, compare observed total with 18.13 s and attribute the difference using timestamps instead of calling all extra time 'Nav2 overhead'.",
        ],
        result:
          "The ideal lower-bound estimate is 18.13 s before acceleration, turning, dynamic obstacles, goal settling, or recovery, while each controller cycle has a 50 ms timing budget.",
        takeaway:
          "A useful performance budget separates one-time planning, concurrent control cadence, physical travel, and exceptional delay.",
      },
      handsOn: {
        setup:
          "Use the localized Gazebo robot and validated costmaps. Keep one world, start pose, goal pose, seed, and Nav2 parameter version fixed.",
        steps: [
          "Send one NavigateToPose goal and record its exact pose, frame, planner ID, controller ID, start acceptance, feedback, terminal result, and final observed pose.",
          "Display the raw global path, any smoothed path, local costmap, footprint, and executed odometry trail with distinct labels rather than identical colors.",
          "Measure planner duration, path length, controller frequency, command age, total goal time, and final position and yaw error.",
          "Swap only the planner plugin or its relevant configuration while holding the controller and scenario fixed; compare path feasibility, length, compute time, and shape.",
          "Swap only the controller while holding the planner and path scenario fixed; compare tracking error, oscillation, minimum clearance, and completion.",
          "Plant one wrong goal frame or impossible goal and verify the system returns a visible bounded failure rather than silently transforming or retrying forever.",
        ],
        observe:
          "The planner should own route generation, the controller should own repeated tracking commands, and the action trace should explain acceptance, progress, completion, cancellation, or failure.",
        doneWhen:
          "A reviewer can trace one goal from request through path and commands to terminal result, compare one controlled plugin change, and reproduce one invalid-goal failure.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_HMI],
        workExample:
          "Expose planner, controller, path age, goal tolerances, and action state in an operator tool, then diagnose whether a slow AMR route comes from path choice, local tracking, physical speed limits, or recovery.",
        interviewPrompt:
          "A global path looks valid, but the robot oscillates and never reports success near the goal. Separate planner, smoother, controller, progress checker, goal checker, and base-driver responsibilities and name the evidence you would collect.",
      },
      commonMistakes: [
        {
          mistake: "Calling the global planner the component that continuously steers the wheels.",
          correction:
            "The planner produces a path; the controller repeatedly computes body commands from live state, and lower-level drivers actuate the wheels.",
        },
        {
          mistake: "Comparing two planners while also changing controller, costmap, start pose, and goal.",
          correction:
            "Freeze the scenario and all other components so the planner change has an interpretable effect.",
        },
        {
          mistake: "Declaring success because the base looks close to the marker in RViz.",
          correction:
            "Require the correct action terminal state plus measured final position and orientation under the declared goal-checker tolerance.",
        },
        {
          mistake: "Increasing control frequency without checking compute deadline or data freshness.",
          correction:
            "Measure each cycle, transform and costmap age, command latency, and missed periods under representative load.",
        },
      ],
      checkQuestions: [
        {
          question: "What does the global planner return?",
          answer:
            "A path or route proposal from current pose to goal, expressed in a frame and checked against the configured global representation.",
        },
        {
          question: "Why does the controller need the local costmap after a path exists?",
          answer:
            "It must compute feasible current commands while accounting for tracking error and obstacles that can change near the robot.",
        },
        {
          question: "What proves that a NavigateToPose goal completed?",
          answer:
            "The action reaches the intended terminal result and the observed final pose satisfies the declared goal-checking rule.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "The goal→global path→optional smoothing→repeated local control→base→observed result pipeline has distinct owners and rates that a labelled flow diagram makes immediately testable.",
      },
    },
    {
      dayId: 53,
      mentalModel:
        "A behavior tree is a visible rulebook that keeps asking, “Is this step done, still running, or failed, and which allowed branch comes next?”",
      explanation: [
        "Nav2 is a group of modular servers, not one giant navigate function. The Behavior Tree Navigator coordinates those servers for tasks such as NavigateToPose. A behavior-tree node returns one of three important statuses when ticked: Success, Failure, or Running. Control nodes decide how child statuses are combined. A Sequence normally advances when a child succeeds, while a Fallback tries another child when one fails. The exact tree and plugin definitions matter more than the labels drawn in a simplified diagram.",
        "Planning and following are often action nodes inside the tree. Conditions can ask whether the goal changed, a path is valid, or some other requirement holds. Decorators can limit rate, repeat, retry, or transform a child's result. Blackboard entries carry typed data such as the goal and path between nodes. A behavior tree does not make a bad planner safe or repair stale transforms; it makes orchestration, branches, and retry policy explicit enough to inspect and test.",
        "A recovery should target a diagnosed class of failure. Clearing a local costmap may help when a temporary bad observation remains, but it is a poor response to a real wall or wrong transform. Waiting may help a moving person pass. Spinning can gather lidar coverage when the space is clear enough. Backing up may leave a trapped pose only when rear clearance is verified. Replanning can use a changed world model. Each behavior needs preconditions, timeout, retry budget, observable outcome, and a safe final failure path.",
        "Nav2 servers are managed lifecycle nodes. They move through states such as unconfigured, inactive, active, and finalized, with configure, activate, deactivate, cleanup, and shutdown transitions. Configuration can allocate resources and validate parameters without accepting active work. Activation starts the operational interfaces. The lifecycle manager brings related servers up and down in an intended order and uses bonds to notice loss of a managed server. A node process merely existing does not mean it is ready to receive goals.",
        "Production application logic belongs above raw navigation primitives. A fleet mission may check battery, request a door, navigate through a zone, verify arrival, and report a durable mission result. Nav2 behavior trees can be customized or embedded in higher-level orchestration, but business retries and navigation recoveries should not multiply each other without a shared budget. One mission ID, one current owner, and correlated tree transitions keep the robot and backend from issuing duplicate work.",
      ],
      keyTerms: [
        {
          term: "Behavior tree",
          meaning:
            "A tree of control and task nodes whose statuses decide which allowed work runs next.",
          physicalExample:
            "Plan a path; if planning succeeds, follow it; if a recoverable failure occurs, perform one checked recovery and try again.",
        },
        {
          term: "Tick",
          meaning:
            "One request for a behavior-tree node to update and return Success, Failure, or Running.",
          physicalExample:
            "Following the path returns Running on many ticks until the goal is reached or an error occurs.",
        },
        {
          term: "Fallback",
          meaning:
            "A control rule that tries a later child when an earlier child fails, according to the tree's semantics.",
          physicalExample:
            "If the first planning attempt fails, a bounded recovery branch may run before the tree returns failure.",
        },
        {
          term: "Blackboard",
          meaning:
            "Shared typed data used by behavior-tree nodes, such as the current goal, path, or error code.",
          physicalExample:
            "ComputePathToPose writes a path that FollowPath later reads.",
        },
        {
          term: "Managed lifecycle",
          meaning:
            "Explicit node states and transitions that separate construction, configuration, active operation, cleanup, and shutdown.",
          physicalExample:
            "A controller server loads its plugin while configuring but accepts control work only after activation.",
        },
        {
          term: "Recovery budget",
          meaning:
            "A declared limit on how many recovery attempts or how much recovery time a goal may use.",
          physicalExample:
            "One costmap clear and one replan are allowed before the task fails and requests an operator.",
        },
      ],
      physicalExamples: [
        {
          title: "Blocked school route rulebook",
          scenario:
            "A child follows written rules: walk to the gate; if construction blocks it, check the side gate once; if both are blocked, return and report failure.",
          lookFor:
            "The fallback is bounded and visible. “Keep trying something” is not an acceptable branch.",
        },
        {
          title: "Workshop machine startup",
          scenario:
            "A machine can be assembled, configured, and inspected while inactive before the enable key permits operation.",
          lookFor:
            "Process alive, configured, and operationally active are different states; startup order and failed checks matter.",
        },
      ],
      workedExample: {
        title: "Trace one bounded navigation recovery",
        setup:
          "A tree computes a path, follows it, and allows one contextual recovery attempt. A temporary bad lidar mark makes FollowPath fail, but the real corridor is clear in the frozen simulation case.",
        steps: [
          "Tick the planning branch: the planner returns Success and places a valid path on the blackboard.",
          "Tick FollowPath repeatedly: it returns Running until the stale local obstacle causes a controller failure with a recorded error code.",
          "Enter the recovery branch only because this error class and current sensor evidence allow it; increment the shared recovery count from 0 to 1.",
          "Clear the affected local costmap region, wait for a fresh scan and transform, then verify that the obstacle source no longer reports the mark.",
          "Recompute the path and follow it; if the goal checker passes, the subtree returns Success with one recovery recorded.",
          "If the same fault happens again, the budget is exhausted, so the tree returns Failure and requests the defined operator or mission-level response instead of clearing forever.",
        ],
        result:
          "The goal succeeds only after a targeted, observable, one-attempt recovery; a repeated fault becomes a bounded terminal failure.",
        takeaway:
          "Recovery is an engineered branch with evidence and a budget, not a loop that hides the original error.",
      },
      handsOn: {
        setup:
          "Use the localized Gazebo stack, Groot or readable behavior-tree XML, lifecycle commands, and structured Nav2 logs. Keep the world and goal fixed.",
        steps: [
          "Open the actual behavior-tree XML used by NavigateToPose and mark the planner action, controller action, conditions, recovery nodes, retry controls, and blackboard path.",
          "Launch Nav2 without autostart, inspect every managed node state, and prove a navigation goal is rejected or held until the required servers become active.",
          "Activate through the lifecycle manager, run one nominal goal, and correlate tree node statuses with planner, controller, and action timestamps.",
          "Inject one repeatable stale local obstacle or controller failure and trace the exact error into the chosen recovery branch and retry counter.",
          "Change only the recovery budget to zero, rerun the same fault, and confirm the system now reaches the expected terminal failure without the recovery action.",
          "Deactivate one managed server or end its process in simulation, observe bond/lifecycle response, and verify commands stop and the goal cannot be reported as normal success.",
        ],
        observe:
          "Tree status, action result, lifecycle state, recovery count, and command output should tell one consistent story from startup through failure or success.",
        doneWhen:
          "A reviewer can point to the exact XML branch taken in nominal and injected-failure runs, explain the retry limit, and reproduce lifecycle gating of navigation work.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_FLEET],
        workExample:
          "Customize an AMR navigation tree so obstruction, localization loss, door timeout, and operator escalation have separate bounded responses, then correlate those transitions with one fleet mission ID.",
        interviewPrompt:
          "A robot repeatedly clears both costmaps and retries the same blocked route. Explain how behavior-tree statuses, error codes, lifecycle state, recovery preconditions, and a shared retry budget should change that design.",
      },
      commonMistakes: [
        {
          mistake: "Reading a behavior tree once from top to bottom as if it were a simple script.",
          correction:
            "Trace ticks and returned statuses; Running nodes and control-node semantics determine what is revisited and when.",
        },
        {
          mistake: "Clearing costmaps for every navigation failure.",
          correction:
            "Use the error and current evidence to select a targeted recovery; never erase a real obstacle merely to make a path appear.",
        },
        {
          mistake: "Assuming a launched process is ready because it appears in the ROS graph.",
          correction:
            "Check managed lifecycle state and required bonds, interfaces, transforms, and costmaps before accepting a goal.",
        },
        {
          mistake: "Allowing a fleet service and the on-robot tree to retry independently without one total budget.",
          correction:
            "Correlate attempts by mission and goal identity and enforce one bounded policy across orchestration layers.",
        },
      ],
      checkQuestions: [
        {
          question: "What three statuses does a normal behavior-tree action communicate?",
          answer:
            "It returns Success when complete, Failure when it cannot meet the condition, and Running while work is still in progress.",
        },
        {
          question: "When is clearing a local costmap a reasonable recovery?",
          answer:
            "When evidence indicates a stale or false local observation and the system waits for fresh sensor and transform data before retrying.",
        },
        {
          question: "Why should an inactive Nav2 server not accept normal navigation work?",
          answer:
            "Lifecycle activation is the explicit boundary that says configuration succeeded and operational interfaces are ready; process existence alone is insufficient.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A tick-by-tick tree with Success, Failure, Running, retry counter, lifecycle gate, and terminal escalation makes bounded recovery logic reviewable in a way prose alone does not.",
      },
    },
    {
      dayId: 54,
      mentalModel:
        "A cancel button is only a request sent into a moving system; completion means commands became quiet and observed motion reached the declared stopped condition.",
      explanation: [
        "NavigateToPose is an action, so a client may request cancellation while the goal is running. The server must accept or reject that request, halt the relevant tree work, stop producing navigation commands, and return a terminal cancellation result. The physical or simulated base has inertia and lower-level command timeouts, so action cancellation and motion stopped are different timestamps. Measure from cancel request to cancel acknowledgement, last nonzero command, and observed stopped velocity.",
        "Obstruction detection needs more than “the goal is taking too long.” The local costmap may show a new obstacle, the controller may report no valid command, a progress checker may see insufficient displacement, localization may be stale, or wheels may command motion without odometry progress. These causes demand different responses. A stopped person in the aisle may justify waiting; a lost transform requires a state-estimation response; a blocked permanent corridor requires a new route or terminal failure.",
        "Replanning means computing a path again from fresh current pose and environmental state. It is useful when the start moved, the goal changed, or obstacles changed the valid route. Replanning at a fixed rate can keep a route current, but excessive replanning consumes CPU and can make the chosen path flicker. Reusing stale costmaps or repeatedly producing the same invalid path is not recovery. Compare path identity, world-model version, pose age, and failure reason before spending another attempt.",
        "Nav2 Collision Monitor can filter velocity commands below the navigation stack using sensor-defined stop, slowdown, limit, or approach regions. It should be the final velocity-processing link when configured for that role, and stale source data needs a declared blocking policy. This is an additional software collision-avoidance layer, not proof of a safety-rated system and not a replacement for a hardware emergency stop or required machinery-safety controls. Test its actual input and output topics so no parallel publisher bypasses it.",
        "A bounded response policy joins these pieces. Declare what counts as progress, how long fresh data remains valid, when to wait, when to replan, how many attempts are allowed, what cancellation latency must pass, and which conditions force immediate failure or operator help. Preserve the original fault in logs; a successful retry does not erase the fact that the first attempt failed.",
      ],
      keyTerms: [
        {
          term: "Cancellation latency",
          meaning:
            "Elapsed time from the cancel request to a declared cancellation or stopped-motion milestone.",
          physicalExample:
            "The client requests cancel at 8.00 s, the last nonzero command occurs at 8.12 s, and observed speed falls below the stop threshold at 8.28 s.",
        },
        {
          term: "Obstruction",
          meaning:
            "A condition that prevents intended progress, supported by evidence such as occupied space or repeated infeasible control.",
          physicalExample:
            "A trolley spans the aisle and the local costmap leaves no footprint-valid passage.",
        },
        {
          term: "Replanning",
          meaning:
            "Computing a new path using a fresh start pose, goal, and environmental representation.",
          physicalExample:
            "The global planner chooses the next aisle after a pallet blocks the original route.",
        },
        {
          term: "Collision Monitor",
          meaning:
            "A Nav2 component that independently filters velocity commands from sensor-defined near-robot regions.",
          physicalExample:
            "Lidar points entering a front slowdown polygon scale the command before it reaches the base.",
        },
        {
          term: "Retry budget",
          meaning:
            "A maximum number of attempts or amount of time permitted before a goal fails or escalates.",
          physicalExample:
            "The robot waits once and replans once; a still-blocked route then becomes an operator-visible failure.",
        },
      ],
      physicalExamples: [
        {
          title: "Stopping a rolling office chair",
          scenario:
            "A person says “stop pushing” instantly, but the chair rolls a short distance before friction brings it below a chosen stopped-speed threshold.",
          lookFor:
            "Request time, command stop, and physical stop are separate; speed and surface determine stopping distance.",
        },
        {
          title: "Road closed versus traffic light",
          scenario:
            "A driver waits at a red light but chooses another road when construction permanently closes the street.",
          lookFor:
            "The same lack of progress can require wait, replan, or abort depending on the observed cause and retry policy.",
        },
      ],
      workedExample: {
        title: "Measure cancel response and stopping distance",
        setup:
          "A simulated base moves at 0.50 m/s. A cancel request is sent at 12.000 s, accepted at 12.035 s, the last nonzero velocity command is stamped 12.110 s, and odometry falls below the declared 0.02 m/s stopped threshold at 12.310 s.",
        steps: [
          "Compute cancel-acknowledgement latency: 12.035 - 12.000 = 0.035 s, or 35 ms.",
          "Compute command-quiet latency: 12.110 - 12.000 = 0.110 s, or 110 ms.",
          "Compute observed-stop latency: 12.310 - 12.000 = 0.310 s, or 310 ms.",
          "If a measured 0.11 m of travel occurs after the request, report it as stopping distance rather than estimating it from the final timestamp alone.",
          "Check the terminal action state is Canceled and no later publisher emits an uncorrelated nonzero command.",
          "Judge every quantity against a predeclared simulation criterion; a fast acknowledgement cannot compensate for late commands or continued motion.",
        ],
        result:
          "The software acknowledges in 35 ms, commands become quiet in 110 ms, observed motion stops in 310 ms, and the base travels 0.11 m after cancellation.",
        takeaway:
          "Cancellation quality is a timeline across client, action server, command chain, and observed body—not one callback duration.",
      },
      handsOn: {
        setup:
          "Use a fixed Gazebo route with action feedback, stamped velocity commands, odometry, local/global costmaps, Collision Monitor state, and one bag-recording launch.",
        steps: [
          "Run a nominal goal, request cancellation at a fixed route marker, and calculate acknowledgement, command-quiet, observed-stop, and terminal-result times from one clock.",
          "Place a temporary obstacle on the path, label the first detecting sensor and costmap update, and record whether the controller, progress checker, or tree reports the obstruction.",
          "Remove the obstacle after a fixed wait and verify fresh clearing plus one replan succeeds without exceeding the shared recovery budget.",
          "Repeat with a permanent blockage and verify the planner chooses a genuinely different valid route or reaches the declared terminal failure.",
          "Configure Collision Monitor stop and slowdown regions in simulation, confirm the controller output passes through its input and output topics, and inject stale source data to test the fail policy.",
          "Plant a rogue or mis-remapped velocity publisher, demonstrate how it bypasses the intended chain, then add an automated graph assertion that rejects the launch.",
        ],
        observe:
          "Action state, command stream, measured motion, sensor freshness, costmap change, path version, collision-monitor state, and retry count should remain correlated.",
        doneWhen:
          "Nominal cancel, temporary obstruction, permanent obstruction, stale collision source, and command-chain bypass each produce the declared measurable outcome with no endless retry.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_HMI],
        workExample:
          "Build the operator-visible cancellation and obstruction tests for an AMR release, proving where commands stop, how far the base travels, which component replans, and when the system asks for help.",
        interviewPrompt:
          "The UI says a goal is canceled, but the robot rolls for another second. Describe the timestamps, topics, action states, command publishers, Collision Monitor path, odometry, and physical controls you would inspect.",
      },
      commonMistakes: [
        {
          mistake: "Measuring only the time until the action server accepts cancellation.",
          correction:
            "Also measure the last nonzero command, observed stopped velocity, stopping distance, and correct terminal result.",
        },
        {
          mistake: "Calling every no-progress event an obstacle and clearing costmaps.",
          correction:
            "Separate real occupancy, stale transforms, localization loss, controller infeasibility, drive failure, and temporary blockage using correlated evidence.",
        },
        {
          mistake: "Treating Collision Monitor as a safety-certified emergency stop.",
          correction:
            "Use it as an additional software collision-avoidance layer and retain required independent hardware and system safety controls.",
        },
        {
          mistake: "Replanning without proving that pose, costmap, goal, or constraints changed.",
          correction:
            "Record input versions and compare the new path; otherwise the retry may repeat the same failure with extra latency.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is cancel acknowledgement not the same as a stopped robot?",
          answer:
            "The action protocol may acknowledge before command generation, lower-level control, and physical motion have all reached their stopped conditions.",
        },
        {
          question: "When is replanning useful?",
          answer:
            "When fresh pose, goal, or environmental information can produce a different valid path and a retry budget permits another attempt.",
        },
        {
          question: "Where should Collision Monitor sit in its intended velocity chain?",
          answer:
            "As the final velocity-filtering component before the actual `cmd_vel` consumer, with topic ownership checked so no publisher bypasses it.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The earlier behavior-tree visual already covers recovery branching; this lesson is better served by the worked cancellation timeline and recorded command/odometry traces.",
      },
    },
    {
      dayId: 55,
      mentalModel:
        "A navigation scorecard is a school report for many fixed journeys: it shows which conditions were attempted, what failed, how long recovery took, and whether help was needed.",
      explanation: [
        "Start evaluation by freezing scenarios, not by choosing a flattering metric. Record world version, map and parameter versions, start and goal poses, obstacle schedule, random seed where applicable, simulation speed, and acceptance rules. Include ordinary, tight-clearance, temporary-blockage, permanent-blockage, cancellation, bad-initial-pose, and stale-data cases. A result without the number and type of attempted trials cannot support a reliability claim.",
        "Task success needs a precise terminal definition. Autonomous success may require the correct action result, final pose within tolerance, no collision, no manual intervention, and completion before a timeout. Report successes over total attempts and split the result by scenario. A human dragging the robot icon to a better pose or clearing a costmap can be useful diagnosis, but that trial is assisted and must not be counted as autonomous success.",
        "Path and time metrics explain efficiency, not safety by themselves. Record planned and executed path length, path efficiency against a declared reference, planning time, total goal time, time stopped, and recovery time. Use medians and percentiles or worst cases rather than only the mean, because one very slow recovery may matter operationally. Minimum clearance and collision-monitor events help explain whether a fast path consumed safety margin.",
        "Localization needs its own evidence. AMCL covariance describes the estimator's uncertainty belief; it is not measured pose error. In simulation, compare estimated pose with ground-truth pose only after transforming them into the same frame and time. On hardware, use surveyed landmarks, fiducials, motion-capture, total station, or another documented reference appropriate to the site. Report position and orientation error, loss events, relocalization time, and cases where confidence was small but error was large.",
        "Recovery metrics preserve the failures inside successful tasks. Count failure events, recovery attempts, distinct recovery types, resolved failures, time to detection, time to resume, retry count, operator interventions, and terminal aborts. Group failures by actionable cause such as localization, transform timing, map/costmap, planner, controller, command chain, or scenario design. Do not delete warm-up or failed bags; mark exclusions before analysis and keep representative traces.",
      ],
      keyTerms: [
        {
          term: "Scenario",
          meaning:
            "A fully described test condition with fixed setup, event schedule, and expected outcome.",
          physicalExample:
            "Start at loading bay A, send goal shelf B, place a pallet at 8 s, and require reroute within 3 s.",
        },
        {
          term: "Autonomous success rate",
          meaning:
            "The number of trials meeting every autonomous acceptance rule divided by all relevant attempted trials.",
          physicalExample:
            "15 unassisted passes out of 20 frozen trials gives 75%, with scenario breakdown still required.",
        },
        {
          term: "Localization error",
          meaning:
            "The difference between estimated pose and a documented reference pose in the same frame and time.",
          physicalExample:
            "AMCL is 0.18 m from simulator ground truth after both are transformed to `map` at the same timestamp.",
        },
        {
          term: "Recovery rate",
          meaning:
            "Resolved eligible failure events divided by the failure events for which recovery was attempted.",
          physicalExample:
            "Six of eight obstruction recoveries resume the mission, so the observed recovery rate is 75%.",
        },
        {
          term: "Failure taxonomy",
          meaning:
            "A set of causal, actionable categories used to group failed trials.",
          physicalExample:
            "Three failures are tagged transform timeout, two controller infeasibility, and one test-fixture error.",
        },
      ],
      physicalExamples: [
        {
          title: "Two delivery routes",
          scenario:
            "Route A is shorter but clips the inflation boundary and fails twice; Route B is longer and completes every fixed trial without intervention.",
          lookFor:
            "Shortest path length is not the same as best operating outcome; reliability, clearance, and recovery belong beside distance.",
        },
        {
          title: "Class test with hidden missing questions",
          scenario:
            "A student reports nine correct answers but omits that the test had twenty questions and skips the hardest section.",
          lookFor:
            "A success count without denominator and scenario coverage hides reliability just as badly.",
        },
      ],
      workedExample: {
        title: "Calculate a navigation trial scorecard without hiding hard cases",
        setup:
          "A suite contains 20 trials: 8 nominal, 8 temporarily blocked, and 4 bad-initial-pose cases. Results are 8, 6, and 1 autonomous successes respectively. Eight recovery attempts occur and six resolve the triggering failure.",
        steps: [
          "Add autonomous successes: 8 + 6 + 1 = 15.",
          "Divide by every attempted trial: 15 / 20 = 0.75, so overall autonomous success is 75%.",
          "Keep scenario rates visible: nominal 8/8 = 100%, blocked 6/8 = 75%, and bad-initial-pose 1/4 = 25%.",
          "Calculate observed recovery rate using recovery events: 6 / 8 = 75%; do not use 6 / 20 because most trials did not attempt recovery.",
          "Report the two unresolved recovery events and all five unsuccessful trials in the failure taxonomy; one trial may contain more than one event, so event and trial counts must not be mixed.",
          "State the decision: the 100% nominal result does not compensate for 25% bad-initial-pose success if relocalization is a required operating condition.",
        ],
        result:
          "The suite has 75% overall autonomous success and 75% observed recovery success, but the scenario split exposes a severe initial-localization weakness.",
        takeaway:
          "Totals show scale; stratified scenarios show where the system is actually weak.",
      },
      handsOn: {
        setup:
          "Create a small scenario manifest and runner around the Gazebo/Nav2 launch. Keep raw bags, structured results, map/config hashes, and unedited outcome labels.",
        steps: [
          "Define at least ten trials across nominal, narrow passage, temporary obstruction, permanent obstruction, cancellation, and incorrect initial pose, with pass rules written before execution.",
          "Record goal identity, start/goal poses, scenario event times, action result, intervention, collision or near-boundary event, and final pose for every trial.",
          "Calculate planned and executed path length, planner time, total time, recovery time, final pose error, minimum clearance proxy, and transform or command freshness where available.",
          "Separate autonomous success, assisted completion, safe failure, unsafe or invalid outcome, and test-infrastructure failure; never silently rerun and replace an unfavorable row.",
          "Produce scenario-level rates plus median and worst-case timing, then link at least one nominal and one failure row to their bag and event timeline.",
          "Change one navigation parameter only after the baseline report, rerun the same manifest, and explain both improvements and regressions.",
        ],
        observe:
          "The dataset should retain denominators, difficult cases, interventions, failure events, and evidence links so another engineer can challenge the conclusion.",
        doneWhen:
          "Every manifest row has a reproducible result and linked evidence, aggregate calculations match raw counts, and the report names the largest unresolved navigation risk.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_FLEET, ROLE_HMI],
        workExample:
          "Build the release dashboard and regression manifest for an AMR navigation change, preserving scenario coverage, intervention flags, localization and recovery evidence, and drill-down bags for field failures.",
        interviewPrompt:
          "A team says Nav2 is 95% successful. List the denominator, scenario, assistance, localization, path, timing, recovery, safety, and evidence questions you need before accepting that claim.",
      },
      commonMistakes: [
        {
          mistake: "Reporting only successful runs after rerunning failed scenarios.",
          correction:
            "Keep every attempted frozen trial, mark infrastructure exclusions explicitly, and show scenario denominators.",
        },
        {
          mistake: "Using AMCL covariance as measured localization error.",
          correction:
            "Treat covariance as the estimator's uncertainty claim and compare pose against an independent, time-aligned reference to measure error.",
        },
        {
          mistake: "Averaging all route times without showing failures or tail latency.",
          correction:
            "Report success state, scenario split, median, percentile or worst case, recovery time, and exclusions together.",
        },
        {
          mistake: "Counting a human-assisted completion as autonomous success.",
          correction:
            "Record assistance as an intervention and keep autonomous, assisted, and failed outcomes separate.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is 8 successful runs not enough to state a success rate?",
          answer:
            "The total number of attempts, scenario mix, pass definition, and intervention policy are missing.",
        },
        {
          question: "What is the difference between AMCL covariance and localization error?",
          answer:
            "Covariance is the estimator's belief about uncertainty; localization error is measured against an independent pose reference in the same frame and time.",
        },
        {
          question: "Why should recovery events stay visible inside successful trials?",
          answer:
            "They reveal fragility, delay, retry cost, and failure types that a final success label would otherwise hide.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "A compact worked scorecard and trial table communicate this lesson better than another generic navigation map.",
      },
    },
    {
      dayId: 56,
      mentalModel:
        "The phase demo is a release candidate, not a magic show: another engineer should be able to start it, interrupt it, inspect the evidence, and reach the same verdict.",
      explanation: [
        "The completed workflow has two deliberate operating modes. Mapping mode runs the simulator, odometry, lidar, and SLAM Toolbox to create and inspect a map. Navigation mode loads an approved map, starts one localization authority such as AMCL, brings the Nav2 lifecycle stack active, verifies current costmaps and transforms, then accepts goals. Keep these launch paths and configuration versions explicit so a reviewer never accidentally runs two `map→odom` publishers or navigates with an unsaved draft map.",
        "A resilient demonstration covers the whole goal loop: valid initial pose, active lifecycle state, current localization, global plan, local commands, progress, goal verification, terminal result, and correlated operator status. It must also exercise cancellation, a temporary obstruction that can recover, a permanent obstruction that must reroute or fail, stale or lost localization, and one lifecycle or server failure. The required response may be success or safe failure; resilience does not mean every impossible mission finishes.",
        "Acceptance criteria must be written before the final runs. Examples include a minimum autonomous success rate for fixed scenarios, no collision events, final-pose tolerance, maximum cancellation-to-stop time, bounded recovery attempts, transform freshness, and zero command output after terminal state. Some conditions are hard gates: one command-chain bypass or collision may reject the release even when average task success is high. Keep safety-critical gates separate from performance averages.",
        "The evidence package should include a short architecture and frame diagram, map provenance, versioned parameters, launch commands, scenario manifest, raw result table, bags or decisive traces, uncut nominal and failure videos, issue links, and an honest limitations section. A README should explain the one-command happy path and the one-command regression suite. Avoid screenshots without timestamps or logs without the goal and scenario identity that produced them.",
        "This project is strong job evidence because it joins software and physical reasoning. In an interview, explain the map and frame contract, planner/controller boundary, costmap layers, lifecycle and behavior-tree policy, one failure's causal trace, the metric that prevented a false claim, and the next test needed on real hardware. Do not claim production safety or hardware validation from Gazebo. Claim exactly what the simulation, injected faults, and reproducible artifacts prove.",
      ],
      keyTerms: [
        {
          term: "Operating mode",
          meaning:
            "A declared set of active components and authorities for a specific purpose such as mapping or saved-map navigation.",
          physicalExample:
            "Mapping uses SLAM Toolbox as `map→odom` authority; saved-map navigation stops it and activates AMCL instead.",
        },
        {
          term: "Acceptance criterion",
          meaning:
            "A measurable rule written before the trial that decides pass, safe failure, or rejection.",
          physicalExample:
            "After cancel, observed speed must fall below 0.02 m/s within 0.5 s in the fixed simulation.",
        },
        {
          term: "Hard gate",
          meaning:
            "A condition whose violation rejects the build regardless of average performance.",
          physicalExample:
            "Any uncommanded motion after terminal cancellation blocks release even if 19 other trials pass.",
        },
        {
          term: "Traceability",
          meaning:
            "The ability to connect a requirement and scenario to exact configuration, execution evidence, result, and issue.",
          physicalExample:
            "NAV-CANCEL-02 links its criterion to row 17, an MCAP bag, the cancel timeline, and a fixed defect.",
        },
        {
          term: "Safe failure",
          meaning:
            "A task does not complete, but the system reaches a bounded non-moving or otherwise declared safe state and reports why.",
          physicalExample:
            "Both aisles remain blocked, so the goal aborts, commands stop, and the fleet receives a structured obstruction result.",
        },
      ],
      physicalExamples: [
        {
          title: "Fire drill instead of a building tour",
          scenario:
            "A building is not judged only by a pleasant guided tour; a drill checks alarms, exits, roles, timing, and what happens when one route is blocked.",
          lookFor:
            "The failure path is planned, observed, and timed rather than hidden from the demonstration.",
        },
        {
          title: "Recipe with weighed ingredients",
          scenario:
            "Another cook follows the same recipe, ingredient weights, oven setting, and timing, then compares the result with a declared standard.",
          lookFor:
            "Reproducibility requires versions and conditions, not only a photo of the first successful result.",
        },
      ],
      workedExample: {
        title: "Apply hard gates before accepting a high average",
        setup:
          "A 12-trial candidate completes 11 goals autonomously, so task success is 91.7%. The declared target is at least 90%, but one cancellation trial emits a nonzero velocity command after the action reaches Canceled, violating a zero-post-terminal-command hard gate.",
        steps: [
          "Calculate task success: 11 / 12 = 0.9167, or 91.7%, which meets the numeric success-rate target.",
          "Inspect hard gates separately: the post-terminal command violates an explicit command-integrity rule.",
          "Reject the candidate even though its average success rate passes; averages cannot waive a hard gate.",
          "Trace the late command to its publisher, goal identity, timestamp, and velocity chain rather than labeling the whole trial simply failed.",
          "Repair the publisher ownership or shutdown sequence and rerun the affected case for diagnosis.",
          "Rerun the full frozen 12-trial suite before release because the command-chain change could affect nominal and obstruction behavior.",
        ],
        result:
          "The first candidate is rejected on command integrity despite 91.7% task success; acceptance requires the repaired build to pass both the full suite and every hard gate.",
        takeaway:
          "Release judgment is a set of explicit constraints, not one score that allows a dangerous result to hide inside an average.",
      },
      handsOn: {
        setup:
          "Create a clean release-candidate tag or recorded commit for the simulated Nav2 project and a frozen scenario manifest. Do not connect powered hardware.",
        steps: [
          "Run the mapping launch once, inspect coverage and loop closure, save map and pose-graph artifacts, and record the exact simulation, sensor, and SLAM configuration.",
          "Run the saved-map navigation launch and add automated preflight checks for lifecycle active state, single transform authority, current localization, current costmaps, and command-publisher ownership.",
          "Execute the frozen suite with nominal, cancel, temporary block, permanent block, bad initial pose or localization loss, and one managed-server failure; retain every result row.",
          "Verify hard gates for collision, post-terminal commands, cancellation-to-stop time, retry budget, stale-data behavior, and correct structured terminal result.",
          "Package the architecture/frame diagram, commands, configs, map provenance, scenario manifest, metrics, linked bags, uncut demos, failure taxonomy, and known limitations.",
          "Ask another engineer or a clean environment to follow the README, reproduce one nominal and one failure case, and record any undocumented assumption as a defect.",
        ],
        observe:
          "The final state shown by the action, behavior tree, lifecycle nodes, command stream, odometry, localization, costmaps, and report should agree for every trial.",
        doneWhen:
          "A clean reviewer can build or launch the project, reproduce the declared suite, verify calculations from raw rows, inspect at least one failure trace, and reach the same release verdict.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_HMI, ROLE_FLEET],
        workExample:
          "Own an AMR navigation release gate across on-robot software, operator UI, and fleet result reporting, with replayable cancellation, obstruction, localization, lifecycle, and command-chain evidence.",
        interviewPrompt:
          "Walk through your Nav2 phase demo as a release review: architecture, frame ownership, map provenance, costmap policy, planner/controller flow, lifecycle, failure injection, hard gates, metrics, and what remains unproven without hardware.",
      },
      commonMistakes: [
        {
          mistake: "Showing mapping and navigation together without naming which node owns `map→odom`.",
          correction:
            "Define separate operating modes and assert exactly one transform authority before accepting work.",
        },
        {
          mistake: "Calling every recovered trial a clean success.",
          correction:
            "Keep recovery type, attempt count, delay, and original failure visible even when the final task succeeds.",
        },
        {
          mistake: "Letting a high average success score override a collision or post-cancel command.",
          correction:
            "Evaluate safety and command-integrity hard gates separately from aggregate performance.",
        },
        {
          mistake: "Claiming a simulation demo proves production hardware safety.",
          correction:
            "State the exact simulation and fault-injection evidence, then list hardware commissioning, stopping, sensor, load, and safety validation still required.",
        },
      ],
      checkQuestions: [
        {
          question: "Why should mapping and saved-map navigation be separate launch modes?",
          answer:
            "They use different global-pose authorities and artifacts; separation prevents conflicting `map→odom` publishers and makes the approved map version explicit.",
        },
        {
          question: "Can a 95% task-success rate pass a release with one hard-gate violation?",
          answer:
            "No. A hard gate is evaluated independently and rejects the build regardless of the average.",
        },
        {
          question: "What should you claim after a Gazebo-only Nav2 project?",
          answer:
            "Claim the reproducible simulated behavior, timing, failure handling, and evidence actually tested, while clearly stating that hardware and production safety remain unverified.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The chapter already uses four purpose-built spatial and state visuals; the final gate is clearer as a traceability table, trial manifest, and linked evidence package.",
      },
    },
  ],
} satisfies ChapterContent;
