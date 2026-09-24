import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/site";
import { ReadingFrame } from "@/components/reading/reading-frame";
import styles from "@/components/reading/reading.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: `${locale === "zh" ? "关于我" : "About"} | Peter Tian` };
}
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const site = await getSiteContent(locale);
  const links = [
    { label: "GitHub", detail: `@${new URL(site.social.github).pathname.replace(/^\/|\/$/g, "")}`, href: site.social.github },
    { label: locale === "zh" ? "邮箱" : "Email", detail: site.contactEmail, href: `mailto:${site.contactEmail}` },
    ...(site.social.x ? [{ label: "X", detail: site.social.xLabel ?? site.social.x, href: site.social.x }] : []),
    ...(site.social.codexProfile ? [{ label: "Codex", detail: site.social.codexProfileLabel ?? site.social.codexProfile, href: site.social.codexProfile }] : []),
  ];
  return <ReadingFrame locale={locale} title={locale === "zh" ? "关于我" : "About"} section="about">
    <h1 className={styles.heading}>{site.name}</h1>
    <p className={styles.intro}>{site.role}</p>
    <div className={styles.prose}><p>{site.bio}</p></div>
    <nav className={styles.contacts} aria-label={locale === "zh" ? "联系我" : "Contact"}>
      {links.map((link) => <a key={link.label} href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
        <span>{link.label}</span>
        <span className={styles.contactDetail}>{link.detail}</span>
        <span aria-hidden="true">↗</span>
      </a>)}
    </nav>
  </ReadingFrame>;
}
