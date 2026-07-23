"use client";

import {
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DayVisualSpec } from "./lesson-visuals";
import {
  createInteractiveMathModel,
  formatMathNumber,
  type ArmScene,
  type BarsScene,
  type DistributionScene,
  type InteractiveMathEvaluation,
  type MathScene,
  type MathTone,
  type ProjectionScene,
  type TimelineScene,
  type VectorScene,
} from "./interactive-math";

export type InteractiveMathPlaygroundProps = {
  spec: DayVisualSpec;
};

const colours = {
  ink: "#151b1e",
  muted: "#697377",
  paper: "#fbfaf5",
  white: "#ffffff",
  grid: "#d7dad4",
  input: "#3b63f3",
  process: "#9b4dca",
  output: "#007f70",
  warning: "#c43d32",
} as const;

const toneColours: Record<MathTone, string> = {
  input: colours.input,
  process: colours.process,
  output: colours.output,
  warning: colours.warning,
};

function SvgText({
  x,
  y,
  children,
  anchor = "start",
  fill = colours.ink,
  strong = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  fill?: string;
  strong?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontSize={strong ? 17 : 14}
      fontWeight={strong ? 750 : 550}
    >
      {children}
    </text>
  );
}

function ArrowMarkers({ idBase }: { idBase: string }) {
  return (
    <defs>
      {(Object.keys(toneColours) as MathTone[]).map((tone) => (
        <marker
          key={tone}
          id={`${idBase}-arrow-${tone}`}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L10,4 L0,8 z" fill={toneColours[tone]} />
        </marker>
      ))}
      <pattern id={`${idBase}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke={colours.grid} strokeWidth="1" />
      </pattern>
    </defs>
  );
}

function vectorBounds(scene: VectorScene) {
  const points = [
    scene.origin,
    ...scene.vectors.map((vector) => ({ x: vector.x, y: vector.y })),
    { x: 0, y: 0 },
  ];
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const padding = span * 0.18;
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
  };
}

function VectorGraphic({
  scene,
  idBase,
}: {
  scene: VectorScene;
  idBase: string;
}) {
  const bounds = vectorBounds(scene);
  const mapX = (value: number) =>
    70 + (value - bounds.minX) / (bounds.maxX - bounds.minX) * 580;
  const mapY = (value: number) =>
    315 - (value - bounds.minY) / (bounds.maxY - bounds.minY) * 250;
  const originX = mapX(scene.origin.x);
  const originY = mapY(scene.origin.y);
  const xAxisY = Math.min(315, Math.max(65, mapY(0)));
  const yAxisX = Math.min(650, Math.max(70, mapX(0)));

  return (
    <>
      <line x1="55" y1={xAxisY} x2="665" y2={xAxisY} stroke={colours.muted} strokeWidth="2" />
      <line x1={yAxisX} y1="330" x2={yAxisX} y2="45" stroke={colours.muted} strokeWidth="2" />
      <SvgText x={660} y={xAxisY - 10} anchor="end">+x</SvgText>
      <SvgText x={yAxisX + 10} y={55}>+y</SvgText>
      <circle cx={originX} cy={originY} r="7" fill={colours.ink} />
      <SvgText x={originX + 10} y={originY + 21}>{scene.origin.label}</SvgText>
      {scene.vectors.map((vector) => {
        const endX = mapX(vector.x);
        const endY = mapY(vector.y);
        const tone = toneColours[vector.tone];
        return (
          <g key={`${vector.label}-${vector.x}-${vector.y}`}>
            <line
              x1={originX}
              y1={originY}
              x2={endX}
              y2={endY}
              stroke={tone}
              strokeWidth="5"
              markerEnd={`url(#${idBase}-arrow-${vector.tone})`}
            />
            <circle cx={endX} cy={endY} r="6" fill={tone} />
            <SvgText
              x={Math.min(645, Math.max(75, endX + 12))}
              y={Math.min(330, Math.max(55, endY - 12))}
              fill={tone}
              strong
            >
              {vector.label}
            </SvgText>
          </g>
        );
      })}
    </>
  );
}

function ArmGraphic({
  scene,
  idBase,
}: {
  scene: ArmScene;
  idBase: string;
}) {
  const xs = scene.points.map((point) => point.x);
  const ys = scene.points.map((point) => point.y);
  const span = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    1,
  );
  const centreX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const centreY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const scale = 235 / span;
  const mapX = (value: number) => 360 + (value - centreX) * scale;
  const mapY = (value: number) => 190 - (value - centreY) * scale;

  return (
    <>
      <line x1="70" y1="315" x2="650" y2="315" stroke={colours.muted} strokeWidth="3" />
      {scene.points.slice(1).map((point, index) => {
        const previous = scene.points[index];
        return (
          <line
            key={`${point.label}-link`}
            x1={mapX(previous.x)}
            y1={mapY(previous.y)}
            x2={mapX(point.x)}
            y2={mapY(point.y)}
            stroke={toneColours[point.tone]}
            strokeWidth={index === 0 ? 17 : 14}
            strokeLinecap="round"
            markerEnd={index === scene.points.length - 2
              ? `url(#${idBase}-arrow-${point.tone})`
              : undefined}
          />
        );
      })}
      {scene.points.map((point, index) => (
        <g key={`${point.label}-joint`}>
          <circle
            cx={mapX(point.x)}
            cy={mapY(point.y)}
            r={index === scene.points.length - 1 ? 11 : 16}
            fill={colours.paper}
            stroke={toneColours[point.tone]}
            strokeWidth="5"
          />
          <SvgText
            x={mapX(point.x)}
            y={Math.max(45, mapY(point.y) - 24)}
            anchor="middle"
            fill={toneColours[point.tone]}
            strong
          >
            {point.label}
          </SvgText>
        </g>
      ))}
    </>
  );
}

function BarsGraphic({ scene }: { scene: BarsScene }) {
  const rowGap = 250 / Math.max(scene.items.length, 1);
  return (
    <>
      {scene.items.map((item, index) => {
        const y = 75 + index * rowGap;
        const ratio = Math.min(1, Math.abs(item.value) / Math.max(item.max, 1e-9));
        const width = ratio * 430;
        return (
          <g key={`${item.label}-${index}`}>
            <SvgText x={90} y={y} strong>{item.label}</SvgText>
            <rect
              x="90"
              y={y + 15}
              width="430"
              height="30"
              fill={colours.white}
              stroke={colours.grid}
              strokeWidth="2"
            />
            <rect
              x="90"
              y={y + 15}
              width={width}
              height="30"
              fill={toneColours[item.tone]}
            />
            <SvgText
              x={540}
              y={y + 38}
              fill={toneColours[item.tone]}
              strong
            >
              {formatMathNumber(item.value)} {item.unit}
            </SvgText>
          </g>
        );
      })}
    </>
  );
}

function TimelineGraphic({ scene }: { scene: TimelineScene }) {
  const safeTotal = Math.max(scene.total, 1e-9);
  const widths = scene.segments.map((segment) =>
    Math.max(2, Math.min(560, segment.value / safeTotal * 560))
  );
  return (
    <>
      <line x1="70" y1="285" x2="650" y2="285" stroke={colours.ink} strokeWidth="3" />
      <SvgText x={70} y={315}>0</SvgText>
      <SvgText x={650} y={315} anchor="end">
        {formatMathNumber(scene.total)} {scene.unit}
      </SvgText>
      {scene.segments.map((segment, index) => {
        const width = widths[index];
        const x = 80 + widths
          .slice(0, index)
          .reduce((total, priorWidth) => total + priorWidth, 0);
        return (
          <g key={`${segment.label}-${index}`}>
            <rect
              x={x}
              y="145"
              width={width}
              height="82"
              fill={colours.paper}
              stroke={toneColours[segment.tone]}
              strokeWidth="5"
            />
            {width >= 72 && (
              <SvgText
                x={x + width / 2}
                y={180}
                anchor="middle"
                fill={toneColours[segment.tone]}
                strong
              >
                {segment.label}
              </SvgText>
            )}
            <SvgText
              x={x + width / 2}
              y={207}
              anchor="middle"
              fill={toneColours[segment.tone]}
            >
              {formatMathNumber(segment.value)} {scene.unit}
            </SvgText>
          </g>
        );
      })}
    </>
  );
}

function ProjectionGraphic({ scene }: { scene: ProjectionScene }) {
  const opticalY = 190;
  const sensorX = 180;
  const targetX = 600;
  const targetY = opticalY - Math.max(-125, Math.min(125, scene.lateralMetres / scene.depthMetres * 500));
  const sensorOffset = Math.max(-125, Math.min(125, scene.pixelOffset / 4));
  const imageY = opticalY - sensorOffset;

  return (
    <>
      <line x1="80" y1={opticalY} x2="655" y2={opticalY} stroke={colours.muted} strokeWidth="2" strokeDasharray="8 7" />
      <line x1={sensorX} y1="50" x2={sensorX} y2="330" stroke={colours.input} strokeWidth="7" />
      <circle cx="95" cy={opticalY} r="14" fill={colours.paper} stroke={colours.ink} strokeWidth="5" />
      <line x1="95" y1={opticalY} x2={targetX} y2={targetY} stroke={colours.output} strokeWidth="4" />
      <line x1="95" y1={opticalY} x2={sensorX} y2={imageY} stroke={colours.process} strokeWidth="4" />
      <circle cx={targetX} cy={targetY} r="12" fill={colours.output} />
      <circle cx={sensorX} cy={imageY} r="9" fill={colours.process} />
      <SvgText x={95} y={230} anchor="middle">camera</SvgText>
      <SvgText x={targetX} y={Math.max(45, targetY - 22)} anchor="middle" fill={colours.output} strong>target</SvgText>
      <SvgText x={sensorX + 18} y={imageY - 10} fill={colours.process} strong>
        {formatMathNumber(scene.pixelOffset, 1)} px
      </SvgText>
      <SvgText x={410} y={315} anchor="middle">
        X={formatMathNumber(scene.lateralMetres)} m · Z={formatMathNumber(scene.depthMetres)} m · f={formatMathNumber(scene.focalLengthPixels)} px
      </SvgText>
    </>
  );
}

function DistributionGraphic({ scene }: { scene: DistributionScene }) {
  const centreX = 355;
  const baselineY = 285;
  const scaleX = 66;
  const path = Array.from({ length: 81 }, (_, index) => {
    const z = -4 + index / 10;
    const x = centreX + z * scaleX;
    const y = baselineY - Math.exp(-(z ** 2) / 2) * 180;
    return `${index === 0 ? "M" : "L"}${x} ${y}`;
  }).join(" ");
  const observationX = Math.max(70, Math.min(640, centreX + scene.zScore * scaleX));

  return (
    <>
      <line x1="65" y1={baselineY} x2="650" y2={baselineY} stroke={colours.ink} strokeWidth="3" />
      <path d={path} fill="none" stroke={colours.process} strokeWidth="5" />
      <line x1={centreX} y1="80" x2={centreX} y2={baselineY} stroke={colours.output} strokeWidth="3" strokeDasharray="8 6" />
      <line x1={observationX} y1="70" x2={observationX} y2={baselineY} stroke={Math.abs(scene.zScore) >= 2 ? colours.warning : colours.input} strokeWidth="5" />
      <SvgText x={centreX} y={315} anchor="middle" fill={colours.output} strong>
        μ={formatMathNumber(scene.mean)}
      </SvgText>
      <SvgText
        x={observationX}
        y={55}
        anchor="middle"
        fill={Math.abs(scene.zScore) >= 2 ? colours.warning : colours.input}
        strong
      >
        x={formatMathNumber(scene.observation)}
      </SvgText>
      <SvgText x={355} y={345} anchor="middle">
        σ={formatMathNumber(scene.standardDeviation)} · z={formatMathNumber(scene.zScore)}
      </SvgText>
    </>
  );
}

function SceneBody({
  scene,
  idBase,
}: {
  scene: MathScene;
  idBase: string;
}) {
  switch (scene.type) {
    case "vectors":
      return <VectorGraphic scene={scene} idBase={idBase} />;
    case "arm":
      return <ArmGraphic scene={scene} idBase={idBase} />;
    case "bars":
      return <BarsGraphic scene={scene} />;
    case "timeline":
      return <TimelineGraphic scene={scene} />;
    case "projection":
      return <ProjectionGraphic scene={scene} />;
    case "distribution":
      return <DistributionGraphic scene={scene} />;
  }
}

function LiveMathGraphic({
  scene,
  evaluation,
  title,
  idBase,
}: {
  scene: MathScene;
  evaluation: InteractiveMathEvaluation;
  title: string;
  idBase: string;
}) {
  const titleId = `${idBase}-svg-title`;
  const descriptionId = `${idBase}-svg-description`;
  return (
    <figure className="interactive-math__figure">
      <svg
        className="interactive-math__svg"
        viewBox="0 0 720 380"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>
          {`${evaluation.result} ${evaluation.status.label}: ${evaluation.status.explanation}`}
        </desc>
        <ArrowMarkers idBase={idBase} />
        <rect
          x="1"
          y="1"
          width="718"
          height="378"
          fill={`url(#${idBase}-grid)`}
          stroke={colours.ink}
          strokeWidth="2"
        />
        <SceneBody scene={scene} idBase={idBase} />
      </svg>
      <figcaption>{evaluation.result}</figcaption>
    </figure>
  );
}

function InteractiveMathSession({ spec }: InteractiveMathPlaygroundProps) {
  const reactId = useId().replace(/:/g, "");
  const idBase = `interactive-math-${spec.dayId}-${reactId || "root"}`;
  const initialModel = useMemo(() => createInteractiveMathModel(spec), [spec]);
  const [values, setValues] = useState<Readonly<Record<string, number>>>(
    () => initialModel.values,
  );
  const [announcement, setAnnouncement] = useState("");
  const model = useMemo(
    () => createInteractiveMathModel(spec, values),
    [spec, values],
  );

  function reset() {
    setValues({ ...initialModel.values });
  }

  return (
    <section
      className={`interactive-math interactive-math--${model.kind}`}
      aria-labelledby={`${idBase}-title`}
    >
      <header className="interactive-math__header">
        <div>
          <span className="eyebrow">LIVE MATH PLAYGROUND · DAY {model.dayId}</span>
          <h3 id={`${idBase}-title`}>{model.title}</h3>
          <p>{model.question}</p>
        </div>
        <button type="button" className="interactive-math__reset" onClick={reset}>
          Reset verified example
        </button>
      </header>

      <p className="interactive-math__scope">
        This is the interactive foundation for today&apos;s visual family. Use the
        exact-topic connection below it for the lesson-specific extension.
      </p>

      <div className="interactive-math__workspace">
        <fieldset className="interactive-math__controls">
          <legend>Change one physical quantity at a time</legend>
          {model.controls.map((item) => {
            const controlId = `${idBase}-${item.id}`;
            const helpId = `${controlId}-help`;
            const value = model.values[item.id];
            const formatted = formatMathNumber(
              value,
              item.step < 0.01 ? 3 : item.step < 1 ? 2 : 1,
            );
            return (
              <div className="interactive-math__control" key={item.id}>
                <label htmlFor={controlId}>
                  <span>{item.label}</span>
                  <strong>{item.symbol}</strong>
                </label>
                <div className="interactive-math__range-row">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.label}`}
                    disabled={value <= item.min}
                    onClick={() => {
                      setValues((current) => ({
                        ...current,
                        [item.id]: Math.max(item.min, current[item.id] - item.step),
                      }));
                    }}
                  >
                    −
                  </button>
                  <input
                    id={controlId}
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={value}
                    aria-describedby={helpId}
                    aria-valuetext={`${formatted} ${item.unit}`}
                    onChange={(event) => {
                      const nextValue = Number(event.currentTarget.value);
                      setValues((current) => ({
                        ...current,
                        [item.id]: nextValue,
                      }));
                    }}
                    onPointerUp={() => setAnnouncement(model.evaluation.result)}
                    onKeyUp={() => setAnnouncement(model.evaluation.result)}
                  />
                  <button
                    type="button"
                    aria-label={`Increase ${item.label}`}
                    disabled={value >= item.max}
                    onClick={() => {
                      setValues((current) => ({
                        ...current,
                        [item.id]: Math.min(item.max, current[item.id] + item.step),
                      }));
                    }}
                  >
                    +
                  </button>
                  <output htmlFor={controlId}>
                    {formatted} <small>{item.unit}</small>
                  </output>
                </div>
                <small id={helpId}>
                  Range {formatMathNumber(item.min)} to {formatMathNumber(item.max)} {item.unit};
                  keyboard arrow keys change it by {formatMathNumber(item.step)}.
                </small>
              </div>
            );
          })}
        </fieldset>

        <LiveMathGraphic
          scene={model.evaluation.scene}
          evaluation={model.evaluation}
          title={`${model.topic}: interactive ${model.kind} calculation`}
          idBase={idBase}
        />
      </div>

      <div
        className={`interactive-math__result interactive-math__result--${model.evaluation.status.tone}`}
      >
        <div className="interactive-math__status">
          <span>WHAT CHANGED</span>
          <strong>{model.evaluation.status.label}</strong>
          <p>{model.evaluation.status.explanation}</p>
        </div>
        <div className="interactive-math__formula">
          <span>FORMULA</span>
          <strong>{model.evaluation.formula}</strong>
          <code>{model.evaluation.substitution}</code>
        </div>
        <ol className="interactive-math__steps">
          {model.evaluation.steps.map((step, index) => (
            <li key={`${index}-${step}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <div className="interactive-math__metrics" aria-label="Calculated results">
          {model.evaluation.metrics.map((item) => (
            <article key={item.id}>
              <span>{item.label}</span>
              <strong>
                {formatMathNumber(item.value, item.precision)}
                <small> {item.unit}</small>
              </strong>
            </article>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>

      <footer className="interactive-math__metadata">
        <span><strong>Units:</strong> {model.units.join(", ")}</span>
        <span><strong>Frames:</strong> {model.frames.join(" → ")}</span>
      </footer>
    </section>
  );
}

export function InteractiveMathPlayground(
  props: InteractiveMathPlaygroundProps,
) {
  return <InteractiveMathSession key={props.spec.topicKey} {...props} />;
}
