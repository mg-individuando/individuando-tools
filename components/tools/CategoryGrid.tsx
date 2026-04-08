"use client";

import type { Section } from "@/lib/schemas/tool-schema";
import { Brain, Flame, Heart, Scale, Shield, Sparkles } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  brain: Brain,
  flame: Flame,
  "hand-heart": Heart,
  scale: Scale,
  shield: Shield,
  sparkles: Sparkles,
};

interface CategoryGridProps {
  sections: Section[];
  values: Record<string, boolean>;
  onChange: (fieldId: string, value: boolean) => void;
  readOnly?: boolean;
}

export default function CategoryGrid({ sections, values, onChange, readOnly = false }: CategoryGridProps) {
  // Count selected per section
  const countSelected = (section: Section) =>
    section.fields.filter((f) => values[f.id]).length;

  const totalSelected = sections.reduce((sum, s) => sum + countSelected(s), 0);
  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl bg-white border">
        <span className="text-sm text-gray-600">
          Forças selecionadas: <strong className="text-gray-900">{totalSelected}</strong> de {totalFields}
        </span>
        <div className="flex gap-1">
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${s.color}15`, color: s.color }}
            >
              {countSelected(s)}
            </div>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon ? iconMap[section.icon] : null;
          const selected = countSelected(section);

          return (
            <div
              key={section.id}
              className="rounded-2xl border-2 p-4 transition-all hover:shadow-md"
              style={{
                borderColor: selected > 0 ? section.color : "#e5e7eb",
                backgroundColor: selected > 0 ? `${section.color}06` : "white",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                {Icon && (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: section.color }} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm" style={{ color: section.color }}>
                    {section.label}
                  </h3>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${section.color}15`, color: section.color }}
                >
                  {selected}/{section.fields.length}
                </span>
              </div>

              {section.description && (
                <p className="text-xs text-gray-500 mb-3">{section.description}</p>
              )}

              {/* Checkboxes */}
              <div className="space-y-1.5">
                {section.fields.map((field) => {
                  const checked = !!values[field.id];
                  return (
                    <label
                      key={field.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer
                        transition-all border ${
                          checked
                            ? "border-current bg-white shadow-sm"
                            : "border-transparent hover:bg-gray-50"
                        } ${readOnly ? "pointer-events-none opacity-75" : ""}`}
                      style={checked ? { borderColor: `${section.color}40`, color: section.color } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(field.id, e.target.checked)}
                        disabled={readOnly}
                        className="w-4 h-4 rounded border-gray-300 transition-colors"
                        style={{ accentColor: section.color }}
                      />
                      <span className={`text-sm ${checked ? "font-medium" : "text-gray-700"}`}>
                        {field.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
