"use client";

import Link from "next/link";
import { CollectionPicker, useCollectionSelection } from "./collection-picker";
import type { Locale } from "@/lib/i18n";
import styles from "./reading.module.css";

type Entry = {
  title: string;
  excerpt: string;
  href: string;
  publishedAt: string;
  publishedAtLabel: string;
  series?: string;
  preview?: boolean;
};
type Series = { id: string; title: string; description: string };

export function WritingBrowser({ locale, entries, series }: {
  locale: Locale;
  entries: Entry[];
  series: Series[];
}) {
  const zh = locale === "zh";
  const options = [{ id: "", title: zh ? "全部" : "All writing", description: "" }, ...series];
  const { current, select, step } = useCollectionSelection(options);
  const visibleEntries = current.id ? entries.filter((entry) => entry.series === current.id) : entries;

  return <>
    <CollectionPicker locale={locale} options={options} current={current} select={select} step={step} />
    <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>{current.title} · {visibleEntries.length} {zh ? "篇" : "articles"}</div>
    <div className={styles.collectionEntries}>
      {visibleEntries.map((entry) => <Link className={styles.entry} href={entry.href} key={entry.href}>
        <div className={styles.meta}><time dateTime={entry.publishedAt}>{entry.publishedAtLabel}</time>{entry.preview && <span className={styles.preview}>{zh ? "本地预览" : "Local preview"}</span>}</div>
        <h2>{entry.title}</h2>
        <p>{entry.excerpt}</p>
      </Link>)}
      {visibleEntries.length === 0 && <p className={styles.intro}>{zh ? "暂无文章。" : "No articles yet."}</p>}
    </div>
  </>;
}
