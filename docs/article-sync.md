# Article Sync

Published website articles use the GitHub `source` branch as their source of truth.

## Mapping

Each published article route maps to exactly one MDX file:

```text
/zh/blog/<slug>/ -> content/blog/zh/<slug>.mdx
/en/blog/<slug>/ -> content/blog/en/<slug>.mdx
```

The file path controls the public route. Frontmatter must include:

- `title`
- `publishedAt`
- `locale`, matching the folder name
- `translationKey`, unique within the same locale

Unreviewed writing stays in `content/drafts/` and does not trigger publishing.

## Automatic Publish

When a commit lands on `source` and changes published site inputs such as `content/blog/**`, GitHub Actions runs `.github/workflows/publish-site.yml`.

The workflow:

1. checks the article-source mapping with `npm run articles:check`;
2. builds the static site with `npm run build`;
3. prepares a clean GitHub Pages bundle with `npm run publish:bundle`;
4. copies only the generated bundle to `main`.

This keeps `source` editable and keeps `main` as the live GitHub Pages output.

## Local Check

Before pushing an article update:

```powershell
npm run articles:check
npm run build
```

Run `npm run publish:bundle` only when you want to inspect the exact generated Pages directory locally.
