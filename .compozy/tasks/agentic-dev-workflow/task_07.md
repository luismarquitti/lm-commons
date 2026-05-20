---
status: pending
title: "test(workflow): execute end-to-end integration workflow pilot"
type: test
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
  - task_05
  - task_06
---

# Task 07: test(workflow): execute end-to-end integration workflow pilot

## Overview
Perform a complete end-to-end dry-run and validation of the SDD workflow in a dummy test feature. This pilot validates that tasks are synced to Linear, worktrees are created, code changes are committed, pull request is opened, code review is simulated, and the workspace is cleaned up following all playbooks and rules.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A dummy feature test folder MUST be created under `.compozy/tasks/pilot-test/`.
- Tasks inside `pilot-test/` MUST be synced to Linear using `sync-compozy-tasks.py`.
- The pilot MUST run through the entire lifecycle:
    1. Synchronize tasks (local task file -> Linear Issue).
    2. Provision worktree via `worktree-manager.sh`.
    3. Make dummy commit (Conventional Commit in English).
    4. Simulate PR opening and review trigger.
    5. Cleanup worktree via `worktree-manager.sh`.
- The entire process MUST run in English and exit without any errors.
</requirements>

## Subtasks
- [ ] 07.1 Create dummy tasks and sync them to Linear.
- [ ] 07.2 Run `worktree-manager.sh create` and perform dummy changes in the isolated workspace.
- [ ] 07.3 Mock or perform a pull request creation and trigger a code review round.
- [ ] 07.4 Run `worktree-manager.sh cleanup` to ensure complete removal of worktrees.

## Implementation Details
This pilot is the ultimate integration test for the Phase 1 MVP. Ensure all commands are logged and results are captured in a walkthrough document.

### Relevant Files
- `.compozy/tasks/pilot-test/` [NEW] — Dummy pilot folder.

### Dependent Files
- None.

### Related ADRs
- [ADR-001: Phased rollout with a human-in-the-loop MVP](adrs/adr-001.md)
- [ADR-003: Pilot on IntelliFinance; repo unification out of scope](adrs/adr-003.md)

## Deliverables
- Successful execution logs.
- Clean working directory with no trailing git worktrees.

## Tests
- Integration tests:
  - [ ] Verify that all 5 steps of the primary flow execute cleanly and the Linear tickets reflect the expected states.

## Success Criteria
- The end-to-end pilot completes without manual interventions outside the defined playbook rules.
- Verification checks exit with 0.
