import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/blog/mdx-content";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Panel } from "@/components/ui/panel";
import { getPostBySlug } from "@/lib/content";
import { defaultLocale, isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";
import { getAllThoughtNotes, getThoughtNoteBySlug } from "@/lib/thoughts";

export async function generateStaticParams() {
  const notes = await getAllThoughtNotes();

  // output: export 不允许"零参数"的动态路由；内容清空期给一个会 notFound 的占位。
  if (notes.length === 0) {
    return [{ locale: defaultLocale, slug: "__placeholder__" }];
  }

  return notes.map((note) => ({
    locale: note.locale,
    slug: note.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const note = await getThoughtNoteBySlug(locale as Locale, slug);

  if (!note) {
    return {};
  }

  return {
    title: `${note.meta.title} | 随想 | Peter Tian`,
    description: note.meta.excerpt,
  };
}

export default async function ThoughtDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, site, note] = await Promise.all([
    getDictionary(typedLocale),
    getSiteContent(typedLocale),
    getThoughtNoteBySlug(typedLocale, slug),
  ]);

  if (!note) {
    notFound();
  }

  const linkedPost = note.meta.articleSlug
    ? await getPostBySlug(typedLocale, note.meta.articleSlug)
    : null;

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-6">
        <SiteHeader alternatePath="/en/blog" dictionary={dictionary} locale={typedLocale} />

        <Panel className="px-6 py-8 sm:px-8 sm:py-10">
          <Link className="mono text-xs uppercase tracking-[0.26em] text-[color:var(--text-muted)] transition hover:text-[color:var(--ink)]" href={`/${typedLocale}/thoughts`}>
            Thought Inbox
          </Link>
          <h1 className="academic-serif mt-5 text-4xl font-semibold leading-tight tracking-normal text-[color:var(--ink)] sm:text-6xl">
            {note.meta.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="mono border border-[color:var(--rule)] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {note.meta.createdAtLabel}
            </span>
            {note.meta.tags.map((tag) => (
              <span className="rounded-full border border-[color:var(--rule-soft)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)]" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          {linkedPost ? (
            <Link className="paper-link mt-6 text-sm" href={`/${typedLocale}/blog/${linkedPost.slug}`}>
              可并入文章：{linkedPost.meta.title}
            </Link>
          ) : (
            <p className="mt-6 border-l-2 border-[color:var(--accent)] pl-4 text-sm leading-7 text-[color:var(--ink-soft)]">
              这条随想暂时没有挂到具体文章，先作为独立方向保留。
            </p>
          )}
        </Panel>

        <Panel className="px-6 py-8 sm:px-8 sm:py-10">
          <article className="prose-shell">
            <MdxContent source={note.content} />
          </article>
        </Panel>

        <SiteFooter dictionary={dictionary} locale={typedLocale} site={site} />
      </div>
    </main>
  );
}
