import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const swotTemplate: ToolSchema = {
  version: "1.0",
  layout: "swot",
  title: "Análise SWOT Pessoal",
  description:
    "Identifique seus pontos fortes, fraquezas, oportunidades e ameaças para criar um plano de desenvolvimento pessoal.",
  instructions:
    "Reflita sobre cada quadrante e escreva livremente. Não há respostas certas ou erradas.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "forcas",
      label: "Forças",
      description: "Quais são seus pontos fortes? O que você faz bem?",
      position: "top-left",
      color: "#10B981",
      icon: "shield-check",
      fields: [
        {
          id: "forcas_texto",
          type: "text_long",
          placeholder:
            "Ex: Boa comunicação, resiliência, criatividade, experiência em...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "fraquezas",
      label: "Fraquezas",
      description:
        "Quais aspectos você pode melhorar? O que te limita?",
      position: "top-right",
      color: "#F59E0B",
      icon: "alert-triangle",
      fields: [
        {
          id: "fraquezas_texto",
          type: "text_long",
          placeholder:
            "Ex: Procrastinação, dificuldade em delegar, impaciência...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "oportunidades",
      label: "Oportunidades",
      description:
        "Que oportunidades estão disponíveis? O que pode favorecer seu crescimento?",
      position: "bottom-left",
      color: "#3B82F6",
      icon: "lightbulb",
      fields: [
        {
          id: "oportunidades_texto",
          type: "text_long",
          placeholder:
            "Ex: Novo curso, networking, mudança de área, projeto...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "ameacas",
      label: "Ameaças",
      description:
        "Quais riscos ou obstáculos podem atrapalhar seus objetivos?",
      position: "bottom-right",
      color: "#EF4444",
      icon: "shield-alert",
      fields: [
        {
          id: "ameacas_texto",
          type: "text_long",
          placeholder:
            "Ex: Instabilidade no mercado, concorrência, falta de tempo...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const swotDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Obrigado por completar sua análise SWOT! Suas respostas foram salvas com sucesso.",
};
