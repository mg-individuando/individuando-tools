"use client";

import { useState } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import SectionIcon from "./SectionIcon";

interface DynamicTableProps {
  sections: Section[];
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
}

interface MetaRow {
  id: string;
  [key: string]: string;
}

export default function DynamicTable({
  sections,
  values,
  onChange,
  readOnly = false,
}: DynamicTableProps) {
  const section = sections[0];
  const fields = section?.fields || [];
  const color = section?.color || "#2D5A7B";

  function createEmptyRow(): MetaRow {
    const row: MetaRow = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
    fields.forEach((f) => {
      row[f.id] = "";
    });
    return row;
  }

  const getInitialRows = (): MetaRow[] => {
    const existing = values["metas_rows"] as MetaRow[] | undefined;
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    return [createEmptyRow()];
  };

  const [rows, setRows] = useState<MetaRow[]>(getInitialRows);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const updateRows = (newRows: MetaRow[]) => {
    setRows(newRows);
    onChange("metas_rows", newRows);
  };

  const addRow = () => {
    const newRow = createEmptyRow();
    const newRows = [...rows, newRow];
    updateRows(newRows);
    setExpandedRow(newRow.id);
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) return;
    updateRows(rows.filter((r) => r.id !== rowId));
    if (expandedRow === rowId) setExpandedRow(null);
  };

  const updateField = (rowId: string, fieldId: string, value: string) => {
    updateRows(
      rows.map((r) => (r.id === rowId ? { ...r, [fieldId]: value } : r))
    );
  };

  const toggleExpand = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-5 px-6 py-4 overflow-hidden"
        style={{
          backgroundColor: `${color}14`,
          borderRadius: "var(--card-radius, 16px)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <SectionIcon icon={section?.icon} size={24} />
          <div>
            <h3 className="font-bold text-base" style={{ color }}>
              {section?.label}
            </h3>
            {section?.description && (
              <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
            )}
          </div>
        </div>
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {rows.length} {rows.length === 1 ? "meta" : "metas"}
        </span>
      </div>

      {/* Desktop: table layout */}
      <div
        className="hidden md:block overflow-hidden"
        style={{
          backgroundColor: `${color}0A`,
          borderRadius: "var(--card-radius, 16px)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Table header */}
        <div
          className="flex items-center gap-0 px-5 py-3"
          style={{ backgroundColor: `${color}10` }}
        >
          <div className="w-12 shrink-0 text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            #
          </div>
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex-1 text-xs font-semibold uppercase tracking-wider px-2"
              style={{ color }}
            >
              {field.label}
            </div>
          ))}
          {!readOnly && <div className="w-10 shrink-0" />}
        </div>

        {/* Table rows */}
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="flex items-start gap-0 px-5 py-3"
            style={{
              backgroundColor: index % 2 === 0 ? "transparent" : `${color}06`,
            }}
          >
            {/* Row number */}
            <div className="w-12 shrink-0 pt-2">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {index + 1}
              </span>
            </div>

            {/* Fields */}
            {fields.map((field) => (
              <div key={field.id} className="flex-1 px-2">
                {field.type === "text_long" ? (
                  <textarea
                    value={row[field.id] || ""}
                    onChange={(e) => updateField(row.id, field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    readOnly={readOnly}
                    rows={2}
                    className="w-full rounded-xl border-0 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 resize-none outline-none transition-shadow focus:shadow-md"
                    style={{
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={row[field.id] || ""}
                    onChange={(e) => updateField(row.id, field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    readOnly={readOnly}
                    className="w-full rounded-xl border-0 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 outline-none transition-shadow focus:shadow-md"
                    style={{
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  />
                )}
              </div>
            ))}

            {/* Delete button */}
            {!readOnly && (
              <div className="w-10 shrink-0 pt-1.5">
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Remover meta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: card layout per row */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => {
          const isExpanded = expandedRow === row.id;
          const metaName = row[fields[0]?.id] || `Meta ${index + 1}`;

          return (
            <div
              key={row.id}
              className="overflow-hidden"
              style={{
                backgroundColor: `${color}14`,
                borderRadius: "var(--card-radius, 16px)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <button
                onClick={() => toggleExpand(row.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
              >
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-sm text-gray-800 truncate">
                  {metaName || "Nova meta..."}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color }}>
                        {field.label}
                      </label>
                      {field.type === "text_long" ? (
                        <textarea
                          value={row[field.id] || ""}
                          onChange={(e) => updateField(row.id, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          readOnly={readOnly}
                          rows={3}
                          className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 resize-none outline-none transition-shadow focus:shadow-md"
                          style={{
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[field.id] || ""}
                          onChange={(e) => updateField(row.id, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          readOnly={readOnly}
                          className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 outline-none transition-shadow focus:shadow-md"
                          style={{
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          }}
                        />
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover esta meta
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add row button */}
      {!readOnly && (
        <button
          onClick={addRow}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 font-semibold text-sm transition-all hover:shadow-md"
          style={{
            border: `2px dashed ${color}40`,
            borderRadius: "var(--card-radius, 16px)",
            color,
            backgroundColor: `${color}08`,
          }}
        >
          <Plus className="w-4 h-4" />
          Adicionar Meta
        </button>
      )}
    </div>
  );
}
