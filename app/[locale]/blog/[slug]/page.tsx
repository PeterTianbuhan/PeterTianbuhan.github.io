import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SketchArticle } from "@/components/home-sketch/reading";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/content";
import { defaultLocale, isSupportedLocale, type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  const posts = await getAllPosts();

  // output: export 不允许"零参数"的动态路由；内容清空期给一个会 notFound 的占位。
  if (posts.length === 0) {
    return [{ locale: defaultLocale, slug: "__placeholder__" }];
  }

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
    title: `${post.meta.title} | Peter Tian`,
    description: post.meta.excerpt,
    robots: post.meta.preview ? { index: false, follow: false } : undefined,
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
  const [post, relatedPosts] = await Promise.all([
    getPostBySlug(typedLocale, slug),
    getRelatedPosts(typedLocale, slug),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <SketchArticle locale={typedLocale} post={post} next={relatedPosts} />
  );
}
