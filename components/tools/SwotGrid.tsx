"use client";

import { useState, useMemo } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import SectionIcon from "./SectionIcon";

interface SwotGridProps {
  sections: Section[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
}

export default function SwotGrid({
  sections,
  values,
  onChange,
  readOnly = false,
}: SwotGridProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /* Resolve quadrant ordering so the grid lays out correctly */
  const positionOrder = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const orderedSections = useMemo(() => {
    const copy = [...sections];
    copy.sort((a, b) => {
      const ai = positionOrder.indexOf(a.position || "");
      const bi = positionOrder.indexOf(b.position || "");
      return ai - bi;
    });
    return copy;
  }, [sections]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orderedSections.map((section) => {
          const hasIcon = !!section.icon;
          const field = section.fields[0];
          const baseColor = section.color || "#6366f1";
          const charCount = (values[field?.id || ""] || "").length;
          const maxLen = field?.maxLength || 0;
          const isFocused = focusedField === field?.id;

          return (
            <div
              key={section.id}
              className="flex flex-col bg-white rounded-lg overflow-hidden"
              style={{
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              {/* Left-border accent is applied via an inner wrapper */}
              <div
                className="flex flex-col flex-1"
                style={{ borderLeft: `4px solid ${baseColor}` }}
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2.5 mb-1">
                    {hasIcon && (
                      <SectionIcon icon={section.icon} size={22} />
                    )}
                    <h3
                      className="font-semibold text-base leading-tight"
                      style={{ color: baseColor }}
                    >
                      {section.label}
                    </h3>
                  </div>

                  {section.description && (
                    <p className="text-sm text-slate-500 leading-relaxed mt-1 ml-[30px]">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Textarea */}
                {field && (
                  <div className="px-5 pb-4 pt-1 flex-1 flex flex-col">
                    <textarea
                      value={values[field.id] || ""}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      required={field.required}
                      readOnly={readOnly}
                      rows={5}
                      className="
                        w-full rounded-md border border-slate-200 bg-slate-50
                        px-3 py-2.5 text-sm leading-relaxed text-slate-700
                        placeholder:text-slate-400
                        outline-none resize-none
                        transition-colors duration-150
                        focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-offset-0
                      "
                      style={{
                        ...(isFocused
                          ? { borderColor: baseColor, ringColor: baseColor }
                          : {}),
                        // Use box-shadow for the ring to leverage the section color
                        boxShadow: isFocused
                          ? `0 0 0 2px ${baseColor}25`
                          : "none",
                      }}
                      onFocus={() => setFocusedField(field.id)}
                      onBlur={() => setFocusedField(null)}
                    />

                    {/* Character count - simple text */}
                    {field.maxLength != null && field.maxLength > 0 && (
                      <div className="mt-2 text-right">
                        <span
                          className="text-xs tabular-nums"
                          style={{
                            color:
                              maxLen > 0 && charCount / maxLen > 0.9
                                ? "#ef4444"
                                : "#94a3b8",
                          }}
                        >
                          {charCount} / {field.maxLength}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
