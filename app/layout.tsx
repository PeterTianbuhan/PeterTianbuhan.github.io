import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

// 缝合像素字体 (Fusion Pixel), 12px monospaced, SIL OFL 1.1. Rendered at exact
// multiples of 12px so the bitmap grid stays crisp.
const pixel = localFont({
  src: "./fonts/fusion-pixel-12px-monospaced-zh_hans.otf.woff2",
  variable: "--font-pixel",
  weight: "400",
  display: "swap",
  fallback: ["PingFang SC", "Noto Sans SC", "monospace"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Peter Tian",
  description: "Bilingual notes and learning log built with Next.js and MDX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable} ${pixel.variable}`}>{children}</body>
    </html>
  );
}
