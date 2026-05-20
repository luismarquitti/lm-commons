---
status: pending
title: Migrate `ai-commons/` content into the monorepo
type: infra
complexity: medium
dependencies:
  - task_02
---

# Task 03: Migrate `ai-commons/` content into the monorepo

## Overview
Move the SSOT content from `~/.ai-commons` into `~/lm-commons/ai-commons/`, preserving the existing top-level structure (`agents/`, `config/`, `instructions/`, `memory-templates/`, `scripts/`, `skills/`, `stow-packages/`). To keep the environment working between this task and the cut-over in task 11, a transient compatibility symlink is created at `~/.ai-commons → ~/lm-commons/ai-commons`; it is removed in task 11.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The seven top-level directories under `~/.ai-commons` MUST be moved verbatim into `~/lm-commons/ai-commons/`.
- File counts and SHA-1 sums under each top-level directory MUST match before and after the move.
- A transient compatibility symlink `~/.ai-commons → ~/lm-commons/ai-commons` MUST be created so existing manual symlinks in `~/.claude`, `~/.agents`, `~/.gemini` continue to resolve.
- The transient symlink MUST be documented as temporary and scheduled for removal in task 11.
- The move and the new path MUST be committed in `lm-commons`.
- The Context7 API key in `master_config.json` MUST NOT be modified by this task (task 06 handles it).
</requirements>

## Subtasks
- [ ] 03.1 Snapshot file counts and SHA-1 sums for each top-level directory of `~/.ai-commons` (baseline).
- [ ] 03.2 Move every top-level directory from `~/.ai-commons` to `~/lm-commons/ai-commons/`.
- [ ] 03.3 Create the transient compatibility symlink `~/.ai-commons → ~/lm-commons/ai-commons`.
- [ ] 03.4 Verify post-move counts and sums match the baseline.
- [ ] 03.5 Commit the migrated content in `lm-commons` with a descriptive Conventional Commits message.

## Implementation Details
The move uses ordinary filesystem operations. ADR-008 forbids a permanent compatibility symlink, but a transient symlink during the build phase is allowed and necessary to satisfy the PRD constraint that the environment stays functional. The symlink is explicitly removed in task 11. See TechSpec "Data Models" for the target layout.

### Relevant Files
- `~/.ai-commons/` (source) and `~/lm-commons/ai-commons/` (destination).
- The existing manual symlinks `~/.claude/skills`, `~/.agents/skills`, `~/.gemini/skills` all point to `~/.ai-commons/skills` and must continue to resolve via the transient symlink.

### Dependent Files
- Existing scripts under `~/.ai-commons/scripts/` (`sync-mcp.py`, `migrate_skills_v2.py`, `cleanup_skills.py`, `test_linear_mcp.js`) move along with the rest; task 08 updates `sync-mcp.py` afterward.

### Related ADRs
- [ADR-001: Single monorepo with domain top-level directories](adrs/adr-001.md)
- [ADR-008: Re-point all consumers to the new path; no compatibility symlink](adrs/adr-008.md) — the transient symlink here is explicitly scheduled for removal in task 11.

## Deliverables
- All `~/.ai-commons` content present under `~/lm-commons/ai-commons/`.
- Transient compatibility symlink at `~/.ai-commons`.
- Commit recording the migrated content.
- Baseline-vs-post snapshot diff showing zero changes.
- Verification checks below — all MUST pass **(REQUIRED)**.
- No traditional unit tests (filesystem migration); verification by integrity check **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] Not applicable — filesystem migration.
- Integration tests:
  - [ ] `find ~/lm-commons/ai-commons -type f | wc -l` matches the pre-move count.
  - [ ] `find ~/lm-commons/ai-commons -type f -exec sha1sum {} +` matches the pre-move SHA-1 snapshot.
  - [ ] `readlink ~/.ai-commons` returns `~/lm-commons/ai-commons` (resolved).
  - [ ] `readlink ~/.claude/skills` still resolves successfully (`stat -L` succeeds).
  - [ ] `git -C ~/lm-commons status` reports a clean working tree after commit.
- Test coverage target: >=80% (integrity check substitutes for code coverage).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (integrity check 100% required).
- All `~/.ai-commons` content lives under `~/lm-commons/ai-commons/` with verified parity.
- Transient compatibility symlink in place and documented for removal in task 11.
