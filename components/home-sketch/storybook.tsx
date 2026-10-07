"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n";
import { EraseLink } from "./eraser";
import type { Essay } from "./gallery";
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
      <filter id="sb-grain">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="1" />
        <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .16  0 0 0 0 .18  0 0 0 .06 0" />
      </filter>
    </defs>
  );
}

// the same head as the one in the corner, looking down at the page
function Head() {
  return (
    <g>
      <path fill={PAPER} d="M23.5 40 C22.5 53 30 64.5 40.5 64.5 C51 64.5 58.5 53 57.2 40" />
      <path d="M23 44 C19.5 44 19.5 51 23.8 51.5 M57.2 44 C60.8 44 60.8 51 56.6 51.5" />
      <g fill="#f2b731" stroke="none" opacity={0.8}>
        <ellipse cx="28" cy="53" rx="3.4" ry="2" />
        <ellipse cx="53" cy="53" rx="3.4" ry="2" />
      </g>
      <path strokeWidth={1.15} d="M28.5 37.8 Q32.5 36.2 36.5 37.6 M44.5 37.6 Q48.5 36.2 52.5 37.8" />
      <path strokeWidth={1.15} d="M40.8 49 Q39.6 52.6 41.8 53" />
      <circle fill={INK} stroke="none" cx="32.8" cy="47.2" r="2.7" />
      <circle fill={INK} stroke="none" cx="48.8" cy="47.2" r="2.7" />
      <path strokeWidth={1.15} d="M28.6 45.6 Q32.8 43 37 45.6 M44.6 45.6 Q48.8 43 53 45.6" />
      <path d="M38.2 57.4 Q40.8 58.8 43.4 57.2" />
      <circle cx="32.5" cy="44.5" r="7" />
      <circle cx="48.5" cy="44.5" r="7" />
      <path d="M39.5 44 Q40.5 42.6 41.5 44 M25.5 43.5 L22.8 43 M55.5 43.5 L57.8 43" />
      <path
        fill={INK}
        strokeWidth={1}
        d="M22.5 45 C18 38 16.5 29 20 22.5 C19.5 19.5 21 17 23.5 16 C24.5 17.5 25.5 18 27 17.5 C28 13 31 10.5 34.5 10.2 C34.2 11.6 35 12.6 36.5 12.6 C39 9.6 43 8.6 47 9.4 C46.4 10.8 46.8 11.8 48 12.2 C51.5 11.2 55.5 12.4 57.6 14.6 C56.8 15.4 56.6 16.4 57.2 17.2 C59.8 18.4 61.6 20.6 62 23 C61.2 23.2 60.6 23.8 60.6 25 C62.5 30 61.5 38 58 45 C57.5 40 56.5 36 55 34 C54 36.5 52.5 37 51 35.5 C50 33 48.5 31 47 30.5 C46.5 33.5 44.5 35.5 42 35.5 C42.5 33 41.5 31 39.5 30 C38 32.5 35.5 34.5 33 34.5 C34 32 33.5 30.5 32 29.5 C30.5 32.5 28 35 25.5 35.5 C26 33 25.5 31.5 24.5 31 C23.5 36 23 41 22.5 45 Z"
      />
      <path stroke={PAPER} strokeWidth={1} opacity={0.7} d="M29 17 C33 14 38 13.5 41 15 M46 15.5 C50 15 53 16.5 55 19 M24 26 C25 23 27 21 29 20" />
    </g>
  );
}

const CLOUD =
  "M70 300 C40 300 34 262 66 254 C60 222 100 206 124 224 C134 186 190 178 212 206 C232 170 300 168 320 204 C344 176 404 184 410 222 C446 210 482 236 470 266 C508 270 506 312 470 314 C440 336 380 330 360 318 C330 340 262 338 240 322 C210 340 150 336 132 318 C110 330 72 324 70 300 Z";

function Scene() {
  return (
    <svg className={styles.scene} viewBox="0 0 540 380" aria-hidden fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {/* pages that slipped off the cloud */}
      <g className={styles.falling}>
        <path fill={PAPER} transform="rotate(-18 470 340)" d="M452 326 h34 v26 h-34z" />
        <path stroke={SOFT} strokeWidth={1} transform="rotate(-18 470 340)" d="M458 334 h20 M458 341 h14" />
        <path fill={PAPER} transform="rotate(22 60 360)" d="M44 348 h30 v22 h-30z" />
      </g>

      <g className={styles.drift}>
        {/* the cloud: a wash first, then the line */}
        <path filter="url(#sb-fill)" fill="#bcd3e8" stroke="none" transform="translate(6 12)" d={CLOUD} opacity={0.75} />
        <path fill="#fffaf0" d={CLOUD} />
        <path stroke={SOFT} strokeWidth={1.1} d="M150 300 C190 310 230 308 262 300 M300 306 C340 312 380 308 410 300" />

        <g transform="translate(270 222) scale(1.3) translate(-270 -222)">
        {/* a page already written, lying on the cloud */}
        <path fill={PAPER} d="M346 214 L436 208 L444 238 L352 244 Z" />
        <path
          strokeWidth={1.2}
          d="M360 226 C364 221 367 228 371 223 C375 219 378 226 382 221 C386 217 389 224 393 220 C397 216 400 222 404 218"
        />
        <path stroke={SOFT} strokeWidth={1} d="M362 236 h50" />

        {/* shoulders behind the folded arms */}
        <path filter="url(#sb-fill)" fill="#f1b98a" stroke="none" d="M216 226 C220 206 244 198 268 198 C292 198 318 206 322 226 Z" />
        <path d="M216 226 C220 206 244 198 268 198 C292 198 318 206 322 226" />

        {/* the head, the same one as in the corner */}
        <g transform="translate(198 98) scale(1.75)">
          <Head />
        </g>

        {/* arms folded on the cloud, chin resting on them */}
        <path filter="url(#sb-fill)" fill="#f1b98a" stroke="none" d="M228 208 C250 203 290 203 312 208 C318 214 318 226 312 232 C290 236 250 236 228 232 C222 226 222 214 228 208 Z" />
        <path d="M228 208 C250 203 290 203 312 208 C318 214 318 226 312 232 C290 236 250 236 228 232 C222 226 222 214 228 208 Z" />
        <path stroke={SOFT} strokeWidth={1.1} d="M268 210 C266 218 266 226 270 232" />
        <path fill={PAPER} d="M216 226 C212 219 217 212 225 212 C233 213 236 221 233 227 C229 233 219 233 216 226 Z" />

        {/* the right hand holds the pen up, tapping while it thinks */}
        <g className={styles.pen}>
          <path fill={INK} strokeWidth={1} d="M318 220 L340 192 L343.5 194.6 L322 222.4 Z" />
          <path d="M318 220 L316.4 224.4 L322 222.4" />
        </g>
        <path fill={PAPER} d="M310 226 C306 219 311 212 319 212 C327 213 330 221 327 227 C323 233 313 233 310 226 Z" />
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
          <path d="M1160 420 q9-7 18 0 q9-7 18 0 M1215 448 q6-5 12 0 q6-5 12 0" />
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
