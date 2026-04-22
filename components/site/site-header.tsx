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
    <header className="boot-in panel-frame rounded-full px-4 py-3 sm:px-5">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <Link
          className="mono text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-soft)] transition hover:text-white"
          href={`/${locale}`}
        >
          {dictionary.nav.brand}
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.26em] text-[color:var(--text-muted)] sm:gap-3">
          <Link className="rounded-full px-3 py-2 transition hover:bg-white/6 hover:text-white" href={`/${locale}`}>
            {dictionary.nav.home}
          </Link>
          <Link
            className="rounded-full px-3 py-2 transition hover:bg-white/6 hover:text-white"
            href={`/${locale}/blog`}
          >
            {dictionary.nav.blog}
          </Link>
          <Link
            className="rounded-full px-3 py-2 transition hover:bg-white/6 hover:text-white"
            href="#contact"
          >
            {dictionary.nav.contact}
          </Link>
          <Link
            className="mono rounded-full border border-white/10 px-3 py-2 text-[10px] tracking-[0.32em] text-white transition hover:border-white/25 hover:bg-white/6"
            href={alternatePath}
            hrefLang={nextLocale}
            lang={nextLocale}
          >
            {nextLocale}
          </Link>
        </nav>
      </div>
    </header>
  );
}
