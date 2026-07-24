export const REVIEWED_FOUNDATION_MEDIA_DAY_IDS = [
  1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14,
] as const;

const reviewedFoundationMediaDays = new Set<number>(
  REVIEWED_FOUNDATION_MEDIA_DAY_IDS,
);

export function hasReviewedFoundationTopicMedia(dayId: number) {
  return reviewedFoundationMediaDays.has(dayId);
}
