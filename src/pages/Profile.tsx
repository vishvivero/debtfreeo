import { MainLayout } from "@/components/layout/MainLayout";
import { useProfile } from "@/hooks/use-profile";
import { AccountInfoCard } from "@/components/profile/AccountInfoCard";
import { DisplayPreferences } from "@/components/profile/DisplayPreferences";
import { DangerZoneCard } from "@/components/profile/DangerZoneCard";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { toast } = useToast();

  const handleLumpSumToggle = async (enabled: boolean) => {
    if (!enabled) {
      try {
        console.log('Deleting all one-time funding entries');
        const { error } = await supabase
          .from('one_time_funding')
          .delete()
          .eq('user_id', profile?.id)
          .eq('is_applied', false);

        if (error) {
          console.error('Error deleting one-time funding entries:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "All lump sum payments have been deleted",
        });
      } catch (error) {
        console.error('Failed to delete one-time funding entries:', error);
        toast({
          title: "Error",
          description: "Failed to delete lump sum payments",
          variant: "destructive",
        });
      }
    }
  };

  if (isProfileLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <div className="space-y-6">
          <AccountInfoCard profile={profile} />
          <DisplayPreferences 
            profile={profile} 
            onLumpSumToggle={handleLumpSumToggle}
          />
          <DangerZoneCard showNotifications={true} />
        </div>
      </div>
    </MainLayout>
  );
}