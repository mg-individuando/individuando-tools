"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    { label: "Ferramentas", value: stats.totalTools, icon: Wrench, color: "var(--brand)" },
    { label: "Publicadas", value: stats.publishedTools, icon: TrendingUp, color: "var(--success)" },
    { label: "Total Respostas", value: stats.totalResponses, icon: FileText, color: "var(--info)" },
    { label: "Respostas (7 dias)", value: stats.recentResponses, icon: Users, color: "var(--warning)" },
  ];

  const templateLabels: Record<string, string> = {
    swot: "SWOT",
    radar: "Roda da Vida",
    ikigai: "Ikigai",
    category_grid: "Grid de Categorias",
    dynamic_table: "Tabela Dinâmica",
    free_layout: "Layout Livre",
  };

  const statusLabels: Record<string, { label: string; className: string }> = {
    draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
    published: { label: "Publicada", className: "bg-emerald-50 text-emerald-700" },
    archived: { label: "Arquivada", className: "bg-amber-50 text-amber-700" },
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Ola, Administrador!
          </h1>
          <p className="text-gray-500 mt-1 text-base">
            Aqui esta o resumo das suas ferramentas
          </p>
        </div>
        <Link
          href="/admin/ferramentas/nova"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Criar Ferramenta
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `color-mix(in srgb, ${card.color} 8%, transparent)` }}
                >
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-gray-900">
                    {loading ? (
                      <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tools */}
      <Card className="border border-gray-100 rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Ferramentas Recentes
          </CardTitle>
          <Link
            href="/admin/ferramentas"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors"
          >
            Ver todas
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentTools.length === 0 ? (
            <div className="text-center py-14">
              <div
                className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center mx-auto mb-4"
              >
                <Wrench className="w-7 h-7 text-primary" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                Nenhuma ferramenta criada ainda
              </p>
              <p className="text-gray-500 text-sm mb-5">
                Comece criando sua primeira ferramenta interativa.
              </p>
              <Link
                href="/admin/ferramentas/nova"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Criar Ferramenta
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/admin/ferramentas/${tool.id}`}
                  className="flex items-center justify-between py-3.5 px-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg bg-brand-subtle flex items-center justify-center flex-shrink-0"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                        {tool.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {templateLabels[tool.template_type] || tool.template_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(tool.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        statusLabels[tool.status]?.className || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[tool.status]?.label || tool.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
