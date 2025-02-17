
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
        <div className={`fixed inset-y-0 left-0 z-50 hidden lg:block lg:w-64`}>
          {SidebarComponent}
        </div>
        
        {/* Main content area */}
        <div className={`flex-1 flex flex-col ${hasSidebar ? 'lg:pl-64' : ''}`}>
          <Header />
          <main className="flex-1 pt-16">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
