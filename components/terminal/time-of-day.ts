export type Palette = {
  bg: string;
  panel: string;
  edge: string;
  text: string;
  muted: string;
  accent: string;
  chrome: string;
  prompt: string;
  code: string;
  skyTop: string;
  skyMiddle: string;
  skyBottom: string;
  cloud: string;
  cloudShade: string;
  cloudLight: string;
  distant: string;
  farShade: string;
  farMid: string;
  farLight: string;
  treeShade: string;
  treeMid: string;
  treeLight: string;
  towerShade: string;
  towerMid: string;
  towerLight: string;
  templeWall: string;
  templeShade: string;
  nearShade: string;
  nearMid: string;
  nearLight: string;
  stone: string;
  stoneLight: string;
  waterTop: string;
  waterMiddle: string;
  waterBottom: string;
};
// Four keyframes. Same hues as the reference photographs, but saturated
// and lifted a step so they read as a pixel painting rather than a haze.
const dusk: Palette = {
  bg: "#254568",
  panel: "#315672",
  edge: "#577e9b",
  text: "#fff0d4",
  muted: "#c1d0ce",
  accent: "#ffdfa0",
  chrome: "#38607b",
  prompt: "#2b4f6f",
  code: "#254768",
  skyTop: "#607cc9",
  skyMiddle: "#e097be",
  skyBottom: "#fdd7a8",
  cloud: "#f5b2c7",
  cloudShade: "#c999c1",
  cloudLight: "#fee1d4",
  distant: "#8c9fbb",
  farShade: "#4f919f",
  farMid: "#70adaa",
  farLight: "#b1c5a2",
  treeShade: "#25866d",
  treeMid: "#49a964",
  treeLight: "#b4cc75",
  towerShade: "#3c5268",
  towerMid: "#796e7c",
  towerLight: "#b89e96",
  templeWall: "#be6d67",
  templeShade: "#8a5157",
  nearShade: "#23746d",
  nearMid: "#3b9b60",
  nearLight: "#92bd67",
  stone: "#858e86",
  stoneLight: "#d1bb99",
  waterTop: "#95c4c6",
  waterMiddle: "#5aaacb",
  waterBottom: "#2c7cc6",
};
const night: Palette = {
  bg: "#102d4e",
  panel: "#15395a",
  edge: "#3a698a",
  text: "#e1eff2",
  muted: "#a5c6db",
  accent: "#d3f0e3",
  chrome: "#1b4264",
  prompt: "#123455",
  code: "#0e2f50",
  skyTop: "#0a2987",
  skyMiddle: "#1f57a9",
  skyBottom: "#798dad",
  cloud: "#4f6db6",
  cloudShade: "#375ba7",
  cloudLight: "#748bc0",
  distant: "#4479a2",
  farShade: "#2a6b89",
  farMid: "#36889d",
  farLight: "#6ca5a5",
  treeShade: "#1b6c72",
  treeMid: "#278e72",
  treeLight: "#5ca87d",
  towerShade: "#1f4062",
  towerMid: "#465b79",
  towerLight: "#9db3c6",
  templeWall: "#af6f89",
  templeShade: "#5c435c",
  nearShade: "#16626d",
  nearMid: "#2a8269",
  nearLight: "#55a076",
  stone: "#55717d",
  stoneLight: "#95a4ac",
  waterTop: "#4f90b8",
  waterMiddle: "#2176bc",
  waterBottom: "#1056a6",
};
const dawn: Palette = {
  bg: "#f1dfd6",
  panel: "#f9ebd8",
  edge: "#ceacb1",
  text: "#514254",
  muted: "#785d6a",
  accent: "#975232",
  chrome: "#f1ddcf",
  prompt: "#f3e2d0",
  code: "#e8d3c7",
  skyTop: "#a393d2",
  skyMiddle: "#fcb8c5",
  skyBottom: "#fde3b5",
  cloud: "#fdd6db",
  cloudShade: "#deb4d8",
  cloudLight: "#feebdc",
  distant: "#9f8d9b",
  farShade: "#7a8395",
  farMid: "#8b93a0",
  farLight: "#b2aaa7",
  treeShade: "#4b8a69",
  treeMid: "#77b479",
  treeLight: "#cedb89",
  towerShade: "#68657a",
  towerMid: "#9d8d97",
  towerLight: "#d4b099",
  templeWall: "#cd867c",
  templeShade: "#a35c67",
  nearShade: "#3b7759",
  nearMid: "#5ca661",
  nearLight: "#b6c879",
  stone: "#b1ada1",
  stoneLight: "#f2d0a5",
  waterTop: "#e4c6c8",
  waterMiddle: "#a8afd9",
  waterBottom: "#7397cd",
};
const day: Palette = {
  bg: "#def3df",
  panel: "#f2fbe8",
  edge: "#aad2ba",
  text: "#214b3b",
  muted: "#4f7563",
  accent: "#15783c",
  chrome: "#e0f2de",
  prompt: "#e7f5df",
  code: "#d7edcf",
  skyTop: "#4bbbfa",
  skyMiddle: "#8edefc",
  skyBottom: "#e1f5cb",
  cloud: "#eefae9",
  cloudShade: "#c0e8e8",
  cloudLight: "#fef9e8",
  distant: "#89cbbb",
  farShade: "#49bb8f",
  farMid: "#77c69e",
  farLight: "#b4e098",
  treeShade: "#21965e",
  treeMid: "#55bc5e",
  treeLight: "#bfe562",
  towerShade: "#5f7570",
  towerMid: "#a3a28f",
  towerLight: "#ded0a3",
  templeWall: "#d86e56",
  templeShade: "#a75141",
  nearShade: "#1c885a",
  nearMid: "#3cb14b",
  nearLight: "#b5dc5c",
  stone: "#b8c795",
  stoneLight: "#fdedb5",
  waterTop: "#8ddfc7",
  waterMiddle: "#56cfc7",
  waterBottom: "#1daed7",
};
const stops = [
  { hour: 0, p: night },
  { hour: 4.5, p: night },
  { hour: 6, p: dawn },
  { hour: 8, p: day },
  { hour: 15.5, p: day },
  { hour: 18.5, p: dusk },
  { hour: 21, p: night },
  { hour: 24, p: night },
];
export function mixColor(a: string, b: string, t: number) {
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(a.slice(i, i + 2), 16) * (1 - t) +
            parseInt(b.slice(i, i + 2), 16) * t,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function contrastRatio(a: string, b: string) {
  const luminance = (color: string) =>
    [1, 3, 5]
      .map((i) => parseInt(color.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
// Light-to-dark surface transitions must not pass through unreadable gray-on-gray.
export function readableColor(preferred: string, background: string) {
  if (contrastRatio(preferred, background) >= 4.5) return preferred;
  const target =
    contrastRatio("#000000", background) > contrastRatio("#ffffff", background)
      ? "#000000"
      : "#ffffff";
  for (let step = 1; step <= 100; step++) {
    const candidate = mixColor(preferred, target, step / 100);
    if (contrastRatio(candidate, background) >= 4.5) return candidate;
  }
  return target;
}
export function beijingHour(timestamp = Date.now()) {
  const date = new Date(timestamp + 8 * 60 * 60 * 1000);
  return (
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  );
}
export function timeOfDay(hour: number) {
  const h = Number.isFinite(hour) ? ((hour % 24) + 24) % 24 : 12;
  const i = stops.findIndex((stop, index) => index > 0 && h < stop.hour);
  const a = stops[i - 1],
    b = stops[i];
  const linear = (h - a.hour) / (b.hour - a.hour),
    t = linear * linear * (3 - 2 * linear);
  const palette = Object.fromEntries(
    Object.keys(dusk).map((key) => [
      key,
      mixColor(a.p[key as keyof Palette], b.p[key as keyof Palette], t),
    ]),
  ) as Palette;
  for (const key of ["text", "muted", "accent"] as const)
    palette[key] = readableColor(palette[key], palette.panel);
  const daylight = Math.max(0, Math.min(1, (h - 5) * 1.2, (19.5 - h) * 1.2));
  const period =
    h < 5 || h >= 20 ? "夜晚" : h < 8 ? "清晨" : h < 16.5 ? "白天" : "黄昏";
  const sunProgress = Math.max(0, Math.min(1, (h - 5) / 14.5));
  const moonProgress = ((h + 4.5) % 24) / 10.5;
  return {
    hour: h,
    palette,
    daylight,
    period,
    sunX: 180 + sunProgress * 300,
    sunY: 139 - Math.sin(sunProgress * Math.PI) * 106,
    moonX: 240 + Math.min(1, moonProgress) * 180,
    moonY: 110 - Math.sin(Math.min(1, moonProgress) * Math.PI) * 75,
  };
}
export type TimeOfDay = ReturnType<typeof timeOfDay>;
