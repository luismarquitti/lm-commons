# Task: Integrate Obsidian Vault into OpenClaw

## Objective
Automatically clone the user's Obsidian Vault repository into the OpenClaw workspace on `lm-claw` to allow the AI agents to use it as context.

## Steps
1. [x] Research repository accessibility (publicly available).
2. [x] Add global variables for repo URL and destination path to `ansible/inventory/group_vars/all.yml`.
3. [x] Add a git cloning task to `ansible/playbooks/07-openclaw-deploy.yml`.
4. [x] Verify syntax of the modified playbook.
5. [x] Update project documentation (`docs/homelab-context.md`, `docs/openclaw-manual-config-log.md`).

## Verification Criteria
- [x] Ansible syntax check passes.
- [x] Documentation reflects the new configuration.
- [ ] (Manual) Playbook runs successfully on `lm-claw` and clones the repo.
