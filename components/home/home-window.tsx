"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./home.module.css";

export function HomeWindow({ label, children }: { label: string; children: ReactNode }) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const timer = setTimeout(() => setFull(new URLSearchParams(location.search).get("layout") === "full"), 0);
    return () => clearTimeout(timer);
  }, []);
  return <section className={styles.window} data-layout={full ? "full" : "framed"} aria-label={label}>{children}</section>;
}
