"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  User,
  Shield,
  Loader2,
} from "lucide-react";

export default function ConvidarUsuarioPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "facilitator">("facilitator");
  const [sending, setSending] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email é obrigatório.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          email: email.trim(),
          name: name.trim() || undefined,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar convite.");
      }

      toast.success("Convite enviado com sucesso!");
      router.push("/admin/usuarios");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar convite.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-xl">
      {/* Back link */}
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2D5A7B] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para usuários
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Convidar Usuário
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Envie um convite por email para adicionar um novo usuário à plataforma.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleInvite} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-3.5 h-3.5 inline mr-1" />
                Nome (opcional)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo do usuário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-3.5 h-3.5 inline mr-1" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                <Shield className="w-3.5 h-3.5 inline mr-1" />
                Papel
              </Label>
              <select
                id="role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "admin" | "facilitator")
                }
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="facilitator">Facilitador</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-400">
                Facilitadores podem criar e gerenciar suas próprias ferramentas.
                Administradores têm acesso completo à plataforma.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Link href="/admin/usuarios">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#2D5A7B] hover:bg-[#1e4260] text-white"
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Enviar Convite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
