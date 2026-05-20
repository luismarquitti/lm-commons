---
status: pending
title: Build Stow packages for `claude`, `agents`, `gemini`
type: infra
complexity: medium
dependencies:
  - task_03
---

# Task 09: Build Stow packages for `claude`, `agents`, `gemini`

## Overview
Replace the empty `stow-packages/base-agent/` scaffold with three real GNU Stow packages — one per tool target — under `ai-commons/stow-packages/`. Each package mirrors the `$HOME`-relative target path (e.g. `.claude/skills`) and contains relative symlinks pointing back to the canonical SSOT content in `ai-commons/`. Stow consumes these packages in task 10's `bootstrap.sh` to produce the live symlinks in `~/.claude`, `~/.agents`, `~/.gemini`.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- Three packages MUST exist: `ai-commons/stow-packages/claude/`, `ai-commons/stow-packages/agents/`, `ai-commons/stow-packages/gemini/`.
- Each package's internal layout MUST mirror the `$HOME`-relative target path (e.g. `claude/.claude/skills` → `../../skills`).
- Symlinks inside packages MUST use repository-relative paths so the repo remains portable.
- The current empty `stow-packages/base-agent/` scaffold MUST be removed.
- `stow --simulate -d ai-commons/stow-packages -t <tmp-home> claude agents gemini` MUST succeed with no conflicts.
- The set of symlinks Stow would create MUST match the current manual symlink set at minimum (`~/.claude/skills`, `~/.agents/skills`, `~/.gemini/skills`).
</requirements>

## Subtasks
- [ ] 09.1 Decide each package's symlink set (start with `skills`; extend per tool only when needed).
- [ ] 09.2 Create the `claude`, `agents`, `gemini` package directories with their target-path mirrors and relative symlinks into `ai-commons/`.
- [ ] 09.3 Remove the empty `base-agent/` scaffold.
- [ ] 09.4 Verify with `stow --simulate` against a temporary `$HOME` that the packages produce the expected symlinks without conflicts.
- [ ] 09.5 Document the package layout briefly inside `ai-commons/stow-packages/README.md`.

## Implementation Details
GNU Stow operates from the stow directory (`ai-commons/stow-packages/`) and creates symlinks in the target (`$HOME`) that mirror the package's internal structure. Apply YAGNI: ship only `skills` per package initially; broaden when a specific tool-local config is identified as belonging to the SSOT.

### Relevant Files
- (new) `~/lm-commons/ai-commons/stow-packages/claude/.claude/skills` (relative symlink → `../../../skills`)
- (new) `~/lm-commons/ai-commons/stow-packages/agents/.agents/skills` (relative symlink → `../../../skills`)
- (new) `~/lm-commons/ai-commons/stow-packages/gemini/.gemini/skills` (relative symlink → `../../../skills`)
- (new) `~/lm-commons/ai-commons/stow-packages/README.md`

### Dependent Files
- `bootstrap.sh` (task 10) — runs Stow against these packages.
- The cut-over in task 11 removes prior manual symlinks before applying Stow.

### Related ADRs
- [ADR-005: Adopt GNU Stow as the artifact distribution mechanism](adrs/adr-005.md)

## Deliverables
- Three populated Stow packages.
- Removed `base-agent/` scaffold.
- Package documentation file.
- Unit-level checks on package structure **(REQUIRED)**.
- Integration test running `stow --simulate` against a temporary `$HOME` **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Each package contains exactly the expected internal directory structure (assertion on path).
  - [ ] Every symlink inside each package is relative (no absolute paths).
  - [ ] Resolving any package symlink lands inside `ai-commons/`.
- Integration tests:
  - [ ] `stow --simulate -v -d ai-commons/stow-packages -t $tmp_home claude agents gemini` exits 0 and reports no conflicts.
  - [ ] After a real `stow` against a clean temporary `$HOME`, `$tmp_home/.claude/skills`, `$tmp_home/.agents/skills`, and `$tmp_home/.gemini/skills` all resolve into `ai-commons/skills`.
- Test coverage target: >=80% (structure assertions and stow-simulate substitute).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- Three packages exist and produce the expected symlinks via Stow without conflict.
