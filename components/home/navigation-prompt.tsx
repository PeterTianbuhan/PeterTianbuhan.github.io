"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import styles from "./home.module.css";

const destinations: Record<string, string> = {
  about: "about", writing: "writing", projects: "projects",
  "关于我": "about", "文字": "writing", "项目": "projects",
  home: "", "~": "", "/": "",
};

export function NavigationPrompt({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const zh = locale === "zh";
  const help = zh ? "输入 about、writing、projects，按 Enter 跳转。" : "Enter about, writing, or projects to visit a page.";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = value.trim().toLowerCase();
    if (!command) return;
    if (command === "help" || command === "?") { setMessage(help); return; }
    const parts = command.split(/\s+/);
    const target = (parts.length === 1 ? parts[0]
      : parts.length === 2 && ["cd", "open"].includes(parts[0]) ? parts[1] : "")
      .replace(/^~\//, "").replace(/(.)\/$/, "$1");
    if (!Object.hasOwn(destinations, target)) {
      setMessage(zh ? "没有找到这个页面。试试 about、writing 或 projects。" : "Page not found. Try about, writing, or projects.");
      return;
    }
    setMessage("");
    setValue("");
    router.push(`/${locale}/${destinations[target] ? `${destinations[target]}/` : ""}`);
  };

  return <div className={styles.promptArea}>
    <form className={styles.prompt} onSubmit={submit}>
      <label className={styles.promptLabel} htmlFor="page-command"><span aria-hidden="true">❯</span><span className={styles.srOnly}>{zh ? "输入命令跳转页面" : "Navigate with a command"}</span></label>
      <input id="page-command" value={value} onChange={(event) => { setValue(event.target.value); setMessage(""); }}
        onKeyDown={(event) => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault(); }}
        autoComplete="off" autoCapitalize="off" spellCheck={false}
        aria-describedby="command-hint" enterKeyHint="go" />
      <button type="submit" aria-label={zh ? "跳转" : "Go"}>↵</button>
    </form>
    <p className={message ? styles.promptHint : styles.srOnly} id="command-hint" aria-live="polite">{message}</p>
  </div>;
}
