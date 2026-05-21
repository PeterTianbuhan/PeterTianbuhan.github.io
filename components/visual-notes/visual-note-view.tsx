import Image from "next/image";
import Link from "next/link";
import { ArticleEntryCard } from "@/components/blog/article-entry-card";
import { getArticleProfile } from "@/lib/article-registry";
import type { Post } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { VisualNote } from "@/lib/visual-notes";

type ArticleSection = {
  id: string;
  level: number;
  snippets: string[];
  title: string;
};

function cleanInlineMdx(value: string) {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(value: string, maxLength = 150) {
  if (value.length <= maxLength) return value;

  const window = value.slice(0, maxLength);
  const breakpoint = Math.max(
    window.lastIndexOf("。"),
    window.lastIndexOf("；"),
    window.lastIndexOf(";"),
    window.lastIndexOf("."),
  );

  if (breakpoint > maxLength * 0.58) {
    return `${window.slice(0, breakpoint + 1)}...`;
  }

  return `${window.trimEnd()}...`;
}

function isUsefulSnippet(value: string) {
  if (value.length < 16) return false;
  if (/^[-|:]+$/.test(value)) return false;
  if (/^(import|export|const|return)\b/.test(value)) return false;
  return true;
}

function extractArticleSections(content: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;
  let inCodeBlock = false;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      current = {
        id: `section-${sections.length + 1}`,
        level: heading[1].length,
        snippets: [],
        title: cleanInlineMdx(heading[2]),
      };
      sections.push(current);
      continue;
    }

    if (!current || current.snippets.length >= 3) continue;

    const snippet = cleanInlineMdx(line.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, ""));
    if (isUsefulSnippet(snippet)) {
      current.snippets.push(shorten(snippet, current.level === 2 ? 170 : 130));
    }
  }

  return sections.filter((section) => section.title);
}

function sectionsForImage(sections: ArticleSection[], imageIndex: number, imageCount: number) {
  if (!sections.length || imageCount <= 0) return [];

  const start = Math.floor((imageIndex * sections.length) / imageCount);
  const end = Math.floor(((imageIndex + 1) * sections.length) / imageCount);
  return sections.slice(start, Math.max(start + 1, end));
}

function compactCount(value: number) {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1)}k`;
}

function readableCharacterCount(content: string) {
  return cleanInlineMdx(content)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s/g, "").length;
}

export function VisualNoteView({
  locale,
  note,
  post,
}: {
  locale: Locale;
  note: VisualNote;
  post?: Post | null;
}) {
  const articleHref = note.articleSlug ? `/${locale}/blog/${note.articleSlug}` : null;
  const visualHref = `/${locale}/visual-notes/${note.slug}`;
  const articleSections = post ? extractArticleSections(post.content) : [];
  const articleProfile = post ? getArticleProfile(post.slug) : null;
  const detailCount = articleSections.reduce((total, section) => total + section.snippets.length, 0);
  const characterCount = post ? readableCharacterCount(post.content) : 0;

  return (
    <main className="surface-grid min-h-screen text-[color:var(--ink)]">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-6 px-5 py-5 lg:px-8 lg:py-8">
        <header className="grid gap-6 border border-[color:var(--rule)] bg-[rgba(255,254,251,0.92)] p-5 shadow-[var(--shadow-panel)] lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="min-w-0">
            <Link
              className="mono text-xs uppercase tracking-[0.26em] text-[color:var(--text-muted)] transition hover:text-[color:var(--ink)]"
              href={`/${locale}/visual-notes`}
            >
              Peter Tian / Visual Articles
            </Link>
            <h1 className="academic-serif mt-4 max-w-5xl text-4xl font-normal leading-tight tracking-normal text-[color:var(--ink)] sm:text-5xl">
              {note.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-soft)]">
              {note.description}
            </p>
            {post ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
                原文：{post.meta.excerpt}
              </p>
            ) : null}
            {post?.meta.tags.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.meta.tags.map((tag) => (
                  <span
                    className="mono border border-[color:var(--rule)] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid content-start gap-3">
            <div className="grid grid-cols-3 border border-[color:var(--rule)] bg-white">
              <div className="border-r border-[color:var(--rule)] p-4">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">Frames</div>
                <div className="academic-serif mt-2 text-3xl leading-none">{note.images.length}</div>
              </div>
              <div className="border-r border-[color:var(--rule)] p-4">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">Sections</div>
                <div className="academic-serif mt-2 text-3xl leading-none">{articleSections.length || "-"}</div>
              </div>
              <div className="p-4">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">Detail</div>
                <div className="academic-serif mt-2 text-3xl leading-none">{detailCount || "-"}</div>
              </div>
            </div>
            {articleHref ? (
              <Link
                className="mono inline-flex justify-center border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-white transition hover:bg-[color:var(--accent-strong)]"
                href={articleHref}
              >
                阅读原文
              </Link>
            ) : null}
            <Link
              className="mono inline-flex justify-center border border-[color:var(--rule)] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
              href={`/${locale}/blog`}
            >
              文章列表
            </Link>
            {characterCount ? (
              <p className="text-xs leading-6 text-[color:var(--text-muted)]">
                这页保留图像序列、正文结构和摘录索引；原文约 {compactCount(characterCount)} 字符，可随时回跳核对。
              </p>
            ) : null}
          </div>
        </header>

        {articleProfile && articleHref ? (
          <ArticleEntryCard articleHref={articleHref} profile={articleProfile} visualHref={visualHref} />
        ) : null}

        {note.htmlGuideSrc ? (
          <section
            className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.94)] p-5 shadow-[var(--shadow-panel)] lg:p-6"
            id="html-guide"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                  Interactive Guide
                </div>
                <h2 className="academic-serif mt-3 text-3xl font-normal tracking-normal text-[color:var(--ink)]">
                  {note.htmlGuideTitle ?? "HTML 视觉导读"}
                </h2>
              </div>
              <Link
                className="mono inline-flex self-start border border-[color:var(--rule)] bg-white px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                href={note.htmlGuideSrc}
                rel="noreferrer"
                target="_blank"
              >
                单独打开
              </Link>
            </div>
            <div className="mt-5 overflow-hidden border border-[color:var(--rule)] bg-white">
              <iframe
                className="h-[76vh] min-h-[620px] w-full bg-white"
                loading="lazy"
                src={note.htmlGuideSrc}
                title={note.htmlGuideTitle ?? "HTML 视觉导读"}
              />
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <nav className="border border-[color:var(--rule)] bg-white p-4 shadow-[var(--shadow-panel)]">
              <h2 className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                Image Sequence
              </h2>
              <ol className="mt-4 space-y-3">
                {note.images.map((image, index) => (
                  <li key={image.id}>
                    <a
                      className="block border-l-2 border-[color:var(--rule)] py-1 pl-3 text-sm leading-6 text-[color:var(--text-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                      href={`#${image.id}`}
                    >
                      <span className="mono mr-2 text-[10px] text-[color:var(--muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {image.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {articleSections.length ? (
              <nav className="border border-[color:var(--rule)] bg-[#fffefb] p-4 shadow-[var(--shadow-panel)]">
                <h2 className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                  Article Structure
                </h2>
                <ol className="mt-4 max-h-[48vh] space-y-3 overflow-y-auto pr-1">
                  {articleSections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        className="block border-l-2 border-[color:var(--rule)] py-1 pl-3 text-sm leading-6 text-[color:var(--text-soft)] transition hover:border-[#9b6a43] hover:text-[color:var(--ink)]"
                        href={`#${section.id}`}
                      >
                        <span className="mono mr-2 text-[10px] text-[color:var(--muted)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
          </aside>

          <div className="space-y-6">
            {articleSections.length ? (
              <section className="grid gap-4 border border-[color:var(--rule)] bg-white p-5 shadow-[var(--shadow-panel)] md:grid-cols-[1fr_1fr] xl:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                    Reading Map
                  </div>
                  <h2 className="academic-serif mt-3 text-3xl font-normal tracking-normal text-[color:var(--ink)]">
                    先看图，再用结构索引补回细节
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">
                    每一帧图像负责一个认知模块；右侧的正文摘录把文章中的论证、边界和反思保留下来，避免可视化只剩概念海报。
                  </p>
                </div>
                <div className="grid gap-3">
                  {articleSections.slice(0, 4).map((section) => (
                    <a
                      className="border-l-2 border-[#9b6a43] bg-[#f8f2ea] px-4 py-3 transition hover:bg-[#f4eadc]"
                      href={`#${section.id}`}
                      key={section.id}
                    >
                      <div className="text-sm font-semibold text-[color:var(--ink)]">{section.title}</div>
                      {section.snippets[0] ? (
                        <p className="mt-2 text-xs leading-6 text-[color:var(--text-soft)]">{section.snippets[0]}</p>
                      ) : null}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-8">
              {note.images.map((image, index) => {
                const linkedSections = sectionsForImage(articleSections, index, note.images.length);

                return (
                  <article
                    className="grid overflow-hidden border border-[color:var(--rule)] bg-white shadow-[var(--shadow-panel)] xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]"
                    id={image.id}
                    key={image.id}
                  >
                    <figure className="bg-[#f7f5ef]">
                      <Image
                        alt={image.alt}
                        className="h-auto w-full"
                        height={image.height}
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 980px"
                        src={image.src}
                        width={image.width}
                      />
                    </figure>
                    <div className="flex flex-col justify-between border-t border-[color:var(--rule)] p-5 xl:border-l xl:border-t-0">
                      <div>
                        <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                          Frame {String(index + 1).padStart(2, "0")}
                        </div>
                        <h2 className="academic-serif mt-3 text-2xl font-normal leading-tight tracking-normal text-[color:var(--ink)]">
                          {image.title}
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[color:var(--text-soft)]">{image.caption}</p>

                        {linkedSections.length ? (
                          <div className="mt-6 border-t border-[color:var(--rule-soft)] pt-5">
                            <h3 className="mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                              对应正文
                            </h3>
                            <div className="mt-3 space-y-4">
                              {linkedSections.map((section) => (
                                <section className="border-l-2 border-[color:var(--accent)] pl-4" id={section.id} key={section.id}>
                                  <a
                                    className="text-sm font-semibold text-[color:var(--ink)] underline-offset-4 hover:underline"
                                    href={`#${section.id}`}
                                  >
                                    {section.title}
                                  </a>
                                  {section.snippets.length ? (
                                    <ul className="mt-2 space-y-2 text-xs leading-6 text-[color:var(--text-soft)]">
                                      {section.snippets.map((snippet) => (
                                        <li key={snippet}>{snippet}</li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </section>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <a
                        className="mono mt-6 inline-flex self-start border border-[color:var(--rule)] px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                        href={image.src}
                      >
                        打开原图
                      </a>
                    </div>
                  </article>
                );
              })}
            </section>

            {articleSections.length ? (
              <section className="border border-[color:var(--rule)] bg-[rgba(255,254,251,0.92)] p-5 shadow-[var(--shadow-panel)]">
                <div className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                  Complete Structure
                </div>
                <h2 className="academic-serif mt-3 text-3xl font-normal tracking-normal text-[color:var(--ink)]">
                  文章结构索引
                </h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {articleSections.map((section, index) => (
                    <section className="border-t border-[color:var(--rule)] pt-4" key={`full-${section.id}`}>
                      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {String(index + 1).padStart(2, "0")} / H{section.level}
                      </div>
                      <h3 className="mt-2 text-base font-semibold leading-7 text-[color:var(--ink)]">{section.title}</h3>
                      {section.snippets.length ? (
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--text-soft)]">
                          {section.snippets.map((snippet) => (
                            <li key={snippet}>{snippet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
