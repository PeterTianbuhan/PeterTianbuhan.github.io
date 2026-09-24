import type { Post, PostListItem } from "@/lib/content";
import type { Exhibit } from "@/lib/exhibits";
import { shelvesIn } from "@/lib/i-think";
import type { Locale } from "@/lib/i18n";
import { getWritingSeries } from "@/lib/writing-series";
import { EraseLink } from "./eraser";
import { Heading, PageShell } from "./gallery";
import { InkFrame, InkRule, Seen } from "./ink";
import { Prose } from "./prose";
import { ThingsIndex } from "./things-index";
import { Vignette } from "./vignettes";
import styles from "./gallery.module.css";
import prose from "./prose.module.css";

// An essay on its own pages of the sketchbook.
export function SketchArticle({
  locale,
  post,
  next,
  other,
}: {
  locale: Locale;
  post: Post;
  next: PostListItem[];
  // the same essay in the other language, when it has been translated
  other?: string;
}) {
  const zh = locale === "zh";
  const series = getWritingSeries(post.meta.series, locale);
  const minutes = Math.max(1, Math.ceil(post.content.replace(/https?:\/\/\S+/g, "").length / (zh ? 420 : 1100)));
  return (
    <PageShell locale={locale} other={other}>
      <article className={styles.reading}>
        <Seen as="header" className={styles.readingHead}>
          <p className={styles.label}>
            {series && <span>{series.title}</span>}
            <time dateTime={post.meta.publishedAt}>{post.meta.publishedAtLabel}</time>
            <span>{zh ? `约 ${minutes} 分钟` : `${minutes} min read`}</span>
            {post.meta.preview && <span className={styles.draft}>{zh ? "草稿" : "draft"}</span>}
          </p>
          <h1>{post.meta.title}</h1>
          <p className={styles.standfirst}>{post.meta.excerpt}</p>
          <InkRule seed={`article:${post.slug}`} delay={0.2} />
        </Seen>
        <Prose source={post.content} />
      </article>
      {next.length > 0 && (
        <Seen as="section" className={styles.next}>
          <InkRule seed={`next:${post.slug}`} />
          <p className={styles.label}>
            <span>{zh ? "接着读" : "Read next"}</span>
          </p>
          {next.map((item) => (
            <EraseLink key={item.slug} href={`/${locale}/blog/${item.slug}/`} className={styles.nextLink}>
              {item.title} →
            </EraseLink>
          ))}
        </Seen>
      )}
    </PageShell>
  );
}

// A project's own page: its drawing, larger, then the long placard.
export function ProjectDetail({ locale, piece, body }: { locale: Locale; piece: Exhibit; body: string }) {
  const zh = locale === "zh";
  return (
    <PageShell locale={locale} other={`/${zh ? "en" : "zh"}/projects/${piece.slug}/`}>
      <article className={styles.reading}>
        <Seen as="header" className={styles.projectHead}>
          <InkFrame seed={`detail:${piece.slug}`} hung className={styles.canvas}>
            <Vignette slug={piece.slug} delay={1.7} />
          </InkFrame>
          <div className={styles.projectFacts}>
            <p className={styles.label}>
              <span>{piece.year}</span>
              <span>{piece.status}</span>
            </p>
            <h1>{piece.name}</h1>
            <p className={styles.medium}>{piece.medium}</p>
            {piece.honor && <p className={styles.honor}>{piece.honor}</p>}
            <p className={styles.role}>
              <span>{piece.role}</span>
              {piece.link ? (
                <a href={piece.link.href} target="_blank" rel="noreferrer" className={styles.read}>
                  {piece.link.label} ↗
                </a>
              ) : (
                <span className={styles.aside}>{zh ? "仓库暂未公开" : "Repository not public yet"}</span>
              )}
            </p>
          </div>
        </Seen>
        <Prose source={body} />
      </article>
      <Seen as="section" className={styles.next}>
        <InkRule seed={`back:${piece.slug}`} />
        <EraseLink href={`/${locale}/projects/`} className={styles.nextLink}>
          {zh ? "← 回到所有项目" : "← All projects"}
        </EraseLink>
      </Seen>
    </PageShell>
  );
}

// "I think": subjective notes, crossed out and rewritten when my mind changes
export function IThinkPage({ locale, source }: { locale: Locale; source: string }) {
  const zh = locale === "zh";
  return (
    <PageShell locale={locale} other={`/${zh ? "en" : "zh"}/i-think/`}>
      <article className={styles.reading}>
        <Heading as="h1" title={zh ? "我觉得" : "I think"} script={zh ? "I think" : "I feel"} />
        <Seen as="header" className={styles.readingHead}>
          <p className={styles.standfirst}>
            {zh
              ? "或者说，我感觉。都是很主观的感受，改主意了就划掉重写。"
              : "Or rather, I feel. All of it very subjective; when I change my mind I cross it out and write it again."}
          </p>
        </Seen>
        <div className={styles.notesLayout}>
          <Prose source={source} className={prose.notes} />
          <aside>
            <ThingsIndex shelves={shelvesIn(source)} />
          </aside>
        </div>
      </article>
    </PageShell>
  );
}
