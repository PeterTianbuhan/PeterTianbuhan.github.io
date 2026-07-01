import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { PostListItem, SectionKey } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { Dictionary, SiteContent } from "@/lib/site";

type HomeViewProps = {
  dictionary: Dictionary;
  locale: Locale;
  posts: PostListItem[];
  site: SiteContent;
};

type Section = {
  key: SectionKey;
  label: string;
  note: string;
};

// 首页按 life vault 的种类组织：思考 / 在学 / 在做 / 生活。
// 每个 section 对应 vault 的一个种类文件夹；内容由发布脚本按 `section` 字段自动归位。
const SECTIONS: Section[] = [
  {
    key: "thinking",
    label: "思考",
    note: "我在想的问题——观点、原则，和还没有定论的判断。",
  },
  {
    key: "learning",
    label: "在学",
    note: "公开学习的记录——系统、网络、工程与 AI 工具。",
  },
  {
    key: "building",
    label: "在做",
    note: "正在维护的项目——过程、决策与复盘。",
  },
  {
    key: "life",
    label: "生活",
    note: "慢下来的记录——生活、创作与表达实验。",
  },
];

const HOME_LIMIT = 3;

function EntryRow({ post, locale }: { post: PostListItem; locale: Locale }) {
  return (
    <Link
      className="group grid gap-2 border-t border-[color:var(--rule-soft)] py-6 transition sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-10"
      href={`/${locale}/blog/${post.slug}`}
    >
      <div className="min-w-0">
        <h3 className="academic-serif text-2xl font-normal leading-snug tracking-tight text-[color:var(--ink)] transition group-hover:text-[color:var(--accent-strong)]">
          {post.title}
        </h3>
        <p className="mt-2 max-w-[54ch] text-sm leading-7 text-[color:var(--muted)]">
          {post.excerpt}
        </p>
      </div>
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.26em] text-[color:var(--muted)]">
        {post.publishedAtLabel}
      </span>
    </Link>
  );
}

function SectionBlock({
  index,
  section,
  posts,
  locale,
}: {
  index: number;
  section: Section;
  posts: PostListItem[];
  locale: Locale;
}) {
  const inSection = posts.filter((post) => post.section === section.key);
  const entries = inSection.slice(0, HOME_LIMIT);
  const hasMore = inSection.length > entries.length;

  return (
    <section className="mx-auto max-w-[900px] px-6 py-16 sm:px-8 sm:py-20">
      <div className="flex items-baseline justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <span className="mono text-xs tracking-[0.3em] text-[color:var(--accent)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="academic-serif text-3xl font-normal tracking-tight text-[color:var(--ink)] sm:text-[2.6rem]">
            {section.label}
          </h2>
        </div>
        <Link className="paper-link text-xs" href={`/${locale}/blog`}>
          全部
        </Link>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="h-px w-8 bg-[color:var(--accent)]" />
        <p className="max-w-[46ch] text-sm leading-7 text-[color:var(--muted)]">
          {section.note}
        </p>
      </div>

      <div className="mt-8">
        {entries.length > 0 ? (
          <>
            {entries.map((post) => (
              <EntryRow key={post.slug} locale={locale} post={post} />
            ))}
            {hasMore ? (
              <Link
                className="paper-link mt-6 inline-flex text-xs"
                href={`/${locale}/blog`}
              >
                更多 →
              </Link>
            ) : null}
          </>
        ) : (
          <p className="border-t border-[color:var(--rule-soft)] py-6 text-sm leading-7 text-[color:var(--muted)]">
            即将从我的笔记里挑选公开。
          </p>
        )}
      </div>
    </section>
  );
}

export function HomeView({ dictionary, locale, posts, site }: HomeViewProps) {
  const latest = posts[0];

  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--ink)]">
      <SiteHeader dictionary={dictionary} locale={locale} />

      <section className="mx-auto max-w-[900px] px-6 pb-10 pt-24 sm:px-8 sm:pt-32">
        <h1 className="academic-serif max-w-[15ch] text-5xl font-normal leading-[1.04] tracking-tight text-[color:var(--ink)] sm:text-[5.5rem]">
          {site.heroTitle}
        </h1>
        <p className="mt-8 max-w-[44ch] text-lg leading-9 text-[color:var(--ink-soft)]">
          {site.intro}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <Link className="paper-link" href={`/${locale}/blog`}>
            全部笔记
          </Link>
          <Link className="paper-link" href={`/${locale}#contact`}>
            关于我
          </Link>
          {latest ? (
            <span className="text-[color:var(--muted)]">
              <span className="text-[color:var(--accent)]">最近</span> ·{" "}
              <Link
                className="underline-offset-4 transition hover:text-[color:var(--ink)] hover:underline"
                href={`/${locale}/blog/${latest.slug}`}
              >
                {latest.title}
              </Link>
            </span>
          ) : null}
        </div>
      </section>

      {SECTIONS.map((section, index) => (
        <div className="border-t border-[color:var(--rule)]" key={section.key}>
          <SectionBlock
            index={index}
            locale={locale}
            posts={posts}
            section={section}
          />
        </div>
      ))}

      <div className="border-t border-[color:var(--rule)]">
        <SiteFooter dictionary={dictionary} locale={locale} site={site} />
      </div>
    </main>
  );
}
