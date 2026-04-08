"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        setMessage("Verifique seu email para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/admin";
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao autenticar";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo placeholder */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#2D5A7B] flex items-center justify-center">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Criar Conta" : "Entrar"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Crie sua conta de facilitador"
              : "Acesse o painel de ferramentas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes("Erro") || message.includes("Invalid") ? "text-red-600" : "text-green-600"}`}>
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Carregando..."
                : isSignUp
                ? "Criar Conta"
                : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {isSignUp
                ? "Já tem conta? Faça login"
                : "Ainda não tem conta? Cadastre-se"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
