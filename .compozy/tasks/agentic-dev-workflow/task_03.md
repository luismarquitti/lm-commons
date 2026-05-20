---
status: pending
title: "feat(linear): implement sync-compozy-tasks.py script"
type: backend
complexity: high
dependencies: []
---

# Task 03: feat(linear): implement sync-compozy-tasks.py script

## Overview
Implement a Python synchronization script `sync-compozy-tasks.py` that reads local Compozy task files (`task_*.md`) and synchronizes them with the Linear API. The script must idempotently create or update issues in a specified Linear project and team, and write back the generated Linear Issue ID to the task's YAML frontmatter.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The script MUST be written in Python and located at `ai-commons/scripts/sync-compozy-tasks.py`.
- It MUST parse task files `task_NN.md` and `_tasks.md` in a directory to extract metadata (status, title, type, complexity, dependencies).
- It MUST resolve the Linear API key by first checking the `LINEAR_API_KEY` environment variable, then the `.env` file, and finally falling back to `secrets.sh get Linear_API_Key`.
- It MUST interact with the Linear GraphQL API to idempotently create issues (if `linear_issue_id` is missing) or update them (if present).
- It MUST update the local file's YAML frontmatter to include the `linear_issue_id` after successful creation.
- It MUST format the issue description in English, structuring it with local task overview, requirements, and subtasks.
- It MUST handle error states gracefully and avoid file corruption.
</requirements>

## Subtasks
- [ ] 03.1 Create `ai-commons/scripts/sync-compozy-tasks.py` scaffold.
- [ ] 03.2 Implement frontmatter parsing and updating logic in Python.
- [ ] 03.3 Implement Linear GraphQL API client logic for issue creation and updates.
- [ ] 03.4 Implement secret resolution using env/dotenv/secrets.sh.
- [ ] 03.5 Integrate frontmatter writing back to files safely.

## Implementation Details
Use Python standard library where possible or install required modules. Ensure robust parsing of YAML frontmatter without destroying the rest of the markdown document.

### Relevant Files
- `ai-commons/scripts/sync-compozy-tasks.py` [NEW] — Syncer script.

### Dependent Files
- `ai-commons/scripts/secrets.sh` — Used as secrets fallback.

### Related ADRs
- [ADR-005: Extended Linear Skill for Task Synchronization](adrs/adr-005.md)
- [ADR-008: Bi-directional Traceability via YAML Frontmatter](adrs/adr-008.md)

## Deliverables
- Python script `sync-compozy-tasks.py` with execution permissions.
- Local tasks successfully synced to Linear with IDs written back.

## Tests
- Unit tests:
  - [ ] Separated into the next task (Task 04).
- Integration tests:
  - [ ] Verify execution of the script against a test directory, confirming that dummy task files are updated with mock or actual Linear IDs.

## Success Criteria
- Script executes without error.
- Bi-directional linking is established via `linear_issue_id` in frontmatter.
