
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ThemeToggle } from "./theme/ThemeToggle";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Navigation } from "./header/Navigation";
import { AuthButtons } from "./header/AuthButtons";
import { useProfile } from "@/hooks/use-profile";

const Header = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const isPlannerPage = location.pathname === '/overview';
  const isSignupPage = location.pathname === '/signup';
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [isInitialRender]);

  // Use the profile from the useProfile hook instead of re-fetching
  const { profile, isLoading: profileLoading } = useProfile();

  const handleAuthSuccess = async () => {
    console.log("Auth success handler triggered");
    
    // Use setTimeout to avoid immediate state updates
    setTimeout(async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast({
        title: "Welcome! 👋",
        description: "Successfully signed in. Let's start planning your debt-free journey!",
      });
      
      // Use navigate with replace option to prevent navigation history issues
      navigate("/overview", { replace: true });
    }, 150); // Slightly increased timeout
  };

  const handleSignupClick = () => {
    navigate("/signup");
    setTimeout(() => {
      const docElement = document.documentElement;
      const bodyElement = document.body;
      docElement.scrollTop = 0;
      bodyElement.scrollTop = 0;
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }, 150);
  };

  return (
    <header className="fixed top-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {user && isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarNavigation />
                </SheetContent>
              </Sheet>
            )}
            <Link to="/" className="font-bold text-xl text-primary">
              Debtfreeo
            </Link>
            {!user && (
              <div className="hidden lg:block">
                <Navigation />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isSignupPage && !user && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-sm"
                onClick={handleSignupClick}
              >
                Sign Up
              </Button>
            )}
            {user && profileLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <AuthButtons 
                user={user} 
                profile={profile} 
                onAuthSuccess={handleAuthSuccess} 
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
