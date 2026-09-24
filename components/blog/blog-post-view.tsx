import Link from "next/link";
import { MdxContent } from "@/components/blog/mdx-content";
import { ReadingFrame } from "@/components/reading/reading-frame";
import { SectionRail } from "@/components/reading/section-rail";
import styles from "@/components/reading/reading.module.css";
import type { Post, PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { getWritingSeries } from "@/lib/writing-series";

export function BlogPostView({ locale, post, relatedPosts }: {
  locale: Locale;
  post: Post;
  relatedPosts: PostListItem[];
}) {
  const zh = locale === "zh";
  const series = getWritingSeries(post.meta.series, locale);
  const headings = [...post.content.matchAll(/^## (.+)$/gm)].map((match, index) => ({
    title: match[1], id: `section-${index + 1}`,
  }));
  const minutes = Math.max(1, Math.ceil(post.content.replace(/https?:\/\/\S+/g, "").length / (zh ? 420 : 1100)));
  return (
    <ReadingFrame locale={locale} title={post.meta.title} withRail={headings.length > 0}>
      {headings.length > 0 && <SectionRail headings={headings} locale={locale} />}
      <header className={styles.articleHeader}>
        <h1 className={styles.heading}>{post.meta.title}</h1>
        <div className={styles.meta}>
          {series && <Link href={`/${locale}/writing/#${series.id}`}>{series.title}</Link>}
          <time dateTime={post.meta.publishedAt}>{post.meta.publishedAtLabel}</time>
          <span>{zh ? `约 ${minutes} 分钟` : `${minutes} min read`}</span>
          {post.meta.preview && <span className={styles.preview}>{zh ? "本地预览" : "Local preview"}</span>}
        </div>
      </header>
      <article className={styles.prose}>
        <MdxContent source={post.content} headingIds={headings.map((heading) => heading.id)} />
      </article>
      <div className={styles.end} aria-hidden="true">(END)</div>
      {relatedPosts.length > 0 && <nav className={styles.related} aria-label={zh ? "继续阅读" : "Read next"}>
        <p>{zh ? "继续阅读" : "Read next"}</p>
        {relatedPosts.map((item) => <Link key={item.slug} href={`/${locale}/blog/${item.slug}/`}>{item.title} →</Link>)}
      </nav>}
    </ReadingFrame>
  );
}
