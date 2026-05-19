# Project: OpenClaw Bare-Metal Migration

## Vision
Migrate the OpenClaw AI framework from a Proxmox virtualized environment (LXC) to a dedicated bare-metal installation on the Dell Optiplex 7040. This transition aims to maximize hardware resource utilization (16GB RAM, 4 CPU Cores) for local LLM inference using Ollama.

## Goals
- [ ] Decommission the current Proxmox setup on the Dell Optiplex 7040.
- [ ] Back up and restore critical OpenClaw configuration and data (~/.openclaw).
- [ ] Provision a clean Debian 12 environment on the Optiplex.
- [ ] Automate the deployment of the OpenClaw stack (Node.js, Ollama, Tailscale, Storage) via Ansible.
- [ ] Consolidate networking and services (AdGuard, Postgres) on the remaining Proxmox node (Dell Inspiron).

## Stakeholders
- **Luis Marquitti**: Owner, Tech Lead, and primary user.

## Success Criteria
- OpenClaw is running bare-metal on 192.168.3.30.
- Ollama can utilize full system RAM for models like `gemma4:e2b`.
- All legacy Proxmox data from the Optiplex is backed up and accessible.
- Network services (DNS, DB) are stable on the Inspiron node.
