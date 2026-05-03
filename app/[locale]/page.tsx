import { notFound } from "next/navigation";
import { HomeView } from "@/components/home/home-view";
import { getLatestPosts } from "@/lib/content";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getDictionary, getSiteContent } from "@/lib/site";

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
  const [dictionary, site, latestPosts] = await Promise.all([
    getDictionary(typedLocale),
    getSiteContent(typedLocale),
    getLatestPosts(typedLocale, 5),
  ]);

  return (
    <HomeView
      dictionary={dictionary}
      latestPosts={latestPosts}
      locale={typedLocale}
      site={site}
    />
  );
}
