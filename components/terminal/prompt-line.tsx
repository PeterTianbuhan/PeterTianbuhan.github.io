import type { ReactNode } from "react";
import styles from "@/components/terminal/terminal.module.css";

export const USER = "peter";
export const HOST = "homepage";

// A page block echoes its own canonical command (e.g. `cat README.md`) after
// the one the visitor typed — unless the visitor already typed a viewer or a
// listing command, in which case the output follows directly.
export function showsInnerPrompt(typed: string) {
  return !/^(ls|ll|dir|cat|less|more|open|vim|vi|nano|code|bat|imgcat)\b/.test(
    typed.trim(),
  );
}

// One echoed shell line: `peter@homepage:~/writing$ open foo.mdx`
export function PromptLine({
  path,
  children,
  className,
  live = false,
  onClick,
}: {
  path: string;
  children?: ReactNode;
  className?: string;
  live?: boolean;
  onClick?: () => void;
}) {
  return (
    <p
      className={`${styles.line} ${live ? styles.live : ""} ${className ?? ""}`}
      aria-hidden={live ? "true" : undefined}
      onClick={onClick}
    >
      <span className={styles.user}>
        {USER}
        <span className={styles.at}>@</span>
        {HOST}
      </span>
      <span className={styles.colon}>:</span>
      <span className={styles.path}>{path}</span>
      <span className={styles.dollar}>$</span>
      <span className={styles.cmd}>{children}</span>
    </p>
  );
}
