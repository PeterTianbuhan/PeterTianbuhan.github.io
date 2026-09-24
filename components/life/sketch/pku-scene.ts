// 我心里的北大, as a pen sketch: the far shore and its trees, the library roof
// over them, 博雅塔, the island pavilion, the stone boat with a cat on it,
// a bike by the near shore. Every stroke carries the
// moment it's drawn; every wash, the moment it's painted.

export const VIEW = { w: 1600, h: 1000 };
// sky, shore, lake and grass carry on past the frame on both sides, so wide
// screens see more of them instead of losing the top and bottom
export const BLEED = 300;
const L = -BLEED - 20;
const R = VIEW.w + BLEED + 20;

export type Stroke = { d: string; t: number; dur: number; w?: number; ghost?: boolean; group?: string };
export type Wash = {
  d: string;
  color: string;
  t: number;
  dur: number;
  // area the brush sweeps across while the wash goes on
  box: [number, number, number, number];
  opacity?: number;
  group?: string;
  // "evenodd" lets later subpaths punch holes (clouds out of the sky)
  rule?: "evenodd";
};
export type Streak = { d: string; color: string; t: number; dur: number; w: number; opacity?: number; group?: string };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

// A run of bumps along a baseline: treetops, cloud tops, grass-topped rocks.
// `at` gives the height of the bumps at any x, so things can stand behind them.
function bumpsCurve(r: () => number, x0: number, x1: number, base: (x: number) => number, h: [number, number], w: [number, number]) {
  const segs: [number, number, number, number, number][] = [];
  let x = x0;
  let d = `M${f(x)},${f(base(x))}`;
  while (x < x1) {
    const s = w[0] + (w[1] - w[0]) * r();
    const nx = Math.min(x1, x + s);
    const peak = h[0] + (h[1] - h[0]) * r();
    const cy = (base(x) + base(nx)) / 2 - peak * 2;
    segs.push([x, base(x), cy, nx, base(nx)]);
    d += ` Q${f((x + nx) / 2)},${f(cy)} ${f(nx)},${f(base(nx))}`;
    x = nx;
  }
  // the control point sits halfway along, so x runs linearly through each bump
  const at = (px: number) => {
    const [a, ya, cy, b, yb] = segs.find((g) => px <= g[3]) ?? segs[segs.length - 1];
    const t = Math.max(0, Math.min(1, (px - a) / (b - a)));
    return (1 - t) ** 2 * ya + 2 * t * (1 - t) * cy + t * t * yb;
  };
  return { d, at };
}

const bumps = (...args: Parameters<typeof bumpsCurve>) => bumpsCurve(...args).d;

// A scalloped blob around an ellipse: a crown of leaves, a pine pad.
function clump(r: () => number, cx: number, cy: number, rx: number, ry: number, n: number, bulge = 0.35) {
  const start = r() * Math.PI;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = start + (i / n) * Math.PI * 2;
    const k = 0.9 + r() * 0.2;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % n];
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    d += ` Q${f(cx + (mx - cx) * (1 + bulge))},${f(cy + (my - cy) * (1 + bulge))} ${f(bx)},${f(by)}`;
  }
  return d + " Z";
}

// Back-and-forth sweeps that cover a box: the brush path under a wash.
function sweep(box: [number, number, number, number], width: number) {
  const [x0, y0, x1, y1] = box;
  const step = width * 0.55;
  let d = `M${x0 - width},${y0}`;
  let right = true;
  for (let y = y0; y <= y1 + step; y += step) {
    d += ` L${right ? x1 + width : x0 - width},${f(y + step * 0.4)}`;
    if (y + step <= y1 + step) d += ` L${right ? x1 + width : x0 - width},${f(y + step)}`;
    right = !right;
  }
  return d;
}

export function brushFor(box: [number, number, number, number]) {
  const size = Math.max(60, Math.min(170, (box[3] - box[1]) * 0.55));
  return { d: sweep(box, size), width: size };
}

// ---------------------------------------------------------------------------

const strokes: Stroke[] = [];
const washes: Wash[] = [];
const streaks: Streak[] = [];
const line = (d: string, t: number, dur: number, extra: Partial<Stroke> = {}) => strokes.push({ d, t, dur, ...extra });

const SHORE = 566;

// far shore
line(`M${L},${SHORE + 2} C300,${SHORE - 3} 600,${SHORE + 3} 900,${SHORE} S1400,${SHORE - 2} ${R},${SHORE + 1}`, 0.3, 1.3, { ghost: true });

// far treeline, taller where the pagoda's mound is and in front of the library
const crownBase = (x: number) => {
  if (x < 130) return 548;
  if (x < 480) return 530;
  if (x < 1070) return 548;
  if (x < 1310) return 528;
  return 550;
};
const crownLine = (x: number) => (crownBase(x - 30) + crownBase(x) * 2 + crownBase(x + 30)) / 4;
const crowns = bumpsCurve(rng(7), L, R, crownLine, [9, 20], [26, 52]);
// what stands behind the trees is drawn down to their crowns and no further
const crownTop = (x: number) => f(crowns.at(x) - 1.5);
const alongCrowns = (from: number, to: number) =>
  Array.from({ length: 13 }, (_, i) => from + ((to - from) * i) / 12).map((x) => `L${f(x)},${crownTop(x)}`).join(" ");

// the library's roof over the trees on the left, its walls sunk into them
{
  const t0 = 1.4;
  line("M200,432 L410,432", t0, 0.4, { w: 2.4 });
  line("M200,432 q-5,-13 5,-21 q7,-3 7,5", t0 + 0.35, 0.2);
  line("M410,432 q5,-13 -5,-21 q-7,-3 -7,5", t0 + 0.4, 0.2);
  line("M200,432 Q186,460 144,471", t0 + 0.5, 0.3);
  line("M410,432 Q424,460 466,471", t0 + 0.55, 0.3);
  line("M136,465 Q148,480 172,480 L438,480 Q462,480 474,465", t0 + 0.8, 0.5, { w: 2.4 });
  line("M160,487 L450,487", t0 + 1.2, 0.3, { w: 1.4 });
  line(`M178,487 L178,${crownTop(178)} M432,487 L432,${crownTop(432)}`, t0 + 1.35, 0.25);
  for (let i = 0; i < 11; i++) {
    const x = 196 + i * 22;
    if (crownTop(x) > 498) line(`M${x},495 L${x},${crownTop(x)}`, t0 + 1.45 + i * 0.03, 0.12, { w: 1.3 });
  }
}

{
  const r = rng(7);
  line(bumps(r, L, R, crownLine, [9, 20], [26, 52]), 2.6, 2.4, { ghost: true });
  for (let x = L + 60; x < R - 40; x += 70 + r() * 90) {
    if (x > 1130 && x < 1250) continue;
    line(`M${f(x)},${f(crownLine(x) - 4)} q${f(r() * 6 - 3)},${f(10 + r() * 8)} ${f(r() * 4 - 2)},${f(SHORE - crownLine(x) + 2)}`, 3.3 + (x - L) / 2200, 0.2, { w: 1.2 });
  }
  const fill = crowns.d + ` L${R},${SHORE + 2} L${L},${SHORE + 2} Z`;
  washes.push({ d: fill, color: "#86c26a", t: 13.8, dur: 1.5, box: [L, 440, R, SHORE], opacity: 0.85 });
  washes.push({ d: fill, color: "#3f8f5a", t: 14.5, dur: 1.1, box: [L, 500, R, SHORE], opacity: 0.35 });
}

// 博雅塔: thirteen close eaves on an octagonal shaft
{
  const cx = 1190;
  const t0 = 3.5;
  const eave = (i: number) => ({ y: 492 - i * 21.5, w: 118 - i * 3.1, b: 74 - i * 2.1 });
  const left = Array.from({ length: 13 }, (_, i) => eave(i)).map((e) => `${f(cx - e.b / 2)},${f(e.y)}`);
  const right = Array.from({ length: 13 }, (_, i) => eave(i)).map((e) => `${f(cx + e.b / 2)},${f(e.y)}`);
  line(`M${cx - 38},508 L${left.join(" L")}`, t0, 0.8, { ghost: true });
  line(`M${cx + 38},508 L${right.join(" L")}`, t0 + 0.1, 0.8, { ghost: true });
  for (let i = 0; i < 13; i++) {
    const { y, w } = eave(i);
    const l = cx - w / 2;
    const rr = cx + w / 2;
    line(`M${f(l - 5)},${f(y - 7)} Q${f(l + 1)},${f(y + 1)} ${f(l + 12)},${f(y + 1)} L${f(rr - 12)},${f(y + 1)} Q${f(rr - 1)},${f(y + 1)} ${f(rr + 5)},${f(y - 7)}`, t0 + 0.9 + i * 0.11, 0.22, { w: 2.1 });
    line(`M${f(l + 8)},${f(y + 5)} L${f(rr - 8)},${f(y + 5)}`, t0 + 1.0 + i * 0.11, 0.12, { w: 1.1 });
  }
  const top = eave(12);
  line(`M${f(cx - top.w / 2 + 2)},${f(top.y - 5)} Q${cx - 18},${f(top.y - 18)} ${cx},${f(top.y - 52)} Q${cx + 18},${f(top.y - 18)} ${f(cx + top.w / 2 - 2)},${f(top.y - 5)}`, t0 + 2.4, 0.4, { w: 2.2 });
  line(`M${cx},${f(top.y - 52)} Q${cx - 5},${f(top.y - 26)} ${cx - 9},${f(top.y)}`, t0 + 2.7, 0.2, { w: 1.2 });
  line(`M${cx},${f(top.y - 52)} L${cx},${f(top.y - 86)}`, t0 + 2.85, 0.2, { w: 1.8 });
  for (let k = 0; k < 4; k++) line(`M${cx - 6 + k},${f(top.y - 58 - k * 6)} l${12 - k * 2},0`, t0 + 2.95 + k * 0.04, 0.08, { w: 1.4 });
  line(`M${cx + 4},${f(top.y - 88)} a4,4 0 1,0 -8,0 a4,4 0 1,0 8,0`, t0 + 3.1, 0.15, { w: 1.4 });

  const outline =
    `M${cx},${f(top.y - 52)} ` +
    Array.from({ length: 13 }, (_, i) => eave(12 - i)).map((e) => `L${f(cx - e.w / 2 - 3)},${f(e.y - 3)} L${f(cx - e.b / 2)},${f(e.y + 6)}`).join(" ") +
    ` L${cx - 38},512 L${cx + 38},512 ` +
    Array.from({ length: 13 }, (_, i) => eave(i)).map((e) => `L${f(cx + e.b / 2)},${f(e.y + 6)} L${f(cx + e.w / 2 + 3)},${f(e.y - 3)}`).join(" ") +
    " Z";
  washes.push({ d: outline, color: "#9da2ab", t: 14.3, dur: 0.9, box: [cx - 70, 150, cx + 70, 512], opacity: 0.8 });
  // the sun catches the left side of every eave
  washes.push({ d: outline, color: "#e7c28a", t: 14.8, dur: 0.6, box: [cx - 70, 150, cx - 5, 512], opacity: 0.55 });
  const pagodaReflection = Array.from({ length: 9 }, (_, i) => {
    const y = 586 + i * 20;
    const w = 50 - i * 4;
    return `M${f(cx - w / 2 + (i % 2) * 6)},${y} l${f(w)},${i % 2 ? -1 : 1}`;
  }).join(" ");
  line(pagodaReflection, 7.9, 0.5, { w: 1.3 });
}

// library roof wash
washes.push({
  d: "M136,465 Q148,480 172,480 L438,480 Q462,480 474,465 L466,471 Q424,460 410,432 L200,432 Q186,460 144,471 Z",
  color: "#7f8ea3",
  t: 14.6,
  dur: 0.6,
  box: [130, 410, 480, 485],
  opacity: 0.85,
});
washes.push({ d: `M178,487 L432,487 ${alongCrowns(432, 178)} Z`, color: "#eadcc4", t: 14.7, dur: 0.5, box: [170, 485, 440, 544], opacity: 0.9 });

// the island: rocks, two pines, maples, and the pavilion
{
  const r = rng(21);
  const t0 = 5.4;
  line(bumps(r, 405, 720, (x) => 634 + ((x - 560) / 160) ** 2 * 6, [3, 8], [18, 34]), t0, 0.6);
  line("M400,640 Q560,676 725,642", t0 + 0.3, 0.5, { ghost: true });
  // pavilion
  line("M508,628 L622,628 M503,636 L627,636", t0 + 0.7, 0.3, { w: 1.6 });
  for (const x of [522, 548, 582, 608]) line(`M${x},628 L${x},582`, t0 + 0.85 + (x - 522) * 0.002, 0.15, { w: 1.8 });
  line("M522,612 L608,612", t0 + 1.05, 0.15, { w: 1.1 });
  line("M515,582 L615,582", t0 + 1.1, 0.15, { w: 1.6 });
  line("M490,572 Q504,583 526,580 L604,580 Q626,583 640,572", t0 + 1.2, 0.3, { w: 2.2 });
  line("M500,576 Q540,561 565,532 Q590,561 630,576", t0 + 1.4, 0.35, { w: 2 });
  line("M565,532 Q556,556 549,580 M565,532 Q574,556 581,580", t0 + 1.6, 0.2, { w: 1.2 });
  line("M565,532 L565,515 M569,511 a4,4 0 1,0 -8,0 a4,4 0 1,0 8,0", t0 + 1.75, 0.15, { w: 1.4 });
  // pines on the left, maples on the right
  line("M470,632 Q462,596 450,552", t0 + 1.9, 0.25, { w: 1.6 });
  const pads = [clump(r, 438, 552, 44, 12, 7), clump(r, 452, 578, 52, 13, 8), clump(r, 468, 606, 44, 12, 7)];
  pads.forEach((d, i) => line(d, t0 + 2.05 + i * 0.12, 0.3, { w: 1.5 }));
  const maples = [clump(r, 676, 600, 46, 30, 9, 0.3), clump(r, 708, 620, 28, 16, 7, 0.3)];
  maples.forEach((d, i) => line(d, t0 + 2.4 + i * 0.12, 0.35, { w: 1.5 }));
  line("M672,630 L674,612 M706,636 L706,626", t0 + 2.7, 0.12, { w: 1.2 });

  const rocks = "M405,634 Q560,622 720,636 Q560,678 400,640 Z";
  washes.push({ d: rocks, color: "#c9c3b6", t: 15.2, dur: 0.5, box: [395, 620, 725, 670], opacity: 0.8 });
  pads.forEach((d) => washes.push({ d, color: "#4f9a6b", t: 15.0, dur: 0.6, box: [385, 535, 525, 625], opacity: 0.85 }));
  maples.forEach((d) => washes.push({ d, color: "#e2764f", t: 15.1, dur: 0.6, box: [625, 565, 740, 640], opacity: 0.8 }));
  washes.push({ d: "M490,572 Q504,583 526,580 L604,580 Q626,583 640,572 L630,576 Q590,561 565,532 Q540,561 500,576 Z", color: "#6f7f94", t: 15.3, dur: 0.4, box: [488, 528, 642, 585], opacity: 0.85 });
  for (const x of [522, 548, 582, 608]) {
    streaks.push({ d: `M${x},628 L${x},584`, color: "#d64b3a", t: 15.5, dur: 0.25, w: 5, opacity: 0.9 });
  }
  line("M430,660 l40,0 M520,672 l70,-1 M620,664 l50,1", 8.0, 0.35, { w: 1.2 });
}

// the stone boat, and the cat that's always on it
{
  const t0 = 6.9;
  line("M838,684 Q850,713 882,717 L1050,717 Q1080,713 1090,684", t0, 0.45, { w: 2 });
  line("M834,682 L1094,680", t0 + 0.3, 0.3, { w: 2 });
  line("M834,682 q-12,-15 3,-24 q15,-4 13,12", t0 + 0.5, 0.18, { w: 1.8 });
  line("M1094,680 q12,-15 -3,-24 q-15,-4 -13,12", t0 + 0.55, 0.18, { w: 1.8 });
  line("M880,700 q10,-8 20,0 q10,8 20,0 M1010,702 q10,-8 20,0 q10,8 20,0", t0 + 0.7, 0.25, { w: 1.1 });
  line("M870,728 l60,0 M960,734 l90,-1 M1000,746 l40,0", 8.1, 0.3, { w: 1.2 });

  line("M1000,680 Q995,660 1004,650 Q1003,636 1012,634 Q1021,636 1020,650 Q1027,662 1022,680", t0 + 0.9, 0.4, { w: 1.6 });
  line("M1005,641 l2,-9 l5,6 M1014,637 l5,-6 l1,9", t0 + 1.25, 0.15, { w: 1.4 });
  line("M1022,678 Q1042,676 1037,660", t0 + 1.35, 0.15, { w: 1.5 });

  washes.push({ d: "M838,684 Q850,713 882,717 L1050,717 Q1080,713 1090,684 Z", color: "#d9d2c3", t: 15.7, dur: 0.5, box: [830, 670, 1100, 720], opacity: 0.8 });
  washes.push({ d: "M1000,680 Q995,660 1004,650 Q1003,636 1012,634 Q1021,636 1020,650 Q1027,662 1022,680 Z", color: "#f0a04b", t: 16.0, dur: 0.3, box: [990, 628, 1030, 682], opacity: 0.9 });
}

// water
{
  const r = rng(33);
  const skip = (x: number, y: number) =>
    (x > 390 && x < 740 && y < 680) || (x > 820 && x < 1110 && y > 660 && y < 760) || (x > 1140 && x < 1240 && y < 770);
  let n = 0;
  for (let i = 0; i < 90 && n < 36; i++) {
    const x = L + 80 + r() * (R - L - 160);
    const y = 590 + r() * 240;
    if (skip(x, y)) continue;
    const len = 18 + r() * 40 * (y - 560) / 200;
    line(`M${f(x)},${f(y)} q${f(len / 2)},${f(-2 + r() * 4)} ${f(len)},0`, 7.6 + n * 0.035, 0.18, { w: 1.1, group: "ripples" });
    n++;
  }
  const NEAR = 866;
  const nearY = (x: number) => NEAR + Math.sin(x * 0.006) * 10 + Math.sin(x * 0.019) * 4;
  const lake = `M${L},${SHORE} L${R},${SHORE} ` + Array.from({ length: 57 }, (_, i) => `L${f(R - i * 40)},${f(nearY(R - i * 40))}`).join(" ") + " Z";
  // the island, the boat and the cat keep their own colours
  const holes =
    " M400,642 C398,572 470,528 560,526 C650,526 742,576 726,640 Q560,680 400,642 Z" +
    " M838,684 Q850,713 882,717 L1050,717 Q1080,713 1090,684 Z" +
    " M1000,680 Q995,660 1004,650 Q1003,636 1012,634 Q1021,636 1020,650 Q1027,662 1022,680 Z";
  washes.push({ d: lake + holes, color: "url(#lake)", t: 13.3, dur: 1.4, box: [L, SHORE, R, 900], opacity: 0.8, rule: "evenodd" });

  // the near shore: rocks and grass, and a bike parked on the path
  const rr = rng(44);
  line(bumps(rr, L, R, nearY, [4, 12], [40, 90]), 8.3, 1.2, { ghost: true });
  for (let x = L + 50; x < R - 40; x += 30 + rr() * 60) {
    const y = nearY(x) + 22 + rr() * 60;
    line(`M${f(x)},${f(y)} l${f(-3 + rr() * 2)},-12 M${f(x + 5)},${f(y)} l${f(2 + rr() * 2)},-15`, 8.9 + (x - L) / 4400, 0.1, { w: 1.2 });
  }
  const bank = bumps(rng(44), L, R, nearY, [4, 12], [40, 90]) + ` L${R},1080 L${L},1080 Z`;
  washes.push({ d: bank, color: "#8fcb66", t: 15.8, dur: 1.0, box: [L, 840, R, 1080], opacity: 0.8 });

  const t0 = 9.2;
  line("M1325,930 m-38,0 a38,38 0 1,0 76,0 a38,38 0 1,0 -76,0", t0, 0.35, { w: 1.8 });
  line("M1430,930 m-38,0 a38,38 0 1,0 76,0 a38,38 0 1,0 -76,0", t0 + 0.2, 0.35, { w: 1.8 });
  const frame = "M1325,930 L1356,882 L1372,930 Z M1356,882 L1408,886 L1372,930 M1408,886 L1430,930";
  line(frame, t0 + 0.5, 0.5, { w: 1.9 });
  line("M1346,874 L1368,874 M1356,882 L1357,874 M1408,886 L1404,868 L1420,864", t0 + 0.95, 0.25, { w: 1.8 });
  line("M1414,866 L1446,866 L1442,888 L1418,888 Z", t0 + 1.15, 0.2, { w: 1.5 });
  streaks.push({ d: frame, color: "#f2b731", t: 16.2, dur: 0.5, w: 6, opacity: 0.9 });
  washes.push({ d: "M1414,866 L1446,866 L1442,888 L1418,888 Z", color: "#f2b731", t: 16.5, dur: 0.2, box: [1410, 860, 1450, 892], opacity: 0.6 });
}

// 不言壁, 山鹰社's climbing wall by 一体: a white tower with an overhanging top,
// a roof and railing over it, the club's badge, a climber on a top rope
const WALL = "M1360,392 L1430,378 L1466,394 L1458,412 L1485,414 L1480,560 L1384,560 L1380,466 L1368,396 Z";
{
  const t0 = 10.65;
  line(`M1368,396 L1428,390 M1368,396 L1380,466 L1383,${crownTop(1383)}`, t0, 0.35, { w: 1.9 });
  line(`M1428,390 L1431.5,${crownTop(1431.5)}`, t0 + 0.3, 0.25, { w: 1.9 });
  line(`M1428,390 L1458,400 L1456,${crownTop(1456)}`, t0 + 0.5, 0.25, { w: 1.7 });
  line(`M1458,412 L1480,416 L1474,470 L1479,${crownTop(1479)}`, t0 + 0.7, 0.25, { w: 1.7 });
  line("M1360,392 L1430,378 L1466,394", t0 + 0.9, 0.25, { w: 2.2 });
  line("M1453,410 L1485,414", t0 + 1.05, 0.12, { w: 2 });
  line("M1372,382 L1430,370 L1458,383", t0 + 1.1, 0.2, { w: 1.1 });
  line("M1372,390 l0,-8 M1392,386 l0,-8 M1412,382 l0,-8 M1430,378 l0,-8 M1446,387 l0,-8", t0 + 1.2, 0.12, { w: 1 });
  // the inscription running down the side face, in two columns
  const text = [1439, 1448].map((x, k) => `M${x},${410 + k * 6}` + " q3,3 0,6 q-3,3 0,6".repeat(6 - k)).join(" ");
  line(text, t0 + 1.25, 0.25, { w: 1.1 });
  line("M1378,420 L1398,420 L1398,440 L1378,440 Z", t0 + 1.35, 0.15, { w: 1.3 });
  line("M1381,434 L1388,424 L1392,427 L1396,423", t0 + 1.45, 0.1, { w: 1.1 });
  // the climber, and the rope up to the anchor and back down to the belayer
  line(`M1411,484 L1415,393 L1420.4,${crownTop(1420.4)}`, t0 + 1.5, 0.2, { w: 0.9 });
  line("M1413.2,468 a3.2,3.2 0 1,0 -6.4,0 a3.2,3.2 0 1,0 6.4,0 M1410,471 L1411,484 M1410,474 L1403,465 M1410,474 L1417,470 M1411,484 L1405,493 M1411,484 L1417,494", t0 + 1.6, 0.25, { w: 1.4 });

  washes.push({ d: `M1428,390 L1458,400 L1456,${crownTop(1456)} ${alongCrowns(1456, 1431.5)} Z`, color: "#c3ccd8", t: 16.6, dur: 0.4, box: [1426, 388, 1460, 560], opacity: 0.8 });
  washes.push({ d: "M1360,392 L1430,378 L1466,394 L1458,400 L1428,390 L1368,396 Z", color: "#5b87b8", t: 16.8, dur: 0.3, box: [1356, 374, 1470, 402], opacity: 0.85 });
  streaks.push({ d: "M1453,411 L1485,415", color: "#5b87b8", t: 16.9, dur: 0.15, w: 5, opacity: 0.85 });
  const dot = (x: number, y: number) => `M${x - 2.6},${y} a2.6,2.6 0 1,0 5.2,0 a2.6,2.6 0 1,0 -5.2,0`;
  // holds scattered over both climbing faces, clear of the badge, the climber and the rope
  const r = rng(88);
  const rope = (y: number) => [1415 - ((y - 393) / 91) * 4, 1415 + ((y - 393) / 167) * 6];
  const spots: [number, number][] = [];
  while (spots.length < 24) {
    const onRight = r() < 0.3;
    const y = 402 + r() * 128;
    const x = onRight ? 1462 + r() * 13 : 1368 + ((y - 396) / 70) * 12 + 5 + r() * (54 - ((y - 396) / 70) * 12);
    const clear =
      !(x > 1374 && x < 1402 && y > 416 && y < 444) &&
      !(x > 1399 && x < 1421 && y > 460 && y < 498) &&
      rope(y).every((rx) => Math.abs(x - rx) > 4) &&
      y < crownTop(x) - 4 &&
      spots.every(([sx, sy]) => Math.hypot(sx - x, sy - y) > 11);
    if (clear) spots.push([f(x), f(y)]);
  }
  ["#f2b731", "#4f9a6b", "#3f7fc4", "#e2583a"].forEach((color, i) =>
    washes.push({
      d: spots.filter((_, k) => k % 4 === i).map(([x, y]) => dot(x, y)).join(" "),
      color,
      t: 17.0 + i * 0.06,
      dur: 0.25,
      box: [1376, 400, 1482, 530],
      opacity: 0.9,
    }),
  );
  // 山鹰社's badge: a white eagle-headed peak on red, a dark ridge under it
  washes.push({ d: "M1378,420 L1398,420 L1398,440 L1378,440 Z M1381,434 L1388,424 L1392,427 L1396,423 L1397,434 Z", color: "#c8372d", t: 17.25, dur: 0.2, box: [1376, 418, 1400, 442], opacity: 0.9, rule: "evenodd" });
  washes.push({ d: "M1378,440 L1378,436 L1384,431 L1389,435 L1394,430 L1398,433 L1398,440 Z", color: "#2a2a2e", t: 17.35, dur: 0.15, box: [1376, 428, 1400, 442], opacity: 0.8 });
  washes.push({ d: "M1407,471 L1414,471 L1414,484 L1408,484 Z", color: "#e2583a", t: 17.4, dur: 0.15, box: [1404, 468, 1418, 486], opacity: 0.9 });
}

// sky: the sun, two clouds, two birds
{
  const r = rng(66);
  line("M1450,140 m-34,0 a34,34 0 1,0 68,0 a34,34 0 1,0 -68,0", 12.1, 0.4, { w: 1.6 });
  const cloud1 = bumps(r, 700, 930, () => 206, [8, 22], [34, 60]);
  line(cloud1, 12.4, 0.5, { w: 1.6, group: "clouds" });
  line("M700,206 L930,206", 12.8, 0.2, { w: 1.1, group: "clouds" });
  const cloud2 = bumps(r, 1330, 1540, () => 300, [6, 16], [30, 50]);
  line(cloud2, 12.7, 0.45, { w: 1.6, group: "clouds" });
  line("M1330,300 L1540,300", 13.05, 0.2, { w: 1.1, group: "clouds" });
  line("M560,112 q8,-8 15,0 q8,-8 15,0 M606,136 q6,-6 11,0 q6,-6 11,0", 13.1, 0.3, { w: 1.4, group: "birds" });

  const sun = "M1450,140 m-34,0 a34,34 0 1,0 68,0 a34,34 0 1,0 -68,0";
  washes.push({
    d: `M${L},-80 L${R},-80 L${R},570 L${L},570 Z ${cloud1} Z ${cloud2} Z ${sun} ${WALL}`,
    color: "url(#sky)",
    t: 12.8,
    dur: 1.7,
    box: [L, -80, R, 570],
    opacity: 1,
    rule: "evenodd",
  });
  // a faint blue under each cloud so it has a belly
  washes.push({ d: "M710,206 Q815,226 920,206 Z", color: "#9cc6e6", t: 13.6, dur: 0.4, box: [700, 196, 930, 220], opacity: 0.5 });
  washes.push({ d: "M1340,300 Q1435,318 1530,300 Z", color: "#9cc6e6", t: 13.7, dur: 0.4, box: [1330, 290, 1540, 316], opacity: 0.5 });
  washes.push({ d: "M1450,140 m-34,0 a34,34 0 1,0 68,0 a34,34 0 1,0 -68,0", color: "#ffd35c", t: 17.0, dur: 0.3, box: [1410, 100, 1490, 180], opacity: 0.95 });
}

// the times above are the drawing at a leisurely pace; it plays twice as fast
const PACE = 0.5;
for (const x of [...strokes, ...washes, ...streaks]) {
  x.t *= PACE;
  x.dur *= PACE;
}

export const SEAL_AT = 17.8 * PACE;
export const DONE_AT = 18.6 * PACE;
export const scene = { strokes, washes, streaks };
