import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const serviceSupabase = createServiceRoleClient();
    const { data, error } = await serviceSupabase
      .from("hero_background_images")
      .select("id, image_url, rotation_deg, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error fetching hero background images:", error);
    return NextResponse.json({ data: null, error: "Failed to fetch hero background images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const { image_url, rotation_deg } = body ?? {};

    if (!image_url) {
      return NextResponse.json({ error: "image_url is required" }, { status: 400 });
    }

    const rotation = Number(rotation_deg ?? 0);

    const serviceSupabase = createServiceRoleClient();

    const { data: maxData, error: maxError } = await serviceSupabase
      .from("hero_background_images")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    if (maxError) throw maxError;

    const nextSort = (maxData?.[0]?.sort_order ?? -1) + 1;

    const { data, error } = await serviceSupabase
      .from("hero_background_images")
      .insert({ image_url, rotation_deg: rotation, sort_order: nextSort })
      .select("id, image_url, rotation_deg, sort_order, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error creating hero background image:", error);
    return NextResponse.json({ error: "Failed to create hero background image" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const { id, rotation_deg, sort_order } = body ?? {};

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (rotation_deg !== undefined) update.rotation_deg = Number(rotation_deg);
    if (sort_order !== undefined) update.sort_order = Number(sort_order);

    const serviceSupabase = createServiceRoleClient();
    const { data, error } = await serviceSupabase
      .from("hero_background_images")
      .update(update)
      .eq("id", id)
      .select("id, image_url, rotation_deg, sort_order, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error updating hero background image:", error);
    return NextResponse.json({ error: "Failed to update hero background image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const serviceSupabase = createServiceRoleClient();
    const { error } = await serviceSupabase
      .from("hero_background_images")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (error) {
    console.error("Error deleting hero background image:", error);
    return NextResponse.json({ error: "Failed to delete hero background image" }, { status: 500 });
  }
}
