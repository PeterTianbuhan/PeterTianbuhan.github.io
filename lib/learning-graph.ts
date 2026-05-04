import { cache } from "react";
import { getPostsByLocale, type PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export type LearningGraphNode = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  type: string;
  tags: string[];
  topics: string[];
  concepts: string[];
  publishedAtLabel: string;
};

export type LearningGraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: "related" | "concept" | "tag";
  label: string;
  weight: number;
};

export type LearningGraph = {
  nodes: LearningGraphNode[];
  edges: LearningGraphEdge[];
  filters: {
    types: string[];
    topics: string[];
    tags: string[];
  };
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );
}

function pairKey(left: string, right: string) {
  return [left, right].sort().join("__");
}

function addEdge(
  edgeMap: Map<string, LearningGraphEdge>,
  source: string,
  target: string,
  kind: LearningGraphEdge["kind"],
  label: string,
  weight: number,
) {
  if (source === target) {
    return;
  }

  const key = `${kind}:${pairKey(source, target)}:${label}`;
  const existing = edgeMap.get(key);

  if (!existing || existing.weight < weight) {
    edgeMap.set(key, {
      id: key,
      source,
      target,
      kind,
      label,
      weight,
    });
  }
}

function toNode(post: PostListItem, locale: Locale): LearningGraphNode {
  return {
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    href: `/${locale}/blog/${post.slug}`,
    type: post.type ?? (locale === "zh" ? "笔记" : "Note"),
    tags: post.tags,
    topics: post.topics,
    concepts: post.concepts,
    publishedAtLabel: post.publishedAtLabel,
  };
}

export const getLearningGraph = cache(async (locale: Locale): Promise<LearningGraph> => {
  const posts = await getPostsByLocale(locale);
  const nodes = posts.map((post) => toNode(post, locale));
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const edgeMap = new Map<string, LearningGraphEdge>();

  for (const post of posts) {
    for (const relatedSlug of post.related) {
      if (postsBySlug.has(relatedSlug)) {
        addEdge(edgeMap, post.slug, relatedSlug, "related", "related", 3);
      }
    }
  }

  for (let index = 0; index < posts.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < posts.length; nextIndex += 1) {
      const left = posts[index];
      const right = posts[nextIndex];
      const sharedConcepts = left.concepts.filter((concept) => right.concepts.includes(concept));
      const sharedTags = left.tags.filter((tag) => right.tags.includes(tag));

      for (const concept of sharedConcepts) {
        addEdge(edgeMap, left.slug, right.slug, "concept", concept, 2);
      }

      for (const tag of sharedTags) {
        addEdge(edgeMap, left.slug, right.slug, "tag", tag, 1);
      }
    }
  }

  return {
    nodes,
    edges: Array.from(edgeMap.values()).sort((left, right) => right.weight - left.weight),
    filters: {
      types: uniqueSorted(nodes.map((node) => node.type)),
      topics: uniqueSorted(nodes.flatMap((node) => node.topics)),
      tags: uniqueSorted(nodes.flatMap((node) => node.tags)),
    },
  };
});
