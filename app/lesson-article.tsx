"use client";

import type { ChapterContent, DailyLessonDeepDive } from "./chapter-content-types";
import type { CurriculumDay } from "./curriculum";
import { hasReviewedFoundationTopicMedia } from "./lesson-media-days";
import { LessonMediaPanel } from "./lesson-media-panel";
import { LessonVisual } from "./lesson-visual";
import { allDayVisuals } from "./lesson-visuals";
import type { DayLesson } from "./lessons";
import { RichText } from "./rich-text";
import { shouldRenderLessonVisual } from "./validated-visuals";

type LessonArticleProps = {
  chapter: ChapterContent;
  day: CurriculumDay;
  deepDive: DailyLessonDeepDive;
  lesson: DayLesson;
};

function StepList({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="lesson-article__steps">
      {steps.map((step, index) => (
        <li key={`${index}-${step}`}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <RichText content={step} className="lesson-article__text" />
        </li>
      ))}
    </ol>
  );
}

function TeachingText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <RichText
      content={content}
      className={className
        ? `lesson-article__text ${className}`
        : "lesson-article__text"}
    />
  );
}

export function LessonArticle({
  chapter,
  day,
  deepDive,
  lesson,
}: LessonArticleProps) {
  const visual = allDayVisuals[day.id - 1];
  const firstDayOfChapter = chapter.days[0]?.dayId === day.id;
  const showVisual = shouldRenderLessonVisual(day.id, deepDive.visual.show);
  const showFoundationTopicMedia = (
    !firstDayOfChapter
    && hasReviewedFoundationTopicMedia(day.id)
  );

  return (
    <article
      className="lesson-article"
      aria-labelledby={
        firstDayOfChapter
          ? `chapter-title-${day.id}`
          : `lesson-article-title-${day.id}`
      }
    >
      {firstDayOfChapter ? (
        <header className="chapter-opening">
          <p className="lesson-article__eyebrow">
            Chapter {String(chapter.week).padStart(2, "0")}
          </p>
          <h2 id={`chapter-title-${day.id}`}>{chapter.title}</h2>
          <p className="chapter-opening__purpose">{chapter.purpose}</p>
          <div className="chapter-opening__columns">
            <section aria-labelledby={`chapter-prerequisites-${day.id}`}>
              <h3 id={`chapter-prerequisites-${day.id}`}>Before you start</h3>
              <ul>
                {chapter.prerequisites.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
            <section aria-labelledby={`chapter-outcomes-${day.id}`}>
              <h3 id={`chapter-outcomes-${day.id}`}>By the end</h3>
              <ul>
                {chapter.outcomes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          </div>
        </header>
      ) : (
        <p className="lesson-article__chapter-line">
          Chapter {String(chapter.week).padStart(2, "0")} · {chapter.title}
        </p>
      )}

      <section className="lesson-article__section lesson-article__understand">
        <p className="lesson-article__eyebrow">Understand</p>
        <h2 id={`lesson-article-title-${day.id}`}>
          Build the physical picture first
        </h2>
        <TeachingText
          content={deepDive.mentalModel}
          className="lesson-article__standfirst"
        />
        <div className="lesson-article__prose">
          {deepDive.explanation.map((paragraph, index) => (
            <TeachingText
              key={`${index}-${paragraph}`}
              content={paragraph}
              className="lesson-article__paragraph"
            />
          ))}
        </div>
      </section>

      <section className="lesson-article__section" aria-labelledby={`terms-title-${day.id}`}>
        <p className="lesson-article__eyebrow">Words you need</p>
        <h2 id={`terms-title-${day.id}`}>Name each idea precisely</h2>
        <dl className="lesson-article__definitions">
          {deepDive.keyTerms.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>
                <TeachingText content={item.meaning} />
                <div className="lesson-article__supporting">
                  <strong>Physical example:</strong>{" "}
                  <TeachingText content={item.physicalExample} />
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {showVisual ? (
        <section className="lesson-article__section lesson-article__visual" aria-labelledby={`visual-title-${day.id}`}>
          <p className="lesson-article__eyebrow">Visual model</p>
          <h2 id={`visual-title-${day.id}`}>See the relationship</h2>
          <LessonVisual
            spec={visual}
            mode={deepDive.visual.mode}
          />
        </section>
      ) : null}

      <section className="lesson-article__section" aria-labelledby={`math-title-${day.id}`}>
        <p className="lesson-article__eyebrow">Math, one line at a time</p>
        <h2 id={`math-title-${day.id}`}>Work through today’s relationship</h2>
        <RichText
          content={lesson.math.connectionMarkdown ?? `$$\n${lesson.math.latex}\n$$`}
          className="lesson-article__math-bridge"
        />

        <div className="lesson-article__worked">
          <h3>{deepDive.workedExample.title}</h3>
          <TeachingText content={deepDive.workedExample.setup} />
          <StepList steps={deepDive.workedExample.steps} />
          <div className="lesson-article__result">
            <strong>Result</strong>
            <TeachingText content={deepDive.workedExample.result} />
          </div>
          <div className="lesson-article__takeaway">
            <strong>What this proves</strong>
            <TeachingText content={deepDive.workedExample.takeaway} />
          </div>
        </div>
      </section>

      <section className="lesson-article__section" aria-labelledby={`examples-title-${day.id}`}>
        <p className="lesson-article__eyebrow">Physical examples</p>
        <h2 id={`examples-title-${day.id}`}>Where this appears in real life</h2>
        <div className="lesson-article__examples">
          {deepDive.physicalExamples.map((example, index) => (
            <article key={example.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{example.title}</h3>
                <TeachingText content={example.scenario} />
                <div className="lesson-article__supporting">
                  <strong>Look for:</strong>{" "}
                  <TeachingText content={example.lookFor} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lesson-article__section" aria-labelledby={`exercise-title-${day.id}`}>
        <p className="lesson-article__eyebrow">Hands-on exercise</p>
        <h2 id={`exercise-title-${day.id}`}>Make the idea observable</h2>
        <TeachingText content={deepDive.handsOn.setup} />
        <StepList steps={deepDive.handsOn.steps} />
        <div className="lesson-article__observation">
          <strong>Observe</strong>
          <TeachingText content={deepDive.handsOn.observe} />
          <strong>Done when</strong>
          <TeachingText content={deepDive.handsOn.doneWhen} />
        </div>
        <div className="lesson-article__deliverable">
          <h3>Build today</h3>
          <TeachingText content={day.lab} />
          <h3>Evidence to save</h3>
          <TeachingText content={day.evidence} />
          {day.checkpoint ? (
            <>
              <h3>Project gate</h3>
              <TeachingText content={day.checkpoint} />
            </>
          ) : null}
        </div>
      </section>

      <section className="lesson-article__section" aria-labelledby={`mistakes-title-${day.id}`}>
        <p className="lesson-article__eyebrow">Common mistakes</p>
        <h2 id={`mistakes-title-${day.id}`}>Catch the wrong mental model</h2>
        <div className="lesson-article__mistakes">
          {deepDive.commonMistakes.map((item) => (
            <div key={item.mistake}>
              <strong>Wrong</strong>
              <TeachingText content={item.mistake} />
              <strong>Better</strong>
              <TeachingText content={item.correction} />
            </div>
          ))}
        </div>
      </section>

      <section className="lesson-article__section lesson-article__career" aria-labelledby={`career-title-${day.id}`}>
        <p className="lesson-article__eyebrow">Job connection</p>
        <h2 id={`career-title-${day.id}`}>How this becomes employable evidence</h2>
        <TeachingText content={deepDive.jobConnection.workExample} />
        <p className="lesson-article__role-label">Relevant target roles</p>
        <ul>
          {deepDive.jobConnection.roles.map((role) => <li key={role}>{role}</li>)}
        </ul>
      </section>

      <section
        className="lesson-article__section lesson-article__interview"
        aria-labelledby={`interview-title-${day.id}`}
      >
        <p className="lesson-article__eyebrow">
          Chapter {String(chapter.week).padStart(2, "0")} interview drill
        </p>
        <h2 id={`interview-title-${day.id}`}>
          Interview questions: {day.title}
        </h2>
        <p className="lesson-article__interview-intro">
          Practise a 60–90 second answer: define the idea, connect it to a
          physical robot, state assumptions, frames, and units when relevant,
          then finish with the failure signal or evidence you would inspect.
        </p>
        <div className="lesson-article__interview-scenario">
          <p className="lesson-article__role-label">Primary interview scenario</p>
          <TeachingText content={deepDive.jobConnection.interviewPrompt} />
          <p className="lesson-article__interview-pattern">
            <strong>Answer shape:</strong> clarify the situation → trace the
            physical and software path → test the most likely boundaries →
            name the evidence that would confirm the result.
          </p>
        </div>
        <p className="lesson-article__role-label lesson-article__followup-label">
          Technical follow-up questions
        </p>
        <div className="lesson-article__checks">
          {deepDive.checkQuestions.map((item, index) => (
            <details key={item.question}>
              <summary><span>Q{index + 1}</span>{item.question}</summary>
              <div className="lesson-article__answer">
                <strong>Model interview answer</strong>
                <TeachingText content={item.answer} />
              </div>
            </details>
          ))}
        </div>
      </section>

      {firstDayOfChapter ? (
        <LessonMediaPanel
          week={chapter.week}
          dayId={day.id}
          sources={chapter.sources}
          label="Chapter references"
        />
      ) : null}

      {showFoundationTopicMedia ? (
        <LessonMediaPanel
          week={chapter.week}
          dayId={day.id}
          sources={[]}
          label="Topic reference"
        />
      ) : null}
    </article>
  );
}
