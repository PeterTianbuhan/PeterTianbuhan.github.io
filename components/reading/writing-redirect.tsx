import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { ReadingFrame } from "./reading-frame";

// GitHub Pages serves static files, so retain old URLs with a client redirect
// and an ordinary link for visitors without JavaScript.
export function WritingRedirect({ locale }: { locale: Locale }) {
  const destination = `/${locale}/writing/`;
  return <ReadingFrame locale={locale} title={locale === "zh" ? "文字" : "Writing"}>
    <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(destination)});` }} />
    <Link href={destination}>{locale === "zh" ? "前往文字 →" : "Go to writing →"}</Link>
  </ReadingFrame>;
}
