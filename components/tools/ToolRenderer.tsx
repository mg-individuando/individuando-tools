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
  onSectionClick?: (sectionIndex: number) => void;
  selectedSectionIndex?: number;
}

export default function ToolRenderer({
  schema,
  initialValues = {},
  readOnly = false,
  onSubmit,
  onSectionClick,
  selectedSectionIndex,
}: ToolRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const sectionSelectProps = {
    onSectionClick,
    selectedSectionIndex,
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
            {...sectionSelectProps}
          />
        );

      case "radar":
        return (
          <RadarChart
            sections={schema.sections}
            values={values as Record<string, number>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...sectionSelectProps}
          />
        );

      case "ikigai":
        return (
          <IkigaiDiagram
            sections={schema.sections}
            values={values as Record<string, string>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...sectionSelectProps}
          />
        );

      case "category_grid":
        return (
          <CategoryGrid
            sections={schema.sections}
            values={values as Record<string, boolean>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...sectionSelectProps}
          />
        );

      case "dynamic_table":
        return (
          <DynamicTable
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...sectionSelectProps}
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
            {...sectionSelectProps}
          />
        );

      default:
        return (
          <FreeLayout
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...sectionSelectProps}
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
            className="btn-primary text-base px-10 py-3.5"
            style={{ background: "var(--gradient-primary)" }}
          >
            Enviar Respostas
          </button>
        </div>
      )}
    </div>
  );
}
