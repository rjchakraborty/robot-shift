import type { ChapterContent } from "../chapter-content-types";

const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";

export const week19Content = {
  week: 19,
  title: "Adapt a current VLA through explicit data, action, and release contracts",
  purpose:
    "Choose a current vision-language-action path by verified capability rather than model fame, then build the evidence needed to adapt and deploy it responsibly. This chapter distinguishes a robot-learning toolkit, downloadable action policy, and API-hosted embodied reasoner; aligns cross-embodiment data without mixing action meanings; pins checkpoints and processors; scopes parameter-efficient adaptation to implementations that actually support it; round-trips every normalized action into a guarded robot command; freezes a generalization suite; and closes with an evidence-backed deploy, revise, or reject record.",
  prerequisites: [
    "Complete Week 14's episode, multimodal schema, timestamp, action-space, split, quality, and dataset-card work, plus Week 15's behavior-cloning, chunking, rollout-evaluation, latency, fallback, and policy-comparison work.",
    "Complete Week 18's distinction among a VLM, a VLA, and an embodied-reasoning model, and be able to trace pixels and task text through a model output to a robot-specific action interface.",
    "Bring a small non-sensitive LeRobot-format or synthetic dataset, a documented observation/action contract, a frozen simulator or paper evaluation set, and enough Python familiarity to inspect dictionaries, tensor shapes, configuration files, and saved metrics.",
    "Keep every exercise offline, simulated, unpowered, or on an already commissioned robot under qualified supervision. A model checkpoint, API response, normalized action, or successful demo is not a safety-rated motion authority.",
  ],
  outcomes: [
    "Classify LeRobot 0.6, OpenVLA, Isaac GR00T N1.7, Gemini Robotics-ER 1.6, openpi π0.5, and SmolVLA by artifact, input/output, adaptation path, embodiment support, runtime, license/access, and evidence boundary without treating unlike products as interchangeable.",
    "Version a cross-embodiment training manifest that preserves task language, feature schema, camera order, state/action meaning, units, frames, rates, provenance, sampling weights, and a separate adapter for each physical body.",
    "Load a pinned base checkpoint with its exact configuration and processor artifacts, validate a golden observation and decoded output offline, and fail closed on missing, renamed, reordered, or incompatible fields.",
    "Plan or execute a supported parameter-efficient adaptation while keeping the base policy immutable, recording target modules and trainable parameters, isolating the adapter, and comparing both artifacts on one predeclared suite.",
    "Implement field-specific normalization and de-normalization whose output then passes finite-value, dimension, unit, frame, freshness, absolute-limit, rate-limit, collision, controller, and authority checks before any command path.",
    "Measure familiar and held-out objects, scenes, viewpoints, prompts, and compatible embodiments separately, preserving interventions, abstentions, wrong actions, latency, and failures instead of hiding them in one average.",
    "Publish an adaptation report that ties versions, data, compute, cost or energy where measured, latency, generalization, regressions, safety wrappers, licenses, evidence artifacts, and an explicit deploy, revise, or reject gate.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_VALIDATION,
    ROLE_SOFTWARE,
    ROLE_INTEGRATION,
    ROLE_HMI,
  ],
  sources: [
    {
      label: "Hugging Face — LeRobot v0.6.0 release",
      url: "https://huggingface.co/blog/lerobot-release-v060",
      useFor:
        "Maintainer record of the July 2026 release, including the expanded policy ecosystem, unified simulation evaluation, rollout and human-correction workflows, FSDP and cloud training, and the distinction between framework capabilities and any one model.",
    },
    {
      label: "OpenVLA — official repository and adaptation guide",
      url: "https://github.com/openvla/openvla",
      useFor:
        "Project-owned checkpoint, processor, discrete-action, RLDS/OXE data, LoRA, full-fine-tuning, evaluation, and serving contracts, including the project's newer recommendation to consider OpenVLA-OFT.",
    },
    {
      label: "NVIDIA Isaac GR00T N1.7 — official repository",
      url: "https://github.com/NVIDIA/Isaac-GR00T",
      useFor:
        "Maintainer source for the early-access 3B checkpoint, embodiment tags, modality configuration, LeRobot-derived data layout, fine-tuning, evaluation, policy-server deployment, and published support boundaries.",
    },
    {
      label: "Google DeepMind — Gemini Robotics-ER 1.6 model card",
      url: "https://deepmind.google/models/model-cards/gemini-robotics-er-1-6/",
      useFor:
        "Primary classification of Robotics-ER 1.6 as an API-accessed vision-language model with multimodal inputs and text output for spatial reasoning, planning, and success detection rather than a downloadable low-level action checkpoint.",
    },
    {
      label: "Physical Intelligence — openpi",
      url: "https://github.com/Physical-Intelligence/openpi",
      useFor:
        "Project-owned π0, π0-FAST, and π0.5 checkpoints, LeRobot dataset conversion, normalization-statistics computation, JAX and partial PyTorch paths, fine-tuning, inference, and policy-server guidance with explicit generalization cautions.",
    },
  ],
  days: [
    {
      dayId: 127,
      mentalModel:
        "The VLA ecosystem is a parts counter, not a horse race: first identify whether an item is a toolkit, action policy, hosted reasoner, processor, dataset contract, or robot adapter.",
      explanation: [
        "A useful comparison begins by separating product layers. LeRobot 0.6 is an open robot-learning framework that standardizes datasets, policies, training, evaluation, rollout, processors, and supported hardware integrations; it is not one VLA architecture. OpenVLA is an open 7B-class manipulation policy whose original path predicts discrete action tokens and whose repository documents LoRA and full fine-tuning. SmolVLA is a smaller LeRobot policy with a vision-language backbone and continuous action expert. Their commands, checkpoints, and hardware assumptions are not interchangeable merely because all appear in one ecosystem list.",
        "Isaac GR00T N1.7 is an early-access 3B generalist robot policy with a reasoning VLM backbone and flow-matching action head. Its embodiment tag and modality configuration tell the software how to interpret state, action, and video fields. Physical Intelligence's openpi publishes π0, π0-FAST, and π0.5 base and task-specific checkpoints, with π0.5 using a flow-matching path in the maintained implementation. Both families offer fine-tuning workflows, yet a checkpoint trained for a published embodiment remains a candidate to evaluate, not proof that an unlisted robot can use it zero-shot.",
        "Gemini Robotics-ER 1.6 belongs in a different row. Its official model card describes multimodal input and text output, and its release material positions it as high-level embodied reasoning that can plan, point, detect success, and call a VLA or another typed tool. It may help choose an object or decide whether a stage completed, but its API text is not a joint command. A system using it still needs a separately validated perception-to-entity contract, bounded robot skills or VLA, timeouts, and an independent command guard.",
        "Choose from the physical requirement backward. Record task, robot, camera and state fields, action representation and horizon, target rate, available GPU memory, measured tail latency, supported training format, access and license, processor ownership, evaluation harness, and recovery path. Then mark each candidate supported, convertible with named work, or unknown. A current version number, parameter count, benchmark headline, successful import, or polished video cannot replace an end-to-end trial on the declared conditions.",
      ],
      keyTerms: [
        {
          term: "Robot-learning framework",
          meaning:
            "A collection of dataset, policy, training, evaluation, rollout, processor, and hardware interfaces that can host several different model families.",
          physicalExample:
            "LeRobot can train or evaluate ACT, SmolVLA, π0-family, and GR00T integrations while each policy retains its own architecture and requirements.",
        },
        {
          term: "Action policy",
          meaning:
            "A model that consumes a declared observation and task context and produces a robot action or action chunk through a specific representation.",
          physicalExample:
            "A manipulation checkpoint receives two camera images, joint state, and “place the cup,” then proposes a seven-value Cartesian-and-gripper action chunk.",
        },
        {
          term: "Embodied reasoner",
          meaning:
            "A high-level multimodal model used for spatial reasoning, planning, tool selection, or success detection rather than direct low-level command generation.",
          physicalExample:
            "Robotics-ER identifies the correct gauge and calls a typed inspection skill, whose controller—not the reasoner's text—owns robot motion.",
        },
        {
          term: "VLA action head",
          meaning:
            "The model component that converts internal multimodal features into a declared action distribution, token sequence, or continuous trajectory.",
          physicalExample:
            "A flow-matching head iteratively produces a continuous action chunk, while original OpenVLA decodes predicted action tokens through robot-specific statistics.",
        },
        {
          term: "Supported embodiment",
          meaning:
            "A robot body and observation/action configuration for which the project publishes a matching contract, checkpoint, adapter, or reproducible workflow.",
          physicalExample:
            "A GR00T embodiment tag names the state and action modality expected for one body; spelling a new robot name in configuration does not create support.",
        },
      ],
      physicalExamples: [
        {
          title: "One SO-101 task, six unlike candidates",
          scenario:
            "A lab wants a small arm to move colored blocks at 15 Hz with two cameras and limited GPU memory, while also explaining failures to an operator.",
          lookFor:
            "A compact supported policy and LeRobot rollout path can be benchmarked for actions; an API reasoner may assist inspection, but it is scored separately and cannot satisfy the motor-rate requirement.",
        },
        {
          title: "Gauge inspection beside a humanoid stack",
          scenario:
            "A humanoid must locate an analog gauge, interpret its reading, walk to a panel, and operate a bounded control under site rules.",
          lookFor:
            "High-level visual reasoning, whole-body policy, controller, equipment skill, and protective system have separate owners, outputs, rates, and acceptance evidence.",
        },
      ],
      workedExample: {
        title: "Reduce a six-family field guide to one defensible first experiment",
        setup:
          "A team has an existing LeRobot-format tabletop dataset, one 24 GB GPU, a 10 Hz supervisory action requirement, and no authorized powered-robot test this week.",
        steps: [
          "Write non-negotiable columns before naming models: downloadable or API artifact, action-producing or reasoning-only output, dataset conversion, processor availability, estimated memory, offline evaluation path, license/access, and robot adapter status.",
          "Place LeRobot in the toolkit row, then place OpenVLA, SmolVLA, GR00T N1.7, and openpi π0.5 in policy rows with their distinct data and action contracts; place Robotics-ER 1.6 in the hosted reasoner row.",
          "Reject any candidate whose minimum documented memory or required embodiment work cannot fit the current experiment, and mark unknown values unknown rather than replacing them with parameter-count guesses.",
          "Prefer the candidate that can consume the existing data with the least semantic conversion and has a maintained offline inference or benchmark path; retain one smaller baseline so model size is not confused with task fitness.",
          "Freeze five golden observations and a simulator task suite, then measure processor validity, output shape, de-normalized range, p50 and p95 latency, and task outcome without connecting a motor driver.",
          "Record the choice as “first candidate for offline evaluation,” not “best VLA,” because no equal real-task evaluation, deployment soak, or safety acceptance has yet occurred.",
        ],
        result:
          "The team selects a runnable policy-baseline pair for a bounded offline experiment and preserves Robotics-ER as a separately measured reasoning component rather than forcing it into a low-level policy benchmark.",
        takeaway:
          "A fair ecosystem map compares contracts and evidence at the same layer; it does not rank a framework, hosted reasoner, and robot checkpoint as though they were equivalent executables.",
      },
      handsOn: {
        setup:
          "Use the five chapter sources and one spreadsheet or Markdown table. Do not download multi-gigabyte checkpoints until the compatibility and resource columns justify the cost.",
        steps: [
          "Create dated rows for LeRobot 0.6, OpenVLA, SmolVLA, GR00T N1.7, Robotics-ER 1.6, and openpi π0.5; attach one official URL and access date to every factual row.",
          "Fill artifact type, inputs, outputs, action representation, dataset format, adaptation path, embodiment mechanism, published checkpoint, runtime path, access/license note, and maintainer warning.",
          "Add local requirement columns for camera count and order, state/action dimension, rate, memory, operating system, robot interface, evaluation suite, fallback, and allowed test surface.",
          "Use only supported, conversion-required, incompatible, or unknown as compatibility labels, with one evidence sentence behind every non-unknown label.",
          "Select one candidate and one baseline for offline work, then list the exact missing evidence that would change the selection.",
          "Have a peer find any row that mixes high-level reasoning results with physical action results, repair the layer classification, and freeze the matrix version.",
        ],
        observe:
          "The most famous model may leave critical local cells unknown, while a smaller maintained policy can offer a shorter and more inspectable path from dataset to measured action.",
        doneWhen:
          "Every candidate has a verified layer and artifact type, the selected experiment follows from declared constraints, and no unsupported benchmark, latency, memory, license, or safety claim remains.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_INTEGRATION],
        workExample:
          "Own a dated VLA selection review that translates a robot task into data, action, compute, runtime, integration, evaluation, and recovery constraints, then recommends one bounded experiment with explicit unknowns.",
        interviewPrompt:
          "Compare LeRobot, OpenVLA, GR00T N1.7, Gemini Robotics-ER 1.6, π0.5, and SmolVLA without giving a popularity ranking. Classify each layer, identify the first compatibility gates, and state what you would measure before hardware.",
      },
      commonMistakes: [
        {
          mistake: "Calling every item in the ecosystem a directly deployable VLA checkpoint.",
          correction:
            "Classify frameworks, downloadable action policies, hosted reasoners, processors, and adapters separately, then compare only evidence produced at the same system layer.",
        },
        {
          mistake: "Choosing the largest or newest model before writing the robot contract.",
          correction:
            "Start from observation fields, action semantics, rate, resources, embodiment support, evaluation, and recovery; version recency becomes one maintenance signal rather than the decision rule.",
        },
        {
          mistake: "Treating an official benchmark result as expected performance on a new robot.",
          correction:
            "Preserve the benchmark's robot, data, tasks, resets, metrics, and runtime scope, and label local performance unknown until the frozen local suite is executed.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is LeRobot 0.6 not directly comparable with one OpenVLA checkpoint?",
          answer:
            "LeRobot is a framework spanning data, policies, training, evaluation, rollout, and hardware integration, while an OpenVLA checkpoint is one model artifact with a particular processor and action contract.",
        },
        {
          question: "What output boundary prevents Robotics-ER 1.6 from being treated as a low-level controller?",
          answer:
            "Its official model card declares text output; any physical action must pass through a separately typed and validated VLA or robot-skill interface.",
        },
        {
          question: "What label should a matrix cell receive when official material does not establish local GPU memory?",
          answer:
            "Unknown, followed by a measurement plan; parameter count or a third-party anecdote should not be silently substituted.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A layered comparison is materially useful here because framework, reasoner, policy, processor, adapter, controller, and safety owner otherwise collapse into one misleading model list.",
      },
    },
    {
      dayId: 128,
      mentalModel:
        "Cross-embodiment training is multilingual translation with machinery: the task may be shared, but every body retains its own sensors, grammar of action, calibration, and legal motion.",
      explanation: [
        "An embodiment is the physical and computational body that gives numbers meaning: cameras and their poses, ordered state fields, joints, tool, control mode, action dimension, coordinate frame, units, rate, limits, and latency. Two datasets can both use a key named `action` while one stores joint-position targets in radians and the other stores Cartesian deltas in metres plus gripper effort. Concatenating those rows without an embodiment ID and conversion contract teaches contradictory targets that no sampling trick can repair.",
        "Language provides task context only when it is aligned to the correct episode or temporal event. “Put the red cup in the tray” can describe a whole attempt, while a correction such as “open the gripper now” belongs to a particular interval. Camera-grounded text must name the view it describes, and task vocabulary should be reviewed for aliases, negation, object identity, and success meaning. Adding fluent captions after collection does not prove the action sequence actually performs the captioned task.",
        "A mixture has both a schema and a sampling policy. If robot A supplies 8,000 episodes and robot B supplies 2,000, uniform episode sampling yields an expected 80/20 contribution. Equal embodiment sampling changes it to 50/50 but repeats B examples more often, potentially overfitting them. Report the planned and observed draws by embodiment, task, outcome, operator, and condition; otherwise one large source can dominate loss while the final model is advertised as cross-embodiment.",
        "Use a shared canonical layer only for semantics that can be stated honestly, then keep embodiment adapters around it. A dataset transform maps raw fields into named policy features; an output adapter converts the model representation back into this robot's ordered command. Preserve raw source, version each transform, compute training-only statistics by field, and reject rows that cannot be converted without guessing. Cross-embodiment learning does not erase calibration, controller, collision, or safety ownership.",
      ],
      keyTerms: [
        {
          term: "Robot embodiment",
          meaning:
            "The robot-specific combination of body, sensors, state representation, action interface, calibration, rate, limits, and environment interaction.",
          physicalExample:
            "A six-joint arm with a parallel gripper and wrist camera has a different embodiment contract from a mobile manipulator with a lift and base velocity controller.",
        },
        {
          term: "Modality configuration",
          meaning:
            "Versioned metadata that maps stored image, state, action, and language fields to the named inputs and outputs expected by a policy.",
          physicalExample:
            "A GR00T modality file states which array slice is end-effector translation, rotation, and gripper state for the selected embodiment tag.",
        },
        {
          term: "Sampling weight",
          meaning:
            "The target probability that a dataset, embodiment, task, or subgroup contributes an example during training.",
          physicalExample:
            "A loader draws the small arm and large arm with probability 0.5 each even though their stored episode counts differ four to one.",
        },
        {
          term: "Task annotation",
          meaning:
            "Language tied to a declared episode, frame interval, camera view, or event and used as policy context or a supervised target.",
          physicalExample:
            "The episode task says “stack two cubes,” while a timestamped correction says “release the blue cube” only during the final placement.",
        },
        {
          term: "Dataset provenance",
          meaning:
            "Traceable origin and transformation history for data, including collector, robot, software, license, filtering, repair, and derived versions.",
          physicalExample:
            "A training row links back to episode B-014, teleoperator 3, calibration C7, source checksum, and transform revision 2.",
        },
        {
          term: "Robot embodiment adapter",
          meaning:
            "A tested conversion between one robot's native observation/action contract and the representation consumed or emitted by a policy.",
          physicalExample:
            "One adapter orders a Panda's Cartesian delta and gripper fields; another maps an SO-101's joint targets without pretending the vectors have the same semantics.",
        },
      ],
      physicalExamples: [
        {
          title: "Same sentence, different command bodies",
          scenario:
            "A Panda arm and an SO-101 both demonstrate “move the red cube left,” but one log stores seven joint targets and the other stores end-effector deltas plus a gripper value.",
          lookFor:
            "The shared task text stays comparable, while embodiment IDs, action schemas, transforms, units, rates, and decoders remain distinct and independently tested.",
        },
        {
          title: "A large dataset silences a rare robot",
          scenario:
            "A mixture contains four times as many successful episodes from robot A as robot B and is shuffled uniformly by episode.",
          lookFor:
            "Observed batches approach 80/20, so metrics and gradients mostly describe A; reweighting changes exposure and must be paired with duplication and overfitting checks for B.",
        },
      ],
      workedExample: {
        title: "Design a two-robot mixture without corrupting action meaning",
        setup:
          "Robot A has 8,000 episodes of seven joint-position targets at 20 Hz. Robot B has 2,000 episodes of six Cartesian deltas plus one gripper command at 10 Hz.",
        steps: [
          "Write separate raw schemas with ordered component names, dtype, shape, unit, frame, command mode, rate, absolute and delta limits, calibration identity, and timestamp convention.",
          "Assign stable embodiment IDs and transform versions; keep the original action arrays immutable rather than overwriting both into an unexplained seven-number column.",
          "Define shared features only where meaning agrees, such as normalized RGB views and episode-level task text, then implement separate state and action adapters for A and B.",
          "Calculate uniform episode exposure: `8,000 / 10,000 = 0.80` for A and `2,000 / 10,000 = 0.20` for B; calculate equal-embodiment exposure as 0.50 and 0.50.",
          "Choose a declared mixture, log actual sampled counts by embodiment and task, and inspect whether repeated B episodes create a train-versus-validation gap.",
          "Round-trip five held-out rows through each adapter and require exact field order plus toleranced numeric recovery before either source enters the training view.",
        ],
        result:
          "The mixture can share task semantics and selected visual features while every command retains an auditable route back to one robot's physical contract.",
        takeaway:
          "Cross-embodiment scale comes from explicit translation and measured sampling, not from stacking heterogeneous numeric arrays under common key names.",
      },
      handsOn: {
        setup:
          "Create ten synthetic rows for each of two imaginary arms. Use harmless numbers and a local table or short script; no robot connection or model training is required.",
        steps: [
          "Document each arm's cameras, ordered state, ordered action, units, frames, rate, limits, embodiment ID, calibration ID, and source episode.",
          "Give both arms two shared task phrases, then add one episode-level annotation, one timestamped correction, and one camera-specific description with unambiguous scope.",
          "Write adapter pseudocode that maps each raw schema into canonical named features and maps predicted output back to that arm without discarding units or order.",
          "Produce 20 mock sample draws under uniform-row and equal-embodiment rules, compare planned with observed shares, and state why the small count can deviate.",
          "Inject a degree-versus-radian row, missing embodiment ID, renamed camera, and action-length mismatch; require quarantine with a named reason rather than coercion.",
          "Save a mixture manifest containing source checksums, licenses, transforms, weights, exclusions, statistics split, and the five round-trip cases for peer review.",
        ],
        observe:
          "The exercise reveals that shared language and array length are weak compatibility signals; most physical meaning lives in metadata, adapters, and sampling evidence.",
        doneWhen:
          "Both sources retain reconstructable physical semantics, corrupt rows fail closed, planned and observed mixture weights are visible, and held-out adapter round trips pass.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Build and review a multi-robot training manifest whose modality transforms, language alignment, sampling logs, provenance, and per-embodiment action adapters make every learned target physically interpretable.",
        interviewPrompt:
          "Two robot datasets both expose a seven-value action and the same English tasks. Explain why they cannot simply be concatenated, how you would design adapters and sampling weights, and which round-trip tests block training.",
      },
      commonMistakes: [
        {
          mistake: "Assuming equal action length means equal action semantics.",
          correction:
            "Compare ordered component names, command mode, unit, frame, rate, limits, and calibration; preserve separate embodiment adapters even when shapes happen to match.",
        },
        {
          mistake: "Reporting only the number of mixture episodes.",
          correction:
            "Publish planned and observed sampling shares by embodiment, task, outcome, and condition, because training exposure—not storage count alone—drives the optimization.",
        },
        {
          mistake: "Treating generated language as ground truth for a trajectory.",
          correction:
            "Validate every task or event annotation against episode timing and outcome, retain provenance and confidence, and quarantine descriptions whose physical referent cannot be established.",
        },
      ],
      checkQuestions: [
        {
          question: "What remains robot-specific after a shared task representation is chosen?",
          answer:
            "Sensor layout, calibration, feature order, state/action representation, units, frames, rate, limits, controller behavior, and the adapters that translate policy data into valid commands.",
        },
        {
          question: "What training share results from uniform episode sampling over 8,000 A and 2,000 B episodes?",
          answer:
            "The expected shares are 80% A and 20% B, subject to finite-sample variation and any filtering performed by the loader.",
        },
        {
          question: "Why can equal-embodiment weighting also create a problem?",
          answer:
            "The smaller source is sampled repeatedly, so it can overfit; training and held-out metrics plus actual draw counts must be inspected per embodiment.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A versioned schema table, sampling ledger, and adapter round-trip cases expose this data problem more precisely than another generic policy illustration.",
      },
    },
    {
      dayId: 129,
      mentalModel:
        "A checkpoint is one sealed component in a keyed assembly: configuration, processors, feature schema, statistics, robot adapter, runtime, and golden tests must fit before the output has meaning.",
      explanation: [
        "A weight file loading without an exception proves only that bytes reached an object. A usable policy artifact also needs the matching architecture configuration, tokenizer or language processor, image transforms, temporal packing, policy preprocessor, action postprocessor, dataset statistics, dtype, and base-adapter pairing. Pin an immutable revision or checksum for every artifact. A moving branch name, friendly model name, or directory called `latest` cannot support a reproducible deployment decision.",
        "Validate the input contract before inference. Confirm required keys, batch and history dimensions, camera names and order, resolution or crop behavior, color convention, state-field order, language serialization, timestamp age, and missing-value policy. Processors are executable model logic: changing resize, normalization, tokenization, device dtype, or action de-normalization can alter behavior while the core weights stay identical. Therefore processor files and their configuration travel with the checkpoint and receive their own compatibility tests.",
        "A golden observation is a small non-sensitive fixture saved with expected intermediate shapes, finite-value summaries, and output tolerance. It does not prove task success, but it catches incompatible preprocessing, missing adapter weights, changed field order, corrupted files, or an accidental normalization override before rollout. Keep a second negative fixture that intentionally swaps cameras or statistics and require startup rejection; a warning followed by motion is not a compatibility gate.",
        "Deployment adds time and authority boundaries. A local or remote policy server receives a timestamped observation and returns an action chunk carrying request identity, source-observation time, model and processor versions, and expiry. The robot-side adapter validates the response, drops late or superseded chunks, and sends only bounded commands through the commissioned controller. A REST 200 response, nonempty tensor, server heartbeat, or smooth simulator video remains transport or component evidence—not observed physical completion.",
      ],
      keyTerms: [
        {
          term: "Policy checkpoint",
          meaning:
            "Saved model state associated with a specific architecture and training lineage, sometimes accompanied by separate adapter weights.",
          physicalExample:
            "An OpenVLA base revision and its LoRA adapter must be paired with the configuration used to create the adapter.",
        },
        {
          term: "Processor",
          meaning:
            "A versioned transformation pipeline that prepares observations for a policy or converts model output into the policy's declared action representation.",
          physicalExample:
            "The preprocessor orders cameras and normalizes joint state; the postprocessor converts a normalized action chunk back to named fields.",
        },
        {
          term: "Golden observation",
          meaning:
            "A fixed input fixture with expected preprocessing metadata and toleranced output used to detect artifact or interface drift.",
          physicalExample:
            "One saved tabletop image pair and joint vector must produce the recorded input shape, finite action dimension, and stable offline summary.",
        },
        {
          term: "Compatibility manifest",
          meaning:
            "A machine-readable inventory of required model, processor, feature, statistics, adapter, runtime, and robot-interface versions and hashes.",
          physicalExample:
            "Startup refuses a policy bundle when the front-camera schema hash differs from the value signed into the release manifest.",
        },
        {
          term: "Policy server",
          meaning:
            "A process that hosts inference behind a request-response interface while robot-side software retains command validation and execution ownership.",
          physicalExample:
            "An edge GPU returns a timestamped action chunk over the network, and the arm computer rejects it after its freshness deadline.",
        },
        {
          term: "Artifact hash",
          meaning:
            "A content-derived identifier used to detect a changed or corrupted file rather than relying only on its path or display name.",
          physicalExample:
            "The model configuration passes only when its SHA-256 value matches the reviewed manifest.",
        },
      ],
      physicalExamples: [
        {
          title: "Correct weights, reversed cameras",
          scenario:
            "A two-camera checkpoint loads successfully after a deployment rename maps the wrist feed to `front` and the front feed to `wrist`.",
          lookFor:
            "Shape checks alone pass, but the golden fixture or explicit camera-identity manifest fails before inference is authorized for rollout.",
        },
        {
          title: "Useful action arrives after the scene changed",
          scenario:
            "A remote policy predicts a grasp from observation O-81, but network congestion delivers the chunk after the operator moved the object and O-84 is current.",
          lookFor:
            "Request identity, source timestamp, generation, and expiry make the old chunk rejectable instead of allowing a plausible but stale command into the queue.",
        },
      ],
      workedExample: {
        title: "Build a fail-closed startup gate for one policy bundle",
        setup:
          "A reviewed baseline expects two 224-by-224 RGB cameras, eight ordered state values, one task string, and a seven-value action. An adapter checkpoint is added for a local task.",
        steps: [
          "Create a manifest for base weights, adapter weights, architecture config, processor config, dataset-statistics file, robot profile, runtime dependencies, and golden fixtures; record immutable revisions and hashes.",
          "At startup, verify every file hash and require the adapter's declared base identifier to match the loaded base rather than accepting a merely shape-compatible pairing.",
          "Validate observation keys, camera identities and order, image shape and color convention, state component order, task encoding, dtype, history length, and timestamp age before calling the model.",
          "Run the golden observation and compare processor-stage shapes, finite-value checks, action dimension, and saved output summary within a declared tolerance; keep the controller disconnected.",
          "Swap the two cameras and load statistics from another robot as negative cases; require a nonzero startup result, named diagnostic, and no policy-ready state.",
          "When serving remotely, add request ID, observation timestamp, model generation, expiry, timeout, cancellation, and supersession checks before the robot-side postprocessor and command guard.",
        ],
        result:
          "Only the exact reviewed artifact assembly reaches an offline policy-ready state, and stale or incompatible outputs remain unable to cross into robot control.",
        takeaway:
          "Checkpoint loading is an artifact-compatibility transaction followed by semantic and timing tests, not a successful call to a deserializer.",
      },
      handsOn: {
        setup:
          "Use a small local model fixture or a fabricated manifest with tiny JSON and tensor metadata. Do not download proprietary artifacts or connect a robot for this interface exercise.",
        steps: [
          "Inventory the base, adapter, config, processor, statistics, robot profile, runtime, and evaluation files required by one selected policy path.",
          "Record content hashes, repository revisions, expected feature names and shapes, dtype, camera order, action dimension, normalization ID, and allowed robot profile in one manifest.",
          "Create one golden observation summary with non-sensitive images or numeric stand-ins and expected preprocessing shapes plus a bounded offline output assertion.",
          "Write startup checks for missing file, changed hash, wrong adapter base, renamed key, reversed camera order, stale timestamp, NaN input, and wrong action dimension.",
          "Model a remote response envelope with request, generation, source time, expiry, model, processor, and adapter IDs; test late, duplicate, and superseded responses.",
          "Capture the exact failure code for every injection and confirm that none produces a policy-ready or command-eligible state.",
        ],
        observe:
          "Many errors survive a file-load and tensor-shape check, while identity, semantics, processor, golden-output, and freshness gates reveal them before a rollout begins.",
        doneWhen:
          "A peer can reconstruct the exact bundle, the positive fixture passes offline, all incompatible or stale cases fail closed, and no network response is confused with robot completion.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_PHYSICAL_AI],
        workExample:
          "Package a learned policy as a reproducible artifact set, implement strict observation and processor validation, and integrate local or remote inference behind freshness, generation, and robot-side command gates.",
        interviewPrompt:
          "A VLA checkpoint loads and returns the expected action shape, but the robot fails. Walk through base-adapter identity, processors, camera order, statistics, golden fixtures, remote timing, and the evidence needed before blaming the weights.",
      },
      commonMistakes: [
        {
          mistake: "Calling a checkpoint compatible because the framework reported no missing keys.",
          correction:
            "Also verify immutable artifact identity, architecture, processor, feature semantics, statistics, base-adapter pair, golden behavior, decoding, timing, and robot profile.",
        },
        {
          mistake: "Recreating preprocessing from memory in the deployment service.",
          correction:
            "Version and load the reviewed processor artifact with the model, then assert its camera, resize, tokenization, normalization, and postprocessing stages against golden fixtures.",
        },
        {
          mistake: "Executing the next action returned by a healthy policy server.",
          correction:
            "Bind the response to its observation, generation, expiry, and request; discard late or superseded chunks and keep final command authority on the robot side.",
        },
      ],
      checkQuestions: [
        {
          question: "What does a clean checkpoint load establish?",
          answer:
            "It establishes limited structural compatibility for the loaded bytes; it does not establish correct processors, semantics, action decoding, latency, task performance, or safety.",
        },
        {
          question: "Why save a deliberately invalid golden case?",
          answer:
            "It proves the gate detects a known camera, statistics, schema, or pairing defect instead of accepting every input that happens to have a legal tensor shape.",
        },
        {
          question: "Which timestamp should accompany a remote action chunk?",
          answer:
            "At minimum the source observation time, plus request/generation identity and expiry, so the robot can reject output derived from stale or superseded state.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "The artifact and deployment chain benefits from a failure-path view because a valid file load can still diverge at processor, camera, statistics, network-freshness, or robot-adapter boundaries.",
      },
    },
    {
      dayId: 130,
      mentalModel:
        "Parameter-efficient tuning is a detachable correction plate on a frozen machine: its mounting points, size, data, and measured side effects matter more than the fact that it is small.",
      explanation: [
        "Low-Rank Adaptation represents a weight update with two smaller trainable matrices while the selected base matrix remains frozen. For a layer mapping 1,024 inputs to 1,024 outputs, a full update changes 1,048,576 values; rank-8 LoRA uses `8 × (1,024 + 1,024) = 16,384`, or 1.5625% for that layer before optimizer state and other trainable components. The saving applies only to targeted matrices. Activations, frozen-weight loading, optimizer buffers, image batches, and framework overhead still consume memory.",
        "Support is implementation-specific. OpenVLA's maintained repository documents LoRA, quantized LoRA, full tuning, and a newer OpenVLA-OFT path; those recipes have different action and performance behavior. GR00T and openpi expose their own supported fine-tuning configurations, and a LeRobot policy may freeze different encoders or use full training rather than generic LoRA. Never add an adapter library to arbitrary modules and call the resulting run project-supported. Start from the exact maintained recipe for the selected version.",
        "Keep the baseline operational before training. Save the untouched base identifier, processor and statistics, run the frozen suite, and preserve outputs. Define training, validation, and final evaluation episodes by group before adaptation; record dataset version, target modules, rank, scaling, dropout, precision, batch and accumulation, optimizer, learning rate, seed, checkpoints, and selection rule. Training loss and action-token accuracy can improve while closed-loop task success, latency, or an old capability regresses.",
        "The adapter is a release artifact, not a magical patch. Pair it with one base revision, configuration, processor set, dataset lineage, and license; measure merged and unmerged runtime if both are candidates. Compare the adapted and baseline policies on identical resets, including familiar tasks, held-out conditions, old tasks, malformed inputs, and deadline tests. Promote only through predeclared gates; a smaller trainable parameter count neither guarantees generalization nor reduces the need for guarded deployment.",
      ],
      keyTerms: [
        {
          term: "Low-Rank Adaptation",
          meaning:
            "A parameter-efficient method that freezes selected base weights and learns low-rank matrices whose product contributes an update.",
          physicalExample:
            "An OpenVLA LoRA run trains adapters on selected linear layers while the reviewed base checkpoint remains unchanged.",
        },
        {
          term: "Rank",
          meaning:
            "The inner dimension of the low-rank update, controlling adapter parameter capacity and associated compute and memory.",
          physicalExample:
            "Raising rank from 8 to 32 gives a targeted layer four times as many adapter values, not four times guaranteed task success.",
        },
        {
          term: "Target module",
          meaning:
            "A specifically named model component to which an adapter or another trainable update is attached.",
          physicalExample:
            "The run manifest lists the exact attention and projection modules selected by the maintained recipe rather than saying only “tuned the VLA.”",
        },
        {
          term: "Frozen baseline",
          meaning:
            "The unchanged pretrained artifact and processor configuration evaluated as the reference against which adaptation is judged.",
          physicalExample:
            "The adapter can be disabled to rerun the same cup-placement cases using the exact base policy.",
        },
        {
          term: "Trainable parameter count",
          meaning:
            "The number of values updated by optimization, distinct from total loaded parameters and total training-memory demand.",
          physicalExample:
            "A run reports 16,384 adapter values for one layer while still loading the full base and storing activations.",
        },
        {
          term: "Adapter artifact",
          meaning:
            "Saved learned update plus metadata that must be paired with its compatible base, processor, data lineage, and evaluation record.",
          physicalExample:
            "Deployment rejects `cup_lora_r8` when its manifest names a different OpenVLA base revision.",
        },
      ],
      physicalExamples: [
        {
          title: "Local cup adaptation forgets an old tray",
          scenario:
            "An adapter trained on fifty blue-cup episodes improves that task but causes the previously working red-cup-to-tray task to fail.",
          lookFor:
            "The unchanged baseline, old-task regression slice, and fixed resets expose forgetting that training loss on the new examples cannot show.",
        },
        {
          title: "Small adapter, large training footprint",
          scenario:
            "A rank-8 run updates few weights but still exhausts GPU memory when image batches and activation history are increased.",
          lookFor:
            "Parameter arithmetic is reported separately from measured peak memory, throughput, checkpoint storage, optimizer state, and wall-clock training time.",
        },
      ],
      workedExample: {
        title: "Scope a rank-8 adaptation without sacrificing the baseline",
        setup:
          "A supported recipe targets one 1,024-by-1,024 projection and the team has grouped train, validation, and final episodes for a new tabletop task.",
        steps: [
          "Calculate full values as `1,024 × 1,024 = 1,048,576` and rank-8 adapter values as `8 × (1,024 + 1,024) = 16,384`, then compute `16,384 / 1,048,576 = 1.5625%` for this layer.",
          "Verify the selected model version officially supports the recipe, identify exact target-module names, and record any other unfrozen parameters so the real trainable total is measured by the framework.",
          "Hash the base, processors, statistics, and grouped data split; run the baseline on the final suite once and lock those outputs away from training decisions.",
          "Train adapters with versioned configuration and periodic validation checkpoints, logging loss, task-level validation results, peak memory, throughput, time, and every failed or interrupted run.",
          "Select one checkpoint using the predeclared validation rule, then evaluate baseline and adapter on identical final resets for new task, old task, held-out factors, invalid inputs, and latency.",
          "Keep the adapter separate and issue revise or reject if any mandatory old-task, action-guard, or deadline gate regresses, even when average new-task success rises.",
        ],
        result:
          "The experiment quantifies parameter efficiency while retaining an auditable base comparison and a reversible adapter artifact whose promotion depends on rollout evidence.",
        takeaway:
          "LoRA reduces the optimized update; it does not automatically reduce total system risk, guarantee memory fit, or turn training metrics into deployment acceptance.",
      },
      handsOn: {
        setup:
          "Use an official configuration from the selected project and either a tiny supported dry run or a no-training configuration review. Do not invent target modules for a production candidate.",
        steps: [
          "Pin the project release, base checkpoint, processor set, dataset version, and maintained fine-tuning entry point; note whether the supported method is LoRA, another adapter, partial freezing, or full tuning.",
          "List every trainable parameter group and calculate low-rank counts for two ranks, then compare with the framework-reported trainable total and explain any difference.",
          "Create group-separated train, validation, and untouched evaluation manifests with task, object, scene, operator, and embodiment counts.",
          "Record rank, targets, scaling, dropout, precision, batch, accumulation, optimizer, learning rate, seed, stop rule, checkpoint interval, and measured resource fields.",
          "Run or simulate checkpoint selection using validation-only records, then compare the chosen adapter and frozen base on one paired result table with old-task regressions visible.",
          "Package the adapter manifest so a wrong base revision, processor, statistics set, or unsupported runtime fails the Day 129 compatibility gate.",
        ],
        observe:
          "A correct plan exposes implementation-specific support, hidden trainable groups, data leakage risks, and regressions that the low adapter-size ratio does not describe.",
        doneWhen:
          "The base remains immutable and runnable, the adapter is reproducibly paired and selected without final-test leakage, and release depends on fixed rollout, latency, and guard thresholds.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Translate a maintained VLA fine-tuning recipe into a reproducible adapter run, preserve the frozen baseline, account for actual trainable and runtime resources, and gate the resulting artifact on paired task and regression evidence.",
        interviewPrompt:
          "LoRA updates 1.6% of one layer and training accuracy improves. Explain what that number omits, how you would choose targets and splits, and why the adapter can still regress rollout behavior or miss deployment memory.",
      },
      commonMistakes: [
        {
          mistake: "Assuming every current VLA supports the same LoRA switch.",
          correction:
            "Use the selected project's version-matched maintained recipe and record its actual target modules, action path, dependencies, and unsupported combinations.",
        },
        {
          mistake: "Equating adapter storage with peak training or inference memory.",
          correction:
            "Measure loaded base weights, activations, optimizer state, batches, caches, runtime buffers, and merged or unmerged execution separately from saved adapter bytes.",
        },
        {
          mistake: "Selecting the final adapter from the test suite.",
          correction:
            "Choose hyperparameters and checkpoint from training and validation evidence, preserve the final suite untouched, and compare it once under the frozen decision rule.",
        },
      ],
      checkQuestions: [
        {
          question: "How many rank-8 adapter values represent one 1,024-by-1,024 update matrix pair?",
          answer:
            "There are `8 × (1,024 + 1,024) = 16,384` adapter values, excluding any other target layers, trainable parameters, and optimizer state.",
        },
        {
          question: "Why can a small adapter still harm old behavior?",
          answer:
            "Its applied update changes activations through selected modules and can bias decisions toward the adaptation data; frozen old-task rollouts are needed to detect the regression.",
        },
        {
          question: "What makes an adapter reversible?",
          answer:
            "The base stays immutable, the adapter is stored separately with exact pairing metadata, and evaluation and deployment can disable it without reconstructing the baseline.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The low-rank parameter arithmetic and base-versus-adapter paired ledger are clearer as inspectable calculations and tables than as an additional architecture visual.",
      },
    },
    {
      dayId: 131,
      mentalModel:
        "De-normalization opens a locked shipping crate: only after each value regains its name, unit, frame, time, and limits can the controller decide whether it is a usable command.",
      explanation: [
        "Normalization maps fields into numeric ranges convenient for learning; it does not standardize their physical meaning. A z-score transform stores `x_norm = (x - mean) / standard_deviation`, and its inverse is `x = x_norm × standard_deviation + mean`. Other policies use min-max, quantile, bounded, or model-specific statistics. Compute statistics from the declared training split, save them per named feature, and load the exact policy-supported processor. Reusing one field's statistics for another can produce finite, in-range-looking numbers with the wrong physical effect.",
        "Decode into a typed action object before applying generic checks. Name every component, representation, unit, coordinate frame, command mode, reference point, action horizon, source time, and intended control period. An array `[0.1, 0.0, 0.0]` could mean metres of translation, radians of rotation, velocity, or an absolute target. Clipping the array to `[-1, 1]` cannot resolve that ambiguity, and swapping two legal joint values can remain inside all scalar limits while moving the wrong axis.",
        "A command guard evaluates more than absolute bounds. Reject NaN or infinity, wrong dimension, missing schema ID, stale observation or action, invalid frame, unauthorized mode, and unavailable controller. Then check soft and hard joint or workspace bounds, per-step and per-second change, speed and acceleration, collision or keep-out constraints, gripper/load rules, action-chunk continuity, and current task preconditions. Send accepted commands through the existing commissioned controller and independently monitored stop behavior; the VLA must not bypass them.",
        "Clipping should be an explicit policy, not a default disguise for errors. A tiny numerical overshoot may be bounded and logged when the controller contract permits it; a large jump, field-order mismatch, or stale chunk should be rejected and trigger a task-specific fallback. “Send zeros” is unsafe as a universal fallback because zero can mean open gripper, zero torque, origin target, or no velocity depending on mode. Define hold, controlled stop, queue clear, human handoff, or another response with the system owner and test it outside normal operation.",
      ],
      keyTerms: [
        {
          term: "Normalization statistics",
          meaning:
            "Training-derived values such as mean, standard deviation, minima, maxima, or quantiles used by a named processor for specific features.",
          physicalExample:
            "The elbow target uses its own training mean and scale rather than the gripper's numerically convenient range.",
        },
        {
          term: "De-normalization",
          meaning:
            "The inverse processor operation that restores a model output to the declared action representation before physical validation.",
          physicalExample:
            "A normalized elbow value of 1.5 becomes 0.7 rad using mean 0.4 rad and standard deviation 0.2 rad.",
        },
        {
          term: "Typed action",
          meaning:
            "A command whose components, order, units, frame, mode, timing, and intended controller are explicit rather than implied by array position.",
          physicalExample:
            "The object names `elbow_position_rad`, `wrist_position_rad`, and `gripper_width_m` and includes source time and schema revision.",
        },
        {
          term: "Rate limit",
          meaning:
            "A bound on how quickly a command component may change per step or per unit time, independent of its absolute range.",
          physicalExample:
            "An elbow target inside joint limits is rejected because it jumps 0.25 rad when the approved step limit is 0.10 rad.",
        },
        {
          term: "Stale action",
          meaning:
            "A once-valid command whose source state or execution deadline is too old for the current physical situation.",
          physicalExample:
            "A grasp chunk generated before the cup was moved is discarded even though every numeric value remains finite.",
        },
        {
          term: "Command guard",
          meaning:
            "Robot-side validation that decides whether a decoded proposal may enter the commissioned controller and selects a defined failure response.",
          physicalExample:
            "The guard checks schema, clock, frame, limits, collision state, authority, and controller readiness before accepting one chunk.",
        },
      ],
      physicalExamples: [
        {
          title: "Gripper statistics drive an elbow",
          scenario:
            "A deployment processor applies a gripper mean and scale to the second action component after a field-order change.",
          lookFor:
            "Schema and per-field statistics identity reject the mismatch before a finite decoded value can be mistaken for a valid elbow command.",
        },
        {
          title: "Legal target, illegal jump",
          scenario:
            "The elbow currently commands 0.50 rad; the VLA proposes 0.70 rad, which lies inside the joint's absolute range but exceeds the 0.10 rad-per-step limit.",
          lookFor:
            "The guard distinguishes absolute validity from temporal validity and follows the declared reject or bounded-response rule rather than silently executing the jump.",
        },
      ],
      workedExample: {
        title: "Decode one action and stop it at the first violated contract",
        setup:
          "A two-field policy outputs normalized elbow and gripper values `[1.5, -0.5]`. The elbow mean is 0.4 rad with scale 0.2 rad; the gripper mean is 0.03 m with scale 0.02 m. Previous elbow target is 0.50 rad and its step limit is 0.10 rad.",
        steps: [
          "Verify schema ID, action dimension two, ordered names `[elbow_position, gripper_width]`, finite values, source timestamp, and the expected z-score processor revision.",
          "Decode elbow as `1.5 × 0.2 + 0.4 = 0.70 rad` and gripper as `-0.5 × 0.02 + 0.03 = 0.02 m`, keeping names and units attached.",
          "Check the absolute joint and gripper bounds; suppose both 0.70 rad and 0.02 m lie inside their allowed ranges.",
          "Calculate the elbow change as `0.70 - 0.50 = 0.20 rad`, which exceeds the declared 0.10 rad-per-step limit even though the target passed absolute bounds.",
          "Reject the whole coupled action under the chosen atomic rule, clear any dependent queued chunk entries, emit the rate-limit failure with original and decoded values, and enter the reviewed fallback.",
          "Repeat with elbow normalized value 1.0, which decodes to 0.60 rad and reaches the next frame, collision, authority, and controller-readiness gates before eligibility.",
        ],
        result:
          "The first proposal is rejected for a measurable temporal violation; the corrected proposal is merely command-eligible after all guards, not yet proven physically completed.",
        takeaway:
          "A decoded value can be mathematically correct and inside its absolute range while still being stale, too abrupt, semantically wrong, or unsafe for the current state.",
      },
      handsOn: {
        setup:
          "Implement or table-test a pure offline decoder for five synthetic fields. The output must stop at a mock controller boundary and must never open a hardware device.",
        steps: [
          "Define ordered state and action schemas with names, dtype, unit, frame, mode, training-statistics ID, absolute range, step limit, freshness limit, and controller destination.",
          "Implement normalization and inverse operations per field, then assert round-trip recovery for boundary, midpoint, negative, and ordinary values within a stated tolerance.",
          "Return a typed action carrying schema, model, processor, source time, generation, and component metadata instead of a bare numeric array.",
          "Add checks for missing field, reordered field, NaN, infinity, zero scale, wrong statistics ID, stale source, absolute violation, delta violation, and unavailable controller.",
          "Choose and document atomic versus partial acceptance, clipping tolerance, queue-clearing behavior, fallback, operator signal, and evidence fields for every rejection class.",
          "Run the complete fault table, verify zero mock-controller calls for rejected actions, and separately record accepted, eligible, commanded, and observed states.",
        ],
        observe:
          "Round-trip arithmetic catches statistics errors, while typed metadata and temporal checks catch dangerous cases that scalar clipping cannot distinguish.",
        doneWhen:
          "Every field round-trips by name and unit, every injected fault has a deterministic disposition, rejected cases make no controller call, and acceptance is not mislabeled physical success.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_HMI, ROLE_PHYSICAL_AI],
        workExample:
          "Own the robot-side action contract that loads policy statistics, creates typed commands, enforces freshness and physical bounds, integrates with the commissioned controller, and exposes rejection and fallback state to operators.",
        interviewPrompt:
          "A VLA's normalized output is finite and de-normalizes inside joint limits, yet the motion is wrong. Trace field identity, statistics, frame, mode, timestamp, rate, collision, authority, and observed-state evidence.",
      },
      commonMistakes: [
        {
          mistake: "Using one global mean and scale for an action vector.",
          correction:
            "Bind statistics to versioned named fields and verify processor identity, because components with different units and distributions require their own supported transform.",
        },
        {
          mistake: "Calling any clipped action safe.",
          correction:
            "Clipping only addresses a declared numeric boundary; semantic order, frame, staleness, rate, collision, mode, authority, and controller constraints still decide eligibility.",
        },
        {
          mistake: "Using an all-zero action as a universal fallback.",
          correction:
            "Define fallback from the real command mode and system risk—hold, controlled stop, clear queue, or handoff—and test its physical meaning with the responsible controller and safety owners.",
        },
      ],
      checkQuestions: [
        {
          question: "With mean 0.4 rad, standard deviation 0.2 rad, and normalized value 1.5, what is the decoded target?",
          answer:
            "The target is `1.5 × 0.2 + 0.4 = 0.70 rad` before command-guard checks.",
        },
        {
          question: "Why is an in-range decoded joint target not necessarily eligible?",
          answer:
            "It may have the wrong identity, unit, frame, mode, time, step rate, collision state, authority, or controller readiness despite passing absolute bounds.",
        },
        {
          question: "What evidence distinguishes command eligibility from completion?",
          answer:
            "Eligibility is the guard decision; completion requires correlated controller acceptance and fresh measured physical state or a task-specific terminal observation.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A decode-and-guard failure path materially shows how a numerically valid normalized action can be rejected later for field, time, rate, frame, collision, authority, or controller reasons.",
      },
    },
    {
      dayId: 132,
      mentalModel:
        "Generalization is a labelled stress grid, not a surprise box: freeze what changes, hold the rest steady, and keep every abstention, intervention, and wrong action in its own denominator.",
      explanation: [
        "Define the intended operating distribution before testing outside it. Factors can include object identity and appearance, pose, background, lighting, camera viewpoint, task wording, distractors, and—only when a compatible adapter exists—robot embodiment. A held-out object must be absent from training and tuning views, not merely photographed from a new angle in the same episode family. Freeze case IDs, assets, resets, success criteria, timeouts, and prohibited behavior before adapter results are visible.",
        "Vary one factor at a time to locate a weakness, then include selected realistic combinations to expose interactions. A policy may handle a new mug and a patterned mat separately but fail when both change. Prompt tests should separate paraphrase, synonyms, negation, irrelevant text, ambiguity, and impossible requests because each calls for different engineering work. Do not score a clarified ambiguous command as ordinary autonomous success; clarification, safe rejection, intervention, wrong action, and timeout are distinct outcomes.",
        "Report per-cell counts and uncertainty rather than one pooled percentage. Eighteen successes in twenty familiar-object trials is 90%; nine in twenty novel-object trials is 45%, a 45-percentage-point gap. Combining them gives 27/40 or 67.5%, which hides where the policy fails. Add p50 and p95 end-to-end latency, deadline misses, guard rejections, interventions, completion time, and failure stage so a superficially successful but operationally late policy is visible.",
        "Out-of-distribution detection is not solved by asking the model whether it is confident. Use observable compatibility checks, perception uncertainty where calibrated, prompt ambiguity rules, action-distribution or ensemble signals when validated, and conservative system boundaries. Freeze thresholds on validation data, then measure false accepts and false rejects. When the system cannot bind an instruction to a fresh entity or produce an eligible action, clarification, bounded fallback, or rejection is a valid outcome and must not be relabeled failure-free autonomy.",
      ],
      keyTerms: [
        {
          term: "Deployment distribution shift",
          meaning:
            "A measured difference between training conditions and evaluation or operating conditions that can change policy behavior.",
          physicalExample:
            "Training images use a plain table, while deployment adds patterned mats and strong side lighting.",
        },
        {
          term: "Held-out factor",
          meaning:
            "A declared object, scene, prompt, viewpoint, operator, or embodiment condition excluded from training and tuning for independent evaluation.",
          physicalExample:
            "All yellow mugs are reserved for the final object-generalization cells before collection begins.",
        },
        {
          term: "Out-of-distribution",
          meaning:
            "A condition outside the data and assumptions under which the policy and its evaluation evidence were established.",
          physicalExample:
            "A tool absent from training appears beside two similar target objects under an unseen camera pose.",
        },
        {
          term: "Stratified result",
          meaning:
            "A metric reported separately for meaningful condition groups so a pooled average cannot hide a local failure.",
          physicalExample:
            "Success is shown for familiar and novel objects in each background rather than only for all forty trials together.",
        },
        {
          term: "Evaluation intervention",
          meaning:
            "A human or supervisory system action that changes, overrides, pauses, or stops policy execution during a trial.",
          physicalExample:
            "An operator takes over after the gripper approaches the wrong cup, and the trial remains counted as an intervention rather than a success.",
        },
        {
          term: "Abstention",
          meaning:
            "A deliberate refusal or clarification request when the system cannot produce a sufficiently grounded eligible action.",
          physicalExample:
            "With two equally plausible red mugs, the system asks which one instead of guessing and moving.",
        },
      ],
      physicalExamples: [
        {
          title: "Polite wording breaks a familiar task",
          scenario:
            "The policy succeeds on “put the cup in the tray” but fails on “could you place the cup into the tray?” with the same image and reset.",
          lookFor:
            "The language-paraphrase cell isolates wording from vision and manipulation, while the original prompt remains a paired control.",
        },
        {
          title: "Novel object and background interact",
          scenario:
            "A new yellow mug succeeds on the plain table and a familiar blue mug succeeds on a patterned mat, but the yellow mug on the mat fails.",
          lookFor:
            "Single-factor rows and the combined cell reveal an interaction that separate headline averages would miss.",
        },
      ],
      workedExample: {
        title: "Calculate the gap hidden by one aggregate score",
        setup:
          "A frozen suite has twenty familiar-object and twenty novel-object trials. The adapter succeeds on 18 familiar cases and 9 novel cases; three novel cases require intervention.",
        steps: [
          "Confirm all forty planned case IDs have one terminal record and that retries, discarded videos, and interventions have not disappeared from the denominator.",
          "Compute familiar success as `18 / 20 = 90%` and novel success as `9 / 20 = 45%` using the same predeclared terminal rule.",
          "Compute the generalization gap as `90% - 45% = 45 percentage points`, preserving percentage points rather than calling it a vague 45% change.",
          "Compute pooled success as `(18 + 9) / 40 = 67.5%` and state explicitly that this value conceals the novel-object deficit.",
          "Report novel intervention rate separately as `3 / 20 = 15%`, then list remaining wrong action, timeout, clarification, rejection, and guard-failure counts so categories reconcile to twenty.",
          "Compare baseline and adapter on the same case IDs, p95 latency, and mandatory guard gates before deciding whether the local-task improvement justifies more revision.",
        ],
        result:
          "The result shows strong familiar performance, a severe novel-object gap, and a nontrivial intervention burden that one 67.5% average would obscure.",
        takeaway:
          "The denominator and condition label are part of every VLA metric; remove either and the engineering decision can reverse.",
      },
      handsOn: {
        setup:
          "Build a simulator, image-card, or stored-observation suite with no live robot. Use at least two levels for object, background, and prompt factors plus selected combinations.",
        steps: [
          "Inventory training conditions, then reserve genuinely held-out objects, scenes, prompts, and camera views with stable IDs and evidence that they were excluded from tuning.",
          "Create a balanced factor grid with paired resets, include ambiguity, negation, irrelevant text, and impossible-command cases, and define the expected safe disposition for each.",
          "Freeze success, timeout, intervention, clarification, rejection, wrong-action, guard-failure, and latency rules before evaluating baseline or adapter.",
          "Run both candidates in a randomized but recorded order, independently reset policy state and scene state, and keep every planned trial plus uncut failure artifact.",
          "Produce per-cell success, intervention, abstention, wrong-action, p50/p95 latency, deadline miss, and failure-stage tables, then verify that category counts reconcile.",
          "Apply the unchanged acceptance gates, investigate the largest stratified regression, and create a new validation hypothesis without tuning on the final cases.",
        ],
        observe:
          "Condition-level tables reveal whether failure follows vision, language, timing, combinations, or the robot adapter, and whether a safe abstention masks weak autonomous coverage.",
        doneWhen:
          "All frozen cases remain countable, baseline and adapter share resets and rules, held-out evidence is intact, and the decision names the exact supported and unsupported conditions.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_HMI],
        workExample:
          "Design and automate a factor-controlled VLA release suite that preserves paired failures, interventions, abstentions, latency, and guard outcomes, then communicate the supported operating envelope to integration and operations teams.",
        interviewPrompt:
          "A candidate scores 67.5% overall. Show how object, scene, prompt, and combined-condition strata could change the conclusion, and explain how you would count clarification, intervention, OOD rejection, and deadline misses.",
      },
      commonMistakes: [
        {
          mistake: "Calling random augmentation a held-out generalization test.",
          correction:
            "Predeclare real condition groups and exclude their assets and episode families from training and tuning; preserve independent final case IDs and resets.",
        },
        {
          mistake: "Combining intervention-assisted completions with autonomous successes.",
          correction:
            "Keep intervention, clarification, abstention, wrong action, timeout, guard rejection, and independent success as separate reconciling outcomes.",
        },
        {
          mistake: "Tuning an OOD threshold on final evaluation failures.",
          correction:
            "Set thresholds from training and validation evidence, freeze them, and use the final suite once for an unbiased false-accept and false-reject assessment.",
        },
      ],
      checkQuestions: [
        {
          question: "What does 18/20 familiar versus 9/20 novel show that 27/40 hides?",
          answer:
            "It shows 90% familiar success, 45% novel success, and a 45-percentage-point generalization gap concealed by the pooled 67.5%.",
        },
        {
          question: "When may embodiment be a generalization factor?",
          answer:
            "Only when the target body has a defined compatible observation/action adapter and its calibration, limits, controller, and evaluation contract are independently validated.",
        },
        {
          question: "Is a clarification request a successful autonomous action?",
          answer:
            "No. It is a useful safe disposition that should be counted separately from task success and from an incorrect physical guess.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "A frozen factor grid with reconciling per-cell outcomes is already the exact comparison surface; a generic VLA picture would add decoration rather than evidence.",
      },
    },
    {
      dayId: 133,
      mentalModel:
        "An adaptation report is the policy's release passport: it binds what changed to what it cost, where it worked, where it failed, and which exact gate controls entry.",
      explanation: [
        "Start the report with identity and decision scope. Name the base checkpoint and revision, adapter or fine-tuned checkpoint, framework and runtime, processor and statistics artifacts, robot and embodiment profile, dataset and split versions, source licenses, code revision, configuration, and evaluation manifest. State whether the result concerns offline inference, simulation, supervised restricted-energy trials, or a production candidate. A report that says “fine-tuned π0.5” or “tested GR00T” without these identities cannot be reproduced or safely paired.",
        "Account for data and compute with measured values and explicit unknowns. Report raw and retained episodes, duration, tasks, embodiments, outcomes, held-out groups, exclusions, and sampling exposure. Record hardware, precision, batch and accumulation, trainable and total parameters, wall time, peak memory, checkpoint storage, and electrical energy only if measured or bounded from a declared power assumption. Cloud invoice, local electricity, engineering time, data collection, annotation, and deployment hardware are different cost categories and should not be collapsed into one invented number.",
        "Connect model metrics to operational evidence. Place baseline and candidate side by side for offline loss or action error, familiar and held-out rollout success, intervention and abstention, prohibited behavior, guard rejection, p50 and p95 end-to-end latency, deadline misses, memory, startup time, and soak stability. Link every aggregate to raw trial IDs and failure artifacts. Include regressions and negative results prominently; average improvement cannot compensate for a missed mandatory safety, action-validity, or recovery threshold.",
        "End with a reproducible gate and an owner. “Deploy” names the exact artifact, robot profile, environment, limits, monitoring, rollback, expiry, and approving roles. “Revise” lists the failed thresholds, corrective experiment, and evidence still needed. “Reject” preserves why the candidate is unsuitable rather than deleting the run. Unknowns stay unknown, marketing claims remain outside local evidence, and every future change to model, processor, data, adapter, controller, or site triggers the defined amount of revalidation.",
      ],
      keyTerms: [
        {
          term: "Experiment lineage",
          meaning:
            "The complete version chain linking source data, transforms, configuration, code, base, adapter, processors, runtime, evaluation, and report.",
          physicalExample:
            "A failed trial points back to dataset v12, transform r3, OpenVLA base hash B, adapter A7, processor P4, and simulator case N-08.",
        },
        {
          term: "Policy tail latency",
          meaning:
            "A high-percentile end-to-end delay such as p95 that exposes slow observations or commands hidden by an average.",
          physicalExample:
            "Median inference fits the control period, but p95 observation-to-command time misses it in one of twenty cycles.",
        },
        {
          term: "Release regression",
          meaning:
            "A previously accepted capability or constraint that performs worse under the candidate artifact or changed system.",
          physicalExample:
            "The adapter improves novel cups but increases wrong-gripper actions on the old tray task.",
        },
        {
          term: "Artifact acceptance gate",
          meaning:
            "A threshold and decision rule fixed before final results that blocks promotion when any mandatory condition fails.",
          physicalExample:
            "Release requires zero prohibited commands, p95 below 100 ms, and at least 18/20 successes in every mandatory task stratum.",
        },
        {
          term: "Reproducibility manifest",
          meaning:
            "A machine-readable inventory of artifacts, versions, environment, commands, seeds, and checksums needed to reconstruct a run and its evaluation.",
          physicalExample:
            "A reviewer reruns case N-08 from the recorded container, policy bundle, dataset snapshot, and simulator reset file.",
        },
        {
          term: "Deployment decision",
          meaning:
            "An owned deploy, revise, or reject outcome whose scope, evidence, restrictions, monitoring, and rollback are explicit.",
          physicalExample:
            "The adapter is approved only for the simulated cup cell, while hardware deployment remains blocked by latency and supervised-trial evidence.",
        },
      ],
      physicalExamples: [
        {
          title: "Better average, failed mandatory slice",
          scenario:
            "The adapter raises overall success from 70% to 82% but produces one prohibited gripper action and drops novel-object success below the frozen minimum.",
          lookFor:
            "The report rejects promotion under unchanged mandatory gates even though the headline average improved.",
        },
        {
          title: "Fast demo, slow tail",
          scenario:
            "A policy appears responsive during a short video, yet its measured p50 observation-to-command latency is 70 ms and p95 is 145 ms against a 100 ms deadline.",
          lookFor:
            "The 45 ms p95 miss, queue behavior, fallback count, and sustained-load trace are decision evidence; the edited demo is not.",
        },
      ],
      workedExample: {
        title: "Turn a mixed adaptation result into a release decision",
        setup:
          "A candidate improves overall fixed-suite success from 28/40 to 33/40. Novel-object success is 14/20 against a gate of 16/20, one prohibited action occurs against a zero-tolerance gate, and p95 latency rises from 90 ms to 125 ms against a 100 ms deadline.",
        steps: [
          "Verify both candidates used the same forty case IDs, resets, processor family, robot profile, terminal rules, and complete denominators; link every result to raw artifacts.",
          "Calculate overall rates: baseline `28 / 40 = 70%` and candidate `33 / 40 = 82.5%`, an increase of 12.5 percentage points.",
          "Evaluate mandatory strata separately: candidate novel-object success `14 / 20 = 70%` misses the required `16 / 20 = 80%` threshold.",
          "Apply the prohibited-action gate: one observed event exceeds the allowed zero, so no average score can authorize promotion.",
          "Calculate the tail miss: `125 ms - 100 ms = 25 ms`, then record associated stale-output or fallback evidence and compare the 35 ms regression from the 90 ms baseline.",
          "Issue `REVISE`, retain the candidate artifact, name the novel-object, command-guard, and latency investigations, and prohibit deployment until a newly versioned candidate passes the original untouched gate or an independently justified new release plan.",
        ],
        result:
          "The report preserves the useful 12.5-point aggregate improvement while correctly blocking release on three independently failed mandatory conditions.",
        takeaway:
          "A decision rule exists to survive attractive results: improvement is informative, but every non-negotiable action, stratum, and deadline gate still applies.",
      },
      handsOn: {
        setup:
          "Use saved outputs from this week's dry runs or a clearly labelled synthetic result set. Do not manufacture missing measurements and do not present paper or simulator results as hardware acceptance.",
        steps: [
          "Create an identity page containing artifact hashes, versions, access dates, code, configuration, processors, statistics, robot profile, data lineage, licenses, and evaluation manifest.",
          "Reconcile raw, retained, train, validation, and final episode counts; report duration, tasks, embodiments, sampling exposure, exclusions, and every held-out factor.",
          "Record measured training and runtime hardware, precision, trainable parameters, time, peak memory, storage, latency, and energy or financial fields, marking unavailable values unknown.",
          "Build paired baseline-candidate tables for offline, familiar, held-out, intervention, abstention, prohibited action, guard, latency, memory, and soak results with links to failures.",
          "Apply predeclared gates without changing thresholds, write the deploy, revise, or reject outcome, and assign each unresolved item an owner and required evidence.",
          "Have another engineer reconstruct one metric and one failure from the manifest, then rehearse rollback or adapter disablement at the same non-hardware evidence level.",
        ],
        observe:
          "A complete ledger makes unsupported claims, denominator gaps, resource surprises, processor drift, and safety-critical regressions harder to hide behind one successful video or average.",
        doneWhen:
          "A reviewer can reproduce identities and calculations, every unknown and regression is visible, the decision follows unchanged gates, and deployment scope never exceeds the tested surface.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_HMI],
        workExample:
          "Chair a learned-policy release review that reconciles data, compute, task, latency, guard, failure, operator, and rollback evidence into an artifact-specific decision with enforceable scope.",
        interviewPrompt:
          "A VLA adapter improves aggregate success by 12.5 percentage points but misses one held-out stratum, emits one prohibited action, and exceeds p95 latency. Build the report and defend deploy, revise, or reject.",
      },
      commonMistakes: [
        {
          mistake: "Publishing only the best checkpoint and strongest metric.",
          correction:
            "Preserve run lineage, failed checkpoints, baseline, per-condition results, regressions, resource costs, and raw evidence so selection and limitations remain auditable.",
        },
        {
          mistake: "Estimating missing compute or energy as if it were measured.",
          correction:
            "Label direct measurements, bounded calculations, assumptions, and unknowns separately; do not convert parameter count into invented power, price, or latency.",
        },
        {
          mistake: "Approving a model name rather than an artifact and scope.",
          correction:
            "Authorize one hashed model-processor-adapter bundle for one robot profile, environment, limit set, monitor, expiry, and rollback path; changes trigger declared revalidation.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does 82.5% overall success not override one prohibited action?",
          answer:
            "The prohibited-action threshold is a separate zero-tolerance mandatory gate; an aggregate metric cannot compensate for its failure.",
        },
        {
          question: "What is the candidate's p95 deadline miss at 125 ms against 100 ms?",
          answer:
            "It misses by 25 ms, and the report must also connect that tail delay to stale actions, queueing, fallbacks, and sustained-load behavior.",
        },
        {
          question: "What exactly receives a deploy decision?",
          answer:
            "One identified model, processor, statistics, adapter, runtime, robot profile, environment, limit, monitoring, and rollback bundle—not a model-family name.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The release ledger and unchanged gate calculation carry the decision exactly; another illustration would be weaker than the linked baseline, regression, latency, and failure table.",
      },
    },
  ],
} satisfies ChapterContent;
