"use client";

import type { Section } from "@/lib/schemas/tool-schema";
import {
  BookOpen, Flame, Users, Scale, Shield, Sparkles, Check,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "book-open": BookOpen,
  flame: Flame,
  users: Users,
  scale: Scale,
  shield: Shield,
  sparkles: Sparkles,
};

interface CategoryGridProps {
  sections: Section[];
  values: Record<string, boolean>;
  onChange: (fieldId: string, value: boolean) => void;
  readOnly?: boolean;
}

/* Circular progress ring for each category */
function ProgressRing({
  progress,
  total,
  color,
  size = 40,
  strokeWidth = 3,
}: {
  progress: number;
  total: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? progress / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span
        className="absolute text-[10px] font-bold"
        style={{ color: progress > 0 ? color : "#b0b0b0" }}
      >
        {progress}
      </span>
    </div>
  );
}

export default function CategoryGrid({
  sections,
  values,
  onChange,
  readOnly = false,
}: CategoryGridProps) {
  const totalSelected = Object.values(values).filter(Boolean).length;
  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* --- Summary bar --- */}
      <div
        className="relative mb-8 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(45,90,123,0.06) 0%, rgba(45,90,123,0.02) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(45,90,123,0.12)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#2D5A7B]/60" />
            <span className="text-sm font-medium text-gray-500 tracking-wide">
              Forcas selecionadas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: "#2D5A7B" }}>
              {totalSelected}
            </span>
            <span className="text-sm text-gray-400">/ {totalFields}</span>
          </div>
        </div>
        {/* progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className="h-full rounded-r-full"
            style={{
              width: `${totalFields > 0 ? (totalSelected / totalFields) * 100 : 0}%`,
              background: "linear-gradient(90deg, #2D5A7B, #4A90B8)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* --- Category cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const Icon = section.icon ? iconMap[section.icon] : null;
          const selectedInCategory = section.fields.filter((f) => values[f.id]).length;
          const color = section.color || "#2D5A7B";

          return (
            <div
              key={section.id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              {/* Gradient accent strip at top */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                }}
              />

              <div className="p-5">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-1">
                  {Icon && (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                        border: `1px solid ${color}20`,
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm tracking-wide truncate"
                      style={{ color }}
                    >
                      {section.label}
                    </h3>
                  </div>
                  <ProgressRing
                    progress={selectedInCategory}
                    total={section.fields.length}
                    color={color}
                  />
                </div>

                {section.description && (
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    {section.description}
                  </p>
                )}

                {/* Checkboxes */}
                <div className="space-y-2">
                  {section.fields.map((field) => {
                    const isChecked = !!values[field.id];

                    return (
                      <label
                        key={field.id}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          background: isChecked
                            ? `linear-gradient(135deg, ${color}10, ${color}06)`
                            : "transparent",
                          border: isChecked
                            ? `1px solid ${color}30`
                            : "1px solid transparent",
                          boxShadow: isChecked
                            ? `0 0 12px ${color}10, 0 1px 3px ${color}08`
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked) {
                            e.currentTarget.style.background = "rgba(0,0,0,0.02)";
                            e.currentTarget.style.border = "1px solid rgba(0,0,0,0.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.border = "1px solid transparent";
                          }
                        }}
                      >
                        {/* Custom checkbox */}
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => onChange(field.id, e.target.checked)}
                            disabled={readOnly}
                            className="sr-only peer"
                          />
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                            style={{
                              background: isChecked
                                ? `linear-gradient(135deg, ${color}, ${color}CC)`
                                : "white",
                              border: isChecked
                                ? `1.5px solid ${color}`
                                : "1.5px solid #d1d5db",
                              boxShadow: isChecked
                                ? `0 2px 8px ${color}40`
                                : "inset 0 1px 2px rgba(0,0,0,0.06)",
                            }}
                          >
                            <Check
                              className="w-3 h-3 text-white transition-all duration-200"
                              style={{
                                opacity: isChecked ? 1 : 0,
                                transform: isChecked ? "scale(1)" : "scale(0.5)",
                              }}
                              strokeWidth={3}
                            />
                          </div>
                        </div>

                        <span
                          className="text-sm leading-snug transition-colors duration-200"
                          style={{
                            color: isChecked ? "#1f2937" : "#6b7280",
                            fontWeight: isChecked ? 600 : 400,
                          }}
                        >
                          {field.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Selected strengths summary --- */}
      {totalSelected > 0 && (
        <div
          className="mt-8 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-6 py-5">
            <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2 tracking-wide">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "linear-gradient(135deg, #2D5A7B, #4A90B8)" }}
              />
              Suas forcas selecionadas
            </h4>
            <div className="flex flex-wrap gap-2">
              {sections.flatMap((section) =>
                section.fields
                  .filter((f) => values[f.id])
                  .map((f) => {
                    const c = section.color || "#2D5A7B";
                    return (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${c}, ${c}CC)`,
                          boxShadow: `0 2px 8px ${c}30`,
                        }}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                        {f.label?.split("\u2014")[0]?.trim()}
                      </span>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
