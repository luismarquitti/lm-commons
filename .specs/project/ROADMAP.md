# Roadmap: Bare-Metal Migration

## Milestone 1: Decommissioning & Backup ✅
- [x] **Task 1.1**: Backup OpenClaw configuration and data from LXC 200.
- [x] **Task 1.2**: Shutdown LXCs on Optiplex and remove node from Proxmox cluster.
- [x] **Task 1.3**: Manual OS Installation (Debian 13.4.0) on Optiplex.

## Milestone 2: Provisioning & Deployment ✅
- [ ] **Task 0.1**: Universal Common Setup (Zsh, Git, GH CLI).
- [x] **Task 2.1**: Base system configuration (IP 192.168.3.10, Hostname lm-claw).
- [x] **Task 2.2**: Node.js, Ollama, and Homebrew installation.
- [x] **Task 2.3**: Tailscale and Storage configuration.
- [x] **Task 2.4**: OpenClaw Installation and Interactive Onboard (`openclaw onboard`).

## Milestone 3: Restoration & Validation ✅
- [x] **Task 3.1**: Restore ~/.openclaw data.
- [x] **Task 3.2**: Manual OpenClaw configuration and OAuth login.
- [x] **Task 3.3**: Verification of local LLM performance and network stability.

## Milestone 4: Scalability & Organization
- [x] **Task 4.1**: Create centralized `~/Code` directory.
- [x] **Task 4.2**: Implement universal sync script `repos-sync.sh`.
- [x] **Task 4.3**: Integrate universal sync into OpenClaw heartbeat hook.
