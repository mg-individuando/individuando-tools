import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// Service role client for admin operations
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify the requesting user is an admin
async function verifyAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;

  return profile;
}

// POST - Admin actions (e.g., reset password, invite user)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "reset-password") {
      const { email } = body;
      if (!email) {
        return NextResponse.json(
          { error: "Email é obrigatório." },
          { status: 400 }
        );
      }

      const adminClient = getAdminClient();
      const { error } = await adminClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/reset-password`,
      });

      if (error) {
        return NextResponse.json(
          { error: "Erro ao enviar email de redefinição." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === "invite") {
      const { email, name, role = "facilitator" } = body;
      if (!email) {
        return NextResponse.json(
          { error: "Email é obrigatório." },
          { status: 400 }
        );
      }

      const adminClient = getAdminClient();

      // Create user via admin API
      const { data: inviteData, error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          data: { name, role },
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/login`,
        });

      if (inviteError) {
        // Check for already registered
        if (inviteError.message?.includes("already registered")) {
          return NextResponse.json(
            { error: "Este email já está cadastrado." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "Erro ao enviar convite." },
          { status: 500 }
        );
      }

      // Create profile for the invited user
      if (inviteData?.user) {
        const supabase = await createServerSupabase();
        await supabase.from("profiles").upsert({
          user_id: inviteData.user.id,
          name: name || email.split("@")[0],
          email,
          role,
          is_active: true,
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
