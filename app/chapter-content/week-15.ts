import type { ChapterContent } from "../chapter-content-types";

const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";
const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";

export const week15Content = {
  week: 15,
  title: "Turn demonstrations into measured, bounded robot policies",
  purpose:
    "Build imitation-learning policies without confusing supervised fit with autonomous skill. This chapter defines the observation-to-action contract for behavior cloning, traces why a learner creates unfamiliar states, applies DAgger-style expert relabelling in a safe simulator or paper world, compares temporal context with action chunks, opens ACT far enough to understand its sequence and latent-variable contracts, separates offline validation from closed-loop rollout evidence, constructs a deadline-aware inference loop, and finishes with a frozen comparison whose success, latency, interventions, and failures can be reproduced.",
  prerequisites: [
    "Complete Week 13's tensor, Dataset, DataLoader, grouped-split, training-loop, checkpoint, reproducibility, and model-card work.",
    "Complete Week 14's episode, trajectory, teleoperation, action-space, timestamp-alignment, schema, split, quality-review, and dataset-card work.",
    "Bring a small non-sensitive demonstration table or a synthetic equivalent with episode IDs, timestamped observations, teacher actions, reset conditions, and terminal outcomes.",
    "Keep every hands-on exercise in a paper world, a bounded simulator, or an already commissioned platform under qualified supervision; collecting expert labels does not authorize unsafe autonomous motion.",
  ],
  outcomes: [
    "Specify behavior cloning as supervised learning over aligned observation-action examples, choose a loss that matches the action contract, and state exactly what low held-out loss does and does not prove.",
    "Explain covariate shift and compounding error, then run a small DAgger-style loop that records learner-visited states, queries an expert safely, aggregates labelled data, retrains, and evaluates each resulting policy independently.",
    "Distinguish observation history from an action chunk, calculate chunk tensor shapes and execution timing, and select a replanning or overlapping-chunk rule that preserves responsiveness.",
    "Trace ACT training and inference through image and state observations, future-action targets, a conditional latent variable, transformer sequence prediction, reconstruction and KL terms, and bounded chunk execution.",
    "Design offline and closed-loop evaluation as separate evidence layers with frozen episodes, initial conditions, success rules, intervention labels, latency measures, and failure stages.",
    "Implement a policy loop that resets episode state, checks observation freshness, reproduces preprocessing, measures inference latency, validates and bounds decoded actions, rejects stale output, and enters a task-specific safe fallback.",
    "Compare two policy checkpoints on the same predeclared suite and make a decision from paired trial evidence rather than a preferred demo, one loss value, or metrics chosen after seeing results.",
  ],
  jobTargets: [
    ROLE_PHYSICAL_AI,
    ROLE_VALIDATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
  ],
  sources: [
    {
      label: "LeRobot — Imitation Learning on Real-World Robots",
      url: "https://huggingface.co/docs/lerobot/en/il_robots",
      useFor:
        "Maintainer workflow connecting a recorded robot dataset to ACT training, checkpoint resume behavior, policy selection, and controlled policy use on the matching robot configuration.",
    },
    {
      label: "LeRobot — Adding a Policy",
      url: "https://huggingface.co/docs/lerobot/main/en/bring_your_own_policies",
      useFor:
        "Official policy interface for episode reset, per-step action selection, action-chunk prediction, training loss, padded-action masks, feature validation, preprocessing, postprocessing, and evaluation integration.",
    },
    {
      label: "Ross, Gordon, and Bagnell — DAgger",
      url: "https://proceedings.mlr.press/v15/ross11a.html",
      useFor:
        "Primary paper for the sequential-distribution problem and the DAgger loop: roll out the current or mixed policy, ask the expert to label visited states, aggregate those examples, retrain, and select using validation.",
    },
    {
      label: "Zhao et al. — Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware",
      url: "https://arxiv.org/abs/2304.13705",
      useFor:
        "Primary ACT paper for future-action sequence prediction, effective-horizon reduction, overlapping chunks and temporal ensembling, the conditional-VAE training path, compounding-error motivation, ablations, and rollout evidence.",
    },
    {
      label: "LeRobot — Policy Deployment",
      url: "https://huggingface.co/docs/lerobot/main/inference",
      useFor:
        "Maintainer deployment contract for a real policy loop, control frequency, synchronous versus queued chunk inference, observation-to-action execution, recording, reset behavior, and latency-sensitive runtime choices.",
    },
  ],
  days: [
    {
      dayId: 99,
      mentalModel:
        "Behavior cloning is a supervised translator: it receives a precisely defined robot observation and predicts the teacher action paired with that same physical moment.",
      explanation: [
        "Behavior cloning turns demonstrations into labelled examples. Each input is an observation available to the policy, such as a camera image, joint positions, gripper state, and task text. Each target is the teacher action that belongs to that observation under a declared timing rule. A model learns parameters that reduce a supervised loss between its prediction and the recorded target. It is not learning from reward, searching the environment for a plan, or discovering which result is safe. It is fitting the action choices represented in the demonstrations.",
        "The observation-action pair must have one physical meaning before it becomes a tensor. If an image timestamp is 2.000 seconds and the action at 2.050 seconds reflects the operator's response to that image, the alignment rule must preserve that causal lag. Joint targets in radians cannot be silently mixed with measured joint state, degree values, velocity commands, or Cartesian positions. Normalization statistics come from the training split and must be saved with the checkpoint, because a correctly shaped but differently scaled value can produce a physically wrong command.",
        "The loss expresses which prediction differences training tries to reduce. Mean squared error penalizes larger numeric errors strongly and can be suitable for one continuous action baseline; mean absolute error treats error size linearly; a categorical loss may suit a declared discrete action. No loss knows that two joints have different safe ranges or that averaging two valid ways around an obstacle may point into it. Report error per action component and in physical units after de-normalization, not only one convenient training scalar.",
        "A held-out demonstration score tests examples drawn from the recorded distribution. During a rollout, the policy chooses actions that change the next observation. One small error can therefore create a state absent from the demonstrations, where the policy has no taught recovery. This is why low validation loss is useful evidence about imitation on recorded examples but is not evidence of task success, collision avoidance, timing fitness, or recovery. Those claims need bounded closed-loop trials with frozen resets and visible failures.",
      ],
      keyTerms: [
        {
          term: "Behavior cloning",
          meaning:
            "Supervised learning of a policy from observation-action pairs supplied by a demonstrator.",
          physicalExample:
            "A model receives a picture and joint state from a block-sorting attempt and predicts the operator's next bounded joint target.",
        },
        {
          term: "Policy",
          meaning:
            "A function that maps the observations and optional context available now to an action proposal.",
          physicalExample:
            "A policy maps front-camera pixels plus six joint positions to six target positions for the next control interval.",
        },
        {
          term: "Supervised loss",
          meaning:
            "A numerical rule comparing a policy prediction with the paired teacher target so training can adjust model parameters.",
          physicalExample:
            "Action errors of 0.10 and -0.10 radians have a two-value mean squared error of 0.01 radians squared.",
        },
        {
          term: "Action target",
          meaning:
            "The teacher command selected as the correct output for one aligned observation under a declared representation and timing rule.",
          physicalExample:
            "The target may be the leader arm's joint positions 50 milliseconds after the matching camera exposure, not the follower's later measured positions.",
        },
        {
          term: "Closed-loop rollout",
          meaning:
            "An episode in which the policy's action affects the world and therefore changes the observations the policy receives next.",
          physicalExample:
            "A steering prediction moves a simulated rover off centre, so its next camera image is different from a recorded teacher-centred view.",
        },
      ],
      physicalExamples: [
        {
          title: "Teacher cards for a paper sorter",
          scenario:
            "Draw eight block layouts on cards. On the back, write the teacher's next move as left, right, grasp, release, or stop. Let a learner rule view only the front and predict the matching move.",
          lookFor:
            "The cards demonstrate supervised observation-to-action matching, while any layout not drawn on a card exposes the absence of taught behavior rather than a mysterious model failure.",
        },
        {
          title: "Two paths around one cup",
          scenario:
            "Lay arrow sequences that pass a cup on its left and right. At the same-looking start state, one demonstration begins with -1 and another with +1 on the sideways action axis.",
          lookFor:
            "A squared-error predictor can average the targets to 0 and head at the cup; a small numeric loss does not guarantee that the mean action is physically valid.",
        },
      ],
      workedExample: {
        title: "Calculate and interpret one tiny cloning loss",
        setup:
          "A two-joint policy is evaluated on three held-out observation-action pairs. Teacher actions are `[0.20, 0.50]`, `[0.00, 0.40]`, and `[-0.20, 0.30]` radians. Predictions are `[0.30, 0.40]`, `[0.10, 0.40]`, and `[-0.10, 0.20]` radians.",
        steps: [
          "Verify the contract: each prediction and target has ordered axes `[joint_1, joint_2]`, uses radians, refers to the same command type, and is aligned to the corresponding observation.",
          "Subtract target from prediction to get six errors: `[0.10, -0.10]`, `[0.10, 0.00]`, and `[0.10, -0.10]` radians.",
          "Square the six errors to get `[0.01, 0.01, 0.01, 0.00, 0.01, 0.01]` radians squared.",
          "Add the squared errors to obtain `0.05`, then divide by six action values: `MSE = 0.05 / 6 ≈ 0.0083` radians squared.",
          "Report component evidence too: joint 1 has three errors of `0.10` radians, while joint 2 has errors `-0.10`, `0.00`, and `-0.10`; the average hides that pattern.",
          "Keep the conclusion narrow: the checkpoint approximately matches these recorded targets; no rollout, recovery, latency, limit, or task-success claim has been tested.",
        ],
        result:
          "The toy held-out MSE is about 0.0083 radians squared, with a repeated +0.10-radian bias on joint 1 that deserves diagnosis.",
        takeaway:
          "A loss becomes useful only after its axes, timing, units, denominators, and evidence boundary are readable.",
      },
      handsOn: {
        setup:
          "Use a spreadsheet or a short CPU-only program with twelve synthetic paper-sorter states and discrete or two-value continuous actions. Do not connect predictions to hardware.",
        steps: [
          "Write the observation schema, action representation, units, component order, timestamp pairing rule, allowed range, and reset condition before creating a model input.",
          "Split whole paper episodes into training and held-out groups; verify that no frame or near-duplicate layout from one episode crosses the boundary.",
          "Create a nearest-card or tiny regression baseline, fit only the training pairs, and save every preprocessing value beside its rule or checkpoint.",
          "Calculate held-out error overall and per action component, then inspect the largest three errors against their cards instead of reporting only an average.",
          "Roll the policy through one familiar layout and one shifted layout on paper, letting each predicted move create the next state; record every state, action, and terminal result.",
          "Write two separate conclusions: what the offline result supports and what the two closed-loop paper episodes reveal but cannot prove about a physical robot.",
        ],
        observe:
          "The model can reproduce individual teacher labels while its own sequence enters an unseen card or amplifies a small directional bias.",
        doneWhen:
          "A reviewer can reconstruct every aligned pair, recalculate the loss and component errors, confirm the grouped split, and see that rollout evidence is reported separately.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Turn a demonstration schema into an explicit policy input and action target, build preprocessing and output assertions around the training code, and review per-joint physical errors before a checkpoint is allowed into a bounded rollout harness.",
        interviewPrompt:
          "Your behavior-cloning checkpoint has very low validation MSE but repeatedly misses the task. Trace observation-action alignment, units, normalization, split leakage, multi-modal targets, and closed-loop distribution shift in the order you would test them.",
      },
      commonMistakes: [
        {
          mistake: "Calling behavior cloning reinforcement learning because the robot eventually attempts a task.",
          correction:
            "Behavior cloning fits demonstrator-labelled actions with supervised learning; task interaction during later evaluation does not add a reward-learning objective.",
        },
        {
          mistake: "Pairing every observation row with the action at the same row number without checking clocks or operator delay.",
          correction:
            "Define and test the causal timestamp-alignment rule so each target is the teacher response intended for that observation rather than merely a nearby record.",
        },
        {
          mistake: "Reporting one normalized MSE as proof that actions are accurate and safe.",
          correction:
            "De-normalize predictions, report component errors with units and limits, inspect worst cases, then use independent guards and closed-loop trials for behavior claims.",
        },
      ],
      checkQuestions: [
        {
          question: "What exactly is the labelled example in behavior cloning?",
          answer:
            "It is an observation and the demonstrator action paired to it under a declared schema, representation, unit, and timing rule.",
        },
        {
          question: "Why can averaging two teacher actions be physically wrong?",
          answer:
            "When the actions are two distinct valid modes, such as passing an obstacle on opposite sides, their numeric mean can lie between the modes and point into the obstacle.",
        },
        {
          question: "What does low held-out action loss fail to establish?",
          answer:
            "It does not establish closed-loop task success, recovery from learner-created states, deadline fitness, safe action execution, or performance outside recorded conditions.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A labelled observation-to-policy-to-action map with a separate physical feedback arrow makes the supervised pair and the later closed-loop distribution change visibly distinct.",
      },
    },
    {
      dayId: 100,
      mentalModel:
        "DAgger is a supervised correction cycle: let the learner reveal states it actually visits, ask an expert what should happen there, add those labels, and retrain.",
      explanation: [
        "Ordinary behavior cloning trains on observations visited by the demonstrator. During autonomous use, the learner's small action errors alter the scene, so later observations come from the learner's own state distribution. This mismatch is covariate shift: the input distribution changes even if the action definition stays the same. Errors can compound because an unfamiliar state produces another poor action, which creates a still less familiar state. The rough expression `p^N` illustrates fragility only under independent equal-probability decisions; robot decisions are linked, so actual rollouts remain necessary.",
        "DAgger, short for Dataset Aggregation, directly collects labels on states induced by successive learner policies. In the original loop, an iteration rolls out a mixture of the expert and current learned policy, queries the expert for the action they would choose at each visited state, adds those labelled states to the accumulated dataset, and trains the next policy on the aggregate. The expert action used as a label need not be the action that was executed at that moment. Keep executed controller, expert label, learner proposal, and any intervention as separate fields.",
        "An expert or oracle must be able to label recovery states correctly. A hurried operator takeover is not automatically a clean DAgger label: the takeover may begin late, contain communication delay, or reflect emergency motion rather than the preferred action from the recorded state. Define when labels are requested, how their timestamps align, whether the expert or learner controls motion, and how disagreement and abstention are stored. Querying an unsafe or ambiguous state should produce an abstain, abort, or quarantine result rather than a fabricated target.",
        "DAgger changes the data and the policy every round, so every round needs lineage and independent evaluation. Record the starting checkpoint, mixture rule or intervention policy, rollouts, learner-visited states, expert identity, labels, aggregation recipe, training configuration, and resulting checkpoint. Do not declare improvement from a larger dataset or a falling aggregate loss. Freeze an evaluation suite that is not added to training, run each candidate on it, and report task success, interventions, new failure states, and safety stops.",
      ],
      keyTerms: [
        {
          term: "Covariate shift",
          meaning:
            "A change in the distribution of observations presented to the policy between training examples and later use.",
          physicalExample:
            "A line follower trained on centred camera views begins seeing the line at the image edge after its own steering error.",
        },
        {
          term: "Compounding error",
          meaning:
            "A sequence effect in which one prediction error changes a later input and makes additional errors more likely or more severe.",
          physicalExample:
            "A gripper approaches five millimetres too far left, misses the handle, then receives views of an empty grasp never present in successful demonstrations.",
        },
        {
          term: "DAgger",
          meaning:
            "An iterative imitation-learning method that labels states visited by the learner or an expert-learner mixture, aggregates them with earlier data, and retrains.",
          physicalExample:
            "After a paper rover drifts into an edge cell, a teacher labels the turn that would recover from that exact cell and the example joins the next training set.",
        },
        {
          term: "Expert query",
          meaning:
            "A request for the action an authorized, qualified demonstrator would choose from a recorded learner-visited state.",
          physicalExample:
            "A simulator pauses on an off-centre view and asks the supervisor to mark turn-right, turn-left, continue, stop, or abstain.",
        },
        {
          term: "Dataset aggregation",
          meaning:
            "Appending newly labelled learner-visited examples to a traceable accumulated dataset rather than replacing the original demonstrations.",
          physicalExample:
            "Round 0's 40 teacher states and Round 1's 12 recovery labels form a versioned 52-example training view with original round IDs preserved.",
        },
      ],
      physicalExamples: [
        {
          title: "Tape-road recovery labels",
          scenario:
            "Draw a road with centre, left-edge, and right-edge cells. A teacher route contains only centre cells. Let a simple learner take one wrong move, then pause and ask a teacher to label the recovery move from the reached edge cell.",
          lookFor:
            "More repeats of centre driving do not teach the missing edge recovery; the useful new example comes from the learner-induced state and retains its round identity.",
        },
        {
          title: "Spoon carrying with a supervisor",
          scenario:
            "A child carries a dry spoon along floor marks while a supervisor names the move they should make whenever they step off the marked route; no liquid, robot, or risky takeover is involved.",
          lookFor:
            "The spoken correct move is a label for the off-route state. It must not be confused with the child's executed step or a late physical intervention.",
        },
      ],
      workedExample: {
        title: "Run two dataset-aggregation rounds on a paper rover",
        setup:
          "Round 0 contains 20 teacher-labelled centre states. A cloned policy succeeds on 6 of 10 frozen paper routes and enters four edge states. The expert can label all four edge states. After aggregation and retraining, the next policy succeeds on 8 of the same 10 route definitions in a fresh run.",
        steps: [
          "Freeze the ten evaluation route definitions and keep their trial outcomes outside training; the fact that route definitions repeat does not permit their observed evaluation labels to enter the dataset.",
          "Record Round 0 as 20 examples, its data version, policy checkpoint, and `6/10 = 60%` observed evaluation success.",
          "Roll out the Round 0 policy on separate collection routes; for each edge state store the learner proposal, action actually executed, expert label, query time, and whether the expert abstained.",
          "Validate the four expert labels, then aggregate rather than overwrite: `20 + 4 = 24` labelled examples with source round and original identity.",
          "Train a new checkpoint from the declared 24-example view and do not select it from the frozen suite one trial at a time.",
          "Run the complete frozen suite and report `8/10 = 80%`, two remaining failure routes, interventions and stops; the observed increase is 20 percentage points, not proof of general superiority.",
        ],
        result:
          "The aggregate grows from 20 to 24 traceable examples, while frozen-suite observed success changes from 60% to 80%; two failures and the small sample remain visible.",
        takeaway:
          "DAgger earns evidence by targeting learner-visited states and re-evaluating, not by calling every correction an improvement.",
      },
      handsOn: {
        setup:
          "Use a paper grid, a simple browser simulation, or a local deterministic script. One person may act as the expert; do not use a powered robot or deliberately drive hardware toward a hazard.",
        steps: [
          "Create teacher data from safe centre-path states, define left, right, forward, stop, and abstain labels, then train or write the simplest policy that imitates those labels.",
          "Freeze five evaluation routes and five separate collection routes with start cell, obstacle cells, terminal rules, and seed or card identity.",
          "Run the learner on collection routes, capture every visited state, and ask the expert for a label without erasing learner proposals, executed actions, or aborts.",
          "Inspect and aggregate only valid aligned labels, preserving round, route, expert, query, abstention, and original-example identifiers.",
          "Retrain one next-round policy, then run both checkpoints across the entire frozen evaluation suite with identical reset and scoring rules.",
          "Publish a round table containing dataset size, newly covered states, success count, interventions, abstentions, failure cells, and the next collection decision.",
        ],
        observe:
          "The learner reveals recovery states absent from teacher-only routes, while some states remain too ambiguous for a forced label and should be stopped or quarantined.",
        doneWhen:
          "Every new label traces to a learner-visited state, no evaluation outcome leaked into training, both policies completed the same suite, and remaining failures are named.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_HMI],
        workExample:
          "Design a human-in-the-loop correction workflow that distinguishes policy proposals, executed commands, supervisor labels, takeovers, abstentions, and stops, then prove each aggregated checkpoint on an untouched rollout suite.",
        interviewPrompt:
          "Describe one safe DAgger iteration for a robot that drifts outside its demonstration data. Explain the control mixture, expert-query timing, dataset lineage, abstention path, retraining boundary, and independent evaluation.",
      },
      commonMistakes: [
        {
          mistake: "Calling extra demonstrations from the original perfect route DAgger.",
          correction:
            "DAgger's defining value is expert labelling of states induced by the learner or its expert-learner mixture; repeated original-route data does not address that distribution.",
        },
        {
          mistake: "Saving only the expert correction and losing what the learner proposed or what the controller executed.",
          correction:
            "Store learner proposal, expert label, executed action, intervention state, timing, and round separately so training and safety behavior remain reconstructable.",
        },
        {
          mistake: "Forcing the expert to label every unsafe or ambiguous state.",
          correction:
            "Provide abstain, abort, and quarantine outcomes; an invented target can teach dangerous behavior and hides a real coverage boundary.",
        },
        {
          mistake: "Using the same corrected rollouts to train and to claim improvement.",
          correction:
            "Aggregate collection labels into training, but compare policy checkpoints on a separate frozen suite with unchanged resets and scoring.",
        },
      ],
      checkQuestions: [
        {
          question: "What distribution problem is DAgger trying to address?",
          answer:
            "The learner visits observations created by its own actions, while ordinary cloning was trained mainly on observations visited by the expert.",
        },
        {
          question: "During a DAgger query, are expert label and executed action always identical?",
          answer:
            "No. The expert can label what should be done while a mixed controller, learner, stop, or intervention determines what was actually executed; record them separately.",
        },
        {
          question: "Why must each aggregated checkpoint face an untouched suite?",
          answer:
            "Training on newly corrected states can lower loss without improving closed-loop behavior, so only separate fixed trials reveal whether task performance and failures changed.",
        },
      ],
      visual: {
        show: true,
        mode: "failure",
        reason:
          "A loop from learner rollout to shifted state, expert label, aggregated dataset, retraining, and separate evaluation makes DAgger's data boundary and covariate shift easier to inspect than prose alone.",
      },
    },
    {
      dayId: 101,
      mentalModel:
        "Temporal context looks backward to understand what is happening, while an action chunk looks forward by proposing several ordered commands from one policy query.",
      explanation: [
        "One observation can be ambiguous. A single image of a gripper beside a cup does not reveal whether the gripper is approaching, pausing, or moving away. Temporal context supplies recent observations or states so the policy can estimate motion, task stage, and events hidden in one frame. A context window shaped `[B, C, ...]` contains `C` past or current steps for each batch example. Those steps need declared spacing, timestamp order, padding, and episode boundaries; history from the previous episode must never leak across reset.",
        "An action chunk is an ordered sequence of future action targets predicted together. With batch size `B`, chunk horizon `H`, and action dimension `A`, the usual output contract is `[B, H, A]`. A ten-step chunk for a seven-value action contains 70 values per example. Predicting them jointly can preserve a coherent short strategy and reduce how many independent high-level choices a long episode needs. It does not make the low-level controller optional, and it does not guarantee those future commands remain appropriate after the world changes.",
        "Prediction horizon and execution horizon are different. A policy may predict 20 future actions yet execute only the first four before observing and replanning. Executing all 20 is more open-loop and can continue toward an outdated target. Replanning every step is reactive but costs more inference and can produce inconsistent overlapping proposals. Some systems combine predictions for the same future timestep from overlapping chunks, such as ACT's temporal ensemble. Document which prediction ages are combined, their weights, and how unavailable or stale chunks are rejected.",
        "Training needs chunk targets that stop cleanly at episode boundaries. A sample near an episode end may have fewer than `H` valid future actions, so it needs a validity or padding mask; padded zeros are storage, not teacher behavior, and must not contribute as genuine targets. Compare horizons with frozen rollouts, not only training loss. Measure success, reaction to a changed target, command smoothness, inference time, queue starvation, and how long an obsolete action can still execute.",
      ],
      keyTerms: [
        {
          term: "Temporal context",
          meaning:
            "An ordered window of recent observations, states, or actions supplied so a policy can infer motion and task stage.",
          physicalExample:
            "Three camera frames show that a ball is rolling left even though the newest frame alone shows only its current position.",
        },
        {
          term: "Action chunk",
          meaning:
            "A policy output containing several future actions in time order rather than only the next action.",
          physicalExample:
            "One query proposes four joint targets that move toward, close on, lift, and hold a paper gripper.",
        },
        {
          term: "Prediction horizon",
          meaning:
            "The number of future action steps produced by one policy prediction.",
          physicalExample:
            "A horizon of 12 at 20 Hz covers 0.6 seconds of proposed commands.",
        },
        {
          term: "Execution horizon",
          meaning:
            "The number of actions consumed from a predicted chunk before a fresh observation causes replanning or replacement.",
          physicalExample:
            "The policy predicts 12 steps but executes three, so it normally re-observes after 0.15 seconds at 20 Hz.",
        },
        {
          term: "Padding mask",
          meaning:
            "A Boolean marker distinguishing valid future-action targets from placeholder positions beyond an episode's end.",
          physicalExample:
            "If only three actions remain in a five-step target, the mask `[valid, valid, valid, pad, pad]` prevents two zeros from being learned as commands.",
        },
        {
          term: "Temporal ensemble",
          meaning:
            "A rule that combines overlapping predictions aimed at the same execution time, often weighting them by prediction age.",
          physicalExample:
            "Three earlier chunks each proposed the action for time 18; their declared weighted combination supplies one smoother command for that time.",
        },
      ],
      physicalExamples: [
        {
          title: "Moving coin versus committed pointer",
          scenario:
            "Move a cardboard pointer toward a coin in four marked steps while a partner shifts the coin after step one. Compare executing the remaining three old arrows with looking again and replacing them.",
          lookFor:
            "A long execution horizon follows a stale plan, while shorter execution reacts sooner but requires a stable rule for changing from one chunk to the next.",
        },
        {
          title: "Which way is the toy car going?",
          scenario:
            "Show one photo of a toy car at the centre of a ruler, then show three ordered photos with positions 8, 6, and 4 centimetres.",
          lookFor:
            "The single position is ambiguous, while ordered context reveals direction and approximate speed; context and future action output solve different problems.",
        },
      ],
      workedExample: {
        title: "Check chunk shape, coverage, padding, and reaction delay",
        setup:
          "A policy receives four recent state steps, predicts action chunks with `H = 8` and `A = 6`, runs at 20 Hz, and executes `E = 3` actions before replanning. A training sample has only five valid future actions before terminal.",
        steps: [
          "Separate the contracts: the four-step input context looks backward, while the eight-step output horizon looks forward; neither number implies the other.",
          "Calculate output size per example: `H × A = 8 × 6 = 48` action values, with ordered axes `[future_step, action_component]`.",
          "Calculate predicted time coverage: `8 / 20 = 0.40` seconds of future actions.",
          "Calculate nominal re-observation interval: `E / 20 = 3 / 20 = 0.15` seconds; a new event just after replanning may influence execution only after roughly that interval plus sensing and inference latency.",
          "Build the target validity mask as five valid steps followed by three padded steps; exclude the final `3 × 6 = 18` placeholder values from reconstruction loss.",
          "Compare an execution horizon of three with executing all eight: the latter can commit for 0.40 seconds, so test whether its smoother motion is worth the longer stale-command exposure.",
        ],
        result:
          "Each prediction contains 48 values covering 0.40 seconds; normal replanning occurs after 0.15 seconds, and 18 padded target values must not be treated as teacher actions.",
        takeaway:
          "Chunk design is a timing contract among target construction, tensor shape, replanning, masking, responsiveness, and low-level execution.",
      },
      handsOn: {
        setup:
          "Use paper arrows, a coin target, a stopwatch, and a table with columns for observation time, context IDs, predicted chunk, executed prefix, and replacement reason.",
        steps: [
          "Create two visually identical current states whose preceding three cards show opposite movement; explain why current-frame-only input cannot distinguish them.",
          "Write action chunks of lengths one, four, and eight for moving a pointer toward the coin, keeping action units and time step constant.",
          "For each chunk length, declare how many actions will execute before re-observation and calculate prediction coverage plus nominal replacement interval.",
          "Ask a partner to shift the target on a hidden chosen step, then record how many outdated arrows each execution rule consumes before it reacts.",
          "Create one near-terminal sample, pad it to the full chunk horizon, and show which target positions the loss mask excludes.",
          "Choose one horizon and replacement rule using the measured reaction, smoothness, and workload table; retain the failed or slow trials with the decision.",
        ],
        observe:
          "Longer committed prefixes need fewer decisions but continue stale intent longer, while frequent replacement reacts sooner and can expose disagreement between overlapping chunks.",
        doneWhen:
          "The table distinguishes context, prediction horizon, execution horizon, mask, and replacement timing, and the chosen rule follows from recorded trials rather than preference.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE, ROLE_VALIDATION],
        workExample:
          "Define the chunk tensor and padding contract between dataset and policy, implement reset-safe context buffers and bounded action queues, then benchmark horizon and replanning choices against reaction, smoothness, latency, and task success.",
        interviewPrompt:
          "A policy predicts 50 actions at once but performs poorly when objects move. Distinguish prediction from execution horizon, explain padding and overlapping chunks, and design a test that finds the responsiveness boundary.",
      },
      commonMistakes: [
        {
          mistake: "Using temporal context and action chunk as two names for the same sequence.",
          correction:
            "Context is past or present input used to understand state; a chunk is future output proposed for execution, and each has its own length and mask.",
        },
        {
          mistake: "Assuming every predicted action must execute before the policy can observe again.",
          correction:
            "Declare a separate execution horizon; a system can predict a longer chunk, consume a bounded prefix, and replan from a newer observation.",
        },
        {
          mistake: "Filling missing terminal targets with zeros and including them in loss.",
          correction:
            "Mark targets beyond the episode boundary as padding and exclude them, because zero placeholders are not demonstrated stop commands.",
        },
        {
          mistake: "Calling a longer chunk safer because it looks smoother in one video.",
          correction:
            "Measure stale-command duration, response to changes, limits, queue behavior, and closed-loop outcomes; visible smoothness alone does not establish safety.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the difference between prediction horizon and execution horizon?",
          answer:
            "Prediction horizon is how many future actions the policy outputs; execution horizon is how many of those actions run before a new observation replaces or revises the plan.",
        },
        {
          question: "Why does a near-terminal action chunk need a mask?",
          answer:
            "The episode may end before the full horizon, so placeholders after the terminal point must not be trained as if the demonstrator issued them.",
        },
        {
          question: "What evidence should decide a chunk length?",
          answer:
            "Frozen rollouts measuring task success, response to changes, smoothness, inference and queue timing, stale-action exposure, and failures—not offline loss alone.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "Aligned past-context cards, an H-by-A future chunk, an executed prefix, and a replanning point make four easily confused time horizons directly comparable.",
      },
    },
    {
      dayId: 102,
      mentalModel:
        "ACT is a chunk-predicting imitation policy: it compresses current robot evidence and demonstration style into one coherent short future action sequence.",
      explanation: [
        "Action Chunking with Transformers, or ACT, was introduced for precise imitation-learning tasks using image observations, current robot joint state, and future joint-position targets. Instead of predicting only `a_t` from `s_t`, it models a sequence such as `a_t` through `a_{t+k}` from the current observation. A transformer is used to combine information across tokens and output a structured future sequence. ACT is one particular policy architecture; action chunking is the broader idea, and an ordinary multilayer network can also be trained to emit a fixed chunk.",
        "The original ACT training path is a conditional variational autoencoder. Its training encoder sees the current robot state and the demonstrated future action sequence, then describes a latent style variable with a mean and spread. A sampled latent, current observations, and image features condition the decoder that predicts the action chunk. Training combines an action reconstruction term with a weighted KL-divergence term that keeps the latent distribution near a simple prior. At test time the demonstration action sequence is unavailable, so the training-only encoder is discarded and the decoder uses the prior convention.",
        "The latent variable helps represent variation among human demonstrations, but it is not a named task plan and its coordinates need not have a human meaning. The KL weight creates a tradeoff: too little pressure can make the training encoder hide each demonstration in the latent and leave the test-time prior poorly matched; too much can make the latent carry little useful variation. A lower combined objective still does not show that predicted actions obey joint limits, arrive on time, or complete the physical task.",
        "ACT's original system also used overlapping action chunks and temporal ensembling to combine predictions aimed at the same future time. That can reduce abrupt switching, but averaging is not universally safe: predictions can represent different strategies, and a mean action may be invalid near contact or obstacles. Preserve the configured chunk size, number of actions actually executed, ensemble rule, preprocessing statistics, cameras, action representation, control rate, and checkpoint. Then test each choice through bounded rollouts and independent command guards.",
      ],
      keyTerms: [
        {
          term: "ACT",
          meaning:
            "Action Chunking with Transformers, an imitation-learning architecture that predicts a sequence of future actions from current robot observations.",
          physicalExample:
            "From camera views and joint positions, ACT proposes a short ordered sequence for approach, grasp, and lift.",
        },
        {
          term: "Transformer",
          meaning:
            "A sequence model that uses attention to combine information among tokens and produce context-dependent representations or outputs.",
          physicalExample:
            "Image feature tokens, robot-state tokens, and action-query positions exchange information before future joint targets are decoded.",
        },
        {
          term: "Conditional VAE",
          meaning:
            "A generative training model that learns a latent distribution from condition and target data, then decodes samples into predictions conditioned on the observation.",
          physicalExample:
            "Two valid human approaches to a grasp can be represented through different latent styles while sharing the same visible setup.",
        },
        {
          term: "Latent variable",
          meaning:
            "A learned hidden numeric code used to represent variation not written as a direct input label.",
          physicalExample:
            "A latent may help capture different demonstration rhythms without one coordinate literally meaning fast or left-side approach.",
        },
        {
          term: "Reconstruction loss",
          meaning:
            "The difference between the predicted action chunk and the valid demonstrated action targets, with padded positions excluded.",
          physicalExample:
            "Mean absolute error measures how far predicted joint targets are from the teacher's targets across valid future steps.",
        },
        {
          term: "KL divergence term",
          meaning:
            "A training penalty encouraging the learned latent distribution to stay near the chosen prior used when demonstration targets are absent.",
          physicalExample:
            "A weighted KL term discourages the encoder from assigning every training trajectory an isolated code that the test-time prior never produces.",
        },
      ],
      physicalExamples: [
        {
          title: "Recipe cards and a style token",
          scenario:
            "Create two valid four-arrow ways to place a block: a wide approach and a close approach. Give each full arrow sequence a small style card, then ask a decoder table to produce one coherent sequence rather than alternating arrows.",
          lookFor:
            "The hidden card represents variation in a whole demonstrated sequence; it is not itself an action and may not have a neat human label.",
        },
        {
          title: "Overlapping forecasts on a timeline",
          scenario:
            "At times 0, 1, and 2, write four-step motion forecasts on transparent strips. Stack the entries that all target time 3 and compare the oldest and newest proposals.",
          lookFor:
            "Temporal ensembling combines predictions for the same execution time, not neighbouring executed actions, and disagreement can reveal strategy change rather than harmless noise.",
        },
      ],
      workedExample: {
        title: "Audit a toy ACT batch and objective",
        setup:
          "A batch has `B = 4`, action horizon `H = 10`, and action dimension `A = 7`. One sample has eight valid target steps. Its illustrative mean absolute reconstruction term is `0.060`, KL divergence is `0.40`, and configured KL weight is `β = 0.10`.",
        steps: [
          "Check the predicted chunk shape `[4, 10, 7]`; it contains `4 × 10 × 7 = 280` values across the batch and 70 values per example.",
          "For the sample ending after eight steps, mask the final `2 × 7 = 14` placeholder targets so they contribute neither action reconstruction nor false stop behavior.",
          "Trace training inputs: observation features and demonstrated future actions enter the training path that estimates a latent distribution; the decoder predicts the future action sequence.",
          "Calculate the illustrative weighted KL contribution as `β × KL = 0.10 × 0.40 = 0.040`.",
          "Using the stated toy reduction, add reconstruction and weighted KL: `0.060 + 0.040 = 0.100`; record that real code may sum or average dimensions differently and must be checked.",
          "Trace inference separately: no demonstrated future actions are available, the training encoder is absent, the decoder follows the saved prior convention, and decoded actions still pass freshness, shape, unit, limit, and rollout checks.",
        ],
        result:
          "The batch contract is 280 predicted values, one sample masks 14 padded targets, and the explicitly defined toy objective is 0.100.",
        takeaway:
          "Understanding ACT means tracing which information exists only during training, how the chunk is shaped and masked, and what remains unproven by its objective.",
      },
      handsOn: {
        setup:
          "Use the ACT paper diagram or maintained LeRobot ACT configuration alongside paper tokens or a small tensor-shape notebook. Training a large model is not required.",
        steps: [
          "Write separate cards for camera features, current robot state, demonstrated future actions, latent mean and spread, latent sample, action queries, predicted chunk, and padding mask.",
          "Arrange the training path and mark every card that disappears at inference; reject any diagram that secretly supplies future teacher actions during rollout.",
          "Choose `B`, `H`, and `A`, calculate full output shape and value count, then make one episode-end mask and count excluded target values.",
          "Calculate one reconstruction-plus-weighted-KL example while writing the exact reduction rule and units of the action term.",
          "Lay overlapping forecast strips for three consecutive queries, choose a declared combination rule, and flag a case where averaging two strategies would be invalid.",
          "Produce a configuration ledger containing observations, cameras, action representation, rate, horizon, executed actions, ensemble setting, normalization, checkpoint, and safe evaluation boundary.",
        ],
        observe:
          "The training encoder has target information unavailable during use, tensor padding changes the valid loss population, and overlapping proposals can disagree for meaningful reasons.",
        doneWhen:
          "Another learner can follow the cards through training and inference, reproduce the shape and objective arithmetic, and identify every runtime guard outside ACT itself.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_SOFTWARE],
        workExample:
          "Integrate an ACT checkpoint by matching dataset features and processors, validating chunk and padding shapes, preserving the train-versus-inference latent path, and wrapping decoded commands with timing, limits, reset, and evaluation controls.",
        interviewPrompt:
          "Explain ACT without saying only 'it is a transformer.' Trace observations, future-action targets, the conditional-VAE encoder, latent prior, decoder, chunk mask, temporal ensemble, and the evidence needed before deployment.",
      },
      commonMistakes: [
        {
          mistake: "Equating every action-chunking policy with ACT.",
          correction:
            "Action chunking is an output strategy; ACT is a specific transformer-based conditional generative policy and training design that uses chunking.",
        },
        {
          mistake: "Feeding demonstrated future actions to ACT during evaluation because they were inputs during training.",
          correction:
            "Those targets belong to the training-only latent encoder; inference must use the saved prior convention and current observations without future teacher leakage.",
        },
        {
          mistake: "Reading one latent coordinate as a guaranteed human concept such as speed.",
          correction:
            "Treat latent dimensions as learned hidden variables unless a separate controlled analysis establishes a stable semantic relationship.",
        },
        {
          mistake: "Assuming temporal averaging is safe whenever it makes motion look smooth.",
          correction:
            "Inspect disagreement, strategy modes, contact and obstacle geometry, then retain independent action limits and closed-loop failure tests.",
        },
      ],
      checkQuestions: [
        {
          question: "What information does ACT's training encoder have that inference does not?",
          answer:
            "It has the demonstrated future action sequence used to estimate a latent distribution; during inference that target sequence is unavailable.",
        },
        {
          question: "Why are reconstruction and KL terms both present in the conditional-VAE training path?",
          answer:
            "Reconstruction teaches the decoder to match demonstrated chunks, while the weighted KL term keeps the learned latent distribution compatible with the prior used at inference.",
        },
        {
          question: "Does a lower ACT validation objective prove better robot behavior?",
          answer:
            "No. It supports fit on recorded targets under that reduction; closed-loop success, responsiveness, timing, limits, and failure behavior require controlled rollouts.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The hands-on training-versus-inference token trace directly exposes ACT's conditional path; a fourth chapter visual would repeat the already selected action-chunk diagram.",
      },
    },
    {
      dayId: 103,
      mentalModel:
        "Offline validation asks whether a policy matches recorded teacher examples; rollout evaluation asks what happens after the policy is allowed to create its own next observation.",
      explanation: [
        "Offline evaluation runs a frozen checkpoint on recorded examples that do not change in response to its predictions. It can measure action loss, per-joint error, classification accuracy, calibration, or sequence error quickly and safely. Keep splits grouped by episode, scene, object, operator, or collection session to prevent near-duplicate leakage. Fit normalization and select checkpoints without touching the final test set. Offline diagnostics are valuable for rejecting broken shapes, severe bias, and regressions, but they observe teacher-generated data rather than the policy's closed-loop state distribution.",
        "A rollout begins from a declared reset and lets policy actions affect later observations. Its primary metric should match the physical task: for example, a block ends fully inside its target zone before timeout, without intervention or prohibited contact. Record partial stages as diagnostics, not as replacements for final success. Every attempt belongs in the denominator, including timeouts, setup faults under the predeclared rule, supervisor takeovers, safety stops, and policy exceptions. An attractive successful video without the other trials cannot establish a rate.",
        "Evaluation conditions must be frozen before results are inspected. Declare object positions, lighting, distractors, simulator or hardware version, seeds, calibration, task text, initial robot state, horizon, control rate, success rule, stop rule, intervention policy, and trial count. Keep evaluation episodes out of later training unless the suite is explicitly retired and replaced. If failures are used for DAgger or tuning, the old suite has become development data and can no longer support an untouched final claim.",
        "Compare offline and rollout results by failure slice. Low action error with poor final success may indicate covariate shift, multi-modal averaging, temporal misalignment, stale inference, wrong normalization, or a metric that weights unimportant cruise actions more than rare contact actions. Strong rollout success with slightly worse average loss can occur when a policy corrects deviations or prioritizes critical stages. Treat disagreement as a debugging clue. Deployment still needs wider representative trials, safety review, and uncertainty appropriate to the sample size.",
      ],
      keyTerms: [
        {
          term: "Offline validation",
          meaning:
            "Evaluation of policy predictions against fixed recorded examples whose observations do not change in response to the policy.",
          physicalExample:
            "A checkpoint predicts actions for 200 held-out camera-state rows and its per-joint errors are compared with teacher targets.",
        },
        {
          term: "Rollout evaluation",
          meaning:
            "Closed-loop trials in which the policy's outputs affect the environment and therefore its future inputs.",
          physicalExample:
            "A simulated arm gets twenty attempts from frozen object poses, with each attempt continuing from the policy's own previous action.",
        },
        {
          term: "Success criterion",
          meaning:
            "A predeclared observable condition that must be satisfied for an attempted task to count as successful.",
          physicalExample:
            "The block is fully within the marked zone for two seconds before timeout, with no collision or intervention.",
        },
        {
          term: "Intervention",
          meaning:
            "A supervisor action that overrides, assists, or stops autonomous behavior and is counted separately from unassisted success.",
          physicalExample:
            "The operator presses stop when a gripper approaches the workspace boundary, so the trial is an intervention rather than a success.",
        },
        {
          term: "Failure stage",
          meaning:
            "The named point in a task at which progress first violates or cannot meet the acceptance rule.",
          physicalExample:
            "A trial reaches the object but fails at grasp closure, separating approach failure from lift failure.",
        },
      ],
      physicalExamples: [
        {
          title: "Answer key versus board-game play",
          scenario:
            "A paper policy answers recorded next-move cards with 98% accuracy, then plays a board route where each chosen move changes the next square.",
          lookFor:
            "The answer key checks fixed teacher states, while the board game reveals recovery, loops, and learner-created squares absent from the cards.",
        },
        {
          title: "Same final score, different failure stage",
          scenario:
            "Two block-placement rules each succeed six times in ten. Rule A usually reaches the target then drops the block; Rule B often never grasps it.",
          lookFor:
            "Equal final success can hide different engineering work, so stage results and failure evidence belong beside the headline count.",
        },
      ],
      workedExample: {
        title: "Reconcile offline error with a twenty-trial rollout",
        setup:
          "Checkpoint C has held-out action MSE `0.006`. On a frozen 20-trial simulator suite it records 12 unassisted successes, three grasp failures, two placement failures, one timeout, one supervisor intervention, and one policy exception.",
        steps: [
          "Confirm the categories are mutually exclusive and total the declared denominator: `12 + 3 + 2 + 1 + 1 + 1 = 20` attempted trials.",
          "Calculate final unassisted success: `12 / 20 = 0.60 = 60%`; do not remove the intervention or exception from the denominator after seeing them.",
          "Calculate non-success count as eight, then retain its composition rather than describing all eight simply as failures.",
          "Report the offline MSE `0.006` beside, not merged with, 60% rollout success because they use different populations, units, and causal conditions.",
          "Inspect stage and timing slices: compare recorded offline error around grasp and placement frames with the five corresponding rollout failures, while leaving the frozen suite unchanged.",
          "Conclude that the checkpoint matched held-out actions under its metric yet completed only 12 of 20 closed-loop attempts; list hypotheses for a new development experiment without rewriting this result.",
        ],
        result:
          "The complete frozen-suite result is 12/20 unassisted successes, with eight visible non-successes across five categories despite low recorded-data MSE.",
        takeaway:
          "Offline fit and rollout behavior are complementary measurements, not two interchangeable scores on one ladder.",
      },
      handsOn: {
        setup:
          "Use two paper policies or two deterministic simulator rules, a ten-case frozen suite, and a result ledger prepared before either rule is run.",
        steps: [
          "Write the reset, terminal success, timeout, prohibited behavior, intervention, exception, and failure-stage rules before testing.",
          "Create an offline card set and a separate rollout suite; verify identifiers and near-duplicate routes do not cross the intended boundary.",
          "Score both policies on the fixed cards with overall and critical-stage error, preserving wrong examples for inspection.",
          "Run every rollout case without changing a start after seeing a failure, and record final success, stages, steps, intervention, timing, and first failure evidence.",
          "Reconcile every category count to the trial denominator and compare offline rankings with rollout rankings without combining their units.",
          "Write one diagnosis experiment based on the disagreement, but do not add suite cases to training or rerun selected failures as if they were the original evaluation.",
        ],
        observe:
          "A policy that is best at copying fixed moves can still be worse at recovering through a sequence, and equal final rates can conceal different failure stages.",
        doneWhen:
          "The suite definition predates results, every attempt remains countable, offline and rollout tables are separate, and the conclusion names both evidence boundaries.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_PHYSICAL_AI, ROLE_SOFTWARE],
        workExample:
          "Build an evaluation ladder that catches dataset and checkpoint defects offline, then measures closed-loop task, stage, intervention, exception, and timing outcomes on frozen simulation or supervised hardware trials.",
        interviewPrompt:
          "A new checkpoint lowers held-out loss by 25% but rollout success falls. Explain why that is possible, what evidence you would inspect first, and how you would preserve an untouched final evaluation.",
      },
      commonMistakes: [
        {
          mistake: "Calling validation loss a rollout metric because actions came from a robot dataset.",
          correction:
            "Recorded observations remain fixed and teacher-induced; only a closed-loop trial lets the policy alter the next observation.",
        },
        {
          mistake: "Dropping interventions, exceptions, or setup failures from the denominator after a run.",
          correction:
            "Use the predeclared attempt rule, retain every category, and report assisted behavior or infrastructure faults separately without making them disappear.",
        },
        {
          mistake: "Tuning on failed final-suite episodes and continuing to call the suite untouched.",
          correction:
            "Once suite evidence guides training or parameter choices, retire it as development data and create a new frozen final suite.",
        },
        {
          mistake: "Ranking checkpoints from one successful video.",
          correction:
            "Run the entire predeclared set and publish counts, conditions, interventions, failure stages, and uncut evidence rather than a selected demonstration.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does offline validation miss compounding error?",
          answer:
            "Its observations stay fixed regardless of the policy's predictions, so an early error cannot create the unfamiliar later inputs seen during a rollout.",
        },
        {
          question: "How should an operator intervention affect rollout reporting?",
          answer:
            "Record it as an intervention under the predeclared rule, keep the attempt in the denominator, and do not count it as unassisted policy success.",
        },
        {
          question: "When does a final evaluation suite stop being untouched?",
          answer:
            "When its cases, outcomes, or failures influence training, checkpoint selection, thresholds, or other development decisions.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "A paired offline-versus-rollout ledger with complete denominators is the required artifact; another generic score graphic would hide the failure categories it must teach.",
      },
    },
    {
      dayId: 104,
      mentalModel:
        "A policy runtime is a guarded clocked loop: acquire fresh evidence, predict before the deadline, decode and check one bounded action, execute briefly, then observe again or fail safely.",
      explanation: [
        "A deployable inference loop begins at episode reset, not at the model call. Reset clears action queues, temporal context, recurrent or policy state, timers, and previous-task identifiers. The loop then acquires a new observation with source timestamps and validates required cameras, robot state, task context, shape, finite values, and freshness. Preprocessing must match training exactly, including feature names, order, image crop, color order, normalization statistics, and missing-input policy. A tensor that enters the model successfully can still describe the wrong physical moment.",
        "Inference has a deadline set by the control contract. At 30 Hz, one cycle lasts about 33.3 milliseconds, but sensing, transport, preprocessing, model work, postprocessing, guards, and command delivery all consume that budget. Measure end-to-end age and stage latencies with a monotonic clock; model latency alone omits waiting and stale inputs. Report median and tail values such as p95 or p99 plus deadline misses. A numerically good prediction arriving after its intended scene has changed is stale and must not be sent as if current.",
        "Postprocessing converts model output back to the declared action representation. It must check output shape, dtype, finite values, component order, units, frame, normalization version, and supported mode. Then independent command guards apply robot and task constraints such as joint or velocity bounds, workspace zones, rate of change, collision or contact conditions, enable state, and command age. Blindly clipping a wildly invalid prediction to the nearest limit can hide a model or scaling defect; severe violations should be rejected and diagnosed rather than made to look normal.",
        "Fallback is a predefined robot-system behavior, not the neural network's opinion. Depending on the commissioned system, it may hold position, command a controlled stop, stop sending motion and let a watchdog act, or request human control. The safe choice depends on gravity, brakes, contact, payload, traffic, and low-level controllers, so 'send zeros' is not universal. Log the reason, last accepted observation and action IDs, queue state, deadline, guard decision, and terminal outcome. A chunk queue also needs freshness limits so old actions cannot outlive the scene that justified them.",
      ],
      keyTerms: [
        {
          term: "Control deadline",
          meaning:
            "The latest permitted time for an observation-derived command to be validated and accepted for its intended control cycle.",
          physicalExample:
            "At 30 Hz the nominal period is 33.3 milliseconds, so a command completing after the configured deadline is rejected rather than sent late.",
        },
        {
          term: "Observation age",
          meaning:
            "Elapsed time from the physical acquisition timestamp of an observation to the moment it is used for a command decision.",
          physicalExample:
            "A camera frame captured 80 milliseconds ago may show a cup where it was, not where it is when the gripper command executes.",
        },
        {
          term: "Postprocessing",
          meaning:
            "The declared conversion from model outputs to physical action values, including de-normalization, representation, component order, and units.",
          physicalExample:
            "Seven normalized outputs become seven target joint positions in radians using the training dataset statistics saved with the checkpoint.",
        },
        {
          term: "Action guard",
          meaning:
            "An independent check that accepts or rejects a decoded action according to runtime timing, validity, and robot or task constraints.",
          physicalExample:
            "A guard rejects a non-finite joint target and a command that would cross the configured workspace boundary.",
        },
        {
          term: "Safe fallback",
          meaning:
            "A commissioned behavior entered when current policy output cannot be accepted, chosen from the physical system's hazards and controller design.",
          physicalExample:
            "A mobile base performs a controlled stop after stale perception, while a gravity-loaded arm may require its existing safety controller to hold safely.",
        },
        {
          term: "Action queue",
          meaning:
            "An ordered buffer of predicted future commands with provenance, age, and replacement rules.",
          physicalExample:
            "A chunked policy has six actions left, but the client discards them after a stop event or when their source observation exceeds its freshness limit.",
        },
      ],
      physicalExamples: [
        {
          title: "Out-of-date direction card",
          scenario:
            "A partner shows a left-arrow card, then moves a paper obstacle before you finish a slow calculation. Compare following the old arrow with checking the card's timestamp and stopping.",
          lookFor:
            "Correctly reading a stale arrow is still the wrong current action; value accuracy and timing validity are separate gates.",
        },
        {
          title: "Conveyor queue after a stop sign",
          scenario:
            "Place six action cards on a paper conveyor. Insert a red stop event after the second card and decide whether the four queued cards may continue.",
          lookFor:
            "A queue needs invalidation and provenance. Actions that were reasonable before the stop cannot execute simply because they were already predicted.",
        },
      ],
      workedExample: {
        title: "Budget a 30 Hz inference cycle and reject one late command",
        setup:
          "A loop runs at 30 Hz, giving `1000 / 30 ≈ 33.3 ms` per cycle. One nominal trace uses 8 ms for sensing and transport, 4 ms for preprocessing, 14 ms for model inference, 3 ms for postprocessing and guards, and 2 ms for command delivery. A second trace raises inference to 18 ms.",
        steps: [
          "Calculate the nominal deadline period: `1000 ms / 30 ≈ 33.3 ms`; record whether the actual configured deadline is equal to or shorter than this period.",
          "Add nominal stages: `8 + 4 + 14 + 3 + 2 = 31 ms` from acquisition path through command delivery.",
          "Calculate nominal slack: `33.3 - 31 = 2.3 ms`; that small margin must also tolerate scheduling variation and cannot be inferred from average model time alone.",
          "Replace model time with the slow trace and add again: `8 + 4 + 18 + 3 + 2 = 35 ms`, which misses the 33.3 ms period by about 1.7 ms.",
          "Reject or invalidate the late action according to the runtime contract, enter the commissioned fallback, and log observation ID, age, each stage duration, guard result, and fallback result.",
          "Repeat over many cycles to calculate miss rate and tail latency; one nominal 31 ms sample is not proof that the loop meets its deadline reliably.",
        ],
        result:
          "The nominal trace uses 31 ms with only 2.3 ms slack; the slow trace takes 35 ms and must not execute as an on-time command.",
        takeaway:
          "Runtime fitness is measured from fresh observation to accepted physical command, including tail behavior and fallback—not by model speed in isolation.",
      },
      handsOn: {
        setup:
          "Build a local mock loop using synthetic timestamped observations and actions, or use a bounded simulator with actuation disabled. Include a visible event log.",
        steps: [
          "Define the cycle frequency, observation freshness limit, command deadline, required fields, action units and bounds, queue invalidation events, and task-specific fallback before running.",
          "Implement or lay out reset, acquire, validate, preprocess, infer, postprocess, guard, execute-or-fallback, and log as separately timed stages.",
          "Feed one nominal observation, one missing feature, one NaN output, one wrong-shaped chunk, one old timestamp, and one deliberately slow inference result.",
          "Verify invalid cases never reach the execution sink and each produces a distinct reason plus the expected fallback event.",
          "Run at least 100 synthetic cycles with varied inference delays; report median, p95, maximum, deadline-miss count, and any empty or stale queue event.",
          "Save the configuration, event ledger, one accepted trace, every rejection type, and a statement of what the disconnected mock cannot prove about a real robot.",
        ],
        observe:
          "Model outputs can be numerically plausible yet stale, malformed, wrongly scaled, outside limits, or left in a queue after their source situation is invalid.",
        doneWhen:
          "Every stage and clock boundary is inspectable, all injected faults fail closed at the intended gate, totals reconcile across 100 cycles, and no physical safety claim is made from the mock.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_HMI, ROLE_PHYSICAL_AI],
        workExample:
          "Integrate a learned policy behind feature, freshness, deadline, de-normalization, action-limit, queue, watchdog, cancellation, and fallback boundaries, then expose the decisive timing and rejection state to operators and validation logs.",
        interviewPrompt:
          "A policy's model inference is 20 ms on a 30 Hz controller, yet commands still arrive late. Build the complete timing budget, show how you detect stale observations and queued actions, and describe a system-specific fallback.",
      },
      commonMistakes: [
        {
          mistake: "Measuring only the model call and declaring the control deadline met.",
          correction:
            "Measure acquisition age, waiting, preprocessing, inference, decoding, guards, transport, and command acceptance with tail latency and miss counts.",
        },
        {
          mistake: "Clipping every invalid output into the legal numeric range.",
          correction:
            "Reject non-finite, wrongly scaled, malformed, stale, or severely out-of-range proposals because clipping can conceal a broken policy boundary.",
        },
        {
          mistake: "Using 'send zero' as a universal safe state.",
          correction:
            "Choose and commission fallback from the robot's mechanics, low-level controller, brakes, gravity, payload, contact, and workspace hazards.",
        },
        {
          mistake: "Resetting the environment while leaving policy context or action queues intact.",
          correction:
            "Clear every episode-scoped buffer and policy state, associate new observations with the new task identity, and reject actions from the previous episode.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a correct predicted value still be rejected?",
          answer:
            "It may be based on an old observation or arrive after its deadline, so it no longer describes a valid command for the current physical scene.",
        },
        {
          question: "What belongs in the end-to-end latency budget?",
          answer:
            "Observation acquisition and age, transport or waiting, preprocessing, inference, postprocessing, guards, command delivery, and acceptance—not only the model call.",
        },
        {
          question: "Why is fallback specific to the robot system?",
          answer:
            "Holding, stopping, sending no command, or commanding zero can have different consequences depending on gravity, brakes, contact, payload, traffic, and controller behavior.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The timed fault-injection trace and rejection ledger expose the runtime boundary precisely; a generic pipeline picture would not prove freshness, deadlines, or fallback.",
      },
    },
    {
      dayId: 105,
      mentalModel:
        "A fair policy comparison is a controlled tournament: both checkpoints face the same predeclared starts, rules, clocks, and counting method before anyone sees the winner.",
      explanation: [
        "Begin comparison with a decision question, not two demo videos. The question might be whether ACT checkpoint B should replace behavior-cloning checkpoint A for one defined block-placement task in a simulator version and operating envelope. Freeze policy files and hashes, dataset and processor versions, robot or simulator build, cameras, action representation, control rate, inference strategy, guard configuration, and task text. A change in normalization, execution horizon, or fallback means the comparison includes a system change and must be labelled as such.",
        "Build a suite from representative and boundary conditions that matter to the claim. Pair policies on the same initial-state or seed definitions, while resetting independently so one policy's final state cannot help the next. Randomize or counterbalance run order to reduce warm-up, battery, temperature, operator, and time trends. Blind outcome review where practical. Set the number of trials before running, keep every attempt, and avoid stopping when the preferred policy gains a lead.",
        "Use a gate plus a scorecard. Safety and validity gates can require zero prohibited contacts, no unhandled exceptions, acceptable intervention behavior, and deadline-miss rate below a declared limit. Among candidates that pass, compare final and stage success, intervention count, completion time, path or action smoothness, p95 latency, fallback count, and failure categories. Do not hide tradeoffs in one invented weighted score unless the weights and physical meaning were approved before testing.",
        "Observed percentages carry sampling uncertainty. Eighteen successes in twenty trials is 90%, and sixteen in twenty is 80%, but the ten-percentage-point difference from such a small set may change on another sample. Paired case results reveal whether one policy consistently wins the same difficult starts. Report ties, discordant pairs, raw counts, conditions, and uncut failures. Select, reject, or request more evidence using a predeclared rule; then preserve the suite as final evidence or formally retire it before further tuning.",
      ],
      keyTerms: [
        {
          term: "Frozen evaluation suite",
          meaning:
            "A versioned set of initial conditions, rules, metrics, trial count, and environment configuration fixed before candidate results are inspected.",
          physicalExample:
            "Twenty saved simulator seeds and one scoring script are hashed before either checkpoint runs.",
        },
        {
          term: "Paired trial",
          meaning:
            "A comparison in which each policy is tested independently on the same initial-case definition.",
          physicalExample:
            "Both policies attempt seed 17 from a fresh reset, allowing a direct record of which candidate succeeded on that same case.",
        },
        {
          term: "Counterbalanced order",
          meaning:
            "An ordering plan that alternates which candidate runs first so time-related effects are not assigned mostly to one policy.",
          physicalExample:
            "Policy A runs first on odd cases and Policy B runs first on even cases while each receives its own reset.",
        },
        {
          term: "Acceptance gate",
          meaning:
            "A non-negotiable condition a candidate must meet before softer performance tradeoffs are considered.",
          physicalExample:
            "Any prohibited workspace entry rejects the candidate even if its average completion time is fastest.",
        },
        {
          term: "Discordant pair",
          meaning:
            "A paired case where one policy succeeds and the other does not, revealing which starts drive their difference.",
          physicalExample:
            "On seed 8, ACT succeeds while the single-step clone times out; on seed 13 the outcome is reversed.",
        },
        {
          term: "Failure taxonomy",
          meaning:
            "A fixed set of mutually exclusive or clearly ordered categories used to describe how attempts fail.",
          physicalExample:
            "Failures are assigned first at perception, approach, grasp, transport, placement, timeout, intervention, exception, or safety stop.",
        },
      ],
      physicalExamples: [
        {
          title: "Two paper mazes, one shuffled deck",
          scenario:
            "Write ten maze starts on cards, shuffle once, and let two rule sets attempt every card from a clean board. Alternate which rule goes first and keep all dead ends.",
          lookFor:
            "The shared case deck supports paired comparison, while independent reset and alternating order prevent one rule from inheriting an easier board or always receiving the fresh setup.",
        },
        {
          title: "Fast but boundary-crossing sorter",
          scenario:
            "One block-sorting rule finishes most successful trials in five moves but crosses a forbidden tape line once. Another takes seven moves and never crosses it.",
          lookFor:
            "A predeclared safety gate prevents speed or average success from compensating for prohibited behavior after results are known.",
        },
      ],
      workedExample: {
        title: "Read a paired twenty-case policy result without overclaiming",
        setup:
          "On the same 20 frozen initial-state definitions, Policy A succeeds 18 times and Policy B succeeds 16 times. Fifteen cases are successes for both, one fails for both, A alone succeeds on three, and B alone succeeds on one. Both pass the prohibited-contact gate; A has two deadline fallbacks and B has none.",
        steps: [
          "Reconcile Policy A: 15 shared successes plus three A-only successes equals 18; its two failures are the one shared failure and one B-only case.",
          "Reconcile Policy B: 15 shared successes plus one B-only success equals 16; its four failures are the shared failure and three A-only cases.",
          "Calculate observed success rates: `18 / 20 = 90%` for A and `16 / 20 = 80%` for B, a difference of ten percentage points on this suite.",
          "Inspect the four discordant pairs rather than treating all 20 as independent evidence of difference: A wins three paired cases and B wins one.",
          "Apply gates before preferences: both pass prohibited contact, but the predeclared deadline-fallback limit determines whether A's two fallback events pass, fail, or require more evidence.",
          "Report the narrow result: A completed two more cases in this small frozen suite, with two deadline fallbacks; retain raw cases and do not claim general superiority without broader trials.",
        ],
        result:
          "Policy A records 18/20 versus B's 16/20 and wins three of four discordant pairs, but it also produces two deadline fallbacks that remain part of the decision.",
        takeaway:
          "A comparison is trustworthy when counts reconcile, paired cases and gates remain visible, and the conclusion stays inside the tested suite.",
      },
      handsOn: {
        setup:
          "Compare the Week 15 baseline and one chunked or corrected paper/simulator policy. Use at least ten saved initial cases and prepare the manifest before loading results.",
        steps: [
          "Write the decision question, candidate identifiers, suite version, environment, task, resets, conditions, terminal rules, gates, metrics, trial count, and decision rule.",
          "Verify both candidates consume the same declared observations and action representation, or document every intentional system difference rather than calling it a model-only test.",
          "Create paired start cases, randomize case order, counterbalance which candidate runs first, and ensure every run starts from an independent reset.",
          "Execute the full suite without early stopping; capture success, stage, steps, time, intervention, fallback, deadline, prohibited behavior, and first failure category.",
          "Reconcile candidate totals and paired outcomes, inspect all discordant pairs and every gate event, and calculate only the predeclared summaries.",
          "Issue one of three decisions—accept, reject, or collect more evidence—with the exact rule triggered, then save raw failures and state whether the suite remains untouched.",
        ],
        observe:
          "Candidate ranking can depend on difficult paired starts, while latency fallbacks or prohibited behavior can overturn a simple success-rate preference.",
        doneWhen:
          "The manifest predates execution, every planned attempt is present, counts and pairs reconcile, gates are applied unchanged, and a reviewer can rerun the decision from raw records.",
      },
      jobConnection: {
        roles: [ROLE_PHYSICAL_AI, ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_HMI],
        workExample:
          "Own a policy-release gate that freezes candidate artifacts and representative cases, automates paired rollouts, exposes operator interventions and deadline fallbacks, preserves uncut failures, and turns the approved decision rule into a reproducible release record.",
        interviewPrompt:
          "Policy A scores 90% and Policy B 80% over twenty trials, but A has deadline fallbacks. Explain paired design, run order, acceptance gates, sampling uncertainty, failure review, and what evidence would justify release.",
      },
      commonMistakes: [
        {
          mistake: "Giving each policy different random starts and comparing only aggregate success.",
          correction:
            "Use the same saved initial-case definitions with independent resets so paired outcomes show which exact conditions create the difference.",
        },
        {
          mistake: "Changing metrics, thresholds, or trial count after seeing which checkpoint is ahead.",
          correction:
            "Freeze the suite and decision rule first; any post-result change creates a new experiment and must not rewrite the original result.",
        },
        {
          mistake: "Combining success, speed, safety stops, and latency into an unexplained single score.",
          correction:
            "Apply non-negotiable gates first and present a readable scorecard; use weighting only when approved weights and physical meanings were fixed beforehand.",
        },
        {
          mistake: "Calling a ten-percentage-point difference over twenty trials proof of universal superiority.",
          correction:
            "Report raw counts, paired discordances, conditions and uncertainty, then expand representative trials before making a broader claim.",
        },
      ],
      checkQuestions: [
        {
          question: "Why pair candidates on the same initial cases?",
          answer:
            "Pairing controls case difficulty and reveals the exact starts where one succeeds and the other fails instead of comparing two different random samples.",
        },
        {
          question: "Why are acceptance gates evaluated before average performance?",
          answer:
            "A non-negotiable safety, validity, or timing failure must not be traded away by faster or more successful behavior after results are seen.",
        },
        {
          question: "What can be concluded from 18/20 versus 16/20 in the worked suite?",
          answer:
            "Policy A completed two more of those twenty frozen cases and won three of four discordant pairs, while its two deadline fallbacks and the small sample limit any broader claim.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The paired case ledger, acceptance-gate table, and preserved failure artifacts carry the comparison evidence; a fourth visual would add decoration rather than decision clarity.",
      },
    },
  ],
} satisfies ChapterContent;
