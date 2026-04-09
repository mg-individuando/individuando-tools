"use client";

import { useState } from "react";
import type { Section } from "@/lib/schemas/tool-schema";
import { Heart, Star, Globe, Banknote, Compass } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  heart: Heart,
  star: Star,
  globe: Globe,
  banknote: Banknote,
  compass: Compass,
};

/* Gradient pairs for main circles keyed by position */
const circleGradients: Record<string, { from: string; to: string }> = {
  "circle-top": { from: "#EC4899", to: "#F472B6" },
  "circle-right": { from: "#F59E0B", to: "#FBBF24" },
  "circle-bottom": { from: "#10B981", to: "#34D399" },
  "circle-left": { from: "#3B82F6", to: "#60A5FA" },
};

interface IkigaiDiagramProps {
  sections: Section[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  readOnly?: boolean;
}

export default function IkigaiDiagram({
  sections,
  values,
  onChange,
  readOnly = false,
}: IkigaiDiagramProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const mainCircles = sections.filter((s) => s.position?.startsWith("circle-"));
  const intersections = sections.filter((s) => s.position?.startsWith("intersect-"));
  const centerSection = sections.find((s) => s.position === "center");

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ─── Decorative SVG Venn Diagram (desktop only) ─── */}
      <div className="hidden md:flex justify-center mb-10">
        <svg
          viewBox="0 0 420 420"
          className="w-[420px] h-[420px]"
          style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.06))" }}
        >
          <defs>
            {/* Gradients for each circle */}
            <radialGradient id="ik-grad-top" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.08" />
            </radialGradient>
            <radialGradient id="ik-grad-right" cx="40%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.08" />
            </radialGradient>
            <radialGradient id="ik-grad-bottom" cx="50%" cy="60%" r="55%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.08" />
            </radialGradient>
            <radialGradient id="ik-grad-left" cx="60%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.08" />
            </radialGradient>

            {/* Center golden radial */}
            <radialGradient id="ik-grad-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
            </radialGradient>

            {/* Subtle breathing animation */}
            <style>{`
              @keyframes ik-breathe {
                0%, 100% { r: 120; opacity: 1; }
                50% { r: 123; opacity: 0.92; }
              }
              .ik-circle { animation: ik-breathe 5s ease-in-out infinite; }
              .ik-circle:nth-child(2) { animation-delay: -1.25s; }
              .ik-circle:nth-child(3) { animation-delay: -2.5s; }
              .ik-circle:nth-child(4) { animation-delay: -3.75s; }
            `}</style>
          </defs>

          {/* Four overlapping circles */}
          <circle className="ik-circle" cx="210" cy="140" r="120" fill="url(#ik-grad-top)" stroke="#EC4899" strokeWidth="1.5" strokeOpacity="0.25" />
          <circle className="ik-circle" cx="280" cy="210" r="120" fill="url(#ik-grad-right)" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.25" />
          <circle className="ik-circle" cx="210" cy="280" r="120" fill="url(#ik-grad-bottom)" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.25" />
          <circle className="ik-circle" cx="140" cy="210" r="120" fill="url(#ik-grad-left)" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.25" />

          {/* Main circle labels */}
          <text x="210" y="46" textAnchor="middle" fill="#EC4899" fontSize="11" fontWeight="700" letterSpacing="0.05em" opacity="0.8">AMO</text>
          <text x="378" y="214" textAnchor="middle" fill="#F59E0B" fontSize="11" fontWeight="700" letterSpacing="0.05em" opacity="0.8">FAZ BEM</text>
          <text x="210" y="390" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="700" letterSpacing="0.05em" opacity="0.8">MUNDO PRECISA</text>
          <text x="42" y="214" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="700" letterSpacing="0.05em" opacity="0.8">PAGO</text>

          {/* Intersection labels */}
          <text x="275" y="138" textAnchor="middle" fill="#E87530" fontSize="10" fontWeight="600" opacity="0.7">Paixao</text>
          <text x="275" y="290" textAnchor="middle" fill="#14B8A6" fontSize="10" fontWeight="600" opacity="0.7">Profissao</text>
          <text x="145" y="290" textAnchor="middle" fill="#06B6D4" fontSize="10" fontWeight="600" opacity="0.7">Vocacao</text>
          <text x="145" y="138" textAnchor="middle" fill="#8B5CF6" fontSize="10" fontWeight="600" opacity="0.7">Missao</text>

          {/* Center IKIGAI circle */}
          <circle cx="210" cy="210" r="32" fill="url(#ik-grad-center)" stroke="#D97706" strokeWidth="2" strokeOpacity="0.4" />
          <text x="210" y="207" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" letterSpacing="0.12em">IKIGAI</text>
          <text x="210" y="220" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="7.5" fontWeight="500">proposito</text>
        </svg>
      </div>

      {/* ─── Main 4 Circle Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {mainCircles.map((section) => {
          const Icon = section.icon ? iconMap[section.icon] : null;
          const field = section.fields[0];
          const gradient = circleGradients[section.position || ""] || {
            from: section.color || "#6366f1",
            to: section.color || "#6366f1",
          };
          const baseColor = section.color || gradient.from;
          const charCount = (values[field?.id || ""] || "").length;
          const maxLen = field?.maxLength || 0;
          const progress = maxLen > 0 ? Math.min(charCount / maxLen, 1) : 0;
          const isFocused = focusedField === field?.id;

          return (
            <div
              key={section.id}
              className="group relative flex flex-col rounded-2xl p-0 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:z-20"
              style={
                {
                  "--card-color": baseColor,
                  "--grad-from": gradient.from,
                  "--grad-to": gradient.to,
                } as React.CSSProperties
              }
            >
              {/* Glass card inner */}
              <div
                className="relative flex flex-col flex-1 overflow-hidden rounded-2xl m-0.5 backdrop-blur-xl transition-shadow duration-300 ease-out group-hover:shadow-lg group-hover:shadow-black/5"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.68) 100%)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              >
                {/* Gradient header strip */}
                <div
                  className="h-1.5 w-full shrink-0"
                  style={{
                    background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
                  }}
                />

                <div className="flex flex-col flex-1 p-5 pt-4">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-1.5">
                    {Icon && (
                      <div
                        className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                        }}
                      >
                        <Icon className="w-[18px] h-[18px]" style={{ color: "#fff" }} />
                      </div>
                    )}
                    <h3
                      className="font-bold text-[17px] leading-tight tracking-tight"
                      style={{
                        color: baseColor,
                        textShadow: `0 1px 2px ${baseColor}18`,
                      }}
                    >
                      {section.label}
                    </h3>
                  </div>

                  {/* Description */}
                  {section.description && (
                    <p className="text-[13px] leading-relaxed text-slate-400 italic pl-12 mb-3 -mt-0.5">
                      {section.description}
                    </p>
                  )}

                  {/* Textarea */}
                  {field && (
                    <div className="mt-auto">
                      <textarea
                        value={values[field.id] || ""}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        required={field.required}
                        readOnly={readOnly}
                        rows={4}
                        className="w-full rounded-xl bg-transparent p-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-300 placeholder:italic border-0 outline-none resize-none transition-all duration-300 ease-out"
                        style={{
                          boxShadow: isFocused
                            ? `inset 0 2px 6px ${baseColor}12, 0 0 0 2px ${baseColor}30`
                            : "inset 0 2px 6px rgba(0,0,0,0.04)",
                          background: isFocused
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(255,255,255,0.35)",
                        }}
                        onFocus={() => setFocusedField(field.id)}
                        onBlur={() => setFocusedField(null)}
                      />

                      {/* Character count progress bar */}
                      {field.maxLength != null && field.maxLength > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${progress * 100}%`,
                                background:
                                  progress > 0.9
                                    ? `linear-gradient(90deg, ${gradient.from}, #ef4444)`
                                    : `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
                                opacity: charCount > 0 ? 1 : 0,
                              }}
                            />
                          </div>
                          <span
                            className="text-[11px] tabular-nums transition-colors duration-300"
                            style={{
                              color:
                                progress > 0.9
                                  ? "#ef4444"
                                  : charCount > 0
                                    ? "rgb(148,163,184)"
                                    : "rgb(203,213,225)",
                            }}
                          >
                            {charCount}/{field.maxLength}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Intersections ─── */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Intersecoes
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {intersections.map((section) => {
            const field = section.fields[0];
            const baseColor = section.color || "#6366f1";
            const charCount = (values[field?.id || ""] || "").length;
            const maxLen = field?.maxLength || 0;
            const progress = maxLen > 0 ? Math.min(charCount / maxLen, 1) : 0;
            const isFocused = focusedField === field?.id;

            return (
              <div
                key={section.id}
                className="group relative rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)",
                  border: `1px solid ${baseColor}20`,
                }}
              >
                {/* Thin accent line at top */}
                <div
                  className="h-[3px] w-full rounded-t-xl"
                  style={{ background: baseColor, opacity: 0.35 }}
                />

                <div className="p-4 pt-3">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: baseColor }}
                    />
                    <h4
                      className="font-semibold text-sm"
                      style={{ color: baseColor }}
                    >
                      {section.label}
                    </h4>
                  </div>

                  {section.description && (
                    <p className="text-[12px] leading-relaxed text-slate-400 italic mb-2 pl-4">
                      {section.description}
                    </p>
                  )}

                  {field && (
                    <div>
                      <textarea
                        value={values[field.id] || ""}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        readOnly={readOnly}
                        rows={2}
                        className="w-full rounded-lg bg-transparent p-2.5 text-sm leading-relaxed text-slate-700 placeholder:text-slate-300 placeholder:italic border-0 outline-none resize-none transition-all duration-300 ease-out"
                        style={{
                          boxShadow: isFocused
                            ? `inset 0 2px 4px ${baseColor}10, 0 0 0 1.5px ${baseColor}28`
                            : "inset 0 1px 4px rgba(0,0,0,0.03)",
                          background: isFocused
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.3)",
                        }}
                        onFocus={() => setFocusedField(field.id)}
                        onBlur={() => setFocusedField(null)}
                      />

                      {/* Character count progress bar */}
                      {field.maxLength != null && field.maxLength > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-[2px] rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${progress * 100}%`,
                                background: progress > 0.9 ? "#ef4444" : baseColor,
                                opacity: charCount > 0 ? 0.6 : 0,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] tabular-nums"
                            style={{
                              color:
                                progress > 0.9
                                  ? "#ef4444"
                                  : charCount > 0
                                    ? "rgb(148,163,184)"
                                    : "rgb(203,213,225)",
                            }}
                          >
                            {charCount}/{field.maxLength}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Center: IKIGAI ─── */}
      {centerSection &&
        (() => {
          const CenterIcon = centerSection.icon ? iconMap[centerSection.icon] : null;
          const field = centerSection.fields[0];
          const baseColor = centerSection.color || "#D97706";
          const charCount = (values[field?.id || ""] || "").length;
          const maxLen = field?.maxLength || 0;
          const progress = maxLen > 0 ? Math.min(charCount / maxLen, 1) : 0;
          const isFocused = focusedField === field?.id;

          return (
            <div
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/10"
              style={{
                background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 40%, #FDE68A 100%)",
                border: "1px solid rgba(217,119,6,0.2)",
              }}
            >
              {/* Golden gradient top strip */}
              <div
                className="h-2 w-full"
                style={{
                  background: "linear-gradient(90deg, #F59E0B, #D97706, #B45309, #D97706, #F59E0B)",
                }}
              />

              <div className="p-6 text-center">
                {/* Icon and title */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  {CenterIcon && (
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-full shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        boxShadow: "0 4px 14px rgba(217,119,6,0.3)",
                      }}
                    >
                      <CenterIcon className="w-5 h-5" style={{ color: "#fff" }} />
                    </div>
                  )}
                  <h3
                    className="font-extrabold text-xl tracking-tight"
                    style={{
                      color: "#92400E",
                      textShadow: "0 1px 2px rgba(146,64,14,0.1)",
                    }}
                  >
                    {centerSection.label}
                  </h3>
                </div>

                {centerSection.description && (
                  <p className="text-[13px] leading-relaxed text-amber-700/60 italic mb-4 max-w-lg mx-auto">
                    {centerSection.description}
                  </p>
                )}

                {field && (
                  <div className="max-w-2xl mx-auto">
                    <textarea
                      value={values[field.id] || ""}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      required={field.required}
                      readOnly={readOnly}
                      rows={4}
                      className="w-full rounded-xl bg-transparent p-3 text-sm leading-relaxed text-amber-900 placeholder:text-amber-400/60 placeholder:italic border-0 outline-none resize-none transition-all duration-300 ease-out"
                      style={{
                        boxShadow: isFocused
                          ? "inset 0 2px 6px rgba(217,119,6,0.08), 0 0 0 2px rgba(217,119,6,0.25)"
                          : "inset 0 2px 6px rgba(0,0,0,0.04)",
                        background: isFocused
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.5)",
                      }}
                      onFocus={() => setFocusedField(field.id)}
                      onBlur={() => setFocusedField(null)}
                    />

                    {/* Character count progress bar */}
                    {field.maxLength != null && field.maxLength > 0 && (
                      <div className="mt-2 flex items-center gap-2 max-w-xs mx-auto">
                        <div className="flex-1 h-[3px] rounded-full bg-amber-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${progress * 100}%`,
                              background:
                                progress > 0.9
                                  ? "linear-gradient(90deg, #F59E0B, #ef4444)"
                                  : "linear-gradient(90deg, #F59E0B, #D97706)",
                              opacity: charCount > 0 ? 1 : 0,
                            }}
                          />
                        </div>
                        <span
                          className="text-[11px] tabular-nums"
                          style={{
                            color:
                              progress > 0.9
                                ? "#ef4444"
                                : charCount > 0
                                  ? "rgb(180,83,9)"
                                  : "rgb(217,169,99)",
                          }}
                        >
                          {charCount}/{field.maxLength}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
