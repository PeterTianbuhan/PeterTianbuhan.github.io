import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const thoughtsRoot = path.join(root, "content", "thoughts");
const blogRoot = path.join(root, "content", "blog");
const supportedLocales = new Set(["zh", "en"]);
const allowedStatuses = new Set(["seed", "linked", "growing"]);
const allowedDecisions = new Set(["merge-candidate", "new-direction", "undecided"]);
const allowedSourcePrefixes = [
  "my-cognitive-vault/00-Inbox/thoughts/",
  "my-cognitive-vault/40-Notes/thoughts/",
];

function fail(message) {
  console.error(`thought note check failed: ${message}`);
  process.exitCode = 1;
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
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(entryPath);
    }
  }

  return files;
}

function requiredString(value, label, filePath) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${path.relative(root, filePath)} missing ${label}`);
    return "";
  }

  return value.trim();
}

async function run() {
  const files = await listMdxFiles(thoughtsRoot);

  for (const filePath of files) {
    const relative = path.relative(thoughtsRoot, filePath);
    const [locale, fileName, ...extra] = relative.split(path.sep);
    if (!supportedLocales.has(locale) || extra.length > 0 || !fileName?.endsWith(".mdx")) {
      fail(`${path.relative(root, filePath)} must live at content/thoughts/<zh|en>/<slug>.mdx`);
    }

    const rawSource = await fs.readFile(filePath, "utf8");
    const { content, data } = matter(rawSource);

    requiredString(data.title, "frontmatter title", filePath);
    const createdAt = requiredString(data.createdAt, "frontmatter createdAt", filePath);
    if (createdAt && Number.isNaN(Date.parse(createdAt))) {
      fail(`${path.relative(root, filePath)} has invalid createdAt`);
    }

    const thoughtSource = requiredString(data.source, "frontmatter source", filePath);
    if (!allowedSourcePrefixes.some((prefix) => thoughtSource.startsWith(prefix))) {
      fail(
        `${path.relative(root, filePath)} source must point at ` +
          "my-cognitive-vault/00-Inbox/thoughts/ or my-cognitive-vault/40-Notes/thoughts/",
      );
    }

    if (typeof data.status === "string" && !allowedStatuses.has(data.status)) {
      fail(`${path.relative(root, filePath)} has invalid status ${JSON.stringify(data.status)}`);
    }

    if (typeof data.routeDecision === "string" && !allowedDecisions.has(data.routeDecision)) {
      fail(`${path.relative(root, filePath)} has invalid routeDecision ${JSON.stringify(data.routeDecision)}`);
    }

    if (data.status === "linked" && typeof data.articleSlug !== "string") {
      fail(`${path.relative(root, filePath)} status=linked requires articleSlug`);
    }

    if (typeof data.articleSlug === "string" && data.articleSlug.trim()) {
      const postPath = path.join(blogRoot, locale, `${data.articleSlug.trim()}.mdx`);
      if (!(await exists(postPath))) {
        fail(`${path.relative(root, filePath)} points at missing articleSlug ${data.articleSlug}`);
      }
    }

    if (content.trim().length < 12) {
      fail(`${path.relative(root, filePath)} content is too short to be useful`);
    }
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log(`thought note check passed: ${files.length} thought note file(s)`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
