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
const dusk: Palette = {
  bg: "#263e58",
  panel: "#314d62",
  edge: "#57758c",
  text: "#fff0d4",
  muted: "#c1d0ce",
  accent: "#f4d392",
  chrome: "#38576b",
  prompt: "#2c475f",
  code: "#263f58",
  skyTop: "#5f75b2",
  skyMiddle: "#d197b6",
  skyBottom: "#ffd39c",
  cloud: "#e9b4c5",
  cloudShade: "#bb95b5",
  cloudLight: "#ffddce",
  distant: "#8796ac",
  farShade: "#4f7881",
  farMid: "#6a9a98",
  farLight: "#a9b99d",
  treeShade: "#285e50",
  treeMid: "#4c885d",
  treeLight: "#a6b974",
  towerShade: "#333f4b",
  towerMid: "#68616a",
  towerLight: "#ab9690",
  templeWall: "#a96964",
  templeShade: "#6f4c50",
  nearShade: "#224d49",
  nearMid: "#3e7854",
  nearLight: "#86a864",
  stone: "#79807a",
  stoneLight: "#c3b297",
  waterTop: "#91b6b8",
  waterMiddle: "#5a99b3",
  waterBottom: "#3a6c9a",
};
const night: Palette = {
  bg: "#12263d",
  panel: "#173149",
  edge: "#3c6079",
  text: "#e1eff2",
  muted: "#a5c6db",
  accent: "#c5e4d6",
  chrome: "#1d3a53",
  prompt: "#142c44",
  code: "#10273e",
  skyTop: "#142454",
  skyMiddle: "#2a4b7c",
  skyBottom: "#72829c",
  cloud: "#526697",
  cloudShade: "#3d5381",
  cloudLight: "#7183ad",
  distant: "#466780",
  farShade: "#2c5162",
  farMid: "#3a6b78",
  farLight: "#669090",
  treeShade: "#1c4548",
  treeMid: "#2b6656",
  treeLight: "#5b8d71",
  towerShade: "#1b2b3b",
  towerMid: "#3f4b5d",
  towerLight: "#99aab9",
  templeWall: "#9c697e",
  templeShade: "#433543",
  nearShade: "#173c41",
  nearMid: "#2b5c4e",
  nearLight: "#548369",
  stone: "#4c5d64",
  stoneLight: "#8d999f",
  waterTop: "#527e99",
  waterMiddle: "#2f638e",
  waterBottom: "#1e4674",
};
const dawn: Palette = {
  bg: "#edddd5",
  panel: "#f5e8d7",
  edge: "#c9acb0",
  text: "#514254",
  muted: "#785d6a",
  accent: "#915b42",
  chrome: "#eddbce",
  prompt: "#efdfcf",
  code: "#e4d1c6",
  skyTop: "#9e91c3",
  skyMiddle: "#f1bbc5",
  skyBottom: "#ffe1ab",
  cloud: "#f7d8dc",
  cloudShade: "#d4b2cf",
  cloudLight: "#ffe9d7",
  distant: "#91838e",
  farShade: "#707784",
  farMid: "#818892",
  farLight: "#a8a19f",
  treeShade: "#476d59",
  treeMid: "#72a273",
  treeLight: "#c0ca89",
  towerShade: "#5b5966",
  towerMid: "#90838b",
  towerLight: "#c6a997",
  templeWall: "#bb827a",
  templeShade: "#885b62",
  nearShade: "#365847",
  nearMid: "#5b8b5e",
  nearLight: "#a7b577",
  stone: "#a6a399",
  stoneLight: "#e4c9a7",
  waterTop: "#dcc4c6",
  waterMiddle: "#a6accd",
  waterBottom: "#728eb9",
};
const day: Palette = {
  bg: "#dcf0dd",
  panel: "#eff8e6",
  edge: "#aacdb8",
  text: "#214b3b",
  muted: "#4f7563",
  accent: "#247343",
  chrome: "#deefdc",
  prompt: "#e5f2dd",
  code: "#d5e9ce",
  skyTop: "#4caee5",
  skyMiddle: "#92d3eb",
  skyBottom: "#ddedcc",
  cloud: "#edf7e9",
  cloudShade: "#bfdfdf",
  cloudLight: "#fff9e5",
  distant: "#86bbae",
  farShade: "#4e9a7d",
  farMid: "#74b393",
  farLight: "#aed198",
  treeShade: "#286b4b",
  treeMid: "#55a15c",
  treeLight: "#afcd65",
  towerShade: "#53605d",
  towerMid: "#969586",
  towerLight: "#d1c6a2",
  templeWall: "#bf6b58",
  templeShade: "#844f45",
  nearShade: "#215c43",
  nearMid: "#438c4c",
  nearLight: "#a5c45e",
  stone: "#adb991",
  stoneLight: "#f4e6b6",
  waterTop: "#8dcebb",
  waterMiddle: "#56b6b0",
  waterBottom: "#318ca6",
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
