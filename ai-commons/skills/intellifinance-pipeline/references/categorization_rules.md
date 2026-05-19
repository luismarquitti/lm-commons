# Regras de Categorização — IntelliFinance

As RULES do `normalize_extrato.py` são uma lista ordenada de `(keywords, categoria)`.
A comparação é **case-insensitive** (`desc.upper()`). A ordem importa — mais específicas primeiro.

## RULES Atuais (estado: maio/2026)

```python
RULES = [
    # ── Salário ────────────────────────────────────────────
    (["PAGTO SALARIO", "REMUNERACAO SALARIO", "PAGAMENTO SALARIO"], "Salário"),

    # ── Rendimentos de aplicação automática ────────────────
    (["REND PAGO", "APLIC AUT MAIS", "RENDIMENTO CDB", "RESGATE CDB"], "Rendimentos"),

    # ── Reembolso / devolução PIX ──────────────────────────
    (["DEV PIX", "REEMBOLSO", "RESTITUICAO", "DEVOLUCAO"], "Reembolso"),

    # ── Moradia — contas fixas ─────────────────────────────
    (["COMGAS", "CPFL", "ELETROP", "LIGHT ", "ENEL ", "ENERGISA", "CEMIG",
      "SABESP", "SANEPAR", "EMBASA", "CONDOMINIO", "ALUGUEL", "IPTU"], "Moradia"),

    # ── Educação ───────────────────────────────────────────
    (["ESCOLA MONTESSORI", "MONTESSORI", "PAG BOLETO ESCOLA",
      "ESCOLA", "COLEGIO", "UNIVERSIDADE", "FACULDADE", "CURSO "], "Educação"),

    # ── Impostos e taxas ───────────────────────────────────
    (["DA PM ", "INT /PM", "PM CAMP", "PMCAMP", "PREFEIT",
      "DETRAN", "IPVA", "DPVAT", "IRPF", "DARF", "IOF"], "Impostos"),

    # ── Transporte — apps, pedágios, postos ────────────────
    (["UBER", "LYFT", "99 POP", "CABIFY"], "Transporte"),
    (["CONNECTCAR", "CONECTCAR", "SEMPARAR", "VELOE", "AUTOPASS", "PEDAGIO"], "Transporte"),
    (["PAY PETRO", "PETROBRAS", "POSTO ", "COMBUSTIVEL", "GASOLINA",
      "SHELL ", "IPIRANGA", "BR DIST"], "Transporte"),
    (["VIACAO", "PIX QRS VIACAO", "ONIBUS", "METRO ", "BRT "], "Transporte"),
    (["PAY ESTAC", "ESTACIONAMENTO", "PARKING", "ESTAC "], "Transporte"),

    # ── Saúde — farmácias, dentistas, clínicas, academia ──
    (["PAY RAIA", "RSCCS RAIA", "RSCSS RAIA",
      "PAY DROGA",
      "FARMACIA", "DROGARIA", "DROGASIL", "ULTRAFARMA", "PACHECO",
      "DENTAL", "DENTISTA", "ODONTO",
      "CLINICA", "MEDICO", "HOSPITAL", "LABORATORIO",
      "UNIMED", "AMIL", "HAPVIDA",
      "ACADEMIA", "SMART FIT", "GYMPASS", "BLUEFIT"], "Saúde"),
    (["RAIA"], "Saúde"),   # Raia sozinho (ex: RAIA2970)

    # ── Alimentação — supermercados, padarias, restaurantes ─
    (["PAY SAVEG", "PAY MINI ", "PAY MINIS", "PAY ASSAI", "PAY MARAV",
      "PAY PANIF", "PAY OXXO ", "PAY RESTO", "PAY RESTA", "PAY SORVE",
      "PAY BLOEM", "PAY MINUT", "PAY ALIM",
      "PAY PADAR", "PAY SORFR", "PAY RJCCO", "PAY MAXXI", "PAY BOOME",
      "PAY STUFA", "PAY ARMAZ", "PAY CANTI", "PAY LUIGI", "PAY BACIO",
      "PAY PEZAO", "PAY REI D", "PAY QUISQ", "PAY REST ", "PAY PIETR",
      "PAY COMER",
      "RSCCS SAVEGNAGO", "RSCSS ALMAZEN", "RSCCS ALMAZEN",
      "RSCSS PANIFICADORA", "RSCCS PANIFICADORA", "RSCSS SEBO", "RSCSS GRÃO",
      "RSCCS GRÃO"], "Alimentação"),
    (["IFOOD", "RAPPI", "DELIVERY",
      "ASSAI", "ATACADAO", "CARREFOUR", "EXTRA ", "PAO DE ACUCAR",
      "SAVEGNAGO", "SUPERMERCADO", "ALMAZEN", "HORTIFRUTI",
      "PADARIA", "PANIFICADORA", "CONFEITARIA",
      "RESTAURANTE", "LANCHONETE", "PIZZARIA", "SUSHI", "HAMBURGER",
      "MCDONALDS", "SUBWAY", "KFC", "SORVETE", "OXXO"], "Alimentação"),

    # ── Lazer — streaming, viagens, eventos ────────────────
    (["NETFLIX", "SPOTIFY", "DISNEY", "HBO ", "AMAZON PRIME", "APPLE TV",
      "TELECINE", "GLOBOPLAY", "DEEZER",
      "CINEMA", "TEATRO", "INGRESSO", "SYMPLA",
      "KIWIFY", "HOTMART", "EDUZZ",
      "HOTEL ", "POUSADA", "AIRBNB", "BOOKING", "SPA HOT",
      "PIX QRS CASAR"], "Lazer"),

    # ── Vestuário ──────────────────────────────────────────
    (["PAY LOJAS", "RSCSS SEBO E LOJA", "RSCCS SEBO",
      "PAY LOCCI", "PAY DAISO",
      "LOJAS ", "RENNER", "C&A ", "RIACHUELO", "MARISA", "ZARA ", "HERING",
      "CALCADO", "SAPATO", "TENIS "], "Vestuário"),

    # ── Animais ────────────────────────────────────────────
    (["PAY COBAS", "COBASI", "PETLOVE", "VETERINARIO", "PET SHOP"], "Animais"),

    # ── Serviços — telecom, prestadores, assinaturas ───────
    # DA prefix = Débito Automático (ex: DA VIVO-SP = Vivo telecom)
    # PAY CLARI = provavelmente Claro (abreviação)
    # PAY SAFAR, PAY MARCE, PAY CACHO etc = prestadores informais (diarista, etc.)
    (["PIX AUT CLARO", "CLARO ", "TIM  ", "VIVO ", "OI   ", "NEXTEL",
      "DA VIVO", "DA CLARO", "DA TIM", "DA OI",
      "PAY CLARI",
      "PAY SAFAR", "PAY MARCE", "PAY CACHO", "PAY GILCI",
      "PAY WELLI", "PAY UBIRA", "RSCSS JOCIVAN",
      "GOOGLE ", "APPLE ", "MICROSOFT", "ADOBE ", "DROPBOX",
      "HOME ASSISTANT", "RUPI "], "Serviços"),

    # ── Financeiro — fatura cartão, boletos ────────────────
    (["JUROS", "TARIFA ", "MULTA ", "MORA "], "Financeiro"),
    (["SEGURO LIS", "SEGURO ", "SEGUR "], "Seguros"),
    (["ITAU BLACK", "PAG TIT", "PAG BOLETO", "PAG FAT",
      "PAGTO CRED", "ITAU CARD", "FATURA ",
      "PAY MP P", "PAY MP B", "PAY MP "], "Financeiro"),

    # ── Saque ──────────────────────────────────────────────
    (["SAQUE", "ATM CART"], "Saque"),

    # ── Transferências PIX/TED genéricas — por último ──────
    # Colocar aqui para não engolir PIX específicos acima
    (["PIX TRANSF", "PIX QRS", "TED ", "DOC ", "TRANSF "], "Transferência"),
]
```

## Como Estender as RULES

### Padrão: novo comerciante `PAY XXXX`

O Itaú abrevia nomes de 5 caracteres após "PAY ". Para decodificar:
1. Olhar o valor e frequência (ex: PAY RJCCO com R$10-15, várias vezes/mês → provavelmente café/lanchonete)
2. Pesquisar o nome completo no Google Maps se necessário
3. Adicionar na categoria correta, **antes** da regra genérica da categoria

```python
# Exemplo: descobriu que PAY XYZAB = padaria local
# Adicionar na linha de Alimentação PAY patterns:
"PAY XYZAB",
```

### Padrão: `RSCSS NOME` ou `RSCCS NOME`

Mesma lógica. RSCSS/RSCCS = débito no cartão.
```python
"RSCSS NOME DO ESTABELECIMENTO",
```

### Padrão: `DA BANCO-UF` (débito automático)

```python
"DA VIVO",   # já presente
"DA CPFL",   # ex: energia CPFL via débito automático
```

### Dica: SKIP_WORDS

Linhas que contêm essas strings são ignoradas (não são transações):
```python
SKIP_WORDS = {"SALDO DO DIA", "SALDO ANTERIOR", "SALDO FINAL",
              "data lancamentos", "extrato conta", "periodo de",
              "emitido em", "saldo em conta", "limite da conta"}
```

## Palavras-chave de Recorrência

Transações com esses termos são marcadas como `recorrente=true`:
```python
RECORRENTE_KW = [
    "NETFLIX", "SPOTIFY", "DISNEY", "AMAZON PRIME", "HBO", "DEEZER",
    "GLOBOPLAY", "TELECINE", "APPLE", "GOOGLE ONE", "MICROSOFT",
    "CLARO", "TIM ", "VIVO", "OI ", "HOME ASSISTANT", "DROPBOX",
    "SEGURO", "CONDOMINIO", "ALUGUEL", "PIX AUT",
]
```
