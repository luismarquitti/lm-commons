# Feature Spec: Bare-Metal Migration

## Overview
This specification details the transition of the OpenClaw node from a Proxmox LXC to a bare-metal Debian 12 installation.

## Requirements
- **REQ-001**: Must preserve all data in `/home/luismarquitti/.openclaw`.
- **REQ-002**: Must result in a dedicated system at `192.168.3.30` (lm-claw).
- **REQ-003**: Must use Ansible for idempotent provisioning of the base system.
- **REQ-004**: Must handle mounting of the 298GB HDD for OpenClaw storage.
- **REQ-005**: Must successfully integrate with the existing Tailscale network.
- **REQ-006**: Must perform OpenClaw installation and interactive onboarding with daemon setup.

## User Decisions (Gray Areas)
- **Decision**: Manual OS installation is preferred over automated PXE for simplicity in this one-node migration.
- **Decision**: Backup will be stored on `pve-inspiron` (192.168.3.50).
