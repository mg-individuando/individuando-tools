"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Eye, FileText, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Tool, Response } from "@/lib/schemas/types";
import type { ToolSchema } from "@/lib/schemas/tool-schema";
import { ListSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function RespostasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tool, setTool] = useState<Tool | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: toolData } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();
      if (toolData) setTool(toolData as Tool);

      const { data: responsesData } = await supabase
        .from("responses")
        .select("*")
        .eq("tool_id", id)
        .order("submitted_at", { ascending: false });
      if (responsesData) setResponses(responsesData as Response[]);
      setLoading(false);
    }
    loadData();
  }, [id]);

  function exportCSV() {
    if (!tool || responses.length === 0) return;
    const schema = tool.schema as ToolSchema;
    const allFieldIds = schema.sections.flatMap((s) =>
      s.fields.map((f) => f.id)
    );
    const headers = [
      "Participante",
      "Email",
      "Data",
      ...allFieldIds,
    ];

    const rows = responses.map((r) => [
      r.participant_name || "",
      r.participant_email || "",
      new Date(r.submitted_at).toLocaleString("pt-BR"),
      ...allFieldIds.map((fId) => String(r.data[fId] || "")),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-respostas.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
        <span className="sr-only">Carregando respostas…</span>
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <ListSkeleton rows={5} />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-[#0f172a]">Ferramenta não encontrada</h2>
        <p className="text-sm text-[#475569] mt-1">
          Esta ferramenta pode ter sido removida ou o link está incorreto.
        </p>
        <Link href="/admin/ferramentas">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Voltar para Ferramentas
          </Button>
        </Link>
      </div>
    );
  }

  const schema = tool.schema as ToolSchema;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href={`/admin/ferramentas/${id}`}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> {tool.title}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Respostas</h1>
          <p className="text-gray-500 mt-1">
            {responses.length} resposta{responses.length !== 1 ? "s" : ""} recebida{responses.length !== 1 ? "s" : ""}
          </p>
        </div>
        {responses.length > 0 && (
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        )}
      </div>

      {responses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-14 px-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-[rgba(0,128,255,0.08)] flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Users className="w-7 h-7 text-[#0080ff]" />
            </div>
            <h2 className="text-base font-semibold text-[#0f172a] mb-1.5">
              {tool.status === "published"
                ? "Aguardando primeiras respostas"
                : "Ferramenta ainda não publicada"}
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed mb-5">
              {tool.status === "published" ? (
                <>
                  Compartilhe o link com seus participantes. Quando alguém responder,
                  os dados aparecem aqui.
                </>
              ) : (
                <>
                  Publique a ferramenta primeiro, depois compartilhe o link público
                  para começar a receber respostas.
                </>
              )}
            </p>
            <Link href={`/admin/ferramentas/${tool.id}?tab=share`}>
              <Button size="sm" className="bg-[#0080ff] hover:bg-[#0066cc]">
                <ExternalLink className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {tool.status === "published" ? "Compartilhar ferramenta" : "Ir para publicação"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            {responses.map((r) => (
              <Card
                key={r.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  selectedResponse?.id === r.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedResponse(r)}
              >
                <CardContent className="py-3">
                  <p className="font-medium text-sm">
                    {r.participant_name || "Anônimo"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.submitted_at).toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selectedResponse ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedResponse.participant_name || "Anônimo"}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Enviado em{" "}
                    {new Date(selectedResponse.submitted_at).toLocaleString("pt-BR")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schema.sections.map((section) => (
                      <div key={section.id}>
                        <h4
                          className="font-semibold text-sm mb-1"
                          style={{ color: section.color }}
                        >
                          {section.label}
                        </h4>
                        {section.fields.map((field) => {
                          const value = selectedResponse.data[field.id];
                          return (
                            <div
                              key={field.id}
                              className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap"
                            >
                              {value !== undefined && value !== null
                                ? String(value)
                                : "(vazio)"}
                            </div>
                          );
                        })}
                        <Separator className="mt-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-gray-600">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p>Selecione uma resposta para visualizar</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
