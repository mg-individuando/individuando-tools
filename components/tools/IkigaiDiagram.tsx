"use client";

import { useState } from "react";
import type { Section, Field } from "@/lib/schemas/tool-schema";
import { ChevronDown } from "lucide-react";
import SectionIcon from "./SectionIcon";
import InlineEdit from "./InlineEdit";

const circleColors: Record<string, string> = {
  "circle-top": "#EC4899",
  "circle-right": "#F59E0B",
  "circle-bottom": "#10B981",
  "circle-left": "#3B82F6",
};

interface IkigaiDiagramProps {
  sections: Section[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
  onSectionClick?: (sectionIndex: number) => void;
  selectedSectionIndex?: number;
  onSectionUpdate?: (sectionIndex: number, updates: Partial<Section>) => void;
  onFieldUpdate?: (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => void;
}

export default function IkigaiDiagram({
  sections,
  values,
  onChange,
  readOnly = false,
  onSectionClick,
  selectedSectionIndex,
  onSectionUpdate,
  onFieldUpdate,
}: IkigaiDiagramProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    circles: true,
    intersections: true,
    center: true,
  });
  const isBuilder = !!onSectionUpdate;

  const mainCircles = sections.map((s, i) => ({ section: s, originalIndex: i })).filter(({ section }) => section.position?.startsWith("circle-"));
  const intersections = sections.map((s, i) => ({ section: s, originalIndex: i })).filter(({ section }) => section.position?.startsWith("intersect-"));
  const centerEntry = sections.map((s, i) => ({ section: s, originalIndex: i })).find(({ section }) => section.position === "center");

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  function renderSectionCard(section: Section, originalIndex: number, opts: { rows?: number; titleSize?: string } = {}) {
    const field = section.fields[0];
    const baseColor = section.color || circleColors[section.position || ""] || "#6366f1";
    const charCount = (values[field?.id || ""] || "").length;
    const maxLen = field?.maxLength || 0;
    const isSelected = onSectionClick && selectedSectionIndex === originalIndex;
    const rows = opts.rows ?? 4;

    return (
      <div
        key={section.id}
        className={`bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 ${onSectionClick ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-[#0080ff] ring-offset-2" : ""}`}
        onClick={onSectionClick ? (e) => { e.stopPropagation(); onSectionClick(originalIndex); } : undefined}
      >
        <div className="flex items-stretch">
          <div className="w-1 shrink-0" style={{ backgroundColor: baseColor }} />
          <div className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${baseColor}14` }}
              >
                <SectionIcon icon={section.icon} size={18} />
              </div>
              {isBuilder ? (
                <InlineEdit
                  value={section.label}
                  onChange={(v) => onSectionUpdate!(originalIndex, { label: v })}
                  tag="h3"
                  className={`font-semibold ${opts.titleSize || "text-[15px]"}`}
                  style={{ color: baseColor }}
                  placeholder="Nome da seção"
                />
              ) : (
                <h4
                  className={`font-semibold ${opts.titleSize || "text-[15px]"}`}
                  style={{ color: baseColor }}
                >
                  {section.label}
                </h4>
              )}
            </div>

            {isBuilder ? (
              <div className="ml-[42px]">
                <InlineEdit
                  value={section.description || ""}
                  onChange={(v) => onSectionUpdate!(originalIndex, { description: v })}
                  tag="p"
                  className="text-xs text-muted-foreground mb-3 leading-relaxed"
                  placeholder="Descrição"
                />
              </div>
            ) : section.description ? (
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed ml-[42px]">
                {section.description}
              </p>
            ) : null}

            {field && (
              <div>
                {isBuilder && (
                  <div className="mb-1">
                    <InlineEdit
                      value={field.placeholder || ""}
                      onChange={(v) => onFieldUpdate!(originalIndex, 0, { placeholder: v })}
                      tag="span"
                      className="text-[11px] text-[#94a3b8] italic"
                      placeholder="Placeholder"
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
                  rows={rows}
                  className="w-full glass-input resize-none"
                />
                {maxLen > 0 && (
                  <div className="mt-1.5 text-right">
                    <span className={`text-xs tabular-nums ${charCount > maxLen * 0.9 ? "text-destructive" : "text-muted-foreground"}`}>
                      {charCount}/{maxLen}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* SVG Venn Diagram - desktop only */}
      <div className="hidden md:flex justify-center mb-8">
        <svg viewBox="0 0 420 420" className="w-[380px] h-[380px]">
          <circle cx="210" cy="140" r="120" fill="#EC4899" fillOpacity="0.12" stroke="#EC4899" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="280" cy="210" r="120" fill="#F59E0B" fillOpacity="0.12" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="210" cy="280" r="120" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="140" cy="210" r="120" fill="#3B82F6" fillOpacity="0.12" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.3" />

          <text x="210" y="50" textAnchor="middle" fill="#EC4899" fontSize="11" fontWeight="700" letterSpacing="0.05em">AMO</text>
          <text x="374" y="214" textAnchor="middle" fill="#F59E0B" fontSize="11" fontWeight="700" letterSpacing="0.05em">FAZ BEM</text>
          <text x="210" y="386" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="700" letterSpacing="0.05em">MUNDO PRECISA</text>
          <text x="46" y="214" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="700" letterSpacing="0.05em">PAGO</text>

          <text x="270" y="140" textAnchor="middle" fill="#E87530" fontSize="10" fontWeight="600" opacity="0.8">Paixao</text>
          <text x="270" y="286" textAnchor="middle" fill="#14B8A6" fontSize="10" fontWeight="600" opacity="0.8">Profissao</text>
          <text x="148" y="286" textAnchor="middle" fill="#06B6D4" fontSize="10" fontWeight="600" opacity="0.8">Vocacao</text>
          <text x="148" y="140" textAnchor="middle" fill="#8B5CF6" fontSize="10" fontWeight="600" opacity="0.8">Missao</text>

          <circle cx="210" cy="210" r="30" fill="#F59E0B" fillOpacity="0.25" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.4" />
          <text x="210" y="207" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="800" letterSpacing="0.1em">IKIGAI</text>
          <text x="210" y="220" textAnchor="middle" fill="#92400E" fontSize="7.5" fontWeight="500" opacity="0.6">proposito</text>
        </svg>
      </div>

      {/* Section Group: Main Circles */}
      <div className="mb-6">
        <button
          onClick={() => toggleGroup("circles")}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl mb-3 hover:bg-muted/70 transition-colors"
        >
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Quatro Pilares
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedGroups.circles ? "rotate-180" : ""}`}
          />
        </button>

        {expandedGroups.circles && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCircles.map(({ section, originalIndex }) => renderSectionCard(section, originalIndex))}
          </div>
        )}
      </div>

      {/* Section Group: Intersections */}
      <div className="mb-6">
        <button
          onClick={() => toggleGroup("intersections")}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl mb-3 hover:bg-muted/70 transition-colors"
        >
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Intersecoes
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedGroups.intersections ? "rotate-180" : ""}`}
          />
        </button>

        {expandedGroups.intersections && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {intersections.map(({ section, originalIndex }) => renderSectionCard(section, originalIndex, { rows: 2, titleSize: "text-sm" }))}
          </div>
        )}
      </div>

      {/* Section Group: Center - IKIGAI */}
      {centerEntry && (
        <div>
          <button
            onClick={() => toggleGroup("center")}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl mb-3 hover:bg-muted/70 transition-colors"
          >
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Seu Ikigai
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedGroups.center ? "rotate-180" : ""}`}
            />
          </button>

          {expandedGroups.center && (
            <div style={{ borderTop: `3px solid ${centerEntry.section.color || "#D97706"}` }} className="rounded-xl overflow-hidden">
              {renderSectionCard(centerEntry.section, centerEntry.originalIndex, { titleSize: "text-lg" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
