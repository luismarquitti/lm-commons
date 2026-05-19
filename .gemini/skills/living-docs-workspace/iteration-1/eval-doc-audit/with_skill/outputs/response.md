# Diagnóstico de Documentação Viva — Home Lab

**Data do diagnóstico:** 15/05/2026  
**Branch ativa:** `feat/openclaw-bare-metal`  
**Fonte de verdade:** `ansible/inventory/hosts.yml` + `CLAUDE.md`

---

## Resumo Executivo

Foram encontrados **5 arquivos de documentação viva** no projeto. Dois deles estão gravemente desatualizados (refletem um estado da infraestrutura que não existe mais), um está parcialmente desatualizado e dois estão substancialmente atualizados.

| Arquivo | Status | Gravidade |
|---|---|---|
| `docs/homelab-context.md` | Gravemente desatualizado | CRITICO |
| `homelab-inventory-audit.md` | Gravemente desatualizado | CRITICO |
| `homelab-network-docs.md` | Parcialmente desatualizado | MEDIO |
| `homelab-implementation-report.html` | Majoritariamente atualizado, pequenos resíduos | BAIXO |
| `optiplex-openclaw-report.md` | Desatualizado (reflete análise pré-decisão) | BAIXO |

Arquivos excluídos da análise (não são docs de estado):
- `README.md` — referência estática
- `docs/setup_proxmox_lxc.md` — how-to guide
- `docs/openclaw-manual-config-log.md` — log de configuração manual, ainda atual

---

## Estado Atual da Infraestrutura (fonte de verdade)

Extraído de `ansible/inventory/hosts.yml` e commits recentes:

### Hardware
| Hostname | IP | Função |
|---|---|---|
| `lm-claw` | `192.168.3.30` | Dell Optiplex 7040 — **Bare Metal Debian 12**, OpenClaw + Ollama |
| `pve-inspiron` | `192.168.3.50` | Dell Inspiron 14R — **único nó Proxmox** |

### LXCs no pve-inspiron
| Hostname | IP | VMID |
|---|---|---|
| adguard | 192.168.3.5 | 100 |
| uptime-kuma | 192.168.3.6 | 101 |
| nginx-proxy | 192.168.3.7 | 102 |
| postgres-db | 192.168.3.20 | 104 |

### VMs no pve-inspiron
| Hostname | IP | VMID |
|---|---|---|
| homeassistant-server | 192.168.3.22 | 151 |

### Mudanças-chave (via git log)
1. `rename openclaw-prod → lm-claw; move HDD 1TB to pve-inspiron via Samba` (commit mais recente)
2. `feat(bare-metal): migrate openclaw-prod to bare-metal Optiplex`
3. `docs(openclaw): session log, node upgrade analysis and playbook fix`

---

## Análise por Arquivo

---

### 1. `docs/homelab-context.md` — CRITICO (gravemente desatualizado)

**Última atualização declarada:** 14/05/2026 — "Sessão de planejamento inicial"  
**Problema:** Este arquivo registra o estado **inicial** do projeto, antes de qualquer migração. Ele descreve uma arquitetura completamente diferente da atual.

#### Discrepâncias encontradas:

**Seção 2 — Hardware:**
- Descreve `pve-optiplex` com IP `192.168.3.50` como Proxmox instalado
- Descreve `pve-laptop / openclaw-proxmox` com IP `192.168.3.19` como servidor secundário
- **Realidade atual:** O Optiplex virou `lm-claw` bare-metal em `192.168.3.30`; o Inspiron (`pve-inspiron`) em `.50` é o único Proxmox

**Seção 2 — VMs e Serviços Ativos:**
- Lista `192.168.3.10` como Home Assistant (VM)
- Lista `192.168.3.16` como VM Openclaw (Hyper-V)
- Lista `192.168.3.22` como "Home Assistant 2ª instância"
- **Realidade atual:** Openclaw roda em `192.168.3.30` bare-metal; HA definitiva em `.22`

**Seção 3 — Inventário de rede:**
- Tabela de servidores inclui `openclaw-proxmox` em `.19` (laptop server) como Proxmox host
- Tabela de MACs: `74-86-7A-FA-8E-C8` associado ao Optiplex em `.50` (era IP antigo do Optiplex como Proxmox)
- **Realidade atual:** MAC `74-86-7A-FA-8E-C8` pertence a `lm-claw` em `.30`

**Seção 4 — Tailscale:**
- Lista `openclaw-proxmox` como Linux Online em `100.71.89.124`
- **Realidade atual:** pve-inspiron assumiu esse papel

**Seção 5 — Objetivo Final:**
- Descreve meta de "migrar VM Openclaw para o Optiplex"
- **Realidade atual:** Migração concluída — e foi para bare-metal, não VM

**Seções 6, 7, 8 — Plano de Ação:**
- Descreve fases como "pendente" (Tailscale no Optiplex, Migrar VM Openclaw)
- **Realidade atual:** Essas fases estão concluídas; a arquitetura final é diferente da descrita

**Seção 9 — Decisões Técnicas:**
- Menciona "Storage Optiplex: SSD 240GB → OS Proxmox"
- **Realidade atual:** SSD do Optiplex é OS Debian bare-metal, não Proxmox

**Conclusão:** Este arquivo está fundamentalmente desatualizado. Reflete o estado pré-projeto (dia 0), não o estado atual. Precisa de reescrita completa das seções 2–9 ou substituição por nova versão.

---

### 2. `homelab-inventory-audit.md` — CRITICO (obsoleto como guia de ação)

**Última atualização declarada:** 14/05/2026  
**Problema:** Este arquivo é um roteiro de tarefas para identificar dispositivos desconhecidos e validar a rede — no estado inicial do projeto. Todas as pendências descritas foram resolvidas ou tornaram-se irrelevantes.

#### Discrepâncias encontradas:

**"O que falta identificar":**
- `192.168.3.19` — "MAC da VM Openclaw não documentado" → VM openclaw em .19 não existe mais
- `192.168.3.10` — "VM HA legacy — confirmar que pode ser desligada" → já desligada
- O checklist de PASSOS 1–6 presume que o Optiplex é um nó Proxmox (SSH em `192.168.3.50`)

**SSH no Proxmox:**
- PASSO 3 instrui `ssh root@192.168.3.50` para verificar VMs com `qm list`
- **Realidade atual:** `.50` é pve-inspiron; o Optiplex em `.30` é bare-metal sem Proxmox

**Conclusão:** Este arquivo perdeu sua utilidade como guia de ação — a auditoria foi executada e os passos não refletem mais a topologia real. Deveria ser arquivado ou ter o checklist atualizado para refletir o que foi resolvido e o que ainda é pendente.

---

### 3. `homelab-network-docs.md` — MEDIO (parcialmente desatualizado)

**Última atualização declarada:** 14/05/2026  
**Nível de atualização:** Este arquivo foi atualizado após a migração bare-metal e reflete bem a topologia atual em várias seções. Porém há resíduos de versões intermediárias.

#### Discrepâncias encontradas:

**Seção 9 — Reservas DHCP:**
- Linha: `192.168.3.10 | 74-86-7A-FA-8E-C8 | pve-optiplex | Proxmox Principal`
  - **Problema:** IP `.10` não é mais usado; o Optiplex usa `.30` com hostname `lm-claw`
- Linha: `192.168.3.50 | 74-86-7A-FA-8E-C8 | pve-inspiron | (Antigo IP do Proxmox, migrar para .10)`
  - **Problema duplo:** MAC `74-86-7A-FA-8E-C8` pertence ao Optiplex (lm-claw), não ao Inspiron. O Inspiron tem MAC `BC:24:11:A5:32:E5`. Além disso, o comentário "migrar para .10" é obsoleto.
- Linha: `192.168.3.20 | 28-F1-0E-FD-28-63 | luis-pc | Dell Optiplex 7140`
  - **Atenção:** LUIS-PC ainda existe como dispositivo de rede pessoal, mas não faz parte da infra do home lab. Pode gerar confusão.

**Seção 10 — Mapa de IPs:**
- `.10  pve-optiplex (Proxmox Principal)` — IP `.10` não está em uso; deveria ser removido ou marcado como livre
- `.19  VM Proxmox: Openclaw` — VM Openclaw `.19` não existe mais (era a VM legacy no laptop server)
- `.20  LUIS-PC (Dell Optiplex 7140, Hyper-V host)` — confunde infra pessoal com home lab

**Seção 11 — Arquitetura Alvo:**
- Ainda menciona `VM: Openclaw (.19)` como "já em produção" no Inspiron
- **Realidade atual:** OpenClaw está em `.30` (bare-metal), não `.19`
- Menciona `LUIS-PC / Dell Optiplex 7140 (Hyper-V)` com "VM: Home Assistant legacy — desativada"
  - **Realidade atual:** LUIS-PC não é parte da infra do home lab

**Seção 12 — Status das Fases:**
- Fases 4 (LXC AdGuard) e 5 (LXC Uptime Kuma) marcadas como "Pendente"
- **Realidade atual:** adguard (100) e uptime-kuma (101) aparecem no hosts.yml como LXCs provisionados no pve-inspiron — status pode já ser "Concluída"

**Seção 13 — Pontos de Atenção:**
- "MAC da VM Openclaw (.19): Verificar no Proxmox" — VM .19 não existe mais

**O que está correto neste arquivo:**
- Seções 1–4: topologia geral, roteador mesh, servidores físicos principais, Tailscale
- Seção 5: dispositivos IoT
- Seção 8: URLs de acesso

---

### 4. `homelab-implementation-report.html` — BAIXO (majoritariamente atualizado)

**Última atualização declarada:** 15/05/2026 — branch `feat/openclaw-bare-metal`  
**Este é o arquivo mais atualizado.** Reflete corretamente a arquitetura bare-metal atual.

#### Discrepâncias menores encontradas:

**Seção 02 — Tabela de Hardware:**
- Entrada `192.168.3.30` / `lm-claw` aparece **duplicada** na tabela (linhas ~993 e ~1033)

**Seção 02 — Tabela de Recursos Alocados:**
- adguard (LXC 100): status "A criar" — pode já estar criado (consta no hosts.yml)
- nginx-proxy (LXC 102): status "A criar" — idem

**Seção 03 — Configuração de Servidores:**
- Código `network-setup.sh` mostra `address 192.168.3.10/24` para o bridge Proxmox — este era o IP antigo do Optiplex como nó Proxmox; o Inspiron usa `.50`
- Código `cluster-setup.sh` ainda instrui criação do cluster `mqt-homelab` com dois nós (pve-optiplex + pve-inspiron) — irrelevante pós-migração bare-metal

**Seção 06 — DNS Rewrites no AdGuard:**
- Lista `pve-optiplex.lan → 192.168.3.10` — este hostname/IP não existe mais
- Lista `pve-laptop.lan → 192.168.3.19` — este hostname/IP não existe mais
- Lista `homeassistant.lan → 192.168.3.21` — IP `.21` não consta no hosts.yml (HA está em `.22`)

**Seção 06 — Nginx Proxy Hosts:**
- Entradas para `pve-optiplex.lan` (`.10`) e `pve-laptop.lan` (`.19`) são obsoletas

**Seção 07 — Tailscale peers:**
- Lista `pve-optiplex` como peer Tailscale em `100.95.244.76` — o Optiplex agora é bare-metal (`lm-claw`) e o Tailscale nele pode ter hostname diferente

---

### 5. `optiplex-openclaw-report.md` — BAIXO (documento de análise pré-decisão)

**Data:** 15/05/2026  
**Natureza:** Este arquivo registra a análise que levou à decisão de migrar para bare-metal (Opção C foi escolhida, apesar da recomendação ser Opção A).

#### Problema:
- O documento **recomenda a Opção A** (upgrade de RAM) e desaconselha a Opção C (bare-metal)
- **Realidade atual:** A Opção C foi implementada (vide commits e hosts.yml)
- Seção 1: "Estado Atual" descreve `lm-claw` como LXC 200 em pve-optiplex com 12GB — esta configuração não existe mais

**É um documento de histórico de decisão** — tecnicamente não está "errado", mas pode causar confusão se lido sem contexto. Idealmente deveria ter um cabeçalho indicando que a Opção C foi a escolhida e implementada, contrariando a recomendação do relatório.

---

## Resumo das Discrepâncias por Tipo

### Hardware / Topologia
- `docs/homelab-context.md`: Todo o mapeamento de hardware está errado (Optiplex como Proxmox `.50`, laptop server como servidor ativo, VM Openclaw em `.19`)
- `homelab-network-docs.md`: IP `.10` para Optiplex, MAC errado na reserva DHCP de pve-inspiron

### Hostnames
- `docs/homelab-context.md`: Usa `pve-optiplex`, `pve-laptop`, `openclaw-proxmox` — todos obsoletos
- `homelab-network-docs.md` Seção 11: Menciona `Openclaw (.19)` como VM no Inspiron

### IPs
- `docs/homelab-context.md`: Optiplex em `.50`, laptop server em `.19`
- `homelab-network-docs.md`: `.10` como Proxmox principal, `.20` como LUIS-PC (confunde infra doméstica com home lab)
- `homelab-implementation-report.html` Seção 6: `homeassistant.lan → .21` (deveria ser `.22`)

### Status de serviços
- `homelab-network-docs.md`: AdGuard e Uptime Kuma como "Pendente" quando constam como provisionados no hosts.yml
- `homelab-implementation-report.html`: adguard e nginx-proxy como "A criar"

### Fases do projeto
- `docs/homelab-context.md`: Fases 1–5 descritas como "pendente" (todas já concluídas)
- `homelab-network-docs.md`: Fases 4 e 5 como pendente (podem estar concluídas)

---

## Priorização de Atualizações

| Prioridade | Arquivo | Ação recomendada |
|---|---|---|
| 1 | `docs/homelab-context.md` | Reescrita completa das seções 2–9 para refletir estado atual |
| 2 | `homelab-network-docs.md` | Corrigir seções 9, 10, 11, 13 (IPs, MACs, fases, VM obsoleta) |
| 3 | `homelab-implementation-report.html` | Corrigir entradas DNS/nginx obsoletas; remover duplicata de linha; atualizar status de LXCs |
| 4 | `optiplex-openclaw-report.md` | Adicionar nota de contexto indicando que a Opção C foi implementada |
| 5 | `homelab-inventory-audit.md` | Marcar checklist como concluído ou arquivar |

---

*Diagnóstico gerado em 15/05/2026 — skill living-docs*
