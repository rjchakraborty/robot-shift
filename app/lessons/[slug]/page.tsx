import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadChapterContent } from "../../chapter-content";
import { curriculumDays, phases, type CurriculumDay } from "../../curriculum";
import { LessonArticle } from "../../lesson-article";
import { lessonForDay } from "../../lessons";
import { AccountControl } from "../../auth/account-control";
import {
  COURSE_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
  absoluteUrl,
  lessonDescription,
  lessonPath,
  lessonSlug,
} from "../../seo";
import styles from "./page.module.css";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

const lessonsBySlug = new Map(
  curriculumDays.map((day) => [lessonSlug(day), day] as const),
);

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return curriculumDays.map((day) => ({ slug: lessonSlug(day) }));
}

function findLesson(slug: string): CurriculumDay {
  const day = lessonsBySlug.get(slug);
  if (!day) notFound();
  return day;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const day = findLesson((await params).slug);
  const title = `Day ${day.id}: ${day.title}`;
  const description = lessonDescription(day);
  const canonical = lessonPath(day);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "article",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

function lessonStructuredData(day: CurriculumDay) {
  const url = absoluteUrl(lessonPath(day));
  const courseId = `${SITE_URL.origin}/#course`;
  const organizationId = `${SITE_URL.origin}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: SITE_URL.origin,
      },
      {
        "@type": "Course",
        "@id": courseId,
        name: COURSE_TITLE,
        description: SITE_DESCRIPTION,
        url: SITE_URL.origin,
        provider: {
          "@id": organizationId,
        },
        inLanguage: "en",
      },
      {
        "@type": "LearningResource",
        "@id": `${url}#lesson`,
        url,
        name: `Day ${day.id}: ${day.title}`,
        description: lessonDescription(day),
        inLanguage: "en",
        learningResourceType: "Lesson",
        educationalUse: "Self-study",
        timeRequired: `PT${day.minutes}M`,
        position: day.id,
        teaches: day.focus,
        isPartOf: {
          "@id": courseId,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Robot/Shift",
            item: SITE_URL.origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `Day ${day.id}: ${day.title}`,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const day = findLesson((await params).slug);
  const phase = phases.find((item) => item.id === day.phaseId);
  const chapter = await loadChapterContent(day.week);
  const deepDive = chapter.days.find((item) => item.dayId === day.id);
  const lesson = lessonForDay(day);
  const previousDay = curriculumDays[day.id - 2];
  const nextDay = curriculumDays[day.id];

  if (!phase || !deepDive) {
    throw new Error(`Incomplete lesson content for curriculum day ${day.id}.`);
  }

  const structuredData = JSON.stringify(lessonStructuredData(day)).replace(
    /</g,
    "\\u003c",
  );

  return (
    <div className={styles.page}>
      <div className="view-wrap">
        <div className={styles.topline}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Robot/Shift</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Day {day.id}</span>
          </nav>
          <AccountControl />
        </div>

        <header className={`mission-hero ${styles.hero}`}>
          <div className={`hero-copy ${styles.heroCopy}`}>
            <p className="hero-meta">
              Phase {phase.number} · Week {day.week} · {day.minutes} minutes
            </p>
            <h1>
              Day {day.id}: {day.title}
            </h1>
            <p className={styles.summary}>{day.focus}</p>
          </div>
        </header>

        <main id="lesson-content">
          <LessonArticle
            chapter={chapter}
            day={day}
            deepDive={deepDive}
            lesson={lesson}
          />
        </main>

        <nav className="day-navigation" aria-label="Lesson sequence">
          {previousDay ? (
            <Link
              className={styles.sequenceLink}
              href={lessonPath(previousDay)}
              rel="prev"
            >
              ← Day {previousDay.id}: {previousDay.title}
            </Link>
          ) : (
            <span className={styles.sequencePlaceholder} aria-hidden="true" />
          )}
          <span>
            Day {day.id} of {curriculumDays.length}
          </span>
          {nextDay ? (
            <Link
              className={styles.sequenceLink}
              href={lessonPath(nextDay)}
              rel="next"
            >
              Day {nextDay.id}: {nextDay.title} →
            </Link>
          ) : (
            <span className={styles.sequencePlaceholder} aria-hidden="true" />
          )}
        </nav>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
    </div>
  );
}
