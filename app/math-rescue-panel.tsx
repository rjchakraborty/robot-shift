import type { MathRescue } from "./math-rescue";

export function MathRescuePanel({ rescue }: { rescue: MathRescue }) {
  return (
    <details className="math-rescue">
      <summary>
        <span>Prerequisite rescue · optional</span>
        {rescue.title}
      </summary>
      <div className="math-rescue-body">
        <p>{rescue.whyItMatters}</p>
        <dl className="math-symbols">
          {rescue.symbols.map((symbol) => (
            <div key={symbol.symbol}>
              <dt>{symbol.symbol}</dt>
              <dd>
                <span>{symbol.meaning}</span>
                <small>Unit: {symbol.unit}</small>
              </dd>
            </div>
          ))}
        </dl>
        <ol className="lesson-article__steps math-steps">
          {rescue.workedSteps.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <div className="math-analogy">
          <strong>Programmer analogy</strong>
          <p>{rescue.analogy}</p>
        </div>
        <details className="math-quick-check">
          <summary>{rescue.quickCheck}</summary>
          <p>{rescue.answer}</p>
        </details>
      </div>
    </details>
  );
}
