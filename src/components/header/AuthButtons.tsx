
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

interface Profile {
  created_at: string;
  email: string;
  id: string;
  is_admin: boolean;
  monthly_payment: number;
  preferred_currency: string;
  updated_at: string;
}

interface AuthButtonsProps {
  user: User | null;
  profile: Profile | null;
  onAuthSuccess: () => void;
}

export const AuthButtons = ({ user, profile, onAuthSuccess }: AuthButtonsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut: authSignOut } = useAuth();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      console.log("Starting sign out process");
      
      // Clear React Query cache
      queryClient.clear();
      
      // Use the auth context's signOut method
      await authSignOut();
      
      console.log("Proceeding with navigation and UI updates");
      
      toast({
        title: "Signed out",
        description: "Successfully signed out of your account.",
        duration: 5000,
      });
      
      // Force navigation with replace to avoid history issues
      navigate("/", { replace: true });
      
    } catch (error: any) {
      console.error("Critical error during sign out:", error);
      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <Link to="/overview">
            <Button 
              variant="ghost"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white gap-2 hidden sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          {user && profile?.is_admin && (
            <Link to="/admin">
              <Button 
                variant="ghost"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white gap-2 hidden sm:flex"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="text-sm">Sign In</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-8">
            <DialogHeader>
              <DialogTitle>Welcome Back</DialogTitle>
            </DialogHeader>
            <div className="mt-8">
              <AuthForm onSuccess={onAuthSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
