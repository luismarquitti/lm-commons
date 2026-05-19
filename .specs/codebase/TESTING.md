# Testing: MQT_Home Lab

## Validation Strategies
- **Syntax Check:** `ansible-playbook playbooks/X.yml --syntax-check`.
- **Dry Run (Check Mode):** `ansible-playbook playbooks/X.yml --check`.
- **Manual Verification:** SSH into nodes and verify service status (`systemctl status`, `docker ps`, etc.).

## OpenClaw Specifics
- Verify Node.js version: `node -v`.
- Verify Ollama models: `ollama list`.
- Verify Vault cloning: `ls -la ~/.openclaw/workspace/obsidian-vault`.
