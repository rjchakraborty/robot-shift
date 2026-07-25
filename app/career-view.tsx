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

const tierOrder: readonly RoleTier[] = [
  "software-bridge",
  "integration",
  "robotics-core",
  "advanced-applied",
];

const tierCopy: Record<RoleTier, { label: string; note: string }> = {
  "software-bridge": {
    label: "Software-to-robotics bridges",
    note: "Consider these when your verified interface or platform evidence is stronger than your direct robotics evidence.",
  },
  integration: {
    label: "Integration and validation",
    note: "Consider these when your strongest proof connects subsystems, diagnoses failures, or validates releases.",
  },
  "robotics-core": {
    label: "Robotics-core specialization",
    note: "Requires direct ROS 2, C++, mathematics, and repeated robot or HIL evidence.",
  },
  "advanced-applied": {
    label: "Advanced applied specialization",
    note: "Requires direct dataset, evaluation, safety, and rollout evidence beyond general AI familiarity.",
  },
};

const transferEvidenceExamples = [
  "Interfaces: accessible web, desktop, mobile, embedded, or operator workflows",
  "Platforms: APIs, data consistency, messaging, background work, and observability",
  "Delivery: testing, CI/CD, release, rollback, incident response, or field support",
  "Systems: concurrency, networking, performance, reliability, and security",
  "Intelligence: data pipelines, ML evaluation, agents, retrieval, or multimodal systems",
  "Physical work: electronics, controls, fabrication, repair, commissioning, or lab practice",
] as const;

const directRoboticsEvidence = [
  "ROS 2 graphs, tf2, URDF, ros2_control, navigation, or manipulation",
  "Bounded C++ and Linux robot-runtime diagnosis",
  "Simulation, SIL/HIL, hardware integration, and commissioning",
  "Command limits, e-stop/STO awareness, and risk-linked tests",
  "Repeated trials with complete logs, denominators, failures, and limitations",
] as const;

function roleById(id: string | null): TargetRole | null {
  if (!id) return null;
  return targetRoles.find((role) => role.id === id) ?? null;
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
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
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
        <div className="career-hero-grid">
          <div>
            <h1 id="career-title">Target roles</h1>
            <p className="career-hero-lede">
              Explore role families, then choose from your own verified evidence.
            </p>
          </div>
          <dl className="career-verdict-stats" aria-label="Career strategy summary">
            <div>
              <dt>Regional sample</dt>
              <dd>{jobEvidence.length} dated postings</dd>
            </div>
            <div>
              <dt>Role families</dt>
              <dd>{targetRoles.length} evidence paths</dd>
            </div>
            <div>
              <dt>Decision rule</dt>
              <dd>Proof before title</dd>
            </div>
          </dl>
        </div>
        <p className="career-truth-note">
          Honest boundary: no course can cover every company-specific interview
          question or guarantee a job. This path covers recurring requirements in
          the postings captured on {capturedLabel}; re-check each live posting and
          paste its description into the matcher before applying. No role is
          preselected for you.
        </p>
      </section>

      <section className="career-fit" aria-labelledby="career-fit-title">
        <div className="career-section-heading">
          <h2 id="career-fit-title">Build your own evidence inventory</h2>
        </div>
        <div className="career-fit-grid">
          <article className="career-fit-card career-fit-card-strong">
            <p className="career-card-label">Prior evidence that may transfer</p>
            <ul>
              {transferEvidenceExamples.map((strength) => <li key={strength}>{strength}</li>)}
            </ul>
          </article>
          <article className="career-fit-card career-fit-card-gap">
            <p className="career-card-label">Direct robotics evidence to build</p>
            <ul>
              {directRoboticsEvidence.map((gap) => <li key={gap}>{gap}</li>)}
            </ul>
          </article>
        </div>
        <details className="career-positioning">
          <summary>Evidence-first transition answer template</summary>
          <p>
            “My previous work in [truthful domain] demonstrates [verified transferable
            capabilities]. For robotics, I built [specific system] and tested
            [failure or safety boundary] under [simulation, HIL, or hardware
            conditions]. These artifacts show [measured result] and [remaining limit].”
          </p>
          <footer>
            Use this only after the linked evidence exists. Some employers still
            enforce degree or prior-robotics filters; equivalent practical
            experience helps, but does not erase every filter.
          </footer>
        </details>
      </section>

      <section className="career-roles" aria-labelledby="career-roles-title">
        <div className="career-section-heading">
          <h2 id="career-roles-title">Role and required proof</h2>
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
                    const selected = role.id === selectedRole?.id;
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

        {selectedRole ? (
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
                <h4>Prior evidence that can transfer</h4>
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
        ) : (
          <div
            className="career-role-detail"
            id="career-role-detail"
            aria-live="polite"
            aria-labelledby="career-selected-title"
          >
            <header>
              <p className="career-card-label">No recommendation inferred</p>
              <h3 id="career-selected-title">Choose a role to inspect its evidence gate</h3>
              <p>
                Start with your verified work and course artifacts. The order above
                is a role-family map, not a ranking of what you should become.
              </p>
            </header>
          </div>
        )}
      </section>

      <section className="career-signals" aria-labelledby="career-signals-title">
        <div className="career-section-heading">
          <h2 id="career-signals-title">Regional example: a dated India job sample</h2>
          <p>
            Counts below come only from explicit tags on the {jobEvidence.length}
            reviewed postings. They are a directional sample, not a complete census
            of India’s robotics market or a substitute for current evidence in
            another location.
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
          <h2 id="career-jd-title">Job description matcher</h2>
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
          <h2 id="career-evidence-title">Source job postings</h2>
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
        <h2 id="career-claim-title">Resume evidence rule</h2>
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
          Never convert time in another domain into years of robotics experience.
          Name the prior work truthfully, then link the exact ROS 2, fleet,
          validation, hardware, or physical-AI artifacts that support each new claim.
        </p>
      </section>
    </div>
  );
}
