"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
      <div className="flex items-center justify-center py-24 text-[#475569]">
        Carregando...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Usuarios
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Gerencie facilitadores e administradores da plataforma
          </p>
        </div>
        <Link href="/admin/usuarios/convidar">
          <button className="btn-primary inline-flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" />
            Convidar Usuario
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]/50" />
        <Input
          placeholder="Buscar por nome, email ou papel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 border-[rgba(0,128,255,0.1)] bg-white/80 backdrop-blur-sm focus:border-[rgba(0,128,255,0.3)] focus:ring-[rgba(0,128,255,0.1)] transition-all duration-200 rounded-xl"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 text-[#475569] mb-1">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-xl font-bold gradient-text">{profiles.length}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 text-[#475569] mb-1">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium">Admins</span>
          </div>
          <p className="text-xl font-bold gradient-text">
            {profiles.filter((p) => p.role === "admin").length}
          </p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 text-[#475569] mb-1">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium">Ativos</span>
          </div>
          <p className="text-xl font-bold gradient-text">
            {profiles.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 text-[#475569] mb-1">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <UserX className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium">Inativos</span>
          </div>
          <p className="text-xl font-bold gradient-text">
            {profiles.filter((p) => !p.is_active).length}
          </p>
        </div>
      </div>

      {/* Users table */}
      {filtered.length === 0 ? (
        <div className="glass-card border-dashed">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="feature-icon mb-4">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-[#0f172a] font-medium mb-1">
              {search
                ? "Nenhum usuario encontrado"
                : "Nenhum usuario cadastrado"}
            </p>
            <p className="text-sm text-[#475569]">
              {search
                ? "Tente ajustar os termos de busca."
                : "Convide o primeiro usuario para a plataforma."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,128,255,0.06)] bg-[rgba(0,128,255,0.02)]">
                  <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-4 py-3">
                    Usuario
                  </th>
                  <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-4 py-3">
                    Papel
                  </th>
                  <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-4 py-3">
                    Criado em
                  </th>
                  <th className="text-right text-xs font-medium text-[#475569] uppercase tracking-wider px-4 py-3">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,128,255,0.06)]">
                {filtered.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-[rgba(0,128,255,0.03)] transition-all duration-200"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-white">
                              {profile.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0f172a] truncate">
                            {profile.name}
                          </p>
                          <p className="text-xs text-[#475569] truncate">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          profile.role === "admin"
                            ? "gradient-primary text-white"
                            : "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60"
                        }`}
                      >
                        {profile.role === "admin" ? "Admin" : "Facilitador"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          profile.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {profile.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#475569]">
                      {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/usuarios/${profile.id}`}>
                          <button
                            className="text-[#475569] hover:text-[#0080ff] h-8 px-2 rounded-lg hover:bg-[rgba(0,128,255,0.05)] transition-all duration-200"
                            title="Editar usuario"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <Link
                          href={`/admin/usuarios/${profile.id}#ferramentas`}
                        >
                          <button
                            className="text-[#475569] hover:text-[#0080ff] h-8 px-2 rounded-lg hover:bg-[rgba(0,128,255,0.05)] transition-all duration-200"
                            title="Ver ferramentas"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
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
              <div
                key={profile.id}
                className="glass-card group p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white">
                          {profile.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0f172a] truncate">
                        {profile.name}
                      </p>
                      <p className="text-sm text-[#475569] truncate">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        profile.role === "admin"
                          ? "gradient-primary text-white"
                          : "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60"
                      }`}
                    >
                      {profile.role === "admin" ? "Admin" : "Facilitador"}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        profile.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {profile.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(0,128,255,0.06)]">
                  <span className="text-xs text-[#475569]/60">
                    Criado em{" "}
                    {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/usuarios/${profile.id}`}>
                      <button className="btn-primary text-xs !py-1.5 !px-3 inline-flex items-center gap-1">
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
