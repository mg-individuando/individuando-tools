"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Copy, ExternalLink, Eye, FileText, LayoutGrid, List, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Tool } from "@/lib/schemas/types";

const templateLabels: Record<string, string> = {
  swot: "SWOT Pessoal",
  radar: "Roda da Vida",
  ikigai: "Ikigai",
  category_grid: "Forcas Pessoais",
  dynamic_table: "Metas",
  free_layout: "Layout Livre",
};

const templateColors: Record<string, string> = {
  swot: "bg-blue-50/80 text-blue-700 border-blue-200/60",
  radar: "bg-purple-50/80 text-purple-700 border-purple-200/60",
  ikigai: "bg-amber-50/80 text-amber-700 border-amber-200/60",
  category_grid: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
  dynamic_table: "bg-rose-50/80 text-rose-700 border-rose-200/60",
  free_layout: "bg-slate-50/80 text-slate-700 border-slate-200/60",
};

export default function FerramentasPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const supabase = createClient();
  const router = useRouter();

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

  async function handleDelete(toolId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm("Excluir esta ferramenta?")) return;
    await supabase.from("tools").delete().eq("id", toolId);
    toast.success("Ferramenta excluída!");
    setTools(tools.filter(t => t.id !== toolId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#475569]">
        Carregando...
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Ferramentas
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Gerencie suas ferramentas interativas de workshop e mentoria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "gradient-primary text-white" : "text-[#475569] hover:bg-white/60"}`}
              title="Visualização em grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "gradient-primary text-white" : "text-[#475569] hover:bg-white/60"}`}
              title="Visualização em lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link href="/admin/ferramentas/nova">
            <button className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Nova Ferramenta
            </button>
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {tools.length === 0 ? (
        <div className="glass-card border-dashed">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="feature-icon mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-[#0f172a] font-medium mb-1">
              Nenhuma ferramenta criada
            </p>
            <p className="text-sm text-[#475569] mb-6">
              Crie sua primeira ferramenta interativa para compartilhar com seus clientes.
            </p>
            <Link href="/admin/ferramentas/nova">
              <button className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Criar Primeira Ferramenta
              </button>
            </Link>
          </div>
        </div>
      ) : (
        /* Tool cards — grid or list */
        viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="glass-card group flex flex-col justify-between h-full p-5"
            >
              {/* Card top section */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-[#0f172a] leading-snug">
                    {tool.title}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      tool.status === "published"
                        ? "gradient-primary text-white"
                        : "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60"
                    }`}
                  >
                    {tool.status === "published" ? "Publicada" : "Rascunho"}
                  </span>
                </div>

                <span
                  className={`inline-block text-xs font-normal px-2 py-0.5 rounded-md border ${
                    templateColors[tool.template_type] ||
                    "bg-slate-50/80 text-slate-600 border-slate-200/60"
                  }`}
                >
                  {templateLabels[tool.template_type] || tool.template_type}
                </span>

                <p className="text-xs text-[#475569]/60 mt-3">
                  Criada em{" "}
                  {new Date(tool.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-1 mt-4 pt-4 border-t border-[rgba(0,128,255,0.06)]">
                <button
                  className="text-[#475569] hover:text-[#0080ff] h-8 px-2 rounded-lg hover:bg-[rgba(0,128,255,0.05)] transition-all duration-200"
                  onClick={() => copyLink(tool.slug)}
                  title="Copiar link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`/f/${tool.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className="text-[#475569] hover:text-[#0080ff] h-8 px-2 rounded-lg hover:bg-[rgba(0,128,255,0.05)] transition-all duration-200"
                    title="Abrir ferramenta"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </a>

                <Link href={`/admin/ferramentas/${tool.id}/respostas`}>
                  <button
                    className="text-[#475569] hover:text-[#0080ff] h-8 px-2 rounded-lg hover:bg-[rgba(0,128,255,0.05)] transition-all duration-200"
                    title="Ver respostas"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    className="btn-secondary text-xs !py-1.5 !px-3"
                    onClick={() => togglePublish(tool)}
                  >
                    {tool.status === "published" ? "Despublicar" : "Publicar"}
                  </button>
                  <Link href={`/admin/ferramentas/${tool.id}`}>
                    <button className="btn-primary text-xs !py-1.5 !px-3">
                      Editar
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : (
        /* List view */
        <div className="glass-card overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_120px_100px_120px_80px] gap-4 px-5 py-3 text-[11px] font-semibold text-[#475569] uppercase tracking-wider border-b border-[rgba(0,128,255,0.06)]">
            <span>Nome</span>
            <span>Tipo</span>
            <span>Status</span>
            <span>Criada em</span>
            <span>Ações</span>
          </div>
          {/* Rows */}
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="grid grid-cols-[1fr_120px_100px_120px_80px] gap-4 px-5 py-3 items-center border-b border-[rgba(0,128,255,0.03)] hover:bg-[rgba(0,128,255,0.02)] transition-colors duration-150 cursor-pointer"
              onClick={() => router.push(`/admin/ferramentas/${tool.id}`)}
            >
              <span className="text-sm font-medium text-[#0f172a] truncate">{tool.title}</span>
              <span className={`inline-block text-xs font-normal px-2 py-0.5 rounded-md border w-fit ${
                templateColors[tool.template_type] ||
                "bg-slate-50/80 text-slate-600 border-slate-200/60"
              }`}>
                {templateLabels[tool.template_type] || tool.template_type}
              </span>
              <span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    tool.status === "published"
                      ? "gradient-primary text-white"
                      : "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60"
                  }`}
                >
                  {tool.status === "published" ? "Publicada" : "Rascunho"}
                </span>
              </span>
              <span className="text-xs text-[#94a3b8]">
                {new Date(tool.created_at).toLocaleDateString("pt-BR")}
              </span>
              <div className="flex gap-1">
                <Link href={`/admin/ferramentas/${tool.id}`} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="text-[#475569] hover:text-[#0080ff] h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[rgba(0,128,255,0.05)] transition-all duration-200"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button
                  className="text-[#475569] hover:text-red-500 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Excluir"
                  onClick={(e) => handleDelete(tool.id, e)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
}
