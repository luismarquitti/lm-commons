# Análise de Docs: Migração OpenClaw para Bare-Metal (lm-claw)

**Data:** 15/05/2026
**Branch:** feat/openclaw-bare-metal
**Mudança:** OpenClaw migrado para bare-metal no Dell Optiplex 7040 — hostname `lm-claw`, IP `192.168.3.30`, Debian direto no hardware (sem Proxmox).

---

## Resumo da situação

Após analisar todos os arquivos de documentação do repositório, concluo que a maioria dos docs **já foi atualizada** para refletir a arquitetura bare-metal. No entanto, **três arquivos ainda contêm informação desatualizada** e precisam de correção.

---

## Arquivos que precisam de atualização

### 1. `README.md` — DESATUALIZADO

O README na raiz do projeto ainda descreve a arquitetura como cluster de dois nós Proxmox e lista o OpenClaw como LXC no `pve-optiplex`.

**Mudanças necessárias:**

**Seção Hardware — tabela:**

| Antes | Depois |
|---|---|
| `pve-optiplex` / `192.168.3.10` / "Nó primário do cluster" | `lm-claw` / `192.168.3.30` / "Bare-metal Debian 12 — OpenClaw + Ollama" |

**Seção Serviços — linha Openclaw-Prod:**

| Antes | Depois |
|---|---|
| `Openclaw-Prod \| 192.168.3.30 \| — \| pve-optiplex` | `Openclaw-Prod (lm-claw) \| 192.168.3.30 \| varies \| bare-metal Debian` |

**Cabeçalho:**

```
# Antes
Infrastructure-as-code para o home lab pessoal rodando em cluster Proxmox VE de dois nós.

# Depois
Infrastructure-as-code para o home lab pessoal: um nó Proxmox VE (Dell Inspiron 14R) e um servidor bare-metal Debian (Dell Optiplex 7040 — lm-claw).
```

**Cluster line:**

```
# Antes
Cluster: `mqt-homelab` | Rede: `192.168.3.0/24` | VPN: Tailscale

# Depois
Proxmox: `pve-inspiron` (único nó) | Bare-metal: `lm-claw` | Rede: `192.168.3.0/24` | VPN: Tailscale
```

**Seção Uso — exemplo de limit:**

```bash
# Antes
ansible-playbook playbooks/00-bootstrap.yml --limit pve-optiplex

# Depois
ansible-playbook playbooks/00-bootstrap.yml --limit lm-claw
```

---

### 2. `docs/homelab-context.md` — MUITO DESATUALIZADO

Este é o arquivo mais crítico e mais desatualizado. Ele ainda descreve o estado inicial do projeto (14/05/2026), antes de qualquer migração, com o Optiplex como nó Proxmox com IP `192.168.3.50` e o OpenClaw como uma VM futura a ser migrada.

**Mudanças necessárias:**

**Seção 2. Infraestrutura Atual — tabela Hardware:**

| Antes | Depois |
|---|---|
| `Dell Optiplex 7040 \| pve-optiplex \| Proxmox instalado, IP 192.168.3.50 \| Servidor principal (futuro)` | `Dell Optiplex 7040 \| lm-claw \| Debian 12 bare-metal, IP 192.168.3.30 \| Servidor OpenClaw + Ollama` |
| `Laptop Server \| pve-laptop / openclaw-proxmox \| Proxmox instalado, IP 192.168.3.19 \| Servidor secundário (atual)` | `Dell Inspiron 14R \| pve-inspiron \| Proxmox VE, IP 192.168.3.50 \| Único nó Proxmox` |

**Seção 2 — VMs e Serviços Ativos:** A tabela inteira está obsoleta. O estado atual dos serviços é o descrito no `homelab-network-docs.md` (seção 3/4).

**Seção 5. Objetivo Final:** Substituir o diagrama "ALVO" pelo estado atual — a migração foi concluída, não é mais um objetivo futuro.

**Seção 6. Plano de Ação — Fases:**
- Fase 4 "Migrar VM Openclaw" precisa ser marcada como **concluída**, mas com a nota de que a opção escolhida foi bare-metal (Opção C) e não migração de VM.
- Fase 1 deve referenciar pve-inspiron (não pve-optiplex com IP .50).

**Seção 8. Projetos de Software Ativos:**
```
# Antes
Openclaw | Framework de IA principal | VM no laptop server (a migrar para Optiplex)

# Depois
Openclaw | Framework de IA principal | Bare-metal no Optiplex (lm-claw, 192.168.3.30)
```

**Seção 9. Decisões Técnicas:**
- Adicionar: "Migração Openclaw: bare-metal no Optiplex (Opção C) — Debian 12 direto no hardware, sem camada Proxmox"
- Remover/atualizar: "Storage Optiplex: SSD 240GB → OS Proxmox | HDD 320GB → storage de VMs" → agora é "NVMe 238GB → OS + OpenClaw | HDD 298GB → /mnt/openclaw-storage"

**Rodapé:**
```
# Antes
Última atualização: 14/05/2026 — Sessão de planejamento inicial do Home Lab

# Depois
Última atualização: 15/05/2026 — Migração OpenClaw para bare-metal concluída (lm-claw)
```

---

### 3. `homelab-network-docs.md` — PARCIALMENTE DESATUALIZADO

A maior parte deste arquivo já está correta (seções 1–4 descrevem lm-claw corretamente). Mas algumas seções ainda têm resquícios do estado antigo.

**Seção 9. Reservas DHCP:**

A tabela de reservas ainda lista o Optiplex com o IP e hostname antigos:

| Antes | Depois |
|---|---|
| `192.168.3.10 \| 74-86-7A-FA-8E-C8 \| pve-optiplex \| Proxmox Principal` | `192.168.3.30 \| 74-86-7A-FA-8E-C8 \| lm-claw \| Bare-Metal OpenClaw` |
| `192.168.3.50 \| 74-86-7A-FA-8E-C8 \| pve-inspiron \| (Antigo IP do Proxmox, migrar para .10)` | `192.168.3.50 \| BC:24:11:A5:32:E5 \| pve-inspiron \| Único nó Proxmox` |

> Nota: O MAC `74-86-7A-FA-8E-C8` aparece duplicado na tabela atual (para `.10` e `.50`). Após a migração, esse MAC pertence ao `lm-claw` em `.30`. O pve-inspiron tem MAC `BC:24:11:A5:32:E5`.

**Seção 10. Mapa de IPs:**

```
# Antes
.10   pve-optiplex (Proxmox Principal)
.19   VM Proxmox: Openclaw  ← Inspiron 14R (.50)
.30   [ausente]

# Depois
.10   [livre ou reservado para futuro uso]
.19   openclaw-legacy (VM parada, Inspiron 14R)  ← ⛔ Desligada
.30   lm-claw (Dell Optiplex 7040 — Bare-Metal OpenClaw + Ollama)
```

**Seção 11. Arquitetura Alvo:**

O diagrama ainda mostra Openclaw como VM no Inspiron e o Optiplex como `LUIS-PC/Hyper-V`. Deve ser substituído pelo estado atual já documentado nas seções 1–3.

**Seção 12. Status das Fases:**

| Fase | Antes | Depois |
|---|---|---|
| Fase 1.2 | VM Openclaw no Proxmox — ✅ Concluída | Openclaw bare-metal no Optiplex — ✅ Concluída |
| (nova) Fase 6 | — | Migração bare-metal OpenClaw (Optiplex → Debian 12 direto) — ✅ Concluída |

---

## Arquivos que já estão corretos (não precisam de alteração)

| Arquivo | Status | Motivo |
|---|---|---|
| `ansible/inventory/hosts.yml` | OK | Já reflete a arquitetura atual: grupo `baremetal` com `lm-claw` em `.30`, grupo `proxmox` só com `pve-inspiron` em `.50` |
| `CLAUDE.md` | OK | Já descreve "single-node Proxmox (Dell Inspiron 14R) plus bare-metal Debian server (Dell Optiplex 7040 — lm-claw)" |
| `homelab-implementation-report.html` | OK | Já documenta lm-claw como bare-metal em `.30`, diagrama de topologia correto |
| `optiplex-openclaw-report.md` | OK | É um relatório histórico de análise de opções (pré-decisão); não precisa ser alterado — é um artefato de decisão |
| `homelab-inventory-audit.md` | OK | É uma auditoria histórica de dispositivos de rede (IoT, MACs); não descreve a arquitetura de servidores, sem impacto |

---

## Prioridade de atualização

| Arquivo | Prioridade | Impacto |
|---|---|---|
| `docs/homelab-context.md` | Alta | É o arquivo mais consultado como "estado atual" — está completamente desatualizado |
| `README.md` | Média | Primeira impressão do repositório — tabelas de hardware e serviços incorretas |
| `homelab-network-docs.md` | Baixa | Maioria correta; apenas seções 9, 10 e 11 têm resquícios do estado antigo |
