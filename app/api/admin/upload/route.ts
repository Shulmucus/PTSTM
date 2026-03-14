import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData().catch(() => null);

        if (!formData) {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const file = formData.get("file") as File | null;
        const bucket = formData.get("bucket") as string | null;
        const path = formData.get("path") as string | null;

        if (!file || !bucket || !path) {
            return NextResponse.json({ error: "Missing required fields (file, bucket, path)" }, { status: 400 });
        }

        const serviceSupabase = createServiceRoleClient();

        const { error: uploadError } = await serviceSupabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw uploadError;
        }

        const { data: urlData } = serviceSupabase.storage.from(bucket).getPublicUrl(path);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
