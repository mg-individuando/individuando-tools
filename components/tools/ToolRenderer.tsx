"use client";

import { useState } from "react";
import type { ToolSchema, Section, Field } from "@/lib/schemas/tool-schema";
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
  /** Builder callbacks for inline editing */
  onSectionUpdate?: (sectionIndex: number, updates: Partial<Section>) => void;
  onFieldUpdate?: (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => void;
}

export default function ToolRenderer({
  schema,
  initialValues = {},
  readOnly = false,
  onSubmit,
  onSectionClick,
  selectedSectionIndex,
  onSectionUpdate,
  onFieldUpdate,
}: ToolRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const builderProps = {
    onSectionClick,
    selectedSectionIndex,
    onSectionUpdate,
    onFieldUpdate,
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
            {...builderProps}
          />
        );

      case "radar":
        return (
          <RadarChart
            sections={schema.sections}
            values={values as Record<string, number>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...builderProps}
          />
        );

      case "ikigai":
        return (
          <IkigaiDiagram
            sections={schema.sections}
            values={values as Record<string, string>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...builderProps}
          />
        );

      case "category_grid":
        return (
          <CategoryGrid
            sections={schema.sections}
            values={values as Record<string, boolean>}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...builderProps}
          />
        );

      case "dynamic_table":
        return (
          <DynamicTable
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...builderProps}
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
            {...builderProps}
          />
        );

      default:
        return (
          <FreeLayout
            sections={schema.sections}
            values={values}
            onChange={(id, val) => handleChange(id, val)}
            readOnly={readOnly}
            {...builderProps}
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
