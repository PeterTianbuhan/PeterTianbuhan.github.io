import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Panel } from "@/components/ui/panel";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getSiteContent, type Dictionary } from "@/lib/site";

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

  return (
    <main className="surface-grid min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <SiteHeader
          alternatePath={`/${locale === "zh" ? "en" : "zh"}/blog`}
          dictionary={dictionary}
          locale={locale}
        />

        <Panel className="boot-in rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            {dictionary.blog.eyebrow}
          </div>
          <h1 className="mt-4 max-w-[10ch] text-5xl font-medium leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl">
            {dictionary.blog.title}
          </h1>
          <p className="mt-6 max-w-[42rem] text-base leading-8 text-[color:var(--text-soft)]">
            {dictionary.blog.description}
          </p>
        </Panel>

        <section className="grid gap-4">
          {posts.map((post, index) => (
            <Link
              className={`panel-frame rounded-[30px] px-6 py-6 transition duration-300 hover:border-white/20 hover:bg-white/[0.06] sm:px-7 ${
                index === 0 ? "boot-in delay-1" : "boot-in delay-2"
              }`}
              href={`/${locale}/blog/${post.slug}`}
              key={post.slug}
            >
              <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-2xl font-medium tracking-[-0.04em] text-white">{post.title}</div>
                  <p className="mt-4 max-w-[55ch] text-sm leading-7 text-[color:var(--text-soft)]">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        className="mono rounded-full border border-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]"
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
            </Link>
          ))}
        </section>

        <SiteFooter dictionary={dictionary} locale={locale} site={site} />
      </div>
    </main>
  );
}
