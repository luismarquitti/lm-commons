---
status: pending
title: LinearTaskBoard Dashboard
type: frontend
complexity: low
dependencies:
  - task_04
---

# Task 07: LinearTaskBoard Dashboard

## Overview
Implement the `LinearTaskBoard` React dashboard component that fetches issues directly from the Linear GraphQL API in the browser using the `VITE_LINEAR_API_KEY` environment variable. This is an entirely client-side integration — no server-side proxy is needed for Phase 1.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `src/components/dashboards/LinearTaskBoard.tsx` MUST fetch issues from the Linear GraphQL API (`https://api.linear.app/graphql`) using `VITE_LINEAR_API_KEY` from the Vite environment.
- The component MUST render a table or list of issues showing at minimum: title, status, and assignee.
- If `VITE_LINEAR_API_KEY` is absent or empty, the component MUST render a clear configuration message ("Linear API key not configured") rather than attempting a failing request.
- On API error, the component MUST display a user-facing error message — not a blank panel or unhandled exception.
- The Linear API key is embedded in the client bundle by Vite (`import.meta.env.VITE_LINEAR_API_KEY`) — this is the accepted trade-off for an internal-only portal (see TechSpec "Known Risks — Linear API key exposure").
- No server-side proxy, no authentication beyond the API key header.
</requirements>

## Subtasks
- [ ] 7.1 Create `src/components/dashboards/LinearTaskBoard.tsx` with a Linear GraphQL fetch on mount.
- [ ] 7.2 Render the issues list with title, status, and assignee columns.
- [ ] 7.3 Handle the missing API key case with a configuration message.
- [ ] 7.4 Handle API errors with a user-facing error state.
- [ ] 7.5 Write unit tests with a mocked `fetch` for the happy path, missing key, and error cases.

## Implementation Details
See TechSpec "Integration Points — Linear API" and "Development Sequencing — Step 7". The Linear GraphQL query should fetch the authenticated user's assigned issues from their active team.

`VITE_LINEAR_API_KEY` is accessed via `import.meta.env.VITE_LINEAR_API_KEY` at build time. The `.env.example` from task_01 already documents this variable.

### Relevant Files
- `lm-commons/mission-control/src/components/dashboards/LinearTaskBoard.tsx` — replaces task_04 stub
- `lm-commons/mission-control/.env.example` (task_01) — `VITE_LINEAR_API_KEY` documented here
- `lm-commons/mission-control/src/App.tsx` (task_04) — `/dashboards/linear` route renders this component

### Dependent Files
- `src/styles/` (task_08) — LinearTaskBoard table CSS classes styled in task_08

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — fixed dashboards as part of the React hub

## Deliverables
- `src/components/dashboards/LinearTaskBoard.tsx` — functional Linear issue dashboard.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the API fetch flow **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `LinearTaskBoard` renders an issue title from a mocked successful API response.
  - [ ] `LinearTaskBoard` renders a "Linear API key not configured" message when `VITE_LINEAR_API_KEY` is empty.
  - [ ] `LinearTaskBoard` renders an error message when the mocked fetch returns a non-200 status.
  - [ ] `LinearTaskBoard` renders a loading state before the fetch resolves.
- Integration tests:
  - [ ] Component fetches `https://api.linear.app/graphql` with an `Authorization` header containing the API key.
  - [ ] Component does not make a network request when the API key is absent.
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- With a valid `VITE_LINEAR_API_KEY` in `.env`, the dashboard renders a list of Linear issues.
- Without a key, the component displays a configuration prompt rather than an error or blank screen.
