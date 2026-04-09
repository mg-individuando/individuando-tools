"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Building2, Pencil } from "lucide-react";
import type { Client } from "@/lib/schemas/types";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (error) {
        console.error("Erro ao carregar clientes:", error);
      } else {
        setClients(data ?? []);
      }
      setLoading(false);
    }

    loadClients();
  }, []);

  function getInitialColor(name: string): string {
    const colors = [
      "var(--brand)", "#4A90A4", "#6B8E7B", "#8B6F5E",
      "#7B5EA7", "#A45A6B", "#5A7B9E", "#6E8B74",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
            Clientes
          </h1>
          <p className="text-[#475569] mt-1">
            Gerencie os clientes e suas configuracoes de marca.
          </p>
        </div>
        <Link href="/admin/clientes/novo">
          <button className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card animate-pulse p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-[rgba(0,128,255,0.06)]" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-32 rounded bg-[rgba(0,128,255,0.06)]" />
                  <div className="h-4 w-20 rounded bg-[rgba(0,128,255,0.06)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && clients.length === 0 && (
        <div className="glass-card border-dashed">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="feature-icon mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a] mb-1">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-[#475569] text-sm mb-6 max-w-sm">
              Cadastre seu primeiro cliente para personalizar as ferramentas com
              a identidade visual dele.
            </p>
            <Link href="/admin/clientes/novo">
              <button className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Criar Primeiro Cliente
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Client Grid */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const primaryColor =
              client.brand_config?.primaryColor ?? "var(--brand)";
            return (
              <div
                key={client.id}
                className="glass-card group p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Logo or Initial */}
                  {client.logo_url ? (
                    <img
                      src={client.logo_url}
                      alt={client.name}
                      className="h-14 w-14 rounded-xl object-contain border border-[rgba(0,128,255,0.1)] bg-white p-1"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0 gradient-primary"
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-base text-[#0f172a] truncate">
                        {client.name}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                          client.is_active
                            ? "gradient-primary text-white"
                            : "border border-[rgba(0,128,255,0.2)] text-[#475569] bg-white/60"
                        }`}
                      >
                        {client.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    {/* Color Swatch */}
                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className="h-5 w-5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: primaryColor }}
                        title={primaryColor}
                      />
                      <span className="text-xs text-[#475569] font-mono">
                        {primaryColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="mt-4 pt-4 border-t border-[rgba(0,128,255,0.06)] flex justify-end">
                  <Link href={`/admin/clientes/${client.id}`}>
                    <button className="btn-secondary inline-flex items-center gap-2 text-xs !py-1.5 !px-3">
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
