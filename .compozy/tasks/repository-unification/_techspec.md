# TechSpec — Repository Unification (Phase 0)

> Note: this is an infrastructure and automation effort, not a software service. The canonical
> template's software-oriented sections are adapted accordingly — "Core Interfaces" describes
> CLI/script contracts, "API Endpoints" is not applicable, and "Data Models" describes the
> repository layout.

## Executive Summary

This spec describes consolidating `~/.ai-commons` (the unversioned AI-artifact SSOT) and the
standalone `home-lab` git repository into a single private monorepo, `lm-commons`, at
`~/lm-commons`, with `ai-commons/` and `home-lab/` as top-level directories. `home-lab`'s
history is brought in with `git subtree add`. Artifact distribution to `~/.claude`, `~/.agents`,
and `~/.gemini` moves from today's manual symlinks to GNU Stow packages. All secrets move into
the developer's Bitwarden vault, retrieved at run time through the free `bw` CLI; Ansible Vault
is retained for at-rest encryption, with its password sourced from Bitwarden instead of the
on-disk `.vault_pass`.

The primary trade-off: the migration is a coordinated, one-time cut-over that briefly touches
the live environment (moving the SSOT path and re-pointing every consumer). We accept that
short-lived disruption in exchange for a clean final state with one canonical path, no legacy
aliases, and a single declarative distribution mechanism. An idempotent bootstrap script and an
environment verification script bound the risk.

## System Architecture

### Component Overview

1. **The `lm-commons` repository** — a private GitHub repo at `~/lm-commons` holding two
   domains plus repo-level files (`README.md`, `.gitignore`, `.stow-local-ignore`).
2. **`ai-commons/` SSOT** — the migrated content of `~/.ai-commons`: `agents/`, `config/`,
   `instructions/`, `memory-templates/`, `scripts/`, `skills/`, `stow-packages/`.
3. **`home-lab/` domain** — the imported `home-lab` repository (history preserved), unchanged
   in internal structure.
4. **Stow packages** — under `ai-commons/stow-packages/`, one package per tool target
   (`claude`, `agents`, `gemini`); each mirrors the `$HOME`-relative path and references SSOT
   content. GNU Stow materializes the symlinks into `~`.
5. **Setup & distribution tooling** — scripts under `ai-commons/scripts/`: `bootstrap.sh`,
   `verify-env.sh`, `secrets.sh`, `ansible-vault-pass.sh`, and the updated `sync-mcp.py`.
6. **Secrets layer** — the Bitwarden vault accessed via `bw`; `secrets.sh` is the single
   retrieval interface used by config generation and by Ansible.

**Data flow.** `bootstrap.sh` → installs Stow, stows packages → symlinks appear in
`~/.claude|.agents|.gemini`. `sync-mcp.py` → calls `secrets.sh` → `bw` → writes resolved tool
configs. Ansible → `ansible.cfg` `vault_password_file` → `ansible-vault-pass.sh` → `secrets.sh`
→ `bw` → decrypts `vault.yml`.

**External interactions.** GitHub (private repo host), Bitwarden (secret store), GNU Stow
(local symlink manager).

## Implementation Design

### Core Interfaces

The "interfaces" of this infra task are CLI/script contracts that other components depend on.

```sh
# secrets.sh — single retrieval interface for all secrets (wraps `bw`)
#   secrets_get <item-name> [field]
#     stdout: secret value; exit 0 on success
#     exit 1 if the Bitwarden vault is locked or the item is missing
secrets_get "context7-api-key"
secrets_get "ansible-vault" password

# ansible-vault-pass.sh — executable vault-password file
#   referenced by ansible.cfg:  vault_password_file = scripts/ansible-vault-pass.sh
#   stdout: the Ansible Vault password (delegates to secrets_get)

# bootstrap.sh — idempotent environment setup
#   bootstrap.sh [--check]
#     installs GNU Stow if missing; stows packages into $HOME;
#     regenerates tool configs via sync-mcp.py; runs verify-env.sh
#     --check: verify only, make no changes

# verify-env.sh — environment health check
#   exit 0 if every expected symlink resolves and every config is present;
#   exit 1 listing each broken symlink, missing config, or plaintext secret
```

All scripts resolve their paths relative to their own location inside the repository, so they
are independent of where `lm-commons` is checked out.

### Data Models

The "data model" is the target repository layout:

```
lm-commons/                         private GitHub repo, ~/lm-commons
├── README.md
├── .gitignore                      repo-wide ignore (secrets, generated configs)
├── .stow-local-ignore              keeps repo metadata out of Stow
├── ai-commons/
│   ├── agents/
│   ├── config/
│   │   └── mcp/master_config.json  Context7 key = placeholder, not the real value
│   ├── instructions/
│   ├── memory-templates/
│   ├── scripts/
│   │   ├── bootstrap.sh
│   │   ├── verify-env.sh
│   │   ├── secrets.sh
│   │   ├── ansible-vault-pass.sh
│   │   └── sync-mcp.py             updated: resolves secrets via secrets.sh
│   ├── skills/
│   └── stow-packages/
│       ├── claude/   → .claude/...
│       ├── agents/   → .agents/...
│       └── gemini/   → .gemini/...
└── home-lab/                       git subtree import, 11 commits preserved
    └── ansible/ ...                unchanged internal structure
```

Secret items expected in the Bitwarden vault: `ansible-vault` (password field), plus loose-key
items such as `context7-api-key`, `github-token`, `gemini-api-key`.

### API Endpoints

Not applicable — this effort exposes no network API. Integration happens through the `bw` CLI,
GNU Stow, and git.

## Integration Points

- **Bitwarden** — purpose: secret store. Auth: interactive `bw login` once per machine, then a
  `BW_SESSION` token from `bw unlock`; automation uses a dedicated least-privilege session.
  Error handling: `secrets.sh` exits non-zero and prints a clear message if the vault is locked
  or an item is missing; callers fail loudly rather than proceeding with empty secrets.
- **GitHub** — purpose: private remote for `lm-commons`. The repo is created private; the first
  push happens only after the secrets audit passes.
- **GNU Stow** — purpose: symlink distribution. Installed by `bootstrap.sh` if absent; a Stow
  dry-run precedes the real run to surface conflicts.

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|----------------------|-----------------|
| `~/.ai-commons` | deprecated | Path removed; all consumers must move to `~/lm-commons/ai-commons`. Risk: medium — missed references break silently. | Re-point consumers; grep for `.ai-commons`; remove after verification. |
| `~/.claude`,`~/.agents`,`~/.gemini` symlinks | modified | Manual symlinks replaced by Stow-managed symlinks pointing at the new path. Risk: medium. | Remove old symlinks; stow packages; verify. |
| `home-lab` (standalone repo) | deprecated | Becomes a subdirectory of `lm-commons`; remote archived, local copy removed after verification. Risk: low. | Finalize feature branch; subtree import; verify; archive. |
| `ai-commons/scripts/sync-mcp.py` | modified | Must resolve the Context7 key via `secrets.sh` and use repo-relative paths. Risk: low. | Update path handling and secret resolution. |
| `ansible.cfg` / `.vault_pass` | modified | `.vault_pass` removed; `vault_password_file` points to `ansible-vault-pass.sh`. Risk: medium — broken playbook runs. | Add directive; test `ansible-vault view`. |
| MCP master config | modified | Plaintext Context7 key replaced by a placeholder. Risk: low. | Replace value; store real key in Bitwarden. |
| `stow-packages/` | new | Empty scaffold replaced by real per-tool packages. Risk: low. | Build `claude`, `agents`, `gemini` packages. |
| New scripts (`bootstrap.sh`,`verify-env.sh`,`secrets.sh`,`ansible-vault-pass.sh`) | new | New tooling under `ai-commons/scripts/`. Risk: low. | Author and test. |

## Testing Approach

### Unit Tests

- `secrets.sh`: returns a value for an existing item; exits non-zero for a missing item and for
  a locked vault. Bitwarden is mocked by a stub `bw` on `PATH` for these checks.
- `ansible-vault-pass.sh`: prints exactly the password on stdout, nothing else.
- Path resolution: each script resolves correctly when invoked from any working directory.
- `bootstrap.sh --check` and `verify-env.sh`: detect a deliberately broken symlink and a
  deliberately planted plaintext secret.

### Integration Tests

- **Stow distribution:** run `bootstrap.sh` in a scratch `$HOME`; confirm `~/.claude`,
  `~/.agents`, `~/.gemini` symlinks resolve into `ai-commons/`.
- **Secrets end-to-end:** with the vault unlocked, `sync-mcp.py` produces tool configs carrying
  the real Context7 key while the repo copy keeps the placeholder.
- **Ansible:** `ansible-vault view inventory/group_vars/all/vault.yml` succeeds using the
  Bitwarden-backed password client; a smoke playbook (`--check`) runs.
- **History:** after the subtree import, `git log -- home-lab/` shows the 11 original commits.
- **Secret scan:** a repo-wide scan finds no plaintext API key, token, or vault password before
  the first push.

## Development Sequencing

### Build Order

1. **Finalize `home-lab`** — commit and merge `feat/openclaw-bare-metal` into `main` in the old
   repository. No dependencies.
2. **Initialize `lm-commons`** — create `~/lm-commons`, `git init`, add `README.md`,
   `.gitignore`, `.stow-local-ignore`. Depends on nothing.
3. **Migrate `ai-commons/`** — move `~/.ai-commons` content into `lm-commons/ai-commons/`.
   Depends on step 2.
4. **Import `home-lab/`** — `git subtree add --prefix=home-lab` from the finalized source;
   verify 11 commits. Depends on steps 1 and 2.
5. **Author `secrets.sh`** — the Bitwarden retrieval interface. Depends on step 3.
6. **Bitwarden onboarding** — create vault items for the Ansible Vault password and loose keys;
   replace the MCP master config key with a placeholder. Depends on step 5.
7. **Author `ansible-vault-pass.sh` and wire `ansible.cfg`** — set `vault_password_file`; remove
   `.vault_pass`. Depends on steps 5 and 6.
8. **Update `sync-mcp.py`** — repo-relative paths; resolve the Context7 key via `secrets.sh`.
   Depends on steps 5 and 6.
9. **Build Stow packages** — author `claude`, `agents`, `gemini` packages under
   `stow-packages/`. Depends on step 3.
10. **Author `bootstrap.sh` and `verify-env.sh`** — install Stow, stow packages, regenerate
    configs, verify. Depends on steps 8 and 9.
11. **Re-point consumers** — remove old manual symlinks, run `bootstrap.sh`, grep for stale
    `.ai-commons` references and fix them. Depends on step 10.
12. **Secrets audit** — repo-wide scan; confirm no plaintext secret. Depends on steps 6–11.
13. **First push** — create the private GitHub repo and push. Depends on step 12.
14. **Decommission** — verify, then archive the remote `home-lab` repo and remove the local
    `home-lab` directory and `~/.ai-commons`. Depends on step 13.

### Technical Dependencies

- GNU Stow must be installable (`bootstrap.sh` handles it).
- The Bitwarden vault must be reachable and unlockable for steps 6–8 and verification.
- A GitHub account for the new private repository.

## Monitoring and Observability

A one-time consolidation, so observability is intentionally minimal:

- `verify-env.sh` is the ongoing health check — run on demand after any environment change; it
  reports broken symlinks, missing configs, and plaintext secrets.
- `bootstrap.sh --check` gives a non-mutating status read.
- No metrics pipeline or alerting; output is the scripts' exit codes and stderr messages.

## Technical Considerations

### Key Decisions

- **Decision:** GNU Stow for distribution. **Rationale:** declarative, purpose-built, matches
  the PRD. **Trade-off:** adds a tool dependency. **Rejected:** hand-rolled symlink script;
  hybrid. (ADR-005)
- **Decision:** `git subtree add` for the history import. **Rationale:** one-command history
  preservation. **Trade-off:** one synthetic merge commit. **Rejected:** `git-filter-repo`.
  (ADR-006)
- **Decision:** layered secrets — Bitwarden over a retained Ansible Vault. **Rationale:** removes
  plaintext with minimal change. **Trade-off:** two mechanisms coexist. **Rejected:** replacing
  Ansible Vault with `bw` lookups. (ADR-007)
- **Decision:** re-point all consumers, no compatibility symlink. **Rationale:** one canonical
  path, no hidden indirection. **Trade-off:** must find every reference. **Rejected:**
  `~/.ai-commons` compatibility symlink. (ADR-008)

### Known Risks

- **A stale `~/.ai-commons` reference is missed.** Likelihood: medium. Mitigation: grep the
  workspace before removal; `verify-env.sh` fails loudly on unresolved symlinks.
- **Stow refuses to symlink over an existing file.** Likelihood: medium. Mitigation:
  `bootstrap.sh` removes prior manual symlinks and runs a Stow dry-run first.
- **The Bitwarden vault is locked during an automated run.** Likelihood: medium. Mitigation: a
  dedicated least-privilege session; availability checked before deploys; scripts fail loudly.
- **Subtree import loses history if the feature branch is not finalized.** Likelihood: low.
  Mitigation: finalizing the branch is build-order step 1; commit count verified after import.
- **A secret is pushed despite the audit.** Likelihood: low. Mitigation: placeholder in the
  master config, generated configs gitignored, repo-wide scan gating the first push.

## Architecture Decision Records

- [ADR-001: Single monorepo with domain top-level directories](adrs/adr-001.md) — One repo with `ai-commons/` and `home-lab/` at the top level.
- [ADR-002: Preserve `home-lab` commit history via subtree import](adrs/adr-002.md) — Keep the existing history rather than starting fresh.
- [ADR-003: Complete artifact migration into the SSOT before unifying](adrs/adr-003.md) — Consolidate scattered artifacts first.
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md) — Store all secrets in the existing Bitwarden vault.
- [ADR-005: Adopt GNU Stow as the artifact distribution mechanism](adrs/adr-005.md) — Real Stow packages replace manual symlinks.
- [ADR-006: Import `home-lab` history via `git subtree add`](adrs/adr-006.md) — One-command history preservation under `home-lab/`.
- [ADR-007: Layered secrets — Bitwarden over a retained Ansible Vault](adrs/adr-007.md) — Bitwarden holds the vault password and loose keys; Ansible Vault stays for at-rest encryption.
- [ADR-008: Re-point all consumers to the new path; no compatibility symlink](adrs/adr-008.md) — One canonical path, no legacy alias.
