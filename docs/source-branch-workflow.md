# Source Branch Workflow

This repository keeps editable Next.js source separate from the generated GitHub Pages output.

## Repository Conventions

- Repo URL: `https://github.com/PeterTianbuhan/PeterTianbuhan.github.io.git`
- Source base branch: `source`
- Native Symphony workspace: `/home/symphony/workspaces/HomePage-source`
- Live GitHub Pages branch: `main`
- Live custom domain: `petertianwork.me`

## Branch Model

Use `source` as the base branch for PRs that change Next.js source, content, docs, scripts, package metadata, or workflow guidance.

Reserve `main` for the static GitHub Pages publish root only. Worker PRs must not target `main` for ordinary source changes.

The live Pages root must keep its generated/static site files, including `CNAME`. Do not move raw Next.js source into the Pages root, delete `CNAME`, or change live publish output while doing source-branch work.

## Worker PR Rules

Before opening a worker PR:

1. Confirm the PR target branch is `source`.
2. Keep source edits in this workspace or a branch based on `source`.
3. Run lightweight verification, usually:

   ```bash
   npm run workflow:check
   npm run lint
   ```

4. Do not run publish or deploy commands unless the task explicitly asks for publishing.

Publishing commands such as `npm run publish:bundle` prepare generated output under `.publish/`. They are for an explicit publish task, not for routine source PRs.

When a change is merged or pushed to `source` and it touches published site inputs such as `content/blog/**`, `.github/workflows/publish-site.yml` automatically builds the site and updates the live `main` branch with the generated bundle. Article source rules are documented in `docs/article-sync.md`.

## Review Evidence

Pre-wrapper acceptance review can rely on local evidence: the current branch is not `main`, the source-branch docs and guardrails are present, and the local verification commands pass.

After the wrapper commits, pushes, and opens the draft PR, PR evidence must include the draft PR URL and show that the PR base branch is `source`.

## What Belongs Where

Source branch:

- `app/`, `components/`, `content/`, `lib/`
- `docs/`, `scripts/`, `templates/`
- `package.json`, lockfiles, TypeScript, ESLint, and Next.js config

Main branch:

- Generated/static GitHub Pages output
- `CNAME` for `petertianwork.me`
- `.nojekyll` when required for static assets
