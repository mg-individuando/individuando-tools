"use client";

import { useState } from "react";
import type { ToolSchema, Section, Field } from "@/lib/schemas/tool-schema";
import ToolRenderer from "@/components/tools/ToolRenderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Type,
  AlignLeft,
  ChevronRight,
  Save,
  Undo2,
} from "lucide-react";

interface BuilderPanelProps {
  schema: ToolSchema;
  onChange: (schema: ToolSchema) => void;
  onSave: () => void;
  saving: boolean;
}

type SelectedItem =
  | { type: "tool"; }
  | { type: "section"; sectionIndex: number }
  | { type: "field"; sectionIndex: number; fieldIndex: number }
  | null;

export default function BuilderPanel({ schema, onChange, onSave, saving }: BuilderPanelProps) {
  const [selected, setSelected] = useState<SelectedItem>({ type: "tool" });
  const [originalSchema] = useState<ToolSchema>(JSON.parse(JSON.stringify(schema)));

  const defaultTheme = { primaryColor: "#2D5A7B", backgroundColor: "#FFFFFF", fontFamily: "Inter" };

  const updateTheme = (updates: Record<string, string>) => {
    onChange({ ...schema, theme: { ...defaultTheme, ...schema.theme, ...updates } });
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const newSections = [...schema.sections];
    newSections[index] = { ...newSections[index], ...updates };
    onChange({ ...schema, sections: newSections });
  };

  const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => {
    const newSections = [...schema.sections];
    const newFields = [...newSections[sectionIndex].fields];
    newFields[fieldIndex] = { ...newFields[fieldIndex], ...updates };
    newSections[sectionIndex] = { ...newSections[sectionIndex], fields: newFields };
    onChange({ ...schema, sections: newSections });
  };

  const handleReset = () => {
    onChange(JSON.parse(JSON.stringify(originalSchema)));
    setSelected({ type: "tool" });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] gap-0 rounded-xl border bg-white overflow-hidden">
      {/* Left Panel — Blocks/Sections palette */}
      <div className="w-64 flex-shrink-0 border-r bg-gray-50/50 overflow-y-auto">
        <div className="p-3 border-b bg-white">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Estrutura
          </h3>
        </div>

        {/* Tool-level settings */}
        <button
          onClick={() => setSelected({ type: "tool" })}
          className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors
            ${selected?.type === "tool" ? "bg-[#2D5A7B]/10 text-[#2D5A7B] font-medium" : "hover:bg-gray-100 text-gray-700"}`}
        >
          <AlignLeft className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Ferramenta</span>
          <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />
        </button>

        <Separator />

        <div className="p-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Seções
          </h4>
        </div>

        {schema.sections.map((section, si) => (
          <div key={section.id}>
            <button
              onClick={() => setSelected({ type: "section", sectionIndex: si })}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
                ${selected?.type === "section" && selected.sectionIndex === si
                  ? "bg-[#2D5A7B]/10 text-[#2D5A7B] font-medium"
                  : "hover:bg-gray-100 text-gray-700"}`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: section.color || "#9ca3af" }}
              />
              <span className="truncate">{section.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-50" />
            </button>

            {/* Fields within section */}
            {section.fields.map((field, fi) => (
              <button
                key={field.id}
                onClick={() => setSelected({ type: "field", sectionIndex: si, fieldIndex: fi })}
                className={`w-full text-left pl-8 pr-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                  ${selected?.type === "field" && selected.sectionIndex === si && selected.fieldIndex === fi
                    ? "bg-[#2D5A7B]/10 text-[#2D5A7B] font-medium"
                    : "hover:bg-gray-100 text-gray-500"}`}
              >
                <Type className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{field.label || field.id}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Center Panel — Live Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-3 border-b bg-white flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Preview ao Vivo
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <Undo2 className="w-3 h-3 mr-1" /> Resetar
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving} className="bg-[#2D5A7B] hover:bg-[#1e4260]">
              <Save className="w-3 h-3 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: schema.theme?.primaryColor }}>
              {schema.title}
            </h2>
            {schema.description && <p className="text-gray-500 mt-2 text-sm">{schema.description}</p>}
            {schema.instructions && <p className="text-xs text-gray-400 mt-2 italic">{schema.instructions}</p>}
          </div>
          <ToolRenderer schema={schema} readOnly={false} />
        </div>
      </div>

      {/* Right Panel — Properties */}
      <div className="w-72 flex-shrink-0 border-l overflow-y-auto">
        <div className="p-3 border-b bg-white">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Propriedades
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Tool-level properties */}
          {selected?.type === "tool" && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Título da Ferramenta</Label>
                <Input
                  value={schema.title}
                  onChange={(e) => onChange({ ...schema, title: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={schema.description || ""}
                  onChange={(e) => onChange({ ...schema, description: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Instruções</Label>
                <Textarea
                  value={schema.instructions || ""}
                  onChange={(e) => onChange({ ...schema, instructions: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>
              <Separator />
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Tema</h4>
              <div className="space-y-2">
                <Label className="text-xs">Cor Principal</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={schema.theme?.primaryColor || "#2D5A7B"}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <Input
                    value={schema.theme?.primaryColor || "#2D5A7B"}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="text-sm font-mono flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cor de Fundo</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={schema.theme?.backgroundColor || "#FFFFFF"}
                    onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <Input
                    value={schema.theme?.backgroundColor || "#FFFFFF"}
                    onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                    className="text-sm font-mono flex-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Section properties */}
          {selected?.type === "section" && (() => {
            const section = schema.sections[selected.sectionIndex];
            if (!section) return null;
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: section.color }} />
                  <span className="text-sm font-semibold">{section.label}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={section.label}
                    onChange={(e) => updateSection(selected.sectionIndex, { label: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea
                    value={section.description || ""}
                    onChange={(e) => updateSection(selected.sectionIndex, { description: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Cor</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={section.color || "#9ca3af"}
                      onChange={(e) => updateSection(selected.sectionIndex, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={section.color || ""}
                      onChange={(e) => updateSection(selected.sectionIndex, { color: e.target.value })}
                      className="text-sm font-mono flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Ícone</Label>
                  <Input
                    value={section.icon || ""}
                    onChange={(e) => updateSection(selected.sectionIndex, { icon: e.target.value })}
                    placeholder="Ex: heart, star, shield"
                    className="text-sm"
                  />
                </div>
              </>
            );
          })()}

          {/* Field properties */}
          {selected?.type === "field" && (() => {
            const section = schema.sections[selected.sectionIndex];
            const field = section?.fields[selected.fieldIndex];
            if (!field) return null;
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold">{field.label || field.id}</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Tipo: <code className="bg-gray-100 px-1 py-0.5 rounded">{field.type}</code> &middot; ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{field.id}</code>
                </div>
                {field.label !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={field.label || ""}
                      onChange={(e) => updateField(selected.sectionIndex, selected.fieldIndex, { label: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                )}
                {(field.type === "text_short" || field.type === "text_long") && (
                  <div className="space-y-2">
                    <Label className="text-xs">Placeholder</Label>
                    <Textarea
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(selected.sectionIndex, selected.fieldIndex, { placeholder: e.target.value })}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                )}
                {field.maxLength !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-xs">Max. Caracteres</Label>
                    <Input
                      type="number"
                      value={field.maxLength || ""}
                      onChange={(e) => updateField(selected.sectionIndex, selected.fieldIndex, { maxLength: parseInt(e.target.value) || undefined })}
                      className="text-sm"
                    />
                  </div>
                )}
                {field.type === "scale" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Mín</Label>
                        <Input
                          type="number"
                          value={field.min ?? 0}
                          onChange={(e) => updateField(selected.sectionIndex, selected.fieldIndex, { min: parseInt(e.target.value) })}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Máx</Label>
                        <Input
                          type="number"
                          value={field.max ?? 10}
                          onChange={(e) => updateField(selected.sectionIndex, selected.fieldIndex, { max: parseInt(e.target.value) })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Valor Padrão</Label>
                      <Input
                        type="number"
                        value={(field.defaultValue as number) ?? ""}
                        onChange={(e) => updateField(selected.sectionIndex, selected.fieldIndex, { defaultValue: parseInt(e.target.value) })}
                        className="text-sm"
                      />
                    </div>
                  </>
                )}
              </>
            );
          })()}

          {!selected && (
            <p className="text-sm text-gray-400 text-center py-8">
              Selecione um elemento na estrutura para editar suas propriedades.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
