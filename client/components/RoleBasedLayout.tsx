import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "./AdminLayout";
import { DashboardLayout } from "./DashboardLayout";

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
