# `gh` — cheat sheet das chamadas usadas por esta skill

Tudo abaixo assume `gh auth login` feito, com escopos `repo`, `project` (e `read:org` para orgs).
Verifique escopos atuais com `gh auth status -t`.

## Repo (sempre confirme antes de mutar)

```bash
gh repo view --json nameWithOwner,visibility,description
gh repo view owner/name --json nameWithOwner
```

## Issues

```bash
# Criar
gh issue create \
  --repo owner/name \
  --title "Recuperar senha por e-mail" \
  --body-file body.md \
  --label "type:user-story,area:auth,size:m" \
  --milestone "sprint-01" \
  --assignee @me

# Listar
gh issue list --repo owner/name --label "type:epic" --state open --json number,title,labels
gh issue list --repo owner/name --milestone "sprint-01" --json number,title,state

# Editar
gh issue edit 42 --repo owner/name --add-label "priority:p1" --milestone "sprint-02"
gh issue edit 42 --repo owner/name --remove-label "needs:triage"

# Fechar / reabrir
gh issue close 42 --repo owner/name --comment "Resolvido em #58"
gh issue reopen 42 --repo owner/name

# Comentar
gh issue comment 42 --repo owner/name --body "Atualizei o critério de aceite #3"
```

Para criar muitas, prefira `scripts/create_issues_batch.py`.

## Labels

```bash
# Listar (use para diff antes de aplicar)
gh label list --repo owner/name --json name,color,description

# Criar / atualizar (idempotente com --force)
gh label create "type:user-story" --repo owner/name \
  --color "1f77b4" --description "Incremento de valor para um usuário" --force

# Deletar (cuidado)
gh label delete "old-label" --repo owner/name --yes
```

Prefira `scripts/apply_labels.sh` para aplicar um YAML inteiro.

## Milestones

`gh` não tem subcomando dedicado a milestones; use a API:

```bash
# Listar
gh api repos/owner/name/milestones --jq '.[] | {number,title,due_on,state}'

# Criar sprint-01
gh api repos/owner/name/milestones \
  -f title="sprint-01" \
  -f due_on="2026-05-26T23:59:59Z" \
  -f description="Sprint 01 — Foundations" \
  -f state="open"

# Atualizar (precisa do number)
gh api repos/owner/name/milestones/3 -X PATCH -f state="closed"
```

Prefira `scripts/create_milestones.sh` para criar uma sequência de sprints.

## Projects v2

Projects v2 são *user-scoped* ou *org-scoped*, nunca repo-scoped (apesar de aparecerem ligados a repos). Confirme o owner antes.

```bash
# Listar projetos do usuário ou da org
gh project list --owner @me
gh project list --owner acme-corp

# Criar projeto
gh project create --owner acme-corp --title "Roadmap 2026 Q2" --format json

# Listar campos
gh project field-list 7 --owner acme-corp --format json

# Criar campo single-select (Status já existe por padrão)
gh project field-create 7 --owner acme-corp \
  --name "Priority" --data-type "SINGLE_SELECT" \
  --single-select-options "P0,P1,P2,P3"

# Criar campo numérico
gh project field-create 7 --owner acme-corp --name "Size" --data-type "NUMBER"

# Criar iteration field (sprints) — só via GraphQL
gh api graphql -f query='
  mutation {
    createProjectV2Field(input: {
      projectId: "PVT_xxx"
      dataType: ITERATION
      name: "Sprint"
    }) { projectV2Field { ... on ProjectV2IterationField { id name } } }
  }'

# Adicionar issue ao projeto
gh project item-add 7 --owner acme-corp --url https://github.com/owner/name/issues/42
```

Views (board, table, roadmap) atualmente são criadas via web UI **ou** via GraphQL com `createProjectV2View`. O script `setup_project.sh` faz isso onde possível e, quando não, gera instruções manuais com os parâmetros prontos para copiar.

## Releases (para fechar sprint)

```bash
gh release create v0.3.0 --repo owner/name \
  --title "Sprint 03 — Recuperação de conta" \
  --generate-notes \
  --target main
```

## Padrão "dry-run" — sempre antes de aplicar

Para qualquer comando que **cria** ou **edita** algo, mostre primeiro:
- O comando exato
- A contagem do que será afetado ("23 issues, 4 labels novas, 2 milestones")
- Em qual repo (`gh repo view --json nameWithOwner` para confirmar)

Só execute após confirmação explícita do usuário. Os scripts bundled seguem esse padrão (flag `--dry-run` por padrão; `--apply` para executar).
