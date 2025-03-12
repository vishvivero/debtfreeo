
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "@/components/Header";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const SidebarComponent = sidebar || <AppSidebar />;
  const hasSidebar = !!sidebar || true;
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar - Only show on desktop */}
        {hasSidebar && !isMobile && (
          <div className="relative flex w-64 flex-shrink-0 transition-transform">
            <div className="fixed inset-y-0 z-50 flex w-64 flex-col">
              {SidebarComponent}
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 pt-24"> {/* Further increased padding-top to 24 for more space */}
            <div className="pb-8 px-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
