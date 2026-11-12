import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FunfactPage } from "@/components/home-sketch/reading";
import { getFunfact } from "@/lib/funfact";
import { isSupportedLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${locale === "zh" ? "趣闻" : "Fun facts"} | Peter Tian` };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <FunfactPage locale={locale as Locale} source={await getFunfact(locale as Locale)} />;
}
