
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "./header/Navigation";
import { AuthButtons } from "./header/AuthButtons";
import { Loader2, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ThemeToggle } from "./theme/ThemeToggle";

const Header = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPlannerPage = location.pathname === '/overview';
  const isSignupPage = location.pathname === '/signup';

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for profile fetch");
        return null;
      }
      
      console.log("Fetching profile for user:", user.id);
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }

      console.log("Profile data fetched:", existingProfile);
      return existingProfile;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  const handleAuthSuccess = async () => {
    console.log("Auth success handler triggered");
    
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["debts"] });
    
    toast({
      title: "Welcome! 👋",
      description: "Successfully signed in. Let's start planning your debt-free journey!",
    });
    
    navigate("/overview");
  };

  return (
    <header className="fixed top-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b w-full">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Navigation />
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-bold text-xl text-primary">
              Debtfreeo
            </Link>
            <div className="hidden lg:block">
              <Navigation />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {!isSignupPage && !user && (
              <Link to="/signup">
                <Button variant="default" className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
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
