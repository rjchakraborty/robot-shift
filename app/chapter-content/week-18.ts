import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week18Content = {
  week: 18,
  title: "Trace vision and language into bounded robot action",
  purpose:
    "Build an engineering-grade mental model of embodied AI without treating a foundation model as magic or a research project. This chapter distinguishes visual-language understanding, action-producing policies, and embodied reasoning; traces images, words, robot state, and time through a multimodal action pipeline; preserves physical meaning when data comes from different robot bodies; compares discrete, continuous, diffusion, and flow action representations; grounds instructions in perceived entities; measures held-out generalization; and finishes with a value-by-value architecture review whose outputs remain behind robot-specific validation and control.",
  prerequisites: [
    "Complete the applied PyTorch, robot-dataset, behavior-cloning, policy-evaluation, ROS 2 action, frame, timing, and validation work from Weeks 5–17; this chapter builds on those contracts rather than replacing them.",
    "Bring one disconnected simulator, recorded episode, or small synthetic table containing an image reference, natural-language task, timestamped robot state, and bounded action; powered hardware is neither required nor permitted for the exercises.",
    "Read tensor shapes, calculate a normalized scalar, distinguish a camera frame from a robot coordinate frame, and explain why model inference is not physical task completion.",
    "Keep collision avoidance, workspace and velocity limits, watchdogs, emergency stopping, and low-level control outside the learned-model exercises; the chapter teaches system integration and evaluation, not a safety-rated controller.",
  ],
  outcomes: [
    "Classify a component as a VLM, VLA, embodied reasoner, or surrounding deterministic system from its actual inputs, outputs, state, and authority rather than its product label.",
    "Trace camera pixels, language tokens, proprioceptive state, timestamps, multimodal features, action chunks, normalization, decoding, validation, and controller feedback with exact shapes, units, frames, and owners.",
    "Prepare a cross-embodiment data contract that retains embodiment identity, observation and action semantics, task labels, mixture weights, masks, adapters, and comparable but not falsely equivalent normalization.",
    "Compare discrete tokens, direct continuous values, diffusion-generated sequences, and flow-generated sequences by resolution, multimodality, sampling cost, action horizon, re-observation cadence, and physical decoding requirements.",
    "Ground referring expressions and relations to perceived entity IDs and admissible robot skills, then clarify or reject instructions whose referent, goal, or preconditions are unresolved.",
    "Freeze held-out object, scene, prompt, pose, and embodiment slices before evaluation; report success, intervention, unsafe proposals, latency, and the worst slice separately from an aggregate.",
    "Review one language-conditioned policy path end to end, including nominal values and stale-input, ambiguous-language, malformed-output, out-of-range, late-command, controller-rejection, and execution-deviation branches.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
  ],
  sources: [
    {
      label: "Google DeepMind — Gemini Robotics and Gemini Robotics-ER",
      url: "https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/",
      useFor:
        "Primary distinction between an action-output VLA and an embodied-reasoning VLM, evidence categories for generality and interactivity, multiple embodiments, and the explicit boundary to embodiment-specific low-level safety controllers.",
    },
    {
      label: "OpenVLA — Open-Source Vision-Language-Action Model",
      url: "https://openvla.github.io/",
      useFor:
        "Primary project description of fused visual encoders, projection into a language-model token space, tokenized actions, continuous action decoding, Open X-Embodiment pretraining, and held-out visual, motion, physical, and semantic evaluations.",
    },
    {
      label: "Hugging Face LeRobot — Action Representations",
      url: "https://huggingface.co/docs/lerobot/action_representations",
      useFor:
        "Maintainer documentation for joint versus end-effector space, absolute versus relative actions, the required relative-normalize and unnormalize-absolute processor order, and action-chunk execution implications.",
    },
    {
      label: "Open X-Embodiment — Robotic Learning Datasets and RT-X Models",
      url: "https://robotic-transformer-x.github.io/",
      useFor:
        "Primary project evidence for standardized heterogeneous robot data, embodiment-aware action alignment, data mixtures, cross-robot transfer, task strings, gripper-frame action semantics, and multi-site evaluation.",
    },
    {
      label: "Diffusion Policy — Visuomotor Policy Learning via Action Diffusion",
      url: "https://diffusion-policy.cs.columbia.edu/",
      useFor:
        "Peer-reviewed project source for conditional denoising of multimodal action sequences, visual conditioning, receding-horizon execution, temporal consistency, latency testing, and the difference between generating a trajectory and validating it.",
    },
  ],
  days: [
    {
      dayId: 120,
      mentalModel:
        "Three workers may share the same camera, but one describes the scene, one proposes body-specific motion, and one organizes monitored skills.",
      explanation: [
        "Classify a model by its observable contract, not by how impressive its name sounds. A vision-language model consumes visual and language inputs and produces semantic outputs such as text, object references, coordinates, detections, or scores. A vision-language-action model additionally produces an action representation intended for a robot: joint targets, end-effector deltas, gripper state, mobile velocity, or a short action sequence. The word `action` is load-bearing. A textual sentence saying “move left” remains language until a documented decoder turns it into a typed, timed, body-specific command.",
        "An embodied-reasoning model usually operates at a different boundary. It can inspect images or structured state, decompose a goal, select tools or robot skills, check progress, and revise a plan. Its output may be a skill call such as `pick(object_id=17)` rather than direct motor values. Google DeepMind presents Gemini Robotics as a VLA with action output and Gemini Robotics-ER as an embodied-reasoning VLM that can connect to existing controllers. Other systems may arrange these capabilities differently, so inspect the actual interface instead of assuming every product uses the same architecture.",
        "These categories are capabilities, not safety certifications or mutually exclusive boxes. One deployed system may use a VLM to identify a valve, a reasoner to choose an inspection sequence, a VLA to propose a manipulation chunk, and deterministic ROS 2 components to validate and execute it. The component with broader reasoning is not automatically entitled to greater command authority. Authority should follow the reviewed system boundary: which outputs are allowed, when they expire, which validator checks them, which controller owns execution, and what feedback proves or disproves the predicted effect.",
        "The most practical distinction is the handoff after inference. Text, plans, detections, and action arrays all need schemas and evidence, but action outputs carry immediate physical semantics: dimension order, unit, coordinate frame, control mode, valid range, timestamp, horizon, and embodiment. A VLA response that parses successfully can still refer to the wrong robot, stale image, wrong gripper frame, or unsupported motion mode. Treat it as a proposal until robot-specific decoding and validation accept it; treat acceptance as separate from measured physical completion.",
      ],
      keyTerms: [
        {
          term: "Vision-language model (VLM)",
          meaning:
            "A model that relates visual inputs and language, producing semantic outputs such as text, labels, detections, coordinates, or structured reasoning rather than a robot action by definition.",
          physicalExample:
            "An inspection camera and question produce `needle approximately 62 psi`; a separate calibrated program decides whether any robot should move.",
        },
        {
          term: "Vision-language-action model (VLA)",
          meaning:
            "A policy whose conditioning includes vision and language and whose declared output contains a robot action representation.",
          physicalExample:
            "A wrist image plus `place the red block in the tray` produces four future end-effector deltas and gripper commands for one arm.",
        },
        {
          term: "Embodied reasoning",
          meaning:
            "Reasoning about physical entities, relations, state, goals, tools, and outcomes, often used to compose or monitor bounded skills rather than directly close a motor loop.",
          physicalExample:
            "A planner sees that the tray is blocked, calls `move_obstacle`, re-observes, and only then calls a validated `place` skill.",
        },
        {
          term: "Policy",
          meaning:
            "A rule or learned function that maps the current information state to an action or distribution over actions.",
          physicalExample:
            "Given a camera crop, joint state, and task text, a policy chooses the next gripper-frame motion chunk.",
        },
        {
          term: "Action contract",
          meaning:
            "The complete meaning required to decode an action, including dimensions, units, frame, control mode, rate, horizon, limits, time, and target embodiment.",
          physicalExample:
            "The vector `[0.02, 0, 0, 1]` means nothing physical until it is declared as metres of gripper-frame displacement plus an open-gripper flag for robot R3.",
        },
      ],
      physicalExamples: [
        {
          title: "Gauge inspection versus valve adjustment",
          scenario:
            "A camera faces a pressure gauge and a nearby valve. One component reports the reading, while another subsystem may be authorized to turn the valve through a bounded skill.",
          lookFor:
            "The gauge-reading output belongs to a VLM-style perception contract; a typed turn command belongs to an action or skill contract and still passes calibration, workspace, force, and authority checks.",
        },
        {
          title: "Table-clearing request",
          scenario:
            "A person asks, `clear the table`, which requires identifying movable objects, choosing an order, and repeatedly executing pick-and-place behavior.",
          lookFor:
            "The high-level goal is decomposed and monitored by embodied reasoning, while each object reference and each body-specific action is grounded, validated, executed, and verified separately.",
        },
      ],
      workedExample: {
        title: "Classify six black-box components from their interfaces",
        setup:
          "A simulated workcell exposes six unnamed components: image question answering, object detection, task decomposition, skill selection, action-chunk prediction, and a ROS 2 trajectory controller.",
        steps: [
          "Write each component's inputs and outputs without using its marketing label: for example, `image + question → text`, `image → object IDs and boxes`, or `image + instruction + joint state → H×D action values`.",
          "Mark image question answering and object detection as VLM or vision-language capabilities only when language participates; neither becomes a VLA because neither output is a robot action.",
          "Mark task decomposition and skill selection as embodied-reasoning functions when they inspect physical state and produce an ordered plan or typed tool call with observable preconditions.",
          "Mark the action-chunk predictor as a VLA only after confirming the output dimensions, horizon, units or normalization, target body, and processor that converts it to physical commands.",
          "Keep the ROS 2 trajectory controller outside the model categories: it consumes accepted trajectory commands, closes a control loop, reports feedback, and enforces its own declared constraints.",
          "Draw the authorized handoffs and add `reject`, `clarify`, `timeout`, `cancel`, and `measured result` paths; remove any direct arrow from free text or an unchecked model array to an actuator.",
        ],
        result:
          "The diagram distinguishes semantic understanding, physical reasoning, learned action proposal, and deterministic execution from evidence in the interfaces rather than from model names.",
        takeaway:
          "Ask what enters, what leaves, and who may act on it; the output contract reveals more than the label VLM, VLA, agent, or controller.",
      },
      handsOn: {
        setup:
          "Use paper cards or a small JSON file and the existing simulator. Create no network account, download no foundation-model weights, and send no model output to powered hardware.",
        steps: [
          "Create nine input/output cards covering a scene description, object box, pose estimate, natural-language plan, typed skill call, normalized action, physical command, controller feedback, and task result.",
          "For every card, record producer, consumer, schema, timestamp requirement, and whether it describes, proposes, authorizes, executes, or measures physical behavior.",
          "Sort the cards into VLM capability, embodied reasoning, VLA policy, deterministic validator/controller, and independent evidence; explain any card that legitimately crosses two capability categories.",
          "Choose one normalized action card and add dimension names, unit ranges, coordinate frame, horizon, robot ID, model version, and expiry so it becomes decodable but not yet accepted.",
          "Insert a deliberately stale image, unresolved object reference, and wrong robot ID; write the exact component that rejects or clarifies each case.",
          "Run the accepted path only in simulation, then capture the requested action, validator decision, controller acknowledgment, measured state, and terminal task outcome as separate records.",
        ],
        observe:
          "Category disagreements usually expose an unstated output or authority boundary, while apparently clear action arrays become ambiguous as soon as units, body, frame, or time is removed.",
        doneWhen:
          "Every card has one reviewable contract, no unchecked semantic output reaches the controller, all three injected faults stop at a named boundary, and simulated completion is supported by measured feedback rather than inference success.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_INTEGRATION,
          ROLE_VALIDATION,
          ROLE_HMI,
        ],
        workExample:
          "Turn a vendor's multimodal demo into an integration map that separates perception, reasoning, policy, validation, ROS 2 execution, operator authority, and physical evidence before deciding where the component can enter a production robot stack.",
        interviewPrompt:
          "A model accepts an image and instruction, emits a textual plan and a seven-number vector, and calls itself an embodied agent. Classify each capability, identify missing action-contract fields, and design the safe handoff into existing ROS 2 skills.",
      },
      commonMistakes: [
        {
          mistake: "Calling any model that sees an image and mentions motion a VLA.",
          correction:
            "Inspect the formal output: descriptions and plans remain semantic outputs, while a VLA must expose a documented robot-action representation and decoding path.",
        },
        {
          mistake: "Treating embodied reasoning as a replacement for a low-level controller.",
          correction:
            "Use reasoning to select and monitor bounded capabilities; keep timing-critical feedback, limits, watchdogs, and protective behavior in reviewed embodiment-specific components.",
        },
        {
          mistake: "Accepting a valid action array as proof that the requested task occurred.",
          correction:
            "Separate model proposal, validator acceptance, controller acknowledgment, measured motion, task predicate, and terminal outcome in the evidence trail.",
        },
      ],
      checkQuestions: [
        {
          question: "What single output difference most directly separates a VLM capability from a VLA capability?",
          answer:
            "A VLA exposes a robot action representation, while a VLM by itself produces semantic outputs such as language, detections, coordinates, or reasoning.",
        },
        {
          question: "Why can an embodied reasoner choose a skill without being allowed to command motors directly?",
          answer:
            "Planning authority and motor-control authority are separate; the skill call still needs typed inputs, preconditions, validation, an execution owner, and measured feedback.",
        },
        {
          question: "Which evidence comes after a controller accepts a command?",
          answer:
            "Timestamped measured state and a checked task predicate must establish the physical effect and terminal outcome; acceptance alone proves neither.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "Interface cards and a short authority table teach the capability boundary clearly without adding a generic model-category diagram.",
      },
    },
    {
      dayId: 121,
      mentalModel:
        "A multimodal policy is a labelled assembly line: pixels and words become compatible features, then body metadata turns bounded numbers back into motion.",
      explanation: [
        "A camera tensor begins as sampled light, not as objects or metres. Preprocessing chooses camera views, crop, resize, channel order, dtype, and pixel normalization. A visual encoder divides an image into patches or regions and maps them to feature vectors. OpenVLA, for example, combines visual backbones that emit image patch embeddings, then projects those embeddings into the input space used by its language-model backbone. The exact encoder family can change; the stable engineering questions are input shape, preprocessing version, camera identity, capture time, feature shape, and whether the view still contains the evidence needed by the task.",
        "Language takes a parallel path. A tokenizer converts an instruction into token IDs, and an embedding layer maps those IDs into vectors. Token boundaries are not object boundaries: `red mug beside plate` may be split into several subword tokens, yet grounding still must resolve one perceived mug and one relation. Multimodal fusion or conditioning makes visual and language features available to the policy. Some architectures concatenate projected image and text tokens; others use cross-attention or separate action heads. Do not infer physical alignment merely because all feature vectors share width `D`.",
        "Robot state and time complete the observation contract. Joint positions, gripper state, base pose, previous actions, or several recent frames may be projected alongside image and language features. The policy must know which sample time each value represents. A wrist image captured 180 ms after the joint state can show a different physical configuration, and a language instruction issued for the prior scene can be stale even when both tensors have valid shapes. Batch, history, camera, token, horizon, and action dimensions need distinct names; a shape such as `[1, 4, 7]` is meaningless until those axes are declared.",
        "The action head produces tokens or continuous values, often for a future chunk. Postprocessing then reverses training conventions: crop padded dimensions, unnormalize with the matching training statistics, convert relative to absolute representation if required, transform to the declared physical frame, clamp only under a reviewed policy, and validate the complete proposed trajectory. OpenVLA predicts tokenized actions that decode to continuous values; LeRobot documents processor order such as relative-to-normalized during training and unnormalize-to-absolute during inference. A correct inverse transform is necessary, but semantic grounding, freshness, feasibility, and safe execution remain separate checks.",
      ],
      keyTerms: [
        {
          term: "Patch embedding",
          meaning:
            "A learned feature vector representing one image patch or visual region after the camera tensor passes through a visual encoder.",
          physicalExample:
            "A 224 by 224 wrist image may become a grid of visual feature vectors whose locations still need positional information to distinguish left from right.",
        },
        {
          term: "Language token",
          meaning:
            "An integer-coded text unit that is mapped to a vector; it may be a word, subword, punctuation mark, or special control symbol.",
          physicalExample:
            "The phrase `open gripper` can occupy several token positions even though it names one requested state change.",
        },
        {
          term: "Multimodal conditioning",
          meaning:
            "Making information from images, language, robot state, or history available to the action predictor in a compatible feature representation.",
          physicalExample:
            "The same red-block image conditions different action chunks when paired with `move left` versus `move right`.",
        },
        {
          term: "Proprioception",
          meaning:
            "Measurements of the robot's own configuration or motion, such as joint positions, velocities, effort, gripper state, or base pose.",
          physicalExample:
            "A wrist image cannot reveal every joint angle, so current joint state helps decode whether a proposed end-effector change is reachable.",
        },
        {
          term: "Action head",
          meaning:
            "The model component that converts fused context into an action token, value, distribution, or future action sequence.",
          physicalExample:
            "A policy head maps the current visual-language-state context to four future rows of `[dx, dy, dz, gripper]`.",
        },
        {
          term: "Processor pipeline",
          meaning:
            "The ordered pre- and postprocessing steps that convert physical observations and actions into model representation and back again.",
          physicalExample:
            "A relative gripper-frame displacement is normalized before training, then unnormalized and restored relative to the current pose before simulation execution.",
        },
      ],
      physicalExamples: [
        {
          title: "Red block moves between frames",
          scenario:
            "A table camera records a red block, the operator asks to move it left, and another person shifts the block while the policy is computing.",
          lookFor:
            "The image timestamp, instruction generation, inference latency, and action expiry reveal whether the decoded leftward motion still refers to the observed block location.",
        },
        {
          title: "Same image, different robot posture",
          scenario:
            "Two arm configurations produce a similar overhead view of the table, but one elbow is near a joint limit and the other has ample margin.",
          lookFor:
            "Proprioceptive state changes reachability and the valid decoder result even when camera pixels and language tokens are identical.",
        },
      ],
      workedExample: {
        title: "Trace one observation into a four-step physical action chunk",
        setup:
          "A synthetic arm sample contains one `224×224×3` RGB image, an eight-token instruction, a seven-value joint state, and a policy that emits four future rows of `[dx, dy, dz]` normalized to `[-1, 1]`.",
        steps: [
          "Record the camera contract as `[H=224, W=224, C=3]`, RGB byte input, camera `table_1`, capture time `12.000 s`, and calibration version `cam-v4`; resizing or channel reordering must be part of the preprocessing version.",
          "Assume the visual encoder returns 196 patch vectors of width 1,024, the tokenizer returns eight language positions projected to the same width, and the joint-state projector returns one state vector of width 1,024.",
          "Concatenate these example contexts into `196 + 8 + 1 = 205` positions, giving shape `[B=1, T=205, D=1024]`; this arithmetic checks the interface, not whether the red block was understood.",
          "Read the action head output as `[B=1, horizon=4, action_dim=3]` and reject any batch, horizon, or component ordering that differs from the registered policy metadata.",
          "Decode the first normalized x component `0.5` using calibrated range `[-0.08, 0.08] m`: `-0.08 + ((0.5 + 1) / 2) × 0.16 = 0.04 m`; repeat component-wise with its own units and ranges.",
          "Attach gripper frame, relative-position control mode, 10 Hz rate, robot ID, source timestamps, and expiry; test the resulting four poses against workspace, joint, collision, velocity, and discontinuity limits.",
          "Execute only through the simulator controller, compare measured pose with the first accepted target, and record whether the task predicate—not merely the model call—became true.",
        ],
        result:
          "A visually and linguistically conditioned tensor becomes a physically meaningful 0.04 m proposal only after shape checks, matching statistics, frame and control-mode decoding, freshness checks, trajectory validation, and measured simulation feedback.",
        takeaway:
          "Feature width makes modalities computable together; processor metadata and robot evidence make the eventual action physically interpretable.",
      },
      handsOn: {
        setup:
          "Use a local notebook or TypeScript/Python script with fabricated arrays and one saved image. No pretrained model, GPU, or robot connection is required.",
        steps: [
          "Create a manifest for one image, instruction, robot-state vector, and action chunk; name every axis, dtype, unit, frame, source clock, and allowed age.",
          "Implement placeholder encoder functions that return fixed arrays with declared visual, language, and state shapes; assert the expected context position count and common feature width.",
          "Create a four-by-three normalized action chunk, then implement a component-wise inverse transform whose stored ranges and statistics are selected by policy version and robot ID.",
          "Deliberately swap image channels, remove one state component, use another policy's normalization range, and advance the clock past expiry; make each error fail at a different named contract.",
          "Pass the decoded mock chunk through a simulator-only validator for finite values, dimension order, per-axis bounds, workspace, per-step change, and total horizon.",
          "Save the manifest, shape trace, decoded values, rejection messages, simulated controller feedback, and a statement that this synthetic exercise does not establish model accuracy or hardware safety.",
        ],
        observe:
          "Most integration failures occur around the model—at preprocessing, time alignment, normalization, frame decoding, or output validation—even when the placeholder forward pass produces the expected tensor shape.",
        doneWhen:
          "The nominal sample yields the hand-calculated 0.04 m component, all four corruptions fail explicitly, and a reviewer can follow each tensor and physical field from source through simulated feedback.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Integrate a multimodal policy by locking camera and tokenizer preprocessing, state history, tensor shapes, action statistics, decoder metadata, latency, and ROS 2 command semantics, then build contract tests around every boundary.",
        interviewPrompt:
          "Trace a camera image, instruction, and joint vector through a VLA that returns `[1, 16, 7]`. Explain every axis, timestamp and processor step, inverse-decode one value, and identify tests that prevent a correct-shaped but wrong-body command.",
      },
      commonMistakes: [
        {
          mistake: "Assuming equal feature width means an image patch and word token are physically aligned.",
          correction:
            "Feature dimensions only permit computation; grounding and evaluation must establish which visual entity and relation the language actually controls.",
        },
        {
          mistake: "Omitting robot state because the camera image appears to show the whole task.",
          correction:
            "Include the proprioceptive and temporal state required to distinguish configurations, reachability, prior motion, and stale observations that pixels alone cannot recover reliably.",
        },
        {
          mistake: "Sending normalized model values directly to a controller.",
          correction:
            "Use the matching policy and embodiment statistics, inverse representation processors, units, frames, control mode, expiry, and trajectory validator before any simulated command.",
        },
      ],
      checkQuestions: [
        {
          question: "What does context shape `[1, 205, 1024]` establish in the worked example?",
          answer:
            "It establishes one batch, 205 combined context positions, and feature width 1,024; it does not prove correct grounding, time alignment, or action quality.",
        },
        {
          question: "Why must relative conversion and normalization be reversed in the matching order?",
          answer:
            "The model learned statistics for a specific representation, so inference must first restore that representation's physical scale and then reconstruct the corresponding absolute command with the current state.",
        },
        {
          question: "Which fields make a decoded `0.04` actionable rather than merely numeric?",
          answer:
            "Its component name, metres unit, coordinate frame, relative or absolute mode, target robot, time and expiry, horizon, controller interface, and validated bounds.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A modality-and-shape flow from camera, words, and robot state through fusion, action head, decoding, validation, and feedback materially clarifies this multi-branch contract.",
      },
    },
    {
      dayId: 122,
      mentalModel:
        "Cross-embodiment learning is a multilingual workshop: tasks can be shared, but every robot keeps its own body dictionary and measurement grammar.",
      explanation: [
        "An embodiment is the robot's physical and sensing configuration: links, joints, gripper, cameras, mobile base, limits, control modes, and coordinate frames. Cross-embodiment pretraining combines experience from different bodies so a model can reuse visual, language, and task patterns. Open X-Embodiment standardized heterogeneous datasets and demonstrated transfer across multiple robot platforms; OpenVLA later pretrained on a large curated subset. That evidence motivates shared training, but it does not mean arbitrary robots can exchange raw numeric actions or that a new body works without an adapter and evaluation.",
        "A common storage schema is only the outer envelope. Two records can both contain `observation.state`, `action`, image, task text, and timestamp while assigning different meaning to every vector element. One arm may store absolute joint targets in radians; another may store gripper-frame deltas in metres and radians. Cameras can be fixed or wrist-mounted, actions can be targets or velocities, and grippers can be continuous or binary. Preserve embodiment ID, component names, units, frames, rate, representation, valid mask, and calibration version before normalizing or padding anything.",
        "Alignment separates what is legitimately shared from what stays body-specific. Language such as `place cup in tray`, object appearances, and high-level success predicates can cross bodies. An embodiment adapter maps that shared context to the observation and action dimensions supported by one robot. Canonical end-effector deltas can help when kinematics and control semantics are compatible, but canonicalization loses information if a body has no matching degree of freedom or uses different contact behavior. Mask unsupported components and keep the original record; never invent motion by copying a value into a convenient slot.",
        "Data mixtures create another interface. A million trajectories do not contribute equally when one robot, task, camera view, or success mode dominates. Declare source filters and sampling weights, count the observed mix after loading, and retain license and lineage per source. Compare a local-only baseline, a cross-embodiment pretrained baseline, and any adapted model on the same frozen target-robot suite. Positive transfer means the shared model improves a defined target under comparable data and evaluation; multi-robot training alone is not proof.",
      ],
      keyTerms: [
        {
          term: "Embodiment",
          meaning:
            "The robot-specific body, sensors, actuators, kinematics, limits, frames, and control interfaces through which observations and actions acquire physical meaning.",
          physicalExample:
            "A six-axis industrial arm with a parallel gripper and fixed camera is a different embodiment from a mobile manipulator with a wrist camera.",
        },
        {
          term: "Trajectory",
          meaning:
            "A time-ordered sequence of observations and actions, usually grouped into an episode with one task context and terminal outcome.",
          physicalExample:
            "Thirty seconds of images, joint states, gripper commands, and timestamps document one cup-placement attempt, including its failure or success.",
        },
        {
          term: "Cross-embodiment pretraining",
          meaning:
            "Training on data from multiple robot bodies to learn reusable representations or policy behavior before target-specific adaptation or evaluation.",
          physicalExample:
            "Visual patterns for identifying cups learned from several arms help initialize a policy for a new supported arm, while its action decoder remains body-specific.",
        },
        {
          term: "Embodiment adapter",
          meaning:
            "A component that maps one robot's observations and actions to and from the shared model representation while retaining body-specific semantics.",
          physicalExample:
            "An adapter orders seven joint readings, adds a validity mask, and decodes the shared output into the gripper-frame delta expected by one controller.",
        },
        {
          term: "Action canonicalization",
          meaning:
            "Converting compatible robot actions into a shared representation while documenting information lost, masked, or handled by an adapter.",
          physicalExample:
            "Two arms express tool motion as gripper-frame `[dx, dy, dz, droll, dpitch, dyaw, grip]` even though their joint-space commands differ.",
        },
        {
          term: "Mixture weight",
          meaning:
            "The intended sampling share assigned to one dataset, robot, task, or source during combined training.",
          physicalExample:
            "A small target-arm dataset is sampled for 40 percent of steps even though it contains only 10 percent of stored episodes, and the observed rate is checked.",
        },
      ],
      physicalExamples: [
        {
          title: "Short arm and long arm place the same cup",
          scenario:
            "A compact tabletop arm and a longer seven-joint arm both demonstrate `place the cup in the tray`, but their cameras, reachable workspaces, and controller commands differ.",
          lookFor:
            "Task language and success predicates can be shared, while calibration, state layout, action mapping, reachability, and safe limits stay attached to each embodiment.",
        },
        {
          title: "Binary and continuous grippers",
          scenario:
            "One dataset records gripper state as `0` or `1`; another records jaw width from `0.00 m` to `0.08 m` and measured grip force separately.",
          lookFor:
            "A normalized value of 0.5 cannot be copied between schemas; the adapter must preserve discrete mode, physical width, force meaning, and unsupported fields.",
        },
      ],
      workedExample: {
        title: "Align two robot records without pretending their actions are identical",
        setup:
          "Robot A stores relative gripper-frame x displacement in `[-0.04, 0.04] m`; Robot B stores an absolute first-joint target in `[-2.0, 2.0] rad`. Both rows carry the task `move cup left` and normalize scalars to `[-1, 1]`.",
        steps: [
          "Write the complete source schemas: Robot A's value names gripper-frame `dx`, relative position mode, metres, 10 Hz; Robot B's value names `joint_1_target`, absolute mode, radians, 20 Hz.",
          "Normalize Robot A's `0.02 m` as `2(0.02 - (-0.04)) / 0.08 - 1 = 0.5` and Robot B's `1.0 rad` as `2(1 - (-2)) / 4 - 1 = 0.5`.",
          "Reject the tempting conclusion that the two `0.5` values mean the same motion: one is a local Cartesian displacement and one is an absolute joint configuration.",
          "Keep shared task text and outcome labels in common fields, but place each action in a typed embodiment-specific structure with dimension names, representation, frame, units, and masks.",
          "If the target model requires gripper-frame deltas, convert Robot B only through verified kinematics and time-aligned current pose; otherwise mark the source incompatible for that action component rather than fabricating a conversion.",
          "Build equal-size target-robot evaluation slices and compare local-only, mixed-pretrained, and adapted checkpoints using identical prompts, start states, success rules, and trial counts.",
        ],
        result:
          "Both raw actions happen to normalize to 0.5, yet their typed records remain different until a physically justified adapter maps them; numeric scaling never substitutes for semantics.",
        takeaway:
          "Normalize magnitudes after preserving body meaning, and claim transfer only from a controlled target-robot comparison.",
      },
      handsOn: {
        setup:
          "Create twelve synthetic episode cards for two imaginary arms. Use JSON or a spreadsheet export plus a small validation script; do not download or mix real datasets.",
        steps: [
          "Define embodiment manifests covering robot ID, joint names, camera mounting, state order, action order, units, frames, rate, representation, limits, gripper type, and calibration revision.",
          "Create six episodes per robot across two shared task labels, including one failure each; attach episode ID, timestamps, task text, terminal predicate, and data lineage.",
          "Normalize one compatible scalar per body with its own stored range, round-trip it to the original physical value, and prove that equal normalized values can retain different meanings.",
          "Construct a common record with task and image references plus typed body-specific state and action sections, padding only with an explicit validity mask.",
          "Choose mixture weights, sample twenty episode IDs with a fixed seed, and compare intended versus observed shares by robot, task, and success status.",
          "Freeze four target-robot episodes as evaluation-only, verify their IDs and near-duplicate scenes do not appear in the training mix, and document which transfer claim this tiny exercise cannot support.",
        ],
        observe:
          "A shared column layout hides substantial physical differences, and sampling counts often depart from the intended balance unless embodiment, task, and outcome are inspected together.",
        doneWhen:
          "Every synthetic row round-trips through its own adapter, incompatible actions remain masked rather than guessed, the mixture count is reproducible, and held-out target episodes have no lineage overlap with training.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_SOFTWARE],
        workExample:
          "Onboard a new robot dataset by writing its embodiment manifest, mapping observations and actions into the policy processors, validating statistics and masks, auditing mixture balance, and measuring transfer against a target-only baseline.",
        interviewPrompt:
          "Two robot datasets both expose a seven-number action vector normalized to `[-1,1]`. Explain why concatenation is unsafe, design an embodiment-aware adapter, and propose an evaluation that distinguishes positive transfer from dataset leakage.",
      },
      commonMistakes: [
        {
          mistake: "Concatenating same-length action arrays from different robots.",
          correction:
            "Compare component names, units, frames, control modes, rates, and body kinematics first; use a verified adapter or retain an explicit incompatibility mask.",
        },
        {
          mistake: "Calling equal normalized values equivalent physical actions.",
          correction:
            "Normalization aligns numeric ranges only; inverse-decode with per-embodiment metadata and preserve the original action semantics.",
        },
        {
          mistake: "Reporting cross-embodiment benefit because a mixed model was trained successfully.",
          correction:
            "Use frozen target-robot trials and comparable local-only, mixed-pretrained, and adapted baselines, then report each held-out slice and failed trial.",
        },
      ],
      checkQuestions: [
        {
          question: "Why do both worked actions normalize to 0.5 without becoming comparable commands?",
          answer:
            "Their ranges scale similarly, but one value is a relative Cartesian displacement in metres and the other an absolute joint target in radians.",
        },
        {
          question: "Which information can often be shared more safely across embodiments than raw actions?",
          answer:
            "Task language, some visual concepts, object relations, and high-level success predicates can be shared while body observations and action decoding stay typed and adapter-controlled.",
        },
        {
          question: "What comparison provides evidence of positive cross-embodiment transfer?",
          answer:
            "On one frozen target-robot suite, a mixed-pretrained or adapted model must outperform a comparable target-only baseline under the same data accounting and acceptance rules.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "Two embodiment manifests and a typed row comparison expose the important semantic mismatch more precisely than a decorative multi-robot illustration.",
      },
    },
    {
      dayId: 123,
      mentalModel:
        "An action representation is a shipping format for future motion: bins, numbers, denoised sequences, and learned flows trade resolution, ambiguity, and computation.",
      explanation: [
        "A discrete action representation chooses among symbols or bins. A mobile robot may select `turn_left`, `straight`, or `turn_right`; a VLA such as OpenVLA tokenizes normalized action dimensions so a language-model-style backbone can predict them. Discretization gives a finite vocabulary and a clear decoding table, but values within one bin become indistinguishable and independent per-dimension tokens may not preserve trajectory smoothness by themselves. Vocabulary size, bin edges, out-of-range handling, token order, and the physical inverse mapping are part of the deployed policy contract.",
        "A continuous policy outputs floating-point action values or parameters of a continuous distribution. It avoids fixed quantization bins and can represent small numeric differences, but regression to one average can be poor when demonstrations contain several valid strategies. For example, moving around an obstacle on the left or right may produce an unsafe average path through the obstacle. A continuous value also remains only a representation: joint target, velocity, torque, gripper-frame delta, and base-frame pose have different controllers, stability implications, and limits even when all are stored as floats.",
        "Diffusion and flow-based policies are generative ways to produce continuous actions, commonly as a sequence. A diffusion policy begins from noise and iteratively denoises toward an action trajectory conditioned on observations. Flow matching learns a vector field that transports a simple distribution toward the action distribution and samples it by following that field, often with a numerical integration or model-specific solver. Both can represent multiple plausible behaviors; neither guarantees safe, smooth, or fast motion. Solver steps, stochasticity, action statistics, inference latency, and validation remain measurable deployment choices.",
        "An action chunk has shape `[H, D]`: `H` future times and `D` action components. Predicting a chunk can capture temporal structure and amortize a slow model call, but executing the whole chunk open-loop lets the world change underneath it. Receding-horizon execution consumes only a prefix, obtains a fresh observation, and predicts again. Choose observation horizon, prediction horizon, execution horizon, control rate, overlap, and fallback together. Validate each row and the sequence between rows; a safe-looking first action does not make a later discontinuity acceptable.",
      ],
      keyTerms: [
        {
          term: "Quantization",
          meaning:
            "Mapping a continuous range into a finite set of bins or symbols, losing distinctions smaller than the bin spacing.",
          physicalExample:
            "Five steering tokens across `[-1,1]` cannot directly distinguish desired values 0.21 and 0.24 if both decode to the same centre.",
        },
        {
          term: "Action chunk",
          meaning:
            "A sequence of future action vectors predicted together, conventionally shaped as horizon by action dimension.",
          physicalExample:
            "At 10 Hz, a chunk of four gripper-frame deltas describes 0.4 seconds of intended motion before execution policy decides how much to consume.",
        },
        {
          term: "Diffusion policy",
          meaning:
            "A conditional generative policy that iteratively removes noise to produce an action value or sequence consistent with the current observation.",
          physicalExample:
            "Several denoising steps turn a noisy four-pose proposal into one sampled route around the left side of a tabletop obstacle.",
        },
        {
          term: "Flow matching",
          meaning:
            "A generative method that learns a time-dependent vector field carrying samples from a simple distribution toward the demonstrated action distribution.",
          physicalExample:
            "An integrator follows learned action-space velocity estimates from an initial noisy chunk toward a continuous pick trajectory.",
        },
        {
          term: "Action horizon",
          meaning:
            "The future time span or number of steps represented by one policy output.",
          physicalExample:
            "Six actions at 20 Hz cover 0.3 seconds, regardless of how long inference took to produce them.",
        },
        {
          term: "Receding-horizon execution",
          meaning:
            "Executing only an initial part of a predicted sequence, then re-observing and planning a new overlapping sequence.",
          physicalExample:
            "The arm uses two actions from a six-action chunk, checks whether the cup slipped, and predicts a replacement chunk from the new scene.",
        },
      ],
      physicalExamples: [
        {
          title: "Two valid routes around a bottle",
          scenario:
            "Demonstrations move a gripper either left or right around a central bottle before reaching the cup; both modes succeed.",
          lookFor:
            "A single averaged continuous path may cross the bottle, while a discrete or generative representation can preserve two modes only if sampling, conditioning, and evaluation actually separate them.",
        },
        {
          title: "Cup slips during a predicted chunk",
          scenario:
            "A policy predicts 0.5 seconds of lifting motion, but the cup moves inside the gripper after the first 0.2 seconds.",
          lookFor:
            "Receding-horizon execution re-observes before the remaining actions, whereas open-loop chunk execution continues from a state that is no longer true.",
        },
      ],
      workedExample: {
        title: "Compare four representations of one bounded x action",
        setup:
          "A simulator accepts relative gripper-frame x displacement in `[-0.10, 0.10] m` at 10 Hz. The desired first step is `0.03 m`, and the policy predicts four steps.",
        steps: [
          "For five evenly spaced discrete centres, calculate spacing `(0.10 - (-0.10)) / (5 - 1) = 0.05 m`, producing `[-0.10, -0.05, 0, 0.05, 0.10]`.",
          "Nearest-bin decoding maps desired `0.03 m` to `0.05 m`, creating `0.02 m` absolute quantization error before any controller or physical error.",
          "A direct continuous head can output `0.03 m`, but record whether it predicts one value, a distribution, or a complete chunk and how it represents multiple valid routes.",
          "A diffusion head starts from a noisy four-step sequence and applies its configured denoising process; a flow head starts from a simple sample and follows its learned vector field. Record samples and elapsed time rather than assuming either method is deterministic or faster.",
          "Interpret chunk shape `[H=4, D=1]` at 10 Hz as `4 × 0.1 = 0.4 s` of future action, then set execution horizon to two steps so the simulator re-observes after 0.2 seconds.",
          "Reject every candidate with a non-finite value, per-step displacement outside `±0.10 m`, inter-step jump above the declared bound, stale observation, predicted collision, or inference time beyond the action deadline.",
          "Run identical seeded simulated scenes, report success, chosen route, quantization error, inference time, validator rejection, and intervention separately for each representation.",
        ],
        result:
          "The discrete version visibly loses 0.02 m resolution in the first step, while the continuous and generative versions avoid that fixed bin error but add their own mode, sampling, and latency questions.",
        takeaway:
          "Representation decides what a policy can express; horizon, validation, controller semantics, and measured trials decide whether that expression is usable.",
      },
      handsOn: {
        setup:
          "Use a one-dimensional simulated gripper marker and local functions that return tokens, floats, or fabricated action samples. Training a diffusion or flow model is outside this exercise.",
        steps: [
          "Implement a five-bin encoder and decoder for `[-0.10, 0.10] m`; round-trip eleven test values and tabulate maximum and mean quantization error.",
          "Implement a bounded continuous mock policy and two seeded generative mocks that choose left or right action sequences; label these as interface simulators, not trained-model evidence.",
          "Represent every result as `[H, D]`, attach control rate and frame, and assert that the claimed time horizon equals `H / rate`.",
          "Execute one, two, and all four actions before re-observation; move the target after step two and record which execution horizon notices the shift before issuing stale actions.",
          "Inject a NaN, one out-of-range row, an abrupt reversal, and a 150 ms inference delay against a 100 ms cycle; verify the sequence validator reports the responsible row and rule.",
          "Write a comparison table covering resolution, multimodal behavior, determinism, sampling calls, measured latency, reactivity, failure modes, and the evidence your mocks cannot provide.",
        ],
        observe:
          "Finer numeric output is not automatically better behavior, and a longer chunk trades fewer model calls for more exposure to scene change unless execution deliberately re-observes.",
        doneWhen:
          "The bin-error table is reproducible, action-horizon arithmetic is correct, all four injected faults are blocked, and the final comparison separates representation properties from unmeasured model quality.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Select and integrate a policy action head by matching robot control semantics, resolution, multimodality, chunk timing, inference budget, processor order, and sequence validation rather than choosing diffusion, flow, tokens, or regression by trend.",
        interviewPrompt:
          "Compare tokenized, direct continuous, diffusion, and flow action outputs for a 20 Hz arm. Quantify one discretization tradeoff, define prediction and execution horizons, and explain how latency and re-observation change safe deployment.",
      },
      commonMistakes: [
        {
          mistake: "Assuming discrete actions are crude and continuous actions are inherently precise.",
          correction:
            "Measure bin error, sensor and actuator resolution, controller behavior, and distribution ambiguity; floating-point output can still average incompatible strategies or use the wrong semantics.",
        },
        {
          mistake: "Executing every predicted action because the model paid to compute the whole chunk.",
          correction:
            "Choose a shorter execution horizon when the scene can change, re-observe on schedule, and define how overlapping chunks are reconciled without discontinuity.",
        },
        {
          mistake: "Treating diffusion or flow generation as an automatic trajectory-safety guarantee.",
          correction:
            "Validate sampled values and the complete sequence for time, bounds, frames, kinematics, collisions, continuity, and controller acceptance every time.",
        },
      ],
      checkQuestions: [
        {
          question: "What quantization error occurs when `0.03 m` uses the nearest centre in the five-bin worked example?",
          answer:
            "It decodes to `0.05 m`, so the absolute representation error is `0.02 m` before other system errors.",
        },
        {
          question: "How do diffusion and flow action generation differ at a high level?",
          answer:
            "Diffusion iteratively denoises a sample, while flow matching learns a vector field and follows it from a simple distribution toward actions; actual solver steps and speed are implementation choices.",
        },
        {
          question: "Why predict four actions but execute only two?",
          answer:
            "The chunk captures temporal intent, while a shorter execution horizon forces a fresh observation after 0.2 seconds so later actions are not blindly applied to a changed scene.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "Parallel token, direct-value, diffusion, and flow lanes plus prediction-versus-execution horizons make the representation and re-observation tradeoffs materially easier to compare.",
      },
    },
    {
      dayId: 124,
      mentalModel:
        "Grounding is a courtroom identification: every noun, relation, and requested effect must point to visible evidence before a robot skill is admissible.",
      explanation: [
        "Language grounding connects words to the current physical scene and robot state. The instruction `pick the mug beside the plate` should resolve to a stable perceived entity ID, a relation evaluated in a named frame, and a task predicate—not merely to pixels that resemble training examples. Object labels alone are insufficient when there are duplicates. A grounded record can include candidate IDs, attributes, 2D or 3D location, relation scores, uncertainty, observation time, and the exact evidence used to select one referent.",
        "The verb and goal also need grounding. `Pick` should map to an admissible skill with typed arguments, preconditions, effects, limits, and failure codes. A detected mug may be outside reach, already held, occluded, too hot, or not permitted to move. Affordance is task- and embodiment-specific: a handle may support a two-finger grasp for one gripper but not another. The planner or VLA does not get to convert recognition confidence into execution authority; the skill boundary checks current world and robot conditions.",
        "Instruction diversity tests whether the system handles different valid ways of expressing the same intent. Paraphrases such as `lift the crimson cup` and `pick up the red mug` can share an expected referent and effect in a carefully constructed scene. Changing `left of` to `right of`, adding `not`, or changing `cup` to `bowl` is not a paraphrase; it changes the expected behavior. Build prompt groups with explicit semantic equivalence, dialect and word-order variation, relational language, corrections, and negative cases instead of counting every altered string as useful diversity.",
        "Ambiguity is an expected system state. If two red mugs are equally plausible, the correct outcome is a clarification question or a safe rejection, not a confident guess. The HMI should present the interpreted entity, goal, and uncertainty before consequential execution when the workflow allows review. After a person clarifies, re-ground against a fresh scene because objects may have moved. Store the original instruction, interpretation, clarification, entity version, action decision, and outcome so failures can be attributed to perception, grounding, planning, policy, or execution.",
      ],
      keyTerms: [
        {
          term: "Referring expression",
          meaning:
            "Words used to identify an entity through category, attributes, location, or relation to other entities.",
          physicalExample:
            "`The small red mug beside the blue plate` narrows several visible containers to one candidate using attributes and a spatial relation.",
        },
        {
          term: "Grounding",
          meaning:
            "Linking language to specific perceived entities, relations, states, skills, and expected physical effects in the current world.",
          physicalExample:
            "The token sequence `that cup` is resolved to tracked entity `cup-17` at a timestamped table pose before a pick skill is considered.",
        },
        {
          term: "Affordance",
          meaning:
            "An action opportunity supported by the entity, robot body, current state, and task constraints.",
          physicalExample:
            "A wide handle affords a parallel-gripper grasp only while it is visible, reachable, cool enough, and not blocked by the plate.",
        },
        {
          term: "Paraphrase",
          meaning:
            "A different wording that preserves the same intended referent, relation, goal, and acceptance condition for the tested scene.",
          physicalExample:
            "`Put the red cube in the tray` and `place the crimson block inside the tray` can share one expected result when labels and scene are controlled.",
        },
        {
          term: "Ambiguity",
          meaning:
            "A state in which available evidence supports multiple materially different interpretations without a declared winner.",
          physicalExample:
            "Two red mugs are equally near the plate, so `pick the red mug` has two feasible referents.",
        },
        {
          term: "Clarification policy",
          meaning:
            "A rule specifying when to ask a targeted question, safely reject, or require operator selection instead of guessing.",
          physicalExample:
            "When the best two referent scores are within the configured margin, the HMI asks, `left mug or right mug?` and commands nothing.",
        },
      ],
      physicalExamples: [
        {
          title: "Two red mugs and one blue plate",
          scenario:
            "A table holds red mugs M1 and M2. Only M2 is beside blue plate P1, while both mugs satisfy the category and color words.",
          lookFor:
            "The relational phrase selects M2 only if `beside` has a declared geometric rule, the entities are fresh, and the result is unique enough for the clarification policy.",
        },
        {
          title: "Correct object, inadmissible pick",
          scenario:
            "The system correctly identifies a glass cup, but it sits outside the arm workspace behind a transparent barrier.",
          lookFor:
            "Grounding can succeed while the pick affordance and skill preconditions fail; the system reports unreachable or blocked instead of turning perception confidence into motion.",
        },
      ],
      workedExample: {
        title: "Resolve one relational instruction and one ambiguous instruction",
        setup:
          "A paper scene contains M1 `red mug` at `(0.20, 0.10) m`, M2 `red mug` at `(0.62, 0.12) m`, P1 `blue plate` at `(0.66, 0.10) m`, and B1 `green bowl` at `(0.40, 0.45) m`, all in table frame at time `8.000 s`.",
        steps: [
          "Parse `pick the red mug beside the blue plate` into target category `mug`, attribute `red`, relation `beside`, reference category `plate`, reference attribute `blue`, and requested skill `pick`.",
          "Filter entities by category and attributes: target candidates are M1 and M2, while the unique reference candidate is P1.",
          "Define `beside` for this exercise as planar centre distance at most `0.10 m`; calculate M1-to-P1 distance about `0.46 m` and M2-to-P1 distance about `0.045 m`.",
          "Resolve M2 as the unique relational match, then verify its pose age, table frame, tracking confidence, reachability, gripper compatibility, workspace, and the preconditions registered by `pick`.",
          "For `pick the red mug`, retain both M1 and M2; because category and color do not select one, return `needs_clarification` and ask a question using stable attributes such as `left mug or mug beside the plate?`.",
          "After the answer, obtain a fresh scene snapshot, resolve the clarified expression again, and log original text, candidates, relation calculation, clarification, chosen entity version, skill decision, and later measured outcome.",
        ],
        result:
          "The relational instruction resolves to M2 under an explicit 0.10 m rule, while the shorter instruction causes no action because two referents remain plausible.",
        takeaway:
          "Grounding is an auditable join between language and world state; uniqueness and admissibility are decisions, not side effects of fluent text.",
      },
      handsOn: {
        setup:
          "Use four labelled paper objects on a measured grid or a JSON scene graph. The exercise ends at a mock skill validator or simulator.",
        steps: [
          "Create entity records with stable ID, category, attributes, table-frame pose, visibility, confidence, timestamp, reachability, and allowed manipulation state.",
          "Write twelve instructions: four true paraphrases, three relation changes, one negation, two ambiguous references, one unknown object, and one request whose object is identified but unreachable.",
          "For each instruction, define the expected entity ID or no-action state, goal predicate, and whether the correct route is execute in simulation, clarify, or reject.",
          "Implement simple exact-match filters and measured left, right, inside, and near relations; return all candidates and evidence instead of only the top candidate.",
          "Run the set twice, moving one object between runs; require fresh timestamps and verify a prior clarification cannot silently authorize an action on the moved scene.",
          "Report referent accuracy, clarification correctness, false-execution count, and skill-precondition rejections separately; retain every failed case with its candidate set.",
        ],
        observe:
          "Small prepositions and negations change expected action, valid paraphrases preserve it, and correct object recognition can still end in a necessary skill rejection.",
        doneWhen:
          "Every instruction has a predeclared expected outcome, ambiguous and unknown cases command nothing, moved objects require re-grounding, and the report exposes rather than averages away false executions.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_HMI,
          ROLE_INTEGRATION,
          ROLE_VALIDATION,
        ],
        workExample:
          "Build the language-to-skill boundary that exposes perceived candidates, grounded entity IDs, relation evidence, ambiguity, operator clarification, precondition failures, and replayable outcome records instead of hiding interpretation inside a model response.",
        interviewPrompt:
          "Design grounding for `pick the red mug near the plate` when two red mugs exist. Define the scene representation, relation rule, ambiguity threshold, clarification UX, skill preconditions, and tests for negation, moved objects, and false execution.",
      },
      commonMistakes: [
        {
          mistake: "Using shared words as proof that an instruction refers to the correct object.",
          correction:
            "Resolve all candidate entity IDs with attributes, relations, frames, timestamps, and uncertainty, then require a unique acceptable interpretation or clarification.",
        },
        {
          mistake: "Counting any changed sentence as instruction diversity.",
          correction:
            "Separate semantics-preserving paraphrases from relation, object, negation, and goal changes, and assign an explicit expected outcome to each.",
        },
        {
          mistake: "Letting the model guess when two referents are plausible.",
          correction:
            "Return a no-action ambiguity state, ask a targeted question or require operator selection, then re-ground the answer against a fresh scene.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does `pick the red mug beside the blue plate` select M2 in the worked scene?",
          answer:
            "M2 is the only red mug within the declared 0.10 m `beside` distance of the unique blue plate; M1 is about 0.46 m away.",
        },
        {
          question: "Can correct referent grounding make a pick automatically admissible?",
          answer:
            "No. Reachability, visibility, gripper compatibility, workspace, object state, authorization, and every skill precondition still need independent validation.",
        },
        {
          question: "What should happen after a user clarifies an ambiguous object?",
          answer:
            "Capture fresh world state and ground the clarified expression again before any skill request, because the scene or tracked entity may have changed.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A measured paper scene and candidate table already make the language-to-entity evidence concrete without consuming another application visual.",
      },
    },
    {
      dayId: 125,
      mentalModel:
        "Generalization is a sealed set of unfamiliar exam rooms, each labelled by what changed and scored without moving the pass line afterward.",
      explanation: [
        "Generalization means meeting a frozen task criterion under conditions deliberately excluded from the relevant training or adaptation data. Name the axis: unseen object instance, appearance, pose, scene, lighting, distractor, instruction form, task composition, or robot embodiment. A new prompt over a memorized trajectory tests language variation but not physical generalization. A new camera background with the same object can test visual shift but not cross-embodiment transfer. Broad claims require multiple separately designed axes and enough trials to reveal repeatability and failure patterns.",
        "The split must prevent leakage at the level where similarity lives. Adjacent frames from one episode, repeated takes from one setup, images of the same object instance, or paraphrases generated from the same base record can be near-duplicates. Split by episode, collection session, object identity, scene, and robot as required before fitting normalization or selecting checkpoints. Record a lineage graph or group IDs and prove set intersections are empty. A random row split is especially misleading for robot video because successive frames share almost every visual and physical detail.",
        "An evaluation matrix should freeze start-state distributions, prompts, object and scene assignments, success predicates, time limits, intervention rules, safety checks, seeds, and trial counts. Report familiar and held-out slices separately. Task success, partial progress, operator intervention, unsafe action proposals, validator rejection, latency, and recovery answer different questions. A validator that blocks dangerous proposals can protect execution while still revealing a poor policy; counting the blocked trial simply as safe success would hide the model defect.",
        "Cross-embodiment evaluation needs additional discipline. A policy evaluated on a new body may require an approved adapter or limited target demonstrations; label the result zero-shot, few-shot, or fine-tuned and compare it with a target-only baseline. Keep hardware, controller, camera, and task changes visible rather than calling the whole bundle generalization. When overall success and the worst slice disagree, the worst relevant slice governs the deployment decision. Aggregate averages are useful summaries only after the condition-level table is visible.",
      ],
      keyTerms: [
        {
          term: "Distribution shift",
          meaning:
            "A meaningful difference between conditions represented in training and those encountered during evaluation or deployment.",
          physicalExample:
            "Training uses matte blue cups on a plain table, while evaluation introduces reflective red cups and a patterned surface.",
        },
        {
          term: "Held-out split",
          meaning:
            "Examples or condition groups excluded from training, preprocessing fit, checkpoint selection, and threshold tuning so they can challenge the final system.",
          physicalExample:
            "All episodes containing cup instance C7 remain evaluation-only, including every camera view and repeated take.",
        },
        {
          term: "Leakage",
          meaning:
            "Information from evaluation conditions influencing training, preprocessing, model selection, or acceptance thresholds.",
          physicalExample:
            "Frames 100–150 train the policy while nearly identical frames 151–160 from the same grasp appear in the test set.",
        },
        {
          term: "Evaluation slice",
          meaning:
            "A named subset of trials sharing one condition whose metrics are reported separately.",
          physicalExample:
            "The `unseen-object + unseen-scene` slice contains ten trials and succeeds only three times even though the full suite appears acceptable.",
        },
        {
          term: "Success criterion",
          meaning:
            "A predeclared measurable predicate and time boundary that determines whether a trial accomplished the physical task.",
          physicalExample:
            "The cup base lies entirely inside the tray for two seconds, the gripper is released, and no forbidden contact occurred within 30 seconds.",
        },
        {
          term: "Zero-shot",
          meaning:
            "Evaluation on a target condition without updating model parameters from target-condition demonstrations; interface setup and adapters must still be disclosed.",
          physicalExample:
            "A pretrained policy controls a supported arm on held-out objects without fine-tuning, while using the arm's documented calibration and action decoder.",
        },
      ],
      physicalExamples: [
        {
          title: "Unseen cup on an unseen table",
          scenario:
            "A placement policy trained on two cup instances and a plain tabletop is tested on a new cup, a patterned mat, and both changes together.",
          lookFor:
            "Separate slices reveal whether object appearance, scene texture, or their combination causes the failure instead of hiding all shifts in one score.",
        },
        {
          title: "New arm with a target adapter",
          scenario:
            "A cross-embodiment policy is attached to a supported seven-joint arm using a new state/action adapter but no target-task fine-tuning.",
          lookFor:
            "The report calls the policy zero-shot only with respect to task demonstrations and discloses adapter configuration, calibration, controller, safety limits, and target-only baseline.",
        },
      ],
      workedExample: {
        title: "Expose a hidden generalization gap across forty frozen trials",
        setup:
          "A simulated `place cup in tray` suite has four ten-trial slices: familiar object and scene, unseen object only, unseen scene only, and unseen object plus unseen scene.",
        steps: [
          "Freeze object IDs, scene IDs, start poses, ten prompts per slice, 30-second limit, success predicate, no-contact rule, intervention policy, random seeds, and model checkpoint before running.",
          "Verify the unseen object and scene group IDs have no training overlap and that normalization statistics and threshold selection used training data only.",
          "Record success counts: familiar `9/10 = 90%`, unseen object `7/10 = 70%`, unseen scene `6/10 = 60%`, and both unseen `3/10 = 30%`.",
          "Calculate the aggregate as `(9 + 7 + 6 + 3) / 40 = 25/40 = 62.5%`; keep the four slice rates beside it rather than reporting 62.5 percent alone.",
          "Calculate the familiar-to-combined-unseen gap as `90% - 30% = 60 percentage points`, then inspect the seven combined-unseen failures by wrong referent, bad grasp, collision rejection, timeout, or dropped object.",
          "Report unsafe proposals and validator rejections separately from task success; a blocked collision remains a failed policy trial plus a successful guardrail event.",
          "Compare with the frozen classical or behavior-cloning baseline on the same forty starts and make the deployment decision from predeclared per-slice thresholds, not whichever aggregate looks best.",
        ],
        result:
          "The 62.5 percent aggregate hides a collapse to 30 percent when both object and scene are unseen, producing a 60-point gap from familiar trials.",
        takeaway:
          "A generalization claim is a condition-labelled matrix with frozen rules and retained failures, not one accuracy number attached to novel-looking examples.",
      },
      handsOn: {
        setup:
          "Use paper scene cards or the existing simulator and a deterministic mock or previously trained policy. Do not tune the policy after viewing held-out outcomes.",
        steps: [
          "Create a training-lineage manifest and four evaluation slices that vary object instance and scene independently; add prompt variants without allowing them to change the physical goal.",
          "Hash or list episode, object, scene, and session group IDs, then assert that every evaluation group required by the claim is absent from training and preprocessing fit.",
          "Write the physical success predicate, timeout, forbidden event, intervention rule, recovery rule, seed list, and minimum slice threshold before the first trial.",
          "Run all trials sequentially, capturing start state, prompt, action decisions, validator events, measured terminal state, and unedited result for every failure as well as success.",
          "Calculate aggregate, each slice, worst slice, intervention rate, unsafe-proposal rate, rejection reasons, latency percentiles, and generalization gap.",
          "Attempt one cross-embodiment paper analysis by specifying what adapter and calibration would change; do not claim target-robot performance without actual target or HIL evidence.",
        ],
        observe:
          "Leakage checks are stricter than row uniqueness, and the combined held-out condition often fails for reasons that vanish inside one aggregate success percentage.",
        doneWhen:
          "The suite was frozen before execution, required group intersections are empty, every trial is attributable to a condition and outcome, and the conclusion quotes the worst relevant slice and exact evidence boundary.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
        ],
        workExample:
          "Own a VLA acceptance matrix that isolates object, scene, prompt, pose, and body shifts; prevents episode leakage; preserves blocked unsafe proposals; compares baselines; and turns the worst condition into a go, restrict, or reject decision.",
        interviewPrompt:
          "A VLA reports 85 percent overall success on randomly split video frames. Design a leakage-resistant held-out evaluation across objects, scenes, prompts, and embodiments, and explain how blocked unsafe proposals and the worst slice affect release.",
      },
      commonMistakes: [
        {
          mistake: "Randomly splitting individual frames from robot episodes.",
          correction:
            "Group by episode, session, object, scene, and embodiment as required so near-identical temporal or physical contexts cannot cross the evaluation boundary.",
        },
        {
          mistake: "Changing prompts, thresholds, or start states after seeing failures.",
          correction:
            "Freeze the suite and checkpoint first; treat any later change as a new version that must rerun the untouched acceptance set.",
        },
        {
          mistake: "Using one aggregate to support every generalization claim.",
          correction:
            "Report each named axis and combination, the worst relevant slice, intervention and unsafe-proposal rates, and the exact zero-shot or adapted boundary.",
        },
      ],
      checkQuestions: [
        {
          question: "What important result is hidden by the 62.5 percent aggregate in the worked suite?",
          answer:
            "Success falls to 30 percent when both object and scene are unseen, 60 percentage points below the 90 percent familiar slice.",
        },
        {
          question: "Why is a blocked unsafe action both a failure and useful evidence?",
          answer:
            "The policy failed by proposing the action, while the independent validator succeeded by preventing execution; combining them as task success would hide the policy defect.",
        },
        {
          question: "What must accompany a zero-shot cross-embodiment claim?",
          answer:
            "Disclosure of target adapters, calibration, controller and setup, absence of target-task parameter updates, frozen target trials, and a suitable target-only or prior-system baseline.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "A four-row result table with lineage IDs and exact arithmetic exposes the generalization failure more directly than an additional generated chart.",
      },
    },
    {
      dayId: 126,
      mentalModel:
        "An architecture review follows one sealed parcel from photon and sentence to measured effect, checking the label, clock, owner, and escape route at every door.",
      explanation: [
        "A useful architecture review traces concrete values, not only boxes. Start with one correlation ID and capture camera, instruction, robot state, calibration, model, processor, and controller versions. At each boundary record producer, consumer, schema, shape, unit, frame, timestamp, freshness, latency, error state, and evidence location. The trace should make it possible to answer which pixels and words produced which action row, which decoder turned that row into physical units, which validator accepted or rejected it, and which measurement later established the effect.",
        "Timing is a causal contract. Camera exposure, robot state, instruction, inference, command publication, controller sampling, and measured response happen at different instants. Sum stage latency, but also inspect synchronization and queue age; a fast model using a 500 ms old image is still stale. Compare worst observed end-to-end latency with observation and control deadlines, not only with an average. Every action carries the source observation time, inference generation, expiry, intended start time, rate, and horizon so a delayed gateway cannot revive an obsolete chunk.",
        "The model boundary needs versioned processors on both sides. Preprocessing selects and normalizes observations. Postprocessing crops padding, restores physical scale, converts representation and frame, and produces a typed proposal. Validation then checks finite values, robot and model compatibility, authority, freshness, workspace, joint and velocity limits, collisions, inter-step continuity, controller mode, and any task-specific exclusion. Some conditions should reject; some should ask for clarification; others can invoke a named deterministic recovery. Silent clamping can conceal a model fault and change task meaning, so every modification needs policy and telemetry.",
        "Completion requires a return path. A gateway acknowledgment proves transport, and a controller acceptance proves only that a request entered execution. Measured joint or tool state, contact or object perception, and a predeclared task predicate establish what happened. Review nominal and failure traces for stale image, unknown entity, missing state, incompatible checkpoint, NaN, out-of-range action, deadline miss, collision, controller rejection, tracking error, and task timeout. The architecture is credible when every fault terminates in an observable state with one owner and no path around the validator.",
      ],
      keyTerms: [
        {
          term: "Correlation ID",
          meaning:
            "A stable identifier propagated across observation, inference, validation, command, feedback, and outcome records for one request.",
          physicalExample:
            "`req-126-04` links the saved camera frame to action chunk 18, validator decision 22, ROS 2 goal 51, and terminal task record 9.",
        },
        {
          term: "Traceability",
          meaning:
            "The ability to connect a requirement or request through versions, transformations, decisions, execution evidence, and final outcome.",
          physicalExample:
            "A failed placement can be traced to an ambiguous entity rather than guessed from an isolated controller log.",
        },
        {
          term: "Freshness budget",
          meaning:
            "The maximum allowed age across acquisition, queues, compute, transport, and command start before data or action is rejected.",
          physicalExample:
            "A 120 ms camera-to-command limit allocates time to capture, inference, decoding, validation, and the ROS 2 gateway.",
        },
        {
          term: "Guardrail",
          meaning:
            "An independently enforced rule that rejects, transforms under explicit policy, or escalates a proposed action before or during execution.",
          physicalExample:
            "A trajectory validator rejects a gripper-frame waypoint that would cross the simulator's protected region even though every number is finite.",
        },
        {
          term: "Terminal evidence",
          meaning:
            "The measured record that closes a request as succeeded, failed, cancelled, timed out, or otherwise resolved under a declared predicate.",
          physicalExample:
            "The gripper is open, the tracked block remains inside the target region for two seconds, and the controller reports no forbidden contact.",
        },
        {
          term: "Processor version",
          meaning:
            "The exact version of ordered observation and action transforms paired with a checkpoint and embodiment.",
          physicalExample:
            "Checkpoint `vla-12` is rejected when loaded with decoder `robot-r3-v7` because it was trained with `robot-r3-v6` statistics and component order.",
        },
      ],
      physicalExamples: [
        {
          title: "Correct action arrives one cycle late",
          scenario:
            "A valid chunk is generated from a fresh scene, but a queue delay causes the first row to reach a 10 Hz controller after its intended cycle.",
          lookFor:
            "Source time, intended start, queue age, expiry, and deadline decision reveal a stale command; correct numbers do not justify late execution.",
        },
        {
          title: "Controller accepts, block never moves",
          scenario:
            "The ROS 2 controller acknowledges a trajectory, but the gripper misses the block and reaches the target pose empty.",
          lookFor:
            "Controller feedback, gripper state, object tracking, and the task predicate record physical failure instead of equating accepted motion with successful placement.",
        },
      ],
      workedExample: {
        title: "Review one `move red block left` request with values and failures",
        setup:
          "A simulator runs at 10 Hz. Request `req-126-04` uses a camera frame captured at `12.000 s`, state sampled at `12.006 s`, maximum source-to-command age `120 ms`, and an action head returning four rows of `[dx, dy, dz, gripper]`.",
        steps: [
          "Bind the instruction to grounded entity `block-17`, camera calibration `cam-v4`, robot `R3`, processor `r3-v6`, checkpoint `vla-12`, controller mode `relative gripper-frame position`, and one correlation ID.",
          "Record stage latency: capture and preprocessing `18 ms`, multimodal encoding and fusion `42 ms`, action generation `17 ms`, decode plus validation `9 ms`, and ROS 2 gateway `10 ms`.",
          "Add the stages: `18 + 42 + 17 + 9 + 10 = 96 ms`; the 120 ms freshness budget leaves `24 ms`, while the 100 ms control period leaves only `4 ms` scheduling margin.",
          "Inspect output shape `[1, 4, 4]`, finite status, component order, normalized ranges, and inverse-decode the first row; attach gripper frame, 10 Hz rate, intended start, and expiry to the physical proposal.",
          "Validate all four poses for entity freshness, authority, processor-checkpoint pairing, workspace, joint feasibility, per-step distance, protected-region collision, gripper command, and continuity before publishing a simulated goal.",
          "Follow gateway acknowledgment, controller acceptance, per-step measured tool pose, gripper feedback, updated `block-17` pose, and the predicate `block centre moved at least 0.08 m left without forbidden contact` to a terminal record.",
          "Replay with a 40 ms extra queue delay, a NaN in row three, and two red-block candidates; require separate `expired`, `invalid_action`, and `needs_clarification` outcomes, each with no controller goal.",
        ],
        result:
          "The nominal path reaches the gateway in 96 ms with 24 ms freshness margin, but little 10 Hz scheduling slack; each injected failure stops before execution and remains attributable to one contract.",
        takeaway:
          "Architecture quality becomes reviewable when one request carries concrete identity, shapes, physics, time, decisions, feedback, and terminal truth through both success and failure.",
      },
      handsOn: {
        setup:
          "Use the existing simulator or a local trace generator. Keep one folder of small JSON records and screenshots; do not connect the review harness to a physical actuator.",
        steps: [
          "Choose one language-conditioned simulated task and write its request schema, grounded entity, success predicate, timeout, forbidden events, model and processor versions, and freshness budget.",
          "Instrument observation, inference, decode, validator, gateway, controller feedback, perception update, and terminal result with one correlation ID and monotonic timestamps.",
          "Capture one nominal trace and calculate stage, queue, end-to-end, deadline, and action-horizon timing from records rather than from console impressions.",
          "Inject stale image, ambiguous referent, missing state component, wrong processor version, NaN, out-of-range row, collision, gateway delay, controller rejection, and task timeout one at a time.",
          "For each fault, verify the exact owner, state transition, operator indication, evidence record, and absence of any later unauthorized command; do not replace failed traces with a rerun.",
          "Publish a one-page architecture table linking every boundary to schema, units, frame, time, validation, failure response, and terminal evidence, then mark claims as simulation-only.",
        ],
        observe:
          "Concrete traces expose hidden queues, version coupling, and false completion boundaries that remain invisible in a nominal box diagram or a successful model-response log.",
        doneWhen:
          "The nominal trace closes with a measured predicate, all ten faults end in their predeclared observable states, no rejected path reaches the controller, and another engineer can replay the evidence from the correlation ID.",
      },
      jobConnection: {
        roles: [
          ROLE_PHYSICAL_AI,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_HMI,
        ],
        workExample:
          "Lead a VLA production-readiness review that correlates multimodal inputs, model and processor versions, decoded actions, ROS 2 goals, guardrails, operator state, timing, measured robot feedback, and failure injection into one auditable acceptance trace.",
        interviewPrompt:
          "Whiteboard an end-to-end VLA request from camera and instruction to verified physical outcome. Put shapes, units, frames, timestamps, versioning, latency budget, validators, ROS 2 feedback, and at least five failure exits on the diagram.",
      },
      commonMistakes: [
        {
          mistake: "Reviewing only component names and arrows.",
          correction:
            "Trace one real value set with identities, schemas, shapes, units, frames, versions, clocks, owners, decisions, and evidence through every boundary.",
        },
        {
          mistake: "Treating a model response or controller acceptance as completed work.",
          correction:
            "Require measured robot and object state plus the predeclared task predicate and forbidden-event check before issuing terminal success.",
        },
        {
          mistake: "Testing the nominal path and listing failures only as future work.",
          correction:
            "Inject stale, ambiguous, malformed, late, infeasible, rejected, and physically unsuccessful cases now, and retain their exact observable terminal records.",
        },
      ],
      checkQuestions: [
        {
          question: "How much freshness and 10 Hz scheduling margin remain after the 96 ms worked trace?",
          answer:
            "The 120 ms freshness budget leaves 24 ms, while a 100 ms control period leaves only 4 ms before that cycle boundary.",
        },
        {
          question: "Why should an action chunk carry the source observation time as well as its generation time?",
          answer:
            "A quickly generated chunk can still depend on an old camera or state sample; both acquisition age and compute or queue delay determine whether execution is current.",
        },
        {
          question: "What distinguishes controller acceptance from terminal task evidence?",
          answer:
            "Acceptance confirms entry into the controller, while terminal evidence measures robot and object state against the success, failure, timeout, cancellation, and forbidden-event predicates.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A timestamped end-to-end trace with nominal and rejected branches materially exposes authority, version, latency, and false-completion failures that prose alone is difficult to audit.",
      },
    },
  ],
} satisfies ChapterContent;
