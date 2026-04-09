"use client";

import { useState } from "react";
import type { Section, Field } from "@/lib/schemas/tool-schema";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import SectionIcon from "./SectionIcon";
import InlineEdit from "./InlineEdit";

interface DynamicTableProps {
  sections: Section[];
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
  onSectionClick?: (sectionIndex: number) => void;
  selectedSectionIndex?: number;
  onSectionUpdate?: (sectionIndex: number, updates: Partial<Section>) => void;
  onFieldUpdate?: (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => void;
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
  onSectionClick,
  selectedSectionIndex,
  onSectionUpdate,
  onFieldUpdate,
}: DynamicTableProps) {
  const section = sections[0];
  const fields = section?.fields || [];
  const color = section?.color || "#0080ff";
  const isBuilder = !!onSectionUpdate;

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

  const glassCard: React.CSSProperties = {
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,128,255,0.1)",
    boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
    borderRadius: "16px",
  };

  const glassHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = "rgba(0,128,255,0.16) 0px 8px 32px";
    e.currentTarget.style.borderColor = "rgba(0,128,255,0.2)";
  };

  const glassLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = "rgba(0,128,255,0.08) 0px 4px 24px";
    e.currentTarget.style.borderColor = "rgba(0,128,255,0.1)";
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-5 px-6 py-4 transition-all duration-200"
        style={glassCard}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            }}
          >
            <SectionIcon icon={section?.icon} size={20} className="text-white" />
          </div>
          <div>
            {isBuilder ? (
              <>
                <InlineEdit
                  value={section?.label || ""}
                  onChange={(v) => onSectionUpdate!(0, { label: v })}
                  tag="h3"
                  className="font-semibold text-[15px] text-[#0f172a]"
                  placeholder="Nome da tabela"
                />
                <InlineEdit
                  value={section?.description || ""}
                  onChange={(v) => onSectionUpdate!(0, { description: v })}
                  tag="p"
                  className="text-[13px] text-[#475569] mt-0.5"
                  placeholder="Descrição"
                />
              </>
            ) : (
              <>
                <h3 className="font-semibold text-[15px] text-[#0f172a]">
                  {section?.label}
                </h3>
                {section?.description && (
                  <p className="text-[13px] text-[#475569] mt-0.5">{section.description}</p>
                )}
              </>
            )}
          </div>
        </div>
        <span
          className="text-sm font-semibold px-3 py-1 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${color}18, ${color}10)`,
            color,
          }}
        >
          {rows.length} {rows.length === 1 ? "meta" : "metas"}
        </span>
      </div>

      {/* Desktop: table layout */}
      <div
        className="hidden md:block overflow-hidden transition-all duration-200"
        style={glassCard}
        onMouseEnter={glassHover}
        onMouseLeave={glassLeave}
      >
        {/* Table header */}
        <div
          className="flex items-center gap-0 px-5 py-3"
          style={{ background: "rgba(0,128,255,0.03)" }}
        >
          <div className="w-12 shrink-0 text-xs font-semibold text-[#0f172a] uppercase tracking-wider">
            #
          </div>
          {fields.map((field, fieldIndex) => (
            <div
              key={field.id}
              className="flex-1 text-xs font-semibold text-[#0f172a] uppercase tracking-wider px-2"
            >
              {isBuilder ? (
                <InlineEdit
                  value={field.label || ""}
                  onChange={(v) => onFieldUpdate!(0, fieldIndex, { label: v })}
                  tag="span"
                  className="text-xs font-semibold text-[#0f172a] uppercase tracking-wider"
                  placeholder="Coluna"
                />
              ) : (
                field.label
              )}
            </div>
          ))}
          {!readOnly && <div className="w-10 shrink-0" />}
        </div>

        {/* Table rows */}
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="flex items-start gap-0 px-5 py-3 transition-all duration-200"
            style={{
              backgroundColor: index % 2 === 0 ? "transparent" : "rgba(0,128,255,0.02)",
            }}
          >
            <div className="w-12 shrink-0 pt-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                }}
              >
                {index + 1}
              </span>
            </div>

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
                    className="w-full glass-input resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={row[field.id] || ""}
                    onChange={(e) => updateField(row.id, field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    readOnly={readOnly}
                    className="w-full glass-input"
                  />
                )}
              </div>
            ))}

            {!readOnly && (
              <div className="w-10 shrink-0 pt-1.5">
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94a3b8] hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
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
              className="overflow-hidden transition-all duration-200"
              style={glassCard}
            >
              <button
                onClick={() => toggleExpand(row.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-white/40"
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold text-white shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  }}
                >
                  {index + 1}
                </span>
                <span className="flex-1 font-semibold text-sm text-[#0f172a] truncate">
                  {metaName || "Nova meta..."}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#94a3b8] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5 block">
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
                          className="w-full glass-input resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[field.id] || ""}
                          onChange={(e) => updateField(row.id, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          readOnly={readOnly}
                          className="w-full glass-input"
                        />
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 px-2 py-1.5 rounded-xl"
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
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-[rgba(0,128,255,0.2)] rounded-2xl font-semibold text-sm transition-all duration-200 hover:border-[#0080ff]/40 hover:bg-white/60 hover:shadow-lg"
          style={{ color }}
        >
          <Plus className="w-4 h-4" />
          Adicionar Meta
        </button>
      )}
    </div>
  );
}
