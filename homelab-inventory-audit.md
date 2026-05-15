# Auditoria de Inventário — Home Lab
**Luis Eduardo · 15/05/2026**

---

## Estado de Identificação

| IP | Status | Observação |
|---|---|---|
| `192.168.3.30` | ✅ Identificado | lm-claw (Bare-metal Optiplex) |
| `192.168.3.50` | ✅ Identificado | pve-inspiron (Proxmox Host) |
| `192.168.3.22` | ✅ Identificado | homeassistant-server (VM definitiva) |
| `192.168.3.20` | ✅ Identificado | postgres-db (LXC) |
| `192.168.3.5` | ✅ Identificado | adguard (LXC) |
| `192.168.3.10` | ✅ Decommissioned | Antigo IP Proxmox (Optiplex), migrado para bare-metal .30 |
| `192.168.3.17` | ⚪ Ignorado | Dispositivo desconhecido, atualmente offline |

---

## Configurações Proxmox (Inspiron 14R — .50)

### VMs e IDs
| VMID | Nome | IP | Status |
|---|---|---|---|
| 151 | homeassistant-server | 192.168.3.22 | Ativa |

### LXCs e IDs
| ID | Nome | IP | Status |
|---|---|---|---|
| 100 | adguard | 192.168.3.5 | Ativa |
| 101 | uptime-kuma | 192.168.3.6 | Ativa |
| 102 | nginx-proxy | 192.168.3.7 | Ativa |
| 104 | postgres-db | 192.168.3.20 | Ativa |

---

## Reservas DHCP (Mercusys Halo)

| IP Reservado | Hostname | MAC |
|---|---|---|
| `192.168.3.30` | lm-claw | `74:86:7A:FA:8E:C8` |
| `192.168.3.50` | pve-inspiron | `BC:24:11:A5:32:E5` |
| `192.168.3.14` | luis-laptop | `E0:D5:5D:AC:A4:59` |
| `192.168.3.22` | homeassistant | `02:37:DE:E7:F3:31` |

---

*Auditoria atualizada em 15/05/2026*
