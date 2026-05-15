# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home lab infrastructure-as-code for a single-node Proxmox setup (Dell Inspiron 14R) plus a bare-metal Debian server (Dell Optiplex 7040 — `lm-claw`). All provisioning is handled by Ansible playbooks executed from the development machine (Lenovo laptop via WSL).

Documentation lives in `docs/` — `homelab-context.md` contains the most current infrastructure state, decisions, and migration plan.

## Common Commands

All Ansible commands run from `ansible/` with the venv activated:

```bash
source ~/ansible-venv/bin/activate
cd ~/home-lab/ansible
```

Run the full deployment:
```bash
ansible-playbook playbooks/site.yml
```

Run a single phase:
```bash
ansible-playbook playbooks/00-bootstrap.yml   # repos, packages, SSH, /etc/hosts
ansible-playbook playbooks/01-storage.yml     # mount HDDs, register Proxmox storage
ansible-playbook playbooks/02-cluster.yml     # create/join cluster
ansible-playbook playbooks/03-sharing.yml     # Samba + NFS
ansible-playbook playbooks/04-tailscale.yml   # VPN mesh
ansible-playbook playbooks/05-lxc-deploy.yml  # create LXC containers
ansible-playbook playbooks/06-db-setup.yml    # PostgreSQL
ansible-playbook playbooks/07-openclaw-deploy.yml  # Openclaw framework
```

Limit to a specific host or tag:
```bash
ansible-playbook playbooks/05-lxc-deploy.yml --limit pve-optiplex
ansible-playbook playbooks/05-lxc-deploy.yml --tags adguard
```

Install Ansible dependencies:
```bash
ansible-galaxy collection install -r requirements.yml
pip install proxmoxer requests
```

## Architecture

### Inventory structure

`inventory/hosts.yml` defines the Proxmox host, bare-metal host, and all LXC/VM children:

- **pve-inspiron** (`192.168.3.50`) — sole Proxmox node; hosts AdGuard, Nginx Proxy Manager, Uptime Kuma, PostgreSQL, Home Assistant VM; HDD 1TB shared via Samba
- **lm-claw** (`192.168.3.30`) — Dell Optiplex bare-metal Debian; runs OpenClaw + Ollama directly on hardware

`inventory/group_vars/all.yml` holds all shared variables: subnet (`192.168.3.0/24`), cluster name (`mqt-homelab`), storage names, Tailscale subnet routing, Samba paths, and LXC defaults.

### Playbook sequencing

`playbooks/site.yml` is the master playbook — it imports all numbered playbooks in order. Each playbook is idempotent and can be re-run safely. Phases 0–5 are complete; LXC/VM deployment (phase 6+) is partially automated.

### Networking

- Network: `192.168.3.0/24`, gateway `.1` (Mercusys Halo mesh)
- Tailscale VPN provides remote access (`tail2a8138.ts.net`), subnet routing enabled on pve-inspiron and lm-claw
- AdGuard (`.5`) handles local DNS; DHCP reservations are static via router config

### Proxmox API usage

Playbook `05-lxc-deploy.yml` uses the `community.proxmox` module via `proxmoxer` Python library to create containers through the Proxmox REST API. API credentials should be stored as Ansible vault vars or environment variables — never in plaintext inventory.

### Storage layout

**lm-claw (Optiplex — bare-metal):**
- NVMe 238 GB → OS + OpenClaw
- HDD 298 GB → `/mnt/openclaw-storage` (OpenClaw workspace/models)

**pve-inspiron:**
- SSD 224 GB → OS + `local-lvm` (LXC disks, VM disks)
- HDD 1 TB → `/mnt/data` (personal data, Samba share `\\192.168.3.50\data`)

### Key service ports

| Service       | IP              | Port  |
|---------------|-----------------|-------|
| Proxmox (ins) | 192.168.3.50    | 8006  |
| AdGuard       | 192.168.3.5     | 3000  |
| Uptime Kuma   | 192.168.3.6     | 3001  |
| Nginx Proxy   | 192.168.3.7     | 81    |
| Home Assistant| 192.168.3.22    | 8123  |
| PostgreSQL    | 192.168.3.20    | 5432  |
| lm-claw       | 192.168.3.30    | varies|
| Ollama        | 192.168.3.30    | 11434 |
