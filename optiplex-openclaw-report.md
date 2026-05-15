# Report: Expansão de Recursos para o OpenClaw-Prod

**Data:** 15/05/2026  
**Contexto:** Análise de opções para aumentar a memória disponível ao `openclaw-prod`, incluindo a hipótese de remover o Proxmox do Dell Optiplex e instalar o OpenClaw diretamente no hardware.

---

## 1. Estado Atual do Home Lab

### Hardware dos nós Proxmox

| Atributo | pve-optiplex | pve-inspiron |
|---|---|---|
| Hardware | Dell Optiplex 7040 | Dell Inspiron 14R |
| CPU | i5-6500 @ 3.2GHz, **4 cores físicos** | i5-3337U @ 1.8GHz, **2 cores físicos** (4 threads HT) |
| RAM | **16GB DDR4 2133** (2×8GB) | **8GB DDR3 1600** (2×4GB) |
| Slots RAM livres | **DIMM3 e DIMM4 (2 slots vazios)** | Nenhum — todos ocupados |
| Disco principal | NVMe 238GB | SSD 224GB |
| Discos adicionais | HDD 298GB + HDD 931GB | — |
| IP | 192.168.3.10 | 192.168.3.50 |

### Serviços ativos por nó

**pve-optiplex** — 2.9GB RAM usada de 16GB:

| LXC | Hostname | Cores | RAM alocada |
|---|---|---|---|
| 100 | adguard | 1 | 512 MB |
| 102 | nginx-proxy | 1 | 1.024 MB |
| 200 | openclaw-prod | 3 | **12.288 MB** |

**pve-inspiron** — 3.8GB RAM usada de 8GB:

| ID | Tipo | Hostname | Cores | RAM alocada |
|---|---|---|---|---|
| 101 | LXC | uptime-kuma | 1 | 512 MB |
| 103 | LXC | coolify | 2 | 2.048 MB |
| 104 | LXC | postgres-db | 2 | 2.048 MB |
| 110 | LXC | n8n | 2 | 1.024 MB |
| 111 | LXC | memos | 1 | 256 MB |
| 150 | VM | OpenClaw-Server | 2 | 4.096 MB (parada) |
| 151 | VM | homeassistant-server | 2 | 2.048 MB |

### Por que 12GB não é suficiente para o OpenClaw

O OpenClaw com Ollama rodando modelos locais consome memória na seguinte proporção:

| Componente | RAM estimada |
|---|---|
| OpenClaw gateway + plugins | ~800 MB |
| Sistema operacional (LXC Debian) | ~300 MB |
| `nomic-embed-text` (embedding) | ~400 MB |
| `gemma3:4b` (fallback) | ~2.5 GB |
| `gemma4:e2b` (primário, desejado) | ~7.2 GB |
| **Total estimado** | **~11.2 GB** |

Com 12GB disponíveis sobram menos de 800MB de margem — insuficiente para picos de uso ou carregamento simultâneo de modelos. Um modelo como `deepseek-coder-v2:16b` (8.9GB) simplesmente não cabe junto aos demais.

---

## 2. Opções Analisadas

### Opção A — Upgrade de RAM no Optiplex (recomendada)

O Optiplex 7040 suporta até **64GB DDR4** e possui dois slots livres (DIMM3 e DIMM4). Adicionar dois pentes aumenta a RAM total sem tocar na arquitetura.

| Configuração | RAM total | openclaw-prod pode ter | Custo estimado |
|---|---|---|---|
| + 2×8GB DDR4 2133 | **32 GB** | até 28 GB | R$150–250 |
| + 2×16GB DDR4 2133 | **48 GB** | até 44 GB | R$300–500 |
| + 2×8GB (upgrade os 2×8 para 2×16) | **32 GB** | até 28 GB | R$150–250 |

Com 32GB, o `openclaw-prod` poderia ter **26–28GB** — comportando `gemma4:e2b` + `deepseek-coder-v2:16b` + `gemma3:4b` + embedding simultaneamente, com ampla margem.

**Vantagens:**
- Zero downtime — upgrade de RAM não requer reinstalação
- Mantém toda a arquitetura Proxmox e flexibilidade de LXC/VM
- AdGuard e Nginx permanecem no Optiplex, sem impacto no pve-inspiron
- Rollback trivial (basta remover os pentes)
- Menor risco de toda a lista

**Desvantagens:**
- Custo de hardware (modesto)
- Requer desligar o Optiplex por ~10 minutos para inserir os pentes

---

### Opção B — Migrar AdGuard e Nginx para o Inspiron e expandir LXC no Optiplex

Sem comprar hardware, é possível liberar mais RAM para o `openclaw-prod` movendo os serviços menores para o pve-inspiron.

**Situação no Inspiron após migração:**

| Serviço | RAM |
|---|---|
| Existentes (todos) | ~5.9 GB |
| adguard (migrado) | + 512 MB |
| nginx-proxy (migrado) | + 1.024 MB |
| **Total** | **~7.4 GB de 8 GB** |

Ficam apenas ~600MB livres no Inspiron — margem perigosamente baixa.

No Optiplex, o `openclaw-prod` poderia ser expandido para **~14.5GB** (16GB − 1.5GB para Proxmox host).

**Vantagens:**
- Sem custo de hardware
- openclaw-prod ganha ~2.5GB adicionais

**Desvantagens:**
- pve-inspiron fica sem margem operacional (risco de OOM sob pico)
- i5-3337U tem apenas 2 cores físicos a 1.8GHz — AdGuard + Nginx + 5 LXCs + 1 VM = pressão de CPU
- AdGuard é serviço crítico de DNS — se o Inspiron travar, toda a resolução DNS da rede cai
- Ganho pequeno (só +2.5GB) que não resolve o problema a médio prazo

---

### Opção C — Remover Proxmox do Optiplex e instalar OpenClaw bare-metal

Eliminar a camada de virtualização e rodar o OpenClaw diretamente no hardware do Optiplex, movendo AdGuard e Nginx para o Inspiron.

#### O que muda

| Aspecto | Antes | Depois |
|---|---|---|
| OpenClaw RAM disponível | 12 GB (LXC) | **16 GB** (bare-metal) |
| OpenClaw CPU | 3 de 4 cores (LXC) | **4 cores** |
| Overhead hypervisor | ~3–5% CPU, ~512MB RAM | Zero |
| AdGuard + Nginx | pve-optiplex | → pve-inspiron |
| Gestão do Optiplex | Proxmox web UI + Ansible | SSH + systemd direto |
| Snapshots / rollback | Disponível via Proxmox | **Inexistente** |
| Isolamento de processos | LXC (namespaces) | Nenhum |
| pve-inspiron como SPOF | Não | **Sim** (todos os outros serviços) |

#### Ganho real de RAM

A diferença entre LXC e bare-metal é o overhead do Proxmox host (~512MB–1GB de kernel, ksmd, pve-manager) e o fato de o LXC ter um limite configurado. Com 16GB bare-metal, o ganho efetivo sobre os 12GB atuais é de **apenas 4GB** — e a Opção A com 2×8GB DDR4 entrega **16GB adicionais** pelo mesmo esforço de mudança e menos risco.

#### Vantagens

- Máximo de performance de CPU para inferência local (sem overhead de virtualização, ~3–5% de ganho)
- Todos os 16GB de RAM disponíveis sem limite de LXC
- Setup mais simples para o OpenClaw em si (um servidor, um propósito)

#### Desvantagens

1. **pve-inspiron vira single point of failure** para PostgreSQL, Coolify, n8n, Memos, Uptime Kuma, Home Assistant — uma falha no Inspiron derruba toda a stack
2. **AdGuard no Inspiron** — DNS da rede fica dependente de um hardware com só 2 cores físicos e 8GB RAM já muito utilizados (~7.4GB após migração)
3. **Sem snapshots** — qualquer atualização do OpenClaw, reinstalação de plugin ou erro de configuração não tem rollback rápido
4. **Perda de flexibilidade** — para criar um novo serviço no futuro, seria necessário reinstalar Proxmox ou containerizar manualmente com Docker/systemd
5. **Ganho de RAM modesto** — apenas +4GB comparado à configuração atual do LXC; a Opção A entrega o dobro disso com menos risco
6. **Complexidade de migração** — AdGuard e Nginx precisam ser reprovisados no Inspiron; IPs podem mudar; janela de downtime de DNS
7. **Disco de 1TB** — o HDD de dados (`/mnt/data`, Samba share) precisa ser reanexado e remontado no OS bare-metal sem a abstração do Proxmox storage

---

## 3. Comparativo Final

| Critério | Opção A (RAM upgrade) | Opção B (migrar serviços) | Opção C (bare-metal) |
|---|---|---|---|
| RAM disponível para OpenClaw | **28–44 GB** | 14.5 GB | 16 GB |
| Custo | R$150–500 | Zero | Zero |
| Risco operacional | Muito baixo | Alto (Inspiron saturado) | Médio-alto |
| Downtime necessário | ~10 min (desligar para RAM) | 1–2h (migração de serviços) | 4–8h (reinstalação completa) |
| Mantém flexibilidade Proxmox | Sim | Sim | **Não** |
| Rollback se algo der errado | Trivial | Moderado | Difícil |
| Benefício a médio prazo | **Alto** (resolve RAM para crescimento) | Baixo | Médio |

**Recomendação:** Opção A. O upgrade de RAM é o caminho mais seguro, mais impactante e com menor custo operacional. A Opção C entrega menos memória do que a Opção A e sacrifica toda a flexibilidade de virtualização, além de saturar o Inspiron — que já está próximo do limite com os serviços atuais.

---

## 4. Plano de Implementação — Opção A (Upgrade de RAM)

### Pré-requisitos

- [ ] Adquirir 2× pentes DDR4 2133 MHz (ou superior, compatível com i5-6500) — formato **DIMM desktop**, não SO-DIMM
- [ ] Recomendado: 2×8GB (total 32GB) ou 2×16GB (total 48GB)
- [ ] Pulseira antiestática ou superfície aterrada
- [ ] Janela de manutenção de ~15 minutos

### Fase 1 — Preparação (sem downtime)

**1.1 — Snapshot dos LXCs no Optiplex**
```bash
# No pve-optiplex
pct snapshot 100 pre-ram-upgrade --description "Antes do upgrade de RAM 15/05/2026"
pct snapshot 102 pre-ram-upgrade --description "Antes do upgrade de RAM 15/05/2026"
pct snapshot 200 pre-ram-upgrade --description "Antes do upgrade de RAM 15/05/2026"
```

**1.2 — Verificar inventário de slots antes de abrir o gabinete**
```bash
ssh root@192.168.3.10 "dmidecode -t memory | grep -E 'Locator|Size|Speed|Type'"
```

### Fase 2 — Instalação física

**2.1 — Graceful shutdown do Optiplex**
```bash
# No laptop (WSL), parar os LXCs em ordem segura
ssh root@192.168.3.10 "pct shutdown 200 && pct shutdown 102 && pct shutdown 100"
ssh root@192.168.3.10 "shutdown -h now"
```

> **Impacto durante o downtime:**
> - DNS local (AdGuard) indisponível — dispositivos da rede usarão DNS fallback do roteador (8.8.8.8)
> - OpenClaw offline
> - Nginx Proxy Manager offline

**2.2 — Instalar os pentes de RAM nos slots DIMM3 e DIMM4**

- Inserir os dois novos pentes nos slots livres (DIMM3 e DIMM4)
- Não remover os pentes existentes em DIMM1 e DIMM2
- Pressionar até ouvir o clique de travamento em ambos os lados

**2.3 — Ligar o Optiplex e verificar o POST**
- Acompanhar o boot pela tela ou BIOS (F2 no boot para confirmar RAM reconhecida)

### Fase 3 — Verificação pós-hardware

**3.1 — Confirmar RAM reconhecida pelo Proxmox**
```bash
ssh root@192.168.3.10 "free -h && dmidecode -t memory | grep -E 'Size:|Locator:' | grep -v 'No Module'"
```
Deve mostrar os 4 slots com memória instalada e o total correto (32 ou 48 GB).

**3.2 — Aguardar LXCs subirem automaticamente**
```bash
ssh root@192.168.3.10 "pct list"
# Todos devem retornar ao status 'running'
```

### Fase 4 — Reconfigurar o openclaw-prod com mais RAM

**4.1 — Expandir memória do LXC 200**

```bash
# Parar o LXC antes de alterar memória
ssh root@192.168.3.10 "pct shutdown 200"

# Aumentar memória (exemplo: 26GB num sistema de 32GB total)
ssh root@192.168.3.10 "pct set 200 --memory 26624 --swap 4096"

# Aumentar cores para 4 (todos os disponíveis)
ssh root@192.168.3.10 "pct set 200 --cores 4"

# Reiniciar o LXC
ssh root@192.168.3.10 "pct start 200"
```

Distribuição recomendada com 32GB:

| LXC | Memória |
|---|---|
| adguard (100) | 512 MB (sem alteração) |
| nginx-proxy (102) | 1.024 MB (sem alteração) |
| openclaw-prod (200) | **26.624 MB** (~26 GB) |
| Proxmox host reserva | ~4 GB |

**4.2 — Verificar memória disponível no openclaw-prod**
```bash
ssh -i ~/.ssh/id_ed25519 luismarquitti@192.168.3.30 "free -h"
```

### Fase 5 — Instalar novos modelos Ollama

Com ~26GB disponíveis, é possível carregar simultaneamente:

```bash
ssh -i ~/.ssh/id_ed25519 luismarquitti@192.168.3.30 "
export NVM_DIR=~/.nvm && source ~/.nvm/nvm.sh

# Modelos de uso geral / agente
ollama pull gemma4:e2b         # 7.2GB — multimodal, thinking, primário

# Modelo de codificação
ollama pull qwen3:8b           # 5.2GB — melhor custo-benefício para código

# Opcional: potência máxima de codificação (com 26GB cabe junto)
ollama pull deepseek-coder-v2:16b  # 8.9GB — qualidade GPT-4 para código

# Já instalado (manter)
# nomic-embed-text — 274MB (embedding)
# gemma2:2b — pode remover após validar gemma4:e2b
"
```

Orçamento de RAM com 26GB após upgrade:

| Modelo | RAM |
|---|---|
| gemma4:e2b | 7.2 GB |
| qwen3:8b | 5.2 GB |
| deepseek-coder-v2:16b | 8.9 GB |
| nomic-embed-text | 0.4 GB |
| OpenClaw + SO | 1.1 GB |
| **Total** | **~22.8 GB** — 3.2 GB de margem |

### Fase 6 — Configurar modelos no OpenClaw

**6.1 — Atualizar modelo primário**
```bash
ssh -i ~/.ssh/id_ed25519 luismarquitti@192.168.3.30 "
export NVM_DIR=~/.nvm && source ~/.nvm/nvm.sh
openclaw config set 'agents.defaults.model.primary' 'ollama/gemma4:e2b'
openclaw config set 'agents.defaults.model.fallbacks' '[\"ollama/gemma3:4b\", \"ollama/gemma2:2b\"]'
"
```

**6.2 — Reiniciar gateway e verificar**
```bash
ssh -i ~/.ssh/id_ed25519 luismarquitti@192.168.3.30 "
export NVM_DIR=~/.nvm && source ~/.nvm/nvm.sh
openclaw gateway restart
sleep 5
openclaw doctor 2>&1 | grep -E 'Doctor complete|error|warn'
"
```

### Fase 7 — Atualizar IaC

**7.1 — Atualizar `group_vars/all.yml` com o novo limite de memória**

No arquivo `ansible/inventory/group_vars/all.yml`, atualizar o valor de memória do LXC `openclaw-prod` para refletir a nova alocação.

**7.2 — Atualizar `homelab-context.md` e `openclaw-manual-config-log.md`** com o novo estado de hardware.

### Checklist de rollback

Se algo der errado durante o upgrade de hardware:

- **RAM não reconhecida no POST:** verificar encaixe dos pentes, testar um de cada vez
- **Sistema não sobe após upgrade:** remover os novos pentes — o sistema volta ao estado anterior com os 2 pentes originais
- **LXC com problema após aumento de memória:** restaurar snapshot `pre-ram-upgrade` via `pct rollback 200 pre-ram-upgrade`

---

## 5. Conclusão

A remoção do Proxmox do Optiplex entregaria apenas +4GB de RAM efetiva sobre a configuração atual, ao custo de eliminar toda a flexibilidade de virtualização, saturar o pve-inspiron e criar um ponto único de falha para todos os demais serviços do home lab. O ganho não justifica o risco.

O upgrade de RAM (Opção A) é a alternativa correta: entrega 2× a 4× mais memória, mantém a arquitetura intacta, tem rollback trivial e o custo é modesto. Com 32GB no Optiplex, o `openclaw-prod` passa a ter RAM suficiente para rodar três modelos Ollama simultaneamente — resolvendo não apenas o problema imediato, mas dando margem de crescimento para os próximos anos.

---

*Documento gerado em 15/05/2026 — aguardando aprovação para execução do Plano de Implementação.*
