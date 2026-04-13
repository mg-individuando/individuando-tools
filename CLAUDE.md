# Individuando Tools

Plataforma SaaS para facilitadores criarem, customizarem e aplicarem ferramentas interativas de desenvolvimento humano (SWOT, Ikigai, Roda da Vida, etc.) com branding personalizado por cliente.

## Stack

- **Framework:** Next.js 16.2.2 (App Router, React 19, Turbopack)
- **Styling:** Tailwind CSS 4 (PostCSS), shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Anthropic Claude SDK (geração de ferramentas, banner IA)
- **Icons:** Lucide React + Freepik Special Lineal (via API)
- **Language:** TypeScript 5, Zod 4 (validação)
- **Deploy:** Vercel

## Estrutura do projeto

```
app/
  auth/           — Login, callback, reset senha
  admin/          — Dashboard, ferramentas, clientes, usuários
    ferramentas/  — CRUD de ferramentas + builder + respostas
    clientes/     — Gestão de clientes com branding
    usuarios/     — Gestão de usuários e convites
  f/[slug]/       — Página pública do formulário (participante)
  api/
    ai/           — generate-tool, generate-banner, import-pdf
    icons/search  — Busca de ícones Freepik
    admin/users   — CRUD de usuários (server)
  estilos/        — Preview de templates e design system

components/
  tools/          — Renderers: SwotGrid, RadarChart, IkigaiDiagram,
                    CategoryGrid, DynamicTable, FreeLayout, InlineEdit
  builder/        — BuilderPanel (editor visual com inline editing)
  ui/             — shadcn base + FileUpload, FontUpload, IconPicker,
                    BannerEditor

lib/
  schemas/        — tool-schema.ts (ToolSchema, Section, Field),
                    types.ts (Profile, Client, BrandConfig, Tool, Response)
  templates/      — 18 templates pré-definidos (swot, radar, ikigai, etc.)
  supabase/       — Client (browser), Server, Middleware
  utils.ts        — cn() helper

supabase/
  migrations/     — DDL, RLS policies, triggers
```

## Banco de dados (Supabase)

| Tabela | Propósito |
|--------|-----------|
| `profiles` | Usuários (admin, facilitator) — auto-criado via trigger |
| `tools` | Ferramentas com schema JSONB, settings, status |
| `tool_sessions` | Sessões/turmas com código de acesso |
| `responses` | Respostas dos participantes (JSONB) |
| `clients` | Clientes com brand_config (cores, fontes, logo, banner) |

**RLS:** Facilitadores veem só suas ferramentas. Admins veem tudo. Público acessa ferramentas publicadas.

## Schema da ferramenta

```typescript
ToolSchema {
  layout: "swot" | "radar" | "ikigai" | "category_grid" | "dynamic_table" | "free_layout" | "blank"
  title, description, instructions
  gridColumns?: 1-6        // controle manual de colunas do grid
  theme?: { primaryColor, secondaryColor, backgroundColor, fontFamily }
  sections: Section[]      // array sem limite
}

Section { id, label, description, position?, color, icon, fields: Field[] }
Field   { id, type, label, placeholder, required, maxLength, min, max, step, defaultValue, options }
FieldType: "text_short" | "text_long" | "scale" | "checkbox" | "radio" | "date" | "dropdown"
```

**Helpers** (em tool-schema.ts): `generateSectionId()`, `generateFieldId()`, `pickNextColor()`, `SECTION_COLORS[]`

## Templates (18 pré-definidos)

| Template | Layout | Seções |
|----------|--------|--------|
| swot | swot | 4 (Forças, Fraquezas, Oportunidades, Ameaças) |
| radar (Roda da Vida) | radar | 8 dimensões (Saúde, Finanças, Carreira...) |
| ikigai | ikigai | 9 (4 círculos + 4 interseções + centro) |
| via (Forças Pessoais) | category_grid | 6 categorias com checkboxes |
| moscow | category_grid | 4 (Must/Should/Could/Won't) |
| metas | dynamic_table | 1 seção, 5 colunas |
| effort_impact | swot | 4 quadrantes |
| stakeholder_map | category_grid | 4 quadrantes |
| timeline | dynamic_table | 1 seção, 4 colunas |
| risk_map | dynamic_table | 1 seção, 4 colunas |
| how_now_wow | free_layout | 3 seções |
| dot_voting | free_layout | variável |
| team_canvas | free_layout | variável |
| retrospective | free_layout | variável |
| vision_board | free_layout | variável |
| coat_of_arms | swot | 4 quadrantes |
| perceptual_map | swot | 4 quadrantes |
| mind_map | free_layout | 1 central + 6 ramos |

## Builder

O builder (`BuilderPanel.tsx`) permite edição visual completa:

**Gestão de seções:**
- `addSection()` — clona última seção com novos IDs e cor automática
- `removeSection(i)` — mínimo 2 (swot/radar) ou 1 (outros)
- `duplicateSection(i)` — cópia profunda com IDs regenerados
- `reorderSection(i, dir)` — swap com vizinho (swot troca `position` também)
- Desabilitado para `ikigai` e `dynamic_table`

**Gestão de campos:**
- `addField(sectionIndex)` — novo campo com tipo da seção
- `removeField(sectionIndex, fieldIndex)` — mínimo 1 campo

**Propriedades editáveis:**
- Tool: título, descrição, instruções, cor principal, cor de fundo, gridColumns
- Seção: label, descrição, cor, ícone + botões ▲▼ duplicar/remover
- Campo: label, placeholder, maxLength, min/max (scale), valor padrão

**Inline editing:** Click-to-edit em todos os textos via `InlineEdit.tsx`. Detectado por `isBuilder = !!onSectionUpdate`.

## Branding por cliente (BrandConfig)

Cada cliente tem `brand_config` JSONB com:
- **Cores:** primaryColor, secondaryColor, backgroundColor, textColor, buttonColor, buttonTextColor
- **Tipografia:** fontFamily, fontUrl (Google Fonts), customFonts[] (upload), headingWeight, bodyWeight, labelWeight
- **Layout:** buttonRadius, cardRadius
- **Header:** bannerConfig (background, layout, logos, texto, overlay)
- **Banner layouts:** logo-text-logo, logo-text, text-logo, centered
- **Footer:** footerText
- **Toggle:** showNameInHeader

**customFonts:** Carregadas na public page como `@font-face` dinâmico. Upload multi-file com detecção de peso pelo nome original.

## Página pública (/f/[slug])

Fluxo em 3 etapas:
1. **Welcome** — nome, email, campos custom de identificação
2. **Tool** — renderiza ferramenta interativa + botão "Salvar como PDF"
3. **Done** — confirmação

Botão "Salvar como PDF" usa `window.print()` + CSS `@media print` (A4, margens 1.5cm, fonte 13px, interativos escondidos).

## Layout dos renderers

| Renderer | Grid | gridColumns? |
|----------|------|-------------|
| SwotGrid | `md:grid-cols-2` default | Sim (2/3/4) |
| CategoryGrid | `md:grid-cols-2 lg:grid-cols-3` | Sim, override hasLongWord |
| FreeLayout | vertical stack ou grid | Sim (>1 ativa grid) |
| RadarChart | N-gon SVG + cards `sm:grid-cols-2` | Não |
| DynamicTable | cards com `sm:grid-cols-2` | Não |
| IkigaiDiagram | posições semânticas | Não |

**gridColumns** é um mapa estático (Tailwind-safe):
```typescript
const GRID_COLS_MAP = {
  1: "grid grid-cols-1 gap-4",
  2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
};
```

## Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=       # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Chave anon pública
SUPABASE_SERVICE_ROLE_KEY=      # (opcional) Para operações admin server-side
ANTHROPIC_API_KEY=              # Para geração de ferramentas com IA
NEXT_PUBLIC_APP_URL=            # Para redirects de reset de senha
```

## Comandos

```bash
npm run dev    # Desenvolvimento (Turbopack, port 3001)
npm run build  # Build de produção
npm run start  # Servidor de produção
```

## Padrões de código

- **Idioma:** Interface e labels em português BR. Código e variáveis em inglês.
- **Estilo visual:** glassmorphism leve (cards com `backdrop-filter: blur`, sombras suaves). Cores do tema DataPulse.
- **Componentes:** Sempre preferir shadcn/ui base. Componentes custom só quando necessário.
- **Imports de ícone:** `lucide-react` para tudo. Sem emojis como ícones de UI.
- **Fontes:** Fonte padrão é Montserrat (carregada via Google Fonts). Clientes podem usar fontes custom.
- **Responsividade:** Mobile-first. Breakpoints: `sm` (640), `md` (768), `lg` (1024).
- **Estado:** `useState` local. Sem Redux/Context global (exceto auth via Supabase).
- **Validação:** Zod para schemas. Browser validation para forms.
