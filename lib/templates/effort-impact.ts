import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const effortImpactTemplate: ToolSchema = {
  version: "1.0",
  layout: "swot",
  title: "Matriz Esforço × Impacto",
  description:
    "Classifique iniciativas e tarefas pela relação entre esforço necessário e impacto esperado para priorizar com inteligência.",
  instructions:
    "Distribua suas ideias nos 4 quadrantes. Comece pelas Vitórias Rápidas e questione os Ralos de Tempo.",
  theme: {
    primaryColor: "#10B981",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "quick_wins",
      label: "Vitórias Rápidas",
      description: "Baixo esforço + Alto impacto — Faça primeiro!",
      position: "top-left",
      color: "#10B981",
      icon: "zap",
      fields: [
        {
          id: "quick_wins_texto",
          type: "text_long",
          placeholder: "Ex: Automatizar relatório semanal, ajustar copy da landing page, corrigir bug crítico...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "big_projects",
      label: "Grandes Projetos",
      description: "Alto esforço + Alto impacto — Planeje e execute com cuidado",
      position: "top-right",
      color: "#3B82F6",
      icon: "rocket",
      fields: [
        {
          id: "big_projects_texto",
          type: "text_long",
          placeholder: "Ex: Rebranding completo, novo produto, migração de plataforma...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "fill_ins",
      label: "Tarefas de Preenchimento",
      description: "Baixo esforço + Baixo impacto — Faça quando sobrar tempo",
      position: "bottom-left",
      color: "#F59E0B",
      icon: "clock",
      fields: [
        {
          id: "fill_ins_texto",
          type: "text_long",
          placeholder: "Ex: Organizar pastas, atualizar foto do perfil, pequenos ajustes visuais...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "time_sinks",
      label: "Ralos de Tempo",
      description: "Alto esforço + Baixo impacto — Evite ou delegue",
      position: "bottom-right",
      color: "#EF4444",
      icon: "trash-2",
      fields: [
        {
          id: "time_sinks_texto",
          type: "text_long",
          placeholder: "Ex: Relatórios que ninguém lê, reuniões sem pauta, perfeccionismo em detalhes irrelevantes...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const effortImpactDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Sua Matriz Esforço × Impacto foi salva! Foque nas vitórias rápidas e elimine os ralos de tempo.",
};
