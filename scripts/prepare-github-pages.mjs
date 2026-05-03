import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    sourceRoot: process.cwd(),
    outputRoot: process.cwd(),
    outputDir: undefined,
  };

  while (args.length > 0) {
    const current = args.shift();

    if (!current) {
      continue;
    }

    if (current === "--source-root") {
      options.sourceRoot = path.resolve(args.shift() ?? "");
      continue;
    }

    if (current === "--output-root") {
      options.outputRoot = path.resolve(args.shift() ?? "");
      continue;
    }

    if (current === "--output-dir") {
      options.outputDir = path.resolve(args.shift() ?? "");
      continue;
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  return options;
}

const domain = "petertianwork.me";
const sourceOnlyEntries = [
  "app",
  "components",
  "content",
  "lib",
  "node_modules",
  "package.json",
  "next.config.ts",
];

async function ensureExists(targetPath, description, baseRoot) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(`${description} not found: ${path.relative(baseRoot, targetPath)}`);
  }
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function assertPublishDestination({ sourceRoot, outDir, publishDir }) {
  const resolvedSource = path.resolve(sourceRoot);
  const resolvedOut = path.resolve(outDir);
  const resolvedPublish = path.resolve(publishDir);

  if (resolvedPublish === resolvedSource) {
    throw new Error("Refusing to publish into the source root.");
  }

  if (resolvedPublish === resolvedOut) {
    throw new Error("Refusing to publish back into Next.js out/.");
  }

  if (!resolvedPublish.startsWith(`${resolvedSource}${path.sep}`)) {
    throw new Error("Publish output must stay inside this workspace.");
  }
}

async function verifyPublishDir(publishDir) {
  await ensureExists(
    path.join(publishDir, "index.html"),
    "Publish root index.html",
    publishDir,
  );
  await ensureExists(path.join(publishDir, "CNAME"), "Publish CNAME", publishDir);
  await ensureExists(path.join(publishDir, ".nojekyll"), "Publish .nojekyll", publishDir);

  const cname = await fs.readFile(path.join(publishDir, "CNAME"), "utf8");
  if (cname.trim() !== domain) {
    throw new Error(`Publish CNAME must be ${domain}, got ${JSON.stringify(cname.trim())}.`);
  }

  const rawSourceEntries = [];
  for (const entry of sourceOnlyEntries) {
    if (await exists(path.join(publishDir, entry))) {
      rawSourceEntries.push(entry);
    }
  }

  if (rawSourceEntries.length > 0) {
    throw new Error(
      `Publish bundle contains source-only entries: ${rawSourceEntries.join(", ")}`,
    );
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const outDir = path.join(options.sourceRoot, "out");
  const publishRoot = path.join(options.outputRoot, ".publish");
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const publishDir =
    options.outputDir ?? path.join(publishRoot, `github-pages-${stamp}`);
  const latestPointerPath = path.join(publishRoot, "latest-github-pages.txt");

  await ensureExists(outDir, "Static export output", options.sourceRoot);
  await ensureExists(
    path.join(outDir, "index.html"),
    "Static export root index.html",
    options.sourceRoot,
  );
  assertPublishDestination({ sourceRoot: options.sourceRoot, outDir, publishDir });

  await fs.mkdir(publishDir, { recursive: true });
  await fs.cp(outDir, publishDir, { recursive: true, force: true });
  await fs.writeFile(path.join(publishDir, "CNAME"), `${domain}\n`, "utf8");
  await fs.writeFile(path.join(publishDir, ".nojekyll"), "", "utf8");
  await verifyPublishDir(publishDir);
  await fs.writeFile(latestPointerPath, `${publishDir}\n`, "utf8");

  console.log(`Prepared ${path.relative(options.outputRoot, publishDir)}`);
  console.log(`Verified index.html, CNAME=${domain}, .nojekyll, and no raw source entries.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
