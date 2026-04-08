"use client";

import { useState } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import { Plus, Trash2 } from "lucide-react";

interface TableRow {
  id: string;
  [key: string]: string;
}

interface DynamicTableProps {
  sections: Section[];
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
}

export default function DynamicTable({ sections, values, onChange, readOnly = false }: DynamicTableProps) {
  const section = sections[0];
  if (!section) return null;

  const columns = section.fields;
  const rowsKey = `${section.id}_rows`;

  // Get existing rows from values or start with one empty row
  const getRows = (): TableRow[] => {
    const existing = values[rowsKey] as TableRow[] | undefined;
    if (existing && Array.isArray(existing) && existing.length > 0) return existing;
    return [createEmptyRow()];
  };

  function createEmptyRow(): TableRow {
    const row: TableRow = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
    columns.forEach((col) => { row[col.id] = ""; });
    return row;
  }

  const [rows, setRows] = useState<TableRow[]>(getRows);

  const updateRows = (newRows: TableRow[]) => {
    setRows(newRows);
    onChange(rowsKey, newRows);
  };

  const addRow = () => {
    updateRows([...rows, createEmptyRow()]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    updateRows(newRows);
  };

  const updateCell = (rowIndex: number, fieldId: string, value: string) => {
    const newRows = rows.map((row, i) =>
      i === rowIndex ? { ...row, [fieldId]: value } : row
    );
    updateRows(newRows);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {col.label}
                  {col.required && <span className="text-red-400 ml-0.5">*</span>}
                </th>
              ))}
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-2 py-2 text-sm text-gray-400 font-mono">
                  {rowIndex + 1}
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="px-1 py-1">
                    <input
                      type="text"
                      value={row[col.id] || ""}
                      onChange={(e) => updateCell(rowIndex, col.id, e.target.value)}
                      placeholder={col.placeholder}
                      readOnly={readOnly}
                      className="w-full px-2 py-2 text-sm border border-transparent rounded-lg
                        placeholder:text-gray-400 hover:border-gray-200 focus:border-blue-300
                        focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all bg-transparent"
                    />
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-1 py-1">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      disabled={rows.length <= 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                        transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remover linha"
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

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <div key={row.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Meta {rowIndex + 1}
              </span>
              {!readOnly && rows.length > 1 && (
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {columns.map((col) => (
                <div key={col.id}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {col.label}
                    {col.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    value={row[col.id] || ""}
                    onChange={(e) => updateCell(rowIndex, col.id, e.target.value)}
                    placeholder={col.placeholder}
                    readOnly={readOnly}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white
                      placeholder:text-gray-400 focus:border-blue-300 focus:outline-none
                      focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add row button */}
      {!readOnly && (
        <button
          onClick={addRow}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3
            rounded-xl border-2 border-dashed border-gray-300 text-gray-500
            hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50
            transition-all font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Meta
        </button>
      )}

      {/* Row count */}
      <p className="text-xs text-gray-400 mt-2 text-center">
        {rows.length} {rows.length === 1 ? "meta" : "metas"} cadastrada{rows.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
