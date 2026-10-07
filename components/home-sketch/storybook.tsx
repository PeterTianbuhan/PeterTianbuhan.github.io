"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n";
import { EraseLink } from "./eraser";
import type { Essay } from "./gallery";
import { WRITER_INK, WRITER_WASHES } from "./cloud-writer-paths";
import styles from "./storybook.module.css";

// One screen per section under the cover, each a full page of a picture book
// with the little me from the corner doing that section's thing. The essays
// page: lying on a cloud, writing. It arrives already painted; scrolling
// through it only lets the cloud drift and the loose pages fall a little.

const INK = "#2a2a2e";
const PAPER = "#f8f4ea";
const SOFT = "rgba(42,42,46,.66)";

// scroll progress through the screen, 0 as it enters and 1 as it leaves,
// written to --p so CSS can move things with it
function useProgress() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

// watercolour: a wash bleeds past its line a little and dries unevenly
function Filters() {
  return (
    <defs>
      <filter id="sb-wash" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46" />
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id="sb-fill" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
        <feGaussianBlur stdDeviation=".6" />
      </filter>
      <filter id="sb-wash-fine" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="10" />
      </filter>
      <filter id="sb-grain">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="1" />
        <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .16  0 0 0 0 .18  0 0 0 .06 0" />
      </filter>
    </defs>
  );
}

function Scene() {
  return (
    <svg className={styles.scene} viewBox="40 120 1180 1060" aria-hidden>
      {/* pages that slipped off the cloud */}
      <g className={styles.falling} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round">
        <path fill={PAPER} transform="rotate(-18 1110 1110)" d="M1070 1080 h80 v60 h-80z" />
        <path fill="none" stroke={SOFT} strokeWidth={2.4} transform="rotate(-18 1110 1110)" d="M1084 1100 h46 M1084 1116 h32" />
        <path fill={PAPER} transform="rotate(22 150 1130)" d="M116 1104 h68 v50 h-68z" />
      </g>

      <g className={styles.drift}>
        <g transform="translate(0 1254) scale(1 -1)">
          <g filter="url(#sb-wash-fine)">
            {WRITER_WASHES.map(([fill, d]) => (
              <path key={fill + d.length} fill={fill} d={d} />
            ))}
          </g>
          <ellipse cx="400" cy="654" rx="26" ry="14" fill="#f2b731" opacity={0.8} />
          <ellipse cx="668" cy="656" rx="22" ry="13" fill="#f2b731" opacity={0.8} />
          <path fill={INK} d={WRITER_INK} />
        </g>
      </g>
    </svg>
  );
}

export function EssaysScreen({ locale, essays, total }: { locale: Locale; essays: Essay[]; total: number }) {
  const zh = locale === "zh";
  const ref = useProgress();
  return (
    <section ref={ref} className={styles.screen} data-cover aria-labelledby="writing">
      <svg className={styles.sky} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <Filters />
        <rect width="1440" height="900" fill="#d6e7f3" />
        <g filter="url(#sb-wash)">
          <path fill="#8dbadc" opacity={0.7} d="M-80 -60 H1520 V250 C1200 210 900 300 600 250 C380 214 160 280 -80 240 Z" />
          <path fill="#b3d1e8" opacity={0.6} d="M-80 200 C200 260 520 200 820 250 C1080 290 1300 230 1520 260 V520 C1200 480 860 560 520 510 C260 470 80 530 -80 500 Z" />
          <path fill="#f4cdbf" opacity={0.55} d="M-80 600 C260 560 620 640 980 600 C1220 574 1380 610 1520 596 V760 H-80 Z" />
          <path fill="#fbf6ec" opacity={0.95} d="M-80 790 C120 740 260 800 420 760 C600 716 760 800 940 756 C1120 714 1300 790 1520 750 V980 H-80 Z" />
        </g>
        <g className={styles.sun}>
          <circle cx="1230" cy="150" r="66" fill="#f4c95a" filter="url(#sb-fill)" />
          <circle cx="1230" cy="150" r="66" fill="none" stroke={INK} strokeWidth={1.4} />
        </g>
        <g fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round">
          <path className={styles.small} fill="#fffaf0" d="M160 140 c10-16 34-16 44 0 c10-12 30-8 34 6 c14 0 18 18 4 20 h-92 c-14-2-12-24 10-26 z" />
          <path className={styles.small} fill="#fffaf0" d="M760 96 c8-12 26-12 34 0 c8-9 23-6 26 5 c11 0 14 14 3 15 h-70 c-11-1-9-18 7-20 z" />
          {/* a paper plane, folded from one of the pages */}
          <g className={styles.small} transform="rotate(-10 380 120)">
            <path fill="#fffaf0" d="M340 130 L420 104 L376 140 Z" />
            <path fill="#e8e1d3" d="M376 140 L420 104 L372 128 Z" />
            <path stroke={SOFT} strokeWidth={1} strokeDasharray="3 6" d="M330 134 C300 140 280 128 250 136" />
          </g>
        </g>
        <rect width="1440" height="900" filter="url(#sb-grain)" />
      </svg>

      <div className={styles.copy}>
        <h2 id="writing" className={styles.title}>
          {zh ? "长文" : "Essays"}
          <span aria-hidden>Essays</span>
        </h2>
        <p className={styles.line}>
          {zh ? "想得比较久的一些事，一篇写一件。" : "Things I've thought about for a while, one per essay."}
        </p>
        <ol className={styles.picks}>
          {essays.map((essay) => (
            <li key={essay.href}>
              <EraseLink href={essay.href}>
                <span className={styles.pick}>{essay.title}</span>
                <span className={styles.date}>{essay.date}</span>
              </EraseLink>
            </li>
          ))}
        </ol>
        <EraseLink href={`/${locale}/writing/`} className={styles.all}>
          {zh ? `全部 ${total} 篇长文` : `All ${total} essays`} →
        </EraseLink>
      </div>

      <Scene />
    </section>
  );
}
