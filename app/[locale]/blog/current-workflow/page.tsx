import { locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LegacyCurrentWorkflowPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const target = `/${locale}/blog/current-life/`;

  return (
    <main className="min-h-screen bg-[color:var(--background)] px-6 py-10 text-[color:var(--ink)]">
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <link rel="canonical" href={target} />
      <p>
        这篇文章已经移动到 <a href={target}>目前的生活</a>。
      </p>
    </main>
  );
}