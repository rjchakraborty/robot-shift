"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  curriculumDays,
  phases,
  projects,
  type CurriculumDay,
} from "./curriculum";
import { LearningStudio } from "./learning-studio";
import { CareerView } from "./career-view";
import { logLessonViewEvent } from "./firebase-observability";
import { lessonPath } from "./seo";
import {
  MAX_ROBOT_SHIFT_BACKUP_BYTES,
  type TrackerStateV2,
} from "./storage-migrations";
import { ThemeControl } from "./theme-control";
import { TelemetryControl } from "./telemetry-control";
import { AccountControl } from "./auth/account-control";
import { useAuth } from "./auth/auth-context";
import { useCourseData } from "./data/course-data-context";

type View = "today" | "roadmap" | "roles" | "builds" | "notebook";

type TrackerState = TrackerStateV2;

const MAX_TEXT_LENGTH = 5_000;

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
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
  const { openAuth, user: authUser } = useAuth();
  const {
    busy: cloudBusy,
    dirty: cloudDirty,
    error: cloudError,
    exportCloudBackup,
    importCloudBackup,
    legacyBrowserCandidate,
    migrateLegacyBrowserData,
    ready: hydrated,
    reloadCloudData,
    resetCloudData,
    retryCloudSave,
    status: saveStatus,
    tracker,
    setTracker,
  } = useCourseData();
  const [view, setView] = useState<View>("today");
  const [query, setQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ dayId: number; nonce: number } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const storageError = operationError ?? cloudError;
  const persistedControlsDisabled = cloudBusy || !hydrated;

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

  useEffect(() => {
    if (!hydrated) return;
    void logLessonViewEvent({
      dayId: selectedDay.id,
      week: selectedDay.week,
      phaseId: selectedDay.phaseId,
      entrySurface: "course_home",
    });
  }, [
    hydrated,
    selectedDay.id,
    selectedDay.phaseId,
    selectedDay.week,
  ]);

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
    if (persistedControlsDisabled) return;
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
    if (persistedControlsDisabled) return;
    setTracker((previous) => ({
      ...previous,
      bookmarks: previous.bookmarks.includes(dayId)
        ? previous.bookmarks.filter((id) => id !== dayId)
        : [...previous.bookmarks, dayId],
    }));
  };

  const updateText = (field: "notes" | "evidence", dayId: number, value: string) => {
    if (persistedControlsDisabled) return;
    setTracker((previous) => ({
      ...previous,
      [field]: { ...previous[field], [String(dayId)]: value },
    }));
  };

  const exportProgress = async () => {
    try {
      setOperationError(null);
      const payload = await exportCloudBackup(window.location.origin);
      const url = URL.createObjectURL(
        new Blob([payload], { type: "application/json" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `robot-shift-complete-${localDate()}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStorageNotice("Complete Firestore backup exported.");
      setAnnouncement("Complete Firestore backup exported.");
    } catch {
      setOperationError(
        "Backup export failed. Sign in, verify your email, and wait for Firestore to finish loading.",
      );
      setAnnouncement("Backup export failed.");
    }
  };

  const importProgress = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > MAX_ROBOT_SHIFT_BACKUP_BYTES) {
        throw new Error("too-large");
      }
      const raw = await file.text();
      setOperationError(null);
      const message = await importCloudBackup(raw);
      setStorageNotice(message);
      setAnnouncement(message);
    } catch {
      setOperationError(
        "Import rejected. Use a valid Robot/Shift backup under 5 MB and a verified account.",
      );
      setAnnouncement(
        "Firestore backup import rejected.",
      );
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const resetProgress = async () => {
    try {
      setOperationError(null);
      await resetCloudData();
      setShowReset(false);
      setStorageNotice("A clean Firestore dataset is now active.");
      setAnnouncement("Cloud course data reset.");
    } catch {
      setShowReset(false);
      setOperationError(
        "Reset confirmation failed. Reload Firestore before editing because the server result may be uncertain.",
      );
      setAnnouncement("Cloud data reset failed.");
    }
  };

  const migrateBrowserData = async () => {
    try {
      setOperationError(null);
      const result = await migrateLegacyBrowserData();
      if (result === "retained") {
        setStorageNotice(
          "Existing Firestore data was kept. Browser data remains untouched.",
        );
        setAnnouncement("Existing cloud data kept; browser data preserved.");
        return;
      }
      setStorageNotice("Legacy browser data is now secured in Firestore.");
      setAnnouncement("Browser data migrated to Firestore.");
    } catch {
      setOperationError(
        "Browser migration failed. The local source was preserved for retry.",
      );
      setAnnouncement("Browser data migration failed.");
    }
  };

  const retrySave = async () => {
    try {
      setOperationError(null);
      await retryCloudSave();
      setStorageNotice("Pending changes saved to Cloud Firestore.");
      setAnnouncement("Pending changes saved.");
    } catch {
      setOperationError(
        "Cloud save retry failed. Changes remain in this tab; stay signed in and retry.",
      );
      setAnnouncement("Cloud save retry failed.");
    }
  };

  const reloadData = async () => {
    try {
      setOperationError(null);
      await reloadCloudData();
      setStorageNotice("Firestore data reloaded.");
      setAnnouncement("Firestore data reloaded.");
    } catch {
      setOperationError(
        "Firestore reload failed. Persisted controls remain locked.",
      );
      setAnnouncement("Firestore reload failed.");
    }
  };

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
        <Link className="rail-privacy-link" href="/privacy/">
          Privacy & telemetry
        </Link>
      </aside>

      <div className="work-area" aria-hidden={showReset ? true : undefined}>
        <header className="command-bar">
          <div>
            <strong>{currentPhase.number} · {currentPhase.shortTitle}</strong>
          </div>
          <div className="command-actions">
            <AccountControl />
            <button className="utility-button" onClick={() => setShowSettings((open) => !open)} aria-expanded={showSettings}>
              Settings
            </button>
          </div>
        </header>

        {showSettings && (
          <section className="settings-drawer" aria-label="Curriculum controls">
            <ThemeControl />
            <TelemetryControl />
            <div>
              <label htmlFor="start-date">Start date</label>
              <input
                id="start-date"
                type="date"
                value={tracker.startedOn}
                disabled={persistedControlsDisabled}
                onChange={(event) => setTracker((p) => ({
                  ...p,
                  startedOn: event.target.value,
                }))}
              />
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
                disabled={persistedControlsDisabled}
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
            {legacyBrowserCandidate ? (
              <div className="legacy-migration-panel">
                <strong>Move earlier browser data to Firestore</strong>
                <p>
                  Found {legacyBrowserCandidate.completedItems} completed items,{" "}
                  {legacyBrowserCandidate.notes} note days, and{" "}
                  {legacyBrowserCandidate.tutorMessages} tutor messages.
                  Nothing is assigned to this account until you confirm.
                </p>
                {legacyBrowserCandidate.unassignedTutor ? (
                  <p>
                    This includes tutor history created before accounts existed.
                    Confirm only if this was your browser history.
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={persistedControlsDisabled}
                  onClick={() => void migrateBrowserData()}
                >
                  {cloudBusy ? "Moving securely…" : "Move data to my account"}
                </button>
              </div>
            ) : null}
            <div className="settings-actions">
              <button
                disabled={persistedControlsDisabled || !authUser?.emailVerified}
                onClick={() => void exportProgress()}
              >
                Export backup
              </button>
              <label
                className="button-label"
                aria-disabled={
                  persistedControlsDisabled || !authUser?.emailVerified
                }
              >
                Import backup
                <input
                  ref={importRef}
                  className="sr-only"
                  type="file"
                  accept="application/json"
                  disabled={
                    persistedControlsDisabled || !authUser?.emailVerified
                  }
                  onChange={(event) => void importProgress(event.target.files?.[0])}
                />
              </label>
              <button
                ref={resetTriggerRef}
                className="danger-link"
                disabled={persistedControlsDisabled || !authUser?.emailVerified}
                onClick={() => setShowReset(true)}
              >
                Reset
              </button>
              {cloudDirty ? (
                <button
                  type="button"
                  disabled={persistedControlsDisabled}
                  onClick={() => void retrySave()}
                >
                  Retry cloud save
                </button>
              ) : null}
              {!hydrated && authUser?.emailVerified && storageError ? (
                <button
                  type="button"
                  disabled={cloudBusy}
                  onClick={() => void reloadData()}
                >
                  Reload cloud data
                </button>
              ) : null}
              {!authUser ? (
                <button type="button" onClick={() => openAuth("sign-in")}>
                  Sign in to save
                </button>
              ) : null}
              <Link className="settings-link" href="/privacy/">
                Privacy
              </Link>
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
              persistenceMessage={storageError ?? storageNotice ?? saveStatus}
              persistenceError={Boolean(storageError)}
              persistedControlsDisabled={persistedControlsDisabled}
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
              persistedControlsDisabled={persistedControlsDisabled}
              clearFilters={() => { setQuery(""); setPhaseFilter("all"); }}
            />
          )}

          {view === "roles" && (
            <CareerView
              onOpenDay={(dayId) => openDay(dayId)}
            />
          )}

          {view === "builds" && (
            <BuildsView
              openDay={openDay}
              persistedControlsDisabled={persistedControlsDisabled}
            />
          )}

          {view === "notebook" && (
            <NotebookView
              tracker={tracker}
              openDay={openDay}
              persistedControlsDisabled={persistedControlsDisabled}
            />
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
            <span className="eyebrow">DESTRUCTIVE CLOUD ACTION</span>
            <h2 id="reset-title">Reset saved Firestore data?</h2>
            <p id="reset-description">
              This activates a clean dataset for notes, evidence, bookmarks,
              project checks, and tutor history. Export first if you may need
              the current data.
            </p>
            <div>
              <button ref={resetCancelRef} onClick={() => setShowReset(false)}>Keep data</button>
              <button
                className="danger-button"
                disabled={cloudBusy}
                onClick={() => void resetProgress()}
              >
                Reset everything
              </button>
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
  persistedControlsDisabled,
}: {
  day: CurriculumDay;
  tracker: TrackerState;
  toggleBookmark: (dayId: number) => void;
  updateText: (field: "notes" | "evidence", dayId: number, value: string) => void;
  openDay: (dayId: number) => void;
  persistenceMessage: string;
  persistenceError: boolean;
  persistedControlsDisabled: boolean;
}) {
  const phase = phaseFor(day);
  const date = scheduledDate(tracker.startedOn, day.id, tracker.weeklyHours);

  return (
    <div className="view-wrap">
      <section id={`mission-hero-${day.id}`} className="mission-hero" tabIndex={-1}>
        <div className="hero-copy">
          <div className="viewing-state">
            <span>Day {day.id} of 180</span>
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

      <div className="lesson-tools">
        <details className="study-notes">
          <summary>Notes and evidence</summary>
          <div className="field-panel">
            <section>
              <label className="bookmark-checkbox">
                <input
                  type="checkbox"
                  checked={tracker.bookmarks.includes(day.id)}
                  disabled={persistedControlsDisabled}
                  onChange={() => toggleBookmark(day.id)}
                />
                Keep this day in Notes
              </label>
            </section>
            <section>
              <label htmlFor="field-note"><strong>Notes</strong></label>
              <textarea id="field-note" maxLength={MAX_TEXT_LENGTH} value={tracker.notes[String(day.id)] ?? ""} disabled={persistedControlsDisabled} onChange={(event) => updateText("notes", day.id, event.target.value)} placeholder="Key idea, command, or question…" />
            </section>
            <section>
              <label htmlFor="evidence-note"><strong>Evidence</strong></label>
              <textarea id="evidence-note" maxLength={MAX_TEXT_LENGTH} value={tracker.evidence[String(day.id)] ?? ""} disabled={persistedControlsDisabled} onChange={(event) => updateText("evidence", day.id, event.target.value)} placeholder="Paste a link or describe the artifact…" />
            </section>
            <div className={`autosave-line ${persistenceError ? "error" : ""}`} role="status">
              {persistenceMessage}
            </div>
          </div>
        </details>

        <div className="day-navigation">
          <button disabled={persistedControlsDisabled || day.id === 1} onClick={() => openDay(day.id - 1)}>← Previous day</button>
          <span>Day {day.id} of 180</span>
          <button disabled={persistedControlsDisabled || day.id === 180} onClick={() => openDay(day.id + 1)}>Next day →</button>
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
  persistedControlsDisabled,
}: {
  days: CurriculumDay[];
  query: string;
  setQuery: (query: string) => void;
  phaseFilter: string;
  setPhaseFilter: (phase: string) => void;
  bookmarks: number[];
  openDay: (dayId: number) => void;
  clearFilters: () => void;
  persistedControlsDisabled: boolean;
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
        {query || phaseFilter !== "all"
          ? <button onClick={clearFilters}>Clear</button>
          : null}
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
                    <a
                      className="roadmap-day"
                      href={lessonPath(day)}
                      aria-disabled={persistedControlsDisabled}
                      tabIndex={persistedControlsDisabled ? -1 : undefined}
                      key={day.id}
                      onClick={(event) => {
                        event.preventDefault();
                        if (persistedControlsDisabled) return;
                        openDay(day.id);
                      }}
                    >
                      <span className="day-code">Day {day.id}</span>
                      <strong>{day.title}</strong>
                      <small>{formatMinutes(day.minutes)} {bookmarks.includes(day.id) ? "· ★ Important" : ""}</small>
                      <span aria-hidden="true">→</span>
                    </a>
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

function BuildsView({
  openDay,
  persistedControlsDisabled,
}: {
  openDay: (id: number) => void;
  persistedControlsDisabled: boolean;
}) {
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
              <button disabled={persistedControlsDisabled} onClick={() => openDay(phaseGateDays[index])}>Open project lesson →</button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function NotebookView({
  tracker,
  openDay,
  persistedControlsDisabled,
}: {
  tracker: TrackerState;
  openDay: (id: number) => void;
  persistedControlsDisabled: boolean;
}) {
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
                <button disabled={persistedControlsDisabled} onClick={() => openDay(day.id)}>Open day →</button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><h2>No notes or evidence yet.</h2><button disabled={persistedControlsDisabled} onClick={() => openDay(tracker.selectedDay)}>Open current day</button></div>
      )}
    </div>
  );
}
