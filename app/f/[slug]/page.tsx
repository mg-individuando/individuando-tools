"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import ToolRenderer from "@/components/tools/ToolRenderer";
import type { Tool, Client, BrandConfig } from "@/lib/schemas/types";
import type {
  ToolSchema,
  ToolSettings,
  IdentificationField,
} from "@/lib/schemas/tool-schema";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [tool, setTool] = useState<Tool | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Identification
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"welcome" | "tool" | "done">("welcome");
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadTool() {
      const { data } = await supabase
        .from("tools")
        .select("*, clients(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (data) {
        setTool(data as Tool);
        if (data.clients) {
          setClient(data.clients as Client);
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadTool();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load client font dynamically
  useEffect(() => {
    if (!client) return;
    const brand = client.brand_config as BrandConfig | undefined;
    if (!brand?.fontUrl) return;

    const existingLink = document.querySelector(
      `link[href="${brand.fontUrl}"]`
    );
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = brand.fontUrl;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [client]);

  function handleStartTool() {
    const settings = tool?.settings as ToolSettings | undefined;
    if (!settings) return;

    if (settings.requireName && !participantName.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    if (settings.requireEmail && !participantEmail.trim()) {
      toast.error("Por favor, informe seu email.");
      return;
    }

    // Validate required custom fields
    const idFields =
      (settings.identificationFields as IdentificationField[]) || [];
    for (const field of idFields) {
      if (field.required && !customFields[field.id]?.trim()) {
        toast.error(`Por favor, preencha: ${field.label}`);
        return;
      }
    }

    setStep("tool");
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    if (!tool) return;
    setSubmitting(true);

    const { error } = await supabase.from("responses").insert({
      tool_id: tool.id,
      participant_name: participantName || null,
      participant_email: participantEmail || null,
      data: {
        ...formData,
        _identification: {
          name: participantName,
          email: participantEmail,
          ...customFields,
        },
      },
    });

    if (error) {
      toast.error("Erro ao enviar: " + error.message);
      setSubmitting(false);
      return;
    }

    setStep("done");
    setSubmitting(false);
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A7B]/40" />
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
          <span className="text-gray-300 font-bold text-2xl font-sans">?</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2 font-sans">
          Ferramenta não encontrada
        </h1>
        <p className="text-sm text-gray-400 text-center max-w-xs font-sans">
          Este link pode estar incorreto ou a ferramenta não está mais
          disponível.
        </p>
      </div>
    );
  }

  const schema = tool.schema as ToolSchema;
  const settings = tool.settings as ToolSettings;
  const brand = (client?.brand_config || {}) as Record<string, any>;

  // Resolve colors
  const primaryColor =
    brand.primaryColor || schema.theme?.primaryColor || "#2D5A7B";
  const backgroundColor =
    brand.backgroundColor || schema.theme?.backgroundColor || "#FAFBFC";
  const textColor = brand.textColor || undefined;
  const buttonColor = brand.buttonColor || primaryColor;
  const buttonTextColor = brand.buttonTextColor || "#FFFFFF";
  const buttonRadius = brand.buttonRadius || "0.75rem";
  const fontFamily = brand.fontFamily || undefined;
  const headingWeight = brand.headingWeight || "600";
  const bodyWeight = brand.bodyWeight || "400";
  const labelWeight = brand.labelWeight || "500";
  const headerBg = brand.headerBg || undefined;
  const headerTextColor = brand.headerTextColor || primaryColor;
  const footerText = brand.footerText || "Powered by Individuando";
  const showNameInHeader = brand.showNameInHeader !== false;

  const idFields =
    (settings.identificationFields as IdentificationField[]) || [];

  /* ── Branded Header Component ── */
  function BrandedHeader({ compact = false }: { compact?: boolean }) {
    if (client) {
      return (
        <header
          className="w-full sticky top-0 z-10"
          style={{
            backgroundColor: headerBg || "#FFFFFF",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            backgroundImage: brand.headerBgImage
              ? `url(${brand.headerBgImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="max-w-4xl mx-auto px-4 flex items-center justify-between"
            style={{
              height: brand.headerHeight === "compact" ? "60px" : brand.headerHeight === "tall" ? "120px" : "80px",
            }}
          >
            <div className="flex items-center gap-3">
              {client.logo_url && (
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="h-10 object-contain max-w-[160px]"
                />
              )}
              {showNameInHeader && !client.logo_url && (
                <span
                  style={{
                    color: headerTextColor,
                    fontWeight: Number(headingWeight),
                    fontFamily: fontFamily || undefined,
                  }}
                  className="text-lg"
                >
                  {client.name}
                </span>
              )}
            </div>
            {client.show_partner_logo && client.partner_logo_url && (
              <img
                src={client.partner_logo_url}
                alt="Partner"
                className="h-8 object-contain"
              />
            )}
          </div>
        </header>
      );
    }

    return (
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-bold text-sm">I</span>
          </div>
          {!compact && (
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: primaryColor }}
            >
              Individuando
            </span>
          )}
        </div>
      </header>
    );
  }

  /* ── Success Screen ── */
  if (step === "done") {
    return (
      <div
        className="min-h-screen flex flex-col font-sans"
        style={{
          backgroundColor,
          fontFamily: fontFamily || undefined,
          color: textColor || undefined,
        }}
      >
        <BrandedHeader compact />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <CheckCircle2
              className="w-8 h-8"
              style={{ color: primaryColor }}
            />
          </div>
          <h1
            className="text-2xl font-semibold text-gray-800 mb-2 font-sans"
            style={{
              fontWeight: headingWeight,
              fontFamily: fontFamily || undefined,
            }}
          >
            Respostas Enviadas!
          </h1>
          <p className="text-sm text-gray-400 text-center max-w-sm font-sans">
            {settings.confirmationMessage ||
              "Obrigado por preencher! Suas respostas foram salvas."}
          </p>
        </div>
        <footer className="w-full py-6 text-center">
          <span className="text-[11px] text-gray-300 font-sans">
            {footerText}
          </span>
        </footer>
      </div>
    );
  }

  /* ── Welcome / Identification Screen ── */
  if (step === "welcome") {
    return (
      <div
        className="min-h-screen flex flex-col font-sans"
        style={{
          backgroundColor,
          fontFamily: fontFamily || undefined,
          color: textColor || undefined,
        }}
      >
        <BrandedHeader />

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            {/* Tool info card */}
            <div className="text-center mb-8">
              <h1
                className="text-2xl sm:text-3xl tracking-tight mb-3"
                style={{
                  color: textColor || "#1a1a1a",
                  fontWeight: Number(headingWeight),
                  fontFamily: fontFamily || undefined,
                }}
              >
                {schema.title}
              </h1>
              {schema.description && (
                <p
                  className="text-sm leading-relaxed max-w-md mx-auto"
                  style={{
                    color: textColor ? `${textColor}99` : "#6b7280",
                    fontWeight: Number(bodyWeight),
                  }}
                >
                  {schema.description}
                </p>
              )}
              {schema.instructions && (
                <p
                  className="text-xs mt-2 italic max-w-md mx-auto"
                  style={{ color: textColor ? `${textColor}66` : "#9ca3af" }}
                >
                  {schema.instructions}
                </p>
              )}
              {settings.welcomeMessage && (
                <p
                  className="text-sm mt-4 max-w-md mx-auto"
                  style={{
                    color: textColor ? `${textColor}88` : "#6b7280",
                    fontWeight: Number(bodyWeight),
                  }}
                >
                  {settings.welcomeMessage}
                </p>
              )}
            </div>

            {/* Identification form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  color: primaryColor,
                  fontWeight: Number(labelWeight),
                }}
              >
                Identificação
              </p>

              {/* Name */}
              {settings.requireName && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="p-name"
                    className="block text-sm font-medium"
                    style={{
                      color: textColor || "#374151",
                      fontWeight: Number(labelWeight),
                    }}
                  >
                    Seu Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="p-name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Como você quer ser identificado"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:bg-white outline-none transition-all"
                    style={
                      {
                        "--tw-ring-color": `${primaryColor}22`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              )}

              {/* Email */}
              {settings.requireEmail && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="p-email"
                    className="block text-sm font-medium"
                    style={{
                      color: textColor || "#374151",
                      fontWeight: Number(labelWeight),
                    }}
                  >
                    Seu Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="p-email"
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:bg-white outline-none transition-all"
                    style={
                      {
                        "--tw-ring-color": `${primaryColor}22`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              )}

              {/* Custom identification fields */}
              {idFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={`custom-${field.id}`}
                    className="block text-sm font-medium"
                    style={{
                      color: textColor || "#374151",
                      fontWeight: Number(labelWeight),
                    }}
                  >
                    {field.label}{" "}
                    {field.required && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>

                  {field.type === "dropdown" && field.options ? (
                    <select
                      id={`custom-${field.id}`}
                      value={customFields[field.id] || ""}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:bg-white outline-none transition-all"
                      style={
                        {
                          "--tw-ring-color": `${primaryColor}22`,
                        } as React.CSSProperties
                      }
                    >
                      <option value="">Selecione...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`custom-${field.id}`}
                      value={customFields[field.id] || ""}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder || ""}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:bg-white outline-none transition-all"
                      style={
                        {
                          "--tw-ring-color": `${primaryColor}22`,
                        } as React.CSSProperties
                      }
                    />
                  )}
                </div>
              ))}

              {/* Start button */}
              <button
                onClick={handleStartTool}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                  borderRadius: buttonRadius,
                  fontFamily: fontFamily || undefined,
                }}
              >
                Começar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <footer className="w-full py-6 text-center">
          <span className="text-[11px] text-gray-300 font-sans">
            {footerText}
          </span>
        </footer>
      </div>
    );
  }

  /* ── Tool Screen ── */
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor,
        fontFamily: fontFamily || undefined,
        color: textColor || undefined,
      }}
    >
      <BrandedHeader />

      {/* Tool title */}
      <div
        className="w-full"
        style={{ backgroundColor: headerBg || "#FFFFFF" }}
      >
        <div className="max-w-4xl mx-auto px-4 pb-5 pt-3">
          <h1
            className="text-xl sm:text-2xl tracking-tight"
            style={{
              color: headerTextColor,
              fontWeight: Number(headingWeight),
              fontFamily: fontFamily || undefined,
            }}
          >
            {schema.title}
          </h1>
          {schema.description && (
            <p
              className="text-sm mt-2 max-w-2xl leading-relaxed"
              style={{
                color: textColor ? `${textColor}99` : "#6b7280",
                fontWeight: Number(bodyWeight),
              }}
            >
              {schema.description}
            </p>
          )}
          {schema.instructions && (
            <p
              className="text-xs mt-1.5 italic max-w-2xl"
              style={{ color: textColor ? `${textColor}77` : "#9ca3af" }}
            >
              {schema.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Tool renderer */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <ToolRenderer schema={schema} onSubmit={handleSubmit} />

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

      <footer className="w-full py-6 text-center">
        <span className="text-[11px] text-gray-300 font-sans">
          {footerText}
        </span>
      </footer>
    </div>
  );
}
