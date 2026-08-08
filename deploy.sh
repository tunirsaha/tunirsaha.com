#!/usr/bin/env bash
#
# deploy.sh — package the static site for Hostinger shared hosting.
#
# Produces ./tunirsaha-deploy.zip whose entries sit at the ARCHIVE ROOT
# (index.html, css/, js/, assets/, ...) — no wrapper folder. In hPanel:
#
#   File Manager → public_html → Upload → tunirsaha-deploy.zip → Extract
#
# Existing files in public_html are overwritten by the extract; nothing else
# there is touched, so projects/ survives. Delete the zip after extracting.
#
# One caveat, for the record rather than for ceremony: during the extract the
# site is briefly half-written. On 2026-08-08 a deploy caught mid-flight served a
# four-day-old index.html while robots.txt, sitemap.xml, llms.txt, styles.css and
# main.js all 404'd — and the host's default 404 is a domain-parking loader, so
# for those few seconds the site looked parked. The 404.html + ErrorDocument in
# .htaccess now shipping fixes the visible symptom permanently. The window itself
# is a few seconds against a crawler that visits maybe daily; not worth
# engineering around.
#
# Usage: ./deploy.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BUILD="$ROOT/.deploy-build"
ZIP="$ROOT/tunirsaha-deploy.zip"

# Everything the live site actually serves. Add new top-level files here.
FILES=(
  .htaccess
  index.html
  404.html
  robots.txt
  sitemap.xml
  llms.txt
  favicon.ico
  Tunir_Saha_Resume.pdf
)
DIRS=(
  css
  js
  assets
)

say() { printf '  %s\n' "$*"; }

echo
echo "── packaging tunirsaha.com ─────────────────────────────"

# ── 1. verify every payload exists before touching anything ──
missing=0
for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || { echo "  MISSING FILE: $f" >&2; missing=1; }
done
for d in "${DIRS[@]}"; do
  [[ -d "$d" ]] || { echo "  MISSING DIR:  $d" >&2; missing=1; }
done
[[ $missing -eq 0 ]] || { echo "aborting — nothing packaged." >&2; exit 1; }

# ── 2. sanity-check the local references in index.html resolve ──
broken=0
while IFS= read -r ref; do
  [[ -e "${ref#/}" ]] || { echo "  BROKEN REF in index.html: $ref" >&2; broken=1; }
done < <(grep -oE '(href|src)="[^"#]+"' index.html \
         | sed -E 's/^(href|src)="//; s/"$//' \
         | grep -vE '^(https?:|mailto:|tel:|data:|//)' \
         | sort -u)
[[ $broken -eq 0 ]] || { echo "aborting — fix the references first." >&2; exit 1; }
say "references OK"

# ── 3. stage a clean tree ──
rm -rf "$BUILD"
mkdir -p "$BUILD"
for f in "${FILES[@]}"; do cp "$f" "$BUILD/"; done
for d in "${DIRS[@]}"; do cp -R "$d" "$BUILD/"; done

# strip macOS cruft that would otherwise ride along
find "$BUILD" -name '.DS_Store' -delete
find "$BUILD" -name '._*' -delete

# ── 4. Apache config ──
# .htaccess is copied from the repo in step 3 like any other payload. it used to
# be generated here by a heredoc, which meant the copy you could read at the repo
# root and the copy that actually shipped were two files free to drift — and they
# did: the root one silently fell a full font-caching revision behind. one file,
# edited in one place, is the whole point.

# ── 5. zip with contents at the archive root ──
rm -f "$ZIP"
( cd "$BUILD" && zip -rq "$ZIP" . -x '.DS_Store' )
rm -rf "$BUILD"

echo
say "built: $(basename "$ZIP")  ($(du -h "$ZIP" | cut -f1))"
echo
unzip -l "$ZIP" | awk 'NR>3 && $1 ~ /^[0-9]+$/ { printf "  %8s  %s\n", $1, $4 }'
echo
echo "── next ────────────────────────────────────────────────"
echo "  hPanel → File Manager → public_html"
echo "  Upload $(basename "$ZIP") → right-click → Extract → overwrite"
echo "  Then delete the zip from public_html."
echo
echo "  ('show hidden files' must be on, or .htaccess will not extract —"
echo "   that file carries the https redirect, HSTS and the 404 handler.)"
echo
