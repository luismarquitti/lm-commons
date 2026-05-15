# Home Lab — MQT_Home Context

This repository manages the Infrastructure-as-Code (IaC) for the MQT_Home personal home lab. It uses Ansible for provisioning and managing a hybrid environment consisting of Proxmox virtualization and bare-metal servers.

## Project Overview

The lab is designed for high-availability services (via Proxmox) and high-performance AI workloads (via bare-metal).

### Core Architecture
- **Bare-Metal Node (`lm-claw`):** Dell Optiplex 7040 running Debian. Dedicated to the **OpenClaw** AI framework and Ollama models.
- **Proxmox Node (`pve-inspiron`):** Dell Inspiron 14R. Hosts LXC containers for networking (AdGuard, Nginx Proxy), monitoring (Uptime Kuma), and databases (PostgreSQL), plus a VM for Home Assistant.
- **Management:** Orchestrated via Ansible from a Windows/WSL2 development machine.
- **Networking:** `192.168.3.0/24` subnet. VPN mesh via Tailscale (`tail2a8138.ts.net`).

## Building and Running

Provisioning is handled by Ansible playbooks in the `ansible/` directory.

### Prerequisites
- Python 3 with a virtual environment.
- Ansible, `proxmoxer`, and `requests` Python packages.
- Ansible Galaxy collections (see `ansible/requirements.yml`).

### Common Commands
All commands should be run from the `ansible/` directory with the virtual environment activated.

- **Full Deployment:**
  ```bash
  ansible-playbook playbooks/site.yml
  ```
- **Provision LXCs:**
  ```bash
  ansible-playbook playbooks/05-lxc-deploy.yml
  ```
- **Deploy OpenClaw (Bare-Metal):**
  ```bash
  ansible-playbook playbooks/07-openclaw-deploy.yml
  ```
- **Targeting specific hosts/tags:**
  ```bash
  ansible-playbook playbooks/site.yml --limit baremetal
  ansible-playbook playbooks/05-lxc-deploy.yml --tags adguard
  ```

## Infrastructure Inventory

### Hardware
| Hostname | Role | IP | OS |
| :--- | :--- | :--- | :--- |
| `lm-claw` | AI Server (OpenClaw) | `192.168.3.30` | Debian (Bare-metal) |
| `pve-inspiron` | Virtualization Host | `192.168.3.50` | Proxmox VE |

### Key Services
| Service | Host | IP | Port |
| :--- | :--- | :--- | :--- |
| AdGuard Home | LXC (Inspiron) | `192.168.3.5` | 3000 |
| Uptime Kuma | LXC (Inspiron) | `192.168.3.6` | 3001 |
| Nginx Proxy Manager | LXC (Inspiron) | `192.168.3.7` | 81 |
| PostgreSQL | LXC (Inspiron) | `192.168.3.20` | 5432 |
| Home Assistant | VM (Inspiron) | `192.168.3.22` | 8123 |
| Ollama | `lm-claw` | `192.168.3.30` | 11434 |

## Development Conventions

- **Idempotency:** All playbooks must be idempotent.
- **Secrets:** Use Ansible Vault for sensitive data (passwords, tokens).
- **Documentation:** Maintain `docs/homelab-context.md` as the source of truth for infrastructure state.
- **Instructional Context:**
    - Use `CLAUDE.md` for tool-specific guidance.
    - Reference `optiplex-openclaw-report.md` for decisions regarding bare-metal vs. virtualization for AI workloads.
- **Living Docs:** Use the `living-docs` skill to keep reports and documentation synchronized with infra changes.
