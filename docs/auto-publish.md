# Auto Publish

Use this when you want to turn the reviewed source branch into a deploy-ready GitHub Pages bundle without replacing `main` with raw source files.

For normal article edits, prefer the automatic workflow in `.github/workflows/publish-site.yml`: push the reviewed MDX change to `source`, and the workflow will build and publish the generated output to `main`. The local commands below are still useful for manual verification or emergency publishing.

## Commands

If you are adding a new article, write it first:

```powershell
npm run post:intake -- .\templates\post-intake.template.json
```

Check that every live route has a single source MDX file:

```powershell
npm run articles:check
```

Then refresh the old homepage bridge only when `legacy-homepage/index.html` exists in your workspace:

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

1. Runs `next build` and exports static files into `out`.
2. Prepares a fresh `.publish/github-pages-<timestamp>` directory with:
   - exported `zh` / `en` routes
   - the generated root `index.html` from `out`
   - `CNAME` for `petertianwork.me`
   - `.nojekyll` so GitHub Pages serves `_next`
   - `.publish/latest-github-pages.txt` pointing to the newest bundle
3. Verifies the bundle has `index.html`, `CNAME`, and `.nojekyll`, and that common raw source entries such as `app/`, `components/`, `content/`, `package.json`, and `next.config.ts` are absent.

## Output

The deploy-ready directory is a timestamped folder like:

```text
.publish\github-pages-2026-04-23T14-30-00-000Z
```

## Safe Handoff To Main

Do this only after the source branch redesign has been reviewed.

From the source workspace:

```bash
npm run build
npm run publish:bundle
PUBLISH_DIR="$(cat .publish/latest-github-pages.txt)"
test -f "$PUBLISH_DIR/index.html"
test "$(cat "$PUBLISH_DIR/CNAME")" = "petertianwork.me"
test -f "$PUBLISH_DIR/.nojekyll"
test ! -e "$PUBLISH_DIR/package.json"
test ! -d "$PUBLISH_DIR/app"
```

Then use a separate checkout or worktree for the live `main` branch. Copy only the generated bundle contents into that publish root; do not copy the source workspace itself.

```bash
git worktree add ../HomePage-main-publish main
rsync -a --delete \
  --exclude .git \
  "$PUBLISH_DIR"/ \
  ../HomePage-main-publish/
cd ../HomePage-main-publish
test -f index.html
test "$(cat CNAME)" = "petertianwork.me"
test ! -e package.json
test ! -d app
git status --short
```

Review the `main` worktree diff before committing. The expected diff is generated/static Pages output plus `CNAME` and `.nojekyll`, not raw Next.js source.
