"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { FontUpload } from "@/components/ui/font-upload";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Trash2, Plus, X } from "lucide-react";
import Link from "next/link";
import type { Client, BrandConfig, CustomFont } from "@/lib/schemas/types";
import { BannerEditor, type BannerConfig, migrateConfig } from "@/components/ui/banner-editor";

const FONT_OPTIONS = [
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Inter",
  "Nunito",
  "Raleway",
  "PT Sans",
  "Source Sans Pro",
  "Custom",
];

const WEIGHT_OPTIONS = [
  { value: "300", label: "300 - Light" },
  { value: "400", label: "400 - Regular" },
  { value: "500", label: "500 - Medium" },
  { value: "600", label: "600 - Semi Bold" },
  { value: "700", label: "700 - Bold" },
];

const RADIUS_OPTIONS = [
  { value: "0px", label: "Sem arredondamento (0px)" },
  { value: "4px", label: "Sutil (4px)" },
  { value: "8px", label: "Moderado (8px)" },
  { value: "12px", label: "Arredondado (12px)" },
  { value: "9999px", label: "Pill (9999px)" },
];


function getWeightLabel(weight: string): string {
  const map: Record<string, string> = {
    "100": "Thin",
    "200": "ExtraLight",
    "300": "Light",
    "400": "Regular",
    "500": "Medium",
    "600": "SemiBold",
    "700": "Bold",
    "800": "ExtraBold",
    "900": "Black",
  };
  return map[weight] || weight;
}

const DEFAULT_BRAND: BrandConfig = {
  primaryColor: "#2D5A7B",
  secondaryColor: "#64748B",
  backgroundColor: "#F8FAFC",
  textColor: "#1e293b",
  buttonColor: "#2D5A7B",
  buttonTextColor: "#FFFFFF",
  buttonRadius: "12px",
  cardRadius: "16px",
  fontFamily: "Montserrat",
  fontUrl: "",
  headingWeight: "700",
  bodyWeight: "400",
  labelWeight: "600",
  headerBg: "#FFFFFF",
  headerTextColor: "#1e293b",
  footerText: "Powered by Individuando",
};

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Identity fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [showPartnerLogo, setShowPartnerLogo] = useState(false);
  // bannerConfig is managed inline via BannerEditor
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [recoloredLogoUrl, setRecoloredLogoUrl] = useState<string | null>(null);

  // Brand config (extra header fields stored as arbitrary keys in the JSONB)
  const [brand, setBrand] = useState<Record<string, any>>({
    ...DEFAULT_BRAND,
    headerBgImage: "",
    headerLayout: "logo-left",
    headerHeight: "normal",
  });

  useEffect(() => {
    async function loadClient() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Erro ao carregar cliente.");
        router.push("/admin/clientes");
        return;
      }

      const client = data as Client;
      setName(client.name);
      setSlug(client.slug);
      setLogoUrl(client.logo_url ?? "");
      setPartnerLogoUrl(client.partner_logo_url ?? "");
      setShowPartnerLogo(client.show_partner_logo);
      setBrand({
        ...DEFAULT_BRAND,
        headerBgImage: "",
        headerLayout: "logo-left",
        headerHeight: "normal",
        ...client.brand_config,
      });
      setLoading(false);
    }

    loadClient();
  }, [id, router]);

  function updateBrand(key: string, value: any) {
    setBrand((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Nome do cliente é obrigatório.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("clients")
      .update({
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        partner_logo_url: partnerLogoUrl.trim() || null,
        show_partner_logo: showPartnerLogo,
        brand_config: brand,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Cliente atualizado com sucesso!");
    }
  }

  async function handleDeactivate() {
    if (!confirm("Tem certeza que deseja desativar este cliente?")) return;

    setDeactivating(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("clients")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    setDeactivating(false);

    if (error) {
      toast.error("Erro ao desativar: " + error.message);
    } else {
      toast.success("Cliente desativado.");
      router.push("/admin/clientes");
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-10 w-full rounded bg-muted" />
                <div className="h-10 w-full rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // headerHeight is now managed via bannerConfig
  const previewLogo = recoloredLogoUrl || logoUrl;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-sans text-[#2D5A7B]">
              Editar Cliente
            </h1>
            <p className="text-muted-foreground mt-1">
              Atualize as configurações de marca do cliente.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={deactivating}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deactivating ? "Desativando..." : "Desativar Cliente"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2D5A7B] hover:bg-[#1e3f56]"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: form cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Identidade */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">
                Identidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do cliente *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Empresa ABC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <FileUpload
                bucket="client-assets"
                path={`logos/${slug}`}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                label="Logo do cliente"
                hint="PNG, JPG ou SVG. Máximo 5MB."
                currentUrl={logoUrl || undefined}
                onUpload={(url) => setLogoUrl(url)}
              />

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="showNameInHeader" className="text-sm font-medium">
                    Exibir nome no header
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Quando a logo já contém o nome, pode desativar.
                  </p>
                </div>
                <Switch
                  id="showNameInHeader"
                  checked={brand.showNameInHeader !== false}
                  onCheckedChange={(v) => updateBrand("showNameInHeader", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">Cores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField
                  label="Cor primária"
                  value={brand.primaryColor!}
                  onChange={(v) => updateBrand("primaryColor", v)}
                />
                <ColorField
                  label="Cor secundária"
                  value={brand.secondaryColor!}
                  onChange={(v) => updateBrand("secondaryColor", v)}
                />
                <ColorField
                  label="Cor de fundo"
                  value={brand.backgroundColor!}
                  onChange={(v) => updateBrand("backgroundColor", v)}
                />
                <ColorField
                  label="Cor do texto"
                  value={brand.textColor!}
                  onChange={(v) => updateBrand("textColor", v)}
                />
                <ColorField
                  label="Cor dos botões"
                  value={brand.buttonColor!}
                  onChange={(v) => updateBrand("buttonColor", v)}
                />
                <ColorField
                  label="Cor do texto dos botões"
                  value={brand.buttonTextColor!}
                  onChange={(v) => updateBrand("buttonTextColor", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Tipografia */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">
                Tipografia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Fonte</Label>
                <select
                  id="fontFamily"
                  value={brand.fontFamily}
                  onChange={(e) => updateBrand("fontFamily", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {brand.fontFamily === "Custom" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fontUrl">URL do Google Fonts (alternativa)</Label>
                    <Input
                      id="fontUrl"
                      type="url"
                      placeholder="https://fonts.googleapis.com/css2?family=..."
                      value={brand.fontUrl}
                      onChange={(e) => updateBrand("fontUrl", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole a URL de importação do Google Fonts, ou faça upload dos arquivos abaixo.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Arquivos de fonte</Label>
                      <span className="text-xs text-muted-foreground">
                        {(brand.customFonts || []).length} peso(s)
                      </span>
                    </div>

                    {/* Uploaded fonts list */}
                    {(brand.customFonts || []).length > 0 && (
                      <div className="space-y-2">
                        {(brand.customFonts || []).map((font: CustomFont, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{font.name}</p>
                            </div>
                            <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              {font.weight} - {getWeightLabel(font.weight)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(brand.customFonts || [])];
                                updated.splice(idx, 1);
                                updateBrand("customFonts", updated);
                              }}
                              className="shrink-0 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new font files — multi-file upload */}
                    <FontUpload
                      bucket="client-assets"
                      path={`fonts/${slug}`}
                      onUpload={(newFonts) => {
                        const updated = [...(brand.customFonts || []), ...newFonts];
                        updateBrand("customFonts", updated);
                      }}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="headingWeight">Peso do título</Label>
                  <select
                    id="headingWeight"
                    value={brand.headingWeight}
                    onChange={(e) => updateBrand("headingWeight", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {WEIGHT_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyWeight">Peso do corpo</Label>
                  <select
                    id="bodyWeight"
                    value={brand.bodyWeight}
                    onChange={(e) => updateBrand("bodyWeight", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {WEIGHT_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labelWeight">Peso dos labels</Label>
                  <select
                    id="labelWeight"
                    value={brand.labelWeight}
                    onChange={(e) => updateBrand("labelWeight", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {WEIGHT_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Header / Banner — Inline Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">Header</CardTitle>
            </CardHeader>
            <CardContent>
              <BannerEditor
                config={migrateConfig(brand.bannerConfig || {})}
                onChange={(cfg) => updateBrand("bannerConfig", cfg)}
                logoUrl={logoUrl}
                clientName={name}
                onRecoloredLogo={setRecoloredLogoUrl}
              />
            </CardContent>
          </Card>

          {/* Section 5: Extras */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">Extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="buttonRadius">Arredondamento dos botões</Label>
                <select
                  id="buttonRadius"
                  value={brand.buttonRadius}
                  onChange={(e) => updateBrand("buttonRadius", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardRadius">Arredondamento dos cards</Label>
                <select
                  id="cardRadius"
                  value={brand.cardRadius}
                  onChange={(e) => updateBrand("cardRadius", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="4px">Sutil (4px)</option>
                  <option value="8px">Moderado (8px)</option>
                  <option value="12px">Arredondado (12px)</option>
                  <option value="16px">Suave (16px)</option>
                  <option value="24px">Muito arredondado (24px)</option>
                </select>
                <p className="text-xs text-muted-foreground">Controla o arredondamento dos cards nas ferramentas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Texto do rodapé</Label>
                <Input
                  id="footerText"
                  placeholder="Powered by Individuando"
                  value={brand.footerText}
                  onChange={(e) => updateBrand("footerText", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Save */}
          <div className="flex justify-end pb-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-[#2D5A7B] hover:bg-[#1e3f56]"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {/* Right column: sticky preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-sans text-[#2D5A7B] flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </CardTitle>
                  <button
                    onClick={() => setPreviewFullscreen(!previewFullscreen)}
                    className="text-xs text-gray-400 hover:text-[#2D5A7B] transition-colors flex items-center gap-1"
                  >
                    {previewFullscreen ? "Reduzir" : "Ampliar"}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Banner/Header Preview — mirrors public page layouts */}
                <div
                  className="rounded-xl overflow-hidden border shadow-sm"
                  style={{
                    fontFamily: brand.fontFamily === "Custom" ? "sans-serif" : brand.fontFamily,
                  }}
                >
                  <PreviewHeader brand={brand} previewLogo={previewLogo} clientName={name} size="small" />

                  {/* Preview Body */}
                  <div className="p-4 space-y-3" style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}>
                    <h3 className="text-base" style={{ fontWeight: Number(brand.headingWeight) }}>Título de exemplo</h3>
                    <p className="text-xs" style={{ fontWeight: Number(brand.bodyWeight) }}>
                      Este é um texto de exemplo para visualizar como o conteúdo vai aparecer com as configurações de marca escolhidas.
                    </p>
                    <div className="rounded-lg border bg-white p-3 space-y-2" style={{ borderRadius: brand.cardRadius || "16px" }}>
                      <label className="text-xs block" style={{ fontWeight: Number(brand.labelWeight) }}>Campo de exemplo</label>
                      <div className="h-8 rounded-md border bg-gray-50" />
                      <button className="px-3 py-1.5 text-xs" style={{ backgroundColor: brand.buttonColor, color: brand.buttonTextColor, borderRadius: brand.buttonRadius, fontWeight: Number(brand.bodyWeight) }}>
                        Botão de ação
                      </button>
                    </div>
                  </div>

                  {/* Preview Footer */}
                  <div className="px-4 py-2 text-center text-[10px] border-t" style={{ backgroundColor: brand.backgroundColor, color: brand.secondaryColor }}>
                    {brand.footerText}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fullscreen Preview Overlay */}
            {previewFullscreen && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8" onClick={() => setPreviewFullscreen(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b">
                    <span className="text-sm font-semibold text-gray-800">Preview — Ferramenta Publicada</span>
                    <button onClick={() => setPreviewFullscreen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                  </div>
                  <div style={{ fontFamily: brand.fontFamily === "Custom" ? "sans-serif" : brand.fontFamily }}>
                    <PreviewHeader brand={brand} previewLogo={previewLogo} clientName={name} size="large" />
                    {/* Full-size body */}
                    <div className="p-8 space-y-4" style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}>
                      <h3 className="text-xl" style={{ fontWeight: Number(brand.headingWeight) }}>Título de exemplo</h3>
                      <p className="text-sm leading-relaxed" style={{ fontWeight: Number(brand.bodyWeight) }}>
                        Este é um texto de exemplo para visualizar como o conteúdo vai aparecer com as configurações de marca escolhidas.
                      </p>
                      <div className="rounded-lg border bg-white p-4 space-y-3" style={{ borderRadius: brand.cardRadius || "16px" }}>
                        <label className="text-sm block" style={{ fontWeight: Number(brand.labelWeight) }}>Campo de exemplo</label>
                        <div className="h-10 rounded-md border bg-gray-50" />
                        <button className="px-4 py-2 text-sm" style={{ backgroundColor: brand.buttonColor, color: brand.buttonTextColor, borderRadius: brand.buttonRadius, fontWeight: Number(brand.bodyWeight) }}>
                          Botão de ação
                        </button>
                      </div>
                    </div>
                    <div className="px-6 py-3 text-center text-xs border-t" style={{ backgroundColor: brand.backgroundColor, color: brand.secondaryColor }}>
                      {brand.footerText}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

/* --- Preview Header Component — mirrors public page layouts --- */

function PreviewHeader({
  brand,
  previewLogo,
  clientName,
  size = "small",
}: {
  brand: Record<string, any>;
  previewLogo: string | null;
  clientName: string;
  size?: "small" | "large";
}) {
  const bc = brand.bannerConfig;
  const layout = bc?.bannerLayout || "logo-text-logo";
  const isSmall = size === "small";
  const height = isSmall ? "80px" : "100px";
  const showName = brand.showNameInHeader !== false;
  const logoMaxH = isSmall ? Math.min(bc?.clientLogoSize || 40, 36) : (bc?.clientLogoSize || 48);
  const logoMaxW = isSmall ? "90px" : "180px";
  const indH = isSmall ? Math.min(bc?.individuandoSize || 28, 28) : (bc?.individuandoSize || 36);
  const indMaxW = isSmall ? "80px" : "140px";
  const titleSize = isSmall ? "11px" : `${bc?.titleSize || 22}px`;
  const subtitleSize = isSmall ? "8px" : `${bc?.subtitleSize || 13}px`;
  const nameSize = isSmall ? "text-xs" : "text-lg";
  const gap = isSmall ? "gap-2" : "gap-4";
  const px = isSmall ? "px-4" : "px-6";

  const bgStyle: React.CSSProperties = bc?.backgroundType === "gradient"
    ? { background: `linear-gradient(${bc.gradientDirection || "to right"}, ${bc.gradientFrom}, ${bc.gradientTo})` }
    : bc?.backgroundType === "solid"
      ? { backgroundColor: bc.backgroundColor }
      : bc?.backgroundType === "image" && bc.backgroundImage
        ? { backgroundImage: `url(${bc.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { backgroundColor: brand.primaryColor || "#2D5A7B" };

  const nameColor = bc?.titleColor || brand.headerTextColor || "#fff";

  const clientLogoEl = bc?.showClientLogo !== false ? (
    <div className={`flex items-center ${gap} shrink-0`}>
      {previewLogo ? (
        <img src={previewLogo} alt="Logo" className="object-contain" style={{ height: `${logoMaxH}px`, maxWidth: logoMaxW }} />
      ) : (
        <div className="rounded-lg flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)", width: isSmall ? "28px" : "48px", height: isSmall ? "28px" : "48px", fontSize: isSmall ? "12px" : "18px" }}>
          {clientName ? clientName.charAt(0).toUpperCase() : "C"}
        </div>
      )}
      {showName && (
        <span className={`${nameSize} font-medium`} style={{ color: nameColor }}>
          {clientName || "Nome do Cliente"}
        </span>
      )}
    </div>
  ) : null;

  const textEl = bc?.title ? (
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <p className="font-semibold leading-tight truncate" style={{ color: bc.titleColor || "#fff", fontSize: titleSize, textAlign: bc.titlePosition || "center" }}>
        {bc.title}
      </p>
      {bc.subtitle && (
        <p className="leading-tight truncate mt-0.5" style={{ color: bc.subtitleColor || "rgba(255,255,255,0.7)", fontSize: subtitleSize, textAlign: bc.titlePosition || "center" }}>
          {bc.subtitle}
        </p>
      )}
    </div>
  ) : (
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      {!clientLogoEl && (
        <span className={`${nameSize} text-white font-medium text-center`}>{clientName || "Nome do Cliente"}</span>
      )}
    </div>
  );

  const indLogoEl = (
    <div className="flex items-center shrink-0">
      <img
        src={`/logos/individuando/logo-${bc?.individuandoVariant || 7}.svg`}
        alt="Individuando"
        className="object-contain"
        style={{ height: `${indH}px`, maxWidth: indMaxW }}
      />
    </div>
  );

  let headerContent: React.ReactNode;

  if (layout === "centered") {
    headerContent = (
      <div className="flex flex-col items-center justify-center w-full h-full gap-1">
        <div className={`flex items-center ${gap}`}>
          {clientLogoEl}
          {indLogoEl}
        </div>
        {textEl}
      </div>
    );
  } else if (layout === "logo-text") {
    headerContent = (
      <div className={`flex items-center w-full h-full ${gap}`}>
        {clientLogoEl}
        {textEl}
        {indLogoEl}
      </div>
    );
  } else if (layout === "text-logo") {
    headerContent = (
      <div className={`flex items-center w-full h-full ${gap}`}>
        {textEl}
        {clientLogoEl}
        {indLogoEl}
      </div>
    );
  } else {
    // logo-text-logo (default)
    const clientOrder = bc?.clientLogoPosition === "right" ? 3 : 1;
    const indOrder = bc?.clientLogoPosition === "right" ? 1 : 3;
    headerContent = (
      <div className={`flex items-center w-full h-full ${gap}`}>
        {clientLogoEl && <div style={{ order: clientOrder }}>{clientLogoEl}</div>}
        <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ order: 2 }}>
          {bc?.title ? (
            <>
              <p className="font-semibold leading-tight truncate" style={{ color: bc.titleColor || "#fff", fontSize: titleSize, textAlign: bc.titlePosition || "center" }}>{bc.title}</p>
              {bc.subtitle && <p className="leading-tight truncate mt-0.5" style={{ color: bc.subtitleColor || "rgba(255,255,255,0.7)", fontSize: subtitleSize, textAlign: bc.titlePosition || "center" }}>{bc.subtitle}</p>}
            </>
          ) : !clientLogoEl ? (
            <span className={`${nameSize} text-white font-medium text-center`}>{clientName || "Nome do Cliente"}</span>
          ) : null}
        </div>
        <div style={{ order: indOrder }}>{indLogoEl}</div>
      </div>
    );
  }

  return (
    <div
      className={`${px} flex items-center relative overflow-hidden`}
      style={{ height, ...bgStyle }}
    >
      {bc?.overlayOpacity > 0 && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0,${bc.overlayOpacity / 100})` }} />
      )}
      <div className="relative z-10 w-full h-full flex items-center">
        {headerContent}
      </div>
    </div>
  );
}

/* --- Color Field Component --- */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-input p-0.5 bg-transparent"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "") {
              onChange(v);
            }
          }}
          placeholder="#000000"
          className="font-mono text-sm flex-1"
          maxLength={7}
        />
      </div>
    </div>
  );
}
