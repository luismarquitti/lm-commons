---
status: pending
title: "docs(workflow): create centralized playbook and repository pointer"
type: docs
complexity: low
dependencies:
  - task_01
---

# Task 02: docs(workflow): create centralized playbook and repository pointer

## Overview
Establish the Single Source of Truth (SSOT) for the agentic development workflow by creating a centralized `PLAYBOOK.md` defining all development lifecycle phases, conventions, and Definition of Done. Additionally, create `AGENTS.md` at the repository root to point new developer/reviewer agents directly to this playbook.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A comprehensive playbook MUST be created at `ai-commons/instructions/workflows/PLAYBOOK.md` in English.
- The playbook MUST document all phases: Spec Pipeline, Linear Task Registry, Isolated Workspaces, PR Development Loop, Agent Review Gate, and Human Merge Gate.
- The playbook MUST define conventions: sibling git worktrees naming (`../worktrees/<repo>-<id>-<slug>`), Conventional Commits, PR-to-issue linking (e.g. "Fixes CLE-123"), and the Definition of Done (DoD).
- An `AGENTS.md` file MUST be created at the root of `lm-commons/` containing instructions for any onboarding agent to read the playbook.
</requirements>

## Subtasks
- [ ] 02.1 Create `ai-commons/instructions/workflows/PLAYBOOK.md` with all workflow phases and DoD.
- [ ] 02.2 Create `AGENTS.md` in the root of `lm-commons/` pointing to the playbook.
- [ ] 02.3 Reference the new worktree convention and sync tools in the playbook.

## Implementation Details
Write detailed, precise markdown instructions that are easily parseable and understandable by LLM agents.

### Relevant Files
- `ai-commons/instructions/workflows/PLAYBOOK.md` [NEW] — Centralized playbook.
- `AGENTS.md` [NEW] — Agent onboarding entry point.

### Dependent Files
- None.

### Related ADRs
- [ADR-001: Phased rollout with a human-in-the-loop MVP](adrs/adr-001.md)
- [ADR-007: Centralized Workflow Playbook in AI Commons](adrs/adr-007.md)

## Deliverables
- Centralized `PLAYBOOK.md` in English.
- Root `AGENTS.md` in English.

## Tests
- Unit tests:
  - [ ] None.
- Integration tests:
  - [ ] Verify that an agent reading `AGENTS.md` can follow the link to `PLAYBOOK.md` and successfully extract the DoD.

## Success Criteria
- Playbook and pointer files exist and are written in clear English.
- Markdown links between files are valid.
