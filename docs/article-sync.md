# Article Sync

Published website articles use `my-cognitive-vault` as the writing source of
truth. The HomePage repository keeps generated MDX copies under `content/blog/**`
for static site builds, but those copies should normally be updated by sync, not
edited by hand.

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
- `source`, pointing at the vault source note, for example
  `my-cognitive-vault/90-Public-Candidates/current-workflow-2026-05-04.md`

Unreviewed writing stays in `content/drafts/` and does not trigger publishing.

## Source Of Truth

Default article edits happen in:

```text
D:\projects\my-cognitive-vault
```

Push the vault change to `github.com/PeterTianbuhan/my-cognitive-vault`. HomePage
then pulls the published article source from GitHub raw content:

```powershell
npm run articles:sync
```

The sync script reads each HomePage article's `source` frontmatter, fetches the
matching vault file from GitHub, and replaces the local MDX copy when it differs.
Direct edits to `content/blog/**` are for emergency repair or sync tooling only.

If the vault repository is private, add a HomePage repository secret named
`VAULT_REPO_TOKEN` with read access to `PeterTianbuhan/my-cognitive-vault`.
Local sync falls back to `D:\projects\my-cognitive-vault` when unauthenticated
GitHub raw content is unavailable.

## Automatic Publish

When a commit lands on `source`, or on the hourly scheduled run, GitHub Actions
runs `.github/workflows/publish-site.yml`.

The workflow:

1. syncs article MDX from the GitHub vault with `npm run articles:sync`;
2. commits synced `content/blog/**` changes back to `source` when needed;
3. checks the article-source mapping with `npm run articles:check`;
4. builds the static site with `npm run build`;
5. prepares a clean GitHub Pages bundle with `npm run publish:bundle`;
6. copies only the generated bundle to `main`.

This keeps `source` editable and keeps `main` as the live GitHub Pages output.

## Local Check

Before pushing an article update:

```powershell
npm run articles:sync
npm run articles:check
npm run build
```

Run `npm run publish:bundle` only when you want to inspect the exact generated Pages directory locally.
