import type { ReactNode } from "react";
import type { Exhibit } from "@/lib/exhibits";
import type { Locale } from "@/lib/i18n";
import type { Thing } from "@/lib/i-think";
import { EraseLink } from "./eraser";
import type { Essay } from "./gallery";
import { BookPage } from "./storybook-page";
import { BG_ABOUT, BG_ESSAYS, BG_ITHINK, BG_PROJECTS, BUILDER, CHAT, LAKE, WRITER, type Drawing } from "./storybook-drawings";
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

const PROJECTS_PATCH: Patch = {
  id: "projects-patch",
  shape:
    "M-30 640 C-60 430 60 250 240 200 C380 160 470 220 600 170 C760 110 960 120 1120 220 C1260 310 1320 460 1290 610 C1270 720 1330 820 1260 930 C1180 1060 960 1110 740 1100 C560 1092 430 1140 260 1100 C80 1060 -10 900 -30 640 Z",
  washes: [
    ["#cfe3b4", 0.85, ""],
    ["#f7e8bf", 0.6, "M-120 660 C-150 400 40 150 300 110 C560 70 720 30 980 80 C1240 130 1420 300 1410 560 C1400 800 1440 1000 1220 1120 C1000 1240 640 1220 380 1190 C120 1160 -90 960 -120 660 Z"],
    ["#e6f0d6", 0.7, "M200 560 C220 400 420 300 640 300 C880 300 1060 400 1080 580 C1100 740 920 840 660 850 C400 860 180 740 200 560 Z"],
    ["#f2c14e", 0.45, "M1100 260 C1150 210 1250 230 1270 300 C1290 370 1210 410 1150 390 C1090 370 1060 310 1100 260 Z"],
    ["#cfe3b4", 0.8, "M-60 520 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M1310 700 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M1280 1010 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"],
  ],
  scene: BG_PROJECTS,
  place: "translate(1480 120) scale(-0.84 0.84)",
};

const THINK_PATCH: Patch = {
  id: "think-patch",
  shape:
    "M-20 600 C-50 400 80 230 260 190 C400 160 500 220 640 180 C800 130 1000 150 1150 260 C1290 360 1320 520 1280 650 C1250 760 1310 880 1220 980 C1110 1100 880 1110 680 1090 C500 1072 360 1120 200 1060 C40 1000 0 820 -20 600 Z",
  washes: [
    ["#f6cdb4", 0.82, ""],
    ["#fae4d4", 0.6, "M-120 620 C-160 360 30 120 300 80 C560 40 760 10 1000 60 C1250 110 1420 300 1400 560 C1380 800 1430 1000 1210 1110 C990 1220 640 1210 380 1180 C120 1150 -90 930 -120 620 Z"],
    ["#d3e4bb", 0.75, "M60 900 C220 840 520 860 760 880 C1000 900 1200 860 1250 920 C1290 980 1150 1060 900 1080 C640 1100 300 1100 140 1050 C40 1020 0 940 60 900 Z"],
    ["#f6cdb4", 0.8, "M-50 520 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M1320 420 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M1300 1020 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0"],
  ],
  scene: BG_ITHINK,
  place: "translate(-360 -40) scale(0.95)",
};

const ABOUT_PATCH: Patch = {
  id: "about-patch",
  shape:
    "M-10 620 C-40 420 80 240 260 190 C400 150 520 200 650 150 C810 90 1000 120 1140 230 C1270 330 1300 500 1260 640 C1230 760 1290 880 1200 980 C1090 1100 860 1110 660 1090 C480 1072 340 1120 190 1060 C30 1000 10 830 -10 620 Z",
  washes: [
    ["#c9dfe2", 0.85, ""],
    ["#ddd6ee", 0.65, "M-120 640 C-160 380 30 130 300 90 C560 50 760 10 1000 60 C1250 110 1420 300 1400 570 C1380 810 1430 1010 1210 1120 C990 1230 640 1220 380 1190 C120 1160 -90 940 -120 640 Z"],
    ["#f1cfc8", 0.55, "M260 300 C360 230 560 230 640 300 C700 360 620 420 480 420 C340 420 200 380 260 300 Z"],
    ["#c4dda5", 0.8, "M10 930 C180 860 520 880 760 900 C900 910 1060 960 1180 1010 C1230 1040 1150 1100 960 1110 C700 1124 360 1120 160 1080 C40 1056 -20 980 10 930 Z"],
    ["#c9dfe2", 0.8, "M-50 560 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M1300 380 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M1270 1020 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0"],
  ],
  scene: BG_ABOUT,
  place: "translate(-60 -120) scale(0.9)",
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
    <BookPage label="projects" tone="#f8f4ea" flip>
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

      <Art drawing={BUILDER} view="-120 40 1500 1200" patch={PROJECTS_PATCH} />
    </BookPage>
  );
}

// ---- 我觉得: a circle of small monsters on the grass in the afternoon ----

function ThinkPage({ locale, things }: { locale: Locale; things: Thing[] }) {
  const zh = locale === "zh";
  return (
    <BookPage label="i-think" tone="#f8f4ea">
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

      <Art drawing={CHAT} view="-120 80 1500 1140" patch={THINK_PATCH} />
    </BookPage>
  );
}

// ---- 关于: waving from the lake shore at dusk ----

function AboutPage({ locale, role, bio, email, github, x }: { locale: Locale; role: string; bio: string[]; email: string; github: string; x?: string }) {
  const zh = locale === "zh";
  return (
    <BookPage label="about" tone="#f8f4ea" flip>
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

      <Art drawing={{ ...LAKE, under: [] }} view="-110 60 1490 1170" patch={ABOUT_PATCH} />
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
