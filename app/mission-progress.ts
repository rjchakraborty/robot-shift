export const MISSION_TASK_PARTS = ["learn", "build", "prove"] as const;

export type MissionTaskPart = (typeof MISSION_TASK_PARTS)[number];

export const MISSION_TASK_XP: Readonly<Record<MissionTaskPart, number>> = {
  learn: 20,
  build: 30,
  prove: 50,
};

export const MISSION_TASK_LABELS: Readonly<Record<MissionTaskPart, string>> = {
  learn: "Understand",
  build: "Build",
  prove: "Prove",
};

export const MISSION_XP_PER_DAY = 100;

export type MissionCompletionMap = Readonly<
  Record<string, boolean | undefined>
>;

export type MissionEvidenceMap = Readonly<
  Record<string, string | undefined>
>;

export type ProjectGateProgress = {
  id: string;
  label: string;
  expectedCount: number;
  checks?: readonly boolean[];
};

export type DailyMissionProgress = {
  dayId: number;
  xp: number;
  maxXp: number;
  completedParts: readonly MissionTaskPart[];
  nextPart: MissionTaskPart | null;
  complete: boolean;
};

export type ActiveMissionAction = {
  status: "active";
  dayId: number;
  part: MissionTaskPart;
  label: string;
  xp: number;
};

export type CourseCompleteAction = {
  status: "course-complete";
  dayId: number;
  part: null;
  label: "Course complete";
  xp: 0;
};

export type NextMissionAction = ActiveMissionAction | CourseCompleteAction;

export type MissionRankId =
  | "explorer"
  | "foundations-builder"
  | "ros-integrator"
  | "autonomy-builder"
  | "robot-learning-engineer"
  | "embodied-ai-integrator"
  | "deployment-engineer"
  | "mission-complete";

export type MissionRank = {
  id: MissionRankId;
  label: string;
  minimumXp: number;
  nextMinimumXp: number | null;
  xpIntoRank: number;
  xpForRank: number;
  percentToNextRank: number;
};

export type MissionBadge =
  | {
      id: "first-proof";
      label: "First proof";
      earned: boolean;
      dayId: number | null;
    }
  | {
      id: "seven-day-chain";
      label: "Seven-day chain";
      earned: boolean;
    }
  | {
      id: `project-gate:${string}`;
      label: string;
      earned: boolean;
      projectId: string;
    };

export type MissionProgress = {
  totalXp: number;
  maxXp: number;
  daily: readonly DailyMissionProgress[];
  proofChain: number;
  rank: MissionRank;
  nextAction: NextMissionAction;
  badges: readonly MissionBadge[];
};

type RankDefinition = {
  id: MissionRankId;
  label: string;
  minimumXp: number;
};

const MISSION_RANKS: readonly RankDefinition[] = [
  { id: "explorer", label: "Robot Explorer", minimumXp: 0 },
  {
    id: "foundations-builder",
    label: "Foundations Builder",
    minimumXp: 2_800,
  },
  { id: "ros-integrator", label: "ROS 2 Integrator", minimumXp: 5_600 },
  { id: "autonomy-builder", label: "Autonomy Builder", minimumXp: 8_400 },
  {
    id: "robot-learning-engineer",
    label: "Robot Learning Builder",
    minimumXp: 11_900,
  },
  {
    id: "embodied-ai-integrator",
    label: "Embodied AI Integrator",
    minimumXp: 14_700,
  },
  {
    id: "deployment-engineer",
    label: "Deployment Integrator",
    minimumXp: 17_500,
  },
  {
    id: "mission-complete",
    label: "Mission Complete",
    minimumXp: 18_000,
  },
];

export function missionTaskKey(dayId: number, part: MissionTaskPart) {
  return `${dayId}:${part}`;
}

function assertTotalDays(totalDays: number) {
  if (!Number.isInteger(totalDays) || totalDays < 1) {
    throw new RangeError("totalDays must be a positive integer");
  }
}

function isPartComplete(
  completed: MissionCompletionMap,
  evidence: MissionEvidenceMap,
  dayId: number,
  part: MissionTaskPart,
) {
  if (completed[missionTaskKey(dayId, part)] !== true) return false;
  return part !== "prove" || (evidence[String(dayId)] ?? "").trim().length > 0;
}

export function getDailyMissionProgress(
  completed: MissionCompletionMap,
  totalDays = 180,
  evidence: MissionEvidenceMap = {},
): readonly DailyMissionProgress[] {
  assertTotalDays(totalDays);

  return Array.from({ length: totalDays }, (_, index) => {
    const dayId = index + 1;
    const completedParts = MISSION_TASK_PARTS.filter((part) =>
      isPartComplete(completed, evidence, dayId, part),
    );
    const nextPart =
      MISSION_TASK_PARTS.find(
        (part) => !isPartComplete(completed, evidence, dayId, part),
      ) ?? null;
    const xp = completedParts.reduce(
      (sum, part) => sum + MISSION_TASK_XP[part],
      0,
    );

    return {
      dayId,
      xp,
      maxXp: MISSION_XP_PER_DAY,
      completedParts,
      nextPart,
      complete: nextPart === null,
    };
  });
}

export function getProofChain(
  completed: MissionCompletionMap,
  totalDays = 180,
  evidence: MissionEvidenceMap = {},
) {
  const daily = getDailyMissionProgress(completed, totalDays, evidence);
  const firstOpenIndex = daily.findIndex((day) => !day.complete);
  return firstOpenIndex === -1 ? totalDays : firstOpenIndex;
}

export function getNextMissionAction(
  completed: MissionCompletionMap,
  totalDays = 180,
  evidence: MissionEvidenceMap = {},
): NextMissionAction {
  const daily = getDailyMissionProgress(completed, totalDays, evidence);
  const nextDay = daily.find((day) => day.nextPart !== null);

  if (!nextDay || nextDay.nextPart === null) {
    return {
      status: "course-complete",
      dayId: totalDays,
      part: null,
      label: "Course complete",
      xp: 0,
    };
  }

  return {
    status: "active",
    dayId: nextDay.dayId,
    part: nextDay.nextPart,
    label: MISSION_TASK_LABELS[nextDay.nextPart],
    xp: MISSION_TASK_XP[nextDay.nextPart],
  };
}

export function getMissionRank(
  totalXp: number,
  maxXp = 18_000,
): MissionRank {
  const boundedXp = Math.min(Math.max(0, totalXp), maxXp);
  const availableRanks = MISSION_RANKS.filter(
    (rank) => rank.minimumXp <= maxXp,
  );
  const definition =
    [...availableRanks].reverse().find((rank) => boundedXp >= rank.minimumXp) ??
    MISSION_RANKS[0];
  const definitionIndex = availableRanks.findIndex(
    (rank) => rank.id === definition.id,
  );
  const nextDefinition = availableRanks[definitionIndex + 1] ?? null;
  const nextMinimumXp = nextDefinition?.minimumXp ?? null;
  const xpForRank =
    nextMinimumXp === null
      ? 0
      : Math.max(0, nextMinimumXp - definition.minimumXp);
  const xpIntoRank =
    nextMinimumXp === null
      ? 0
      : Math.min(xpForRank, boundedXp - definition.minimumXp);

  return {
    ...definition,
    nextMinimumXp,
    xpIntoRank,
    xpForRank,
    percentToNextRank:
      nextMinimumXp === null || xpForRank === 0
        ? 100
        : Math.floor((xpIntoRank / xpForRank) * 100),
  };
}

export function getMissionBadges({
  completed,
  evidence = {},
  totalDays = 180,
  proofChain = getProofChain(completed, totalDays, evidence),
  projectGates = [],
}: {
  completed: MissionCompletionMap;
  evidence?: MissionEvidenceMap;
  totalDays?: number;
  proofChain?: number;
  projectGates?: readonly ProjectGateProgress[];
}): readonly MissionBadge[] {
  assertTotalDays(totalDays);

  let firstProofDay: number | null = null;
  for (let dayId = 1; dayId <= totalDays; dayId += 1) {
    if (
      isPartComplete(completed, evidence, dayId, "prove")
    ) {
      firstProofDay = dayId;
      break;
    }
  }

  const badges: MissionBadge[] = [
    {
      id: "first-proof",
      label: "First proof",
      earned: firstProofDay !== null,
      dayId: firstProofDay,
    },
    {
      id: "seven-day-chain",
      label: "Seven-day chain",
      earned: proofChain >= 7,
    },
  ];

  for (const gate of projectGates) {
    const checks = gate.checks ?? [];
    const earned =
      Number.isInteger(gate.expectedCount) &&
      gate.expectedCount > 0 &&
      checks.length === gate.expectedCount &&
      checks.every((check) => check === true);
    badges.push({
      id: `project-gate:${gate.id}`,
      label: gate.label,
      earned,
      projectId: gate.id,
    });
  }

  return badges;
}

export function deriveMissionProgress({
  completed,
  evidence = {},
  projectGates = [],
  totalDays = 180,
}: {
  completed: MissionCompletionMap;
  evidence?: MissionEvidenceMap;
  projectGates?: readonly ProjectGateProgress[];
  totalDays?: number;
}): MissionProgress {
  const daily = getDailyMissionProgress(completed, totalDays, evidence);
  const totalXp = daily.reduce((sum, day) => sum + day.xp, 0);
  const maxXp = totalDays * MISSION_XP_PER_DAY;
  const proofChain = getProofChain(completed, totalDays, evidence);

  return {
    totalXp,
    maxXp,
    daily,
    proofChain,
    rank: getMissionRank(totalXp, maxXp),
    nextAction: getNextMissionAction(completed, totalDays, evidence),
    badges: getMissionBadges({
      completed,
      evidence,
      proofChain,
      projectGates,
      totalDays,
    }),
  };
}
