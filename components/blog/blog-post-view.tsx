import Link from "next/link";
import { ArticleEntryCard } from "@/components/blog/article-entry-card";
import { MdxContent } from "@/components/blog/mdx-content";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Panel } from "@/components/ui/panel";
import type { Post, PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getSiteContent, type Dictionary } from "@/lib/site";
import { getArticleProfile } from "@/lib/article-registry";

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
  const articleProfile = locale === "zh" ? getArticleProfile(post.slug) : null;
  const articleHref = `/${locale}/blog/${post.slug}`;

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <SiteHeader alternatePath={alternatePath} dictionary={dictionary} locale={locale} />

        <Panel className="boot-in px-6 py-8 sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            {dictionary.blog.articleEyebrow}
          </div>
          <h1 className="academic-serif mt-4 max-w-[18ch] text-4xl font-normal leading-[1] tracking-normal text-[color:var(--ink)] sm:text-6xl">
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

        {articleProfile ? (
          <ArticleEntryCard articleHref={articleHref} profile={articleProfile} />
        ) : null}

        <Panel className="boot-in delay-1 px-6 py-8 sm:px-8 sm:py-10">
          <article className="prose-shell">
            <MdxContent source={post.content} />
          </article>
        </Panel>

        {relatedPosts.length ? (
          <section className="grid gap-4 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                className="panel-frame boot-in delay-2 px-6 py-6 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-muted)]"
                href={`/${locale}/blog/${relatedPost.slug}`}
                key={relatedPost.slug}
              >
                <div className="relative z-10">
                  <div className="mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    {dictionary.blog.nextRead}
                  </div>
                  <div className="academic-serif mt-4 text-xl font-normal tracking-normal text-[color:var(--ink)]">
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
            className="mono inline-flex border border-[color:var(--rule)] px-4 py-3 text-[10px] uppercase tracking-[0.32em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
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
