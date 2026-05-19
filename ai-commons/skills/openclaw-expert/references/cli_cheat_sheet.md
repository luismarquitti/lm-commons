# OpenClaw CLI Cheat Sheet

## Gateway
- `openclaw gateway start`: Iniciar serviço.
- `openclaw gateway stop`: Parar serviço.
- `openclaw gateway restart`: Reiniciar serviço.
- `openclaw gateway status`: Ver estado do serviço.
- `openclaw gateway install --force`: Reinstalar serviço (útil se symlinks quebrarem).

## Agents & Channels
- `openclaw channels login`: Login em canais (WhatsApp/Telegram).
- `openclaw agents add <name>`: Criar novo agente isolado.
- `openclaw agents list --bindings`: Ver rotas de agentes.
- `openclaw message send --channel <c> --target <t> --message <m>`: Enviar mensagem via CLI.

## Diagnostics
- `openclaw doctor`: Diagnóstico completo.
- `openclaw info`: Informações da versão e ambiente.
- `openclaw config get <key>`: Consultar valor de configuração.
- `openclaw config set <key> <value>`: Alterar valor de configuração.

## Path Locais (lm-claw)
- Configuração: `~/.openclaw/config.json5`
- Logs: `~/.openclaw/logs/gateway.log`
- Workspace: `~/.openclaw/workspace/`
