
import React from "react";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { AdminSidebarHeader } from "@/components/admin/navigation/AdminSidebarHeader";
import { AdminSidebarMenu } from "@/components/admin/navigation/AdminSidebarMenu";
import { AdminSidebarFooter } from "@/components/admin/navigation/AdminSidebarFooter";

export function AdminSidebar() {
  const { user } = useAuth();

  return (
    <Sidebar className="border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <AdminSidebarHeader user={user} />
      <AdminSidebarMenu />
      <AdminSidebarFooter />
    </Sidebar>
  );
}
