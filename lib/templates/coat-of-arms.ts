import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const coatOfArmsTemplate: ToolSchema = {
  version: "1.0",
  layout: "swot",
  title: "Brasão Pessoal (Coat of Arms)",
  description:
    "Crie seu brasão pessoal explorando conquistas, desafios, valores e o legado que deseja deixar.",
  instructions:
    "Preencha cada quadrante com reflexões profundas. Este é seu escudo — ele representa quem você é e quem quer se tornar.",
  theme: {
    primaryColor: "#B45309",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "conquista",
      label: "Maior Conquista",
      description: "Qual foi a realização que mais te orgulha? O momento em que você superou expectativas.",
      position: "top-left",
      color: "#D97706",
      icon: "trophy",
      fields: [
        {
          id: "conquista_texto",
          type: "text_long",
          placeholder: "Ex: Primeira graduação da família, superar uma doença, construir um negócio do zero...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "desafio",
      label: "Maior Desafio",
      description: "Qual foi o maior obstáculo que enfrentou? O que aprendeu com ele?",
      position: "top-right",
      color: "#DC2626",
      icon: "mountain",
      fields: [
        {
          id: "desafio_texto",
          type: "text_long",
          placeholder: "Ex: Perda de emprego, mudança de país, fim de relacionamento, fracasso em projeto...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "valores",
      label: "Meus Valores",
      description: "Quais princípios são inegociáveis na sua vida? O que te define?",
      position: "bottom-left",
      color: "#2563EB",
      icon: "shield",
      fields: [
        {
          id: "valores_texto",
          type: "text_long",
          placeholder: "Ex: Honestidade, família, liberdade, crescimento, empatia, coragem...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
    {
      id: "legado",
      label: "Meu Legado",
      description: "O que você quer deixar para o mundo? Como quer ser lembrado?",
      position: "bottom-right",
      color: "#16A34A",
      icon: "leaf",
      fields: [
        {
          id: "legado_texto",
          type: "text_long",
          placeholder: "Ex: Inspirar outros a empreender, criar impacto social, ser referência em educação...",
          required: true,
          maxLength: 1000,
        },
      ],
    },
  ],
};

export const coatOfArmsDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Brasão Pessoal foi salvo! Ele representa sua essência — volte a ele quando precisar de clareza.",
};
