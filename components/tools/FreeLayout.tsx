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
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
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
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-offset-0"
              style={{
                boxShadow: focusedField === field.id ? `0 0 0 2px ${sectionColor}25` : "none",
                borderColor: focusedField === field.id ? sectionColor : undefined,
              }}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-xs text-gray-400">
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
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
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
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-relaxed text-gray-700 placeholder:text-gray-400 outline-none resize-none transition-colors focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-offset-0"
              style={{
                boxShadow: focusedField === field.id ? `0 0 0 2px ${sectionColor}25` : "none",
                borderColor: focusedField === field.id ? sectionColor : undefined,
              }}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
            />
            {field.maxLength != null && field.maxLength > 0 && (
              <div className="text-right">
                <span className="text-xs text-gray-400">
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
          <div key={field.id} className="space-y-2">
            {field.label && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <span className="text-sm font-bold" style={{ color: sectionColor }}>
                  {val}
                  <span className="text-xs font-normal text-gray-400">/{max}</span>
                </span>
              </div>
            )}
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
                background: `linear-gradient(to right, ${sectionColor} 0%, ${sectionColor} ${((val - min) / (max - min)) * 100}%, #e2e8f0 ${((val - min) / (max - min)) * 100}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        );
      }

      case "checkbox":
        return (
          <div key={field.id}>
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={!!fieldValue}
                onChange={(e) => onChange(field.id, e.target.checked)}
                disabled={readOnly}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
            )}
            <div className="space-y-1">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={fieldValue === opt.value}
                    onChange={() => onChange(field.id, opt.value)}
                    disabled={readOnly}
                    className="h-4 w-4 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "dropdown":
        return (
          <div key={field.id} className="space-y-1.5">
            {field.label && (
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
            )}
            <select
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={readOnly}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 focus:bg-white"
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
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
            )}
            <input
              type="date"
              value={(fieldValue as string) || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              readOnly={readOnly}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 focus:bg-white"
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
        const color = section.color || "#2D5A7B";

        return (
          <div
            key={section.id}
            className="bg-white rounded-lg overflow-hidden"
            style={{
              border: "1px solid #e2e8f0",
              borderLeft: `4px solid ${color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {/* Section header */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2.5 mb-1">
                <SectionIcon icon={section.icon} size={22} />
                <h3
                  className="font-semibold text-base leading-tight"
                  style={{ color }}
                >
                  {section.label}
                </h3>
              </div>
              {section.description && (
                <p className="text-sm text-gray-500 leading-relaxed mt-1">
                  {section.description}
                </p>
              )}
            </div>

            {/* Section fields */}
            <div className="px-5 pb-5 pt-2 space-y-4">
              {section.fields.map((field) => renderField(field, color))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
