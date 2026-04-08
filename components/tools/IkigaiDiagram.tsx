"use client";

import type { Section } from "@/lib/schemas/tool-schema";
import { Heart, Star, Globe, Banknote, Sparkles } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  heart: Heart,
  star: Star,
  globe: Globe,
  banknote: Banknote,
  sparkles: Sparkles,
};

interface IkigaiDiagramProps {
  sections: Section[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
}

export default function IkigaiDiagram({ sections, values, onChange, readOnly = false }: IkigaiDiagramProps) {
  // Split sections: first 4 are main circles, next 4 are intersections, last is center
  const mainCircles = sections.slice(0, 4);
  const intersections = sections.slice(4, 8);
  const center = sections[8];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Venn diagram visual */}
      <div className="relative w-full aspect-square max-w-[600px] mx-auto mb-8">
        {/* SVG circles background */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
          {/* Top circle - AMA */}
          <circle cx="200" cy="140" r="120" fill={`${mainCircles[0]?.color || "#EC4899"}10`} stroke={mainCircles[0]?.color || "#EC4899"} strokeWidth="2" strokeDasharray="6,3" />
          {/* Left circle - FAZ BEM */}
          <circle cx="140" cy="240" r="120" fill={`${mainCircles[1]?.color || "#3B82F6"}10`} stroke={mainCircles[1]?.color || "#3B82F6"} strokeWidth="2" strokeDasharray="6,3" />
          {/* Right circle - MUNDO PRECISA */}
          <circle cx="260" cy="240" r="120" fill={`${mainCircles[2]?.color || "#10B981"}10`} stroke={mainCircles[2]?.color || "#10B981"} strokeWidth="2" strokeDasharray="6,3" />
          {/* Bottom circle - PAGO */}
          <circle cx="200" cy="280" r="120" fill={`${mainCircles[3]?.color || "#F59E0B"}10`} stroke={mainCircles[3]?.color || "#F59E0B"} strokeWidth="2" strokeDasharray="6,3" />

          {/* Labels on the edges */}
          <text x="200" y="30" textAnchor="middle" className="text-xs font-bold" style={{ fill: mainCircles[0]?.color, fontSize: "13px" }}>
            {mainCircles[0]?.label}
          </text>
          <text x="30" y="280" textAnchor="middle" className="text-xs font-bold" style={{ fill: mainCircles[1]?.color, fontSize: "13px" }}>
            {mainCircles[1]?.label}
          </text>
          <text x="370" y="280" textAnchor="middle" className="text-xs font-bold" style={{ fill: mainCircles[2]?.color, fontSize: "13px" }}>
            {mainCircles[2]?.label}
          </text>
          <text x="200" y="395" textAnchor="middle" className="text-xs font-bold" style={{ fill: mainCircles[3]?.color, fontSize: "13px" }}>
            {mainCircles[3]?.label}
          </text>

          {/* Intersection labels */}
          <text x="155" y="175" textAnchor="middle" className="text-[10px] font-semibold" style={{ fill: intersections[0]?.color, fontSize: "10px" }}>
            {intersections[0]?.label}
          </text>
          <text x="245" y="175" textAnchor="middle" className="text-[10px] font-semibold" style={{ fill: intersections[1]?.color, fontSize: "10px" }}>
            {intersections[1]?.label}
          </text>
          <text x="245" y="290" textAnchor="middle" className="text-[10px] font-semibold" style={{ fill: intersections[2]?.color, fontSize: "10px" }}>
            {intersections[2]?.label}
          </text>
          <text x="155" y="290" textAnchor="middle" className="text-[10px] font-semibold" style={{ fill: intersections[3]?.color, fontSize: "10px" }}>
            {intersections[3]?.label}
          </text>

          {/* Center — IKIGAI */}
          <circle cx="200" cy="220" r="30" fill={`${center?.color || "#2D5A7B"}25`} stroke={center?.color || "#2D5A7B"} strokeWidth="2" />
          <text x="200" y="222" textAnchor="middle" dominantBaseline="central" className="font-bold" style={{ fill: center?.color, fontSize: "11px" }}>
            IKIGAI
          </text>
        </svg>
      </div>

      {/* Input cards — main circles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {mainCircles.map((section) => {
          const Icon = section.icon ? iconMap[section.icon] : null;
          const field = section.fields[0];

          return (
            <div
              key={section.id}
              className="rounded-2xl border-2 p-4 transition-all hover:shadow-md"
              style={{
                borderColor: section.color || "#e5e7eb",
                backgroundColor: `${section.color}08`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {Icon && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: section.color }} />
                  </div>
                )}
                <h3 className="font-semibold text-sm" style={{ color: section.color }}>
                  {section.label}
                </h3>
              </div>
              {section.description && (
                <p className="text-xs text-gray-500 mb-2">{section.description}</p>
              )}
              {field && (
                <textarea
                  value={values[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  readOnly={readOnly}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm
                    placeholder:text-gray-400 focus:outline-none resize-none transition-all"
                  onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${section.color}40`; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Intersection cards */}
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Interseções</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {intersections.map((section) => {
          const field = section.fields[0];
          return (
            <div
              key={section.id}
              className="rounded-xl border p-3 transition-all hover:shadow-sm"
              style={{
                borderColor: `${section.color}40`,
                backgroundColor: `${section.color}06`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: section.color }} />
                <h4 className="font-medium text-sm" style={{ color: section.color }}>
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
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm
                    placeholder:text-gray-400 focus:outline-none resize-none"
                  onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${section.color}40`; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Center IKIGAI card */}
      {center && (
        <div
          className="rounded-2xl border-2 p-5 transition-all hover:shadow-lg max-w-xl mx-auto"
          style={{
            borderColor: center.color || "#2D5A7B",
            backgroundColor: `${center.color}08`,
          }}
        >
          <div className="flex items-center gap-2 mb-2 justify-center">
            {center.icon && iconMap[center.icon] && (() => {
              const CenterIcon = iconMap[center.icon!];
              return (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${center.color}20` }}
                >
                  <CenterIcon className="w-5 h-5" style={{ color: center.color }} />
                </div>
              );
            })()}
            <h3 className="font-bold text-lg" style={{ color: center.color }}>
              {center.label}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-3 text-center">{center.description}</p>
          {center.fields[0] && (
            <textarea
              value={values[center.fields[0].id] || ""}
              onChange={(e) => onChange(center.fields[0].id, e.target.value)}
              placeholder={center.fields[0].placeholder}
              maxLength={center.fields[0].maxLength}
              readOnly={readOnly}
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm
                placeholder:text-gray-400 focus:outline-none resize-none"
              onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${center.color}40`; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            />
          )}
        </div>
      )}
    </div>
  );
}
