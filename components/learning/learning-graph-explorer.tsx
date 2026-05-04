"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LearningGraph, LearningGraphNode } from "@/lib/learning-graph";

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

type PositionedNode = LearningGraphNode & {
  x: number;
  y: number;
};

function getPositions(nodes: LearningGraphNode[]): PositionedNode[] {
  if (nodes.length === 0) {
    return [];
  }

  if (nodes.length === 1) {
    return [{ ...nodes[0], x: 320, y: 230 }];
  }

  const centerX = 320;
  const centerY = 230;
  const radius = nodes.length < 4 ? 125 : 150;

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;

    return {
      ...node,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });
}

function FilterGroup({
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
    <label className="flex flex-col gap-2">
      <span className="mono text-[10px] uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
        {label}
      </span>
      <select
        className="border border-[color:var(--rule)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--ink-soft)] outline-none transition focus:border-[color:var(--accent)]"
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
  const [selectedType, setSelectedType] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(graph.nodes[0]?.id ?? "");

  const filteredNodes = useMemo(
    () =>
      graph.nodes.filter((node) => {
        const matchesType = selectedType ? node.type === selectedType : true;
        const matchesTopic = selectedTopic ? node.topics.includes(selectedTopic) : true;
        const matchesTag = selectedTag ? node.tags.includes(selectedTag) : true;

        return matchesType && matchesTopic && matchesTag;
      }),
    [graph.nodes, selectedTag, selectedTopic, selectedType],
  );

  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
  const filteredEdges = graph.edges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
  );
  const positionedNodes = getPositions(filteredNodes);
  const positionMap = new Map(positionedNodes.map((node) => [node.id, node]));
  const selectedNode =
    filteredNodes.find((node) => node.id === selectedNodeId) ?? filteredNodes[0] ?? null;

  if (graph.nodes.length === 0) {
    return (
      <section className="panel-frame px-6 py-12 text-center text-sm leading-7 text-[color:var(--text-soft)]">
        <div className="relative z-10">{labels.empty}</div>
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="panel-frame boot-in delay-1 min-w-0 px-5 py-5 sm:px-6">
        <div className="relative z-10">
          <div className="grid gap-3 border-b border-[color:var(--rule)] pb-5 md:grid-cols-3">
            <FilterGroup
              allLabel={labels.all}
              label={labels.type}
              onChange={setSelectedType}
              options={graph.filters.types}
              value={selectedType}
            />
            <FilterGroup
              allLabel={labels.all}
              label={labels.topic}
              onChange={setSelectedTopic}
              options={graph.filters.topics}
              value={selectedTopic}
            />
            <FilterGroup
              allLabel={labels.all}
              label={labels.tag}
              onChange={setSelectedTag}
              options={graph.filters.tags}
              value={selectedTag}
            />
          </div>

          {filteredNodes.length === 0 ? (
            <div className="flex min-h-[28rem] items-center justify-center text-center text-sm leading-7 text-[color:var(--text-soft)]">
              {labels.noFiltered}
            </div>
          ) : (
            <div className="relative mt-5 overflow-hidden border border-[color:var(--rule-soft)] bg-[color:var(--surface)]">
              <svg
                aria-label={labels.relations}
                className="h-[28rem] w-full"
                role="img"
                viewBox="0 0 640 460"
              >
                <rect fill="#fffefb" height="460" width="640" />
                <g>
                  {filteredEdges.map((edge) => {
                    const source = positionMap.get(edge.source);
                    const target = positionMap.get(edge.target);

                    if (!source || !target) {
                      return null;
                    }

                    return (
                      <g key={edge.id}>
                        <line
                          stroke={
                            edge.kind === "related"
                              ? "var(--accent)"
                              : edge.kind === "concept"
                                ? "#8f969d"
                                : "#d4cec4"
                          }
                          strokeDasharray={edge.kind === "tag" ? "4 7" : undefined}
                          strokeOpacity={edge.kind === "related" ? 0.75 : 0.55}
                          strokeWidth={edge.weight}
                          x1={source.x}
                          x2={target.x}
                          y1={source.y}
                          y2={target.y}
                        />
                      </g>
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
                          fill={isSelected ? "var(--accent-soft)" : "var(--surface-muted)"}
                          r={isSelected ? 56 : 48}
                          stroke={isSelected ? "var(--accent)" : "var(--rule)"}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <foreignObject height="82" width="140" x={node.x - 70} y={node.y - 41}>
                          <button
                            className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center"
                            onClick={() => setSelectedNodeId(node.id)}
                            type="button"
                          >
                            <span className="mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                              {node.type}
                            </span>
                            <span className="max-h-10 overflow-hidden text-[13px] leading-5 text-[color:var(--ink)]">
                              {node.title}
                            </span>
                          </button>
                        </foreignObject>
                      </g>
                    );
                  })}
                </g>
              </svg>
              {filteredEdges.length === 0 ? (
                <div className="absolute bottom-4 left-4 right-4 border border-[color:var(--rule-soft)] bg-[color:var(--surface)]/92 px-4 py-3 text-xs leading-6 text-[color:var(--text-soft)]">
                  {labels.empty}
                </div>
              ) : null}
            </div>
          )}

          <div className="mono mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            <span>
              {labels.nodes}: {filteredNodes.length}
            </span>
            <span>
              {labels.edges}: {filteredEdges.length}
            </span>
          </div>
        </div>
      </div>

      <aside className="panel-frame boot-in delay-2 px-6 py-6">
        <div className="relative z-10">
          <div className="mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
            {labels.selected}
          </div>
          {selectedNode ? (
            <div className="mt-5">
              <h2 className="academic-serif text-3xl font-normal leading-tight tracking-normal text-[color:var(--ink)]">
                {selectedNode.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                {selectedNode.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[selectedNode.type, ...selectedNode.topics, ...selectedNode.tags].map((item) => (
                  <span
                    className="mono border border-[color:var(--rule)] px-2 py-1 text-[9px] uppercase tracking-[0.22em] text-[color:var(--muted)]"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
              {selectedNode.concepts.length ? (
                <div className="mt-6 border-t border-[color:var(--rule)] pt-5">
                  <div className="mono text-[10px] uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                    {labels.concepts}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                    {selectedNode.concepts.join(" / ")}
                  </p>
                </div>
              ) : null}
              <Link
                className="mono mt-6 inline-flex border border-[color:var(--accent)] px-4 py-3 text-[10px] uppercase tracking-[0.28em] text-[color:var(--accent-strong)] transition hover:bg-[color:var(--accent-soft)]"
                href={selectedNode.href}
              >
                {labels.openNote}
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-7 text-[color:var(--text-soft)]">
              {labels.noSelection}
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}
