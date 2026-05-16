# Concerns: MQT_Home Lab

## Technical Debt
- **Manual OAuth:** Gemini CLI token renewal is manual and prone to expiration.
- **Legacy References:** Some playbooks still refer to `pve-optiplex` (decommissioned node).
- **Tailscale in LXC:** Complex configuration required for Tailscale to run inside unprivileged containers.

## Risks
- **Single Point of Failure:** `pve-inspiron` hosts all critical infra services (DNS, HA).
- **Hardcoded IPs:** Heavy reliance on static IPs in the `192.168.3.x` range.

## Security
- **Vault Usage:** Ensuring all secrets are properly encrypted via Ansible Vault.
- **Samba Permissions:** Managing root access to shares safely.
