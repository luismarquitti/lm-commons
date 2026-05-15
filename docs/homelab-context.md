# Projeto: Home Lab — Contexto e Histórico

> Documento gerado em 14/05/2026 a partir da sessão de planejamento inicial.
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

## 2. Infraestrutura Atual (estado em 14/05/2026)

### Hardware

| Dispositivo | Hostname | Status | Função |
|---|---|---|---|
| Dell Optiplex 7040 | `pve-optiplex` | Proxmox instalado, IP `192.168.3.50` | Servidor principal (futuro) |
| Laptop Server | `pve-laptop` / `openclaw-proxmox` | Proxmox instalado, IP `192.168.3.19` | Servidor secundário (atual) |
| Lenovo (pessoal) | `LUIS-LAPTOP` | Windows 11 Pro, IP `192.168.3.14` | Cliente de gerenciamento |
| LUIS-PC | `LUIS-PC` | IP `192.168.3.20`, cabeado | Desktop adicional |

### VMs e Serviços Ativos

| IP | Hostname | Serviço | Portas | Host físico |
|---|---|---|---|---|
| `192.168.3.10` | `homeassistant.local` | Home Assistant (VM) | 22, 3000, 4357, 8123 | Laptop Server |
| `192.168.3.16` | — | VM Openclaw (Hyper-V virtual MAC) | 22 | Laptop Server |
| `192.168.3.22` | `homeassistant2.local` | Home Assistant 2ª instância | 4357, 8123 | Laptop Server |
| `192.168.3.50` | Dell / pve-optiplex | **Proxmox VE já instalado** | 22, 8006 | Optiplex 7040 |
| Lenovo `:3001` | — | Serviço local (Uptime Kuma?) | 3001 | LUIS-LAPTOP |

### Serviços no Lenovo (portas em listening)
```
3001  → app local (Uptime Kuma ou similar)
5432  → PostgreSQL
5433  → PostgreSQL (instância alternativa)
6379  → Redis
```
Todos rodando via Docker/WSL2 no Lenovo pessoal — parte do ambiente de dev local.

---

## 3. Rede — MQT_Home (`192.168.3.0/24`)

### Roteador Mesh Mercusys Halo

| Dispositivo | IP | MAC | Local |
|---|---|---|---|
| Halo H60XR (principal) | `192.168.3.1` | `30-16-9D-B2-D1-98` | Office |
| Halo H60XS (satélite) | `192.168.3.250` | `30-16-9D-B2-CB-D8` | Quarto principal |

- **SSID:** `MQT_Home`
- **2.4GHz:** canal 2 | **5GHz:** canal 44
- **WAN:** Dynamic IP — `192.168.0.2` (double NAT — modem do provedor em `192.168.0.1`)
- **DNS configurado no Lenovo:** `8.8.8.8` / `1.1.1.1`
- **Interface de gerenciamento:** `http://192.168.3.1`

### Inventário Completo de Dispositivos

#### Servidores e Computadores
| IP | MAC | Nome | Tipo | Conexão |
|---|---|---|---|---|
| `192.168.3.14` | `E0-D5-5D-AC-A4-59` | LUIS-LAPTOP | Lenovo Win11 | Wi-Fi 5G |
| `192.168.3.19` | `BC-24-11-A5-32-E5` | openclaw-proxmox | Laptop Server (Proxmox host) | Cabeado |
| `192.168.3.20` | `28-F1-0E-FD-28-63` | LUIS-PC | Desktop | Cabeado |
| `192.168.3.50` | `74-86-7A-FA-8E-C8` | Dell (pve-optiplex) | Optiplex 7040 (Proxmox) | Cabeado |

#### VMs (MACs virtuais Hyper-V)
| IP | MAC | Nome | Serviço |
|---|---|---|---|
| `192.168.3.10` | `00-15-5D-00-45-01` | homeassistant | Home Assistant VM |
| `192.168.3.16` | `00-15-5D-00-45-04` | openclaw | VM Openclaw |
| `192.168.3.22` | `02-37-DE-E7-F3-31` | homeassistant2 | Home Assistant 2ª instância |

#### Dispositivos de Automação (Home Assistant)
| IP | Nome | Tipo | Banda |
|---|---|---|---|
| `192.168.3.13` | Suite_IR | Controle IR (Sonoff/Tuya) | 2.4G |
| `192.168.3.40` | Sala_Echo4 | Amazon Echo | 5G |
| `192.168.3.43` | QtоLH_Echo_Dot | Amazon Echo Dot | 5G |
| `192.168.3.45` | Sala_Fire_TV | Amazon Fire TV | 2.4G |
| `192.168.3.46` | Suite_Fire_TV | Amazon Fire TV | 2.4G |
| `192.168.3.47` | Sala_TV_Samsung | Samsung Smart TV | 5G |
| `192.168.3.102` | Esc_Lamp_Abajur | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.103` | Esc_Led_Bancada | LED Tuya/Sonoff | 2.4G |
| `192.168.3.107` | Varanda_Leds | ESP32 (Espressif) | 2.4G |
| `192.168.3.108` | Sala_Lamp_Abajur | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.109` | Sala_Lamp_Jantar | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.110` | Sala_Interruptores | Switch Tuya/Sonoff | 2.4G |
| `192.168.3.112` | Suite_Lamp_Abajur | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.113` | Suite_Switch_Geral | Switch Tuya/Sonoff | 2.4G |
| `192.168.3.116` | Corr_Switch_Geral | Switch Tuya/Sonoff | 2.4G |
| `192.168.3.117` | Coz_Lamp_Pia | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.118` | QuartoLH_Interruptores | Switch Tuya/Sonoff | 2.4G |

#### Outros Dispositivos
| IP | Nome | Tipo | Banda |
|---|---|---|---|
| `192.168.3.11` | moto-edge-60 | Celular Motorola | 5G |
| `192.168.3.15` | HP-5CG4340D0S | Impressora HP | 5G |
| `192.168.3.17` | NET863400532523332 | Desconhecido | 5G |

---

## 4. Tailscale — Rede VPN Mesh

**Tailnet:** `tail2a8138.ts.net`

| IP Tailscale | Hostname | SO | Status |
|---|---|---|---|
| `100.105.115.103` | luis-laptop | Windows | Online |
| `100.71.89.124` | openclaw-proxmox | Linux | Online |
| `100.92.19.119` | openclaw | Linux | Idle |
| `100.77.105.37` | moto-edge-60 | Android | Offline (22d) |

> Tailscale já está instalado e funcional no Lenovo e no Laptop Server. Contorna o double NAT do Mercusys sem configuração de port forwarding.

---

## 5. Objetivo Final do Projeto

Migrar e consolidar a infraestrutura de home lab para:

```
ALVO
├── Optiplex 7040 (Proxmox) ← servidor principal
│   ├── VM: Openclaw (migrada do laptop server, com mais recursos)
│   ├── VM: outros serviços pesados futuros
│   └── LXC: AdGuard Home, Uptime Kuma, etc.
│
├── Laptop Server (Proxmox) ← servidor secundário
│   ├── VM: Home Assistant (Tuya + Sonoff)
│   └── LXCs: serviços leves
│
└── Lenovo (cliente) → acesso interno (LAN) + externo (Tailscale)
    └── Browser: Proxmox UI (:8006), HA (:8123), Uptime Kuma (:3001)
```

---

## 6. Plano de Ação — Fases

### Fase 1 — Proxmox no Optiplex ✅ (já instalado)
- Proxmox VE instalado e respondendo em `https://192.168.3.50:8006`
- Próximo passo: configurar storage (SSD 240GB como OS + HDD 320GB como storage de VMs)

### Fase 2 — Reservas DHCP no Mercusys (pendente)
Configurar em `http://192.168.3.1` → Advanced → DHCP → Address Reservation:

| IP Reservado | MAC | Hostname |
|---|---|---|
| `192.168.3.10` | `00-15-5D-00-45-01` | homeassistant |
| `192.168.3.14` | `E0-D5-5D-AC-A4-59` | luis-laptop |
| `192.168.3.19` | `BC-24-11-A5-32-E5` | pve-laptop |
| `192.168.3.20` | `28-F1-0E-FD-28-63` | luis-pc |
| `192.168.3.50` | `74-86-7A-FA-8E-C8` | pve-optiplex |

### Fase 3 — Tailscale no Optiplex (pendente)
```bash
# Rodar no shell do Proxmox do Optiplex
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
```

### Fase 4 — Migrar VM Openclaw (pendente)
```bash
# No Proxmox do Laptop (origem)
vzdump <VMID> --storage local --mode snapshot

# Transferir para o Optiplex
scp /var/lib/vz/dump/vzdump-*.vma.zst root@192.168.3.50:/var/lib/vz/dump/

# No Proxmox do Optiplex (destino)
qmrestore /var/lib/vz/dump/vzdump-*.vma.zst <NOVO_VMID>
```

### Fase 5 — Monitoramento (pendente)
Uptime Kuma como LXC no Proxmox do Optiplex — monitora todos os serviços da rede.

---

## 7. Acessos e Credenciais de Infraestrutura

| Serviço | URL / Acesso | Observação |
|---|---|---|
| Proxmox Optiplex | `https://192.168.3.50:8006` | Certificado self-signed |
| Proxmox Laptop | `https://192.168.3.19:8006` | Certificado self-signed |
| Home Assistant | `http://192.168.3.10:8123` | VM no laptop server |
| Mercusys Halo | `http://192.168.3.1` | Gerenciamento mesh |
| Tailscale Admin | `https://login.tailscale.com/admin` | Gerenciar peers |

---

## 8. Projetos de Software Ativos (contexto adicional)

| Projeto | Descrição | Onde roda |
|---|---|---|
| **Openclaw** | Framework de IA principal, gerencia outros agentes | VM no laptop server (a migrar para Optiplex) |
| **ClinicCare** | Maior prioridade financeira | — |
| **SwMaster** | Assistente de dev com GitHub e Datadog | — |
| **IntelliFinance** | App financeiro — PERN stack + GraphQL | — |

---

## 9. Decisões Técnicas Tomadas

- **Subnet da rede:** `192.168.3.0/24` (não `192.168.1.x` como assumido inicialmente)
- **Acesso externo:** Tailscale (contorna double NAT do Mercusys sem port forwarding)
- **DNS local futuro:** AdGuard Home como LXC no Optiplex
- **Monitoring:** Uptime Kuma como LXC no Optiplex
- **Storage Optiplex:** SSD 240GB → OS Proxmox | HDD 320GB → storage de VMs e backups
- **Migração Openclaw:** Backup/Restore (`vzdump`) — sem cluster Proxmox por ora

---

## 10. Observações e Pontos de Atenção

- O Lenovo tem **Hyper-V ativo** (interfaces `vEthernet Default Switch` e `vEthernet WSL`) — não interfere com o homelab mas é relevante saber
- Há **dois Home Assistants** na rede (`.10` e `.22`) — investigar se são instâncias diferentes ou redundância acidental
- **Double NAT:** WAN do Mercusys é `192.168.0.2` — sem impacto para acesso interno; Tailscale resolve o externo
- O Optiplex já responde na porta `8006` — Proxmox funcional desde o início da sessão
- O Lenovo tem PostgreSQL (`:5432`, `:5433`), Redis (`:6379`) e um serviço na `:3001` rodando localmente via Docker/WSL

---

*Última atualização: 14/05/2026 — Sessão de planejamento inicial do Home Lab*
