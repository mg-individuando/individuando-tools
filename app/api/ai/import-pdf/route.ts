import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Você é um especialista em converter ferramentas de coaching, mentoria e workshops de formato PDF para formato digital interativo.

Você receberá a imagem de um PDF (ferramenta visual) junto com informações extraídas (textos, campos editáveis se houver). Sua tarefa é analisar a ferramenta e gerar um schema JSON para recriá-la como ferramenta digital interativa.

ANÁLISE DO PDF:
1. Identifique o TIPO de ferramenta (SWOT, Matriz, Mapa da Empatia, Roda da Vida, Canvas, etc.)
2. Identifique todas as SEÇÕES/áreas onde o participante precisa escrever ou interagir
3. Identifique labels, títulos, descrições e instruções
4. Identifique a ESTRUTURA visual (grid 2x2, lista, radar, diagrama, tabela, etc.)
5. Identifique cores predominantes do design original

MAPEAMENTO DE LAYOUTS:
- Grid 2x2 (tipo SWOT, Eisenhower) → layout: "swot" com positions top-left, top-right, bottom-left, bottom-right
- Roda/Radar com dimensões → layout: "radar" com campos scale
- Diagrama de Venn/Ikigai (4 círculos) → layout: "ikigai"
- Categorias com checkboxes → layout: "category_grid"
- Tabela com linhas dinâmicas → layout: "dynamic_table"
- Outros formatos → layout: "free_layout" (seções verticais livres)

RESPONDA COM EXATAMENTE 3 BLOCOS JSON (sem texto adicional antes do primeiro bloco):

\`\`\`json:schema
{
  "version": "1.0",
  "layout": "swot|radar|ikigai|category_grid|dynamic_table|free_layout",
  "title": "Título da Ferramenta",
  "description": "Descrição clara da ferramenta e seu propósito",
  "instructions": "Instruções detalhadas para o participante",
  "theme": {
    "primaryColor": "#hex",
    "backgroundColor": "#FFFFFF",
    "fontFamily": "Inter"
  },
  "sections": [
    {
      "id": "snake_case_id",
      "label": "Label da Seção",
      "description": "Descrição da seção",
      "position": "posição se aplicável",
      "color": "#hex",
      "icon": "",
      "fields": [
        {
          "id": "field_id",
          "type": "text_short|text_long|scale|checkbox|radio|date|dropdown",
          "label": "Label do campo",
          "placeholder": "Texto de ajuda...",
          "required": false,
          "maxLength": 500
        }
      ]
    }
  ]
}
\`\`\`

\`\`\`json:settings
{
  "requireName": true,
  "requireEmail": false,
  "allowMultipleResponses": false,
  "showProgressBar": false,
  "confirmationMessage": "Obrigado por preencher sua ferramenta! Suas reflexões foram registradas."
}
\`\`\`

\`\`\`json:meta
{
  "title": "Título para salvar",
  "template_type": "tipo do template",
  "source": "pdf_import",
  "original_info": "Breve descrição do PDF original"
}
\`\`\`

REGRAS:
- Preserve a essência da ferramenta original
- Use cores que remetam ao design original do PDF
- Crie placeholders detalhados e úteis que guiem o participante
- Para campos de texto livre, use maxLength generoso (500-1000)
- Inclua descrições claras em cada seção
- O título deve ser descritivo e profissional
- Gere instruções detalhadas que expliquem como usar a ferramenta
- Para matrizes 2x2, SEMPRE use layout "swot" com as 4 posições
- Para ferramentas com muitas seções textuais, use "free_layout"
- Sempre em português brasileiro`;

async function fetchFreepikIcon(keyword: string): Promise<string | null> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.freepik.com/v1/icons?term=${encodeURIComponent(keyword)}&per_page=1&filters[style]=special-lineal`;
    const resp = await fetch(url, {
      headers: {
        "x-freepik-api-key": apiKey,
        Accept: "application/json",
      },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.data?.[0]?.thumbnails?.[0]?.url || null;
  } catch {
    return null;
  }
}

async function enrichSchemaWithIcons(schema: any): Promise<any> {
  if (!schema?.sections) return schema;

  const enrichedSections = await Promise.all(
    schema.sections.map(async (section: any) => {
      // Use the icon hint from AI, or fall back to the section label
      const searchTerm = section.icon || section.label?.split(" ")[0] || "tool";
      const iconUrl = await fetchFreepikIcon(searchTerm);
      return {
        ...section,
        icon: iconUrl || section.icon || "",
      };
    })
  );

  return { ...schema, sections: enrichedSections };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfImage = formData.get("image") as string | null;
    const extractedText = formData.get("extractedText") as string | null;
    const extractedFields = formData.get("extractedFields") as string | null;
    const userNotes = formData.get("userNotes") as string | null;

    if (!pdfImage) {
      return NextResponse.json(
        { error: "Imagem do PDF é obrigatória" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    // Build the message content
    const content: Anthropic.Messages.ContentBlockParam[] = [];

    // Add the PDF as a document (Claude supports PDF natively)
    if (pdfImage.startsWith("data:")) {
      const match = pdfImage.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mediaType = match[1];
        const base64Data = match[2];

        if (mediaType === "application/pdf") {
          // Send as document type (Claude PDF support)
          content.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Data,
            },
          } as any);
        } else {
          // Send as image (PNG, JPEG, etc.)
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
              data: base64Data,
            },
          });
        }
      }
    }

    // Build text context
    let textContext = "Analise esta ferramenta em PDF e gere o schema para recriá-la digitalmente.\n\n";

    if (extractedText) {
      textContext += `TEXTOS EXTRAÍDOS DO PDF:\n${extractedText}\n\n`;
    }

    if (extractedFields) {
      textContext += `CAMPOS EDITÁVEIS ENCONTRADOS NO PDF:\n${extractedFields}\n\n`;
    }

    if (userNotes) {
      textContext += `OBSERVAÇÕES DO USUÁRIO:\n${userNotes}\n\n`;
    }

    textContext += "Gere o schema JSON completo seguindo as instruções do sistema.";

    content.push({ type: "text", text: textContext });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the three JSON blocks
    const schemaMatch = text.match(/```json:schema\s*([\s\S]*?)```/);
    const settingsMatch = text.match(/```json:settings\s*([\s\S]*?)```/);
    const metaMatch = text.match(/```json:meta\s*([\s\S]*?)```/);

    const schema = schemaMatch ? JSON.parse(schemaMatch[1].trim()) : null;
    const settings = settingsMatch
      ? JSON.parse(settingsMatch[1].trim())
      : null;
    const meta = metaMatch ? JSON.parse(metaMatch[1].trim()) : null;

    if (!schema) {
      return NextResponse.json(
        { error: "Não foi possível gerar o schema a partir do PDF" },
        { status: 500 }
      );
    }

    // Enrich sections with Freepik icons
    const enrichedSchema = await enrichSchemaWithIcons(schema);

    // Extract explanation (text before first JSON block)
    const explanation = text.split("```")[0].trim();

    return NextResponse.json({
      explanation,
      schema: enrichedSchema,
      settings,
      meta,
      raw: text,
    });
  } catch (error: unknown) {
    console.error("PDF import error:", error);
    return NextResponse.json(
      { error: "Erro ao processar o PDF" },
      { status: 500 }
    );
  }
}
