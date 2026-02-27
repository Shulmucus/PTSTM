import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

// Note: Authentication is handled by middleware (proxy.ts)
// This page will only be accessible to authenticated admin users
export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
