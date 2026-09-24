import fs from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

// The pieces on the wall of the home page, most recent first. Each hangs in a
// hand-drawn frame with a small ink drawing (see components/home-sketch/vignettes).

type Text = Record<Locale, string>;

type RawExhibit = {
  slug: "onepku" | "aioj";
  name: string;
  year: string;
  medium: Text;
  summary: Text;
  role: Text;
  status: Text;
  honor?: Text;
  link?: { href: string; label: string };
};

const exhibits: RawExhibit[] = [
  {
    slug: "aioj",
    name: "AIOJ",
    year: "2026",
    medium: {
      zh: "在线评测与 AI 辅导 · Next.js · PostgreSQL · isolate 沙箱",
      en: "Online judge with AI tutoring · Next.js · PostgreSQL · isolate sandbox",
    },
    summary: {
      zh: "给信息学竞赛的学生和教练用的 OJ。除了做题和评测，我们还想把学生练习的过程记下来，比如一道题是怎么一步步改对的，整理好给 AI 用。AI 讲题已经挺强了，缺的是了解这个学生。",
      en: "An online judge for competitive-programming students and coaches. Beyond solving and judging, we want to record how students practise, like how a solution got fixed step by step, and organise it for AI to use. AI already explains problems well; what it lacks is knowing the student.",
    },
    honor: {
      zh: "北大信科 2026 年度「创新+」工作站立项项目，我是负责人",
      en: "A funded 2026 PKU EECS \"Innovation+\" project, which I lead",
    },
    role: {
      zh: "团队项目，我是主要开发者",
      en: "Team project; I'm the main developer",
    },
    status: {
      zh: "开发中，还没正式上线",
      en: "In development, not launched yet",
    },
  },
  {
    slug: "onepku",
    name: "OnePKU",
    year: "2026",
    medium: {
      zh: "桌面应用 · Tauri · Rust · React",
      en: "Desktop app · Tauri · Rust · React",
    },
    summary: {
      zh: "一个北大的校园小工具。一开始想做成北大版的 oneTHU，后来发现北大的网站不太统一，就挑了几个自己用得上的功能：看课程回放、存课件、看作业和成绩。",
      en: "A small PKU campus tool. It started as an attempt at a PKU version of oneTHU; PKU's sites turned out not to work the same way, so I picked the few features I use: lecture replays, course files, assignments and grades.",
    },
    role: {
      zh: "我一个人写的，也一直在维护",
      en: "Written, used and maintained by me",
    },
    status: {
      zh: "v0.1.0 已发布，Windows 版快了",
      en: "v0.1.0 out; Windows coming",
    },
    link: { href: "https://github.com/PeterTianbuhan/onePKU", label: "GitHub" },
  },
];

export type Exhibit = {
  slug: RawExhibit["slug"];
  name: string;
  year: string;
  medium: string;
  summary: string;
  role: string;
  status: string;
  honor?: string;
  link?: RawExhibit["link"];
};

export function getExhibits(locale: Locale): Exhibit[] {
  return exhibits.map((e) => ({
    slug: e.slug,
    name: e.name,
    year: e.year,
    medium: e.medium[locale],
    summary: e.summary[locale],
    role: e.role[locale],
    status: e.status[locale],
    honor: e.honor?.[locale],
    link: e.link,
  }));
}

export const exhibitSlugs = exhibits.map((e) => e.slug);

export function getExhibit(locale: Locale, slug: string) {
  return getExhibits(locale).find((e) => e.slug === slug);
}

// the longer write-up behind each piece, in content/projects/<locale>/<slug>.mdx
export async function getExhibitBody(locale: Locale, slug: string) {
  return fs.readFile(path.join(process.cwd(), "content", "projects", locale, `${slug}.mdx`), "utf8");
}
