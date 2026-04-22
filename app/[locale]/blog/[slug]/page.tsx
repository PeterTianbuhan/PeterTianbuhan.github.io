import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/blog-post-view";
import {
  getAllPosts,
  getPostBySlug,
  getPostTranslation,
  getRelatedPosts,
} from "@/lib/content";
import { isSupportedLocale, locales, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    locale: post.locale,
    slug: post.slug,
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

  const post = await getPostBySlug(locale as Locale, slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.meta.title} | System Portfolio`,
    description: post.meta.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [dictionary, post, relatedPosts] = await Promise.all([
    getDictionary(typedLocale),
    getPostBySlug(typedLocale, slug),
    getRelatedPosts(typedLocale, slug),
  ]);

  if (!post) {
    notFound();
  }

  const translation = await getPostTranslation(post.meta.translationKey, typedLocale);
  const alternatePath = translation
    ? `/${translation.locale}/blog/${translation.slug}`
    : `/${locales.find((item) => item !== typedLocale)}/blog`;

  return (
    <BlogPostView
      alternatePath={alternatePath}
      dictionary={dictionary}
      locale={typedLocale}
      post={post}
      relatedPosts={relatedPosts}
    />
  );
}
