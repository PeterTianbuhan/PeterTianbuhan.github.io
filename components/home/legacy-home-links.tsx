"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

// Keep previously shared section links working after moving to normal routes.
export function LegacyHomeLinks({ locale }: { locale: Locale }) {
  const router = useRouter();
  useEffect(() => {
    const follow = () => {
      let target: string;
      try { target = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const page = target === "contact" ? "about" : target;
      if (["about", "projects", "writing"].includes(page)) {
        router.replace(`/${locale}/${page}/`);
      } else if (page.startsWith("read/")) {
        router.replace(`/${locale}/blog/${encodeURIComponent(page.slice(5))}/`);
      } else if (page.startsWith("project/")) {
        router.replace(`/${locale}/projects/#${encodeURIComponent(page.slice(8))}`);
      }
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [locale, router]);
  return null;
}
