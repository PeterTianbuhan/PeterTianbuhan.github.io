"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { SceneryCanvas } from "./scenery-canvas";
import {
  TIME_ORDER,
  WEATHER_ORDER,
  fetchBeijingWeather,
  momentFor,
  presetWeather,
  skyTargets,
  timeLabel,
  weatherLabel,
  type SkyTargets,
  type TimePreset,
  type Weather,
  type WeatherKind,
} from "./sky";
import styles from "./scenery.module.css";

type Props = {
  locale: Locale;
  name: string;
  role: string;
  title: string;
  nav: { href: string; label: string }[];
};

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

const next = <T,>(list: T[], value: T) => list[(list.indexOf(value) + 1) % list.length];

export function SceneryHome({ locale, name, role, title, nav }: Props) {
  const [live, setLive] = useState<boolean | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [beijing, setBeijing] = useState<Weather | null>(null);
  const [weatherPick, setWeatherPick] = useState<WeatherKind | null>(null);
  const [timePick, setTimePick] = useState<TimePreset>("live");
  const targets = useRef<SkyTargets | null>(null);

  useEffect(() => {
    // ?time=sunset&weather=rain opens straight into a preview
    const params = new URLSearchParams(window.location.search);
    const time = params.get("time") as TimePreset | null;
    const kind = params.get("weather") as WeatherKind | null;
    const tick = () => setNow(new Date());
    const start = () => {
      if (time && TIME_ORDER.includes(time)) setTimePick(time);
      if (kind && WEATHER_ORDER.includes(kind)) setWeatherPick(kind);
      tick();
    };
    start();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      fetchBeijingWeather(controller.signal)
        .then(setBeijing)
        .catch((err) => {
          if (!controller.signal.aborted) console.warn("[scenery] weather unavailable", err);
        });
    load();
    const id = window.setInterval(load, 15 * 60_000);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  const weather = weatherPick ? presetWeather(weatherPick, beijing) : (beijing ?? presetWeather("partly"));
  const moment = now ? momentFor(timePick, now) : null;

  useEffect(() => {
    if (moment) targets.current = skyTargets(moment, weather);
  });

  const other = locale === "zh" ? { href: "/en/", label: "EN" } : { href: "/zh/", label: "中" };
  const place = locale === "zh" ? "北京" : "Beijing";
  const preview = locale === "zh" ? "预览" : "preview";
  const timeText =
    timePick === "live" ? (now ? clockFormat.format(now) : "--:--") : timeLabel(timePick, locale);
  const weatherText =
    weatherLabel(weather.kind, locale) + (weather.temp !== null && !weatherPick ? ` ${weather.temp}°` : "");

  return (
    <main className={styles.root} data-live={live === null ? "pending" : String(live)}>
      <SceneryCanvas targets={targets} onLive={setLive} />

      <div className={styles.overlay}>
        <header className={styles.top}>
          <Link href={`/${locale}/`} className={styles.mark}>
            {name}
          </Link>
          <nav className={styles.nav}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href={other.href} className={styles.lang}>
              {other.label}
            </Link>
          </nav>
        </header>

        <footer className={styles.bottom}>
          <div className={styles.caption}>
            <p className={styles.role}>{role}</p>
            <h1 className={styles.title}>{title}</h1>
          </div>
          <div className={styles.slate}>
            <button
              type="button"
              onClick={() => setTimePick(next(TIME_ORDER, timePick))}
              title={locale === "zh" ? "换个时间看看" : "Try another time of day"}
            >
              <span>{place}</span>
              <span className={styles.time}>{timeText}</span>
              {timePick !== "live" && <span className={styles.tag}>{preview}</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                const pick = next([null, ...WEATHER_ORDER], weatherPick);
                setWeatherPick(pick === beijing?.kind ? next([null, ...WEATHER_ORDER], pick) : pick);
              }}
              title={locale === "zh" ? "换个天气看看" : "Try other weather"}
            >
              <span>{weatherText}</span>
              {weatherPick && <span className={styles.tag}>{preview}</span>}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
