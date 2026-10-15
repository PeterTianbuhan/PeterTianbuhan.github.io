import { cache } from "react";
import type { Locale } from "@/lib/i18n";

type LocalizedString = Record<Locale, string>;

type RawSiteContent = {
  name: string;
  role: LocalizedString;
  bio: Record<Locale, string[]>;
  contactEmail: string;
  social: {
    github: string;
    x?: string;
  };
};

const rawSiteContent: RawSiteContent = {
  name: "Peter Tian",
  role: {
    zh: "北京大学信息科学技术学院 2029 届",
    en: "Peking University EECS, Class of 2029",
  },
  bio: {
    zh: [
      "我经常冒出一些好玩的想法，会想把它们写下来，这里的长文大多是这么来的。我挺相信这辈子人的寿命会有不小的延长，所以觉得自己还在人生的孩童期，不太着急。",
      "最近大部分时间在做 AIOJ，也在琢磨怎么让一群 agent 好好干活。",
      "如果让我介绍自己，我会说我是个很神奇的人。",
    ],
    en: [
      "I often have ideas that seem fun, and I want to write them down. Most of the essays here started that way. I fairly strongly believe people will live a good deal longer within my lifetime, so I think of myself as still in the childhood of my life, and I'm not in a hurry.",
      "Lately I spend most of my time on AIOJ, and on working out how to get a crowd of agents to do good work.",
      "If I had to describe myself, I'd say I'm a pretty magical person.",
    ],
  },
  contactEmail: "oierpetertian@gmail.com",
  social: {
    github: "https://github.com/PeterTianbuhan",
    x: "https://x.com/Peter_Lee1015",
  },
};

export type SiteContent = {
  name: string;
  role: string;
  bio: string[];
  contactEmail: string;
  social: RawSiteContent["social"];
};

export const getSiteContent = cache(async (locale: Locale): Promise<SiteContent> => ({
  name: rawSiteContent.name,
  role: rawSiteContent.role[locale],
  bio: rawSiteContent.bio[locale],
  contactEmail: rawSiteContent.contactEmail,
  social: rawSiteContent.social,
}));
