# TechSpec — Agentic Development Workflow

## Executive Summary

The Agentic Development Workflow (ADW) provides a structured, repeatable pipeline for collaboration between a solo developer and AI agents using Spec-Driven Development (SDD). It anchors all development tasks in Linear as the Single Source of Truth (SSOT) and leverages git worktrees to enable safe, parallel implementation by agents in isolated environments.

The implementation strategy focuses on extending the existing `linear` skill in `ai-commons` to bridge Compozy task files (`task_NN.md`) with Linear issues, and establishing a centralized Workflow Playbook to govern agent behavior. The primary technical trade-off is favoring human-triggered transitions (via slash commands) in Phase 1 to minimize architectural complexity while ensuring high-quality human oversight.

## System Architecture

### Component Overview

- **Extended Linear Skill (`ai-commons`)**: Acts as the integration layer between the local repository's `.compozy/tasks/` artifacts and the Linear API. It handles the idempotent creation and mapping of issues.
- **Git Worktree Manager (Agent-side)**: A set of conventions and tool capabilities that allow developer agents to provision and clean up their own isolated workspaces.
- **Workflow Playbook (`ai-commons`)**: A centralized set of instructions (SSOT) that defines the protocol for all actors (Developer, Developer Agent, Reviewer Agent).
- **PR Review Trigger**: A manual mechanism (slash command) to invoke the Reviewer Agent on a specific Pull Request.

### Data Flow

1. **Spec Generation**: `cy-create-prd` → `cy-create-techspec` → `cy-create-tasks` (standard Compozy flow).
2. **Task Sync**: `linear.sync-compozy-tasks` tool reads `task_NN.md` files, creates/updates Linear issues, and writes back `linear_issue_id` to frontmatter.
3. **Execution**: Developer Agent picks a Linear issue, creates a sibling worktree `../worktrees/<repo>-<id>-<slug>`, and implements the task.
4. **Review**: Developer triggers `/review`; Reviewer Agent evaluates the PR and posts a verdict.
5. **Merge**: Human reviews approval and merges; Agent deletes the worktree.

## Implementation Design

### Core Interfaces

The following interface (represented as an MCP tool signature) will be added to the `linear` skill:

```typescript
/**
 * Synchronizes Compozy task files with Linear issues.
 * @param taskDir The absolute path to the .compozy/tasks/<name> directory.
 * @param teamId The Linear Team ID to sync with.
 * @param projectId (Optional) The Linear Project ID to associate issues with.
 */
interface SyncCompozyTasks {
  taskDir: string;
  teamId: string;
  projectId?: string;
}
```

The Worktree management will be implemented as a set of `git` command sequences followed by agents:

```bash
# Provisioning
git worktree add ../worktrees/repo-CLE-123-slug feature-branch

# Cleanup (after merge)
git worktree remove ../worktrees/repo-CLE-123-slug
git branch -d feature-branch
```

### Data Models

**Task Frontmatter (YAML)**:
```yaml
status: pending | in-progress | completed
title: string (Conventional Commit format)
type: frontend | backend | docs | test | infra | refactor | chore | bugfix
complexity: low | medium | high | critical
dependencies: string[]
linear_issue_id: string (e.g., "CLE-123")
```

## Integration Points

### Linear API
- **Purpose**: Task tracking and project management.
- **Auth**: API Key managed via Linear MCP server.
- **Strategy**: Use `create_issue` and `update_issue` tools.

### GitHub
- **Purpose**: Code hosting and Pull Requests.
- **Integration**: Linking PRs to Linear issues via descriptions (e.g., "Fixes CLE-123").

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `linear` skill | Modified | New sync tool and updated instructions. Low risk. | Implement `sync-compozy-tasks`. |
| `ai-commons` | New | Addition of centralized Playbook. Low risk. | Create `instructions/workflow/PLAYBOOK.md`. |
| Developer Agent | Modified | Instructions to manage worktree lifecycle. Medium risk of "ghost" worktrees. | Update system prompt/skill instructions. |

## Testing Approach

### Unit Tests
- **Sync Logic**: Verify that parsing multiple `task_NN.md` files correctly identifies new vs. existing issues based on the presence of `linear_issue_id`.
- **Frontmatter Update**: Ensure that writing back the ID does not corrupt the markdown content or existing YAML fields.

### Integration Tests
- **End-to-End Pilot**: Run the full pipeline on a dummy project to verify:
    1. Tasks are created in Linear.
    2. Worktree is created correctly as a sibling.
    3. PR is opened and linked to the issue.
    4. Reviewer agent responds to `/review`.

## Development Sequencing

### Build Order

1. **Centralized Playbook [ADR-007]**: Establish the rules of engagement in `ai-commons`.
2. **Extended Linear Skill [ADR-005]**: Implement the `sync-compozy-tasks` tool.
3. **Worktree Conventions [ADR-006, ADR-010]**: Update agent instructions for worktree management.
4. **Review Trigger [ADR-009]**: Document the `/review` protocol.
5. **Traceability [ADR-008]**: Ensure the sync tool updates task files correctly.

## Technical Considerations

### Key Decisions

- **Decision**: Extend existing `linear` skill instead of creating a new one.
- **Rationale**: Reuses authentication and core Linear interaction logic.
- **Trade-offs**: Slightly more complex skill definition.

- **Decision**: Manual `/review` trigger.
- **Rationale**: Keeps the MVP simple and ensures human-in-the-loop control.
- **Trade-offs**: Requires manual developer action for every review.

## Architecture Decision Records

- [ADR-001: Phased rollout with a human-in-the-loop MVP](adrs/adr-001.md) — Ship a lean local workflow first.
- [ADR-002: Compozy `cy-*` skills as the SDD framework](adrs/adr-002.md) — Anchor the spec pipeline on Compozy.
- [ADR-003: Pilot on IntelliFinance; repo unification out of scope](adrs/adr-003.md) — Pilot on one project.
- [ADR-004: Adopt an existing open-source dashboard in Phase 3](adrs/adr-004.md) — Defer custom dashboard.
- [ADR-005: Extended Linear Skill for Task Synchronization](adrs/adr-005.md) — Bridge Compozy tasks and Linear issues.
- [ADR-006: Sibling Directory Worktree Convention](adrs/adr-006.md) — Isolate parallel work in sibling folders.
- [ADR-007: Centralized Workflow Playbook in AI Commons](adrs/adr-007.md) — SSOT for workflow documentation.
- [ADR-008: Bi-directional Traceability via YAML Frontmatter](adrs/adr-008.md) — Link local tasks to Linear IDs.
- [ADR-009: Slash Command Trigger for PR Reviews](adrs/adr-009.md) — Simple manual trigger for the reviewer agent.
- [ADR-010: Agent-Managed Worktree Lifecycle](adrs/adr-010.md) — Automate provisioning and cleanup of workspaces.
