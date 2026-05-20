# PRD — Agentic Development Workflow

## Overview

The Agentic Development Workflow is a defined, repeatable process — plus the conventions and
roles that support it — for a solo developer and AI agents to collaborate on software projects
using Spec-Driven Development (SDD).

**Problem.** The developer builds multiple projects alongside AI agents, but the collaboration
is unstructured: no single source of truth for tasks, no isolation for parallel work, and no
consistent review gate before code reaches the main branch. Work is handled ad-hoc, which makes
it unrepeatable, hard to trace, and hard to delegate.

**Who it is for.** The solo developer who orchestrates the work, and the AI agents — a
developer agent that implements tasks and a reviewer agent that reviews pull requests.

**Why it is valuable.** A defined workflow turns ad-hoc agent collaboration into a repeatable
pipeline with traceability from idea to merged change. It lets the developer safely run work in
parallel, delegate execution to agents with a clear definition of done, and keep a human
quality gate before anything merges.

## Goals

- Establish one documented, repeatable workflow that takes a feature from idea to merged PR.
- Make Linear the single source of truth for development tasks, with full traceability between
  a Linear issue, its spec artifacts, and its PR.
- Enable safe parallel work: the developer and an agent working on different issues at the
  same time without interference.
- Take at least one real IntelliFinance feature end-to-end through the workflow during the MVP,
  with no ad-hoc deviation.
- Produce a workflow definition precise enough that an agent can follow it unaided.

## User Stories

**Developer (orchestrator)**

- As the developer, I want to turn a feature idea into a PRD, TechSpec, and task breakdown
  through one guided process, so that work is well-specified before coding starts.
- As the developer, I want generated tasks registered in Linear automatically, so that I have
  one board to manage all work.
- As the developer, I want to assign a Linear issue to an agent and have it work in an isolated
  workspace, so that I can work on another issue in parallel without conflicts.
- As the developer, I want a final approval and merge gate, so that nothing reaches the main
  branch without my sign-off.
- As the developer, I want the workflow documented, so that any agent — or future me — can
  follow it without ambiguity.

**Developer agent**

- As a developer agent, I want a clear definition of done and a PR target for an assigned
  issue, so that I can deliver a reviewable change.
- As a developer agent, I want to know when a PR has requested changes, so that I can apply
  them and request a new review.

**Reviewer agent**

- As a reviewer agent, I want to review an open PR and post a structured verdict — request
  changes or approve — so that quality issues are caught before merge.

## Core Features

Grouped by priority for the MVP.

1. **Spec Pipeline (P0).** From a feature idea, produce a PRD, a TechSpec, and a task
   breakdown using the Compozy `cy-*` skills. Spec artifacts are versioned in the repository.
2. **Linear Task Registry (P0).** The task breakdown is registered as Linear issues in the
   repository's Linear project. Linear is the single board for picking up and tracking work.
3. **Isolated Parallel Workspaces (P0).** A git worktree convention so the developer and agents
   can each work on a different Linear issue at the same time without interfering.
4. **PR-Based Development Loop (P0).** A developer agent (or the developer) takes a Linear
   issue, implements it in an isolated workspace, and opens a PR linked back to the issue.
5. **Agent Review Gate (P0).** A reviewer agent reviews each open PR and posts a verdict:
   either a comment requesting specific changes, or an approval. On requested changes, the
   developer agent applies them and requests a new review.
6. **Human Merge Gate (P0).** After the reviewer agent approves, the developer gives final
   approval and merges the PR.
7. **Workflow Playbook (P0).** A documented, versioned definition of the workflow — roles,
   steps, conventions, and definition of done — that both the developer and agents follow.

**Interaction.** Features 1–2 feed the backlog; features 3–6 form the execution loop for one
issue; feature 7 is the contract that keeps every actor consistent.

## User Experience

**Personas and goals.** The developer wants throughput with control. The developer agent wants
an unambiguous task and target. The reviewer agent wants a reviewable, scoped change.

**Primary flow (MVP).**

1. The developer has a feature idea for IntelliFinance.
2. The developer runs the spec pipeline (`cy-create-prd` → `cy-create-techspec` →
   `cy-create-tasks`), reviewing and validating each artifact.
3. The resulting tasks are registered as issues in the IntelliFinance Linear project.
4. The developer picks an issue and assigns it to a developer agent (or takes it personally).
5. The agent creates an isolated worktree, implements the task, and opens a PR linked to the
   issue.
6. The developer triggers the reviewer agent on the PR.
7. The reviewer agent posts a verdict. If it requests changes, the developer triggers the
   developer agent to apply them; the loop repeats until the reviewer agent approves.
8. The developer gives final approval and merges. The Linear issue closes.

In the MVP every transition is triggered manually by the developer (human-in-the-loop).

**Onboarding and discoverability.** The Workflow Playbook is the single entry point: it
documents the roles, the steps, the conventions (one Linear project per repo, worktree naming,
Conventional Commits, PR-to-issue linking), and the definition of done. A per-repository
`AGENTS.md` points agents to the playbook.

## High-Level Technical Constraints

- Linear is the single source of truth for development tasks; each repository maps to exactly
  one Linear project.
- GitHub is the code host; the pull request is the unit of review; commits follow Conventional
  Commits.
- Git worktrees are the mechanism for isolated, parallel work.
- The Compozy `cy-*` skills anchor the spec pipeline; spec artifacts live under
  `.compozy/tasks/` in the repository.
- The Obsidian vault is the destination for durable knowledge and decisions worth keeping.
- Phase 3 autonomous agents must run on the existing OpenClaw infrastructure (node `lm-claw`).
- ClinicCare handles LGPD-sensitive data; it must not leak into agent contexts or external
  services.

These are boundaries, not implementation prescriptions.

## Non-Goals (Out of Scope)

- Consolidating `.ai-commons` and `home-lab` into a single GitHub repository — a separate
  Phase 0 infrastructure prerequisite, tracked independently.
- Building a custom command-center dashboard from scratch.
- Event-driven automatic agent reactions to repository state changes (deferred to Phase 2).
- Cloud agent execution (deferred to Phase 2).
- Fully autonomous orchestration on OpenClaw (deferred to Phase 3).
- Multi-user or team collaboration features — this is a solo-developer workflow.
- Replacing the Obsidian vault as the knowledge-management system.
- Provisioning or scaling the OpenClaw infrastructure itself (handled by the `home-lab`
  Ansible work).

## Phased Rollout Plan

### MVP (Phase 1) — Local human+agent SDD workflow, piloted on IntelliFinance

- Core features: Spec Pipeline, Linear Task Registry, Isolated Parallel Workspaces, PR-Based
  Development Loop, Agent Review Gate, Human Merge Gate, Workflow Playbook.
- Every transition is triggered manually by the developer.
- **Success criteria to proceed to Phase 2:** at least one real IntelliFinance feature taken
  from idea to merged PR through the workflow with no ad-hoc deviation; the developer and an
  agent demonstrably working two issues in parallel without conflict; the Workflow Playbook
  documented and followed.

### Phase 2 — Event-driven automation and second project

- Agents react automatically to repository state changes: a newly opened PR triggers the
  reviewer agent; a review comment requesting changes triggers the developer agent.
- Optional cloud agent execution.
- Roll the workflow out to the second project (ClinicCare).
- **Success criteria to proceed to Phase 3:** the review loop runs without manual triggering
  for a full feature; the workflow operates on both repositories.

### Phase 3 — Autonomous orchestration and command center

- Fully autonomous agents orchestrated on OpenClaw (node `lm-claw`) using the native Pi
  harness, OpenCode, or Gemini CLI.
- Adopt an existing open-source dashboard (PI Dashboard, Mission Control, or ClawPort) as the
  command center to visualize and manage running agents.
- **Long-term success criteria:** the developer can see and manage every running agent from
  one dashboard; autonomous agents carry features through the workflow with the developer
  acting only at the final merge gate.

## Success Metrics

- **Throughput:** time from feature idea to first opened PR.
- **Traceability:** percentage of tasks with a complete chain — Linear issue ↔ spec artifact
  ↔ PR.
- **Review efficiency:** average number of review cycles per PR.
- **Parallelism:** number of issues worked concurrently without merge conflicts or worktree
  collisions.
- **Repeatability:** number of features completed end-to-end through the workflow without
  ad-hoc deviation.
- **Delegability:** an agent can execute the workflow following only the Workflow Playbook,
  with no additional clarification.

## Risks and Mitigations

- **Workflow overhead outweighs solo-developer speed.** Mitigation: keep the MVP lean, keep the
  human in the loop, and apply YAGNI — defer automation and the dashboard to later phases.
- **Linear and GitHub drift out of sync.** Mitigation: enforce clear conventions — one Linear
  project per repository, PR-to-issue linking — and verify them in the Workflow Playbook.
- **Reviewer agent misses real defects.** Mitigation: keep a human final-approval gate before
  every merge; refine the reviewer's definition of done from observed misses.
- **Premature scope creep into automation or the dashboard.** Mitigation: the phased rollout
  with explicit per-phase success criteria gates expansion.
- **Tooling churn (Compozy, OpenClaw, Linear evolving).** Mitigation: depend on stable
  conventions and roles in the Workflow Playbook rather than on specific tool internals.
- **Adoption risk — the developer reverts to ad-hoc habits.** Mitigation: pilot on a single
  project to build the habit before broadening; measure repeatability explicitly.

## Architecture Decision Records

- [ADR-001: Phased rollout with a human-in-the-loop MVP](adrs/adr-001.md) — Ship a lean local
  workflow first; defer automation, cloud execution, autonomy, and the dashboard to later
  phases.
- [ADR-002: Compozy `cy-*` skills as the SDD framework](adrs/adr-002.md) — Anchor the spec
  pipeline on the Compozy `cy-*` skills rather than `tlc-spec-driven`.
- [ADR-003: Pilot on IntelliFinance; repo unification out of scope](adrs/adr-003.md) — Pilot
  the workflow on one project, IntelliFinance, and exclude the `.ai-commons` + `home-lab`
  repository consolidation from this initiative.
- [ADR-004: Adopt an existing open-source dashboard in Phase 3](adrs/adr-004.md) — Adopt a
  proven open-source command center instead of building one.

## Open Questions

- Which open-source dashboard (PI Dashboard, Mission Control, or ClawPort) best fits the
  command-center role — to be decided when Phase 3 is scoped.
- How exactly Linear issues map to and stay synchronized with Compozy task artifacts — a
  TechSpec-level concern, flagged here for traceability.
- Which provider or mechanism backs cloud agent execution in Phase 2.
- Whether the OpenClaw RAM constraint on node `lm-claw` must be resolved before Phase 3
  autonomous orchestration can begin.
