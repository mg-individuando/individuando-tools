import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const ikigaiTemplate: ToolSchema = {
  version: "1.0",
  layout: "ikigai",
  title: "Ikigai — Razão de Ser",
  description:
    "Descubra seu Ikigai explorando a interseção entre o que você ama, o que faz bem, o que o mundo precisa e pelo que pode ser pago.",
  instructions:
    "Preencha cada círculo e observe as interseções. Seu Ikigai está no centro, onde todos os elementos se encontram.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "ama",
      label: "O que você AMA",
      description: "Atividades, temas e causas que te enchem de energia",
      color: "#EC4899",
      icon: "heart",
      fields: [
        {
          id: "ama_texto",
          type: "text_long",
          placeholder: "Ex: Ensinar, criar, resolver problemas complexos, arte...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "bom",
      label: "O que você FAZ BEM",
      description: "Habilidades, talentos e competências reconhecidas",
      color: "#3B82F6",
      icon: "star",
      fields: [
        {
          id: "bom_texto",
          type: "text_long",
          placeholder: "Ex: Comunicação, análise de dados, liderança, escrita...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "mundo",
      label: "O que o MUNDO PRECISA",
      description: "Problemas reais que você pode ajudar a resolver",
      color: "#10B981",
      icon: "globe",
      fields: [
        {
          id: "mundo_texto",
          type: "text_long",
          placeholder: "Ex: Educação acessível, saúde mental, sustentabilidade...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "pago",
      label: "Pelo que podem te PAGAR",
      description: "Atividades com demanda de mercado e valor financeiro",
      color: "#F59E0B",
      icon: "banknote",
      fields: [
        {
          id: "pago_texto",
          type: "text_long",
          placeholder: "Ex: Consultoria, mentoria, desenvolvimento de software...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    // Interseções
    {
      id: "paixao",
      label: "Paixão",
      description: "Ama + Faz Bem",
      color: "#8B5CF6",
      fields: [
        {
          id: "paixao_texto",
          type: "text_long",
          placeholder: "O que surge quando você combina o que ama com o que faz bem?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "missao",
      label: "Missão",
      description: "Ama + Mundo Precisa",
      color: "#06B6D4",
      fields: [
        {
          id: "missao_texto",
          type: "text_long",
          placeholder: "Que missão emerge entre o que ama e o que o mundo precisa?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "vocacao",
      label: "Vocação",
      description: "Mundo Precisa + Pode ser Pago",
      color: "#14B8A6",
      fields: [
        {
          id: "vocacao_texto",
          type: "text_long",
          placeholder: "Que vocação surge entre necessidade do mundo e remuneração?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "profissao",
      label: "Profissão",
      description: "Faz Bem + Pode ser Pago",
      color: "#F97316",
      fields: [
        {
          id: "profissao_texto",
          type: "text_long",
          placeholder: "Que profissão surge entre o que faz bem e o que pode gerar renda?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "ikigai",
      label: "Seu IKIGAI",
      description: "A interseção de tudo — sua razão de ser",
      color: "#2D5A7B",
      icon: "sparkles",
      fields: [
        {
          id: "ikigai_texto",
          type: "text_long",
          placeholder: "Descreva o que surge quando tudo se encontra...",
          required: true,
          maxLength: 500,
        },
      ],
    },
  ],
};

export const ikigaiDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Ikigai foi salvo! Use essa reflexão como guia para alinhar propósito e carreira.",
};
