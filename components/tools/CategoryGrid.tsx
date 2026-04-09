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
      <div className="mb-6 bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Forcas selecionadas
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {totalSelected} de {totalFields}
        </span>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const selectedInCategory = section.fields.filter((f) => values[f.id]).length;
          const color = section.color || "#2D5A7B";

          return (
            <div
              key={section.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Colored top border */}
              <div
                className="h-[3px] w-full"
                style={{ backgroundColor: color }}
              />

              <div className="p-4">
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-1">
                  <SectionIcon icon={section.icon} size={20} />
                  <h3 className="font-semibold text-sm text-gray-800 flex-1 min-w-0 truncate">
                    {section.label}
                  </h3>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: `${color}12`,
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
                <div className="space-y-1">
                  {section.fields.map((field) => {
                    const isChecked = !!values[field.id];

                    return (
                      <label
                        key={field.id}
                        className={`flex items-start gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          isChecked ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => onChange(field.id, e.target.checked)}
                            disabled={readOnly}
                            className="sr-only peer"
                          />
                          <div
                            className="w-[18px] h-[18px] rounded flex items-center justify-center border transition-colors"
                            style={{
                              backgroundColor: isChecked ? color : "white",
                              borderColor: isChecked ? color : "#d1d5db",
                            }}
                          >
                            {isChecked && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-sm leading-snug ${
                            isChecked ? "text-gray-800 font-medium" : "text-gray-600"
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
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Suas forcas selecionadas
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
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border"
                      style={{
                        backgroundColor: `${c}08`,
                        borderColor: `${c}25`,
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
