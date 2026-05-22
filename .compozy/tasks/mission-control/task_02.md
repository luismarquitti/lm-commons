---
status: pending
title: Server Foundation (Express + SQLite)
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Server Foundation (Express + SQLite)

## Overview
Create the Express application entry point and the SQLite database module. This establishes the running server process and persistent storage layer that all API routes (task_03, task_06) mount onto. The database must initialise on startup with WAL mode enabled and the `pages` schema applied idempotently.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- `server/index.ts` MUST create an Express app, register Morgan for request logging, and call `initDb()` before binding to the port.
- The port MUST be read from `process.env.PORT` with a fallback of `3001` (see TechSpec "Known Risks — Port conflict").
- `server/db.ts` MUST export `initDb()`, `insertPage()`, `getPage()`, `listPages()`, and `deletePageById()`.
- `initDb()` MUST enable WAL mode (`PRAGMA journal_mode = WAL`) and create the `pages` table and its two indexes idempotently (see TechSpec "Data Models — SQLite pages table").
- `listPages()` MUST support optional filters: `template`, `tag`, and `limit`.
- TTL expiry — pages with `expires_at < datetime('now')` MUST be excluded from `listPages()` results.
- The DB file path MUST be read from `process.env.DB_PATH` with a fallback of `/var/lib/mission-control/data.db`.
- In test environments (`NODE_ENV=test`), the database MUST default to `:memory:` to avoid filesystem side effects.
</requirements>

## Subtasks
- [ ] 2.1 Create `server/index.ts` with Express app setup, Morgan middleware, and `initDb()` call on startup.
- [ ] 2.2 Create `server/db.ts` with schema initialisation, WAL mode, and all CRUD operations.
- [ ] 2.3 Wire `PORT` and `DB_PATH` environment variable reading with documented fallbacks.
- [ ] 2.4 Write unit tests for all `db.ts` exports against an in-memory SQLite instance.

## Implementation Details
See TechSpec "Server Foundation" (Development Sequencing step 2), "Data Models — SQLite pages table", and ADR-003 for WAL mode and synchronous `better-sqlite3` rationale.

In production, Express will also serve `dist/client/` as static files and fall back to `index.html` for SPA routing — these static-serving routes are added here as the final middleware, after all `/api` routes are registered.

### Relevant Files
- `lm-commons/mission-control/server/index.ts` — to be created; Express entry point
- `lm-commons/mission-control/server/db.ts` — to be created; SQLite module
- `lm-commons/mission-control/src/shared/types.ts` — `Page` type used by `insertPage` / `getPage` return shapes

### Dependent Files
- `server/routes/pages.ts` (task_03) — imports `insertPage`, `getPage`, `listPages`, `deletePageById`
- `server/routes/agents.ts` (task_06) — mounts onto the same Express app

### Related ADRs
- [ADR-002: Node.js + Express as the API Backend](adrs/adr-002.md) — Express rationale, `tsx` dev execution
- [ADR-003: SQLite for Dynamic Page Metadata Storage](adrs/adr-003.md) — WAL mode, synchronous API, `:memory:` test pattern
- [ADR-004: Single-Port Vite + Express Serving Model](adrs/adr-004.md) — static file serving fallback

## Deliverables
- `server/index.ts` — running Express app that starts cleanly with `tsx server/index.ts`.
- `server/db.ts` — fully functional SQLite module with all five exported functions.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for server startup **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `initDb()` creates the `pages` table when called on a fresh `:memory:` database.
  - [ ] `initDb()` is idempotent — calling it twice does not throw or duplicate the schema.
  - [ ] `insertPage()` with a valid `Page` object persists all fields and returns the inserted row.
  - [ ] `getPage()` with an unknown ID returns `undefined`.
  - [ ] `listPages()` with `template: 'DailyPlan'` returns only pages matching that template.
  - [ ] `listPages()` excludes pages whose `expires_at` is in the past.
  - [ ] `listPages()` with `limit: 5` returns at most 5 results.
  - [ ] `deletePageById()` removes the row; subsequent `getPage()` returns `undefined`.
- Integration tests:
  - [ ] Express server binds to `PORT=3099` (test port) and responds to `GET /` without crashing.
  - [ ] `GET /` returns 200 when `dist/client/index.html` is absent (graceful static-serve fallback).
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `tsx server/index.ts` starts the server and logs the bound port without errors.
- SQLite WAL mode is confirmed active after `initDb()` (`PRAGMA journal_mode` returns `wal`).
