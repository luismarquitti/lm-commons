---
status: pending
title: Wire Ansible to Bitwarden for the vault password
type: infra
complexity: low
dependencies:
  - task_05
  - task_06
---

# Task 07: Wire Ansible to Bitwarden for the vault password

## Overview
Replace the on-disk `home-lab/.vault_pass` with an executable vault-password client that resolves the Ansible Vault password from Bitwarden through `secrets.sh`. Wire `ansible.cfg` to use this client via the `vault_password_file` directive, then verify `ansible-vault view` decrypts `inventory/group_vars/all/vault.yml` successfully with the new mechanism.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- A new script `ai-commons/scripts/ansible-vault-pass.sh` MUST exist, be executable, and print only the Ansible Vault password on stdout (no trailing logs, no stderr noise on the happy path).
- `home-lab/ansible/ansible.cfg` MUST include `vault_password_file = <relative-or-absolute path to ansible-vault-pass.sh>` under `[defaults]`.
- The on-disk `home-lab/.vault_pass` file MUST be removed.
- `ansible-vault view inventory/group_vars/all/vault.yml` MUST succeed using the new client.
- The client MUST delegate to `secrets.sh::secrets_get ansible-vault password` and MUST fail loudly when the vault is locked.
</requirements>

## Subtasks
- [ ] 07.1 Author `ai-commons/scripts/ansible-vault-pass.sh`, delegating to `secrets.sh`.
- [ ] 07.2 Update `home-lab/ansible/ansible.cfg` to set `vault_password_file`.
- [ ] 07.3 Delete `home-lab/.vault_pass` and confirm it is gitignored.
- [ ] 07.4 Run `ansible-vault view inventory/group_vars/all/vault.yml` and confirm success.
- [ ] 07.5 Run a `--check` smoke playbook (e.g. `ansible-playbook playbooks/00-bootstrap.yml --check`) to confirm Ansible boots with the new client.

## Implementation Details
The current `ansible.cfg` (read during exploration) has no `vault_password_file` directive — it is added under `[defaults]`. The path may be relative to `ansible.cfg` location so the repository can be cloned elsewhere without breakage. See TechSpec "Core Interfaces" for the client contract.

### Relevant Files
- (new) `~/lm-commons/ai-commons/scripts/ansible-vault-pass.sh`
- `~/lm-commons/home-lab/ansible/ansible.cfg` — modified.
- `~/lm-commons/home-lab/.vault_pass` — removed.
- `~/lm-commons/home-lab/inventory/group_vars/all/vault.yml` — read by the verification step.

### Dependent Files
- `ai-commons/scripts/secrets.sh` (task 05) — called by the client.
- Every Ansible playbook in `home-lab/ansible/playbooks/` that decrypts vault content (transparently consumed).

### Related ADRs
- [ADR-004: Bitwarden as the secrets manager via the free `bw` CLI](adrs/adr-004.md)
- [ADR-007: Layered secrets — Bitwarden over a retained Ansible Vault](adrs/adr-007.md)

## Deliverables
- `ansible-vault-pass.sh` script implementing the documented contract.
- Updated `ansible.cfg` with `vault_password_file` directive.
- Removed `home-lab/.vault_pass`.
- Unit tests with 80%+ branch coverage on `ansible-vault-pass.sh` **(REQUIRED)**.
- Integration test running `ansible-vault view` against the real encrypted file **(REQUIRED)**.

## Tests
- Unit tests:
  - [ ] `ansible-vault-pass.sh` prints exactly the value returned by stubbed `secrets_get` and nothing else on stdout.
  - [ ] When the stub indicates a locked vault, the script exits non-zero with a clear stderr message and prints nothing on stdout.
  - [ ] The script is executable and has a correct shebang.
- Integration tests:
  - [ ] `ansible-vault view ~/lm-commons/home-lab/ansible/inventory/group_vars/all/vault.yml` returns the decrypted contents using `ansible.cfg`'s `vault_password_file`.
  - [ ] `ansible-playbook playbooks/00-bootstrap.yml --check` runs to completion (or to the first unrelated step) without prompting for a password.
- Test coverage target: >=80%.
- All tests must pass.

## Success Criteria
- All tests passing.
- Test coverage >=80%.
- Ansible decrypts the existing vault using the Bitwarden-backed client; `.vault_pass` is gone.
