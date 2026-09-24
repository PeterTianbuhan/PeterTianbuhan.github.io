#!/usr/bin/env bash
# Generate one 来处 illustration asset with Codex's image tool.
#   scripts/gen-life-asset.sh <name> <prompt-file> [reference images...]
# Writes art/life/raw/assets/<name>.png
set -euo pipefail
name="$1"; prompt="$2"; shift 2
refs=()
for r in "$@"; do refs+=(-i "$r"); done
out="art/life/raw/assets/$name.png"
{
  echo "Use your image generation tool to create exactly ONE image."
  [ ${#refs[@]} -gt 0 ] && echo "Reference photos of the real place are attached: match the architecture and details they show exactly, but paint in the style described."
  echo "Highest quality. Save the final image as $out (relative to the current directory). Do nothing else: no code, no other files. Reply with just the saved path and its pixel size."
  echo
  cat "$prompt"
} | codex exec -C "$(pwd)" -s workspace-write --skip-git-repo-check --ephemeral ${refs[@]+"${refs[@]}"} -o "/tmp/codex-$name.txt" - > "/tmp/codex-$name.log" 2>&1
cat "/tmp/codex-$name.txt"
