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
    <footer
      className="panel-frame rounded-[calc(var(--radius-panel)+4px)] px-5 py-5 text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)] sm:px-6"
      id="contact"
    >
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 sm:gap-6">
          <Link className="transition hover:text-white" href={site.social.github} target="_blank">
            github / {site.social.githubLabel}
          </Link>
          <Link className="transition hover:text-white" href={site.social.linkedin} target="_blank">
            linkedin / {site.social.linkedinLabel}
          </Link>
          <Link className="transition hover:text-white" href={`mailto:${site.contactEmail}`}>
            mail / {site.contactEmail}
          </Link>
        </div>
        <div className="mono text-[10px] tracking-[0.32em] text-[color:var(--text-soft)]">
          {dictionary.footer.prompt.replace("{locale}", locale)}
        </div>
      </div>
    </footer>
  );
}
