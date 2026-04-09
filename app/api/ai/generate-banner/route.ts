import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Você é um designer gráfico premiado, especializado em banners para plataformas de coaching, mentoria e workshops corporativos.

Sua tarefa é criar designs completos e sofisticados de banners a partir de descrições em linguagem natural.
Você deve retornar APENAS um bloco JSON válido (sem markdown, sem explicações) com TODAS as seguintes propriedades:

{
  "backgroundType": "solid" | "gradient",
  "backgroundColor": "#hex",
  "gradientFrom": "#hex",
  "gradientTo": "#hex",
  "gradientDirection": "to right" | "to bottom" | "to bottom right" | "135deg",
  "bannerLayout": "logo-text-logo" | "logo-text" | "text-logo" | "centered",
  "title": "texto para o banner",
  "titleColor": "#hex",
  "titleSize": 14-42,
  "titlePosition": "left" | "center" | "right",
  "subtitle": "subtítulo complementar",
  "subtitleColor": "#hex",
  "subtitleSize": 11-18,
  "showClientLogo": true | false,
  "clientLogoSize": 30-70,
  "clientLogoPosition": "left" | "right",
  "individuandoVariant": 1-16,
  "individuandoSize": 20-60,
  "overlayOpacity": 0-60
}

LOGOS INDIVIDUANDO DISPONÍVEIS:
- Variantes 1-3: Azul marinho (#1e2f4c) + Verde sage (#c0d57e) — para fundos CLAROS
  - 1: horizontal, 2: vertical, 3: moderada
- Variantes 4-6: Verde sage + Branco — para fundos ESCUROS
  - 4: horizontal, 5: vertical, 6: moderada
- Variantes 7-9: Branco puro — para fundos ESCUROS (máximo contraste)
  - 7: horizontal, 8: vertical, 9: moderada
- Variantes 10-12: Azul marinho puro — para fundos CLAROS
  - 10: horizontal, 11: vertical, 12: moderada
- Variantes 13-16: Ícones quadrados (13-15 para claros, 14-16 para escuros)

Para banners horizontais (que é o formato padrão), prefira as variantes horizontais (1,4,7,10).

REGRAS DE DESIGN CRIATIVO:
1. SEMPRE crie um título e subtítulo interessantes, nunca deixe vazio — mesmo que genéricos
2. Use gradientes sofisticados e modernos — NUNCA cores planas sem graça
3. Combine o layout com o propósito: "logo-text-logo" para formal, "centered" para impactante
4. Escolha a variante da logo Individuando que MELHOR contrasta com o fundo
5. Use subtítulos que agreguem valor e contexto
6. Para fundos escuros: texto branco/claro, logos brancas (variantes 7-9 ou 4-6)
7. Para fundos claros: texto escuro, logos azuis (variantes 1-3 ou 10-12)
8. O tamanho do título deve ser proporcional ao comprimento do texto
9. Crie designs que pareçam profissionais e modernos, nunca genéricos
10. Se o cliente tiver nome, use-o criativamente no título/subtítulo

PALETAS DE CORES SOFISTICADAS:
- Azul executivo: #0f172a → #1e3a5f (title: #ffffff, subtitle: #94a3b8)
- Esmeralda profundo: #022c22 → #064e3b (title: #d1fae5, subtitle: #6ee7b7)
- Violeta premium: #1e1b4b → #4c1d95 (title: #e0e7ff, subtitle: #a5b4fc)
- Terracota elegante: #431407 → #78350f (title: #fef3c7, subtitle: #fbbf24)
- Grafite sofisticado: #0f0f0f → #374151 (title: #f3f4f6, subtitle: #9ca3af)
- Oceano profundo: #0c4a6e → #0369a1 (title: #e0f2fe, subtitle: #7dd3fc)
- Rosa quente: #500724 → #9f1239 (title: #ffe4e6, subtitle: #fda4af)
- Dourado clássico: #451a03 → #92400e (title: #fef3c7, subtitle: #f59e0b)
- Índigo noturno: #1e1b4b → #312e81 (title: #c7d2fe, subtitle: #818cf8)
- Verde sage: #1a2e1a → #2d5a3d (title: #dcfce7, subtitle: #86efac)
- Azul petróleo: #0a2e3a → #1e5570 (title: #cffafe, subtitle: #67e8f9)
- Bordeaux: #450a0a → #7f1d1d (title: #fecaca, subtitle: #f87171)

DICAS EXTRAS:
- Textos curtos (1-3 palavras): titleSize 32-42, impactante
- Textos médios (4-8 palavras): titleSize 22-30, equilibrado
- Textos longos (9+): titleSize 16-22, legível
- Subtítulo sempre 60-70% do tamanho do título
- clientLogoPosition deve ser "left" para layout "logo-text-logo"
- Logo Individuando fica automaticamente no lado oposto

Seja CRIATIVO e ousado! Crie designs únicos e memoráveis.
Sempre retorne JSON válido. Sem texto adicional.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, clientName, hasClientLogo, currentConfig } = await request.json();

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
    if (hasClientLogo !== undefined) {
      userMessage += `\n\nO cliente ${hasClientLogo ? "TEM" : "NÃO tem"} logo carregada.`;
    }
    if (currentConfig) {
      userMessage += `\n\nConfiguração atual (referência, sinta-se livre para mudar tudo): ${JSON.stringify(currentConfig, null, 2)}`;
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

    // Extract JSON from response
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
      "bannerLayout",
      "title",
      "titleColor",
      "titleSize",
      "titlePosition",
      "subtitle",
      "subtitleColor",
      "subtitleSize",
      "showClientLogo",
      "clientLogoSize",
      "clientLogoPosition",
      "individuandoVariant",
      "individuandoSize",
      "overlayOpacity",
    ];

    for (const key of allowedKeys) {
      if (config[key] !== undefined) {
        validConfig[key] = config[key];
      }
    }

    // Ensure individuandoVariant is in valid range
    if (typeof validConfig.individuandoVariant === "number") {
      validConfig.individuandoVariant = Math.max(1, Math.min(16, validConfig.individuandoVariant));
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
