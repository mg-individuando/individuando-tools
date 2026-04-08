import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const metasTemplate: ToolSchema = {
  version: "1.0",
  layout: "dynamic_table",
  title: "Planejamento de Metas",
  description:
    "Estruture suas metas com clareza: defina prazos, ações concretas, recursos necessários e indicadores de sucesso.",
  instructions:
    "Adicione uma meta por linha. Seja específico e realista. Você pode adicionar quantas metas quiser.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "metas",
      label: "Minhas Metas",
      description: "Adicione suas metas e detalhe o plano para cada uma",
      color: "#2D5A7B",
      icon: "target",
      fields: [
        {
          id: "meta",
          type: "text_short",
          label: "Meta",
          placeholder: "O que você quer alcançar?",
          required: true,
          maxLength: 200,
        },
        {
          id: "prazo",
          type: "text_short",
          label: "Prazo",
          placeholder: "Até quando?",
          maxLength: 50,
        },
        {
          id: "acoes",
          type: "text_long",
          label: "Ações",
          placeholder: "Quais passos concretos você vai dar?",
          maxLength: 500,
        },
        {
          id: "recursos",
          type: "text_short",
          label: "Recursos",
          placeholder: "O que você precisa? (tempo, dinheiro, pessoas, ferramentas...)",
          maxLength: 300,
        },
        {
          id: "indicador",
          type: "text_short",
          label: "Indicador",
          placeholder: "Como vai saber que alcançou?",
          maxLength: 200,
        },
      ],
    },
  ],
};

export const metasDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu plano de metas foi salvo! Revise periodicamente e celebre cada conquista.",
};
