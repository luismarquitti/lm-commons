# Design Tokens — IntelliFinance Dashboard

Tokens CSS do design system "Quiet Finance" para uso em dashboards e relatórios HTML.
Aplicar DESIGN.md (Notion-inspired): botões retangulares 8px, cards 12px, Inter font.

## Variáveis CSS (colar no `<style>` de qualquer HTML)

```css
:root {
  /* Superfícies */
  --if-bg:             #f9f8f6;        /* fundo da página (off-white quente) */
  --if-surface:        #ffffff;        /* cards, drawers */
  --if-surface-sunken: #f3f1ee;        /* cabeçalhos de tabela, input fills */
  --if-surface-strong: #eceae6;        /* hover em sunken */

  /* Bordas */
  --if-line:           #e8e5e0;        /* hairlines 1px */
  --if-line-strong:    #d4d0c8;        /* bordas de input, divisores */

  /* Texto */
  --if-ink:            #1c1f2e;        /* texto principal */
  --if-ink-2:          #5a5f78;        /* secundário */
  --if-ink-3:          #9298b0;        /* terciário, placeholders */
  --if-ink-inv:        #ffffff;        /* sobre fundos escuros/brand */

  /* Marca (indigo-ink) */
  --if-brand:          #2d3d75;
  --if-brand-hover:    #253168;
  --if-brand-pressed:  #1d265a;
  --if-brand-tint:     #eef0f9;        /* chips, ghosts */
  --if-brand-tint-2:   #dde1f4;        /* emphasis blocks */

  /* Semântico financeiro */
  --if-income:         #2e7d52;        /* receita (verde floresta) */
  --if-income-tint:    #e8f5ee;
  --if-expense:        #b84832;        /* despesa (terracota) */
  --if-expense-tint:   #fceee9;
  --if-warning:        #b07a10;
  --if-warning-tint:   #fef6e4;

  /* Categorias — par (bg, fg) para chips */
  --if-cat-salary-bg:    #e8f5ee;  --if-cat-salary-fg:    #2e7d52;
  --if-cat-food-bg:      #fff0e0;  --if-cat-food-fg:      #b05a0a;
  --if-cat-transport-bg: #f0ecff;  --if-cat-transport-fg: #5b3fbf;
  --if-cat-leisure-bg:   #e2f8f5;  --if-cat-leisure-fg:   #0d7a6a;
  --if-cat-invest-bg:    #fdf5d5;  --if-cat-invest-fg:    #8a6b00;
  --if-cat-housing-bg:   #e4f0fc;  --if-cat-housing-fg:   #1a5f99;
  --if-cat-health-bg:    #fce4f0;  --if-cat-health-fg:    #b03070;
  --if-cat-other-bg:     #edeef2;  --if-cat-other-fg:     #707888;

  /* Raios de borda — DESIGN.md */
  --if-radius-xs:   4px;
  --if-radius-sm:   6px;
  --if-radius-md:   8px;   /* botões (retangulares, NÃO pill) */
  --if-radius-lg:   12px;  /* cards */
  --if-radius-xl:   16px;
  --if-radius-full: 9999px; /* tabs pill, badges */

  /* Sombras */
  --if-shadow-1: 0 1px 2px rgba(20,25,40,.05);
  --if-shadow-2: 0 4px 14px rgba(20,25,40,.07), 0 1px 2px rgba(20,25,40,.04);
  --if-shadow-3: 0 12px 32px rgba(20,25,40,.12), 0 2px 6px rgba(20,25,40,.06);

  /* Tipografia */
  --if-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --if-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

## Classes Utilitárias

```css
/* Números tabulares (valores monetários) */
.if-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* Card padrão */
.if-card {
  background: var(--if-surface);
  border: 1px solid var(--if-line);
  border-radius: var(--if-radius-lg);
  box-shadow: var(--if-shadow-1);
}

/* Chip de categoria */
.if-chip {
  display: inline-flex; align-items: center; gap: 5px;
  height: 22px; padding: 0 9px;
  border-radius: var(--if-radius-full);
  font-size: 11px; font-weight: 600;
}

/* Botão primário */
.if-btn-primary {
  background: var(--if-brand); color: #fff;
  height: 36px; padding: 0 16px;
  border-radius: var(--if-radius-md);
  font: 500 14px var(--if-font);
  border: none; cursor: pointer;
}
```

## Padrões do DESIGN.md (Notion)

- **Hero band escuro**: `background: linear-gradient(160deg, var(--if-brand) 0%, #1a2448 100%)`
- **KPI card no hero**: `background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12)`
- **Tabs de período**: pill (`border-radius: 9999px`), active = `background: rgba(255,255,255,.95); color: var(--if-brand)`
- **Botões de ação**: SEMPRE retangulares (`border-radius: 8px`), não pill
- **Separador de seção**: `border-bottom: 1px solid var(--if-line)`
- **Hover em tabela**: `background: var(--if-surface-sunken)`

## Cores para Chart.js (RGB hex compatível)

```javascript
const CAT_COLORS = {
  'Salário':       '#2e7d52',
  'Alimentação':   '#b05a0a',
  'Transporte':    '#5b3fbf',
  'Lazer':         '#0d7a6a',
  'Moradia':       '#1a5f99',
  'Saúde':         '#b03070',
  'Rendimentos':   '#8a6b00',
  'Financeiro':    '#4a4a6a',
  'Transferência': '#5a6070',
  'Impostos':      '#8a3020',
  'Seguros':       '#3d6060',
  'Educação':      '#1a6b8a',
  'Vestuário':     '#7a3a8a',
  'Animais':       '#4a7a10',
  'Reembolso':     '#1a8a6a',
  'Saque':         '#8a5a20',
  'Outros':        '#707888',
};
```

## CDNs Aprovados

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
```
