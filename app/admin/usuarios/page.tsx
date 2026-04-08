"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Profile } from "@/lib/schemas/types";

export default function UsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-500 mt-1">Gerencie facilitadores e administradores</p>
      </div>

      <div className="space-y-3">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}
                  className={
                    profile.role === "admin"
                      ? "bg-[#2D5A7B] text-white hover:bg-[#2D5A7B]"
                      : ""
                  }
                >
                  {profile.role === "admin" ? "Admin" : "Facilitador"}
                </Badge>
                {!profile.is_active && (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
