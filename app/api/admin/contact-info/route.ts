import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceRoleClient } from "@/lib/supabase-server";

async function requireAdmin(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { ok: false as const, email: null };

  const serviceSupabase = createServiceRoleClient();
  const { data: adminData } = await serviceSupabase
    .from("admin_users")
    .select("id")
    .eq("email", user.email)
    .single();

  return { ok: !!adminData, email: user.email };
}

export async function GET() {
  try {
    const serviceSupabase = createServiceRoleClient();
    const { data, error } = await serviceSupabase
      .from("contact_info_entries")
      .select("id, type, value, label, sort_order, created_at")
      .order("type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch contact info" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, value, label } = body ?? {};

    if (!type || !value) {
      return NextResponse.json(
        { error: "type and value are required" },
        { status: 400 }
      );
    }

    if (!(["phone", "email", "location"] as const).includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const serviceSupabase = createServiceRoleClient();

    const { data: maxData, error: maxError } = await serviceSupabase
      .from("contact_info_entries")
      .select("sort_order")
      .eq("type", type)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (maxError) throw maxError;

    const nextSort = (maxData?.[0]?.sort_order ?? -1) + 1;

    const { data, error } = await serviceSupabase
      .from("contact_info_entries")
      .insert({ type, value, label: label ?? null, sort_order: nextSort })
      .select("id, type, value, label, sort_order, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error creating contact info:", error);
    return NextResponse.json(
      { error: "Failed to create contact info" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const serviceSupabase = createServiceRoleClient();

    const { error } = await serviceSupabase
      .from("contact_info_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (error) {
    console.error("Error deleting contact info:", error);
    return NextResponse.json(
      { error: "Failed to delete contact info" },
      { status: 500 }
    );
  }
}
