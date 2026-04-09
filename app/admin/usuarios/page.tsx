"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Users,
  Search,
  Pencil,
  Wrench,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import type { Profile } from "@/lib/schemas/types";

export default function UsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadProfiles() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProfiles(data as Profile[]);
      setLoading(false);
    }
    loadProfiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Carregando...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Usuários
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie facilitadores e administradores da plataforma
          </p>
        </div>
        <Link href="/admin/usuarios/convidar">
          <Button className="bg-[#2D5A7B] hover:bg-[#1e4260] text-white shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Usuário
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, email ou papel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{profiles.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Admins</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {profiles.filter((p) => p.role === "admin").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-medium">Ativos</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {profiles.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <UserX className="w-4 h-4" />
            <span className="text-xs font-medium">Inativos</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {profiles.filter((p) => !p.is_active).length}
          </p>
        </div>
      </div>

      {/* Users table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-1">
              {search
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado"}
            </p>
            <p className="text-sm text-gray-400">
              {search
                ? "Tente ajustar os termos de busca."
                : "Convide o primeiro usuário para a plataforma."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Usuário
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Papel
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Criado em
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2D5A7B]/10 flex items-center justify-center shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-[#2D5A7B]">
                              {profile.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {profile.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          profile.role === "admin" ? "default" : "secondary"
                        }
                        className={
                          profile.role === "admin"
                            ? "bg-[#2D5A7B] text-white hover:bg-[#2D5A7B]"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {profile.role === "admin" ? "Admin" : "Facilitador"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/usuarios/${profile.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-[#2D5A7B] h-8 px-2"
                            title="Editar usuário"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/usuarios/${profile.id}#ferramentas`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-[#2D5A7B] h-8 px-2"
                            title="Ver ferramentas"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((profile) => (
              <Card
                key={profile.id}
                className="group transition-shadow hover:shadow-md border border-gray-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#2D5A7B]/10 flex items-center justify-center shrink-0">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-[#2D5A7B]">
                            {profile.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {profile.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge
                        variant={
                          profile.role === "admin" ? "default" : "secondary"
                        }
                        className={
                          profile.role === "admin"
                            ? "bg-[#2D5A7B] text-white hover:bg-[#2D5A7B]"
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
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Criado em{" "}
                      {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/usuarios/${profile.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-[#2D5A7B] text-[#2D5A7B] hover:bg-[#2D5A7B]/5"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
