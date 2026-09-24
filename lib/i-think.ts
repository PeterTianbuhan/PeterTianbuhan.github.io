import fs from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

// "I think": subjective notes on models, tools and other people's projects,
// one file per language in content/i-think. Each thing is a `### name | gist`
// heading under a `## kind` heading; changed minds are ~~crossed out~~ in
// place rather than deleted.

export type Thing = { name: string; gist?: string; id: string };
export type Shelf = { kind: string; things: Thing[] };

export async function getIThink(locale: Locale) {
  return fs.readFile(path.join(process.cwd(), "content", "i-think", `${locale}.mdx`), "utf8");
}

export function thingId(name: string) {
  return name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

// "Grok | 莽撞" → the name, the few words after it, and the name's id
export function splitThing(heading: string): Thing {
  const [name, gist] = heading.split(" | ").map((s) => s.trim());
  return { name, gist: gist || undefined, id: thingId(name) };
}

// the things talked about, kind by kind, in the order written
export function shelvesIn(source: string): Shelf[] {
  const shelves: Shelf[] = [];
  for (const [, hashes, text] of source.matchAll(/^(##|###) (.+)$/gm)) {
    if (hashes === "##") shelves.push({ kind: text.trim(), things: [] });
    else shelves.at(-1)?.things.push(splitThing(text));
  }
  return shelves;
}
