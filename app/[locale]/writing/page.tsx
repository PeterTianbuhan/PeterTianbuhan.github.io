import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EssaysPage } from "@/components/home-sketch/gallery";
import { getPostsByLocale } from "@/lib/content";
import { isSupportedLocale } from "@/lib/i18n";
import { getWritingSeries } from "@/lib/writing-series";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${locale === "zh" ? "长文" : "Essays"} | Peter Tian` };
}

export default async function WritingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const posts = await getPostsByLocale(locale);
  return (
    <EssaysPage
      locale={locale}
      essays={posts.map((post) => ({
        href: `/${locale}/blog/${post.slug}/`,
        title: post.title,
        excerpt: post.excerpt,
        date: post.publishedAtLabel,
        series: getWritingSeries(post.series, locale)?.title,
        draft: post.preview,
      }))}
    />
  );
}
