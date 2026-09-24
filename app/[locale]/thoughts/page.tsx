import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n";
import { WritingRedirect } from "@/components/reading/writing-redirect";

export const metadata = { robots: { index: false } };

export default async function LegacyIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <WritingRedirect locale={locale} />;
}
