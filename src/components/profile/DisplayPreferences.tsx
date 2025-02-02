import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { Profile } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DisplayPreferencesProps {
  profile: Profile | null;
  onLumpSumToggle?: (enabled: boolean) => void;
}

export const DisplayPreferences = ({ profile, onLumpSumToggle }: DisplayPreferencesProps) => {
  const { updateProfile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleExtraPaymentsToggle = async (checked: boolean) => {
    if (!profile) return;

    console.log('Toggling extra payments:', checked);
    try {
      await updateProfile.mutateAsync({
        ...profile,
        show_extra_payments: checked,
      });
    } catch (error) {
      console.error('Error updating extra payments preference:', error);
    }
  };

  const handleLumpSumToggle = async (checked: boolean) => {
    if (!profile || !user?.id) return;

    console.log('Toggling lump sum payments:', checked);
    try {
      // First update the profile preference
      await updateProfile.mutateAsync({
        ...profile,
        show_lump_sum_payments: checked,
      });
      
      // If toggle is turned off, delete all one-time funding entries
      if (!checked) {
        console.log('Lump sum payments disabled, deleting all entries for user:', user.id);
        const { error } = await supabase
          .from('one_time_funding')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting one-time funding entries:', error);
          throw error;
        }

        console.log('Successfully deleted all one-time funding entries');
        toast({
          title: "Success",
          description: "All lump sum payments have been deleted",
        });
      }
      
      // Call the callback to handle any additional cleanup
      onLumpSumToggle?.(checked);
    } catch (error) {
      console.error('Error updating lump sum payments preference:', error);
      toast({
        title: "Error",
        description: "Failed to update lump sum payment settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Extra Payments</Label>
            <p className="text-sm text-muted-foreground">
              Display extra payment options in debt management
            </p>
          </div>
          <Switch
            checked={profile?.show_extra_payments}
            onCheckedChange={handleExtraPaymentsToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Add Lump Sum Payments</Label>
            <p className="text-sm text-muted-foreground">
              Enable one-time funding options for faster debt payoff
            </p>
          </div>
          <Switch
            checked={profile?.show_lump_sum_payments}
            onCheckedChange={handleLumpSumToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};