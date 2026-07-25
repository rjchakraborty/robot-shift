import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadChapterContent } from "../app/chapter-content/index.ts";
import { curriculumDays } from "../app/curriculum.ts";
import { lessonForDay } from "../app/lessons.ts";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const output = resolve(
  scriptDirectory,
  "../functions/src/generated/lesson-context.json",
);
const chapterCache = new Map<number, Awaited<ReturnType<typeof loadChapterContent>>>();
const contexts = [];

for (const day of curriculumDays) {
  let chapter = chapterCache.get(day.week);
  if (!chapter) {
    chapter = await loadChapterContent(day.week);
    chapterCache.set(day.week, chapter);
  }
  const deepDive = chapter.days.find((item) => item.dayId === day.id);
  if (!deepDive) {
    throw new Error(`Missing tutor context for Day ${day.id}.`);
  }
  const lesson = lessonForDay(day);
  contexts.push({
    dayId: day.id,
    week: day.week,
    title: day.title,
    focus: day.focus,
    task: day.task,
    lab: day.lab,
    evidence: day.evidence,
    minutes: day.minutes,
    bigIdea: lesson.bigIdea,
    pareto: lesson.pareto,
    simpleExplanation: lesson.simpleExplanation,
    math: lesson.math,
    examples: lesson.examples,
    practice: lesson.practice,
    quiz: lesson.quiz,
    teachBack: lesson.teachBack,
    mentalModel: deepDive.mentalModel,
    deepExplanation: deepDive.explanation,
    keyTerms: deepDive.keyTerms,
    workedExample: deepDive.workedExample,
    handsOn: deepDive.handsOn,
    commonMistakes: deepDive.commonMistakes,
    teachingBoundary: chapter.teachingBoundary,
    sources: chapter.sources,
  });
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(contexts)}\n`, "utf8");
console.log(`Generated ${contexts.length} trusted tutor contexts.`);
