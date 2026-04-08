"use client";

import { useState } from "react";
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
  const [resetSent, setResetSent] = useState(false);

  const supabase = createClient();

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
    "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all font-sans";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#2D5A7B] flex items-center justify-center shadow-lg shadow-[#2D5A7B]/20">
            <span className="text-white font-bold text-2xl font-sans">I</span>
          </div>
          <span className="mt-3 text-lg font-semibold text-[#2D5A7B] font-sans tracking-tight">
            Individuando
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Forgot Password View */}
          {view === "forgot" ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#2D5A7B]/10 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D5A7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 font-sans">
                  Recuperar Senha
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-sans">
                  {resetSent
                    ? "Verifique sua caixa de entrada"
                    : "Digite seu email para receber o link de recuperação"}
                </p>
              </div>

              {resetSent ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p className="text-sm text-green-700 font-medium font-sans">
                      Email enviado para <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-sans">
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
                    className="w-full text-sm text-[#2D5A7B] hover:text-[#24496A] font-medium font-sans transition-colors"
                  >
                    Reenviar email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-gray-700 font-sans"
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
                    className="w-full rounded-xl bg-[#2D5A7B] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#24496A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
                  >
                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => switchView("login")}
                className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 font-sans transition-colors flex items-center justify-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Voltar ao login
              </button>
            </>
          ) : (
            <>
              {/* Toggle Login / Signup */}
              <div className="flex rounded-xl bg-gray-50 p-1 mb-8">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all font-sans ${
                    view === "login"
                      ? "bg-white text-[#2D5A7B] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchView("signup")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all font-sans ${
                    view === "signup"
                      ? "bg-white text-[#2D5A7B] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 text-center mb-6 font-sans">
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
                      className="block text-sm font-medium text-gray-700 font-sans"
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
                    className="block text-sm font-medium text-gray-700 font-sans"
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
                      className="block text-sm font-medium text-gray-700 font-sans"
                    >
                      Senha
                    </label>
                    {view === "login" && (
                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-xs text-[#2D5A7B] hover:text-[#24496A] font-medium font-sans transition-colors"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="w-full rounded-xl bg-[#2D5A7B] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#24496A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
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

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-300 mt-6 font-sans">
          Plataforma para facilitadores
        </p>
      </div>
    </div>
  );
}
