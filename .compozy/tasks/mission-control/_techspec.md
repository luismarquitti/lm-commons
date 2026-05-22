# TechSpec: Mission Control (Home Lab Web Portal)

## Executive Summary

Mission Control is a greenfield Node.js + React 19 application that provides a unified web portal for the Home Lab ecosystem. The backend is an Express server serving both the REST API (for OpenClaw agent integration) and the Vite-built React static output from a single port. Page metadata is stored in a local SQLite database on lm-claw, eliminating external service dependencies. The React frontend renders fixed dashboards (LinearTaskBoard, AgentStatus) and dynamic template pages (DailyPlan) from a client-side template registry.

The primary technical trade-off is operational simplicity over scalability: running Express as a static file server is less efficient than Nginx for high-throughput workloads, but the home lab scale (fewer than 10 concurrent users, <500ms load target on LAN) makes this a sound choice. The single-process, single-port model also means a process crash takes down both the UI and the API simultaneously; systemd `Restart=on-failure` mitigates this.

Phase 1 delivers the React shell, two fixed dashboards, one dynamic template (DailyPlan), and the agent POST API. Phase 2 adds the static hosting escape hatch. Phase 3 extends OpenClaw's heartbeat for memory distillation.

---

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────┐
│                  lm-claw (192.168.3.10)              │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           mission-control process             │   │
│  │                                              │   │
│  │  Express :3001                               │   │
│  │  ├── GET  /                → React SPA       │   │
│  │  ├── GET  /api/pages       → SQLite read     │   │
│  │  ├── POST /api/pages       → SQLite write    │   │
│  │  ├── GET  /api/agents      → status poll     │   │
│  │  └── GET  /portal/custom/* → static bundles  │   │
│  │                                              │   │
│  │  SQLite: /var/lib/mission-control/data.db    │   │
│  │  Bundles: /var/lib/mission-control/bundles/  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ▲                              ▲
         │ Tailscale / LAN              │ HTTP POST JSON
    Luis (browser)              OpenClaw Agent
```

**mission-control process** — single Node.js process managed by systemd. Express handles routing; Vite output is embedded as static files at startup.

**SQLite database** — stores `pages` table with metadata for all dynamic pages. Local file; no network dependency.

**React SPA** — client-side router (React Router v6) renders fixed dashboards and dynamic template pages. Template registry maps `template` string to React component.

**OpenClaw agents** — POST JSON payloads to `/api/pages` to create dynamic pages. Receive a URL in the response.

---

## Implementation Design

### Core Interfaces

**Page domain type (shared between server and client via `src/shared/types.ts`):**

```ts
export type TemplateId = 'DailyPlan' | 'LinearTaskBoard' | 'AgentStatus';

export interface Page {
  id: string;            // nanoid
  title: string;
  template: TemplateId;
  author: string;        // agent identifier or 'system'
  createdAt: string;     // ISO 8601
  expiresAt: string | null;
  tags: string[];
  payload: unknown;      // template-specific data
}

export interface CreatePageRequest {
  template: TemplateId;
  title: string;
  author: string;
  ttlHours?: number;
  tags?: string[];
  data: unknown;
}

export interface CreatePageResponse {
  id: string;
  url: string;
}
```

**Template registry (client-side, `src/templates/registry.ts`):**

```ts
import type { ComponentType } from 'react';
import type { Page } from '../shared/types';

export type TemplateComponent = ComponentType<{ page: Page }>;

const registry: Record<string, TemplateComponent> = {
  DailyPlan: lazy(() => import('./DailyPlan')),
};

export function resolveTemplate(id: string): TemplateComponent | null {
  return registry[id] ?? null;
}
```

### Data Models

**SQLite `pages` table:**

```sql
CREATE TABLE IF NOT EXISTS pages (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  template    TEXT NOT NULL,
  author      TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT,
  tags        TEXT NOT NULL DEFAULT '[]',  -- JSON array
  payload     TEXT NOT NULL                -- JSON object
);

CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_template   ON pages(template);
```

**DailyPlan payload schema (`data` field in `CreatePageRequest`):**

```ts
interface DailyPlanData {
  date: string;           // YYYY-MM-DD
  summary: string;
  sections: Array<{
    heading: string;
    items: string[];
  }>;
}
```

**AgentStatus payload (returned by GET /api/agents):**

```ts
interface AgentStatusResponse {
  agents: Array<{
    name: string;
    status: 'active' | 'idle' | 'error';
    lastSeen: string;    // ISO 8601
    currentTask: string | null;
  }>;
}
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/pages` | Create a dynamic page from a JSON template payload |
| `GET` | `/api/pages` | List all pages (supports `?template=`, `?tag=`, `?limit=`) |
| `GET` | `/api/pages/:id` | Retrieve a single page by ID |
| `DELETE` | `/api/pages/:id` | Archive/delete a page |
| `GET` | `/api/agents` | Return current agent status (polled by client every 30s) |

**POST /api/pages — Request:**
```json
{
  "template": "DailyPlan",
  "title": "Plan of the Day — 2026-05-20",
  "author": "openclaw-primary",
  "ttlHours": 48,
  "tags": ["daily-plan", "automated"],
  "data": {
    "date": "2026-05-20",
    "summary": "Focus on Mission Control Phase 1.",
    "sections": [
      { "heading": "Priority", "items": ["Scaffold React shell", "Wire DailyPlan template"] }
    ]
  }
}
```

**POST /api/pages — Response (201):**
```json
{
  "id": "abc123",
  "url": "http://lm-claw:3001/portal/pages/abc123"
}
```

**GET /api/pages — Response (200):**
```json
{
  "pages": [
    {
      "id": "abc123",
      "title": "Plan of the Day — 2026-05-20",
      "template": "DailyPlan",
      "author": "openclaw-primary",
      "createdAt": "2026-05-20T09:00:00Z",
      "expiresAt": "2026-05-22T09:00:00Z",
      "tags": ["daily-plan"]
    }
  ],
  "total": 1
}
```

Error responses use `{ "error": "message" }` with standard HTTP status codes. Zod validation failures return 400 with a `{ "error": "...", "details": [...] }` shape.

---

## Integration Points

**OpenClaw Agent Tool Call** — Agents invoke `POST /api/pages` via an HTTP tool call in their Claude Code session. No authentication is required (Tailscale network boundary is the security perimeter, per ADR-001). The agent uses the returned `url` to share the page link with Luis.

**Linear API** — The `LinearTaskBoard` dashboard fetches issue data directly from the Linear GraphQL API in the browser using an API key stored in a `.env` file (not committed). This is a client-side fetch; no server-side proxy is required for Phase 1.

---

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|----------------------|-----------------|
| lm-claw systemd | New | New `mission-control.service` unit added to the host | Add service unit via Ansible playbook or manual install |
| /var/lib/mission-control/ | New | Directory created on lm-claw for SQLite DB and bundles | Create and set ownership in Ansible or startup script |
| OpenClaw agent tooling | Modified | Agents gain a new HTTP tool endpoint to POST pages | Document endpoint URL; no code change to OpenClaw core required |
| Tailscale network | None | Portal is accessed via existing Tailscale mesh; no new firewall rules needed | — |

---

## Testing Approach

### Unit Tests

- **Test runner:** Vitest with jsdom environment for React components.
- **Template registry:** Verify `resolveTemplate` returns the correct component and `null` for unknown IDs.
- **DailyPlan component:** Render with a fixture payload; assert section headings and items appear in the DOM.
- **Zod schemas:** Test that valid and invalid `CreatePageRequest` payloads pass/fail validation.
- **DB module (`server/db.ts`):** Test `insertPage`, `getPage`, `listPages`, and TTL expiry logic against an in-memory SQLite instance (`:memory:`).

### Integration Tests

- **Supertest against Express app:** Mount the Express app without starting a real HTTP listener.
  - `POST /api/pages` with valid payload → 201 with `id` and `url`.
  - `POST /api/pages` with missing `template` → 400.
  - `GET /api/pages` → 200, returns array.
  - `GET /api/pages/:id` for non-existent ID → 404.
- **Test database:** Each test file uses a fresh SQLite `:memory:` instance to avoid state leakage.

---

## Development Sequencing

### Build Order

1. **Project scaffold** — `npm create vite@latest mission-control -- --template react-ts`; install Express, better-sqlite3, zod, nanoid; configure `tsconfig.json` for shared types and server compilation; configure Vite proxy. No dependencies.

2. **Server foundation** (`server/index.ts`, `server/db.ts`) — Express app with `initDb()` on startup, WAL mode enabled, `pages` table created. Depends on step 1.

3. **Pages API routes** (`server/routes/pages.ts`) — `POST /api/pages` and `GET /api/pages` with Zod validation. Depends on step 2.

4. **React shell** (`src/App.tsx`, `src/components/Sidebar.tsx`) — React Router setup, Sidebar navigation, placeholder route outlets. Depends on step 1.

5. **DailyPlan template** (`src/templates/DailyPlan.tsx`) — Renders structured data from `Page.payload`; registered in the template registry. Depends on steps 3 and 4.

6. **AgentStatus dashboard** (`src/components/dashboards/AgentStatus.tsx`, `server/routes/agents.ts`) — `GET /api/agents` stub returning hardcoded data; client polls every 30 seconds via `usePolling` hook. Depends on steps 3 and 4.

7. **LinearTaskBoard dashboard** (`src/components/dashboards/LinearTaskBoard.tsx`) — Client-side Linear GraphQL fetch using API key from env. Depends on step 4.

8. **CSS & Mission Control aesthetic** — Global CSS variables, layout grid, component styles applied across all views. Depends on steps 4–7.

9. **Vitest + Supertest test suite** — Unit and integration tests for all server routes and React components. Depends on steps 2–7.

10. **Systemd service unit + Ansible task** — `mission-control.service` with `Restart=on-failure`; Ansible task in `home-lab/ansible/` to deploy and enable the service on lm-claw. Depends on steps 1–9.

### Technical Dependencies

- Node.js LTS available on lm-claw (already installed via NVM per `07-openclaw-deploy.yml`).
- Linear API key available as environment variable (`LINEAR_API_KEY`) for the LinearTaskBoard dashboard.
- `/var/lib/mission-control/` directory created with appropriate ownership before first run.

---

## Monitoring and Observability

- **Process health:** systemd tracks the service; `systemctl status mission-control` shows uptime and last restart.
- **Uptime Kuma (192.168.3.6):** Add an HTTP monitor for `http://lm-claw:3001` — an existing home lab tool already used for service monitoring.
- **Structured console logs:** Express uses `morgan` middleware in dev; production logs to `journald` via systemd. Log fields: method, path, status code, response time.
- **SQLite page count:** No alerting required for Phase 1. A future heartbeat task can query `SELECT COUNT(*) FROM pages WHERE expires_at < datetime('now')` to surface stale pages.

---

## Technical Considerations

### Key Decisions

- **Express as static file server:** Chosen for operational simplicity (one process) despite being less efficient than Nginx for static content. At home lab scale this is not a bottleneck.
- **SQLite over PostgreSQL:** Eliminates network dependency on the pve-inspiron node. Mission Control remains functional even if the Proxmox LXC cluster is down.
- **Polling over SSE/WebSockets for AgentStatus:** Simplest implementation for Phase 1; reduces server-side complexity. 30-second poll interval is acceptable for a status dashboard used by a single developer.
- **Vanilla CSS over Tailwind/CSS Modules:** Per PRD constraint. Use CSS custom properties (variables) for the "Mission Control" dark aesthetic; BEM naming convention for component classes to avoid collisions without a module system.

### Known Risks

- **Template rigidity:** If the DailyPlan schema evolves, old pages stored with the previous payload shape may fail to render. Mitigation: always store the raw payload and add a `schemaVersion` field; templates must handle missing fields gracefully with defaults.
- **Linear API key exposure:** Stored in `.env` and read by the browser via Vite's `VITE_LINEAR_API_KEY` env prefix, meaning it's embedded in the client bundle. Acceptable for an internal-only portal; the key has read-only Linear access.
- **Port conflict on lm-claw:** Port 3001 may already be used by Uptime Kuma's internal components. Verify and configure via `PORT` env var if needed.

---

## Architecture Decision Records

- [ADR-001: Adopt the Agentic Shell Approach](adrs/adr-001.md) — Use a central API-driven React portal with Tailscale access over decentralised agent rendering.
- [ADR-002: Node.js + Express as the API Backend](adrs/adr-002.md) — Single-language TypeScript stack with Express; one process per deployment over Go or a separate language backend.
- [ADR-003: SQLite for Dynamic Page Metadata Storage](adrs/adr-003.md) — Local SQLite file over PostgreSQL to eliminate network dependency on the pve-inspiron cluster.
- [ADR-004: Single-Port Vite + Express Serving Model](adrs/adr-004.md) — Express serves both the API and Vite static output on one port, removing CORS configuration and simplifying systemd deployment.
