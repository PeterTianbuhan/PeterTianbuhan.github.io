# Post Intake

Use this when you want to create a new blog post without touching MDX files by hand.

## Command

```powershell
npm run post:intake -- .\templates\post-intake.template.json --dry-run
```

Remove `--dry-run` to actually write the files.

## Manifest shape

- `translationKey`: shared key used to connect translations
- `publishedAt`: required date string like `2026-04-23`
- `updatedAt`: optional date string
- `featured`: `true` or `false`
- `locales`: one or both of `zh` and `en`

Each locale entry supports:

- `slug`
- `title`
- `excerpt`
- `tags`
- `body` or `bodyFile`

## Notes

- Existing files are protected by default.
- Pass `--force` to overwrite an existing post file.
- If only one locale is ready, keep just that locale in the manifest.
