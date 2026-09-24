import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { thingId } from "@/lib/i-think";
import { InkBreak, InkHeading, InkStrike } from "./ink";
import styles from "./prose.module.css";

// Running text on the sketchbook's paper. Section headings get a pen stroke
// under them and scene breaks a small wave, both inked as they come into view.

type Node = { type: string; depth?: number; value?: string; children?: Node[]; data?: Record<string, unknown> };

const text = (node: Node): string => node.value ?? (node.children ?? []).map(text).join("");

// ## headings get ids section-1, section-2, … and ### headings an id from
// their words, so they can be linked to
function numberSections() {
  return (tree: { children: Node[] }) => {
    let n = 0;
    for (const node of tree.children) {
      if (node.type !== "heading") continue;
      if (node.depth === 2) node.data = { ...node.data, hProperties: { id: `section-${++n}` } };
      if (node.depth === 3) node.data = { ...node.data, hProperties: { id: thingId(text(node)) } };
    }
  };
}

// ~~words~~ are crossed out by hand
const components = { h2: InkHeading, hr: InkBreak, del: InkStrike };

export function Prose({ source, className }: { source: string; className?: string }) {
  return (
    <div className={`${styles.prose} ${className ?? ""}`}>
      <MDXRemote source={source} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm, numberSections] } }} />
    </div>
  );
}
