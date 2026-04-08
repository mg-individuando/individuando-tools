"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import ToolRenderer from "@/components/tools/ToolRenderer";
import BuilderPanel from "@/components/builder/BuilderPanel";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import type { Tool } from "@/lib/schemas/types";
import type { ToolSchema, ToolSettings, IdentificationField } from "@/lib/schemas/tool-schema";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Settings,
  Save,
  Wrench,
  Share2,
  Mail,
  QrCode,
  MessageCircle,
  Download,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tool, setTool] = useState<Tool | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [settings, setSettings] = useState<ToolSettings>({
    requireName: true,
    requireEmail: false,
    allowMultipleResponses: false,
    showProgressBar: false,
    confirmationMessage: "",
  });
  const [activeTab, setActiveTab] = useState<
    "preview" | "builder" | "settings" | "share"
  >("preview");
  const [editableSchema, setEditableSchema] = useState<ToolSchema | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailList, setEmailList] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadTool() {
      const { data } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        const t = data as Tool;
        setTool(t);
        setTitle(t.title);
        setDescription(t.description || "");
        setSettings(t.settings as ToolSettings);
        setEditableSchema(t.schema as ToolSchema);
      }
    }
    loadTool();
  }, [id]);

  const publicUrl = tool
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/f/${tool.slug}`
    : "";

  async function handleSave() {
    if (!tool) return;
    setSaving(true);

    const schema = editableSchema
      ? {
          ...editableSchema,
          title,
          description: description || editableSchema.description,
        }
      : { ...(tool.schema as ToolSchema), title, description };

    await supabase
      .from("tools")
      .update({
        title,
        description,
        schema,
        settings,
      })
      .eq("id", tool.id);

    setSaving(false);
    setTool({ ...tool, title, description, schema, settings });
    setEditableSchema(schema);
    toast.success("Alterações salvas com sucesso!");
  }

  async function handleBuilderSave() {
    if (!tool || !editableSchema) return;
    setSaving(true);

    const newTitle = editableSchema.title;
    const newDesc = editableSchema.description || "";

    await supabase
      .from("tools")
      .update({
        title: newTitle,
        description: newDesc,
        schema: editableSchema,
        settings,
      })
      .eq("id", tool.id);

    setTitle(newTitle);
    setDescription(newDesc);
    setSaving(false);
    setTool({
      ...tool,
      title: newTitle,
      description: newDesc,
      schema: editableSchema,
      settings,
    });
    toast.success("Builder salvo com sucesso!");
  }

  async function handlePublish() {
    if (!tool) return;
    const newStatus = tool.status === "published" ? "draft" : "published";
    await supabase
      .from("tools")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", tool.id);
    setTool({ ...tool, status: newStatus });
    toast.success(
      newStatus === "published"
        ? "Ferramenta publicada!"
        : "Ferramenta despublicada."
    );
  }

  async function copyLink() {
    if (!tool) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  }

  function downloadQrCode() {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement("a");
      link.download = `qrcode-${tool?.slug || "tool"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR Code baixado!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  async function handleSendInvites() {
    if (!emailList.trim()) {
      toast.error("Insira pelo menos um email.");
      return;
    }

    const emails = emailList
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const message = `Olá!\n\nVocê foi convidado(a) para participar da ferramenta "${title}".\n\nAcesse pelo link: ${publicUrl}\n\nAguardamos sua participação!`;

    await navigator.clipboard.writeText(message);
    toast.success("Mensagem copiada! Cole no seu email para enviar.");
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Participe da ferramenta "${title}": ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (!tool) {
    return (
      <div
        className="text-center py-12 text-gray-500"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        Carregando...
      </div>
    );
  }

  const schema = tool.schema as ToolSchema;

  const tabs = [
    { key: "preview" as const, label: "Preview", icon: Eye },
    { key: "builder" as const, label: "Builder", icon: Wrench },
    { key: "settings" as const, label: "Configurações", icon: Settings },
    { key: "share" as const, label: "Compartilhar", icon: Share2 },
  ];

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/admin/ferramentas"
            className="text-sm text-gray-500 hover:text-[#2D5A7B] flex items-center gap-1 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Ferramentas
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{tool.title}</h1>
            <Badge
              variant={tool.status === "published" ? "default" : "secondary"}
              className={
                tool.status === "published"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : ""
              }
            >
              {tool.status === "published" ? "Publicada" : "Rascunho"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {tool.status === "published" && (
            <>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="w-4 h-4 mr-1" /> Link
              </Button>
              <a
                href={`/f/${tool.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1" /> Abrir
                </Button>
              </a>
            </>
          )}
          <Link href={`/admin/ferramentas/${tool.id}/respostas`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" /> Respostas
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handlePublish}>
            {tool.status === "published" ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#2D5A7B] text-[#2D5A7B]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4 inline mr-1" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "builder" && editableSchema ? (
        <BuilderPanel
          schema={editableSchema}
          onChange={setEditableSchema}
          onSave={handleBuilderSave}
          saving={saving}
        />
      ) : activeTab === "preview" ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: schema.theme?.primaryColor }}
              >
                {title}
              </h2>
              {description && (
                <p className="text-gray-500 mt-2">{description}</p>
              )}
              {schema.instructions && (
                <p className="text-sm text-gray-400 mt-2 italic">
                  {schema.instructions}
                </p>
              )}
            </div>
            <ToolRenderer
              schema={{
                ...schema,
                title,
                description: description || schema.description,
              }}
              readOnly={false}
            />
          </CardContent>
        </Card>
      ) : activeTab === "share" ? (
        <div className="space-y-6 max-w-2xl">
          {/* Link Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[#2D5A7B]" />
                Link Público
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm bg-gray-50"
                />
                <Button
                  onClick={copyLink}
                  className="bg-[#2D5A7B] hover:bg-[#1e4260] shrink-0"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
              </div>
              {tool.status !== "published" && (
                <p className="text-sm text-amber-600 mt-2">
                  Esta ferramenta ainda nao esta publicada. Publique-a para que
                  o link funcione.
                </p>
              )}
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#2D5A7B]" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div
                  ref={qrRef}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                >
                  <QRCodeSVG
                    value={publicUrl}
                    size={200}
                    level="H"
                    fgColor="#2D5A7B"
                    includeMargin
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={downloadQrCode}
                  className="border-[#2D5A7B] text-[#2D5A7B] hover:bg-[#2D5A7B] hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#2D5A7B]" />
                Enviar por Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Emails dos participantes (um por linha ou separados por
                  virgula)
                </Label>
                <Textarea
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  placeholder={
                    "exemplo@email.com\noutro@email.com\nou: email1@mail.com, email2@mail.com"
                  }
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleSendInvites}
                className="bg-[#2D5A7B] hover:bg-[#1e4260]"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Convites
              </Button>
              <p className="text-xs text-gray-400">
                A mensagem com o link sera copiada para a area de transferencia.
                Cole-a no seu cliente de email.
              </p>
            </CardContent>
          </Card>

          {/* Quick Share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#2D5A7B]" />
                Compartilhamento Rapido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={shareWhatsApp}
                  className="bg-[#25D366] hover:bg-[#1da851] text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Settings Tab */
        <div className="space-y-6 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={tool.slug}
                  disabled
                  className="font-mono text-sm bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tela de Boas-Vindas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mensagem de boas-vindas (opcional)</Label>
                <Textarea
                  value={(settings as any).welcomeMessage || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      welcomeMessage: e.target.value,
                    } as ToolSettings)
                  }
                  placeholder="Ex: Bem-vindo ao workshop de desenvolvimento! Preencha seus dados para começar."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Aparece na tela inicial antes do participante começar.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificação do Participante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exigir nome</Label>
                  <p className="text-xs text-muted-foreground">Campo obrigatório na tela de boas-vindas</p>
                </div>
                <Switch
                  checked={settings.requireName}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, requireName: v })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exigir email</Label>
                  <p className="text-xs text-muted-foreground">Campo obrigatório na tela de boas-vindas</p>
                </div>
                <Switch
                  checked={settings.requireEmail}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, requireEmail: v })
                  }
                />
              </div>

              <Separator />

              {/* Custom identification fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Campos adicionais</Label>
                    <p className="text-xs text-muted-foreground">
                      Ex: Concessionária, Cargo, Turma, Unidade...
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentFields = ((settings as any).identificationFields || []) as IdentificationField[];
                      setSettings({
                        ...settings,
                        identificationFields: [
                          ...currentFields,
                          {
                            id: `field_${Date.now()}`,
                            label: "",
                            placeholder: "",
                            required: false,
                            type: "text",
                          },
                        ],
                      } as ToolSettings);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {(((settings as any).identificationFields || []) as IdentificationField[]).map(
                  (field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border p-4 space-y-3 bg-gray-50/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Label *</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => {
                                  const fields = [
                                    ...((settings as any).identificationFields || []),
                                  ];
                                  fields[index] = {
                                    ...fields[index],
                                    label: e.target.value,
                                  };
                                  setSettings({
                                    ...settings,
                                    identificationFields: fields,
                                  } as ToolSettings);
                                }}
                                placeholder="Ex: Concessionária"
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Placeholder</Label>
                              <Input
                                value={field.placeholder || ""}
                                onChange={(e) => {
                                  const fields = [
                                    ...((settings as any).identificationFields || []),
                                  ];
                                  fields[index] = {
                                    ...fields[index],
                                    placeholder: e.target.value,
                                  };
                                  setSettings({
                                    ...settings,
                                    identificationFields: fields,
                                  } as ToolSettings);
                                }}
                                placeholder="Ex: Qual sua concessionária?"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo</Label>
                              <select
                                value={field.type || "text"}
                                onChange={(e) => {
                                  const fields = [
                                    ...((settings as any).identificationFields || []),
                                  ];
                                  fields[index] = {
                                    ...fields[index],
                                    type: e.target.value as "text" | "dropdown",
                                  };
                                  setSettings({
                                    ...settings,
                                    identificationFields: fields,
                                  } as ToolSettings);
                                }}
                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                              >
                                <option value="text">Texto livre</option>
                                <option value="dropdown">Lista de opções</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(v) => {
                                  const fields = [
                                    ...((settings as any).identificationFields || []),
                                  ];
                                  fields[index] = {
                                    ...fields[index],
                                    required: v,
                                  };
                                  setSettings({
                                    ...settings,
                                    identificationFields: fields,
                                  } as ToolSettings);
                                }}
                              />
                              <Label className="text-xs">Obrigatório</Label>
                            </div>
                          </div>
                          {field.type === "dropdown" && (
                            <div className="space-y-1">
                              <Label className="text-xs">
                                Opções (uma por linha)
                              </Label>
                              <Textarea
                                value={(field.options || []).join("\n")}
                                onChange={(e) => {
                                  const fields = [
                                    ...((settings as any).identificationFields || []),
                                  ];
                                  fields[index] = {
                                    ...fields[index],
                                    options: e.target.value
                                      .split("\n")
                                      .filter((o) => o.trim()),
                                  };
                                  setSettings({
                                    ...settings,
                                    identificationFields: fields,
                                  } as ToolSettings);
                                }}
                                placeholder={"Concessionária A\nConcessionária B\nConcessionária C"}
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 mt-5"
                          onClick={() => {
                            const fields = [
                              ...((settings as any).identificationFields || []),
                            ];
                            fields.splice(index, 1);
                            setSettings({
                              ...settings,
                              identificationFields: fields,
                            } as ToolSettings);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comportamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Permitir múltiplas respostas</Label>
                <Switch
                  checked={settings.allowMultipleResponses}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, allowMultipleResponses: v })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Mensagem de confirmação</Label>
                <Textarea
                  value={settings.confirmationMessage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      confirmationMessage: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2D5A7B] hover:bg-[#1e4260]"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </div>
  );
}
