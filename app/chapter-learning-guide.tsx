import type {
  ChapterDayThread,
  ChapterLearningGuide,
} from "./chapter-guide-types";
import { RichText } from "./rich-text";

type GuideSectionProps = {
  guide: ChapterLearningGuide;
  dayId: number;
};

function ContractItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd><RichText content={value} /></dd>
    </div>
  );
}

export function ChapterMissionOpening({ guide, dayId }: GuideSectionProps) {
  return (
    <section
      className="lesson-article__section chapter-mission"
      aria-labelledby={`chapter-mission-title-${dayId}`}
    >
      <p className="lesson-article__eyebrow">The field story</p>
      <h2 id={`chapter-mission-title-${dayId}`}>{guide.mission.name}</h2>
      <div className="lesson-article__prose">
        {guide.mission.opening.map((paragraph) => (
          <RichText
            key={paragraph}
            content={paragraph}
            className="lesson-article__text lesson-article__paragraph"
          />
        ))}
      </div>

      <dl className="chapter-learning-contract">
        <ContractItem label="Why this chapter now" value={guide.learningContract.whyNow} />
        <ContractItem label="Ignore for now" value={guide.learningContract.ignoreForNow} />
        <ContractItem label="This unlocks" value={guide.learningContract.unlocks} />
        <ContractItem label="Proof you will leave with" value={guide.learningContract.evidence} />
      </dl>

      <details className="chapter-environment">
        <summary>
          <span>Environment contract</span>
          {guide.environment.baseline}
        </summary>
        <dl>
          <ContractItem label="Compatibility boundary" value={guide.environment.compatibility} />
          <ContractItem label="Smoke check" value={guide.environment.smokeCheck} />
          <ContractItem label="Contract reviewed" value={guide.environment.contractReviewedOn} />
          <ContractItem label="Runtime evidence" value={guide.environment.runtimeEvidence} />
          <ContractItem label="Drift risk" value={guide.environment.driftRisk} />
        </dl>
      </details>
    </section>
  );
}

export function DailyMissionThread({
  thread,
}: {
  thread: ChapterDayThread;
}) {
  return (
    <section
      className="lesson-article__section lesson-article__thread"
      aria-labelledby={`mission-thread-title-${thread.dayId}`}
    >
      <p className="lesson-article__eyebrow">Today in the field story</p>
      <h2 id={`mission-thread-title-${thread.dayId}`}>
        One problem, then the next
      </h2>
      <RichText
        content={thread.bridge}
        className="lesson-article__text lesson-article__thread-copy"
      />
      <dl className="day-learning-contract">
        <ContractItem label="Why now" value={thread.whyNow} />
        <ContractItem label="Ignore today" value={thread.ignoreForNow} />
        <ContractItem label="Unlocks next" value={thread.unlocks} />
      </dl>
    </section>
  );
}

export function ChapterStarterPanel({ guide, dayId }: GuideSectionProps) {
  const titleId = `chapter-starter-title-${dayId}`;
  const fileId = `chapter-starter-file-${dayId}`;
  const downloadHref =
    `data:text/javascript;charset=utf-8,${encodeURIComponent(guide.starter.code)}`;

  return (
    <section
      className="lesson-article__section chapter-starter"
      aria-labelledby={titleId}
    >
      <p className="lesson-article__eyebrow">Chapter starter artifact</p>
      <h2 id={titleId}>{guide.starter.title}</h2>
      <p className="chapter-starter__finish">{guide.mission.finishLine}</p>
      <div className="chapter-starter__code">
        <div>
          <span id={fileId}>{guide.starter.fileName}</span>
          <span><span className="sr-only">Language: </span>JavaScript</span>
          <a
            className="chapter-starter__download"
            href={downloadHref}
            download={guide.starter.fileName}
          >
            Download starter
          </a>
        </div>
        <pre tabIndex={0} aria-labelledby={`${titleId} ${fileId}`}>
          <code>{guide.starter.code}</code>
        </pre>
      </div>
      <p className="chapter-starter__save">
        Download the file into your terminal&apos;s current folder, then run the
        command below. The expected output is exact.
      </p>
      <dl className="chapter-starter__contract">
        <ContractItem label="Run" value={guide.starter.run} />
        <ContractItem label="Expected output" value={guide.starter.expectedOutput} />
        <ContractItem label="Planted failure to diagnose" value={guide.starter.plantedFailure} />
      </dl>
    </section>
  );
}
