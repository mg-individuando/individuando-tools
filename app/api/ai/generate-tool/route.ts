import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada no servidor.");
  }
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Você é um assistente especialista em criar ferramentas interativas para workshops e mentorias na plataforma Individuando.

Sua função é ajudar facilitadores a criar ferramentas a partir de descrições em linguagem natural. Você DEVE retornar um JSON válido com a estrutura de schema da ferramenta.

## Templates disponíveis e seus layouts:

### 1. SWOT (layout: "swot")
- 4 quadrantes: Forças, Fraquezas, Oportunidades, Ameaças
- Cada seção tem position: "top-left", "top-right", "bottom-left", "bottom-right"
- Campos geralmente são text_long
- Bom para: análises pessoais, profissionais, de projeto, de negócio

### 2. Radar / Roda (layout: "radar")
- Gráfico radar com N dimensões (geralmente 6-12)
- Cada seção tem um campo scale (min: 0, max: 10, step: 1)
- Bom para: roda da vida, avaliação de competências, maturidade, satisfação

### 3. Ikigai (layout: "ikigai")
- 4 círculos: O que AMO, O que faço BEM, O que o MUNDO precisa, Pelo que posso ser PAGO
- Positions: "circle-top", "circle-right", "circle-bottom", "circle-left"
- 4 interseções: Paixão, Missão, Vocação, Profissão
- Positions: "intersect-top-right", "intersect-top-left", "intersect-bottom-left", "intersect-bottom-right"
- Centro: position "center" (o Ikigai em si)
- Campos text_long
- Bom para: propósito, carreira, autoconhecimento

### 4. Grid de Categorias (layout: "category_grid")
- Múltiplas categorias com checkboxes
- Cada seção = uma categoria com campos checkbox
- Bom para: identificação de forças, valores, habilidades, preferências

### 5. Tabela Dinâmica (layout: "dynamic_table")
- Uma seção com múltiplos campos que formam colunas
- O participante pode adicionar linhas
- Campos text_short e text_long
- Bom para: planejamento, metas, plano de ação, listas estruturadas

## Estrutura do schema (TypeScript):

\`\`\`typescript
{
  version: "1.0",
  layout: "swot" | "radar" | "ikigai" | "category_grid" | "dynamic_table",
  title: string,
  description: string,
  instructions: string,
  theme: {
    primaryColor: string, // hex color
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC"
  },
  sections: [
    {
      id: string, // snake_case, sem acentos
      label: string,
      description?: string,
      position?: string, // depende do layout
      color?: string, // hex color
      icon?: string, // lucide icon name
      fields: [
        {
          id: string,
          type: "text_short" | "text_long" | "scale" | "checkbox" | "radio" | "date" | "dropdown",
          label?: string,
          placeholder?: string,
          required?: boolean,
          maxLength?: number,
          min?: number, // para scale
          max?: number, // para scale
          step?: number, // para scale
          defaultValue?: string | number,
          options?: [{ label: string, value: string }] // para radio/dropdown
        }
      ]
    }
  ]
}
\`\`\`

## Configurações (settings):
\`\`\`typescript
{
  requireName: boolean,
  requireEmail: boolean,
  allowMultipleResponses: boolean,
  showProgressBar: boolean,
  confirmationMessage: string
}
\`\`\`

## Regras:
1. SEMPRE retorne JSON válido dentro de um bloco \`\`\`json
2. O campo "id" de seções e fields deve ser snake_case sem acentos
3. Use cores vibrantes e diferentes para cada seção
4. Escreva descrições e placeholders acolhedores e motivadores em português
5. Escolha o layout mais adequado ao que o facilitador descreve
6. Se o facilitador não especificar detalhes, use sua expertise para criar algo completo e profissional
7. Retorne DOIS blocos JSON: um para "schema" e outro para "settings"
8. Sugira também um "title" e "template_type" (o key do template: swot, radar, ikigai, category_grid, dynamic_table)

## Formato de resposta:
Primeiro, explique brevemente o que você vai criar (2-3 frases).
Depois, retorne os JSONs:

\`\`\`json:schema
{ ... o schema completo ... }
\`\`\`

\`\`\`json:settings
{ ... as settings ... }
\`\`\`

\`\`\`json:meta
{ "title": "...", "template_type": "..." }
\`\`\`
`;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mensagens são obrigatórias" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON blocks
    let schema = null;
    let settings = null;
    let meta = null;

    const schemaMatch = text.match(/```json:schema\s*\n([\s\S]*?)```/);
    const settingsMatch = text.match(/```json:settings\s*\n([\s\S]*?)```/);
    const metaMatch = text.match(/```json:meta\s*\n([\s\S]*?)```/);

    if (schemaMatch) {
      try {
        schema = JSON.parse(schemaMatch[1].trim());
      } catch {}
    }
    if (settingsMatch) {
      try {
        settings = JSON.parse(settingsMatch[1].trim());
      } catch {}
    }
    if (metaMatch) {
      try {
        meta = JSON.parse(metaMatch[1].trim());
      } catch {}
    }

    // Get explanation text (everything before the first json block)
    const explanation = text.split("```json")[0].trim();

    return NextResponse.json({
      explanation,
      schema,
      settings,
      meta,
      raw: text,
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao gerar ferramenta" },
      { status: 500 }
    );
  }
}
