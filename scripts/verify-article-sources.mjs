import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content", "blog");
const supportedLocales = new Set(["zh", "en"]);

function fail(message) {
  console.error(`article source check failed: ${message}`);
  process.exit(1);
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listMdxFiles(directory) {
  if (!(await exists(directory))) {
    return [];
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMdxFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(entryPath);
    }
  }

  return files;
}

function requiredString(value, label, filePath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${path.relative(root, filePath)} is missing ${label}`);
  }

  return value.trim();
}

async function run() {
  const files = await listMdxFiles(contentRoot);
  const routes = new Map();
  const localeTranslationKeys = new Map();

  for (const filePath of files) {
    const relativePath = path.relative(contentRoot, filePath);
    const [locale, fileName, ...extra] = relativePath.split(path.sep);

    if (!supportedLocales.has(locale) || extra.length > 0) {
      fail(`${path.relative(root, filePath)} must live at content/blog/<zh|en>/<slug>.mdx`);
    }

    const slug = fileName.replace(/\.mdx$/, "");
    const source = await fs.readFile(filePath, "utf8");
    const { data } = matter(source);
    const frontmatterLocale = requiredString(data.locale, "frontmatter locale", filePath);
    const translationKey = requiredString(
      data.translationKey,
      "frontmatter translationKey",
      filePath,
    );

    requiredString(data.title, "frontmatter title", filePath);
    requiredString(data.publishedAt, "frontmatter publishedAt", filePath);
    const articleSource = requiredString(data.source, "frontmatter source", filePath);

    if (!articleSource.startsWith("my-cognitive-vault/")) {
      fail(`${path.relative(root, filePath)} source must point at my-cognitive-vault`);
    }

    if (frontmatterLocale !== locale) {
      fail(
        `${path.relative(root, filePath)} has locale ${frontmatterLocale}, but its folder is ${locale}`,
      );
    }

    const route = `/${locale}/blog/${slug}/`;
    if (routes.has(route)) {
      fail(`${route} is backed by multiple files: ${routes.get(route)} and ${relativePath}`);
    }
    routes.set(route, relativePath);

    const localeTranslationKey = `${locale}:${translationKey}`;
    if (localeTranslationKeys.has(localeTranslationKey)) {
      fail(
        `translationKey ${translationKey} is duplicated in ${locale}: ` +
          `${localeTranslationKeys.get(localeTranslationKey)} and ${relativePath}`,
      );
    }
    localeTranslationKeys.set(localeTranslationKey, relativePath);
  }

  console.log(`article source check passed: ${files.length} published article file(s)`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
