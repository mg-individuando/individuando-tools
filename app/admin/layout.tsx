"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LayoutDashboard,
  Wrench,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/schemas/types";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ferramentas", label: "Ferramentas", icon: Wrench },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data as Profile);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-30 flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#2D5A7B] flex items-center justify-center">
          <span className="text-white font-bold text-sm">I</span>
        </div>
        <span className="font-semibold text-sm">Individuando</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-40 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A7B] flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <p className="font-semibold text-sm">Individuando</p>
              <p className="text-xs text-gray-500">Ferramentas Online</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems
            .filter(
              (item) =>
                item.href !== "/admin/usuarios" || profile?.role === "admin"
            )
            .map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#2D5A7B] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

          <div className="pt-3">
            <Link href="/admin/ferramentas/nova" onClick={() => setSidebarOpen(false)}>
              <Button className="w-full bg-[#2D5A7B] hover:bg-[#1e4260]" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Ferramenta
              </Button>
            </Link>
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name || "..."}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
