// What the sky over Beijing looks like at a given moment: where the sun is,
// the palette that follows from its elevation, the season's foliage, and the
// weather. Everything here produces shader targets; the canvas eases toward
// them so a change of weather or time rolls in rather than cuts.

import type { Locale } from "@/lib/i18n";

// Haidian. Scenes pick which way the camera faces (degrees from north).
const LAT = 39.99;
const LON = 116.31;

const RAD = Math.PI / 180;

type Vec3 = [number, number, number];

export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "storm" | "snow";

export type Weather = {
  kind: WeatherKind;
  cloud: number;
  rain: number;
  snow: number;
  fog: number;
  storm: number;
  wind: number;
  temp: number | null;
};

export type TimePreset = "live" | "dawn" | "day" | "sunset" | "night";

export const WEATHER_ORDER: WeatherKind[] = ["clear", "partly", "cloudy", "fog", "drizzle", "rain", "storm", "snow"];
export const TIME_ORDER: TimePreset[] = ["live", "dawn", "day", "sunset", "night"];

const WEATHER_LABEL: Record<WeatherKind, Record<Locale, string>> = {
  clear: { zh: "晴", en: "Clear" },
  partly: { zh: "多云", en: "Partly cloudy" },
  cloudy: { zh: "阴", en: "Overcast" },
  fog: { zh: "雾", en: "Fog" },
  drizzle: { zh: "小雨", en: "Drizzle" },
  rain: { zh: "雨", en: "Rain" },
  storm: { zh: "雷雨", en: "Thunderstorm" },
  snow: { zh: "雪", en: "Snow" },
};

const TIME_LABEL: Record<Exclude<TimePreset, "live">, Record<Locale, string>> = {
  dawn: { zh: "清晨", en: "Dawn" },
  day: { zh: "午后", en: "Afternoon" },
  sunset: { zh: "日落", en: "Sunset" },
  night: { zh: "深夜", en: "Night" },
};

export const weatherLabel = (kind: WeatherKind, locale: Locale) => WEATHER_LABEL[kind][locale];
export const timeLabel = (preset: Exclude<TimePreset, "live">, locale: Locale) => TIME_LABEL[preset][locale];

const PRESETS: Record<WeatherKind, Omit<Weather, "kind" | "temp" | "wind">> = {
  clear: { cloud: 0.1, rain: 0, snow: 0, fog: 0, storm: 0 },
  partly: { cloud: 0.48, rain: 0, snow: 0, fog: 0, storm: 0 },
  cloudy: { cloud: 0.9, rain: 0, snow: 0, fog: 0.15, storm: 0 },
  fog: { cloud: 0.7, rain: 0, snow: 0, fog: 1, storm: 0 },
  drizzle: { cloud: 0.88, rain: 0.35, snow: 0, fog: 0.3, storm: 0 },
  rain: { cloud: 0.95, rain: 0.75, snow: 0, fog: 0.4, storm: 0 },
  storm: { cloud: 1, rain: 1, snow: 0, fog: 0.35, storm: 1 },
  snow: { cloud: 0.9, rain: 0, snow: 0.85, fog: 0.35, storm: 0 },
};

export function presetWeather(kind: WeatherKind, base?: Weather | null): Weather {
  return { kind, ...PRESETS[kind], wind: base?.wind ?? 0.3, temp: base?.temp ?? null };
}

// WMO weather interpretation codes, as returned by Open-Meteo.
function kindFromCode(code: number, cover: number): WeatherKind {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "cloudy";
  if (code === 1 || code === 2) return "partly";
  return cover > 35 ? "partly" : "clear";
}

export async function fetchBeijingWeather(signal?: AbortSignal): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    "&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m&timezone=Asia%2FShanghai";
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const { current } = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number; cloud_cover: number; wind_speed_10m: number };
  };
  const kind = kindFromCode(current.weather_code, current.cloud_cover);
  const weather = presetWeather(kind);
  if (kind === "clear" || kind === "partly" || kind === "cloudy") {
    weather.cloud = Math.min(1, Math.max(0.06, current.cloud_cover / 100));
  }
  weather.wind = Math.min(1, current.wind_speed_10m / 30);
  weather.temp = Math.round(current.temperature_2m);
  return weather;
}

// ---- sun -----------------------------------------------------------------

function dayOfYear(date: Date) {
  return (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5;
}

// NOAA's low-precision solar position; good to a fraction of a degree.
export function sunPosition(date: Date) {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const g = ((2 * Math.PI) / 365) * (dayOfYear(date) - 1 + (hours - 12) / 24);
  const eqTime =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const solarMinutes = hours * 60 + eqTime + 4 * LON;
  const ha = (solarMinutes / 4 - 180) * RAD;
  const lat = LAT * RAD;

  const east = -Math.cos(decl) * Math.sin(ha);
  const north = Math.cos(lat) * Math.sin(decl) - Math.sin(lat) * Math.cos(decl) * Math.cos(ha);
  const up = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);

  const azimuth = (Math.atan2(east, north) / RAD + 360) % 360;
  return { azimuth, elevation: Math.asin(up) / RAD };
}

// Beijing wall-clock parts for any instant (China has no DST, so +8 is exact).
export function beijingParts(date: Date) {
  const shifted = new Date(date.getTime() + 8 * 3600e3);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
    hour: shifted.getUTCHours() + shifted.getUTCMinutes() / 60,
  };
}

function beijingAt(date: Date, hour: number) {
  const { y, m, d } = beijingParts(date);
  return new Date(Date.UTC(y, m, d) + (hour - 8) * 3600e3);
}

function sunTimes(date: Date) {
  let rise = 6;
  let set = 18;
  let prev = sunPosition(beijingAt(date, 0)).elevation;
  for (let h = 0.05; h <= 24; h += 0.05) {
    const e = sunPosition(beijingAt(date, h)).elevation;
    if (prev < 0 && e >= 0) rise = h;
    if (prev >= 0 && e < 0) set = h;
    prev = e;
  }
  return { rise, set };
}

export function momentFor(preset: TimePreset, now: Date) {
  if (preset === "live") return now;
  const { rise, set } = sunTimes(now);
  const hour = { dawn: rise + 0.35, day: 14.5, sunset: set - 0.3, night: 22.5 }[preset];
  return beijingAt(now, hour);
}

// ---- palette -------------------------------------------------------------

type Palette = { top: Vec3; horizon: Vec3; haze: Vec3; sun: Vec3; light: number };

// keyed on solar elevation in degrees
const PALETTE: [number, Palette][] = [
  [-18, { top: [0.012, 0.02, 0.05], horizon: [0.04, 0.055, 0.1], haze: [0.045, 0.06, 0.1], sun: [0.5, 0.6, 0.85], light: 0.14 }],
  [-9, { top: [0.05, 0.08, 0.19], horizon: [0.2, 0.2, 0.34], haze: [0.16, 0.17, 0.27], sun: [0.65, 0.5, 0.7], light: 0.3 }],
  [-3, { top: [0.13, 0.19, 0.4], horizon: [0.86, 0.5, 0.4], haze: [0.5, 0.4, 0.46], sun: [1, 0.52, 0.34], light: 0.48 }],
  [2, { top: [0.24, 0.35, 0.6], horizon: [1, 0.66, 0.44], haze: [0.8, 0.62, 0.56], sun: [1, 0.64, 0.4], light: 0.72 }],
  [9, { top: [0.23, 0.42, 0.72], horizon: [0.92, 0.8, 0.66], haze: [0.76, 0.74, 0.74], sun: [1, 0.84, 0.64], light: 0.9 }],
  [25, { top: [0.16, 0.38, 0.75], horizon: [0.68, 0.8, 0.92], haze: [0.62, 0.72, 0.84], sun: [1, 0.96, 0.9], light: 1 }],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const luma = (c: Vec3) => c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;

function paletteAt(elevation: number): Palette {
  if (elevation <= PALETTE[0][0]) return PALETTE[0][1];
  for (let i = 1; i < PALETTE.length; i++) {
    const [e1, p1] = PALETTE[i];
    const [e0, p0] = PALETTE[i - 1];
    if (elevation <= e1) {
      const t = smooth(0, 1, (elevation - e0) / (e1 - e0));
      return {
        top: mix3(p0.top, p1.top, t),
        horizon: mix3(p0.horizon, p1.horizon, t),
        haze: mix3(p0.haze, p1.haze, t),
        sun: mix3(p0.sun, p1.sun, t),
        light: lerp(p0.light, p1.light, t),
      };
    }
  }
  return PALETTE[PALETTE.length - 1][1];
}

// Western Hills foliage through the year: [day of year, main, variation]
const FOLIAGE: [number, Vec3, Vec3][] = [
  [15, [0.16, 0.14, 0.11], [0.2, 0.17, 0.13]],
  [100, [0.14, 0.22, 0.09], [0.22, 0.26, 0.12]],
  [170, [0.07, 0.18, 0.07], [0.1, 0.21, 0.08]],
  [262, [0.08, 0.18, 0.07], [0.13, 0.2, 0.08]],
  [298, [0.3, 0.12, 0.05], [0.36, 0.24, 0.07]],
  [330, [0.19, 0.13, 0.09], [0.24, 0.18, 0.1]],
  [380, [0.16, 0.14, 0.11], [0.2, 0.17, 0.13]],
];

function foliageAt(date: Date): [Vec3, Vec3] {
  let doy = dayOfYear(date);
  if (doy < FOLIAGE[0][0]) doy += 365;
  for (let i = 1; i < FOLIAGE.length; i++) {
    if (doy <= FOLIAGE[i][0]) {
      const [d0, a0, b0] = FOLIAGE[i - 1];
      const [d1, a1, b1] = FOLIAGE[i];
      const t = smooth(0, 1, (doy - d0) / (d1 - d0));
      return [mix3(a0, a1, t), mix3(b0, b1, t)];
    }
  }
  return [FOLIAGE[0][1], FOLIAGE[0][2]];
}

// Weiming Lake freezes from late December to late February.
function iceAt(date: Date) {
  const doy = dayOfYear(date);
  return Math.max(smooth(345, 362, doy), 1 - smooth(45, 62, doy));
}

export type SkyTargets = Record<string, number | number[]>;

export function skyTargets(moment: Date, weather: Weather, facing = 270): SkyTargets {
  const { azimuth, elevation } = sunPosition(moment);
  const base = paletteAt(elevation);

  // overcast drains color toward a cool grey of the same brightness
  const grey = clamp01(weather.cloud * 0.7 + weather.rain * 0.25 + weather.fog * 0.3 + weather.snow * 0.2);
  const desat = (c: Vec3): Vec3 => mix3(c, [luma(c) * 0.94, luma(c) * 0.98, luma(c) * 1.04], grey);
  const dim = 1 - 0.28 * weather.cloud - 0.18 * weather.rain;
  const fogLift = (c: Vec3): Vec3 => mix3(c, mix3(c, base.horizon, 0.6), weather.fog * 0.5);

  const [foliage, foliageAlt] = foliageAt(moment);
  const { hour } = beijingParts(moment);
  const night = smooth(-4, -13, elevation);
  // the moon swings across the southern-western sky over the night
  const nightHour = ((hour + 12) % 24) - 12; // -12..12, 0 at midnight
  const moonX = Math.max(-1.3, Math.min(1.3, (nightHour - 0.5) / 6)) * 0.62;

  return {
    u_skyTop: desat(base.top).map((v) => v * dim),
    u_skyHorizon: fogLift(desat(base.horizon)).map((v) => v * dim),
    u_haze: fogLift(desat(base.haze)).map((v) => v * (0.9 + 0.1 * dim)),
    u_sunCol: base.sun,
    u_sun: [((((azimuth - facing + 540) % 360) - 180) * RAD), elevation * RAD],
    u_sunVis: 1 - clamp01(weather.cloud * 0.9 + weather.fog * 0.6) * 0.85,
    u_light: base.light * dim,
    u_night: night,
    u_moon: [moonX, 0.84 - 0.22 * moonX * moonX],
    u_foliage: foliage,
    u_foliageAlt: foliageAlt,
    u_cloud: weather.cloud,
    u_rain: weather.rain,
    u_snow: weather.snow,
    u_fog: weather.fog,
    u_wind: weather.wind,
    u_storm: weather.storm,
    u_ice: iceAt(moment),
  };
}
