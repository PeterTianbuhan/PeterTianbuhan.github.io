import { notFound } from "next/navigation";
import { PaperRedirect } from "@/components/home-sketch/redirect";
import { isSupportedLocale } from "@/lib/i18n";

export const metadata = { robots: { index: false } };

// the old list of posts now lives at /writing/
export default async function LegacyIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <PaperRedirect locale={locale} to={`/${locale}/writing/`} />;
}
