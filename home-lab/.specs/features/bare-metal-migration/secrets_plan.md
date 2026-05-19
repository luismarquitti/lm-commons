# Secret Collection & Management Plan

## Objective
Extract all necessary API keys, environment variables, and secrets from the current Proxmox/LXC OpenClaw instance and securely store them for the bare-metal deployment using Ansible Vault.

## Secret Sources
1. **OpenClaw Config**: `/home/luismarquitti/.openclaw/config.json` (if exists).
2. **Environment Variables**:
   - `/home/luismarquitti/.bashrc` or `/home/luismarquitti/.profile`.
   - Systemd override files: `/etc/systemd/system/openclaw.service.d/*.conf`.
3. **Existing Ansible Vault**: `ansible/inventory/group_vars/all/vault.yml`.

## Implementation Steps

### 1. Extraction (Manual/Automated)
- [ ] Read current environment variables on the LXC 200.
- [ ] Identify key OpenClaw variables (e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`).
- [ ] Check for Tailscale Auth Keys or other infrastructure secrets.

### 2. Secure Storage (Ansible Vault)
- [ ] Create/Update `ansible/inventory/group_vars/all/vault.yml`.
- [ ] Encrypt sensitive values using `ansible-vault encrypt`.
- [ ] Ensure `.vault_pass` is configured correctly for local execution.

### 3. Integration
- [ ] Update `07-openclaw-deploy.yml` to inject these secrets into the system environment or OpenClaw configuration files.
- [ ] Use these variables during the interactive onboarding phase to speed up the process.

## Verification
- Verify that the new bare-metal instance has access to the secrets via `env` command or config files.
- Ensure no secrets are committed to Git in plaintext.
