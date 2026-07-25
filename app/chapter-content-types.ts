import type { Resource } from "./curriculum";
import type { VisualMode } from "./lesson-visuals";

export type ChapterSource = Resource & {
  useFor: string;
};

export type KeyTerm = {
  term: string;
  meaning: string;
  physicalExample: string;
};

export type PhysicalExample = {
  title: string;
  scenario: string;
  lookFor: string;
};

export type WorkedExample = {
  title: string;
  setup: string;
  steps: readonly string[];
  result: string;
  takeaway: string;
};

export type HandsOnExercise = {
  setup: string;
  steps: readonly string[];
  observe: string;
  doneWhen: string;
};

export type JobConnection = {
  roles: readonly string[];
  workExample: string;
  interviewPrompt: string;
};

export type CommonMistake = {
  mistake: string;
  correction: string;
};

export type KnowledgeCheck = {
  question: string;
  answer: string;
};

export type DailyLessonDeepDive = {
  dayId: number;
  mentalModel: string;
  explanation: readonly string[];
  keyTerms: readonly KeyTerm[];
  physicalExamples: readonly PhysicalExample[];
  workedExample: WorkedExample;
  handsOn: HandsOnExercise;
  jobConnection: JobConnection;
  commonMistakes: readonly CommonMistake[];
  checkQuestions: readonly KnowledgeCheck[];
  visual: {
    show: boolean;
    mode: VisualMode;
    reason: string;
  };
};

export type ChapterContent = {
  week: number;
  title: string;
  purpose: string;
  teachingBoundary?: string;
  prerequisites: readonly string[];
  outcomes: readonly string[];
  jobTargets: readonly string[];
  sources: readonly ChapterSource[];
  days: readonly DailyLessonDeepDive[];
};
