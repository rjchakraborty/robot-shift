/*
 * The generic visual generator has one reusable grammar per robotics domain.
 * Rendering that grammar on every day made different topics look identical.
 * Keep one representative, manually reviewed use of each post-foundation
 * grammar, plus the exact beginner visuals authored for Days 1–14.
 */
export const VALIDATED_VISUAL_DAY_IDS = [
  1,
  3,
  5,
  7,
  9,
  13,
  14,
  17,
  21,
  26,
  29,
  40,
  50,
  59,
  72,
  78,
  85,
  95,
  99,
  141,
] as const;

const validatedVisualDays = new Set<number>(VALIDATED_VISUAL_DAY_IDS);

export function shouldRenderLessonVisual(
  dayId: number,
  chapterRequestedVisual: boolean,
) {
  return chapterRequestedVisual && validatedVisualDays.has(dayId);
}
