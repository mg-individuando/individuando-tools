"use client";

import { useState } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import { Plus, Trash2, Target, ChevronDown, ChevronUp } from "lucide-react";

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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${color}18, ${color}08)`,
              border: `1px solid ${color}20`,
            }}
          >
            <Target className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{section?.label}</h3>
            {section?.description && (
              <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
            )}
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            color,
            border: `1px solid ${color}20`,
          }}
        >
          {rows.length} {rows.length === 1 ? "meta" : "metas"}
        </div>
      </div>

      {/* Desktop card-based rows */}
      <div className="hidden md:block space-y-3">
        {/* Sticky header with frosted glass */}
        <div
          className="sticky top-0 z-10 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div className="w-9 flex-shrink-0" />
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex-1 text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              {field.label}
            </div>
          ))}
          {!readOnly && <div className="w-10 flex-shrink-0" />}
        </div>

        {/* Row cards */}
        {rows.map((row, index) => {
          const isHovered = hoveredRow === row.id;

          return (
            <div
              key={row.id}
              className="rounded-xl flex items-start gap-3 px-4 py-3 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: isHovered
                  ? "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"
                  : "0 2px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)",
                transform: isHovered ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Row number badge */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm mt-0.5"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}BB)`,
                  boxShadow: `0 2px 8px ${color}30`,
                }}
              >
                {index + 1}
              </div>

              {/* Fields */}
              {fields.map((field) => (
                <div key={field.id} className="flex-1 min-w-0">
                  {field.type === "text_long" ? (
                    <textarea
                      value={row[field.id] || ""}
                      onChange={(e) => updateField(row.id, field.id, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      readOnly={readOnly}
                      rows={2}
                      className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-gray-700
                        placeholder:text-gray-300 border-0 resize-none transition-all duration-200
                        focus:outline-none"
                      style={{
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                        background: "rgba(0,0,0,0.015)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.04), 0 0 0 2px ${color}30`;
                        e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.04)";
                        e.currentTarget.style.background = "rgba(0,0,0,0.015)";
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
                      className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-gray-700
                        placeholder:text-gray-300 border-0 transition-all duration-200
                        focus:outline-none"
                      style={{
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                        background: "rgba(0,0,0,0.015)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.04), 0 0 0 2px ${color}30`;
                        e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.04)";
                        e.currentTarget.style.background = "rgba(0,0,0,0.015)";
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Delete button -- visible on hover */}
              {!readOnly && (
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="w-10 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    transition-all duration-200 mt-0.5"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    color: isHovered ? "#ef4444" : "#d1d5db",
                    background: isHovered ? "rgba(239,68,68,0.06)" : "transparent",
                    cursor: rows.length <= 1 ? "not-allowed" : "pointer",
                  }}
                  title="Remover meta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => {
          const isExpanded = expandedRow === row.id;
          const metaName = row[fields[0]?.id] || `Meta ${index + 1}`;

          return (
            <div
              key={row.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: isExpanded
                  ? "0 8px 32px rgba(0,0,0,0.08)"
                  : "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              <button
                onClick={() => toggleExpand(row.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}BB)`,
                    boxShadow: `0 2px 8px ${color}30`,
                  }}
                >
                  {index + 1}
                </span>
                <span className="flex-1 font-semibold text-sm text-gray-800 truncate">
                  {metaName || "Nova meta..."}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isExpanded ? `${color}10` : "rgba(0,0,0,0.03)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  <div
                    className="h-px w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
                    }}
                  />
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block"
                        style={{ color: `${color}90` }}
                      >
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
                          className="w-full rounded-xl px-3.5 py-2.5 text-sm text-gray-700
                            placeholder:text-gray-300 border-0 resize-none transition-all duration-200
                            focus:outline-none"
                          style={{
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                            background: "rgba(0,0,0,0.02)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.04), 0 0 0 2px ${color}30`;
                            e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.04)";
                            e.currentTarget.style.background = "rgba(0,0,0,0.02)";
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
                          className="w-full rounded-xl px-3.5 py-2.5 text-sm text-gray-700
                            placeholder:text-gray-300 border-0 transition-all duration-200
                            focus:outline-none"
                          style={{
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                            background: "rgba(0,0,0,0.02)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.04), 0 0 0 2px ${color}30`;
                            e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.04)";
                            e.currentTarget.style.background = "rgba(0,0,0,0.02)";
                          }}
                        />
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500
                        disabled:opacity-30 disabled:cursor-not-allowed mt-1 transition-colors
                        px-2.5 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
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
          className="mt-5 w-full flex items-center justify-center gap-2.5 px-5 py-3.5
            rounded-xl text-white font-semibold text-sm
            transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            boxShadow: `0 4px 16px ${color}30, 0 2px 4px ${color}20`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 24px ${color}40, 0 2px 4px ${color}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 16px ${color}30, 0 2px 4px ${color}20`;
          }}
        >
          <Plus className="w-4.5 h-4.5" />
          Adicionar Meta
        </button>
      )}
    </div>
  );
}
