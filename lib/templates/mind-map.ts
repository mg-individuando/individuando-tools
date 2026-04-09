import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const mindMapTemplate: ToolSchema = {
  version: "1.0",
  layout: "free_layout",
  title: "Mapa Mental",
  description:
    "Organize ideias de forma visual e hierárquica a partir de um tema central e seus desdobramentos.",
  instructions:
    "Comece pelo tema central e expanda para os ramos. Cada ramo pode ter subtópicos e ideias associadas.",
  theme: {
    primaryColor: "#6366F1",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "tema_central",
      label: "Tema Central",
      description: "O assunto principal do seu mapa mental",
      color: "#6366F1",
      icon: "circle-dot",
      fields: [
        {
          id: "tema_titulo",
          type: "text_short",
          label: "Tema principal",
          placeholder: "Ex: Plano de Marketing 2025, Minha Carreira, Novo Produto...",
          required: true,
          maxLength: 200,
        },
        {
          id: "tema_descricao",
          type: "text_long",
          label: "Contexto e objetivo",
          placeholder: "Descreva o contexto e o que você espera explorar com este mapa...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "ramo_1",
      label: "Ramo 1",
      description: "Primeiro desdobramento do tema central",
      color: "#EC4899",
      icon: "git-branch",
      fields: [
        {
          id: "ramo_1_subtopico",
          type: "text_short",
          label: "Subtópico",
          placeholder: "Ex: Público-alvo, Tecnologia, Orçamento...",
          required: true,
          maxLength: 200,
        },
        {
          id: "ramo_1_ideias",
          type: "text_long",
          label: "Ideias e conexões",
          placeholder: "Liste ideias, referências e conexões com outros temas...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "ramo_2",
      label: "Ramo 2",
      description: "Segundo desdobramento do tema central",
      color: "#F59E0B",
      icon: "git-branch",
      fields: [
        {
          id: "ramo_2_subtopico",
          type: "text_short",
          label: "Subtópico",
          placeholder: "Ex: Canais de distribuição, Processos, Equipe...",
          required: true,
          maxLength: 200,
        },
        {
          id: "ramo_2_ideias",
          type: "text_long",
          label: "Ideias e conexões",
          placeholder: "Liste ideias, referências e conexões com outros temas...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "ramo_3",
      label: "Ramo 3",
      description: "Terceiro desdobramento do tema central",
      color: "#10B981",
      icon: "git-branch",
      fields: [
        {
          id: "ramo_3_subtopico",
          type: "text_short",
          label: "Subtópico",
          placeholder: "Ex: Cronograma, Métricas, Inspirações...",
          required: true,
          maxLength: 200,
        },
        {
          id: "ramo_3_ideias",
          type: "text_long",
          label: "Ideias e conexões",
          placeholder: "Liste ideias, referências e conexões com outros temas...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "ramo_4",
      label: "Ramo 4",
      description: "Quarto desdobramento do tema central",
      color: "#0EA5E9",
      icon: "git-branch",
      fields: [
        {
          id: "ramo_4_subtopico",
          type: "text_short",
          label: "Subtópico",
          placeholder: "Ex: Riscos, Parcerias, Inovação...",
          required: true,
          maxLength: 200,
        },
        {
          id: "ramo_4_ideias",
          type: "text_long",
          label: "Ideias e conexões",
          placeholder: "Liste ideias, referências e conexões com outros temas...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "ramo_5",
      label: "Ramo 5",
      description: "Quinto desdobramento do tema central",
      color: "#8B5CF6",
      icon: "git-branch",
      fields: [
        {
          id: "ramo_5_subtopico",
          type: "text_short",
          label: "Subtópico",
          placeholder: "Ex: Recursos, Aprendizados, Próximos Passos...",
          required: true,
          maxLength: 200,
        },
        {
          id: "ramo_5_ideias",
          type: "text_long",
          label: "Ideias e conexões",
          placeholder: "Liste ideias, referências e conexões com outros temas...",
          maxLength: 500,
        },
      ],
    },
    {
      id: "ramo_6",
      label: "Ramo 6",
      description: "Sexto desdobramento do tema central",
      color: "#F97316",
      icon: "git-branch",
      fields: [
        {
          id: "ramo_6_subtopico",
          type: "text_short",
          label: "Subtópico",
          placeholder: "Ex: Referências, Concorrência, Tendências...",
          required: true,
          maxLength: 200,
        },
        {
          id: "ramo_6_ideias",
          type: "text_long",
          label: "Ideias e conexões",
          placeholder: "Liste ideias, referências e conexões com outros temas...",
          maxLength: 500,
        },
      ],
    },
  ],
};

export const mindMapDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Mapa Mental foi salvo! Use-o como ponto de partida para aprofundar cada ramo.",
};
