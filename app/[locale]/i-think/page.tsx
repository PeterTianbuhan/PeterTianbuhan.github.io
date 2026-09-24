import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IThinkPage } from "@/components/home-sketch/reading";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getIThink } from "@/lib/i-think";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${locale === "zh" ? "我觉得" : "I think"} | Peter Tian` };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <IThinkPage locale={locale as Locale} source={await getIThink(locale as Locale)} />;
}
