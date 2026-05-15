# Home Lab — MQT_Home

Infrastructure-as-code para o home lab pessoal rodando em cluster Proxmox VE de dois nós.

## Hardware

| Host | Hostname | IP | Função |
|------|----------|----|--------|
| Dell Optiplex 7040 | `pve-optiplex` | `192.168.3.10` | Nó primário do cluster |
| Dell Inspiron 14R | `pve-inspiron` | `192.168.3.50` | Nó secundário do cluster |

Cluster: `mqt-homelab` | Rede: `192.168.3.0/24` | VPN: Tailscale (`tail2a8138.ts.net`)

## Serviços

| Serviço | IP | Porta | Host |
|---------|----|-------|------|
| AdGuard Home | 192.168.3.5 | 3000 | pve-optiplex |
| Uptime Kuma | 192.168.3.6 | 3001 | pve-inspiron |
| Nginx Proxy Manager | 192.168.3.7 | 81 | pve-optiplex |
| Coolify | 192.168.3.8 | 8000 | pve-inspiron |
| Openclaw-Prod | 192.168.3.30 | — | pve-optiplex |
| PostgreSQL | 192.168.3.20 | 5432 | pve-inspiron |
| Home Assistant | 192.168.3.22 | 8123 | pve-inspiron (VM) |
| n8n | 192.168.3.11 | 5678 | pve-inspiron |
| Memos | 192.168.3.12 | 5230 | pve-inspiron |

## Estrutura

```
ansible/
├── ansible.cfg               # Configuração do Ansible
├── requirements.yml          # Collections necessárias
├── inventory/
│   ├── hosts.yml             # Inventário completo (nós, LXCs, VMs)
│   └── group_vars/all.yml    # Variáveis globais
└── playbooks/
    ├── site.yml              # Playbook master (executa todas as fases)
    ├── 00-bootstrap.yml      # Repositórios, pacotes, SSH, /etc/hosts
    ├── 01-storage.yml        # Montagem de discos e storage Proxmox
    ├── 02-cluster.yml        # Criação e adesão ao cluster
    ├── 03-sharing.yml        # Samba + NFS
    ├── 04-tailscale.yml      # VPN mesh
    ├── 05-lxc-deploy.yml     # Deploy de containers LXC
    ├── 06-db-setup.yml       # PostgreSQL central
    └── 07-openclaw-deploy.yml # Framework Openclaw
docs/
├── homelab-context.md        # Contexto e histórico do projeto
├── setup_proxmox_lxc.md      # Guia detalhado de provisionamento
└── openclaw-manual-config-log.md
```

## Pré-requisitos

```bash
python3 -m venv ~/ansible-venv
source ~/ansible-venv/bin/activate
pip install ansible proxmoxer requests
cd ansible
ansible-galaxy collection install -r requirements.yml
```

## Uso

```bash
source ~/ansible-venv/bin/activate
cd ansible

# Deploy completo
ansible-playbook playbooks/site.yml

# Fase específica
ansible-playbook playbooks/05-lxc-deploy.yml

# Limitar a um host
ansible-playbook playbooks/00-bootstrap.yml --limit pve-optiplex

# Tag específica
ansible-playbook playbooks/05-lxc-deploy.yml --tags adguard
```

## Secrets

Senhas e tokens devem ser definidos via Ansible Vault. Crie o arquivo `ansible/inventory/group_vars/all/vault.yml` (ignorado pelo Git) com as variáveis:

```yaml
vault_lxc_password: "..."
vault_db_password: "..."
```

Execute com `--ask-vault-pass` ou configure o arquivo `.vault_pass` (também ignorado pelo Git).
