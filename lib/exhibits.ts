import fs from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

// The pieces on the wall of the home page, most recent first. Each hangs in a
// hand-drawn frame with a small ink drawing (see components/home-sketch/vignettes).

type Text = Record<Locale, string>;

type RawExhibit = {
  slug: "onepku" | "aioj" | "my-life";
  name: string | Text;
  year: string;
  summary: Text;
  link?: { href: string; label: string };
};

const exhibits: RawExhibit[] = [
  {
    slug: "aioj",
    name: "AIOJ",
    year: "2026",
    summary: {
      zh: "给信息学竞赛的学生和教练用的 OJ。除了做题和评测，我们还想把学生练习的过程记下来，比如一道题是怎么一步步改对的，整理好给 AI 用。AI 讲题已经挺强了，缺的是了解这个学生。",
      en: "An online judge for competitive-programming students and coaches. Beyond solving and judging, we want to record how students practise, like how a solution got fixed step by step, and organise it for AI to use. AI already explains problems well; what it lacks is knowing the student.",
    },
  },
  {
    slug: "onepku",
    name: "OnePKU",
    year: "2026",
    summary: {
      zh: "一个北大的校园小工具。一开始想做成北大版的 oneTHU，后来发现北大的网站不太统一，就挑了几个自己用得上的功能：看课程回放、存课件、看作业和成绩。",
      en: "A small PKU campus tool. It started as an attempt at a PKU version of oneTHU; PKU's sites turned out not to work the same way, so I picked the few features I use: lecture replays, course files, assignments and grades.",
    },
    link: { href: "https://github.com/PeterTianbuhan/onePKU", label: "GitHub" },
  },
  {
    slug: "my-life",
    name: { zh: "我的一生", en: "My Life" },
    year: "2026",
    summary: {
      zh: "想帮爷爷记录人生做的一个 App。不用会写，也不用会用 AI，打开以后说话就行，agent 会慢慢把讲的东西整理成时间线、人物和地点，都存在自己手机里。",
      en: "An app I made to help my grandpa record his life. You don't need to write or know how to use AI. Open it and talk, and an agent slowly sorts what you say into a timeline, people and places, all kept on your own phone.",
    },
    link: { href: "https://github.com/PeterTianbuhan/oral-history-agent", label: "GitHub" },
  },
];

export type Exhibit = {
  slug: RawExhibit["slug"];
  name: string;
  year: string;
  summary: string;
  link?: RawExhibit["link"];
};

export function getExhibits(locale: Locale): Exhibit[] {
  return exhibits.map((e) => ({
    slug: e.slug,
    name: typeof e.name === "string" ? e.name : e.name[locale],
    year: e.year,
    summary: e.summary[locale],
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
