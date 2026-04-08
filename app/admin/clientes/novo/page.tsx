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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import type { BrandConfig } from "@/lib/schemas/types";

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

export default function NovoClientePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Identity fields
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [showPartnerLogo, setShowPartnerLogo] = useState(true);

  // Brand config
  const [brand, setBrand] = useState<BrandConfig>({ ...DEFAULT_BRAND });

  function updateBrand<K extends keyof BrandConfig>(
    key: K,
    value: BrandConfig[K]
  ) {
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

      const slug = generateSlug(name);

      const { error } = await supabase.from("clients").insert({
        name: name.trim(),
        slug,
        logo_url: logoUrl.trim() || null,
        partner_logo_url: partnerLogoUrl.trim() || null,
        show_partner_logo: showPartnerLogo,
        brand_config: brand,
        is_active: true,
        created_by: user.id,
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do logo do cliente</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://exemplo.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerLogoUrl">URL do logo parceiro (Individuando)</Label>
            <Input
              id="partnerLogoUrl"
              type="url"
              placeholder="https://exemplo.com/partner-logo.png"
              value={partnerLogoUrl}
              onChange={(e) => setPartnerLogoUrl(e.target.value)}
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

      {/* Section 4: Header */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-[#2D5A7B]">Header</CardTitle>
        </CardHeader>
        <CardContent>
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

      {/* Live Preview */}
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
            style={{ fontFamily: brand.fontFamily === "Custom" ? "sans-serif" : brand.fontFamily }}
          >
            {/* Preview Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                backgroundColor: brand.headerBg,
                color: brand.headerTextColor,
              }}
            >
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    {name ? name.charAt(0).toUpperCase() : "C"}
                  </div>
                )}
                <span
                  style={{ fontWeight: Number(brand.headingWeight) }}
                  className="text-lg"
                >
                  {name || "Nome do Cliente"}
                </span>
              </div>
              {showPartnerLogo && partnerLogoUrl && (
                <img
                  src={partnerLogoUrl}
                  alt="Partner"
                  className="h-6 object-contain opacity-60"
                />
              )}
            </div>

            {/* Preview Body */}
            <div
              className="p-6 space-y-4"
              style={{
                backgroundColor: brand.backgroundColor,
                color: brand.textColor,
              }}
            >
              <h3
                className="text-xl"
                style={{ fontWeight: Number(brand.headingWeight) }}
              >
                Titulo de exemplo
              </h3>
              <p
                className="text-sm"
                style={{ fontWeight: Number(brand.bodyWeight) }}
              >
                Este e um texto de exemplo para visualizar como o conteudo vai
                aparecer com as configuracoes de marca escolhidas.
              </p>

              {/* Sample Card */}
              <div className="rounded-lg border bg-white p-4 space-y-3">
                <label
                  className="text-sm block"
                  style={{ fontWeight: Number(brand.labelWeight) }}
                >
                  Campo de exemplo
                </label>
                <div className="h-10 rounded-md border bg-gray-50" />
                <button
                  className="px-4 py-2 text-sm"
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
              className="px-6 py-3 text-center text-xs border-t"
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
  );
}

/* ─── Color Field Component ─── */

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
