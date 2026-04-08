import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const categoryGridTemplate: ToolSchema = {
  version: "1.0",
  layout: "category_grid",
  title: "Forças Pessoais (VIA)",
  description:
    "Identifique suas forças de caráter usando a classificação VIA. Selecione as forças que mais te representam em cada categoria.",
  instructions:
    "Marque as forças que você reconhece em si. Não existe certo ou errado — seja honesto sobre quem você é.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "sabedoria",
      label: "Sabedoria",
      description: "Forças cognitivas que envolvem aquisição e uso do conhecimento",
      color: "#3B82F6",
      icon: "brain",
      fields: [
        { id: "criatividade", type: "checkbox", label: "Criatividade" },
        { id: "curiosidade", type: "checkbox", label: "Curiosidade" },
        { id: "discernimento", type: "checkbox", label: "Discernimento" },
        { id: "amor_aprender", type: "checkbox", label: "Amor pelo aprendizado" },
        { id: "perspectiva", type: "checkbox", label: "Perspectiva" },
      ],
    },
    {
      id: "coragem",
      label: "Coragem",
      description: "Forças emocionais para alcançar objetivos diante de oposição",
      color: "#EF4444",
      icon: "flame",
      fields: [
        { id: "bravura", type: "checkbox", label: "Bravura" },
        { id: "perseveranca", type: "checkbox", label: "Perseverança" },
        { id: "integridade", type: "checkbox", label: "Integridade" },
        { id: "vitalidade", type: "checkbox", label: "Vitalidade" },
      ],
    },
    {
      id: "humanidade",
      label: "Humanidade",
      description: "Forças interpessoais de cuidado e amizade",
      color: "#EC4899",
      icon: "hand-heart",
      fields: [
        { id: "amor", type: "checkbox", label: "Amor" },
        { id: "bondade", type: "checkbox", label: "Bondade" },
        { id: "inteligencia_social", type: "checkbox", label: "Inteligência social" },
      ],
    },
    {
      id: "justica",
      label: "Justiça",
      description: "Forças cívicas para uma vida comunitária saudável",
      color: "#F59E0B",
      icon: "scale",
      fields: [
        { id: "trabalho_equipe", type: "checkbox", label: "Trabalho em equipe" },
        { id: "equidade", type: "checkbox", label: "Equidade" },
        { id: "lideranca", type: "checkbox", label: "Liderança" },
      ],
    },
    {
      id: "temperanca",
      label: "Temperança",
      description: "Forças que protegem contra excessos",
      color: "#8B5CF6",
      icon: "shield",
      fields: [
        { id: "perdao", type: "checkbox", label: "Perdão" },
        { id: "humildade", type: "checkbox", label: "Humildade" },
        { id: "prudencia", type: "checkbox", label: "Prudência" },
        { id: "autocontrole", type: "checkbox", label: "Autocontrole" },
      ],
    },
    {
      id: "transcendencia",
      label: "Transcendência",
      description: "Forças que conectam ao universo maior e dão significado",
      color: "#14B8A6",
      icon: "sparkles",
      fields: [
        { id: "apreciacao_beleza", type: "checkbox", label: "Apreciação da beleza" },
        { id: "gratidao", type: "checkbox", label: "Gratidão" },
        { id: "esperanca", type: "checkbox", label: "Esperança" },
        { id: "humor", type: "checkbox", label: "Humor" },
        { id: "espiritualidade_via", type: "checkbox", label: "Espiritualidade" },
      ],
    },
  ],
};

export const categoryGridDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Suas forças pessoais foram salvas! Observe quais categorias têm mais forças marcadas — elas revelam seus valores centrais.",
};
