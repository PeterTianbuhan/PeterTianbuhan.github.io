import { execFileSync } from "node:child_process";

const expectedRepo = "PeterTianbuhan/PeterTianbuhan.github.io";

// Accept both https and ssh remotes for the same repository.
function repoOf(url) {
  return url
    .replace(/^https:\/\/github\.com\//, "")
    .replace(/^git@github\.com:/, "")
    .replace(/\.git$/, "");
}

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

if (branch === "main") {
  fail("source work must not be done directly on main; target source instead.");
}

if (repoOf(originUrl) !== expectedRepo) {
  fail(`origin should point at ${expectedRepo}, got ${originUrl || "(none)"}.`);
}

if (process.exitCode) {
  process.exit();
}

console.log("workflow check passed");
console.log(`branch: ${branch || "(detached)"}`);
console.log("source PR target: source");
console.log("main is reserved for generated/static GitHub Pages output");

