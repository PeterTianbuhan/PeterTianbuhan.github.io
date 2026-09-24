import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/blog/mdx-content";
import { ReadingFrame } from "@/components/reading/reading-frame";
import styles from "@/components/reading/reading.module.css";
import { getPostBySlug } from "@/lib/content";
import { defaultLocale, isSupportedLocale, type Locale } from "@/lib/i18n";
import { getAllThoughtNotes, getThoughtNoteBySlug } from "@/lib/thoughts";

export async function generateStaticParams() {
  const notes = await getAllThoughtNotes();

  // output: export 不允许"零参数"的动态路由；内容清空期给一个会 notFound 的占位。
  if (notes.length === 0) {
    return [{ locale: defaultLocale, slug: "__placeholder__" }];
  }

  return notes.map((note) => ({
    locale: note.locale,
    slug: note.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const note = await getThoughtNoteBySlug(locale as Locale, slug);

  if (!note) {
    return {};
  }

  return {
    title: `${note.meta.title} | 随想 | Peter Tian`,
    description: note.meta.excerpt,
  };
}

export default async function ThoughtDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const note = await getThoughtNoteBySlug(typedLocale, slug);

  if (!note) {
    notFound();
  }

  const linkedPost = note.meta.articleSlug
    ? await getPostBySlug(typedLocale, note.meta.articleSlug)
    : null;

  return (
    <ReadingFrame locale={typedLocale} title={note.meta.title}>
      <header className={styles.articleHeader}>
        <h1 className={styles.heading}>{note.meta.title}</h1>
        <div className={styles.meta}><time dateTime={note.meta.createdAt}>{note.meta.createdAtLabel}</time></div>
      </header>
      <article className={styles.prose}><MdxContent source={note.content} /></article>
      {linkedPost && <nav className={styles.related} aria-label="相关阅读"><Link href={`/${typedLocale}/blog/${linkedPost.slug}/`}>{linkedPost.meta.title} →</Link></nav>}
    </ReadingFrame>
  );
}
