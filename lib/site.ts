import { cache } from "react";
import type { Locale } from "@/lib/i18n";

type LocalizedString = Record<Locale, string>;

type Project = {
  slug: string;
  statusTone: "blue" | "amber" | "green";
  link?: string;
  logHref: string;
  stack: string[];
  status: LocalizedString;
  name: LocalizedString;
  summary: LocalizedString;
  meta: LocalizedString;
};

type ActivityItem = {
  type: LocalizedString;
  text: LocalizedString;
  time: LocalizedString;
};

type LearningStage = {
  number: string;
  statusTone: "current" | "next" | "later" | "future";
  title: LocalizedString;
  status: LocalizedString;
  summary: LocalizedString;
  items: LocalizedString[];
};

type RawSiteContent = {
  name: string;
  shortMark: string;
  role: LocalizedString;
  intro: LocalizedString;
  heroTitle: LocalizedString;
  heroTagline: LocalizedString;
  bio: LocalizedString;
  availability: LocalizedString;
  focus: LocalizedString;
  location: LocalizedString;
  stackSummary: LocalizedString;
  writingFocus: LocalizedString;
  quote: LocalizedString;
  contactEmail: string;
  social: {
    github: string;
    githubLabel: string;
    linkedin: string;
    linkedinLabel: string;
  };
  skills: string[];
  projects: Project[];
  activity: ActivityItem[];
  learningPath: LearningStage[];
};

const dictionary = {
  zh: {
    nav: {
      brand: "Peter Tian",
      home: "首页",
      blog: "笔记",
      thoughts: "随想",
      projects: "项目",
      contact: "关于",
    },
    home: {
      primaryCta: "浏览笔记",
      secondaryCta: "关于我",
      primaryHref: "/zh/blog",
      projectCta: "构建记录",
      blogCta: "学习笔记",
      readArticle: "阅读",
      recentPath: "近期轨迹",
      incubatingProjects: "项目入口",
      projectsTitle: "正在维护的项目",
      projectsSubtitle: "只保留有明确公开产物或仓库的项目，工作流和方法论放回阅读地图。",
      latestNotes: "最新笔记",
      notesSubtitle: "课程笔记、构建日志和一些未完成的想法。",
      allProjects: "保留明确产物",
      viewAll: "查看全部",
      githubSoon: "GitHub 待补充",
      aboutTitle: "关于",
      connectTitle: "联系",
      scroll: "向下看",
      allNotes: "全部笔记",
      moreNotes: "更多笔记",
      footerNote: "慢慢来，比较快。",
    },
    blog: {
      eyebrow: "notes.archive",
      title: "笔记",
      description: "这里放课程学习、项目过程和一些暂时还没有整理成结论的想法。",
      metaTitle: "笔记 | Peter Tian",
      metaDescription: "课程学习、项目过程和随想。",
      articleEyebrow: "note",
      nextRead: "继续阅读",
      backToIndex: "返回笔记",
    },
    footer: {
      prompt: "Built with Next.js and MDX",
    },
  },
  en: {
    nav: {
      brand: "Peter Tian",
      home: "Home",
      blog: "Notes",
      thoughts: "Thoughts",
      projects: "Projects",
      contact: "About",
    },
    home: {
      primaryCta: "Browse Notes",
      secondaryCta: "About Me",
      primaryHref: "/en/blog",
      projectCta: "Build Log",
      blogCta: "Study Notes",
      readArticle: "Read",
      recentPath: "Recent Path",
      incubatingProjects: "Incubating Projects",
      projectsTitle: "Incubating Projects",
      projectsSubtitle: "Projects I am working on outside class.",
      latestNotes: "Latest Notes",
      notesSubtitle: "Study notes, build logs, and thoughts.",
      allProjects: "All projects",
      viewAll: "View all",
      githubSoon: "GitHub soon",
      aboutTitle: "About",
      connectTitle: "Let's connect",
      scroll: "Scroll to explore",
      allNotes: "All notes",
      moreNotes: "More notes",
      footerNote: "Make things slowly and learn along the way.",
    },
    blog: {
      eyebrow: "notes.archive",
      title: "Notes",
      description:
        "A small archive for coursework, project process, and ideas that are still unfinished.",
      metaTitle: "Notes | Peter Tian",
      metaDescription: "Study notes, build logs, and thoughts.",
      articleEyebrow: "note",
      nextRead: "Next read",
      backToIndex: "Back to notes",
    },
    footer: {
      prompt: "Built with Next.js and MDX",
    },
  },
};

const rawSiteContent: RawSiteContent = {
  name: "Peter Tian",
  shortMark: "PKU EECS '28",
  role: {
    zh: "北京大学信息科学技术学院大一学生",
    en: "Freshman at Peking University EECS",
  },
  intro: {
    zh: "一个放课程、小项目、构建笔记和未完成想法的个人主页。",
    en: "A personal log of coursework, small projects, build notes, and unfinished thoughts.",
  },
  heroTitle: {
    zh: "公开学习，慢慢构建。",
    en: "Learning in public, building slowly.",
  },
  heroTagline: {
    zh: "Be patient, keep shipping.",
    en: "Be patient, keep shipping.",
  },
  bio: {
    zh: "在北京大学学习，把阶段性的理解留给未来的自己，也留给偶然路过的人。",
    en: "Made at Peking University, shared for future me and anyone curious.",
  },
  availability: {
    zh: "在读",
    en: "Student",
  },
  focus: {
    zh: "课程 / 系统 / 界面 / AI 工具",
    en: "Coursework / Systems / Interfaces / AI tools",
  },
  location: {
    zh: "北京 / 上海",
    en: "Beijing / Shanghai",
  },
  stackSummary: {
    zh: "Next.js + TypeScript + MDX",
    en: "Next.js + TypeScript + MDX",
  },
  writingFocus: {
    zh: "学习笔记 / 构建日志 / 随想",
    en: "Study notes / Build logs / Thoughts",
  },
  quote: {
    zh: "慢慢来，比较快。",
    en: "Make things slowly and learn along the way.",
  },
  contactEmail: "oierpetertian@gmail.com",
  social: {
    github: "https://github.com/PeterTianbuhan",
    githubLabel: "github.com/PeterTianbuhan",
    linkedin: "https://www.linkedin.com/",
    linkedinLabel: "to be filled",
  },
  skills: ["Discrete Math", "Data Structures", "Systems", "Interfaces", "TypeScript", "MDX"],
  activity: [
    {
      type: { zh: "阅读", en: "Reading" },
      text: { zh: "CS61A - Environment Model", en: "CS61A - Environment Model" },
      time: { zh: "今天", en: "Today" },
    },
    {
      type: { zh: "构建", en: "Building" },
      text: { zh: "Personal UI experiment", en: "Personal UI experiment" },
      time: { zh: "昨天", en: "Yesterday" },
    },
    {
      type: { zh: "笔记", en: "Note" },
      text: { zh: "What I learned about latency", en: "What I learned about latency" },
      time: { zh: "5 月 1 日", en: "May 1" },
    },
    {
      type: { zh: "课程", en: "Coursework" },
      text: { zh: "Linear Algebra HW", en: "Linear Algebra HW" },
      time: { zh: "4 月 30 日", en: "Apr 30" },
    },
    {
      type: { zh: "想法", en: "Idea" },
      text: { zh: "Visualize neural activity", en: "Visualize neural activity" },
      time: { zh: "4 月 28 日", en: "Apr 28" },
    },
  ],
  learningPath: [
    {
      number: "1",
      statusTone: "current",
      title: { zh: "基础", en: "Foundations" },
      status: { zh: "现在", en: "Now" },
      summary: {
        zh: "先把数学、CS 基础和系统概念打牢。",
        en: "Building the fundamentals in math, CS, and systems.",
      },
      items: [
        { zh: "离散数学", en: "Discrete Math" },
        { zh: "数据结构", en: "Data Structures" },
        { zh: "计算机系统", en: "Computer Systems" },
      ],
    },
    {
      number: "2",
      statusTone: "next",
      title: { zh: "系统", en: "Systems" },
      status: { zh: "下一步", en: "Next" },
      summary: {
        zh: "理解工具、网络、数据库和软件如何组织起来。",
        en: "Going deeper into how useful systems are built.",
      },
      items: [
        { zh: "操作系统", en: "Operating Systems" },
        { zh: "计算机网络", en: "Computer Networks" },
        { zh: "数据库", en: "Databases" },
      ],
    },
    {
      number: "3",
      statusTone: "later",
      title: { zh: "界面", en: "Interfaces" },
      status: { zh: "稍后", en: "Later" },
      summary: {
        zh: "把可用、克制、长期维护的界面做出来。",
        en: "Designing and building usable, elegant interfaces.",
      },
      items: [
        { zh: "Web Development", en: "Web Development" },
        { zh: "UI / UX Basics", en: "UI / UX Basics" },
        { zh: "Interaction Design", en: "Interaction Design" },
      ],
    },
    {
      number: "4",
      statusTone: "future",
      title: { zh: "研究问题", en: "Research Questions" },
      status: { zh: "未来", en: "Future" },
      summary: {
        zh: "把值得长期追的题目留下来，慢慢验证。",
        en: "Exploring questions worth investing more time in.",
      },
      items: [
        { zh: "ML & Systems", en: "ML & Systems" },
        { zh: "Human-Computer Interaction", en: "Human-Computer Interaction" },
        { zh: "Open Problems", en: "Open Problems" },
      ],
    },
  ],
  projects: [
    {
      slug: "homepage",
      statusTone: "blue",
      link: "https://github.com/PeterTianbuhan/PeterTianbuhan.github.io",
      logHref: "/blog/current-workflow",
      stack: ["Next.js", "MDX", "GitHub Pages"],
      status: { zh: "更新中", en: "Evolving" },
      name: { zh: "个人主页", en: "Personal Homepage" },
      summary: {
        zh: "当前正在使用的个人网站，用来展示笔记、学习记录、项目进展和阶段性复盘。",
        en: "The personal site I am using for notes, learning records, project updates, and retrospectives.",
      },
      meta: { zh: "已上线 - petertianwork.me", en: "Live - petertianwork.me" },
    },
    {
      slug: "attention-memory",
      statusTone: "green",
      link: "https://github.com/PeterTianbuhan/attention-memory",
      logHref: "/blog/attention-memory-development-record",
      stack: ["Codex", "Markdown", "Project Memory"],
      status: { zh: "已发布", en: "Published" },
      name: { zh: "Attention Memory", en: "Attention Memory" },
      summary: {
        zh: "一套只用 AGENTS.md、goal.md、memory.md 和 archive 维护项目记忆的轻量化约定。",
        en: "A lightweight project-memory convention using AGENTS.md, goal.md, memory.md, and an archive.",
      },
      meta: { zh: "已整理成公开仓库", en: "Published as a public repository" },
    },
  ],
};

function localize<T extends LocalizedString>(value: T, locale: Locale) {
  return value[locale];
}

export type Dictionary = (typeof dictionary)[Locale];

export type LocalizedProject = {
  slug: string;
  statusTone: Project["statusTone"];
  link?: string;
  logHref: string;
  stack: string[];
  status: string;
  name: string;
  summary: string;
  meta: string;
};

export type LocalizedLearningStage = {
  number: string;
  statusTone: LearningStage["statusTone"];
  title: string;
  status: string;
  summary: string;
  items: string[];
};

export type SiteContent = {
  name: string;
  shortMark: string;
  role: string;
  intro: string;
  heroTitle: string;
  heroTagline: string;
  bio: string;
  availability: string;
  focus: string;
  location: string;
  stackSummary: string;
  writingFocus: string;
  quote: string;
  contactEmail: string;
  social: RawSiteContent["social"];
  skills: string[];
  projects: LocalizedProject[];
  activity: {
    type: string;
    time: string;
    text: string;
  }[];
};

export const getDictionary = cache(async (locale: Locale) => dictionary[locale]);

export const getSiteContent = cache(async (locale: Locale): Promise<SiteContent> => ({
  name: rawSiteContent.name,
  shortMark: rawSiteContent.shortMark,
  role: localize(rawSiteContent.role, locale),
  intro: localize(rawSiteContent.intro, locale),
  heroTitle: localize(rawSiteContent.heroTitle, locale),
  heroTagline: localize(rawSiteContent.heroTagline, locale),
  bio: localize(rawSiteContent.bio, locale),
  availability: localize(rawSiteContent.availability, locale),
  focus: localize(rawSiteContent.focus, locale),
  location: localize(rawSiteContent.location, locale),
  stackSummary: localize(rawSiteContent.stackSummary, locale),
  writingFocus: localize(rawSiteContent.writingFocus, locale),
  quote: localize(rawSiteContent.quote, locale),
  contactEmail: rawSiteContent.contactEmail,
  social: rawSiteContent.social,
  skills: rawSiteContent.skills,
  projects: rawSiteContent.projects.map((project) => ({
    slug: project.slug,
    statusTone: project.statusTone,
    link: project.link,
    logHref: project.logHref,
    stack: project.stack,
    status: localize(project.status, locale),
    name: localize(project.name, locale),
    summary: localize(project.summary, locale),
    meta: localize(project.meta, locale),
  })),
  activity: rawSiteContent.activity.map((item) => ({
    type: localize(item.type, locale),
    time: localize(item.time, locale),
    text: localize(item.text, locale),
  })),
}));
