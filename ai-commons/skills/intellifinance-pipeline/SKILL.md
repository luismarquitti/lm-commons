---
name: intellifinance-pipeline
description: |
  Specialized skill for Luís Eduardo Marquitti's IntelliFinance project. ALWAYS use when the user wants to:
  - Normalize bank statements, invoices, or pay stubs into CSV (PDF, XLSX, CSV, OFX from any bank)
  - Process financial files from Itaú, Mercado Pago, Wipro, or others and convert them to the canonical schema
  - Maintain/update the centralized transaction registry in Finance/Normalizado/
  - Create or update the HTML dashboard in Finance/Dashboards/
  - Analyze expenses by category, by month, or by account holder
  - Categorize transactions, correct classifications, add new category rules
  - Any questions about the family's financial data (Luis, Eluma)
  Trigger even if the user mentions only "statement", "invoice", "normalize", "financial dashboard", "expense categories", "how much I spent", "financial pipeline" or English/Portuguese variants.
---

# IntelliFinance Pipeline

You are working on the personal financial management project of Luís Eduardo Marquitti (luismarquitti@gmail.com). All files are located in `C:\devWorkspace\intellifinance\data-sources\Google_Drive_Files\Finance\`.

Equivalent bash paths:
- Finance/ → `/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/`
- Normalizado/ → `/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/Normalizado/`

## Directory Structure

```
Finance/
├── Extratos/          → Bank statement PDFs (Itaú current account)
├── Faturas/           → Credit card invoice PDFs and CSVs
├── Holerites/         → Wipro pay stub PDFs
├── Normalizado/       → Canonical CSVs (pipeline output) — SOURCE OF TRUTH
├── Dashboards/
│   └── index.html     → interactive dashboard (Chart.js + PapaParse)
└── scripts/
    └── normalize_extrato.py   → Itaú statement normalizer (already functional)
```

## Canonical CSV Schema (12 fields)

| Field | Type | Description |
|-------|------|-------------|
| `data` | YYYY-MM-DD | Transaction date (ISO 8601) |
| `descricao` | string | Original transaction description |
| `valor` | float | Absolute value (no sign) |
| `tipo` | `receita` \| `despesa` | Flow direction (`receita` for income, `despesa` for expense) |
| `categoria` | string | See categories below |
| `conta` | `corrente` \| `poupança` \| `credito` | Account type |
| `banco` | `itau` \| `mercadopago` \| `nubank` \| `wipro` | Bank/source |
| `titular` | `luis` \| `eluma` \| `familiar` | Account owner |
| `periodo_ref` | YYYY-MM | Reference month of the transaction |
| `recorrente` | `true` \| `false` | Is it a recurring transaction? |
| `parcela` | `N/M` or empty | Installment (e.g. `2/6`) |
| `arquivo_origem` | string | Source PDF/CSV file name |

**Sign rule:** `tipo` defines direction. `valor` is always positive. Positive in PDF → `receita`; negative → `despesa`.

## Recognized Categories

```
Salário        Rendimentos    Reembolso      Moradia
Educação       Impostos       Transporte     Saúde
Alimentação    Lazer          Vestuário      Animais
Serviços       Financeiro     Seguros        Saque
Transferência  Outros
```

## Workflow by Source Type

### 1. Itaú PDF Statement (folder `Extratos/`)

**Script already exists and works:** `Finance/scripts/normalize_extrato.py`

Run via bash (session paths):
```bash
python3 "/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/scripts/normalize_extrato.py" \
  "/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/Extratos/<file>.pdf" \
  "<holder>" "itau"
```

The script uses `pdfplumber` (pip install pdfplumber), applies the regex `DD/MM/YYYY DESCRIPTION VALUE`, classifies by keywords, and saves into `Finance/Normalizado/`.

**Important Itaú Abbreviations:**
- `PAY XXXX` → payment via app (merchant in first 5 chars after PAY)
- `RSCCS` / `RSCSS XXXX` → debit card purchase
- `DA XXXX-SP` → automatic debit (e.g. `DA VIVO-SP` = Vivo telecom)
- `PIX TRANSF` → person-to-person PIX transfer
- `PIX AUT` → automatic PIX (subscriptions)
- `PIX QRS` → QR code PIX at a merchant

**After running**, verify the "UNCLASSIFIED" report in stdout. For each new pattern:
1. Identify the merchant/service by context (value, frequency, abbreviated name)
2. Add to RULES in `normalize_extrato.py` under the correct category
3. Re-run — goal: "Outros" (Others) < 5% of total

See `references/categorization_rules.md` for the complete current RULES and extension guide.

### 2. Credit Card Invoice CSV (folder `Faturas/`)

Identify the layout by reading the first few lines:
```bash
head -5 "Finance/Faturas/<file>.csv"
```

**Known Layouts:**
- Itaú CSV: columns `Data,Lançamento,Valor` (negative value = expense)
- Mercado Pago: check header (varies by version)

Write inline normalizer (no separate script needed):
```python
import csv, re
from datetime import datetime
from pathlib import Path

def parse_brl(s):
    return float(s.replace('.','').replace(',','.'))

def fmt_date(s):
    # Adapt according to format found in CSV
    return datetime.strptime(s, '%d/%m/%Y').strftime('%Y-%m-%d')
```

Apply the same categorization scheme as the statement.

### 3. Wipro Pay Stub PDF (folder `Holerites/`)

- Name: `Recibo de Pagamento MM_YYYY [adiantamento|completo].pdf`
- Use `pdfplumber` to extract net value (look for "Valor Líquido" or "Total Líquido")
- One pay stub = ONE line in the canonical CSV:
  - `tipo=receita`, `categoria=Salário`, `banco=wipro`, `conta=corrente`, `titular=luis`

### 4. Legacy OFX (`Legado_Historico/`)

```bash
pip install ofxparse --break-system-packages
```
```python
from ofxparse import OfxParser
with open('file.ofx') as f:
    ofx = OfxParser.parse(f)
for tx in ofx.account.statement.transactions:
    # tx.date, tx.memo, tx.amount
```

## Centralized Registry

`Finance/Normalizado/` is the registry. Each processed file generates its own CSV. For cross-analyses, consolidate in memory:

```python
import csv
from pathlib import Path

rows = []
for f in Path('/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance/Normalizado').glob('*.csv'):
    with open(f) as fp:
        rows.extend(list(csv.DictReader(fp)))

# Deduplicate
seen = set()
deduped = []
for r in rows:
    key = (r['data'], r['descricao'], r['valor'], r['titular'])
    if key not in seen:
        seen.add(key)
        deduped.append(r)
```

**Rule:** never overwrite an existing CSV without confirming with the user.

## HTML Dashboard

**File:** `Finance/Dashboards/index.html` (already exists, functional)

The dashboard is a standalone HTML that:
- Attempts to `fetch('../Normalizado/<file>.csv')` automatically (works with HTTP server)
- Has a file picker to open CSV manually (works with `file://`)
- Uses Chart.js (category donut + monthly bars) and PapaParse
- Applies IntelliFinance design tokens

**To add a new CSV to auto-load**, edit the `candidates` list in the dashboard script:
```javascript
const candidates = [
  '../Normalizado/itau_luis_extrato_012026.csv',
  '../Normalizado/eluma_itau_extrato_012026.csv',  // ← add here
];
```

**To run with server:**
```bash
cd "/sessions/bold-modest-hopper/mnt/Google_Drive_Files/Finance"
python3 -m http.server 8000
# Opens: http://localhost:8000/Dashboards/
```

**To create a new dashboard** (when the user requests something different from the existing one): see `references/design_tokens.md` for CSS tokens and design system component standards of IntelliFinance/Notion.

## Data Analysis

When the user asks "how much I spent on X" or "compare months", workflow:
1. Load all CSVs from `Finance/Normalizado/`
2. Filter by period/category/holder
3. Aggregate and present in text + table

```python
from collections import defaultdict

# Aggregate expenses by category in the month
total = defaultdict(float)
for r in deduped:
    if r['tipo'] == 'despesa' and r['periodo_ref'] == '2026-03':
        total[r['categoria']] += float(r['valor'])

for cat, v in sorted(total.items(), key=lambda x: -x[1]):
    print(f"  {cat:20} R$ {v:10.2f}")
```

## File Naming Conventions

Outputs in `Finance/Normalizado/`:
- Statements: `<bank>_<holder>_extrato_<MMYYYY>.csv`
- Invoices: `fatura_<bank>_<holder>_<MMYYYY>.csv`
- Pay stubs: `holerite_wipro_<holder>_<MMYYYY>.csv`

## Holders and Family Context

- **luis** → Main Itaú Uniclass account, Wipro salary, Montessori School (~R$3,100/month)
- **eluma** → Own Itaú account, frequent transfers from Luis
- **familiar** → Shared expenses / condo fees / electricity / gas

PIX transfers between Luis and Eluma are internal flows — mark as `Transferência` but do not count as real expenses of the family unit.

## References

- `references/categorization_rules.md` — complete RULES (keywords by category) and how to extend
- `references/design_tokens.md` — IntelliFinance CSS tokens to build dashboards
