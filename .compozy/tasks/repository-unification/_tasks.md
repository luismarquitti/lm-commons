# Repository Unification — Task List

## Tasks

| # | Title | Status | Complexity | Dependencies |
|---|-------|--------|------------|--------------|
| 01 | Finalize `home-lab` source branch | pending | low | — |
| 02 | Initialize `lm-commons` repository scaffold | pending | low | — |
| 03 | Migrate `ai-commons/` content into the monorepo | pending | medium | task_02 |
| 04 | Import `home-lab/` history via `git subtree add` | pending | low | task_01, task_02 |
| 05 | Author `secrets.sh` Bitwarden retrieval interface | pending | low | task_03 |
| 06 | Onboard secrets to Bitwarden and replace plaintext key with placeholder | pending | low | task_05 |
| 07 | Wire Ansible to Bitwarden for the vault password | pending | low | task_05, task_06 |
| 08 | Update `sync-mcp.py` to resolve secrets and use repo-relative paths | pending | low | task_05, task_06 |
| 09 | Build Stow packages for `claude`, `agents`, `gemini` | pending | medium | task_03 |
| 10 | Author `bootstrap.sh` and `verify-env.sh` | pending | medium | task_08, task_09 |
| 11 | Cut over: re-point consumers to the new path | pending | medium | task_10 |
| 12 | Repo-wide secrets audit | pending | low | task_06, task_07, task_08, task_11 |
| 13 | Push `lm-commons` to a new private GitHub repository | pending | low | task_12 |
| 14 | Decommission legacy: archive `home-lab` remote, remove old local copies | pending | low | task_13 |
| 15 | Write the full `lm-commons` README | pending | low | task_13 |
