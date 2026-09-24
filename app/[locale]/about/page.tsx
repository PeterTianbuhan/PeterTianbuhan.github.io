import { notFound } from "next/navigation";
import { PaperRedirect } from "@/components/home-sketch/redirect";
import { isSupportedLocale } from "@/lib/i18n";

export const metadata = { robots: { index: false } };

// "about" is the last room of the home page now
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <PaperRedirect locale={locale} to={`/${locale}/#about`} />;
}
