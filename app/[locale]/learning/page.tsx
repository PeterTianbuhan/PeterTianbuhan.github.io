import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningGraphExplorer } from "@/components/learning/learning-graph-explorer";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Panel } from "@/components/ui/panel";
import { getLearningGraph } from "@/lib/learning-graph";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";

const pageCopy = {
  zh: {
    title: "学习星图",
    description: "把本地 MDX 笔记、主题和概念关系放在同一张浅色纸面上，先记录能继续生长的结构。",
    metaTitle: "学习星图 | Peter Tian",
    metaDescription: "以轻量关系图展示学习笔记之间的主题、概念和关联。",
    labels: {
      filters: "筛选",
      all: "全部",
      type: "类型",
      topic: "主题",
      tag: "标签",
      selected: "选中笔记",
      openNote: "阅读笔记",
      noSelection: "选择一个节点后，这里会显示笔记摘要。",
      empty: "学习星图正在生长，请耐心等待。",
      noFiltered: "当前筛选下还没有笔记。",
      relations: "学习笔记关系图",
      concepts: "概念",
      nodes: "节点",
      edges: "边",
    },
  },
  en: {
    title: "Learning Graph",
    description: "A quiet map for local MDX notes, topics, concepts, and links as the archive grows.",
    metaTitle: "Learning Graph | Peter Tian",
    metaDescription: "A lightweight graph view for study notes and their relationships.",
    labels: {
      filters: "Filters",
      all: "All",
      type: "Type",
      topic: "Topic",
      tag: "Tag",
      selected: "Selected note",
      openNote: "Open note",
      noSelection: "Select a node to see the note summary.",
      empty: "The learning graph is still growing. Please check back later.",
      noFiltered: "No notes match the current filters.",
      relations: "Learning note relationship graph",
      concepts: "Concepts",
      nodes: "Nodes",
      edges: "Edges",
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const copy = pageCopy[locale as Locale];

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
  };
}

export default async function LearningGraphPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, site, graph] = await Promise.all([
    getDictionary(typedLocale),
    getSiteContent(typedLocale),
    getLearningGraph(typedLocale),
  ]);
  const copy = pageCopy[typedLocale];

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <SiteHeader
          alternatePath={`/${typedLocale === "zh" ? "en" : "zh"}/learning`}
          dictionary={dictionary}
          locale={typedLocale}
        />

        <Panel className="boot-in px-6 py-8 sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            notes.graph
          </div>
          <h1 className="academic-serif mt-4 text-5xl font-normal leading-[0.98] tracking-normal text-[color:var(--ink)] sm:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-[44rem] text-base leading-8 text-[color:var(--text-soft)]">
            {copy.description}
          </p>
        </Panel>

        <LearningGraphExplorer graph={graph} labels={copy.labels} />

        <SiteFooter dictionary={dictionary} locale={typedLocale} site={site} />
      </div>
    </main>
  );
}
