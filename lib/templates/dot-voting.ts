import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const dotVotingTemplate: ToolSchema = {
  version: "1.0",
  layout: "free_layout",
  title: "Votação por Pontos (Dot Voting)",
  description:
    "Vote nas melhores ideias ou propostas usando uma escala de 1 a 5. Ideal para tomada de decisão em grupo.",
  instructions:
    "Avalie cada item de 1 (pouco relevante) a 5 (muito relevante) e adicione um comentário opcional justificando sua escolha.",
  theme: {
    primaryColor: "#6366F1",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "item_1",
      label: "Proposta 1",
      description: "Primeira opção para votação",
      color: "#6366F1",
      icon: "circle-dot",
      fields: [
        { id: "item_1_score", type: "scale", label: "Sua nota", min: 1, max: 5, step: 1, defaultValue: 3 },
        { id: "item_1_comment", type: "text_short", label: "Comentário", placeholder: "Por que essa nota?", maxLength: 200 },
      ],
    },
    {
      id: "item_2",
      label: "Proposta 2",
      description: "Segunda opção para votação",
      color: "#8B5CF6",
      icon: "circle-dot",
      fields: [
        { id: "item_2_score", type: "scale", label: "Sua nota", min: 1, max: 5, step: 1, defaultValue: 3 },
        { id: "item_2_comment", type: "text_short", label: "Comentário", placeholder: "Por que essa nota?", maxLength: 200 },
      ],
    },
    {
      id: "item_3",
      label: "Proposta 3",
      description: "Terceira opção para votação",
      color: "#A855F7",
      icon: "circle-dot",
      fields: [
        { id: "item_3_score", type: "scale", label: "Sua nota", min: 1, max: 5, step: 1, defaultValue: 3 },
        { id: "item_3_comment", type: "text_short", label: "Comentário", placeholder: "Por que essa nota?", maxLength: 200 },
      ],
    },
    {
      id: "item_4",
      label: "Proposta 4",
      description: "Quarta opção para votação",
      color: "#EC4899",
      icon: "circle-dot",
      fields: [
        { id: "item_4_score", type: "scale", label: "Sua nota", min: 1, max: 5, step: 1, defaultValue: 3 },
        { id: "item_4_comment", type: "text_short", label: "Comentário", placeholder: "Por que essa nota?", maxLength: 200 },
      ],
    },
    {
      id: "item_5",
      label: "Proposta 5",
      description: "Quinta opção para votação",
      color: "#F43F5E",
      icon: "circle-dot",
      fields: [
        { id: "item_5_score", type: "scale", label: "Sua nota", min: 1, max: 5, step: 1, defaultValue: 3 },
        { id: "item_5_comment", type: "text_short", label: "Comentário", placeholder: "Por que essa nota?", maxLength: 200 },
      ],
    },
    {
      id: "item_6",
      label: "Proposta 6",
      description: "Sexta opção para votação",
      color: "#F97316",
      icon: "circle-dot",
      fields: [
        { id: "item_6_score", type: "scale", label: "Sua nota", min: 1, max: 5, step: 1, defaultValue: 3 },
        { id: "item_6_comment", type: "text_short", label: "Comentário", placeholder: "Por que essa nota?", maxLength: 200 },
      ],
    },
  ],
};

export const dotVotingDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seus votos foram registrados! Os resultados serão consolidados para a tomada de decisão.",
};
