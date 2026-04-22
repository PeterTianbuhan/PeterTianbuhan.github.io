import type { HTMLAttributes, ReactNode } from "react";

export function Panel({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`panel-frame rounded-[var(--radius-panel)] p-6 sm:p-7 ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}
