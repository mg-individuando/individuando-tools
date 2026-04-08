"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { templates, generateSlug } from "@/lib/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Grid2X2, Target, CircleDot, LayoutGrid, Table, ArrowLeft } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "grid-2x2": Grid2X2,
  target: Target,
  "circle-dot": CircleDot,
  "layout-grid": LayoutGrid,
  table: Table,
};

export default function NovaFerramentaPage() {
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate() {
    if (!selectedTemplate || !title) return;
    setLoading(true);

    const template = templates[selectedTemplate];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) return;

    const slug = generateSlug(title) + "-" + Date.now().toString(36);
    const schema = {
      ...template.schema,
      title,
      description: description || template.schema.description,
    };

    const { data, error } = await supabase
      .from("tools")
      .insert({
        created_by: profile.id,
        title,
        slug,
        description: description || null,
        template_type: selectedTemplate,
        schema,
        settings: template.defaultSettings,
        status: "draft",
      })
      .select("id")
      .single();

    if (error) {
      alert("Erro ao criar ferramenta: " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/admin/ferramentas/${data.id}`);
  }

  if (step === "template") {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/admin/ferramentas"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Nova Ferramenta
          </h1>
          <p className="text-gray-500 mt-1">
            Escolha um template para começar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(templates).map(([key, tpl]) => {
            const Icon = iconMap[tpl.icon] || Grid2X2;
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === key
                    ? "ring-2 ring-[#2D5A7B] shadow-md"
                    : ""
                }`}
                onClick={() => setSelectedTemplate(key)}
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2D5A7B]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#2D5A7B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tpl.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedTemplate && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                setTitle(templates[selectedTemplate].name);
                setDescription(templates[selectedTemplate].schema.description || "");
                setStep("details");
              }}
              className="bg-[#2D5A7B] hover:bg-[#1e4260]"
            >
              Continuar
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setStep("template")}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar aos templates
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Configurar Ferramenta
        </h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Ferramenta</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: SWOT Pessoal — Turma Abril"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição para os participantes..."
              rows={3}
            />
          </div>
          <div className="pt-2 flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={!title || loading}
              className="bg-[#2D5A7B] hover:bg-[#1e4260]"
            >
              {loading ? "Criando..." : "Criar Ferramenta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
