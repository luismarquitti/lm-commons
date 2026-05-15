---
name: living-docs
description: >
  Mantém a "documentação viva" do projeto — relatórios HTML, arquivos de contexto, auditorias
  de rede, logs de decisão e qualquer arquivo que registra o estado atual da infraestrutura.
  Use esta skill sempre que: (1) o usuário mencionar atualizar docs/relatórios/documentação;
  (2) ao final de uma sessão onde houve mudanças de infra (hosts adicionados/removidos,
  serviços implantados, IPs alterados, playbooks executados, decisões arquiteturais tomadas);
  (3) o usuário perguntar se os docs estão atualizados; (4) qualquer arquivo de estado
  parecer desatualizado em relação ao que foi discutido na sessão.
  COMPORTAMENTO PROATIVO: ao final de qualquer resposta que envolveu uma mudança de infra,
  decisão arquitetural, novo serviço, alteração de IP/hostname, ou execução de playbook,
  adicione uma sugestão curta ao usuário perguntando se quer atualizar a documentação viva.
  Não espere o usuário pedir — identifique quando docs estão desatualizados e ofereça.
  NUNCA edite documentos sem aprovação explícita do usuário — sempre proponha primeiro.
  Palavras-chave: "atualizar docs", "update docs", "documentação", "relatório", "living docs",
  "manter atualizado", "keep docs updated", "update the report", "atualizar relatório".
---

# Living Docs — Documentação Viva

"Documentação viva" são arquivos que rastreiam o **estado atual** do projeto — não apenas código,
mas decisões, topologia de rede, serviços ativos, IPs, hardware em uso e histórico de mudanças.
Eles ficam desatualizados rapidamente se não forem mantidos a cada iteração.

## Comportamento proativo (IMPORTANTE)

Esta skill deve ser usada de forma proativa — não apenas quando o usuário pede explicitamente.

**Ao final de qualquer resposta** onde ocorreu pelo menos um dos seguintes, adicione uma
sugestão discreta perguntando se o usuário quer atualizar a documentação:

- Um host foi adicionado, removido ou teve hostname/IP alterado
- Um serviço foi implantado, migrado ou desativado
- Uma decisão arquitetural foi tomada (ex: "vamos migrar X para Y")
- Um playbook Ansible foi executado com sucesso
- Uma configuração de rede ou storage foi alterada
- Um arquivo de inventário (`hosts.yml`, `group_vars/`) foi editado

**Formato da sugestão proativa** — curto, no final da resposta:

```
---
📄 Quer que eu atualize a documentação viva? Os arquivos `homelab-implementation-report.html`
e `docs/homelab-context.md` parecem desatualizados com base nas mudanças desta sessão.
```

Não inclua a sugestão se:
- Nada de relevante para o estado da infra foi alterado na resposta
- O usuário já pediu explicitamente para atualizar (nesse caso vá direto para o Passo 1)
- A resposta já foi uma atualização de documentação

## Passo 1 — Descobrir os documentos vivos

Varra o diretório raiz do projeto e `docs/` em busca de:

**Padrões de nome (alta confiança):**
- `*-report.html`, `*-report.md`
- `*-context.md`, `*-audit.md`, `*-docs.md`, `*-log.md`
- `docs/*.md`
- `homelab-*.md`, `homelab-*.html`
- `living-docs-manifest.json` — se existir, use como lista autoritativa

**Exclua sempre:**
- `.claude/` e seus subdirektórios (evals, skills, memory)
- `*:Zone.Identifier` (artefatos Windows)
- `node_modules/`, `*.pyc`
- `CLAUDE.md` (instruções do agente, não doc de estado)

Para cada candidato, leia as primeiras 30 linhas para confirmar que o arquivo rastreia estado
(tem datas, IPs, tabelas de serviços, status de hardware) — e não é apenas uma referência estática
ou how-to-guide.

## Passo 2 — Entender o que mudou

Leia em paralelo:
- `git log --oneline -15` — commits recentes
- `CLAUDE.md` — estado canônico atual da infra
- `ansible/inventory/hosts.yml` — fonte de verdade para hosts e IPs
- A conversa da sessão atual — o que o usuário mudou ou decidiu?

Construa mentalmente um "diff de estado": o que era verdade antes vs. o que é verdade agora.

## Passo 3 — Gerar as atualizações propostas

Para cada documento vivo que precisa de atualização:
1. Leia o conteúdo atual completo
2. Identifique seções desatualizadas: IPs errados, hardware descontinuado, serviços movidos,
   datas antigas, contagens incorretas (ex: "cluster de 2 nós" quando agora é 1 nó + bare-metal)
3. Escreva edições **cirúrgicas** — mude apenas o que está de fato diferente. Não reescreva o
   documento inteiro; preserve a voz, o estilo e a estrutura original
4. Apresente cada mudança de forma clara:

```
📄 homelab-implementation-report.html
  ▸ Seção "Hardware": "pve-optiplex (192.168.3.10, Proxmox)" → "lm-claw (192.168.3.30, Debian bare-metal)"
  ▸ Seção "Cluster": remover menção a cluster de 2 nós — agora é 1 nó Proxmox + 1 bare-metal
  ▸ Cabeçalho de data: "14/05/2026" → "<data atual>"

📄 docs/homelab-context.md
  ▸ Tabela de hardware: atualizar linha do Optiplex (IP, hostname, função)
  ▸ Seção "VMs e Serviços": mover OpenClaw de LXC para bare-metal
```

## Passo 4 — Aprovação do usuário

**NUNCA edite nenhum arquivo sem aprovação explícita.**

Apresente todas as mudanças propostas de uma vez e pergunte:
> "Posso aplicar essas atualizações? (pode aprovar todas, algumas, ou pedir ajustes)"

Se o usuário aprovar parcialmente, aplique apenas as aprovadas. Se pedir ajustes, revise e
re-apresente antes de aplicar.

## Passo 5 — Aplicar e confirmar

Use a ferramenta Edit para cada mudança aprovada. Prefira edições pontuais sobre reescritas.
Após aplicar, confirme quais arquivos foram atualizados.

---

## Se o projeto não tiver documentação viva

Se nenhum documento de estado for encontrado:

1. Explique brevemente o conceito (estado atual vs. referência)
2. Proponha uma estrutura mínima adequada ao tipo de projeto:

   Para projetos de infra/home-lab:
   - `docs/context.md` — estado atual da infra, decisões recentes, próximos passos
   - `docs/runbook.md` — como operar o lab (comandos frequentes, troubleshooting)
   - `homelab-status.md` — tabela de serviços, IPs e status (pode ser a raiz)

3. Pergunte se o usuário quer criar esses arquivos
4. Se sim, gere o conteúdo inicial com base no estado atual do projeto
   (CLAUDE.md, git log, inventory, conversa da sessão)
5. Salve os arquivos e proponha adicionar ao controle de versão

---

## Dicas de qualidade

- **Preserve o estilo original**: se o doc usa PT-BR, continue em PT-BR. Se mistura EN/PT, mantenha.
- **Preserve a formatação**: se é HTML com classes CSS específicas, edite só o conteúdo, não o markup.
- **Não over-engineer**: uma tabela markdown simples é melhor do que uma estrutura excessivamente
  complexa que nunca será mantida.
- **Datas**: sempre use a data real do dia (`currentDate` do contexto do sistema, ou `date +%d/%m/%Y`).
- **Seja conservador**: em caso de dúvida sobre se algo mudou, pergunte ao usuário em vez de assumir.
