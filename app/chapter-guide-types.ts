export type CurriculumDriftRisk = "low" | "medium" | "high";

export const STARTER_RUNTIME_EVIDENCE =
  "The dependency-free starter is executed by repository tests on the supported Node.js baseline. Chapter-specific ROS 2, Gazebo, model, dataset, checkpoint, and hardware environments are learner-created unless the repository supplies an explicit asset; run the smoke check and preserve its versions and output before claiming runtime compatibility.";

export type ChapterEnvironmentContract = {
  baseline: string;
  compatibility: string;
  contractReviewedOn: string;
  runtimeEvidence: string;
  smokeCheck: string;
  driftRisk: CurriculumDriftRisk;
};

export type ChapterStarter = {
  title: string;
  fileName: string;
  language: "javascript";
  code: string;
  run: string;
  expectedOutput: string;
  plantedFailure: string;
};

export type ChapterDayThread = {
  dayId: number;
  bridge: string;
  whyNow: string;
  ignoreForNow: string;
  unlocks: string;
};

export type ChapterLearningGuide = {
  week: number;
  mission: {
    name: string;
    opening: readonly [string, string];
    finishLine: string;
  };
  learningContract: {
    whyNow: string;
    ignoreForNow: string;
    unlocks: string;
    evidence: string;
  };
  environment: ChapterEnvironmentContract;
  starter: ChapterStarter;
  dayThreads: readonly ChapterDayThread[];
};
