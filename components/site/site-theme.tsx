"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { useSiteTime } from "./use-site-time";
import { readableColor, type TimeOfDay } from "@/components/terminal/time-of-day";

const ClockContext = createContext<TimeOfDay | null>(null);

// Content and links are server-rendered children. This layer only supplies color
// and time, so future visual styles can use the same pages and navigation.
export function SiteTheme({ locale, className, children }: {
  locale: Locale;
  className: string;
  children: ReactNode;
}) {
  const time = useSiteTime();
  const p = time.palette;
  const style = {
    "--site-bg": p.bg,
    "--site-panel": p.panel,
    "--site-text": p.text,
    "--site-muted": p.muted,
    "--site-accent": p.accent,
    "--site-edge": p.edge,
    "--site-chrome": p.chrome,
    "--site-chrome-text": readableColor(p.muted, p.chrome),
    "--site-code": p.code,
    "--site-code-text": readableColor(p.text, p.code),
    "--site-selection-text": readableColor(p.text, p.edge),
  } as CSSProperties;
  return <ClockContext.Provider value={time}>
    <main className={className} style={style} data-period={time.period} lang={locale === "zh" ? "zh-CN" : "en"}>
      {children}
    </main>
  </ClockContext.Provider>;
}

export function SiteClock({ locale }: { locale: Locale }) {
  const time = useContext(ClockContext);
  if (!time) return null;
  const hour = Math.floor(time.hour);
  const minute = Math.floor((time.hour - hour) * 60);
  return <span>{locale === "zh" ? "北京" : "Beijing"} {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</span>;
}
