"use client";

import { useState } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import { ShieldCheck, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "shield-check": ShieldCheck,
  "alert-triangle": AlertTriangle,
  "lightbulb": Lightbulb,
  "shield-alert": ShieldAlert,
};

const positionMap: Record<string, string> = {
  "top-left": "col-start-1 row-start-1",
  "top-right": "col-start-2 row-start-1",
  "bottom-left": "col-start-1 row-start-2",
  "bottom-right": "col-start-2 row-start-2",
};

interface SwotGridProps {
  sections: Section[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
}

export default function SwotGrid({ sections, values, onChange, readOnly = false }: SwotGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      {sections.map((section) => {
        const Icon = section.icon ? iconMap[section.icon] : null;
        const field = section.fields[0];
        const gridPos = section.position ? positionMap[section.position] : "";

        return (
          <div
            key={section.id}
            className={`rounded-2xl border-2 p-5 transition-all hover:shadow-md ${gridPos}`}
            style={{
              borderColor: section.color || "#e5e7eb",
              backgroundColor: `${section.color}08`,
            }}
          >
            {/* Header */}
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

            {/* Description */}
            {section.description && (
              <p className="text-sm text-gray-500 mb-3">{section.description}</p>
            )}

            {/* Field */}
            {field && (
              <textarea
                value={values[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                required={field.required}
                readOnly={readOnly}
                rows={5}
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent
                  resize-none transition-all disabled:bg-gray-50"
                style={{
                  // @ts-expect-error CSS variable for focus ring
                  "--tw-ring-color": `${section.color}40`,
                  focusRingColor: section.color,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${section.color}40`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            )}

            {/* Character count */}
            {field?.maxLength && (
              <p className="text-xs text-gray-400 mt-1 text-right">
                {(values[field.id] || "").length}/{field.maxLength}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
