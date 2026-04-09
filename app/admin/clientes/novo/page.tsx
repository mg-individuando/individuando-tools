"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Paintbrush } from "lucide-react";
import Link from "next/link";
import type { BrandConfig } from "@/lib/schemas/types";
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
  { value: "logo-left", label: "Logo à esquerda" },
  { value: "logo-center", label: "Logo centralizado" },
  { value: "logo-right", label: "Logo à direita" },
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

export default function NovoClientePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Identity fields
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [showPartnerLogo, setShowPartnerLogo] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(false);

  // Brand config (extra header fields stored as arbitrary keys in the JSONB)
  const [brand, setBrand] = useState<Record<string, any>>({
    ...DEFAULT_BRAND,
    headerBgImage: "",
    headerLayout: "logo-left",
    headerHeight: "normal",
  });

  const slugified = name.trim() ? generateSlug(name) : "novo";

  function updateBrand(key: string, value: any) {
    setBrand((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("O nome do cliente é obrigatório.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar logado.");
        setSaving(false);
        return;
      }

      // Buscar profile.id (created_by referencia profiles, nao auth)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Perfil não encontrado.");
        setSaving(false);
        return;
      }

      const slug = generateSlug(name);

      const { error } = await supabase.from("clients").insert({
        name: name.trim(),
        slug,
        logo_url: logoUrl.trim() || null,
        partner_logo_url: partnerLogoUrl.trim() || null,
        show_partner_logo: showPartnerLogo,
        brand_config: brand,
        is_active: true,
        created_by: profile.id,
      });

      if (error) {
        console.error("Erro ao salvar:", error);
        toast.error("Erro ao criar cliente. Tente novamente.");
      } else {
        toast.success("Cliente criado com sucesso!");
        router.push("/admin/clientes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado.");
    } finally {
      setSaving(false);
    }
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
              Novo Cliente
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure a identidade visual do cliente.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2D5A7B] hover:bg-[#1e3f56]"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Cliente"}
        </Button>
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
                path={`logos/${slugified}`}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                label="Logo do cliente"
                hint="PNG, JPG ou SVG. Máximo 5MB."
                currentUrl={logoUrl || undefined}
                onUpload={(url) => setLogoUrl(url)}
              />

              <FileUpload
                bucket="client-assets"
                path={`partner-logos/${slugified}`}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                label="Logo parceiro (Individuando)"
                hint="PNG, JPG ou SVG. Máximo 5MB."
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
                    <Label htmlFor="fontUrl">URL da fonte custom</Label>
                    <Input
                      id="fontUrl"
                      type="url"
                      placeholder="https://fonts.googleapis.com/css2?family=..."
                      value={brand.fontUrl}
                      onChange={(e) => updateBrand("fontUrl", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole a URL de importação do Google Fonts ou outra fonte.
                    </p>
                  </div>

                  <FileUpload
                    bucket="client-assets"
                    path={`fonts/${slugified}`}
                    accept=".ttf,.otf,.woff,.woff2"
                    label="Arquivo da fonte"
                    hint="TTF, OTF, WOFF ou WOFF2. Máximo 5MB."
                    currentUrl={brand.fontUrl || undefined}
                    onUpload={(url) => updateBrand("fontUrl", url)}
                  />
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

          {/* Section 4: Header / Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-[#2D5A7B]">Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Configure o banner do header com cores, gradientes, texto, logo do cliente e logo Individuando.
              </p>
              <Button
                type="button"
                onClick={() => setBannerOpen(true)}
                className="gap-2 bg-[#1e2f4c] hover:bg-[#162340]"
              >
                <Paintbrush className="h-4 w-4" />
                {brand.bannerConfig ? "Editar Header" : "Criar Header"}
              </Button>
              {brand.bannerConfig && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs text-green-600">Header configurado</p>
                </div>
              )}
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
          <div className="flex justify-end pb-8">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-[#2D5A7B] hover:bg-[#1e3f56]"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Cliente"}
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
                          : brand.bannerConfig?.backgroundType === "image" && brand.bannerConfig.backgroundImage
                            ? {
                                backgroundImage: `url(${brand.bannerConfig.backgroundImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : brand.headerBgImage
                              ? {
                                  backgroundImage: `url(${brand.headerBgImage})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : {}),
                    }}
                  >
                    {/* Column-based layout from banner config */}
                    <div className="flex items-center w-full h-full gap-2 px-1">
                      {/* Client logo */}
                      {brand.bannerConfig?.showClientLogo !== false && (
                        <div className="flex items-center shrink-0" style={{ order: brand.bannerConfig?.clientLogoPosition === "right" ? 3 : 1 }}>
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Logo"
                              className="object-contain"
                              style={{ height: `${Math.min(brand.bannerConfig?.clientLogoSize || 40, 40)}px`, maxWidth: "100px" }}
                            />
                          ) : (
                            <div
                              className="rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ backgroundColor: brand.primaryColor, width: "32px", height: "32px" }}
                            >
                              {name ? name.charAt(0).toUpperCase() : "C"}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ order: 2 }}>
                        {brand.bannerConfig?.title && (
                          <p className="text-xs font-semibold truncate" style={{ color: brand.bannerConfig.titleColor || "#fff", textAlign: brand.bannerConfig.titlePosition || "center" }}>
                            {brand.bannerConfig.title}
                          </p>
                        )}
                        {brand.bannerConfig?.subtitle && (
                          <p className="text-[9px] truncate" style={{ color: brand.bannerConfig.subtitleColor || "rgba(255,255,255,0.7)", textAlign: brand.bannerConfig.titlePosition || "center" }}>
                            {brand.bannerConfig.subtitle}
                          </p>
                        )}
                        {!brand.bannerConfig?.title && brand.showNameInHeader !== false && (
                          <span style={{ fontWeight: Number(brand.headingWeight), textAlign: "center" }} className="text-sm text-white">
                            {name || "Nome do Cliente"}
                          </span>
                        )}
                      </div>
                      {/* Individuando logo */}
                      {brand.bannerConfig?.individuandoVariant && (
                        <div className="flex items-center shrink-0" style={{ order: brand.bannerConfig?.clientLogoPosition === "right" ? 1 : 3 }}>
                          <img
                            src={`/logos/individuando/logo-${brand.bannerConfig.individuandoVariant}.svg`}
                            alt="Individuando"
                            className="object-contain"
                            style={{ height: `${Math.min(brand.bannerConfig?.individuandoSize || 30, 30)}px`, maxWidth: "90px" }}
                          />
                        </div>
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
                      Título de exemplo
                    </h3>
                    <p
                      className="text-xs"
                      style={{ fontWeight: Number(brand.bodyWeight) }}
                    >
                      Este é um texto de exemplo para visualizar como o conteúdo
                      vai aparecer com as configurações de marca escolhidas.
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
                        Botão de ação
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
