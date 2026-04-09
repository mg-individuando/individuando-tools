import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const howNowWowTemplate: ToolSchema = {
  version: "1.0",
  layout: "free_layout",
  title: "Matriz How-Now-Wow",
  description:
    "Classifique ideias por viabilidade e originalidade: ideias incrementais (How), prontas para execução (Now) e inovadoras e viáveis (Wow).",
  instructions:
    "Liste suas ideias em cada categoria. As ideias WOW são as que combinam inovação com viabilidade — priorize-as!",
  theme: {
    primaryColor: "#8B5CF6",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "how",
      label: "How (Como fazer?)",
      description: "Ideias inovadoras que precisam de mais pesquisa ou desenvolvimento — alto potencial, mas difícil execução",
      color: "#8B5CF6",
      icon: "lightbulb",
      fields: [
        {
          id: "how_texto",
          type: "text_long",
          placeholder: "Ex: Desenvolver IA para personalização, criar programa de embaixadores, novo modelo de negócio...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "now",
      label: "Now (Agora!)",
      description: "Ideias conhecidas e fáceis de implementar — baixa originalidade, mas prontas para ação imediata",
      color: "#10B981",
      icon: "play",
      fields: [
        {
          id: "now_texto",
          type: "text_long",
          placeholder: "Ex: Melhorar FAQ, otimizar formulário de contato, criar template de e-mail...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "wow",
      label: "Wow (Incrível!)",
      description: "Ideias inovadoras E viáveis — o ponto ideal entre criatividade e execução. Priorize estas!",
      color: "#F59E0B",
      icon: "sparkles",
      fields: [
        {
          id: "wow_texto",
          type: "text_long",
          placeholder: "Ex: Workshop interativo com clientes, gamificação do onboarding, parceria estratégica inédita...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const howNowWowDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Sua Matriz How-Now-Wow foi salva! Foque nas ideias WOW para gerar impacto com inovação viável.",
};
