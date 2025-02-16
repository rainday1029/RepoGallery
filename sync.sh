#!/bin/bash
# sync.sh: Sync with upstream, keep config.yaml and index.html, use upstream for other files

BRANCH="main"  # If the main branch is master, change this to "master"
UPSTREAM_REMOTE="upstream"
UPSTREAM_BRANCH="main"

# Ensure the upstream remote exists
if ! git remote get-url $UPSTREAM_REMOTE > /dev/null 2>&1; then
    git remote add upstream https://github.com/anlit75/RepoGallery.git
fi

# Switch to the main branch
echo "Switching to $BRANCH branch..."
git checkout $BRANCH

# Fetch updates from $UPSTREAM_REMOTE
echo "Fetching updates from $UPSTREAM_REMOTE..."
git fetch $UPSTREAM_REMOTE

# Merge with upstream
echo "Merging $UPSTREAM_REMOTE/$UPSTREAM_BRANCH..."
git merge $UPSTREAM_REMOTE/$UPSTREAM_BRANCH

# Keep local config.yaml and index.html
echo "Keeping local config.yaml and index.html..."
git checkout --ours config.yaml index.html
git add config.yaml index.html

# Use upstream version for other files
echo "Using upstream version for other files..."
git checkout --theirs .
git add .

# Complete the merge
git commit -m "Merged with upstream, keeping local config.yaml and index.html"
git push origin $BRANCH

echo "Merge complete!"
