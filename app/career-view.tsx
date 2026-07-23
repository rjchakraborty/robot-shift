"use client";

import { useMemo, useState } from "react";
import {
  MARKET_CAPTURED_ON,
  countMarketSkills,
  jobEvidence,
  matchJobDescription,
  targetRoles,
  type RoleTier,
  type TargetRole,
} from "./career-market";

export type CareerViewProps = {
  onOpenDay?: (dayId: number) => void;
};

const tierOrder: readonly RoleTier[] = ["apply-first", "primary", "next", "stretch"];

const tierCopy: Record<RoleTier, { label: string; note: string }> = {
  "apply-first": {
    label: "Apply first",
    note: "Bridge roles that reuse your strongest production skills after one robotics-facing proof.",
  },
  primary: {
    label: "Primary target",
    note: "Best specialization once ROS 2 core and the production fleet/validation gate are complete.",
  },
  next: {
    label: "Next target",
    note: "Pursue after two credible ROS 2 builds and repeatable real-robot or HIL evidence.",
  },
  stretch: {
    label: "Stretch target",
    note: "Build toward this at the integration/evaluation layer—not as a research-scientist claim.",
  },
};

const portfolioStrengths = [
  "10+ years shipping production software end to end",
  "React, Next.js, Flutter, Android, UX, APIs, and QA",
  "Python/Node services, REST, background jobs, and event workflows",
  "PostgreSQL, Redis, Kafka, Firebase, CI/CD, and cloud concepts",
  "LLM, RAG, agent/tool workflows, and vector search",
  "Hands-on wiring, soldering, components, motors, and servos",
] as const;

const proofGaps = [
  "Production C++ and Linux evidence",
  "ROS 2, tf2, URDF, ros2_control, Nav2/SLAM",
  "Robot deployment, SIL/HIL, fault injection, and commissioning",
  "Safety boundaries, e-stop/STO awareness, and risk-linked tests",
  "Repeated hardware or HIL trials with logs and failure analysis",
] as const;

function roleById(id: string): TargetRole {
  return targetRoles.find((role) => role.id === id) ?? targetRoles[0];
}

function formatCapturedDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function CareerView({ onOpenDay }: CareerViewProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(targetRoles[0].id);
  const [jobDescription, setJobDescription] = useState("");
  const selectedRole = roleById(selectedRoleId);
  const skillSignals = useMemo(() => countMarketSkills(), []);
  const jdResult = useMemo(
    () => matchJobDescription(jobDescription),
    [jobDescription],
  );
  const capturedLabel = formatCapturedDate(MARKET_CAPTURED_ON);

  return (
    <div className="career-view" aria-labelledby="career-title">
      <section className="career-hero">
        <p className="career-kicker">Specialization verdict · India evidence set</p>
        <div className="career-hero-grid">
          <div>
            <h1 id="career-title">Production Robotics Integration &amp; Fleet Systems</h1>
            <p className="career-hero-lede">
              The shortest credible move is to bring your senior production-software
              discipline to the robot boundary: operator interfaces, fleet services,
              ROS 2 integration, deployment, validation, and then physical-AI
              integration.
            </p>
          </div>
          <dl className="career-verdict-stats" aria-label="Career strategy summary">
            <div>
              <dt>Evidence</dt>
              <dd>{jobEvidence.length} current postings</dd>
            </div>
            <div>
              <dt>Primary gate</dt>
              <dd>Days 84–119</dd>
            </div>
            <div>
              <dt>Research degree</dt>
              <dd>Not the plan</dd>
            </div>
          </dl>
        </div>
        <p className="career-truth-note">
          Honest boundary: no course can cover every company-specific interview
          question or guarantee a job. This path covers recurring requirements in
          the postings captured on {capturedLabel}; re-check each live posting and
          paste its description into the matcher before applying.
        </p>
      </section>

      <section className="career-fit" aria-labelledby="career-fit-title">
        <div className="career-section-heading">
          <p className="career-section-mark">01 · Transfer map</p>
          <h2 id="career-fit-title">You are changing domain, not restarting your career</h2>
          <p>
            Keep your senior engineering identity. Add robotics proof without
            claiming years of robotics experience you do not yet have.
          </p>
        </div>
        <div className="career-fit-grid">
          <article className="career-fit-card career-fit-card-strong">
            <p className="career-card-label">Already credible from your portfolio</p>
            <ul>
              {portfolioStrengths.map((strength) => <li key={strength}>{strength}</li>)}
            </ul>
          </article>
          <article className="career-fit-card career-fit-card-gap">
            <p className="career-card-label">Prove before putting on the resume</p>
            <ul>
              {proofGaps.map((gap) => <li key={gap}>{gap}</li>)}
            </ul>
          </article>
        </div>
        <blockquote className="career-positioning">
          <p className="career-card-label">Degree-question answer</p>
          <p>
            “I am a senior production software engineer moving into robotics
            integration. I bring ten years of shipping and operating complete
            systems, and I can demonstrate ROS 2, fleet, deployment, validation,
            and hardware-in-the-loop work through these projects and test reports.”
          </p>
          <footer>
            Use this only after the linked evidence exists. Some employers still
            enforce degree or prior-robotics filters; equivalent practical
            experience helps, but does not erase every filter.
          </footer>
        </blockquote>
      </section>

      <section className="career-roles" aria-labelledby="career-roles-title">
        <div className="career-section-heading">
          <p className="career-section-mark">02 · Target ladder</p>
          <h2 id="career-roles-title">Choose a role, then build only the missing proof</h2>
          <p>
            “Apply first” is the bridge. “Primary” is the specialization. The later
            tiers need progressively more robotics-native evidence.
          </p>
        </div>

        <div className="career-role-groups" aria-label="Role targets">
          {tierOrder.map((tier) => {
            const roles = targetRoles.filter((role) => role.tier === tier);
            return (
              <section className={`career-role-group career-tier-${tier}`} key={tier}>
                <div className="career-role-group-heading">
                  <h3>{tierCopy[tier].label}</h3>
                  <p>{tierCopy[tier].note}</p>
                </div>
                <div className="career-role-buttons">
                  {roles.map((role) => {
                    const selected = role.id === selectedRole.id;
                    return (
                      <button
                        className="career-role-button"
                        type="button"
                        aria-pressed={selected}
                        aria-controls="career-role-detail"
                        onClick={() => setSelectedRoleId(role.id)}
                        key={role.id}
                      >
                        <span>{role.title}</span>
                        <small>{role.timing}</small>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <article
          className="career-role-detail"
          id="career-role-detail"
          aria-live="polite"
          aria-labelledby="career-selected-title"
        >
          <header>
            <p className="career-card-label">{tierCopy[selectedRole.tier].label}</p>
            <h3 id="career-selected-title">{selectedRole.title}</h3>
            <p>{selectedRole.fit}</p>
            <strong>{selectedRole.timing}</strong>
          </header>
          <div className="career-role-detail-grid">
            <div>
              <h4>Reuse now</h4>
              <ul>
                {selectedRole.portfolioLeverage.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4>Close the gaps</h4>
              <ul>
                {selectedRole.gaps.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4>Portfolio proof</h4>
              <ul>
                {selectedRole.proof.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4>Interview domains</h4>
              <ul>
                {selectedRole.interviewDomains.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="career-role-keywords" aria-label="Resume keywords after proof">
            <strong>Keywords to earn:</strong>
            {selectedRole.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
          </div>
          <div className="career-day-links" aria-label="Relevant curriculum days">
            <strong>Course checkpoints</strong>
            {selectedRole.courseDays.map((dayId) => (
              onOpenDay ? (
                <button type="button" onClick={() => onOpenDay(dayId)} key={dayId}>
                  Day {dayId}
                </button>
              ) : (
                <span key={dayId}>Day {dayId}</span>
              )
            ))}
          </div>
        </article>
      </section>

      <section className="career-signals" aria-labelledby="career-signals-title">
        <div className="career-section-heading">
          <p className="career-section-mark">03 · Market signals</p>
          <h2 id="career-signals-title">What repeated in the curated India sample</h2>
          <p>
            Counts below come only from explicit tags on the {jobEvidence.length}
            reviewed postings. They are a directional sample, not a complete census
            of India’s robotics market.
          </p>
        </div>
        <div className="career-signal-list">
          {skillSignals.map(({ skill, count }) => (
            <div className="career-signal" key={skill}>
              <div className="career-signal-label">
                <span>{skill}</span>
                <strong>{count}/{jobEvidence.length}</strong>
              </div>
              <div className="career-signal-track" aria-hidden="true">
                <span style={{ width: `${(count / jobEvidence.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="career-jd-lab" aria-labelledby="career-jd-title">
        <div className="career-section-heading">
          <p className="career-section-mark">04 · JD Match Lab</p>
          <h2 id="career-jd-title">Turn one job description into a study queue</h2>
          <p>
            This matcher runs entirely in your browser. It does not upload or save
            the pasted description.
          </p>
        </div>
        <label className="career-jd-label" htmlFor="career-jd-input">
          Paste the skills and responsibilities from one job
        </label>
        <textarea
          id="career-jd-input"
          className="career-jd-input"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          rows={8}
          maxLength={12_000}
          placeholder="Example: Build ROS 2 Python fleet services using WebSocket, VDA5050, simulation, and HIL regression tests…"
        />
        <div className="career-jd-actions">
          <span>{jobDescription.length.toLocaleString("en-IN")} / 12,000 characters</span>
          {jobDescription && (
            <button type="button" onClick={() => setJobDescription("")}>Clear</button>
          )}
        </div>

        {!jobDescription.trim() ? (
          <div className="career-jd-empty">
            <strong>No description pasted yet.</strong>
            <p>Paste one role at a time. The result becomes a concrete course-day queue.</p>
          </div>
        ) : (
          <div className="career-jd-results" aria-live="polite">
            <div className="career-jd-match-summary">
              <strong>{jdResult.matchedSkills.length} curriculum skill groups matched</strong>
              <p>
                Matching is keyword-based. Read the original posting; this tool
                cannot judge seniority, depth, degree filters, or whether your proof
                is strong enough.
              </p>
            </div>
            {jdResult.courseLinks.length ? (
              <ol className="career-jd-course-list">
                {jdResult.courseLinks.map((mapping) => {
                  const match = jdResult.matchedSkills.find(
                    ({ skill }) => skill === mapping.skill,
                  );
                  return (
                    <li key={mapping.skill}>
                      <div>
                        <strong>{mapping.skill}</strong>
                        <span>{mapping.days}</span>
                      </div>
                      <p>{mapping.action}</p>
                      <small>
                        Matched: {match?.matchedTerms.join(", ")} · seen in{" "}
                        {match?.count ?? 0}/{jobEvidence.length} evidence postings
                      </small>
                      {onOpenDay && (
                        <button type="button" onClick={() => onOpenDay(mapping.startDay)}>
                          Open Day {mapping.startDay}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="career-jd-no-match">
                No mapped terms found. Check spelling, paste the complete skills
                section, then manually inspect requirements this simple matcher
                cannot classify.
              </p>
            )}
            {jdResult.unmatchedTerms.length > 0 && (
              <aside className="career-jd-extensions">
                <strong>Detected specialist terms outside the core mapping</strong>
                <p>
                  {jdResult.unmatchedTerms.join(", ")}. Treat these as
                  employer-specific extensions: verify their depth in the posting
                  instead of claiming the skill from a keyword alone.
                </p>
              </aside>
            )}
          </div>
        )}
      </section>

      <section className="career-evidence" aria-labelledby="career-evidence-title">
        <div className="career-section-heading">
          <p className="career-section-mark">05 · Evidence ledger</p>
          <h2 id="career-evidence-title">Open the postings behind the curriculum</h2>
          <p>
            Links can expire or change after {capturedLabel}. The captured summary
            explains why each posting influenced the path; the live page remains
            the authority when you apply.
          </p>
        </div>
        <div className="career-evidence-list">
          {jobEvidence.map((job) => (
            <article className="career-evidence-card" key={job.id}>
              <div className="career-evidence-meta">
                <span>{job.source}</span>
                <span>{job.location}</span>
              </div>
              <h3>{job.title}</h3>
              <p className="career-evidence-company">{job.company}</p>
              <p>{job.summary}</p>
              <div className="career-evidence-tags">
                {job.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <a href={job.url} target="_blank" rel="noreferrer">
                Check live posting
                <span aria-hidden="true"> ↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="career-claim-rule" aria-labelledby="career-claim-title">
        <p className="career-section-mark">06 · Resume honesty rule</p>
        <h2 id="career-claim-title">A keyword becomes a resume skill only after proof</h2>
        <div className="career-claim-formula" aria-label="Resume evidence formula">
          <span>Problem</span>
          <b aria-hidden="true">→</b>
          <span>Robot system built</span>
          <b aria-hidden="true">→</b>
          <span>Failure tested</span>
          <b aria-hidden="true">→</b>
          <span>Measured result</span>
          <b aria-hidden="true">→</b>
          <span>Artifact link</span>
        </div>
        <p>
          Do not write “10 years robotics.” Write “10 years production software”
          and then show the exact ROS 2, fleet, validation, or physical-AI artifacts
          you built during this transition.
        </p>
      </section>
    </div>
  );
}
