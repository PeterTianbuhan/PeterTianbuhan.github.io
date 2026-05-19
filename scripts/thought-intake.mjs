import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const blogRoot = path.join(root, "content", "blog", "zh");
const publicThoughtRoot = path.join(root, "content", "thoughts", "zh");
const defaultLocalVaultRoot =
  os.platform() === "win32" ? "D:\\projects\\my-cognitive-vault" : "";
const vaultThoughtRoot = "00-Inbox/thoughts";

function fail(message) {
  console.error(`thought intake failed: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    articleSlug: "",
    body: "",
    bodyFile: "",
    force: false,
    isNewDirection: false,
    localVaultRoot: process.env.VAULT_LOCAL_ROOT || defaultLocalVaultRoot,
    slug: "",
    tags: [],
    title: "",
    write: false,
  };

  const args = [...argv];
  while (args.length > 0) {
    const current = args.shift();
    if (current === "--title") {
      options.title = args.shift() ?? "";
    } else if (current === "--body") {
      options.body = args.shift() ?? "";
    } else if (current === "--body-file") {
      options.bodyFile = args.shift() ?? "";
    } else if (current === "--tags") {
      options.tags = (args.shift() ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (current === "--article") {
      options.articleSlug = args.shift() ?? "";
    } else if (current === "--slug") {
      options.slug = args.shift() ?? "";
    } else if (current === "--local-vault-root") {
      options.localVaultRoot = args.shift() ?? "";
    } else if (current === "--new") {
      options.isNewDirection = true;
    } else if (current === "--write") {
      options.write = true;
    } else if (current === "--force") {
      options.force = true;
    } else {
      fail(`Unknown argument: ${current}`);
    }
  }

  return options;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readBody(options) {
  if (options.bodyFile) {
    return fs.readFile(path.resolve(options.bodyFile), "utf8");
  }

  return options.body;
}

async function listPosts() {
  const entries = await fs.readdir(blogRoot, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"));

  return Promise.all(
    files.map(async (file) => {
      const slug = file.name.replace(/\.mdx$/, "");
      const source = await fs.readFile(path.join(blogRoot, file.name), "utf8");
      const { content, data } = matter(source);
      return {
        content,
        excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
        slug,
        tags: Array.isArray(data.tags) ? data.tags : [],
        title: typeof data.title === "string" ? data.title : slug,
      };
    }),
  );
}

function cjkBigrams(value) {
  const groups = value.match(/[\p{Script=Han}]{2,}/gu) ?? [];
  const grams = [];

  for (const group of groups) {
    for (let index = 0; index < group.length - 1; index += 1) {
      grams.push(group.slice(index, index + 2));
    }
  }

  return grams;
}

function tokenize(value) {
  const lower = value.toLowerCase();
  const latin = lower.match(/[a-z0-9][a-z0-9-]{1,}/g) ?? [];
  return new Set([...latin, ...cjkBigrams(lower)].filter((token) => token.length > 1));
}

function scorePost(inputTokens, post) {
  const titleTokens = tokenize(post.title);
  const summaryTokens = tokenize(`${post.excerpt} ${post.tags.join(" ")}`);
  const contentTokens = tokenize(post.content.slice(0, 4000));
  let score = 0;

  for (const token of inputTokens) {
    if (titleTokens.has(token)) score += 4;
    if (summaryTokens.has(token)) score += 2;
    if (contentTokens.has(token)) score += 1;
  }

  return score;
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 58)
    .replace(/^-|-$/g, "");

  return slug || `idea-${new Date().toISOString().slice(0, 10)}`;
}

function yamlString(value) {
  return JSON.stringify(value);
}

function renderFrontmatter({ articleSlug, date, isNewDirection, source, tags, title }) {
  const lines = [
    "---",
    `title: ${yamlString(title)}`,
    `createdAt: ${yamlString(date)}`,
    "tags:",
    ...(tags.length ? tags.map((tag) => `  - ${tag}`) : ["  - 随想"]),
    `status: ${yamlString(articleSlug ? "linked" : "seed")}`,
    `routeDecision: ${yamlString(articleSlug ? "merge-candidate" : isNewDirection ? "new-direction" : "undecided")}`,
    `source: ${yamlString(source)}`,
  ];

  if (articleSlug) {
    lines.push(`articleSlug: ${yamlString(articleSlug)}`);
  }

  lines.push("---", "");
  return lines.join("\n");
}

function vaultSource(baseSlug) {
  return `my-cognitive-vault/${vaultThoughtRoot}/${baseSlug}.md`;
}

function resolveVaultThoughtPath(localVaultRoot, baseSlug) {
  if (!localVaultRoot) {
    fail("Local vault root is required to write a thought note. Use --local-vault-root or VAULT_LOCAL_ROOT.");
  }

  const resolvedRoot = path.resolve(localVaultRoot);
  const target = path.resolve(resolvedRoot, ...vaultThoughtRoot.split("/"), `${baseSlug}.md`);
  if (target !== resolvedRoot && !target.startsWith(`${resolvedRoot}${path.sep}`)) {
    fail(`Refusing to write outside local vault: ${target}`);
  }

  return target;
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.title.trim()) {
    fail("Use --title to describe the idea.");
  }

  const body = (await readBody(options)).trim();
  if (!body) {
    fail("Use --body or --body-file to provide the idea text.");
  }

  const posts = await listPosts();
  const inputTokens = tokenize(`${options.title} ${body} ${options.tags.join(" ")}`);
  const candidates = posts
    .map((post) => ({ ...post, score: scorePost(inputTokens, post) }))
    .filter((post) => post.score > 0)
    .toSorted((left, right) => right.score - left.score)
    .slice(0, 5);

  console.log("Merge candidates:");
  if (candidates.length) {
    for (const candidate of candidates) {
      console.log(`- ${candidate.slug} (${candidate.score}) ${candidate.title}`);
    }
  } else {
    console.log("- no strong local article candidates");
  }

  if (!options.write) {
    console.log("\nDry run only. Add --write with either --article <slug> or --new to create a note.");
    return;
  }

  if (options.articleSlug) {
    const articlePath = path.join(blogRoot, `${options.articleSlug}.mdx`);
    if (!(await exists(articlePath))) {
      fail(`--article points at a missing article: ${options.articleSlug}`);
    }
  } else if (!options.isNewDirection) {
    fail("Before writing, choose --article <slug> if this can merge into an article, or --new if it is a new direction.");
  }

  const date = new Date().toISOString().slice(0, 10);
  const baseSlug = options.slug || `${slugify(options.title)}-${date}`;
  const publicTargetPath = path.join(publicThoughtRoot, `${baseSlug}.mdx`);
  const vaultTargetPath = resolveVaultThoughtPath(options.localVaultRoot, baseSlug);
  const sourcePath = vaultSource(baseSlug);

  if ((await exists(publicTargetPath)) && !options.force) {
    fail(`Refusing to overwrite existing note: ${path.relative(root, publicTargetPath)}. Use --force if intentional.`);
  }
  if ((await exists(vaultTargetPath)) && !options.force) {
    fail(`Refusing to overwrite existing vault note: ${vaultTargetPath}. Use --force if intentional.`);
  }

  await fs.mkdir(publicThoughtRoot, { recursive: true });
  await fs.mkdir(path.dirname(vaultTargetPath), { recursive: true });
  const source = `${renderFrontmatter({
    articleSlug: options.articleSlug,
    date,
    isNewDirection: options.isNewDirection,
    source: sourcePath,
    tags: options.tags,
    title: options.title,
  })}${body}\n`;

  await fs.writeFile(vaultTargetPath, source, "utf8");
  await fs.writeFile(publicTargetPath, source, "utf8");
  console.log(`\nWrote ${vaultTargetPath}`);
  console.log(`Mirrored ${path.relative(root, publicTargetPath)}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
