# Projeto: Home Lab — Contexto e Histórico

> Documento atualizado em 15/05/2026 após migração bare-metal e consolidação Proxmox.
> Use este arquivo como contexto base para todas as conversas do projeto.

---

## 1. Perfil do Usuário

- **Nome:** Luis Eduardo (Luis Marquitti)
- **Função:** Software Engineer, Product Owner e Tech Lead
- **Alocação:** HP via Wipro, Campinas/SP
- **Nível técnico:** Avançado — experiência com Docker, LangGraph, AutoGen, LangChain, Google Workspace APIs, Notion, Home Assistant
- **Laptop pessoal:** Lenovo, Windows 11 Pro (hostname: `LUIS-LAPTOP`)
- **IP do Lenovo na rede:** `192.168.3.14`

---

## 2. Infraestrutura Atual (estado em 15/05/2026)

### Hardware

| Dispositivo | Hostname | Status | Função |
|---|---|---|---|
| Dell Optiplex 7040 | `lm-claw` | Ativo, IP `192.168.3.30` | Bare-metal Debian (OpenClaw + Ollama) |
| Dell Inspiron 14R | `pve-inspiron` | Ativo, IP `192.168.3.50` | Único nó Proxmox VE |
| Lenovo (pessoal) | `LUIS-LAPTOP` | Ativo, IP `192.168.3.14` | Cliente de gerenciamento |
| LUIS-PC | `LUIS-PC` | IP `192.168.3.20`, cabeado | Desktop adicional |

### VMs e Serviços Ativos

| IP | Hostname | Serviço | Portas | Host físico |
|---|---|---|---|---|
| `192.168.3.30` | `lm-claw` | OpenClaw + Ollama | 11434, 22 | Bare-metal Optiplex |
| `192.168.3.22` | `homeassistant-server` | Home Assistant (VM) | 8123 | pve-inspiron |
| `192.168.3.20` | `postgres-db` | PostgreSQL (LXC) | 5432 | pve-inspiron |
| `192.168.3.5` | `adguard` | AdGuard Home (LXC) | 3000 | pve-inspiron |
| `192.168.3.6` | `uptime-kuma` | Monitoramento (LXC) | 3001 | pve-inspiron |
| `192.168.3.7` | `nginx-proxy` | Proxy Manager (LXC) | 81 | pve-inspiron |
| `192.168.3.50` | `pve-inspiron` | **Proxmox VE (Host)** | 22, 8006 | Dell Inspiron |

---

## 3. Rede — MQT_Home (`192.168.3.0/24`)

### Roteador Mesh Mercusys Halo

| Dispositivo | IP | MAC | Local |
|---|---|---|---|
| Halo H60XR (principal) | `192.168.3.1` | `30-16-9D-B2-D1-98` | Office |
| Halo H60XS (satélite) | `192.168.3.250` | `30-16-9D-B2-CB-D8` | Quarto principal |

- **SSID:** `MQT_Home`
- **WAN:** Dynamic IP — `192.168.0.2` (double NAT — modem do provedor em `192.168.0.1`)
- **DNS configurado no Lenovo:** `192.168.3.5` (AdGuard)
- **Interface de gerenciamento:** `http://192.168.3.1`

### Inventário Principal

#### Servidores e Computadores
| IP | MAC | Nome | Tipo | Conexão |
|---|---|---|---|---|
| `192.168.3.14` | `E0-D5-5D-AC-A4-59` | LUIS-LAPTOP | Lenovo Win11 | Wi-Fi 5G |
| `192.168.3.30` | `74-86-7A-FA-8E-C8` | lm-claw | Bare-Metal | Cabeado |
| `192.168.3.50` | `BC-24-11-A5-32-E5` | pve-inspiron | Proxmox Host | Cabeado |

#### VMs e LXCs
| IP | MAC | Nome | Serviço | Host |
|---|---|---|---|---|
| `192.168.3.22` | `02-37-DE-E7-F3-31` | homeassistant-server | Home Assistant VM | pve-inspiron |
| `192.168.3.5` | — | adguard | AdGuard Home LXC | pve-inspiron |
| `192.168.3.20` | — | postgres-db | PostgreSQL LXC | pve-inspiron |

---

## 4. Tailscale — Rede VPN Mesh

**Tailnet:** `tail2a8138.ts.net`

| IP Tailscale | Hostname | SO | Status |
|---|---|---|---|
| `100.105.115.103` | luis-laptop | Windows | Online |
| `100.71.89.124` | openclaw-proxmox | Linux (Inspiron) | Online |
| `100.101.44.15` | lm-claw | Linux (Bare-metal) | Online |

---

## 5. Arquitetura Atual (Pós-Migração)

```
ESTADO ATUAL
├── Optiplex 7040 (Bare-Metal) ← Servidor AI
│   └── App: OpenClaw + Ollama (gemma4, qwen3, etc.)
│
├── Inspiron 14R (Proxmox) ← Servidor de Serviços
│   ├── VM: Home Assistant (Tuya + Sonoff)
│   ├── LXC: AdGuard Home (DNS)
│   ├── LXC: Uptime Kuma (Monitoring)
│   ├── LXC: Nginx Proxy Manager
│   └── LXC: PostgreSQL Central
│
└── Lenovo (cliente) → acesso via LAN + Tailscale
```

---

## 6. Plano de Ação — Status das Fases

### Fase 1 — Proxmox no Inspiron ✅
- Proxmox VE funcional em `https://192.168.3.50:8006`.

### Fase 2 — Optiplex Bare-Metal ✅
- Optiplex reinstalado com Debian 12 puro para máximo performance do OpenClaw.

### Fase 3 — Tailscale e VPN ✅
- Configurado em todos os nós com rotas de subnet.

### Fase 4 — Provisionamento Ansible ✅
- Inventário `hosts.yml` sincronizado com a nova realidade hybrid.

### Fase 5 — Serviços Críticos ✅
- AdGuard, Postgres e HA migrados/provisionados no Inspiron.

---

## 7. Acessos e Credenciais

| Serviço | URL / Acesso | Observação |
|---|---|---|
| Proxmox Inspiron | `https://192.168.3.50:8006` | Gestão de LXCs/VMs |
| lm-claw SSH | `ssh luismarquitti@192.168.3.30` | Gestão bare-metal |
| AdGuard Home | `http://192.168.3.5:3000` | DNS Dashboard |
| Home Assistant | `http://192.168.3.22:8123` | Automação |

---

## 8. Projetos de IA Ativos

| Projeto | Descrição | Onde roda |
|---|---|---|
| **Openclaw** | Framework de IA principal + Obsidian Vault | lm-claw (Bare-metal) |
| **SwMaster** | Assistente de dev | lm-claw (via OpenClaw) |

---

## 9. Decisões Técnicas Críticas

- **Bare-metal para OpenClaw:** Decidido em 15/05/2026 para eliminar overhead de virtualização e permitir uso total dos 16GB RAM/4 Cores físicos para modelos Ollama (gemma4:e2b).
- **Consolidação Proxmox:** Inspiron 14R centraliza todos os serviços de infra que não exigem CPU intensiva.
- **Remoção de Serviços:** Coolify, n8n e Memos foram removidos do escopo para simplificar a stack.

---

*Última atualização: 15/05/2026 — Pós-migração Bare-Metal*
