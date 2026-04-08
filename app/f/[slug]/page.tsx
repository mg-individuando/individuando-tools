"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import ToolRenderer from "@/components/tools/ToolRenderer";
import type { Tool } from "@/lib/schemas/types";
import type { ToolSchema, ToolSettings } from "@/lib/schemas/tool-schema";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      toast.error("Por favor, informe seu nome.");
      return;
    }
    if (settings.requireEmail && !participantEmail.trim()) {
      toast.error("Por favor, informe seu email.");
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
      toast.error("Erro ao enviar: " + error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A7B]/40" />
      </div>
    );
  }

  /* ---- Not found ---- */
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
          <span className="text-gray-300 font-bold text-2xl font-sans">?</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2 font-sans">
          Ferramenta nao encontrada
        </h1>
        <p className="text-sm text-gray-400 text-center max-w-xs font-sans">
          Este link pode estar incorreto ou a ferramenta nao esta mais
          disponivel.
        </p>
      </div>
    );
  }

  if (!tool) return null;

  const schema = tool.schema as ToolSchema;
  const settings = tool.settings as ToolSettings;
  const primaryColor = schema.theme?.primaryColor || "#2D5A7B";

  /* ---- Success screen ---- */
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${primaryColor}12` }}
        >
          <CheckCircle2
            className="w-8 h-8"
            style={{ color: primaryColor }}
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 font-sans">
          Respostas Enviadas!
        </h1>
        <p className="text-sm text-gray-400 text-center max-w-sm font-sans">
          {settings.confirmationMessage ||
            "Obrigado por preencher! Suas respostas foram salvas."}
        </p>

        {/* Footer */}
        <span className="absolute bottom-6 text-[11px] text-gray-300 font-sans">
          Powered by Individuando
        </span>
      </div>
    );
  }

  /* ---- Main form ---- */
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: schema.theme?.backgroundColor || "#FAFBFC" }}
    >
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <h1
              className="text-xl sm:text-2xl font-semibold tracking-tight"
              style={{ color: primaryColor }}
            >
              {schema.title}
            </h1>
          </div>
          {schema.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed pl-11">
              {schema.description}
            </p>
          )}
          {schema.instructions && (
            <p className="text-xs text-gray-400 mt-1.5 italic max-w-2xl pl-11">
              {schema.instructions}
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {/* Participant info card */}
        {(settings.requireName || settings.requireEmail) && (
          <div className="max-w-md mx-auto mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Identificacao
            </p>
            {settings.requireName && (
              <div className="space-y-1.5">
                <label
                  htmlFor="participant-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Seu Nome <span className="text-red-400">*</span>
                </label>
                <input
                  id="participant-name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Como voce quer ser identificado"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all"
                />
              </div>
            )}
            {settings.requireEmail && (
              <div className="space-y-1.5">
                <label
                  htmlFor="participant-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Seu Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="participant-email"
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all"
                />
              </div>
            )}
          </div>
        )}

        {/* Tool renderer */}
        <ToolRenderer schema={schema} onSubmit={handleSubmit} />

        {/* Submitting overlay */}
        {submitting && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-center gap-3">
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: primaryColor }}
              />
              <span className="text-sm text-gray-600 font-medium">
                Enviando...
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center">
        <span className="text-[11px] text-gray-300 font-sans">
          Powered by Individuando
        </span>
      </footer>
    </div>
  );
}
