
import { MainLayout } from "@/components/layout/MainLayout";
import { useProfile } from "@/hooks/use-profile";
import { AccountInfoCard } from "@/components/profile/AccountInfoCard";
import { DisplayPreferences } from "@/components/profile/DisplayPreferences";
import { DangerZoneCard } from "@/components/profile/DangerZoneCard";
import { ReminderSettings } from "@/components/profile/ReminderSettings";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleLumpSumToggle = async (enabled: boolean) => {
    if (!enabled && user?.id) {
      try {
        console.log('Attempting to delete one-time funding entries for user:', user.id);
        const { error, count } = await supabase
          .from('one_time_funding')
          .delete()
          .eq('user_id', user.id)
          .eq('is_applied', false)
          .select('count');

        if (error) {
          console.error('Error deleting one-time funding entries:', error);
          throw error;
        }

        console.log('Successfully deleted one-time funding entries, count:', count);
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
          <ReminderSettings profile={profile} />
          <DangerZoneCard showNotifications={true} />
        </div>
      </div>
    </MainLayout>
  );
}
