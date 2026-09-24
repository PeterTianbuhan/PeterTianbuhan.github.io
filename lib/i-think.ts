import fs from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

// "I think": subjective notes on models, tools and other people's projects,
// one file per language in content/i-think. Changed minds are ~~crossed out~~
// in place rather than deleted.

export async function getIThink(locale: Locale) {
  return fs.readFile(path.join(process.cwd(), "content", "i-think", `${locale}.mdx`), "utf8");
}

// the same ids the page gives each ### heading
export function thingId(name: string) {
  return name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

// the things talked about, in order, for the home page
export function thingsIn(source: string) {
  return [...source.matchAll(/^### (.+)$/gm)].map((m) => ({ name: m[1].trim(), id: thingId(m[1]) }));
}
