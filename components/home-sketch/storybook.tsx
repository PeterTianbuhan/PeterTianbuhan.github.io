import type { ReactNode } from "react";
import type { Exhibit } from "@/lib/exhibits";
import type { Locale } from "@/lib/i18n";
import type { Thing } from "@/lib/i-think";
import { EraseLink } from "./eraser";
import type { Essay } from "./gallery";
import { BookPage } from "./storybook-page";
import { BG_ESSAYS, BUILDER, CHAT, LAKE, WRITER, type Drawing } from "./storybook-drawings";
import styles from "./storybook.module.css";

// The pages of a picture book under the cover, one per section, each with the
// little me from the corner doing that section's thing: writing on a cloud,
// building little houses, chatting with a circle of small monsters, and
// waving from the lake. They arrive already painted; scrolling through a page
// only lets a few things drift. Rendered on the server, so the drawings ship
// as markup and never as script.

const INK = "#2a2a2e";
const PAPER = "#f8f4ea";
const SOFT = "rgba(42,42,46,.66)";

// watercolour: a wash bleeds past its line a little and dries unevenly
function Filters() {
  return (
    <svg className={styles.defs} aria-hidden>
      <defs>
        <filter id="sb-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="46" />
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="sb-fill" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
          <feGaussianBlur stdDeviation=".6" />
        </filter>
        <filter id="sb-wash-fine" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" />
        </filter>
        <filter id="sb-wash-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="30" />
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="sb-grain">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="1" />
          <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .16  0 0 0 0 .18  0 0 0 .06 0" />
        </filter>
      </defs>
    </svg>
  );
}

type Patch = {
  id: string;
  // the outline of the wash, in the drawing's own coordinates
  shape: string;
  washes: [fill: string, opacity: number, d: string][];
  scene: Drawing;
  // where the scene sits behind the little me
  place: string;
};

// a spot of watercolour behind the little me, the rest of the page left as
// paper; a piece of the page's scene shows through it and fades at its edges
function PatchBehind({ patch }: { patch: Patch }) {
  const h = patch.scene.size[1];
  return (
    <g>
      <defs>
        <filter id={`${patch.id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="46" />
        </filter>
        <mask id={`${patch.id}-mask`} maskUnits="userSpaceOnUse" x="-400" y="-400" width="2200" height="2200">
          <path fill="#fff" d={patch.shape} filter={`url(#${patch.id}-soft)`} />
        </mask>
      </defs>
      <g filter="url(#sb-wash)">
        <path fill={patch.washes[1][0]} opacity={patch.washes[1][1]} d={patch.washes[1][2]} />
        <path fill={patch.washes[0][0]} opacity={patch.washes[0][1]} d={patch.shape} />
        {patch.washes.slice(2).map(([fill, opacity, d]) => (
          <path key={d.length} fill={fill} opacity={opacity} d={d} />
        ))}
      </g>
      <g mask={`url(#${patch.id}-mask)`}>
        <g transform={patch.place}>
          <path transform={`translate(0 ${h}) scale(1 -1)`} fill="rgba(42,42,46,.42)" d={patch.scene.ink} />
        </g>
      </g>
    </g>
  );
}

// a traced drawing: washes under the ink, the ink on top
function Art({ drawing, view, patch, children }: { drawing: Drawing; view: string; patch?: Patch; children?: ReactNode }) {
  return (
    <svg className={`${styles.scene} ${patch ? styles.patched : ""}`} viewBox={view} aria-hidden>
      {patch && <PatchBehind patch={patch} />}
      {children}
      <g className={styles.drift}>
        {drawing.under.map(([fill, opacity, d]) => (
          <path key={d.length} fill={fill} opacity={opacity} d={d} filter="url(#sb-wash-soft)" />
        ))}
        <g transform={`translate(0 ${drawing.size[1]}) scale(1 -1)`} filter="url(#sb-wash-fine)">
          {drawing.washes.map(([fill, d]) => (
            <path key={fill + d.length} fill={fill} d={d} />
          ))}
        </g>
        {drawing.cheeks.map(([x, y]) => (
          <ellipse key={x} cx={x} cy={y} rx="25" ry="14" fill="#f2b731" opacity={0.8} />
        ))}
        <path transform={`translate(0 ${drawing.size[1]}) scale(1 -1)`} fill={INK} d={drawing.ink} />
      </g>
    </svg>
  );
}

function Sky({ children }: { children: ReactNode }) {
  return (
    <svg className={styles.sky} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {children}
      <rect width="1440" height="900" filter="url(#sb-grain)" />
    </svg>
  );
}

function Title({ id, title, script }: { id: string; title: string; script: string }) {
  return (
    <h2 id={id} className={styles.title}>
      {title}
      <span aria-hidden>{script}</span>
    </h2>
  );
}

// ---- 长文: lying on a cloud, writing ----

const ESSAYS_PATCH: Patch = {
  id: "essays-patch",
  shape:
    "M-20 600 C-70 420 30 230 200 160 C330 100 420 140 520 90 C640 30 820 20 960 60 C1110 100 1180 40 1280 120 C1380 200 1350 330 1300 420 C1250 520 1340 620 1300 740 C1250 880 1100 930 980 990 C850 1060 640 1060 480 1020 C330 980 230 1030 110 960 C10 900 30 760 -20 600 Z",
  washes: [
    ["#a8cbe6", 0.82, ""],
    ["#dcebf6", 0.55, "M-110 620 C-150 360 20 120 260 70 C520 10 700 -40 980 0 C1240 40 1420 160 1420 420 C1420 640 1440 860 1240 1000 C1040 1140 660 1150 400 1110 C150 1070 -80 920 -110 620 Z"],
    ["#cfe3f2", 0.8, "M150 540 C160 340 360 210 600 200 C860 190 1070 310 1100 520 C1120 700 960 820 700 840 C420 860 140 740 150 540 Z"],
    ["#f4cdbf", 0.6, "M40 840 C90 760 250 770 330 850 C390 910 300 990 190 985 C90 980 10 920 40 840 Z"],
    ["#a8cbe6", 0.8, "M1318 160 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M1352 236 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M-52 830 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M28 1046 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M1300 960 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0"],
  ],
  scene: BG_ESSAYS,
  place: "translate(-150 -40) scale(0.86)",
};

function EssaysPage({ locale, essays, total }: { locale: Locale; essays: Essay[]; total: number }) {
  const zh = locale === "zh";
  return (
    <BookPage label="writing" tone="#f8f4ea">
      <div className={styles.copy}>
        <Title id="writing" title={zh ? "长文" : "Essays"} script="Essays" />
        <p className={styles.line}>{zh ? "想得比较久的一些事，一篇写一件。" : "Things I've thought about for a while, one per essay."}</p>
        <ol className={styles.picks}>
          {essays.map((essay) => (
            <li key={essay.href}>
              <EraseLink href={essay.href}>
                <span className={styles.pick}>{essay.title}</span>
                <span className={styles.date}>{essay.date}</span>
              </EraseLink>
            </li>
          ))}
        </ol>
        <EraseLink href={`/${locale}/writing/`} className={styles.all}>
          {zh ? `全部 ${total} 篇长文` : `All ${total} essays`} →
        </EraseLink>
      </div>

      <Art drawing={WRITER} view="-90 -30 1440 1260" patch={ESSAYS_PATCH}>
        {/* pages that slipped off the cloud */}
        <g className={styles.falling} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round">
          <path fill={PAPER} transform="rotate(-18 1110 1110)" d="M1070 1080 h80 v60 h-80z" />
          <path fill="none" stroke={SOFT} strokeWidth={2.4} transform="rotate(-18 1110 1110)" d="M1084 1100 h46 M1084 1116 h32" />
          <path fill={PAPER} transform="rotate(22 150 1130)" d="M116 1104 h68 v50 h-68z" />
        </g>
      </Art>
    </BookPage>
  );
}

// ---- 项目: building little houses on a summer lawn ----

function ProjectsPage({ locale, exhibits }: { locale: Locale; exhibits: Exhibit[] }) {
  const zh = locale === "zh";
  return (
    <BookPage label="projects" tone="#f6efd9" flip>
      <Sky>
        <g filter="url(#sb-wash)">
          <path fill="#f7e2a8" opacity={0.6} d="M-80 -60 H1520 V300 C1200 260 900 340 600 300 C380 270 160 330 -80 290 Z" />
          <path fill="#cfe3b4" opacity={0.75} d="M-80 640 C240 590 560 660 900 620 C1160 590 1340 630 1520 610 V980 H-80 Z" />
          <path fill="#b6d397" opacity={0.6} d="M-80 790 C300 740 760 820 1100 770 C1300 742 1420 770 1520 760 V980 H-80 Z" />
        </g>
        <g fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round">
          <path className={styles.small} fill="#fffaf0" d="M1060 130 c10-16 34-16 44 0 c10-12 30-8 34 6 c14 0 18 18 4 20 h-92 c-14-2-12-24 10-26 z" />
          <g className={styles.small}>
            <path fill="#e9a6a0" d="M520 120 L560 80 L600 120 L560 170 Z" />
            <path d="M560 170 C550 210 580 240 560 290" />
            <path d="M556 200 l-10 6 M564 238 l10 4" />
          </g>
        </g>
      </Sky>

      <div className={styles.copy}>
        <Title id="projects" title={zh ? "项目" : "Projects"} script="Works" />
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
      </div>

      <Art drawing={BUILDER} view="0 120 1254 1080" />
    </BookPage>
  );
}

// ---- 我觉得: a circle of small monsters on the grass in the afternoon ----

function ThinkPage({ locale, things }: { locale: Locale; things: Thing[] }) {
  const zh = locale === "zh";
  return (
    <BookPage label="i-think" tone="#f7e3d6">
      <Sky>
        <g filter="url(#sb-wash)">
          <path fill="#f2c2a8" opacity={0.6} d="M-80 -60 H1520 V280 C1200 240 900 320 600 280 C380 250 160 310 -80 270 Z" />
          <path fill="#f6d9c4" opacity={0.6} d="M-80 260 C260 320 620 250 980 300 C1220 330 1380 290 1520 300 V560 C1200 520 860 590 520 550 C260 520 80 570 -80 540 Z" />
          <path fill="#d3e4bb" opacity={0.75} d="M-80 700 C260 650 620 720 980 680 C1220 654 1380 690 1520 676 V980 H-80 Z" />
        </g>
        <g className={styles.sun}>
          <circle cx="1260" cy="130" r="54" fill="#f6b97a" filter="url(#sb-fill)" />
          <circle cx="1260" cy="130" r="54" fill="none" stroke={INK} strokeWidth={1.4} />
        </g>
        <g fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round">
          <path className={styles.small} fill="#fffaf0" d="M640 90 c10-16 34-16 44 0 c10-12 30-8 34 6 c14 0 18 18 4 20 h-92 c-14-2-12-24 10-26 z" />
        </g>
      </Sky>

      <div className={styles.copy}>
        <Title id="i-think" title={zh ? "我觉得" : "I think"} script="I think" />
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
          {zh ? `全部 ${things.length} 条，看看我怎么说` : `All ${things.length}, read them`} →
        </EraseLink>
      </div>

      <Art drawing={CHAT} view="0 160 1254 960" />
    </BookPage>
  );
}

// ---- 关于: waving from the lake shore at dusk ----

function AboutPage({ locale, role, bio, email, github, x }: { locale: Locale; role: string; bio: string[]; email: string; github: string; x?: string }) {
  const zh = locale === "zh";
  return (
    <BookPage label="about" tone="#e6e1f1" flip>
      <Sky>
        <g filter="url(#sb-wash)">
          <path fill="#c4bde3" opacity={0.6} d="M-80 -60 H1520 V300 C1200 260 900 340 600 300 C380 270 160 330 -80 290 Z" />
          <path fill="#f1cfc8" opacity={0.6} d="M-80 300 C260 360 620 290 980 340 C1220 370 1380 330 1520 340 V620 H-80 Z" />
          <path fill="#a9cfd0" opacity={0.6} d="M-80 640 C260 620 620 660 980 630 C1220 610 1380 640 1520 630 V980 H-80 Z" />
        </g>
        <g fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round">
          <path className={styles.small} d="M1180 140 a40 40 0 1 0 30 70 a32 32 0 1 1 -30 -70z" fill="#f6e2a0" />
          <path stroke={SOFT} strokeWidth={1.1} d="M980 760 h60 M1120 800 h44 M260 790 h70 M140 830 h40" />
        </g>
      </Sky>

      <div className={styles.copy}>
        <Title id="about" title={zh ? "关于" : "About"} script="Hello" />
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
      </div>

      <Art drawing={LAKE} view="20 160 1234 1000" />
    </BookPage>
  );
}

type Props = {
  locale: Locale;
  essays: Essay[];
  exhibits: Exhibit[];
  things: Thing[];
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

export function StoryPages({ locale, essays, exhibits, things, role, bio, email, github, x }: Props) {
  return (
    <>
      <Filters />
      <EssaysPage locale={locale} essays={picks(essays)} total={essays.length} />
      <ProjectsPage locale={locale} exhibits={exhibits} />
      <ThinkPage locale={locale} things={things} />
      <AboutPage locale={locale} role={role} bio={bio} email={email} github={github} x={x} />
    </>
  );
}
