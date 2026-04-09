import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const visionBoardTemplate: ToolSchema = {
  version: "1.0",
  layout: "free_layout",
  title: "Quadro de Visão (Vision Board)",
  description:
    "Crie um mapa visual do seu futuro desejado: visão, valores, metas de curto e longo prazo, e o que precisa soltar.",
  instructions:
    "Preencha cada seção com intenção. Seja específico nas metas e honesto sobre o que precisa deixar para trás.",
  theme: {
    primaryColor: "#8B5CF6",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "visao",
      label: "Minha Visão",
      description: "Como é a vida que você quer viver? Descreva com detalhes o seu futuro ideal.",
      color: "#8B5CF6",
      icon: "eye",
      fields: [
        {
          id: "visao_texto",
          type: "text_long",
          label: "Minha visão de futuro",
          placeholder: "Descreva como será sua vida ideal: onde estará, o que fará, como se sentirá...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "valores",
      label: "Meus Valores",
      description: "Quais princípios e valores guiam suas decisões e prioridades?",
      color: "#EC4899",
      icon: "heart",
      fields: [
        {
          id: "valores_lista",
          type: "text_short",
          label: "Valores essenciais",
          placeholder: "Ex: Liberdade, família, criatividade, saúde, integridade...",
          required: true,
          maxLength: 300,
        },
        {
          id: "valores_detalhe",
          type: "text_long",
          label: "O que cada valor significa na prática?",
          placeholder: "Descreva como esses valores se manifestam no seu dia a dia...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "metas_1_ano",
      label: "Metas para 1 Ano",
      description: "O que você quer conquistar nos próximos 12 meses?",
      color: "#10B981",
      icon: "calendar",
      fields: [
        {
          id: "metas_1_texto",
          type: "text_long",
          label: "Metas de curto prazo",
          placeholder: "Ex: Trocar de emprego, economizar R$20k, correr uma meia-maratona, lançar projeto pessoal...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "metas_5_anos",
      label: "Metas para 5 Anos",
      description: "Onde você quer estar daqui a 5 anos?",
      color: "#0EA5E9",
      icon: "compass",
      fields: [
        {
          id: "metas_5_texto",
          type: "text_long",
          label: "Metas de longo prazo",
          placeholder: "Ex: Ter meu próprio negócio, morar fora, ser referência na minha área, independência financeira...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "soltar",
      label: "O que Preciso Soltar",
      description: "Quais hábitos, crenças ou situações estão te impedindo de avançar?",
      color: "#F59E0B",
      icon: "wind",
      fields: [
        {
          id: "soltar_texto",
          type: "text_long",
          label: "Desapegos necessários",
          placeholder: "Ex: Medo de julgamento, perfeccionismo, relações tóxicas, procrastinação, zona de conforto...",
          required: true,
          maxLength: 500,
        },
      ],
    },
  ],
};

export const visionBoardDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Quadro de Visão foi salvo! Revisem-no regularmente para manter foco e motivação.",
};
