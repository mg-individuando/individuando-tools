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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {orderedSections.map((section) => {
          const hasIcon = !!section.icon;
          const field = section.fields[0];
          const baseColor = section.color || "var(--brand)";
          const baseColorBg = section.color ? `${section.color}0C` : "color-mix(in srgb, var(--brand) 5%, transparent)";
          const charCount = (values[field?.id || ""] || "").length;
          const maxLen = field?.maxLength || 0;
          const isFocused = focusedField === field?.id;

          return (
            <div
              key={section.id}
              className="flex flex-col overflow-hidden shadow-soft"
              style={{
                backgroundColor: baseColorBg,
                borderRadius: "var(--card-radius, 16px)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-[3px] w-full shrink-0"
                style={{ backgroundColor: baseColor }}
              />

              {/* Header */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2.5 mb-1">
                  {hasIcon && (
                    <SectionIcon icon={section.icon} size={22} />
                  )}
                  <h3
                    className="font-bold text-base leading-tight"
                    style={{ color: baseColor }}
                  >
                    {section.label}
                  </h3>
                </div>

                {section.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1 ml-[30px]">
                    {section.description}
                  </p>
                )}
              </div>

              {/* Textarea */}
              {field && (
                <div className="px-5 pb-5 pt-1 flex-1 flex flex-col">
                  <textarea
                    value={values[field.id] || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    required={field.required}
                    readOnly={readOnly}
                    rows={5}
                    className="
                      w-full bg-card border-0 text-sm leading-relaxed
                      text-foreground placeholder:text-muted-foreground/60
                      outline-none resize-none
                      transition-shadow duration-150
                    "
                    style={{
                      borderRadius: "var(--card-radius, 12px)",
                      padding: "10px 14px",
                      boxShadow: isFocused
                        ? section.color ? `0 0 0 2px ${section.color}30` : `0 0 0 2px color-mix(in srgb, var(--brand) 20%, transparent)`
                        : "none",
                    }}
                    onFocus={() => setFocusedField(field.id)}
                    onBlur={() => setFocusedField(null)}
                  />

                  {/* Character count */}
                  {field.maxLength != null && field.maxLength > 0 && (
                    <div className="mt-2 text-right">
                      <span
                        className="text-xs tabular-nums"
                        style={{
                          color:
                            maxLen > 0 && charCount / maxLen > 0.9
                              ? "var(--error)"
                              : "var(--muted-foreground)",
                        }}
                      >
                        {charCount} / {field.maxLength}
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
