#!/bin/bash
set -euo pipefail

BRANCH="${BRANCH:-main}"
UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/anlit75/RepoGallery.git}"

# Ensure the upstream remote exists
if ! git remote get-url "$UPSTREAM_REMOTE" > /dev/null 2>&1; then
    git remote add "$UPSTREAM_REMOTE" "$UPSTREAM_URL"
fi

# Switch to the main branch
echo "Switching to $BRANCH branch..."
git checkout "$BRANCH"

# Ensure the working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "The working directory has uncommitted changes. Please commit or stash them before running this script."
    exit 1
fi

# Fetch the latest updates from upstream
echo "Fetching updates from $UPSTREAM_REMOTE..."
git fetch "$UPSTREAM_REMOTE"

# Rebase to get the changes from upstream
echo "Rebasing onto $UPSTREAM_REMOTE/$UPSTREAM_BRANCH..."
if ! git rebase "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"; then
    echo "Conflict detected, resolving..."

    # Keep local changes for config.yaml, use upstream version for other files
    git checkout --ours config.yaml
    git add config.yaml
    git checkout --theirs .
    git add .

    # Continue rebase
    git rebase --continue
fi

# Push changes to origin
echo "Pushing changes to origin..."
git push --force-with-lease origin "$BRANCH"

echo "Rebase complete!"
