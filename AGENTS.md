# Developer Agent Onboarding

Welcome! As an AI agent working in this repository, you must follow the Spec-Driven Development (SDD) protocol defined in our centralized playbook:

👉 **[SDD Workflow Playbook](file:///home/luismarquitti/lm-commons/ai-commons/instructions/workflows/PLAYBOOK.md)**

## Core Rules for Agents
1. **Language:** English is the official language. Write all commit messages, code comments, issue descriptions, and reviews in English.
2. **Task Board:** Linear is the Single Source of Truth (SSOT). Do not work on untracked tasks.
3. **Workspace Isolation:** Always perform work inside isolated sibling workspaces managed by the git worktree helper: `ai-commons/scripts/worktree-manager.sh`. Do not edit code directly in the main working directory.
4. **Definition of Done:** Ensure that all tests pass, coverage is >=80%, and the worktree is cleaned up post-merge.
