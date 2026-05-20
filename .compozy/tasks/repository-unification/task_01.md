---
status: pending
title: Finalize `home-lab` source branch
type: chore
complexity: low
dependencies: []
---

# Task 01: Finalize `home-lab` source branch

## Overview
The standalone `home-lab` repository has 5 uncommitted modifications on the `feat/openclaw-bare-metal` branch and is not merged into `main`. The subtree import in task 04 brings `main` into `lm-commons`, so this work must be committed, merged, and pushed first to avoid losing any infrastructure history during consolidation.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- All currently modified files on `feat/openclaw-bare-metal` MUST be committed using Conventional Commits.
- `feat/openclaw-bare-metal` MUST be merged into `main` in the `~/home-lab` repository.
- `main` MUST be pushed to the existing `origin` (`luismarquitti/home-lab`) remote.
- After this task, `git status` in `~/home-lab` MUST report a clean working tree on `main`.
- The final commit count of `main` MUST be recorded for verification in task 04.
</requirements>

## Subtasks
- [ ] 01.1 Review the 5 modified files on `feat/openclaw-bare-metal` and stage them.
- [ ] 01.2 Commit with a descriptive Conventional Commits message.
- [ ] 01.3 Merge `feat/openclaw-bare-metal` into `main` with `--no-ff` to preserve branch history.
- [ ] 01.4 Push `main` to the `origin` remote.
- [ ] 01.5 Record the final commit count of `main` (`git -C ~/home-lab rev-list --count main`).

## Implementation Details
This task operates only in the existing `~/home-lab` repository. No changes are made in `lm-commons` yet. See TechSpec "Development Sequencing" step 1.

### Relevant Files
- `~/home-lab/` — the standalone repository being finalized.
- The 5 modified files: `CLAUDE.md`, `ansible/playbooks/07-openclaw-deploy.yml`, `ansible/templates/openclaw.json.j2`, `docs/homelab-context.md`, `homelab-network-docs.md`.

### Dependent Files
- None in `lm-commons`. Task 04 consumes the finalized `main` branch.

### Related ADRs
- [ADR-002: Preserve `home-lab` commit history via subtree import](adrs/adr-002.md)
- [ADR-006: Import `home-lab` history via `git subtree add`](adrs/adr-006.md)

## Deliverables
- `~/home-lab` on `main` with a clean working tree.
- `feat/openclaw-bare-metal` merged into `main` and pushed to `origin`.
- Recorded commit count of `main` for task 04 verification.
- Verification checklist below — all items MUST pass **(REQUIRED)**.
- No automated unit tests (procedural git operations); the verification checklist substitutes **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — procedural git operations only.
- Integration tests:
  - [ ] `git -C ~/home-lab status` reports a clean working tree.
  - [ ] `git -C ~/home-lab rev-parse --abbrev-ref HEAD` returns `main`.
  - [ ] `git -C ~/home-lab log feat/openclaw-bare-metal..main --oneline` returns nothing (branch fully merged).
  - [ ] `git -C ~/home-lab ls-remote --heads origin main` SHA matches `git -C ~/home-lab rev-parse main`.
- Test coverage target: >=80% (procedural; verification checklist 100% required).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required for this procedural task).
- `~/home-lab` is on `main` with a clean working tree and the feature branch merged and pushed.
- Commit count of `main` is recorded for downstream verification.
