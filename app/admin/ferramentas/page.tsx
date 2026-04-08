"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Copy,
  ExternalLink,
  MoreVertical,
  Archive,
  Eye,
  FileText,
} from "lucide-react";
import type { Tool } from "@/lib/schemas/types";

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
    alert("Link copiado!");
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

  const templateLabels: Record<string, string> = {
    swot: "SWOT Pessoal",
    radar: "Roda da Vida",
    ikigai: "Ikigai",
    category_grid: "Grid de Categorias",
    dynamic_table: "Tabela Dinâmica",
    free_layout: "Layout Livre",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ferramentas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas ferramentas de workshop e mentoria
          </p>
        </div>
        <Link href="/admin/ferramentas/nova">
          <Button className="bg-[#2D5A7B] hover:bg-[#1e4260]">
            <Plus className="w-4 h-4 mr-2" />
            Nova Ferramenta
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : tools.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              Nenhuma ferramenta criada ainda.
            </p>
            <Link href="/admin/ferramentas/nova">
              <Button className="bg-[#2D5A7B] hover:bg-[#1e4260]">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Ferramenta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{tool.title}</h3>
                    <Badge
                      variant={
                        tool.status === "published" ? "default" : "secondary"
                      }
                      className={
                        tool.status === "published"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : ""
                      }
                    >
                      {tool.status === "published"
                        ? "Publicada"
                        : tool.status === "draft"
                        ? "Rascunho"
                        : "Arquivada"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {templateLabels[tool.template_type] || tool.template_type} · Criada em{" "}
                    {new Date(tool.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  {tool.status === "published" && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      /f/{tool.slug}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {tool.status === "published" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(tool.slug)}
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <a
                        href={`/f/${tool.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" title="Abrir">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </>
                  )}
                  <Link href={`/admin/ferramentas/${tool.id}/respostas`}>
                    <Button variant="ghost" size="sm" title="Ver respostas">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(tool)}
                  >
                    {tool.status === "published" ? "Despublicar" : "Publicar"}
                  </Button>
                  <Link href={`/admin/ferramentas/${tool.id}`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
