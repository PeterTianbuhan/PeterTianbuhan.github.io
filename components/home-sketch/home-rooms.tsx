import type { ReactNode } from "react";
import { signature } from "@/app/fonts/signature";
import type { Exhibit } from "@/lib/exhibits";
import type { Fact } from "@/lib/funfact";
import type { Locale } from "@/lib/i18n";
import type { Thing } from "@/lib/i-think";
import { EraseLink } from "./eraser";
import type { Essay } from "./gallery";
import { Motif, type MotifName } from "./garden";
import { Seen } from "./ink";
import paper from "./gallery.module.css";
import styles from "./rooms.module.css";

// The home page under the cover: the same paper, one room per section. Each
// room is its name with a small plant from the garden beside it, a few of its
// things, and the way in to the rest.

function Room({ id, title, script, motif, children }: { id: string; title: string; script: string; motif: MotifName; children: ReactNode }) {
  return (
    <section className={styles.room} aria-labelledby={id}>
      <Seen className={styles.side}>
        <h2 id={id}>{title}</h2>
        <span className={styles.script} aria-hidden>
          {script}
        </span>
        <Motif name={motif} delay={0.3} className={styles.plant} />
      </Seen>
      <div className={styles.copy}>{children}</div>
    </section>
  );
}

type Props = {
  locale: Locale;
  essays: Essay[];
  exhibits: Exhibit[];
  things: Thing[];
  facts: Fact[];
  role: string;
  bio: string[];
  email: string;
  github: string;
  x?: string;
};

// the ones Peter marked as featured; until he marks any, the newest three
function picks(essays: Essay[]) {
  const featured = essays.filter((e) => e.featured);
  return (featured.length > 0 ? featured : essays).slice(0, 3);
}

export function HomeRooms({ locale, essays, exhibits, things, facts, role, bio, email, github, x }: Props) {
  const zh = locale === "zh";
  return (
    <div className={`${paper.paper} ${styles.rooms} ${signature.variable}`}>
      <Room id="writing" title={zh ? "长文" : "Essays"} script="Essays" motif="daisy">
        <p className={styles.line}>{zh ? "想得比较久的一些事，一篇写一件。" : "Things I've thought about for a while, one per essay."}</p>
        <ol className={styles.picks}>
          {picks(essays).map((essay) => (
            <li key={essay.href}>
              <EraseLink href={essay.href}>
                <span className={styles.pick}>{essay.title}</span>
                <span className={styles.date}>{essay.date}</span>
              </EraseLink>
            </li>
          ))}
        </ol>
        <EraseLink href={`/${locale}/writing/`} className={styles.all}>
          {zh ? `全部 ${essays.length} 篇长文` : `All ${essays.length} essays`} →
        </EraseLink>
      </Room>

      <Room id="projects" title={zh ? "项目" : "Projects"} script="Works" motif="mushroom">
        <p className={styles.line}>{zh ? "自己做的几样东西。" : "A few things I've made."}</p>
        <ol className={styles.picks}>
          {exhibits.slice(0, 3).map((piece) => (
            <li key={piece.slug}>
              <EraseLink href={`/${locale}/projects/${piece.slug}/`}>
                <span className={styles.pick}>{piece.name}</span>
                <span className={styles.date}>{piece.year}</span>
                <span className={styles.gist}>{piece.summary}</span>
              </EraseLink>
            </li>
          ))}
        </ol>
        <EraseLink href={`/${locale}/projects/`} className={styles.all}>
          {zh ? `全部 ${exhibits.length} 个项目` : `All ${exhibits.length} projects`} →
        </EraseLink>
      </Room>

      <Room id="i-think" title={zh ? "我觉得" : "I think"} script="I think" motif="dandelion">
        <p className={styles.line}>
          {zh ? "对模型、工具和别人项目的一些很主观的感觉，改主意了就划掉重写。" : "Very subjective feelings about models, tools and other people's projects, crossed out and rewritten when I change my mind."}
        </p>
        <ul className={styles.things}>
          {things.slice(0, 8).map((t) => (
            <li key={t.id}>
              <EraseLink href={`/${locale}/i-think/#${t.id}`}>
                <span className={styles.pick}>{t.name}</span>
                {t.gist && <span className={styles.date}>{t.gist}</span>}
              </EraseLink>
            </li>
          ))}
        </ul>
        <EraseLink href={`/${locale}/i-think/`} className={styles.all}>
          {zh ? `全部 ${things.length} 条` : `All ${things.length}`} →
        </EraseLink>
      </Room>

      <Room id="funfact" title={zh ? "趣闻" : "Fun facts"} script="Fun facts" motif="butterfly">
        <p className={styles.line}>{zh ? "读到的一些有意思的小事，一条讲一件。" : "Small things I came across and liked, one each."}</p>
        <ol className={styles.picks}>
          {facts.slice(0, 3).map((fact) => (
            <li key={fact.id}>
              <EraseLink href={`/${locale}/funfact/#${fact.id}`}>
                <span className={styles.pick}>{fact.title}</span>
                <span className={styles.date}>{fact.date}</span>
              </EraseLink>
            </li>
          ))}
        </ol>
        <EraseLink href={`/${locale}/funfact/`} className={styles.all}>
          {zh ? "全部趣闻" : "All of them"} →
        </EraseLink>
      </Room>

      <Room id="about" title={zh ? "关于" : "About"} script="Hello" motif="sprout">
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
      </Room>
    </div>
  );
}
