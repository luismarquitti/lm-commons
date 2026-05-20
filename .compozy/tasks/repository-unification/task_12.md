---
status: pending
title: Repo-wide secrets audit
type: infra
complexity: low
dependencies:
  - task_06
  - task_07
  - task_08
  - task_11
---

# Task 12: Repo-wide secrets audit

## Overview
Final gate before the first push. Scan the entire `lm-commons` working tree (and the git index) for any pattern that could be a live secret — Context7 tokens, GitHub PATs, Gemini API keys, Ansible Vault password content, generic high-entropy strings. The push in task 13 happens only after this audit returns zero findings against an allowlist of known placeholders.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The audit MUST scan every tracked file in `lm-commons` (working tree and git index) for known secret prefixes: `ctx7sk-`, `gh[pousr]_[A-Za-z0-9]+`, `AIza[0-9A-Za-z_-]+`, `$ANSIBLE_VAULT;1.1`-without-a-corresponding-encrypted-file marker, and the literal sentinel `BEGIN PRIVATE KEY`.
- The audit MUST allow listed placeholders: `{{CONTEXT7_API_KEY}}` and any other documented sentinel introduced in task 06.
- The audit MUST also re-run `verify-env.sh` (which performs its own plaintext-secret scan).
- The audit MUST exit non-zero if any unallowlisted match is found, printing each hit's file path and line.
- A successful audit MUST be reproducible — implemented as an executable script so it can be re-run on demand.
- The audit MUST NOT contact any external service.
</requirements>

## Subtasks
- [ ] 12.1 Author `ai-commons/scripts/secrets-audit.sh` implementing the scan and allowlist.
- [ ] 12.2 Run the audit against the working tree and the git index (`git ls-files`).
- [ ] 12.3 Run `verify-env.sh` to corroborate.
- [ ] 12.4 If any hit appears, fix it (move the value to Bitwarden; replace with a placeholder) and re-run.
- [ ] 12.5 Commit the audit script.

## Implementation Details
The audit is intentionally conservative — false positives are preferable to false negatives. Allowlisted placeholders are matched literally. The script accepts a `--ci` flag for non-interactive use with a machine-readable exit code. See TechSpec "Testing Approach > Integration Tests > Secret scan".

### Relevant Files
- (new) `~/lm-commons/ai-commons/scripts/secrets-audit.sh`
- All tracked files in `~/lm-commons` (input).

### Dependent Files
- `verify-env.sh` (task 10) — invoked.
- Task 13 (push) is gated on this task.

### Related ADRs
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md)
- [ADR-007: Layered secrets — Bitwarden over a retained Ansible Vault](adrs/adr-007.md)

## Deliverables
- `secrets-audit.sh` script.
- An audit run against the current `lm-commons` returning zero unallowlisted hits.
- Bats test suite for the audit script.
- Unit tests with 80%+ coverage on the audit script **(REQUIRED)**.
- Integration test against the real `lm-commons` working tree returning zero hits **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] The audit exits non-zero with a clear message when a temporary file contains a Context7 token (`ctx7sk-xyz`).
  - [ ] The audit exits non-zero when a GitHub PAT pattern (`ghp_AAAA...`) is present.
  - [ ] The audit exits non-zero when a Gemini API key pattern (`AIzaA...`) is present.
  - [ ] The audit exits 0 when only the allowlisted placeholder `{{CONTEXT7_API_KEY}}` is present.
  - [ ] The audit returns the same result whether run from `lm-commons` or from `/tmp` (path-independence).
- Integration tests:
  - [ ] `secrets-audit.sh --ci` against the actual `lm-commons` working tree exits 0.
  - [ ] `verify-env.sh` exits 0.
- Test coverage target: >=80%.
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- Audit run against `lm-commons` returns zero unallowlisted hits; `verify-env.sh` confirms.
