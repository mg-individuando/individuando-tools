"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ToolRenderer from "@/components/tools/ToolRenderer";
import type { Tool } from "@/lib/schemas/types";
import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadTool() {
      const { data } = await supabase
        .from("tools")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (data) {
        setTool(data as Tool);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadTool();
  }, [slug]);

  async function handleSubmit(formData: Record<string, unknown>) {
    if (!tool) return;
    const settings = tool.settings as ToolSettings;

    if (settings.requireName && !participantName.trim()) {
      alert("Por favor, informe seu nome.");
      return;
    }
    if (settings.requireEmail && !participantEmail.trim()) {
      alert("Por favor, informe seu email.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("responses").insert({
      tool_id: tool.id,
      participant_name: participantName || null,
      participant_email: participantEmail || null,
      data: formData,
    });

    if (error) {
      alert("Erro ao enviar: " + error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            Ferramenta não encontrada
          </h1>
          <p className="text-gray-500">
            Este link pode estar incorreto ou a ferramenta não está mais disponível.
          </p>
        </div>
      </div>
    );
  }

  if (!tool) return null;

  const schema = tool.schema as ToolSchema;
  const settings = tool.settings as ToolSettings;
  const primaryColor = schema.theme?.primaryColor || "#2D5A7B";

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Respostas Enviadas!
          </h1>
          <p className="text-gray-500">
            {settings.confirmationMessage ||
              "Obrigado por preencher! Suas respostas foram salvas."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: schema.theme?.backgroundColor || "#F8FAFC" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo placeholder */}
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: primaryColor }}
          >
            {schema.title}
          </h1>
          {schema.description && (
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              {schema.description}
            </p>
          )}
          {schema.instructions && (
            <p className="text-sm text-gray-400 mt-2 italic max-w-lg mx-auto">
              {schema.instructions}
            </p>
          )}
        </div>

        {/* Participant info */}
        {(settings.requireName || settings.requireEmail) && (
          <div className="max-w-md mx-auto mb-8 space-y-3 bg-white rounded-xl p-5 shadow-sm border">
            {settings.requireName && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Seu Nome *
                </Label>
                <Input
                  id="name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Como você quer ser identificado"
                />
              </div>
            )}
            {settings.requireEmail && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Seu Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            )}
          </div>
        )}

        {/* Tool */}
        <ToolRenderer
          schema={schema}
          onSubmit={handleSubmit}
        />

        {submitting && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
              <span>Enviando...</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-xs text-gray-400">
          Powered by Individuando
        </div>
      </div>
    </div>
  );
}
