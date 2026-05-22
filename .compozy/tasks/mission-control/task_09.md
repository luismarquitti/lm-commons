---
status: pending
title: Remove Legacy Streamlit Mission Control
type: chore
complexity: low
dependencies: []
---

# Task 09: Remove Legacy Streamlit Mission Control

## Overview
Decommission the existing Streamlit-based "Mission Control" app running on `lm-claw` and clean up all references to it in the OpenClaw agent workspace. This prevents agent confusion between the old Streamlit portal (port 8501) and the new React portal (port 3001) and ensures `TOOLS.md` reflects the correct service URL going forward.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The Streamlit process on `lm-claw` MUST be stopped and prevented from restarting (kill the process and ensure no cron or systemd unit re-launches it).
- The `~/.openclaw/mission-control/` directory on `lm-claw` MUST be removed (contains `app.py`, `log_task.py`, `update_task.py`, `mission_control.db`).
- `~/.openclaw/workspace/docs/mission-control-setup.md` MUST be removed from the agent workspace (the Streamlit setup guide is obsolete).
- `~/.openclaw/workspace/TOOLS.md` MUST be updated: remove the `NocoDB (Mission Control)` entry on port 8501 and add a `Mission Control (React Portal)` entry with URL `http://lm-claw:3001` and a note that agents POST to `/api/pages` to publish pages.
- After cleanup, port 8501 on `lm-claw` MUST be confirmed free (no listener).
- All changes to workspace files MUST be committed to `lm-commons` via the normal git workflow.
</requirements>

## Subtasks
- [ ] 9.1 On `lm-claw`, identify and stop the Streamlit process (check `pgrep streamlit` and any cron entries).
- [ ] 9.2 Remove `~/.openclaw/mission-control/` recursively on `lm-claw`.
- [ ] 9.3 Remove `~/.openclaw/workspace/docs/mission-control-setup.md` from the agent workspace.
- [ ] 9.4 Update `~/.openclaw/workspace/TOOLS.md` with the new Mission Control entry and remove the old one.
- [ ] 9.5 Verify port 8501 is free on `lm-claw` (`ss -tlnp | grep 8501` returns nothing).
- [ ] 9.6 Commit all workspace file changes to `lm-commons`.

## Implementation Details
The existing setup doc (`docs/mission-control-setup.md`) shows the Streamlit app is launched via `nohup` — there may not be a systemd unit for it. Check both `systemctl list-units | grep mission` and the user's crontab (`crontab -l`) on `lm-claw` to be thorough.

The updated `TOOLS.md` entry for Mission Control should follow the same format as other service entries in that file. Example:

```
### Mission Control (React Portal)
- **Acessível via**: `http://lm-claw:3001`
- **API para agentes**: `POST http://lm-claw:3001/api/pages` (ver TechSpec para payload)
- **Porta**: 3001 (configurável via `PORT` env var)
```

### Relevant Files
- `~/.openclaw/mission-control/` (on lm-claw) — legacy Streamlit app directory, to be removed
- `~/.openclaw/workspace/docs/mission-control-setup.md` — Streamlit setup guide, to be removed
- `~/.openclaw/workspace/TOOLS.md` — agent service registry, to be updated
- `lm-commons/.compozy/tasks/mission-control/` — task context lives here

### Dependent Files
- `task_10.md` — systemd deployment depends on this task completing so the workspace is clean before the new service goes live

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — the new React portal replaces the Streamlit app

## Deliverables
- `~/.openclaw/mission-control/` removed from `lm-claw`.
- `docs/mission-control-setup.md` removed from the agent workspace.
- `TOOLS.md` updated with the new Mission Control entry.
- Verification checklist below passing **(REQUIRED)**
- No automated unit tests (operational cleanup); verification checklist substitutes **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Not applicable — this task is operational cleanup on `lm-claw`, not code.
- Integration tests:
  - [ ] `pgrep streamlit` on `lm-claw` returns no results.
  - [ ] `ss -tlnp | grep 8501` on `lm-claw` returns no results.
  - [ ] `ls ~/.openclaw/mission-control/` on `lm-claw` returns "No such file or directory".
  - [ ] `~/.openclaw/workspace/TOOLS.md` contains `lm-claw:3001` and does not contain `8501`.
  - [ ] `~/.openclaw/workspace/docs/mission-control-setup.md` does not exist.
- Test coverage target: >=80% (verification checklist 100% required for this operational task).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required).
- Port 8501 is free on `lm-claw`.
- `TOOLS.md` references only the new React portal at port 3001.
- Agent workspace contains no references to the Streamlit app.
