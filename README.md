# Home Lab — MQT_Home

Infrastructure-as-Code para o home lab pessoal rodando em arquitetura híbrida (Proxmox + Bare-Metal).

## Hardware Atualizado (15/05/2026)

| Host | Hostname | IP | Função | SO |
|------|----------|----|--------|----|
| Dell Optiplex 7040 | `lm-claw` | `192.168.3.10` | AI Server (OpenClaw/Ollama) | Debian 13.4.0 |
| Dell Inspiron 14R | `pve-inspiron` | `192.168.3.50` | Virtualization (LXCs/VMs) | Proxmox VE |

## Estrutura do Repositório

- `ansible/`: Playbooks e inventário para automação.
  - `playbooks/07-openclaw-deploy.yml`: Deploy completo da stack de IA bare-metal.
  - `playbooks/05-lxc-deploy.yml`: Provisionamento de containers no Proxmox.
- `docs/`: Documentação de contexto, rede e logs manuais.
- `.specs/`: Definições de projeto seguindo SDD (Spec-Driven Development).

## Como rodar o deploy

1. Ative o ambiente virtual:
   ```bash
   source ~/ansible-venv/bin/activate
   ```
2. Execute o playbook desejado usando a senha do vault:
   ```bash
   cd ansible
   ansible-playbook playbooks/07-openclaw-deploy.yml --vault-password-file ../.vault_pass
   ```

## Serviços Principais

- **OpenClaw**: Framework de IA central (IP .10).
- **Ollama**: Backend de LLM local (IP .10).
- **AdGuard Home**: DNS local e bloqueio de ads (LXC no .50).
- **PostgreSQL**: Banco de dados central (LXC no .50).
- **Home Assistant**: Automação residencial (VM no .50).

---
*Última atualização: 15/05/2026 — Migração Bare-Metal concluída.*
