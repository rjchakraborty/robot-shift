import type { CurriculumDay } from "./curriculum";

export const SITE_URL = new URL("https://robotshift.web.app");
export const SITE_NAME = "Robot/Shift";
export const HOME_TITLE = "Robot/Shift — 180-Day Robotics Field Manual";
export const COURSE_TITLE = HOME_TITLE;
export const SITE_DESCRIPTION =
  "A practical 180-day robotics course and AI tutor for a software engineer moving into embodied AI.";
export const SOCIAL_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Robot/Shift 180-day robotics field manual",
} as const;

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= 80) return slug;

  return slug
    .slice(0, 80)
    .replace(/-[^-]*$/, "")
    .replace(/-+$/, "");
}

export function lessonSlug(day: CurriculumDay): string {
  return `${String(day.id).padStart(3, "0")}-${slugify(day.title)}`;
}

export function lessonPath(day: CurriculumDay): string {
  return `/lessons/${lessonSlug(day)}/`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function lessonDescription(day: CurriculumDay): string {
  const suffix = ` Complete Day ${day.id} of Robot/Shift's 180-day practical robotics course in ${day.minutes} minutes.`;
  const availableSummaryLength = 160 - suffix.length;
  const summary = `${day.title}. ${day.focus}`.trim();

  if (summary.length <= availableSummaryLength) {
    return `${summary}${suffix}`;
  }

  const shortenedSummary = summary
    .slice(0, Math.max(0, availableSummaryLength - 1))
    .replace(/\s+\S*$/, "")
    .replace(/[,:;.!?]+$/, "");

  return `${shortenedSummary}…${suffix}`;
}
