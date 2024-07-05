#!/bin/bash
# Helper function to automate git pushes
# $1 --> your commit message
# $2 --> specify single file commits
# COMMIT MESSAGES MUST BE IN QUOTES!


git status
echo "Git running"
echo ""
sleep 10
if [ "$1" ]; then
    if [ "$2" ]; then
        git add "$2"
    else
        git add .
    fi
    git commit -m "$1"
    echo ""
    git push
else
    echo ""
    echo "No commit message"
fi