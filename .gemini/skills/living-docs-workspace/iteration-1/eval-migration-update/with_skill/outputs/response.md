# Proposta de Atualização — Documentação Viva
**Gatilho:** Migração do OpenClaw para bare-metal no Dell Optiplex (`lm-claw`, `192.168.3.30`, Debian 12 direto no hardware, sem Proxmox).
**Data da análise:** 15/05/2026

---

## Resumo do "Diff de Estado"

| Aspecto | Estado anterior (nos docs) | Estado atual (real) |
|---|---|---|
| Optiplex role | Nó Proxmox (`pve-optiplex`, IP `.10`) | Bare-metal Debian 12 (`lm-claw`, IP `.30`) |
| OpenClaw deployment | LXC 200 no `pve-optiplex` | Diretamente no hardware `lm-claw` |
| Cluster Proxmox | 2 nós (`pve-optiplex` + `pve-inspiron`) | 1 nó (`pve-inspiron` standalone) |
| IP `.10` | `pve-optiplex` (Proxmox) | Livre / não mais em uso para Proxmox |
| IP `.30` | `lm-claw` (LXC dentro do Optiplex) | `lm-claw` (o próprio Optiplex bare-metal) |
| Tailscale hostname | `openclaw` (`100.92.19.119`) referenciado como VM | Pendente confirmação se lm-claw registrou novo peer |

---

## Documentos Analisados

| Arquivo | Precisa atualizar? | Motivo |
|---|---|---|
| `homelab-implementation-report.html` | **Parcialmente** — fases de implementação ainda em estado "plano futuro" | As fases 1–3 do plano bare-metal ainda aparecem como `◯ pendente` e a Fase 0 ainda lista "Cluster 2 nós" como done |
| `docs/homelab-context.md` | **Sim — muito desatualizado** | Escrito em 14/05/2026 (antes da migração); toda a seção de hardware, VMs, plano de ação e acessos reflete o estado pré-migração com Proxmox no Optiplex |
| `homelab-network-docs.md` | **Parcialmente** — seções 9–12 têm inconsistências | Seção 9 ainda tem reserva DHCP para IP `.10 = pve-optiplex`; seção 10 (mapa de IPs) lista `.10` como Proxmox e `.19` como VM OpenClaw; seção 11 (arquitetura alvo) é o alvo antigo pré-bare-metal; seção 12 (fases) desatualizada |
| `homelab-inventory-audit.md` | **Sim — severamente desatualizado** | Menciona `192.168.3.19` como "MAC da VM Openclaw não documentado" e `192.168.3.10` como "VM HA legacy"; toda a estrutura assume Proxmox em ambos os hosts |
| `optiplex-openclaw-report.md` | **Informativo/histórico** — não requer atualização | É um relatório de análise datado de 15/05/2026 com recomendação de opções; documenta o processo de decisão, não o estado atual |
| `docs/openclaw-manual-config-log.md` | **Sim — item 3 desatualizado** | Item "Tailscale dentro do LXC" ainda descreve a situação como LXC; deve refletir que agora é bare-metal e Tailscale pode ser instalado diretamente |

---

## Mudanças Propostas — Arquivo a Arquivo

---

### 1. `docs/homelab-context.md`
**Nível de desatualização: alto** — documento de referência de 14/05/2026, antes da migração.

**Seção 2 — Infraestrutura Atual:**

Tabela de Hardware:

```
ANTES:
| Dell Optiplex 7040 | `pve-optiplex` | Proxmox instalado, IP `192.168.3.50` | Servidor principal (futuro) |
| Laptop Server      | `pve-laptop` / `openclaw-proxmox` | Proxmox instalado, IP `192.168.3.19` | Servidor secundário (atual) |

DEPOIS:
| Dell Optiplex 7040 | `lm-claw` | Debian 12 bare-metal, IP `192.168.3.30` | OpenClaw + Ollama (bare-metal) |
| Dell Inspiron 14R  | `pve-inspiron` | Proxmox VE standalone, IP `192.168.3.50` | Único nó Proxmox |
```

**Seção 2 — VMs e Serviços Ativos:**

```
ANTES: tabela com IPs .10, .16, .22, .50 (estado Hyper-V/pré-migração)

DEPOIS: substituir pela tabela atual:
| 192.168.3.30 | lm-claw        | OpenClaw + Ollama (bare-metal)      | 22, 11434+  | Dell Optiplex 7040 |
| 192.168.3.5  | adguard        | AdGuard Home (DNS)                  | 3000        | pve-inspiron       |
| 192.168.3.6  | uptime-kuma    | Monitoramento                       | 3001        | pve-inspiron       |
| 192.168.3.7  | nginx-proxy    | Nginx Proxy Manager                 | 81          | pve-inspiron       |
| 192.168.3.20 | postgres-db    | PostgreSQL                          | 5432        | pve-inspiron       |
| 192.168.3.22 | homeassistant-server | Home Assistant                | 8123        | pve-inspiron       |
| 192.168.3.50 | pve-inspiron   | Proxmox VE (único nó)               | 8006        | Dell Inspiron 14R  |
```

**Seção 3 — Inventário Completo de Dispositivos (Servidores):**

```
ANTES:
| 192.168.3.19 | BC-24-11-A5-32-E5 | openclaw-proxmox | Laptop Server (Proxmox host) | Cabeado |
| 192.168.3.50 | 74-86-7A-FA-8E-C8 | Dell (pve-optiplex) | Optiplex 7040 (Proxmox) | Cabeado |

DEPOIS:
| 192.168.3.30 | 74:86:7A:FA:8E:C8 | lm-claw (Dell Optiplex 7040) | Debian 12 bare-metal | Cabeado |
| 192.168.3.50 | BC:24:11:A5:32:E5 | pve-inspiron (Dell Inspiron 14R) | Proxmox VE standalone | Cabeado |
```

**Seção 3 — VMs (MACs virtuais Hyper-V):** remover inteiramente (eram VMs do laptop antigo, não existem mais na arquitetura atual).

**Seção 4 — Tailscale:**

```
ANTES:
| 100.71.89.124 | openclaw-proxmox | Linux | Online |
| 100.92.19.119 | openclaw         | Linux | Idle   |

DEPOIS:
| 100.71.89.124 | openclaw-proxmox (pve-inspiron) | Linux | Online |
| (a confirmar) | lm-claw                         | Linux | (instalar Tailscale no bare-metal) |
  — remover entrada 100.92.19.119 openclaw (VM desligada/removida)
```

**Seção 5 — Objetivo Final:** substituir pela arquitetura atual (já atingida):

```
ANTES: plano futuro com Optiplex como Proxmox principal

DEPOIS:
ESTADO ATUAL (15/05/2026)
├── Dell Optiplex 7040 — lm-claw (Debian 12 bare-metal)
│   └── OpenClaw + Ollama (gemma4:e2b, gemma3:4b, qwen3:8b, nomic-embed-text)
│
├── Dell Inspiron 14R — pve-inspiron (Proxmox VE standalone)
│   ├── LXC: AdGuard Home (.5), Uptime Kuma (.6), Nginx Proxy (.7), PostgreSQL (.20)
│   └── VM: Home Assistant (.22)
│
└── LUIS-LAPTOP (cliente) → acesso via LAN + Tailscale
```

**Seção 6 — Plano de Ação:** atualizar status de todas as fases (1–5 concluídas) e adicionar próximos passos (Tailscale no lm-claw, merge da branch).

**Seção 7 — Acessos:**

```
ANTES:
| Proxmox Optiplex | https://192.168.3.50:8006 |
| Proxmox Laptop   | https://192.168.3.19:8006 |
| Home Assistant   | http://192.168.3.10:8123  |

DEPOIS:
| Proxmox (Inspiron) | https://192.168.3.50:8006 | único nó Proxmox |
| lm-claw (OpenClaw) | ssh luismarquitti@192.168.3.30 | bare-metal |
| Home Assistant     | http://192.168.3.22:8123  | VM no Inspiron |
| AdGuard            | http://192.168.3.5:3000   | LXC no Inspiron |
```

**Rodapé:** atualizar de "14/05/2026 — Sessão de planejamento inicial" para "15/05/2026 — Pós-migração bare-metal".

---

### 2. `homelab-network-docs.md`
**Nível de desatualização: médio** — seções 1–8 já refletem o estado bare-metal corretamente. Seções 9–12 têm inconsistências.

**Seção 9 — Reservas DHCP (linha do Optiplex):**

```
ANTES:
| `192.168.3.10` | `74-86-7A-FA-8E-C8` | pve-optiplex | Proxmox Principal |

DEPOIS:
| `192.168.3.30` | `74:86:7A:FA:8E:C8` | lm-claw | Debian bare-metal (OpenClaw) |
  — remover linha 192.168.3.10 (IP não mais em uso pelo Optiplex)
  — remover linha 192.168.3.19 (VM openclaw removida — o host Inspiron usa .50)
```

**Seção 10 — Mapa de IPs consolidado:**

```
ANTES:
.10   pve-optiplex (Proxmox Principal)
.19   VM Proxmox: Openclaw    ← Inspiron 14R (.50)
.20   LUIS-PC (Dell Optiplex 7140, Hyper-V host)
.30   (implícito: lm-claw LXC)

DEPOIS:
.10   (livre / não mais em uso)
.19   (livre / VM removida)
.20   LUIS-PC (Dell Optiplex 7140, Hyper-V host)  ← manter
.30   lm-claw (Dell Optiplex 7040, Debian bare-metal, OpenClaw)
```

**Seção 11 — Arquitetura Alvo:** esta seção ainda descreve o "alvo" antigo (Optiplex como Proxmox principal + Laptop como secundário). Deve ser atualizada para refletir que a arquitetura alvo foi atingida:

```
ANTES (titulo):
"## 11. Arquitetura Alvo (Pós-Migração)"

DEPOIS:
"## 11. Arquitetura Atual (Pós-Migração Bare-Metal — 15/05/2026)"

E o diagrama:
ESTADO ATUAL
├── Dell Optiplex 7040 — lm-claw (Debian 12 bare-metal, .30)
│   └── OpenClaw + Ollama  ← em produção ✅
│
├── Dell Inspiron 14R — pve-inspiron (Proxmox, .50) ← único nó Proxmox
│   ├── LXC: AdGuard (.5), Uptime Kuma (.6), Nginx (.7), PostgreSQL (.20)
│   └── VM: Home Assistant definitiva (.22)  ← em produção ✅
│
└── LUIS-LAPTOP (cliente) → LAN + Tailscale
```

**Seção 12 — Status das Fases:** atualizar status das fases:

```
ANTES:
| Fase 1.2 | VM Openclaw no Proxmox | ✅ Concluída |
| Fase 2   | Reservas DHCP no Mercusys | ⏳ Pendente |
| Fase 4   | LXC AdGuard Home no Proxmox | ⏳ Pendente |
| Fase 5   | LXC Uptime Kuma no Proxmox | ⏳ Pendente |

DEPOIS (adicionar linhas / corrigir):
| Fase 1.2 | VM Openclaw no Proxmox (substituída por bare-metal) | ✅ Migrado para bare-metal |
| Fase Bare-Metal | OpenClaw bare-metal no Optiplex (lm-claw) | ✅ Concluída |
| Fase 2   | Reservas DHCP no Mercusys | ⏳ Pendente |
| Fase 4   | LXC AdGuard Home no Inspiron | ✅ Concluída |
| Fase 5   | LXC Uptime Kuma no Inspiron | ✅ Concluída |
```

**Rodapé:** atualizar de "14/05/2026" para "15/05/2026".

---

### 3. `homelab-inventory-audit.md`
**Nível de desatualização: alto** — o documento inteiro é um guia de auditoria escrito em 14/05/2026, antes da migração. Vários itens que eram pendentes já foram resolvidos.

**Tabela "O que falta identificar":**

```
ANTES:
| 192.168.3.19 | MAC da VM Openclaw não documentado | 🟡 Média |
| 192.168.3.10 | VM HA legacy — confirmar que pode ser desligada | 🟡 Média |

DEPOIS:
| 192.168.3.19 | VM Openclaw removida — IP liberado | ✅ Resolvido |
| 192.168.3.10 | IP do pve-optiplex (Proxmox removido) — IP liberado | ✅ Resolvido |
  — Remover das pendências ou marcar como resolvido com nota da migração
```

**PASSO 3 — Coletar MACs das VMs no Proxmox:** a instrução usa `ssh root@192.168.3.50` (Inspiron, correto) mas ainda menciona `VMID_openclaw` como se fosse um VM ativo. Adicionar nota:

```
> Nota (15/05/2026): A VM openclaw (.19) foi desligada e o Optiplex foi migrado para
> Debian bare-metal (lm-claw, .30). Os MACs relevantes para a auditoria são agora:
> lm-claw (físico): 74:86:7A:FA:8E:C8 — documentado no hosts.yml.
```

**Checklist de Execução:** marcar como concluído o passo 4 (HA legacy .10 desligada) e adicionar nota sobre PASSO 3 (openclaw VM removida).

**Rodapé:** atualizar de "14/05/2026" para "15/05/2026 — pós-migração bare-metal".

---

### 4. `docs/openclaw-manual-config-log.md`
**Nível de desatualização: baixo** — a maior parte do documento é válida pois `lm-claw` é o mesmo host. Apenas o item 3 precisa de ajuste.

**Item 3 — Tailscale dentro do LXC:**

```
ANTES:
### 3. Tailscale dentro do LXC
- **Situação atual:** `tailscaled.service` não roda dentro do LXC `lm-claw`.
  O openclaw registra erro ao tentar publicar a porta via `tailscale serve`, mas o gateway
  continua funcional (apenas sem exposição Tailscale direta).
- **Status:** Pendente — investigar se LXC precisa de `nesting=1` ou `keyctl=1`...

DEPOIS:
### 3. Tailscale no Bare-Metal
- **Situação atual:** `lm-claw` agora roda Debian 12 diretamente no hardware (sem LXC).
  Tailscale pode ser instalado e autenticado normalmente via script oficial.
- **Status:** Pendente — instalar e autenticar Tailscale diretamente no host bare-metal.
- **Detalhes Técnicos:**
  - Instalar via script oficial: `curl -fsSL https://tailscale.com/install.sh | sh`
  - Autenticar com `tailscale up --advertise-routes=192.168.3.0/24`
  - Não há mais restrições de LXC (nesting, keyctl) — bare-metal suporta nativamente.
```

---

### 5. `homelab-implementation-report.html`
**Nível de desatualização: baixo** — o documento já foi atualizado em 15/05/2026 e reflete a arquitetura bare-metal no cabeçalho, diagrama e seções de configuração. Há apenas dois pontos que merecem atenção:

**Seção 10 — Plano de Implementação (Fase 0):**

```
ANTES:
<li class="done">Cluster Proxmox mqt-homelab — 2 nós, Quorate</li>

DEPOIS:
<li class="done">Cluster Proxmox mqt-homelab — 2 nós, Quorate (descomissionado — pve-optiplex removido)</li>
```

**Seção 10 — Fases 1, 2, 3 ainda como "pendente":**

```
ANTES:
Fase 1 — "▶ Próximo" (Backup e Decommission do Optiplex Proxmox)
Fase 2 — "◯ Fase 2" (Instalar Debian 12 no Optiplex)
Fase 3 — "◯ Fase 3" (Provisionar OpenClaw Bare-Metal via Ansible)

DEPOIS (se a migração foi concluída):
Fase 1 — "✓ Concluído" (Decommission do Optiplex Proxmox)
Fase 2 — "✓ Concluído" (Debian 12 instalado no Optiplex — lm-claw)
Fase 3 — "✓ Concluído" (OpenClaw bare-metal provisionado e em produção)
  — Fase 4 passa a ser "▶ Próximo" (Criar AdGuard e Nginx no pve-inspiron)
```

> Nota: esta atualização só deve ser aplicada se a migração estiver de fato concluída (OpenClaw rodando em produção no bare-metal). O usuário confirmou isso na mensagem.

**Tabela Nginx Proxy Manager (Seção 4, linha `pve-optiplex.lan`):**

```
ANTES:
| pve-optiplex.lan | 192.168.3.10 | 8006 | self-signed |
| pve-laptop.lan   | 192.168.3.19 | 8006 | self-signed |

DEPOIS:
| pve-inspiron.lan | 192.168.3.50 | 8006 | self-signed |
| lm-claw.lan      | 192.168.3.30 | (porta do openclaw ou SSH) | — |
  — remover pve-laptop.lan (não existe mais)
```

---

## Documentos que NÃO precisam de atualização

- `optiplex-openclaw-report.md` — relatório de análise histórico (decisão de migrar); é um log de decisão, não estado atual. Preservar como está.
- `docs/setup_proxmox_lxc.md` — guia de referência estático (how-to), não rastreia estado.
- `README.md` — apenas descrição do repositório.

---

## Prioridade de Atualização

| Prioridade | Arquivo | Motivo |
|---|---|---|
| 🔴 Alta | `docs/homelab-context.md` | Totalmente desatualizado; é o arquivo de contexto base para todas as conversas |
| 🔴 Alta | `homelab-inventory-audit.md` | Referencia VMs e IPs que não existem mais |
| 🟡 Média | `homelab-network-docs.md` | Seções 9–12 com inconsistências; seções 1–8 já corretas |
| 🟡 Média | `homelab-implementation-report.html` | Fases do plano ainda como "pendente" quando já foram executadas |
| 🟢 Baixa | `docs/openclaw-manual-config-log.md` | Apenas item 3 precisa de ajuste de texto |

---

## Aprovação

Posso aplicar essas atualizações? Você pode aprovar todas, apenas algumas, ou pedir ajustes antes de eu editar qualquer arquivo.

Sugestão: começar pelos dois de prioridade alta (`docs/homelab-context.md` e `homelab-inventory-audit.md`), que são documentos de referência usados como contexto em sessões futuras.
