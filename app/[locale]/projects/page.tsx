import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectsPage } from "@/components/home-sketch/gallery";
import { getExhibits } from "@/lib/exhibits";
import { isSupportedLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${locale === "zh" ? "项目" : "Projects"} | Peter Tian` };
}

export default async function Projects({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <ProjectsPage locale={locale} exhibits={getExhibits(locale)} />;
}
