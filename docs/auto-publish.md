# Auto Publish

Use this when you want to turn local MDX content into a deploy-ready GitHub Pages bundle.

## Commands

If you are adding a new article, write it first:

```powershell
npm run post:intake -- .\templates\post-intake.template.json
```

Then refresh the root homepage bridge:

```powershell
npm run legacy:refresh
```

Build the static site:

```powershell
npm run build
```

Then prepare the final GitHub Pages bundle:

```powershell
npm run publish:bundle
```

If the target post already exists, add `--force` to the `post:intake` step.

## What it does

1. Refreshes `legacy-homepage/index.html` so the root homepage shows the latest local posts.
2. Runs `next build` and exports static files into `out`.
3. Prepares a fresh `.publish/github-pages-<timestamp>` directory with:
   - exported `zh` / `en` routes
   - `legacy-homepage/index.html` as the root homepage
   - `CNAME` for `petertianwork.me`
   - `.nojekyll` so GitHub Pages serves `_next`
   - `.publish/latest-github-pages.txt` pointing to the newest bundle

## Output

The deploy-ready directory is a timestamped folder like:

```text
.publish\github-pages-2026-04-23T14-30-00-000Z
```
