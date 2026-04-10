"use client";

import { useState, useMemo } from "react";
import type { Section, Field } from "@/lib/schemas/tool-schema";
import SectionIcon from "./SectionIcon";
import InlineEdit from "./InlineEdit";

interface SwotGridProps {
  sections: Section[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
  gridColumns?: number;
  onSectionClick?: (sectionIndex: number) => void;
  selectedSectionIndex?: number;
  onSectionUpdate?: (sectionIndex: number, updates: Partial<Section>) => void;
  onFieldUpdate?: (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => void;
}

const GRID_COLS_MAP: Record<number, string> = {
  1: "grid grid-cols-1 gap-4",
  2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
};

export default function SwotGrid({
  sections,
  values,
  onChange,
  readOnly = false,
  gridColumns,
  onSectionClick,
  selectedSectionIndex,
  onSectionUpdate,
  onFieldUpdate,
}: SwotGridProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isBuilder = !!onSectionUpdate;

  const positionOrder = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const orderedSections = useMemo(() => {
    const indexed = sections.map((s, i) => ({ section: s, originalIndex: i }));
    indexed.sort((a, b) => {
      const ai = positionOrder.indexOf(a.section.position || "");
      const bi = positionOrder.indexOf(b.section.position || "");
      // Sections without position go to the end
      const aVal = ai === -1 ? 999 : ai;
      const bVal = bi === -1 ? 999 : bi;
      return aVal - bVal;
    });
    return indexed;
  }, [sections]);

  const gridClass = GRID_COLS_MAP[gridColumns ?? 2] || GRID_COLS_MAP[2];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className={gridClass}>
        {orderedSections.map(({ section, originalIndex }) => {
          const field = section.fields[0];
          const color = section.color || "#0080ff";
          const isSelected = onSectionClick && selectedSectionIndex === originalIndex;
          const charCount = (values[field?.id || ""] || "").length;
          const maxLen = field?.maxLength || 0;

          return (
            <div
              key={section.id}
              className={`group overflow-hidden transition-all duration-200 ${onSectionClick ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-[#0080ff] ring-offset-2" : onSectionClick ? "hover:ring-1 hover:ring-[#0080ff]/30 hover:ring-offset-1" : ""}`}
              onClick={onSectionClick ? (e) => { e.stopPropagation(); onSectionClick(originalIndex); } : undefined}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(0,128,255,0.1)",
                boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
                borderRadius: "16px",
                borderLeft: `3px solid ${color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "rgba(0,128,255,0.16) 0px 8px 32px";
                e.currentTarget.style.borderColor = `rgba(0,128,255,0.2)`;
                e.currentTarget.style.borderLeftColor = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "rgba(0,128,255,0.08) 0px 4px 24px";
                e.currentTarget.style.borderColor = `rgba(0,128,255,0.1)`;
                e.currentTarget.style.borderLeftColor = color;
              }}
            >
              {/* Header */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    }}
                  >
                    {section.icon ? (
                      <SectionIcon icon={section.icon} size={18} className="text-white" />
                    ) : (
                      <span className="text-xs font-bold text-white">{section.label.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {isBuilder ? (
                      <>
                        <InlineEdit
                          value={section.label}
                          onChange={(v) => onSectionUpdate(originalIndex, { label: v })}
                          tag="h3"
                          className="font-semibold text-[15px] text-[#0f172a] leading-tight"
                          placeholder="Nome da seção"
                        />
                        <InlineEdit
                          value={section.description || ""}
                          onChange={(v) => onSectionUpdate(originalIndex, { description: v })}
                          tag="p"
                          className="text-[13px] text-[#475569] mt-0.5 leading-snug"
                          placeholder="Descrição da seção"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-[15px] text-[#0f172a] leading-tight">
                          {section.label}
                        </h3>
                        {section.description && (
                          <p className="text-[13px] text-[#475569] mt-0.5 leading-snug">
                            {section.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Input */}
              {field && (
                <div className="px-5 pb-4 flex-1 flex flex-col">
                  {/* Editable placeholder label in builder mode */}
                  {isBuilder && (
                    <div className="mb-1.5">
                      <InlineEdit
                        value={field.placeholder || ""}
                        onChange={(v) => onFieldUpdate!(originalIndex, 0, { placeholder: v })}
                        tag="span"
                        className="text-[11px] text-[#94a3b8] italic"
                        placeholder="Texto de exemplo (placeholder)"
                      />
                    </div>
                  )}
                  <textarea
                    value={values[field.id] || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    required={field.required}
                    readOnly={readOnly}
                    rows={5}
                    className="w-full glass-input resize-none"
                    onFocus={() => setFocusedField(field.id)}
                    onBlur={() => setFocusedField(null)}
                  />

                  {field.maxLength != null && field.maxLength > 0 && (
                    <div className="mt-1.5 text-right">
                      <span className={`text-[11px] tabular-nums ${maxLen > 0 && charCount / maxLen > 0.9 ? "text-red-500" : "text-[#94a3b8]"}`}>
                        {charCount}/{field.maxLength}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
