# Robotics Learning Demand and Learner Pain Points

Research snapshot: 2026-07-24

Product: Robot/Shift

Status: Product-research reference, not a live market dashboard

## Purpose

Use this document when changing Robot/Shift's curriculum, learning flow, tutor,
hardware guidance, career guidance, or product features. It records what was
verified about robotics-learning demand, where learners get stuck, and which
product responses are justified by the evidence.

Before repeating any count externally, reopen the linked source and update the
snapshot date. Course enrollment, community, search, job, and market figures
change over time.

## Executive decision

**Decision: continue building and validating Robot/Shift.**

The evidence supports a meaningful global audience:

- youth robotics participation is already on the order of one million annual
  participation or reach records across major programs;
- individual adult-learning courses have attracted tens to hundreds of
  thousands of cumulative enrollments;
- ROS 2 ecosystem activity is large and growing;
- employer automation expectations and robot deployments provide durable
  industry pull;
- public learner discussions repeatedly expose problems that a sequenced,
  practical, version-aware curriculum can solve.

The evidence does **not** establish:

- one exact count of unique people who currently want to learn robotics;
- annual active adult learner volume;
- course completion, skill attainment, or willingness to pay;
- a defensible global or India revenue forecast.

The central product finding is:

> Interest is not the main bottleneck. Learners struggle to convert interest
> into safely sequenced, version-compatible, affordable, working projects.

The commercial conclusion is narrower:

> **Conditional go.** Validate a bounded, outcome-based offer for experienced
> software engineers moving into robotics. Do not assume that curriculum,
> simulators, or an AI tutor alone form a commercial moat.

## Quantifying demand honestly

There is no credible global census of "people who want to learn robotics."
Available sources count different things: participants, students reached,
teams, enrollments, accounts, IP addresses, questions, searches, or adjacent
STEM exposure. These populations overlap and must not be added into a unique
learner total.

The defensible wording is:

> Robotics learning has million-scale annual youth participation or reach
> signals and six-figure cumulative adult self-learning signals. The global
> unique active learner count is unknown.

### Direct demand and ecosystem signals

| Signal                                                                                      |                                                              Observed figure | Time basis                    | What it establishes                                                     | Limitation                                                             |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------: | ----------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [FIRST](https://www.firstinspires.org/about/annual-report)                                  |                  853,000+ youth participants; about 9% year-over-year growth | FY2025                        | Large annual youth robotics participation                               | Organization-reported; cross-program deduplication is not specified    |
| [World Robot Olympiad](https://wro-association.org/about-wro/annual-report-2025/)           |             175,000+ students, 32,100 teams, 31% team growth, 100+ countries | 2025                          | Global youth demand and growth                                          | Reach is not necessarily unique competition participation              |
| [WRO Learn](https://wro-association.org/about-wro/annual-report-2025/)                      |                                                  5,000+ learners in year one | 2025                          | Demand for free robotics learning beyond competitions                   | Early platform figure                                                  |
| [WRO RoboStarter](https://wro-association.org/about-wro/annual-report-2025/)                |                                            15,412 students across 283 events | 2025                          | Demand where access barriers are actively lowered                       | May overlap WRO's total reach                                          |
| [VEX IQ](https://www.vexrobotics.com/competition)                                           |                                       More than 17,000 teams in 54 countries | Current page on snapshot date | Large organized school-age participation                                | Teams, not learners                                                    |
| [VEX V5](https://www.vexrobotics.com/competition)                                           |                                       More than 14,000 teams in 53 countries | Current page on snapshot date | Large secondary-school participation                                    | Teams, not learners; possible cross-program overlap                    |
| [Coursera: Robótica](https://www.coursera.org/learn/robotica-inicial)                       |                                                          271,924 enrollments | Cumulative page counter       | A single beginner, project-based course can attract six-figure interest | Enrollment is not completion, payment, active use, or a unique learner |
| [Coursera: Modern Robotics Course 1](https://www.coursera.org/learn/modernrobotics-course1) |                                                           89,181 enrollments | Cumulative page counter       | Substantial demand also exists for rigorous mathematical robotics       | Same enrollment limitation                                             |
| [Modern Robotics specialization](https://www.coursera.org/specializations/modernrobotics)   |                                                           48,051 enrollments | Cumulative page counter       | Multi-course advanced pathway demand                                    | Overlaps its component courses                                         |
| [ROS 2025 Metrics](https://discourse.openrobotics.org/t/2025-ros-metrics-report/52575)      | 1,315,867 package-server unique IPs in October 2025, up 55.9% year over year | October 2025                  | Large and growing practitioner ecosystem                                | IPs include people, shared networks, CI, mirrors, and automation       |
| [Robotics Stack Exchange API](https://api.stackexchange.com/2.3/info?site=robotics)         |                            43,597 accounts, 47,030 questions, 55,417 answers | 2026-07-24 API snapshot       | Long-lived technical-help demand                                        | Accounts are not necessarily active learners                           |

FIRST and WRO together report **1.028 million annual participation or reach
records**. That is a useful order-of-magnitude signal, but it is not proof of
1.028 million unique learners.

### Additional adult course signals

Seven current Coursera listings reviewed on the snapshot date displayed
376,060 cumulative enrollments in total:

| Course                                                                                                                                | Displayed enrollments |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------: |
| [Robótica](https://www.coursera.org/learn/robotica-inicial)                                                                           |               271,924 |
| [Modern Robotics specialization](https://www.coursera.org/specializations/modernrobotics)                                             |                48,051 |
| [How to Get Into Robotics](https://www.coursera.org/learn/how-to-get-into-robotics)                                                   |                 5,599 |
| [Robotics (1)](https://www.coursera.org/learn/robotics1)                                                                              |                14,974 |
| [Basic Robotic Behaviors and Odometry](https://www.coursera.org/learn/basic-robotic-behaviors-and-odometry)                           |                10,509 |
| [Fundamentals of Robotics and Industrial Automation](https://www.coursera.org/learn/fundamentals-of-robotics--industrial-automation/) |                18,790 |
| [Siemens: Basics of Robotics](https://www.coursera.org/learn/siemens-robotics-course)                                                 |                 6,213 |

The 376,060 figure is a sum of displayed course counters, **not unique
learners**. A learner can enroll in several courses. It is useful only as a
platform-level interest signal.

Two practical ROS Udemy courses showed additional cumulative demand:

- [ROS Essentials](https://www.udemy.com/course/ros-essentials/): 26,633
  students;
- [ROS 2 for Beginners](https://www.udemy.com/course/ros2-for-beginners/):
  27,404 students.

Do not add Udemy and Coursera counters into a market size.

## India-specific signals

| Signal                                                                              |                                                               Observed figure | Interpretation                                                          | Limitation                                                                              |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------: | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Atal Tinkering Labs](https://aim.gov.in/atl.php/primeprogram.php)                  |                        1.1 crore students actively engaged across 10,000 labs | Very broad hands-on technology exposure and distribution                | Robotics is only one ATL technology alongside electronics, IoT, 3D printing, and others |
| [NPTEL Industrial Robotics](https://onlinecourses.nptel.ac.in/noc25_me161/preview)  |                                                                3,055 learners | Direct India robotics-course interest                                   | One course run; enrollment is not completion                                            |
| [NPTEL Experimental Robotics](https://onlinecourses.nptel.ac.in/noc24_ge31/preview) |                                     2,931 enrollments; 491 exam registrations | Measurable progression from free interest to a higher-commitment action | The 16.8% ratio is not commercial conversion                                            |
| [NPTEL Cognitive Robotics](https://onlinecourses.nptel.ac.in/noc25_me126/preview)   |                                                                1,301 learners | Direct advanced-topic interest                                          | One course run                                                                          |
| [IFR World Robotics 2025](https://ifr.org/worldrobotics/report-2025)                | 9,100 industrial robots installed in India in 2024, up 7%; India ranked sixth | Growing local industry pull                                             | Robot installations are not learner demand                                              |

### India planning sensitivity, not measured demand

India has approximately:

- [1.02 crore STEM higher-education students](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2282525&lang=2&reg=48);
- [about 60 lakh IT/ITeS professionals](https://www.meity.gov.in/ministry/our-groups/details/software-industry-promotion-gN1EDOtQWa).

Before overlap, these imply a broad technical audience on the order of
10-16 million people. Applying an explicit hypothetical annual robotics-start
rate gives:

| Planning population                                                                                                                                                                          | Assumed annual start rate |                    Sensitivity result |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------: | ------------------------------------: |
| India professionals only, approximately 6 million                                                                                                                                            |                  0.25%-1% |       15,000-60,000 starters per year |
| India broad technical pool, approximately 10-16 million                                                                                                                                      |                  0.25%-1% |      25,000-160,000 starters per year |
| Global software-adjacent ceiling using [180M+ GitHub accounts](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) |                  0.25%-1% | 450,000-1.8 million starters per year |

These are **sensitivity scenarios**, not published market estimates. Never quote
them as measured demand. Replace the assumed start rate with Robot/Shift's own
observed funnel before using the scenarios for planning.

## Industry pull

Learning demand is supported by sustained industry adoption:

- the [World Economic Forum Future of Jobs 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/)
  surveyed more than 1,000 employers representing more than 14 million workers;
  58% expected robotics and automation to transform their business by 2030;
- the [International Federation of Robotics](https://ifr.org/worldrobotics/report-2025)
  reported 542,000 industrial robots installed in 2024, more than double the
  annual number ten years earlier;
- the [US Bureau of Labor Statistics](https://www.bls.gov/ooh/architecture-and-engineering/mechanical-engineers.htm)
  projects 9% growth and about 18,100 annual openings for mechanical engineers
  from 2024 to 2034, but this occupation is broader than robotics.

These figures explain the tailwind. They are not learner counts and do not prove
that a particular course will convert commercially.

## Paid alternatives and competitive pressure

Current offers show that learners pay for several different forms of robotics
education. They do not establish willingness to pay for Robot/Shift.

| Offer                                                                                                                                        | Current published signal                                        | What the buyer receives                                                                                                                   | Interpretation                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [The Construct](https://www.theconstruct.ai/pricing/)                                                                                        | €39.97 per learner per month or €439 per year                   | ROS courses, learning paths, certificates, cloud project storage, a TurtleBot3 lab, and forum access                                      | A mature self-serve ROS subscription exists                                                     |
| [IIT Delhi Executive Programme in Autonomous Robotics](https://cepqip.iitd.ac.in/post/program/executive-programme-in-autonomous-robotics-AI) | ₹1,60,000 plus 18% GST for a September 2026-July 2027 programme | Instructor-led online study and a capstone for professionals with at least one year of experience                                         | A premium India professional segment exists, but this is not a direct substitute for self-study |
| [RosForge](https://rosforge.com/)                                                                                                            | 390 TND for a six-week June 2026 cohort capped at 10 learners   | Weekly instruction, private group support, and a portfolio-ready autonomous-robot project                                                 | A small, bounded, mentored ROS 2 cohort is a credible comparable format                         |
| [R2BOT](https://www.r2bot.in/)                                                                                                               | Free entry surfaces; paid conversion not verified               | Vendor-reported bilingual tracks, AI mentor, browser simulators, ROS 2 playground, guided projects, career paths, community, and showcase | Robot/Shift cannot treat curriculum, simulation, projects, or AI assistance as unique features  |

The stronger differentiation hypothesis is a specific audience and operating
model: **working software engineers transitioning into robotics without
returning to university, supported by human evidence review, recovery after
missed work, and outcomes that can be inspected rather than merely checked
off**. Competitor feature and quality claims are vendor-reported and were not
independently tested.

General online-learning evidence reinforces the need for this operating model.
In a randomized MOOC certificate programme with about
[21,000 applicants and 13,000 selected participants](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4643591),
roughly half enrolled but only 6.2% of eligible participants completed even
when certificates were free. This is not robotics-specific evidence; it shows
that access and certificates alone do not reliably create persistence.

## ROS ecosystem momentum

The official [2025 ROS Metrics Report](https://discourse.openrobotics.org/t/2025-ros-metrics-report/52575)
reported:

- 984,135,185 package downloads in 2025, up 85.2% despite missing July data;
- 1,315,867 unique package-server IPs in October 2025, up 55.9%;
- ROS 2 at 91.2% of package downloads;
- 34,614 unique packages available through Apt, up 9.2%;
- 3,848 public repositories tagged `ROS2`, up 39%;
- 11.2% more ROS 2 GitHub contributors and 37.6% more pull requests;
- 1,579 known companies using ROS, up 26%;
- ROS Discourse topics up 40%, posts up 24%, and viewership up about 30%.

Open Robotics explicitly treats these as relative ecosystem estimates because
it does not track individual users. Package downloads and unique IPs must never
be relabeled as learners.

## Search-interest analysis

Google Trends was inspected in a shared five-year comparison for `learn
robotics`, `robotics course`, and `ROS 2`.

### Worldwide

| Term              | Earliest 52-week mean | Latest 52-week mean | Latest / earliest |
| ----------------- | --------------------: | ------------------: | ----------------: |
| `learn robotics`  |                  1.02 |                5.15 |             5.05x |
| `robotics course` |                  2.10 |               15.29 |             7.28x |
| `ROS 2`           |                  4.15 |               49.44 |            11.91x |

[Open worldwide comparison](https://trends.google.com/trends/explore?date=today%205-y&q=learn%20robotics,robotics%20course,ROS%202)

### India

| Term              | Earliest 52-week mean | Latest 52-week mean | Latest / earliest |
| ----------------- | --------------------: | ------------------: | ----------------: |
| `learn robotics`  |                  2.69 |               11.69 |             4.35x |
| `robotics course` |                 28.38 |               58.67 |             2.07x |
| `ROS 2`           |                  1.10 |               52.13 |            47.39x |

[Open India comparison](https://trends.google.com/trends/explore?date=today%205-y&geo=IN&q=learn%20robotics,robotics%20course,ROS%202)

Interpretation:

- all six comparisons point upward;
- ROS 2 awareness and adoption appear particularly strong;
- a conspicuous structural jump around July-August 2025 makes the exact growth
  multiples low-confidence;
- Google Trends is sampled and normalized from 0-100; it is neither search
  volume nor a people count;
- worldwide and India queries are independently normalized and cannot be
  compared as absolute volumes.

Use the direction only. Review
[Google's methodology](https://support.google.com/trends/answer/4365533?hl=en)
before refreshing this analysis.

## Public-forum study

### Method

- Sample: 31 unique public threads.
- Date range: 2022-07-03 through 2026-07-06.
- Communities:
  - Reddit: 14 threads;
  - Robotics Stack Exchange: 7;
  - ROS Discourse: 4;
  - Arduino Forum: 6.
- Search concepts: beginner, start, learning path, tutorial, confused, stuck,
  overwhelmed, hardware.
- Included: self-described learners or students and beginner-specific teaching
  discussions.
- Excluded: advertisements, course promotions, showcases, generic technical
  support without explicit learner context, and duplicates.
- Coding: manual, single-coder, multi-label classification.

Direct Reddit browsing was blocked by Reddit during part of the research.
Public search-indexed Reddit threads were used instead. Deleted, private, and
unindexed posts are absent.

### Coded pain points

| Pain point                                                                     | Threads | Share of 31-thread sample | Product response                                                          |
| ------------------------------------------------------------------------------ | ------: | ------------------------: | ------------------------------------------------------------------------- |
| No clear roadmap, sequencing, or breadth control                               |      19 |                     61.3% | Show the path, prerequisites, purpose, exit evidence, and next dependency |
| Prerequisite gaps in coding, electronics, maths, physics, Linux, or networking |      19 |                     61.3% | Add just-in-time zero-prerequisite bridges                                |
| Theory-to-practice or project-progression gap                                  |      17 |                     54.8% | Use a graduated build-test-debug project ladder                           |
| Tutorial or documentation overload, staleness, or skipped basics               |      14 |                     45.2% | Curate authoritative material and track version/freshness                 |
| OS, ROS distro, Gazebo, dependency, or toolchain setup friction                |       8 |                     25.8% | Pin verified environments and provide recovery diagnostics                |
| Integration, debugging, real-world, or safety friction                         |       8 |                     25.8% | Teach diagnostics, physical failure states, and safety gates              |
| Hardware cost, access, or platform choice                                      |       7 |                     22.6% | Provide simulation-first and region-aware low-cost paths                  |
| Unrealistic scope or timeline                                                  |       6 |                     19.4% | Decompose projects and state credible effort/exit criteria                |
| Missing mentorship, community, or local courses                                |       5 |                     16.1% | Add bounded tutor/mentor feedback and optional peer support               |

Percentages describe this deliberately pain-seeking sample, not all robotics
learners. Categories are multi-label, so shares sum above 100%.

### Representative learner discussions

| Community and date                   | Learner signal                                                                                                       | Thread                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reddit `r/robotics`, 2024-05-26      | Limited budget, no local robotics community, difficult maths, and unclear resource order                             | [Where to start learning robotics](https://www.reddit.com/r/robotics/comments/1d12jia/where_to_start_learning_robotics/)                                            |
| Reddit `r/ROS`, 2026-02-07           | Confusion over distro, Python versus C++, Linux/networking prerequisites, projects, Gazebo, and RViz order           | [Beginner looking for guidance](https://www.reddit.com/r/ROS/comments/1qyc814/beginner_in_robotics_looking_for_guidance_to/)                                        |
| Reddit `r/Learnrobotics`, 2026-05-12 | Computing graduate still unsure which components and projects fit a low budget                                       | [Where should I start](https://www.reddit.com/r/Learnrobotics/comments/1tavoet/im_new_to_robotics_where_should_i_start/)                                            |
| Reddit `r/AskRobotics`, 2026-02-26   | AI engineer lacks local courses and has never completed a hardware project                                           | [Where to start learning robotics](https://www.reddit.com/r/AskRobotics/comments/1rfjkxb/where_to_start_learning_robotics/)                                         |
| Robotics Stack Exchange, 2026-04-12  | No ROS or hardware experience, two-month thesis, and outdated-version conflict                                       | [Porting LIMO Pro to current ROS 2 and Gazebo](https://robotics.stackexchange.com/questions/118287/porting-agilex-limo-pro-to-ros-2-jazzy-harmonic-for-my-thesis)   |
| Robotics Stack Exchange, 2025-01-14  | Official beginner ROS 2 Jazzy tutorial fails on both Ubuntu and Docker                                               | [Jazzy beginner tutorial build failure](https://robotics.stackexchange.com/questions/114285/ros2-jazzy-beginner-tutorial-fails-to-build-on-ubuntu-24-04-and-docker) |
| Robotics Stack Exchange, 2026-06-23  | School learner constrained by INR 10k-12k and no printer/CNC needs waterproofing, stability, and safety help         | [DIY underwater research ROV](https://robotics.stackexchange.com/questions/118472/diy-underwater-research-rov-project-looking-for-design-advice-and-feedback)       |
| ROS Discourse, 2025-04-01            | Long discussion argues that onboarding complexity drives students away and copied launch files hide fundamentals     | [ROS 2 tutorial entrance-level complexity](https://discourse.ros.org/t/ros-2-tutorials-upgrade-entrance-level-complexity/42926)                                     |
| ROS Discourse, 2025-09-29            | Maintained bindings, price, and already-outdated tutorials complicate choosing a first physical robot                | [Best physical robot for ROS 2 beginners](https://discourse.ros.org/t/best-physical-robot-for-ros2-beginners/50331)                                                 |
| ROS Discourse, 2026-06-22            | Developing-region engineer reports limited ROS 2 exposure, few practitioners, and no clear entry path                | [Starting a ROS 2 community in an underserved region](https://discourse.ros.org/t/looking-for-advice-on-starting-a-ros2-community-in-an-underserved-region/55624)   |
| Arduino Forum, 2024-08-04            | High-school beginner proposes an advanced rover in one to two months; replies expose multi-year prerequisite breadth | [Rover from absolute scratch](https://forum.arduino.cc/t/tips-for-making-a-rover-that-collects-and-analyzes-soil-starting-from-absolute-scratch/1288319)            |
| Arduino Forum, 2026-01-15            | Robot-arm wiring exposes component sourcing plus battery and fire-safety gaps                                        | [Beginner robot-arm wiring questions](https://forum.arduino.cc/t/robot-arm-wiring-diagram-questions-from-a-beginner/1425448)                                        |

## Learner jobs to be done

The evidence suggests that a learner hires Robot/Shift to:

1. tell them what to learn now and what can safely wait;
2. bridge their existing software knowledge into maths, electronics, mechanics,
   control, Linux, and ROS without assuming a robotics degree;
3. produce a working artifact instead of accumulating disconnected tutorials;
4. recover from setup, dependency, version, integration, and hardware failures;
5. avoid wasting money or damaging components;
6. judge whether a result is correct using logs, plots, measurements, tests, and
   physical evidence;
7. build a credible portfolio and understand which robotics roles it supports;
8. obtain feedback when they are stuck without surrendering the thinking to an
   answer-generating tutor.

## Product requirements derived from the research

### P0: Preserve and strengthen

#### 1. Visible sequence and dependency context

Every lesson should make these answers obvious:

- Why am I learning this now?
- What prior concepts does it depend on?
- What can I ignore for now?
- What will I build or diagnose?
- What evidence proves completion?
- What does this unlock next?

The 180-day sequence is a primary differentiator. Do not replace it with a
resource directory, open-ended dashboard, or unordered topic library.

#### 2. Just-in-time prerequisite rescue

Introduce mathematics, electronics, mechanics, Linux, networking, Python, C++,
and ROS concepts at their first real use. Begin with the physical picture,
define symbols and units, show one complete worked example, then use the concept
in a task.

Do not create a large detached "learn all maths first" gate.

#### 3. Graduated project ladder

Use a progression such as:

1. deterministic browser model;
2. small Python or C++ calculation;
3. simulator exercise;
4. integrated ROS 2 behavior;
5. low-risk physical subsystem;
6. complete robot behavior;
7. repeatable validation and portfolio evidence.

Each step needs expected output, common failure modes, diagnostic commands or
observations, safety limits, and an evidence requirement.

#### 4. Version-pinned setup paths

Setup lessons should state:

- supported OS and version;
- ROS 2 distribution;
- simulator and package versions;
- tested installation path;
- last verified date;
- known incompatible combinations;
- recovery steps that distinguish environment, dependency, code, and runtime
  failures.

Version pinning introduces a staleness risk. Pair it with a documented refresh
cadence and executable smoke checks where practical.

#### 5. Simulation-first, budget-aware hardware

Learners must be able to reach a credible first artifact without buying
hardware. When hardware becomes necessary, provide:

- India-aware price and availability dates;
- minimum viable parts;
- safe substitutes;
- "do not buy yet" guidance;
- power, battery, current, heat, mechanical, and emergency-stop warnings;
- explicit boundaries between simulated success and physical proof.

Prices and availability are drift-prone. Date and source every recommendation.

#### 6. Debugging and safety as curriculum

Do not treat debugging and safety as appendices. Each practical task should
cover:

- expected happy-path evidence;
- one or more realistic failure states;
- observation before intervention;
- logs, graphs, measurements, or UI/runtime evidence;
- bounded commands and stop conditions;
- physical hazards and human review where applicable.

### P1: High-value improvements

#### 7. Tutor as a diagnostic coach

The tutor should:

- ask for the learner's evidence and current mental model;
- remain grounded in the displayed lesson and approved sources;
- explain one missing prerequisite at a time;
- help classify failures before proposing changes;
- avoid raw hardware commands without limits, emergency stop, and human review;
- preserve sanitized Markdown and strict KaTeX rendering.

Measure whether the tutor resolves a blockage and whether the learner can
explain the fix. Do not optimize only for message count.

#### 8. Content freshness and provenance

For environment-sensitive material, expose:

- authoritative source;
- Robot/Shift synthesis;
- supported version;
- last verified date;
- known drift risk;
- replacement or migration note.

Do not copy protected chapters, videos, transcripts, or diagrams into the
course. Link and synthesize.

#### 9. Scope and effort control

Prevent "build an autonomous rover in two weeks" failure by showing:

- estimated effort range;
- prerequisite checklist;
- subsystem decomposition;
- smallest credible milestone;
- defer/continue decision points;
- completion criteria.

#### 10. Portfolio and career mapping

Connect each project to:

- demonstrated capabilities;
- validation evidence;
- likely interview questions;
- India-relevant role families;
- missing capabilities that the project does not prove.

Never imply that completing a lesson proves production or physical competence
without corresponding evidence.

#### 11. Optional mentorship and community

The forum sample shows mentorship scarcity, but community features add
moderation, privacy, safety, and operational cost. Validate a bounded
mentor-review or cohort experiment before building a permanent social surface.

#### 12. Recovery and accountability

A paid pilot should test an operating system for completion, not merely expose
more content:

- diagnose career goal, prerequisite gaps, available weekly time, and hardware
  constraints before the first assignment;
- show one next action instead of making the full 180-day sequence feel like a
  daily obligation;
- require inspectable evidence rather than self-reported checkboxes;
- review one weekly integration milestone with an objective rubric;
- keep an initial cohort small enough for timely human review;
- provide a recovery path after missed work without shame, artificial streak
  loss, or an automatic pass;
- turn final artifacts, failure analysis, and trade-off explanations into an
  interview-ready project narrative.

The cohort-size and review-time limits are business hypotheses. Measure them
before building permanent mentor, community, scheduling, or payment systems.

### P2: Validate before building

- adaptive or personalized curriculum branches;
- paid cohorts;
- peer discussion;
- mentor marketplace;
- hardware kits;
- certificates;
- public portfolio hosting;
- regional-language variants.

Personalization must not skip prerequisites or break the validated 180-day
dependency chain.

## What not to build from this research

- XP, streaks, ranks, badges, or a prominent progress dashboard;
- a giant resource link collection;
- an AI chat surface detached from the current lesson;
- a promise that one hardware kit fits every learner or region;
- automatic hardware execution;
- uncontrolled community features;
- market-size claims created by summing incompatible counters;
- features justified only by search trends or a few loud forum posts.

Robot/Shift should remain reader-first, quiet, evidence-oriented, and focused on
competence rather than engagement theatre.

## Commercial model hypothesis

Do not initially sell the entire 180-day curriculum as one promise. Test one
bounded six-week outcome, such as an experienced developer producing and
defending a working ROS 2 integration artifact. The paid value should be
positioned as structure, human evidence review, accountability, and recovery;
the curriculum can remain the long-term path.

### Do not refund the whole programme fee on completion

An offer that retains the entire fee only when a learner fails creates a direct
incentive conflict:

| Ten learners pay ₹5,000 each            | Amount retained by the business |
| --------------------------------------- | ------------------------------: |
| 50% complete and receive a full refund  |                         ₹25,000 |
| 80% complete and receive a full refund  |                         ₹10,000 |
| 100% complete and receive a full refund |                              ₹0 |

The durable structure to test is:

1. a non-refundable service fee that pays for instruction, review, and support;
2. a separate, optional completion bond returned when pre-published,
   objectively verifiable milestones are met;
3. bond money tracked separately from operating revenue;
4. no rule or rubric changes after payment.

Financial commitment mechanisms already exist in products such as
[Beeminder](https://www.beeminder.com/overview) and
[stickK](https://new.stickk.com/faq/commitment/Commitment%2BContracts), but that
does not validate a robotics completion bond. A ₹3,999 service fee and ₹1,500
bond, as proposed in the supplied analysis, are **unverified experiment
variables**, not recommended prices.

Robot/Shift already has authenticated cloud progress, evidence, and tutor
history. It does not yet have verified payment, entitlement, cohort, mentor,
bond-ledger, refund, grievance, or support-operation flows. Do not build those
systems until a manual pilot proves qualified paid demand and acceptable
support economics.

## Validation plan

Public-source demand validates the problem category. Robot/Shift must validate
its own audience and solution.

### Segment explicitly

Track results separately for:

- experienced software engineers moving into robotics or embodied AI;
- university students;
- hobbyists and makers;
- working engineers adding ROS 2 or automation skills.

Do not average these segments into one misleading learner.

### Funnel metrics

| Stage             | Primary measure                                                   |
| ----------------- | ----------------------------------------------------------------- |
| Interest          | Qualified landing-page or invitation acceptance by segment        |
| Activation        | Starts Day 1 within 24 hours                                      |
| Early value       | Completes Day 7 and produces the required evidence                |
| Practical value   | Completes the first simulator artifact without hidden help        |
| Learning          | Can teach back the concept and diagnose a planned failure         |
| Execution         | Submits a verified project artifact                               |
| Retention         | Day 30 and phase-completion rates                                 |
| Commercial intent | Paid cohort, mentor review, or subscription conversion            |
| Quality           | Broken setup rate, unresolved tutor rate, unsafe instruction rate |

### Highest-value experiments

1. Recruit a small cohort from each candidate segment.
2. Measure Day 1 start, Day 7 completion, first simulator artifact, and first
   evidence submission.
3. Record every setup, prerequisite, content-freshness, cost, and debugging
   blockage.
4. Test one paid offer: mentor review or a structured cohort is more informative
   than a hypothetical willingness-to-pay survey.
5. Compare a simulation-only start with an early-hardware start.
6. Interview drop-offs using their actual lesson and evidence history.

### Commercial pilot gates

Before building payment automation, a permanent community, or a mentor
marketplace:

1. interview at least 15 working developers about actual robotics attempts,
   purchases, abandoned courses, available time, and desired career outcome;
2. publish one landing page for one six-week, evidence-defined outcome;
3. require at least five qualified strangers to pay, rather than relying on
   friends or hypothetical willingness-to-pay answers;
4. run the pilot manually and require:
   - at least 80% to submit the first evidence within 72 hours;
   - at least 60% to remain active in week 4;
   - at least 50% to complete and defend the final project;
   - less than 45 minutes of individual support per active learner per week;
   - at least three learners to request a next sprint or make a qualified
     referral;
   - no unresolved rubric, bond, or refund disputes.

These are proposed go/no-go thresholds, not observed Robot/Shift results.
Missing a threshold should trigger diagnosis and another bounded experiment,
not a claim of product-market fit.

### Feature evidence gate

Before adding a substantial feature, require:

1. repeated learner evidence from more than one source or segment;
2. a clear job to be done;
3. a measurable funnel or learning outcome;
4. compatibility with the reader-first interface and prerequisite sequence;
5. an operational owner for ongoing freshness, safety, moderation, or support;
6. an executable acceptance or QA contract.

## Legal and operational guardrails

Before accepting a fee or bond in India:

- publish exact milestone evidence, deadlines, pause rules, review times,
  rejection and appeal rules, refund timing, grievance contact, and what
  happens if Robot/Shift cancels or cannot provide review;
- obtain Indian accounting and legal review of GST, invoicing, custody, and
  treatment of refundable bond funds;
- use an ordinary payment and refund trail rather than an informal wallet;
- avoid employment, salary, placement, certificate-recognition, or guaranteed
  completion claims;
- avoid coercive interfaces. India's
  [Guidelines for Prevention and Regulation of Dark Patterns, 2023](https://consumeraffairs.nic.in/sites/default/files/The%20Guidelines%20for%20Prevention%20and%20Regulation%20of%20Dark%20Patterns%2C%202023.pdf)
  explicitly identify patterns including confirm shaming and subscription
  traps.

This section is a product-risk checklist, not legal or tax advice.

## Research limitations

- The forum sample was deliberately selected to find pain, so category shares
  are not population prevalence.
- English-language, public, self-selected forum users overrepresent people who
  are stuck.
- ROS and Arduino are overrepresented.
- Successful learners, classrooms, private Discords, and employer training are
  underobserved.
- Search indexing, moderation, deleted posts, and Reddit access limitations
  affect capture.
- Multi-label coding was performed by one reviewer and has judgment error.
- Course counters are cumulative and can overlap.
- Program reach is organization-reported.
- Google Trends is sampled, normalized, and vulnerable to structural changes.
- Industry adoption and job forecasts are tailwinds, not direct learning
  demand.
- Competitor prices and features are a dated snapshot and do not prove their
  learner outcomes, quality, or Robot/Shift conversion.
- The MOOC completion experiment is general online-learning evidence, not a
  robotics completion benchmark.
- None of the public evidence proves Robot/Shift completion, retention, or
  willingness to pay.

## Refresh checklist

Before using this research for a major product or commercial decision:

1. Update the research date.
2. Reopen every cited primary source.
3. Refresh FIRST, WRO, VEX, Coursera, NPTEL, ROS, WEF, IFR, BLS, AIM, AISHE,
   MeitY, and GitHub figures.
4. Re-run worldwide and India Google Trends with the same shared-term query.
5. Add a new time-bounded forum sample instead of silently mixing periods.
6. Preserve the old snapshot for trend comparison.
7. Separate source fact, Robot/Shift synthesis, inference, and recommendation.
8. Replace planning assumptions with Robot/Shift's observed funnel wherever
   available.
9. Recheck The Construct, IIT Delhi, RosForge, and R2BOT pricing and feature
   claims before making a commercial comparison.
10. Revalidate payment, consumer-protection, GST, refund, and bond handling with
    qualified Indian advisers before taking money.
