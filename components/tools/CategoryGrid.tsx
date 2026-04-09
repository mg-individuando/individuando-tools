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
        className="mb-6 px-5 py-4 flex items-center justify-between shadow-soft"
        style={{
          backgroundColor: "color-mix(in srgb, var(--brand) 5%, transparent)",
          borderRadius: "var(--card-radius, 16px)",
        }}
      >
        <span className="text-sm font-medium text-muted-foreground">
          Forças selecionadas
        </span>
        <span className="text-sm font-bold text-foreground">
          {totalSelected} de {totalFields}
        </span>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const selectedInCategory = section.fields.filter(
            (f) => values[f.id]
          ).length;
          const color = section.color || "var(--brand)";
          const colorBg = section.color ? `${section.color}0C` : "color-mix(in srgb, var(--brand) 5%, transparent)";

          return (
            <div
              key={section.id}
              className="overflow-hidden shadow-soft"
              style={{
                backgroundColor: colorBg,
                borderRadius: "var(--card-radius, 16px)",
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
                      backgroundColor: section.color ? `${section.color}14` : "color-mix(in srgb, var(--brand) 8%, transparent)",
                      color,
                    }}
                  >
                    {selectedInCategory} de {section.fields.length}
                  </span>
                </div>

                {section.description && (
                  <p className="text-xs text-muted-foreground/60 mb-3 leading-relaxed">
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
                          backgroundColor: isChecked ? "var(--card)" : "transparent",
                          boxShadow: isChecked
                            ? "var(--shadow-xs)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--card) 60%, transparent)";
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
                              backgroundColor: isChecked ? color : "var(--card)",
                              border: isChecked
                                ? "none"
                                : "2px solid var(--border)",
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
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
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
          className="mt-6 p-5 shadow-soft"
          style={{
            backgroundColor: "color-mix(in srgb, var(--brand) 5%, transparent)",
            borderRadius: "var(--card-radius, 16px)",
          }}
        >
          <h4 className="text-sm font-bold text-foreground mb-3">
            Suas forças selecionadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {sections.flatMap((section) =>
              section.fields
                .filter((f) => values[f.id])
                .map((f) => {
                  const c = section.color || "var(--brand)";
                  return (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "var(--card)",
                        boxShadow: "var(--shadow-xs)",
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
