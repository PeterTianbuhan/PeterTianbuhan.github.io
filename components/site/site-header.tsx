import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/site";

export function SiteHeader({
  alternatePath,
  dictionary,
  locale,
}: {
  alternatePath: string;
  dictionary: Dictionary;
  locale: Locale;
}) {
  const nextLocale = locale === "zh" ? "en" : "zh";

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--rule)] bg-[color:var(--background)]/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-6 sm:px-8">
        <Link className="flex items-baseline gap-6" href={`/${locale}`}>
          <span className="academic-serif text-2xl font-normal leading-none text-[color:var(--ink)]">
            {dictionary.nav.brand}
          </span>
          <span className="hidden text-xs text-[color:var(--muted)] sm:inline">{locale === "zh" ? "PKU EECS '28" : "PKU EECS '28"}</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-[color:var(--ink-soft)] sm:gap-8">
          <Link className="nav-link hidden sm:inline-flex" href={`/${locale}/blog`}>
            {dictionary.nav.blog}
          </Link>
          <Link className="nav-link hidden sm:inline-flex" href={locale === "zh" ? `/${locale}/thoughts` : `/${locale}/blog`}>
            {dictionary.nav.thoughts}
          </Link>
          <Link className="nav-link hidden md:inline-flex" href={`/${locale}#projects`}>
            {dictionary.nav.projects}
          </Link>
          <Link className="nav-link hidden sm:inline-flex" href={`/${locale}#contact`}>
            {dictionary.nav.contact}
          </Link>
          <Link
            className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-soft)] transition hover:text-[color:var(--ink)]"
            href={alternatePath}
            hrefLang={nextLocale}
            lang={nextLocale}
          >
            {locale === "zh" ? "中 / EN" : "中 / EN"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
