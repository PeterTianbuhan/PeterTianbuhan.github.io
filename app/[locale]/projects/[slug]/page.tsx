import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/home-sketch/reading";
import { exhibitSlugs, getExhibit, getExhibitBody } from "@/lib/exhibits";
import { isSupportedLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((locale) => exhibitSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const piece = getExhibit(locale, slug);
  return piece ? { title: `${piece.name} | Peter Tian`, description: piece.summary } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const piece = getExhibit(locale, slug);
  if (!piece) notFound();
  return <ProjectDetail locale={locale} piece={piece} body={await getExhibitBody(locale, slug)} />;
}
