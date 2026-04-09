import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const riskMapTemplate: ToolSchema = {
  version: "1.0",
  layout: "dynamic_table",
  title: "Mapa de Riscos",
  description:
    "Identifique, avalie e planeje mitigação para os riscos do seu projeto ou iniciativa.",
  instructions:
    "Adicione um risco por linha. Avalie probabilidade e impacto, e defina um plano de mitigação claro.",
  theme: {
    primaryColor: "#DC2626",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "riscos",
      label: "Registro de Riscos",
      description: "Mapeie cada risco com sua avaliação e plano de resposta",
      color: "#DC2626",
      icon: "alert-triangle",
      fields: [
        {
          id: "risco",
          type: "text_short",
          label: "Risco",
          placeholder: "Ex: Atraso na entrega do fornecedor, perda de membro-chave da equipe...",
          required: true,
          maxLength: 200,
        },
        {
          id: "probabilidade",
          type: "text_short",
          label: "Probabilidade",
          placeholder: "Ex: Alta, Média, Baixa — ou percentual estimado",
          maxLength: 100,
        },
        {
          id: "impacto",
          type: "text_short",
          label: "Impacto",
          placeholder: "Ex: Crítico, Alto, Médio, Baixo — ou valor estimado",
          maxLength: 100,
        },
        {
          id: "mitigacao",
          type: "text_long",
          label: "Plano de Mitigação",
          placeholder: "O que fazer para reduzir a probabilidade ou o impacto? Quem é responsável?",
          maxLength: 500,
        },
      ],
    },
  ],
};

export const riskMapDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Mapa de Riscos foi salvo! Revise-o regularmente e atualize conforme novos riscos surgirem.",
};
