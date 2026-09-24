import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./reading.module.css";
import { SiteTheme } from "@/components/site/site-theme";

export function ReadingFrame({ locale, title, children, withRail = false, section = "writing" }: {
  locale: Locale;
  title: string;
  children: ReactNode;
  withRail?: boolean;
  section?: "writing" | "about" | "projects";
}) {
  const zh = locale === "zh";
  return (
    <SiteTheme locale={locale} className={styles.world}>
      <a className={styles.skip} href="#reading-content">{zh ? "跳到正文" : "Skip to content"}</a>
      <section className={styles.window} aria-label={title}>
        <nav className={styles.nav} aria-label={zh ? "网站导航" : "Site navigation"}>
          <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.location}>
            <Link href={`/${locale}/`} aria-label={zh ? "返回首页" : "Back to home"}>~</Link>
            <span aria-hidden="true">/</span><span>{section}</span>
          </span>
          <Link href={`/${locale}/writing/`}>{zh ? "文字" : "Writing"}</Link>
          <Link href={`/${locale}/projects/`}>{zh ? "项目" : "Projects"}</Link>
          <Link href={`/${locale}/about/`}>{zh ? "关于我" : "About"}</Link>
        </nav>
        <div className={`${styles.content}${withRail ? ` ${styles.withRail}` : ""}`} id="reading-content" tabIndex={-1}>
          {children}
        </div>
      </section>
    </SiteTheme>
  );
}
