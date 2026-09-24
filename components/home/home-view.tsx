import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { SiteContent } from "@/lib/site";
import { SiteTheme, SiteClock } from "@/components/site/site-theme";
import { LegacyHomeLinks } from "./legacy-home-links";
import { NavigationPrompt } from "./navigation-prompt";
import { HomeWindow } from "./home-window";
import { DotSphere } from "./dot-sphere";
import styles from "./home.module.css";

const sections = [
  { path: "about", en: "About", zh: "关于我" },
  { path: "writing", en: "Writing", zh: "文字" },
  { path: "projects", en: "Projects", zh: "项目" },
];

export function HomeView({ locale, site }: { locale: Locale; site: SiteContent }) {
  const zh = locale === "zh";
  return (
    <SiteTheme locale={locale} className={styles.world}>
      <LegacyHomeLinks locale={locale} />
      <HomeWindow label={zh ? "个人主页" : "Personal homepage"}>
        <header className={styles.chrome}>
          <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
          <span>~</span>
          <span aria-hidden="true" />
        </header>
        <div className={styles.content}>
          <div className={styles.primary}>
          <h1>{site.name}</h1>
          <p className={styles.role}>{site.role}</p>
          <nav aria-label={zh ? "网站导航" : "Site navigation"}>
            {sections.map((item) => <Link className={styles.link} key={item.path} href={`/${locale}/${item.path}/`}>
              <span className={styles.label}>{item.en}</span>
              {zh && <span className={styles.translation}>{item.zh}</span>}
              <span className={styles.arrow} aria-hidden="true">→</span>
            </Link>)}
          </nav>
          <NavigationPrompt locale={locale} />
          </div>
          <DotSphere locale={locale} />
        </div>
        <footer className={styles.footer}>
          <span>{site.name}</span>
          <div><Link href={`/${zh ? "en" : "zh"}/`} hrefLang={zh ? "en" : "zh"}>{zh ? "EN" : "中"}</Link><SiteClock locale={locale} /></div>
        </footer>
      </HomeWindow>
    </SiteTheme>
  );
}
