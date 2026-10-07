"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signature } from "@/app/fonts/signature";
import styles from "./doodle.module.css";

// A small pen drawing of me in the corner of every page. The head stays put;
// each pose only swaps the eyes, the mouth, the hands and what they hold.
// It writes while a page draws itself, reads as you scroll, looks up at the
// end, waves when you point at it, rubs out the page with the eraser, and
// nods off after a minute of nothing.

type Pose = "idle" | "read" | "look" | "wave" | "write" | "erase" | "doze";

const INK = "#2a2a2e";
const PAPER = "#f8f4ea";
const SOFT = "rgba(42,42,46,.66)";
// poses that follow scrolling stay at least this long, so they don't flicker
const DWELL = 2000;

export function Doodle({ erasing }: { erasing: boolean }) {
  const pathname = usePathname();
  const zh = pathname.startsWith("/zh");
  const [pose, setPose] = useState<Pose>("write");
  const [swap, setSwap] = useState(0);
  const [onCover, setOnCover] = useState(true);
  const state = useRef({ drawing: true, hover: false, erasing: false, dozing: false, end: false, body: false });
  const shown = useRef<{ pose: Pose; at: number }>({ pose: "write", at: 0 });
  const later = useRef<ReturnType<typeof setTimeout>>(undefined);
  const update = useRef<(now?: boolean) => void>(() => {});

  useEffect(() => {
    const s = state.current;
    const want = (): Pose =>
      s.erasing ? "erase" : s.hover ? "wave" : s.dozing ? "doze" : s.drawing ? "write" : s.end ? "look" : s.body ? "read" : "idle";
    const show = (p: Pose) => {
      if (p === shown.current.pose) return;
      shown.current = { pose: p, at: performance.now() };
      setPose(p);
      setSwap((n) => n + 1);
    };
    // what follows your own hand (waving, erasing, waking up) changes at once
    update.current = (now) => {
      clearTimeout(later.current);
      const p = want();
      const was = shown.current.pose;
      const urgent = now || p === "wave" || p === "erase" || was === "wave" || was === "doze";
      const wait = DWELL - (performance.now() - shown.current.at);
      if (urgent || wait <= 0) show(p);
      else later.current = setTimeout(() => update.current(), wait);
    };
    shown.current.at = performance.now();

    let idle: ReturnType<typeof setTimeout>;
    const poke = () => {
      if (s.dozing) {
        s.dozing = false;
        update.current(true);
      }
      clearTimeout(idle);
      idle = setTimeout(() => {
        s.dozing = true;
        update.current(true);
      }, 60000);
    };
    const onScroll = () => {
      const doc = document.documentElement;
      s.body = scrollY > 40;
      s.end = s.body && scrollY + innerHeight >= doc.scrollHeight - 120;
      update.current();
    };
    const events = ["scroll", "pointermove", "keydown", "touchstart"] as const;
    events.forEach((e) => addEventListener(e, poke, { passive: true }));
    addEventListener("scroll", onScroll, { passive: true });
    poke();
    return () => {
      events.forEach((e) => removeEventListener(e, poke));
      removeEventListener("scroll", onScroll);
      clearTimeout(idle);
      clearTimeout(later.current);
    };
  }, []);

  // every new page draws itself in; write along while it does
  useEffect(() => {
    const s = state.current;
    s.drawing = true;
    s.body = s.end = false;
    update.current(true);
    const t = setTimeout(() => {
      s.drawing = false;
      update.current();
    }, 2600);
    return () => clearTimeout(t);
  }, [pathname]);

  // the home page's cover is a drawing of its own; stay out of it until you
  // scroll past
  useEffect(() => {
    const cover = document.querySelector("[data-cover]");
    const io = new IntersectionObserver(([e]) => setOnCover(cover !== null && e.isIntersecting));
    io.observe(cover ?? document.body);
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    state.current.erasing = erasing;
    update.current(true);
  }, [erasing]);

  function hover(e: { type: string }) {
    state.current.hover = e.type === "pointerenter" || e.type === "focus";
    update.current();
  }

  return (
    <div className={`${styles.corner} ${signature.variable}`} data-pose={pose} data-hidden={onCover}>
      <span className={styles.hello}>hi there</span>
      <svg
        viewBox="-14 4 108 92"
        aria-hidden
        fill="none"
        stroke={INK}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g className={styles.bounce} key={swap}>
          <g className={styles.head}>
            <path stroke={SOFT} strokeWidth={1.2} d="M35.5 63.5 L35 69 M45.5 63.5 L46 69 M24 80 L35 69 L40.5 73.5 L46 69 L57 80" />
            <path fill={PAPER} d="M23.5 40 C22.5 53 30 64.5 40.5 64.5 C51 64.5 58.5 53 57.2 40" />
            <path d="M23 44 C19.5 44 19.5 51 23.8 51.5 M57.2 44 C60.8 44 60.8 51 56.6 51.5" />
            <g className={styles.cheeks} fill="#f2b731" stroke="none">
              <ellipse cx="28" cy="53" rx="3.4" ry="2" />
              <ellipse cx="53" cy="53" rx="3.4" ry="2" />
            </g>
            <path strokeWidth={1.15} d="M28.5 37.8 Q32.5 36.2 36.5 37.6 M44.5 37.6 Q48.5 36.2 52.5 37.8" />
            <path strokeWidth={1.15} d="M40.8 49 Q39.6 52.6 41.8 53" />

            {/* eyes and mouth, one set per pose */}
            <g className={`${styles.pose} ${styles.idle}`}>
              <g className={styles.blink}>
                <circle fill={INK} stroke="none" cx="32.8" cy="45" r="3" />
                <circle fill={INK} stroke="none" cx="48.8" cy="45" r="3" />
                <circle fill={PAPER} stroke="none" cx="33.9" cy="43.9" r=".95" />
                <circle fill={PAPER} stroke="none" cx="49.9" cy="43.9" r=".95" />
              </g>
              <path d="M36.8 57 Q40.6 59.8 44.6 57" />
            </g>
            <g className={`${styles.pose} ${styles.read} ${styles.write} ${styles.erase}`}>
              <circle fill={INK} stroke="none" cx="32.8" cy="47.2" r="2.7" />
              <circle fill={INK} stroke="none" cx="48.8" cy="47.2" r="2.7" />
              <path strokeWidth={1.15} d="M28.6 45.6 Q32.8 43 37 45.6 M44.6 45.6 Q48.8 43 53 45.6" />
              <path d="M38.2 57.4 Q40.8 58.8 43.4 57.2" />
            </g>
            <g className={`${styles.pose} ${styles.look}`}>
              <circle fill={INK} stroke="none" cx="32.8" cy="44" r="3.1" />
              <circle fill={INK} stroke="none" cx="48.8" cy="44" r="3.1" />
              <circle fill={PAPER} stroke="none" cx="33.9" cy="42.9" r="1" />
              <circle fill={PAPER} stroke="none" cx="49.9" cy="42.9" r="1" />
              <path d="M36 56.4 Q40.6 61.4 45.4 56.4" />
            </g>
            <g className={`${styles.pose} ${styles.wave}`}>
              <path strokeWidth={1.6} d="M29.2 46.4 Q32.8 42.4 36.4 46.4 M45.2 46.4 Q48.8 42.4 52.4 46.4" />
              <path fill={PAPER} d="M36 56 Q40.6 62.4 45.4 56 Q40.6 57.6 36 56 Z" />
            </g>
            <g className={`${styles.pose} ${styles.doze}`}>
              <path strokeWidth={1.3} d="M29.4 45.6 Q32.8 48 36.2 45.6 M45.4 45.6 Q48.8 48 52.2 45.6" />
              <circle cx="41" cy="57.6" r="1.4" />
            </g>

            {/* round glasses */}
            <g>
              <circle cx="32.5" cy="44.5" r="7" />
              <circle cx="48.5" cy="44.5" r="7" />
              <path d="M39.5 44 Q40.5 42.6 41.5 44 M25.5 43.5 L22.8 43 M55.5 43.5 L57.8 43" />
            </g>
            <path
              fill={INK}
              strokeWidth={1}
              d="M22.5 45 C18 38 16.5 29 20 22.5 C19.5 19.5 21 17 23.5 16 C24.5 17.5 25.5 18 27 17.5 C28 13 31 10.5 34.5 10.2 C34.2 11.6 35 12.6 36.5 12.6 C39 9.6 43 8.6 47 9.4 C46.4 10.8 46.8 11.8 48 12.2 C51.5 11.2 55.5 12.4 57.6 14.6 C56.8 15.4 56.6 16.4 57.2 17.2 C59.8 18.4 61.6 20.6 62 23 C61.2 23.2 60.6 23.8 60.6 25 C62.5 30 61.5 38 58 45 C57.5 40 56.5 36 55 34 C54 36.5 52.5 37 51 35.5 C50 33 48.5 31 47 30.5 C46.5 33.5 44.5 35.5 42 35.5 C42.5 33 41.5 31 39.5 30 C38 32.5 35.5 34.5 33 34.5 C34 32 33.5 30.5 32 29.5 C30.5 32.5 28 35 25.5 35.5 C26 33 25.5 31.5 24.5 31 C23.5 36 23 41 22.5 45 Z"
            />
            <path stroke={PAPER} strokeWidth={1} opacity={0.7} d="M29 17 C33 14 38 13.5 41 15 M46 15.5 C50 15 53 16.5 55 19 M24 26 C25 23 27 21 29 20" />
          </g>

          {/* reading */}
          <g className={`${styles.pose} ${styles.read}`}>
            <path fill={PAPER} d="M15 69 L40 73.5 L65 69 L65 80 L40 84.5 L15 80 Z" />
            <path d="M40 73.5 L40 84.5" />
            <path stroke={SOFT} strokeWidth={1.2} d="M20 73 L34 75.5 M46 75.5 L60 73 M20 77 L34 79.5 M46 79.5 L60 77" />
          </g>

          {/* writing: a line of script comes out of the pen */}
          <g className={`${styles.pose} ${styles.write}`}>
            <path fill={PAPER} d="M10 76 L60 71 L67 88 L14 92 Z" />
            <path
              className={styles.inkLine}
              pathLength={1}
              strokeWidth={1.2}
              d="M20 84 C23 80.5 25 86 28 82.5 C31 79.5 33 85 36 81.5 C39 78.5 41 84 44 81"
            />
            <g className={styles.writing}>
              <path fill={INK} strokeWidth={1} d="M47 80 L63 58 L66 60 L50.5 82 Z" />
              <path stroke={PAPER} strokeWidth={0.8} d="M58 66 L60.5 67.6" />
              <path d="M47 80 L45.6 84 L50.5 82" />
              <path fill={PAPER} d="M48 84 C45 82 46 78 49.5 77.5 C53 77 56 79 55.5 82 C55 85 51 86 48 84 Z" />
            </g>
          </g>

          {/* erasing: the eraser goes back and forth and drops crumbs */}
          <g className={`${styles.pose} ${styles.erase}`}>
            <path fill={PAPER} d="M10 76 L60 71 L67 88 L14 92 Z" />
            <path stroke="rgba(42,42,46,.4)" strokeWidth={1.2} d="M20 84 C23 80.5 25 86 28 82.5 C31 79.5 33 85 36 81.5" />
            <path strokeWidth={1} d="M24 89 l1.5 1 M33 88.5 l1 1.4 M41 87.5 l1.6 .6" />
            <g className={styles.rubbing}>
              <path fill={PAPER} d="M38 78 L54 75 L56 83 L40 86 Z" />
              <path fill="#c3ccd8" stroke="none" d="M38.6 78.5 L44 77.5 L46 85 L40.6 86 Z" />
              <path d="M44 77.5 L46 85" />
              <path fill={PAPER} d="M47 75 C45.5 71.5 49 69 52.5 70 C56 71 57 74.5 55 77 C53 79 48.5 78.5 47 75 Z" />
            </g>
          </g>

          {/* waving */}
          <g className={`${styles.pose} ${styles.wave}`}>
            <g className={styles.waving}>
              <path fill={PAPER} d="M53 80 C58 76 61.5 68 63 60 L68 61 C67 70 63 78 58 82 Z" />
              <path fill={PAPER} d="M61 59 C59 54.5 61.5 50 65 50.5 C66.5 47.5 70.5 48 70.5 51.5 C73 52 73.5 56 71 58.5 C69 61 63 62 61 59 Z" />
              <path stroke={SOFT} strokeWidth={1.1} d="M75 47 Q78.5 49.5 78.5 54 M78.5 43 Q83 46.5 83 53" />
            </g>
          </g>

          {/* dozing */}
          <g className={`${styles.pose} ${styles.doze}`}>
            <path className={styles.zz} strokeWidth={1.3} d="M62 30 h5 l-5 5 h5" />
            <path className={`${styles.zz} ${styles.z2}`} strokeWidth={1.5} d="M69 18 h7 l-7 7 h7" />
          </g>
        </g>
      </svg>
      <button
        className={styles.hit}
        type="button"
        aria-label={zh ? "和小人打招呼" : "Say hi"}
        onPointerEnter={hover}
        onPointerLeave={hover}
        onFocus={hover}
        onBlur={hover}
      />
    </div>
  );
}
