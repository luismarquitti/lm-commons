---
status: pending
title: Write the full `lm-commons` README
type: docs
complexity: low
dependencies:
  - task_13
---

# Task 15: Write the full `lm-commons` README

## Overview
Replace the minimal scaffold `README.md` from task 02 with a complete guide describing the repository's layout, the SSOT model, how GNU Stow distributes artefacts, how secrets resolve through Bitwarden, and how to bootstrap a fresh machine. This is the PRD Phase 2 documentation deliverable; the README is the single onboarding entry point for the developer and any AI agent that needs to operate the repository.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The README MUST document the repository layout (`ai-commons/`, `home-lab/`, scaffold files) with a one-paragraph purpose for each top-level directory.
- The README MUST describe the SSOT model and how `ai-commons/` is the single source.
- The README MUST describe the Stow distribution model and link to `ai-commons/stow-packages/README.md`.
- The README MUST describe the secrets resolution flow: Bitwarden → `secrets.sh` → `ansible-vault-pass.sh` and `sync-mcp.py`.
- The README MUST provide a "bootstrap a fresh machine" procedure that names the scripts to run.
- The README MUST note the archived URL of the legacy `luismarquitti/home-lab` repository.
- The README MUST NOT contain any plaintext secret or placeholder value resembling one.
- The README MUST pass markdown linting (`markdownlint` or equivalent) with project defaults.
</requirements>

## Subtasks
- [ ] 15.1 Draft the "Layout" section with one-paragraph blurbs per top-level directory.
- [ ] 15.2 Draft the "SSOT and Distribution" section explaining Stow.
- [ ] 15.3 Draft the "Secrets" section explaining Bitwarden + `secrets.sh` + Ansible Vault layering.
- [ ] 15.4 Draft the "Bootstrap a fresh machine" section as an ordered procedure.
- [ ] 15.5 Add the archived `home-lab` remote URL and run a markdown linter.

## Implementation Details
This task only edits `~/lm-commons/README.md`. Wherever possible, link out to existing artefacts (this PRD, this TechSpec, `ai-commons/stow-packages/README.md`) instead of duplicating content. See PRD "Phased Rollout Plan > Phase 2".

### Relevant Files
- `~/lm-commons/README.md` — fully rewritten.
- `~/lm-commons/ai-commons/stow-packages/README.md` — linked.
- This `_prd.md` and `_techspec.md` — linked.

### Dependent Files
- None.

### Related ADRs
- [ADR-001: Single monorepo with domain top-level directories](adrs/adr-001.md)
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md)
- [ADR-005: Adopt GNU Stow as the artifact distribution mechanism](adrs/adr-005.md)
- [ADR-007: Layered secrets — Bitwarden over a retained Ansible Vault](adrs/adr-007.md)

## Deliverables
- Replaced `README.md` covering the five mandated sections.
- Markdown lint passing.
- Verification checklist below — all MUST pass **(REQUIRED)**.
- Documentation tests substitute for code tests on this task **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] `markdownlint README.md` exits 0.
  - [ ] `grep -c '^## ' README.md` returns at least 5 top-level sections (Layout, SSOT and Distribution, Secrets, Bootstrap, References).
  - [ ] `grep -E 'ctx7sk-|ghp_|AIza' README.md` returns nothing (no embedded secrets or look-alikes).
- Integration tests:
  - [ ] `secrets-audit.sh --ci` still exits 0 with the new README in place.
  - [ ] A reader following the "Bootstrap a fresh machine" procedure against a clean container reaches a `verify-env.sh` exit-0 state without consulting any other document.
- Test coverage target: >=80% (documentation; section-coverage checklist 100% required).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (section-coverage checklist 100% required).
- The README is the single entry point: a new reader or agent can understand and operate the repository from it alone.
