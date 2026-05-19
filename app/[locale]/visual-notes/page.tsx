import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPostBySlug } from "@/lib/content";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";
import { getArticleProfile, getArticleSeries } from "@/lib/article-registry";
import { getAllVisualNotes } from "@/lib/visual-notes";

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
    title: "可视化文章库 | Peter Tian",
    description: "把文章拆成图像序列、结构索引和原文回链的可视化阅读入口。",
  };
}

export default async function VisualNotesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, site] = await Promise.all([
    getDictionary(typedLocale),
    getSiteContent(typedLocale),
  ]);
  const entries = await Promise.all(
    getAllVisualNotes().map(async (note) => ({
      note,
      post: note.articleSlug ? await getPostBySlug(typedLocale, note.articleSlug) : null,
      profile: note.articleSlug ? getArticleProfile(note.articleSlug) : null,
    })),
  );

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <SiteHeader alternatePath="/en/blog" dictionary={dictionary} locale={typedLocale} />

        <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.92)] px-6 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            Visual Articles
          </div>
          <h1 className="academic-serif mt-4 max-w-[12ch] text-5xl font-normal leading-[0.98] tracking-normal text-[color:var(--ink)] sm:text-7xl">
            可视化文章库
          </h1>
          <p className="mt-6 max-w-[48rem] text-base leading-8 text-[color:var(--text-soft)]">
            每个页面把一篇文章拆成图像帧、正文结构和细节摘录。先用图像建立全局理解，再通过结构索引回到原文证据。
          </p>
          <Link
            className="mono mt-6 inline-flex border border-[color:var(--rule)] bg-white px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
            href={`/${typedLocale}/reading-map`}
          >
            返回阅读地图
          </Link>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {entries.map(({ note, post, profile }, index) => {
            const cover = note.images[0];
            const series = profile ? getArticleSeries(profile.seriesId) : null;

            return (
              <article
                className={`border border-[color:var(--rule)] bg-white shadow-[var(--shadow-panel)] ${
                  index < 2 ? "boot-in delay-1" : "boot-in delay-2"
                }`}
                key={note.slug}
              >
                {cover ? (
                  <Link
                    className="block aspect-[16/10] overflow-hidden border-b border-[color:var(--rule)] bg-[#f7f5ef]"
                    href={`/${typedLocale}/visual-notes/${note.slug}`}
                  >
                    <Image
                      alt={cover.alt}
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.015]"
                      height={cover.height}
                      sizes="(max-width: 768px) 100vw, 620px"
                      src={cover.src}
                      width={cover.width}
                    />
                  </Link>
                ) : null}
                <div className="p-5 sm:p-6">
                  <div className="mono text-[10px] tracking-[0.18em] text-[color:var(--text-muted)]">
                    {series ? `${series.title} / ` : ""}
                    {note.images.length} frames
                    {post ? ` / ${post.meta.publishedAtLabel}` : ""}
                  </div>
                  <Link
                    className="academic-serif mt-3 block text-2xl font-normal leading-tight tracking-normal text-[color:var(--ink)] underline-offset-4 hover:underline"
                    href={`/${typedLocale}/visual-notes/${note.slug}`}
                  >
                    {note.title}
                  </Link>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">{note.description}</p>
                  {post?.meta.excerpt ? (
                    <p className="mt-3 border-l-2 border-[#9b6a43] pl-4 text-xs leading-6 text-[color:var(--text-muted)]">
                      {post.meta.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      className="mono inline-flex border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white transition hover:bg-[color:var(--accent-strong)]"
                      href={`/${typedLocale}/visual-notes/${note.slug}`}
                    >
                      看展示页
                    </Link>
                    {note.articleSlug ? (
                      <Link
                        className="mono inline-flex border border-[color:var(--rule)] bg-white px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                        href={`/${typedLocale}/blog/${note.articleSlug}`}
                      >
                        读原文
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <SiteFooter dictionary={dictionary} locale={typedLocale} site={site} />
      </div>
    </main>
  );
}
