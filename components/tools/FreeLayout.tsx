"use client";

import { useState } from "react";
import type { Section, Field } from "@/lib/schemas/tool-schema";
import SectionIcon from "./SectionIcon";

interface FreeLayoutProps {
  sections: Section[];
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
}

export default function FreeLayout({
  sections,
  values,
  onChange,
  readOnly = false,
}: FreeLayoutProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function renderField(field: Field, sectionColor: string, rawColor?: string) {
    const focusRing = rawColor ? `0 0 0 3px ${rawColor}33` : `0 0 0 3px color-mix(in srgb, var(--brand) 20%, transparent)`;
    const fieldValue = values[field.id];

    switch (field.type) {
      case "text_short":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-muted-foreground">
                {field.label}
                {field.required && <span className="text-destructive/70 ml-0.5">*</span>}
              </label>
            )}
            <input
              type="text"
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
              readOnly={readOnly}
              className="w-full rounded-xl border-0 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-shadow"
              style={{
                boxShadow:
                  focusedField === field.id
                    ? focusRing
                    : "var(--shadow-xs)",
              }}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground/60">
                  {((fieldValue as string) || "").length} / {field.maxLength}
                </span>
              </div>
            )}
          </div>
        );

      case "text_long":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-muted-foreground">
                {field.label}
                {field.required && <span className="text-destructive/70 ml-0.5">*</span>}
              </label>
            )}
            <textarea
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              required={field.required}
              readOnly={readOnly}
              rows={4}
              className="w-full rounded-xl border-0 bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 outline-none resize-none transition-shadow"
              style={{
                boxShadow:
                  focusedField === field.id
                    ? focusRing
                    : "var(--shadow-xs)",
              }}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground/60">
                  {((fieldValue as string) || "").length} / {field.maxLength}
                </span>
              </div>
            )}
          </div>
        );

      case "scale": {
        const min = field.min ?? 0;
        const max = field.max ?? 10;
        const step = field.step ?? 1;
        const val = (fieldValue as number) ?? (field.defaultValue as number) ?? min;
        return (
          <div key={field.id} className="space-y-3">
            {field.label && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </label>
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: sectionColor }}
                >
                  {val}
                </span>
              </div>
            )}
            <div className="bg-card rounded-xl p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={(e) => onChange(field.id, parseInt(e.target.value))}
                disabled={readOnly}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${sectionColor} 0%, ${sectionColor} ${((val - min) / (max - min)) * 100}%, var(--border) ${((val - min) / (max - min)) * 100}%, var(--border) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1.5">
                <span>{min}</span>
                <span>{max}</span>
              </div>
            </div>
          </div>
        );
      }

      case "checkbox":
        return (
          <div key={field.id}>
            <label
              className="flex items-center gap-3 cursor-pointer rounded-xl bg-card px-4 py-3 transition-shadow hover:shadow-sm"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              <input
                type="checkbox"
                checked={!!fieldValue}
                onChange={(e) => onChange(field.id, e.target.checked)}
                disabled={readOnly}
                className="h-4 w-4 rounded border-border"
                style={{ accentColor: sectionColor }}
              />
              <span className="text-sm text-foreground">{field.label}</span>
            </label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
            )}
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer rounded-xl bg-card px-4 py-3 transition-shadow hover:shadow-sm"
                  style={{ boxShadow: "var(--shadow-xs)" }}
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={fieldValue === opt.value}
                    onChange={() => onChange(field.id, opt.value)}
                    disabled={readOnly}
                    className="h-4 w-4 border-border"
                    style={{ accentColor: sectionColor }}
                  />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
            )}
            <select
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={readOnly}
              className="w-full rounded-xl border-0 bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow"
              style={{
                boxShadow:
                  focusedField === field.id
                    ? focusRing
                    : "var(--shadow-xs)",
              }}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            >
              <option value="">{field.placeholder || "Selecione..."}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
            )}
            <input
              type="date"
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              readOnly={readOnly}
              className="w-full rounded-xl border-0 bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow"
              style={{
                boxShadow:
                  focusedField === field.id
                    ? focusRing
                    : "var(--shadow-xs)",
              }}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {sections.map((section) => {
        const color = section.color || "var(--brand)";
        const colorBg = section.color ? `${section.color}14` : "color-mix(in srgb, var(--brand) 8%, transparent)";

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

            {/* Section header */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <SectionIcon icon={section.icon} size={24} />
                <h3
                  className="font-bold text-base leading-tight"
                  style={{ color }}
                >
                  {section.label}
                </h3>
              </div>
              {section.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1 ml-[36px]">
                  {section.description}
                </p>
              )}
            </div>

            {/* Section fields */}
            <div className="px-6 pb-6 pt-2 space-y-4">
              {section.fields.map((field) => renderField(field, color, section.color))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
