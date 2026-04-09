"use client";

import { useState, useMemo } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import {
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  "shield-check": ShieldCheck,
  "alert-triangle": AlertTriangle,
  lightbulb: Lightbulb,
  "shield-alert": ShieldAlert,
};

/* Gradient pairs per quadrant position for the top header strip and icon badge */
const gradientMap: Record<string, { from: string; to: string }> = {
  "top-left": { from: "#22c55e", to: "#16a34a" },
  "top-right": { from: "#f59e0b", to: "#d97706" },
  "bottom-left": { from: "#3b82f6", to: "#6366f1" },
  "bottom-right": { from: "#ef4444", to: "#dc2626" },
};

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
      {/* Outer wrapper with the crosshair separator lines */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Vertical separator line */}
        <div
          className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(148,163,184,0.25) 15%, rgba(148,163,184,0.25) 85%, transparent)",
          }}
        />
        {/* Horizontal separator line */}
        <div
          className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(148,163,184,0.25) 15%, rgba(148,163,184,0.25) 85%, transparent)",
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2">
          {orderedSections.map((section, idx) => {
            const Icon = section.icon ? iconMap[section.icon] : null;
            const field = section.fields[0];
            const gradient =
              gradientMap[section.position || ""] || {
                from: section.color || "#6366f1",
                to: section.color || "#6366f1",
              };
            const baseColor = section.color || gradient.from;
            const charCount = (values[field?.id || ""] || "").length;
            const maxLen = field?.maxLength || 0;
            const progress = maxLen > 0 ? Math.min(charCount / maxLen, 1) : 0;
            const isFocused = focusedField === field?.id;

            /* Corner rounding based on position */
            const cornerMap: Record<string, string> = {
              "top-left": "md:rounded-tl-3xl",
              "top-right": "md:rounded-tr-3xl",
              "bottom-left": "md:rounded-bl-3xl",
              "bottom-right": "md:rounded-br-3xl",
            };
            const cornerClass =
              cornerMap[section.position || ""] || "";

            return (
              <div
                key={section.id}
                className={`
                  group relative flex flex-col
                  rounded-2xl ${cornerClass}
                  p-0 transition-all duration-300 ease-out
                  hover:-translate-y-0.5 hover:z-20
                `}
                style={
                  {
                    "--card-color": baseColor,
                    "--grad-from": gradient.from,
                    "--grad-to": gradient.to,
                  } as React.CSSProperties
                }
              >
                {/* Glass card inner */}
                <div
                  className={`
                    relative flex flex-col flex-1 overflow-hidden
                    rounded-2xl ${cornerClass}
                    m-1
                    backdrop-blur-xl
                    transition-shadow duration-300 ease-out
                    group-hover:shadow-lg group-hover:shadow-black/5
                  `}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)",
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  {/* Gradient header strip */}
                  <div
                    className="h-1.5 w-full shrink-0"
                    style={{
                      background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
                    }}
                  />

                  <div className="flex flex-col flex-1 p-5 pt-4">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-1.5">
                      {/* Icon pill badge */}
                      {Icon && (
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                          }}
                        >
                          <Icon
                            className="w-[18px] h-[18px]"
                            style={{ color: "#fff" }}
                          />
                        </div>
                      )}

                      {/* Floating label */}
                      <h3
                        className="font-bold text-[17px] leading-tight tracking-tight"
                        style={{
                          color: baseColor,
                          textShadow: `0 1px 2px ${baseColor}18`,
                        }}
                      >
                        {section.label}
                      </h3>
                    </div>

                    {/* Description */}
                    {section.description && (
                      <p className="text-[13px] leading-relaxed text-slate-400 italic pl-12 mb-3 -mt-0.5">
                        {section.description}
                      </p>
                    )}

                    {/* Textarea */}
                    {field && (
                      <div className="mt-auto">
                        <textarea
                          value={values[field.id] || ""}
                          onChange={(e) => onChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          required={field.required}
                          readOnly={readOnly}
                          rows={5}
                          className="
                            w-full rounded-xl bg-transparent p-3 text-sm leading-relaxed
                            text-slate-700
                            placeholder:text-slate-300 placeholder:italic
                            border-0 outline-none
                            resize-none
                            transition-all duration-300 ease-out
                          "
                          style={{
                            boxShadow: isFocused
                              ? `inset 0 2px 6px ${baseColor}12, 0 0 0 2px ${baseColor}30`
                              : "inset 0 2px 6px rgba(0,0,0,0.04)",
                            background: isFocused
                              ? "rgba(255,255,255,0.8)"
                              : "rgba(255,255,255,0.35)",
                          }}
                          onFocus={() => setFocusedField(field.id)}
                          onBlur={() => setFocusedField(null)}
                        />

                        {/* Character count progress bar */}
                        {field.maxLength != null && field.maxLength > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${progress * 100}%`,
                                  background:
                                    progress > 0.9
                                      ? `linear-gradient(90deg, ${gradient.from}, #ef4444)`
                                      : `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
                                  opacity: charCount > 0 ? 1 : 0,
                                }}
                              />
                            </div>
                            <span
                              className="text-[11px] tabular-nums text-slate-300 transition-colors duration-300"
                              style={{
                                color:
                                  progress > 0.9
                                    ? "#ef4444"
                                    : charCount > 0
                                      ? "rgb(148,163,184)"
                                      : "rgb(203,213,225)",
                              }}
                            >
                              {charCount}/{field.maxLength}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
