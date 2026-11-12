import type { CSSProperties } from "react";
import styles from "./gallery.module.css";

// The garden: a handful of small pen drawings (a few strokes and one or two
// dabs of colour each) that sit beside headings and along the foot of every
// page. They are the site's only decoration below the cover, so a new essay or
// section needs no picture of its own: it picks one of these.
//
// Each is drawn in an 80 × 80 box standing on y = 74, and inks itself once the
// `Seen` it sits in scrolls into view.

type Line = { d: string; t: number; dur?: number };
type Tint = { d: string; fill: string; t: number };
type Drawing = { lines: Line[]; tints: Tint[] };

const RED = "#e8836b";
const GREEN = "#9cc48f";
const YELLOW = "#f2c14e";
const LILAC = "#c3b8e4";
const PINK = "#f3bcb2";

const f = (n: number) => Math.round(n * 10) / 10;
const ring = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;
const polar = (cx: number, cy: number, r: number, a: number) => `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;

// the daisy's petals, one loop each, going round from the top
const petals: Line[] = Array.from({ length: 9 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 9;
  const d = `M${polar(40, 28, 5, a)} Q${polar(40, 28, 12, a - 0.34)} ${polar(40, 28, 16, a)} Q${polar(40, 28, 12, a + 0.34)} ${polar(40, 28, 5, a)}`;
  return { d, t: 0.5 + i * 0.07, dur: 0.14 };
});

// the dandelion's seeds still on the head: a spoke and a small tick across its end
const spokes: Line[] = Array.from({ length: 11 }, (_, i) => {
  const a = -Math.PI + (i * Math.PI * 2) / 11;
  const d = `M${polar(40, 30, 3, a)} L${polar(40, 30, 13, a)} M${polar(40, 30, 13.5, a - 0.2)} L${polar(40, 30, 13.5, a + 0.2)}`;
  return { d, t: 0.4 + i * 0.05, dur: 0.1 };
});

const drawings = {
  tulip: {
    lines: [
      { d: "M40,74 Q37,56 40,38", t: 0, dur: 0.35 },
      { d: "M39,68 Q25,60 22,44 Q33,50 39,64", t: 0.3 },
      { d: "M40,64 Q52,58 57,46 Q46,49 40,60", t: 0.5 },
      { d: "M30,22 Q27,36 40,38 Q53,36 50,22 Q45,29 40,19 Q35,29 30,22", t: 0.75, dur: 0.5 },
    ],
    tints: [
      { d: "M30,22 Q27,36 40,38 Q53,36 50,22 Q45,29 40,19 Q35,29 30,22 Z", fill: RED, t: 1.2 },
      { d: "M39,68 Q25,60 22,44 Q33,50 39,64 Z M40,64 Q52,58 57,46 Q46,49 40,60 Z", fill: GREEN, t: 1.3 },
    ],
  },
  daisy: {
    lines: [
      { d: "M41,45 Q45,60 40,74", t: 0, dur: 0.35 },
      { d: "M43,62 Q55,58 59,48 Q48,49 43,59", t: 0.3 },
      { d: ring(40, 28, 4.5), t: 0.4, dur: 0.2 },
      ...petals,
    ],
    tints: [
      { d: ring(41, 29, 4.5), fill: YELLOW, t: 1.2 },
      { d: ring(41, 29, 15), fill: PINK, t: 1.25 },
      { d: "M43,62 Q55,58 59,48 Q48,49 43,59 Z", fill: GREEN, t: 1.35 },
    ],
  },
  mushroom: {
    lines: [
      { d: "M20,48 Q22,24 40,22 Q58,24 60,48 Q40,42 20,48", t: 0, dur: 0.55 },
      { d: "M33,46 Q31,62 29,74", t: 0.5, dur: 0.25 },
      { d: "M47,46 Q49,62 51,74", t: 0.65, dur: 0.25 },
      { d: ring(31, 35, 3), t: 0.9, dur: 0.15 },
      { d: ring(45, 31, 4), t: 1.0, dur: 0.15 },
      { d: ring(53, 40, 2.4), t: 1.1, dur: 0.12 },
      { d: "M57,63 Q58,53 65,53 Q72,53 73,63 Q65,60 57,63", t: 1.2, dur: 0.3 },
      { d: "M63,62 L62,74 M68,62 L69,74", t: 1.4, dur: 0.2 },
      { d: "M12,74 q1,-7 4,-10 M17,74 q0,-6 -2,-9", t: 1.5, dur: 0.2 },
    ],
    tints: [
      { d: "M20,48 Q22,24 40,22 Q58,24 60,48 Q40,42 20,48 Z", fill: RED, t: 1.6 },
      { d: "M57,63 Q58,53 65,53 Q72,53 73,63 Q65,60 57,63 Z", fill: YELLOW, t: 1.7 },
    ],
  },
  dandelion: {
    lines: [
      { d: "M40,74 Q35,56 40,34", t: 0, dur: 0.35 },
      { d: "M40,70 Q28,67 21,58 Q32,59 40,66", t: 0.25 },
      ...spokes,
      { d: "M58,20 l-4,6 M55,19 l3,1 l2,-3", t: 1.1, dur: 0.15 },
      { d: "M67,11 l-4,6 M64,10 l3,1 l2,-3", t: 1.25, dur: 0.15 },
      { d: "M72,25 l-4,6 M69,24 l3,1 l2,-3", t: 1.4, dur: 0.15 },
    ],
    tints: [
      { d: ring(41, 31, 13), fill: YELLOW, t: 1.3 },
      { d: "M40,70 Q28,67 21,58 Q32,59 40,66 Z", fill: GREEN, t: 1.4 },
    ],
  },
  sprout: {
    lines: [
      { d: "M28,74 Q40,68 52,74", t: 0, dur: 0.25 },
      { d: "M40,71 Q41,62 40,52", t: 0.2, dur: 0.25 },
      { d: "M40,52 Q24,50 20,36 Q36,36 40,52", t: 0.4 },
      { d: "M40,52 Q56,48 61,32 Q45,34 40,52", t: 0.65 },
      { d: "M40,52 Q31,46 25,40", t: 0.95, dur: 0.15 },
      { d: "M40,52 Q50,44 56,37", t: 1.05, dur: 0.15 },
    ],
    tints: [{ d: "M40,52 Q24,50 20,36 Q36,36 40,52 Z M40,52 Q56,48 61,32 Q45,34 40,52 Z", fill: GREEN, t: 1.15 }],
  },
  butterfly: {
    lines: [
      { d: "M40,32 Q41,42 40,52", t: 0, dur: 0.2 },
      { d: "M40,32 Q37,24 32,23 M40,32 Q43,24 48,23", t: 0.15, dur: 0.2 },
      { d: "M40,38 Q26,18 16,26 Q12,38 40,43", t: 0.35 },
      { d: "M40,38 Q54,18 64,26 Q68,38 40,43", t: 0.6 },
      { d: "M40,44 Q24,46 24,58 Q33,62 40,48", t: 0.85, dur: 0.3 },
      { d: "M40,44 Q56,46 56,58 Q47,62 40,48", t: 1.05, dur: 0.3 },
    ],
    tints: [
      { d: "M40,38 Q26,18 16,26 Q12,38 40,43 Z M40,38 Q54,18 64,26 Q68,38 40,43 Z", fill: LILAC, t: 1.3 },
      { d: "M40,44 Q24,46 24,58 Q33,62 40,48 Z M40,44 Q56,46 56,58 Q47,62 40,48 Z", fill: YELLOW, t: 1.4 },
    ],
  },
  grass: {
    lines: [
      { d: "M34,74 q1,-9 5,-13", t: 0, dur: 0.15 },
      { d: "M40,74 q0,-11 1,-16", t: 0.1, dur: 0.15 },
      { d: "M46,74 q-1,-8 3,-11", t: 0.2, dur: 0.15 },
    ],
    tints: [],
  },
} satisfies Record<string, Drawing>;

export type MotifName = keyof typeof drawings;

const at = (t: number, dur = 0.4) => ({ "--t": `${f(t)}s`, "--d": `${dur}s` }) as CSSProperties;

function Strokes({ name, delay }: { name: MotifName; delay: number }) {
  const { lines, tints }: Drawing = drawings[name];
  return (
    <>
      {tints.map((w, i) => (
        // the wash sits a little off its line, as it does on paper
        <path key={`w${i}`} d={w.d} fill={w.fill} className={styles.tint} transform="translate(1.6 1.2)" style={at(delay + w.t, 0.7)} />
      ))}
      {lines.map((l, i) => (
        <path key={i} d={l.d} pathLength={1} style={at(delay + l.t, l.dur)} />
      ))}
    </>
  );
}

export function Motif({ name, delay = 0, className }: { name: MotifName; delay?: number; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`${styles.ink} ${styles.motif} ${className ?? ""}`} aria-hidden>
      <Strokes name={name} delay={delay} />
    </svg>
  );
}

// the same flower every time for the same page, so an essay keeps its own
const FLOWERS: MotifName[] = ["tulip", "daisy", "dandelion", "sprout", "mushroom", "butterfly"];

export function motifFor(seed: string): MotifName {
  let a = 0;
  for (const c of seed) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0;
  return FLOWERS[Math.abs(a) % FLOWERS.length];
}

// what grows along the last line of every page: where each thing stands, how
// big, and whether it leans the other way
const BED: [name: MotifName, x: number, size: number, flip?: boolean][] = [
  ["grass", 4, 0.8],
  ["tulip", 46, 0.9],
  ["grass", 98, 0.7, true],
  ["sprout", 150, 0.62],
  ["daisy", 236, 1, true],
  ["grass", 300, 0.8],
  ["mushroom", 420, 0.7],
  ["grass", 520, 0.7, true],
  ["dandelion", 600, 0.95],
  ["grass", 668, 0.8],
  ["tulip", 760, 0.72, true],
  ["grass", 812, 0.7],
];

export function GardenBed() {
  return (
    <svg viewBox="0 0 880 80" preserveAspectRatio="xMinYMax slice" className={`${styles.ink} ${styles.bed}`} aria-hidden>
      {BED.map(([name, x, size, flip], i) => (
        <g key={i} transform={`translate(${x + (flip ? 80 * size : 0)} ${80 - 74 * size - 3}) scale(${flip ? -size : size} ${size})`}>
          <Strokes name={name} delay={0.2 + i * 0.12} />
        </g>
      ))}
      <g transform="translate(690 -8) rotate(-18 40 40) scale(0.5)">
        <Strokes name="butterfly" delay={2} />
      </g>
    </svg>
  );
}
