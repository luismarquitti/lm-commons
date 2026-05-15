# Auditoria de Inventário — Identificação Completa de Dispositivos
**Home Lab · Luis Eduardo · 14/05/2026**

---

## O que falta identificar

| IP | Problema | Prioridade |
|---|---|---|
| `192.168.3.17` | Completamente desconhecido | 🔴 Alta |
| `192.168.3.19` | MAC da VM Openclaw não documentado | 🟡 Média |
| `192.168.3.22` | MAC da VM HA definitiva — confirmar | 🟡 Média |
| `192.168.3.10` | VM HA legacy — confirmar que pode ser desligada | 🟡 Média |
| IoT (`.102`–`.118`) | Fabricante/modelo real não confirmado | 🟢 Baixa |

---

## PASSO 1 — Scan completo da rede (WSL2 no LUIS-LAPTOP)

Abra o terminal WSL2 no seu Lenovo e rode:

```bash
# Instalar nmap se não tiver
sudo apt install nmap -y

# Scan de toda a subnet: descobre todos os hosts ativos + MACs
sudo nmap -sn 192.168.3.0/24 -oN ~/nmap-subnet-scan.txt

# Exibir resultado formatado
cat ~/nmap-subnet-scan.txt
```

Isso vai mostrar: IP, MAC e fabricante (pelo OUI do MAC) de cada dispositivo ativo. **Copie a saída completa** — usaremos para preencher o inventário.

---

## PASSO 2 — Identificar o dispositivo misterioso (.17)

### 2a. Descobrir portas abertas e OS
```bash
# Scan agressivo: SO, versão de serviços, portas
sudo nmap -A -T4 192.168.3.17
```

### 2b. Tentar acesso HTTP (pode ser um painel web)
```bash
curl -s -o /dev/null -w "%{http_code}" http://192.168.3.17
curl -s -o /dev/null -w "%{http_code}" http://192.168.3.17:8080
curl -s -o /dev/null -w "%{http_code}" https://192.168.3.17 -k
```

### 2c. Lookup do fabricante pelo MAC
O nmap já faz isso, mas você também pode usar:
```bash
# Pegar o MAC do ARP cache após o ping
ping -c 1 192.168.3.17
arp -n 192.168.3.17

# Lookup manual do OUI (primeiros 3 octetos do MAC)
# Ex: se MAC for AA:BB:CC:xx:xx:xx → pesquisar "AA:BB:CC OUI lookup"
# Site: https://www.macvendorlookup.com
```

> O hostname `NET863400532523332` tem formato típico de dispositivos Netgear ou de operadoras de internet brasileiras (repetidor, extensor de alcance, etc.).

---

## PASSO 3 — Coletar MACs das VMs no Proxmox

SSH no host Proxmox (Dell Inspiron 14R):

```bash
ssh root@192.168.3.50
```

### 3a. Listar todas as VMs e seus IDs
```bash
qm list
```

### 3b. Ver configuração de cada VM (substitua VMID pelo número real)
```bash
# Para cada VM listada:
qm config <VMID_openclaw>
qm config <VMID_ha_nova>
```

Procure a linha `net0:` — ela contém o MAC da interface de rede da VM:
```
net0: virtio=AA:BB:CC:DD:EE:FF,bridge=vmbr0
```

### 3c. Alternativa: verificar dentro de cada VM
```bash
# SSH na VM Openclaw
ssh user@192.168.3.19
ip link show eth0
# ou
cat /sys/class/net/eth0/address

# SSH na VM HA nova
ssh root@192.168.3.22
ip link show
```

---

## PASSO 4 — Verificar o Home Assistant legacy (.10)

Antes de desligar, confirmar que a HA nova (.22) já tem:
- Todos os dispositivos Tuya/Sonoff integrados
- Automações migradas
- Histórico (não é obrigatório, mas recomendado)

```bash
# Checar se .10 está respondendo
ping 192.168.3.10
curl -s http://192.168.3.10:8123/api/ -H "Authorization: Bearer <TOKEN>"

# Comparar dispositivos entre as duas instâncias via API
curl -s http://192.168.3.22:8123/api/states | python3 -m json.tool | grep entity_id | wc -l
curl -s http://192.168.3.10:8123/api/states | python3 -m json.tool | grep entity_id | wc -l
```

Se o número de entidades do `.22` for igual ou maior que o do `.10`, pode desligar a legacy.

---

## PASSO 5 — Inventariar dispositivos IoT com mais detalhe

O Home Assistant já conhece cada dispositivo. Use a API para extrair modelo, fabricante e firmware:

```bash
# Na VM HA nova (.22) ou do LUIS-LAPTOP com token de acesso
HA_TOKEN="seu_long_lived_token_aqui"
HA_URL="http://192.168.3.22:8123"

# Listar todos os device registry entries (fabricante, modelo, firmware)
curl -s "$HA_URL/api/config/device_registry/list" \
  -H "Authorization: Bearer $HA_TOKEN" \
  | python3 -m json.tool > ~/ha-devices.json

cat ~/ha-devices.json | python3 -c "
import json,sys
devs = json.load(sys.stdin)
for d in devs:
    print(d.get('name_by_user') or d.get('name'), '|', d.get('manufacturer'), '|', d.get('model'))
"
```

Isso gera uma lista limpa: nome → fabricante → modelo para cada dispositivo IoT.

---

## PASSO 6 — Dump completo do ARP table (roteador)

Se tiver acesso SSH ao Mercusys (verifique se está habilitado em `http://192.168.3.1`):
```bash
ssh admin@192.168.3.1
# Ou via Telnet se disponível
# Procure o comando ARP table do firmware TP-Link/Mercusys
arp -a
```

Alternativamente, via WSL2 no Lenovo:
```bash
# Forçar resolução ARP de toda a subnet
for i in $(seq 1 254); do ping -c 1 -W 1 192.168.3.$i > /dev/null 2>&1 & done
wait
# Dump da tabela ARP do kernel
arp -n | sort -t. -k4 -n
```

---

## Checklist de Execução

- [ ] **PASSO 1** — nmap scan completo da subnet
- [ ] **PASSO 2** — identificar 192.168.3.17 (nmap -A + curl)
- [ ] **PASSO 3** — capturar MACs das VMs via `qm config` no Proxmox
- [ ] **PASSO 4** — validar HA nova (.22) antes de desligar legacy (.10)
- [ ] **PASSO 5** — extrair inventário IoT do Home Assistant via API
- [ ] **PASSO 6** — dump ARP completo para cruzar com inventário

---

## Resultado esperado ao final

Com esses passos, você terá para cada `192.168.3.x`:
- IP confirmado
- MAC real (físico ou virtual)
- Fabricante (via OUI)
- Modelo/hostname real
- Função na rede
- Tipo de conexão (cabeado / Wi-Fi 2.4G / 5G)

Esse inventário completo vai alimentar a próxima fase: **reestruturação de IPs e taxonomia de nomenclatura** seguindo boas práticas para redes domésticas/homelab.

---

*Auditoria gerada em 14/05/2026 — Home Lab · Luis Eduardo*
