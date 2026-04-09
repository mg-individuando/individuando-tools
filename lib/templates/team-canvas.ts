import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const teamCanvasTemplate: ToolSchema = {
  version: "1.0",
  layout: "free_layout",
  title: "Team Canvas",
  description:
    "Alinhe sua equipe em torno de objetivos, valores, regras e papéis usando o Team Canvas — um framework visual para construção de times.",
  instructions:
    "Preencha cada seção com a equipe. Discutam juntos e busquem consenso antes de registrar.",
  theme: {
    primaryColor: "#0891B2",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "pessoas_papeis",
      label: "Pessoas e Papéis",
      description: "Quem faz parte da equipe e qual o papel de cada um?",
      color: "#6366F1",
      icon: "users",
      fields: [
        {
          id: "pessoas_nomes",
          type: "text_short",
          label: "Membros da equipe",
          placeholder: "Ex: Ana (líder), Carlos (dev), Marina (design)...",
          required: true,
          maxLength: 300,
        },
        {
          id: "pessoas_detalhes",
          type: "text_long",
          label: "Responsabilidades e expectativas",
          placeholder: "Descreva as responsabilidades de cada membro e o que se espera...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "objetivos",
      label: "Objetivos Comuns",
      description: "O que a equipe quer alcançar juntos?",
      color: "#10B981",
      icon: "target",
      fields: [
        {
          id: "objetivos_texto",
          type: "text_long",
          label: "Objetivos da equipe",
          placeholder: "Ex: Lançar MVP até março, aumentar NPS em 20 pontos, reduzir bugs críticos...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "valores",
      label: "Valores",
      description: "Quais princípios guiam o comportamento da equipe?",
      color: "#F59E0B",
      icon: "heart",
      fields: [
        {
          id: "valores_texto",
          type: "text_long",
          label: "Valores compartilhados",
          placeholder: "Ex: Transparência, respeito, autonomia, qualidade, colaboração...",
          required: true,
          maxLength: 500,
        },
      ],
    },
    {
      id: "regras_atividades",
      label: "Regras e Atividades",
      description: "Como a equipe trabalha no dia a dia? Quais são os rituais e acordos?",
      color: "#EC4899",
      icon: "clipboard-list",
      fields: [
        {
          id: "regras_texto",
          type: "text_short",
          label: "Acordos e rituais",
          placeholder: "Ex: Daily às 9h, code review obrigatório, sexta sem reunião...",
          maxLength: 300,
        },
        {
          id: "atividades_texto",
          type: "text_long",
          label: "Processos e fluxos de trabalho",
          placeholder: "Descreva como o trabalho flui: do backlog à entrega...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "forcas_recursos",
      label: "Forças e Recursos",
      description: "O que a equipe tem de melhor? Quais recursos estão disponíveis?",
      color: "#0EA5E9",
      icon: "shield-check",
      fields: [
        {
          id: "forcas_texto",
          type: "text_short",
          label: "Forças da equipe",
          placeholder: "Ex: Experiência técnica, diversidade, velocidade de entrega...",
          maxLength: 300,
        },
        {
          id: "recursos_texto",
          type: "text_long",
          label: "Recursos disponíveis",
          placeholder: "Ex: Orçamento de R$50k, acesso a mentores, ferramentas enterprise...",
          maxLength: 500,
        },
      ],
    },
  ],
};

export const teamCanvasDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Team Canvas foi salvo! Revisem juntos periodicamente para manter o alinhamento.",
};
