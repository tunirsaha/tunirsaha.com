#!/usr/bin/env bash
#
# deploy.sh — package the static site for Hostinger shared hosting.
#
# Produces ./tunirsaha-deploy.zip whose entries sit at the ARCHIVE ROOT
# (index.html, css/, js/, assets/, ...) — no wrapper folder. In hPanel:
#
#   File Manager → public_html → Upload → tunirsaha-deploy.zip → Extract
#
# Existing files in public_html are overwritten by the extract; nothing
# else there is touched. Delete the old zip after extracting.
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
  index.html
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

# ── 4. Apache config for shared hosting ──
cat > "$BUILD/.htaccess" <<'HTACCESS'
# tunirsaha.com — Hostinger / Apache
#
# SCOPE: this file lives in public_html and its rules are INHERITED by every
# subfolder, including public_html/projects/*. Rules below are deliberately
# limited to transport (https/www), compression, caching and headers — no
# rewriting of paths — so an existing project subfolder keeps working. Any
# project with its own .htaccess (SPA fallback, PHP rules) overrides this one
# for that folder.

DirectoryIndex index.html

# no directory listings — relevant with a projects/ folder present
Options -Indexes

# ── force https + non-www (canonical is https://tunirsaha.com/) ──
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
</IfModule>

# ── compression ──
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml \
    application/javascript application/json application/xml image/svg+xml
</IfModule>

# ── caching: hashless assets get a short-ish life, html never cached ──
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css              "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType image/svg+xml         "access plus 30 days"
  ExpiresByType image/png             "access plus 30 days"
  ExpiresByType image/x-icon          "access plus 30 days"
  ExpiresByType application/pdf       "access plus 7 days"
  ExpiresByType text/html             "access plus 0 seconds"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
</IfModule>

# ── correct types for the SEO/GEO files ──
AddType text/plain .txt
AddType application/xml .xml
AddType image/svg+xml .svg

# never serve source/config files if any ever land here.
# .md is intentionally NOT blocked — a project subfolder may legitimately
# serve one, and this rule is inherited by every subfolder.
<FilesMatch "(^\.env|^\.git|\.tex$|\.sh$|\.log$)">
  Require all denied
</FilesMatch>
HTACCESS

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
