import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const homepagePath = path.join(root, "legacy-homepage", "index.html");
const contentRoot = path.join(root, "content", "blog", "zh");
const markerStart = "<!-- AUTO_BLOG_CARD_START -->";
const markerEnd = "<!-- AUTO_BLOG_CARD_END -->";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getPosts() {
  const entries = await fs.readdir(contentRoot, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
      continue;
    }

    const slug = entry.name.replace(/\.mdx$/, "");
    const filePath = path.join(contentRoot, entry.name);
    const source = await fs.readFile(filePath, "utf8");
    const { data } = matter(source);

    posts.push({
      slug,
      title: typeof data.title === "string" ? data.title.trim() : slug,
      featured: Boolean(data.featured),
      publishedAt:
        typeof data.publishedAt === "string" ? data.publishedAt : "1970-01-01",
    });
  }

  posts.sort((left, right) => {
    if (left.featured !== right.featured) {
      return Number(right.featured) - Number(left.featured);
    }

    return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  });

  return posts;
}

function renderBlogCard(posts) {
  const latestPosts = posts.slice(0, 3);
  const postCount = `${posts.length} 篇已发布文章`;
  const links = latestPosts
    .map(
      (post) => `              <a href="/zh/blog/${encodeURIComponent(post.slug)}/">
                <span>${escapeHtml(post.title)}</span>
                <span>open</span>
              </a>`,
    )
    .join("\n");

  return `            <a href="/zh/blog/">
              <h2 class="blog-title">文章</h2>
            </a>
            <p class="blog-description">
              这里放已经写下来的课程、项目和随手记录。后面会继续慢慢整理。
            </p>
            <div class="blog-meta mono">
              <span>${postCount}</span>
              <a href="/zh/blog/"><span>查看全部</span></a>
            </div>
            <div class="blog-links">
${links}
            </div>`;
}

async function run() {
  const [homepageSource, posts] = await Promise.all([
    fs.readFile(homepagePath, "utf8"),
    getPosts(),
  ]);

  if (!homepageSource.includes(markerStart) || !homepageSource.includes(markerEnd)) {
    throw new Error("Legacy homepage markers are missing.");
  }

  const replacement = `${markerStart}\n${renderBlogCard(posts)}\n            ${markerEnd}`;
  const nextSource = homepageSource.replace(
    /<!-- AUTO_BLOG_CARD_START -->[\s\S]*?<!-- AUTO_BLOG_CARD_END -->/,
    replacement,
  );

  await fs.writeFile(homepagePath, nextSource, "utf8");
  console.log(`Refreshed ${path.relative(root, homepagePath)}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
