
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { adminMenuItems, AdminMenuItem } from "./AdminMenuItems";

export function AdminSidebarMenu() {
  const location = useLocation();
  
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {adminMenuItems.map((item: AdminMenuItem) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                  className="transition-colors hover:bg-primary/10 data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                >
                  <Link to={item.url} className="flex items-center gap-3 px-4 py-2">
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
