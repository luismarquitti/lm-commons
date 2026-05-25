# 🏡 Sistema de Organização Familiar

> Hub central da família **Luis & Eluma** — agenda, tarefas, casa, compras, refeições, exercícios e finanças.
Notion é a fonte da verdade. Google é a camada de notificação. Bandit e Chilli são os atalhos conversacionais via Telegram.
> 

---

## ⭐ Como usar esta página

Esta é a página-mãe do sistema. As subpáginas/databases estão linkadas abaixo. **Sempre que houver dúvida sobre onde algo deve ser registrado, comece daqui.**

- **Compromisso com data/hora?** → `Eventos`
- **Algo a fazer (com ou sem prazo)?** → `Tarefas`
- **Rotina recorrente da casa?** → `Manutenção da Casa`
- **Algo a comprar?** → `Lista de Compras`
- **Próxima refeição?** → `Cardápio`
- **Treino, caminhada, pilates?** → `Exercícios`
- **Gasto, recibo, fatura?** → `Finanças — Transações`

Para falar com os agentes pessoais:

- **Luis** → Bandit (Telegram)
- **Eluma** → Chilli (Telegram)

---

## 🧭 Princípios de operação

1. **Hub único de verdade.** Notion guarda; Google notifica; Telegram conversa.
2. **Pessoal × Família.** Cada item tem campo `Visibilidade`. Os agentes respeitam essa fronteira.
3. **Calendário é projeção.** Mudou no Notion → 2sync replica no Google. Mudou no Google → entra no Notion como rascunho a confirmar.
4. **Agentes não substituem a UI.** Bandit/Chilli aceleram, Notion permanece como ambiente de planejamento.
5. **Domingo é dia de calibrar.** 20 minutos juntos para revisar a semana e ajustar.

---

## 📐 Mapa do sistema (databases)

| Database | Propósito | Quem usa |
| --- | --- | --- |
| 👥 Pessoas | Master de integrantes (Luis, Eluma, futuros) | Sistema todo |
| 📅 Eventos | Compromissos com data/hora | Família |
| ✅ Tarefas | Pendências individuais e comuns | Família + Pessoal |
| 🔁 Rotinas | Rituais recorrentes (acordar, dormir, treinar) | Pessoal |
| 🛠️ Manutenção da Casa | Itens recorrentes com rodízio | Família |
| 🛒 Lista de Compras | Itens a comprar | Família |
| 🏪 Mercados / Idas | Programação de visitas (mercado, feira) | Família |
| 🍽️ Cardápio | Plano semanal de refeições | Família |
| 📖 Receitas | Banco de receitas com ingredientes | Família |
| 🏋️ Exercícios | Planos e histórico de treinos | Pessoal |
| 💳 Finanças — Contas | Cartões, contas, carteiras | Família |
| 💸 Finanças — Transações | Cada movimento | Família |
| 🎯 Finanças — Orçamento | Tetos mensais por categoria | Família |
| 🌱 Finanças — Metas | Poupança e investimentos | Família |

---

## 🏗️ Arquitetura em camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  L4 — INTERAÇÃO         Telegram (Bandit · Chilli) · Gemini      │
├─────────────────────────────────────────────────────────────────┤
│  L3 — UI HUMANA         Notion Web/Mobile · Google Calendar      │
│                         Google Keep · Gmail                       │
├─────────────────────────────────────────────────────────────────┤
│  L2 — SINCRONIZAÇÃO     2sync (Notion ↔ GCal)                    │
│                         n8n opcional · Webhooks                   │
├─────────────────────────────────────────────────────────────────┤
│  L1 — DADOS             Notion (14 databases) · Google Drive     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧰 Stack escolhida

### Núcleo obrigatório

- **Notion** (Plus ou Free) — hub central; databases relacionadas; views Calendar/Timeline/Board/Table.
- **Google Calendar** — agenda compartilhada nativa; notificações em todos os dispositivos.
- **Google Drive** — anexos (recibos, manuais, contratos) e backups do Notion.
- **Gmail** — labels para faturas e recibos; consumido pelos agentes via MCP.
- **Telegram + bots** — canal de Bandit e Chilli.
- **OpenClaw** — runtime dos agentes; expõe MCPs Notion, Google Calendar etc.
- **Gemini (Google AI Pro)** — geração de cardápios, consultas exploratórias, resumos.

### Sincronização

- **Recomendado: [2sync](https://2sync.com/)** — sync Notion ↔ Google Calendar em até 2 min, controle direcional por campo, ~US$8–15/mês.
- **Alternativa: n8n self-hosted** — quando quisermos automações complexas (e estivermos dispostos a manter).
- **Make/Zapier** — apenas para gatilhos pontuais (ex: e-mail → Transação).
- **Webhooks Notion (Beta)** — disparar Bandit/Chilli a partir de mudanças.

### Estratégia de construção

Toda a estrutura será criada do zero no Notion, sem templates pagos. Cada database segue a especificação detalhada na seção **🗄️ Especificação das Databases** abaixo, com propriedades, tipos e views sugeridas.

---

## 🗄️ Especificação das Databases (construção própria)

---

### 👥 Pessoas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Nome | Title | Luis, Eluma |
| E-mail | Email | — |
| Telegram ID | Text | ID numérico do usuário |
| Papel | Select | Adulto / Futuro integrante |
| Avatar | Files & Media | Foto de perfil |

---

### 📅 Eventos

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Título | Title | — |
| Data/Hora | Date | Com horário; suporta range |
| Recorrência | Select | Única / Diária / Semanal / Mensal |
| Responsável | Relation → Pessoas | Quem vai / quem cuida |
| Visibilidade | Select | Família / Pessoal |
| Local | Text | Endereço ou link |
| Google Event ID | Text | Preenchido pela 2sync |
| Status | Select | Confirmado / Pendente / Cancelado |
| Notas | Text | Informações extras |

**Views sugeridas:** Calendar (por mês), Timeline (por semana, agrupado por Responsável), Table "Próximos 7 dias", Table "Pessoal — Luis" e "Pessoal — Eluma".

---

### ✅ Tarefas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Título | Title | — |
| Status | Select | Backlog / A fazer / Em andamento / Concluída |
| Responsável | Relation → Pessoas | — |
| Visibilidade | Select | Família / Pessoal |
| Prazo | Date | Opcional |
| Área | Select | Casa / Saúde / Trabalho / Finanças / Outros |
| Prioridade | Select | Alta / Média / Baixa |
| Evento relacionado | Relation → Eventos | Opcional |
| Notas | Text | — |

**Views sugeridas:** Board por Status, Table "Hoje" (Prazo = hoje), Table "Atrasadas" (Prazo < hoje, Status ≠ Concluída), Table filtrada por Responsável.

---

### 🔁 Rotinas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Nome | Title | Ex: "Acordar 6h30", "Meditação" |
| Responsável | Relation → Pessoas | — |
| Horário | Text | "06:30" |
| Frequência | Select | Diária / Dias úteis / Fins de semana / Semanal |
| Dias da semana | Multi-select | Seg / Ter / Qua / Qui / Sex / Sáb / Dom |
| Ativa | Checkbox | — |
| Notas | Text | — |

---

### 🛠️ Manutenção da Casa

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Item | Title | Ex: "Filtro do ar-cond.", "IPVA" |
| Categoria | Select | Elétrica / Hidráulica / Veículo / Limpeza / Outros |
| Frequência | Select | Mensal / Bimestral / Trimestral / Semestral / Anual |
| Último feito | Date | — |
| Próximo em | Formula | `dateAdd(Último feito, N, "months")` |
| Designado | Relation → Pessoas | Rodízio manual ou fórmula |
| Status | Select | Em dia / Atenção / Atrasado |
| Custo estimado (R$) | Number | — |
| Notas | Text | — |

---

### 🛒 Lista de Compras

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Item | Title | — |
| Categoria | Select | Hortifruti / Laticínios / Carnes / Limpeza / Higiene / Outros |
| Quantidade | Number | — |
| Unidade | Select | un / kg / L / cx / pct |
| Mercado preferido | Relation → Mercados/Idas | Opcional |
| Adicionado por | Relation → Pessoas | — |
| Comprado | Checkbox | — |
| Recorrente | Checkbox | Item fixo toda semana |
| Prioridade | Select | Urgente / Normal / Se encontrar |

**Views sugeridas:** Table "Não comprados" agrupada por Categoria, Table "Para o mercado X".

---

### 🏪 Mercados / Idas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Nome | Title | Ex: "Mercado do bairro", "Feira livre" |
| Tipo | Select | Supermercado / Feira / Atacado / Online |
| Data planejada | Date | — |
| Responsável | Relation → Pessoas | — |
| Status | Select | Planejada / Concluída / Cancelada |
| Itens | Relation → Lista de Compras | Associar os itens desta ida |
| Gasto total (R$) | Number | Preenchido após a ida |
| Notas | Text | — |

---

### 🍽️ Cardápio

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Refeição | Title | Ex: "Almoço — Seg 26/05" |
| Tipo | Select | Café / Almoço / Jantar / Lanche |
| Data | Date | — |
| Receita | Relation → Receitas | Opcional |
| Responsável preparo | Relation → Pessoas | — |
| Feito | Checkbox | — |
| Notas | Text | Substituições, adaptações |

**Views sugeridas:** Calendar (por dia, agrupado por Tipo), Table "Esta semana", Table "Não feito".

---

### 📖 Receitas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Nome | Title | — |
| Categoria | Select | Massa / Carne / Peixe / Vegano / Sobremesa / Outros |
| Tempo preparo | Number | Em minutos |
| Rendimento | Text | Ex: "4 porções" |
| Ingredientes | Text | Lista (um por linha) |
| Modo de preparo | Text | Passos numerados |
| Link / fonte | URL | Opcional (site, YouTube) |
| Favorita | Checkbox | — |
| Fotos | Files & Media | — |
| Aparece no cardápio | Relation → Cardápio | — |

---

### 🏋️ Exercícios

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Atividade | Title | Ex: "Musculação", "Caminhada", "Pilates" |
| Responsável | Relation → Pessoas | — |
| Tipo | Select | Musculação / Cardio / Flexibilidade / Esporte |
| Data | Date | — |
| Duração (min) | Number | — |
| Distância (km) | Number | Para corrida/caminhada |
| Concluído | Checkbox | — |
| Intensidade | Select | Leve / Moderada / Intensa |
| Notas | Text | Séries, cargas, observações |

**Views sugeridas:** Calendar por mês, Table "Esta semana", Table agrupada por Responsável.

---

### 💳 Finanças — Contas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Nome | Title | Ex: "Nubank Luis", "C6 Eluma" |
| Tipo | Select | Conta corrente / Poupança / Cartão crédito / Carteira / Investimento |
| Titular | Relation → Pessoas | — |
| Banco / instituição | Text | — |
| Últimos 4 dígitos | Text | — |
| Ativa | Checkbox | — |
| Notas | Text | Vencimento cartão, etc. |

---

### 💸 Finanças — Transações

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Descrição | Title | — |
| Valor (R$) | Number | Sempre positivo |
| Tipo | Select | Entrada / Saída |
| Categoria | Select | Mercado / Moradia / Saúde / Lazer / Transporte / Outros |
| Data | Date | — |
| Conta | Relation → Contas | — |
| Responsável | Relation → Pessoas | — |
| Visibilidade | Select | Família / Pessoal |
| Parcelado | Checkbox | — |
| Parcela | Text | Ex: "3/12" |
| Comprovante | Files & Media | Foto do recibo |
| Status | Select | Confirmado / Previsto |

**Views sugeridas:** Table "Este mês" agrupada por Categoria, Table "Previstos" (para confirmação), Gallery com comprovantes.

---

### 🎯 Finanças — Orçamento

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Categoria | Title | Ex: "Mercado", "Lazer" |
| Teto mensal (R$) | Number | Definido com a Eluma |
| Mês/Ano | Text | Ex: "2026-05" |
| Gasto até agora | Rollup | Sum de Transações deste mês nesta categoria |
| Saldo restante | Formula | `Teto - Gasto` |
| Status | Formula | Se Saldo < 0 → "Estourado"; < 20% → "Atenção"; else "OK" |

---

### 🌱 Finanças — Metas

| Propriedade | Tipo | Valores / Notas |
| --- | --- | --- |
| Nome | Title | Ex: "Reserva de emergência", "Viagem" |
| Valor alvo (R$) | Number | — |
| Valor atual (R$) | Number | Atualizado manualmente ou via aporte |
| Prazo | Date | — |
| Progresso (%) | Formula | `(Atual / Alvo) * 100` |
| Status | Select | Ativa / Pausada / Concluída |
| Notas | Text | — |

---

## 🤖 Camada de agentes (Bandit & Chilli)

### Configuração no gateway OpenClaw

- MCPs habilitados: **Notion**, **Google Calendar**, **Gmail**, **Google Drive**.
- **System prompts diferenciados**: Bandit conhece preferências do Luis; Chilli, da Eluma.
- **Memória pessoal por agente**; dados de família ficam no Notion.
- **Permissões cruzadas controladas** — Bandit pode consultar agenda família da Eluma, mas não tarefas pessoais dela. Vice-versa.

### Capacidades reativas (sob comando)

| Comando | Ação |
| --- | --- |
| "adiciona iogurte na lista de domingo" | Cria item em Lista de Compras vinculado ao Mercado correspondente |
| "o que tem pro jantar hoje?" | Lê Cardápio e responde com receita + link |
| "reagenda o dentista pra quinta às 10h" | Atualiza Evento; 2sync propaga ao Google |
| "como tá o orçamento de mercado?" | Soma transações, compara teto, responde % |
| "adiciona ao backlog ligar pra companhia de gás" | Cria Tarefa pessoal sem data, área Casa |
| "caminhada feita, 35 minutos" | Registra Sessão no plano de Exercício de hoje |

### Capacidades proativas (auto-iniciadas)

| Quando | O que faz |
| --- | --- |
| Briefing matinal 7h | Compromissos + tarefas + cardápio + tempo |
| 1h antes de compromisso | Confirma presença, consulta tráfego |
| Domingo à noite | Resumo da semana + sugestão de cardápio + planejamento |
| Antes da ida ao mercado | Envia lista filtrada; cria nota Google Keep |
| Dia 1 do mês | Fechamento financeiro: gastos × orçamento |
| Manutenção atrasada | Lembra o designado da rodada |
| Recibo recebido por e-mail | Cria Transação prevista para confirmação |

---

## 🗓️ Plano de implementação (8–10 semanas em ritmo leve)

### ☑️ Fase 0 — Fundação (3–5 dias)

**Objetivo:** esqueleto técnico e base de dados inicial.

- [x]  Workspace Notion compartilhado entre as duas contas Google
- [x]  Team Space "Família" + Personal Spaces individuais
- [x]  Criar página-mãe "🏡 Sistema de Organização Familiar" no Team Space com estrutura de navegação
- [x]  Criar database `👥 Pessoas` com propriedades da especificação (Nome, E-mail, Telegram ID, Papel, Avatar); cadastrar Luis e Eluma
- [x]  Habilitar Notion API e gerar Internal Integration Token
- [x]  Criar calendário "Família" no Google Calendar; compartilhar com Eluma
- [ ]  Conectar Notion MCP e Google Calendar MCP ao OpenClaw
- [ ]  **Validação:** Bandit responde "quem somos nós?" lendo a database Pessoas

### 📅 Fase 1 — Agenda + Tarefas (1–2 semanas)

**Objetivo:** substituir compromissos e tarefas avulsas por um sistema único.

- [ ]  Criar database `📅 Eventos` com propriedades da especificação (Título, Data/Hora, Recorrência, Responsável, Visibilidade, Local, Google Event ID, Status, Notas)
- [ ]  Criar database `✅ Tarefas` com propriedades da especificação (Título, Status, Responsável, Visibilidade, Prazo, Área, Prioridade, Notas)
- [ ]  Views: Calendar, Timeline, Board por Responsável, Table (Hoje/Semana/Atrasadas)
- [ ]  Configurar 2sync (Eventos família ↔ Google Calendar família)
- [ ]  Migrar compromissos das próximas 4 semanas
- [ ]  Treinar Bandit/Chilli para comandos básicos (criar/listar/concluir)
- [ ]  Ativar briefing matinal 7h opt-in
- [ ]  **Validação:** 3 dias consecutivos com tudo registrado no sistema

### 🏠 Fase 2 — Casa: Rotinas + Manutenção + Compras (2 semanas)

**Objetivo:** organizar a operação diária e idas ao mercado.

- [ ]  Criar database `🔁 Rotinas` (Nome, Responsável, Horário, Frequência, Dias da semana, Ativa)
- [ ]  Criar database `🛠️ Manutenção da Casa` com fórmula "Próximo em" calculada a partir de "Último feito"
- [ ]  Criar database `🛒 Lista de Compras` (Item, Categoria, Quantidade, Unidade, Comprado, Recorrente, Prioridade)
- [ ]  Criar database `🏪 Mercados / Idas` com relação para Lista de Compras
- [ ]  Listar rotinas atuais com a Eluma e cadastrar
- [ ]  Mapear todos os itens de manutenção (filtros, ar-cond., lâmpadas, IPVA…) com frequência
- [ ]  Criar view "compra padrão da semana" (itens Recorrentes = ✓, filtro Comprado = ☐)
- [ ]  Configurar views filtradas: "Não comprados" agrupada por Categoria, "Para o mercado X"
- [ ]  Automação: Bandit/Chilli envia lista filtrada antes da ida
- [ ]  **Validação:** próxima ida ao mercado usa a lista do sistema

### 🍳 Fase 3 — Refeições + Exercícios (2 semanas)

**Objetivo:** consistência alimentar e rotina de exercício.

- [ ]  Criar database `📖 Receitas` (Nome, Categoria, Tempo preparo, Rendimento, Ingredientes, Modo de preparo, Link, Favorita, Fotos)
- [ ]  Criar database `🍽️ Cardápio` com relação para Receitas (Refeição, Tipo, Data, Receita, Responsável preparo, Feito)
- [ ]  Criar views: Calendar do Cardápio, Table "Esta semana", Table "Não feito"
- [ ]  Cadastrar 15–20 receitas "de casa" (Notion Web Clipper ou digitação direta)
- [ ]  Montar cardápio semanal piloto com responsável pelo preparo
- [ ]  Pedir ao Gemini sugestões de cardápio a partir do repertório cadastrado
- [ ]  Criar database `🏋️ Exercícios` (Atividade, Responsável, Tipo, Data, Duração, Concluído, Intensidade, Notas)
- [ ]  Sessões → criar eventos correspondentes no Google Calendar (notificação no smartwatch)
- [ ]  **Validação:** 1 semana com cardápio cumprido + exercícios registrados

### 💰 Fase 4 — Finanças (2–3 semanas)

**Objetivo:** visibilidade clara dos gastos e orçamento.

- [ ]  Criar database `💳 Finanças — Contas`; cadastrar todos os cartões e contas ativas
- [ ]  Criar database `💸 Finanças — Transações` com propriedades completas da especificação
- [ ]  Criar database `🎯 Finanças — Orçamento` com fórmulas de Rollup (Gasto até agora) e Status calculado
- [ ]  Criar database `🌱 Finanças — Metas` com fórmula de Progresso (%)
- [ ]  Definir taxonomia de categorias com a Eluma e cadastrar nas Transações / Orçamento
- [ ]  Importar histórico de 1–3 meses (extratos CSV → preenchimento manual ou script)
- [ ]  Definir tetos mensais com a Eluma e cadastrar no Orçamento
- [ ]  Configurar rito mensal (dia 1): relatório por Bandit/Chilli
- [ ]  Conectar Gmail MCP ao OpenClaw → recibos viram Transações previstas
- [ ]  Cadastrar metas de poupança ativas
- [ ]  **Validação:** "para onde foi nosso dinheiro?" em menos de 5 minutos

### ✨ Fase 5 — Polimento (1–2 semanas)

**Objetivo:** capturar ganhos finais de produtividade.

- [ ]  Refinar system prompts de Bandit/Chilli com base no uso real
- [ ]  Atalhos no Telegram (botões inline) para ações frequentes
- [ ]  Backup mensal automático do Notion para Google Drive
- [ ]  Views executivas: "Visão da Semana" e "Visão do Mês"
- [ ]  Runbook simples (2sync caiu? como reinicializar um MCP?)
- [ ]  Retrospectiva geral

---

## ⚠️ Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| Eluma rejeita complexidade do Notion | Views simples + Chilli como interface primária dela |
| 2sync com bug em recorrência | Criar recorrentes no GCal e referenciar no Notion |
| Sobrecarga de notificações | Briefings opt-in; revisar semanalmente |
| OpenClaw fora do ar | Sistema funciona via UIs do Notion/Google diretamente |
| Atrito ao registrar transações | Captura passiva via Gmail MCP |
| Abandono após Fase 2 | Pausa entre fases é aceitável; manter vivo > avançar |

---

## 🚀 Checklist da próxima semana

- [ ]  Combinar com a Eluma uma janela de 1h para alinhar visão + tutorial básico de Notion
- [ ]  Criar workspace Notion compartilhado e Team Space "Família"
- [ ]  Criar página-mãe "🏡 Sistema de Organização Familiar" com estrutura de navegação e mapa das databases
- [ ]  Criar database `👥 Pessoas` com todos os campos e cadastrar Luis e Eluma
- [ ]  Criar calendário "Família" no Google Calendar e compartilhar
- [ ]  Habilitar Notion API; gerar token; conectar ao OpenClaw
- [ ]  Configurar conta 2sync (trial gratuito 14 dias) e primeira sync de teste
- [ ]  Pedir ao Bandit que liste eventos de família dos próximos 7 dias

---

## 🔐 Segurança & privacidade

- **Menor permissão:** cada MCP no OpenClaw acessa apenas as databases necessárias
- **Backup mensal:** Markdown + JSON para Google Drive (recuperação independente)
- **Sem credenciais financeiras na memória dos agentes**
- **2FA obrigatório** em Google e Notion; recovery codes guardados fora do sistema
- **Auditoria trimestral:** revisar acessos e desativar integrações ociosas

---

## 📚 Subpáginas a criar

> Criar as seguintes subpáginas diretamente no Team Space "Família" (cada uma vira um database, seguindo a especificação acima):
> 
- 👥 **Pessoas**
- 📅 **Eventos**
- ✅ **Tarefas**
- 🔁 **Rotinas**
- 🛠️ **Manutenção da Casa**
- 🛒 **Lista de Compras**
- 🏪 **Mercados / Idas**
- 🍽️ **Cardápio**
- 📖 **Receitas**
- 🏋️ **Exercícios**
- 💳 **Finanças — Contas**
- 💸 **Finanças — Transações**
- 🎯 **Finanças — Orçamento**
- 🌱 **Finanças — Metas**

---

*Página atualizada em 22 de maio de 2026 — Versão 1.1 (estrutura própria, sem templates pagos)*

[👥 Pessoas](https://www.notion.so/107bd58f11e34ed5b41f6445b63a4da2?pvs=21)