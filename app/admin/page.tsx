"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Users, FileText, TrendingUp } from "lucide-react";
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
    }
    loadDashboard();
  }, []);

  const statCards = [
    { label: "Ferramentas", value: stats.totalTools, icon: Wrench, color: "#2D5A7B" },
    { label: "Publicadas", value: stats.publishedTools, icon: TrendingUp, color: "#10B981" },
    { label: "Total Respostas", value: stats.totalResponses, icon: FileText, color: "#3B82F6" },
    { label: "Respostas (7 dias)", value: stats.recentResponses, icon: Users, color: "#F59E0B" },
  ];

  const templateLabels: Record<string, string> = {
    swot: "SWOT",
    radar: "Roda da Vida",
    ikigai: "Ikigai",
    category_grid: "Grid de Categorias",
    dynamic_table: "Tabela Dinâmica",
    free_layout: "Layout Livre",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600" },
    published: { label: "Publicada", color: "bg-green-100 text-green-700" },
    archived: { label: "Arquivada", color: "bg-yellow-100 text-yellow-700" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral das suas ferramentas</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Ferramentas Recentes</CardTitle>
          <Link
            href="/admin/ferramentas"
            className="text-sm text-[#2D5A7B] hover:underline"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {recentTools.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma ferramenta criada ainda.</p>
              <Link
                href="/admin/ferramentas/nova"
                className="text-[#2D5A7B] hover:underline text-sm mt-2 inline-block"
              >
                Criar sua primeira ferramenta
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/admin/ferramentas/${tool.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{tool.title}</p>
                    <p className="text-xs text-gray-500">
                      {templateLabels[tool.template_type] || tool.template_type}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      statusLabels[tool.status]?.color || ""
                    }`}
                  >
                    {statusLabels[tool.status]?.label || tool.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
