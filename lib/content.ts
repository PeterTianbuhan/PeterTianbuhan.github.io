import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/lib/i18n";

const contentRoot = path.join(process.cwd(), "content", "blog");
const draftRoot = path.join(process.cwd(), "content", "drafts");
// Explicit local design samples. Drafts never enter the production export.
const previewSlugs: string[] = [];

// 首页栏目 key（对应 life vault 的种类），由发布脚本从文件夹推导写入。
export type SectionKey = "thinking" | "learning" | "building" | "life";

type RawFrontmatter = {
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  featured: boolean;
  locale: Locale;
  translationKey: string;
  section?: SectionKey;
  series?: string;
};

export type PostListItem = {
  preview?: boolean;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  locale: Locale;
  translationKey: string;
  featured: boolean;
  section: SectionKey;
  series?: string;
  publishedAt: string;
  publishedAtLabel: string;
  updatedAt?: string;
  updatedAtLabel?: string;
};

export type Post = {
  slug: string;
  locale: Locale;
  content: string;
  meta: PostListItem;
};

async function readLocaleDirectory(locale: Locale) {
  const directory = path.join(contentRoot, locale);
  let entries;

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }

  return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"));
}

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(date));
}

function normalizePost(slug: string, locale: Locale, source: string): Post {
  const { content, data } = matter(source);
  const frontmatter = data as RawFrontmatter;

  return {
    slug,
    locale,
    content,
    meta: {
      slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      tags: frontmatter.tags ?? [],
      locale: frontmatter.locale,
      translationKey: frontmatter.translationKey,
      featured: Boolean(frontmatter.featured),
      section: frontmatter.section ?? "thinking",
      series: frontmatter.series,
      publishedAt: frontmatter.publishedAt,
      publishedAtLabel: formatDate(frontmatter.publishedAt, locale),
      updatedAt: frontmatter.updatedAt,
      updatedAtLabel: frontmatter.updatedAt
        ? formatDate(frontmatter.updatedAt, locale)
        : undefined,
    },
  };
}

async function readPostFile(locale: Locale, slug: string) {
  const filePath = path.join(contentRoot, locale, `${slug}.mdx`);
  try {
    return { source: await fs.readFile(filePath, "utf8"), preview: false };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT" || locale !== "zh" || !previewSlugs.includes(slug)) throw error;
    return {
      source: await fs.readFile(path.join(draftRoot, locale, `${slug}.mdx`), "utf8"),
      preview: true,
    };
  }
}

function sortPosts<T extends { publishedAt: string }>(posts: T[]) {
  return posts.toSorted((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

export const getPostsByLocale = cache(async (locale: Locale): Promise<PostListItem[]> => {
  const files = await readLocaleDirectory(locale);
  const slugs = new Set(files.map((file) => file.name.replace(/\.mdx$/, "")));
  if (locale === "zh") previewSlugs.forEach((slug) => slugs.add(slug));
  const posts = await Promise.all(
    [...slugs].map(async (slug) => {
      const { source, preview } = await readPostFile(locale, slug);
      return { ...normalizePost(slug, locale, source).meta, preview };
    }),
  );

  const featured = sortPosts(posts.filter((post) => post.featured));
  const rest = sortPosts(posts.filter((post) => !post.featured));

  return [...featured, ...rest];
});

export const getLatestPosts = cache(async (locale: Locale, limit = 3) => {
  const posts = await getPostsByLocale(locale);
  return posts.slice(0, limit);
});

export const getPostBySlug = cache(async (locale: Locale, slug: string): Promise<Post | null> => {
  try {
    const { source, preview } = await readPostFile(locale, slug);
    const post = normalizePost(slug, locale, source);
    post.meta.preview = preview;
    return post;
  } catch {
    return null;
  }
});

export const getAllPosts = cache(async () => {
  const locales: Locale[] = ["zh", "en"];
  const entries = await Promise.all(locales.map((locale) => getPostsByLocale(locale)));

  return entries.flat();
});

export const getPostTranslation = cache(async (translationKey: string, currentLocale: Locale) => {
  const targetLocale: Locale = currentLocale === "zh" ? "en" : "zh";
  const posts = await getPostsByLocale(targetLocale);
  return posts.find((post) => post.translationKey === translationKey) ?? null;
});

export const getRelatedPosts = cache(async (locale: Locale, currentSlug: string) => {
  const posts = await getPostsByLocale(locale);
  return posts.filter((post) => post.slug !== currentSlug).slice(0, 2);
});
