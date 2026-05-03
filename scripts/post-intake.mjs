import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content", "blog");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    dryRun: false,
    force: false,
  };

  while (args.length > 0) {
    const current = args.shift();

    if (!current) {
      continue;
    }

    if (current === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (current === "--force") {
      options.force = true;
      continue;
    }

    if (!options.manifestPath) {
      options.manifestPath = current;
      continue;
    }

    fail(`Unknown argument: ${current}`);
  }

  if (!options.manifestPath) {
    fail("Usage: npm run post:intake -- <manifest.json> [--dry-run] [--force]");
  }

  return options;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function ensureString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`Missing or invalid string field: ${label}`);
  }

  return value.trim();
}

function ensureOptionalString(value, label) {
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    fail(`Invalid string field: ${label}`);
  }

  return value.trim();
}

function ensureArrayOfStrings(value, label) {
  if (!Array.isArray(value)) {
    fail(`Missing or invalid array field: ${label}`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== "string" || item.trim() === "") {
      fail(`Invalid string in array field: ${label}`);
    }

    return item.trim();
  });

  return normalized;
}

function normalizeLocale(locale) {
  if (locale !== "zh" && locale !== "en") {
    fail(`Unsupported locale: ${locale}`);
  }

  return locale;
}

function escapeDoubleQuotes(input) {
  return input.replaceAll("\\", "\\\\").replaceAll("\"", '\\"');
}

async function resolveBody(localeConfig, manifestDir, locale) {
  if (localeConfig.bodyFile) {
    const bodyPath = path.resolve(manifestDir, localeConfig.bodyFile);
    return (await fs.readFile(bodyPath, "utf8")).trimEnd();
  }

  if (typeof localeConfig.body === "string" && localeConfig.body.trim() !== "") {
    return localeConfig.body.trimEnd();
  }

  return locale === "zh"
    ? "## 摘要\n\n在这里继续写正文。"
    : "## Summary\n\nContinue writing here.";
}

function buildDocument({
  title,
  excerpt,
  publishedAt,
  updatedAt,
  tags,
  featured,
  locale,
  translationKey,
  body,
}) {
  const frontmatter = [
    "---",
    `title: "${escapeDoubleQuotes(title)}"`,
    `excerpt: "${escapeDoubleQuotes(excerpt)}"`,
    `publishedAt: "${publishedAt}"`,
    ...(updatedAt ? [`updatedAt: "${updatedAt}"`] : []),
    "tags:",
    ...tags.map((tag) => `  - ${tag}`),
    `featured: ${featured ? "true" : "false"}`,
    `locale: "${locale}"`,
    `translationKey: "${translationKey}"`,
    "---",
    "",
    body,
    "",
  ];

  return frontmatter.join("\n");
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(root, options.manifestPath);
  const manifestDir = path.dirname(manifestPath);
  const manifest = await readJson(manifestPath);

  const publishedAt = ensureString(manifest.publishedAt, "publishedAt");
  const updatedAt = ensureOptionalString(manifest.updatedAt, "updatedAt");
  const featured = Boolean(manifest.featured);

  if (!manifest.locales || typeof manifest.locales !== "object") {
    fail("Manifest must contain a locales object.");
  }

  const localeEntries = Object.entries(manifest.locales);

  if (localeEntries.length === 0) {
    fail("Manifest must contain at least one locale entry.");
  }

  const firstLocaleConfig = localeEntries[0]?.[1];
  const fallbackTranslationKey =
    typeof firstLocaleConfig?.slug === "string" && firstLocaleConfig.slug.trim() !== ""
      ? firstLocaleConfig.slug.trim()
      : undefined;
  const translationKey = ensureString(
    manifest.translationKey ?? fallbackTranslationKey,
    "translationKey",
  );

  const outputs = [];

  for (const [rawLocale, rawConfig] of localeEntries) {
    const locale = normalizeLocale(rawLocale);

    if (!rawConfig || typeof rawConfig !== "object") {
      fail(`Locale config must be an object: ${locale}`);
    }

    const slug = ensureString(rawConfig.slug, `locales.${locale}.slug`);
    const title = ensureString(rawConfig.title, `locales.${locale}.title`);
    const excerpt = ensureString(rawConfig.excerpt, `locales.${locale}.excerpt`);
    const tags = ensureArrayOfStrings(rawConfig.tags ?? [], `locales.${locale}.tags`);
    const body = await resolveBody(rawConfig, manifestDir, locale);

    const directory = path.join(contentRoot, locale);
    const filePath = path.join(directory, `${slug}.mdx`);

    outputs.push({
      filePath,
      locale,
      slug,
      content: buildDocument({
        title,
        excerpt,
        publishedAt,
        updatedAt,
        tags,
        featured,
        locale,
        translationKey,
        body,
      }),
    });
  }

  for (const output of outputs) {
    try {
      await fs.access(output.filePath);

      if (!options.force) {
        fail(`File already exists: ${path.relative(root, output.filePath)} (use --force to overwrite)`);
      }
    } catch {
      // File does not exist, which is fine.
    }
  }

  if (options.dryRun) {
    console.log("Dry run complete. Files to write:");

    for (const output of outputs) {
      console.log(`- ${path.relative(root, output.filePath)}`);
    }

    return;
  }

  for (const output of outputs) {
    await fs.mkdir(path.dirname(output.filePath), { recursive: true });
    await fs.writeFile(output.filePath, output.content, "utf8");
    console.log(`Wrote ${path.relative(root, output.filePath)}`);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
