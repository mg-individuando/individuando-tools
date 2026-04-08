"use client";

import type { Section } from "@/lib/schemas/tool-schema";
import { Heart, Star, Globe, Banknote, Compass } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  heart: Heart,
  star: Star,
  globe: Globe,
  banknote: Banknote,
  compass: Compass,
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
  const mainCircles = sections.filter((s) => s.position?.startsWith("circle-"));
  const intersections = sections.filter((s) => s.position?.startsWith("intersect-"));
  const centerSection = sections.find((s) => s.position === "center");

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Visual Venn Diagram (decorative, desktop only) */}
      <div className="hidden md:flex justify-center mb-8">
        <div className="relative w-[420px] h-[420px]">
          {/* 4 overlapping circles */}
          <div
            className="absolute w-[240px] h-[240px] rounded-full border-2 opacity-20"
            style={{ backgroundColor: "#EC4899", borderColor: "#EC4899", top: "20px", left: "90px" }}
          />
          <div
            className="absolute w-[240px] h-[240px] rounded-full border-2 opacity-20"
            style={{ backgroundColor: "#F59E0B", borderColor: "#F59E0B", top: "90px", left: "160px" }}
          />
          <div
            className="absolute w-[240px] h-[240px] rounded-full border-2 opacity-20"
            style={{ backgroundColor: "#10B981", borderColor: "#10B981", top: "160px", left: "90px" }}
          />
          <div
            className="absolute w-[240px] h-[240px] rounded-full border-2 opacity-20"
            style={{ backgroundColor: "#3B82F6", borderColor: "#3B82F6", top: "90px", left: "20px" }}
          />

          {/* Labels on the circles */}
          <span className="absolute text-xs font-bold text-pink-600 top-[6px] left-1/2 -translate-x-1/2">
            AMO
          </span>
          <span className="absolute text-xs font-bold text-amber-600 top-1/2 -translate-y-1/2 right-[-8px]">
            FAÇO BEM
          </span>
          <span className="absolute text-xs font-bold text-emerald-600 bottom-[6px] left-1/2 -translate-x-1/2">
            MUNDO PRECISA
          </span>
          <span className="absolute text-xs font-bold text-blue-600 top-1/2 -translate-y-1/2 left-[-24px]">
            PAGO
          </span>

          {/* Intersection labels */}
          <span className="absolute text-[10px] font-semibold text-orange-500 top-[80px] right-[60px]">
            Paixão
          </span>
          <span className="absolute text-[10px] font-semibold text-violet-500 top-[80px] left-[60px]">
            Missão
          </span>
          <span className="absolute text-[10px] font-semibold text-cyan-600 bottom-[80px] left-[60px]">
            Vocação
          </span>
          <span className="absolute text-[10px] font-semibold text-teal-500 bottom-[80px] right-[60px]">
            Profissão
          </span>

          {/* Center: IKIGAI */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#2D5A7B] flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">IKIGAI</span>
          </div>
        </div>
      </div>

      {/* Main 4 circles — cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {mainCircles.map((section) => {
          const Icon = section.icon ? iconMap[section.icon] : null;
          const field = section.fields[0];

          return (
            <div
              key={section.id}
              className="rounded-2xl border-2 p-5 transition-all hover:shadow-md"
              style={{
                borderColor: section.color || "#e5e7eb",
                backgroundColor: `${section.color}08`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {Icon && (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: section.color }} />
                  </div>
                )}
                <h3 className="font-semibold text-lg" style={{ color: section.color }}>
                  {section.label}
                </h3>
              </div>

              {section.description && (
                <p className="text-sm text-gray-500 mb-3">{section.description}</p>
              )}

              {field && (
                <textarea
                  value={values[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  required={field.required}
                  readOnly={readOnly}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm
                    placeholder:text-gray-400 focus:outline-none resize-none transition-all"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${section.color}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              )}

              {field?.maxLength && (
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {(values[field.id] || "").length}/{field.maxLength}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Intersections */}
      <div className="mb-6">
        <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Interseções
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {intersections.map((section) => {
            const field = section.fields[0];

            return (
              <div
                key={section.id}
                className="rounded-xl border p-4 transition-all hover:shadow-sm"
                style={{
                  borderColor: `${section.color}60`,
                  backgroundColor: `${section.color}06`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                  <h4 className="font-semibold text-sm" style={{ color: section.color }}>
                    {section.label}
                  </h4>
                  <span className="text-xs text-gray-400">({section.description})</span>
                </div>

                {field && (
                  <textarea
                    value={values[field.id] || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    readOnly={readOnly}
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm
                      placeholder:text-gray-400 focus:outline-none resize-none transition-all"
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${section.color}40`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center — IKIGAI */}
      {centerSection && (() => {
        const CenterIcon = centerSection.icon ? iconMap[centerSection.icon] : null;
        return (
          <div
            className="rounded-2xl border-2 p-6 text-center transition-all hover:shadow-lg"
            style={{
              borderColor: centerSection.color,
              backgroundColor: `${centerSection.color}08`,
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {CenterIcon && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${centerSection.color}20` }}
                >
                  <CenterIcon className="w-5 h-5" style={{ color: centerSection.color }} />
                </div>
              )}
              <h3 className="font-bold text-xl" style={{ color: centerSection.color }}>
                {centerSection.label}
              </h3>
            </div>

            {centerSection.description && (
              <p className="text-sm text-gray-500 mb-3">{centerSection.description}</p>
            )}

            {centerSection.fields[0] && (
              <textarea
                value={values[centerSection.fields[0].id] || ""}
                onChange={(e) => onChange(centerSection.fields[0].id, e.target.value)}
                placeholder={centerSection.fields[0].placeholder}
                maxLength={centerSection.fields[0].maxLength}
                required={centerSection.fields[0].required}
                readOnly={readOnly}
                rows={4}
                className="w-full max-w-2xl mx-auto rounded-lg border border-gray-200 bg-white p-3 text-sm
                  placeholder:text-gray-400 focus:outline-none resize-none transition-all"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${centerSection.color}40`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            )}
          </div>
        );
      })()}
    </div>
  );
}
