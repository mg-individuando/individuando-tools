"use client";

import { useMemo } from "react";
import type { Section } from "@/lib/schemas/tool-schema";

interface RadarChartProps {
  sections: Section[];
  values: Record<string, number>;
  onChange: (fieldId: string, value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export default function RadarChart({
  sections,
  values,
  onChange,
  readOnly = false,
  size = 400,
}: RadarChartProps) {
  const center = size / 2;
  const maxRadius = size * 0.38;
  const levels = 10;

  const points = useMemo(() => {
    return sections.map((section, i) => {
      const field = section.fields[0];
      const value = values[field.id] ?? (field.defaultValue as number) ?? 0;
      const angle = (Math.PI * 2 * i) / sections.length - Math.PI / 2;
      const radius = (value / levels) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 30) * Math.cos(angle),
        labelY: center + (maxRadius + 30) * Math.sin(angle),
        angle,
        section,
        field,
        value,
      };
    });
  }, [sections, values, center, maxRadius, levels]);

  // Polygon path
  const polygonPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius;
    return (
      <circle
        key={i}
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={i === levels - 1 ? 1.5 : 0.5}
        strokeDasharray={i < levels - 1 ? "2,4" : "none"}
      />
    );
  });

  // Axis lines
  const axisLines = sections.map((_, i) => {
    const angle = (Math.PI * 2 * i) / sections.length - Math.PI / 2;
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={center + maxRadius * Math.cos(angle)}
        y2={center + maxRadius * Math.sin(angle)}
        stroke="#d1d5db"
        strokeWidth={0.5}
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* SVG Radar */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[420px]"
        style={{ overflow: "visible" }}
      >
        {/* Grid */}
        {gridCircles}
        {axisLines}

        {/* Value polygon */}
        <path
          d={polygonPath}
          fill="rgba(45, 90, 123, 0.15)"
          stroke="#2D5A7B"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={6}
            fill={p.section.color || "#2D5A7B"}
            stroke="white"
            strokeWidth={2}
            className="cursor-pointer hover:r-8 transition-all"
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs font-medium fill-gray-700"
            style={{ fontSize: "11px" }}
          >
            {p.section.label}
          </text>
        ))}

        {/* Value labels on points */}
        {points.map((p, i) => (
          <text
            key={`value-${i}`}
            x={p.x}
            y={p.y - 14}
            textAnchor="middle"
            className="text-xs font-bold"
            style={{ fontSize: "12px", fill: p.section.color || "#2D5A7B" }}
          >
            {p.value}
          </text>
        ))}
      </svg>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {sections.map((section) => {
          const field = section.fields[0];
          const value = values[field.id] ?? (field.defaultValue as number) ?? 0;

          return (
            <div key={section.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: section.color }}
              />
              <span className="text-sm font-medium text-gray-700 min-w-[100px]">
                {section.label}
              </span>
              <input
                type="range"
                min={field.min ?? 0}
                max={field.max ?? 10}
                step={field.step ?? 1}
                value={value}
                onChange={(e) => onChange(field.id, parseInt(e.target.value))}
                disabled={readOnly}
                className="flex-1 h-2 accent-current"
                style={{ accentColor: section.color }}
              />
              <span
                className="text-sm font-bold w-6 text-center"
                style={{ color: section.color }}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
