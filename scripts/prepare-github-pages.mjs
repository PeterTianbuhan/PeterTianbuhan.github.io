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

async function ensureExists(targetPath, description, baseRoot) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(`${description} not found: ${path.relative(baseRoot, targetPath)}`);
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const outDir = path.join(options.sourceRoot, "out");
  const publishRoot = path.join(options.outputRoot, ".publish");
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const publishDir =
    options.outputDir ?? path.join(publishRoot, `github-pages-${stamp}`);
  const homepagePath = path.join(options.sourceRoot, "legacy-homepage", "index.html");
  const latestPointerPath = path.join(publishRoot, "latest-github-pages.txt");

  await ensureExists(outDir, "Static export output", options.sourceRoot);
  await ensureExists(homepagePath, "Legacy homepage", options.sourceRoot);

  await fs.mkdir(publishDir, { recursive: true });
  await fs.cp(outDir, publishDir, { recursive: true, force: true });
  await fs.copyFile(homepagePath, path.join(publishDir, "index.html"));
  await fs.writeFile(path.join(publishDir, "CNAME"), `${domain}\n`, "utf8");
  await fs.writeFile(path.join(publishDir, ".nojekyll"), "", "utf8");
  await fs.writeFile(latestPointerPath, `${publishDir}\n`, "utf8");

  console.log(`Prepared ${path.relative(options.outputRoot, publishDir)}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
