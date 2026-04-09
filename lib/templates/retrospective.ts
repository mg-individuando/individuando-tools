import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const retrospectiveTemplate: ToolSchema = {
  version: "1.0",
  layout: "free_layout",
  title: "Retrospectiva",
  description:
    "Reflita sobre o que funcionou, o que pode melhorar e defina ações concretas para o próximo ciclo.",
  instructions:
    "Preencha cada seção com honestidade. Use a escala para avaliar a satisfação geral e liste ações práticas.",
  theme: {
    primaryColor: "#10B981",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "foi_bem",
      label: "O que foi bem",
      description: "Celebre as conquistas e identifique o que funcionou para repetir",
      color: "#10B981",
      icon: "thumbs-up",
      fields: [
        {
          id: "foi_bem_texto",
          type: "text_long",
          label: "Pontos positivos",
          placeholder: "Ex: Entrega no prazo, boa comunicação da equipe, qualidade do código, feedback positivo do cliente...",
          required: true,
          maxLength: 1000,
        },
        {
          id: "foi_bem_score",
          type: "scale",
          label: "Satisfação geral com os resultados",
          min: 1,
          max: 10,
          step: 1,
          defaultValue: 7,
        },
      ],
    },
    {
      id: "melhorar",
      label: "O que melhorar",
      description: "Identifique pontos de atenção e oportunidades de melhoria",
      color: "#F59E0B",
      icon: "alert-triangle",
      fields: [
        {
          id: "melhorar_texto",
          type: "text_long",
          label: "Pontos de melhoria",
          placeholder: "Ex: Estimativas imprecisas, falta de testes, comunicação com stakeholders, processos lentos...",
          required: true,
          maxLength: 1000,
        },
        {
          id: "melhorar_score",
          type: "scale",
          label: "Urgência das melhorias",
          min: 1,
          max: 10,
          step: 1,
          defaultValue: 5,
        },
      ],
    },
    {
      id: "acoes",
      label: "Ações para o Próximo Ciclo",
      description: "Defina ações concretas, com responsáveis e prazos",
      color: "#3B82F6",
      icon: "check-square",
      fields: [
        {
          id: "acoes_texto",
          type: "text_long",
          label: "Plano de ação",
          placeholder: "Ex: Implementar daily de 15min, criar checklist de deploy, agendar 1:1 semanal, automatizar testes...",
          required: true,
          maxLength: 1000,
        },
        {
          id: "acoes_score",
          type: "scale",
          label: "Confiança de que as ações serão executadas",
          min: 1,
          max: 10,
          step: 1,
          defaultValue: 7,
        },
      ],
    },
  ],
};

export const retrospectiveDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Sua Retrospectiva foi salva! Revise as ações no início do próximo ciclo para garantir a evolução.",
};
