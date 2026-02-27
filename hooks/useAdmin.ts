"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface UseAdminReturn {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
}

export function useAdmin(): UseAdminReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdmin = useCallback(async (email: string) => {
        try {
            console.log("useAdmin: Checking admin status for:", email);
            // Use the API endpoint instead of direct database access
            const response = await fetch('/api/admin/users');
            const result = await response.json();
            
            console.log("useAdmin: API response:", { status: response.status, result });
            
            if (!response.ok || result.error) {
                console.log("useAdmin: API error, setting isAdmin to false");
                setIsAdmin(false);
                return;
            }
            
            // Check if current user's email is in the admin users list
            const isAdminUser = result.data?.some((admin: any) => admin.email === email);
            console.log("useAdmin: Is admin user?", isAdminUser);
            setIsAdmin(isAdminUser);
        } catch (error) {
            console.error("useAdmin: Exception in checkAdmin:", error);
            setIsAdmin(false);
        }
    }, []);

    useEffect(() => {
        const supabase = createClient();

        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data?.user ?? null;
            setUser(currentUser);
            if (currentUser?.email) {
                checkAdmin(currentUser.email).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        };

        fetchUser();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event) => {
            if (_event === "SIGNED_OUT") {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            // Secure approach: ALWAYS verify the user object with the server
            // rather than trusting the local event session medium.
            const { data } = await supabase.auth.getUser();
            const currentUser = data?.user ?? null;

            setUser(currentUser);
            if (currentUser?.email) {
                setLoading(true);
                checkAdmin(currentUser.email).finally(() => setLoading(false));
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkAdmin]);

    return { user, isAdmin, loading };
}
