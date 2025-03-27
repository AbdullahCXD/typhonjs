#!/bin/bash

# Check for required arguments
if [ $# -lt 2 ]; then
    echo "Usage: ./release.sh <branch> <release_message>"
    echo "Example: ./release.sh master \"Release v1.0.1\""
    exit 1
fi

BRANCH="$1"
MESSAGE="$2"

# Function to check command status
check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

echo "Starting release process..."


# Update version
echo "Updating version..."
pnpm version patch --no-git-tag-version
check_status "Failed to update version"

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Stage changes
git add *

# Switch to target branch
git branch -m $BRANCH
check_status "Failed to switch to branch $BRANCH"

# Commit with proper message
git commit -m "$MESSAGE" -m "Release version $NEW_VERSION"
check_status "Failed to commit changes"

# Push changes
echo "Pushing to origin/$BRANCH..."
git push -u origin "$BRANCH"
check_status "Failed to push changes"

echo "✨ Release v$NEW_VERSION completed successfully!"
echo "Branch: $BRANCH"
echo "Message: $MESSAGE"