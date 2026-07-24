"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  curriculumDays,
  phases,
  projects,
  type CurriculumDay,
} from "./curriculum";
import { LearningStudio } from "./learning-studio";
import { CareerView } from "./career-view";
import {
  archiveLegacyPayload,
  CURRICULUM_REVISION,
  LEGACY_TRACKER_ARCHIVE_KEY,
  LEGACY_TRACKER_STORAGE_KEY,
  migrateLegacyTrackerState,
  parseTrackerBackup,
  parseTrackerStateV2,
  TRACKER_STORAGE_KEY,
  type TrackerStateV2,
} from "./storage-migrations";
import { ThemeControl } from "./theme-control";

type View = "today" | "roadmap" | "roles" | "builds" | "notebook";

type TrackerState = TrackerStateV2;

const MAX_TEXT_LENGTH = 5_000;
const MAX_BACKUP_BYTES = 5_000_000;

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const defaultState: TrackerState = {
  schemaVersion: 2,
  curriculumRevision: CURRICULUM_REVISION,
  completed: {},
  bookmarks: [],
  notes: {},
  evidence: {},
  projectChecks: {},
  startedOn: "",
  weeklyHours: 10,
  selectedDay: 1,
};

function phaseFor(day: CurriculumDay) {
  return phases.find((phase) => phase.id === day.phaseId)!;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function scheduledDate(startedOn: string, dayId: number, weeklyHours: number) {
  if (!isValidDateString(startedOn) || !startedOn) return null;
  const minutesBeforeDay = curriculumDays
    .slice(0, Math.max(0, dayId - 1))
    .reduce((sum, day) => sum + day.minutes, 0);
  const dailyCapacity = (weeklyHours * 60) / 7;
  const calendarOffset = Math.floor(minutesBeforeDay / dailyCapacity);
  const date = new Date(`${startedOn}T12:00:00`);
  date.setDate(date.getDate() + calendarOffset);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function isValidDateString(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const navigation: { id: View; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "roadmap", label: "Curriculum" },
  { id: "roles", label: "Roles" },
  { id: "builds", label: "Projects" },
  { id: "notebook", label: "Notes" },
];

export default function Home() {
  const [tracker, setTracker] = useState<TrackerState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("today");
  const [query, setQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [saveStatus, setSaveStatus] = useState("Ready");
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ dayId: number; nonce: number } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const skipNextSaveRef = useRef(false);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let loaded: TrackerState | null = null;
      try {
        const currentRaw = window.localStorage.getItem(TRACKER_STORAGE_KEY);
        loaded = currentRaw ? parseTrackerStateV2(currentRaw) : null;
        if (currentRaw && !loaded) {
          skipNextSaveRef.current = true;
          setStorageError("Stored version 2 course data was invalid and was not overwritten. Import a valid backup or reset.");
        } else if (!currentRaw) {
          const legacyRaw = window.localStorage.getItem(LEGACY_TRACKER_STORAGE_KEY);
          if (legacyRaw) {
            archiveLegacyPayload(
              window.localStorage,
              LEGACY_TRACKER_ARCHIVE_KEY,
              legacyRaw,
            );
            const migration = migrateLegacyTrackerState(legacyRaw);
            if (migration) {
              loaded = migration.state;
              const archived = [
                migration.archivedFoundationDays.length > 0 ? "revised Days 1–14" : "",
                migration.archivedFrameLab ? "the old FrameLab checklist" : "",
              ].filter(Boolean).join(" and ");
              setStorageNotice(
                archived
                  ? `Version 1 records for ${archived} were archived in this browser. Unchanged later-course work was migrated to version 2.`
                  : "Version 1 course data was archived and migrated to version 2.",
              );
            } else {
              skipNextSaveRef.current = true;
              setStorageError("Stored version 1 course data was archived but could not be migrated. Import a valid backup or reset.");
            }
          }
        }
      } catch {
        skipNextSaveRef.current = true;
        setStorageError("Local saving is unavailable in this browser. Export backups to protect your work.");
      }
      const initial = loaded ?? defaultState;
      setTracker({ ...initial, startedOn: initial.startedOn || localDate() });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    let timer: number;
    try {
      window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(tracker));
      timer = window.setTimeout(() => {
        setSaveStatus("Saved on this device");
        setStorageError(null);
      }, 0);
    } catch {
      timer = window.setTimeout(() => {
        setSaveStatus("Not saved");
        setStorageError("Not saved: browser storage is unavailable or full. Export a backup now.");
      }, 0);
    }
    return () => window.clearTimeout(timer);
  }, [tracker, hydrated]);

  useEffect(() => {
    if (!showReset) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : resetTriggerRef.current;
    const focusTimer = window.setTimeout(() => resetCancelRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowReset(false);
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = resetDialogRef.current;
      const focusable = dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"))
        : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [showReset]);
  const selectedDay = curriculumDays.find((day) => day.id === tracker.selectedDay) ?? curriculumDays[0];
  const currentPhase = phaseFor(selectedDay);

  const filteredDays = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return curriculumDays.filter((day) => {
      const matchesPhase = phaseFilter === "all" || day.phaseId === phaseFilter;
      const note = tracker.notes[String(day.id)] ?? "";
      const matchesQuery = !normalized || `${day.title} ${day.focus} ${day.task} ${day.lab} ${note}`.toLowerCase().includes(normalized);
      return matchesPhase && matchesQuery;
    });
  }, [query, phaseFilter, tracker.notes]);

  const changeView = (nextView: View, focusMain = true) => {
    setView(nextView);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      if (focusMain) document.getElementById("main-content")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }, 0);
  };

  const openDay = (dayId: number) => {
    setTracker((previous) => ({ ...previous, selectedDay: dayId }));
    setView("today");
    setFocusRequest({ dayId, nonce: Date.now() });
  };

  useEffect(() => {
    if (!focusRequest || view !== "today" || tracker.selectedDay !== focusRequest.dayId) return;

    const timer = window.setTimeout(() => {
      const element = document.getElementById(`mission-hero-${focusRequest.dayId}`);
      element?.focus();
      element?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      setFocusRequest(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [focusRequest, tracker.selectedDay, view]);

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
    let archivedVersion1: unknown;
    try {
      const legacyRaw = window.localStorage.getItem(LEGACY_TRACKER_ARCHIVE_KEY)
        ?? window.localStorage.getItem(LEGACY_TRACKER_STORAGE_KEY);
      archivedVersion1 = legacyRaw ? JSON.parse(legacyRaw) as unknown : undefined;
    } catch {
      archivedVersion1 = undefined;
    }
    const payload = JSON.stringify({
      ...tracker,
      exportedAt: new Date().toISOString(),
      ...(archivedVersion1 === undefined ? {} : { archivedVersion1 }),
    }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `robot-shift-course-${localDate()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setAnnouncement("Course backup exported.");
  };

  const importProgress = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("too-large");
      const raw = await file.text();
      const parsed = parseTrackerBackup(raw);
      if (!parsed) throw new Error("invalid");
      if (parsed.migrated) {
        try {
          archiveLegacyPayload(
            window.localStorage,
            LEGACY_TRACKER_ARCHIVE_KEY,
            raw,
          );
        } catch {
          // The selected version 1 file remains the source archive if browser storage is full.
        }
        setStorageNotice(
          "Imported version 1 backup was archived. Revised Days 1–14 and the old FrameLab checklist restart cleanly; unchanged later-course work was migrated.",
        );
      }
      setTracker({
        ...parsed.state,
        startedOn: parsed.state.startedOn || localDate(),
      });
      setAnnouncement(
        parsed.migrated
          ? "Version 1 backup safely migrated to version 2."
          : "Course backup imported.",
      );
    } catch {
      setAnnouncement("Import rejected. Choose a valid Robot/Shift version 1 or 2 backup under 5 MB.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const resetProgress = () => {
    const clean = { ...defaultState, startedOn: localDate() };
    setTracker(clean);
    setShowReset(false);
    setAnnouncement("All locally saved course data was reset.");
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
      <aside className="side-rail" aria-label="Primary" aria-hidden={showReset ? true : undefined}>
        <div className="brand-block">
          <div className="brand-line">Robot/Shift</div>
          <p>Practical robotics curriculum</p>
        </div>

        <nav className="rail-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => changeView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="work-area" aria-hidden={showReset ? true : undefined}>
        <header className="command-bar">
          <div>
            <strong>{currentPhase.number} · {currentPhase.shortTitle}</strong>
          </div>
          <div className="command-actions">
            <button className="utility-button" onClick={() => setShowSettings((open) => !open)} aria-expanded={showSettings}>
              Settings
            </button>
          </div>
        </header>

        {showSettings && (
          <section className="settings-drawer" aria-label="Curriculum controls">
            <ThemeControl />
            <div>
              <label htmlFor="start-date">Start date</label>
              <input id="start-date" type="date" value={tracker.startedOn} onChange={(event) => setTracker((p) => ({ ...p, startedOn: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="weekly-hours">Weekly learning capacity</label>
              <input
                id="weekly-hours"
                type="number"
                min="4"
                max="30"
                step="1"
                value={tracker.weeklyHours}
                aria-describedby="weekly-hours-help"
                onChange={(event) => {
                  const value = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(value)) {
                    setTracker((previous) => ({ ...previous, weeklyHours: Math.min(30, Math.max(4, Math.round(value))) }));
                  }
                }}
              />
              <small id="weekly-hours-help">Reflows planned dates at this weekly pace.</small>
            </div>
            <div className="settings-actions">
              <button onClick={exportProgress}>Export backup</button>
              <label className="button-label">Import backup<input ref={importRef} className="sr-only" type="file" accept="application/json" onChange={(event) => importProgress(event.target.files?.[0])} /></label>
              <button ref={resetTriggerRef} className="danger-link" onClick={() => setShowReset(true)}>Reset</button>
            </div>
            <small className={storageError ? "storage-error" : ""} role="status">
              {storageError ?? storageNotice ?? saveStatus}
            </small>
          </section>
        )}

        <main id="main-content" tabIndex={-1}>
          {view === "today" && (
            <TodayView
              day={selectedDay}
              tracker={tracker}
              toggleBookmark={toggleBookmark}
              updateText={updateText}
              openDay={openDay}
              persistenceMessage={storageError ?? storageNotice ?? "Auto-saved locally"}
              persistenceError={Boolean(storageError)}
            />
          )}

          {view === "roadmap" && (
            <RoadmapView
              days={filteredDays}
              query={query}
              setQuery={setQuery}
              phaseFilter={phaseFilter}
              setPhaseFilter={setPhaseFilter}
              bookmarks={tracker.bookmarks}
              openDay={openDay}
              clearFilters={() => { setQuery(""); setPhaseFilter("all"); }}
            />
          )}

          {view === "roles" && (
            <CareerView
              onOpenDay={(dayId) => openDay(dayId)}
            />
          )}

          {view === "builds" && (
            <BuildsView openDay={openDay} />
          )}

          {view === "notebook" && (
            <NotebookView tracker={tracker} openDay={openDay} />
          )}

        </main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation" aria-hidden={showReset ? true : undefined}>
        {navigation.map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => changeView(item.id)} aria-current={view === item.id ? "page" : undefined}>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sr-only" aria-live="polite">{announcement}</div>

      {showReset && (
        <div className="modal-backdrop" role="presentation">
          <div ref={resetDialogRef} className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description">
            <span className="eyebrow">DESTRUCTIVE LOCAL ACTION</span>
            <h2 id="reset-title">Reset saved course data?</h2>
            <p id="reset-description">This removes notes, evidence, bookmarks, and legacy completion records from this browser. Export first if you may need them.</p>
            <div>
              <button ref={resetCancelRef} onClick={() => setShowReset(false)}>Keep data</button>
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
  tracker,
  toggleBookmark,
  updateText,
  openDay,
  persistenceMessage,
  persistenceError,
}: {
  day: CurriculumDay;
  tracker: TrackerState;
  toggleBookmark: (dayId: number) => void;
  updateText: (field: "notes" | "evidence", dayId: number, value: string) => void;
  openDay: (dayId: number) => void;
  persistenceMessage: string;
  persistenceError: boolean;
}) {
  const phase = phaseFor(day);
  const date = scheduledDate(tracker.startedOn, day.id, tracker.weeklyHours);

  return (
    <div className="view-wrap">
      <section id={`mission-hero-${day.id}`} className="mission-hero" tabIndex={-1}>
        <div className="hero-copy">
          <div className="viewing-state">
            <span>Day {day.id} of 180</span>
            <button className="bookmark-inline" onClick={() => toggleBookmark(day.id)} aria-pressed={tracker.bookmarks.includes(day.id)}>
              <span aria-hidden="true">{tracker.bookmarks.includes(day.id) ? "★" : "☆"}</span>
              <span className="bookmark-label">{tracker.bookmarks.includes(day.id) ? "Important" : "Mark important"}</span>
            </button>
          </div>
          <div className="hero-meta">
            <span>{phase.number}</span>
            {phase.shortTitle} · Week {day.week} · {formatMinutes(day.minutes)}
            {date ? ` · ${date}` : ""}
          </div>
          <h1>{day.title}</h1>
          <p>{day.focus}</p>
        </div>
      </section>

      <LearningStudio day={day} />

      <div className="today-grid">
        <section id="practical-task" className="task-board" aria-labelledby="task-title">
          <div className="section-heading">
            <div><h2 id="task-title">Practical task</h2></div>
          </div>
          <article className="lab-card">
            <h3>{day.lab}</h3>
          </article>
          <article className="proof-target-card">
            <strong>What good work looks like</strong>
            <p>{day.evidence}</p>
          </article>
          {day.checkpoint && (
            <article className="gate-card"><span>GATE</span><strong>{day.checkpoint}</strong></article>
          )}
        </section>

        <details className="study-notes">
          <summary>Notes, evidence, and source</summary>
          <div className="field-panel">
            <section>
              <strong>Source</strong>
              <a className="resource-link" href={day.resource.url} target="_blank" rel="noreferrer">
                <span>↗</span><strong>{day.resource.label}</strong>
              </a>
            </section>
            <section>
              <label htmlFor="field-note"><strong>Notes</strong></label>
              <textarea id="field-note" maxLength={MAX_TEXT_LENGTH} value={tracker.notes[String(day.id)] ?? ""} onChange={(event) => updateText("notes", day.id, event.target.value)} placeholder="Key idea, command, or question…" />
            </section>
            <section>
              <label htmlFor="evidence-note"><strong>Evidence</strong></label>
              <textarea id="evidence-note" maxLength={MAX_TEXT_LENGTH} value={tracker.evidence[String(day.id)] ?? ""} onChange={(event) => updateText("evidence", day.id, event.target.value)} placeholder="Paste a link or describe the artifact…" />
            </section>
            <div className={`autosave-line ${persistenceError ? "error" : ""}`} role="status">
              {persistenceMessage}
            </div>
          </div>
        </details>

        <div className="day-navigation">
          <button disabled={day.id === 1} onClick={() => openDay(day.id - 1)}>← Previous day</button>
          <span>Day {day.id} of 180</span>
          <button disabled={day.id === 180} onClick={() => openDay(day.id + 1)}>Next day →</button>
        </div>
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
  bookmarks,
  openDay,
  clearFilters,
}: {
  days: CurriculumDay[];
  query: string;
  setQuery: (query: string) => void;
  phaseFilter: string;
  setPhaseFilter: (phase: string) => void;
  bookmarks: number[];
  openDay: (dayId: number) => void;
  clearFilters: () => void;
}) {
  const weekNumbers = Array.from(new Set(days.map((day) => day.week)));
  return (
    <div className="view-wrap">
      <section className="page-intro">
        <div><h1>Curriculum</h1><p>A focused 180-day path from software engineering to practical robotics.</p></div>
      </section>

      <section className="filter-deck" aria-label="Curriculum filters">
        <label><span className="sr-only">Search curriculum</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics, labs, or notes…" /></label>
        <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)} aria-label="Filter by phase">
          <option value="all">All phases</option>
          {phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.number} · {phase.shortTitle}</option>)}
        </select>
        <button onClick={clearFilters}>Clear</button>
      </section>

      {weekNumbers.length ? (
        <div className="week-stack">
          {weekNumbers.map((week) => {
            const weekDays = days.filter((day) => day.week === week);
            const sample = weekDays[0];
            const phase = phaseFor(sample);
            return (
              <section className="week-card" key={week}>
                <header>
                  <div className="week-number">Week {String(week).padStart(2, "0")}</div>
                  <div><span className="eyebrow">{phase.number} / {phase.shortTitle}</span><h2>{sample.focus.split(" · ")[0]}</h2><p>{sample.focus.split(" · ")[1]}</p></div>
                </header>
                <div className="day-rows">
                  {weekDays.map((day) => (
                    <button className="roadmap-day" key={day.id} onClick={() => openDay(day.id)}>
                      <span className="day-code">Day {day.id}</span>
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

function BuildsView({ openDay }: { openDay: (id: number) => void }) {
  const phaseGateDays = [28, 56, 84, 119, 147, 175];
  return (
    <div className="view-wrap">
      <section className="page-intro">
        <div><h1>Portfolio projects</h1><p>Six projects with measurable completion criteria.</p></div>
      </section>
      <div className="build-grid">
        {projects.map((project, index) => {
          const phase = phases.find((item) => item.id === project.phaseId)!;
          const criteria = project.proof.split(", ");
          return (
            <article className="build-card" key={project.id}>
              <header><span>{phase.number}</span><small>PROJECT {index + 1}</small></header>
              <h2>{project.title}</h2>
              <p>{project.subtitle}</p>
              <strong className="criteria-heading">Project proof</strong>
              <ul className="criteria-list">
                {criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
              </ul>
              <button onClick={() => openDay(phaseGateDays[index])}>Open project lesson →</button>
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
        <div><h1>Notes and evidence</h1><p>{entries.length} days captured.</p></div>
      </section>
      {entries.length ? (
        <div className="notebook-grid">
          {entries.map((day) => {
            const phase = phaseFor(day);
            return (
              <article className="note-card" key={day.id}>
                <header><span>{phase.shortTitle} · Day {day.id}</span>{tracker.bookmarks.includes(day.id) && <span>★ Important</span>}</header>
                <h2>{day.title}</h2>
                {tracker.notes[String(day.id)] && <div><small>FIELD NOTE</small><p>{tracker.notes[String(day.id)]}</p></div>}
                {tracker.evidence[String(day.id)] && <div className="evidence-block"><small>EVIDENCE</small><p>{tracker.evidence[String(day.id)]}</p></div>}
                <button onClick={() => openDay(day.id)}>Open day →</button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><h2>No notes or evidence yet.</h2><button onClick={() => openDay(tracker.selectedDay)}>Open current day</button></div>
      )}
    </div>
  );
}
