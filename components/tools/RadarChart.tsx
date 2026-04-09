"use client";

import { useMemo, useId } from "react";
import type { Section } from "@/lib/schemas/tool-schema";

interface RadarChartProps {
  sections: Section[];
  values: Record<string, number>;
  onChange: (fieldId: string, value: number) => void;
  readOnly?: boolean;
  size?: number;
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
}: RadarChartProps) {
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

  // Grid polygon paths (pentagons / n-gons) instead of circles
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

  // Label positions — pushed further out with smart text-anchor
  const labels = useMemo(() => {
    return points.map((p, i) => {
      const labelRadius = maxRadius + 32;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const lx = center + labelRadius * Math.cos(angle);
      const ly = center + labelRadius * Math.sin(angle);
      // determine anchor based on position
      const cos = Math.cos(angle);
      let anchor: "start" | "middle" | "end" = "middle";
      if (cos > 0.3) anchor = "start";
      else if (cos < -0.3) anchor = "end";
      return { x: lx, y: ly, anchor, label: p.section.label, color: p.section.color || "#2D5A7B" };
    });
  }, [points, maxRadius, center, n]);

  // Primary color for the polygon gradient
  const primaryColor = "#2D5A7B";

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Radar SVG Section */}
      <div className="relative w-full max-w-[460px] mx-auto">
        {/* Glass background glow */}
        <div
          className="absolute inset-0 rounded-3xl opacity-40 blur-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${hexToRgba(primaryColor, 0.15)}, transparent 70%)`,
          }}
        />

        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full relative z-10"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Polygon area gradient */}
            <radialGradient id={`${uid}-areaGrad`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.08" />
            </radialGradient>

            {/* Glow filter for data points */}
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Drop shadow for polygon stroke */}
            <filter id={`${uid}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid polygons */}
          {gridPolygons.map(({ path, level }) => (
            <path
              key={level}
              d={path}
              fill="none"
              stroke={level === levels - 1 ? "#cbd5e1" : "#e2e8f0"}
              strokeWidth={level === levels - 1 ? 1.2 : 0.6}
              opacity={level % 2 === 1 ? 0.5 : 0.8}
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
                stroke="#cbd5e1"
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
            filter={`url(#${uid}-shadow)`}
            className="transition-all duration-500 ease-out"
          />

          {/* Animated data points */}
          {points.map((p, i) => {
            const color = p.section.color || primaryColor;
            return (
              <g key={i} filter={`url(#${uid}-glow)`}>
                {/* Pulse ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={0.4}
                  className="animate-[radar-pulse_2.5s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.15}s`, transformOrigin: `${p.x}px ${p.y}px` }}
                />
                {/* Solid point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={color}
                  stroke="white"
                  strokeWidth={2.5}
                  className="transition-all duration-300 ease-out"
                />
              </g>
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
              style={{ fontSize: "11px", fontWeight: 600, fill: "#475569", letterSpacing: "0.01em" }}
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Keyframe style for the pulse animation */}
      <style>{`
        @keyframes radar-pulse {
          0%, 100% { r: 6; opacity: 0.4; }
          50% { r: 12; opacity: 0; }
        }
      `}</style>

      {/* Dimension cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {sections.map((section) => {
          const field = section.fields[0];
          const value = values[field.id] ?? (field.defaultValue as number) ?? 0;
          const color = section.color || primaryColor;
          const min = field.min ?? 0;
          const max = field.max ?? 10;
          const pct = ((value - min) / (max - min)) * 100;

          return (
            <div
              key={section.id}
              className="relative rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/80 px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Top row: colored dot + label + value badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1"
                    style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${hexToRgba(color, 0.3)}` }}
                  />
                  <span className="text-sm font-semibold text-slate-700 leading-tight">
                    {section.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color,
                    backgroundColor: hexToRgba(color, 0.1),
                  }}
                >
                  {value}/{max}
                </span>
              </div>

              {/* Custom slider */}
              <div className="relative group">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={field.step ?? 1}
                  value={value}
                  onChange={(e) => onChange(field.id, parseInt(e.target.value))}
                  disabled={readOnly}
                  className="radar-slider w-full h-2 appearance-none rounded-full cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
                    // CSS custom properties for thumb styling
                    ["--slider-color" as string]: color,
                    ["--slider-shadow" as string]: hexToRgba(color, 0.35),
                  }}
                />
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
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--slider-color, #2D5A7B);
          box-shadow: 0 1px 4px var(--slider-shadow, rgba(45,90,123,0.35)), 0 0 0 3px rgba(255,255,255,0.8);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .radar-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px var(--slider-shadow, rgba(45,90,123,0.5)), 0 0 0 3px rgba(255,255,255,0.9);
        }
        .radar-slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        .radar-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--slider-color, #2D5A7B);
          box-shadow: 0 1px 4px var(--slider-shadow, rgba(45,90,123,0.35)), 0 0 0 3px rgba(255,255,255,0.8);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .radar-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
        .radar-slider::-moz-range-track {
          background: transparent;
          border: none;
          height: 8px;
        }
        .radar-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
