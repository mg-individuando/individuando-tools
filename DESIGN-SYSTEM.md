# Individuando Tools — Design System v1.0

## Identidade Visual

### Conceito
Plataforma SaaS de ferramentas de autoconhecimento e desenvolvimento humano. O visual transmite **profissionalismo acolhedor** — sofisticado o suficiente para coaches e RH corporativo, mas quente e humano o bastante para criar confiança e abertura.

### Estilo
- **Clean + Warm**: linhas limpas sem frieza clínica
- **Soft Canva**: bordas arredondadas, sombras suaves, cores pastel de acento
- **Notion-inspired density** na area admin, **Typeform-inspired focus** na area publica
- **Sem glass-morphism, sem gradientes neon, sem efeitos excessivos**

---

## Cores

### Brand
| Token | Valor | Uso |
|-------|-------|-----|
| `--brand` | `oklch(0.40 0.08 240)` / `#2D5A7B` | Cor principal da marca |
| `--brand-light` | `oklch(0.50 0.08 240)` / `#3B7BA6` | Hover, links |
| `--brand-dark` | `oklch(0.30 0.08 240)` / `#1E3F56` | Pressed, headings fortes |
| `--brand-subtle` | `oklch(0.95 0.02 240)` / `#EEF4F8` | Backgrounds sutis |

### Individuando Identity
| Token | Valor | Uso |
|-------|-------|-----|
| `--ind-navy` | `#1e2f4c` | Logo primaria |
| `--ind-sage` | `#c0d57e` | Logo acento |

### Semanticas
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--success` | `oklch(0.60 0.15 155)` | `oklch(0.70 0.15 155)` | Confirmacoes, publicado |
| `--warning` | `oklch(0.75 0.15 75)` | `oklch(0.80 0.12 75)` | Alertas, rascunho |
| `--error` | `oklch(0.60 0.22 25)` | `oklch(0.70 0.19 22)` | Erros, destructive |
| `--info` | `oklch(0.60 0.12 250)` | `oklch(0.70 0.12 250)` | Informacional |

### Superficies (Light / Dark)
| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#FAFBFC` | `#0F1117` |
| `--surface-1` | `#FFFFFF` | `#1A1D27` |
| `--surface-2` | `#F4F6F8` | `#22252F` |
| `--surface-3` | `#EDF0F3` | `#2A2D37` |
| `--border` | `#E2E8F0` | `rgba(255,255,255,0.08)` |
| `--border-strong` | `#CBD5E1` | `rgba(255,255,255,0.15)` |

### Texto
| Token | Light | Dark |
|-------|-------|------|
| `--text-primary` | `#1A1A2E` | `#F0F0F5` |
| `--text-secondary` | `#64748B` | `#94A3B8` |
| `--text-muted` | `#94A3B8` | `#64748B` |
| `--text-inverse` | `#FFFFFF` | `#0F1117` |

### Charts (5 cores distinguiveis)
| Token | Valor |
|-------|-------|
| `--chart-1` | `oklch(0.55 0.15 240)` — Azul |
| `--chart-2` | `oklch(0.60 0.18 155)` — Verde |
| `--chart-3` | `oklch(0.65 0.15 30)` — Coral |
| `--chart-4` | `oklch(0.60 0.15 290)` — Roxo |
| `--chart-5` | `oklch(0.75 0.15 75)` — Ambar |

---

## Tipografia

### Font Stack
- **Heading + Body**: `Montserrat` (ja carregada, weights 300-700)
- **Mono**: `'JetBrains Mono', 'Fira Code', monospace` (para slugs, codes)
- **Fallback**: `system-ui, -apple-system, sans-serif`

### Escala
| Token | Size | Weight | Line Height | Uso |
|-------|------|--------|-------------|-----|
| `--text-display` | 36px / 2.25rem | 700 | 1.2 | Titulos de pagina publica |
| `--text-h1` | 28px / 1.75rem | 700 | 1.3 | Titulos de pagina admin |
| `--text-h2` | 22px / 1.375rem | 600 | 1.35 | Titulos de secao |
| `--text-h3` | 18px / 1.125rem | 600 | 1.4 | Subtitulos |
| `--text-body` | 15px / 0.9375rem | 400 | 1.6 | Texto corrido |
| `--text-small` | 13px / 0.8125rem | 400 | 1.5 | Descricoes, hints |
| `--text-xs` | 11px / 0.6875rem | 500 | 1.4 | Labels, badges, meta |

---

## Espacamento

Base unit: **4px**. Usar multiplos consistentes.

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-1` | 4px | Gaps minimos |
| `--space-2` | 8px | Gaps internos |
| `--space-3` | 12px | Padding compacto |
| `--space-4` | 16px | Padding padrao |
| `--space-5` | 20px | Gap entre elementos |
| `--space-6` | 24px | Padding de secao |
| `--space-8` | 32px | Gap entre secoes |
| `--space-10` | 40px | Margem de pagina |
| `--space-12` | 48px | Separacao forte |
| `--space-16` | 64px | Espacamento de secao grande |

---

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 6px | Inputs, badges |
| `--radius-md` | 8px | Botoes, chips |
| `--radius-lg` | 12px | Cards admin |
| `--radius-xl` | 16px | Cards ferramenta (configuravel por cliente) |
| `--radius-2xl` | 20px | Containers grandes |
| `--radius-full` | 9999px | Pills, avatars |

---

## Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Inputs, badges |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.06)` | Cards compactos |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` | Cards elevados, dropdowns |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.10)` | Modais, overlays |
| `--shadow-soft` | `0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)` | Estilo Canva para ferramentas |

---

## Componentes de Ferramenta

### Principios
- Cada secao tem um **acento de cor** (top bar de 3px ou borda lateral)
- Background da secao: **pastel** da cor da secao (cor a ~8% opacidade)
- Inputs: **fundo branco**, sem borda visivel, sombra sutil
- Icones: **Freepik special-lineal** (via SectionIcon)
- Border-radius: `var(--card-radius, 16px)` — configuravel por cliente

### Paleta de ferramentas
Cada tipo de ferramenta tem identidade cromatica propria:

| Ferramenta | Cores sugeridas |
|------------|-----------------|
| SWOT | Verde (#059669), Vermelho (#DC2626), Azul (#2563EB), Ambar (#D97706) |
| Radar | Gradiente da cor primaria do tema |
| Ikigai | 4 tons distintos para circulos + intersecoes |
| Category Grid | Uma cor por categoria, paleta harmonizada |
| Dynamic Table | Cor primaria como acento |
| Free Layout | Cores definidas por secao no schema |

---

## Layout

### Breakpoints
| Nome | Largura | Uso |
|------|---------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop wide |
| `2xl` | 1536px | Ultra wide |

### Containers
- **Admin**: `max-w-7xl mx-auto px-6`
- **Publico**: `max-w-4xl mx-auto px-4`
- **Ferramenta**: `max-w-3xl mx-auto` (FreeLayout, DynamicTable)
- **SWOT/CategoryGrid**: `max-w-4xl mx-auto` (2+ colunas)

### Grid Admin
- **Dashboard**: 2 colunas no desktop, 1 no mobile
- **Form + Preview**: `grid-cols-3` (2 form + 1 preview) no desktop
- **Listagem**: cards responsivos `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## Anti-padrões a evitar

1. **Cores hardcoded** — SEMPRE usar tokens CSS, nunca `style={{ color: "#2D5A7B" }}`
2. **Glass-morphism** — nao usar backdrop-blur, transparencias excessivas
3. **Gradientes neon** — gradientes sutis e profissionais somente
4. **Texto truncado sem tooltip** — se truncar, permitir ver o texto completo
5. **Botoes sem feedback visual** — hover, active, disabled devem ser claros
6. **Inputs sem focus ring** — sempre visivel e com cor do brand
7. **Cards sem hierarquia** — usar sombras e espacamento para criar profundidade
8. **Fontes inconsistentes** — tudo Montserrat, pesos conforme a escala

---

## Transicoes

| Propriedade | Duracao | Easing |
|-------------|---------|--------|
| Color, Background | 150ms | ease-out |
| Transform, Shadow | 200ms | ease-out |
| Opacity | 200ms | ease-in-out |
| Layout (height, width) | 300ms | ease-in-out |
