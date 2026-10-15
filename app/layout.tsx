import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peter Tian",
  description: "Peter Tian 的速写本 — 长文、项目与主观感受 / Peter Tian's sketchbook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
