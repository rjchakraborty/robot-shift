import type { ChapterContent } from "../chapter-content-types";

type ChapterLoader = () => Promise<ChapterContent>;

export const CHAPTER_COUNT = 26;

const chapterLoaders: Readonly<Record<number, ChapterLoader>> = {
  1: () => import("./week-01").then((module) => module.week01Content),
  2: () => import("./week-02").then((module) => module.week02Content),
  3: () => import("./week-03").then((module) => module.week03Content),
  4: () => import("./week-04").then((module) => module.week04Content),
  5: () => import("./week-05").then((module) => module.week05Content),
  6: () => import("./week-06").then((module) => module.week06Content),
  7: () => import("./week-07").then((module) => module.week07Content),
  8: () => import("./week-08").then((module) => module.week08Content),
  9: () => import("./week-09").then((module) => module.week09Content),
  10: () => import("./week-10").then((module) => module.week10Content),
  11: () => import("./week-11").then((module) => module.week11Content),
  12: () => import("./week-12").then((module) => module.week12Content),
  13: () => import("./week-13").then((module) => module.week13Content),
  14: () => import("./week-14").then((module) => module.week14Content),
  15: () => import("./week-15").then((module) => module.week15Content),
  16: () => import("./week-16").then((module) => module.week16Content),
  17: () => import("./week-17").then((module) => module.week17Content),
  18: () => import("./week-18").then((module) => module.week18Content),
  19: () => import("./week-19").then((module) => module.week19Content),
  20: () => import("./week-20").then((module) => module.week20Content),
  21: () => import("./week-21").then((module) => module.week21Content),
  22: () => import("./week-22").then((module) => module.week22Content),
  23: () => import("./week-23").then((module) => module.week23Content),
  24: () => import("./week-24").then((module) => module.week24Content),
  25: () => import("./week-25").then((module) => module.week25Content),
  26: () => import("./week-26").then((module) => module.week26Content),
};

const chapterCache = new Map<number, Promise<ChapterContent>>();

export async function loadChapterContent(week: number): Promise<ChapterContent> {
  if (!Number.isInteger(week) || week < 1 || week > CHAPTER_COUNT) {
    throw new RangeError(`No RobotShift chapter exists for week ${week}.`);
  }

  const cached = chapterCache.get(week);
  if (cached) return cached;

  const pending = chapterLoaders[week]()
    .then((chapter) => {
      if (chapter.week !== week) {
        throw new Error(
          `Chapter loader ${week} returned content for week ${chapter.week}.`,
        );
      }
      return chapter;
    })
    .catch((error: unknown) => {
      chapterCache.delete(week);
      throw error;
    });
  chapterCache.set(week, pending);
  return pending;
}

export async function loadAllChapterContent(): Promise<readonly ChapterContent[]> {
  return Promise.all(
    Array.from(
      { length: CHAPTER_COUNT },
      (_, index) => loadChapterContent(index + 1),
    ),
  );
}
