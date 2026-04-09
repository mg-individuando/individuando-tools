"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type View = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<View>("login");
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const router = useRouter();
  const [resetSent, setResetSent] = useState(false);

  const supabase = createClient();

  // Detecta token de recovery no hash da URL (ex: #access_token=...&type=recovery)
  useEffect(() => {
    async function handleRecoveryToken() {
      const hash = window.location.hash;
      if (hash && hash.includes("type=recovery")) {
        // O Supabase já seta a sessão automaticamente via o hash
        // Aguarda um momento para a sessão ser processada
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push("/auth/update-password");
          return;
        }
        // Se não pegou a sessão ainda, tenta via onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" && session) {
            subscription.unsubscribe();
            router.push("/auth/update-password");
          }
        });
        // Timeout: se não funcionar em 3s, mostra a tela normal
        setTimeout(() => {
          subscription.unsubscribe();
          setCheckingRecovery(false);
        }, 3000);
        return;
      }
      setCheckingRecovery(false);
    }
    handleRecoveryToken();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mensagens mais amigáveis em português
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos. Verifique e tente novamente.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Email não confirmado. Verifique sua caixa de entrada.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      window.location.href = "/admin";
    } catch {
      toast.error("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error(
            "Este email já está cadastrado. Faça login ou use 'Esqueci minha senha'.",
            {
              action: {
                label: "Esqueci minha senha",
                onClick: () => setView("forgot"),
              },
              duration: 8000,
            }
          );
        } else if (error.message.includes("Password should be at least")) {
          toast.error("A senha deve ter pelo menos 6 caracteres.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Supabase pode retornar user mesmo se o email já existe (quando confirmação está desabilitada)
      // Verificamos se é um usuário fake (identities vazio = email já existe)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error(
          "Este email já está cadastrado. Faça login ou recupere sua senha.",
          {
            action: {
              label: "Esqueci minha senha",
              onClick: () => setView("forgot"),
            },
            duration: 8000,
          }
        );
        return;
      }

      toast.success(
        "Cadastro realizado! Verifique seu email para confirmar a conta.",
        { duration: 6000 }
      );
      setView("login");
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Digite seu email para recuperar a senha.");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setResetSent(true);
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch {
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function switchView(newView: View) {
    setView(newView);
    setResetSent(false);
  }

  const inputClass =
    "w-full rounded-xl border border-[rgba(0,128,255,0.1)] bg-white/60 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0080ff] focus:ring-2 focus:ring-[#0080ff]/20 focus:bg-white outline-none transition-all duration-200 font-sans";

  // Mostra loading enquanto verifica token de recovery
  if (checkingRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] hero-gradient">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white font-bold text-xl font-sans">I</span>
          </div>
          <p className="text-sm text-[#475569] font-sans">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] hero-gradient px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl font-sans">I</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold gradient-text font-sans tracking-tight">
            Individuando
          </h1>
          <p className="mt-1 text-sm text-[#475569] font-sans">
            Plataforma para facilitadores
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-card rounded-2xl p-8">
          {/* Forgot Password View */}
          {view === "forgot" ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-[#0f172a] font-sans">
                  Recuperar Senha
                </h2>
                <p className="text-sm text-[#475569] mt-1 font-sans">
                  {resetSent
                    ? "Verifique sua caixa de entrada"
                    : "Digite seu email para receber o link"}
                </p>
              </div>

              {resetSent ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-4 text-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p className="text-sm text-emerald-700 font-medium font-sans">
                      Email enviado para <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 font-sans">
                      Clique no link do email para criar uma nova senha.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      toast.info("Reenviando...");
                      handleForgotPassword(new Event("submit") as unknown as React.FormEvent);
                    }}
                    className="w-full text-sm text-[#0080ff] hover:text-[#0066cc] font-medium font-sans transition-all duration-200"
                  >
                    Reenviar email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-[#0f172a]/80 font-sans"
                    >
                      Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                  >
                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => switchView("login")}
                className="w-full mt-5 text-sm text-[#475569] hover:text-[#0f172a] font-sans transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Voltar ao login
              </button>
            </>
          ) : (
            <>
              {/* Toggle Login / Signup */}
              <div className="flex rounded-xl bg-[#f1f5f9] border border-[rgba(0,128,255,0.08)] p-1 mb-7">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 font-sans ${
                    view === "login"
                      ? "bg-white text-[#0f172a] shadow-sm border border-[rgba(0,128,255,0.1)]"
                      : "text-[#475569] hover:text-[#0f172a]"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchView("signup")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 font-sans ${
                    view === "signup"
                      ? "bg-white text-[#0f172a] shadow-sm border border-[rgba(0,128,255,0.1)]"
                      : "text-[#475569] hover:text-[#0f172a]"
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-[#475569] text-center mb-6 font-sans">
                {view === "signup"
                  ? "Crie sua conta de facilitador"
                  : "Acesse o painel de ferramentas"}
              </p>

              {/* Form */}
              <form
                onSubmit={view === "signup" ? handleSignUp : handleLogin}
                className="space-y-5"
              >
                {view === "signup" && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-[#0f172a]/80 font-sans"
                    >
                      Nome
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#0f172a]/80 font-sans"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#0f172a]/80 font-sans"
                    >
                      Senha
                    </label>
                    {view === "login" && (
                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-xs text-[#0080ff] hover:text-[#0066cc] font-medium font-sans transition-all duration-200"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={view === "signup" ? "Mínimo 6 caracteres" : "Sua senha"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-all duration-200"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                  {loading
                    ? "Carregando..."
                    : view === "signup"
                      ? "Criar Conta"
                      : "Entrar"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#94a3b8] mt-6 font-sans">
          Individuando &middot; Ferramentas para facilitadores
        </p>
      </div>
    </div>
  );
}
