---
name: openclaw-expert
description: Specialist in deploying, configuring, and maintaining OpenClaw in the MQT_Home Lab. This skill should be used to manage the `lm-claw` node (Dell Optiplex 7040), run deployment playbooks, configure messaging channels (WhatsApp, Telegram, Slack), manage models in Ollama, orchestrate multi-agent flows and OpenProse flows. If local documentation is insufficient for complex errors or new features, trigger the context7 MCP to search the most recent official OpenClaw documentation.
---

# OpenClaw Expert Skill

This skill provides advanced technical expertise to operate OpenClaw in the MQT_Home Lab.

## 🏗️ Infrastructure Context

- **Primary Host:** `lm-claw` (Dell Optiplex 7040)
- **Operating System:** Debian 13.4.0 (Bare-metal)
- **Local IP:** `192.168.3.10`
- **SSH User:** `luismarquitti`
- **Ports:** Gateway on `18789`, Ollama on `11434`.

## 🚀 Deployment and Maintenance

The skill features utility scripts to facilitate common operations:

- **Check Status:** `./scripts/check_status.sh` (Runs status, doctor, and ollama ps remotely).
- **Config Backup:** `./scripts/backup_config.sh` (Creates a dated backup of config.json5 in lm-claw).
- **Update System:** `./scripts/update_openclaw.sh` (Runs the Ansible playbook with correct tags).

## ⚙️ Advanced Configuration

### Channel Management and Routing
Configurations reside in `/home/luismarquitti/.openclaw/config.json5`.

#### Multi-Agents and Bindings
To route messages to specific agents, use the `bindings` array, associating `agentId` with channel and peer ID matches.

### 🌊 Workflows and OpenProse
- Use `openclaw agents add <name>` for new agent environments.
- Validate routes with `openclaw agents list --bindings`.
- Consult `references/cli_cheat_sheet.md` for a quick list of commands.

## 🧠 AI Models (Ollama)

OpenClaw uses Ollama for local inference.
- **Models:** `gemma4:e2b`, `qwen3:8b`, `deepseek-coder-v2:16b`.
- **Configuration:** Adjusted in `agents.defaults.model.primary` in `config.json5`.

## 📚 Documentation Search and Error Resolution

If you encounter unknown errors:
1. **Local Logs:** `tail -f ~/.openclaw/logs/gateway.log` on `lm-claw`.
2. **Diagnosis:** `openclaw doctor`.
3. **Deep Dive (Context7):** ALWAYS use the `context7` MCP to search the most recent official documentation (Library ID: `/openclaw/openclaw`).

## 🛠️ Additional Resources
- `references/cli_cheat_sheet.md`: CLI commands quick sheet.
- `scripts/`: Automation scripts for frequent tasks.
