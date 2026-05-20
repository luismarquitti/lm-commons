---
name: linear
description: Manages issues, projects, and workflows in Linear for the developer ecosystem. ALWAYS use when the user mentions "tickets", "issues", "tasks", "bugs", "planning", or "backlog". This skill ensures that all tickets follow Conventional Commits and the Spec-Driven Development (SDD) workflow.
---

# Linear Integration for SDD Workflow

## Overview
This skill optimizes project management in Linear, integrating it with the **Spec-Driven Development (SDD)** workflow. It ensures that every task is documented according to senior engineering standards, focusing on traceability and isolation.

## Workspace Context
- **Primary Team:** Default is `CLE` (ClinicCare Engineering).
- **Language Policy:** English only. All issue titles, descriptions, comments, and reviews must be in English.
- **Security & Compliance:** 
  - NEVER include real patient data (PHI) or system secrets in tickets.
  - Reference relevant ADRs or PRDs for architectural context.

## Required Conventions

### Issue Title Format
Follow **Conventional Commits** strictly:
- `feat(scope): description`
- `fix(scope): description`
- `docs(scope): description`
- `refactor(scope): description`

### Task Syncing
Instead of manual issue creation, synchronize local Compozy specifications directly to Linear:
```bash
python3 ai-commons/scripts/sync-compozy-tasks.py --dir .compozy/tasks/<feature-name> --team <TEAM_ID>
```
The script reads task frontmatter, creates or updates corresponding issues on Linear, and writes the resulting `linear_issue_id` back to the task file.

### Sibling Workspace Provisioning
Once a task is synced and has a `linear_issue_id` (e.g. `CLE-123`), create an isolated sibling worktree:
```bash
ai-commons/scripts/worktree-manager.sh create <repo-name> <branch-name> <issue-id>-<slug>
```
Always do development and testing inside this worktree before opening a PR.

## Available Tools
Use the Linear MCP tools for queries:
- **Issues:** `list_issues`, `get_issue`, `create_issue`, `update_issue`, `search_issues`.
- **Labels:** `list_issue_labels`, `create_issue_label`.
- **Projects:** `list_projects`, `get_project`.
- **Teams:** `list_teams`, `get_team`.
