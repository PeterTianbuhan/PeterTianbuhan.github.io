import fs from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

// "funfact": small things worth knowing, one entry each, added as they come.
// One file per language in content/funfact. Each entry is a `### title`
// heading, a date line, then a few paragraphs.

export type Fact = { title: string; date: string; id: string };

export async function getFunfact(locale: Locale) {
  return fs.readFile(path.join(process.cwd(), "content", "funfact", `${locale}.mdx`), "utf8");
}

// the id Prose puts on a `###` heading from its words, so the homepage can
// link to the entry on the list page
export function factId(title: string) {
  return title.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

// the entries, in the order written; the line after each heading is its date
export function factsIn(source: string): Fact[] {
  const facts: Fact[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^### (.+)$/);
    if (!heading) continue;
    const date = lines.slice(i + 1).find((line) => line.trim() !== "") ?? "";
    facts.push({ title: heading[1].trim(), date: date.trim(), id: factId(heading[1]) });
  }
  return facts;
}
