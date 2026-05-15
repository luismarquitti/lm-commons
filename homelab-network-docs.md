# Documentação de Rede — Home Lab
**Última atualização:** 14/05/2026 (auditado às 17:30 BRT)
**Ambiente:** MQT_Home · Subnet `192.168.3.0/24`

---

## 1. Topologia Geral

```
Internet
   │
   ▼
Modem do Provedor (192.168.0.1)
   │  WAN: 192.168.0.2 (Double NAT)
   ▼
Mercusys Halo H60XR — PRINCIPAL (192.168.3.1)  ←── Office
   │         └── Halo H60XS — SATÉLITE (192.168.3.250) ←── Quarto principal
   │
   ├─[Cabeado]──► Dell Optiplex 7040 / pve-optiplex (192.168.3.10) — Proxmox VE Principal
   │                   ├── LXC: Openclaw-Prod (192.168.3.30)
   │                   ├── LXC: AdGuard (192.168.3.5)
   │                   └── LXC: Nginx-Proxy (192.168.3.7)
   │
   ├─[Cabeado]──► Dell Inspiron 14R / pve-inspiron (192.168.3.50) — Proxmox VE Secundário
   │                   ├── VM: Home Assistant (192.168.3.22)
   │                   ├── LXC: PostgreSQL (192.168.3.20)
   │                   ├── LXC: Coolify (192.168.3.8)
   │                   ├── LXC: Uptime Kuma (192.168.3.6)
   │                   ├── LXC: n8n (192.168.3.11)
   │                   └── LXC: memos (192.168.3.12)
   │
   └─[Wi-Fi 5G]─► LUIS-LAPTOP / Lenovo Win11 Pro (192.168.3.14)
```

---

## 2. Roteador Mesh — Mercusys Halo

| Campo | Valor |
|---|---|
| Modelo principal | Halo H60XR |
| IP principal | `192.168.3.1` |
| MAC principal | `30-16-9D-B2-D1-98` |
| Local | Office |
| Modelo satélite | Halo H60XS |
| IP satélite | `192.168.3.250` |
| MAC satélite | `30-16-9D-B2-CB-D8` |
| Local satélite | Quarto principal |
| SSID | `MQT_Home` |
| Canal 2.4GHz | Canal 2 |
| Canal 5GHz | Canal 44 |
| WAN IP | `192.168.0.2` (Double NAT) |
| Subnet LAN | `192.168.3.0/24` |
| Interface web | `http://192.168.3.1` |

> ⚠️ **Double NAT:** O WAN do Mercusys é `192.168.0.2`, com o modem do provedor em `192.168.0.1`. Sem impacto para tráfego interno. Acesso externo resolvido via **Tailscale**.

---

## 3. Servidores Físicos

### 3.1 Dell Optiplex 7040 — `pve-optiplex` ← Host Principal

| Campo | Valor |
|---|---|
| IP LAN | `192.168.3.10` |
| MAC | `74-86-7A-FA-8E-C8` |
| Conexão | Cabeado |
| SO | Proxmox VE |
| Interface Proxmox | `https://192.168.3.10:8006` |
| IP Tailscale | `100.95.244.76` (hostname: `pve-optiplex`) |
| Status Tailscale | 🟢 Online |
| Status | ✅ Host Principal |

**VMs / LXCs hospedados:**

| IP | Hostname | Serviço | Tipo | Status |
|---|---|---|---|---|
| `192.168.3.30` | openclaw-prod | Openclaw (IA framework principal) | LXC | ✅ Ativa |
| `192.168.3.5` | adguard | AdGuard DNS | LXC | ✅ Ativa |
| `192.168.3.7` | nginx-proxy | Nginx Reverse Proxy | LXC | ✅ Ativa |

---

### 3.2 Dell Inspiron 14R — `pve-inspiron` ← Host Secundário

| Campo | Valor |
|---|---|
| IP LAN | `192.168.3.50` |
| MAC | `BC:24:11:A5:32:E5` |
| Conexão | Cabeado |
| SO | Proxmox VE |
| Interface Proxmox | `https://192.168.3.50:8006` |
| IP Tailscale | `100.71.89.124` (hostname: `openclaw-proxmox`) |
| Status Tailscale | 🟢 Online |
| Status | ✅ Host Secundário |

**VMs / LXCs hospedados:**

| IP | Hostname | Serviço | Tipo | Status |
|---|---|---|---|---|
| `192.168.3.22` | homeassistant-server | Home Assistant definitiva | VM | ✅ Ativa |
| `192.168.3.20` | postgres-db | Banco de Dados Relacional | LXC | ✅ Ativa |
| `192.168.3.8` | coolify | Orquestrador de Containers | LXC | ✅ Ativa |
| `192.168.3.6` | uptime-kuma | Monitoramento | LXC | ✅ Ativa |
| `192.168.3.11` | n8n | Automação / N8N | LXC | ✅ Ativa |
| `192.168.3.12` | memos | Gestão de Notas (Memos) | LXC | ✅ Ativa |
| `192.168.3.19` | openclaw | OpenClaw Legacy | VM | ⛔ Desligada |

---

### 3.3 LUIS-LAPTOP — Lenovo Windows 11 Pro

| Campo | Valor |
|---|---|
| IP LAN | `192.168.3.14` |
| MAC | `E0-D5-5D-AC-A4-59` |
| Conexão | Wi-Fi 5GHz |
| SO | Windows 11 Pro |
| Hostname | `LUIS-LAPTOP` |
| IP Tailscale | `100.105.115.103` |
| Status Tailscale | 🟢 Online |
| Hyper-V | Ativo (`vEthernet Default Switch`, `vEthernet WSL`) |

**Serviços locais (Docker/WSL2):**

| Porta | Serviço |
|---|---|
| `:3001` | Uptime Kuma (ou similar) |
| `:5432` | PostgreSQL (instância principal) |
| `:5433` | PostgreSQL (instância alternativa) |
| `:6379` | Redis |

---

## 4. VMs — Inventário Completo

| IP | Nome | Tipo | Host físico | ID | Status |
|---|---|---|---|---|---|
| `192.168.3.30` | openclaw-prod | LXC | Optiplex `.10` | 200 | ✅ Ativa |
| `192.168.3.5` | adguard | LXC | Optiplex `.10` | 100 | ✅ Ativa |
| `192.168.3.7` | nginx-proxy | LXC | Optiplex `.10` | 102 | ✅ Ativa |
| `192.168.3.22` | homeassistant-server | VM | Inspiron `.50` | 151 | ✅ Ativa |
| `192.168.3.20` | postgres-db | LXC | Inspiron `.50` | 104 | ✅ Ativa |
| `192.168.3.8` | coolify | LXC | Inspiron `.50` | 103 | ✅ Ativa |
| `192.168.3.6` | uptime-kuma | LXC | Inspiron `.50` | 101 | ✅ Ativa |
| `192.168.3.11` | n8n | LXC | Inspiron `.50` | 110 | ✅ Ativa |
| `192.168.3.12` | memos | LXC | Inspiron `.50` | 111 | ✅ Ativa |
| `192.168.3.19` | openclaw-legacy | VM | Inspiron `.50` | 150 | ⛔ Desligada |

---

## 5. Dispositivos IoT / Automação

Todos gerenciados pelo Home Assistant. Maioria na banda 2.4GHz (protocolo Tuya/Sonoff/ESPHome).

| IP | Nome | Tipo | Banda |
|---|---|---|---|
| `192.168.3.13` | Suite_IR | Controle IR (Sonoff/Tuya) | 2.4G |
| `192.168.3.102` | Esc_Lamp_Abajur | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.103` | Esc_Led_Bancada | LED Tuya/Sonoff | 2.4G |
| `192.168.3.107` | Varanda_Leds | ESP32 (Espressif/ESPHome) | 2.4G |
| `192.168.3.108` | Sala_Lamp_Abajur | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.109` | Sala_Lamp_Jantar | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.110` | Sala_Interruptores | Switch Tuya/Sonoff | 2.4G |
| `192.168.3.112` | Suite_Lamp_Abajur | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.113` | Suite_Switch_Geral | Switch Tuya/Sonoff | 2.4G |
| `192.168.3.116` | Corr_Switch_Geral | Switch Tuya/Sonoff | 2.4G |
| `192.168.3.117` | Coz_Lamp_Pia | Lâmpada Tuya/Sonoff | 2.4G |
| `192.168.3.118` | QuartoLH_Interruptores | Switch Tuya/Sonoff | 2.4G |

---

## 6. Outros Dispositivos

| IP | Nome | Tipo | Banda |
|---|---|---|---|
| `192.168.3.11` | moto-edge-60 | Celular Motorola | 5G |
| `192.168.3.15` | HP-5CG4340D0S | HP ZBook (laptop de trabalho) | 5G |
| `192.168.3.17` | NET863400532523332 | ⚠️ Offline (Ignorado por enquanto) | 5G |
| `192.168.3.40` | Sala_Echo4 | Amazon Echo | 5G |
| `192.168.3.43` | QuartoLH_Echo_Dot | Amazon Echo Dot | 5G |
| `192.168.3.45` | Sala_Fire_TV | Amazon Fire TV | 2.4G |
| `192.168.3.46` | Suite_Fire_TV | Amazon Fire TV | 2.4G |
| `192.168.3.47` | Sala_TV_Samsung | Samsung Smart TV | 5G |

---

## 7. Tailscale VPN Mesh

**Tailnet:** `tail2a8138.ts.net`  
**Finalidade:** Acesso remoto externo, contornando o Double NAT do Mercusys.

| IP Tailscale | Hostname | Dispositivo real | SO | Status |
|---|---|---|---|---|
| `100.105.115.103` | luis-laptop | LUIS-LAPTOP (Lenovo) | Windows | 🟢 Online |
| `100.71.89.124` | openclaw-proxmox | Dell Inspiron 14R `.50` | Linux | 🟢 Online |
| `100.92.19.119` | openclaw | VM Openclaw `.19` | Linux | 🟡 Idle |
| `100.77.105.37` | moto-edge-60 | Celular Motorola | Android | 🔴 Offline (22d) |

---

## 8. Mapa de Acesso — URLs e Serviços

| Serviço | Acesso LAN | Acesso Tailscale | Observação |
|---|---|---|---|
| Proxmox — Optiplex | `https://192.168.3.10:8006` | `https://100.95.244.76:8006` | Host Principal |
| Proxmox — Inspiron | `https://192.168.3.50:8006` | `https://100.71.89.124:8006` | Host Secundário |
| Home Assistant (definitiva) | `http://192.168.3.22:8123` | via Tailscale | VM no Proxmox Inspiron |
| Openclaw Prod | `ssh 192.168.3.30` | — | LXC no Proxmox Optiplex |
| Mercusys Halo | `http://192.168.3.1` | — | Gerenciamento mesh |
| Tailscale Admin | `https://login.tailscale.com/admin` | — | Gerenciar peers |
| Uptime Kuma | `http://192.168.3.6:3001` | — | LXC no Inspiron |
| Coolify | `http://192.168.3.8:8000` | — | LXC no Inspiron |

---

## 9. Reservas DHCP — Pendente Configuração

Acessar: `http://192.168.3.1` → Advanced → DHCP → Address Reservation

| IP Reservado | MAC | Hostname | Host |
|---|---|---|---|
| `192.168.3.10` | `74-86-7A-FA-8E-C8` | pve-optiplex | Proxmox Principal |
| `192.168.3.14` | `E0-D5-5D-AC-A4-59` | luis-laptop | Lenovo |
| `192.168.3.19` | _(verificar MAC da VM)_ | openclaw | VM no Proxmox Inspiron |
| `192.168.3.20` | `28-F1-0E-FD-28-63` | luis-pc | Dell Optiplex 7140 |
| `192.168.3.22` | `02-37-DE-E7-F3-31` | homeassistant | VM no Proxmox Inspiron |
| `192.168.3.50` | `74-86-7A-FA-8E-C8` | pve-inspiron | (Antigo IP do Proxmox, migrar para .10) |

---

## 10. Mapa de IPs — Visão Consolidada

```
192.168.3.0/24

.1    Mercusys Halo H60XR (gateway)
.10   pve-optiplex (Proxmox Principal)
.11   moto-edge-60
.13   Suite_IR (IoT)
.14   LUIS-LAPTOP (Lenovo Win11, cliente)
.15   Impressora HP
.17   Desconhecido ← offline (ignorado)
.19   VM Proxmox: Openclaw              ← Inspiron 14R (.50)
.20   LUIS-PC (Dell Optiplex 7140, Hyper-V host)
.22   VM Proxmox: Home Assistant nova   ← Inspiron 14R (.50)  ✅ definitiva
.40   Sala_Echo4
.43   QuartoLH_Echo_Dot
.45   Sala_Fire_TV
.46   Suite_Fire_TV
.47   Sala_TV_Samsung
.50   pve-inspiron (Dell Inspiron 14R, único Proxmox host)
.102  Esc_Lamp_Abajur (IoT)
.103  Esc_Led_Bancada (IoT)
.107  Varanda_Leds — ESP32 (IoT)
.108  Sala_Lamp_Abajur (IoT)
.109  Sala_Lamp_Jantar (IoT)
.110  Sala_Interruptores (IoT)
.112  Suite_Lamp_Abajur (IoT)
.113  Suite_Switch_Geral (IoT)
.116  Corr_Switch_Geral (IoT)
.117  Coz_Lamp_Pia (IoT)
.118  QuartoLH_Interruptores (IoT)
.250  Mercusys Halo H60XS (satélite mesh)
```

---

## 11. Arquitetura Alvo (Pós-Migração)

```
ALVO
├── Dell Inspiron 14R (Proxmox) ← SERVIDOR PRINCIPAL
│   ├── VM: Home Assistant definitiva (.22) ← já em produção ✅
│   ├── VM: Openclaw (.19)                  ← já em produção ✅
│   ├── LXC: AdGuard Home (DNS local)       ← a criar
│   └── LXC: Uptime Kuma (monitoramento)    ← a criar
│
├── LUIS-PC / Dell Optiplex 7140 (Hyper-V)
│   └── VM: Home Assistant legacy           ← ✅ desativada
│
└── LUIS-LAPTOP (cliente) → acesso via LAN + Tailscale
    └── Browser: Proxmox UI (:8006) | HA (:8123) | Uptime Kuma (:3001)
```

---

## 12. Status das Fases do Projeto

| Fase | Descrição | Status |
|---|---|---|
| Fase 1 | Proxmox no Inspiron 14R | ✅ Concluída |
| Fase 1.1 | VM Home Assistant nova no Proxmox | ✅ Concluída |
| Fase 1.2 | VM Openclaw no Proxmox | ✅ Concluída |
| Fase 2 | Reservas DHCP no Mercusys | ⏳ Pendente |
| Fase 3 | Validar HA nova (.22) e desativar HA legacy (.10) | ✅ Concluída |
| Fase 4 | LXC AdGuard Home no Proxmox | ⏳ Pendente |
| Fase 5 | LXC Uptime Kuma no Proxmox | ⏳ Pendente |

---

## 13. Pontos de Atenção

- **Double NAT:** WAN Mercusys = `192.168.0.2` → Tailscale resolve o acesso externo.
- **Hyper-V no Lenovo:** Interfaces `vEthernet Default Switch` e `vEthernet WSL` — não interferem no homelab.
- **Dois Home Assistants:** O `.10` (legacy) já foi desligado. Apenas o `.22` está ativo.
- **Dispositivo desconhecido:** `192.168.3.17` (`NET863400532523332`) — offline, ignorado por enquanto.
- **MAC da VM Openclaw (.19):** Verificar no Proxmox (`ip link` dentro da VM) para adicionar reserva DHCP.

---

*Documentação gerada em 14/05/2026 — Home Lab · Luis Eduardo (luismarquitti@gmail.com)*
