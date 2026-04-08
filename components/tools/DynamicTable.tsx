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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${section?.color || "#2D5A7B"}20` }}
          >
            <Target className="w-4 h-4" style={{ color: section?.color || "#2D5A7B" }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{section?.label}</h3>
            {section?.description && (
              <p className="text-xs text-gray-400">{section.description}</p>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {rows.length} {rows.length === 1 ? "meta" : "metas"}
        </span>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-8">#</th>
              {fields.map((field) => (
                <th
                  key={field.id}
                  className="px-3 py-2.5 text-left font-semibold text-gray-600"
                >
                  {field.label}
                </th>
              ))}
              {!readOnly && (
                <th className="px-3 py-2.5 text-center font-semibold text-gray-600 w-12" />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-3 py-2 text-gray-400 font-medium">{index + 1}</td>
                {fields.map((field) => (
                  <td key={field.id} className="px-3 py-2">
                    {field.type === "text_long" ? (
                      <textarea
                        value={row[field.id] || ""}
                        onChange={(e) => updateField(row.id, field.id, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        readOnly={readOnly}
                        rows={2}
                        className="w-full min-w-[150px] rounded border border-gray-200 bg-white px-2.5 py-1.5
                          text-sm placeholder:text-gray-300 focus:outline-none focus:ring-1
                          focus:ring-[#2D5A7B]/30 resize-none transition-all"
                      />
                    ) : (
                      <input
                        type="text"
                        value={row[field.id] || ""}
                        onChange={(e) => updateField(row.id, field.id, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        readOnly={readOnly}
                        className="w-full min-w-[100px] rounded border border-gray-200 bg-white px-2.5 py-1.5
                          text-sm placeholder:text-gray-300 focus:outline-none focus:ring-1
                          focus:ring-[#2D5A7B]/30 transition-all"
                      />
                    )}
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50
                        disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Remover meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => {
          const isExpanded = expandedRow === row.id;
          const metaName = row[fields[0]?.id] || `Meta ${index + 1}`;

          return (
            <div
              key={row.id}
              className="rounded-xl border bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleExpand(row.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: section?.color || "#2D5A7B" }}
                >
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-sm text-gray-800 truncate">
                  {metaName || "Nova meta..."}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t">
                  {fields.map((field) => (
                    <div key={field.id} className="pt-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
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
                          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm
                            placeholder:text-gray-300 focus:outline-none focus:ring-1
                            focus:ring-[#2D5A7B]/30 resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[field.id] || ""}
                          onChange={(e) => updateField(row.id, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          readOnly={readOnly}
                          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm
                            placeholder:text-gray-300 focus:outline-none focus:ring-1
                            focus:ring-[#2D5A7B]/30"
                        />
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30
                        disabled:cursor-not-allowed mt-2 transition-colors"
                    >
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
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3
            rounded-xl border-2 border-dashed border-gray-200 text-gray-400
            hover:border-[#2D5A7B]/30 hover:text-[#2D5A7B] hover:bg-[#2D5A7B]/5
            transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Adicionar Meta</span>
        </button>
      )}
    </div>
  );
}
