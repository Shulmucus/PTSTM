import { createServerSupabaseClient, createServiceRoleClient } from "./supabase-server";

/**
 * Sign in with email and password (server-side).
 */
export async function signIn(email: string, password: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
}

/**
 * Sign out the current user (server-side).
 */
export async function signOut() {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
}

/**
 * Get the current authenticated session (server-side).
 */
export async function getSession() {
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session;
}

/**
 * Check if an email exists in the admin_users table.
 * Uses the service role client to bypass RLS.
 */
export async function isAdmin(email: string): Promise<boolean> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", email)
        .single();

    if (error || !data) {
        return false;
    }

    return true;
}
