
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";
import { SidebarRail } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const isMobile = useIsMobile();

  return (
    <Sidebar 
      className="border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      collapsible={isMobile ? false : "icon"}
      defaultCollapsed={isMobile}
    >
      {!isMobile && (
        <SidebarRail>
          <ArrowLeft className="h-4 w-4" />
        </SidebarRail>
      )}
      <SidebarHeader />
      <SidebarNavigation />
      <SidebarFooter />
    </Sidebar>
  );
}
