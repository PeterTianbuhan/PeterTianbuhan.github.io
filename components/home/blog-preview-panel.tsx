import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/site";

export function BlogPreviewPanel({
  dictionary,
  locale,
  posts,
}: {
  dictionary: Dictionary;
  locale: Locale;
  posts: PostListItem[];
}) {
  return (
    <Panel className="boot-in delay-3 rounded-[30px]">
      <div className="flex items-center justify-between gap-4">
        <SectionLabel label="latest.writing" />
        <Link
          className="mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-soft)] transition hover:text-white"
          href={`/${locale}/blog`}
        >
          {dictionary.home.blogCta}
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {posts.map((post) => (
          <Link
            className="group block rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5 transition duration-300 hover:border-white/18 hover:bg-white/[0.05]"
            href={`/${locale}/blog/${post.slug}`}
            key={post.slug}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-base font-medium tracking-[-0.03em] text-white">{post.title}</div>
                <p className="mt-3 max-w-[52ch] text-sm leading-7 text-[color:var(--text-soft)]">
                  {post.excerpt}
                </p>
              </div>
              <div className="mono shrink-0 text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                {post.publishedAtLabel}
              </div>
            </div>
            <div className="mono mt-5 text-[10px] uppercase tracking-[0.3em] text-white/80 transition group-hover:translate-x-1">
              {dictionary.home.readArticle}
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
