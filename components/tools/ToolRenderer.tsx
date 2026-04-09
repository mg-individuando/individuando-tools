"use client";

import { useState } from "react";
import type { ToolSchema } from "@/lib/schemas/tool-schema";
import SwotGrid from "./SwotGrid";
import RadarChart from "./RadarChart";
import IkigaiDiagram from "./IkigaiDiagram";
import CategoryGrid from "./CategoryGrid";
import DynamicTable from "./DynamicTable";
import FreeLayout from "./FreeLayout";

interface ToolRendererProps {
  schema: ToolSchema;
  initialValues?: Record<string, unknown>;
  readOnly?: boolean;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export default function ToolRenderer({
  schema,
  initialValues = {},
  readOnly = false,
  onSubmit,
}: ToolRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderTool = () => {
    switch (schema.layout) {
      case "swot":
        return (
          <SwotGrid
            sections={schema.sections}
            values={values as Record<string, string>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );

      case "radar":
        return (
          <RadarChart
            sections={schema.sections}
            values={values as Record<string, number>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );

      case "ikigai":
        return (
          <IkigaiDiagram
            sections={schema.sections}
            values={values as Record<string, string>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );

      case "category_grid":
        return (
          <CategoryGrid
            sections={schema.sections}
            values={values as Record<string, boolean>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );

      case "dynamic_table":
        return (
          <DynamicTable
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );

      case "free_layout":
      case "blank":
        return (
          <FreeLayout
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );

      default:
        return (
          <FreeLayout
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderTool()}

      {!readOnly && onSubmit && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => onSubmit(values)}
            className="px-8 py-3 text-white font-semibold text-lg
              shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            style={{
              borderRadius: "var(--card-radius, 16px)",
              background: `linear-gradient(135deg, ${schema.theme?.primaryColor || "#2D5A7B"}, ${schema.theme?.primaryColor || "#2D5A7B"}dd)`,
            }}
          >
            Enviar Respostas
          </button>
        </div>
      )}
    </div>
  );
}
