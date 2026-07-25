import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  curriculumDays,
  phases,
  projects,
  readinessSkills,
} from "../app/curriculum.ts";
import {
  lessonForDay,
  topicDetails,
  weekLessonPacks,
} from "../app/lessons.ts";
import { mathRescueByWeek, validateMathRescues } from "../app/math-rescue.ts";
import { lessonPath } from "../app/seo.ts";
import { topicDetailOverrides } from "../app/topic-detail-overrides.ts";

test("every curriculum day has complete topic-specific teaching content", () => {
  const expectedIds = curriculumDays.map((day) => day.id);
  const detailIds = Object.keys(topicDetails)
    .map(Number)
    .sort((a, b) => a - b);

  assert.equal(curriculumDays.length, 180);
  assert.equal(weekLessonPacks.length, 26);
  assert.deepEqual(detailIds, expectedIds);

  for (const day of curriculumDays) {
    const lesson = lessonForDay(day);
    assert.equal(lesson.dayId, day.id);
    assert.equal(lesson.title, day.title);
    assert.ok(lesson.bigIdea.length > 40, `day ${day.id} needs a useful core explanation`);
    assert.ok(lesson.math.connection?.length > 35, `day ${day.id} needs exact-topic math`);
    assert.ok(lesson.math.connectionMarkdown?.length > 35, `day ${day.id} needs typeset exact-topic math`);
    assert.equal(
      lesson.simpleExplanation.some((paragraph) => paragraph.startsWith("In numbers:")),
      false,
      `day ${day.id} must keep dense equations in the Math tab`,
    );
    assert.match(lesson.math.title, new RegExp(day.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(lesson.pareto.length >= 4, `day ${day.id} needs an 80/20 summary`);
    assert.ok(lesson.examples.length >= 3, `day ${day.id} needs physical examples`);
    assert.ok(lesson.practice.length >= 3, `day ${day.id} needs practical exercises`);
    assert.ok(lesson.quiz.length >= 3, `day ${day.id} needs diagnostic questions`);
    assert.ok(lesson.sources.length >= 1, `day ${day.id} needs sources`);
  }
});

test("the opening foundation assumes no maths and introduces concepts in dependency order", async () => {
  assert.deepEqual(
    curriculumDays.slice(0, 14).map((day) => day.title),
    [
      "Robot anatomy: sense, think, act, links, and actuators",
      "Joints, allowed motion, and degrees of freedom",
      "Configuration, C-space, workspace, limits, and topology",
      "Number lines, coordinates, scalars, variables, and physical units",
      "Vectors from arrows: components, add, subtract, norm, and dot product",
      "Coordinate frames, axes, origins, and handedness",
      "Matrices from grids: inputs, outputs, and simple actions",
      "2D rotation, translation, transforms, degrees, radians, sine, and cosine",
      "Compose and invert transforms through a frame tree",
      "SO(3): safe 3D rotation matrices",
      "Euler angles, quaternions, and representation singularities",
      "SE(3): one 3D pose matrix",
      "Forward kinematics for a serial arm",
      "Jacobian intuition and bounded numerical inverse kinematics",
    ],
  );

  const opening = lessonForDay(curriculumDays[0]);
  const openingText = [
    opening.bigIdea,
    opening.math.meaning,
    opening.math.formula,
    opening.math.connection,
    ...opening.simpleExplanation,
    ...opening.pareto,
    ...opening.math.steps,
    ...opening.examples.flatMap(({ title, explanation, tryIt }) => [title, explanation, tryIt]),
    ...opening.practice.flatMap(({ title, task, doneWhen }) => [title, task, doneWhen]),
    ...opening.quiz.flatMap(({ question, answer }) => [question, answer]),
    opening.teachBack,
  ].join("\n");
  assert.match(openingText, /sensor.*controller.*actuator/i);
  assert.doesNotMatch(
    openingText,
    /\bvector\b|\bmatrix\b|\bC-space\b|\bcoordinate frame\b|\bPythagoras\b|\btrigonometry\b|\bsin\b|\bcos\b|arccos/i,
  );

  assert.match(lessonForDay(curriculumDays[3]).bigIdea, /scalar.*variable.*coordinates.*units/i);
  assert.match(lessonForDay(curriculumDays[4]).bigIdea, /vector.*norm.*dot product/i);
  assert.match(lessonForDay(curriculumDays[6]).bigIdea, /matrix.*input-to-output/i);
  assert.match(lessonForDay(curriculumDays[7]).bigIdea, /pose.*rotation.*translation/i);
  assert.match(lessonForDay(curriculumDays[13]).bigIdea, /Jacobian.*inverse kinematics/i);

  const day2 = lessonForDay(curriculumDays[1]);
  assert.match(`${day2.bigIdea} ${day2.math.connection}`, /independent configuration coordinate/i);
  assert.match(`${day2.bigIdea} ${day2.math.connection}`, /passive joints still count/i);

  const day5 = lessonForDay(curriculumDays[4]);
  assert.match(
    `${day5.math.connection} ${day5.math.connectionMarkdown}`,
    /Pythagoras.*squar.*multiply.*square root/is,
  );

  const day6 = lessonForDay(curriculumDays[5]);
  assert.doesNotMatch(`${day6.math.connection} ${day6.math.connectionMarkdown}`, /cross product|\\times/);

  const day10 = lessonForDay(curriculumDays[9]);
  assert.match(day10.math.connectionMarkdown ?? "", /\\det.*ad-bc.*0\\times0-\(-1\\times1\)=1/is);

  const day12 = lessonForDay(curriculumDays[11]);
  assert.match(
    `${day12.math.connection} ${day12.math.connectionMarkdown}`,
    /point.*w=1.*direction.*w=0.*translation/is,
  );

  for (const day of curriculumDays.slice(0, 14)) {
    const lesson = lessonForDay(day);
    assert.ok(lesson.sources.length <= 3, `day ${day.id} should keep its source list focused`);
    assert.match(day.task, /draw|find|record|build|convert|attach|treat|create|make|compare|measure|estimate/i);
    assert.equal(
      new Set(lesson.examples.map(({ title }) => title)).size,
      lesson.examples.length,
      `day ${day.id} contains duplicate example titles`,
    );
  }

  const studioSource = await readFile(
    new URL("../app/learning-studio.tsx", import.meta.url),
    "utf8",
  );
  const articleSource = await readFile(
    new URL("../app/lesson-article.tsx", import.meta.url),
    "utf8",
  );
  assert.match(studioSource, /loadChapterContent\(day\.week\)/);
  assert.doesNotMatch(
    studioSource,
    /primaryLessonSections|supportLessonSections|lesson-next-step|setSection\(|Optional help|<h2[^>]*>Lesson<\/h2>|lesson\.bigIdea|lesson\.simpleExplanation/,
  );
  assert.doesNotMatch(
    articleSource,
    /EXPLAIN IT LIKE|lesson\.bigIdea|lesson\.simpleExplanation|Answer before revealing|Check your understanding/,
  );
  assert.match(articleSource, /Build the physical picture first/);
  assert.match(articleSource, /Words you need/);
  assert.match(articleSource, /Math, one line at a time/);
  assert.match(articleSource, /Interview questions: \{day\.title\}/);
  assert.match(articleSource, /deepDive\.jobConnection\.interviewPrompt/);
  assert.match(articleSource, /Technical follow-up questions/);
  assert.match(articleSource, /Model interview answer/);
  assert.equal(
    (articleSource.match(/deepDive\.jobConnection\.interviewPrompt/g) ?? []).length,
    1,
    "the chapter-specific interview scenario should appear once",
  );
  assert.equal(
    (articleSource.match(/<LessonMediaPanel/g) ?? []).length,
    2,
    "media should render once for chapter sources and once for exact foundation media",
  );
  assert.match(articleSource, /firstDayOfChapter \? \(/);
  assert.match(articleSource, /hasReviewedFoundationTopicMedia\(day\.id\)/);
  assert.match(articleSource, /sources=\{\[\]\}/);
  assert.ok(
    articleSource.indexOf("Build the physical picture first")
      < articleSource.indexOf("Work through today’s relationship"),
    "the physical explanation must appear before the mathematics",
  );
});

test("the Week 8 and Week 11 spiral keeps every persisted lesson identity", () => {
  const expected = [
    [50, "map→odom→base frames, occupancy grids, SLAM, and AMCL", "/lessons/050-map-odom-base-frames-occupancy-grids-slam-and-amcl/"],
    [51, "Layered costmaps, robot footprint, inflation, and keepout zones", "/lessons/051-layered-costmaps-robot-footprint-inflation-and-keepout-zones/"],
    [52, "Nav2 planners, controllers, smoothers, and goal execution", "/lessons/052-nav2-planners-controllers-smoothers-and-goal-execution/"],
    [53, "Nav2 behavior trees, recovery, and lifecycle management", "/lessons/053-nav2-behavior-trees-recovery-and-lifecycle-management/"],
    [54, "Cancellation, obstruction, collision monitoring, and replanning", "/lessons/054-cancellation-obstruction-collision-monitoring-and-replanning/"],
    [55, "Navigation metrics: success, path, time, localization error, and recovery", "/lessons/055-navigation-metrics-success-path-time-localization-error-and-recovery/"],
    [56, "Mandatory resilient Nav2/SLAM phase demo", "/lessons/056-mandatory-resilient-nav2-slam-phase-demo/"],
    [71, "State, observation, process model, and uncertainty", "/lessons/071-state-observation-process-model-and-uncertainty/"],
    [72, "Probability distributions and covariance intuition", "/lessons/072-probability-distributions-and-covariance-intuition/"],
    [73, "Bayes filters and the predict/update cycle", "/lessons/073-bayes-filters-and-the-predict-update-cycle/"],
    [74, "Kalman/EKF intuition and odometry-IMU fusion", "/lessons/074-kalman-ekf-intuition-and-odometry-imu-fusion/"],
    [75, "Scan matching, occupancy mapping, and localization drift", "/lessons/075-scan-matching-occupancy-mapping-and-localization-drift/"],
    [76, "Pose graphs, loop closure, AMCL, and map→odom correction", "/lessons/076-pose-graphs-loop-closure-amcl-and-map-odom-correction/"],
    [77, "SLAM/localization report with uncertainty and dropout recovery", "/lessons/077-slam-localization-report-with-uncertainty-and-dropout-recovery/"],
  ];

  assert.deepEqual(
    expected.map(([dayId]) => {
      const day = curriculumDays[Number(dayId) - 1];
      return [day.id, day.title, lessonPath(day)];
    }),
    expected,
  );
});

test("the revised 180-day plan includes every mandatory practical robotics lane", () => {
  assert.deepEqual(
    curriculumDays.map((day) => day.id),
    Array.from({ length: 180 }, (_, index) => index + 1),
  );
  assert.equal(new Set(curriculumDays.map((day) => day.title)).size, 180);
  assert.equal(curriculumDays.at(-1)?.id, 180);
  assert.match(curriculumDays.at(-1)?.title ?? "", /readiness audit.*retrospective.*specialization.*30-day sprint/i);

  const completePlan = curriculumDays.map((day) => day.title).join("\n");
  const mandatorySignals = [
    /Linux.*udev.*network/i,
    /real-time scheduling.*priority inversion/i,
    /QoS.*DDS discovery/i,
    /executors.*callback groups.*deadlocks/i,
    /lifecycle nodes.*composition/i,
    /ROS 2 distributions.*Jazzy.*Lyrical LTS/i,
    /ros2_control.*hardware interfaces/i,
    /Gazebo Harmonic/i,
    /SLAM.*AMCL/i,
    /Nav2/i,
    /MoveIt/i,
    /loop closure/i,
    /force-torque.*impedance/i,
    /DAgger.*human-in-the-loop/i,
    /Robot.edge.cloud architecture.*failure boundaries/i,
    /Mission workflows.*task allocation.*traffic.*deadlocks.*docking.*battery/i,
    /REST.*WebSocket.*DDS gateways.*idempotency.*cancellation/i,
    /PostgreSQL.*Redis.*Kafka.*ordering.*backpressure/i,
    /operator HMI.*teleoperation.*WebSocket.*WebRTC.*3D state/i,
    /versioned configuration.*OTA canaries.*rollback/i,
    /Fleet acceptance.*logs.*metrics.*traces.*fault injection.*SLOs/i,
    /FMEA.*traceability.*test planning/i,
    /pytest.*gtest.*launch_testing.*component-to-system regression/i,
    /Gazebo.*Isaac.*scenario matrices.*seeds.*replay/i,
    /SIL.*HIL.*sensor emulators.*time faults.*communication faults/i,
    /VDA 5050 v3.*Open-RMF.*WMS\/WES.*industrial boundaries/i,
    /ISO 3691-4.*ISO 13849.*E-stop.*STO.*zones/i,
    /FAT.*SAT.*customer commissioning.*incident reporting.*FleetOps gate/i,
    /LeRobot 0\.6.*GR00T 1\.7.*Gemini Robotics ER 1\.6.*π0\.5.*OpenVLA.*SmolVLA/i,
    /threat modeling.*SROS2/i,
    /safety case/i,
    /actuator sizing.*motors.*power/i,
    /edge deployment.*thermals/i,
    /differential-drive kinematics.*wheel odometry/i,
    /MCU firmware.*RTOS.*device manifests/i,
    /CAN.*UART.*I²C.*SPI/i,
    /Flutter\/Web teleoperation.*dead-man control.*latency/i,
    /ONNX.*TensorRT/i,
    /Jetson-class hardware/i,
    /SIL.*HIL/i,
    /fleet telemetry.*OTA/i,
    /target-company matrix/i,
    /warm outreach.*open-source/i,
  ];
  for (const signal of mandatorySignals) {
    assert.match(completePlan, signal);
  }
});

test("the specialization culminates in an evidence-backed FleetOps gate", () => {
  const productionPhase = phases.find((phase) => phase.id === "learning");
  assert.match(productionPhase?.title ?? "", /production robotics systems/i);
  assert.match(productionPhase?.outcome ?? "", /fleet.*deployment.*operator systems/i);

  const fleetOps = projects.find((project) => project.id === "fleet-ops");
  assert.equal(fleetOps?.title, "FleetOps Lab");
  assert.match(fleetOps?.proof ?? "", /two-robot missions.*operator HMI.*SIL\/HIL.*rollback.*FAT\/SAT/i);
  assert.equal(projects.some((project) => project.id === "policy-bench"), false);

  assert.match(
    curriculumDays.find((day) => day.id === 119)?.checkpoint ?? "",
    /Gate 4.*FleetOps.*SIL\/HIL.*safe failure.*rollback.*commissioning/i,
  );
  assert.deepEqual(
    readinessSkills.find((skill) => skill.gateDay === 119),
    { id: "fleet", label: "Fleet & validation", gateDay: 119 },
  );
});

test("retargeted lessons no longer inherit the removed diffusion and RL teaching packs", () => {
  const fleetLesson = lessonForDay(curriculumDays[105]);
  const validationLesson = lessonForDay(curriculumDays[112]);
  const ecosystemLesson = lessonForDay(curriculumDays[126]);

  assert.match(fleetLesson.bigIdea, /production robot system.*failure boundaries/i);
  assert.match(fleetLesson.pareto.join(" "), /safety.*local.*missions.*state machines.*idempotent/i);
  assert.doesNotMatch(
    [fleetLesson, validationLesson].flatMap((lesson) => [
      lesson.bigIdea,
      ...lesson.pareto,
      ...lesson.simpleExplanation,
      ...lesson.quiz.map(({ question, answer }) => `${question} ${answer}`),
    ]).join("\n"),
    /diffusion and flow policies|discounted return|reward wording becomes behavior/i,
  );

  assert.match(validationLesson.bigIdea, /FMEA.*traceability.*risk control.*test planning/i);
  assert.match(
    validationLesson.pareto.join(" "),
    /requirements.*hazards.*tests.*results.*component.*integration.*launch.*SIL\/HIL/i,
  );
  assert.match(
    validationLesson.sources.map(({ label }) => label).join("\n"),
    /launch_testing[\s\S]*Open-RMF[\s\S]*VDA 5050/i,
  );
  assert.match(
    ecosystemLesson.sources.map(({ label }) => label).join("\n"),
    /LeRobot 0\.6[\s\S]*GR00T 1\.7[\s\S]*Gemini Robotics ER 1\.6[\s\S]*π0\.5/i,
  );
});

test("every revised topic has a deep exact-topic override", () => {
  const expectedOverrideIds = [
    25, 26, 27, 29, 32, 33, 34, 37, 40, 41, 43, 44, 47, 50, 51, 52, 53, 54,
    55, 56, 66, 67, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 100, 106,
    107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 127,
    128, 129, 130, 131, 132, 133, 137, 138, 143, 144, 149, 150, 151, 152,
    153, 157, 164, 165, 168, 169, 170, 171, 172, 178, 179, 180,
  ];
  assert.deepEqual(Object.keys(topicDetailOverrides).map(Number), expectedOverrideIds);

  for (const dayId of expectedOverrideIds) {
    const detail = topicDetailOverrides[dayId];
    assert.ok(detail.core.length > 200, `day ${dayId} needs a deep core explanation`);
    assert.ok(detail.mathConnection.length > 100, `day ${dayId} needs worked quantitative context`);
    assert.ok(detail.example.explanation.length > 80, `day ${dayId} needs a physical example`);
    assert.ok(detail.example.tryIt.length > 80, `day ${dayId} needs a hands-on exercise`);
    assert.ok(detail.quiz.answer.length > 60, `day ${dayId} needs a diagnostic answer`);
  }
});

test("all 26 weeks include a beginner math rescue", () => {
  assert.deepEqual(validateMathRescues(), []);
  assert.deepEqual(
    Object.keys(mathRescueByWeek).map(Number),
    Array.from({ length: 26 }, (_, index) => index + 1),
  );
  for (const rescue of Object.values(mathRescueByWeek)) {
    assert.equal(rescue.workedSteps.length, 3);
    assert.ok(rescue.symbols.length >= 3);
    assert.match(rescue.quickCheck, /\?/);
    assert.ok(rescue.answer.length >= 4);
  }
});

test("adjacent topics resolve to different explanations, math, examples, and quizzes", () => {
  const exactTopicMath = curriculumDays.map(
    (day) => lessonForDay(day).math.connectionMarkdown,
  );
  assert.equal(
    new Set(exactTopicMath).size,
    180,
    "every day needs distinct exact-topic mathematics",
  );

  for (let index = 1; index < curriculumDays.length; index += 1) {
    const previous = lessonForDay(curriculumDays[index - 1]);
    const current = lessonForDay(curriculumDays[index]);

    assert.notEqual(current.bigIdea, previous.bigIdea);
    assert.notEqual(current.math.connection, previous.math.connection);
    assert.notEqual(current.examples[0].explanation, previous.examples[0].explanation);
    assert.notEqual(current.quiz[0].question, previous.quiz[0].question);
  }
});

test("the live tutor uses the verified, quota-guarded callable boundary", async () => {
  const [
    cloudDataSource,
    dataContextSource,
    studioSource,
    observabilitySource,
    tutorContextSource,
    tutorProviderSource,
    tutorQuotaSource,
    tutorConfigSource,
    securitySource,
  ] = await Promise.all([
    readFile(new URL("../app/firestore-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/course-data-context.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learning-studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/firebase-observability.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/src/tutor-context.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/src/tutor-provider.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/src/tutor-quota.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/src/config.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/src/security.ts", import.meta.url), "utf8"),
  ]);

  assert.match(cloudDataSource, /export async function askCloudTutor\(/);
  assert.match(cloudDataSource, />\(functions,\s*"askTutor",\s*\{/);
  assert.match(cloudDataSource, /limitedUseAppCheckTokens:\s*true/);
  assert.match(cloudDataSource, /dayId:\s*input\.day\.id/);
  assert.doesNotMatch(
    cloudDataSource,
    /firebase\/ai|@google\/genai|getAI\(|GoogleAIBackend|generateContent\(/,
  );
  assert.match(studioSource, /askCloudTutor\(\{/);
  assert.doesNotMatch(studioSource, /fetch\(["']\/api\/tutor/);
  assert.doesNotMatch(
    studioSource,
    /firebase\/ai|@google\/genai|getAI\(|GoogleAIBackend|generateContent\(/,
  );
  assert.match(studioSource, /allowedLinks=\{approvedSourceUrls\}/);

  assert.match(dataContextSource, /Saved in Cloud Firestore/);
  assert.match(
    dataContextSource,
    /New Robot\/Shift state is never written to browser storage/,
  );
  assert.doesNotMatch(dataContextSource, /localStorage\.setItem/);

  assert.match(tutorContextSource, /TRUSTED CURRICULUM CONTEXT/);
  assert.match(tutorContextSource, /context\.math\.(?:connectionMarkdown|latex)/);
  assert.match(tutorContextSource, /context\.deepExplanation/);
  assert.match(tutorContextSource, /context\.commonMistakes/);
  assert.match(tutorContextSource, /context\.sources/);
  assert.match(tutorContextSource, /curious 12-year-old/);
  assert.match(
    tutorContextSource,
    /Assume no prior vectors, matrices, algebra, trigonometry, or coordinate-frame knowledge/,
  );
  assert.match(tutorContextSource, /GitHub-Flavored Markdown without raw HTML/);
  assert.match(tutorContextSource, /KaTeX-compatible/);

  assert.match(tutorProviderSource, /new GoogleGenAI\(\{ apiKey \}\)/);
  assert.match(
    tutorProviderSource,
    /generativelanguage\.googleapis\.com\/v1beta\/models/,
  );
  assert.match(tutorProviderSource, /generateContentRequest:\s*\{/);
  assert.match(tutorProviderSource, /systemInstruction:\s*\{/);
  assert.match(tutorProviderSource, /this\.client\.models\.generateContent\(\{/);
  assert.match(securitySource, /if \(!request\.auth\)/);
  assert.match(securitySource, /request\.auth\.token\.email_verified !== true/);
  assert.match(securitySource, /request\.app\.appId !== ROBOTSHIFT_WEB_APP_ID/);
  assert.match(securitySource, /auth\.getUser\(request\.auth\.uid\)/);
  assert.match(securitySource, /if \(user\.disabled\)/);
  assert.match(securitySource, /if \(!user\.emailVerified\)/);

  assert.match(tutorQuotaSource, /database\.runTransaction/);
  assert.match(tutorQuotaSource, /usage\.attempts >= policy\.perUserDailyLimit/);
  assert.match(tutorQuotaSource, /usage\.inFlight >= 1/);
  assert.match(
    tutorQuotaSource,
    /authorizationLimitNanoUsd = Math\.min\([\s\S]*policy\.authorizationLimitNanoUsd,[\s\S]*global\.authorizationLimitNanoUsd/,
  );
  assert.match(
    tutorQuotaSource,
    /committedAfterReservation > authorizationLimitNanoUsd/,
  );
  assert.match(
    tutorQuotaSource,
    /> global\.absoluteLimitNanoUsd/,
  );
  assert.match(tutorQuotaSource, /requestSnapshot\.exists/);
  assert.match(tutorQuotaSource, /inputHash/);
  assert.match(tutorConfigSource, /perUserDailyLimit:\s*10/);
  assert.match(tutorConfigSource, /authorizationLimitNanoUsd:\s*800_000_000/);
  assert.match(tutorConfigSource, /absoluteLimitNanoUsd:\s*1_000_000_000/);

  assert.match(observabilitySource, /"tutor_request"/);
  assert.match(observabilitySource, /"lesson_view"/);
  assert.match(observabilitySource, /"sign_up"/);
  assert.match(observabilitySource, /"login"/);
  assert.match(observabilitySource, /analytics_storage:\s*"denied"/);
  assert.match(observabilitySource, /send_page_view:\s*false/);
  assert.match(
    observabilitySource,
    /window\.location\.origin === "https:\/\/robotshift\.web\.app"/,
  );
  assert.match(observabilitySource, /pathname\.startsWith\("\/auth\/action"\)/);
  assert.match(observabilitySource, /latency_bucket/);
  assert.match(observabilitySource, /failure_code/);
  assert.doesNotMatch(
    observabilitySource,
    /\b(?:email|uid|displayName|photoURL)\s*:/,
  );
  assert.doesNotMatch(observabilitySource, /question:\s*input|answer:\s*input|history:\s*input/);
});
