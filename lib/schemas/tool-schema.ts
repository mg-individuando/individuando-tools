import { z } from "zod";

// Tipos de campo disponíveis
export const FieldType = z.enum([
  "text_short",
  "text_long",
  "scale",
  "checkbox",
  "radio",
  "date",
  "dropdown",
]);

// Definição de um campo individual
export const FieldSchema = z.object({
  id: z.string(),
  type: FieldType,
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});

// Seção de uma ferramenta
export const SectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  position: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  fields: z.array(FieldSchema),
});

// Tema visual
export const ThemeSchema = z.object({
  primaryColor: z.string().default("#2D5A7B"),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().default("#FFFFFF"),
  fontFamily: z.string().default("Inter"),
});

// Schema completo de uma ferramenta
export const ToolSchemaDefinition = z.object({
  version: z.string().default("1.0"),
  layout: z.enum([
    "swot",
    "radar",
    "ikigai",
    "category_grid",
    "dynamic_table",
    "free_layout",
    "blank",
  ]),
  title: z.string(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  theme: ThemeSchema.optional(),
  sections: z.array(SectionSchema),
});

// Tipos de template
export const TemplateType = z.enum([
  "swot",
  "radar",
  "ikigai",
  "category_grid",
  "dynamic_table",
  "free_layout",
  "blank",
]);

// Campo customizado de identificação
export const IdentificationFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  type: z.enum(["text", "dropdown"]).default("text"),
  options: z.array(z.string()).optional(), // para dropdown
});

// Configurações da ferramenta
export const ToolSettingsSchema = z.object({
  requireName: z.boolean().default(true),
  requireEmail: z.boolean().default(false),
  allowMultipleResponses: z.boolean().default(false),
  showProgressBar: z.boolean().default(false),
  confirmationMessage: z
    .string()
    .default("Obrigado por preencher! Suas respostas foram salvas."),
  welcomeMessage: z.string().optional(),
  identificationFields: z.array(IdentificationFieldSchema).optional(),
});

// Types exportados
export type FieldType = z.infer<typeof FieldType>;
export type Field = z.infer<typeof FieldSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ToolSchema = z.infer<typeof ToolSchemaDefinition>;
export type TemplateType = z.infer<typeof TemplateType>;
export type IdentificationField = z.infer<typeof IdentificationFieldSchema>;
export type ToolSettings = z.infer<typeof ToolSettingsSchema>;
