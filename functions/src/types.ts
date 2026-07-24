export const tutorModes = [
  "ask",
  "pareto",
  "simple",
  "math",
  "solve",
  "quiz",
  "story",
] as const;

export type TutorMode = (typeof tutorModes)[number];

export type StoredTutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: TutorMode;
  model?: string;
};

export type StoredTutorThread = {
  updatedAt: number;
  messages: StoredTutorMessage[];
};

export type TrackerState = {
  schemaVersion: 2;
  curriculumRevision: 2;
  completed: Record<string, boolean>;
  bookmarks: number[];
  notes: Record<string, string>;
  evidence: Record<string, string>;
  projectChecks: Record<string, boolean[]>;
  startedOn: string;
  weeklyHours: number;
  selectedDay: number;
};

export type TutorStore = {
  version: 2;
  curriculumRevision: 2;
  threads: Record<string, StoredTutorThread>;
};

export type LegacyMigrationPayload = {
  tracker: TrackerState;
  tutor: TutorStore;
  theme: "system" | "light" | "dark";
  trackerLegacyArchive: string | null;
  tutorLegacyArchive: string | null;
  sourceDigest: string;
  activateImported: boolean;
  operationId: string | null;
};

export type TutorContext = {
  dayId: number;
  week: number;
  title: string;
  focus: string;
  task: string;
  lab: string;
  evidence: string;
  minutes: number;
  bigIdea: string;
  pareto: string[];
  simpleExplanation: string[];
  math: {
    connectionMarkdown?: string;
    latex?: string;
  };
  examples: Array<{
    title: string;
    explanation: string;
    tryIt: string;
  }>;
  practice: unknown;
  quiz: unknown;
  teachBack: unknown;
  mentalModel: string;
  deepExplanation: string[];
  keyTerms: Array<{
    term: string;
    meaning: string;
    physicalExample: string;
  }>;
  workedExample: {
    title: string;
    setup: string;
    steps: string[];
    result: string;
    takeaway: string;
  };
  handsOn: {
    setup: string;
    steps: string[];
    observe: string;
    doneWhen: string;
  };
  commonMistakes: Array<{
    mistake: string;
    correction: string;
  }>;
  sources: Array<{
    label: string;
    url: string;
    useFor: string;
  }>;
};
