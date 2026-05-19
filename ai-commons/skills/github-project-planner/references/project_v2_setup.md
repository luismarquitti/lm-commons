# GitHub Projects v2 — modelo e setup

GitHub Projects v2 (não confundir com Projects classic, que está deprecated) é o board oficial. Modelo mental:

- **Project** — o board em si, pertence a um *user* ou *org* (nunca repo).
- **Items** — issues, PRs ou drafts adicionados ao project.
- **Fields** — colunas customizáveis: Status (default), Iteration, Single-Select, Number, Date, Text.
- **Views** — diferentes lentes sobre os mesmos items: Board (kanban), Table (planilha), Roadmap (timeline).

## Campos recomendados para Scrum

| Campo | Tipo | Opções/uso |
|---|---|---|
| **Status** | Single-select (já existe) | `Backlog`, `Refinement`, `Ready`, `In progress`, `In review`, `Done`, `Blocked` |
| **Priority** | Single-select | `P0`, `P1`, `P2`, `P3` |
| **Size** | Number | Story points (1, 2, 3, 5, 8, 13) |
| **Sprint** | Iteration | Sprints com data de início e duração (default 2 semanas) |
| **Epic** | Single-select | Lista os épicos ativos; permite agrupar a view |
| **Area** | Single-select | `auth`, `billing`, `checkout`, etc. — espelho dos labels `area:*` |

Para Kanban, troque Sprint por **WIP Class** (single-select: `expedite`, `standard`, `fixed-date`, `intangible`) e remova Size se o time não usa pontos.

## Views recomendadas

1. **Board** — agrupada por Status. View padrão para o time durante o sprint.
2. **Sprint Backlog** — Table view, filtrada por `Sprint = @current`, ordenada por Priority desc, Size asc. Total de Size visível no rodapé.
3. **All Backlog** — Table view, filtrada por `Status != Done`, agrupada por Epic, ordenada por Priority.
4. **Roadmap** — Roadmap view, eixo de tempo por Sprint (iteration field), agrupado por Epic. Visão de planejamento.
5. **My items** — Board view, filtrada por `Assignee = @me`. Útil para cada dev.

## Setup via `gh` + GraphQL

O CLI cobre criação de project, fields single-select/number/date/text. Para **iteration fields** e **views** customizadas, é preciso usar GraphQL via `gh api graphql`. O script `setup_project.sh` faz o que dá pelo CLI e imprime os comandos GraphQL prontos quando precisa cair para a API.

Fluxo do script:
1. `gh project create --owner $OWNER --title $TITLE --format json` → captura o `id` (node ID) e `number`.
2. Para cada single-select field no config: `gh project field-create`.
3. Para o campo Size (number): `gh project field-create --data-type NUMBER`.
4. Para o Sprint (iteration): mutation `createProjectV2Field` via `gh api graphql` (não suportado pelo CLI atualmente).
5. Para cada view: mutation `createProjectV2View` via `gh api graphql`.
6. Imprime no final o link do project (`https://github.com/users/$OWNER/projects/$NUMBER`).

## Formato do `project_v2_config.json`

```json
{
  "title": "Roadmap 2026 Q2",
  "owner": "acme-corp",
  "owner_type": "org",
  "short_description": "Roadmap do produto X — Sprints 1 a 6 de 2026",
  "fields": [
    {
      "name": "Priority",
      "type": "SINGLE_SELECT",
      "options": ["P0", "P1", "P2", "P3"]
    },
    {
      "name": "Size",
      "type": "NUMBER"
    },
    {
      "name": "Sprint",
      "type": "ITERATION",
      "duration_days": 14,
      "iterations": [
        {"title": "sprint-01", "start_date": "2026-05-12"},
        {"title": "sprint-02", "start_date": "2026-05-26"},
        {"title": "sprint-03", "start_date": "2026-06-09"}
      ]
    },
    {
      "name": "Epic",
      "type": "SINGLE_SELECT",
      "options": ["Onboarding", "Checkout", "Dashboard", "Infra"]
    },
    {
      "name": "Area",
      "type": "SINGLE_SELECT",
      "options": ["auth", "billing", "checkout", "dashboard", "infra"]
    }
  ],
  "views": [
    {
      "name": "Board",
      "layout": "BOARD_LAYOUT",
      "group_by": "Status"
    },
    {
      "name": "Sprint Backlog",
      "layout": "TABLE_LAYOUT",
      "filter": "sprint:@current status:!=Done",
      "sort": [{"field": "Priority", "direction": "DESC"}, {"field": "Size", "direction": "ASC"}]
    },
    {
      "name": "All Backlog",
      "layout": "TABLE_LAYOUT",
      "filter": "status:!=Done",
      "group_by": "Epic"
    },
    {
      "name": "Roadmap",
      "layout": "ROADMAP_LAYOUT",
      "x_axis": "Sprint",
      "group_by": "Epic"
    }
  ],
  "auto_add": {
    "repos": ["acme-corp/checkout", "acme-corp/checkout-mobile"],
    "filter": "is:issue is:open"
  }
}
```

`auto_add` configura a regra de "auto-add items" do project, que captura novas issues criadas nos repos listados. Importante para o board não ficar desatualizado.

## Limitações atuais a comunicar ao usuário

- **Views via API são instáveis.** A GraphQL para criar/configurar views existe mas algumas opções (layout específico de roadmap, agrupamento composto) precisam de ajuste manual na UI depois.
- **Iteration fields não podem ser apagados via API.** Crie com cuidado.
- **Auto-add tem limites de quota.** Para repos com muitas issues novas/dia, considere filtros mais estreitos.

Quando o script cair em uma dessas limitações, ele imprime instruções claras: "O field/view X foi criado parcialmente. Para finalizar, abra `<URL>` e ajuste Y."
