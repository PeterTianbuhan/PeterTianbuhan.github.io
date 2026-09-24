import { notFound } from "next/navigation";
import { Gallery } from "@/components/home-sketch/gallery";
import { SketchHome } from "@/components/home-sketch/sketch-home";
import { getPostsByLocale } from "@/lib/content";
import { getExhibits } from "@/lib/exhibits";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";
import { getWritingSeries } from "@/lib/writing-series";

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
  const [site, dict, posts] = await Promise.all([
    getSiteContent(typedLocale),
    getDictionary(typedLocale),
    getPostsByLocale(typedLocale),
  ]);
  const base = `/${typedLocale}`;
  const zh = typedLocale === "zh";

  return (
    <>
      <SketchHome
        locale={typedLocale}
        name={site.name}
        role={site.role}
        nav={[
          { href: "#writing", label: zh ? "长文" : "Essays" },
          { href: "#projects", label: dict.nav.projects },
          { href: "#about", label: dict.nav.contact },
        ]}
      />
      <Gallery
        locale={typedLocale}
        role={site.role}
        essays={posts.map((post) => ({
          href: `${base}/blog/${post.slug}/`,
          title: post.title,
          excerpt: post.excerpt,
          date: post.publishedAtLabel,
          series: getWritingSeries(post.series, typedLocale)?.title,
          draft: post.preview,
        }))}
        exhibits={getExhibits(typedLocale)}
        email={site.contactEmail}
        github={site.social.github}
        x={site.social.x}
      />
    </>
  );
}
