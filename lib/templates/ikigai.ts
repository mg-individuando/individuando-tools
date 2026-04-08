import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const ikigaiTemplate: ToolSchema = {
  version: "1.0",
  layout: "ikigai",
  title: "Ikigai — Seu Propósito de Vida",
  description:
    "Descubra seu Ikigai explorando a interseção entre o que você ama, o que você faz bem, o que o mundo precisa e pelo que você pode ser pago.",
  instructions:
    "Preencha cada círculo e observe as interseções. Seu Ikigai está no centro, onde todos os elementos se encontram.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    // 4 círculos principais
    {
      id: "amo",
      label: "O que eu AMO",
      description: "Quais atividades te fazem perder a noção do tempo? O que te dá alegria?",
      position: "circle-top",
      color: "#EC4899",
      icon: "heart",
      fields: [
        {
          id: "amo_texto",
          type: "text_long",
          placeholder: "Ex: Ensinar, criar coisas novas, estar na natureza, música...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "bom",
      label: "O que eu faço BEM",
      description: "Quais são seus talentos e habilidades? O que as pessoas elogiam em você?",
      position: "circle-right",
      color: "#F59E0B",
      icon: "star",
      fields: [
        {
          id: "bom_texto",
          type: "text_long",
          placeholder: "Ex: Comunicação, liderança, análise, design, cozinhar...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "mundo",
      label: "O que o MUNDO precisa",
      description: "Que problemas você gostaria de resolver? Como você pode contribuir?",
      position: "circle-bottom",
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
      label: "Pelo que posso ser PAGO",
      description: "Que habilidades ou serviços geram valor no mercado?",
      position: "circle-left",
      color: "#3B82F6",
      icon: "banknote",
      fields: [
        {
          id: "pago_texto",
          type: "text_long",
          placeholder: "Ex: Consultoria, aulas, projetos, produtos digitais...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    // 4 interseções entre pares
    {
      id: "paixao",
      label: "Paixão",
      description: "Amo + Faço bem",
      position: "intersect-top-right",
      color: "#F97316",
      fields: [
        {
          id: "paixao_texto",
          type: "text_long",
          placeholder: "O que você ama E faz bem?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "missao",
      label: "Missão",
      description: "Amo + Mundo precisa",
      position: "intersect-top-left",
      color: "#8B5CF6",
      fields: [
        {
          id: "missao_texto",
          type: "text_long",
          placeholder: "O que você ama E o mundo precisa?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "vocacao",
      label: "Vocação",
      description: "Mundo precisa + Posso ser pago",
      position: "intersect-bottom-left",
      color: "#06B6D4",
      fields: [
        {
          id: "vocacao_texto",
          type: "text_long",
          placeholder: "O que o mundo precisa E pelo que posso ser pago?",
          maxLength: 300,
        },
      ],
    },
    {
      id: "profissao",
      label: "Profissão",
      description: "Faço bem + Posso ser pago",
      position: "intersect-bottom-right",
      color: "#14B8A6",
      fields: [
        {
          id: "profissao_texto",
          type: "text_long",
          placeholder: "O que faço bem E pelo que posso ser pago?",
          maxLength: 300,
        },
      ],
    },
    // Centro — O Ikigai
    {
      id: "ikigai",
      label: "Meu IKIGAI",
      description: "A interseção de tudo — seu propósito",
      position: "center",
      color: "#2D5A7B",
      icon: "compass",
      fields: [
        {
          id: "ikigai_texto",
          type: "text_long",
          placeholder: "Qual é o seu propósito? O que conecta tudo isso?",
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
    "Seu Ikigai foi salvo! Volte a ele sempre que precisar reconectar com seu propósito.",
};
