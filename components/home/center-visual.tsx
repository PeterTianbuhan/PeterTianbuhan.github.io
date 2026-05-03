import Link from "next/link";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/site";

export function CenterVisual({
  dictionary,
  latestPosts,
  locale,
}: {
  dictionary: Dictionary;
  latestPosts: PostListItem[];
  locale: Locale;
}) {
  return (
    <section className="panel-frame surface-grid boot-in delay-2 relative min-h-[420px] overflow-hidden rounded-[36px] lg:min-h-[680px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_52%)]" />
      <div className="absolute inset-0 opacity-40 scan-lines mix-blend-screen" />
      <div className="orbital-shell absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.08)]" />
      <div className="orbital-shell absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" />
      <div className="orbital-core absolute left-1/2 top-1/2 h-[33%] w-[33%] rounded-full border border-white/20 bg-[radial-gradient(circle_at_28%_28%,rgba(255,255,255,0.26),rgba(255,255,255,0.05)_46%,transparent_72%)] shadow-[0_0_80px_rgba(255,255,255,0.14)]" />
      <div className="absolute left-1/2 top-1/2 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            className="absolute h-1.5 w-1.5 rounded-full bg-white/85 shadow-[0_0_16px_rgba(255,255,255,0.95)]"
            key={index}
            style={{
              left: `${8 + ((index * 23) % 84)}%`,
              top: `${11 + ((index * 19) % 76)}%`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-6 top-6 flex items-center justify-end text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-muted)] sm:inset-x-8 sm:top-8">
        <span className="mono">writing entry</span>
      </div>
      {latestPosts.length ? (
        <div className="absolute bottom-20 left-5 right-5 z-10 rounded-[28px] border border-white/12 bg-black/45 p-5 backdrop-blur-md sm:bottom-24 sm:left-8 sm:right-8 sm:p-6">
          <div className="mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-muted)]">
            blog.entry
          </div>
          <Link className="group mt-4 block" href={`/${locale}/blog`}>
            <div className="max-w-[18ch] text-2xl font-medium tracking-[-0.04em] text-white transition group-hover:text-white/92 sm:text-[2rem]">
              {dictionary.blog.title}
            </div>
            <p className="mt-3 max-w-[40rem] text-sm leading-7 text-[color:var(--text-soft)] sm:text-base">
              {dictionary.blog.description}
            </p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                {latestPosts.length} {latestPosts.length === 1 ? "post" : "posts"}
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.3em] text-white/80 transition group-hover:translate-x-1">
                {dictionary.home.readArticle}
              </span>
            </div>
          </Link>
          <div className="mt-4 border-t border-white/8 pt-4">
            <div className="grid gap-3">
              {latestPosts.map((post) => (
                <Link
                  className="flex items-center justify-between gap-4 text-sm text-[color:var(--text-soft)] transition hover:text-white"
                  href={`/${locale}/blog/${post.slug}`}
                  key={post.slug}
                >
                  <span className="max-w-[26ch] truncate">{post.title}</span>
                  <span className="mono shrink-0 text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    {post.publishedAtLabel}
                  </span>
                </Link>
              ))}
              <Link
                className="mono mt-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-soft)] transition hover:text-white"
                href={`/${locale}/blog`}
              >
                {dictionary.home.blogCta}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-[11px] text-[color:var(--text-muted)] sm:bottom-8 sm:left-8 sm:right-8">
        <span className="mono">{"//"} css-rendered visual nucleus</span>
        <span className="mono">index ready</span>
      </div>
    </section>
  );
}
