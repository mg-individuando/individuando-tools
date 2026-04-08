# Individuando Ferramentas Online — Guia de Setup

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita): https://supabase.com
- Conta na Vercel (gratuita): https://vercel.com (para deploy)

## 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e crie um novo projeto
2. Anote a **Project URL** e a **anon public key** (Settings > API)
3. No **SQL Editor** do Supabase, execute os arquivos na ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

## 2. Configurar o Projeto Local

```bash
# Clonar/copiar os arquivos do projeto
cd individuando-tools-src

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais do Supabase
```

Edite o `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

## 3. Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## 4. Primeiro Acesso

1. Acesse http://localhost:3000/login
2. Crie uma conta (o primeiro usuário será automaticamente **admin**)
3. Vá em "Nova Ferramenta" e crie seu primeiro SWOT ou Roda da Vida
4. Publique e teste o link público!

## 5. Deploy na Vercel

1. Suba o código para um repositório Git (GitHub, GitLab, etc.)
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy! A Vercel faz o build automaticamente.

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login/        → Página de login
│   ├── (admin)/             → Painel administrativo
│   │   ├── ferramentas/     → CRUD de ferramentas
│   │   └── usuarios/        → Gestão de facilitadores
│   ├── f/[slug]/            → Formulário público (participante)
│   └── api/                 → API routes
├── components/
│   ├── tools/               → Componentes interativos (SWOT, Radar)
│   ├── ui/                  → Shadcn/UI base
│   └── shared/              → Componentes reutilizáveis
├── lib/
│   ├── supabase/            → Cliente Supabase
│   ├── schemas/             → Tipos e validações (Zod)
│   └── templates/           → Templates das ferramentas
└── middleware.ts             → Auth middleware
```

## Templates Disponíveis (MVP)

- **SWOT Pessoal** — 4 quadrantes com áreas de texto
- **Roda da Vida** — Gráfico radar SVG interativo com sliders

## Próximos Passos (Fase 2+)

- Ikigai (diagrama Venn)
- Forças Pessoais (grid de categorias)
- Planejamento de Metas (tabela dinâmica)
- Builder drag & drop
- Exportação PDF
- Respostas em tempo real
