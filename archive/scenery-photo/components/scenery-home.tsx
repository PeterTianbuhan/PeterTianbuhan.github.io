"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { SceneryCanvas, type SceneryMode } from "./scenery-canvas";
import styles from "./scenery.module.css";

type Props = {
  locale: Locale;
  name: string;
  role: string;
  title: string;
  place: string;
  nav: { href: string; label: string }[];
};

const PHOTO = "/scenery/storm-ridge.webp";
const MAP = "/scenery/storm-ridge-map.png";

function useBeijingClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export function SceneryHome({ locale, name, role, title, place, nav }: Props) {
  const [mode, setMode] = useState<SceneryMode>("pending");
  const time = useBeijingClock();
  const other = locale === "zh" ? { href: "/en/", label: "EN" } : { href: "/zh/", label: "中" };

  return (
    <main className={styles.root} data-mode={mode}>
      <div className={styles.still} style={{ backgroundImage: `url(${PHOTO})` }} aria-hidden="true" />
      <SceneryCanvas photo={PHOTO} map={MAP} onMode={setMode} />

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
          <p className={styles.slate}>
            <span>{place}</span>
            <span className={styles.time}>{time ?? "--:--"}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
