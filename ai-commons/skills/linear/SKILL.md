---
name: linear
description: Gerencia issues, projetos e fluxos de trabalho no Linear para o ecossistema ClinicCare. Use SEMPRE que o usuário mencionar "tickets", "issues", "tarefas", "bugs", "planning" ou "backlog". Esta skill garante que todos os tickets sigam o padrão de Commits Convencionais e as diretrizes de privacidade do ClinicCare (LGPD).
---

# Linear Integration for ClinicCare

## Overview
Esta skill otimiza a gestão de projetos no Linear, integrando-a ao fluxo de desenvolvimento do **ClinicCare**. Ela assegura que cada tarefa seja documentada seguindo padrões de engenharia sênior, com foco em rastreabilidade e segurança.

## Workspace Context (ClinicCare)
- **Primary Team:** `CLE` (ClinicCare Engineering - assumido).
- **Language Policy:** 
  - **Títulos e Identificadores:** English (ex: `feat(billing): add PIX support`).
  - **Descrições e Comentários:** Brazilian Portuguese (detalhando regras de negócio e critérios de aceite).
- **Security & Compliance:** 
  - NUNCA inclua dados reais de pacientes (PHI) ou segredos nos tickets.
  - Referencie ADRs ou PRDs do diretório `doc/` para contexto arquitetural.

## Required Conventions

### Issue Title Format
Siga estritamente o **Conventional Commits**:
- `feat(scope): description`
- `fix(scope): description`
- `docs(scope): description`
- `refactor(scope): description`

### Issue Body Template
Ao criar issues, prefira este formato:
```markdown
## Contexto
[Breve descrição do porquê desta tarefa ser necessária, referenciando ADRs/PRDs se houver]

## Requisitos / Critérios de Aceite
- [ ] Critério 1
- [ ] Critério 2

## Notas Técnicas
- Modulo afetado: `src/pages/...`
- Impacto em `firestore.rules`: [Sim/Não]
```

## Prerequisitos (AI Commons)
A configuração do Linear MCP está centralizada em:
`~/.ai-commons/config/mcp/master_config.json`

Se o servidor não estiver respondendo, execute:
`opencode mcp login linear` (ou o comando de login da ferramenta ativa).

## Workflows Práticos

### 1. Triage de Bug no ClinicCare
1. Liste issues recentes com `list_issues`.
2. Identifique se o bug afeta `clinical` ou `financial`.
3. Adicione labels apropriadas: `saude`, `financeiro`, `manutencao`, `rh`.
4. Priorize (Urgent/High) se houver bloqueio de atendimento clínico.

### 2. Sincronização de Roadmap (ADR/PRD -> Linear)
1. Analise novos arquivos em `doc/prd/` ou `doc/specs/`.
2. Use `create_issue` para quebrar a especificação em tarefas técnicas granulares.
3. Vincule as issues ao Projeto correspondente no Linear.

### 3. Review de Ciclo (Sprint Review)
1. Use `list_cycles` para pegar o ciclo atual/passado.
2. Gere um resumo em Português das tarefas concluídas versus movidas para o próximo ciclo.
3. Identifique padrões de "leaking" de tarefas e proponha ajustes no backlog.

## Available Tools
Use as ferramentas do MCP Linear:
- **Issues:** `list_issues`, `get_issue`, `create_issue`, `update_issue`, `search_issues`.
- **Labels:** `list_issue_labels`, `create_issue_label`.
- **Projetos:** `list_projects`, `get_project`.
- **Times:** `list_teams`, `get_team`.

## Dicas de Performance
- Use `search_documentation` se o workspace Linear tiver docs internos vinculados.
- Ao atualizar status, mencione o progresso técnico específico (ex: "Store Zustand implementada, aguardando testes de rules").
