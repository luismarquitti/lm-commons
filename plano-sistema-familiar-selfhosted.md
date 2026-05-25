# Sistema de Organização Familiar — Self-Hosted
## Plano de Implementação — Abordagem Híbrida (Markdown + SQLite)

**Versão:** 2.0  
**Data:** 2026-05-24  
**Contexto:** Infraestrutura local no homelab de Luis, servindo como backend para os agentes OpenClaw (Bandit/Chilli) via MCP. Dashboard principal é o próprio OpenClaw; frontend web opcional para uso secundário.

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                          HOMELAB                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │               familia-mcp  (Python / FastMCP)           │  │
│   │                                                         │  │
│   │   ┌──────────────────────┐  ┌───────────────────────┐  │  │
│   │   │   Markdown Files     │  │   SQLite              │  │  │
│   │   │   (fonte da verdade  │  │   (fonte da verdade   │  │  │
│   │   │    módulos narrativos│  │    módulos de cálculo)│  │  │
│   │   │                      │  │                       │  │  │
│   │   │  agenda/             │  │   transactions        │  │  │
│   │   │  tarefas/            │  │   accounts            │  │  │
│   │   │  compras/            │  │   budgets             │  │  │
│   │   │  refeicoes/          │  │   exercise_sessions   │  │  │
│   │   │  manutencao/         │  │   exercise_plans      │  │  │
│   │   │  rotinas/            │  │                       │  │  │
│   │   └──────────────────────┘  └───────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │  MCP (porta 8001)
              ┌────────────┴──────────────┐
              │    OpenClaw Gateway       │
              └──────┬───────────┬────────┘
                     │           │
              ┌──────▼──┐   ┌────▼──────┐
              │  Bandit  │   │  Chilli   │
              │  (Luis)  │   │  (Eluma)  │
              └──────────┘   └───────────┘
                     │           │
              └──────▼───────────▼──────┘
                    Telegram (interface)
                           │
              ┌────────────▼────────────┐
              │   Google Calendar API   │
              │   (espelho eventual)    │
              └─────────────────────────┘
```

### Princípios da Arquitetura

- **Markdown** é a fonte da verdade para módulos narrativos — conteúdo que os agentes leem e escrevem como texto (agenda, tarefas, compras, refeições, manutenção, rotinas).
- **SQLite** é a fonte da verdade para módulos de cálculo — dados que precisam de queries, agregações e integridade referencial (finanças e exercícios). Um único arquivo `.db` no disco, sem servidor.
- **familia-mcp** é o único processo rodando — um servidor FastMCP em Python que lê/escreve arquivos Markdown e faz queries no SQLite. Sem camadas de cache, sem ORM pesado.
- **OpenClaw Dashboard** é a interface principal para Luis e Eluma — nenhum frontend customizado é necessário nesta versão.
- **Frontend web** (opcional) pode ser adicionado depois como um leitor/editor de Markdown + wrapper de consultas SQLite, sem alterar a arquitetura central.
- **Google Calendar** é espelho eventual — job agendado dentro do `familia-mcp` sincroniza eventos.
- **Permissões por agente:** Bandit e Chilli têm tokens distintos; o servidor aplica escopo de acesso automaticamente.

---

## 2. Stack Tecnológico

### MCP Server

| Componente | Tecnologia | Justificativa |
|---|---|---|
| Linguagem | **Python 3.12** | Ecossistema MCP nativo, libs de calendário, parsing de Markdown |
| MCP Framework | **FastMCP** | Biblioteca oficial Python para MCP — define tools com decorators simples |
| SQLite | **sqlite3 + SQLModel** | sqlite3 é stdlib Python (sem instalação); SQLModel para tipagem e queries limpas |
| Markdown I/O | **python-frontmatter + mistletoe** | Leitura de YAML frontmatter + Markdown estruturado |
| Agendamento | **APScheduler** | Google Calendar sync, geração de rotinas, envio de lembretes |
| Google Calendar | **google-api-python-client** | Sync bidirecional com a API oficial |

### Infraestrutura (Homelab)

| Componente | Tecnologia |
|---|---|
| Processo principal | Python rodando diretamente ou em Docker single-container |
| Proxy reverso | **Caddy** (HTTPS automático) |
| Persistência | Diretório `data/` no disco do homelab (Markdown + SQLite) |
| Versionamento | **Git** no diretório `data/` — histórico e backup gratuitos |
| Backup adicional | Script cron: `rclone sync data/ remote:familia-backup` |

> **Por que não Docker Compose com múltiplos serviços?**  
> Com um único processo Python sem banco externo, um Dockerfile simples é suficiente. O `data/` é um volume montado — o container pode ser substituído sem perda de dados.

---

## 3. Estrutura de Arquivos e Dados

### 3.1 Layout do Projeto

```
familia-hub/
├── Dockerfile
├── docker-compose.yml          # só o MCP server + Caddy
├── Caddyfile
├── pyproject.toml
├── .env.example
├── app/
│   ├── main.py                 # FastMCP server entry point
│   ├── config.py               # Settings (pydantic-settings)
│   ├── db.py                   # SQLite connection + SQLModel setup
│   ├── models/                 # SQLModel models (só finanças e exercícios)
│   │   ├── finance.py
│   │   └── exercise.py
│   ├── mcp/                    # MCP tools por módulo
│   │   ├── context_tools.py    # get_family_context, get_user_context
│   │   ├── agenda_tools.py     # lê/escreve Markdown
│   │   ├── task_tools.py       # lê/escreve Markdown
│   │   ├── shopping_tools.py   # lê/escreve Markdown
│   │   ├── meal_tools.py       # lê/escreve Markdown
│   │   ├── maintenance_tools.py# lê/escreve Markdown
│   │   ├── routine_tools.py    # lê/escreve Markdown
│   │   ├── finance_tools.py    # queries SQLite
│   │   └── exercise_tools.py   # queries SQLite
│   ├── md/                     # helpers de leitura/escrita Markdown
│   │   ├── reader.py
│   │   └── writer.py
│   ├── services/
│   │   ├── google_calendar.py  # sync bidirecional
│   │   ├── scheduler.py        # APScheduler jobs
│   │   └── permissions.py      # controle Bandit vs Chilli
│   └── migrate.py              # cria/atualiza schema SQLite na inicialização
├── data/                       # VOLUME PERSISTENTE — fonte da verdade
│   ├── .git/                   # versionamento automático
│   ├── agenda/
│   ├── tarefas/
│   ├── compras/
│   ├── refeicoes/
│   ├── manutencao/
│   ├── rotinas/
│   └── db/
│       └── familia.db          # SQLite (finanças + exercícios)
└── scripts/
    ├── backup.sh
    └── seed.py                 # cria usuários e dados iniciais
```

### 3.2 Estrutura dos Arquivos Markdown

Cada arquivo usa **YAML frontmatter** para metadados estruturados e corpo Markdown para conteúdo legível. Isso permite que os agentes leiam o conteúdo naturalmente e que o servidor faça parsing leve quando precisar de campos específicos.

**`data/agenda/2026-05.md`**
```markdown
---
module: agenda
month: 2026-05
---

## 2026-05-24 (Sábado)

- [10:00] Pilates — Eluma | personal
- [14:00] Feira do bairro | family

## 2026-05-26 (Segunda)

- [08:00] Reunião trabalho — Luis | personal
- [19:30] Jantar família | family
  - local: Restaurante Xpto
```

**`data/tarefas/pendentes.md`**
```markdown
---
module: tarefas
updated_at: 2026-05-24T10:30:00-03:00
---

## Alta Prioridade

- [ ] Pagar conta de luz (vence 28/05) — Luis | due:2026-05-28
- [ ] Marcar consulta médica — Eluma | due:2026-05-30

## Média Prioridade

- [ ] Comprar presente aniversário da mãe — Luis | due:2026-06-10
- [ ] Organizar armário da cozinha | family

## Concluídas (recentes)

- [x] Trocar filtro do ar condicionado — Luis | done:2026-05-22
```

**`data/compras/lista-ativa.md`**
```markdown
---
module: compras
list_id: lista-2026-05-24
store: mercado
scheduled: 2026-05-25
status: open
created_by: eluma
updated_at: 2026-05-24T09:00:00-03:00
---

## Hortifruti
- [ ] Banana (1 kg)
- [ ] Tomate (500g)
- [x] Alface

## Laticínios
- [ ] Leite integral (2 L)
- [ ] Queijo mussarela (300g)

## Limpeza
- [ ] Detergente
- [ ] Sabão em pó
```

**`data/refeicoes/semana-2026-05-20.md`**
```markdown
---
module: refeicoes
week_start: 2026-05-20
---

| Dia       | Café          | Almoço              | Jantar            |
|-----------|---------------|---------------------|-------------------|
| Segunda   | Aveia + fruta | Frango com legumes  | Sopa de legumes   |
| Terça     | Ovos mexidos  | Arroz, feijão, bife | Macarrão integral |
| Quarta    | Iogurte       | Marmita (trabalho)  | Pizza caseira     |
| Quinta    | Aveia + fruta | Salada com atum     | Frango grelhado   |
| Sexta     | Tapioca       | Fora                | Hambúrguer caseiro|
| Sábado    | Panqueca      | Churrasco           | Sobras            |
| Domingo   | Café da manhã | Macarrão            | Leve              |
```

**`data/manutencao/items.md`**
```markdown
---
module: manutencao
updated_at: 2026-05-24
---

## Itens de Manutenção

### Limpeza
| Item                    | Frequência | Último feito | Próximo    | Responsável |
|-------------------------|-----------|--------------|------------|-------------|
| Limpeza do banheiro     | 7 dias    | 2026-05-20   | 2026-05-27 | rodízio     |
| Limpeza da cozinha      | 3 dias    | 2026-05-23   | 2026-05-26 | rodízio     |
| Aspirar e varrer        | 7 dias    | 2026-05-18   | ⚠️ 2026-05-25 | Luis      |

### Reparos / Técnico
| Item                    | Frequência | Último feito | Próximo    | Responsável |
|-------------------------|-----------|--------------|------------|-------------|
| Trocar filtro ar-cond.  | 90 dias   | 2026-05-22   | 2026-08-20 | Luis        |
| Verificar caixa d'água  | 180 dias  | 2026-02-01   | 2026-08-01 | Luis        |
```

---

## 4. Schema SQLite (Finanças e Exercícios)

O schema é criado automaticamente pelo `migrate.py` na inicialização — sem ferramenta de migration externa.

```python
# app/models/finance.py (SQLModel)

class Account(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    type: str          # 'corrente' | 'poupanca' | 'cartao'
    currency: str = "BRL"
    owner: str | None  # 'luis' | 'eluma' | None (= família)
    active: bool = True

class Transaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    title: str
    amount: float      # negativo = despesa, positivo = receita
    date: date
    category: str
    subcategory: str | None = None
    installments: int = 1
    installment_no: int = 1
    recurring: bool = False
    notes: str | None = None
    owner: str | None  # 'luis' | 'eluma' | None (= família)
    created_at: datetime = Field(default_factory=datetime.now)

class Budget(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    category: str
    month: date        # sempre dia 1 do mês
    amount: float
    owner: str | None  # None = orçamento familiar


# app/models/exercise.py

class ExerciseSession(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user: str          # 'luis' | 'eluma'
    type: str          # 'academia' | 'caminhada' | 'pilates' | 'corrida'
    scheduled_at: datetime | None = None
    done_at: datetime | None = None
    duration_min: int | None = None
    skipped: bool = False
    skip_reason: str | None = None
    notes: str | None = None
    created_at: datetime = Field(default_factory=datetime.now)
```

---

## 5. MCP Tools para os Agentes

### 5.1 Contexto (ponto de entrada principal dos agentes)

```python
@mcp.tool()
async def get_family_context(agent_id: str) -> str:
    """
    Retorna snapshot do dia: eventos, tarefas urgentes, refeições planejadas,
    itens de manutenção vencidos. Formatado em Markdown para leitura direta.
    Chamada típica no início de cada conversa no Telegram.
    """

@mcp.tool()
async def get_user_context(agent_id: str) -> str:
    """
    Contexto pessoal: exercícios recentes, streak, resumo financeiro do mês.
    Bandit retorna dados do Luis; Chilli retorna dados da Eluma.
    """
```

### 5.2 Tools por Módulo

```python
# ── Agenda (Markdown) ────────────────────────────────────────────
list_events(agent_id, from_date, to_date)
create_event(agent_id, title, date, time, visibility, notes)
delete_event(agent_id, date, title)

# ── Tarefas (Markdown) ───────────────────────────────────────────
list_tasks(agent_id, status)          # 'pending' | 'done' | 'all'
create_task(agent_id, title, priority, due_date, assigned_to)
complete_task(agent_id, title)

# ── Compras (Markdown) ───────────────────────────────────────────
get_shopping_list(agent_id)
add_shopping_item(agent_id, name, quantity, category)
check_shopping_item(agent_id, item_name)
create_shopping_list(agent_id, store, scheduled)

# ── Refeições (Markdown) ─────────────────────────────────────────
get_meal_plan(agent_id, week_start)
set_meal(agent_id, date, meal_type, name, notes)
generate_shopping_from_meals(agent_id, week_start)

# ── Manutenção (Markdown) ────────────────────────────────────────
list_maintenance_due(agent_id, days_ahead)
log_maintenance_done(agent_id, item_name, notes)

# ── Finanças (SQLite) ────────────────────────────────────────────
register_transaction(agent_id, title, amount, category, date, account)
get_monthly_summary(agent_id, month)      # soma por categoria, saldo
get_budget_status(agent_id, month)        # orçado vs realizado
list_transactions(agent_id, month, category)

# ── Exercícios (SQLite) ──────────────────────────────────────────
log_exercise(agent_id, type, duration_min, notes, done_at)
log_exercise_skipped(agent_id, type, reason)
get_exercise_streak(agent_id)
get_exercise_summary(agent_id, month)
```

### 5.3 Controle de Permissão

```python
AGENT_SCOPE = {
    "bandit": {
        "user": "luis",
        "can_read_family": True,
        "finance_scope": "full",        # contas pessoais + familiares
        "exercise_scope": "luis_only",
    },
    "chilli": {
        "user": "eluma",
        "can_read_family": True,
        "finance_scope": "family_only", # só gastos familiares
        "exercise_scope": "eluma_only",
    },
}
```

Cada tool valida `agent_id` antes de qualquer operação. Operações de escrita em dados pessoais rejeitam silenciosamente se o agente não for o dono.

---

## 6. Sincronização com Google Calendar

Mesma estratégia do plano anterior, mas implementada como um job dentro do `familia-mcp`:

```python
# services/google_calendar.py

async def export_to_google(event: dict):
    """Cria ou atualiza evento no Google Calendar quando o arquivo Markdown muda."""

async def import_from_google():
    """Busca eventos novos/editados no Google e atualiza os arquivos Markdown."""

# services/scheduler.py
scheduler.add_job(import_from_google, 'interval', minutes=15)
scheduler.add_job(generate_routine_reminders, 'cron', hour=7, minute=0)
scheduler.add_job(auto_git_commit, 'cron', hour=3, minute=0)  # backup diário
```

O job `auto_git_commit` faz um `git add . && git commit -m "auto: backup $(date)"` no diretório `data/` — histórico completo de todas as mudanças, sem custo.

---

## 7. Docker Compose

Muito mais simples que o plano anterior — um único container para o servidor MCP mais Caddy como proxy.

```yaml
version: '3.9'

services:

  familia-mcp:
    build: .
    restart: unless-stopped
    ports:
      - "8001:8001"    # MCP Server (OpenClaw)
    volumes:
      - ./data:/app/data   # Markdown + SQLite persistidos no host
    environment:
      SECRET_KEY: ${SECRET_KEY}
      BANDIT_API_KEY: ${BANDIT_API_KEY}
      CHILLI_API_KEY: ${CHILLI_API_KEY}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_REFRESH_TOKEN: ${GOOGLE_REFRESH_TOKEN}
      DATA_DIR: /app/data

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - familia-mcp

volumes:
  caddy_data:
```

> Sem PostgreSQL, sem Redis, sem container de frontend. O `data/` é um bind mount direto no host — acessível pelo container e diretamente no filesystem do homelab.

---

## 8. Plano de Implementação por Fases

### Fase 0 — Fundação (1 dia)

**Objetivo:** Servidor MCP rodando, registrado no OpenClaw, lendo o primeiro arquivo Markdown.

- [ ] Criar repositório; inicializar `data/` com `git init`
- [ ] FastMCP server com tool `ping` funcionando na porta 8001
- [ ] Registrar `familia-mcp` no gateway do OpenClaw com tokens Bandit/Chilli
- [ ] Tool `get_family_context` retornando placeholder (arquivo `data/contexto.md`)
- [ ] Docker Compose rodando no homelab
- [ ] Caddy com HTTPS apontando para porta 8001
- [ ] Script `seed.py` cria estrutura inicial de pastas e arquivos vazios

**Entregável:** Bandit/Chilli conseguem chamar `get_family_context` pelo Telegram.

---

### Fase 1 — Agenda e Tarefas (2 dias)

**Objetivo:** Os módulos mais usados diariamente funcionando.

- [ ] Helper `md/reader.py`: parsear YAML frontmatter + extrair eventos/tarefas por data
- [ ] Helper `md/writer.py`: adicionar/atualizar/remover itens em arquivos Markdown
- [ ] MCP tools: `list_events`, `create_event`, `list_tasks`, `create_task`, `complete_task`
- [ ] `get_family_context` real: lê agenda do dia + tarefas pendentes e retorna Markdown formatado
- [ ] Sync básico Google Calendar → Markdown (importação de eventos)
- [ ] Testar Bandit e Chilli: "O que temos hoje?", "Cria uma tarefa para X"

**Entregável:** Agenda e tarefas gerenciáveis pelos agentes e editáveis diretamente nos arquivos.

---

### Fase 2 — Compras e Refeições (1–2 dias)

**Objetivo:** Planejamento semanal integrado.

- [ ] MCP tools para compras: `get_shopping_list`, `add_shopping_item`, `check_shopping_item`
- [ ] MCP tools para refeições: `get_meal_plan`, `set_meal`, `generate_shopping_from_meals`
- [ ] Lógica de `generate_shopping_from_meals`: lê a grade de refeições e extrai ingredientes para um novo arquivo de lista de compras
- [ ] Testar: "Adiciona leite à lista", "Qual a janta de terça?"

**Entregável:** Compras e refeições gerenciáveis via Telegram.

---

### Fase 3 — Manutenção e Rotinas (1–2 dias)

**Objetivo:** Acompanhamento da casa e lembretes proativos.

- [ ] MCP tools: `list_maintenance_due`, `log_maintenance_done`
- [ ] Job APScheduler: todo dia às 7h, verifica `manutencao/items.md` e envia lembretes para itens vencidos via Telegram
- [ ] Interface para criar rotinas em `rotinas/rotinas.md`
- [ ] Job de lembrete matinal: monta resumo do dia (agenda + tarefas + manutenção) e envia via Telegram para cada agente

**Entregável:** Lembretes proativos funcionando; manutenção visível.

---

### Fase 4 — Finanças (2 dias)

**Objetivo:** Controle financeiro com queries reais.

- [ ] `migrate.py`: cria schema SQLite na inicialização (accounts, transactions, budgets)
- [ ] Script `seed.py` cria contas iniciais (conta corrente, cartão)
- [ ] MCP tools: `register_transaction`, `get_monthly_summary`, `get_budget_status`
- [ ] Controle de permissão: Chilli vê apenas gastos familiares; Bandit vê tudo
- [ ] Testar: "Gastei R$80 no mercado hoje", "Como estão os gastos de maio?"

**Entregável:** Lançamento e consulta financeira funcionando via Telegram.

---

### Fase 5 — Exercícios e Polimentos (1–2 dias)

**Objetivo:** Acompanhamento de exercícios e sistema completo refinado.

- [ ] MCP tools: `log_exercise`, `log_exercise_skipped`, `get_exercise_streak`, `get_exercise_summary`
- [ ] `get_user_context` completo: streak de exercícios + resumo financeiro do mês
- [ ] Sync bidirecional Google Calendar (exportação de eventos criados via MCP)
- [ ] Job `auto_git_commit`: commit diário automático no `data/`
- [ ] Script de backup extra: `rclone` ou cópia para segundo disco
- [ ] Testar fluxo completo com Bandit e Chilli por uma semana

**Entregável:** Sistema completo, estável, com backup automático.

---

## 9. Estimativa de Esforço Total

| Fase | Duração estimada |
|---|---|
| Fase 0 — Fundação | 1 dia |
| Fase 1 — Agenda e Tarefas | 2 dias |
| Fase 2 — Compras e Refeições | 1–2 dias |
| Fase 3 — Manutenção e Rotinas | 1–2 dias |
| Fase 4 — Finanças (SQLite) | 2 dias |
| Fase 5 — Exercícios e Polimentos | 1–2 dias |
| **Total** | **~8–11 dias** |

Redução de ~35% em relação ao plano com PostgreSQL, principalmente pela eliminação das migrations, do ORM pesado, do Redis e do frontend.

---

## 10. Registrando o MCP no Gateway do OpenClaw

```json
{
  "name": "familia-hub",
  "type": "http",
  "url": "https://<homelab-domain>:8001/mcp",
  "auth": {
    "type": "bearer"
  },
  "agents": {
    "bandit": { "token": "${BANDIT_API_KEY}" },
    "chilli": { "token": "${CHILLI_API_KEY}" }
  }
}
```

---

## 11. Decisões a Confirmar

1. **Acesso externo ao homelab:** O gateway do OpenClaw acessa o MCP via rede local, Tailscale ou domínio público?
2. **Notificações Telegram:** O backend chama diretamente a API do Telegram, ou entrega mensagens via uma API do OpenClaw gateway?
3. **Idioma do código:** Comentários e variáveis em inglês ou português?
4. **Google Calendar:** Quais calendários sincronizar? Um compartilhado familiar + os pessoais de cada um?
5. **Frontend opcional:** Deseja uma interface web simples (leitura dos arquivos Markdown + consultas SQLite) como fase futura, ou o OpenClaw Dashboard é suficiente indefinidamente?
