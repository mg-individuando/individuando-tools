"use client";

import type { Section } from "@/lib/schemas/tool-schema";
import { Check } from "lucide-react";
import SectionIcon from "./SectionIcon";

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
  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Summary bar */}
      <div
        className="mb-6 px-5 py-4 flex items-center justify-between"
        style={{
          backgroundColor: "#6366f10C",
          borderRadius: "var(--card-radius, 16px)",
          boxShadow:
            "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <span className="text-sm font-medium text-gray-600">
          Forças selecionadas
        </span>
        <span className="text-sm font-bold text-gray-800">
          {totalSelected} de {totalFields}
        </span>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const selectedInCategory = section.fields.filter(
            (f) => values[f.id]
          ).length;
          const color = section.color || "#2D5A7B";

          return (
            <div
              key={section.id}
              className="overflow-hidden"
              style={{
                backgroundColor: `${color}0C`,
                borderRadius: "var(--card-radius, 16px)",
                boxShadow:
                  "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-[3px] w-full"
                style={{ backgroundColor: color }}
              />

              <div className="p-5">
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-1">
                  <SectionIcon icon={section.icon} size={20} />
                  <h3
                    className="font-bold text-sm flex-1 min-w-0 truncate"
                    style={{ color }}
                  >
                    {section.label}
                  </h3>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: `${color}14`,
                      color,
                    }}
                  >
                    {selectedInCategory} de {section.fields.length}
                  </span>
                </div>

                {section.description && (
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                    {section.description}
                  </p>
                )}

                {/* Checkbox list */}
                <div className="space-y-1.5">
                  {section.fields.map((field) => {
                    const isChecked = !!values[field.id];

                    return (
                      <label
                        key={field.id}
                        className="flex items-start gap-3 px-3 py-2 rounded-full cursor-pointer transition-all duration-150"
                        style={{
                          backgroundColor: isChecked ? "white" : "transparent",
                          boxShadow: isChecked
                            ? "0 1px 6px rgba(0,0,0,0.06)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.6)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        {/* Checkbox */}
                        <div className="relative flex-shrink-0 mt-0.5">
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
                            className="w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: isChecked ? color : "white",
                              border: isChecked
                                ? "none"
                                : "2px solid #d1d5db",
                            }}
                          >
                            {isChecked && (
                              <Check
                                className="w-3 h-3 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-sm leading-snug ${
                            isChecked
                              ? "text-gray-800 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {field.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected strengths summary */}
      {totalSelected > 0 && (
        <div
          className="mt-6 p-5"
          style={{
            backgroundColor: "#6366f10C",
            borderRadius: "var(--card-radius, 16px)",
            boxShadow:
              "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <h4 className="text-sm font-bold text-gray-700 mb-3">
            Suas forças selecionadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {sections.flatMap((section) =>
              section.fields
                .filter((f) => values[f.id])
                .map((f) => {
                  const c = section.color || "#2D5A7B";
                  return (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "white",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
