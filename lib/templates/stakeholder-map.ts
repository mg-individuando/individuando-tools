import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const stakeholderMapTemplate: ToolSchema = {
  version: "1.0",
  layout: "category_grid",
  title: "Mapa de Stakeholders",
  description:
    "Mapeie partes interessadas por nível de influência e interesse para definir a melhor estratégia de engajamento.",
  instructions:
    "Classifique cada stakeholder no quadrante correto. Marque os que se aplicam ao seu projeto.",
  theme: {
    primaryColor: "#DC2626",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "gerenciar_perto",
      label: "Gerenciar de Perto",
      description: "Alta influência + Alto interesse — Engaje ativamente e mantenha satisfeitos",
      color: "#DC2626",
      icon: "eye",
      fields: [
        { id: "gp_1", type: "checkbox", label: "Patrocinador executivo do projeto" },
        { id: "gp_2", type: "checkbox", label: "Diretor da área impactada" },
        { id: "gp_3", type: "checkbox", label: "Cliente principal ou estratégico" },
        { id: "gp_4", type: "checkbox", label: "Líder técnico responsável pela entrega" },
        { id: "gp_5", type: "checkbox", label: "Regulador ou órgão fiscalizador" },
      ],
    },
    {
      id: "manter_satisfeito",
      label: "Manter Satisfeito",
      description: "Alta influência + Baixo interesse — Informe sem sobrecarregar",
      color: "#F59E0B",
      icon: "megaphone",
      fields: [
        { id: "ms_1", type: "checkbox", label: "CEO / Alta liderança" },
        { id: "ms_2", type: "checkbox", label: "Conselho de administração" },
        { id: "ms_3", type: "checkbox", label: "Investidores ou acionistas" },
        { id: "ms_4", type: "checkbox", label: "Parceiros estratégicos externos" },
        { id: "ms_5", type: "checkbox", label: "Líderes de outros departamentos" },
      ],
    },
    {
      id: "manter_informado",
      label: "Manter Informado",
      description: "Baixa influência + Alto interesse — Comunique e ouça feedbacks",
      color: "#3B82F6",
      icon: "mail",
      fields: [
        { id: "mi_1", type: "checkbox", label: "Equipe de desenvolvimento e operações" },
        { id: "mi_2", type: "checkbox", label: "Usuários finais do produto/serviço" },
        { id: "mi_3", type: "checkbox", label: "Equipe de suporte e atendimento" },
        { id: "mi_4", type: "checkbox", label: "Comunidade e grupos de interesse" },
        { id: "mi_5", type: "checkbox", label: "Fornecedores diretos" },
      ],
    },
    {
      id: "monitorar",
      label: "Monitorar",
      description: "Baixa influência + Baixo interesse — Acompanhe sem esforço excessivo",
      color: "#10B981",
      icon: "activity",
      fields: [
        { id: "mon_1", type: "checkbox", label: "Público geral e imprensa" },
        { id: "mon_2", type: "checkbox", label: "Concorrentes indiretos" },
        { id: "mon_3", type: "checkbox", label: "Fornecedores secundários" },
        { id: "mon_4", type: "checkbox", label: "Equipes de áreas não impactadas" },
        { id: "mon_5", type: "checkbox", label: "Consultores e assessores externos" },
      ],
    },
  ],
};

export const stakeholderMapDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Seu Mapa de Stakeholders foi salvo! Use-o para definir estratégias de comunicação e engajamento.",
};
