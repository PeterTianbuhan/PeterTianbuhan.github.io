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
      learning: "学习",
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
      incubatingProjects: "孵化中的项目",
      learningPath: "学习路径",
      learningSubtitle: "一张还在变化的学习与探索地图。",
      projectsTitle: "孵化中的项目",
      projectsSubtitle: "还不是成熟作品集，先记录正在打磨的方向。",
      latestNotes: "最新笔记",
      notesSubtitle: "课程笔记、构建日志和一些未完成的想法。",
      allProjects: "项目会慢慢填充",
      viewAll: "查看全部",
      githubSoon: "GitHub 待补充",
      aboutTitle: "关于",
      connectTitle: "联系",
      scroll: "向下看",
      detailedView: "详细视图",
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
      learning: "Learning",
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
      learningPath: "Learning Path",
      learningSubtitle: "A map of what I am learning and exploring.",
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
      detailedView: "Detailed view",
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
  contactEmail: "your.email@pku.edu.cn",
  social: {
    github: "https://github.com/oierpetertian",
    githubLabel: "github.com/oierpetertian",
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
      slug: "terminal-ui-lab",
      statusTone: "blue",
      logHref: "/blog",
      stack: ["Web", "TypeScript", "UI/UX"],
      status: { zh: "进行中", en: "In Progress" },
      name: { zh: "Terminal UI Lab", en: "Terminal UI Lab" },
      summary: {
        zh: "探索终端启发的网页界面，但保持轻、清楚、可读。",
        en: "Exploring terminal-inspired interfaces for the web.",
      },
      meta: { zh: "活跃 - 2026 年 4 月起", en: "Active - since Apr 2026" },
    },
    {
      slug: "personal-site-v2",
      statusTone: "amber",
      logHref: "/blog",
      stack: ["Next.js", "MDX", "Design"],
      status: { zh: "规划中", en: "Planning" },
      name: { zh: "Personal Site v2", en: "Personal Site v2" },
      summary: {
        zh: "把个人主页重建成清爽、双语、适合长期记录的站点。",
        en: "Rebuilding my personal site with a clean, bilingual, note-first design.",
      },
      meta: { zh: "即将开始", en: "Starting soon" },
    },
    {
      slug: "neural-activity-viz",
      statusTone: "green",
      logHref: "/blog",
      stack: ["Python", "Visualization", "Research"],
      status: { zh: "研究中", en: "Research" },
      name: { zh: "Neural Activity Viz", en: "Neural Activity Viz" },
      summary: {
        zh: "一个关于神经信号与模型可视化的想法，占位记录，等素材更成熟后补充。",
        en: "A placeholder for visualizing neural signals and models.",
      },
      meta: { zh: "探索想法", en: "Exploring ideas" },
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
  learningPath: LocalizedLearningStage[];
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
  learningPath: rawSiteContent.learningPath.map((stage) => ({
    number: stage.number,
    statusTone: stage.statusTone,
    title: localize(stage.title, locale),
    status: localize(stage.status, locale),
    summary: localize(stage.summary, locale),
    items: stage.items.map((item) => localize(item, locale)),
  })),
}));
