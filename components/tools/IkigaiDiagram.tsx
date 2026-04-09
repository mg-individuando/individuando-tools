"use client";

import { useState } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import { Heart, Star, Globe, Banknote, Compass, ChevronDown } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  heart: Heart,
  star: Star,
  globe: Globe,
  banknote: Banknote,
  compass: Compass,
};

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
}

export default function IkigaiDiagram({
  sections,
  values,
  onChange,
  readOnly = false,
}: IkigaiDiagramProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    circles: true,
    intersections: true,
    center: true,
  });

  const mainCircles = sections.filter((s) => s.position?.startsWith("circle-"));
  const intersections = sections.filter((s) => s.position?.startsWith("intersect-"));
  const centerSection = sections.find((s) => s.position === "center");

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

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
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Quatro Pilares
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedGroups.circles ? "rotate-180" : ""}`}
          />
        </button>

        {expandedGroups.circles && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCircles.map((section) => {
              const Icon = section.icon ? iconMap[section.icon] : null;
              const field = section.fields[0];
              const baseColor = section.color || circleColors[section.position || ""] || "#6366f1";
              const charCount = (values[field?.id || ""] || "").length;
              const maxLen = field?.maxLength || 0;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Colored left border */}
                    <div
                      className="w-1 shrink-0"
                      style={{ backgroundColor: baseColor }}
                    />
                    <div className="flex-1 p-4">
                      {/* Header */}
                      <div className="flex items-center gap-2.5 mb-1">
                        {Icon && (
                          <Icon className="w-4.5 h-4.5 shrink-0" style={{ color: baseColor }} />
                        )}
                        <h4 className="font-semibold text-[15px] text-gray-800">
                          {section.label}
                        </h4>
                      </div>

                      {section.description && (
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                          {section.description}
                        </p>
                      )}

                      {field && (
                        <div>
                          <textarea
                            value={values[field.id] || ""}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            required={field.required}
                            readOnly={readOnly}
                            rows={4}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 resize-none transition-colors focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                          />
                          {maxLen > 0 && (
                            <div className="mt-1.5 text-right">
                              <span className={`text-xs tabular-nums ${charCount > maxLen * 0.9 ? "text-red-500" : "text-gray-400"}`}>
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
            })}
          </div>
        )}
      </div>

      {/* Section Group: Intersections */}
      <div className="mb-6">
        <button
          onClick={() => toggleGroup("intersections")}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Intersecoes
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedGroups.intersections ? "rotate-180" : ""}`}
          />
        </button>

        {expandedGroups.intersections && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {intersections.map((section) => {
              const field = section.fields[0];
              const baseColor = section.color || "#6366f1";
              const charCount = (values[field?.id || ""] || "").length;
              const maxLen = field?.maxLength || 0;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="flex items-stretch">
                    <div
                      className="w-1 shrink-0"
                      style={{ backgroundColor: baseColor }}
                    />
                    <div className="flex-1 p-4">
                      <h4
                        className="font-semibold text-sm mb-1"
                        style={{ color: baseColor }}
                      >
                        {section.label}
                      </h4>

                      {section.description && (
                        <p className="text-xs text-gray-400 mb-2.5 leading-relaxed">
                          {section.description}
                        </p>
                      )}

                      {field && (
                        <div>
                          <textarea
                            value={values[field.id] || ""}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            readOnly={readOnly}
                            rows={2}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 resize-none transition-colors focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                          />
                          {maxLen > 0 && (
                            <div className="mt-1.5 text-right">
                              <span className={`text-xs tabular-nums ${charCount > maxLen * 0.9 ? "text-red-500" : "text-gray-400"}`}>
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
            })}
          </div>
        )}
      </div>

      {/* Section Group: Center - IKIGAI */}
      {centerSection && (
        <div>
          <button
            onClick={() => toggleGroup("center")}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Seu Ikigai
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedGroups.center ? "rotate-180" : ""}`}
            />
          </button>

          {expandedGroups.center &&
            (() => {
              const CenterIcon = centerSection.icon ? iconMap[centerSection.icon] : null;
              const field = centerSection.fields[0];
              const baseColor = centerSection.color || "#D97706";
              const charCount = (values[field?.id || ""] || "").length;
              const maxLen = field?.maxLength || 0;

              return (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-stretch">
                    <div
                      className="w-1 shrink-0"
                      style={{ backgroundColor: baseColor }}
                    />
                    <div className="flex-1 p-5">
                      <div className="flex items-center gap-2.5 mb-1">
                        {CenterIcon && (
                          <CenterIcon className="w-5 h-5 shrink-0" style={{ color: baseColor }} />
                        )}
                        <h4 className="font-bold text-lg text-gray-800">
                          {centerSection.label}
                        </h4>
                      </div>

                      {centerSection.description && (
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                          {centerSection.description}
                        </p>
                      )}

                      {field && (
                        <div className="max-w-2xl">
                          <textarea
                            value={values[field.id] || ""}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            required={field.required}
                            readOnly={readOnly}
                            rows={4}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 resize-none transition-colors focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                          />
                          {maxLen > 0 && (
                            <div className="mt-1.5 text-right">
                              <span className={`text-xs tabular-nums ${charCount > maxLen * 0.9 ? "text-red-500" : "text-gray-400"}`}>
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
            })()}
        </div>
      )}
    </div>
  );
}
