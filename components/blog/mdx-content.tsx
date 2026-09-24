import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

function readingHeadings(ids: string[]) {
  return () => (tree: { children: { type: string; depth?: number; data?: Record<string, unknown> }[] }) => {
    let index = 0;
    for (const node of tree.children) {
      if (node.type !== "heading" || node.depth !== 2) continue;
      const id = ids[index++];
      if (id) node.data = { ...node.data, hProperties: { id } };
    }
  };
}

export function MdxContent({ source, headingIds = [] }: { source: string; headingIds?: string[] }) {
  return <MDXRemote options={{ mdxOptions: { remarkPlugins: [remarkGfm, readingHeadings(headingIds)] } }} source={source} />;
}
