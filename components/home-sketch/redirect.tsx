import type { Locale } from "@/lib/i18n";

// GitHub Pages serves static files, so old addresses redirect in the browser.
// The page is only blank paper for the moment it takes, with a plain link for
// visitors without JavaScript.
export function PaperRedirect({ locale, to }: { locale: Locale; to: string }) {
  return (
    <main style={{ minHeight: "100vh", background: "#f8f4ea" }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(to)});` }} />
      <noscript>
        <p style={{ padding: "18vh 24px", textAlign: "center", fontFamily: "var(--font-serif)", color: "#2a2a2e" }}>
          <a href={to}>{locale === "zh" ? "这一页搬走了，点这里继续 →" : "This page has moved, continue →"}</a>
        </p>
      </noscript>
    </main>
  );
}
