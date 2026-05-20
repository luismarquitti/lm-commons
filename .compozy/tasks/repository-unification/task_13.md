---
status: pending
title: Push `lm-commons` to a new private GitHub repository
type: infra
complexity: low
dependencies:
  - task_12
---

# Task 13: Push `lm-commons` to a new private GitHub repository

## Overview
Create the new `lm-commons` repository on GitHub as private, configure it as the `origin` remote of the local `~/lm-commons` repository, and push every branch and tag. This is the first time the consolidated content reaches an external service; it happens only after the secrets audit in task 12 returns clean.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The new GitHub repository MUST be named `lm-commons` and MUST be created as **private**.
- The local `~/lm-commons` MUST have `origin` configured to point at the new repository over SSH (or HTTPS) and MUST track `main`.
- All branches and tags MUST be pushed (`git push --all` and `git push --tags`).
- The push MUST be performed by the developer's authenticated `gh` or `git` client — no token is hard-coded.
- After the push, `git -C ~/lm-commons status` MUST report `branch is up to date with 'origin/main'`.
- This task MUST NOT run if `secrets-audit.sh` returns non-zero.
</requirements>

## Subtasks
- [ ] 13.1 Re-run `secrets-audit.sh --ci` and confirm exit 0 as a precondition.
- [ ] 13.2 Create the GitHub repository: `gh repo create lm-commons --private --source ~/lm-commons --push=false`.
- [ ] 13.3 Configure the `origin` remote and the upstream for `main`.
- [ ] 13.4 `git push --all origin && git push --tags origin`.
- [ ] 13.5 Verify the push: working tree clean, `main` tracking `origin/main`, branch list matches between local and remote.

## Implementation Details
The `gh` CLI is preferred for repository creation because it sets visibility, default branch, and the remote in one step. SSH is the preferred protocol if the developer has SSH keys registered with GitHub. See TechSpec "Integration Points > GitHub".

### Relevant Files
- `~/lm-commons/` — pushed.
- No file edits other than `.git/config` updated by `gh`/`git remote add`.

### Dependent Files
- Task 14 (decommission) depends on the verified push.

### Related ADRs
- [ADR-001: Single monorepo with domain top-level directories](adrs/adr-001.md)

## Deliverables
- New private GitHub repository `lm-commons` containing the pushed content.
- `origin` remote configured and `main` tracking upstream.
- Push verification checks below — all MUST pass **(REQUIRED)**.
- No automated unit tests (one-shot push); integration verification substitutes **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — single git/gh interaction.
- Integration tests:
  - [ ] `gh repo view <owner>/lm-commons --json visibility` returns `"PRIVATE"`.
  - [ ] `git -C ~/lm-commons remote get-url origin` resolves to the new repository.
  - [ ] `git -C ~/lm-commons rev-parse --abbrev-ref --symbolic-full-name @{u}` returns `origin/main`.
  - [ ] `git -C ~/lm-commons status -uno` reports `Your branch is up to date with 'origin/main'`.
  - [ ] `git ls-remote --heads origin` lists every local branch.
- Test coverage target: >=80% (verification checklist 100% required for one-shot push).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required).
- Private `lm-commons` repository on GitHub contains the consolidated content and tracks the local `main`.
