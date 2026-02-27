"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createClient } from "@/lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminUserManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const supabase = createClient();

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to fetch admin users');
      }
      
      setAdminUsers(result.data || []);
    } catch (err) {
      setError("Failed to fetch admin users.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!newUsername.trim() || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername.trim())) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    setLoading(true);

    try {
      const internalEmail = `${newUsername.trim().toLowerCase()}@admin.local`;

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
        }),
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        setError(result.error || "Failed to create admin user.");
        return;
      }

      setSuccess(result.data.message);
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Refresh the admin users list
      await fetchAdminUsers();
      
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete admin "${adminEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Get current user to prevent self-deletion
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email === adminEmail) {
        setError("You cannot delete your own admin account.");
        return;
      }

      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId,
          adminEmail,
        }),
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        setError(result.error || "Failed to delete admin user.");
        return;
      }

      setSuccess(result.data.message);
      await fetchAdminUsers();
      
    } catch (err) {
      setError("Failed to delete admin user. Please try again.");
    }
  };

  if (fetching) {
    return (
      <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-secondary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add New Admin */}
      <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
        <h2 className="text-lg font-heading font-bold text-secondary mb-4">
          Create New Admin User
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-secondary/10 border border-secondary/20 px-4 py-3 text-sm text-secondary">
            {success}
          </div>
        )}

        <form onSubmit={handleAddAdmin} className="space-y-4">
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
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              pattern="[a-zA-Z0-9_]+"
              className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              placeholder="e.g. john_doe (letters, numbers, underscores only)"
            />
            <p className="text-xs text-foreground-muted mt-1">
              This will be used as: username@admin.local
            </p>
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="admin-confirm-password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="admin-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating Admin..." : "Create Admin User"}
          </button>
        </form>
      </div>

      {/* Existing Admin Users */}
      <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
        <h2 className="text-lg font-heading font-bold text-secondary mb-4">
          Admin Users ({adminUsers.length})
        </h2>
        
        {adminUsers.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            No admin users found.
          </p>
        ) : (
          <div className="space-y-3">
            {adminUsers.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-background-off transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {admin.email}
                  </div>
                  <div className="text-sm text-foreground-muted">
                    Created: {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                  className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
