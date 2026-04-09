"use client";

import { useMemo } from "react";
import type { Section, Field } from "@/lib/schemas/tool-schema";
import { Check, Plus, X } from "lucide-react";
import SectionIcon from "./SectionIcon";
import InlineEdit from "./InlineEdit";

interface CategoryGridProps {
  sections: Section[];
  values: Record<string, boolean>;
  onChange: (fieldId: string, value: boolean) => void;
  readOnly?: boolean;
  onSectionClick?: (sectionIndex: number) => void;
  selectedSectionIndex?: number;
  onSectionUpdate?: (sectionIndex: number, updates: Partial<Section>) => void;
  onFieldUpdate?: (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => void;
  onFieldAdd?: (sectionIndex: number) => void;
  onFieldRemove?: (sectionIndex: number, fieldIndex: number) => void;
}

export default function CategoryGrid({
  sections,
  values,
  onChange,
  readOnly = false,
  onSectionClick,
  selectedSectionIndex,
  onSectionUpdate,
  onFieldUpdate,
  onFieldAdd,
  onFieldRemove,
}: CategoryGridProps) {
  const totalSelected = Object.values(values).filter(Boolean).length;
  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);
  const isBuilder = !!onSectionUpdate;

  // Detect if any section title has a very long word (>15 chars) — if so, use 2 cols max
  const hasLongWord = useMemo(() => {
    return sections.some((s) =>
      s.label.split(/\s+/).some((word) => word.length > 15)
    );
  }, [sections]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Summary bar */}
      <div
        className="mb-6 p-5 flex items-center justify-between transition-all duration-200"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(0,128,255,0.1)",
          boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
          borderRadius: "16px",
        }}
      >
        <span className="text-[13px] font-medium text-[#475569]">
          Forcas selecionadas
        </span>
        <span className="text-sm font-bold text-[#0f172a]">
          {totalSelected} de {totalFields}
        </span>
      </div>

      {/* Category cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${hasLongWord ? "" : "lg:grid-cols-3"} gap-5`}>
        {sections.map((section, sectionIndex) => {
          const selectedInCategory = section.fields.filter(
            (f) => values[f.id]
          ).length;
          const color = section.color || "#0080ff";
          const isSelected = onSectionClick && selectedSectionIndex === sectionIndex;

          return (
            <div
              key={section.id}
              className={`overflow-hidden transition-all duration-200 ${onSectionClick ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-[#0080ff] ring-offset-2" : onSectionClick ? "hover:ring-1 hover:ring-[#0080ff]/30 hover:ring-offset-1" : ""}`}
              onClick={onSectionClick ? (e) => { e.stopPropagation(); onSectionClick(sectionIndex); } : undefined}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(0,128,255,0.1)",
                boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
                borderRadius: "16px",
                borderTop: `3px solid ${color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "rgba(0,128,255,0.16) 0px 8px 32px";
                e.currentTarget.style.borderColor = "rgba(0,128,255,0.2)";
                e.currentTarget.style.borderTopColor = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "rgba(0,128,255,0.08) 0px 4px 24px";
                e.currentTarget.style.borderColor = "rgba(0,128,255,0.1)";
                e.currentTarget.style.borderTopColor = color;
              }}
            >
              <div className="p-5">
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    }}
                  >
                    <SectionIcon icon={section.icon} size={18} className="text-white" />
                  </div>
                  {isBuilder ? (
                    <InlineEdit
                      value={section.label}
                      onChange={(v) => onSectionUpdate!(sectionIndex, { label: v })}
                      tag="h3"
                      className="font-semibold text-[15px] text-[#0f172a] flex-1 min-w-0"
                      placeholder="Nome da categoria"
                    />
                  ) : (
                    <h3 className="font-semibold text-[15px] text-[#0f172a] flex-1 min-w-0 break-words leading-snug">
                      {section.label}
                    </h3>
                  )}
                  <span
                    className="rounded-full text-xs px-2.5 py-0.5 font-semibold shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}18, ${color}10)`,
                      color,
                    }}
                  >
                    {selectedInCategory}/{section.fields.length}
                  </span>
                </div>

                {isBuilder ? (
                  <div className="ml-[50px]">
                    <InlineEdit
                      value={section.description || ""}
                      onChange={(v) => onSectionUpdate!(sectionIndex, { description: v })}
                      tag="p"
                      className="text-[13px] text-[#475569] mb-3 leading-relaxed"
                      placeholder="Descrição da categoria"
                    />
                  </div>
                ) : section.description ? (
                  <p className="text-[13px] text-[#475569] mb-3 leading-relaxed ml-[50px]">
                    {section.description}
                  </p>
                ) : null}

                {/* Checkbox list */}
                <div className="space-y-1">
                  {section.fields.map((field, fieldIndex) => {
                    const isChecked = !!values[field.id];

                    return (
                      <div
                        key={field.id}
                        className={`flex items-start gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
                          isChecked
                            ? "bg-white/60"
                            : "hover:bg-white/40"
                        }`}
                      >
                        {/* Checkbox */}
                        <label className="relative flex-shrink-0 mt-0.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              onChange(field.id, e.target.checked)
                            }
                            disabled={readOnly}
                            className="sr-only peer"
                          />
                          <div
                            className="w-[18px] h-[18px] rounded flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: isChecked ? color : "transparent",
                              border: isChecked
                                ? "none"
                                : "2px solid rgba(0,128,255,0.2)",
                            }}
                          >
                            {isChecked && (
                              <Check
                                className="w-3 h-3 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </label>

                        {isBuilder ? (
                          <InlineEdit
                            value={field.label || ""}
                            onChange={(v) => onFieldUpdate!(sectionIndex, fieldIndex, { label: v })}
                            tag="span"
                            className={`text-sm leading-snug flex-1 min-w-0 ${isChecked ? "text-[#0f172a] font-medium" : "text-[#475569]"}`}
                            placeholder="Label do item"
                          />
                        ) : (
                          <span
                            className={`text-sm leading-snug flex-1 min-w-0 cursor-pointer ${
                              isChecked
                                ? "text-[#0f172a] font-medium"
                                : "text-[#475569]"
                            }`}
                            onClick={() => onChange(field.id, !isChecked)}
                          >
                            {field.label}
                          </span>
                        )}

                        {/* Delete item button — builder only */}
                        {isBuilder && onFieldRemove && section.fields.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFieldRemove(sectionIndex, fieldIndex);
                            }}
                            className="shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                            title="Remover item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add item button — builder only */}
                  {isBuilder && onFieldAdd && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFieldAdd(sectionIndex);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 hover:bg-white/40 w-full"
                      style={{ color }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar item
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected strengths summary */}
      {totalSelected > 0 && (
        <div
          className="mt-6 p-5 transition-all duration-200"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(0,128,255,0.1)",
            boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
            borderRadius: "16px",
          }}
        >
          <h4 className="font-semibold text-[15px] text-[#0f172a] mb-3">
            Suas forcas selecionadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {sections.flatMap((section) =>
              section.fields
                .filter((f) => values[f.id])
                .map((f) => {
                  const c = section.color || "#0080ff";
                  return (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${c}14, ${c}08)`,
                        color: c,
                      }}
                    >
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                      {f.label?.split("\u2014")[0]?.trim()}
                    </span>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
