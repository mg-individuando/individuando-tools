"use client";

import { useState } from "react";

/* ===================================================================
   Sample SWOT data used across all 4 style demos
   =================================================================== */
interface DemoField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: string[];
}

interface DemoSection {
  id: string;
  label: string;
  description: string;
  color: string;
  position: string;
  fields: DemoField[];
}

const SWOT_SECTIONS: DemoSection[] = [
  {
    id: "strengths",
    label: "Forças",
    description: "Quais são seus pontos fortes e recursos internos?",
    color: "#059669",
    position: "top-left",
    fields: [
      { id: "s1", type: "text_long", label: "Principais forças", placeholder: "Ex: Experiência em liderança, boa comunicação..." },
      { id: "s2", type: "scale", label: "Confiança nas suas forças", min: 1, max: 10 },
    ],
  },
  {
    id: "weaknesses",
    label: "Fraquezas",
    description: "Quais áreas precisam de desenvolvimento?",
    color: "#DC2626",
    position: "top-right",
    fields: [
      { id: "w1", type: "text_long", label: "Áreas de melhoria", placeholder: "Ex: Gestão do tempo, delegação..." },
      { id: "w2", type: "scale", label: "Urgência de melhoria", min: 1, max: 10 },
    ],
  },
  {
    id: "opportunities",
    label: "Oportunidades",
    description: "Que oportunidades externas você pode aproveitar?",
    color: "#2563EB",
    position: "bottom-left",
    fields: [
      { id: "o1", type: "text_long", label: "Oportunidades identificadas", placeholder: "Ex: Novo mercado, networking, certificações..." },
      { id: "o2", type: "radio", label: "Prioridade", options: ["Alta", "Média", "Baixa"] },
    ],
  },
  {
    id: "threats",
    label: "Ameaças",
    description: "Que fatores externos podem impactar negativamente?",
    color: "#D97706",
    position: "bottom-right",
    fields: [
      { id: "t1", type: "text_long", label: "Ameaças potenciais", placeholder: "Ex: Concorrência, mudanças no mercado..." },
      { id: "t2", type: "checkbox", label: "Já tenho um plano de contingência" },
    ],
  },
];

/* ===================================================================
   Style selector
   =================================================================== */
const STYLES = [
  { id: "airtable", label: "Airtable", desc: "Compacto, planilha elegante" },
  { id: "figma", label: "Figma / Pitch", desc: "Colorido, cards com gradientes" },
  { id: "apple", label: "Apple", desc: "Ultra-minimalista, tipografia grande" },
  { id: "canva", label: "Canva", desc: "Visual, bordas arredondadas, sombras" },
];

export default function EstilosPage() {
  const [activeStyle, setActiveStyle] = useState("airtable");

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">Comparativo de Estilos — SWOT</h1>
          <p className="text-sm text-gray-500 mt-0.5">Mesma ferramenta, 4 estilos visuais diferentes</p>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-0 flex gap-1">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStyle(s.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeStyle === s.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
              <span className="hidden sm:inline text-xs ml-1.5 opacity-60">— {s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeStyle === "airtable" && <AirtableStyle />}
        {activeStyle === "figma" && <FigmaStyle />}
        {activeStyle === "apple" && <AppleStyle />}
        {activeStyle === "canva" && <CanvaStyle />}
      </div>
    </div>
  );
}

/* ===================================================================
   1. AIRTABLE STYLE — Compact, elegant spreadsheet
   =================================================================== */
function AirtableStyle() {
  return (
    <div>
      <StyleBadge
        name="Airtable"
        traits={["Compacto", "Informação densa", "Bordas finas", "Ícones pequenos", "Header com cor sólida"]}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Toolbar-like header */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1e2f4c] flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">S</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Análise SWOT — Liderança</span>
          </div>
          <span className="text-xs text-gray-400">4 quadrantes</span>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-200">
          {SWOT_SECTIONS.map((section) => (
            <div key={section.id} className="p-0">
              {/* Section header — colored bar */}
              <div
                className="px-3 py-2 flex items-center gap-2 border-b"
                style={{ backgroundColor: `${section.color}08`, borderLeftWidth: "3px", borderLeftColor: section.color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {section.label}
                </span>
              </div>

              {/* Fields — compact table-like rows */}
              <div className="divide-y divide-gray-100">
                {section.fields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 px-3 py-2">
                    <label className="text-xs text-gray-500 w-32 shrink-0 truncate">{field.label}</label>
                    {field.type === "text_long" ? (
                      <textarea
                        placeholder={field.placeholder}
                        className="flex-1 text-xs bg-transparent border-0 text-gray-800 placeholder:text-gray-300 resize-none outline-none py-1"
                        rows={2}
                      />
                    ) : field.type === "scale" ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="range" min={field.min} max={field.max} defaultValue={5} className="flex-1 h-1 accent-gray-700" />
                        <span className="text-xs text-gray-400 w-4 text-right">5</span>
                      </div>
                    ) : field.type === "radio" ? (
                      <div className="flex gap-3">
                        {field.options?.map((opt) => (
                          <label key={opt} className="flex items-center gap-1 text-xs text-gray-600">
                            <input type="radio" name={field.id} className="w-3 h-3 accent-gray-700" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-center gap-1.5 text-xs text-gray-600">
                        <input type="checkbox" className="w-3 h-3 rounded accent-gray-700" />
                        {field.label}
                      </label>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors">
          Enviar Respostas
        </button>
      </div>
    </div>
  );
}

/* ===================================================================
   2. FIGMA / PITCH STYLE — Colorful, expressive, gradient cards
   =================================================================== */
function FigmaStyle() {
  const gradients = [
    "linear-gradient(135deg, #059669, #10B981)",
    "linear-gradient(135deg, #DC2626, #F87171)",
    "linear-gradient(135deg, #2563EB, #60A5FA)",
    "linear-gradient(135deg, #D97706, #FBBF24)",
  ];

  return (
    <div>
      <StyleBadge
        name="Figma / Pitch"
        traits={["Gradientes vibrantes", "Cards grandes", "Texto branco sobre cor", "Sombras profundas", "Expressivo"]}
      />

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Análise SWOT</h2>
        <p className="text-base text-gray-400 mt-2 font-light">Mapeie seus pontos fortes, fraquezas, oportunidades e ameaças</p>
      </div>

      {/* Grid 2x2 with gradient cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SWOT_SECTIONS.map((section, idx) => (
          <div
            key={section.id}
            className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
            style={{ background: gradients[idx] }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />

            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-1">{section.label}</h3>
              <p className="text-sm text-white/70 mb-5">{section.description}</p>

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.id}>
                    <label className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5 block">
                      {field.label}
                    </label>
                    {field.type === "text_long" ? (
                      <textarea
                        placeholder={field.placeholder}
                        className="w-full bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 border border-white/20 outline-none focus:bg-white/25 transition-colors resize-none"
                        rows={3}
                      />
                    ) : field.type === "scale" ? (
                      <div className="flex items-center gap-3">
                        <input type="range" min={field.min} max={field.max} defaultValue={5} className="flex-1 h-2 accent-white rounded-full" />
                        <div className="bg-white/20 rounded-lg px-2.5 py-1 text-sm font-bold">5</div>
                      </div>
                    ) : field.type === "radio" ? (
                      <div className="flex gap-2 flex-wrap">
                        {field.options?.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-sm cursor-pointer hover:bg-white/25 transition-colors"
                          >
                            <input type="radio" name={field.id} className="accent-white" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-sm cursor-pointer hover:bg-white/25 transition-colors">
                        <input type="checkbox" className="w-4 h-4 accent-white rounded" />
                        {field.label}
                      </label>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-center">
        <button className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
          Enviar Respostas
        </button>
      </div>
    </div>
  );
}

/* ===================================================================
   3. APPLE STYLE — Ultra-minimal, lots of whitespace, large typography
   =================================================================== */
function AppleStyle() {
  return (
    <div>
      <StyleBadge
        name="Apple"
        traits={["Ultra-minimalista", "Tipografia grande", "Muito espaço em branco", "Sem bordas", "Foco no conteúdo"]}
      />

      {/* Title — massive, centered */}
      <div className="text-center mb-16 mt-4">
        <h2 className="text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
          Análise SWOT
        </h2>
        <p className="text-lg text-gray-400 mt-4 font-light max-w-lg mx-auto leading-relaxed">
          Mapeie seus pontos fortes, fraquezas, oportunidades e ameaças.
        </p>
      </div>

      {/* Sections — stacked vertically with massive spacing */}
      <div className="max-w-2xl mx-auto space-y-20">
        {SWOT_SECTIONS.map((section) => (
          <div key={section.id}>
            {/* Section label — large, bold, colored dot */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
              <h3 className="text-2xl font-semibold text-gray-900">{section.label}</h3>
            </div>
            <p className="text-gray-400 text-base mb-8 -mt-2 ml-6">{section.description}</p>

            <div className="space-y-8 ml-6">
              {section.fields.map((field) => (
                <div key={field.id}>
                  <label className="text-sm font-medium text-gray-500 mb-3 block">
                    {field.label}
                  </label>
                  {field.type === "text_long" ? (
                    <textarea
                      placeholder={field.placeholder}
                      className="w-full bg-transparent text-lg text-gray-900 placeholder:text-gray-200 outline-none resize-none border-b border-gray-100 focus:border-gray-300 transition-colors pb-3"
                      rows={2}
                    />
                  ) : field.type === "scale" ? (
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-gray-300">{field.min}</span>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        defaultValue={5}
                        className="flex-1 h-[2px] accent-gray-900"
                      />
                      <span className="text-xs text-gray-300">{field.max}</span>
                      <span className="text-3xl font-light text-gray-900 w-10 text-center">5</span>
                    </div>
                  ) : field.type === "radio" ? (
                    <div className="flex gap-3">
                      {field.options?.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-base text-gray-600 cursor-pointer"
                        >
                          <input type="radio" name={field.id} className="w-5 h-5 accent-gray-900" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-3 text-base text-gray-600 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded accent-gray-900" />
                      {field.label}
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit — minimal */}
      <div className="mt-20 flex justify-center">
        <button className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
          Enviar
        </button>
      </div>
    </div>
  );
}

/* ===================================================================
   4. CANVA STYLE — Visual, rounded, soft shadows, illustrated
   =================================================================== */
function CanvaStyle() {
  const bgColors = ["#ECFDF5", "#FEF2F2", "#EFF6FF", "#FFFBEB"];
  const iconEmojis = ["💪", "🎯", "🚀", "⚡"];

  return (
    <div>
      <StyleBadge
        name="Canva"
        traits={["Visual/ilustrativo", "Bordas muito arredondadas", "Sombras suaves", "Cores pastel", "Emojis como ícones"]}
      />

      {/* Title — friendly, illustrated */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-800">Análise SWOT</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Mapeie seus pontos fortes, fraquezas, oportunidades e ameaças para traçar seu plano de ação
        </p>
      </div>

      {/* Grid 2x2 with pastel cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SWOT_SECTIONS.map((section, idx) => (
          <div
            key={section.id}
            className="rounded-3xl p-6 relative"
            style={{
              backgroundColor: bgColors[idx],
              boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header with emoji */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${section.color}15` }}
              >
                {iconEmojis[idx]}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">{section.label}</h3>
                <p className="text-xs text-gray-500">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.id}>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">
                    {field.label}
                  </label>
                  {field.type === "text_long" ? (
                    <textarea
                      placeholder={field.placeholder}
                      className="w-full bg-white rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 border-0 outline-none focus:ring-2 transition-all resize-none"
                      style={{ "--tw-ring-color": `${section.color}33` } as React.CSSProperties}
                      rows={3}
                    />
                  ) : field.type === "scale" ? (
                    <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        defaultValue={5}
                        className="flex-1 h-2 rounded-full"
                        style={{ accentColor: section.color }}
                      />
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: section.color }}
                      >
                        5
                      </div>
                    </div>
                  ) : field.type === "radio" ? (
                    <div className="flex gap-2 flex-wrap">
                      {field.options?.map((opt) => (
                        <label
                          key={opt}
                          className="bg-white rounded-full px-4 py-2 text-sm text-gray-700 cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5"
                        >
                          <input type="radio" name={field.id} style={{ accentColor: section.color }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:shadow-md transition-all">
                      <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: section.color }} />
                      {field.label}
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit — friendly */}
      <div className="mt-8 flex justify-center">
        <button
          className="px-8 py-3.5 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          <span>Enviar Respostas</span>
          <span>✨</span>
        </button>
      </div>
    </div>
  );
}

/* ===================================================================
   Style Badge — Shows style name and key traits
   =================================================================== */
function StyleBadge({ name, traits }: { name: string; traits: string[] }) {
  return (
    <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 flex items-center gap-4">
      <div className="bg-gray-900 text-white text-sm font-bold px-3 py-1.5 rounded-lg shrink-0">
        {name}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {traits.map((t) => (
          <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
