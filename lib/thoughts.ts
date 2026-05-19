import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/lib/i18n";

const thoughtRoot = path.join(process.cwd(), "content", "thoughts");

export type ThoughtStatus = "seed" | "linked" | "growing";
export type ThoughtRouteDecision = "merge-candidate" | "new-direction" | "undecided";

type RawThoughtFrontmatter = {
  articleSlug?: string;
  createdAt: string;
  routeDecision?: ThoughtRouteDecision;
  status?: ThoughtStatus;
  tags?: string[];
  title: string;
  updatedAt?: string;
};

export type ThoughtNoteListItem = {
  articleSlug?: string;
  createdAt: string;
  createdAtLabel: string;
  excerpt: string;
  locale: Locale;
  routeDecision: ThoughtRouteDecision;
  slug: string;
  status: ThoughtStatus;
  tags: string[];
  title: string;
  updatedAt?: string;
  updatedAtLabel?: string;
};

export type ThoughtNote = {
  content: string;
  locale: Locale;
  meta: ThoughtNoteListItem;
  slug: string;
};

async function readLocaleDirectory(locale: Locale) {
  const directory = path.join(thoughtRoot, locale);

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"));
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
}

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

function cleanMdx(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getExcerpt(content: string) {
  const clean = cleanMdx(content);
  if (clean.length <= 120) return clean;

  const window = clean.slice(0, 120);
  const breakpoint = Math.max(
    window.lastIndexOf("。"),
    window.lastIndexOf("；"),
    window.lastIndexOf(";"),
    window.lastIndexOf("."),
  );

  if (breakpoint > 60) {
    return `${window.slice(0, breakpoint + 1)}...`;
  }

  return `${window.trimEnd()}...`;
}

function normalizeStatus(status?: string): ThoughtStatus {
  if (status === "linked" || status === "growing" || status === "seed") {
    return status;
  }

  return "seed";
}

function normalizeDecision(decision?: string, articleSlug?: string): ThoughtRouteDecision {
  if (decision === "merge-candidate" || decision === "new-direction" || decision === "undecided") {
    return decision;
  }

  return articleSlug ? "merge-candidate" : "undecided";
}

function normalizeThought(slug: string, locale: Locale, source: string): ThoughtNote {
  const { content, data } = matter(source);
  const frontmatter = data as RawThoughtFrontmatter;
  const status = normalizeStatus(frontmatter.status);

  return {
    content,
    locale,
    slug,
    meta: {
      articleSlug: frontmatter.articleSlug,
      createdAt: frontmatter.createdAt,
      createdAtLabel: formatDate(frontmatter.createdAt, locale),
      excerpt: getExcerpt(content),
      locale,
      routeDecision: normalizeDecision(frontmatter.routeDecision, frontmatter.articleSlug),
      slug,
      status,
      tags: frontmatter.tags ?? [],
      title: frontmatter.title,
      updatedAt: frontmatter.updatedAt,
      updatedAtLabel: frontmatter.updatedAt
        ? formatDate(frontmatter.updatedAt, locale)
        : undefined,
    },
  };
}

async function readThoughtFile(locale: Locale, slug: string) {
  return fs.readFile(path.join(thoughtRoot, locale, `${slug}.mdx`), "utf8");
}

function sortThoughts<T extends { createdAt: string }>(thoughts: T[]) {
  return thoughts.toSorted((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export const getThoughtNotesByLocale = cache(async (locale: Locale): Promise<ThoughtNoteListItem[]> => {
  const files = await readLocaleDirectory(locale);
  const notes = await Promise.all(
    files.map(async (file) => {
      const slug = file.name.replace(/\.mdx$/, "");
      const source = await readThoughtFile(locale, slug);
      return normalizeThought(slug, locale, source).meta;
    }),
  );

  return sortThoughts(notes);
});

export const getThoughtNoteBySlug = cache(async (locale: Locale, slug: string): Promise<ThoughtNote | null> => {
  try {
    const source = await readThoughtFile(locale, slug);
    return normalizeThought(slug, locale, source);
  } catch {
    return null;
  }
});

export const getAllThoughtNotes = cache(async () => {
  const locales: Locale[] = ["zh", "en"];
  const entries = await Promise.all(locales.map((locale) => getThoughtNotesByLocale(locale)));

  return entries.flat();
});
