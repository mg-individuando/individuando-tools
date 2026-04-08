"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/admin";
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

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
          {/* Toggle */}
          <div className="flex rounded-xl bg-gray-50 p-1 mb-8">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all font-sans ${
                !isSignUp
                  ? "bg-white text-[#2D5A7B] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all font-sans ${
                isSignUp
                  ? "bg-white text-[#2D5A7B] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 text-center mb-6 font-sans">
            {isSignUp
              ? "Crie sua conta de facilitador"
              : "Acesse o painel de ferramentas"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all font-sans"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 font-sans"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all font-sans"
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
                : isSignUp
                  ? "Criar Conta"
                  : "Entrar"}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-300 mt-6 font-sans">
          Plataforma para facilitadores
        </p>
      </div>
    </div>
  );
}
