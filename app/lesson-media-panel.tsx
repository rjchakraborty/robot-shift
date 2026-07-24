"use client";

import { useState, type SyntheticEvent } from "react";
import type { Resource } from "./curriculum";
import type {
  LessonExploreLink,
  ResolvedLessonMedia,
} from "./lesson-media-catalog";
import styles from "./lesson-media-panel.module.css";

type LessonMediaPanelProps = {
  week: number;
  dayId: number;
  sources: readonly Resource[];
};

type ReadingItem = LessonExploreLink & { curated: boolean };

function mergedReading(
  explore: readonly LessonExploreLink[],
  sources: readonly Resource[],
): ReadingItem[] {
  const items: ReadingItem[] = [
    ...explore.map((item) => ({ ...item, curated: true })),
    ...sources.map((source) => ({
      title: source.label,
      publisher: "Lesson source",
      url: source.url,
      why: "Open the publisher page for the complete reference.",
      curated: false,
    })),
  ];

  return items.filter(
    (item, index) => items.findIndex((candidate) => candidate.url === item.url) === index,
  );
}

export function LessonMediaPanel({
  week,
  dayId,
  sources,
}: LessonMediaPanelProps) {
  const [loadedMedia, setLoadedMedia] = useState<{
    dayId: number;
    value: ResolvedLessonMedia;
  } | null>(null);
  const [playingVideoKey, setPlayingVideoKey] = useState<string | null>(null);
  const media = loadedMedia?.dayId === dayId ? loadedMedia.value : null;
  const reading = mergedReading(media?.explore ?? [], sources);
  const videoKey = media?.video ? `${dayId}:${media.video.youtubeId}` : null;
  const isPlaying = videoKey !== null && videoKey === playingVideoKey;

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (!event.currentTarget.open) {
      setPlayingVideoKey(null);
      return;
    }

    if (!media) {
      void import("./lesson-media-catalog").then(({ resolveLessonMedia }) => {
        setLoadedMedia({
          dayId,
          value: resolveLessonMedia(week, dayId),
        });
      });
    }
  }

  return (
    <details className={styles.panel} onToggle={handleToggle}>
      <summary className={styles.summary}>Watch / explore</summary>

      <div className={`${styles.body} ${media?.video ? "" : styles.noVideo}`}>
        {media?.video ? (
          <section className={styles.video} aria-labelledby={`lesson-video-${dayId}`}>
            <p className={styles.eyebrow}>{media.video.publisher}</p>
            <h4 className={styles.title} id={`lesson-video-${dayId}`}>
              {media.video.title}
            </h4>
            <p className={styles.why}>{media.video.why}</p>

            {isPlaying ? (
              <div className={styles.frameWrap}>
                <iframe
                  className={styles.frame}
                  src={`https://www.youtube-nocookie.com/embed/${media.video.youtubeId}?rel=0`}
                  title={media.video.title}
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <button
                className={styles.play}
                type="button"
                onClick={() => setPlayingVideoKey(videoKey)}
              >
                Play official video
              </button>
            )}

            <a
              className={styles.sourceLink}
              href={media.video.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open publisher source
            </a>
          </section>
        ) : null}

        <section className={styles.reading} aria-labelledby={`lesson-reading-${dayId}`}>
          <p className={styles.eyebrow}>Official references</p>
          <h4 id={`lesson-reading-${dayId}`}>Further reading</h4>
          <ul className={styles.readingList}>
            {reading.map((item) => (
              <li key={item.url}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                <small>
                  {item.publisher}
                  {item.curated ? ` · ${item.why}` : ""}
                </small>
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.attribution}>
          External media stays hosted by its publisher. Publisher names and source
          links are shown for attribution; RobotShift summaries are original study
          guidance.
        </p>
      </div>
    </details>
  );
}
