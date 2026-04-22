import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import type { Dictionary, SiteContent } from "@/lib/site";

export function HeroPanel({
  dictionary,
  site,
}: {
  dictionary: Dictionary;
  site: SiteContent;
}) {
  return (
    <Panel className="boot-in min-h-[360px] rounded-[34px]">
      <div className="mono mb-5 text-[11px] uppercase tracking-[0.36em] text-[color:var(--text-muted)]">
        hello_world.exe
      </div>
      <p className="mb-5 max-w-[32rem] text-sm leading-7 text-[color:var(--text-soft)]">
        {site.intro}
      </p>
      <h1 className="max-w-[10ch] text-5xl font-medium leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl lg:text-[5.35rem]">
        {site.heroTitle}
      </h1>
      <p className="mono mt-5 text-[11px] uppercase tracking-[0.34em] text-[color:var(--text-muted)]">
        {site.heroTagline}
      </p>
      <p className="mt-7 max-w-[42rem] text-base leading-8 text-[color:var(--text-soft)] sm:text-lg">
        {site.bio}
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          className="mono rounded-full border border-white/15 bg-white/[0.08] px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/[0.12]"
          href={dictionary.home.primaryHref}
        >
          {dictionary.home.primaryCta}
        </Link>
        <Link
          className="mono rounded-full border border-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-soft)] transition hover:border-white/25 hover:text-white"
          href="#contact"
        >
          {dictionary.home.secondaryCta}
        </Link>
      </div>
    </Panel>
  );
}
