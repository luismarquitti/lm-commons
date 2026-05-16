# Brownfield Map: Home Lab Infrastructure

## Architecture
- **Hybrid Setup**: 
  - Virtualization node (Proxmox on Inspiron).
  - Bare-metal node (Debian on Optiplex).
- **Provisioning**: Ansible (idempotent playbooks).
- **Networking**: Tailscale (mesh VPN) + Mercusys Halo (LAN).

## Conventions
- **IP Schema**: `192.168.3.x`.
- **Naming**: `lm-*` for bare-metal, `pve-*` for virtualization.
- **Ansible**: Root user for Proxmox, `luismarquitti` with sudo for bare-metal.
