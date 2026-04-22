import { CenterVisual } from "@/components/home/center-visual";
import { HeroPanel } from "@/components/home/hero-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { Dictionary, SiteContent } from "@/lib/site";

export function HomeView({
  dictionary,
  latestPosts,
  locale,
  site,
}: {
  dictionary: Dictionary;
  latestPosts: PostListItem[];
  locale: Locale;
  site: SiteContent;
}) {
  return (
    <main className="surface-grid min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-[var(--content-width)] flex-col gap-4 sm:gap-6">
        <SiteHeader alternatePath={`/${locale === "zh" ? "en" : "zh"}`} dictionary={dictionary} locale={locale} />

        <section className="grid flex-1 gap-4 lg:gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col gap-4 lg:gap-6">
            <HeroPanel dictionary={dictionary} site={site} />
          </div>

          <div className="order-first xl:order-none">
            <CenterVisual dictionary={dictionary} locale={locale} post={latestPosts[0]} />
          </div>
        </section>

        <SiteFooter dictionary={dictionary} locale={locale} site={site} />
      </div>
    </main>
  );
}
