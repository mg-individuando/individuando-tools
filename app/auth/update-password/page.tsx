"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => router.push("/admin"), 2000);
    } catch {
      toast.error("Erro ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[rgba(0,128,255,0.1)] bg-white/60 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0080ff] focus:ring-2 focus:ring-[#0080ff]/20 focus:bg-white outline-none transition-all duration-200 font-sans";

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
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 className="text-lg font-semibold text-[#0f172a] font-sans mb-1">
                Senha Atualizada!
              </h2>
              <p className="text-sm text-[#475569] font-sans">
                Redirecionando para o painel...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-[#0f172a] font-sans">
                  Nova Senha
                </h2>
                <p className="text-sm text-[#475569] mt-1 font-sans">
                  Escolha uma nova senha para sua conta
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-[#0f172a]/80 font-sans"
                  >
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
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

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-[#0f172a]/80 font-sans"
                  >
                    Confirmar Senha
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className={inputClass}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 font-sans">
                      As senhas não coincidem
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="btn-primary w-full py-3 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                  {loading ? "Atualizando..." : "Atualizar Senha"}
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
