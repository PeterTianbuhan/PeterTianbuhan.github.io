import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";

export function SkillsPanel({ skills }: { skills: string[] }) {
  return (
    <Panel className="boot-in delay-1 rounded-[30px]">
      <SectionLabel label="skills.exe" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {skills.map((skill) => (
          <div
            className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition duration-300 hover:border-white/18 hover:bg-white/[0.06]"
            key={skill}
          >
            <div className="text-sm font-medium tracking-[0.03em] text-white">{skill}</div>
            <div className="mono mt-2 text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
              active
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
