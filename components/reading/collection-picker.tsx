"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./reading.module.css";

export type CollectionOption = { id: string; title: string; description: string };

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function getSelection() { return window.location.hash.slice(1); }
function getServerSelection() { return ""; }

export function useCollectionSelection(options: CollectionOption[]) {
  const selection = useSyncExternalStore(subscribe, getSelection, getServerSelection);
  const index = Math.max(0, options.findIndex((item) => item.id === selection));
  const current = options[index];
  function select(id: string) {
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${id ? `#${id}` : ""}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  function step(direction: number) {
    select(options[(index + direction + options.length) % options.length].id);
  }

  return { current, select, step };
}

export function CollectionPicker({ locale, options, current, select, step }: {
  locale: Locale;
  options: CollectionOption[];
  current: CollectionOption;
  select: (id: string) => void;
  step: (direction: number) => void;
}) {
  const zh = locale === "zh";
  return (
    <header className={styles.collectionHeader}>
      <div className={styles.collectionPicker}>
        <h1 className={styles.collectionTitle}>
          {options.length > 1 ? <select aria-label={zh ? "选择系列" : "Choose a collection"} value={current.id} onChange={(event) => select(event.target.value)}>
            {options.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select> : current.title}
        </h1>
        {options.length > 1 && <div className={styles.collectionControls}>
          <button type="button" aria-label={zh ? "上一个系列" : "Previous collection"} onClick={() => step(-1)}>←</button>
          <button type="button" aria-label={zh ? "下一个系列" : "Next collection"} onClick={() => step(1)}>→</button>
        </div>}
      </div>
      {current.description && <p className={styles.intro}>{current.description}</p>}
    </header>
  );
}
