"use client";

import { useState, useRef, useEffect } from "react";
import type { ToolSchema, Section, Field } from "@/lib/schemas/tool-schema";
import { generateSectionId, generateFieldId, pickNextColor } from "@/lib/schemas/tool-schema";
import ToolRenderer from "@/components/tools/ToolRenderer";
import IconPicker from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Type,
  Save,
  Undo2,
  Pencil,
  Trash2,
  Plus,
  Copy,
  ChevronUp,
  ChevronDown,
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
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<number | null>(null);
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

  const addField = (sectionIndex: number) => {
    const newSections = [...schema.sections];
    const section = newSections[sectionIndex];
    const newId = `${section.id}_item_${Date.now().toString(36)}`;
    const fieldType = section.fields[0]?.type || "checkbox";
    const newField: Field = {
      id: newId,
      type: fieldType,
      label: "Novo item",
    };
    newSections[sectionIndex] = {
      ...section,
      fields: [...section.fields, newField],
    };
    onChange({ ...schema, sections: newSections });
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...schema.sections];
    const section = newSections[sectionIndex];
    if (section.fields.length <= 1) return;
    const newFields = section.fields.filter((_, i) => i !== fieldIndex);
    newSections[sectionIndex] = { ...section, fields: newFields };
    onChange({ ...schema, sections: newSections });
    // If the deleted field was selected, deselect
    if (selected?.type === "field" && selected.sectionIndex === sectionIndex && selected.fieldIndex === fieldIndex) {
      setSelected({ type: "section", sectionIndex });
    }
  };

  // ── Section management ──────────────────────────────

  const sectionMgmtEnabled = schema.layout !== "ikigai" && schema.layout !== "dynamic_table";

  const minSections = (schema.layout === "swot" || schema.layout === "radar") ? 2 : 1;

  const addSection = () => {
    if (!sectionMgmtEnabled) return;
    const lastSection = schema.sections[schema.sections.length - 1];
    const newSectionId = generateSectionId();
    const newFields: Field[] = (lastSection?.fields || []).map((f) => ({
      ...f,
      id: generateFieldId(newSectionId),
      label: f.label ? "Novo item" : undefined,
      placeholder: f.placeholder,
    }));
    if (newFields.length === 0) {
      newFields.push({ id: generateFieldId(newSectionId), type: "text_long", label: "Conteúdo" });
    }
    const newSection: Section = {
      id: newSectionId,
      label: "Nova Seção",
      description: "",
      color: pickNextColor(schema.sections),
      icon: lastSection?.icon || "layers",
      fields: newFields,
    };
    onChange({ ...schema, sections: [...schema.sections, newSection] });
    setSelected({ type: "section", sectionIndex: schema.sections.length });
  };

  const removeSection = (index: number) => {
    if (!sectionMgmtEnabled) return;
    if (schema.sections.length <= minSections) return;
    const newSections = schema.sections.filter((_, i) => i !== index);
    onChange({ ...schema, sections: newSections });
    if (selected?.type === "section" && selected.sectionIndex === index) {
      setSelected({ type: "tool" });
    } else if (selected?.type === "section" && selected.sectionIndex > index) {
      setSelected({ type: "section", sectionIndex: selected.sectionIndex - 1 });
    }
  };

  const duplicateSection = (index: number) => {
    if (!sectionMgmtEnabled) return;
    const source = schema.sections[index];
    const newSectionId = generateSectionId();
    const clone: Section = {
      ...JSON.parse(JSON.stringify(source)),
      id: newSectionId,
      label: `${source.label} (cópia)`,
      color: pickNextColor(schema.sections),
      fields: source.fields.map((f) => ({
        ...JSON.parse(JSON.stringify(f)),
        id: generateFieldId(newSectionId),
      })),
    };
    // Remove position so it doesn't conflict in swot layout
    delete (clone as any).position;
    const newSections = [...schema.sections];
    newSections.splice(index + 1, 0, clone);
    onChange({ ...schema, sections: newSections });
    setSelected({ type: "section", sectionIndex: index + 1 });
  };

  const reorderSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schema.sections.length) return;
    const newSections = [...schema.sections];
    // For swot layout, swap positions too
    if (schema.layout === "swot" && newSections[index].position && newSections[targetIndex].position) {
      const tempPos = newSections[index].position;
      newSections[index] = { ...newSections[index], position: newSections[targetIndex].position };
      newSections[targetIndex] = { ...newSections[targetIndex], position: tempPos };
    }
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    onChange({ ...schema, sections: newSections });
    setSelected({ type: "section", sectionIndex: targetIndex });
  };

  const handleReset = () => {
    onChange(JSON.parse(JSON.stringify(originalSchema)));
    setSelected({ type: "tool" });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] gap-0 rounded-xl border bg-white overflow-hidden">
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
          {/* Inline-editable title */}
          <div className="text-center mb-6">
            <InlineText
              value={schema.title}
              onChange={(v) => onChange({ ...schema, title: v })}
              onFocus={() => setSelected({ type: "tool" })}
              className="text-xl font-bold inline-block"
              style={{ color: schema.theme?.primaryColor }}
              placeholder="Título da ferramenta"
              as="h2"
            />
            {(schema.description || selected?.type === "tool") && (
              <InlineText
                value={schema.description || ""}
                onChange={(v) => onChange({ ...schema, description: v })}
                onFocus={() => setSelected({ type: "tool" })}
                className="text-gray-500 mt-2 text-sm inline-block"
                placeholder="Descrição (clique para editar)"
                multiline
              />
            )}
            {(schema.instructions || selected?.type === "tool") && (
              <InlineText
                value={schema.instructions || ""}
                onChange={(v) => onChange({ ...schema, instructions: v })}
                onFocus={() => setSelected({ type: "tool" })}
                className="text-xs text-gray-400 mt-2 italic inline-block"
                placeholder="Instruções (clique para editar)"
                multiline
              />
            )}
          </div>

          {/* Tool sections with inline editing */}
          <ToolRenderer
            schema={schema}
            readOnly={false}
            onSectionClick={(si) => setSelected({ type: "section", sectionIndex: si })}
            selectedSectionIndex={selected?.type === "section" ? selected.sectionIndex : undefined}
            onSectionUpdate={updateSection}
            onFieldUpdate={updateField}
            onFieldAdd={addField}
            onFieldRemove={removeField}
          />

          {/* Add Section button */}
          {sectionMgmtEnabled && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" size="sm" onClick={addSection} className="text-xs">
                <Plus className="w-3 h-3 mr-1" /> Adicionar Seção
              </Button>
            </div>
          )}
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
              {/* Grid columns selector — only for grid-based layouts */}
              {["swot", "category_grid", "free_layout"].includes(schema.layout) && (
                <>
                  <Separator />
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Layout</h4>
                  <div className="space-y-2">
                    <Label className="text-xs">Colunas do Grid</Label>
                    <select
                      value={schema.gridColumns ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange({ ...schema, gridColumns: val ? parseInt(val) : undefined });
                      }}
                      className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Automático</option>
                      <option value="2">2 colunas</option>
                      <option value="3">3 colunas</option>
                      <option value="4">4 colunas</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {/* Section properties */}
          {selected?.type === "section" && (() => {
            const section = schema.sections[selected.sectionIndex];
            if (!section) return null;
            const si = selected.sectionIndex;
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: section.color }} />
                  <span className="text-sm font-semibold flex-1 truncate">{section.label}</span>
                </div>
                {/* Section action buttons */}
                {sectionMgmtEnabled && (
                  <div className="flex gap-1 mb-3">
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] px-1" onClick={() => reorderSection(si, "up")} disabled={si === 0} title="Mover para cima">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] px-1" onClick={() => reorderSection(si, "down")} disabled={si === schema.sections.length - 1} title="Mover para baixo">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] px-1" onClick={() => duplicateSection(si)} title="Duplicar seção">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] px-1 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeSection(si)} disabled={schema.sections.length <= minSections} title="Remover seção">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
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
                  <div className="flex items-center gap-2">
                    {section.icon && section.icon.startsWith("http") ? (
                      <img
                        src={section.icon}
                        alt="Ícone"
                        className="w-8 h-8 rounded-lg border bg-white p-0.5 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg border bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">
                        {section.icon || "—"}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setIconPickerTarget(selected.sectionIndex);
                        setShowIconPicker(true);
                      }}
                    >
                      Buscar Ícone
                    </Button>
                  </div>
                  <Input
                    value={section.icon || ""}
                    onChange={(e) => updateSection(selected.sectionIndex, { icon: e.target.value })}
                    placeholder="URL ou nome do ícone"
                    className="text-xs font-mono"
                  />
                </div>
                <Separator />
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Itens</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => addField(selected.sectionIndex)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                </Button>
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
                <Separator />
                {section.fields.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => removeField(selected.sectionIndex, selected.fieldIndex)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remover Item
                  </Button>
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

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          value={
            iconPickerTarget !== null
              ? schema.sections[iconPickerTarget]?.icon
              : undefined
          }
          onSelect={(url, name) => {
            if (iconPickerTarget !== null) {
              updateSection(iconPickerTarget, { icon: url });
            }
            setShowIconPicker(false);
            setIconPickerTarget(null);
          }}
          onClose={() => {
            setShowIconPicker(false);
            setIconPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Inline Click-to-Edit Text Component ───────────────────── */
function InlineText({
  value,
  onChange,
  onFocus,
  className = "",
  style,
  placeholder,
  multiline = false,
  as: Tag = "p",
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  as?: "h2" | "p" | "span";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  }

  if (editing) {
    const shared = {
      ref: inputRef as any,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: handleKeyDown,
      className: `w-full bg-white border border-[#0080ff]/30 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-[#0080ff]/20 focus:border-[#0080ff] outline-none transition-all ${className}`,
      style,
      placeholder,
    };

    return multiline ? (
      <textarea {...shared} rows={2} />
    ) : (
      <input type="text" {...shared} />
    );
  }

  return (
    <Tag
      onClick={() => {
        setEditing(true);
        onFocus?.();
      }}
      className={`cursor-pointer rounded-lg px-2 py-0.5 transition-all hover:bg-[#0080ff]/5 hover:ring-1 hover:ring-[#0080ff]/20 group relative ${className}`}
      style={style}
      title="Clique para editar"
    >
      {value || <span className="opacity-40">{placeholder}</span>}
      <Pencil className="w-3 h-3 text-[#0080ff]/40 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Tag>
  );
}
