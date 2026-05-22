---
status: pending
title: Pages API Routes
type: backend
complexity: medium
dependencies:
  - task_02
---

# Task 03: Pages API Routes

## Overview
Implement the full REST API for dynamic page management: `POST /api/pages`, `GET /api/pages`, `GET /api/pages/:id`, and `DELETE /api/pages/:id`. This is the primary integration surface for OpenClaw agents — the POST endpoint is what agents call to publish a DailyPlan or any other template page and receive a URL in return.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- All four endpoints listed in TechSpec "API Endpoints" table MUST be implemented.
- `POST /api/pages` MUST validate the request body with a Zod schema matching `CreatePageRequest`; invalid payloads MUST return 400 with `{ "error": "...", "details": [...] }`.
- `POST /api/pages` MUST generate a `nanoid` for the page ID, compute `expiresAt` from `ttlHours` if provided, and return 201 with `{ id, url }` where `url` is `http://<host>:PORT/portal/pages/<id>`.
- `GET /api/pages` MUST support `?template=`, `?tag=`, and `?limit=` query parameters, delegating filtering to `listPages()` from task_02.
- `GET /api/pages` response MUST include `{ pages: [...], total: number }` (see TechSpec "API Endpoints — GET /api/pages Response").
- `GET /api/pages/:id` for a non-existent ID MUST return 404 with `{ "error": "Page not found" }`.
- `DELETE /api/pages/:id` for a non-existent ID MUST return 404.
- Error responses for all routes MUST use `{ "error": "message" }` shape with correct HTTP status codes.
- The router MUST be mounted at `/api` in `server/index.ts`.
</requirements>

## Subtasks
- [ ] 3.1 Create `server/schemas/pages.ts` with Zod schemas for `CreatePageRequest` and query params.
- [ ] 3.2 Implement `POST /api/pages` with Zod validation, nanoid generation, TTL computation, and DB insertion.
- [ ] 3.3 Implement `GET /api/pages` with query param filtering forwarded to `listPages()`.
- [ ] 3.4 Implement `GET /api/pages/:id` and `DELETE /api/pages/:id` with 404 handling.
- [ ] 3.5 Mount the pages router in `server/index.ts`.
- [ ] 3.6 Write Supertest integration tests for all four endpoints covering happy path and error cases.

## Implementation Details
See TechSpec "API Endpoints" section for request/response shapes and HTTP status codes. See TechSpec "Core Interfaces" for `CreatePageRequest` and `CreatePageResponse` types — Zod schemas must align with these TypeScript types.

The `url` field in the POST response uses the `Host` request header (or a configured `BASE_URL` env var as fallback) to construct the absolute URL so it works on both LAN and Tailscale addresses.

### Relevant Files
- `lm-commons/mission-control/server/routes/pages.ts` — to be created; Express Router with all four endpoints
- `lm-commons/mission-control/server/schemas/pages.ts` — to be created; Zod validation schemas
- `lm-commons/mission-control/server/db.ts` (task_02) — `insertPage`, `getPage`, `listPages`, `deletePageById`
- `lm-commons/mission-control/server/index.ts` (task_02) — router mount point
- `lm-commons/mission-control/src/shared/types.ts` (task_01) — `CreatePageRequest`, `CreatePageResponse`

### Dependent Files
- `src/templates/DailyPlan.tsx` (task_05) — consumes `Page` objects served by `GET /api/pages/:id`
- `src/components/dashboards/AgentStatus.tsx` (task_06) — uses this router as reference for agent tool integration

### Related ADRs
- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — agent POST → URL response flow
- [ADR-002: Node.js + Express as the API Backend](adrs/adr-002.md) — Zod validation pattern

## Deliverables
- `server/routes/pages.ts` — all four endpoints implemented and mounted.
- `server/schemas/pages.ts` — Zod schemas for request validation.
- Unit tests for Zod schemas with 80%+ coverage **(REQUIRED)**
- Integration tests (Supertest) for all endpoints **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `CreatePageRequest` Zod schema accepts a valid payload with all optional fields present.
  - [ ] `CreatePageRequest` Zod schema rejects a payload missing the required `template` field.
  - [ ] `CreatePageRequest` Zod schema rejects a `template` value not in the `TemplateId` union.
  - [ ] TTL computation: `ttlHours: 48` produces an `expiresAt` approximately 48 hours from now.
- Integration tests (Supertest, in-memory DB):
  - [ ] `POST /api/pages` with a valid `DailyPlan` payload returns 201 with `id` and `url` fields.
  - [ ] `POST /api/pages` with missing `template` returns 400 with `error` and `details` fields.
  - [ ] `POST /api/pages` with `template: "Unknown"` returns 400.
  - [ ] `GET /api/pages` returns 200 with `{ pages: [], total: 0 }` on an empty database.
  - [ ] `GET /api/pages?template=DailyPlan` returns only pages with template `DailyPlan`.
  - [ ] `GET /api/pages/:id` for a valid ID returns 200 with the full `Page` object.
  - [ ] `GET /api/pages/:id` for an unknown ID returns 404 with `{ "error": "Page not found" }`.
  - [ ] `DELETE /api/pages/:id` for an existing page returns 204.
  - [ ] `DELETE /api/pages/:id` for an unknown ID returns 404.
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `POST /api/pages` with a valid DailyPlan payload returns a `url` containing `/portal/pages/`.
- All error responses use `{ "error": "..." }` shape with correct HTTP status codes.
