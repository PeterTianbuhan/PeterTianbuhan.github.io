import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";
import type { Dictionary, LocalizedProject } from "@/lib/site";

export function ProjectsPanel({
  dictionary,
  projects,
}: {
  dictionary: Dictionary;
  projects: LocalizedProject[];
}) {
  return (
    <Panel className="boot-in delay-2 rounded-[30px]" id="projects">
      <SectionLabel label="projects.data" />
      <div className="mt-5 space-y-4">
        {projects.map((project) => (
          <Link
            className="group block rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5 transition duration-300 hover:border-white/18 hover:bg-white/[0.05]"
            href={project.link ?? "#"}
            key={project.slug}
            target="_blank"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-lg font-medium tracking-[-0.03em] text-white">{project.name}</div>
                <div className="mono mt-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  {project.status}
                </div>
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
                {project.stack.join(" / ")}
              </div>
            </div>
            <p className="mt-4 max-w-[55ch] text-sm leading-7 text-[color:var(--text-soft)]">
              {project.summary}
            </p>
            <div className="mono mt-5 text-[10px] uppercase tracking-[0.3em] text-white/80 transition group-hover:translate-x-1">
              {dictionary.home.projectCta}
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
