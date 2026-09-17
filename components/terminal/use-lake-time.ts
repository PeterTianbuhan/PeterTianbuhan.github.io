"use client";
import { useEffect, useState, useMemo } from "react";
import { beijingHour, timeOfDay } from "./time-of-day";

export function useLakeTime() {
  const [hour, setHour] = useState(18.5);
  useEffect(() => {
    // Development-only art direction preview; deployed pages always use Beijing time.
    const preview =
      process.env.NODE_ENV === "development"
        ? new URLSearchParams(location.search).get("previewTime")
        : null;
    const match = preview?.match(/^(\d{1,2}):(\d{2})$/);
    const fixed =
      match && Number(match[1]) < 24 && Number(match[2]) < 60
        ? Number(match[1]) + Number(match[2]) / 60
        : null;
    const update = () => setHour(fixed ?? beijingHour());
    const initial = setTimeout(update, 0);
    const interval = setInterval(update, 30_000);
    const onVisible = () => {
      if (!document.hidden) update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return useMemo(() => timeOfDay(hour), [hour]);
}
