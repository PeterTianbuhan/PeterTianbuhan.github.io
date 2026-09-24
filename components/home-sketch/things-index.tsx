"use client";

import { useEffect, useState } from "react";
import type { Shelf } from "@/lib/i-think";
import styles from "./gallery.module.css";

// the names on the "I think" page, kept in the margin like tabs stuck to the
// edge of a sketchbook; the one being read is inked darker
export function ThingsIndex({ shelves }: { shelves: Shelf[] }) {
  const [here, setHere] = useState<string>();
  useEffect(() => {
    const heads = shelves.flatMap((s) => s.things).map((t) => document.getElementById(t.id)).filter((el) => el !== null);
    const onScroll = () => {
      // the last heading that has passed the upper third of the screen
      const line = window.innerHeight / 3;
      let current = heads[0]?.id;
      for (const h of heads) if (h.getBoundingClientRect().top < line) current = h.id;
      setHere(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shelves]);
  return (
    <nav className={styles.thingsIndex} aria-label="index">
      {shelves.map((shelf) => (
        <div key={shelf.kind}>
          <p className={styles.label}>
            <span>{shelf.kind}</span>
          </p>
          <ul>
            {shelf.things.map((t) => (
              <li key={t.id} data-here={t.id === here}>
                <a href={`#${t.id}`}>
                  {t.name}
                  {t.gist && <span>{t.gist}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
