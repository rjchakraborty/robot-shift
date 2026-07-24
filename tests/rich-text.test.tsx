import assert from "node:assert/strict";
import test from "node:test";

import katex from "katex";
import { renderToStaticMarkup } from "react-dom/server";
import { curriculumDays } from "../app/curriculum";
import { createInteractiveMathModel } from "../app/interactive-math";
import { allDayVisuals } from "../app/lesson-visuals";
import { lessonForDay, topicDetails, weekLessonPacks } from "../app/lessons";
import { RichText } from "../app/rich-text";

test("renders structured Markdown and accessible KaTeX without trusting model HTML", () => {
  const approved = "https://example.com/reference";
  const content = String.raw`
## Tiny walkthrough

1. Start with $\mathbf v=(3,4)\,\mathrm{m}$.
2. Compute:

$$
\lVert\mathbf v\rVert=\sqrt{3^2+4^2}=5\,\mathrm{m}
$$

[Approved source](${approved})

[Unapproved source](https://tracker.invalid/collect)

![Remote tracker](https://tracker.invalid/pixel.png)

<script>alert("unsafe")</script>
`;

  const html = renderToStaticMarkup(
    <RichText content={content} allowedLinks={[approved]} />,
  );

  assert.match(html, /<h2>Tiny walkthrough<\/h2>/);
  assert.match(html, /<ol>/);
  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /href="https:\/\/example\.com\/reference"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /<script|alert\("unsafe"\)/);
  assert.doesNotMatch(html, /<img|tracker\.invalid/);
});

test("all curated weekly formulas compile as strict, untrusted KaTeX", () => {
  assert.equal(weekLessonPacks.length, 26);

  for (const [index, pack] of weekLessonPacks.entries()) {
    assert.doesNotThrow(
      () => katex.renderToString(pack.math.latex, {
        throwOnError: true,
        trust: false,
        strict: "error",
        output: "htmlAndMathml",
      }),
      `week ${index + 1} has invalid LaTeX: ${pack.math.latex}`,
    );
  }
});

test("all visual and interactive formula variants compile as strict KaTeX", () => {
  const visualFormulas = new Set<string>();
  const interactiveFormulas = new Set<string>();

  for (const visual of allDayVisuals) {
    visualFormulas.add(visual.math.latex);
    interactiveFormulas.add(createInteractiveMathModel(visual).evaluation.formulaLatex);
  }

  assert.ok(visualFormulas.size >= 14);
  assert.ok(interactiveFormulas.size >= 14);
  for (const latex of [...visualFormulas, ...interactiveFormulas]) {
    assert.doesNotThrow(
      () => katex.renderToString(latex, {
        throwOnError: true,
        trust: false,
        strict: "error",
        output: "htmlAndMathml",
      }),
      `invalid visual or interactive LaTeX: ${latex}`,
    );
  }
});

test("all 180 topic equations have explicit authored math Markdown", () => {
  assert.equal(Object.keys(topicDetails).length, 180);

  for (const day of curriculumDays) {
    const detail = topicDetails[day.id];
    const lesson = lessonForDay(day);
    assert.ok(detail.mathMarkdown, `day ${day.id} needs authored math Markdown`);
    assert.match(detail.mathMarkdown, /\$[^$]+\$/, `day ${day.id} needs a KaTeX expression`);
    assert.equal(lesson.math.connectionMarkdown, detail.mathMarkdown);

    const expressions = [
      ...detail.mathMarkdown.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g),
    ].map((match) => (match[1] ?? match[2]).trim());
    assert.ok(expressions.length > 0, `day ${day.id} needs at least one parsed equation`);
    for (const expression of expressions) {
      assert.doesNotThrow(
        () => katex.renderToString(expression, {
          throwOnError: true,
          trust: false,
          strict: "error",
          output: "htmlAndMathml",
        }),
        `day ${day.id} has invalid authored math: ${expression}`,
      );
    }
  }
});
