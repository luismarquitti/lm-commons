# Labels Taxonomy — por que esse esquema existe

Labels servem para **filtrar e visualizar**, não para narrar. Se você tem 80 labels, ninguém usa direito — sua taxonomia virou cemitério. Mantenha entre 15 e 25 labels ativas.

## Convenções

- **Tudo minúsculo.** `priority:p1`, não `Priority:P1`.
- **Categoria:valor com dois pontos.** Vira agrupamento natural no filtro do GitHub.
- **Sem espaços, sem emoji no nome.** Use hífen: `area:checkout-mobile`.
- **Cor por categoria, não por valor.** Todas as `priority:*` em vermelho/laranja; todas as `type:*` em azul; etc. Cor sinaliza o *tipo* da decisão, não o conteúdo.
- **Description curta e útil.** Não repita o nome; explique quando usar.

## Categorias padrão

### `type:*` — o que é a issue
Determina o template e o local no roadmap. Toda issue tem exatamente *uma*.

| Label | Quando usar |
|---|---|
| `type:epic` | Issue-mãe de um épico (2-6 sprints). Tem checklist de filhas. |
| `type:user-story` | Incremento de valor para um usuário, com critérios de aceite. |
| `type:task` | Trabalho técnico necessário mas sem valor direto para usuário (refatoração, setup de CI, migração de dados). |
| `type:bug` | Comportamento divergente do esperado em produção ou staging. |
| `type:spike` | Investigação time-boxed para reduzir incerteza antes de estimar. |
| `type:tech-debt` | Dívida técnica conhecida com plano de pagamento. |

### `priority:*` — urgência relativa
Use com parcimônia. Se tudo é p1, nada é p1.

| Label | Quando usar |
|---|---|
| `priority:p0` | Crítico — produção quebrada, perda de receita ativa. Pause outras coisas. |
| `priority:p1` | Alto — entra no próximo sprint sem discussão. |
| `priority:p2` | Médio — entra quando der, próximos 2-3 sprints. |
| `priority:p3` | Baixo — bom ter, sem pressa. |

### `status:*` — estado no fluxo (opcional)
Só use se você **não** estiver usando um Project v2 (que já tem campo Status). Para projects, deixe o status no project e não duplique em labels.

| Label | Quando usar |
|---|---|
| `status:blocked` | Bloqueada por dependência externa. Inclua quem/o quê no corpo. |
| `status:needs-design` | Falta decisão de UX antes de mexer no código. |
| `status:needs-spec` | Falta refinamento de produto. |

### `size:*` — story points
Espelha a estimativa em label para filtros rápidos no board.

| Label | Pontos |
|---|---|
| `size:xs` | 1 |
| `size:s` | 2 |
| `size:m` | 3 |
| `size:l` | 5 |
| `size:xl` | 8 |
| `size:xxl` | 13 — *sinal de quebra* |

### `area:*` — fronteira do código/domínio
Custom por projeto. Exemplos comuns: `area:auth`, `area:billing`, `area:checkout`, `area:dashboard`, `area:infra`, `area:docs`. Crie só os que vão ter ≥3 issues no curto prazo. Adicionar `area:*` depois é barato.

### `epic:*` — vínculo a um épico (opcional)
Quando o GitHub task list em uma issue-épico não basta (ex: repos sem suporte a sub-issues nativos), use `epic:<slug>` para filtrar histórias filhas.

### `needs:*` — bloqueios soft
| Label | Quando usar |
|---|---|
| `needs:triage` | Recém-chegada, precisa categorizar (default em issues criadas por usuários externos). |
| `needs:repro` | Bug sem passos de reprodução claros. |
| `needs:info` | Aguardando resposta de quem abriu. |

## Cores sugeridas (hex)

- `type:*` → `#1f77b4` (azul)
- `priority:p0` → `#b60205`; `p1` → `#d93f0b`; `p2` → `#fbca04`; `p3` → `#c5def5`
- `status:*` → `#5319e7` (roxo)
- `size:*` → `#0e8a16` (verde)
- `area:*` → `#bfd4f2` (azul claro)
- `needs:*` → `#fef2c0` (amarelo claro)

## Anti-padrões

- **`bug`, `enhancement`, `documentation` soltos** (os defaults do GitHub) — sem categoria, atrapalham. Substitua por `type:bug`, `type:user-story` (ou `type:task`), `type:docs`.
- **`good first issue` confundido com `type:*`.** É um sinalizador para contribuidores externos; pode coexistir com `type:bug`.
- **Labels redundantes a outros campos.** Se o Project v2 tem campo "Sprint", não crie `sprint-3` como label.
- **Labels para pessoas.** Use `assignees`, não `assigned:fulano`. Labels não são pessoas.
