# PRD — Repository Unification (Phase 0)

## Overview

Phase 0 consolidates the developer's scattered, mostly-unversioned AI artifacts and environment
configuration into a single private, version-controlled GitHub repository.

**Problem.** `.ai-commons/` — the SSOT for AI skills, agents, instructions, and MCP config — is
not a git repository: no version history, no backup, no recovery. AI artifacts also live
unversioned in `.claude/`, `.agents/`, and `.gemini/`. Meanwhile `home-lab/` is versioned in
its own separate GitHub repository. There is no single place to record changes and back up
this body of work. Compounding this, API keys, tokens, and passwords — for GitHub, the Gemini
API, Context7, and Ansible playbook credentials — are scattered across config files and
playbooks, some in plaintext, with no single secure store.

**Who it is for.** The solo developer who owns and evolves these artifacts, and — downstream —
the AI agents that consume them.

**Why it is valuable.** One versioned repository gives change history, off-machine backup, and
a stable foundation for the Agentic Development Workflow, which depends on a unified versioned
base. Phase 0 is the explicit prerequisite for the `agentic-dev-workflow` initiative.

## Goals

- Consolidate `.ai-commons` and `home-lab` into one private GitHub repository.
- Bring every currently-unversioned AI artifact under version control.
- Complete the migration of scattered artifacts (`.claude`, `.agents`, `.gemini`) into the SSOT
  before unifying.
- Preserve `home-lab`'s commit history.
- Keep the working environment fully functional after unification.
- Guarantee no secrets are committed to the repository.
- Establish a single secrets-management workflow so that no API key, token, or password is
  stored in plaintext in the repository, in configs, or on disk.

## User Stories

- As the developer, I want all my AI artifacts and infra config in one versioned repo, so that
  I have change history and an off-machine backup.
- As the developer, I want scattered artifacts consolidated into the SSOT, so that there is one
  authoritative copy of each.
- As the developer, I want `home-lab`'s commit history preserved, so that past infrastructure
  decisions are not lost.
- As the developer, I want my environment to keep working after unification, so that
  consolidation does not disrupt daily work.
- As the developer, I want confidence that no secrets reach GitHub, so that the repository is
  safe to host remotely.
- As the developer, I want every API key, token, and password stored in my Bitwarden vault and
  resolved on demand, so that no secret lives in plaintext in the repository or on disk.
- As the developer, I want Ansible playbooks to pull credentials from the vault at run time, so
  that homelab secrets are never written into the repository.
- As an AI agent, I want SSOT artifacts available at predictable locations, so that I can
  consume skills and config without disruption.

## Core Features

1. **Artifact Consolidation (P0).** Migrate scattered AI artifacts from `.claude/`, `.agents/`,
   and `.gemini/` into the `.ai-commons` SSOT, deduplicating by keeping the most complete and
   recent version of each.
2. **Unified Repository (P0).** A single private GitHub repository with `ai-commons/` and
   `home-lab/` as top-level directories and one forward commit history.
3. **History Preservation (P0).** `home-lab`'s existing commit history is imported into the
   unified repository rather than discarded.
4. **Stow Distribution Continuity (P0).** GNU Stow packages are reconfigured so artifacts still
   reach `~/.claude`, `~/.agents`, and `~/.gemini` from the new repository location; the live
   environment is validated as working.
5. **Secrets Hygiene (P0).** An audit locates every secret (vault passwords, API keys, tokens,
   credentials) across the repository and configs, moves it into the secrets manager, and puts
   ignore rules in place; the repository is verified clean before the first push. A known
   instance: the Context7 API key stored in plaintext in the MCP master config
   (`ai-commons/config/mcp/master_config.json`) and its identical Antigravity copy.
6. **Unified Secrets Management (P0).** A single secrets store — the developer's existing
   Bitwarden vault, accessed through the free Bitwarden CLI (`bw`) — holds every API key,
   token, and password. The repository, tool configs, and Ansible playbooks reference secrets
   and resolve them from the vault at run time; no secret is stored in plaintext.
7. **Repository Documentation (P1).** A README describing the repository layout, the SSOT
   model, how Stow distribution works, and how secrets are resolved from the vault.

## User Experience

**Persona and goal.** The solo developer wants every artifact in one place with a safety net,
without breaking the environment he works in every day.

**Journey.** Today the developer edits artifacts across scattered, unversioned locations with
no history and no backup. After Phase 0 there is one repository: `git` records every change and
GitHub holds the backup. The developer works in the unified repo; Stow keeps the live
environment in sync; a README onboards future-self or an agent.

**One-time consolidation flow.**

1. Migrate stray artifacts from `.claude`/`.agents`/`.gemini` into the `.ai-commons` SSOT,
   deduplicating.
2. Create the unified repository structure with `ai-commons/` and `home-lab/` top-level
   directories.
3. Import `home-lab`'s commit history into the unified repository.
4. Reconfigure Stow distribution from the new location and validate the environment.
5. Run the secrets audit and set ignore rules.
6. Push to a new private GitHub repository; archive the old `home-lab` repository.
7. Write the README.

## High-Level Technical Constraints

- The unified repository is named `lm-commons` and lives on disk at `~/lm-commons`; `.ai-commons`
  content moves into it under the `ai-commons/` directory.
- The unified GitHub repository must be private; it contains environment configuration and
  references to sensitive infrastructure.
- Distribution to `~/.claude`, `~/.agents`, and `~/.gemini` continues via GNU Stow; the live
  environment must remain functional throughout.
- The `.ai-commons` SSOT directory structure (skills, agents, instructions, memory-templates,
  config, scripts, stow-packages) is preserved.
- `home-lab`'s commit history must be retained.
- No secrets — vault passwords, tokens, credentials — may be committed.
- All secrets are stored in the developer's existing Bitwarden vault and retrieved through the
  free Bitwarden CLI (`bw`); the repository, tool configs, and Ansible playbooks reference
  secrets and resolve them at run time, never storing them in plaintext.
- One repository with a single forward commit history; no git submodules.

## Non-Goals (Out of Scope)

- The Agentic Development Workflow itself — covered by the separate `agentic-dev-workflow` PRD.
- Restructuring or refactoring the content of skills, agents, or Ansible playbooks — this is
  consolidation, not redesign.
- Migrating the Obsidian vault into the repository — the PKM stays separate.
- Migrating the project repositories (`intellifinance`, `ClinicCare`) — they remain
  independent.
- Setting up CI/CD for the unified repository.
- Public release or open-sourcing of any artifact.
- Self-hosting a Bitwarden or Vaultwarden server — the developer's existing Bitwarden account
  is used as-is.

## Phased Rollout Plan

### MVP (Phase 1) — Consolidate, version, and keep the environment working

- Core features: Artifact Consolidation, Unified Repository, History Preservation, Stow
  Distribution Continuity, Secrets Hygiene, Unified Secrets Management.
- **Success criteria to proceed to Phase 2:** the unified repository exists on GitHub as
  private; `home-lab` history is present; the live environment is validated functional with
  Stow distribution from the new location; every secret is stored in the Bitwarden vault and
  resolved at run time; the secrets audit confirms no plaintext secret remains in the
  repository or configs.

### Phase 2 — Documentation and decommissioning

- Write the repository README and layout documentation.
- Archive the old `luismarquitti/home-lab` repository to prevent split-brain commits.
- **Success criteria to proceed to Phase 3:** a new reader or agent can understand the
  repository from the README; the old `home-lab` repo is archived/read-only.

### Phase 3 — Cleanup and single-source verification

- Remove redundant legacy artifact copies left behind after migration.
- Remove the local `home-lab/` directory once its content and history are verified present in
  the unified repository.
- Confirm Stow is the only distribution path.
- **Long-term success criteria:** no duplicate unversioned artifact copies remain; the unified
  repository is the confirmed single source of truth.

## Success Metrics

- **Coverage:** 100% of AI artifacts and `home-lab` content under version control in one
  repository.
- **Secret safety:** zero secrets committed, confirmed by audit.
- **Secret centralization:** every API key, token, and password resolves from the Bitwarden
  vault; zero plaintext secrets remain in the repository, configs, or playbooks.
- **Environment integrity:** all Stow-distributed artifacts resolve correctly after migration.
- **History retention:** `home-lab` commit history preserved (commit count matches).
- **Deduplication:** scattered/duplicate artifact copies reduced to zero.
- **Recoverability:** the full environment can be restored from the GitHub repository on a
  fresh machine.

## Risks and Mitigations

- **Migration breaks the live environment (broken symlinks, missing artifacts).** Mitigation:
  environment validation is an explicit MVP success criterion; consolidate incrementally.
- **Secrets accidentally pushed to GitHub.** Mitigation: secrets audit and ignore rules before
  the first push; the repository is private.
- **Loss of `home-lab` history during the merge.** Mitigation: import history via subtree;
  verify commit history after import.
- **Deduplication keeps the wrong version of an artifact.** Mitigation: compare before merging,
  keep the most complete/recent, and have the developer review dedup decisions.
- **The old `home-lab` repo stays active and causes split-brain commits.** Mitigation: archive
  the old repository in Phase 2.
- **Runtime dependency on the Bitwarden vault.** Automated runs — especially Ansible playbooks
  — need the vault unlocked and reachable. Mitigation: use a dedicated, least-privilege CLI
  session for automation and confirm vault availability before deploys; the desktop and mobile
  apps provide fallback access.
- **Scope creep into refactoring artifact content.** Mitigation: an explicit Non-Goal —
  consolidation only, no redesign.

## Architecture Decision Records

- [ADR-001: Single monorepo with domain top-level directories](adrs/adr-001.md) — One
  repository with `ai-commons/` and `home-lab/` at the top level, rejecting a flat repo and git
  submodules.
- [ADR-002: Preserve `home-lab` commit history via subtree import](adrs/adr-002.md) — Import
  the existing history into the unified repository rather than starting fresh.
- [ADR-003: Complete artifact migration into the SSOT before unifying](adrs/adr-003.md) —
  Consolidate scattered `.claude`/`.agents`/`.gemini` artifacts first so the repository is born
  complete.
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md) — Store
  all secrets in the developer's existing Bitwarden vault, accessed programmatically through
  the free Bitwarden CLI, rather than adopting an in-repo or self-hosted alternative.

## Open Questions

All initial open questions are resolved:

- **Repository name:** `lm-commons`.
- **On-disk location:** `~/lm-commons` — a new directory; `.ai-commons` content moves into it
  under `ai-commons/`.
- **Old `home-lab` repository:** the remote `luismarquitti/home-lab` repository is archived
  (read-only) after the import is verified; the local `home-lab/` directory may then be removed
  once its content and history are confirmed present in the unified repository (Phase 3).
- **`.gemini/antigravity` MCP config:** it is byte-identical to the SSOT master config, so it
  is converted to a GNU Stow symlink pointing at the master rather than kept as a separate
  copy. If the two have diverged by migration time, they are merged first.

Verification finding (feeds Secrets Hygiene): the MCP master config — and its identical
Antigravity copy — stores a Context7 API key in plaintext. The secrets audit must move this key
into the Bitwarden vault and out of version control before the first push.
