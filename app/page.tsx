import Link from "next/link";
import { defaultLocale } from "@/lib/i18n";

export default function RootPage() {
  const destination = `/${defaultLocale}/`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 text-center text-[color:var(--ink)]">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(destination)});`,
        }}
      />
      <div className="space-y-3">
        <p className="mono text-xs uppercase tracking-[0.32em] text-[color:var(--text-muted)]">
          redirecting
        </p>
        <Link className="text-sm text-[color:var(--ink)] underline underline-offset-4" href={destination}>
          Continue to {destination}
        </Link>
      </div>
    </main>
  );
}
