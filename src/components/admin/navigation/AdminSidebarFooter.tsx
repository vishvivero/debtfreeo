
import React, { useState } from "react";
import { Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { 
  SidebarFooter, 
  SidebarSeparator, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";

export function AdminSidebarFooter() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SidebarFooter>
      <SidebarSeparator className="opacity-50" />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton 
            tooltip="Toggle theme"
            className="px-4 py-2 hover:bg-primary/10"
          >
            <Moon className="h-4 w-4" />
            <span>Dark Mode</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={handleSignOut} 
            tooltip="Sign out"
            className="px-4 py-2 hover:bg-destructive/10 text-destructive"
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            <span>{isSigningOut ? "Signing out..." : "Logout"}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
