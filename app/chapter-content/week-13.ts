import type { ChapterContent } from "../chapter-content-types";

const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";
const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";

export const week13Content = {
  week: 13,
  title: "Build a trustworthy PyTorch experiment from robot-shaped data",
  purpose:
    "Learn PyTorch as an engineering tool rather than a magic prediction box. The chapter starts with tensor and gradient contracts, builds a leakage-resistant robot-data pipeline, compares dense and convolutional encoders, trains and resumes a model correctly, diagnoses shortcuts and overfitting, measures variation across runs, and ends with a model card that exposes accuracy, latency, failure slices, intended use, and unsafe boundaries.",
  prerequisites: [
    "Use Python functions, lists, dictionaries, loops, assertions, files, and a small isolated environment without placing credentials or sensitive recordings in the lab.",
    "Read array shapes, multiply small integers, calculate an average and squared error, and distinguish a measurement from a command and an estimate from independent ground truth.",
    "Reuse a small recorded or synthetic Week 9–12 observation table, image crop, pose target, or action target; keep every exercise disconnected from powered hardware.",
    "Preserve units, frames, timestamps, episode or scene identity, data version, configuration, and failed examples so a model result can be traced back to physical meaning.",
  ],
  outcomes: [
    "Trace tensor shape, dtype, device, units, and semantic axes through a forward pass; detect unintended broadcasting and check one autograd result with a finite difference.",
    "Implement a Dataset, documented transforms, and a DataLoader whose batches preserve schema and whose train, validation, and test groups cannot leak related robot scenes or episodes.",
    "Choose and inspect a small MLP or convolutional encoder by input structure, output contract, receptive field, parameter count, latency target, and baseline rather than by fashion.",
    "Run a correct training and validation loop with an appropriate loss, optimizer, schedule, train/eval modes, resumable checkpoint, and an explicit no-gradient inference boundary.",
    "Distinguish optimization progress from generalization, repair shortcut leakage, constrain augmentation to physically plausible changes, and beat a simple held-out baseline.",
    "Record code, environment, data, configuration, random-state controls, every seed result, metrics, artifacts, and timing so another engineer can replay and challenge the experiment.",
    "Publish a robot-facing model card with intended and excluded uses, data lineage, condition slices, worst cases, p95 inference latency, limitations, rejection behavior, and a precise offline evidence boundary.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_VALIDATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
  ],
  sources: [
    {
      label: "PyTorch — Learn the Basics",
      url: "https://docs.pytorch.org/tutorials/beginner/basics/",
      useFor:
        "Official linked tutorials for tensors, datasets and DataLoaders, transforms, nn.Module construction, autograd, optimization loops, and basic model saving and loading.",
    },
    {
      label: "PyTorch — Developer Notes",
      url: "https://docs.pytorch.org/docs/stable/notes.html",
      useFor:
        "Maintainer notes for broadcasting, finite-difference gradcheck, numerical accuracy, autograd, random-source control, deterministic algorithms, device behavior, and cross-platform reproducibility limits.",
    },
    {
      label: "PyTorch — Saving and Loading Models",
      url: "https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html",
      useFor:
        "Official state_dict guidance, general training-checkpoint contents, train versus eval mode, device mapping, and the difference between inference weights and resumable training state.",
    },
    {
      label: "Hugging Face LeRobot — LeRobotDataset v3",
      url: "https://huggingface.co/docs/lerobot/main/lerobot-dataset-v3",
      useFor:
        "Maintainer robot-data format showing typed observation, action, image and timestamp features, episode metadata, PyTorch Dataset and DataLoader integration, temporal windows, and training-time image transforms.",
    },
    {
      label: "Google Research — Model Cards for Model Reporting",
      url: "https://research.google/pubs/model-cards-for-model-reporting/",
      useFor:
        "Primary model-card framework for documenting intended context, evaluation conditions, disaggregated performance, limitations, and uses for which a trained model is not suitable.",
    },
  ],
  days: [
    {
      dayId: 85,
      mentalModel:
        "A tensor is a labelled crate of numbers, and autograd is the receipt trail showing how one final loss depends on every adjustable number upstream.",
      explanation: [
        "A PyTorch tensor is an array plus an engineering contract. Its shape tells how many positions exist along each axis, its dtype tells how each number is represented, and its device tells which processor owns its storage. For a camera batch shaped `[B, C, H, W]`, the axes might mean examples, color channels, pixel rows, and pixel columns. Those meanings are not stored in the shape itself, so code, assertions, and names must preserve them. A tensor shaped `[4, 3, 32, 32]` contains 12,288 values, but that count cannot tell whether the colors are RGB, whether pixels were scaled, or which camera frame produced them.",
        "Shape changes are part of the model, not tidying performed around it. Indexing can remove an axis, `unsqueeze` can add one, `permute` reorders axes, and `reshape` preserves element count but may return either a compatible view or a copy. Broadcasting lets compatible shapes act together by expanding size-one or missing leading dimensions. That is useful for subtracting a three-channel mean from every image. It is dangerous when a prediction shaped `[B]` meets a target shaped `[B, 1]`: PyTorch may create pairwise comparisons shaped `[B, B]` instead of raising an error. Assert the exact prediction and target shapes before computing a robot loss.",
        "Autograd builds a graph of differentiable operations during the forward calculation when a leaf tensor requires gradients. Calling backward on a scalar loss applies the chain rule and accumulates each parameter’s derivative in `.grad`. A gradient is a local slope: its sign and size predict how a tiny parameter change would change the current loss. It is not a command for a motor and does not prove the model is physically correct. Gradients accumulate by default, which helps some algorithms but means an ordinary training loop must clear them deliberately before the next backward pass.",
        "A small numerical check can catch a wrong derivative, detached graph, in-place change, or unexpected scale before training hides the defect. For a real scalar function, central difference estimates the slope as `(f(w + ε) - f(w - ε)) / (2ε)`. Compare that estimate with autograd in double precision using a small but not absurd epsilon and an explicit tolerance. Finite differences also have rounding and truncation error, so approximate agreement is the goal. Separately reject non-finite inputs, loss, gradients, or parameters; a successfully completed backward call does not make NaN or infinity acceptable.",
      ],
      keyTerms: [
        {
          term: "Tensor",
          meaning:
            "A multidimensional array whose shape, dtype, device, and semantic axes form the input, output, or parameter contract.",
          physicalExample:
            "Four RGB camera crops of 32 by 32 pixels form a `[4, 3, 32, 32]` tensor when channel-first order is declared.",
        },
        {
          term: "Shape",
          meaning:
            "The ordered size of every tensor axis; the order must be paired with human meanings such as batch, time, joint, row, or column.",
          physicalExample:
            "A seven-joint state history for eight times can be `[8, 7]`, while `[7, 8]` contains the same count but assigns a different meaning to each axis.",
        },
        {
          term: "Dtype",
          meaning:
            "The numeric representation used for tensor elements, such as floating point for normalized measurements or integer indices for class labels.",
          physicalExample:
            "A camera byte value 255 and a normalized float value 1.0 can describe the same white pixel only after a declared scaling transform.",
        },
        {
          term: "Device",
          meaning:
            "The processor and memory location that own a tensor, such as CPU, CUDA GPU, or Apple Metal acceleration.",
          physicalExample:
            "A model on a GPU cannot multiply a camera tensor still stored on the CPU until the input is moved to the same device.",
        },
        {
          term: "Broadcasting",
          meaning:
            "Automatic expansion of compatible size-one or missing dimensions so an elementwise operation can produce a larger result.",
          physicalExample:
            "Subtracting one `[3, 1, 1]` RGB mean from every pixel of a `[B, 3, H, W]` image batch uses intentional broadcasting.",
        },
        {
          term: "Gradient",
          meaning:
            "A derivative that estimates how the current scalar loss changes for a tiny change in one tensor element or model parameter.",
          physicalExample:
            "A negative gradient for one weight says a small increase in that weight would locally lower the current loss, before limits or later data are considered.",
        },
      ],
      physicalExamples: [
        {
          title: "Stacked observation cards",
          scenario:
            "Make two paper camera cards, give each three transparent color sheets, and draw a four-by-four pixel grid on every sheet before stacking them in batch-channel-height-width order.",
          lookFor:
            "The physical stack makes `[2, 3, 4, 4]` readable, while swapping color sheets with camera cards changes axis meaning even though all 96 values remain.",
        },
        {
          title: "Slope on an adjustable ramp",
          scenario:
            "Place a marble at one marked point on a shallow paper ramp, then compare the height a tiny step to its left and right without letting the marble command anything.",
          lookFor:
            "The two nearby heights approximate the local slope just as a central difference checks a gradient, but the slope describes only that neighborhood.",
        },
      ],
      workedExample: {
        title: "Check one autograd gradient by hand",
        setup:
          "Use the scalar prediction `ŷ = wx` and squared loss `L = (ŷ - y)²` with weight `w = 1.5`, input `x = 2.0`, target `y = 4.0`, and central-difference epsilon `ε = 0.001`.",
        steps: [
          "Compute the prediction: `ŷ = 1.5 × 2.0 = 3.0`; every quantity is a scalar floating-point tensor on one device.",
          "Compute the loss: `L = (3.0 - 4.0)² = 1.0`; the loss is scalar, so backward can start without an extra gradient argument.",
          "Apply the chain rule: `dL/dw = 2(wx - y)x = 2(3 - 4)2 = -4`; this is the expected autograd value.",
          "Evaluate the plus side: `f(1.501) = (1.501 × 2 - 4)² = (-0.998)² = 0.996004`.",
          "Evaluate the minus side: `f(1.499) = (1.499 × 2 - 4)² = (-1.002)² = 1.004004`.",
          "Calculate central difference: `(0.996004 - 1.004004) / 0.002 = -4.0`, then compare with autograd using a declared tolerance.",
        ],
        result:
          "Autograd and central difference both give a gradient of about -4.0 for this input; the check validates this local derivative, not the dataset, target, or robot behavior.",
        takeaway:
          "Trace shapes and physical meanings first, then use an independent numerical slope to challenge one gradient before trusting a long training run.",
      },
      handsOn: {
        setup:
          "Use a tiny CPU-only PyTorch script and synthetic observation-to-action values. Do not install unreviewed data, use private recordings, or connect predictions to robot commands.",
        steps: [
          "Create an observation tensor with explicit batch and feature axes; print shape, dtype, device, finite-value status, minimum, maximum, and the unit meaning of each feature.",
          "Create targets with exactly the intended output shape, assert prediction and target equality, then deliberately change `[B]` to `[B, 1]` and record the unintended broadcasted result shape.",
          "Trace a forward calculation through at least three operations, recording every input and output shape without using the loss value as a substitute for those checks.",
          "Set one double-precision scalar parameter to require gradients, compute the worked squared loss, call backward once, and compare its gradient with the central-difference calculation.",
          "Run backward twice without clearing gradients, observe accumulation, then use the training-loop clearing operation and verify the next gradient returns to the single-pass value.",
          "Add assertions for finite inputs, loss, gradients, and outputs; save the script, decisive console table, PyTorch version, and one explanation of what this offline test cannot prove.",
        ],
        observe:
          "A mathematically legal broadcast can change the loss pairing silently, gradients add unless cleared, and a finite-difference check should closely match the simple autograd slope.",
        doneWhen:
          "A reviewer can read every tensor axis, reproduce the 12,288-element count and -4 gradient, trigger the broadcast failure, and see the exact assertion that blocks it.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION],
        workExample:
          "Review a robot-policy training boundary by turning observation and action schemas into tensor assertions, detecting silent broadcasting or device errors, and adding finite and numerical-gradient gates before costly training begins.",
        interviewPrompt:
          "A loss decreases even though predictions are shaped `[32]` and targets `[32, 1]`. Explain PyTorch broadcasting, inspect the produced loss shape, repair the contract, and describe one independent gradient check.",
      },
      commonMistakes: [
        {
          mistake: "Treating a matching element count as proof that two tensors mean the same thing.",
          correction:
            "Name every axis and assert exact ordered shapes, units, scaling, frame, dtype, and device at the model and loss boundaries.",
        },
        {
          mistake: "Assuming a loss call would reject every wrong prediction-target shape.",
          correction:
            "Check the shapes before the loss because broadcasting can produce a valid but unintended pairwise result without an exception.",
        },
        {
          mistake: "Calling backward repeatedly and forgetting that gradients accumulate.",
          correction:
            "Clear gradients at the intended boundary, then verify one known gradient and reject non-finite values before the optimizer step.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can `[B]` predictions and `[B, 1]` targets be more dangerous than incompatible shapes?",
          answer:
            "They may broadcast to `[B, B]` and compute every prediction against every target, so training continues on the wrong objective instead of failing loudly.",
        },
        {
          question: "What does a gradient of -4 mean in the worked example?",
          answer:
            "Near the current weight, a small positive weight change is predicted to lower the current loss at roughly four loss units per weight unit; it is not a global promise.",
        },
        {
          question: "What does agreement with a finite difference establish?",
          answer:
            "It supports the local derivative implementation for the checked inputs and tolerance, but says nothing about data quality, generalization, latency, or physical safety.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A labelled tensor-axis trace plus autograd and finite-difference paths materially exposes silent broadcasting and gradient flow that plain prose makes hard to compare.",
      },
    },
    {
      dayId: 86,
      mentalModel:
        "A Dataset is a librarian handing out one correctly labelled case, while a DataLoader packs cases into batches without moving related exam answers between rooms.",
      explanation: [
        "A robot-learning sample is a schema, not whatever a file happens to contain. One sample might map a timestamped observation vector to a two-dimensional target action; an image sample might also carry scene ID, episode ID, camera identity, units, frame, outcome, and validity. A map-style PyTorch Dataset reports its length and returns one example by index. The training loop should not know filenames or repair missing fields. Validate the schema at the Dataset boundary so every sample has defined shapes, dtypes, finite values, allowed ranges, and lineage before batching begins.",
        "Transforms convert stored data into the model’s input and target contract. Resizing, cropping, normalization, dtype conversion, and physically valid augmentation belong in a documented order because those operations do not commute. Normalization statistics are learned from the training set only; using validation pixels to calculate the mean or range leaks evaluation information into preprocessing. Random augmentation belongs on training examples and should be reproducible when debugging. Validation and test transforms should normally be deterministic so a metric change reflects the model or data version rather than a fresh random crop.",
        "A DataLoader chooses sample order, groups samples into minibatches, and can use worker processes to prepare them. Batch size changes memory use, gradient noise, and the shape seen by the model. With 103 samples and batch size 16, ordinary non-dropping iteration produces six full batches and one final batch of seven. Code must either accept that smaller batch or deliberately set `drop_last` and record that seven examples were excluded from each epoch. Shuffling changes order, not split membership, and sequential evaluation is often easier to trace.",
        "Robot frames are strongly related within a scene or episode. Randomly splitting individual frames can place near-identical moments from one grasp in both training and validation, allowing the model to remember a background, operator, or start pose. Split whole groups—such as episode, route, object instance, or collection session—before fitting transforms. Freeze IDs and verify set intersections are empty. Class balance alone is not enough: a held-out split also needs the lighting, surfaces, poses, speeds, failures, and sensor conditions required by the intended evaluation claim.",
      ],
      keyTerms: [
        {
          term: "Dataset",
          meaning:
            "A PyTorch interface that defines how many examples exist and returns one validated example with its target and lineage.",
          physicalExample:
            "Index 17 returns one camera crop, two-coordinate cup target, scene ID, episode ID, and validity flag rather than an unnamed image.",
        },
        {
          term: "Schema",
          meaning:
            "The fixed meanings, shapes, dtypes, units, frames, ranges, required metadata, and version for each sample field.",
          physicalExample:
            "A target `[x, y]` in metres in `camera_optical_frame` is a different schema from pixel coordinates `[column, row]`.",
        },
        {
          term: "Transform",
          meaning:
            "A documented operation that converts a stored feature or target into the representation consumed during training or evaluation.",
          physicalExample:
            "Convert an unsigned-byte image to float, scale it to zero through one, then normalize with training-only channel statistics.",
        },
        {
          term: "DataLoader",
          meaning:
            "An iterable that selects examples, collates them into batches, and optionally shuffles or prepares them with worker processes.",
          physicalExample:
            "Sixteen image-target pairs become input shape `[16, 3, 64, 64]` and target shape `[16, 2]` for one update.",
        },
        {
          term: "Minibatch",
          meaning:
            "A subset of examples evaluated together before one optimizer update or metric accumulation step.",
          physicalExample:
            "A final batch of seven is still valid when 103 examples are loaded sixteen at a time without dropping data.",
        },
        {
          term: "Split leakage",
          meaning:
            "Evaluation contamination caused when validation or test information, or closely related examples, influences model training or preprocessing.",
          physicalExample:
            "Adjacent frames from one stationary camera episode appear in both training and validation, so the background is almost identical in the exam.",
        },
      ],
      physicalExamples: [
        {
          title: "Episode envelopes",
          scenario:
            "Put every frame card from one pretend robot attempt into a sealed envelope, then assign entire envelopes to train, validation, or test boxes.",
          lookFor:
            "No episode identity crosses boxes, even if this makes the number of individual frames less perfectly balanced than random frame splitting.",
        },
        {
          title: "Packing the last delivery tray",
          scenario:
            "Pack 103 counters onto trays that hold 16, keeping the last partially filled tray instead of inventing counters or quietly throwing it away.",
          lookFor:
            "Six trays contain 16 and the seventh contains seven; batch-aware code handles both shapes along the batch axis.",
        },
      ],
      workedExample: {
        title: "Design a grouped split and count its batches",
        setup:
          "A synthetic cup-localization dataset has 12 episodes. Assign eight episodes to training, two to validation, and two to test. The eight training episodes contain 103 examples and use batch size 16 without dropping the last batch.",
        steps: [
          "Freeze episode IDs before reading frames: train `{E01…E08}`, validation `{E09,E10}`, and test `{E11,E12}`.",
          "Verify pairwise set intersections are empty; an empty result tests identity separation, while condition coverage needs a separate table.",
          "Fit image normalization values using frames from `E01…E08` only, then reuse those frozen values unchanged on validation and test.",
          "Compute full training batches: integer division `103 ÷ 16` gives six complete batches containing 96 examples.",
          "Compute the remainder: `103 - 96 = 7`, so non-dropping iteration yields `6 + 1 = 7` batches and the last batch size is seven.",
          "Record expected input and target shapes for both batch cases and assert that episode IDs emitted by each loader belong only to its frozen split.",
        ],
        result:
          "The loader yields seven training batches, preserves all 103 examples, and demonstrates episode-level identity isolation; it still needs a condition-coverage review before supporting a generalization claim.",
        takeaway:
          "Split related robot data before preprocessing, then make the loader prove both identity separation and exact batch contracts.",
      },
      handsOn: {
        setup:
          "Create a tiny non-sensitive synthetic dataset with observation vectors or generated colored squares, numeric targets, and at least six scene or episode groups.",
        steps: [
          "Write a versioned sample schema listing every field, shape, dtype, unit, frame or coordinate convention, range, nullable rule, and group identity.",
          "Implement a Dataset that validates one sample at a time and deliberately add one missing field, wrong shape, non-finite value, and unknown schema version to prove each failure is rejected.",
          "Assign whole groups to train, validation, and test using frozen ID lists; assert pairwise intersections are empty and save per-split condition counts.",
          "Fit any mean, standard deviation, or range on training samples only; make training augmentation stochastic but physically plausible and make validation transforms deterministic.",
          "Build loaders with a batch size that creates a smaller final batch, then print batch shapes, group IDs, target ranges, and included example counts.",
          "Save schema, split manifest, preprocessing values, loader configuration, checks, and one contact sheet or table that lets a reviewer inspect examples from every split.",
        ],
        observe:
          "Schema defects fail close, group IDs never cross splits, validation samples stay stable between passes, and the last batch differs only along the batch axis.",
        doneWhen:
          "A clean run proves zero group overlap, accounts for every included and dropped example, reproduces preprocessing values, and shows the exact sample that each deliberate validator rejects.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION],
        workExample:
          "Build a robot-observation Dataset and DataLoader contract that preserves episode lineage, applies training-only preprocessing statistics, blocks schema drift, and produces a reviewable split and condition-coverage report.",
        interviewPrompt:
          "Your image model has excellent validation accuracy, but adjacent frames from each robot episode were randomly split. Explain why this is leakage and redesign the split, transforms, and checks.",
      },
      commonMistakes: [
        {
          mistake: "Randomly splitting individual frames because it produces balanced row counts.",
          correction:
            "Group related frames by episode, scene, object, route, or collection session before splitting, then measure condition coverage separately.",
        },
        {
          mistake: "Calculating normalization statistics over the full dataset before making splits.",
          correction:
            "Fit every data-dependent preprocessing value on the training split only and freeze it for validation, test, and later inference.",
        },
        {
          mistake: "Assuming every DataLoader batch has the requested batch size.",
          correction:
            "Handle the smaller final batch or deliberately document `drop_last`; assert only invariant feature and target axes.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the difference between a Dataset and a DataLoader?",
          answer:
            "A Dataset defines and returns individual indexed examples; a DataLoader selects their order, batches them, and optionally prepares them with workers.",
        },
        {
          question: "Why should normalization values come from training data only?",
          answer:
            "Validation or test statistics would let evaluation information influence preprocessing and make the reported generalization estimate optimistic.",
        },
        {
          question: "Does an empty intersection of episode IDs prove a good evaluation split?",
          answer:
            "It proves identity separation for those IDs, but condition coverage, label quality, collection bias, and deployment relevance still need direct review.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "An episode-to-split-to-transform-to-batch flow materially clarifies where leakage enters and why training and validation preprocessing paths must diverge.",
      },
    },
    {
      dayId: 87,
      mentalModel:
        "An MLP is a team where everyone reads every input, while a convolutional encoder reuses one small detective across an image to find local patterns.",
      explanation: [
        "A neural network is a parameterized function built from modules. A linear layer computes weighted sums plus biases; without a nonlinear activation, stacking linear layers still collapses into one linear transformation. ReLU keeps positive values and maps negative values to zero, allowing the network to form piecewise nonlinear decisions. An MLP is suitable when a fixed-size observation vector has meaningful features such as joint positions, velocities, ranges, and task state. The output layer must match the physical target contract exactly, whether that is two pose coordinates, class logits, or a bounded action representation.",
        "A dense layer connects every input to every output. Its parameter count is `input_features × output_features + output_features` because each output has one weight per input and one bias. Flattening a 64-by-64 RGB image into 12,288 inputs and connecting it to 128 hidden units requires more than 1.5 million parameters before the next layer. That may memorize small data, ignore image locality, and exceed an edge latency or memory budget. Parameter count is a capacity and deployment clue, not a direct score of intelligence or quality.",
        "A convolution slides the same small kernel across spatial positions. Weight sharing lets one edge or corner detector operate on the left, middle, or right of an image. The input and output still have batch and channel axes, and stride, padding, dilation, and kernel size determine spatial shape. Deeper layers combine local patterns into a larger receptive field. This translation-related bias often makes a CNN a better visual encoder than a fully connected image layer, but it does not make the model invariant to lighting, scale, viewpoint, occlusion, or camera changes.",
        "Architecture selection starts with the task contract and a baseline. Trace every intermediate shape, calculate parameters, inspect activation ranges, and time inference on the intended class of device. Compare a constant or simple linear baseline before adding depth. A smaller model that meets held-out error and latency may be the correct robot component. A model output is still only a prediction: downstream software must validate freshness, finite values, units, frames, confidence or quality rules, and action limits before it can affect any simulated or physical execution.",
      ],
      keyTerms: [
        {
          term: "Linear layer",
          meaning:
            "A module that maps an input vector to weighted sums plus one bias per output feature.",
          physicalExample:
            "Ten normalized robot-state values feed eight hidden values through an `nn.Linear(10, 8)` layer containing 88 parameters.",
        },
        {
          term: "Activation function",
          meaning:
            "A nonlinear operation between parameterized layers that prevents the whole network from reducing to one linear map.",
          physicalExample:
            "ReLU passes a positive feature response and replaces a negative response with zero before the next layer.",
        },
        {
          term: "MLP",
          meaning:
            "A multilayer perceptron made mainly from dense linear layers and nonlinear activations for fixed-size feature vectors.",
          physicalExample:
            "Joint angles, velocities, gripper state, and target offset form one vector used to predict a two-number correction.",
        },
        {
          term: "Convolution",
          meaning:
            "A local weighted operation whose kernel parameters are reused across spatial positions.",
          physicalExample:
            "The same three-by-three filter responds to a vertical cup edge near either side of the camera image.",
        },
        {
          term: "Channel",
          meaning:
            "A feature-map axis; input channels may be colors and later channels represent learned pattern responses.",
          physicalExample:
            "A convolution turns three RGB channels into sixteen learned maps while preserving the declared image height and width.",
        },
        {
          term: "Receptive field",
          meaning:
            "The region of the original input that can influence one later feature value.",
          physicalExample:
            "One early feature sees a three-by-three patch, while stacked convolutions let a later feature combine evidence from a wider cup region.",
        },
      ],
      physicalExamples: [
        {
          title: "Everyone reads every gauge",
          scenario:
            "Give ten gauge cards to each of eight pretend technicians and let every technician choose a different weight for every gauge before reporting one value.",
          lookFor:
            "The full set needs eighty connection weights plus eight biases, matching a dense 10-to-8 layer and showing how connections grow.",
        },
        {
          title: "Sliding stencil detector",
          scenario:
            "Cut a three-by-three stencil, assign a small score to each opening, and slide the same stencil over a drawn grid containing the same corner in several places.",
          lookFor:
            "One shared scoring pattern detects the corner at multiple locations instead of learning a separate detector for every pixel position.",
        },
      ],
      workedExample: {
        title: "Compare one dense layer with one image convolution",
        setup:
          "A robot-state MLP maps 10 input features to 8 hidden features. A visual encoder applies a 3-by-3 convolution from 3 RGB channels to 16 output channels, with one bias per output channel, stride 1, and padding 1 on a 32-by-32 image.",
        steps: [
          "Count dense weights: `10 × 8 = 80`, because every one of eight outputs reads all ten input features.",
          "Add eight dense biases: `80 + 8 = 88` parameters for `Linear(10, 8)`.",
          "Count one convolutional filter: `3 × 3 × 3 = 27` weights because it spans height, width, and all three input channels.",
          "Multiply by 16 output channels and add 16 biases: `(27 + 1) × 16 = 448` convolution parameters.",
          "Use output-size arithmetic: `(32 + 2×1 - 3) / 1 + 1 = 32`, so output shape is `[B, 16, 32, 32]`.",
          "State the decision boundary: these counts explain structure and cost, but held-out error, failure slices, and measured inference latency decide whether either encoder serves the task.",
        ],
        result:
          "The state layer has 88 parameters; the image convolution has 448 shared parameters and preserves 32-by-32 spatial size while creating 16 learned channels.",
        takeaway:
          "Calculate connectivity and shapes before training, then choose the smallest architecture that earns its complexity against a baseline under robot-relevant tests.",
      },
      handsOn: {
        setup:
          "Use CPU-only PyTorch and synthetic feature vectors or generated geometric images. Keep the output disconnected from any live controller.",
        steps: [
          "Write an explicit input and output contract for either a ten-feature observation-to-two-value model or a small image-to-two-coordinate model.",
          "Implement a linear baseline, a tiny MLP, and—only for image input—a tiny CNN using named `nn.Module` parts with an inspectable forward path.",
          "Feed one nominal batch and one batch with a different batch size; assert every intermediate shape and the exact final target shape.",
          "Calculate parameter counts by hand for one dense and one convolutional layer, then compare them with PyTorch’s trainable-parameter count.",
          "Inspect output and activation minima, maxima, means, and finite status; deliberately pass the wrong channel order and make the contract fail before inference.",
          "Time repeated evaluation-mode, no-gradient CPU calls after warm-up, save architecture, shapes, parameter table, device, timing method, and a baseline comparison plan.",
        ],
        observe:
          "The MLP removes the feature axis into hidden values, the CNN preserves spatial organization until deliberate pooling or flattening, and parameter counts match the hand calculation.",
        doneWhen:
          "A reviewer reproduces the 88 and 448 counts, follows every tensor shape, sees the wrong-layout assertion fire, and understands why no model-quality claim was made from architecture alone.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE],
        workExample:
          "Select an observation encoder for a robot-learning component by tracing input semantics and shapes, calculating parameter and memory cost, measuring edge inference latency, and defining the validation and runtime guards around its output.",
        interviewPrompt:
          "Compare an MLP and CNN for predicting a camera-relative target. Derive one parameter count, explain receptive field and weight sharing, and name evidence beyond training loss that decides the design.",
      },
      commonMistakes: [
        {
          mistake: "Adding more dense layers without nonlinear activations and expecting a more expressive nonlinear model.",
          correction:
            "Place an appropriate nonlinear activation between linear layers and inspect the resulting activation and output ranges.",
        },
        {
          mistake: "Flattening a large image immediately because the code becomes shorter.",
          correction:
            "Preserve spatial structure with a suitable visual encoder, calculate the dense parameter explosion, and compare latency and held-out performance.",
        },
        {
          mistake: "Choosing the architecture with the most parameters before defining a baseline or deployment budget.",
          correction:
            "Start with the simplest credible baseline and require added capacity to improve frozen evaluation slices within measured memory and latency limits.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does stacking only linear layers still describe one linear transformation?",
          answer:
            "Composing linear or affine maps can be algebraically combined into another affine map; nonlinear activations create boundaries that one affine map cannot represent.",
        },
        {
          question: "Why can a convolution use fewer parameters than a full image-sized dense layer?",
          answer:
            "It reuses the same small local kernel across positions rather than learning a separate weight from every pixel to every output.",
        },
        {
          question: "What does a correct parameter count fail to prove?",
          answer:
            "It does not prove suitable data, low held-out error, robustness, runtime latency, calibrated outputs, or safe robot integration.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The two physical connection exercises and explicit parameter and output-shape arithmetic already make dense versus shared local connectivity inspectable without another selected visual.",
      },
    },
    {
      dayId: 88,
      mentalModel:
        "Training is a controlled descent: the loss marks local height, gradients point uphill, the optimizer chooses a step downhill, and a checkpoint records the exact campsite.",
      explanation: [
        "A loss function converts prediction error into the scalar training signal differentiated by autograd. Choose it from the target meaning, noise, and cost of errors. Mean squared error squares numeric residuals, so large regression errors receive extra weight and its unit is the square of the target unit. Cross-entropy expects class logits and class targets under its documented contract. A loss is not automatically a deployment metric: an image-to-position model may train with normalized MSE while reviewers need centimetre error, tail error, rejection rate, and task success in physical units.",
        "One ordinary training step has a strict evidence path. The model predicts a batch, the loss compares predictions with targets, gradients are cleared, backward computes parameter gradients, and the optimizer updates parameters. PyTorch gradients accumulate, so an accidental missing clear operation changes the effective update across batches. Inspect finite loss, gradient norms, and parameter updates before celebrating a downward curve. Clipping may contain an extreme gradient but can also hide wrong scaling or corrupt data; diagnose the cause before treating clipping as the fix.",
        "The learning rate controls update size, while an optimizer defines how gradients and stored history become parameter changes. Plain stochastic gradient descent makes the relationship easy to inspect; momentum and Adam keep additional state. A schedule changes the learning rate according to a declared rule, such as after an epoch or validation plateau. Step it at the intended frequency and log the actual value. Validation runs with the model in evaluation mode and gradients disabled, and its examples must never call the optimizer or select themselves into the training set.",
        "An inference checkpoint can be only model parameters plus the architecture and preprocessing needed to use them. A resumable training checkpoint needs more: model state, optimizer state, scheduler state, completed epoch or step, random-generator states where controlled, configuration, data and split identity, code and environment versions, and recent metric state. Loading must use the intended device and mode. Prove resumption by comparing the next batch, learning rate, loss, and parameter result with an uninterrupted reference; successfully opening a file proves only serialization.",
      ],
      keyTerms: [
        {
          term: "Loss function",
          meaning:
            "A differentiable scalar objective that tells training how current predictions disagree with targets under a declared error rule.",
          physicalExample:
            "Squared position error penalizes a ten-centimetre miss four times as much as a five-centimetre miss before averaging.",
        },
        {
          term: "Optimizer",
          meaning:
            "An algorithm and stored state that convert parameter gradients into updates.",
          physicalExample:
            "SGD moves a weight opposite its gradient by learning rate times gradient, while Adam also tracks moving statistics.",
        },
        {
          term: "Learning rate",
          meaning:
            "A scale controlling how far an optimizer changes parameters at each update.",
          physicalExample:
            "A very large step can jump across a low-loss region, while a tiny step may make little progress within the available training budget.",
        },
        {
          term: "Schedule",
          meaning:
            "A declared rule that changes learning rate or another training hyperparameter as steps, epochs, or monitored metrics change.",
          physicalExample:
            "After five epochs, a schedule reduces a 0.1 learning rate to 0.05 and the run log records the new value.",
        },
        {
          term: "Checkpoint",
          meaning:
            "A versioned snapshot of the state needed either for inference or for continuing a training process.",
          physicalExample:
            "A resume file stores model, Adam buffers, scheduler position, completed step, data version, configuration, and controlled random states.",
        },
        {
          term: "Evaluation mode",
          meaning:
            "The model mode used for inference or validation so modules such as dropout and batch normalization follow evaluation behavior.",
          physicalExample:
            "A loaded vision model calls `eval()` before latency and held-out error are measured, while training later calls `train()` again.",
        },
      ],
      physicalExamples: [
        {
          title: "Measured steps down a paper hill",
          scenario:
            "Draw a U-shaped height curve, place a token on one side, and compare moving opposite the local slope with a large, medium, and tiny step.",
          lookFor:
            "The large step can overshoot, the tiny step progresses slowly, and no single local slope reveals the whole terrain.",
        },
        {
          title: "Saved workshop bench",
          scenario:
            "Pause a multi-step paper assembly and photograph not only the object but also tool settings, remaining instructions, material labels, and the exact completed step.",
          lookFor:
            "The object alone resembles model weights; continuing identically also needs optimizer-like tool state, schedule position, inputs, and procedure version.",
        },
      ],
      workedExample: {
        title: "Trace one SGD update and its scheduled next step",
        setup:
          "A scalar model weight is `θ = 1.0`. Backward produces gradient `g = 0.4`. Plain SGD uses learning rate `η = 0.1`, and an epoch schedule halves that rate before the following epoch.",
        steps: [
          "Confirm the gradient belongs to the current batch and parameter, is finite, and was computed after old gradients were cleared.",
          "Apply the SGD rule: `θ_new = θ - ηg = 1.0 - 0.1 × 0.4`.",
          "Calculate the update magnitude: `0.1 × 0.4 = 0.04`, so `θ_new = 0.96`.",
          "Advance the schedule at its documented epoch boundary: the next learning rate becomes `0.1 × 0.5 = 0.05`.",
          "Record the checkpoint after the update with `θ = 0.96`, optimizer state, scheduler position, completed step, random states, and run identities.",
          "Resume and verify that the next known batch sees learning rate 0.05 and produces the same next loss and parameter as the uninterrupted reference within tolerance.",
        ],
        result:
          "The inspected update moves the weight from 1.0 to 0.96, and the resumable state makes the next step use 0.05 rather than accidentally repeating or skipping the schedule.",
        takeaway:
          "A decreasing loss is not enough; the update order, learning rate, modes, saved state, and next-step replay must agree with the declared experiment.",
      },
      handsOn: {
        setup:
          "Train a tiny CPU model on the synthetic or recorded Week 13 dataset. Keep validation read-only and keep all outputs disconnected from motion.",
        steps: [
          "Choose a loss whose input shape and target meaning fit the task; calculate one batch loss by hand in physical or normalized units and compare with PyTorch.",
          "Implement the explicit step order, logging batch identity, loss, learning rate, gradient norm, finite checks, and one parameter value before and after the update.",
          "Run a separate validation function with `eval()` and no gradient tracking, then assert that no optimizer step or training-transform randomness occurs in that path.",
          "Add one simple schedule, log its value every epoch, and deliberately move the schedule call to the wrong boundary so a regression assertion detects the shifted sequence.",
          "Save a general checkpoint containing model, optimizer, scheduler, completed position, controlled random states, configuration, preprocessing, and code/data/split identities.",
          "Compare an uninterrupted two-epoch run with a one-epoch-save-load-resume run on the same ordered data; retain next-loss and parameter differences plus the tolerance.",
        ],
        observe:
          "The first update matches hand arithmetic, validation cannot mutate parameters, and complete state produces a matching next step while weights-only loading does not promise that continuation.",
        doneWhen:
          "A reviewer reproduces the 0.96 update, inspects the learning-rate sequence, proves validation is read-only, and resumes to the same next result within the declared numerical tolerance.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE],
        workExample:
          "Own a robot-model training runner that separates optimization from validation, logs gradient and schedule health, saves portable inference weights and full resume state, and proves checkpoint continuation with a deterministic regression case.",
        interviewPrompt:
          "A resumed run diverges immediately although model weights loaded successfully. Enumerate missing state, train/eval and data-order checks, then design a next-batch equivalence test.",
      },
      commonMistakes: [
        {
          mistake: "Calling backward on each batch without clearing the previous gradients.",
          correction:
            "Clear at the intended accumulation boundary, log gradient norms, and compare one update with hand arithmetic before extending the run.",
        },
        {
          mistake: "Using validation loss in an optimizer step because the value is already available.",
          correction:
            "Keep validation in evaluation mode with gradients disabled and no optimizer mutation; use it only for declared selection or stopping decisions.",
        },
        {
          mistake: "Saving only model weights and calling the file a resumable checkpoint.",
          correction:
            "Include optimizer, scheduler, training position, controlled random states, configuration, preprocessing, and code/data lineage, then test the next step.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is a training loss not automatically the deployment metric?",
          answer:
            "It is chosen to provide an optimization signal and may use normalized or squared units; deployment also needs physical error, tail failures, latency, rejections, and task outcomes.",
        },
        {
          question: "What three core operations normally occur around backward in one optimizer step?",
          answer:
            "Clear old gradients, compute backward on the current scalar loss, then let the optimizer update parameters; the exact clearing boundary changes for deliberate accumulation.",
        },
        {
          question: "What is the strongest simple proof that a checkpoint can resume training?",
          answer:
            "On fixed data and environment, its next learning rate, loss, and updated parameters match an uninterrupted reference within a declared tolerance.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The ordered update ledger and uninterrupted-versus-resumed next-step table provide more decisive evidence than another generic training-loop illustration.",
      },
    },
    {
      dayId: 89,
      mentalModel:
        "A model can ace practice by reading a smudge on the answer sheet; only a clean exam and broken-shortcut trials reveal whether it learned the robot task.",
      explanation: [
        "Optimization error asks how well the model fits examples used to update it. Generalization asks how well the chosen frozen model performs on relevant examples not used for those updates. Overfitting appears when training performance improves while held-out performance stalls or worsens, but the gap alone does not name the cause. Capacity, too little varied data, label noise, repeated near-duplicates, excessive tuning, and a distribution mismatch can all contribute. Plot train and validation metrics against the same checkpoint sequence and inspect actual errors rather than diagnosing from one final number.",
        "Leakage makes an exam easier by letting information cross the intended boundary. Adjacent robot video frames in both splits, normalization fit on all images, selecting examples after seeing test errors, or tuning repeatedly to the test set can each contaminate evaluation. A test set is not a second validation set. Freeze group identities and preprocessing lineage, use validation for limited model decisions, and evaluate the test set at the declared final boundary. If leakage is found, repair the split and invalidate the affected results instead of subtracting an imagined leakage amount.",
        "A shortcut is a feature correlated with the answer in collected data but unreliable for the intended task. If every red block appears on a blue mat and every green block on a grey mat, a visual model may classify the mat. Condition slices, occlusion tests, background swaps, and error contact sheets can expose this behavior. Augmentation can add plausible variation, but it cannot repair a leaked split or invent missing physics. A horizontal flip may require changing an x-coordinate sign or may be invalid for an asymmetric gripper, so every augmentation needs a target-consistency and physical-validity argument.",
        "A baseline tells whether learned complexity earns its cost. For numeric pose targets, always predicting the training mean is a useful lower bar; a linear model may be stronger. Compare on identical frozen splits and physical metrics. If the complex model has validation MSE 0.30 while the mean baseline has 0.28, the model is worse on that metric even if its training MSE is 0.05. Also compare condition slices, worst errors, latency, memory, and safe rejection because a small average improvement can hide a robot-critical regression.",
      ],
      keyTerms: [
        {
          term: "Overfitting",
          meaning:
            "Learning training-specific detail that lowers training error without improving relevant held-out performance.",
          physicalExample:
            "A cup locator memorizes backgrounds from eight collection scenes and misses the same cup on a new table.",
        },
        {
          term: "Generalization gap",
          meaning:
            "A difference between comparable held-out and training metrics, useful as a symptom but not a complete diagnosis.",
          physicalExample:
            "Training MSE 0.05 and validation MSE 0.30 give a gap of 0.25 under the same scaling and target definition.",
        },
        {
          term: "Data leakage",
          meaning:
            "Any path by which evaluation examples or information influence fitting, preprocessing, model selection, or repeated tuning.",
          physicalExample:
            "Frames one timestamp apart from the same grasp appear in train and validation, making the held-out scene nearly familiar.",
        },
        {
          term: "Shortcut",
          meaning:
            "A predictive pattern in the collected dataset that is easier than the intended task and unreliable under deployment changes.",
          physicalExample:
            "The model uses table color to infer block class because collection never varied that background.",
        },
        {
          term: "Augmentation",
          meaning:
            "A label-consistent, physically defensible training transformation that expands observed variation without pretending to be new independent evidence.",
          physicalExample:
            "A small brightness change may model lighting variation, while a mirror flip must also transform pose targets and respect robot asymmetry.",
        },
        {
          term: "Baseline",
          meaning:
            "A simple reproducible method that a more complex model must beat under the same data and metric contract.",
          physicalExample:
            "Always predicting the training-set mean cup position provides a zero-learning regression baseline.",
        },
      ],
      physicalExamples: [
        {
          title: "Colored-mat shortcut",
          scenario:
            "Place red paper blocks only on a blue sheet and green blocks only on a grey sheet, then cover each block while asking a partner to guess its color.",
          lookFor:
            "The partner can answer from the background alone; swapping mats breaks the shortcut without changing the actual block identity.",
        },
        {
          title: "Nearly identical exam photos",
          scenario:
            "Take a short burst of a stationary toy, put alternating photos into practice and exam piles, then compare them with an exam pile from a new room.",
          lookFor:
            "Alternating burst frames make the first exam almost a copy of practice, while room-level grouping tests a meaningful scene change.",
        },
      ],
      workedExample: {
        title: "Reject a complex model that loses to its baseline",
        setup:
          "On one frozen episode-grouped split, a neural model has training MSE 0.05 and validation MSE 0.30. A mean-target baseline, fitted only on training targets, has validation MSE 0.28.",
        steps: [
          "Confirm all three MSE values use the same target scaling, examples, aggregation, and squared unit; otherwise subtraction would compare different quantities.",
          "Calculate the neural model’s generalization gap: `0.30 - 0.05 = 0.25`.",
          "Compare held-out methods: the neural model’s 0.30 is `0.30 - 0.28 = 0.02` worse than the baseline.",
          "Do not call the 0.05 training score a win; it only shows that optimization fit the training examples more closely.",
          "Inspect scene slices and changed predictions for a shortcut, near-duplicate leakage, target error, or condition absent from training.",
          "Keep the baseline as the current choice under this metric, repair the highest-evidence data defect, freeze a new version, and rerun without changing the old result.",
        ],
        result:
          "The model overfits by a 0.25 train-to-validation gap and fails to beat the baseline by 0.02 validation MSE, so the evidence does not justify its complexity.",
        takeaway:
          "Held-out comparison against a simple baseline outranks impressive training fit, and a leaked result must be replaced rather than cosmetically adjusted.",
      },
      handsOn: {
        setup:
          "Use generated shapes or non-sensitive saved examples. Construct one deliberate background shortcut and perform only offline model or paper analysis.",
        steps: [
          "Create grouped train and validation examples in which a target shape and background color are correlated, then record the intended feature and the shortcut feature.",
          "Fit a simple baseline and tiny model on the same frozen train groups; log training and validation metrics for every checkpoint rather than only the best run.",
          "Evaluate the selected checkpoint on the original validation set, a background-swapped slice, and a target-occluded slice; retain all predictions and example IDs.",
          "Add one physically valid training augmentation with matching target transformation where required, and assert validation examples remain deterministic and unchanged.",
          "Deliberately introduce adjacent-frame or group leakage, measure the optimistic change, then repair the split and mark the contaminated number invalid.",
          "Save curves, baseline table, condition slices, contact sheet, split and transform versions, chosen checkpoint rule, worst cases, and the next data-collection hypothesis.",
        ],
        observe:
          "The shortcut-trained model degrades when backgrounds swap or targets are hidden, leaked validation looks falsely easier, and a baseline can outperform a model with excellent training fit.",
        doneWhen:
          "A reviewer can identify the shortcut from examples and slices, prove group isolation, reproduce the 0.25 gap, and see a decision based on held-out evidence rather than training loss.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION],
        workExample:
          "Investigate a robot perception or policy regression by auditing group leakage, preprocessing lineage, shortcut slices, baseline performance, augmentation validity, and individual worst cases before approving retraining.",
        interviewPrompt:
          "A model reports 99 percent validation success after random frame splitting but fails when the table color changes. Diagnose leakage and shortcut learning, then define a credible reevaluation.",
      },
      commonMistakes: [
        {
          mistake: "Treating a large generalization gap as proof of one specific cause.",
          correction:
            "Use the gap as a symptom, then inspect duplicates, groups, labels, conditions, learning curves, capacity, and individual errors before naming the cause.",
        },
        {
          mistake: "Applying more augmentation after discovering train-validation leakage.",
          correction:
            "Invalidate the contaminated evaluation, repair the group and preprocessing boundary first, then justify augmentation independently.",
        },
        {
          mistake: "Reporting that a neural model learned because its training loss beats a baseline.",
          correction:
            "Compare both methods on identical untouched examples, physical metrics, condition slices, worst cases, latency, and rejection behavior.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a 0.25 train-validation MSE gap tell you?",
          answer:
            "It shows worse held-out fit under comparable metrics, but further evidence is required to distinguish capacity, leakage, noise, duplicates, or distribution mismatch.",
        },
        {
          question: "Can augmentation make a leaked validation score valid?",
          answer:
            "No; the contaminated split and every decision based on it must be repaired and reevaluated before augmentation effects are interpreted.",
        },
        {
          question: "Why keep a mean or linear baseline?",
          answer:
            "It reveals whether learned complexity improves untouched performance enough to justify its data, compute, latency, and failure cost.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "Side-by-side clean, leaked, background-swapped, and target-occluded paths materially expose shortcut learning and the difference between training fit and valid evaluation.",
      },
    },
    {
      dayId: 90,
      mentalModel:
        "An experiment is a sealed evidence box: its code, data, settings, random choices, environment, and every result must travel together before anyone compares boxes.",
      explanation: [
        "A useful experiment record answers exactly what ran. Capture the code revision or source archive, environment and PyTorch versions, processor device, data version and hashes, split manifest, preprocessing, model architecture, initialization, optimizer and schedule, batch size, epoch or stopping rule, random-state controls, and command. Record metrics, per-example predictions, checkpoints, curves, timing method, warnings, and failures under one run ID. A notebook with cells executed out of order is not lineage unless the final artifact can be recreated from a clean process.",
        "A random seed selects one repeatable sequence for a random-number generator; it does not remove randomness from the world or prove robustness. PyTorch, Python, NumPy, DataLoader workers, augmentation, parameter initialization, sampling, and device libraries may have separate random sources. Some operations can be nondeterministic, and PyTorch does not guarantee identical results across releases, platforms, or CPU and GPU even with identical seeds. Deterministic-algorithm settings can expose unsupported operations and may reduce performance, so record both the controls and the tradeoff.",
        "One seed is one draw from possible initialization and data-order outcomes. Run several predeclared seeds under the same data and configuration, retain every result, and summarize their centre and spread. Do not report only the best validation number or quietly rerun until the result looks good. Three runs are enough to reveal obvious instability in this small lab but not enough for a universal statistical claim. If variation is large, inspect data order, learning rate, stopping, small slices, and numerical behavior before adding a grand conclusion.",
        "Reproducibility has levels. Exact replay asks for bitwise identity under a tightly controlled environment; numerical replay accepts a declared tolerance; conclusion replication asks whether an independent rerun supports the same engineering decision. For a robot model, also reproduce data schema and physical metric calculation, not just loss. A deterministic pipeline can reproduce the same wrong target, leaked split, or unsafe integration every time. Reproducibility makes defects inspectable; it never substitutes for correctness, representativeness, latency, or physical validation.",
      ],
      keyTerms: [
        {
          term: "Run manifest",
          meaning:
            "A machine- and human-readable record connecting one run ID to code, environment, data, split, configuration, command, and outputs.",
          physicalExample:
            "Run `seed-17` points to one source revision, dataset hash, YAML configuration, CPU model, checkpoint, prediction table, and log.",
        },
        {
          term: "Random seed",
          meaning:
            "An initial value that selects a pseudorandom sequence for one controlled generator.",
          physicalExample:
            "Seed 17 fixes one parameter initialization and shuffle sequence only after each relevant generator and worker path is configured.",
        },
        {
          term: "Deterministic algorithm",
          meaning:
            "An implementation configured to return the same output for the same input and environment rather than selecting a nondeterministic path.",
          physicalExample:
            "A debugging run requests deterministic PyTorch operations and fails loudly when the chosen device operation lacks an allowed deterministic implementation.",
        },
        {
          term: "Environment",
          meaning:
            "The software and hardware context that can influence execution, including library versions, operating system, device, and numerical backend.",
          physicalExample:
            "The same checkpoint is timed separately on a laptop CPU and an edge GPU because device behavior and latency are not interchangeable.",
        },
        {
          term: "Seed variation",
          meaning:
            "The change in results across predeclared random seeds while data, code, and all other configuration remain fixed.",
          physicalExample:
            "Three validation MSE values of 2.4, 2.5, and 2.9 show a 0.5 range that a best-only report would hide.",
        },
        {
          term: "Numerical tolerance",
          meaning:
            "A declared acceptable difference used when floating-point or platform behavior need not be bitwise identical.",
          physicalExample:
            "A replay passes when every saved prediction differs by at most the predeclared absolute and relative tolerances, not whenever a rounded average looks similar.",
        },
      ],
      physicalExamples: [
        {
          title: "Sealed recipe kits",
          scenario:
            "Prepare three envelopes containing the same recipe and ingredients but a different numbered card for one shuffle choice, then retain every finished measurement.",
          lookFor:
            "Only the seed card changes; replacing flour, temperature, or instructions would be a different experiment rather than seed variation.",
        },
        {
          title: "Calibrated ruler handoff",
          scenario:
            "Ask two people to measure the same cardboard link using the same marked ruler, unit, zero point, and rounding rule, then compare raw readings.",
          lookFor:
            "A shared method enables a meaningful tolerance comparison, while matching rounded summaries could hide different raw measurements.",
        },
      ],
      workedExample: {
        title: "Report all seed results instead of the winner",
        setup:
          "Three predeclared runs differ only by seed and produce validation MSE values `[2.4, 2.5, 2.9]`. Compute a simple mean and range while keeping individual values.",
        steps: [
          "Verify the run manifests have identical code, data and split hashes, preprocessing, architecture, optimizer, schedule, epoch rule, device, and metric implementation.",
          "Add all results: `2.4 + 2.5 + 2.9 = 7.8`.",
          "Divide by three runs: mean MSE `7.8 / 3 = 2.6`.",
          "Find the observed extremes: minimum 2.4 and maximum 2.9.",
          "Calculate the range: `2.9 - 2.4 = 0.5`, retaining the seed-to-result mapping rather than only those summaries.",
          "Report mean 2.6, range 0.5, all three values, run count, metric unit, and the limitation that three runs do not characterize every possible seed or environment.",
        ],
        result:
          "The honest summary is mean MSE 2.6 with observed range 0.5 across three specified seeds; reporting only 2.4 would hide both typical performance and instability.",
        takeaway:
          "Freeze everything except the variable under study, keep every run, and state what the small sample can and cannot support.",
      },
      handsOn: {
        setup:
          "Use the Week 13 CPU experiment with frozen data and split manifests. Do not add hardware, network services, or private tracking credentials.",
        steps: [
          "Define a run-manifest schema covering run ID, command, source revision, environment, device, data and split hashes, preprocessing, model, optimizer, schedule, seed controls, and output paths.",
          "Configure PyTorch, Python, NumPy if used, and DataLoader worker seeding; request deterministic behavior for the debugging replay and record any performance or unsupported-operation result.",
          "Run three predeclared seeds with every non-seed field frozen, retaining failed runs, warnings, metrics, predictions, checkpoints, curves, and timing.",
          "Compute mean, range, and individual seed results for the primary held-out metric; compare worst-case examples and condition slices instead of summarizing only averages.",
          "Replay one seed from a clean process and compare ordered example IDs, loss history, predictions, and checkpoint values under exact or declared tolerance rules.",
          "Change one factor deliberately—such as learning rate—under a new experiment name, prove that only that field changed, and write whether the decision survives seed and replay evidence.",
        ],
        observe:
          "A complete manifest distinguishes replay from a vaguely similar rerun, seed results vary even under one configuration, and deterministic replay improves diagnosis without proving model validity.",
        doneWhen:
          "Another person can launch one clean replay from the manifest, recover the same ordered inputs and tolerated outputs, recalculate mean 2.6 and range 0.5, and identify every changed factor.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION],
        workExample:
          "Design experiment lineage for robot-learning releases so every metric maps to immutable code, data, split, environment, configuration and artifact identities, with seed variation and clean-process replay evidence.",
        interviewPrompt:
          "Two engineers use the same seed but get different policy metrics. Walk through random sources, environment and data-order checks, deterministic controls, tolerances, and the evidence needed to compare conclusions.",
      },
      commonMistakes: [
        {
          mistake: "Reporting the best seed as the model’s expected performance.",
          correction:
            "Predeclare seeds, retain every run including failures, and report individual values plus an appropriate centre, spread, count, and limitation.",
        },
        {
          mistake: "Assuming `manual_seed` guarantees identical results everywhere.",
          correction:
            "Control each relevant generator and DataLoader path, record device and versions, inspect nondeterministic operations, and state cross-platform limits.",
        },
        {
          mistake: "Calling a deterministic replay evidence that the experiment is correct.",
          correction:
            "Use replay to expose and reproduce behavior, then independently audit data, split, metric, model, latency, failures, and robot boundary.",
        },
      ],
      checkQuestions: [
        {
          question: "What must remain fixed when measuring seed variation?",
          answer:
            "Code, environment, data and split, preprocessing, architecture, optimizer, schedule, stopping rule, device, and metric must stay fixed while only the declared seed changes.",
        },
        {
          question: "Why is the best value 2.4 an incomplete report?",
          answer:
            "The other predeclared runs were 2.5 and 2.9, so best-only reporting hides the mean, observed variation, and likelihood of a less favorable run.",
        },
        {
          question: "What is the difference between reproducibility and correctness?",
          answer:
            "Reproducibility makes a behavior repeatable and inspectable; correctness requires separate evidence that data, calculations, decisions, and physical boundaries are valid.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The manifest diff, seed-result table, and clean-replay comparison already expose experiment lineage and variation more precisely than a decorative flow graphic.",
      },
    },
    {
      dayId: 91,
      mentalModel:
        "A model card is the machine’s inspection label and operating manual: it says what was tested, where it works, where it fails, and when not to use it.",
      explanation: [
        "A model card is a release document tied to one immutable model and evaluation package. Start with identity: model and checkpoint hash, architecture, framework version, preprocessing, input and output schemas, training-data and split versions, owner, date, and change history. State intended task, users, environment, and downstream interface. Then state excluded uses. A cup-position model trained on recorded tabletop images is not automatically a collision sensor, grasp-success detector, mobile navigation component, or permission to command a manipulator.",
        "Report evaluation conditions and denominators before metrics. For a regression model, include error in physical units, MSE or another optimization-aligned measure, median and tail error, rejection and invalid-output counts, and per-condition slices such as lighting, object material, pose, camera, and occlusion. Keep the worst examples and individual prediction table. Average error can hide a few large misses, and a small offline error cannot prove closed-loop task success. Compare with the frozen baseline under exactly the same examples.",
        "Latency is part of the model contract only when the timing boundary and device are explicit. Warm up the model, synchronize the accelerator when required, and measure enough individual calls using the real batch size and preprocessing boundary. State whether the number covers model forward only or sensor-to-consumer time. Report a percentile and maximum with the sample count rather than only an average. A forward p95 of 85 milliseconds meets a 100-millisecond model budget, but preprocessing, queueing, transfer, ROS transport, stale data, and downstream validation can still miss the complete deadline.",
        "Known limitations become runtime and operational requirements. Define accepted shapes, dtypes, ranges, frames, freshness, finite checks, supported conditions, quality or out-of-distribution rejection, and safe fallback. Show bad cases where the model confidently fails. A card is not a safety certificate and should not turn an offline model into an autonomous actuator. Release means a reviewer can rerun metrics from frozen predictions, reproduce latency on the named device class, load the checkpoint in evaluation mode, and reach the same narrow go, revise, or block decision.",
      ],
      keyTerms: [
        {
          term: "Model card",
          meaning:
            "A versioned report connecting one released model to its intended context, data, evaluation, performance, limitations, and excluded uses.",
          physicalExample:
            "A cup-localization checkpoint ships with supported camera input, centimetre-error slices, CPU latency, reflective-cup failures, and no-motion boundary.",
        },
        {
          term: "Intended use",
          meaning:
            "The specific task, user, input conditions, output consumer, and environment for which evidence was collected.",
          physicalExample:
            "Offline ranking of tabletop cup candidates from one named camera setup is narrower than general object localization.",
        },
        {
          term: "Condition slice",
          meaning:
            "A named subset evaluated separately because performance may differ under that physical or data condition.",
          physicalExample:
            "Matte cups, shiny cups, partial occlusion, dim light, and unseen tables each receive their own error and denominator.",
        },
        {
          term: "p95 latency",
          meaning:
            "A measured time threshold at or below which approximately 95 percent of observed calls completed under the stated percentile convention.",
          physicalExample:
            "Using nearest rank on 20 sorted forward times, the nineteenth value is reported as p95 while the twentieth remains visible as maximum.",
        },
        {
          term: "Rejection behavior",
          meaning:
            "The structured response used when an input or prediction violates validity, support, freshness, or quality requirements.",
          physicalExample:
            "A non-finite coordinate, stale frame, wrong image shape, or unsupported camera ID returns no target plus a specific reason.",
        },
        {
          term: "Evidence boundary",
          meaning:
            "The strongest claim directly supported by the named tests, separated from behavior that remains untested.",
          physicalExample:
            "Recorded CPU inference is verified; live timing, grasp success, collision avoidance, stopping, and site safety remain unverified.",
        },
      ],
      physicalExamples: [
        {
          title: "Appliance rating plate and manual",
          scenario:
            "Read a household appliance label for voltage, capacity, model identity, and warnings, then compare it with the longer operating instructions and test certificate.",
          lookFor:
            "A useful release needs identity, supported conditions, limits, and evidence; one attractive performance number cannot replace the full operating context.",
        },
        {
          title: "Lap time versus complete journey",
          scenario:
            "Time only a toy car’s straight section, then time setup, start delay, turns, obstacles, stop, and result confirmation for the whole course.",
          lookFor:
            "Fast model-forward timing resembles the straight section and cannot be presented as sensor-to-action latency for the complete system.",
        },
      ],
      workedExample: {
        title: "Build a narrow verdict from error and latency evidence",
        setup:
          "A two-output model predicts `[2, 4]` for a target `[3, 2]`. Twenty warmed CPU forward calls are sorted; under nearest-rank p95, the nineteenth is 85 ms and the twentieth is 140 ms. The model-forward budget is 100 ms.",
        steps: [
          "Calculate residuals in output units: `2 - 3 = -1` and `4 - 2 = 2`.",
          "Square and average them: `MSE = ((-1)² + 2²) / 2 = (1 + 4) / 2 = 2.5`.",
          "Declare the latency convention: nearest-rank index is `ceil(0.95 × 20) = 19`, so p95 is the nineteenth sorted value, 85 ms.",
          "Compare p95 with the forward budget: `85 ms ≤ 100 ms`, while retaining the 140 ms maximum and all 20 raw timings.",
          "State limits separately: one error pair cannot characterize accuracy, and forward-only timing excludes preprocessing, transfer, messaging, validation, and control.",
          "Write the verdict as conditional evidence: model-forward p95 meets this CPU budget, but release remains blocked until frozen condition slices, worst errors, invalid-output tests, and complete card fields pass.",
        ],
        result:
          "The example MSE is 2.5 and observed forward p95 is 85 ms against a 100 ms budget, with a 140 ms maximum; those numbers support only the named calculations and timing boundary.",
        takeaway:
          "A model card turns metrics into a scoped decision by pairing every number with identity, conditions, denominators, timing boundary, failures, and excluded claims.",
      },
      handsOn: {
        setup:
          "Package the Week 13 CPU experiment and saved predictions into a model card. Keep the checkpoint offline and disconnected from all robot actuation.",
        steps: [
          "Freeze the selected checkpoint, architecture, framework and environment, preprocessing, schemas, data and split manifests, command, source identity, and artifact hashes.",
          "Write intended task, user, supported input conditions, output meaning, downstream validation expectation, excluded uses, and the exact offline evidence boundary.",
          "Recalculate the primary metric from saved predictions, compare the baseline, report denominators, physical-unit errors, tail and worst cases, invalid outputs, and named condition slices.",
          "Measure warmed evaluation-mode no-gradient latency on the named device and batch size; retain every call, percentile convention, p50, p95, maximum, sample count, and timing boundary.",
          "Test wrong shapes, dtypes, ranges, camera or schema IDs, stale timestamps, and non-finite values; record the no-output rejection reason for each unsupported input.",
          "Have a reviewer load and rerun the package from a clean process, then record `PASS`, `NEEDS REVISION`, or `BLOCKED` plus each satisfied and failed gate without expanding the claim.",
        ],
        observe:
          "The card makes accuracy, latency, provenance, and failure claims independently auditable and keeps a fast or accurate offline model from being mistaken for a validated robot behavior.",
        doneWhen:
          "A reviewer reproduces MSE and latency summaries from raw rows, follows every artifact identity, triggers each invalid-input rejection, and states the same narrow release verdict.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_HMI],
        workExample:
          "Release a robot-learning component with a reviewable model card and operator-facing evidence: immutable lineage, physical-unit slices, bad-case media, device latency, structured rejections, intended use, and explicit unsafe boundaries.",
        interviewPrompt:
          "Present a model that has low average error and p95 forward latency below budget. Explain what belongs in its model card, which tail and condition failures can block release, and why this is not robot safety proof.",
      },
      commonMistakes: [
        {
          mistake: "Writing a model card that lists only architecture and one average metric.",
          correction:
            "Tie immutable identity to data and evaluation conditions, denominators, slices, tails, worst cases, latency boundary, limitations, rejections, and excluded uses.",
        },
        {
          mistake: "Calling model-forward p95 the robot’s end-to-end response time.",
          correction:
            "Name the measured boundary and separately measure preprocessing, transfers, queues, middleware, validation, control, and observed result before making a full-system timing claim.",
        },
        {
          mistake: "Treating a signed or low average error as evidence that no dangerous miss exists.",
          correction:
            "Report absolute or task-appropriate physical errors, tail metrics, maximum and bad cases, condition slices, invalid outputs, and every hard-gate violation.",
        },
        {
          mistake: "Presenting a complete card as permission to operate powered hardware.",
          correction:
            "Keep offline model evidence separate from integration, closed-loop, collision, stopping, supervision, commissioning, and safety acceptance.",
        },
      ],
      checkQuestions: [
        {
          question: "Why must a latency number name both its device and timing boundary?",
          answer:
            "Different hardware and included stages change timing; forward-only CPU p95 cannot stand in for preprocessing-to-action latency on another robot computer.",
        },
        {
          question: "What does an intended-use statement need beyond the task name?",
          answer:
            "It needs intended user, input and environmental conditions, output meaning, downstream consumer, supported limits, and uses explicitly excluded by the evidence.",
        },
        {
          question: "What is the honest completion claim for this week?",
          answer:
            "A reproducible offline PyTorch experiment and model-card evaluation passed or exposed named gates; live robot behavior, closed-loop success, and safety remain unverified.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The final card, per-condition metric table, raw latency distribution, rejection matrix, and worst-case gallery are the actual release evidence and avoid a fourth chapter visual.",
      },
    },
  ],
} satisfies ChapterContent;
