import type { Metadata } from "next";
import AdminLogin from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="w-full bg-background-off min-h-[80vh]">
      <AdminLogin />
    </section>
  );
}
