
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";
import { SidebarRail } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar 
      className="h-full border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      collapsible="icon"
    >
      <SidebarRail>
        <ArrowLeft className="h-4 w-4" />
      </SidebarRail>
      <SidebarHeader />
      <SidebarNavigation />
      <SidebarFooter />
    </Sidebar>
  );
}
