"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { templates, generateSlug } from "@/lib/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Grid2X2,
  Target,
  CircleDot,
  LayoutGrid,
  Table,
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  Check,
  RotateCcw,
  Wand2,
  Bot,
  User,
  Maximize2,
  X as XIcon,
  ImagePlus,
  FileUp,
} from "lucide-react";
import Link from "next/link";
import ToolRenderer from "@/components/tools/ToolRenderer";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "grid-2x2": Grid2X2,
  target: Target,
  "circle-dot": CircleDot,
  "layout-grid": LayoutGrid,
  table: Table,
};

interface ClientOption {
  id: string;
  name: string;
  logo_url: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // base64 data URIs
  schema?: any;
  settings?: any;
  meta?: any;
}

const SUGGESTIONS = [
  "Crie uma Roda da Vida com 8 dimensões: saúde, finanças, carreira, relacionamentos, família, lazer, espiritualidade e desenvolvimento pessoal",
  "Quero uma análise SWOT para avaliação de liderança em equipes corporativas",
  "Monte uma ferramenta de identificação de valores pessoais com categorias como família, carreira, saúde, criatividade, liberdade",
  "Crie um plano de ação com metas SMART para desenvolvimento de carreira",
  "Quero um Ikigai adaptado para adolescentes em orientação vocacional",
  "Monte uma avaliação de competências de inteligência emocional com escala de 0 a 10",
];

export default function NovaFerramentaPage() {
  const [mode, setMode] = useState<"choose" | "template" | "ai" | "pdf">("choose");
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const router = useRouter();
  const supabase = createClient();

  // AI state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<any>(null);
  const [generatedSettings, setGeneratedSettings] = useState<any>(null);
  const [generatedMeta, setGeneratedMeta] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  // PDF import state
  const [pdfImage, setPdfImage] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfFields, setPdfFields] = useState("");
  const [pdfNotes, setPdfNotes] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from("clients")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .order("name");
      if (data) setClients(data);
    }
    loadClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleCreate() {
    if (!selectedTemplate || !title) return;
    setLoading(true);

    const template = templates[selectedTemplate];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) return;

    const slug = generateSlug(title) + "-" + Date.now().toString(36);
    const schema = {
      ...template.schema,
      title,
      description: description || template.schema.description,
    };

    const { data, error } = await supabase
      .from("tools")
      .insert({
        created_by: profile.id,
        title,
        slug,
        description: description || null,
        template_type: selectedTemplate,
        schema,
        settings: template.defaultSettings,
        status: "draft",
        client_id: selectedClient || null,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Erro ao criar ferramenta: " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/admin/ferramentas/${data.id}`);
  }

  async function handleAiCreate() {
    if (!generatedSchema || !generatedMeta) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) return;

    const aiTitle = title || generatedMeta.title || "Ferramenta IA";
    const slug = generateSlug(aiTitle) + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("tools")
      .insert({
        created_by: profile.id,
        title: aiTitle,
        slug,
        description: generatedSchema.description || null,
        template_type: ["swot", "radar", "ikigai", "category_grid", "dynamic_table", "free_layout", "blank"].includes(generatedMeta.template_type)
          ? generatedMeta.template_type
          : generatedSchema.layout || "free_layout",
        schema: generatedSchema,
        settings: generatedSettings || {
          requireName: true,
          requireEmail: false,
          allowMultipleResponses: false,
          showProgressBar: false,
          confirmationMessage:
            "Obrigado por preencher! Suas respostas foram salvas.",
        },
        status: "draft",
        client_id: selectedClient || null,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Erro ao criar ferramenta: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Ferramenta criada com IA!");
    router.push(`/admin/ferramentas/${data.id}`);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande (máx 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPendingImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  }

  async function sendMessage(text?: string) {
    const msg = text || inputMessage.trim();
    if ((!msg && pendingImages.length === 0) || aiLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: msg || "Analise esta imagem de referência e crie uma ferramenta similar.",
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setInputMessage("");
    setPendingImages([]);
    setAiLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      // Build messages for API — include images as content blocks
      const apiMessages = newMessages.map((m) => {
        if (m.images && m.images.length > 0) {
          return {
            role: m.role,
            content: [
              ...m.images.map((img) => ({
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: img.split(";")[0].split(":")[1] as string,
                  data: img.split(",")[1],
                },
              })),
              { type: "text" as const, text: m.content },
            ],
          };
        }
        return { role: m.role, content: m.content };
      });

      const response = await fetch("/api/ai/generate-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro na API");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.explanation || data.raw,
        schema: data.schema,
        settings: data.settings,
        meta: data.meta,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);

      if (data.schema) {
        setGeneratedSchema(data.schema);
        setGeneratedSettings(data.settings);
        setGeneratedMeta(data.meta);
        if (data.meta?.title) setTitle(data.meta.title);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao se comunicar com a IA");
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, houve um erro ao processar sua solicitação. Tente novamente.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Mode chooser ──────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/ferramentas"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Nova Ferramenta
          </h1>
          <p className="text-gray-500 mt-1">
            Como você quer criar sua ferramenta?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI option */}
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 border-transparent hover:border-purple-200 group"
            onClick={() => setMode("ai")}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Criar com IA
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Descreva o que você precisa e a IA monta a ferramenta pra você.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                <Wand2 className="w-3 h-3" />
                Recomendado
              </div>
            </CardContent>
          </Card>

          {/* PDF Import option */}
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 border-transparent hover:border-emerald-200 group"
            onClick={() => setMode("pdf")}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <FileUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Importar PDF
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Suba um PDF de ferramenta existente e a IA converte para digital.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                <FileUp className="w-3 h-3" />
                Novo
              </div>
            </CardContent>
          </Card>

          {/* Template option */}
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 border-transparent hover:border-primary/20 group"
            onClick={() => setMode("template")}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-brand-dark flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <LayoutGrid className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                Usar Template
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Escolha entre os templates prontos: SWOT, Roda da Vida, Ikigai e mais.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <Grid2X2 className="w-3 h-3" />
                5 templates
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── AI Mode ──────────────────────────────────────
  if (mode === "ai") {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setMode("choose")}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Criar com IA
              </h1>
              <p className="text-gray-500 text-sm">
                Descreva a ferramenta que você precisa
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat area */}
          <div className="lg:col-span-2">
            <Card className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4">
                      <Bot className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-700 mb-1">
                      Olá! Como posso ajudar?
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-md">
                      Me descreva a ferramenta que você precisa para seu
                      workshop ou mentoria. Pode ser bem direto!
                    </p>

                    {/* Suggestion chips */}
                    <div className="space-y-2 w-full max-w-lg">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Sugestões
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(suggestion)}
                            className="text-xs text-left px-3 py-2 rounded-xl bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 border border-gray-100 hover:border-purple-200 transition-colors leading-relaxed"
                          >
                            {suggestion.length > 80
                              ? suggestion.slice(0, 80) + "..."
                              : suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-gray-100 text-gray-700 rounded-bl-md"
                      }`}
                    >
                      {/* Show attached images */}
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-2">
                          {msg.images.map((img, j) => (
                            <img
                              key={j}
                              src={img}
                              alt="Referência"
                              className="h-20 rounded-lg object-cover border border-white/20"
                            />
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.schema && (
                        <div className="mt-3 pt-3 border-t border-gray-200/50">
                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg w-fit">
                            <Check className="w-3.5 h-3.5" />
                            Ferramenta gerada com sucesso!
                          </div>
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando sua ferramenta...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4 space-y-2">
                {/* Pending images */}
                {pendingImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {pendingImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          alt="Referência"
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          onClick={() =>
                            setPendingImages((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2 items-end"
                >
                  {/* Image upload */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={aiLoading}
                    className="shrink-0 p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-purple-500 hover:border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    title="Enviar imagem de referência"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 150) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Descreva a ferramenta ou envie uma imagem de referência..."
                    disabled={aiLoading}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-purple-200 focus:bg-white focus:border-purple-300 outline-none transition-all"
                    style={{ minHeight: "44px", maxHeight: "150px" }}
                  />
                  <Button
                    type="submit"
                    disabled={
                      (!inputMessage.trim() && pendingImages.length === 0) ||
                      aiLoading
                    }
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-400">
                  {generatedSchema
                    ? '💡 Peça ajustes: "mude as cores", "adicione dimensões", "troque para radar"...'
                    : "📎 Envie imagens de referência para a IA se inspirar"}
                </p>
              </div>
            </Card>
          </div>

          {/* Right side: result + actions */}
          <div className="space-y-4">
            {/* Generated tool preview card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  Ferramenta Gerada
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedSchema ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">
                      A ferramenta aparecerá aqui depois que a IA criar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Schema summary */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">
                        {generatedSchema.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {generatedSchema.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                        {generatedMeta?.template_type || "custom"}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {generatedSchema.sections?.length || 0} seções
                      </span>
                    </div>

                    {/* Sections list */}
                    <div className="space-y-1.5">
                      {generatedSchema.sections
                        ?.slice(0, 8)
                        .map((section: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: section.color || "#94a3b8",
                              }}
                            />
                            <span className="text-gray-600 truncate">
                              {section.label}
                            </span>
                          </div>
                        ))}
                      {(generatedSchema.sections?.length || 0) > 8 && (
                        <p className="text-xs text-gray-400 pl-4">
                          +{generatedSchema.sections.length - 8} mais...
                        </p>
                      )}
                    </div>

                    {/* Preview button */}
                    <button
                      onClick={() => setShowPreview(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Visualizar Ferramenta
                    </button>

                    {/* Client selector */}
                    <div className="pt-3 border-t space-y-2">
                      <Label className="text-xs">Cliente (opcional)</Label>
                      <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      >
                        <option value="">Sem cliente (padrão)</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title override */}
                    <div className="space-y-2">
                      <Label className="text-xs">Título</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={generatedMeta?.title || "Título"}
                        className="text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleAiCreate}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Criar Ferramenta
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGeneratedSchema(null);
                          setGeneratedSettings(null);
                          setGeneratedMeta(null);
                          setChatMessages([]);
                          setTitle("");
                        }}
                        title="Recomeçar"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && generatedSchema && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="font-semibold text-gray-800">
                  Preview: {generatedSchema.title}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <ToolRenderer schema={generatedSchema} onSubmit={() => {}} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── PDF Import Mode ──────────────────────────────
  if (mode === "pdf") {
    async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 20 * 1024 * 1024) {
        toast.error("PDF muito grande (máx 20MB)");
        return;
      }

      setPdfFileName(file.name);

      // Convert PDF to base64 — Claude supports PDF documents natively
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPdfImage(base64); // data:application/pdf;base64,...
        toast.success("PDF carregado com sucesso!");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }

    async function handlePdfImport() {
      if (!pdfImage) {
        toast.error("Faça upload de um PDF primeiro");
        return;
      }

      setPdfLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", pdfImage);
        if (pdfText) formData.append("extractedText", pdfText);
        if (pdfFields) formData.append("extractedFields", pdfFields);
        if (pdfNotes) formData.append("userNotes", pdfNotes);

        const response = await fetch("/api/ai/import-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Erro ao importar PDF");
        }

        const data = await response.json();

        if (data.schema) {
          setGeneratedSchema(data.schema);
          setGeneratedSettings(data.settings);
          setGeneratedMeta(data.meta);
          if (data.meta?.title) setTitle(data.meta.title);
          toast.success("Ferramenta gerada a partir do PDF!");
        }
      } catch (error: any) {
        toast.error(error.message || "Erro ao processar o PDF");
      } finally {
        setPdfLoading(false);
      }
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => {
              setMode("choose");
              setPdfImage(null);
              setPdfText("");
              setPdfFields("");
              setPdfNotes("");
              setGeneratedSchema(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Importar Ferramenta de PDF
          </h1>
          <p className="text-gray-500 mt-1">
            Suba um PDF de uma ferramenta existente e a IA converte para formato digital interativo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Upload & Settings */}
          <div className="space-y-6">
            {/* Upload area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-emerald-600" />
                  Upload do PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />

                {!pdfImage ? (
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
                  >
                    <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600">
                      Clique para selecionar um PDF
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Até 20MB. A primeira página será analisada.
                    </p>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {pdfFileName}
                        </span>
                      </div>
                      <button
                        onClick={() => pdfInputRef.current?.click()}
                        className="text-xs text-emerald-600 hover:underline"
                      >
                        Trocar PDF
                      </button>
                    </div>

                    {/* PDF preview */}
                    <div className="rounded-lg border overflow-hidden bg-gray-50">
                      <embed
                        src={pdfImage}
                        type="application/pdf"
                        className="w-full"
                        style={{ height: "300px" }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {pdfImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Observações (opcional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={pdfNotes}
                    onChange={(e) => setPdfNotes(e.target.value)}
                    placeholder="Ex: Quero que o quadrante 1 seja para tarefas urgentes e importantes. Adicionar um campo para nome do participante..."
                    rows={3}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Instruções adicionais para a IA ao converter o PDF
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Client selector */}
            {pdfImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cliente (opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Sem cliente específico</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {pdfImage && !generatedSchema && (
              <Button
                onClick={handlePdfImport}
                disabled={pdfLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 py-6 text-base"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analisando PDF com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Converter para Ferramenta Digital
                  </>
                )}
              </Button>
            )}

            {generatedSchema && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">Título da Ferramenta</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da ferramenta"
                  />
                </div>
                <Button
                  onClick={handleAiCreate}
                  disabled={loading || !title}
                  className="w-full bg-primary hover:bg-primary/90 gap-2 py-6 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Salvar Ferramenta
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedSchema(null);
                    setGeneratedSettings(null);
                    setGeneratedMeta(null);
                  }}
                  className="w-full gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reconverter
                </Button>
              </div>
            )}
          </div>

          {/* Right — Preview */}
          <div>
            {generatedSchema ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Preview da Ferramenta Gerada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <h2
                      className="text-xl font-bold"
                      style={{ color: generatedSchema.theme?.primaryColor }}
                    >
                      {generatedSchema.title}
                    </h2>
                    {generatedSchema.description && (
                      <p className="text-gray-500 mt-2 text-sm">
                        {generatedSchema.description}
                      </p>
                    )}
                  </div>
                  <ToolRenderer schema={generatedSchema} readOnly={false} />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <FileUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {pdfImage
                      ? "Clique em \"Converter para Ferramenta Digital\" para gerar o preview"
                      : "Faça upload de um PDF para começar"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Template Mode (original) ──────────────────────
  if (step === "template") {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setMode("choose")}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Escolha um Template
          </h1>
          <p className="text-gray-500 mt-1">
            Selecione o template que melhor se encaixa na sua necessidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(templates).map(([key, tpl]) => {
            const Icon = iconMap[tpl.icon] || Grid2X2;
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === key
                    ? "ring-2 ring-primary shadow-md"
                    : ""
                }`}
                onClick={() => setSelectedTemplate(key)}
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tpl.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedTemplate && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                setTitle(templates[selectedTemplate].name);
                setDescription(
                  templates[selectedTemplate].schema.description || ""
                );
                setStep("details");
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Continuar
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Details step (template mode) ──────────────────
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setStep("template")}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar aos templates
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Configurar Ferramenta
        </h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client selector */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <div className="flex items-center gap-3">
              {selectedClient &&
                (() => {
                  const client = clients.find((c) => c.id === selectedClient);
                  return client?.logo_url ? (
                    <img
                      src={client.logo_url}
                      alt={client.name}
                      className="w-8 h-8 rounded-md object-contain border border-gray-200 bg-white"
                    />
                  ) : null;
                })()}
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              >
                <option value="">Sem cliente (padrão Individuando)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da Ferramenta</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: SWOT Pessoal — Turma Abril"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição para os participantes..."
              rows={3}
            />
          </div>
          <div className="pt-2 flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={!title || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Criando..." : "Criar Ferramenta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
