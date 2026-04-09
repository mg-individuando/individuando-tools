import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

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

  return { profile, supabase };
}

// GET - Get user profile with tools and response counts
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await verifyAdmin();
    if (!result) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    const { supabase } = result;
    const { id } = await params;

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Get tools count
    const { count: toolsCount } = await supabase
      .from("tools")
      .select("*", { count: "exact", head: true })
      .eq("created_by", id);

    // Get responses count (across all user tools)
    const { data: userTools } = await supabase
      .from("tools")
      .select("id")
      .eq("created_by", id);

    let responsesCount = 0;
    if (userTools && userTools.length > 0) {
      const toolIds = userTools.map((t) => t.id);
      const { count } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .in("tool_id", toolIds);
      responsesCount = count || 0;
    }

    return NextResponse.json({
      profile,
      toolsCount: toolsCount || 0,
      responsesCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await verifyAdmin();
    if (!result) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    const { supabase } = result;
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.role !== undefined) updates.role = body.role;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar perfil." },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate user (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await verifyAdmin();
    if (!result) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    const { supabase } = result;
    const { id } = await params;

    // Prevent self-deactivation
    if (id === result.profile.id) {
      return NextResponse.json(
        { error: "Você não pode desativar sua própria conta." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao desativar usuário." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
