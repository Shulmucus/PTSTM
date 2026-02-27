"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();

            const internalEmail = `${username.trim().toLowerCase()}@admin.local`;

            // Sign in with Supabase Auth
            const { data, error: authError } =
                await supabase.auth.signInWithPassword({
                    email: internalEmail,
                    password,
                });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (!data.user?.email) {
                setError("Authentication failed. Please try again.");
                setLoading(false);
                return;
            }

            // Check if the email exists in admin_users table
            const { data: adminData, error: adminError } = await supabase
                .from("admin_users")
                .select("id")
                .eq("email", data.user.email)
                .single();

            if (adminError || !adminData) {
                // Not an admin — sign out and reject
                await supabase.auth.signOut();
                setError("Unauthorized: You do not have admin access.");
                setLoading(false);
                return;
            }

            // Admin verified — redirect to dashboard
            router.push("/admin/dashboard");
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-primary border border-border shadow-elevated p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary mx-auto mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-7 h-7 text-primary"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-heading font-bold text-secondary">
                            Admin Login
                        </h1>
                        <p className="text-sm text-foreground-muted mt-2">
                            Sign in to access the admin dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="admin-username"
                                className="block text-sm font-medium text-foreground mb-1.5"
                            >
                                Username
                            </label>
                            <input
                                id="admin-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                placeholder="e.g. admin"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-password"
                                className="block text-sm font-medium text-foreground mb-1.5"
                            >
                                Password
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
