#!/usr/bin/env bash
set -euo pipefail

repo_name="${1:-$(basename "$PWD")}"
remote_url="${2:-}"
branch_name="${3:-crm}"

# TODO: Avoid overwriting an existing README; only insert a title if missing.
printf "# %s\n" "$repo_name" > README.md

git init
git add README.md
git commit -m "Initial commit"
git branch -M "$branch_name"

if [ -n "$remote_url" ]; then
  git remote add origin "$remote_url"
fi

printf "Next: git push -u origin %s\n" "$branch_name"
