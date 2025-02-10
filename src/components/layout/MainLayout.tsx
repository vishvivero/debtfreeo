import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "@/components/Header";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const SidebarComponent = sidebar || <AppSidebar />;
  const hasSidebar = !!sidebar || true;
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {SidebarComponent}
        <div className={`flex-1 flex flex-col relative ${!hasSidebar ? 'max-w-full' : ''}`}>
          <Header />
          <main className="flex-1 pt-16">
            <div className="content-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}