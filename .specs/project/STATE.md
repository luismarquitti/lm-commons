# Project State

## Decisions
- **2026-05-15**: Migrating to Bare-Metal to resolve 16GB RAM limit for high-end LLMs.
- **2026-05-15**: Using Debian 13.4.0 (Stable) instead of Ubuntu for leaner OS overhead and kernel 6.12.
- **2026-05-15**: Fixed IP for `lm-claw` at `192.168.3.10` to maintain consistency after Proxmox removal.
- **2026-05-15**: Homebrew and Gemini CLI added to the base bare-metal stack.

## Blockers
- None.

## Todos
- [x] Prepare Debian 13.4.0 USB bootable drive.
- [x] Gather API keys for OpenClaw onboarding.
- [ ] Finalize manual OpenClaw configuration (OAuth login).

## Lessons Learned
- Proxmox overhead was prohibitive for large LLM models on 16GB hardware.
- Debian 13.4.0 requires masking `sleep.target` to prevent automatic hibernation on Optiplex 7040.
- Ansible `delegate_to` is more reliable than manual SSH for inter-node transfers during migrations.
