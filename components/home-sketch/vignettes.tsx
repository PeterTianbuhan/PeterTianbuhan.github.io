import type { CSSProperties } from "react";
import type { Exhibit } from "@/lib/exhibits";
import styles from "./gallery.module.css";

// Small ink drawings that hang in the project frames, drawn stroke by stroke
// (then lightly washed) once their frame has been inked. 240 × 180 units.

type Line = { d: string; t: number; dur?: number };
type Tint = { d: string; fill: string; t: number };

const at = (t: number, dur = 0.4) => ({ "--t": `${t}s`, "--d": `${dur}s` }) as CSSProperties;

const drawings: Record<Exhibit["slug"], { lines: Line[]; tints: Tint[]; extra?: (t: number) => React.ReactNode }> = {
  // a laptop playing back a lecture, subtitles under the picture, course files stacked beside it
  onepku: {
    lines: [
      { d: "M58,42 Q56,40 60,40 L180,40 Q184,40 184,44 L184,118 L56,118 L56,46", t: 0, dur: 0.6 },
      { d: "M56,118 L38,134 L202,134 L184,118", t: 0.5 },
      { d: "M112,64 L112,90 L134,77 Z", t: 0.85, dur: 0.3 },
      { d: "M92,99 L148,99", t: 1.1, dur: 0.25 },
      { d: "M70,108 L170,108", t: 1.3, dur: 0.3 },
      { d: "M124,104 L124,112", t: 1.55, dur: 0.12 },
      { d: "M192,134 L230,134 L230,125 L192,125 Z", t: 1.7, dur: 0.3 },
      { d: "M196,125 L226,125 L226,117 L196,117 Z", t: 1.9, dur: 0.25 },
    ],
    tints: [
      { d: "M58,42 L182,42 L182,116 L58,116 Z", fill: "#c3ccd8", t: 2.0 },
      { d: "M112,64 L112,90 L134,77 Z", fill: "#e2583a", t: 2.15 },
      { d: "M70,106 L124,106 L124,110 L70,110 Z", fill: "#5b87b8", t: 2.25 },
      { d: "M192,125 L230,125 L230,134 L192,134 Z", fill: "#f2b731", t: 2.35 },
      { d: "M196,117 L226,117 L226,125 L196,125 Z", fill: "#4f9a6b", t: 2.45 },
    ],
  },
  // a sheet of code with an Accepted stamp
  aioj: {
    lines: [
      { d: "M60,30 L158,30 L180,52 L180,152 L60,152 Z", t: 0, dur: 0.7 },
      { d: "M158,30 L158,52 L180,52", t: 0.6, dur: 0.2 },
      { d: "M76,56 L124,56", t: 0.8, dur: 0.2 },
      { d: "M90,70 L146,70", t: 0.95, dur: 0.2 },
      { d: "M90,84 L134,84", t: 1.1, dur: 0.2 },
      { d: "M104,98 L150,98", t: 1.25, dur: 0.2 },
      { d: "M76,112 L110,112", t: 1.4, dur: 0.2 },
    ],
    tints: [{ d: "M130,112 L170,106 L175,142 L135,148 Z", fill: "#c8372d", t: 1.75 }],
    extra: (t) => (
      <text x="152" y="134" className={styles.stamp} transform="rotate(-8 152 127)" style={at(t)}>
        AC
      </text>
    ),
  },
  // someone talking into a phone, the phone quietly laying it out as a timeline
  "my-life": {
    lines: [
      { d: "M60,58 Q76,90 60,122", t: 0, dur: 0.3 },
      { d: "M72,68 Q84,90 72,112", t: 0.2, dur: 0.25 },
      { d: "M84,78 Q91,90 84,102", t: 0.4, dur: 0.2 },
      { d: "M104,24 L146,24 Q152,24 152,30 L152,150 Q152,156 146,156 L104,156 Q98,156 98,150 L98,30 Q98,24 104,24", t: 0.55, dur: 0.7 },
      { d: "M118,32 L132,32", t: 1.2, dur: 0.1 },
      { d: "M112,46 L112,138", t: 1.3, dur: 0.35 },
      { d: "M122,58 L144,58", t: 1.6, dur: 0.15 },
      { d: "M122,65 L136,65", t: 1.7, dur: 0.1 },
      { d: "M122,88 L144,88", t: 1.8, dur: 0.15 },
      { d: "M122,95 L132,95", t: 1.9, dur: 0.1 },
      { d: "M122,118 L142,118", t: 2.0, dur: 0.15 },
      { d: "M122,125 L134,125", t: 2.1, dur: 0.1 },
    ],
    tints: [
      { d: "M102,40 L148,40 L148,146 L102,146 Z", fill: "#eadcc0", t: 2.1 },
      { d: "M108,61 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", fill: "#e2583a", t: 2.25 },
      { d: "M108,91 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", fill: "#f2b731", t: 2.35 },
      { d: "M108,121 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", fill: "#4f9a6b", t: 2.45 },
    ],
  },
};

export function Vignette({ slug, delay }: { slug: Exhibit["slug"]; delay: number }) {
  const { lines, tints, extra } = drawings[slug];
  return (
    <svg viewBox="0 0 240 180" className={`${styles.ink} ${styles.vignette}`} aria-hidden>
      {tints.map((w, i) => (
        <path key={`w${i}`} d={w.d} fill={w.fill} className={styles.tint} style={at(delay + w.t, 0.7)} />
      ))}
      {lines.map((l, i) => (
        <path key={i} d={l.d} pathLength={1} style={at(delay + l.t, l.dur)} />
      ))}
      {extra?.(delay + 2.0)}
    </svg>
  );
}
