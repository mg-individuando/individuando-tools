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
  { value: "to right", label: "Horizontal" },
  { value: "to bottom", label: "Vertical" },
  { value: "to bottom right", label: "Diagonal" },
  { value: "135deg", label: "Diagonal inverso" },
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

  function getTitleAlign(): React.CSSProperties["textAlign"] {
    return config.titlePosition;
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

  function handleSave() {
    onSave(config);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-[#2D5A7B]">
            Criar Banner do Header
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Live Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Preview (1200x200px)
              </Label>
              <div
                className="w-full rounded-lg overflow-hidden border shadow-sm"
                style={{
                  aspectRatio: "1200 / 200",
                  ...getBackgroundStyle(),
                }}
              >
                <div className="h-full flex flex-col justify-center px-6 py-3 relative">
                  {/* Logo row */}
                  {config.showLogo && logoUrl && (
                    <div
                      className="flex items-center mb-1"
                      style={{ justifyContent: getLogoJustify() }}
                    >
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-8 max-w-[100px] object-contain"
                      />
                    </div>
                  )}
                  {config.showLogo && !logoUrl && clientName && (
                    <div
                      className="flex items-center mb-1"
                      style={{ justifyContent: getLogoJustify() }}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
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
                        textAlign: getTitleAlign(),
                      }}
                    >
                      {config.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Background Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Fundo
              </Label>
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
                      ? "Cor solida"
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
                    className="h-10 w-10 cursor-pointer rounded-lg border border-input p-0.5 bg-transparent"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "")
                        update("backgroundColor", v);
                    }}
                    className="font-mono text-sm w-28"
                    maxLength={7}
                  />
                </div>
              )}

              {config.backgroundType === "gradient" && (
                <div className="space-y-3">
                  {/* Gradient presets */}
                  <div className="flex flex-wrap gap-2">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          update("gradientFrom", preset.from);
                          update("gradientTo", preset.to);
                        }}
                        className="group relative"
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

                  {/* Custom gradient colors */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 w-8">De</Label>
                      <input
                        type="color"
                        value={config.gradientFrom}
                        onChange={(e) =>
                          update("gradientFrom", e.target.value)
                        }
                        className="h-8 w-8 cursor-pointer rounded border border-input p-0.5 bg-transparent"
                      />
                      <Input
                        value={config.gradientFrom}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "")
                            update("gradientFrom", v);
                        }}
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
                        className="h-8 w-8 cursor-pointer rounded border border-input p-0.5 bg-transparent"
                      />
                      <Input
                        value={config.gradientTo}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "")
                            update("gradientTo", v);
                        }}
                        className="font-mono text-xs w-24"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Direction */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">Direcao</Label>
                    <select
                      value={config.gradientDirection}
                      onChange={(e) =>
                        update("gradientDirection", e.target.value)
                      }
                      className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    {config.backgroundImage
                      ? "Trocar imagem"
                      : "Fazer upload de imagem"}
                  </Button>
                  {config.backgroundImage && (
                    <p className="text-xs text-green-600">Imagem carregada</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 1200x200px. PNG, JPG ou WebP.
                  </p>
                </div>
              )}
            </div>

            {/* Logo Position */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Logo
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.showLogo}
                    onChange={(e) => update("showLogo", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Exibir logo
                </label>
                {config.showLogo && (
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
                        title={
                          pos === "left"
                            ? "Esquerda"
                            : pos === "center"
                              ? "Centro"
                              : "Direita"
                        }
                      >
                        {pos === "left" && <AlignLeft className="h-4 w-4" />}
                        {pos === "center" && <AlignCenter className="h-4 w-4" />}
                        {pos === "right" && <AlignRight className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Texto (opcional)
              </Label>
              <Input
                placeholder="Ex: Workshop de Lideranca 2026"
                value={config.title}
                onChange={(e) => update("title", e.target.value)}
              />
              {config.title && (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">Cor</Label>
                    <input
                      type="color"
                      value={config.titleColor}
                      onChange={(e) => update("titleColor", e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-input p-0.5 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">Tamanho</Label>
                    <input
                      type="range"
                      min={14}
                      max={48}
                      value={config.titleSize}
                      onChange={(e) =>
                        update("titleSize", Number(e.target.value))
                      }
                      className="w-24"
                    />
                    <span className="text-xs text-gray-500 w-8">
                      {config.titleSize}px
                    </span>
                  </div>
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
                        {pos === "center" && (
                          <AlignCenter className="h-4 w-4" />
                        )}
                        {pos === "right" && <AlignRight className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
