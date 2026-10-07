"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { signature } from "@/app/fonts/signature";
import styles from "./storybook.module.css";

// One page of the picture book. Scroll progress through it, 0 as it enters and
// 1 as it leaves, goes to --p so the CSS can let a few things drift with it.
export function BookPage({ label, flip, tone, children }: { label: string; flip?: boolean; tone: string; children: ReactNode }) {
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
  return (
    <section ref={ref} className={`${styles.screen} ${flip ? styles.flip : ""} ${signature.variable}`} style={{ background: tone }} data-cover aria-labelledby={label}>
      {children}
    </section>
  );
}
