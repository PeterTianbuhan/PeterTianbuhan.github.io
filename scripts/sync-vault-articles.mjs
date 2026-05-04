import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content", "blog");
const defaultVaultRawBase =
  "https://raw.githubusercontent.com/PeterTianbuhan/my-cognitive-vault/main/";
const defaultVaultRepo = "PeterTianbuhan/my-cognitive-vault";
const defaultVaultRef = "main";
const defaultLocalVaultRoot =
  os.platform() === "win32" ? "D:\\projects\\my-cognitive-vault" : "";

function fail(message) {
  console.error(`article sync failed: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    check: false,
    dryRun: false,
    localVaultRoot: process.env.VAULT_LOCAL_ROOT || defaultLocalVaultRoot,
    vaultRepo: process.env.VAULT_REPO || defaultVaultRepo,
    vaultRef: process.env.VAULT_REF || defaultVaultRef,
    vaultRawBase: process.env.VAULT_ARTICLE_RAW_BASE || defaultVaultRawBase,
    vaultToken: process.env.VAULT_REPO_TOKEN || "",
  };

  const args = [...argv];
  while (args.length > 0) {
    const current = args.shift();
    if (current === "--check") {
      options.check = true;
      continue;
    }
    if (current === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (current === "--vault-raw-base") {
      options.vaultRawBase = args.shift() ?? "";
      continue;
    }
    if (current === "--local-vault-root") {
      options.localVaultRoot = args.shift() ?? "";
      continue;
    }
    fail(`Unknown argument: ${current}`);
  }

  if (!options.vaultRawBase) {
    fail("vault raw base cannot be empty");
  }
  if (!options.vaultRawBase.endsWith("/")) {
    options.vaultRawBase += "/";
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

function vaultSourcePath(source) {
  if (typeof source !== "string") {
    return undefined;
  }
  const prefix = "my-cognitive-vault/";
  if (!source.startsWith(prefix)) {
    return undefined;
  }
  const relativePath = source.slice(prefix.length).trim();
  return relativePath || undefined;
}

function sourceUrl(rawBase, relativePath) {
  return new URL(relativePath.split(path.sep).join("/"), rawBase).toString();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "HomePage article sync",
      Accept: "text/plain, text/markdown, */*",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return (await response.text()).trimEnd() + "\n";
}

async function fetchFromGitHubApi({ vaultRepo, vaultRef, vaultToken }, relativePath) {
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const url = `https://api.github.com/repos/${vaultRepo}/contents/${encodedPath}?ref=${encodeURIComponent(vaultRef)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "HomePage article sync",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${vaultToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const payload = await response.json();
  if (payload.type !== "file" || typeof payload.content !== "string") {
    throw new Error(`GitHub API response is not a file: ${url}`);
  }
  return Buffer.from(payload.content.replaceAll("\n", ""), "base64")
    .toString("utf8")
    .trimEnd() + "\n";
}

async function readLocalVaultFile(localVaultRoot, relativePath) {
  if (!localVaultRoot) {
    return undefined;
  }
  const target = path.resolve(localVaultRoot, relativePath);
  const resolvedRoot = path.resolve(localVaultRoot);
  if (target !== resolvedRoot && !target.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Refusing to read outside local vault: ${relativePath}`);
  }
  if (!(await exists(target))) {
    return undefined;
  }
  return (await fs.readFile(target, "utf8")).trimEnd() + "\n";
}

async function fetchVaultSource(options, relativePath) {
  if (options.vaultToken) {
    return fetchFromGitHubApi(options, relativePath);
  }

  const url = sourceUrl(options.vaultRawBase, relativePath);
  try {
    return await fetchText(url);
  } catch (error) {
    const local = await readLocalVaultFile(options.localVaultRoot, relativePath);
    if (local !== undefined) {
      return local;
    }
    throw new Error(`${url}: ${error.message}`);
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const files = await listMdxFiles(contentRoot);
  const updates = [];

  for (const filePath of files) {
    const current = await fs.readFile(filePath, "utf8");
    const { data } = matter(current);
    const relativeSource = vaultSourcePath(data.source);
    if (!relativeSource) {
      continue;
    }

    let next;
    try {
      next = await fetchVaultSource(options, relativeSource);
    } catch (error) {
      fail(`${path.relative(root, filePath)} could not fetch ${relativeSource}: ${error.message}`);
    }

    if (current !== next) {
      updates.push({ filePath, source: relativeSource, next });
    }
  }

  if (options.check && updates.length > 0) {
    for (const update of updates) {
      console.error(`out of sync: ${path.relative(root, update.filePath)} <- ${update.source}`);
    }
    process.exit(1);
  }

  if (!options.dryRun && !options.check) {
    for (const update of updates) {
      await fs.writeFile(update.filePath, update.next, "utf8");
    }
  }

  for (const update of updates) {
    console.log(`Synced ${path.relative(root, update.filePath)} from ${update.source}`);
  }
  console.log(`article sync complete: ${updates.length} updated, ${files.length} checked`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
