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
              <label className="text-[13px] font-medium text-[#475569]">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
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
              className="w-full glass-input"
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-[11px] text-[#94a3b8]">
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
              <label className="text-[13px] font-medium text-[#475569]">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
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
              className="w-full glass-input resize-none"
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-[11px] text-[#94a3b8]">
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
        const pct = ((val - min) / (max - min)) * 100;
        return (
          <div key={field.id} className="space-y-2.5">
            {field.label && (
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#475569]">
                  {field.label}
                </label>
                <span
                  className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg text-xs font-bold text-white px-1.5"
                  style={{
                    background: `linear-gradient(135deg, ${sectionColor}, ${sectionColor}cc)`,
                  }}
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
                className="free-slider w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                style={{
                  background: `linear-gradient(to right, ${sectionColor} 0%, ${sectionColor} ${pct}%, rgba(0,128,255,0.1) ${pct}%, rgba(0,128,255,0.1) 100%)`,
                  ["--slider-color" as string]: sectionColor,
                }}
              />
              <div className="flex justify-between text-[11px] text-[#94a3b8] mt-1">
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
              className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/50"
            >
              <input
                type="checkbox"
                checked={!!fieldValue}
                onChange={(e) => onChange(field.id, e.target.checked)}
                disabled={readOnly}
                className="h-4 w-4 rounded border-[rgba(0,128,255,0.2)]"
                style={{ accentColor: "#0080ff" }}
              />
              <span className="text-sm text-[#0f172a]">{field.label}</span>
            </label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-[13px] font-medium text-[#475569]">{field.label}</label>
            )}
            <div className="space-y-1">
              {field.options?.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/50"
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={fieldValue === opt.value}
                    onChange={() => onChange(field.id, opt.value)}
                    disabled={readOnly}
                    className="h-4 w-4 border-[rgba(0,128,255,0.2)]"
                    style={{ accentColor: "#0080ff" }}
                  />
                  <span className="text-sm text-[#0f172a]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-[13px] font-medium text-[#475569]">{field.label}</label>
            )}
            <select
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={readOnly}
              className="w-full glass-input"
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
              <label className="text-[13px] font-medium text-[#475569]">{field.label}</label>
            )}
            <input
              type="date"
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              readOnly={readOnly}
              className="w-full glass-input"
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
        const color = section.color || "#0080ff";

        return (
          <div
            key={section.id}
            className="overflow-hidden transition-all duration-200"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(0,128,255,0.1)",
              boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
              borderRadius: "16px",
              borderLeft: `3px solid ${color}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "rgba(0,128,255,0.16) 0px 8px 32px";
              e.currentTarget.style.borderColor = "rgba(0,128,255,0.2)";
              e.currentTarget.style.borderLeftColor = color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "rgba(0,128,255,0.08) 0px 4px 24px";
              e.currentTarget.style.borderColor = "rgba(0,128,255,0.1)";
              e.currentTarget.style.borderLeftColor = color;
            }}
          >
            {/* Section header */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  }}
                >
                  <SectionIcon icon={section.icon} size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] text-[#0f172a] leading-tight">
                    {section.label}
                  </h3>
                  {section.description && (
                    <p className="text-[13px] text-[#475569] leading-snug mt-0.5">
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

      {/* Slider styles for scale fields */}
      <style>{`
        .free-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid var(--slider-color, #0080ff);
          box-shadow: 0 1px 3px rgba(0,128,255,0.25);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .free-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .free-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid var(--slider-color, #0080ff);
          box-shadow: 0 1px 3px rgba(0,128,255,0.25);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .free-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
        .free-slider::-moz-range-track {
          background: transparent;
          border: none;
          height: 6px;
        }
        .free-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
