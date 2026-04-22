import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";
import type { SiteContent } from "@/lib/site";

export function ActivityLogPanel({ items }: { items: SiteContent["activity"] }) {
  return (
    <Panel className="boot-in delay-3 rounded-[30px]">
      <SectionLabel label="activity.log" />
      <div className="mt-5 space-y-3 text-sm text-[color:var(--text-soft)]">
        {items.map((item) => (
          <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3" key={item.time}>
            <span className="mono text-[10px] tracking-[0.24em] text-[color:var(--text-muted)]">
              [{item.time}]
            </span>
            <span className="flex-1 text-right">{item.text}</span>
            <span className="mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
              ok
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
