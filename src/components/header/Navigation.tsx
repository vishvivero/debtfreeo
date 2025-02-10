
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { useState } from "react";

export const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile navigation when route changes
  if (isMobileNavOpen && location.pathname !== "/") {
    setIsMobileNavOpen(false);
  }

  return (
    <div className="w-full">
      <nav className="hidden lg:flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 md:p-0">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
        >
          <Link to="/about">About</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
        >
          <Link to="/pricing">Pricing</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
        >
          <Link to="/blog">Blog</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
        >
          <Link to="/tools">Free Tools</Link>
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden w-full">
        {user ? (
          <SidebarNavigation />
        ) : (
          <nav className="flex flex-col space-y-2 p-4">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="w-full justify-start"
            >
              <Link to="/about">About</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="w-full justify-start"
            >
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="w-full justify-start"
            >
              <Link to="/blog">Blog</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="w-full justify-start"
            >
              <Link to="/tools">Free Tools</Link>
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
};
