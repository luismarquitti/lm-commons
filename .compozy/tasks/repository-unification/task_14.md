---
status: pending
title: Decommission legacy — archive `home-lab` remote, remove old local copies
type: chore
complexity: low
dependencies:
  - task_13
---

# Task 14: Decommission legacy — archive `home-lab` remote, remove old local copies

## Overview
With the consolidated `lm-commons` pushed and verified, retire the legacy artefacts. Archive the original `luismarquitti/home-lab` GitHub repository so it becomes read-only and cannot accept split-brain commits. Remove the local `~/home-lab` directory (its history is preserved inside `lm-commons/home-lab/`). The PRD-recorded answer that the local `~/.ai-commons` was already removed in the cut-over (task 11) is verified one last time.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The remote `luismarquitti/home-lab` repository MUST be archived (read-only) via `gh repo archive`.
- The local `~/home-lab` directory MUST be removed.
- A final `verify-env.sh` pass MUST return exit 0 after the removals.
- `git -C ~/lm-commons log -- home-lab/` MUST still list the imported commits (no regression on history).
- The old `~/.ai-commons` MUST not exist (verifies task 11's cut-over once more).
- The archived remote URL MUST be retained in this task's notes for future reference.
</requirements>

## Subtasks
- [ ] 14.1 Re-run `verify-env.sh` before any removal and confirm exit 0.
- [ ] 14.2 Archive the GitHub repository: `gh repo archive luismarquitti/home-lab --yes`.
- [ ] 14.3 Confirm `gh repo view luismarquitti/home-lab --json isArchived` returns `true`.
- [ ] 14.4 Remove `~/home-lab` from disk (`rm -rf`).
- [ ] 14.5 Re-run `verify-env.sh` and `secrets-audit.sh` after removal — both MUST exit 0.

## Implementation Details
This task is intentionally last because archival is hard to reverse (`gh repo unarchive` exists, but the intent is finality). See TechSpec "Development Sequencing" step 14. The archived URL is preserved in the README (task 15) for traceability.

### Relevant Files
- GitHub: `luismarquitti/home-lab` — archived.
- `~/home-lab/` — removed.
- `~/lm-commons/home-lab/` — verified untouched.

### Dependent Files
- None — this is the terminal MVP task.

### Related ADRs
- [ADR-002: Preserve `home-lab` commit history via subtree import](adrs/adr-002.md)
- [ADR-003: Complete artifact migration into the SSOT before unifying](adrs/adr-003.md)
- [ADR-008: Re-point all consumers to the new path; no compatibility symlink](adrs/adr-008.md)

## Deliverables
- Archived remote `home-lab` repository.
- Removed local `~/home-lab` and confirmed-absent `~/.ai-commons`.
- Verification checks below — all MUST pass **(REQUIRED)**.
- No automated unit tests (destructive one-time ops); verification by post-condition checks **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — destructive one-time operations.
- Integration tests:
  - [ ] `gh repo view luismarquitti/home-lab --json isArchived --jq .isArchived` returns `true`.
  - [ ] `test -d ~/home-lab` returns false (removed).
  - [ ] `test -e ~/.ai-commons` returns false (still removed).
  - [ ] `git -C ~/lm-commons log --oneline -- home-lab/ | wc -l` matches the count from task 04.
  - [ ] `verify-env.sh` and `secrets-audit.sh --ci` each exit 0 post-removal.
- Test coverage target: >=80% (verification checklist 100% required for destructive task).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required).
- Legacy paths and remote retired with no loss of history or environment functionality.
