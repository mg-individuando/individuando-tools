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
          const field = section.fields[0];
          const color = section.color || "var(--brand)";
          const charCount = (values[field?.id || ""] || "").length;
          const maxLen = field?.maxLength || 0;
          const isFocused = focusedField === field?.id;

          return (
            <div
              key={section.id}
              className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md"
              style={{ borderLeftWidth: "4px", borderLeftColor: color }}
            >
              {/* Header */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${section.color || "#2D5A7B"}14` }}
                  >
                    {section.icon ? (
                      <SectionIcon icon={section.icon} size={18} />
                    ) : (
                      <span className="text-xs font-bold" style={{ color }}>{section.label.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight" style={{ color }}>
                      {section.label}
                    </h3>
                    {section.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Input */}
              {field && (
                <div className="px-5 pb-4 flex-1 flex flex-col">
                  <textarea
                    value={values[field.id] || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    required={field.required}
                    readOnly={readOnly}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 outline-none resize-none transition-all duration-200 focus:bg-card focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                    onFocus={() => setFocusedField(field.id)}
                    onBlur={() => setFocusedField(null)}
                  />

                  {field.maxLength != null && field.maxLength > 0 && (
                    <div className="mt-1.5 text-right">
                      <span className={`text-[11px] tabular-nums ${maxLen > 0 && charCount / maxLen > 0.9 ? "text-destructive" : "text-muted-foreground/50"}`}>
                        {charCount}/{field.maxLength}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
