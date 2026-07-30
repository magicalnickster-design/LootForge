#!/usr/bin/env bash
# Create a Foundry GitHub release for LootForge.
# Usage: ./tools/release.sh 0.6.4
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  VERSION="$(node -p "require('./module.json').version")"
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Version must look like 0.6.4 (got: $VERSION)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm ci
npm run pack
node tools/build-release-zip.mjs --version "$VERSION"

# Ensure working tree versions are committed before tagging.
if ! git diff --quiet -- module.json package.json; then
  echo "module.json/package.json were updated for $VERSION — commit them before releasing." >&2
  git status -sb
  exit 1
fi

if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "Tag $VERSION already exists."
else
  git tag "$VERSION"
  git push origin "$VERSION"
fi

if gh release view "$VERSION" >/dev/null 2>&1; then
  echo "Release $VERSION exists; uploading assets."
else
  gh release create "$VERSION" \
    --title "LootForge $VERSION" \
    --notes "Foundry VTT module release $VERSION.

Install via manifest URL:
https://github.com/magicalnickster-design/LootForge/releases/download/${VERSION}/module.json"
fi

gh release upload "$VERSION" \
  dist/LootForge.zip \
  dist/module.json \
  --clobber

echo
echo "Done."
echo "manifest: https://github.com/magicalnickster-design/LootForge/releases/download/${VERSION}/module.json"
echo "download: https://github.com/magicalnickster-design/LootForge/releases/download/${VERSION}/LootForge.zip"
