import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import SecretaryDashboard from "@/pages/SecretaryDashboard";
import { AdminLayout } from "./AdminLayout";
import { DashboardLayout } from "./DashboardLayout";

export function RoleBasedDashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  }

  return (
    <DashboardLayout>
      <SecretaryDashboard />
    </DashboardLayout>
  );
}
