---
status: pending
title: "feat(git): create worktree-manager.sh script and document worktree rules"
type: infra
complexity: medium
dependencies:
  - task_02
---

# Task 06: feat(git): create worktree-manager.sh script and document worktree rules

## Overview
Implement a shell helper script `worktree-manager.sh` to safely manage the lifecycle of git worktrees. This utility ensures that agents and the developer can provision and tear down isolated, sibling development workspaces cleanly, preventing ghost directories and branch locking. Document these procedures in the Playbook.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A shell script MUST be created at `ai-commons/scripts/worktree-manager.sh`.
- The script MUST support two commands: `create` (to provision a sibling worktree) and `cleanup` (to safely delete a worktree and its associated local branch after merge).
- Worktree directories MUST follow the naming convention `../worktrees/<repo>-<id>-<slug>` (relative to the repository root).
- The script MUST verify there are no active locks, uncommitted changes, or conflicts before deleting worktrees.
- The `ai-commons/instructions/workflows/PLAYBOOK.md` MUST be updated to guide developers and agents on how to use `worktree-manager.sh`.
</requirements>

## Subtasks
- [ ] 06.1 Create shell script `ai-commons/scripts/worktree-manager.sh`.
- [ ] 06.2 Implement `create` action validating paths and naming.
- [ ] 06.3 Implement `cleanup` action safely removing the worktree and branch.
- [ ] 06.4 Add worktree guidelines and script instructions to `PLAYBOOK.md`.

## Implementation Details
Write standard Bash. Ensure the script resolves relative paths correctly so that it is portable across different repositories inside `/home/luismarquitti/`.

### Relevant Files
- `ai-commons/scripts/worktree-manager.sh` [NEW] — Worktree script.
- `ai-commons/instructions/workflows/PLAYBOOK.md` — Playbook to update.

### Dependent Files
- None.

### Related ADRs
- [ADR-006: Sibling Directory Worktree Convention](adrs/adr-006.md)
- [ADR-010: Agent-Managed Worktree Lifecycle](adrs/adr-010.md)

## Deliverables
- Executable shell script `worktree-manager.sh` in English.
- Updated `PLAYBOOK.md` section detailing worktree operations.

## Tests
- Unit tests:
  - [ ] None.
- Integration tests:
  - [ ] Run the script to create a dummy worktree, verify it exists as a sibling, then clean it up and verify it is completely removed.

## Success Criteria
- Worktree creation and cleanup execute cleanly.
- No ghost directories or locking issues remain after cleanup.
