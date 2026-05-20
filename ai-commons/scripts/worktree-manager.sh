#!/usr/bin/env bash
set -euo pipefail

# Sibling worktree root directory
WORKTREES_ROOT="/home/luismarquitti/worktrees"

show_usage() {
    echo "Usage:"
    echo "  $0 create <repo-name> <branch-name> <worktree-slug>"
    echo "  $0 cleanup <repo-name> <branch-name>"
    exit 1
}

if [ $# -lt 1 ]; then
    show_usage
fi

CMD="$1"

if [ "${CMD}" = "create" ]; then
    if [ $# -lt 4 ]; then
        show_usage
    fi
    REPO_NAME="$2"
    BRANCH_NAME="$3"
    SLUG="$4"
    
    REPO_PATH="/home/luismarquitti/${REPO_NAME}"
    if [ ! -d "${REPO_PATH}/.git" ] && [ ! -f "${REPO_PATH}/.git" ]; then
        echo "Error: ${REPO_PATH} is not a valid git repository." >&2
        exit 1
    fi

    mkdir -p "${WORKTREES_ROOT}"
    WORKTREE_PATH="${WORKTREES_ROOT}/${REPO_NAME}-${SLUG}"

    echo "Creating isolated workspace for ${REPO_NAME} at ${WORKTREE_PATH}..."

    cd "${REPO_PATH}"

    # Check if branch exists
    if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
        echo "Branch '${BRANCH_NAME}' already exists. Adding worktree..."
        git worktree add "${WORKTREE_PATH}" "${BRANCH_NAME}"
    else
        echo "Creating new branch '${BRANCH_NAME}'..."
        # Find default branch (main or master)
        DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@' || echo "main")
        git worktree add -b "${BRANCH_NAME}" "${WORKTREE_PATH}" "origin/${DEFAULT_BRANCH}" || git worktree add -b "${BRANCH_NAME}" "${WORKTREE_PATH}" "${DEFAULT_BRANCH}"
    fi

    echo "Worktree created successfully."
    echo "Workspace Path: ${WORKTREE_PATH}"

elif [ "${CMD}" = "cleanup" ]; then
    if [ $# -lt 3 ]; then
        show_usage
    fi
    REPO_NAME="$2"
    BRANCH_NAME="$3"

    REPO_PATH="/home/luismarquitti/${REPO_NAME}"
    if [ ! -d "${REPO_PATH}/.git" ] && [ ! -f "${REPO_PATH}/.git" ]; then
        echo "Error: ${REPO_PATH} is not a valid git repository." >&2
        exit 1
    fi

    # Locate worktree path matching branch
    cd "${REPO_PATH}"
    WORKTREE_PATH=$(git worktree list --porcelain | grep -B 2 "branch refs/heads/${BRANCH_NAME}" | head -n 1 | cut -d ' ' -f 2 || echo "")

    if [ -z "${WORKTREE_PATH}" ]; then
        echo "No active worktree found for branch '${BRANCH_NAME}' in ${REPO_NAME}."
        exit 0
    fi

    echo "Removing worktree at ${WORKTREE_PATH}..."
    git worktree remove -f "${WORKTREE_PATH}"
    git worktree prune

    echo "Cleanup complete."
else
    show_usage
fi
