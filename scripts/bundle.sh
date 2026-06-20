#!/usr/bin/env bash
# Regenerate project-bundle.md — one file with the whole codebase + docs, for
# handing to another AI (e.g. GPT) for review. Run: npm run bundle
set -e
cd "$(dirname "$0")/.."
OUT=project-bundle.md
{
  echo "# Studio — Full Source Bundle (for AI review)"
  echo
  echo "Generated $(date '+%Y-%m-%d'). One file with the entire codebase so another AI can review it cold."
  echo
  echo "**READ FIRST:** docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/UPGRADE-PLAN.md (below)."
  echo
  echo "_Note: src/pricing/pricing.config.ts has real material costs — redact before sharing publicly._"
  for f in docs/ARCHITECTURE.md docs/ROADMAP.md docs/UPGRADE-PLAN.md README.md package.json vite.config.ts tailwind.config.js \
           $(find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) | sort); do
    [ -f "$f" ] || continue
    echo
    echo "===================================================================="
    echo "FILE: $f"
    echo "===================================================================="
    cat "$f"
  done
} > "$OUT"
echo "Wrote $OUT ($(wc -l < "$OUT") lines)."
