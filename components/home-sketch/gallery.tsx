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
};

// the home page shows the newest few; the rest are a page turn away
const ON_HOME = 3;

export function Heading({ id, title, script, as: Title = "h2" }: { id?: string; title: string; script: string; as?: "h1" | "h2" }) {
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
      {essays.map((essay, i) => (
        <Seen as="article" key={essay.href} className={styles.essay}>
          <InkRule seed={essay.href} />
          <div className={styles.essayBody}>
            <p className={styles.label}>
              <span>No. {String(i + 1).padStart(2, "0")}</span>
              <span>{essay.date}</span>
              {essay.series && <span>{essay.series}</span>}
              {essay.draft && <span className={styles.draft}>{zh ? "草稿" : "draft"}</span>}
            </p>
            <h3>
              <EraseLink href={essay.href}>{essay.title}</EraseLink>
            </h3>
            <p className={styles.excerpt}>{essay.excerpt}</p>
            <EraseLink href={essay.href} className={styles.read}>
              {zh ? "读这篇" : "Read"} →
            </EraseLink>
          </div>
        </Seen>
      ))}
    </div>
  );
}

export function Colophon({ locale }: { locale: Locale }) {
  return (
    <Seen as="footer" className={styles.colophon}>
      <InkRule seed="colophon" />
      <p>
        <span className={styles.sign}>Peter</span>
        <span>{locale === "zh" ? "这本速写本还在慢慢画。" : "This sketchbook is still being drawn."}</span>
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
          <span>{piece.status}</span>
        </p>
        <h3>
          <EraseLink href={href}>{piece.name}</EraseLink>
        </h3>
        <p className={styles.medium}>{piece.medium}</p>
        <p className={styles.excerpt}>{piece.summary}</p>
        {piece.honor && <p className={styles.honor}>{piece.honor}</p>}
        <p className={styles.role}>
          <span>{piece.role}</span>
        </p>
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

type Props = {
  locale: Locale;
  things: { name: string; gist?: string; id: string }[];
  role: string;
  bio: string[];
  essays: Essay[];
  exhibits: Exhibit[];
  email: string;
  github: string;
  x?: string;
};

export function Gallery({ locale, things, role, bio, essays, exhibits, email, github, x }: Props) {
  const zh = locale === "zh";
  return (
    <div className={`${styles.paper} ${signature.variable}`}>
      <section className={styles.room}>
        <Heading id="writing" title={zh ? "长文" : "Essays"} script="Essays" />
        <EssayList locale={locale} essays={essays.slice(0, ON_HOME)} />
        {essays.length > ON_HOME && (
          <Seen className={styles.more}>
            <EraseLink href={`/${locale}/writing/`} className={styles.read}>
              {zh ? `全部 ${essays.length} 篇长文` : `All ${essays.length} essays`} →
            </EraseLink>
          </Seen>
        )}
      </section>

      <section className={styles.room}>
        <Heading id="projects" title={zh ? "项目" : "Projects"} script="Works" />
        <Wall locale={locale} exhibits={exhibits} />
      </section>

      <section className={styles.room}>
        <Heading id="i-think" title={zh ? "我觉得" : "I think"} script="I think" />
        <Seen className={styles.about}>
          <p className={styles.excerpt}>
            {zh ? "对模型、工具和别人项目的一些很主观的感觉，改主意了就划掉重写。" : "Very subjective feelings about models, tools and other people's projects, crossed out and rewritten when I change my mind."}
          </p>
          <ul className={styles.things}>
            {things.map((t) => (
              <li key={t.id}>
                <EraseLink href={`/${locale}/i-think/#${t.id}`}>
                  {t.name}
                  {t.gist && <span>{t.gist}</span>}
                </EraseLink>
              </li>
            ))}
          </ul>
          <EraseLink href={`/${locale}/i-think/`} className={styles.read}>
            {zh ? "看看我怎么说" : "Read them"} →
          </EraseLink>
        </Seen>
      </section>

      <section className={styles.room}>
        <Heading id="about" title={zh ? "关于" : "About"} script="Hello" />
        <Seen className={styles.about}>
          <p className={styles.lead}>{role}</p>
          <div className={styles.bio}>
            {bio.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <dl className={styles.contact}>
            <div>
              <dt>{zh ? "邮箱" : "Email"}</dt>
              <dd>
                <a href={`mailto:${email}`}>{email}</a>
              </dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={github} target="_blank" rel="noreferrer">
                  {github.replace(/^https:\/\//, "")}
                </a>
              </dd>
            </div>
            {x && (
              <div>
                <dt>X</dt>
                <dd>
                  <a href={x} target="_blank" rel="noreferrer">
                    {x.replace(/^https:\/\/x\.com\//, "@")}
                  </a>
                  <span className={styles.aside}>{zh ? "随手的想法在这里" : "for the passing thoughts"}</span>
                </dd>
              </div>
            )}
          </dl>
        </Seen>
      </section>

      <Colophon locale={locale} />
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
      <Colophon locale={locale} />
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
