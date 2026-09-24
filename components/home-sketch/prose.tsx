import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { InkBreak, InkHeading } from "./ink";
import styles from "./prose.module.css";

// Running text on the sketchbook's paper. Section headings get a pen stroke
// under them and scene breaks a small wave, both inked as they come into view.

// ## headings get ids section-1, section-2, … so they can be linked to
function numberSections() {
  return (tree: { children: { type: string; depth?: number; data?: Record<string, unknown> }[] }) => {
    let n = 0;
    for (const node of tree.children) {
      if (node.type === "heading" && node.depth === 2) {
        node.data = { ...node.data, hProperties: { id: `section-${++n}` } };
      }
    }
  };
}

const components = { h2: InkHeading, hr: InkBreak };

export function Prose({ source }: { source: string }) {
  return (
    <div className={styles.prose}>
      <MDXRemote source={source} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm, numberSections] } }} />
    </div>
  );
}
