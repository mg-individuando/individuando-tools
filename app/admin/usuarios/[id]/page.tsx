"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  KeyRound,
  Wrench,
  FileText,
  Calendar,
  Mail,
  User,
  Shield,
  UserX,
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react";
import type { Profile, Tool } from "@/lib/schemas/types";

interface UserStats {
  toolsCount: number;
  responsesCount: number;
}

export default function UsuarioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tools, setTools] = useState<(Tool & { response_count: number })[]>([]);
  const [stats, setStats] = useState<UserStats>({
    toolsCount: 0,
    responsesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "facilitator">("facilitator");
  const [isActive, setIsActive] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        toast.error("Usuário não encontrado.");
        router.push("/admin/usuarios");
        return;
      }

      const p = profileData as Profile;
      setProfile(p);
      setName(p.name);
      setEmail(p.email);
      setRole(p.role);
      setIsActive(p.is_active);

      // Load user tools
      const { data: toolsData } = await supabase
        .from("tools")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      const userTools = (toolsData || []) as Tool[];

      // Load response counts for each tool
      const toolsWithCounts = await Promise.all(
        userTools.map(async (tool) => {
          const { count } = await supabase
            .from("responses")
            .select("*", { count: "exact", head: true })
            .eq("tool_id", tool.id);
          return { ...tool, response_count: count || 0 };
        })
      );

      setTools(toolsWithCounts);

      // Stats
      const totalResponses = toolsWithCounts.reduce(
        (acc, t) => acc + t.response_count,
        0
      );
      setStats({
        toolsCount: userTools.length,
        responsesCount: totalResponses,
      });
    } catch {
      toast.error("Erro ao carregar dados do usuário.");
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, is_active: isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar.");
      }

      toast.success("Perfil atualizado com sucesso.");
      await loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar alterações.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!profile?.email) return;
    if (
      !confirm(
        `Enviar email de redefinição de senha para ${profile.email}?`
      )
    )
      return;

    setResettingPassword(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          email: profile.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao redefinir senha.");
      }

      toast.success("Email de redefinição de senha enviado.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar email.";
      toast.error(message);
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleDeactivate() {
    const action = isActive ? "desativar" : "reativar";
    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    setDeactivating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: isActive ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        ...(isActive
          ? {}
          : { body: JSON.stringify({ is_active: true }) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Erro ao ${action} usuário.`);
      }

      toast.success(
        isActive
          ? "Usuário desativado com sucesso."
          : "Usuário reativado com sucesso."
      );
      await loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : `Erro ao ${action} usuário.`;
      toast.error(message);
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Carregando...
      </div>
    );
  }

  if (!profile) return null;

  const hasChanges =
    name !== profile.name ||
    email !== profile.email ||
    role !== profile.role ||
    isActive !== profile.is_active;

  return (
    <div className="max-w-4xl">
      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin/usuarios"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para usuários
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {profile.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {profile.name}
              </h1>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={profile.role === "admin" ? "default" : "secondary"}
              className={
                profile.role === "admin"
                  ? "bg-primary text-primary-foreground hover:bg-primary"
                  : "bg-gray-100 text-gray-600"
              }
            >
              {profile.role === "admin" ? "Admin" : "Facilitador"}
            </Badge>
            <Badge
              variant={profile.is_active ? "outline" : "destructive"}
              className={
                profile.is_active
                  ? "bg-green-50 text-green-700 border-green-200"
                  : ""
              }
            >
              {profile.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Wrench className="w-4 h-4" />
            <span className="text-xs font-medium">Ferramentas</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.toolsCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Respostas</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {stats.responsesCount}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Criado em</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(profile.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Atualizado em</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(profile.updated_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados do Perfil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
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
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className="text-sm text-gray-700">
                  {isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={handleResetPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4 mr-2" />
                )}
                Redefinir Senha
              </Button>

              <Button
                variant={isActive ? "destructive" : "outline"}
                className={
                  !isActive
                    ? "text-green-600 border-green-200 hover:bg-green-50"
                    : ""
                }
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserX className="w-4 h-4 mr-2" />
                )}
                {isActive ? "Desativar Usuário" : "Reativar Usuário"}
              </Button>
            </div>

            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User tools section */}
      <div id="ferramentas">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Ferramentas ({tools.length})
            </h2>

            {tools.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Este usuário ainda não criou nenhuma ferramenta.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tool.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">
                            {new Date(tool.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500">
                            {tool.response_count}{" "}
                            {tool.response_count === 1
                              ? "resposta"
                              : "respostas"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          tool.status === "published"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }
                      >
                        {tool.status === "published" ? "Publicada" : "Rascunho"}
                      </Badge>
                      <Link href={`/admin/ferramentas/${tool.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-gray-500 hover:text-primary"
                          title="Editar ferramenta"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/admin/ferramentas/${tool.id}/respostas`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-gray-500 hover:text-primary"
                          title="Ver respostas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
