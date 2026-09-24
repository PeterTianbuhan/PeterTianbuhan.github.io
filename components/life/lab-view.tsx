"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { PosterCanvas, type Poster } from "./poster-canvas";
import { SketchCanvas } from "./sketch/sketch-canvas";
import styles from "./lab.module.css";

// Directions for the 来处 art, kept side by side so they can be compared and
// reused as material. Nothing here is final.
type Direction =
  | { id: string; label: string; note: string; kind: "poster"; poster: Poster }
  | { id: string; label: string; note: string; kind: "still"; src: string }
  | { id: string; label: string; note: string; kind: "sketch" };

const directions: Direction[] = [
  {
    id: "collage",
    label: "A · 素材拼贴",
    note: "逐个生成地标再排版，分层视差 + 实时湖面。质感偏旧。",
    kind: "poster",
    poster: { dir: "yanyuan", focus: [0.5, 0.74], sun: [0.1, 0.02] },
  },
  {
    id: "modern",
    label: "B1 · 现代厚涂",
    note: "按 A 的构图整张重画：崩铁、鸣潮式的干净数字厚涂和体积光。",
    kind: "still",
    src: "/life/explore/modern.webp",
  },
  {
    id: "pop",
    label: "B2 · 潮流平涂",
    note: "同一构图，绝区零海报感：硬朗色块、网点阴影。",
    kind: "still",
    src: "/life/explore/pop.webp",
  },
  {
    id: "sketch",
    label: "C · 简笔画",
    note: "我心里的北大：先勾线，再一笔笔上水彩，最后盖章。",
    kind: "sketch",
  },
];

export function LabView({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(directions.length - 1);
  const [run, setRun] = useState(0);
  const d = directions[active];

  return (
    <main className={styles.root}>
      {d.kind === "poster" && <PosterCanvas key={d.id} poster={d.poster} onReady={() => {}} />}
      {d.kind === "still" && (
        <div className={styles.still} key={d.id}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized */}
          <img src={d.src} alt="" />
        </div>
      )}
      {d.kind === "sketch" && <SketchCanvas run={run} />}

      <header className={styles.bar} data-tone={d.kind === "sketch" ? "light" : "dark"}>
        <Link href={`/${locale}/life/`} className={styles.back}>
          ← 来处
        </Link>
        <nav className={styles.tabs}>
          {directions.map((x, i) => (
            <button key={x.id} type="button" data-active={i === active} onClick={() => setActive(i)}>
              {x.label}
            </button>
          ))}
        </nav>
      </header>

      <footer className={styles.note} data-tone={d.kind === "sketch" ? "light" : "dark"}>
        <p>{d.note}</p>
        {d.kind === "sketch" && (
          <button type="button" onClick={() => setRun((n) => n + 1)}>
            重画一遍
          </button>
        )}
      </footer>
    </main>
  );
}
