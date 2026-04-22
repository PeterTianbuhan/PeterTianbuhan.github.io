import Link from "next/link";
import { MdxContent } from "@/components/blog/mdx-content";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Panel } from "@/components/ui/panel";
import type { Post, PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getSiteContent, type Dictionary } from "@/lib/site";

export async function BlogPostView({
  alternatePath,
  dictionary,
  locale,
  post,
  relatedPosts,
}: {
  alternatePath: string;
  dictionary: Dictionary;
  locale: Locale;
  post: Post;
  relatedPosts: PostListItem[];
}) {
  const site = await getSiteContent(locale);

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <SiteHeader alternatePath={alternatePath} dictionary={dictionary} locale={locale} />

        <Panel className="boot-in rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            {dictionary.blog.articleEyebrow}
          </div>
          <h1 className="mt-4 max-w-[18ch] text-4xl font-medium leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl">
            {post.meta.title}
          </h1>
          <p className="mt-5 max-w-[48rem] text-base leading-8 text-[color:var(--text-soft)]">
            {post.meta.excerpt}
          </p>
          <div className="mono mt-6 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
            <span>{post.meta.publishedAtLabel}</span>
            {post.meta.updatedAtLabel ? <span>{post.meta.updatedAtLabel}</span> : null}
          </div>
        </Panel>

        <Panel className="boot-in delay-1 rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <article className="prose-shell">
            <MdxContent source={post.content} />
          </article>
        </Panel>

        {relatedPosts.length ? (
          <section className="grid gap-4 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                className="panel-frame boot-in delay-2 rounded-[28px] px-6 py-6 transition hover:border-white/18 hover:bg-white/[0.05]"
                href={`/${locale}/blog/${relatedPost.slug}`}
                key={relatedPost.slug}
              >
                <div className="relative z-10">
                  <div className="mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    {dictionary.blog.nextRead}
                  </div>
                  <div className="mt-4 text-xl font-medium tracking-[-0.04em] text-white">
                    {relatedPost.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">{relatedPost.excerpt}</p>
                </div>
              </Link>
            ))}
          </section>
        ) : null}

        <div className="boot-in delay-2">
          <Link
            className="mono inline-flex rounded-full border border-white/12 px-4 py-3 text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-soft)] transition hover:border-white/25 hover:text-white"
            href={`/${locale}/blog`}
          >
            {dictionary.blog.backToIndex}
          </Link>
        </div>

        <SiteFooter dictionary={dictionary} locale={locale} site={site} />
      </div>
    </main>
  );
}
