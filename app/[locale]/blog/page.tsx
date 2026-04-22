import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexView } from "@/components/blog/blog-index-view";
import { getPostsByLocale } from "@/lib/content";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale as Locale);

  return {
    title: dictionary.blog.metaTitle,
    description: dictionary.blog.metaDescription,
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, posts] = await Promise.all([
    getDictionary(typedLocale),
    getPostsByLocale(typedLocale),
  ]);

  return <BlogIndexView dictionary={dictionary} locale={typedLocale} posts={posts} />;
}
