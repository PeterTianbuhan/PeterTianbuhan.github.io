"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { signature } from "@/app/fonts/signature";
import { SketchCanvas } from "@/components/life/sketch/sketch-canvas";
import { DONE_AT } from "@/components/life/sketch/pku-scene";
import { EraseLink } from "./eraser";
import type { Locale } from "@/lib/i18n";
import styles from "./sketch-home.module.css";

type Props = {
  locale: Locale;
  name: string;
  role: string;
  nav: { href: string; label: string }[];
};

const SEEN = "home-sketch-seen";
// the signature goes on while the seal is being stamped
const SIGN_AT = DONE_AT - 1.4;

export function SketchHome({ locale, name, role, nav }: Props) {
  const [finished, setFinished] = useState(false);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    // a second visit in the same session starts on the finished drawing
    const skip = () => setFinished(true);
    if (sessionStorage.getItem(SEEN) === "1") skip();
    window.addEventListener("keydown", skip, { once: true });
    return () => window.removeEventListener("keydown", skip);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      sessionStorage.setItem(SEEN, "1");
      setDone(true);
    }, (SIGN_AT + 2.4) * 1000);
    return () => window.clearTimeout(id);
  }, [run]);

  const other = locale === "zh" ? { href: "/en/", label: "EN" } : { href: "/zh/", label: "中" };
  const timing = { "--sign": `${SIGN_AT}s`, "--after": `${SIGN_AT + 2.2}s` } as CSSProperties;

  return (
    <main
      className={`${styles.root} ${signature.variable}`}
      data-finished={finished}
      style={timing}
      onClick={() => setFinished(true)}
    >
      <SketchCanvas run={run} finished={finished} />

      <div className={styles.overlay}>
        <section className={styles.signed}>
          <h1 className={styles.signature} aria-label={name}>
            <span>{name}</span>
          </h1>
          <p className={styles.role}>{role}</p>
        </section>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <EraseLink href={other.href} className={styles.lang}>
            {other.label}
          </EraseLink>
        </nav>

        <a href="#writing" className={styles.more} onClick={(e) => e.stopPropagation()}>
          {locale === "zh" ? "往下翻" : "Turn the page"}
          <svg viewBox="0 0 12 22" aria-hidden>
            <path d="M6,1 Q5.4,10 6,20 M1.5,15 Q4.5,17.5 6,20.5 Q7.8,17.4 10.5,14.6" />
          </svg>
        </a>

        <div className={styles.corner}>
          {finished || done ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFinished(false);
                setDone(false);
                setRun((n) => n + 1);
              }}
            >
              {locale === "zh" ? "↻ 再画一遍" : "↻ Draw it again"}
            </button>
          ) : (
            <span>{locale === "zh" ? "点击任意处跳过" : "Click anywhere to skip"}</span>
          )}
        </div>
      </div>
    </main>
  );
}
