"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BLEED, DONE_AT, SEAL_AT, VIEW, brushFor, scene } from "./pku-scene";
import styles from "./sketch.module.css";

const timing = (t: number, dur: number) =>
  ({ "--t": `${t}s`, "--d": `${dur}s` }) as CSSProperties;

// Every stroke is inked in order, then every wash is brushed on through a
// mask that follows back-and-forth sweeps. Re-mount (change `run`) to replay.
// Nothing inside the pen filter may be clipped or masked: Chrome then stops
// repainting the strokes as they draw.
// Tall screens can't show the whole shore: hold the stone boat and the pagoda.
// Wide screens see further along the shore; wider still, they lose the top of the sky.
const FOCUS_X = 1040;
// washes and paper run a little past every edge, so the wet filter never frays the frame
const PAPER = { x: -BLEED - 40, y: -100, w: VIEW.w + BLEED * 2 + 80, h: VIEW.h + 200 };

function fitView(aspect: number) {
  let w = VIEW.h * aspect;
  let h = VIEW.h;
  let x: number;
  if (w <= VIEW.w) {
    x = Math.max(0, Math.min(VIEW.w - w, FOCUS_X - w / 2));
  } else {
    w = Math.min(w, VIEW.w + BLEED * 2);
    h = w / aspect;
    x = (VIEW.w - w) / 2;
  }
  const y = (VIEW.h - h) * 0.8;
  return `${Math.round(x)} ${Math.round(y)} ${Math.round(w)} ${Math.round(h)}`;
}

function useViewBox() {
  const [box, setBox] = useState(`0 0 ${VIEW.w} ${VIEW.h}`);
  useEffect(() => {
    const fit = () => setBox(fitView(window.innerWidth / window.innerHeight));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return box;
}

// `finished` jumps straight to the completed painting (a returning visitor, or a click).
export function SketchCanvas({ run, finished = false }: { run: number; finished?: boolean }) {
  const viewBox = useViewBox();
  const { strokes, washes, streaks } = scene;
  const idle = { "--idle": `${DONE_AT}s` } as CSSProperties;

  const grouped = (name?: string) => strokes.filter((s) => s.group === name);
  const ink = (list: typeof strokes, prefix: string) =>
    list.map((s, i) => (
      <g key={`${prefix}${i}`}>
        {s.ghost && (
          <path
            d={s.d}
            pathLength={1}
            className={`${styles.stroke} ${styles.ghost}`}
            style={timing(s.t + 0.05, s.dur * 1.1)}
          />
        )}
        <path
          d={s.d}
          pathLength={1}
          className={styles.stroke}
          strokeWidth={s.w ?? 1.8}
          style={timing(s.t, s.dur)}
        />
      </g>
    ));

  return (
    <svg
      key={run}
      className={`${styles.svg} ${finished ? styles.finished : ""}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-label="一幅正在画出来的北大简笔画"
      role="img"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb6ee" />
          <stop offset="0.7" stopColor="#a9dcf5" />
          <stop offset="1" stopColor="#e9f6f4" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd2d6" />
          <stop offset="0.5" stopColor="#5cb9c6" />
          <stop offset="1" stopColor="#3d9fb5" />
        </linearGradient>
        {/* pen: a slight tremor so no line is ruler-straight */}
        <filter id="pen" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        {/* watercolour: ragged, bleeding edges */}
        <filter id="wet" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022"
            numOctaves="3"
            seed="9"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="bristle" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="2"
            seed="2"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="40"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="paper">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            seed="1"
          />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.33  0 0 0 0.09 0" />
        </filter>
        {washes.map((w, i) => {
          const brush = brushFor(w.box);
          return (
            <mask
              key={i}
              id={`m${i}`}
              maskUnits="userSpaceOnUse"
              x={PAPER.x}
              y={PAPER.y}
              width={PAPER.w}
              height={PAPER.h}
            >
              <path
                d={brush.d}
                pathLength={1}
                className={styles.brush}
                strokeWidth={brush.width}
                filter="url(#bristle)"
                style={timing(w.t, w.dur)}
              />
            </mask>
          );
        })}
      </defs>

      <rect x={PAPER.x} y={PAPER.y} width={PAPER.w} height={PAPER.h} fill="#f8f4ea" />

      <g className={styles.colour} filter="url(#wet)">
        {washes.map((w, i) => (
          <g key={i} mask={`url(#m${i})`} className={styles.multiply}>
            <path
              d={w.d}
              fill={w.color}
              fillRule={w.rule}
              opacity={w.opacity ?? 0.85}
              transform="translate(3 2)"
            />
          </g>
        ))}
        {streaks.map((s, i) => (
          <path
            key={i}
            d={s.d}
            pathLength={1}
            className={`${styles.streak} ${styles.multiply}`}
            stroke={s.color}
            strokeWidth={s.w}
            opacity={s.opacity}
            style={timing(s.t, s.dur)}
          />
        ))}
      </g>

      <g filter="url(#pen)" className={styles.ink}>
        {ink(grouped(undefined), "s")}
        <g className={styles.ripples} style={idle}>
          {ink(grouped("ripples"), "r")}
        </g>
        <g className={styles.drift} style={idle}>
          {ink(grouped("clouds"), "c")}
          {ink(grouped("birds"), "b")}
        </g>
      </g>

      <rect
        x={PAPER.x}
        y={PAPER.y}
        width={PAPER.w}
        height={PAPER.h}
        filter="url(#paper)"
        style={{ mixBlendMode: "multiply" }}
      />

      <g className={styles.seal} style={timing(SEAL_AT, 0.5)}>
        <rect x="1478" y="872" width="62" height="86" rx="4" fill="#c8372d" />
        <text
          x="1509"
          y="908"
          textAnchor="middle"
          fontSize="30"
          fill="#f8f4ea"
          fontFamily="var(--font-serif)"
        >
          燕
        </text>
        <text
          x="1509"
          y="944"
          textAnchor="middle"
          fontSize="30"
          fill="#f8f4ea"
          fontFamily="var(--font-serif)"
        >
          园
        </text>
      </g>
    </svg>
  );
}
