import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Panel } from "@/components/ui/panel";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getSiteContent, type Dictionary } from "@/lib/site";
import { getArticleProfile, getArticleSeries } from "@/lib/article-registry";

export async function BlogIndexView({
  dictionary,
  locale,
  posts,
}: {
  dictionary: Dictionary;
  locale: Locale;
  posts: PostListItem[];
}) {
  const site = await getSiteContent(locale);
  const postsWithProfiles = posts.map((post) => ({
    profile: locale === "zh" ? getArticleProfile(post.slug) : null,
    post,
  }));

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <SiteHeader
          alternatePath={`/${locale === "zh" ? "en" : "zh"}/blog`}
          dictionary={dictionary}
          locale={locale}
        />

        <Panel className="boot-in px-6 py-8 sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            {dictionary.blog.eyebrow}
          </div>
          <h1 className="academic-serif mt-4 max-w-[10ch] text-5xl font-normal leading-[0.98] tracking-normal text-[color:var(--ink)] sm:text-7xl">
            {dictionary.blog.title}
          </h1>
          <p className="mt-6 max-w-[42rem] text-base leading-8 text-[color:var(--text-soft)]">
            {dictionary.blog.description}
          </p>
        </Panel>

        <section className="grid gap-4">
          {postsWithProfiles.map(({ post, profile }, index) => {
            const series = profile ? getArticleSeries(profile.seriesId) : null;

            return (
              <article
                className={`panel-frame px-6 py-6 transition duration-300 hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-muted)] sm:px-7 ${
                  index === 0 ? "boot-in delay-1" : "boot-in delay-2"
                }`}
                key={post.slug}
              >
                <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    {series ? (
                      <div className="mono mb-3 text-[10px] tracking-[0.18em] text-[color:var(--text-muted)]">
                        {series.title}
                      </div>
                    ) : null}
                    <Link
                      className="academic-serif text-2xl font-normal tracking-normal text-[color:var(--ink)] underline-offset-4 hover:underline"
                      href={`/${locale}/blog/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  <p className="mt-4 max-w-[55ch] text-sm leading-7 text-[color:var(--text-soft)]">
                    {post.excerpt}
                  </p>
                  {profile ? (
                    <p className="mt-3 max-w-[58ch] border-l-2 border-[#9b6a43] pl-4 text-xs leading-6 text-[color:var(--text-muted)]">
                      {profile.question}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        className="mono rounded-full border border-[color:var(--rule)] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mono shrink-0 text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-muted)]">
                  {post.publishedAtLabel}
                </div>
              </div>
              <div className="relative z-10 mt-6 flex flex-wrap gap-3">
                <Link
                  className="mono inline-flex border border-[color:var(--rule)] bg-white px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                  href={`/${locale}/blog/${post.slug}`}
                >
                  阅读原文
                </Link>
              </div>
              </article>
            );
          })}
        </section>

        <SiteFooter dictionary={dictionary} locale={locale} site={site} />
      </div>
    </main>
  );
}
