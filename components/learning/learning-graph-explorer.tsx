"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LearningGraph, LearningGraphEdge, LearningGraphNode } from "@/lib/learning-graph";

type Labels = {
  filters: string;
  all: string;
  type: string;
  topic: string;
  tag: string;
  selected: string;
  openNote: string;
  noSelection: string;
  empty: string;
  noFiltered: string;
  relations: string;
  concepts: string;
  nodes: string;
  edges: string;
};

type DisplayNode = LearningGraphNode & {
  isPlaceholder?: boolean;
  status: string;
  x: number;
  y: number;
};

type DisplayEdge = LearningGraphEdge & {
  isPlaceholder?: boolean;
};

type ViewMode = "graph" | "list";

function isZh(labels: Labels) {
  return labels.all === "全部";
}

function placeholderNodes(labels: Labels): Array<Omit<DisplayNode, "x" | "y">> {
  const zh = isZh(labels);

  return zh
    ? [
        {
          id: "placeholder-cs61a",
          slug: "placeholder-cs61a",
          title: "[占位] CS61A 笔记 - Environment Model",
          excerpt: "占位笔记，用来展示课程笔记未来会如何接入星图和右侧详情。",
          href: "#",
          type: "课程笔记",
          tags: ["占位", "Python", "Environment"],
          topics: ["算法", "系统"],
          concepts: ["环境模型", "函数调用"],
          publishedAtLabel: "2026-05-03",
          isPlaceholder: true,
          status: "待补真实内容",
        },
        {
          id: "placeholder-performance",
          slug: "placeholder-performance",
          title: "[占位] 延迟与系统性能",
          excerpt: "占位概念卡片，用来连接项目记录、工具链和系统性能相关笔记。",
          href: "#",
          type: "概念理解",
          tags: ["占位", "性能", "系统"],
          topics: ["系统", "工程实践"],
          concepts: ["延迟", "吞吐", "持续改进"],
          publishedAtLabel: "2026-05-01",
          isPlaceholder: true,
          status: "占位",
        },
        {
          id: "placeholder-ui-lab",
          slug: "placeholder-ui-lab",
          title: "[占位] Notebook UI Lab",
          excerpt: "占位项目记录，用来说明界面实验、笔记组织和产品判断之间的关系。",
          href: "#",
          type: "项目记录",
          tags: ["占位", "前端", "工具链"],
          topics: ["前端", "工具链"],
          concepts: ["信息架构", "可读性"],
          publishedAtLabel: "2026-04-26",
          isPlaceholder: true,
          status: "设计中",
        },
        {
          id: "placeholder-product",
          slug: "placeholder-product",
          title: "[占位] 为什么我选择做产品而不做纯研究",
          excerpt: "占位随想，用来放未来的学习选择、项目取舍和阶段复盘。",
          href: "#",
          type: "随想",
          tags: ["占位", "学习方法"],
          topics: ["学习方法"],
          concepts: ["产品判断", "反馈闭环"],
          publishedAtLabel: "2026-04-18",
          isPlaceholder: true,
          status: "草稿",
        },
      ]
    : [
        {
          id: "placeholder-cs61a",
          slug: "placeholder-cs61a",
          title: "[Placeholder] CS61A Notes - Environment Model",
          excerpt: "Placeholder note showing how course notes will connect to the graph and detail panel.",
          href: "#",
          type: "Course note",
          tags: ["Placeholder", "Python", "Environment"],
          topics: ["Algorithms", "Systems"],
          concepts: ["Environment model", "Function calls"],
          publishedAtLabel: "2026-05-03",
          isPlaceholder: true,
          status: "Waiting for real note",
        },
        {
          id: "placeholder-performance",
          slug: "placeholder-performance",
          title: "[Placeholder] Latency and System Performance",
          excerpt: "Placeholder concept card for connecting project logs, tooling, and systems notes.",
          href: "#",
          type: "Concept",
          tags: ["Placeholder", "Performance", "Systems"],
          topics: ["Systems", "Engineering"],
          concepts: ["Latency", "Throughput", "Iteration"],
          publishedAtLabel: "2026-05-01",
          isPlaceholder: true,
          status: "Placeholder",
        },
        {
          id: "placeholder-ui-lab",
          slug: "placeholder-ui-lab",
          title: "[Placeholder] Notebook UI Lab",
          excerpt: "Placeholder project log for interface experiments, note organization, and product judgment.",
          href: "#",
          type: "Project log",
          tags: ["Placeholder", "Frontend", "Tooling"],
          topics: ["Frontend", "Tooling"],
          concepts: ["Information architecture", "Readability"],
          publishedAtLabel: "2026-04-26",
          isPlaceholder: true,
          status: "Designing",
        },
        {
          id: "placeholder-product",
          slug: "placeholder-product",
          title: "[Placeholder] Why I Choose Product Work",
          excerpt: "Placeholder reflection for future learning choices, project tradeoffs, and retrospectives.",
          href: "#",
          type: "Reflection",
          tags: ["Placeholder", "Learning"],
          topics: ["Learning method"],
          concepts: ["Product judgment", "Feedback loop"],
          publishedAtLabel: "2026-04-18",
          isPlaceholder: true,
          status: "Draft",
        },
      ];
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );
}

function buildDisplayEdges(
  nodes: Array<Omit<DisplayNode, "x" | "y">>,
  graph: LearningGraph,
): DisplayEdge[] {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const existing: DisplayEdge[] = graph.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );
  const generated: DisplayEdge[] = [];
  const realAnchor = nodes.find((node) => !node.isPlaceholder)?.id ?? nodes[0]?.id;

  for (const node of nodes) {
    if (node.isPlaceholder && realAnchor && node.id !== realAnchor) {
      generated.push({
        id: `placeholder:${realAnchor}:${node.id}`,
        source: realAnchor,
        target: node.id,
        kind: node.type.includes("概念") || node.type.includes("Concept") ? "concept" : "tag",
        label: "placeholder",
        weight: 1,
        isPlaceholder: true,
      });
    }
  }

  return [...existing, ...generated];
}

function positionNodes(nodes: Array<Omit<DisplayNode, "x" | "y">>, selectedId: string): DisplayNode[] {
  if (nodes.length === 0) {
    return [];
  }

  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const rest = nodes.filter((node) => node.id !== selected.id);
  const center = { ...selected, x: 360, y: 245 };

  return [
    center,
    ...rest.map((node, index) => {
      const angle = (index / Math.max(rest.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const wide = index % 2 === 0 ? 220 : 190;
      const tall = index % 2 === 0 ? 155 : 180;

      return {
        ...node,
        x: 360 + Math.cos(angle) * wide,
        y: 245 + Math.sin(angle) * tall,
      };
    }),
  ];
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
  allLabel,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="mono text-[10px] uppercase text-[color:var(--text-muted)]">{label}</span>
      <select
        className="w-full border border-[color:var(--rule)] bg-[color:var(--surface)] px-3 py-2 text-sm leading-6 text-[color:var(--ink-soft)] outline-none transition focus:border-[color:var(--accent)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LearningGraphExplorer({
  graph,
  labels,
}: {
  graph: LearningGraph;
  labels: Labels;
}) {
  const zh = isZh(labels);
  const copy = {
    sidebarTitle: zh ? "学习星图" : "Learning Graph",
    categories: zh ? "类型" : "Types",
    themes: zh ? "主题" : "Themes",
    view: zh ? "视图" : "View",
    graphView: zh ? "星图视图" : "Graph view",
    listView: zh ? "列表视图" : "List view",
    placeholderHint: zh
      ? "带 [占位] 的词条用于表达后续内容组织方式。"
      : "Items marked [Placeholder] show the future organization model.",
    current: zh ? "当前选择" : "Current selection",
    summary: zh ? "摘要" : "Summary",
    status: zh ? "状态" : "Status",
    related: zh ? "相关笔记" : "Related notes",
    openDisabled: zh ? "占位笔记暂无正文" : "Placeholder note has no page yet",
    legend: zh ? "连线说明" : "Legend",
    solid: zh ? "显式相关" : "Explicit link",
    concept: zh ? "共享概念" : "Shared concept",
    tag: zh ? "共享标签/占位" : "Shared tag/placeholder",
    listHeading: zh ? "筛选后的笔记列表" : "Filtered notes",
    readNote: zh ? "阅读笔记" : "Read note",
    placeholderBadge: zh ? "占位 / 暂无正文" : "Placeholder / no body yet",
    realNote: zh ? "真实笔记" : "Published note",
  };
  const [selectedType, setSelectedType] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(graph.nodes[0]?.id ?? "placeholder-cs61a");
  const [viewMode, setViewMode] = useState<ViewMode>("graph");

  const displayNodes = useMemo(() => {
    const realNodes: Array<Omit<DisplayNode, "x" | "y">> = graph.nodes.map((node) => ({
      ...node,
      status: zh ? "已发布" : "Published",
    }));
    const placeholders = placeholderNodes(labels);
    const needed = Math.max(0, 6 - realNodes.length);

    return [...realNodes, ...placeholders.slice(0, needed)];
  }, [graph.nodes, labels, zh]);

  const filterOptions = useMemo(
    () => ({
      types: uniqueSorted(displayNodes.map((node) => node.type)),
      topics: uniqueSorted(displayNodes.flatMap((node) => node.topics)),
      tags: uniqueSorted(displayNodes.flatMap((node) => node.tags)),
    }),
    [displayNodes],
  );

  const filteredBaseNodes = useMemo(
    () =>
      displayNodes.filter((node) => {
        const matchesType = selectedType ? node.type === selectedType : true;
        const matchesTopic = selectedTopic ? node.topics.includes(selectedTopic) : true;
        const matchesTag = selectedTag ? node.tags.includes(selectedTag) : true;

        return matchesType && matchesTopic && matchesTag;
      }),
    [displayNodes, selectedTag, selectedTopic, selectedType],
  );

  const selectedNode =
    filteredBaseNodes.find((node) => node.id === selectedNodeId) ?? filteredBaseNodes[0] ?? null;
  const positionedNodes = selectedNode ? positionNodes(filteredBaseNodes, selectedNode.id) : [];
  const filteredNodeIds = new Set(positionedNodes.map((node) => node.id));
  const positionMap = new Map(positionedNodes.map((node) => [node.id, node]));
  const displayEdges = buildDisplayEdges(displayNodes, graph);
  const filteredEdges = displayEdges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
  );
  const relatedNodes = selectedNode
    ? filteredEdges
        .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
        .map((edge) => displayNodes.find((node) => node.id === (edge.source === selectedNode.id ? edge.target : edge.source)))
        .filter((node): node is Omit<DisplayNode, "x" | "y"> => Boolean(node))
        .slice(0, 5)
    : [];
  const typeCounts = filterOptions.types.map((type) => ({
    type,
    count: displayNodes.filter((node) => node.type === type).length,
  }));

  if (displayNodes.length === 0) {
    return (
      <section className="panel-frame px-6 py-12 text-center text-sm leading-7 text-[color:var(--text-soft)]">
        <div className="relative z-10">{labels.empty}</div>
      </section>
    );
  }

  return (
    <section className="grid gap-0 overflow-hidden border border-[color:var(--rule)] bg-[color:var(--surface)] shadow-[var(--shadow-panel)] lg:grid-cols-[250px_minmax(0,1fr)_330px]">
      <aside className="border-b border-[color:var(--rule)] bg-[color:var(--surface-muted)]/55 px-4 py-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--rule)] pb-4">
          <h2 className="academic-serif text-2xl font-normal leading-tight text-[color:var(--ink)]">
            {copy.sidebarTitle}
          </h2>
          <span className="mono whitespace-nowrap text-[10px] uppercase text-[color:var(--text-muted)]">
            {positionedNodes.length} / {displayNodes.length}
          </span>
        </div>

        <div className="mt-5">
          <div className="mono mb-3 text-[10px] uppercase text-[color:var(--text-muted)]">
            {copy.categories}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button
              className={`flex min-h-10 items-center justify-between gap-3 border px-3 py-2 text-left text-sm leading-5 transition ${
                selectedType === ""
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)]"
                  : "border-[color:var(--rule)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
              }`}
              onClick={() => setSelectedType("")}
              type="button"
            >
              <span>{labels.all}</span>
              <span className="mono text-[10px] text-[color:var(--text-muted)]">{displayNodes.length}</span>
            </button>
            {typeCounts.map((item) => (
              <button
                className={`flex min-h-10 items-center justify-between gap-3 border px-3 py-2 text-left text-sm leading-5 transition ${
                  selectedType === item.type
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)]"
                    : "border-[color:var(--rule)] bg-[color:var(--surface)] text-[color:var(--ink-soft)] hover:border-[color:var(--accent)]"
                }`}
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                type="button"
              >
                <span>{item.type}</span>
                <span className="mono text-[10px] text-[color:var(--text-muted)]">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mono mb-3 text-[10px] uppercase text-[color:var(--text-muted)]">
            {copy.themes}
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.topics.slice(0, 8).map((topic) => (
              <button
                className={`border px-2.5 py-1.5 text-xs leading-5 transition ${
                  selectedTopic === topic
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)]"
                    : "border-[color:var(--rule)] bg-[color:var(--surface)] text-[color:var(--ink-soft)]"
                }`}
                key={topic}
                onClick={() => setSelectedTopic(selectedTopic === topic ? "" : topic)}
                type="button"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-[color:var(--rule)] pt-5">
          <div className="mono mb-3 text-[10px] uppercase text-[color:var(--text-muted)]">
            {copy.view}
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <button
              aria-pressed={viewMode === "graph"}
              className={`border px-3 py-2 text-left text-sm transition ${
                viewMode === "graph"
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)] shadow-[inset_4px_0_0_var(--accent)]"
                  : "border-[color:var(--rule)] bg-[color:var(--surface)] text-[color:var(--ink-soft)] hover:border-[color:var(--accent)]"
              }`}
              onClick={() => setViewMode("graph")}
              type="button"
            >
              {copy.graphView}
            </button>
            <button
              aria-pressed={viewMode === "list"}
              className={`border px-3 py-2 text-left text-sm transition ${
                viewMode === "list"
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--ink)] shadow-[inset_4px_0_0_var(--accent)]"
                  : "border-[color:var(--rule)] bg-[color:var(--surface)] text-[color:var(--ink-soft)] hover:border-[color:var(--accent)]"
              }`}
              onClick={() => setViewMode("list")}
              type="button"
            >
              {copy.listView}
            </button>
          </div>
          <p className="mt-5 text-xs leading-6 text-[color:var(--text-soft)]">{copy.placeholderHint}</p>
        </div>
      </aside>

      <div className="min-w-0 bg-[color:var(--background)]">
        <div className="flex flex-col gap-4 border-b border-[color:var(--rule)] bg-[color:var(--surface)]/82 px-4 py-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="academic-serif text-4xl font-normal leading-none text-[color:var(--ink)]">
              {labels.relations}
            </h2>
            <div className="mono mt-3 flex flex-wrap gap-4 text-[10px] uppercase text-[color:var(--text-muted)]">
              <span>
                {labels.nodes}: {positionedNodes.length}
              </span>
              <span>
                {labels.edges}: {filteredEdges.length}
              </span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[28rem]">
            <FilterSelect
              allLabel={labels.all}
              label={labels.type}
              onChange={setSelectedType}
              options={filterOptions.types}
              value={selectedType}
            />
            <FilterSelect
              allLabel={labels.all}
              label={labels.topic}
              onChange={setSelectedTopic}
              options={filterOptions.topics}
              value={selectedTopic}
            />
            <FilterSelect
              allLabel={labels.all}
              label={labels.tag}
              onChange={setSelectedTag}
              options={filterOptions.tags}
              value={selectedTag}
            />
          </div>
        </div>

        {filteredBaseNodes.length === 0 ? (
          <div className="flex min-h-[28rem] items-center justify-center px-6 text-center text-sm leading-7 text-[color:var(--text-soft)]">
            {labels.noFiltered}
          </div>
        ) : viewMode === "list" ? (
          <div className="min-h-[34rem] px-4 py-5 sm:min-h-[38rem] sm:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="academic-serif text-3xl font-normal leading-tight text-[color:var(--ink)]">
                {copy.listHeading}
              </h3>
              <span className="mono text-[10px] uppercase text-[color:var(--text-muted)]">
                {filteredBaseNodes.length} / {displayNodes.length}
              </span>
            </div>
            <div className="grid gap-3">
              {filteredBaseNodes.map((node) => (
                <article
                  className={`border bg-[color:var(--surface)] px-4 py-4 transition ${
                    selectedNode?.id === node.id
                      ? "border-[color:var(--accent)] shadow-[inset_4px_0_0_var(--accent)]"
                      : "border-[color:var(--rule)] hover:border-[color:var(--accent)]"
                  }`}
                  key={node.id}
                >
                  <button
                    className="block w-full text-left"
                    onClick={() => setSelectedNodeId(node.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="academic-serif text-2xl font-normal leading-tight text-[color:var(--ink)]">
                        {node.title}
                      </h4>
                      <span className="border border-[color:var(--rule)] bg-[color:var(--surface-muted)] px-2 py-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                        {node.type}
                      </span>
                      <span
                        className={`border px-2 py-1 text-xs leading-5 ${
                          node.isPlaceholder
                            ? "border-[#d3b453] bg-[#fbf7ec] text-[#8a6b16]"
                            : "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
                        }`}
                      >
                        {node.isPlaceholder ? copy.placeholderBadge : copy.realNote}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-[color:var(--text-muted)]">
                      {node.publishedAtLabel}
                    </div>
                    <p className="mt-3 max-w-[46rem] text-sm leading-7 text-[color:var(--text-soft)]">
                      {node.excerpt}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[...node.tags, ...node.concepts].map((item) => (
                        <span
                          className="border border-[color:var(--rule)] bg-[color:var(--surface-muted)] px-2.5 py-1 text-xs leading-5 text-[color:var(--ink-soft)]"
                          key={`${node.id}:${item}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </button>
                  <div className="mt-4 border-t border-[color:var(--rule)] pt-4">
                    {node.isPlaceholder ? (
                      <span className="text-sm leading-6 text-[color:var(--text-soft)]">
                        {copy.openDisabled}
                      </span>
                    ) : (
                      <Link
                        className="inline-flex border border-[color:var(--accent)] px-3 py-2 text-sm text-[color:var(--accent-strong)] transition hover:bg-[color:var(--accent-soft)]"
                        href={node.href}
                      >
                        {copy.readNote}
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <svg
              aria-label={labels.relations}
              className="h-[34rem] w-full sm:h-[38rem]"
              role="img"
              viewBox="0 0 720 500"
            >
              <defs>
                <pattern height="24" id="learning-grid" patternUnits="userSpaceOnUse" width="24">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ece7df" strokeWidth="1" />
                </pattern>
              </defs>
              <rect fill="#fffefb" height="500" width="720" />
              <rect fill="url(#learning-grid)" height="500" opacity="0.72" width="720" />
              <g>
                {filteredEdges.map((edge) => {
                  const source = positionMap.get(edge.source);
                  const target = positionMap.get(edge.target);

                  if (!source || !target) {
                    return null;
                  }

                  return (
                    <line
                      key={edge.id}
                      stroke={
                        edge.kind === "related"
                          ? "var(--accent)"
                          : edge.kind === "concept"
                            ? "#7f8f86"
                            : "#c7bfb2"
                      }
                      strokeDasharray={edge.kind === "related" ? undefined : edge.kind === "concept" ? "8 7" : "3 8"}
                      strokeOpacity={edge.isPlaceholder ? 0.52 : 0.75}
                      strokeWidth={edge.kind === "related" ? 2.2 : 1.5}
                      x1={source.x}
                      x2={target.x}
                      y1={source.y}
                      y2={target.y}
                    />
                  );
                })}
              </g>
              <g>
                {positionedNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        fill={isSelected ? "var(--accent-soft)" : node.isPlaceholder ? "#fbf7ec" : "var(--surface)"}
                        r={isSelected ? 34 : 25}
                        stroke={isSelected ? "var(--accent)" : node.isPlaceholder ? "#d3b453" : "#4278b7"}
                        strokeWidth={isSelected ? 2.5 : 1.6}
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        fill="transparent"
                        r={isSelected ? 46 : 36}
                        stroke={isSelected ? "var(--accent)" : "transparent"}
                        strokeOpacity="0.18"
                        strokeWidth="10"
                      />
                      <foreignObject height="106" width="172" x={node.x - 86} y={node.y + 24}>
                        <button
                          className="flex h-full w-full flex-col items-center gap-1 px-2 text-center"
                          onClick={() => setSelectedNodeId(node.id)}
                          type="button"
                        >
                          <span className="text-[13px] font-medium leading-5 text-[color:var(--ink)]">
                            {node.title}
                          </span>
                          <span className="text-xs leading-4 text-[color:var(--text-muted)]">
                            {node.publishedAtLabel}
                          </span>
                        </button>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            </svg>

            <div className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="border border-[color:var(--rule)] bg-[color:var(--surface)]/92 px-4 py-3">
                <div className="mono mb-2 text-[10px] uppercase text-[color:var(--text-muted)]">
                  {copy.legend}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                  <span>{copy.solid}</span>
                  <span>{copy.concept}</span>
                  <span>{copy.tag}</span>
                </div>
              </div>
              <div className="hidden border border-[color:var(--rule)] bg-[color:var(--surface)]/86 p-3 md:block">
                <svg className="h-20 w-full" viewBox="0 0 160 80">
                  <rect fill="#fffefb" height="80" stroke="#e5e1da" width="160" />
                  {positionedNodes.map((node) => (
                    <circle
                      cx={18 + (node.x / 720) * 124}
                      cy={12 + (node.y / 500) * 56}
                      fill={node.isPlaceholder ? "#d3b453" : "var(--accent)"}
                      key={node.id}
                      r={3}
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="border-t border-[color:var(--rule)] bg-[color:var(--surface)] px-5 py-6 lg:border-l lg:border-t-0">
        <div className="mono text-[10px] uppercase text-[color:var(--text-muted)]">{copy.current}</div>
        {selectedNode ? (
          <div className="mt-4">
            <h2 className="academic-serif text-3xl font-normal leading-tight text-[color:var(--ink)]">
              {selectedNode.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[color:var(--text-muted)]">
              <span>{selectedNode.publishedAtLabel}</span>
              <span className="border border-[color:var(--rule)] bg-[color:var(--surface-muted)] px-2 py-1 text-xs text-[color:var(--ink-soft)]">
                {selectedNode.type}
              </span>
            </div>

            <section className="mt-6">
              <h3 className="mono text-[10px] uppercase text-[color:var(--text-muted)]">{copy.summary}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                {selectedNode.excerpt}
              </p>
            </section>

            <section className="mt-6">
              <h3 className="mono text-[10px] uppercase text-[color:var(--text-muted)]">{copy.status}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{selectedNode.status}</p>
            </section>

            <section className="mt-6">
              <h3 className="mono text-[10px] uppercase text-[color:var(--text-muted)]">{labels.concepts}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...selectedNode.concepts, ...selectedNode.tags].map((item) => (
                  <span
                    className="border border-[color:var(--rule)] bg-[color:var(--surface-muted)] px-2.5 py-1 text-xs leading-5 text-[color:var(--ink-soft)]"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-6 border-t border-[color:var(--rule)] pt-5">
              <h3 className="mono text-[10px] uppercase text-[color:var(--text-muted)]">{copy.related}</h3>
              <div className="mt-3 grid gap-3">
                {relatedNodes.length ? (
                  relatedNodes.map((node) => (
                    <button
                      className="flex items-start justify-between gap-3 text-left text-sm leading-6 text-[color:var(--ink-soft)] transition hover:text-[color:var(--ink)]"
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      type="button"
                    >
                      <span>{node.title}</span>
                      <span className="mono whitespace-nowrap text-[10px] text-[color:var(--text-muted)]">
                        {node.publishedAtLabel}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-[color:var(--text-soft)]">{labels.noSelection}</p>
                )}
              </div>
            </section>

            {selectedNode.isPlaceholder ? (
              <p className="mt-6 border border-[color:var(--rule)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color:var(--text-soft)]">
                {copy.openDisabled}
              </p>
            ) : (
              <Link
                className="mt-6 inline-flex border border-[color:var(--accent)] px-4 py-3 text-sm text-[color:var(--accent-strong)] transition hover:bg-[color:var(--accent-soft)]"
                href={selectedNode.href}
              >
                {labels.openNote}
              </Link>
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-7 text-[color:var(--text-soft)]">{labels.noSelection}</p>
        )}
      </aside>
    </section>
  );
}
