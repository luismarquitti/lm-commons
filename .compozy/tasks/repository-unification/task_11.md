---
status: pending
title: "Cut over: re-point consumers to the new path"
type: infra
complexity: medium
dependencies:
  - task_10
---

# Task 11: Cut over: re-point consumers to the new path

## Overview
Execute the one-shot cut-over from manual symlinks pointing at the transient `~/.ai-commons` compatibility symlink to GNU Stow-managed symlinks pointing directly at `~/lm-commons/ai-commons/`. Remove the old manual symlinks, run `bootstrap.sh`, sweep the workspace for stale references to `.ai-commons`, and remove the transient compatibility symlink. After this task no legacy alias exists and the environment is on the canonical path.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- Every existing manual symlink under `~/.claude`, `~/.agents`, `~/.gemini` that pointed at `~/.ai-commons` MUST be removed before Stow runs.
- `bootstrap.sh` MUST be executed and exit 0.
- A workspace-wide search for the literal string `.ai-commons` MUST be performed; every hit referring to the old absolute path MUST be updated to the new repo-relative path or removed.
- The transient compatibility symlink `~/.ai-commons` (from task 03) MUST be removed after `bootstrap.sh` succeeds.
- `verify-env.sh` MUST pass after the cut-over.
- The `ai-commons-manager` skill MUST be updated to reference `~/lm-commons/ai-commons` (or made path-independent).
</requirements>

## Subtasks
- [ ] 11.1 Remove the prior manual symlinks under `~/.claude`, `~/.agents`, `~/.gemini`.
- [ ] 11.2 Run `bootstrap.sh` and confirm exit 0.
- [ ] 11.3 `grep -RIn '\.ai-commons' ~/lm-commons ~/intellifinance ~/ClinicCare ~/obsidian-vault` — list every hit and fix each one.
- [ ] 11.4 Update the `ai-commons-manager` skill text inside `lm-commons/ai-commons/skills/ai-commons-manager/SKILL.md` to use the new path.
- [ ] 11.5 Remove the transient `~/.ai-commons` symlink and re-run `verify-env.sh`.

## Implementation Details
This is the one moment where the live environment changes. Coordinate it: take a snapshot of the resolved symlinks before, perform the steps in order, verify after. See TechSpec "Development Sequencing" step 11 and ADR-008.

### Relevant Files
- `~/.claude/skills`, `~/.agents/skills`, `~/.gemini/skills` — prior manual symlinks removed.
- `~/.ai-commons` — transient symlink removed.
- `~/lm-commons/ai-commons/skills/ai-commons-manager/SKILL.md` — text updates to use the new path.
- Any workspace file uncovered by the grep — touched on demand.

### Dependent Files
- `bootstrap.sh`, `verify-env.sh` (task 10).
- Stow packages (task 09).

### Related ADRs
- [ADR-005: Adopt GNU Stow as the artifact distribution mechanism](adrs/adr-005.md)
- [ADR-008: Re-point all consumers to the new path; no compatibility symlink](adrs/adr-008.md)

## Deliverables
- Live environment served entirely from `~/lm-commons/ai-commons/` via Stow-managed symlinks.
- Updated workspace references and updated `ai-commons-manager` skill.
- No `~/.ai-commons` path on disk.
- Verification checks below — all MUST pass **(REQUIRED)**.
- Integration test re-running the cut-over against a scratch `$HOME` proving idempotence **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — task is an environment-state transition.
- Integration tests:
  - [ ] After the cut-over, `readlink ~/.claude/skills` resolves into `~/lm-commons/ai-commons/skills` (not `~/.ai-commons`).
  - [ ] `test -e ~/.ai-commons` returns false (path removed).
  - [ ] `grep -RIn '\.ai-commons' ~/lm-commons` returns at most expected occurrences (e.g. inside this PRD/TechSpec text); no live references in code or configs.
  - [ ] `verify-env.sh` exits 0.
  - [ ] Re-running `bootstrap.sh` after the cut-over is a no-op (idempotence).
- Test coverage target: >=80% (verification checklist 100% required for cut-over task).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required).
- One canonical path; no legacy alias; environment functional via Stow.
