"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import styles from "./gallery.module.css";

// Hand-drawn rules and frames for the paper under the sketch. They are measured
// in pixels (so the pen weight never stretches) and ink themselves the first
// time they scroll into view, the same way the sketch above is drawn.

type Pt = [number, number];

function rng(seed: string) {
  let a = 0;
  for (const c of seed) a = (Math.imul(a ^ c.charCodeAt(0), 2654435761) + 1) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

// a slightly unsteady straight line: the hand drifts, then corrects
function stroke(r: () => number, [x0, y0]: Pt, [x1, y1]: Pt, amp: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [-dy / len, dx / len];
  const n = Math.max(2, Math.round(len / 110));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const off = (r() - 0.5) * amp * (i === 0 || i === n ? 0.8 : 2);
    pts.push([x0 + (dx * i) / n + nx * off, y0 + (dy * i) / n + ny * off]);
  }
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 1; i < n; i++) {
    const [mx, my] = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += ` Q${f(pts[i][0])},${f(pts[i][1])} ${f(mx)},${f(my)}`;
  }
  return `${d} L${f(pts[n][0])},${f(pts[n][1])}`;
}

const timing = (t: number, dur: number) => ({ "--t": `${t}s`, "--d": `${dur}s` }) as CSSProperties;

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

// flips to true once, the first time the element is well inside the viewport
export function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

// marks its subtree data-seen once it scrolls into view, which sets the ink below going
export function Seen({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "section" | "article" | "footer" | "header";
  className?: string;
  children: ReactNode;
}) {
  const [ref, seen] = useSeen<HTMLElement>();
  return (
    <Tag ref={ref as Ref<HTMLDivElement>} className={className} data-seen={seen}>
      {children}
    </Tag>
  );
}

// a horizontal rule, pulled left to right
// (it stops a little short of the right edge, as a hand does, unless `reach` is set)
export function InkRule({ seed, delay = 0, reach = false }: { seed: string; delay?: number; reach?: boolean }) {
  const [ref, { w }] = useSize<HTMLDivElement>();
  const r = rng(seed);
  const tail = reach ? 0 : 12 + r() * 30;
  return (
    <div ref={ref} className={styles.rule} aria-hidden>
      {w > 0 && (
        <svg className={styles.ink} width={w} height={12}>
          <path d={stroke(r, [0, 6], [w - tail, 6 + (r() - 0.5) * 3], 2.4)} pathLength={1} style={timing(delay, 0.9)} />
        </svg>
      )}
    </div>
  );
}

// four strokes with overshooting corners, drawn one after another, plus an
// optional nail and hanging string, for things on the wall
export function InkFrame({
  seed,
  delay = 0,
  hung = false,
  className,
  children,
}: {
  seed: string;
  delay?: number;
  hung?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const r = rng(seed);
  const o = () => 4 + r() * 9;
  const j = () => (r() - 0.5) * 5;
  const sides = w > 0 ? [
    stroke(r, [-o(), j()], [w + o(), j()], 2.2),
    stroke(r, [w + j(), -o()], [w + j(), h + o()], 2.2),
    stroke(r, [w + o(), h + j()], [-o(), h + j()], 2.2),
    stroke(r, [j(), h + o()], [j(), -o()], 2.2),
  ] : [];
  const lead = hung ? 0.55 : 0;
  const nail: Pt = [w / 2 + j(), -56];
  return (
    <div ref={ref} className={`${styles.frame} ${className ?? ""}`}>
      {w > 0 && (
        <svg className={`${styles.ink} ${styles.frameInk}`} aria-hidden>
          <g transform="translate(40 80)">
            {hung && (
              <>
                <path
                  d={`M${f(nail[0] - w * 0.26)},0 L${f(nail[0])},${nail[1]} L${f(nail[0] + w * 0.26)},0`}
                  pathLength={1}
                  className={styles.string}
                  style={timing(delay, 0.5)}
                />
                <circle cx={nail[0]} cy={nail[1]} r={2.4} style={timing(delay, 0.2)} />
              </>
            )}
            {sides.map((d, i) => (
              <path key={i} d={d} pathLength={1} style={timing(delay + lead + i * 0.26, 0.42)} />
            ))}
          </g>
        </svg>
      )}
      <div className={styles.inside} style={{ "--after": `${delay + lead + 0.9}s` } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

// a section heading in running text, with a short stroke pulled under it
export function InkHeading({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <Seen className={styles.inkHeading}>
      <h2 id={id}>{children}</h2>
      <div className={styles.underline}>
        <InkRule seed={`h:${id ?? ""}`} reach />
      </div>
    </Seen>
  );
}

// a scene break: a small wave in the middle of the page
export function InkBreak() {
  return (
    <Seen className={styles.inkBreak}>
      <svg className={styles.ink} width={64} height={14} viewBox="0 0 64 14" aria-hidden>
        <path d="M2,8 Q9,1 16,7 T30,7 T44,7 T58,6" pathLength={1} style={timing(0, 0.7)} />
      </svg>
    </Seen>
  );
}

// words crossed out when I've changed my mind: one pen stroke through each line
// they wrap onto, pulled across as they come into view
export function InkStrike({ children }: { children?: ReactNode }) {
  const [ref, seen] = useSeen<HTMLModElement>();
  const words = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  useEffect(() => {
    const el = words.current;
    const box = ref.current?.offsetParent;
    if (!el || !box) return;
    const measure = () => {
      const o = box.getBoundingClientRect();
      setLines([...el.getClientRects()].map((r) => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height })));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [ref]);
  const r = rng(String(children));
  return (
    <del ref={ref} className={styles.strike} data-seen={seen}>
      <span ref={words}>{children}</span>
      {lines.length > 0 && (
        <svg className={`${styles.ink} ${styles.strikeInk}`} aria-hidden>
          {lines.map((l, i) => {
            const y = l.y + l.h * 0.5;
            return (
              <path
                key={i}
                d={stroke(r, [l.x - 3, y + (r() - 0.5) * 3], [l.x + l.w + 3, y + (r() - 0.5) * 4], 2)}
                pathLength={1}
                style={timing(0.3 + i * 0.35, 0.4)}
              />
            );
          })}
        </svg>
      )}
    </del>
  );
}
