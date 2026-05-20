---
status: pending
title: Author `bootstrap.sh` and `verify-env.sh`
type: infra
complexity: medium
dependencies:
  - task_08
  - task_09
---

# Task 10: Author `bootstrap.sh` and `verify-env.sh`

## Overview
Implement the two scripts that operate the environment from the unified repository. `bootstrap.sh` is the idempotent installer — it installs GNU Stow if missing, applies the Stow packages from task 09, regenerates the tool configs via the refactored `sync-mcp.py`, and runs `verify-env.sh`. `verify-env.sh` is the standalone health check — it reports broken symlinks, missing configs, and plaintext secrets.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `bootstrap.sh` MUST be idempotent: running it twice against the same environment produces no extra changes.
- `bootstrap.sh` MUST install GNU Stow when absent (apt/dnf/pacman/Homebrew detection).
- `bootstrap.sh` MUST run `stow --no-folding` (or equivalent) for each package after a successful `stow --simulate`.
- `bootstrap.sh` MUST invoke `sync-mcp.py` after stowing so tool configs are populated with resolved secrets.
- `bootstrap.sh` MUST support a `--check` flag that performs verification only and makes no changes.
- `verify-env.sh` MUST exit non-zero, printing every failure, when any expected symlink is broken, any expected config is missing, or any plaintext secret pattern is detected in the repository.
- Both scripts MUST resolve their paths relative to their own location.
</requirements>

## Subtasks
- [ ] 10.1 Implement Stow installation detection and idempotent install in `bootstrap.sh`.
- [ ] 10.2 Implement the stow-simulate-then-stow flow for each package.
- [ ] 10.3 Wire `bootstrap.sh` to invoke `sync-mcp.py` after stowing.
- [ ] 10.4 Implement `verify-env.sh`: symlink resolution check, config presence check, plaintext-secret scan.
- [ ] 10.5 Add `--check` to `bootstrap.sh` (delegates to `verify-env.sh`).
- [ ] 10.6 Author bats tests for both scripts under `ai-commons/scripts/tests/`.

## Implementation Details
Both scripts live at `~/lm-commons/ai-commons/scripts/`. They consume the packages from task 09 and the refactored `sync-mcp.py` from task 08. See TechSpec "Core Interfaces" for the contracts. The plaintext-secret scan uses simple regexes (Context7 token `ctx7sk-`, GitHub `gh[pousr]_`, Gemini `AIza`) and is intentionally conservative.

### Relevant Files
- (new) `~/lm-commons/ai-commons/scripts/bootstrap.sh`
- (new) `~/lm-commons/ai-commons/scripts/verify-env.sh`
- (new) `~/lm-commons/ai-commons/scripts/tests/bootstrap.bats`
- (new) `~/lm-commons/ai-commons/scripts/tests/verify-env.bats`

### Dependent Files
- `ai-commons/scripts/secrets.sh` (task 05) — indirectly via `sync-mcp.py`.
- `ai-commons/scripts/sync-mcp.py` (task 08) — invoked by `bootstrap.sh`.
- `ai-commons/stow-packages/*` (task 09) — applied by `bootstrap.sh`.

### Related ADRs
- [ADR-005: Adopt GNU Stow as the artifact distribution mechanism](adrs/adr-005.md)
- [ADR-008: Re-point all consumers to the new path; no compatibility symlink](adrs/adr-008.md)

## Deliverables
- `bootstrap.sh` and `verify-env.sh` scripts.
- Bats test suites for both.
- Unit tests with 80%+ branch coverage **(REQUIRED)**.
- Integration test running `bootstrap.sh` against a scratch `$HOME` end-to-end **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] `bootstrap.sh` with Stow already installed detects this and skips installation.
  - [ ] `bootstrap.sh --check` makes no changes (snapshot diff before/after is empty).
  - [ ] `verify-env.sh` exits 0 against a healthy environment.
  - [ ] `verify-env.sh` exits non-zero when a deliberately broken symlink exists, listing it in stderr.
  - [ ] `verify-env.sh` exits non-zero when a deliberately planted plaintext Context7 token is present in the repository, listing the file path.
  - [ ] Both scripts run from `/tmp` and resolve their paths correctly.
- Integration tests:
  - [ ] End-to-end: against a scratch `$HOME` with the stub `bw`, `bootstrap.sh` produces `$HOME/.claude/skills`, `$HOME/.agents/skills`, `$HOME/.gemini/skills` (resolving into `ai-commons/skills`) and `$HOME/.claude.json` with `mcpServers.context7` carrying the stubbed key.
  - [ ] Running `bootstrap.sh` twice in a row leaves the environment unchanged on the second run.
- Test coverage target: >=80% (branch coverage via `kcov` or equivalent).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `bootstrap.sh` installs and applies Stow, populates tool configs, and is idempotent.
- `verify-env.sh` reliably detects broken symlinks, missing configs, and plaintext secrets.
