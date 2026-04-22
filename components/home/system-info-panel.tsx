import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";
import type { SiteContent } from "@/lib/site";

export function SystemInfoPanel({ site }: { site: SiteContent }) {
  const rows = [
    ["Mode", site.availability],
    ["Focus", site.focus],
    ["Base", site.location],
    ["Stack", site.stackSummary],
    ["Writing", site.writingFocus],
  ];

  return (
    <Panel className="boot-in delay-2 rounded-[30px]">
      <SectionLabel label="system.info" />
      <div className="mt-5 space-y-3 text-sm text-[color:var(--text-soft)]">
        {rows.map(([key, value]) => (
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3" key={key}>
            <span className="mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
              {key}
            </span>
            <span className="text-right">{value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
