# Home Lab — MQT_Home Context

This repository manages the Infrastructure-as-Code (IaC) for the MQT_Home personal home lab. It uses Ansible for provisioning and managing a hybrid environment consisting of Proxmox virtualization and bare-metal servers.

## Project Overview

The lab is designed for high-availability services (via Proxmox) and high-performance AI workloads (via bare-metal).

### Core Architecture
- **Bare-Metal Node (`lm-claw`):** Dell Optiplex 7040 running **Debian 13.4.0**. Dedicated to the **OpenClaw** AI framework, Ollama models, and Gemini CLI.
- **Proxmox Node (`pve-inspiron`):** Dell Inspiron 14R. Hosts LXC containers for networking (AdGuard, Nginx Proxy), monitoring (Uptime Kuma), and databases (PostgreSQL), plus a VM for Home Assistant.
- **Management:** Orchestrated via Ansible from a Windows/WSL2 development machine.
- **Networking:** `192.168.3.0/24` subnet. VPN mesh via Tailscale.

## Building and Running

Provisioning is handled by Ansible playbooks in the `ansible/` directory.

### Prerequisites
- Python 3 with a virtual environment.
- Ansible, `proxmoxer`, and `requests` Python packages.
- Ansible Galaxy collections (see `ansible/requirements.yml`).

### Common Commands
- **Deploy OpenClaw (Bare-Metal):**
  ```bash
  ansible-playbook playbooks/07-openclaw-deploy.yml
  ```
- **Provision LXCs (Inspiron):**
  ```bash
  ansible-playbook playbooks/05-lxc-deploy.yml
  ```

## Infrastructure Inventory

### Hardware
| Hostname | Role | IP | OS |
| :--- | :--- | :--- | :--- |
| `lm-claw` | AI Server (OpenClaw) | `192.168.3.10` | Debian 13.4.0 (Bare-metal) |
| `pve-inspiron` | Virtualization Host | `192.168.3.50` | Proxmox VE |

### Key Services
| Service | Host | IP | Port |
| :--- | :--- | :--- | :--- |
| AdGuard Home | LXC (Inspiron) | `192.168.3.5` | 3000 |
| Uptime Kuma | LXC (Inspiron) | `192.168.3.6` | 3001 |
| Nginx Proxy Manager | LXC (Inspiron) | `192.168.3.7` | 81 |
| PostgreSQL | LXC (Inspiron) | `192.168.3.20` | 5432 |
| Home Assistant | VM (Inspiron) | `192.168.3.22` | 8123 |
| Ollama | `lm-claw` | `192.168.3.10` | 11434 |
| OpenClaw Gateway | `lm-claw` | `192.168.3.10` | 18789 |

## Development Conventions
- **Secrets:** Managed via Ansible Vault (`ansible/inventory/group_vars/all/vault.yml`).
- **Persistence:** lm-claw has hibernation/sleep targets masked to ensure 24/7 availability.
