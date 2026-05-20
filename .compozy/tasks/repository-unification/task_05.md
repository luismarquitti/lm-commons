---
status: pending
title: Author `secrets.sh` Bitwarden retrieval interface
type: infra
complexity: low
dependencies:
  - task_03
---

# Task 05: Author `secrets.sh` Bitwarden retrieval interface

## Overview
Implement `ai-commons/scripts/secrets.sh` as the single retrieval interface for every secret consumed by `lm-commons`. It wraps the free Bitwarden CLI (`bw`) and exposes a `secrets_get` function that returns a secret value on stdout, failing loudly when the vault is locked or the item is missing. Every downstream consumer (Ansible vault password, MCP config generation) calls this interface.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The script MUST expose a `secrets_get <item-name> [field]` function whose contract matches TechSpec "Core Interfaces".
- On success, the script MUST print the resolved secret to stdout and exit 0.
- The script MUST exit non-zero with a clear stderr message if the vault is locked.
- The script MUST exit non-zero with a clear stderr message if the requested item or field is missing.
- The script MUST resolve its own location and act independently of the current working directory.
- The script MUST NOT log or echo the resolved secret to stderr or any file.
</requirements>

## Subtasks
- [ ] 05.1 Implement `secrets_get` wrapping `bw get`.
- [ ] 05.2 Handle the locked-vault and missing-item failure modes with clear stderr messages.
- [ ] 05.3 Make the script source-able (no top-level side effects when sourced) and executable as a CLI.
- [ ] 05.4 Ensure path-independence (resolve via the script's own location).
- [ ] 05.5 Author bats tests under `ai-commons/scripts/tests/`.

## Implementation Details
The script lives at `~/lm-commons/ai-commons/scripts/secrets.sh`. The interface contract is specified in TechSpec "Core Interfaces". Tests use a stub `bw` placed at the front of `PATH` to simulate happy path, missing item, and locked vault without contacting a real Bitwarden account.

### Relevant Files
- (new) `~/lm-commons/ai-commons/scripts/secrets.sh`
- (new) `~/lm-commons/ai-commons/scripts/tests/secrets.bats`

### Dependent Files
- `ai-commons/scripts/ansible-vault-pass.sh` (task 07) — calls `secrets_get`.
- `ai-commons/scripts/sync-mcp.py` (task 08) — invokes the script for secret resolution.

### Related ADRs
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md)
- [ADR-007: Layered secrets — Bitwarden over a retained Ansible Vault](adrs/adr-007.md)

## Deliverables
- `secrets.sh` script implementing the documented contract.
- Bats test suite with the cases listed below.
- Unit tests with 80%+ branch coverage **(REQUIRED)**.
- Integration test exercising the contract end-to-end through a stub `bw` **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] `secrets_get` with a stub `bw` returning a known password prints exactly that password on stdout.
  - [ ] `secrets_get` for a missing item exits non-zero with stderr matching "item not found".
  - [ ] `secrets_get` when the stub `bw` reports the vault locked exits non-zero with stderr matching "vault locked".
  - [ ] `secrets_get` accepts a second `field` argument and routes it to `bw get <field> <item>`.
  - [ ] The script invoked from `/tmp` resolves its path correctly and behaves identically.
  - [ ] Sourcing the script does not print anything to stdout or stderr.
- Integration tests:
  - [ ] End-to-end: with the stub `bw` configured for two items, `secrets_get` returns each independently.
- Test coverage target: >=80% (branch coverage via `kcov` or equivalent).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `secrets.sh` is the single, documented retrieval interface used by tasks 07 and 08.
