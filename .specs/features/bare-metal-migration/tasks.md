# Tasks: Bare-Metal Migration

## Milestone 1: Decommissioning
- [x] **Task 1.0**: Extract API keys and secrets from LXC 200.
- [x] **Task 1.1**: Run backup phase of `09-decommission-optiplex-proxmox.yml`.
- [x] **Task 1.2**: Run shutdown and cluster removal phase of `09-decommission-optiplex-proxmox.yml`.
- [x] **Task 1.4**: Encrypt and integrate extracted secrets into `ansible/inventory/group_vars/all/vault.yml`.

## Milestone 2: Provisioning
- [x] **Task 2.1**: Run `07-openclaw-deploy.yml` on new Debian system.
  - **Gate**: `ollama list` shows models downloaded.
- [x] **Task 2.4**: OpenClaw Installation and Onboarding.
  - **Action**: Run `openclaw onboard --install-daemon`.
  - **Done when**: `openclaw gateway status` returns a running status.

## Milestone 3: Restoration
- [x] **Task 3.1**: Restore backup file to `/home/luismarquitti/`.
- [x] **Task 3.4**: Fix hibernation issues (Mask sleep targets).
