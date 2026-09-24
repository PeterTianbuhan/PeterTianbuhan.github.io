"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { chapters } from "./chapters";
import { PosterCanvas } from "./poster-canvas";
import styles from "./life.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function LifeView({ locale }: { locale: Locale }) {
  const [index, setIndex] = useState(chapters.length - 1);
  const [ready, setReady] = useState<boolean | null>(null);

  const chapter = chapters[index];
  const poster = chapter.poster;

  const go = useCallback((to: number) => {
    setIndex((to + chapters.length) % chapters.length);
    setReady(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const t = (zh: string, en: string) => (locale === "zh" ? zh : en);
  const state = !poster ? "blank" : ready === null ? "pending" : ready ? "live" : "failed";

  return (
    <main className={styles.root} data-state={state}>
      {poster ? (
        <PosterCanvas key={chapter.id} poster={poster} onReady={setReady} />
      ) : (
        <div className={styles.blank} key={chapter.id}>
          <span className={styles.blankNumber}>{pad(index + 1)}</span>
          <p>{t("这一页还没画", "Not painted yet")}</p>
        </div>
      )}

      <div className={styles.overlay}>
        <header className={styles.top}>
          <Link href={`/${locale}/`} className={styles.back}>
            ← {t("首页", "Home")}
          </Link>
          <p className={styles.book}>{t("来处", "Where I come from")}</p>
        </header>

        <section className={styles.caption} key={chapter.id}>
          <p className={styles.chapterNo}>
            {t("第", "Chapter ")}
            {pad(index + 1)}
            {t("章", "")}
          </p>
          <h1 className={styles.title}>{chapter.title[locale]}</h1>
          <p className={styles.place}>
            {chapter.place[locale]}
            {chapter.span && <span>{chapter.span[locale]}</span>}
          </p>
        </section>

        <footer className={styles.bottom}>
          <nav className={styles.chapters} aria-label={t("章节", "Chapters")}>
            {chapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={styles.chip}
                data-active={i === index}
                data-drawn={Boolean(c.poster)}
                onClick={() => go(i)}
              >
                <span className={styles.chipNo}>{pad(i + 1)}</span>
                <span className={styles.chipPlace}>{c.place[locale].split(" · ")[0]}</span>
                <span className={styles.chipTitle}>{c.title[locale]}</span>
              </button>
            ))}
          </nav>
        </footer>
      </div>
    </main>
  );
}
