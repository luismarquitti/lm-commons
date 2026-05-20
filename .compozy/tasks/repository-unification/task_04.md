---
status: pending
title: Import `home-lab/` history via `git subtree add`
type: infra
complexity: low
dependencies:
  - task_01
  - task_02
---

# Task 04: Import `home-lab/` history via `git subtree add`

## Overview
Import the finalized `home-lab` repository into `~/lm-commons` under the `home-lab/` prefix using `git subtree add`, preserving all 11 commits of infrastructure history. After this task, `git log -- home-lab/` in `lm-commons` reproduces the original `home-lab` history.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The import MUST use `git subtree add --prefix=home-lab` from the finalized `main` of the source `home-lab` repository.
- All commits from `home-lab` main MUST be reachable from `lm-commons` HEAD after the import.
- File-count and SHA-1 parity between the source `home-lab/main` working tree and the imported `lm-commons/home-lab/` MUST hold.
- `git -C ~/lm-commons log -- home-lab/` MUST list every commit recorded in task 01.
- The local `~/home-lab` directory MUST NOT be deleted by this task (task 14 handles removal after verification).
</requirements>

## Subtasks
- [ ] 04.1 Read the recorded `main` commit count from task 01.
- [ ] 04.2 Run `git subtree add --prefix=home-lab <source> main` in `~/lm-commons`.
- [ ] 04.3 Verify the imported commit count matches the recorded value.
- [ ] 04.4 Verify file-count and SHA-1 parity between `~/home-lab` and `~/lm-commons/home-lab`.
- [ ] 04.5 Tag or note the import commit for future traceability.

## Implementation Details
The source of the subtree add is the local `~/home-lab` directory (or the remote URL). After import, `~/home-lab` remains intact until task 14. See TechSpec "Development Sequencing" step 4.

### Relevant Files
- `~/home-lab/` — source.
- `~/lm-commons/home-lab/` — destination.

### Dependent Files
- None; subsequent tasks reference `lm-commons/home-lab/` for Ansible work.

### Related ADRs
- [ADR-002: Preserve `home-lab` commit history via subtree import](adrs/adr-002.md)
- [ADR-006: Import `home-lab` history via `git subtree add`](adrs/adr-006.md)

## Deliverables
- `~/lm-commons/home-lab/` populated with the imported content.
- Preserved history reachable via `git log`.
- Verification checks below — all MUST pass **(REQUIRED)**.
- No automated unit tests (git operation); verification via git assertions **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — git import operation.
- Integration tests:
  - [ ] `git -C ~/lm-commons log --oneline -- home-lab/ | wc -l` equals the commit count recorded in task 01.
  - [ ] `find ~/lm-commons/home-lab -type f | wc -l` equals `find ~/home-lab -type f -not -path '*/.git/*' | wc -l`.
  - [ ] `git -C ~/lm-commons cat-file -e <known-home-lab-commit-sha>` succeeds for at least the latest pre-import commit.
  - [ ] `diff -r ~/home-lab/ansible ~/lm-commons/home-lab/ansible` reports no differences.
- Test coverage target: >=80% (verification checks substitute for code coverage).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checks 100% required).
- `home-lab` history is fully preserved under `home-lab/` in `lm-commons`.
- Original `~/home-lab` directory is left intact for later decommissioning.
