export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mono text-[11px] uppercase tracking-[0.34em] text-[color:var(--text-muted)]">
      {"//"} {label}
    </div>
  );
}
