# Guia de Provisionamento — Home Lab

**Última atualização:** 14/05/2026  
**Contexto:** Instalação do Proxmox VE no Dell Optiplex 7040, criação de cluster com o Dell Inspiron 14R existente, e deploy dos serviços core.

---

## Pré-Requisitos

- Pendrive USB ≥ 2GB com a ISO do [Proxmox VE](https://www.proxmox.com/en/downloads) gravada (Ventoy ou Rufus/Balena Etcher)
- Optiplex 7040 conectado via cabo Ethernet ao roteador Mercusys
- Lenovo (LUIS-LAPTOP) na mesma rede para gerenciamento pós-instalação
- Dell Inspiron 14R (`pve-inspiron`, `192.168.3.50`) já rodando Proxmox VE

### Hardware do Optiplex 7040

| Disco | Capacidade | Função no Home Lab |
|---|---|---|
| SSD | 240 GB | **Proxmox VE OS** — Sistema operacional e `local` storage |
| HDD #1 | 320 GB | **Proxmox Services** — Armazenamento de VMs, LXCs, ISOs e templates |
| HDD #2 | 1 TB | **Dados Pessoais** — Arquivos de backup e armazenamento geral (mount somente leitura/escrita, sem formatar) |

> ⚠️ **ATENÇÃO:** O HDD de 1TB contém arquivos pessoais existentes. **NÃO** formatá-lo durante a instalação do Proxmox. Apenas montar após a instalação.

---

## Automação com Ansible

Após a **Fase 0** (instalação manual do Proxmox via USB), todas as fases subsequentes podem ser automatizadas via **Ansible** a partir do WSL no Lenovo.

### Instalar Ansible no WSL (Lenovo)

```bash
sudo apt update && sudo apt install -y python3-pip python3-venv
python3 -m venv ~/ansible-venv
source ~/ansible-venv/bin/activate
pip install ansible proxmoxer requests
cd ~/home-lab/ansible
ansible-galaxy collection install -r requirements.yml
```

### Executar os Playbooks

```bash
cd ~/home-lab/ansible

# Rodar TUDO (Fases 1-6 em sequência)
ansible-playbook playbooks/site.yml

# Ou uma fase por vez (RECOMENDADO)
ansible-playbook playbooks/00-bootstrap.yml       # Repos, pacotes, SSH
ansible-playbook playbooks/01-storage.yml          # Montar 3 discos
ansible-playbook playbooks/02-cluster.yml          # Cluster mqt-homelab
ansible-playbook playbooks/03-sharing.yml          # NFS + Samba
ansible-playbook playbooks/04-tailscale.yml        # VPN mesh
ansible-playbook playbooks/05-lxc-deploy.yml       # Criar LXCs

# Rodar apenas em um nó
ansible-playbook playbooks/00-bootstrap.yml --limit pve-optiplex

# Criar apenas um LXC específico
ansible-playbook playbooks/05-lxc-deploy.yml --tags adguard
```

### Estrutura do Projeto

```
home-lab/ansible/
├── ansible.cfg              # Configuração global
├── requirements.txt         # Dependências Python
├── requirements.yml         # Collections Ansible Galaxy
├── inventory/hosts.yml      # Nós Proxmox + definições de LXCs
├── group_vars/all.yml       # Variáveis globais (IPs, cluster, etc)
└── playbooks/
    ├── site.yml             # Master (importa todos)
    ├── 00-bootstrap.yml     # Repos, pacotes, SSH, /etc/hosts
    ├── 01-storage.yml       # HDD 320GB + HDD 1TB
    ├── 02-cluster.yml       # Cluster mqt-homelab
    ├── 03-sharing.yml       # Samba + NFS
    ├── 04-tailscale.yml     # Tailscale + subnet routing
    └── 05-lxc-deploy.yml    # Criar/iniciar LXCs via API
```

> 💡 **Abordagem dual:** A Fase 0 é manual (USB). A partir da Fase 1, use `ansible-playbook` OU siga os comandos manuais abaixo — ambos estão documentados.

---

## Fase 0 — Instalação do Proxmox VE via USB

### 0.1 Preparar o pendrive bootável

No Lenovo (Windows), usar [Ventoy](https://www.ventoy.net/) ou [Balena Etcher](https://etcher.balena.io/):

1. Baixar a ISO mais recente do Proxmox VE: https://www.proxmox.com/en/downloads
2. Gravar no pendrive
3. Plugar no Optiplex e bootar pelo USB (tecla **F12** no Dell para menu de boot)

### 0.2 Instalação

Durante o instalador gráfico do Proxmox:

| Campo | Valor |
|---|---|
| **Target Harddisk** | Selecionar o **SSD 240GB** (ex: `/dev/sda`) |
| **Country** | Brazil |
| **Timezone** | America/Sao_Paulo |
| **Keyboard** | Brazilian (ABNT2) |
| **Password** | Definir a senha de root |
| **Email** | luismarquitti@gmail.com |
| **Management Interface** | Selecionar a interface Ethernet cabeada (ex: `enp2s0`) |
| **Hostname (FQDN)** | `pve-optiplex.lan` |
| **IP Address** | `192.168.3.10/24` |
| **Gateway** | `192.168.3.1` |
| **DNS Server** | `8.8.8.8` (temporário, será trocado para AdGuard depois) |

> 💡 Ao instalar, o Proxmox vai formatar **apenas** o SSD selecionado. Os HDDs ficarão intactos.

### 0.3 Primeiro Acesso

Após a instalação e reboot:
1. No Lenovo, abrir o navegador: `https://192.168.3.10:8006`
2. Login: `root` / senha definida na instalação
3. Aceitar o certificado self-signed

---

## Fase 1 — Configuração Pós-Instalação (via Shell do Proxmox Web UI)

Acessar: `https://192.168.3.10:8006` → Node `pve-optiplex` → **Shell**

### 1.1 Desabilitar repositório Enterprise e habilitar Community

```bash
# Desabilitar repositório enterprise (requer assinatura paga)
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list

# Adicionar repositório community (gratuito)
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" \
  > /etc/apt/sources.list.d/pve-community.list

# Atualizar e instalar ferramentas
apt update && apt full-upgrade -y
apt install -y htop iotop curl git net-tools samba-common-bin
```

### 1.2 Remover aviso de subscription (cosmético)

```bash
sed -i.bak "s/data.status !== 'Active'/false/" \
  /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
systemctl restart pveproxy
```

### 1.3 Configurar SSH para acesso pelo Lenovo (WSL)

No **Shell do Proxmox** (via web UI), cole a chave pública gerada no WSL:

```bash
# Colar a chave pública do Lenovo WSL
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEJ6g/n86wqGNs2+HpvdqbkARPHFjXXcRFiruImpt3pV luismarquitti@LUIS-LAPTOP
EOF
chmod 600 ~/.ssh/authorized_keys
```

Para obter sua chave pública no WSL:
```bash
cat ~/.ssh/id_ed25519.pub
```

---

## Fase 2 — Configuração de Storage

### 2.1 Identificar os discos

No Shell do Proxmox:
```bash
# Listar todos os discos e partições
lsblk -f

# Exemplo esperado:
# sda  → SSD 240GB (Proxmox OS) — já configurado
# sdb  → HDD 320GB (para serviços Proxmox)
# sdc  → HDD 1TB (dados pessoais)
```

### 2.2 Preparar o HDD 320GB para serviços Proxmox

```bash
# Identificar o disco correto (ajustar sdX conforme lsblk)
DISK="/dev/sdb"

# Criar partição (CUIDADO: confirme que é o disco correto!)
# Se já tiver partição, pode pular para mkfs
fdisk $DISK  # → n, p, 1, enter, enter, w

# Formatar como ext4
mkfs.ext4 ${DISK}1

# Criar ponto de montagem
mkdir -p /mnt/pve-storage

# Montar
mount ${DISK}1 /mnt/pve-storage

# Adicionar ao fstab para montagem automática
echo "${DISK}1  /mnt/pve-storage  ext4  defaults  0  2" >> /etc/fstab

# Registrar como storage no Proxmox
pvesm add dir pve-storage \
  --path /mnt/pve-storage \
  --content images,rootdir,backup,iso,snippets,vztmpl
```

### 2.3 Montar o HDD 1TB (dados pessoais — somente mount)

```bash
# Identificar o disco e sua partição existente
lsblk -f /dev/sdc

# Criar ponto de montagem
mkdir -p /mnt/data

# Montar (ajustar tipo do filesystem conforme lsblk: ntfs, ext4, etc.)
# Se for NTFS (vindo do Windows):
apt install -y ntfs-3g
mount -t ntfs-3g /dev/sdc1 /mnt/data

# Se for ext4:
# mount /dev/sdc1 /mnt/data

# Adicionar ao fstab
# Para NTFS:
echo "/dev/sdc1  /mnt/data  ntfs-3g  defaults,nofail  0  0" >> /etc/fstab
# Para ext4:
# echo "/dev/sdc1  /mnt/data  ext4  defaults,nofail  0  2" >> /etc/fstab

# Registrar no Proxmox como storage de backup/ISOs (somente leitura se preferir)
pvesm add dir data-storage \
  --path /mnt/data \
  --content backup,iso
```

### 2.4 Verificar storages

```bash
pvesm status
# Deve mostrar: local, pve-storage, data-storage
```

---

## Fase 3 — Cluster Proxmox (Optiplex + Inspiron)

> Um cluster Proxmox permite gerenciar ambos os nós (Optiplex e Inspiron) a partir de uma **única interface web**. Você verá todas as VMs e LXCs dos dois servidores em um único painel.

### 3.1 Pré-requisitos do Cluster

- Ambos os nós devem ter **hostnames únicos** (✅ `pve-optiplex` e `pve-inspiron`)
- Ambos devem conseguir se comunicar via rede (✅ mesma subnet `192.168.3.0/24`)
- Ambos devem ter o `/etc/hosts` configurado
- **NENHUM dos nós deve ter VMs/LXCs com IDs conflitantes**

### 3.2 Configurar /etc/hosts em ambos os nós

**No Optiplex** (`pve-optiplex`, Shell via web UI `https://192.168.3.10:8006`):
```bash
cat >> /etc/hosts << 'EOF'
192.168.3.10  pve-optiplex pve-optiplex.lan
192.168.3.50  pve-inspiron pve-inspiron.lan
EOF
```

**No Inspiron** (`pve-inspiron`, Shell via web UI `https://192.168.3.50:8006`):
```bash
cat >> /etc/hosts << 'EOF'
192.168.3.10  pve-optiplex pve-optiplex.lan
192.168.3.50  pve-inspiron pve-inspiron.lan
EOF
```

### 3.3 Criar o cluster no Optiplex (nó principal)

No Shell do **pve-optiplex**:
```bash
# Criar o cluster
pvecm create mqt-homelab

# Verificar status
pvecm status
```

### 3.4 Juntar o Inspiron ao cluster

No Shell do **pve-inspiron**:
```bash
# Juntar ao cluster criado pelo Optiplex
pvecm add 192.168.3.10

# Será solicitada a senha de root do Optiplex
# Após confirmação, aguarde ~30s para a sincronização
```

### 3.5 Verificar o cluster

Em qualquer nó:
```bash
# Status do cluster
pvecm status

# Listar nós do cluster
pvecm nodes

# Verificar quorum
pvecm expected 2
```

Agora ao acessar `https://192.168.3.10:8006` ou `https://192.168.3.50:8006`, você verá **ambos os nós** no painel lateral esquerdo:
```
Datacenter
├── pve-optiplex
│   ├── VMs/LXCs...
│   └── Storage: local, pve-storage, data-storage
└── pve-inspiron
    ├── VM: Home Assistant (.22)
    ├── VM: Openclaw (.19)
    └── Storage: local
```

---

## Fase 4 — Compartilhamento de Arquivos (ISOs, Templates, Backups)

### Método 1: Upload via Interface Web (mais simples)

1. Acessar `https://192.168.3.10:8006`
2. Selecionar o storage `pve-storage` (ou `local`) → **ISO Images** ou **CT Templates**
3. Clicar em **Upload** e selecionar o arquivo do seu computador
4. O arquivo ficará disponível para criar VMs/LXCs naquele nó

### Método 2: Download direto de URL (dentro do Proxmox)

No Shell do Proxmox:
```bash
# Baixar ISO diretamente no storage do Proxmox
cd /mnt/pve-storage/template/iso/

# Exemplo: Ubuntu Server
wget https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso

# Exemplo: Debian 12 (base para LXCs manuais)
wget https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.8.0-amd64-netinst.iso
```

### Método 3: SCP do Lenovo (WSL) para o Proxmox

```bash
# Do WSL no Lenovo, enviar uma ISO para o Optiplex
scp ~/Downloads/minha-iso.iso root@192.168.3.10:/mnt/pve-storage/template/iso/

# Enviar para o Inspiron
scp ~/Downloads/minha-iso.iso root@192.168.3.50:/var/lib/vz/template/iso/
```

### Método 4: Acesso aos dados do HDD 1TB via SMB/Samba

Se quiser compartilhar os arquivos do HDD 1TB na rede local (acessível do Lenovo no Windows Explorer):

No Shell do **pve-optiplex**:
```bash
# Instalar Samba
apt install -y samba

# Configurar compartilhamento
cat >> /etc/samba/smb.conf << 'EOF'

[data]
   path = /mnt/data
   browseable = yes
   read only = no
   guest ok = no
   valid users = root
   create mask = 0644
   directory mask = 0755
EOF

# Definir senha Samba para root
smbpasswd -a root

# Reiniciar serviço
systemctl restart smbd
systemctl enable smbd
```

No Lenovo (Windows Explorer):
- Acessar: `\\192.168.3.10\data`
- Login: `root` / senha definida acima

### Método 5: NFS entre nós Proxmox (para ISOs compartilhadas no cluster)

Se quiser que ISOs do Optiplex fiquem disponíveis no Inspiron:

**No Optiplex (servidor NFS):**
```bash
# Instalar NFS server
apt install -y nfs-kernel-server

# Exportar o storage
echo "/mnt/pve-storage  192.168.3.0/24(rw,sync,no_subtree_check,no_root_squash)" \
  >> /etc/exports

exportfs -a
systemctl restart nfs-kernel-server
```

**No Inspiron (cliente NFS):**
```bash
# Instalar NFS client
apt install -y nfs-common

# Montar o storage do Optiplex
mkdir -p /mnt/optiplex-storage
mount 192.168.3.10:/mnt/pve-storage /mnt/optiplex-storage

# Adicionar ao fstab para persistência
echo "192.168.3.10:/mnt/pve-storage  /mnt/optiplex-storage  nfs  defaults,nofail  0  0" \
  >> /etc/fstab

# Registrar no Proxmox como storage NFS
pvesm add nfs optiplex-shared \
  --server 192.168.3.10 \
  --export /mnt/pve-storage \
  --content iso,vztmpl,backup \
  --path /mnt/optiplex-storage
```

Agora ambos os nós do cluster podem acessar as mesmas ISOs e templates.

---

## Fase 5 — Instalar Tailscale no Optiplex

```bash
# Instalar
curl -fsSL https://tailscale.com/install.sh | sh

# Ativar com subnet routing (expõe a rede local via Tailscale)
tailscale up \
  --advertise-routes=192.168.3.0/24 \
  --accept-routes

# Habilitar IP forwarding
echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf
sysctl -p

# No Tailscale Admin Console (https://login.tailscale.com/admin):
# → Machines → pve-optiplex → Edit Route Settings → Approve 192.168.3.0/24
```

---

## Fase 6 — Deploy dos Serviços (LXC via Helper Scripts)

Usar os [Proxmox VE Helper Scripts](https://community-scripts.github.io/ProxmoxVE/) no Shell do **pve-optiplex** (`https://192.168.3.10:8006` → Shell).

> 💡 **Em todos os scripts abaixo**, escolha a opção `Advanced` quando perguntado, para definir o IP estático, gateway e DNS manualmente.

### 6.1 AdGuard Home (IP: `192.168.3.5`)

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/adguard.sh)"
```
- IP: `192.168.3.5/24` | Gateway: `192.168.3.1` | DNS: `8.8.8.8`
- Storage: `pve-storage`
- Após instalar, acessar: `http://192.168.3.5:3000` para setup inicial

### 6.2 Uptime Kuma (IP: `192.168.3.6`)

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/uptimekuma.sh)"
```
- IP: `192.168.3.6/24` | Gateway: `192.168.3.1`
- Storage: `pve-storage`
- Painel: `http://192.168.3.6:3001`

### 6.3 Nginx Proxy Manager (IP: `192.168.3.7`)

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/nginx-proxy-manager.sh)"
```
- IP: `192.168.3.7/24` | Gateway: `192.168.3.1`
- Storage: `pve-storage`
- Painel: `http://192.168.3.7:81` (user: `admin@example.com`, pass: `changeme`)

### 6.4 Coolify (IP: `192.168.3.8`)

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/coolify.sh)"
```
- IP: `192.168.3.8/24` | Gateway: `192.168.3.1`
- Storage: `pve-storage`

### 6.5 n8n (IP: `192.168.3.11`) — no pve-inspiron

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/n8n.sh)"
```
- IP: `192.168.3.11/24` | Gateway: `192.168.3.1`

### 6.6 Memos (IP: `192.168.3.12`) — no pve-inspiron

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/memos.sh)"
```
- IP: `192.168.3.12/24` | Gateway: `192.168.3.1`

---

## Checklist de Execução

- [ ] **Fase 0** — Instalar Proxmox VE no Optiplex via USB (SSD 240GB)
- [ ] **Fase 1** — Configuração pós-instalação (repos, SSH, hardening)
- [ ] **Fase 2** — Montar HDD 320GB (`pve-storage`) e HDD 1TB (`data-storage`)
- [ ] **Fase 3** — Criar cluster `mqt-homelab` e juntar o Inspiron
- [ ] **Fase 4** — Configurar compartilhamento de ISOs (upload web ou NFS)
- [ ] **Fase 5** — Instalar Tailscale com subnet routing
- [ ] **Fase 6** — Deploy dos LXCs (AdGuard, Uptime Kuma, Nginx Proxy, Coolify)

---

## Verificação Final

Após completar todas as fases, validar:

```bash
# No Proxmox (qualquer nó)
pvecm status          # Cluster OK, 2 nós
pvesm status          # Storages visíveis
pct list              # LXCs criados

# Do WSL no Lenovo
nmap -sn 192.168.3.0/24   # Validar todos os IPs novos
curl http://192.168.3.5:3000   # AdGuard respondendo
curl http://192.168.3.6:3001   # Uptime Kuma respondendo
```

---

*Guia gerado em 14/05/2026 — Home Lab · Luis Eduardo*
