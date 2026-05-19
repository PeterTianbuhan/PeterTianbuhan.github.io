import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPostsByLocale } from "@/lib/content";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";
import { getThoughtNotesByLocale, type ThoughtNoteListItem } from "@/lib/thoughts";

const statusLabels = {
  seed: "新方向",
  linked: "可并入文章",
  growing: "正在长大",
};

const decisionLabels = {
  "merge-candidate": "先并入",
  "new-direction": "先保留",
  undecided: "待判断",
};

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
    title: "随想 | Peter Tian",
    description: "记录还没有长成文章的想法，并先判断它们是否能并入已有文章。",
  };
}

function ThoughtCard({
  note,
  postTitle,
}: {
  note: ThoughtNoteListItem;
  postTitle?: string;
}) {
  return (
    <article className="border-t border-[color:var(--rule)] py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono border border-[color:var(--rule)] bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {note.createdAtLabel}
            </span>
            <span className="mono border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent-strong)]">
              {statusLabels[note.status]}
            </span>
            <span className="mono border border-[color:var(--rule)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
              {decisionLabels[note.routeDecision]}
            </span>
          </div>

          <Link
            className="academic-serif mt-4 block text-3xl font-semibold leading-tight text-[color:var(--ink)] underline-offset-4 hover:underline"
            href={`/${note.locale}/thoughts/${note.slug}`}
          >
            {note.title}
          </Link>
          <p className="mt-3 max-w-[52rem] text-base leading-8 text-[color:var(--ink-soft)]">{note.excerpt}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span className="rounded-full border border-[color:var(--rule-soft)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)]" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 lg:w-56">
          {note.articleSlug ? (
            <Link
              className="paper-link text-sm"
              href={`/${note.locale}/blog/${note.articleSlug}`}
            >
              并入：{postTitle ?? note.articleSlug}
            </Link>
          ) : (
            <p className="border-l-2 border-[color:var(--accent)] pl-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              暂时不挂文章，先作为独立方向观察。
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function ThoughtsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, site, thoughts, posts] = await Promise.all([
    getDictionary(typedLocale),
    getSiteContent(typedLocale),
    getThoughtNotesByLocale(typedLocale),
    getPostsByLocale(typedLocale),
  ]);
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const linkedThoughts = thoughts.filter((note) => note.articleSlug);
  const seedThoughts = thoughts.filter((note) => !note.articleSlug);

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <SiteHeader alternatePath="/en/blog" dictionary={dictionary} locale={typedLocale} />

        <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.94)] px-6 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            Thought Inbox
          </div>
          <h1 className="academic-serif mt-4 max-w-[9ch] text-5xl font-semibold leading-[0.98] tracking-normal text-[color:var(--ink)] sm:text-7xl">
            随想
          </h1>
          <p className="mt-6 max-w-[54rem] text-base leading-8 text-[color:var(--ink-soft)]">
            这里放还没有长成文章的 idea。处理顺序是：先看能不能补进已有文章或阅读地图；如果是全新的方向，再作为 seed note 留在这里，等材料变多后再决定是否整理成正式文章。
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              ["1", "先找归属", "对照已有文章、阅读地图和标签，判断这个想法是否只是某篇文章的补充。"],
              ["2", "能并入就 linked", "如果有明确文章，就把随想挂到文章旁边，后续修订时再吸收进去。"],
              ["3", "新方向先 seed", "如果还没有归属，就保留为 seed，不急着装进完整文章结构。"],
            ].map(([step, title, description]) => (
              <div className="border border-[color:var(--rule)] bg-white px-4 py-4" key={step}>
                <div className="mono text-sm font-semibold text-[color:var(--accent-strong)]">{step}</div>
                <h2 className="mt-3 text-base font-semibold text-[color:var(--ink)]">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.9)] p-5 shadow-[var(--shadow-panel)] sm:p-6">
          <div className="mb-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                Seed Notes
              </div>
              <h2 className="academic-serif mt-3 text-4xl font-semibold text-[color:var(--ink)]">
                新方向
              </h2>
            </div>
            <span className="mono text-xs font-semibold uppercase text-[color:var(--accent-strong)]">
              {seedThoughts.length} notes
            </span>
          </div>
          {seedThoughts.length ? (
            seedThoughts.map((note) => (
              <ThoughtCard key={note.slug} note={note} />
            ))
          ) : (
            <p className="border-t border-[color:var(--rule)] py-6 text-sm leading-7 text-[color:var(--ink-soft)]">
              还没有独立随想。
            </p>
          )}
        </section>

        <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.9)] p-5 shadow-[var(--shadow-panel)] sm:p-6">
          <div className="mb-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                Linked Notes
              </div>
              <h2 className="academic-serif mt-3 text-4xl font-semibold text-[color:var(--ink)]">
                可并入文章
              </h2>
            </div>
            <span className="mono text-xs font-semibold uppercase text-[color:var(--accent-strong)]">
              {linkedThoughts.length} notes
            </span>
          </div>
          {linkedThoughts.length ? (
            linkedThoughts.map((note) => (
              <ThoughtCard
                key={note.slug}
                note={note}
                postTitle={note.articleSlug ? postsBySlug.get(note.articleSlug)?.title : undefined}
              />
            ))
          ) : (
            <p className="border-t border-[color:var(--rule)] py-6 text-sm leading-7 text-[color:var(--ink-soft)]">
              还没有挂到具体文章的随想。
            </p>
          )}
        </section>

        <SiteFooter dictionary={dictionary} locale={typedLocale} site={site} />
      </div>
    </main>
  );
}
