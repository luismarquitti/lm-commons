---
status: pending
title: Update `sync-mcp.py` to resolve secrets and use repo-relative paths
type: refactor
complexity: low
dependencies:
  - task_05
  - task_06
---

# Task 08: Update `sync-mcp.py` to resolve secrets and use repo-relative paths

## Overview
The current `sync-mcp.py` (47 lines) is hard-coded to `~/.ai-commons` and embeds the plaintext Context7 key by copying `master_config.json` verbatim. Update it so it resolves its paths relative to the script's own location inside the repository, reads the master config that now contains a placeholder, and injects the real Context7 key from Bitwarden via `secrets.sh` only into the generated tool configs (never written back to the master file).

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The script MUST resolve `master_config.json` relative to its own location (no `Path.home() / ".ai-commons"`).
- The script MUST replace the `{{CONTEXT7_API_KEY}}` placeholder in the loaded MCP server definitions with the value returned by `secrets_get context7-api-key` before writing the tool configs.
- The script MUST NOT modify the on-disk master config.
- The script MUST fail loudly if `secrets_get` fails (locked vault, missing item).
- The script MUST preserve every non-`mcpServers` key in each target tool config (e.g. `~/.claude.json` history).
- Targets MUST remain `~/.claude.json` and `~/.gemini/settings.json` (existing behaviour).
</requirements>

## Subtasks
- [ ] 08.1 Refactor path resolution to use `__file__`-relative anchoring.
- [ ] 08.2 Add the placeholder-substitution step using `secrets_get`.
- [ ] 08.3 Ensure the master config on disk is never written back to.
- [ ] 08.4 Add error handling for `secrets_get` failures.
- [ ] 08.5 Author pytest cases covering happy path, locked vault, and target-file preservation.

## Implementation Details
The current implementation lives at `~/.ai-commons/scripts/sync-mcp.py` and is moved by task 03 into `~/lm-commons/ai-commons/scripts/`. The placeholder token must match whatever was inserted in task 06 (`{{CONTEXT7_API_KEY}}` by default). See TechSpec "Core Interfaces" for the secrets contract.

### Relevant Files
- `~/lm-commons/ai-commons/scripts/sync-mcp.py` — refactored in place.
- `~/lm-commons/ai-commons/config/mcp/master_config.json` — read-only input.
- `~/.claude.json`, `~/.gemini/settings.json` — output targets.

### Dependent Files
- `ai-commons/scripts/secrets.sh` (task 05).
- `bootstrap.sh` (task 10) — invokes `sync-mcp.py`.

### Related ADRs
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md)
- [ADR-008: Re-point all consumers to the new path; no compatibility symlink](adrs/adr-008.md)

## Deliverables
- Refactored `sync-mcp.py` that resolves secrets and uses repo-relative paths.
- Pytest tests with 80%+ coverage **(REQUIRED)**.
- Integration test exercising one full run with a stub `secrets.sh` and a tmp target file **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Happy path: with a stub `secrets.sh` returning a known key, the produced target JSON contains that key in `mcpServers.context7.args` (not the placeholder).
  - [ ] The master config on disk is byte-identical before and after the script runs (no write-back).
  - [ ] When the stub `secrets.sh` exits non-zero, the script exits non-zero with a clear message and does not write any target file.
  - [ ] Existing non-`mcpServers` keys in the target file (e.g. an `history` field in `.claude.json`) are preserved.
  - [ ] The script runs from any working directory and still finds the master config.
- Integration tests:
  - [ ] Full run against a tmp `$HOME` produces correctly populated `.claude.json` and `.gemini/settings.json`.
- Test coverage target: >=80%.
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `sync-mcp.py` resolves secrets at run time without ever touching the master config and uses repo-relative paths.
