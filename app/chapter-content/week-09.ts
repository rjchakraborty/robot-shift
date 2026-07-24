import type { ChapterContent } from "../chapter-content-types";

const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week09Content = {
  week: 9,
  title: "Turn camera pixels into measured, debuggable robot observations",
  purpose:
    "Build a practical vision pipeline whose image encoding, calibration, geometry, detections, tracks, timing, and failure evidence can all be inspected. The goal is not a best-case picture: it is a frozen tabletop test that shows exactly what the camera measured, what each algorithm inferred, when the result is invalid, and whether the full observation meets a stated task tolerance.",
  prerequisites: [
    "Read a small Python program, NumPy array shape, comparison, loop, function call, and saved CSV or JSON result.",
    "Use pixels, metres, seconds, percentages, fractions, and an x-y coordinate grid without mixing their units.",
    "Recognize camera, robot, and target coordinate frames and preserve a measurement timestamp through a software pipeline.",
    "Keep experiments on a stationary, non-sensitive tabletop scene and treat every vision output as an observation rather than permission to move hardware.",
  ],
  outcomes: [
    "Explain how resolution, pixel coordinates, channel order, color space, lighting, exposure, blur, compression, and noise change the numbers an image contains.",
    "Build an inspectable OpenCV pipeline with filtering, thresholding, edges, contours, and morphology while preserving every intermediate image.",
    "Calibrate a camera from varied target views, read its intrinsic matrix and distortion coefficients, and validate held-out reprojection residuals across the image.",
    "Use a measured fiducial marker as a repeatable identity-and-pose baseline without confusing a detected ID with accurate geometry.",
    "Evaluate object detections with a frozen matching rule, confidence sweep, precision, recall, task costs, and timestamped latency.",
    "Track objects across occlusion while distinguishing a detection, a prediction, a persistent identity, an ID switch, and a genuine disappearance.",
    "Ship a reproducible vision report containing frozen inputs, versions, thresholds, counts, latency distribution, overlays, contact sheets, and honest failure slices.",
  ],
  jobTargets: [
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "OpenCV — Image Processing tutorials",
      url: "https://docs.opencv.org/4.x/d7/da8/tutorial_table_of_content_imgproc.html",
      useFor:
        "Official color, filtering, thresholding, edge, morphology, and contour operations used in the Day 57–58 image pipeline.",
    },
    {
      label: "OpenCV — Camera calibration with OpenCV",
      url: "https://docs.opencv.org/4.x/d4/d94/tutorial_camera_calibration.html",
      useFor:
        "Official intrinsic matrix, radial and tangential distortion, calibration-target, persistence, and reprojection-error workflow.",
    },
    {
      label: "OpenCV — Detection of ArUco markers",
      url: "https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html",
      useFor:
        "Official marker dictionaries, corner detection, rejected candidates, measured marker geometry, solvePnP pose, and axis overlays.",
    },
    {
      label: "OpenCV — Deep Neural Networks tutorials",
      url: "https://docs.opencv.org/4.x/d2/d58/tutorial_table_of_content_dnn.html",
      useFor:
        "Official OpenCV model-inference boundary for preprocessing, detection output, and deployable DNN backends.",
    },
    {
      label: "OpenCV — Introduction to OpenCV Tracker",
      url: "https://docs.opencv.org/4.x/d2/d0a/tutorial_introduction_to_tracker.html",
      useFor:
        "Official tracker initialization and frame-by-frame bounding-box update workflow used as a simple tracking baseline.",
    },
  ],
  days: [
    {
      dayId: 57,
      mentalModel:
        "A camera is a grid of tiny light meters: every pixel reports a bounded measurement at one place and time, not the name or truth of an object.",
      explanation: [
        "A digital image is a rectangular array. Its height counts pixel rows, its width counts pixel columns, and its channels store one or more values at each location. In common OpenCV arrays, pixel coordinate u increases to the right, v increases downward, and the array is indexed as row v before column u. A 640 × 480 color image with three 8-bit channels therefore contains 640 × 480 × 3 = 921,600 channel samples, but resolution alone says nothing about focus or useful detail.",
        "A color space gives channel numbers a meaning. Many cameras and files are described as RGB, while OpenCV normally decodes a color image into BGR channel order. Grayscale compresses color information into one brightness-like value; HSV separates hue, saturation, and value, which can make a colored card easier to threshold when brightness changes. HSV is not immune to lighting: hue becomes unstable when saturation is low, highlights can clip, and automatic white balance can move every color between frames.",
        "Pixels change for physical reasons that a robot pipeline must expose. Too little light increases sensor noise; long exposure smears a moving target; missed focus spreads edges; JPEG compression adds block and ringing artifacts; and very bright regions can saturate at the channel maximum. Rolling-shutter cameras may record different rows at slightly different times. Filtering can reduce a visible symptom, but it cannot recover detail that clipping, blur, or occlusion never captured.",
        "Treat capture settings as part of the measurement contract. Record resolution, encoding, exposure behavior, focus, white balance, source timestamp, and camera identity beside the image. Save a small raw or minimally processed reference set before tuning thresholds. A preview that looks pleasant to a person is not acceptance evidence: the program must inspect channel order, ranges, timestamps, and repeated values under the lighting conditions the robot will actually face.",
      ],
      keyTerms: [
        {
          term: "Pixel",
          meaning:
            "One sampled image location with numeric channel values and integer coordinates.",
          physicalExample:
            "The pixel at u = 420, v = 180 records light from one small direction through the lens.",
        },
        {
          term: "Channel",
          meaning:
            "One component stored at every pixel, such as blue, green, red, or grayscale intensity.",
          physicalExample:
            "A red paper patch produces different values in the three BGR channels.",
        },
        {
          term: "Color space",
          meaning:
            "A defined way to encode color or brightness as numeric components.",
          physicalExample:
            "The same card can be represented by BGR values or by HSV hue, saturation, and value.",
        },
        {
          term: "Dynamic range",
          meaning:
            "The span between the smallest and largest values an image representation can store or distinguish.",
          physicalExample:
            "An 8-bit channel stores integers from 0 through 255, so a stronger highlight cannot become 300.",
        },
        {
          term: "Image noise",
          meaning:
            "Unwanted variation in pixel values that is not stable scene detail.",
          physicalExample:
            "A dark phone image shows dancing speckles even while the colored card stays still.",
        },
      ],
      physicalExamples: [
        {
          title: "One card under three lights",
          scenario:
            "A blue paper card is photographed in daylight, under a warm lamp, and partly in shadow while its printed label and physical color stay unchanged.",
          lookFor:
            "Sample the same central patch and compare BGR and HSV values; identify changes caused by illumination and automatic camera settings rather than declaring that the object changed.",
        },
        {
          title: "Sliding block and exposure time",
          scenario:
            "A small cardboard block is photographed once while stationary and once while a person slides it across the table during a longer exposure.",
          lookFor:
            "Compare edge width and readable detail. Motion blur spreads evidence across pixels even though both files have identical width and height.",
        },
      ],
      workedExample: {
        title: "Read the size, brightness, and limits of one image measurement",
        setup:
          "A 640 × 480 BGR image uses unsigned 8-bit channels. One corresponding RGB sample is R = 100, G = 150, B = 200, and the lesson uses Y ≈ 0.299R + 0.587G + 0.114B as a stated grayscale approximation.",
        steps: [
          "Count spatial samples: 640 columns × 480 rows = 307,200 pixels.",
          "Count channel samples: 307,200 pixels × 3 channels = 921,600 stored channel values.",
          "At one byte per 8-bit channel, calculate 921,600 bytes of uncompressed pixel payload; file and transport overhead are separate.",
          "Substitute the RGB values: Y ≈ 0.299(100) + 0.587(150) + 0.114(200).",
          "Add 29.9 + 88.05 + 22.8 = 140.75, which rounds to about 141 for this stated approximation.",
          "State what 141 does not prove: it does not identify the object, preserve its color, reveal clipping elsewhere, or guarantee that OpenCV uses this exact rounding path for every conversion.",
        ],
        result:
          "The image contains 307,200 pixels and 921,600 byte-sized channel samples; the example color maps to an approximate grayscale value of 141 under the declared formula.",
        takeaway:
          "Image numbers become checkable only when shape, type, channel meaning, formula, and limits are all named.",
      },
      handsOn: {
        setup:
          "Use a phone or webcam, three non-sensitive colored paper patches, a stationary tabletop, Python, and OpenCV. Do not capture faces, screens, addresses, or other private material.",
        steps: [
          "Photograph the same patches in daylight, under a warm lamp, and with a shadow crossing part of the scene; keep camera position and file resolution unchanged.",
          "Load each file unchanged, then print array shape, data type, minimum, maximum, and the BGR value at one recorded patch coordinate.",
          "Convert each image to grayscale and HSV with OpenCV, save those outputs, and record the mean plus channel range inside the same rectangular patch.",
          "Inspect a bright highlight and a dark region for values pinned near 255 or 0, then mark those samples as possibly clipped rather than precise light measurements.",
          "Slide one patch during a capture, compare its edge width with the stationary image, and label the difference as motion blur rather than low resolution.",
          "Write a capture contract containing camera identity, resolution, encoding, timestamp source, exposure/focus behavior, lighting condition, and a rule for rejecting unusable frames.",
        ],
        observe:
          "The physical paper stays the same while pixel values, saturation, noise, and edge width change. HSV may stabilize one threshold, but it does not erase shadows, glare, clipping, or camera automation.",
        doneWhen:
          "The saved evidence includes three lighting conditions, one motion-blur case, exact array metadata, sampled values in BGR/grayscale/HSV, and a capture contract that explains every rejection.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "During camera bring-up, the engineer traces a missed tabletop target to a BGR-versus-RGB preprocessing mismatch and automatic exposure changes, then locks or records the capture settings and preserves the source timestamp before the observation enters ROS 2.",
        interviewPrompt:
          "A detector works on saved images but fails on the live robot camera. Explain how you would verify resolution, encoding, channel order, exposure, focus, white balance, clipping, motion blur, and timestamps before blaming the model.",
      },
      commonMistakes: [
        {
          mistake:
            "Reading an OpenCV BGR array as RGB because the displayed image still looks plausible.",
          correction:
            "Inspect the decoder contract and convert explicitly at one named boundary; verify with a known red, green, and blue patch.",
        },
        {
          mistake:
            "Treating a stable hue threshold as proof that lighting no longer matters.",
          correction:
            "Test shadows, highlights, low saturation, and camera automation; preserve rejected examples and declare the usable lighting range.",
        },
        {
          mistake:
            "Calling a high-resolution frame high quality without checking focus, blur, clipping, or compression.",
          correction:
            "Measure useful edge detail and channel range under the task conditions; pixel count is only one property of the capture.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Why is a pixel value a measurement rather than an object label?",
          answer:
            "It records bounded light-derived channel values at one image location and time; object identity is a later inference that can be wrong.",
        },
        {
          question:
            "How is pixel coordinate u = 100, v = 40 normally indexed in an OpenCV image array?",
          answer:
            "As row 40, column 100, because arrays use vertical row v before horizontal column u.",
        },
        {
          question:
            "What capture facts should travel with a robot image?",
          answer:
            "At minimum camera identity, resolution, encoding/channel order, exposure and focus behavior, white balance, source timestamp, and validity or rejection reason.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A ray-to-pixel grid with u-v axes, BGR channels, clipping, and exposure timing makes image formation and array indexing visible together; prose alone hides those geometric relationships.",
      },
    },
    {
      dayId: 58,
      mentalModel:
        "An OpenCV pipeline is a row of transparent sieves: each stage keeps, removes, or reshapes image evidence according to assumptions that must stay visible.",
      explanation: [
        "A spatial filter computes an output pixel from a neighborhood around an input pixel. A 3 × 3 kernel examines nine locations; a larger kernel gathers evidence from farther away. Mean and Gaussian smoothing can reduce small fluctuations, while a median filter is useful against isolated bright or dark specks. Every smoother also removes some detail, so kernel shape, size, border handling, and input scale belong in the experiment record rather than being unexplained constants.",
        "An edge detector responds to rapid intensity change, not to an object name. Image gradients estimate how quickly values change across x and y; Canny combines smoothing, gradients, non-maximum suppression, and two thresholds that connect strong and weak edge evidence. Texture, shadows, table seams, and glare can all create edges. A broken or closed edge can describe the same physical object under different lighting, so preserve the gradient or edge image beside the original.",
        "Thresholding produces a binary mask, and contours trace connected boundaries in such a mask. A contour can provide area, perimeter, bounding box, and shape clues, but only after segmentation choices have decided foreground and background. Contour hierarchy matters when one boundary contains another, such as a dark ring around a bright center. Never call every contour an object; label which physical feature the mask is intended to represent and reject contours outside measured size or shape ranges.",
        "Morphology edits binary regions with a structuring element. Erosion removes foreground near boundaries, dilation adds it, opening erodes then dilates to remove small foreground islands, and closing dilates then erodes to fill small holes or gaps. These operations are not generic cleanup buttons: a kernel larger than a real target can erase it, and closing can join two nearby objects. Compare intermediate masks against labelled images and count both removed noise and damaged targets.",
      ],
      keyTerms: [
        {
          term: "Kernel",
          meaning:
            "A small neighborhood shape and set of weights or rules applied around each pixel.",
          physicalExample:
            "A 3 × 3 kernel examines a pixel and its eight immediate neighbors.",
        },
        {
          term: "Gradient",
          meaning:
            "A numerical estimate of how quickly image intensity changes across position.",
          physicalExample:
            "The border between black paper and a white table produces a large brightness gradient.",
        },
        {
          term: "Binary mask",
          meaning:
            "An image whose values mark accepted foreground and rejected background.",
          physicalExample:
            "White pixels represent a blue card selected by an HSV range; black pixels represent everything else.",
        },
        {
          term: "Contour",
          meaning:
            "An ordered boundary around a connected region in a binary image.",
          physicalExample:
            "The outside edge of a thresholded paper circle becomes one contour whose area can be measured.",
        },
        {
          term: "Morphological opening",
          meaning:
            "Erosion followed by dilation, normally used to remove foreground regions smaller than the structuring element.",
          physicalExample:
            "Single white specks disappear while a much larger white card region mostly keeps its shape.",
        },
      ],
      physicalExamples: [
        {
          title: "Paper dots around a large square",
          scenario:
            "A black paper square sits on white paper while tiny black confetti dots create isolated regions after thresholding.",
          lookFor:
            "A small opening can remove the dots, but an oversized kernel shrinks or removes narrow parts of the real square before dilation can restore them.",
        },
        {
          title: "Broken ring under uneven light",
          scenario:
            "A drawn circular ring is partly washed out by glare, so its binary contour contains a gap and may not be reported as one closed boundary.",
          lookFor:
            "Closing may bridge the gap, but a larger closing kernel can also connect the ring to a nearby shape and create one false combined region.",
        },
      ],
      workedExample: {
        title: "Compare a cleaned mask with labelled target counts",
        setup:
          "A frozen set contains 20 real paper targets. After a 3 × 3 blur, color threshold, 3 × 3 opening, and contour-size filter, the pipeline reports 21 regions: 18 correctly match labelled targets and 3 are false regions; 2 labelled targets were missed.",
        steps: [
          "Check the label count: 18 true positives + 2 false negatives = 20 real targets.",
          "Check the prediction count: 18 true positives + 3 false positives = 21 reported regions.",
          "Calculate precision as TP/(TP+FP) = 18/(18+3) = 18/21 ≈ 85.7%.",
          "Calculate recall as TP/(TP+FN) = 18/(18+2) = 18/20 = 90%.",
          "Inspect the three false-positive overlays to learn whether texture, glare, or remaining specks passed the size rule.",
          "Inspect the two false-negative intermediate masks to see whether thresholding rejected them or morphology erased them; the counts alone cannot choose a new kernel.",
        ],
        result:
          "The declared pipeline reaches about 85.7% precision and 90% recall on this frozen set, with five specific errors that must be traced through saved intermediate images.",
        takeaway:
          "Metrics compare an entire configured pipeline, while stage-by-stage masks reveal which assumption caused each error.",
      },
      handsOn: {
        setup:
          "Arrange printed circles, rectangles, one narrow shape, and several paper specks on a plain tabletop. Capture one non-sensitive image and keep it frozen while comparing pipeline variants.",
        steps: [
          "Create labels for every intended shape, including the narrow target, before running OpenCV; record an allowed size range in pixels for this fixed camera pose.",
          "Save the original, grayscale or HSV channel, blurred image, binary threshold mask, Canny edges, opened mask, closed mask, and final contour overlay with exact parameter names in each filename.",
          "Run a 3 × 3 filter and structuring element, then tabulate which labelled shapes and paper specks remain after each stage.",
          "Repeat with a 9 × 9 structuring element and record the first stage where the narrow target is damaged or removed.",
          "Change one edge or threshold parameter at a time, never both, and explain which saved pixels changed and why the direction of change was expected.",
          "Create a final error sheet listing every false region and missed target with the earliest pipeline stage that made recovery impossible.",
        ],
        observe:
          "Noise can disappear while target boundaries also move. The largest or smoothest-looking kernel is not automatically best, and contour output depends on all earlier segmentation decisions.",
        doneWhen:
          "A reviewer can reproduce both kernel variants, inspect every intermediate image, reconcile TP/FP/FN counts with overlays, and identify the causal stage for each labelled error.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "An engineer debugging missed tote handles saves the live encoding, threshold mask, edge map, morphology output, contour filters, and configuration revision, then reproduces the miss offline and changes only the parameter whose intermediate image proves the failure.",
        interviewPrompt:
          "A colleague says a larger morphology kernel makes the mask cleaner. Explain erosion, dilation, opening, and closing, then design a labelled comparison that catches erased small targets, joined objects, and false contours.",
      },
      commonMistakes: [
        {
          mistake:
            "Choosing a kernel because its final overlay looks clean on one favorite image.",
          correction:
            "Freeze representative labelled inputs, save every intermediate stage, and compare error counts plus smallest-target preservation across parameter variants.",
        },
        {
          mistake:
            "Treating a Canny edge or contour as proof that an object was detected.",
          correction:
            "Edges mark intensity changes and contours bound mask regions; apply explicit physical size, shape, context, and validation rules before assigning object meaning.",
        },
        {
          mistake:
            "Changing blur, threshold, morphology, and contour filters together after a failure.",
          correction:
            "Change one declared parameter at a time and use the earliest changed intermediate image to connect the repair to evidence.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Why can a larger smoothing kernel reduce noise and also hurt detection?",
          answer:
            "It combines evidence over a wider neighborhood, which suppresses small variation but also spreads or removes narrow real details and moves boundaries.",
        },
        {
          question:
            "What does morphological opening do in its standard binary form?",
          answer:
            "It erodes foreground and then dilates it, usually removing foreground regions too small to survive the chosen structuring element.",
        },
        {
          question:
            "Why must contours be inspected with the mask that produced them?",
          answer:
            "A contour only traces a connected mask boundary; thresholding and morphology may already have deleted, split, filled, or joined physical regions.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The materially useful visuals are the learner's actual original, mask, edge, morphology, and overlay files; a generic diagram would hide the parameter-specific failure evidence.",
      },
    },
    {
      dayId: 59,
      mentalModel:
        "Camera calibration is a measured dictionary between 3D rays and 2D pixels, plus a correction for how the real lens bends that ideal geometry.",
      explanation: [
        "The pinhole model begins in the camera frame, where a point has coordinates X, Y, Z and positive Z lies in front of the camera under the usual OpenCV calibration convention. Ignoring distortion, its pixel is u = f_x X/Z + c_x and v = f_y Y/Z + c_y. The focal lengths f_x and f_y are measured in pixels; c_x and c_y locate the principal point. Dividing by Z explains why the same object appears smaller when it is farther away.",
        "The intrinsic matrix K stores f_x, f_y, c_x, and c_y for one image geometry. Real lenses also introduce radial distortion, which bends points increasingly with radius, and tangential distortion, which models lens-to-sensor misalignment. OpenCV stores fitted distortion coefficients beside K. Calibration parameters cannot be copied blindly after changing resolution, digital crop, lens, focus setting, or camera module; either transform the intrinsics under a known image resize/crop or recalibrate and validate the new path.",
        "Calibration needs known 3D target points paired with detected 2D image points. A flat checkerboard supplies repeated corners with a measured spacing, but useful views must cover the image, vary tilt and position, and provide enough geometric diversity. Twenty nearly identical front-facing images repeat almost the same constraint. Blurred corners, a bent print, an unmeasured square size, or a board seen only near the center can produce plausible numbers that fail where the robot actually looks.",
        "OpenCV calibration estimates K, distortion, and a rotation/translation for the target in each calibration view. Those per-view poses are not the fixed transform from the camera housing to the robot base. Reprojection error compares observed corners with corners projected by the fitted model; inspect per-view and spatial residuals, not only one average. Finally, reserve target views or measured points that were not used for fitting so validation can reveal overfitting, edge bias, or a changed camera configuration.",
      ],
      keyTerms: [
        {
          term: "Camera intrinsics",
          meaning:
            "Parameters inside the camera model that map camera-frame rays to pixel coordinates.",
          physicalExample:
            "The stored f_x, f_y, c_x, and c_y describe one camera and image geometry.",
        },
        {
          term: "Focal length in pixels",
          meaning:
            "The scale that converts a camera-frame direction ratio such as X/Z into pixel offset.",
          physicalExample:
            "With f_x = 500 px, a ratio X/Z = 0.1 produces a 50 px horizontal offset.",
        },
        {
          term: "Principal point",
          meaning:
            "The pixel location c_x, c_y where the ideal optical axis meets the image plane.",
          physicalExample:
            "A principal point near (320, 240) lies near the center of a 640 × 480 image.",
        },
        {
          term: "Distortion coefficients",
          meaning:
            "Fitted values that describe selected radial and tangential departures from ideal pinhole projection.",
          physicalExample:
            "Straight shelf edges bow outward near the corners until the lens distortion is corrected.",
        },
        {
          term: "Reprojection residual",
          meaning:
            "The pixel difference between an observed target point and the point predicted by the fitted camera model.",
          physicalExample:
            "A detected corner at u = 372 and a projected corner at u = 370 have a 2 px horizontal residual.",
        },
        {
          term: "Calibration-view pose",
          meaning:
            "The estimated rotation and translation that place the known target relative to the camera for one image.",
          physicalExample:
            "Tilting the checkerboard creates a new per-image pose while the camera intrinsics stay fixed.",
        },
      ],
      physicalExamples: [
        {
          title: "Checkerboard across the whole frame",
          scenario:
            "A measured flat checkerboard is photographed near the center, near all four corners, at several tilts, and at more than one distance.",
          lookFor:
            "Corner coverage and pose diversity constrain different parts of the model; reject blur and partial detections instead of increasing image count with poor evidence.",
        },
        {
          title: "Straight shelf near a wide-angle lens edge",
          scenario:
            "A physically straight shelf edge appears curved near the outside of a wide-angle image but closer to straight after undistortion.",
          lookFor:
            "Check held-out line and target points across the frame. A pleasing center crop does not validate corner geometry or metric projection.",
        },
      ],
      workedExample: {
        title: "Project one camera-frame point and inspect a residual",
        setup:
          "Ignore distortion for the first calculation. A calibrated image has f_x = f_y = 500 px, c_x = 320 px, c_y = 240 px. A target point in the camera frame is X = 0.10 m, Y = 0.05 m, Z = 1.00 m, and its observed corner is (u, v) = (372, 264).",
        steps: [
          "Check units and visibility: X, Y, and Z use metres, focal lengths use pixels, and Z = 1.00 m is positive.",
          "Calculate u = f_x X/Z + c_x = 500(0.10/1.00) + 320 = 370 px.",
          "Calculate v = f_y Y/Z + c_y = 500(0.05/1.00) + 240 = 265 px.",
          "Form the predicted pixel (370, 265) and subtract it from the observed pixel (372, 264) to get residual components (+2, -1) px.",
          "Calculate residual magnitude √(2² + (-1)²) = √5 ≈ 2.24 px for this held-out point.",
          "Repeat the projection across held-out center and edge points before deciding whether about 2.24 px is acceptable for the physical task; one residual does not validate the whole camera.",
        ],
        result:
          "The ideal model projects the point to (370, 265), while the held-out observation differs by about 2.24 px.",
        takeaway:
          "Projection turns declared 3D geometry into a testable pixel prediction; residuals show where the fitted model and observed image disagree.",
      },
      handsOn: {
        setup:
          "Use one fixed-focus camera, a flat checkerboard or ChArUco target with precisely measured spacing, OpenCV calibration tools, and a stationary workspace. Keep powered robot motion disabled.",
        steps: [
          "Measure the printed target spacing and one full grid width with a ruler or caliper, record the units, and reject a curled or stretched print.",
          "Capture at least 15 sharp, complete target views that cover the center, edges, and corners with varied tilt, position, and distance while keeping camera resolution and focus unchanged.",
          "Review detected corners overlaid on every image; remove blurred, partial, or wrongly ordered detections and record each rejection reason.",
          "Reserve several geometrically varied images for validation, then run calibration only on the remaining fit set and save K, distortion coefficients, image size, model flags, and software version.",
          "Project fitted target points back into every fit and held-out image, calculate per-view and per-corner residuals, and plot or tabulate residual magnitude by image region.",
          "Undistort a held-out image and inspect straight features plus target corners near the edges; do not use visual straightness as a replacement for numeric residuals.",
          "Change one camera condition such as digital resize after saving the baseline, prove the old unmodified intrinsics no longer match that image geometry, and restore the qualified configuration.",
        ],
        observe:
          "Varied sharp views usually constrain the model better than repeated center views. A low fit average can coexist with large held-out or edge residuals, especially after image geometry changes.",
        doneWhen:
          "The versioned calibration includes measured target geometry, qualified image settings, accepted and rejected view lists, K and distortion, fit and held-out residuals by region, and a stated task tolerance.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Before a vision-guided robot trial, the engineer qualifies the exact camera mode, measures the target, estimates intrinsics and distortion, rejects weak views, checks held-out residuals across the frame, and separately verifies the camera-to-robot transform.",
        interviewPrompt:
          "A camera reports 0.4 px average reprojection error, yet picks are wrong near the image edge. Explain the pinhole model, distortion, view diversity, held-out residual map, resize or focus risks, and why calibration-view poses are not robot extrinsics.",
      },
      commonMistakes: [
        {
          mistake:
            "Collecting many nearly identical front-facing checkerboard images and calling the large image count diverse.",
          correction:
            "Cover the image plane and vary target tilt, position, and distance while keeping corners sharp and the target physically flat.",
        },
        {
          mistake:
            "Accepting one low average reprojection error without inspecting held-out views or edge residuals.",
          correction:
            "Report per-view and spatial residual distributions on both fit and reserved data, then compare them with a physical task tolerance.",
        },
        {
          mistake:
            "Using each checkerboard view's fitted rotation and translation as the fixed camera-to-robot mounting transform.",
          correction:
            "Treat those values as target-to-camera pose for that image; estimate and validate the separate sensor-to-robot extrinsic transform with its own procedure.",
        },
        {
          mistake:
            "Reusing K unchanged after cropping or resizing the image because the lens did not move.",
          correction:
            "Qualify the complete image geometry; transform intrinsics correctly for a known resize/crop or recalibrate and validate the new configuration.",
        },
      ],
      checkQuestions: [
        {
          question:
            "In u = f_x X/Z + c_x, why does horizontal pixel offset shrink when Z grows and X stays fixed?",
          answer:
            "The direction ratio X/Z becomes smaller, so multiplying by the same pixel focal length produces a smaller offset from the principal point.",
        },
        {
          question:
            "Why are many centered, front-facing checkerboard views weak calibration evidence?",
          answer:
            "They repeat similar constraints and provide little information about distortion and projection behavior at other tilts, depths, and image regions.",
        },
        {
          question:
            "What does a low reprojection error not prove?",
          answer:
            "It does not prove held-out accuracy, correct target measurements, unchanged camera settings, correct camera-to-robot extrinsics, or acceptable physical task error.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A camera-frame point, pinhole rays, intrinsic matrix, bent distorted pixel, and reprojection residual form one spatial relationship that is materially clearer as geometry than as equations alone.",
      },
    },
    {
      dayId: 60,
      mentalModel:
        "A fiducial marker is a measured visual signpost: its code supplies identity and its corners supply geometry, but calibration and validation decide whether the pose is trustworthy.",
      explanation: [
        "An ArUco marker is a square binary pattern selected from a named dictionary. Detection first finds quadrilateral candidates, then samples their inner cells and checks whether a code belongs to the configured dictionary. Successful output includes an ID and four ordered pixel corners; rejected candidates are useful debug evidence. The ID belongs to the printed code, not automatically to the object beside it, and choosing the wrong dictionary can turn a correct print into repeated misses.",
        "Known marker geometry connects pixels to pose. Given calibrated camera intrinsics, distortion coefficients, ordered corners, and the marker's measured side length, a perspective-n-point calculation can estimate a rotation and translation between the marker frame and camera frame. The translation uses the same physical unit supplied for marker length. A 0.050 m marker entered as 50 without declaring millimetres can produce a pose scale one thousand times too large even though the axis overlay looks orderly.",
        "Fiducials are a strong engineering baseline because the pattern, identity, corner order, and side length are controlled. Before testing a learned detector, a marker can reveal camera encoding errors, weak focus, calibration problems, frame mistakes, pose latency, and distance-dependent accuracy. It cannot prove the learned object detector works, and successful decoding cannot prove the pose is within tolerance. Detection counts and pose residuals answer separate questions.",
        "Print and scene quality still matter. Scaling in a printer dialog changes the physical marker length; curled paper violates the assumed plane; glare hides bits; motion blur moves corners; partial occlusion may prevent decoding; and corners near the image border may be poorly constrained or clipped. Test known IDs at measured distances and tilts, keep rejected-candidate overlays, compare estimated translation with a ruler, and verify axes against a deliberately labelled marker frame.",
      ],
      keyTerms: [
        {
          term: "Fiducial marker",
          meaning:
            "A deliberately designed visual target with known identity and geometry.",
          physicalExample:
            "A measured square ArUco print attached flat to a stationary box.",
        },
        {
          term: "Marker dictionary",
          meaning:
            "A named collection of valid binary marker codes and their bit size.",
          physicalExample:
            "DICT_6X6_250 and DICT_4X4_50 interpret different grids and valid IDs.",
        },
        {
          term: "Corner refinement",
          meaning:
            "A method that improves detected corner locations beyond the initial coarse quadrilateral estimate.",
          physicalExample:
            "Subpixel refinement adjusts a corner from an integer pixel location to a more precise image coordinate.",
        },
        {
          term: "Pose estimate",
          meaning:
            "An inferred position and orientation between named coordinate frames.",
          physicalExample:
            "The marker frame is estimated 0.98 m in front of the camera with a small tilt.",
        },
        {
          term: "Rejected candidate",
          meaning:
            "A square-like image region considered during detection but not decoded as a valid configured marker.",
          physicalExample:
            "A dark package label has four sides but its sampled bits do not match the marker dictionary.",
        },
      ],
      physicalExamples: [
        {
          title: "Marker beside a ruler",
          scenario:
            "A flat 50 mm marker is placed beside a ruler at several measured camera distances while the camera remains fixed.",
          lookFor:
            "Compare decoded ID, corner overlay, estimated z translation, and physical distance; separate misses from pose errors on successful detections.",
        },
        {
          title: "Two labelled storage bins",
          scenario:
            "Two stationary bins carry different marker IDs from the same dictionary, and one marker is partly covered by a paper strip.",
          lookFor:
            "Verify identity is attached by configuration to the intended bin, log the occluded marker as a miss or rejected candidate, and never guess its current pose from the other bin.",
        },
      ],
      workedExample: {
        title: "Score marker detection and pose error separately",
        setup:
          "A test contains 20 labelled images where marker ID 17 should be visible. The configured detector correctly returns ID 17 in 19 images, reports one wrong extra marker elsewhere, and misses ID 17 once. At a measured z distance of 1.00 m, one successful pose estimates z = 0.98 m.",
        steps: [
          "Set detection counts from the frozen labels: TP = 19, FP = 1, and FN = 1.",
          "Calculate precision = TP/(TP+FP) = 19/(19+1) = 95%.",
          "Calculate recall = TP/(TP+FN) = 19/(19+1) = 95%.",
          "Calculate the example z translation error separately: |0.98 - 1.00| = 0.02 m = 2 cm.",
          "Do not combine 95% and 2 cm into one score; one measures identity detections over images and the other measures one pose component on a successful detection.",
          "Check more distances, tilts, image regions, and full 3D residuals before accepting the pose path for a robot task.",
        ],
        result:
          "Marker identity detection has 95% precision and 95% recall on this set, while the selected successful pose has a 2 cm z error.",
        takeaway:
          "A marker can be decoded correctly yet localized poorly, so identity, pose, timing, and frame checks need separate acceptance limits.",
      },
      handsOn: {
        setup:
          "Use the calibrated camera from Day 59, one OpenCV-generated marker from a recorded dictionary, a ruler, a flat backing board, and a stationary tabletop. Disable robot motion.",
        steps: [
          "Generate and print one marker with scaling disabled, then measure its outer side length in metres and record marker ID, dictionary, print file revision, and measured size.",
          "Place the marker flat at three measured distances and three tilts, including positions near the image center and edge, while keeping the qualified camera mode unchanged.",
          "Run marker detection, save detected corners, IDs, rejected candidates, source timestamp, and an annotated image for every trial.",
          "Estimate pose with the measured marker length, K, and distortion; draw the returned frame axes and verify their orientation against axes drawn physically beside the marker.",
          "Calculate translation error against ruler measurements for every valid trial and group misses plus large residuals by distance, tilt, glare, and image region.",
          "Cover one corner, add a glare source, and use the wrong dictionary in separate fault trials; require explicit no-detection or rejection rather than a fabricated pose.",
          "Restore the qualified setup, rerun one baseline trial, and save the configuration plus result table so another person can reproduce it.",
        ],
        observe:
          "Correct dictionary, measured print size, calibrated intrinsics, sharp corners, and visible marker area all affect the result. A stable ID does not guarantee stable translation or orientation.",
        doneWhen:
          "The evidence contains print provenance, measured side length, all test conditions, detected and rejected overlays, identity counts, pose residuals, fault outcomes, and a repeated baseline after restoration.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "At a customer-site camera check, the engineer places a qualified fiducial at measured poses to separate focus, calibration, frame, and latency faults before diagnosing the production detector, then records marker misses and pose residuals instead of showing only an axis overlay.",
        interviewPrompt:
          "A marker ID is correct but its estimated distance is wrong. Walk through print scale, marker units, dictionary, corner quality, camera intrinsics and distortion, solvePnP inputs, frame conventions, timestamps, and held-out physical measurements.",
      },
      commonMistakes: [
        {
          mistake:
            "Entering markerLength = 50 for a 50 mm print while the rest of the robot uses metres.",
          correction:
            "Measure and enter 0.050 m, state the unit at the API boundary, and reject translations outside the physically possible range.",
        },
        {
          mistake:
            "Treating a correct marker ID and tidy axis overlay as proof of accurate pose.",
          correction:
            "Compare translation and orientation with held-out measured poses across distance, tilt, lighting, and image region.",
        },
        {
          mistake:
            "Printing through a fit-to-page dialog and trusting the nominal digital marker size.",
          correction:
            "Disable scaling, mount the print flat, measure the actual outer side used by the pose model, and store that measurement with the calibration.",
        },
        {
          mistake:
            "Discarding rejected candidates and failed frames because only successful detections seem useful.",
          correction:
            "Save rejected overlays and structured failure reasons; they distinguish glare, border clipping, occlusion, dictionary mismatch, and threshold problems.",
        },
      ],
      checkQuestions: [
        {
          question:
            "What two outputs does a detected ArUco marker provide before pose estimation?",
          answer:
            "Its decoded marker ID and the ordered image coordinates of its four corners.",
        },
        {
          question:
            "Why does the physical marker side length affect estimated translation?",
          answer:
            "It sets the real-world scale of the 3D corner model, so translation is returned in the same unit and scales with that declared length.",
        },
        {
          question:
            "Why is a fiducial useful before a learned detector?",
          answer:
            "Its controlled identity and geometry provide a repeatable baseline that can isolate camera, calibration, frame, pose, and timing faults from model-recognition faults.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "Ordered marker corners, known square geometry, camera rays, and returned frame axes must be related spatially; a geometry visual exposes unit and axis mistakes that an ID overlay hides.",
      },
    },
    {
      dayId: 61,
      mentalModel:
        "An object detector proposes labelled rectangles with scores; a frozen matching rule and task cost decide which proposals are useful, missed, or dangerous.",
      explanation: [
        "An object detector normally returns candidate class labels, image regions such as bounding boxes, and numeric scores. The score's exact meaning depends on the model and post-processing; it is not automatically a calibrated probability that the physical object exists. Before inference, color order, resize or letterbox behavior, input size, numeric scaling, and normalization must match the model contract. A pipeline can produce confident nonsense when one preprocessing step differs from training.",
        "Evaluation compares predictions with labels under a declared matching rule. A common rule requires the class to match and bounding-box intersection over union, IoU, to reach a chosen threshold. Each prediction and label may be matched at most once. A matched prediction is a true positive, an unmatched prediction is a false positive, and an unmatched label is a false negative. Non-maximum suppression removes selected overlapping candidates, but its score and IoU thresholds are additional configuration, not proof that the remaining box is correct.",
        "A confidence threshold decides which scored predictions enter the task. With raw outputs and other settings fixed, raising the minimum keeps fewer or the same candidates; false positives may fall, but real low-scored objects may become false negatives. Precision asks what fraction of reported objects were correct, while recall asks what fraction of labelled objects were found. Choose a threshold on representative validation data using the real cost of a false grasp, missed package, unnecessary stop, or human review—not the prettiest percentage.",
        "Detection is still an observation boundary. Preserve the image timestamp, inference completion time, model and label-map versions, preprocessing settings, confidence and NMS thresholds, and rejection reason. A box does not provide trustworthy depth, 3D pose, grasp clearance, or permission to move. Downstream code must check freshness and required geometry, and it must represent no accepted detection as an explicit absence of evidence rather than coordinates filled with zeros.",
      ],
      keyTerms: [
        {
          term: "Bounding box",
          meaning:
            "A rectangular image region proposed or labelled around an object.",
          physicalExample:
            "Four pixel coordinates enclose a red block in a tabletop image.",
        },
        {
          term: "Confidence score",
          meaning:
            "A model-specific ranking value associated with a predicted class or object candidate.",
          physicalExample:
            "Two cup candidates receive scores 0.82 and 0.47, but neither score by itself proves a cup exists.",
        },
        {
          term: "Intersection over union",
          meaning:
            "Overlap area divided by combined union area for two image regions.",
          physicalExample:
            "A predicted box overlapping 60 of 100 union pixels with a label has IoU = 0.60.",
        },
        {
          term: "Non-maximum suppression",
          meaning:
            "Post-processing that keeps selected high-scored boxes and removes sufficiently overlapping alternatives.",
          physicalExample:
            "Three boxes around one block are reduced to one candidate under the configured score and IoU rules.",
        },
        {
          term: "Precision",
          meaning:
            "The fraction TP/(TP+FP) of accepted predictions that match labels under the frozen rule.",
          physicalExample:
            "Eight correct boxes and two false boxes give precision 8/10 = 80%.",
        },
        {
          term: "Recall",
          meaning:
            "The fraction TP/(TP+FN) of labelled objects that receive accepted matching predictions.",
          physicalExample:
            "Eight found blocks and four missed blocks give recall 8/12 ≈ 66.7%.",
        },
      ],
      physicalExamples: [
        {
          title: "Colored block and bright reflection",
          scenario:
            "A detector proposes one strong box around a paper block and a weaker box around a reflection with a similar color and outline.",
          lookFor:
            "Sweep the confidence threshold and keep the reflection image in the validation set; never delete a difficult false positive after seeing the result.",
        },
        {
          title: "Sorter with different error costs",
          scenario:
            "A tabletop sorter may safely ask a human about a missed object, while a false positive could send a gripper toward empty or obstructed space.",
          lookFor:
            "State the consequence and guard for each error type before selecting the threshold; high recall alone is not the task objective.",
        },
      ],
      workedExample: {
        title: "Choose between two thresholds with declared error costs",
        setup:
          "On one frozen validation set, threshold 0.60 gives TP = 8, FP = 2, FN = 4. Threshold 0.80 gives TP = 6, FP = 0, FN = 6. For this supervised tabletop task only, assign cost 5 to a false positive and cost 1 to a false negative.",
        steps: [
          "At 0.60, calculate precision = 8/(8+2) = 80% and recall = 8/(8+4) ≈ 66.7%.",
          "At 0.80, calculate precision = 6/(6+0) = 100% and recall = 6/(6+6) = 50%.",
          "Calculate declared error cost at 0.60: 5(2 false positives) + 1(4 false negatives) = 14.",
          "Calculate declared error cost at 0.80: 5(0 false positives) + 1(6 false negatives) = 6.",
          "Under only this cost model and dataset, prefer 0.80, while requiring a human-review or safe-no-action path for its six misses.",
          "Inspect every changed prediction and repeat on held-out lighting and object-size slices; the arithmetic does not prove the costs, labels, or dataset represent deployment.",
        ],
        result:
          "Threshold 0.80 has lower declared error cost 6 versus 14, but also lower recall, so its safe missed-object behavior remains part of acceptance.",
        takeaway:
          "Threshold choice is a documented task decision over labelled evidence, not a universal preference for the highest score, precision, or recall.",
      },
      handsOn: {
        setup:
          "Use a small pretrained detector or an existing project model, 20–40 non-sensitive tabletop images, a fixed label set, and an OpenCV inference script. Keep the images stationary and command no robot.",
        steps: [
          "Freeze a validation manifest with image IDs, labels, class names, boxes, lighting and object-size tags, and a written one-to-one IoU matching rule.",
          "Record model file hash or revision, label map, input size, BGR/RGB conversion, resize or letterbox policy, normalization, backend, confidence threshold, and NMS settings.",
          "Run exactly the same raw model outputs through at least three confidence thresholds while leaving images, labels, preprocessing, matching, and NMS configuration otherwise fixed.",
          "For each threshold, reconcile TP, FP, and FN with annotated overlays, then calculate precision and recall with their numerator and denominator counts.",
          "Create separate contact sheets for correct detections, false positives, and false negatives, including score, IoU, image tag, and source timestamp.",
          "Measure repeated end-to-end time from captured frame availability through final accepted boxes after warm-up, not only the neural-network forward call.",
          "Select or reject a threshold using declared false-positive and false-negative consequences, then lock it before running a separate held-out check.",
        ],
        observe:
          "Increasing the score threshold can remove reflections and also remove real small or shadowed objects. Preprocessing or NMS changes can alter results even when the displayed confidence threshold stays fixed.",
        doneWhen:
          "The report can reproduce each threshold row, trace every count to an overlay, state the chosen task cost and safe miss behavior, and show held-out accuracy plus end-to-end timing.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "For a deployed perception release, the engineer freezes preprocessing, model and label versions, IoU matching, NMS, and a confidence sweep, then links every threshold decision to false-grasp versus missed-object cost and verifies a no-action fallback.",
        interviewPrompt:
          "A detector has 100% precision at threshold 0.9 and 70% precision at 0.5. Explain why that does not select 0.9, then define labels, IoU matching, TP/FP/FN, NMS, task costs, held-out slices, and freshness checks.",
      },
      commonMistakes: [
        {
          mistake:
            "Interpreting a confidence score of 0.90 as a guaranteed 90% chance that the physical object is present.",
          correction:
            "Treat scores according to the specific model contract and measure their behavior on representative labelled data; calibration and real-world validity require evidence.",
        },
        {
          mistake:
            "Selecting the threshold with the highest precision without examining missed objects.",
          correction:
            "Report precision and recall with counts, inspect false negatives, and use explicit task consequences plus a safe missed-object path.",
        },
        {
          mistake:
            "Tuning thresholds on a set and reporting the same set as unbiased final evidence.",
          correction:
            "Use a validation set for selection, lock the full configuration, and report results on separate held-out examples and important deployment slices.",
        },
        {
          mistake:
            "Changing model preprocessing while calling the experiment a threshold-only comparison.",
          correction:
            "Freeze color order, resize, numeric scale, normalization, backend, and NMS; change only the confidence threshold for that comparison.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Under a one-to-one IoU matching rule, what are TP, FP, and FN?",
          answer:
            "A TP is one accepted prediction matched to one label; an unmatched accepted prediction is an FP; an unmatched label is an FN.",
        },
        {
          question:
            "Why can raising a confidence threshold improve precision while reducing recall?",
          answer:
            "It removes low-scored candidates that may include false positives and real objects, so accepted predictions can be cleaner while more labels are missed.",
        },
        {
          question:
            "What must be frozen for a fair confidence-threshold sweep?",
          answer:
            "Images, labels, matching rule, preprocessing, model and label versions, backend, NMS, timing method, and every setting except the threshold being compared.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "A threshold table plus labelled TP, FP, and FN contact sheets exposes the real tradeoff more accurately than a generic detector graphic, and this day adds no required camera geometry.",
      },
    },
    {
      dayId: 62,
      mentalModel:
        "Detection answers what appears in one frame; tracking carries a cautious identity story across time and must label when that story is only a prediction.",
      explanation: [
        "A tracker maintains state across ordered frames. At minimum, each track needs a track ID, latest region or position, source timestamp, update status, and age since reliable observation. A detector can initialize or refresh that state, while a motion or appearance model can predict between detections. The track ID is a software handle, not a property visible on most objects. Restarting the tracker or making a bad association can change identity even when every frame contains a correct box.",
        "Data association decides which new detection belongs to which existing track. Simple baselines compare box IoU or center distance; stronger systems may also use predicted motion and appearance features. Crossing paths create ambiguity because both objects can be close to either previous box. A greedy highest-IoU choice can work in easy motion and still swap IDs after overlap. Record the full candidate costs and chosen match rather than drawing a smooth line that hides the decision.",
        "Occlusion means another surface blocks the camera's view. During a short occlusion, a tracker may predict a location, but it must mark that state predicted or lost and increase its age or uncertainty. Confirmation rules can require several detections before a track is born; deletion rules retire tracks after a declared missed-update limit. Reappearing objects may keep or receive a new ID according to a documented re-identification rule. Never publish a predicted box as a fresh camera observation.",
        "Tracking labels extend beyond frame-level TP, FP, and FN. They must preserve object identity through time so evaluation can count ID switches, track fragmentation, premature deletion, and false persistence after an object leaves. Perfect detection recall is compatible with wrong tracking when every object is boxed but identities swap. Use timestamps and recorded sequences, replay the same fault cases, and require downstream robot logic to reject stale or identity-ambiguous tracks.",
      ],
      keyTerms: [
        {
          term: "Track ID",
          meaning:
            "A software identifier intended to refer to one object history across frames.",
          physicalExample:
            "The left token begins as track 4 and should remain track 4 after moving right unless identity becomes unresolved.",
        },
        {
          term: "Data association",
          meaning:
            "The decision that pairs current detections with existing tracks or starts new tracks.",
          physicalExample:
            "Two new boxes are compared with the predicted boxes for tracks 4 and 7 before matches are assigned.",
        },
        {
          term: "Occlusion",
          meaning:
            "A viewing condition where another surface partly or fully hides the target.",
          physicalExample:
            "A paper token disappears for two frames while passing behind an upright card.",
        },
        {
          term: "ID switch",
          meaning:
            "An error where the reported identity assigned to a physical object changes or swaps with another object's identity.",
          physicalExample:
            "After two tokens cross, the red token receives the track ID that previously followed the blue token.",
        },
        {
          term: "Track age",
          meaning:
            "Elapsed time or frame count since a track was created or last supported by a reliable observation, according to the declared field.",
          physicalExample:
            "A predicted location is 120 ms old because the object has not been detected since the earlier timestamp.",
        },
        {
          term: "Track fragmentation",
          meaning:
            "One physical object's path being split into multiple separate reported tracks.",
          physicalExample:
            "Token A is track 3 before a brief occlusion and a new track 9 after it returns.",
        },
      ],
      physicalExamples: [
        {
          title: "Two tokens crossing behind a card",
          scenario:
            "A red coin and a blue coin move toward each other, overlap near an upright card, disappear briefly, and emerge on opposite sides.",
          lookFor:
            "Mark every detection, predicted state, lost interval, and ID. Correct boxes after the crossing do not prove that identity was preserved.",
        },
        {
          title: "Package leaving a conveyor view",
          scenario:
            "A cardboard package moves out of the camera frame while a textured background still resembles part of its last box.",
          lookFor:
            "The lifecycle should age and delete the track under a declared rule; a box that follows background texture is false persistence, not object survival.",
        },
      ],
      workedExample: {
        title: "Make one association, then expose an identity switch",
        setup:
          "Track 4 has a predicted box in the next frame. Detection A overlaps it by 60 pixels with a union of 100 pixels; Detection B overlaps it by 20 pixels with the same 100-pixel union. The association gate is IoU ≥ 0.50. One frame later, two similar tokens cross and a manual identity label shows the chosen track now follows the other token.",
        steps: [
          "Calculate IoU(track 4, A) = 60/100 = 0.60.",
          "Calculate IoU(track 4, B) = 20/100 = 0.20.",
          "Under the stated gate, A is eligible and B is not, so assign A to track 4 for this frame.",
          "Keep the candidate values and source timestamp; the 0.60 match is a rule-based association, not proof of physical identity.",
          "At the crossing frame, compare the reported track with the manual token identity and mark the first wrong assignment as an ID switch.",
          "Report detection and tracking separately: boxes may remain true positives while the identity history fails from the switch onward.",
        ],
        result:
          "Detection A passes the 0.50 association gate with IoU 0.60, but the later labelled crossing proves that the track's identity still switches.",
        takeaway:
          "Association scores select a hypothesis under a model; identity labels over time are needed to test whether that hypothesis remained true.",
      },
      handsOn: {
        setup:
          "Use two visually distinct paper tokens, an upright card for occlusion, a phone or webcam, and either an OpenCV single-object tracker or a simple detection-plus-IoU association script. Keep the tabletop stationary.",
        steps: [
          "Record a short fixed-camera sequence where both tokens move, cross, one is hidden for two or three frames, and one finally leaves the image.",
          "Label each visible token with the same ground-truth identity and box in every frame; mark fully occluded intervals and true exit separately.",
          "Initialize tracks from the first frame, then log for every later frame the source timestamp, candidate detections, association scores, chosen match, track status, and time since last reliable observation.",
          "Use an IoU gate as the first baseline, replay the sequence, and annotate every missed detection, false detection, ID switch, fragmentation, and false persistence event.",
          "Add a declared predicted/lost state plus a maximum missed-update or age limit; ensure predicted boxes are visually and structurally different from fresh detections.",
          "Replay exactly the same frames, compare the error table with the baseline, and retain one crossing or occlusion case that still fails rather than hiding it.",
          "Export a ten-frame strip showing labels, track IDs, observed versus predicted status, and the first causal association decision for each identity error.",
        ],
        observe:
          "A tracker can draw smooth boxes through an occlusion while its identity is wrong or its observation is stale. Exit, hidden, missed, and predicted are different states with different robot consequences.",
        doneWhen:
          "The replay is deterministic, every track state links to a timestamp and association decision, observed and predicted boxes cannot be confused, and the report counts identity errors in addition to frame detections.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "When two totes cross near an occluding shelf, the engineer replays timestamped detections and association costs, finds the first ID switch, bounds predicted-track age, and prevents the motion layer from treating a stale or ambiguous identity as a fresh target.",
        interviewPrompt:
          "Detection recall is 100%, but a robot follows the wrong package after two packages cross. Explain association, IoU limits, motion and appearance cues, ID switches, occlusion states, lifecycle rules, timestamps, and the acceptance evidence you need.",
      },
      commonMistakes: [
        {
          mistake:
            "Using the class label, such as box, as if it uniquely identifies one physical object.",
          correction:
            "Maintain a separate track ID and validate that identity over time with labelled sequences, especially at crossings and occlusions.",
        },
        {
          mistake:
            "Drawing a predicted box with the same status and timestamp semantics as a detector-supported observation.",
          correction:
            "Publish observed, predicted, lost, and deleted states explicitly with last-observation time and a hard freshness or uncertainty limit.",
        },
        {
          mistake:
            "Reporting only frame-level precision and recall for a tracking system.",
          correction:
            "Also count ID switches, fragmentation, false persistence, lifecycle timing, and errors on crossing, occlusion, entry, and exit slices.",
        },
        {
          mistake:
            "Deleting a track immediately after one missed detection or preserving it forever after exit.",
          correction:
            "Define confirmation, missed-update, age, and deletion rules from the physical motion and downstream safety contract, then replay boundary cases.",
        },
      ],
      checkQuestions: [
        {
          question:
            "How can detection recall be 100% while tracking identity is wrong?",
          answer:
            "Every object can have a correct box in every visible frame while the tracker assigns those boxes to the wrong persistent IDs.",
        },
        {
          question:
            "What should a tracker publish during a short full occlusion?",
          answer:
            "If it predicts, it should publish an explicit predicted or lost state with last reliable observation time and bounded age or uncertainty, not claim a fresh detection.",
        },
        {
          question:
            "What does IoU = 0.60 prove about an association?",
          answer:
            "Only that the two boxes overlap by 60% of their union; under a chosen gate it may be an eligible match, but it does not prove physical identity.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The requested visual budget is reserved for image and calibration geometry; a labelled frame strip with observed/predicted states and real association logs is stronger evidence for tracking failures.",
      },
    },
    {
      dayId: 63,
      mentalModel:
        "A vision evaluation is a sealed measuring course: inputs, labels, rules, configuration, hardware, and timing stay fixed so results can be repeated and challenged.",
      explanation: [
        "A defensible test starts with a protocol, not a metric copied after the run. Freeze the image or video manifest, label revision, class definitions, box or identity matching rule, thresholds, model and preprocessing versions, camera conditions, compute hardware, warm-up rule, and exact timing boundary. The same files must produce the same scored decisions. If a threshold changes after failures are seen, create a new version and rerun rather than silently replacing the original result.",
        "Precision and recall need their TP, FP, and FN counts because percentages can hide a tiny sample or different denominators. Report results by meaningful slices such as bright versus dim light, small versus large object, center versus edge, clear versus occluded, and stationary versus moving. Aggregate results can pass while one physically important slice fails. Contact sheets should include ordinary successes, false positives, false negatives, poor localization, ID switches, and rejected frames—not only attractive examples.",
        "Latency must match the robot decision boundary. Neural-network forward time excludes capture, decoding, resize, queueing, post-processing, and message transport, so measure capture-available to final-observation time when that is what the consumer experiences. Discard or label warm-up separately, repeat enough samples, and report a distribution such as median, 95th percentile, and maximum with hardware and load. An 85 ms 95th percentile fails a 70 ms deadline even when average inference is fast.",
        "Acceptance combines accuracy, timing, geometry, freshness, and failure behavior without pretending that any one metric proves safety. Publish a manifest, runnable command, environment and configuration, summary table, slice table, overlays, contact sheets, and the largest known limitation. Keep validation data separate from threshold selection, prevent private images from entering artifacts, and make no-action or human-review behavior part of the test whenever observations are missing, stale, or outside tolerance.",
      ],
      keyTerms: [
        {
          term: "Frozen test protocol",
          meaning:
            "A versioned definition of inputs, labels, matching, configuration, hardware, and measurements that cannot change within one reported run.",
          physicalExample:
            "A manifest names 60 tabletop images, label revision 3, IoU 0.5, model hash, threshold 0.7, and one edge computer.",
        },
        {
          term: "Validation set",
          meaning:
            "Labelled data used to choose settings or compare candidate approaches before final held-out evaluation.",
          physicalExample:
            "Thirty lighting-varied images are used to select a confidence threshold, so they are not presented as untouched final proof.",
        },
        {
          term: "Dataset slice",
          meaning:
            "A declared subset sharing a condition that may reveal a concentrated failure.",
          physicalExample:
            "Objects smaller than 40 pixels wide form a small-object slice with its own counts.",
        },
        {
          term: "Latency percentile",
          meaning:
            "A time below which a stated percentage of measured samples completed.",
          physicalExample:
            "A p95 of 85 ms means 95% of measured observations finished in 85 ms or less under that run condition.",
        },
        {
          term: "Failure taxonomy",
          meaning:
            "A stable set of categories used to classify distinct ways the pipeline fails.",
          physicalExample:
            "Glare miss, small-object miss, wrong class, poor box, ID switch, stale result, and timeout are separate categories.",
        },
        {
          term: "Held-out evidence",
          meaning:
            "Examples not used to tune the reported model, threshold, or other configuration.",
          physicalExample:
            "A separate sealed tabletop sequence is scored only after the confidence and NMS settings are locked.",
        },
      ],
      physicalExamples: [
        {
          title: "Bin-pick inspection under two lights",
          scenario:
            "The same set of paper parts is inspected under bright diffuse light and a dim side light, with identical labels and locked model settings.",
          lookFor:
            "Report each lighting slice separately; a strong bright-light aggregate must not hide dim-light misses or increased latency from camera exposure.",
        },
        {
          title: "Conveyor timing under normal load",
          scenario:
            "Recorded package frames are replayed while the edge computer also runs the normal logging and communication workload.",
          lookFor:
            "Measure capture-to-final-observation latency after warm-up and preserve slow cases, instead of quoting isolated forward-pass time on an idle machine.",
        },
      ],
      workedExample: {
        title: "Decide an accuracy-and-latency acceptance gate",
        setup:
          "A locked held-out run yields TP = 45, FP = 5, FN = 10. The protocol requires precision at least 88%, recall at least 80%, and capture-to-final-observation p95 latency no more than 70 ms. The measured p95 is 85 ms.",
        steps: [
          "Calculate prediction count TP+FP = 45+5 = 50 and precision = 45/50 = 90%.",
          "Calculate labelled-object count TP+FN = 45+10 = 55 and recall = 45/55 ≈ 81.8%.",
          "Compare 90% precision with the 88% minimum and mark that accuracy condition passed.",
          "Compare about 81.8% recall with the 80% minimum and mark that accuracy condition passed.",
          "Compare p95 latency 85 ms with the 70 ms maximum: 85 - 70 = 15 ms over budget, so timing fails.",
          "Return the overall gate as failed and inspect slow-case traces; two passing accuracy metrics cannot cancel one required timing failure.",
        ],
        result:
          "Precision and recall pass their thresholds, but p95 latency exceeds the deadline by 15 ms, so the complete acceptance gate fails.",
        takeaway:
          "A robot observation is acceptable only when every required accuracy, timing, geometry, and validity condition passes under the same frozen run.",
      },
      handsOn: {
        setup:
          "Use the Week 09 saved images or videos, labels, calibrated camera configuration, detector or classical baseline, tracking output where available, and one declared computer. Do not add new examples after seeing results.",
        steps: [
          "Create a read-only test manifest with file identifiers, label revision, train/validation/held-out membership, lighting, size, occlusion, motion, and image-region tags.",
          "Write the matching, identity, calibration-residual, rejection, and timing rules plus accuracy and latency gates before running the held-out set.",
          "Lock camera/image settings, code revision, dependencies, model hash, preprocessing, confidence, NMS, tracker lifecycle, hardware, workload, and one runnable command.",
          "Run warm-up separately, then score the held-out manifest once while saving per-item TP/FP/FN or tracking events, geometry residuals, rejection reasons, and capture-to-final timestamps.",
          "Calculate totals and slice tables with raw denominators, then report median, p95, and maximum end-to-end latency and link slow samples to traces.",
          "Build compact contact sheets for successes and every failure class, including scores, residuals, age, latency, and image IDs without private content.",
          "Issue PASS only if every predeclared gate passes; otherwise issue NEEDS REVISION with the first causal failure stage, retained baseline, and one bounded next experiment.",
        ],
        observe:
          "Aggregate accuracy can hide a weak slice, and average inference time can hide deadline misses. Frozen settings make a failure reproducible instead of negotiable after the fact.",
        doneWhen:
          "Another engineer can run one command against the same manifest, reproduce totals and slice counts, trace every metric to item evidence, and reach the same PASS or NEEDS REVISION decision.",
      },
      jobConnection: {
        roles: [
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "Before releasing a perception update, the engineer freezes the dataset, labels, configuration, hardware, matching and timing rules, then reports accuracy slices, calibration residuals, p95 latency, contact sheets, and safe rejection behavior with a reproducible command.",
        interviewPrompt:
          "A vision demo shows 90% precision and a fast average time. Design a release gate that exposes denominators, recall, data leakage, weak slices, calibration error, capture-to-result p95, stale outputs, reproducibility, and safe failure behavior.",
      },
      commonMistakes: [
        {
          mistake:
            "Showing only successful overlays or one aggregate percentage.",
          correction:
            "Publish TP/FP/FN counts, meaningful slice tables, and contact sheets for every failure category as well as representative successes.",
        },
        {
          mistake:
            "Reporting average neural-network forward time as the robot's observation latency.",
          correction:
            "Measure the consumer-relevant capture-to-final-observation boundary and report median, p95, maximum, hardware, workload, and warm-up treatment.",
        },
        {
          mistake:
            "Changing a threshold after inspecting held-out failures and keeping the old test label.",
          correction:
            "Version the change, treat those examples as seen, lock a new protocol, and evaluate on genuinely held-out evidence.",
        },
        {
          mistake:
            "Declaring the pipeline safe because accuracy and latency gates passed.",
          correction:
            "State that the test supports only its declared observation contract; separate safety analysis, downstream guards, hardware behavior, and broader operating conditions still require evidence.",
        },
      ],
      checkQuestions: [
        {
          question:
            "Why should precision and recall be reported with TP, FP, and FN counts?",
          answer:
            "The counts expose denominators and evidence size, allow recalculation, and show whether false positives or misses are driving each percentage.",
        },
        {
          question:
            "Why can average inference time pass while the deployed vision path misses its deadline?",
          answer:
            "The average can hide a slow tail and may exclude capture, decoding, queueing, preprocessing, post-processing, and transport that the robot actually waits for.",
        },
        {
          question:
            "What makes held-out evidence different from validation data?",
          answer:
            "Validation data influenced model or setting choices; held-out evidence remains unseen by those choices until the full configuration and protocol are locked.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The acceptance table, slice counts, latency distribution, traces, and failure contact sheets are the required evidence; an extra conceptual visual would not improve the decision and would exceed the geometry-only policy.",
      },
    },
  ],
} satisfies ChapterContent;
