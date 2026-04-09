import { swotTemplate, swotDefaultSettings } from "./swot";
import { radarTemplate, radarDefaultSettings } from "./radar";
import { ikigaiTemplate, ikigaiDefaultSettings } from "./ikigai";
import { viaTemplate, viaDefaultSettings } from "./via";
import { metasTemplate, metasDefaultSettings } from "./metas";
import { moscowTemplate, moscowDefaultSettings } from "./moscow";
import { effortImpactTemplate, effortImpactDefaultSettings } from "./effort-impact";
import { howNowWowTemplate, howNowWowDefaultSettings } from "./how-now-wow";
import { dotVotingTemplate, dotVotingDefaultSettings } from "./dot-voting";
import { timelineTemplate, timelineDefaultSettings } from "./timeline";
import { teamCanvasTemplate, teamCanvasDefaultSettings } from "./team-canvas";
import { perceptualMapTemplate, perceptualMapDefaultSettings } from "./perceptual-map";
import { stakeholderMapTemplate, stakeholderMapDefaultSettings } from "./stakeholder-map";
import { retrospectiveTemplate, retrospectiveDefaultSettings } from "./retrospective";
import { visionBoardTemplate, visionBoardDefaultSettings } from "./vision-board";
import { coatOfArmsTemplate, coatOfArmsDefaultSettings } from "./coat-of-arms";
import { riskMapTemplate, riskMapDefaultSettings } from "./risk-map";
import { mindMapTemplate, mindMapDefaultSettings } from "./mind-map";
import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";

export interface TemplateDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  schema: ToolSchema;
  defaultSettings: ToolSettings;
}

export const templates: Record<string, TemplateDefinition> = {
  swot: {
    type: "swot",
    name: "Análise SWOT Pessoal",
    description: "4 quadrantes para mapear forças, fraquezas, oportunidades e ameaças",
    icon: "grid-2x2",
    schema: swotTemplate,
    defaultSettings: swotDefaultSettings,
  },
  radar: {
    type: "radar",
    name: "Roda da Vida",
    description: "Gráfico radar interativo para avaliar áreas da vida de 0 a 10",
    icon: "target",
    schema: radarTemplate,
    defaultSettings: radarDefaultSettings,
  },
  ikigai: {
    type: "ikigai",
    name: "Ikigai — Razão de Ser",
    description: "Diagrama de 4 círculos sobrepostos para descobrir seu propósito de vida",
    icon: "circle-dot",
    schema: ikigaiTemplate,
    defaultSettings: ikigaiDefaultSettings,
  },
  category_grid: {
    type: "category_grid",
    name: "Forças Pessoais (VIA)",
    description: "Grid de categorias com checkboxes para identificar suas forças de caráter",
    icon: "layout-grid",
    schema: viaTemplate,
    defaultSettings: viaDefaultSettings,
  },
  dynamic_table: {
    type: "dynamic_table",
    name: "Planejamento de Metas",
    description: "Tabela dinâmica para definir metas, prazos, ações e indicadores",
    icon: "table",
    schema: metasTemplate,
    defaultSettings: metasDefaultSettings,
  },
  moscow: {
    type: "category_grid",
    name: "Priorização MoSCoW",
    description: "Classifique requisitos por prioridade: Must, Should, Could e Won't Have",
    icon: "list-ordered",
    schema: moscowTemplate,
    defaultSettings: moscowDefaultSettings,
  },
  effort_impact: {
    type: "swot",
    name: "Matriz Esforço × Impacto",
    description: "4 quadrantes para priorizar tarefas pela relação esforço vs. impacto",
    icon: "activity",
    schema: effortImpactTemplate,
    defaultSettings: effortImpactDefaultSettings,
  },
  how_now_wow: {
    type: "free_layout",
    name: "Matriz How-Now-Wow",
    description: "Classifique ideias por viabilidade e originalidade para priorizar inovação",
    icon: "sparkles",
    schema: howNowWowTemplate,
    defaultSettings: howNowWowDefaultSettings,
  },
  dot_voting: {
    type: "free_layout",
    name: "Votação por Pontos (Dot Voting)",
    description: "Vote em propostas de 1 a 5 para tomada de decisão colaborativa",
    icon: "circle-dot",
    schema: dotVotingTemplate,
    defaultSettings: dotVotingDefaultSettings,
  },
  timeline: {
    type: "dynamic_table",
    name: "Linha do Tempo",
    description: "Tabela para mapear marcos, eventos e momentos-chave cronologicamente",
    icon: "calendar",
    schema: timelineTemplate,
    defaultSettings: timelineDefaultSettings,
  },
  team_canvas: {
    type: "free_layout",
    name: "Team Canvas",
    description: "Alinhe a equipe em objetivos, valores, papéis, regras e recursos",
    icon: "users",
    schema: teamCanvasTemplate,
    defaultSettings: teamCanvasDefaultSettings,
  },
  perceptual_map: {
    type: "swot",
    name: "Mapa Perceptual",
    description: "4 quadrantes para análise comparativa de posicionamento de marcas e produtos",
    icon: "map",
    schema: perceptualMapTemplate,
    defaultSettings: perceptualMapDefaultSettings,
  },
  stakeholder_map: {
    type: "category_grid",
    name: "Mapa de Stakeholders",
    description: "Mapeie partes interessadas por influência e interesse para engajamento estratégico",
    icon: "network",
    schema: stakeholderMapTemplate,
    defaultSettings: stakeholderMapDefaultSettings,
  },
  retrospective: {
    type: "free_layout",
    name: "Retrospectiva",
    description: "Reflita sobre acertos, melhorias e defina ações para o próximo ciclo",
    icon: "rotate-ccw",
    schema: retrospectiveTemplate,
    defaultSettings: retrospectiveDefaultSettings,
  },
  vision_board: {
    type: "free_layout",
    name: "Quadro de Visão (Vision Board)",
    description: "Mapa visual do futuro desejado: visão, valores, metas e desapegos",
    icon: "eye",
    schema: visionBoardTemplate,
    defaultSettings: visionBoardDefaultSettings,
  },
  coat_of_arms: {
    type: "swot",
    name: "Brasão Pessoal (Coat of Arms)",
    description: "4 quadrantes para mapear conquistas, desafios, valores e legado pessoal",
    icon: "shield",
    schema: coatOfArmsTemplate,
    defaultSettings: coatOfArmsDefaultSettings,
  },
  risk_map: {
    type: "dynamic_table",
    name: "Mapa de Riscos",
    description: "Tabela para identificar, avaliar e planejar mitigação de riscos",
    icon: "alert-triangle",
    schema: riskMapTemplate,
    defaultSettings: riskMapDefaultSettings,
  },
  mind_map: {
    type: "free_layout",
    name: "Mapa Mental",
    description: "Organize ideias de forma hierárquica a partir de um tema central e 6 ramos",
    icon: "git-branch",
    schema: mindMapTemplate,
    defaultSettings: mindMapDefaultSettings,
  },
};

export function getTemplate(type: string): TemplateDefinition | undefined {
  return templates[type];
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}
