import { MdxContent } from "@/components/blog/mdx-content";
import { notFound } from "next/navigation";
import { HomeView } from "@/components/home/home-view";
import type { ShowcaseBundle } from "@/components/home/home-view";
import { getPostBySlug, getPostsByLocale } from "@/lib/content";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site";
import {
  AGENT_NOTES_SLUG,
  getShowcaseChapterSource,
  getShowcaseMeta,
} from "@/lib/showcases";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const [site, posts, agentNotes] = await Promise.all([
    getSiteContent(typedLocale),
    getPostsByLocale(typedLocale),
    getShowcaseMeta(AGENT_NOTES_SLUG, typedLocale),
  ]);

  const fullPosts = await Promise.all(
    posts.map((post) => getPostBySlug(typedLocale, post.slug)),
  );
  const articles = Object.fromEntries(
    fullPosts
      .filter((post) => post !== null)
      .map((post) => [
        post.slug,
        <MdxContent key={post.slug} source={post.content} />,
      ]),
  );

  let showcases: ShowcaseBundle | undefined;
  if (agentNotes) {
    const chapterNodes = await Promise.all(
      agentNotes.chapters.map(async (chapter) => {
        const source = await getShowcaseChapterSource(
          AGENT_NOTES_SLUG,
          chapter.slug,
          typedLocale,
        );
        return [
          chapter.slug,
          source ? (
            <MdxContent
              key={`${AGENT_NOTES_SLUG}-${chapter.slug}`}
              source={source}
            />
          ) : null,
        ] as const;
      }),
    );
    showcases = {
      [AGENT_NOTES_SLUG]: {
        meta: agentNotes,
        chapters: Object.fromEntries(chapterNodes),
      },
    };
  }

  return (
    <HomeView
      articles={articles}
      locale={typedLocale}
      posts={posts}
      showcases={showcases}
      site={site}
    />
  );
}
