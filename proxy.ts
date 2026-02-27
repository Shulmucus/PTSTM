import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid using getSession() as it is insecure.
    const { data: { user } } = await supabase.auth.getUser();

    const isDashboardPath = request.nextUrl.pathname.startsWith("/admin/dashboard");
    const isLoginPage = request.nextUrl.pathname === "/admin";

    // 1. If user exists, we must verify they are an admin
    if (user) {
        // We'll use the service role to check admin status securely in middleware context
        const serviceSupabase = createServiceRoleClient();
        const { data: adminData, error: adminError } = await serviceSupabase
            .from("admin_users")
            .select("id")
            .eq("email", user.email)
            .single();

        const isActuallyAdmin = !!adminData;

        // If user is logged in but not an admin, redirect to login
        if (!isActuallyAdmin) {
            if (isDashboardPath) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            // If they're on login page, let them stay there to see the login form
            return supabaseResponse;
        }

        // User is an admin
        if (isLoginPage) {
            // Logged in as admin and hit login page -> To dashboard
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
    } else {
        // No user exists
        if (isDashboardPath) {
            // Trying to access dashboard without login -> redirect to login
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images, public files, etc.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
