"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Client, BrandConfig } from "@/lib/schemas/types";

const defaultBrandConfig: BrandConfig = {
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

const googleFonts = [
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

const weightOptions = [
  { value: "300", label: "300 (Light)" },
  { value: "400", label: "400 (Regular)" },
  { value: "500", label: "500 (Medium)" },
  { value: "600", label: "600 (Semibold)" },
  { value: "700", label: "700 (Bold)" },
];

const radiusOptions = [
  { value: "0px", label: "0px (Reto)" },
  { value: "4px", label: "4px (Sutil)" },
  { value: "8px", label: "8px (Medio)" },
  { value: "12px", label: "12px (Arredondado)" },
  { value: "9999px", label: "9999px (Pill)" },
];

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

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [showPartnerLogo, setShowPartnerLogo] = useState(false);
  const [brand, setBrand] = useState<BrandConfig>(defaultBrandConfig);

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
      setLogoUrl(client.logo_url ?? "");
      setPartnerLogoUrl(client.partner_logo_url ?? "");
      setShowPartnerLogo(client.show_partner_logo);
      setBrand({ ...defaultBrandConfig, ...client.brand_config });
      setLoading(false);
    }

    loadClient();
  }, [id, router]);

  function updateBrand(key: keyof BrandConfig, value: string) {
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
        logo_url: logoUrl || null,
        partner_logo_url: partnerLogoUrl || null,
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

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Identidade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Identidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cliente *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Empresa ABC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerLogoUrl">URL do Logo Parceiro</Label>
                <Input
                  id="partnerLogoUrl"
                  value={partnerLogoUrl}
                  onChange={(e) => setPartnerLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="showPartnerLogo"
                  checked={showPartnerLogo}
                  onCheckedChange={setShowPartnerLogo}
                />
                <Label htmlFor="showPartnerLogo">
                  Exibir logo do parceiro
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 2. Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Cores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: "primaryColor" as const, label: "Primaria" },
                  { key: "secondaryColor" as const, label: "Secundaria" },
                  { key: "backgroundColor" as const, label: "Fundo" },
                  { key: "textColor" as const, label: "Texto" },
                  { key: "buttonColor" as const, label: "Botao" },
                  { key: "buttonTextColor" as const, label: "Texto do Botao" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brand[key] ?? "#000000"}
                        onChange={(e) => updateBrand(key, e.target.value)}
                        className="h-10 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={brand[key] ?? ""}
                        onChange={(e) => updateBrand(key, e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Tipografia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Tipografia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Familia de Fonte</Label>
                <select
                  value={brand.fontFamily ?? "Montserrat"}
                  onChange={(e) => updateBrand("fontFamily", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {googleFonts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              {brand.fontFamily === "Custom" && (
                <div className="space-y-2">
                  <Label>URL da Fonte Customizada</Label>
                  <Input
                    value={brand.fontUrl ?? ""}
                    onChange={(e) => updateBrand("fontUrl", e.target.value)}
                    placeholder="https://fonts.googleapis.com/css2?family=..."
                  />
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "headingWeight" as const, label: "Peso Titulo" },
                  { key: "bodyWeight" as const, label: "Peso Corpo" },
                  { key: "labelWeight" as const, label: "Peso Label" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <select
                      value={brand[key] ?? "400"}
                      onChange={(e) => updateBrand(key, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {weightOptions.map((w) => (
                        <option key={w.value} value={w.value}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Header</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "headerBg" as const, label: "Fundo do Header" },
                  {
                    key: "headerTextColor" as const,
                    label: "Texto do Header",
                  },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brand[key] ?? "#000000"}
                        onChange={(e) => updateBrand(key, e.target.value)}
                        className="h-10 w-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={brand[key] ?? ""}
                        onChange={(e) => updateBrand(key, e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 5. Extras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-sans">Extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Raio do Botao</Label>
                <select
                  value={brand.buttonRadius ?? "12px"}
                  onChange={(e) => updateBrand("buttonRadius", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {radiusOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Texto do Rodape</Label>
                <Input
                  value={brand.footerText ?? ""}
                  onChange={(e) => updateBrand("footerText", e.target.value)}
                  placeholder="Powered by Individuando"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-sans flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg overflow-hidden border"
                style={{ backgroundColor: brand.backgroundColor }}
              >
                {/* Preview Header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: brand.headerBg,
                    color: brand.headerTextColor,
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-8 object-contain"
                    />
                  ) : (
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: brand.fontFamily,
                        fontWeight: Number(brand.headingWeight),
                      }}
                    >
                      {name || "Nome do Cliente"}
                    </span>
                  )}
                  {showPartnerLogo && partnerLogoUrl && (
                    <img
                      src={partnerLogoUrl}
                      alt="Partner"
                      className="h-6 object-contain"
                    />
                  )}
                </div>

                {/* Preview Body */}
                <div className="p-4 space-y-3">
                  <h3
                    style={{
                      color: brand.textColor,
                      fontFamily: brand.fontFamily,
                      fontWeight: Number(brand.headingWeight),
                    }}
                    className="text-base"
                  >
                    Titulo de Exemplo
                  </h3>
                  <p
                    style={{
                      color: brand.textColor,
                      fontFamily: brand.fontFamily,
                      fontWeight: Number(brand.bodyWeight),
                    }}
                    className="text-sm opacity-80"
                  >
                    Este e um texto de exemplo para visualizar a tipografia e as
                    cores configuradas.
                  </p>
                  <div className="space-y-1">
                    <label
                      style={{
                        color: brand.textColor,
                        fontFamily: brand.fontFamily,
                        fontWeight: Number(brand.labelWeight),
                      }}
                      className="text-xs"
                    >
                      Campo de exemplo
                    </label>
                    <div className="h-9 rounded-md border bg-white px-3 flex items-center text-sm text-muted-foreground">
                      Resposta do participante...
                    </div>
                  </div>
                  <button
                    style={{
                      backgroundColor: brand.buttonColor,
                      color: brand.buttonTextColor,
                      borderRadius: brand.buttonRadius,
                      fontFamily: brand.fontFamily,
                      fontWeight: Number(brand.bodyWeight),
                    }}
                    className="w-full py-2 text-sm font-medium"
                  >
                    Botao de Acao
                  </button>
                </div>

                {/* Preview Footer */}
                <div
                  className="px-4 py-2 text-center border-t"
                  style={{
                    color: brand.secondaryColor,
                    fontFamily: brand.fontFamily,
                    fontSize: "11px",
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
  );
}
