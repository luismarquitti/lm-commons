# OpenClaw Manual Configuration Log

Este documento registra as alterações manuais realizadas na instância `openclaw-prod` para posterior automação via Ansible.

## Itens Pendentes de Automação

### 1. Node.js via NVM
- **Descrição:** Toda a instância do OpenClaw deve usar a versão LTS do Node.js.
- **Preferência:** Instalação via `nvm` (Node Version Manager).
- **Status:** Documentado (Aguardando inclusão no Playbook).
- **Detalhes Técnicos:**
  - Instalar `nvm` para o usuário root ou usuário da aplicação.
  - Instalar `node --lts`.
  - Garantir que `node` e `npm` estejam no PATH global ou acessíveis pelo serviço OpenClaw.

### 2. Homebrew
- **Descrição:** Instalação do Homebrew para gerenciamento de pacotes adicionais.
- **Status:** Documentado (Aguardando inclusão no Playbook).
- **Detalhes Técnicos:**
  - Instalar via script oficial: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`.
  - Adicionar Homebrew ao PATH no `.bashrc` ou `.zshrc`.
  - Garantir que as dependências do Homebrew (`build-essential`, etc.) estejam instaladas.

### 3. Tailscale
- **Descrição:** Configuração da rede VPN Mesh para acesso seguro e interconectividade.
- **Status:** Documentado (Aguardando inclusão no Playbook).
- **Detalhes Técnicos:**
  - Instalar via script oficial: `curl -fsSL https://tailscale.com/install.sh | sh`.
  - Autenticar o nó (`tailscale up`).
  - Considerar o uso de `--ssh` para gerenciamento via Tailscale SSH.

---
*Última atualização: 15/05/2026*
