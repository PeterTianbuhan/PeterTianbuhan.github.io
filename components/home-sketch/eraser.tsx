"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import styles from "./eraser.module.css";

// Turning a page in the sketchbook: an eraser scrubs the current page back to
// blank paper in a few back-and-forth passes, then the next page draws itself.

type Pass = { href: string; from: string; d: string; w: number; h: number; band: number; covered: boolean };

const EraserContext = createContext<(href: string) => void>(() => {});

// back and forth down the page, each pass a little lower than the last
function scrub(w: number, h: number) {
  const rows = w < 700 ? 6 : 5;
  const band = h / rows;
  const pts: string[] = [];
  for (let i = 0; i < rows; i++) {
    const y = band * (i + 0.5);
    const [a, b] = i % 2 === 0 ? [-90, w + 90] : [w + 90, -90];
    pts.push(`${a},${Math.round(y - band * 0.3)}`, `${b},${Math.round(y + band * 0.3)}`);
  }
  return { d: `M${pts.join(" L")}`, band };
}

export function EraserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pass, setPass] = useState<Pass | null>(null);

  const erase = useCallback(
    (href: string) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPass({ href, from: window.location.pathname, w, h, covered: false, ...scrub(w, h) });
    },
    [router],
  );

  // the new page has arrived under the blank paper: lift the veil so it can draw
  const clearing = pass !== null && pass.covered && pathname !== pass.from;

  return (
    <EraserContext.Provider value={erase}>
      {children}
      {pass && (
        <div
          className={styles.veil}
          data-covered={pass.covered}
          data-clearing={clearing}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && clearing) setPass(null);
          }}
          aria-hidden
        >
          <svg width={pass.w} height={pass.h} viewBox={`0 0 ${pass.w} ${pass.h}`}>
            <defs>
              <filter id="rubbed" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
                <feDisplacementMap in="SourceGraphic" scale="22" />
              </filter>
            </defs>
            <path
              d={pass.d}
              pathLength={1}
              className={styles.rub}
              strokeWidth={pass.band * 1.6}
              filter="url(#rubbed)"
              onAnimationEnd={() => {
                setPass((p) => (p ? { ...p, covered: true } : p));
                // under blank paper, so jump to the top rather than scroll there
                window.scrollTo({ top: 0, behavior: "instant" });
                router.push(pass.href, { scroll: false });
              }}
            />
          </svg>
          <div
            className={styles.eraser}
            style={{ offsetPath: `path("${pass.d}")`, width: pass.band, height: pass.band * 0.6 }}
          >
            <svg viewBox="0 0 80 48">
              <path className={styles.rubber} d="M10,30 L44,8 Q50,5 55,9 L70,20 Q74,25 69,29 L36,44 Q30,47 25,43 Z" />
              <path className={styles.sleeve} d="M30,17 L51,34 L36,44 Q30,47 25,43 L10,30 Z" />
              <path className={styles.outline} d="M10,30 L44,8 Q50,5 55,9 L70,20 Q74,25 69,29 L36,44 Q30,47 25,43 Z M30,17 L51,34" />
            </svg>
          </div>
        </div>
      )}
    </EraserContext.Provider>
  );
}

// a link that turns the page with the eraser; modified clicks still open normally
export function EraseLink({ href, onClick, ...rest }: ComponentProps<typeof Link>) {
  const erase = useContext(EraserContext);
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        erase(String(href));
      }}
    />
  );
}
