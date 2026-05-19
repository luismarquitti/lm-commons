---
description: Workflow de Planejamento SCRUM — simula um esquadrão multifuncional (PM, PO, Scrum Master, Tech Lead, QA) para planejar épicos, features e sprints do ClinicCare, produzindo artefatos em doc/planejamento/ e opcionalmente gerando tracks no Conductor.
---

# Workflow: `/planning`

Este workflow transforma uma ideia ou necessidade de negócio em artefatos de planejamento estruturados, prontos para execução via Conductor.

---

## Quando usar

- `/planning` — iniciar um novo planejamento
- Quando o usuário mencionar: "planning sprint", "criar épico", "detalhar feature", "backlog", "planejar nova funcionalidade"

---

## Pré-condições

Antes de iniciar, leia os seguintes arquivos para carregar o contexto do produto:

1. `doc/planejamento/PRD.md` — visão e personas
2. `doc/planejamento/Product_Roadmap.md` — fases e épicos
3. `doc/planejamento/EPICOS.md` — índice de estado atual dos épicos
4. `doc/planejamento/BACKLOG.md` — estado do kanban

---

## Etapa 1 — Descoberta (Papel: Product Manager)

**Objetivo:** Entender o que o usuário quer planejar e onde se encaixa no produto.

### Pergunta 1 (única — aguardar resposta):

```
O que você deseja planejar hoje?

1. Novo épico (conjunto grande de funcionalidades)
2. Nova feature em um épico existente
3. Refinar/detalhar feature já existente no backlog
4. Planejar sprint (priorizar e sequenciar features existentes)
5. Outra coisa (descreva)
```

Com base na resposta, siga para a etapa correspondente.

---

## Etapa 2A — Detalhamento de NOVO ÉPICO (Papel: PO + PM)

> **Use quando:** usuário escolheu opção 1

### Pergunta 2A-1:
```
Descreva o épico em 1-2 frases. Qual problema de negócio ele resolve?
```

### Pergunta 2A-2:
```
Quem são as personas principais que se beneficiam deste épico?
(Ex: Enfermeiro, Administrador, Médico, Técnico de Manutenção)
```

### Pergunta 2A-3:
```
Quais são as 3-5 funcionalidades core deste épico? Liste uma por linha.
```

Após coleta, gere:
- `doc/planejamento/epicos/{slug}/FEATURE.md` (visão do épico, user stories de alto nível, critérios de aceite épicos)
- Adicione o épico à tabela de `doc/planejamento/EPICOS.md`
- Adicione ao `doc/planejamento/BACKLOG.md` na coluna `📋 Backlog`

---

## Etapa 2B — Detalhamento de FEATURE EM ÉPICO EXISTENTE (Papel: PO)

> **Use quando:** usuário escolheu opção 2 ou 3

### Pergunta 2B-1:
```
Qual épico pertence esta feature?
(Lista os épicos de doc/planejamento/EPICOS.md para o usuário escolher)
```

### Pergunta 2B-2:
```
Descreva a feature em 1-2 frases. Qual é o objetivo principal?
```

### Pergunta 2B-3:
```
Quem se beneficia? Escreva a User Story:
"Como [persona], quero [ação] para [benefício]."
```

### Pergunta 2B-4:
```
Quais são os Critérios de Aceite? Liste no formato BDD (Dado/Quando/Então), mínimo 3:
```

### Pergunta 2B-5:
```
O que está FORA do escopo desta feature? (Previne scope creep)
```

### Pergunta 2B-6 (opcional):
```
Restrições técnicas ou de design a considerar?
(Pressione Enter para pular)
```

Após coleta, gere ou atualize:
- `doc/planejamento/epicos/{slug}/FEATURE.md` com a nova feature detalhada
- Atualize o `doc/planejamento/BACKLOG.md`

---

## Etapa 3 — Breakdown Técnico (Papel: Tech Lead)

> Execute após qualquer etapa 2A ou 2B que produza uma feature nova/refinada.

Analise os seguintes arquivos para contexto técnico:
- `src/` — estrutura de código existente
- `firestore.rules` — regras RBAC atuais
- `doc/planejamento/Specs_UX_UI.md` — design system

Gere `doc/planejamento/epicos/{slug}/TASKS.md` com:

```markdown
## Fase 1: Setup/Fundação
- [ ] Tarefa 1.1: ...
- [ ] Tarefa 1.2: ...

## Fase 2: Implementação Core
- [ ] Tarefa 2.1: ...

## Fase 3: Integração/UI
- [ ] Tarefa 3.1: ...

## Fase 4: Testes e Polimento
- [ ] Tarefa 4.1: Escrever testes unitários (Vitest) para [componentes críticos]
- [ ] Tarefa 4.2: Testar responsividade (Desktop e Mobile)
- [ ] Tarefa 4.3: Validar regras Firestore no emulador

## Verificação Final
- [ ] Todos os critérios de aceite atendidos
- [ ] Sem erros no console
- [ ] firestore.rules atualizado
- [ ] DoD atendido (conforme Product_Roadmap.md)
```

---

## Etapa 4 — QA & Segurança Check (Papel: QA)

> Execute após Etapa 3, antes de finalizar o TASKS.md.

Valide e anote no TASKS.md:

### Checklist Obrigatório:
- [ ] **RBAC:** Quais Custom Claims são necessárias para esta feature? *(nunca assumir permissão — sempre verificar)*
- [ ] **Firestore:** Novas coleções exigem atualização de `firestore.rules`?
- [ ] **LGPD:** A feature manipula dados sensíveis de pacientes? Se sim: criptografia, minimização de dados, logs de auditoria.
- [ ] **Testes Críticos:** Identificar os paths que precisam de cobertura de teste (especialmente segurança).
- [ ] **Cloud Functions:** Operações de alto risco (financeiro, emails em massa) devem ir para Functions, nunca para o cliente.

---

## Etapa 5 — Planejamento de Sprint (Papel: Scrum Master)

> **Use quando:** usuário escolheu opção 4 (planejar sprint)

1. Leia o kanban atual em `doc/planejamento/BACKLOG.md`.
2. Pergunte: *"Qual é a duração da sprint? Quantos dias o time tem disponível?"*
3. Proponha uma seleção de features do `📋 Backlog` para mover para `🔄 In Progress`, baseada na complexidade do TASKS.md.
4. Apresente a proposta e aguarde aprovação.
5. Atualize `BACKLOG.md` movendo os cards selecionados para `🔄 In Progress` com a data de início.

---

## Etapa 6 — Geração de Conductor Track (Opcional)

> Execute após todas as etapas anteriores, se o usuário quiser iniciar a implementação imediatamente.

Pergunte:
```
Deseja criar um Conductor Track agora para iniciar a implementação?
1. Sim — gerar track imediatamente
2. Não — manter apenas no backlog por enquanto
```

Se **Sim**, use os dados gerados para popular:
- `conductor/tracks/{trackId}/spec.md` — baseado no FEATURE.md gerado
- `conductor/tracks/{trackId}/plan.md` — baseado no TASKS.md gerado
- Registre em `conductor/tracks.md`

Siga o padrão completo descrito na skill `conductor-new-track`.

---

## Templates de Saída

### FEATURE.md (template)

```markdown
# Feature: {Nome da Feature}

**Épico:** {Nome do Épico}
**Status:** Draft | Ready | In Progress | Done
**Criado:** {YYYY-MM-DD}
**Atualizado:** {YYYY-MM-DD}

## Visão

{1-2 frases descrevendo o objetivo da feature}

## Personas Impactadas

- **{Persona}:** {Como é impactada}

## User Story

> Como **{persona}**, quero **{ação}** para **{benefício}**.

## Critérios de Aceite (BDD)

**Cenário 1: {Nome}**
- **Dado** que {contexto}
- **Quando** {ação}
- **Então** {resultado esperado}

**Cenário 2: {Nome}**
- ...

## Fora do Escopo

- {Item explicitamente excluído}

## Notas de Design

{Referências ao design system (Specs_UX_UI.md) relevantes}

## Restrições Técnicas

{RBAC necessário, coleções Firestore, Cloud Functions, etc.}

## Riscos LGPD

{Dados sensíveis envolvidos e mitigações}
```

### BACKLOG.md card (template)

```markdown
| {Épico} | [{Feature}](epicos/{slug}/FEATURE.md) | {Status} | {Data} |
```

---

## Regras de Ouro

1. **Faça UMA pergunta por vez** — nunca sobrecarregue o usuário com múltiplas perguntas.
2. **Português Brasileiro nas documentações** — identificadores de código permanecem em inglês.
3. **RBAC antes de tudo** — nunca gerar tarefas de acesso a dados sem definir as permissões.
4. **DoD sempre visível** — cada TASKS.md deve terminar com a checklist do DoD do roadmap.
5. **Jamais inventar regras** — se um padrão não está no `AGENTS.md` ou `.agents/`, pergunte ao usuário.
