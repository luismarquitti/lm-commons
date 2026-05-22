---
status: pending
title: AgentStatus Dashboard
type: backend
complexity: medium
dependencies:
  - task_03
  - task_04
---

# Task 06: AgentStatus Dashboard

## Overview
Implement the `GET /api/agents` server route (returning a hardcoded stub payload) and the `AgentStatus` React dashboard component that polls it every 30 seconds. This task also introduces the reusable `usePolling` hook. The dashboard gives Luis a live view of which OpenClaw agents are active, idle, or in error state.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `server/routes/agents.ts` MUST implement `GET /api/agents` returning a stub `AgentStatusResponse` (see TechSpec "Data Models — AgentStatus payload").
- The stub MUST include at least the three configured agents (Bandit, Chief, Nest) with plausible hardcoded values — this is Phase 1; live agent data is out of scope.
- The route MUST be mounted at `/api/agents` in `server/index.ts`.
- `src/hooks/usePolling.ts` MUST accept `(url: string, intervalMs: number)` and return `{ data, error, loading }` — polling starts on mount and clears the interval on unmount.
- `src/components/dashboards/AgentStatus.tsx` MUST use `usePolling('/api/agents', 30_000)` and render a status indicator for each agent showing name, status badge, `lastSeen`, and `currentTask`.
- The status badge MUST visually distinguish `active`, `idle`, and `error` states (CSS classes, not inline styles).
- While loading or on error, the component MUST render a clear user-facing state (spinner or error message), not a blank panel.
</requirements>

## Subtasks
- [ ] 6.1 Create `server/routes/agents.ts` with `GET /api/agents` returning the three-agent stub.
- [ ] 6.2 Mount the agents router in `server/index.ts`.
- [ ] 6.3 Create `src/hooks/usePolling.ts` with interval management and cleanup on unmount.
- [ ] 6.4 Create `src/components/dashboards/AgentStatus.tsx` consuming `usePolling` and rendering per-agent rows.
- [ ] 6.5 Write unit tests for `usePolling` (mock timers) and `AgentStatus` (mock fetch).

## Implementation Details
See TechSpec "Development Sequencing — Step 6", "Data Models — AgentStatus payload", and "Key Decisions — Polling over SSE/WebSockets". The 30-second interval is intentional and should not be changed without a TechSpec update.

`usePolling` should use `setInterval` with `clearInterval` in the effect cleanup. Polling should also fire immediately on mount (no initial 30-second wait before the first render).

### Relevant Files
- `lm-commons/mission-control/server/routes/agents.ts` — to be created; GET /api/agents stub
- `lm-commons/mission-control/server/index.ts` (task_02) — mount point for agents router
- `lm-commons/mission-control/src/hooks/usePolling.ts` — to be created; reusable polling hook
- `lm-commons/mission-control/src/components/dashboards/AgentStatus.tsx` — replaces task_04 stub
- `lm-commons/mission-control/src/shared/types.ts` (task_01) — `AgentStatusResponse` type reference

### Dependent Files
- `src/styles/` (task_08) — agent status badge CSS classes (`agent-status--active`, `agent-status--idle`, `agent-status--error`) styled in task_08

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — agent status as a fixed dashboard

## Deliverables
- `server/routes/agents.ts` — `GET /api/agents` returning valid stub data.
- `src/hooks/usePolling.ts` — reusable polling hook with cleanup.
- `src/components/dashboards/AgentStatus.tsx` — polling dashboard with per-agent status rows.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the API endpoint **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `usePolling` calls `fetch` immediately on mount.
  - [ ] `usePolling` calls `fetch` again after the specified interval using fake timers.
  - [ ] `usePolling` clears the interval when the component unmounts (no fetch after unmount).
  - [ ] `AgentStatus` renders a row for each agent returned by the mock API.
  - [ ] `AgentStatus` applies the `agent-status--active` class to an agent with status `active`.
  - [ ] `AgentStatus` renders a loading state when `usePolling` returns `loading: true`.
  - [ ] `AgentStatus` renders an error message when `usePolling` returns `error` set.
- Integration tests (Supertest):
  - [ ] `GET /api/agents` returns 200 with `{ agents: [...] }` containing at least one entry.
  - [ ] Each agent entry has `name`, `status`, `lastSeen`, and `currentTask` fields.
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `GET /api/agents` returns valid data with the three configured agents.
- The AgentStatus dashboard auto-refreshes every 30 seconds without a page reload.
- All three status states (`active`, `idle`, `error`) are visually distinguishable via CSS classes.
