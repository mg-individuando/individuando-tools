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
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Trash2, Paintbrush } from "lucide-react";
import Link from "next/link";
import type { Client, BrandConfig } from "@/lib/schemas/types";
import { BannerCreator, type BannerConfig } from "@/components/ui/banner-creator";

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

const HEADER_LAYOUT_OPTIONS = [
  { value: "logo-left", label: "Logo a esquerda" },
  { value: "logo-center", label: "Logo centralizado" },
  { value: "logo-right", label: "Logo a direita" },
];

const HEADER_HEIGHT_OPTIONS = [
  { value: "compact", label: "Compacto (60px)" },
  { value: "normal", label: "Normal (80px)" },
  { value: "tall", label: "Alto (120px)" },
];

const HEADER_HEIGHT_MAP: Record<string, string> = {
  compact: "60px",
  normal: "80px",
  tall: "120px",
};

const DEFAULT_BRAND: BrandConfig = {
  primaryColor: "#2D5A7B",
  secondaryColor: "#64748B",
  backgroundColor: "#F8FAFC",
  textColor: "#1e293b",
  buttonColor: "#2D5A7B",
  buttonTextColor: "#FFFFFF",
  buttonRadius: "12px",
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
  const [bannerOpen, setBannerOpen] = useState(false);

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
      toast.error("Nome do cliente e obrigatorio.");
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

  const headerHeightPx = HEADER_HEIGHT_MAP[brand.headerHeight] ?? "80px";

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
              Atualize as configuracoes de marca do cliente.
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
            {saving ? "Salvando..." : "Salvar Alteracoes"}
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
                hint="PNG, JPG ou SVG. Maximo 5MB."
                currentUrl={logoUrl || undefined}
                onUpload={(url) => setLogoUrl(url)}
              />

              <FileUpload
                bucket="client-assets"
                path={`partner-logos/${slug}`}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                label="Logo parceiro (Individuando)"
                hint="PNG, JPG ou SVG. Maximo 5MB."
                currentUrl={partnerLogoUrl || undefined}
                onUpload={(url) => setPartnerLogoUrl(url)}
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

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="showPartnerLogo" className="text-sm font-medium">
                    Mostrar logo parceiro
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Exibir o logo da Individuando ao lado do logo do cliente.
                  </p>
                </div>
                <Switch
                  id="showPartnerLogo"
                  checked={showPartnerLogo}
                  onCheckedChange={setShowPartnerLogo}
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
                  label="Cor primaria"
                  value={brand.primaryColor!}
                  onChange={(v) => updateBrand("primaryColor", v)}
                />
                <ColorField
                  label="Cor secundaria"
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
                  label="Cor dos botoes"
                  value={brand.buttonColor!}
                  onChange={(v) => updateBrand("buttonColor", v)}
                />
                <ColorField
                  label="Cor do texto dos botoes"
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
                    <Label htmlFor="fontUrl">URL da fonte custom</Label>
                    <Input
                      id="fontUrl"
                      type="url"
                      placeholder="https://fonts.googleapis.com/css2?family=..."
                      value={brand.fontUrl}
                      onChange={(e) => updateBrand("fontUrl", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole a URL de importacao do Google Fonts ou outra fonte.
                    </p>
                  </div>

                  <FileUpload
                    bucket="client-assets"
                    path={`fonts/${slug}`}
                    accept=".ttf,.otf,.woff,.woff2"
                    label="Arquivo da fonte"
                    hint="TTF, OTF, WOFF ou WOFF2. Maximo 5MB."
                    currentUrl={brand.fontUrl || undefined}
                    onUpload={(url) => updateBrand("fontUrl", url)}
                  />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="headingWeight">Peso do titulo</Label>
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

          {/* Section 4: Header */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField
                  label="Cor de fundo do header"
                  value={brand.headerBg!}
                  onChange={(v) => updateBrand("headerBg", v)}
                />
                <ColorField
                  label="Cor do texto do header"
                  value={brand.headerTextColor!}
                  onChange={(v) => updateBrand("headerTextColor", v)}
                />
              </div>

              <FileUpload
                bucket="client-assets"
                path={`headers/${slug}`}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                label="Imagem de fundo do header"
                hint="PNG, JPG ou SVG. Maximo 5MB. Recomendado: 1200x200px."
                currentUrl={brand.headerBgImage || undefined}
                onUpload={(url) => updateBrand("headerBgImage", url)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="headerLayout">Layout do header</Label>
                  <select
                    id="headerLayout"
                    value={brand.headerLayout ?? "logo-left"}
                    onChange={(e) => updateBrand("headerLayout", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {HEADER_LAYOUT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headerHeight">Altura do header</Label>
                  <select
                    id="headerHeight"
                    value={brand.headerHeight ?? "normal"}
                    onChange={(e) => updateBrand("headerHeight", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {HEADER_HEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBannerOpen(true)}
                  className="gap-2"
                >
                  <Paintbrush className="h-4 w-4" />
                  {brand.bannerConfig ? "Editar Banner" : "Criar Banner"}
                </Button>
                {brand.bannerConfig && (
                  <p className="text-xs text-green-600 mt-1">Banner configurado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Extras */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">Extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="buttonRadius">Arredondamento dos botoes</Label>
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
                <Label htmlFor="footerText">Texto do rodape</Label>
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
          <div className="flex justify-end pb-8">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-[#2D5A7B] hover:bg-[#1e3f56]"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </div>
        </div>

        {/* Right column: sticky preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans text-[#2D5A7B] flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-xl overflow-hidden border"
                  style={{
                    fontFamily:
                      brand.fontFamily === "Custom"
                        ? "sans-serif"
                        : brand.fontFamily,
                  }}
                >
                  {/* Preview Header */}
                  <div
                    className="px-4 flex items-center gap-3"
                    style={{
                      backgroundColor: brand.headerBg,
                      color: brand.headerTextColor,
                      height: headerHeightPx,
                      ...(brand.bannerConfig?.backgroundType === "gradient"
                        ? {
                            background: `linear-gradient(${brand.bannerConfig.gradientDirection}, ${brand.bannerConfig.gradientFrom}, ${brand.bannerConfig.gradientTo})`,
                          }
                        : brand.bannerConfig?.backgroundType === "solid"
                          ? { backgroundColor: brand.bannerConfig.backgroundColor }
                          : brand.headerBgImage
                            ? {
                                backgroundImage: `url(${brand.headerBgImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : {}),
                      justifyContent:
                        brand.headerLayout === "logo-center"
                          ? "center"
                          : brand.headerLayout === "logo-right"
                            ? "flex-end"
                            : "flex-start",
                    }}
                  >
                    <div
                      className="flex items-center gap-3"
                      style={{
                        flexDirection:
                          brand.headerLayout === "logo-right"
                            ? "row-reverse"
                            : "row",
                      }}
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-10 object-contain max-w-[120px]"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: brand.primaryColor }}
                        >
                          {name ? name.charAt(0).toUpperCase() : "C"}
                        </div>
                      )}
                      {brand.showNameInHeader !== false && (
                        <span
                          style={{ fontWeight: Number(brand.headingWeight) }}
                          className="text-sm"
                        >
                          {name || "Nome do Cliente"}
                        </span>
                      )}
                    </div>
                    {showPartnerLogo && partnerLogoUrl && (
                      <img
                        src={partnerLogoUrl}
                        alt="Partner"
                        className="h-5 object-contain opacity-60 ml-auto"
                      />
                    )}
                  </div>

                  {/* Preview Body */}
                  <div
                    className="p-4 space-y-3"
                    style={{
                      backgroundColor: brand.backgroundColor,
                      color: brand.textColor,
                    }}
                  >
                    <h3
                      className="text-base"
                      style={{ fontWeight: Number(brand.headingWeight) }}
                    >
                      Titulo de exemplo
                    </h3>
                    <p
                      className="text-xs"
                      style={{ fontWeight: Number(brand.bodyWeight) }}
                    >
                      Este e um texto de exemplo para visualizar como o conteudo
                      vai aparecer com as configuracoes de marca escolhidas.
                    </p>

                    {/* Sample Card */}
                    <div className="rounded-lg border bg-white p-3 space-y-2">
                      <label
                        className="text-xs block"
                        style={{ fontWeight: Number(brand.labelWeight) }}
                      >
                        Campo de exemplo
                      </label>
                      <div className="h-8 rounded-md border bg-gray-50" />
                      <button
                        className="px-3 py-1.5 text-xs"
                        style={{
                          backgroundColor: brand.buttonColor,
                          color: brand.buttonTextColor,
                          borderRadius: brand.buttonRadius,
                          fontWeight: Number(brand.bodyWeight),
                        }}
                      >
                        Botao de acao
                      </button>
                    </div>
                  </div>

                  {/* Preview Footer */}
                  <div
                    className="px-4 py-2 text-center text-[10px] border-t"
                    style={{
                      backgroundColor: brand.backgroundColor,
                      color: brand.secondaryColor,
                    }}
                  >
                    {brand.footerText}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BannerCreator
        open={bannerOpen}
        onClose={() => setBannerOpen(false)}
        onSave={(config: BannerConfig) => updateBrand("bannerConfig", config)}
        initialConfig={brand.bannerConfig}
        logoUrl={logoUrl}
        clientName={name}
      />
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
