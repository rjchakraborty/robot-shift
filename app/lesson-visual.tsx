"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { DayVisualSpec, VisualKind, VisualMode } from "./lesson-visuals";

export type LessonVisualProps = {
  spec: DayVisualSpec;
  mode?: VisualMode;
  onModeChange?: (mode: VisualMode) => void;
};

const modes: readonly { id: VisualMode; label: string }[] = [
  { id: "concept", label: "Concept" },
  { id: "math", label: "Math" },
  { id: "failure", label: "Failure case" },
];

const colours = {
  ink: "var(--visual-ink)",
  muted: "var(--visual-muted)",
  paper: "var(--visual-paper)",
  white: "var(--visual-white)",
  grid: "var(--visual-grid)",
  input: "var(--visual-input)",
  process: "var(--visual-process)",
  output: "var(--visual-output)",
  warning: "var(--visual-warning)",
  signal: "var(--visual-signal)",
};

const legendColours = {
  input: colours.input,
  process: colours.process,
  output: colours.output,
  warning: colours.warning,
} as const;

function modeState(mode: VisualMode) {
  return mode === "failure" ? "failure" : "nominal";
}

function modeAccent(mode: VisualMode) {
  return mode === "failure" ? colours.warning : mode === "math" ? colours.process : colours.output;
}

function Grid({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke={colours.grid} strokeWidth="1" />
      </pattern>
      <marker id={`${id}-arrow`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
        <path d="M0,0 L10,4 L0,8 z" fill={colours.ink} />
      </marker>
      <marker id={`${id}-accent-arrow`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
        <path d="M0,0 L10,4 L0,8 z" fill={colours.signal} />
      </marker>
    </defs>
  );
}

function DiagramLabel({
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
      fontSize={strong ? 18 : 15}
      fontWeight={strong ? 700 : 500}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
    >
      {children}
    </text>
  );
}

function CoordinateDiagram({ spec, mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const dayOne = spec.dayId === 1;
  const dayTwo = spec.dayId === 2;
  const originX = 230;
  const originY = 320;
  const scale = 42;
  const ax = dayOne ? 3 : dayTwo ? 2 : 2.2;
  const ay = dayOne ? 4 : dayTwo ? 0 : 0.8;
  const bx = dayOne ? 5 : dayTwo ? 0 : 3.2;
  const by = dayOne ? 2 : dayTwo ? 2 : 1.6;

  return (
    <>
      <line x1="75" y1={originY} x2="640" y2={originY} stroke={colours.ink} strokeWidth="2" markerEnd={`url(#${marker})`} />
      <line x1={originX} y1="365" x2={originX} y2="48" stroke={colours.ink} strokeWidth="2" markerEnd={`url(#${marker})`} />
      <DiagramLabel x={650} y={originY + 5}>x</DiagramLabel>
      <DiagramLabel x={originX + 8} y={42}>y</DiagramLabel>
      <DiagramLabel x={originX - 10} y={originY + 22} anchor="end">O</DiagramLabel>
      <line
        x1={originX}
        y1={originY}
        x2={originX + ax * scale}
        y2={originY - ay * scale}
        stroke={colours.input}
        strokeWidth="5"
        markerEnd={`url(#${marker.replace(/-arrow$/, "-accent-arrow")})`}
      />
      <line
        x1={originX}
        y1={originY}
        x2={originX + bx * scale}
        y2={originY - by * scale}
        stroke={failed ? colours.warning : colours.output}
        strokeWidth="5"
        strokeDasharray={failed ? "12 8" : undefined}
        markerEnd={`url(#${marker})`}
      />
      {failed && (
        <line
          x1={originX}
          y1={originY}
          x2={originX - by * scale}
          y2={originY - bx * scale}
          stroke={colours.warning}
          strokeWidth="3"
          strokeDasharray="7 7"
        />
      )}
      <DiagramLabel x={originX + ax * scale + 12} y={originY - ay * scale - 8} fill={colours.input} strong>
        {dayOne ? "A=(3,4)" : dayTwo ? "v=(2,0)" : "input"}
      </DiagramLabel>
      <DiagramLabel x={originX + bx * scale + 12} y={originY - by * scale - 8} fill={failed ? colours.warning : colours.output} strong>
        {dayOne ? "B=(5,2)" : dayTwo ? "R₉₀v=(0,2)" : failed ? "wrong frame" : "output"}
      </DiagramLabel>
      {mode === "math" && dayOne && (
        <>
          <path d="M356 152 A150 150 0 0 1 420 236" fill="none" stroke={colours.process} strokeWidth="4" />
          <DiagramLabel x={418} y={183} fill={colours.process}>θ≈31.4°</DiagramLabel>
        </>
      )}
    </>
  );
}

type DiagramProps = {
  spec: DayVisualSpec;
  mode: VisualMode;
  marker: string;
};

function KinematicsDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const toolX = failed ? 645 : 515;
  const toolY = failed ? 70 : 130;
  return (
    <>
      <path d="M155 330 A245 245 0 0 1 610 185" fill="none" stroke={colours.grid} strokeWidth="3" strokeDasharray="10 8" />
      <line x1="155" y1="330" x2="355" y2="210" stroke={colours.input} strokeWidth="18" strokeLinecap="square" />
      <line x1="355" y1="210" x2={toolX} y2={toolY} stroke={failed ? colours.warning : colours.output} strokeWidth="15" strokeLinecap="square" />
      {[["155", "330"], ["355", "210"], [String(toolX), String(toolY)]] .map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r={index === 2 ? 13 : 18} fill={colours.paper} stroke={index === 2 && failed ? colours.warning : colours.ink} strokeWidth="5" />
      ))}
      <line x1="520" y1="330" x2="520" y2="65" stroke={colours.warning} strokeWidth="3" strokeDasharray="9 7" />
      <DiagramLabel x={520} y={355} anchor="middle" fill={colours.warning}>joint / reach limit</DiagramLabel>
      <DiagramLabel x={150} y={375} anchor="middle">base</DiagramLabel>
      <DiagramLabel x={355} y={190} anchor="middle">joint</DiagramLabel>
      <DiagramLabel x={toolX} y={toolY - 24} anchor="middle" fill={failed ? colours.warning : colours.output} strong>
        {failed ? "invalid target" : "tool"}
      </DiagramLabel>
      {mode === "math" && (
        <path d="M155 330 L515 330 L515 130" fill="none" stroke={colours.process} strokeWidth="3" markerEnd={`url(#${marker})`} />
      )}
    </>
  );
}

function FeedbackDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const blocks = [
    { x: 80, label: "request r", tone: colours.input },
    { x: 260, label: "controller", tone: colours.process },
    { x: 460, label: "robot plant", tone: failed ? colours.warning : colours.output },
  ];
  return (
    <>
      {blocks.map((block) => (
        <g key={block.label}>
          <rect x={block.x} y="120" width="145" height="82" fill={colours.paper} stroke={block.tone} strokeWidth="5" />
          <DiagramLabel x={block.x + 72.5} y={168} anchor="middle" fill={block.tone} strong>{block.label}</DiagramLabel>
        </g>
      ))}
      <line x1="225" y1="161" x2="252" y2="161" stroke={colours.ink} strokeWidth="3" markerEnd={`url(#${marker})`} />
      <line x1="405" y1="161" x2="452" y2="161" stroke={colours.ink} strokeWidth="3" markerEnd={`url(#${marker})`} />
      <path d="M605 161 L660 161 L660 310 L153 310 L153 212" fill="none" stroke={failed ? colours.warning : colours.ink} strokeWidth="3" strokeDasharray={failed ? "10 8" : undefined} markerEnd={`url(#${marker})`} />
      <DiagramLabel x={405} y={338} anchor="middle" fill={failed ? colours.warning : colours.ink}>
        measured output y {failed ? "(late / wrong sign)" : ""}
      </DiagramLabel>
      <path
        d={failed ? "M80 75 C150 25 185 115 250 55 S365 120 430 48 S550 125 630 40" : "M80 65 C155 120 210 82 275 92 S410 90 630 90"}
        fill="none"
        stroke={failed ? colours.warning : mode === "math" ? colours.process : colours.output}
        strokeWidth="4"
      />
      <DiagramLabel x={80} y={45}>tracking error over time</DiagramLabel>
    </>
  );
}

function TimingDiagram({ mode }: DiagramProps) {
  const failed = mode === "failure";
  const spans = failed
    ? [
        { x: 95, width: 100, label: "sense", tone: colours.input },
        { x: 200, width: 230, label: "compute late", tone: colours.warning },
        { x: 435, width: 160, label: "actuate", tone: colours.warning },
      ]
    : [
        { x: 95, width: 100, label: "sense", tone: colours.input },
        { x: 200, width: 150, label: "compute", tone: colours.process },
        { x: 355, width: 115, label: "actuate", tone: colours.output },
      ];
  return (
    <>
      <line x1="70" y1="290" x2="650" y2="290" stroke={colours.ink} strokeWidth="3" />
      {[95, 220, 345, 470, 595].map((x, index) => (
        <g key={x}>
          <line x1={x} y1="278" x2={x} y2="302" stroke={colours.ink} strokeWidth="2" />
          <DiagramLabel x={x} y={328} anchor="middle">{index * 5} ms</DiagramLabel>
        </g>
      ))}
      {spans.map((span) => (
        <g key={span.label}>
          <rect x={span.x} y="150" width={span.width} height="70" fill={colours.paper} stroke={span.tone} strokeWidth="5" />
          <DiagramLabel x={span.x + span.width / 2} y={192} anchor="middle" fill={span.tone} strong>{span.label}</DiagramLabel>
        </g>
      ))}
      <line x1="520" y1="85" x2="520" y2="310" stroke={colours.warning} strokeWidth="4" strokeDasharray="8 6" />
      <DiagramLabel x={520} y={68} anchor="middle" fill={colours.warning} strong>deadline</DiagramLabel>
      <DiagramLabel x={340} y={108} anchor="middle">period = 20 ms · work = {failed ? "24" : "6"} ms</DiagramLabel>
      {mode === "math" && <DiagramLabel x={340} y={365} anchor="middle" fill={colours.process} strong>margin = 20 − 6 = 14 ms</DiagramLabel>}
    </>
  );
}

function SystemDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const nodes = [
    { x: 70, y: 100, label: "sensor", tone: colours.input },
    { x: 285, y: 80, label: "estimate", tone: colours.process },
    { x: 500, y: 100, label: "controller", tone: colours.output },
    { x: 285, y: 275, label: "watchdog", tone: failed ? colours.warning : colours.signal },
  ];
  return (
    <>
      {nodes.map((node) => (
        <g key={node.label}>
          <rect x={node.x} y={node.y} width="150" height="70" fill={colours.paper} stroke={node.tone} strokeWidth="5" />
          <DiagramLabel x={node.x + 75} y={node.y + 42} anchor="middle" fill={node.tone} strong>{node.label}</DiagramLabel>
        </g>
      ))}
      <line x1="220" y1="135" x2="277" y2="120" stroke={colours.ink} strokeWidth="3" markerEnd={`url(#${marker})`} />
      <line x1="435" y1="120" x2="492" y2="135" stroke={failed ? colours.warning : colours.ink} strokeWidth="3" strokeDasharray={failed ? "9 7" : undefined} markerEnd={`url(#${marker})`} />
      <path d="M575 170 L575 310 L443 310" fill="none" stroke={colours.ink} strokeWidth="3" markerEnd={`url(#${marker})`} />
      <path d="M285 310 L145 310 L145 178" fill="none" stroke={colours.ink} strokeWidth="3" markerEnd={`url(#${marker})`} />
      {failed && (
        <>
          <line x1="440" y1="65" x2="485" y2="185" stroke={colours.warning} strokeWidth="8" />
          <line x1="485" y1="65" x2="440" y2="185" stroke={colours.warning} strokeWidth="8" />
        </>
      )}
      <DiagramLabel x={360} y={385} anchor="middle" fill={failed ? colours.warning : colours.ink}>
        {failed ? "interface contract broken" : "typed interfaces + health + lifecycle"}
      </DiagramLabel>
    </>
  );
}

function SensorDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  return (
    <>
      <rect x="95" y="130" width="105" height="90" fill={colours.paper} stroke={colours.input} strokeWidth="5" />
      <circle cx="200" cy="175" r="18" fill={colours.paper} stroke={colours.input} strokeWidth="5" />
      <path d="M220 150 L545 75 L545 275 L220 200 Z" fill={failed ? "var(--visual-fault-fill)" : "var(--visual-safe-fill)"} stroke={failed ? colours.warning : colours.output} strokeWidth="3" strokeDasharray={failed ? "10 8" : undefined} />
      <rect x="520" y="120" width="85" height="110" fill={colours.paper} stroke={failed ? colours.warning : colours.output} strokeWidth="5" />
      <circle cx={failed ? 585 : 558} cy={failed ? 205 : 170} r="14" fill={failed ? colours.warning : colours.signal} />
      <line x1="218" y1="175" x2={failed ? 577 : 550} y2={failed ? 197 : 170} stroke={colours.ink} strokeWidth="3" markerEnd={`url(#${marker})`} />
      <DiagramLabel x={145} y={255} anchor="middle" fill={colours.input}>camera frame</DiagramLabel>
      <DiagramLabel x={562} y={255} anchor="middle" fill={failed ? colours.warning : colours.output}>target</DiagramLabel>
      {mode === "math" && (
        <>
          <line x1="558" y1="170" x2="558" y2="205" stroke={colours.process} strokeWidth="4" />
          <DiagramLabel x={570} y={190} fill={colours.process}>30 px</DiagramLabel>
        </>
      )}
      <DiagramLabel x={355} y={340} anchor="middle">{failed ? "glare / wrong calibration → bad ray" : "pixel + calibration + depth → physical ray"}</DiagramLabel>
    </>
  );
}

function UncertaintyDiagram({ mode }: DiagramProps) {
  const failed = mode === "failure";
  const width = failed ? 170 : mode === "math" ? 110 : 70;
  return (
    <>
      <line x1="75" y1="310" x2="650" y2="310" stroke={colours.ink} strokeWidth="3" />
      <path
        d={`M110 305 C${280 - width} 300 ${315 - width / 2} 80 360 80 C${405 + width / 2} 80 ${440 + width} 300 610 305`}
        fill="none"
        stroke={failed ? colours.warning : colours.output}
        strokeWidth="5"
      />
      <line x1="360" y1="70" x2="360" y2="320" stroke={colours.process} strokeWidth="3" strokeDasharray="8 7" />
      <circle cx={failed ? 565 : 445} cy="250" r="13" fill={colours.input} />
      <DiagramLabel x={360} y={52} anchor="middle" fill={colours.process} strong>estimate μ</DiagramLabel>
      <DiagramLabel x={failed ? 565 : 445} y={235} anchor="middle" fill={colours.input} strong>observation x</DiagramLabel>
      <line x1={360 - width / 2} y1="335" x2={360 + width / 2} y2="335" stroke={failed ? colours.warning : colours.output} strokeWidth="5" />
      <DiagramLabel x={360} y={370} anchor="middle" fill={failed ? colours.warning : colours.output}>
        uncertainty width σ {failed ? "does not cover reality" : ""}
      </DiagramLabel>
    </>
  );
}

function MapDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const path = failed
    ? "M115 315 L275 180 L610 90"
    : "M115 315 L180 350 L370 350 L560 350 L560 180 L610 90";
  return (
    <>
      <rect x="70" y="55" width="580" height="315" fill="none" stroke={colours.ink} strokeWidth="4" />
      <rect x="245" y="90" width="95" height="150" fill="var(--visual-obstacle-fill)" stroke={colours.ink} strokeWidth="4" />
      <rect x="415" y="240" width="105" height="95" fill="var(--visual-obstacle-fill)" stroke={colours.ink} strokeWidth="4" />
      <rect x="225" y="70" width="135" height="190" fill="none" stroke={colours.warning} strokeWidth="3" strokeDasharray="8 6" />
      <path d={path} fill="none" stroke={failed ? colours.warning : colours.output} strokeWidth="7" strokeLinejoin="round" markerEnd={`url(#${marker})`} />
      <circle cx="115" cy="315" r="22" fill={colours.input} stroke={colours.ink} strokeWidth="3" />
      <circle cx="610" cy="90" r="18" fill={colours.signal} stroke={colours.ink} strokeWidth="3" />
      <DiagramLabel x={115} y={352} anchor="middle">robot</DiagramLabel>
      <DiagramLabel x={610} y={70} anchor="middle">goal</DiagramLabel>
      <DiagramLabel x={292} y={160} anchor="middle">occupied</DiagramLabel>
      {failed && <DiagramLabel x={355} y={180} anchor="middle" fill={colours.warning} strong>collision</DiagramLabel>}
    </>
  );
}

function TensorDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  return (
    <>
      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          x={100 + index * 18}
          y={100 + index * 18}
          width="155"
          height="175"
          fill={index === 2 ? "var(--visual-input-fill)" : colours.paper}
          stroke={colours.input}
          strokeWidth="4"
        />
      ))}
      <line x1="295" y1="205" x2="390" y2="205" stroke={colours.ink} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <rect x="405" y="120" width="200" height="170" fill={colours.paper} stroke={failed ? colours.warning : colours.process} strokeWidth="6" />
      <DiagramLabel x={505} y={190} anchor="middle" fill={failed ? colours.warning : colours.process} strong>
        {failed ? "shape / scale mismatch" : "model"}
      </DiagramLabel>
      <DiagramLabel x={178} y={330} anchor="middle" fill={colours.input}>[8, 3, 224, 224]</DiagramLabel>
      <DiagramLabel x={505} y={225} anchor="middle">{failed ? "[8, 224, 224, 3] ✕" : "verified output"}</DiagramLabel>
      {mode === "math" && <DiagramLabel x={360} y={375} anchor="middle" fill={colours.process} strong>8×3×224×224 = 1,204,224 values</DiagramLabel>}
    </>
  );
}

function EpisodeDiagram({ mode }: DiagramProps) {
  const failed = mode === "failure";
  const rows = [
    { y: 95, label: "camera", tone: colours.input, offset: 0 },
    { y: 175, label: "state", tone: colours.process, offset: failed ? 35 : 0 },
    { y: 255, label: "action", tone: colours.output, offset: failed ? 72 : 0 },
  ];
  return (
    <>
      {rows.map((row) => (
        <g key={row.label}>
          <DiagramLabel x={115} y={row.y + 28} anchor="end" fill={row.tone} strong>{row.label}</DiagramLabel>
          {[0, 1, 2, 3, 4].map((index) => (
            <rect
              key={index}
              x={145 + index * 95 + row.offset}
              y={row.y}
              width="70"
              height="52"
              fill={colours.paper}
              stroke={failed && index >= 3 ? colours.warning : row.tone}
              strokeWidth="4"
            />
          ))}
        </g>
      ))}
      <line x1="145" y1="340" x2="595" y2="340" stroke={colours.ink} strokeWidth="3" />
      {[145, 240, 335, 430, 525].map((x) => <line key={x} x1={x} y1="330" x2={x} y2="350" stroke={colours.ink} strokeWidth="2" />)}
      <DiagramLabel x={360} y={382} anchor="middle" fill={failed ? colours.warning : colours.ink}>
        {failed ? "streams no longer describe the same instant" : "one shared episode timeline"}
      </DiagramLabel>
    </>
  );
}

function PolicyDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const blocks = [
    { x: 65, w: 155, label: "observation", tone: colours.input },
    { x: 280, w: 155, label: "policy", tone: colours.process },
    { x: 495, w: 155, label: failed ? "rejected action" : "safe command", tone: failed ? colours.warning : colours.output },
  ];
  return (
    <>
      {blocks.map((block) => (
        <g key={block.label}>
          <rect x={block.x} y="130" width={block.w} height="95" fill={colours.paper} stroke={block.tone} strokeWidth="6" />
          <DiagramLabel x={block.x + block.w / 2} y={185} anchor="middle" fill={block.tone} strong>{block.label}</DiagramLabel>
        </g>
      ))}
      <line x1="220" y1="177" x2="272" y2="177" stroke={colours.ink} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <line x1="435" y1="177" x2="487" y2="177" stroke={failed ? colours.warning : colours.ink} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <rect x="420" y="285" width="180" height="62" fill={colours.paper} stroke={colours.signal} strokeWidth="5" />
      <DiagramLabel x={510} y={323} anchor="middle" fill={colours.signal} strong>independent validator</DiagramLabel>
      <line x1="510" y1="285" x2="510" y2="235" stroke={colours.signal} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <DiagramLabel x={360} y={80} anchor="middle">{mode === "math" ? "8 actions ÷ 20 Hz = 0.4 s horizon" : "observe → propose → validate → command"}</DiagramLabel>
    </>
  );
}

function SafetyDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  return (
    <>
      <circle cx="345" cy="220" r="155" fill="none" stroke={colours.warning} strokeWidth="5" strokeDasharray="12 8" />
      <circle cx="345" cy="220" r="88" fill="var(--visual-safe-fill)" stroke={colours.output} strokeWidth="4" />
      <rect x="305" y="180" width="80" height="80" fill={colours.paper} stroke={colours.ink} strokeWidth="5" />
      <line x1="345" y1="180" x2={failed ? 555 : 435} y2={failed ? 110 : 155} stroke={failed ? colours.warning : colours.input} strokeWidth="10" strokeLinecap="square" />
      <circle cx={failed ? 555 : 435} cy={failed ? 110 : 155} r="16" fill={failed ? colours.warning : colours.input} />
      <circle cx="590" cy="285" r="25" fill={colours.signal} stroke={colours.ink} strokeWidth="4" />
      <line x1="565" y1="285" x2="505" y2="285" stroke={colours.warning} strokeWidth="5" markerEnd={`url(#${marker})`} />
      <DiagramLabel x={590} y={330} anchor="middle">hazard</DiagramLabel>
      <DiagramLabel x={345} y={395} anchor="middle" fill={colours.warning}>
        {failed ? "boundary crossed → stop" : mode === "math" ? "stop distance = 0.225 m + margin" : "validated safety envelope"}
      </DiagramLabel>
    </>
  );
}

function HardwareDiagram({ mode, marker }: DiagramProps) {
  const failed = mode === "failure";
  const items = [
    { x: 60, label: "24 V supply", tone: colours.input },
    { x: 270, label: "controller", tone: colours.process },
    { x: 480, label: "motor + encoder", tone: failed ? colours.warning : colours.output },
  ];
  return (
    <>
      {items.map((item) => (
        <g key={item.label}>
          <rect x={item.x} y="130" width="175" height="105" fill={colours.paper} stroke={item.tone} strokeWidth="6" />
          <DiagramLabel x={item.x + 87.5} y={190} anchor="middle" fill={item.tone} strong>{item.label}</DiagramLabel>
        </g>
      ))}
      <line x1="235" y1="182" x2="262" y2="182" stroke={colours.ink} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <line x1="445" y1="182" x2="472" y2="182" stroke={failed ? colours.warning : colours.ink} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <path d="M568 245 L568 320 L358 320 L358 245" fill="none" stroke={colours.input} strokeWidth="4" markerEnd={`url(#${marker})`} />
      <DiagramLabel x={463} y={350} anchor="middle" fill={colours.input}>encoder feedback / bus clock</DiagramLabel>
      <DiagramLabel x={360} y={80} anchor="middle" fill={failed ? colours.warning : colours.ink} strong>
        {mode === "math" ? "P = 24 V × 3 A = 72 W" : failed ? "overcurrent / stale encoder → safe shutdown" : "energy path + data path + lifecycle"}
      </DiagramLabel>
    </>
  );
}

function EvidenceDiagram({ mode }: DiagramProps) {
  const failed = mode === "failure";
  const values = failed ? [82, 45, 10, 0] : [92, 88, 100, 95];
  const labels = ["success", "on-time", "safe", "repeat"];
  return (
    <>
      <line x1="85" y1="330" x2="645" y2="330" stroke={colours.ink} strokeWidth="3" />
      {values.map((value, index) => {
        const height = value * 2.2;
        const x = 115 + index * 135;
        return (
          <g key={labels[index]}>
            <rect x={x} y={330 - height} width="75" height={height} fill={failed ? "var(--visual-fault-bar)" : index === 0 ? colours.output : colours.input} stroke={failed ? colours.warning : colours.ink} strokeWidth="4" />
            <DiagramLabel x={x + 37.5} y={315 - height} anchor="middle" fill={failed ? colours.warning : colours.ink} strong>{value}%</DiagramLabel>
            <DiagramLabel x={x + 37.5} y={360} anchor="middle">{labels[index]}</DiagramLabel>
          </g>
        );
      })}
      <DiagramLabel x={360} y={65} anchor="middle" fill={failed ? colours.warning : colours.output} strong>
        {mode === "math" ? "46 / 50 = 92% observed success" : failed ? "happy-path claim without raw trials" : "frozen conditions + complete evidence"}
      </DiagramLabel>
    </>
  );
}

function DiagramBody(props: DiagramProps) {
  const renderers: Record<VisualKind, (diagramProps: DiagramProps) => ReactNode> = {
    coordinate: CoordinateDiagram,
    kinematics: KinematicsDiagram,
    feedback: FeedbackDiagram,
    timing: TimingDiagram,
    system: SystemDiagram,
    sensor: SensorDiagram,
    uncertainty: UncertaintyDiagram,
    map: MapDiagram,
    tensor: TensorDiagram,
    episode: EpisodeDiagram,
    policy: PolicyDiagram,
    safety: SafetyDiagram,
    hardware: HardwareDiagram,
    evidence: EvidenceDiagram,
  };
  const Renderer = renderers[props.spec.kind];
  return <Renderer {...props} />;
}

export function LessonVisual({
  spec,
  mode: controlledMode,
  onModeChange,
}: LessonVisualProps) {
  const [localMode, setLocalMode] = useState<VisualMode>("concept");
  const mode = controlledMode ?? localMode;
  const stateName = modeState(mode);
  const state = spec.states[stateName];
  const idBase = `lesson-visual-${spec.dayId}-${mode}`;
  const titleId = `${idBase}-title`;
  const descriptionId = `${idBase}-description`;
  const gridId = `${idBase}-grid`;
  const panelId = `${idBase}-panel`;
  const accent = modeAccent(mode);
  const modeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectMode(nextMode: VisualMode) {
    if (controlledMode === undefined) setLocalMode(nextMode);
    onModeChange?.(nextMode);
  }

  function moveMode(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % modes.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + modes.length) % modes.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = modes.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    selectMode(modes[nextIndex].id);
    modeRefs.current[nextIndex]?.focus();
  }

  return (
    <section className={`lesson-visual lesson-visual--hard-border lesson-visual--${spec.kind}`} aria-labelledby={`${idBase}-heading`}>
      <header className="lesson-visual__header">
        <div>
          <span className="eyebrow">Visual field guide · Day {spec.dayId}</span>
          <h3 id={`${idBase}-heading`}>{spec.title}</h3>
          <p>{spec.takeaway}</p>
        </div>
        <div className="lesson-visual__mode-tabs lesson-tabs" role="tablist" aria-label="Visual explanation mode">
          {modes.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => { modeRefs.current[index] = node; }}
              id={`${idBase}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              aria-controls={panelId}
              tabIndex={mode === item.id ? 0 : -1}
              className={mode === item.id ? "active" : undefined}
              onClick={() => selectMode(item.id)}
              onKeyDown={(event) => moveMode(event, index)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div
        id={panelId}
        className="lesson-visual__board"
        role="tabpanel"
        aria-labelledby={`${idBase}-tab-${mode}`}
      >
        <figure className="lesson-visual__figure formula-card">
          <span className="lesson-visual__scroll-hint">Swipe the technical canvas horizontally on a small screen.</span>
          <svg
            className="lesson-visual__svg"
            viewBox="0 0 720 420"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>{`${spec.topic} — ${mode} diagram`}</title>
            <desc id={descriptionId}>
              {`${spec.physicalScenario} ${state.label}: ${state.description} The displayed measure is ${state.value} ${state.unit}.`}
            </desc>
            <Grid id={gridId} />
            <rect x="1" y="1" width="718" height="418" fill={`url(#${gridId})`} stroke={colours.ink} strokeWidth="2" />
            <DiagramBody spec={spec} mode={mode} marker={`${gridId}-arrow`} />
            <rect x="18" y="18" width="234" height="35" fill={colours.paper} stroke={accent} strokeWidth="3" />
            <DiagramLabel x={135} y={41} anchor="middle" fill={accent} strong>
              {mode === "math" ? "Math anchor" : state.label}
            </DiagramLabel>
          </svg>
          <figcaption>
            <strong>{`Day ${spec.dayId} · ${mode === "failure" ? "Failure case" : mode === "math" ? "Math check" : "Concept"}`}</strong>
            {" — "}
            {state.description} Measured anchor: {state.value} {state.unit}.
          </figcaption>
        </figure>

        <aside className="lesson-visual__read-rail" aria-label="How to read this visual">
          <section>
            <span className="eyebrow">How to read it</span>
            <ol>
              {spec.howToRead.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>

          {mode === "math" && (
            <section className="lesson-visual__math">
              <span className="eyebrow">Small numerical anchor</span>
              <strong>{spec.math.formula}</strong>
              <ol>
                {spec.math.walkthrough.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <p>{spec.math.result}</p>
            </section>
          )}

          {mode === "failure" && (
            <section className="lesson-visual__failure">
              <span className="eyebrow">Failure check</span>
              <strong>{spec.states.failure.label}</strong>
              <p>{spec.states.failure.description}</p>
              <p>Ask: what detects this, what stops motion, and what evidence proves recovery?</p>
            </section>
          )}

          <section className="lesson-visual__legend" aria-label="Diagram legend">
            <span className="eyebrow">Legend</span>
            <ul>
              {spec.legend.map((item) => (
                <li key={item.label}>
                  <span
                    aria-hidden="true"
                    className={`lesson-visual__legend-swatch lesson-visual__legend-swatch--${item.tone}`}
                    style={{ backgroundColor: legendColours[item.tone] }}
                  />
                  <strong>{item.label}:</strong> {item.meaning}
                </li>
              ))}
            </ul>
          </section>

          <section className="lesson-visual__bridge">
            <span className="eyebrow">Bridge from your {spec.softwareBridge.skill} experience</span>
            <p>{spec.softwareBridge.analogy}</p>
            <p><strong>Dangerous difference:</strong> {spec.softwareBridge.dangerousDifference}</p>
          </section>

          <section className="lesson-visual__metadata">
            <span className="eyebrow">Units and frames</span>
            <p><strong>Units:</strong> {spec.units.join(", ")}</p>
            <p><strong>Frames:</strong> {spec.frames.join(" → ")}</p>
          </section>
        </aside>
      </div>
    </section>
  );
}
