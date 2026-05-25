# Documentação de Rede — Home Lab
**Última atualização:** 18/05/2026 (auditado às 18:00 BRT)
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
   ├─[Cabeado]──► Dell Optiplex 7040 / lm-claw (192.168.3.10) — Bare-Metal Debian
   │                   └── OpenClaw + Ollama (direto no hardware)
   │
   ├─[Cabeado]──► Dell Inspiron 14R / pve-inspiron (192.168.3.50) — Proxmox VE (único nó)
   │                   ├── VM: Home Assistant (192.168.3.22)
   │                   ├── LXC: PostgreSQL (192.168.3.20)
   │                   ├── LXC: AdGuard (192.168.3.5)
   │                   ├── LXC: Nginx-Proxy (192.168.3.7)
   │                   └── LXC: Uptime Kuma (192.168.3.6)
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
| Interface web | `http://192.168.3.1` |
| WAN IP | `192.168.0.2` (Double NAT) |
| Subnet LAN | `192.168.3.0/24` |

---

## 3. Servidores Físicos

### 3.1 Dell Optiplex 7040 — `lm-claw` ← Bare-Metal OpenClaw

| Campo | Valor |
|---|---|
| IP LAN | `192.168.3.10` |
| MAC | `74-86-7A-FA-8E-C8` |
| SO | Debian 12 (bare-metal) |
| Status | ✅ Ativa |

---

### 3.2 Dell Inspiron 14R — `pve-inspiron` ← Único Nó Proxmox

| Campo | Valor |
|---|---|
| IP LAN | `192.168.3.50` |
| MAC | `BC:24:11:A5:32:E5` |
| Interface Proxmox | `https://192.168.3.50:8006` |
| Status | ✅ Ativa |

**VMs / LXCs hospedados:**

| IP | Hostname | Serviço | Tipo | Status |
|---|---|---|---|---|
| `192.168.3.22` | homeassistant-server | Home Assistant | VM | ✅ Ativa |
| `192.168.3.20` | postgres-db | PostgreSQL | LXC | ✅ Ativa |
| `192.168.3.6` | uptime-kuma | Monitoramento | LXC | ✅ Ativa |
| `192.168.3.5` | adguard | AdGuard Home | LXC | ✅ Ativa |
| `192.168.3.7` | nginx-proxy | Nginx Proxy Manager | LXC | ✅ Ativa |

---

## 4. Mapa de IPs — Visão Consolidada

```
192.168.3.0/24

.1    Mercusys Halo H60XR (gateway)
.5    LXC: AdGuard Home (DNS)           ← Inspiron 14R (.50)
.6    LXC: Uptime Kuma (Monitoramento)  ← Inspiron 14R (.50)
.7    LXC: Nginx Proxy Manager          ← Inspiron 14R (.50)
.14   LUIS-LAPTOP (Lenovo Win11, cliente)
.20   LXC: PostgreSQL                   ← Inspiron 14R (.50)
.22   VM: Home Assistant                ← Inspiron 14R (.50)
.10   lm-claw (Optiplex bare-metal AI)
.50   pve-inspiron (Dell Inspiron, Proxmox host)
.250  Mercusys Halo H60XS (satélite mesh)
```

---

## 5. Tailscale VPN Mesh

| IP Tailscale | Hostname | Dispositivo | Status |
|---|---|---|---|
| `100.105.115.103` | luis-laptop | Lenovo | 🟢 Online |
| `100.92.32.71` | pve-inspiron | Inspiron (.50) | 🟢 Online |
| `100.65.65.92` | lm-claw | Optiplex (.10) | 🟢 Online |

---

*Documentação gerada em 25/05/2026 — Home Lab · Luis Eduardo*
