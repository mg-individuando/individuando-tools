import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const radarTemplate: ToolSchema = {
  version: "1.0",
  layout: "radar",
  title: "Roda da Vida",
  description:
    "Avalie de 0 a 10 cada área da sua vida para ter uma visão completa do seu momento atual.",
  instructions:
    "Deslize ou clique para definir sua nota em cada área. Seja honesto consigo mesmo.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    { id: "saude", label: "Saúde", color: "#10B981", fields: [{ id: "saude_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "financas", label: "Finanças", color: "#F59E0B", fields: [{ id: "financas_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "carreira", label: "Carreira", color: "#3B82F6", fields: [{ id: "carreira_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "relacionamentos", label: "Relacionamentos", color: "#EC4899", fields: [{ id: "relacionamentos_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "familia", label: "Família", color: "#8B5CF6", fields: [{ id: "familia_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "desenvolvimento", label: "Desenvolvimento Pessoal", color: "#06B6D4", fields: [{ id: "desenvolvimento_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "lazer", label: "Lazer", color: "#F97316", fields: [{ id: "lazer_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
    { id: "espiritualidade", label: "Espiritualidade", color: "#14B8A6", fields: [{ id: "espiritualidade_score", type: "scale", min: 0, max: 10, step: 1, defaultValue: 5 }] },
  ],
};

export const radarDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Sua Roda da Vida foi salva! Use essa visão como ponto de partida para definir suas prioridades.",
};
