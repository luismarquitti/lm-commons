# Idea — Agentic Development Workflow

## Problem

Luís develops several software projects in his WSL workspace alongside AI agents, but the
collaboration has no defined structure. There is no single source of truth for development
tasks, no isolation mechanism for working on multiple things in parallel, and no structured
review gate before code reaches the main branch. Each feature is handled ad-hoc, which makes
the process unrepeatable, hard to trace, and hard to delegate to agents.

## Vision

A documented, repeatable Spec-Driven Development (SDD) workflow in which Luís and AI agents
collaborate on his project repositories. A feature idea flows through a clear pipeline —
PRD → TechSpec → task breakdown → Linear → isolated execution → PR → agent review loop →
human merge — with traceability at every step.

## Current environment

- Workspace: `/home/luismarquitti` (WSL), the primary development and AI-interaction environment.
- `.ai-commons/`: central "Universal AI Commons" repo — 29+ skills (Compozy `cy-*`,
  `conductor-*`, `tlc-spec-driven`, `linear`, `openclaw-expert`), MCP configured for Context7
  and Linear.
- `home-lab/`: Proxmox/Ansible infrastructure; OpenClaw + Ollama running on node `lm-claw`
  (Dell Optiplex 7040).
- Project repos: `intellifinance/` (React/Node/Postgres/Prisma monorepo) and `ClinicCare/`
  (React 19/Firebase/Zustand SaaS) — both on GitHub, both already contain `.compozy/`.
- Obsidian vault: the personal knowledge management system, the home for durable knowledge
  and decisions.

## Desired workflow (target end state)

1. The user provides a feature or project idea.
2. Compozy skills elaborate the idea into a PRD, a TechSpec, and a task breakdown.
3. All tasks are registered in Linear (one project per repository).
4. From Linear, the user assigns agents to issues — locally or in the cloud — and can work in
   parallel on a separate issue. Git worktrees keep each unit of work isolated.
5. When an agent or the user finishes, they open a PR for review.
6. A specialized reviewer agent reviews the PR. If changes are needed, it leaves a comment
   requesting them; if everything is correct, it approves.
7. On requested changes, the developer agent applies them and requests a new review.
8. After the reviewer agent's final approval, the user gives final approval and merges.

## Tools and platforms in play

- Linear — central planning hub for development tasks.
- GitHub — code host; PRs are the review unit; Conventional Commits.
- Git worktrees — isolation for parallel work.
- Compozy `cy-*` skills — the SDD pipeline (`cy-create-prd`, `cy-create-techspec`,
  `cy-create-tasks`, `cy-execute-task`, `cy-review-round`, `cy-fix-reviews`).
- OpenClaw (node `lm-claw`) — target host for future autonomous agents, using the native Pi
  harness, OpenCode, or Gemini CLI.
- Open-source agent dashboards (PI Dashboard, Mission Control, ClawPort) — candidates for a
  future command center.
- Obsidian vault — record of useful knowledge and decisions.

## Constraints and boundaries

- Solo developer; no team-collaboration requirements.
- ClinicCare handles LGPD-sensitive data — it must not leak into agent contexts or external
  services.
- The consolidation of `.ai-commons` + `home-lab` into a single GitHub repository is a
  prerequisite handled separately; it is not part of this initiative.

## Scope intent

Start with a lean MVP: the local human+agent SDD workflow, piloted on IntelliFinance, with the
human in the loop triggering each step manually. Event-driven automation, cloud execution, the
second project, autonomous OpenClaw orchestration, and the command-center dashboard come in
later phases.
