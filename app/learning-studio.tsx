"use client";

import {
  lazy,
  Suspense,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type CurriculumDay } from "./curriculum";
import { InteractiveMathPlayground } from "./interactive-math-playground";
import { LessonMediaPanel } from "./lesson-media-panel";
import { LessonVisual } from "./lesson-visual";
import { allDayVisuals } from "./lesson-visuals";
import { lessonForDay } from "./lessons";
import { getMathRescue } from "./math-rescue";

const RichText = lazy(() => import("./rich-text").then((module) => ({
  default: module.RichText,
})));

type LearningStudioProps = {
  day: CurriculumDay;
};

export type LessonSection =
  | "visual"
  | "pareto"
  | "simple"
  | "math"
  | "examples"
  | "practice"
  | "quiz"
  | "story";

type TutorMode = "ask" | "pareto" | "simple" | "math" | "solve" | "quiz" | "story";
type TutorRole = "user" | "assistant";

type TutorMessage = {
  id: string;
  role: TutorRole;
  content: string;
  mode?: TutorMode;
  model?: string;
};

type TutorThread = {
  updatedAt: number;
  messages: TutorMessage[];
};

type TutorStore = {
  version: 1;
  threads: Record<string, TutorThread>;
};

const TUTOR_STORAGE_KEY = "robot-shift-tutor-v1";
const MAX_INPUT_LENGTH = 2_000;
const MAX_MESSAGE_LENGTH = 7_000;
const MAX_HISTORY_ITEM_LENGTH = 2_500;
const MAX_HISTORY_LENGTH = 10_000;
const MAX_MESSAGES_PER_DAY = 12;
const MAX_STORED_DAYS = 14;

type LessonSectionItem = {
  id: LessonSection;
  label: string;
  shortLabel: string;
  hint: string;
};

const primaryLessonSections: LessonSectionItem[] = [
  { id: "visual", label: "Visual guide", shortLabel: "Visual", hint: "See the system" },
  { id: "simple", label: "Explain simply", shortLabel: "Explain", hint: "Build intuition" },
  { id: "math", label: "Math lab", shortLabel: "Math", hint: "Move the numbers" },
  { id: "examples", label: "Real-life examples", shortLabel: "Examples", hint: "See it at work" },
  { id: "practice", label: "Practice", shortLabel: "Practise", hint: "Try it yourself" },
  { id: "quiz", label: "Quiz / teach-back", shortLabel: "Check", hint: "Explain it back" },
];

const supportLessonSections: LessonSectionItem[] = [
  { id: "pareto", label: "80/20 summary", shortLabel: "80/20", hint: "Only the vital ideas" },
  { id: "story", label: "Story and metaphor", shortLabel: "Story", hint: "Make it memorable" },
];

const tutorModes: {
  id: Exclude<TutorMode, "ask">;
  label: string;
  prompt: string;
}[] = [
  {
    id: "pareto",
    label: "80/20",
    prompt: "What is the most important 20% I should understand and remember today?",
  },
  {
    id: "simple",
    label: "Explain simpler",
    prompt: "Explain this in even simpler words with one everyday example.",
  },
  {
    id: "math",
    label: "Math walkthrough",
    prompt: "Walk me through today’s math one tiny step at a time. Explain every symbol.",
  },
  {
    id: "solve",
    label: "Solve step-by-step",
    prompt: "Give me one beginner problem and show the complete step-by-step solution.",
  },
  {
    id: "quiz",
    label: "Quiz & diagnose",
    prompt: "Test me one question at a time, diagnose my gaps, and correct me gently.",
  },
  {
    id: "story",
    label: "Story & metaphor",
    prompt: "Turn this idea into a memorable story or physical metaphor.",
  },
];
const cannedTutorPrompts = new Set(tutorModes.map((item) => item.prompt));

const modeLabels: Record<TutorMode, string> = {
  ask: "Ask",
  pareto: "80/20",
  simple: "Explain simpler",
  math: "Math walkthrough",
  solve: "Solve step-by-step",
  quiz: "Quiz & diagnose",
  story: "Story & metaphor",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseTutorStore(raw: string): TutorStore | null {
  try {
    const candidate: unknown = JSON.parse(raw);
    if (!isRecord(candidate) || candidate.version !== 1 || !isRecord(candidate.threads)) return null;

    const threads: Record<string, TutorThread> = {};
    const entries = Object.entries(candidate.threads)
      .filter(([, value]) => isRecord(value) && typeof value.updatedAt === "number")
      .sort((a, b) => (b[1] as { updatedAt: number }).updatedAt - (a[1] as { updatedAt: number }).updatedAt)
      .slice(0, MAX_STORED_DAYS);

    for (const [dayKey, value] of entries) {
      if (!/^(?:[1-9]|[1-9]\d|1[0-7]\d|180)$/.test(dayKey) || !isRecord(value) || !Array.isArray(value.messages)) {
        continue;
      }
      const updatedAt = value.updatedAt;
      if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt)) continue;

      const messages: TutorMessage[] = [];
      for (const item of value.messages.slice(-MAX_MESSAGES_PER_DAY)) {
        if (
          !isRecord(item) ||
          typeof item.id !== "string" ||
          (item.role !== "user" && item.role !== "assistant") ||
          typeof item.content !== "string" ||
          item.content.length === 0 ||
          item.content.length > MAX_MESSAGE_LENGTH
        ) {
          continue;
        }

        const mode = typeof item.mode === "string" && item.mode in modeLabels
          ? item.mode as TutorMode
          : undefined;
        const model = typeof item.model === "string" && item.model.length <= 100
          ? item.model
          : undefined;
        messages.push({
          id: item.id.slice(0, 100),
          role: item.role,
          content: item.content,
          mode,
          model,
        });
      }

      threads[dayKey] = {
        updatedAt,
        messages,
      };
    }

    return { version: 1, threads };
  } catch {
    return null;
  }
}

function createMessageId() {
  if (typeof window !== "undefined" && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function withUpdatedThread(
  current: Record<string, TutorThread>,
  dayId: number,
  updater: (messages: TutorMessage[]) => TutorMessage[],
) {
  const dayKey = String(dayId);
  const messages = updater(current[dayKey]?.messages ?? []).slice(-MAX_MESSAGES_PER_DAY);
  const next: Record<string, TutorThread> = {
    ...current,
    [dayKey]: { updatedAt: Date.now(), messages },
  };

  return Object.fromEntries(
    Object.entries(next)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .slice(0, MAX_STORED_DAYS),
  );
}

function historyForRequest(messages: TutorMessage[]) {
  const history: Array<{ role: TutorRole; content: string }> = [];
  let totalLength = 0;

  for (const message of [...messages].reverse()) {
    const content = message.content.slice(0, MAX_HISTORY_ITEM_LENGTH);
    if (totalLength + content.length > MAX_HISTORY_LENGTH) break;
    history.unshift({ role: message.role, content });
    totalLength += content.length;
  }

  return history;
}

export function LearningStudio({ day }: LearningStudioProps) {
  const lesson = useMemo(() => lessonForDay(day), [day]);
  const mathRescue = useMemo(() => getMathRescue(day.week), [day.week]);
  const approvedSourceUrls = useMemo(
    () => lesson.sources.map((source) => source.url),
    [lesson.sources],
  );
  const visual = allDayVisuals[day.id - 1];
  const [section, setSection] = useState<LessonSection>("visual");
  const [threads, setThreads] = useState<Record<string, TutorThread>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("ask");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabRefs = useRef<Partial<Record<LessonSection, HTMLButtonElement | null>>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const dayKey = String(day.id);
  const messages = threads[dayKey]?.messages ?? [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(TUTOR_STORAGE_KEY);
        if (raw) {
          const parsed = parseTutorStore(raw);
          if (parsed) {
            setThreads(parsed.threads);
          } else {
            setStorageNotice("Saved tutor history was unreadable and has been reset.");
          }
        }
      } catch {
        setStorageNotice("Tutor history is available for this visit, but this browser cannot save it.");
      } finally {
        setStorageReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      const store: TutorStore = { version: 1, threads };
      window.localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(store));
    } catch {
      const timer = window.setTimeout(() => {
        setStorageNotice("Tutor history is available for this visit, but the browser could not save it.");
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [storageReady, threads]);

  useEffect(() => {
    requestRef.current?.abort();
    const timer = window.setTimeout(() => {
      setSection("visual");
      setLoading(false);
      setError(null);
      setMode("ask");
      setDraft("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [day.id]);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [messages.length, loading]);

  function chooseTutorMode(nextMode: Exclude<TutorMode, "ask">, prompt: string) {
    setMode(nextMode);
    setDraft((current) => {
      const trimmed = current.trim();
      return !trimmed || cannedTutorPrompts.has(trimmed) ? prompt : current;
    });
    setError(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function moveTab(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
    items: readonly LessonSectionItem[],
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextSection = items[nextIndex].id;
    setSection(nextSection);
    tabRefs.current[nextSection]?.focus();
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || loading) return;

    const submittedDay = day.id;
    const priorMessages = historyForRequest(messages);
    const userMessage: TutorMessage = {
      id: createMessageId(),
      role: "user",
      content: question.slice(0, MAX_INPUT_LENGTH),
      mode,
    };

    setThreads((current) => withUpdatedThread(
      current,
      submittedDay,
      (currentMessages) => [...currentMessages, userMessage],
    ));
    setDraft("");
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          dayId: submittedDay,
          mode,
          message: userMessage.content,
          history: priorMessages,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      if (
        !response.ok ||
        !isRecord(payload) ||
        typeof payload.answer !== "string" ||
        payload.answer.trim().length === 0
      ) {
        const apiError = isRecord(payload) && typeof payload.error === "string"
          ? payload.error
          : "The tutor could not answer right now.";
        throw new Error(apiError);
      }

      const rawAnswer = payload.answer.trim();
      const answer = rawAnswer.length > MAX_MESSAGE_LENGTH
        ? `${rawAnswer.slice(0, MAX_MESSAGE_LENGTH - 52)}\n\n[Answer shortened to protect local storage.]`
        : rawAnswer;
      const assistantMessage: TutorMessage = {
        id: createMessageId(),
        role: "assistant",
        content: answer,
        mode,
        model: typeof payload.model === "string" ? payload.model.slice(0, 100) : undefined,
      };
      setThreads((current) => withUpdatedThread(
        current,
        submittedDay,
        (currentMessages) => [...currentMessages, assistantMessage],
      ));
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "The tutor could not answer right now.");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  function clearChat() {
    requestRef.current?.abort();
    requestRef.current = null;
    setThreads((current) => {
      const next = { ...current };
      delete next[String(day.id)];
      return next;
    });
    setLoading(false);
    setError(null);
    setMode("ask");
    setDraft("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <section className="learning-studio" aria-labelledby={`learning-studio-title-${day.id}`}>
      <header className="studio-heading">
        <div>
          <h2 id={`learning-studio-title-${day.id}`}>Lesson</h2>
          <p>{lesson.bigIdea}</p>
        </div>
      </header>

      <div className="lesson-path" role="tablist" aria-label="Guided lesson path">
        {primaryLessonSections.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[item.id] = node; }}
            id={`lesson-tab-${day.id}-${item.id}`}
            type="button"
            role="tab"
            aria-label={item.label}
            aria-selected={section === item.id}
            aria-controls={`lesson-panel-${day.id}`}
            tabIndex={
              section === item.id
                || (!primaryLessonSections.some((stage) => stage.id === section) && index === 0)
                ? 0
                : -1
            }
            className={section === item.id ? "active" : ""}
            onClick={() => setSection(item.id)}
            onKeyDown={(event) => moveTab(event, index, primaryLessonSections)}
          >
            <span className="lesson-stage-number" aria-hidden="true">{index + 1}</span>
            <span>
              <strong>{item.shortLabel}</strong>
              <small>{item.hint}</small>
            </span>
          </button>
        ))}
      </div>

      <details className="lesson-support-bar optional-panel">
        <summary>Optional help</summary>
        <div className="lesson-support-tabs">
          <div aria-label="Supporting lesson tools">
            {supportLessonSections.map((item) => (
              <button
                key={item.id}
                ref={(node) => { tabRefs.current[item.id] = node; }}
                id={`lesson-tab-${day.id}-${item.id}`}
                type="button"
                aria-pressed={section === item.id}
                aria-controls={`lesson-panel-${day.id}`}
                className={section === item.id ? "active" : ""}
                onClick={() => setSection(item.id)}
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </details>

      <div
        className="lesson-panel"
        id={`lesson-panel-${day.id}`}
        role={primaryLessonSections.some((item) => item.id === section) ? "tabpanel" : "region"}
        aria-labelledby={`lesson-tab-${day.id}-${section}`}
        tabIndex={0}
      >
        {section === "visual" && <LessonVisual spec={visual} />}

        {section === "pareto" && (
          <div className="lesson-section lesson-pareto">
            <div className="lesson-lead">
              <span>THE ONE-SENTENCE MODEL</span>
              <p>{lesson.bigIdea}</p>
            </div>
            <div className="lesson-two-column">
              <div>
                <h3>The vital 20%</h3>
                <ol className="lesson-list">
                  {lesson.pareto.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}
                </ol>
              </div>
              <div>
                <h3>Traps to avoid</h3>
                <ul className="lesson-list warning-list">
                  {lesson.mistakes.map((mistake, index) => <li key={`${index}-${mistake}`}>{mistake}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {section === "simple" && (
          <div className="lesson-section">
            <span className="lesson-kicker">EXPLAIN IT LIKE I’M 15</span>
            <h3>{day.title}, without the fog</h3>
            <div className="lesson-prose">
              {lesson.simpleExplanation.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
            </div>
            <aside className="lesson-connection">
              <strong>Connect it to today’s build</strong>
              <p>{day.task}</p>
            </aside>
          </div>
        )}

        {section === "math" && (
          <div className="lesson-section math-lesson">
            <span className="lesson-kicker">NO-SKIPPED-STEPS MATH</span>
            <h3>{lesson.math.title}</h3>
            <p>{lesson.math.meaning}</p>
            <InteractiveMathPlayground spec={visual} />
            <details className="math-rescue" open>
              <summary>
                <span>BEGINNER RESCUE // WEEK {String(day.week).padStart(2, "0")}</span>
                {mathRescue.title}
              </summary>
              <div className="math-rescue-body">
                <p>{mathRescue.whyItMatters}</p>
                <div className="math-symbols" aria-label="Symbols used this week">
                  {mathRescue.symbols.map((item) => (
                    <article key={item.symbol}>
                      <strong>{item.symbol}</strong>
                      <span>{item.meaning}</span>
                      <small>Unit: {item.unit}</small>
                    </article>
                  ))}
                </div>
                <ol className="math-steps">
                  {mathRescue.workedSteps.map((step, index) => (
                    <li key={step}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                <aside className="math-analogy">
                  <strong>Connect to software you already know</strong>
                  <p>{mathRescue.analogy}</p>
                </aside>
                <details className="math-quick-check">
                  <summary>Quick check: {mathRescue.quickCheck}</summary>
                  <p><strong>Answer:</strong> {mathRescue.answer}</p>
                </details>
              </div>
            </details>
            {lesson.math.connection && (
              <div className="math-topic-connection">
                <strong>Today’s exact-topic connection</strong>
                {lesson.math.connectionMarkdown ? (
                  <Suspense fallback={<p>{lesson.math.connection}</p>}>
                    <RichText content={lesson.math.connectionMarkdown} className="math-connection-markdown" />
                  </Suspense>
                ) : (
                  <p>{lesson.math.connection}</p>
                )}
              </div>
            )}
            <div className="formula-card" aria-label={`Formula: ${lesson.math.formula}`}>
              <span>WEEKLY CORE FORMULA</span>
              <Suspense fallback={<strong>{lesson.math.formula}</strong>}>
                <RichText
                  content={`$$\n${lesson.math.latex}\n$$`}
                  className="formula-typeset"
                />
              </Suspense>
            </div>
            <ol className="math-steps">
              {lesson.math.steps.map((step, index) => (
                <li key={`${index}-${step}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className="math-check">
              <strong>Sanity check</strong>
              <p>{lesson.math.check}</p>
            </div>
          </div>
        )}

        {section === "examples" && (
          <div className="lesson-section">
            <span className="lesson-kicker">FROM SYMBOLS TO THE PHYSICAL WORLD</span>
            <h3>Three places this idea becomes real</h3>
            <div className="example-grid">
              {lesson.examples.map((example, index) => (
                <article key={example.title} className="example-card">
                  <span>0{index + 1}</span>
                  <h4>{example.title}</h4>
                  <p>{example.explanation}</p>
                  <div><strong>Try it:</strong> {example.tryIt}</div>
                </article>
              ))}
            </div>
          </div>
        )}

        {section === "practice" && (
          <div className="lesson-section">
            <span className="lesson-kicker">ACTIVE PRACTICE</span>
            <h3>Do, observe, explain.</h3>
            <div className="practice-list">
              {lesson.practice.map((exercise, index) => (
                <article key={exercise.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h4>{exercise.title}</h4>
                    <p>{exercise.task}</p>
                    <small><strong>Done when:</strong> {exercise.doneWhen}</small>
                  </div>
                </article>
              ))}
            </div>
            <aside className="lesson-connection">
              <strong>Today’s evidence target</strong>
              <p>{day.evidence}</p>
            </aside>
          </div>
        )}

        {section === "quiz" && (
          <div className="lesson-section">
            <span className="lesson-kicker">RECALL BEFORE REVEAL</span>
            <h3>Answer aloud before opening each check.</h3>
            <div className="quiz-list">
              {lesson.quiz.map((item, index) => (
                <details key={item.question}>
                  <summary><span>Q{index + 1}</span>{item.question}</summary>
                  <div><strong>Better answer</strong><p>{item.answer}</p></div>
                </details>
              ))}
            </div>
            <div className="teach-back-card">
              <span>TEACH-BACK</span>
              <p>{lesson.teachBack}</p>
              <button
                type="button"
                onClick={() => chooseTutorMode("quiz", `Here is my teach-back for “${day.title}”: `)}
              >
                Give my explanation to the tutor →
              </button>
            </div>
          </div>
        )}

        {section === "story" && (
          <div className="lesson-section story-lesson">
            <span className="lesson-kicker">MEMORY HOOK</span>
            <h3>{lesson.story.title}</h3>
            <p>{lesson.story.body}</p>
            <blockquote>{lesson.story.memoryHook}</blockquote>
          </div>
        )}

        <div className="lesson-next-step">
          {primaryLessonSections.findIndex((item) => item.id === section) >= 0
            && primaryLessonSections.findIndex((item) => item.id === section) < primaryLessonSections.length - 1 ? (
              <>
                <span>
                  NEXT LEARNING STEP
                  <strong>
                    {primaryLessonSections[primaryLessonSections.findIndex((item) => item.id === section) + 1].label}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = primaryLessonSections.findIndex((item) => item.id === section);
                    const nextSection = primaryLessonSections[currentIndex + 1].id;
                    setSection(nextSection);
                    window.setTimeout(() => tabRefs.current[nextSection]?.focus(), 0);
                  }}
                >
                  Continue →
                </button>
              </>
            ) : section === "quiz" ? (
              <>
                <span>LESSON COMPLETE<strong>Mark Understand complete when you can explain it back.</strong></span>
                <button type="button" onClick={() => document.getElementById(`daily-quest-${day.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                  Return to checklist ↑
                </button>
              </>
            ) : (
              <>
                <span>OPTIONAL HELP<strong>Return to the main lesson when ready.</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setSection("visual");
                    window.setTimeout(() => tabRefs.current.visual?.focus(), 0);
                  }}
                >
                  Back to Visual →
                </button>
              </>
            )}
        </div>
      </div>

      <LessonMediaPanel
        key={lesson.dayId}
        week={lesson.week}
        dayId={lesson.dayId}
        sources={lesson.sources}
      />

      <details className="optional-panel tutor-disclosure">
        <summary>Ask the AI teacher</summary>
        <section id={`tutor-panel-${day.id}`} className="tutor-panel" aria-labelledby={`tutor-title-${day.id}`}>
        <header className="tutor-heading">
          <div>
            <h3 id={`tutor-title-${day.id}`}>Ask a question</h3>
          </div>
          <button type="button" className="clear-chat-button" onClick={clearChat} disabled={messages.length === 0 && !draft}>
            Clear chat
          </button>
        </header>

        <div className="tutor-mode-list" aria-label="Tutor teaching modes">
          {tutorModes.map((item) => (
            <button
              type="button"
              key={item.id}
              className={mode === item.id ? "active" : ""}
              aria-pressed={mode === item.id}
              onClick={() => chooseTutorMode(item.id, item.prompt)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div ref={chatRef} className="tutor-chat" role="log" aria-live="polite" aria-relevant="additions text" aria-busy={loading}>
          {messages.length === 0 && (
            <div className="tutor-empty">
              <p>Ask about today’s lesson, maths, exercise, or quiz.</p>
            </div>
          )}
          {messages.map((message) => (
            <article key={message.id} className={`chat-message ${message.role}`}>
              <div className="chat-message-meta">
                <strong>{message.role === "user" ? "You" : "Teacher"}</strong>
                <span>{message.mode ? modeLabels[message.mode] : "Ask"}{message.model ? ` · ${message.model}` : ""}</span>
              </div>
              {message.role === "assistant" ? (
                <Suspense fallback={<p>{message.content}</p>}>
                  <RichText
                    content={message.content}
                    className="tutor-markdown"
                    allowedLinks={approvedSourceUrls}
                  />
                </Suspense>
              ) : (
                <p>{message.content}</p>
              )}
            </article>
          ))}
          {loading && (
            <div className="tutor-thinking" role="status">
              <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
              Teacher is building a step-by-step answer…
            </div>
          )}
        </div>

        <form className="tutor-form" onSubmit={submitQuestion}>
          <label htmlFor={`tutor-question-${day.id}`}>
            Your question
            <span>{modeLabels[mode]} mode · {draft.length}/{MAX_INPUT_LENGTH}</span>
          </label>
          <textarea
            ref={inputRef}
            id={`tutor-question-${day.id}`}
            value={draft}
            maxLength={MAX_INPUT_LENGTH}
            rows={3}
            disabled={loading}
            placeholder={`Ask about “${day.title}”…`}
            onChange={(event) => {
              setDraft(event.target.value);
              if (mode !== "ask" && event.target.value.length === 0) setMode("ask");
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="tutor-form-footer">
            <span>⌘/Ctrl + Enter · latest 14 day chats stay on this device; recent chat is sent to Gemini when you ask</span>
            <button type="submit" className="primary-button" disabled={loading || !draft.trim()}>
              {loading ? "Thinking…" : "Ask teacher →"}
            </button>
          </div>
        </form>

        {error && <p className="tutor-error" role="alert">{error}</p>}
        {storageNotice && <p className="tutor-storage-notice" role="status">{storageNotice}</p>}
        <p className="tutor-safety-note">
          AI can make mistakes. Check equations against the linked source and never send generated commands directly to powered hardware without limits, an emergency stop, and human review.
        </p>
        </section>
      </details>
    </section>
  );
}
