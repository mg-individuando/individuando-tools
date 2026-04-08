"use client";

import type { Section } from "@/lib/schemas/tool-schema";
import {
  BookOpen, Flame, Users, Scale, Shield, Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "book-open": BookOpen,
  flame: Flame,
  users: Users,
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

export default function CategoryGrid({
  sections,
  values,
  onChange,
  readOnly = false,
}: CategoryGridProps) {
  const totalSelected = Object.values(values).filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl bg-white border">
        <span className="text-sm text-gray-600">
          Forças selecionadas:
        </span>
        <span className="text-lg font-bold" style={{ color: "#2D5A7B" }}>
          {totalSelected} de 24
        </span>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon ? iconMap[section.icon] : null;
          const selectedInCategory = section.fields.filter((f) => values[f.id]).length;

          return (
            <div
              key={section.id}
              className="rounded-2xl border-2 p-5 transition-all hover:shadow-md"
              style={{
                borderColor: section.color || "#e5e7eb",
                backgroundColor: `${section.color}06`,
              }}
            >
              {/* Category header */}
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
                  style={{
                    backgroundColor: selectedInCategory > 0 ? `${section.color}20` : "#f3f4f6",
                    color: selectedInCategory > 0 ? section.color : "#9ca3af",
                  }}
                >
                  {selectedInCategory}/{section.fields.length}
                </span>
              </div>

              {section.description && (
                <p className="text-xs text-gray-400 mb-3">{section.description}</p>
              )}

              {/* Checkboxes */}
              <div className="space-y-2">
                {section.fields.map((field) => {
                  const isChecked = !!values[field.id];

                  return (
                    <label
                      key={field.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "border-current shadow-sm"
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                      style={
                        isChecked
                          ? {
                              borderColor: `${section.color}60`,
                              backgroundColor: `${section.color}10`,
                            }
                          : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onChange(field.id, e.target.checked)}
                        disabled={readOnly}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 transition-colors"
                        style={{ accentColor: section.color }}
                      />
                      <span
                        className={`text-sm leading-snug ${
                          isChecked ? "font-medium text-gray-800" : "text-gray-600"
                        }`}
                      >
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

      {/* Top strengths summary */}
      {totalSelected > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-white border">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Suas forças selecionadas:
          </h4>
          <div className="flex flex-wrap gap-2">
            {sections.flatMap((section) =>
              section.fields
                .filter((f) => values[f.id])
                .map((f) => (
                  <span
                    key={f.id}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${section.color}15`,
                      color: section.color,
                    }}
                  >
                    {f.label?.split("—")[0]?.trim()}
                  </span>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
