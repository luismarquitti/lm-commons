# OpenClaw Manual Configuration Log

Este documento registra as alterações manuais realizadas na instância `lm-claw` para posterior automação via Ansible.

---

## Configurações Aplicadas em 15/05/2026

### Symlinks do Node.js para o sistema

O serviço systemd não carrega o ambiente nvm automaticamente. Os symlinks abaixo alinham o `node` do sistema ao nvm para sessões não-interativas:

```bash
NVM_NODE=$(nvm which current)   # /home/luismarquitti/.nvm/versions/node/v24.15.0/bin/node
sudo ln -sf $NVM_NODE /usr/bin/node
sudo ln -sf $(dirname $NVM_NODE)/npm /usr/local/bin/npm
sudo ln -sf $(dirname $NVM_NODE)/npx /usr/local/bin/npx
sudo ln -sf $NVM_NODE /usr/local/bin/node
```

> **Atenção:** Esses symlinks precisam ser recriados após cada `nvm install` ou mudança de versão ativa.

### Configurações openclaw aplicadas via `openclaw config set`

| Chave | Valor | Motivo |
|---|---|---|
| `agents.list[1].model.fallbacks` | `[]` | `chief` sem fallbacks explícitos sobrescrevia o default |
| `agents.list[2].model.fallbacks` | `[]` | `nest` idem |
| `channels.discord.enabled` | `false` | groupPolicy allowlist sem IDs configurados descartava mensagens silenciosamente |
| `commands.ownerAllowFrom` | `["telegram:8666532874"]` | Habilita comandos owner no Telegram |

### Gateway reinstalado com `--force`

```bash
openclaw gateway stop
openclaw gateway install --force
openclaw gateway start
```

Necessário após troca de versão do node — o arquivo `.service` ainda apontava para a versão anterior.

### Sessões limpas

```bash
openclaw sessions cleanup \
  --store ~/.openclaw/agents/main/sessions/sessions.json \
  --enforce --fix-missing
```

Removeu 1 entrada sem transcript. Resultado: 7 sessões válidas.

---

## Itens Pendentes de Automação

### 1. Node.js via NVM

- **Preferência:** Instalação via `nvm` (não via nodesource/apt — evita conflito com a versão escolhida pelo usuário).
- **Versão em uso:** v24.15.0 (LTS)
- **Status:** Playbook `07-openclaw-deploy.yml` atualizado para usar nvm + symlinks.
- **Detalhes Técnicos:**
  - Instalar nvm para o usuário `luismarquitti`
  - `nvm install --lts && nvm use --lts`
  - Criar symlinks em `/usr/local/bin` e `/usr/bin` para node/npm/npx

### 2. Obsidian Vault (PKM)

- **Descrição:** Clonagem do repositório de notas (PKM) para servir de contexto ao OpenClaw.
- **Status:** Automatizado via Playbook `07-openclaw-deploy.yml`.
- **Detalhes Técnicos:**
  - Repositório: `https://github.com/luismarquitti/obsidian-vault.git`
  - Destino: `~/.openclaw/workspace/obsidian-vault`

### 3. Homebrew

- **Descrição:** Instalação do Homebrew para gerenciamento de pacotes adicionais.
- **Status:** Pendente (Aguardando inclusão no Playbook).
- **Detalhes Técnicos:**
  - Instalar via script oficial: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`.
  - Adicionar Homebrew ao PATH no `.bashrc` ou `.zshrc`.

### 3. Tailscale no lm-claw

- **Situação atual:** Resolvido pela transição para Bare-Metal. O `tailscaled.service` agora roda diretamente no hardware do Optiplex.
- **Status:** ✅ Resolvido / Concluído
- **Detalhes Técnicos:**
  - Tailscale instalado no Debian 13 bare-metal
  - IP Tailscale ativo: `100.65.65.92`
  - Gateway OpenClaw respondendo normalmente na rede VPN mesh


### 4. Renovação de token Google (manual recorrente)

- **Descrição:** O token OAuth do Google Gemini CLI expira e precisa ser renovado manualmente.
- **Comando:** `openclaw models auth login --provider google-gemini-cli`
- **Não automatizável** via Ansible (requer fluxo OAuth interativo no browser).

---
*Última atualização: 25/05/2026*
