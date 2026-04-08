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
              <input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2D5A7B] focus:ring-2 focus:ring-[#2D5A7B]/10 focus:bg-white outline-none transition-all font-sans"
              />
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
