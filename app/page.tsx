"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  curriculumDays,
  phases,
  projects,
  readinessSkills,
  resources,
  type CurriculumDay,
  type Phase,
} from "./curriculum";

type View = "today" | "roadmap" | "builds" | "notebook" | "progress";
type TaskPart = "learn" | "build" | "prove";
type PhaseStat = Phase & { days: number; complete: number; percent: number };

type TrackerState = {
  schemaVersion: 1;
  completed: Record<string, boolean>;
  bookmarks: number[];
  notes: Record<string, string>;
  evidence: Record<string, string>;
  projectChecks: Record<string, boolean[]>;
  startedOn: string;
  weeklyHours: number;
  selectedDay: number;
};

const taskParts: TaskPart[] = ["learn", "build", "prove"];
const STORAGE_KEY = "robot-shift-tracker-v1";

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const defaultState: TrackerState = {
  schemaVersion: 1,
  completed: {},
  bookmarks: [],
  notes: {},
  evidence: {},
  projectChecks: {},
  startedOn: "",
  weeklyHours: 10,
  selectedDay: 1,
};

function taskKey(dayId: number, part: TaskPart) {
  return `${dayId}:${part}`;
}

function phaseFor(day: CurriculumDay) {
  return phases.find((phase) => phase.id === day.phaseId)!;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function scheduledDate(startedOn: string, dayId: number) {
  if (!startedOn) return null;
  const date = new Date(`${startedOn}T12:00:00`);
  date.setDate(date.getDate() + dayId - 1);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function safeParseState(raw: string | null): TrackerState {
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    if (parsed.schemaVersion !== 1 || typeof parsed.completed !== "object") return defaultState;
    return {
      ...defaultState,
      ...parsed,
      completed: parsed.completed ?? {},
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks.filter(Number.isInteger) : [],
      notes: parsed.notes ?? {},
      evidence: parsed.evidence ?? {},
      projectChecks: parsed.projectChecks ?? {},
    };
  } catch {
    return defaultState;
  }
}

const navigation: { id: View; label: string; mark: string }[] = [
  { id: "today", label: "Today", mark: "01" },
  { id: "roadmap", label: "Roadmap", mark: "02" },
  { id: "builds", label: "Builds", mark: "03" },
  { id: "notebook", label: "Notebook", mark: "04" },
  { id: "progress", label: "Progress", mark: "05" },
];

export default function Home() {
  const [tracker, setTracker] = useState<TrackerState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("today");
  const [query, setQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [saveStatus, setSaveStatus] = useState("Ready");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = safeParseState(window.localStorage.getItem(STORAGE_KEY));
    setTracker({ ...loaded, startedOn: loaded.startedOn || localDate() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus("Saving…");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
    const timer = window.setTimeout(() => setSaveStatus("Saved on this device"), 250);
    return () => window.clearTimeout(timer);
  }, [tracker, hydrated]);

  const isPartDone = (dayId: number, part: TaskPart) => Boolean(tracker.completed[taskKey(dayId, part)]);
  const isDayDone = (dayId: number) => taskParts.every((part) => isPartDone(dayId, part));

  const completedParts = useMemo(
    () => curriculumDays.reduce((total, day) => total + taskParts.filter((part) => tracker.completed[taskKey(day.id, part)]).length, 0),
    [tracker.completed],
  );
  const completedDays = useMemo(() => curriculumDays.filter((day) => isDayDone(day.id)).length, [tracker.completed]);
  const totalParts = curriculumDays.length * taskParts.length;
  const percent = Math.round((completedParts / totalParts) * 100);
  const earliestIncomplete = curriculumDays.find((day) => !isDayDone(day.id))?.id ?? 180;
  const selectedDay = curriculumDays.find((day) => day.id === tracker.selectedDay) ?? curriculumDays[earliestIncomplete - 1];
  const currentPhase = phaseFor(selectedDay);

  const phaseStats = phases.map((phase) => {
    const days = curriculumDays.filter((day) => day.phaseId === phase.id);
    const complete = days.filter((day) => isDayDone(day.id)).length;
    return { ...phase, days: days.length, complete, percent: Math.round((complete / days.length) * 100) };
  });

  const filteredDays = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return curriculumDays.filter((day) => {
      const matchesPhase = phaseFilter === "all" || day.phaseId === phaseFilter;
      const done = isDayDone(day.id);
      const matchesStatus = statusFilter === "all" || (statusFilter === "complete" ? done : !done);
      const note = tracker.notes[String(day.id)] ?? "";
      const matchesQuery = !normalized || `${day.title} ${day.focus} ${day.task} ${day.lab} ${note}`.toLowerCase().includes(normalized);
      return matchesPhase && matchesStatus && matchesQuery;
    });
  }, [query, phaseFilter, statusFilter, tracker.notes, tracker.completed]);

  const openDay = (dayId: number) => {
    setTracker((previous) => ({ ...previous, selectedDay: dayId }));
    setView("today");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePart = (day: CurriculumDay, part: TaskPart) => {
    const key = taskKey(day.id, part);
    const next = !tracker.completed[key];
    setTracker((previous) => ({
      ...previous,
      completed: { ...previous.completed, [key]: next },
    }));
    const label = part === "learn" ? "understand" : part;
    setAnnouncement(`${day.title}: ${label} ${next ? "complete" : "reopened"}.`);
  };

  const toggleBookmark = (dayId: number) => {
    setTracker((previous) => ({
      ...previous,
      bookmarks: previous.bookmarks.includes(dayId)
        ? previous.bookmarks.filter((id) => id !== dayId)
        : [...previous.bookmarks, dayId],
    }));
  };

  const updateText = (field: "notes" | "evidence", dayId: number, value: string) => {
    setTracker((previous) => ({
      ...previous,
      [field]: { ...previous[field], [String(dayId)]: value },
    }));
  };

  const exportProgress = () => {
    const payload = JSON.stringify({ ...tracker, exportedAt: new Date().toISOString() }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `robot-shift-progress-${localDate()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setAnnouncement("Progress backup exported.");
  };

  const importProgress = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = safeParseState(await file.text());
      if (parsed === defaultState) throw new Error("invalid");
      setTracker(parsed);
      setAnnouncement("Progress backup imported.");
    } catch {
      setAnnouncement("Import rejected. Choose a valid Robot/Shift version 1 backup.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const resetProgress = () => {
    const clean = { ...defaultState, startedOn: localDate() };
    setTracker(clean);
    setShowReset(false);
    setAnnouncement("All local progress was reset.");
  };

  if (!hydrated) {
    return (
      <main className="boot-screen" aria-live="polite">
        <div className="boot-mark">R/S</div>
        <p>Loading your field manual…</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to curriculum</a>
      <aside className="side-rail" aria-label="Primary">
        <div className="brand-block">
          <span className="eyebrow">FIELD MANUAL // 180</span>
          <div className="brand-line"><span className="brand-slash">/</span> ROBOT<br />SHIFT</div>
          <p>Senior software → production robotics</p>
        </div>

        <nav className="rail-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <span>{item.mark}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="rail-progress">
          <div className="rail-progress-head"><span>MISSION</span><strong>{percent}%</strong></div>
          <progress value={completedParts} max={totalParts}>{percent}%</progress>
          <p>{completedDays}/180 days · {completedParts}/{totalParts} proofs</p>
        </div>

        <div className="local-note">
          <span className="status-dot" /> Local field storage
          <small>Your progress stays in this browser. Export a backup regularly.</small>
        </div>
      </aside>

      <div className="work-area">
        <header className="command-bar">
          <div>
            <span className="eyebrow">CURRENT OPERATING MODE</span>
            <strong>{currentPhase.number} / {currentPhase.shortTitle}</strong>
          </div>
          <div className="command-actions">
            <label className="global-search">
              <span>⌕</span>
              <span className="sr-only">Search curriculum</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setView("roadmap")}
                placeholder="Search 180 days…"
              />
            </label>
            <button className="utility-button" onClick={() => setShowSettings((open) => !open)} aria-expanded={showSettings}>
              Controls
            </button>
          </div>
        </header>

        {showSettings && (
          <section className="settings-drawer" aria-label="Curriculum controls">
            <div>
              <label htmlFor="start-date">Start date</label>
              <input id="start-date" type="date" value={tracker.startedOn} onChange={(event) => setTracker((p) => ({ ...p, startedOn: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="weekly-hours">Weekly hours</label>
              <input id="weekly-hours" type="number" min="4" max="30" value={tracker.weeklyHours} onChange={(event) => setTracker((p) => ({ ...p, weeklyHours: Number(event.target.value) }))} />
            </div>
            <div className="settings-actions">
              <button onClick={exportProgress}>Export backup</button>
              <label className="button-label">Import backup<input ref={importRef} className="sr-only" type="file" accept="application/json" onChange={(event) => importProgress(event.target.files?.[0])} /></label>
              <button className="danger-link" onClick={() => setShowReset(true)}>Reset</button>
            </div>
            <small>{saveStatus}</small>
          </section>
        )}

        <main id="main-content" tabIndex={-1}>
          {view === "today" && (
            <TodayView
              day={selectedDay}
              earliestIncomplete={earliestIncomplete}
              tracker={tracker}
              isPartDone={isPartDone}
              togglePart={togglePart}
              toggleBookmark={toggleBookmark}
              updateText={updateText}
              openDay={openDay}
            />
          )}

          {view === "roadmap" && (
            <RoadmapView
              days={filteredDays}
              query={query}
              setQuery={setQuery}
              phaseFilter={phaseFilter}
              setPhaseFilter={setPhaseFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              isDayDone={isDayDone}
              bookmarks={tracker.bookmarks}
              openDay={openDay}
              clearFilters={() => { setQuery(""); setPhaseFilter("all"); setStatusFilter("all"); }}
            />
          )}

          {view === "builds" && (
            <BuildsView tracker={tracker} setTracker={setTracker} openDay={openDay} />
          )}

          {view === "notebook" && (
            <NotebookView tracker={tracker} openDay={openDay} />
          )}

          {view === "progress" && (
            <ProgressView
              percent={percent}
              completedDays={completedDays}
              completedParts={completedParts}
              totalParts={totalParts}
              phaseStats={phaseStats}
              tracker={tracker}
              isDayDone={isDayDone}
            />
          )}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
            <span>{item.mark}</span>{item.label}
          </button>
        ))}
      </nav>

      <div className="sr-only" aria-live="polite">{announcement}</div>

      {showReset && (
        <div className="modal-backdrop" role="presentation">
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <span className="eyebrow">DESTRUCTIVE LOCAL ACTION</span>
            <h2 id="reset-title">Reset all progress?</h2>
            <p>This removes completed tasks, notes, evidence, bookmarks, and build checks from this browser. Export first if you may need them.</p>
            <div>
              <button onClick={() => setShowReset(false)}>Keep progress</button>
              <button className="danger-button" onClick={resetProgress}>Reset everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TodayView({
  day,
  earliestIncomplete,
  tracker,
  isPartDone,
  togglePart,
  toggleBookmark,
  updateText,
  openDay,
}: {
  day: CurriculumDay;
  earliestIncomplete: number;
  tracker: TrackerState;
  isPartDone: (dayId: number, part: TaskPart) => boolean;
  togglePart: (day: CurriculumDay, part: TaskPart) => void;
  toggleBookmark: (dayId: number) => void;
  updateText: (field: "notes" | "evidence", dayId: number, value: string) => void;
  openDay: (dayId: number) => void;
}) {
  const phase = phaseFor(day);
  const date = scheduledDate(tracker.startedOn, day.id);
  const completeCount = taskParts.filter((part) => isPartDone(day.id, part)).length;
  const taskCopy = [
    { id: "learn" as const, label: "Understand", title: day.title, body: `Build the mental model: ${day.focus}` },
    { id: "build" as const, label: "Build", title: "Practical application", body: day.task },
    { id: "prove" as const, label: "Prove", title: "Definition of done", body: day.evidence },
  ];

  return (
    <div className="view-wrap">
      <section className="mission-hero">
        <div className="hero-copy">
          <div className="hero-meta">
            <span style={{ background: phase.color }}>{phase.number}</span>
            DAY {String(day.id).padStart(3, "0")} · WEEK {String(day.week).padStart(2, "0")} · {formatMinutes(day.minutes)}
          </div>
          <h1>{day.title}</h1>
          <p>{day.focus}</p>
          <div className="hero-actions">
            {day.id !== earliestIncomplete && <button className="primary-button" onClick={() => openDay(earliestIncomplete)}>Continue day {earliestIncomplete}</button>}
            <button className="secondary-button" onClick={() => toggleBookmark(day.id)} aria-pressed={tracker.bookmarks.includes(day.id)}>
              {tracker.bookmarks.includes(day.id) ? "★ Important" : "☆ Mark important"}
            </button>
          </div>
        </div>
        <div className="day-gauge" aria-label={`${completeCount} of 3 tasks complete`}>
          <span>{completeCount}<small>/3</small></span>
          <p>proofs closed</p>
          <div className="gauge-marks" aria-hidden="true"><i /><i /><i /></div>
          <small>{date ? `Planned ${date}` : "Set a start date"}</small>
        </div>
      </section>

      <div className="today-grid">
        <section className="task-board" aria-labelledby="task-title">
          <div className="section-heading">
            <div><span className="eyebrow">TODAY’S WORK ORDER</span><h2 id="task-title">Learn it. Build it. Prove it.</h2></div>
            <span>{completeCount}/3 closed</span>
          </div>
          <div className="task-list">
            {taskCopy.map((task, index) => {
              const done = isPartDone(day.id, task.id);
              return (
                <label key={task.id} className={`task-row ${done ? "done" : ""}`}>
                  <input type="checkbox" checked={done} onChange={() => togglePart(day, task.id)} />
                  <span className="task-index">0{index + 1}</span>
                  <span className="check-box" aria-hidden="true">{done ? "✓" : ""}</span>
                  <span className="task-copy"><small>{task.label}</small><strong>{task.title}</strong><span>{task.body}</span></span>
                </label>
              );
            })}
          </div>
          <article className="lab-card">
            <span className="eyebrow">WEEKLY LAB // LIVE BUILD</span>
            <h3>{day.lab}</h3>
            <p>Keep a working baseline. Add one observable improvement today and record the failure that taught you the most.</p>
          </article>
          {day.checkpoint && (
            <article className="gate-card"><span>GATE</span><strong>{day.checkpoint}</strong></article>
          )}
          <div className="day-navigation">
            <button disabled={day.id === 1} onClick={() => openDay(day.id - 1)}>← Previous</button>
            <span>Day {day.id} of 180</span>
            <button disabled={day.id === 180} onClick={() => openDay(day.id + 1)}>Next →</button>
          </div>
        </section>

        <aside className="field-panel">
          <section>
            <span className="eyebrow">PRIMARY REFERENCE</span>
            <a className="resource-link" href={day.resource.url} target="_blank" rel="noreferrer">
              <span>↗</span><strong>{day.resource.label}</strong><small>Open authoritative source</small>
            </a>
          </section>
          <section>
            <label htmlFor="field-note"><span className="eyebrow">FIELD NOTE</span><small>Key idea, command, diagnosis, or follow-up</small></label>
            <textarea id="field-note" value={tracker.notes[String(day.id)] ?? ""} onChange={(event) => updateText("notes", day.id, event.target.value)} placeholder="What changed your mental model today?" />
          </section>
          <section>
            <label htmlFor="evidence-note"><span className="eyebrow">EVIDENCE LOCKER</span><small>Repository, demo, report, or decisive output</small></label>
            <textarea id="evidence-note" value={tracker.evidence[String(day.id)] ?? ""} onChange={(event) => updateText("evidence", day.id, event.target.value)} placeholder="Paste a link or describe the artifact…" />
          </section>
          <div className="autosave-line"><span className="status-dot" /> Auto-saved locally</div>
        </aside>
      </div>
    </div>
  );
}

function RoadmapView({
  days,
  query,
  setQuery,
  phaseFilter,
  setPhaseFilter,
  statusFilter,
  setStatusFilter,
  isDayDone,
  bookmarks,
  openDay,
  clearFilters,
}: {
  days: CurriculumDay[];
  query: string;
  setQuery: (query: string) => void;
  phaseFilter: string;
  setPhaseFilter: (phase: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  isDayDone: (dayId: number) => boolean;
  bookmarks: number[];
  openDay: (dayId: number) => void;
  clearFilters: () => void;
}) {
  const weekNumbers = Array.from(new Set(days.map((day) => day.week)));
  return (
    <div className="view-wrap">
      <section className="page-intro">
        <div><span className="eyebrow">180-DAY OPERATING PLAN</span><h1>Roadmap explorer</h1><p>Every week ends with runnable, measurable, or publishable evidence.</p></div>
        <div className="intro-stat"><strong>{days.length}</strong><span>days visible</span></div>
      </section>

      <section className="filter-deck" aria-label="Roadmap filters">
        <label><span className="sr-only">Search roadmap</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics, labs, or notes" /></label>
        <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)} aria-label="Filter by phase">
          <option value="all">All phases</option>
          {phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.number} · {phase.shortTitle}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="all">Any status</option>
          <option value="open">Open</option>
          <option value="complete">Complete</option>
        </select>
        <button onClick={clearFilters}>Clear</button>
      </section>

      {weekNumbers.length ? (
        <div className="week-stack">
          {weekNumbers.map((week) => {
            const weekDays = days.filter((day) => day.week === week);
            const sample = weekDays[0];
            const phase = phaseFor(sample);
            const allWeekDays = curriculumDays.filter((day) => day.week === week);
            const complete = allWeekDays.filter((day) => isDayDone(day.id)).length;
            return (
              <section className="week-card" key={week}>
                <header>
                  <div className="week-number" style={{ borderColor: phase.color }}><small>WK</small>{String(week).padStart(2, "0")}</div>
                  <div><span className="eyebrow">{phase.number} / {phase.shortTitle}</span><h2>{sample.focus.split(" · ")[0]}</h2><p>{sample.focus.split(" · ")[1]}</p></div>
                  <div className="week-complete"><strong>{complete}/{allWeekDays.length}</strong><span>days closed</span></div>
                </header>
                <div className="day-rows">
                  {weekDays.map((day) => (
                    <button className={`roadmap-day ${isDayDone(day.id) ? "done" : ""}`} key={day.id} onClick={() => openDay(day.id)}>
                      <span className="day-code">D{String(day.id).padStart(3, "0")}</span>
                      <span className="roadmap-status">{isDayDone(day.id) ? "✓ Complete" : "○ Open"}</span>
                      <strong>{day.title}</strong>
                      <small>{formatMinutes(day.minutes)} {bookmarks.includes(day.id) ? "· ★ Important" : ""}</small>
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><span>NO MATCH</span><h2>Nothing fits those filters.</h2><p>Clear the filters or search for a broader robotics skill.</p><button onClick={clearFilters}>Show all 180 days</button></div>
      )}
    </div>
  );
}

function BuildsView({ tracker, setTracker, openDay }: { tracker: TrackerState; setTracker: React.Dispatch<React.SetStateAction<TrackerState>>; openDay: (id: number) => void }) {
  const phaseGateDays = [28, 56, 84, 119, 147, 175];
  return (
    <div className="view-wrap">
      <section className="page-intro">
        <div><span className="eyebrow">PORTFOLIO PRODUCTION LINE</span><h1>Six builds. Six hiring signals.</h1><p>No certificate counts here. Close a gate with runnable behavior, metrics, and an honest failure story.</p></div>
        <div className="intro-stat"><strong>6</strong><span>proof gates</span></div>
      </section>
      <div className="build-grid">
        {projects.map((project, index) => {
          const phase = phases.find((item) => item.id === project.phaseId)!;
          const criteria = project.proof.split(", ");
          const checked = tracker.projectChecks[project.id] ?? criteria.map(() => false);
          const doneCount = checked.filter(Boolean).length;
          return (
            <article className="build-card" key={project.id}>
              <header><span style={{ background: phase.color }}>{phase.number}</span><small>GATE {index + 1}</small></header>
              <h2>{project.title}</h2>
              <p>{project.subtitle}</p>
              <div className="build-meter"><progress value={doneCount} max={criteria.length} /><span>{doneCount}/{criteria.length}</span></div>
              <div className="criteria-list">
                {criteria.map((criterion, criterionIndex) => (
                  <label key={criterion}>
                    <input
                      type="checkbox"
                      checked={Boolean(checked[criterionIndex])}
                      onChange={() => setTracker((previous) => {
                        const next = [...(previous.projectChecks[project.id] ?? criteria.map(() => false))];
                        next[criterionIndex] = !next[criterionIndex];
                        return { ...previous, projectChecks: { ...previous.projectChecks, [project.id]: next } };
                      })}
                    />
                    <span>{checked[criterionIndex] ? "✓" : ""}</span>{criterion}
                  </label>
                ))}
              </div>
              <button onClick={() => openDay(phaseGateDays[index])}>Open gate day →</button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function NotebookView({ tracker, openDay }: { tracker: TrackerState; openDay: (id: number) => void }) {
  const entries = curriculumDays
    .filter((day) => tracker.notes[String(day.id)] || tracker.evidence[String(day.id)] || tracker.bookmarks.includes(day.id))
    .sort((a, b) => b.id - a.id);
  return (
    <div className="view-wrap">
      <section className="page-intro">
        <div><span className="eyebrow">FIELD MEMORY</span><h1>Notebook & evidence locker</h1><p>Your important ideas, debugging lessons, artifacts, and follow-ups—attached to the day that created them.</p></div>
        <div className="intro-stat"><strong>{entries.length}</strong><span>captured days</span></div>
      </section>
      {entries.length ? (
        <div className="notebook-grid">
          {entries.map((day) => {
            const phase = phaseFor(day);
            return (
              <article className="note-card" key={day.id}>
                <header><span style={{ color: phase.color }}>D{String(day.id).padStart(3, "0")}</span>{tracker.bookmarks.includes(day.id) && <span>★ IMPORTANT</span>}</header>
                <h2>{day.title}</h2>
                {tracker.notes[String(day.id)] && <div><small>FIELD NOTE</small><p>{tracker.notes[String(day.id)]}</p></div>}
                {tracker.evidence[String(day.id)] && <div className="evidence-block"><small>EVIDENCE</small><p>{tracker.evidence[String(day.id)]}</p></div>}
                <button onClick={() => openDay(day.id)}>Open day →</button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><span>FIELD LOG EMPTY</span><h2>Your first useful failure belongs here.</h2><p>Open today’s work order, write a key idea or failure note, and mark important days for fast retrieval.</p><button onClick={() => openDay(tracker.selectedDay)}>Open current day</button></div>
      )}
    </div>
  );
}

function ProgressView({
  percent,
  completedDays,
  completedParts,
  totalParts,
  phaseStats,
  tracker,
  isDayDone,
}: {
  percent: number;
  completedDays: number;
  completedParts: number;
  totalParts: number;
  phaseStats: PhaseStat[];
  tracker: TrackerState;
  isDayDone: (dayId: number) => boolean;
}) {
  const plannedMinutes = curriculumDays.reduce((sum, day) => sum + day.minutes, 0);
  const closedMinutes = curriculumDays.filter((day) => isDayDone(day.id)).reduce((sum, day) => sum + day.minutes, 0);
  const completedProjects = projects.filter((project) => {
    const checks = tracker.projectChecks[project.id] ?? [];
    return checks.length && checks.every(Boolean);
  }).length;
  return (
    <div className="view-wrap">
      <section className="progress-hero">
        <div><span className="eyebrow">READINESS INSTRUMENT PANEL</span><h1>{percent}% mission complete</h1><p>Progress is derived from closed learning, build, and proof tasks—not an opaque score.</p></div>
        <div className="progress-numbers">
          <div><strong>{completedDays}</strong><span>/ 180 days</span></div>
          <div><strong>{completedParts}</strong><span>/ {totalParts} proofs</span></div>
          <div><strong>{Math.round(closedMinutes / 60)}</strong><span>/ {Math.round(plannedMinutes / 60)} hours</span></div>
          <div><strong>{completedProjects}</strong><span>/ 6 builds</span></div>
        </div>
      </section>

      <div className="analytics-grid">
        <section className="phase-panel">
          <div className="section-heading"><div><span className="eyebrow">PHASE TELEMETRY</span><h2>Coverage by system layer</h2></div></div>
          {phaseStats.map((phase) => (
            <div className="phase-row" key={phase.id}>
              <span className="phase-code" style={{ background: phase.color }}>{phase.number}</span>
              <div><strong>{phase.shortTitle}</strong><small>{phase.complete}/{phase.days} days</small><progress value={phase.complete} max={phase.days} /></div>
              <b>{phase.percent}%</b>
            </div>
          ))}
        </section>

        <section className="skill-panel">
          <div className="section-heading"><div><span className="eyebrow">JOB-READINESS MATRIX</span><h2>Evidence level by skill</h2></div></div>
          <div className="level-legend"><span>0 Not started</span><span>1 Understood</span><span>2 Built</span><span>3 Demonstrated</span></div>
          {readinessSkills.map((skill) => {
            const phasePoint = Math.max(1, Math.floor(skill.gateDay / 3));
            const understood = curriculumDays.slice(0, phasePoint).every((day) => tracker.completed[taskKey(day.id, "learn")]);
            const built = curriculumDays.slice(0, Math.max(1, skill.gateDay - 6)).some((day) => day.id >= skill.gateDay - 14 && tracker.completed[taskKey(day.id, "build")]);
            const demonstrated = isDayDone(skill.gateDay);
            const level = demonstrated ? 3 : built ? 2 : understood ? 1 : 0;
            return (
              <div className="skill-row" key={skill.id}>
                <strong>{skill.label}</strong>
                <div className="level-blocks" aria-label={`Level ${level} of 3`}>
                  {[1, 2, 3].map((point) => <i key={point} className={point <= level ? "on" : ""} />)}
                </div>
                <span>L{level}</span>
              </div>
            );
          })}
        </section>
      </div>

      <section className="role-ladder">
        <div><span className="eyebrow">APPLICATION LADDER</span><h2>Apply before day 180.</h2></div>
        <article><span>NOW → D30</span><h3>Robotics platform / backend</h3><p>Lead with distributed systems, telemetry, real-time data, edge/cloud, observability, mobile tooling.</p></article>
        <article><span>D60 → D120</span><h3>Robotics application / integration</h3><p>Add ROS 2, C++, simulation, sensor integration, field debugging, deployment evidence.</p></article>
        <article><span>D120 → D180</span><h3>Embodied AI / robot learning</h3><p>Add demonstrations, policy evaluation, agent recovery, and real-robot acceptance results.</p></article>
      </section>

      <section className="resource-vault">
        <div><span className="eyebrow">CURATED SOURCE VAULT</span><h2>Primary references only</h2></div>
        <div>{resources.map((resource, index) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><strong>{resource.label}</strong><b>↗</b></a>)}</div>
      </section>
    </div>
  );
}
