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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
        <Loader2 className="w-8 h-8 animate-spin text-brand/40" />
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-white px-4">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <span className="text-muted-foreground/50 font-bold text-2xl">?</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground/70 mb-2">
          Ferramenta não encontrada
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Este link pode estar incorreto ou a ferramenta não está mais
          disponível.
        </p>
      </div>
    );
  }

  const schema = tool.schema as ToolSchema;
  const settings = tool.settings as ToolSettings;
  const brand = (client?.brand_config || {}) as Record<string, any>;

  // Resolve colors — DataPulse defaults when no client
  const primaryColor =
    brand.primaryColor || schema.theme?.primaryColor || "#0080ff";
  const backgroundColor =
    brand.backgroundColor || schema.theme?.backgroundColor || "#f8fafc";
  const textColor = brand.textColor || undefined;
  const buttonColor = brand.buttonColor || undefined; // undefined = use gradient
  const buttonTextColor = brand.buttonTextColor || "#ffffff";
  const buttonRadius = brand.buttonRadius || "12px";
  const cardRadius = brand.cardRadius || "16px";
  const fontFamily = brand.fontFamily || undefined;
  const headingWeight = brand.headingWeight || "600";
  const bodyWeight = brand.bodyWeight || "400";
  const labelWeight = brand.labelWeight || "500";
  const headerBg = brand.headerBg || undefined;
  const headerTextColor = brand.headerTextColor || primaryColor;
  const footerText = brand.footerText || "Powered by Individuando";
  const useGradientButton = !brand.buttonColor; // use DataPulse gradient when no custom button color
  const showNameInHeader = brand.showNameInHeader !== false;

  const idFields =
    (settings.identificationFields as IdentificationField[]) || [];

  const bannerConfig = brand.bannerConfig as Record<string, any> | undefined;

  /* ── Branded Header Component ── */
  function BrandedHeader({ compact = false }: { compact?: boolean }) {
    if (client) {
      // Determine header background style
      const headerStyle: React.CSSProperties = {
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      };

      if (bannerConfig) {
        // Apply banner config styling
        if (bannerConfig.backgroundType === "gradient") {
          headerStyle.background = `linear-gradient(${bannerConfig.gradientDirection || "to right"}, ${bannerConfig.gradientFrom}, ${bannerConfig.gradientTo})`;
        } else if (bannerConfig.backgroundType === "solid") {
          headerStyle.backgroundColor = bannerConfig.backgroundColor;
        } else if (bannerConfig.backgroundType === "image" && bannerConfig.backgroundImage) {
          headerStyle.backgroundImage = `url(${bannerConfig.backgroundImage})`;
          headerStyle.backgroundSize = "cover";
          headerStyle.backgroundPosition = "center";
        } else {
          headerStyle.backgroundColor = headerBg || "var(--card)";
        }
      } else {
        headerStyle.backgroundColor = headerBg || "var(--card)";
        if (brand.headerBgImage) {
          headerStyle.backgroundImage = `url(${brand.headerBgImage})`;
          headerStyle.backgroundSize = "cover";
          headerStyle.backgroundPosition = "center";
        }
      }

      const headerHeight = brand.headerHeight === "compact" ? "60px" : brand.headerHeight === "tall" ? "120px" : "80px";
      const hasOverlay = bannerConfig?.overlayOpacity > 0;

      return (
        <header className="w-full sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 relative rounded-b-xl overflow-hidden" style={headerStyle}>
            {hasOverlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: `rgba(0,0,0,${bannerConfig!.overlayOpacity / 100})` }}
              />
            )}
            <div
              className="flex items-center relative z-10"
              style={{ height: headerHeight }}
            >
            {bannerConfig ? (
              /* Column-based banner layout */
              <div className="flex items-center w-full h-full gap-4">
                {/* Client logo column */}
                {bannerConfig.showClientLogo !== false && (
                  <div className="flex items-center shrink-0" style={{ order: bannerConfig.clientLogoPosition === "right" ? 3 : 1 }}>
                    {client.logo_url ? (
                      <img
                        src={client.logo_url}
                        alt={client.name}
                        className="object-contain"
                        style={{ height: `${bannerConfig.clientLogoSize || 40}px`, maxWidth: "160px" }}
                      />
                    ) : showNameInHeader ? (
                      <span
                        style={{ color: headerTextColor, fontWeight: Number(headingWeight), fontFamily: fontFamily || undefined }}
                        className="text-lg"
                      >
                        {client.name}
                      </span>
                    ) : null}
                  </div>
                )}
                {/* Text column */}
                <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ order: 2 }}>
                  {bannerConfig.title && (
                    <p
                      className="font-semibold leading-tight"
                      style={{
                        color: bannerConfig.titleColor || "#FFFFFF",
                        fontSize: `${bannerConfig.titleSize || 22}px`,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                        textAlign: bannerConfig.titlePosition || "center",
                        fontFamily: fontFamily || undefined,
                      }}
                    >
                      {bannerConfig.title}
                    </p>
                  )}
                  {bannerConfig.subtitle && (
                    <p
                      className="leading-tight truncate mt-0.5"
                      style={{
                        color: bannerConfig.subtitleColor || "rgba(255,255,255,0.75)",
                        fontSize: `${bannerConfig.subtitleSize || 13}px`,
                        textAlign: bannerConfig.titlePosition || "center",
                        fontFamily: fontFamily || undefined,
                      }}
                    >
                      {bannerConfig.subtitle}
                    </p>
                  )}
                </div>
                {/* Individuando logo column */}
                {bannerConfig.individuandoVariant && (
                  <div className="flex items-center shrink-0" style={{ order: bannerConfig.clientLogoPosition === "right" ? 1 : 3 }}>
                    <img
                      src={`/logos/individuando/logo-${bannerConfig.individuandoVariant}.svg`}
                      alt="Individuando"
                      className="object-contain"
                      style={{ height: `${bannerConfig.individuandoSize || 36}px`, maxWidth: "140px" }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Legacy header layout — still shows Individuando logo */
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {client.logo_url && (
                    <img src={client.logo_url} alt={client.name} className="h-10 object-contain max-w-[160px]" />
                  )}
                  {showNameInHeader && !client.logo_url && (
                    <span style={{ color: headerTextColor, fontWeight: Number(headingWeight), fontFamily: fontFamily || undefined }} className="text-lg">
                      {client.name}
                    </span>
                  )}
                </div>
                <img
                  src="/logos/individuando/logo-7.svg"
                  alt="Individuando"
                  className="h-8 object-contain max-w-[120px]"
                />
              </div>
            )}
          </div>
          </div>
        </header>
      );
    }

    /* Default Individuando header (no client) */
    return (
      <header className="w-full border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src="/logos/individuando/logo-1.svg"
            alt="Individuando"
            className="h-8 object-contain"
          />
          {!compact && (
            <span className="text-base font-semibold tracking-tight text-brand">
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
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl font-semibold text-foreground mb-2"
            style={{
              fontWeight: headingWeight,
              fontFamily: fontFamily || undefined,
            }}
          >
            Respostas Enviadas!
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {settings.confirmationMessage ||
              "Obrigado por preencher! Suas respostas foram salvas."}
          </p>
        </div>
        <footer className="w-full py-6 text-center">
          <span className="text-[11px] text-muted-foreground/50">
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
                  color: textColor || "var(--foreground)",
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
                    color: textColor ? `${textColor}99` : "var(--muted-foreground)",
                    fontWeight: Number(bodyWeight),
                  }}
                >
                  {schema.description}
                </p>
              )}
              {schema.instructions && (
                <p
                  className="text-xs mt-2 italic max-w-md mx-auto"
                  style={{ color: textColor ? `${textColor}66` : "var(--muted-foreground)" }}
                >
                  {schema.instructions}
                </p>
              )}
              {settings.welcomeMessage && (
                <p
                  className="text-sm mt-4 max-w-md mx-auto"
                  style={{
                    color: textColor ? `${textColor}88` : "var(--muted-foreground)",
                    fontWeight: Number(bodyWeight),
                  }}
                >
                  {settings.welcomeMessage}
                </p>
              )}
            </div>

            {/* Identification form */}
            <div
              className="rounded-2xl p-6 sm:p-8 space-y-5 transition-all duration-200"
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(0,128,255,0.1)",
                boxShadow: "rgba(0,128,255,0.08) 0px 4px 24px",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider gradient-text"
                style={{
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
                      color: textColor || "var(--foreground)",
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
                    className="w-full rounded-xl border border-[rgba(0,128,255,0.1)] bg-white/60 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0080ff]/40 focus:ring-2 focus:ring-[#0080ff]/10 focus:bg-white outline-none transition-all duration-200"
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
                      color: textColor || "var(--foreground)",
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
                    className="w-full rounded-xl border border-[rgba(0,128,255,0.1)] bg-white/60 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0080ff]/40 focus:ring-2 focus:ring-[#0080ff]/10 focus:bg-white outline-none transition-all duration-200"
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
                      color: textColor || "var(--foreground)",
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
                      className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-sm text-foreground focus:ring-2 focus:bg-card outline-none transition-all"
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
                      className="w-full rounded-xl border border-[rgba(0,128,255,0.1)] bg-white/60 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0080ff]/40 focus:ring-2 focus:ring-[#0080ff]/10 focus:bg-white outline-none transition-all duration-200"
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
                className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${useGradientButton ? "btn-primary" : ""}`}
                style={{
                  ...(!useGradientButton ? { backgroundColor: buttonColor, color: buttonTextColor, borderRadius: buttonRadius } : {}),
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
          <span className="text-[11px] text-muted-foreground/50">
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
        ["--card-radius" as string]: cardRadius,
        ["--button-radius" as string]: buttonRadius,
      }}
    >
      <BrandedHeader />

      {/* Tool title */}
      <div
        className="w-full"
        style={{ backgroundColor: headerBg || "var(--card)" }}
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
                color: textColor ? `${textColor}99` : "var(--muted-foreground)",
                fontWeight: Number(bodyWeight),
              }}
            >
              {schema.description}
            </p>
          )}
          {schema.instructions && (
            <p
              className="text-xs mt-1.5 italic max-w-2xl"
              style={{ color: textColor ? `${textColor}77` : "var(--muted-foreground)" }}
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
            <div className="glass-card p-6 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#0080ff]" />
              <span className="text-sm text-[#475569] font-medium">
                Enviando...
              </span>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-6 text-center">
        <span className="text-[11px] text-muted-foreground/50">
          {footerText}
        </span>
      </footer>
    </div>
  );
}
