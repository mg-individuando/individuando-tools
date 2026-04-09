import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export const moscowTemplate: ToolSchema = {
  version: "1.0",
  layout: "category_grid",
  title: "Priorização MoSCoW",
  description:
    "Classifique requisitos e tarefas por prioridade usando o método MoSCoW: Must, Should, Could e Won't.",
  instructions:
    "Marque os itens que se aplicam ao seu projeto ou contexto. Use como guia para decisões de priorização.",
  theme: {
    primaryColor: "#DC2626",
    fontFamily: "Inter",
    backgroundColor: "#F8FAFC",
  },
  sections: [
    {
      id: "must_have",
      label: "Must Have (Essencial)",
      description: "Requisitos obrigatórios — sem eles, o projeto não funciona",
      color: "#DC2626",
      icon: "alert-circle",
      fields: [
        { id: "must_1", type: "checkbox", label: "Funcionalidade principal entregue e testada" },
        { id: "must_2", type: "checkbox", label: "Requisitos legais e de compliance atendidos" },
        { id: "must_3", type: "checkbox", label: "Segurança e proteção de dados garantidas" },
        { id: "must_4", type: "checkbox", label: "Integração com sistemas críticos funcionando" },
        { id: "must_5", type: "checkbox", label: "Experiência mínima do usuário validada" },
      ],
    },
    {
      id: "should_have",
      label: "Should Have (Importante)",
      description: "Requisitos importantes — agregam muito valor, mas não são bloqueadores",
      color: "#F59E0B",
      icon: "arrow-up",
      fields: [
        { id: "should_1", type: "checkbox", label: "Relatórios e dashboards disponíveis" },
        { id: "should_2", type: "checkbox", label: "Notificações e alertas configurados" },
        { id: "should_3", type: "checkbox", label: "Documentação técnica atualizada" },
        { id: "should_4", type: "checkbox", label: "Testes automatizados implementados" },
        { id: "should_5", type: "checkbox", label: "Treinamento da equipe realizado" },
      ],
    },
    {
      id: "could_have",
      label: "Could Have (Desejável)",
      description: "Requisitos desejáveis — melhoram a experiência, mas podem esperar",
      color: "#3B82F6",
      icon: "thumbs-up",
      fields: [
        { id: "could_1", type: "checkbox", label: "Personalização visual e temas" },
        { id: "could_2", type: "checkbox", label: "Exportação de dados em múltiplos formatos" },
        { id: "could_3", type: "checkbox", label: "Integrações com ferramentas secundárias" },
        { id: "could_4", type: "checkbox", label: "Modo offline ou cache avançado" },
        { id: "could_5", type: "checkbox", label: "Gamificação e elementos motivacionais" },
      ],
    },
    {
      id: "wont_have",
      label: "Won't Have (Não Agora)",
      description: "Requisitos descartados neste ciclo — podem ser reconsiderados depois",
      color: "#6B7280",
      icon: "x-circle",
      fields: [
        { id: "wont_1", type: "checkbox", label: "Funcionalidades experimentais não validadas" },
        { id: "wont_2", type: "checkbox", label: "Suporte a plataformas secundárias" },
        { id: "wont_3", type: "checkbox", label: "Inteligência artificial e automação avançada" },
        { id: "wont_4", type: "checkbox", label: "Redesign completo da interface" },
        { id: "wont_5", type: "checkbox", label: "Internacionalização para novos idiomas" },
      ],
    },
  ],
};

export const moscowDefaultSettings: ToolSettings = {
  requireName: true,
  requireEmail: false,
  allowMultipleResponses: false,
  showProgressBar: false,
  confirmationMessage:
    "Sua priorização MoSCoW foi salva! Use esse mapa para alinhar expectativas e focar no essencial.",
};
