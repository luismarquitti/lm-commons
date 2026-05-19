# Scrum mapeado para artefatos do GitHub

Scrum dá os papéis (PO, SM, time) e as cerimônias (planning, daily, review, retro); o GitHub dá onde o trabalho mora. Esta tabela é só o mapeamento — não estamos prescrevendo Scrum-by-the-book.

| Conceito Scrum | Artefato no GitHub |
|---|---|
| Product Backlog | Backlog do Project v2 (view "Table" filtrada por Status != Done) |
| Sprint Backlog | Items do Project com campo `Sprint` = sprint atual |
| Sprint | Milestone (`sprint-NN`) + valor no campo iteration do Project |
| User Story | Issue com `type:user-story` |
| Épico | Issue com `type:epic` (parent issue) |
| Task técnica | Issue com `type:task` |
| Bug | Issue com `type:bug` |
| Story Points | Campo numérico `Size` no Project (espelhado opcionalmente em label `size:*`) |
| Definition of Done | Checklist no corpo da issue |
| Sprint Review | Milestone fechada + release notes geradas |
| Burndown | View "Roadmap" no Project, agrupada por Sprint |

## Convenções de sprint

- **Duração:** 1 ou 2 semanas. Mais que isso vira "miniwaterfall".
- **Nomeação:** `sprint-01`, `sprint-02`, … com zero à esquerda (ordena lexicograficamente no GitHub).
- **Datas:** start e due preenchidas. Use a due date como fim do sprint, não o "deadline da última história".
- **Carry-over:** issues que não fecham passam para `sprint-NN+1` na review, *não* automaticamente.

## Quando story points fazem sentido

- Você tem um time estável, com histórico de velocidade (3+ sprints).
- Você usa pontos para *planejamento* (quanto cabe no sprint) e *retrospectiva* (estimamos bem?), não como métrica de performance individual.
- O time entende que pontos são tamanho relativo, não tempo.

**Quando não fazem sentido:**
- Time muito novo (use t-shirt size: XS/S/M/L/XL até calibrar).
- Trabalho muito heterogêneo (50% bug fix, 50% features novas — pontos param de ser comparáveis).
- Cultura organizacional usa pontos como vara de medir produtividade — Scrum bem-feito não faz isso.

## Definition of Ready (entrar no sprint)

Uma história só entra em sprint planning se:
- Tem título no formato `verbo + objeto`
- Tem `## História` com Como/quero/para
- Tem ≥1 cenário de aceite em Gherkin
- Tem `size` estimado (pontos ou t-shirt)
- Tem labels `type:*` e `area:*` mínimas
- Dependências externas (design, infra) estão resolvidas ou marcadas como `status:blocked`

Histórias sem isso vão para refinamento, não para o sprint.

## Definition of Done (sair do sprint)

- Critérios de aceite todos marcados
- Checklist DoD da issue marcado
- PR mergeado em main
- Tests verdes em CI
- Deploy em staging (se aplicável) validado
- Documentação/changelog atualizados se mudou comportamento externo

## Cerimônias e o que registrar no GitHub

- **Planning** → puxa issues para o sprint atual (campo Sprint no Project, milestone aplicada). Total de pontos visível na view "Table".
- **Daily** → não toca em issue; usa Project board para conversar.
- **Review** → fecha milestone do sprint, gera release notes via `gh release create --generate-notes`, abre o próximo milestone.
- **Retro** → cria uma issue `type:task` com label `retro:sprint-NN` para cada ação acordada.
