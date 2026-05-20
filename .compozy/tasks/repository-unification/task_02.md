---
status: pending
title: Initialize `lm-commons` repository scaffold
type: infra
complexity: low
dependencies: []
---

# Task 02: Initialize `lm-commons` repository scaffold

## Overview
Create the `~/lm-commons` directory, initialize it as a git repository, and add the repo-level scaffolding files: a minimal `README.md`, a `.gitignore` that excludes secrets and generated configs, and a `.stow-local-ignore` that keeps repository metadata out of GNU Stow operations. This produces the empty container that subsequent tasks fill in.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The repository MUST be created at `~/lm-commons` and MUST NOT exist elsewhere.
- `~/lm-commons` MUST be initialized as a git repository with a single initial commit.
- A `README.md` MUST exist with at least the repository name, a one-paragraph purpose, and a pointer to the future full README (task 15).
- A `.gitignore` MUST exist excluding generated tool configs, local Bitwarden session artifacts, and the on-disk `.vault_pass` pattern.
- A `.stow-local-ignore` MUST exist excluding `.git`, `README.md`, `.gitignore`, and itself from Stow operations.
- The repository MUST NOT have a remote configured yet (the remote is added in task 13).
</requirements>

## Subtasks
- [ ] 02.1 Create the directory `~/lm-commons` and run `git init`.
- [ ] 02.2 Author a minimal `README.md` (placeholder; full content in task 15).
- [ ] 02.3 Author `.gitignore` covering generated configs and known secret-bearing patterns.
- [ ] 02.4 Author `.stow-local-ignore` covering repo metadata.
- [ ] 02.5 Make the initial commit containing only the scaffold files.

## Implementation Details
This task creates only the empty container; `ai-commons/` and `home-lab/` arrive in tasks 03 and 04. See TechSpec "Data Models" for the target repository layout. The branch name follows the developer's default (typically `main`).

### Relevant Files
- (new) `~/lm-commons/README.md` — minimal scaffold.
- (new) `~/lm-commons/.gitignore` — ignore rules.
- (new) `~/lm-commons/.stow-local-ignore` — Stow exclusion rules.

### Dependent Files
- None yet; later tasks add content under `ai-commons/` and `home-lab/`.

### Related ADRs
- [ADR-001: Single monorepo with domain top-level directories](adrs/adr-001.md)
- [ADR-005: Adopt GNU Stow as the artifact distribution mechanism](adrs/adr-005.md)

## Deliverables
- `~/lm-commons` initialized as a git repository.
- Scaffold files `README.md`, `.gitignore`, `.stow-local-ignore` present and committed.
- Verification checklist below — all items MUST pass **(REQUIRED)**.
- No automated unit tests (file-creation procedure); the verification checklist substitutes **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — file scaffolding only.
- Integration tests:
  - [ ] `test -d ~/lm-commons/.git` succeeds.
  - [ ] `git -C ~/lm-commons log --oneline` shows exactly one commit.
  - [ ] `test -f ~/lm-commons/README.md && test -f ~/lm-commons/.gitignore && test -f ~/lm-commons/.stow-local-ignore` all succeed.
  - [ ] `git -C ~/lm-commons remote -v` returns no remote.
  - [ ] `.gitignore` content includes the patterns for `.vault_pass` and generated tool configs.
- Test coverage target: >=80% (procedural; verification checklist 100% required).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required for this procedural task).
- The repository scaffold exists at `~/lm-commons`, initialized with one commit and the three required files.
