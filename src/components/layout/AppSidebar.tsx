
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";
import { SidebarRail } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar 
      className="h-screen flex flex-col border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      collapsible="none"
    >
      <SidebarRail className="lg:flex hidden">
        <ArrowLeft className="h-4 w-4" />
      </SidebarRail>
      <div className="flex flex-col h-full">
        <SidebarHeader />
        <div className="flex-1 overflow-y-auto">
          <SidebarNavigation />
        </div>
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
