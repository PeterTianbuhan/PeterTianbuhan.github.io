import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
