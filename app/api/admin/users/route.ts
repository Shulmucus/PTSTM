import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const serviceSupabase = createServiceRoleClient();
    const { data, error } = await serviceSupabase
      .from("admin_users")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleClient();
    const internalEmail = `${username.trim().toLowerCase()}@admin.local`;

    // Check if admin user already exists
    const { data: existingAdmin } = await serviceSupabase
      .from("admin_users")
      .select("id")
      .eq("email", internalEmail)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin with this username already exists" },
        { status: 400 }
      );
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Failed to create admin user: " + authError.message },
        { status: 500 }
      );
    }

    // Add to admin_users table
    const { error: adminError } = await serviceSupabase
      .from("admin_users")
      .insert({
        email: internalEmail,
        id: authData.user.id,
      });

    if (adminError) {
      // Rollback: delete the auth user
      await serviceSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to register admin user. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { message: `Admin user "${username}" created successfully!` },
      error: null,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { adminId, adminEmail } = body;

    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: "Admin ID and email are required" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleClient();

    // Delete from admin_users table
    const { error: adminError } = await serviceSupabase
      .from("admin_users")
      .delete()
      .eq("id", adminId);

    if (adminError) throw adminError;

    // Delete from Supabase Auth
    const { error: authError } = await serviceSupabase.auth.admin.deleteUser(adminId);

    if (authError) {
      console.warn("Auth user deletion failed, but admin record was removed:", authError);
    }

    return NextResponse.json({
      data: { message: `Admin "${adminEmail}" deleted successfully.` },
      error: null,
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: "Failed to delete admin user. Please try again." },
      { status: 500 }
    );
  }
}
