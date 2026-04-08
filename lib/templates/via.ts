import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const viaTemplate: ToolSchema = {
  version: "1.0",
  layout: "category_grid",
  title: "Forças Pessoais (VIA)",
  description:
    "Identifique suas forças de caráter com base na classificação VIA (Values in Action). Selecione as que mais representam você.",
  instructions:
    "Leia cada força e marque as que você reconhece em si mesmo. Não há limite — marque todas que se aplicam.",
  theme: {
    primaryColor: "#2D5A7B",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "sabedoria",
      label: "Sabedoria e Conhecimento",
      description: "Forças cognitivas que envolvem aquisição e uso do conhecimento",
      color: "#3B82F6",
      icon: "book-open",
      fields: [
        { id: "criatividade", type: "checkbox", label: "Criatividade — Pensar em maneiras novas e produtivas de fazer as coisas" },
        { id: "curiosidade", type: "checkbox", label: "Curiosidade — Interesse em explorar e descobrir coisas novas" },
        { id: "discernimento", type: "checkbox", label: "Discernimento — Pensar sobre as coisas e examiná-las por todos os ângulos" },
        { id: "amor_aprendizado", type: "checkbox", label: "Amor pelo aprendizado — Dominar novas habilidades e tópicos" },
        { id: "perspectiva", type: "checkbox", label: "Perspectiva — Oferecer conselhos sábios para os outros" },
      ],
    },
    {
      id: "coragem",
      label: "Coragem",
      description: "Forças emocionais que envolvem o exercício da vontade para atingir objetivos",
      color: "#EF4444",
      icon: "flame",
      fields: [
        { id: "bravura", type: "checkbox", label: "Bravura — Não recuar diante de ameaças, desafios ou dor" },
        { id: "perseveranca", type: "checkbox", label: "Perseverança — Terminar o que começa, persistir apesar de obstáculos" },
        { id: "integridade", type: "checkbox", label: "Integridade — Falar a verdade e apresentar-se de forma genuína" },
        { id: "vitalidade", type: "checkbox", label: "Vitalidade — Abordar a vida com entusiasmo e energia" },
      ],
    },
    {
      id: "humanidade",
      label: "Humanidade",
      description: "Forças interpessoais que envolvem cuidar e aproximar-se dos outros",
      color: "#EC4899",
      icon: "users",
      fields: [
        { id: "amor", type: "checkbox", label: "Amor — Valorizar relações próximas com os outros" },
        { id: "bondade", type: "checkbox", label: "Bondade — Fazer favores e boas ações para os outros" },
        { id: "inteligencia_social", type: "checkbox", label: "Inteligência Social — Estar consciente dos motivos e sentimentos dos outros" },
      ],
    },
    {
      id: "justica",
      label: "Justiça",
      description: "Forças cívicas que fundamentam a vida comunitária saudável",
      color: "#F59E0B",
      icon: "scale",
      fields: [
        { id: "cidadania", type: "checkbox", label: "Cidadania — Trabalhar bem como membro de um grupo ou equipe" },
        { id: "equidade", type: "checkbox", label: "Equidade — Tratar todas as pessoas de forma justa e igualitária" },
        { id: "lideranca", type: "checkbox", label: "Liderança — Organizar atividades do grupo e fazer com que aconteçam" },
      ],
    },
    {
      id: "temperanca",
      label: "Temperança",
      description: "Forças que protegem contra excessos",
      color: "#10B981",
      icon: "shield",
      fields: [
        { id: "perdao", type: "checkbox", label: "Perdão — Perdoar aqueles que erraram, dar segundas chances" },
        { id: "humildade", type: "checkbox", label: "Humildade — Deixar suas realizações falarem por si" },
        { id: "prudencia", type: "checkbox", label: "Prudência — Ser cuidadoso com suas escolhas, não assumir riscos desnecessários" },
        { id: "autocontrole", type: "checkbox", label: "Autocontrole — Regular o que sente e faz, ser disciplinado" },
      ],
    },
    {
      id: "transcendencia",
      label: "Transcendência",
      description: "Forças que conectam ao universo maior e fornecem significado",
      color: "#8B5CF6",
      icon: "sparkles",
      fields: [
        { id: "apreciacao_beleza", type: "checkbox", label: "Apreciação da Beleza — Perceber e apreciar beleza e excelência" },
        { id: "gratidao", type: "checkbox", label: "Gratidão — Estar consciente e grato pelas coisas boas que acontecem" },
        { id: "esperanca", type: "checkbox", label: "Esperança — Esperar o melhor do futuro e trabalhar para alcançá-lo" },
        { id: "humor", type: "checkbox", label: "Humor — Gostar de rir e brincar, trazer sorrisos aos outros" },
        { id: "espiritualidade", type: "checkbox", label: "Espiritualidade — Ter crenças coerentes sobre propósito e significado" },
      ],
    },
  ],
};

export const viaDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Suas forças pessoais foram registradas! Use esse mapa para potencializar o que há de melhor em você.",
};
