import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/lib/i18n";

const showcasesRoot = path.join(process.cwd(), "content", "showcases");

type LocalizedString = Record<Locale, string>;

export type ShowcaseChapterMeta = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  kind: string;
};

export type ShowcaseMeta = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  command: string;
  label: string;
  chapters: ShowcaseChapterMeta[];
};

export type ShowcaseChapter = ShowcaseChapterMeta & {
  content: string;
  showcaseSlug: string;
};

type RawChapter = {
  slug: string;
  file: string;
  number: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  kind: string;
};

type RawShowcaseMeta = {
  slug: string;
  title: LocalizedString;
  tagline: LocalizedString;
  description: LocalizedString;
  command: string;
  label: LocalizedString;
  chapters: RawChapter[];
};

function localize(value: LocalizedString, locale: Locale) {
  return value[locale];
}

export const getShowcaseMeta = cache(
  async (slug: string, locale: Locale): Promise<ShowcaseMeta | null> => {
    try {
      const filePath = path.join(showcasesRoot, slug, "meta.json");
      const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as RawShowcaseMeta;

      return {
        slug: raw.slug,
        title: localize(raw.title, locale),
        tagline: localize(raw.tagline, locale),
        description: localize(raw.description, locale),
        command: raw.command,
        label: localize(raw.label, locale),
        chapters: raw.chapters.map((chapter) => ({
          slug: chapter.slug,
          number: chapter.number,
          title: localize(chapter.title, locale),
          subtitle: localize(chapter.subtitle, locale),
          kind: chapter.kind,
        })),
      };
    } catch {
      return null;
    }
  },
);

export const getShowcaseChapter = cache(
  async (
    showcaseSlug: string,
    chapterSlug: string,
  ): Promise<ShowcaseChapter | null> => {
    const locales: Locale[] = ["zh", "en"];
    for (const locale of locales) {
      const meta = await getShowcaseMeta(showcaseSlug, locale);
      if (!meta) continue;
      const chapterMeta = meta.chapters.find((c) => c.slug === chapterSlug);
      if (!chapterMeta) continue;

      const rawPath = path.join(showcasesRoot, showcaseSlug, "meta.json");
      const raw = JSON.parse(await fs.readFile(rawPath, "utf8")) as RawShowcaseMeta;
      const rawChapter = raw.chapters.find((c) => c.slug === chapterSlug);
      if (!rawChapter) continue;

      const source = await fs.readFile(
        path.join(showcasesRoot, showcaseSlug, rawChapter.file),
        "utf8",
      );
      const { content } = matter(source);

      return {
        ...chapterMeta,
        content,
        showcaseSlug,
      };
    }
    return null;
  },
);

function stripLeadingHeading(source: string) {
  return source
    .trimStart()
    .replace(/^#\s+.+\n+/, "")
    .replace(/^>\s+.+\n+/, "")
    .trimStart();
}

export const getShowcaseChapterSource = cache(
  async (
    showcaseSlug: string,
    chapterSlug: string,
    locale: Locale,
  ): Promise<string | null> => {
    const meta = await getShowcaseMeta(showcaseSlug, locale);
    if (!meta) return null;

    const rawPath = path.join(showcasesRoot, showcaseSlug, "meta.json");
    const raw = JSON.parse(await fs.readFile(rawPath, "utf8")) as RawShowcaseMeta;
    const rawChapter = raw.chapters.find((c) => c.slug === chapterSlug);
    if (!rawChapter) return null;

    try {
      const source = await fs.readFile(
        path.join(showcasesRoot, showcaseSlug, rawChapter.file),
        "utf8",
      );
      return stripLeadingHeading(matter(source).content);
    } catch {
      return null;
    }
  },
);

export const AGENT_NOTES_SLUG = "agent-notes";
