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
import { LessonArticle } from "./lesson-article";
import { lessonForDay } from "./lessons";
import {
  archiveLegacyPayload,
  CURRICULUM_REVISION,
  LEGACY_TUTOR_ARCHIVE_KEY,
  LEGACY_TUTOR_STORAGE_KEY,
  migrateLegacyTutorStore,
  parseTutorStoreV2,
  TUTOR_STORAGE_KEY,
  type StoredTutorMessage,
  type StoredTutorMode,
  type StoredTutorThread,
  type TutorStoreV2,
} from "./storage-migrations";

const RichText = lazy(() => import("./rich-text").then((module) => ({
  default: module.RichText,
})));

type LearningStudioProps = {
  day: CurriculumDay;
};

type TutorMode = StoredTutorMode;
type TutorRole = "user" | "assistant";
type TutorMessage = StoredTutorMessage;
type TutorThread = StoredTutorThread;
type TutorStore = TutorStoreV2;

const MAX_INPUT_LENGTH = 2_000;
const MAX_MESSAGE_LENGTH = 7_000;
const MAX_HISTORY_ITEM_LENGTH = 2_500;
const MAX_HISTORY_LENGTH = 10_000;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createMessageId() {
  if (
    typeof window !== "undefined"
    && typeof window.crypto?.randomUUID === "function"
  ) {
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
  const [chapter, setChapter] = useState<ChapterContent | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, TutorThread>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("ask");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const skipNextTutorSaveRef = useRef(false);
  const dayKey = String(day.id);
  const messages = threads[dayKey]?.messages ?? [];
  const deepDive = chapter?.days.find((item) => item.dayId === day.id);
  const approvedSourceUrls = useMemo(
    () => (chapter?.sources ?? lesson.sources).map((source) => source.url),
    [chapter, lesson.sources],
  );

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
    const timer = window.setTimeout(() => {
      try {
        const currentRaw = window.localStorage.getItem(TUTOR_STORAGE_KEY);
        if (currentRaw) {
          const parsed = parseTutorStoreV2(currentRaw);
          if (parsed) {
            setThreads(parsed.threads);
          } else {
            skipNextTutorSaveRef.current = true;
            setStorageNotice(
              "Saved version 2 tutor history was unreadable and was not overwritten.",
            );
          }
        } else {
          const legacyRaw = window.localStorage.getItem(LEGACY_TUTOR_STORAGE_KEY);
          if (legacyRaw) {
            archiveLegacyPayload(
              window.localStorage,
              LEGACY_TUTOR_ARCHIVE_KEY,
              legacyRaw,
            );
            const migration = migrateLegacyTutorStore(legacyRaw);
            if (migration) {
              setThreads(migration.store.threads);
              setStorageNotice(
                migration.archivedFoundationDays.length > 0
                  ? "Tutor chats for revised Days 1–14 were archived; unchanged later-day chats were migrated to version 2."
                  : "Version 1 tutor history was archived and migrated to version 2.",
              );
            } else {
              skipNextTutorSaveRef.current = true;
              setStorageNotice(
                "Version 1 tutor history was archived but could not be migrated.",
              );
            }
          }
        }
      } catch {
        setStorageNotice(
          "Tutor history is available for this visit, but this browser cannot save it.",
        );
      } finally {
        setStorageReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    if (skipNextTutorSaveRef.current) {
      skipNextTutorSaveRef.current = false;
      return;
    }

    try {
      const store: TutorStore = {
        version: 2,
        curriculumRevision: CURRICULUM_REVISION,
        threads,
      };
      window.localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(store));
    } catch {
      const timer = window.setTimeout(() => {
        setStorageNotice(
          "Tutor history is available for this visit, but the browser could not save it.",
        );
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [storageReady, threads]);

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
        !response.ok
        || !isRecord(payload)
        || typeof payload.answer !== "string"
        || payload.answer.trim().length === 0
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
        model: typeof payload.model === "string"
          ? payload.model.slice(0, 100)
          : undefined,
      };

      setThreads((current) => withUpdatedThread(
        current,
        submittedDay,
        (currentMessages) => [...currentMessages, assistantMessage],
      ));
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
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
            {messages.length > 0 || draft ? (
              <button
                type="button"
                className="clear-chat-button"
                onClick={clearChat}
              >
                Clear chat
              </button>
            ) : null}
          </header>

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
            {messages.length === 0 ? (
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
                ⌘/Ctrl + Enter · recent chat stays on this device and is sent to
                Gemini only when you ask
              </span>
              <button
                type="submit"
                className="primary-button"
                disabled={loading || !draft.trim()}
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
        </section>
      </details>
    </section>
  );
}
