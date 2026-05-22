import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin — Autoblack",
  description: "Panel de administración de compras del sorteo.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
