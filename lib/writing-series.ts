import type { Locale } from "@/lib/i18n";

type WritingSeries = {
  id: string;
  showWhenEmpty?: boolean;
} & Record<Locale, { title: string; description: string }>;

export const writingSeries: WritingSeries[] = [{
  id: "thought-wanderings",
  zh: {
    title: "思想漫游",
    description: "从一个念头出发，暂时走远一点。想象技术、世界，以及我们还可能拥有的生活。",
  },
  en: {
    title: "Thought Wanderings",
    description: "Start with a thought and wander a little further. Imagine technology, the world, and the lives we might yet lead.",
  },
}, {
  id: "understanding-agents",
  showWhenEmpty: true,
  zh: {
    title: "我对 Agent 的理解",
    description: "我如何使用 Agent，它与模型的关系，构建智能体的思考，以及对未来智能的想象。",
  },
  en: {
    title: "How I Understand Agents",
    description: "How I use agents, their relationship with models, thoughts on building them, and how I imagine the future of intelligence.",
  },
}];

export function getWritingSeries(id: string | undefined, locale: Locale) {
  const series = writingSeries.find((item) => item.id === id);
  return series ? { id: series.id, ...series[locale] } : undefined;
}
