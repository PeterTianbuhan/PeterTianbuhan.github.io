import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { articleSeries, getProfilesBySeries, readingModes } from "@/lib/article-registry";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type {
  Dictionary,
  LocalizedProject,
  SiteContent,
} from "@/lib/site";

type HomeViewProps = {
  dictionary: Dictionary;
  locale: Locale;
  posts: PostListItem[];
  site: SiteContent;
};

type IconName = "arrow" | "book" | "code" | "globe" | "note" | "pulse";

const statusDot = {
  blue: "bg-[#2f80bd]",
  amber: "bg-[#d99a27]",
  green: "bg-[#2f8b6d]",
};

const statusPill = {
  blue: "bg-[#e5f0f6] text-[#2d6f9f]",
  amber: "bg-[#f7ead1] text-[#9b6a18]",
  green: "bg-[#dcefe8] text-[#27765d]",
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = "fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round";

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      {name === "arrow" ? <path className={common} d="M5 12h14m-5-5 5 5-5 5" /> : null}
      {name === "book" ? (
        <path className={common} d="M5 5.5h7a3 3 0 0 1 3 3v10a3 3 0 0 0-3-3H5zM15 8.5a3 3 0 0 1 3-3h1v10h-1a3 3 0 0 0-3 3z" />
      ) : null}
      {name === "code" ? <path className={common} d="m9 8-4 4 4 4m6-8 4 4-4 4" /> : null}
      {name === "globe" ? (
        <path className={common} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-9h16M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3c-2.2 2.4-3.3 5.4-3.3 9s1.1 6.6 3.3 9" />
      ) : null}
      {name === "note" ? (
        <path className={common} d="M7 4.5h7l3 3v12H7zM14 4.5v3h3M9.5 11h5M9.5 14h5M9.5 17h3" />
      ) : null}
      {name === "pulse" ? <path className={common} d="M4 13h4l2-6 4 12 2-6h4" /> : null}
    </svg>
  );
}

function resolveLocalPath(locale: Locale, href: string) {
  if (href.startsWith("http") || href.startsWith(`/${locale}`)) {
    return href;
  }

  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

function getEmptyMessage(locale: Locale) {
  return locale === "zh" ? "耐心等待" : "Waiting patiently";
}

function getPostTypeLabel(post: PostListItem, locale: Locale) {
  const tag = post.tags[0];

  if (!tag) {
    return locale === "zh" ? "笔记" : "Note";
  }

  const labels: Record<string, Record<Locale, string>> = {
    agents: { zh: "智能体", en: "Agents" },
    build: { zh: "构建", en: "Build" },
    linear: { zh: "Linear", en: "Linear" },
    study: { zh: "学习", en: "Study" },
    thought: { zh: "随想", en: "Thought" },
    workflow: { zh: "工作流", en: "Workflow" },
  };

  return labels[tag]?.[locale] ?? tag;
}

function getHomeMapLabels(locale: Locale) {
  return locale === "zh"
    ? {
        mapTitle: "阅读地图",
        mapSubtitle: "先选主题路径，再进入文章。首页只负责给你方向，不再把所有内容摊开。",
        mapCta: "从地图开始",
        visualCta: "可视化文章库",
        pathStart: "建议先读",
        modeTitle: "阅读方式",
        latestTitle: "最近更新",
        latestCta: "进入原文",
      }
    : {
        mapTitle: "Reading map",
        mapSubtitle: "Start from a topic path, then enter the article. The homepage points to structure instead of flattening every note.",
        mapCta: "Start with map",
        visualCta: "Visual notes",
        pathStart: "Start with",
        modeTitle: "Reading modes",
        latestTitle: "Recent updates",
        latestCta: "Read",
      };
}

function ProjectIcon({ index }: { index: number }) {
  const icons: IconName[] = ["note", "globe", "pulse"];

  return (
    <div className="grid size-20 place-items-center border border-[color:var(--rule)] bg-[color:var(--surface)] text-[color:var(--accent-strong)] shadow-[0_14px_30px_rgba(31,28,21,0.06)]">
      <Icon className="size-7" name={icons[index % icons.length]} />
    </div>
  );
}

function NotebookPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-[color:var(--rule)] bg-[color:var(--surface)] shadow-[var(--shadow-panel)] ${className}`}>
      {children}
    </section>
  );
}

function Hero({
  dictionary,
  locale,
  site,
}: {
  dictionary: Dictionary;
  locale: Locale;
  site: SiteContent;
}) {
  const labels = getHomeMapLabels(locale);
  const readingMapHref = locale === "zh" ? `/${locale}/reading-map` : `/${locale}/blog`;
  const emptyMessage = getEmptyMessage(locale);

  return (
    <section className="relative mx-auto grid min-h-[640px] max-w-[1200px] items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
      <p className="hand-note hidden xl:block">{site.heroTagline}</p>

      <div className="max-w-[35rem]">
        <h1 className="academic-serif max-w-[10ch] text-[3.75rem] font-semibold leading-[0.95] tracking-normal text-[color:var(--ink)] sm:text-[5.35rem]">
          {site.heroTitle}
        </h1>
        <div className="mt-3 h-[5px] w-36 -rotate-2 bg-[#4fa37d]" />
        <p className="mt-8 max-w-[30rem] text-lg leading-9 text-[color:var(--ink-soft)]">
          {site.intro}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link className="paper-button paper-button-primary" href={readingMapHref}>
            <span>{locale === "zh" ? labels.mapCta : dictionary.home.primaryCta}</span>
            <Icon className="size-4" name="arrow" />
          </Link>
          <Link className="paper-link text-sm" href="#contact">
            {dictionary.home.secondaryCta}
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <NotebookPanel className="border-l-4 border-l-[color:var(--accent)] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className="size-5 text-[color:var(--accent-strong)]" name="book" />
              <h2 className="academic-serif text-2xl font-semibold text-[color:var(--ink)]">{labels.mapTitle}</h2>
            </div>
            <Link className="paper-link text-sm font-semibold" href={readingMapHref}>
              {dictionary.home.viewAll}
              <Icon className="size-3" name="arrow" />
            </Link>
          </div>
          <p className="max-w-[33rem] text-base leading-8 text-[color:var(--ink-soft)]">{labels.mapSubtitle}</p>
          <div className="mt-5 grid gap-3">
            {locale === "zh" ? (
              articleSeries.slice(0, 3).map((series) => {
                const count = getProfilesBySeries(series.id).length;

                return (
                  <Link
                    className="grid grid-cols-[2.7rem_1fr_auto] items-center gap-3 border-t border-[color:var(--rule)] px-3 pt-3 text-sm transition hover:bg-[color:var(--surface-muted)]"
                    href={readingMapHref}
                    key={series.id}
                  >
                    <span className="mono grid size-8 place-items-center bg-[color:var(--accent-soft)] text-[11px] font-semibold text-[color:var(--accent-strong)]">
                      {String(count).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-[color:var(--ink)]">{series.title}</span>
                    <Icon className="size-4 text-[color:var(--accent-strong)]" name="arrow" />
                  </Link>
                );
              })
            ) : (
              ["Notes", "Projects", "Contact"].map((item, index) => (
                <Link
                  className="grid grid-cols-[2.2rem_1fr_auto] items-center gap-3 border-t border-[color:var(--rule)] pt-3 text-sm transition hover:text-[#2f8b6d]"
                  href={index === 0 ? `/${locale}/blog` : index === 1 ? `/${locale}#projects` : "#contact"}
                  key={item}
                >
                  <span className="mono text-[10px] font-semibold text-[color:var(--accent-strong)]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-semibold text-[color:var(--ink)]">{item}</span>
                  <Icon className="size-3 text-[color:var(--accent-strong)]" name="arrow" />
                </Link>
              ))
            )}
          </div>
        </NotebookPanel>

        <NotebookPanel className="p-6 shadow-[0_12px_34px_rgba(31,28,21,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className="size-4 text-[color:var(--ink-soft)]" name="code" />
              <h2 className="academic-serif text-xl font-semibold text-[color:var(--ink)]">{dictionary.home.incubatingProjects}</h2>
            </div>
            <a className="paper-link text-xs" href="#projects">
              {dictionary.home.viewAll}
              <Icon className="size-3" name="arrow" />
            </a>
          </div>
          <div className="space-y-5">
            {site.projects.length > 0 ? (
              site.projects.map((project) => (
                <div className="grid gap-3 border-t border-[color:var(--rule-soft)] pt-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center" key={project.slug}>
                  <span className="font-semibold text-[color:var(--ink)]">{project.name}</span>
                  <span className={`rounded-full px-3 py-1 text-xs ${statusPill[project.statusTone]}`}>
                    {project.status}
                  </span>
                  <Link className="paper-link text-xs" href={resolveLocalPath(locale, project.logHref)}>
                    {dictionary.home.projectCta}
                    <Icon className="size-3" name="arrow" />
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{emptyMessage}</p>
            )}
          </div>
        </NotebookPanel>
      </div>

      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-xs text-[color:var(--muted)] lg:flex">
        <span className="text-xl leading-none">↓</span>
        <span className="mono">{dictionary.home.scroll}</span>
      </div>
    </section>
  );
}

function Projects({
  dictionary,
  locale,
  projects,
}: {
  dictionary: Dictionary;
  locale: Locale;
  projects: LocalizedProject[];
}) {
  const emptyMessage = getEmptyMessage(locale);

  return (
    <section className="section-rule px-6 py-14 sm:px-8" id="projects">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="academic-serif text-4xl font-semibold text-[color:var(--ink)]">{dictionary.home.projectsTitle}</h2>
            <p className="mt-4 max-w-[42rem] text-base leading-8 text-[color:var(--ink-soft)]">{dictionary.home.projectsSubtitle}</p>
          </div>
          <span className="mono border-l-2 border-[color:var(--accent)] pl-3 text-xs font-semibold uppercase text-[color:var(--accent-strong)]">{dictionary.home.allProjects}</span>
        </div>

        {projects.length > 0 ? (
          <div className="divide-y divide-[color:var(--rule)]">
            {projects.map((project, index) => (
              <article className="grid gap-6 py-9 lg:grid-cols-[7rem_1fr_15rem_8rem]" key={project.slug}>
                <ProjectIcon index={index} />
                <div>
                  <h3 className="academic-serif text-3xl font-semibold text-[color:var(--ink)]">{project.name}</h3>
                  <p className="mt-3 max-w-[38rem] text-base leading-8 text-[color:var(--ink-soft)]">
                    {project.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span className="rounded-full border border-[color:var(--rule-soft)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)]" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm leading-7 text-[color:var(--ink-soft)]">
                  <div className="flex items-center gap-3 font-semibold text-[color:var(--ink)]">
                    <span className={`size-1.5 ${statusDot[project.statusTone]}`} />
                    {project.status}
                  </div>
                  <p className="mt-4">{project.meta}</p>
                </div>
                <div className="flex flex-col items-start gap-4 text-sm">
                  <Link className="paper-link" href={resolveLocalPath(locale, project.logHref)}>
                    {dictionary.home.projectCta}
                    <Icon className="size-4" name="arrow" />
                  </Link>
                  {project.link ? (
                    <Link className="paper-link" href={project.link} rel="noreferrer" target="_blank">
                      GitHub
                      <Icon className="size-4" name="arrow" />
                    </Link>
                  ) : (
                    <span className="text-[color:var(--muted)]">{dictionary.home.githubSoon}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="border-y border-[color:var(--rule)] py-8 text-sm leading-7 text-[color:var(--ink-soft)]">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

function LatestNotes({
  dictionary,
  locale,
  posts,
}: {
  dictionary: Dictionary;
  locale: Locale;
  posts: PostListItem[];
}) {
  const icons: IconName[] = ["book", "code", "pulse", "book", "note"];
  const emptyMessage = getEmptyMessage(locale);

  return (
    <section className="section-rule px-6 py-14 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="academic-serif text-3xl font-normal">{dictionary.home.latestNotes}</h2>
            <p className="mt-3 text-sm text-[color:var(--ink-soft)]">{dictionary.home.notesSubtitle}</p>
          </div>
          <Link className="paper-link text-sm" href={`/${locale}/blog`}>
            {dictionary.home.allNotes}
            <Icon className="size-4" name="arrow" />
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="divide-y divide-[color:var(--rule)]">
            {posts.map((post, index) => (
              <Link
                className="grid gap-5 py-6 transition hover:bg-[rgba(242,242,239,0.42)] sm:grid-cols-[4rem_1fr_auto_auto]"
                href={`/${locale}/blog/${post.slug}`}
                key={post.slug}
              >
                <Icon className="size-6 self-start text-[color:var(--ink-soft)]" name={icons[index % icons.length]} />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="academic-serif text-2xl font-normal">{post.title}</h3>
                    {post.tags[0] ? (
                      <span className="rounded-full bg-[#e5f0f6] px-3 py-1 text-xs text-[#2d6f9f]">
                        {post.tags[0]}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-[42rem] text-sm leading-7 text-[color:var(--ink-soft)]">
                    {post.excerpt}
                  </p>
                </div>
                <span className="text-sm text-[color:var(--muted)]">{post.publishedAtLabel}</span>
                <span className="mono text-xs text-[color:var(--muted)]">{dictionary.home.readArticle}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="border-y border-[color:var(--rule)] py-8 text-sm leading-7 text-[color:var(--ink-soft)]">
            {emptyMessage}
          </p>
        )}

        <div className="mt-10 text-center">
          <Link className="paper-link justify-center text-sm" href={`/${locale}/blog`}>
            {dictionary.home.moreNotes}
            <Icon className="size-4" name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReadingGateway({
  locale,
  posts,
}: {
  locale: Locale;
  posts: PostListItem[];
}) {
  const labels = getHomeMapLabels(locale);
  const latestPosts = posts.slice(0, 3);
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const readingMapHref = locale === "zh" ? `/${locale}/reading-map` : `/${locale}/blog`;
  const visualHref = locale === "zh" ? `/${locale}/visual-notes` : `/${locale}/blog`;

  return (
    <section className="section-rule px-6 py-14 sm:px-8" id="reading">
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="academic-serif text-4xl font-semibold text-[color:var(--ink)]">{labels.mapTitle}</h2>
              <p className="mt-4 max-w-[42rem] text-base leading-8 text-[color:var(--ink-soft)]">
                {labels.mapSubtitle}
              </p>
            </div>
            <Link className="paper-link text-base font-semibold" href={readingMapHref}>
              {labels.mapCta}
              <Icon className="size-4" name="arrow" />
            </Link>
          </div>

          <div className="divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule)]">
            {articleSeries.map((series, index) => {
              const profiles = getProfilesBySeries(series.id);
              const firstPost = profiles.map((profile) => postsBySlug.get(profile.slug)).find(Boolean);

              return (
                <Link
                  className="grid gap-4 py-7 transition hover:bg-[rgba(255,253,248,0.72)] sm:grid-cols-[4rem_1fr_auto]"
                  href={readingMapHref}
                  key={series.id}
                >
                  <div className="mono text-sm font-semibold text-[color:var(--accent-strong)]">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h3 className="academic-serif text-3xl font-semibold text-[color:var(--ink)]">{series.title}</h3>
                    <p className="mt-3 max-w-[42rem] text-base leading-8 text-[color:var(--ink-soft)]">
                      {series.description}
                    </p>
                    {firstPost ? (
                      <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                        {labels.pathStart}: {firstPost.title}
                      </p>
                    ) : null}
                  </div>
                  <span className="mono self-center text-xs font-semibold text-[color:var(--ink-soft)]">
                    {profiles.length} notes
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="grid content-start gap-5">
          <NotebookPanel className="p-6">
            <h3 className="academic-serif text-2xl font-semibold text-[color:var(--ink)]">{labels.modeTitle}</h3>
            <div className="mt-5 grid gap-3">
              {Object.values(readingModes).map((mode) => (
                <Link
                  className="border-l-4 border-[color:var(--accent)] bg-white px-4 py-3 transition hover:bg-[color:var(--surface-muted)]"
                  href={mode.label === readingModes.full.label ? `/${locale}/blog` : readingMapHref}
                  key={mode.label}
                >
                  <div className="text-base font-semibold text-[color:var(--ink)]">{mode.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">{mode.description}</p>
                </Link>
              ))}
            </div>
            {locale === "zh" ? (
              <Link className="paper-link mt-5 text-sm" href={visualHref}>
                {labels.visualCta}
                <Icon className="size-4" name="arrow" />
              </Link>
            ) : null}
          </NotebookPanel>

          <NotebookPanel className="p-6">
            <h3 className="academic-serif text-2xl font-semibold text-[color:var(--ink)]">{labels.latestTitle}</h3>
            <div className="mt-5 space-y-4">
              {latestPosts.length ? (
                latestPosts.map((post) => (
                  <Link
                    className="block border-t border-[color:var(--rule)] pt-4 transition hover:text-[#2f8b6d]"
                    href={`/${locale}/blog/${post.slug}`}
                    key={post.slug}
                  >
                    <div className="text-base font-semibold leading-7 text-[color:var(--ink)]">{post.title}</div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[color:var(--muted)]">
                      <span>{getPostTypeLabel(post, locale)}</span>
                      <span>{post.publishedAtLabel}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{getEmptyMessage(locale)}</p>
              )}
            </div>
          </NotebookPanel>
        </aside>
      </div>
    </section>
  );
}

export function HomeView({ dictionary, locale, posts, site }: HomeViewProps) {
  const alternatePath = `/${locale === "zh" ? "en" : "zh"}`;
  const latestPosts = posts.slice(0, 5);

  return (
    <main className="notebook-page min-h-screen bg-[color:var(--background)] text-[color:var(--ink)]">
      <SiteHeader alternatePath={alternatePath} dictionary={dictionary} locale={locale} />
      <Hero dictionary={dictionary} locale={locale} site={site} />
      <Projects dictionary={dictionary} locale={locale} projects={site.projects} />
      {locale === "zh" ? (
        <ReadingGateway locale={locale} posts={posts} />
      ) : (
        <LatestNotes dictionary={dictionary} locale={locale} posts={latestPosts} />
      )}
      <SiteFooter dictionary={dictionary} locale={locale} site={site} />
    </main>
  );
}
