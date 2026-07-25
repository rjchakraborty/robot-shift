import assert from "node:assert/strict";
import test from "node:test";

import {
  MARKET_CAPTURED_ON,
  countMarketSkills,
  courseSkillMap,
  jobEvidence,
  matchJobDescription,
  targetRoles,
} from "../app/career-market.ts";

test("the market evidence is a dated, traceable 15-posting India sample", () => {
  assert.equal(MARKET_CAPTURED_ON, "2026-07-23");
  assert.equal(jobEvidence.length, 15);
  assert.equal(new Set(jobEvidence.map(({ id }) => id)).size, jobEvidence.length);
  assert.equal(new Set(jobEvidence.map(({ url }) => url)).size, jobEvidence.length);

  for (const posting of jobEvidence) {
    assert.equal(posting.capturedOn, MARKET_CAPTURED_ON);
    assert.match(posting.location, /Bengaluru|Pune|Delhi|Hyderabad|Ahmedabad/i);
    assert.equal(new URL(posting.url).protocol, "https:");
    assert.ok(posting.tags.length >= 5, `${posting.id} needs a useful skill classification`);
    assert.ok(posting.summary.length > 60, `${posting.id} needs a decision-useful summary`);
  }

  assert.deepEqual(
    new Set(jobEvidence.map(({ source }) => source)),
    new Set(["Direct ATS", "Official careers", "LinkedIn", "Indeed", "Wellfound"]),
  );

  const hosts = jobEvidence.map(({ url }) => new URL(url).hostname);
  assert.ok(hosts.some((host) => host.includes("linkedin.com")));
  assert.ok(hosts.some((host) => host.includes("indeed.com")));
  assert.ok(hosts.some((host) => host.includes("wellfound.com")));
  assert.ok(hosts.some((host) => host.includes("greenhouse.io")));
  assert.ok(hosts.some((host) => host.includes("workdayjobs.com")));
});

test("market skill counts are derived from evidence rather than copied totals", () => {
  const counts = countMarketSkills();
  const bySkill = new Map(counts.map(({ skill, count }) => [skill, count]));

  for (const { skill, count } of counts) {
    const expected = jobEvidence.filter(({ tags }) => tags.includes(skill)).length;
    assert.equal(count, expected, `${skill} count must be derived from posting tags`);
  }

  assert.equal(bySkill.get("Python"), 11);
  assert.equal(bySkill.get("ROS 2"), 11);
  assert.ok((bySkill.get("Hardware integration") ?? 0) >= 10);
  assert.ok((bySkill.get("Fleet / AMR") ?? 0) >= 5);

  for (let index = 1; index < counts.length; index += 1) {
    assert.ok(
      counts[index - 1].count >= counts[index].count,
      "market counts must be presented in descending frequency",
    );
  }

  assert.deepEqual(
    countMarketSkills([
      { tags: ["Python", "Python", "ROS 2"] },
      { tags: ["Python", "Fleet / AMR"] },
    ]),
    [
      { skill: "Python", count: 2 },
      { skill: "Fleet / AMR", count: 1 },
      { skill: "ROS 2", count: 1 },
    ],
  );
});

test("the role map has four neutral evidence families without a presumed learner profile", () => {
  assert.equal(targetRoles.length, 6);
  assert.deepEqual(
    targetRoles.reduce((counts, { tier }) => {
      counts[tier] = (counts[tier] ?? 0) + 1;
      return counts;
    }, {}),
    {
      "software-bridge": 2,
      integration: 2,
      "robotics-core": 1,
      "advanced-applied": 1,
    },
  );

  for (const role of targetRoles) {
    assert.ok(role.fit.length > 70);
    assert.ok(role.portfolioLeverage.length >= 3);
    assert.ok(role.gaps.length >= 3);
    assert.ok(role.proof.length >= 3);
    assert.ok(role.keywords.length >= 8);
    assert.ok(role.interviewDomains.length >= 5);
    assert.ok(role.courseDays.length >= 6);
    assert.ok(role.courseDays.every((day) => day >= 1 && day <= 180));
  }

  const leverage = targetRoles
    .flatMap(({ portfolioLeverage }) => portfolioLeverage)
    .join("\n");
  assert.match(leverage, /interface|operator|accessib/i);
  assert.match(leverage, /backend|service|API/i);
  assert.match(leverage, /database|messaging|data consistency/i);
  assert.match(leverage, /QA|incident|release|rollback/i);
  assert.match(leverage, /wiring|electronics|hardware|lab/i);
  assert.match(leverage, /ML|agent|retrieval|multimodal/i);

  const roleText = targetRoles
    .map((role) => [
      role.title,
      role.timing,
      role.fit,
      ...role.portfolioLeverage,
      ...role.gaps,
      ...role.proof,
    ].join(" "))
    .join("\n");
  assert.match(roleText, /verified production engineering/i);
  assert.match(roleText, /not automatically a research-scientist claim/i);
  assert.match(roleText, /C\+\+.*ROS 2|ROS 2.*C\+\+/i);
  assert.match(roleText, /robot.*HIL/i);
  assert.doesNotMatch(roleText, /\b(?:ten|10\+?) years?\b/i);
  assert.doesNotMatch(roleText, /React.*Flutter.*Android/i);
});

test("the local JD matcher maps job language to concrete curriculum work", () => {
  assert.deepEqual(matchJobDescription("   "), {
    matchedSkills: [],
    courseLinks: [],
    unmatchedTerms: [],
  });

  const result = matchJobDescription(`
    Build an AMR fleet service with Python and C++ on Linux and ROS 2.
    Stream telemetry over WebSocket, validate it with HIL, and integrate VDA5050.
    CUDA and PLC experience are useful.
  `);
  const matched = new Set(result.matchedSkills.map(({ skill }) => skill));

  for (const expected of [
    "Python",
    "C++",
    "ROS 2",
    "Linux",
    "Testing",
    "Simulation",
    "Fleet / AMR",
    "Realtime networking",
  ]) {
    assert.ok(matched.has(expected), `matcher should detect ${expected}`);
  }

  assert.ok(result.courseLinks.length >= 8);
  assert.ok(result.courseLinks.every(({ action, days, startDay }) =>
    action.length > 40 && /^Day/.test(days) && startDay >= 1 && startDay <= 180
  ));
  const linkedCourse = result.courseLinks.map(({ skill, days }) => `${skill}: ${days}`).join("\n");
  assert.match(linkedCourse, /ROS 2: Days 29–56/);
  assert.match(linkedCourse, /Fleet \/ AMR: Days 106–112, 117/);
  assert.match(linkedCourse, /Testing: Days 113–119/);
  assert.deepEqual(result.unmatchedTerms, ["cuda", "plc"]);

  assert.equal(courseSkillMap.length, 20);
  assert.equal(new Set(courseSkillMap.map(({ skill }) => skill)).size, 20);
});
