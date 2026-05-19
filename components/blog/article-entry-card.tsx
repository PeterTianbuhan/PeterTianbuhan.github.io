import Link from "next/link";
import {
  getArticleSeries,
  readingModes,
  type ArticleProfile,
} from "@/lib/article-registry";

export function ArticleEntryCard({
  articleHref,
  profile,
  visualHref,
}: {
  articleHref: string;
  profile: ArticleProfile;
  visualHref?: string | null;
}) {
  const series = getArticleSeries(profile.seriesId);

  return (
    <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.92)] px-5 py-5 shadow-[var(--shadow-panel)] sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="mono text-[10px] tracking-[0.18em] text-[color:var(--text-muted)]">
            {series ? series.title : "Article Entry"}
          </div>
          <h2 className="academic-serif mt-3 text-2xl font-normal leading-tight tracking-normal text-[color:var(--ink)]">
            这篇文章回答什么问题？
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--ink)]">{profile.question}</p>
          <p className="mt-4 border-l-2 border-[#9b6a43] pl-4 text-sm leading-7 text-[color:var(--text-soft)]">
            {profile.thesis}
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">
            适合读者：{profile.audience}
          </p>
        </div>

        <div className="grid content-start gap-3">
          <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            Reading Modes
          </div>
          <Link
            className="block border border-[color:var(--rule)] bg-white px-4 py-3 transition hover:border-[color:var(--accent)]"
            href={visualHref ?? articleHref}
          >
            <div className="text-sm font-semibold text-[color:var(--ink)]">{readingModes.skim.label}</div>
            <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">{readingModes.skim.description}</p>
          </Link>
          {visualHref ? (
            <Link
              className="block border border-[#9b6a43] bg-[#f8f2ea] px-4 py-3 transition hover:bg-[#f4eadc]"
              href={visualHref}
            >
              <div className="text-sm font-semibold text-[#6f4c30]">{readingModes.understand.label}</div>
              <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">
                {readingModes.understand.description}
              </p>
            </Link>
          ) : null}
          <Link
            className="block border border-[color:var(--rule)] bg-white px-4 py-3 transition hover:border-[color:var(--accent)]"
            href={articleHref}
          >
            <div className="text-sm font-semibold text-[color:var(--ink)]">{readingModes.full.label}</div>
            <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">{readingModes.full.description}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
