# Conventions: MQT_Home Lab

## Ansible
- **Indentation:** 2 spaces.
- **Naming:** Use descriptive names for tasks (e.g., `OpenClaw — Garantir diretórios e permissões`).
- **Idempotency:** Tasks must use `creates`, `register/when`, or built-in module idempotency.
- **Variable Scoping:** Global variables in `group_vars/all.yml`, host-specific in `hosts.yml`.
- **Tags:** Use tags for granular execution (e.g., `[ollama]`, `[node]`, `[vault]`).

## Documentation
- **Source of Truth:** `docs/homelab-context.md`.
- **Format:** GitHub Flavored Markdown.
- **Living Docs:** Updates to infrastructure should be reflected in the `.specs/` and `docs/` folders.

## Git
- **Commits:** Conventional Commits preferred.
- **Secrets:** Never commit plain-text secrets; use Ansible Vault or placeholders.
