"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Image as ImageIcon,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface BannerConfig {
  backgroundType: "solid" | "gradient" | "image";
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: string;
  backgroundImage: string;
  title: string;
  titleColor: string;
  titleSize: number;
  titlePosition: "left" | "center" | "right";
  logoPosition: "left" | "center" | "right";
  showLogo: boolean;
  logoSize: number;
  logoColor: string;
  logoColorEnabled: boolean;
}

const DEFAULT_CONFIG: BannerConfig = {
  backgroundType: "gradient",
  backgroundColor: "#2D5A7B",
  gradientFrom: "#2D5A7B",
  gradientTo: "#1E3A5F",
  gradientDirection: "to right",
  backgroundImage: "",
  title: "",
  titleColor: "#FFFFFF",
  titleSize: 24,
  titlePosition: "center",
  logoPosition: "left",
  showLogo: true,
  logoSize: 40,
  logoColor: "#FFFFFF",
  logoColorEnabled: false,
};

const GRADIENT_PRESETS = [
  { from: "#2D5A7B", to: "#1E3A5F", label: "Azul Profissional" },
  { from: "#065F46", to: "#059669", label: "Verde Esmeralda" },
  { from: "#4C1D95", to: "#7C3AED", label: "Violeta" },
  { from: "#9F1239", to: "#DB2777", label: "Rosa Intenso" },
  { from: "#78350F", to: "#D97706", label: "Terracota" },
  { from: "#1E40AF", to: "#60A5FA", label: "Azul Celeste" },
  { from: "#374151", to: "#6B7280", label: "Cinza Elegante" },
  { from: "#7C2D12", to: "#EA580C", label: "Laranja Quente" },
];

const DIRECTION_OPTIONS = [
  { value: "to right", label: "Horizontal →" },
  { value: "to bottom", label: "Vertical ↓" },
  { value: "to bottom right", label: "Diagonal ↘" },
  { value: "135deg", label: "Diagonal ↗" },
];

const AI_SUGGESTIONS = [
  "Banner elegante e minimalista com tons escuros",
  "Banner vibrante e moderno para workshop de inovação",
  "Banner sofisticado com gradiente suave para coaching executivo",
  "Banner acolhedor e quente para mentoria de carreira",
  "Banner corporativo clean para treinamento empresarial",
  "Banner criativo e colorido para workshop de design thinking",
];

interface BannerCreatorProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: BannerConfig) => void;
  initialConfig?: Partial<BannerConfig>;
  logoUrl?: string;
  clientName?: string;
}

export function BannerCreator({
  open,
  onClose,
  onSave,
  initialConfig,
  logoUrl,
  clientName,
}: BannerCreatorProps) {
  const [config, setConfig] = useState<BannerConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const [activeSection, setActiveSection] = useState<string | null>("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function update<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function getBackgroundStyle(): React.CSSProperties {
    switch (config.backgroundType) {
      case "solid":
        return { backgroundColor: config.backgroundColor };
      case "gradient":
        return {
          background: `linear-gradient(${config.gradientDirection}, ${config.gradientFrom}, ${config.gradientTo})`,
        };
      case "image":
        return config.backgroundImage
          ? {
              backgroundImage: `url(${config.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: config.backgroundColor };
      default:
        return { backgroundColor: config.backgroundColor };
    }
  }

  function getLogoJustify() {
    if (config.logoPosition === "center") return "center";
    if (config.logoPosition === "right") return "flex-end";
    return "flex-start";
  }

  function getLogoStyle(): React.CSSProperties {
    const style: React.CSSProperties = {
      height: `${config.logoSize}px`,
      maxWidth: `${config.logoSize * 3}px`,
      objectFit: "contain" as const,
    };
    // Note: logo recoloring is done via SVG filter overlay, not CSS filter
    return style;
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        update("backgroundImage", result);
        update("backgroundType", "image");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleAiGenerate(prompt?: string) {
    const text = prompt || aiPrompt;
    if (!text.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          clientName,
          currentConfig: config,
        }),
      });
      const data = await res.json();
      if (data.config) {
        setConfig((prev) => ({ ...prev, ...data.config }));
        setAiHistory((prev) => [...prev, text]);
        setAiPrompt("");
      }
    } catch (err) {
      console.error("AI banner generation failed:", err);
    } finally {
      setAiLoading(false);
    }
  }

  function handleReset() {
    setConfig({ ...DEFAULT_CONFIG, ...initialConfig });
  }

  function handleSave() {
    onSave(config);
    onClose();
  }

  function toggleSection(section: string) {
    setActiveSection(activeSection === section ? null : section);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Criar Banner do Header
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Use a IA para criar automaticamente ou customize manualmente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Resetar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Live Preview — always visible at top */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-gray-700">
                Preview
              </Label>
              <span className="text-[10px] text-gray-400">1200 × 200px</span>
            </div>
            <div
              className="w-full rounded-lg overflow-hidden border shadow-sm transition-all duration-300"
              style={{
                aspectRatio: "1200 / 200",
                ...getBackgroundStyle(),
              }}
            >
              <div className="h-full flex flex-col justify-center px-6 py-3 relative">
                {/* Logo */}
                {config.showLogo && logoUrl && (
                  <div
                    className="flex items-center mb-1"
                    style={{ justifyContent: getLogoJustify() }}
                  >
                    {config.logoColorEnabled ? (
                      <div style={{ height: `${config.logoSize}px`, maxWidth: `${config.logoSize * 3}px`, position: "relative" }}>
                        {/* SVG with feColorMatrix for precise recoloring */}
                        <svg width="0" height="0" style={{ position: "absolute" }}>
                          <defs>
                            <filter id="logo-recolor">
                              <feColorMatrix
                                type="matrix"
                                values={colorMatrixFromHex(config.logoColor)}
                              />
                            </filter>
                          </defs>
                        </svg>
                        <img
                          src={logoUrl}
                          alt="Logo"
                          style={{
                            height: `${config.logoSize}px`,
                            maxWidth: `${config.logoSize * 3}px`,
                            objectFit: "contain",
                            filter: "url(#logo-recolor)",
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        style={getLogoStyle()}
                      />
                    )}
                  </div>
                )}
                {config.showLogo && !logoUrl && clientName && (
                  <div
                    className="flex items-center mb-1"
                    style={{ justifyContent: getLogoJustify() }}
                  >
                    <div
                      className="rounded-lg flex items-center justify-center text-white font-bold"
                      style={{
                        width: `${config.logoSize}px`,
                        height: `${config.logoSize}px`,
                        fontSize: `${config.logoSize * 0.45}px`,
                        backgroundColor: "rgba(255,255,255,0.25)",
                      }}
                    >
                      {clientName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                {/* Title */}
                {config.title && (
                  <p
                    className="font-semibold leading-tight truncate"
                    style={{
                      color: config.titleColor,
                      fontSize: `${Math.max(12, config.titleSize * 0.6)}px`,
                      textAlign: config.titlePosition,
                    }}
                  >
                    {config.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-1">
            {/* ===== AI Section ===== */}
            <SectionAccordion
              title="Criar com IA"
              icon={<Sparkles className="h-4 w-4" />}
              isOpen={activeSection === "ai"}
              onToggle={() => toggleSection("ai")}
              highlight
            >
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Descreva o banner que você quer e a IA cria pra você. Pode ser simples como &ldquo;banner azul elegante&rdquo;.
                </p>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {AI_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleAiGenerate(suggestion)}
                      disabled={aiLoading}
                      className="text-[11px] px-2.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-[#2D5A7B] hover:text-white hover:border-[#2D5A7B] transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Custom prompt */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Descreva o banner que você imagina..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !aiLoading) handleAiGenerate();
                    }}
                    disabled={aiLoading}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={() => handleAiGenerate()}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="bg-[#2D5A7B] hover:bg-[#1e3f56] gap-2 shrink-0"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Gerar
                  </Button>
                </div>

                {aiHistory.length > 0 && (
                  <p className="text-[10px] text-gray-400">
                    Último prompt: &ldquo;{aiHistory[aiHistory.length - 1]}&rdquo;
                  </p>
                )}
              </div>
            </SectionAccordion>

            {/* ===== Background Section ===== */}
            <SectionAccordion
              title="Fundo"
              icon={<Palette className="h-4 w-4" />}
              isOpen={activeSection === "bg"}
              onToggle={() => toggleSection("bg")}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(["solid", "gradient", "image"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => update("backgroundType", type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        config.backgroundType === type
                          ? "bg-[#2D5A7B] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type === "solid"
                        ? "Cor sólida"
                        : type === "gradient"
                          ? "Gradiente"
                          : "Imagem"}
                    </button>
                  ))}
                </div>

                {config.backgroundType === "solid" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => update("backgroundColor", e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border p-0.5 bg-transparent"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) => update("backgroundColor", e.target.value)}
                      className="font-mono text-sm w-28"
                      maxLength={7}
                    />
                  </div>
                )}

                {config.backgroundType === "gradient" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            update("gradientFrom", preset.from);
                            update("gradientTo", preset.to);
                          }}
                          title={preset.label}
                        >
                          <div
                            className={`h-8 w-16 rounded-md border-2 transition-all ${
                              config.gradientFrom === preset.from &&
                              config.gradientTo === preset.to
                                ? "border-[#2D5A7B] scale-110"
                                : "border-transparent hover:border-gray-300"
                            }`}
                            style={{
                              background: `linear-gradient(to right, ${preset.from}, ${preset.to})`,
                            }}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 w-8">De</Label>
                        <input
                          type="color"
                          value={config.gradientFrom}
                          onChange={(e) => update("gradientFrom", e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                        />
                        <Input
                          value={config.gradientFrom}
                          onChange={(e) => update("gradientFrom", e.target.value)}
                          className="font-mono text-xs w-24"
                          maxLength={7}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 w-10">Para</Label>
                        <input
                          type="color"
                          value={config.gradientTo}
                          onChange={(e) => update("gradientTo", e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                        />
                        <Input
                          value={config.gradientTo}
                          onChange={(e) => update("gradientTo", e.target.value)}
                          className="font-mono text-xs w-24"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">Direção</Label>
                      <select
                        value={config.gradientDirection}
                        onChange={(e) => update("gradientDirection", e.target.value)}
                        className="h-8 rounded-md border px-2 py-1 text-xs bg-white"
                      >
                        {DIRECTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {config.backgroundType === "image" && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {config.backgroundImage ? "Trocar imagem" : "Fazer upload"}
                    </Button>
                    {config.backgroundImage && (
                      <p className="text-xs text-green-600">✓ Imagem carregada</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Recomendado: 1200×200px. PNG, JPG ou WebP.
                    </p>
                  </div>
                )}
              </div>
            </SectionAccordion>

            {/* ===== Logo Section ===== */}
            <SectionAccordion
              title="Logo"
              icon={<ImageIcon className="h-4 w-4" />}
              isOpen={activeSection === "logo"}
              onToggle={() => toggleSection("logo")}
            >
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.showLogo}
                    onChange={(e) => update("showLogo", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Exibir logo no banner
                </label>

                {config.showLogo && (
                  <>
                    {/* Position */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">Posição</Label>
                      <div className="flex gap-1">
                        {(["left", "center", "right"] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => update("logoPosition", pos)}
                            className={`p-2 rounded-md transition-colors ${
                              config.logoPosition === pos
                                ? "bg-[#2D5A7B] text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            }`}
                            title={pos === "left" ? "Esquerda" : pos === "center" ? "Centro" : "Direita"}
                          >
                            {pos === "left" && <AlignLeft className="h-4 w-4" />}
                            {pos === "center" && <AlignCenter className="h-4 w-4" />}
                            {pos === "right" && <AlignRight className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-500">Tamanho</Label>
                        <span className="text-xs text-gray-400">{config.logoSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Minimize2 className="h-3 w-3 text-gray-400" />
                        <input
                          type="range"
                          min={20}
                          max={80}
                          value={config.logoSize}
                          onChange={(e) => update("logoSize", Number(e.target.value))}
                          className="flex-1"
                        />
                        <Maximize2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>

                    {/* Color override */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={config.logoColorEnabled}
                          onChange={(e) => update("logoColorEnabled", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        Alterar cor do logo
                      </label>
                      <p className="text-[11px] text-gray-400 ml-6">
                        Funciona melhor com logos em SVG ou monocromáticos
                      </p>
                      {config.logoColorEnabled && (
                        <div className="flex items-center gap-2 ml-6">
                          <input
                            type="color"
                            value={config.logoColor}
                            onChange={(e) => update("logoColor", e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                          />
                          <Input
                            value={config.logoColor}
                            onChange={(e) => update("logoColor", e.target.value)}
                            className="font-mono text-xs w-24"
                            maxLength={7}
                          />
                          <div className="flex gap-1.5 ml-2">
                            {["#FFFFFF", "#000000", "#2D5A7B", "#D97706", "#DC2626"].map((c) => (
                              <button
                                key={c}
                                onClick={() => update("logoColor", c)}
                                className={`h-6 w-6 rounded-full border-2 transition-all ${
                                  config.logoColor === c ? "border-[#2D5A7B] scale-110" : "border-gray-200"
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </SectionAccordion>

            {/* ===== Text Section ===== */}
            <SectionAccordion
              title="Texto (opcional)"
              icon={<Type className="h-4 w-4" />}
              isOpen={activeSection === "text"}
              onToggle={() => toggleSection("text")}
            >
              <div className="space-y-3">
                <Input
                  placeholder="Ex: Workshop de Liderança 2026"
                  value={config.title}
                  onChange={(e) => update("title", e.target.value)}
                />
                {config.title && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Cor</Label>
                        <input
                          type="color"
                          value={config.titleColor}
                          onChange={(e) => update("titleColor", e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Tamanho</Label>
                        <input
                          type="range"
                          min={14}
                          max={48}
                          value={config.titleSize}
                          onChange={(e) => update("titleSize", Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-xs text-gray-400 w-8">{config.titleSize}px</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">Alinhamento</Label>
                      <div className="flex gap-1">
                        {(["left", "center", "right"] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => update("titlePosition", pos)}
                            className={`p-2 rounded-md transition-colors ${
                              config.titlePosition === pos
                                ? "bg-[#2D5A7B] text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            }`}
                          >
                            {pos === "left" && <AlignLeft className="h-4 w-4" />}
                            {pos === "center" && <AlignCenter className="h-4 w-4" />}
                            {pos === "right" && <AlignRight className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SectionAccordion>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#2D5A7B] hover:bg-[#1e3f56]"
          >
            Salvar Banner
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===== Accordion Section Component ===== */
function SectionAccordion({
  title,
  icon,
  isOpen,
  onToggle,
  highlight,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        isOpen
          ? highlight
            ? "border-[#2D5A7B]/30 bg-[#2D5A7B]/[0.03]"
            : "border-gray-200 bg-white"
          : "border-gray-100 bg-gray-50/50"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
          highlight && !isOpen
            ? "text-[#2D5A7B]"
            : "text-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
          {highlight && (
            <span className="text-[10px] bg-[#2D5A7B] text-white px-1.5 py-0.5 rounded-full font-medium">
              Recomendado
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/**
 * Generate an SVG feColorMatrix "values" string that recolors any pixel
 * to the target hex color while preserving the original alpha channel.
 *
 * The matrix replaces R/G/B with the target color's channels,
 * weighted by the original pixel's luminance. This preserves
 * anti-aliasing, gradients, and transparency beautifully.
 */
function colorMatrixFromHex(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  // Use luminance coefficients to preserve detail/contrast
  // Each output channel = targetColor * luminance(input)
  // Luminance weights: R=0.2126, G=0.7152, B=0.0722
  const lr = 0.2126;
  const lg = 0.7152;
  const lb = 0.0722;

  // feColorMatrix values (5x4 matrix, row-major):
  // | R' |   | lr*r  lg*r  lb*r  0  0 |   | R |
  // | G' | = | lr*g  lg*g  lb*g  0  0 | × | G |
  // | B' |   | lr*b  lg*b  lb*b  0  0 |   | B |
  // | A' |   |  0     0     0    1  0 |   | A |
  return [
    lr * r, lg * r, lb * r, 0, 0,
    lr * g, lg * g, lb * g, 0, 0,
    lr * b, lg * b, lb * b, 0, 0,
    0,      0,      0,      1, 0,
  ]
    .map((v) => v.toFixed(4))
    .join(" ");
}

export default BannerCreator;
