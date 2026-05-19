import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPostsByLocale } from "@/lib/content";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";
import { articleSeries, getProfilesBySeries, readingModes } from "@/lib/article-registry";
import { getVisualNoteByArticleSlug } from "@/lib/visual-notes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    return {};
  }

  return {
    title: "阅读地图 | Peter Tian",
    description: "按主题路径组织文章，帮助读者从速览、可视化理解到完整原文逐层进入。",
  };
}

export default async function ReadingMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, posts, site] = await Promise.all([
    getDictionary(typedLocale),
    getPostsByLocale(typedLocale),
    getSiteContent(typedLocale),
  ]);
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <SiteHeader alternatePath="/en/blog" dictionary={dictionary} locale={typedLocale} />

        <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.92)] px-6 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            Reading Map
          </div>
          <h1 className="academic-serif mt-4 max-w-[10ch] text-5xl font-normal leading-[0.98] tracking-normal text-[color:var(--ink)] sm:text-7xl">
            阅读地图
          </h1>
          <p className="mt-6 max-w-[50rem] text-base leading-8 text-[color:var(--text-soft)]">
            这里不按时间堆文章，而是按主题路径组织阅读顺序。每篇文章都有入口问题、核心判断和三种阅读模式：先速览，再看可视化展示，最后回到完整原文。
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {Object.values(readingModes).map((mode) => (
              <div className="border border-[color:var(--rule)] bg-white px-4 py-3" key={mode.label}>
                <div className="text-sm font-semibold text-[color:var(--ink)]">{mode.label}</div>
                <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">{mode.description}</p>
              </div>
            ))}
          </div>
        </section>

        {articleSeries.map((series) => {
          const profiles = getProfilesBySeries(series.id);

          if (!profiles.length) return null;

          return (
            <section
              className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.9)] p-5 shadow-[var(--shadow-panel)] sm:p-6"
              key={series.id}
            >
              <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Series
                  </div>
                  <h2 className="academic-serif mt-3 text-3xl font-normal leading-tight tracking-normal text-[color:var(--ink)]">
                    {series.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">{series.description}</p>
                </div>

                <div className="grid gap-4">
                  {profiles.map((profile) => {
                    const post = postsBySlug.get(profile.slug);
                    const visualNote = getVisualNoteByArticleSlug(profile.slug);

                    if (!post) return null;

                    return (
                      <article className="border-t border-[color:var(--rule)] pt-4" key={profile.slug}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                              {String(profile.order).padStart(2, "0")}
                            </div>
                            <Link
                              className="mt-2 block text-lg font-semibold leading-7 text-[color:var(--ink)] underline-offset-4 hover:underline"
                              href={`/${typedLocale}/blog/${post.slug}`}
                            >
                              {post.title}
                            </Link>
                            <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]">{profile.question}</p>
                            <p className="mt-2 max-w-[62rem] text-sm leading-7 text-[color:var(--text-soft)]">
                              {profile.thesis}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            {visualNote ? (
                              <Link
                                className="mono inline-flex border border-[#9b6a43] bg-[#f8f2ea] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#6f4c30] transition hover:bg-[#f4eadc]"
                                href={`/${typedLocale}/visual-notes/${visualNote.slug}`}
                              >
                                速览 / 理解
                              </Link>
                            ) : null}
                            <Link
                              className="mono inline-flex border border-[color:var(--rule)] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                              href={`/${typedLocale}/blog/${post.slug}`}
                            >
                              原文
                            </Link>
                          </div>
                        </div>
                        {profile.related.length ? (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs leading-6 text-[color:var(--text-muted)]">
                            <span className="font-semibold text-[color:var(--ink-soft)]">相关：</span>
                            {profile.related.map((slug) => {
                              const related = postsBySlug.get(slug);
                              if (!related) return null;
                              return (
                                <Link
                                  className="underline underline-offset-4 transition hover:text-[color:var(--ink)]"
                                  href={`/${typedLocale}/blog/${slug}`}
                                  key={slug}
                                >
                                  {related.title}
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        <SiteFooter dictionary={dictionary} locale={typedLocale} site={site} />
      </div>
    </main>
  );
}
