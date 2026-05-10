import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisualNoteView } from "@/components/visual-notes/visual-note-view";
import { isSupportedLocale, type Locale } from "@/lib/i18n";
import { getAllVisualNotes, getVisualNoteBySlug } from "@/lib/visual-notes";

export function generateStaticParams() {
  return getAllVisualNotes().map((note) => ({
    locale: "zh",
    slug: note.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    return {};
  }

  const note = getVisualNoteBySlug(slug);

  if (!note) {
    return {};
  }

  return {
    title: `${note.title} 图像笔记 | Peter Tian`,
    description: note.description,
  };
}

export default async function VisualNotePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (locale !== "zh" || !isSupportedLocale(locale)) {
    notFound();
  }

  const note = getVisualNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return <VisualNoteView locale={locale as Locale} note={note} />;
}
