import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const dynamicTableTemplate: ToolSchema = {
  version: "1.0",
  layout: "dynamic_table",
  title: "Planejamento de Metas",
  description:
    "Defina suas metas com clareza: o que quer alcançar, quando, como e como medir o progresso.",
  instructions:
    "Adicione uma meta por linha. Seja específico em cada coluna — metas claras têm mais chance de se realizar.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "metas",
      label: "Metas",
      description: "Suas metas e planos de ação",
      fields: [
        {
          id: "meta",
          type: "text_short",
          label: "Meta",
          placeholder: "O que você quer alcançar?",
          required: true,
        },
        {
          id: "prazo",
          type: "text_short",
          label: "Prazo",
          placeholder: "Até quando?",
        },
        {
          id: "acoes",
          type: "text_short",
          label: "Ações",
          placeholder: "O que vai fazer para chegar lá?",
        },
        {
          id: "recursos",
          type: "text_short",
          label: "Recursos",
          placeholder: "O que precisa?",
        },
        {
          id: "indicador",
          type: "text_short",
          label: "Indicador",
          placeholder: "Como vai medir o progresso?",
        },
      ],
    },
  ],
};

export const dynamicTableDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu planejamento de metas foi salvo! Revise periodicamente e ajuste conforme avança.",
};
