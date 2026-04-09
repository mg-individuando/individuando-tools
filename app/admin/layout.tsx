"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LayoutDashboard,
  Wrench,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/schemas/types";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ferramentas", label: "Ferramentas", icon: Wrench },
  { href: "/admin/clientes", label: "Clientes", icon: Building2, adminOnly: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          toast.error("Erro ao carregar perfil.");
          return;
        }

        if (data) setProfile(data as Profile);
      } catch {
        toast.error("Erro de conexao.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sessao encerrada.");
      router.push("/auth/login");
    } catch {
      toast.error("Erro ao sair.");
    }
  }, [supabase, router]);

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || profile?.role === "admin"
  );

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(href));

  const userInitial = profile?.name?.charAt(0)?.toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5A7B] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg font-sans">I</span>
          </div>
          <p className="text-sm text-slate-400 font-sans">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center px-4 gap-3 shadow-sm">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2D5A7B] flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">
            Individuando
          </span>
        </div>
      </header>

      {/* ── Mobile overlay backdrop ────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200
          z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#2D5A7B] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-base">I</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm tracking-tight leading-tight">
              Individuando
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              Ferramentas Online
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {filteredNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                    transition-all duration-150
                    ${
                      active
                        ? "bg-[#2D5A7B]/[0.06] text-[#2D5A7B]"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  {/* Left accent bar */}
                  <span
                    className={`
                      absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
                      transition-all duration-200
                      ${active ? "h-5 bg-[#2D5A7B]" : "h-0 bg-transparent"}
                    `}
                  />

                  <item.icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      active ? "text-[#2D5A7B]" : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>

                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#2D5A7B]/40" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* New tool button */}
          <div className="mt-6 px-1">
            <Link href="/admin/ferramentas/nova">
              <button
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-xl
                  bg-[#2D5A7B]/[0.08] text-[#2D5A7B]
                  text-[13px] font-semibold
                  hover:bg-[#2D5A7B]/[0.14]
                  active:bg-[#2D5A7B]/[0.18]
                  transition-colors duration-150
                "
              >
                <Plus className="w-4 h-4" />
                Nova Ferramenta
              </button>
            </Link>
          </div>
        </nav>

        {/* User profile at bottom */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2D5A7B]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-[#2D5A7B]">
                {userInitial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate leading-tight">
                {profile?.name || "..."}
              </p>
              <p className="text-[11px] text-slate-400 capitalize leading-tight mt-0.5">
                {profile?.role === "admin" ? "Administrador" : "Facilitador"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="
                p-2 rounded-lg text-slate-300
                hover:text-red-500 hover:bg-red-50
                transition-colors duration-150
              "
              title="Sair"
              aria-label="Encerrar sessao"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
