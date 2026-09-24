import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LifeView } from "@/components/life/life-view";
import { isSupportedLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Where I come from | Peter Tian" : "来处 | Peter Tian" };
}

export default async function LifePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <LifeView locale={locale as Locale} />;
}
