---
status: pending
title: "feat(linear): extend linear skill instructions in ai-commons"
type: docs
complexity: low
dependencies:
  - task_01
  - task_03
---

# Task 05: feat(linear): extend linear skill instructions in ai-commons

## Overview
Extend the `linear` skill documentation under `ai-commons/skills/linear/SKILL.md` in English. The updated skill will guide agents on how to run and verify task synchronization using the new `sync-compozy-tasks.py` script, and enforce the English language policy for all issue titles and bodies.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The `linear` skill at `ai-commons/skills/linear/SKILL.md` MUST be updated in English.
- The skill MUST document the usage of `sync-compozy-tasks.py` (parameters, target folders, credentials).
- The skill MUST enforce the English language policy for all issues, descriptions, comments, and titles.
- The skill MUST outline Conventional Commits title requirements.
- The updated skill MUST be applied and distributed via GNU Stow packages.
</requirements>

## Subtasks
- [ ] 05.1 Document the task sync tool interface in `ai-commons/skills/linear/SKILL.md`.
- [ ] 05.2 Update the language policy section to define English as the single official language.
- [ ] 05.3 Re-run Stow to update active symlinks.

## Implementation Details
Format the markdown instructions in clean English, using semantic tags and agent triggers.

### Relevant Files
- `ai-commons/skills/linear/SKILL.md` — Target skill to modify.

### Dependent Files
- `~/.agents/skills/linear/SKILL.md` — Active symlink in home.

### Related ADRs
- [ADR-005: Extended Linear Skill for Task Synchronization](adrs/adr-005.md)

## Deliverables
- Updated `ai-commons/skills/linear/SKILL.md` in English.
- Re-applied Stow symlinks.

## Tests
- Unit tests:
  - [ ] None.
- Integration tests:
  - [ ] Verify that `verify-env.sh` runs and passes after updating the skill.
  - [ ] Verify that the symlink `~/.agents/skills/linear/SKILL.md` correctly resolves to the new content.

## Success Criteria
- Skill documentation is clear, accurate, and completely in English.
- Symlinks are healthy.
