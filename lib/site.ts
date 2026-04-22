import { cache } from "react";
import type { Locale } from "@/lib/i18n";

type LocalizedString = Record<Locale, string>;

type Project = {
  slug: string;
  featured: boolean;
  link: string;
  stack: string[];
  status: LocalizedString;
  name: LocalizedString;
  summary: LocalizedString;
};

type ActivityItem = {
  time: string;
  text: LocalizedString;
};

type RawSiteContent = {
  name: string;
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
};

const dictionary = {
  zh: {
    nav: {
      brand: "personal_portfolio.sys",
      home: "首页",
      blog: "记录",
      contact: "联系",
    },
    home: {
      primaryCta: "进入博客",
      secondaryCta: "联系方式",
      primaryHref: "/zh/blog",
      projectCta: "read more",
      blogCta: "所有记录",
      readArticle: "阅读全文",
    },
    blog: {
      eyebrow: "writing.archive",
      title: "一些记录",
      description: "这里放课程学习、项目过程和一些暂时还没有整理成结论的想法。",
      metaTitle: "博客 | System Portfolio",
      metaDescription: "双语个人记录。",
      articleEyebrow: "article.node",
      nextRead: "继续阅读",
      backToIndex: "返回博客目录",
    },
    footer: {
      prompt: "root@portfolio:{locale}# connected",
    },
  },
  en: {
    nav: {
      brand: "personal_portfolio.sys",
      home: "Home",
      blog: "Blog",
      contact: "Contact",
    },
    home: {
      primaryCta: "Read Notes",
      secondaryCta: "Contact",
      primaryHref: "/en/blog",
      projectCta: "read more",
      blogCta: "all notes",
      readArticle: "open note",
    },
    blog: {
      eyebrow: "writing.archive",
      title: "Notes",
      description:
        "A small archive for coursework, project process, and ideas that are still unfinished.",
      metaTitle: "Blog | System Portfolio",
      metaDescription: "A bilingual personal notes archive.",
      articleEyebrow: "article.node",
      nextRead: "Next read",
      backToIndex: "Back to blog index",
    },
    footer: {
      prompt: "root@portfolio:{locale}# connected",
    },
  },
} satisfies Record<Locale, object>;

const rawSiteContent: RawSiteContent = {
  name: "Your Name",
  role: {
    zh: "北京大学信科学院大一学生 / Generalist Builder",
    en: "Freshman at Peking University EECS / Generalist Builder",
  },
  intro: {
    zh: "这里先简单放一点信息，之后再慢慢补完整。",
    en: "This stays intentionally light for now and can be replaced with a fuller introduction later.",
  },
  heroTitle: {
    zh: "一些项目，一些记录",
    en: "Projects And Notes",
  },
  heroTagline: {
    zh: "student / builder / notes",
    en: "student / builder / notes",
  },
  bio: {
    zh: "北京大学信科学院大一学生。现在主要在上课、做项目，也会记一点学习过程中的内容。",
    en: "Right now this is mostly a place for coursework, projects, and a few notes from things I am still learning.",
  },
  availability: {
    zh: "在读",
    en: "Student",
  },
  focus: {
    zh: "课程 / 小项目 / 随手记录",
    en: "Coursework / Small Projects / Notes",
  },
  location: {
    zh: "上海 / 远程协作",
    en: "Shanghai / Remote",
  },
  stackSummary: {
    zh: "Next.js + TypeScript + Tailwind",
    en: "Next.js + TypeScript + Tailwind",
  },
  writingFocus: {
    zh: "学习笔记 / 项目过程 / 杂记",
    en: "Study Notes / Build Logs / Misc",
  },
  quote: {
    zh: "先慢慢做，边做边学。",
    en: "Make things slowly and learn along the way.",
  },
  contactEmail: "hello@example.com",
  social: {
    github: "https://github.com/yourname",
    githubLabel: "yourname",
    linkedin: "https://www.linkedin.com/in/yourname",
    linkedinLabel: "yourname",
  },
  skills: ["Next.js", "TypeScript", "Tailwind CSS", "Design Systems", "MDX", "Performance"],
  projects: [
    {
      slug: "signal-core",
      featured: true,
      link: "https://example.com/signal-core",
      stack: ["Web", "Design", "Content"],
      status: {
        zh: "个人实验",
        en: "Personal experiment",
      },
      name: {
        zh: "个人主页系统",
        en: "Personal Site System",
      },
      summary: {
        zh: "把最开始的单文件草稿整理成一个能长期使用的双语个人站。",
        en: "A bilingual personal site grown out of an early single-file draft.",
      },
    },
    {
      slug: "ghost-terminal",
      featured: true,
      link: "https://example.com/ghost-terminal",
      stack: ["TypeScript", "UI", "Interaction"],
      status: {
        zh: "课程外探索",
        en: "Outside-class exploration",
      },
      name: {
        zh: "终端式交互实验",
        en: "Terminal Interaction Study",
      },
      summary: {
        zh: "一个把终端感交互放进网页里的小实验，主要是为了练习界面表达。",
        en: "A small experiment that borrows terminal-like interaction patterns for the web.",
      },
    },
    {
      slug: "neural-grid",
      featured: true,
      link: "https://example.com/neural-grid",
      stack: ["SVG", "Visual", "Prototype"],
      status: {
        zh: "视觉练习",
        en: "Visual study",
      },
      name: {
        zh: "黑白视觉原型",
        en: "Monochrome Visual Prototype",
      },
      summary: {
        zh: "一组黑白视觉练习，主要在试版式、层次和信息密度。",
        en: "A monochrome visual study for testing layout, hierarchy, and density.",
      },
    },
  ],
  activity: [
    {
      time: "10:15:23",
      text: {
        zh: "系统启动，加载主页骨架",
        en: "System boot, loading homepage shell",
      },
    },
    {
      time: "10:15:24",
      text: {
        zh: "同步项目与写作数据",
        en: "Syncing project and writing data",
      },
    },
    {
      time: "10:15:25",
      text: {
        zh: "渲染中心视觉与导航",
        en: "Rendering visual nucleus and navigation",
      },
    },
    {
      time: "10:15:26",
      text: {
        zh: "输出双语博客路由",
        en: "Generating bilingual blog routes",
      },
    },
    {
      time: "10:15:27",
      text: {
        zh: "等待真实内容替换",
        en: "Waiting for real content replacement",
      },
    },
  ],
};

function localize<T extends LocalizedString>(value: T, locale: Locale) {
  return value[locale];
}

export type Dictionary = (typeof dictionary)[Locale];

export type LocalizedProject = {
  slug: string;
  featured: boolean;
  link: string;
  stack: string[];
  status: string;
  name: string;
  summary: string;
};

export type SiteContent = {
  name: string;
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
    time: string;
    text: string;
  }[];
};

export const getDictionary = cache(async (locale: Locale) => dictionary[locale]);

export const getSiteContent = cache(async (locale: Locale): Promise<SiteContent> => ({
  name: rawSiteContent.name,
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
    featured: project.featured,
    link: project.link,
    stack: project.stack,
    status: localize(project.status, locale),
    name: localize(project.name, locale),
    summary: localize(project.summary, locale),
  })),
  activity: rawSiteContent.activity.map((item) => ({
    time: item.time,
    text: localize(item.text, locale),
  })),
}));
