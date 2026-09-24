import Link from "next/link";

// A missing page is a blank sheet of the sketchbook with the way back.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "0 24px",
        background: "#f8f4ea",
        color: "#2a2a2e",
        fontFamily: "var(--font-serif)",
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 22, letterSpacing: "0.08em" }}>这一页还没画。</p>
        <p style={{ margin: "10px 0 32px", fontSize: 15, opacity: 0.6 }}>This page hasn&apos;t been drawn.</p>
        <p style={{ margin: 0, fontSize: 15, display: "flex", gap: 28, justifyContent: "center" }}>
          <Link href="/zh/">回到首页 →</Link>
          <Link href="/en/">Home →</Link>
        </p>
      </div>
    </main>
  );
}
