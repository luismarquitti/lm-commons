# Stack: MQT_Home Lab

## Operating Systems
- **Bare-metal:** Debian 12 (Bookworm) on `lm-claw`.
- **Virtualization:** Proxmox VE 8.x on `pve-inspiron`.
- **LXC/VMs:** Debian/Ubuntu based containers.

## Automation & IaC
- **Ansible:** Core orchestration tool.
- **Python 3:** Used for Ansible modules (`proxmoxer`, `requests`).
- **NVM/Node.js:** Runtime for OpenClaw (v24.15.0 LTS).

## Networking
- **Tailscale:** WireGuard-based VPN mesh for secure inter-node communication.
- **Mercusys Halo:** Physical mesh router (H60XR/H60XS).
- **AdGuard Home:** DNS management and ad-blocking.

## AI & Data
- **Ollama:** Local LLM runner.
- **OpenClaw:** AI framework and agent gateway.
- **PostgreSQL:** Central database for services.
