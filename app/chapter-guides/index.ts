import type { ChapterLearningGuide } from "../chapter-guide-types";

type GuideBatchLoader = () => Promise<readonly ChapterLearningGuide[]>;

const guideBatchLoaders: ReadonlyArray<{
  start: number;
  end: number;
  load: GuideBatchLoader;
}> = [
  {
    start: 1,
    end: 9,
    load: () => import("./guides-01-09").then(
      (module) => module.chapterGuides01To09,
    ),
  },
  {
    start: 10,
    end: 18,
    load: () => import("./guides-10-18").then(
      (module) => module.chapterGuides10To18,
    ),
  },
  {
    start: 19,
    end: 26,
    load: () => import("./guides-19-26").then(
      (module) => module.chapterGuides19To26,
    ),
  },
];

const guideCache = new Map<number, Promise<ChapterLearningGuide>>();

export async function loadChapterLearningGuide(
  week: number,
): Promise<ChapterLearningGuide> {
  if (!Number.isInteger(week) || week < 1 || week > 26) {
    throw new RangeError(`No RobotShift learning guide exists for week ${week}.`);
  }

  const cached = guideCache.get(week);
  if (cached) return cached;

  const batch = guideBatchLoaders.find(
    ({ start, end }) => week >= start && week <= end,
  );
  if (!batch) {
    throw new RangeError(`No RobotShift learning guide batch covers week ${week}.`);
  }

  const pending = batch.load()
    .then((guides) => {
      const guide = guides.find((item) => item.week === week);
      if (!guide) {
        throw new Error(`Learning guide batch omitted week ${week}.`);
      }
      return guide;
    })
    .catch((error: unknown) => {
      guideCache.delete(week);
      throw error;
    });

  guideCache.set(week, pending);
  return pending;
}

export async function loadAllChapterLearningGuides(): Promise<
  readonly ChapterLearningGuide[]
> {
  return Promise.all(
    Array.from(
      { length: 26 },
      (_, index) => loadChapterLearningGuide(index + 1),
    ),
  );
}
