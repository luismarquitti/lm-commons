---
status: pending
title: Systemd Service Unit & Ansible Deployment
type: infra
complexity: medium
dependencies:
  - task_03
  - task_08
  - task_09
---

# Task 10: Systemd Service Unit & Ansible Deployment

## Overview
Package Mission Control as a production systemd service on `lm-claw` and automate its deployment via an Ansible playbook in `lm-commons/home-lab/ansible/`. After this task, `http://lm-claw:3001` serves the fully built React portal and the API, managed by systemd with automatic restart on failure.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or window areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A `mission-control.service` systemd unit MUST be created with `Restart=on-failure`, `RestartSec=5`, and `Type=simple` (see TechSpec "Impact Analysis" and ADR-002).
- The service MUST run as the `luismarquitti` user (non-root) on `lm-claw`.
- The service MUST set `PORT=3001` and `DB_PATH=/var/lib/mission-control/data.db` as environment variables.
- An Ansible playbook `10-mission-control-deploy.yml` MUST be created in `lm-commons/home-lab/ansible/playbooks/` that: creates `/var/lib/mission-control/` with correct ownership, copies the built app to the target directory, installs the systemd unit, and enables + starts the service.
- The playbook MUST run `npm ci --production` on `lm-claw` after copying the app.
- The playbook MUST include an Uptime Kuma HTTP monitor task for `http://lm-claw:3001` (see TechSpec "Monitoring and Observability").
- After deployment, `systemctl status mission-control` on `lm-claw` MUST show `active (running)`.
- Node.js LTS MUST be available on `lm-claw` via NVM (already confirmed in TechSpec "Technical Dependencies").
</requirements>

## Subtasks
- [ ] 10.1 Create `lm-commons/mission-control/deploy/mission-control.service` systemd unit file.
- [ ] 10.2 Create `lm-commons/home-lab/ansible/playbooks/10-mission-control-deploy.yml` with directory creation, app copy, npm ci, and service installation tasks.
- [ ] 10.3 Add the Uptime Kuma monitor task to the playbook (HTTP check on `http://lm-claw:3001`).
- [ ] 10.4 Run the playbook against `lm-claw` and verify the service starts cleanly.
- [ ] 10.5 Confirm `POST /api/pages` works end-to-end via Tailscale from Luis's browser.

## Implementation Details
See TechSpec "Impact Analysis", "Monitoring and Observability", "Technical Dependencies", and ADR-002 for `Restart=on-failure` rationale. See existing playbook `07-openclaw-deploy.yml` in the same directory for patterns and variable conventions to follow.

The build artefact copied to `lm-claw` should be `dist/` (both `dist/client/` and `dist/server/`) plus `package.json`, `package-lock.json`, and `node_modules/` (production only). The service entry point is `node dist/server/index.js`.

The `/var/lib/mission-control/bundles/` directory must also be created even if unused in Phase 1 (reserved for Phase 2 static hosting escape hatch).

### Relevant Files
- `lm-commons/mission-control/deploy/mission-control.service` — to be created; systemd unit
- `lm-commons/home-lab/ansible/playbooks/10-mission-control-deploy.yml` — to be created; deployment playbook
- `lm-commons/home-lab/ansible/playbooks/07-openclaw-deploy.yml` — reference pattern for playbook structure
- `lm-commons/home-lab/ansible/inventory/hosts.yml` — inventory reference for `lm-claw` host
- `lm-commons/mission-control/package.json` (task_01) — `npm start` script must point to `node dist/server/index.js`

### Dependent Files
- `lm-commons/home-lab/ansible/playbooks/site.yml` — optionally import the new playbook here

### Related ADRs
- [ADR-002: Node.js + Express as the API Backend](adrs/adr-002.md) — single process, systemd `Restart=on-failure`
- [ADR-003: SQLite for Dynamic Page Metadata Storage](adrs/adr-003.md) — `/var/lib/mission-control/` directory ownership
- [ADR-004: Single-Port Vite + Express Serving Model](adrs/adr-004.md) — single port, single systemd unit

## Deliverables
- `mission-control/deploy/mission-control.service` — production-ready systemd unit.
- `home-lab/ansible/playbooks/10-mission-control-deploy.yml` — idempotent deployment playbook.
- Verification checklist below passing **(REQUIRED)**
- Integration tests for the deployed service **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Not applicable — infrastructure provisioning; verification checklist substitutes.
- Integration tests:
  - [ ] `ansible-playbook 10-mission-control-deploy.yml --check` runs without syntax errors.
  - [ ] After running the playbook, `systemctl is-active mission-control` on `lm-claw` returns `active`.
  - [ ] `curl http://lm-claw:3001/` returns HTTP 200.
  - [ ] `curl -X POST http://lm-claw:3001/api/pages` with a valid DailyPlan JSON payload returns 201 with `id` and `url`.
  - [ ] `systemctl restart mission-control` completes and the service returns to `active` state within 10 seconds.
  - [ ] `/var/lib/mission-control/` and `/var/lib/mission-control/bundles/` exist with correct ownership on `lm-claw`.
- Test coverage target: >=80% (verification checklist 100% required).
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80% (verification checklist 100% required).
- `systemctl status mission-control` shows `active (running)` on `lm-claw`.
- `http://lm-claw:3001` serves the React portal and is accessible via Tailscale.
- The Uptime Kuma monitor for `http://lm-claw:3001` shows UP status.
- An agent can POST a DailyPlan page and receive a valid URL that renders in the browser.
