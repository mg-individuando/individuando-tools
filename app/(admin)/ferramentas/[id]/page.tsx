"use client";

import { useState, useEffect, use } from "react";
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
import type { Tool } from "@/lib/schemas/types";
import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Settings,
  Save,
  Wrench,
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
  const [activeTab, setActiveTab] = useState<"preview" | "builder" | "settings">("preview");
  const [editableSchema, setEditableSchema] = useState<ToolSchema | null>(null);
  const [saving, setSaving] = useState(false);
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

  async function handleSave() {
    if (!tool) return;
    setSaving(true);

    const schema = editableSchema
      ? { ...editableSchema, title, description: description || editableSchema.description }
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
  }

  async function handleBuilderSave() {
    if (!tool || !editableSchema) return;
    setSaving(true);

    // Sync title/description from builder schema
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
    setTool({ ...tool, title: newTitle, description: newDesc, schema: editableSchema, settings });
  }

  async function handlePublish() {
    if (!tool) return;
    const newStatus = tool.status === "published" ? "draft" : "published";
    await supabase
      .from("tools")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", tool.id);
    setTool({ ...tool, status: newStatus });
  }

  async function copyLink() {
    if (!tool) return;
    const url = `${window.location.origin}/f/${tool.slug}`;
    await navigator.clipboard.writeText(url);
    alert("Link copiado!");
  }

  if (!tool) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  const schema = tool.schema as ToolSchema;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/admin/ferramentas"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
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
              <a href={`/f/${tool.slug}`} target="_blank" rel="noopener noreferrer">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
          >
            {tool.status === "published" ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("preview")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "border-b-2 border-[#2D5A7B] text-[#2D5A7B]"
              : "text-gray-500"
          }`}
        >
          <Eye className="w-4 h-4 inline mr-1" /> Preview
        </button>
        <button
          onClick={() => setActiveTab("builder")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "builder"
              ? "border-b-2 border-[#2D5A7B] text-[#2D5A7B]"
              : "text-gray-500"
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-1" /> Builder
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "settings"
              ? "border-b-2 border-[#2D5A7B] text-[#2D5A7B]"
              : "text-gray-500"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-1" /> Configurações
        </button>
      </div>

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
              <h2 className="text-xl font-bold" style={{ color: schema.theme?.primaryColor }}>
                {title}
              </h2>
              {description && <p className="text-gray-500 mt-2">{description}</p>}
              {schema.instructions && (
                <p className="text-sm text-gray-400 mt-2 italic">{schema.instructions}</p>
              )}
            </div>
            <ToolRenderer schema={{ ...schema, title, description: description || schema.description }} readOnly={false} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
                <Input value={tool.slug} disabled className="font-mono text-sm bg-gray-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comportamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Exigir nome do participante</Label>
                <Switch
                  checked={settings.requireName}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, requireName: v })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Exigir email do participante</Label>
                <Switch
                  checked={settings.requireEmail}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, requireEmail: v })
                  }
                />
              </div>
              <Separator />
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
