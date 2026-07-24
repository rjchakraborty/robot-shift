"use client";

import {
  lazy,
  Suspense,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadChapterContent } from "./chapter-content";
import type { ChapterContent } from "./chapter-content-types";
import { type CurriculumDay } from "./curriculum";
import {
  initializeFirebaseObservability,
  logTutorRequestEvent,
} from "./firebase-observability";
import {
  askCloudTutor,
  clearCloudTutorThread,
  loadActiveCloudTutorThread,
  loadCloudTutorThread,
} from "./firestore-data";
import { useAuth } from "./auth/auth-context";
import { LessonArticle } from "./lesson-article";
import { lessonForDay } from "./lessons";
import {
  type StoredTutorMessage,
  type StoredTutorMode,
  type StoredTutorThread,
} from "./storage-migrations";

const RichText = lazy(() => import("./rich-text").then((module) => ({
  default: module.RichText,
})));

type LearningStudioProps = {
  day: CurriculumDay;
};

type TutorMode = StoredTutorMode;
type TutorMessage = StoredTutorMessage;
type TutorThread = StoredTutorThread;

const MAX_INPUT_LENGTH = 2_000;
const MAX_MESSAGES_PER_DAY = 12;
const MAX_STORED_DAYS = 14;

const tutorModes: {
  id: Exclude<TutorMode, "ask">;
  label: string;
  prompt: string;
}[] = [
  {
    id: "pareto",
    label: "Show the vital 20%",
    prompt: "What is the most important 20% I should understand and remember today?",
  },
  {
    id: "simple",
    label: "Explain more simply",
    prompt: "Explain this in even simpler words with one everyday example.",
  },
  {
    id: "math",
    label: "Walk through the maths",
    prompt: "Walk me through today’s math one tiny step at a time. Explain every symbol.",
  },
  {
    id: "solve",
    label: "Solve one problem",
    prompt: "Give me one beginner problem and show the complete step-by-step solution.",
  },
  {
    id: "quiz",
    label: "Quiz and diagnose me",
    prompt: "Test me one question at a time, diagnose my gaps, and correct me gently.",
  },
  {
    id: "story",
    label: "Give me a memory metaphor",
    prompt: "Turn this idea into a memorable story or physical metaphor.",
  },
];

const cannedTutorPrompts = new Set(tutorModes.map((item) => item.prompt));

const modeLabels: Record<TutorMode, string> = {
  ask: "Ask normally",
  pareto: "Vital 20%",
  simple: "Explain simply",
  math: "Math walkthrough",
  solve: "Solved problem",
  quiz: "Quiz and diagnose",
  story: "Memory metaphor",
};

function createMessageId() {
  return window.crypto.randomUUID();
}

function withUpdatedThread(
  current: Record<string, TutorThread>,
  dayId: number,
  updater: (messages: TutorMessage[]) => TutorMessage[],
) {
  const dayKey = String(dayId);
  const messages = updater(current[dayKey]?.messages ?? [])
    .slice(-MAX_MESSAGES_PER_DAY);
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

function withCanonicalThread(
  current: Record<string, TutorThread>,
  dayId: number,
  thread: TutorThread | null,
) {
  const dayKey = String(dayId);
  const next = { ...current };
  if (thread) {
    next[dayKey] = thread;
  } else {
    delete next[dayKey];
  }
  return Object.fromEntries(
    Object.entries(next)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .slice(0, MAX_STORED_DAYS),
  );
}

export function LearningStudio({ day }: LearningStudioProps) {
  const {
    cloudLoading,
    datasetId,
    loading: authLoading,
    openAuth,
    user: authUser,
  } = useAuth();
  const lesson = useMemo(() => lessonForDay(day), [day]);
  const [chapter, setChapter] = useState<ChapterContent | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, TutorThread>>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);
  const [mode, setMode] = useState<TutorMode>("ask");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const dayKey = String(day.id);
  const messages = threads[dayKey]?.messages ?? [];
  const deepDive = chapter?.days.find((item) => item.dayId === day.id);
  const approvedSourceUrls = useMemo(
    () => (chapter?.sources ?? lesson.sources).map((source) => source.url),
    [chapter, lesson.sources],
  );
  const canUseTutor = Boolean(
    authUser?.emailVerified && datasetId && !cloudLoading,
  );

  useEffect(() => {
    void initializeFirebaseObservability();
  }, []);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [authUser?.uid]);

  useEffect(() => {
    let active = true;

    void loadChapterContent(day.week)
      .then((content) => {
        if (active) {
          setChapter(content);
          setChapterError(null);
        }
      })
      .catch(() => {
        if (active) {
          setChapter(null);
          setChapterError("This chapter could not be loaded. Refresh the page and try again.");
        }
      });

    return () => {
      active = false;
    };
  }, [day.week]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setThreads({});
      setStorageNotice(null);
      setRemainingToday(null);
      if (!authUser?.emailVerified || !datasetId) {
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);
      try {
        const thread = await loadCloudTutorThread(
          authUser.uid,
          datasetId,
          day.id,
        );
        if (!active) return;
        setThreads(thread ? { [String(day.id)]: thread } : {});
        setStorageNotice(null);
      } catch {
        if (!active) return;
        setStorageNotice("Tutor history could not be loaded from Firestore.");
      } finally {
        if (active) setHistoryLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [authUser?.emailVerified, authUser?.uid, datasetId, day.id]);

  useEffect(() => {
    requestRef.current?.abort();
    const timer = window.setTimeout(() => {
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
    if (!chat) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages.length, loading]);

  function chooseTutorMode(
    nextMode: Exclude<TutorMode, "ask">,
    prompt: string,
  ) {
    setMode(nextMode);
    setDraft((current) => {
      const trimmed = current.trim();
      return !trimmed || cannedTutorPrompts.has(trimmed) ? prompt : current;
    });
    setError(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function changeTutorMode(nextMode: TutorMode) {
    if (nextMode === "ask") {
      setMode("ask");
      setDraft((current) => (
        cannedTutorPrompts.has(current.trim()) ? "" : current
      ));
      return;
    }

    const option = tutorModes.find((item) => item.id === nextMode);
    if (option) chooseTutorMode(option.id, option.prompt);
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || loading) return;
    if (!authUser) {
      openAuth("sign-in");
      setError("Sign in before asking the AI tutor.");
      return;
    }
    if (!authUser.emailVerified) {
      openAuth("verify-email");
      setError("Verify your email before asking the AI tutor.");
      return;
    }
    if (!chapter || !deepDive) {
      setError("The trusted lesson content is still loading. Try again shortly.");
      return;
    }

    const submittedDay = day.id;
    const submittedMode = mode;
    const userMessage: TutorMessage = {
      id: createMessageId(),
      role: "user",
      content: question.slice(0, MAX_INPUT_LENGTH),
      mode: submittedMode,
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
    const requestStartedAt = performance.now();
    void logTutorRequestEvent({
      dayId: submittedDay,
      mode: submittedMode,
      status: "started",
    });

    try {
      const payload = await askCloudTutor({
        day,
        mode: submittedMode,
        message: userMessage.content,
        requestId: userMessage.id,
      });
      if (controller.signal.aborted) return;

      const canonical = await loadActiveCloudTutorThread(
        authUser.uid,
        submittedDay,
      );
      if (controller.signal.aborted) return;
      const committedAssistantId =
        `${payload.requestId}:assistant`.slice(0, 100);
      const canonicalHasAnswer = canonical.thread?.messages.some(
        (message) => message.id === committedAssistantId,
      ) === true;
      const commitIsCurrent = (
        payload.threadCommitted
        && payload.requestId === userMessage.id
        && payload.datasetId === canonical.datasetId
        && canonicalHasAnswer
      );
      setThreads((current) => withCanonicalThread(
        current,
        submittedDay,
        canonical.thread,
      ));
      setRemainingToday(payload.remainingToday);
      if (!commitIsCurrent) {
        void logTutorRequestEvent({
          dayId: submittedDay,
          mode: submittedMode,
          status: "failed",
          latencyMs: performance.now() - requestStartedAt,
          failureCode: "unknown",
        });
        setError(
          "Course data or Tutor history changed before the answer was saved. The unsaved answer was discarded; ask again.",
        );
        return;
      }
      void logTutorRequestEvent({
        dayId: submittedDay,
        mode: submittedMode,
        status: "succeeded",
        latencyMs: performance.now() - requestStartedAt,
      });
    } catch (caught) {
      const failureCode = getCallableTutorFailureCode(caught);
      if (failureCode === "cancelled") {
        void logTutorRequestEvent({
          dayId: submittedDay,
          mode: submittedMode,
          status: "cancelled",
          latencyMs: performance.now() - requestStartedAt,
          failureCode,
        });
        return;
      }
      try {
        const cloudThread = authUser
          ? (await loadActiveCloudTutorThread(
              authUser.uid,
              submittedDay,
            )).thread
          : null;
        setThreads((current) => withCanonicalThread(
          current,
          submittedDay,
          cloudThread,
        ));
      } catch {
        setThreads((current) => withUpdatedThread(
          current,
          submittedDay,
          (currentMessages) => currentMessages.filter(
            (message) => message.id !== userMessage.id,
          ),
        ));
      }
      void logTutorRequestEvent({
        dayId: submittedDay,
        mode: submittedMode,
        status: "failed",
        latencyMs: performance.now() - requestStartedAt,
        failureCode,
      });
      setError(
        caught instanceof Error
          ? caught.message
          : "The tutor could not answer right now.",
      );
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  async function clearChat() {
    if (!canUseTutor) return;
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setError(null);
    setMode("ask");
    setDraft("");
    try {
      await clearCloudTutorThread(day.id);
      const canonical = authUser
        ? await loadActiveCloudTutorThread(authUser.uid, day.id)
        : null;
      setThreads((current) => withCanonicalThread(
        current,
        day.id,
        canonical?.thread ?? null,
      ));
      setStorageNotice(
        canonical?.thread
          ? "Course data changed while clearing; the active Firestore thread was reloaded."
          : "This Firestore tutor thread was cleared.",
      );
    } catch {
      setStorageNotice("Tutor history could not be cleared from Firestore.");
    }
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <section
      className="learning-studio"
      aria-label={`Learning content for Day ${day.id}`}
    >
      {chapter && deepDive ? (
        <LessonArticle
          chapter={chapter}
          day={day}
          deepDive={deepDive}
          lesson={lesson}
        />
      ) : chapterError ? (
        <p className="lesson-content-error" role="alert">{chapterError}</p>
      ) : (
        <p className="lesson-content-loading" role="status">
          Loading this chapter…
        </p>
      )}

      <details className="optional-panel tutor-disclosure">
        <summary>Ask the AI teacher</summary>
        <section
          id={`tutor-panel-${day.id}`}
          className="tutor-panel"
          aria-labelledby={`tutor-title-${day.id}`}
        >
          <header className="tutor-heading">
            <div>
              <h3 id={`tutor-title-${day.id}`}>Ask about this lesson</h3>
            </div>
            {canUseTutor && (messages.length > 0 || draft) ? (
              <button
                type="button"
                className="clear-chat-button"
                onClick={() => void clearChat()}
              >
                Clear chat
              </button>
            ) : null}
          </header>

          {authLoading || cloudLoading ? (
            <div className="tutor-access-gate" role="status">
              <strong>Checking account access…</strong>
            </div>
          ) : !authUser ? (
            <div className="tutor-access-gate">
              <strong>Sign in to use the AI tutor</strong>
              <p>The full curriculum stays public. Tutor requires a registered account.</p>
              <button type="button" onClick={() => openAuth("sign-in")}>
                Sign in or register
              </button>
            </div>
          ) : !authUser.emailVerified ? (
            <div className="tutor-access-gate">
              <strong>Verify your email to unlock Tutor</strong>
              <p>Open the verification link sent to {authUser.email}.</p>
              <button type="button" onClick={() => openAuth("verify-email")}>
                Verify or resend
              </button>
            </div>
          ) : !datasetId ? (
            <div className="tutor-access-gate" role="alert">
              <strong>Secure Tutor data is unavailable</strong>
              <p>The Firestore account dataset could not be loaded. Tutor remains locked.</p>
            </div>
          ) : (
            <>
          <label className="tutor-mode-select" htmlFor={`tutor-mode-${day.id}`}>
            Teaching style
            <select
              id={`tutor-mode-${day.id}`}
              value={mode}
              onChange={(event) => changeTutorMode(event.target.value as TutorMode)}
            >
              <option value="ask">Ask normally</option>
              {tutorModes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <div
            ref={chatRef}
            className="tutor-chat"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={loading}
          >
            {historyLoading ? (
              <div className="tutor-empty" role="status">
                <p>Loading this tutor thread from Firestore…</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="tutor-empty">
                <p>Ask about the explanation, equation, exercise, or interview connection.</p>
              </div>
            ) : null}
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.role}`}>
                <div className="chat-message-meta">
                  <strong>{message.role === "user" ? "You" : "Teacher"}</strong>
                  <span>
                    {message.mode ? modeLabels[message.mode] : "Ask normally"}
                    {message.model ? ` · ${message.model}` : ""}
                  </span>
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
              </div>
            ))}
            {loading ? (
              <div className="tutor-thinking" role="status">
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                Building a step-by-step answer…
              </div>
            ) : null}
          </div>

          <form className="tutor-form" onSubmit={submitQuestion}>
            <label htmlFor={`tutor-question-${day.id}`}>
              Your question
              <span>{modeLabels[mode]} · {draft.length}/{MAX_INPUT_LENGTH}</span>
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
                if (mode !== "ask" && event.target.value.length === 0) {
                  setMode("ask");
                }
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <div className="tutor-form-footer">
              <span>
                ⌘/Ctrl + Enter · chat and daily usage are secured in Firestore
                {remainingToday === null
                  ? ""
                  : ` · ${remainingToday} requests left today`}
              </span>
              <button
                type="submit"
                className="primary-button"
                disabled={
                  loading
                  || historyLoading
                  || !draft.trim()
                  || !chapter
                  || !deepDive
                }
              >
                {loading ? "Thinking…" : "Ask teacher"}
              </button>
            </div>
          </form>

          {error ? <p className="tutor-error" role="alert">{error}</p> : null}
          {storageNotice ? (
            <p className="tutor-storage-notice" role="status">{storageNotice}</p>
          ) : null}
          <p className="tutor-safety-note">
            Check equations against the chapter sources. Never send generated
            commands directly to powered hardware without limits, an emergency
            stop, and human review.
          </p>
            </>
          )}
        </section>
      </details>
    </section>
  );
}

function getCallableTutorFailureCode(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "cancelled";
  }
  const code = (
    error
    && typeof error === "object"
    && "code" in error
    && typeof error.code === "string"
  ) ? error.code : "";
  if (code.includes("unauthenticated")) return "authentication_required";
  if (code.includes("permission-denied")) return "email_verification_required";
  if (code.includes("invalid-argument")) return "invalid_request";
  if (code.includes("resource-exhausted")) return "provider_busy";
  if (code.includes("deadline-exceeded")) return "timeout";
  if (code.includes("unavailable")) return "network";
  if (code.includes("failed-precondition")) return "configuration";
  if (code.includes("cancelled")) return "cancelled";
  return "unknown";
}
