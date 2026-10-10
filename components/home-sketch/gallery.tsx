"use client";

import type { ReactNode } from "react";
import { signature } from "@/app/fonts/signature";
import type { Exhibit } from "@/lib/exhibits";
import type { Locale } from "@/lib/i18n";
import { EraseLink } from "./eraser";
import { InkFrame, InkRule, Seen } from "./ink";
import { Vignette } from "./vignettes";
import styles from "./gallery.module.css";

export type Essay = {
  href: string;
  title: string;
  excerpt: string;
  date: string;
  series?: string;
  draft?: boolean;
  featured?: boolean;
};

export function Heading({
  id,
  title,
  script,
  as: Title = "h2",
}: {
  id?: string;
  title: string;
  script: string;
  as?: "h1" | "h2";
}) {
  return (
    <Seen className={styles.heading}>
      <Title id={id}>{title}</Title>
      <span className={styles.script} aria-hidden>
        <span>{script}</span>
      </span>
    </Seen>
  );
}

export function EssayList({ locale, essays }: { locale: Locale; essays: Essay[] }) {
  const zh = locale === "zh";
  if (essays.length === 0) {
    return (
      <Seen className={styles.empty}>
        <InkRule seed="no-essays" />
        <p>{zh ? "第一篇长文还在写。" : "The first essay is still being written."}</p>
      </Seen>
    );
  }
  return (
    <div className={styles.essays}>
      {essays.map((essay) => (
        <Seen as="article" key={essay.href} className={styles.essay}>
          <InkRule seed={essay.href} />
          <div className={styles.essayBody}>
            <p className={styles.label}>
              <span>{essay.date}</span>
              {essay.series && <span>{essay.series}</span>}
              {essay.draft && <span className={styles.draft}>{zh ? "草稿" : "draft"}</span>}
            </p>
            <h3>
              <EraseLink href={essay.href}>{essay.title}</EraseLink>
            </h3>
            <p className={styles.excerpt}>{essay.excerpt}</p>
          </div>
        </Seen>
      ))}
    </div>
  );
}

export function Colophon() {
  return (
    <Seen as="footer" className={styles.colophon}>
      <InkRule seed="colophon" />
      <p>
        <span className={styles.sign}>Peter</span>
        <span>To be continued</span>
      </p>
    </Seen>
  );
}

// a piece on the wall: its drawing in a hung frame, and the placard beside it
function Piece({ locale, piece, flip }: { locale: Locale; piece: Exhibit; flip: boolean }) {
  const zh = locale === "zh";
  const href = `/${locale}/projects/${piece.slug}/`;
  return (
    <Seen as="article" className={`${styles.piece} ${flip ? styles.flip : ""}`}>
      <InkFrame seed={piece.slug} hung className={styles.canvas}>
        <EraseLink href={href} className={styles.canvasLink} aria-label={piece.name}>
          <Vignette slug={piece.slug} delay={1.7} />
        </EraseLink>
      </InkFrame>
      <div className={styles.placard}>
        <p className={styles.label}>
          <span>{piece.year}</span>
        </p>
        <h3>
          <EraseLink href={href}>{piece.name}</EraseLink>
        </h3>
        <p className={styles.excerpt}>{piece.summary}</p>
        <p className={styles.role}>
          <EraseLink href={href} className={styles.read}>
            {zh ? "看看这个项目" : "More on this"} →
          </EraseLink>
          {piece.link && (
            <a href={piece.link.href} target="_blank" rel="noreferrer" className={styles.read}>
              {piece.link.label} ↗
            </a>
          )}
        </p>
      </div>
    </Seen>
  );
}

export function Wall({ locale, exhibits }: { locale: Locale; exhibits: Exhibit[] }) {
  return (
    <div className={styles.wall}>
      {exhibits.map((piece, i) => (
        <Piece key={piece.slug} locale={locale} piece={piece} flip={i % 2 === 1} />
      ))}
    </div>
  );
}

// the last line of the home page, on plain paper under the picture book
export function HomeFooter() {
  return (
    <div className={`${styles.paper} ${styles.footer} ${signature.variable}`}>
      <Colophon />
    </div>
  );
}

// a page of its own: a running head with the way back, the page, and the last line
export function PageShell({
  locale,
  other,
  children,
}: {
  locale: Locale;
  // the same page in the other language, when there is one
  other?: string;
  children: ReactNode;
}) {
  const zh = locale === "zh";
  return (
    <div className={`${styles.paper} ${styles.page} ${signature.variable}`}>
      <header className={styles.topbar}>
        <EraseLink href={`/${locale}/`} className={styles.home}>
          Peter Tian
        </EraseLink>
        <nav>
          <EraseLink href={`/${locale}/writing/`} className={styles.read}>
            {zh ? "长文" : "Essays"}
          </EraseLink>
          <EraseLink href={`/${locale}/projects/`} className={styles.read}>
            {zh ? "项目" : "Projects"}
          </EraseLink>
          <EraseLink href={`/${locale}/i-think/`} className={styles.read}>
            {zh ? "我觉得" : "I think"}
          </EraseLink>
          {other && (
            <EraseLink href={other} className={styles.read}>
              {zh ? "EN" : "中"}
            </EraseLink>
          )}
        </nav>
      </header>
      {children}
      <Colophon />
    </div>
  );
}

// the whole shelf of essays
export function EssaysPage({ locale, essays }: { locale: Locale; essays: Essay[] }) {
  const zh = locale === "zh";
  return (
    <PageShell locale={locale} other={zh ? "/en/writing/" : "/zh/writing/"}>
      <section className={styles.room}>
        <Heading as="h1" title={zh ? "长文" : "Essays"} script="Essays" />
        <EssayList locale={locale} essays={essays} />
        <div className={styles.essays}>
          <Seen as="article" className={styles.essay}>
            <InkRule seed="daily" />
            <div className={styles.essayBody}>
              <h3>
                <EraseLink href={`/${locale}/daily/`}>{zh ? "每日一式" : "One move a day"}</EraseLink>
              </h3>
              <p className={styles.excerpt}>
                {zh ? "一行一个小习惯，想到就加。" : "Small habits, one per line, added as they come."}
              </p>
            </div>
          </Seen>
        </div>
      </section>
    </PageShell>
  );
}

// every piece on the wall
export function ProjectsPage({ locale, exhibits }: { locale: Locale; exhibits: Exhibit[] }) {
  const zh = locale === "zh";
  return (
    <PageShell locale={locale} other={zh ? "/en/projects/" : "/zh/projects/"}>
      <section className={styles.room}>
        <Heading as="h1" title={zh ? "项目" : "Projects"} script="Works" />
        <Wall locale={locale} exhibits={exhibits} />
      </section>
    </PageShell>
  );
}
