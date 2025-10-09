#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Backup originals before minification
TS=$(date -u +"%Y%m%dT%H%M%SZ")
BACKUP_DIR="$ROOT/backups/original-$TS"
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

echo "Backing up .js and .css files (excluding already-minified files, node_modules, .git and backups)"
count=0
# Use find with -prune to skip node_modules, .git and backups, and use process substitution to avoid subshell
while IFS= read -r -d '' file; do
	# normalize path (remove leading ./)
	rel=${file#./}
	dest="$BACKUP_DIR/$rel"
	mkdir -p "$(dirname "$dest")"
	cp -p "$file" "$dest"
	count=$((count+1))
done < <(find . \( -path './node_modules' -o -path './.git' -o -path './backups' \) -prune -o -type f \( -name '*.js' -o -name '*.css' \) \! -name '*.min.js' \! -name '*.min.css' -print0)

echo "Backed up $count files to $BACKUP_DIR"

echo "Installing devDependencies (terser, csso) -- this requires network access"
npm install --no-audit --no-fund

echo "Running production minification (this will overwrite or create .min.js/.min.css files)"
npm run minify

echo "Done. Check generated .min.js and .min.css files. Backups are in: $BACKUP_DIR"
