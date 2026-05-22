---
status: pending
title: DailyPlan Template & Template Registry
type: frontend
complexity: medium
dependencies:
  - task_03
  - task_04
---

# Task 05: DailyPlan Template & Template Registry

## Overview
Implement the `DailyPlan` React template component, the client-side template registry, and the `DynamicPage` route component that fetches a page by ID and resolves the correct template at runtime. This is the end-to-end flow that validates the agent → POST → URL → rendered page pipeline described in the PRD primary flow.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `src/templates/registry.ts` MUST export `resolveTemplate(id: string): TemplateComponent | null` using `React.lazy` for code-splitting (see TechSpec "Template registry" code reference).
- `DailyPlan` MUST render `payload.date`, `payload.summary`, and all `payload.sections` with their headings and items, using the `DailyPlanData` schema from TechSpec "Data Models".
- `DailyPlan` MUST handle missing or malformed payload fields gracefully with fallback defaults — it MUST NOT throw a runtime error if optional fields are absent (see TechSpec "Known Risks — Template rigidity").
- The `DynamicPage` route component at `/portal/pages/:id` MUST fetch `GET /api/pages/:id`, resolve the template via `resolveTemplate()`, and render the result inside a `<Suspense>` boundary.
- If the page ID does not exist (404 from API), `DynamicPage` MUST render a user-facing "Page not found" message, not a blank screen.
- The `Sidebar` (task_04) MUST be updated to fetch `GET /api/pages` and list dynamic pages with links to their `/portal/pages/:id` routes.
- Template components MUST receive the full `Page` object as a prop (not just `payload`).
</requirements>

## Subtasks
- [ ] 5.1 Create `src/templates/registry.ts` with the `resolveTemplate` function and `DailyPlan` lazy entry.
- [ ] 5.2 Create `src/templates/DailyPlan.tsx` rendering date, summary, and sections from `page.payload`.
- [ ] 5.3 Create `src/pages/DynamicPage.tsx` that fetches the page, resolves the template, and handles 404.
- [ ] 5.4 Update `src/components/Sidebar.tsx` to fetch and list active dynamic pages.
- [ ] 5.5 Write unit tests for `DailyPlan` with fixture payloads and for `resolveTemplate` with known and unknown IDs.

## Implementation Details
See TechSpec "Core Interfaces — Template registry", "Data Models — DailyPlan payload schema", and "Development Sequencing — Step 5".

The `DynamicPage` component should use a `useEffect` + `fetch` pattern (or a simple custom hook) to load the page data. Full data-fetching libraries are out of scope for Phase 1.

### Relevant Files
- `lm-commons/mission-control/src/templates/registry.ts` — to be created; lazy template map
- `lm-commons/mission-control/src/templates/DailyPlan.tsx` — to be created; DailyPlan renderer
- `lm-commons/mission-control/src/pages/DynamicPage.tsx` — to be created; route component for `/portal/pages/:id`
- `lm-commons/mission-control/src/components/Sidebar.tsx` (task_04) — to be updated with dynamic pages list
- `lm-commons/mission-control/src/shared/types.ts` (task_01) — `Page`, `TemplateId` consumed here

### Dependent Files
- `src/App.tsx` (task_04) — `/portal/pages/:id` route must render `DynamicPage`
- `src/styles/` (task_08) — DailyPlan CSS classes styled in task_08

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — template registry as the rendering contract between agents and portal

## Deliverables
- `src/templates/registry.ts` — working registry with DailyPlan entry.
- `src/templates/DailyPlan.tsx` — rendered template with graceful field fallbacks.
- `src/pages/DynamicPage.tsx` — route component with fetch, resolve, and 404 handling.
- Updated `Sidebar.tsx` showing live dynamic pages list.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for the full fetch-resolve-render flow **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `resolveTemplate('DailyPlan')` returns a non-null component.
  - [ ] `resolveTemplate('UnknownTemplate')` returns `null`.
  - [ ] `DailyPlan` renders the `date` field from a fixture `DailyPlanData` payload.
  - [ ] `DailyPlan` renders all section headings from a fixture payload.
  - [ ] `DailyPlan` renders section items under each heading.
  - [ ] `DailyPlan` renders without throwing when `sections` is an empty array.
  - [ ] `DailyPlan` renders without throwing when `summary` is missing from payload.
- Integration tests:
  - [ ] `DynamicPage` at `/portal/pages/:id` fetches the page and renders the resolved template.
  - [ ] `DynamicPage` shows "Page not found" when the API returns 404 for the given ID.
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- A page created via `POST /api/pages` with `template: "DailyPlan"` is accessible and fully rendered at its returned URL.
- Navigating to `/portal/pages/nonexistent` shows a "Page not found" message instead of a blank screen or crash.
