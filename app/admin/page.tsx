"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wrench, Users, FileText, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalTools: number;
  publishedTools: number;
  totalResponses: number;
  recentResponses: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTools: 0,
    publishedTools: 0,
    totalResponses: 0,
    recentResponses: 0,
  });
  const [recentTools, setRecentTools] = useState<
    Array<{ id: string; title: string; status: string; template_type: string; created_at: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      // Total tools
      const { count: totalTools } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true });

      // Published tools
      const { count: publishedTools } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      // Total responses
      const { count: totalResponses } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true });

      // Recent responses (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: recentResponses } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .gte("submitted_at", weekAgo.toISOString());

      setStats({
        totalTools: totalTools || 0,
        publishedTools: publishedTools || 0,
        totalResponses: totalResponses || 0,
        recentResponses: recentResponses || 0,
      });

      // Recent tools
      const { data: tools } = await supabase
        .from("tools")
        .select("id, title, status, template_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (tools) setRecentTools(tools);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const statCards = [
    { label: "Ferramentas", value: stats.totalTools, icon: Wrench },
    { label: "Publicadas", value: stats.publishedTools, icon: TrendingUp },
    { label: "Total Respostas", value: stats.totalResponses, icon: FileText },
    { label: "Respostas (7 dias)", value: stats.recentResponses, icon: Users },
  ];

  const templateLabels: Record<string, string> = {
    swot: "SWOT",
    radar: "Roda da Vida",
    ikigai: "Ikigai",
    category_grid: "Grid de Categorias",
    dynamic_table: "Tabela Dinamica",
    free_layout: "Layout Livre",
  };

  const statusLabels: Record<string, { label: string; className: string }> = {
    draft: {
      label: "Rascunho",
      className: "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60",
    },
    published: {
      label: "Publicada",
      className: "gradient-primary text-white",
    },
    archived: {
      label: "Arquivada",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
            Ola, Administrador!
          </h1>
          <p className="text-[#475569] mt-1 text-base">
            Aqui esta o resumo das suas ferramentas
          </p>
        </div>
        <Link
          href="/admin/ferramentas/nova"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Criar Ferramenta
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="glass-card p-6"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="feature-icon">
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                {loading ? (
                  <span className="inline-block w-10 h-8 bg-[rgba(0,128,255,0.06)] rounded animate-pulse" />
                ) : (
                  <p className="stat-number">{card.value}</p>
                )}
                <p className="text-sm text-[#475569] mt-0.5">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tools */}
      <div className="glass-card">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-[#0f172a]">
            Ferramentas Recentes
          </h2>
          <Link
            href="/admin/ferramentas"
            className="inline-flex items-center gap-1 text-sm font-medium gradient-text hover:opacity-80 transition-opacity"
          >
            Ver todas
            <ArrowRight className="w-3.5 h-3.5 text-[#0080ff]" />
          </Link>
        </div>
        <div className="px-6 pb-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-[rgba(0,128,255,0.04)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentTools.length === 0 ? (
            <div className="text-center py-14">
              <div className="feature-icon mx-auto mb-4">
                <Wrench className="w-7 h-7" />
              </div>
              <p className="text-[#0f172a] font-medium mb-1">
                Nenhuma ferramenta criada ainda
              </p>
              <p className="text-[#475569] text-sm mb-5">
                Comece criando sua primeira ferramenta interativa.
              </p>
              <Link
                href="/admin/ferramentas/nova"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Criar Ferramenta
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(0,128,255,0.06)]">
              {recentTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/admin/ferramentas/${tool.id}`}
                  className="flex items-center justify-between py-3.5 px-3 -mx-3 rounded-xl hover:bg-[rgba(0,128,255,0.03)] transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0f172a] truncate group-hover:text-[#0080ff] transition-colors">
                        {tool.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[rgba(0,128,255,0.06)] text-[#475569]">
                          {templateLabels[tool.template_type] || tool.template_type}
                        </span>
                        <span className="text-xs text-[#475569]/60">
                          {formatDate(tool.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        statusLabels[tool.status]?.className || "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60"
                      }`}
                    >
                      {statusLabels[tool.status]?.label || tool.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[rgba(0,128,255,0.3)] group-hover:text-[#0080ff] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
