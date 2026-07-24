import type { ChapterContent } from "../chapter-content-types";

const roleTitles = {
  hmi: "Robot HMI / Control & Monitoring Engineer",
  deployment: "Robotics Deployment, Integration & Validation Engineer",
  integration: "Robotics Application / ROS 2 Integration Engineer",
  software: "Robotics Software Engineer — ROS 2 / AMR",
} as const;

export const week02Content = {
  week: 2,
  title: "Turn the maths into robot motion",
  purpose:
    "Learn to predict where a rigid robot part is, which way it faces, and how joint motion changes the tool position. The goal is not to memorize symbols: it is to build a small set of spatial tools that you can draw, calculate, test, and later recognize inside tf2, RViz, robot models, calibration, and motion software.",
  prerequisites: [
    "Read a point or arrow on an x-y grid and keep its unit and coordinate frame attached.",
    "Add vectors component by component and multiply a 2×2 matrix by a 2D vector one row at a time.",
    "Distinguish a robot configuration (joint values) from a workspace point (tool location).",
  ],
  outcomes: [
    "Rotate and translate a 2D point while stating the order, units, and input/output frames.",
    "Compose and invert a short frame chain and verify it with an identity round trip.",
    "Check whether a 3×3 matrix is a proper rotation and explain why a reflection is not.",
    "Explain Euler-angle singularity and use a normalized quaternion without mixing component order.",
    "Build and apply an SE(3) homogeneous transform to both points and directions.",
    "Calculate two-link forward kinematics and measure model error on a cardboard arm.",
    "Explain a Jacobian column, run bounded numerical inverse kinematics, and report failure honestly.",
  ],
  jobTargets: [
    roleTitles.hmi,
    roleTitles.deployment,
    roleTitles.integration,
    roleTitles.software,
  ],
  sources: [
    {
      label: "Modern Robotics — Rotation Matrices",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-2-1-rotation-matrices-part-1-of-2/",
      useFor:
        "Days 8 and 10: rotation-matrix meaning, orthonormal columns, determinant +1, transpose inverse, length preservation, and non-commutative composition.",
    },
    {
      label: "Modern Robotics — Homogeneous Transformation Matrices",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-3-1-homogeneous-transformation-matrices/",
      useFor:
        "Days 9 and 12: frame-labelled transform composition, inversion, homogeneous points, SE(3), and the difference between left and right multiplication.",
    },
    {
      label: "ROS 2 documentation — Quaternion fundamentals",
      url: "https://docs.ros.org/en/jazzy/Tutorials/Intermediate/Tf2/Quaternion-Fundamentals.html",
      useFor:
        "Day 11: normalized quaternion use, roll-pitch-yaw conversion, and the ROS message component order (x, y, z, w).",
    },
    {
      label: "Modern Robotics — Forward Kinematics Example",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/forward-kinematics-example/",
      useFor:
        "Day 13: treating forward kinematics as an ordered map from joint configuration to end-effector pose.",
    },
    {
      label: "Modern Robotics — Numerical Inverse Kinematics",
      url: "https://modernrobotics.northwestern.edu/nu-gm-book-resource/6-2-numerical-inverse-kinematics-part-1-of-2/",
      useFor:
        "Day 14: Jacobian linearization, pseudoinverse update, dependence on the starting guess, singular cases, and bounded convergence checks.",
    },
  ],
  days: [
    {
      dayId: 8,
      mentalModel:
        "Imagine a sticker on a tray. Turning the tray changes the sticker's direction around the tray origin; carrying the tray shifts everything by the same amount. A 2D rigid transform records those two operations without bending or stretching the tray.",
      explanation: [
        "A point tells only where something is. A pose tells where it is and which way its attached axes face. In a flat world, a pose therefore needs an x position, a y position, and one angle. A transform is the rule that converts coordinates described in one pose or frame into coordinates described in another; it is not just a bag of three unrelated numbers.",
        "Angles may be written in degrees or radians. Degrees split a turn into 360 parts. Radians measure the arc length divided by the circle radius, so one full turn is 2π radians and 180° is π radians. Most programming-language sine and cosine functions expect radians. The conversion is radians = degrees × π / 180.",
        "Sine and cosine are not magic buttons. For a unit arrow at angle θ, cosine is its horizontal component and sine is its vertical component. The 2D rotation matrix R(θ) uses those two values to rotate every input arrow by the same angle while preserving its length. For a point p in the local frame and a local-frame origin at translation t in the world frame, the common column-vector rule is p_world = R p_local + t.",
        "Order matters. In p_world = R p_local + t, rotate the local coordinates first and then place the rotated point at the translated world origin. Translating first and then rotating usually gives a different point because matrix operations do not generally commute. A reliable implementation names both frames, declares degrees or radians, and checks a known case such as 0°, 90°, or a forward-then-inverse round trip.",
      ],
      keyTerms: [
        {
          term: "Pose",
          meaning: "A description containing both position and orientation.",
          physicalExample: "A book can occupy one desk position while facing north, east, south, or west.",
        },
        {
          term: "Radian",
          meaning: "An angle unit equal to arc length divided by radius.",
          physicalExample: "An arc as long as a wheel's radius spans one radian at the wheel centre.",
        },
        {
          term: "Sine",
          meaning: "The vertical component of a unit arrow at an angle in the x-y plane.",
          physicalExample: "It tells how much of a sloping paper link points upward.",
        },
        {
          term: "Cosine",
          meaning: "The horizontal component of a unit arrow at an angle in the x-y plane.",
          physicalExample: "It tells how much of the same paper link points to the right.",
        },
        {
          term: "Rigid transform",
          meaning: "A rotation and translation that preserve distances and angles.",
          physicalExample: "Moving a solid tray changes every sticker position but not distances between stickers.",
        },
      ],
      physicalExamples: [
        {
          title: "Parcel on a turntable",
          scenario:
            "A parcel corner is 20 cm along the turntable's local x-axis. The turntable rotates 90° and its centre is 50 cm right and 30 cm above the room origin.",
          lookFor:
            "The local corner first becomes 20 cm along local/world y, then translation places it at room coordinate (50 cm, 50 cm).",
        },
        {
          title: "Camera marker on a floor rover",
          scenario:
            "A camera reports a marker 0.4 m straight ahead of the rover while the rover faces 30° from the room x-axis.",
          lookFor:
            "The same 0.4 m appears as both an x and y component in the room; the rover translation must be added only after rotating the local observation.",
        },
      ],
      workedExample: {
        title: "Rotate a tray point and place it in the room",
        setup:
          "A point is p_tray=(0.20, 0.00) m. The tray is rotated +90° and its origin is t_room=(0.50, 0.30) m.",
        steps: [
          "Convert 90° to radians: 90 × π/180 = π/2 rad.",
          "Use cos(π/2)=0 and sin(π/2)=1, giving R=[[0,-1],[1,0]].",
          "Rotate the local point: R(0.20,0.00)=(0.00,0.20) m.",
          "Add the room translation: (0.00,0.20)+(0.50,0.30)=(0.50,0.50) m.",
          "Check rigidity: the point remains 0.20 m from the tray origin after rotation.",
        ],
        result: "The point is at (0.50, 0.50) m in the room frame.",
        takeaway:
          "Rotate a local quantity in its declared frame, then translate the rotated point into the parent frame.",
      },
      handsOn: {
        setup:
          "Use graph paper, a rectangular paper tray, a ruler, and a pen. Do not use powered hardware.",
        steps: [
          "Draw a local x-y frame on the paper tray and mark a point 4 cm along +x.",
          "Draw a separate room x-y frame on graph paper and mark the tray origin at (6 cm, 3 cm).",
          "Rotate the tray +90° without moving its marked origin and predict the point's room coordinate.",
          "Place the tray on the graph, measure the point, and record prediction error in millimetres.",
          "Repeat with -90° and 180°; write every calculator angle in both degrees and radians.",
          "Perform one deliberately wrong translate-then-rotate calculation and explain why its result differs.",
        ],
        observe:
          "Rotation changes the point relative to the tray origin; translation moves the whole rotated arrangement. Distance from point to tray origin stays constant.",
        doneWhen:
          "Three predicted coordinates match the drawing within 2 mm and the wrong-order case is labelled with its exact cause.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.integration, roleTitles.software],
        workExample:
          "An operator map receives robot-local obstacle or tool coordinates. The engineer must convert them into the map frame before drawing, planning, or sending a target; a degree/radian or operation-order mistake can put the displayed or commanded point in the wrong place.",
        interviewPrompt:
          "A rover at (2,1) m faces +90°. Its sensor sees an object 0.5 m straight ahead. Explain the frame conversion, result, units, and two checks you would add.",
      },
      commonMistakes: [
        {
          mistake: "Passing 90 directly to a sine function that expects radians.",
          correction: "Convert first: 90° = π/2 rad, and encode the unit in names or types.",
        },
        {
          mistake: "Adding translation before rotating a local point.",
          correction: "For p_parent = R p_local + t, calculate R p_local first, then add t.",
        },
        {
          mistake: "Rotating the translation vector accidentally.",
          correction: "Write the frame-labelled equation before coding and test a known pose.",
        },
        {
          mistake: "Dropping metres or centimetres from intermediate values.",
          correction: "Convert all distances to one unit before addition and display the unit in results.",
        },
      ],
      checkQuestions: [
        {
          question: "What extra information turns a 2D position into a 2D pose?",
          answer: "An orientation angle, interpreted using a stated sign convention and frame.",
        },
        {
          question: "Why does a rotation matrix not change an arrow's length?",
          answer: "Its axes are orthonormal, so the dot product—and therefore squared length—is preserved.",
        },
        {
          question: "A local point is at the frame origin. What does R p + t become?",
          answer: "Because p=(0,0), R p=(0,0), so the parent-frame point is exactly t.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The existing coordinate visual repeats the same rotate-and-translate fixture used elsewhere; the measured paper-tray exercise supplies the clearer evidence here.",
      },
    },
    {
      dayId: 9,
      mentalModel:
        "A frame chain is a route through several local maps. Each transform is one trusted direction between neighbouring maps. Composition walks the route forward; inversion turns one arrow around.",
      explanation: [
        "Robots attach coordinate frames to the room, mobile base, arm links, camera, lidar, and tool. A point measured by a camera cannot be used as a map point until the chain between those frames is known. Writing a transform as T_AB means: it converts coordinates described in frame B into coordinates described in frame A. The labels are part of the value, not decoration.",
        "Adjacent frame labels show legal composition. T_AB T_BC = T_AC because the inner B labels meet. With column vectors, the rightmost transform acts first: a C-frame point first enters B, then A. This resembles typed function composition: the output frame of one operation must match the input frame of the next.",
        "The inverse T_BA = T_AB⁻¹ travels backward. For a rotated rigid transform, inversion is not simply negating the translation. The correct inverse rotation is Rᵀ and the inverse translation is -Rᵀt, because the old translation must first be expressed along the reversed axes. A forward-and-back identity test catches many direction errors.",
        "A frame tree gives one parent to each child, which creates one unambiguous path between frames. Real robot transforms are also time-dependent: a mathematically valid base-to-camera relationship at the wrong timestamp can describe a different physical pose. Later tf2 work will combine the same path logic with a time buffer.",
      ],
      keyTerms: [
        {
          term: "Frame tree",
          meaning: "A connected hierarchy of coordinate frames with one parent per child.",
          physicalExample: "room → rover base → camera mount → camera lens.",
        },
        {
          term: "Composition",
          meaning: "Combining compatible transforms in order to relate more distant frames.",
          physicalExample: "Room-to-rover combined with rover-to-camera gives room-to-camera.",
        },
        {
          term: "Inverse transform",
          meaning: "The rigid transform that reverses a frame relationship.",
          physicalExample: "Camera-to-rover undoes rover-to-camera.",
        },
        {
          term: "Identity transform",
          meaning: "A transform with no rotation and no translation.",
          physicalExample: "Following room→camera→room should return every test point unchanged.",
        },
        {
          term: "Timestamp",
          meaning: "The physical instant for which a changing transform or measurement is valid.",
          physicalExample: "A moving rover's camera pose at 10:00:01 is not its pose at 10:00:03.",
        },
      ],
      physicalExamples: [
        {
          title: "Camera on a robot mast",
          scenario:
            "The map tracks the mobile base. A rigid bracket fixes a mast to the base, and a camera is bolted to the mast.",
          lookFor:
            "The marker observation must pass camera→mast→base→map; skipping the bracket offset produces a systematic location error.",
        },
        {
          title: "Gripper holding a barcode scanner",
          scenario:
            "The arm controller knows base→wrist, and calibration gives wrist→scanner. The scanner reports a box face in its own frame.",
          lookFor:
            "Compose the full path at the observation time, then verify scanner→base→scanner returns the original box point.",
        },
      ],
      workedExample: {
        title: "Compose and reverse an aligned frame chain",
        setup:
          "All axes are aligned. The rover base is at (2.0,1.0) m in the room, and the camera is at (0.30,0.20) m in the rover base.",
        steps: [
          "Name the relationships: t_room,base=(2.0,1.0) m and t_base,camera=(0.30,0.20) m.",
          "Check that the chain room→base→camera is continuous.",
          "Because the axes are aligned in this special case, add translations: t_room,camera=(2.30,1.20) m.",
          "A point 0.50 m along camera +x is therefore at (2.80,1.20) m in the room.",
          "Reverse the camera offset: t_camera,base=(-0.30,-0.20) m only because there is no rotation here.",
          "Subtract the full room→camera translation from the room point and recover camera point (0.50,0.00) m.",
        ],
        result:
          "The camera origin is (2.30,1.20) m in the room, and the test point round trip returns (0.50,0.00) m.",
        takeaway:
          "Frame labels determine legal order. Simple translation addition is valid only when axes are aligned; rotated inverses need Rᵀ and -Rᵀt.",
      },
      handsOn: {
        setup:
          "Use a toy car or cardboard rectangle, a small paper camera, graph paper, a ruler, and removable tape.",
        steps: [
          "Draw room, car, and camera frames with different coloured axes.",
          "Measure room→car and car→camera translations with all axes initially aligned.",
          "Predict the camera origin and one camera-local point in room coordinates, then measure both.",
          "Rotate the car 90°, redraw the chain, and predict again using rotation before translation.",
          "Apply the inverse chain to the measured room point and calculate the recovered camera-local point.",
          "Swap one transform direction deliberately; record the wrong result and the frame-label mismatch.",
        ],
        observe:
          "The camera bracket stays fixed in the car frame while its room direction changes with the car. The round trip exposes order or inverse mistakes.",
        doneWhen:
          "Both aligned and rotated cases have named transforms, measured errors, and a forward→inverse residual of at most 2 mm on paper.",
      },
      jobConnection: {
        roles: [roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample:
          "During sensor bring-up, a valid camera detection appears consistently offset on the map. The engineer traces the live frame path, verifies transform direction and timestamp, measures the mount, and proves the fix with a round-trip and a known target.",
        interviewPrompt:
          "Explain why T_map,base T_camera,base is not a legal map→camera composition, and describe the exact transform or inverse you need instead.",
      },
      commonMistakes: [
        {
          mistake: "Multiplying transforms in visual left-to-right reading order without checking frame labels.",
          correction: "Use column-vector semantics and make adjacent inner frame labels match before calculating.",
        },
        {
          mistake: "Reversing a rotated transform by changing t to -t.",
          correction: "Use R⁻¹=Rᵀ and t_inverse=-Rᵀt.",
        },
        {
          mistake: "Publishing two parents for the same child frame.",
          correction: "Keep the transform graph a tree or define an explicit estimation/fusion boundary.",
        },
        {
          mistake: "Combining a sensor measurement with the latest transform instead of the measurement-time transform.",
          correction: "Use the measurement timestamp and reject or handle unavailable/extrapolated transforms explicitly.",
        },
      ],
      checkQuestions: [
        {
          question: "What does T_AB do under the convention used here?",
          answer: "It converts coordinates expressed in frame B into coordinates expressed in frame A.",
        },
        {
          question: "What identity should a transform and its inverse satisfy?",
          answer: "T_AB T_BA = I and T_BA T_AB = I, within numerical tolerance.",
        },
        {
          question: "Why can a correct frame path still produce a wrong physical point?",
          answer: "The transform may refer to the wrong time, use incorrect calibration, or mix physical units.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A single frame-chain visual materially clarifies composition and inversion and replaces several near-identical coordinate diagrams in this chapter.",
      },
    },
    {
      dayId: 10,
      mentalModel:
        "A proper rotation matrix is three unit rulers bolted together at right angles. You may turn the whole triad, but you may not stretch a ruler, change a right angle, or flip the triad into a mirror image.",
      explanation: [
        "A 3D rotation matrix R has three columns. Under the common convention, those columns are the rotated frame's x, y, and z unit axes written in the reference frame. Nine numbers appear, but they cannot vary independently because the three axes must stay unit length and perpendicular.",
        "The compact check RᵀR=I says exactly that: each column dotted with itself is 1, and different columns have dot product 0. It also gives the useful inverse R⁻¹=Rᵀ. A rigid rotation therefore preserves vector lengths and angles, which is why a solid gripper does not change shape when its orientation changes.",
        "Orthogonality alone still allows a mirror reflection. The extra check det(R)=+1 keeps the axes right-handed and excludes reflections with determinant -1. SO(3), read 'special orthogonal group in three dimensions', is the set of all 3×3 matrices satisfying both conditions. 'Group' means valid rotations remain valid when composed and each has a valid inverse.",
        "Computer results are rarely exact because floating-point arithmetic rounds values. Production code checks that RᵀR is close to I and det(R) is close to +1 using a justified tolerance. A determinant near +1 by itself is not enough; a shearing or scaling matrix may still have determinant 1 while failing orthonormality.",
      ],
      keyTerms: [
        {
          term: "SO(3)",
          meaning: "The set of proper 3D rotation matrices.",
          physicalExample: "Every rigid orientation of a three-axis tool frame belongs to SO(3).",
        },
        {
          term: "Orthonormal",
          meaning: "Axes are mutually perpendicular and each has length one.",
          physicalExample: "A carefully built x-y-z triad with equal unit arrows and 90° angles.",
        },
        {
          term: "Transpose",
          meaning: "A matrix formed by exchanging rows and columns.",
          physicalExample: "For a proper rotation, the transpose provides the exact reverse orientation map.",
        },
        {
          term: "Determinant",
          meaning: "A scalar that helps detect volume scaling and handedness.",
          physicalExample: "A mirror reflection preserves lengths but changes a right-handed triad into a left-handed one, giving -1.",
        },
        {
          term: "Reflection",
          meaning: "A mirror-like transformation that reverses handedness and is not a proper rotation.",
          physicalExample: "Your right hand's arrangement cannot be rotated to become your left hand's arrangement.",
        },
      ],
      physicalExamples: [
        {
          title: "Gripper tool frame",
          scenario:
            "A robot wrist turns a rigid gripper from horizontal to vertical while the three tool axes remain fixed to its body.",
          lookFor:
            "All axis lengths and pairwise right angles stay unchanged; composing two wrist turns still yields a proper orientation.",
        },
        {
          title: "IMU orientation sanity check",
          scenario:
            "An IMU or conversion library returns a 3×3 orientation matrix after numerical processing.",
          lookFor:
            "RᵀR should be near I and det(R) near +1. A failed check signals corrupt data, convention misuse, or numerical drift.",
        },
      ],
      workedExample: {
        title: "Prove a quarter-turn is a proper rotation",
        setup: "Use the z-axis quarter-turn R=[[0,-1,0],[1,0,0],[0,0,1]].",
        steps: [
          "Read the columns: c1=(0,1,0), c2=(-1,0,0), c3=(0,0,1).",
          "Compute each length: c1·c1=c2·c2=c3·c3=1.",
          "Compute pairwise dots: c1·c2=c1·c3=c2·c3=0.",
          "Therefore RᵀR=I and R⁻¹=Rᵀ.",
          "Calculate det(R)=+1, so it preserves right-handedness.",
          "Apply R to (1,0,0) and get (0,1,0), with unchanged length 1.",
        ],
        result: "R satisfies both SO(3) conditions and represents a +90° rotation about z.",
        takeaway:
          "A proper rotation must pass orthonormality and determinant checks; neither a convincing drawing nor one check alone is sufficient.",
      },
      handsOn: {
        setup:
          "Build a rigid x-y-z triad from three labelled paper strips or safe craft sticks and use a mirror.",
        steps: [
          "Arrange x and y at 90° and define +z with the right-hand rule.",
          "Rotate the entire triad 90° about +z and record each new axis direction as a matrix column.",
          "Check the three column lengths and three pairwise dot products.",
          "Compute the determinant of the corresponding 2D x-y block and include the unchanged z axis.",
          "Observe the triad in a mirror and write the reflected axis mapping.",
          "Explain which test rejects the mirror mapping even though all axis lengths are preserved.",
        ],
        observe:
          "A physical turn preserves handedness; the mirror reverses it. Both may preserve lengths, so determinant and orthogonality answer different questions.",
        doneWhen:
          "The proper turn passes RᵀR=I and det=+1, while the reflection is explicitly rejected by det=-1.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.integration, roleTitles.software],
        workExample:
          "A 3D HMI, calibration pipeline, or motion stack receives orientations from sensors and transforms. Engineers validate matrices before using them so a malformed orientation does not distort geometry or send planning into an invalid state.",
        interviewPrompt:
          "A 3×3 matrix has determinant 1. Is it definitely a rotation? State the remaining test, tolerance issue, and one physical invariant.",
      },
      commonMistakes: [
        {
          mistake: "Accepting any 3×3 matrix as an orientation.",
          correction: "Require RᵀR≈I and det(R)≈+1.",
        },
        {
          mistake: "Checking determinant only.",
          correction: "Also check unit-length, mutually perpendicular axes; determinant 1 does not exclude shear.",
        },
        {
          mistake: "Confusing whether axes are stored in rows or columns.",
          correction: "State the library convention and verify with a known 90° mapping.",
        },
        {
          mistake: "Comparing floating-point matrices with exact equality.",
          correction: "Use a documented numerical tolerance appropriate to the calculation and data quality.",
        },
      ],
      checkQuestions: [
        {
          question: "What do diagonal and off-diagonal entries of RᵀR test?",
          answer: "Diagonal entries test each column's squared length; off-diagonal entries test pairwise perpendicularity.",
        },
        {
          question: "Why is a reflection excluded from SO(3)?",
          answer: "It reverses handedness and has determinant -1 even though it may preserve lengths.",
        },
        {
          question: "Why is Rᵀ useful?",
          answer: "For a proper rotation, Rᵀ=R⁻¹, so it reverses the orientation mapping without a general matrix inversion.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The current vector visual reduces this topic to a 2D arrow and does not show the crucial handedness/reflection distinction; the physical triad test is more accurate.",
      },
    },
    {
      dayId: 11,
      mentalModel:
        "Orientation is one physical fact with several possible coordinate languages. Euler angles are three ordered instructions; a quaternion is one normalized four-number description. A language can become awkward even when the object itself is perfectly movable.",
      explanation: [
        "Euler angles describe an orientation using three ordered rotations, often called roll, pitch, and yaw. The order and whether rotations use fixed or moving axes must be stated because different conventions produce different orientations from the same three numbers. Euler angles are attractive for human displays, but they are not three independent physical hinges.",
        "For a common yaw-pitch-roll description, pitch near ±90° makes two descriptive axes align. One independent descriptive direction is lost; this is gimbal lock. The phone, drone, or gripper is not physically locked. The coordinate chart is singular, much like longitude becoming ambiguous at a geographic pole.",
        "A unit quaternion represents orientation with four related values. In mathematical scalar-first notation q=(w,x,y,z), a turn θ about unit axis u uses w=cos(θ/2) and (x,y,z)=u sin(θ/2). The norm must be one. q and -q represent the same physical orientation, so component-by-component equality is not a safe orientation comparison.",
        "Component order is a practical trap. ROS geometry messages store (x,y,z,w), while some mathematics texts and libraries display (w,x,y,z). Angles passed to common APIs are usually radians. Production code uses tested conversion utilities, normalizes when appropriate, records the convention, and checks the rotated direction rather than trusting four plausible numbers.",
      ],
      keyTerms: [
        {
          term: "Euler angles",
          meaning: "Three ordered rotations used to describe an orientation.",
          physicalExample: "A display may show a phone's roll, pitch, and yaw.",
        },
        {
          term: "Gimbal lock",
          meaning: "A singularity where two Euler rotation axes align and the description loses one independent direction.",
          physicalExample: "Nested rings at 90° pitch can place the first and third axes on the same line.",
        },
        {
          term: "Quaternion",
          meaning: "A four-component orientation representation whose rotation form has unit norm.",
          physicalExample: "An IMU message may publish x, y, z, w rather than roll, pitch, yaw.",
        },
        {
          term: "Normalization",
          meaning: "Scaling components so their combined norm is one.",
          physicalExample: "A quaternion sensor value drifting from unit length must be handled before use.",
        },
        {
          term: "Convention",
          meaning: "An explicit agreement about axis order, signs, active/passive meaning, and component order.",
          physicalExample: "ROS uses quaternion message fields x, y, z, w; another library may print w first.",
        },
      ],
      physicalExamples: [
        {
          title: "Phone held straight up",
          scenario:
            "Tilt a phone toward 90° pitch while observing a roll-pitch-yaw display.",
          lookFor:
            "The physical phone remains well-defined, but yaw and roll values may change sharply or become coupled because the Euler description is near its singularity.",
        },
        {
          title: "Robot wrist crossing a vertical pose",
          scenario:
            "A gripper moves smoothly through an orientation that makes a chosen Euler pitch 90°.",
          lookFor:
            "The planned physical rotation can remain smooth when represented and interpolated appropriately, while raw Euler components may jump.",
        },
      ],
      workedExample: {
        title: "Encode a 90° yaw and place it in a ROS message",
        setup:
          "Represent a +90° rotation about z. Use scalar-first mathematics, then convert to ROS field order.",
        steps: [
          "Convert θ=90° to θ=π/2 rad.",
          "Take half the angle: θ/2=π/4.",
          "Compute cos(π/4)=sin(π/4)≈0.7071.",
          "Use axis u=(0,0,1): q_math=(w,x,y,z)=(0.7071,0,0,0.7071).",
          "Check the norm: √(0.7071²+0.7071²)≈1.",
          "Write ROS fields as (x,y,z,w)=(0,0,0.7071,0.7071) and verify that +x rotates toward +y.",
        ],
        result:
          "The same orientation is q_math=(0.7071,0,0,0.7071) in wxyz notation and (0,0,0.7071,0.7071) in ROS xyzw fields.",
        takeaway:
          "A correct quaternion still fails integration if its component order, axis convention, or angle unit is misunderstood.",
      },
      handsOn: {
        setup:
          "Use three paper rings or strips joined as nested gimbals, a marked cardboard phone, and a calculator.",
        steps: [
          "Label the three ordered Euler axes and write the exact order you will use.",
          "Set the middle ring to 0° and identify three visibly distinct axes.",
          "Move the middle ring to 90° and identify the two axes that now align.",
          "Rotate the cardboard phone slightly around the aligned direction and note how two Euler instructions can describe coupled motion.",
          "Calculate the 90° z quaternion from half-angle sine and cosine.",
          "Write it once in wxyz order and once in ROS xyzw order, then mark which value belongs to each field.",
        ],
        observe:
          "The nested-ring coordinate mechanism loses a descriptive direction at gimbal lock; the physical phone itself still has an orientation.",
        doneWhen:
          "You can demonstrate the aligned axes, explain the coordinate singularity without calling it a motor lock, and produce a unit quaternion in both component orders.",
      },
      jobConnection: {
        roles: [roleTitles.hmi, roleTitles.integration, roleTitles.software],
        workExample:
          "A robot UI may display Euler angles for people while the ROS 2 stack exchanges quaternions. The engineer must convert safely, avoid discontinuous displays, preserve normalization, and match message/library component order.",
        interviewPrompt:
          "A pose looks correct until pitch approaches 90°, then yaw jumps. Explain whether the robot is locked, how you would represent the orientation internally, and which ROS component-order check you would make.",
      },
      commonMistakes: [
        {
          mistake: "Calling gimbal lock a physical inability of the robot to rotate.",
          correction: "Describe it as a singularity of a particular Euler-angle coordinate convention.",
        },
        {
          mistake: "Using an unstated roll-pitch-yaw order.",
          correction: "Document the exact axis/order convention at every interface and test a known orientation.",
        },
        {
          mistake: "Sending a wxyz array directly into ROS xyzw fields.",
          correction: "Map named components, not array positions, and verify by rotating a known basis vector.",
        },
        {
          mistake: "Treating q and -q as different physical orientations.",
          correction: "Use an orientation-aware angular comparison; both quaternions represent the same rotation.",
        },
      ],
      checkQuestions: [
        {
          question: "What is actually lost at Euler gimbal lock?",
          answer: "One independent direction in that coordinate description; the rigid body itself remains free to rotate subject to its mechanism.",
        },
        {
          question: "What is the identity quaternion in ROS message order?",
          answer:
            "In ROS message order it is `(x,y,z,w)=(0,0,0,1)`: the vector part is zero and the unit scalar represents no rotation.",
        },
        {
          question: "Why does the quaternion formula use half the physical rotation angle?",
          answer: "That is the unit-quaternion rotation parameterization: scalar and vector parts are cos(θ/2) and u sin(θ/2).",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The existing coordinate visual shows quaternion numbers but not axis alignment, so it cannot honestly explain gimbal lock; the inspected paper-gimbal exercise does.",
      },
    },
    {
      dayId: 12,
      mentalModel:
        "SE(3) is a rigid moving box with a three-axis compass attached. One 4×4 table stores how the box is turned and where its origin is, so the same operation can move every point fixed to the box.",
      explanation: [
        "A rigid 3D pose needs a 3×3 rotation R and a 3D translation t. A homogeneous transform collects them as T=[[R,t],[0,0,0,1]]. The set of all valid rigid transforms is called SE(3). Valid transforms can be composed, have valid inverses, and preserve distances between points.",
        "The extra fourth coordinate makes rotation and translation work in one matrix multiplication. A physical point is written [x,y,z,1]ᵀ, so the translation column is included. A free direction or displacement is written [x,y,z,0]ᵀ, so translation contributes nothing. Rotation affects both.",
        "Frame labels still govern the calculation. If T_AB maps B coordinates to A coordinates, then p_A=T_AB p_B. Composition T_AB T_BC maps C to A. Its inverse uses Rᵀ and -Rᵀt. A 4×4 matrix with the right shape is not automatically in SE(3); its R block must be a proper rotation and its last row must have the homogeneous form.",
        "SE(3) solves representation, not calibration. A perfectly valid matrix can still contain a wrong camera offset, an old timestamp, swapped frames, or metres interpreted as millimetres. Verify one known point, one direction, pairwise distance preservation, and an inverse round trip before trusting a pose in a robot task.",
      ],
      keyTerms: [
        {
          term: "SE(3)",
          meaning: "The set of rigid 3D transformations containing proper rotation and translation.",
          physicalExample: "Every collision-free pose of a solid camera body can be represented by an SE(3) matrix.",
        },
        {
          term: "Homogeneous transform",
          meaning: "A 4×4 matrix combining a 3D rotation and translation.",
          physicalExample: "One matrix places every model point of a gripper into the robot base frame.",
        },
        {
          term: "Homogeneous point",
          meaning: "A 3D point extended with w=1 so translation affects it.",
          physicalExample: "A marked corner on a moving box changes position when the box is carried.",
        },
        {
          term: "Direction vector",
          meaning: "A free direction extended with w=0 so translation does not shift it.",
          physicalExample: "The camera's forward arrow changes with rotation but not with where the camera is placed.",
        },
        {
          term: "Rigid invariant",
          meaning: "A quantity such as distance or angle that a rigid transform must preserve.",
          physicalExample: "The distance between two bolts on a gripper remains fixed in every pose.",
        },
      ],
      physicalExamples: [
        {
          title: "Wrist-mounted camera",
          scenario:
            "A camera is bolted to a gripper. The arm changes both the camera origin and viewing direction.",
          lookFor:
            "Camera image rays use w=0; reconstructed scene points use w=1. Both rotate, but only the points receive translation.",
        },
        {
          title: "Crate on a conveyor turntable",
          scenario:
            "A rigid crate turns 90° and shifts to a new station while three corner markers remain fixed to it.",
          lookFor:
            "One SE(3) transform moves all marker coordinates, and every pairwise marker distance stays constant.",
        },
      ],
      workedExample: {
        title: "Transform one point and one direction",
        setup:
          "Use a +90° z rotation and translation t=(1,2,0) m. The local point is p=(0.5,0,0), and a local direction is d=(0.5,0,0).",
        steps: [
          "Build Rz(90°)=[[0,-1,0],[1,0,0],[0,0,1]].",
          "Place R and t into T=[[R,t],[0,0,0,1]].",
          "Extend the point as p_h=(0.5,0,0,1).",
          "Multiply: rotation gives (0,0.5,0), then w=1 adds t, producing (1,2.5,0,1).",
          "Extend the direction as d_h=(0.5,0,0,0).",
          "Multiply again: rotation gives (0,0.5,0), and w=0 blocks translation, producing (0,0.5,0,0).",
        ],
        result:
          "The point moves to (1,2.5,0) m, while the direction becomes (0,0.5,0) without being shifted.",
        takeaway:
          "The fourth coordinate distinguishes a location from a free direction while using the same transform matrix.",
      },
      handsOn: {
        setup:
          "Use a small box, three labelled corner stickers, a paper x-y-z triad, a ruler, and graph paper.",
        steps: [
          "Attach the local triad and record all three sticker coordinates in the box frame.",
          "Choose a simple quarter-turn and translation and write the corresponding R and t.",
          "Build the 4×4 homogeneous transform with bottom row [0,0,0,1].",
          "Predict each sticker's new coordinates using w=1.",
          "Transform the box's forward arrow using w=0.",
          "Place the box as specified, measure the predicted positions, and compare all three pairwise distances before and after.",
        ],
        observe:
          "Every attached point receives the same rigid placement; their mutual geometry is unchanged. The direction arrow turns but does not inherit the box origin.",
        doneWhen:
          "Three point predictions agree within measurement tolerance, the direction calculation excludes translation, and all pairwise distances are preserved.",
      },
      jobConnection: {
        roles: [roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample:
          "Calibration and motion code exchange SE(3) poses for cameras, tools, bases, and targets. An engineer validates the rotation block, units, frame direction, and known fixture points before enabling motion.",
        interviewPrompt:
          "Why are points represented with w=1 and directions with w=0? Show what translation does to each and name two checks for an incoming 4×4 pose.",
      },
      commonMistakes: [
        {
          mistake: "Using w=1 for a velocity, normal, or direction.",
          correction: "Use w=0 for a free direction so translation cannot change it.",
        },
        {
          mistake: "Assuming any 4×4 numeric matrix is a rigid pose.",
          correction: "Validate RᵀR≈I, det(R)≈1, and the homogeneous bottom row.",
        },
        {
          mistake: "Negating t without rotating it when inverting T.",
          correction: "Use T⁻¹=[[Rᵀ,-Rᵀt],[0,0,0,1]].",
        },
        {
          mistake: "Treating a valid pose as proof of correct calibration.",
          correction: "Test known physical points, distances, frames, units, and timestamps.",
        },
      ],
      checkQuestions: [
        {
          question: "What four blocks make up a homogeneous transform?",
          answer: "A 3×3 proper rotation R, a 3×1 translation t, a 1×3 zero row, and bottom-right value 1.",
        },
        {
          question: "What does p_A=T_AB p_B mean?",
          answer: "The same physical point described in frame B is converted into coordinates in frame A.",
        },
        {
          question: "Name one numerical and one physical check for T.",
          answer: "Numerically check the SO(3) rotation and bottom row; physically check a known point, distance, or inverse round trip.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The current visual repeats Day 8's 2D fixture and does not distinguish w=1 points from w=0 directions; the dual calculation above is the more faithful teaching device.",
      },
    },
    {
      dayId: 13,
      mentalModel:
        "Forward kinematics is a chain of rulers and hinges. Starting at the bolted base, every hinge turns the direction inherited by all links after it; adding each link's contribution locates the tool.",
      explanation: [
        "Forward kinematics, shortened to FK, maps known joint values and known robot geometry to an end-effector pose. Its input is the configuration q plus link and frame definitions. Its output must name the reference frame. FK asks 'where does this configuration put the tool?' It does not choose the configuration for a desired target.",
        "For a two-link flat arm, link 1 points at θ1. Link 2 points at the absolute angle θ1+θ2 because the elbow rotates relative to link 1 and inherits the shoulder turn. Each link contributes a horizontal component l cos(angle) and a vertical component l sin(angle); adding the two contributions gives the tool position.",
        "A longer serial arm follows the same ordered idea with one rigid transform per joint and link. General robotics software composes those transforms rather than writing a custom sine-cosine equation for every mechanism. The calculation remains deterministic: the same model and joint values should return the same pose.",
        "The physical robot can disagree with its mathematical model. Link-length measurement error, joint zero offsets, backlash, flex, or a swapped sign create FK error even when code implements the equation correctly. Credible work compares predicted and measured tool positions in the same frame and unit, then reports the residual instead of hiding it.",
      ],
      keyTerms: [
        {
          term: "Forward kinematics",
          meaning: "The map from joint configuration and robot geometry to tool pose.",
          physicalExample: "Shoulder and elbow angles predict where a desk-lamp bulb sits.",
        },
        {
          term: "Serial chain",
          meaning: "Links and joints connected one after another from base to tool.",
          physicalExample: "base → shoulder link → elbow link → gripper.",
        },
        {
          term: "Joint zero offset",
          meaning: "The difference between a sensor's reported zero and the model's physical zero.",
          physicalExample: "An encoder reads 0° while the link is actually tilted 3°.",
        },
        {
          term: "End effector",
          meaning: "The robot part whose task pose is being predicted or controlled.",
          physicalExample: "A gripper jaw, welding torch, camera, or suction cup.",
        },
        {
          term: "Residual error",
          meaning: "The measured difference between predicted and observed result.",
          physicalExample: "A predicted tip at (60.6,5.0) cm is measured 8 mm away.",
        },
      ],
      physicalExamples: [
        {
          title: "Adjustable desk lamp",
          scenario:
            "Two rigid bars with shoulder and elbow hinges position the bulb above a table.",
          lookFor:
            "The second bar's table direction includes both hinge turns, not only the elbow angle.",
        },
        {
          title: "Excavator boom and stick",
          scenario:
            "Measured boom and stick angles predict the bucket-pin position relative to the vehicle body.",
          lookFor:
            "Cylinder play and flex can make the real bucket differ from the ideal rigid-link prediction.",
        },
      ],
      workedExample: {
        title: "Predict a two-link tool position",
        setup:
          "Use l1=0.40 m, l2=0.30 m, θ1=30°, and relative elbow angle θ2=-60°.",
        steps: [
          "Convert angles if coding: θ1=π/6 rad and θ2=-π/3 rad.",
          "Find link 2's absolute angle: θ1+θ2=-30°.",
          "Compute x=0.40 cos30° + 0.30 cos(-30°).",
          "Using cos30°≈0.8660, x≈0.3464+0.2598=0.6062 m.",
          "Compute y=0.40 sin30° + 0.30 sin(-30°)=0.2000-0.1500=0.0500 m.",
          "Check maximum reach: √(x²+y²)≈0.608 m, which is below l1+l2=0.70 m.",
        ],
        result: "The predicted tool point is approximately (0.606,0.050) m in the base frame.",
        takeaway:
          "Each downstream link inherits upstream joint rotation; use θ1+θ2 for the second link's absolute direction.",
      },
      handsOn: {
        setup:
          "Build a two-link cardboard arm with paper fasteners, draw a base frame, and use a protractor and ruler.",
        steps: [
          "Measure both link lengths from joint centre to joint centre or tool mark.",
          "Define angle-zero direction, positive rotation, and base-frame units.",
          "Choose three angle pairs including one negative relative elbow angle.",
          "Calculate each predicted tip coordinate before positioning the arm.",
          "Set the arm with a protractor and mark the measured tip coordinate.",
          "Calculate x error, y error, and Euclidean position residual for every trial.",
          "Change one model parameter only—such as a measured link length or zero offset—and show whether the residual improves.",
        ],
        observe:
          "Small angle or length errors can grow into visible tool error, especially when links are long or nearly aligned.",
        doneWhen:
          "Three trials include predicted pose, measured pose, residual with units, and one justified model correction.",
      },
      jobConnection: {
        roles: [roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample:
          "Robot bring-up and application engineers compare encoder joint states with expected tool poses. They use FK to validate model geometry, joint signs, zero offsets, and frame conventions before motion planning or calibration acceptance.",
        interviewPrompt:
          "For a two-link arm, why is the second link angle θ1+θ2? List four reasons measured tool position may disagree with correct FK code.",
      },
      commonMistakes: [
        {
          mistake: "Using θ2 as the second link's world angle.",
          correction: "For a relative revolute elbow, use the inherited absolute angle θ1+θ2.",
        },
        {
          mistake: "Mixing link lengths in centimetres with output expected in metres.",
          correction: "Convert all geometry to one declared unit before calculation.",
        },
        {
          mistake: "Reporting only the predicted point without a frame.",
          correction: "State that the output is expressed in the chosen base frame and define its axes.",
        },
        {
          mistake: "Calling a measured mismatch a formula failure immediately.",
          correction: "Inspect calibration, zero offsets, backlash, flex, signs, measurement uncertainty, and frame conventions.",
        },
      ],
      checkQuestions: [
        {
          question: "What are FK's inputs and output?",
          answer: "Joint configuration plus robot geometry/frame conventions map to an end-effector pose in a named frame.",
        },
        {
          question: "If both links are 1 m and θ1=0°, θ2=90°, where is the tip?",
          answer:
            "The tip is at `(1,1)` m in the base frame: the first link reaches `(1,0)`, then the second link points along positive y.",
        },
        {
          question: "Can two different joint configurations produce the same tool position?",
          answer: "Yes. FK is single-valued from q to pose, but the inverse map can have multiple solutions.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "The existing two-link vector diagram directly connects joint angles and link lengths to a tool point and materially supports the component calculation.",
      },
    },
    {
      dayId: 14,
      mentalModel:
        "A Jacobian is a local nudge map. Nudge one joint a tiny known amount and watch the tool's tiny movement; collect one such movement per joint. Numerical inverse kinematics repeatedly uses that nearby map to choose the next safe nudge toward a target.",
      explanation: [
        "The Jacobian J connects small joint motion to small tool motion near the current configuration. In velocity form, x_dot≈J q_dot. Each column answers a concrete experiment: if this one joint moves at unit speed while other joints stay still, what tool velocity appears? The values and even usable directions change as the robot changes configuration.",
        "A finite-difference Jacobian estimates each column without symbolic calculus. Run FK at q, increase one joint by a small ε, run FK again, subtract the tool positions, and divide by ε. Revolute-joint columns then carry units such as metres per radian. ε must be small enough to be local but not so tiny that floating-point or measurement noise dominates.",
        "Numerical inverse kinematics starts with a guess q. It computes target error e=x_target-FK(q), obtains a Jacobian, chooses a limited update such as Δq=J⁺e, applies joint limits, and repeats. J⁺ is the pseudoinverse. Because the model is nonlinear, the first update is usually an approximation; the starting guess can lead to a different solution or no convergence.",
        "A singular configuration loses instantaneous movement in at least one task direction, and a target can be unreachable because of link length, joint limits, or obstacles. A robust solver clamps each update, limits iterations and time, evaluates the final FK residual, and returns non-converged when the tolerance is not met. Damped least squares is often used near singularities, but damping reduces sensitivity rather than making impossible targets reachable.",
        "IK output is not automatically a safe motion. A joint solution still needs collision, velocity, acceleration, torque, and workspace checks before a controller uses it. This lesson stops at bounded geometric search so the separation between pose solving and safe execution remains clear.",
      ],
      keyTerms: [
        {
          term: "Jacobian",
          meaning: "A configuration-dependent local map from joint rates to tool velocity.",
          physicalExample: "A small elbow turn may move the hand mostly sideways in one pose and mostly upward in another.",
        },
        {
          term: "Finite difference",
          meaning: "A local slope estimate made from a small input change and observed output change.",
          physicalExample: "Move one cardboard hinge by 1° and divide the tip displacement by that angle.",
        },
        {
          term: "Inverse kinematics",
          meaning: "Finding joint values that achieve a requested tool pose.",
          physicalExample: "Choosing shoulder and elbow angles that place a gripper over a part.",
        },
        {
          term: "Pseudoinverse",
          meaning: "A generalized matrix inverse used for non-square, redundant, or singular local systems.",
          physicalExample: "It can choose a smallest joint update when several local updates fit the same tool correction.",
        },
        {
          term: "Singularity",
          meaning: "A configuration where the Jacobian loses rank and the tool loses an instantaneous motion direction.",
          physicalExample: "A fully stretched flat arm cannot create a tiny outward hand motion by infinitesimal joint rotation.",
        },
        {
          term: "Residual",
          meaning: "The remaining target error after an IK attempt.",
          physicalExample: "The requested point is still 5 mm from the FK result after the final iteration.",
        },
      ],
      physicalExamples: [
        {
          title: "Human arm near full extension",
          scenario:
            "Hold your hand still and compare tiny elbow/shoulder effects with the arm bent and nearly straight.",
          lookFor:
            "Near full extension, joint turns mostly move the hand sideways; immediate outward motion becomes poorly available.",
        },
        {
          title: "Excavator reaching a marked point",
          scenario:
            "An operator repeatedly adjusts boom and stick by small amounts while watching bucket error.",
          lookFor:
            "Each correction uses the local effect of the joints; a target beyond total reach remains impossible regardless of repeated nudges.",
        },
      ],
      workedExample: {
        title: "One bounded IK update for a two-link arm",
        setup:
          "Use two 1 m links, initial q=(0,π/2) rad, current FK point (1,1) m, and target (1.1,1.0) m.",
        steps: [
          "Compute error e=target-current=(0.1,0.0) m.",
          "Estimate or derive the local Jacobian at q: J=[[-1,-1],[1,0]] m/rad.",
          "Read its columns: a small shoulder turn moves the tip approximately (-1,+1) m per rad; a small elbow turn moves it (-1,0) m per rad.",
          "Solve J Δq=e, giving Δq≈(0,-0.1) rad; this respects a 0.1 rad step limit.",
          "Update q to approximately (0,1.4708) rad, or (0°,84.27°).",
          "Run FK again: point≈(1.0998,0.9950) m, so residual≈0.0050 m.",
          "Because 5 mm is above a hypothetical 1 mm tolerance, report 'continue' rather than success and compute another bounded iteration.",
        ],
        result:
          "One local update reduces 100 mm error to about 5 mm but has not yet met the 1 mm success condition.",
        takeaway:
          "Every numerical IK success claim must be confirmed by running FK on the answer and comparing the residual with a declared tolerance.",
      },
      handsOn: {
        setup:
          "Use the browser two-link arm visualizer or a short Python notebook with FK, plus one reachable and one unreachable target.",
        steps: [
          "Record link lengths, joint limits, starting q, frame, units, error tolerance, maximum iterations, and maximum joint step.",
          "Run FK at the starting q and compute target error.",
          "Perturb each joint by ε=0.01 rad, rerun FK, and build one finite-difference Jacobian column at a time.",
          "Compute a pseudoinverse or damped-least-squares update and clamp every joint step.",
          "Apply the update, enforce joint limits, and log iteration, q, residual, and clamp status.",
          "Stop only on tolerance, iteration/time budget, invalid numbers, or no useful progress.",
          "Repeat for the unreachable target and confirm the solver returns non-converged with final residual rather than false success.",
        ],
        observe:
          "Progress depends on starting pose and local geometry. Near singularity, updates can grow or improve little; bounded stopping makes this visible and safe.",
        doneWhen:
          "The reachable target meets a declared tolerance, the unreachable target exits within budget, and both traces include final FK residual, iterations, limits, and status.",
      },
      jobConnection: {
        roles: [roleTitles.deployment, roleTitles.integration, roleTitles.software],
        workExample:
          "Manipulation software and field integration use Jacobians and IK to turn task-space targets into joint goals. Engineers diagnose non-convergence, poor initial guesses, frame errors, singular poses, and limit violations without converting them into unsafe commands.",
        interviewPrompt:
          "Describe a bounded numerical IK loop. What does one Jacobian column mean, what can cause non-convergence, and what evidence is required before returning success?",
      },
      commonMistakes: [
        {
          mistake: "Assuming IK has one unique answer.",
          correction: "Expect zero, one, or multiple solutions depending on geometry, constraints, and initial guess.",
        },
        {
          mistake: "Using an unbounded pseudoinverse update near a singularity.",
          correction: "Use damping or another robust method, clamp steps, enforce limits, and stop on poor progress.",
        },
        {
          mistake: "Declaring success from small joint updates.",
          correction: "Run FK and compare task-space residual with the declared tolerance.",
        },
        {
          mistake: "Sending an IK solution directly to hardware.",
          correction: "Treat IK as geometry only; apply collision, dynamic, command, and safety checks before execution.",
        },
      ],
      checkQuestions: [
        {
          question: "What does column j of a position Jacobian describe?",
          answer: "The local tool-velocity contribution when joint j moves at unit rate and the other joints have zero rate.",
        },
        {
          question: "Why does the Jacobian need recalculation during iterative IK?",
          answer: "It is a local map that changes with the robot configuration.",
        },
        {
          question: "What must a failed solver return?",
          answer: "A bounded non-converged status plus final residual, iterations/time, active limits, and any known failure cause.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "The existing arm visual can contrast verified reach with an unreachable or singular case, which is the most important corrective image for numerical IK.",
      },
    },
  ],
} satisfies ChapterContent;
