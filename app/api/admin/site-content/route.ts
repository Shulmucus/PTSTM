import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payloads = await request.json().catch(() => null);

        if (!payloads || typeof payloads !== "object") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const serviceSupabase = createServiceRoleClient();

        const timestamp = new Date().toISOString();

        for (const [key, value] of Object.entries(payloads)) {
            if (typeof value !== "string") continue;

            const { error } = await serviceSupabase
                .from("site_content")
                .upsert(
                    { key, value, updated_at: timestamp },
                    { onConflict: "key" }
                );

            if (error) {
                console.error(`Error upserting ${key}:`, error);
                throw error;
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error saving site content:", error);
        return NextResponse.json(
            { error: "Failed to save site content" },
            { status: 500 }
        );
    }
}
