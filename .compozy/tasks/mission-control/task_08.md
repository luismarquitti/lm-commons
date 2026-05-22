---
status: pending
title: CSS & Mission Control Aesthetic
type: frontend
complexity: medium
dependencies:
  - task_04
  - task_05
  - task_06
  - task_07
---

# Task 08: CSS & Mission Control Aesthetic

## Overview
Apply the "Mission Control" dark aesthetic across the entire portal: global CSS custom properties (design tokens), layout grid, and component-level BEM styles for Sidebar, dashboards, and templates. This task is purely additive — it only adds CSS files and class-level styling to existing HTML structures. No component logic changes.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A `src/styles/variables.css` file MUST define all CSS custom properties: colour palette (dark background, accent, surface, text), typography (font family, sizes), and spacing tokens.
- A `src/styles/global.css` file MUST apply the base reset, body background, and font; it MUST import `variables.css`.
- The app layout MUST use CSS Grid or Flexbox to place the Sidebar as a fixed-width column alongside the main content area.
- All existing BEM class names introduced in tasks 04–07 MUST have corresponding CSS rules — no unstyled BEM classes should remain after this task.
- Component CSS files MUST be co-located with their components (`Sidebar.css`, `AgentStatus.css`, `LinearTaskBoard.css`, `DailyPlan.css`) and imported directly in the component file.
- Agent status badges (`agent-status--active`, `agent-status--idle`, `agent-status--error`) MUST use distinct colours defined via CSS custom properties.
- The aesthetic MUST be high information density and dark-themed ("Mission Control"), per PRD User Experience section.
- No Tailwind, no CSS Modules, no CSS-in-JS — Vanilla CSS only (see TechSpec "Key Decisions — Vanilla CSS").
</requirements>

## Subtasks
- [ ] 8.1 Create `src/styles/variables.css` with the full dark-theme token set (colours, typography, spacing).
- [ ] 8.2 Create `src/styles/global.css` with base reset and body styles; import in `src/main.tsx`.
- [ ] 8.3 Implement layout grid in `App.css` (or equivalent) for sidebar + main content area.
- [ ] 8.4 Create and apply `Sidebar.css` for navigation, active link highlight, and dynamic pages list.
- [ ] 8.5 Create and apply component CSS files for `AgentStatus`, `LinearTaskBoard`, and `DailyPlan`.
- [ ] 8.6 Write snapshot or visual regression tests confirming key CSS classes are present in rendered output.

## Implementation Details
See TechSpec "Key Decisions — Vanilla CSS over Tailwind/CSS Modules" and "Development Sequencing — Step 8". The PRD describes the target as "clean, Mission Control aesthetic — high information density but organised."

Suggested colour tokens as a starting point (adjust freely):
- `--color-bg`: `#0d1117` (near-black background)
- `--color-surface`: `#161b22` (card/sidebar surface)
- `--color-accent`: `#58a6ff` (blue accent)
- `--color-text`: `#c9d1d9` (primary text)
- `--color-text-muted`: `#8b949e` (secondary text)
- `--color-status-active`: `#3fb950`
- `--color-status-idle`: `#d29922`
- `--color-status-error`: `#f85149`

### Relevant Files
- `lm-commons/mission-control/src/styles/variables.css` — to be created; design token definitions
- `lm-commons/mission-control/src/styles/global.css` — to be created; base reset and body styles
- `lm-commons/mission-control/src/main.tsx` (task_04) — import `global.css` here
- `lm-commons/mission-control/src/components/Sidebar.css` — to be created
- `lm-commons/mission-control/src/components/dashboards/AgentStatus.css` — to be created
- `lm-commons/mission-control/src/components/dashboards/LinearTaskBoard.css` — to be created
- `lm-commons/mission-control/src/templates/DailyPlan.css` — to be created

### Dependent Files
- All component files from tasks 04–07 — importing their co-located CSS files

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — consistent "Mission Control" look and feel

## Deliverables
- `src/styles/variables.css` — complete dark-theme token set.
- `src/styles/global.css` — base reset imported in `main.tsx`.
- Co-located CSS files for Sidebar, AgentStatus, LinearTaskBoard, and DailyPlan.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Visual regression / snapshot tests **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `Sidebar` rendered output contains the `sidebar` BEM block class.
  - [ ] `AgentStatus` rendered output contains the `agent-status` BEM block class.
  - [ ] An agent with status `active` has the `agent-status__badge--active` modifier class in the rendered output.
  - [ ] An agent with status `error` has the `agent-status__badge--error` modifier class.
  - [ ] `DailyPlan` rendered output contains a `daily-plan__section` class for each section in the fixture.
- Integration tests:
  - [ ] `npm run build` succeeds with all CSS files included — no missing import errors.
  - [ ] The built `dist/client/assets/` directory contains at least one `.css` file.
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- The portal displays a dark-themed "Mission Control" aesthetic at `http://localhost:5173`.
- All component BEM classes have matching CSS rules — no unstyled structural elements.
- The sidebar and main content area are correctly placed via CSS layout (no overlap, no broken layout on viewport resize).
