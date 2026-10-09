import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyPage } from "@/components/home-sketch/reading";
import { isSupportedLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${locale === "zh" ? "每日一式" : "One move a day"} | Peter Tian` };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  // one small habit per line, added to the end as they come
  const source = await fs.readFile(path.join(process.cwd(), "content", "daily", `${locale}.md`), "utf8");
  return <DailyPage locale={locale as Locale} source={source} />;
}
