import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabView } from "@/components/life/lab-view";
import { isSupportedLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { title: "来处 · 方向实验 | Peter Tian" };

export default async function LifeLabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <LabView locale={locale as Locale} />;
}
