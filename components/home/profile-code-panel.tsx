import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";
import type { SiteContent } from "@/lib/site";

export function ProfileCodePanel({ site }: { site: SiteContent }) {
  const snippet = `const builder = {
  name: "${site.name}",
  role: "${site.role}",
  mode: "${site.availability}",
  focus: "${site.focus}"
};

function ship() {
  design();
  code();
  document();
}`;

  return (
    <Panel className="boot-in delay-1 rounded-[30px]">
      <SectionLabel label="code.snippet" />
      <pre className="mono mt-5 overflow-x-auto text-sm leading-7 text-[color:var(--text-soft)]">
        {snippet}
      </pre>
    </Panel>
  );
}
