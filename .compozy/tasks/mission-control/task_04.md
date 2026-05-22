---
status: pending
title: React Shell & Sidebar Navigation
type: frontend
complexity: medium
dependencies:
  - task_01
---

# Task 04: React Shell & Sidebar Navigation

## Overview
Build the React SPA shell: the root `App.tsx` with React Router v6 layout, the persistent `Sidebar` navigation component, and placeholder routes for all dashboards and dynamic pages. This is the structural skeleton that every subsequent frontend task (05–08) slots into — no UI work can proceed without it.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `src/App.tsx` MUST use React Router v6 (`createBrowserRouter` or `<BrowserRouter>`) with routes for `/`, `/dashboards/agents`, `/dashboards/linear`, and `/portal/pages/:id`.
- The layout MUST render the `Sidebar` persistently alongside a route outlet — navigating between routes MUST NOT re-mount the sidebar.
- `src/components/Sidebar.tsx` MUST render navigation links to all fixed dashboards (`AgentStatus`, `LinearTaskBoard`) and a placeholder list area for dynamic pages (populated in task_05).
- Placeholder route components (stub `<div>` with route name) MUST be in place for dashboards so the shell renders without errors before tasks 05–07 are complete.
- The app MUST render without console errors when no API endpoints are available (API calls deferred to child components).
- Vanilla CSS only — no Tailwind, no CSS Modules (see TechSpec "Key Decisions — Vanilla CSS").
- BEM class naming convention MUST be used on all new HTML elements.
</requirements>

## Subtasks
- [ ] 4.1 Install `react-router-dom` v6 and set up `createBrowserRouter` in `src/main.tsx`.
- [ ] 4.2 Create `src/App.tsx` with a root layout (sidebar + outlet) and all four route definitions.
- [ ] 4.3 Create `src/components/Sidebar.tsx` with `<NavLink>` entries for fixed dashboards and a dynamic pages section stub.
- [ ] 4.4 Create stub route components for AgentStatus and LinearTaskBoard dashboards.
- [ ] 4.5 Write component tests for `App` layout rendering and `Sidebar` link presence.

## Implementation Details
See TechSpec "React SPA" component overview and "Development Sequencing — Step 4". The sidebar needs a section for dynamic pages that will be populated via a `GET /api/pages` call in task_05; for now a static placeholder is sufficient.

CSS for this task is intentionally minimal (layout structure only) — the full "Mission Control" dark aesthetic is applied in task_08. Use BEM class names from the start so task_08 can add styles without renaming classes.

### Relevant Files
- `lm-commons/mission-control/src/main.tsx` — to be modified; router provider wraps the app
- `lm-commons/mission-control/src/App.tsx` — to be created; root layout + routes
- `lm-commons/mission-control/src/components/Sidebar.tsx` — to be created; persistent navigation
- `lm-commons/mission-control/src/components/dashboards/AgentStatus.tsx` — stub, to be created
- `lm-commons/mission-control/src/components/dashboards/LinearTaskBoard.tsx` — stub, to be created
- `lm-commons/mission-control/index.html` — Vite entry point (already exists from scaffold)

### Dependent Files
- `src/templates/DailyPlan.tsx` (task_05) — rendered at `/portal/pages/:id` route
- `src/components/dashboards/AgentStatus.tsx` (task_06) — replaces stub at `/dashboards/agents`
- `src/components/dashboards/LinearTaskBoard.tsx` (task_07) — replaces stub at `/dashboards/linear`
- `src/styles/global.css` (task_08) — applies "Mission Control" theme to classes defined here

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — React SPA as central hub

## Deliverables
- `src/App.tsx` with React Router layout and all four routes.
- `src/components/Sidebar.tsx` with navigation links.
- Stub dashboard components at their intended paths.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for route rendering **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `Sidebar` renders a link with text "Agent Status" pointing to `/dashboards/agents`.
  - [ ] `Sidebar` renders a link with text "Linear Tasks" pointing to `/dashboards/linear`.
  - [ ] `App` at route `/` renders the `Sidebar` component.
  - [ ] `App` at route `/dashboards/agents` renders the AgentStatus stub without crashing.
  - [ ] `App` at route `/dashboards/linear` renders the LinearTaskBoard stub without crashing.
- Integration tests:
  - [ ] Navigating from `/` to `/dashboards/agents` via `<NavLink>` does not re-mount the `Sidebar`.
  - [ ] Route `/portal/pages/nonexistent` renders without a runtime error (page fetch is handled by task_05).
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `npm run dev` serves the shell at `http://localhost:5173` with sidebar navigation working.
- All four routes render without console errors.
- BEM class names are used consistently on all new elements.
