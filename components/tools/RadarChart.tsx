"use client";

import { useMemo, useId } from "react";
import type { Section, Field } from "@/lib/schemas/tool-schema";
import SectionIcon from "./SectionIcon";
import InlineEdit from "./InlineEdit";

interface RadarChartProps {
  sections: Section[];
  values: Record<string, number>;
  onChange: (fieldId: string, value: number) => void;
  readOnly?: boolean;
  size?: number;
  onSectionClick?: (sectionIndex: number) => void;
  selectedSectionIndex?: number;
  onSectionUpdate?: (sectionIndex: number, updates: Partial<Section>) => void;
  onFieldUpdate?: (sectionIndex: number, fieldIndex: number, updates: Partial<Field>) => void;
}

/**
 * Hex color to rgba helper (handles #RGB and #RRGGBB).
 */
function hexToRgba(hex: string, alpha: number): string {
  let r = 0, g = 0, b = 0;
  const h = hex.replace("#", "");
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length === 6) {
    r = parseInt(h.substring(0, 2), 16);
    g = parseInt(h.substring(2, 4), 16);
    b = parseInt(h.substring(4, 6), 16);
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function RadarChart({
  sections,
  values,
  onChange,
  readOnly = false,
  size = 400,
  onSectionClick,
  selectedSectionIndex,
  onSectionUpdate,
  onFieldUpdate,
}: RadarChartProps) {
  const isBuilder = !!onSectionUpdate;
  const uid = useId().replace(/:/g, "");
  const center = size / 2;
  const maxRadius = size * 0.36;
  const levels = 10;
  const n = sections.length;

  const points = useMemo(() => {
    return sections.map((section, i) => {
      const field = section.fields[0];
      const value = values[field.id] ?? (field.defaultValue as number) ?? 0;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const radius = (value / levels) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        angle,
        section,
        field,
        value,
      };
    });
  }, [sections, values, center, maxRadius, levels, n]);

  // Polygon path for the filled data area
  const polygonPath =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  // Grid polygon paths (n-gons)
  const gridPolygons = useMemo(() => {
    return Array.from({ length: levels }, (_, lvl) => {
      const r = ((lvl + 1) / levels) * maxRadius;
      const path = Array.from({ length: n }, (__, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const px = center + r * Math.cos(angle);
        const py = center + r * Math.sin(angle);
        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
      }).join(" ") + " Z";
      return { path, level: lvl };
    });
  }, [center, maxRadius, levels, n]);

  // Label positions
  const labels = useMemo(() => {
    return points.map((p, i) => {
      const labelRadius = maxRadius + 32;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const lx = center + labelRadius * Math.cos(angle);
      const ly = center + labelRadius * Math.sin(angle);
      const cos = Math.cos(angle);
      let anchor: "start" | "middle" | "end" = "middle";
      if (cos > 0.3) anchor = "start";
      else if (cos < -0.3) anchor = "end";
      return { x: lx, y: ly, anchor, label: p.section.label, color: p.section.color || "#0080ff" };
    });
  }, [points, maxRadius, center, n]);

  const primaryColor = "#0080ff";
  const primaryColorHex = "#0080ff";

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Radar SVG Section */}
      <div
        className="relative w-full max-w-[460px] mx-auto p-4 transition-all duration-200"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(0,128,255,0.1)",
          boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
          borderRadius: "16px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "rgba(0,128,255,0.16) 0px 8px 32px";
          e.currentTarget.style.borderColor = "rgba(0,128,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "rgba(0,128,255,0.08) 0px 4px 24px";
          e.currentTarget.style.borderColor = "rgba(0,128,255,0.1)";
        }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id={`${uid}-areaGrad`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.06" />
            </radialGradient>
          </defs>

          {/* Grid polygons */}
          {gridPolygons.map(({ path, level }) => (
            <path
              key={level}
              d={path}
              fill={level % 2 === 0 ? "rgba(0,128,255,0.03)" : "none"}
              stroke="rgba(0,128,255,0.1)"
              strokeWidth={level === levels - 1 ? 1.2 : 0.6}
            />
          ))}

          {/* Axis lines */}
          {sections.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={center + maxRadius * Math.cos(angle)}
                y2={center + maxRadius * Math.sin(angle)}
                stroke="rgba(0,128,255,0.1)"
                strokeWidth={0.7}
              />
            );
          })}

          {/* Filled data polygon */}
          <path
            d={polygonPath}
            fill={`url(#${uid}-areaGrad)`}
            stroke={primaryColor}
            strokeWidth={2}
            strokeLinejoin="round"
            className="transition-all duration-300 ease-out"
          />

          {/* Data points */}
          {points.map((p, i) => {
            const color = p.section.color || primaryColor;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className="transition-all duration-300 ease-out"
              />
            );
          })}

          {/* Labels around the radar */}
          {labels.map((l, i) => (
            <text
              key={`label-${i}`}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              dominantBaseline="central"
              className="text-[11px] font-semibold tracking-tight"
              fill="#0f172a"
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Dimension cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {sections.map((section, sectionIndex) => {
          const field = section.fields[0];
          const value = values[field.id] ?? (field.defaultValue as number) ?? 0;
          const color = section.color || primaryColorHex;
          const min = field.min ?? 0;
          const max = field.max ?? 10;
          const pct = ((value - min) / (max - min)) * 100;

          return (
            <div
              key={section.id}
              className={`overflow-hidden transition-all duration-200 ${onSectionClick ? "cursor-pointer" : ""} ${onSectionClick && selectedSectionIndex === sectionIndex ? "ring-2 ring-[#0080ff] ring-offset-2" : ""}`}
              onClick={onSectionClick ? (e) => { e.stopPropagation(); onSectionClick(sectionIndex); } : undefined}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(0,128,255,0.1)",
                boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
                borderRadius: "16px",
                borderLeft: `3px solid ${color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "rgba(0,128,255,0.16) 0px 8px 32px";
                e.currentTarget.style.borderColor = "rgba(0,128,255,0.2)";
                e.currentTarget.style.borderLeftColor = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "rgba(0,128,255,0.08) 0px 4px 24px";
                e.currentTarget.style.borderColor = "rgba(0,128,255,0.1)";
                e.currentTarget.style.borderLeftColor = color;
              }}
            >
              <div className="px-4 py-3.5">
                {/* Label + value */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                      }}
                    >
                      <SectionIcon icon={section.icon} size={18} className="text-white" />
                    </div>
                    {isBuilder ? (
                      <InlineEdit
                        value={section.label}
                        onChange={(v) => onSectionUpdate!(sectionIndex, { label: v })}
                        tag="span"
                        className="font-semibold text-[15px] text-[#0f172a] leading-tight"
                        placeholder="Dimensão"
                      />
                    ) : (
                      <span className="font-semibold text-[15px] text-[#0f172a] leading-tight">
                        {section.label}
                      </span>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg text-xs font-bold text-white px-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    }}
                  >
                    {value}
                  </span>
                </div>

                {/* Slider */}
                <div className="px-1">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={field.step ?? 1}
                    value={value}
                    onChange={(e) => onChange(field.id, parseInt(e.target.value))}
                    disabled={readOnly}
                    className="radar-slider w-full h-1.5 appearance-none rounded-full cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(0,128,255,0.1) ${pct}%, rgba(0,128,255,0.1) 100%)`,
                      ["--slider-color" as string]: color,
                      ["--slider-shadow" as string]: hexToRgba(color, 0.25),
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider styles */}
      <style>{`
        .radar-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid var(--slider-color, #0080ff);
          box-shadow: 0 1px 3px var(--slider-shadow, rgba(0,128,255,0.25));
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .radar-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .radar-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid var(--slider-color, #0080ff);
          box-shadow: 0 1px 3px var(--slider-shadow, rgba(0,128,255,0.25));
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .radar-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
        .radar-slider::-moz-range-track {
          background: transparent;
          border: none;
          height: 6px;
        }
        .radar-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
