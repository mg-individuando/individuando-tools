import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Você é um designer gráfico especializado em banners para plataformas de coaching, mentoria e workshops.

Sua tarefa é gerar configurações JSON de banners a partir de descrições em linguagem natural.
Você deve retornar APENAS um bloco JSON válido (sem markdown, sem explicações) com as seguintes propriedades:

{
  "backgroundType": "solid" | "gradient",
  "backgroundColor": "#hex",         // usado quando backgroundType é "solid"
  "gradientFrom": "#hex",            // cor inicial do gradiente
  "gradientTo": "#hex",              // cor final do gradiente
  "gradientDirection": "to right" | "to bottom" | "to bottom right" | "135deg",
  "title": "texto opcional",         // texto para exibir no banner (pode ser vazio "")
  "titleColor": "#hex",
  "titleSize": 14-48,                // tamanho da fonte em pixels
  "titlePosition": "left" | "center" | "right",
  "logoPosition": "left" | "center" | "right",
  "showLogo": true | false,
  "logoSize": 20-80,                 // tamanho do logo em pixels
  "logoColor": "#hex",               // cor para aplicar ao logo
  "logoColorEnabled": true | false   // se deve alterar a cor do logo
}

DIRETRIZES DE DESIGN:
- Gradientes são quase sempre mais bonitos que cores sólidas. Prefira gradientes suaves.
- Use paletas de cores sofisticadas e profissionais. Evite cores neon ou muito saturadas.
- Para workshops/treinamentos corporativos: tons de azul, cinza escuro, verde petróleo
- Para coaching/mentoria: tons quentes (âmbar, terracota) ou suaves (lavanda, verde sage)
- Para inovação/criatividade: violeta, índigo, gradientes mais ousados
- Para bem-estar/desenvolvimento pessoal: tons verdes, rosa suave, dourados
- O título deve complementar, não competir com o logo. Geralmente branco (#FFFFFF) ou off-white.
- Logo geralmente fica à esquerda, tamanho entre 32-50px
- Se o usuário não especificar texto, deixe title vazio ""
- Se o nome do cliente for fornecido, pode usá-lo como inspiração para o título
- Quando o logo for branco ou muito claro, desative logoColorEnabled
- Para fundos escuros, use logoColor branco (#FFFFFF) com logoColorEnabled: true
- Para fundos claros, desative logoColorEnabled para manter cor original

PALETAS RECOMENDADAS:
- Azul executivo: #1a365d → #2D5A7B
- Verde profissional: #064E3B → #10B981
- Violeta premium: #312E81 → #6D28D9
- Terracota elegante: #78350F → #D97706
- Cinza sofisticado: #111827 → #4B5563
- Azul celeste: #0C4A6E → #38BDF8
- Rosa quente: #831843 → #EC4899
- Esmeralda escuro: #022C22 → #059669
- Índigo profundo: #1E1B4B → #818CF8
- Dourado clássico: #451A03 → #F59E0B

Sempre retorne JSON válido. Sem texto adicional.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, clientName, currentConfig } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    let userMessage = prompt;
    if (clientName) {
      userMessage += `\n\nNome do cliente: ${clientName}`;
    }
    if (currentConfig) {
      userMessage += `\n\nConfiguração atual (para referência, pode alterar o que quiser): ${JSON.stringify(currentConfig, null, 2)}`;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (handle possible markdown wrapping)
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const config = JSON.parse(jsonStr);

    // Validate and sanitize
    const validConfig: Record<string, unknown> = {};
    const allowedKeys = [
      "backgroundType",
      "backgroundColor",
      "gradientFrom",
      "gradientTo",
      "gradientDirection",
      "title",
      "titleColor",
      "titleSize",
      "titlePosition",
      "logoPosition",
      "showLogo",
      "logoSize",
      "logoColor",
      "logoColorEnabled",
    ];

    for (const key of allowedKeys) {
      if (config[key] !== undefined) {
        validConfig[key] = config[key];
      }
    }

    return NextResponse.json({ config: validConfig });
  } catch (error: unknown) {
    console.error("AI banner generation error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar banner com IA" },
      { status: 500 }
    );
  }
}
