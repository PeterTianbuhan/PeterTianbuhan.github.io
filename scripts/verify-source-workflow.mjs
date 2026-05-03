import { execFileSync } from "node:child_process";
import path from "node:path";

const expectedRepoUrl = "https://github.com/PeterTianbuhan/PeterTianbuhan.github.io.git";
const expectedWorkspaceSuffix = path.join("HomePage-source");

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function fail(message) {
  console.error(`workflow check failed: ${message}`);
  process.exitCode = 1;
}

const branch = git(["branch", "--show-current"]);
const originUrl = git(["remote", "get-url", "origin"]);
const workspace = process.cwd();

if (branch === "main") {
  fail("source work must not be done directly on main; target source instead.");
}

if (originUrl !== expectedRepoUrl) {
  fail(`origin should be ${expectedRepoUrl}, got ${originUrl || "(none)"}.`);
}

if (!workspace.endsWith(expectedWorkspaceSuffix)) {
  fail(`workspace should end with ${expectedWorkspaceSuffix}, got ${workspace}.`);
}

if (process.exitCode) {
  process.exit();
}

console.log("workflow check passed");
console.log(`branch: ${branch || "(detached)"}`);
console.log("source PR target: source");
console.log("main is reserved for generated/static GitHub Pages output");

