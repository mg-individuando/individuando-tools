"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Copy, ExternalLink, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Tool } from "@/lib/schemas/types";

const templateLabels: Record<string, string> = {
  swot: "SWOT Pessoal",
  radar: "Roda da Vida",
  ikigai: "Ikigai",
  category_grid: "Forças Pessoais",
  dynamic_table: "Metas",
  free_layout: "Layout Livre",
};

const templateColors: Record<string, string> = {
  swot: "bg-blue-50 text-blue-700 border-blue-200",
  radar: "bg-purple-50 text-purple-700 border-purple-200",
  ikigai: "bg-amber-50 text-amber-700 border-amber-200",
  category_grid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dynamic_table: "bg-rose-50 text-rose-700 border-rose-200",
  free_layout: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function FerramentasPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadTools();
  }, []);

  async function loadTools() {
    const { data } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTools(data as Tool[]);
    setLoading(false);
  }

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/f/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  async function togglePublish(tool: Tool) {
    const newStatus = tool.status === "published" ? "draft" : "published";
    await supabase
      .from("tools")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", tool.id);
    loadTools();
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-24 text-gray-400"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Ferramentas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie suas ferramentas interativas de workshop e mentoria
          </p>
        </div>
        <Link href="/admin/ferramentas/nova">
          <Button
            className="bg-[#2D5A7B] hover:bg-[#1e4260] text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Ferramenta
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {tools.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1">
              Nenhuma ferramenta criada
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Crie sua primeira ferramenta interativa para compartilhar com seus clientes.
            </p>
            <Link href="/admin/ferramentas/nova">
              <Button className="bg-[#2D5A7B] hover:bg-[#1e4260] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Ferramenta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Tool cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="group transition-shadow duration-200 hover:shadow-md border border-gray-200"
            >
              <CardContent className="flex flex-col justify-between h-full p-5">
                {/* Card top section */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 leading-snug">
                      {tool.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        tool.status === "published"
                          ? "bg-green-50 text-green-700 border-green-200 shrink-0"
                          : "bg-gray-50 text-gray-500 border-gray-200 shrink-0"
                      }
                    >
                      {tool.status === "published" ? "Publicada" : "Rascunho"}
                    </Badge>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-xs font-normal ${
                      templateColors[tool.template_type] ||
                      "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {templateLabels[tool.template_type] || tool.template_type}
                  </Badge>

                  <p className="text-xs text-gray-400 mt-3">
                    Criada em{" "}
                    {new Date(tool.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-[#2D5A7B] h-8 px-2"
                    onClick={() => copyLink(tool.slug)}
                    title="Copiar link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <a
                    href={`/f/${tool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-[#2D5A7B] h-8 px-2"
                      title="Abrir ferramenta"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>

                  <Link href={`/admin/ferramentas/${tool.id}/respostas`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-[#2D5A7B] h-8 px-2"
                      title="Ver respostas"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  <div className="ml-auto flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => togglePublish(tool)}
                    >
                      {tool.status === "published" ? "Despublicar" : "Publicar"}
                    </Button>
                    <Link href={`/admin/ferramentas/${tool.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-[#2D5A7B] text-[#2D5A7B] hover:bg-[#2D5A7B]/5"
                      >
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
