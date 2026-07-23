"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  curriculumDays,
  phases,
  projects,
  readinessSkills,
  resources,
  type CurriculumDay,
  type Phase,
} from "./curriculum";
import { LearningStudio } from "./learning-studio";
import {
  deriveMissionProgress,
  MISSION_TASK_LABELS,
  MISSION_TASK_PARTS,
  MISSION_TASK_XP,
  type MissionProgress,
  type MissionTaskPart,
} from "./mission-progress";
import { CareerView } from "./career-view";
import { ThemeControl } from "./theme-control";

type View = "today" | "roadmap" | "roles" | "builds" | "notebook" | "progress";
type TaskPart = MissionTaskPart;
type FocusTarget = "top" | "visual" | "practice" | "evidence";
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

const taskParts: readonly TaskPart[] = MISSION_TASK_PARTS;
const STORAGE_KEY = "robot-shift-tracker-v1";
const MAX_TEXT_LENGTH = 5_000;
const MAX_BACKUP_BYTES = 5_000_000;
const curriculumDayIds = new Set(curriculumDays.map((day) => day.id));
const projectChecklistSizes = new Map(
  projects.map((project) => [project.id, project.proof.split(", ").length]),
);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidDateString(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function readCompleted(value: unknown): Record<string, boolean> | null {
  if (!isRecord(value)) return null;
  const completed: Record<string, boolean> = {};
  for (const [key, done] of Object.entries(value)) {
    const [dayText, part, extra] = key.split(":");
    const dayId = Number(dayText);
    if (
      extra !== undefined ||
      !curriculumDayIds.has(dayId) ||
      !taskParts.includes(part as TaskPart) ||
      typeof done !== "boolean"
    ) return null;
    completed[key] = done;
  }
  return completed;
}

function readTextEntries(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  const entries: Record<string, string> = {};
  for (const [key, text] of Object.entries(value)) {
    const dayId = Number(key);
    if (
      String(dayId) !== key ||
      !curriculumDayIds.has(dayId) ||
      typeof text !== "string" ||
      text.length > MAX_TEXT_LENGTH
    ) return null;
    entries[key] = text;
  }
  return entries;
}

function readProjectChecks(value: unknown): Record<string, boolean[]> | null {
  if (!isRecord(value)) return null;
  const checks: Record<string, boolean[]> = {};
  for (const [projectId, projectChecks] of Object.entries(value)) {
    const expectedSize = projectChecklistSizes.get(projectId);
    if (
      expectedSize === undefined ||
      !Array.isArray(projectChecks) ||
      projectChecks.length !== expectedSize ||
      projectChecks.some((checked) => typeof checked !== "boolean")
    ) return null;
    checks[projectId] = [...projectChecks];
  }
  return checks;
}

function parseTrackerState(raw: string): TrackerState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== 1) return null;

    const completed = readCompleted(parsed.completed);
    const notes = readTextEntries(parsed.notes);
    const evidence = readTextEntries(parsed.evidence);
    const projectChecks = readProjectChecks(parsed.projectChecks);
    const bookmarks = parsed.bookmarks;
    if (
      completed === null ||
      notes === null ||
      evidence === null ||
      projectChecks === null ||
      !Array.isArray(bookmarks) ||
      bookmarks.some((dayId) => !Number.isInteger(dayId) || !curriculumDayIds.has(dayId)) ||
      new Set(bookmarks).size !== bookmarks.length ||
      !isValidDateString(parsed.startedOn) ||
      !Number.isInteger(parsed.weeklyHours) ||
      (parsed.weeklyHours as number) < 4 ||
      (parsed.weeklyHours as number) > 30 ||
      !Number.isInteger(parsed.selectedDay) ||
      !curriculumDayIds.has(parsed.selectedDay as number)
    ) return null;

    return {
      schemaVersion: 1,
      completed,
      bookmarks: [...bookmarks] as number[],
      notes,
      evidence,
      projectChecks,
      startedOn: parsed.startedOn,
      weeklyHours: parsed.weeklyHours as number,
      selectedDay: parsed.selectedDay as number,
    };
  } catch {
    return null;
  }
}

const navigation: { id: View; label: string; mark: string }[] = [
  { id: "today", label: "Today", mark: "01" },
  { id: "roadmap", label: "Roadmap", mark: "02" },
  { id: "roles", label: "Roles", mark: "03" },
  { id: "builds", label: "Builds", mark: "04" },
  { id: "notebook", label: "Notebook", mark: "05" },
  { id: "progress", label: "Progress", mark: "06" },
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
  const [storageError, setStorageError] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ dayId: number; target: FocusTarget; nonce: number } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const skipNextSaveRef = useRef(false);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let loaded: TrackerState | null = null;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        loaded = raw ? parseTrackerState(raw) : null;
        if (raw && !loaded) {
          skipNextSaveRef.current = true;
          setStorageError("Stored progress was invalid and was not overwritten. Import a valid backup or reset.");
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
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

  const isPartDone = useCallback(
    (dayId: number, part: TaskPart) => (
      Boolean(tracker.completed[taskKey(dayId, part)])
      && (part !== "prove" || Boolean((tracker.evidence[String(dayId)] ?? "").trim()))
    ),
    [tracker.completed, tracker.evidence],
  );
  const isDayDone = useCallback(
    (dayId: number) => taskParts.every((part) => isPartDone(dayId, part)),
    [isPartDone],
  );

  const completedParts = useMemo(
    () => curriculumDays.reduce(
      (total, day) => total + taskParts.filter((part) => isPartDone(day.id, part)).length,
      0,
    ),
    [isPartDone],
  );
  const missionProgress = useMemo(() => deriveMissionProgress({
    completed: tracker.completed,
    evidence: tracker.evidence,
    projectGates: projects.map((project) => ({
      id: project.id,
      label: project.title,
      expectedCount: projectChecklistSizes.get(project.id) ?? 0,
      checks: tracker.projectChecks[project.id],
    })),
    totalDays: curriculumDays.length,
  }), [tracker.completed, tracker.evidence, tracker.projectChecks]);
  const completedDays = useMemo(
    () => missionProgress.daily.filter((day) => day.complete).length,
    [missionProgress.daily],
  );
  const totalParts = curriculumDays.length * taskParts.length;
  const percent = Math.round((completedParts / totalParts) * 100);
  const selectedDay = curriculumDays.find((day) => day.id === tracker.selectedDay) ?? curriculumDays[0];
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
  }, [query, phaseFilter, statusFilter, tracker.notes, isDayDone]);

  const changeView = (nextView: View, focusMain = true) => {
    setView(nextView);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      if (focusMain) document.getElementById("main-content")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }, 0);
  };

  const openDay = (dayId: number, target: FocusTarget = "top") => {
    setTracker((previous) => ({ ...previous, selectedDay: dayId }));
    setView("today");
    setFocusRequest({ dayId, target, nonce: Date.now() });
  };

  useEffect(() => {
    if (!focusRequest || view !== "today" || tracker.selectedDay !== focusRequest.dayId) return;

    const timer = window.setTimeout(() => {
      const targetId = focusRequest.target === "visual"
        ? `lesson-tab-${focusRequest.dayId}-visual`
        : focusRequest.target === "practice"
          ? `lesson-tab-${focusRequest.dayId}-practice`
          : focusRequest.target === "evidence"
            ? "evidence-note"
            : `mission-hero-${focusRequest.dayId}`;
      const element = document.getElementById(targetId);
      if (element instanceof HTMLButtonElement && (focusRequest.target === "visual" || focusRequest.target === "practice")) {
        element.click();
      }
      element?.focus();
      element?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: focusRequest.target === "top" ? "start" : "center",
      });
      setFocusRequest(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [focusRequest, tracker.selectedDay, view]);

  const togglePart = (day: CurriculumDay, part: TaskPart) => {
    const key = taskKey(day.id, part);
    const isCurrentlyDone = isPartDone(day.id, part);
    if (part === "prove" && !isCurrentlyDone && !(tracker.evidence[String(day.id)] ?? "").trim()) {
      setTracker((previous) => ({
        ...previous,
        completed: { ...previous.completed, [key]: false },
      }));
      setFocusRequest({ dayId: day.id, target: "evidence", nonce: Date.now() });
      setAnnouncement(`${day.title}: add a repository, demo, report, or decisive output before closing Prove.`);
      return;
    }

    const next = !isCurrentlyDone;
    const nextCompleted = { ...tracker.completed, [key]: next };
    setTracker((previous) => ({
      ...previous,
      completed: nextCompleted,
    }));
    const nextMission = deriveMissionProgress({
      completed: nextCompleted,
      evidence: tracker.evidence,
      totalDays: curriculumDays.length,
    }).nextAction;
    const nextCopy = nextMission.status === "active"
      ? `Next: Day ${nextMission.dayId} ${nextMission.label}.`
      : "Course mission complete.";
    setAnnouncement(
      `${day.title}: ${MISSION_TASK_LABELS[part]} ${next ? "complete" : "reopened"}. ${next ? "Earned" : "Removed"} ${MISSION_TASK_XP[part]} XP. ${nextCopy}`,
    );
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
      completed: field === "evidence" && !value.trim()
        ? { ...previous.completed, [taskKey(dayId, "prove")]: false }
        : previous.completed,
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
      if (file.size > MAX_BACKUP_BYTES) throw new Error("too-large");
      const parsed = parseTrackerState(await file.text());
      if (!parsed) throw new Error("invalid");
      setTracker({ ...parsed, startedOn: parsed.startedOn || localDate() });
      setAnnouncement("Progress backup imported.");
    } catch {
      setAnnouncement("Import rejected. Choose a valid Robot/Shift version 1 backup under 5 MB.");
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
      <aside className="side-rail" aria-label="Primary" aria-hidden={showReset ? true : undefined}>
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
              onClick={() => changeView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <span>{item.mark}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="rail-progress">
          <div className="rail-progress-head"><span>PROGRESS</span><strong>{percent}%</strong></div>
          <progress value={completedParts} max={totalParts}>{percent}%</progress>
          <p>{completedDays} of 180 days complete</p>
        </div>
      </aside>

      <div className="work-area" aria-hidden={showReset ? true : undefined}>
        <header className="command-bar">
          <div>
            <strong>{currentPhase.number} · {currentPhase.shortTitle}</strong>
          </div>
          <div className="command-actions">
            {view === "roadmap" && <label className="global-search">
              <span>⌕</span>
              <span className="sr-only">Search curriculum</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search 180 days…"
              />
            </label>}
            <ThemeControl />
            <button className="utility-button" onClick={() => setShowSettings((open) => !open)} aria-expanded={showSettings}>
              Settings
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
            <small className={storageError ? "storage-error" : ""} role="status">{storageError ?? saveStatus}</small>
          </section>
        )}

        <main id="main-content" tabIndex={-1}>
          {view === "today" && (
            <TodayView
              day={selectedDay}
              missionProgress={missionProgress}
              tracker={tracker}
              isPartDone={isPartDone}
              togglePart={togglePart}
              toggleBookmark={toggleBookmark}
              updateText={updateText}
              openDay={openDay}
              persistenceMessage={storageError ?? "Auto-saved locally"}
              persistenceError={Boolean(storageError)}
              openProgress={() => changeView("progress")}
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

          {view === "roles" && (
            <CareerView
              onOpenDay={(dayId) => openDay(dayId)}
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
              phaseStats={phaseStats}
              tracker={tracker}
              isDayDone={isDayDone}
              missionProgress={missionProgress}
              openCareer={() => changeView("roles")}
            />
          )}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation" aria-hidden={showReset ? true : undefined}>
        {navigation.map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => changeView(item.id)} aria-current={view === item.id ? "page" : undefined}>
            <span>{item.mark}</span>{item.label}
          </button>
        ))}
      </nav>

      <div className="sr-only" aria-live="polite">{announcement}</div>

      {showReset && (
        <div className="modal-backdrop" role="presentation">
          <div ref={resetDialogRef} className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description">
            <span className="eyebrow">DESTRUCTIVE LOCAL ACTION</span>
            <h2 id="reset-title">Reset all progress?</h2>
            <p id="reset-description">This removes completed tasks, notes, evidence, bookmarks, and build checks from this browser. Export first if you may need them.</p>
            <div>
              <button ref={resetCancelRef} onClick={() => setShowReset(false)}>Keep progress</button>
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
  missionProgress,
  tracker,
  isPartDone,
  togglePart,
  toggleBookmark,
  updateText,
  openDay,
  persistenceMessage,
  persistenceError,
  openProgress,
}: {
  day: CurriculumDay;
  missionProgress: MissionProgress;
  tracker: TrackerState;
  isPartDone: (dayId: number, part: TaskPart) => boolean;
  togglePart: (day: CurriculumDay, part: TaskPart) => void;
  toggleBookmark: (dayId: number) => void;
  updateText: (field: "notes" | "evidence", dayId: number, value: string) => void;
  openDay: (dayId: number, target?: FocusTarget) => void;
  persistenceMessage: string;
  persistenceError: boolean;
  openProgress: () => void;
}) {
  const phase = phaseFor(day);
  const date = scheduledDate(tracker.startedOn, day.id, tracker.weeklyHours);
  const completeCount = taskParts.filter((part) => isPartDone(day.id, part)).length;
  const dailyProgress = missionProgress.daily[day.id - 1];
  const nextAction = missionProgress.nextAction;
  const isPreviewing = nextAction.status === "active" && day.id !== nextAction.dayId;
  const targetForPart: Record<TaskPart, FocusTarget> = {
    learn: "visual",
    build: "practice",
    prove: "evidence",
  };
  const taskCopy = [
    { id: "learn" as const, label: "Understand", title: "Learn and explain" },
    { id: "build" as const, label: "Build", title: "Complete the exercise" },
    { id: "prove" as const, label: "Prove", title: "Save evidence" },
  ];
  const primaryActionCopy = nextAction.status === "course-complete"
    ? "Review completion"
    : isPreviewing
      ? `Resume Day ${nextAction.dayId} · ${nextAction.label}`
      : nextAction.part === "learn"
        ? "Start visual lesson"
        : nextAction.part === "build"
          ? "Continue to practice"
          : "Record proof evidence";
  const runPrimaryAction = () => {
    if (nextAction.status === "course-complete") {
      openProgress();
      return;
    }
    openDay(nextAction.dayId, targetForPart[nextAction.part]);
  };

  return (
    <div className="view-wrap">
      <section id={`mission-hero-${day.id}`} className="mission-hero" tabIndex={-1}>
        <div className="hero-copy">
          <div className={`viewing-state ${isPreviewing ? "previewing" : ""}`}>
            <span>Day {day.id} of 180</span>
            <button className="bookmark-inline" onClick={() => toggleBookmark(day.id)} aria-pressed={tracker.bookmarks.includes(day.id)}>
              <span aria-hidden="true">{tracker.bookmarks.includes(day.id) ? "★" : "☆"}</span>
              <span className="bookmark-label">{tracker.bookmarks.includes(day.id) ? "Important" : "Mark important"}</span>
            </button>
          </div>
          <div className="hero-meta">
            <span style={{ background: phase.color }}>{phase.number}</span>
            WEEK {String(day.week).padStart(2, "0")} · {formatMinutes(day.minutes)}
            {date ? ` · ${date}` : ""}
          </div>
          <h1>{day.title}</h1>
          <p>{day.focus}</p>
        </div>
      </section>

      <section id={`daily-quest-${day.id}`} className="daily-quest" aria-labelledby={`daily-quest-title-${day.id}`}>
        <header>
          <div>
            <h2 id={`daily-quest-title-${day.id}`}>Today</h2>
            <p>{completeCount} of 3 complete</p>
          </div>
          <button className="primary-button" onClick={runPrimaryAction}>{primaryActionCopy} →</button>
        </header>
        <div className="quest-steps">
          {taskCopy.map((task, index) => {
            const done = isPartDone(day.id, task.id);
            const isNext = dailyProgress.nextPart === task.id;
            return (
              <label key={task.id} className={`quest-step ${done ? "done" : ""} ${isNext ? "next" : ""}`}>
                <input type="checkbox" checked={done} onChange={() => togglePart(day, task.id)} />
                <span className="quest-number" aria-hidden="true">{done ? "✓" : index + 1}</span>
                <span>
                  <small>{task.label}{isNext ? " · NEXT" : ""}</small>
                  <strong>{task.title}</strong>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <LearningStudio day={day} />

      <div className="today-grid">
        <section className="task-board" aria-labelledby="task-title">
          <div className="section-heading">
            <div><h2 id="task-title">Practical task</h2></div>
          </div>
          <article className="lab-card">
            <h3>{day.lab}</h3>
          </article>
          <article className="proof-target-card">
            <strong>Complete when</strong>
            <p>{day.evidence}</p>
            <button type="button" onClick={() => document.getElementById("evidence-note")?.focus()}>
              Add evidence →
            </button>
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
            <strong>Reference</strong>
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
            <span className={`status-dot ${persistenceError ? "error" : ""}`} /> {persistenceMessage}
          </div>
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
        <div><h1>Roadmap</h1><p>{days.length} of 180 days shown.</p></div>
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
        <div><h1>Portfolio projects</h1><p>Six projects with measurable completion criteria.</p></div>
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
        <div><h1>Notes and evidence</h1><p>{entries.length} days captured.</p></div>
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
        <div className="empty-state"><h2>No notes or evidence yet.</h2><button onClick={() => openDay(tracker.selectedDay)}>Open current day</button></div>
      )}
    </div>
  );
}

function ProgressView({
  percent,
  completedDays,
  phaseStats,
  tracker,
  isDayDone,
  missionProgress,
  openCareer,
}: {
  percent: number;
  completedDays: number;
  phaseStats: PhaseStat[];
  tracker: TrackerState;
  isDayDone: (dayId: number) => boolean;
  missionProgress: MissionProgress;
  openCareer: () => void;
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
        <div>
          <span className="eyebrow">READINESS INSTRUMENT PANEL</span>
          <h1>{percent}% mission complete</h1>
          <p>
            Proof XP is derived from closed tasks; job readiness still depends on working builds, failure reports, and reproducible evidence.
            {" "}{Math.round(closedMinutes / 60)} of {Math.round(plannedMinutes / 60)} planned hours are attached to fully closed days.
          </p>
        </div>
        <div className="progress-numbers">
          <div><strong>{completedDays}</strong><span>/ 180 days</span></div>
          <div><strong>{missionProgress.totalXp.toLocaleString()}</strong><span>/ {missionProgress.maxXp.toLocaleString()} XP</span></div>
          <div><strong>{missionProgress.proofChain}</strong><span>day proof chain</span></div>
          <div><strong>{completedProjects}</strong><span>/ 6 builds</span></div>
        </div>
      </section>

      <section className="mission-achievements" aria-labelledby="mission-rank-title">
        <div className="rank-card">
          <span className="eyebrow">COURSE RANK</span>
          <h2 id="mission-rank-title">{missionProgress.rank.label}</h2>
          <p>Ranks describe progress through this course. They are not certifications or hiring claims.</p>
          <progress
            value={missionProgress.rank.percentToNextRank}
            max={100}
            aria-label={`${missionProgress.rank.percentToNextRank}% toward the next course rank`}
          />
          <small>
            {missionProgress.rank.nextMinimumXp === null
              ? "Maximum course rank reached"
              : `${missionProgress.rank.xpIntoRank.toLocaleString()} / ${missionProgress.rank.xpForRank.toLocaleString()} XP within this rank`}
          </small>
        </div>
        <div className="badge-rack">
          <div className="section-heading">
            <div><span className="eyebrow">EVIDENCE BADGES</span><h2>Earned only from proof</h2></div>
            <span>{missionProgress.badges.filter((badge) => badge.earned).length}/{missionProgress.badges.length} earned</span>
          </div>
          <div>
            {missionProgress.badges.map((badge) => (
              <article key={badge.id} className={badge.earned ? "earned" : ""}>
                <span aria-hidden="true">{badge.earned ? "✓" : "—"}</span>
                <div>
                  <strong>{badge.label}</strong>
                  <small>
                    {badge.id === "first-proof"
                      ? "Close Prove and save non-empty evidence"
                      : badge.id === "seven-day-chain"
                        ? "Close seven contiguous days from Day 1"
                        : "Close every checklist item in this build gate"}
                  </small>
                </div>
              </article>
            ))}
          </div>
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
        <div><span className="eyebrow">APPLICATION LADDER</span><h2>Apply before day 180.</h2><button type="button" onClick={openCareer}>Open role targets</button></div>
        <article><span>BRIDGE FIRST</span><h3>Robot HMI or fleet platform</h3><p>Reuse React, Flutter, Python, APIs, event systems, telemetry, and production debugging after one robotics-facing proof.</p></article>
        <article><span>PRIMARY · D84–119</span><h3>Deployment, validation, and ROS 2 integration</h3><p>Add ROS 2, Nav2, hardware integration, simulation, SIL/HIL, commissioning, rollback, and measurable recovery evidence.</p></article>
        <article><span>STRETCH · 9–18 MONTHS</span><h3>Physical-AI deployment</h3><p>Add robot datasets, policy evaluation, safe language-to-skill execution, edge inference, and real or HIL rollout evidence—not a research claim.</p></article>
      </section>

      <section className="resource-vault">
        <div><span className="eyebrow">CURATED SOURCE VAULT</span><h2>Primary references only</h2></div>
        <div>{resources.map((resource, index) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><strong>{resource.label}</strong><b>↗</b></a>)}</div>
      </section>
    </div>
  );
}
