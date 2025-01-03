import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "@/components/Header";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
  const SidebarComponent = sidebar || <AppSidebar />;
  const hasSidebar = !!sidebar || true;
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {SidebarComponent}
        <div className={`flex-1 flex flex-col relative ${!hasSidebar ? 'max-w-full' : ''}`}>
          <Header />
          <main className="flex-1 pt-16">
            <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden" />
            <div className="content-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}