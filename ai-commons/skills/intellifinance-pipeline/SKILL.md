---
name: intellifinance-pipeline
description: |
  Skill especializada no projeto IntelliFinance de Luís Eduardo Marquitti. Use SEMPRE que o usuário quiser:
  - Normalizar extratos, faturas ou holerites para CSV (PDF, XLSX, CSV, OFX de qualquer banco)
  - Processar arquivos financeiros do Itaú, Mercado Pago, Wipro ou outros e converter ao schema canônico
  - Manter/atualizar o registro centralizado de transações em Finance/Normalizado/
  - Criar ou atualizar o dashboard HTML em Finance/Dashboards/
  - Analisar gastos por categoria, por mês ou por titular
  - Categorizar transações, corrigir classificações, adicionar novas regras de categoria
  - Qualquer pergunta sobre os dados financeiros da família (Luis, Eluma)
  Dispare mesmo que o usuário mencione apenas "extrato", "fatura", "normalizar", "dashboard financeiro", "categorias de gasto", "quanto gastei", "pipeline financeiro" ou variantes em português.
---

# IntelliFinance Pipeline

Você está trabalhando no projeto de gestão financeira pessoal de Luís Eduardo Marquitti (luismarquitti@gmail.com). Todos os arquivos ficam em `C:\devWorkspace\intellifinance\data-sources\Google_Drive_Files\Finance\`.

Caminhos bash equivalentes:
- Finance/ → `/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/`
- Normalizado/ → `/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/Normalizado/`

## Estrutura de diretórios

```
Finance/
├── Extratos/          → PDFs de extratos bancários (Itaú conta corrente)
├── Faturas/           → PDFs e CSVs de faturas de cartão
├── Holerites/         → PDFs de holerites Wipro
├── Normalizado/       → CSVs canônicos (saída do pipeline) — SOURCE OF TRUTH
├── Dashboards/
│   └── index.html     → dashboard interativo (Chart.js + PapaParse)
└── scripts/
    └── normalize_extrato.py   → normalizador de extratos Itaú (já funcional)
```

## Schema Canônico CSV (12 campos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `data` | YYYY-MM-DD | Data da transação (ISO 8601) |
| `descricao` | string | Descrição original do lançamento |
| `valor` | float | Valor absoluto (sem sinal) |
| `tipo` | `receita` \| `despesa` | Direção do fluxo |
| `categoria` | string | Ver categorias abaixo |
| `conta` | `corrente` \| `poupança` \| `credito` | Tipo de conta |
| `banco` | `itau` \| `mercadopago` \| `nubank` \| `wipro` | Banco/fonte |
| `titular` | `luis` \| `eluma` \| `familiar` | Dono da conta |
| `periodo_ref` | YYYY-MM | Mês de referência da transação |
| `recorrente` | `true` \| `false` | É lançamento recorrente? |
| `parcela` | `N/M` ou vazio | Parcela (ex: `2/6`) |
| `arquivo_origem` | string | Nome do arquivo PDF/CSV de origem |

**Regra de sinal:** `tipo` define direção. `valor` é sempre positivo. Positivo no PDF → `receita`; negativo → `despesa`.

## Categorias Reconhecidas

```
Salário        Rendimentos    Reembolso      Moradia
Educação       Impostos       Transporte     Saúde
Alimentação    Lazer          Vestuário      Animais
Serviços       Financeiro     Seguros        Saque
Transferência  Outros
```

## Workflow por Tipo de Fonte

### 1. Extrato Itaú PDF (pasta `Extratos/`)

**Script já existe e funciona:** `Finance/scripts/normalize_extrato.py`

Rodar via bash (caminhos de sessão):
```bash
python3 "/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/scripts/normalize_extrato.py" \
  "/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/Extratos/<arquivo>.pdf" \
  "<titular>" "itau"
```

O script usa `pdfplumber` (pip install pdfplumber), aplica regex `DD/MM/YYYY DESCRIÇÃO VALOR`, classifica por palavras-chave e salva em `Finance/Normalizado/`.

**Abreviações Itaú importantes:**
- `PAY XXXX` → pagamento via app (comerciante nos primeiros 5 chars após PAY)
- `RSCCS` / `RSCSS XXXX` → compra débito no cartão
- `DA XXXX-SP` → débito automático (ex: `DA VIVO-SP` = Vivo telecom)
- `PIX TRANSF` → transferência PIX pessoa a pessoa
- `PIX AUT` → PIX automático (assinaturas)
- `PIX QRS` → QR code PIX em estabelecimento

**Após rodar**, verificar o relatório "NÃO CLASSIFICADOS" no stdout. Para cada padrão novo:
1. Identificar o comerciante/serviço pelo contexto (valor, frequência, nome abreviado)
2. Adicionar às RULES em `normalize_extrato.py` na categoria correta
3. Re-rodar — objetivo: "Outros" < 5% do total

Veja `references/categorization_rules.md` para as RULES completas atuais e guia de extensão.

### 2. Fatura Cartão CSV (pasta `Faturas/`)

Identificar o layout lendo as primeiras linhas:
```bash
head -5 "Finance/Faturas/<arquivo>.csv"
```

**Layouts conhecidos:**
- Itaú CSV: colunas `Data,Lançamento,Valor` (valor negativo = despesa)
- Mercado Pago: verificar cabeçalho (varia por versão)

Escrever normalizador inline (não precisa de script separado):
```python
import csv, re
from datetime import datetime
from pathlib import Path

def parse_brl(s):
    return float(s.replace('.','').replace(',','.'))

def fmt_date(s):
    # Adaptar conforme formato encontrado no CSV
    return datetime.strptime(s, '%d/%m/%Y').strftime('%Y-%m-%d')
```

Aplicar o mesmo esquema de categorização do extrato.

### 3. Holerite Wipro PDF (pasta `Holerites/`)

- Nome: `Recibo de Pagamento MM_YYYY [adiantamento|completo].pdf`
- Usar `pdfplumber` para extrair o valor líquido (procurar "Valor Líquido" ou "Total Líquido")
- Um holerite = UMA linha no CSV canônico:
  - `tipo=receita`, `categoria=Salário`, `banco=wipro`, `conta=corrente`, `titular=luis`

### 4. OFX Legados (`Legado_Historico/`)

```bash
pip install ofxparse --break-system-packages
```
```python
from ofxparse import OfxParser
with open('arquivo.ofx') as f:
    ofx = OfxParser.parse(f)
for tx in ofx.account.statement.transactions:
    # tx.date, tx.memo, tx.amount
```

## Registro Centralizado

`Finance/Normalizado/` é o registro. Cada arquivo processado gera seu próprio CSV. Para análises cruzadas, consolidar em memória:

```python
import csv
from pathlib import Path

rows = []
for f in Path('/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/Normalizado').glob('*.csv'):
    with open(f) as fp:
        rows.extend(list(csv.DictReader(fp)))

# Deduplicar
seen = set()
deduped = []
for r in rows:
    key = (r['data'], r['descricao'], r['valor'], r['titular'])
    if key not in seen:
        seen.add(key)
        deduped.append(r)
```

**Regra:** nunca sobrescreva um CSV existente sem confirmar com o usuário.

## Dashboard HTML

**Arquivo:** `Finance/Dashboards/index.html` (já existe, funcional)

O dashboard é um HTML standalone que:
- Tenta `fetch('../Normalizado/<arquivo>.csv')` automaticamente (funciona com servidor HTTP)
- Tem file picker para abrir CSV manualmente (funciona com `file://`)
- Usa Chart.js (donut de categorias + barras mensais) e PapaParse
- Aplica os tokens de design IntelliFinance

**Para adicionar novo CSV ao auto-load**, editar a lista `candidates` no script do dashboard:
```javascript
const candidates = [
  '../Normalizado/itau_luis_extrato_012026.csv',
  '../Normalizado/eluma_itau_extrato_012026.csv',  // ← adicionar aqui
];
```

**Para rodar com servidor:**
```bash
cd "/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance"
python3 -m http.server 8000
# Abre: http://localhost:8000/Dashboards/
```

**Para criar um dashboard novo** (quando o usuário pedir algo diferente do existente): ver `references/design_tokens.md` para os tokens CSS e padrões de componentes do design system IntelliFinance/Notion.

## Análise de Dados

Quando o usuário perguntar "quanto gastei em X" ou "compare meses", fluxo:
1. Carregar todos os CSVs de `Finance/Normalizado/`
2. Filtrar por período/categoria/titular
3. Agregar e apresentar em texto + tabela

```python
from collections import defaultdict

# Agregar despesas por categoria no mês
total = defaultdict(float)
for r in deduped:
    if r['tipo'] == 'despesa' and r['periodo_ref'] == '2026-03':
        total[r['categoria']] += float(r['valor'])

for cat, v in sorted(total.items(), key=lambda x: -x[1]):
    print(f"  {cat:20} R$ {v:10.2f}")
```

## Convenções de Nome de Arquivo

Saídas em `Finance/Normalizado/`:
- Extratos: `<banco>_<titular>_extrato_<MMYYYY>.csv`
- Faturas: `fatura_<banco>_<titular>_<MMYYYY>.csv`
- Holerites: `holerite_wipro_<titular>_<MMYYYY>.csv`

## Titulares e Contexto Familiar

- **luis** → Conta Itaú Uniclass principal, salário Wipro, Escola Montessori (~R$3.100/mês)
- **eluma** → Conta Itaú própria, transferências de Luis frequentes
- **familiar** → Despesas compartilhadas / condomínio / luz / gás

Transferências PIX entre Luis e Eluma são fluxos internos — anotar como `Transferência` mas não contabilizar como despesa real do núcleo familiar.

## Referências

- `references/categorization_rules.md` — RULES completo (palavras-chave por categoria) e como estender
- `references/design_tokens.md` — tokens CSS IntelliFinance para construir dashboards
