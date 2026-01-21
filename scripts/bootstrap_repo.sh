#!/usr/bin/env bash
set -euo pipefail

repo_name="${1:-$(basename "$PWD")}"
remote_url="${2:-}"
branch_name="${3:-crm}"

ensure_git_repo() {
  if [ ! -d .git ]; then
    git init
  fi
}

ensure_readme_title() {
  if [ ! -f README.md ]; then
    printf "# %s\n" "$repo_name" > README.md
    return
  fi

  if ! grep -qE "^# " README.md; then
    tmp_file="$(mktemp)"
    printf "# %s\n\n" "$repo_name" > "$tmp_file"
    cat README.md >> "$tmp_file"
    mv "$tmp_file" README.md
  fi
}

ensure_branch() {
  git branch -M "$branch_name"
}

ensure_initial_commit() {
  if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    git add README.md
    git commit -m "Initial commit"
  fi
}

ensure_remote() {
  if [ -z "$remote_url" ]; then
    return
  fi

  if git remote get-url origin >/dev/null 2>&1; then
    existing_url="$(git remote get-url origin)"
    if [ "$existing_url" != "$remote_url" ]; then
      printf "origin already set to %s; leaving unchanged\n" "$existing_url" >&2
    fi
    return
  fi

  git remote add origin "$remote_url"
}

ensure_git_repo
ensure_readme_title
ensure_branch
ensure_initial_commit
ensure_remote

printf "Next: git push -u origin %s\n" "$branch_name"
