import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type {
  Dictionary,
  LocalizedLearningStage,
  LocalizedProject,
  SiteContent,
} from "@/lib/site";

type HomeViewProps = {
  dictionary: Dictionary;
  latestPosts: PostListItem[];
  locale: Locale;
  site: SiteContent;
};

type IconName = "arrow" | "book" | "code" | "globe" | "pulse" | "terminal";

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

const stageRing = {
  current: "border-[#6ba992] text-[#27765d]",
  next: "border-[#b9bdc2] text-[#202225]",
  later: "border-[#c9cdd1] text-[#202225]",
  future: "border-[#c9cdd1] text-[#202225]",
};

const stageText = {
  current: "text-[#27765d]",
  next: "text-[#2f80bd]",
  later: "text-[#b07124]",
  future: "text-[#7a828a]",
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
      {name === "pulse" ? <path className={common} d="M4 13h4l2-6 4 12 2-6h4" /> : null}
      {name === "terminal" ? <path className={common} d="m7 8 4 4-4 4m6 0h5" /> : null}
    </svg>
  );
}

function resolveLocalPath(locale: Locale, href: string) {
  if (href.startsWith("http") || href.startsWith(`/${locale}`)) {
    return href;
  }

  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

function ProjectIcon({ index }: { index: number }) {
  const icons: IconName[] = ["terminal", "globe", "pulse"];

  return (
    <div className="grid size-20 place-items-center bg-[#f1f0ed] text-[color:var(--ink-soft)]">
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
    <section className={`border border-[color:var(--rule)] bg-[color:var(--surface)]/82 ${className}`}>
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
  return (
    <section className="relative mx-auto grid min-h-[640px] max-w-[1200px] items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-20">
      <p className="hand-note hidden xl:block">{site.heroTagline}</p>

      <div className="max-w-[34rem]">
        <h1 className="academic-serif text-[3.35rem] font-normal leading-[0.98] tracking-normal text-[color:var(--ink)] sm:text-[4.8rem]">
          {site.heroTitle}
        </h1>
        <div className="mt-3 h-[5px] w-36 -rotate-2 bg-[#4fa37d]" />
        <p className="mt-8 max-w-[29rem] text-base leading-8 text-[color:var(--ink-soft)]">
          {site.intro}
          <br />
          {site.bio}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link className="paper-button paper-button-primary" href={`/${locale}/blog`}>
            <span>{dictionary.home.primaryCta}</span>
            <Icon className="size-4" name="arrow" />
          </Link>
          <Link className="paper-link text-sm" href="#contact">
            {dictionary.home.secondaryCta}
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <NotebookPanel className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className="size-4 text-[color:var(--ink-soft)]" name="arrow" />
              <h2 className="academic-serif text-xl font-normal">{dictionary.home.recentPath}</h2>
            </div>
            <Link className="paper-link text-xs" href={`/${locale}/blog`}>
              {dictionary.home.viewAll}
              <Icon className="size-3" name="arrow" />
            </Link>
          </div>
          <div className="space-y-4">
            {site.activity.map((item) => (
              <div className="grid grid-cols-[0.55rem_6rem_1fr_auto] items-baseline gap-4 text-sm" key={`${item.type}-${item.time}`}>
                <span className="size-1.5 bg-[color:var(--muted)]" />
                <span className="text-[color:var(--ink-soft)]">{item.type}:</span>
                <span className="text-[color:var(--ink)]">{item.text}</span>
                <span className="text-xs text-[color:var(--muted)]">{item.time}</span>
              </div>
            ))}
          </div>
        </NotebookPanel>

        <NotebookPanel className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className="size-4 text-[color:var(--ink-soft)]" name="code" />
              <h2 className="academic-serif text-xl font-normal">{dictionary.home.incubatingProjects}</h2>
            </div>
            <a className="paper-link text-xs" href="#projects">
              {dictionary.home.viewAll}
              <Icon className="size-3" name="arrow" />
            </a>
          </div>
          <div className="space-y-5">
            {site.projects.map((project) => (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm" key={project.slug}>
                <span className="text-[color:var(--ink)]">{project.name}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${statusPill[project.statusTone]}`}>
                  {project.status}
                </span>
                <Link className="paper-link text-xs" href={resolveLocalPath(locale, project.logHref)}>
                  {dictionary.home.projectCta}
                  <Icon className="size-3" name="arrow" />
                </Link>
              </div>
            ))}
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

function LearningPath({
  dictionary,
  locale,
  stages,
}: {
  dictionary: Dictionary;
  locale: Locale;
  stages: LocalizedLearningStage[];
}) {
  return (
    <section className="section-rule px-6 py-14 sm:px-8" id="learning">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="academic-serif text-3xl font-normal">{dictionary.home.learningPath}</h2>
            <p className="mt-3 text-sm text-[color:var(--ink-soft)]">{dictionary.home.learningSubtitle}</p>
          </div>
          <Link className="paper-link text-sm" href={`/${locale}/blog`}>
            {dictionary.home.detailedView}
            <Icon className="size-4" name="arrow" />
          </Link>
        </div>

        <div className="relative grid gap-8 md:grid-cols-4">
          <div className="absolute left-12 right-12 top-5 hidden border-t border-dashed border-[#bab7af] md:block" />
          {stages.map((stage) => (
            <article className="relative" key={stage.number}>
              <div className={`relative z-10 grid size-11 place-items-center rounded-full border-2 bg-[color:var(--background)] text-lg ${stageRing[stage.statusTone]}`}>
                {stage.number}
              </div>
              <div className="mt-7 border-l border-[color:var(--rule)] pl-6 md:min-h-[18rem]">
                <h3 className="academic-serif text-2xl font-normal">{stage.title}</h3>
                <p className={`mt-1 text-sm ${stageText[stage.statusTone]}`}>{stage.status}</p>
                <p className="mt-6 max-w-[17rem] text-sm leading-7 text-[color:var(--ink-soft)]">
                  {stage.summary}
                </p>
                <ul className="mt-7 space-y-3 text-sm text-[color:var(--ink-soft)]">
                  {stage.items.map((item) => (
                    <li className="flex items-center gap-3" key={item}>
                      <Icon className="size-4 text-[color:var(--muted)]" name="book" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="paper-link mt-5 text-sm" href={`/${locale}/blog`}>
                  {dictionary.home.blogCta}
                  <Icon className="size-4" name="arrow" />
                </Link>
              </div>
            </article>
          ))}
        </div>
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
  return (
    <section className="section-rule px-6 py-14 sm:px-8" id="projects">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="academic-serif text-3xl font-normal">{dictionary.home.projectsTitle}</h2>
            <p className="mt-3 text-sm text-[color:var(--ink-soft)]">{dictionary.home.projectsSubtitle}</p>
          </div>
          <span className="text-sm text-[color:var(--ink-soft)]">{dictionary.home.allProjects}</span>
        </div>

        <div className="divide-y divide-[color:var(--rule)]">
          {projects.map((project, index) => (
            <article className="grid gap-6 py-8 lg:grid-cols-[7rem_1fr_15rem_8rem]" key={project.slug}>
              <ProjectIcon index={index} />
              <div>
                <h3 className="academic-serif text-2xl font-normal">{project.name}</h3>
                <p className="mt-2 max-w-[32rem] text-sm leading-7 text-[color:var(--ink-soft)]">
                  {project.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span className="rounded-full bg-[#eef1ee] px-3 py-1 text-xs text-[color:var(--ink-soft)]" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-[color:var(--ink-soft)]">
                <div className="flex items-center gap-3">
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
                  <Link className="paper-link" href={project.link} target="_blank">
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
  const icons: IconName[] = ["book", "code", "pulse", "book", "terminal"];

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

export function HomeView({ dictionary, latestPosts, locale, site }: HomeViewProps) {
  const alternatePath = `/${locale === "zh" ? "en" : "zh"}`;

  return (
    <main className="notebook-page min-h-screen bg-[color:var(--background)] text-[color:var(--ink)]">
      <SiteHeader alternatePath={alternatePath} dictionary={dictionary} locale={locale} />
      <Hero dictionary={dictionary} locale={locale} site={site} />
      <LearningPath dictionary={dictionary} locale={locale} stages={site.learningPath} />
      <Projects dictionary={dictionary} locale={locale} projects={site.projects} />
      <LatestNotes dictionary={dictionary} locale={locale} posts={latestPosts} />
      <SiteFooter dictionary={dictionary} locale={locale} site={site} />
    </main>
  );
}
