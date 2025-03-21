#!/bin/sh

if [ $# -eq 0 ]; then
    echo "Usage: release <branch> <release_message>"
    exit 1
fi

BRANCH="$1"
MESSAGE="$2"

echo Releasing...

pnpm version patch --no-git-check

git add *
git branch -M $BRANCH
git commit -m $MESSAGE
git push -u origin $BRANCH

echo Released!