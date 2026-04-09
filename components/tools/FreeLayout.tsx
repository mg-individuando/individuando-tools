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

  function renderField(field: Field, sectionColor: string) {
    const fieldValue = values[field.id];

    switch (field.type) {
      case "text_short":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-xs font-medium text-muted-foreground">
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
              className={[
                "w-full rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground/50 outline-none transition-all duration-200",
                focusedField === field.id
                  ? "bg-card border-primary/40 ring-2 ring-primary/10"
                  : "border-border",
              ].join(" ")}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground/50">
                  {((fieldValue as string) || "").length}/{field.maxLength}
                </span>
              </div>
            )}
          </div>
        );

      case "text_long":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-xs font-medium text-muted-foreground">
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
              className={[
                "w-full rounded-lg border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-foreground",
                "placeholder:text-muted-foreground/50 outline-none resize-none transition-all duration-200",
                focusedField === field.id
                  ? "bg-card border-primary/40 ring-2 ring-primary/10"
                  : "border-border",
              ].join(" ")}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground/50">
                  {((fieldValue as string) || "").length}/{field.maxLength}
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
          <div key={field.id} className="space-y-2.5">
            {field.label && (
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </label>
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: sectionColor }}
                >
                  {val}
                </span>
              </div>
            )}
            <div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={(e) => onChange(field.id, parseInt(e.target.value))}
                disabled={readOnly}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${sectionColor} 0%, ${sectionColor} ${((val - min) / (max - min)) * 100}%, var(--border) ${((val - min) / (max - min)) * 100}%, var(--border) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1">
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
              className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-muted/50"
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
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
            )}
            <div className="space-y-1">
              {field.options?.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-muted/50"
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
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
            )}
            <select
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={readOnly}
              className={[
                "w-full rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-foreground",
                "outline-none transition-all duration-200",
                focusedField === field.id
                  ? "bg-card border-primary/40 ring-2 ring-primary/10"
                  : "border-border",
              ].join(" ")}
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
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
            )}
            <input
              type="date"
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              readOnly={readOnly}
              className={[
                "w-full rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-foreground",
                "outline-none transition-all duration-200",
                focusedField === field.id
                  ? "bg-card border-primary/40 ring-2 ring-primary/10"
                  : "border-border",
              ].join(" ")}
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
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {sections.map((section) => {
        const color = section.color || "var(--brand)";
        const iconBg = section.color ? `${section.color}14` : "color-mix(in srgb, var(--brand) 8%, transparent)";

        return (
          <div
            key={section.id}
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            {/* Section header */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: iconBg }}
                >
                  <SectionIcon icon={section.icon} size={18} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-semibold text-sm leading-tight"
                    style={{ color }}
                  >
                    {section.label}
                  </h3>
                  {section.description && (
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section fields */}
            <div className="px-5 pb-5 pt-2 space-y-3.5">
              {section.fields.map((field) => renderField(field, color))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
