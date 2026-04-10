"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Image as ImageIcon,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Layout,
  Crown,
  Check,
} from "lucide-react";

/* ===================================================================
   Types & Constants
   =================================================================== */

export interface BannerConfig {
  // Background
  backgroundType: "solid" | "gradient" | "image";
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: string;
  backgroundImage: string;
  // Layout
  bannerLayout: "logo-text-logo" | "logo-text" | "text-logo" | "centered";
  // Text
  title: string;
  titleColor: string;
  titleSize: number;
  titlePosition: "left" | "center" | "right";
  subtitle: string;
  subtitleColor: string;
  subtitleSize: number;
  // Client logo
  showClientLogo: boolean;
  clientLogoSize: number;
  clientLogoPosition: "left" | "right";
  // Individuando logo (mandatory)
  individuandoVariant: number; // 1-16
  individuandoSize: number;
  individuandoPosition: "left" | "right";
  // Decorative overlay
  overlayOpacity: number;
  // Legacy fields for backward compat
  logoPosition?: string;
  showLogo?: boolean;
  logoSize?: number;
  logoColor?: string;
  logoColorEnabled?: boolean;
}

export const DEFAULT_CONFIG: BannerConfig = {
  backgroundType: "gradient",
  backgroundColor: "#2D5A7B",
  gradientFrom: "#1e2f4c",
  gradientTo: "#2D5A7B",
  gradientDirection: "to right",
  backgroundImage: "",
  bannerLayout: "logo-text-logo",
  title: "",
  titleColor: "#FFFFFF",
  titleSize: 22,
  titlePosition: "center",
  subtitle: "",
  subtitleColor: "rgba(255,255,255,0.75)",
  subtitleSize: 13,
  showClientLogo: true,
  clientLogoSize: 48,
  clientLogoPosition: "left",
  individuandoVariant: 7, // White wide — good default for dark backgrounds
  individuandoSize: 36,
  individuandoPosition: "right",
  overlayOpacity: 0,
};

/**
 * Individuando logo variants catalog.
 * Based on analysis of the 16 SVG files:
 * - 1-3: Navy (#1e2f4c) + Sage (#c0d57e) — for LIGHT backgrounds
 * - 4-6: Sage (#c0d57e) + White (#fff) — for DARK backgrounds
 * - 7-9: White only — for DARK backgrounds
 * - 10-12: Navy only — for LIGHT backgrounds
 * - 13-16: Square icons
 *
 * Aspect ratios: 1,4,7,10 = wide (1033x213), 2,5,8,11 = portrait (466x440),
 *                3,6,9,12 = moderate (789x342), 13-16 = square (288x288)
 */
const INDIVIDUANDO_LOGOS = [
  { id: 1, label: "Completa Horizontal", colors: ["#1e2f4c", "#c0d57e"], bgSuit: "light", aspect: "wide" },
  { id: 2, label: "Completa Vertical", colors: ["#1e2f4c", "#c0d57e"], bgSuit: "light", aspect: "portrait" },
  { id: 3, label: "Completa Moderada", colors: ["#1e2f4c", "#c0d57e"], bgSuit: "light", aspect: "moderate" },
  { id: 4, label: "Verde+Branca Horizontal", colors: ["#c0d57e", "#ffffff"], bgSuit: "dark", aspect: "wide" },
  { id: 5, label: "Verde+Branca Vertical", colors: ["#c0d57e", "#ffffff"], bgSuit: "dark", aspect: "portrait" },
  { id: 6, label: "Verde+Branca Moderada", colors: ["#c0d57e", "#ffffff"], bgSuit: "dark", aspect: "moderate" },
  { id: 7, label: "Branca Horizontal", colors: ["#ffffff"], bgSuit: "dark", aspect: "wide" },
  { id: 8, label: "Branca Vertical", colors: ["#ffffff"], bgSuit: "dark", aspect: "portrait" },
  { id: 9, label: "Branca Moderada", colors: ["#ffffff"], bgSuit: "dark", aspect: "moderate" },
  { id: 10, label: "Azul Horizontal", colors: ["#1e2f4c"], bgSuit: "light", aspect: "wide" },
  { id: 11, label: "Azul Vertical", colors: ["#1e2f4c"], bgSuit: "light", aspect: "portrait" },
  { id: 12, label: "Azul Moderada", colors: ["#1e2f4c"], bgSuit: "light", aspect: "moderate" },
  { id: 13, label: "Icone Cor", colors: ["#1e2f4c", "#c0d57e"], bgSuit: "light", aspect: "square" },
  { id: 14, label: "Icone Verde+Branca", colors: ["#c0d57e", "#ffffff"], bgSuit: "dark", aspect: "square" },
  { id: 15, label: "Icone Cor Alt.", colors: ["#1e2f4c", "#c0d57e"], bgSuit: "light", aspect: "square" },
  { id: 16, label: "Icone Verde+Branca Alt.", colors: ["#c0d57e", "#ffffff"], bgSuit: "dark", aspect: "square" },
];

const GRADIENT_PRESETS = [
  { from: "#1e2f4c", to: "#2D5A7B", label: "Individuando" },
  { from: "#065F46", to: "#059669", label: "Verde Esmeralda" },
  { from: "#4C1D95", to: "#7C3AED", label: "Violeta" },
  { from: "#9F1239", to: "#DB2777", label: "Rosa Intenso" },
  { from: "#78350F", to: "#D97706", label: "Terracota" },
  { from: "#1E40AF", to: "#60A5FA", label: "Azul Celeste" },
  { from: "#374151", to: "#6B7280", label: "Cinza Elegante" },
  { from: "#111827", to: "#1f2937", label: "Grafite" },
];

const DIRECTION_OPTIONS = [
  { value: "to right", label: "\u2192 Horizontal" },
  { value: "to bottom", label: "\u2193 Vertical" },
  { value: "to bottom right", label: "\u2198 Diagonal" },
  { value: "135deg", label: "\u2197 Diagonal" },
];

const LAYOUT_OPTIONS = [
  { value: "logo-text-logo" as const, label: "Logo | Texto | Logo", desc: "Layout classico com logos nas laterais" },
  { value: "logo-text" as const, label: "Logo | Texto", desc: "Logo a esquerda com texto" },
  { value: "text-logo" as const, label: "Texto | Logo", desc: "Texto a esquerda com logo" },
  { value: "centered" as const, label: "Centralizado", desc: "Tudo centralizado" },
];

/* ===================================================================
   Helper: Detect if a color is dark
   =================================================================== */
function isColorDark(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Auto-detect best Individuando logo variant based on background darkness
 * and client logo characteristics (if available as an image).
 */
function autoDetectBestVariant(config: BannerConfig, _clientLogoUrl?: string): number {
  // Determine if background is dark
  let bgIsDark = true;
  if (config.backgroundType === "solid") {
    bgIsDark = isColorDark(config.backgroundColor);
  } else if (config.backgroundType === "gradient") {
    bgIsDark = isColorDark(config.gradientFrom) && isColorDark(config.gradientTo);
  }
  // For image backgrounds, assume dark (safer for contrast)

  // Pick appropriate variant: prefer wide horizontal for banners
  if (bgIsDark) {
    return 7; // White horizontal — maximum contrast on dark
  } else {
    return 1; // Navy + Sage horizontal — great on light backgrounds
  }
}

/**
 * Recolor an SVG by fetching its text and replacing fill colors.
 * Returns a data URI of the modified SVG.
 */
async function recolorSvg(svgUrl: string, targetColor: string): Promise<string> {
  try {
    const resp = await fetch(svgUrl);
    let svgText = await resp.text();

    // Replace all fill colors (hex, in styles and attributes)
    svgText = svgText.replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill: ${targetColor}`);
    svgText = svgText.replace(/fill="#[0-9a-fA-F]{3,6}"/g, `fill="${targetColor}"`);

    // Also handle fills that are "none" — leave them alone
    // But replace named colors like "white"
    svgText = svgText.replace(/fill:\s*white/gi, `fill: ${targetColor}`);
    svgText = svgText.replace(/fill="white"/gi, `fill="${targetColor}"`);

    // Encode as data URI
    const encoded = encodeURIComponent(svgText);
    return `data:image/svg+xml,${encoded}`;
  } catch {
    return svgUrl; // Fallback to original
  }
}

/* ===================================================================
   Raster image recoloring via canvas
   =================================================================== */
async function recolorRasterImage(imageUrl: string, targetColor: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(imageUrl); return; }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Parse target color
      const h = targetColor.replace("#", "");
      const tr = parseInt(h.substring(0, 2), 16);
      const tg = parseInt(h.substring(2, 4), 16);
      const tb = parseInt(h.substring(4, 6), 16);

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 10) {
          // Preserve luminance for depth
          const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          data[i] = Math.round(tr * lum);
          data[i + 1] = Math.round(tg * lum);
          data[i + 2] = Math.round(tb * lum);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

/* ===================================================================
   Migrate old config to new format
   =================================================================== */
export function migrateConfig(config: Partial<BannerConfig>): BannerConfig {
  const merged = { ...DEFAULT_CONFIG, ...config };
  // Migrate legacy fields
  if (!config.bannerLayout) {
    merged.bannerLayout = "logo-text-logo";
  }
  if (config.showLogo !== undefined && config.showClientLogo === undefined) {
    merged.showClientLogo = config.showLogo;
  }
  if (config.logoSize && !config.clientLogoSize) {
    merged.clientLogoSize = config.logoSize;
  }
  if (!config.individuandoVariant) {
    merged.individuandoVariant = autoDetectBestVariant(merged);
  }
  return merged;
}

/* ===================================================================
   Accordion Section Component
   =================================================================== */
function SectionAccordion({
  title,
  icon,
  isOpen,
  onToggle,
  highlight,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  highlight?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        isOpen
          ? highlight
            ? "border-[#1e2f4c]/30 bg-[#1e2f4c]/[0.03]"
            : "border-gray-200 bg-white"
          : "border-gray-100 bg-gray-50/50"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
          highlight && !isOpen ? "text-[#1e2f4c]" : "text-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
          {highlight && (
            <span className="text-[10px] bg-[#1e2f4c] text-white px-1.5 py-0.5 rounded-full font-medium">
              Recomendado
            </span>
          )}
          {badge && (
            <span className="text-[10px] bg-[#c0d57e] text-[#1e2f4c] px-1.5 py-0.5 rounded-full font-semibold">
              {badge}
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

/* ===================================================================
   Main Component — BannerEditor (controlled, no modal)
   =================================================================== */

interface BannerEditorProps {
  config: BannerConfig;
  onChange: (config: BannerConfig) => void;
  logoUrl?: string;
  clientName?: string;
  onRecoloredLogo?: (url: string | null) => void;
}

export function BannerEditor({
  config,
  onChange,
  logoUrl,
  clientName,
  onRecoloredLogo,
}: BannerEditorProps) {
  const [activeSection, setActiveSection] = useState<string | null>("layout");
  const [recoloredClientLogo, setRecoloredClientLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect best Individuando variant when background changes
  const autoDetect = useCallback(() => {
    const best = autoDetectBestVariant(config, logoUrl);
    onChange({ ...config, individuandoVariant: best });
  }, [config, logoUrl, onChange]);

  // Recolor client logo when logoColor changes
  useEffect(() => {
    if (!logoUrl || !config.logoColorEnabled || !config.logoColor) {
      setRecoloredClientLogo(null);
      onRecoloredLogo?.(null);
      return;
    }
    const isSvg = logoUrl.endsWith(".svg") || logoUrl.includes("image/svg");
    const recolorFn = isSvg ? recolorSvg : recolorRasterImage;
    recolorFn(logoUrl, config.logoColor).then((url) => {
      setRecoloredClientLogo(url);
      onRecoloredLogo?.(url);
    });
  }, [logoUrl, config.logoColor, config.logoColorEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onChange({ ...config, backgroundImage: result, backgroundType: "image" });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleReset() {
    onChange(migrateConfig({}));
  }

  function toggleSection(section: string) {
    setActiveSection(activeSection === section ? null : section);
  }

  return (
    <div className="space-y-1">
      {/* Reset button row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">Configure o banner manualmente</p>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Resetar
        </button>
      </div>

      {/* ===== Layout Section ===== */}
      <SectionAccordion
        title="Layout"
        icon={<Layout className="h-4 w-4" />}
        isOpen={activeSection === "layout"}
        onToggle={() => toggleSection("layout")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update("bannerLayout", opt.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  config.bannerLayout === opt.value
                    ? "border-[#1e2f4c] bg-[#1e2f4c]/5 ring-1 ring-[#1e2f4c]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {opt.label}
                  </span>
                  {config.bannerLayout === opt.value && (
                    <Check className="h-4 w-4 text-[#1e2f4c]" />
                  )}
                </div>
                <span className="text-[11px] text-gray-500">{opt.desc}</span>
              </button>
            ))}
          </div>

          {(config.bannerLayout === "logo-text-logo" || config.bannerLayout === "logo-text" || config.bannerLayout === "text-logo") && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Posicao da logo do cliente</Label>
              <div className="flex gap-2">
                {(["left", "right"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => update("clientLogoPosition", pos)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      config.clientLogoPosition === pos
                        ? "bg-[#1e2f4c] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pos === "left" ? "Esquerda" : "Direita"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                A logo Individuando ficara no lado oposto automaticamente.
              </p>
            </div>
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
                    ? "bg-[#1e2f4c] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type === "solid" ? "Cor solida" : type === "gradient" ? "Gradiente" : "Imagem"}
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
                      onChange({ ...config, gradientFrom: preset.from, gradientTo: preset.to });
                    }}
                    title={preset.label}
                  >
                    <div
                      className={`h-8 w-16 rounded-md border-2 transition-all ${
                        config.gradientFrom === preset.from && config.gradientTo === preset.to
                          ? "border-[#1e2f4c] scale-110"
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
                <Label className="text-xs text-gray-500">Direcao</Label>
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
                <p className="text-xs text-green-600">Imagem carregada</p>
              )}
              <p className="text-xs text-gray-400">
                Recomendado: 1200x200px. PNG, JPG ou WebP.
              </p>
              {/* Overlay for image backgrounds */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">Escurecimento</Label>
                  <span className="text-xs text-gray-400">{config.overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={config.overlayOpacity}
                  onChange={(e) => update("overlayOpacity", Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </SectionAccordion>

      {/* ===== Individuando Logo Section (Mandatory) ===== */}
      <SectionAccordion
        title="Logo Individuando"
        icon={<Crown className="h-4 w-4" />}
        isOpen={activeSection === "individuando"}
        onToggle={() => toggleSection("individuando")}
        badge="Obrigatoria"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Selecione a variante que melhor combina com o banner.
            </p>
            <button
              onClick={autoDetect}
              className="text-[11px] px-2.5 py-1 rounded-full border border-[#1e2f4c]/20 text-[#1e2f4c] hover:bg-[#1e2f4c]/5 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Auto-detectar
            </button>
          </div>

          {/* Logo variant grid */}
          <div className="space-y-3">
            {/* Dark background variants */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Para fundos escuros</p>
              <div className="grid grid-cols-4 gap-2">
                {INDIVIDUANDO_LOGOS.filter(l => l.bgSuit === "dark").map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => update("individuandoVariant", logo.id)}
                    className={`relative rounded-lg border-2 p-2 transition-all ${
                      config.individuandoVariant === logo.id
                        ? "border-[#1e2f4c] ring-2 ring-[#1e2f4c]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: "#1e2f4c" }}
                    title={logo.label}
                  >
                    <img
                      src={`/logos/individuando/logo-${logo.id}.svg`}
                      alt={logo.label}
                      className="h-8 w-full object-contain"
                    />
                    {config.individuandoVariant === logo.id && (
                      <div className="absolute -top-1 -right-1 bg-[#1e2f4c] rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Light background variants */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Para fundos claros</p>
              <div className="grid grid-cols-4 gap-2">
                {INDIVIDUANDO_LOGOS.filter(l => l.bgSuit === "light").map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => update("individuandoVariant", logo.id)}
                    className={`relative rounded-lg border-2 p-2 transition-all ${
                      config.individuandoVariant === logo.id
                        ? "border-[#1e2f4c] ring-2 ring-[#1e2f4c]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: "#f8f9fa" }}
                    title={logo.label}
                  >
                    <img
                      src={`/logos/individuando/logo-${logo.id}.svg`}
                      alt={logo.label}
                      className="h-8 w-full object-contain"
                    />
                    {config.individuandoVariant === logo.id && (
                      <div className="absolute -top-1 -right-1 bg-[#1e2f4c] rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-500">Tamanho</Label>
              <span className="text-xs text-gray-400">{config.individuandoSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Minimize2 className="h-3 w-3 text-gray-400" />
              <input
                type="range"
                min={16}
                max={70}
                value={config.individuandoSize}
                onChange={(e) => update("individuandoSize", Number(e.target.value))}
                className="flex-1"
              />
              <Maximize2 className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>
      </SectionAccordion>

      {/* ===== Client Logo Section ===== */}
      <SectionAccordion
        title="Logo do Cliente"
        icon={<ImageIcon className="h-4 w-4" />}
        isOpen={activeSection === "clientlogo"}
        onToggle={() => toggleSection("clientlogo")}
      >
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.showClientLogo}
              onChange={(e) => update("showClientLogo", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Exibir logo do cliente no banner
          </label>

          {config.showClientLogo && (
            <>
              {!logoUrl && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Nenhuma logo do cliente foi carregada. Faca upload na secao &ldquo;Logo do Cliente&rdquo; acima.
                </p>
              )}

              {/* Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">Tamanho</Label>
                  <span className="text-xs text-gray-400">{config.clientLogoSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <Minimize2 className="h-3 w-3 text-gray-400" />
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={config.clientLogoSize}
                    onChange={(e) => update("clientLogoSize", Number(e.target.value))}
                    className="flex-1"
                  />
                  <Maximize2 className="h-3 w-3 text-gray-400" />
                </div>
              </div>

              {/* Color override */}
              {logoUrl && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={config.logoColorEnabled || false}
                      onChange={(e) => update("logoColorEnabled", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Alterar cor do logo
                  </label>
                  {config.logoColorEnabled && (
                    <div className="flex items-center gap-2 ml-6">
                      <input
                        type="color"
                        value={config.logoColor || "#FFFFFF"}
                        onChange={(e) => update("logoColor", e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                      />
                      <Input
                        value={config.logoColor || "#FFFFFF"}
                        onChange={(e) => update("logoColor", e.target.value)}
                        className="font-mono text-xs w-24"
                        maxLength={7}
                      />
                      <div className="flex gap-1.5 ml-2">
                        {["#FFFFFF", "#000000", "#1e2f4c", "#c0d57e"].map((c) => (
                          <button
                            key={c}
                            onClick={() => update("logoColor", c)}
                            className={`h-6 w-6 rounded-full border-2 transition-all ${
                              config.logoColor === c ? "border-[#1e2f4c] scale-110" : "border-gray-200"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SectionAccordion>

      {/* ===== Text Section ===== */}
      <SectionAccordion
        title="Texto"
        icon={<Type className="h-4 w-4" />}
        isOpen={activeSection === "text"}
        onToggle={() => toggleSection("text")}
      >
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Titulo</Label>
            <Input
              placeholder="Ex: Workshop de Lideranca 2026"
              value={config.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Subtitulo (opcional)</Label>
            <Input
              placeholder="Ex: Transforme sua equipe com novas habilidades"
              value={config.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
            />
          </div>

          {(config.title || config.subtitle) && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">Cor titulo</Label>
                  <input
                    type="color"
                    value={config.titleColor}
                    onChange={(e) => update("titleColor", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                  />
                </div>
                {config.subtitle && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">Cor subtitulo</Label>
                    <input
                      type="color"
                      value={config.subtitleColor.startsWith("rgba") ? "#cccccc" : config.subtitleColor}
                      onChange={(e) => update("subtitleColor", e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border p-0.5 bg-transparent"
                    />
                  </div>
                )}
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
                          ? "bg-[#1e2f4c] text-white"
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
  );
}

export default BannerEditor;
