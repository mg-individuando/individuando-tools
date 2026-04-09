import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const timelineTemplate: ToolSchema = {
  version: "1.0",
  layout: "dynamic_table",
  title: "Linha do Tempo",
  description:
    "Mapeie marcos, eventos e momentos-chave em uma linha do tempo para visualizar a trajetória e planejar próximos passos.",
  instructions:
    "Adicione um evento por linha. Organize em ordem cronológica e descreva o impacto de cada momento.",
  theme: {
    primaryColor: "#0EA5E9",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "eventos",
      label: "Eventos e Marcos",
      description: "Registre cada momento importante da sua trajetória",
      color: "#0EA5E9",
      icon: "calendar",
      fields: [
        {
          id: "marco",
          type: "text_short",
          label: "Marco / Evento",
          placeholder: "Ex: Início do projeto, lançamento do produto, promoção...",
          required: true,
          maxLength: 200,
        },
        {
          id: "data",
          type: "text_short",
          label: "Data",
          placeholder: "Ex: Jan/2024, Q1 2025, Semana 12...",
          maxLength: 50,
        },
        {
          id: "descricao",
          type: "text_long",
          label: "Descrição",
          placeholder: "O que aconteceu? Qual foi o contexto?",
          maxLength: 500,
        },
        {
          id: "impacto",
          type: "text_short",
          label: "Impacto",
          placeholder: "Ex: Alto, Médio, Baixo — ou descreva o resultado",
          maxLength: 200,
        },
      ],
    },
  ],
};

export const timelineDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Sua Linha do Tempo foi salva! Use essa visão para identificar padrões e planejar o futuro.",
};
