import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION =
  "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION =
  "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI =
  "Robot Learning Deployment / Physical AI Integration Engineer";

export const week26Content = {
  week: 26,
  title: "Convert verified engineering work into role-matched hiring evidence",
  purpose:
    "Turn the completed program and each learner's real prior experience into a truthful, inspectable job-conversion system. This chapter builds a fast portfolio homepage and three evidence-backed project stories, a capstone architecture and incident case study, a role-matched résumé and target-company matrix, scored interview drills, respectful warm outreach, one maintainer-aligned open-source contribution, and a final readiness audit with a focused 30-day sprint. Every claim must point to work that actually exists; experience from software, data, design, operations, manufacturing, electronics, research, or another field may be valuable transfer evidence, but it is never relabeled as unbuilt robotics experience.",
  prerequisites: [
    "Bring the actual repositories, setup instructions, test reports, trial ledgers, architecture notes, incident evidence, demos, and limitations produced during the program. If a planned robotics project is not runnable or documented, mark it `planned`, `in progress`, or `not evidenced`; do not write about it as completed work.",
    "Bring a factual inventory of your own education, work, community projects, and hands-on practice. Record the domain, scope, contribution, evidence, and limits instead of assuming any specific language, framework, degree, title, employer, or experience duration. Redact employer secrets, customer data, credentials, internal URLs, proprietary source, and regulated information before using any artifact publicly.",
    "Bring one current résumé, a list of target companies or postings captured with dates and links, and the exact six target-role definitions in the course market map. A posting is a time-bounded observation, not a permanent promise that the company or requirement remains available.",
    "Be able to run at least two candidate portfolio projects from clean instructions, explain their operating envelopes and failures, and distinguish simulation, software-in-the-loop, hardware-in-the-loop, restricted hardware, and production evidence without collapsing those levels.",
  ],
  outcomes: [
    "Publish a homepage whose target, strongest evidence, three project stories, contact path, and proof links are understandable in a ten-second reviewer test.",
    "Write one capstone case study that makes architecture boundaries, interfaces, tradeoffs, incident facts, causal evidence, correction, verification, uncertainty, and residual risk inspectable.",
    "Build a target-company matrix and tailored résumé versions that map every material claim to verified transfer evidence, direct robotics evidence, partial evidence, or an explicit gap.",
    "Run role-matched technical, debugging, design, and behavioral drills with a fixed rubric; repair weak domains instead of inflating the score with repeated easy questions.",
    "Prepare respectful evidence-led outreach and one narrowly scoped open-source contribution that follows the project’s actual maintainer, issue, test, documentation, and review process.",
    "Complete a blocker-aware readiness audit, choose one evidence-supported specialization, and schedule a 30-day sprint that balances portfolio repair, targeted applications, interviews, outreach, and feedback.",
  ],
  jobTargets: [
    ROLE_HMI,
    ROLE_FLEET,
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "Figure — Current Careers",
      url: "https://www.figure.ai/careers",
      useFor:
        "Primary-company snapshot for observing how current robotics work is grouped across software, integration, testing, operations, and AI; use captured requirements as dated market evidence, never as a guaranteed opening or as a substitute for the course target-role definitions.",
    },
    {
      label: "GitHub Docs — About the repository README file",
      url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
      useFor:
        "Platform-owner guidance on the README as a project entry point explaining what the project does, why it is useful, how to start, where to get help, and who maintains it; used to make portfolio proof runnable rather than decorative.",
    },
    {
      label: "U.S. Department of Labor — Resume Essentials",
      url: "https://www.dol.gov/agencies/vets/programs/tap/teams-workshops/resume-essentials",
      useFor:
        "Official employment-workshop entry point for résumé construction and its current participant guide; used for readable, role-relevant, accomplishment-based presentation while this chapter adds the stricter claim-to-proof requirement for robotics evidence.",
    },
    {
      label: "U.S. Department of Labor — Interview Skills Participant Guide 2026",
      url: "https://www.dol.gov/sites/dolgov/files/VETS/files/InterviewSkills_PG_Interactive_Feb2026.pdf",
      useFor:
        "Official practice material for behavioral interviewing and the Situation, Task, Action, Result structure; used alongside technical explanation, live diagnosis, system design, safety reasoning, and evidence checks specific to the target roles.",
    },
    {
      label: "GitHub Docs — Contributing to open source",
      url: "https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-open-source",
      useFor:
        "Platform-owner workflow for reading project guidelines, finding maintainer-wanted work, forking, branching, testing, opening a pull request, and responding to review; used to prevent résumé-driven changes that ignore upstream needs.",
    },
  ],
  days: [
    {
      dayId: 176,
      mentalModel:
        "A portfolio homepage is a labeled evidence shelf: each claim has a reachable artifact, and empty shelves stay visibly empty rather than holding painted boxes.",
      explanation: [
        "A portfolio is not a second résumé or a gallery of framework logos. It is an index that helps a busy reviewer answer four questions quickly: what role is targeted, what physical or operational problem was addressed, what the learner personally changed, and what evidence supports the result. Put the target statement and strongest verified project above the fold, then offer short paths to architecture, runnable setup, measurements, failures, source, and contact information. “Above the fold” means visible before the first long scroll; it does not mean hiding limitations below it.",
        "Create a claim ledger before writing prose. Each row can use `claim_id | wording | evidence_type | artifact_url | scope | status`. Acceptable evidence may include a reproducible command, source revision, test output, trial ledger, uncut demo, trace, architecture decision, or redacted production result. `status=verified` means the linked artifact supports the exact wording; it does not mean the system is safe, broadly general, or deployed. A screenshot proves only the visible state at that moment, and a passing build proves compilation rather than end-to-end behavior.",
        "Choose three stories for complementary proof, not three copies of the same technology. Depending on the learner's actual history, one story might show an operator interface with stale-state and cancellation behavior, a service or embedded system with idempotency and recovery, a test or field-support investigation, or a hardware build. At least one story should show direct robotics integration, validation, or policy evidence if that work was completed. Each story follows `problem → constraints → contribution → evidence → failure → limit`. If only two robotics projects are real, use a verified project from another domain as explicitly labeled transfer evidence instead of inventing a third robotics build.",
        "Keep experience labels exact. Prior work demonstrates only the capabilities its artifacts support: interface design, service reliability, data analysis, release discipline, electronics, field diagnosis, or another verified skill. Direct robotics evidence begins only where an artifact exercises a robotics-specific contract such as ROS 2 communication, transforms, navigation, hardware interfaces, command freshness, commissioning, fault injection, or a measured policy evaluation. The homepage may say “transitioning verified experience into robotics” and link both evidence types; it must not imply years of robot deployment that the artifacts do not establish.",
      ],
      keyTerms: [
        {
          term: "Evidence-backed claim",
          meaning:
            "A narrowly worded statement whose action, scope, and result can be checked in a linked artifact without relying on the author’s reputation.",
          physicalExample:
            "A claim of twenty replayed mission cases links the case manifest, command, per-case results, and code revision rather than a green badge alone.",
        },
        {
          term: "Proof chain",
          meaning:
            "The navigable path from a short portfolio statement through code, configuration, execution instructions, measurements, failures, and stated limits.",
          physicalExample:
            "A telemetry-card claim opens a trace showing input timestamp, WebSocket receipt, stale-state warning, and the test that forced reconnection.",
        },
        {
          term: "Transfer evidence",
          meaning:
            "Verified experience from another domain that demonstrates a relevant engineering capability without pretending it was performed on a robot.",
          physicalExample:
            "An idempotency repair in an online service supports distributed-systems reasoning, while a separate simulated fleet artifact supplies the robotics context.",
        },
        {
          term: "Operating envelope",
          meaning:
            "The tested conditions, versions, inputs, loads, hardware or simulator, and limits inside which a reported result has direct evidence.",
          physicalExample:
            "A navigation result names the map, simulator release, robot footprint, speed cap, start poses, trial count, and unsupported real-hardware conditions.",
        },
        {
          term: "Reviewer path",
          meaning:
            "The shortest deliberate sequence of links that lets an unfamiliar person understand and independently inspect one important claim.",
          physicalExample:
            "Homepage card to two-minute overview, then README run command, acceptance table, failed run, and exact source revision.",
        },
      ],
      physicalExamples: [
        {
          title: "Operator console with a visible stale-data boundary",
          scenario:
            "A project card shows a Flutter or Web console receiving simulated robot telemetry, losing the connection, marking state stale, rejecting an expired command, reconnecting, and exposing the event log.",
          lookFor:
            "The story separates responsive UI evidence from command-path evidence, links the exact test and trace, states that the robot was simulated, and identifies what would still require commissioned hardware validation.",
        },
        {
          title: "A polished robot video with no inspectable denominator",
          scenario:
            "A homepage autoplays one successful grasp, lists Python and ROS 2, and calls the system reliable, but provides no setup, trial count, failures, commit, or operating conditions.",
          lookFor:
            "The video proves one recorded success only. Replace the reliability claim with the observed event, add the full ledger and failed cases, or remove the unsupported adjective.",
        },
      ],
      workedExample: {
        title: "Turn three mixed-background projects into one honest homepage",
        setup:
          "A hypothetical learner has a verified accessibility repair from a prior product, a runnable simulated two-robot mission service, and a tabletop policy report. The policy ran only on recorded data and simulation; no real-robot rollout exists.",
        steps: [
          "Write the target line as `Target roles: Robot HMI / Control & Monitoring Engineer and Robot Fleet Backend / Platform Engineer; prior evidence: accessible interface delivery and reliable services`, then link role-specific pages rather than claiming a current robotics title.",
          "Inventory the strongest artifact for each project: a redacted incident timeline and regression test, a mission-service README plus retry and deadlock cases, and a policy evaluation manifest with latency and failure categories.",
          "Label the first story `transfer evidence`, the second `simulated robotics evidence`, and the third `offline and simulated policy evidence`; state `real-robot validation: not performed` where it belongs.",
          "Write each 45-word card in the order `problem → personal contribution → measured result → limitation`, removing any number that cannot be traced to a retained source.",
          "Create one reviewer path per card with no dead link: overview, clean-run command, architecture, results, one failed case, source revision, and operating envelope.",
          "Ask a peer to point to the target, strongest proof, and most important limitation within ten seconds; repair only the labels or navigation that caused hesitation.",
        ],
        result:
          "The homepage presents three complementary stories without converting transferable production experience or simulated work into an unsupported real-robot claim.",
        takeaway:
          "Credibility rises when a reviewer can find both the strongest result and the boundary of that result without asking the author for missing context.",
      },
      handsOn: {
        setup:
          "Work from the learner’s real artifact inventory and a local draft of the homepage. Do not publish employer-confidential material or any claim whose supporting file cannot be opened.",
        steps: [
          "Create the claim ledger and classify every proposed sentence as `verified direct robotics`, `verified transfer`, `partial`, `planned`, or `remove`; add a link and operating scope to every verified row.",
          "Select three projects that together show interface, platform or integration, and evidence discipline; substitute an honest production-software story when a robotics lane has not actually been built.",
          "Write a one-sentence target statement using the exact target roles, then draft three cards with problem, constraint, personal contribution, result, failure, and limitation.",
          "For each repository, make the documented setup work from a clean location or mark the project blocked; record commands, expected output, versions, runtime, and any unavailable dependency.",
          "Check every homepage and story link, keyboard navigation, mobile layout, image alternative text, private-data redaction, metric denominator, and source revision.",
          "Run the ten-second reviewer test with someone unfamiliar with the projects, record each wrong interpretation, and revise the information path until the target and evidence boundary are understood.",
        ],
        observe:
          "The hardest homepage problem is usually not visual polish; it is deciding which sentence has enough evidence, which artifact a stranger can reproduce, and which impressive-looking claim must be narrowed.",
        doneWhen:
          "Three project paths open correctly, at least two are runnable or replayable, every quantitative claim has a denominator and artifact, every robotics level is labeled, and no private or unbuilt work is presented as proof.",
      },
      jobConnection: {
        roles: [ROLE_HMI, ROLE_FLEET, ROLE_VALIDATION],
        workExample:
          "For Robot HMI / Control & Monitoring Engineer, expose an operator-interface state transition and stale-command test; for Robot Fleet Backend / Platform Engineer, expose mission identity, retry, ordering, and recovery evidence; for Robotics Deployment, Integration & Validation Engineer, expose the traceability matrix, fault result, acceptance decision, and unresolved boundary. The same homepage can route each reader to different verified proof without changing the underlying facts.",
        interviewPrompt:
          "Walk me through one portfolio claim from headline to source revision. What exactly ran, under which simulator or hardware conditions, what did you personally implement, which result and denominator are retained, which failure is visible, and which robotics experience would be inaccurate to infer from this evidence?",
      },
      commonMistakes: [
        {
          mistake: "Leading every project with a long list of languages, frameworks, and robotics nouns.",
          correction:
            "Lead with the physical or operational problem, personal engineering decision, measured result, evidence link, and limitation; list technology only where it explains an interface or tradeoff.",
        },
        {
          mistake: "Calling a simulation, recorded-data replay, or UI mockup a deployed robot system.",
          correction:
            "Label the evidence level exactly, state what the artifact exercises, and name the commissioned hardware, field, or production validation that has not occurred.",
        },
        {
          mistake: "Publishing a metric copied from memory because the underlying report is private.",
          correction:
            "Use an approved redacted artifact, replace the number with a supported qualitative statement, or remove the claim; confidentiality never licenses an unverifiable result.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the difference between transfer evidence and direct robotics evidence?",
          answer:
            "Transfer evidence proves a relevant capability in another domain, such as service recovery or interface state handling; direct robotics evidence exercises a robotics-specific contract in a clearly labeled simulator, HIL, hardware, or field context.",
        },
        {
          question: "What does a passing build prove about a portfolio project?",
          answer:
            "It proves that the checked revision compiled or bundled in that environment. It does not prove correct runtime behavior, physical performance, safety, reliability, or end-to-end acceptance.",
        },
        {
          question: "What should replace a third robotics story when only two were actually built?",
          answer:
            "Use a verified production-software story as explicitly labeled transfer evidence, or show an in-progress gap honestly; do not manufacture a completed robotics project.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The live homepage, claim ledger, and reviewer-path link check are the evidence being taught; a generic portfolio diagram would repeat their structure without proving navigation or credibility.",
      },
    },
    {
      dayId: 177,
      mentalModel:
        "A case study is a cutaway machine beside its repair log: show where information moved, where it failed, what proved the cause, and what risk remains.",
      explanation: [
        "Start the architecture story with a system boundary, not a cloud of boxes. Name the user or operator, robot or simulator, edge process, ROS 2 graph, service boundary, storage, external dependency, and the authority that may issue or cancel motion. For every arrow, write the payload or action, direction, protocol, ownership, freshness rule, failure result, and observability point. A box labeled `backend` hides the questions an interviewer needs answered; `POST /missions` with `mission_id`, idempotency rule, accepted state, and cancellation owner makes the boundary inspectable.",
        "A tradeoff is a deliberate choice between competing properties under constraints, not a retrospective defense of whatever was built. Use the form `decision | alternatives | constraint | benefit | cost | evidence | revisit trigger`. For example, retaining PostgreSQL as the mission source of truth while using Redis for transient coordination may improve recoverability but adds consistency and outage questions. The story must show why that balance fit the tested workload, what measurement informed it, and which condition would force a different design.",
        "Build the incident section from evidence in time order. Separate `fact`—a trace, row, timestamp, packet, or observed motion—from `inference`—the current explanation—and `unknown`—missing proof. “The client timed out” can be factual; “the network caused a duplicate mission” needs correlation across request IDs, retries, writes, and queue events. Root cause is the evidenced mechanism that explains the failure, not the component closest to the symptom. If the actual cause remains uncertain, publish the strongest bounded hypothesis and the decisive experiment still needed.",
        "Verification must challenge the correction through the same failure path plus neighboring risks. Reproduce the defect first, make one causal change, rerun the fixed case, add a regression test, and exercise timeout, cancellation, restart, concurrency, and rollback boundaries relevant to that change. Report before and after denominators without treating a small observed reduction as universal proof. Finish with residual risk: what still depends on real hardware, longer duration, more load, clock behavior, customer configuration, or an unavailable fault. An incident story is stronger when it explains what the fix did not establish.",
      ],
      keyTerms: [
        {
          term: "System boundary",
          meaning:
            "The declared line around components owned by the project, including the interfaces through which actors, devices, services, and dependencies cross.",
          physicalExample:
            "A teleoperation boundary separates browser intent, authenticated gateway, ROS 2 action server, local command guard, controller, and measured wheel motion.",
        },
        {
          term: "Interface contract",
          meaning:
            "The payload, units, direction, timing, state, error, ownership, and compatibility rules that both sides of a connection must obey.",
          physicalExample:
            "A velocity request carries metres per second, frame, sequence, expiry, lease identity, and a terminal rejection reason.",
        },
        {
          term: "Tradeoff",
          meaning:
            "A choice that improves one desired property while accepting a named cost or constraint, supported by evidence and a revisit condition.",
          physicalExample:
            "A shorter command lease reduces stale-motion exposure but requires more frequent renewals and becomes more sensitive to network jitter.",
        },
        {
          term: "Incident",
          meaning:
            "An observed event that degraded or threatened the expected system outcome and deserves a reconstructable timeline, impact, containment, and follow-up.",
          physicalExample:
            "A mission acknowledgment timed out, the client retried, and two queue entries appeared for one requested delivery.",
        },
        {
          term: "Root cause",
          meaning:
            "The evidenced mechanism whose correction prevents or controls the reproduced failure within the tested conditions, distinguished from symptom and speculation.",
          physicalExample:
            "Two requests with one mission identity reached an insert path lacking a uniqueness guard, producing duplicate accepted rows under replay.",
        },
        {
          term: "Residual risk",
          meaning:
            "A remaining failure possibility after the selected correction and verification, including conditions not represented by the available test environment.",
          physicalExample:
            "The retry test passes in simulation, but prolonged edge disconnection and controller reboot on commissioned hardware remain unevaluated.",
        },
      ],
      physicalExamples: [
        {
          title: "Duplicate mission after an ambiguous timeout",
          scenario:
            "A simulated fleet client sends `mission_id=m-41`; the service commits the mission but its reply is delayed, so the client retries and two queue entries appear.",
          lookFor:
            "Trace one identity through both requests, database writes, dispatcher events, and acknowledgments. Distinguish the delayed reply from the missing idempotency enforcement that allowed the duplicate state.",
        },
        {
          title: "Operator display stays green after telemetry expires",
          scenario:
            "A Web or Flutter status card preserves the last `idle` value when a simulated robot stops publishing, so the screen looks healthy although the sample is five seconds old.",
          lookFor:
            "Show timestamp ownership, age calculation, stale threshold, disconnected state, command consequences, and the test proving the corrected UI does not infer fresh physical state from cached data.",
        },
      ],
      workedExample: {
        title: "Write a trace-backed duplicate-mission incident case",
        setup:
          "In a hypothetical simulator run, three of twelve retry cases create duplicate mission rows. The service has request logs and database timestamps but no physical robot was connected.",
        steps: [
          "Draw the bounded path `client → mission API → PostgreSQL → dispatcher → simulated robot`, then annotate mission identity, request identity, retry timeout, accepted response, queue event, and cancellation ownership.",
          "Build the timeline from retained facts: request `r1` arrives, row `m-41/a` commits, response exceeds the client timeout, request `r2` arrives with the same mission identity, and row `m-41/b` commits.",
          "List hypotheses separately: duplicate client submission, message redelivery, transaction retry, or missing idempotency guard; do not call any one the cause until evidence distinguishes it.",
          "Replay both requests against the same revision and observe two accepted rows; inspect the schema and write path to confirm there is no unique mission identity or conflict-return behavior.",
          "Add one atomic uniqueness rule and deterministic existing-result response, then rerun the original twelve cases plus concurrent retries, restart, cancellation, and rollback checks.",
          "Report `3/12` duplicates before and `0/20` in the expanded post-fix suite, while stating that the different denominators and simulated environment do not prove all networks, loads, or robot controllers safe.",
        ],
        result:
          "The case study links architecture, incident timeline, decisive reproduction, bounded correction, regression evidence, and residual hardware and scale risk without blaming an unproven network cause.",
        takeaway:
          "The persuasive unit is not the fix alone; it is the unbroken chain from observed symptom through decisive evidence to a correction tested against the failure mechanism.",
      },
      handsOn: {
        setup:
          "Choose one incident that actually occurred in a course project or one clearly labeled teaching reconstruction. Use only artifacts you are allowed to publish and preserve the original failure evidence.",
        steps: [
          "Define the system boundary and annotate every important interface with data or command, units, direction, authority, timing rule, failure result, and observability point.",
          "Select three consequential decisions and fill `alternatives | constraint | chosen option | benefit | cost | evidence | revisit trigger` without describing ordinary implementation as a tradeoff.",
          "Reconstruct one incident timeline from logs, traces, state snapshots, trial rows, or video; label every entry `fact`, `inference`, or `unknown` and redact sensitive content.",
          "Reproduce the failure on the preserved baseline or explain the exact blocker, then design the smallest measurement that separates the leading causal hypotheses.",
          "Document the correction and rerun the original case plus relevant boundary, cancellation, restart, concurrency, rollback, and regression checks with exact revisions and denominators.",
          "Publish the impact, containment, evidence-supported cause or remaining hypothesis, verification result, residual risk, and unsupported real-hardware or production conditions.",
        ],
        observe:
          "Architecture prose becomes clearer when every unexplained arrow is treated as an unanswered contract, and incident certainty becomes narrower when facts are forced into a separate column from interpretations.",
        doneWhen:
          "A reviewer can follow one identity through the architecture and timeline, reproduce or inspect the failure, see why alternatives were rejected, verify the correction, and name at least one remaining risk.",
      },
      jobConnection: {
        roles: [ROLE_FLEET, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_SOFTWARE],
        workExample:
          "A Robot Fleet Backend / Platform Engineer must defend mission identity, state transitions, ordering, observability, and recovery; a Robotics Application / ROS 2 Integration Engineer must expose protocol and lifecycle boundaries; a Robotics Deployment, Integration & Validation Engineer must make the failure reproducible and acceptance-linked; a Robotics Software Engineer — ROS 2 / AMR must reason about the behavior reaching the robot. One evidence chain lets each role inspect its boundary.",
        interviewPrompt:
          "Draw the capstone from operator request to observed robot or simulator outcome, then defend one tradeoff and one incident. Which statements are facts, what evidence isolates the root cause, why is the correction causally appropriate, which regression cases ran, and what residual risk prevents a broader claim?",
      },
      commonMistakes: [
        {
          mistake: "Drawing product names and arrows without payload, time, ownership, or failure behavior.",
          correction:
            "Annotate every consequential interface with contract, authority, freshness, terminal states, compatibility, observation point, and the safe or bounded failure result.",
        },
        {
          mistake: "Calling the first plausible explanation the root cause.",
          correction:
            "List competing hypotheses, identify a discriminating measurement, reproduce the mechanism, and retain uncertainty when the available evidence cannot select one cause.",
        },
        {
          mistake: "Ending the incident story with “added retries and it worked.”",
          correction:
            "Explain why retry is valid for the operation, how duplicate effects are prevented, what timeout and cancellation mean, which cases verified the change, and what retry can still amplify.",
        },
      ],
      checkQuestions: [
        {
          question: "What information turns an architecture arrow into an inspectable interface?",
          answer:
            "Name the data or command, schema and units, direction, protocol, owner, authority, timing or freshness rule, compatibility, observable state, errors, and bounded failure result.",
        },
        {
          question: "When may an incident case study call a mechanism the root cause?",
          answer:
            "When evidence distinguishes it from credible alternatives, the mechanism reproduces the observed failure, and a targeted correction controls that mechanism under the stated test conditions.",
        },
        {
          question: "Why does `0/20` duplicate missions after a fix not prove universal reliability?",
          answer:
            "It is evidence for those twenty cases, revision, environment, timing, and load only; hardware behavior, larger samples, different networks, concurrency, and long-duration operation may remain untested.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The authored boundary diagram, interface annotations, fact-versus-inference timeline, and before-and-after replay are the necessary evidence; the generic lesson visual would not represent the learner’s actual incident.",
      },
    },
    {
      dayId: 178,
      mentalModel:
        "A targeted résumé is a wiring harness between one role’s requirements and verified proof; the matrix reveals every connected pin, weak joint, and deliberately open circuit.",
      explanation: [
        "A target-company matrix prevents tailoring from becoming word replacement. Create one row per dated posting and columns for company, exact target role, required capability, frequency, evidence level, best artifact, résumé bullet, interview story, gap, next action, and status. Normalize synonyms only when the underlying work is genuinely equivalent; `C++` is not interchangeable with Java, and a WebSocket dashboard is not automatically a ROS 2 integration. The matrix should preserve the posting URL and capture date because roles, wording, and availability can change.",
        "Use four evidence levels: `strong` means a reviewer can inspect work matching the requirement and scope; `partial` means a relevant component or transfer exists but an important context is missing; `gap` means no defensible evidence; `not required` means the posting does not ask for it. Compute coverage only over core requirements and retain the category counts. Seven strong rows out of ten gives `7/10`, not “a perfect match” after partial evidence is silently promoted. Frequency across several postings helps prioritize gaps, but demand alone does not prove personal readiness.",
        "Applicant tracking system, abbreviated ATS, means software employers may use to store, search, and route applications. A simple, readable document with ordinary headings and the posting’s truthful terminology is safer than columns, hidden keywords, or graphics that may parse badly. Tailoring means selecting and ordering the most relevant verified experience, not copying every noun from the advertisement. Use the target role exactly, spell out an unfamiliar acronym at first use, preserve real employment dates and titles, and never add a skill only to satisfy a keyword search.",
        "Translate each learner's actual background at the correct level. Interface work may support operator workflow, state visibility, accessibility, and release evidence; service or embedded work may support APIs, data consistency, timing, observability, and incident recovery; QA, operations, research, manufacturing, or field work may support traceability, measurement, commissioning, and rollback. These are examples rather than assumed credentials. Attach direct robotics project proof separately. A bullet template such as `action + system + constraint + measured result + proof` is useful only when every placeholder comes from an actual record; write `N` during drafting rather than inventing a number.",
        "Maintain a base résumé and a small role-specific evidence section for each application family. For Robot HMI / Control & Monitoring Engineer, lead with verified interface and command-state work. For Robot Fleet Backend / Platform Engineer, lead with service reliability and mission-workflow proof. For Robotics Deployment, Integration & Validation Engineer, lead with regression, observability, commissioning, and incident evidence. More specialized targets require direct ROS 2, AMR, hardware, or policy artifacts; unrelated tenure or education alone does not satisfy robotics-native requirements.",
      ],
      keyTerms: [
        {
          term: "Target-company matrix",
          meaning:
            "A dated table mapping each selected company and exact role to requirements, verified evidence, gaps, application state, and the next deliberate action.",
          physicalExample:
            "One row links a fleet-platform requirement to a Python mission replay, marks AMR traffic experience partial, and schedules one bounded repair project.",
        },
        {
          term: "Core requirement",
          meaning:
            "A capability the posting treats as necessary or central, distinguished from a preference, company description, or generic collaboration language.",
          physicalExample:
            "A required ROS 2 integration example remains a gap even when the candidate has strong Java messaging experience.",
        },
        {
          term: "Evidence level",
          meaning:
            "The declared strength of support for one requirement—strong, partial, gap, or not required—based on inspectable scope rather than confidence.",
          physicalExample:
            "A simulated navigation recovery with logs is direct but environment-bounded evidence; production Web recovery is relevant transfer evidence, not equivalent proof.",
        },
        {
          term: "Applicant tracking system",
          meaning:
            "Software used to receive, organize, search, and route job applications; it does not justify false keywords or unreadable keyword stuffing.",
          physicalExample:
            "A single-column résumé places `Skills`, `Experience`, and `Projects` in ordinary text so both software and human reviewers can parse them.",
        },
        {
          term: "Role-matched bullet",
          meaning:
            "A résumé statement selected because its verified action, system, constraint, and outcome answer a material requirement of one target role.",
          physicalExample:
            "A mission replay bullet links the retry boundary, deterministic cases, measured duplicate count, and public regression artifact.",
        },
      ],
      physicalExamples: [
        {
          title: "Strong software transfer with an explicit robotics gap",
          scenario:
            "A candidate has shipped services with idempotent requests and incident replay, while the selected fleet project exercises two simulated robots but no customer-site AMR deployment.",
          lookFor:
            "Mark distributed reliability strong, simulated mission orchestration direct but bounded, and customer-site commissioning as a gap. The combination is credible because its boundaries remain visible.",
        },
        {
          title: "Résumé keyword pile without a proof path",
          scenario:
            "A skills section lists many robotics, navigation, AI, interface, and service technologies, but only a UI prototype and an analysis notebook are linked.",
          lookFor:
            "Remove or downgrade unsupported terms, add evidence for work actually performed, and let the matrix keep the remaining capabilities as learning gaps rather than résumé claims.",
        },
      ],
      workedExample: {
        title: "Build three role rows and one evidence-first résumé bullet",
        setup:
          "A hypothetical candidate has verified interface, backend-service, and test-automation artifacts plus a simulated mission service and a ROS 2 lab. No real-robot field deployment or learned-policy rollout exists.",
        steps: [
          "Create rows for Company A with Robot HMI / Control & Monitoring Engineer, Company B with Robot Fleet Backend / Platform Engineer, and Company C with Robotics Deployment, Integration & Validation Engineer; attach the dated source posting to each.",
          "Extract ten core requirements across the rows and normalize only true equivalents, keeping robotics-native C++, a different production language, ROS 2, realtime networking, simulation, HIL, and field commissioning separate.",
          "Attach evidence: interface state recovery is strong transfer for Company A, mission idempotency is direct simulated proof for Company B, and fault-matrix automation is direct simulated proof for Company C.",
          "Score seven requirements `strong`, two `partial`, and one `gap`, yielding `strong_coverage = 7 / 10 = 70%`; keep the partial and missing rows visible instead of converting them into points.",
          "Draft `Implemented idempotent mission acceptance in a simulator service; replayed N timeout cases with zero duplicate accepted missions after the fix; evidence: <link>`, then replace `N` only from the retained result.",
          "Generate one readable résumé version per selected family, verify every noun and number against the ledger, and remove the direct real-robot implication because no such rollout occurred.",
        ],
        result:
          "The matrix shows where prior evidence transfers, where course projects provide direct but bounded robotics proof, and where an application still carries an explicit gap.",
        takeaway:
          "Tailoring changes relevance and order; it never changes the historical facts, evidence level, or environment in which the work occurred.",
      },
      handsOn: {
        setup:
          "Use ten current postings that genuinely fit the six course target roles, the source URLs and capture dates, the learner’s claim ledger, and an editable base résumé.",
        steps: [
          "Enter each company, exact course target role, source URL, capture date, location or work constraint, and application status without assuming the posting will remain open.",
          "Extract core and preferred requirements, normalize recurring capabilities carefully, count their frequency, and identify the interview domains each requirement is likely to exercise.",
          "Assign `strong`, `partial`, `gap`, or `not required` to every core requirement and attach one permitted artifact, scope statement, and evidence type to each non-gap row.",
          "Compute strong coverage per role, retain partial and gap counts, and prioritize one gap by posting frequency, role importance, learning cost, and ability to create honest evidence within thirty days.",
          "Rewrite three senior-experience bullets and three project bullets using action, system, constraint, measured result, and proof; remove every unverified metric and unbuilt robotics implication.",
          "Export a plain, readable résumé version for each application family, parse its text, test every link, compare it against the matrix, and ask a reviewer to identify the target and strongest proof quickly.",
        ],
        observe:
          "A precise matrix often lowers the apparent match before it improves it, because familiar software nouns separate into direct robotics evidence, useful transfer, partial context, and true gaps.",
        doneWhen:
          "Ten dated rows exist, every core requirement has an evidence level and next action, all résumé claims trace to artifacts, role versions differ by relevance rather than truth, and unsupported robotics terms are absent.",
      },
      jobConnection: {
        roles: [
          ROLE_HMI,
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "Use the matrix to decide whether verified interface and state-handling evidence supports Robot HMI / Control & Monitoring Engineer, whether service and distributed-systems evidence supports Robot Fleet Backend / Platform Engineer, or whether QA, commissioning, and incident work plus actual robotics tests supports Robotics Deployment, Integration & Validation Engineer. Require direct integration, AMR, hardware, or policy proof for the more robotics-specific roles, and retain every uncovered requirement as an owned gap.",
        interviewPrompt:
          "Choose one résumé bullet and map every phrase to evidence. Which part is transfer from prior work, which part is direct robotics work, what simulator or hardware level ran, what was the denominator, why is the bullet relevant to this exact role, and which attractive keyword did you deliberately omit because you could not prove it?",
      },
      commonMistakes: [
        {
          mistake: "Counting partial evidence as fully covered to raise the match percentage.",
          correction:
            "Keep `strong`, `partial`, and `gap` counts separate, define the missing context in every partial row, and use only strong rows in the primary coverage ratio.",
        },
        {
          mistake: "Changing a résumé title or technology to resemble the posting.",
          correction:
            "Preserve actual historical titles and technologies, then explain relevant transfer in bullets and the summary without fabricating identity, experience duration, or tools.",
        },
        {
          mistake: "Using tables, graphics, hidden keywords, and dense jargon to impress the applicant tracking system.",
          correction:
            "Use ordinary headings and readable text, include only truthful posting language, parse the exported file, and optimize first for a human who must verify the evidence.",
        },
      ],
      checkQuestions: [
        {
          question: "What does `7/10` strong coverage mean in the worked example?",
          answer:
            "Seven of ten declared core requirements have inspectable strong evidence. It does not erase two partial requirements, one gap, or any mandatory requirement that the role treats as a blocker.",
        },
        {
          question: "How is résumé tailoring different from keyword substitution?",
          answer:
            "Tailoring selects, orders, and explains truthful evidence for one role; substitution changes wording without equivalent work and can create unsupported skill or experience claims.",
        },
        {
          question: "May messaging-system experience from another domain be listed as ROS 2 experience?",
          answer:
            "No. It can support transferable distributed-systems reasoning, while ROS 2 must be backed by actual ROS 2 artifacts with the relevant graph, QoS, lifecycle, timing, and integration scope.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The sortable target-company matrix and claim-to-proof rows already expose exact coverage and gaps; a generic evidence graphic would hide the role-specific source links and scope labels.",
      },
    },
    {
      dayId: 179,
      mentalModel:
        "Interview preparation is a fault-injection bench for explanations, while outreach and contribution are respectful interface tests with real people, constraints, and review feedback.",
      explanation: [
        "Build drills from the selected role’s actual evidence and interview domains, not a trivia list. Use four modes: explain a concept from first principles, implement or inspect a small contract, diagnose an observed failure, and defend a system design or tradeoff. Add behavioral questions about ownership, disagreement, incident response, and learning. A correct definition earns little if the learner cannot state assumptions, choose measurements, connect software state to physical consequence, and identify the safety or evidence boundary. Record the first attempt before studying the correction.",
        "Score every answer with the same rubric: technical correctness, explicit assumptions, evidence plan, boundary and safety reasoning, structure, and time. Mark `strong` only when the reasoning survives follow-up; `partial` means useful content with a consequential omission; `weak` means incorrect, unsupported, or unable to proceed. Track results by domain, because sixteen strong answers out of twenty can conceal that every ROS 2 timing question failed. Retest only the fourteen partial or weak items in a `26 strong / 9 partial / 5 weak` set instead of recycling easy wins.",
        "For behavioral answers, Situation, Task, Action, Result—STAR—is a compression structure, not permission to make the story tidy by inventing an outcome. State the context and your responsibility briefly, spend most time on the actions and decisions you personally owned, then report the measured or observed result and limitation. A production incident can demonstrate senior judgment even when it was not robotics work, as long as the answer labels that context and separately explains how the same reasoning appears in a robotics artifact.",
        "Warm outreach means a message has a legitimate context: shared work, a public talk or repository, a mutual connection, or a specific technical question grounded in the recipient’s published material. Keep it short, show that the work was actually read, link one relevant artifact, and ask for a bounded perspective rather than a job or referral. Do not automate personal messages, scrape private contact details, or treat silence as consent to repeated follow-ups. Record outreach as sent only after it is genuinely sent and preserve the final content for review.",
        "An open-source contribution must help the project on its terms. Read `README`, `CONTRIBUTING`, code of conduct, license, setup, tests, issue discussion, and maintainer guidance before editing. Prefer one reproducible bug, missing test, documentation correction, or small requested change that matches existing patterns. Align scope in the issue when needed, include the project’s required tests and documentation, and respond to review without force-pushing away context. An opened pull request is evidence of a proposal; only the upstream record establishes review, acceptance, merge, or release.",
      ],
      keyTerms: [
        {
          term: "Interview drill",
          meaning:
            "A timed, repeatable prompt with a fixed rubric that exposes reasoning gaps across explanation, implementation, diagnosis, design, or behavior.",
          physicalExample:
            "A late command trace must be diagnosed aloud from timestamps before the learner is allowed to inspect the prepared solution.",
        },
        {
          term: "Calibrated score",
          meaning:
            "A rating tied to explicit criteria and follow-up performance, kept comparable across attempts instead of based on confidence or speaking polish.",
          physicalExample:
            "An answer remains partial when it names QoS but cannot explain the observed stale message, measurement, or bounded correction.",
        },
        {
          term: "STAR",
          meaning:
            "Situation, Task, Action, Result: a concise structure for a factual past example that keeps personal responsibility and outcome understandable.",
          physicalExample:
            "A release incident answer names the outage context, owned rollback task, exact diagnostic actions, observed recovery, and remaining follow-up.",
        },
        {
          term: "Warm outreach",
          meaning:
            "A respectful message grounded in a real connection or specific public work, with a small relevant request and no assumed obligation.",
          physicalExample:
            "A note references one maintainer’s fault-replay talk, links a matching public experiment, and asks one question about evaluation boundaries.",
        },
        {
          term: "Upstream",
          meaning:
            "The original project and maintainer-controlled repository to which an external contributor proposes a change from a fork or branch.",
          physicalExample:
            "A local documentation fix becomes upstream evidence only through the project’s issue, pull-request, review, and merge records.",
        },
        {
          term: "Contribution state",
          meaning:
            "The factual current status of proposed work, such as drafted, locally tested, pull request opened, changes requested, merged, or released.",
          physicalExample:
            "A tested branch with an open pull request is labeled `opened`, not `accepted`, until maintainers merge it.",
        },
      ],
      physicalExamples: [
        {
          title: "Late telemetry interview diagnosis",
          scenario:
            "A mock interviewer shows command time `10.000 s`, gateway receipt `10.035 s`, controller receipt `10.210 s`, and an operator screen that still reports `connected`.",
          lookFor:
            "Clarify clock comparability, compute stage delays, ask for queue and sample-age evidence, explain physical consequences, propose bounded instrumentation, and avoid naming a network fix before locating the delay.",
        },
        {
          title: "Small documentation contribution with a runnable check",
          scenario:
            "A maintained robotics repository has an approved issue because its setup guide omits one required environment step; the learner reproduces the failure and prepares the smallest documentation and test update allowed.",
          lookFor:
            "The contribution follows the repository instructions, links the issue, preserves scope, includes before-and-after commands, passes required checks, and describes its state accurately during review.",
        },
      ],
      workedExample: {
        title: "Turn one mission incident into four scored interview answers",
        setup:
          "Use the hypothetical duplicate-mission case from Day 177. The first technical answer is limited to three minutes, and the rubric gives one point each for correctness, assumptions, evidence, boundary reasoning, structure, and time.",
        steps: [
          "Record a two-minute overview stating the user impact, architecture path, personal contribution, decisive reproduction, correction, observed result, and simulation-only limitation.",
          "Answer an explanation prompt: define idempotency using `mission_id=m-41`, distinguish request retry from effect duplication, and state which result repeated calls must return.",
          "Answer a diagnosis prompt from the timeline without seeing the code; label facts, propose competing hypotheses, and choose the unique-row and write-path inspection as the discriminating evidence.",
          "Answer a design prompt comparing database uniqueness, application-only lookup, and queue deduplication across atomicity, crash, concurrency, observability, cancellation, and rollback.",
          "Answer a behavioral prompt with factual STAR: production or project context, owned task, exact actions, measured result, and what remained uncertain; do not convert the simulated case into field experience.",
          "Score each recording, total only criteria actually met, write one correction per missed criterion, and repeat the weak prompt with a new boundary such as concurrent retry or service restart.",
        ],
        result:
          "One verified project now supports distinct technical and behavioral lenses, while the score reveals whether the learner can reason beyond a memorized project summary.",
        takeaway:
          "A strong interview story is reusable because its evidence and decisions are deep, not because the same rehearsed paragraph is forced onto every question.",
      },
      handsOn: {
        setup:
          "Use the top two target roles, the company matrix, real project artifacts, a recording tool, five public-work outreach targets, and one actively maintained relevant repository. Do not send messages or start code before reviewing context and contribution rules.",
        steps: [
          "Create forty prompts across role fundamentals, implementation, debugging, design, safety, and behavioral ownership; map each prompt to one exact target-role domain and the evidence expected in a strong answer.",
          "Record ten timed answers without notes, score correctness, assumptions, evidence, boundary reasoning, structure, and time, then classify each answer `strong`, `partial`, or `weak` with one exact correction.",
          "Retest only partial and weak domains using changed numbers or failure conditions, and preserve both attempts so improvement is not inferred from an easier repeated question.",
          "Draft five short outreach notes containing `context | specific observation | relevant artifact | one bounded question | no-pressure close`; verify public contact route, recipient relevance, and every link before any manual send.",
          "Select one maintained repository, read all contribution and security instructions, reproduce a real issue, confirm or request scope, and prepare one small branch with the required tests and documentation.",
          "Open or update the contribution only when its checks pass and project rules permit it, then record the exact state and review feedback without claiming acceptance, merge, release, or employer relevance prematurely.",
        ],
        observe:
          "Weak preparation often hides behind fluent summaries: changed follow-ups expose missing causal reasoning, while maintainer feedback exposes whether the contributor understood the surrounding system and social contract.",
        doneWhen:
          "Ten first attempts and targeted retests are scored, five respectful notes are review-ready or truthfully sent, one contribution follows upstream rules with checks, and every public claim matches its actual state.",
      },
      jobConnection: {
        roles: [
          ROLE_HMI,
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "Drill stale operator state for Robot HMI / Control & Monitoring Engineer, idempotency and backpressure for Robot Fleet Backend / Platform Engineer, fault isolation and traceability for Robotics Deployment, Integration & Validation Engineer, frames and lifecycle for Robotics Application / ROS 2 Integration Engineer, C++ and AMR behavior for Robotics Software Engineer — ROS 2 / AMR, and dataset or policy evaluation boundaries for Robot Learning Deployment / Physical AI Integration Engineer. Outreach and contribution artifacts should reinforce only domains actually demonstrated.",
        interviewPrompt:
          "You receive an unfamiliar robot-system failure and cannot inspect all components. Show how you clarify the contract, separate facts from hypotheses, select decisive measurements, connect delay or state error to physical consequence, choose a bounded correction, verify cancellation and recovery, and communicate what remains unknown. Then identify which part is supported by your own work.",
      },
      commonMistakes: [
        {
          mistake: "Memorizing polished definitions and repeating the same project answer for every prompt.",
          correction:
            "Practice changed constraints, live evidence selection, calculations, failure diagnosis, alternatives, and follow-up questions; score reasoning dimensions separately from delivery.",
        },
        {
          mistake: "Sending generic outreach that immediately asks for a referral.",
          correction:
            "Ground the note in specific public work or a legitimate connection, link one relevant artifact, ask one bounded perspective question, and make non-response easy.",
        },
        {
          mistake: "Calling an opened pull request an accepted open-source contribution.",
          correction:
            "Report the exact upstream state—opened, under review, changes requested, merged, or released—and link the public record rather than predicting the maintainer’s decision.",
        },
      ],
      checkQuestions: [
        {
          question: "Why should drill scores be tracked by domain instead of only as one total?",
          answer:
            "An overall score can hide a complete gap in a core domain such as ROS 2 timing, safety reasoning, C++, controls, or policy evaluation; domain counts direct the repair work.",
        },
        {
          question: "What makes outreach warm rather than merely personalized?",
          answer:
            "It has legitimate context in shared or public work, demonstrates a specific informed observation, offers relevant evidence, and asks for a bounded response without entitlement or pressure.",
        },
        {
          question: "What can be claimed when a tested pull request is open but not merged?",
          answer:
            "Claim that the pull request was opened with the named scope and checks. Do not claim acceptance, merge, release, adoption, or impact until the upstream record proves those states.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "Recorded answers, rubric deltas, outreach drafts, and the upstream issue and pull-request history provide direct feedback evidence; a generic interview illustration would not improve diagnosis.",
      },
    },
    {
      dayId: 180,
      mentalModel:
        "Readiness is a preflight board, not a confidence gauge: mandatory lights must be green, optional faults need owners, and the next flight has a dated route.",
      explanation: [
        "Audit readiness against one exact target role and real evidence. Build gates for role fit, software foundations, robotics fundamentals, relevant integration, two runnable projects, code quality, setup reproducibility, measured outcomes, failure analysis, safety boundaries, communication, and interview performance. Score each capability `0=no evidence`, `1=guided fragment`, `2=independent bounded evidence`, or `3=repeated or externally reviewed evidence`. The total is descriptive only. A zero in a mandatory safety, runnable-project, or core-role gate blocks that claim even when easier categories raise the average.",
        "Run a retrospective as an engineering review of the learning system. Ask which prior skills transferred cleanly, which robotics assumptions repeatedly failed, where reproduction depended on the original machine, which project generated the strongest interview evidence, and which weeks produced activity without durable proof. Separate outcome from effort: many hours do not compensate for a missing artifact, while one well-instrumented failure may teach more than several polished demos. Preserve concrete decisions to stop, continue, or change instead of writing a motivational diary.",
        "Choose one specialization by evidence, fit, market observations, and the cost of closing its core gaps. Interface and command-state proof may support Robot HMI / Control & Monitoring Engineer; service reliability and mission-workflow proof may support Robot Fleet Backend / Platform Engineer; fault, release, integration, and acceptance evidence may support Robotics Deployment, Integration & Validation Engineer. Robotics-core and physical-AI paths remain legitimate, but they require direct ROS 2, C++, mathematics, AMR, real-robot or HIL, dataset, or policy evidence rather than prestige or unrelated seniority.",
        "A 30-day sprint is a time-boxed execution plan with artifacts and review dates, not a promise to receive interviews. Divide it into four weekly loops: repair one evidence blocker, submit a small batch of role-matched applications, practice weak interview domains, conduct respectful outreach, and review responses. Track `applications`, `interviews`, `I/A`, rejection or silence categories, artifact defects found, drills improved, and next changes. Application-to-interview conversion is market feedback; it cannot identify one résumé change as causal without a controlled comparison.",
        "Begin applying when the role’s core software and robotics claims are honest, at least two relevant projects are runnable or inspectable, safety boundaries are responsible, and the learner can explain and debug the work under follow-up. Learning does not need to be finished. Software-bridge roles can coexist with continued specialization, while a blocking gap changes the role or claim rather than requiring a permanent delay. At day thirty, continue, revise, or narrow using recorded evidence—not a target percentage rewritten after the outcome.",
      ],
      keyTerms: [
        {
          term: "Readiness gate",
          meaning:
            "A predeclared capability and evidence condition that must pass before making a role-specific claim or advancing an application decision.",
          physicalExample:
            "A runnable-project gate requires clean setup, one nominal case, one failure case, retained output, and explicit simulator or hardware scope.",
        },
        {
          term: "Blocker",
          meaning:
            "A missing mandatory condition that cannot be averaged away by strengths elsewhere and must change the claim, target, or next action.",
          physicalExample:
            "No safe command-expiry behavior blocks a teleoperation claim even when the interface is polished and all unit tests pass.",
        },
        {
          term: "Retrospective",
          meaning:
            "A factual review of outcomes, bottlenecks, decisions, evidence quality, and process changes after a bounded period of work.",
          physicalExample:
            "The review finds that projects run only on the author’s laptop because dependency versions and simulator assets were never pinned.",
        },
        {
          term: "Specialization",
          meaning:
            "One deliberately chosen target direction supported by current evidence, personal fit, observed demand, and an affordable plan for its core gaps.",
          physicalExample:
            "Strong operator UI and stale-state tests support an HMI focus while C++ AMR reliability remains a later evidence lane.",
        },
        {
          term: "Application sprint",
          meaning:
            "A fixed-duration sequence of targeted applications, evidence repairs, interview drills, outreach, and reviews with named owners and dates.",
          physicalExample:
            "Week two schedules five matrix-backed applications, two debugging retests, one README repair, and a Friday evidence review.",
        },
        {
          term: "Conversion rate",
          meaning:
            "A descriptive ratio such as interviews divided by submitted targeted applications, reported with counts and period rather than treated as causal proof.",
          physicalExample:
            "Four interviews from twenty-five applications gives `I/A = 4/25 = 16%` for that batch, role mix, and time window.",
        },
      ],
      physicalExamples: [
        {
          title: "High aggregate score with a mandatory red gate",
          scenario:
            "A candidate scores 23 of 30 points across ten capability areas but has `0` for explaining and testing command expiry in a role centered on remote robot control.",
          lookFor:
            "Report `23/30 = 76.7%` and the blocker together. Repair the expiry evidence or target a role whose core claim does not depend on that missing capability.",
        },
        {
          title: "Reproduction review on a clean machine",
          scenario:
            "Another engineer follows the strongest project README and reaches the acceptance command, but a missing simulator asset prevents the nominal scenario from starting.",
          lookFor:
            "Classify the runnable-project gate as failed, capture the exact dependency gap, repair and pin the asset, then repeat from clean state before changing the portfolio label.",
        },
      ],
      workedExample: {
        title: "Turn a readiness audit into one defensible 30-day decision",
        setup:
          "A hypothetical candidate targeting Robot Fleet Backend / Platform Engineer has twenty mandatory checks. Eighteen pass; clean installation and a deterministic disconnect-recovery case fail. Twenty-five targeted applications and four interviews are the proposed batch goal, not a guaranteed outcome.",
        steps: [
          "Record `18/20 = 90%` passed gates, then keep both failed gates visible; do not describe the candidate as ninety-percent ready when either missing gate blocks the strongest project claim.",
          "Classify clean installation as a portfolio blocker because reviewers cannot reproduce the project, and disconnect recovery as a core-role blocker because intermittent networks are central to fleet-platform reasoning.",
          "Trace the installation failure to an unpinned service dependency and the recovery failure to a queue item that survives reconnect without freshness validation; define one acceptance test for each.",
          "Choose Robot Fleet Backend / Platform Engineer for this hypothetical case because its verified service, mission-identity, observability, and retry evidence is stronger than its current direct ROS 2 or policy evidence; a different evidence inventory must produce its own comparison.",
          "Schedule days 1–7 for the two blocker repairs and clean reproduction, days 8–14 for five matrix-backed applications and four weak-domain retests, days 15–21 for a second application batch, outreach, and contribution review, and days 22–30 for interviews, feedback, and one portfolio revision.",
          "Track actual `I/A` with counts; if the batch produces four interviews from twenty-five applications, report `4/25 = 16%` without assigning the change to one résumé element.",
          "On day thirty, retain the specialization if evidence and response quality support it, revise the matrix or portfolio if recurring feedback identifies a repairable mismatch, or narrow the target if a core gap remains too large.",
        ],
        result:
          "The candidate has a role-specific go condition, two named blockers, acceptance tests, a dated repair and application cadence, and a feedback rule that does not depend on promised market outcomes.",
        takeaway:
          "A readiness score helps order work; mandatory gates and reproducible artifacts decide which claim can responsibly enter the market now.",
      },
      handsOn: {
        setup:
          "Use the portfolio, claim ledger, case study, résumé matrix, drill scores, contribution state, and a second reviewer. Keep all company and application data private unless publication is explicitly permitted.",
        steps: [
          "Select one exact primary target role and define twenty mandatory gates across role fit, fundamentals, direct evidence, transfer evidence, reproducibility, failures, safety, communication, and interview performance.",
          "Score every gate `0–3`, attach the supporting artifact and scope, identify Boolean blockers, and ask the reviewer to challenge at least five ratings from the evidence rather than confidence.",
          "Run the two strongest project setup paths from clean state, reproduce one nominal and one failure case each, test all public links, and downgrade any gate whose artifact does not survive review.",
          "Write the retrospective as `expected | observed | evidence | bottleneck | keep | stop | change`, then name the strongest transfer, strongest direct robotics proof, most repeated failure, and largest unowned gap.",
          "Compare all six target roles using the existing market map, choose one specialization and one secondary option, and record why current evidence supports them and what would be required before choosing a more specialized target.",
          "Schedule thirty days with dates for blocker repair, four small application batches, domain-specific interview retests, reviewed outreach, contribution follow-up, and weekly matrix and portfolio reviews.",
          "Define day-thirty decisions using actual artifact gates, application counts, interview counts, domain-score movement, recurring feedback, and contribution state; preserve results even when targets are missed.",
        ],
        observe:
          "Independent reproduction and evidence-linked scoring usually change the initial self-assessment: attractive projects lose points for hidden setup assumptions, while disciplined failure reports gain relevance across several roles.",
        doneWhen:
          "The primary role is evidence-supported, no mandatory blocker is hidden by an average, two projects survive clean review, the retrospective produces concrete process changes, and every day of the first sprint week has a scheduled artifact or market action.",
      },
      jobConnection: {
        roles: [
          ROLE_HMI,
          ROLE_FLEET,
          ROLE_VALIDATION,
          ROLE_INTEGRATION,
          ROLE_SOFTWARE,
          ROLE_PHYSICAL_AI,
        ],
        workExample:
          "The final audit prevents one generic “robotics” claim from obscuring different gates: Robot HMI / Control & Monitoring Engineer needs operator-state and command-safety proof; Robot Fleet Backend / Platform Engineer needs mission and intermittent-network proof; Robotics Deployment, Integration & Validation Engineer needs risk-linked acceptance and incident proof; Robotics Application / ROS 2 Integration Engineer needs real integration contracts; Robotics Software Engineer — ROS 2 / AMR needs robotics-native runtime and behavior evidence; Robot Learning Deployment / Physical AI Integration Engineer needs dataset, evaluation, guardrail, and rollout evidence.",
        interviewPrompt:
          "Defend your readiness for one exact target role. Which two artifacts are independently runnable, which claims are direct robotics evidence versus transfer from prior work, which mandatory gate is weakest, what safety and operating boundaries remain, why did you choose this specialization, and what observable decision will your first thirty-day sprint produce if applications or interviews underperform?",
      },
      commonMistakes: [
        {
          mistake: "Averaging a mandatory safety or runnable-project failure into a high readiness percentage.",
          correction:
            "Report the aggregate for context, but keep mandatory gates Boolean and block or narrow the affected claim until the exact evidence condition passes.",
        },
        {
          mistake: "Choosing the most prestigious specialization despite weaker direct evidence.",
          correction:
            "Choose from verified fit, market observations, enjoyable work, core-gap cost, and inspectable projects; keep more specialized roles as dated evidence plans rather than identity claims.",
        },
        {
          mistake: "Treating application count or interview conversion as proof that the portfolio change caused the response.",
          correction:
            "Report counts, role mix, time window, and recurring qualitative feedback, then use the signal to form a testable revision without inventing causality.",
        },
      ],
      checkQuestions: [
        {
          question: "What should happen when the audit scores `23/30` but a mandatory safety gate is zero?",
          answer:
            "The affected role claim remains blocked or must be narrowed. The aggregate score is descriptive and cannot replace evidence for a mandatory gate.",
        },
        {
          question: "Why should a learner compare bridge roles with more specialized targets?",
          answer:
            "The comparison reveals which requirements are supported by verified prior evidence and which require additional direct ROS 2, C++, mathematics, AMR, HIL or real-robot, hardware-integration, dataset, or policy evidence.",
        },
        {
          question: "What does `I/A = 4/25 = 16%` establish?",
          answer:
            "It describes four interviews from twenty-five applications in the stated batch. It does not prove one résumé, portfolio, outreach, company, or market factor caused the result.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The evidence-linked readiness board, blocker states, dated sprint, and independent reproduction record are already the decision instruments; a generic readiness graphic would add no auditable relationship.",
      },
    },
  ],
} satisfies ChapterContent;
