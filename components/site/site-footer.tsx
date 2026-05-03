import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary, SiteContent } from "@/lib/site";

export function SiteFooter({
  dictionary,
  locale,
  site,
}: {
  dictionary: Dictionary;
  locale: Locale;
  site: SiteContent;
}) {
  return (
    <footer className="section-rule bg-[color:var(--background)]" id="contact">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 sm:px-8 md:grid-cols-[1fr_1.2fr_1fr]">
        <div>
          <h2 className="academic-serif text-xl font-normal">{dictionary.home.aboutTitle}</h2>
          <p className="mt-5 max-w-[18rem] text-sm leading-7 text-[color:var(--ink-soft)]">
            {site.role}. {site.focus}. {site.writingFocus}.
          </p>
          <p className="mt-8 text-xs text-[color:var(--muted)]">
            &copy; 2026 {site.name}. All rights reserved.
          </p>
        </div>

        <div>
          <h2 className="academic-serif text-xl font-normal">{dictionary.home.connectTitle}</h2>
          <div className="mt-5 grid gap-4 text-sm text-[color:var(--ink-soft)]">
            <Link className="footer-row" href={site.social.github} target="_blank">
              <span>GitHub</span>
              <span>{site.social.githubLabel}</span>
            </Link>
            <Link className="footer-row" href={`mailto:${site.contactEmail}`}>
              <span>Email</span>
              <span>{site.contactEmail}</span>
            </Link>
            <div className="footer-row">
              <span>Location</span>
              <span>{site.location}</span>
            </div>
          </div>
        </div>

        <div className="relative self-start rounded-sm bg-[#f4eee4] px-8 py-8 shadow-[0_18px_50px_rgba(42,35,25,0.08)]">
          <span className="absolute -top-4 right-8 text-4xl text-[color:var(--ink-soft)]">||</span>
          <p className="text-xl tracking-[0.08em] text-[color:var(--ink-soft)]">{site.quote}</p>
          <p className="mono mt-5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {dictionary.footer.prompt.replace("{locale}", locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}
