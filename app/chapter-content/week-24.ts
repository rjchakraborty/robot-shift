import type { ChapterContent } from "../chapter-content-types";

const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";

export const week24Content = {
  week: 24,
  title: "Train, optimize, evaluate, and freeze one bounded edge policy",
  purpose:
    "Close the capstone policy loop without turning a promising training run into an unsupported robot claim. This chapter starts with a falsifiable hypothesis and runnable baseline, trains one policy while separating optimization from evidence, exports through ONNX and TensorRT with value-level drift tests, profiles a Jetson-class target under sustained load, opens an untouched held-out suite exactly once, directs the next improvement from a failure taxonomy without recycling final-test evidence, and freezes model v1 as a reproducible deployment bundle with explicit operating limits, fallback behavior, evaluation, and rollback.",
  prerequisites: [
    "Complete Week 23 with a versioned dataset whose observation and action fields, units, frames, timestamps, episode groups, train/validation/held-out assignments, quality findings, and card are frozen. Keep a second development or reserve slice available if final-test failures later inspire another model.",
    "Bring one already runnable policy or non-learned baseline, one training recipe supported by the selected policy implementation, a deterministic simulator or disconnected playback harness, and a command guard that checks finite values, shape, units, frames, freshness, absolute limits, rate limits, authority, and cancellation.",
    "Be able to distinguish training loss, validation loss, offline action error, closed-loop task success, end-to-end latency, deadline misses, interventions, and prohibited outcomes. These measurements answer different questions and must not be merged into one unexplained score.",
    "All learner work stays offline, in simulation, on recorded observations, or on an equivalent constrained computer. Any powered-robot rollout requires the commissioned platform, approved task and operating envelope, qualified supervision, physical safeguards, validated emergency provisions, and the site's authorization; a model, ROS 2 action, watchdog, or software fallback is not a safety function.",
  ],
  outcomes: [
    "Write a falsifiable experiment charter that names the baseline, one intended change, data and code versions, primary metric, guard gates, minimum worthwhile improvement, run budget, and decision rule before seeing candidate results.",
    "Train one policy from a pinned configuration, inspect training and validation curves without touching the held-out suite, select a checkpoint by a predeclared rule, and retain seeds, environment, logs, checkpoints, and failure evidence.",
    "Export a checkpoint through an explicit preprocessing–ONNX–TensorRT contract, validate graph structure and shapes, compare source and optimized outputs on a representative golden corpus, and reject precision changes whose numerical or task drift crosses physical tolerances.",
    "Profile the complete edge path under warm and sustained representative load, reporting input age, stage latency, p50 and tail latency, deadline misses, memory, power mode, temperature or throttling evidence, queue behavior, and a tested application fallback.",
    "Run baseline and candidate on one frozen held-out manifest without adapting to revealed cases, preserve every denominator and terminal outcome, and issue the predeclared accept, revise, or reject result even when it is disappointing.",
    "Turn final-test failures into hypotheses and new development data or system experiments while keeping the revealed suite historical, changing one causal lever at a time, and reserving fresh evaluation evidence for the next candidate.",
    "Freeze a deployable model v1 bundle containing checksummed model and processor artifacts, action statistics, export and engine recipes, runtime and robot profiles, operating envelope, evaluation and latency reports, monitoring, fallback, rollback, approvals, and known limitations.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_VALIDATION,
    ROLE_SOFTWARE,
    ROLE_INTEGRATION,
  ],
  sources: [
    {
      label: "Hugging Face LeRobot — Imitation Learning on Real-World Robots",
      url: "https://huggingface.co/docs/lerobot/il_robots",
      useFor:
        "Maintainer workflow for versioned robot data, policy training, checkpoint creation and resumption, pinned policy revisions, rollout modes, and evaluation; used as one concrete implementation path rather than a universal training recipe or safety authority.",
    },
    {
      label: "PyTorch — Reproducibility",
      url: "https://docs.pytorch.org/docs/stable/notes/randomness.html",
      useFor:
        "Framework-owned guidance on controlling random sources and deterministic operations, plus the important boundary that exact reproducibility is not guaranteed across releases, commits, platforms, or CPU and GPU execution.",
    },
    {
      label: "ONNX — Checker and model consistency",
      url: "https://onnx.ai/onnx/api/checker.html",
      useFor:
        "Project-owned API contract for checking whether an ONNX model is structurally legal and internally consistent; this chapter keeps that check separate from semantic parity, numerical drift, latency, task performance, and physical safety.",
    },
    {
      label: "NVIDIA TensorRT — Accuracy Considerations",
      url: "https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/accuracy-considerations.html",
      useFor:
        "Vendor documentation for reduced-precision range and precision tradeoffs, rounding and clamping error, quantized types, and accuracy-debugging concerns that motivate representative calibration and source-versus-engine differential tests.",
    },
    {
      label: "NVIDIA Jetson Linux — Platform Power and Performance",
      url: "https://docs.nvidia.com/jetson/archives/r36.4/DeveloperGuide/SD/PlatformPowerAndPerformance.html",
      useFor:
        "Release-scoped vendor reference for Jetson power modes, clocks, fan control, thermal sensing, throttling, shutdown, and monitoring; used to define what must be observed during a sustained target-device profile without assuming identical behavior across modules or software releases.",
    },
  ],
  days: [
    {
      dayId: 162,
      mentalModel:
        "An experiment is a fair race on one marked track: freeze the ruler, starting positions, finish rule, and safety disqualifiers before either policy runs.",
      explanation: [
        "Begin with the physical task and the simplest credible competitor. A baseline may be the last accepted checkpoint, a scripted grasp, nearest-neighbour action lookup, or an untouched pretrained policy, but it must actually run through the same observation, action, reset, guard, and scoring path as the candidate. Its job is to reveal whether the new work beats something real. A famous published number, a training loss from another dataset, or a policy that receives easier inputs is not a local baseline.",
        "Write the experiment as a falsifiable sentence. Let `B` be baseline success rate, `C` candidate success rate, and `Δ = C - B` the absolute improvement on the declared development suite. A useful hypothesis is: “Changing only the policy from baseline revision `b7` to ACT configuration `a3`, while keeping dataset `d1` and every reset fixed, will make `Δ ≥ 0.15` without any prohibited contact and with p95 end-to-end latency at or below `100 ms`.” Define every symbol, unit, slice, and threshold beside the sentence.",
        "Separate optimization evidence from final evidence now. `D_train` supplies gradient updates, `D_val` chooses settings or checkpoints, `D_dev` supports repeatable closed-loop diagnosis, and sealed `D_test` answers the final question once. The split unit is an episode family, scene, object instance, or collection session whenever related rows could leak familiarity. Compute normalization statistics only from allowed training data. Reading held-out outcomes to choose a learning rate, augmentation, threshold, or baseline turns that suite into development data.",
        "Predeclare the decision rule and budget. Name the primary metric, mandatory guard gates, useful effect size, number of seeds, maximum training steps, checkpoint-selection rule, trial count, stop conditions, and how inconclusive results are handled. A small sample can show an engineering direction without proving a population claim, so preserve counts and uncertainty. No experiment authorizes motion: even a candidate that clears learning metrics still enters only the already approved simulator or guarded robot workflow.",
      ],
      keyTerms: [
        {
          term: "Runnable baseline",
          meaning:
            "A versioned reference method executed through the same inputs, resets, guards, and metrics as the candidate so the comparison has a physical meaning.",
          physicalExample:
            "A scripted top-down grasp and a learned grasp both receive the same camera frame, object placements, timeout, collision rule, and gripper controller.",
        },
        {
          term: "Experiment hypothesis",
          meaning:
            "A testable prediction linking one declared change to a measured effect under frozen conditions, including a threshold that could be missed.",
          physicalExample:
            "Replacing only the policy checkpoint is predicted to raise unassisted bin-placement success by at least 15 percentage points on fixed development starts.",
        },
        {
          term: "Experimental unit",
          meaning:
            "The independently assigned item counted in a comparison, chosen at the dependency level that prevents related observations from crossing conditions.",
          physicalExample:
            "A complete reset-and-rollout episode is one unit; its thousands of camera frames are not thousands of independent trials.",
        },
        {
          term: "Decision rule",
          meaning:
            "The prewritten mapping from measured metrics and mandatory failures to accept, revise, reject, or inconclusive, applied after results are revealed.",
          physicalExample:
            "A candidate advances only if success improves by at least 15 points, no prohibited contact occurs, and its p95 deadline is met.",
        },
      ],
      physicalExamples: [
        {
          title: "Two grasp policies on unequal starting marks",
          scenario:
            "Policy A receives centered cubes under one lamp, while Policy B receives randomized cubes with shadows; A reports 18 successes in 20 trials and B reports 13.",
          lookFor:
            "The scores do not rank the policies because reset distributions differ. Replay one frozen case manifest through both policies, preserve case order and scoring, and pair outcomes by case ID.",
        },
        {
          title: "A ruler that bends after the result",
          scenario:
            "A rover policy misses the original 20-second docking limit, so the team changes the limit to 30 seconds after watching the final runs and calls the model successful.",
          lookFor:
            "The changed timeout may define a future product decision, but it cannot rewrite the original result. Record the miss, version a new requirement, and evaluate a future candidate on fresh evidence.",
        },
      ],
      workedExample: {
        title: "Turn an attractive capstone idea into a bounded experiment",
        setup:
          "A tabletop policy must place a foam block in a bin. Baseline `b7` succeeds on 12 of 20 frozen development starts, has p95 pipeline latency of 72 ms, and produces no prohibited contact. The team proposes ACT configuration `a3` on unchanged dataset `d1`.",
        steps: [
          "Calculate baseline success as `B = 12 / 20 = 0.60`; retain the count `12/20` because the denominator and individual case outcomes matter more than the percentage alone.",
          "Define the one intended change as `policy: b7 → a3`; pin dataset, split manifest, processors, action statistics, simulator, robot profile, reset cases, command guard, hardware target, and scoring code as controlled variables.",
          "Set the worthwhile effect to `Δ_min = 0.15`, so the candidate target is `C ≥ 0.75`; with 20 trials that means at least 15 successes, subject to the other gates.",
          "Add mandatory gates of zero prohibited contact, zero unhandled inference exception, and `p95 ≤ 100 ms`; specify that a gate failure rejects advancement even if task success reaches 15 of 20.",
          "Choose validation loss for checkpoint selection, three recorded seeds for training variability, and the same 20-case development rollout for diagnosis; keep the final held-out manifest unread.",
          "Sign the charter before training and label its conclusion scope: this experiment can select a candidate for final evaluation, but cannot establish real-robot safety, broad generalization, or production readiness.",
        ],
        result:
          "The team now has a baseline, one-variable hypothesis, numeric effect threshold, guard gates, finite budget, and evidence boundary that can produce a real failure instead of a movable success story.",
        takeaway:
          "A hypothesis becomes useful when another engineer can run the same comparison and knows in advance which observations would disprove it.",
      },
      handsOn: {
        setup:
          "Use the Week 23 dataset card, a prior checkpoint or deterministic script, and a spreadsheet or Markdown experiment charter. Stay on recorded observations or the disconnected simulator.",
        steps: [
          "Name one physically measurable capstone outcome, timeout, allowed interventions, prohibited outcomes, and terminal robot state; attach the exact scorer and units.",
          "Run or replay the baseline on a small frozen development manifest, preserving case IDs, per-case outcomes, stage failures, and latency rather than copying a headline benchmark.",
          "Write `D_train`, `D_val`, `D_dev`, and sealed `D_test` lineages, then verify that preprocessing statistics, near-duplicates, object instances, and collection sessions respect those boundaries.",
          "Write one hypothesis that changes one primary factor and includes a minimum useful effect, mandatory guard gates, seed or repeat budget, and checkpoint-selection rule.",
          "Ask a peer to identify any condition that could be changed after results appear; freeze or explicitly mark it exploratory before launching training.",
          "Save the charter beside exact code, configuration, baseline artifact, dataset manifest, environment, and scorer identifiers, then compute checksums for the files that define the comparison.",
        ],
        observe:
          "Most vague claims collapse into several separate questions: whether training fits recorded actions, whether rollouts complete the task, whether latency fits the loop, and whether any disqualifying behavior occurs.",
        doneWhen:
          "The baseline is locally runnable, every symbol and metric is defined, only one intended change remains, final evidence is sealed, and the signed decision rule can reject the candidate.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION],
        workExample:
          "Create an experiment charter for a customer-facing robot-learning change, reproduce the current baseline on exact cases, protect data boundaries, negotiate latency and behavior gates with integration owners, and deliver a decision rule that survives a disappointing result.",
        interviewPrompt:
          "You inherit a policy claimed to be 20 percent better than baseline. Explain how you would verify the baseline, experimental unit, split lineage, controlled change, effect threshold, safety gates, trial budget, and untouched final evaluation before accepting that claim.",
      },
      commonMistakes: [
        {
          mistake: "Using the previous run's training loss as the baseline for a robot task.",
          correction:
            "Run a versioned reference policy or controller on the same observations, resets, command path, outcomes, and latency measurements; loss and task success are different evidence.",
        },
        {
          mistake: "Writing “the new policy will improve performance” without a magnitude or failure rule.",
          correction:
            "Name the changed factor, metric, minimum worthwhile effect, mandatory disqualifiers, finite trial budget, and decision produced when the threshold is missed.",
        },
        {
          mistake: "Looking at held-out trials to choose the baseline because that seems fairer.",
          correction:
            "Choose and validate the baseline from prior or development evidence, then freeze it before opening the held-out suite; otherwise final cases have influenced the comparison.",
        },
      ],
      checkQuestions: [
        {
          question: "What does `Δ = C - B` mean in this chapter?",
          answer:
            "`B` is baseline success rate, `C` is candidate success rate on the same declared cases, and `Δ` is their absolute difference in percentage-point form.",
        },
        {
          question: "Why are ten thousand frames from one rollout not ten thousand independent experimental units?",
          answer:
            "Those frames share one reset, scene, policy history, and physical trajectory, so treating them as independent would greatly overstate the amount of evidence.",
        },
        {
          question: "When may the final held-out suite influence hyperparameters?",
          answer:
            "Never while it remains the claimed final suite; once its outcomes influence a choice, it becomes development evidence and a fresh untouched evaluation is required.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The experiment charter and split-lineage table contain the real local contracts; a generic race illustration would add little beyond those auditable artifacts.",
      },
    },
    {
      dayId: 163,
      mentalModel:
        "Training is a hiker descending one mapped hill while a lookout watches a different hill; the sealed mountain beyond remains unseen until the final expedition.",
      explanation: [
        "A policy `π_θ(o)` maps observation `o` to an action, using learned parameters `θ`. During behavior-cloning training, a batch from `D_train` contains teacher actions `a*`, the policy predicts `â = π_θ(o)`, and a declared loss `L_train(θ)` measures disagreement under the action contract. The optimizer changes `θ` to reduce that training loss. It does not directly optimize collision avoidance, recovery, deadline compliance, or task completion unless those properties are actually represented and validated elsewhere.",
        "Plot learning curves against an honest x-axis such as optimizer step or processed samples. At checkpoint `k`, record training loss `L_train(k)` and validation loss `L_val(k)` using the same preprocessing and a validation set that never updates weights. Both high and flat can indicate underfitting, a broken pipeline, or an unsuitable representation. Falling training loss with rising validation loss suggests memorization or distribution mismatch. No curve shape proves the diagnosis; inspect examples, components, gradients, data, and closed-loop development trials.",
        "Make the run reconstructable. Pin policy implementation, starting weights, dataset and split checksums, processors, action statistics, augmentations, optimizer, schedule, batch and accumulation, precision, seed, checkpoint cadence, code revision, dependencies, GPU type, and resume lineage. Seed Python, NumPy, framework, and data-loader sources where applicable, and request deterministic operations when the chosen stack supports them. PyTorch explicitly warns that exact reproduction is not guaranteed across releases and platforms, so report the environment rather than promising identical bits everywhere.",
        "Select a checkpoint by the rule written yesterday, not by whichever plot looks nicest after the run. Minimum validation loss, a smoothed validation measure, or a fixed training budget can be defensible when declared beforehand. Then run only the development rollout suite through the full guard and timing path. A checkpoint remains a candidate even when it predicts validation actions accurately; powered autonomy still requires separate authorization, and an unhandled NaN, stale observation, invalid action, or guard rejection must terminate into the designed application fallback.",
      ],
      keyTerms: [
        {
          term: "Optimizer step",
          meaning:
            "One parameter-update event computed from one batch or accumulated group of batches, used as a reproducible training-progress coordinate.",
          physicalExample:
            "After several tray demonstrations are compared with predicted joint targets, one optimizer step nudges the policy parameters before the next batch.",
        },
        {
          term: "Training loss",
          meaning:
            "The declared numerical mismatch measured on examples allowed to update parameters; its unit and aggregation follow the selected action and loss contract.",
          physicalExample:
            "Mean squared error in radians squared measures disagreement between predicted and demonstrated joint targets for a training batch.",
        },
        {
          term: "Validation curve",
          meaning:
            "A sequence of measurements on fixed non-training examples used for development choices such as checkpoint selection, never for gradient updates.",
          physicalExample:
            "Every 2,000 steps, the policy predicts actions for untouched validation episodes and their error is plotted without changing the model.",
        },
        {
          term: "Checkpoint lineage",
          meaning:
            "The trace from starting artifact through configuration, data, optimizer state, step, environment, and any resume operation to saved parameters.",
          physicalExample:
            "Checkpoint `step_6000` records that it resumed from `step_4000` with the same dataset hash but a restored optimizer and sampler state.",
        },
        {
          term: "Overfitting signal",
          meaning:
            "Evidence that fit improves on training data while relevant non-training performance stalls or worsens, requiring diagnosis rather than an automatic label.",
          physicalExample:
            "Training action error keeps shrinking while validation error and development grasp failures rise on the same checkpoint sequence.",
        },
      ],
      physicalExamples: [
        {
          title: "Student memorizes one tray layout",
          scenario:
            "A camera policy sees one red-cube arrangement hundreds of times. Its training error approaches zero, yet the gripper moves toward the remembered pixel when the tray shifts.",
          lookFor:
            "The policy learned a shortcut tied to training appearance. Validation by episode and scene exposes the gap; more steps on the same arrangement deepen it.",
        },
        {
          title: "A smooth graph hides one dangerous joint",
          scenario:
            "Average validation loss decreases, but the wrist component occasionally predicts a large wrong-sign command while five other action dimensions remain accurate.",
          lookFor:
            "Inspect loss by action component, worst examples, finite values, units, and guard rejections. An average can bury the physical dimension that controls clearance.",
        },
      ],
      workedExample: {
        title: "Read three checkpoints without inventing a success claim",
        setup:
          "One seeded behavior-cloning run reports mean action loss at 2,000, 6,000, and 10,000 optimizer steps. The frozen checkpoint rule is minimum validation loss; final test data remain sealed.",
        steps: [
          "Record the table exactly: at `2k`, `L_train = 0.18` and `L_val = 0.20`; at `6k`, they are `0.07` and `0.10`; at `10k`, they are `0.03` and `0.14`.",
          "Observe that training loss falls at every checkpoint, showing better fit to `D_train` under this loss, while validation loss improves through `6k` and then worsens.",
          "Apply the frozen rule and select `6k`, because `0.10` is the smallest measured `L_val`; do not select `10k` merely because its training loss is lowest.",
          "Inspect per-action validation errors and the largest-error episodes at `6k`; verify tensor order, units, masks, and preprocessing before interpreting the difference as model behavior.",
          "Replay `2k`, `6k`, and the unchanged baseline on the same small development rollout cases, recording success, failure stage, guard rejections, and end-to-end latency as separate columns.",
          "Conclude only that `6k` won the declared offline checkpoint rule and deserves development rollout evaluation; no final generalization, safety, or deployability claim follows from the curves.",
        ],
        result:
          "The team preserves the `10k` overfitting signal, selects `6k` without touching final cases, and carries both offline and closed-loop evidence forward instead of equating low loss with a working robot.",
        takeaway:
          "A learning curve is an instrument panel: it helps locate where to inspect, while the declared checkpoint rule and physical trials decide what the run may claim.",
      },
      handsOn: {
        setup:
          "Use the selected policy's maintained training entry point, dataset v1, and a disconnected accelerator or tiny synthetic fixture. A short dry run is acceptable when full training is unavailable.",
        steps: [
          "Export a resolved configuration containing model, starting weights, feature schema, processors, dataset and split hashes, statistics, augmentations, optimizer, schedule, precision, seed, steps, and checkpoint cadence.",
          "Run a one-batch overfit or tiny-fixture check to prove inputs, targets, masks, loss components, backpropagation, save, load, and resume behavior before spending the full budget.",
          "Launch the bounded run from one documented command, capture standard output and structured metrics, and preserve the first failure rather than silently restarting with changed settings.",
          "Plot training and validation loss against processed samples or optimizer steps, plus each safety-critical action component; annotate checkpoint, resume, learning-rate, and invalid-value events.",
          "Apply the predeclared selection rule, load that exact checkpoint in a fresh process, and confirm identical schema, processor, statistics, output shape, and finite decoded actions on golden observations.",
          "Run the candidate only on frozen development simulator cases behind freshness and action guards; archive per-case outcomes and state precisely what has not been tested.",
        ],
        observe:
          "A useful run often reveals a pipeline defect before a modeling insight: wrong camera order, an ignored padding mask, stale statistics, a failed resume, or one action component dominating the average.",
        doneWhen:
          "The run can be reconstructed from pinned inputs, every checkpoint has lineage, curves and worst examples are inspectable, the rule selects one candidate, and final test data remain unopened.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE],
        workExample:
          "Operate a production-minded robot-policy training job: qualify the data and tensor path, pin and resume experiments, instrument component losses, diagnose curve changes, select checkpoints by policy, and hand an exact artifact plus limitations to deployment engineers.",
        interviewPrompt:
          "Training loss falls steadily while validation loss bottoms out and rises. Describe what that does and does not establish, which pipeline evidence you inspect, how you choose a checkpoint, how you reproduce the run, and why the final test remains sealed.",
      },
      commonMistakes: [
        {
          mistake: "Choosing the last checkpoint because it trained for the longest time.",
          correction:
            "Apply the frozen validation or budget rule, inspect component and worst-case evidence, and preserve later degradation as a finding rather than rewarding elapsed compute.",
        },
        {
          mistake: "Calling a deterministic seed proof that any machine will reproduce identical weights.",
          correction:
            "Seed every relevant generator and record deterministic settings plus full environment, while stating that framework, driver, hardware, and operation differences can prevent bitwise reproduction.",
        },
        {
          mistake: "Declaring the robot task solved when validation action loss is low.",
          correction:
            "Treat offline imitation error as one layer; measure closed-loop development success, timing, guards, recovery, and later untouched evaluation through the actual deployment path.",
        },
      ],
      checkQuestions: [
        {
          question: "Which dataset may directly cause a parameter update?",
          answer:
            "Only `D_train`; validation can guide declared development choices, while the final held-out set must not influence training or selection.",
        },
        {
          question: "What does rising validation loss beside falling training loss suggest?",
          answer:
            "It is an overfitting or distribution-mismatch signal that requires example, component, data, and pipeline inspection; the curve alone does not prove one cause.",
        },
        {
          question: "Why load the selected checkpoint in a fresh process?",
          answer:
            "It checks that saved weights, configuration, processors, statistics, schema, and load path are sufficient without relying on hidden in-memory training state.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "Aligned training and validation curves with checkpoint markers make divergence and the predeclared selection point materially easier to understand than prose or a final scalar.",
      },
    },
    {
      dayId: 164,
      mentalModel:
        "Export is translating a pilot's instructions into a smaller machine's language: every lever name, scale, order, and response must survive the translation.",
      explanation: [
        "Treat export as a chain of contracts, not a file conversion. The source policy includes preprocessing, tensor names, shapes, dtypes, camera order, normalization, history, padding, task encoding, recurrent or action-queue state, and postprocessing. ONNX represents a computation graph and operator set; TensorRT builds an executable engine for declared shapes, precision, software, and target compatibility. An ONNX checker can establish structural consistency, but it cannot prove that preprocessing still matches training or that output numbers mean the same physical commands.",
        "Create a golden corpus `G = {x_i}` of representative development inputs: nominal scenes, allowed boundary shapes, dark and bright frames, near-limit states, padded histories, and deliberately invalid cases. For each valid `x_i`, keep source output `y_i` before decoding and compare ONNX or engine output `ŷ_i`. Define element error `e_ij = ŷ_ij - y_ij`, maximum absolute drift `E_max = max |e_ij|`, and mean absolute drift `E_mean = mean |e_ij|`. Tolerances must be per output and tied to downstream units, guards, and task sensitivity.",
        "Reduced precision trades representation detail for resource use. FP16 has less range and precision than FP32; integer quantization maps values through scales, so rounding approximates values and clamping clips values outside the representable range. Post-training calibration inputs should resemble the intended training or development distribution and must not borrow sealed final cases. A good global error can still hide sign flips, saturated gripper values, rare NaN or Inf outputs, or a threshold crossing that changes a discrete command.",
        "Advance in rungs: source framework, exported ONNX runtime, TensorRT FP32 or closest reference, then each lower-precision candidate. At every rung check graph, input contract, values, decoded actions, guard decisions, development rollout outcomes, memory, and latency. Reject or isolate unsupported operators instead of replacing them silently. The optimized engine remains behind the same freshness, bounds, rate, collision, authority, cancellation, and fallback path; speed does not grant motion authority or certify the controller.",
      ],
      keyTerms: [
        {
          term: "Export contract",
          meaning:
            "The complete agreement for model graph, operator set, tensor names, dimensions, dtypes, preprocessing, state, outputs, decoding, and supported runtime conditions.",
          physicalExample:
            "The front camera must remain RGB, `1×3×480×640`, normalized with training statistics, and paired with six ordered joint positions in radians.",
        },
        {
          term: "Golden corpus",
          meaning:
            "A versioned set of representative and boundary development inputs with preserved source outputs and expected validation behavior for differential testing.",
          physicalExample:
            "Twenty recorded observations include centered blocks, edge poses, glare, padded histories, a near-limit wrist, and one rejected malformed image.",
        },
        {
          term: "Numerical drift",
          meaning:
            "The measured value difference between source and converted runtime outputs for the same exact inputs, precision, state, and decoding contract.",
          physicalExample:
            "The TensorRT engine predicts a wrist delta 0.004 radians above the source output on one golden observation.",
        },
        {
          term: "Quantization scale",
          meaning:
            "A declared mapping between real-valued tensors and lower-precision representable values that determines rounding resolution and clipping range.",
          physicalExample:
            "A scale maps gripper logits into INT8 levels; a poor range clips strong close commands and changes when the threshold is crossed.",
        },
        {
          term: "Optimization profile",
          meaning:
            "A TensorRT build-time declaration of permitted minimum, typical, and maximum runtime dimensions for inputs whose shapes vary.",
          physicalExample:
            "An image-history input permits 2 to 8 frames, is optimized for 4, and must reject a 10-frame request rather than reinterpret memory.",
        },
      ],
      physicalExamples: [
        {
          title: "Correct graph, swapped cameras",
          scenario:
            "The ONNX checker passes and tensor shapes match, but deployment supplies the wrist camera under the front-camera name and the front image under the wrist key.",
          lookFor:
            "Structural validity cannot detect semantic exchange between equal-shaped tensors. Golden observations, named binding checks, image fingerprints, and action parity must exercise camera identity.",
        },
        {
          title: "Tiny float change crosses a gripper threshold",
          scenario:
            "The source produces gripper score `0.501`; a quantized engine produces `0.498`. Absolute drift is only `0.003`, yet a `0.5` threshold changes close into open.",
          lookFor:
            "Set tolerance from physical decision behavior, compare postprocessing and guard results, and consider keeping the sensitive layer or decision in higher precision.",
        },
      ],
      workedExample: {
        title: "Decide whether one lower-precision engine preserves action meaning",
        setup:
          "For one golden observation, the source policy outputs normalized action `[0.120, -0.040, 0.501]`. An FP16 TensorRT engine outputs `[0.121, -0.043, 0.498]`. Components decode to shoulder radians, wrist radians, and a gripper score thresholded at `0.5`.",
        steps: [
          "Compute signed errors as `e = ŷ - y = [0.001, -0.003, -0.003]`; keep signs because direction changes can matter even when magnitudes match.",
          "Compute `E_max = 0.003` and `E_mean = (0.001 + 0.003 + 0.003) / 3 ≈ 0.00233`; label the first two components in normalized units until decoder scales are applied.",
          "Apply component tolerances: shoulder `0.002`, wrist `0.002`, and gripper decision equality. The wrist exceeds its numeric tolerance because `0.003 > 0.002`.",
          "Decode both gripper scores: source `0.501 ≥ 0.5` means close, while engine `0.498 < 0.5` means open; semantic parity fails despite the small global error.",
          "Repeat across the entire golden corpus and group errors by output, scene factor, value magnitude, invalid input, and guard decision; inspect NaN, Inf, saturation, and sign changes explicitly.",
          "Reject this FP16 engine for release, retain the source or higher-precision rung, and investigate mixed precision, threshold robustness, calibration coverage, or architecture support only on development data.",
        ],
        result:
          "The engine fails both a wrist tolerance and the gripper decision contract, so a tempting speed improvement cannot advance until a new candidate passes the unchanged parity suite.",
        takeaway:
          "Numerical acceptability is defined by downstream physical meaning; one averaged drift number cannot overrule a changed discrete action or a safety-relevant component.",
      },
      handsOn: {
        setup:
          "Use the selected checkpoint, its exact processors and decoder, ONNX tooling, and TensorRT when available. If the target stack is unavailable, create the contracts and run source-versus-ONNX tests without pretending TensorRT was verified.",
        steps: [
          "Write a manifest for every input and output with name, order, dtype, shape or range, unit before and after decoding, preprocessing, state ownership, freshness, and invalid-input response.",
          "Build a versioned golden corpus from development data only, preserving raw inputs, source preprocessed tensors, source outputs, decoded actions, and expected guard decisions.",
          "Export with a pinned operator-set and shape policy, run the ONNX checker and shape checks, then load the artifact in a fresh runtime and reject missing or reordered bindings.",
          "Compare source, ONNX, TensorRT reference precision, and each quantized candidate on identical bytes; calculate per-component max, mean, percentiles, sign flips, threshold changes, NaN, Inf, and saturation.",
          "Run the unchanged development rollout suite for every numerically eligible rung, recording task outcomes, guard rejections, memory, warm and steady latency, and any unsupported operator or fallback.",
          "Package the exporter, build command, calibration lineage, compatibility record, logs, model and engine checksums, and explicit pass or reject table without overwriting the source checkpoint.",
        ],
        observe:
          "The first failure may be semantic rather than numeric: color order, camera binding, dynamic history length, padding state, or decoder statistics can be wrong while the graph remains legal.",
        doneWhen:
          "Every runtime has exact bindings and provenance, structural checks pass, value and semantic tolerances pass on all golden cases, development behavior remains eligible, and no sealed final input entered export or calibration.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Own a framework-to-edge conversion gate that inventories preprocessing and tensor semantics, diagnoses unsupported operators, constructs representative calibration and golden corpora, performs source-versus-engine differential tests, and rejects optimizations that change action or guard behavior.",
        interviewPrompt:
          "An ONNX model passes the checker and a TensorRT INT8 engine is twice as fast. Explain why neither fact proves parity, which tensors and cases you compare, how you set physical tolerances, where calibration data comes from, and what blocks release.",
      },
      commonMistakes: [
        {
          mistake: "Treating `onnx.checker.check_model()` as proof that the exported policy behaves like the source.",
          correction:
            "Use the checker for graph legality, then separately verify bindings, preprocessing, state, numerical outputs, decoding, guard decisions, rollout outcomes, and timing.",
        },
        {
          mistake: "Accepting quantization because average output drift is small.",
          correction:
            "Measure every action component, worst and tail error, sign and threshold changes, saturation, invalid values, and closed-loop development outcomes against physically justified tolerances.",
        },
        {
          mistake: "Using held-out final scenes as representative INT8 calibration examples.",
          correction:
            "Build calibration coverage from training or declared development data; final cases must remain unavailable to every optimization choice, including precision calibration.",
        },
      ],
      checkQuestions: [
        {
          question: "What does an ONNX structural check fail to establish?",
          answer:
            "It does not establish correct preprocessing, tensor identity, numerical parity, action semantics, runtime timing, task success, guard behavior, or physical safety.",
        },
        {
          question: "Why does `E_max = 0.003` not automatically pass the worked example?",
          answer:
            "The wrist tolerance is `0.002`, and the gripper's 0.003 shift crosses its 0.5 decision threshold, so physical semantics change.",
        },
        {
          question: "Where may post-training calibration examples come from?",
          answer:
            "From representative training or explicitly available development data with recorded lineage, never from a suite still claimed to be untouched final evidence.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A source→ONNX→TensorRT ladder with per-output drift and threshold crossings exposes where semantic parity fails more clearly than a flat conversion checklist.",
      },
    },
    {
      dayId: 165,
      mentalModel:
        "An edge computer is a backpack carried by the robot: weight, heat, energy, waiting lines, and stale messages matter as much as raw inference speed.",
      explanation: [
        "Profile the complete physical-information loop on the intended class of target. Observation age begins at sensor acquisition, then data may wait, copy, resize, normalize, enter the engine, decode, pass guards, travel through ROS 2, and reach command acceptance. Define stage latencies `t_capture`, `t_queue`, `t_pre`, `t_infer`, `t_post`, and `t_transport`; end-to-end age is their measured composition for one correlated request. GPU kernel time alone omits the queues and transformations most likely to make an otherwise accurate action stale.",
        "Report distributions under representative load. `p50` is a typical median sample, `p95` is the value at or below which about 95 percent of measured samples fall, and deadline-miss rate counts samples beyond the application deadline. Warm up the actual shapes and paths, use realistic inputs, synchronize timing correctly, and separate inference-only from full-pipeline numbers. Test concurrent camera, recording, ROS 2, UI, or mapping work that will share CPU, memory bandwidth, and power; a quiet bench benchmark can be an optimistic special case.",
        "Power and temperature create stateful performance. Pin the exact module, carrier, storage, JetPack or Jetson Linux release, TensorRT and CUDA versions, power mode, clocks policy, fan profile, enclosure, ambient temperature, and input load. Observe memory, temperatures, frequencies, power or rail signals available for that device, throttling events, and latency over a sustained interval. A five-second burst before the heat sink warms cannot establish a thirty-minute duty cycle, and maximum-performance mode is not automatically the permitted product operating mode.",
        "Design failure before deployment. Give each inference a source timestamp, sequence, deadline, expiry, and cancellation lineage; bound queue depth and prefer dropping obsolete work over executing it late. On timeout, invalid output, lost executor, over-temperature policy event, memory pressure, or stale observation, the application may hold, cancel, request a known controller stop, fall back to a verified baseline, or require human handoff according to the task design. These are software responses, not E-stop, STO, protective stop, or a substitute for risk-derived safeguards.",
      ],
      keyTerms: [
        {
          term: "End-to-end action age",
          meaning:
            "Elapsed time from the physical observation's acquisition to the point where its derived command is accepted or rejected by the declared consumer.",
          physicalExample:
            "A camera frame captured at 12:00:00.000 produces a guarded ROS 2 goal accepted at 12:00:00.084, so action age is 84 ms.",
        },
        {
          term: "Tail latency",
          meaning:
            "Latency near the slow end of a measured distribution, such as p95 or p99, which exposes rare delays hidden by an average.",
          physicalExample:
            "Most grasp inferences finish near 48 ms, but one in twenty takes more than 112 ms when video encoding contends for memory.",
        },
        {
          term: "Thermal throttling",
          meaning:
            "Automatic performance reduction caused by a device's thermal management when monitored conditions reach implementation-specific limits.",
          physicalExample:
            "After sustained inference warms the module, GPU frequency falls and p95 latency rises even though the engine and inputs have not changed.",
        },
        {
          term: "Bounded queue",
          meaning:
            "A waiting structure with a fixed capacity and explicit overflow policy so obsolete observations cannot accumulate without limit.",
          physicalExample:
            "A latest-only camera queue replaces an unprocessed old frame, while the discarded sequence is counted and never converted into a late command.",
        },
        {
          term: "Application fallback",
          meaning:
            "A tested ordinary-software response to a named failure, with entry conditions, command authority, terminal state, observability, and escalation.",
          physicalExample:
            "On inference timeout, the action server cancels the policy goal, commands the already validated hold behavior, and asks the operator to reset the task.",
        },
      ],
      physicalExamples: [
        {
          title: "Fast engine behind an old camera queue",
          scenario:
            "TensorRT inference takes 32 ms, but three 70 ms-old frames wait ahead of the current frame while the robot and block continue moving.",
          lookFor:
            "Measure source age and queue time, cap the queue, expire old actions, correlate sequence IDs, and avoid presenting kernel latency as control-loop latency.",
        },
        {
          title: "Cool demo becomes a hot shift",
          scenario:
            "A Jetson-class device meets a 100 ms deadline for the first minute, then enclosure temperature rises and p95 latency reaches 138 ms during simultaneous recording.",
          lookFor:
            "Use a sustained representative soak, record thermal and frequency evidence, test the approved power and cooling setup, and enter the declared degraded or fallback state on misses.",
        },
      ],
      workedExample: {
        title: "Close a 100 ms action deadline with honest stage evidence",
        setup:
          "A warm nominal sample records capture and transfer `12 ms`, queue `8 ms`, preprocessing `9 ms`, TensorRT inference `38 ms`, postprocess plus guards `7 ms`, and ROS 2 delivery plus acceptance `8 ms`. The deadline is `100 ms`, but a sustained 30-minute run reports p95 total age of `118 ms`.",
        steps: [
          "Sum the nominal stages: `T_nom = 12 + 8 + 9 + 38 + 7 + 8 = 82 ms`, leaving `100 - 82 = 18 ms` nominal headroom.",
          "Keep the measured p95 result separate from the nominal sum: `118 ms` misses the deadline by `18 ms`, proving the pipeline does not satisfy the declared tail gate.",
          "Correlate slow samples with queue depth, temperature, GPU and CPU frequency, recording load, memory pressure, and input shape; do not blame inference until stage traces identify the delay.",
          "Set every request's expiry to the action contract and make queue capacity explicit. When estimated or measured age exceeds `100 ms`, reject the output before command dispatch and count `deadline_expired`.",
          "Exercise the fallback: cancel the policy action, prevent queued goals from reviving, request the commissioned controller's ordinary hold or idle behavior, expose the reason, and require the designed reset or handoff.",
          "Only after a development change, rerun the same warm-up, load, duration, input distribution, power mode, ambient condition, and acceptance calculation; never replace p95 with the attractive 82 ms sample.",
        ],
        result:
          "The current edge bundle is rejected by its latency gate even though one typical sample fits; the system expires late commands and demonstrates a bounded software fallback without making a safety-function claim.",
        takeaway:
          "Deadline compliance is a distribution measured through the whole application under sustained target conditions, not the sum of one convenient trace or an engine benchmark alone.",
      },
      handsOn: {
        setup:
          "Use the actual Jetson-class target when available or a clearly labelled constrained equivalent. Keep execution disconnected from actuators and replay representative observations through the complete application path.",
        steps: [
          "Record exact hardware, software image, engine checksum, power and fan mode, enclosure or bench condition, ambient estimate, input shapes, concurrent services, queue policy, and measurement clock.",
          "Add one correlation ID carrying acquisition time, queue entry, preprocessing start and end, inference start and end, decode and guard result, publish time, acceptance, expiry, and cancellation.",
          "Warm the real shapes and code path, then profile inference-only and end-to-end latency separately across a declared sample count and at least one sustained representative-load interval.",
          "Calculate p50, p95, p99 when the sample count supports it, maximum, deadline misses, dropped inputs, queue depth, memory high-water mark, and observed temperature, clock, throttling, or power signals.",
          "Inject stale input, engine timeout or exception, full queue, executor loss, and a simulated thermal-policy event; verify that commands expire, cancellation propagates, fallback is bounded, and restart requires the declared conditions.",
          "Compare the optimized candidate with the runnable baseline under identical load, then publish pass, revise, or reject against the experiment charter without claiming that an equivalent computer proves Jetson behavior.",
        ],
        observe:
          "Tail delay often appears outside the engine—in capture, copies, queuing, logging, memory contention, first-use shape work, or transport—and grows only after concurrent services and heat are present.",
        doneWhen:
          "The target profile is reproducible, every sample has end-to-end lineage, sustained tail and thermal evidence meet the gate or visibly fail, and every injected fault reaches its tested application response.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Integrate and qualify an optimized policy on constrained edge compute by tracing sensor-to-command age, controlling queue and runtime state, profiling under realistic concurrent and thermal load, and connecting deadline, resource, and executor failures to observable cancellation and rollback behavior.",
        interviewPrompt:
          "A TensorRT benchmark reports 35 ms inference, but the robot occasionally reacts 200 ms late after warming up. Walk through the timestamps, queues, load, thermal evidence, percentiles, expiry policy, fallback test, and release decision you require.",
      },
      commonMistakes: [
        {
          mistake: "Reporting GPU compute time as the robot's action latency.",
          correction:
            "Measure acquisition age through queue, preprocessing, inference, decoding, guards, transport, and command acceptance with one correlated monotonic timeline.",
        },
        {
          mistake: "Running ten cool samples in maximum-performance mode and calling thermals verified.",
          correction:
            "Profile the approved module, software, power, fan, enclosure, ambient, concurrent load, and duty duration while recording temperature, clocks, throttling evidence, and tail latency.",
        },
        {
          mistake: "Calling a ROS 2 cancel callback or zero command a safety stop.",
          correction:
            "Describe and test the ordinary application response precisely, while leaving E-stop, STO, protective stops, braking, and safety validation to the qualified risk-derived system.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the nominal end-to-end age in the worked example?",
          answer:
            "`12 + 8 + 9 + 38 + 7 + 8 = 82 ms`, which is one nominal sample and does not override the measured 118 ms p95.",
        },
        {
          question: "Why should a full observation queue usually not keep growing?",
          answer:
            "Old observations produce stale actions for a changed physical scene, so capacity, overflow, expiry, and discard telemetry must be explicit and bounded.",
        },
        {
          question: "What does a tested application fallback fail to prove?",
          answer:
            "It does not prove an independently engineered safety function, safe stopping distance, E-stop, STO, protective-stop performance, or authorization for powered operation.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A correlated sensor→queue→engine→guard→ROS timeline beside temperature and deadline traces materially reveals stale actions and heat-driven tail growth.",
      },
    },
    {
      dayId: 166,
      mentalModel:
        "The final test set is a sealed exam booklet: opening it answers today's question, and writing hints from its pages into the model consumes its future secrecy.",
      explanation: [
        "Before opening the held-out manifest, verify its seal and scope. Record case IDs, asset and reset checksums, object and scene lineage, prompts, camera conditions, simulator or robot revision, scorer, timeout, intervention rules, prohibited outcomes, trial order, random seeds where applicable, and the exact baseline and candidate bundles. Neither model may receive a friendlier reset, hidden retry, newer processor, or different guard. If a setup failure invalidates a case, apply the predeclared handling rule and preserve the event rather than quietly replacing it.",
        "Run the final suite as measurement, not debugging. Operators may execute approved resets and emergency responsibilities, but they may not coach one policy, skip an awkward start, adjust lighting, retune a threshold, or add a demonstration after seeing an outcome. Capture every terminal category: unassisted success, partial progress, task failure by stage, timeout, policy exception, guard rejection, fallback, human intervention, prohibited action, and invalid trial. A guard that blocks an unsafe proposal can protect execution while still counting as policy evidence that may fail release.",
        "Keep denominators and slices. If candidate success is `s_C / n` and baseline success is `s_B / n` on paired cases, report both counts, `C = s_C/n`, `B = s_B/n`, and `Δ = C - B`; also show per-case pairs and the worst declared slice. Confidence intervals or repeated seeds can express uncertainty, but they do not rescue a missed mandatory gate. Overall success must not average away a prohibited contact, repeated intervention, large generalization gap, or tail-latency failure.",
        "Apply the signed charter exactly. `accept` means this identified bundle met the declared evidence gates inside the tested operating envelope; it is not universal safety or general intelligence. `revise` means the evidence is useful but one or more criteria failed or remained inconclusive. `reject` means a mandatory disqualifier or unacceptable regression occurred. Once results are visible, preserve the suite and report as historical test v1. Any result-driven change belongs to a new candidate and requires fresh untouched evidence for another final claim.",
      ],
      keyTerms: [
        {
          term: "Held-out evaluation",
          meaning:
            "A final comparison on examples and conditions excluded from training, calibration, checkpoint selection, threshold tuning, and development diagnosis until the candidate is frozen.",
          physicalExample:
            "A locked manifest contains new block instances and lighting scenes that neither policy author could inspect while making model or runtime choices.",
        },
        {
          term: "Paired trial",
          meaning:
            "A comparison where baseline and candidate face the same identified start condition and scoring rule, allowing the outcome difference to be traced case by case.",
          physicalExample:
            "Both policies attempt scene H-07 with the block at the same pose, though run order is controlled to avoid an unfair warm-up effect.",
        },
        {
          term: "Prohibited outcome",
          meaning:
            "A predeclared physical or system event whose occurrence independently fails or escalates the trial regardless of aggregate task score.",
          physicalExample:
            "The guarded simulation records the planned gripper path entering a forbidden operator zone even though the block later reaches the bin.",
        },
        {
          term: "Generalization gap",
          meaning:
            "The declared difference between performance on familiar development conditions and a genuinely held-out slice under comparable metrics.",
          physicalExample:
            "Success drops from 85 percent on known cube instances to 45 percent on untouched instances with the same task and reset rules.",
        },
      ],
      physicalExamples: [
        {
          title: "A blocked collision is not a policy success",
          scenario:
            "The action guard rejects a trajectory toward the bin wall, fallback holds the arm, and no contact occurs. The dashboard marks the system “safe” and the task incomplete.",
          lookFor:
            "Record guard protection separately from policy quality. The wrapper prevented execution, but the candidate proposed a disallowed action and did not complete the trial.",
        },
        {
          title: "The operator gives one model a second chance",
          scenario:
            "Baseline drops a block and the trial stops, while the candidate receives an unplanned reset because its first camera frame was blurry.",
          lookFor:
            "The comparison is biased unless the invalid-trial and retry rule was frozen and applied equally. Preserve both events and adjudicate before calculating metrics.",
        },
      ],
      workedExample: {
        title: "Apply a final gate that aggregate improvement cannot override",
        setup:
          "Baseline and candidate each run 24 paired held-out simulator cases. Baseline succeeds in 14; candidate succeeds in 18. The charter requires at least a 15-percentage-point improvement, zero prohibited zone entries, and p95 end-to-end age no greater than 100 ms.",
        steps: [
          "Calculate `B = 14 / 24 ≈ 0.583` and `C = 18 / 24 = 0.750`; retain the exact counts and case-pair table.",
          "Calculate `Δ = 0.750 - 0.583 ≈ 0.167`, or about 16.7 percentage points, so the candidate clears the 15-point success-improvement threshold.",
          "Read the other evidence: candidate p95 age is `94 ms`, which clears the latency gate, but one trial records a guard-blocked proposed entry into the prohibited zone.",
          "Apply the zero-prohibited-outcome rule independently. The blocked proposal prevented physical execution yet still demonstrates that the policy crossed the predeclared release boundary.",
          "Issue `reject` or the charter's exact non-advance result for candidate v1, without deleting the 18 successes, relabelling the guarded case as success, or weakening the gate after review.",
          "Archive the complete result as held-out evaluation v1 and open a failure-analysis ticket; any policy, data, guard, or threshold change creates a new candidate that cannot reuse this suite as untouched final proof.",
        ],
        result:
          "The candidate improves success and meets latency but does not advance because one mandatory behavior gate fails; the report retains every favorable and unfavorable fact.",
        takeaway:
          "Final evaluation has integrity only when a predeclared disqualifier can defeat an appealing aggregate improvement and the original result remains unchanged.",
      },
      handsOn: {
        setup:
          "Use the frozen simulator, baseline bundle, candidate bundle, scorer, and sealed held-out manifest. If the seal, environment, or reset artifacts cannot be verified, stop and report the exact integrity blocker.",
        steps: [
          "Verify checksums and lineage for cases, assets, resets, scorer, policy bundles, processors, guards, runtime, hardware profile, seed policy, and trial-order plan before revealing case content.",
          "Execute baseline and candidate with the same automation and allowed operator actions, recording case ID, start evidence, command trace, result, timing, guard events, intervention, and terminal state.",
          "Reconcile category counts to the total denominator and flag invalid trials through the frozen rule; never discard a failure because a camera, model, or operator behaved inconveniently.",
          "Calculate exact counts, paired outcome changes, overall and slice rates, worst slice, intervention and guard rates, prohibited outcomes, p50 and p95 age, deadline misses, and uncertainty where justified.",
          "Apply every mandatory gate and the primary effect rule in their written order, then obtain a reviewer sign-off before any result-driven discussion changes the development plan.",
          "Seal raw traces, summary, environment, deviations, and decision as final test v1; mark the suite revealed and prohibit its future description as untouched.",
        ],
        observe:
          "A model can win more cases while still failing release through one forbidden proposal, one fragile slice, intervention dependence, or late-command behavior that the overall success percentage conceals.",
        doneWhen:
          "Every planned case is accounted for, baseline and candidate conditions are comparable, the original rule produces the decision, deviations remain visible, and the revealed suite is retired from untouched status.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_INTEGRATION],
        workExample:
          "Lead a model release evaluation with controlled paired trials, immutable manifests, auditable operator rules, risk-linked disqualifiers, exact denominators, slice and latency reporting, deviation review, and an evidence-scoped decision that engineering and field teams can trust.",
        interviewPrompt:
          "A candidate improves held-out success from 14/24 to 18/24, meets latency, but its guard blocks one prohibited-zone proposal. Decide the release result, explain how the guard event is counted, and state what may happen to this test suite next.",
      },
      commonMistakes: [
        {
          mistake: "Counting a guard-blocked unsafe proposal as a successful safe trial.",
          correction:
            "Record that the wrapper prevented execution, while separately counting the policy proposal, fallback, task failure, and mandatory-gate consequence defined by the charter.",
        },
        {
          mistake: "Dropping invalid-looking cases after learning which policy they hurt.",
          correction:
            "Use the frozen invalid-trial rule, preserve the raw event, apply it symmetrically, and have deviations adjudicated without result-aware replacement.",
        },
        {
          mistake: "Tuning the candidate and rerunning the same suite as though it were still final.",
          correction:
            "Treat the revealed cases as historical or development evidence, version the changed candidate, and use a genuinely fresh untouched suite for the next final claim.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the candidate's absolute success improvement in the worked example?",
          answer:
            "`18/24 - 14/24 = 4/24 ≈ 0.167`, or about 16.7 percentage points.",
        },
        {
          question: "Why does guard intervention not erase the policy defect?",
          answer:
            "The guard is a separate protective software layer; its rejection prevents execution but still reveals that the policy proposed a disallowed action and failed the task.",
        },
        {
          question: "When is a held-out suite no longer untouched?",
          answer:
            "As soon as its content or outcomes are used to choose data, architecture, hyperparameters, thresholds, runtime settings, or any other candidate decision.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The paired case ledger and independent gate table preserve exact denominators and disqualifiers more faithfully than a generic success-rate illustration.",
      },
    },
    {
      dayId: 167,
      mentalModel:
        "Failure analysis is a mechanic listening for one fault family at a time; replacing every part hides the cause and teaches nothing transferable.",
      explanation: [
        "Begin with observation, not solution. For every failed trial, reconstruct the earliest divergence from expected behavior using synchronized input, policy output, decoded command, guard decision, controller feedback, physical or simulated state, latency, and intervention evidence. Assign a primary failure stage only when the trace supports it, keep contributing factors, and label unknown when evidence is missing. “Model bad” is not a category; neither is “needs more data” until the failure shows what coverage or label is absent.",
        "Use a causal taxonomy that maps to owners and tests. Input and perception failures include occlusion, exposure, calibration, missing frames, or wrong bindings. Data and distribution failures include absent object poses, inconsistent demonstrations, class imbalance, or leakage. Policy failures include mode averaging, poor temporal context, unstable output, or wrong action semantics. Runtime and integration failures include queue age, unsupported operator, decoder mismatch, guard rejection, controller abort, or lost feedback. One trial can have a chain, but repair the earliest controllable cause first.",
        "Choose the narrowest intervention. Add or repair data when the trace demonstrates missing or contradictory coverage; change model or objective when representation or optimization evidence supports that hypothesis; change export or runtime when source behavior is correct but optimized behavior diverges; change integration when fresh valid actions are mishandled. Do not automatically train on failed held-out episodes. Copying them into the training set may be legitimate for candidate v2, but their old test result stays historical and a separately reserved suite must judge future generalization.",
        "Run one development experiment per important hypothesis when practical. Freeze a new baseline, change one lever, predict which failure category and metric should move, and watch for regressions elsewhere. A failure-directed data batch needs the same consent, safety, schema, quality, and split rules as dataset v1; demonstrations captured during intervention are not clean expert labels by default. Stop when evidence is insufficient or a change enters a safety-rated, controller, or hardware boundary owned by qualified specialists.",
      ],
      keyTerms: [
        {
          term: "Failure taxonomy",
          meaning:
            "A versioned classification of observable failure stages and causes designed to route evidence toward a responsible owner and discriminating next test.",
          physicalExample:
            "A missed grasp is separated into occluded object estimate, stale action, wrong approach, guard rejection, grip failure, or false success detection.",
        },
        {
          term: "Earliest divergence",
          meaning:
            "The first trace point where observed state departs from the declared successful sequence, before downstream symptoms multiply.",
          physicalExample:
            "The camera binding swaps before the policy predicts leftward motion; the later wall approach is a consequence rather than the first defect.",
        },
        {
          term: "Discriminating experiment",
          meaning:
            "A bounded comparison whose possible results distinguish between competing causal explanations instead of merely trying many changes together.",
          physicalExample:
            "Replaying identical source outputs through two decoders tests action-statistics mismatch without retraining or changing the camera pipeline.",
        },
        {
          term: "Test-set consumption",
          meaning:
            "Loss of untouched status when evaluation cases or outcomes influence any design, data, threshold, runtime, or model choice.",
          physicalExample:
            "After glare cases inspire new augmentation, those cases can verify the historical symptom but cannot serve as fresh proof of generalization.",
        },
        {
          term: "Regression budget",
          meaning:
            "Predeclared limits on acceptable worsening in other tasks, slices, timing, resources, or behavior while repairing the targeted failure.",
          physicalExample:
            "Glare success may improve, but familiar-scene success may fall by no more than five points and p95 latency may not exceed 100 ms.",
        },
      ],
      physicalExamples: [
        {
          title: "More demonstrations cannot fix a swapped decoder",
          scenario:
            "Source-policy outputs match the teacher, but the deployed adapter interprets action element two as wrist velocity instead of elbow position.",
          lookFor:
            "The earliest divergence is the action contract. Repair and differential-test the decoder; collecting more episodes would preserve the integration defect and waste evidence.",
        },
        {
          title: "Glare failures reveal a coverage hole",
          scenario:
            "Three held-out trials fail only when sunlight washes out the dark block, while source and edge runtimes agree and latency stays within bounds.",
          lookFor:
            "Form a visibility and coverage hypothesis, collect or synthesize approved development examples with measured lighting, and reserve different untouched glare scenes for candidate v2.",
        },
      ],
      workedExample: {
        title: "Convert five failures into one causal next experiment",
        setup:
          "Held-out evaluation v1 contains five candidate failures: three dark-block trials under strong glare lose the object before motion, one nominal scene exceeds its deadline after recorder contention, and one grasp reaches the object but the gripper stalls. Source and TensorRT outputs agree within tolerance.",
        steps: [
          "Reconstruct traces and assign primary stages: three `input_visibility`, one `runtime_deadline`, and one `end_effector_execution`; retain each secondary factor and evidence link.",
          "Reject “quantization drift” as the common cause because source and engine parity passes on the failed inputs; do not retrain merely because the artifact is a learned policy.",
          "Choose the largest coherent category, glare visibility, and write the hypothesis: adding approved glare-varied development demonstrations and augmentation will improve glare-development success by at least 20 points without exceeding the regression budget.",
          "Keep held-out v1 immutable. Build new train/development scene IDs and reserve separate untouched glare assets for final v2; record that the original three cases inspired the change and are now diagnostic only.",
          "Run the one-change development experiment while separately assigning recorder contention to runtime owners and gripper stall to hardware or controller diagnosis; do not mix all three repairs into one causal comparison.",
          "Compare v2 with the frozen v1 candidate on new glare-development cases, familiar cases, action drift, guard events, and latency; advance only if the targeted category moves and unrelated gates remain satisfied.",
        ],
        result:
          "The team obtains a testable glare-coverage experiment, routes two unrelated faults to their correct owners, and preserves fresh evaluation evidence instead of laundering revealed failures into another final score.",
        takeaway:
          "Failure-directed improvement is disciplined routing: trace the earliest divergence, choose one evidence-supported lever, and spend new data and test evidence where they can answer a causal question.",
      },
      handsOn: {
        setup:
          "Use the archived held-out v1 traces, development simulator, and a copy of the failure taxonomy. Do not modify model, data, engine, guard, or scorer until trace review produces a written hypothesis.",
        steps: [
          "Build a timeline for every failure from acquisition through terminal state, including versions, timestamps, values, guards, feedback, intervention, and the first missing piece of evidence.",
          "Classify primary and contributing causes under input, data, policy, export, runtime, integration, controller or hardware, and evaluation; require a trace citation or mark the label provisional.",
          "Rank categories by consequence, frequency, confidence, and repair ownership, then choose one category whose next experiment stays inside authorized development scope.",
          "Write competing hypotheses and one discriminating test, expected metric movement, regression budget, stop rule, and artifacts that must remain unchanged.",
          "If new data are justified, create new lineage IDs, quality review, train and development assignments, and a separate reserve; never overwrite dataset v1 or call revealed final cases untouched.",
          "Run the bounded experiment, compare against the frozen candidate on target and regression slices, publish category counts before and after, and retain failures that the change does not explain.",
        ],
        observe:
          "A single visible symptom such as a missed grasp often splits into unrelated causes, while several different symptoms may share one earlier fault such as stale observations or wrong action statistics.",
        doneWhen:
          "Every claimed cause links to trace evidence, one intervention targets one causal category, historical test integrity is explicit, fresh reserve evidence exists, and regression gates decide whether the change advances.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Run a cross-functional robot-policy failure review that reconstructs sensor-to-outcome traces, separates data, model, optimization, runtime, integration, and hardware causes, routes owners, protects test-set integrity, and turns the highest-impact category into one measurable regression-controlled experiment.",
        interviewPrompt:
          "Three held-out glare cases fail, one case is late, and one gripper stalls. Explain how you find earliest divergence, choose between data, model, runtime, and hardware changes, avoid test leakage, and prove that the chosen repair caused improvement.",
      },
      commonMistakes: [
        {
          mistake: "Adding every failed held-out trial to training and reporting a rerun on the same suite.",
          correction:
            "Preserve the original result, label those cases development evidence after use, create versioned new data, and judge the next candidate with a fresh untouched reserve.",
        },
        {
          mistake: "Changing data, architecture, quantization, queueing, and thresholds in one rescue run.",
          correction:
            "Prioritize the earliest supported cause, change one primary lever, freeze the rest, and use a discriminating metric plus regression budget to learn what worked.",
        },
        {
          mistake: "Assigning every task failure to the learned policy.",
          correction:
            "Trace sensor input, preprocessing, source output, export parity, decode, guards, transport, controller, and physical result before assigning a cause and owner.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the earliest divergence in the swapped-decoder example?",
          answer:
            "The deployed decoder assigns the wrong physical meaning to an action element; later motion error is downstream, and more training data does not repair that contract.",
        },
        {
          question: "May held-out v1 glare cases be used to inspire candidate v2?",
          answer:
            "Yes, if they are explicitly treated as consumed historical or development evidence; candidate v2 then needs a genuinely fresh untouched suite for a final claim.",
        },
        {
          question: "Why use a regression budget?",
          answer:
            "It prevents a targeted improvement from advancing while it silently worsens familiar tasks, another slice, latency, resources, guard behavior, or a mandatory outcome.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The learner's evidence-linked timeline and failure ledger carry local causal detail; a generic failure tree would invite premature classification without traces.",
      },
    },
    {
      dayId: 168,
      mentalModel:
        "A deployable model is a labelled spare engine in a service crate: the exact parts, fit, limits, test sheet, installation recipe, and rollback route travel together.",
      explanation: [
        "Freeze a system bundle, not a lonely weights file. The bundle includes source checkpoint, policy configuration, processors, tokenizers when present, normalization and de-normalization statistics, observation and action schemas, robot adapter, ONNX graph, TensorRT engine or reproducible build recipe, calibration lineage, runtime dependencies, command guard, ROS 2 interface, target profile, and checksums. Name the exact selected artifact at every step; “ACT v1” or “latest engine” cannot tell an operator which bytes produced a command.",
        "Write an operating envelope from measured evidence. State supported robot and calibration identities, task, objects and scenes, camera configuration, input shapes, rates, action mode, units, frames, limits, compute module, software image, power and cooling condition, concurrency, latency deadline, queue policy, startup checks, fallback, and known unsupported conditions. The held-out report establishes only the tested slices and counts. It does not license novel tools, payloads, firmware, lighting, enclosures, or autonomous operation beyond the approved risk controls.",
        "Make release gates machine-checkable where practical. On installation, verify hashes, signatures or trusted provenance, compatibility, schemas, processors, golden-corpus parity, engine load, representative latency smoke, guard behavior, cancellation, fallback, monitoring, and rollback. During operation, observe version, input freshness, queue age, inference and end-to-end latency, invalid values, guard reasons, action expiry, executor state, resource pressure, and application fallbacks without logging sensitive raw data unnecessarily. A heartbeat or successful load is availability evidence, not task acceptance.",
        "Practice restoration before calling v1 deployable. Keep the previous accepted baseline immutable, document how to select it, and rehearse rollback in the disconnected or approved staging path after injected load, parity, latency, and startup failures. Publish evaluation, drift, latency and thermal reports, deviations, approvals, limitations, and a first post-release experiment. If any required artifact, target test, owner, or safety boundary remains missing, label the bundle `candidate` or `blocked`; a deadline does not convert incomplete evidence into release.",
      ],
      keyTerms: [
        {
          term: "Deployment bundle",
          meaning:
            "The checksummed collection of model, processing, schema, adapter, runtime, guard, target, evidence, monitoring, fallback, and rollback artifacts required to reproduce behavior.",
          physicalExample:
            "A service package pairs one engine plan with camera ordering, joint statistics, robot calibration ID, Jetson image, latency report, and previous-version restore command.",
        },
        {
          term: "Operating envelope",
          meaning:
            "The bounded physical, sensing, compute, software, timing, and task conditions for which the collected evidence supports use.",
          physicalExample:
            "Model v1 supports one foam-block task, fixed cameras, declared lighting range, 10 Hz actions, one robot calibration, and the tested power and cooling mode.",
        },
        {
          term: "Artifact provenance",
          meaning:
            "Traceable origin and transformation history linking each released byte to source code, data, configuration, builder, environment, reviewer, and evidence.",
          physicalExample:
            "The engine checksum points to an ONNX checksum, exporter revision, TensorRT version, build profile, calibration manifest, and signed release record.",
        },
        {
          term: "Rollback",
          meaning:
            "A rehearsed transition from a failing candidate to a known prior bundle or disabled state, including trigger, authority, compatibility, verification, and terminal result.",
          physicalExample:
            "A latency smoke-test failure prevents activation, restores baseline `b7`, confirms its golden outputs, and records why model v1 stayed inactive.",
        },
        {
          term: "Release gate",
          meaning:
            "A mandatory, evidence-linked condition that an identified bundle must pass before a named environment and authority may activate it.",
          physicalExample:
            "The exact engine cannot enter staging unless hash, schema, parity, p95 latency, cancellation, fallback, and evaluation checks all pass.",
        },
      ],
      physicalExamples: [
        {
          title: "Engine file arrives without its measuring tape",
          scenario:
            "A technician receives `policy.plan`, but not the camera order, normalization statistics, input profile, TensorRT version, robot calibration, or output decoder.",
          lookFor:
            "The file is not deployable because equal-shaped inputs and outputs can carry wrong physical meaning. Activation stays blocked until the complete versioned bundle is restored.",
        },
        {
          title: "Rollback exists only on a slide",
          scenario:
            "A new edge image fails its latency smoke test. The documented baseline command references a removed container tag and cannot load the previous engine.",
          lookFor:
            "A rollback claim requires an executable restore drill, retained artifacts, compatible configuration and data, startup verification, owner authority, and recorded terminal state.",
        },
      ],
      workedExample: {
        title: "Freeze model v1 as a reviewable release candidate",
        setup:
          "Candidate checkpoint `step_6000` passed source-to-engine parity and its development gates. Final evaluation reports 21 unassisted successes in 24 held-out trials, zero prohibited outcomes, and p95 end-to-end age of 91 ms against a 100 ms gate. A prior baseline remains available.",
        steps: [
          "Assign immutable identities and checksums to checkpoint, configuration, processors, statistics, schema, adapter, ONNX, engine, builder recipe, guard, target image, dataset manifests, scorer, and every report.",
          "Write the evidence ledger: parity corpus and tolerances pass, final success is `21/24 = 87.5%`, prohibited count is zero, and p95 age `91 ms ≤ 100 ms`; retain slice counts, interventions, failures, and thermal conditions.",
          "Encode the operating envelope and unsupported conditions, including exact robot and calibration, cameras, task objects, action units and frames, target module, software, power and cooling, concurrent load, queue, deadline, fallback, and supervision.",
          "Create startup gates for provenance, compatibility, bindings, golden outputs, finite decoded actions, representative latency, guard and cancel behavior, plus monitoring rules for age, misses, invalid output, resource pressure, and fallback.",
          "Inject a bad checksum and a latency-smoke failure in the disconnected release path; require activation denial, execute rollback to the prior baseline, verify its identity and golden cases, and capture the restore duration and result.",
          "Obtain required technical, validation, operations, and safety-boundary approvals for the stated environment, publish limitations and next experiment, and label the bundle `v1` only if every mandatory owner and artifact closes.",
        ],
        result:
          "Model v1 becomes a reproducible, evidence-scoped deployment bundle with a tested refusal and rollback path, rather than an optimized file whose surrounding assumptions live in people's memories.",
        takeaway:
          "Freezing means making the exact behavior reconstructable and bounded; it never means the model is universally finished or allowed to bypass physical safeguards.",
      },
      handsOn: {
        setup:
          "Use a clean disconnected workspace or approved staging image, the selected artifacts, prior baseline, and the week's evidence. Do not connect the bundle to unapproved hardware.",
        steps: [
          "Generate a release manifest listing every artifact, checksum, producer revision, dependency, transformation, compatibility condition, evidence link, owner, and retention location.",
          "Install the bundle into a clean process or image from the manifest alone, then validate schemas, processors, input profiles, golden outputs, decoded units, guards, cancellation, and a representative latency smoke.",
          "Write the operating envelope and explicit non-claims in language an integrator can test, including physical task limits, compute and thermal conditions, supervision, fallback, and safety boundary.",
          "Configure structured monitoring for artifact identity, observation age, queue depth, stage and tail latency, deadline misses, invalid values, guard decisions, action expiry, executor health, and fallback result.",
          "Inject incompatible schema, corrupted checksum, stale observation, engine exception, missed deadline, and unavailable dependency; verify activation denial or bounded fallback with no hidden substitute.",
          "Restore the prior baseline from retained artifacts, rerun its golden and startup checks, measure restore time, then publish the signed evaluation, drift, performance, limitation, rollback, and ship-or-block record.",
        ],
        observe:
          "The clean install exposes assumptions that a training machine hides: local caches, unpinned processors, missing statistics, target-built engines, renamed topics, unavailable plugins, or a rollback image that no longer starts.",
        doneWhen:
          "A reviewer can recreate the bundle from immutable provenance, all gates and faults produce the declared result, rollback succeeds, the envelope matches evidence, and no missing approval is concealed by the v1 label.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "Own the final robot-policy release pack across model, processor, export, edge runtime, ROS 2 integration, observability, evidence, operating limits, and rollback; block activation on drift, compatibility, deadline, fallback, or approval failures and make field diagnosis version-exact.",
        interviewPrompt:
          "What belongs in a deployable robot-model v1 beyond weights? Describe provenance, processor and action contracts, target compatibility, operating envelope, startup and runtime gates, evaluation scope, fault injection, monitoring, rollback rehearsal, and safety non-claims.",
      },
      commonMistakes: [
        {
          mistake: "Publishing weights and an engine under the tag `latest` and calling that a release.",
          correction:
            "Freeze immutable identities for the full processing, schema, adapter, runtime, guard, target, evidence, monitoring, fallback, and rollback bundle.",
        },
        {
          mistake: "Describing held-out success as support for any object, lighting, payload, or robot.",
          correction:
            "Write the operating envelope from exact tested cases, hardware, software, timing, and conditions, and list unsupported or unknown conditions explicitly.",
        },
        {
          mistake: "Documenting rollback without running it from retained artifacts.",
          correction:
            "Inject an activation failure, restore the prior bundle in a clean path, verify identity and golden behavior, measure the transition, and preserve the terminal evidence.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the held-out success rate in the worked example?",
          answer:
            "`21/24 = 0.875`, or 87.5 percent, within the exact tested cases and not beyond the stated operating envelope.",
        },
        {
          question: "Why is a serialized engine alone not a deployment bundle?",
          answer:
            "It omits input and output semantics, processors, statistics, target compatibility, guards, runtime, evidence, monitoring, fallback, rollback, provenance, and physical operating limits.",
        },
        {
          question: "What must happen when a mandatory approval is missing?",
          answer:
            "The artifact remains a candidate or blocked for that environment; successful tests and schedule pressure do not create the missing authority.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The checksummed release manifest, operating-envelope table, and executed rollback record are the precise artifacts; a decorative bundle diagram would be less auditable.",
      },
    },
  ],
} satisfies ChapterContent;
