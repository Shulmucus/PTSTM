"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase";

export default function AdminPasswordReset() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setError("User session not found. Please log in again.");
        return;
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        setError("Current password is incorrect.");
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError("Failed to update password. Please try again.");
        return;
      }

      setSuccess("Password updated successfully!");
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-primary border border-border p-6 shadow-card">
      <h2 className="text-lg font-heading font-bold text-secondary mb-4">
        Change Password
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
            placeholder="Enter your current password"
          />
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
            placeholder="Enter your new password (min. 6 characters)"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-border bg-primary px-4 py-2.5 text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
            placeholder="Confirm your new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-light disabled:opacity-50 transition-colors"
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
