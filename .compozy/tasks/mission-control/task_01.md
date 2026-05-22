---
status: pending
title: Project Scaffold & Configuration
type: chore
complexity: medium
dependencies: []
---

# Task 01: Project Scaffold & Configuration

## Overview
Bootstrap the `mission-control` Node.js + React 19 + TypeScript project inside `lm-commons/mission-control/`. This task establishes the complete build toolchain — Vite for the client, `tsc` for the server, Vitest + Supertest for tests — and the shared type definitions consumed by every subsequent task. Nothing else can be built until this scaffold is in place.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- The project MUST be created at `lm-commons/mission-control/` as a top-level directory in the monorepo.
- A single `package.json` MUST cover both client and server dependencies.
- TypeScript compilation MUST use two configs: `tsconfig.json` (root/client) and `tsconfig.server.json` (server-only, targets `dist/server/`).
- Vite MUST be configured to proxy `/api/*` and `/portal/*` to `http://localhost:3001` in development (see TechSpec ADR-004).
- `src/shared/types.ts` MUST export `Page`, `TemplateId`, `CreatePageRequest`, and `CreatePageResponse` exactly as defined in TechSpec "Core Interfaces".
- Vitest MUST be configured with jsdom environment for React component tests.
- Supertest MUST be listed as a dev dependency for integration tests.
- A `.env.example` MUST document `PORT`, `DB_PATH`, and `VITE_LINEAR_API_KEY`.
- The `npm run dev` script MUST start both the Vite dev server and the Express server concurrently.
</requirements>

## Subtasks
- [ ] 1.1 Create `lm-commons/mission-control/` and initialise the Vite React TypeScript project.
- [ ] 1.2 Install all server and test dependencies (Express, better-sqlite3, zod, nanoid, morgan, tsx, supertest, vitest, @testing-library/react, jsdom).
- [ ] 1.3 Configure `tsconfig.json` (client + shared) and `tsconfig.server.json` (server compilation to `dist/server/`).
- [ ] 1.4 Configure `vite.config.ts` with the `/api` and `/portal` proxy rules.
- [ ] 1.5 Create `src/shared/types.ts` with all shared domain types.
- [ ] 1.6 Configure `vitest.config.ts` with jsdom environment and coverage thresholds.
- [ ] 1.7 Create `.env.example` documenting required environment variables.

## Implementation Details
See TechSpec "Development Sequencing — Step 1" and "ADR-004: Single-Port Vite + Express Serving Model" for proxy configuration details.

The `concurrently` package (or similar) is needed to run `tsx watch server/index.ts` and `vite` in parallel during development. Production build runs `vite build` (client to `dist/client/`) then `tsc -p tsconfig.server.json` (server to `dist/server/`).

### Relevant Files
- `lm-commons/mission-control/package.json` — to be created; root of the new package
- `lm-commons/mission-control/vite.config.ts` — to be created; Vite + proxy config
- `lm-commons/mission-control/tsconfig.json` — to be created; client + shared TS config
- `lm-commons/mission-control/tsconfig.server.json` — to be created; server-only TS config
- `lm-commons/mission-control/src/shared/types.ts` — to be created; shared domain types
- `lm-commons/mission-control/vitest.config.ts` — to be created; test runner config
- `lm-commons/mission-control/.env.example` — to be created; env var documentation

### Dependent Files
- All subsequent task files — depend on the scaffold and shared types defined here.

### Related ADRs
- [ADR-002: Node.js + Express as the API Backend](adrs/adr-002.md) — single `package.json` for full-stack TS
- [ADR-004: Single-Port Vite + Express Serving Model](adrs/adr-004.md) — Vite proxy configuration

## Deliverables
- `lm-commons/mission-control/` directory with fully configured Vite + Express TypeScript project.
- `src/shared/types.ts` with all TechSpec domain types exported.
- `vitest.config.ts` and `package.json` test scripts (`test`, `test:coverage`) configured.
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for scaffold verification **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `src/shared/types.ts` compiles without TypeScript errors (tsc --noEmit passes).
  - [ ] `TemplateId` union type rejects a string literal not in `'DailyPlan' | 'LinearTaskBoard' | 'AgentStatus'`.
  - [ ] `CreatePageRequest` with all required fields passes type-checking.
  - [ ] `CreatePageRequest` missing `template` field fails type-checking.
- Integration tests:
  - [ ] `npm run build` completes without errors (client and server both compile).
  - [ ] Vite dev server starts and proxies `/api/health` to Express port 3001 (manual smoke test).
- Test coverage target: >=80%
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- `npm run dev` starts both servers without errors.
- `npm run build` produces `dist/client/` and `dist/server/` without errors.
- `src/shared/types.ts` exports all four types from the TechSpec.
