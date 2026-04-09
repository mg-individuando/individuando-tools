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
      <div className="mb-6 bg-card border border-border rounded-xl p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Forcas selecionadas
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

          return (
            <div
              key={section.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
              style={{ borderTop: `3px solid ${color}` }}
            >
              <div className="p-5">
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: section.color
                        ? `${section.color}14`
                        : "color-mix(in srgb, var(--brand) 8%, transparent)",
                    }}
                  >
                    <SectionIcon icon={section.icon} size={18} />
                  </div>
                  <h3
                    className="font-semibold text-sm flex-1 min-w-0 truncate"
                    style={{ color }}
                  >
                    {section.label}
                  </h3>
                  <span
                    className="rounded-full text-xs px-2 py-0.5 font-semibold shrink-0"
                    style={{
                      backgroundColor: section.color
                        ? `${section.color}14`
                        : "color-mix(in srgb, var(--brand) 8%, transparent)",
                      color,
                    }}
                  >
                    {selectedInCategory}/{section.fields.length}
                  </span>
                </div>

                {section.description && (
                  <p className="text-xs text-muted-foreground/60 mb-3 leading-relaxed ml-[42px]">
                    {section.description}
                  </p>
                )}

                {/* Checkbox list */}
                <div className="space-y-1">
                  {section.fields.map((field) => {
                    const isChecked = !!values[field.id];

                    return (
                      <label
                        key={field.id}
                        className={`flex items-start gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                          isChecked
                            ? "bg-muted/60"
                            : "hover:bg-muted/50"
                        }`}
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
                            className="w-[18px] h-[18px] rounded flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: isChecked ? color : "transparent",
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
        <div className="mt-6 bg-card border border-border rounded-xl p-5">
          <h4 className="text-sm font-bold text-foreground mb-3">
            Suas forcas selecionadas
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
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-muted text-xs font-medium"
                      style={{ color: c }}
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
