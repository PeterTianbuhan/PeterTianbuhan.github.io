"use client";

import type { ReactNode, RefObject } from "react";
import type { Locale } from "@/lib/i18n";
import type { ShowcaseChapterMeta, ShowcaseMeta } from "@/lib/showcases";
import { PromptLine } from "@/components/terminal/prompt-line";
import styles from "@/components/terminal/terminal.module.css";

type Props = {
  locale: Locale;
  showcase: ShowcaseMeta;
  chapter?: ShowcaseChapterMeta & { content?: ReactNode };
  headingRef?: RefObject<HTMLHeadingElement | null>;
  onNavigate: (target: string, command: string) => void;
};

export function ShowcaseView({
  locale,
  showcase,
  chapter,
  headingRef,
  onNavigate,
}: Props) {
  const zh = locale === "zh";
  const base = showcase.slug;
  const dir = `~/${base}`;

  const anchor = (
    target: string,
    command: string,
    label: ReactNode,
    className?: string,
  ) => (
    <a
      className={className}
      href={`#${encodeURI(target)}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate(target, command);
      }}
    >
      {label}
    </a>
  );

  if (!chapter) {
    return (
      <div>
        <PromptLine path="~">cd {base}</PromptLine>
        <PromptLine path={dir}>ls -l</PromptLine>
        <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
          {showcase.title}
        </h1>
        <p className={styles.sub}>{showcase.description}</p>
        <div className={`${styles.ls} ${styles.ls4}`}>
          {showcase.chapters.map((c) => (
            <div key={c.slug}>
              {anchor(
                `${base}/${c.slug}`,
                `less ${c.slug}.mdx`,
                <>
                  <span className={styles.rowMode}>-r--r--r--</span>
                  <span className={styles.rowMeta}>{c.number}</span>
                  <span className={styles.rowName}>{c.slug}.mdx</span>
                  <span className={styles.rowLabel}>{c.title}</span>
                </>,
                styles.row,
              )}
            </div>
          ))}
        </div>
        <p className={styles.hint}>
          {zh ? "提示：" : "hint: "}
          {anchor(
            `${base}/${showcase.chapters[0]?.slug ?? ""}`,
            `less ${showcase.chapters[0]?.slug ?? ""}.mdx`,
            `less ${showcase.chapters[0]?.slug ?? ""}.mdx`,
          )}
          {zh ? " 从第一篇开始" : " to start from the first one"}
        </p>
        <p className={`${styles.line} ${styles.navLine}`}>
          {anchor("home", "cd ~", "cd ~")}
        </p>
      </div>
    );
  }

  const index = showcase.chapters.findIndex((c) => c.slug === chapter.slug);
  const prev = index > 0 ? showcase.chapters[index - 1] : undefined;
  const next =
    index >= 0 && index < showcase.chapters.length - 1
      ? showcase.chapters[index + 1]
      : undefined;
  const file = `${chapter.slug}.mdx`;

  return (
    <div>
      <PromptLine path="~">cd {base}</PromptLine>
      <PromptLine path={dir}>less {file}</PromptLine>
      <div className={styles.fileBar}>
        <span>
          &quot;{dir}/{file}&quot;
        </span>
        <span>
          {chapter.number}/{showcase.chapters.length}
        </span>
      </div>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        {chapter.title}
      </h1>
      {chapter.subtitle && <p className={styles.sub}>{chapter.subtitle}</p>}
      <article className={styles.prose}>{chapter.content}</article>
      <span className={styles.end}>
        {next ? `(${chapter.number}/${showcase.chapters.length})` : "(END)"}
      </span>
      <p className={`${styles.line} ${styles.navLine}`}>
        {prev &&
          anchor(
            `${base}/${prev.slug}`,
            `less ${prev.slug}.mdx`,
            `← ${prev.slug}.mdx`,
          )}
        {prev && <span className={styles.navGap} />}
        {anchor(base, "q", zh ? "q  退出" : "q  quit")}
        {next && <span className={styles.navGap} />}
        {next &&
          anchor(
            `${base}/${next.slug}`,
            `less ${next.slug}.mdx`,
            `${next.slug}.mdx →`,
          )}
      </p>
    </div>
  );
}
