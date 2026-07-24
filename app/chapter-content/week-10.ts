import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION = "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION = "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI = "Robot Learning Deployment / Physical AI Integration Engineer";

export const week10Content = {
  week: 10,
  title: "Turn depth measurements into safe, inspectable 3D targets",
  purpose:
    "Move from flat image regions to measured geometry: understand how depth sensors fail, back-project valid pixels into a framed point cloud, reduce and segment that cloud, estimate an object pose and approach frame, calibrate the sensor to the robot, and reject targets when the evidence is too weak for a safe downstream action.",
  prerequisites: [
    "Use Week 9 image coordinates, camera intrinsics, distortion correction, timestamps, confidence thresholds, overlays, and frozen evaluation examples.",
    "Follow a tf2 frame tree and compose a rigid transform while keeping metres, pixels, axes, direction, and acquisition time explicit.",
    "Run small Python examples and inspect arrays, images, point clouds, logs, and saved result tables.",
    "Keep all exercises offline, recorded, or simulated; no perception result in this chapter authorizes motion on a powered robot.",
  ],
  outcomes: [
    "Compare passive stereo, structured-light, and time-of-flight depth by their measured signal, useful conditions, and characteristic invalid or biased returns.",
    "Back-project a valid depth pixel with camera intrinsics, publish or inspect its ROS camera metadata, and preserve frame, timestamp, encoding, scale, and validity.",
    "Build a point cloud, apply a task-sized voxel filter, transform it at the measurement time, and explain which geometric detail the filter removes.",
    "Extract a tabletop with a bounded plane model, refine overlapping cloud alignment with ICP, and reject registrations that lack a credible initial guess or geometric support.",
    "Separate axis-aligned extent, oriented extent, 6D object pose, symmetry, and the task-specific approach frame consumed by a planner.",
    "Estimate and validate a camera-to-robot extrinsic transform on held-out observations rather than accepting a visually plausible overlay.",
    "Measure missing-depth patterns and run an end-to-end target pipeline whose quality gates, overlays, rejection reasons, timing, and bad cases are reproducible.",
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
      label: "OpenCV — Depth Map from Stereo Images",
      url: "https://docs.opencv.org/4.x/dd/d53/tutorial_py_depthmap.html",
      useFor:
        "The official disparity relationship, stereo block-matching example, and the texture, speckle, disparity-range, and uniqueness controls that reveal why stereo depth can be invalid.",
    },
    {
      label: "OpenCV — Camera Calibration and 3D Reconstruction",
      url: "https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html",
      useFor:
        "The pinhole projection model, intrinsic and extrinsic parameters, distortion, stereo calibration and rectification, triangulation, reprojection, and pose functions used in the chapter.",
    },
    {
      label: "Open3D — Point cloud tutorial",
      url: "https://www.open3d.org/docs/release/tutorial/geometry/pointcloud.html",
      useFor:
        "Official behavior for voxel downsampling, normal estimation, cropping, bounding volumes, clustering, and RANSAC plane segmentation on point clouds.",
    },
    {
      label: "Open3D — ICP registration tutorial",
      url: "https://www.open3d.org/docs/release/tutorial/pipelines/icp_registration.html",
      useFor:
        "The correspondence-and-update loop, required rough initial alignment, point-to-point and point-to-plane objectives, fitness, inlier RMSE, and convergence limits.",
    },
    {
      label: "ROS 2 Jazzy common_interfaces — sensor_msgs definitions",
      url: "https://github.com/ros2/common_interfaces/tree/jazzy/sensor_msgs/msg",
      useFor:
        "Primary CameraInfo, Image, PointCloud2, and PointField contracts for acquisition time, optical frame, calibration matrices, encodings, organized cloud shape, fields, and invalid samples.",
    },
  ],
  days: [
    {
      dayId: 64,
      mentalModel:
        "A depth camera is a ruler that asks light a question; different rulers ask differently, and a blank answer is not the same as zero distance.",
      explanation: [
        "A normal color image tells which light reached each pixel but does not directly tell how far the surface was. A depth image adds one range value for each usable pixel. Passive stereo uses two separated cameras and matches the same feature in both images. Structured light projects a known pattern and measures how the pattern shifts. Time-of-flight sensors estimate travel time or phase of emitted light. All three produce estimates, not guaranteed truth.",
        "For a rectified stereo pair, corresponding points lie on the same image row. Their horizontal separation is disparity `d`. With focal length `f` in pixels and camera baseline `B` in metres, depth is `Z = fB / d`. Large disparity means a nearby point; small disparity means a distant point. The equation assumes correct calibration, rectification, correspondence, units, and nonzero disparity. A neat number from broken assumptions remains broken.",
        "Once a pixel `(u, v)` has valid depth `Z`, the pinhole model back-projects it into the optical camera frame: `X = (u - cx)Z / fx` and `Y = (v - cy)Z / fy`. In the standard ROS optical-frame convention, x points right in the image, y points down, and z points forward. The depth image and its `CameraInfo` must describe the same camera geometry, resolution, frame, and acquisition time or the reconstructed point will be displaced.",
        "Each sensing method has recognizable weak cases. Stereo struggles on plain or repeating texture, narrow edges, occlusion boundaries, and poor left-right matches. Active projected light can be washed out by strong ambient light or disturbed by another projector. Dark, shiny, transparent, distant, or steeply angled surfaces can absorb, redirect, mix, or weaken returns. Keep a validity mask and a reason for rejection; never turn invalid depth into a confident obstacle or target.",
      ],
      keyTerms: [
        {
          term: "Depth image",
          meaning:
            "A pixel grid whose valid entries estimate distance along the camera viewing direction under a declared encoding and scale.",
          physicalExample:
            "A cup pixel may store 820 in a millimetre image, meaning about 0.82 m only if the driver contract says the unit is millimetres.",
        },
        {
          term: "Disparity",
          meaning:
            "The horizontal pixel difference between matching points in a rectified stereo pair.",
          physicalExample:
            "A nearby finger shifts much farther between left-eye and right-eye views than a far wall does.",
        },
        {
          term: "Baseline",
          meaning:
            "The measured separation between the optical centres of the two cameras in a stereo pair.",
          physicalExample:
            "Two cameras mounted 0.10 m apart have a 0.10 m baseline when that value uses metres consistently.",
        },
        {
          term: "Back-projection",
          meaning:
            "The conversion of a pixel plus valid depth and intrinsics into a 3D point in the camera frame.",
          physicalExample:
            "A pixel 100 columns right of the principal point becomes a positive camera-x coordinate.",
        },
        {
          term: "Validity mask",
          meaning:
            "A same-sized map stating which depth entries may be used after range, encoding, confidence, and finite-value checks.",
          physicalExample:
            "Pixels on a glass rim are marked invalid rather than filled with zero and treated as real geometry.",
        },
      ],
      physicalExamples: [
        {
          title: "Two-eye finger test",
          scenario:
            "Hold one finger near your face and alternately close each eye, then repeat with the finger farther away while keeping the background fixed.",
          lookFor:
            "The near finger appears to jump farther relative to the background, showing that stereo disparity grows as depth decreases.",
        },
        {
          title: "Pattern on paper and foil",
          scenario:
            "Shine a patterned light onto matte paper, crumpled foil, and a clear plastic sheet without using the result to control anything.",
          lookFor:
            "The matte surface preserves a readable pattern while reflection and transmission can redirect or erase parts of it, which explains invalid active-depth regions.",
        },
      ],
      workedExample: {
        title: "Recover one stereo point and state its limits",
        setup:
          "A rectified stereo pair has `f = fx = fy = 500 px`, baseline `B = 0.10 m`, and principal point `(cx, cy) = (320, 240) px`. A match appears at `(u, v) = (420, 265) px` with disparity `d = 25 px`.",
        steps: [
          "Check the contract first: focal length and disparity are in pixels, baseline is in metres, the pair is rectified, and disparity is positive and nonzero.",
          "Calculate depth: `Z = fB / d = 500 × 0.10 / 25 = 2.00 m`.",
          "Calculate camera x: `X = (420 - 320) × 2.00 / 500 = 0.40 m`.",
          "Calculate camera y: `Y = (265 - 240) × 2.00 / 500 = 0.10 m`.",
          "Report the point as `(0.40, 0.10, 2.00) m` in the optical camera frame at the image acquisition time.",
          "Mark the result invalid if correspondence, rectification, calibration, depth range, or left-right consistency fails; the arithmetic cannot certify those inputs.",
        ],
        result:
          "The valid teaching case back-projects to a point 0.40 m right, 0.10 m down, and 2.00 m forward in the optical camera frame.",
        takeaway:
          "Depth geometry is a chain of measured assumptions, so the output needs a frame, time, unit, and validity decision as much as it needs three coordinates.",
      },
      handsOn: {
        setup:
          "Use OpenCV's saved stereo sample or another public, non-sensitive rectified pair. Work offline and keep any robot command path disabled.",
        steps: [
          "Record the image size, focal length, principal point, baseline, disparity scale, valid disparity range, and the exact input files before computing depth.",
          "Create a disparity image and retain the raw disparity plus a display copy; do not use the normalized display colours as metric depth.",
          "Choose three pixels in textured, textureless, and occlusion-edge regions, run the validity checks, and back-project only those that pass.",
          "Change one matcher setting at a time, such as block size or uniqueness ratio, and compare valid count, speckles, edge bleeding, and one known-distance error.",
          "Plant one wrong baseline unit or unrectified input, capture the plausible-looking but incorrect output, then restore the recorded contract.",
          "Save a small table with pixel, disparity, calculated depth, validity reason, frame, timestamp source, and expected physical limitation.",
        ],
        observe:
          "Reliable regions should have coherent disparity and plausible geometry; weak texture and boundaries should expose holes or unstable matches rather than silently becoming exact surfaces.",
        doneWhen:
          "The saved example reproduces one correct back-projection, one rejected sample, and one documented unit or rectification failure from the same declared inputs.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Bring up a stereo or RGB-D stream, verify calibration, encodings, optical frames, timestamps, depth scale, and invalid-pixel behavior before allowing its measurements into collision checking or target estimation.",
        interviewPrompt:
          "Compare stereo, structured light, and time of flight; derive `Z = fB/d`; then explain which metadata and failure checks you require before back-projecting a ROS depth image.",
      },
      commonMistakes: [
        {
          mistake: "Reading a colourized depth display as if its colour values were physical metres.",
          correction:
            "Use the raw depth or disparity encoding and its documented scale; keep visualization normalization out of the metric computation.",
        },
        {
          mistake: "Replacing every invalid, NaN, saturated, or unmatched depth value with zero.",
          correction:
            "Preserve a validity mask and rejection reason because missing depth is unknown evidence, while zero may be interpreted as a real point at the sensor.",
        },
        {
          mistake: "Applying `Z = fB/d` to an unrectified pair or mixing millimetres and metres.",
          correction:
            "Verify calibration and rectification, require positive usable disparity, and normalize the baseline and output to declared physical units.",
        },
      ],
      checkQuestions: [
        {
          question: "What happens to stereo depth when disparity becomes smaller but `f` and `B` stay fixed?",
          answer:
            "Calculated depth grows because `Z = fB/d`; small disparity also makes a one-pixel matching error more damaging to the depth estimate.",
        },
        {
          question: "Which frame contains a point immediately after pinhole back-projection?",
          answer:
            "The camera optical frame described by the image and CameraInfo contract, not automatically base_link, map, or a grasp frame.",
        },
        {
          question: "Why is a missing depth sample not a measured distance of zero?",
          answer:
            "It means the sensor pipeline could not produce a trusted range under its current conditions; zero is a numerical value that downstream code may treat as real geometry.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A labelled stereo-baseline triangle joined to the pixel-to-camera ray makes inverse disparity and back-projection directions visible together, including the invalid zero-disparity case.",
      },
    },
    {
      dayId: 65,
      mentalModel:
        "A point cloud is a bag of tiny framed measurements, and a voxel filter replaces nearby grains with one representative grain without repairing where the bag was placed.",
      explanation: [
        "Back-projecting many valid depth pixels creates a point cloud. Each sample usually has x, y, and z and may also carry colour, intensity, confidence, or another field. A ROS `PointCloud2` stores a header, height, width, named fields, byte layout, and a density flag. An organized cloud can preserve the image row-column arrangement; an unorganized cloud is commonly one row. Always inspect the actual fields and layout instead of assuming every point has the same extras.",
        "Point clouds become large quickly, so voxel downsampling divides 3D space into cubes and emits one representative point for each occupied cube. Open3D's basic voxel operation averages the points inside each occupied voxel. With voxel size `s`, a teaching index along x is `floor(X/s)`. The size must come from the smallest task-relevant geometry and noise level. A large voxel speeds later work but can erase a thin handle, merge two close objects, or move an edge.",
        "Every cloud belongs to the frame and time in its header. To use camera points near a robot, transform them through the calibrated frame tree at the acquisition timestamp. A current transform applied to an old image can misplace a point when the camera or robot moved between capture and processing. Downsampling before or after a rigid transform gives similar positions in an ideal case, but cropping, voxel grid origin, floating-point details, and changing transforms can alter membership, so record the order.",
        "A useful cloud stage publishes or saves more than pretty dots. Track input count, invalid count, cropped count, output count, voxel size, bounds, frame, stamp, transform age, and processing time. Then test a known point numerically. A cloud can look like the right object while being mirrored, scaled by 1,000, expressed in the wrong frame, or delayed enough to be unsafe.",
      ],
      keyTerms: [
        {
          term: "Point cloud",
          meaning:
            "A collection of sampled 3D points whose coordinates are meaningful only with a declared frame, unit, and acquisition time.",
          physicalExample:
            "Thousands of valid tabletop depth pixels become thousands of camera-frame surface samples.",
        },
        {
          term: "PointCloud2",
          meaning:
            "The ROS sensor message that describes a binary array of points using dimensions, named fields, byte strides, a header, and validity metadata.",
          physicalExample:
            "A cloud can contain `x`, `y`, `z`, and packed colour fields while its header says the samples were acquired in `camera_depth_optical_frame`.",
        },
        {
          term: "Voxel",
          meaning:
            "A small cube in a regular 3D grid used to group nearby points.",
          physicalExample:
            "Several noisy samples inside one 1 cm cube become one averaged representative sample.",
        },
        {
          term: "Rigid transform",
          meaning:
            "A rotation and translation that change a point's coordinate frame without changing the object's physical size or shape.",
          physicalExample:
            "The same cup point receives different coordinates in camera and base frames but remains the same physical point.",
        },
        {
          term: "Organized cloud",
          meaning:
            "A point cloud whose height and width retain a grid relationship such as the source depth image layout.",
          physicalExample:
            "Point row 100, column 220 corresponds to depth-image pixel row 100, column 220 when the producer preserves organization.",
        },
      ],
      physicalExamples: [
        {
          title: "Beans in an ice-cube tray",
          scenario:
            "Scatter several beans into a tray and replace all beans in each occupied compartment with one bean placed near their average position.",
          lookFor:
            "The number of samples drops while the broad occupied shape remains; a small feature disappears when its compartment is shared with a larger surface.",
        },
        {
          title: "Same sticker, two rulers",
          scenario:
            "Measure a sticker from a camera-shaped paper origin and from a robot-base paper origin whose axes and origin are drawn differently.",
          lookFor:
            "The coordinates change with the ruler, but the sticker does not move; the labelled transform connects the two descriptions.",
        },
      ],
      workedExample: {
        title: "Downsample and transform a known camera point",
        setup:
          "A camera-frame point is `(0.42, 0.11, 1.20) m`. The voxel size is `0.10 m`. For a deliberately aligned-axis check, the camera origin is translated by `(0.20, -0.05, 0.30) m` in `base_link` with no rotation.",
        steps: [
          "Compute the teaching voxel indexes: `floor(0.42/0.10)=4`, `floor(0.11/0.10)=1`, and `floor(1.20/0.10)=12`.",
          "Label the voxel `(4, 1, 12)` and remember that Open3D emits the average of all points in that occupied voxel, not necessarily its centre.",
          "Check the transform direction: the stated translation maps camera-frame coordinates into `base_link`, not the reverse.",
          "Because the axes are aligned in this small example, add x: `0.42 + 0.20 = 0.62 m`.",
          "Add y and z: `0.11 - 0.05 = 0.06 m`, and `1.20 + 0.30 = 1.50 m`.",
          "Report `(0.62, 0.06, 1.50) m` in `base_link` at the measurement time, and use a full rotation-plus-translation transform in the real pipeline.",
        ],
        result:
          "The known sample belongs to teaching voxel `(4, 1, 12)` and maps to `(0.62, 0.06, 1.50) m` in the aligned base-frame example.",
        takeaway:
          "Voxelization changes sampling density, while a transform changes coordinates; neither operation validates the other's parameters.",
      },
      handsOn: {
        setup:
          "Use a saved public depth image or generate a synthetic plane plus two boxes. Use Open3D for cloud operations and a declared 4×4 transform; keep hardware disconnected.",
        steps: [
          "Back-project valid samples and print point count, finite-value count, bounds, units, frame name, and timestamp before viewing the cloud.",
          "Save one known point and independently calculate its expected transformed coordinate as a numerical assertion.",
          "Downsample copies at two voxel sizes, then record output count, processing time, box dimensions, and whether the smaller object remains separable.",
          "Apply the declared transform at the recorded acquisition time and draw both camera and base axes beside the transformed cloud.",
          "Inject a 1,000× scale error and a reversed transform, capture their bounds and axis symptoms, then restore the correct contract.",
          "Export the exact input, transform, parameters, metrics, and one before-after view so another person can reproduce the boundary case.",
        ],
        observe:
          "A sensible voxel size reduces repeated surface samples without deleting task-critical geometry, and the asserted known point lands at the expected base-frame coordinate.",
        doneWhen:
          "One command reproduces the original and two downsampled clouds, passes the known-point transform assertion, and exposes both planted frame or scale failures.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Build a ROS 2 point-cloud stage that preserves sensor metadata, meets a latency budget, chooses a task-sized voxel resolution, and rejects stale, malformed, mis-scaled, or untransformable input.",
        interviewPrompt:
          "Describe `PointCloud2` as a data contract, explain voxel downsampling and its information loss, and show how you would prove a cloud was transformed with the correct direction and timestamp.",
      },
      commonMistakes: [
        {
          mistake: "Treating a larger voxel size as a free performance improvement.",
          correction:
            "Compare the voxel size with the smallest required object feature and report both speed and geometric loss before choosing it.",
        },
        {
          mistake: "Changing the cloud's frame label without transforming its coordinates.",
          correction:
            "Apply the correct rigid transform at the measurement timestamp, verify a known point, and only then publish the destination frame.",
        },
        {
          mistake: "Assuming the binary PointCloud2 layout always contains contiguous float x, y, z, and RGB values.",
          correction:
            "Read the message's fields, offsets, datatypes, point step, row step, dimensions, and density contract with supported iterators or libraries.",
        },
      ],
      checkQuestions: [
        {
          question: "What does Open3D's basic voxel downsampling emit for one occupied voxel?",
          answer:
            "One representative point formed by averaging the input points that fall inside that voxel.",
        },
        {
          question: "Can voxel filtering correct a cloud expressed in the wrong coordinate frame?",
          answer:
            "No. It changes sampling density; the frame error requires the correct calibrated, time-valid rigid transform.",
        },
        {
          question: "Why keep point count and bounds before opening a 3D viewer?",
          answer:
            "They quickly expose empty data, invalid values, unit errors, extreme outliers, and implausible scale that a pleasing view may hide.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A three-panel cloud showing raw samples, occupied voxel averages, and the same known point across camera and base axes clarifies two different operations without conflating them.",
      },
    },
    {
      dayId: 66,
      mentalModel:
        "Table extraction finds the broad supporting sheet, while ICP slides one already-near 3D tracing onto another; neither method knows which physical object you intended.",
      explanation: [
        "A tabletop scene often contains one large plane plus objects above it. A plane model `ax + by + cz + d = 0` describes points lying on a flat surface. RANSAC repeatedly samples a small set, proposes a plane, and counts points within a distance threshold as inliers. Open3D's `segment_plane` exposes the distance threshold, sample count, and iteration count. The largest plane is only a mathematical winner; it might be a wall or floor unless orientation, height, region, and support rules identify the table.",
        "Tabletop extraction usually crops to a known workspace, removes invalid and distant points, estimates the support plane, checks its normal and height, then keeps candidate points on the allowed side and within an object-height band. A generous plane threshold can absorb a thin object. A tight threshold can leave noisy table patches as false objects. Record the inlier ratio and rejected geometry while tuning against labelled scenes, not one clean view.",
        "Registration estimates the rigid transform that aligns overlapping clouds. Iterative Closest Point starts from a rough initial transform, finds nearby correspondences under a distance limit, updates the transform to reduce an error, and repeats. Point-to-point ICP reduces coordinate distances. Point-to-plane ICP uses target surface normals and can converge faster on suitable surfaces. ICP is a local refinement method: poor initial alignment, weak overlap, repeated geometry, bad normals, moving objects, or an oversized correspondence distance can produce a convincing wrong alignment.",
        "Open3D reports alignment evidence such as a transformation, fitness, inlier RMSE, and correspondence set. A lower inlier RMSE does not prove the transform is correct if only a tiny or ambiguous part overlaps. Gate registration with expected motion bounds, overlap or fitness, residual, correspondence count, determinant and rigidity checks, and an external geometric test. Keep the initial and final overlays so a reviewer can see what the scalar metrics omit.",
      ],
      keyTerms: [
        {
          term: "Plane model",
          meaning:
            "Four coefficients defining a flat set of 3D points through `ax + by + cz + d = 0`.",
          physicalExample:
            "An ideal horizontal tabletop at z = 0.75 m can be represented by `z - 0.75 = 0` in its chosen frame.",
        },
        {
          term: "RANSAC",
          meaning:
            "A repeated sample-fit-count method that searches for a model supported by many inliers despite outliers.",
          physicalExample:
            "Many tabletop points vote for one plane while points on cups and boxes remain outside its distance band.",
        },
        {
          term: "Plane inlier",
          meaning:
            "A point whose perpendicular distance to the proposed plane is no more than the declared threshold.",
          physicalExample:
            "A point 0.012 m above an estimated plane is accepted when the threshold is 0.020 m.",
        },
        {
          term: "ICP",
          meaning:
            "Iterative Closest Point, a local registration process that alternates correspondence search and transform refinement.",
          physicalExample:
            "A second scan of a stationary box starts a few centimetres offset and is refined onto the first scan.",
        },
        {
          term: "Inlier RMSE",
          meaning:
            "The root-mean-square residual over correspondences accepted by the current registration threshold.",
          physicalExample:
            "An RMSE of 0.008 m summarizes accepted residuals but says nothing about surfaces that never corresponded.",
        },
      ],
      physicalExamples: [
        {
          title: "Tray under scattered blocks",
          scenario:
            "Place several small blocks on a flat tray and imagine dots sampled from every visible surface.",
          lookFor:
            "Most tray dots support one broad plane, while the raised block dots should remain outside a carefully chosen plane-distance band.",
        },
        {
          title: "Align two transparent tracings",
          scenario:
            "Trace part of the same textured object on two transparent sheets, start them slightly offset, and repeatedly match nearby marks before nudging one sheet.",
          lookFor:
            "A close start and distinctive overlap lead to the intended alignment; a far start or repeated pattern can settle on the wrong matching region.",
        },
      ],
      workedExample: {
        title: "Classify plane points, then judge an ICP result",
        setup:
          "An estimated tabletop is `z = 0.75 m` with distance threshold `0.02 m`. Three test points have z values `0.742`, `0.762`, and `0.810 m`. A later ICP run reports fitness `0.68`, inlier RMSE `0.009 m`, and translation `0.032 m`; the gate requires fitness at least `0.60`, RMSE at most `0.012 m`, and translation at most `0.05 m`.",
        steps: [
          "Compute absolute plane distance for the first point: `|0.742 - 0.75| = 0.008 m`, so it is a plane inlier.",
          "For the second point, `|0.762 - 0.75| = 0.012 m`, so it is also an inlier under the 0.02 m threshold.",
          "For the third point, `|0.810 - 0.75| = 0.060 m`, so it remains outside the tabletop plane and may belong to an object.",
          "Check ICP fitness: `0.68 ≥ 0.60`, so the overlap gate passes for this frozen case.",
          "Check residual and motion: `0.009 ≤ 0.012 m` and `0.032 ≤ 0.05 m`, so both declared numeric gates pass.",
          "Accept only as a registration candidate, then inspect the initial/final overlay and a held-out feature because these three metrics cannot rule out a symmetric wrong alignment.",
        ],
        result:
          "Two samples join the support plane, one remains a raised candidate, and the ICP result clears the numeric gates but still requires geometric validation.",
        takeaway:
          "Thresholds classify evidence under a declared model; passing them narrows risk but does not give the algorithm knowledge of object identity or task intent.",
      },
      handsOn: {
        setup:
          "Generate or load a fixed tabletop point cloud with one thin object, one taller object, and a second partially overlapping scan. Record the random seed and do not command hardware.",
        steps: [
          "Crop the declared workspace, report finite points and bounds, and color the raw support surface and raised objects for reference.",
          "Run plane segmentation across three distance thresholds; save plane coefficients, normal direction, inlier count, and which labelled object points were wrongly absorbed.",
          "Add orientation and height checks so a larger wall-like plane cannot silently replace the intended support plane.",
          "Register the second scan from a good initial transform and save fitness, inlier RMSE, correspondence count, final transform, runtime, and overlay.",
          "Repeat from a deliberately poor initial transform or with reduced overlap, require the quality gate to reject the result, and capture the misleading metric or visual symptom.",
          "Restore the valid inputs and assert expected table height, minimum object points, rigid rotation, transform bounds, and deterministic pass or rejection status.",
        ],
        observe:
          "Plane thresholds should show a visible tradeoff between noisy table leftovers and erased thin objects; ICP should refine the close case and explicitly reject the unsupported case.",
        doneWhen:
          "The same command reproduces one accepted tabletop and registration result plus one causally explained failure, with expected and observed metrics attached.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_INTEGRATION],
        workExample:
          "Diagnose a tabletop picking scene where a low part disappears or two scans misalign, separating crop, plane threshold, normal, initial transform, overlap, correspondence, and frame faults with replayable evidence.",
        interviewPrompt:
          "Explain how RANSAC plane segmentation and ICP solve different problems, why each needs task-specific gates, and how a low registration residual can still accompany a wrong physical alignment.",
      },
      commonMistakes: [
        {
          mistake: "Calling the largest RANSAC plane the tabletop without checking its orientation, height, or workspace.",
          correction:
            "Gate the plane against the expected support region, normal direction, height range, inlier support, and downstream object evidence.",
        },
        {
          mistake: "Increasing the plane distance threshold until the table looks clean.",
          correction:
            "Evaluate labelled thin objects and noisy table patches together because a wide threshold can erase the geometry the robot needs.",
        },
        {
          mistake: "Starting ICP from identity for every scene and trusting the smallest RMSE.",
          correction:
            "Supply a credible initial transform, require adequate overlap and bounded motion, and validate the final transform with overlays and held-out geometry.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can the largest detected plane be the wrong support surface?",
          answer:
            "RANSAC maximizes geometric support, not task meaning; a wall or floor may contain more inliers than the tabletop.",
        },
        {
          question: "What two operations repeat inside basic ICP?",
          answer:
            "It finds correspondences under the current transform, then updates the transform to reduce the chosen correspondence error.",
        },
        {
          question: "Why must fitness and inlier RMSE be read together with an overlay and motion bounds?",
          answer:
            "Residual covers accepted correspondences and fitness summarizes overlap, but partial or repeated geometry can still support an incorrect rigid transform.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A shared 3D view can contrast support-plane inliers with erased thin-object points and show ICP converging from a close seed versus settling incorrectly from a poor seed.",
      },
    },
    {
      dayId: 67,
      mentalModel:
        "A box describes occupied extent, a pose describes an object's frame, and an approach frame describes how a tool should arrive; they answer three different questions.",
      explanation: [
        "After removing the support plane, nearby points can be grouped into object candidates. An axis-aligned bounding box uses the current frame's x, y, and z axes, so its size changes when a long object rotates. An oriented bounding box rotates to follow the point distribution and can be tighter, but noise, partial views, and symmetric shapes can flip its axes. Box extent is useful for clearance and rough size; it is not automatically a stable object pose.",
        "A 6D pose combines 3D position with 3D orientation. The name describes six degrees of freedom, not a requirement to store exactly six numbers; ROS commonly represents orientation with a quaternion. Pose must name the parent and child frames and the transform direction. A cylinder may have a well-measured centre while rotation about its own axis is unobservable. A rectangular object seen from one side can also admit a flipped or mirrored hypothesis.",
        "A grasp or approach frame is task-specific. Its origin may be a chosen grasp point rather than the box centre. One axis can point along the tool's approach direction, another along the gripper closing direction, and the third completes a right-handed frame. The convention must match the motion-planning and tool configuration. Before planning, check reachability, pre-grasp offset, finger clearance, support-plane clearance, collision geometry, symmetry alternatives, and pose quality.",
        "Perception should publish a candidate, not an unquestionable command. Include object and frame identifiers, source stamp, dimensions, pose, uncertainty or quality measures, symmetry class, valid-until policy, and rejection reason. If the input changes or cancellation arrives, stop generating new candidates and invalidate queued ones. A motion system still needs its own collision, limits, planning, execution, and safety checks.",
      ],
      keyTerms: [
        {
          term: "Axis-aligned bounding box",
          meaning:
            "A box whose edges remain parallel to the axes of the frame containing the cloud.",
          physicalExample:
            "A diagonal pencil needs a much wider base-frame AABB than the same pencil placed parallel to x.",
        },
        {
          term: "Oriented bounding box",
          meaning:
            "A box whose axes are estimated to follow the point set rather than staying fixed to the parent frame.",
          physicalExample:
            "A rotated shoebox can receive a tighter box that follows its long side.",
        },
        {
          term: "6D pose",
          meaning:
            "A rigid object's estimated three-dimensional position and orientation relative to a named parent frame.",
          physicalExample:
            "A part can be 0.6 m ahead of the robot while rotated 30 degrees around a declared axis.",
        },
        {
          term: "Approach frame",
          meaning:
            "A task-defined coordinate frame that tells a tool where to arrive and how its approach and closing axes should point.",
          physicalExample:
            "A gripper first moves to a pre-grasp point 0.10 m opposite the approach axis, then follows that axis toward the part.",
        },
        {
          term: "Pose symmetry",
          meaning:
            "A condition where multiple orientations produce the same observable object shape or the same valid task result.",
          physicalExample:
            "Rotating an unmarked cylinder around its long axis may not change what the camera can distinguish.",
        },
      ],
      physicalExamples: [
        {
          title: "Diagonal shoebox on graph paper",
          scenario:
            "Place a shoebox diagonally on graph paper, outline a box that follows the paper axes, then outline another that follows the shoebox.",
          lookFor:
            "Both contain the object, but the axis-aligned outline includes more empty space and changes more when the shoebox rotates.",
        },
        {
          title: "Arrow card for a safe approach",
          scenario:
            "Tape three right-handed arrows to a cardboard gripper model and choose a separate point above a paper object as the pre-grasp location.",
          lookFor:
            "The object centre, tool arrival point, approach direction, and closing direction are distinct choices that must share one explicit convention.",
        },
      ],
      workedExample: {
        title: "Turn object extent into a checked pre-grasp candidate",
        setup:
          "A segmented box has oriented dimensions `0.20 × 0.10 × 0.05 m`, centre `(0.60, 0.10, 0.78) m` in `base_link`, and its top is 0.05 m above the support. The declared approach axis points downward, with a 0.10 m pre-grasp offset upward.",
        steps: [
          "Compute box volume: `0.20 × 0.10 × 0.05 = 0.001 m³`; treat it as an extent summary, not object mass or certainty.",
          "Keep the candidate origin at `(0.60, 0.10, 0.78) m` and attach the measured orientation with its frame direction and timestamp.",
          "Define the tool approach axis as downward in `base_link`; confirm the other two axes complete the planner's right-handed tool convention.",
          "Move opposite the downward approach by 0.10 m, giving pre-grasp position `(0.60, 0.10, 0.88) m` for this aligned teaching case.",
          "Check that the 0.10 m object width fits inside the open gripper with required side clearance and that the support plane remains outside the planned finger volume.",
          "Publish the target as a candidate only if pose age, symmetry handling, clearance, workspace, and quality gates pass; otherwise publish a structured rejection.",
        ],
        result:
          "The geometry yields a pre-grasp candidate 0.10 m above the object, but acceptance still depends on orientation convention, clearance, freshness, and planning checks.",
        takeaway:
          "A bounding box can help propose a task frame, yet the final approach is an explicit engineering decision with safety and uncertainty gates.",
      },
      handsOn: {
        setup:
          "Use the fixed segmented clouds from Day 66: one rectangular box, one cylinder, and one deliberately partial view. Produce targets only as files or visualization markers.",
        steps: [
          "Compute and overlay axis-aligned and oriented boxes for each candidate, recording dimensions, centre, point count, and the parent frame.",
          "Rotate the rectangular cloud through several known angles and measure how AABB dimensions change and whether OBB axes stay consistent.",
          "Estimate candidate object frames, then list equivalent orientations for the cylinder and flag any orientation component that the points cannot support.",
          "Define approach and closing axes plus a pre-grasp offset, draw both object and tool frames, and assert right-handed rotation and unit quaternion norms where used.",
          "Add rejection gates for stale input, too few points, excessive extent, poor support clearance, workspace limits, and unresolved orientation needed by the task.",
          "Send a cancellation event through the offline pipeline and verify no new target is emitted and any queued candidate is marked invalid rather than executed.",
        ],
        observe:
          "AABB size should vary with rotation, a useful OBB should follow the rectangular object, and the cylinder should expose an orientation ambiguity instead of inventing a precise axis angle.",
        doneWhen:
          "The saved overlay distinguishes bounds, object frame, pre-grasp frame, symmetry, and rejected candidates, and the cancellation trace ends without a usable target.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "Define the typed boundary from a perception component to MoveIt or a policy service, including framed pose, dimensions, symmetry, quality, freshness, cancellation, and explicit rejection semantics.",
        interviewPrompt:
          "Distinguish AABB, OBB, 6D object pose, and grasp approach frame, then explain how symmetry and a partial cloud can make a visually tidy pose unsafe to consume.",
      },
      commonMistakes: [
        {
          mistake: "Using an oriented bounding box orientation as a guaranteed semantic object pose.",
          correction:
            "Treat it as a geometric estimate and validate axis stability, symmetry, partial-view bias, known object features, and task requirements.",
        },
        {
          mistake: "Publishing a pose without parent frame, transform direction, timestamp, or quaternion validation.",
          correction:
            "Make the pose a complete stamped frame contract and assert rotation validity before any downstream planner reads it.",
        },
        {
          mistake: "Choosing a grasp point at the object centre and assuming the tool can approach it.",
          correction:
            "Construct a task-specific approach frame and check pre-grasp path, gripper opening, object and support clearance, reachability, and collision geometry.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can an AABB become larger when the physical object only rotates?",
          answer:
            "Its edges stay aligned to the parent-frame axes, so a diagonal object occupies a wider span along those fixed axes.",
        },
        {
          question: "Does 6D pose mean orientation must be stored as three Euler angles?",
          answer:
            "No. It means three positional and three rotational degrees of freedom; orientation can be represented by a valid rotation matrix or unit quaternion.",
        },
        {
          question: "What extra decision turns an object pose into an approach frame?",
          answer:
            "The task defines a tool origin and axis convention, including approach and closing directions, offsets, clearances, and acceptable symmetry alternatives.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The physical shoebox, saved AABB/OBB overlays, and explicitly drawn object and tool axes already expose the geometry; another generic sensor visual would add no new check.",
      },
    },
    {
      dayId: 68,
      mentalModel:
        "Extrinsic calibration measures how two rigid rulers are bolted together; it must work on new points, not only the poses used to fit it.",
      explanation: [
        "Camera intrinsics describe rays inside the camera model. Extrinsics describe the rigid rotation and translation between the camera frame and another frame such as `base_link` or a tool flange. A fixed room camera is often calibrated to the robot base. A wrist camera also needs the changing robot kinematic chain plus the fixed camera-to-tool transform. Name the transform direction before solving because camera-to-base and base-to-camera are inverses, not interchangeable labels.",
        "A calibration dataset needs known correspondences or target poses observed from varied positions and orientations. Near-identical front-facing views poorly constrain some rotation and translation directions. The target dimensions must use the declared physical unit, detections must be accurate, timestamps must match the robot pose, and the camera mount must remain rigid. If the lens focus, image resolution, mount, or robot geometry changes, decide whether the calibration is still valid instead of silently reusing it.",
        "The estimated transform should be a rigid transform: its rotation is orthonormal with determinant near +1, and translation is expressed in the chosen physical unit. Fitting error on the calibration observations is useful but can hide overfitting, bad coverage, or a shared measurement bias. Reserve held-out target poses and known 3D checkpoints. Transform their camera observations into the robot frame and report per-axis and Euclidean error across near, far, centre, edge, high, and low regions.",
        "A visually aligned overlay can still be unsafe. At long range, a small rotation error produces a larger lateral position error. On a moving wrist, a timestamp offset looks like a spatial calibration error because the camera pose changed during the offset. Version the intrinsics, extrinsic transform, mount state, robot description, solver settings, dataset, residuals, validation results, and validity conditions so field diagnosis can separate a loose bracket from code or timing.",
      ],
      keyTerms: [
        {
          term: "Intrinsic calibration",
          meaning:
            "Camera parameters such as focal lengths, principal point, and distortion that connect camera rays to image pixels.",
          physicalExample:
            "Changing the image resolution may require scaled focal lengths and principal point even though the camera remains mounted in the same place.",
        },
        {
          term: "Extrinsic calibration",
          meaning:
            "The rigid rotation and translation relating a sensor frame to another physical frame.",
          physicalExample:
            "A fixed camera may be measured as 0.35 m above and rotated relative to the robot base.",
        },
        {
          term: "Eye-in-hand",
          meaning:
            "A camera mounted on the moving robot tool or wrist, with a fixed camera-to-tool relationship.",
          physicalExample:
            "The camera moves whenever the arm moves, while its bolted offset from the wrist should stay constant.",
        },
        {
          term: "Held-out validation",
          meaning:
            "Testing calibration on observations that were not used to estimate its parameters.",
          physicalExample:
            "Five target poses are reserved until after fitting and reveal large error near the edge of the workspace.",
        },
        {
          term: "Euclidean position error",
          meaning:
            "The straight-line distance between an estimated 3D point and its trusted reference.",
          physicalExample:
            "Coordinate errors of 0.03 m and 0.04 m on two axes combine into 0.05 m straight-line error.",
        },
      ],
      physicalExamples: [
        {
          title: "Two taped rulers",
          scenario:
            "Tape one ruler to a cardboard camera and another to a cardboard robot base, then measure the fixed offset and direction between their origins.",
          lookFor:
            "A point receives different coordinates on the two rulers, while one rigid rotation and translation should connect every stationary point.",
        },
        {
          title: "Loose phone bracket",
          scenario:
            "Mark a phone holder's position, nudge the holder slightly, and compare where the same distant wall mark appears before and after.",
          lookFor:
            "A small mount rotation causes a larger lateral shift at distance, showing why a moved bracket invalidates a formerly good transform.",
        },
      ],
      workedExample: {
        title: "Validate a simple aligned-axis extrinsic on an unseen point",
        setup:
          "For a teaching case with aligned axes, calibration estimates the camera origin at translation `(0.20, -0.05, 0.30) m` in `base_link`. A held-out point is measured at `(0.40, 0.10, 0.50) m` in the camera frame. Its surveyed base-frame reference is `(0.61, 0.04, 0.81) m`.",
        steps: [
          "Confirm the transform direction maps camera coordinates into `base_link`; this example deliberately has identity rotation.",
          "Transform the held-out point by adding translation: estimate `(0.60, 0.05, 0.80) m` in `base_link`.",
          "Compute coordinate errors against the reference: `(-0.01, 0.01, -0.01) m`.",
          "Compute Euclidean error: `sqrt(0.01² + 0.01² + 0.01²) ≈ 0.0173 m`, or 17.3 mm.",
          "Compare with the frozen acceptance limit; if the requirement is at most 20 mm, this held-out point passes.",
          "Keep the per-point result and test the other reserved locations because one passing centre point cannot validate rotation, workspace coverage, or timing.",
        ],
        result:
          "The unseen checkpoint has about 17.3 mm position error and passes a declared 20 mm limit, while the overall calibration remains pending the full held-out set.",
        takeaway:
          "Calibration is accepted by independent spatial evidence across the intended workspace, not by its fitted transform or one attractive overlay.",
      },
      handsOn: {
        setup:
          "Use a simulated camera and calibration target or a recorded public calibration dataset with known poses. Keep the transform output disconnected from motion commands.",
        steps: [
          "Declare eye-to-hand or eye-in-hand layout, parent and child frames, transform direction, units, image resolution, intrinsics version, and timestamp source.",
          "Split varied target observations into a fitting set and a held-out validation set before estimating the extrinsic transform.",
          "Estimate the transform and assert rotation orthonormality, determinant near +1, finite translation, expected mount bounds, and consistent units.",
          "Evaluate held-out points or poses across the intended workspace, reporting per-axis error, Euclidean error, sample count, and worst location rather than only an average.",
          "Inject a reversed transform, one target-scale error, and one pose timestamp offset; save the distinct numerical and overlay symptoms for diagnosis.",
          "Version the dataset, solver parameters, transform, validation table, mount state, limitations, and recalibration triggers in one calibration record.",
        ],
        observe:
          "A good result should remain within the declared task tolerance across held-out positions; planted direction, scale, and timing faults should fail different checks instead of becoming one vague calibration score.",
        doneWhen:
          "The calibration artifact reproduces its transform, passes every declared rigid-transform assertion and held-out gate, and rejects all three planted faults with specific reasons.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Commission a fixed or wrist-mounted depth camera, version its frame contract, qualify held-out workspace accuracy, and determine whether a shifted target came from mount movement, transform direction, units, kinematics, or timestamp mismatch.",
        interviewPrompt:
          "Separate intrinsics from extrinsics, compare eye-to-hand with eye-in-hand, and describe the dataset, rigid-transform checks, held-out measurements, and change controls needed before accepting calibration.",
      },
      commonMistakes: [
        {
          mistake: "Using camera-to-base numbers while publishing or applying them as base-to-camera.",
          correction:
            "Write the parent-child direction explicitly, verify a known point, and invert the full rigid transform only when the consumer truly needs the opposite mapping.",
        },
        {
          mistake: "Accepting the transform because reprojection on the fitting images is small.",
          correction:
            "Reserve varied held-out observations and measure 3D task-space error across the intended workspace and range.",
        },
        {
          mistake: "Reusing calibration after the mount, focus, resolution, robot model, or clock relationship changes.",
          correction:
            "Version those dependencies, define invalidation triggers, check the rigid mount, and rerun the appropriate calibration and validation workflow.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the difference between intrinsics and extrinsics?",
          answer:
            "Intrinsics describe pixel-to-ray camera geometry and distortion; extrinsics describe rigid rotation and translation between the camera frame and another frame.",
        },
        {
          question: "Why use target poses with varied orientation and workspace location?",
          answer:
            "They make more transform directions observable and test whether the calibration generalizes beyond a narrow, nearly identical set of views.",
        },
        {
          question: "How can timing error resemble spatial calibration error?",
          answer:
            "If the camera or robot moves between image acquisition and the pose used for transformation, correct geometry is applied to the wrong physical instant.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The measured cardboard frame exercise, known-point assertion, and held-out error table make transform direction and validation concrete without adding a fifth spatial visual to the chapter.",
      },
    },
    {
      dayId: 69,
      mentalModel:
        "A hole in a depth image is a report about visibility or signal, so safe perception keeps the hole and asks why instead of painting in a solid answer.",
      explanation: [
        "Occlusion happens when a nearer surface blocks the sensor's view of a farther surface. A single depth view therefore measures visible surfaces, not complete objects. Along an object boundary, a matching or averaging window can mix foreground and background and create flying points between them. A partial cloud can move a centroid, shrink an extent, or rotate an oriented box even when every retained point is numerically finite.",
        "Surface material changes the returned signal. Dark material can weaken active light. A mirror-like surface can send it away or return another path. Transparent material can transmit or mix foreground and background. Strong ambient light can reduce projected-pattern contrast, and multiple active sensors can interfere. Range limits and steep viewing angles also matter. These cases may create missing samples, noisy depth, saturated readings, or confidently biased values, so a finite-number check alone is insufficient.",
        "Represent validity before geometry. Check encoding and scale, finite values, sensor range, device confidence where available, left-right or temporal consistency where applicable, and neighborhood discontinuity. Calculate missing-depth rate with a stated region and denominator. Preserve categories such as invalid, out of range, occluded, low confidence, and algorithm rejected when the sensor exposes enough evidence. Do not call all missing pixels obstacles or all of them free space.",
        "A task policy should react to evidence quality. It can reject the target, request another stationary viewpoint, use a different validated sensor, enlarge uncertainty, slow or stop an offline planning decision, or ask an operator. Filling small display holes may help a human see an image, but filled values must remain distinguishable from measured depth and cannot silently pass the metric-geometry gate. Evaluate bad cases by surface, range, angle, occlusion fraction, valid coverage, pose error, and false-accept count.",
      ],
      keyTerms: [
        {
          term: "Occlusion",
          meaning:
            "Loss of visibility because a nearer surface blocks light paths to a farther surface.",
          physicalExample:
            "A cereal box hides the back half of a cup from a front-facing camera.",
        },
        {
          term: "Flying point",
          meaning:
            "A false depth sample that appears between foreground and background, often near a discontinuity or mixed measurement.",
          physicalExample:
            "Dots appear suspended between a box edge at 0.8 m and the wall behind it at 2.0 m.",
        },
        {
          term: "Missing-depth rate",
          meaning:
            "The count of invalid depth samples divided by all samples in a declared evaluation region.",
          physicalExample:
            "240 invalid pixels among 2,000 target-region pixels gives a 12% missing rate.",
        },
        {
          term: "Valid coverage",
          meaning:
            "The proportion of a target region supported by depth samples that pass the declared validity checks.",
          physicalExample:
            "A box detection with valid depth on only 35% of its region may be rejected for pose estimation.",
        },
        {
          term: "False accept",
          meaning:
            "A bad or unsupported target that incorrectly passes the perception quality gate.",
          physicalExample:
            "A reflection produces a tidy cluster that the system publishes as a graspable object despite failing the material test.",
        },
      ],
      physicalExamples: [
        {
          title: "Cup behind a book",
          scenario:
            "Move a book in front of a cup while viewing from one fixed position, then move your head sideways without touching either object.",
          lookFor:
            "The hidden cup surface is absent from the first view and becomes observable from a second viewpoint; it was unknown, not erased from the world.",
        },
        {
          title: "Matte, foil, and clear sheet",
          scenario:
            "Compare how a fixed lamp appears on matte card, aluminium foil, and clear plastic while keeping your eyes away from direct glare.",
          lookFor:
            "Absorption, directional reflection, and transmission create different signal paths, so one sensor model cannot treat the three returns as equally trustworthy.",
        },
      ],
      workedExample: {
        title: "Use missing evidence to reject an unsupported target",
        setup:
          "A target region contains 2,000 pixels. The validity checks accept 1,760 and reject 240. The target gate requires at least 92% valid coverage, no more than 3% edge-flying-point candidates, and a finite median depth inside the sensor range.",
        steps: [
          "Calculate missing-depth rate: `240 / 2,000 = 0.12`, or 12%.",
          "Calculate valid coverage: `1,760 / 2,000 = 0.88`, or 88%.",
          "Compare coverage with the gate: `88% < 92%`, so the target already fails even before pose estimation.",
          "Do not back-project the 240 rejected pixels and do not substitute `Z = 0`; keep their mask and categories.",
          "Record edge-flying-point rate and median valid depth for diagnosis, but do not let those later checks override the failed hard gate.",
          "Return a structured `INSUFFICIENT_VALID_DEPTH` result with counts, thresholds, frame, stamp, surface condition, and a safe next observation request.",
        ],
        result:
          "The pipeline rejects the target because only 88% of its region has trusted depth, while retaining enough evidence to compare a changed viewpoint or sensor condition.",
        takeaway:
          "A clear rejection with denominators is more actionable and safer than a complete-looking point cloud manufactured from missing measurements.",
      },
      handsOn: {
        setup:
          "Use a recorded public RGB-D scene or a synthetic renderer with matte, reflective, transparent, near-edge, and partly occluded targets. Produce no robot commands.",
        steps: [
          "Freeze target regions and test conditions, then save raw depth, validity mask, confidence if available, colour image, camera metadata, and environmental notes.",
          "Run the same validity policy on every case and report total pixels, valid pixels, missing rate, edge-invalid rate, depth spread, and target accept or reject.",
          "Create side-by-side overlays for measured valid depth, rejected pixels by category, and any display-only hole fill with a visibly different colour.",
          "Move only one condition at a time—viewpoint, range, angle, ambient light in simulation, or occluder—and compare whether the evidence improves or merely looks smoother.",
          "Plant a dangerous fallback that converts invalid depth to zero, capture the false geometry or metric effect, then remove it and add a regression assertion.",
          "Run the frozen set twice and attach counts, rejection reasons, the largest residual false accept, and the next controlled experiment.",
        ],
        observe:
          "Different failure surfaces should produce distinct spatial masks or bias patterns, and the target decision should follow declared evidence gates instead of display smoothness.",
        doneWhen:
          "The report reproduces all cases, keeps measured and filled data separate, blocks the zero-fill regression, and names the remaining false accept or unsupported surface.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION],
        workExample:
          "Build a depth-sensor qualification matrix for warehouse or tabletop materials, then turn recurring invalid, biased, occluded, and interference patterns into runtime quality gates and replay tests.",
        interviewPrompt:
          "Explain why missing depth is not zero, how occlusion and reflective or transparent surfaces alter geometry, and which denominators and false-accept tests you would use before permitting a 3D target.",
      },
      commonMistakes: [
        {
          mistake: "Judging depth quality from a smoothly colorized image.",
          correction:
            "Inspect raw values, validity categories, denominators, spatial masks, known distances, and downstream pose error; display smoothing can hide missing or biased evidence.",
        },
        {
          mistake: "Filling holes and then forgetting which points were measured.",
          correction:
            "Keep measured, inferred, and invalid masks separate, and forbid display-only interpolation from entering metric geometry without an independently validated model and policy.",
        },
        {
          mistake: "Reporting one missing-depth percentage for the whole image.",
          correction:
            "Measure declared task regions and stratify by material, range, angle, boundary, occlusion, and test condition so failures cannot hide in easy background pixels.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a partial but finite point cloud still give a wrong object pose?",
          answer:
            "Occlusion changes which surfaces contribute, so the centroid, extent, normals, and oriented axes can shift even when all remaining coordinates are finite.",
        },
        {
          question: "What denominator belongs in missing-depth rate?",
          answer:
            "All pixels in the explicitly declared evaluation region under the same test condition, with invalid pixels as the numerator.",
        },
        {
          question: "When is hole filling acceptable in this chapter's pipeline?",
          answer:
            "It may be used for a clearly labelled display, but filled values remain separate and cannot silently satisfy the measured-depth gate for metric target geometry.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A depth-failure view that preserves occlusion shadows, reflective holes, transparent bias, boundary flying points, and validity categories makes unknown versus measured-zero impossible to confuse.",
      },
    },
    {
      dayId: 70,
      mentalModel:
        "A trustworthy 3D target travels through a chain of evidence gates, and every gate must show both what passed and why a bad case stopped.",
      explanation: [
        "The weekly pipeline begins with synchronized colour or target region, raw depth, `CameraInfo`, frame identifiers, and acquisition stamps. It verifies encoding, dimensions, calibration version, scale, finite values, range, and valid coverage before back-projecting. It then transforms points at the measurement time, crops the allowed workspace, downsamples at a declared voxel size, and records counts and bounds after each stage. If a required transform or metadata contract is missing, the pipeline ends with a reason rather than guessing.",
        "Geometry stages remove or label the support plane, cluster candidate object points, compute bounds, and estimate a pose only when the task needs one. The approach-frame stage applies object and gripper conventions, symmetry choices, offsets, workspace limits, and support clearance. Each output carries its source stamp, parent frame, dimensions, quality values, and valid-until rule. The result is still a candidate for a planner or reviewer, never direct proof that physical motion is safe.",
        "Visual overlays are diagnostic evidence. On the colour image, show the target region, valid-depth coverage, projected centre, and rejection label. In 3D, show the raw or filtered cloud, removed plane, candidate cluster, object axes, approach axes, and excluded points in different labelled colours. A screenshot without raw counts, transform direction, configuration identity, and timestamp is not reproducible. Link each overlay to the exact run and result row.",
        "Evaluate a frozen set containing ordinary objects and deliberate bad cases: partial occlusion, reflective or transparent material, sparse depth, wrong scale, stale transform, reversed extrinsic, oversized voxel, bad plane threshold, poor registration seed, symmetry, and out-of-workspace target. Report acceptance, false accept, false reject, position and orientation error where references exist, valid coverage, latency distribution, and rejection reasons. A good release can safely reject impossible inputs; it must not hide them to improve success rate.",
        "The final ship note should separate verified facts from remaining risk. Include one command, versions, source data, configuration, stage metrics, result table, overlays, logs, and limitations. Explain the highest-impact failure and the smallest next experiment that could disprove your current belief. This produces evidence relevant to integration, validation, robot software, operator tooling, and physical-AI deployment without pretending that an offline RGB-D exercise validates a powered robot.",
      ],
      keyTerms: [
        {
          term: "Quality gate",
          meaning:
            "A declared, measurable condition that a stage must pass before its output may be consumed downstream.",
          physicalExample:
            "Pose estimation is skipped when valid depth covers less than 92% of the target region.",
        },
        {
          term: "Stage metric",
          meaning:
            "A value recorded at one pipeline boundary so loss, delay, and rejection can be traced.",
          physicalExample:
            "The transform stage records input count, output count, frame, transform age, and processing milliseconds.",
        },
        {
          term: "Structured rejection",
          meaning:
            "A machine-readable failure result containing a specific reason and the evidence that violated a gate.",
          physicalExample:
            "`STALE_TRANSFORM` reports the measurement stamp, transform stamp, observed age, and allowed age.",
        },
        {
          term: "Position error",
          meaning:
            "The Euclidean distance between an estimated 3D position and a trusted reference in the same frame and time.",
          physicalExample:
            "Errors of 0.03 m in x and 0.04 m in y combine into 0.05 m position error.",
        },
        {
          term: "Bad-case set",
          meaning:
            "A fixed collection of realistic failure inputs retained alongside nominal examples for repeatable evaluation.",
          physicalExample:
            "The set includes glass, foil, an occluded box, wrong depth scale, stale transform, and a target outside the workspace.",
        },
      ],
      physicalExamples: [
        {
          title: "Airport security trays",
          scenario:
            "Items move through several staffed stations, and a tray stops with a labelled reason when identity, scan, size, or routing evidence is missing.",
          lookFor:
            "A later station never invents a pass for a failed earlier check, and the tray identity connects every observation and decision.",
        },
        {
          title: "Transparent tracing stack",
          scenario:
            "Layer separate sheets for camera pixels, valid depth, camera points, base points, table removal, object bounds, and approach axes.",
          lookFor:
            "Removing or shifting one sheet reveals which downstream geometry changes and which evidence must remain linked to the same run.",
        },
      ],
      workedExample: {
        title: "Reject a target that misses the task-space accuracy gate",
        setup:
          "A frozen test target has reference centre `(0.50, 0.20, 0.80) m` in `base_link`. The pipeline estimates `(0.53, 0.24, 0.80) m`, reports 95% valid depth, 72 ms latency, and all metadata checks pass. The release gates require position error at most 0.04 m, coverage at least 92%, and latency at most 100 ms.",
        steps: [
          "Place estimate and reference in the same frame and timestamp contract before subtracting them.",
          "Compute coordinate errors: `(0.03, 0.04, 0.00) m`.",
          "Compute position error: `sqrt(0.03² + 0.04² + 0²) = 0.05 m`.",
          "Check other gates: `95% ≥ 92%` coverage passes, and `72 ms ≤ 100 ms` latency passes.",
          "Reject the target because `0.05 m > 0.04 m`; two passing gates cannot override the failed accuracy hard gate.",
          "Return `POSITION_ERROR_LIMIT` with the measured error, threshold, frame, run identity, overlay, and stage metrics for causal investigation.",
        ],
        result:
          "The target is rejected despite good coverage and latency because its 5 cm reference error exceeds the declared 4 cm task limit.",
        takeaway:
          "An end-to-end verdict is the conjunction of required gates, not an average score that allows one unsafe geometric error to disappear.",
      },
      handsOn: {
        setup:
          "Assemble the week's offline or recorded stages into one reproducible command and freeze at least one nominal target plus three distinct bad cases.",
        steps: [
          "Validate synchronized inputs, camera metadata, depth scale, validity, frame names, stamps, calibration identities, and required transforms before creating any 3D point.",
          "Run back-projection, crop, voxel filtering, frame transformation, support-plane extraction, clustering, bounds, pose, and approach-frame construction with per-stage counts and timing.",
          "Generate linked 2D and 3D overlays showing measured support, rejected pixels or points, plane, candidate, object axes, approach axes, quality values, and terminal reason.",
          "Execute the frozen nominal and bad-case set, retaining every row with expected status, observed status, coverage, errors where referenced, latency, and rejection reason.",
          "Repair the highest-impact false accept or silent failure, add its exact input as a regression case, then rerun the entire set rather than only the repaired example.",
          "Package the command, versions, inputs, configs, calibration record, raw result table, overlays, logs, limitations, and next falsifiable experiment in the ship note.",
        ],
        observe:
          "Every final candidate or rejection should trace to one input identity and consistent frame-time chain, and the repaired pipeline should preserve nominal behavior while blocking its recorded bad case.",
        doneWhen:
          "A clean reviewer reproduces the full set, recalculates one error from raw values, follows one rejection through all stages, and reaches the same offline release verdict.",
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
          "Own a perception release boundary from ROS sensor contracts through 3D geometry to planner, policy, or operator consumers, with traceable overlays, latency, accuracy, bad-case regressions, cancellation, and structured rejection.",
        interviewPrompt:
          "Walk through your RGB-D target pipeline stage by stage, name every frame and gate, show a false accept you repaired, and state exactly what the offline evidence does and does not prove about a real robot.",
      },
      commonMistakes: [
        {
          mistake: "Displaying only the final green box and calling the pipeline validated.",
          correction:
            "Link the box to raw inputs, metadata, masks, transform chain, stage counts, configuration, metrics, bad cases, and a reference-based verdict.",
        },
        {
          mistake: "Allowing downstream stages to run after an upstream metadata or quality gate fails.",
          correction:
            "Stop the candidate path, emit a structured reason, and test that no stale or fabricated target remains available to a consumer.",
        },
        {
          mistake: "Reporting average position error and average latency without individual failures or denominators.",
          correction:
            "Keep every trial row, distribution or percentile timing, worst cases, false accepts, false rejects, and hard-gate violations visible.",
        },
        {
          mistake: "Claiming the offline point-cloud lab proves grasping safety on hardware.",
          correction:
            "Claim only the recorded perception behavior; physical commissioning still needs robot calibration, planning, collision, load, stopping, supervision, and safety validation.",
        },
      ],
      checkQuestions: [
        {
          question: "What should happen when CameraInfo, image dimensions, or a required timestamped transform is inconsistent?",
          answer:
            "The pipeline should stop target production and return a specific metadata or transform rejection rather than guessing a calibration or using the latest convenient transform.",
        },
        {
          question: "Why include both 2D and 3D overlays?",
          answer:
            "The image overlay exposes pixel support and missing depth, while the 3D overlay exposes frame transforms, segmentation, bounds, pose, approach axes, and excluded geometry.",
        },
        {
          question: "What can this completed week honestly prove?",
          answer:
            "It can prove reproducible offline or simulated sensor-to-target behavior and rejection under the frozen cases; it cannot prove real-robot motion, grasp, collision, stopping, or production safety.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The chapter already selects four purpose-built geometry and failure visuals; the final system is better judged through linked 2D/3D overlays, a stage table, and raw bad-case rows.",
      },
    },
  ],
} satisfies ChapterContent;
