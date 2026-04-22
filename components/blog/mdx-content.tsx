import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export function MdxContent({ source }: { source: string }) {
  return <MDXRemote options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} source={source} />;
}
