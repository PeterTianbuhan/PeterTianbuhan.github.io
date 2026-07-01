// 从 life vault 直接发布：扫描指定的「种类」文件夹，把带 `public: true` 的笔记
// 转成站点吃的 content/blog/zh/*.mdx。约定见 README / hub。
//
//   发布开关：笔记 frontmatter 里 `public: true` —— 只有它才出库。
//   栏目 = 文件夹：内核→思考 / 学习笔记·课程笔记→在学 / 项目→在做 / 随笔→生活。
//   可选覆盖：slug（干净 URL，不写用中文兜底）、title / excerpt / date / tags 不写就自动推。
//
// 用法：
//   node scripts/publish-from-vault.mjs            # 生成 / 更新 / 清理
//   node scripts/publish-from-vault.mjs --dry-run  # 只报告，不落盘
//   LIFE_VAULT_ROOT=/path/to/vault node scripts/publish-from-vault.mjs

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "content", "blog", "zh");

const vaultRoot =
  process.env.LIFE_VAULT_ROOT ||
  (os.platform() === "darwin" ? "/Users/peterlee/Documents/life vault" : "");

// 种类文件夹 → 首页栏目 key（与 components/home/home-view.tsx 的 SECTIONS 对齐）
const SECTION_BY_FOLDER = {
  内核: "thinking",
  学习笔记: "learning",
  课程笔记: "learning",
  项目: "building",
  随笔: "life",
};

const DRY_RUN = process.argv.includes("--dry-run") || process.argv.includes("--check");

function fail(message) {
  console.error(`publish failed: ${message}`);
  process.exit(1);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walkMarkdown(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkMarkdown(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function slugify(input) {
  return String(input)
    .trim()
    .replace(/[\s·:：，,、。.\/\\|_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function firstH1(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : undefined;
}

function toIsoDate(value) {
  if (!value) return undefined;
  const m = String(value).match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

function transformBody(body) {
  let out = body;
  // 剥掉开头的 H1（标题由站点单独渲染，避免重复）
  out = out.replace(/^﻿?\s*#\s+.+\r?\n+/, "");
  // Obsidian callout 标记：> [!note] X → > X
  out = out.replace(/^(>\s*)\[![^\]]+\]\s?/gm, "$1");
  // 嵌入 ![[...]] 去掉
  out = out.replace(/!\[\[[^\]]*\]\]/g, "");
  // 双链 [[目标|别名]] → 别名；[[目标]] → 目标（暂时降级为纯文本）
  out = out.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  out = out.replace(/\[\[([^\]]+)\]\]/g, "$1");
  return out.trim() + "\n";
}

function deriveExcerpt(data, body) {
  if (data.excerpt) return String(data.excerpt).trim();
  const lines = body.split(/\r?\n/);
  for (let raw of lines) {
    let line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue; // 标题
    line = line.replace(/^>\s*/, ""); // 引用前缀
    line = line
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    if (!line) continue;
    if (line.length <= 118) return line;
    const window = line.slice(0, 118);
    const cut = Math.max(
      window.lastIndexOf("。"),
      window.lastIndexOf("；"),
      window.lastIndexOf("，"),
    );
    return `${window.slice(0, cut > 40 ? cut + 1 : 118)}…`;
  }
  return "";
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((t) => String(t)).filter(Boolean);
  return String(value)
    .split(/[,，、\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function buildMdx(post) {
  const fm = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `excerpt: ${JSON.stringify(post.excerpt)}`,
    `publishedAt: ${JSON.stringify(post.publishedAt)}`,
    post.updatedAt ? `updatedAt: ${JSON.stringify(post.updatedAt)}` : null,
    `section: ${JSON.stringify(post.section)}`,
    `locale: "zh"`,
    `translationKey: ${JSON.stringify(post.slug)}`,
    `featured: ${post.featured ? "true" : "false"}`,
    post.tags.length
      ? ["tags:", ...post.tags.map((t) => `  - ${JSON.stringify(t)}`)].join("\n")
      : "tags: []",
    // 生成来源标记：本脚本只管理带这个字段的文件，手工文件不受影响
    `source: ${JSON.stringify(`life-vault/${post.rel}`)}`,
    "---",
    "",
    post.body,
  ].filter((x) => x !== null);
  return fm.join("\n");
}

async function run() {
  if (!vaultRoot) fail("找不到 life vault，设置环境变量 LIFE_VAULT_ROOT");
  if (!(await exists(vaultRoot))) fail(`life vault 不存在：${vaultRoot}`);

  const desired = new Map(); // slug -> { outPath, content, meta }
  const seenSlugs = new Set();
  let scanned = 0;
  let flagged = 0;

  for (const [folder, section] of Object.entries(SECTION_BY_FOLDER)) {
    const dir = path.join(vaultRoot, folder);
    const files = await walkMarkdown(dir);
    for (const file of files) {
      scanned += 1;
      const raw = await fs.readFile(file, "utf8");
      const { content, data } = matter(raw);
      if (data.public !== true) continue;
      flagged += 1;

      const rel = path.relative(vaultRoot, file).split(path.sep).join("/");
      const base = path.basename(file, ".md").replace(/\s*\d{4}-\d{2}-\d{2}\s*$/, "");
      const title = (data.title && String(data.title)) || firstH1(content) || base;
      const slug = data.slug ? slugify(data.slug) : slugify(title);
      if (!slug) fail(`无法为「${title}」生成 slug，请在 frontmatter 里写 slug:`);
      if (seenSlugs.has(slug)) {
        fail(`slug 冲突：${slug}（${rel}）。给其中一篇写不同的 slug:`);
      }
      seenSlugs.add(slug);

      const publishedAt =
        toIsoDate(data.publishedAt) ||
        toIsoDate(data.date) ||
        toIsoDate(data.created) ||
        new Date().toISOString().slice(0, 10);
      const updatedAt = toIsoDate(data.updated) || toIsoDate(data.updatedAt);

      const post = {
        slug,
        rel,
        section,
        title,
        excerpt: deriveExcerpt(data, content),
        publishedAt,
        updatedAt: updatedAt && updatedAt !== publishedAt ? updatedAt : undefined,
        tags: normalizeTags(data.tags),
        featured: data.featured === true,
        body: transformBody(content),
      };

      desired.set(slug, {
        outPath: path.join(outDir, `${slug}.mdx`),
        content: buildMdx(post),
        section,
        title,
      });
    }
  }

  // 清理：只删本脚本生成过的、这次不再公开的文件（认 source: life-vault/ 标记）
  await fs.mkdir(outDir, { recursive: true });
  const existing = (await fs.readdir(outDir)).filter((f) => f.endsWith(".mdx"));
  const toRemove = [];
  for (const file of existing) {
    const full = path.join(outDir, file);
    const { data } = matter(await fs.readFile(full, "utf8"));
    const isGenerated = typeof data.source === "string" && data.source.startsWith("life-vault/");
    const slug = file.replace(/\.mdx$/, "");
    if (isGenerated && !desired.has(slug)) toRemove.push(full);
  }

  const writes = [];
  const updates = [];
  for (const [slug, item] of desired) {
    const prev = (await exists(item.outPath)) ? await fs.readFile(item.outPath, "utf8") : null;
    if (prev === null) writes.push(item);
    else if (prev !== item.content) updates.push(item);
  }

  if (!DRY_RUN) {
    for (const full of toRemove) await fs.rm(full);
    for (const item of [...writes, ...updates]) {
      await fs.writeFile(item.outPath, item.content, "utf8");
    }
  }

  const label = DRY_RUN ? "[dry-run] " : "";
  for (const item of writes) console.log(`${label}＋ 新增 ${item.section.padEnd(8)} ${item.title}`);
  for (const item of updates) console.log(`${label}～ 更新 ${item.section.padEnd(8)} ${item.title}`);
  for (const full of toRemove) console.log(`${label}－ 撤下 ${path.basename(full)}`);
  console.log(
    `${label}完成：扫描 ${scanned} 篇，公开 ${flagged} 篇 → 新增 ${writes.length} / 更新 ${updates.length} / 撤下 ${toRemove.length}`,
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
