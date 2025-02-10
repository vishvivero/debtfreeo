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

  const handleSignOut = async () => {
    console.log("Starting sign out process");
    
    queryClient.clear();
    localStorage.clear();
    
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.log("Sign out error:", error);
      }
      
      console.log("Proceeding with navigation and UI updates");
      
      toast({
        title: "Signed out",
        description: "Successfully signed out of your account.",
        duration: 5000,
      });
      
      navigate("/");
      
    } catch (error: any) {
      console.error("Critical error during sign out:", error);
      navigate("/");
    }
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <Link to="/overview">
            <Button 
              variant="ghost"
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          {user && profile?.is_admin && (
            <Link to="/admin">
              <Button 
                variant="ghost"
                className="bg-primary hover:bg-primary/90 text-white gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Sign In</Button>
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