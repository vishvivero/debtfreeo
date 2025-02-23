
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/lib/types/debt";

interface AccountInfoCardProps {
  profile: Profile | null;
}

export function AccountInfoCard({ profile }: AccountInfoCardProps) {
  const { user, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || "");

  const handleUpdateName = async () => {
    try {
      setIsUpdating(true);
      console.log("Updating user name to:", newName);
      
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName }
      });

      if (error) throw error;

      await refreshSession();
      
      toast({
        title: "Success",
        description: "Your name has been updated successfully."
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setIsUpdating(true);
      console.log("Initiating password reset for:", user?.email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error) {
      console.error("Error initiating password reset:", error);
      toast({
        title: "Error",
        description: "Failed to initiate password reset",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Display Name</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isUpdating}
                  />
                ) : (
                  <p className="font-medium">{user?.user_metadata?.full_name || "Not set"}</p>
                )}
              </div>
              {isEditing ? (
                <div className="flex shrink-0 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleUpdateName}
                    disabled={isUpdating}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  disabled={isUpdating}
                  className="shrink-0"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Email Address</p>
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">(Cannot be changed)</span>
            </div>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Password</p>
            <div className="flex items-center justify-between">
              <p className="font-medium">••••••••</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePasswordReset}
                disabled={isUpdating}
                className="shrink-0"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
