---
status: pending
title: Onboard secrets to Bitwarden and replace plaintext key with placeholder
type: chore
complexity: low
dependencies:
  - task_05
---

# Task 06: Onboard secrets to Bitwarden and replace plaintext key with placeholder

## Overview
Populate the developer's Bitwarden vault with the items every downstream consumer requires (the Ansible Vault password and the loose API keys), and replace the plaintext Context7 API key in `ai-commons/config/mcp/master_config.json` with a placeholder. After this task, no live secret exists inside the repository.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A Bitwarden vault item MUST exist for the Ansible Vault password (item name `ansible-vault`, password field).
- Bitwarden vault items MUST exist for each loose API key in active use: `context7-api-key`, `github-token`, `gemini-api-key`.
- The Context7 API key in `ai-commons/config/mcp/master_config.json` MUST be replaced with the placeholder string `{{CONTEXT7_API_KEY}}` (or equivalent token chosen for task 08).
- The original Context7 API key SHOULD be rotated in the Context7 dashboard after onboarding (recorded in the PRD as a recommended action).
- Generated tool config files (the real, resolved versions on disk) MUST be added to `.gitignore` so they are never tracked.
- The repository MUST NOT contain any other plaintext API key after this task.
</requirements>

## Subtasks
- [ ] 06.1 Create the four Bitwarden vault items listed in requirements.
- [ ] 06.2 Verify each item with `secrets_get` (from task 05).
- [ ] 06.3 Replace the plaintext Context7 key in `ai-commons/config/mcp/master_config.json` with the placeholder token.
- [ ] 06.4 Extend `.gitignore` to exclude generated tool configs (e.g. `~/.claude.json`, `~/.gemini/settings.json` paths if mirrored under the repo).
- [ ] 06.5 Commit the placeholder change and `.gitignore` extension in `lm-commons`.

## Implementation Details
This task is largely manual data entry in the Bitwarden client (desktop or CLI), plus one edit in the repository and a `.gitignore` extension. Rotating the previously-leaked Context7 key is recommended but tracked outside this task. See PRD "Open Questions" verification finding.

### Relevant Files
- `~/lm-commons/ai-commons/config/mcp/master_config.json` — plaintext Context7 key replaced by a placeholder.
- `~/lm-commons/.gitignore` — extended.

### Dependent Files
- Tasks 07 and 08 read these vault items via `secrets.sh`.

### Related ADRs
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md)
- [ADR-007: Layered secrets — Bitwarden over a retained Ansible Vault](adrs/adr-007.md)

## Deliverables
- Four vault items populated in Bitwarden.
- Placeholder token in `master_config.json` replacing the previous plaintext key.
- Extended `.gitignore`.
- Commit recording the changes.
- Verification checklist below — all MUST pass **(REQUIRED)**.
- No automated unit tests (manual onboarding); verification by `secrets_get` round-trips and content checks **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — manual data entry and one repository edit.
- Integration tests:
  - [ ] `secrets_get ansible-vault password` returns a non-empty string.
  - [ ] `secrets_get context7-api-key`, `secrets_get github-token`, `secrets_get gemini-api-key` each return a non-empty string.
  - [ ] `grep -rE 'ctx7sk-[A-Za-z0-9-]+' ~/lm-commons/ai-commons/config` returns nothing (no live Context7 key remains).
  - [ ] `git -C ~/lm-commons show HEAD -- ai-commons/config/mcp/master_config.json` includes the placeholder token.
  - [ ] `.gitignore` contains the rules for generated tool configs.
- Test coverage target: >=80% (verification checklist 100% required for manual task).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required for this manual task).
- Bitwarden holds every secret needed by tasks 07 and 08.
- No live API key remains in the repository.
