import { swotTemplate, swotDefaultSettings } from "./swot";
import { radarTemplate, radarDefaultSettings } from "./radar";
import { ikigaiTemplate, ikigaiDefaultSettings } from "./ikigai";
import { viaTemplate, viaDefaultSettings } from "./via";
import { metasTemplate, metasDefaultSettings } from "./metas";
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
