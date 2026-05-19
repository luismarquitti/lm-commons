---
name: openclaw-expert
description: Especialista na implantação, configuração e manutenção do OpenClaw no MQT_Home Lab. Esta skill deve ser usada para gerenciar o nó `lm-claw` (Dell Optiplex 7040), executar playbooks de deploy, configurar canais de mensageria (WhatsApp, Telegram, Slack), gerenciar modelos no Ollama, orquestrar fluxos multi-agente e fluxos OpenProse. Se a documentação local for insuficiente para erros complexos ou novas features, acione o MCP context7 para consultar a documentação oficial mais recente do OpenClaw.
---

# OpenClaw Expert Skill

Esta skill fornece expertise técnica avançada para operar o OpenClaw no MQT_Home Lab.

## 🏗️ Contexto da Infraestrutura

- **Host Principal:** `lm-claw` (Dell Optiplex 7040)
- **Sistema Operacional:** Debian 13.4.0 (Bare-metal)
- **IP Local:** `192.168.3.10`
- **Usuário SSH:** `luismarquitti`
- **Portas:** Gateway na `18789`, Ollama na `11434`.

## 🚀 Implantação e Manutenção

A skill possui scripts utilitários para facilitar operações comuns:

- **Verificar Status:** `./scripts/check_status.sh` (Roda status, doctor e ollama ps remotamente).
- **Backup de Config:** `./scripts/backup_config.sh` (Cria backup datado do config.json5 no lm-claw).
- **Atualizar Sistema:** `./scripts/update_openclaw.sh` (Executa o playbook Ansible com tags corretas).

## ⚙️ Configuração Avançada

### Gerenciamento de Canais e Roteamento
As configurações residem em `/home/luismarquitti/.openclaw/config.json5`.

#### Multi-Agentes e Bindings
Para rotear mensagens para agentes específicos, use o array `bindings` associando `agentId` ao `match` de canal e peer ID.

### 🌊 Workflows e OpenProse
- Use `openclaw agents add <name>` para novos ambientes de agentes.
- Valide rotas com `openclaw agents list --bindings`.
- Consulte `references/cli_cheat_sheet.md` para uma lista rápida de comandos.

## 🧠 Modelos de IA (Ollama)

O OpenClaw utiliza o Ollama para inferência local.
- **Modelos:** `gemma4:e2b`, `qwen3:8b`, `deepseek-coder-v2:16b`.
- **Configuração:** Ajuste em `agents.defaults.model.primary` no `config.json5`.

## 📚 Pesquisa de Documentação e Resolução de Erros

Se encontrar erros desconhecidos:
1. **Logs Locais:** `tail -f ~/.openclaw/logs/gateway.log` no `lm-claw`.
2. **Diagnóstico:** `openclaw doctor`.
3. **Deep Dive (Context7):** SEMPRE use o MCP `context7` para buscar a documentação oficial mais recente (Library ID: `/openclaw/openclaw`).

## 🛠️ Recursos Adicionais
- `references/cli_cheat_sheet.md`: Guia rápido de comandos CLI.
- `scripts/`: Scripts de automação para tarefas frequentes.
