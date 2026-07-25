# Robot/Shift curriculum validation and revision record

Date: 2026-07-25
Scope: all 26 chapters and 180 daily lessons
Audience: programmers, developers, and technical learners entering robotics without assumed university-level mathematics or hardware experience

## Verdict

Robot/Shift already has a stronger technical core than a typical introductory survey: every day owns substantial original teaching prose, a worked quantitative example, a physical exercise, failure cases, evidence, role context, and interview checks. The correct action is not to replace that core. The premium-quality gap is the learning system around it:

- the chapters did not carry one continuing engineering story across their days;
- daily lessons did not explicitly say why the idea appears now, what to ignore, or what it unlocks;
- the strongest just-in-time mathematics bridges existed in code but were not visible;
- environment-sensitive chapters mixed rolling, main, and several ROS or Gazebo distributions without a visible compatibility contract;
- weekly integration gates were assigned the shortest session;
- prose asked programmers to build artifacts but supplied no maintained zero-dependency starter;
- Week 8 used localization concepts before Week 11 taught the probability and estimation foundations;
- later chapters repeated data, policy, fleet, and validation concepts without explicitly marking the second and third passes as deeper spiral learning.

The revision therefore preserves all day IDs and the curriculum revision while adding the missing continuity, prerequisites, reproducibility, and executable entry points.

## Evidence and method

The audit used four evidence layers:

1. The learner-demand and pain-point research in [robotics-learning-demand-and-learner-pain-points.md](./product-research/robotics-learning-demand-and-learner-pain-points.md).
2. Static inspection of all curriculum, lesson, deep-content, visual, mathematics, storage, Tutor-context, and test owners.
3. A 26-chapter day-by-day audit split across two independent reviewers, plus a separate sequencing and migration-risk review.
4. Curriculum comparison against primary course and tool documentation, followed by a rendered desktop and mobile reader review.

Baseline measurements before this revision:

| Measure | Verified baseline |
|---|---:|
| Chapters | 26 |
| Daily lessons | 180 |
| Serialized authored chapter-content words | 243,715 |
| Average core teaching and exercise words per day | approximately 756 |
| Chapter source entries | 129 |
| Unique source URLs | 123 |
| Automated source responses | 122 returned HTTP 200/206; one Schneider page returned HTTP 403 to automated access |
| Days with an explicit previous/next continuity phrase | 14 of 180 |
| Visible just-in-time mathematics rescues | 0 of 26 |
| Supplied chapter starter artifacts | 0 of 26 |
| Weekly planned effort | 720 minutes |
| Weekly gate-day effort | 60 minutes |

HTTP reachability is not an endorsement of every statement on a page. Source authority, instructional fit, version drift, and implementation evidence were reviewed separately.

The reachability count is reproducible with `npm run audit:curriculum-sources -- --summary`. On 2026-07-25 it checked all 129 entries/123 unique URLs with bounded Range GET requests: 122 returned a successful response, and the Schneider Electric STO page returned HTTP 403 to the audit client.

## External curriculum benchmark

| Primary source | Structure used as a benchmark | Robot/Shift decision |
|---|---|---|
| [Northwestern Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) | configuration and rigid motion → kinematics → dynamics → planning/control → manipulation/mobile robots → capstone; assumes first-year physics, linear algebra, calculus, and linear ODEs | Preserve the mechanics spine and cumulative capstones, but keep Robot/Shift's slower zero-math bridge. |
| [MIT Manipulation](https://manipulation.csail.mit.edu/) | a spiral that first builds a basic known-object pick-and-place system, then revisits perception, planning, contact, and control as each previous system exposes a new limitation | Give each Robot/Shift chapter a named field mission and make every day change that same system. |
| [MIT Underactuated Robotics](https://underactuated.csail.mit.edu/) | model systems before state-space control, optimal control, estimation, system identification, and learning | Add an explicit bridge from PID to system identification, state-space, LQR, MPC, and trajectory optimization without pretending one beginner chapter teaches their full theory. |
| [Stanford CS223A](https://cs.stanford.edu/groups/manips/teaching/cs223a/) | transforms, kinematics, Jacobians, dynamics, joint/Cartesian/operational-space control, force, and vision control | Preserve measured controller behavior and make contact/tactile evidence more explicit. |
| [ROS 2 Jazzy tutorials](https://docs.ros.org/en/jazzy/Tutorials.html) | sequential environment, graph, package, interface, QoS, lifecycle, tracing, security, and real-time concepts | Keep the sequential ROS spine and expose one course target stack plus compatibility boundaries. |
| [Nav2 documentation](https://docs.nav2.org/) | transforms, URDF, odometry, sensors, mapping/localization, costmaps, planning, control, behaviors, and plugins | Keep Week 8 integration-first; teach A* and external operating contracts there, then open estimator internals in Week 11. |
| [MoveIt 2 documentation](https://moveit.picknik.ai/main/index.html) | robot model and planning scene → motion planning/trajectory processing → execution; separate Servo and Task Constructor workflows cover real-time command generation and stage-level task/failure inspection | Preserve the full manipulation loop and require stage-level failure evidence, not a success-only pick video. |
| [Gazebo Harmonic tutorials](https://gazebosim.org/docs/harmonic/tutorials/) | construct models and worlds, add sensors, connect control, and inspect simulation behavior | Keep simulation first and separate simulated evidence from physical-safety claims. |
| [NVIDIA Isaac Sim documentation](https://docs.isaacsim.omniverse.nvidia.com/latest/) | robot and sensor simulation, ROS 2 integration, synthetic-data generation and randomization, Isaac Lab policy workflows, and pre-hardware stack validation | Add bounded domain randomization and an explicit sim-to-real evidence boundary; simulator success is not transfer proof, and proprietary hardware remains optional. |
| [Hugging Face LeRobot documentation](https://huggingface.co/docs/lerobot/) | record and inspect data → train → benchmark/evaluate → deploy policies; human-in-the-loop collection is a separate documented workflow | Preserve the data-to-policy sequence and make W14→W15→W23→W24 a visible spiral using stable artifact identities; keep recovery as Robot/Shift's own safety requirement. |
| [ISO 10218-1:2025](https://www.iso.org/standard/73933.html) and [ISO 10218-2:2025](https://www.iso.org/standard/73934.html) | separate robot-as-machine safety from integration, commissioning, operation, maintenance, and decommissioning of the complete application or cell | Keep software safeguards, protective functions, and physical release authority separate; simulation/course evidence is never certification, and qualified independent review owns energization and motion decisions. |
| [NIST Performance of Human-Robot Interaction](https://www.nist.gov/programs-projects/performance-human-robot-interaction) and [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | measurable interface effectiveness, situation awareness, trust/safety, and lifecycle privacy risk from collection through disposal | Require understandable state, workload, intervention and handoff evidence, plus consent, data inventory, minimization, access, retention, and deletion boundaries in Weeks 21 and 23. |
| [ros2_control Jazzy documentation](https://control.ros.org/jazzy/index.html) | hardware interfaces and components → controller manager/controllers → real-time tools, simulator integrations, demos, and lifecycle behavior | Make Weeks 6 and 22 bind state/command interfaces, controller lifecycle, diagnostics, and mock-hardware evidence while keeping simulation separate from physical commissioning. |
| [MIT OCW Circuits and Electronics](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/) | circuit abstractions, sources, resistive networks, energy storage, measurement, and lab practice; the full course assumes electricity/magnetism and differential equations | Extract only a zero-power prerequisite rescue for voltage, current, resistance, power, continuity, polarity, stored energy, and measurement planning before any purchase, wiring, energization, or motion. |

## Curriculum-wide decisions

### 1. Preserve identity; improve sequencing by spiral learning

Days 50–56 remain the Nav2/SLAM first flight. They teach inputs, outputs, frame ownership, lifecycle, action status, costmaps, planning, control, cancellation, bounded recovery, and external measurements. Particle weighting, resampling, covariance interpretation, process and measurement models, scan-matching objectives, pose-graph optimization, loop-closure tuning, and estimator fusion are explicitly deferred.

Days 71–77 reopen the exact frozen Week 8 world, seed, MCAP bag, map, pose graph, configuration, transform snapshot, scenarios, and raw results. They then teach the deferred theory and rerun the unchanged suite for a before/after diagnosis. Swapping the weeks would corrupt semantic progress, Tutor history, canonical lesson URLs, gate boundaries, and historical analytics because day IDs are persisted identifiers.

### 2. Make the learner contract visible

Every chapter now owns:

- one named continuing field mission;
- two connected opening passages;
- a why-now, ignore-for-now, next-unlock, and evidence contract;
- a dated environment and compatibility contract with an explicit runtime-evidence boundary;
- one deterministic, dependency-free JavaScript starter with expected output and a planted failure.

Every day owns a narrative bridge from the previous state of that mission plus an explicit why-now, ignore-today, and unlock-next statement.

### 3. Keep prose book-like; frame only tools that need a boundary

Narrative and teaching prose remain unboxed. The environment contract, optional prerequisite rescue, equations, visual models, safety warnings, and executable starter use framed surfaces because their boundaries carry meaning. This preserves the reader-first design and avoids converting the course into a card dashboard.

### 4. Preserve the 12-hour week; fund the integration gate

The weekly pattern changes from `90, 105, 90, 120, 105, 150, 60` to `90, 105, 90, 105, 105, 105, 120` minutes. Total effort remains 720 minutes, while the weekly reproduce-repair-ship gate receives two hours instead of one.

### 5. Treat tool versions as an operating contract

Each chapter now states the intended baseline, compatibility boundary, contract review date, runtime evidence, smoke check, and drift risk. ROS/Gazebo chapters target the course's ROS 2 Jazzy and Gazebo Harmonic path where relevant; links to rolling, main, latest, or other distributions remain references rather than silent promises of compatibility.

## 26-chapter validation ledger

| Week | Existing strength preserved | Revision and acceptance focus |
|---:|---|---|
| 1 | Physical-first anatomy, joints, C-space, units, vectors, frames, and matrices | Carry one inspection robot through the week; introduce `q` and theta as labels before algebra; defer formal topology; finish with observable paper/browser evidence. |
| 2 | Correct transforms, SO(3), quaternion, SE(3), FK, and bounded IK | Continue one camera-on-arm mission; add a beginner pseudoinverse/damping bridge and a runnable IK trace with residual, limits, and failure status. |
| 3 | Practical mechanics, timing, PID, saturation, and reporting | Use one wobbly delivery-arm incident; map PID onward to system identification, state space, LQR, MPC, and trajectory optimization without overstating mastery. |
| 4 | Strong sensor→filter→controller ownership, replay, and CI | Publish the compiler/CMake/Linux contract and a deterministic timing/cancellation starter with expected output and a planted deadline fault. |
| 5 | Excellent ROS graph, interface, QoS, executor, lifecycle, and watchdog reasoning | Declare one golden stack, isolate compatibility notes, and use a small message/action state-machine starter instead of prose-only implementation. |
| 6 | Clear robot-body, frame, and command-interface boundaries | Carry one measured description through URDF/tf/controller checks; label SRDF as a preview; add model and interface smoke checks. |
| 7 | Coherent simulated lab, sensor contracts, replay, fault injection, and safety | Pin the course path, stage the overloaded bring-up, and preserve MCAP/scenario evidence with explicit ground-truth limits. |
| 8 | Strong end-to-end navigation, recovery, and acceptance content | Reframe as a bounded first flight; expose A* intuition; defer estimator internals; freeze a complete Week 11 handoff bundle. |
| 9 | Measurement-first OpenCV calibration, fiducials, detection, tracking, and metrics | Carry one tabletop inspection incident; identify learned detection as a black-box/provenance preview before PyTorch; preserve frozen image cases. |
| 10 | Rejection-first 3D perception and honest hardware boundaries | Add normal-estimation and point-to-point/point-to-plane distinctions, plus a fixed-camera versus hand-eye calibration boundary. |
| 11 | Excellent state→distribution→Bayes→EKF→SLAM/AMCL ordering | Explicitly consume Week 8 artifacts and compare unchanged scenarios before and after justified estimator changes. |
| 12 | Complete planning-scene→plan→execute→contact manipulation loop | Add deterministic RRT growth, tactile/contact-sensing boundaries, stage traces, and a reproducible acceptance runner. |
| 13 | Strong tensor, split, leakage, seed, checkpoint, latency, and model-card discipline | Carry one robot-shaped dataset/model through a CPU-safe starter and make all version-sensitive tooling part of the environment contract. |
| 14 | Excellent episode schema, time, split, privacy, licensing, checksum, and lineage | Correct sample-window wording; name one dataset release that later weeks consume instead of redefining data contracts. |
| 15 | Strong behavior cloning, covariate shift, DAgger, action chunks, ACT, and rollout evaluation | Add a bounded sim-only MDP/RL decision map, reward-hacking warning, and a fixed policy-evaluation starter that Week 24 reuses. |
| 16 | Production-grade mission state, outbox, idempotency, ownership, ordering, HMI, canary, and rollback | Package one two-robot mission artifact; replace the stale diffusion mathematics bridge with fleet rate, backlog, and idempotency reasoning. |
| 17 | Excellent risk→component→scenario→SIL/HIL→FAT/SAT validation sequence | Carry one hazard and requirement through every layer; replace the stale RL bridge with risk priority, denominator, and recovery-time mathematics. |
| 18 | Coherent multimodal artifact, embodiment, chunk, grounding, and guard sequence | Carry one correlation ID and typed action contract; add calibrated abstention evidence before ecosystem adaptation. |
| 19 | Careful framework/policy/reasoner comparison, LoRA, guarded decoding, and generalization | Add a dated compatibility contract, domain-randomization/system-identification boundary, and fail-closed Day 131 semantics unless clipping is explicitly authorized. |
| 20 | Strong decomposition, typed skills, state/memory, grounding, execution, recovery, and trace | Carry one B-17 run through a deterministic task graph and failure recovery instead of requesting an unspecified implementation. |
| 21 | Strong containment, prompt-injection defense, SROS2 boundary, hazards, metrics, and adversarial tests | Add HRI, human factors, privacy, and independent safety authority; supply a deterministic scenario manifest/validator contract. |
| 22 | Deep production hardware, control-loop, watchdog, bus, and safety treatment | Add a visible zero-power electricity bridge; defer buying and energizing; require a dated local availability/substitution process rather than static shopping claims. |
| 23 | Safe teleoperation, synchronization, coverage repair, splits, and release evidence | Apply the Week 14 schema to a real capstone identity rather than re-teaching it; preserve dead-man and operator-intervention evidence. |
| 24 | Excellent hypothesis, training, export parity, edge profiling, sealed evaluation, and release gates | Consume the exact W15 baseline and W23 dataset identity; add sustained edge evidence and explicit sim-to-real limits. |
| 25 | Strong SIL/HIL/hardware ladder, reproducible deployment, incident replay, OTA, and frozen suites | Turn repeated material into one canary incident narrative that consumes W16/W17/W24 artifacts and ends in an auditable release verdict. |
| 26 | Honest claim ledger, architecture story, résumé mapping, interview, and outreach | Connect portfolio claims to current evidence in the learner's chosen market; use the dated India example in `career-market.ts` only to demonstrate the method, and label every result as simulation, SIL, HIL, hardware, or field evidence. |

## Quality scorecard

The validation suite treats these as release criteria:

| KPI | Baseline | Required revised state |
|---|---:|---:|
| Curriculum identity coverage | 180/180 | 180/180, unchanged IDs |
| Narrative bridge coverage | 14/180 explicit continuity phrases | 180/180 structured bridges |
| Visible prerequisite rescue coverage | 0/26 | 26/26 |
| Deterministic starter coverage | 0/26 | 26/26 |
| Environment contract coverage | 0/26 structured contracts | 26/26 |
| Weekly ship-day budget | 60 minutes | 120 minutes |
| Weekly total budget | 720 minutes | 720 minutes |
| Duplicate narrative bridges | not tested | 0 exact; no high-overlap pairs |
| Starter execution | not available | all 26 run offline and emit declared output |
| Week 8/11 semantic remapping | not applicable | none; IDs, URLs, progress, and Tutor ownership preserved |

Guardrails remain zero raw model HTML, zero client-side Gemini secrets, zero physical-hardware commands that can be used unchanged, zero success-only evidence claims, and zero silent exclusion of failed trials.

## Verification record

Final implementation run on 2026-07-25:

- `npm run verify` passed end to end.
- The production export compiled 189 static pages, including all 180 canonical lesson routes.
- Rendered-shell and curriculum suites passed 97 tests: 6 rendered HTML contracts and 91 content, guide, starter, storage, authentication, public-content, theme, visual, and migration contracts.
- The rendered release contract verified the exact 181-entry sitemap and every lesson's stable numbered slug, title, canonical URL, `LearningResource` structured data, duration, course ownership, and previous/next sequence link.
- All 26 downloaded starter files executed with their published `node <file>.mjs` commands and exact expected output; a 26-week adversarial mutation matrix also proved that malformed data throws, degrades, or produces an explicit rejection rather than silently passing.
- Functions generation/build and 15 server-core Tutor tests passed, including the Week 8 defer/Week 11 theory boundary and quota fail-closed cases.
- Firebase emulators passed 4 Authentication, 12 Firestore security-rule, and 25 callable/transaction contracts, including the racing tenth Tutor credit.
- The complete verification run passed 153 contracts across rendered output, curriculum/application behavior, Functions, Authentication, Firestore rules, and callable transactions.
- Firebase Hosting is mechanically bound to the same evidence: its predeploy gate reruns `npm run verify`, rebuilding `out/` before upload, and the project-scoped release command pins Firebase CLI `15.24.0`.
- Chrome at 1440×900 rendered Day 1, the Day 50 integration-first boundary, and the Day 71 frozen-evidence theory revisit without body overflow; the public Roles view opened with no fixed learner identity or experience claim.
- Chrome at 390×844 rendered the complete Day 180 readiness/starter lesson without body overflow; intentionally wide code/equation content remained locally scrollable rather than widening the page.
- Browser console inspection across these routes found zero warnings and zero errors.

## Residual limitations

- No course audit can prove physical-hardware safety. The revised path remains simulation-first and requires supervised commissioning, independent stops, rated protection, and qualified review for hardware.
- A URL returning HTTP 200 does not prove that version-specific commands work with the declared stack. A chapter smoke check supplies bounded operational evidence for its declared scenario—not proof that every command or workflow is compatible—and must be rerun when a dependency changes.
- Fast-moving VLA, Isaac, LeRobot, MoveIt, Nav2, ros2_control, ROS, Gazebo, and evolving NIST privacy/HRI guidance need periodic official-source review. Pinned ISO editions remain dated reference baselines and still require application- and jurisdiction-specific qualified review.
- A dependency-free JavaScript starter is an entry point, not a substitute for the ROS, Gazebo, PyTorch, or hardware artifacts required by later environment-specific lessons.
