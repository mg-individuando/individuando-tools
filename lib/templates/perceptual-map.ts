import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const perceptualMapTemplate: ToolSchema = {
  version: "1.0",
  layout: "swot",
  title: "Mapa Perceptual",
  description:
    "Posicione marcas, produtos ou ideias em um mapa de 4 quadrantes para análise comparativa de posicionamento.",
  instructions:
    "Distribua os elementos nos quadrantes conforme sua percepção. Use para identificar oportunidades de posicionamento.",
  theme: {
    primaryColor: "#8B5CF6",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "inovador_premium",
      label: "Inovador + Premium",
      description: "Alta inovação e alto valor percebido — posicionamento aspiracional",
      position: "top-left",
      color: "#8B5CF6",
      icon: "gem",
      fields: [
        {
          id: "inovador_premium_texto",
          type: "text_long",
          placeholder: "Ex: Apple, Tesla, marcas de luxo que lideram inovação...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "tradicional_premium",
      label: "Tradicional + Premium",
      description: "Baixa inovação mas alto valor percebido — posicionamento de herança e qualidade",
      position: "top-right",
      color: "#EC4899",
      icon: "crown",
      fields: [
        {
          id: "tradicional_premium_texto",
          type: "text_long",
          placeholder: "Ex: Rolex, marcas tradicionais de prestígio, instituições centenárias...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "inovador_acessivel",
      label: "Inovador + Acessível",
      description: "Alta inovação e preço acessível — disruptores de mercado",
      position: "bottom-left",
      color: "#14B8A6",
      icon: "trending-up",
      fields: [
        {
          id: "inovador_acessivel_texto",
          type: "text_long",
          placeholder: "Ex: Xiaomi, Nubank, startups que democratizam tecnologia...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "tradicional_acessivel",
      label: "Tradicional + Acessível",
      description: "Baixa inovação e preço acessível — mercado de massa e commodities",
      position: "bottom-right",
      color: "#F97316",
      icon: "shopping-bag",
      fields: [
        {
          id: "tradicional_acessivel_texto",
          type: "text_long",
          placeholder: "Ex: Marcas genéricas, produtos de prateleira, soluções básicas...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const perceptualMapDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Mapa Perceptual foi salvo! Use essa análise para encontrar oportunidades de posicionamento.",
};
