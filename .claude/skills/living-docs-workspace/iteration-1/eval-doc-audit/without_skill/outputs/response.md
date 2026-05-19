# Diagnóstico de Documentação Desatualizada — Home Lab

**Data do diagnóstico:** 15/05/2026  
**Branch ativa:** `feat/openclaw-bare-metal`  
**Fonte de verdade:** `ansible/inventory/hosts.yml` + `ansible/inventory/group_vars/all.yml` + `CLAUDE.md`

---

## Estado Atual da Infraestrutura (fonte de verdade)

A migração bare-metal foi concluída. O estado real do lab é:

| Host | Role | IP | SO |
|---|---|---|---|
| `lm-claw` | Bare-metal Debian 12 — OpenClaw + Ollama | `192.168.3.30` | Debian 12 (sem Proxmox) |
| `pve-inspiron` | Único nó Proxmox | `192.168.3.50` | Proxmox VE |

**LXCs no pve-inspiron:** adguard (.5), uptime-kuma (.6), nginx-proxy (.7), postgres-db (.20)  
**VMs no pve-inspiron:** homeassistant-server (.22)  
**Serviços AUSENTES do inventário atual:** coolify (.8), n8n (.11), memos (.12)

---

## Diagnóstico por Arquivo

---

### 1. `README.md` — SEVERAMENTE DESATUALIZADO

**Última atualização implícita:** commit inicial (antes da migração bare-metal)

**Problemas encontrados:**

| Campo | Valor no README | Valor real |
|---|---|---|
| Descrição do projeto | "cluster Proxmox VE de dois nós" | Single-node Proxmox + bare-metal Debian |
| Dell Optiplex hostname | `pve-optiplex` como "Nó primário do cluster" | `lm-claw` — bare-metal, sem Proxmox |
| Optiplex IP | `192.168.3.10` | `192.168.3.30` |
| AdGuard host | `pve-optiplex` | `pve-inspiron` |
| Nginx Proxy host | `pve-optiplex` | `pve-inspiron` |
| Openclaw-Prod host | `pve-optiplex` | bare-metal `lm-claw` |
| Exemplo de limit Ansible | `--limit pve-optiplex` | `--limit pve-inspiron` ou `lm-claw` |

**Resumo:** O README ainda descreve a arquitetura de **dois nós Proxmox** que existia antes da migração. O Optiplex não é mais um nó Proxmox.

---

### 2. `docs/homelab-context.md` — SEVERAMENTE DESATUALIZADO

**Última atualização declarada:** 14/05/2026 (sessão de planejamento inicial)

**Problemas encontrados:**

| Seção | Problema |
|---|---|
| Seção 2 — Hardware | Descreve o Optiplex como `pve-optiplex` com IP `192.168.3.50` e o laptop server como `pve-laptop`/`openclaw-proxmox` com IP `192.168.3.19`. Nada disso corresponde ao estado atual. |
| Seção 2 — VMs e Serviços | Lista serviços em `192.168.3.10`, `192.168.3.16`, `192.168.3.22` como rodando no "Laptop Server". O Inspiron (`.50`) agora é o único Proxmox, e o Optiplex é bare-metal em `.30`. |
| Seção 3 — Rede | Inclui `openclaw-proxmox` (192.168.3.19) no inventário de servidores físicos — esse host não existe mais como servidor. |
| Seção 4 — Tailscale | Referencia `openclaw-proxmox` (`.19`) e `openclaw` (`.19`) como nós ativos — hosts inexistentes na topologia atual. |
| Seção 5 — Objetivo Final | Descreve a migração para Optiplex Proxmox como plano futuro — essa migração já foi feita, porém com abordagem diferente (bare-metal em vez de VM). |
| Seção 6 — Fases | Fases 1-5 descritas como plano futuro, mas a arquitetura real já evoluiu além desse plano original. |
| Seção 7 — Acessos | Referencia Proxmox Optiplex em `192.168.3.50:8006` e Proxmox Laptop em `192.168.3.19:8006` — endereços errados para o estado atual. |

**Resumo:** Este é o documento mais desatualizado de todos. Representa o estado do dia **antes** de qualquer provisionamento real — é o contexto de planejamento inicial, não o estado atual.

---

### 3. `homelab-inventory-audit.md` — DESATUALIZADO

**Última atualização declarada:** 14/05/2026

**Problemas encontrados:**

| Problema | Detalhe |
|---|---|
| Referencia `.17` como prioridade de investigação | Esse item pode já ter sido resolvido ou descartado |
| Instrui SSH em `root@192.168.3.50` como Proxmox do Optiplex | `192.168.3.50` é o Inspiron, não o Optiplex |
| Checklists marcados como pendentes | Todos os 6 passos ainda estão como `[ ]` — não refletem o progresso real |
| Referencia VMs `.10` e `.19` para investigação | Essas VMs não existem mais na topologia atual |
| Propõe verificar MACs de VMs no Proxmox `.19` (openclaw) | A VM openclaw-legacy foi substituída pelo bare-metal `lm-claw` |

**Resumo:** Documento de trabalho gerado no dia 1, com checklist nunca atualizado. Reflete preocupações que já foram superadas pela evolução da arquitetura.

---

### 4. `homelab-network-docs.md` — PARCIALMENTE ATUALIZADO

**Última atualização declarada:** 14/05/2026

**Status:** Este é o documento mais atualizado entre os `.md` — ele já reflete a topologia com `lm-claw` (bare-metal) e `pve-inspiron` (único Proxmox). Porém ainda contém inconsistências:

| Seção | Problema |
|---|---|
| Seção 4 — Inventário completo de VMs | Lista `coolify (.8)`, `n8n (.11)`, `memos (.12)` como ativos — mas esses hosts **não estão** no `hosts.yml` atual |
| Seção 6 — Outros Dispositivos | `.11` aparece como `n8n` (LXC) em seção 4 e como `moto-edge-60` (celular) nesta seção — conflito de IP |
| Seção 9 — Reservas DHCP | Contém entrada para `192.168.3.10` associada ao MAC do Optiplex (`74-86-7A-FA-8E-C8`) como `pve-optiplex` com função de "Proxmox Principal" — o Optiplex está agora em `.30` como bare-metal |
| Seção 9 — Reservas DHCP | Contém entrada para `192.168.3.20` como `LUIS-PC` — mas `.20` no inventário atual é `postgres-db` (LXC) |
| Seção 10 — Mapa de IPs | `.10` listado como `pve-optiplex (Proxmox Principal)` — incorreto; Optiplex está em `.30` |
| Seção 10 — Mapa de IPs | `.19` listado como VM Proxmox `openclaw` no Inspiron — essa VM está desligada/obsoleta |
| Seção 11 — Arquitetura Alvo | Descreve estado "pós-migração" mas menciona `openclaw (.19)` como ativo no Inspiron |
| Seção 12 — Status das Fases | "Fase 1.2 — VM Openclaw no Proxmox: ✅ Concluída" — o Openclaw foi migrado para bare-metal, não está mais em VM |
| Tailscale | `openclaw` (VM `.19`) aparece como nó Tailscale — entidade obsoleta |

**Resumo:** Topologia principal correta, mas dados residuais do período de transição ainda presentes. Conflito de IP em `.11`, dados de DHCP desatualizados.

---

### 5. `docs/setup_proxmox_lxc.md` — DESATUALIZADO (documento histórico)

**Última atualização declarada:** 14/05/2026

**Problemas encontrados:**

| Problema | Detalhe |
|---|---|
| Guia de instalação do Proxmox no Optiplex | O Optiplex não roda mais Proxmox — roda Debian 12 bare-metal |
| Fase 0 — Instalar Proxmox no Optiplex | Irrelevante para o estado atual; o Optiplex agora tem Debian 12 |
| Fase 3 — Criar cluster (Optiplex + Inspiron) | O cluster de dois nós não existe — apenas pve-inspiron standalone |
| Fase 5 — Tailscale no Optiplex com `--advertise-routes` | Contexto do Optiplex como nó Proxmox |
| Fase 6 — Deploy LXCs no pve-optiplex | AdGuard e Nginx estão no pve-inspiron, não no Optiplex |
| Referências a `https://192.168.3.10:8006` | Esse endereço não é mais um Proxmox |
| Samba path `\\192.168.3.10\data` | Samba está em `192.168.3.50` (pve-inspiron) |

**Resumo:** Este é um guia de provisionamento para a arquitetura que **não foi implementada**. Tem valor histórico mas confunde quem precisar reprovisionar o lab do zero.

---

### 6. `optiplex-openclaw-report.md` — PARCIALMENTE DESATUALIZADO

**Última atualização declarada:** 15/05/2026

**Contexto:** Este é o relatório de análise que levou à decisão de migrar para bare-metal (Opção C foi escolhida, apesar da recomendação ser Opção A).

**Problemas encontrados:**

| Problema | Detalhe |
|---|---|
| Seção 1 — Estado Atual | Descreve `lm-claw` como LXC 200 no `pve-optiplex` com 12GB RAM — já foi migrado para bare-metal |
| Seção 1 — pve-optiplex com LXCs 100, 102, 200 | O pve-optiplex não existe mais como Proxmox; AdGuard (.5) e nginx-proxy (.7) estão no pve-inspiron |
| Conclusão | "Recomendação: Opção A" — mas a Opção C foi executada |
| Status | "aguardando aprovação para execução" — a execução já ocorreu |

**Resumo:** Documento de decisão que ainda reflete o estado **antes** da execução. Pode causar confusão por recomendar Opção A enquanto a Opção C foi implementada. Valor histórico preservado, mas precisa de nota de rodapé indicando qual opção foi executada.

---

### 7. `homelab-implementation-report.html` — ATUALIZADO

**Última atualização declarada:** 15/05/2026 — branch `feat/openclaw-bare-metal`

**Status:** Este é o documento mais atualizado. Já reflete:
- Dell Optiplex como bare-metal `lm-claw` em `192.168.3.30`
- pve-inspiron como único nó Proxmox em `192.168.3.50`
- Fase de migração bare-metal documentada

**Inconsistências residuais encontradas:**
- Ainda contém blocos de código de `cluster-setup.sh` com `pvecm add 192.168.3.10` e referências a `pve-optiplex (.10)` como nó Proxmox — esses são passos históricos de migração, contextualizados dentro de um bloco "decommission", o que é aceitável.

**Resumo:** Substancialmente correto para o estado atual. As referências ao Optiplex antigo estão contextualizadas como parte da história de migração.

---

### 8. `docs/openclaw-manual-config-log.md` — ATUALIZADO

**Última atualização declarada:** 15/05/2026

**Status:** Correto. Documenta configurações manuais no `lm-claw` (bare-metal). Seção "Tailscale dentro do LXC" é um falso positivo — refere-se ao contexto anterior de LXC, mas o problema de Tailscale pode ainda existir no bare-metal.

**Pequena inconsistência:**
- Item 3 (Tailscale dentro do LXC) menciona "verificar se LXC precisa de nesting=1" — o `lm-claw` agora é bare-metal, então o problema de Tailscale pode persistir por outros motivos. O item precisa ser revisitado.

---

## Resumo Executivo — Prioridade de Atualização

| Arquivo | Status | Prioridade |
|---|---|---|
| `README.md` | Severamente desatualizado — arquitetura dois nós Proxmox | ALTA |
| `docs/homelab-context.md` | Severamente desatualizado — estado do dia 1 de planejamento | ALTA |
| `homelab-inventory-audit.md` | Desatualizado — checklist nunca atualizado, topologia obsoleta | MÉDIA |
| `docs/setup_proxmox_lxc.md` | Desatualizado — guia para arquitetura não implementada | MÉDIA |
| `optiplex-openclaw-report.md` | Parcialmente desatualizado — decisão tomada não refletida | MÉDIA |
| `homelab-network-docs.md` | Parcialmente atualizado — conflito .11, dados DHCP, Tailscale obsoleto | BAIXA |
| `homelab-implementation-report.html` | Substancialmente correto | OK |
| `docs/openclaw-manual-config-log.md` | Correto — item Tailscale precisa de revisão | OK |

---

## Principais Divergências Recorrentes

1. **Optiplex como pve-optiplex/IP .10**: Cinco documentos ainda referenciam o Dell Optiplex como nó Proxmox em `192.168.3.10`. O estado real é bare-metal Debian 12 em `192.168.3.30` (`lm-claw`).

2. **Cluster de dois nós**: README e setup_proxmox_lxc.md descrevem a arquitetura de dois nós Proxmox que nunca foi mantida — o cluster foi desfeito quando o Optiplex foi convertido para bare-metal.

3. **Serviços sem entrada no inventário**: `coolify` (.8), `n8n` (.11), `memos` (.12) aparecem em documentação de rede mas não estão no `hosts.yml`. Ou foram removidos da infraestrutura ou precisam ser adicionados ao inventário.

4. **Conflito de IP .11**: Em `homelab-network-docs.md`, `.11` aparece como `n8n` (LXC no Inspiron) na tabela de serviços e como `moto-edge-60` (celular Motorola) na tabela de outros dispositivos — impossível ambos estarem corretos.

5. **Tailscale — nós obsoletos**: Documentos ainda referenciam `openclaw` (VM `.19`) e `openclaw-proxmox` como nós ativos no Tailscale. Esses hosts foram desativados.

---

*Diagnóstico gerado em 15/05/2026*
