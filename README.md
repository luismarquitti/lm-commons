# lm-commons

Unified private monorepo for AI-artefact SSOT and home-lab infrastructure.

## Repository Layout

- `ai-commons/`: AI-artefact Single Source of Truth (SSOT).
- `home-lab/`: Infrastructure as Code for the MQT_Home Lab (via git subtree).

## Distribution Model

We use **GNU Stow** to distribute artefacts from `ai-commons/stow-packages/` directly to the $HOME directory. This replaces the legacy manual symlink model.

## Secrets Management

Secrets are managed via **Bitwarden** and retrieved through `ai-commons/scripts/secrets.sh`. No live secrets are stored in the repository. Ansible is wired to Bitwarden via `vault-client.sh`.

## Bootstrapping

Run `ai-commons/scripts/bootstrap.sh` to initialize the environment on a new machine. It will:
1. Install GNU Stow if missing.
2. Apply Stow packages to $HOME.
3. Regenerate tool configurations (MCP, etc.) using `sync-mcp.py`.
4. Run `verify-env.sh` for a final health check.
