"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./reading.module.css";

export function SectionRail({ headings, locale }: {
  headings: { id: string; title: string }[];
  locale: Locale;
}) {
  const [active, setActive] = useState(headings[0]?.id);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Track the section at the top of the reading area, including long
      // sections whose heading has already left the viewport.
      const readingLine = Math.min(160, window.innerHeight * 0.22);
      let current = headings[0]?.id;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= readingLine) {
          current = heading.id;
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  return (
    <nav className={styles.rail} aria-label={locale === "zh" ? "文章目录" : "On this page"}
      data-dismissed={dismissed || undefined}
      onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}>
      {headings.map((heading, index) => (
        <a key={heading.id} className={styles.railLink} href={`#${heading.id}`}
          aria-label={heading.title} aria-current={active === heading.id ? "location" : undefined}
          onMouseEnter={() => setDismissed(false)} onFocus={() => setDismissed(false)}
          onClick={() => setDismissed(true)}>
          <span className={styles.railMark} aria-hidden="true" />
          <span className={styles.railLabel} aria-hidden="true">
            <span className={styles.railNumber}>{String(index + 1).padStart(2, "0")}</span>
            {heading.title}
          </span>
        </a>
      ))}
    </nav>
  );
}
