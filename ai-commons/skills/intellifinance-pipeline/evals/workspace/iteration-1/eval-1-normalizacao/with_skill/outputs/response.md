# Normalização: itau_luis_extrato_012026.pdf

## Processamento

O arquivo `Finance/Extratos/itau_luis_extrato_012026.pdf` foi processado com sucesso usando o script `normalize_extrato.py`. O CSV canônico foi salvo em:

```
Finance/Normalizado/itau_luis_extrato_012026.csv
```

---

## Resumo Geral

| Métrica | Valor |
|---|---|
| Lançamentos extraídos | 321 |
| Receitas | 40 |
| Despesas | 281 |
| Total receitas | R$ 58.604,49 |
| Total despesas | R$ 75.906,07 |
| Saldo líquido | R$ -17.301,58 |
| Meses cobertos | 2026-01, 2026-02, 2026-03, 2026-04, 2026-05 |

---

## Transações sem Categoria (Outros)

**12 transações** ficaram sem categoria (3,7% do total — abaixo da meta de 5%).

| Data | Descrição | Tipo | Valor |
|---|---|---|---|
| 2026-05-14 | PAY A E 14/05 | despesa | R$ 6,50 |
| 2026-04-13 | PAY M PUR 11/04 | despesa | R$ 54,20 |
| 2026-04-13 | PAY PILHA 13/04 | despesa | R$ 57,00 |
| 2026-04-06 | PAY -MCBAIOS -05/04 | despesa | R$ 56,00 |
| 2026-02-02 | PAY CASA 31/01 | despesa | R$ 49,99 |
| 2026-02-02 | PAY HS PA 31/01 | despesa | R$ 79,99 |
| 2026-01-27 | PAY N R G 27/01 | despesa | R$ 15,00 |
| 2026-01-21 | PAY STELL 21/01 | despesa | R$ 28,70 |
| 2026-01-21 | PAY INK T 21/01 | despesa | R$ 4,00 |
| 2026-01-12 | PAY GO CO 11/01 | despesa | R$ 24,00 |
| 2026-01-05 | PAY TOP F 04/01 | despesa | R$ 80,00 |
| 2026-01-05 | PAY NAUAK 05/01 | despesa | R$ 6,00 |

---

## 5 Maiores Despesas do Período

| # | Data | Descrição | Categoria | Valor |
|---|---|---|---|---|
| 1 | 2026-05-11 | PIX TRANSF LUIS PA11/05 | Transferência | R$ 3.660,00 |
| 2 | 2026-04-14 | PIX TRANSF LUIS PA14/04 | Transferência | R$ 3.660,00 |
| 3 | 2026-02-05 | PIX TRANSF LUIS PA05/02 | Transferência | R$ 3.660,00 |
| 4 | 2026-01-02 | PIX TRANSF LUIS PA02/01 | Transferência | R$ 3.660,00 |
| 5 | 2026-01-05 | PAG TIT INT 188197506000 | Financeiro | R$ 3.455,00 |

> **Nota:** As 4 maiores despesas são transferências PIX recorrentes para "LUIS PA" (provavelmente repasse mensal para Eluma ou conta própria — fluxo interno familiar). O 5o maior lançamento é um pagamento de título/boleto de R$ 3.455,00.

---

## Distribuição por Categoria

| Categoria | Qtd |
|---|---|
| Alimentação | 122 |
| Transferência | 58 |
| Serviços | 25 |
| Financeiro | 25 |
| Moradia | 14 |
| Impostos | 12 |
| **Outros** | **12** |
| Salário | 10 |
| Saúde | 7 |
| Saque | 7 |
| Rendimentos | 6 |
| Vestuário | 5 |
| Lazer | 4 |
| Seguros | 4 |
| Educação | 3 |
| Transporte | 3 |
| Reembolso | 2 |
| Animais | 2 |
